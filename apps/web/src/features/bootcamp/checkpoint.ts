import type { LocalizedText } from '@ready/content-schema';
import { seededShuffle } from '../../shared/util/shuffle.js';
import type { SpokenLine } from './types.js';

/**
 * THE ADAPTIVE CHECKPOINT — retrieve first, repair only what fails, retrieve again in real context.
 *
 *   DIAGNOSTIC   the whole day, once, with nothing taught first. A miss is corrected in one quiet
 *                beat (the line, its meaning, its sound) and the day goes on; the CONCEPT is noted.
 *   QUICK FIX    only the concepts missed — its own cue, retrieved again (one supported retry after
 *                a second miss). Skipped entirely when nothing was missed. With more than one
 *                concept missed, every answer is shown first and only then retrieved, in day order —
 *                so no retrieval comes straight after its own answer.
 *   ONE-TAKE     the whole day again, in one go, no help. The learner's lines are concealed until
 *                asked for ("What would you say?" → show the options), so the line is recalled
 *                before it can be recognised. A miss goes to the final repair queue.
 *   FINAL REPAIR only those concepts: a short repair card each, then ONE retrieval each, until the
 *                queue is empty. Never the whole day again.
 *
 * Everything is keyed by CONCEPT (`border.duration`), never by a screen or a step index, and the
 * whole state is plain JSON: it can be saved, restored, and later stored in a database. PURE — the
 * content of a checkpoint is data (`CheckpointPlan`); this module only moves the state.
 *
 * Mastery is not a score: a concept is mastered once it has been answered right in a retrieval
 * moment — its answer NOT on screen and not the retry right after being shown it. The checkpoint is
 * complete only when every concept is mastered and no repair is waiting.
 *
 * A plan with `adaptive` rules (Mission 18) is a SAMPLED checkpoint instead — the same machine, other
 * limits: the diagnostic probes only a few core concepts, each answered "try first" (the options are
 * hidden; "💡 Help" shows a hint and marks the answer ASSISTED); a miss is not shown there — the quick
 * fix repairs it (one card, one retry: REPAIRED or UNRESOLVED, never a loop); in the one-take a first
 * miss is re-asked slowly, a second shows the line and one supported retry follows; the final repair
 * takes at most `finalRepairMax` concepts, by survival priority, once each — and the checkpoint ends
 * with an honest readiness level (`checkpointReport`), not with mastery forced.
 */

export type CheckpointPhase = 'diagnostic' | 'repair' | 'one-take' | 'final-repair' | 'complete';
export type CheckpointSkill = 'production' | 'comprehension';

/** A line the learner may say (a production turn's option). */
export interface CheckpointLine {
  /** The concept this line IS (its own turn's concept, or another moment's for a wrong option). */
  conceptId: string;
  itemId: string;
  text: string;
  meaning: LocalizedText;
}

/** One value the learner can pick in an information capture (a fare, a room number, a floor). */
export interface CaptureChoice {
  id: string;
  /** Figures (€15, 204, 7–10) — never words of the target language. */
  label?: string;
  emoji?: string;
  /** A few app-language words where a picture alone could be misread. */
  caption?: LocalizedText;
}

export interface CaptureGroup {
  conceptId: string;
  /** What is asked, in the app language ("Fare"). Neutral: it never contains the answer. */
  label: LocalizedText;
  /** How the choices are drawn: figures, the elevator panel (3 / 2 / 1), or pictures of the road. */
  ui: 'figures' | 'floor' | 'road';
  /** In their natural order (lowest first; the panel top-down) — never arranged around the answer. */
  choices: CaptureChoice[];
  correct: string;
}

interface TurnBase {
  id: string;
  scene: string;
  /** What the other person says just before — the turn's cue. */
  cue: SpokenLine;
  /** The cue was already heard on the previous screen: it is shown again, not replayed on arrival. */
  heard?: boolean;
  /** A scene transition before the cue ("At the checkout…", "Later…"): shown, never spoken; no
   *  sentence, no concept, no interaction. */
  sceneCue?: LocalizedText;
}
/** The learner says something: one of their own lines, among lines that belong to other moments. */
export interface SayTurn extends TurnBase {
  kind: 'say';
  conceptId: string;
  answer: CheckpointLine;
  /** Real lines of the same day that do not fit here. */
  wrong: CheckpointLine[];
  /** A situation in the app language, where the learner speaks on their own initiative. Shown in the
   *  diagnostic and the repairs only — the one-take gives no help. Never contains the answer. */
  situation?: LocalizedText;
}
/** The learner shows what they understood from the other person's line. */
export interface CaptureTurn extends TurnBase {
  kind: 'capture';
  groups: CaptureGroup[];
  /** What the line means, in the app language — shown only after the capture. */
  meaning: LocalizedText;
}
export type CheckpointTurn = SayTurn | CaptureTurn;

