import type { FoundationCategoryModel } from './foundationContent.js';

/**
 * Foundation progress — PURE, motivational only (never gates content). Given the built model and the
 * set of viewed concept ids, report per-category and overall completion. A concept normally lives in
 * exactly one category, but the overall figure dedupes by concept id so it can never exceed 100%.
 */
export interface CategoryProgress {
  id: string;
  viewed: number;
  total: number;
  pct: number;
}

export interface FoundationProgressModel {
  byCategory: Record<string, CategoryProgress>;
  overall: CategoryProgress;
}

const pct = (v: number, t: number): number => (t === 0 ? 0 : Math.round((v / t) * 100));

export function foundationProgress(
  model: FoundationCategoryModel[],
  viewed: ReadonlySet<string>,
): FoundationProgressModel {
  const byCategory: Record<string, CategoryProgress> = {};
  const allConcepts = new Set<string>();
  const viewedConcepts = new Set<string>();
  for (const cat of model) {
    let v = 0;
    for (const w of cat.words) {
      allConcepts.add(w.conceptId);
      if (viewed.has(w.conceptId)) { v++; viewedConcepts.add(w.conceptId); }
    }
    byCategory[cat.id] = { id: cat.id, viewed: v, total: cat.words.length, pct: pct(v, cat.words.length) };
  }
  return {
    byCategory,
    overall: { id: 'overall', viewed: viewedConcepts.size, total: allConcepts.size, pct: pct(viewedConcepts.size, allConcepts.size) },
  };
}
