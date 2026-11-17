/**
 * Daily Goal — time rules, pure (no DOM, no storage). Everything that decides WHAT counts as active
 * learning time lives in `dailyGoalEngine.ts`; this file holds the units and the calendar.
 */

/** The three goals a learner can pick, in minutes. */
export const GOAL_OPTIONS = [5, 10, 15] as const;
export type GoalMinutes = (typeof GOAL_OPTIONS)[number];
export const isGoalMinutes = (n: unknown): n is GoalMinutes => GOAL_OPTIONS.includes(n as GoalMinutes);
export const goalMs = (minutes: GoalMinutes): number => minutes * 60_000;

/** No meaningful activity for this long → the timer stops counting (resumes on the next activity). */
export const IDLE_MS = 120_000;
/** While counting, progress is written to storage at most this often (plus every lifecycle change). */
export const CHECKPOINT_MS = 12_000;
/** The clock is observed every second while the page lives. A longer silence means the page was
 *  suspended (the device slept, the tab was frozen): that gap is never counted. */
export const MAX_TICK_GAP_MS = 10_000;
/** A reload this soon after the page went away continues the open session (a refresh is not leaving). */
export const RELOAD_GRACE_MS = 120_000;

/**
 * The learner's LOCAL calendar day as `YYYY-MM-DD` — never UTC (a learner in Tel Aviv practising at
 * 01:30 is practising "today", not "yesterday"). The day boundary is local midnight.
 */
export function localDateKey(at: number | Date): string {
  const d = typeof at === 'number' ? new Date(at) : at;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Active time, human and compact: `M:SS` under an hour (0:00, 3:27, 12:48), `H:MM:SS` after. */
export function formatActive(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const two = (n: number): string => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}
