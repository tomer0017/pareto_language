import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 15 — "Pagar en cualquier sitio" (Paying Anywhere). Spanish parallel of English day
 * 15: every transaction-closer in one place (card, cash, the smooth tip, the receipt). `tr:{en,he}`
 * glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY15_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.pay.by-card', text: 'Voy a pagar con tarjeta.', meaning: T('אני אשלם בכרטיס.', "I'll pay by card."),
    tip: T('התבנית: Voy a pagar con ___ / en ___. con tarjeta · en efectivo.', 'Template: Voy a pagar con ___ / en ___. con tarjeta · en efectivo.') },
  { id: 'es.phrase.pay.by-cash', text: 'Voy a pagar en efectivo.', meaning: T('אני אשלם במזומן.', "I'll pay in cash.") },
  { id: 'es.phrase.pay.keep-change', text: 'Quédese con el cambio.', meaning: T('תשמור את העודף.', 'Keep the change.'),
    tip: T('הדרך החלקה לתת טיפ במזומן. שתי מילים, חיוך גדול.', 'The smooth way to tip in cash. Two words, big smile.') },
  { id: 'es.phrase.pay.receipt-please', text: '¿Me da un recibo?', meaning: T('אפשר קבלה?', 'Could I have a receipt?') },
  { id: 'es.phrase.pay.together', text: 'Todo junto, por favor.', meaning: T('הכל ביחד, בבקשה.', 'All together, please.'),
    tip: T('התשובה ל-"ביחד או בנפרד?" כשמשלמים על כולם.', 'The answer to “together or separate?” when you pay for everyone.') },
  // hear — the counter's replies
  { id: 'es.reply.pay.thatll-be', text: 'Son doce con cincuenta.', meaning: T('זה יוצא שתים-עשרה וחצי.', "That'll be twelve fifty.") },
  { id: 'es.reply.pay.cash-card', text: '¿Efectivo o tarjeta?', meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'es.reply.pay.tap-card', text: 'Puede pagar sin contacto.', meaning: T('אפשר להצמיד את הכרטיס.', 'You can tap your card.') },
  { id: 'es.reply.pay.receipt-q', text: '¿Quiere el recibo?', meaning: T('תרצה קבלה?', 'Would you like a receipt?') },
  { id: 'es.reply.pay.together-separate', text: '¿Junto o por separado?', meaning: T('ביחד או בנפרד?', 'Together or separate?') },
  { id: 'es.reply.pay.heres-change', text: 'Aquí tiene su cambio.', meaning: T('הנה העודף שלך.', "Here's your change.") },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_CHECKOUT: BootcampDialogue = {
  id: 'pay-checkout',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¿Eso es todo? Son doce con cincuenta.', tr: TR("All done? That'll be twelve fifty.", 'סיימנו? זה יוצא שתים-עשרה וחצי.'), he: 'סיימנו? זה יוצא שתים-עשרה וחצי.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Voy a pagar con tarjeta.', tr: TR("I'll pay by card.", 'אני אשלם בכרטיס.'), he: 'אני אשלם בכרטיס.', itemId: 'es.phrase.pay.by-card', correct: true, next: 'n2' },
      { en: 'Voy a pagar en efectivo.', tr: TR("I'll pay in cash.", 'אני אשלם במזומן.'), he: 'אני אשלם במזומן.', itemId: 'es.phrase.pay.by-cash', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: 'En efectivo, perfecto — aquí tiene su cambio de veinte.', tr: TR("Cash is perfect — here's your change from twenty.", 'מזומן מצוין — הנה העודף שלך מעשרים.'), he: 'מזומן מצוין — הנה העודף שלך מעשרים.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Quédese con el cambio.', tr: TR('Keep the change.', 'תשמור את העודף.'), he: 'תשמור את העודף.', itemId: 'es.phrase.pay.keep-change', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Perfecto — puede pagar sin contacto aquí.', tr: TR('Perfect — you can tap your card right here.', 'מצוין — אפשר להצמיד את הכרטיס כאן.'), he: 'מצוין — אפשר להצמיד את הכרטיס כאן.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Me da un recibo?', tr: TR('Could I have a receipt?', 'אפשר קבלה?'), he: 'אפשר קבלה?', itemId: 'es.phrase.pay.receipt-please', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Puede — pagar — sin contacto — aquí.', tr: TR('You can — tap — your card — here.', 'אפשר — להצמיד — את הכרטיס — כאן.'), he: 'אפשר — להצמיד — את הכרטיס — כאן.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: '¿Me da un recibo?', tr: TR('Could I have a receipt?', 'אפשר קבלה?'), he: 'אפשר קבלה?', itemId: 'es.phrase.pay.receipt-please', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: '¡Muy amable, gracias! ¿Algo más?', tr: TR("That's very kind, thank you! Anything else?", 'מאוד נחמד, תודה! עוד משהו?'), he: 'מאוד נחמד, תודה! עוד משהו?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Eso es todo, gracias.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n4' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: '¿Hay — algo — más?', tr: TR('Is there — anything — else?', 'יש — עוד — משהו?'), he: 'יש — עוד — משהו?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Eso es todo, gracias.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Aquí tiene su recibo. Gracias — ¡que tenga un buen día!', tr: TR("Here's your receipt. Thank you — have a great day!", 'הנה הקבלה שלך. תודה — שיהיה יום מעולה!'), he: 'הנה הקבלה שלך. תודה — שיהיה יום מעולה!' },
  ],
};

