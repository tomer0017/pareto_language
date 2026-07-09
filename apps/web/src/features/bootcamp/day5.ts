import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/** Mission 5 — "Restaurant Basics" (real objective: table to bill, a full sit-down meal). */
export const DAY5_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.rest.table-two', text: 'A table for two, please.', meaning: T('שולחן לשניים, בבקשה.', 'A table for two, please.'),
    tip: T('הפתיח למסעדה. תבנית: a table for ___.', 'The restaurant opener. Template: a table for ___.') },
  { id: 'en.phrase.rest.menu', text: 'The menu, please.', meaning: T('התפריט, בבקשה.', 'The menu, please.') },
  { id: 'en.phrase.rest.ill-have', text: "I'll have the chicken.", meaning: T('אני אקח את העוף.', "I'll have the chicken."),
    tip: T('תבנית ההזמנה: I’ll have the ___.', 'The ordering template: I’ll have the ___.') },
  { id: 'en.phrase.rest.water', text: 'A bottle of water, please.', meaning: T('בקבוק מים, בבקשה.', 'A bottle of water, please.') },
  { id: 'en.phrase.rest.no-onions', text: 'No onions, please.', meaning: T('בלי בצל, בבקשה.', 'No onions, please.'),
    tip: T('תבנית: No ___, please — לכל מה שאתה לא רוצה בצלחת.', 'Template: No ___, please — for anything you don’t want on the plate.') },
  { id: 'en.phrase.rest.the-bill', text: 'The bill, please.', meaning: T('החשבון, בבקשה.', 'The bill, please.') },
  { id: 'en.phrase.rest.delicious', text: 'That was delicious!', meaning: T('זה היה טעים מאוד!', 'That was delicious!'),
    tip: T('מחמאה קטנה שקונה חיוך גדול.', 'A small compliment that buys a big smile.') },
  // hear
  { id: 'en.reply.rest.reservation', text: 'Do you have a reservation?', meaning: T('יש לכם הזמנה?', 'Do you have a reservation?') },
  { id: 'en.reply.rest.follow-me', text: 'Follow me, please.', meaning: T('בואו אחריי, בבקשה.', 'Follow me, please.') },
  { id: 'en.reply.rest.ready-to-order', text: 'Are you ready to order?', meaning: T('מוכנים להזמין?', 'Are you ready to order?') },
  { id: 'en.reply.rest.to-drink', text: 'Anything to drink?', meaning: T('משהו לשתות?', 'Anything to drink?') },
  { id: 'en.reply.rest.how-was-it', text: 'How was everything?', meaning: T('איך היה הכל?', 'How was everything?') },
  { id: 'en.reply.rest.dessert', text: 'Would you like dessert?', meaning: T('רוצים קינוח?', 'Would you like dessert?') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you', 'en.phrase.recovery.one-moment', 'en.phrase.recovery.dont-understand'),
];

