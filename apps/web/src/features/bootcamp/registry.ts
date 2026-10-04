import { DAY1 } from './day1.js';
import { DAY2 } from './day2.js';
import { DAY3 } from './day3.js';
import { DAY4 } from './day4.js';
import { DAY5 } from './day5.js';
import { DAY6 } from './day6.js';
import { DAY7 } from './day7.js';
import { DAY8 } from './day8.js';
import { DAY10 } from './day10.js';
import { DAY13 } from './day13.js';
import { DAY16 } from './day16.js';
import { DAY18 } from './day18.js';
import { DAY25 } from './day25.js';
import { DAY28 } from './day28.js';
import { specMissions } from './core/index.js';
import { DAYS_FR } from './fr/index.js';
import { DAYS_ES } from './es/index.js';
import type { BootcampDayContent } from './types.js';

/**
 * The language-agnostic mission registry — PURE (no store/localStorage), so it is unit-testable and
 * so parity checks can import it without booting the app. The seam that makes the Bootcamp
 * content-only per language: a learning language's missions are looked up by code; a language with
 * no missions yet returns `{}` (its missions show as honest "not built" — NEVER an English
 * fallback). Adding a language = register its mission set here, zero engine change.
 */

/**
 * The English mission set (the pilot), keyed by `day` — the stable content-registry key, NOT the
 * mission's position (plan.ts owns order and numbering). Hand-written missions keep their file;
 * `specMissions` adds the missions authored once for every language (new keys 30–37, plus the
 * spec-authored 9 / 17 / 22 / 23 / 24 / 26 / 27 / 29). `DAYS` name kept — many tests/consumers reference it.
 */
export const DAYS: Record<number, BootcampDayContent> = {
  1: DAY1, 2: DAY2, 3: DAY3, 4: DAY4, 5: DAY5, 6: DAY6, 7: DAY7, 8: DAY8, 10: DAY10,
  13: DAY13, 16: DAY16, 18: DAY18, 25: DAY25, 28: DAY28,
  ...specMissions('en'),
};

export const MISSIONS_BY_LANG: Record<string, Record<number, BootcampDayContent>> = {
  en: DAYS,
  fr: DAYS_FR,
  es: DAYS_ES,
};

export function missionsFor(lang: string): Record<number, BootcampDayContent> {
  return MISSIONS_BY_LANG[lang] ?? {};
}
