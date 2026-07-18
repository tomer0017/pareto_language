import type { BootcampDayContent } from '../types.js';
import { DAY1_ES } from './day1.js';
import { DAY2_ES } from './day2.js';
import { DAY3_ES } from './day3.js';
import { DAY4_ES } from './day4.js';
import { DAY5_ES } from './day5.js';
import { DAY6_ES } from './day6.js';
import { DAY7_ES } from './day7.js';
import { DAY8_ES } from './day8.js';
import { DAY9_ES } from './day9.js';
import { DAY10_ES } from './day10.js';
import { DAY11_ES } from './day11.js';
import { DAY12_ES } from './day12.js';
import { DAY13_ES } from './day13.js';
import { DAY14_ES } from './day14.js';
import { DAY15_ES } from './day15.js';
import { DAY16_ES } from './day16.js';
import { DAY17_ES } from './day17.js';
import { DAY18_ES } from './day18.js';
import { DAY19_ES } from './day19.js';
import { DAY20_ES } from './day20.js';
import { DAY21_ES } from './day21.js';
import { DAY22_ES } from './day22.js';
import { DAY23_ES } from './day23.js';
import { DAY24_ES } from './day24.js';
import { DAY25_ES } from './day25.js';
import { DAY26_ES } from './day26.js';
import { DAY27_ES } from './day27.js';
import { DAY28_ES } from './day28.js';
import { DAY29_ES } from './day29.js';
import { DAY30_ES } from './day30.js';

/**
 * Spanish Bootcamp missions (content-only). Same `BootcampDayContent` shape as the English and French
 * missions; each registered here becomes a playable Spanish mission — adding one is a pure content
 * task, no engine change (the language-agnostic registry in bootcampStore selects the set by learning
 * language). Missions NOT present here would show as honest "not built" for Spanish — never English.
 *
 * Status: Spanish Bootcamp at full parity with the 30 English missions. Neutral international Spanish,
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
  9: DAY9_ES,
  10: DAY10_ES,
  11: DAY11_ES,
  12: DAY12_ES,
  13: DAY13_ES,
  14: DAY14_ES,
  15: DAY15_ES,
  16: DAY16_ES,
  17: DAY17_ES,
  18: DAY18_ES,
  19: DAY19_ES,
  20: DAY20_ES,
  21: DAY21_ES,
  22: DAY22_ES,
  23: DAY23_ES,
  24: DAY24_ES,
  25: DAY25_ES,
  26: DAY26_ES,
  27: DAY27_ES,
  28: DAY28_ES,
  29: DAY29_ES,
  30: DAY30_ES,
};
