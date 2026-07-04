import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ReviewEvent } from '@ready/content-schema';
import { LocalProvider } from './local.js';
import { testPack } from './testPack.fixtures.js';

function ev(itemId: string, at: string, id = crypto.randomUUID()): ReviewEvent {
  return { id, userId: 'u1', itemId, mode: 'flashRecall', outcome: 'pass', at };
}

describe('LocalProvider (IndexedDB via fake-indexeddb)', () => {
  let p: LocalProvider;
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
    p = new LocalProvider(async () => testPack);
  });

  it('creates and persists an anonymous user', async () => {
    const a = await p.ensureAnonymousUser();
    const b = await p.ensureAnonymousUser();
    expect(a.id).toBe(b.id);
  });

  it('caches the content pack and serves it offline', async () => {
    let fetched = 0;
    const local = new LocalProvider(async () => {
      fetched++;
      return testPack;
    });
    await local.getContentPack('it');
    await local.getContentPack('it');
    expect(fetched).toBe(1);
  });

  it('writes events local-first, projects state, and enqueues for sync', async () => {
    await p.getContentPack('it');
    await p.saveReviewEvents('u1', [ev('it.phrase.a', '2026-07-01T18:00:00.000Z')]);
    const states = await p.getMemoryStates('u1');
    expect(states.length).toBe(1);
    expect(states[0]!.successfulRecalls).toBe(1);
    const pending = await p.pendingSyncIds();
    expect(pending.length).toBe(1);
    await p.clearSynced(pending);
    expect((await p.pendingSyncIds()).length).toBe(0);
  });

  it('imports server events and re-projects (multi-device restore)', async () => {
    await p.getContentPack('it');
    await p.saveReviewEvents('u1', [ev('it.phrase.a', '2026-07-01T18:00:00.000Z', 'e1')]);
    await p.importEvents('u1', [
      ev('it.phrase.a', '2026-07-02T18:00:00.000Z', 'e2'),
      ev('it.phrase.b', '2026-07-02T18:00:00.000Z', 'e3'),
    ]);
    expect((await p.getReviewEvents('u1')).length).toBe(3);
    expect((await p.getMemoryStates('u1')).length).toBe(2);
  });

  it('round-trips a trip plan and session logs', async () => {
    await p.saveTripPlan({
      userId: 'u1', lang: 'it', departureAt: '2026-07-10T00:00:00.000Z',
      minutesPerDay: 30, tier: 1, situationPriorities: [], days: [], version: 1,
    });
    expect((await p.getTripPlan('u1'))?.tier).toBe(1);
    await p.saveSessionLog({
      id: crypto.randomUUID(), userId: 'u1', startedAt: '2026-07-01T18:00:00.000Z',
      durationSec: 1200, blocks: [], capabilitySummary: ['You can order a coffee'],
    });
    expect((await p.getSessionLogs('u1')).length).toBe(1);
  });
});