export interface CheckpointScenePlan {
  id: string;
  icon: string;
  label: LocalizedText;
  /** Mission id whose person this scene is with (same person = same look as the mission). */
  cast: string;
  /** The other person's last line of the scene, and the stamp the scene earns. */
  closing?: SpokenLine;
  stamp: LocalizedText;
}

/** A core capability of a sampled checkpoint: the one concept that proves it. */
export interface CoreCapability { id: string; concept: string }
/** A row of the capability report: an app-language label over some concepts (worst one wins). */
export interface ReportGroup { id: string; icon: string; label: LocalizedText; concepts: string[] }
/** The rules of a SAMPLED checkpoint (see the module note). Absent = the whole-day checkpoint. */
export interface AdaptiveRules {
  /** The concepts the diagnostic probes (production turns), in day order. */
  diagnostic: string[];
  core: CoreCapability[];
  report: ReportGroup[];
  /** The final repair takes at most this many concepts… */
  finalRepairMax: number;
  /** …in this order: most survival-critical first. Every concept of the plan is listed. */
  priority: string[];
}

export interface CheckpointPlan {
  id: string;
  scenes: CheckpointScenePlan[];
  turns: CheckpointTurn[];
  adaptive?: AdaptiveRules;
  copy: {
    repairIntro: LocalizedText;
    oneTakeIntro: LocalizedText;
    finalRepairIntro: LocalizedText;
    completeTitle: LocalizedText;
    completeBody: LocalizedText;
    /** Sampled checkpoints: the diagnostic's name ("Quick scan") and the readiness lines. */
    scan?: LocalizedText;
    readiness?: Record<ReadinessLevel, { title: LocalizedText; body: LocalizedText }>;
    outcome?: Record<CapabilityOutcome, LocalizedText>;
  };
}

/* ── state ─────────────────────────────────────────────────────────────────────────────────────── */

export interface CheckpointConceptResult {
  conceptId: string;
  scene: string;
  skill: CheckpointSkill;
  attempts: number;
  /** Demonstrated: answered right at least once in a retrieval moment (see the module note). */
  correct: boolean;
  /** Some attempt at it came right after being shown the answer. */
  supportUsed: boolean;
}

export interface CheckpointAttempt {
  conceptId: string;
  phase: Exclude<CheckpointPhase, 'complete'>;
  correct: boolean;
  supported: boolean;
  /** Which answered screen this was (1, 2, …): concepts graded together share it. */
  screen: number;
  /** Sampled checkpoints: answered after asking for a hint. */
  assisted?: boolean;
}

/** One entry of the current phase's agenda: a turn, limited to some of its concepts. A `card` entry
 *  is a final-repair card (the answer shown, nothing asked). */
export interface AgendaEntry { turn: string; concepts: string[]; card?: boolean }

export type CheckpointBeat = 'intro' | 'ask' | 'reveal' | 'scene-end';

/** What the learner picked last — kept only so a reveal can show it. */
export type CheckpointPick = { kind: 'say'; conceptId: string } | { kind: 'capture'; picks: Record<string, string> };

export interface CheckpointState {
  version: 1;
  plan: string;
  phase: CheckpointPhase;
  beat: CheckpointBeat;
  /** The scene of the current agenda entry. */
  scene: string;
  agenda: AgendaEntry[];
  cursor: number;
  /** In the quick fix: this attempt is the one retry right after a reveal (it is supported). */
  retry: boolean;
  results: CheckpointConceptResult[];
  /** Concepts missed in the diagnostic, waiting for the quick fix. */
  repairQueue: string[];
  /** Concepts missed in the one-take (or still not demonstrated), waiting for the final repair. */
  finalRepairQueue: string[];
  attempts: CheckpointAttempt[];
  lastPick: CheckpointPick | null;
  /** Concepts of the last answered entry that were missed (what a reveal shows). */
  missed: string[];
  /** One-take: the learner asked to see the options of the current line (absent = not yet). */
  optionsShown?: boolean;
  /** Sampled checkpoints: the learner asked for a hint on the current line (absent = not yet). */
  helped?: boolean;
  /** Sampled one-take: the current line was missed once and is asked again, slowly. */
  slow?: boolean;
}

