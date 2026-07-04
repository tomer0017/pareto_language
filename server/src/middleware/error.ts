import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

/** Typed application error (M4 quality bar): every failure path is explicit and logged. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, 'not_found', 'Route not found'));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    console.warn(`[api] validation failed ${req.method} ${req.path}`, err.issues);
    res.status(400).json({
      error: { code: 'validation_failed', message: 'Request failed validation', details: err.issues },
    });
    return;
  }
  if (err instanceof AppError) {
    if (err.status >= 500) console.error(`[api] ${req.method} ${req.path}`, err);
    else console.warn(`[api] ${err.code} ${req.method} ${req.path}: ${err.message}`);
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  console.error(`[api] unhandled ${req.method} ${req.path}`, err);
  res.status(500).json({ error: { code: 'internal', message: 'Internal server error' } });
}
