# Portfolio CMS Web

A full-featured **Angular 19** content management system with integrated **event-driven payment processing** powered by .NET microservices, Apache Kafka (local) / Azure Event Hubs (production), and real-time Server-Sent Events.

## Features

- **Portfolio & Blog Management** — Create, edit, and publish portfolios and blog posts
- **CV Manager & Resume Generator** — Build and export professional CVs and resumes
- **Job Matcher** — AI-powered job matching engine
- **Payment Processing** — Full payment lifecycle with double-entry accounting
- **Event-Driven Architecture** — Swappable Kafka / Azure Event Hub messaging
- **Real-time Dashboard** — Live event streaming via SSE
- **Analytics** — Unified payment + portfolio analytics
- **Multi-language** — English, Spanish, German, Hindi
- **Dark Mode** — Theme-aware UI

---

## Quick Start

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Angular + BFF server |
| Angular CLI | 19.x | `npm i -g @angular/cli` |
| Docker | Latest | Local Kafka |
| .NET SDK | 9.0 | Payment microservices |

### 1. Clone and install

```bash
git clone https://github.com/forgotten-boi/portfolio-cms.git
cd portfolio-cms/portfolio-cms-web

# Install Angular dependencies
npm install

# Install BFF server dependencies
cd server && npm install && cd ..
```

### 2. Start infrastructure (Kafka)

```bash
cd server
docker-compose up -d
```

