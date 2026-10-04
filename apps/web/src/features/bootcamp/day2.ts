import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m02Steps } from './practiceV1.js';

/** Mission 2 — "Numbers & Money" (real objective: hear a price and pay without freezing). */
export const DAY2_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.money.how-much', text: 'How much is it?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('השאלה שפותחת כל עסקה. תלמד אותה עד הסוף.', 'The question that opens every transaction. Learn it cold.') },
  { id: 'en.phrase.money.by-card', text: 'By card, please.', meaning: T('בכרטיס, בבקשה.', 'By card, please.') },
  { id: 'en.phrase.money.in-cash', text: 'In cash.', meaning: T('במזומן.', 'In cash.') },
  { id: 'en.phrase.money.one-box', text: 'One box, please.', meaning: T('קופסה אחת, בבקשה.', 'One box, please.'),
    tip: T('One ___, please — מספר + הדבר. כך קונים כל דבר.', 'One ___, please — a number + the thing. That is how you buy anything.') },
  { id: 'en.phrase.money.too-expensive', text: "That's too expensive.", meaning: T('זה יקר מדי.', "That's too expensive."),
    tip: T('משפט מיקוח מנומס — ופתח למחיר טוב יותר.', 'A polite haggle — and an opening for a better price.') },
  // hear — prices at speed (the real skill)
  { id: 'en.reply.money.five-euros', text: "That's five euros.", meaning: T('זה חמישה יורו.', "That's five euros."),
    tip: T('five = 5. תתרגל לזהות מספרים במשפט.', 'five = 5. Train to catch numbers inside a sentence.') },
  { id: 'en.reply.money.ten-euros', text: "That'll be ten euros.", meaning: T('זה יעלה עשרה יורו.', "That'll be ten euros.") },
  { id: 'en.reply.money.twenty-euros', text: "Twenty euros, please.", meaning: T('עשרים יורו, בבקשה.', 'Twenty euros, please.') },
  { id: 'en.reply.money.fifteen-fifty', text: "Fifteen fifty.", meaning: T('חמש עשרה וחצי (15.50).', 'Fifteen fifty (15.50).') },
  { id: 'en.reply.money.cash-or-card', text: 'Cash or card?', meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'en.reply.money.your-change', text: "Here's your change.", meaning: T('הנה העודף שלך.', "Here's your change.") },
  { id: 'en.reply.money.no-change', text: "Sorry, I have no change.", meaning: T('סליחה, אין לי עודף.', "Sorry, I have no change.") },
  ...recovery('en.phrase.recovery.slowly', 'en.phrase.recovery.one-moment'),
];

const SCENE: BootcampDialogue = {
  id: 'market-stall',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Fresh strawberries! Best in the market!', he: 'תותים טריים! הכי טובים בשוק!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'How much is it?', he: 'כמה זה עולה?', itemId: 'en.phrase.money.how-much', correct: true, next: 'n2' },
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה.', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', next: 'c1', en: 'Take your time, my friend!', he: 'קח את הזמן, חבר!' },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: "Five euros a box, or two for eight!", he: 'חמישה יורו קופסה, או שתיים בשמונה!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה. (מספרים מהירים? עצור אותו!)', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r2' },
      { en: 'One box, please.', he: 'קופסה אחת, בבקשה.', itemId: 'en.phrase.money.one-box', correct: true, next: 'n3' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Five — euros — one box.', he: 'חמישה — יורו — קופסה אחת.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'One box, please.', he: 'קופסה אחת, בבקשה.', itemId: 'en.phrase.money.one-box', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "Perfect. That's five euros. Cash or card?", he: 'מצוין. זה חמישה יורו. מזומן או כרטיס?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'By card, please.', he: 'בכרטיס, בבקשה.', itemId: 'en.phrase.money.by-card', correct: true, next: 'n4' },
      { en: 'In cash.', he: 'במזומן.', itemId: 'en.phrase.money.in-cash', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Thank you! Enjoy the strawberries!', he: 'תודה! תיהנה מהתותים!' },
  ],
};

export const DAY2: BootcampDayContent = {
  day: 2,
  title: T('כסף ומספרים', 'Numbers & Money'),
  items: DAY2_ITEMS,
  dialogues: { 'market-stall': SCENE },
  introVideo: {
    src: '/videos/En_day2.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'en',
    type: 'intro',
  },
  steps: m02Steps('en'),
};
void RECOVERY_ITEMS;
