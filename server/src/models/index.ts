import mongoose, { Schema } from 'mongoose';
import type {
  MemoryState,
  ReviewEvent,
  SessionLog,
  TripPlan,
  UserProfile,
} from '@ready/content-schema';

/**
 * MongoDB collections + indexes (PDF §12.3). User state ONLY — content never touches the DB
 * (Decision 2). `reviewEvents` is append-only; `memoryStates` is a rebuildable projection.
 */

const identitySchema = new Schema(
  { provider: { type: String, required: true }, subject: { type: String, required: true }, email: String },
  { _id: false },
);

const userSchema = new Schema<UserProfile & { _id: string }>(
  {
    _id: { type: String, required: true },
    identities: { type: [identitySchema], default: [] },
    createdAt: { type: String, required: true },
    settings: {
      playbackRate: { type: Number, default: 1 },
      dyslexiaFont: { type: Boolean, default: false },
    },
  },
  { versionKey: false },
);
userSchema.index({ 'identities.provider': 1, 'identities.subject': 1 });

const reviewEventSchema = new Schema<ReviewEvent & { _id: string }>(
  {
    _id: { type: String, required: true }, // client-generated UUID → idempotency
    userId: { type: String, required: true },
    itemId: { type: String, required: true },
    mode: { type: String, required: true },
    outcome: { type: String, required: true },
    latencyMs: Number,
    usedSlowAudio: Boolean,
    at: { type: String, required: true },
  },
  { versionKey: false },
);
reviewEventSchema.index({ userId: 1, at: 1 });
reviewEventSchema.index({ userId: 1, itemId: 1, at: 1 });

const memoryStateSchema = new Schema<MemoryState>(
  {
    userId: { type: String, required: true },
    itemId: { type: String, required: true },
    stability: Number,
    difficulty: Number,
    level: Number,
    lastReviewAt: String,
    lifecycle: String,
    successfulRecalls: Number,
    recallTimestamps: [String],
    fluentDemonstrated: Boolean,
  },
  { versionKey: false },
);
memoryStateSchema.index({ userId: 1, itemId: 1 }, { unique: true });
memoryStateSchema.index({ userId: 1, lifecycle: 1 });

const tripPlanSchema = new Schema<TripPlan>(
  {
    userId: { type: String, required: true, unique: true },
    lang: String,
    departureAt: String,
    returnAt: String,
    minutesPerDay: Number,
    tier: Number,
    situationPriorities: [{ situationId: String, rank: Number, _id: false }],
    days: [{ date: String, newItemIds: [String], focusSituationId: String, _id: false }],
    version: Number,
  },
  { versionKey: false },
);

const sessionLogSchema = new Schema<SessionLog & { _id: string }>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    startedAt: String,
    durationSec: Number,
    blocks: [{ kind: String, itemIds: [String], _id: false }],
    capabilitySummary: [String],
  },
  { versionKey: false },
);
sessionLogSchema.index({ userId: 1, startedAt: -1 });

export const UserModel = mongoose.model('User', userSchema);
export const ReviewEventModel = mongoose.model('ReviewEvent', reviewEventSchema, 'reviewEvents');
export const MemoryStateModel = mongoose.model('MemoryState', memoryStateSchema, 'memoryStates');
export const TripPlanModel = mongoose.model('TripPlan', tripPlanSchema, 'tripPlans');
export const SessionLogModel = mongoose.model('SessionLog', sessionLogSchema, 'sessionLogs');
