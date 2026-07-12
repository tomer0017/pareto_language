import type { BootcampDayContent } from '../types.js';
import { DAY1_FR } from './day1.js';
import { DAY2_FR } from './day2.js';

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
};
