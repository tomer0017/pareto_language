import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlaybackItem, PlaybackScope, PlaybackSettings } from './types.js';

/**
 * AUDIO STATE OWNERSHIP — the product rule, as tests:
 *
 *   A playback option must never affect a screen where the learner cannot see or change it,
 *   unless it is explicitly GLOBAL.
 *
 *   GLOBAL      speech rate (Profile)                     → every spoken line, everywhere
 *   LISTEN      repeats · continuous play · shuffle · listening mode
 *   STORY       reading mode · voice order (Reading store) — no engine options at all
 *   TRANSCRIPT  its own controls panel
 *
 * These run the REAL persistence, the REAL plan builder/runner and the REAL `speak()` (against a fake
 * speech synthesiser), walking the learner's actual path: Listen → Story → sentence playback →
 * back to Listen → Profile.
 */
class FakeUtterance {
  text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1;
  onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null;
  constructor(text: string) { this.text = text; }
}
class FakeSynth {
  speaking = false; pending = false; spoken: FakeUtterance[] = [];
  getVoices() { return [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }]; }
  addEventListener() {} removeEventListener() {} resume() {} cancel() { this.speaking = false; }
  speak(u: FakeUtterance) { this.spoken.push(u); this.speaking = true; queueMicrotask(() => { this.speaking = false; u.onend?.(); }); }
}

const item: PlaybackItem = { id: 's1', target: 'A table for two, please.', targetLang: 'en', translation: 'שולחן לשניים, בבקשה.', translationLang: 'he' };
const disk = new Map<string, string>();
let synth: FakeSynth;

beforeEach(() => {
  disk.clear();
  synth = new FakeSynth();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => disk.get(k) ?? null,
    setItem: (k: string, v: string) => void disk.set(k, v),
    removeItem: (k: string) => void disk.delete(k),
  });
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  vi.resetModules();
});
afterEach(() => vi.unstubAllGlobals());

/** Play one item on a surface exactly as the engine does: that surface's stored settings → plan →
 *  runner → the real TTS. Returns what was actually spoken. */
async function playOn(scope: PlaybackScope, speakOrder?: { translation: boolean; translationFirst: boolean }): Promise<FakeUtterance[]> {
  const prefs = await import('./preferences.js');
  const plan = await import('./playbackPlan.js');
  const tts = await import('../audio/tts.js');
  const before = synth.spoken.length;
  const settings = prefs.loadSettings(scope);
  const finished = await plan.runUtterancePlan(plan.buildUtterancePlan(item, settings, speakOrder), {
    speak: (text, lang) => tts.speak(text, lang), // the engine's exact call: text + locale only
    wait: () => Promise.resolve(),
    live: () => true,
  });
  expect(finished).toBe(true);
  return synth.spoken.slice(before);
}
const targetOnly = { translation: false, translationFirst: false };
const setRepeats = async (scope: PlaybackScope, repeat: 1 | 2 | 3): Promise<void> => {
  const prefs = await import('./preferences.js');
  prefs.persistSettings(scope, { ...prefs.loadSettings(scope), repeat });
};

