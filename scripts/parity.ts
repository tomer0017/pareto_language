/**
 * Multilingual parity dashboard (Phase 7). Prints, for every non-reference language, exactly how
 * far it is from English parity in each subsystem, and FAILS (exit 1) for any language declared
 * COMPLETE that still has a gap — so a language can never be marked done while incomplete.
 *
 * Run: npx tsx scripts/parity.ts
 */
import { corpusParity, assertCorpusParity } from '../content/core-corpus/parity.js';
import { CORPUS } from '../content/core-corpus/data/index.js';
import { FR_PILOT } from '../content/core-corpus/data/fr-pilot.js';
import { missionParity, assertBootcampParity } from '../apps/web/src/features/bootcamp/parity.js';
import { DAYS } from '../apps/web/src/features/bootcamp/registry.js';
import { DAYS_FR } from '../apps/web/src/features/bootcamp/fr/index.js';

/** Languages that CLAIM full parity — the build fails if any of these has a gap. English is the
 *  reference; French is honestly still IN PROGRESS, so it is measured but not yet gating. */
const COMPLETE_LANGS = new Set<string>([]);

const corpusRealizations: Record<string, Record<string, unknown>> = {
  fr: FR_PILOT,
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
  const bp = missionParity(lang, DAYS, DAYS_FR);
  const complete = COMPLETE_LANGS.has(lang);
  console.info(`\n ${lang.toUpperCase()}  ${complete ? '(claims COMPLETE)' : '(in progress)'}`);
  console.info(`  Core corpus   ${bar(cp.covered, cp.total)}${cp.orphans.length ? `  ⚠ ${cp.orphans.length} orphan(s)` : ''}`);
  console.info(`  Bootcamp      ${bar(bp.covered, bp.total)}${bp.mismatched.length ? `  ⚠ ${bp.mismatched.length} structural mismatch` : ''}`);
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
