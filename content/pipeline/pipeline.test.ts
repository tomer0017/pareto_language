import { describe, expect, it } from 'vitest';
import { stageQualityScore, stageReadyGate, stageResearch, stageValidation, stubNativeReview } from './stages.js';

describe('content pipeline framework (Sprint 5)', () => {
  it('research loads concepts and the it pack', () => {
    const { ctx, result } = stageResearch('it');
    expect(result.ok).toBe(true);
    expect(ctx.concepts.length).toBeGreaterThanOrEqual(4);
    expect(ctx.pack?.items.length).toBeGreaterThan(150);
  });

  it('validation flags duplicates and identical cross-language realizations', () => {
    const { ctx } = stageResearch('it');
    const clone = { ...ctx.concepts[0]! };
    const bad = {
      ...ctx.concepts[0]!,
      id: 'concept.word.hotel-demo',
      realizations: {
        en: { text: 'hotel', quality: 'draft' as const },
        it: { text: 'hotel', quality: 'draft' as const },
      },
    };
    const result = stageValidation({ ...ctx, concepts: [...ctx.concepts, clone, bad] });
    expect(result.ok).toBe(false);
    expect(result.issues.join(' ')).toContain('duplicate concept id');
    expect(result.issues.join(' ')).toContain('assumed-known candidate');
  });

  it('quality score reports histogram incl. missing realizations', () => {
    const { ctx } = stageResearch('es');
    const result = stageQualityScore(ctx);
    expect(result.summary).toMatch(/ai_generated|missing|rejected/);
  });

  it('READY gate blocks a language with nothing to ship', () => {
    const gate = stageReadyGate({ lang: 'th', concepts: [], pack: null, results: [] }, []);
    expect(gate.ok).toBe(false);
  });

  it('stub reviewers report pending honestly and never auto-pass', async () => {
    const { ctx } = stageResearch('es');
    const res = await stubNativeReview.review(ctx);
    expect(res.pendingCount).toBeGreaterThan(0);
    expect(res.failedIds).toEqual([]);
  });
});
