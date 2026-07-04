import type { ContentItem, MemoryState, ReviewEvent } from '@ready/content-schema';
import { applyReview } from '@ready/engine';

/**
 * Project memory states from an append-only event log using the pure engine (PDF §11.4). This is
 * the same computation the server runs — memory state is a rebuildable cache, never authoritative.
 * Events are applied per item in timestamp order; the result is deterministic and idempotent.
 */
export function projectMemoryStates(
  events: ReviewEvent[],
  itemsById: Map<string, Pick<ContentItem, 'skillTarget'>>,
): Map<string, MemoryState> {
  const ordered = [...events].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const states = new Map<string, MemoryState>();
  for (const ev of ordered) {
    const item = itemsById.get(ev.itemId);
    if (!item) continue;
    const prev = states.get(ev.itemId) ?? null;
    states.set(ev.itemId, applyReview(prev, ev, item));
  }
  return states;
}

/** Merge new events into an existing log, de-duplicating by event id (idempotent sync). */
export function mergeEvents(existing: ReviewEvent[], incoming: ReviewEvent[]): ReviewEvent[] {
  const byId = new Map<string, ReviewEvent>();
  for (const e of existing) byId.set(e.id, e);
  for (const e of incoming) byId.set(e.id, e);
  return [...byId.values()].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}
