import type { SpeakOrderOverride } from '../../shared/playback/types.js';

/**
 * Listening modes — playback STRATEGIES over the same sentences (they never create content):
 *   - `tr-first`    : the app-language meaning, then the sentence (e.g. Hebrew → English)
 *   - `target-only` : the sentence alone
 *   - `target-first`: the sentence, then its meaning
 * Pure mapping to the shared engine's speak-order override, plus safe (de)serialisation.
 */
export type ListenMode = 'tr-first' | 'target-only' | 'target-first';

export const LISTEN_MODES: readonly ListenMode[] = ['tr-first', 'target-only', 'target-first'];
export const DEFAULT_LISTEN_MODE: ListenMode = 'tr-first';

export function speakOrderFor(mode: ListenMode): SpeakOrderOverride {
  switch (mode) {
    case 'tr-first': return { translation: true, translationFirst: true };
    case 'target-only': return { translation: false, translationFirst: false };
    case 'target-first': return { translation: true, translationFirst: false };
  }
}

export function parseListenMode(raw: unknown): ListenMode {
  return (LISTEN_MODES as readonly unknown[]).includes(raw) ? (raw as ListenMode) : DEFAULT_LISTEN_MODE;
}

const KEY = 'ready.listen.mode';

export function loadListenMode(): ListenMode {
  try {
    return parseListenMode(localStorage.getItem(KEY));
  } catch {
    return DEFAULT_LISTEN_MODE;
  }
}

export function saveListenMode(mode: ListenMode): void {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* ignore persistence failure */
  }
}
