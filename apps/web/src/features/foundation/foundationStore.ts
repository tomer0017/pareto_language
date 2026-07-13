import { create } from 'zustand';

/**
 * Foundation open/close state — the single source of truth shared by the shell-mounted FAB and the
 * sheet, so neither owns the other. Deliberately tiny: the sheet's INTERNAL navigation (category →
 * word list → word page) is local component state, not global. Purely UI; never persisted.
 */
interface FoundationState {
  open: boolean;
  openSheet(): void;
  close(): void;
}

export const useFoundationStore = create<FoundationState>((set) => ({
  open: false,
  openSheet: () => set({ open: true }),
  close: () => set({ open: false }),
}));
