/**
 * Multilingual parity dashboard (Phase 7). Prints, for every non-reference language, exactly how
 * far it is from English parity in each subsystem, and FAILS (exit 1) for any language declared
 * COMPLETE that still has a gap — so a language can never be marked done while incomplete.
 *
 * Run: npx tsx scripts/parity.ts
 */
import { readFileSync } from 'node:fs';
import { corpusParity, assertCorpusParity } from '../content/core-corpus/parity.js';
import { CORPUS } from '../content/core-corpus/data/index.js';
import { FR_PILOT } from '../content/core-corpus/data/fr-pilot.js';
import { ES_PILOT } from '../content/core-corpus/data/es-pilot.js';
import { missionParity, assertBootcampParity } from '../apps/web/src/features/bootcamp/parity.js';
import { DAYS } from '../apps/web/src/features/bootcamp/registry.js';
import { DAYS_FR } from '../apps/web/src/features/bootcamp/fr/index.js';
import { DAYS_ES } from '../apps/web/src/features/bootcamp/es/index.js';
import { FOUNDATION_TAXONOMY } from '../apps/web/src/features/foundation/taxonomy.js';
import { matchesCategory } from '../apps/web/src/features/foundation/foundationContent.js';
import { authoredExampleIds } from '../apps/web/src/features/foundation/foundationExamples.js';
import { languageInfo } from '../apps/web/src/shared/i18n/languages.js';

/** Foundation example + audio coverage for a language, read from the built pack + the registry. */
function foundationCoverage(lang: string): { exCovered: number; exTotal: number; ttsTag: string } {
  const pack = JSON.parse(readFileSync(new URL(`../apps/web/public/content/core-${lang}.v1.json`, import.meta.url), 'utf8')) as { words: { conceptId: string; category: string; pos: string }[] };
  const foundationWords = pack.words.filter((w) => FOUNDATION_TAXONOMY.some((c) => matchesCategory(w as never, c)));
  const authored = new Set(authoredExampleIds(lang));
  return {
    exCovered: foundationWords.filter((w) => authored.has(w.conceptId)).length,
    exTotal: foundationWords.length,
    ttsTag: languageInfo(lang).ttsTag,
  };
}

/** Languages that CLAIM full parity — the build fails if any of these has a gap. English is the
 *  reference; French is honestly still IN PROGRESS, so it is measured but not yet gating. */
const COMPLETE_LANGS = new Set<string>([]);

const corpusRealizations: Record<string, Record<string, unknown>> = {
  fr: FR_PILOT,
  es: ES_PILOT,
};

/** Mission sets per language (parity is measured against the English reference `DAYS`). */
const missionsByLang: Record<string, typeof DAYS> = {
  fr: DAYS_FR,
  es: DAYS_ES,
};

function bar(covered: number, total: number): string {
  const pct = total === 0 ? 0 : Math.round((covered / total) * 100);
  const filled = Math.round((covered / total) * 20);
  return `[${'█'.repeat(filled)}${'░'.repeat(20 - filled)}] ${covered}/${total} (${pct}%)`;
}

let failed = false;
console.info('\n READY — multilingual parity vs English reference\n' + '─'.repeat(60));

for (const lang of Object.keys(corpusRealizations)) {
  const cp = corpusParity(lang, corpusRealizations[lang]!, CORPUS);
  const bp = missionParity(lang, DAYS, missionsByLang[lang] ?? {});
  const complete = COMPLETE_LANGS.has(lang);
  console.info(`\n ${lang.toUpperCase()}  ${complete ? '(claims COMPLETE)' : '(in progress)'}`);
  console.info(`  Core corpus   ${bar(cp.covered, cp.total)}${cp.orphans.length ? `  ⚠ ${cp.orphans.length} orphan(s)` : ''}`);
  console.info(`  Bootcamp      ${bar(bp.covered, bp.total)}${bp.mismatched.length ? `  ⚠ ${bp.mismatched.length} structural mismatch` : ''}`);
  const fc = foundationCoverage(lang);
  console.info(`  Fnd examples  ${bar(fc.exCovered, fc.exTotal)}`);
  console.info(`  Audio (TTS)   ${fc.ttsTag ? `✓ ${fc.ttsTag}` : '✗ none'}`);
  if (bp.perMission.length) {
    for (const m of bp.perMission) {
      console.info(`     mission ${String(m.day).padStart(2)}  steps ${m.enSteps}→${m.frSteps}  items ${m.enItems}→${m.frItems}  ${m.ok ? '✅' : '❌'}`);
    }
  }
  if (complete) {
    try { assertCorpusParity(cp); assertBootcampParity(bp); }
    catch (err) { failed = true; console.error(`  ❌ ${(err as Error).message}`); }
  }
}

console.info('\n' + '─'.repeat(60));
if (failed) { console.error(' PARITY GATE FAILED — a language claims completeness but has gaps.\n'); process.exit(1); }
console.info(' Parity gate OK (no language claims completeness while incomplete).\n');
