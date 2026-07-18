/**
 * Core Corpus builder. From the ONE authored source (data/) via the pure transforms in
 * corpus.ts, emits the concept-first artifacts:
 *   1. content/concepts/core-corpus.yaml — canonical ConceptSchema concepts, read by the
 *      pipeline (stageResearch) and the server seed (seedConcepts → Mongo, idempotent).
 *   2. apps/web/public/content/core-{lang}.v1.json — one offline app pack PER declared
 *      language (PWA-precached; Core Words + games data source). Adding French = add 'fr'
 *      realizations + declare the language; this file needs no change.
 *
 * Validation runs first and THROWS on any violation, including cross-file concept-id
 * duplicates against every other content/concepts/*.yaml (seed integrity).
 * Run: npx tsx content/core-corpus/build-core.ts
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';
import { CORPUS } from './data/index.js';
import { buildConcepts, buildPackWords, mergePilotRealizations, validateCorpus, validatePilotPack } from './corpus.js';
import { CORE_CORPUS_VERSION, DECLARED_LANGS } from './types.js';
import { FR_PILOT } from './data/fr-pilot.js';
import { ES_PILOT } from './data/es-pilot.js';

/** Pilot (curated-subset) languages: shipped as a real, validated pack without joining
 *  DECLARED_LANGS (which would demand a realization on all 500). Keyed slug → surface form. */
const PILOT_PACKS: Record<string, Record<string, string>> = {
  fr: Object.fromEntries(Object.entries(FR_PILOT).map(([slug, e]) => [slug, e.w])),
  es: Object.fromEntries(Object.entries(ES_PILOT).map(([slug, e]) => [slug, e.w])),
};

const CONCEPTS_DIR = fileURLToPath(new URL('../concepts/', import.meta.url));
const PACKS_DIR = fileURLToPath(new URL('../../apps/web/public/content/', import.meta.url));
const YAML_NAME = 'core-corpus.yaml';

/** Seed integrity: no concept id may exist in two YAML files (last-upsert-wins is silent). */
function assertNoCrossFileDuplicates(ownIds: Set<string>): void {
  const clashes: string[] = [];
  for (const file of readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.yaml') && f !== YAML_NAME)) {
    const raw = parse(readFileSync(`${CONCEPTS_DIR}${file}`, 'utf8')) as { concepts?: { id?: string }[] };
    for (const c of raw.concepts ?? []) {
      if (c.id && ownIds.has(c.id)) clashes.push(`${c.id} (also in ${file})`);
    }
  }
  if (clashes.length) throw new Error(`Core Corpus seed-integrity failed — duplicate concept ids across files:\n - ${clashes.join('\n - ')}`);
}

function main(): void {
  validateCorpus(CORPUS);
  const concepts = buildConcepts(CORPUS);
  assertNoCrossFileDuplicates(new Set(concepts.map((c) => c.id)));

  // 1) Canonical concepts YAML (pipeline + seed source of truth).
  mkdirSync(CONCEPTS_DIR, { recursive: true });
  const header =
    '# READY Core 500 — GENERATED from content/core-corpus/data/ by build-core.ts. Do not edit by hand.\n' +
    '# Canonical concept-first corpus: seeded to Mongo (seedConcepts) and realized into the\n' +
    '# per-language offline app packs. Realizations are AI-reviewed, pending native review.\n';
  writeFileSync(`${CONCEPTS_DIR}${YAML_NAME}`, header + stringify({ concepts }));

  // 2) One offline app pack per declared language (PWA-precached game/word source).
  mkdirSync(PACKS_DIR, { recursive: true });
  for (const lang of DECLARED_LANGS) {
    const words = buildPackWords(lang, CORPUS);
    const pack = { lang, version: CORE_CORPUS_VERSION, generatedAt: new Date().toISOString(), count: words.length, words };
    writeFileSync(`${PACKS_DIR}core-${lang}.v1.json`, JSON.stringify(pack, null, 2));
    const visual = words.filter((w) => w.emoji).length;
    console.info(`✓ core-${lang}.v1.json: ${words.length} words (${visual} game-eligible with emoji)`);
  }

  // 3) Pilot packs — curated subsets (e.g. French ~200) shipped so Core Words + games work in that
  //    language now, validated as a pilot. NOT a completed language; stays out of DECLARED_LANGS.
  for (const [lang, realizations] of Object.entries(PILOT_PACKS)) {
    const rows = mergePilotRealizations(lang, realizations, CORPUS);
    const words = buildPackWords(lang, rows);
    validatePilotPack(lang, words);
    const pack = { lang, version: CORE_CORPUS_VERSION, generatedAt: new Date().toISOString(), pilot: true, count: words.length, words };
    writeFileSync(`${PACKS_DIR}core-${lang}.v1.json`, JSON.stringify(pack, null, 2));
    const visual = words.filter((w) => w.emoji).length;
    console.info(`✓ core-${lang}.v1.json: ${words.length} words (${visual} game-eligible) — PILOT subset, pending native review`);
  }

  const byCat = CORPUS.reduce<Record<string, number>>((m, r) => ((m[r.cat] = (m[r.cat] ?? 0) + 1), m), {});
  console.info(`✓ Core Corpus: ${concepts.length} concepts → content/concepts/${YAML_NAME}`);
  console.info(`  categories: ${Object.entries(byCat).map(([k, v]) => `${k}:${v}`).join(' ')}`);
}

main();
