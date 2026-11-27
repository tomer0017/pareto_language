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
  13: A({ day: 13, decision: 'primed', globalWords: ['without', 'kitchen'], priorKnowledge: ['Are you ready to order? (Mission 14)', 'without onions (Mission 14)', 'Great / Parfait / Genial', 'please', 'Thank you! (the toolkit)', 'Of course', 'kitchen (Mission 13)'],
    primingWords: ["I'm allergic to nuts.", "I'm vegetarian.", 'Does it have dairy?', "Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", 'Yes, it has some cream, but we can make it without.', "Of course. I'll tell the kitchen about your allergy.", "I'll check with them and come right back."],
    excluded: ['an allergen list (gluten, shellfish, eggs…) — only nuts, the one in the conversation', 'vegan, meat and diet theory', 'dish vocabulary (risotto, mushroom, cream) as words — met inside the waiter’s lines only', 'any safety assurance ("safe", "no nuts") — the conversation never gives one'],
    justification: 'Four survival functions as whole-line cards — allergy, diet, ask about an ingredient, remove one — and the waiter’s answers. "Without onions", "Great", "Thank you!" and "Are you ready to order?" are verified prior learning: retrieved, not re-taught.' }),
  16: A({ day: 16, decision: 'primed', globalWords: ['where is', 'bag'], priorKnowledge: ['Hi / Bonjour / ¡Hola!', 'Where is (the) ___?', 'Thank you! (the toolkit)', 'Can I help you / Do you need (EN)', 'card, here', 'milk / water (EN), lait (FR), leche / agua (ES)', 'on the left (FR gauche, ES a la izquierda)'],
    primingWords: ['milk', 'water', 'bread', 'cheese', 'eggs', 'apples', 'Where is the milk?', 'Just this, thanks.', 'Could I get a bag?'],
    excluded: ['any seventh product — exactly six essentials (no meat, rice, pasta, coffee…)', 'kinds of bread — "bread" only', 'prices, totals, change, cash vs card, PIN, receipts — Missions 02 and 09 own money and shopping', 'bag variants (paper / plastic / cost)', '"At the checkout…" — a silent scene cue, never language', '"Where is the bread / cheese?" — transfer checks only, never taught', 'a Flex Round, builders, grammar'],
    justification: 'A two-minute supermarket sprint: six essentials on one shelf (recognition), three whole-line production tools (where is · just this · a bag) and the staff’s whole lines. "Thank you!", "Where is", "Hi" and "card" are verified prior learning; "Do you have bread?" stays a sentence only because the Everyday checkpoint reuses it as a wrong option — it is not taught here.' }),
  17: A({ day: 17, decision: 'no-priming-needed', globalWords: [], priorKnowledge: ['coffee, plans, hobbies, home, shopping and restaurant sets'], primingWords: [], excluded: [],
    justification: 'Cold Everyday Day checkpoint — every learner line is a sentence an earlier mission taught.' }),
  18: A({ day: 18, decision: 'primed', globalWords: ['ticket', 'platform'], priorKnowledge: ['Hello / Bonjour / ¡Hola!', 'Thank you! (the toolkit)', 'the centre (Missions 04, 06, 07)', 'two, three, ten (Missions 02, 17, 08)', 'straight ahead / tout droit / todo recto (Mission 05)', 'euros, minutes, please'],
    primingWords: ['One ticket to the centre, please.', 'Single, please.', 'Which platform?', 'Does this stop at the museum?'],
    excluded: ['a transport vocabulary deck (bus, metro, tram, station, driver, timetable…)', 'other ticket types (day pass, weekly pass, zones, round trip as a word)', 'delays, connections, changes, line numbers', 'stop names — the route is numbered 1 · 2 · 3', 'a destination drill ("airport" is not prior) — no transfer round', '"Thank you!" — prior, never a card', 'a Flex Round, builders, grammar'],
    justification: 'One train ride on whole-line cards: four production tools (one ticket to ___ · single · which platform · does this stop at ___) and the staff’s whole lines. The price, the frequency, the platform, the direction, the stop count and "next" are deterministic UI, shown only after the line says them. "Thank you!", "the centre", the numbers and "straight ahead" are verified prior learning; "It’s three stops." and "You’re going the wrong way." stay sentences only because the City checkpoint reuses them — they are not taught here.' }),
  22: A({ day: 22, decision: 'primed', globalWords: ['from', 'here'], priorKnowledge: ["I'm from Israel", "it's my first time here", 'Is this your first time here?', 'welcome', 'thank you', 'of course', 'can you'],
    primingWords: ['How about you?', 'Can you recommend a place?', 'Thank you! It was nice talking to you.'],
    excluded: ['beautiful / wonderful as words of their own — met inside whole lines, never quizzed', 'the tip (Mama Rosa, the Old Town) — the local says it, it is never pre-taught'],
    justification: 'Each line is a card with its meaning — whole chunks, no word lists. "I’m from Israel" and "it’s my first time here" (Mission 01, verified) are ♻️ review; the new functions are How about you?, Can you recommend a place? and It was nice talking to you.' }),
  23: A({ day: 23, decision: 'primed', globalWords: [], priorKnowledge: ['transport, small talk, past, future and opinion sets'], primingWords: ['You should take the boat tour.'], excluded: ['a "should" grammar rule — one recommendation line, met as a whole'],
    justification: 'Cold City & Conversation checkpoint — no new content, except "should": no earlier mission guarantees it (an optional branch never counts), so one context card shows the local’s line before the chat.' }),
  24: A({ day: 24, decision: 'primed', globalWords: ['problem', 'mistake', 'fix'], priorKnowledge: ['No problem / No pasa nada / Pas de problème (Mission 04)', 'thank you / gracias / merci', 'How can I help you? (Mission 08)', 'the bill / la cuenta / l’addition (Mission 14)', 'room, key (Missions 04, 08)', 'Good night (Mission 13)', 'the final’s new problems — chicken (Mission 14), fish (Mission 20), the key (Missions 04, 08), room 204 (Mission 08)'],
    primingWords: ["This isn't what I ordered.", 'I ordered the pasta.', "I think there's a mistake.", 'I was charged twice.', "There's a problem with my room.", "The air conditioning isn't working.", 'Can you fix it?', 'No. My room is very noisy.', 'Can I change rooms?'],
    excluded: ['a grammar lesson — no past tense, no passive, no "can", no "isn\'t", no comparative, no "I\'ll"', 'a problems list, a broken-object or room vocabulary, a refund / payment deck — one example per function; the transfer object (the key) is verified prior', '"It\'s on the house.", "Is there anything else?" and five short staff lines — archived: the staff\'s whole lines are the sentences', 'a sentence builder and a Flex Round — transfer is the one not-working swap and the final\'s new problems'],
    justification: 'One skill in two places — notice, explain, ask for a fix: each line is a whole-line card with its meaning, four production tools (This isn\'t what I ordered · I think there\'s a mistake · ___ isn\'t working · Can you fix it?), the staff\'s solutions as one "what did they do?" board per place, and a final with new, verified-prior problems. "No problem, thank you", "How can I help you?", "the bill", "room" and "key" are verified prior learning; ordering, the mistake, charging twice, the air conditioning, fixing and changing rooms are new and met on the cards.' }),
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
  33: A({ day: 33, decision: 'primed', globalWords: ['like', 'love', 'want to try', 'usually'], priorKnowledge: ['Hi / Salut / ¡Hola!', 'Yes / No', 'Great / Super / Genial', 'Nice / Sympa / Qué bien', 'Do you like (EN)', 'I like / J’aime / Me gusta', 'free today, the evening, the beach, tomorrow (words)'],
    primingWords: ['Yes! What do you do for fun?', 'I love surfing!', 'I like drawing.', 'I usually draw in the evening.', 'Yes, I like to listen to music too.', "No, I don't like running.", 'I want to try diving.'],
    excluded: ['a hobby vocabulary list — only the five hobbies of the conversation (no swimming, football, reading…)', 'like + -ing / want + infinitive / frequency-adverb grammar — every line is a whole chunk', '"Do you like diving?" — no card: built from the friend’s "Do you like ___?" and your own "diving" (transfer)', 'a Flex Round — the mission itself is the transfer'],
    justification: 'A preference system, not a word list: each line is a card with its meaning (love / like / don’t like / usually / want to try), and five sorting moments place the five hobbies in the My Free Time profile. "Hi", "Yes", "No", "Great", "Nice" and "I like" are verified prior learning; "Do you like diving?" is produced by transfer, never taught as a sentence.' }),
  34: A({ day: 34, decision: 'primed', globalWords: ['yesterday', 'last month'], priorKnowledge: ['Hi / ¡Hola! / Salut (ES, FR)', 'Nice / ¡Qué bien! / Sympa', 'Yes / Sí / Oui', 'Me? / ¿Yo? / Moi ?', 'Nothing / ¡Nada! / Rien !', 'the old town (Mission 11)', 'the market (EN, Mission 02)', 'great, good, tired (words)', 'the beach, the centre, the museum, chicken, a hotel — the transfer details (Missions 04–19)'],
    primingWords: ['I went to the old town.', 'I saw the market.', 'Yes, I ate fish.', 'Yes, it was great!', 'I stayed in a hostel.', 'It was good. And you? What did you do yesterday?'],
    excluded: ['a past-tense lesson — no "did", no went / saw / ate list, no was / were table, no conjugation, no grammar word', '"It was bad." — retired: how it was stays great / good, no extra adjective', 'a food, place or accommodation deck — only the conversation’s own details; every transfer detail is verified prior', 'a sentence builder and a Flex Round — transfer is the same sentence with another detail, and the final\'s other day'],
    justification: 'Telling yesterday, not a tense: each line is a whole-line card with its meaning, the friend\'s questions are matched to the part of the Yesterday Story they ask about (📍 / 👀 / 🍽️ / ⭐ / 🛏️), four production tools (I went to ___ · I saw ___ · I ate ___ · What did you do yesterday?) and a final day with new, verified-prior details. "Hi" (ES, FR), "Nice", "Yes", "Me?", "Nothing" and "the old town" are verified prior learning; "yesterday", "last month", "fish" and "hostel" are new and met on the cards.' }),
  35: A({ day: 35, decision: 'primed', globalWords: ['next', 'after that', 'tomorrow morning'], priorKnowledge: ['I’m going to ___ (Missions 12–13)', 'I want to ___ (Mission 16)', 'how long / two weeks / week (Mission 06)', 'Anything else? / ¿Algo más? / Autre chose ? (Mission 03)', 'What are you doing … / tomorrow morning (Mission 12)', 'I’m going home (Mission 13)', '¡Buen viaje! / Bon voyage ! (Mission 07)', 'the final’s trip — Argentina (Mission 20), the museum and the train (Mission 19), the beach (Missions 12, 16), the station (Mission 05)'],
    primingWords: ["I'm going to Vietnam.", "I'll be there for two weeks.", 'I want to visit Hanoi.', 'I want to travel by motorbike.', "After that I'm going to Thailand.", "Tomorrow morning I'm going to the airport.", 'And you? Where are you going next?'],
    excluded: ['a future-tense lesson — no "will" vs "going to", no tense name, no conjugation, no grammar word', 'a country list, a transport deck, an activity list, a calendar or a list of durations — only the conversation’s own plan; every final detail is verified prior', '"I want to try the food." and "I want to ride horses there." — retired: each turn is its one locked line', 'a sentence builder and a Flex Round — transfer is the reuse lines and the final’s other trip'],
    justification: 'Talking about the next trip, not a tense: each line is a whole-line card with its meaning, the friend\'s questions are matched to the part of the MY NEXT TRIP plan they ask about (📍 / ⏳ / 🎯 / ➡️ / 🌅), four production tools (I’m going to ___ · I’ll be there for ___ · I want to ___ · Where are you going next?) and a final trip with new, verified-prior details. "I’m going to", "I want to", "how long", "two weeks", "Anything else?", "tomorrow morning" and "I’m going home" are verified prior learning; "Vietnam", "Hanoi", "Thailand", "the airport", "the motorbike" and "I’ll be there" are new and met on the cards.' }),
  36: A({ day: 36, decision: 'no-priming-needed', globalWords: ['why', 'because', 'but', 'maybe'], priorKnowledge: ['too expensive', 'tired', 'I like it'], primingWords: [], excluded: ['abstract opinion vocabulary'],
    justification: 'The connectors are global Core concepts; each is met inside a full, reusable chunk.' }),
  37: A({ day: 37, decision: 'no-priming-needed', globalWords: ['help', 'phone', 'passport'], priorKnowledge: ['I have', 'where is', 'I want to'], primingWords: [], excluded: ['insurance / form vocabulary'],
    justification: 'Lost/stolen reuses have / where-is / want-to; the three new verbs arrive as whole sentences.' }),
};
