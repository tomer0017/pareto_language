import { create } from 'zustand';
import type { Outcome, PracticeMode, ReviewEvent } from '@ready/content-schema';
import { useAppStore } from '../../shared/stores/appStore.js';
import { PILOT_LANG } from '../../shared/i18n/languages.js';
import { DAYS, MISSIONS_BY_LANG, missionsFor } from './registry.js';
import { fromStored, migrateV1, toStored, type BootcampProgress, type StoredProgress } from './progress.js';
import type { BootcampDayContent } from './types.js';

/**
 * Bootcamp runtime + persistence (Sprint 6). Progress and receipts live in localStorage
 * (offline-first, engine-independent); every drill ALSO appends real ReviewEvents to the
 * event log. The mission sets themselves live in the PURE, store-free `registry.ts` (so parity
 * checks and tests can import them without booting the app); this store just selects the set for
 * the active learning language and drives the runtime. Adding a language = register it there.
 */

// Re-exported for the many existing consumers/tests that import these from the store.
export { DAYS, MISSIONS_BY_LANG, missionsFor };

/** The mission set for the ACTIVE learning language (store-internal; reads the app store). */
function activeMissions(): Record<number, BootcampDayContent> {
  return missionsFor(useAppStore.getState().learningLang);
}

// Progress is PER LEARNING LANGUAGE: English completions must never appear on the French map (and
// vice-versa), and switching languages must never resume/next into another language's mission.
// On disk (v2) it is keyed by stable mission id — see progress.ts. Two older layouts migrate once,
// and are left untouched on disk: v1 per-language (`ready.bootcamp.v1.<lang>`, raw day numbers of
// the 30-mission plan) and the pre-multilingual pilot key (`ready.bootcamp.v1`, English only).
const STORAGE_PREFIX = 'ready.bootcamp.v2';
const V1_PREFIX = 'ready.bootcamp.v1';
const keyFor = (lang: string): string => `${STORAGE_PREFIX}.${lang}`;
const currentLang = (): string => useAppStore.getState().learningLang;
const EMPTY: BootcampProgress = { completedDays: [], receipts: [], stepIndex: {} };

function readKey<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.warn('[bootcamp] progress unreadable — starting fresh', err);
    return null;
  }
}

function loadProgress(lang: string): BootcampProgress {
  const own = readKey<Partial<StoredProgress>>(keyFor(lang));
  if (own) return fromStored(own);
  const v1 = readKey<Partial<BootcampProgress>>(`${V1_PREFIX}.${lang}`)
    ?? (lang === PILOT_LANG ? readKey<Partial<BootcampProgress>>(V1_PREFIX) : null);
  if (v1) {
    const migrated = fromStored(migrateV1(v1));
    persist(lang, migrated);
    return migrated;
  }
  return { ...EMPTY };
}

interface BootcampState extends BootcampProgress {
  activeDay: number | null;
  index: number;
  /** Within an active mission: the hub (three learning modes) or the practice step-flow. */
  stage: 'hub' | 'play';

  startDay(day: number): void;
  /** Enter the step-flow: at the saved resume point, or at an explicit step (the mission
   *  overview's Learn / Practice entries), which also becomes the new resume point. */
  enterPractice(at?: number): void;
  restartDay(): void;
  toHub(): void;
  next(): void;
  addReceipt(text: string): void;
  recordDrill(itemId: string, mode: PracticeMode, outcome: Outcome, latencyMs?: number): void;
  completeDay(): void;
  exit(): void;
  currentDay(): BootcampDayContent | null;
}

function persist(lang: string, state: BootcampProgress): void {
  try {
    localStorage.setItem(keyFor(lang), JSON.stringify(toStored(state)));
  } catch (err) {
    console.warn('[bootcamp] persist failed', err);
  }
}

