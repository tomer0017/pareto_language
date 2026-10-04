import { BOOTCAMP_PLAN, EXTENDED_POOL } from './plan.js';

/**
 * Bootcamp progress persistence shapes — PURE (no store / no localStorage), so the migration is
 * unit-testable. In memory the runtime keeps addressing missions by their `day` registry key; ON
 * DISK progress is keyed by the mission's stable `id`, so reordering the plan (or renumbering the
 * content files) can never move a learner's completions onto a different mission.
 *
 * The Core 30 restructure needed NO storage migration: every mission that stayed kept its id, so
 * reordering the journey moved nobody's progress. Missions that left the Core for the Extended Pool
 * still round-trip (id ↔ day), so a completion earned before the restructure is kept on disk until
 * the mission returns; it simply is not part of the journey or of Travel Readiness meanwhile.
 * Missions that were merged away (Restaurant Basics, Hotel Requests, Paying Anywhere) no longer
 * exist — their ids are ignored on read, like any id the plan does not know.
 */

/** In-memory progress (what the store and UI read). */
export interface BootcampProgress {
  completedDays: number[];
  receipts: { day: number; text: string; at: string }[];
  stepIndex: Record<string, number>; // per-day resume point
}

/** On-disk progress (v2) — keyed by stable mission id. */
export interface StoredProgress {
  completed: string[];
  receipts: { mission: string; text: string; at: string }[];
  stepIndex: Record<string, number>;
}

/**
 * The v1 curriculum, frozen: the mission id that each v1 day number (2..30) referred to. v1 stored
 * raw day numbers of the 30-mission plan, where day 1 was the Recovery Toolkit — it has no entry
 * here, so its completion/receipts/resume point are dropped. Historical data: never edit to follow
 * the live plan.
 */
const V1_FIRST_DAY = 2;
const V1_MISSION_IDS: readonly string[] = [
  'introduce-myself', 'numbers-money', 'coffee-shop', 'restaurant-meal', 'directions',
  'taxi', 'hotel-check-in', 'shopping', 'arrival-day-checkpoint', 'airport-border',
  'hotel-requests', 'restaurant-basics', 'special-requests-allergies', 'paying-anywhere',
  'street-food-markets', 'supermarket', 'food-day-checkpoint', 'public-transport',
  'tickets-attractions', 'wifi-sim-practical', 'souvenirs-gifts', 'small-talk',
  'city-day-checkpoint', 'fixing-problems', 'pharmacy-health', 'emergency', 'no-subtitles',
  'dress-rehearsal', 'complete-day-abroad',
];
const v1MissionId = (day: number): string | undefined => V1_MISSION_IDS[day - V1_FIRST_DAY];

/** Every mission progress can be stored for: the Core journey + the Extended Pool. */
const STORABLE: readonly { id: string; day: number }[] = [...BOOTCAMP_PLAN, ...EXTENDED_POOL];
const idOfDay = (day: number): string | undefined => STORABLE.find((m) => m.day === day)?.id;
const dayOfId = (id: string): number | undefined => STORABLE.find((m) => m.id === id)?.day;

const list = <T>(v: T[] | undefined): T[] => (Array.isArray(v) ? v : []);

/** In-memory → on-disk. Days that are neither in the plan nor in the Extended Pool have no id and are not written. */
export function toStored(p: BootcampProgress): StoredProgress {
  const stepIndex: Record<string, number> = {};
  for (const [day, index] of Object.entries(p.stepIndex)) {
    const id = idOfDay(Number(day));
    if (id) stepIndex[id] = index;
  }
  return {
    completed: p.completedDays.map(idOfDay).filter((id): id is string => id !== undefined),
    receipts: p.receipts.flatMap((r) => {
      const mission = idOfDay(r.day);
      return mission ? [{ mission, text: r.text, at: r.at }] : [];
    }),
    stepIndex,
  };
}

/** On-disk → in-memory. Ids that no longer exist (merged-away missions) are ignored — never crash on old data. */
export function fromStored(s: Partial<StoredProgress>): BootcampProgress {
  const stepIndex: Record<string, number> = {};
  for (const [id, index] of Object.entries(s.stepIndex ?? {})) {
    const day = dayOfId(id);
    if (day !== undefined) stepIndex[String(day)] = index;
  }
  return {
    completedDays: list(s.completed).map(dayOfId).filter((d): d is number => d !== undefined),
    receipts: list(s.receipts).flatMap((r) => {
      const day = dayOfId(r.mission);
      return day === undefined ? [] : [{ day, text: r.text, at: r.at }];
    }),
    stepIndex,
  };
}

/** One-time v1 → v2: old day numbers become stable ids (old 2 → Introduce Myself, …, old 30 → the
 *  finale); the old Recovery Toolkit (day 1) is dropped. */
export function migrateV1(v1: Partial<BootcampProgress>): StoredProgress {
  const stepIndex: Record<string, number> = {};
  for (const [day, index] of Object.entries(v1.stepIndex ?? {})) {
    const id = v1MissionId(Number(day));
    if (id) stepIndex[id] = index;
  }
  return {
    completed: list(v1.completedDays).map(v1MissionId).filter((id): id is string => id !== undefined),
    receipts: list(v1.receipts).flatMap((r) => {
      const mission = v1MissionId(r.day);
      return mission ? [{ mission, text: r.text, at: r.at }] : [];
    }),
    stepIndex,
  };
}
