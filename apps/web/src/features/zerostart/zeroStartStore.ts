import { create } from 'zustand';

/**
 * Zero-Beginner Path runtime + persistence. Mirrors the Reading/Bootcamp stores exactly: durable
 * progress lives in localStorage under one namespaced key (offline-first, engine-independent), keyed
 * PER LEARNING LANGUAGE so en/fr/es progress never collide. Only durable facts are stored (completed
 * step ids, a completion date, and the learner's saved name); the "currently open step" is derived at
 * runtime from the completed set (see `resumePosition`) and never persisted — so a refresh resumes at
 * the first incomplete step rather than auto-opening a lesson.
 *
 * Foundation progress is synced by the RENDERER (it calls `useFoundationStore.markViewed` for a
 * chunk's concept id), keeping the two stores decoupled and the sync idempotent (viewed is a set).
 */

const STORAGE_KEY = 'ready.zerostart.v1';

interface LangProgress {
  /** Completed step ids ("moduleId:index"). */
  done: string[];
  /** ISO date the path was completed, if it has been. */
  completedAt?: string;
}

interface ZeroPersisted {
  byLang: Record<string, LangProgress>;
  /** The learner's saved display name (used in introduction exercises), or null. Not per-language. */
  name: string | null;
}

const DEFAULT: ZeroPersisted = { byLang: {}, name: null };

function load(): ZeroPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<ZeroPersisted>;
    return {
      byLang: p.byLang && typeof p.byLang === 'object' ? p.byLang : {},
      name: typeof p.name === 'string' && p.name.trim() ? p.name : null,
    };
  } catch {
    return { ...DEFAULT };
  }
}

function save(state: ZeroPersisted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ byLang: state.byLang, name: state.name }));
  } catch {
    /* private mode / SSR — non-fatal */
  }
}

const EMPTY: LangProgress = { done: [] };

interface ZeroState extends ZeroPersisted {
  /** The completed-step set for a language (new Set each read is fine — lists are tiny). */
  doneSet(lang: string): Set<string>;
  isDone(lang: string, stepId: string): boolean;
  /** Mark a step complete (idempotent, persisted). */
  completeStep(lang: string, stepId: string): void;
  /** Record the path completion date once (idempotent). */
  markPathComplete(lang: string): void;
  /** Wipe a language's progress (Restart path — the UI confirms first). */
  restart(lang: string): void;
  setName(name: string | null): void;
}

export const useZeroStartStore = create<ZeroState>((set, get) => ({
  ...load(),

  doneSet(lang) {
    return new Set((get().byLang[lang] ?? EMPTY).done);
  },

  isDone(lang, stepId) {
    return (get().byLang[lang] ?? EMPTY).done.includes(stepId);
  },

  completeStep(lang, stepId) {
    const cur = get().byLang[lang] ?? EMPTY;
    if (cur.done.includes(stepId)) return;
    const next = { ...get().byLang, [lang]: { ...cur, done: [...cur.done, stepId] } };
    set({ byLang: next });
    save(get());
  },

  markPathComplete(lang) {
    const cur = get().byLang[lang] ?? EMPTY;
    if (cur.completedAt) return;
    const next = { ...get().byLang, [lang]: { ...cur, completedAt: new Date().toISOString() } };
    set({ byLang: next });
    save(get());
  },

  restart(lang) {
    const next = { ...get().byLang, [lang]: { done: [] } };
    set({ byLang: next });
    save(get());
  },

  setName(name) {
    const clean = name?.trim() ? name.trim() : null;
    set({ name: clean });
    save(get());
  },
}));
