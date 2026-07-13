import { describe, it, expect } from 'vitest';
import type { FoundationCategoryModel, FoundationWord } from './foundationContent.js';
import { foundationProgress } from './foundationProgress.js';

const fw = (conceptId: string): FoundationWord => ({
  conceptId,
  display: { contentId: conceptId, primaryText: conceptId, audioText: conceptId, audioLang: 'en', ttsLocale: 'en-US', primaryDirection: 'ltr', secondaryDirection: 'ltr', reviewId: conceptId },
  stars: 3,
  relatedMissions: [],
  category: null,
  corpusCategory: 'x',
});

const model: FoundationCategoryModel[] = [
  { id: 'people', icon: '👤', titleKey: 'foundationCatPeople', words: [fw('c.i'), fw('c.you'), fw('c.he'), fw('c.she')] },
  { id: 'colors', icon: '🎨', titleKey: 'foundationCatColors', words: [fw('c.red'), fw('c.blue')] },
];

describe('foundationProgress (motivational, never gates)', () => {
  it('computes per-category viewed/total/pct', () => {
    const p = foundationProgress(model, new Set(['c.i', 'c.you']));
    expect(p.byCategory.people).toEqual({ id: 'people', viewed: 2, total: 4, pct: 50 });
    expect(p.byCategory.colors).toEqual({ id: 'colors', viewed: 0, total: 2, pct: 0 });
  });

  it('computes an overall figure deduped by concept id (never exceeds 100%)', () => {
    const p = foundationProgress(model, new Set(['c.i', 'c.you', 'c.red', 'c.unrelated']));
    expect(p.overall).toEqual({ id: 'overall', viewed: 3, total: 6, pct: 50 });
  });

  it('is 0% for an empty viewed set and 100% when all are viewed', () => {
    expect(foundationProgress(model, new Set()).overall.pct).toBe(0);
    const all = new Set(model.flatMap((c) => c.words.map((w) => w.conceptId)));
    expect(foundationProgress(model, all).overall.pct).toBe(100);
  });
});