export type CheckpointResponse = CheckpointPick;

/* ── plan helpers ──────────────────────────────────────────────────────────────────────────────── */

export const turnConcepts = (turn: CheckpointTurn): string[] => (turn.kind === 'say' ? [turn.conceptId] : turn.groups.map((g) => g.conceptId));
export const planConcepts = (plan: CheckpointPlan): string[] => plan.turns.flatMap(turnConcepts);
const turnOf = (plan: CheckpointPlan, id: string): CheckpointTurn => {
  const turn = plan.turns.find((t) => t.id === id);
  if (!turn) throw new Error(`[checkpoint] no turn "${id}" in "${plan.id}"`);
  return turn;
};
export const turnForConcept = (plan: CheckpointPlan, conceptId: string): CheckpointTurn => {
  const turn = plan.turns.find((t) => turnConcepts(t).includes(conceptId));
  if (!turn) throw new Error(`[checkpoint] no turn trains "${conceptId}" in "${plan.id}"`);
  return turn;
};
/** Concept ids in the order of the day (a queue is always worked in that order). */
const inDayOrder = (plan: CheckpointPlan, ids: readonly string[]): string[] => planConcepts(plan).filter((c) => ids.includes(c));
/** One agenda entry per turn that holds any of `ids`, limited to those concepts. */
const agendaFor = (plan: CheckpointPlan, ids: readonly string[]): AgendaEntry[] =>
  plan.turns.filter((t) => turnConcepts(t).some((c) => ids.includes(c))).map((t) => ({ turn: t.id, concepts: turnConcepts(t).filter((c) => ids.includes(c)) }));
const wholeDay = (plan: CheckpointPlan): AgendaEntry[] => plan.turns.map((t) => ({ turn: t.id, concepts: turnConcepts(t) }));
/** Expose, then retrieve: a card for each concept first, then one retrieval each (day order). */
const exposeThenRetrieve = (plan: CheckpointPlan, ids: readonly string[]): AgendaEntry[] => [
  ...agendaFor(plan, ids).map((e) => ({ ...e, card: true })),
  ...agendaFor(plan, ids),
];

export const currentEntry = (state: CheckpointState): AgendaEntry | undefined => state.agenda[state.cursor];
export const currentTurn = (plan: CheckpointPlan, state: CheckpointState): CheckpointTurn | undefined => {
  const e = currentEntry(state);
  return e ? turnOf(plan, e.turn) : undefined;
};

/* ── transitions ───────────────────────────────────────────────────────────────────────────────── */

export function startCheckpoint(plan: CheckpointPlan): CheckpointState {
  const agenda = plan.adaptive ? agendaFor(plan, plan.adaptive.diagnostic) : wholeDay(plan);
  return {
    version: 1, plan: plan.id, phase: 'diagnostic', beat: 'ask', scene: turnOf(plan, agenda[0]!.turn).scene, agenda, cursor: 0, retry: false,
    results: plan.turns.flatMap((t) => turnConcepts(t).map((conceptId) => ({ conceptId, scene: t.scene, skill: t.kind === 'say' ? 'production' as const : 'comprehension' as const, attempts: 0, correct: false, supportUsed: false }))),
    repairQueue: [], finalRepairQueue: [], attempts: [], lastPick: null, missed: [],
  };
}

/** Which concepts of the current entry the response got right. */
function grade(turn: CheckpointTurn, concepts: readonly string[], response: CheckpointResponse): Record<string, boolean> {
  if (turn.kind === 'say') {
    if (response.kind !== 'say') throw new Error('[checkpoint] a say turn takes a line');
    return { [turn.conceptId]: response.conceptId === turn.conceptId };
  }
  if (response.kind !== 'capture') throw new Error('[checkpoint] a capture turn takes picks');
  return Object.fromEntries(turn.groups.filter((g) => concepts.includes(g.conceptId)).map((g) => [g.conceptId, response.picks[g.conceptId] === g.correct]));
}

