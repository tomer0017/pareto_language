import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep } from './types.js';

/**
 * Practice depth — the Arrival phase: Missions 06 (Airport & Border), 07 (Taxi), 08 (Hotel
 * Check-in) and 09 (Shopping). Defined ONCE for English, French and Spanish.
 *
 * Each mission file keeps what is genuinely its own — sentences, the locked dialogue, its intro
 * card, its word intro, its video — and takes everything from the key sentences onward from here,
 * so a practice step can never exist in one language only.
 *
 * The aim is capability, not coverage: after the listening drill the learner ANSWERS (Quick Reply),
 * changes a detail (Swap It), reads real information off a board, and ends on a final challenge
 * that is honestly one of two things — known language at natural speed, or a line that is meant to
 * be too much, where the win is a conversation-help tool.
 *
 * Rules kept here:
 *   - no new sentence ids: every answer is a sentence the mission already had;
 *   - a speed challenge uses ONLY lines the learner has met (they are the dialogue's own lines);
 *   - no app-language text before the learner answers, except a situation card (which IS the cue);
 *   - service register throughout (vous / usted).
 *
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

const OKAY_THANKS: L3 = ['Okay, thank you.', 'D’accord, merci.', 'De acuerdo, gracias.'];

/* ── Mission 06 — Airport & Border ───────────────────────────────────────────────────────────── */

/** "For ___": the same answer with another length of stay. Spanish answers with the bare duration. */
const STAY_FRAME: L3 = ['For ___.', 'Pour ___.', '___.'];
const STAY: Record<'days' | 'week' | 'weeks', readonly [L3, string]> = {
  days: [['three days', 'trois jours', 'Tres días'], 'לשלושה ימים.'],
  week: [['a week', 'une semaine', 'Una semana'], 'לשבוע.'],
  weeks: [['two weeks', 'deux semaines', 'Dos semanas'], 'לשבועיים.'],
};
const stayRound = (right: keyof typeof STAY, cue: Copy) => ({
  frame: STAY_FRAME,
  itemId: 'phrase.border.two-weeks',
  cue: { emoji: '📅', text: cue },
  options: (['days', 'week', 'weeks'] as const).map((k) => [STAY[k][0], STAY[k][1], k === right] as const),
});

