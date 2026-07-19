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

/** Idle (never started), actively speaking, paused mid-session (resumable), or finished the list. */
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

/** TTS rate multiplier for Parrot Mode (relative to the global speech-speed preference). `0.5×` lets
 *  a beginner slow every spoken sentence right down; `1×` is the default. */
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25;

/** Named silence length between spoken parts — mapped to concrete ms in `playbackPlan.ts`. */
export type PauseDuration = 'short' | 'normal' | 'long';

/** Sleep-timer selection in minutes; `0` means Off. */
export type SleepTimerMinutes = 0 | 10 | 15 | 30 | 60;

/**
 * One thing to listen to. Language-agnostic: `target` is the learning-language surface and
 * `translation` (optional) is its meaning in the learner's app language, each with an explicit TTS
 * locale so the engine never re-derives voices. `emoji` is display-only; `id` is the stable identity
 * used for React keys AND the listening-position bookmark (never an array index).
 */
export interface PlaybackItem {
  /** Stable id (used for React keys and resume/bookmark identity). */
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

/**
 * A per-surface listening-order OVERRIDE (not a shared/persisted preference). A surface that owns its
 * own translation-order UI (Reading) passes this so it controls whether — and in which order — the
 * translation is spoken WITHOUT touching the global `translation` preference other Parrot surfaces
 * share. When omitted, the shared `settings.translation` (target → translation) is used. Speed, pause,
 * repeat and loop always stay global.
 */
export interface SpeakOrderOverride {
  /** Whether the translation is spoken at all (false = target only). */
  translation: boolean;
  /** When true (and `translation` is on), speak the translation BEFORE the target. */
  translationFirst: boolean;
}

/**
 * User-controlled playback preferences — shared across every surface and persisted locally. The
 * "currently playing" state is deliberately NOT here (never auto-starts after a refresh).
 */
export interface PlaybackSettings {
  repeat: RepeatCount;
  order: PlaybackOrder;
  /** When true, each item's translation is spoken after the target. */
  translation: boolean;
  /** When true, playback starts a fresh cycle after the last item instead of finishing. */
  loop: boolean;
  /** Playback speed applied to both target and translation utterances. */
  speed: PlaybackSpeed;
  /** Silence length between spoken parts. */
  pause: PauseDuration;
  /** Sleep-timer selection (minutes; `0` = off). Persisted; the running countdown is not. */
  sleepTimer: SleepTimerMinutes;
}
