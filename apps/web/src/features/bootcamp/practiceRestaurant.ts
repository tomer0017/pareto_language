import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 14 — Restaurant Meal: "I could actually get through a normal restaurant meal abroad."
 * Defined ONCE for English, French and Spanish. The conversation is LOCKED (`day4.ts`, `fr/day4.ts`,
 * `es/day4.ts`); this is the SHORT journey around it — no restaurant vocabulary list, no grammar:
 *
 *   the briefing (two of you, no reservation, what you want) → the door: "a table for two" → the
 *   table: "Are you ready to order?" + the one builder (I'll have → the dish → without …) → the drink
 *   → "Anything else?" → "That's all, thanks." (Mission 03's own sentence: no card) → "Coming right
 *   up!" → ⏳ later… "Is everything okay?" → "delicious + the bill" → WAITER SIGNALS (what does the
 *   waiter want now?) → a one-round FLEX (transfer only) → the supported meal (Restaurant Ticket) →
 *   the conversation → no help → the video → the final → 🍽️ MEAL COMPLETE.
 *
 * Rules kept here:
 *   - the learner says only the five locked lines; the waiter's lines are comprehension;
 *   - the Restaurant Ticket starts "?" and fills ONLY when the learner has said it: table → 2, main →
 *     chicken + change → no onions, drink → water, order → closed, bill → requested;
 *   - "Later…" is a scene cue, never a line: it is app-language copy on the screen and `mealPhase` in
 *     the state — never spoken, never a sentence, never counted as language;
 *   - what Missions 01–13 really taught is used, not taught again ("That's all", "Anything else?",
 *     please / thanks, Good evening, Perfect, Of course, reservation, two, four);
 *   - the Flex Round uses only words learned before it; it is `transferOnly`, so it never counts as
 *     teaching, coverage or a sentence of the course.
 *
 * Coverage: `mission14Coverage.ts`, enforced by `mission14.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): one restaurant, one waiter, one table, one
 * evening. Each slot is an emoji until its artwork exists (`image` set): docs/MISSION14_ASSET_MANIFEST.md.
 * Pictures are on teaching cards only — never an answer.
 */
type M14Slot =
  | 'restaurant-entrance' | 'table-for-two' | 'follow-to-table' | 'ready-to-order' | 'order-chicken'
  | 'drink-order' | 'coming-right-up' | 'meal-check' | 'delicious-bill' | 'goodbye';
export const M14_SLOTS: Record<M14Slot, { emoji: string; image?: string }> = {
  'restaurant-entrance': { emoji: '🚪' },
  'table-for-two': { emoji: '👥' },
  'follow-to-table': { emoji: '📋' },
  'ready-to-order': { emoji: '📝' },
  'order-chicken': { emoji: '🍗' },
  'drink-order': { emoji: '💧' },
  'coming-right-up': { emoji: '🛎️' },
  'meal-check': { emoji: '👍' },
  'delicious-bill': { emoji: '🧾' },
  'goodbye': { emoji: '👋' },
};
/** Result picture only — never a choice, never a card. */
export const M14_PROPS: Record<'meal-complete', { emoji: string; image?: string }> = {
  'meal-complete': { emoji: '🍽️' },
};
const look14 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/* The locked conversation (EN · FR · ES · HE), line by line — the waiter's lines… */
export const W_RES: L4 = ['Good evening! Do you have a reservation?', 'Bonsoir ! Vous avez une réservation ?', '¡Buenas noches! ¿Tiene reserva?', 'ערב טוב! יש לכם הזמנה?'];
export const W_FOLLOW: L4 = ['Perfect, follow me. Here are your menus.', 'Parfait, suivez-moi. Voici vos menus.', 'Perfecto, sígame. Aquí tienen las cartas.', 'מצוין, בואו אחריי. הנה התפריטים.'];
export const W_READY: L4 = ['Are you ready to order?', 'Vous êtes prêts à commander ?', '¿Están listos para pedir?', 'מוכנים להזמין?'];
export const W_DRINK: L4 = ['Of course. Anything to drink?', 'Bien sûr. Quelque chose à boire ?', 'Claro. ¿Algo de beber?', 'כמובן. משהו לשתות?'];
export const W_ELSE: L4 = ['Anything else?', 'Autre chose ?', '¿Algo más?', 'עוד משהו?'];
export const W_COMING: L4 = ['Coming right up!', 'Ça arrive tout de suite !', '¡Enseguida se lo traigo!', 'מגיע עוד רגע!'];
export const W_OKAY: L4 = ['Is everything okay?', 'Tout va bien ?', '¿Va todo bien?', 'הכל בסדר?'];
export const W_BYE: L4 = ['So glad you enjoyed it. Here you are — have a lovely evening!', 'Ravi que ça vous ait plu. Voici — passez une bonne soirée !', 'Me alegro de que les gustara. Aquí tienen — ¡que pasen buena noche!', 'שמח שנהניתם. בבקשה — ערב נעים!'];
/* …and the traveller's, as said. */
export const Y_TABLE: L4 = ['No — a table for two, please.', 'Non — une table pour deux, s’il vous plaît.', 'No — una mesa para dos, por favor.', 'לא — שולחן לשניים, בבקשה.'];
export const Y_ORDER: L4 = ["I'll have the chicken, without onions, please.", 'Je vais prendre le poulet, sans oignons, s’il vous plaît.', 'Voy a tomar el pollo, sin cebolla, por favor.', 'אני אקח את העוף, בלי בצל, בבקשה.'];
export const Y_WATER: L4 = ['A bottle of water, please.', 'Une bouteille d’eau, s’il vous plaît.', 'Una botella de agua, por favor.', 'בקבוק מים, בבקשה.'];
export const Y_ALL: L4 = ["That's all, thanks.", 'C’est tout, merci.', 'Eso es todo, gracias.', 'זה הכל, תודה.'];
export const Y_BILL: L4 = ['Yes, that was delicious! The bill, please.', 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', '¡Sí, estaba delicioso! La cuenta, por favor.', 'כן, היה טעים מאוד! החשבון, בבקשה.'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── The Restaurant Ticket — "?" until YOU have said it ──────────────────────────────────────────── */

/**
 * How far the meal has got, in order:
 *   0 nothing · 1 table → 2 · 2 main → chicken, change → no onions · 3 drink → water · 4 order closed
 *   · 5 LATER (the scene cue: the meal is over — no new fact) · 6 bill requested.
 * Every fact is the LEARNER's own line; 5 is a scene transition only.
 */
export const M14_REVEALS = ['nothing', 'table', 'main', 'drink', 'closed', 'later', 'bill'] as const;
export type M14Reveal = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const MEAL_PHASES = ['arrival', 'ordering', 'ordering', 'ordering', 'eating', 'bill', 'complete'] as const;
const TICKET_COPY = {
  order: ['🍽️ הזמנה לשולחן', '🍽️ Table order'], drinkBill: ['🥤 שתייה וחשבון', '🥤 Drink & bill'],
  table: ['שולחן: ?', 'Table: ?'], main: ['מנה: ?', 'Main: ?'], change: ['שינוי: ?', 'Change: ?'], drink: ['שתייה: ?', 'Drink: ?'],
  open: ['הזמנה: פתוחה', 'Order: Open'], noBill: ['חשבון: —', 'Bill: —'],
  table2: ['שולחן: 2', 'Table: 2'], chicken: ['מנה: עוף', 'Main: Chicken'], noOnions: ['שינוי: בלי בצל', 'Change: No onions'], water: ['שתייה: מים', 'Drink: Water'],
  closed: ['הזמנה: נסגרה ✅', 'Order: Closed ✅'], complete: ['הזמנה: הושלמה ✅', 'Order: Complete ✅'], billRequested: ['חשבון: התבקש ✅', 'Bill: Requested ✅'],
} as const satisfies Record<string, Copy>;
/** The Restaurant Ticket at reveal `n`, as text the screen renders as two columns (`restaurantTicket(0)` is all unknown). */
export const restaurantTicket = (n: M14Reveal, done = false): Copy => {
  const row = (i: 0 | 1): string => {
    const c = TICKET_COPY;
    const left = [n >= 1 ? c.table2[i] : c.table[i], n >= 2 ? c.chicken[i] : c.main[i], n >= 2 ? c.noOnions[i] : c.change[i]];
    const right = [n >= 3 ? c.water[i] : c.drink[i], done ? c.complete[i] : n >= 4 ? c.closed[i] : c.open[i], n >= 6 ? c.billRequested[i] : c.noBill[i]];
    return `${c.order[i]}: ${left.join(' / ')} ‖ ${c.drinkBill[i]}: ${right.join(' / ')}`;
  };
  return [row(0), row(1)];
};
/** The scene cue, as the screen shows it: app-language copy only — never a line, never spoken. */
export const LATER_NOTE: Copy = ['⏳ מאוחר יותר… הארוחה נגמרה.', '⏳ Later… the meal is over.'];
/** The parts of a board label, joined: the screen draws the ticket, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const ticket = (n: M14Reveal, prompt?: Copy): Copy => {
  const join = (i: 0 | 1): string => [...(n === 5 ? [LATER_NOTE[i]] : []), restaurantTicket(n)[i], ...(prompt ? [prompt[i]] : [])].join(BOARD_SEP);
  return [join(0), join(1)];
};

/** The meal, as plain serialisable data — every value null (or false) until the learner has said it. */
export const restaurantTicketState = (n: M14Reveal) => ({
  stage: M14_REVEALS[n],
  mealPhase: MEAL_PHASES[n],
  tableSize: n >= 1 ? 2 : null,
  mainDish: n >= 2 ? 'chicken' : null,
  removedIngredient: n >= 2 ? 'onions' : null,
  drink: n >= 3 ? 'water' : null,
  orderClosed: n >= 4,
  billRequested: n >= 6,
});

/** The ending — the outcome is the meal, never a score. */
export const MEAL_COMPLETE: Copy = [
  `🍽️ הארוחה הושלמה${BOARD_SEP}${restaurantTicket(6, true)[0]}`,
  `🍽️ MEAL COMPLETE${BOARD_SEP}${restaurantTicket(6, true)[1]}`,
];

/**
 * WAITER SIGNALS — what does the waiter want NOW? Fast intent recognition, never translation: the
 * tiles are what the waiter wants (semantic ids, app-language captions), the rounds are his own lines
 * at natural pace, out of meal order.
 */
export const WAITER_SIGNALS: Record<'table' | 'food' | 'drink' | 'more' | 'check', MatchTile> = {
  table: { id: 'table', emoji: '🪑', caption: { he: 'שולחן / הזמנה מראש', en: 'Table / booking' } },
  food: { id: 'food', emoji: '🍽️', caption: { he: 'להזמין אוכל', en: 'Your food order' } },
  drink: { id: 'drink', emoji: '🥤', caption: { he: 'להזמין שתייה', en: 'Your drink' } },
  more: { id: 'more', emoji: '➕', caption: { he: 'עוד משהו? / לסיים', en: 'More? / finish' } },
  check: { id: 'check', emoji: '👍', caption: { he: 'בודק שהארוחה בסדר', en: 'Meal check' } },
};
export const SIGNAL_ROUNDS: readonly (readonly [L4, keyof typeof WAITER_SIGNALS])[] = [
  [W_DRINK, 'drink'], [W_RES, 'table'], [W_OKAY, 'check'], [W_READY, 'food'], [W_ELSE, 'more'],
];

/** How many people a table is for — semantic tiles (the id is the number), captioned in the app language. */
export const PARTY_SIZES: Record<'two' | 'four', MatchTile> = {
  two: { id: 'two', emoji: '👥', caption: { he: '2 אנשים', en: '2 people' } },
  four: { id: 'four', emoji: '👨‍👩‍👧‍👦', caption: { he: '4 אנשים', en: '4 people' } },
};

/**
 * THE FLEX ROUND — transfer only, ONE interaction. Canonical: "a table for two". Here another group
 * at the door asks for four: "table for X", not a memorised "for two". "four" / "cuatro" / "quatre" is
 * verified prior learning in every language ("three" is not, so it is not used). Marked
 * `transferOnly`; never an item, never a dialogue line.
 */
export const M14_FLEX = {
  transferOnly: true,
  partySize: { audio: ['No — a table for four, please.', 'Non — une table pour quatre, s’il vous plaît.', 'No — una mesa para cuatro, por favor.', 'לא — שולחן לארבעה, בבקשה.'] as L4, correct: 'four' as const },
} as const;

export function m14Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M14Slot) => ({ line: true, key, t: l3(line), meaning, ...look14(M14_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  const ANSWER: Copy = ['מה אתה עונה?', 'What do you answer?'];
  const steps: BootcampStep[] = [
    // THE BRIEFING — only what the traveller knows: two of you, no booking, what you want.
    k.talk('🍽️', ['משימה 14: ארוחה במסעדה', 'Mission 14: Restaurant Meal'], [
      ['אתם שניים ואין לכם הזמנה. אתה רוצה עוף בלי בצל ומים. תעברו את הארוחה עד החשבון.', 'There are two of you and no reservation. You want chicken without onions, and water. Get through the meal, all the way to the bill.'],
    ], ['להיכנס למסעדה', 'Walk in']),
    // THE DOOR — the waiter checks for a booking; you ask for a table for two.
    cards(['בכניסה', 'At the door'], ticket(0, ['המלצר פוגש אתכם בכניסה — ומה אתה עונה. הקש כדי לשמוע.', 'The waiter meets you at the door — and what you answer. Tap to hear.']), [
      card('rest.line.reservation', W_RES, ['ערב טוב! יש לכם הזמנה? (המלצר בודק: הזמנתם שולחן מראש?)', 'Good evening! Do you have a reservation? (the waiter checks: did you book a table?)'], 'restaurant-entrance'),
      card('rest.line.table-two', Y_TABLE, ['לא — שולחן לשניים, בבקשה. (אין הזמנה + כמה אתם)', 'No — a table for two, please. (no booking + how many of you)'], 'table-for-two'),
    ]),
    // Only what is known by now can be a wrong answer: Mission 03's "That's all, thanks.".
    k.practice({ kind: 'quickReply', label: ticket(0, ANSWER), rounds: [
      { prompt: 'reply.rest.reservation', options: [['phrase.rest.table-two', true, l3(Y_TABLE)], ['phrase.coffee.thats-all', false]] },
    ] }),
    // THE TABLE — he seats you, then the signal: he wants your food order now.
    cards(['בשולחן', 'At the table'], ticket(1, ['המלצר מושיב אתכם — ואז שואל. הקש כדי לשמוע.', 'The waiter seats you — then asks. Tap to hear.']), [
      card('rest.line.follow', W_FOLLOW, ['מצוין, בואו אחריי. הנה התפריטים. (הוא מוביל אתכם לשולחן)', 'Perfect, follow me. Here are your menus. (he takes you to your table)'], 'follow-to-table'),
      card('rest.line.ready', W_READY, ['מוכנים להזמין? (המלצר רוצה עכשיו את הזמנת האוכל)', 'Are you ready to order? (the waiter wants your food order now)'], 'ready-to-order'),
      card('rest.line.order', Y_ORDER, ['אני אקח את העוף, בלי בצל, בבקשה. (מה אתה לוקח + בלי = להוריד מהמנה)', "I'll have the chicken, without onions, please. (what you'll have + without = take it out of the dish)"], 'order-chicken'),
    ]),
    // THE ONE BUILDER — order it: what you'll have → the dish → what to take out.
    k.practice({
      kind: 'sentenceBuilder', label: ticket(1, ['הזמן: מה אתה לוקח ← המנה ← מה להוריד ממנה', 'Order: what you’ll have → the dish → what to take out']),
      rounds: [{ itemId: 'phrase.rest.chicken-no-onions', chunks: [["I'll have", 'the chicken,', 'without onions, please.'], ['Je vais prendre', 'le poulet,', 'sans oignons, s’il vous plaît.'], ['Voy a tomar', 'el pollo,', 'sin cebolla, por favor.']] }],
    }),
    // THE DRINK — the waiter asks for your drink.
    cards(['שתייה', 'A drink'], ticket(2, ['אחרי האוכל — השתייה. הקש כדי לשמוע.', 'After the food — the drink. Tap to hear.']), [
      card('rest.line.drink', W_DRINK, ['כמובן. משהו לשתות? (המלצר שואל מה תשתה)', 'Of course. Anything to drink? (the waiter asks for your drink)'], 'drink-order'),
      card('rest.line.water', Y_WATER, ['בקבוק מים, בבקשה.', 'A bottle of water, please.'], 'drink-order'),
    ]),
    k.practice({ kind: 'quickReply', label: ticket(2, ANSWER), rounds: [
      { prompt: 'reply.rest.to-drink', options: [['phrase.rest.water', true], ['phrase.coffee.thats-all', false], ['phrase.rest.table-two', false, l3(Y_TABLE)]] },
    ] }),
    // ANYTHING ELSE? — Mission 03 taught both lines: no card, just use them. The order closes.
    k.practice({ kind: 'quickReply', label: ticket(3, ['המלצר שואל אם צריך עוד משהו. אתה גמרת להזמין.', 'The waiter asks if you need anything more. You have finished ordering.']), rounds: [
      { prompt: 'reply.rest.anything-else', options: [['phrase.coffee.thats-all', true], ['phrase.rest.water', false], ['phrase.rest.ill-have-chicken', false, l3(Y_ORDER)]] },
    ] }),
    // THE ORDER IS IN — nothing to answer.
    cards(['ההזמנה נסגרה', 'Order closed'], ticket(4, ['ההזמנה גמורה — והמלצר אומר… הקש כדי לשמוע.', 'Your order is complete — and the waiter says… Tap to hear.']), [
      card('rest.line.coming', W_COMING, ['מגיע עוד רגע! (ההזמנה בדרך — אין מה לענות)', 'Coming right up! (your order is on its way — nothing to answer)'], 'coming-right-up'),
    ]),
    // ⏳ LATER… (the scene cue, never a line) — the meal check, your compliment and the bill.
    cards(['אחרי הארוחה', 'After the meal'], ticket(5, ['המלצר חוזר לשולחן. הקש כדי לשמוע.', 'The waiter comes back to your table. Tap to hear.']), [
      card('rest.line.okay', W_OKAY, ['הכל בסדר? (המלצר בודק שהארוחה הייתה בסדר)', 'Is everything okay? (the waiter checks the meal was okay)'], 'meal-check'),
      card('rest.line.bill', Y_BILL, ['כן, היה טעים מאוד! החשבון, בבקשה. (מחמאה ← ואז מבקשים לשלם)', 'Yes, that was delicious! The bill, please. (a compliment → then ask to pay)'], 'delicious-bill'),
      card('rest.line.bye', W_BYE, ['שמח שנהניתם. בבקשה — ערב נעים! (הוא מגיש את החשבון ונפרד)', 'So glad you enjoyed it. Here you are — have a lovely evening! (he hands you the bill and says goodbye)'], 'goodbye'),
    ]),
    k.practice({ kind: 'quickReply', label: ticket(5, ANSWER), rounds: [
      { prompt: 'reply.rest.everything-okay', options: [['phrase.rest.the-bill', true, l3(Y_BILL)], ['phrase.rest.ill-have-chicken', false, l3(Y_ORDER)], ['phrase.rest.table-two', false, l3(Y_TABLE)]] },
    ] }),
    k.receipt(ticket(6, ['ההזמנה שלך — מהשולחן ועד החשבון.', 'Your order — from the table to the bill.'])),
    // WAITER SIGNALS — the waiter says something fast: what does he want now?
    k.practice({
      kind: 'visualMatch', quiet: true, challenge: true,
      label: ['⚡ אותות המלצר — מה הוא רוצה עכשיו?', '⚡ Waiter signals — what does the waiter want now?'],
      tiles: Object.values(WAITER_SIGNALS),
      rounds: SIGNAL_ROUNDS.map(([audio, correct]) => ({ audio, correct })),
    }),
    // THE FLEX ROUND — transfer only: the same chunk, another number.
    k.practice({
      kind: 'visualMatch', quiet: true, transferOnly: true,
      label: ['🔁 סבב גמיש — קבוצה אחרת בכניסה. לכמה אנשים השולחן?', '🔁 Flex round — another group at the door. How many people is the table for?'],
      tiles: [PARTY_SIZES.two, PARTY_SIZES.four], rounds: [{ audio: M14_FLEX.partySize.audio, correct: M14_FLEX.partySize.correct, reinforce: M14_FLEX.partySize.audio }],
    }),
    // THE SUPPORTED MEAL — the whole conversation, in order; the ticket fills as you say it.
    k.practice({ kind: 'quickReply', label: ticket(0, ['עכשיו כל הארוחה, מהכניסה.', 'Now the whole meal, from the door.']), rounds: [
      { prompt: 'reply.rest.reservation', options: [['phrase.rest.table-two', true, l3(Y_TABLE)], ['phrase.rest.water', false], ['phrase.coffee.thats-all', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: ticket(1), rounds: [
      { prompt: 'reply.rest.ready-to-order', options: [['phrase.rest.ill-have-chicken', true, l3(Y_ORDER)], ['phrase.rest.the-bill', false, l3(Y_BILL)], ['phrase.coffee.thats-all', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: ticket(2), rounds: [
      { prompt: 'reply.rest.to-drink', options: [['phrase.rest.water', true], ['phrase.rest.table-two', false, l3(Y_TABLE)], ['phrase.rest.the-bill', false, l3(Y_BILL)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: ticket(3), rounds: [
      { prompt: 'reply.rest.anything-else', options: [['phrase.coffee.thats-all', true], ['phrase.rest.ill-have-chicken', false, l3(Y_ORDER)], ['phrase.rest.table-two', false, l3(Y_TABLE)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: ticket(5), rounds: [
      { prompt: 'reply.rest.everything-okay', options: [['phrase.rest.the-bill', true, l3(Y_BILL)], ['phrase.rest.water', false], ['phrase.coffee.thats-all', false]] },
    ] }),
    k.receipt(ticket(6, ['כל הארוחה — מהכניסה ועד החשבון.', 'The whole meal — from the door to the bill.'])),
    k.dialogue('sit-down-meal'),
    k.receipt(['כל השיחה — שולחן, הזמנה, שתייה, סגירה וחשבון.', 'The whole conversation — table, order, drink, close and bill.']),
    // NO HELP — the waiter's real lines, in order, at natural speed: no meaning, no cards, no hints.
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { npc: W_RES, options: [['phrase.rest.table-two', true, l3(Y_TABLE)], ['phrase.rest.the-bill', false, l3(Y_BILL)], ['phrase.coffee.thats-all', false]] },
      { npc: W_READY, options: [['phrase.rest.ill-have-chicken', true, l3(Y_ORDER)], ['phrase.rest.water', false], ['phrase.rest.table-two', false, l3(Y_TABLE)]] },
    ] }),
    k.practice({ kind: 'quickReply', challenge: true, label: ticket(2), rounds: [
      { npc: W_DRINK, options: [['phrase.rest.water', true], ['phrase.coffee.thats-all', false], ['phrase.rest.the-bill', false, l3(Y_BILL)]] },
      { npc: W_ELSE, options: [['phrase.coffee.thats-all', true], ['phrase.rest.table-two', false, l3(Y_TABLE)], ['phrase.rest.water', false]] },
    ] }),
    k.practice({ kind: 'quickReply', challenge: true, label: ticket(5), rounds: [
      { npc: W_OKAY, options: [['phrase.rest.the-bill', true, l3(Y_BILL)], ['phrase.rest.ill-have-chicken', false, l3(Y_ORDER)], ['phrase.rest.water', false]] },
    ] }),
    k.receipt(['בלי עזרה — כל הארוחה, בקצב של מלצר אמיתי.', 'No help — the whole meal, at a real waiter’s pace.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: one dinner, from the door to the bill.
    k.practice({ kind: 'quickReply', label: ticket(0, ['ארוחת ערב במסעדה. תגיע מהכניסה עד החשבון.', 'Dinner at a restaurant. Get from the door to the bill.']), rounds: [
      { npc: W_RES, options: [['phrase.rest.table-two', true, l3(Y_TABLE)], ['phrase.coffee.thats-all', false], ['phrase.rest.water', false]] },
      { npc: W_READY, options: [['phrase.rest.ill-have-chicken', true, l3(Y_ORDER)], ['phrase.rest.table-two', false, l3(Y_TABLE)], ['phrase.rest.the-bill', false, l3(Y_BILL)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: ticket(2), rounds: [
      { npc: W_DRINK, options: [['phrase.rest.water', true], ['phrase.rest.ill-have-chicken', false, l3(Y_ORDER)], ['phrase.coffee.thats-all', false]] },
      { npc: W_ELSE, options: [['phrase.coffee.thats-all', true], ['phrase.rest.the-bill', false, l3(Y_BILL)], ['phrase.rest.table-two', false, l3(Y_TABLE)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: ticket(5), rounds: [
      { npc: W_OKAY, options: [['phrase.rest.the-bill', true, l3(Y_BILL)], ['phrase.rest.water', false], ['phrase.rest.table-two', false, l3(Y_TABLE)]] },
    ] }),
    k.receipt(MEAL_COMPLETE),
    { kind: 'summary' },
  ];
  // The result picture appears only at its earned receipt, once its artwork exists.
  const result = M14_PROPS['meal-complete'];
  return steps.map((step) => (step.kind === 'receipt' && step.text.en === MEAL_COMPLETE[1] && result.image ? { ...step, image: result.image } : step));
}

