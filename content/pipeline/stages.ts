import { ConceptSchema, type Concept, type ContentPack } from '@ready/content-schema';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { loadPack } from '../pack.js';

/**
 * READY content pipeline framework (Sprint 5).
 *   Research → Validation → Native Review → AI Review → Quality Score → READY → Seed
 *   → Mongo → Offline Pack → Production
 * This is the FRAMEWORK: typed stages, pluggable review adapters, auditable report.
 * It generates no content — it moves authored content through gates.
 */

export interface StageResult {
  stage: StageName;
  ok: boolean;
  summary: string;
  issues: string[];
}

export type StageName =
  | 'research'
  | 'validation'
  | 'native_review'
  | 'ai_review'
  | 'quality_score'
  | 'ready'
  | 'seed'
  | 'offline_pack'
  | 'production';

export interface PipelineContext {
  lang: string;
  concepts: Concept[];
  pack: ContentPack | null;
  results: StageResult[];
}

/** Pluggable human/machine review step. Stubs today; real integrations replace them 1:1. */
export interface ReviewAdapter {
  name: string;
  /** Returns item ids that FAILED review. Pending items are reported, not failed. */
  review(ctx: PipelineContext): Promise<{ failedIds: string[]; pendingCount: number }>;
}

/** Stub adapters — the honest default: everything below the bar is "pending", never "passed". */
export const stubNativeReview: ReviewAdapter = {
  name: 'native-review:stub',
  async review(ctx) {
    const pending = ctx.concepts.filter((c) =>
      Object.values(c.realizations).some((r) => r.quality === 'draft' || r.quality === 'ai_generated' || r.quality === 'ai_reviewed'),
    ).length;
    return { failedIds: [], pendingCount: pending };
  },
};
export const stubAiReview: ReviewAdapter = {
  name: 'ai-review:stub',
  async review(ctx) {
    const pending = ctx.concepts.filter((c) =>
      Object.values(c.realizations).some((r) => r.quality === 'draft' || r.quality === 'ai_generated'),
    ).length;
    return { failedIds: [], pendingCount: pending };
  },
};

const CONCEPTS_DIR = fileURLToPath(new URL('../concepts/', import.meta.url));

/** Stage 1 — Research: load authored sources (concepts + legacy pack if present). */
export function stageResearch(lang: string): { ctx: PipelineContext; result: StageResult } {
  const concepts: Concept[] = [];
  const issues: string[] = [];
  if (existsSync(CONCEPTS_DIR)) {
    for (const file of readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.yaml'))) {
      const raw = parse(readFileSync(`${CONCEPTS_DIR}${file}`, 'utf8')) as { concepts?: unknown[] };
      for (const c of raw.concepts ?? []) {
        const parsed = ConceptSchema.safeParse(c);
        if (parsed.success) concepts.push(parsed.data);
        else issues.push(`${file}: invalid concept — ${parsed.error.issues[0]?.message ?? 'unknown'}`);
      }
    }
  }
  let pack: ContentPack | null = null;
  try {
    pack = loadPack(lang === 'it' ? 'it-IT' : lang);
  } catch {
    /* no authored pack for this lang — concepts-only is valid */
  }
  const ctx: PipelineContext = { lang, concepts, pack, results: [] };
  const result: StageResult = {
    stage: 'research',
    ok: issues.length === 0,
    summary: `${concepts.length} concepts, pack ${pack ? `v${pack.version} (${pack.items.length} items)` : 'none'}`,
    issues,
  };
  return { ctx, result };
}

/** Stage 2 — Validation: methodology gates (orphans, dup realizations, id collisions). */
export function stageValidation(ctx: PipelineContext): StageResult {
  const issues: string[] = [];
  const seenIds = new Set<string>();
  for (const c of ctx.concepts) {
    if (seenIds.has(c.id)) issues.push(`duplicate concept id ${c.id}`);
    seenIds.add(c.id);
    if (!c.neverTeach && c.kind !== 'number' && c.situationSlugs.length === 0 && !c.categories.includes('recovery') && !c.categories.includes('signs') && !c.categories.includes('questions')) {
      issues.push(`orphan concept ${c.id}: serves no situation/recovery/signs/numbers`);
    }
    const texts = new Map<string, string>();
    for (const [lang, r] of Object.entries(c.realizations)) {
      const prior = texts.get(r.text.toLowerCase());
      if (prior && prior !== lang) issues.push(`${c.id}: identical realization "${r.text}" for ${prior}+${lang} — assumed-known candidate?`);
      texts.set(r.text.toLowerCase(), lang);
    }
  }
  return { stage: 'validation', ok: issues.length === 0, summary: `${ctx.concepts.length} concepts checked`, issues };
}

/** Stage 5 — Quality score: histogram + activation gate (mirror of server-side gate). */
export function stageQualityScore(ctx: PipelineContext): StageResult {
  const histogram: Record<string, number> = {};
  for (const c of ctx.concepts) {
    const r = c.realizations[ctx.lang];
    const q = c.neverTeach ? 'rejected' : (r?.quality ?? 'missing');
    histogram[q] = (histogram[q] ?? 0) + 1;
  }
  const missing = histogram.missing ?? 0;
  const issues = missing > 0 ? [`${missing} concepts lack a ${ctx.lang} realization`] : [];
  return {
    stage: 'quality_score',
    ok: true, // scoring itself always succeeds; the READY gate judges
    summary: Object.entries(histogram).map(([k, v]) => `${k}:${v}`).join(' '),
    issues,
  };
}

/** Stage 6 — READY gate: is this language allowed to advance toward production? */
export function stageReadyGate(ctx: PipelineContext, prior: StageResult[]): StageResult {
  const issues: string[] = [];
  if (prior.some((r) => !r.ok)) issues.push('upstream stage failed');
  const realizable = ctx.concepts.filter((c) => !c.neverTeach && c.realizations[ctx.lang]);
  if (realizable.length === 0 && !ctx.pack) issues.push('nothing to ship: no realizations and no authored pack');
  return {
    stage: 'ready',
    ok: issues.length === 0,
    summary: `${realizable.length} realizable concepts for ${ctx.lang}`,
    issues,
  };
}
