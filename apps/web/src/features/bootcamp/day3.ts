import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/** Mission 3 — "Numbers & Money" (real objective: hear a price and pay without freezing). */
export const DAY3_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.money.how-much', text: 'How much is it?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('השאלה שפותחת כל עסקה. תלמד אותה עד הסוף.', 'The question that opens every transaction. Learn it cold.') },
  { id: 'en.phrase.money.by-card', text: 'By card, please.', meaning: T('בכרטיס, בבקשה.', 'By card, please.') },
  { id: 'en.phrase.money.in-cash', text: 'In cash.', meaning: T('במזומן.', 'In cash.') },
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
  ...recovery('en.phrase.recovery.slowly', 'en.phrase.recovery.repeat', 'en.phrase.recovery.thank-you', 'en.phrase.recovery.one-moment'),
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
      { en: 'One box, please.', he: 'קופסה אחת, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Five — euros — one box.', he: 'חמישה — יורו — קופסה אחת.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'One box, please.', he: 'קופסה אחת, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "Perfect. That's five euros. Cash or card?", he: 'מצוין. זה חמישה יורו. מזומן או כרטיס?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'By card, please.', he: 'בכרטיס, בבקשה.', itemId: 'en.phrase.money.by-card', correct: true, next: 'n4' },
      { en: 'In cash.', he: 'במזומן.', itemId: 'en.phrase.money.in-cash', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Thank you! Enjoy the strawberries!', he: 'תודה! תיהנה מהתותים!' },
  ],
};

export const DAY3: BootcampDayContent = {
  day: 3,
  title: T('כסף ומספרים', 'Numbers & Money'),
  items: DAY3_ITEMS,
  dialogues: { 'market-stall': SCENE },
  introVideo: {
    src: '/videos/En_day3.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'en',
    type: 'intro',
  },
  steps: [
    { kind: 'talk', icon: '💶', title: T('משימה 3: כסף ומספרים', 'Mission 3: Numbers & Money'),
      body: [
        T('הכישלון הכי נפוץ של מטייל: לא הבנת את המחיר, אז פשוט הושטת שטר גדול וקיווית.', 'The most common traveler failure: you didn’t catch the price, so you just held out a big bill and hoped.'),
        T('היום זה נגמר. אתה תשמע מחירים — ותבין אותם.', 'Today that ends. You’ll hear prices — and understand them.'),
      ], cta: T('מתחילים', 'Start') },
    { kind: 'tool', itemId: 'en.phrase.money.how-much', index: 1, total: 3, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'en.phrase.money.by-card', index: 2, total: 3, label: T('לשלם בכרטיס', 'Pay by card') },
    { kind: 'tool', itemId: 'en.phrase.money.too-expensive', index: 3, total: 3, label: T('מיקוח מנומס', 'Polite haggle') },
    { kind: 'replies', saidItemId: 'en.phrase.money.how-much',
      replyIds: ['en.reply.money.five-euros', 'en.reply.money.ten-euros', 'en.reply.money.twenty-euros', 'en.reply.money.cash-or-card'] },
    { kind: 'receipt', text: T('שמעת ארבעה מחירים שונים — וזיהית כל אחד.', 'You heard four different prices — and caught every one.') },
    { kind: 'quiz', itemId: 'en.reply.money.twenty-euros', wrongIds: ['en.reply.money.ten-euros', 'en.reply.money.five-euros'] },
    { kind: 'quiz', itemId: 'en.reply.money.your-change', wrongIds: ['en.reply.money.no-change', 'en.reply.money.cash-or-card'] },
    { kind: 'dialogue', dialogueId: 'market-stall' },
    { kind: 'receipt', text: T('קנית בשוק, הבנת את המחיר, ושילמת. עסקה שלמה.', 'You bought at the market, understood the price, and paid. A full transaction.') },
    { kind: 'swipe', itemIds: DAY3_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: "That comes to fifteen fifty altogether is that alright?", he: 'זה יוצא חמש עשרה וחצי בסך הכל, זה בסדר?' },
      correctItemId: 'en.reply.money.fifteen-fifty', wrongItemId: 'en.reply.money.five-euros' },
    { kind: 'receipt', text: T('מספר עם אגורות, מהיר — ותפסת אותו. זה כסף בשליטה.', 'A fast decimal price — and you caught it. That’s money, under control.') },
    { kind: 'summary' },
  ],
};
void RECOVERY_ITEMS;
