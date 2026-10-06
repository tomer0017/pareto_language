import { create } from 'zustand';
import type { CoreWord } from '../../shared/content/coreWords.js';
import { useAppStore } from '../../shared/stores/appStore.js';

/**
 * Foundation UI + memory state — the single source of truth shared by the sheet, Universal Tap
 * (open any word), the Journey / Free-learning openers and Smart Detection (viewed / dismissed).
 *
 * `viewed` and `dismissed` are concept ids, kept PER LEARNING LANGUAGE: having looked at "rojo" says
 * nothing about "red". The store exposes the ACTIVE language's sets (so consumers read `viewed` as
 * before) and persists every language under one key, `ready.foundation.v2`:
 *   { byLang: { en: { viewed: [...], dismissed: [...] }, es: {...} } }
 * The pre-2026-10-06 keys (`ready.foundation.viewed` / `.dismissed`) held ONE global set; on first
 * load they are migrated to the learning language that was active when they were written (the
 * stored `ready.lang`, else English) and removed — never copied to other languages.
 *
 * Purely motivational — nothing here ever gates content. The sheet's internal navigation stays local
 * component state; only cross-component intent lives here.
 */
const STORAGE_KEY = 'ready.foundation.v2';
const LEGACY_VIEWED_KEY = 'ready.foundation.viewed';
const LEGACY_DISMISSED_KEY = 'ready.foundation.dismissed';

interface LangMemory { viewed: string[]; dismissed: string[] }
type ByLang = Record<string, LangMemory>;

const strings = (raw: unknown): string[] => (Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);

/** The language the legacy (unscoped) progress belonged to: the one that was active when it was saved. */
function legacyOwner(): string {
  try { return localStorage.getItem('ready.lang') || 'en'; } catch { return 'en'; }
}

export function loadByLang(): ByLang {
  let byLang: ByLang = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { byLang?: Record<string, Partial<LangMemory>> }) : null;
    for (const [lang, m] of Object.entries(parsed?.byLang ?? {})) byLang[lang] = { viewed: strings(m?.viewed), dismissed: strings(m?.dismissed) };
  } catch { byLang = {}; }
  // One-time migration of the old global sets into the language they were earned in.
  try {
    const v = localStorage.getItem(LEGACY_VIEWED_KEY);
    const d = localStorage.getItem(LEGACY_DISMISSED_KEY);
    if (v !== null || d !== null) {
      const owner = legacyOwner();
      const cur = byLang[owner] ?? { viewed: [], dismissed: [] };
      byLang[owner] = {
        viewed: [...new Set([...cur.viewed, ...strings(JSON.parse(v ?? '[]'))])],
        dismissed: [...new Set([...cur.dismissed, ...strings(JSON.parse(d ?? '[]'))])],
      };
      localStorage.removeItem(LEGACY_VIEWED_KEY);
      localStorage.removeItem(LEGACY_DISMISSED_KEY);
      saveByLang(byLang);
    }
  } catch { /* unreadable legacy data is left alone */ }
  return byLang;
}

function saveByLang(byLang: ByLang): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ byLang })); } catch { /* storage full / disabled — non-fatal */ }
}

const activeLang = (): string => useAppStore.getState().learningLang;
const memoryOf = (byLang: ByLang, lang: string): LangMemory => byLang[lang] ?? { viewed: [], dismissed: [] };

/** A guided "Learn now" run over just the current mission's Foundation words. */
export interface FoundationSession {
  words: CoreWord[];
  index: number;
}

