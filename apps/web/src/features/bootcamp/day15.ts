import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 15 — "Paying Anywhere" (Phase 3 · Food).
 * The awkward payment moment disappears. Every transaction-closer in one place: card, cash,
 * the smooth tip line, the receipt. Consolidates Mission 3's numbers into muscle memory
 * across every counter you'll ever stand at.
 */
export const DAY15_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.pay.by-card', text: "I'll pay by card.", meaning: T('אני אשלם בכרטיס.', "I'll pay by card."),
    tip: T('התבנית: I’ll pay by ___ / in ___. by card · in cash.', 'Template: I’ll pay by ___ / in ___. by card · in cash.') },
  { id: 'en.phrase.pay.by-cash', text: "I'll pay in cash.", meaning: T('אני אשלם במזומן.', "I'll pay in cash.") },
  { id: 'en.phrase.pay.keep-change', text: 'Keep the change.', meaning: T('תשמור את העודף.', 'Keep the change.'),
    tip: T('הדרך החלקה לתת טיפ במזומן. שלוש מילים, חיוך גדול.', 'The smooth way to tip in cash. Three words, big smile.') },
  { id: 'en.phrase.pay.receipt-please', text: 'Could I have a receipt?', meaning: T('אפשר קבלה?', 'Could I have a receipt?') },
  { id: 'en.phrase.pay.together', text: 'All together, please.', meaning: T('הכל ביחד, בבקשה.', 'All together, please.'),
    tip: T('התשובה ל-"ביחד או בנפרד?" כשמשלמים על כולם.', 'The answer to “together or separate?” when you pay for everyone.') },
  // hear — the counter's replies
  { id: 'en.reply.pay.thatll-be', text: "That'll be twelve fifty.", meaning: T('זה יוצא שתים-עשרה וחצי.', "That'll be twelve fifty.") },
  { id: 'en.reply.pay.cash-card', text: 'Cash or card?', meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'en.reply.pay.tap-card', text: 'You can tap your card.', meaning: T('אפשר להצמיד את הכרטיס.', 'You can tap your card.') },
  { id: 'en.reply.pay.receipt-q', text: 'Would you like a receipt?', meaning: T('תרצה קבלה?', 'Would you like a receipt?') },
  { id: 'en.reply.pay.together-separate', text: 'Together or separate?', meaning: T('ביחד או בנפרד?', 'Together or separate?') },
  { id: 'en.reply.pay.heres-change', text: "Here's your change.", meaning: T('הנה העודף שלך.', "Here's your change.") },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_CHECKOUT: BootcampDialogue = {
  id: 'pay-checkout',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "All done? That'll be twelve fifty.", he: 'סיימנו? זה יוצא שתים-עשרה וחצי.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "I'll pay by card.", he: 'אני אשלם בכרטיס.', itemId: 'en.phrase.pay.by-card', correct: true, next: 'n2' },
      { en: "I'll pay in cash.", he: 'אני אשלם במזומן.', itemId: 'en.phrase.pay.by-cash', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: "Cash is perfect — here's your change from twenty.", he: 'מזומן מצוין — הנה העודף שלך מעשרים.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Keep the change.', he: 'תשמור את העודף.', itemId: 'en.phrase.pay.keep-change', correct: true, next: 'n3' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Perfect — you can tap your card right here.', he: 'מצוין — אפשר להצמיד את הכרטיס כאן.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Could I have a receipt?', he: 'אפשר קבלה?', itemId: 'en.phrase.pay.receipt-please', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'You can — tap — your card — here.', he: 'אפשר — להצמיד — את הכרטיס — כאן.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Could I have a receipt?', he: 'אפשר קבלה?', itemId: 'en.phrase.pay.receipt-please', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "That's very kind, thank you! Anything else?", he: 'מאוד נחמד, תודה! עוד משהו?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: "That's all, thanks.", he: 'זה הכל, תודה.', correct: true, next: 'n4' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Is there — anything — else?', he: 'יש — עוד — משהו?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: "That's all, thanks.", he: 'זה הכל, תודה.', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: "Here's your receipt. Thank you — have a great day!", he: 'הנה הקבלה שלך. תודה — שיהיה יום מעולה!' },
  ],
};

export const DAY15: BootcampDayContent = {
  day: 15,
  title: T('לשלם בכל מקום', 'Paying Anywhere'),
  items: DAY15_ITEMS,
  dialogues: { 'pay-checkout': SCENE_CHECKOUT },
  steps: [
    { kind: 'talk', icon: '💳', title: T('משימה 15: לשלם בכל מקום', 'Mission 15: Paying Anywhere'),
      body: [
        T('הרגע המביך של התשלום נעלם היום. כל דרך לסגור עסקה — במקום אחד.', 'The awkward payment moment disappears today. Every way to close a transaction — in one place.'),
        T('כרטיס, מזומן, טיפ חלק, קבלה. אחרי היום אתה סוגר עסקאות בלי להסס.', 'Card, cash, a smooth tip, a receipt. After today you close transactions without hesitating.'),
      ], cta: T('לגשת לקופה', 'Step up to the counter') },
    { kind: 'tool', itemId: 'en.phrase.pay.by-card', index: 1, total: 4, label: T('לבחור אמצעי תשלום', 'Choose how to pay') },
    { kind: 'tool', itemId: 'en.phrase.pay.by-cash', index: 2, total: 4, label: T('לשלם במזומן', 'Pay in cash') },
    { kind: 'tool', itemId: 'en.phrase.pay.keep-change', index: 3, total: 4, label: T('הטיפ החלק', 'The smooth tip') },
    { kind: 'tool', itemId: 'en.phrase.pay.receipt-please', index: 4, total: 4, label: T('לבקש קבלה', 'Ask for a receipt') },
    { kind: 'replies', saidItemId: 'en.phrase.pay.by-card',
      replyIds: ['en.reply.pay.cash-card', 'en.reply.pay.tap-card', 'en.reply.pay.receipt-q', 'en.reply.pay.together-separate'] },
    { kind: 'receipt', text: T('אתה מזהה כל שאלה של קופאי — מזומן/כרטיס, קבלה, ביחד/בנפרד.', 'You recognize every cashier question — cash/card, receipt, together/separate.') },
    { kind: 'quiz', itemId: 'en.reply.pay.cash-card', wrongIds: ['en.reply.pay.receipt-q', 'en.reply.pay.together-separate'] },
    { kind: 'quiz', itemId: 'en.reply.pay.together-separate', wrongIds: ['en.reply.pay.tap-card', 'en.reply.pay.heres-change'] },
    { kind: 'dialogue', dialogueId: 'pay-checkout' },
    { kind: 'receipt', text: T('סגרת תשלום שלם — בחרת אמצעי, נתת טיפ, וביקשת קבלה. חלק לגמרי.', 'You closed a full payment — chose a method, tipped, and asked for a receipt. Completely smooth.') },
    { kind: 'swipe', itemIds: DAY15_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: "Ah sorry the card machine is down right now do you have any cash on you?", he: 'אה, סליחה, מכונת הכרטיסים מושבתת כרגע — יש עליך מזומן?' },
      correctItemId: 'en.phrase.pay.by-cash', wrongItemId: 'en.phrase.pay.receipt-please' },
    { kind: 'receipt', text: T('הכרטיס לא עבד — ובלי היסוס עברת למזומן. גמישות היא ביטחון.', 'The card failed — and without hesitation you switched to cash. Flexibility is confidence.') },
    { kind: 'summary' },
  ],
};
