import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { sanitizeSettings, scopedSettings, scopeOwns, resolveBookmarkIndex, loadSettings, persistSettings, DEFAULT_SETTINGS, SCOPE_OWNS } from './preferences.js';
import type { PlaybackItem, PlaybackScope, PlaybackSettings } from './types.js';

describe('sanitizeSettings', () => {
  it('restores a fully valid settings object unchanged', () => {
    const valid = { repeat: 3, order: 'random', translation: false, loop: true, pause: 'long', sleepTimer: 30 };
    expect(sanitizeSettings(valid)).toEqual(valid);
  });

  it('has no speed setting — a stored legacy "speed" is dropped, never restored', () => {
    expect('speed' in DEFAULT_SETTINGS).toBe(false);
    expect('speed' in sanitizeSettings({ speed: 0.5, repeat: 2 })).toBe(false);
  });

  it('falls back to defaults for every invalid field', () => {
    const bad = { repeat: 7, order: 'sideways', translation: 'nope', loop: 'yes', pause: 'huge', sleepTimer: 99 };
    expect(sanitizeSettings(bad)).toEqual({
      repeat: 1, order: 'sequential', translation: true, loop: false, pause: 'normal', sleepTimer: 0,
    });
  });

  it('does NOT carry a translationFirst field (Reading owns its order, not the shared prefs)', () => {
    expect('translationFirst' in sanitizeSettings({ translationFirst: true })).toBe(false);
  });

  it('treats a non-object (null / string / number) as all-defaults', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings('garbage')).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings(42)).toEqual(DEFAULT_SETTINGS);
  });

  it('defaults translation ON when the field is missing', () => {
    expect(sanitizeSettings({ repeat: 2 }).translation).toBe(true);
  });
});

describe('per-surface preferences (a surface keeps only what its screen exposes)', () => {
  const store = new Map<string, string>();
  let prev: unknown;
  beforeEach(() => {
    store.clear();
    prev = (globalThis as { localStorage?: unknown }).localStorage;
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
  });
  afterEach(() => { (globalThis as { localStorage?: unknown }).localStorage = prev; });

  const everything: PlaybackSettings = { repeat: 3, order: 'random', translation: false, loop: true, pause: 'long', sleepTimer: 30 };
  const scopes = Object.keys(SCOPE_OWNS) as PlaybackScope[];

  it('persists and restores a surface\'s own options across a reload', () => {
    persistSettings('transcript', everything);
    expect(loadSettings('transcript')).toEqual(everything);
  });

  it('each surface has its own storage key — none of them the old shared one', () => {
    for (const scope of scopes) persistSettings(scope, everything);
    expect([...store.keys()].sort()).toEqual(scopes.map((s) => 'ready.playback.' + s).sort());
    expect(store.has('ready.parrot.settings')).toBe(false);
  });

  it('ignores the pre-scoping shared record entirely (that record WAS the leak)', () => {
    store.set('ready.parrot.settings', JSON.stringify({ ...everything, speed: 0.5 }));
    for (const scope of scopes) expect(loadSettings(scope)).toEqual(DEFAULT_SETTINGS);
  });

  it('a surface never keeps an option it does not expose', () => {
    for (const scope of scopes) {
      const kept = scopedSettings(scope, everything);
      for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof PlaybackSettings)[]) {
        expect(kept[key], `${scope}.${key}`).toBe(scopeOwns(scope, key) ? everything[key] : DEFAULT_SETTINGS[key]);
      }
      persistSettings(scope, everything);
      expect(loadSettings(scope), scope).toEqual(kept);
    }
  });

  it('the story reader owns no engine option at all: always one pass, once per sentence, in order', () => {
    expect(SCOPE_OWNS.story).toEqual([]);
    store.set('ready.playback.story', JSON.stringify(everything)); // even a tampered record
    expect(loadSettings('story')).toEqual(DEFAULT_SETTINGS);
  });

  it('Listen owns repeats, non-stop, shuffle and its quick-listen timer — not translation or pauses', () => {
    expect([...SCOPE_OWNS.listen].sort()).toEqual(['loop', 'order', 'repeat', 'sleepTimer']);
  });
});

describe('resolveBookmarkIndex', () => {
  const items: PlaybackItem[] = [
    { id: 'a', target: 'A', targetLang: 'fr' },
    { id: 'b', target: 'B', targetLang: 'fr' },
    { id: 'c', target: 'C', targetLang: 'fr' },
  ];

  it('resolves a saved id to its CURRENT index (by id, not position)', () => {
    expect(resolveBookmarkIndex(items, 'c')).toBe(2);
    // reordering keeps the bookmark pointing at the same item
    const reordered = [items[2]!, items[0]!, items[1]!];
    expect(resolveBookmarkIndex(reordered, 'c')).toBe(0);
  });

  it('falls back to the first item for a missing / unknown / empty case', () => {
    expect(resolveBookmarkIndex(items, 'gone')).toBe(0);
    expect(resolveBookmarkIndex(items, null)).toBe(0);
    expect(resolveBookmarkIndex([], 'a')).toBe(0);
  });
});
