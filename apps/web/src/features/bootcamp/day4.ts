import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampItem, BootcampDialogue } from './types.js';
import { DAY1_ITEMS } from './day1.js';

/**
 * Mission 4 — "Coffee Shop" (the Deep Moment exemplar, Sprint 7).
 * One situation, taken ALL the way: greeting → order → hot/cold → milk/sugar → to eat →
 * anything else → cash/card → receipt → goodbye. The user leaves able to order a real
 * breakfast — including every follow-up question a barista actually asks.
 */

const T = (he: string, en: string): LocalizedText => ({ he, en });

export const DAY4_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.coffee.iced-coffee', text: "I'd like an iced coffee, please.",
    meaning: T('אני רוצה קפה קר, בבקשה.', "I'd like an iced coffee, please."),
    tip: T('התבנית: I’d like ___, please — עובדת על הכל.', 'The template: I’d like ___, please — works for everything.') },
  { id: 'en.phrase.coffee.to-go', text: 'To go, please.',
    meaning: T('לקחת, בבקשה.', 'To go, please.') },
  { id: 'en.phrase.coffee.no-sugar', text: 'Milk, no sugar.',
    meaning: T('עם חלב, בלי סוכר.', 'Milk, no sugar.'),
    tip: T('עם = with · בלי = no/without. שתי מילים ששולטות בכל הזמנה.', 'with / no — two words that control every order.') },
  { id: 'en.phrase.coffee.croissant', text: 'A croissant, please.',
    meaning: T('קרואסון, בבקשה.', 'A croissant, please.'),
    tip: T('“Croissant” — מאפה חמאה צרפתי. כך בדיוק זה כתוב בתפריט בחו״ל.', '“Croissant” — a French pastry. That’s exactly how it’s written on the menu abroad.') },
  { id: 'en.phrase.coffee.thats-all', text: "That's all, thanks.",
    meaning: T('זה הכל, תודה.', "That's all, thanks."),
    tip: T('סוגר כל הזמנה בנימוס. עובד בכל מקום בעולם.', 'Closes any order politely. Works everywhere on earth.') },
  { id: 'en.phrase.coffee.card', text: 'Card, please.',
    meaning: T('בכרטיס, בבקשה.', 'Card, please.') },
  // hear — the expected replies (the barista question-chain)
  { id: 'en.reply.coffee.what-can-i-get', text: 'What can I get you?',
    meaning: T('מה להביא לך?', 'What can I get you?') },
  { id: 'en.reply.coffee.hot-or-iced', text: 'Hot or iced?',
    meaning: T('חם או קר?', 'Hot or iced?') },
  { id: 'en.reply.coffee.here-or-to-go', text: 'For here or to go?',
    meaning: T('לשבת כאן או לקחת?', 'For here or to go?') },
  { id: 'en.reply.coffee.medium-or-large', text: 'Medium or large?',
    meaning: T('בינוני או גדול?', 'Medium or large?') },
  { id: 'en.reply.coffee.milk-sugar', text: 'Milk and sugar?',
    meaning: T('חלב וסוכר?', 'Milk and sugar?') },
  { id: 'en.reply.coffee.anything-to-eat', text: 'Anything to eat?',
    meaning: T('משהו לאכול?', 'Anything to eat?') },
  { id: 'en.reply.coffee.anything-else', text: 'Would you like anything else?',
    meaning: T('עוד משהו?', 'Would you like anything else?') },
  { id: 'en.reply.coffee.cash-or-card', text: 'Cash or card?',
    meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'en.reply.coffee.receipt', text: 'Would you like the receipt?',
    meaning: T('רוצה את הקבלה?', 'Would you like the receipt?') },
  { id: 'en.reply.coffee.enjoy', text: 'Enjoy your day!',
    meaning: T('שיהיה לך יום מעולה!', 'Enjoy your day!') },
];

