import mongoose, { Schema } from 'mongoose';
import type { Concept, ContentPack, QualityLevel } from '@ready/content-schema';

const QUALITY_LEVELS = ['draft', 'ai_generated', 'ai_reviewed', 'native_reviewed', 'expert_approved', 'verified'];

/** Append-only per-item audit trail (Sprint 4 quality workflow). */
const changelogSchema = new Schema(
  { at: { type: Date, required: true }, actor: String, action: { type: String, required: true }, note: String },
  { _id: false },
);
export interface ChangelogEntry { at: Date; actor?: string; action: string; note?: string }

/**
 * Content collections — MongoDB is the authoritative content store for the API; the pipeline's
 * versioned JSON packs remain the client's offline fallback (one source of truth: the authored
 * YAML + vocabulary bank; seeds derive both). Timestamps are managed by Mongoose.
 */

export interface WordDoc {
  _id: string; // stable content id, e.g. "it.word.transport.exit-w" or "bank.fr.tout"
  languageCode: string;
  word: string;
  translit?: string;
  pos?: string;
  gender?: string;
  level?: string;
  forms?: { form: string; label: string }[];
  /** uiLang → translation, e.g. { en: 'exit', he: 'יציאה' } */
  translations: Record<string, string>;
  example?: Record<string, string>;
  tags?: string[];
  source?: string;
  quality?: QualityLevel;
  rolScore?: number;
  conceptId?: string;
  changelog?: ChangelogEntry[];
}

const wordSchema = new Schema<WordDoc>(
  {
    _id: { type: String, required: true },
    languageCode: { type: String, required: true },
    word: { type: String, required: true },
    translit: String,
    pos: String,
    gender: String,
    level: String,
    forms: [{ form: String, label: String, _id: false }],
    translations: { type: Map, of: String, required: true },
    example: { type: Map, of: String },
    tags: [String],
    source: String,
    quality: { type: String, enum: QUALITY_LEVELS, default: 'ai_generated' },
    rolScore: Number,
    conceptId: String,
    changelog: { type: [changelogSchema], default: [] },
  },
  { versionKey: false, timestamps: true },
);
wordSchema.index({ languageCode: 1, word: 1 });
wordSchema.index({ languageCode: 1, tags: 1 });
wordSchema.index({ conceptId: 1 });
wordSchema.index({ languageCode: 1, quality: 1 });

export interface PhraseDoc {
  _id: string;
  languageCode: string;
  text: string;
  translit?: string;
  level?: string;
  situationSlug?: string;
  translations: Record<string, string>;
  example?: Record<string, string>;
  tags?: string[];
  source?: string;
  quality?: QualityLevel;
  rolScore?: number;
  conceptId?: string;
  changelog?: ChangelogEntry[];
}

const phraseSchema = new Schema<PhraseDoc>(
  {
    _id: { type: String, required: true },
    languageCode: { type: String, required: true },
    text: { type: String, required: true },
    translit: String,
    level: String,
    situationSlug: String,
    translations: { type: Map, of: String, required: true },
    example: { type: Map, of: String },
    tags: [String],
    source: String,
    quality: { type: String, enum: QUALITY_LEVELS, default: 'ai_generated' },
    rolScore: Number,
    conceptId: String,
    changelog: { type: [changelogSchema], default: [] },
  },
  { versionKey: false, timestamps: true },
);
phraseSchema.index({ languageCode: 1, situationSlug: 1 });
phraseSchema.index({ conceptId: 1 });
phraseSchema.index({ languageCode: 1, quality: 1 });

export interface SituationDoc {
  _id: string;
  slug: string;
  languageCode: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  icon?: string;
  accentColor?: string;
  phraseIds?: string[];
  readinessCategory?: string;
}

