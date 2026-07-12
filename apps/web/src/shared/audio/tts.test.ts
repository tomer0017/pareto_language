import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { getAudioDiag } from './tts.js';

describe('audio diagnostics snapshot', () => {
  // Regression: getAudioDiag is the getSnapshot for useSyncExternalStore. It MUST return a
  // stable reference between changes, or React loops ("getSnapshot should be cached") and,
  // because AudioDebug renders in dev, white-screens the whole app.
  it('returns a stable reference on consecutive calls', () => {
    expect(getAudioDiag()).toBe(getAudioDiag());
  });
  it('exposes the diagnostic shape', () => {
    const d = getAudioDiag();
    expect(d).toHaveProperty('unlocked');
    expect(d).toHaveProperty('synthAvailable');
    expect(d).toHaveProperty('lastError');
    expect(d).toHaveProperty('selectedExact');
  });
});

/**
 * speak() lifecycle contract — the outcome model that lets callers ignore stale callbacks. Uses a
 * minimal controllable speechSynthesis mock installed BEFORE importing the module (tts.ts reads the
 * globals at load), so these run via dynamic import after vi.resetModules().
 */
class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  voice: unknown = null;
  volume = 1;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(text: string) { this.text = text; }
}

class FakeSynth {
  speaking = false;
  pending = false;
  private current: FakeUtterance | null = null;
  getVoices() { return [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }]; }
  addEventListener() {}
  removeEventListener() {}
  resume() {}
  cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }
  speak(u: FakeUtterance) { this.current = u; this.speaking = true; }
  finish() { const u = this.current; this.speaking = false; this.current = null; u?.onend?.(); }
}

describe('speak() outcome contract', () => {
  let synth: FakeSynth;
  beforeEach(() => {
    synth = new FakeSynth();
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    vi.resetModules();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('resolves "ended" when the utterance finishes naturally', async () => {
    const { speak } = await import('./tts.js');
    const p = speak('Hello there.', 'en', 1);
    synth.finish();
    await expect(p).resolves.toBe('ended');
  });

  it('resolves "interrupted" for an utterance superseded by a newer speak()', async () => {
    const { speak } = await import('./tts.js');
    const first = speak('First line.', 'en', 1);
    void speak('Second line.', 'en', 1); // cancels the first → first.onerror('canceled')
    await expect(first).resolves.toBe('interrupted');
  });

  it('resolves "unavailable" when speechSynthesis is absent', async () => {
    vi.stubGlobal('speechSynthesis', undefined);
    vi.stubGlobal('SpeechSynthesisUtterance', undefined);
    vi.resetModules();
    const { speak } = await import('./tts.js');
    await expect(speak('x', 'en', 1)).resolves.toBe('unavailable');
  });

  it('targets the registry locale (en → en-US) and resolves an exact voice', async () => {
    const { speak, getAudioDiag: diag } = await import('./tts.js');
    const p = speak('Testing.', 'en', 1);
    synth.finish();
    await p;
    expect(diag().selectedLang).toBe('en-US');
    expect(diag().selectedExact).toBe(true);
  });
});
