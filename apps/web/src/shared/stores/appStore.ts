import { create } from 'zustand';
import type {
  ContentItem,
  ContentPack,
  MemoryState,
  ReadinessSnapshot,
  ReviewEvent,
  SessionLog,
  Situation,
  SituationPriority,
  TripPlan,
  UserProfile,
} from '@ready/content-schema';
import { LocalProvider, type DataProvider } from '@ready/data';
import { buildPlan, computeReadiness, DAY_MS } from '@ready/engine';

export type View =
  | 'onboarding'
  | 'home'
  | 'session'
  | 'readiness'
  | 'phrasebook'
  | 'emergency'
  | 'plan';

export interface OnboardingInput {
  departureAt: string;
  minutesPerDay: number;
  situationPriorities: SituationPriority[];
}

interface AppState {
  provider: DataProvider;
  view: View;
  loading: boolean;
  fatalError: string | null;
  user: UserProfile | null;
  pack: ContentPack | null;
  plan: TripPlan | null;
  states: Map<string, MemoryState>;
  itemsById: Map<string, ContentItem>;
  situationById: Map<string, Situation>;

  navigate(view: View): void;
  init(): Promise<void>;
  createPlan(input: OnboardingInput): Promise<void>;
  updatePlanSettings(input: OnboardingInput): Promise<void>;
  recordEvents(events: ReviewEvent[]): Promise<void>;
  saveSessionLog(log: SessionLog): Promise<void>;
  replanAfterSession(): Promise<void>;
  readiness(): ReadinessSnapshot[];
  daysLeft(): number;
}

function toMaps(pack: ContentPack): {
  itemsById: Map<string, ContentItem>;
  situationById: Map<string, Situation>;
} {
  return {
    itemsById: new Map(pack.items.map((i) => [i.id, i])),
    situationById: new Map(pack.situations.map((s) => [s.id, s])),
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  provider: new LocalProvider(),
  view: 'onboarding',
  loading: true,
  fatalError: null,
  user: null,
  pack: null,
  plan: null,
  states: new Map(),
  itemsById: new Map(),
  situationById: new Map(),

  navigate(view) {
    set({ view });
  },

  async init() {
    const { provider } = get();
    try {
      const user = await provider.ensureAnonymousUser();
      const pack = await provider.getContentPack('it');
      const plan = await provider.getTripPlan(user.id);
      const stateList = await provider.getMemoryStates(user.id);
      set({
        user,
        pack,
        plan,
        states: new Map(stateList.map((s) => [s.itemId, s])),
        ...toMaps(pack),
        view: plan ? 'home' : 'onboarding',
        loading: false,
        fatalError: null,
      });
    } catch (err) {
      console.error('[app] init failed', err);
      set({
        loading: false,
        fatalError:
          'Could not load your content pack. Check your connection once — after that READY works fully offline.',
      });
    }
  },

  async createPlan(input) {
    const { provider, user, pack } = get();
    if (!user || !pack) throw new Error('createPlan before init');
    const plan = buildPlan({
      pack,
      userId: user.id,
      departureAt: input.departureAt,
      nowMs: Date.now(),
      minutesPerDay: input.minutesPerDay,
      situationPriorities: input.situationPriorities,
      version: 1,
    });
    await provider.saveTripPlan(plan);
    set({ plan, view: 'home' });
  },

  async updatePlanSettings(input) {
    const { provider, user, pack, states, plan } = get();
    if (!user || !pack) throw new Error('updatePlanSettings before init');
    const next = buildPlan({
      pack,
      userId: user.id,
      departureAt: input.departureAt,
      nowMs: Date.now(),
      minutesPerDay: input.minutesPerDay,
      situationPriorities: input.situationPriorities,
      seenItemIds: new Set(states.keys()),
      version: (plan?.version ?? 0) + 1,
    });
    await provider.saveTripPlan(next);
    set({ plan: next });
  },

  async recordEvents(events) {
    const { provider, user } = get();
    if (!user || events.length === 0) return;
    await provider.saveReviewEvents(user.id, events);
    const stateList = await provider.getMemoryStates(user.id);
    set({ states: new Map(stateList.map((s) => [s.itemId, s])) });
  },

  async saveSessionLog(log) {
    await get().provider.saveSessionLog(log);
  },

  /** Graceful re-planning after every session (PDF §8.1 step 4). */
  async replanAfterSession() {
    const { provider, user, pack, plan, states } = get();
    if (!user || !pack || !plan) return;
    const next = buildPlan({
      pack,
      userId: user.id,
      departureAt: plan.departureAt,
      nowMs: Date.now(),
      minutesPerDay: plan.minutesPerDay,
      situationPriorities: plan.situationPriorities,
      seenItemIds: new Set(states.keys()),
      version: plan.version + 1,
    });
    await provider.saveTripPlan(next);
    set({ plan: next });
  },

  readiness() {
    const { pack, plan, states } = get();
    if (!pack) return [];
    const departureMs = plan ? Date.parse(plan.departureAt) : Date.now() + 7 * DAY_MS;
    return pack.situations.map((situation) => {
      // The Simulator confers L4 on core phrases; any L4 core item = simulator completed.
      const simulatorDone = situation.corePhraseIds.some(
        (id) => (states.get(id)?.level ?? 0) >= 4,
      );
      return computeReadiness({
        situation,
        statesByItem: states,
        simulatorDone,
        departureMs,
        nowMs: Date.now(),
      });
    });
  },

  daysLeft() {
    const { plan } = get();
    if (!plan) return 0;
    return Math.max(0, Math.ceil((Date.parse(plan.departureAt) - Date.now()) / DAY_MS));
  },
}));
