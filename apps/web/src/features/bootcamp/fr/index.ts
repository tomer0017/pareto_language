import type { BootcampDayContent } from '../types.js';
import { DAY1_FR } from './day1.js';
import { DAY2_FR } from './day2.js';
import { DAY3_FR } from './day3.js';
import { DAY4_FR } from './day4.js';
import { DAY5_FR } from './day5.js';
import { DAY6_FR } from './day6.js';
import { DAY7_FR } from './day7.js';
import { DAY8_FR } from './day8.js';
import { DAY9_FR } from './day9.js';
import { DAY10_FR } from './day10.js';
import { DAY11_FR } from './day11.js';
import { DAY12_FR } from './day12.js';
import { DAY13_FR } from './day13.js';
import { DAY14_FR } from './day14.js';

/**
 * French Bootcamp missions (content-only). Same `BootcampDayContent` shape as the English missions;
 * each registered here becomes a playable French mission — adding one is a pure content task, no
 * engine change (the language-agnostic registry in bootcampStore selects the set by learning
 * language). Missions NOT present here show as honest "not built" for French — never English.
 *
 * Status: French Bootcamp authoring in progress; missions land here one file at a time.
 * Parity target: the 30 English missions (see docs/FRENCH-PILOT.md).
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
  9: DAY9_FR,
  10: DAY10_FR,
  11: DAY11_FR,
  12: DAY12_FR,
  13: DAY13_FR,
  14: DAY14_FR,
};
