import type { Model } from 'mongoose';
import {
  ContentPackModel,
  PhraseModel,
  SituationModel,
  WordModel,
  type ContentPackDoc,
  type PhraseDoc,
  type SituationDoc,
  type WordDoc,
} from '../models/content.js';

/** DAL — the only module that touches the content Mongoose models. */

export interface UpsertSummary {
  inserted: number;
  updated: number;
  skipped: number;
}

async function upsertMany<T extends { _id: string }>(
  model: Model<T>,
  docs: T[],
): Promise<UpsertSummary> {
  const summary: UpsertSummary = { inserted: 0, updated: 0, skipped: 0 };
  if (docs.length === 0) return summary;
  const writes = docs.map((d) => ({
    updateOne: { filter: { _id: d._id }, update: { $set: d }, upsert: true },
  }));
  // Mongoose generic bulkWrite typings cannot express this per-T; runtime shape is correct.
  const result = await model.bulkWrite(writes as never, { ordered: false });
  summary.inserted = result.upsertedCount;
  summary.updated = result.modifiedCount;
  summary.skipped = docs.length - result.upsertedCount - result.modifiedCount; // unchanged
  return summary;
}

export const wordDal = {
  upsertMany: (docs: WordDoc[]) => upsertMany(WordModel, docs),
  list: (languageCode: string, limit = 2000) =>
    WordModel.find({ languageCode }).sort({ _id: 1 }).limit(limit).lean(),
  byId: (id: string) => WordModel.findById(id).lean(),
  count: (languageCode: string) => WordModel.countDocuments({ languageCode }),
};

export const phraseDal = {
  upsertMany: (docs: PhraseDoc[]) => upsertMany(PhraseModel, docs),
  list: (languageCode: string, situationSlug?: string) =>
    PhraseModel.find({ languageCode, ...(situationSlug ? { situationSlug } : {}) })
      .sort({ _id: 1 })
      .lean(),
  byId: (id: string) => PhraseModel.findById(id).lean(),
  count: (languageCode: string) => PhraseModel.countDocuments({ languageCode }),
};

export const situationDal = {
  upsertMany: (docs: SituationDoc[]) => upsertMany(SituationModel, docs),
  list: (languageCode: string) => SituationModel.find({ languageCode }).sort({ _id: 1 }).lean(),
  bySlug: (languageCode: string, slug: string) => SituationModel.findOne({ languageCode, slug }).lean(),
  count: (languageCode: string) => SituationModel.countDocuments({ languageCode }),
};

export const packDal = {
  upsert: (doc: ContentPackDoc) =>
    ContentPackModel.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true }),
  list: () => ContentPackModel.find().sort({ languageCode: 1 }).select('-payload').lean(),
  byLanguage: (languageCode: string, withPayload = false) =>
    ContentPackModel.findOne({ languageCode })
      .select(withPayload ? {} : '-payload')
      .lean(),
};
