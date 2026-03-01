# Event-Driven Payment Architecture

## Overview

This document describes the event-driven architecture integrating the [distributed-payment-system](https://github.com/forgotten-boi/distributed-payment-system) into the Portfolio CMS platform. The architecture uses a **Backend-for-Frontend (BFF)** pattern with a **swappable messaging layer** supporting both Apache Kafka (local development) and Azure Event Hubs (production).

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular 19 SPA                           │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐    │
│  │ Payment  │  │  Event     │  │ Event Analytics      │    │
│  │ Dashboard│  │  Analytics │  │ Service (SSE client)  │    │
│  └────┬─────┘  └─────┬──────┘  └──────────┬───────────┘    │
│       │               │                    │                │
│       └───────────────┼────────────────────┘                │
│                       │  HTTP + SSE                         │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│               Node.js BFF Server (:3100)                  │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ Payment      │  │ Event      │  │ Analytics        │  │
│  │ Proxy Routes │  │ SSE Routes │  │ Aggregator       │  │
│  └──────┬───────┘  └─────┬──────┘  └────────┬─────────┘  │
│         │                │                   │            │
│  ┌──────┴────────────────┴───────────────────┴──────────┐ │
│  │           Messaging Abstraction Layer                 │ │
│  │  ┌──────────────┐        ┌─────────────────────┐     │ │
│  │  │ Kafka Adapter│   OR   │ EventHub Adapter     │     │ │
│  │  │  (KafkaJS)   │        │ (@azure/event-hubs)  │     │ │
│  │  └──────────────┘        └─────────────────────┘     │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────┬──────────────────────────────────────────────┘
            │
            ▼  HTTP Proxy
┌─────────────────────────────────────────────────────┐
│          .NET 9 Microservices (Aspire)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Orders   │  │ Payments │  │ Accounting       │  │
│  │ API:5001 │  │ API:5002 │  │ API:5003         │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────────────┘  │
│       │              │              │               │
│       └──────────────┼──────────────┘               │
│                      │                              │
│           RabbitMQ / MassTransit                    │
└─────────────────────────────────────────────────────┘
```

---

## Messaging Abstraction

### Factory Pattern

The messaging layer uses a factory pattern (`MESSAGING_PROVIDER` env var) to instantiate the appropriate adapter:

| Provider   | Config Key   | Adapter Class           | Use Case        |
|------------|-------------|-------------------------|-----------------|
| `kafka`    | Default      | `KafkaEventProducer/Consumer` | Local dev       |
| `eventhub` | Requires connection string | `EventHubEventProducer/Consumer` | Azure production |

### Interfaces

```typescript
interface IEventProducer {
  connect(): Promise<void>;
  publish(topic: string, event: IntegrationEvent): Promise<void>;
  disconnect(): Promise<void>;
}

interface IEventConsumer {
  connect(): Promise<void>;
  subscribe(topic: string, handler: EventHandler): Promise<void>;
  disconnect(): Promise<void>;
}
```

### Topics

| Topic | Purpose |
|-------|---------|
| `payment.order.events` | Order created, confirmed, cancelled |
| `payment.transaction.events` | Payment authorized, captured, failed |
| `payment.ledger.events` | Ledger entries posted |
| `portfolio.blog.events` | Blog CRUD events |
| `portfolio.cv.events` | CV generation events |
| `portfolio.resume.events` | Resume generation events |
| `analytics.aggregated` | Pre-aggregated analytics |
| `events.deadletter` | Failed event processing |

---

## BFF Server

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/payments/orders` | POST | Create a new order |
| `GET /api/payments/orders/:id` | GET | Get order details |
| `POST /api/payments/orders/:id/confirm` | POST | Confirm an order |
| `POST /api/payments/orders/:id/cancel` | POST | Cancel an order |
| `GET /api/payments/orders/:id/payment` | GET | Get payment detail |
| `GET /api/payments/ledger/:orderId` | GET | Get ledger entries |
| `GET /api/payments/balance/:account` | GET | Get account balance |
| `POST /api/payments/reconciliation` | POST | Run reconciliation |
| `GET /api/events/stream` | SSE | Real-time event stream |
| `POST /api/events/publish` | POST | Publish an event |
| `GET /api/events/recent` | GET | Recent events |
| `GET /api/analytics/summary` | GET | Aggregated analytics |
| `GET /api/analytics/payments` | GET | Payment metrics |
| `GET /api/analytics/portfolio` | GET | Portfolio metrics |
| `GET /api/analytics/feed` | GET | Analytics feed |
| `POST /api/analytics/reset` | POST | Reset counters |
| `GET /api/health` | GET | Health check |
| `GET /api/health/ready` | GET | Readiness probe |

---

## Angular Components

| Component | Route | Description |
|-----------|-------|-------------|
| `PaymentDashboardComponent` | `/dashboard/payments` | Stats overview, quick links, live event feed |
| `PaymentOrdersComponent` | `/dashboard/payments/orders` | Orders table, confirm/cancel actions |
| `CreatePaymentOrderComponent` | `/dashboard/payments/orders/new` | Create order form |
| `PaymentOrderDetailComponent` | `/dashboard/payments/orders/:id` | Order detail with payment & ledger |
| `PaymentAccountingComponent` | `/dashboard/payments/accounting` | Double-entry ledger, reconciliation |
| `PaymentLifecycleComponent` | `/dashboard/payments/lifecycle` | Automated end-to-end lifecycle demo |
| `EventAnalyticsDashboardComponent` | `/dashboard/event-analytics` | Unified analytics with live feed |

---

## Angular Services

| Service | Purpose |
|---------|---------|
| `PaymentService` | HTTP client proxying to BFF payment routes |
| `EventService` | SSE client with auto-reconnect, exposes typed observables |
| `EventAnalyticsService` | HTTP client for analytics endpoints |

---

## Event Flow

```
1. User creates order (Angular form)
2. → HTTP POST to BFF /api/payments/orders
3. → BFF proxies to .NET Orders API (:5001)
4. → Orders API creates order, publishes OrderCreated (MassTransit/RabbitMQ)
5. → Payments API consumes OrderCreated, authorizes, publishes PaymentAuthorized
6. → BFF event-processor enriches and republishes to Kafka/EventHub
7. → SSE broadcasts to Angular
8. → User confirms order
9. → Orders API publishes OrderConfirmed
10. → Payments API captures, publishes PaymentCaptured
11. → Accounting API posts double-entry ledger
12. → Full cycle visible in real-time on Angular dashboard
```

---

## Swapping Messaging Provider

### Switch to Azure Event Hubs

```env
# server/.env
MESSAGING_PROVIDER=eventhub
EVENTHUB_CONNECTION_STRING=Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=...
EVENTHUB_NAME=portfolio-events
EVENTHUB_CONSUMER_GROUP=$Default
```

### Switch back to Kafka

```env
# server/.env
MESSAGING_PROVIDER=kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=portfolio-bff
KAFKA_GROUP_ID=portfolio-bff-group
```

No code changes required — the factory pattern handles adapter instantiation automatically.

---

## Docker Compose (Local Kafka)

The `server/docker-compose.yml` provides:

- **Zookeeper** — Kafka coordination
- **Kafka** — Event streaming (port 9092)
- **Kafka UI** — Web UI at http://localhost:8085
- **kafka-init** — Auto-creates all 8 topics

---

## Security

- Correlation ID tracking across all requests (`X-Correlation-Id` header)
- ProblemDetails-style error responses
- CORS restricted to configured origin
- Auth interceptor forwards JWT tokens to BFF
