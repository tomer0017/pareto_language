import type { Copy, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep } from './types.js';

/**
 * Practice depth — the Everyday Life phase, hand-written mission 17 (Supermarket). Defined ONCE for
 * English, French and Spanish. (Missions 14 and 15 have their own passes: practiceRestaurant.ts,
 * practiceAllergies.ts.) (Missions 11, 12, 13 and 16 are multilingual specs — their practice lives in `core/`.)
 *
 * Each mission file keeps its sentences, its locked dialogue, its intro card and its word intro, and
 * takes everything from the key sentences onward from here.
 *
 * Rules kept here:
 *   - the practice matches the CURRENT dialogue — nothing is drilled that the conversation dropped;
 *   - no new sentence ids; a speed challenge is made of the conversation's own lines;
 *   - with an allergy, asking again is a correct answer and guessing never is;
 *   - service register throughout (vous / usted).
 *
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/* ── Mission 17 — Supermarket ────────────────────────────────────────────────────────────────── */

/** Aisle number + side: what an assistant actually tells you. */
const AISLE_TILES = [
  { id: 'a1l', label: '1 ⬅️' }, { id: 'a1r', label: '1 ➡️' }, { id: 'a2l', label: '2 ⬅️' },
  { id: 'a2r', label: '2 ➡️' }, { id: 'a3l', label: '3 ⬅️' }, { id: 'a3r', label: '3 ➡️' },
];
const CAN_I_HELP: L4 = ['Hi there! Can I help you find something?', 'Bonjour ! Je peux vous aider à trouver quelque chose ?', '¡Hola! ¿Le ayudo a encontrar algo?', 'היי! לעזור לך למצוא משהו?'];
const AISLE_THREE_LEFT: L4 = ['The milk is in aisle three, on the left.', 'Le lait est dans l’allée trois, sur la gauche.', 'La leche está en el pasillo tres, a la izquierda.', 'החלב במעבר שלוש, משמאל.'];
const product = (right: 'milk' | 'bread' | 'water', emoji: string, cue: Copy) => ({
  frame: ['Where is the ___?', 'Où est ___ ?', '¿Dónde está ___?'] as const,
  itemId: 'phrase.super.where-is',
  cue: { emoji, text: cue },
  options: [
    [['milk', 'le lait', 'la leche'], 'איפה החלב?', right === 'milk'],
    [['bread', 'le pain', 'el pan'], 'איפה הלחם?', right === 'bread'],
    [['water', 'l’eau', 'el agua'], 'איפה המים?', right === 'water'],
  ] as const,
});

