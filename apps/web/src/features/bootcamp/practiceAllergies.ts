import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 15 — Food Preferences & Allergies: a SMALL survival mission. Defined ONCE for English,
 * French and Spanish. The conversation is LOCKED (`day13.ts`, `fr/day13.ts`, `es/day13.ts`); this is
 * the short journey around it — no allergen list, no food vocabulary, no grammar:
 *
 *   the briefing (your own needs) → "Are you ready to order?" (Mission 14) + "I'm allergic to nuts."
 *   → "Any other allergies…?" + "I'm vegetarian." → the kitchen check: the dish IS vegetarian, the
 *   nuts are NOT confirmed (one comprehension check) → "Does it have dairy?" + the cream answer →
 *   "I'll tell the kitchen" / "I'll check with them and come right back" → WHAT DO YOU DO? (four
 *   situations → the four functions) → the supported conversation (Food Check) → the conversation →
 *   no help → the video → the final → 👨‍🍳 KITCHEN CHECK SENT.
 *
 * Rules kept here:
 *   - the learner says only the five locked lines; the waiter's lines are comprehension;
 *   - "Great. Without onions, please." is Mission 14's chunk and "Thank you!" the toolkit's: retrieved,
 *     never re-taught (no card, no builder);
 *   - SAFETY: nothing ever says the dish is safe. The nuts stay "kitchen checking…" to the end — the
 *     waiter only promised to check. Vegetarian (confirmed) and the allergy (pending) are separate facts;
 *     "the kitchen was told" is not "the kitchen confirmed";
 *   - no Flex Round: the mission itself is the transfer (ready to order, without onions).
 *
 * Coverage: `mission15Coverage.ts`, enforced by `mission15.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): one restaurant, one waiter, one diner.
 * Each slot is an emoji until its artwork exists (`image` set): docs/MISSION15_ASSET_MANIFEST.md.
 * Pictures are on teaching cards only — never an answer.
 */
type M15Slot = 'waiter' | 'nuts' | 'vegetarian' | 'kitchen-check' | 'dairy';
export const M15_SLOTS: Record<M15Slot, { emoji: string; image?: string }> = {
  waiter: { emoji: '🧑‍🍳' },
  nuts: { emoji: '🥜' },
  vegetarian: { emoji: '🌱' },
  'kitchen-check': { emoji: '👨‍🍳' },
  dairy: { emoji: '🥛' },
};
/** Result picture only — never a choice, never a card. */
export const M15_PROPS: Record<'kitchen-check-sent', { emoji: string; image?: string }> = {
  'kitchen-check-sent': { emoji: '📨' },
};
const look15 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/* The locked conversation (EN · FR · ES · HE), line by line — the waiter's lines… */
export const N_READY: L4 = ['Hi there! Are you ready to order?', 'Bonjour ! Vous êtes prêt à commander ?', '¡Hola! ¿Está listo para pedir?', 'היי! מוכן להזמין?'];
export const N_OTHER: L4 = ['Thank you for telling me. Any other allergies or dietary restrictions?', 'Merci de me le dire. D’autres allergies ou restrictions alimentaires ?', 'Gracias por avisarme. ¿Alguna otra alergia o restricción alimentaria?', 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?'];
export const N_RISOTTO: L4 = ["Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", 'Compris. Le risotto aux champignons est végétarien, mais je vérifie avec la cuisine pour les noix.', 'Entendido. El risotto de champiñones es vegetariano, pero lo compruebo con la cocina por los frutos secos.', 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.'];
export const N_CREAM: L4 = ['Yes, it has some cream, but we can make it without.', 'Oui, il y a un peu de crème, mais on peut le faire sans.', 'Sí, lleva un poco de nata, pero se lo podemos hacer sin ella.', 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.'];
export const N_TELL: L4 = ["Of course. I'll tell the kitchen about your allergy.", 'Bien sûr. Je préviens la cuisine pour votre allergie.', 'Claro. Aviso a la cocina de su alergia.', 'כמובן. אגיד למטבח על האלרגיה שלך.'];
export const N_BACK: L4 = ["I'll check with them and come right back.", 'Je vérifie avec eux et je reviens tout de suite.', 'Lo compruebo con ellos y vuelvo enseguida.', 'אבדוק איתם ואחזור מיד.'];
/* …and the traveller's, as said. */
export const Y_ALLERGY: L4 = ["I'm allergic to nuts.", 'Je suis allergique aux noix.', 'Soy alérgico a los frutos secos.', 'אני אלרגי לאגוזים.'];
export const Y_VEG: L4 = ["I'm vegetarian.", 'Je suis végétarien.', 'Soy vegetariano.', 'אני צמחוני.'];
export const Y_DAIRY: L4 = ['Does it have dairy?', 'Est-ce qu’il y a des produits laitiers dedans ?', '¿Esto lleva lácteos?', 'יש בזה מוצרי חלב?'];
export const Y_ONIONS: L4 = ['Great. Without onions, please.', 'Parfait. Sans oignons, s’il vous plaît.', 'Genial. Sin cebolla, por favor.', 'מעולה. בלי בצל, בבקשה.'];
export const Y_THANKS: L4 = ['Thank you!', 'Merci !', '¡Gracias!', 'תודה!'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── The Food Check — your own needs, and only what the waiter has actually said ─────────────────── */

/**
 * How far the conversation has got (the WAITER's lines reveal it):
 *   0 nothing yet · 1 the risotto line: the dish is vegetarian ✅, the nuts → the kitchen will check ·
 *   2 the cream line: dairy → cream, can be left out · 3 "I'll tell the kitchen": allergy notified.
 * There is no later stage: the conversation ends with the waiter going to check. NOTHING is ever "safe".
 */
export const M15_REVEALS = ['nothing', 'kitchen-check', 'dairy', 'notified'] as const;
export type M15Reveal = 0 | 1 | 2 | 3;
const FOOD_COPY = {
  mine: ['🙋 הצרכים שלי', '🙋 My needs'], waiter: ['👨‍🍳 מה המלצר אמר', '👨‍🍳 What the waiter said'],
  allergy: ['אלרגיה: אגוזים', 'Allergy: Nuts'], diet: ['תזונה: צמחוני', 'Diet: Vegetarian'], onions: ['בצל: להוריד', 'Onions: Remove'],
  dish: ['מנה: ?', 'Dish: ?'], nuts: ['אגוזים: ?', 'Nuts: ?'], dairy: ['חלב: ?', 'Dairy: ?'], kitchen: ['מטבח: —', 'Kitchen: —'],
  dishVeg: ['מנה: צמחונית ✅', 'Dish: Vegetarian ✅'], nutsChecking: ['אגוזים: המטבח בודק…', 'Nuts: Kitchen checking…'],
  cream: ['חלב: יש שמנת — אפשר בלי', 'Dairy: Cream — can remove'], notified: ['מטבח: האלרגיה נמסרה ✅', 'Kitchen: Allergy notified ✅'],
} as const satisfies Record<string, Copy>;
/** The Food Check at reveal `n`, as text the screen renders as two columns. */
export const foodCheck = (n: M15Reveal): Copy => {
  const row = (i: 0 | 1): string => {
    const c = FOOD_COPY;
    const mine = [c.allergy[i], c.diet[i], c.onions[i]];
    const said = [n >= 1 ? c.dishVeg[i] : c.dish[i], n >= 1 ? c.nutsChecking[i] : c.nuts[i], n >= 2 ? c.cream[i] : c.dairy[i], n >= 3 ? c.notified[i] : c.kitchen[i]];
    return `${c.mine[i]}: ${mine.join(' / ')} ‖ ${c.waiter[i]}: ${said.join(' / ')}`;
  };
  return [row(0), row(1)];
};
/** The parts of a board label, joined: the screen draws the Food Check, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const check = (n: M15Reveal, prompt?: Copy): Copy => {
  const join = (i: 0 | 1): string => [foodCheck(n)[i], ...(prompt ? [prompt[i]] : [])].join(BOARD_SEP);
  return [join(0), join(1)];
};

/** The order, as plain serialisable data. The nut status has NO "safe" value: the dialogue never reaches one. */
export type NutStatus = 'unknown' | 'checking';
export type KitchenStatus = 'unknown' | 'checking' | 'notified';
export const foodCheckState = (n: M15Reveal) => ({
  stage: M15_REVEALS[n],
  phase: n >= 3 ? 'waiting-for-kitchen' : 'ordering',
  allergy: 'nuts',
  diet: 'vegetarian',
  onionPreference: 'remove',
  dishVegetarian: n >= 1 ? true : null,
  nutStatus: (n >= 1 ? 'checking' : 'unknown') as NutStatus,
  dairyStatus: n >= 2 ? 'contains-cream-can-remove' : 'unknown',
  kitchenStatus: (n >= 3 ? 'notified' : n >= 1 ? 'checking' : 'unknown') as KitchenStatus,
});

/** The ending — the needs are with the kitchen; the nuts are STILL being checked. Never "safe". */
export const KITCHEN_CHECK_SENT: Copy = [
  `👨‍🍳 הבדיקה נשלחה למטבח${BOARD_SEP}${foodCheck(3)[0]}${BOARD_SEP}המלצר הלך לבדוק — מחכים לתשובה לגבי האגוזים.`,
  `👨‍🍳 KITCHEN CHECK SENT${BOARD_SEP}${foodCheck(3)[1]}${BOARD_SEP}The waiter went to check — wait for the answer about the nuts.`,
];

/** What the waiter said about the nuts — semantic tiles (the id is the meaning), captioned in the app language. */
export const NUT_ANSWERS: Record<'checking' | 'no-nuts' | 'has-nuts', MatchTile> = {
  checking: { id: 'checking', emoji: '👨‍🍳', caption: { he: 'עוד לא ידוע — המטבח יבדוק', en: 'Not known yet — the kitchen will check' } },
  'no-nuts': { id: 'no-nuts', emoji: '🥜', caption: { he: 'הוא אמר: אין אגוזים', en: 'He said: no nuts' } },
  'has-nuts': { id: 'has-nuts', emoji: '⚠️', caption: { he: 'הוא אמר: יש אגוזים', en: 'He said: it has nuts' } },
};

/** WHAT DO YOU DO? — four situations → the four reusable functions. */
export const SITUATIONS: readonly (readonly [Copy, string])[] = [
  [['🥛 אתה צריך לדעת אם יש במנה מוצרי חלב.', '🥛 You need to know whether the dish contains dairy.'], 'phrase.diet.does-have-dairy'],
  [['🥜 אגוזים מסוכנים בשבילך.', '🥜 Nuts are dangerous for you.'], 'phrase.diet.allergic-nuts'],
  [['🧅 אתה לא רוצה בצל.', '🧅 You don’t want onions.'], 'phrase.diet.without-onions'],
  [['🌱 אתה לא אוכל בשר.', '🌱 You don’t eat meat.'], 'phrase.diet.vegetarian'],
];
const FUNCTIONS = ['phrase.diet.allergic-nuts', 'phrase.diet.vegetarian', 'phrase.diet.does-have-dairy', 'phrase.diet.without-onions'];

export function m15Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M15Slot) => ({ line: true, key, t: l3(line), meaning, ...look15(M15_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  // Every reply option is one of the five lines; "Great. Without onions, please." is said whole.
  const say = (id: string, ok: boolean) => (id === 'phrase.diet.without-onions' ? [id, ok, l3(Y_ONIONS)] as const : [id, ok] as const);
  const plain = (id: string, ok: boolean) => [id, ok] as const;
  const steps: BootcampStep[] = [
    // THE BRIEFING — only the traveller's own needs.
    k.talk('🥜', ['משימה 15: העדפות אוכל ואלרגיות', 'Mission 15: Food Preferences & Allergies'], [
      ['אתה אלרגי לאגוזים, צמחוני, רוצה לבדוק אם יש מוצרי חלב ולא רוצה בצל. תוודא שהמלצר מעביר את זה למטבח.', 'You’re allergic to nuts, vegetarian, want to check whether there’s dairy, and don’t want onions. Make sure the waiter passes it on to the kitchen.'],
    ], ['להזמין', 'Order']),
    // THE ALLERGY — the waiter's signal is Mission 14's; your allergy comes first.
    cards(['אלרגיה', 'Your allergy'], check(0, ['המלצר מוכן להזמנה — ואתה אומר קודם כל את האלרגיה. הקש כדי לשמוע.', 'The waiter is ready for your order — and you say your allergy first. Tap to hear.']), [
      card('diet.line.ready', N_READY, ['היי! מוכן להזמין? (מוכר ממשימה 14: המלצר מוכן לשמוע מה אתה רוצה)', 'Hi there! Are you ready to order? (you know it from Mission 14: the waiter is ready for your order)'], 'waiter'),
      card('diet.line.allergic', Y_ALLERGY, ['אני אלרגי לאגוזים. (יש לי אלרגיה למאכל הזה — אומרים קודם, ברור)', "I'm allergic to nuts. (I have an allergy to this food — say it first, clearly)"], 'nuts'),
    ]),
    // OTHER RESTRICTIONS — and your diet.
    cards(['הגבלות נוספות', 'Anything else?'], check(0, ['המלצר שואל אם יש עוד משהו. הקש כדי לשמוע.', 'The waiter asks if there is anything else. Tap to hear.']), [
      card('diet.line.other', N_OTHER, ['תודה שאמרת. יש עוד אלרגיות או הגבלות באוכל?', 'Thank you for telling me. Any other allergies or food restrictions?'], 'waiter'),
      card('diet.line.vegetarian', Y_VEG, ['אני צמחוני.', "I'm vegetarian."], 'vegetarian'),
    ]),
    // THE KITCHEN CHECK — two different facts: the dish (yes) and the nuts (not confirmed).
    cards(['בדיקה במטבח', 'The kitchen check'], check(0, ['שני דברים שונים: המנה — והאגוזים. הקש כדי לשמוע.', 'Two different things: the dish — and the nuts. Tap to hear.']), [
      card('diet.line.risotto', N_RISOTTO, ['הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים. (צמחוני: כן ✅ · אגוזים: עוד לא ידוע — המטבח יבדוק)', "Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts. (vegetarian: yes ✅ · nuts: not known yet — the kitchen will check)"], 'kitchen-check'),
    ]),
    k.practice({
      kind: 'visualMatch', quiet: true,
      label: ['מה המלצר אמר על האגוזים?', 'What did the waiter say about the nuts?'],
      tiles: Object.values(NUT_ANSWERS), rounds: [{ audio: N_RISOTTO, correct: 'checking', reinforce: N_RISOTTO }],
    }),
    // DAIRY — you ask about an ingredient; the answer: yes, but it can be left out.
    cards(['מוצרי חלב', 'Dairy'], check(1, ['אתה שואל על מרכיב — ושומע את התשובה. הקש כדי לשמוע.', 'You ask about an ingredient — and hear the answer. Tap to hear.']), [
      card('diet.line.dairy', Y_DAIRY, ['יש בזה מוצרי חלב? (יש בזה ___? — שואלים על מרכיב)', 'Does it have dairy? (does it have ___? — ask about an ingredient)'], 'dairy'),
      card('diet.line.cream', N_CREAM, ['כן, יש בו קצת שמנת, אבל אפשר להכין בלי. (חלב: יש — אבל אפשר להוריד)', 'Yes, it has some cream, but we can make it without. (dairy: yes — but it can be left out)'], 'dairy'),
    ]),
    // THE KITCHEN — told, and going to check: told is not confirmed.
    cards(['המטבח', 'The kitchen'], check(2, ['המלצר מעביר את האלרגיה למטבח — והולך לבדוק. הקש כדי לשמוע.', 'The waiter passes your allergy to the kitchen — and goes to check. Tap to hear.']), [
      card('diet.line.tell', N_TELL, ['כמובן. אגיד למטבח על האלרגיה שלך. (האלרגיה נמסרת למטבח)', "Of course. I'll tell the kitchen about your allergy. (your allergy is passed to the kitchen)"], 'kitchen-check'),
      card('diet.line.back', N_BACK, ['אבדוק איתם ואחזור מיד. (עוד לא אושר — מחכים לתשובה)', "I'll check with them and come right back. (not confirmed yet — wait for the answer)"], 'kitchen-check'),
    ]),
    k.receipt(check(3, ['הצרכים שלך עברו למטבח. האגוזים עדיין בבדיקה.', 'Your needs went to the kitchen. The nuts are still being checked.'])),
    // WHAT DO YOU DO? — the situation → the function: allergy, diet, ask, remove.
    k.practice({
      kind: 'quickReply',
      label: ['🎯 מה עושים? — המצב ← מה אומרים', '🎯 What do you do? — the situation → what you say'],
      rounds: SITUATIONS.map(([situation, id]) => ({ situation, options: [say(id, true), ...FUNCTIONS.filter((f) => f !== id).slice(0, 2).map((f) => say(f, false))] })),
    }),
    // THE SUPPORTED CONVERSATION — in order; the Food Check fills as the waiter answers.
    k.practice({ kind: 'quickReply', label: check(0, ['עכשיו כל השיחה.', 'Now the whole conversation.']), rounds: [
      { prompt: 'reply.diet.ready', options: [plain('phrase.diet.allergic-nuts', true), plain('phrase.diet.does-have-dairy', false), plain('phrase.recovery.thank-you', false)] },
      { prompt: 'reply.diet.other', options: [plain('phrase.diet.vegetarian', true), plain('phrase.recovery.thank-you', false), say('phrase.diet.without-onions', false)] },
      { prompt: 'reply.diet.risotto', options: [plain('phrase.diet.does-have-dairy', true), plain('phrase.diet.vegetarian', false), plain('phrase.recovery.thank-you', false)] },
    ] }),
    k.practice({ kind: 'quickReply', label: check(1), rounds: [
      { prompt: 'reply.diet.cream', options: [say('phrase.diet.without-onions', true), plain('phrase.diet.does-have-dairy', false), plain('phrase.diet.allergic-nuts', false)] },
    ] }),
    k.practice({ kind: 'quickReply', label: check(2), rounds: [
      { prompt: 'reply.diet.tell', options: [plain('phrase.recovery.thank-you', true), plain('phrase.diet.vegetarian', false), plain('phrase.diet.does-have-dairy', false)] },
    ] }),
    k.receipt(check(3, ['כל השיחה — והאגוזים עדיין בבדיקה.', 'The whole conversation — and the nuts are still being checked.'])),
    k.dialogue('allergy-order'),
    k.receipt(['אמרת את מה שחשוב לך — והמטבח יודע. התשובה על האגוזים עוד לא הגיעה.', 'You said what matters to you — and the kitchen knows. The answer about the nuts has not come yet.']),
    // NO HELP — the waiter's real lines, at natural speed: no meaning, no cards, no hints.
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { npc: N_READY, options: [plain('phrase.diet.allergic-nuts', true), plain('phrase.diet.vegetarian', false), plain('phrase.recovery.thank-you', false)] },
      { npc: N_OTHER, options: [plain('phrase.diet.vegetarian', true), plain('phrase.diet.does-have-dairy', false), plain('phrase.diet.allergic-nuts', false)] },
      { npc: N_RISOTTO, options: [plain('phrase.diet.does-have-dairy', true), plain('phrase.recovery.thank-you', false), say('phrase.diet.without-onions', false)] },
    ] }),
    k.practice({ kind: 'quickReply', challenge: true, label: check(1), rounds: [
      { npc: N_CREAM, options: [say('phrase.diet.without-onions', true), plain('phrase.diet.vegetarian', false), plain('phrase.recovery.thank-you', false)] },
    ] }),
    k.practice({ kind: 'quickReply', challenge: true, label: check(2), rounds: [
      { npc: N_TELL, options: [plain('phrase.recovery.thank-you', true), plain('phrase.diet.allergic-nuts', false), say('phrase.diet.without-onions', false)] },
    ] }),
    k.receipt(['בלי עזרה — כל השיחה, בקצב של מלצר אמיתי.', 'No help — the whole conversation, at a real waiter’s pace.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: make sure the waiter understands what matters before he goes to the kitchen.
    k.practice({ kind: 'quickReply', label: check(0, ['תוודא שהמלצר מבין מה חשוב לך לפני שהוא חוזר למטבח.', 'Make sure the waiter understands what matters to you before he goes back to the kitchen.']), rounds: [
      { npc: N_READY, options: [plain('phrase.diet.allergic-nuts', true), say('phrase.diet.without-onions', false), plain('phrase.diet.does-have-dairy', false)] },
      { npc: N_OTHER, options: [plain('phrase.diet.vegetarian', true), plain('phrase.diet.allergic-nuts', false), plain('phrase.recovery.thank-you', false)] },
      { npc: N_RISOTTO, options: [plain('phrase.diet.does-have-dairy', true), plain('phrase.diet.vegetarian', false), say('phrase.diet.without-onions', false)] },
    ] }),
    k.practice({ kind: 'quickReply', label: check(1), rounds: [
      { npc: N_CREAM, options: [say('phrase.diet.without-onions', true), plain('phrase.recovery.thank-you', false), plain('phrase.diet.does-have-dairy', false)] },
    ] }),
    k.practice({ kind: 'quickReply', label: check(2), rounds: [
      { npc: N_TELL, options: [plain('phrase.recovery.thank-you', true), plain('phrase.diet.does-have-dairy', false), plain('phrase.diet.vegetarian', false)] },
    ] }),
    k.receipt(KITCHEN_CHECK_SENT),
    { kind: 'summary' },
  ];
  // The result picture appears only at its earned receipt, once its artwork exists.
  const result = M15_PROPS['kitchen-check-sent'];
  return steps.map((step) => (step.kind === 'receipt' && step.text.en === KITCHEN_CHECK_SENT[1] && result.image ? { ...step, image: result.image } : step));
}