function recorded(state: CheckpointState, conceptId: string, correct: boolean, supported: boolean, screen: number, assisted = false): CheckpointState {
  const phase = state.phase as CheckpointAttempt['phase'];
  return {
    ...state,
    attempts: [...state.attempts, { conceptId, phase, correct, supported, screen, ...(assisted ? { assisted: true } : {}) }],
    results: state.results.map((r) => (r.conceptId !== conceptId ? r : {
      ...r, attempts: r.attempts + 1, correct: r.correct || (correct && !supported), supportUsed: r.supportUsed || supported,
    })),
  };
}

/** One-take, a line of the learner's: its options stay hidden until the learner asks for them. */
export const isConcealed = (plan: CheckpointPlan, state: CheckpointState): boolean => {
  const entry = currentEntry(state);
  const hidden = state.phase === 'one-take' || (!!plan.adaptive && state.phase === 'diagnostic'); // sampled: try first
  return hidden && state.beat === 'ask' && !!entry && !entry.card && turnOf(plan, entry.turn).kind === 'say' && !state.optionsShown;
};

/** Sampled diagnostic: "💡 Help" — shows the options AND the turn's hint; the answer counts as ASSISTED. */
export function requestHelp(plan: CheckpointPlan, state: CheckpointState): CheckpointState {
  return plan.adaptive && state.phase === 'diagnostic' && isConcealed(plan, state) ? { ...state, optionsShown: true, helped: true } : state;
}

/** "Show the options" — reveals the current line's choices. Grades nothing, records nothing. */
export function revealOptions(plan: CheckpointPlan, state: CheckpointState): CheckpointState {
  return isConcealed(plan, state) ? { ...state, optionsShown: true } : state;
}

/** The learner answers the current entry (beat `ask`). */
export function respond(plan: CheckpointPlan, state: CheckpointState, response: CheckpointResponse): CheckpointState {
  const entry = currentEntry(state);
  if (state.beat !== 'ask' || !entry || entry.card || isConcealed(plan, state)) return state;
  const turn = turnOf(plan, entry.turn);
  const marks = grade(turn, entry.concepts, response);
  const supported = (state.phase === 'repair' || (!!plan.adaptive && state.phase !== 'diagnostic')) && state.retry;
  const screen = (state.attempts.at(-1)?.screen ?? 0) + 1;
  let next: CheckpointState = { ...state, lastPick: response };
  for (const [c, ok] of Object.entries(marks)) next = recorded(next, c, ok, supported, screen, !!state.helped);
  const missed = Object.entries(marks).filter(([, ok]) => !ok).map(([c]) => c);
  const right = Object.entries(marks).filter(([, ok]) => ok).map(([c]) => c);
  next = { ...next, missed };

  if (state.phase === 'diagnostic') next = { ...next, repairQueue: inDayOrder(plan, [...next.repairQueue, ...missed]) };
  if (state.phase === 'repair') next = { ...next, repairQueue: next.repairQueue.filter((c) => !right.includes(c)) };
  if (state.phase === 'one-take') next = { ...next, finalRepairQueue: inDayOrder(plan, [...next.finalRepairQueue, ...missed]) };
  if (state.phase === 'final-repair') next = { ...next, finalRepairQueue: next.finalRepairQueue.filter((c) => !right.includes(c)) };

  if (missed.length && plan.adaptive) {
    // Sampled diagnostic: the miss is noted, never shown — the quick fix repairs it.
    if (state.phase === 'diagnostic') return afterEntry(plan, { ...next, retry: false, missed: [] });
    // Sampled one-take, a line's first miss: asked again, slowly — no lecture.
    if (state.phase === 'one-take' && turn.kind === 'say' && !state.slow && !state.retry) return { ...next, beat: 'ask', slow: true, lastPick: null, missed: [] };
  }
  if (missed.length) return { ...next, beat: 'reveal' };
  return afterEntry(plan, { ...next, retry: false });
}

