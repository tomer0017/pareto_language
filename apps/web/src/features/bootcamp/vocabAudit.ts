/**
 * Mission-by-mission vocabulary audit (Parts 1, 2, 9). A machine-checkable record of the priming
 * DECISION for every English mission, so "every mission is audited" is enforced by a test, not a
 * claim, and so the decision can never silently drift from the mission content. Priming is added ONLY
 * where a zero-level learner meets a sentence whose building blocks weren't introduced before.
 *
 * The prose version (with 80/20 justifications) lives in docs/VOCABULARY-AUDIT.md; this is the data
 * the tests bind to. French built missions (1–4) mirror their English counterparts.
 */

export type PrimingDecision = 'primed' | 'no-priming-needed';

export interface MissionVocabAudit {
  day: number;
  decision: PrimingDecision;
  /** Reusable global Core concepts this situation leans on (already in Browse/audio/flashcards). */
  globalWords: string[];
  /** Building blocks assumed known from earlier missions (nothing re-taught as new). */
  priorKnowledge: string[];
  /** The local priming words (must match the mission's `prime` step when decision = 'primed'). */
  primingWords: string[];
  /** Words considered but left out under 80/20, with the reason. */
  excluded: string[];
  /** Why this decision — one honest sentence. */
  justification: string;
}

const A = (a: MissionVocabAudit): MissionVocabAudit => a;

