import type { BootcampDayContent } from '../types.js';
import { specMissions } from '../core/index.js';
import { DAY1_ES } from './day1.js';
import { DAY2_ES } from './day2.js';
import { DAY3_ES } from './day3.js';
import { DAY4_ES } from './day4.js';
import { DAY5_ES } from './day5.js';
import { DAY6_ES } from './day6.js';
import { DAY7_ES } from './day7.js';
import { DAY8_ES } from './day8.js';
import { DAY10_ES } from './day10.js';
import { DAY13_ES } from './day13.js';
import { DAY16_ES } from './day16.js';
import { DAY18_ES } from './day18.js';
import { DAY25_ES } from './day25.js';
import { DAY28_ES } from './day28.js';

/**
 * Spanish Bootcamp missions (content-only). Same `BootcampDayContent` shape as the English and French
 * missions; each registered here becomes a playable Spanish mission — adding one is a pure content
 * task, no engine change (the language-agnostic registry in bootcampStore selects the set by learning
 * language). Missions NOT present here would show as honest "not built" for Spanish — never English.
 *
 * Status: Spanish Bootcamp at full parity with the English missions. Neutral international Spanish,
 * AI-drafted, pending native review.
 */
export const DAYS_ES: Record<number, BootcampDayContent> = {
  1: DAY1_ES,
  2: DAY2_ES,
  3: DAY3_ES,
  4: DAY4_ES,
  5: DAY5_ES,
  6: DAY6_ES,
  7: DAY7_ES,
  8: DAY8_ES,
  10: DAY10_ES,
  13: DAY13_ES,
  16: DAY16_ES,
  18: DAY18_ES,
  25: DAY25_ES,
  28: DAY28_ES,
  ...specMissions('es'),
};
