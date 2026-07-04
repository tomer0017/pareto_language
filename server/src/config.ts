import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';

// Load env from server/.env first, then repo-root .env as fallback — regardless of CWD.
loadEnv({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
loadEnv({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

/** Server configuration — secrets come from .env (see .env.example / RUNBOOK). */
export const config = {
  port: Number(process.env.PORT ?? 4000),
  /** MONGO_URI is the canonical name; MONGODB_URI kept as an alias. Never logged. */
  mongoUri: process.env.MONGO_URI ?? process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  corsOrigin: process.env.CLIENT_ORIGIN ?? process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  /** Directory holding built content packs + manifest (emitted by npm run build:content). */
  contentDir: process.env.CONTENT_DIR ?? fileURLToPath(new URL('../../apps/web/public/content/', import.meta.url)),
  nodeEnv: process.env.NODE_ENV ?? 'development',
} as const;

export function assertProdSecrets(): void {
  if (config.nodeEnv === 'production') {
    if (config.jwtSecret === 'dev-only-secret-change-me') {
      throw new Error('JWT_SECRET must be set in production');
    }
  }
}
