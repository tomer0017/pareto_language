import { buildMission, type MissionLang, type MissionSpec } from '../author.js';
import type { BootcampDayContent } from '../types.js';
import { ARRIVAL_DAY, CITY_CONVERSATION, COMPLETE_DAY, EVERYDAY_DAY, NO_SUBTITLES } from './checkpoints.js';
import { EMERGENCY } from './emergency.js';
import { EVERYDAY_CORE } from './everydayCore.js';
import { FIXING_PROBLEMS } from './fixingProblems.js';
import { FUTURE_PLANS } from './futurePlans.js';
import { HOBBIES } from './hobbies.js';
import { HOME_FAMILY } from './homeFamily.js';
import { LOST_STOLEN } from './lostStolen.js';
import { OPINIONS } from './opinions.js';
import { PAST_EVENTS } from './pastEvents.js';
import { SMALL_TALK } from './smallTalk.js';
import { TIME_PLANS } from './timePlans.js';

/**
 * The Core 30 missions that are authored once for every language (`author.ts`): the eight new
 * missions, the three rewritten ones and the five integration missions (three checkpoints, No Subtitles, the finale). The remaining
 * Core missions are the hand-written `dayN.ts` files. `specMissions(lang)` is what a language's
 * registry spreads in — so these missions can never exist in one language and not another.
 */
export const CORE_SPECS: readonly MissionSpec[] = [
  EVERYDAY_CORE, TIME_PLANS, HOME_FAMILY, HOBBIES, PAST_EVENTS, FUTURE_PLANS, OPINIONS, LOST_STOLEN,
  SMALL_TALK, FIXING_PROBLEMS, EMERGENCY,
  ARRIVAL_DAY, EVERYDAY_DAY, CITY_CONVERSATION, NO_SUBTITLES, COMPLETE_DAY,
];

export function specMissions(lang: MissionLang): Record<number, BootcampDayContent> {
  return Object.fromEntries(CORE_SPECS.map((spec) => [spec.day, buildMission(spec, lang)]));
}
