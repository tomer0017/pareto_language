import mongoose from 'mongoose';
import { config } from '../config.js';
import { seedAll, seedBankWords, seedContentPacks, seedItalianFromPack } from './seeders.js';

/** Seed CLI: tsx server/src/seed/cli.ts <all|words|phrases|situations|content-packs> */
async function main(): Promise<void> {
  const target = process.argv[2] ?? 'all';
  if (!config.mongoUri) {
    console.error('[seed] MONGO_URI is not set (server/.env). Nothing seeded.');
    process.exit(1);
  }
  await mongoose.connect(config.mongoUri);
  console.info('[seed] MongoDB connected');
  try {
    switch (target) {
      case 'all':
        await seedAll();
        break;
      case 'words':
        await seedItalianFromPack(); // it words+phrases+situations come from the same source pack
        await seedBankWords();
        break;
      case 'phrases':
      case 'situations':
        await seedItalianFromPack();
        break;
      case 'content-packs':
        await seedContentPacks();
        break;
      default:
        console.error(`[seed] unknown target "${target}"`);
        process.exit(1);
    }
    console.info('[seed] done');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error('[seed] failed —', err instanceof Error ? `${err.name}: ${err.message}` : err);
  process.exit(1);
});
