import type { BootcampDayContent } from '../types.js';
import { specMissions } from '../core/index.js';
import { DAY1_FR } from './day1.js';
import { DAY2_FR } from './day2.js';
import { DAY3_FR } from './day3.js';
import { DAY4_FR } from './day4.js';
import { DAY5_FR } from './day5.js';
import { DAY6_FR } from './day6.js';
import { DAY7_FR } from './day7.js';
import { DAY8_FR } from './day8.js';
import { DAY10_FR } from './day10.js';
import { DAY13_FR } from './day13.js';
import { DAY16_FR } from './day16.js';
import { DAY18_FR } from './day18.js';
import { DAY25_FR } from './day25.js';
import { DAY28_FR } from './day28.js';

/**
 * French Bootcamp missions (content-only). Same `BootcampDayContent` shape as the English missions;
 * each registered here becomes a playable French mission — adding one is a pure content task, no
 * engine change (the language-agnostic registry in bootcampStore selects the set by learning
 * language). Missions NOT present here show as honest "not built" for French — never English.
 *
 * Status: French Bootcamp at full parity with the English missions (see docs/FRENCH-PILOT.md).
 */
export const DAYS_FR: Record<number, BootcampDayContent> = {
  1: DAY1_FR,
  2: DAY2_FR,
  3: DAY3_FR,
  4: DAY4_FR,
  5: DAY5_FR,
  6: DAY6_FR,
  7: DAY7_FR,
  8: DAY8_FR,
  10: DAY10_FR,
  13: DAY13_FR,
  16: DAY16_FR,
  18: DAY18_FR,
  25: DAY25_FR,
  28: DAY28_FR,
  ...specMissions('fr'),
};
