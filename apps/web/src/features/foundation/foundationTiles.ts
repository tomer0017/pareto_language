import type { FoundationCategoryModel, FoundationWord } from './foundationContent.js';
import type { FoundationCategory } from './taxonomy.js';

/**
 * Presentation helpers for the Foundation tiles — PURE (no React, no store), so the lively parts of
 * the sheet are testable: the swatch a colour tile paints itself, the lightly varied tile order, and
 * the two groups the categories are shown in.
 */

/** The colour a Colors tile shows — by language-independent concept id, so every pack paints alike. */
export const COLOR_SWATCH: Readonly<Record<string, { bg: string; ink: string }>> = {
  'concept.word.red': { bg: '#e5484d', ink: '#fff' },
  'concept.word.blue': { bg: '#3b82f6', ink: '#fff' },
  'concept.word.green': { bg: '#22a06b', ink: '#fff' },
  'concept.word.black': { bg: '#1f1f24', ink: '#fff' },
  'concept.word.white': { bg: '#ffffff', ink: '#1f1f24' },
  'concept.word.pink': { bg: '#f472b6', ink: '#1f1f24' },
  'concept.word.yellow': { bg: '#facc15', ink: '#1f1f24' },
  'concept.word.orange': { bg: '#fb923c', ink: '#1f1f24' },
  'concept.word.brown': { bg: '#8b5a2b', ink: '#fff' },
  'concept.word.purple': { bg: '#8b5cf6', ink: '#fff' },
  'concept.word.gray': { bg: '#9ca3af', ink: '#1f1f24' },
  'concept.word.grey': { bg: '#9ca3af', ink: '#1f1f24' },
};
export const swatchOf = (conceptId: string): { bg: string; ink: string } | undefined => COLOR_SWATCH[conceptId];

/**
 * The order tiles are laid out in: the category's own order (the corpus ranking — the most useful
 * words first), and NOTHING moves it. Tapping, hearing, marking a word seen, a re-render: the grid
 * stays exactly where the thumb left it. (A per-tap "unseen first" reshuffle was tried and removed
 * on 2026-10-06 — on a phone it made the grid jump under the finger.)
 */
export function tileOrder<T extends Pick<FoundationWord, 'conceptId'>>(words: readonly T[]): T[] {
  return [...words];
}

/** The categories of one group, in their declared order. */
export const categoriesOf = (model: readonly FoundationCategoryModel[], taxonomy: readonly FoundationCategory[], group: FoundationCategory['group']): FoundationCategoryModel[] =>
  model.filter((c) => taxonomy.find((t) => t.id === c.id)?.group === group);
