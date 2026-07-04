import type {
  ContentPack,
  MemoryState,
  ReviewEvent,
  SessionLog,
  TripPlan,
  UserProfile,
} from '@ready/content-schema';
import type { DataProvider } from './provider.js';
import type { LocalProvider } from './local.js';

export interface ApiProviderOptions {
  baseUrl: string;
  fetchFn?: typeof fetch;
  /** Backoff schedule in ms between sync retries (M4: retry with backoff). */
  backoffMs?: number[];
}

/**
 * ApiProvider (PDF §11.2 Phase 3, §11.4): wraps LocalProvider — every read and write is
 * local-first; the append-only event queue syncs to the server in the background. Conflict
 * resolution is "replay events in timestamp order" server-side, so sync is just: push the
 * queue (idempotent by UUID), pull the merged log on restore.
 */
export class ApiProvider implements DataProvider {
  private readonly fetchFn: typeof fetch;
  private readonly backoff: number[];
  private syncPromise: Promise<{ pushed: number } | { deferred: true }> | null = null;
  private failStreak = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private serverSessionReady = false;

  constructor(
    private readonly local: LocalProvider,
    private readonly opts: ApiProviderOptions,
  ) {
    this.fetchFn = opts.fetchFn ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
    this.backoff = opts.backoffMs ?? [5_000, 15_000, 60_000, 300_000];
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void this.sync());
    }
  }

  private async call(path: string, init?: RequestInit): Promise<Response> {
    return this.fetchFn(`${this.opts.baseUrl}${path}`, {
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      ...init,
    });
  }

  /** Establish (or refresh) the server session for the local anonymous user. */
  private async ensureServerSession(user: UserProfile): Promise<boolean> {
    if (this.serverSessionReady) return true;
    try {
      const res = await this.call('/users/anonymous', {
        method: 'POST',
        body: JSON.stringify({ clientUserId: user.id }),
      });
      this.serverSessionReady = res.ok;
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Push the local event queue to the server. Retries with backoff on failure. */
  sync(): Promise<{ pushed: number } | { deferred: true }> {
    if (this.syncPromise) return this.syncPromise;
    this.syncPromise = this.doSync().finally(() => {
      this.syncPromise = null;
    });
    return this.syncPromise;
  }

  /** Cancel any scheduled retry (tests / teardown). */
  stopRetries(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private async doSync(): Promise<{ pushed: number } | { deferred: true }> {
    try {
      const user = await this.local.ensureAnonymousUser();
      if (!(await this.ensureServerSession(user))) {
        this.scheduleRetry();
        return { deferred: true };
      }
      const pendingIds = await this.local.pendingSyncIds();
      if (pendingIds.length === 0) {
        this.failStreak = 0;
        return { pushed: 0 };
      }
      const all = await this.local.getReviewEvents(user.id);
      const pending = new Set(pendingIds);
      const events = all.filter((e) => pending.has(e.id));
      const res = await this.call('/me/review-events:batch', {
        method: 'POST',
        body: JSON.stringify({ events }),
      });
      if (!res.ok) throw new Error(`batch sync failed: ${res.status}`);
      await this.local.clearSynced(events.map((e) => e.id));
      this.failStreak = 0;
      return { pushed: events.length };
    } catch (err) {
      console.warn('[sync] push failed; will retry with backoff', err);
      this.scheduleRetry();
      return { deferred: true };
    }
  }

  private scheduleRetry(): void {
    const delay = this.backoff[Math.min(this.failStreak, this.backoff.length - 1)] ?? 60_000;
    this.failStreak++;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => void this.sync(), delay);
  }

  /** Pull the server's merged event log into local storage (multi-device restore). */
  async restore(): Promise<void> {
    const user = await this.local.ensureAnonymousUser();
    if (!(await this.ensureServerSession(user))) return;
    try {
      const res = await this.call('/me/review-events');
      if (!res.ok) return;
      const body = (await res.json()) as { events: ReviewEvent[] };
      await this.local.importEvents(user.id, body.events);
    } catch (err) {
      console.warn('[sync] restore failed; local state remains authoritative', err);
    }
  }

  /* ── DataProvider: local-first everywhere ─────────────────────────────── */

  async ensureAnonymousUser(): Promise<UserProfile> {
    const user = await this.local.ensureAnonymousUser();
    void this.ensureServerSession(user);
    return user;
  }

  /**
   * Content is API-first (the server's MongoDB-backed pack payload) with the local/static pack
   * as fallback — the app never breaks when the backend is down (P7, local-first).
   */
  async getContentPack(lang: string, version?: string): Promise<ContentPack> {
    try {
      const res = await this.call(`/content/packs/${lang}/full`);
      if (res.ok) {
        const pack = (await res.json()) as ContentPack;
        await this.local.cachePack(pack);
        return pack;
      }
    } catch (err) {
      console.warn('[content] API pack unavailable; using local/static pack', err);
    }
    return this.local.getContentPack(lang, version);
  }

  getMemoryStates(userId: string): Promise<MemoryState[]> {
    return this.local.getMemoryStates(userId);
  }

  getReviewEvents(userId: string): Promise<ReviewEvent[]> {
    return this.local.getReviewEvents(userId);
  }

  async saveReviewEvents(userId: string, events: ReviewEvent[]): Promise<void> {
    await this.local.saveReviewEvents(userId, events);
    void this.sync();
  }

  getTripPlan(userId: string): Promise<TripPlan | null> {
    return this.local.getTripPlan(userId);
  }

  async saveTripPlan(plan: TripPlan): Promise<void> {
    await this.local.saveTripPlan(plan);
    void this.call('/me/plan', { method: 'PUT', body: JSON.stringify(plan) }).catch((err) =>
      console.warn('[sync] plan push failed; local plan is authoritative', err),
    );
  }

  async saveSessionLog(log: SessionLog): Promise<void> {
    await this.local.saveSessionLog(log);
    void this.call('/me/sessions', { method: 'POST', body: JSON.stringify(log) }).catch((err) =>
      console.warn('[sync] session push failed', err),
    );
  }

  getSessionLogs(userId: string): Promise<SessionLog[]> {
    return this.local.getSessionLogs(userId);
  }
}
