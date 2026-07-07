import { T, recovery } from './recovery.js';
import { DAY4_ITEMS } from './day4.js';
import { DAY7_ITEMS } from './day7.js';
import { DAY13_ITEMS } from './day13.js';
import { DAY23_ITEMS } from './day23.js';
import { DAY25_ITEMS } from './day25.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 30 — "A Complete Day Abroad Alone" (Phase 5, the finale — cold, no new content).
 * Morning to night as one cold chain: coffee → taxi → lunch → a problem → a warm goodbye.
 * One take. A real verdict. The finish line is an experience, not a certificate. Reuses 4, 7, 13, 23 & 25.
 */
const byId = new Map([...DAY4_ITEMS, ...DAY7_ITEMS, ...DAY13_ITEMS, ...DAY23_ITEMS, ...DAY25_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY30_ITEMS: BootcampItem[] = [
  ...pick(
    'en.phrase.coffee.iced-coffee',
    'en.phrase.taxi.to-address',
    'en.phrase.rest.table-for-two', 'en.phrase.rest.ill-have',
    'en.phrase.fix.not-ordered',
    'en.phrase.talk.beautiful-place', 'en.phrase.talk.nice-talking',
  ),
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const COLD_MORNING: BootcampDialogue = {
  id: 'fin-morning',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Morning! What can I get you?', he: 'בוקר! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "I'd like an iced coffee, please.", he: 'אני רוצה קפה קר, בבקשה.', itemId: 'en.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Coming up — anything else this morning?', he: 'תכף מוכן — עוד משהו הבוקר?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "That's all, thanks.", he: 'זה הכל, תודה.', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Have a wonderful day!', he: 'שיהיה יום נפלא!' },
  ],
};

const COLD_TAXI: BootcampDialogue = {
  id: 'fin-taxi',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Where can I take you?', he: 'לאן לקחת אותך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'To this address, please.', he: 'לכתובת הזאת, בבקשה.', itemId: 'en.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: "It'll be about ten. We're here.", he: 'זה יהיה בערך עשרה. הגענו.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Enjoy your day!', he: 'תיהנה מהיום!' },
  ],
};

const COLD_LUNCH: BootcampDialogue = {
  id: 'fin-lunch',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hello! How many people?', he: 'שלום! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'A table for two, please.', he: 'שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Wonderful. Ready to order?', he: 'נהדר. מוכן להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'll have the pasta, please.", he: 'אני אקח את הפסטה, בבקשה.', itemId: 'en.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Great choice — coming right up!', he: 'בחירה מעולה — תכף מגיע!' },
  ],
};

const COLD_TWIST: BootcampDialogue = {
  id: 'fin-twist',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "Here you are — the seafood risotto!", he: 'בבקשה — ריזוטו פירות ים!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "This isn't what I ordered.", he: 'זה לא מה שהזמנתי.', itemId: 'en.phrase.fix.not-ordered', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: "Oh — my apologies! The pasta, right? I'll fix it now.", he: 'אוי — סליחה! הפסטה, נכון? אני מתקן עכשיו.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'The right dish, on the house. So sorry again!', he: 'המנה הנכונה, על חשבון הבית. שוב סליחה!' },
  ],
};

const COLD_EVENING: BootcampDialogue = {
  id: 'fin-evening',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "What a sunset. You've picked a beautiful spot.", he: 'איזו שקיעה. בחרת מקום יפהפה.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'This place is beautiful.', he: 'המקום הזה יפהפה.', itemId: 'en.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'It really is. Well — safe travels, my friend.', he: 'באמת. אז — נסיעה טובה, חבר.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'It was nice talking to you.', he: 'היה נעים לדבר איתך.', itemId: 'en.phrase.talk.nice-talking', correct: true, next: 'n3' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Take care — and come back one day!', he: 'שמור על עצמך — ותחזור יום אחד!' },
  ],
};

export const DAY30: BootcampDayContent = {
  day: 30,
  title: T('יום שלם לבד בחו״ל', 'A Complete Day Abroad Alone'),
  items: DAY30_ITEMS,
  dialogues: { 'fin-morning': COLD_MORNING, 'fin-taxi': COLD_TAXI, 'fin-lunch': COLD_LUNCH, 'fin-twist': COLD_TWIST, 'fin-evening': COLD_EVENING },
  steps: [
    { kind: 'talk', icon: '🎖️', title: T('משימה 30: יום שלם לבד בחו״ל', 'Mission 30: A Complete Day Abroad Alone'),
      body: [
        T('זהו. אין חומר חדש — רק אתה, מבוקר עד לילה, לבד.', 'This is it. No new material — just you, morning to night, alone.'),
        T('קפה, מונית, ארוחה, תקלה, ופרידה חמה. טייק אחד, בקור. פסק דין אמיתי.', 'Coffee, a taxi, a meal, a problem, and a warm goodbye. One take, cold. A real verdict.'),
        T('לפני 30 משימות פחדת לפתוח את הפה. עכשיו תראה מי אתה.', 'Thirty missions ago you were afraid to open your mouth. Now — see who you are.'),
      ], cta: T('להתחיל את היום', 'Begin the day') },
    { kind: 'dialogue', dialogueId: 'fin-morning' },
    { kind: 'receipt', text: T('בוקר: קפה בקור, בלי הכנה. היום התחיל טוב.', 'Morning: a cold coffee, no prep. The day started well.') },
    { kind: 'dialogue', dialogueId: 'fin-taxi' },
    { kind: 'receipt', text: T('מונית: יעד ותשלום. אתה זז בעיר לבד.', 'Taxi: destination and payment. You move through the city alone.') },
    { kind: 'ambush', npc: { en: 'Mind if I take the scenic route it might add a few minutes but no extra charge?', he: 'אכפת לך אם אקח את הדרך היפה? זה אולי יוסיף כמה דקות אבל בלי תוספת תשלום.' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.taxi.to-address' },
    { kind: 'dialogue', dialogueId: 'fin-lunch' },
    { kind: 'receipt', text: T('צהריים: שולחן והזמנה — חלק לגמרי.', 'Noon: a table and an order — completely smooth.') },
    { kind: 'dialogue', dialogueId: 'fin-twist' },
    { kind: 'receipt', text: T('תקלה: מנה שגויה — ותיקנת אותה ברוגע, כמו מקצוען.', 'A problem: a wrong dish — and you fixed it calmly, like a pro.') },
    { kind: 'ambush', npc: { en: 'And would you like me to box the wrong dish for you to take away as well no charge?', he: 'ותרצה שאארוז לך גם את המנה השגויה לקחת, בלי תשלום?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.fix.not-ordered' },
    { kind: 'dialogue', dialogueId: 'fin-evening' },
    { kind: 'receipt', text: T('ערב: שיחה חמה עם זר, ופרידה יפה. יום שלם לבד בחו״ל — שרדת. יותר מזה: נהנית.', 'Evening: a warm chat with a stranger, and a lovely goodbye. A full day abroad alone — you survived. More than that: you enjoyed it.') },
    { kind: 'summary' },
  ],
};
