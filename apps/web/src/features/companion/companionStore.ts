import { create } from 'zustand';
import { useAppStore } from '../../shared/stores/appStore.js';
import { BOOTCAMP_PLAN } from '../bootcamp/plan.js';
import { toStored } from '../bootcamp/progress.js';
import { useBootcampStore } from '../bootcamp/bootcampStore.js';
import {
  acknowledge, applyEvents, deriveFromHistory, missionEvents, newCompanion, pendingEvolution, sanitize, stageProgress,
  type CompanionEvent, type CompanionStage, type LanguageCompanion, type StageProgress,
} from './companionModel.js';

/**
 * Companion state — one record per LEARNING language, persisted in localStorage like the rest of
 * READY's local-first progress (`ready.companion.v1`).
 *
 * The store LISTENS; it is never called by the mission code. It watches the Bootcamp store and turns
 * newly completed missions into growth events, so the curriculum and the Practice flow know nothing
 * about the mascot. Future growth sources (stories, review, conversation) call `record` directly.
 */
const STORAGE_KEY = 'ready.companion.v1';
type ByLang = Record<string, LanguageCompanion>;

function load(): ByLang {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    const out: ByLang = {};
    for (const [lang, value] of Object.entries(parsed as Record<string, unknown>)) {
      const clean = sanitize(value);
      if (clean) out[lang] = clean;
    }
    return out;
  } catch (err) {
    console.warn('[companion] progress unreadable — deriving it again', err);
    return {};
  }
}

function persist(byLang: ByLang): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(byLang));
  } catch (err) {
    console.warn('[companion] persist failed', err);
  }
}

const CHECKPOINTS = new Set(BOOTCAMP_PLAN.filter((m) => m.checkpoint).map((m) => m.id));
const isCheckpoint = (id: string): boolean => CHECKPOINTS.has(id);

interface CompanionState {
  byLang: ByLang;
  /** Bring a language's companion up to date with its completed missions (stable mission ids).
   *  The FIRST time a language is seen its record is derived from history, silently. */
  sync(lang: string, completedMissionIds: readonly string[]): void;
  /** Count growth events from any source. Idempotent by event key. */
  record(lang: string, events: readonly CompanionEvent[]): void;
  /** The learner has seen the evolution that was owed. */
  acknowledge(lang: string): void;
}

export const useCompanionStore = create<CompanionState>((set, get) => {
  const write = (lang: string, next: LanguageCompanion): void => {
    const byLang = { ...get().byLang, [lang]: next };
    persist(byLang);
    set({ byLang });
  };
  return {
    byLang: load(),
    sync(lang, completedMissionIds) {
      const events = missionEvents(completedMissionIds, isCheckpoint);
      const current = get().byLang[lang];
      if (!current) { write(lang, deriveFromHistory(events)); return; }
      const next = applyEvents(current, events);
      if (next !== current) write(lang, next);
    },
    record(lang, events) {
      const current = get().byLang[lang] ?? newCompanion();
      const next = applyEvents(current, events);
      if (next !== current || !get().byLang[lang]) write(lang, next);
    },
    acknowledge(lang) {
      const current = get().byLang[lang];
      if (!current) return;
      const next = acknowledge(current);
      if (next !== current) write(lang, next);
    },
  };
});

/* ── wiring: follow the active language's mission progress ─────────────────────────────────────── */

const activeLang = (): string => useAppStore.getState().learningLang;
const completedIds = (): string[] => toStored({ completedDays: useBootcampStore.getState().completedDays, receipts: [], stepIndex: {} }).completed;
const syncActive = (): void => useCompanionStore.getState().sync(activeLang(), completedIds());

syncActive();
// The Bootcamp store swaps in another language's progress when the learning language changes, so
// this one subscription covers both "a mission was completed" and "the language was switched".
useBootcampStore.subscribe((state, previous) => {
  if (state.completedDays !== previous.completedDays) syncActive();
});
useAppStore.subscribe((state, previous) => {
  if (state.learningLang !== previous.learningLang) syncActive();
});

/* ── read side ─────────────────────────────────────────────────────────────────────────────────── */

export interface ActiveCompanion {
  lang: string;
  companion: LanguageCompanion;
  stage: CompanionStage;
  progress: StageProgress;
  /** An evolution the learner has not seen yet. */
  evolution: { from: CompanionStage; to: CompanionStage } | null;
}

/** One language's companion, read from the per-language records (pure). */
export function activeCompanion(byLang: Readonly<Record<string, LanguageCompanion>>, lang: string): ActiveCompanion {
  const companion = byLang[lang] ?? newCompanion();
  return { lang, companion, stage: companion.stage, progress: stageProgress(companion), evolution: pendingEvolution(companion) };
}

/** The companion of the language the learner is studying right now. */
export function useCompanion(): ActiveCompanion {
  const lang = useAppStore((s) => s.learningLang);
  const byLang = useCompanionStore((s) => s.byLang);
  return activeCompanion(byLang, lang);
}
