import mongoose from 'mongoose';
import { createApp } from './app.js';
import { assertProdSecrets, config } from './config.js';

async function main(): Promise<void> {
  assertProdSecrets();
  await mongoose.connect(config.mongoUri);
  console.info(`[server] mongo connected: ${config.mongoUri.replace(/\/\/.*@/, '//***@')}`);
  const app = createApp();
  app.listen(config.port, () => {
    console.info(`[server] listening on :${config.port}`);
  });
}

main().catch((err) => {
  console.error('[server] fatal startup error', err);
  process.exit(1);
});