export const useBootcampStore = create<BootcampState>((set, get) => ({
  ...loadProgress(currentLang()),
  activeDay: null,
  index: 0,
  stage: 'hub',

  // Selecting a mission opens its hub (the three learning modes), not the step-flow directly.
  startDay(day) {
    const resume = get().stepIndex[String(day)] ?? 0;
    const content = activeMissions()[day];
    const max = content ? content.steps.length - 1 : 0;
    set({ activeDay: day, index: Math.min(resume, max), stage: 'hub' });
  },

  enterPractice(at) {
    // Start (or resume) practice at the persisted step: 0 for a fresh/completed mission,
    // the saved point for an in-progress one. Recomputed here so the hub is the source of truth.
    const { activeDay, completedDays, receipts, stepIndex } = get();
    if (at !== undefined && activeDay !== null) {
      const si = { ...stepIndex, [String(activeDay)]: at };
      persist(currentLang(), { completedDays, receipts, stepIndex: si });
      set({ stage: 'play', index: at, stepIndex: si });
      return;
    }
    const resume = activeDay === null ? 0 : (stepIndex[String(activeDay)] ?? 0);
    set({ stage: 'play', index: resume });
  },

  /** Restart ONLY the active mission's practice progress (resume point → 0), then enter it fresh.
   *  Never touches completedDays, receipts, review events, or any other mission — those are
   *  bootcamp completion / statistics / review data and stay intact. */
  restartDay() {
    const { activeDay, completedDays, receipts, stepIndex } = get();
    if (activeDay === null) return;
    const si = { ...stepIndex, [String(activeDay)]: 0 };
    persist(currentLang(), { completedDays, receipts, stepIndex: si });
    set({ stepIndex: si, stage: 'play', index: 0 });
  },

  toHub() {
    set({ stage: 'hub' });
  },

  next() {
    const { activeDay, index, completedDays, receipts, stepIndex } = get();
    if (activeDay === null) return;
    const nextIndex = index + 1;
    const si = { ...stepIndex, [String(activeDay)]: nextIndex };
    persist(currentLang(), { completedDays, receipts, stepIndex: si });
    set({ index: nextIndex, stepIndex: si });
  },

  addReceipt(text) {
    const { activeDay, completedDays, receipts, stepIndex } = get();
    if (activeDay === null) return;
    if (receipts.some((r) => r.day === activeDay && r.text === text)) return; // no dup receipts on resume
    const next = [...receipts, { day: activeDay, text, at: new Date().toISOString() }];
    persist(currentLang(), { completedDays, receipts: next, stepIndex });
    set({ receipts: next });
  },

  /** Real evidence into the append-only log; failures never block bootcamp flow. */
  recordDrill(itemId, mode, outcome, latencyMs) {
    const app = useAppStore.getState();
    if (!app.user) return;
    const event: ReviewEvent = {
      id: crypto.randomUUID(),
      userId: app.user.id,
      itemId,
      mode,
      outcome,
      at: new Date().toISOString(),
      ...(latencyMs !== undefined ? { latencyMs } : {}),
    };
    void app.recordEvents([event]).catch((err) => console.warn('[bootcamp] event skipped', err));
  },

  completeDay() {
    const { activeDay, completedDays, receipts, stepIndex } = get();
    if (activeDay === null) return;
    const done = completedDays.includes(activeDay) ? completedDays : [...completedDays, activeDay];
    const si = { ...stepIndex, [String(activeDay)]: 0 }; // replayable from the top
    persist(currentLang(), { completedDays: done, receipts, stepIndex: si });
    // Persisted resume resets to 0 (replayable from the top); the live index is left where it is
    // so the Victory screen stays on-screen. enterPractice() re-reads stepIndex when replaying.
    set({ completedDays: done, stepIndex: si });
  },

  exit() {
    set({ activeDay: null, index: 0 });
  },

  currentDay() {
    const { activeDay } = get();
    return activeDay === null ? null : (activeMissions()[activeDay] ?? null);
  },
}));

// Switching the learning language swaps in THAT language's progress and drops any active mission,
// so the map/Home/Victory never show another language's completions or resume into its missions.
let lastLang = currentLang();
useAppStore.subscribe((s) => {
  if (s.learningLang === lastLang) return;
  lastLang = s.learningLang;
  useBootcampStore.setState({ ...loadProgress(lastLang), activeDay: null, index: 0, stage: 'hub' });
});
