import { describe, it, expect } from 'vitest';
import {
  buildOrder,
  buildUtterancePlan,
  PAUSE_AFTER_TARGET,
  PAUSE_BETWEEN_REPEATS,
} from './playbackPlan.js';
import type { PlaybackItem, PlaybackSettings } from './types.js';

const item: PlaybackItem = {
  id: 'x',
  target: 'Bonjour',
  targetLang: 'fr',
  translation: 'Hello',
  translationLang: 'en',
};

const settings = (over: Partial<PlaybackSettings>): PlaybackSettings => ({
  repeat: 1,
  order: 'sequential',
  translation: false,
  ...over,
});

describe('buildOrder', () => {
  it('is the identity order when sequential', () => {
    expect(buildOrder(4, 'sequential', 123)).toEqual([0, 1, 2, 3]);
  });

  it('is a permutation (no items lost) when random', () => {
    const order = buildOrder(6, 'random', 42);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('is deterministic for a given seed', () => {
    expect(buildOrder(8, 'random', 7)).toEqual(buildOrder(8, 'random', 7));
  });

  it('handles empty / negative counts', () => {
    expect(buildOrder(0, 'random', 1)).toEqual([]);
    expect(buildOrder(-3, 'sequential', 1)).toEqual([]);
  });
});

describe('buildUtterancePlan', () => {
  it('repeat ×1, translation off → just the target once', () => {
    const plan = buildUtterancePlan(item, settings({ repeat: 1, translation: false }));
    expect(plan).toEqual([{ kind: 'speak', text: 'Bonjour', lang: 'fr', role: 'target' }]);
  });

  it('repeat ×1, translation on → target, pause, translation', () => {
    const plan = buildUtterancePlan(item, settings({ repeat: 1, translation: true }));
    expect(plan).toEqual([
      { kind: 'speak', text: 'Bonjour', lang: 'fr', role: 'target' },
      { kind: 'pause', ms: PAUSE_AFTER_TARGET },
      { kind: 'speak', text: 'Hello', lang: 'en', role: 'translation' },
    ]);
  });

  it('repeat ×3, translation on → the target/translation pair three times', () => {
    const plan = buildUtterancePlan(item, settings({ repeat: 3, translation: true }));
    const targets = plan.filter((s) => s.kind === 'speak' && s.role === 'target');
    const translations = plan.filter((s) => s.kind === 'speak' && s.role === 'translation');
    expect(targets).toHaveLength(3);
    expect(translations).toHaveLength(3);
    // A beat separates the repeats (two gaps for three repeats).
    expect(plan.filter((s) => s.kind === 'pause' && s.ms === PAUSE_BETWEEN_REPEATS)).toHaveLength(2);
  });

  it('never speaks a translation the item does not have, even when the toggle is on', () => {
    const noTr: PlaybackItem = { id: 'y', target: 'Oui', targetLang: 'fr' };
    const plan = buildUtterancePlan(noTr, settings({ repeat: 2, translation: true }));
    expect(plan.every((s) => s.kind !== 'speak' || s.role === 'target')).toBe(true);
    expect(plan.filter((s) => s.kind === 'speak')).toHaveLength(2);
  });

  it('falls back to the target locale when the translation carries no explicit lang', () => {
    const noTrLang: PlaybackItem = { id: 'z', target: 'Ciao', targetLang: 'it', translation: 'Hi' };
    const plan = buildUtterancePlan(noTrLang, settings({ translation: true }));
    const tr = plan.find((s) => s.kind === 'speak' && s.role === 'translation');
    expect(tr && tr.kind === 'speak' && tr.lang).toBe('it');
  });
});
