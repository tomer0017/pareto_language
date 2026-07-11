import type { Outcome, PracticeMode, ReviewEvent } from '@ready/content-schema';
import { useAppStore } from '../stores/appStore.js';

/**
 * Record a review/evidence event through the ONE canonical event log (appStore.recordEvents →
 * the same append-only store the Bootcamp writes to). Used by the Core games so their evidence
 * counts exactly like every other drill. Failures never block the UI (offline-first).
 */
export function recordReview(itemId: string, mode: PracticeMode, outcome: Outcome, latencyMs?: number): void {
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
  void app.recordEvents([event]).catch((err) => console.warn('[review] event skipped', err));
}
