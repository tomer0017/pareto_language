import type { LocalizedText } from '@ready/content-schema';
import type { QuizQuestion, ReadingLang, StorySentence } from './types.js';

/**
 * Terse authoring helpers so a story file reads like prose. Content-only — no logic. `en` is BOTH the
 * canonical English target AND the English meaning (an English sentence's meaning is itself), so a
 * sentence carries four strings: English, Hebrew (native gloss), French, Spanish.
 */

/** App-language meaning `{en,he}`. */
export const T = (en: string, he: string): LocalizedText => ({ en, he });

/** One story sentence: english, hebrew gloss, french, spanish. */
export function s(en: string, he: string, fr: string, es: string): StorySentence {
  return { target: { en, fr, es }, tr: { en, he } };
}

/** A story title in the four strings (same shape as a sentence's language content). */
export function title(en: string, he: string, fr: string, es: string): { target: Record<ReadingLang, string>; tr: LocalizedText } {
  return { target: { en, fr, es }, tr: { en, he } };
}

/** Multiple-choice comprehension question. */
export const mc = (q: LocalizedText, options: LocalizedText[], answer: number): QuizQuestion => ({ kind: 'mc', q, options, answer });
/** True/false comprehension question. */
export const tf = (q: LocalizedText, answer: boolean): QuizQuestion => ({ kind: 'tf', q, answer });
/** Ordering question: show `items`, learner must reproduce `correct` (indices into `items`). */
export const order = (q: LocalizedText, items: LocalizedText[], correct: number[]): QuizQuestion => ({ kind: 'order', q, items, correct });
