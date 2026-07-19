import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { READING_COLLECTIONS } from './collections.js';
import { buildStoryItems, collectionParity, isCorrect, readingTimeMin, scoreQuiz, storyParityIssues } from './readingCore.js';
import { nextStreak, useReadingStore } from './readingStore.js';
import { READING_LANGS, type ReadingCollection } from './types.js';

/** In-memory localStorage so the reading store's persist/load run under the headless node env. */
function installStorage(): Map<string, string> {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  return store;
}

let collection: ReadingCollection;

describe('Reading — Beginner Stories collection', () => {
  it('lazy-loads the collection through the registry', async () => {
    collection = await READING_COLLECTIONS[0]!.load();
    expect(collection.id).toBe('beginner-stories');
    expect(collection.stories.length).toBe(15);
    // browse metadata count stays in sync with the loaded bodies
    expect(READING_COLLECTIONS[0]!.count).toBe(collection.stories.length);
  });

  it('has unique story ids and 3–5 quiz questions each', () => {
    const ids = collection.stories.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of collection.stories) {
      expect(s.quiz.length).toBeGreaterThanOrEqual(3);
      expect(s.quiz.length).toBeLessThanOrEqual(5);
    }
  });

  it('covers every level band and respects the sentence-count ranges', () => {
    const RANGES: Record<1 | 2 | 3, [number, number]> = { 1: [5, 10], 2: [10, 20], 3: [20, 35] };
    const byLevel: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 };
    for (const s of collection.stories) {
      byLevel[s.level] += 1;
      const n = s.sentences.length;
      const [lo, hi] = RANGES[s.level];
      expect(n).toBeGreaterThanOrEqual(lo);
      expect(n).toBeLessThanOrEqual(hi);
    }
    expect(byLevel[1]).toBeGreaterThan(0);
    expect(byLevel[2]).toBeGreaterThan(0);
    expect(byLevel[3]).toBeGreaterThan(0);
    expect(byLevel[1] + byLevel[2] + byLevel[3]).toBe(15);
  });
});

describe('Reading — language parity (EN/FR/ES + he gloss)', () => {
  it('every story is complete in all three learning languages and both glosses', () => {
    const report = collectionParity(collection);
    expect(report.issues).toEqual({});
    expect(report.complete).toBe(true);
    expect(report.ok).toBe(report.total);
  });

  it('flags a story with a missing target', () => {
    const broken = { ...collection.stories[0]!, sentences: [{ target: { en: 'x', fr: '', es: 'y' }, tr: { en: 'x', he: 'ש' } }] };
    expect(storyParityIssues(broken).some((p) => p.includes('missing fr'))).toBe(true);
  });
});

describe('Reading — playback items + language switching (shared engine contract)', () => {
  it('builds one PlaybackItem per sentence with the target in the learning language', () => {
    const story = collection.stories[0]!;
    for (const lang of READING_LANGS) {
      const items = buildStoryItems(story, lang, 'he');
      expect(items.length).toBe(story.sentences.length);
      expect(items[0]!.target).toBe(story.sentences[0]!.target[lang]);
      expect(items[0]!.targetLang).toBe(lang); // Universal Tap + TTS key on this
      expect(items[0]!.id).toBe('0');
    }
  });

  it('uses the app language for the translation (native gloss)', () => {
    const story = collection.stories[0]!;
    expect(buildStoryItems(story, 'fr', 'he')[0]!.translation).toBe(story.sentences[0]!.tr.he);
    expect(buildStoryItems(story, 'fr', 'en')[0]!.translation).toBe(story.sentences[0]!.tr.en);
  });

  it('estimates a non-zero reading time per language', () => {
    for (const lang of READING_LANGS) expect(readingTimeMin(collection.stories[0]!, lang)).toBeGreaterThanOrEqual(1);
  });
});

