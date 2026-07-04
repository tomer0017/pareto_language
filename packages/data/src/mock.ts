import type {
  ContentItem,
  ContentPack,
  MemoryState,
  ReviewEvent,
  SessionLog,
  TripPlan,
  UserProfile,
} from '@ready/content-schema';
import type { DataProvider } from './provider.js';
import { mergeEvents, projectMemoryStates } from './projection.js';

/**
 * In-memory provider for tests, Storybook, and the very first UI wiring (PDF §11.2 Phase 1).
 * Backed by injected content; all user state lives in memory maps and is projected by the engine.
 */
export class MockProvider implements DataProvider {
  private readonly packs = new Map<string, ContentPack>();
  private readonly itemsById = new Map<string, ContentItem>();
  private readonly events: ReviewEvent[] = [];
  private readonly plans = new Map<string, TripPlan>();
  private readonly logs: SessionLog[] = [];
  private user: UserProfile | null = null;

  constructor(packs: ContentPack[] = []) {
    for (const p of packs) this.registerPack(p);
  }

  registerPack(pack: ContentPack): void {
    this.packs.set(pack.lang, pack);
    for (const item of pack.items) this.itemsById.set(item.id, item);
  }

  async ensureAnonymousUser(): Promise<UserProfile> {
    if (!this.user) {
      this.user = {
        id: `anon-${Math.random().toString(36).slice(2, 10)}`,
        identities: [{ provider: 'anonymous', subject: 'mock' }],
        createdAt: new Date().toISOString(),
        settings: { playbackRate: 1, dyslexiaFont: false },
      };
    }
    return this.user;
  }

  async getContentPack(lang: string): Promise<ContentPack> {
    const pack = this.packs.get(lang);
    if (!pack) throw new Error(`MockProvider has no pack for "${lang}"`);
    return pack;
  }

  async getMemoryStates(userId: string): Promise<MemoryState[]> {
    const states = projectMemoryStates(
      this.events.filter((e) => e.userId === userId),
      this.itemsById,
    );
    return [...states.values()];
  }

  async getReviewEvents(userId: string): Promise<ReviewEvent[]> {
    return this.events.filter((e) => e.userId === userId);
  }

  async saveReviewEvents(userId: string, events: ReviewEvent[]): Promise<void> {
    const merged = mergeEvents(
      this.events.filter((e) => e.userId === userId),
      events.map((e) => ({ ...e, userId })),
    );
    // Replace this user's events with the merged, de-duplicated set.
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i]!.userId === userId) this.events.splice(i, 1);
    }
    this.events.push(...merged);
  }

  async getTripPlan(userId: string): Promise<TripPlan | null> {
    return this.plans.get(userId) ?? null;
  }

  async saveTripPlan(plan: TripPlan): Promise<void> {
    this.plans.set(plan.userId, plan);
  }

  async saveSessionLog(log: SessionLog): Promise<void> {
    this.logs.push(log);
  }

  async getSessionLogs(userId: string): Promise<SessionLog[]> {
    return this.logs.filter((l) => l.userId === userId);
  }
}
