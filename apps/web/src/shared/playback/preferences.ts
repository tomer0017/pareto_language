import type { PlaybackItem, PlaybackScope, PlaybackSettings } from './types.js';

/**
 * Playback persistence — per-surface preferences + per-surface listening bookmarks.
 *
 * OWNERSHIP RULE: a playback option must never affect a screen where the learner cannot see or
 * change it. So preferences are stored PER SCOPE, and each scope may only keep the options its own
 * screen exposes (`SCOPE_OWNS`); everything else is always the default there. The one deliberately
 * GLOBAL audio preference — speech rate — is not a playback setting at all: it lives in
 * `shared/audio/tts` (Profile) and the TTS layer applies it to every utterance.
 *
 *   global      speech rate                                   (tts.ts, `ready.speechRate`)
 *   listen      repeats · non-stop · shuffle · quick-listen timer   (+ its mode in `listenMode.ts`)
 *   story       nothing here — reading mode + voice order live in the Reading store
 *   transcript  repeats · translation · order · loop · pause · sleep timer
 *   words       repeats · translation · order · loop · pause · sleep timer
 *
 * All persistence goes through localStorage; the PURE `sanitizeSettings` / `scopedSettings` /
 * `resolveBookmarkIndex` functions carry every rule and are unit-tested without a DOM. "Currently
 * playing" is never stored — playback must not auto-start after a refresh. (The pre-scoping shared
 * key `ready.parrot.settings` is no longer read: it is exactly the leak this replaces.)
 */

const SETTINGS_PREFIX = 'ready.playback.';
const settingsKey = (scope: PlaybackScope): string => SETTINGS_PREFIX + scope;

type SettingKey = keyof PlaybackSettings;
const CONTROLS_PANEL: readonly SettingKey[] = ['repeat', 'translation', 'order', 'loop', 'pause', 'sleepTimer'];

/** The options each surface exposes — the ONLY ones it may change or remember. */
export const SCOPE_OWNS: Record<PlaybackScope, readonly SettingKey[]> = {
  listen: ['repeat', 'loop', 'order', 'sleepTimer'],
  story: [],
  transcript: CONTROLS_PANEL,
  words: CONTROLS_PANEL,
};
const BOOKMARK_PREFIX = 'ready.parrot.bookmark.';

export const DEFAULT_SETTINGS: PlaybackSettings = {
  repeat: 1,
  order: 'sequential',
  translation: true,
  loop: false,
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
    pause: o.pause === 'short' || o.pause === 'long' ? o.pause : 'normal',
    sleepTimer: o.sleepTimer === 10 || o.sleepTimer === 15 || o.sleepTimer === 30 || o.sleepTimer === 60 ? o.sleepTimer : 0,
  };
}

/** Keep only what `scope` owns; every other option is forced to its default. Pure. */
export function scopedSettings(scope: PlaybackScope, s: PlaybackSettings): PlaybackSettings {
  const out: PlaybackSettings = { ...DEFAULT_SETTINGS };
  const write = out as unknown as Record<SettingKey, unknown>;
  for (const key of SCOPE_OWNS[scope]) write[key] = s[key];
  return out;
}

/** Whether a surface may change an option (i.e. its screen exposes it). */
export function scopeOwns(scope: PlaybackScope, key: SettingKey): boolean {
  return SCOPE_OWNS[scope].includes(key);
}

/** Load a surface's settings, always returning a valid object (defaults on miss/corruption/SSR). */
export function loadSettings(scope: PlaybackScope): PlaybackSettings {
  try {
    const raw = localStorage.getItem(settingsKey(scope));
    return raw ? scopedSettings(scope, sanitizeSettings(JSON.parse(raw))) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Persist a surface's settings (only what it owns); never throws (private mode / SSR safe). */
export function persistSettings(scope: PlaybackScope, s: PlaybackSettings): void {
  try {
    localStorage.setItem(settingsKey(scope), JSON.stringify(scopedSettings(scope, s)));
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