/** The full breakfast scene — every follow-up a real barista asks, one line at a time. */
const SCENE_BREAKFAST: BootcampDialogue = {
  id: 'breakfast-order',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Good morning! What can I get you?', he: 'בוקר טוב! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "I'd like an iced coffee, please.", he: 'אני רוצה קפה קר, בבקשה.', itemId: 'en.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה. (כלי הישרדות — תמיד עובד)', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Of course — take your time!', he: 'ברור — קח את הזמן!' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: "I'd like an iced coffee, please.", he: 'אני רוצה קפה קר, בבקשה.', itemId: 'en.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Sure! Medium or large?', he: 'סגור! בינוני או גדול?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Medium, please.', he: 'בינוני, בבקשה.', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה? (לא הבנת? תשאל!)', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'MEDIUM — or LARGE?', he: 'בינוני — או גדול?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Medium, please.', he: 'בינוני, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Milk and sugar?', he: 'חלב וסוכר?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Milk, no sugar.', he: 'עם חלב, בלי סוכר.', itemId: 'en.phrase.coffee.no-sugar', correct: true, next: 'n4' },
      { en: 'Thank you!', he: 'תודה! (רגע — הוא שאל שאלה…)', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: "You're welcome! But — milk? sugar?", he: 'בבקשה! אבל — חלב? סוכר?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Milk, no sugar.', he: 'עם חלב, בלי סוכר.', itemId: 'en.phrase.coffee.no-sugar', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Anything to eat?', he: 'משהו לאכול?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'A croissant, please.', he: 'קרואסון, בבקשה.', itemId: 'en.phrase.coffee.croissant', correct: true, next: 'n5' },
      { en: "That's all, thanks.", he: 'זה הכל, תודה. (גם זה בסדר גמור!)', itemId: 'en.phrase.coffee.thats-all', correct: true, next: 'n6' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Great choice. Would you like anything else?', he: 'בחירה מצוינת. עוד משהו?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: "That's all, thanks.", he: 'זה הכל, תודה.', itemId: 'en.phrase.coffee.thats-all', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', fast: true, next: 'c6', en: "That'll be six fifty. Cash or card?", he: 'שש חמישים בבקשה. מזומן או כרטיס?' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: 'Card, please.', he: 'בכרטיס, בבקשה.', itemId: 'en.phrase.coffee.card', correct: true, next: 'n7' },
      { en: 'Please speak slowly.', he: 'דבר לאט בבקשה. (המספר ברח לך? לגיטימי)', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r6' },
    ] },
    { id: 'r6', who: 'npc', slow: true, next: 'c6b', en: 'Six — fifty. Cash, or card?', he: 'שש — חמישים. מזומן או כרטיס?' },
    { id: 'c6b', who: 'you', en: '', he: '', choices: [
      { en: 'Card, please.', he: 'בכרטיס, בבקשה.', itemId: 'en.phrase.coffee.card', correct: true, next: 'n7' },
    ] },
    { id: 'n7', who: 'npc', next: 'c7', en: 'Would you like the receipt?', he: 'רוצה את הקבלה?' },
    { id: 'c7', who: 'you', en: '', he: '', choices: [
      { en: 'No, thank you!', he: 'לא, תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n8' },
      { en: 'Yes, please.', he: 'כן, בבקשה.', correct: true, next: 'n8' },
    ] },
    { id: 'n8', who: 'npc', end: true, en: 'Here you go — enjoy your day!', he: 'בבקשה — שיהיה יום מעולה!' },
  ],
};

/** Recovery tools reused inside this mission's scene — imported so every reference
 *  resolves AND the kit gets spaced review inside a real context. */
const REUSED_RECOVERY = DAY1_ITEMS.filter((i) =>
  ['en.phrase.recovery.one-moment', 'en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'].includes(i.id),
);

export const DAY4: BootcampDayContent = {
  day: 4,
  title: T('בית קפה', 'Coffee Shop'),
  items: [...DAY4_ITEMS, ...REUSED_RECOVERY],
  dialogues: { 'breakfast-order': SCENE_BREAKFAST },
  introVideo: {
    src: '/videos/En_day4.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'en',
    type: 'intro',
  },
  steps: [
    { kind: 'talk', icon: '☕', title: T('משימה 4: בית קפה', 'Mission 4: Coffee Shop'),
      body: [
        T('היום לא לומדים "מילים על קפה". היום לומדים לצאת מבית קפה עם ארוחת בוקר ביד.', 'Today we don’t learn “coffee words”. Today you walk out of a café holding breakfast.'),
        T('הסוד: אחרי שאתה מזמין, הבריסטה שואל שאלות המשך. מי שמכיר אותן מראש — אף פעם לא קופא.', 'The secret: after you order, the barista fires follow-up questions. Know them in advance — never freeze.'),
      ], cta: T('להיכנס', 'Walk in') },
    { kind: 'tool', itemId: 'en.phrase.coffee.iced-coffee', index: 1, total: 4, label: T('משפט הזהב', 'The golden template') },
    { kind: 'tool', itemId: 'en.phrase.coffee.no-sugar', index: 2, total: 4, label: T('שליטה בהזמנה', 'Order control') },
    { kind: 'tool', itemId: 'en.phrase.coffee.thats-all', index: 3, total: 4, label: T('הסוגר האוניברסלי', 'The universal closer') },
    { kind: 'tool', itemId: 'en.phrase.coffee.card', index: 4, total: 4, label: T('סוגרים חשבון', 'Settling up') },
    { kind: 'replies', saidItemId: 'en.phrase.coffee.iced-coffee',
      replyIds: ['en.reply.coffee.here-or-to-go', 'en.reply.coffee.medium-or-large', 'en.reply.coffee.milk-sugar', 'en.reply.coffee.anything-else'] },
    { kind: 'receipt', text: T('אתה כבר מזהה את ארבע שאלות ההמשך של כל בריסטה בעולם.', 'You now recognize the four follow-ups of every barista on earth.') },
    { kind: 'quiz', itemId: 'en.reply.coffee.cash-or-card', wrongIds: ['en.reply.coffee.anything-to-eat', 'en.reply.coffee.receipt'] },
    { kind: 'quiz', itemId: 'en.reply.coffee.anything-to-eat', wrongIds: ['en.reply.coffee.hot-or-iced', 'en.reply.coffee.enjoy'] },
    { kind: 'dialogue', dialogueId: 'breakfast-order' },
    { kind: 'receipt', text: T('הזמנת ארוחת בוקר שלמה: שתייה, גודל, חלב, מאפה, תשלום. הכל.', 'You ordered a full breakfast: drink, size, milk, pastry, payment. All of it.') },
    { kind: 'swipe', itemIds: [...DAY4_ITEMS, ...REUSED_RECOVERY].map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Sorry we are out of croissants would a muffin be okay instead?', he: 'סליחה, נגמרו הקרואסונים — מאפין במקום זה בסדר?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.coffee.card' },
    { kind: 'receipt', text: T('הפתעה מחוץ לתסריט — והגבת עם כלי. זה בדיוק מה שקורה בעולם האמיתי.', 'An off-script surprise — and you answered with a tool. Exactly how real life works.') },
    { kind: 'summary' },
  ],
};