/** Continue from a beat that only shows something (`intro`, `reveal`, `scene-end`, a repair card). */
export function proceed(plan: CheckpointPlan, state: CheckpointState): CheckpointState {
  if (state.phase === 'complete') return state;
  if (state.beat === 'intro') return { ...state, beat: 'ask' };
  if (state.beat === 'scene-end') return advance(plan, state);
  if (state.beat === 'reveal') {
    // Quick fix: after a miss, ONE supported retry of the same entry — limited to what was missed.
    // Sampled: the quick fix and the final repair retry once and never loop; the one-take, after the
    // slow re-ask, shows the line and gives one supported retry.
    if (plan.adaptive && (state.phase === 'repair' || state.phase === 'final-repair' || state.retry)) return afterEntry(plan, { ...state, retry: false });
    if (plan.adaptive && state.phase === 'one-take') return { ...state, beat: 'ask', retry: true, missed: [], lastPick: null };
    if (state.phase === 'repair' && !state.retry) {
      const entry = currentEntry(state)!;
      const agenda = state.agenda.map((e, i) => (i === state.cursor ? { ...entry, concepts: entry.concepts.filter((c) => state.missed.includes(c)) } : e));
      return { ...state, agenda, beat: 'ask', retry: true, missed: [], lastPick: null };
    }
    return afterEntry(plan, { ...state, retry: false });
  }
  if (state.beat === 'ask' && currentEntry(state)?.card) return advance(plan, state);
  return state;
}

/** After an entry is done: close its scene (diagnostic / one-take), or move on. */
function afterEntry(plan: CheckpointPlan, state: CheckpointState): CheckpointState {
  const flowing = (state.phase === 'diagnostic' && !plan.adaptive) || state.phase === 'one-take';
  const here = currentTurn(plan, state)!;
  const following = state.agenda[state.cursor + 1];
  const sceneEnds = !following || turnOf(plan, following.turn).scene !== here.scene;
  if (flowing && sceneEnds) return { ...state, beat: 'scene-end' };
  return advance(plan, state);
}

function advance(plan: CheckpointPlan, state: CheckpointState): CheckpointState {
  const cursor = state.cursor + 1;
  const base = { ...state, lastPick: null, missed: [], retry: false, optionsShown: false, helped: false, slow: false };
  if (cursor < state.agenda.length) return { ...base, cursor, beat: 'ask', scene: turnOf(plan, state.agenda[cursor]!.turn).scene };
  return endOfPhase(plan, base);
}

function enter(plan: CheckpointPlan, state: CheckpointState, phase: CheckpointPhase, agenda: AgendaEntry[]): CheckpointState {
  return { ...state, phase, agenda, cursor: 0, beat: 'intro', scene: turnOf(plan, agenda[0]!.turn).scene };
}

function endOfPhase(plan: CheckpointPlan, state: CheckpointState): CheckpointState {
  if (plan.adaptive) return endOfSampledPhase(plan, plan.adaptive, state);
  if (state.phase === 'diagnostic') {
    // Nothing missed: no quick fix at all — straight to the one-take.
    if (state.repairQueue.length === 0) return enter(plan, state, 'one-take', wholeDay(plan));
    // One concept: the compact fix (its cue, straight away). Several: all answers shown, then all retrieved.
    return enter(plan, state, 'repair', state.repairQueue.length > 1 ? exposeThenRetrieve(plan, state.repairQueue) : agendaFor(plan, state.repairQueue));
  }
  if (state.phase === 'repair') return enter(plan, { ...state, repairQueue: [] }, 'one-take', wholeDay(plan)); // the one-take retests everything
  // One-take or final repair over: whatever is missed — or still not demonstrated — is repaired.
  const pending = inDayOrder(plan, [...state.finalRepairQueue, ...state.results.filter((r) => !r.correct).map((r) => r.conceptId)]);
  if (pending.length === 0) return { ...state, phase: 'complete', beat: 'ask', agenda: [], cursor: 0, finalRepairQueue: [] };
  const fresh = state.phase === 'one-take';
  const next = enter(plan, { ...state, finalRepairQueue: pending }, 'final-repair', exposeThenRetrieve(plan, pending));
  return fresh ? next : { ...next, beat: 'ask' }; // a second round of final repair needs no second introduction
}

/** A card then one retrieval, per concept, in day order — the sampled repair (never all cards first). */
const cardThenRetrieve = (plan: CheckpointPlan, ids: readonly string[]): AgendaEntry[] => agendaFor(plan, ids).flatMap((e) => [{ ...e, card: true }, e]);

/** The final repair's targets: what the one-take missed, the most survival-critical first, capped. */
export const finalRepairTargets = (rules: AdaptiveRules, queue: readonly string[]): string[] =>
  rules.priority.filter((c) => queue.includes(c)).slice(0, rules.finalRepairMax);

