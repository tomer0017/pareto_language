import type {
  ContentPack,
  MemoryState,
  ReviewEvent,
  SessionLog,
  TripPlan,
  UserProfile,
} from '@ready/content-schema';

/**
 * The one interface the UI depends on (PDF §11.2 Decision 3). Three implementations plug in
 * without the UI knowing which is active: MockProvider → LocalProvider (IndexedDB, the permanent
 * offline layer) → ApiProvider (REST + background sync, wraps LocalProvider).
 */
export interface DataProvider {
  /** Create or return the device-scoped anonymous user (no-friction start, PDF §10.1). */
  ensureAnonymousUser(): Promise<UserProfile>;

  /** Fetch a content pack (from cache/CDN); version optional → latest. */
  getContentPack(lang: string, version?: string): Promise<ContentPack>;

  /** The cached projection of memory states for a user (rebuilt from events by the engine). */
  getMemoryStates(userId: string): Promise<MemoryState[]>;

  /** The append-only review-event log for a user (source of truth, PDF §11.4). */
  getReviewEvents(userId: string): Promise<ReviewEvent[]>;

  /** Append review events (idempotent by client-generated UUID) and update the projection. */
  saveReviewEvents(userId: string, events: ReviewEvent[]): Promise<void>;

  getTripPlan(userId: string): Promise<TripPlan | null>;
  saveTripPlan(plan: TripPlan): Promise<void>;

  saveSessionLog(log: SessionLog): Promise<void>;
  getSessionLogs(userId: string): Promise<SessionLog[]>;
}
