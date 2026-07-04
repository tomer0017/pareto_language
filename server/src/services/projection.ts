import { projectAll } from '@ready/engine';
import type { MemoryState, ReviewEvent } from '@ready/content-schema';
import { MemoryStateModel, ReviewEventModel } from '../models/index.js';
import { itemsById } from './content.js';

/**
 * memoryStates is a rebuildable projection of the append-only reviewEvents log, computed by the
 * SAME engine code the client runs (PDF §11.4, Decision 1). Never authoritative; always
 * recomputable when the algorithm improves.
 */
export async function reprojectUser(userId: string): Promise<MemoryState[]> {
  const events = (await ReviewEventModel.find({ userId }).lean()) as unknown as (ReviewEvent & {
    _id: string;
  })[];
  const normalized: ReviewEvent[] = events.map((e) => ({ ...e, id: e._id }));
  const states = projectAll(normalized, itemsById());
  const list = [...states.values()];
  await MemoryStateModel.bulkWrite(
    list.map((s) => ({
      updateOne: {
        filter: { userId: s.userId, itemId: s.itemId },
        update: { $set: s },
        upsert: true,
      },
    })),
    { ordered: false },
  );
  return list;
}