describe('Reading — quiz scoring (comprehension)', () => {
  const story = () => collection.stories[0]!;

  it('scores a perfect quiz 100% and passing', () => {
    const answers = story().quiz.map((q) => (q.kind === 'tf' ? q.answer : q.kind === 'mc' ? q.answer : q.correct));
    const r = scoreQuiz(story().quiz, answers);
    expect(r.correct).toBe(r.total);
    expect(r.pct).toBe(100);
    expect(r.passed).toBe(true);
  });

  it('scores an all-wrong / unanswered quiz 0% and failing', () => {
    const nulls = story().quiz.map(() => null);
    const r = scoreQuiz(story().quiz, nulls);
    expect(r.correct).toBe(0);
    expect(r.pct).toBe(0);
    expect(r.passed).toBe(false);
  });

  it('marks individual mc / tf responses correctly', () => {
    expect(isCorrect({ kind: 'mc', q: { en: '', he: '' }, options: [], answer: 1 }, 1)).toBe(true);
    expect(isCorrect({ kind: 'mc', q: { en: '', he: '' }, options: [], answer: 1 }, 0)).toBe(false);
    expect(isCorrect({ kind: 'tf', q: { en: '', he: '' }, answer: false }, false)).toBe(true);
    expect(isCorrect({ kind: 'order', q: { en: '', he: '' }, items: [], correct: [0, 1, 2] }, [0, 1, 2])).toBe(true);
    expect(isCorrect({ kind: 'order', q: { en: '', he: '' }, items: [], correct: [0, 1, 2] }, [0, 2, 1])).toBe(false);
  });
});

describe('Reading — streak transitions (pure)', () => {
  it('keeps same-day, +1 the next day, resets on a gap', () => {
    expect(nextStreak({ count: 3, lastDay: '2026-07-18' }, '2026-07-18')).toEqual({ count: 3, lastDay: '2026-07-18' });
    expect(nextStreak({ count: 3, lastDay: '2026-07-18' }, '2026-07-19')).toEqual({ count: 4, lastDay: '2026-07-19' });
    expect(nextStreak({ count: 3, lastDay: '2026-07-18' }, '2026-07-21')).toEqual({ count: 1, lastDay: '2026-07-21' });
    expect(nextStreak({ count: 0, lastDay: null }, '2026-07-18')).toEqual({ count: 1, lastDay: '2026-07-18' });
  });
});

describe('Reading — progress store (mode, resume, completion, persistence)', () => {
  let storage: Map<string, string>;
  beforeEach(() => {
    storage = installStorage();
    useReadingStore.setState({ mode: 'bilingual', playback: 'target-tr', stories: {}, streak: { count: 0, lastDay: null } });
  });
  afterEach(() => { delete (globalThis as { localStorage?: unknown }).localStorage; });

  it('persists the preferred reading mode', () => {
    useReadingStore.getState().setMode('hidden');
    expect(useReadingStore.getState().mode).toBe('hidden');
    expect(JSON.parse(storage.get('ready.reading.v1')!).mode).toBe('hidden');
  });

  it('persists the Reading-only voice order (target / target→tr / tr→target) separately from shared prefs', () => {
    useReadingStore.getState().setPlayback('tr-target');
    expect(useReadingStore.getState().playback).toBe('tr-target');
    const saved = JSON.parse(storage.get('ready.reading.v1')!);
    expect(saved.playback).toBe('tr-target');
    // it lives in the reading key, NOT the shared parrot-settings key
    expect(storage.get('ready.parrot.settings')).toBeUndefined();
  });

  it('saves the resume position forward-only', () => {
    const st = useReadingStore.getState();
    st.savePosition('bs-the-park', 4);
    expect(useReadingStore.getState().progressFor('bs-the-park').pos).toBe(4);
    st.savePosition('bs-the-park', 2); // regressions ignored
    expect(useReadingStore.getState().progressFor('bs-the-park').pos).toBe(4);
  });

  it('completes a story with a quiz score and bumps the streak once, persisting all of it', () => {
    const st = useReadingStore.getState();
    st.completeStory('bs-little-apple', 80);
    const s = useReadingStore.getState();
    expect(s.progressFor('bs-little-apple').done).toBe(true);
    expect(s.progressFor('bs-little-apple').score).toBe(80);
    expect(s.completedCount()).toBe(1);
    expect(s.streak.count).toBe(1);
    // keeps the BEST score; completing again the same day does not double the streak
    s.completeStory('bs-little-apple', 60);
    expect(useReadingStore.getState().progressFor('bs-little-apple').score).toBe(80);
    expect(useReadingStore.getState().streak.count).toBe(1);
    // durably persisted
    const saved = JSON.parse(storage.get('ready.reading.v1')!);
    expect(saved.stories['bs-little-apple'].done).toBe(true);
  });
});
