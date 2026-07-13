import { create } from 'zustand';
import type { CoreWord } from '../../shared/content/coreWords.js';

/**
 * Foundation UI + memory state — the single source of truth shared by the shell-mounted FAB, the
 * sheet, Universal Tap (open any word), and Smart Detection (viewed / dismissed).
 *
 * `viewed` and `dismissed` are concept ids (language-independent building-block identity) and are
 * persisted to localStorage so progress and the "Missing Foundation Brick" hint survive reloads.
 * Purely motivational — nothing here ever gates content. The sheet's internal navigation (category →
 * word list → word page) stays local component state; only cross-component intent lives here.
 */
const VIEWED_KEY = 'ready.foundation.viewed';
const DISMISSED_KEY = 'ready.foundation.dismissed';

function loadSet(key: string): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(raw) ? new Set(raw.filter((x): x is string => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}
function saveSet(key: string, set: ReadonlySet<string>): void {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch { /* storage full / disabled — non-fatal */ }
}

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
  /** A guided mini-session (mission "Learn now"): prev/next over the mission's Foundation words. */
  session: FoundationSession | null;
  /** Concept ids whose word page the learner has opened (drives progress + hint suppression). */
  viewed: Set<string>;
  /** Concept ids the learner dismissed from the hint (never nag again). */
  dismissed: Set<string>;

  /** Open on the category grid (the 🛟 FAB). */
  openSheet(): void;
  /** Open straight to a tapped word's page (Universal Tap). `surface` = the exact tapped text. */
  openWord(word: CoreWord, surface?: string): void;
  /** Open a guided mini-session over `words`, starting at `startIndex` (mission "Learn now"). */
  openSession(words: CoreWord[], startIndex: number): void;
  /** Move within the active session (clamped). */
  sessionGo(delta: number): void;
  /** True briefly after onboarding so the shell-mounted FAB can pulse to reveal itself. */
  pulse: boolean;
  firePulse(): void;
  clearPulse(): void;
  close(): void;
  /** Record that a word page was seen — marks the concept viewed (idempotent, persisted). */
  markViewed(conceptId: string): void;
  /** Suppress the Foundation hint for a concept (persisted). */
  dismiss(conceptId: string): void;
}

export const useFoundationStore = create<FoundationState>((set, get) => ({
  open: false,
  target: null,
  targetSurface: null,
  session: null,
  pulse: false,
  viewed: loadSet(VIEWED_KEY),
  dismissed: loadSet(DISMISSED_KEY),

  firePulse: () => set({ pulse: true }),
  clearPulse: () => set({ pulse: false }),

  openSheet: () => set({ open: true, target: null, targetSurface: null, session: null }),
  openWord: (word, surface) => set({ open: true, target: word, targetSurface: surface ?? null, session: null }),
  openSession: (words, startIndex) =>
    words.length === 0
      ? undefined
      : set({ open: true, target: null, targetSurface: null, session: { words, index: Math.min(Math.max(startIndex, 0), words.length - 1) } }),
  sessionGo: (delta) => {
    const s = get().session;
    if (!s) return;
    set({ session: { ...s, index: Math.min(Math.max(s.index + delta, 0), s.words.length - 1) } });
  },
  close: () => set({ open: false, target: null, targetSurface: null, session: null }),

  markViewed: (conceptId) => {
    if (get().viewed.has(conceptId)) return;
    const viewed = new Set(get().viewed).add(conceptId);
    saveSet(VIEWED_KEY, viewed);
    set({ viewed });
  },

  dismiss: (conceptId) => {
    if (get().dismissed.has(conceptId)) return;
    const dismissed = new Set(get().dismissed).add(conceptId);
    saveSet(DISMISSED_KEY, dismissed);
    set({ dismissed });
  },
}));
