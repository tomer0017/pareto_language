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

interface FoundationState {
  open: boolean;
  /** When set, the sheet opens straight to this word's page (Universal Tap); null = category grid. */
  target: CoreWord | null;
  /** Concept ids whose word page the learner has opened (drives progress + hint suppression). */
  viewed: Set<string>;
  /** Concept ids the learner dismissed from the hint (never nag again). */
  dismissed: Set<string>;

  /** Open on the category grid (the 🛟 FAB). */
  openSheet(): void;
  /** Open straight to a tapped word's page (Universal Tap, from anywhere in the app). */
  openWord(word: CoreWord): void;
  close(): void;
  /** Record that a word page was seen — marks the concept viewed (idempotent, persisted). */
  markViewed(conceptId: string): void;
  /** Suppress the Foundation hint for a concept (persisted). */
  dismiss(conceptId: string): void;
}

export const useFoundationStore = create<FoundationState>((set, get) => ({
  open: false,
  target: null,
  viewed: loadSet(VIEWED_KEY),
  dismissed: loadSet(DISMISSED_KEY),

  openSheet: () => set({ open: true, target: null }),
  openWord: (word) => set({ open: true, target: word }),
  close: () => set({ open: false, target: null }),

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
