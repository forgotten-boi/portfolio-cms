import { MessagingPair } from './interfaces';
import { KafkaEventProducer, KafkaEventConsumer } from './kafka.adapter';
import { EventHubEventProducer, EventHubEventConsumer } from './eventhub.adapter';
import { config } from '../config';

/**
 * Factory that returns the correct messaging adapter pair based on
 * the MESSAGING_PROVIDER environment variable.
 *
 * To swap providers in the future (e.g., AWS Kinesis, Pulsar),
 * add a new adapter implementing IEventProducer / IEventConsumer
 * and register it here. No other code needs to change.
 */
export function createMessagingPair(): MessagingPair {
  const provider = config.messaging.provider;

  switch (provider) {
    case 'kafka':
      console.log('[Messaging] Using Kafka adapter (local development)');
      return {
        producer: new KafkaEventProducer(),
        consumer: new KafkaEventConsumer(),
      };

    case 'eventhub':
      console.log('[Messaging] Using Azure Event Hub adapter (production)');
      return {
        producer: new EventHubEventProducer(),
        consumer: new EventHubEventConsumer(),
      };

    default:
      throw new Error(
        `Unknown MESSAGING_PROVIDER "${provider}". Supported: kafka, eventhub`,
      );
  }
}
