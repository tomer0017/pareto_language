import mongoose from 'mongoose';
import { createApp } from './app.js';
import { assertProdSecrets, config } from './config.js';

async function main(): Promise<void> {
  assertProdSecrets();
  if (!config.mongoUri) {
    // Fail gracefully with a clear message — the PWA keeps working local-first without us.
    console.error(
      '[server] MONGO_URI is not set. Add it to server/.env (see .env.example / docs/RUNBOOK.md). ' +
        'The web app continues to work offline/local-first without the server.',
    );
    process.exit(1);
  }
  await mongoose.connect(config.mongoUri);
  console.info('[server] MongoDB connected'); // never log the URI itself
  const app = createApp();
  app.listen(config.port, () => {
    console.info(`[server] listening on :${config.port}`);
  });
}

main().catch((err) => {
  // Log the error class/message only — a Mongo error can embed the URI; keep secrets out of logs.
  const msg = err instanceof Error ? `${err.name}: ${err.message.split('mongodb').join('mongodb…')}` : String(err);
  console.error('[server] fatal startup error —', msg);
  process.exit(1);
});
