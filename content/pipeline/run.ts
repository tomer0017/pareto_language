import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  stageResearch,
  stageValidation,
  stageQualityScore,
  stageReadyGate,
  stubAiReview,
  stubNativeReview,
  type StageResult,
} from './stages.js';

/**
 * Pipeline CLI (Sprint 5): tsx content/pipeline/run.ts <lang> [--seed] [--pack]
 * Runs Research → Validation → Native Review → AI Review → Quality Score → READY,
 * then optionally Seed→Mongo (--seed, requires MONGO_URI) and Offline Pack (--pack).
 * Emits an auditable report to content/reports/<lang>.pipeline.json. Generates NO content.
 */

const REPORTS = fileURLToPath(new URL('../reports/', import.meta.url));

async function main(): Promise<void> {
  const lang = process.argv[2] ?? 'it';
  const flags = new Set(process.argv.slice(3));
  const results: StageResult[] = [];
  const push = (r: StageResult): void => {
    results.push(r);
    console.info(`${r.ok ? '✓' : '✗'} ${r.stage}: ${r.summary}${r.issues.length ? `\n   - ${r.issues.join('\n   - ')}` : ''}`);
  };

  const { ctx, result } = stageResearch(lang);
  push(result);
  push(stageValidation(ctx));

  const native = await stubNativeReview.review(ctx);
  push({ stage: 'native_review', ok: native.failedIds.length === 0, summary: `${stubNativeReview.name}: ${native.pendingCount} pending, ${native.failedIds.length} failed`, issues: native.failedIds.map((id) => `failed: ${id}`) });
  const ai = await stubAiReview.review(ctx);
  push({ stage: 'ai_review', ok: ai.failedIds.length === 0, summary: `${stubAiReview.name}: ${ai.pendingCount} pending, ${ai.failedIds.length} failed`, issues: ai.failedIds.map((id) => `failed: ${id}`) });

  push(stageQualityScore(ctx));
  push(stageReadyGate(ctx, results));

  const ready = results.at(-1)!.ok;
  if (flags.has('--seed')) {
    if (!ready) push({ stage: 'seed', ok: false, summary: 'blocked: READY gate failed', issues: [] });
    else {
      const mongoose = (await import('mongoose')).default;
      const { config } = await import('../../server/src/config.js');
      const { seedAll } = await import('../../server/src/seed/seeders.js');
      if (!config.mongoUri) push({ stage: 'seed', ok: false, summary: 'MONGO_URI not set', issues: [] });
      else {
        await mongoose.connect(config.mongoUri);
        await seedAll();
        await mongoose.disconnect();
        push({ stage: 'seed', ok: true, summary: 'seeded to Mongo', issues: [] });
      }
    }
  }
  if (flags.has('--pack')) {
    if (!ready) push({ stage: 'offline_pack', ok: false, summary: 'blocked: READY gate failed', issues: [] });
    else {
      const { execSync } = await import('node:child_process');
      execSync('npm run build:content', { stdio: 'inherit' });
      push({ stage: 'offline_pack', ok: true, summary: 'offline pack rebuilt', issues: [] });
    }
  }
  push({
    stage: 'production',
    ok: true,
    summary: 'activation stays manual: contentPacks.status flips only when gateReport.activeEligible (native review) — see docs/DATABASE.md',
    issues: [],
  });

  mkdirSync(REPORTS, { recursive: true });
  const reportPath = `${REPORTS}${lang}.pipeline.json`;
  writeFileSync(reportPath, JSON.stringify({ lang, at: new Date().toISOString(), results }, null, 2));
  console.info(`\nreport → content/reports/${lang}.pipeline.json`);
  if (results.some((r) => !r.ok)) process.exit(1);
}

main().catch((err) => {
  console.error('[pipeline] crashed —', err instanceof Error ? err.message : err);
  process.exit(1);
});
