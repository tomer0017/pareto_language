import { describe, it, expect } from 'vitest';
import { sanitizeSettings, resolveBookmarkIndex, loadSettings, persistSettings, DEFAULT_SETTINGS } from './preferences.js';
import type { PlaybackItem, PlaybackSpeed } from './types.js';

describe('sanitizeSettings', () => {
  it('restores a fully valid settings object unchanged', () => {
    const valid = { repeat: 3, order: 'random', translation: false, loop: true, speed: 1.25, pause: 'long', sleepTimer: 30 };
    expect(sanitizeSettings(valid)).toEqual(valid);
  });

  it('accepts every supported speed option (0.5× / 0.75× / 1× / 1.25×) and defaults to 1×', () => {
    for (const speed of [0.5, 0.75, 1, 1.25] as PlaybackSpeed[]) {
      expect(sanitizeSettings({ speed }).speed).toBe(speed);
    }
    // the default remains 1× when the field is missing or invalid
    expect(sanitizeSettings({}).speed).toBe(1);
    expect(sanitizeSettings({ speed: 0.6 }).speed).toBe(1);
    expect(sanitizeSettings({ speed: 2 }).speed).toBe(1);
  });

  it('persists and restores the new 0.5× speed across a reload (shared preferences)', () => {
    // Exercise the real persist→load path over an in-memory localStorage (node env has no DOM).
    const store = new Map<string, string>();
    const prev = (globalThis as { localStorage?: Storage }).localStorage;
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    try {
      persistSettings({ ...DEFAULT_SETTINGS, speed: 0.5 });
      expect(loadSettings().speed).toBe(0.5); // survives refresh via the shared localStorage key
    } finally {
      (globalThis as { localStorage?: unknown }).localStorage = prev;
    }
  });

  it('falls back to defaults for every invalid field', () => {
    const bad = { repeat: 7, order: 'sideways', translation: 'nope', loop: 'yes', speed: 2, pause: 'huge', sleepTimer: 99 };
    expect(sanitizeSettings(bad)).toEqual({
      repeat: 1, order: 'sequential', translation: true, loop: false, speed: 1, pause: 'normal', sleepTimer: 0,
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