/** Everything after Mission 06's intro card. */
export function m06Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.border.passport-here', ['המשפט הפותח', 'The opener']],
      ['phrase.border.on-holiday', ['מטרת הביקור', 'Purpose of visit']],
      ['phrase.border.two-weeks', ['כמה זמן', 'How long']],
      ['phrase.border.staying-hotel', ['איפה מתאכסן', 'Where staying']],
      ['phrase.border.nothing-declare', ['מכס', 'Customs']],
    ]),
    k.replies('phrase.border.passport-here', ['reply.border.purpose', 'reply.border.how-long', 'reply.border.where-staying', 'reply.border.anything-declare']),
    k.receipt(['אתה מזהה את כל שרשרת השאלות של פקיד הגבול — מראש.', 'You recognize the border officer’s whole question-chain — in advance.']),
    // The officer's four questions, each answered with the learner's own line. The wrong options are
    // real border answers — to a different question.
    k.practice({
      kind: 'quickReply',
      label: ['הפקיד שואל — מה עונים?', 'The officer asks — what do you say?'],
      rounds: [
        { prompt: 'reply.border.purpose', options: [['phrase.border.on-holiday', true], ['phrase.border.two-weeks', false], ['phrase.border.nothing-declare', false]] },
        { prompt: 'reply.border.how-long', options: [['phrase.border.two-weeks', true], ['phrase.border.staying-hotel', false], ['phrase.border.on-holiday', false]] },
        { prompt: 'reply.border.where-staying', options: [['phrase.border.staying-hotel', true], ['phrase.border.two-weeks', false], ['phrase.border.passport-here', false]] },
        { prompt: 'reply.border.anything-declare', options: [['phrase.border.nothing-declare', true], ['phrase.border.passport-here', false], ['phrase.border.on-holiday', false]] },
      ],
    }),
    // Not everyone stays two weeks: the same answer with another duration.
    k.practice({
      kind: 'swap',
      label: ['כמה זמן אתה נשאר?', 'How long are you staying?'],
      rounds: [
        stayRound('days', ['אתה נשאר שלושה ימים', 'You are staying three days']),
        stayRound('week', ['אתה נשאר שבוע', 'You are staying one week']),
        stayRound('weeks', ['אתה נשאר שבועיים', 'You are staying two weeks']),
      ],
    }),
    k.dialogue('border-control'),
    k.receipt(['עברת ביקורת גבול שלמה — דרכון, מטרה, משך, מקום, מכס.', 'You cleared a full border check — passport, purpose, duration, place, customs.']),
    k.review([
      'phrase.border.passport-here', 'phrase.border.on-holiday', 'phrase.border.two-weeks', 'phrase.border.staying-hotel', 'phrase.border.nothing-declare',
      'reply.border.purpose', 'reply.border.how-long', 'reply.border.where-staying', 'reply.border.anything-declare',
      'phrase.recovery.repeat', 'phrase.recovery.one-moment',
    ]),
    // Border Rush: the officer's own lines from the conversation, at natural speed, one after another.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: ["Thank you. What's the purpose of your visit?", 'Merci. Quel est le motif de votre visite ?', 'Gracias. ¿Cuál es el motivo de su viaje?', 'תודה. מה מטרת הביקור?'],
          options: [['phrase.border.on-holiday', true], ['phrase.border.passport-here', false], ['phrase.border.staying-hotel', false]] },
        { npc: ['All right. How long are you staying?', 'Très bien. Vous restez combien de temps ?', 'Muy bien. ¿Cuánto tiempo se queda?', 'בסדר. לכמה זמן אתה נשאר?'],
          options: [['phrase.border.two-weeks', true], ['phrase.border.nothing-declare', false], ['phrase.border.on-holiday', false]] },
        { npc: ['And where are you staying?', 'Et où logez-vous ?', '¿Y dónde se aloja?', 'ואיפה אתה מתאכסן?'],
          options: [['phrase.border.staying-hotel', true], ['phrase.border.two-weeks', false], ['phrase.border.nothing-declare', false]] },
        { npc: ['Almost done. Anything to declare?', 'C’est presque fini. Quelque chose à déclarer ?', 'Ya casi está. ¿Algo que declarar?', 'כמעט סיימנו. יש לך מה להצהיר?'],
          options: [['phrase.border.nothing-declare', true], ['phrase.border.staying-hotel', false], ['phrase.border.passport-here', false]] },
      ],
    }),
    k.receipt(['שרשרת שאלות בקצב אמיתי — וענית על כל אחת. ככה נראית ביקורת גבולות.', 'The question-chain at real speed — and you answered every one. That is what passport control feels like.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 07 — Taxi / Uber ────────────────────────────────────────────────────────────────── */

/** A driver's fare, by ear. Only numbers Mission 02 taught; 15 and 50 sound alike on purpose. */
const FARE_TILES = [
  { id: 'e5', label: '€5' }, { id: 'e8', label: '€8' }, { id: 'e10', label: '€10' },
  { id: 'e15', label: '€15' }, { id: 'e20', label: '€20' }, { id: 'e50', label: '€50' },
];
const FAST_FARE: L4 = ["It's about fifteen euros. There's a lot of traffic right now.", 'C’est environ quinze euros. Il y a beaucoup de circulation en ce moment.', 'Son unos quince euros. Hay mucho tráfico ahora mismo.', 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.'];

export function m07Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.taxi.to-address', ['הפתיח', 'The opener']],
      ['phrase.taxi.how-much', ['לשאול מחיר', 'Ask the price']],
      ['phrase.taxi.stop-here', ['לעצור', 'Stop it']],
      ['phrase.taxi.keep-change', ['לסיים יפה', 'Finish smoothly']],
    ]),
    k.replies('phrase.taxi.to-address', ['reply.taxi.where-to', 'reply.taxi.about-fifteen', 'reply.taxi.here-good', 'reply.taxi.first-visit']),
    k.receipt(['אתה מזהה מה נהג מונית שואל — לאן, כמה, כאן בסדר?', 'You recognize what a taxi driver asks — where to, how much, is here okay?']),
    // The price, by ear: hear the fare → tap it. No translation.
    k.practice({
      kind: 'visualMatch',
      label: ['הנהג אומר מחיר — הקש עליו', 'The driver says a fare — tap it'],
      tiles: FARE_TILES,
      rounds: [
        { audio: ["It's about fifteen euros.", 'C’est environ quinze euros.', 'Son unos quince euros.', 'זה בערך חמישה עשר יורו.'], correct: 'e15', itemId: 'reply.taxi.about-fifteen' },
        { audio: ['About twenty euros.', 'Environ vingt euros.', 'Unos veinte euros.', 'בערך עשרים יורו.'], correct: 'e20' },
        { audio: ["It's about ten euros.", 'C’est environ dix euros.', 'Son unos diez euros.', 'זה בערך עשרה יורו.'], correct: 'e10' },
      ],
    }),
    // Taxi Rush: the whole ride as five moments. The fast fare line is where asking the driver to
    // slow down is the smart move — and it is accepted as one.
    k.practice({
      kind: 'quickReply',
      label: ['בתוך המונית — מה אומרים?', 'In the taxi — what do you say?'],
      rounds: [
        { prompt: 'reply.taxi.where-to', options: [['phrase.taxi.to-address', true], ['phrase.taxi.stop-here', false], ['phrase.taxi.keep-change', false]] },
        { situation: ['לפני שיוצאים: אתה רוצה לדעת כמה זה יעלה.', 'Before you set off: you want to know what it will cost.'],
          options: [['phrase.taxi.how-much', true], ['phrase.taxi.keep-change', false], ['phrase.taxi.stop-here', false]] },
        { npc: FAST_FARE, options: [['phrase.recovery.slowly', true], ['phrase.recovery.thank-you', true, OKAY_THANKS], ['phrase.taxi.to-airport', false]] },
        { prompt: 'reply.taxi.here-good', options: [['phrase.taxi.stop-here', true], ['phrase.taxi.to-address', false], ['phrase.taxi.how-much', false]] },
        { situation: ['משלמים. אתה לא צריך את העודף.', 'You are paying, and you do not need the change back.'],
          options: [['phrase.taxi.keep-change', true], ['phrase.taxi.how-much', false], ['phrase.taxi.to-address', false]] },
      ],
    }),
    k.dialogue('taxi-ride'),
    k.receipt(['נסיעה שלמה: יעד, מחיר, עצירה, תשלום. שרדת את המונית.', 'A full ride: destination, price, stop, payment. You survived the taxi.']),
    k.review([
      'phrase.taxi.to-address', 'phrase.taxi.to-airport', 'phrase.taxi.how-much', 'phrase.taxi.stop-here', 'phrase.taxi.keep-change',
      'reply.taxi.where-to', 'reply.taxi.about-fifteen', 'reply.taxi.traffic', 'reply.taxi.here-good',
      'phrase.recovery.slowly', 'phrase.recovery.show-me',
    ]),
    // The ride at natural speed — the driver's own lines from the conversation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: ['Hello! Where to?', 'Bonjour ! Où allez-vous ?', '¡Hola! ¿A dónde va?', 'שלום! לאן?'],
          options: [['phrase.taxi.to-address', true], ['phrase.taxi.keep-change', false], ['phrase.taxi.stop-here', false]] },
        { npc: ["Sure. About fifteen euros. There's a lot of traffic.", 'Bien sûr. Environ quinze euros. Il y a beaucoup de circulation.', 'Claro. Unos quince euros. Hay mucho tráfico.', 'בטח. בערך חמישה עשר יורו. יש הרבה פקקים.'],
          options: [['phrase.recovery.thank-you', true, OKAY_THANKS], ['phrase.taxi.stop-here', false], ['phrase.taxi.to-address', false]] },
        { npc: ['…We are almost there. Is here okay?', '…On est presque arrivés. Ici, ça va ?', '…Ya casi llegamos. ¿Aquí está bien?', '…כמעט הגענו. כאן זה בסדר?'],
          options: [['phrase.taxi.stop-here', true], ['phrase.taxi.how-much', false], ['phrase.taxi.to-airport', false]] },
      ],
    }),
    k.receipt(['יעד, מחיר ועצירה — בקצב של נהג אמיתי. לא קפאת.', 'Destination, price and stop — at a real driver’s pace. You did not freeze.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 08 — Hotel Check-in ─────────────────────────────────────────────────────────────── */

const ROOM_TILES = [
  { id: 'r104', label: '104' }, { id: 'r204', label: '204' }, { id: 'r214', label: '214' },
  { id: 'r240', label: '240' }, { id: 'r402', label: '402' }, { id: 'r420', label: '420' },
];

export function m08Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    // "For two nights." and the wifi password are not part of this mission any more — not taught,
    // not reviewed, not offered in the conversation (wifi / SIM belongs to the Extended material).
    // The check-in is reservation → name → passport → breakfast.
    ...k.tools([
      ['phrase.hotel.reservation', ['הפתיח', 'The opener']],
      ['phrase.hotel.under-name', ['על איזה שם', 'The name on the booking']],
      ['phrase.hotel.here-you-go', ['להגיש את הדרכון', 'Handing it over']],
      ['phrase.hotel.breakfast', ['ארוחת בוקר', 'Breakfast']],
    ]),
    k.replies('phrase.hotel.reservation', ['reply.hotel.passport', 'reply.hotel.room-number', 'reply.hotel.second-floor', 'reply.hotel.breakfast-time']),
    k.receipt(['אתה מזהה כל מה שפקיד הקבלה אומר — דרכון, חדר, קומה, שעות.', 'You recognize everything the receptionist says — passport, room, floor, hours.']),
    // Hotel Match: what the receptionist says ↔ what it means, as numbers and icons — no translation.
    k.practice({
      kind: 'matchPairs',
      label: ['מה אמרו לך? חבר כל משפט למה שהוא אומר', 'What were you told? Match each line to what it means'],
      pairs: [
        ['reply.hotel.room-number', 'reply.hotel.room-number', undefined, '🚪 204'],
        ['reply.hotel.second-floor', 'reply.hotel.second-floor', undefined, '🏢 2'],
        ['reply.hotel.breakfast-time', 'reply.hotel.breakfast-time', undefined, '🍳 7–10'],
        ['reply.hotel.elevator', 'reply.hotel.elevator', undefined, '🛗 ➡️'],
      ],
    }),
    // The room number, by ear — the one number you must not get wrong.
    k.practice({
      kind: 'visualMatch',
      label: ['באיזה חדר אתה? הקש על המספר', 'Which room is yours? Tap the number'],
      tiles: ROOM_TILES,
      rounds: [
        { audio: ["You're in room two-oh-four.", 'Vous êtes dans la chambre deux cent quatre.', 'Está en la habitación doscientos cuatro.', 'אתה בחדר 204.'], correct: 'r204', itemId: 'reply.hotel.room-number' },
        { audio: ["You're in room four-oh-two.", 'Vous êtes dans la chambre quatre cent deux.', 'Está en la habitación cuatrocientos dos.', 'אתה בחדר 402.'], correct: 'r402' },
      ],
    }),
    k.practice({
      kind: 'quickReply',
      label: ['בדלפק הקבלה — מה אומרים?', 'At the front desk — what do you say?'],
      rounds: [
        { npc: ['Good evening. Do you have a reservation?', 'Bonsoir. Vous avez une réservation ?', 'Buenas noches. ¿Tiene una reserva?', 'ערב טוב. יש לך הזמנה?'],
          options: [['phrase.hotel.reservation', true], ['phrase.hotel.breakfast', false], ['phrase.hotel.here-you-go', false]] },
        { situation: ['הפקיד מחפש את ההזמנה. על איזה שם היא?', 'The receptionist is looking for the booking. Whose name is it under?'],
          options: [['phrase.hotel.under-name', true], ['phrase.hotel.reservation', false], ['phrase.hotel.breakfast', false]] },
        { prompt: 'reply.hotel.passport', options: [['phrase.hotel.here-you-go', true], ['phrase.recovery.one-moment', true], ['phrase.hotel.breakfast', false]] },
        { situation: ['קיבלת מפתח. אתה רוצה לדעת אם ארוחת הבוקר בפנים.', 'You have your key. You want to know whether breakfast comes with the room.'],
          options: [['phrase.hotel.breakfast', true], ['phrase.hotel.reservation', false], ['phrase.hotel.here-you-go', false]] },
      ],
    }),
    k.dialogue('hotel-checkin'),
    k.receipt(["צ'ק-אין שלם: הזמנה, דרכון, חדר, מידע — ואתה בפנים.", 'A full check-in: reservation, passport, room, info — and you’re in.']),
    k.review([
      'phrase.hotel.reservation', 'phrase.hotel.under-name', 'phrase.hotel.here-you-go', 'phrase.hotel.breakfast',
      'reply.hotel.passport', 'reply.hotel.room-number', 'reply.hotel.second-floor', 'reply.hotel.breakfast-time', 'reply.hotel.elevator',
      'phrase.recovery.repeat', 'phrase.recovery.one-moment',
    ]),
    // Fast information that is meant to be too much: asking to hear it again IS the right answer.
    k.ambush('recovery',
      ['Just so you know breakfast is served in the room on the lower level next to the pool.', 'Juste pour info, le petit-déjeuner est servi dans la salle au niveau inférieur, à côté de la piscine.', 'Solo para que lo sepa, el desayuno se sirve en la sala de la planta baja, junto a la piscina.', 'רק שתדע, ארוחת הבוקר מוגשת בחדר בקומה התחתונה ליד הבריכה.'],
      'phrase.recovery.repeat', 'phrase.hotel.here-you-go'),
    k.receipt(['מידע ארוך ומהיר — ובמקום לקפוא, ביקשת לחזור עליו. זה כלי.', 'Long, fast info — and instead of freezing, you asked them to repeat. That’s a tool.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 09 — Shopping ───────────────────────────────────────────────────────────────────── */

/** A larger or a smaller size, the way each language asks for it in a clothes shop. The adjective
 *  agrees with "size" (la taille / la talla), never with the garment, so one wording fits any item. */
const SIZE_FRAME: L3 = ['Do you have a ___ size?', 'Vous avez une taille ___ ?', '¿Tiene una talla ___?'];
const SIZES: Record<'bigger' | 'smaller', readonly [L3, string]> = {
  bigger: [['bigger', 'plus grande', 'más grande'], 'יש מידה גדולה יותר?'],
  smaller: [['smaller', 'plus petite', 'más pequeña'], 'יש מידה קטנה יותר?'],
};
const sizeRound = (right: keyof typeof SIZES, emoji: string, cue: Copy) => ({
  frame: SIZE_FRAME,
  itemId: 'phrase.shop.bigger',
  cue: { emoji, text: cue },
  options: (['bigger', 'smaller'] as const).map((s) => [SIZES[s][0], SIZES[s][1], s === right] as const),
});

export function m09Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.shop.just-looking', ['מרחב אישי', 'Personal space']],
      ['phrase.shop.try-on', ['למדוד', 'Try it on']],
      ['phrase.shop.bigger', ['מידה', 'Sizes']],
      ['phrase.shop.take-it', ['להחליט', 'Decide']],
    ]),
    k.replies('phrase.shop.try-on', ['reply.shop.what-size', 'reply.shop.fitting-room', 'reply.shop.on-sale', 'reply.shop.anything-else']),
    k.receipt(['אתה מזהה מה מוכר שואל — מידה, חדר הלבשה, מבצע.', 'You recognize what a seller asks — size, fitting room, sale.']),
    // "Out of stock" is something you must UNDERSTAND, not say — so it is tested by ear, once.
    k.quiz('reply.shop.out-of-stock', 'reply.shop.on-sale', 'reply.shop.fitting-room'),
    // Shop Rush: four moments with a seller.
    k.practice({
      kind: 'quickReply',
      label: ['בחנות — מה אומרים?', 'In the shop — what do you say?'],
      rounds: [
        { prompt: 'reply.shop.can-i-help', options: [['phrase.shop.just-looking', true], ['phrase.shop.take-it', false], ['phrase.shop.bigger', false]] },
        { situation: ['מצאת משהו שמוצא חן בעיניך. אתה רוצה למדוד אותו.', 'You found something you like. You want to try it on.'],
          options: [['phrase.shop.try-on', true], ['phrase.shop.just-looking', false], ['phrase.shop.take-it', false]] },
        { prompt: 'reply.shop.on-sale', options: [['phrase.shop.take-it', true], ['phrase.shop.just-looking', false], ['phrase.shop.try-on', false]] },
        { situation: ['המחיר גבוה ממה שחשבת. אומרים את זה בנימוס.', 'The price is higher than you expected. Say so politely.'],
          options: [['phrase.shop.too-expensive', true], ['phrase.shop.take-it', false], ['phrase.shop.just-looking', false]] },
      ],
    }),
    // One size up, one size down.
    k.practice({
      kind: 'swap',
      label: ['איזו מידה לבקש?', 'Which size do you ask for?'],
      rounds: [
        sizeRound('bigger', '👕', ['זה קטן עליך', 'It is too small on you']),
        sizeRound('smaller', '🧥', ['זה גדול עליך', 'It is too big on you']),
      ],
    }),
    k.dialogue('clothing-shop'),
    k.receipt(['קניה שלמה: הסתכלת, מדדת, ביקשת מידה, החלטת. בשליטה מלאה.', 'A full shop: browsed, tried on, asked for a size, decided. Fully in control.']),
    k.review([
      'phrase.shop.just-looking', 'phrase.shop.try-on', 'phrase.shop.bigger', 'phrase.shop.take-it', 'phrase.shop.too-expensive',
      'reply.shop.can-i-help', 'reply.shop.what-size', 'reply.shop.fitting-room', 'reply.shop.on-sale', 'reply.shop.out-of-stock',
      'phrase.recovery.slowly', 'phrase.recovery.repeat',
    ]),
    // A long, fast seller sentence that is meant to be too much: asking for it again is the win.
    k.ambush('recovery',
      ['That one is actually the last piece we have in that colour would you like me to hold it?', 'Celui-ci, c’est en fait le dernier qu’il nous reste dans cette couleur — vous voulez que je vous le garde ?', 'Este es en realidad el último que nos queda en ese color — ¿quiere que se lo guarde?', 'זה בעצם הפריט האחרון שיש לנו בצבע הזה — שאשמור לך אותו?'],
      'phrase.recovery.repeat', 'phrase.shop.take-it'),
    k.receipt(['משפט ארוך ומהיר — ובמקום לקפוא, ביקשת הבהרה. זה בדיוק הרפלקס.', 'A long, fast sentence — and instead of freezing, you asked for clarity. Exactly the reflex.']),
    { kind: 'summary' },
  ];
}
