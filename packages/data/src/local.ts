import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type {
  ContentItem,
  ContentPack,
  MemoryState,
  ReviewEvent,
  SessionLog,
  TripPlan,
  UserProfile,
} from '@ready/content-schema';
import type { ContentSourceReporter, DataProvider } from './provider.js';
import { mergeEvents, projectMemoryStates } from './projection.js';

const DB_NAME = 'ready-db';
const DB_VERSION = 1;

interface ReadyDB extends DBSchema {
  reviewEvents: { key: string; value: ReviewEvent; indexes: { byUser: string } };
  memoryStates: { key: [string, string]; value: MemoryState; indexes: { byUser: string } };
  tripPlans: { key: string; value: TripPlan };
  sessionLogs: { key: string; value: SessionLog; indexes: { byUser: string } };
  users: { key: string; value: UserProfile };
  packs: { key: string; value: { lang: string; pack: ContentPack; cachedAt: string } };
  /** Append-only queue of event ids awaiting server sync (drained by ApiProvider). */
  syncQueue: { key: string; value: { eventId: string; queuedAt: string } };
  meta: { key: string; value: string };
}

/**
 * The permanent offline layer (PDF §11.2 Phase 2 note): all learning writes go to IndexedDB
 * immediately; memory state is a projection recomputed by the engine; a sync queue records events
 * for background push. This class is *not* throwaway scaffolding — it stays in production forever.
 */
export class LocalProvider implements DataProvider {
  private dbPromise: Promise<IDBPDatabase<ReadyDB>> | null = null;
  private readonly itemsById = new Map<string, ContentItem>();
  /** Optional network fetcher (browser fetch by default); overridable for tests. */
  constructor(
    private readonly fetchPack: (lang: string, version?: string) => Promise<ContentPack> = defaultFetchPack,
    /** Optional dev diagnostics hook: reports whether a pack came from IDB cache or static. */
    private readonly report?: ContentSourceReporter,
  ) {}

