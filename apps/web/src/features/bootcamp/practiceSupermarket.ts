import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 17 — Supermarket & Everyday Shopping: a MINIMAL, VISUAL, FAST supermarket sprint. Defined ONCE
 * for English, French and Spanish. The conversation is LOCKED (`day16.ts`, `fr/day16.ts`, `es/day16.ts`);
 * this is the short journey around it — no food encyclopedia, no prices, no payment lesson, no grammar:
 *
 *   the briefing (buy milk) → SHELF SCAN (six essentials, one shelf, three recognition rounds) → "Can I
 *   help you find something?" + "Where is the milk?" → the same question for bread and cheese (transfer
 *   only) → the AISLE FINDER (aisle 3, on the left — deterministic UI) → at the checkout (a silent scene
 *   change) "Is that everything?" + "Just this, thanks." → "Do you need a bag?" + "Could I get a bag?" →
 *   the card (one cashier-signal board) → the conversation (once, supported) → no help (3) → the video →
 *   the final micro run (5) → 🛒 QUICK SHOP COMPLETE.
 *
 * Rules kept here:
 *   - three production tools (where is · just this · could I get a bag); "Thank you!" is the toolkit's,
 *     prior — no card, no drill;
 *   - exactly six supermarket essentials, for RECOGNITION (never production mastery);
 *   - "Where is the bread / cheese?" are `transferOnly`: never in the dialogue, never teaching or coverage;
 *   - the aisle number and side are UI (1 / 2 / 3, ⬅️ / ➡️), shown only after the assistant says them;
 *   - "At the checkout…" is a silent scene cue: no audio, no sentence, no coverage.
 *
 * Coverage: `mission17Coverage.ts`, enforced by `mission17.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): one supermarket, one style. Each slot is an
 * emoji until its artwork exists (`image` set): docs/MISSION17_ASSET_MANIFEST.md. The six products get
 * EQUAL treatment (same frame, same size). Pictures never carry an aisle number or a side.
 */
export type M17Product = 'milk' | 'water' | 'bread' | 'cheese' | 'eggs' | 'apples';
type M17Slot = M17Product | 'shop' | 'checkout' | 'bag';
export const M17_SLOTS: Record<M17Slot, { emoji: string; image?: string }> = {
  milk: { emoji: '🥛' },
  water: { emoji: '💧' },
  bread: { emoji: '🍞' },
  cheese: { emoji: '🧀' },
  eggs: { emoji: '🥚' },
  apples: { emoji: '🍎' },
  shop: { emoji: '🛒' },
  checkout: { emoji: '🧾' },
  bag: { emoji: '🛍️' },
};
/** Result picture only — never a choice, never a card. */
export const M17_PROPS: Record<'quick-shop-complete', { emoji: string; image?: string }> = {
  'quick-shop-complete': { emoji: '🛒' },
};
const look17 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/** The six supermarket essentials — EXACTLY six, recognition vocabulary. Bread is "bread", never a kind of bread. */
export const PRODUCTS: readonly M17Product[] = ['milk', 'water', 'bread', 'cheese', 'eggs', 'apples'];
export const PRODUCT_WORD: Record<M17Product, L3> = {
  milk: ['milk', 'le lait', 'la leche'],
  water: ['water', 'l’eau', 'el agua'],
  bread: ['bread', 'le pain', 'el pan'],
  cheese: ['cheese', 'le fromage', 'el queso'],
  eggs: ['eggs', 'les œufs', 'los huevos'],
  apples: ['apples', 'les pommes', 'las manzanas'],
};
export const PRODUCT_MEANING: Record<M17Product, Copy> = {
  milk: ['חלב', 'milk'], water: ['מים', 'water'], bread: ['לחם', 'bread'], cheese: ['גבינה', 'cheese'], eggs: ['ביצים', 'eggs'], apples: ['תפוחים', 'apples'],
};

/** A product word this language already had as an earlier mission’s word card (English "milk") — shown as a review. */
export const REVIEW_WORDS: Record<MissionLang, readonly M17Product[]> = { en: ['milk'], fr: [], es: [] };

/* The locked conversation (EN · FR · ES · HE), line by line — the staff's lines… */
export const N_HELP: L4 = ['Hi there! Can I help you find something?', 'Bonjour ! Je peux vous aider à trouver quelque chose ?', '¡Hola! ¿Le ayudo a encontrar algo?', 'היי! לעזור לך למצוא משהו?'];
export const N_AISLE: L4 = ['The milk is in aisle three, on the left.', 'Le lait est dans l’allée trois, sur la gauche.', 'La leche está en el pasillo tres, a la izquierda.', 'החלב במעבר שלוש, משמאל.'];
export const N_EVERYTHING: L4 = ['Hi! Is that everything?', 'Bonjour ! Ce sera tout ?', '¡Hola! ¿Eso es todo?', 'היי! זה הכל?'];
export const N_BAG: L4 = ['Do you need a bag?', 'Vous avez besoin d’un sac ?', '¿Necesita una bolsa?', 'צריך שקית?'];
export const N_PAY: L4 = ['Insert your card here… all done. Have a nice day!', 'Insérez votre carte ici… c’est bon. Bonne journée !', 'Inserte su tarjeta aquí… listo. ¡Que tenga un buen día!', 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!'];
/* …and the traveller's, as said. */
export const Y_WHERE: L4 = ['Where is the milk?', 'Où est le lait ?', '¿Dónde está la leche?', 'איפה החלב?'];
export const Y_THANKS: L4 = ['Thank you!', 'Merci !', '¡Gracias!', 'תודה!'];
export const Y_JUST: L4 = ['Just this, thanks.', 'Juste ça, merci.', 'Solo esto, gracias.', 'רק את זה, תודה.'];
export const Y_BAG: L4 = ['Could I get a bag?', 'Je peux avoir un sac ?', '¿Me da una bolsa?', 'אפשר שקית?'];
/** The silent scene change — shown, never spoken; not a sentence, not coverage. */
export const CHECKOUT_CUE: Copy = ['בקופה…', 'At the checkout…'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── 🛒 SUPERMARKET SPRINT — FIND → LOCATE → CHECKOUT → BAG → PAY ─────────────────────────────── */

export const M17_STAGES = ['find', 'locate', 'checkout', 'bag', 'pay'] as const;
const STAGE17: Record<(typeof M17_STAGES)[number], Copy> = {
  find: ['🔎 למצוא', '🔎 Find'], locate: ['📍 איפה', '📍 Locate'], checkout: ['🧾 קופה', '🧾 Checkout'], bag: ['🛍️ שקית', '🛍️ Bag'], pay: ['💳 לשלם', '💳 Pay'],
};
/** The located stage, once the assistant has said where: aisle 3, on the left (UI: a number and an arrow). */
const LOCATED: Copy = ['📍 מעבר 3 ⬅️', '📍 Aisle 3 ⬅️'];
const SPRINT_TITLE: Copy = ['🛒 ספרינט בסופר', '🛒 Supermarket sprint'];
/**
 * The sprint once `done` of its five stages are behind the learner: 1 you asked for the milk · 2 the
 * assistant said where (aisle 3 ⬅️ appears only now) · 3 "Just this" · 4 the bag · 5 the card.
 */
export const sprint = (done: number): Copy => {
  const row = (i: 0 | 1): string => M17_STAGES.map((s, k) => `${s === 'locate' && done >= 2 ? LOCATED[i] : STAGE17[s][i]} ${k < done ? '✅' : '⬜'}`).join(' · ');
  return [row(0), row(1)];
};
const board = (done: number, prompt?: Copy): Copy => {
  const join = (i: 0 | 1): string => [SPRINT_TITLE[i], sprint(done)[i], ...(prompt ? [prompt[i]] : [])].join(' · ');
  return [join(0), join(1)];
};

/** The trip, as plain serialisable data — the canonical purchase is one carton of milk; no cart. */
export const sprintState = (done: number) => ({
  phase: done >= 5 ? 'done' : M17_STAGES[done]!,
  productsSeen: [...PRODUCTS],
  milkFound: done >= 1,
  aisleKnown: done >= 2 ? { aisle: 3, side: 'left' as const } : null,
  checkoutReached: done >= 3,
  bagRequested: done >= 4,
  paymentDone: done >= 5,
});

/** The ending — the whole route, never a score, a price or a receipt. */
export const QUICK_SHOP_COMPLETE: Copy = [
  `🛒 הקנייה המהירה הושלמה · ${sprint(5)[0]} · מצאת, הבנת איפה, עברת קופה, ביקשת שקית ושילמת.`,
  `🛒 QUICK SHOP COMPLETE · ${sprint(5)[1]} · You found it, understood where, checked out, asked for a bag and paid.`,
];

/* ── The boards — semantic tiles (the id is the meaning) ──────────────────────────────────────── */

/** Shelf Scan — one tile per product, picture only (a caption would give the word away). */
export const PRODUCT_TILES: MatchTile[] = PRODUCTS.map((p) => ({ id: p, ...look17(M17_SLOTS[p]), alt: PRODUCT_MEANING[p][1] }));
/** Three recognition rounds, each over three products — no product is the answer twice. */
export const SHELF_ROUNDS: readonly (readonly [answer: M17Product, shown: readonly M17Product[]])[] = [
  ['cheese', ['cheese', 'bread', 'eggs']],
  ['eggs', ['eggs', 'apples', 'milk']],
  ['apples', ['apples', 'water', 'bread']],
];
/** The Aisle Finder — three aisles, each with a left and a right side (deterministic UI, never a picture). */
export const AISLE_TILES: MatchTile[] = [
  { id: 'a1l', label: '1 ⬅️' }, { id: 'a2l', label: '2 ⬅️' }, { id: 'a3l', label: '3 ⬅️' },
  { id: 'a1r', label: '1 ➡️' }, { id: 'a2r', label: '2 ➡️' }, { id: 'a3r', label: '3 ➡️' },
];
/** What the cashier wants — one board, three of the checkout's own signals. */
export const CASHIER_SIGNALS: Record<'everything' | 'bag' | 'card', MatchTile> = {
  everything: { id: 'everything', emoji: '🧾', caption: { he: 'שואלים אם זה הכל', en: 'Asking if that’s everything' } },
  bag: { id: 'bag', emoji: '🛍️', caption: { he: 'שואלים אם צריך שקית', en: 'Asking if you need a bag' } },
  card: { id: 'card', emoji: '💳', caption: { he: 'כרטיס במכשיר — ושילמת', en: 'Card in the machine — paid' } },
};

/* Sentence ids. */
const WHERE = 'phrase.super.where-is';
const JUST = 'phrase.super.just-this';
const BAG = 'phrase.super.need-bag';
const THANKS = 'phrase.recovery.thank-you';
/** What each learner sentence is said as — the whole locked line. */
export const SAID: Record<string, L4> = { [WHERE]: Y_WHERE, [JUST]: Y_JUST, [BAG]: Y_BAG, [THANKS]: Y_THANKS };

/** "Where is the ___?" with another product — transfer only. */
const transfer = (right: 'bread' | 'cheese', cue: Copy) => ({
  frame: ['Where is the ___?', 'Où est ___ ?', '¿Dónde está ___?'] as const,
  itemId: WHERE,
  cue: { emoji: M17_SLOTS[right].emoji, text: cue },
  options: (['milk', 'bread', 'cheese'] as const).map((p) => [
    [p, PRODUCT_WORD[p][1], PRODUCT_WORD[p][2]] as const,
    `איפה ה${PRODUCT_MEANING[p][0]}?`,
    p === right,
  ] as const),
});

export function m17Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M17Slot) => ({ line: true, key, t: l3(line), meaning, ...look17(M17_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  const plain = (id: string, ok: boolean) => [id, ok] as const;
  const aisle = (done: number, challenge = false): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true, ordered: true, ...(challenge ? { challenge: true } : {}),
    label: board(done, ['איפה החלב? הקש על המעבר והצד.', 'Where is the milk? Tap the aisle and the side.']),
    tiles: AISLE_TILES, rounds: [{ audio: N_AISLE, correct: 'a3l' }],
  });
  const pay = (done: number): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true,
    label: board(done, ['מה הקופאי אומר?', 'What is the cashier telling you?']),
    tiles: Object.values(CASHIER_SIGNALS), rounds: [{ audio: N_PAY, correct: 'card' }],
  });
  const steps: BootcampStep[] = [
    // THE BRIEFING — only the plan: buy milk. Not where it is, not what the checkout will say.
    k.talk('🛒', ['משימה 17: סופרמרקט', 'Mission 17: Supermarket'], [
      ['נכנסת לסופר לקנות חלב.', 'You walk into a supermarket to buy milk.'],
      ['מצא אותו, עבור בקופה ובקש שקית.', 'Find it, go through the checkout and ask for a bag.'],
    ], ['להיכנס לסופר', 'Walk into the shop']),
    // SHELF SCAN — six essentials on one shelf; recognition, not mastery.
    k.prime({
      label: ['🛒 סריקת מדף', '🛒 Shelf scan'],
      intro: board(0, ['שישה מוצרים בסיסיים. הקש על כל אחד כדי לשמוע.', 'Six basics. Tap each one to hear it.']),
      words: PRODUCTS.map((p) => ({ key: `super.${p}`, t: PRODUCT_WORD[p], meaning: PRODUCT_MEANING[p], ...look17(M17_SLOTS[p]), ...(REVIEW_WORDS[lang].includes(p) ? { review: true } : {}) })),
    }),
    k.practice({
      kind: 'visualMatch', quiet: true,
      label: board(0, ['שמע — והקש על המוצר.', 'Listen — and tap the product.']),
      tiles: PRODUCT_TILES,
      rounds: SHELF_ROUNDS.map(([answer, shown]) => ({ audio: [...PRODUCT_WORD[answer], PRODUCT_MEANING[answer][0]] as const, correct: answer, show: [...shown] })),
    }),
    // FIND — someone offers help; your one question finds anything.
    cards(['למצוא', 'Find it'], board(0, ['עובד מציע עזרה — ואתה שואל איפה החלב. הקש כדי לשמוע.', 'An assistant offers help — and you ask where the milk is. Tap to hear.']), [
      card('super.line.help', N_HELP, ['היי! לעזור לך למצוא משהו? (צריך עזרה למצוא משהו?)', 'Hi there! Can I help you find something? (need help finding something?)'], 'shop'),
      card('super.line.where', Y_WHERE, ['איפה החלב? (איפה ה___? — שאלה אחת לכל מוצר)', 'Where is the milk? (where is the ___? — one question for any product)'], 'milk'),
    ]),
    k.practice({ kind: 'quickReply', label: board(0, ['מה אתה שואל?', 'What do you ask?']), rounds: [
      { prompt: 'reply.super.can-help', options: [plain(WHERE, true), plain(THANKS, false)] },
    ] }),
    // THE SAME QUESTION, ANOTHER PRODUCT — transfer only: never in the conversation, never coverage.
    k.practice({
      kind: 'swap', transferOnly: true,
      label: board(1, ['אותה שאלה — מוצר אחר.', 'The same question — another product.']),
      rounds: [transfer('bread', ['אתה מחפש לחם', 'You are looking for bread']), transfer('cheese', ['אתה מחפש גבינה', 'You are looking for cheese'])],
    }),
    // LOCATE — the answer is a place: an aisle and a side.
    cards(['איפה', 'Where it is'], board(1, ['העובד אומר איפה. הקש כדי לשמוע.', 'The assistant says where. Tap to hear.']), [
      card('super.line.aisle', N_AISLE, ['החלב במעבר שלוש, משמאל. (מעבר 3 · צד שמאל)', 'The milk is in aisle three, on the left. (aisle 3 · left side)'], 'shop'),
    ]),
    aisle(1),
    // AT THE CHECKOUT — a silent scene change, then the cashier's question and your answer.
    cards(CHECKOUT_CUE, board(2, ['הקופאית שואלת אם זה הכל. הקש כדי לשמוע.', 'The cashier asks if that’s everything. Tap to hear.']), [
      card('super.line.everything', N_EVERYTHING, ['היי! זה הכל? (קונה עוד משהו?)', 'Hi! Is that everything? (are you buying anything else?)'], 'checkout'),
      card('super.line.just-this', Y_JUST, ['רק את זה, תודה.', 'Just this, thanks.'], 'checkout'),
    ]),
    k.practice({ kind: 'quickReply', label: board(2, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.super.everything', options: [plain(JUST, true), plain(WHERE, false), plain(THANKS, false)] },
    ] }),
    // THE BAG — asked, and asked for.
    cards(['שקית', 'A bag'], board(3, ['שקית? הקש כדי לשמוע.', 'A bag? Tap to hear.']), [
      card('super.line.bag-q', N_BAG, ['צריך שקית?', 'Do you need a bag?'], 'bag'),
      card('super.line.bag', Y_BAG, ['אפשר שקית? (מבקשים שקית)', 'Could I get a bag? (ask for a bag)'], 'bag'),
    ]),
    k.practice({ kind: 'quickReply', label: board(3, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.super.bag-q', options: [plain(BAG, true), plain(JUST, false), plain(WHERE, false)] },
    ] }),
    // PAY — the card, and goodbye (comprehension only).
    cards(['לשלם', 'Pay'], board(4, ['הכרטיס — וסיימת. הקש כדי לשמוע.', 'The card — and you’re done. Tap to hear.']), [
      card('super.line.card', N_PAY, ['הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים! (כרטיס למכשיר ← שולם ← להתראות)', 'Insert your card here… all done. Have a nice day! (card in the machine → paid → goodbye)'], 'checkout'),
    ]),
    pay(4),
    k.receipt(board(5, ['מצאת, הבנת איפה, עברת קופה, ביקשת שקית ושילמת.', 'Found it, understood where, checked out, asked for a bag, paid.'])),
    // THE CONVERSATION — once, supported (translations on).
    k.dialogue('supermarket'),
    k.receipt(['כל הקנייה — מהמדף ועד הקופה, לבד.', 'The whole trip — from the shelf to the checkout, on your own.']),
    // NO HELP — the three tools at a real shop's pace: no meaning, no cards, no sprint.
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { prompt: 'reply.super.can-help', options: [plain(WHERE, true), plain(JUST, false), plain(BAG, false)] },
      { prompt: 'reply.super.everything', options: [plain(JUST, true), plain(WHERE, false), plain(BAG, false)] },
      { prompt: 'reply.super.bag-q', options: [plain(BAG, true), plain(JUST, false), plain(WHERE, false)] },
    ] }),
    k.receipt(['בלי עזרה — למצוא, לסיים בקופה, לבקש שקית.', 'No help — find it, finish at the checkout, ask for a bag.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: one quick purchase — find, locate, checkout, bag, pay.
    k.practice({ kind: 'quickReply', label: board(0, ['קנייה מהירה אחת. קדימה.', 'One quick purchase. Go.']), rounds: [
      { prompt: 'reply.super.can-help', options: [plain(WHERE, true), plain(BAG, false), plain(THANKS, false)] },
    ] }),
    aisle(1),
    k.practice({ kind: 'quickReply', label: board(2), rounds: [
      { prompt: 'reply.super.everything', options: [plain(JUST, true), plain(BAG, false), plain(WHERE, false)] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(3), rounds: [
      { prompt: 'reply.super.bag-q', options: [plain(BAG, true), plain(THANKS, false), plain(JUST, false)] },
    ] }),
    pay(4),
    k.receipt(QUICK_SHOP_COMPLETE),
    { kind: 'summary' },
  ];
  // The pictures appear once their artwork exists: the briefing (the shop), the result (its prop).
  const result = M17_PROPS['quick-shop-complete'];
  return steps.map((step, index) => (index === 0 && M17_SLOTS.shop.image ? { ...step, image: M17_SLOTS.shop.image }
    : step.kind === 'receipt' && step.text.en === QUICK_SHOP_COMPLETE[1] && result.image ? { ...step, image: result.image } : step));
}
