import type { StringKey } from '../../shared/i18n/strings.js';

/**
 * Foundation taxonomy — the ONLY place Foundation categories are declared.
 *
 * The Foundation surface is a data-driven VIEW over the Core Corpus (the same per-language packs
 * that power Core Words / the games). It never duplicates content: a category is a *selector* over
 * corpus concepts, expressed on the language-INDEPENDENT fields — `category`, `pos` and
 * `conceptId` are identical across `core-en` / `core-fr` / any future pack; only the surface word
 * differs. So adding a language is zero code, and adding/retuning a category is one entry here.
 *
 * Selector semantics (see `matchesCategory` in `foundationContent.ts`):
 *   a word belongs to a category iff
 *     (word.category ∈ corpusCategories  OR  word.conceptId ∈ conceptIds)
 *     AND (pos is empty OR word.pos ∈ pos)
 *     AND word.conceptId ∉ excludeConceptIds
 *
 * As the corpus grows from hundreds to thousands, category-based selectors auto-absorb the new
 * words with no UI or architecture change — the Pareto "building blocks" surface just gets richer.
 */
export interface FoundationCategory {
  /** Stable category id (also its React key / analytics slug). */
  id: string;
  /** Emoji shown on the category card. */
  icon: string;
  /** i18n key for the category title (en + he in `strings.ts`). */
  titleKey: StringKey;
  /** Display order in the sheet. */
  order: number;
  /** Corpus categories that feed this Foundation category (the auto-growing primary selector). */
  corpusCategories?: string[];
  /** Explicit concept ids to include — for Foundation categories that span corpus categories. */
  conceptIds?: string[];
  /** Restrict to these parts of speech (language-independent). Empty = any. */
  pos?: string[];
  /** Concept ids to exclude (e.g. keep a word in exactly one Foundation category). */
  excludeConceptIds?: string[];
}

/**
 * The Foundation categories, mapped onto real Core Corpus fields (verified against
 * `core-en.v1.json` / `core-fr.v1.json`, 511 concepts, 25 categories):
 *
 *  - People            → `pronouns`
 *  - Question Words    → `questions`
 *  - Connectors        → `glue` restricted to conjunctions/prepositions (and/or/with/without…)
 *  - Position & Dir.   → `directions` (here/there/left/right/up/down)
 *  - Essential Verbs   → `actions` restricted to verbs
 *  - Colors            → `colors`
 *  - Numbers           → `numbers`   (reuses existing content, per spec)
 *  - Time              → `time`
 *  - Quantity          → explicit amount concepts (more/less/enough/full/empty)
 *  - Quick Responses   → `glue` restricted to interjections/phrases (yes/no/please/thanks…)
 *
 * `glue` is partitioned by `pos` so a word lands in exactly one of Connectors / Quick Responses.
 */
export const FOUNDATION_TAXONOMY: readonly FoundationCategory[] = [
  { id: 'people', icon: '👤', titleKey: 'foundationCatPeople', order: 1, corpusCategories: ['pronouns'] },
  { id: 'questions', icon: '❓', titleKey: 'foundationCatQuestions', order: 2, corpusCategories: ['questions'] },
  { id: 'connectors', icon: '🔗', titleKey: 'foundationCatConnectors', order: 3, corpusCategories: ['glue'], pos: ['conj', 'prep'] },
  { id: 'position', icon: '📍', titleKey: 'foundationCatPosition', order: 4, corpusCategories: ['directions'] },
  { id: 'verbs', icon: '⚡', titleKey: 'foundationCatVerbs', order: 5, corpusCategories: ['actions'], pos: ['verb'] },
  { id: 'colors', icon: '🎨', titleKey: 'foundationCatColors', order: 6, corpusCategories: ['colors'] },
  { id: 'numbers', icon: '🔢', titleKey: 'foundationCatNumbers', order: 7, corpusCategories: ['numbers'] },
  { id: 'time', icon: '🕒', titleKey: 'foundationCatTime', order: 8, corpusCategories: ['time'] },
  {
    id: 'quantity',
    icon: '📏',
    titleKey: 'foundationCatQuantity',
    order: 9,
    conceptIds: ['concept.word.more', 'concept.word.less', 'concept.word.enough', 'concept.word.full', 'concept.word.empty'],
  },
  {
    id: 'responses',
    icon: '✅',
    titleKey: 'foundationCatResponses',
    order: 10,
    corpusCategories: ['glue'],
    pos: ['interj', 'phrase'],
    // `enough` (glue/interj) belongs to Quantity — keep every concept in exactly one category so
    // progress totals never double-count.
    excludeConceptIds: ['concept.word.enough'],
  },
] as const;