function endOfSampledPhase(plan: CheckpointPlan, rules: AdaptiveRules, state: CheckpointState): CheckpointState {
  const done: CheckpointState = { ...state, phase: 'complete', beat: 'ask', agenda: [], cursor: 0 };
  if (state.phase === 'diagnostic') {
    // Nothing missed: no quick fix at all — straight to the one-take.
    if (state.repairQueue.length === 0) return enter(plan, state, 'one-take', wholeDay(plan));
    return enter(plan, state, 'repair', cardThenRetrieve(plan, state.repairQueue));
  }
  // What the quick fix could not repair stays UNRESOLVED (`checkpointReport`) — the one-take retests it anyway.
  if (state.phase === 'repair') return enter(plan, { ...state, repairQueue: [] }, 'one-take', wholeDay(plan));
  if (state.phase === 'one-take') {
    const targets = finalRepairTargets(rules, state.finalRepairQueue);
    if (targets.length === 0) return { ...done, finalRepairQueue: [] };
    return enter(plan, { ...state, finalRepairQueue: targets }, 'final-repair', cardThenRetrieve(plan, targets));
  }
  return { ...done, finalRepairQueue: [] }; // the final repair runs once: what it did not fix stays as it is
}

/* ── reading the state ─────────────────────────────────────────────────────────────────────────── */

/** Every concept demonstrated and nothing waiting: the checkpoint is passed. */
export const isMastered = (state: CheckpointState): boolean =>
  state.results.every((r) => r.correct) && state.repairQueue.length === 0 && state.finalRepairQueue.length === 0;

/** The scenes of the day and where the learner is: each `done` / `current` / `next`. */
export function sceneProgress(plan: CheckpointPlan, state: CheckpointState): { id: string; state: 'done' | 'current' | 'next' }[] {
  if (state.phase === 'complete') return plan.scenes.map((s) => ({ id: s.id, state: 'done' }));
  const at = plan.scenes.findIndex((s) => s.id === state.scene);
  const closed = state.beat === 'scene-end';
  return plan.scenes.map((s, i) => ({ id: s.id, state: i < at || (i === at && closed) ? 'done' : i === at ? 'current' : 'next' }));
}

/** The options of a say turn, in an order that changes with every attempt (never by position). */
export function sayOptions(turn: SayTurn, state: CheckpointState): CheckpointLine[] {
  const seed = [...`${turn.id}#${state.attempts.at(-1)?.screen ?? 0}`].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0, 0x811c9dc5);
  return seededShuffle([turn.answer, ...turn.wrong], seed);
}

/** Whether the state can be restored as it is (a saved checkpoint of THIS plan, sound). */
export function isRestorable(plan: CheckpointPlan, raw: unknown): raw is CheckpointState {
  if (!raw || typeof raw !== 'object') return false;
  const s = raw as Partial<CheckpointState>;
  const known = new Set(planConcepts(plan));
  const turns = new Set(plan.turns.map((t) => t.id));
  return s.version === 1 && s.plan === plan.id
    && ['diagnostic', 'repair', 'one-take', 'final-repair', 'complete'].includes(s.phase as string)
    && Array.isArray(s.agenda) && s.agenda.every((e) => turns.has(e.turn) && e.concepts.every((c) => known.has(c)))
    && typeof s.cursor === 'number' && (s.phase === 'complete' || s.cursor < s.agenda.length)
    && Array.isArray(s.results) && s.results.length === known.size
    && Array.isArray(s.repairQueue) && s.repairQueue.every((c) => known.has(c))
    && Array.isArray(s.finalRepairQueue) && s.finalRepairQueue.every((c) => known.has(c));
}

/** Interactions the learner answered, by phase — one answered screen is one interaction, however
 *  many concepts it graded (a capture grades two). */
export function interactionCount(state: CheckpointState): Record<CheckpointAttempt['phase'], number> {
  const out = { diagnostic: 0, repair: 0, 'one-take': 0, 'final-repair': 0 };
  const seen = new Set<number>();
  for (const a of state.attempts) if (!seen.has(a.screen)) { seen.add(a.screen); out[a.phase] += 1; }
  return out;
}

/* ── what the screen shows ─────────────────────────────────────────────────────────────────────── */

/** A line shown with its meaning (a correction, a repair card). */
export interface ShownLine { text: string; meaning: LocalizedText; spoken?: SpokenLine }

