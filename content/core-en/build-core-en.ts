/**
 * Core 100 builder (Part A5). Emits, from the ONE authored source (pilot100.ts) via the pure
 * transforms in corpus.ts, TWO concept-first artifacts:
 *   1. content/concepts/core-en.yaml — canonical ConceptSchema concepts, read by the pipeline
 *      (stageResearch) and the server seed (seedConcepts → Mongo, idempotent).
 *   2. apps/web/public/content/core-en.v1.json — the offline app pack (PWA-precached), the real
 *      Core Words + game data source (replaces the old React mock).
 * Validation runs first and THROWS on any violation. Run: npx tsx content/core-en/build-core-en.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { PILOT100 } from './pilot100.js';
import { buildConcepts, buildPackWords, validatePilot, CORE_EN_VERSION } from './corpus.js';

function main(): void {
  validatePilot(PILOT100);
  const concepts = buildConcepts();
  const words = buildPackWords();

  // 1) Canonical concepts YAML (pipeline + seed source of truth).
  const conceptsDir = fileURLToPath(new URL('../concepts/', import.meta.url));
  mkdirSync(conceptsDir, { recursive: true });
  const header =
    '# Core 100 — GENERATED from content/core-en/pilot100.ts by build-core-en.ts. Do not edit by hand.\n' +
    '# Canonical concept-first source for the emoji pilot: seeded to Mongo (seedConcepts) and\n' +
    '# realized into the offline app pack. Hebrew is AI-reviewed, pending native review.\n';
  writeFileSync(`${conceptsDir}core-en.yaml`, header + stringify({ concepts }));

  // 2) Offline app pack (PWA-precached; the real Core Words + game data source).
  const outDir = fileURLToPath(new URL('../../apps/web/public/content/', import.meta.url));
  mkdirSync(outDir, { recursive: true });
  const pack = { lang: 'en', version: CORE_EN_VERSION, generatedAt: new Date().toISOString(), count: words.length, words };
  writeFileSync(`${outDir}core-en.v1.json`, JSON.stringify(pack, null, 2));

  const byCat = words.reduce<Record<string, number>>((m, w) => ((m[w.category] = (m[w.category] ?? 0) + 1), m), {});
  console.info(`✓ Core 100: ${concepts.length} concepts → content/concepts/core-en.yaml + public/content/core-en.v1.json`);
  console.info(`  categories: ${Object.entries(byCat).map(([k, v]) => `${k}:${v}`).join(' ')}`);
}

main();
