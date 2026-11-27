import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 21 — Future Travel & Plans: TALK ABOUT WHAT HAPPENS NEXT. SHORT, PRACTICAL, GAME-LIKE — defined
 * ONCE for English, French and Spanish. The conversation is LOCKED (`core/futurePlans.ts`); this is the short
 * journey around it. The learner does not study a future tense: they already know their next trip — the job is
 * to understand what a friend asks about it, say the right part, and ask back.
 *
 *   the briefing → ✈️ MY NEXT TRIP (the learner's own plan, shown whole) → "So, where are you going next?"
 *   (which part of your plan? 📍) → "How long will you be there?" → I'm going to ___ · I'll be there for ___
 *   (answer both) → "What do you want to do there?" → I want to ___ → "Anything else?" → the same tool, another
 *   plan → "And after that?" → after that + I'm going to ___ → "What are you doing tomorrow morning?" (🌅, not
 *   🎯) → tomorrow morning + I'm going to ___ → "Already! We'll miss you." → you ask back → the friend's own
 *   plan (🏠) → the conversation (once, supported) → no help (4) → the video → the final: ANOTHER TRIP, the
 *   same questions, a new plan (6) → ✈️ MY NEXT TRIP.
 *
 * Rules kept here:
 *   - four production tools: I'm going to ___ · I'll be there for ___ · I want to ___ · Where are you going
 *     next? (asked back ALONE — the conversation keeps "And you? Where are you going next?"). "After that …",
 *     "Tomorrow morning …" and "I want to travel by ___" are the same tools reused, never tools of their own;
 *   - verified prior is used, not re-taught (`learnedBefore(lang, 21)`): "I'm going to ___" (Missions 12–13),
 *     "I want to ___" (Mission 16), "how long" and "two weeks" (Mission 06), "Anything else?" (Mission 03),
 *     "tomorrow morning" (Mission 12), "I'm going home" (Mission 13);
 *   - no grammar: no tense, no "will", no "going to" rule, no table, no builder, no Flex Round;
 *   - ✈️ MY NEXT TRIP — the one game object: the learner's OWN plan, so it is shown from the start (that is
 *     not an information gap); a part is ticked ✓ once the learner has said it. The friend's questions are
 *     matched to WHICH PART of the plan they ask about — the function of the question, never its grammar.
 *     What the FRIEND says (going home, "we'll miss you", "have a great trip") is never shown before it is heard;
 *   - the final is ANOTHER TRIP: every detail changed, every one verified prior in every language.
 *
 * Coverage: `mission21Coverage.ts`, enforced by `mission21.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * Artwork: pending (docs/MISSION21_ASSET_MANIFEST.md — VISUAL PRODUCTION REQUIRED IN ASTRA PASS). Semantic
 * emoji stand in. No picture may carry a plan fact (the country, the length of stay, the order, the time):
 * those are data, drawn as UI on the board. The friend's home is only ever on the friend's own card.
 */
type M21Slot = 'chat' | 'destination' | 'hanoi' | 'motorbike' | 'airport' | 'friend-home';
export const M21_SLOTS: Record<M21Slot, { emoji: string; image?: string }> = {
  chat: { emoji: '💬' },
  destination: { emoji: '🧭' },
  hanoi: { emoji: '🏯' },
  motorbike: { emoji: '🏍️' },
  airport: { emoji: '🛫' },
  'friend-home': { emoji: '🏠' },
};
/** Result picture only — never a choice, never a card. */
export const M21_PROPS: Record<'next-trip', { emoji: string; image?: string }> = {
  'next-trip': { emoji: '✈️' },
};
const look21 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/* The locked conversation (EN · FR · ES · HE support), line by line — the friend's lines… */
export const N_WHERE: L4 = ['So, where are you going next?', 'Alors, tu vas où après ?', 'Bueno, ¿a dónde vas después?', 'אז לאן אתה נוסע אחרי זה?'];
export const N_HOW_LONG: L4 = ['Wow! How long will you be there?', 'Waouh ! Tu restes combien de temps ?', '¡Guau! ¿Cuánto tiempo vas a estar allí?', 'וואו! כמה זמן תהיה שם?'];
export const N_WHAT_DO: L4 = ['What do you want to do there?', 'Tu veux faire quoi là-bas ?', '¿Qué quieres hacer allí?', 'מה אתה רוצה לעשות שם?'];
export const N_ELSE: L4 = ['Nice. Anything else?', 'Sympa. Autre chose ?', 'Qué bien. ¿Algo más?', 'יפה. עוד משהו?'];
export const N_AFTER: L4 = ['Sounds amazing! Be careful. And after that?', 'Ça a l’air génial ! Fais attention. Et après ça ?', '¡Suena increíble! Ten cuidado. ¿Y después de eso?', 'נשמע מדהים! תיזהר. ואחרי זה?'];
export const N_TOMORROW: L4 = ['Great plan. And what are you doing tomorrow morning?', 'Super programme. Et tu fais quoi demain matin ?', 'Buen plan. ¿Y qué haces mañana por la mañana?', 'תוכנית מעולה. ומה אתה עושה מחר בבוקר?'];
export const N_MISS: L4 = ["Already! We'll miss you.", 'Déjà ! Tu vas nous manquer.', '¡Ya! Te vamos a echar de menos.', 'כבר! נתגעגע אליך.'];
export const N_END: L4 = ["Me? I'm going home. Have a great trip!", 'Moi ? Je rentre chez moi. Bon voyage !', '¿Yo? Me voy a casa. ¡Buen viaje!', 'אני? אני חוזר הביתה. נסיעה טובה!'];
/* …and the traveller's, as said. */
export const Y_GOING: L4 = ["I'm going to Vietnam.", 'Je vais au Vietnam.', 'Voy a Vietnam.', 'אני נוסע לווייטנאם.'];
export const Y_BE_THERE: L4 = ["I'll be there for two weeks.", 'Je vais rester deux semaines.', 'Voy a estar allí dos semanas.', 'אני אהיה שם שבועיים.'];
export const Y_VISIT: L4 = ['I want to visit Hanoi.', 'Je veux visiter Hanoï.', 'Quiero visitar Hanói.', 'אני רוצה לבקר בהאנוי.'];
export const Y_MOTO: L4 = ['I want to travel by motorbike.', 'Je veux voyager à moto.', 'Quiero viajar en moto.', 'אני רוצה לטייל באופנוע.'];
export const Y_AFTER: L4 = ["After that I'm going to Thailand.", 'Après ça, je vais en Thaïlande.', 'Después de eso voy a Tailandia.', 'אחרי זה אני נוסע לתאילנד.'];
export const Y_TOMORROW: L4 = ["Tomorrow morning I'm going to the airport.", 'Demain matin, je vais à l’aéroport.', 'Mañana por la mañana voy al aeropuerto.', 'מחר בבוקר אני נוסע לשדה התעופה.'];
export const Y_BACK: L4 = ['And you? Where are you going next?', 'Et toi ? Tu vas où après ?', '¿Y tú? ¿A dónde vas después?', 'ואתה? לאן אתה נוסע אחרי זה?'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── ✈️ MY NEXT TRIP — the learner's own plan, ticked as it is told ───────────────────────────────── */

/**
 * The six parts of a "what's next?" plan — semantic ids, the same in every language, in the order the
 * conversation tells them. The plan is the learner's own, so all of it is shown from the start; a part
 * is ticked ✓ only AFTER the learner has said it.
 */
export type PlanPart = 'next' | 'for' | 'want' | 'also' | 'after' | 'tomorrow';
export const PLAN_PARTS: readonly PlanPart[] = ['next', 'for', 'want', 'also', 'after', 'tomorrow'];
/** How much of the plan has been told: 0 (nothing yet) … 6 (all of it). */
export type PlanStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const M21_STAGES = ['nothing', 'next', 'for', 'want', 'also', 'after', 'tomorrow'] as const;
const HEAD = { trip: ['✈️ הטיול הבא שלי', '✈️ My next trip'], when: ['🗓️ מתי', '🗓️ When'], another: ['✈️ טיול אחר', '✈️ Another trip'] } as const satisfies Record<string, Copy>;
/** The row names (app language) — the kind of information, never a target-language answer. */
const ROW: Record<PlanPart, Copy> = { next: ['📍 הבא', '📍 Next'], for: ['⏳ לכמה זמן', '⏳ For'], want: ['🎯 רוצה', '🎯 Want to'], also: ['🏍️ וגם', '🏍️ Also'], after: ['➡️ אחרי זה', '➡️ After'], tomorrow: ['🌅 מחר בבוקר', '🌅 Tomorrow morning'] };
/** The canonical plan — the learner's own facts (app language: the meaning, as their memory holds it). */
const MY_PLAN: Record<PlanPart, Copy> = { next: ['וייטנאם', 'Vietnam'], for: ['שבועיים', 'Two weeks'], want: ['לבקר בהאנוי', 'Visit Hanoi'], also: ['לטייל באופנוע', 'Travel by motorbike'], after: ['תאילנד', 'Thailand'], tomorrow: ['שדה התעופה', 'Airport'] };

/** The plan as plain serialisable data — every part known from the start; `told` grows, never shrinks. */
export const nextTripState = (n: PlanStage) => ({
  phase: M21_STAGES[n],
  plan: { next: 'vietnam', for: 'two-weeks', want: 'visit-hanoi', also: 'travel-by-motorbike', after: 'thailand', tomorrow: 'airport' } as const,
  told: Object.fromEntries(PLAN_PARTS.map((p, i) => [p, i < n])) as Record<PlanPart, boolean>,
});

/** A plan as the two-column board the screen draws: the trip (where · how long · what) ‖ when (after · tomorrow). */
const planBoard = (head: Copy, value: Record<PlanPart, Copy>, told: (p: PlanPart) => boolean, row: Record<PlanPart, Copy> = ROW): Copy => {
  const side = (i: 0 | 1): string => {
    const cell = (p: PlanPart): string => `${row[p][i]} → ${value[p][i]}${told(p) ? ' ✓' : ''}`;
    return `${head[i]}: ${(['next', 'for', 'want', 'also'] as const).map(cell).join(' / ')} ‖ ${HEAD.when[i]}: ${(['after', 'tomorrow'] as const).map(cell).join(' / ')}`;
  };
  return [side(0), side(1)];
};
/** MY NEXT TRIP after `n` parts have been told (`myNextTrip(0)`: the whole plan, nothing ticked yet). */
export const myNextTrip = (n: PlanStage): Copy => planBoard(HEAD.trip, MY_PLAN, (p) => PLAN_PARTS.indexOf(p) < n);

/**
 * ANOTHER TRIP — the final's plan: the same six parts, every detail changed, every one verified prior in
 * every language (`learnedBefore(lang, 21)`): Argentina (Mission 20), a week (Mission 06's "week"), the museum
 * (Mission 19), trying diving (Mission 16's own "I want to try diving" — the same tool, another plan), the beach
 * (Missions 12 and 16), the station (Mission 05). (Not the train: English met it only as "The train's right here",
 * so "train" is not a verified prior WORD in English — the final keeps one plan for every language instead.)
 * The learner's own plan — shown whole; their job is to SAY it.
 */
const ANOTHER_PLAN: Record<PlanPart, Copy> = { next: ['🌎 ארגנטינה', '🌎 Argentina'], for: ['שבוע', 'A week'], want: ['🏛️ לבקר במוזיאון', '🏛️ Visit the museum'], also: ['לנסות צלילה', 'Try diving'], after: ['🏖️ הים', '🏖️ The beach'], tomorrow: ['🚉 התחנה', '🚉 The station'] };
export const anotherTrip: Copy = planBoard(HEAD.another, ANOTHER_PLAN, () => false, { ...ROW, also: ['🤿 וגם', '🤿 Also'] });

/** The parts of a board label, joined: the screen draws the plan, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const board = (n: PlanStage, prompt: Copy): Copy => [`${myNextTrip(n)[0]}${BOARD_SEP}${prompt[0]}`, `${myNextTrip(n)[1]}${BOARD_SEP}${prompt[1]}`];

/** The ending — your plan, told; another trip, told; and the friend's own plan. Never a score. */
export const MY_NEXT_TRIP: Copy = [
  `✈️ הטיול הבא שלי${BOARD_SEP}${myNextTrip(6)[0]}${BOARD_SEP}סיפרת את התוכנית — וגם טיול אחר — ושאלת בחזרה. 🏠 והחבר? חוזר הביתה.`,
  `✈️ MY NEXT TRIP${BOARD_SEP}${myNextTrip(6)[1]}${BOARD_SEP}You told your plan — and another trip — and asked back. 🏠 Your friend? Going home.`,
];

/* ── The tiles — semantic (the id is the meaning), captioned in the app language ────────────────── */

/** WHICH PART OF YOUR PLAN? — what a question asks about. "Also" is not a tile: it is "want to" again. */
export const PLAN_TILES: MatchTile[] = [
  { id: 'next', emoji: '📍', caption: { he: 'לאן אתה נוסע', en: 'Where you are going' } },
  { id: 'for', emoji: '⏳', caption: { he: 'לכמה זמן', en: 'How long' } },
  { id: 'want', emoji: '🎯', caption: { he: 'מה אתה רוצה לעשות', en: 'What you want to do' } },
  { id: 'after', emoji: '➡️', caption: { he: 'מה אחרי זה', en: 'What comes after' } },
  { id: 'tomorrow', emoji: '🌅', caption: { he: 'מחר בבוקר', en: 'Tomorrow morning' } },
];
/** And your friend's plan? — only places this conversation already knows. */
export const FRIEND_TILES: MatchTile[] = [
  { id: 'home', emoji: '🏠', caption: { he: 'חוזר הביתה', en: 'Going home' } },
  { id: 'thailand', emoji: '🏝️', caption: { he: 'נוסע לתאילנד', en: 'Going to Thailand' } },
  { id: 'airport', emoji: '🛫', caption: { he: 'נוסע לשדה התעופה', en: 'Going to the airport' } },
];

/* Learner sentence ids — the five reused by later missions (24, 30) keep their id and wording. */
const GOING = 'phrase.future.going-to-vietnam';
const BE_THERE = 'phrase.future.ill-be-there';
const VISIT = 'phrase.future.want-to-visit';
const MOTO = 'phrase.future.by-motorbike';
const AFTER = 'phrase.future.after-that';
const TOMORROW = 'phrase.future.tomorrow-morning';
const BACK = 'phrase.future.where-next';
/** What each learner sentence is said as in the conversation — the whole locked line. */
export const SAID: Record<string, L4> = { [GOING]: Y_GOING, [BE_THERE]: Y_BE_THERE, [VISIT]: Y_VISIT, [MOTO]: Y_MOTO, [AFTER]: Y_AFTER, [TOMORROW]: Y_TOMORROW, [BACK]: Y_BACK };
/** The four production tools — the No Help run is exactly these. */
export const TOOLS = [GOING, BE_THERE, VISIT, BACK] as const;

/** The final's trip, said — the same sentences with the new details (each answers the same question). */
export const FINAL_SAID: Record<typeof GOING | typeof BE_THERE | typeof VISIT | typeof MOTO | typeof AFTER | typeof TOMORROW, L3> = {
  [GOING]: ["I'm going to Argentina.", 'Je vais en Argentine.', 'Voy a Argentina.'],
  [BE_THERE]: ["I'll be there for a week.", 'Je vais rester une semaine.', 'Voy a estar allí una semana.'],
  [VISIT]: ['I want to visit the museum.', 'Je veux visiter le musée.', 'Quiero visitar el museo.'],
  [MOTO]: ['I want to try diving.', 'Je veux essayer la plongée.', 'Quiero probar el buceo.'],
  [AFTER]: ["After that I'm going to the beach.", 'Après ça, je vais à la plage.', 'Después de eso voy a la playa.'],
  [TOMORROW]: ["Tomorrow morning I'm going to the station.", 'Demain matin, je vais à la gare.', 'Mañana por la mañana voy a la estación.'],
};

export function m21Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M21Slot) => ({ line: true, key, t: l3(line), meaning, ...look21(M21_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  // Every option is one of the learner's own locked lines, said whole — or, in the final, the same line with the final's details.
  const say = (id: string, ok: boolean) => [id, ok, l3(SAID[id]!)] as const;
  const fin = (id: keyof typeof FINAL_SAID, ok: boolean) => [id, ok, FINAL_SAID[id]] as const;
  // The fourth tool, retrieved ALONE: "Where are you going next?" — the reusable question (no text override:
  // the button says the sentence itself). Only the conversation keeps "And you? …".
  const ask = (ok: boolean) => [BACK, ok] as const;
  // WHICH PART OF YOUR PLAN? — a question is played; the learner taps the part it asks about. A set of
  // meanings, not a scale: shuffled, in the page's direction.
  const which = (n: PlanStage, audio: L4, part: PlanPart): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true,
    label: board(n, ['🧩 על איזה חלק בתוכנית החבר שואל? שמע — והקש.', '🧩 Which part of your plan is your friend asking about? Listen — and tap.']),
    tiles: PLAN_TILES, rounds: [{ audio, correct: part }],
  });
  return [
    // WHERE NEXT? — the destination (📍). "I'm going to ___" is already yours (Missions 12–13): one new place.
    cards(['לאן עכשיו?', 'Where next?'], board(0, ['זו התוכנית שלך. החבר שואל עליה — הקש כדי לשמוע.', 'This is your plan. Your friend asks about it — tap to hear.']), [
      card('future.line.where', N_WHERE, ['אז לאן אתה נוסע אחרי זה? (📍 שואלים על היעד הבא שלך)', 'So, where are you going next? (📍 a question about your next destination)'], 'chat'),
      card('future.line.going', Y_GOING, ['אני נוסע לווייטנאם. (אני נוסע ל___ — אתה כבר מכיר: „מחר בבוקר אני הולך לים”)', 'I’m going to Vietnam. (I’m going to ___ — you know it already: “Tomorrow morning I’m going to the beach”)'], 'destination'),
    ]),
    which(0, N_WHERE, 'next'),
    // HOW LONG? — the duration (⏳). "How long" and "two weeks" are Mission 06's: one new chunk, "I'll be there for".
    cards(['לכמה זמן?', 'How long?'], board(0, ['ועכשיו — כמה זמן. הקש כדי לשמוע.', 'Now — how long. Tap to hear.']), [
      card('future.line.how-long', N_HOW_LONG, ['וואו! כמה זמן תהיה שם? (⏳ שואלים לכמה זמן)', 'Wow! How long will you be there? (⏳ a question about how long)'], 'chat'),
      card('future.line.be-there', Y_BE_THERE, ['אני אהיה שם שבועיים. (אהיה שם ___ — לכמה זמן)', 'I’ll be there for two weeks. (I’ll be there for ___ — how long you stay)'], 'destination'),
    ]),
    k.practice({ kind: 'quickReply', label: board(0, ['החבר שואל — מה אתה עונה?', 'Your friend asks — what do you answer?']), rounds: [
      { prompt: 'reply.future.where-next', options: [say(GOING, true), say(BE_THERE, false)] },
      { prompt: 'reply.future.wow-how-long', options: [say(BE_THERE, true), say(GOING, false)] },
    ] }),
    // WHAT DO YOU WANT TO DO THERE? — the activity (🎯). "I want to ___" is Mission 16's: a known tool, a new trip.
    cards(['מה תעשה שם?', 'What do you want to do?'], board(2, ['ומה אתה רוצה לעשות שם? הקש כדי לשמוע.', 'And what do you want to do there? Tap to hear.']), [
      card('future.line.what-do', N_WHAT_DO, ['מה אתה רוצה לעשות שם? (🎯 שואלים מה אתה רוצה לעשות)', 'What do you want to do there? (🎯 a question about what you want to do)'], 'chat'),
      card('future.line.visit', Y_VISIT, ['אני רוצה לבקר בהאנוי. (אני רוצה ___ — אתה כבר מכיר: „אני רוצה לנסות צלילה”)', 'I want to visit Hanoi. (I want to ___ — you know it already: “I want to try diving”)'], 'hanoi'),
    ]),
    k.practice({ kind: 'quickReply', label: board(2, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.future.what-do-there', options: [say(VISIT, true), say(BE_THERE, false), say(GOING, false)] },
    ] }),
    // ANYTHING ELSE? — the SAME tool, another plan (Mission 03's "Anything else?", in a new place).
    cards(['עוד משהו?', 'Anything else?'], board(3, ['אותו „אני רוצה ___” — תוכנית אחרת. הקש כדי לשמוע.', 'The same “I want to ___” — another plan. Tap to hear.']), [
      card('future.line.else', N_ELSE, ['יפה. עוד משהו? (עוד משהו שאתה רוצה לעשות — לא אותו דבר)', 'Nice. Anything else? (something else you want to do — not the same thing)'], 'chat'),
      card('future.line.motorbike', Y_MOTO, ['אני רוצה לטייל באופנוע. (אותו „אני רוצה ___” — תוכנית אחרת)', 'I want to travel by motorbike. (the same “I want to ___” — another plan)'], 'motorbike'),
    ]),
    k.practice({ kind: 'quickReply', label: board(3, ['עוד משהו — לא מה שכבר אמרת.', 'Something else — not what you already said.']), rounds: [
      { prompt: 'reply.future.anything-else', options: [say(MOTO, true), say(VISIT, false), say(BE_THERE, false)] },
    ] }),
    // AND AFTER THAT? — the next step of the trip (➡️): "after that" + the destination tool again.
    cards(['ואחרי זה?', 'And after that?'], board(4, ['החבר שואל מה אחרי זה. הקש כדי לשמוע.', 'Your friend asks what comes after. Tap to hear.']), [
      card('future.line.after', N_AFTER, ['נשמע מדהים! תיזהר. ואחרי זה? (➡️ שואלים מה אחרי זה)', 'Sounds amazing! Be careful. And after that? (➡️ a question about what comes after)'], 'chat'),
      card('future.line.after-that', Y_AFTER, ['אחרי זה אני נוסע לתאילנד. (אחרי זה + אני נוסע ל___)', 'After that I’m going to Thailand. (after that + I’m going to ___)'], 'destination'),
    ]),
    k.practice({ kind: 'quickReply', label: board(4, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.future.after-that-q', options: [say(AFTER, true), say(GOING, false), say(MOTO, false)] },
    ] }),
    // WHAT ARE YOU DOING TOMORROW MORNING? — your plan for tomorrow morning (🌅) — not what you want to do there (🎯).
    cards(['מחר בבוקר', 'Tomorrow morning'], board(5, ['ועכשיו — מחר בבוקר. הקש כדי לשמוע.', 'Now — tomorrow morning. Tap to hear.']), [
      card('future.line.tomorrow', N_TOMORROW, ['תוכנית מעולה. ומה אתה עושה מחר בבוקר? (🌅 שואלים מה התוכנית שלך מחר בבוקר)', 'Great plan. And what are you doing tomorrow morning? (🌅 a question about your plan tomorrow morning)'], 'chat'),
      card('future.line.tomorrow-airport', Y_TOMORROW, ['מחר בבוקר אני נוסע לשדה התעופה. (מחר בבוקר + אני נוסע ל___)', 'Tomorrow morning I’m going to the airport. (tomorrow morning + I’m going to ___)'], 'airport'),
    ]),
    which(5, N_TOMORROW, 'tomorrow'),
    k.practice({ kind: 'quickReply', label: board(5, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.future.tomorrow-plan-q', options: [say(TOMORROW, true), say(AFTER, false), say(VISIT, false)] },
    ] }),
    // ALREADY! — you have told it all: now you ask about THEIR plan.
    cards(['ואתה?', 'And you?'], board(6, ['סיפרת את כל התוכנית. עכשיו — לשאול בחזרה. הקש כדי לשמוע.', 'You have told your whole plan. Now — ask back. Tap to hear.']), [
      card('future.line.miss', N_MISS, ['כבר! נתגעגע אליך. (החבר עצוב שאתה נוסע — עכשיו תורך)', 'Already! We’ll miss you. (your friend is sad you are leaving — now it is your turn)'], 'chat'),
      card('future.line.back', Y_BACK, ['ואתה? לאן אתה נוסע אחרי זה? (סיפרת את התוכנית שלך — עכשיו שואלים על שלו: „לאן אתה נוסע אחרי זה?” — שאלה לכל אחד)', 'And you? Where are you going next? (you told your plan — now ask about theirs: “Where are you going next?” works with anyone)'], 'chat'),
    ]),
    k.practice({ kind: 'quickReply', label: board(6, ['סיפרת את התוכנית שלך — עכשיו תורך: שאל על שלו.', 'You told your plan — now your turn: ask about theirs.']), rounds: [
      { prompt: 'reply.future.miss-you', options: [ask(true), say(VISIT, false), say(TOMORROW, false)] },
    ] }),
    // THE FRIEND'S PLAN — one comprehension moment, no deck.
    cards(['והחבר?', 'And your friend?'], board(6, ['עכשיו החבר מספר על התוכנית שלו. הקש כדי לשמוע.', 'Now your friend tells their plan. Tap to hear.']), [
      card('future.line.end', N_END, ['אני? אני חוזר הביתה. נסיעה טובה! (🏠 החבר חוזר הביתה — ומאחל לך נסיעה טובה)', 'Me? I’m going home. Have a great trip! (🏠 your friend is going home — and wishes you a good trip)'], 'friend-home'),
    ]),
    k.practice({ kind: 'visualMatch', quiet: true, label: board(6, ['ומה התוכנית של החבר? שמע — והקש.', 'And your friend’s plan? Listen — and tap.']), tiles: FRIEND_TILES, rounds: [{ audio: N_END, correct: 'home' }] }),
    k.receipt(board(6, ['התוכנית שלך — ושאלת בחזרה.', 'Your plan — and you asked back.'])),
    // THE CONVERSATION — once, supported (translations on).
    k.dialogue('where-next'),
    k.receipt(['כל השיחה — לאן, לכמה זמן, מה תעשה, מה אחר כך — ושאלת בחזרה.', 'The whole conversation — where, how long, what you will do, what comes after — and you asked back.']),
    // NO HELP — the four tools at a friend's pace: no meaning, no cards, no plan.
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { prompt: 'reply.future.where-next', options: [say(GOING, true), say(BE_THERE, false), say(MOTO, false)] },
      { prompt: 'reply.future.wow-how-long', options: [say(BE_THERE, true), say(GOING, false), say(TOMORROW, false)] },
      { prompt: 'reply.future.what-do-there', options: [say(VISIT, true), say(BE_THERE, false), say(AFTER, false)] },
      { prompt: 'reply.future.miss-you', options: [ask(true), say(VISIT, false), say(BE_THERE, false)] },
    ] }),
    k.receipt(['בלי עזרה — לאן, לכמה זמן, מה אתה רוצה לעשות, ושאלת בחזרה.', 'No help — where, how long, what you want to do, and you asked back.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: ANOTHER TRIP — the same questions, a new plan. Not the conversation again.
    k.practice({ kind: 'quickReply', label: [`${anotherTrip[0]}${BOARD_SEP}🎯 טיול אחר — אותן שאלות. ספר לחבר.`, `${anotherTrip[1]}${BOARD_SEP}🎯 Another trip — the same questions. Tell your friend.`], rounds: [
      { prompt: 'reply.future.where-next', options: [fin(GOING, true), fin(BE_THERE, false), fin(VISIT, false)] },
      { prompt: 'reply.future.wow-how-long', options: [fin(BE_THERE, true), fin(GOING, false), fin(TOMORROW, false)] },
      { prompt: 'reply.future.what-do-there', options: [fin(VISIT, true), fin(BE_THERE, false), fin(GOING, false)] },
      { prompt: 'reply.future.anything-else', options: [fin(MOTO, true), fin(VISIT, false), fin(BE_THERE, false)] },
      { prompt: 'reply.future.after-that-q', options: [fin(AFTER, true), fin(GOING, false), fin(MOTO, false)] },
      { prompt: 'reply.future.tomorrow-plan-q', options: [fin(TOMORROW, true), fin(AFTER, false), fin(VISIT, false)] },
    ] }),
    k.receipt(MY_NEXT_TRIP),
    { kind: 'summary' },
  ];
}
