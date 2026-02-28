import { Router, Request, Response } from 'express';
import { AnalyticsAggregator } from '../services/analytics-aggregator';

/**
 * Analytics routes — serves aggregated metrics for the Angular dashboard.
 * In production, these would query Azure Synapse or a real-time serving layer.
 * For the BFF, we serve from the in-memory AnalyticsAggregator.
 */
export function createAnalyticsRoutes(aggregator: AnalyticsAggregator): Router {
  const router = Router();

  // Full aggregated snapshot
  router.get('/summary', (_req: Request, res: Response) => {
    res.json(aggregator.getSnapshot());
  });

  // Payment-specific metrics
  router.get('/payments', (_req: Request, res: Response) => {
    const snapshot = aggregator.getSnapshot();
    res.json(snapshot.payment);
  });

  // Portfolio-specific metrics
  router.get('/portfolio', (_req: Request, res: Response) => {
    const snapshot = aggregator.getSnapshot();
    res.json(snapshot.portfolio);
  });

  // Recent events feed
  router.get('/feed', (_req: Request, res: Response) => {
    const snapshot = aggregator.getSnapshot();
    const limit = parseInt((_req.query.limit as string) || '20', 10);
    res.json(snapshot.recentEvents.slice(0, limit));
  });

  // Reset counters (for testing)
  router.post('/reset', (_req: Request, res: Response) => {
    aggregator.reset();
    res.json({ reset: true });
  });

  return router;
}
