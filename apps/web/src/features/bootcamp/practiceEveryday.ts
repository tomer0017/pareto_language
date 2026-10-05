import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep } from './types.js';

/**
 * Practice depth — the Everyday Life phase, hand-written missions: 14 (Restaurant Meal),
 * 15 (Food Preferences & Allergies) and 17 (Supermarket). Defined ONCE for English, French and
 * Spanish. (Missions 11, 12, 13 and 16 are multilingual specs — their practice lives in `core/`.)
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

/* ── Mission 14 — Restaurant Meal ────────────────────────────────────────────────────────────── */

const NO_TABLE: L3 = ['No — a table for two, please.', 'Non — une table pour deux, s’il vous plaît.', 'No — una mesa para dos, por favor.'];
const CHICKEN_NO_ONIONS: L3 = ["I'll have the chicken, without onions, please.", 'Je vais prendre le poulet, sans oignons, s’il vous plaît.', 'Voy a tomar el pollo, sin cebolla, por favor.'];
/** The dialogue's answer to "Anything else?" — it has no id of its own and is scored as a thank-you. */
const THATS_ALL: L3 = ["That's all, thanks.", 'C’est tout, merci.', 'Eso es todo, gracias.'];
const DELICIOUS_BILL: L3 = ['Yes, that was delicious! The bill, please.', 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', '¡Sí, estaba delicioso! La cuenta, por favor.'];

export function m14Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.rest.table-two', ['הפתיח', 'The opener']],
      ['phrase.rest.ill-have-chicken', ['להזמין', 'Order it']],
      ['phrase.rest.no-onions', ['בקשה מיוחדת', 'Special request']],
      ['phrase.rest.the-bill', ['לסגור', 'Close it out']],
    ]),
    // The waiter's questions — exactly the ones this meal asks.
    k.replies('phrase.rest.ill-have-chicken', ['reply.rest.reservation', 'reply.rest.ready-to-order', 'reply.rest.to-drink', 'reply.rest.anything-else', 'reply.rest.everything-okay']),
    k.receipt(['אתה מזהה את כל שאלות המלצר — לפני שהן מפתיעות אותך.', 'You recognize every waiter question — before it can surprise you.']),
    // Restaurant Rush: the meal as six moments.
    k.practice({
      kind: 'quickReply',
      label: ['המלצר שואל — מה עונים?', 'The waiter asks — what do you say?'],
      rounds: [
        { prompt: 'reply.rest.reservation', options: [['phrase.rest.table-two', true, NO_TABLE], ['phrase.rest.the-bill', false], ['phrase.rest.water', false]] },
        { prompt: 'reply.rest.ready-to-order', options: [['phrase.rest.ill-have-chicken', true, CHICKEN_NO_ONIONS], ['phrase.rest.ill-have', true], ['phrase.rest.the-bill', false]] },
        { prompt: 'reply.rest.to-drink', options: [['phrase.rest.water', true], ['phrase.rest.no-onions', false], ['phrase.rest.table-two', false]] },
        { prompt: 'reply.rest.anything-else', options: [['phrase.recovery.thank-you', true, THATS_ALL], ['phrase.rest.table-two', false], ['phrase.rest.delicious', false]] },
        { situation: ['אתה לא רוצה בצל במנה.', 'You do not want onions in your dish.'],
          options: [['phrase.rest.no-onions', true], ['phrase.rest.water', false], ['phrase.rest.the-bill', false]] },
        { prompt: 'reply.rest.everything-okay', options: [['phrase.rest.the-bill', true, DELICIOUS_BILL], ['phrase.rest.delicious', true], ['phrase.rest.table-two', false]] },
      ],
    }),
    // The order itself, with either dish the conversation accepts.
    k.practice({
      kind: 'swap',
      label: ['מה מזמינים?', 'What are you having?'],
      rounds: ([['chicken', 'phrase.rest.ill-have-chicken', '🍗', ['אתה רוצה את העוף', 'You want the chicken']], ['pasta', 'phrase.rest.ill-have', '🍝', ['אתה רוצה את הפסטה', 'You want the pasta']]] as const).map(([right, itemId, emoji, cue]) => ({
        frame: ["I'll have the ___, please.", 'Je vais prendre ___, s’il vous plaît.', 'Voy a tomar ___, por favor.'] as const,
        itemId,
        cue: { emoji, text: cue },
        options: [
          [['chicken', 'le poulet', 'el pollo'], 'אני אקח את העוף, בבקשה.', right === 'chicken'],
          [['pasta', 'les pâtes', 'la pasta'], 'אני אקח את הפסטה, בבקשה.', right === 'pasta'],
        ] as const,
      })),
    }),
    k.dialogue('sit-down-meal'),
    k.receipt(['ארוחת ערב שלמה: משולחן ועד חשבון, כולל בקשה מיוחדת.', 'A full dinner: from table to bill, special request included.']),
    k.review([
      'phrase.rest.table-two', 'phrase.rest.ill-have-chicken', 'phrase.rest.ill-have', 'phrase.rest.no-onions', 'phrase.rest.water', 'phrase.rest.the-bill',
      'reply.rest.reservation', 'reply.rest.ready-to-order', 'reply.rest.to-drink', 'reply.rest.anything-else', 'reply.rest.everything-okay',
      'phrase.recovery.dont-understand',
    ]),
    // One compact meal at natural pace — the waiter's own lines from the conversation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: ['Good evening! Do you have a reservation?', 'Bonsoir ! Vous avez une réservation ?', '¡Buenas noches! ¿Tiene reserva?', 'ערב טוב! יש לכם הזמנה?'],
          options: [['phrase.rest.table-two', true, NO_TABLE], ['phrase.rest.the-bill', false], ['phrase.rest.water', false]] },
        { npc: ['Are you ready to order?', 'Vous êtes prêts à commander ?', '¿Están listos para pedir?', 'מוכנים להזמין?'],
          options: [['phrase.rest.ill-have-chicken', true, CHICKEN_NO_ONIONS], ['phrase.rest.the-bill', false], ['phrase.rest.table-two', false]] },
        { npc: ['Of course. Anything to drink?', 'Bien sûr. Quelque chose à boire ?', 'Claro. ¿Algo de beber?', 'כמובן. משהו לשתות?'],
          options: [['phrase.rest.water', true], ['phrase.rest.no-onions', false], ['phrase.rest.table-two', false]] },
        { npc: ['Anything else?', 'Autre chose ?', '¿Algo más?', 'עוד משהו?'],
          options: [['phrase.recovery.thank-you', true, THATS_ALL], ['phrase.rest.table-two', false], ['phrase.rest.delicious', false]] },
        { npc: ['Is everything okay?', 'Tout va bien ?', '¿Va todo bien?', 'הכל בסדר?'],
          options: [['phrase.rest.the-bill', true, DELICIOUS_BILL], ['phrase.rest.ill-have-chicken', false], ['phrase.rest.table-two', false]] },
      ],
    }),
    k.receipt(['ארוחה שלמה בקצב של מלצר אמיתי — משולחן ועד חשבון.', 'A whole meal at a real waiter’s pace — from table to bill.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 15 — Food Preferences & Allergies ───────────────────────────────────────────────── */

const READY_TO_ORDER: L4 = ['Hi there! Are you ready to order?', 'Bonjour ! Vous êtes prêt à commander ?', '¡Hola! ¿Está listo para pedir?', 'היי! מוכן להזמין?'];
/** The dialogue's own question. "I'm vegetarian." answers the "dietary restrictions" half of it —
 *  vegetarianism is never presented as an allergy. */
const ANY_OTHER: L4 = ['Thank you for telling me. Any other allergies or dietary restrictions?', 'Merci de me le dire. D’autres allergies ou restrictions alimentaires ?', 'Gracias por avisarme. ¿Alguna otra alergia o restricción alimentaria?', 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?'];
const GREAT_WITHOUT: L3 = ['Great. Without onions, please.', 'Parfait. Sans oignons, s’il vous plaît.', 'Genial. Sin cebolla, por favor.'];

export function m15Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.diet.allergic-nuts', ['המשפט שמציל', 'The line that protects']],
      ['phrase.diet.without-onions', ['להסיר מרכיב', 'Remove an ingredient']],
      ['phrase.diet.vegetarian', ['להגדיר את עצמך', 'Define yourself']],
      ['phrase.diet.does-have-dairy', ['לבדוק מרכיב', 'Check an ingredient']],
    ]),
    k.replies('phrase.diet.allergic-nuts', ['reply.diet.let-me-check', 'reply.diet.make-without', 'reply.diet.contains-nuts', 'reply.diet.anything-else-allergic']),
    k.receipt(['אתה מזהה איך המטבח מגיב לאלרגיה — בדיקה, אזהרה, ופתרון.', 'You recognize how a kitchen responds to an allergy — check, warning, and solution.']),
    // What is the kitchen telling you — checking, changing the dish, or warning you? Each answer tile
    // says it in words next to its icon: with an allergy, nothing may hang on reading an emoji right.
    // Nothing here calls a dish "safe".
    k.practice({
      kind: 'matchPairs',
      label: ['מה אומרים לך? בודקים, משנים, או מזהירים?', 'What are you being told? Checking, changing it, or a warning?'],
      pairs: [
        ['reply.diet.let-me-check', 'reply.diet.let-me-check', undefined, '🔍', ['בודקים במטבח', 'They will check']],
        ['reply.diet.make-without', 'reply.diet.make-without', undefined, '➖', ['אפשר להכין בלי', 'They can make it without']],
        ['reply.diet.contains-nuts', 'reply.diet.contains-nuts', undefined, '⚠️ 🥜', ['יש בזה אגוזים', 'It contains nuts']],
      ],
    }),
    // Saying it clearly, in order: the allergy first, then what you eat, then the ingredient, then the change.
    k.practice({
      kind: 'quickReply',
      label: ['להזמין בבטחה — מה אומרים?', 'Ordering safely — what do you say?'],
      rounds: [
        { npc: READY_TO_ORDER, options: [['phrase.diet.allergic-nuts', true], ['phrase.diet.is-spicy', false], ['phrase.diet.without-onions', false]] },
        { npc: ANY_OTHER, options: [['phrase.diet.vegetarian', true], ['phrase.diet.is-spicy', false], ['phrase.diet.without-onions', false]] },
        { situation: ['המלצר מציע מנה. אתה צריך לדעת אם יש בה מוצרי חלב.', 'The waiter suggests a dish. You need to know whether there is dairy in it.'],
          options: [['phrase.diet.does-have-dairy', true], ['phrase.diet.is-spicy', false], ['phrase.diet.vegetarian', false]] },
        { prompt: 'reply.diet.make-without', options: [['phrase.diet.without-onions', true, GREAT_WITHOUT], ['phrase.diet.vegetarian', false], ['phrase.diet.allergic-nuts', false]] },
        // A warning. Saying the allergy again, or asking to hear it again, are both right. Ordering is not.
        { prompt: 'reply.diet.contains-nuts', options: [['phrase.diet.allergic-nuts', true], ['phrase.recovery.repeat', true], ['phrase.diet.without-onions', false]] },
      ],
    }),
    k.dialogue('allergy-order'),
    k.receipt(['הזמנת ארוחה שמתאימה לך — אלרגיה, צמחוני, בלי בצל, בדיקת מרכיבים.', 'You ordered a meal that works for you — allergy, vegetarian, no onions, ingredients checked.']),
    k.review([
      'phrase.diet.allergic-nuts', 'phrase.diet.vegetarian', 'phrase.diet.does-have-dairy', 'phrase.diet.without-onions', 'phrase.diet.is-spicy',
      'reply.diet.let-me-check', 'reply.diet.make-without', 'reply.diet.contains-nuts', 'reply.diet.anything-else-allergic',
      'phrase.recovery.repeat', 'phrase.recovery.slowly',
    ]),
    // The order at natural pace — the waiter's own lines. When the kitchen still has to check, asking
    // to hear it again is accepted: that is the right instinct with an allergy.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: READY_TO_ORDER, options: [['phrase.diet.allergic-nuts', true], ['phrase.diet.without-onions', false], ['phrase.diet.is-spicy', false]] },
        { npc: ANY_OTHER, options: [['phrase.diet.vegetarian', true], ['phrase.diet.without-onions', false], ['phrase.diet.is-spicy', false]] },
        { npc: ["Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", 'Compris. Le risotto aux champignons est végétarien, mais je vérifie avec la cuisine pour les noix.', 'Entendido. El risotto de champiñones es vegetariano, pero lo compruebo con la cocina por los frutos secos.', 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.'],
          options: [['phrase.diet.does-have-dairy', true], ['phrase.recovery.repeat', true], ['phrase.diet.vegetarian', false]] },
        { npc: ['Yes, it has some cream, but we can make it without.', 'Oui, il y a un peu de crème, mais on peut le faire sans.', 'Sí, lleva un poco de nata, pero se lo podemos hacer sin ella.', 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.'],
          options: [['phrase.diet.without-onions', true, GREAT_WITHOUT], ['phrase.diet.allergic-nuts', false], ['phrase.diet.vegetarian', false]] },
      ],
    }),
    k.receipt(['אלרגיה, מה אתה אוכל, מה יש במנה ומה להוריד — אמרת הכל, ברור ובסדר הנכון.', 'The allergy, what you eat, what is in the dish and what to leave out — you said it all, clearly and in the right order.']),
    // A fast, detailed safety question that is meant to be too much. Asking again beats guessing.
    k.ambush('recovery',
      ['Just to be safe does your nut allergy mean we should avoid the shared fryer too?', 'Juste pour être sûr, votre allergie aux noix veut dire qu’on doit aussi éviter la friteuse partagée ?', 'Solo para asegurarme, ¿su alergia a los frutos secos significa que también debemos evitar la freidora compartida?', 'רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?'],
      'phrase.recovery.repeat', 'phrase.diet.vegetarian'),
    k.receipt(['שאלת בטיחות מפורטת ומהירה — וביקשת שיחזרו במקום לנחש. עם אלרגיה, זה בדיוק הצעד הנכון.', 'A detailed, fast safety question — and you asked them to repeat instead of guessing. With an allergy, exactly the right move.']),
    { kind: 'summary' },
  ];
}

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
