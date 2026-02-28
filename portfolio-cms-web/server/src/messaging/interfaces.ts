/**
 * Messaging abstraction layer — all event contracts shared between
 * portfolio (Angular/Node) and payment (.NET) systems.
 *
 * These interfaces decouple the application from any specific messaging
 * infrastructure. The factory pattern selects Kafka or Azure Event Hub
 * at runtime based on a single environment variable.
 */

// ─── Core Interfaces ─────────────────────────────────────────────

export interface IntegrationEvent {
  eventId: string;
  eventType: string;
  source: 'portfolio' | 'payment';
  timestamp: string;        // ISO-8601
  correlationId: string;
  causationId?: string;
  payload: Record<string, unknown>;
}

export type EventHandler = (event: IntegrationEvent) => Promise<void>;

export interface IEventProducer {
  /** Establish connection to the messaging infrastructure */
  connect(): Promise<void>;

  /** Publish a single event to a topic/partition */
  publish(topic: string, event: IntegrationEvent): Promise<void>;

  /** Publish a batch of events to a topic */
  publishBatch(topic: string, events: IntegrationEvent[]): Promise<void>;

  /** Gracefully disconnect */
  disconnect(): Promise<void>;
}

export interface IEventConsumer {
  /** Establish connection and prepare for subscriptions */
  connect(): Promise<void>;

  /** Subscribe to a topic and process events through the handler */
  subscribe(topic: string, handler: EventHandler): Promise<void>;

  /** Unsubscribe from all topics and disconnect */
  disconnect(): Promise<void>;
}

// ─── Factory Return Type ─────────────────────────────────────────

export interface MessagingPair {
  producer: IEventProducer;
  consumer: IEventConsumer;
}
