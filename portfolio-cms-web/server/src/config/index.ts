import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3100', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',

  messaging: {
    provider: (process.env.MESSAGING_PROVIDER || 'kafka') as 'kafka' | 'eventhub',

    kafka: {
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      clientId: process.env.KAFKA_CLIENT_ID || 'portfolio-bff',
      groupId: process.env.KAFKA_GROUP_ID || 'portfolio-bff-group',
    },

    eventhub: {
      connectionString: process.env.EVENTHUB_CONNECTION_STRING || '',
      eventHubName: process.env.EVENTHUB_NAME || 'portfolio-events',
      consumerGroup: process.env.EVENTHUB_CONSUMER_GROUP || '$Default',
    },
  },

  services: {
    ordersApi: process.env.ORDERS_API_URL || 'http://localhost:5001',
    paymentsApi: process.env.PAYMENTS_API_URL || 'http://localhost:5002',
    accountingApi: process.env.ACCOUNTING_API_URL || 'http://localhost:5003',
    portfolioApi: process.env.PORTFOLIO_API_URL || 'http://localhost:8085/api',
  },
};
