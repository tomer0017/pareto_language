import type { ContentItem } from '@ready/content-schema';

/**
 * TTS / audio integration point (PDF §7.4, §11.3, mission M1 step 5).
 *
 * Audio is "audio-first": every item ships with an asset path. The content pipeline assigns those
 * paths deterministically from the item id. At runtime an {@link AudioResolver} turns a path into a
 * playable source; the in-browser fallback is the Web Speech API `speechSynthesis` (implemented in
 * the web app), so the product is fully usable today with a clean swap path to real recordings
 * later — replacing a TTS asset with a native recording is a pipeline change, not a client change.
 */

/** Deterministic asset path for an item's audio, e.g. "audio/it-IT/it.phrase.restaurant.bill.mp3". */
export function audioPathFor(lang: string, itemId: string, speed: 'natural' | 'slow' = 'natural'): string {
  const suffix = speed === 'slow' ? '.slow' : '';
  return `audio/${lang}/${itemId}${suffix}.mp3`;
}

/** Attach a natural audio ref to an item using the path convention. */
export function withAudio(item: Omit<ContentItem, 'audio'>, lang: string): ContentItem {
  return { ...item, audio: { natural: audioPathFor(lang, item.id, 'natural') } };
}

/**
 * Runtime contract implemented by the web app. `resolve` returns a URL for a pre-generated audio
 * asset, or null if none exists (caller then falls back to `speak`).
 */
export interface AudioResolver {
  resolve(path: string): Promise<string | null>;
}

/** The synthesis fallback contract — implemented over Web Speech API in the browser. */
export interface TtsProvider {
  /** Speak target-language text now. Resolves when playback ends (or rejects on failure). */
  speak(text: string, opts?: { lang?: string; rate?: number }): Promise<void>;
  /** Whether synthesis is available in this environment. */
  isAvailable(): boolean;
}
