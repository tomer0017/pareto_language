import { DAY11 } from './day11.js';
import { DAY12 } from './day12.js';
import { DAY14 } from './day14.js';
import { DAY15 } from './day15.js';
import { DAY19 } from './day19.js';
import { DAY20 } from './day20.js';
import { DAY21 } from './day21.js';
import { DAY11_FR } from './fr/day11.js';
import { DAY12_FR } from './fr/day12.js';
import { DAY14_FR } from './fr/day14.js';
import { DAY15_FR } from './fr/day15.js';
import { DAY19_FR } from './fr/day19.js';
import { DAY20_FR } from './fr/day20.js';
import { DAY21_FR } from './fr/day21.js';
import { DAY11_ES } from './es/day11.js';
import { DAY12_ES } from './es/day12.js';
import { DAY14_ES } from './es/day14.js';
import { DAY15_ES } from './es/day15.js';
import { DAY19_ES } from './es/day19.js';
import { DAY20_ES } from './es/day20.js';
import { DAY21_ES } from './es/day21.js';
import type { BootcampDayContent } from './types.js';

/**
 * Mission content that is NOT part of the Core 30 — kept, complete and tested, but never shown:
 *
 *  - `EXTENDED_MISSIONS` — the Extended Mission Pool (plan.ts `EXTENDED_POOL`): Street Food &
 *    Markets, Tickets & Attractions, Wifi / SIM & Practical, Souvenirs & Gifts. Preserved as-is for
 *    a later 31+ track; no final numbers are assigned yet.
 *  - `MERGED_SOURCES` — missions merged into another Core mission (plan.ts `MERGED_MISSIONS`):
 *    Hotel Requests & Problems, Restaurant Basics, Paying Anywhere. Their sentences are still
 *    imported by the Core missions that reuse them.
 *
 * Deliberately separate from `registry.ts`: nothing here reaches the journey, Listen, the sentence
 * library or Videos. Their in-mission "Mission N:" headlines are the pre-restructure ones.
 */
type ByLang = Record<string, Record<number, BootcampDayContent>>;

export const EXTENDED_MISSIONS: ByLang = {
  en: { 15: DAY15, 19: DAY19, 20: DAY20, 21: DAY21 },
  fr: { 15: DAY15_FR, 19: DAY19_FR, 20: DAY20_FR, 21: DAY21_FR },
  es: { 15: DAY15_ES, 19: DAY19_ES, 20: DAY20_ES, 21: DAY21_ES },
};

export const MERGED_SOURCES: ByLang = {
  en: { 11: DAY11, 12: DAY12, 14: DAY14 },
  fr: { 11: DAY11_FR, 12: DAY12_FR, 14: DAY14_FR },
  es: { 11: DAY11_ES, 12: DAY12_ES, 14: DAY14_ES },
};
