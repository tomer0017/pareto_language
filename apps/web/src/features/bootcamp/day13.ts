import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 13 — "Restaurant Basics" (Phase 3 · Food, the deep exemplar).
 * One situation taken ALL the way: greeting → table → menu → drinks → order →
 * recommendation → waiter's follow-ups → the bill → goodbye. You leave able to sit down
 * at a real restaurant and run the whole thing yourself. Depth before breadth.
 */
export const DAY13_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.rest.table-for-two', text: 'A table for two, please.', meaning: T('שולחן לשניים, בבקשה.', 'A table for two, please.'),
    tip: T('התבנית: A table for ___ — פשוט מספר. for one / for four.', 'Template: A table for ___ — just a number. for one / for four.') },
  { id: 'en.phrase.rest.menu-please', text: 'Could we see the menu?', meaning: T('אפשר לראות את התפריט?', 'Could we see the menu?') },
  { id: 'en.phrase.rest.ill-have', text: "I'll have the pasta, please.", meaning: T('אני אקח את הפסטה, בבקשה.', "I'll have the pasta, please."),
    tip: T('התבנית הגדולה של המסעדה: I’ll have the ___ — מזמינים כל דבר בתפריט.', 'The restaurant’s big template: I’ll have the ___ — order anything on the menu.') },
  { id: 'en.phrase.rest.recommend', text: 'What do you recommend?', meaning: T('מה אתה ממליץ?', 'What do you recommend?'),
    tip: T('אם התפריט מבלבל — תן למלצר להחליט. תמיד עובד.', 'If the menu confuses you — let the waiter decide. Always works.') },
  { id: 'en.phrase.rest.water-please', text: 'A bottle of water, please.', meaning: T('בקבוק מים, בבקשה.', 'A bottle of water, please.') },
  { id: 'en.phrase.rest.bill-please', text: 'Could we have the bill, please?', meaning: T('אפשר את החשבון, בבקשה?', 'Could we have the bill, please?'),
    tip: T('המשפט שסוגר כל ארוחה. באנגליה: bill · באמריקה: check.', 'The line that closes every meal. UK: bill · US: check.') },
  // hear — the waiter's chain
  { id: 'en.reply.rest.how-many', text: 'How many people?', meaning: T('כמה אנשים?', 'How many people?') },
  { id: 'en.reply.rest.something-drink', text: 'Something to drink?', meaning: T('משהו לשתות?', 'Something to drink?') },
  { id: 'en.reply.rest.ready-order', text: 'Are you ready to order?', meaning: T('מוכנים להזמין?', 'Are you ready to order?') },
  { id: 'en.reply.rest.anything-else', text: 'Anything else?', meaning: T('עוד משהו?', 'Anything else?') },
  { id: 'en.reply.rest.everything-okay', text: 'Is everything okay?', meaning: T('הכל בסדר?', 'Is everything okay?') },
  { id: 'en.reply.rest.enjoy-meal', text: 'Enjoy your meal!', meaning: T('בתיאבון!', 'Enjoy your meal!') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.one-moment', 'en.phrase.recovery.thank-you'),
];

const SCENE_DINNER: BootcampDialogue = {
  id: 'restaurant-dinner',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Good evening, welcome! How many people?', he: 'ערב טוב, ברוכים הבאים! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'A table for two, please.', he: 'שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה. (כלי — לספור כמה אתם)', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'No problem — how many people?', he: 'אין בעיה — כמה אנשים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'A table for two, please.', he: 'שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-for-two', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Perfect, right this way. Here are your menus. Something to drink?', he: 'מצוין, בבקשה אחריי. הנה התפריטים. משהו לשתות?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'A bottle of water, please.', he: 'בקבוק מים, בבקשה.', itemId: 'en.phrase.rest.water-please', correct: true, next: 'n3' },
      { en: 'Could we see the menu?', he: 'אפשר לראות את התפריט? (הוא בדיוק נתן — הקשב)', itemId: 'en.phrase.rest.menu-please', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: "The menus are right there in front of you — anything to drink first?", he: 'התפריטים ממש מולך — משהו לשתות קודם?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'A bottle of water, please.', he: 'בקבוק מים, בבקשה.', itemId: 'en.phrase.rest.water-please', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "Great. I'll give you a minute… Are you ready to order?", he: 'יופי. אתן לכם רגע… מוכנים להזמין?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: "I'll have the pasta, please.", he: 'אני אקח את הפסטה, בבקשה.', itemId: 'en.phrase.rest.ill-have', correct: true, next: 'n4' },
      { en: 'What do you recommend?', he: 'מה אתה ממליץ? (מהלך חכם כשמתלבטים)', itemId: 'en.phrase.rest.recommend', correct: true, next: 'n3b' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: 'The seafood pasta is our best — very fresh today.', he: 'פסטת פירות הים היא הכי טובה שלנו — טרייה מאוד היום.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: "I'll have the pasta, please.", he: 'אני אקח את הפסטה, בבקשה.', itemId: 'en.phrase.rest.ill-have', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', fast: true, next: 'c4', en: 'Excellent choice. Anything else?', he: 'בחירה מצוינת. עוד משהו?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: "That's all, thanks.", he: 'זה הכל, תודה.', correct: true, next: 'n5' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'Would you like — anything else?', he: 'תרצו — עוד משהו?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: "That's all, thanks.", he: 'זה הכל, תודה.', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Here you are. Enjoy your meal!… Is everything okay?', he: 'בבקשה. בתיאבון!… הכל בסדר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Yes, thank you!', he: 'כן, תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Is — everything — okay with the food?', he: 'הכל — בסדר — עם האוכל?' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Yes, thank you!', he: 'כן, תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', next: 'c6', en: 'Wonderful. Let me know when you need anything.', he: 'נהדר. תגידו לי כשתצטרכו משהו.' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: 'Could we have the bill, please?', he: 'אפשר את החשבון, בבקשה?', itemId: 'en.phrase.rest.bill-please', correct: true, next: 'n7' },
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה.', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'r6' },
    ] },
    { id: 'r6', who: 'npc', slow: true, next: 'c6b', en: 'Of course — take your time.', he: 'כמובן — קחו את הזמן.' },
    { id: 'c6b', who: 'you', en: '', he: '', choices: [
      { en: 'Could we have the bill, please?', he: 'אפשר את החשבון, בבקשה?', itemId: 'en.phrase.rest.bill-please', correct: true, next: 'n7' },
    ] },
    { id: 'n7', who: 'npc', end: true, en: "Here's the bill. Thank you, and have a lovely evening!", he: 'הנה החשבון. תודה, וערב נפלא!' },
  ],
};

