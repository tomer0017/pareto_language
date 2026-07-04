import { loadPack } from './pack.js';
import { ContentValidationError } from './pack.js';

/** CI gate: validate every authored pack without emitting (npm run validate:content). */
const LANGS = ['it-IT'] as const;

let ok = true;
for (const lang of LANGS) {
  try {
    const pack = loadPack(lang);
    console.info(`✓ ${lang} valid — ${pack.items.length} items, ${pack.situations.length} situations`);
  } catch (err) {
    ok = false;
    if (err instanceof ContentValidationError) {
      console.error(`✗ ${lang} invalid:`);
      console.error(err.message);
    } else {
      console.error(`✗ ${lang} failed to load:`, err);
    }
  }
}

if (!ok) process.exit(1);
