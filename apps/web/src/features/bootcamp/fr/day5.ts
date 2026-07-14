import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 5 — "Repas au restaurant" (Restaurant Meal). French parallel of English day 5:
 * same objective (table → menu → order → drink → bill), same step structure, same engine. French
 * target lines + `tr:{en,he}` glosses; `fr.*` ids. Full-conversation video (Fr_day5.mp4). AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY5_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.rest.table-two', text: 'Une table pour deux, s’il vous plaît.', meaning: T('שולחן לשניים, בבקשה.', 'A table for two, please.'),
    tip: T('הפתיח למסעדה. התבנית: Une table pour ___.', 'The restaurant opener. Template: Une table pour ___.') },
  { id: 'fr.phrase.rest.menu', text: 'La carte, s’il vous plaît.', meaning: T('התפריט, בבקשה.', 'The menu, please.') },
  { id: 'fr.phrase.rest.ill-have', text: 'Je vais prendre le poulet.', meaning: T('אני אקח את העוף.', "I'll have the chicken."),
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
  { id: 'fr.reply.rest.how-was-it', text: 'Tout s’est bien passé ?', meaning: T('איך היה הכל?', 'How was everything?') },
  { id: 'fr.reply.rest.dessert', text: 'Vous voulez un dessert ?', meaning: T('רוצים קינוח?', 'Would you like dessert?') },
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
      { en: 'Je vais prendre le poulet.', tr: TR("I'll have the chicken.", 'אני אקח את העוף.'), he: 'אני אקח את העוף.', itemId: 'fr.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (צריך עוד רגע? לגיטימי)'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'n2b', en: 'Bien sûr, prenez votre temps.', tr: TR('Sure, take your time.', 'בטח, קחו את הזמן.'), he: 'בטח, קחו את הזמן.' },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Excellent choix. Quelque chose à boire ?', tr: TR('Excellent choice. Anything to drink?', 'בחירה מצוינת. משהו לשתות?'), he: 'בחירה מצוינת. משהו לשתות?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Une bouteille d’eau, s’il vous plaît.', tr: TR('A bottle of water, please.', 'בקבוק מים, בבקשה.'), he: 'בקבוק מים, בבקשה.', itemId: 'fr.phrase.rest.water', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', fast: true, next: 'c4', en: 'Très bien — et avec ça, vous voulez autre chose ?', tr: TR('Great — and would you like anything else with that?', 'מצוין — ורוצים עוד משהו עם זה?'), he: 'מצוין — ורוצים עוד משהו עם זה?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Sans oignons, s’il vous plaît.', tr: TR('No onions, please.', 'בלי בצל, בבקשה.'), he: 'בלי בצל, בבקשה.', itemId: 'fr.phrase.rest.no-onions', correct: true, next: 'n5' },
      { en: 'C’est tout, merci.', tr: TR("That's all, thank you.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'n5b', en: 'Ça arrive tout de suite !', tr: TR('Coming right up!', 'מגיע עוד רגע!'), he: 'מגיע עוד רגע!' },
    { id: 'n5b', who: 'npc', next: 'c5', en: '…Plus tard… Tout s’est bien passé ?', tr: TR('…Later… How was everything?', '…אחר כך… איך היה הכל?'), he: '…אחר כך… איך היה הכל?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'C’était délicieux ! L’addition, s’il vous plaît.', tr: TR('That was delicious! The bill, please.', 'זה היה טעים מאוד! החשבון, בבקשה.'), he: 'זה היה טעים מאוד! החשבון, בבקשה.', itemId: 'fr.phrase.rest.the-bill', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Ravi que ça vous ait plu. Voici — passez une bonne soirée !', tr: TR('So glad you enjoyed it. Here you are — have a lovely evening!', 'שמח שנהניתם. בבקשה — ערב נעים!'), he: 'שמח שנהניתם. בבקשה — ערב נעים!' },
  ],
};

export const DAY5_FR: BootcampDayContent = {
  day: 5,
  title: T('ארוחה במסעדה', 'Restaurant Meal'),
  items: DAY5_FR_ITEMS,
  dialogues: { 'sit-down-meal': SCENE },
  introVideo: {
    src: '/videos/Fr_day5.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'fr',
    type: 'intro',
  },
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
        { text: 'carte', meaning: T('תפריט', 'menu'), emoji: '📋' },
        { text: 'eau', meaning: T('מים', 'water'), emoji: '💧' },
        { text: 'addition', meaning: T('חשבון', 'bill'), emoji: '🧾' },
        { text: 's’il vous plaît', meaning: T('בבקשה', 'please'), review: true },
      ], buildFromItemId: 'fr.phrase.rest.the-bill' },
    { kind: 'tool', itemId: 'fr.phrase.rest.table-two', index: 1, total: 4, label: T('הפתיח', 'The opener') },
    { kind: 'tool', itemId: 'fr.phrase.rest.ill-have', index: 2, total: 4, label: T('להזמין', 'Order it') },
    { kind: 'tool', itemId: 'fr.phrase.rest.no-onions', index: 3, total: 4, label: T('בקשה מיוחדת', 'Special request') },
    { kind: 'tool', itemId: 'fr.phrase.rest.the-bill', index: 4, total: 4, label: T('לסגור', 'Close it out') },
    { kind: 'replies', saidItemId: 'fr.phrase.rest.ill-have',
      replyIds: ['fr.reply.rest.to-drink', 'fr.reply.rest.ready-to-order', 'fr.reply.rest.how-was-it', 'fr.reply.rest.dessert'] },
    { kind: 'receipt', text: T('אתה מזהה את כל שאלות המלצר — לפני שהן מפתיעות אותך.', 'You recognize every waiter question — before it can surprise you.') },
    { kind: 'quiz', itemId: 'fr.reply.rest.reservation', wrongIds: ['fr.reply.rest.ready-to-order', 'fr.reply.rest.dessert'] },
    { kind: 'dialogue', dialogueId: 'sit-down-meal' },
    { kind: 'receipt', text: T('ארוחת ערב שלמה: משולחן ועד חשבון, כולל בקשה מיוחדת.', 'A full dinner: from table to bill, special request included.') },
    { kind: 'swipe', itemIds: DAY5_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Vous voulez voir la carte des desserts avant que j’apporte l’addition ?', tr: TR('Would you like to see the dessert menu before I bring the check?', 'רוצים לראות את תפריט הקינוחים לפני שאני מביא את החשבון?'), he: 'רוצים לראות את תפריט הקינוחים לפני שאני מביא את החשבון?' },
      correctItemId: 'fr.reply.rest.dessert', wrongItemId: 'fr.reply.rest.reservation' },
    { kind: 'receipt', text: T('משפט ארוך ומהיר בסוף הארוחה — והבנת את העיקר.', 'A long, fast sentence at the end of the meal — and you caught the point.') },
    { kind: 'summary' },
  ],
};
