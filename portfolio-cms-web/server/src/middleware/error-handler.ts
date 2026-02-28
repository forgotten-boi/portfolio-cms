import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler — catches all unhandled errors, logs them,
 * and returns a consistent ProblemDetails-style JSON response.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[ErrorHandler]', err.message, err.stack);

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
    title: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    status: statusCode,
    detail: err.message,
    correlationId: _req.headers['x-correlation-id'] || null,
  });
}
