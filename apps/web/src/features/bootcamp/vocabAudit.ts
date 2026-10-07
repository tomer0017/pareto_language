/**
 * Mission-by-mission vocabulary audit (Parts 1, 2, 9). A machine-checkable record of the priming
 * DECISION for every English mission, so "every mission is audited" is enforced by a test, not a
 * claim, and so the decision can never silently drift from the mission content. Priming is added ONLY
 * where a zero-level learner meets a sentence whose building blocks weren't introduced before.
 *
 * The prose version (with 80/20 justifications) lives in docs/VOCABULARY-AUDIT.md; this is the data
 * the tests bind to. Keyed by `day` — the content-registry key, not the mission's number (plan.ts).
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
    globalWords: ['i', 'you'], priorKnowledge: [],
    primingWords: ['Hi', 'welcome', 'name', 'from', 'first time', 'nice to meet you', 'yes'],
    excluded: ['occupation / age vocabulary — not needed to survive a first introduction'],
    justification: 'The first mission, zero prior knowledge: the greeting, welcome, name, from, first time and yes are all new blocks — what the learner says AND what the host says.' }),
  2: A({ day: 2, decision: 'primed',
    globalWords: ['five', 'ten', 'twenty', 'how-much'], priorKnowledge: [],
    primingWords: ['how much', 'euros', 'cash', 'card', 'five', 'ten'],
    excluded: ['every individual number 11–99 — pattern-drilled, never memorized as cards'],
    justification: 'Price comprehension is the whole mission; number and payment words are all new by ear.' }),
  3: A({ day: 3, decision: 'primed',
    globalWords: ['coffee', 'milk', 'sugar', 'hot', 'cold', 'small', 'big', 'with', 'without'], priorKnowledge: ['please'],
    primingWords: ['coffee', 'milk', 'sugar', 'medium', 'with', 'no / without'],
    excluded: ['full drink menu, "croissant" (an already-readable loanword)'],
    justification: 'Six words control the whole barista follow-up chain (size, milk/sugar, with/without).' }),
  4: A({ day: 4, decision: 'primed',
    globalWords: ['water', 'with', 'without'], priorKnowledge: ['please', 'with', 'without'],
    primingWords: ['table', 'menu', 'water', 'bill', 'please'],
    excluded: ['dish names — situation-specific and read off the menu, not memorized'],
    justification: 'The meal’s key nouns are new; with/without and please are reviewed, not re-taught. Restaurant Basics is merged in here.' }),
  5: A({ day: 5, decision: 'primed',
    globalWords: ['here', 'there', 'near', 'far'], priorKnowledge: ['excuse-me'],
    primingWords: ['excuse me', 'left', 'right', 'straight', 'near', 'far'],
    excluded: ['compass directions, "roundabout" etc. — rare for a pedestrian ask'],
    justification: 'Directions are 90% listening; the answer words (left/right/straight/near/far) are new and essential.' }),
  6: A({ day: 6, decision: 'primed',
    globalWords: ['here', 'stop', 'how-much'], priorKnowledge: ['how much', 'here'],
    primingWords: ['address', 'airport', 'stop', 'here', 'how much'],
    excluded: ['street-name vocabulary — shown, not spoken (use the show-me tool)'],
    justification: 'Address/airport/stop are new; "how much" is reviewed from the money mission.' }),
  7: A({ day: 7, decision: 'primed',
    globalWords: ['name', 'breakfast'], priorKnowledge: ['name'],
    primingWords: ['reservation', 'name', 'breakfast', 'passport'],
    excluded: ['room-amenity vocabulary — the reusable part lives in Fixing Problems'],
    justification: 'Check-in nouns are new; "name" is reviewed from the introduction mission.' }),
  8: A({ day: 8, decision: 'no-priming-needed',
    globalWords: ['small', 'big', 'medium', 'large', 'more', 'less', 'with', 'without'], priorKnowledge: ['medium', 'with', 'how much'],
    primingWords: [], excluded: ['fabric/material vocabulary — low travel ROI'],
    justification: 'Sizes and decision words are now global Core + primed in the café/restaurant; no new blocks.' }),
  9: A({ day: 9, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['taxi + hotel sets'], primingWords: [], excluded: [],
    justification: 'Cold arrival checkpoint — no new content by design (concepts target = 0).' }),
  10: A({ day: 10, decision: 'no-priming-needed', globalWords: ['passport', 'here'], priorKnowledge: ['passport', 'night'], primingWords: [], excluded: ['visa/customs legalese'],
    justification: 'Border script reuses passport/nights/purpose blocks from hotel + introduction.' }),
  13: A({ day: 13, decision: 'no-priming-needed', globalWords: ['without', 'more', 'less'], priorKnowledge: ['without'], primingWords: [], excluded: ['full allergen list — shown on a card, safety-critical, not drilled by ear'],
    justification: 'Allergy phrasing reuses the without-template; allergen names are read, not memorized.' }),
  16: A({ day: 16, decision: 'no-priming-needed', globalWords: ['here', 'there', 'how-much'], priorKnowledge: ['where', 'how much'], primingWords: [], excluded: [],
    justification: 'Supermarket is recognition-heavy (signs); reuses where/how-much.' }),
  17: A({ day: 17, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['coffee, plans, hobbies, home, shopping and restaurant sets'], primingWords: [], excluded: [],
    justification: 'Cold Everyday Day checkpoint — every learner line is a sentence an earlier mission taught.' }),
  18: A({ day: 18, decision: 'no-priming-needed', globalWords: ['here', 'there'], priorKnowledge: ['how much', 'where'], primingWords: [], excluded: ['line/route numbers — read on signage'],
    justification: 'Public transport reuses ticket/price/where blocks; platform numbers are read.' }),
  22: A({ day: 22, decision: 'no-priming-needed', globalWords: ['from', 'here'], priorKnowledge: ['name', 'from', 'holiday'], primingWords: [], excluded: [],
    justification: 'Small talk reuses the introduction blocks (name, from, first time); the new lines are whole reusable chunks.' }),
  23: A({ day: 23, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['transport, small talk, past, future and opinion sets'], primingWords: [], excluded: [],
    justification: 'Cold City & Conversation checkpoint — no new content by design.' }),
  24: A({ day: 24, decision: 'no-priming-needed', globalWords: ['without', 'can'], priorKnowledge: ['recovery tools', 'without'], primingWords: [], excluded: [],
    justification: 'Fixing problems reuses known frames (can you…, there’s a problem) in two short scenes — reuse, not new words.' }),
  25: A({ day: 25, decision: 'no-priming-needed', globalWords: ['here', 'more', 'less'], priorKnowledge: ['help', 'without'], primingWords: [], excluded: ['drug names — shown on packaging, safety-critical'],
    justification: 'Pharmacy reuses help/without/here; symptom nouns are read on the box.' }),
  26: A({ day: 26, decision: 'no-priming-needed', globalWords: ['help', 'here'], priorKnowledge: ['help', 'here'], primingWords: [], excluded: [],
    justification: 'Emergency set is overlearned recovery language; must be automatic, not freshly primed.' }),
  27: A({ day: 27, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['all prior sets'], primingWords: [], excluded: [],
    justification: 'No-subtitles rehearsal — deliberately removes support; no new content.' }),
  28: A({ day: 28, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['all prior sets'], primingWords: [], excluded: [],
    justification: 'Dress rehearsal chains known moments; no new content by design.' }),
  29: A({ day: 29, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['everything'], primingWords: [], excluded: [],
    justification: 'Finale — a cold full-day verdict; no new content by design.' }),
  30: A({ day: 30, decision: 'primed',
    globalWords: ['can', 'want', 'need', 'have', 'know'], priorKnowledge: ['please', 'coffee'],
    primingWords: ['want', 'need', 'have', 'can', 'know'],
    excluded: ['every noun — towel, key, map are throwaway variables; the five verbs are the lesson'],
    justification: 'Everyday Core is the sentence machinery of the course: five verbs, primed once, then reused in every mission.' }),
  31: A({ day: 31, decision: 'no-priming-needed', globalWords: ['today', 'tomorrow', 'now', 'later'], priorKnowledge: ['want', 'can', 'numbers'], primingWords: [], excluded: ['clock-reading drills — times are heard as whole chunks ("at eight")'],
    justification: 'Time words are short global Core concepts met as whole chunks inside plans, not as a word list.' }),
  32: A({ day: 32, decision: 'no-priming-needed', globalWords: ['home', 'family', 'here'], priorKnowledge: ['where is', 'want', 'tired'], primingWords: [], excluded: ['furniture and extended-family vocabulary'],
    justification: 'One frame (I’m going to…) carries the mission; home/family are global Core concepts.' }),
  33: A({ day: 33, decision: 'no-priming-needed', globalWords: ['like', 'love'], priorKnowledge: ['want', 'I like it'], primingWords: [], excluded: ['a hobby vocabulary list — the hobbies are replaceable variables'],
    justification: 'Four frames (like / don’t like / usually / want to try) built on verbs already known.' }),
  34: A({ day: 34, decision: 'no-priming-needed', globalWords: ['yesterday'], priorKnowledge: ['old town', 'hostel', 'good'], primingWords: [], excluded: ['every past form beyond went / saw / ate / stayed / was'],
    justification: 'Five past verbs, each taught as a whole sentence with a tool step — a word list would turn it into a grammar table.' }),
  35: A({ day: 35, decision: 'no-priming-needed', globalWords: ['tomorrow', 'after'], priorKnowledge: ['I’m going to', 'I want to'], primingWords: [], excluded: ['destination names'],
    justification: 'Future plans reuse the going-to and want-to frames from Home and Everyday Core.' }),
  36: A({ day: 36, decision: 'no-priming-needed', globalWords: ['why', 'because', 'but', 'maybe'], priorKnowledge: ['too expensive', 'tired', 'I like it'], primingWords: [], excluded: ['abstract opinion vocabulary'],
    justification: 'The connectors are global Core concepts; each is met inside a full, reusable chunk.' }),
  37: A({ day: 37, decision: 'no-priming-needed', globalWords: ['help', 'phone', 'passport'], priorKnowledge: ['I have', 'where is', 'I want to'], primingWords: [], excluded: ['insurance / form vocabulary'],
    justification: 'Lost/stolen reuses have / where-is / want-to; the three new verbs arrive as whole sentences.' }),
};
