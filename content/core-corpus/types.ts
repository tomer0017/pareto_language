import type { PartOfSpeech } from '@ready/content-schema';

/**
 * READY Core Corpus — authored-row model (Core 500).
 *
 * One authored row = one language-INDEPENDENT concept plus its realizations. The row is the
 * compact authoring surface; `corpus.ts` expands it into a full canonical `Concept` (schema
 * fields, ROL scorecard, ranks) and into per-language offline packs. Nothing downstream reads
 * these rows directly — only the derived artifacts.
 *
 * Language model (the invariant that makes French content-only):
 *  - `gloss` languages (UI languages a learner reads meanings in): en + he today.
 *  - Realization languages (languages a traveler LEARNS): declared in DECLARED_LANGS.
 *    `en` realizes from the `en` field; every other language realizes from `t[lang]`.
 *    Adding French = add 'fr' to DECLARED_LANGS + fill `t.fr` on every row. Zero code.
 */

/** Realization languages the corpus currently ships. Adding a language starts here (content). */
export const DECLARED_LANGS = ['en'] as const;

/** Corpus target size — the validator enforces exactly this many concepts. */
export const CORPUS_SIZE = 500;

export const CORE_CORPUS_VERSION = '2.0.0';

/**
 * Future-proof category taxonomy (language-independent semantic domains). Categories drive
 * situation links, browse grouping, distractor pools and score baselines — never game logic.
 */
export const CATEGORIES = [
  'glue',        // conversation glue: yes/no/thanks/sounds-good — the never-freeze set
  'questions',   // question words + how-much etc.
  'pronouns',    // I/you/this/that/my/your
  'numbers',     // non-compositional number atoms (21–99 are generator-drilled, never stored)
  'time',        // now/today/hour/days
  'colors',
  'people',      // people + family
  'body',
  'food',
  'places',
  'transport',
  'directions',
  'money',       // money + shopping
  'objects',
  'clothing',
  'home',        // room/accommodation vocabulary
  'technology',
  'health',
  'emergency',
  'weather',
  'nature',
  'animals',
  'activities',
  'actions',     // survival verbs
  'descriptions',// core adjectives/adverbs
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Layer = 1 | 2 | 3 | 4; // Survive · Transact · Adapt · Connect (methodology B-005)

export interface CorpusRow {
  /** Unique kebab slug → concept.{kind}.{slug} and {lang}.{kind}.{slug}. NEVER changes. */
  slug: string;
  /** Concept kind; defaults to 'word'. */
  kind?: 'word' | 'phrase' | 'number' | 'reply';
  pos: PartOfSpeech;
  /** English realization (surface form; also the en gloss for the pilot). */
  en: string;
  /** Hebrew gloss — the MEANING in the learner's UI language (not a realization). */
  he: string;
  cat: Category;
  layer: Layer;
  /** Return on Failure 1–3 — what breaks without it (3 = safety/health/legal). */
  rof: 1 | 2 | 3;
  skill: 'recognize' | 'recall' | 'fluent';
  /** Phrase/reply concepts: communicative role. */
  role?: 'say' | 'hear' | 'recovery';
  /**
   * Scorecard, 1–5 integers: [frequency, communication (say), recognition (hear), coverage
   * (distinct conversation types served), travel]. Expert-calibrated estimates informed by
   * spoken-frequency lists (SUBTLEX/COCA), Oxford 3000 / CEFR A-levels and travel-domain
   * coverage — refined later by cohort telemetry (docs/CORPUS-METHODOLOGY.md §6).
   */
  s: [number, number, number, number, number];
  /** Unique emoji when the meaning reads unambiguously as a picture (games eligibility). */
  emoji?: string;
  /** Visual confidence 0–1 — required when emoji is present. */
  vis?: number;
  /** Example sentence (en) + Hebrew translation. */
  ex: string;
  exHe: string;
  /** Alternate surface forms a traveler may hear ("restroom", "cab"). */
  alias?: string[];
  /** Related concept slugs (must exist in the corpus). */
  rel?: string[];
  /** Opposite concept slugs (must exist in the corpus). */
  opp?: string[];
  /** Additional language realizations, keyed by declared language code (e.g. fr, es). */
  t?: Record<string, string>;
}