export const DAY13: BootcampDayContent = {
  day: 13,
  title: T('מסעדה — בסיס', 'Restaurant Basics'),
  items: DAY13_ITEMS,
  dialogues: { 'restaurant-dinner': SCENE_DINNER },
  steps: [
    { kind: 'talk', icon: '🍽️', title: T('משימה 13: מסעדה — בסיס', 'Mission 13: Restaurant Basics'),
      body: [
        T('לב הטיול הוא ארוחת ערב. היום לא לומדים "מילים על אוכל" — לומדים לנהל מסעדה שלמה.', 'The heart of travel is dinner. Today we don’t learn “food words” — we learn to run a whole restaurant.'),
        T('משולחן, דרך תפריט, הזמנה ושאלות המלצר — ועד החשבון. מקצה לקצה.', 'From the table, through the menu, the order, and the waiter’s questions — all the way to the bill. End to end.'),
      ], cta: T('להיכנס למסעדה', 'Walk into the restaurant') },
    { kind: 'tool', itemId: 'en.phrase.rest.table-for-two', index: 1, total: 4, label: T('להשיג שולחן', 'Get a table') },
    { kind: 'tool', itemId: 'en.phrase.rest.ill-have', index: 2, total: 4, label: T('תבנית ההזמנה', 'The ordering template') },
    { kind: 'tool', itemId: 'en.phrase.rest.recommend', index: 3, total: 4, label: T('כשמתלבטים', 'When unsure') },
    { kind: 'tool', itemId: 'en.phrase.rest.bill-please', index: 4, total: 4, label: T('לסגור חשבון', 'Close the bill') },
    { kind: 'replies', saidItemId: 'en.phrase.rest.ill-have',
      replyIds: ['en.reply.rest.something-drink', 'en.reply.rest.ready-order', 'en.reply.rest.anything-else', 'en.reply.rest.everything-okay'] },
    { kind: 'receipt', text: T('אתה מזהה את כל שאלות המלצר — לפני, במהלך, ואחרי הארוחה.', 'You recognize every waiter question — before, during, and after the meal.') },
    { kind: 'quiz', itemId: 'en.reply.rest.ready-order', wrongIds: ['en.reply.rest.something-drink', 'en.reply.rest.enjoy-meal'] },
    { kind: 'quiz', itemId: 'en.reply.rest.how-many', wrongIds: ['en.reply.rest.anything-else', 'en.reply.rest.everything-okay'] },
    { kind: 'dialogue', dialogueId: 'restaurant-dinner' },
    { kind: 'receipt', text: T('ניהלת ארוחת ערב שלמה באנגלית — שולחן, הזמנה, המלצה, חשבון.', 'You ran a full dinner in English — table, order, recommendation, bill.') },
    { kind: 'swipe', itemIds: DAY13_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'And how would you like that cooked — rare, medium, or well done?', he: 'ואיך תרצה שיהיה מבושל — נא, בינוני, או עשוי היטב?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.rest.bill-please' },
    { kind: 'receipt', text: T('המלצר ירה שלוש אפשרויות במהירות — וביקשת שיאט במקום לנחש.', 'The waiter fired three options fast — and you asked him to slow down instead of guessing.') },
    { kind: 'summary' },
  ],
};
