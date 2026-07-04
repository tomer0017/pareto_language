import {
  ReviewEventSchema as BaseReviewEvent,
  SessionLogSchema as BaseSessionLog,
  TripPlanSchema as BaseTripPlan,
  type ContentPack,
  type Situation,
} from '@ready/content-schema';

/** zod schemas reused from packages/content-schema — one source of truth (PDF §13). */
export const ReviewEventSchema = BaseReviewEvent;
export const SessionLogSchema = BaseSessionLog;
export const TripPlanSchema = BaseTripPlan;

export function computeReadinessInputSituations(pack: ContentPack): Situation[] {
  return pack.situations;
}
