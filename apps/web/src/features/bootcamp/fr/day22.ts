import { buildMission } from '../author.js';
import { SMALL_TALK } from '../core/smallTalk.js';
import type { BootcampItem } from '../types.js';

/** This mission is authored once for every language in `core/smallTalk.ts` and registered through
 *  `core/index.ts`. Only its French sentences are exported here, for the missions that reuse them. */
export const DAY22_FR_ITEMS: BootcampItem[] = buildMission(SMALL_TALK, 'fr').items;
