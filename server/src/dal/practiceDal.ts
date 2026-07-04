import { PracticeSessionModel, type PracticeSessionDoc } from '../models/content.js';

/** DAL for practice sessions — the only module that touches the PracticeSession model. */
export const practiceSessionDal = {
  create: (doc: PracticeSessionDoc) => PracticeSessionModel.create(doc),
  end: (id: string, patch: { endedAt: Date; correctCount?: number; wrongCount?: number; itemIds?: string[] }) =>
    PracticeSessionModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean(),
  byId: (id: string) => PracticeSessionModel.findById(id).lean(),
};