const SCENE: BootcampDialogue = {
  id: 'sit-down-meal',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Good evening! Do you have a reservation?', he: 'ערב טוב! יש לכם הזמנה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'No — a table for two, please.', he: 'לא — שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-two', correct: true, next: 'n2' },
      { en: 'Sorry, I don’t understand.', he: 'סליחה, אני לא מבין.', itemId: 'en.phrase.recovery.dont-understand', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'A table? For how many people?', he: 'שולחן? לכמה אנשים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'A table for two, please.', he: 'שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-two', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'n2b', en: 'Perfect, follow me. Here are your menus.', he: 'מצוין, בואו אחריי. הנה התפריטים.' },
    { id: 'n2b', who: 'npc', next: 'c2', en: 'Are you ready to order?', he: 'מוכנים להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'll have the chicken.", he: 'אני אקח את העוף.', itemId: 'en.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה. (צריך עוד רגע? לגיטימי)', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'n2b', en: 'Sure, take your time.', he: 'בטח, קחו את הזמן.' },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Excellent choice. Anything to drink?', he: 'בחירה מצוינת. משהו לשתות?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'A bottle of water, please.', he: 'בקבוק מים, בבקשה.', itemId: 'en.phrase.rest.water', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', fast: true, next: 'c4', en: 'Great — and would you like anything else with that?', he: 'מצוין — ורוצים עוד משהו עם זה?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'No onions, please.', he: 'בלי בצל, בבקשה.', itemId: 'en.phrase.rest.no-onions', correct: true, next: 'n5' },
      { en: "That's all, thank you.", he: 'זה הכל, תודה.', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'n5b', en: 'Coming right up!', he: 'מגיע עוד רגע!' },
    { id: 'n5b', who: 'npc', next: 'c5', en: '…Later… How was everything?', he: '…אחר כך… איך היה הכל?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'That was delicious! The bill, please.', he: 'זה היה טעים מאוד! החשבון, בבקשה.', itemId: 'en.phrase.rest.the-bill', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'So glad you enjoyed it. Here you are — have a lovely evening!', he: 'שמח שנהניתם. בבקשה — ערב נעים!' },
  ],
};

export const DAY5: BootcampDayContent = {
  day: 5,
  title: T('ארוחה במסעדה', 'Restaurant Meal'),
  items: DAY5_ITEMS,
  dialogues: { 'sit-down-meal': SCENE },
  steps: [
    { kind: 'talk', icon: '🍽️', title: T('ארוחה במסעדה', 'Restaurant Meal'),
      body: [
        T('ארוחת ערב אמיתית: שולחן, תפריט, הזמנה, שתייה, חשבון.', 'A real dinner: table, menu, order, drink, bill.'),
        T('הבריח מתחיל ברגע שהמלצר מגיע ושואל שאלה. נכיר את השאלות מראש.', 'The freeze starts the second the waiter arrives with a question. We meet them in advance.'),
      ], cta: T('להיכנס למסעדה', 'Walk in') },
    { kind: 'tool', itemId: 'en.phrase.rest.table-two', index: 1, total: 4, label: T('הפתיח', 'The opener') },
    { kind: 'tool', itemId: 'en.phrase.rest.ill-have', index: 2, total: 4, label: T('להזמין', 'Order it') },
    { kind: 'tool', itemId: 'en.phrase.rest.no-onions', index: 3, total: 4, label: T('בקשה מיוחדת', 'Special request') },
    { kind: 'tool', itemId: 'en.phrase.rest.the-bill', index: 4, total: 4, label: T('לסגור', 'Close it out') },
    { kind: 'replies', saidItemId: 'en.phrase.rest.ill-have',
      replyIds: ['en.reply.rest.to-drink', 'en.reply.rest.ready-to-order', 'en.reply.rest.how-was-it', 'en.reply.rest.dessert'] },
    { kind: 'receipt', text: T('אתה מזהה את כל שאלות המלצר — לפני שהן מפתיעות אותך.', 'You recognize every waiter question — before it can surprise you.') },
    { kind: 'quiz', itemId: 'en.reply.rest.reservation', wrongIds: ['en.reply.rest.ready-to-order', 'en.reply.rest.dessert'] },
    { kind: 'dialogue', dialogueId: 'sit-down-meal' },
    { kind: 'receipt', text: T('ארוחת ערב שלמה: משולחן ועד חשבון, כולל בקשה מיוחדת.', 'A full dinner: from table to bill, special request included.') },
    { kind: 'swipe', itemIds: DAY5_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Would you like to see the dessert menu before I bring the check?', he: 'רוצים לראות את תפריט הקינוחים לפני שאני מביא את החשבון?' },
      correctItemId: 'en.reply.rest.dessert', wrongItemId: 'en.reply.rest.reservation' },
    { kind: 'receipt', text: T('משפט ארוך ומהיר בסוף הארוחה — והבנת את העיקר.', 'A long, fast sentence at the end of the meal — and you caught the point.') },
    { kind: 'summary' },
  ],
};
void RECOVERY_ITEMS;