export function m17Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.super.where-is', ['למצוא מוצר', 'Find a product']],
      ['phrase.super.do-you-have', ['לבדוק מלאי', 'Check stock']],
      ['phrase.super.just-this', ['בקופה', 'At the checkout']],
      ['phrase.super.need-bag', ['לבקש שקית', 'Ask for a bag']],
    ]),
    // "You need to weigh it first." left the conversation, so it left the practice too.
    k.replies('phrase.super.where-is', ['reply.super.aisle-three', 'reply.super.over-there', 'reply.super.bag-q', 'reply.super.card-here']),
    k.receipt(['אתה מזהה תשובות של עובד וקופה — מעבר, כיוון, שקית, כרטיס.', 'You recognize what an assistant and a checkout say — aisle, direction, bag, card.']),
    // Where is it? An aisle number and a side, by ear.
    k.practice({
      kind: 'visualMatch',
      label: ['איפה זה? הקש על המעבר והצד ששמעת', 'Where is it? Tap the aisle and the side you hear'],
      tiles: AISLE_TILES,
      rounds: [
        { audio: AISLE_THREE_LEFT, correct: 'a3l', itemId: 'reply.super.aisle-three' },
        { audio: ["It's in aisle one, on the right.", 'C’est dans l’allée une, sur la droite.', 'Está en el pasillo uno, a la derecha.', 'זה במעבר אחת, מימין.'], correct: 'a1r' },
        { audio: ["It's in aisle two, on the left.", 'C’est dans l’allée deux, sur la gauche.', 'Está en el pasillo dos, a la izquierda.', 'זה במעבר שתיים, משמאל.'], correct: 'a2l' },
      ],
    }),
    // One question, any product — only products the learner already has words for.
    k.practice({
      kind: 'swap',
      label: ['מה אתה מחפש?', 'What are you looking for?'],
      rounds: [
        product('milk', '🥛', ['אתה מחפש חלב', 'You are looking for milk']),
        product('bread', '🍞', ['אתה מחפש לחם', 'You are looking for bread']),
        product('water', '💧', ['אתה מחפש מים', 'You are looking for water']),
      ],
    }),
    // From the shelf to the checkout.
    k.practice({
      kind: 'quickReply',
      label: ['בסופר — מה אומרים?', 'In the supermarket — what do you say?'],
      rounds: [
        { npc: CAN_I_HELP, options: [['phrase.super.where-is', true], ['phrase.super.do-you-have', true], ['phrase.super.just-this', false]] },
        { situation: ['אתה לא מוצא לחם. שואלים אם יש.', 'You cannot find any bread. Ask whether they have it.'],
          options: [['phrase.super.do-you-have', true], ['phrase.super.need-bag', false], ['phrase.super.just-this', false]] },
        { prompt: 'reply.super.aisle-three', options: [['phrase.recovery.thank-you', true], ['phrase.recovery.repeat', true], ['phrase.super.need-bag', false]] },
        { npc: ['Hi! Is that everything?', 'Bonjour ! Ce sera tout ?', '¡Hola! ¿Eso es todo?', 'היי! זה הכל?'],
          options: [['phrase.super.just-this', true], ['phrase.super.where-is', false], ['phrase.super.do-you-have', false]] },
        { prompt: 'reply.super.bag-q', options: [['phrase.super.need-bag', true], ['phrase.super.where-is', false], ['phrase.super.do-you-have', false]] },
      ],
    }),
    k.dialogue('supermarket'),
    k.receipt(['מצאת מוצר, הבנת באיזה מעבר הוא, ועברת קופה — לבד.', 'You found a product, understood which aisle it is in, and got through the checkout — on your own.']),
    k.review([
      'phrase.super.where-is', 'phrase.super.do-you-have', 'phrase.super.just-this', 'phrase.super.need-bag',
      'reply.super.aisle-three', 'reply.super.over-there', 'reply.super.bag-q', 'reply.super.card-here', 'reply.super.sold-out',
      'phrase.recovery.repeat', 'phrase.recovery.show-me',
    ]),
    // Shelf to checkout at natural pace — the conversation's own lines.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: CAN_I_HELP, options: [['phrase.super.where-is', true], ['phrase.super.just-this', false], ['phrase.super.need-bag', false]] },
        { npc: AISLE_THREE_LEFT, options: [['phrase.recovery.thank-you', true], ['phrase.super.just-this', false], ['phrase.super.do-you-have', false]] },
        { npc: ['Hi! Is that everything?', 'Bonjour ! Ce sera tout ?', '¡Hola! ¿Eso es todo?', 'היי! זה הכל?'],
          options: [['phrase.super.just-this', true], ['phrase.super.where-is', false], ['phrase.super.do-you-have', false]] },
        { npc: ['Do you need a bag?', 'Vous avez besoin d’un sac ?', '¿Necesita una bolsa?', 'צריך שקית?'],
          options: [['phrase.super.need-bag', true], ['phrase.super.where-is', false], ['phrase.super.just-this', false]] },
      ],
    }),
    k.receipt(['מהמדף ועד הקופה, בקצב רגיל — מצאת, הבנת איפה, ושילמת.', 'From shelf to checkout at normal pace — you found it, understood where, and paid.']),
    // The self-checkout says something you were never taught. Asking someone to show you is the win.
    k.ambush('recovery',
      ['Unexpected item in the bagging area — please wait for assistance.', 'Article inattendu dans la zone d’emballage — veuillez attendre de l’aide.', 'Artículo inesperado en la zona de embolsado — espere asistencia, por favor.', 'פריט לא צפוי באזור האריזה — אנא המתן לסיוע.'],
      'phrase.recovery.show-me', 'phrase.super.just-this'),
    k.receipt(['הקופה האוטומטית נתקעה — וידעת לבקש שיראו לך במקום להיכנס ללחץ.', 'The self-checkout jammed — and you knew to ask someone to show you, instead of panicking.']),
    { kind: 'summary' },
  ];
}
