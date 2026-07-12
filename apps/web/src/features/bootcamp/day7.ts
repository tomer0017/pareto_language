import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/** Mission 7 — "Taxi / Uber" (real objective: destination, price, stop — the address-show move). */
export const DAY7_ITEMS: BootcampItem[] = [
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
    { id: 'n2', who: 'npc', next: 'c2', en: 'Got it. How much did you expect to pay?', he: 'הבנתי. כמה חשבת לשלם?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'How much to the centre?', he: 'כמה עד המרכז?', itemId: 'en.phrase.taxi.how-much', correct: true, next: 'n3' },
      { en: 'Can you show me?', he: 'אתה יכול להראות לי? (בקש לראות את המונה)', itemId: 'en.phrase.recovery.show-me', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: "It's about fifteen euros — there's a lot of traffic right now.", he: 'זה בערך חמישה עשר יורו — יש הרבה פקקים עכשיו.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r3' },
      { en: 'Okay, thank you.', he: 'בסדר, תודה.', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Fifteen — euros. Traffic.', he: 'חמישה עשר — יורו. פקקים.' },
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

export const DAY7: BootcampDayContent = {
  day: 7,
  title: T('מונית', 'Taxi / Uber'),
  items: DAY7_ITEMS,
  dialogues: { 'taxi-ride': SCENE },
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
    { kind: 'tool', itemId: 'en.phrase.taxi.to-address', index: 1, total: 4, label: T('הפתיח', 'The opener') },
    { kind: 'tool', itemId: 'en.phrase.taxi.how-much', index: 2, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'en.phrase.taxi.stop-here', index: 3, total: 4, label: T('לעצור', 'Stop it') },
    { kind: 'tool', itemId: 'en.phrase.taxi.keep-change', index: 4, total: 4, label: T('לסיים יפה', 'Finish smoothly') },
    { kind: 'replies', saidItemId: 'en.phrase.taxi.to-address',
      replyIds: ['en.reply.taxi.where-to', 'en.reply.taxi.about-fifteen', 'en.reply.taxi.here-good', 'en.reply.taxi.first-visit'] },
    { kind: 'receipt', text: T('אתה מזהה מה נהג מונית שואל — לאן, כמה, כאן בסדר?', 'You recognize what a taxi driver asks — where to, how much, is here okay?') },
    { kind: 'quiz', itemId: 'en.reply.taxi.about-fifteen', wrongIds: ['en.reply.taxi.where-to', 'en.reply.taxi.traffic'] },
    { kind: 'dialogue', dialogueId: 'taxi-ride' },
    { kind: 'receipt', text: T('נסיעה שלמה: יעד, מחיר, עצירה, תשלום. שרדת את המונית.', 'A full ride: destination, price, stop, payment. You survived the taxi.') },
    { kind: 'swipe', itemIds: DAY7_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Sorry the road ahead is closed is it alright if I drop you around the corner?', he: 'סליחה, הכביש קדימה חסום — בסדר שאוריד אותך מעבר לפינה?' },
      correctItemId: 'en.reply.taxi.here-good', wrongItemId: 'en.reply.taxi.where-to' },
    { kind: 'receipt', text: T('שינוי ברגע האחרון, מהיר — והבנת שהוא מציע להוריד אותך קרוב.', 'A fast last-minute change — and you understood he’s offering to drop you nearby.') },
    { kind: 'summary' },
  ],
};
void RECOVERY_ITEMS;
