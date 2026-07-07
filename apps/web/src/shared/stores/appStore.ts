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
import { ApiProvider, LocalProvider, type DataProvider } from '@ready/data';
import { buildPlan, computeReadiness, DAY_MS } from '@ready/engine';
import { applyLanguageTheme, applyUiDirection, languageInfo, PILOT_LANG } from '../i18n/languages.js';
import { setUiLangDict } from '../i18n/strings.js';
import { reportContentSource, setProviderDiag } from '../data/dataDiag.js';

export type View =
  | 'onboarding'
  | 'mission'
  | 'words'
  | 'phrases'
  | 'situations'
  | 'practice'
  | 'session'
  | 'emergency'
  | 'plan'
  | 'languages'
  | 'bootcamp';

export interface OnboardingInput {
  departureAt: string;
  minutesPerDay: number;
  situationPriorities: SituationPriority[];
}

/** Honest per-situation confidence: weighted blend of the readiness detail (P3 — derived from
 *  demonstrated evidence, never from exposure). */
export function confidencePct(snap: ReadinessSnapshot): number {
  const d = snap.detail;
  const phrasePart = d.phrasesTotal > 0 ? d.phrasesSolid / d.phrasesTotal : 0;
  const pct = 0.55 * phrasePart + 0.3 * d.repliesPct + 0.15 * (d.simulatorDone ? 1 : 0);
  return Math.round(pct * 100);
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
  uiLang: string;
  learningLang: string;

  navigate(view: View): void;
  setUiLang(lang: string): void;
  setLearningLang(lang: string): Promise<void>;
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

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

function makeProvider(): DataProvider {
  // Local-first always; when VITE_API_BASE is set, ApiProvider makes content API-first (server
  // pack → IDB cache → static fallback) and adds background sync (PDF §11.4). The reporter feeds
  // the dev data-source diagnostics so it's visible which layer actually served each pack.
  const local = new LocalProvider(undefined, reportContentSource);
  setProviderDiag(API_BASE ? 'api' : 'local-only', API_BASE);
  return API_BASE
    ? new ApiProvider(local, { baseUrl: API_BASE, report: reportContentSource })
    : local;
}

const storedUiLang = localStorage.getItem('ready.uiLang') ?? 'en';
// English is the current pilot language (see languages.ts / PILOT_LANG). Any legacy 'it'
// preference from before the switch is normalized to the pilot so no user is stuck on Italian.
const rawLearningLang = localStorage.getItem('ready.lang') ?? PILOT_LANG;
const storedLearningLang = languageInfo(rawLearningLang).available ? rawLearningLang : PILOT_LANG;
setUiLangDict(storedUiLang);

export const useAppStore = create<AppState>((set, get) => ({
  provider: makeProvider(),
  view: 'onboarding',
  loading: true,
  fatalError: null,
  user: null,
  pack: null,
  plan: null,
  states: new Map(),
  itemsById: new Map(),
  situationById: new Map(),
  uiLang: storedUiLang,
  learningLang: storedLearningLang,

  navigate(view) {
    set({ view });
  },

  setUiLang(lang) {
    localStorage.setItem('ready.uiLang', lang);
    setUiLangDict(lang);
    applyUiDirection(lang);
    set({ uiLang: lang });
  },

  async setLearningLang(lang) {
    if (!languageInfo(lang).available) return; // only shipped packs are selectable (R1)
    localStorage.setItem('ready.lang', lang);
    applyLanguageTheme(lang);
    set({ learningLang: lang });
    await get().init();
  },

  async init() {
    const { provider, learningLang, uiLang } = get();
    applyLanguageTheme(learningLang);
    applyUiDirection(uiLang);
    try {
      const user = await provider.ensureAnonymousUser();
      // Pilot (English): the content pack (words/phrases/situations) is not shipped yet, so a
      // missing pack is EXPECTED, not fatal — the Bootcamp is the pilot and needs no pack.
      // Content-driven screens gate themselves to "coming soon" when pack is null.
      let pack: ContentPack | null = null;
      try {
        pack = await provider.getContentPack(learningLang);
      } catch (err) {
        console.info('[app] no content pack for pilot language — Bootcamp-only mode', err);
      }
      if (provider instanceof ApiProvider) {
        // Multi-device restore: pull the merged server event log; local stays authoritative on failure.
        await provider.restore().catch((err) => console.warn('[app] restore skipped', err));
      }
      const plan = await provider.getTripPlan(user.id);
      const stateList = await provider.getMemoryStates(user.id);
      // "Entered" = has crossed the welcome screen before, or is a returning user with a plan
      // from the pre-pilot build. Either way, don't gate them behind the welcome again.
      const entered = localStorage.getItem('ready.entered') === '1' || plan !== null;
      set({
        user,
        pack,
        plan,
        states: new Map(stateList.map((s) => [s.itemId, s])),
        ...(pack ? toMaps(pack) : { itemsById: new Map(), situationById: new Map() }),
        // Every new user starts directly in the English pilot (the Bootcamp); the welcome/
        // language screen shows once, then hands off to it.
        view: entered ? 'bootcamp' : 'onboarding',
        loading: false,
        fatalError: null,
      });
    } catch (err) {
      console.error('[app] init failed', err);
      set({ loading: false, fatalError: 'loadError' });
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
    set({ plan, view: 'mission' });
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