export type CheckpointScreen =
  | { kind: 'intro'; phase: CheckpointPhase; text: LocalizedText }
  /** `concealed`: one-take — the cue only, and "show the options" (`options` is then empty). */
  | { kind: 'say'; turn: SayTurn; options: CheckpointLine[]; situation?: LocalizedText; concealed?: boolean }
  | { kind: 'capture'; turn: CaptureTurn; groups: CaptureGroup[] }
  /** After a miss (or on a final-repair card): the line that fits / the line that was said, with its
   *  meaning — and, for a capture, the values it gave. */
  | { kind: 'reveal' | 'card'; turn: CheckpointTurn; line: ShownLine; values: { conceptId: string; label: LocalizedText; choice: CaptureChoice }[] }
  | { kind: 'scene-end'; scene: CheckpointScenePlan }
  | { kind: 'complete'; report?: CheckpointReport };

/**
 * The one screen the state stands for. PURE: everything the learner can see comes from here — so a
 * test can prove that nothing is on screen before its time (no €15 before the driver says it).
 */
export function checkpointScreen(plan: CheckpointPlan, state: CheckpointState): CheckpointScreen {
  if (state.phase === 'complete') { const report = checkpointReport(plan, state); return report ? { kind: 'complete', report } : { kind: 'complete' }; }
  const entry = currentEntry(state)!;
  const turn = turnOf(plan, entry.turn);
  if (state.beat === 'intro') {
    const text = state.phase === 'repair' ? plan.copy.repairIntro : state.phase === 'one-take' ? plan.copy.oneTakeIntro : plan.copy.finalRepairIntro;
    return { kind: 'intro', phase: state.phase, text };
  }
  if (state.beat === 'scene-end') return { kind: 'scene-end', scene: plan.scenes.find((s) => s.id === turn.scene)! };
  if (state.beat === 'reveal' || entry.card) {
    const shown = entry.card ? entry.concepts : state.missed;
    const line: ShownLine = turn.kind === 'say' ? { text: turn.answer.text, meaning: turn.answer.meaning } : { text: turn.cue.en, meaning: turn.meaning, spoken: turn.cue };
    const values = turn.kind === 'say' ? [] : turn.groups.filter((g) => shown.includes(g.conceptId))
      .map((g) => ({ conceptId: g.conceptId, label: g.label, choice: g.choices.find((x) => x.id === g.correct)! }));
    return { kind: entry.card ? 'card' : 'reveal', turn, line, values };
  }
  if (turn.kind === 'say') {
    // Sampled: the hint only after "💡 Help" in the diagnostic; the repairs show it; the one-take never.
    const helped = turn.situation && (plan.adaptive ? (state.phase === 'diagnostic' ? !!state.helped : state.phase !== 'one-take') : state.phase !== 'one-take');
    if (isConcealed(plan, state)) return { kind: 'say', turn, options: [], concealed: true };
    return { kind: 'say', turn, options: sayOptions(turn, state), ...(helped ? { situation: turn.situation } : {}) };
  }
  return { kind: 'capture', turn, groups: turn.groups.filter((g) => entry.concepts.includes(g.conceptId)) };
}

/* ── the honest report (sampled checkpoints) ───────────────────────────────────────────────────── */

export type ReadinessLevel = 'ready' | 'almost' | 'review';
/** What the learner did with a concept, end to end — the four words the report uses. */
export type CapabilityOutcome = 'independent' | 'needed-help' | 'recovered' | 'needs-review';
export type DiagnosticResult = 'independent' | 'assisted' | 'missed' | 'not-probed';
export type RepairResult = 'none' | 'repaired' | 'unresolved';
export type OneTakeResult = 'clean' | 'slow' | 'helped' | 'not-reached';
export type FinalRepairResult = 'none' | 'fixed' | 'failed';

export interface ConceptTrack { conceptId: string; diagnostic: DiagnosticResult; repair: RepairResult; oneTake: OneTakeResult; finalRepair: FinalRepairResult; outcome: CapabilityOutcome }
export interface CheckpointReport {
  readinessLevel: ReadinessLevel;
  concepts: ConceptTrack[];
  /** Core capability id → its INDEPENDENT / ASSISTED / MISSED / REPAIRED / UNRESOLVED status (diagnostic + quick fix). */
  capabilityStatus: Record<string, 'independent' | 'assisted' | 'missed' | 'repaired' | 'unresolved'>;
  groups: { id: string; outcome: CapabilityOutcome }[];
  /** The numbers the readiness rule used — shown nowhere, kept for transparency and tests. */
  basis: { unresolvedCore: number; independentDiagnostic: number; coreHelpedInOneTake: number };
}

