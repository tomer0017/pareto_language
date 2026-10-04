import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m07Flow } from './practiceArrival.js';

/** Mission 7 — "Taxi / Uber" (real objective: destination, price, stop — the address-show move). */
export const DAY6_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.taxi.to-address', text: 'To this address, please.', meaning: T('לכתובת הזאת, בבקשה.', 'To this address, please.'),
    tip: T('הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון.', 'The taxi opener — say it and show the address on your phone.') },
  { id: 'en.phrase.taxi.to-airport', text: 'To the airport, please.', meaning: T('לשדה התעופה, בבקשה.', 'To the airport, please.') },
  { id: 'en.phrase.taxi.how-much', text: 'How much to the centre?', meaning: T('כמה עד המרכז?', 'How much to the centre?'),
    tip: T('לשאול מחיר לפני שנוסעים — חוסך הפתעות.', 'Ask the price before you ride — no surprises.') },
  { id: 'en.phrase.taxi.stop-here', text: 'Stop here, please.', meaning: T('עצור כאן, בבקשה.', 'Stop here, please.'),
    tip: T('העיתוי חשוב — תגיד את זה קצת לפני היעד.', 'Timing matters — say it just before the destination.') },
  { id: 'en.phrase.taxi.keep-change', text: 'Keep the change.', meaning: T('תשאיר את העודף.', 'Keep the change.') },
  // hear
  { id: 'en.reply.taxi.where-to', text: 'Where to?', meaning: T('לאן?', 'Where to?') },
  { id: 'en.reply.taxi.about-fifteen', text: "It's about fifteen euros.", meaning: T('זה בערך חמישה עשר יורו.', "It's about fifteen euros.") },
  { id: 'en.reply.taxi.traffic', text: "There's a lot of traffic right now.", meaning: T('יש הרבה פקקים עכשיו.', "There's a lot of traffic right now.") },
  { id: 'en.reply.taxi.here-good', text: 'Is here okay?', meaning: T('כאן זה בסדר?', 'Is here okay?') },
  { id: 'en.reply.taxi.first-visit', text: 'First time in the city?', meaning: T('פעם ראשונה בעיר?', 'First time in the city?') },
  ...recovery('en.phrase.recovery.slowly', 'en.phrase.recovery.show-me', 'en.phrase.recovery.thank-you'),
];

const SCENE: BootcampDialogue = {
  id: 'taxi-ride',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hello! Where to?', he: 'שלום! לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'To this address, please.', he: 'לכתובת הזאת, בבקשה.', itemId: 'en.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'To the airport, please.', he: 'לשדה התעופה, בבקשה.', itemId: 'en.phrase.taxi.to-airport', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Got it. No problem — off we go!', he: 'הבנתי. אין בעיה — יוצאים!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'How much to the centre?', he: 'כמה עד המרכז?', itemId: 'en.phrase.taxi.how-much', correct: true, next: 'n3' },
      { en: 'Can you show me?', he: 'אתה יכול להראות לי? (בקש לראות את המונה)', itemId: 'en.phrase.recovery.show-me', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: "It's about fifteen euros. There's a lot of traffic right now.", he: 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Sorry, please speak slowly.', he: 'סליחה, דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r3' },
      { en: 'Okay, thank you.', he: 'בסדר, תודה.', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: "Sure. About fifteen euros. There's a lot of traffic.", he: 'בטח. בערך חמישה עשר יורו. יש הרבה פקקים.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Okay, thank you.', he: 'בסדר, תודה.', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: '…We are almost there. Is here okay?', he: '…כמעט הגענו. כאן זה בסדר?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Stop here, please. Keep the change.', he: 'עצור כאן, בבקשה. תשאיר את העודף.', itemId: 'en.phrase.taxi.stop-here', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Thank you very much! Enjoy your trip!', he: 'תודה רבה! תיהנה מהטיול!' },
  ],
};

export const DAY6: BootcampDayContent = {
  day: 6,
  title: T('מונית', 'Taxi / Uber'),
  items: DAY6_ITEMS,
  dialogues: { 'taxi-ride': SCENE },
  introVideo: {
    src: '/videos/En_day6.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'en',
    type: 'intro',
  },
  steps: [
    { kind: 'talk', icon: '🚕', title: T('משימה 7: מונית', 'Mission 7: Taxi / Uber'),
      body: [
        T('שיחה של 60 שניות עם נהג — יעד, מחיר, עצירה. לחץ גבוה, זמן קצר.', 'A 60-second conversation with a driver — destination, price, stop. High pressure, short window.'),
        T('הסוד: תגיד את היעד ותראה את הכתובת בטלפון. גם אם קפאת — יש לך את הכלים.', 'The trick: say the destination and show the address on your phone. Even if you freeze — you have the tools.'),
      ], cta: T('להיכנס למונית', 'Get in') },
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('המילים שמכניסות אותך למונית ומוציאות אותך במקום הנכון.', 'The words that get you into the taxi and out at the right spot.'),
      words: [
        { text: 'address', meaning: T('כתובת', 'address'), emoji: '🏠' },
        { text: 'airport', meaning: T('שדה תעופה', 'airport'), emoji: '✈️' },
        { text: 'stop', meaning: T('לעצור', 'stop'), emoji: '✋' },
        { text: 'here', meaning: T('כאן', 'here'), emoji: '📍' },
        { text: 'how much', meaning: T('כמה (עולה)', 'how much'), review: true },
      ], buildFromItemId: 'en.phrase.taxi.to-address' },
    // From the key sentences onward the flow is shared by all languages: see practiceArrival.ts.
    ...m07Flow('en'),
  ],
};
void RECOVERY_ITEMS;
