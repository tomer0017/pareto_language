import { T, recovery } from './recovery.js';
import { DAY4_ITEMS } from './day4.js';
import { DAY13_ITEMS } from './day13.js';
import { DAY16_ITEMS } from './day16.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 18 — "Food Day Checkpoint" (Phase 3, cold integration, no new content).
 * A full food day cold: coffee morning → market noon → restaurant night. Reuses items from
 * missions 4, 13 & 16 — the value is receipts on the fridge, not new vocabulary.
 */
const byId = new Map([...DAY4_ITEMS, ...DAY13_ITEMS, ...DAY16_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY18_ITEMS: BootcampItem[] = [
  ...pick(
    'en.phrase.coffee.iced-coffee', 'en.reply.coffee.milk-sugar',
    'en.phrase.street.one-of-those', 'en.phrase.street.how-much', 'en.reply.street.how-many',
    'en.phrase.rest.table-for-two', 'en.phrase.rest.ill-have', 'en.phrase.rest.bill-please',
  ),
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const COLD_COFFEE: BootcampDialogue = {
  id: 'cold-coffee',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Morning! What can I get you?', he: 'בוקר! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "I'd like an iced coffee, please.", he: 'אני רוצה קפה קר, בבקשה.', itemId: 'en.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Sure — milk and sugar?', he: 'בטח — חלב וסוכר?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Milk, no sugar.', he: 'עם חלב, בלי סוכר.', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Coming right up. Have a great morning!', he: 'תכף מוכן. בוקר נהדר!' },
  ],
};

const COLD_MARKET: BootcampDialogue = {
  id: 'cold-market',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Fresh fruit, fresh fruit! What would you like?', he: 'פירות טריים, פירות טריים! מה תרצה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'How much is it?', he: 'כמה זה עולה?', itemId: 'en.phrase.street.how-much', correct: true, next: 'n2' },
      { en: 'One of those, please.', he: 'אחד מאלה, בבקשה.', itemId: 'en.phrase.street.one-of-those', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Best price for you — six! How many?', he: 'מחיר הכי טוב בשבילך — שישה! כמה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Two, please.', he: 'שניים, בבקשה.', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Here you go — enjoy, my friend!', he: 'הנה לך — תיהנה, חבר!' },
  ],
};

const COLD_RESTAURANT: BootcampDialogue = {
  id: 'cold-restaurant',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Good evening! How many people?', he: 'ערב טוב! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'A table for two, please.', he: 'שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Right this way. Are you ready to order?', he: 'בבקשה אחריי. מוכנים להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'll have the pasta, please.", he: 'אני אקח את הפסטה, בבקשה.', itemId: 'en.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "Excellent. I'll bring it right out. Just wave when you'd like the bill.", he: 'מצוין. אביא מיד. תסמן כשתרצה את החשבון.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Could we have the bill, please?', he: 'אפשר את החשבון, בבקשה?', itemId: 'en.phrase.rest.bill-please', correct: true, next: 'n4' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Of course — here you go. Have a lovely evening!', he: 'כמובן — בבקשה. ערב נפלא!' },
  ],
};

export const DAY18: BootcampDayContent = {
  day: 18,
  title: T('נקודת ביקורת: יום אוכל', 'CHECKPOINT: Food Day'),
  items: DAY18_ITEMS,
  dialogues: { 'cold-coffee': COLD_COFFEE, 'cold-market': COLD_MARKET, 'cold-restaurant': COLD_RESTAURANT },
  steps: [
    { kind: 'talk', icon: '🍽️', title: T('נקודת ביקורת: יום אוכל', 'Checkpoint: Food Day'),
      body: [
        T('אין חומר חדש היום. רק הוכחה — יום אוכל שלם, מהבוקר עד הלילה.', 'No new material today. Just proof — a full food day, morning to night.'),
        T('קפה בבוקר, שוק בצהריים, מסעדה בערב. הכל קר, מהר, בלי הכנה.', 'Coffee in the morning, a market at noon, a restaurant at night. All cold, fast, unprepared.'),
      ], cta: T('בוקר טוב — קדימה', 'Good morning — go') },
    { kind: 'dialogue', dialogueId: 'cold-coffee' },
    { kind: 'receipt', text: T('שרדת קפה בבוקר בקור — הזמנה וחלב/סוכר, בלי הכנה.', 'You survived a cold morning coffee — order and milk/sugar, no prep.') },
    { kind: 'ambush', npc: { en: 'Sorry — remind me, was that with milk and sugar or just milk?', he: 'סליחה — תזכיר לי, זה היה עם חלב וסוכר או רק חלב?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.reply.coffee.milk-sugar' },
    { kind: 'dialogue', dialogueId: 'cold-market' },
    { kind: 'receipt', text: T('שרדת דוכן שוק רועש בקור — מחיר, כמות, וסגירה.', 'You survived a loud market stall cold — price, quantity, and a close.') },
    { kind: 'ambush', npc: { en: 'Two for six or five for thirteen — which deal do you want boss?', he: 'שניים בשישה או חמישה בשלוש-עשרה — איזו עסקה אתה רוצה, בוס?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.reply.street.how-many' },
    { kind: 'dialogue', dialogueId: 'cold-restaurant' },
    { kind: 'receipt', text: T('יום אוכל שלם — קפה, שוק, ומסעדה — בקור. אף אחד לא ירעיב אותך.', 'A full food day — coffee, market, and restaurant — cold. Nobody can starve you.') },
    { kind: 'summary' },
  ],
};
