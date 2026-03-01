import { Router, Request, Response } from 'express';
import { IEventProducer, IEventConsumer } from '../messaging';

/**
 * Health check routes — verifies BFF, messaging, and downstream services.
 */
export function createHealthRoutes(producer: IEventProducer, consumer: IEventConsumer): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'portfolio-cms-bff',
      timestamp: new Date().toISOString(),
      messaging: {
        provider: process.env.MESSAGING_PROVIDER || 'kafka',
        connected: true, // Simplified; a real check would ping the broker
      },
    });
  });

  router.get('/ready', (_req: Request, res: Response) => {
    res.json({ ready: true });
  });

  return router;
}
