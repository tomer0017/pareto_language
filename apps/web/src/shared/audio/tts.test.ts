import { describe, it, expect } from 'vitest';
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
  });
});
