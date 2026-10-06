import { beforeAll, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type * as AppModule from '../../shared/stores/appStore.js';
import type * as FoundationModule from './foundationStore.js';
import type * as BootcampModule from '../bootcamp/bootcampStore.js';
import type * as ReadingModule from '../reading/readingStore.js';

/**
 * THE PROGRESS RULE: learning progress belongs to the language being learned. Looking at "red" in
 * English says nothing about "rojo"; finishing Mission 01 in English leaves French Mission 01
 * untouched; the interface language plays no part. Preferences (theme, app language, speech rate,
 * reading mode) stay shared.
 */
const src = (p: string): string => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8');

describe('progress is scoped per learning language', () => {
  const disk = new Map<string, string>();
  let app: typeof AppModule;
  let foundation: typeof FoundationModule;
  let bootcamp: typeof BootcampModule;
  let reading: typeof ReadingModule;

  beforeAll(async () => {
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    // A learner who used the app BEFORE progress was scoped: the old global Foundation sets and the
    // old unscoped reading progress, saved while learning English.
    disk.set('ready.lang', 'en');
    disk.set('ready.foundation.viewed', JSON.stringify(['concept.word.red', 'concept.word.blue']));
    disk.set('ready.foundation.dismissed', JSON.stringify(['concept.word.and']));
    disk.set('ready.reading.v1', JSON.stringify({ mode: 'hidden', playback: 'target', stories: { 'bs-the-park': { pos: 3, done: true, score: 80 } }, streak: { count: 2, lastDay: '2026-10-01' } }));
    app = await import('../../shared/stores/appStore.js');
    app.useAppStore.setState({ learningLang: 'en', uiLang: 'he' });
    foundation = await import('./foundationStore.js');
    bootcamp = await import('../bootcamp/bootcampStore.js');
    reading = await import('../reading/readingStore.js');
  });

  const switchTo = async (lang: string): Promise<void> => {
    // The real switch goes through the store; here only its state transition is exercised (no init()).
    disk.set('ready.lang', lang);
    app.useAppStore.setState({ learningLang: lang });
    await Promise.resolve();
  };

  it('migration: the old unscoped Foundation sets became ENGLISH progress (the language they were earned in) — nothing was copied elsewhere', () => {
    const s = foundation.useFoundationStore.getState();
    expect(s.lang).toBe('en');
    expect([...s.viewed]).toEqual(['concept.word.red', 'concept.word.blue']);
    expect([...s.dismissed]).toEqual(['concept.word.and']);
    expect(disk.has('ready.foundation.viewed')).toBe(false); // legacy keys retired
    expect(disk.has('ready.foundation.dismissed')).toBe(false);
    const stored = JSON.parse(disk.get('ready.foundation.v2')!);
    expect(Object.keys(stored.byLang)).toEqual(['en']);
  });
  it('migration: old unscoped reading progress became the progress of the language that was active; preferences stay shared', () => {
    const s = reading.useReadingStore.getState();
    expect(s.lang).toBe('en');
    expect(s.progressFor('bs-the-park')).toEqual({ pos: 3, done: true, score: 80 });
    expect(s.streak.count).toBe(2);
    expect(s.mode).toBe('hidden');
    expect(s.playback).toBe('target');
  });

  it('1–3. Foundations: seen in English → switch to Spanish → Spanish is fresh', async () => {
    foundation.useFoundationStore.getState().markViewed('concept.word.green');
    expect(foundation.useFoundationStore.getState().viewed.has('concept.word.green')).toBe(true);
    await switchTo('es');
    const es = foundation.useFoundationStore.getState();
    expect(es.lang).toBe('es');
    expect(es.viewed.size).toBe(0);
    expect(es.dismissed.size).toBe(0);
    // Spanish progress is its own: viewing "rojo" does not touch English.
    es.markViewed('concept.word.red');
    expect(foundation.useFoundationStore.getState().viewed.has('concept.word.red')).toBe(true);
    expect(foundation.useFoundationStore.getState().viewed.has('concept.word.green')).toBe(false);
    const stored = JSON.parse(disk.get('ready.foundation.v2')!);
    expect(stored.byLang.en.viewed).toEqual(['concept.word.red', 'concept.word.blue', 'concept.word.green']);
    expect(stored.byLang.es.viewed).toEqual(['concept.word.red']);
  });
  it('reading progress and the streak are per language too', async () => {
    expect(reading.useReadingStore.getState().lang).toBe('es');
    expect(reading.useReadingStore.getState().progressFor('bs-the-park').done).toBe(false);
    expect(reading.useReadingStore.getState().completedCount()).toBe(0);
    expect(reading.useReadingStore.getState().streak.count).toBe(0);
    reading.useReadingStore.getState().completeStory('bs-little-apple', 100);
    const stored = JSON.parse(disk.get('ready.reading.v1')!);
    expect(stored.byLang.es.stories['bs-little-apple'].done).toBe(true);
    expect(stored.byLang.en.stories['bs-the-park'].done).toBe(true);
    expect(stored.byLang.en.stories['bs-little-apple']).toBeUndefined();
    expect(stored.stories).toBeUndefined();
  });

  it('4–6. Journey: Mission 01 done in English → switch to French → French Mission 01 is not done', async () => {
    await switchTo('en');
    const bc = bootcamp.useBootcampStore.getState();
    bc.startDay(1);
    bootcamp.useBootcampStore.getState().completeDay();
    expect(bootcamp.useBootcampStore.getState().completedDays).toContain(1);
    await switchTo('fr');
    expect(bootcamp.useBootcampStore.getState().completedDays).not.toContain(1);
    expect(bootcamp.useBootcampStore.getState().completedDays).toEqual([]);
    expect(JSON.parse(disk.get('ready.bootcamp.v2.en')!).completed).toContain('introduce-myself');
    expect(disk.get('ready.bootcamp.v2.fr') ?? '{}').not.toContain('introduce-myself');
  });
  it('7–8. back to English: everything English is still there', async () => {
    await switchTo('en');
    expect(bootcamp.useBootcampStore.getState().completedDays).toContain(1);
    expect([...foundation.useFoundationStore.getState().viewed]).toEqual(['concept.word.red', 'concept.word.blue', 'concept.word.green']);
    expect(reading.useReadingStore.getState().progressFor('bs-the-park').done).toBe(true);
    expect(reading.useReadingStore.getState().streak.count).toBe(2);
  });
  it('9. the interface language changes nothing about progress', () => {
    const before = { f: [...foundation.useFoundationStore.getState().viewed], b: bootcamp.useBootcampStore.getState().completedDays, r: reading.useReadingStore.getState().completedCount() };
    app.useAppStore.setState({ uiLang: 'en' });
    expect([...foundation.useFoundationStore.getState().viewed]).toEqual(before.f);
    expect(bootcamp.useBootcampStore.getState().completedDays).toEqual(before.b);
    expect(reading.useReadingStore.getState().completedCount()).toBe(before.r);
    expect(foundation.useFoundationStore.getState().lang).toBe('en');
    app.useAppStore.setState({ uiLang: 'he' });
  });

  it('classification: learning state is keyed by language; preferences are not', () => {
    // Language-specific: missions, companion, zero-start, foundations, reading progress.
    expect(src('../bootcamp/bootcampStore.ts')).toContain("const keyFor = (lang: string): string => `${STORAGE_PREFIX}.${lang}`;");
    expect(src('../companion/companionStore.ts')).toContain('byLang');
    expect(src('../zerostart/zeroStartStore.ts')).toContain('byLang');
    expect(src('./foundationStore.ts')).toContain('useAppStore.subscribe(');
    expect(src('../reading/readingStore.ts')).toContain('useAppStore.subscribe(');
    // Shared: theme, app language, speech rate, playback preferences, listen mode, reading mode.
    for (const [file, key] of [['../../shared/stores/appStore.ts', "'ready.theme'"], ['../../shared/stores/appStore.ts', "'ready.uiLang'"], ['../../shared/audio/tts.ts', 'ready.speechRate'], ['../listen/listenMode.ts', "'ready.listen.mode'"]] as const) expect(src(file), key).toContain(key);
    // The old global Foundation keys are written by nothing any more.
    expect(src('./foundationStore.ts').match(/LEGACY_VIEWED_KEY/g)!.length).toBeGreaterThan(1);
    expect(src('./foundationStore.ts')).not.toMatch(/setItem\(LEGACY/);
  });
});