const situationSchema = new Schema<SituationDoc>(
  {
    _id: { type: String, required: true },
    slug: { type: String, required: true },
    languageCode: { type: String, required: true },
    title: { type: Map, of: String, required: true },
    description: { type: Map, of: String },
    icon: String,
    accentColor: String,
    phraseIds: [String],
    readinessCategory: String,
  },
  { versionKey: false, timestamps: true },
);
situationSchema.index({ languageCode: 1, slug: 1 }, { unique: true });

export type PackStatus = 'active' | 'coming_soon' | 'draft';

export interface ContentPackDoc {
  _id: string; // `${languageCode}` — one row per language
  languageCode: string;
  status: PackStatus;
  version: string;
  wordCount: number;
  phraseCount: number;
  situationCount: number;
  validated: boolean;
  notes?: string;
  qualityHistogram?: Record<string, number>;
  gateReport?: { activeEligible: boolean; reasons: string[]; computedAt: Date };
  /** Canonical engine ContentPack payload (active packs only) — what the PWA consumes. */
  payload?: ContentPack;
}

const contentPackSchema = new Schema<ContentPackDoc>(
  {
    _id: { type: String, required: true },
    languageCode: { type: String, required: true, unique: true },
    status: { type: String, required: true, enum: ['active', 'coming_soon', 'draft'] },
    version: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    phraseCount: { type: Number, default: 0 },
    situationCount: { type: Number, default: 0 },
    validated: { type: Boolean, default: false },
    notes: String,
    qualityHistogram: { type: Map, of: Number },
    gateReport: { activeEligible: Boolean, reasons: [String], computedAt: Date },
    payload: { type: Schema.Types.Mixed },
  },
  { versionKey: false, timestamps: true },
);

export interface PracticeSessionDoc {
  _id: string;
  userId?: string;
  anonymousId?: string;
  languageCode: string;
  mode: string;
  startedAt: Date;
  endedAt?: Date;
  itemIds: string[];
  correctCount: number;
  wrongCount: number;
}

const practiceSessionSchema = new Schema<PracticeSessionDoc>(
  {
    _id: { type: String, required: true },
    userId: String,
    anonymousId: String,
    languageCode: { type: String, required: true },
    mode: { type: String, required: true },
    startedAt: { type: Date, required: true },
    endedAt: Date,
    itemIds: { type: [String], default: [] },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: true },
);
practiceSessionSchema.index({ userId: 1, startedAt: -1 });

export type ConceptDoc = Omit<Concept, 'id'> & { _id: string; changelog?: ChangelogEntry[] };

const conceptSchema = new Schema<ConceptDoc>(
  {
    _id: { type: String, required: true },
    kind: { type: String, required: true },
    gloss: { type: Map, of: String, required: true },
    categories: { type: [String], required: true },
    rof: { type: Number, required: true },
    layer: { type: Number, required: true },
    skillTarget: { type: String, required: true },
    role: String,
    isOpener: { type: Boolean, default: false },
    situationSlugs: { type: [String], default: [] },
    rolComponents: { type: Schema.Types.Mixed },
    rolScore: Number,
    neverTeach: { type: Boolean, default: false },
    realizations: { type: Schema.Types.Mixed, default: {} },
    notes: String,
    changelog: { type: [changelogSchema], default: [] },
  },
  { versionKey: false, timestamps: true },
);
conceptSchema.index({ kind: 1, layer: 1 });
conceptSchema.index({ situationSlugs: 1 });
conceptSchema.index({ neverTeach: 1 });

export const ConceptModel = mongoose.model('Concept', conceptSchema, 'concepts');
export const WordModel = mongoose.model('Word', wordSchema, 'words');
export const PhraseModel = mongoose.model('Phrase', phraseSchema, 'phrases');
export const SituationModel = mongoose.model('Situation', situationSchema, 'situations');
export const ContentPackModel = mongoose.model('ContentPack', contentPackSchema, 'contentPacks');
export const PracticeSessionModel = mongoose.model('PracticeSession', practiceSessionSchema, 'practiceSessions');
