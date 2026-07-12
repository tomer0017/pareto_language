import { DAY1 } from './day1.js';
import { DAY2 } from './day2.js';
import { DAY3 } from './day3.js';
import { DAY4 } from './day4.js';
import { DAY5 } from './day5.js';
import { DAY6 } from './day6.js';
import { DAY7 } from './day7.js';
import { DAY8 } from './day8.js';
import { DAY9 } from './day9.js';
import { DAY10 } from './day10.js';
import { DAY11 } from './day11.js';
import { DAY12 } from './day12.js';
import { DAY13 } from './day13.js';
import { DAY14 } from './day14.js';
import { DAY15 } from './day15.js';
import { DAY16 } from './day16.js';
import { DAY17 } from './day17.js';
import { DAY18 } from './day18.js';
import { DAY19 } from './day19.js';
import { DAY20 } from './day20.js';
import { DAY21 } from './day21.js';
import { DAY22 } from './day22.js';
import { DAY23 } from './day23.js';
import { DAY24 } from './day24.js';
import { DAY25 } from './day25.js';
import { DAY26 } from './day26.js';
import { DAY27 } from './day27.js';
import { DAY28 } from './day28.js';
import { DAY29 } from './day29.js';
import { DAY30 } from './day30.js';
import { DAYS_FR } from './fr/index.js';
import type { BootcampDayContent } from './types.js';

/**
 * The language-agnostic mission registry — PURE (no store/localStorage), so it is unit-testable and
 * so parity checks can import it without booting the app. The seam that makes the Bootcamp
 * content-only per language: a learning language's missions are looked up by code; a language with
 * no missions yet returns `{}` (its missions show as honest "not built" — NEVER an English
 * fallback). Adding a language = register its mission set here, zero engine change.
 */

/** The English mission set (the pilot). `DAYS` name kept — many tests/consumers reference it. */
export const DAYS: Record<number, BootcampDayContent> = {
  1: DAY1, 2: DAY2, 3: DAY3, 4: DAY4, 5: DAY5, 6: DAY6, 7: DAY7, 8: DAY8, 9: DAY9, 10: DAY10,
  11: DAY11, 12: DAY12, 13: DAY13, 14: DAY14, 15: DAY15, 16: DAY16, 17: DAY17, 18: DAY18, 19: DAY19, 20: DAY20,
  21: DAY21, 22: DAY22, 23: DAY23, 24: DAY24, 25: DAY25, 26: DAY26, 27: DAY27, 28: DAY28, 29: DAY29, 30: DAY30,
};

export const MISSIONS_BY_LANG: Record<string, Record<number, BootcampDayContent>> = {
  en: DAYS,
  fr: DAYS_FR,
};

export function missionsFor(lang: string): Record<number, BootcampDayContent> {
  return MISSIONS_BY_LANG[lang] ?? {};
}
