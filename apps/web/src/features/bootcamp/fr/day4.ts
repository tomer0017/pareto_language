import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { DAY12_FR_ITEMS } from './day12.js';
import { m14Flow } from '../practiceEveryday.js';

/**
 * French Mission 4 — "Repas au restaurant" (Restaurant Meal). French parallel of English mission 4:
 * same objective (table → menu → order → drink → bill), same step structure, same engine. French
 * target lines + `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY4_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.rest.table-two', text: 'Une table pour deux, s’il vous plaît.', meaning: T('שולחן לשניים, בבקשה.', 'A table for two, please.'),
    tip: T('הפתיח למסעדה. התבנית: Une table pour ___.', 'The restaurant opener. Template: Une table pour ___.') },
  { id: 'fr.phrase.rest.ill-have-chicken', text: 'Je vais prendre le poulet.', meaning: T('אני אקח את העוף.', "I'll have the chicken."),
    tip: T('תבנית ההזמנה: Je vais prendre ___.', 'The ordering template: Je vais prendre ___.') },
  { id: 'fr.phrase.rest.water', text: 'Une bouteille d’eau, s’il vous plaît.', meaning: T('בקבוק מים, בבקשה.', 'A bottle of water, please.') },
  { id: 'fr.phrase.rest.no-onions', text: 'Sans oignons, s’il vous plaît.', meaning: T('בלי בצל, בבקשה.', 'No onions, please.'),
    tip: T('תבנית: Sans ___, s’il vous plaît — לכל מה שאתה לא רוצה בצלחת.', 'Template: Sans ___, s’il vous plaît — for anything you don’t want on the plate.') },
  { id: 'fr.phrase.rest.the-bill', text: 'L’addition, s’il vous plaît.', meaning: T('החשבון, בבקשה.', 'The bill, please.') },
  { id: 'fr.phrase.rest.delicious', text: 'C’était délicieux !', meaning: T('זה היה טעים מאוד!', 'That was delicious!'),
    tip: T('מחמאה קטנה שקונה חיוך גדול.', 'A small compliment that buys a big smile.') },
  // hear
  { id: 'fr.reply.rest.reservation', text: 'Vous avez une réservation ?', meaning: T('יש לכם הזמנה?', 'Do you have a reservation?') },
  { id: 'fr.reply.rest.follow-me', text: 'Suivez-moi, s’il vous plaît.', meaning: T('בואו אחריי, בבקשה.', 'Follow me, please.') },
  { id: 'fr.reply.rest.ready-to-order', text: 'Vous êtes prêts à commander ?', meaning: T('מוכנים להזמין?', 'Are you ready to order?') },
  { id: 'fr.reply.rest.to-drink', text: 'Quelque chose à boire ?', meaning: T('משהו לשתות?', 'Anything to drink?') },
  // Merged in from Restaurant Basics — same ids and wording, so earlier practice still counts.
  ...DAY12_FR_ITEMS.filter((i) => ['fr.phrase.rest.ill-have', 'fr.reply.rest.anything-else', 'fr.reply.rest.everything-okay'].includes(i.id)),
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you', 'fr.phrase.recovery.one-moment', 'fr.phrase.recovery.dont-understand'),
];

const SCENE: BootcampDialogue = {
  id: 'sit-down-meal',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonsoir ! Vous avez une réservation ?', tr: TR('Good evening! Do you have a reservation?', 'ערב טוב! יש לכם הזמנה?'), he: 'ערב טוב! יש לכם הזמנה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Non — une table pour deux, s’il vous plaît.', tr: TR('No — a table for two, please.', 'לא — שולחן לשניים, בבקשה.'), he: 'לא — שולחן לשניים, בבקשה.', itemId: 'fr.phrase.rest.table-two', correct: true, next: 'n2' },
      { en: 'Désolé, je ne comprends pas.', tr: TR("Sorry, I don't understand.", 'סליחה, אני לא מבין.'), he: 'סליחה, אני לא מבין.', itemId: 'fr.phrase.recovery.dont-understand', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Une table ? Pour combien de personnes ?', tr: TR('A table? For how many people?', 'שולחן? לכמה אנשים?'), he: 'שולחן? לכמה אנשים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Une table pour deux, s’il vous plaît.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'fr.phrase.rest.table-two', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'n2b', en: 'Parfait, suivez-moi. Voici vos menus.', tr: TR('Perfect, follow me. Here are your menus.', 'מצוין, בואו אחריי. הנה התפריטים.'), he: 'מצוין, בואו אחריי. הנה התפריטים.' },
    { id: 'n2b', who: 'npc', next: 'c2', en: 'Vous êtes prêts à commander ?', tr: TR('Are you ready to order?', 'מוכנים להזמין?'), he: 'מוכנים להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais prendre le poulet, sans oignons, s’il vous plaît.', tr: TR("I'll have the chicken, without onions, please.", 'אני אקח את העוף, בלי בצל, בבקשה.'), he: 'אני אקח את העוף, בלי בצל, בבקשה.', itemId: 'fr.phrase.rest.ill-have-chicken', correct: true, next: 'n3' },
      { en: 'Je vais prendre les pâtes, s’il vous plaît.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'fr.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (צריך עוד רגע? לגיטימי)'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'n2b', en: 'Bien sûr, prenez votre temps.', tr: TR('Sure, take your time.', 'בטח, קחו את הזמן.'), he: 'בטח, קחו את הזמן.' },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Bien sûr. Quelque chose à boire ?', tr: TR('Of course. Anything to drink?', 'כמובן. משהו לשתות?'), he: 'כמובן. משהו לשתות?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Une bouteille d’eau, s’il vous plaît.', tr: TR('A bottle of water, please.', 'בקבוק מים, בבקשה.'), he: 'בקבוק מים, בבקשה.', itemId: 'fr.phrase.rest.water', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', fast: true, next: 'c4', en: 'Autre chose ?', tr: TR('Anything else?', 'עוד משהו?'), he: 'עוד משהו?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'C’est tout, merci.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'n5b', en: 'Ça arrive tout de suite !', tr: TR('Coming right up!', 'מגיע עוד רגע!'), he: 'מגיע עוד רגע!' },
    { id: 'n5b', who: 'npc', next: 'c5', cue: T('מאוחר יותר…', 'Later…'), en: 'Tout va bien ?', tr: TR('Is everything okay?', 'הכל בסדר?'), he: 'הכל בסדר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', tr: TR('Yes, that was delicious! The bill, please.', 'כן, היה טעים מאוד! החשבון, בבקשה.'), he: 'כן, היה טעים מאוד! החשבון, בבקשה.', itemId: 'fr.phrase.rest.the-bill', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Ravi que ça vous ait plu. Voici — passez une bonne soirée !', tr: TR('So glad you enjoyed it. Here you are — have a lovely evening!', 'שמח שנהניתם. בבקשה — ערב נעים!'), he: 'שמח שנהניתם. בבקשה — ערב נעים!' },
  ],
};

export const DAY4_FR: BootcampDayContent = {
  day: 4,
  title: T('ארוחה במסעדה', 'Restaurant Meal'),
  items: DAY4_FR_ITEMS,
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
        { text: 'table', meaning: T('שולחן', 'table'), emoji: '🍽️' },
        { text: 'menu', meaning: T('תפריט', 'menu'), emoji: '📋' },
        { text: 'eau', meaning: T('מים', 'water'), emoji: '💧' },
        { text: 'addition', meaning: T('חשבון', 'bill'), emoji: '🧾' },
        { text: 's’il vous plaît', meaning: T('בבקשה', 'please') },
      ], buildFromItemId: 'fr.phrase.rest.the-bill' },
    // From the key sentences onward the flow is shared by all languages: see practiceEveryday.ts.
    ...m14Flow('fr'),
  ],
};
