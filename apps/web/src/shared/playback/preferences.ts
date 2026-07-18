import type { PlaybackItem, PlaybackSettings } from './types.js';

/**
 * Parrot Mode persistence — shared preferences + per-surface listening bookmarks.
 *
 * All persistence goes through the existing localStorage convention (the same one `tts.ts` uses for
 * the global speech rate); no new state library. The PURE `sanitizeSettings` / `resolveBookmarkIndex`
 * functions carry every validation rule and are unit-tested without a DOM. "Currently playing" is
 * never stored — playback must not auto-start after a refresh.
 */

const SETTINGS_KEY = 'ready.parrot.settings';
const BOOKMARK_PREFIX = 'ready.parrot.bookmark.';

export const DEFAULT_SETTINGS: PlaybackSettings = {
  repeat: 1,
  order: 'sequential',
  translation: true,
  loop: false,
  speed: 1,
  pause: 'normal',
  sleepTimer: 0,
};

/** Validate an untrusted (possibly partial/corrupt) settings object, filling gaps with defaults. */
export function sanitizeSettings(raw: unknown): PlaybackSettings {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    repeat: o.repeat === 2 || o.repeat === 3 ? o.repeat : 1,
    order: o.order === 'random' ? 'random' : 'sequential',
    translation: o.translation !== false, // default ON
    loop: o.loop === true,
    speed: o.speed === 0.5 || o.speed === 0.75 || o.speed === 1.25 ? o.speed : 1,
    pause: o.pause === 'short' || o.pause === 'long' ? o.pause : 'normal',
    sleepTimer: o.sleepTimer === 10 || o.sleepTimer === 15 || o.sleepTimer === 30 || o.sleepTimer === 60 ? o.sleepTimer : 0,
  };
}

/** Load settings from storage, always returning a valid object (defaults on miss/corruption/SSR). */
export function loadSettings(): PlaybackSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? sanitizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Persist settings; never throws (private mode / SSR safe). */
export function persistSettings(s: PlaybackSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore persistence failure */
  }
}

/** Read the saved item id for a surface, or null. */
export function loadBookmark(key: string): string | null {
  try {
    return localStorage.getItem(BOOKMARK_PREFIX + key);
  } catch {
    return null;
  }
}

/** Save the focused item id for a surface; never throws. */
export function saveBookmark(key: string, itemId: string): void {
  try {
    localStorage.setItem(BOOKMARK_PREFIX + key, itemId);
  } catch {
    /* ignore */
  }
}

/**
 * Resolve a saved bookmark id to an index in the CURRENT items, matching by stable id (not position)
 * so reordering never corrupts the bookmark. Falls back to the first item (0) when the id is missing,
 * unknown, or the list is empty.
 */
export function resolveBookmarkIndex(items: readonly PlaybackItem[], savedId: string | null): number {
  if (!savedId || items.length === 0) return 0;
  const idx = items.findIndex((it) => it.id === savedId);
  return idx >= 0 ? idx : 0;
}
