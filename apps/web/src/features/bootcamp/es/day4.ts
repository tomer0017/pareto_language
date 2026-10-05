import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { DAY12_ES_ITEMS } from './day12.js';
import { m14Flow } from '../practiceEveryday.js';

/**
 * Spanish Mission 4 — "Comida en el restaurante" (Restaurant Meal). Spanish parallel of English mission
 * 4: same objective (table → menu → order → drink → bill), same step structure, same engine. Spanish
 * target lines + `tr:{en,he}` glosses; `es.*` ids. No Spanish video yet. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY4_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.rest.table-two', text: 'Una mesa para dos, por favor.', meaning: T('שולחן לשניים, בבקשה.', 'A table for two, please.'),
    tip: T('הפתיח למסעדה. התבנית: Una mesa para ___.', 'The restaurant opener. Template: Una mesa para ___.') },
  { id: 'es.phrase.rest.ill-have-chicken', text: 'Voy a tomar el pollo.', meaning: T('אני אקח את העוף.', "I'll have the chicken."),
    tip: T('תבנית ההזמנה: Voy a tomar ___.', 'The ordering template: Voy a tomar ___.') },
  { id: 'es.phrase.rest.water', text: 'Una botella de agua, por favor.', meaning: T('בקבוק מים, בבקשה.', 'A bottle of water, please.') },
  { id: 'es.phrase.rest.no-onions', text: 'Sin cebolla, por favor.', meaning: T('בלי בצל, בבקשה.', 'No onions, please.'),
    tip: T('תבנית: Sin ___, por favor — לכל מה שאתה לא רוצה בצלחת.', 'Template: Sin ___, por favor — for anything you don’t want on the plate.') },
  { id: 'es.phrase.rest.the-bill', text: 'La cuenta, por favor.', meaning: T('החשבון, בבקשה.', 'The bill, please.') },
  { id: 'es.phrase.rest.delicious', text: '¡Estaba delicioso!', meaning: T('זה היה טעים מאוד!', 'That was delicious!'),
    tip: T('מחמאה קטנה שקונה חיוך גדול.', 'A small compliment that buys a big smile.') },
  // hear
  { id: 'es.reply.rest.reservation', text: '¿Tiene reserva?', meaning: T('יש לכם הזמנה?', 'Do you have a reservation?') },
  { id: 'es.reply.rest.follow-me', text: 'Sígame, por favor.', meaning: T('בואו אחריי, בבקשה.', 'Follow me, please.') },
  { id: 'es.reply.rest.ready-to-order', text: '¿Están listos para pedir?', meaning: T('מוכנים להזמין?', 'Are you ready to order?') },
  { id: 'es.reply.rest.to-drink', text: '¿Algo de beber?', meaning: T('משהו לשתות?', 'Anything to drink?') },
  // Merged in from Restaurant Basics — same ids and wording, so earlier practice still counts.
  ...DAY12_ES_ITEMS.filter((i) => ['es.phrase.rest.ill-have', 'es.reply.rest.anything-else', 'es.reply.rest.everything-okay'].includes(i.id)),
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you', 'es.phrase.recovery.one-moment', 'es.phrase.recovery.dont-understand'),
];

const SCENE: BootcampDialogue = {
  id: 'sit-down-meal',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Buenas noches! ¿Tiene reserva?', tr: TR('Good evening! Do you have a reservation?', 'ערב טוב! יש לכם הזמנה?'), he: 'ערב טוב! יש לכם הזמנה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'No — una mesa para dos, por favor.', tr: TR('No — a table for two, please.', 'לא — שולחן לשניים, בבקשה.'), he: 'לא — שולחן לשניים, בבקשה.', itemId: 'es.phrase.rest.table-two', correct: true, next: 'n2' },
      { en: 'Perdón, no entiendo.', tr: TR("Sorry, I don't understand.", 'סליחה, אני לא מבין.'), he: 'סליחה, אני לא מבין.', itemId: 'es.phrase.recovery.dont-understand', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: '¿Una mesa? ¿Para cuántas personas?', tr: TR('A table? For how many people?', 'שולחן? לכמה אנשים?'), he: 'שולחן? לכמה אנשים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Una mesa para dos, por favor.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'es.phrase.rest.table-two', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'n2b', en: 'Perfecto, sígame. Aquí tienen las cartas.', tr: TR('Perfect, follow me. Here are your menus.', 'מצוין, בואו אחריי. הנה התפריטים.'), he: 'מצוין, בואו אחריי. הנה התפריטים.' },
    { id: 'n2b', who: 'npc', next: 'c2', en: '¿Están listos para pedir?', tr: TR('Are you ready to order?', 'מוכנים להזמין?'), he: 'מוכנים להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Voy a tomar el pollo, sin cebolla, por favor.', tr: TR("I'll have the chicken, without onions, please.", 'אני אקח את העוף, בלי בצל, בבקשה.'), he: 'אני אקח את העוף, בלי בצל, בבקשה.', itemId: 'es.phrase.rest.ill-have-chicken', correct: true, next: 'n3' },
      { en: 'Voy a tomar la pasta, por favor.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'es.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (צריך עוד רגע? לגיטימי)'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'n2b', en: 'Claro, tómense su tiempo.', tr: TR('Sure, take your time.', 'בטח, קחו את הזמן.'), he: 'בטח, קחו את הזמן.' },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Claro. ¿Algo de beber?', tr: TR('Of course. Anything to drink?', 'כמובן. משהו לשתות?'), he: 'כמובן. משהו לשתות?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Una botella de agua, por favor.', tr: TR('A bottle of water, please.', 'בקבוק מים, בבקשה.'), he: 'בקבוק מים, בבקשה.', itemId: 'es.phrase.rest.water', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', fast: true, next: 'c4', en: '¿Algo más?', tr: TR('Anything else?', 'עוד משהו?'), he: 'עוד משהו?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Eso es todo, gracias.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'n5b', en: '¡Enseguida se lo traigo!', tr: TR('Coming right up!', 'מגיע עוד רגע!'), he: 'מגיע עוד רגע!' },
    { id: 'n5b', who: 'npc', next: 'c5', cue: T('מאוחר יותר…', 'Later…'), en: '¿Va todo bien?', tr: TR('Is everything okay?', 'הכל בסדר?'), he: 'הכל בסדר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¡Sí, estaba delicioso! La cuenta, por favor.', tr: TR('Yes, that was delicious! The bill, please.', 'כן, היה טעים מאוד! החשבון, בבקשה.'), he: 'כן, היה טעים מאוד! החשבון, בבקשה.', itemId: 'es.phrase.rest.the-bill', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Me alegro de que les gustara. Aquí tienen — ¡que pasen buena noche!', tr: TR('So glad you enjoyed it. Here you are — have a lovely evening!', 'שמח שנהניתם. בבקשה — ערב נעים!'), he: 'שמח שנהניתם. בבקשה — ערב נעים!' },
  ],
};

export const DAY4_ES: BootcampDayContent = {
  day: 4,
  title: T('ארוחה במסעדה', 'Restaurant Meal'),
  items: DAY4_ES_ITEMS,
  dialogues: { 'sit-down-meal': SCENE },
  steps: [
    { kind: 'talk', icon: '🍽️', title: T('ארוחה במסעדה', 'Restaurant Meal'),
      body: [
        T('ארוחת ערב אמיתית: שולחן, תפריט, הזמנה, שתייה, חשבון.', 'A real dinner: table, menu, order, drink, bill.'),
        T('הבריח מתחיל ברגע שהמלצר מגיע ושואל שאלה. נכיר את השאלות מראש.', 'The freeze starts the second the waiter arrives with a question. We meet them in advance.'),
      ], cta: T('להיכנס למסעדה', 'Walk in') },
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('שמות המפתח של הארוחה — שאר המשפט כבר מוכר.', 'The meal’s key nouns — the rest of the sentence is already familiar.'),
      words: [
        { text: 'mesa', meaning: T('שולחן', 'table'), emoji: '🍽️' },
        { text: 'carta', meaning: T('תפריט', 'menu'), emoji: '📋' },
        { text: 'agua', meaning: T('מים', 'water'), emoji: '💧' },
        { text: 'cuenta', meaning: T('חשבון', 'bill'), emoji: '🧾' },
        { text: 'por favor', meaning: T('בבקשה', 'please') },
      ], buildFromItemId: 'es.phrase.rest.the-bill' },
    // From the key sentences onward the flow is shared by all languages: see practiceEveryday.ts.
    ...m14Flow('es'),
  ],
};