Starts Kafka + Zookeeper + Kafka UI (http://localhost:8085) and auto-creates topics.

### 3. Start the BFF server

```bash
cd server
npm run dev
# Runs on http://localhost:3100
```

### 4. Start the .NET payment microservices

```bash
# In the distributed-payment-system repo
cd src/PaymentSystem.AppHost
dotnet run
# Orders API :5001 | Payments API :5002 | Accounting API :5003
```

### 5. Start the Angular app

```bash
# In portfolio-cms-web root
ng serve
# Open http://localhost:4200
```

### 6. Verify

- **Angular App**: http://localhost:4200
- **BFF Health**: http://localhost:3100/api/health
- **Kafka UI**: http://localhost:8085

### 7. Run E2E tests

```bash
# Install Playwright browser (first time only)
npx playwright install --with-deps chromium

# Run all tests (Angular dev server must be running)
npx playwright test

# Run with full backend stack (includes .NET service tests)
PAYMENT_SERVICES_RUNNING=1 BFF_RUNNING=1 npx playwright test
```

Expected: **26 passed, 6 skipped** (skipped tests require `.NET` services).

---

## Project Structure

```
portfolio-cms-web/
├── src/                          # Angular 19 application
│   ├── app/
│   │   ├── components/
│   │   │   ├── payment-dashboard/        # Payment stats & overview
│   │   │   ├── payment-orders/           # Orders list
│   │   │   ├── create-payment-order/     # Create order form
│   │   │   ├── payment-order-detail/     # Order detail view
│   │   │   ├── payment-accounting/       # Double-entry ledger
│   │   │   ├── payment-lifecycle/        # Automated E2E demo
│   │   │   ├── event-analytics-dashboard/# Unified analytics
│   │   │   ├── dashboard/               # Main dashboard
│   │   │   ├── blogs/                   # Blog management
│   │   │   ├── cv-manager/              # CV builder
│   │   │   └── ...                      # Other components
│   │   ├── services/
│   │   │   ├── payment.service.ts        # Payment HTTP client
│   │   │   ├── event.service.ts          # SSE real-time client
│   │   │   ├── event-analytics.service.ts# Analytics HTTP client
│   │   │   └── ...                       # Auth, blog, tenant, etc.
│   │   ├── models/index.ts              # Shared TypeScript models
│   │   └── app.routes.ts               # Lazy-loaded routes
│   └── environments/                    # Environment configs
├── server/                       # Node.js BFF Server
│   ├── src/
│   │   ├── index.ts              # Express entry point
│   │   ├── messaging/            # Kafka + EventHub adapters
│   │   ├── routes/               # REST + SSE endpoints
│   │   ├── services/             # Proxy, processor, aggregator
│   │   └── middleware/           # Correlation ID, error handler
│   ├── docker-compose.yml        # Kafka + Zookeeper + UI
│   └── .env                      # Configuration
├── e2e/                          # Playwright E2E tests
│   ├── payment-dashboard.spec.ts
│   ├── payment-lifecycle.spec.ts
│   ├── event-analytics.spec.ts
│   └── navigation-smoke.spec.ts
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # Full architecture overview
│   ├── BFF-SERVER.md             # BFF setup & config guide
│   └── TESTING.md                # Playwright testing guide
└── playwright.config.ts          # Playwright configuration
```

---

## Payment Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/payments` | PaymentDashboard | Stats overview, quick links, live events |
| `/dashboard/payments/orders` | PaymentOrders | Orders table with actions |
| `/dashboard/payments/orders/new` | CreatePaymentOrder | Order creation form |
| `/dashboard/payments/orders/:id` | PaymentOrderDetail | Order + payment + ledger detail |
| `/dashboard/payments/accounting` | PaymentAccounting | Double-entry ledger & reconciliation |
| `/dashboard/payments/lifecycle` | PaymentLifecycle | Automated end-to-end demo |
| `/dashboard/event-analytics` | EventAnalyticsDashboard | Unified analytics + live feed |

---

## Event-Driven Architecture

### Messaging Layer

The BFF uses a **factory pattern** to swap messaging providers without code changes:

```bash
# Local development (default)
MESSAGING_PROVIDER=kafka

# Azure production
MESSAGING_PROVIDER=eventhub
EVENTHUB_CONNECTION_STRING=Endpoint=sb://...
```

### Event Flow

```
Angular → BFF → .NET Microservices → RabbitMQ/MassTransit
                                          ↓
BFF ← Kafka/EventHub ← Event Processor ← Domain Events
  ↓
Angular (SSE real-time updates)
```

### Topics

| Topic | Events |
|-------|--------|
| `payment.order.events` | OrderCreated, OrderConfirmed, OrderCancelled |
| `payment.transaction.events` | PaymentAuthorized, PaymentCaptured, PaymentFailed |
| `payment.ledger.events` | LedgerEntryPosted |
| `portfolio.blog.events` | BlogPublished, BlogUpdated |
| `analytics.aggregated` | Aggregated metrics |

---

## E2E Testing (Playwright)

```bash
# Install Playwright
npx playwright install --with-deps chromium

# Run all tests
npx playwright test

# Run with backend services
PAYMENT_SERVICES_RUNNING=1 BFF_RUNNING=1 npx playwright test

# Interactive UI mode
npx playwright test --ui

# View report
npx playwright show-report
```

Tests run against the **Angular dev server at `http://localhost:4200`**. The config is in [playwright.config.ts](playwright.config.ts) and auto-starts the dev server when using `webServer`.

### Test results

| Suite | Tests | Notes |
|-------|-------|-------|
| `payment-dashboard.spec.ts` | 13 | Payment stats, create, orders, accounting |
| `payment-lifecycle.spec.ts` | 4 / 2 skipped | Lifecycle demo; skipped tests need .NET |
| `event-analytics.spec.ts` | 4 / 4 skipped | Analytics; skipped tests need .NET + BFF |
| `navigation-smoke.spec.ts` | 5 | Sidebar navigation smoke tests |

---

## Development

### Angular app

```bash
ng serve                # Dev server at :4200
ng build                # Production build
ng test                 # Unit tests
```

### BFF server

```bash
cd server
npm run dev             # Dev server at :3100 (auto-reload)
npm run build           # TypeScript compilation
npm start               # Production start
```

### Docker services

```bash
cd server
docker-compose up -d    # Start Kafka + UI
docker-compose down     # Stop all
docker-compose logs -f  # Follow logs
```

---

## AI Agents (Claude)

This project ships a **Claude sub-agent** for automated test generation, located in [`.claude/agents/`](.claude/agents/).

| Agent | File | Purpose |
|-------|------|---------|
| `playwright-test-generator` | `.claude/agents/playwright-test-generator.md` | Generates Playwright E2E tests from natural language descriptions, validates them iteratively, and suggests additional test cases |

### Using the Playwright test generator

Open GitHub Copilot Chat (or any Claude-compatible client) and describe what you want to test:

```
@playwright-test-generator Generate tests for the payment order creation flow
@playwright-test-generator Write smoke tests for the sidebar navigation
@playwright-test-generator Add tests for the event analytics dashboard filter buttons
```

The agent will:
1. Generate tests following Playwright best practices (web-first assertions, auto-waiting, accessibility selectors)
2. Apply the `addInitScript` auth bypass pattern required for SSR
3. Use `gotoAndWait()` helpers to handle Angular's client-side re-routing after SSR
4. Iteratively fix any failures until tests pass

---

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) — Full system design, messaging, event flow
- [BFF Server Guide](docs/BFF-SERVER.md) — Setup, configuration, API reference
- [Testing Guide](docs/TESTING.md) — Playwright E2E testing setup and patterns
- [Component Guide](COMPONENT_IMPLEMENTATION_GUIDE.md) — Angular component patterns

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19, TypeScript, SCSS, SSR-capable |
| BFF | Node.js, Express, TypeScript |
| Messaging | KafkaJS / @azure/event-hubs (swappable) |
| Real-time | Server-Sent Events (SSE) |
| Microservices | .NET 9, ASP.NET Core, EF Core |
| Orchestration | .NET Aspire |
| Internal Messaging | RabbitMQ + MassTransit |
| Database | PostgreSQL |
| Local Infra | Docker Compose (Kafka, Zookeeper, UI) |
| E2E Testing | Playwright |
| Containerization | Docker + nginx |