const SEVERITY: Record<CapabilityOutcome, number> = { independent: 0, 'needed-help': 1, recovered: 2, 'needs-review': 3 };

/** One concept's path through the checkpoint, read from the attempt log alone (so a restore reads the same). */
export function conceptTrack(state: CheckpointState, conceptId: string): ConceptTrack {
  const of = (phase: CheckpointAttempt['phase']) => state.attempts.filter((a) => a.conceptId === conceptId && a.phase === phase);
  const diag = of('diagnostic');
  const diagnostic: DiagnosticResult = diag.length === 0 ? 'not-probed' : diag[0]!.correct ? (diag[0]!.assisted ? 'assisted' : 'independent') : 'missed';
  const fix = of('repair');
  const repair: RepairResult = diagnostic !== 'missed' ? 'none' : fix.some((a) => a.correct) ? 'repaired' : 'unresolved';
  const take = of('one-take');
  const oneTake: OneTakeResult = take.length === 0 ? 'not-reached' : take.some((a) => a.supported) ? 'helped' : take[0]!.correct ? 'clean' : take.some((a) => a.correct) ? 'slow' : 'helped';
  const fin = of('final-repair');
  const finalRepair: FinalRepairResult = fin.length === 0 ? 'none' : fin.at(-1)!.correct ? 'fixed' : 'failed';
  const outcome: CapabilityOutcome =
    finalRepair === 'fixed' ? 'recovered'
      : finalRepair === 'failed' || oneTake === 'helped' || (oneTake === 'not-reached' && repair === 'unresolved') ? 'needs-review'
        : diagnostic === 'missed' ? 'recovered'
          : diagnostic === 'assisted' || oneTake === 'slow' ? 'needed-help'
            : 'independent';
  return { conceptId, diagnostic, repair, oneTake, finalRepair, outcome };
}

/**
 * The readiness rule — deterministic, from the attempts alone:
 *   🟢 READY          no core capability needs review · at least 4 core probes answered independently ·
 *                     at most 1 core line needed the shown answer in the one-take;
 *   🔴 REVIEW NEEDED  2 or more core capabilities still need review;
 *   🟡 ALMOST READY   everything else (the day was completed; repairs carried the rest).
 */
export function checkpointReport(plan: CheckpointPlan, state: CheckpointState): CheckpointReport | null {
  const rules = plan.adaptive;
  if (!rules) return null;
  const concepts = planConcepts(plan).map((c) => conceptTrack(state, c));
  const track = (c: string): ConceptTrack => concepts.find((t) => t.conceptId === c)!;
  const core = rules.core.map((k) => ({ id: k.id, t: track(k.concept) }));
  const unresolvedCore = core.filter((k) => k.t.outcome === 'needs-review').length;
  const independentDiagnostic = core.filter((k) => k.t.diagnostic === 'independent').length;
  const coreHelpedInOneTake = core.filter((k) => k.t.oneTake === 'helped').length;
  const readinessLevel: ReadinessLevel = unresolvedCore >= 2 ? 'review'
    : unresolvedCore === 0 && independentDiagnostic >= 4 && coreHelpedInOneTake <= 1 ? 'ready' : 'almost';
  const capabilityStatus = Object.fromEntries(core.map(({ id, t }) => [id,
    t.diagnostic === 'missed' ? (t.repair === 'repaired' ? 'repaired' : 'unresolved') : t.diagnostic === 'assisted' ? 'assisted' : t.diagnostic === 'independent' ? 'independent' : 'missed'])) as CheckpointReport['capabilityStatus'];
  const groups = rules.report.map((g) => ({ id: g.id, outcome: g.concepts.map((c) => track(c).outcome).reduce<CapabilityOutcome>((w, o) => (SEVERITY[o] > SEVERITY[w] ? o : w), 'independent') }));
  return { readinessLevel, concepts, capabilityStatus, groups, basis: { unresolvedCore, independentDiagnostic, coreHelpedInOneTake } };
}
