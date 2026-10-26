import type { BootcampDayContent, BootcampDialogue, BootcampStep } from './types.js';

/**
 * The guided mission journey — WATCH → LEARN → PRACTICE → WATCH AGAIN — expressed as a pure VIEW over
 * a mission's existing step list. Nothing about the pedagogy engine changes: the player still walks
 * `steps` in order. This only answers "where does learning end and practice begin?" so the mission
 * overview can offer three guided entries instead of three unrelated tools.
 */

export type MissionPhase = 'learn' | 'practice';

/** Steps that TEACH (the essentials + the replies the learner will hear). */
const TEACHING: ReadonlySet<BootcampStep['kind']> = new Set(['prime', 'tool', 'replies']);
/** Steps where the learner RESPONDS. The first one marks the start of practice. */
const RESPONDING: ReadonlySet<BootcampStep['kind']> = new Set(['quiz', 'dialogue', 'swipe', 'ambush', 'quickReply', 'visualMatch', 'swap', 'customize', 'miniMap', 'matchPairs', 'sentenceBuilder']);

export interface MissionPhases {
  /** First step of the learning flow (skips a leading in-flow video step — the overview's own
   *  "Watch" entry replaces it). */
  learnStart: number;
  /** First step where the learner responds. Equals `learnStart` when the mission teaches nothing new
   *  (cold checkpoints): there is then no separate Learn entry. */
  practiceStart: number;
  /** Whether the mission has a real teaching section before practice. */
  hasLearn: boolean;
}

export function missionPhases(content: Pick<BootcampDayContent, 'steps'>): MissionPhases {
  const { steps } = content;
  const firstReal = steps.findIndex((s) => s.kind !== 'video');
  const learnStart = firstReal === -1 ? 0 : firstReal;
  const firstResponse = steps.findIndex((s, i) => i >= learnStart && RESPONDING.has(s.kind));
  const responseStart = firstResponse === -1 ? learnStart : firstResponse;
  const hasLearn = steps.slice(learnStart, responseStart).some((s) => TEACHING.has(s.kind));
  return { learnStart, practiceStart: hasLearn ? responseStart : learnStart, hasLearn };
}

/** Which part of the journey a step index belongs to. */
export function phaseOfIndex(phases: MissionPhases, index: number): MissionPhase {
  return phases.hasLearn && index < phases.practiceStart ? 'learn' : 'practice';
}

/** The mission's canonical dialogue — the one the transcript reader and Listen play. */
export function primaryDialogue(day: Pick<BootcampDayContent, 'steps' | 'dialogues'>): BootcampDialogue | null {
  const step = day.steps.find((s): s is Extract<BootcampStep, { kind: 'dialogue' }> => s.kind === 'dialogue');
  const byStep = step ? day.dialogues[step.dialogueId] : undefined;
  return byStep ?? Object.values(day.dialogues)[0] ?? null;
}

/** The mission's own icon — the one its opening card already shows. Read from content, so a card
 *  never invents an image; missions without one get a neutral fallback. */
export function missionIcon(day: Pick<BootcampDayContent, 'steps'> | undefined, fallback = '🎯'): string {
  const talk = day?.steps.find((s): s is Extract<BootcampStep, { kind: 'talk' }> => s.kind === 'talk');
  return talk?.icon ?? fallback;
}

/* ── The mission overview's ONE decision: what does the learner do next? ───────────────────────── */

export type JourneyStepId = 'watch' | 'learn' | 'practice' | 'again';
export type JourneyStepState = 'done' | 'current' | 'upcoming';

export interface MissionJourney {
  /** The journey, in order. `again` (the reward) exists only once the mission is completed.
   *  `open` = the step can be tapped right now. Watching (the video, or the conversation read aloud)
   *  is ALWAYS open — before, during and after the mission: it never moves progress. Learn and
   *  Practice open as shortcuts only once the mission is completed. */
  steps: { id: JourneyStepId; state: JourneyStepState; open: boolean }[];
  /** THE primary action — exactly one. `resume` = it continues a section the learner is mid-way
   *  through (so it enters at the saved step, not the section's start). */
  primary: { step: JourneyStepId; resume: boolean };
  /** True only for a COMPLETED mission: the steps then double as shortcuts for revisiting. Until
   *  then Learn and Practice are not offered as separate entry points — there is one guided path. */
  shortcuts: boolean;
}

export interface JourneyInput {
  phases: MissionPhases;
  /** A conversation exists to watch (video) or listen to (transcript). */
  canWatch: boolean;
  /** The mission is completed. */
  done: boolean;
  /** The stored resume point (0 for fresh / completed). */
  saved: number;
  /** The learner watched/listened during THIS visit (not stored progress — it only steers the
   *  highlight within the visit). */
  watched: boolean;
}

export function missionJourney({ phases, canWatch, done, saved, watched }: JourneyInput): MissionJourney {
  const inPractice = !done && saved > phases.learnStart && saved >= phases.practiceStart;
  const inLearn = !done && phases.hasLearn && saved > phases.learnStart && saved < phases.practiceStart;
  const current: JourneyStepId = done ? (canWatch ? 'again' : 'practice')
    : inPractice ? 'practice'
      : inLearn ? 'learn'
        : canWatch && !watched ? 'watch'
          : phases.hasLearn ? 'learn' : 'practice';

  const order: JourneyStepId[] = [
    ...(canWatch ? (['watch'] as const) : []),
    ...(phases.hasLearn ? (['learn'] as const) : []),
    'practice',
    ...(done && canWatch ? (['again'] as const) : []),
  ];
  const at = order.indexOf(current);
  const steps = order.map((id, i) => {
    // Learn / Practice are "done" from STORED progress. Watching is not stored, so the Watch step is
    // only ever ticked for a viewing in this visit — never inferred from being further along.
    const reached = id === 'watch' ? watched : done || i < at;
    const open = id === 'watch' || id === 'again' || done;
    return { id, state: (id === current ? 'current' : reached ? 'done' : 'upcoming') as JourneyStepState, open };
  });
  return { steps, primary: { step: current, resume: inLearn || inPractice }, shortcuts: done };
}

/**
 * What the "continue" button under the conversation video does — PURE, so where progress lives (this
 * device today, an account later) does not matter: it only names a destination.
 *   - a completed mission: nothing to continue to (the video is the reward) → `none`;
 *   - a mission in progress: back to EXACTLY the saved step → `resume` (never a restart);
 *   - a first pass: the start of the guided path after watching → `start` at `at`.
 * Watching itself never writes progress: no step is completed, skipped or reset by opening it.
 */
export type AfterWatching = { kind: 'none' } | { kind: 'resume' } | { kind: 'start'; at: number };
export function afterWatching(journey: MissionJourney, done: boolean, startAt: number): AfterWatching {
  if (done) return { kind: 'none' };
  if (journey.primary.resume) return { kind: 'resume' };
  return { kind: 'start', at: startAt };
}

/**
 * The replay control on the practice screen. With a video, the full conversation is one tap away at
 * EVERY step (except a step that IS the video) — enabled, unlimited, and UI-only: it never changes the
 * step or the progress. Without a video there is no video control (never a broken player); the scene
 * can still be heard read aloud before the first step.
 */
export type PracticeReplay = 'watch' | 'listen' | null;
export function practiceReplay({ hasVideo, hasConversation, stepKind, index }: { hasVideo: boolean; hasConversation: boolean; stepKind: string; index: number }): PracticeReplay {
  if (hasVideo) return stepKind === 'video' ? null : 'watch';
  return index === 0 && hasConversation ? 'listen' : null;
}
