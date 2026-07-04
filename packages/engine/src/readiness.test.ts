import { describe, expect, it } from 'vitest';
import type { MemoryState, ReviewEvent, Situation } from '@ready/content-schema';
import { applyReview, DAY_MS } from './memory.js';
import { computeReadiness, hasSpacedRecalls, isPhraseSolid } from './readiness.js';
import { makeItem } from './pack.fixtures.js';

const NOW = Date.parse('2026-07-10T18:00:00.000Z');
const DEPARTURE = NOW + 2 * DAY_MS;
/** Near-term departure isolates the Ready *criteria* from natural retrievability decay. */
const SOON = NOW + DAY_MS / 4;

function situation(over: Partial<Situation> = {}): Situation {
  return {
    id: 'restaurant',
    name: 'Restaurant',
    icon: 'fork',
    priorityDefault: 10,
    corePhraseIds: ['p1', 'p2'],
    replyIds: ['r1'],
    recognitionIds: [],
    dialogue: { id: 'd', startNodeId: 'n1', nodes: [
      { id: 'n1', speaker: 'npc', text: 'a', meaning: 'a' },
      { id: 'n2', speaker: 'user', text: 'b', meaning: 'b' },
    ] },
    cultureTips: [],
    isEmergency: false,
    ...over,
  };
}

/** Build a memory state with two spaced recall passes (→ solid). */
function solidState(itemId: string, lastAt = NOW): MemoryState {
  const item = makeItem({ id: itemId, kind: 'phrase', skillTarget: 'recall' });
  const events: ReviewEvent[] = [
    { id: crypto.randomUUID(), userId: 'u1', itemId, mode: 'flashRecall', outcome: 'pass', at: new Date(lastAt - DAY_MS).toISOString() },
    { id: crypto.randomUUID(), userId: 'u1', itemId, mode: 'flashRecall', outcome: 'pass', at: new Date(lastAt).toISOString() },
  ];
  let s: MemoryState | null = null;
  for (const e of events) s = applyReview(s, e, item);
  return s!;
}

describe('hasSpacedRecalls / isPhraseSolid', () => {
  it('requires two occasions ≥12h apart', () => {
    const s = solidState('p1');
    expect(hasSpacedRecalls(s, 2)).toBe(true);
    expect(isPhraseSolid(s)).toBe(true);
  });

  it('is not solid with a single recall', () => {
    const item = makeItem({ id: 'p1' });
    const s = applyReview(null, { id: crypto.randomUUID(), userId: 'u1', itemId: 'p1', mode: 'flashRecall', outcome: 'pass', at: new Date(NOW).toISOString() }, item);
    expect(isPhraseSolid(s)).toBe(false);
  });
});

describe('computeReadiness state machine', () => {
  it('notStarted when nothing introduced', () => {
    const snap = computeReadiness({
      situation: situation(),
      statesByItem: new Map(),
      simulatorDone: false,
      departureMs: DEPARTURE,
      nowMs: NOW,
    });
    expect(snap.state).toBe('notStarted');
  });

  it('inProgress when some but not all criteria met', () => {
    const states = new Map<string, MemoryState>([['p1', solidState('p1')]]);
    const snap = computeReadiness({
      situation: situation(),
      statesByItem: states,
      simulatorDone: false,
      departureMs: DEPARTURE,
      nowMs: NOW,
    });
    expect(snap.state).toBe('inProgress');
    expect(snap.detail.phrasesSolid).toBe(1);
    expect(snap.detail.phrasesTotal).toBe(2);
  });

  it('ready when all core solid, replies ≥80%, simulator done', () => {
    const states = new Map<string, MemoryState>([
      ['p1', solidState('p1')],
      ['p2', solidState('p2')],
      ['r1', applyReview(null, { id: crypto.randomUUID(), userId: 'u1', itemId: 'r1', mode: 'listen', outcome: 'pass', at: new Date(NOW).toISOString() }, makeItem({ id: 'r1', kind: 'reply', skillTarget: 'recognize' }))],
    ]);
    const snap = computeReadiness({
      situation: situation(),
      statesByItem: states,
      simulatorDone: true,
      departureMs: SOON,
      nowMs: NOW,
    });
    expect(snap.state).toBe('ready');
    expect(snap.detail.repliesPct).toBe(1);
  });

  it('emergency requires timed L3 fluency, not just L2 solid', () => {
    const states = new Map<string, MemoryState>([
      ['p1', solidState('p1')],
      ['p2', solidState('p2')],
      ['r1', applyReview(null, { id: crypto.randomUUID(), userId: 'u1', itemId: 'r1', mode: 'listen', outcome: 'pass', at: new Date(NOW).toISOString() }, makeItem({ id: 'r1', kind: 'reply', skillTarget: 'recognize' }))],
    ]);
    const snap = computeReadiness({
      situation: situation({ isEmergency: true }),
      statesByItem: states,
      simulatorDone: true,
      departureMs: SOON,
      nowMs: NOW,
    });
    // solid (L2) but not fluent (L3) → not Ready yet.
    expect(snap.state).toBe('inProgress');
  });

  it('fading when previously solid but projected retrievability has decayed', () => {
    // Two spaced recalls but long ago → low projected R at departure.
    const stale = solidState('p1', NOW - 30 * DAY_MS);
    const stale2 = solidState('p2', NOW - 30 * DAY_MS);
    const states = new Map<string, MemoryState>([
      ['p1', stale],
      ['p2', stale2],
      ['r1', applyReview(null, { id: crypto.randomUUID(), userId: 'u1', itemId: 'r1', mode: 'listen', outcome: 'pass', at: new Date(NOW).toISOString() }, makeItem({ id: 'r1', kind: 'reply', skillTarget: 'recognize' }))],
    ]);
    const snap = computeReadiness({
      situation: situation(),
      statesByItem: states,
      simulatorDone: true,
      departureMs: DEPARTURE,
      nowMs: NOW,
    });
    expect(snap.state).toBe('fading');
  });
});
