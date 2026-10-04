/**
 * The Language Companion — pure model (no React, no store, no storage).
 *
 * The companion answers one question: "how alive is this language inside me?". It is a fish that
 * cannot speak and grows, stage by stage, into a parrot that cannot stop. It is NOT Trip Readiness
 * and it is not a percentage of a course: it is a cumulative score per learning language that only
 * ever goes up.
 *
 *   - cumulative: every meaningful learning event adds growth points, once (events are keyed);
 *   - monotonic:  the stage is the highest one ever reached and is stored — re-tuning thresholds or
 *                 adding content can never move a learner back;
 *   - per language: nothing here is global; a record belongs to one learning language;
 *   - extensible: new sources of growth are new event kinds, not new code paths.
 */

export const STAGES = [1, 2, 3, 4, 5, 6] as const;
export type CompanionStage = (typeof STAGES)[number];
export const FIRST_STAGE: CompanionStage = 1;
export const LAST_STAGE: CompanionStage = 6;

/** What can make the companion grow. Only the first two are produced today; the rest are the
 *  agreed extension points for stories, listening, review and conversation practice. */
export type CompanionEventKind =
  | 'missionCompleted'
  | 'checkpointCompleted'
  | 'storyCompleted'
  | 'listeningMastered'
  | 'reviewMastered'
  | 'conversationCompleted';

export interface CompanionEvent {
  kind: CompanionEventKind;
  /** Unique per achievement (`mission:taxi`) — an event counts once, however often it is reported. */
  key: string;
}

/** Growth points per event. Tunable: a learner's stored stage never drops when these change. */
export const GROWTH_POINTS: Record<CompanionEventKind, number> = {
  missionCompleted: 10,
  checkpointCompleted: 20,
  storyCompleted: 8,
  listeningMastered: 6,
  reviewMastered: 6,
  conversationCompleted: 12,
};

/**
 * Points needed to REACH each stage (index 0 = stage 1). Capability milestones, not equal slices:
 * a couple of missions calm the fish, about a quarter of the Core makes a parrotfish, about half
 * makes a young parrot, nearly all of it a talking parrot. The whole current Core is worth 340
 * points (26 missions × 10 + 4 checkpoints × 20), so the Chatterbox deliberately lies beyond it and
 * is earned by continued use once more growth sources exist.
 */
export const STAGE_THRESHOLDS: readonly number[] = [0, 20, 70, 150, 300, 600];

export interface LanguageCompanion {
  points: number;
  /** Keys of the events already counted. */
  counted: string[];
  /** Highest stage ever reached — the companion's stage. */
  stage: CompanionStage;
  /** Last stage whose evolution the learner has seen; `stage > seenStage` = an evolution is owed. */
  seenStage: CompanionStage;
}

export const newCompanion = (): LanguageCompanion => ({ points: 0, counted: [], stage: FIRST_STAGE, seenStage: FIRST_STAGE });

const clampStage = (n: number): CompanionStage => Math.min(LAST_STAGE, Math.max(FIRST_STAGE, Math.floor(n))) as CompanionStage;

/** The stage a number of points is worth under a set of thresholds. */
export function stageForPoints(points: number, thresholds: readonly number[] = STAGE_THRESHOLDS): CompanionStage {
  let stage: CompanionStage = FIRST_STAGE;
  thresholds.forEach((need, i) => { if (points >= need) stage = clampStage(i + 1); });
  return stage;
}

/**
 * Count new events. Idempotent (a key counts once) and monotonic: the stage is the higher of the
 * stored one and what the points are worth now, so it survives any later change to the rules.
 */
export function applyEvents(
  state: LanguageCompanion,
  events: readonly CompanionEvent[],
  thresholds: readonly number[] = STAGE_THRESHOLDS,
): LanguageCompanion {
  const counted = new Set(state.counted);
  let points = state.points;
  for (const e of events) {
    if (counted.has(e.key)) continue;
    counted.add(e.key);
    points += GROWTH_POINTS[e.kind];
  }
  const stage = clampStage(Math.max(state.stage, stageForPoints(points, thresholds)));
  if (points === state.points && stage === state.stage) return state;
  return { ...state, points, counted: [...counted], stage };
}

/** The learner has watched the evolution: nothing is owed any more. */
export const acknowledge = (state: LanguageCompanion): LanguageCompanion =>
  (state.seenStage === state.stage ? state : { ...state, seenStage: state.stage });

/** The evolution to play, if one is owed. Several stages gained at once reveal the final one. */
export function pendingEvolution(state: LanguageCompanion): { from: CompanionStage; to: CompanionStage } | null {
  return state.stage > state.seenStage ? { from: state.seenStage, to: state.stage } : null;
}

export interface StageProgress {
  stage: CompanionStage;
  next: CompanionStage | null;
  /** 0–100 toward the next stage (100 at the last stage). */
  pct: number;
  pointsToNext: number;
}

export function stageProgress(state: LanguageCompanion, thresholds: readonly number[] = STAGE_THRESHOLDS): StageProgress {
  if (state.stage >= LAST_STAGE) return { stage: state.stage, next: null, pct: 100, pointsToNext: 0 };
  const from = thresholds[state.stage - 1] ?? 0;
  const to = thresholds[state.stage] ?? from;
  const span = Math.max(1, to - from);
  const done = Math.min(span, Math.max(0, state.points - from));
  return { stage: state.stage, next: clampStage(state.stage + 1), pct: Math.round((done / span) * 100), pointsToNext: Math.max(0, to - state.points) };
}

