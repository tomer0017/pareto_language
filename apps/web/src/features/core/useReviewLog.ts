import { useEffect, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore.js';
import type { ReviewLogEntry } from './review.js';

/**
 * The learner's real review log (the append-only events every mission drill writes), read once
 * from the local-first data provider. `null` while loading or when it cannot be read — callers
 * then show nothing rather than a guessed number.
 */
export function useReviewLog(): ReviewLogEntry[] | null {
  const provider = useAppStore((s) => s.provider);
  const userId = useAppStore((s) => s.user?.id);
  const [log, setLog] = useState<ReviewLogEntry[] | null>(null);
  useEffect(() => {
    if (!userId) return;
    let live = true;
    provider.getReviewEvents(userId)
      .then((events) => { if (live) setLog(events.map((e) => ({ itemId: e.itemId, outcome: e.outcome, at: e.at }))); })
      .catch((err) => console.warn('[review] log unavailable', err));
    return () => { live = false; };
  }, [provider, userId]);
  return log;
}
