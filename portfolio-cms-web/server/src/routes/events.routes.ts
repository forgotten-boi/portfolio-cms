import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { IEventProducer, IntegrationEvent } from '../messaging';
import { EventProcessor } from '../services/event-processor';
import { AnalyticsAggregator } from '../services/analytics-aggregator';

/**
 * Event routes — publishing, SSE real-time stream, and dead-letter inspection.
 *
 * The SSE endpoint (/stream) is consumed by the Angular EventService to
 * receive real-time payment and portfolio event notifications without polling.
 */

// In-memory SSE client list
type SSEClient = { id: string; res: Response };
const sseClients: SSEClient[] = [];

/** Broadcast an event to all connected SSE clients */
export function broadcastSSE(event: IntegrationEvent): void {
  const data = JSON.stringify(event);
  for (const client of sseClients) {
    client.res.write(`event: ${event.eventType}\ndata: ${data}\n\n`);
  }
}

export function createEventRoutes(
  producer: IEventProducer,
  processor: EventProcessor,
  aggregator: AnalyticsAggregator,
): Router {
  const router = Router();

  // ── SSE stream endpoint ────────────────────────────────────────
  router.get('/stream', (req: Request, res: Response) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // nginx SSE support
    });

    const clientId = req.headers['x-correlation-id'] as string || randomUUID();
    const client: SSEClient = { id: clientId, res };
    sseClients.push(client);

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30_000);

    req.on('close', () => {
      clearInterval(heartbeat);
      const idx = sseClients.indexOf(client);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // ── Publish a portfolio event ──────────────────────────────────
  router.post('/publish', async (req: Request, res: Response) => {
    try {
      const { eventType, payload } = req.body;
      const correlationId = req.headers['x-correlation-id'] as string;

      if (!eventType || !payload) {
        res.status(400).json({ detail: 'eventType and payload are required' });
        return;
      }

      // Route to appropriate processor method based on eventType
      switch (eventType) {
        case 'portfolio.blog.published':
          await processor.onBlogPublished(payload.blogId, payload.title, payload.authorId, correlationId);
          break;
        case 'portfolio.blog.viewed':
          await processor.onBlogViewed(payload.blogId, payload.viewerId, correlationId);
          break;
        case 'portfolio.cv.updated':
          await processor.onCvUpdated(payload.userId, payload.sections || [], correlationId);
          break;
        case 'portfolio.resume.generated':
          await processor.onResumeGenerated(payload.userId, payload.templateName, correlationId);
          break;
        case 'portfolio.job.match_completed':
          await processor.onJobMatchCompleted(payload.userId, payload.matchScore, payload.jobTitle, correlationId);
          break;
        default:
          // Generic publish
          await processor.onPaymentEvent(eventType, payload, correlationId);
      }

      res.status(202).json({ accepted: true, eventType, correlationId });
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  });

  // ── Recent events (for debugging / UI) ─────────────────────────
  router.get('/recent', (_req: Request, res: Response) => {
    const snapshot = aggregator.getSnapshot();
    res.json(snapshot.recentEvents.slice(0, 20));
  });

  return router;
}
