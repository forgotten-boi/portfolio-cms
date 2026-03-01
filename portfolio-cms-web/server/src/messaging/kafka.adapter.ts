import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import {
  IEventProducer,
  IEventConsumer,
  IntegrationEvent,
  EventHandler,
} from './interfaces';
import { config } from '../config';

// ─── Kafka Producer ──────────────────────────────────────────────

export class KafkaEventProducer implements IEventProducer {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.messaging.kafka.clientId,
      brokers: config.messaging.kafka.brokers,
      retry: { retries: 5 },
    });
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    console.log('[KafkaProducer] Connected');
  }

  async publish(topic: string, event: IntegrationEvent): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: event.correlationId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            source: event.source,
            correlationId: event.correlationId,
          },
        },
      ],
    });
  }

  async publishBatch(topic: string, events: IntegrationEvent[]): Promise<void> {
    await this.producer.send({
      topic,
      messages: events.map((event) => ({
        key: event.correlationId,
        value: JSON.stringify(event),
        headers: {
          eventType: event.eventType,
          source: event.source,
          correlationId: event.correlationId,
        },
      })),
    });
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    console.log('[KafkaProducer] Disconnected');
  }
}

// ─── Kafka Consumer ──────────────────────────────────────────────

export class KafkaEventConsumer implements IEventConsumer {
  private kafka: Kafka;
  private consumer: Consumer;
  private handlers = new Map<string, EventHandler>();

  constructor() {
    this.kafka = new Kafka({
      clientId: config.messaging.kafka.clientId,
      brokers: config.messaging.kafka.brokers,
      retry: { retries: 5 },
    });
    this.consumer = this.kafka.consumer({
      groupId: config.messaging.kafka.groupId,
    });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
    console.log('[KafkaConsumer] Connected');
  }

  async subscribe(topic: string, handler: EventHandler): Promise<void> {
    this.handlers.set(topic, handler);
    await this.consumer.subscribe({ topic, fromBeginning: false });

    // Run consumer only once (idempotent)
    await this.consumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic: msgTopic, message } = messagePayload;
        const topicHandler = this.handlers.get(msgTopic);
        if (!topicHandler || !message.value) return;

        try {
          const event: IntegrationEvent = JSON.parse(message.value.toString());
          await topicHandler(event);
        } catch (err) {
          console.error(`[KafkaConsumer] Error processing message on ${msgTopic}:`, err);
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    console.log('[KafkaConsumer] Disconnected');
  }
}
