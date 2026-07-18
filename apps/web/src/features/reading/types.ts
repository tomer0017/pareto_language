import type { LocalizedText } from '@ready/content-schema';

/**
 * Reading Mode — shared, collection-agnostic types.
 *
 * ONE reading system serves EVERY future collection (Beginner Stories, Easy Conversations, Travel
 * Articles, News, Recipes, …). A collection supplies only DATA in these shapes; the engine, UI,
 * playback, Foundation tap, quiz and progress are generic. Adding a collection is data-only.
 *
 * Language model mirrors the rest of READY: the LEARNING language (`en` canonical, `fr`, `es`) is the
 * target the learner reads/hears; the "native translation" is the learner's APP language (`en`/`he`),
 * carried once per sentence as {@link LocalizedText} and shared across the three learning languages
 * (the meaning is the same whichever target you read).
 */

/** The learning languages Reading ships in. English is the canonical source. */
export type ReadingLang = 'en' | 'fr' | 'es';
export const READING_LANGS: readonly ReadingLang[] = ['en', 'fr', 'es'] as const;

/** Difficulty band: 1 = A1 (5–10 sentences) · 2 = A1+ (10–20) · 3 = early A2 (20–35). */
export type ReadingLevel = 1 | 2 | 3;

/** How the reader shows the two languages. Persisted across sessions. */
export type ReadingMode = 'target' | 'bilingual' | 'hidden';

/** One sentence: the learning-language realization per language + the shared app-language meaning. */
export interface StorySentence {
  /** Target text keyed by learning language (`en` canonical). */
  target: Record<ReadingLang, string>;
  /** App-language meaning `{en,he}` — the "native translation", shared across learning languages. */
  tr: LocalizedText;
}

/** A comprehension question. All prompts/options are APP-language (test understanding, not grammar). */
export type QuizQuestion =
  | { kind: 'mc'; q: LocalizedText; options: LocalizedText[]; answer: number }
  | { kind: 'tf'; q: LocalizedText; answer: boolean }
  | { kind: 'order'; q: LocalizedText; items: LocalizedText[]; correct: number[] };

export interface Story {
  /** Stable id (used for progress, bookmarks, React keys). Unique within the app. */
  id: string;
  collectionId: string;
  level: ReadingLevel;
  /** Language-independent topic tags driving the vocabulary-reuse strategy. */
  topics: string[];
  title: { target: Record<ReadingLang, string>; tr: LocalizedText };
  sentences: StorySentence[];
  quiz: QuizQuestion[];
}

export interface ReadingCollection {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  emoji: string;
  stories: Story[];
}

/** Lightweight collection metadata (for the browse list) — no story bodies, so it stays cheap. */
export interface CollectionMeta {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  emoji: string;
  count: number;
  /** Loads the full collection on demand (code-split; keeps the bundle small + offline-cached). */
  load: () => Promise<ReadingCollection>;
}

/** A learner's answer to one quiz question (index for mc, boolean for tf, order array for order). */
export type QuizResponse = number | boolean | number[] | null;
