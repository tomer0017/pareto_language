import { z } from 'zod';

/**
 * User-state entities (PDF §12.2) — dynamic, personal data stored in IndexedDB and MongoDB.
 * `ReviewEvent` is the append-only source of truth; everything else is derivable.
 */

export const IsoDateSchema = z.string().datetime({ offset: true });

export const PracticeModeSchema = z.enum([
  'swipe',
  'flashRecall',
  'echo',
  'listen',
  'numberSprint',
  'simulator',
]);
export type PracticeMode = z.infer<typeof PracticeModeSchema>;

export const OutcomeSchema = z.enum(['pass', 'partial', 'fail']);
export type Outcome = z.infer<typeof OutcomeSchema>;

/** Append-only; the source of truth (PDF §11.4). Idempotent by client-generated `id`. */
export const ReviewEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  itemId: z.string().min(1),
  mode: PracticeModeSchema,
  outcome: OutcomeSchema,
  /** Fluency evidence — time to start speaking / respond, in ms. */
  latencyMs: z.number().nonnegative().optional(),
  /** For listen mode: whether the learner leaned on the slow replay (weakens the evidence). */
  usedSlowAudio: z.boolean().optional(),
  at: IsoDateSchema,
});
export type ReviewEvent = z.infer<typeof ReviewEventSchema>;

export const LifecycleSchema = z.enum([
  'new',
  'learning',
  'reviewing',
  'consolidated',
  'lapsed',
]);
export type Lifecycle = z.infer<typeof LifecycleSchema>;

export const LadderLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
export type LadderLevel = z.infer<typeof LadderLevelSchema>;

/** Derived cached projection of events (PDF §12.2). Rebuildable from the event log. */
export const MemoryStateSchema = z.object({
  userId: z.string().min(1),
  itemId: z.string().min(1),
  /** Days until retrievability falls to ~90% (PDF §8.2). */
  stability: z.number().positive(),
  difficulty: z.number(),
  level: LadderLevelSchema,
  lastReviewAt: IsoDateSchema,
  lifecycle: LifecycleSchema,
  /** Count of successful recalls, used for spacing-verified readiness (PDF §10.4). */
  successfulRecalls: z.number().int().nonnegative().default(0),
  /** Timestamps of successful recalls, to verify "two occasions ≥12h apart". */
  recallTimestamps: z.array(IsoDateSchema).default([]),
  /** Whether a timed (<3s) fluent recall has been demonstrated (L3 gate, PDF §9.1). */
  fluentDemonstrated: z.boolean().default(false),
});
export type MemoryState = z.infer<typeof MemoryStateSchema>;

export const SituationPrioritySchema = z.object({
  situationId: z.string().min(1),
  rank: z.number().int().nonnegative(),
});
export type SituationPriority = z.infer<typeof SituationPrioritySchema>;

export const PlanDaySchema = z.object({
  date: IsoDateSchema,
  newItemIds: z.array(z.string()),
  focusSituationId: z.string().optional(),
});
export type PlanDay = z.infer<typeof PlanDaySchema>;

export const TripPlanSchema = z.object({
  userId: z.string().min(1),
  lang: z.string().min(2),
  departureAt: IsoDateSchema,
  returnAt: IsoDateSchema.optional(),
  minutesPerDay: z.number().int().positive(),
  tier: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  situationPriorities: z.array(SituationPrioritySchema),
  days: z.array(PlanDaySchema),
  /** Bumped on every re-plan (PDF §12.2). */
  version: z.number().int().nonnegative(),
});
export type TripPlan = z.infer<typeof TripPlanSchema>;

export const SessionBlockSchema = z.object({
  kind: z.enum(['warmup', 'learn', 'integrate']),
  itemIds: z.array(z.string()),
});

export const SessionLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  startedAt: IsoDateSchema,
  durationSec: z.number().nonnegative(),
  blocks: z.array(SessionBlockSchema),
  /** What the Close screen showed the user (PDF §10.2). */
  capabilitySummary: z.array(z.string()),
});
export type SessionLog = z.infer<typeof SessionLogSchema>;

export const ReadinessStateSchema = z.enum(['notStarted', 'inProgress', 'ready', 'fading']);
export type ReadinessState = z.infer<typeof ReadinessStateSchema>;

export const ReadinessSnapshotSchema = z.object({
  userId: z.string().min(1),
  situationId: z.string().min(1),
  state: ReadinessStateSchema,
  detail: z.object({
    phrasesSolid: z.number().int().nonnegative(),
    phrasesTotal: z.number().int().nonnegative(),
    repliesPct: z.number().min(0).max(1),
    simulatorDone: z.boolean(),
  }),
  /** Mean projected retrievability at departure over the situation's core items. */
  projectedAtDeparture: z.number().min(0).max(1),
});
export type ReadinessSnapshot = z.infer<typeof ReadinessSnapshotSchema>;

/** Auth identity record — reserved now so Google/Facebook plug in without migration (PDF §12.3). */
export const AuthIdentitySchema = z.object({
  provider: z.enum(['anonymous', 'google']),
  subject: z.string().min(1),
  email: z.string().email().optional(),
});
export type AuthIdentity = z.infer<typeof AuthIdentitySchema>;

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  identities: z.array(AuthIdentitySchema),
  createdAt: IsoDateSchema,
  settings: z
    .object({
      playbackRate: z.number().positive().default(1),
      dyslexiaFont: z.boolean().default(false),
    })
    .default({ playbackRate: 1, dyslexiaFont: false }),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;
