import type { CorpusRow } from '../types.js';
import { VISUAL_PILOT } from './visual-pilot.js';
import { GLUE } from './glue.js';
import { NUMBERS_TIME } from './numbers-time.js';
import { ACTIONS } from './actions.js';
import { DESCRIPTIONS } from './descriptions.js';
import { FOOD_PLACES } from './food-places.js';
import { TRANSPORT_MONEY } from './transport-money.js';
import { HEALTH_PEOPLE } from './health-people.js';
import { OBJECTS_HOME } from './objects-home.js';

/** READY Core 500 — the full authored corpus (order here is authoring order; rank is derived). */
export const CORPUS: CorpusRow[] = [
  ...VISUAL_PILOT,
  ...GLUE,
  ...NUMBERS_TIME,
  ...ACTIONS,
  ...DESCRIPTIONS,
  ...FOOD_PLACES,
  ...TRANSPORT_MONEY,
  ...HEALTH_PEOPLE,
  ...OBJECTS_HOME,
];