export const DAY15_ES: BootcampDayContent = {
  day: 15,
  title: T('לשלם בכל מקום', 'Paying Anywhere'),
  items: DAY15_ES_ITEMS,
  dialogues: { 'pay-checkout': SCENE_CHECKOUT },
  steps: [
    { kind: 'talk', icon: '💳', title: T('משימה 15: לשלם בכל מקום', 'Mission 15: Paying Anywhere'),
      body: [
        T('הרגע המביך של התשלום נעלם היום. כל דרך לסגור עסקה — במקום אחד.', 'The awkward payment moment disappears today. Every way to close a transaction — in one place.'),
        T('כרטיס, מזומן, טיפ חלק, קבלה. אחרי היום אתה סוגר עסקאות בלי להסס.', 'Card, cash, a smooth tip, a receipt. After today you close transactions without hesitating.'),
      ], cta: T('לגשת לקופה', 'Step up to the counter') },
    { kind: 'tool', itemId: 'es.phrase.pay.by-card', index: 1, total: 4, label: T('לבחור אמצעי תשלום', 'Choose how to pay') },
    { kind: 'tool', itemId: 'es.phrase.pay.by-cash', index: 2, total: 4, label: T('לשלם במזומן', 'Pay in cash') },
    { kind: 'tool', itemId: 'es.phrase.pay.keep-change', index: 3, total: 4, label: T('הטיפ החלק', 'The smooth tip') },
    { kind: 'tool', itemId: 'es.phrase.pay.receipt-please', index: 4, total: 4, label: T('לבקש קבלה', 'Ask for a receipt') },
    { kind: 'replies', saidItemId: 'es.phrase.pay.by-card',
      replyIds: ['es.reply.pay.cash-card', 'es.reply.pay.tap-card', 'es.reply.pay.receipt-q', 'es.reply.pay.together-separate'] },
    { kind: 'receipt', text: T('אתה מזהה כל שאלה של קופאי — מזומן/כרטיס, קבלה, ביחד/בנפרד.', 'You recognize every cashier question — cash/card, receipt, together/separate.') },
    { kind: 'quiz', itemId: 'es.reply.pay.cash-card', wrongIds: ['es.reply.pay.receipt-q', 'es.reply.pay.together-separate'] },
    { kind: 'quiz', itemId: 'es.reply.pay.together-separate', wrongIds: ['es.reply.pay.tap-card', 'es.reply.pay.heres-change'] },
    { kind: 'dialogue', dialogueId: 'pay-checkout' },
    { kind: 'receipt', text: T('סגרת תשלום שלם — בחרת אמצעי, נתת טיפ, וביקשת קבלה. חלק לגמרי.', 'You closed a full payment — chose a method, tipped, and asked for a receipt. Completely smooth.') },
    { kind: 'swipe', itemIds: DAY15_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Ay, perdone, la máquina de tarjetas no funciona ahora mismo — ¿lleva efectivo encima?', tr: TR("Ah sorry the card machine is down right now do you have any cash on you?", 'אה, סליחה, מכונת הכרטיסים מושבתת כרגע — יש עליך מזומן?'), he: 'אה, סליחה, מכונת הכרטיסים מושבתת כרגע — יש עליך מזומן?' },
      correctItemId: 'es.phrase.pay.by-cash', wrongItemId: 'es.phrase.pay.receipt-please' },
    { kind: 'receipt', text: T('הכרטיס לא עבד — ובלי היסוס עברת למזומן. גמישות היא ביטחון.', 'The card failed — and without hesitation you switched to cash. Flexibility is confidence.') },
    { kind: 'summary' },
  ],
};
