import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { api } from './routes/api.js';
import { contentRoutes } from './routes/content.routes.js';
import { practiceRoutes } from './routes/practice.routes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { config } from './config.js';

/** Express app assembly — thin by design: sync + persistence, not logic (PDF §13). */
export function createApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));

  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  app.use('/api/v1', contentRoutes);
  app.use('/api/v1', practiceRoutes);
  app.use('/api/v1', api);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
