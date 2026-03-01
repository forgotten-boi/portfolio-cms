import { Router, Request, Response } from 'express';
import { PaymentProxy } from '../services/payment-proxy';

/**
 * REST routes that proxy to the .NET distributed-payment-system microservices.
 * The Angular frontend calls these instead of the .NET services directly,
 * enabling the BFF to inject correlation IDs, emit events, and aggregate data.
 */
export function createPaymentRoutes(proxy: PaymentProxy): Router {
  const router = Router();

  // ── Orders ──

  router.post('/orders', async (req: Request, res: Response) => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string;
      const result = await proxy.createOrder(req.body, correlationId);
      res.status(201).json(result);
    } catch (err: any) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { detail: err.message });
    }
  });

  router.get('/orders/:id', async (req: Request, res: Response) => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string;
      const result = await proxy.getOrder(req.params.id, correlationId);
      res.json(result);
    } catch (err: any) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { detail: err.message });
    }
  });

  router.post('/orders/:id/confirm', async (req: Request, res: Response) => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string;
      await proxy.confirmOrder(req.params.id, correlationId);
      res.json({ success: true });
    } catch (err: any) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { detail: err.message });
    }
  });

  router.post('/orders/:id/cancel', async (req: Request, res: Response) => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string;
      await proxy.cancelOrder(req.params.id, correlationId);
      res.json({ success: true });
    } catch (err: any) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { detail: err.message });
    }
  });

  // ── Payments ──

  router.get('/payments/:id', async (req: Request, res: Response) => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string;
      const result = await proxy.getPayment(req.params.id, correlationId);
      res.json(result);
    } catch (err: any) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { detail: err.message });
    }
  });

  // ── Accounting / Ledger ──

  router.get('/ledger/:transactionId', async (req: Request, res: Response) => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string;
      const result = await proxy.getLedgerEntries(req.params.transactionId, correlationId);
      res.json(result);
    } catch (err: any) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { detail: err.message });
    }
  });

  router.get('/balance/:accountName', async (req: Request, res: Response) => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string;
      const result = await proxy.getAccountBalance(req.params.accountName, correlationId);
      res.json(result);
    } catch (err: any) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { detail: err.message });
    }
  });

  router.post('/reconciliation', async (req: Request, res: Response) => {
    try {
      const correlationId = req.headers['x-correlation-id'] as string;
      const result = await proxy.runReconciliation(correlationId);
      res.json(result);
    } catch (err: any) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { detail: err.message });
    }
  });

  return router;
}