describe('Listen repetitions stay in Listen', () => {
  it('1–2: with repeats = 3, Listen says each sentence three times', async () => {
    await setRepeats('listen', 3);
    const said = await playOn('listen', targetOnly);
    expect(said.map((u) => u.text)).toEqual([item.target, item.target, item.target]);
  });

  it('3–4: a Story opened afterwards plays each sentence ONCE', async () => {
    await setRepeats('listen', 3);
    await playOn('listen', targetOnly);
    const said = await playOn('story', targetOnly);
    expect(said.map((u) => u.text)).toEqual([item.target]);
  });

  it('5–6: sentence / word playback and the transcript do not inherit it either', async () => {
    await setRepeats('listen', 3);
    for (const scope of ['words', 'transcript'] as const) {
      const prefs = await import('./preferences.js');
      expect(prefs.loadSettings(scope).repeat, scope).toBe(1);
      const said = await playOn(scope, targetOnly);
      expect(said.map((u) => u.text), scope).toEqual([item.target]);
    }
  });

  it('7–8: returning to Listen, it still remembers 3 repetitions (also after a reload)', async () => {
    await setRepeats('listen', 3);
    await playOn('story', targetOnly);
    await playOn('words', targetOnly);
    vi.resetModules(); // a reload: modules start over, only storage survives
    const prefs = await import('./preferences.js');
    expect(prefs.loadSettings('listen').repeat).toBe(3);
    expect((await playOn('listen', targetOnly)).length).toBe(3);
  });

  it('continuous play, shuffle and the quick-listen timer are Listen\'s too — and stay there', async () => {
    const prefs = await import('./preferences.js');
    prefs.persistSettings('listen', { ...prefs.DEFAULT_SETTINGS, loop: true, order: 'random', sleepTimer: 10, repeat: 2 });
    expect(prefs.loadSettings('listen')).toMatchObject({ loop: true, order: 'random', sleepTimer: 10, repeat: 2 });
    for (const scope of ['story', 'transcript', 'words'] as const) expect(prefs.loadSettings(scope), scope).toEqual(prefs.DEFAULT_SETTINGS);
  });

  it('the reverse also holds: a transcript\'s repeats never reach Listen or a story', async () => {
    await setRepeats('transcript', 3);
    const prefs = await import('./preferences.js');
    expect(prefs.loadSettings('transcript').repeat).toBe(3);
    expect(prefs.loadSettings('listen').repeat).toBe(1);
    expect(prefs.loadSettings('story').repeat).toBe(1);
  });

  it('a surface cannot keep an option its screen does not expose (the story reader owns none)', async () => {
    const prefs = await import('./preferences.js');
    const everything: PlaybackSettings = { repeat: 3, order: 'random', translation: false, loop: true, pause: 'long', sleepTimer: 30 };
    prefs.persistSettings('story', everything);
    expect(prefs.loadSettings('story')).toEqual(prefs.DEFAULT_SETTINGS);
    expect(prefs.scopeOwns('story', 'repeat')).toBe(false);
    expect(prefs.scopeOwns('listen', 'repeat')).toBe(true);
    expect(prefs.scopeOwns('listen', 'translation')).toBe(false); // Listen's translation order is its "mode"
  });
});

