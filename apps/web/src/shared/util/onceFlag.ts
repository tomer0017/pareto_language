/**
 * Tiny once-per-user flags, persisted to localStorage. Used for first-time onboarding hints (swipe
 * coach, long-press tip) so each is shown exactly once and never nags. Storage disabled (private
 * mode) → treated as "already seen" so we never loop the hint.
 */
export function hasSeen(key: string): boolean {
  try { return localStorage.getItem(key) === '1'; } catch { return true; }
}

export function markSeen(key: string): void {
  try { localStorage.setItem(key, '1'); } catch { /* non-fatal */ }
}