/** The events a learner's completed missions are worth. `isCheckpoint` comes from the curriculum. */
export function missionEvents(completedIds: readonly string[], isCheckpoint: (id: string) => boolean): CompanionEvent[] {
  return completedIds.map((id) => ({ kind: isCheckpoint(id) ? 'checkpointCompleted' as const : 'missionCompleted' as const, key: `mission:${id}` }));
}

/**
 * MIGRATION RULE — a language's first companion record is derived from the progress that already
 * exists for it: every completed mission is counted, and the result is marked as already seen.
 * An existing learner therefore opens the app at the stage their history has earned, with no
 * backlog of evolution screens; only growth from now on is celebrated.
 */
export function deriveFromHistory(events: readonly CompanionEvent[]): LanguageCompanion {
  return acknowledge(applyEvents(newCompanion(), events));
}

/** Storage → model, tolerant of anything (never throws on old or damaged data). */
export function sanitize(raw: unknown): LanguageCompanion | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Partial<Record<keyof LanguageCompanion, unknown>>;
  const points = typeof r.points === 'number' && Number.isFinite(r.points) && r.points >= 0 ? r.points : 0;
  const counted = Array.isArray(r.counted) ? r.counted.filter((k): k is string => typeof k === 'string') : [];
  // The stage can only be at least what the points are worth — and never above the last stage.
  const stage = clampStage(Math.max(typeof r.stage === 'number' ? r.stage : FIRST_STAGE, stageForPoints(points)));
  const seenStage = clampStage(Math.min(stage, typeof r.seenStage === 'number' ? r.seenStage : stage));
  return { points, counted, stage, seenStage };
}

/* ── animation ─────────────────────────────────────────────────────────────────────────────────── */

/** The reusable animation states. Every stage supports the first group; the second is for parrots. */
export const BASE_ANIMATIONS = ['idle', 'listening', 'thinking', 'correct', 'encouraging', 'celebrate', 'missionComplete', 'levelUp', 'rest', 'attention'] as const;
export const PARROT_ANIMATIONS = ['talking', 'laughing', 'phone', 'music', 'watchingTV'] as const;
export type CompanionAnimation = (typeof BASE_ANIMATIONS)[number] | (typeof PARROT_ANIMATIONS)[number];

/** The animations a stage can play. A state a stage lacks falls back to `idle`. */
export function animationsFor(stage: CompanionStage): readonly CompanionAnimation[] {
  if (stage <= 3) return BASE_ANIMATIONS;
  if (stage <= 5) return [...BASE_ANIMATIONS, 'talking', 'laughing'];
  return [...BASE_ANIMATIONS, ...PARROT_ANIMATIONS];
}
export const resolveAnimation = (stage: CompanionStage, wanted: CompanionAnimation): CompanionAnimation =>
  (animationsFor(stage).includes(wanted) ? wanted : 'idle');

/** What moves at each stage — the vocabulary the CSS keys its motion on. */
export type MotionFamily = 'fish' | 'parrotfish' | 'parrot';
export const motionFamily = (stage: CompanionStage): MotionFamily => (stage <= 2 ? 'fish' : stage === 3 ? 'parrotfish' : 'parrot');

export type EvolutionPhase = 'anticipation' | 'transform' | 'reveal' | 'done';
/**
 * The level-up sequence: old character → anticipation → transformation → reveal → explanation.
 * With reduced motion there is no sequence at all — the new stage is simply shown.
 */
export function evolutionTimeline(reducedMotion: boolean): { phase: EvolutionPhase; ms: number }[] {
  if (reducedMotion) return [{ phase: 'done', ms: 0 }];
  return [{ phase: 'anticipation', ms: 1100 }, { phase: 'transform', ms: 900 }, { phase: 'reveal', ms: 800 }, { phase: 'done', ms: 0 }];
}

/* ── speech: the companion learns to speak with the learner ────────────────────────────────────── */

/** How much language a stage can produce itself. */
export type SpeechAbility = 'none' | 'listening' | 'babble' | 'phrase' | 'sentence' | 'chatter';
export const speechAbility = (stage: CompanionStage): SpeechAbility =>
  (['none', 'listening', 'babble', 'phrase', 'sentence', 'chatter'] as const)[stage - 1]!;

export interface LearnedMaterial {
  /** Single words the learner has met in completed missions (word-intro steps), oldest first. */
  words: string[];
  /** Learner sentences of completed missions, oldest first. */
  sentences: string[];
}

const wordCount = (s: string): number => s.trim().split(/\s+/).length;

/**
 * The one target-language line the companion may say. It NEVER invents language: the line is taken
 * from what the learner's completed missions taught, and if there is nothing suitable it says
 * nothing in the target language (the app-language caption carries the moment instead).
 */
export function companionLine(stage: CompanionStage, learned: LearnedMaterial): string | null {
  const ability = speechAbility(stage);
  if (ability === 'none' || ability === 'listening') return null;
  if (ability === 'babble') {
    const word = [...learned.words].reverse().find((w) => wordCount(w) === 1);
    return word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}?` : null;
  }
  const newestFirst = [...learned.sentences].reverse();
  if (ability === 'phrase') return newestFirst.find((s) => wordCount(s) <= 4) ?? null;
  return newestFirst.find((s) => wordCount(s) >= 3) ?? newestFirst[0] ?? null;
}