export const MISSION_VOCAB_AUDIT: Record<number, MissionVocabAudit> = {
  1: A({ day: 1, decision: 'primed',
    globalWords: ['sorry', 'please', 'thank-you', 'understand'], priorKnowledge: [],
    primingWords: ['sorry', 'I', 'understand', 'slowly', 'please'],
    excluded: ['full pronoun paradigm (we/they/he/she) — Day 1 is reflexes, not grammar'],
    justification: 'Zero prior knowledge; the recovery tools need a tiny word foundation, 3 of which compose the first tool.' }),
  2: A({ day: 2, decision: 'primed',
    globalWords: ['i', 'you'], priorKnowledge: ['please', 'thank-you'],
    primingWords: ['name', 'from', 'holiday', 'first time'],
    excluded: ['occupation / age vocabulary — not needed to survive a first introduction'],
    justification: 'First social mission: "holiday", "from" and the name template are new blocks.' }),
  3: A({ day: 3, decision: 'primed',
    globalWords: ['five', 'ten', 'twenty', 'how-much'], priorKnowledge: [],
    primingWords: ['how much', 'euros', 'cash', 'card', 'five', 'ten'],
    excluded: ['every individual number 11–99 — pattern-drilled, never memorized as cards'],
    justification: 'Price comprehension is the whole mission; number and payment words are all new by ear.' }),
  4: A({ day: 4, decision: 'primed',
    globalWords: ['coffee', 'milk', 'sugar', 'hot', 'cold', 'small', 'big', 'with', 'without'], priorKnowledge: ['please'],
    primingWords: ['coffee', 'milk', 'sugar', 'medium', 'with', 'no / without'],
    excluded: ['full drink menu, "croissant" (an already-readable loanword)'],
    justification: 'Six words control the whole barista follow-up chain (size, milk/sugar, with/without).' }),
  5: A({ day: 5, decision: 'primed',
    globalWords: ['water', 'with', 'without'], priorKnowledge: ['please', 'with', 'without'],
    primingWords: ['table', 'menu', 'water', 'bill', 'please'],
    excluded: ['dish names — situation-specific and read off the menu, not memorized'],
    justification: 'The meal’s key nouns are new; with/without and please are reviewed, not re-taught.' }),
  6: A({ day: 6, decision: 'primed',
    globalWords: ['here', 'there', 'near', 'far'], priorKnowledge: ['excuse-me'],
    primingWords: ['excuse me', 'left', 'right', 'straight', 'near', 'far'],
    excluded: ['compass directions, "roundabout" etc. — rare for a pedestrian ask'],
    justification: 'Directions are 90% listening; the answer words (left/right/straight/near/far) are new and essential.' }),
  7: A({ day: 7, decision: 'primed',
    globalWords: ['here', 'stop', 'how-much'], priorKnowledge: ['how much', 'here'],
    primingWords: ['address', 'airport', 'stop', 'here', 'how much'],
    excluded: ['street-name vocabulary — shown, not spoken (use the show-me tool)'],
    justification: 'Address/airport/stop are new; "how much" is reviewed from the money mission.' }),
  8: A({ day: 8, decision: 'primed',
    globalWords: ['name', 'breakfast'], priorKnowledge: ['name'],
    primingWords: ['reservation', 'name', 'night', 'breakfast', 'passport'],
    excluded: ['room-amenity vocabulary — deferred to Mission 12 (Hotel Requests)'],
    justification: 'Check-in nouns are new; "name" is reviewed from the introduction mission.' }),
  9: A({ day: 9, decision: 'no-priming-needed',
    globalWords: ['small', 'big', 'medium', 'large', 'more', 'less', 'with', 'without'], priorKnowledge: ['medium', 'with', 'how much'],
    primingWords: [], excluded: ['fabric/material vocabulary — low travel ROI'],
    justification: 'Sizes and decision words are now global Core + primed in the café/restaurant; no new blocks.' }),
  10: A({ day: 10, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['taxi + hotel sets'], primingWords: [], excluded: [],
    justification: 'Cold arrival checkpoint — no new content by design (concepts target = 0).' }),
  11: A({ day: 11, decision: 'no-priming-needed', globalWords: ['passport', 'here'], priorKnowledge: ['passport', 'night'], primingWords: [], excluded: ['visa/customs legalese'],
    justification: 'Border script reuses passport/nights/purpose blocks from hotel + introduction.' }),
  12: A({ day: 12, decision: 'no-priming-needed', globalWords: ['hot', 'cold', 'open', 'closed', 'can'], priorKnowledge: ['can', 'reservation'], primingWords: [], excluded: [],
    justification: 'Requests reuse the can/do-you-have templates + hot/cold now in global Core.' }),
  13: A({ day: 13, decision: 'no-priming-needed', globalWords: ['table', 'menu', 'water', 'bill'], priorKnowledge: ['table', 'menu', 'water', 'bill'], primingWords: [], excluded: [],
    justification: 'Restaurant Basics reuses the exact nouns primed in Mission 5.' }),
  14: A({ day: 14, decision: 'no-priming-needed', globalWords: ['without', 'more', 'less'], priorKnowledge: ['without'], primingWords: [], excluded: ['full allergen list — shown on a card, safety-critical, not drilled by ear'],
    justification: 'Allergy phrasing reuses the without-template; allergen names are read, not memorized.' }),
  15: A({ day: 15, decision: 'no-priming-needed', globalWords: ['cash', 'card', 'how-much'], priorKnowledge: ['cash', 'card', 'how much'], primingWords: [], excluded: [],
    justification: 'Paying Anywhere consolidates Mission 3 payment words across contexts — pure review.' }),
  16: A({ day: 16, decision: 'no-priming-needed', globalWords: ['how-much', 'more', 'less'], priorKnowledge: ['how much', 'euros'], primingWords: [], excluded: [],
    justification: 'Street food reuses ordering + price blocks at speed; no new vocabulary.' }),
  17: A({ day: 17, decision: 'no-priming-needed', globalWords: ['here', 'there', 'how-much'], priorKnowledge: ['where', 'how much'], primingWords: [], excluded: [],
    justification: 'Supermarket is recognition-heavy (signs); reuses where/how-much.' }),
  18: A({ day: 18, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['food-day sets'], primingWords: [], excluded: [],
    justification: 'Cold food-day checkpoint — no new content by design.' }),
  19: A({ day: 19, decision: 'no-priming-needed', globalWords: ['here', 'there'], priorKnowledge: ['how much', 'where'], primingWords: [], excluded: ['line/route numbers — read on signage'],
    justification: 'Public transport reuses ticket/price/where blocks; platform numbers are read.' }),
  20: A({ day: 20, decision: 'no-priming-needed', globalWords: ['how-much', 'open', 'closed'], priorKnowledge: ['how much', 'time'], primingWords: [], excluded: [],
    justification: 'Tickets & attractions reuse price + time; opening hours use global open/closed.' }),
  21: A({ day: 21, decision: 'no-priming-needed', globalWords: ['can', 'how-much'], priorKnowledge: ['can', 'how much'], primingWords: [], excluded: ['telecom jargon'],
    justification: 'SIM/wifi reuse the do-you-have + how-much combos.' }),
  22: A({ day: 22, decision: 'no-priming-needed', globalWords: ['more', 'less', 'small', 'big'], priorKnowledge: ['sizes', 'how much'], primingWords: [], excluded: [],
    justification: 'Souvenirs reuse shopping decision + size language from Mission 9.' }),
  23: A({ day: 23, decision: 'no-priming-needed', globalWords: ['from', 'here'], priorKnowledge: ['name', 'from', 'holiday'], primingWords: [], excluded: [],
    justification: 'Small talk reuses the introduction blocks; free-flow, not new vocabulary.' }),
  24: A({ day: 24, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['city-day sets'], primingWords: [], excluded: [],
    justification: 'Cold city-day checkpoint — no new content by design.' }),
  25: A({ day: 25, decision: 'no-priming-needed', globalWords: ['without', 'can'], priorKnowledge: ['recovery tools', 'without'], primingWords: [], excluded: [],
    justification: 'Fixing problems graduates the Day-1 recovery kit to adversity — reuse, not new words.' }),
  26: A({ day: 26, decision: 'no-priming-needed', globalWords: ['here', 'more', 'less'], priorKnowledge: ['help', 'without'], primingWords: [], excluded: ['drug names — shown on packaging, safety-critical'],
    justification: 'Pharmacy reuses help/without/here; symptom nouns are read on the box.' }),
  27: A({ day: 27, decision: 'no-priming-needed', globalWords: ['help', 'here'], priorKnowledge: ['help', 'here'], primingWords: [], excluded: [],
    justification: 'Emergency set is overlearned recovery language; must be automatic, not freshly primed.' }),
  28: A({ day: 28, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['all prior sets'], primingWords: [], excluded: [],
    justification: 'No-subtitles rehearsal — deliberately removes support; no new content.' }),
  29: A({ day: 29, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['all prior sets'], primingWords: [], excluded: [],
    justification: 'Dress rehearsal chains known moments; no new content by design.' }),
  30: A({ day: 30, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['everything'], primingWords: [], excluded: [],
    justification: 'Finale — a cold full-day verdict; no new content by design.' }),
};
