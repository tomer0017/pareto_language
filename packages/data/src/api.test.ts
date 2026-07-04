import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReviewEvent } from '@ready/content-schema';
import { ApiProvider } from './api.js';
import { LocalProvider } from './local.js';
import { testPack } from './testPack.fixtures.js';

function ev(itemId: string, at: string, id = crypto.randomUUID()): ReviewEvent {
  return { id, userId: 'u1', itemId, mode: 'flashRecall', outcome: 'pass', at };
}

function okJson(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

describe('ApiProvider — local-first with background sync (PDF §11.4)', () => {
  let local: LocalProvider;

  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
    local = new LocalProvider(async () => testPack);
  });

  it('writes locally and pushes the event queue to the server', async () => {
    const calls: { url: string; body?: unknown }[] = [];
    const fetchFn = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : undefined });
      return okJson({ ok: true });
    });
    const api = new ApiProvider(local, { baseUrl: 'http://x/api/v1', fetchFn: fetchFn as typeof fetch });

    const user = await local.ensureAnonymousUser();
    await local.getContentPack('it');
    await api.saveReviewEvents(user.id, [ev('it.phrase.a', '2026-07-01T18:00:00.000Z')]);

    // Local state is immediately correct regardless of network.
    expect((await api.getMemoryStates(user.id)).length).toBe(1);

    await api.sync();
    const batchCall = calls.find((c) => c.url.endsWith('/me/review-events:batch'));
    expect(batchCall).toBeDefined();
    expect((batchCall?.body as { events: unknown[] }).events.length).toBe(1);
    // Queue drained after a successful push.
    expect((await local.pendingSyncIds()).length).toBe(0);
  });

  it('keeps the queue and defers when the server is unreachable', async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error('offline');
    });
    const api = new ApiProvider(local, {
      baseUrl: 'http://x/api/v1',
      fetchFn: fetchFn as unknown as typeof fetch,
      backoffMs: [999_999],
    });
    const user = await local.ensureAnonymousUser();
    await local.getContentPack('it');
    await api.saveReviewEvents(user.id, [ev('it.phrase.a', '2026-07-01T18:00:00.000Z')]);
    const result = await api.sync();

    expect(result).toEqual({ deferred: true });
    // Still queued — nothing lost; a retry is scheduled with backoff.
    expect((await local.pendingSyncIds()).length).toBe(1);
    api.stopRetries();
  });

  it('restore imports the server event log and re-projects locally', async () => {
    const serverEvents = [
      ev('it.phrase.a', '2026-07-01T18:00:00.000Z', 'e1'),
      ev('it.phrase.b', '2026-07-02T18:00:00.000Z', 'e2'),
    ];
    const fetchFn = vi.fn(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.endsWith('/users/anonymous')) return okJson({ ok: true });
      if (u.endsWith('/me/review-events')) return okJson({ events: serverEvents });
      return okJson({ ok: true });
    });
    const api = new ApiProvider(local, { baseUrl: 'http://x/api/v1', fetchFn: fetchFn as typeof fetch });
    const user = await local.ensureAnonymousUser();
    await local.getContentPack('it');

    // Server events carry the server-known userId; import maps them onto the local user.
    serverEvents.forEach((e) => (e.userId = user.id));
    await api.restore();
    expect((await api.getReviewEvents(user.id)).length).toBe(2);
    expect((await api.getMemoryStates(user.id)).length).toBe(2);
  });
});
