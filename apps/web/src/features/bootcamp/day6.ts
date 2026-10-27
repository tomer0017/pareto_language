import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m07Steps } from './practiceArrival.js';

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
  { id: 'en.phrase.taxi.speak-slowly', text: 'Sorry, please speak slowly.', meaning: T('סליחה, דבר לאט, בבקשה.', 'Sorry, please speak slowly.'),
    tip: T('כשהנהג מדבר מהר מדי — תגיד את זה. הוא יחזור, לאט.', 'When the driver speaks too fast — say it. He will say it again, slowly.') },
  { id: 'en.phrase.taxi.okay-thanks', text: 'Okay, thank you.', meaning: T('בסדר, תודה.', 'Okay, thank you.') },
  // hear
  { id: 'en.reply.taxi.where-to', text: 'Where to?', meaning: T('לאן?', 'Where to?') },
  { id: 'en.reply.taxi.about-fifteen', text: "It's about fifteen euros.", meaning: T('זה בערך חמישה עשר יורו.', "It's about fifteen euros.") },
  { id: 'en.reply.taxi.traffic', text: "There's a lot of traffic right now.", meaning: T('יש הרבה פקקים עכשיו.', "There's a lot of traffic right now.") },
  { id: 'en.reply.taxi.here-good', text: 'Is here okay?', meaning: T('כאן זה בסדר?', 'Is here okay?') },
  { id: 'en.reply.taxi.off-we-go', text: 'Got it. No problem — off we go!', meaning: T('הבנתי. אין בעיה — יוצאים!', 'Got it. No problem — off we go!') },
  { id: 'en.reply.taxi.goodbye', text: 'Thank you very much! Enjoy your trip!', meaning: T('תודה רבה! תיהנה מהטיול!', 'Thank you very much! Enjoy your trip!') },
  // Not in this conversation: the driver's small talk, kept because the final checkpoint (Mission 29) asks it.
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
  // The whole journey is shared by all languages: see practiceArrival.ts (`m07Steps`).
  steps: m07Steps('en'),
};
void RECOVERY_ITEMS;
