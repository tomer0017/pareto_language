import { beforeEach, describe, expect, it } from 'vitest';
import type { ReviewEvent } from '@ready/content-schema';
import { MockProvider } from './mock.js';
import { testPack } from './testPack.fixtures.js';

function ev(itemId: string, at: string, id = crypto.randomUUID()): ReviewEvent {
  return { id, userId: 'u1', itemId, mode: 'flashRecall', outcome: 'pass', at };
}

describe('MockProvider', () => {
  let p: MockProvider;
  beforeEach(() => {
    p = new MockProvider([testPack]);
  });

  it('creates a stable anonymous user', async () => {
    const a = await p.ensureAnonymousUser();
    const b = await p.ensureAnonymousUser();
    expect(a.id).toBe(b.id);
    expect(a.identities[0]!.provider).toBe('anonymous');
  });

  it('serves the injected content pack', async () => {
    const pack = await p.getContentPack('it');
    expect(pack.items.length).toBe(3);
    await expect(p.getContentPack('xx')).rejects.toThrow();
  });

  it('projects memory states from saved events', async () => {
    await p.saveReviewEvents('u1', [ev('it.phrase.a', '2026-07-01T18:00:00.000Z')]);
    const states = await p.getMemoryStates('u1');
    expect(states.length).toBe(1);
    expect(states[0]!.itemId).toBe('it.phrase.a');
    expect(states[0]!.successfulRecalls).toBe(1);
  });

  it('is idempotent by event id', async () => {
    const e = ev('it.phrase.a', '2026-07-01T18:00:00.000Z', 'fixed-id');
    await p.saveReviewEvents('u1', [e]);
    await p.saveReviewEvents('u1', [e]);
    const events = await p.getReviewEvents('u1');
    expect(events.length).toBe(1);
  });

  it('stores and returns the trip plan and session logs', async () => {
    await p.saveTripPlan({
      userId: 'u1',
      lang: 'it',
      departureAt: '2026-07-10T00:00:00.000Z',
      minutesPerDay: 30,
      tier: 1,
      situationPriorities: [],
      days: [],
      version: 1,
    });
    expect((await p.getTripPlan('u1'))?.minutesPerDay).toBe(30);
    expect(await p.getTripPlan('u2')).toBeNull();
  });
});
