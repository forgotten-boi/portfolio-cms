import express from 'express';
import cors from 'cors';
import { config } from './config';
import { createMessagingPair, Topics } from './messaging';
import { correlationIdMiddleware } from './middleware/correlation-id';
import { errorHandler } from './middleware/error-handler';
import { PaymentProxy } from './services/payment-proxy';
import { EventProcessor } from './services/event-processor';
import { AnalyticsAggregator } from './services/analytics-aggregator';
import { createPaymentRoutes } from './routes/payments.routes';
import { createEventRoutes, broadcastSSE } from './routes/events.routes';
import { createAnalyticsRoutes } from './routes/analytics.routes';
import { createHealthRoutes } from './routes/health.routes';

async function main() {
  const app = express();

  // ── Middleware ────────────────────────────────────────────────
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(correlationIdMiddleware);

  // ── Messaging ────────────────────────────────────────────────
  const { producer, consumer } = createMessagingPair();

  let messagingReady = false;
  try {
    await producer.connect();
    await consumer.connect();
    messagingReady = true;
    console.log('[BFF] Messaging layer connected');
  } catch (err) {
    console.warn('[BFF] Messaging not available — running in proxy-only mode:', (err as Error).message);
  }

  // ── Services ─────────────────────────────────────────────────
  const paymentProxy = new PaymentProxy();
  const eventProcessor = new EventProcessor(producer);
  const analyticsAggregator = new AnalyticsAggregator();

  // ── Event subscriptions (consume from all topics) ────────────
  if (messagingReady) {
    const allTopics = [
      Topics.PORTFOLIO_BLOG,
      Topics.PORTFOLIO_CV,
      Topics.PORTFOLIO_RESUME,
      Topics.PAYMENT_ORDER,
      Topics.PAYMENT_TRANSACTION,
      Topics.PAYMENT_LEDGER,
      Topics.ANALYTICS,
    ];

    for (const topic of allTopics) {
      try {
        await consumer.subscribe(topic, async (event) => {
          // 1. Update analytics aggregator
          analyticsAggregator.processEvent(event);
          // 2. Broadcast to SSE clients for real-time UI
          broadcastSSE(event);
          console.log(`[BFF] Event received: ${event.eventType} on ${topic}`);
        });
      } catch (err) {
        console.warn(`[BFF] Could not subscribe to ${topic}:`, (err as Error).message);
      }
    }
  }

  // ── Routes ───────────────────────────────────────────────────
  app.use('/api/payments', createPaymentRoutes(paymentProxy));
  app.use('/api/events', createEventRoutes(producer, eventProcessor, analyticsAggregator));
  app.use('/api/analytics', createAnalyticsRoutes(analyticsAggregator));
  app.use('/api/health', createHealthRoutes(producer, consumer));

  // ── Error handling ───────────────────────────────────────────
  app.use(errorHandler);

  // ── Start server ─────────────────────────────────────────────
  app.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║  Portfolio CMS — BFF Server                          ║
║  Port:      ${String(config.port).padEnd(40)}║
║  Messaging: ${config.messaging.provider.padEnd(40)}║
║  CORS:      ${config.corsOrigin.padEnd(40)}║
╚══════════════════════════════════════════════════════╝
    `);
    console.log('Routes:');
    console.log('  POST /api/payments/orders          → Create order');
    console.log('  GET  /api/payments/orders/:id       → Get order');
    console.log('  POST /api/payments/orders/:id/confirm');
    console.log('  POST /api/payments/orders/:id/cancel');
    console.log('  GET  /api/payments/payments/:id     → Get payment');
    console.log('  GET  /api/payments/ledger/:txId     → Ledger entries');
    console.log('  GET  /api/payments/balance/:acct    → Account balance');
    console.log('  POST /api/payments/reconciliation   → Run reconciliation');
    console.log('  GET  /api/events/stream             → SSE real-time');
    console.log('  POST /api/events/publish            → Publish event');
    console.log('  GET  /api/analytics/summary         → Full analytics');
    console.log('  GET  /api/health                    → Health check');
  });

  // ── Graceful shutdown ────────────────────────────────────────
  const shutdown = async () => {
    console.log('\n[BFF] Shutting down...');
    try {
      await producer.disconnect();
      await consumer.disconnect();
    } catch { /* ignore */ }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[BFF] Fatal error:', err);
  process.exit(1);
});