describe('ONE global speech speed (Profile) — every audio surface follows it', () => {
  const rateOf = (said: FakeUtterance[]): number[] => [...new Set(said.map((u) => u.rate))];

  it('9–13: changing the Profile speed changes Listen, Story, Transcript and practice audio alike', async () => {
    const tts = await import('../audio/tts.js');
    tts.setSpeechRate(1.0);
    const baseline = rateOf(await playOn('listen', targetOnly))[0]!;

    tts.setSpeechRate(0.8); // Profile → speech speed
    expect(disk.get('ready.speechRate')).toBe('0.8');
    const listen = rateOf(await playOn('listen', targetOnly));
    const story = rateOf(await playOn('story', targetOnly));
    const transcript = rateOf(await playOn('transcript', targetOnly));
    // Practice / mission drills call the same speak() directly.
    const before = synth.spoken.length;
    await tts.speak('Where are you from?', 'en');
    const practice = rateOf(synth.spoken.slice(before));

    expect(listen).toHaveLength(1);
    expect(listen[0]).toBeCloseTo(baseline * 0.8, 5);
    expect(story).toEqual(listen);
    expect(transcript).toEqual(listen);
    expect(practice).toEqual(listen);
  });

  it('the speed survives a reload from its single storage key', async () => {
    (await import('../audio/tts.js')).setSpeechRate(0.9);
    vi.resetModules();
    expect((await import('../audio/tts.js')).getSpeechRate()).toBe(0.9);
    expect([...disk.keys()].filter((k) => /rate|speed/i.test(k))).toEqual(['ready.speechRate']);
  });

  it('14: there is no second speed — no playback setting, no reader multiplier, no speed control', async () => {
    const prefs = await import('./preferences.js');
    expect(Object.keys(prefs.DEFAULT_SETTINGS)).not.toContain('speed');
    for (const owned of Object.values(prefs.SCOPE_OWNS)) expect(owned as readonly string[]).not.toContain('speed');
    // A stale record with a speed in it is ignored rather than applied.
    disk.set('ready.playback.transcript', JSON.stringify({ speed: 0.5, repeat: 2 }));
    expect(prefs.loadSettings('transcript')).not.toHaveProperty('speed');
    const before = (await playOn('transcript', targetOnly))[0]!.rate;
    disk.delete('ready.playback.transcript');
    expect((await playOn('transcript', targetOnly))[0]!.rate).toBe(before);

    const read = (p: string): string => readFileSync(new URL(p, import.meta.url), 'utf8');
    for (const file of ['./PlaybackControls.tsx', './useParrotPlayback.ts', '../../features/reading/Reading.tsx', '../../features/listen/Listen.tsx', '../../features/bootcamp/Bootcamp.tsx']) {
      expect(read(file), file).not.toMatch(/setSpeed|parrotSpeed|PlaybackSpeed|settings\.speed/);
    }
  });

  it('15: Listen repetitions change how many times a line is said, never how fast', async () => {
    await setRepeats('listen', 1);
    const once = await playOn('listen', targetOnly);
    await setRepeats('listen', 3);
    const thrice = await playOn('listen', targetOnly);
    expect(once).toHaveLength(1);
    expect(thrice).toHaveLength(3);
    expect(rateOf(thrice)).toEqual(rateOf(once));
  });
});

describe('presentation modes belong to their own surface', () => {
  it('16: the story\'s reading mode / voice order does not change the Listen mode', async () => {
    const listenMode = await import('../../features/listen/listenMode.js');
    listenMode.saveListenMode('target-only');
    const { useReadingStore } = await import('../../features/reading/readingStore.js');
    useReadingStore.getState().setPlayback('tr-target');
    useReadingStore.getState().setMode('hidden');
    expect(listenMode.loadListenMode()).toBe('target-only');
    expect(disk.get('ready.listen.mode')).toBe('target-only');
  });

  it('17: the Listen mode does not change the story\'s reading mode / voice order', async () => {
    const { useReadingStore } = await import('../../features/reading/readingStore.js');
    useReadingStore.getState().setPlayback('target');
    useReadingStore.getState().setMode('bilingual');
    const listenMode = await import('../../features/listen/listenMode.js');
    for (const mode of listenMode.LISTEN_MODES) listenMode.saveListenMode(mode);
    expect(useReadingStore.getState().playback).toBe('target');
    expect(useReadingStore.getState().mode).toBe('bilingual');
    const stored = JSON.parse(disk.get('ready.reading.v1')!) as { playback: string; mode: string };
    expect(stored).toMatchObject({ playback: 'target', mode: 'bilingual' });
  });

  it('every preference has exactly one storage key, by owner', async () => {
    const prefs = await import('./preferences.js');
    for (const scope of Object.keys(prefs.SCOPE_OWNS) as PlaybackScope[]) prefs.persistSettings(scope, prefs.DEFAULT_SETTINGS);
    (await import('../../features/listen/listenMode.js')).saveListenMode('tr-first');
    (await import('../../features/reading/readingStore.js')).useReadingStore.getState().setMode('target');
    (await import('../audio/tts.js')).setSpeechRate(0.95);
    expect([...disk.keys()].sort()).toEqual([
      'ready.listen.mode', 'ready.playback.listen', 'ready.playback.story', 'ready.playback.transcript', 'ready.playback.words',
      'ready.reading.v1', 'ready.speechRate',
    ]);
  });
});
