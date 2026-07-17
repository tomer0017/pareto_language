/**
 * Universal Listen Mode ("Parrot Mode") — shared public types.
 *
 * ONE playback architecture serves every learning surface (Core Words, Core Sentences, Dialogue
 * Transcript, and any future screen). A screen provides only a list of {@link PlaybackItem}; the
 * engine ({@link useParrotPlayback}) owns ALL playback behaviour. Nothing here knows about Bootcamp,
 * Core, dialogues or any specific screen — that decoupling is what lets a new surface reuse the
 * engine with zero changes.
 */

/** How many times each item is spoken before advancing. */
export type RepeatCount = 1 | 2 | 3;

/** Item order: play in the given order, or a shuffled order. */
export type PlaybackOrder = 'sequential' | 'random';

/** Idle (never started / finished), actively speaking, or paused mid-session (resumable). */
export type PlaybackStatus = 'idle' | 'playing' | 'paused';

/**
 * One thing to listen to. Language-agnostic: `target` is the learning-language surface and
 * `translation` (optional) is its meaning in the learner's app language, each with an explicit TTS
 * locale so the engine never re-derives voices. `emoji`/`id` are display/keying only.
 */
export interface PlaybackItem {
  /** Stable id (used for React keys and resume identity). */
  id: string;
  /** Target-language text spoken first. */
  target: string;
  /** TTS locale for the target (the learning language). */
  targetLang: string;
  /** Optional translation, spoken when Translation is ON. */
  translation?: string;
  /** TTS locale for the translation (the app language); defaults to `targetLang`. */
  translationLang?: string;
  /** Optional icon for the "now playing" card. */
  emoji?: string;
}

/** User-controlled playback preferences (shared + persisted across every surface). */
export interface PlaybackSettings {
  repeat: RepeatCount;
  order: PlaybackOrder;
  /** When true, each item's translation is spoken after the target. */
  translation: boolean;
}
