import { buildMission } from './author.js';
import { FIXING_PROBLEMS } from './core/fixingProblems.js';
import type { BootcampItem } from './types.js';

/** This mission is authored once for every language in `core/fixingProblems.ts` and registered through
 *  `core/index.ts`. Only its English sentences are exported here, for the missions that reuse them. */
export const DAY24_ITEMS: BootcampItem[] = buildMission(FIXING_PROBLEMS, 'en').items;
