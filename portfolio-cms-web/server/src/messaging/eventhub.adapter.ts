import {
  EventHubProducerClient,
  EventHubConsumerClient,
  earliestEventPosition,
  ReceivedEventData,
} from '@azure/event-hubs';
import {
  IEventProducer,
  IEventConsumer,
  IntegrationEvent,
  EventHandler,
} from './interfaces';
import { config } from '../config';

/**
 * Azure Event Hub adapter.
 *
 * Event Hub uses a flat namespace — we encode the "topic" as a
 * property on each event so consumers can filter by eventType.
 * Partitioning uses the correlationId for ordering guarantees
 * within a session/transaction.
 */

// ─── Event Hub Producer ──────────────────────────────────────────

export class EventHubEventProducer implements IEventProducer {
  private client!: EventHubProducerClient;

  async connect(): Promise<void> {
    this.client = new EventHubProducerClient(
      config.messaging.eventhub.connectionString,
      config.messaging.eventhub.eventHubName,
    );
    console.log('[EventHubProducer] Connected');
  }

  async publish(topic: string, event: IntegrationEvent): Promise<void> {
    const batch = await this.client.createBatch({ partitionKey: event.correlationId });
    const added = batch.tryAdd({
      body: event,
      properties: {
        eventType: event.eventType,
        source: event.source,
        topic,
      },
    });
    if (!added) {
      throw new Error('Event too large for a single batch');
    }
    await this.client.sendBatch(batch);
  }

  async publishBatch(topic: string, events: IntegrationEvent[]): Promise<void> {
    const batch = await this.client.createBatch();
    for (const event of events) {
      const added = batch.tryAdd({
        body: event,
        properties: {
          eventType: event.eventType,
          source: event.source,
          topic,
        },
      });
      if (!added) {
        // Current batch is full — send it and start a new one
        await this.client.sendBatch(batch);
        const newBatch = await this.client.createBatch();
        newBatch.tryAdd({
          body: event,
          properties: {
            eventType: event.eventType,
            source: event.source,
            topic,
          },
        });
      }
    }
    await this.client.sendBatch(batch);
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log('[EventHubProducer] Disconnected');
  }
}

// ─── Event Hub Consumer ──────────────────────────────────────────

export class EventHubEventConsumer implements IEventConsumer {
  private client!: EventHubConsumerClient;
  private subscription: any;
  private handlers = new Map<string, EventHandler>();

  async connect(): Promise<void> {
    this.client = new EventHubConsumerClient(
      config.messaging.eventhub.consumerGroup,
      config.messaging.eventhub.connectionString,
      config.messaging.eventhub.eventHubName,
    );
    console.log('[EventHubConsumer] Connected');
  }

  async subscribe(topic: string, handler: EventHandler): Promise<void> {
    this.handlers.set(topic, handler);

    this.subscription = this.client.subscribe(
      {
        processEvents: async (events: ReceivedEventData[]) => {
          for (const eventData of events) {
            const eventTopic = eventData.properties?.topic as string;
            const topicHandler = this.handlers.get(eventTopic);
            if (!topicHandler) continue;

            try {
              const integrationEvent = eventData.body as IntegrationEvent;
              await topicHandler(integrationEvent);
            } catch (err) {
              console.error(`[EventHubConsumer] Error processing event from ${eventTopic}:`, err);
            }
          }
        },
        processError: async (err: Error) => {
          console.error('[EventHubConsumer] Error:', err);
        },
      },
      { startPosition: earliestEventPosition },
    );
  }

  async disconnect(): Promise<void> {
    if (this.subscription) {
      await this.subscription.close();
    }
    await this.client.close();
    console.log('[EventHubConsumer] Disconnected');
  }
}