interface FoundationState {
  open: boolean;
  /** When set, the sheet opens straight to this word's page (Universal Tap); null = category grid. */
  target: CoreWord | null;
  /** The exact surface the learner tapped inline (e.g. "combien"), so the page shows THAT form, not
   *  the pack's canonical realization ("Combien ?"). Null for browse/FAB opens. */
  targetSurface: string | null;
  /** All senses of the tapped surface when it is a homograph (e.g. book noun/verb) — lets the sheet
   *  offer the other meaning(s). Null when the surface has a single sense. */
  targetSenses: CoreWord[] | null;
  /** A guided mini-session (mission "Learn now"): prev/next over the mission's Foundation words. */
  session: FoundationSession | null;
  /** The learning language whose memory `viewed` / `dismissed` currently show. */
  lang: string;
  /** Every language's memory (persisted). */
  byLang: ByLang;
  /** Concept ids whose word page the learner has opened IN THE ACTIVE LANGUAGE (progress + hint suppression). */
  viewed: Set<string>;
  /** Concept ids the learner dismissed from the hint in the active language (never nag again). */
  dismissed: Set<string>;

  /** Open on the category grid. */
  openSheet(): void;
  /** Open straight to a tapped word's page (Universal Tap). `surface` = the exact tapped text;
   *  `senses` = all senses when the surface is a homograph (primary first). */
  openWord(word: CoreWord, surface?: string, senses?: CoreWord[]): void;
  /** Open a guided mini-session over `words`, starting at `startIndex` (mission "Learn now"). */
  openSession(words: CoreWord[], startIndex: number): void;
  /** Move within the active session (clamped). */
  sessionGo(delta: number): void;
  close(): void;
  /** Record that a word page was seen — marks the concept viewed for the active language (idempotent, persisted). */
  markViewed(conceptId: string): void;
  /** Suppress the Foundation hint for a concept in the active language (persisted). */
  dismiss(conceptId: string): void;
  /** Show another language's memory (called when the learning language changes). */
  switchLang(lang: string): void;
}

const initialByLang = loadByLang();
const initialLang = activeLang();

export const useFoundationStore = create<FoundationState>((set, get) => ({
  open: false,
  target: null,
  targetSurface: null,
  targetSenses: null,
  session: null,
  lang: initialLang,
  byLang: initialByLang,
  viewed: new Set(memoryOf(initialByLang, initialLang).viewed),
  dismissed: new Set(memoryOf(initialByLang, initialLang).dismissed),

  openSheet: () => set({ open: true, target: null, targetSurface: null, targetSenses: null, session: null }),
  openWord: (word, surface, senses) =>
    set({ open: true, target: word, targetSurface: surface ?? null, targetSenses: senses && senses.length > 1 ? senses : null, session: null }),
  openSession: (words, startIndex) =>
    words.length === 0
      ? undefined
      : set({ open: true, target: null, targetSurface: null, targetSenses: null, session: { words, index: Math.min(Math.max(startIndex, 0), words.length - 1) } }),
  sessionGo: (delta) => {
    const s = get().session;
    if (!s) return;
    set({ session: { ...s, index: Math.min(Math.max(s.index + delta, 0), s.words.length - 1) } });
  },
  close: () => set({ open: false, target: null, targetSurface: null, targetSenses: null, session: null }),

  markViewed: (conceptId) => {
    if (get().viewed.has(conceptId)) return;
    const viewed = new Set(get().viewed).add(conceptId);
    const { lang, byLang } = get();
    const next = { ...byLang, [lang]: { viewed: [...viewed], dismissed: [...get().dismissed] } };
    saveByLang(next);
    set({ viewed, byLang: next });
  },

  dismiss: (conceptId) => {
    if (get().dismissed.has(conceptId)) return;
    const dismissed = new Set(get().dismissed).add(conceptId);
    const { lang, byLang } = get();
    const next = { ...byLang, [lang]: { viewed: [...get().viewed], dismissed: [...dismissed] } };
    saveByLang(next);
    set({ dismissed, byLang: next });
  },

  switchLang: (lang) => {
    if (get().lang === lang) return;
    const m = memoryOf(get().byLang, lang);
    set({ lang, viewed: new Set(m.viewed), dismissed: new Set(m.dismissed) });
  },
}));

// The memory shown always belongs to the language being learned.
useAppStore.subscribe((state, previous) => {
  if (state.learningLang !== previous.learningLang) useFoundationStore.getState().switchLang(state.learningLang);
});
