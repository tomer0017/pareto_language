import type { LocalizedText } from '@ready/content-schema';

/**
 * Reusable learning-game infrastructure (Pareto UX sprint — Tasks 8 & 9).
 *
 * These games are deliberately generic so the same engine powers thousands of future words across
 * every language: a game takes a plain array of items (from mock data today, from the content pack
 * / Core 1500 tomorrow) and never hardcodes content. Architecture first — swap the data source
 * without touching a screen.
 */

/** One vocabulary atom a game can render. Emoji + word + translation is the minimum; audio and
 *  pronunciation are optional and degrade gracefully (TTS fills in when no recording exists). */
export interface GameWord {
  id: string;
  word: string;                 // the target-language word ("nose")
  translation: LocalizedText;   // learner-language meaning
  emoji: string;                // the picture (emoji today; image URL later via the same slot)
  pronunciation?: string;       // optional phonetic hint
  audio?: string;               // optional asset path; absent → TTS
}

/** A source of game words — mock arrays today, a content-pack/Core query tomorrow. One seam. */
export interface GameWordSource {
  id: string;
  title: LocalizedText;
  words(): GameWord[];
}
