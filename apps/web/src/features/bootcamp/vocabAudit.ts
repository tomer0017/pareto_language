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
    primingWords: ['how much', 'one', 'two', 'five', 'eight', 'box', 'cash', 'card'],
    excluded: ['every individual number 11–99 — pattern-drilled, never memorized as cards'],
    justification: 'Price comprehension is the whole mission: the four numbers of the market offer (1, 2, 5, 8), the unit (box) and the payment words are all new by ear.' }),
  3: A({ day: 3, decision: 'primed',
    globalWords: ['coffee', 'milk', 'sugar', 'hot', 'cold', 'small', 'big', 'with', 'without'], priorKnowledge: ['please'],
    primingWords: ['iced coffee', 'medium', 'large', 'milk', 'sugar', 'with', 'no', 'receipt'],
    excluded: ['full drink menu, "croissant" (an already-readable loanword)', 'cash / card and prices (Mission 02 — reactivated, not retaught)'],
    justification: 'Step 0 (optional): eight blocks that decode the whole barista chain — the drink, the two sizes, milk / sugar with / without, the receipt.' }),
  4: A({ day: 4, decision: 'primed',
    globalWords: ['water', 'with', 'without'], priorKnowledge: ['please / thanks', 'Good evening', 'reservation', 'two / four', 'Perfect', 'Of course', "Anything else? → That's all, thanks. (Mission 03)"],
    primingWords: ['No — a table for two, please.', 'Are you ready to order?', "I'll have the chicken, without onions, please.", 'Of course. Anything to drink?', 'A bottle of water, please.', 'Coming right up!', 'Is everything okay?', 'Yes, that was delicious! The bill, please.'],
    excluded: ['a restaurant vocabulary list (table, menu, fork, dessert…) — the table and the menus are met inside the meal', 'dish names and food constraints beyond the locked onion removal (Mission 15)', '"Later…" — a scene cue, never a line', 'the Flex Round (transferOnly) — it recombines, it never teaches'],
    justification: 'One sit-down meal: each new line is a card with its meaning — whole chunks, no word lists, no grammar. The one builder is the order (I’ll have → the dish → without …). "That’s all, thanks." is Mission 03’s own sentence: used, not re-taught.' }),
  5: A({ day: 5, decision: 'primed',
    globalWords: ['here', 'there', 'far'], priorKnowledge: ['excuse-me', 'five (Mission 02)', 'map (Mission 04)'],
    primingWords: ['station', 'straight ahead', 'left', 'corner', 'far', 'five minutes on foot', 'next to', 'bank'],
    excluded: ['"right" (not in the conversation — a way you could go is a picture, not a word)', '"near"', 'compass directions, "roundabout" etc.'],
    justification: 'Step 0 (optional): the pieces of the one set of directions in the conversation — where, which way, how far, next to what.' }),
  6: A({ day: 6, decision: 'primed',
    globalWords: ['here', 'stop', 'how-much'], priorKnowledge: ['how much', 'here', 'thank you', 'the centre', 'almost'],
    primingWords: ['address', 'stop', 'change'],
    excluded: ['street-name vocabulary — shown, not spoken', 'other fares and destinations — the traveller has one ride'],
    justification: 'The ride’s own words are new (Step 0); the fare and the traffic are met first in the driver’s lines, not pre-taught. "how much", "the centre" and "thank you" are reviewed; the recovery line is taught whole.' }),
  7: A({ day: 7, decision: 'primed',
    globalWords: ['name', 'breakfast'], priorKnowledge: ['name', 'passport', 'thank you', 'welcome', 'enjoy your stay'],
    primingWords: ['reservation', 'name', 'breakfast', 'passport'],
    excluded: ['room-amenity vocabulary — the reusable part lives in Fixing Problems', 'the stay details — the receptionist gives them, they are never pre-taught'],
    justification: 'Reservation and breakfast are new; "name" (Mission 01) and "passport" (Mission 06, verified) are reviewed. Room, floor, hours and the elevator are learned from the receptionist’s lines.' }),
  8: A({ day: 8, decision: 'primed',
    globalWords: ['size'], priorKnowledge: ['thank you', 'here you go', 'twenty', 'great', 'wonderful'],
    primingWords: ['size', 'fitting room'],
    excluded: ['fabric/material vocabulary — low travel ROI', 'the size problem, the sale and the price — they happen in the scene, they are never pre-taught'],
    justification: 'Step 0 (optional): the trying-on words only — size and the fitting room. The bigger size, one size up and the 20% sale are met first in the shopper’s and the salesperson’s own lines.' }),
  9: A({ day: 9, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['taxi + hotel sets'], primingWords: [], excluded: [],
    justification: 'Cold arrival checkpoint — no new content by design (concepts target = 0).' }),
  10: A({ day: 10, decision: 'primed', globalWords: ['passport', 'here'], priorKnowledge: ['two', 'thank you', 'welcome', 'enjoy your stay'],
    primingWords: ['holiday', 'week', 'two weeks', 'hotel', 'city centre'], excluded: ['visa/customs legalese', 'other trip purposes and lengths — the traveller has one trip'],
    justification: 'The trip’s own words are new (Step 0); "two" is reviewed from Mission 02, the welcome from Mission 01. Passport is taught on the passport cards.' }),
  13: A({ day: 13, decision: 'no-priming-needed', globalWords: ['without', 'more', 'less'], priorKnowledge: ['without'], primingWords: [], excluded: ['full allergen list — shown on a card, safety-critical, not drilled by ear'],
    justification: 'Allergy phrasing reuses the without-template; allergen names are read, not memorized.' }),
  16: A({ day: 16, decision: 'no-priming-needed', globalWords: ['here', 'there', 'how-much'], priorKnowledge: ['where', 'how much'], primingWords: [], excluded: [],
    justification: 'Supermarket is recognition-heavy (signs); reuses where/how-much.' }),
  17: A({ day: 17, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['coffee, plans, hobbies, home, shopping and restaurant sets'], primingWords: [], excluded: [],
    justification: 'Cold Everyday Day checkpoint — every learner line is a sentence an earlier mission taught.' }),
  18: A({ day: 18, decision: 'no-priming-needed', globalWords: ['here', 'there'], priorKnowledge: ['how much', 'where'], primingWords: [], excluded: ['line/route numbers — read on signage'],
    justification: 'Public transport reuses ticket/price/where blocks; platform numbers are read.' }),
  22: A({ day: 22, decision: 'primed', globalWords: ['from', 'here'], priorKnowledge: ["I'm from Israel", "it's my first time here", 'Is this your first time here?', 'welcome', 'thank you', 'of course', 'can you'],
    primingWords: ['How about you?', 'Can you recommend a place?', 'Thank you! It was nice talking to you.'],
    excluded: ['beautiful / wonderful as words of their own — met inside whole lines, never quizzed', 'the tip (Mama Rosa, the Old Town) — the local says it, it is never pre-taught'],
    justification: 'Each line is a card with its meaning — whole chunks, no word lists. "I’m from Israel" and "it’s my first time here" (Mission 01, verified) are ♻️ review; the new functions are How about you?, Can you recommend a place? and It was nice talking to you.' }),
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
  31: A({ day: 31, decision: 'primed', globalWords: ['today', 'tomorrow', 'now', 'later'], priorKnowledge: ['seven / eight', 'here', 'centre', 'eat', 'come', 'do you want', 'great', 'perfect', "it's very good", 'no problem (EN / FR)'],
    primingWords: ["I'm free tonight.", 'Yes! What time?', "No, that's not too late.", 'What are you doing tomorrow?', "No problem. Let's meet here at seven."],
    excluded: ['clock-reading drills — times are heard as whole chunks ("at eight") and captured as plain 18:00 / 20:00 / 22:00', 'today / tonight / tomorrow as a word list — met inside the friend’s questions', '"Yes, I’m free tomorrow." — a transfer of "I’m free tonight.", never a card of its own'],
    justification: 'Each line is a card with its meaning — whole chunks, no word lists, no grammar. The reusable pattern "I’m free + a time" is taught once (tonight) and transferred (tomorrow); the friend’s "today? / tonight?" become the learner’s own "tomorrow?". Numbers, here, centre and "no problem" (EN / FR) are verified prior learning.' }),
  32: A({ day: 32, decision: 'primed', globalWords: ['home', 'family', 'here'], priorKnowledge: ['thanks / merci / gracias', 'where is', "I'm going (EN) / je vais / voy a", 'with us', 'eat'],
    primingWords: ['Where is your family?', 'Yes, I live with my family.', "Thanks, but I'm going to eat at my grandmother's.", "Yes, I'm just tired.", "Yes, I'm going home.", "I'm going to sleep."],
    excluded: ['furniture and extended-family vocabulary — the living room, kitchen, mother and grandmother are met inside the visit, never as a list', 'a "going to" grammar rule — home / to eat / to sleep are three chunks, each in its language’s own words', 'the Flex Round (transferOnly) — it recombines taught words and is never teaching'],
    justification: 'A home visit: each line is a card with its meaning — whole chunks, no word lists, no grammar. The one builder is the polite decline (thank → but → my plan). "Thanks" and "Where is" are verified prior learning.' }),
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
