import type { ContentItem, MemoryState, PracticeMode } from '@ready/content-schema';

/**
 * Mode mixing (PDF §9.1). Given an item and its current memory state, choose the drill that best
 * advances it along the knowledge ladder. Shared by the scheduler (to estimate cost) and the UI
 * Session Player (to pick the actual drill).
 */
export function recommendedMode(item: ContentItem, state: MemoryState | null): PracticeMode {
  const level = state?.level ?? 0;

  if (item.kind === 'number') return 'numberSprint';
  if (item.kind === 'reply') return 'listen';

  if (item.kind === 'word') {
    // Recognition vocabulary: swipe to introduce/claim, then verify by listening (§9.1).
    return level === 0 ? 'swipe' : 'listen';
  }

  // Phrases: Echo to introduce, then Flash Recall to build production recall (§9.1).
  if (level === 0) return 'echo';
  return 'flashRecall';
}

/** Estimated seconds a single drill of this item costs, used by the scheduler's cost model. */
export function estimateSeconds(item: ContentItem, state: MemoryState | null): number {
  const mode = recommendedMode(item, state);
  switch (mode) {
    case 'numberSprint':
      return 4;
    case 'swipe':
      return 3;
    case 'listen':
      return 6;
    case 'echo':
      return 10;
    case 'flashRecall':
      return 8;
    case 'simulator':
      return 75;
  }
}
