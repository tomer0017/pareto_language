import { describe, it, expect } from 'vitest';
import {
  buildOrder,
  buildUtterancePlan,
  planNextCycle,
  pausePlan,
  formatDuration,
  sleepDurationMs,
  PAUSE_PRESETS,
} from './playbackPlan.js';
import type { PlaybackItem, PlaybackSettings } from './types.js';

const item: PlaybackItem = { id: 'x', target: 'Bonjour', targetLang: 'fr', translation: 'Hello', translationLang: 'en' };

const settings = (over: Partial<PlaybackSettings>): PlaybackSettings => ({
  repeat: 1, order: 'sequential', translation: false, loop: false, speed: 1, pause: 'normal', sleepTimer: 0, ...over,
});

describe('buildOrder', () => {
  it('is the identity order when sequential', () => {
    expect(buildOrder(4, 'sequential', 123)).toEqual([0, 1, 2, 3]);
  });

  it('is a complete permutation (every item once) when random', () => {
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

  it('avoidFirst: never opens on the avoided item, still a full permutation', () => {
    // Find a seed whose raw shuffle starts with a known item, then prove avoidFirst moves it.
    let seed = 0;
    while (buildOrder(5, 'random', seed)[0] !== 2 && seed < 5000) seed++;
    expect(buildOrder(5, 'random', seed)[0]).toBe(2); // precondition
    const avoided = buildOrder(5, 'random', seed, 2);
    expect(avoided[0]).not.toBe(2);
    expect([...avoided].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('buildUtterancePlan', () => {
  it('repeat ×1, translation off → just the target once', () => {
    const plan = buildUtterancePlan(item, settings({ repeat: 1 }));
    expect(plan).toEqual([{ kind: 'speak', text: 'Bonjour', lang: 'fr', role: 'target', rate: 1 }]);
  });

  it('repeat ×1, translation on → target, pause, translation', () => {
    const plan = buildUtterancePlan(item, settings({ repeat: 1, translation: true }));
    expect(plan.map((s) => s.kind)).toEqual(['speak', 'pause', 'speak']);
    expect(plan[2]).toMatchObject({ role: 'translation', text: 'Hello', lang: 'en' });
  });

  it('repeat ×2 and ×3 speak the pair that many times', () => {
    for (const repeat of [2, 3] as const) {
      const plan = buildUtterancePlan(item, settings({ repeat, translation: true }));
      expect(plan.filter((s) => s.kind === 'speak' && s.role === 'target')).toHaveLength(repeat);
      expect(plan.filter((s) => s.kind === 'speak' && s.role === 'translation')).toHaveLength(repeat);
      // one fewer between-repeat gap than repeats
      expect(plan.filter((s) => s.kind === 'pause' && s.ms === PAUSE_PRESETS.normal.betweenRepeats)).toHaveLength(repeat - 1);
    }
  });

  it('order override translationFirst → translation (app voice) then target (learning voice), own locales', () => {
    const plan = buildUtterancePlan(item, settings({ repeat: 1 }), { translation: true, translationFirst: true });
    expect(plan.map((s) => s.kind)).toEqual(['speak', 'pause', 'speak']);
    expect(plan[0]).toMatchObject({ role: 'translation', text: 'Hello', lang: 'en' });
    expect(plan[2]).toMatchObject({ role: 'target', text: 'Bonjour', lang: 'fr' });
  });

  it('order override target-only wins over the shared translation preference (no translation spoken)', () => {
    const plan = buildUtterancePlan(item, settings({ repeat: 1, translation: true }), { translation: false, translationFirst: false });
    expect(plan).toEqual([{ kind: 'speak', text: 'Bonjour', lang: 'fr', role: 'target', rate: 1 }]);
  });

  it('order override target→translation forces translation on even when the shared preference is off', () => {
    const plan = buildUtterancePlan(item, settings({ repeat: 1, translation: false }), { translation: true, translationFirst: false });
    expect(plan.map((s) => s.kind)).toEqual(['speak', 'pause', 'speak']);
    expect(plan[0]).toMatchObject({ role: 'target' });
    expect(plan[2]).toMatchObject({ role: 'translation' });
  });

  it('never speaks a translation the item lacks, even when the toggle is on', () => {
    const noTr: PlaybackItem = { id: 'y', target: 'Oui', targetLang: 'fr' };
    const plan = buildUtterancePlan(noTr, settings({ repeat: 2, translation: true }));
    expect(plan.every((s) => s.kind !== 'speak' || s.role === 'target')).toBe(true);
  });

  it('pause-duration mapping drives the silences (short vs long)', () => {
    const short = buildUtterancePlan(item, settings({ translation: true, pause: 'short' }));
    const long = buildUtterancePlan(item, settings({ translation: true, pause: 'long' }));
    expect(short.find((s) => s.kind === 'pause')).toMatchObject({ ms: PAUSE_PRESETS.short.afterTarget });
    expect(long.find((s) => s.kind === 'pause')).toMatchObject({ ms: PAUSE_PRESETS.long.afterTarget });
    expect(PAUSE_PRESETS.short.afterTarget).toBeLessThan(PAUSE_PRESETS.long.afterTarget);
  });

  it('propagates the playback speed (incl. the new 0.5×) to every spoken step', () => {
    for (const speed of [0.5, 0.75, 1, 1.25] as const) {
      const plan = buildUtterancePlan(item, settings({ translation: true, speed }));
      const speaks = plan.filter((s) => s.kind === 'speak');
      expect(speaks.length).toBeGreaterThan(0);
      expect(speaks.every((s) => s.kind === 'speak' && s.rate === speed)).toBe(true);
    }
  });
});

describe('pausePlan', () => {
  it('resolves each preset and falls back to normal for a bad value', () => {
    expect(pausePlan('short')).toBe(PAUSE_PRESETS.short);
    // @ts-expect-error — exercising the runtime fallback
    expect(pausePlan('nonsense')).toBe(PAUSE_PRESETS.normal);
  });
});

describe('planNextCycle (Loop)', () => {
  it('OFF → finished', () => {
    expect(planNextCycle(settings({ loop: false }), [0, 1, 2], 3, 99)).toEqual({ finished: true });
  });

  it('empty list → finished even when Loop is ON', () => {
    expect(planNextCycle(settings({ loop: true }), [], 0, 99)).toEqual({ finished: true });
  });

  it('ON sequential → a fresh identity cycle from the first item', () => {
    const c = planNextCycle(settings({ loop: true, order: 'sequential' }), [0, 1, 2], 3, 99);
    expect(c).toEqual({ finished: false, order: [0, 1, 2] });
  });

  it('ON random → a full permutation that does not open on the previous cycle\'s last item', () => {
    const prev = buildOrder(6, 'random', 1);
    const last = prev[prev.length - 1]!;
    // try several seeds; the anti-duplicate guarantee must hold for each
    for (let s = 0; s < 20; s++) {
      const c = planNextCycle(settings({ loop: true, order: 'random' }), prev, 6, s);
      expect(c.finished).toBe(false);
      if (!c.finished) {
        expect([...c.order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
        if (c.order.length > 1) expect(c.order[0]).not.toBe(last);
      }
    }
  });
});

describe('formatDuration', () => {
  it('formats M:SS with a zero-padded seconds field', () => {
    expect(formatDuration(14 * 60_000 + 32_000)).toBe('14:32');
    expect(formatDuration(9 * 60_000 + 5_000)).toBe('9:05');
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(-500)).toBe('0:00');
  });
  it('sleepDurationMs converts minutes to ms', () => {
    expect(sleepDurationMs(10)).toBe(600_000);
    expect(sleepDurationMs(0)).toBe(0);
  });
});