  private db(): Promise<IDBPDatabase<ReadyDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<ReadyDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          const ev = db.createObjectStore('reviewEvents', { keyPath: 'id' });
          ev.createIndex('byUser', 'userId');
          const ms = db.createObjectStore('memoryStates', { keyPath: ['userId', 'itemId'] });
          ms.createIndex('byUser', 'userId');
          db.createObjectStore('tripPlans', { keyPath: 'userId' });
          const sl = db.createObjectStore('sessionLogs', { keyPath: 'id' });
          sl.createIndex('byUser', 'userId');
          db.createObjectStore('users', { keyPath: 'id' });
          db.createObjectStore('packs', { keyPath: 'lang' });
          db.createObjectStore('syncQueue', { keyPath: 'eventId' });
          db.createObjectStore('meta');
        },
      });
    }
    return this.dbPromise;
  }

  private indexItems(pack: ContentPack): void {
    for (const item of pack.items) this.itemsById.set(item.id, item);
  }

  async ensureAnonymousUser(): Promise<UserProfile> {
    const db = await this.db();
    const existingId = await db.get('meta', 'currentUserId');
    if (existingId) {
      const user = await db.get('users', existingId);
      if (user) return user;
    }
    const user: UserProfile = {
      id: `anon-${crypto.randomUUID()}`,
      identities: [{ provider: 'anonymous', subject: crypto.randomUUID() }],
      createdAt: new Date().toISOString(),
      settings: { playbackRate: 1, dyslexiaFont: false },
    };
    await db.put('users', user);
    await db.put('meta', user.id, 'currentUserId');
    return user;
  }

  async getContentPack(lang: string, version?: string): Promise<ContentPack> {
    const db = await this.db();
    const cached = await db.get('packs', lang);
    if (cached && (!version || cached.pack.version === version)) {
      this.indexItems(cached.pack);
      this.report?.({ source: 'idb-cache', lang, version: cached.pack.version });
      return cached.pack;
    }
    const pack = await this.fetchPack(lang, version);
    await db.put('packs', { lang, pack, cachedAt: new Date().toISOString() });
    this.indexItems(pack);
    this.report?.({ source: 'static', lang, version: pack.version });
    return pack;
  }

  /** Persist a pack fetched elsewhere (e.g. from the API) into the offline cache. */
  async cachePack(pack: ContentPack): Promise<void> {
    const db = await this.db();
    await db.put('packs', { lang: pack.lang, pack, cachedAt: new Date().toISOString() });
    this.indexItems(pack);
  }

  /** Ensure the item index is populated so projection can run offline. */
  private async ensureItems(): Promise<void> {
    if (this.itemsById.size > 0) return;
    const db = await this.db();
    const all = await db.getAll('packs');
    for (const entry of all) this.indexItems(entry.pack);
  }

  async getMemoryStates(userId: string): Promise<MemoryState[]> {
    const db = await this.db();
    return db.getAllFromIndex('memoryStates', 'byUser', userId);
  }

  async getReviewEvents(userId: string): Promise<ReviewEvent[]> {
    const db = await this.db();
    const events = await db.getAllFromIndex('reviewEvents', 'byUser', userId);
    return events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  }

  async saveReviewEvents(userId: string, events: ReviewEvent[]): Promise<void> {
    if (events.length === 0) return;
    await this.ensureItems();
    const db = await this.db();

    // Local-first write: append events + enqueue for sync in one transaction.
    const tx = db.transaction(['reviewEvents', 'syncQueue'], 'readwrite');
    for (const raw of events) {
      const e: ReviewEvent = { ...raw, userId };
      await tx.objectStore('reviewEvents').put(e);
      await tx.objectStore('syncQueue').put({ eventId: e.id, queuedAt: new Date().toISOString() });
    }
    await tx.done;

    // Recompute the projection for this user (cheap; per-user log is small).
    const all = await this.getReviewEvents(userId);
    const states = projectMemoryStates(all, this.itemsById);
    const wtx = db.transaction('memoryStates', 'readwrite');
    for (const state of states.values()) await wtx.objectStore('memoryStates').put(state);
    await wtx.done;
  }

  async getTripPlan(userId: string): Promise<TripPlan | null> {
    const db = await this.db();
    return (await db.get('tripPlans', userId)) ?? null;
  }

  async saveTripPlan(plan: TripPlan): Promise<void> {
    const db = await this.db();
    await db.put('tripPlans', plan);
  }

  async saveSessionLog(log: SessionLog): Promise<void> {
    const db = await this.db();
    await db.put('sessionLogs', log);
  }

  async getSessionLogs(userId: string): Promise<SessionLog[]> {
    const db = await this.db();
    return db.getAllFromIndex('sessionLogs', 'byUser', userId);
  }

  /** Ids of events awaiting sync (used by ApiProvider in M3). */
  async pendingSyncIds(): Promise<string[]> {
    const db = await this.db();
    return (await db.getAll('syncQueue')).map((q) => q.eventId);
  }

  /** Remove events from the sync queue once the server has acknowledged them. */
  async clearSynced(eventIds: string[]): Promise<void> {
    const db = await this.db();
    const tx = db.transaction('syncQueue', 'readwrite');
    for (const id of eventIds) await tx.objectStore('syncQueue').delete(id);
    await tx.done;
  }

  /** Merge server-side events into the local log and re-project (multi-device restore). */
  async importEvents(userId: string, incoming: ReviewEvent[]): Promise<void> {
    await this.ensureItems();
    const existing = await this.getReviewEvents(userId);
    const merged = mergeEvents(existing, incoming);
    const db = await this.db();
    const tx = db.transaction('reviewEvents', 'readwrite');
    for (const e of merged) await tx.objectStore('reviewEvents').put(e);
    await tx.done;
    const states = projectMemoryStates(merged, this.itemsById);
    const wtx = db.transaction('memoryStates', 'readwrite');
    for (const state of states.values()) await wtx.objectStore('memoryStates').put(state);
    await wtx.done;
  }
}

async function defaultFetchPack(lang: string, version?: string): Promise<ContentPack> {
  const manifestRes = await fetch('/content/manifest.json');
  if (!manifestRes.ok) throw new Error('content manifest unavailable');
  const manifest = (await manifestRes.json()) as {
    languages: { lang: string; latestVersion: string; packUrl: string }[];
  };
  const entry = manifest.languages.find((l) => l.lang === lang);
  if (!entry) throw new Error(`no content for language "${lang}"`);
  const url = version ? entry.packUrl.replace(entry.latestVersion, version) : entry.packUrl;
  const packRes = await fetch(url);
  if (!packRes.ok) throw new Error(`content pack unavailable for "${lang}"`);
  return (await packRes.json()) as ContentPack;
}
