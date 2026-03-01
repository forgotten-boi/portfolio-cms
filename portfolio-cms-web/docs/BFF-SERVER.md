# BFF Server — Setup & Configuration

## Overview

The BFF (Backend-for-Frontend) server is a Node.js/Express/TypeScript application that bridges the Angular frontend with the .NET payment microservices. It provides:

- **REST proxy** to Orders, Payments, and Accounting APIs
- **SSE (Server-Sent Events)** for real-time event streaming
- **Messaging abstraction** supporting Kafka and Azure Event Hubs
- **Analytics aggregation** with in-memory metrics

## Prerequisites

- Node.js 18+ (LTS recommended)
- Docker & Docker Compose (for local Kafka)
- .NET 9 SDK (for the payment microservices)

## Quick Start

### 1. Start Kafka (local development)

```bash
cd server
docker-compose up -d
```

This starts:
- Zookeeper (port 2181)
- Kafka (port 9092)
- Kafka UI (http://localhost:8085)
- Auto-creates all required topics

### 2. Install dependencies

```bash
cd server
npm install
```

### 3. Configure environment

Copy and edit the `.env` file:

```bash
# server/.env is already provided with defaults
# Edit only if needed:
MESSAGING_PROVIDER=kafka          # or 'eventhub'
KAFKA_BROKERS=localhost:9092
BFF_PORT=3100
CORS_ORIGIN=http://localhost:4200
```

### 4. Start the BFF server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm run build && npm start
```

### 5. Start the .NET microservices

```bash
# From the distributed-payment-system repo
cd src/PaymentSystem.AppHost
dotnet run
```

This starts:
- Orders API on port 5001
- Payments API on port 5002
- Accounting API on port 5003

### 6. Verify

```bash
# Health check
curl http://localhost:3100/api/health

# Readiness (checks Kafka connection)
curl http://localhost:3100/api/health/ready
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BFF_PORT` | `3100` | BFF server port |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed CORS origin |
| `MESSAGING_PROVIDER` | `kafka` | `kafka` or `eventhub` |
| `KAFKA_BROKERS` | `localhost:9092` | Kafka broker addresses |
| `KAFKA_CLIENT_ID` | `portfolio-bff` | Kafka client identifier |
| `KAFKA_GROUP_ID` | `portfolio-bff-group` | Kafka consumer group |
| `EVENTHUB_CONNECTION_STRING` | — | Azure Event Hubs connection string |
| `EVENTHUB_NAME` | `portfolio-events` | Event Hub name |
| `EVENTHUB_CONSUMER_GROUP` | `$Default` | Event Hub consumer group |
| `ORDERS_API_URL` | `http://localhost:5001` | .NET Orders API URL |
| `PAYMENTS_API_URL` | `http://localhost:5002` | .NET Payments API URL |
| `ACCOUNTING_API_URL` | `http://localhost:5003` | .NET Accounting API URL |

## Project Structure

```
server/
├── .env                          # Environment configuration
├── docker-compose.yml            # Local Kafka setup
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                  # Express entry point
    ├── config/
    │   └── index.ts              # Centralized config
    ├── messaging/
    │   ├── interfaces.ts         # IEventProducer, IEventConsumer
    │   ├── event-types.ts        # Event type constants & topics
    │   ├── kafka.adapter.ts      # KafkaJS implementation
    │   ├── eventhub.adapter.ts   # Azure Event Hubs implementation
    │   ├── factory.ts            # createMessagingPair() factory
    │   └── index.ts              # Barrel export
    ├── middleware/
    │   ├── correlation-id.ts     # X-Correlation-Id injection
    │   └── error-handler.ts      # ProblemDetails error handler
    ├── routes/
    │   ├── payments.routes.ts    # Payment proxy routes
    │   ├── events.routes.ts      # SSE + event publishing
    │   ├── analytics.routes.ts   # Analytics endpoints
    │   └── health.routes.ts      # Health & readiness
    └── services/
        ├── payment-proxy.ts      # Axios-based .NET API proxy
        ├── event-processor.ts    # Event enrichment & normalization
        └── analytics-aggregator.ts # In-memory metrics
```

## Troubleshooting

### Kafka not connecting
- Ensure Docker is running: `docker ps`
- Check Kafka logs: `docker-compose logs kafka`
- Verify topics: Open http://localhost:8085 (Kafka UI)

### .NET services not responding
- Ensure Aspire is running: `dotnet run` in AppHost
- Check ports: `curl http://localhost:5001/health`

### CORS errors
- Verify `CORS_ORIGIN` in `.env` matches your Angular dev server URL
