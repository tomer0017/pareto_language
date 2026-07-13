import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 15 — "Payer partout" (Paying Anywhere). French parallel of English day 15: every
 * transaction-closer in one place (card, cash, the smooth tip, the receipt). `tr:{en,he}` glosses;
 * `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY15_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.pay.by-card', text: 'Je vais payer par carte.', meaning: T('אני אשלם בכרטיס.', "I'll pay by card."),
    tip: T('התבנית: Je vais payer par ___ / en ___. par carte · en espèces.', 'Template: Je vais payer par ___ / en ___. par carte · en espèces.') },
  { id: 'fr.phrase.pay.by-cash', text: 'Je vais payer en espèces.', meaning: T('אני אשלם במזומן.', "I'll pay in cash.") },
  { id: 'fr.phrase.pay.keep-change', text: 'Gardez la monnaie.', meaning: T('תשמור את העודף.', 'Keep the change.'),
    tip: T('הדרך החלקה לתת טיפ במזומן. שלוש מילים, חיוך גדול.', 'The smooth way to tip in cash. Three words, big smile.') },
  { id: 'fr.phrase.pay.receipt-please', text: 'Je peux avoir un ticket ?', meaning: T('אפשר קבלה?', 'Could I have a receipt?') },
  { id: 'fr.phrase.pay.together', text: 'Tout ensemble, s’il vous plaît.', meaning: T('הכל ביחד, בבקשה.', 'All together, please.'),
    tip: T('התשובה ל-"ביחד או בנפרד?" כשמשלמים על כולם.', 'The answer to “together or separate?” when you pay for everyone.') },
  // hear — the counter's replies
  { id: 'fr.reply.pay.thatll-be', text: 'Ça fait douze cinquante.', meaning: T('זה יוצא שתים-עשרה וחצי.', "That'll be twelve fifty.") },
  { id: 'fr.reply.pay.cash-card', text: 'Espèces ou carte ?', meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'fr.reply.pay.tap-card', text: 'Vous pouvez payer sans contact.', meaning: T('אפשר להצמיד את הכרטיס.', 'You can tap your card.') },
  { id: 'fr.reply.pay.receipt-q', text: 'Vous voulez un ticket ?', meaning: T('תרצה קבלה?', 'Would you like a receipt?') },
  { id: 'fr.reply.pay.together-separate', text: 'Ensemble ou séparément ?', meaning: T('ביחד או בנפרד?', 'Together or separate?') },
  { id: 'fr.reply.pay.heres-change', text: 'Voici votre monnaie.', meaning: T('הנה העודף שלך.', "Here's your change.") },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE_CHECKOUT: BootcampDialogue = {
  id: 'pay-checkout',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'C’est tout ? Ça fait douze cinquante.', tr: TR("All done? That'll be twelve fifty.", 'סיימנו? זה יוצא שתים-עשרה וחצי.'), he: 'סיימנו? זה יוצא שתים-עשרה וחצי.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais payer par carte.', tr: TR("I'll pay by card.", 'אני אשלם בכרטיס.'), he: 'אני אשלם בכרטיס.', itemId: 'fr.phrase.pay.by-card', correct: true, next: 'n2' },
      { en: 'Je vais payer en espèces.', tr: TR("I'll pay in cash.", 'אני אשלם במזומן.'), he: 'אני אשלם במזומן.', itemId: 'fr.phrase.pay.by-cash', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: 'Les espèces, parfait — voici votre monnaie sur vingt.', tr: TR("Cash is perfect — here's your change from twenty.", 'מזומן מצוין — הנה העודף שלך מעשרים.'), he: 'מזומן מצוין — הנה העודף שלך מעשרים.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Gardez la monnaie.', tr: TR('Keep the change.', 'תשמור את העודף.'), he: 'תשמור את העודף.', itemId: 'fr.phrase.pay.keep-change', correct: true, next: 'n3' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Parfait — vous pouvez payer sans contact ici.', tr: TR('Perfect — you can tap your card right here.', 'מצוין — אפשר להצמיד את הכרטיס כאן.'), he: 'מצוין — אפשר להצמיד את הכרטיס כאן.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je peux avoir un ticket ?', tr: TR('Could I have a receipt?', 'אפשר קבלה?'), he: 'אפשר קבלה?', itemId: 'fr.phrase.pay.receipt-please', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Vous pouvez — payer — sans contact — ici.', tr: TR('You can — tap — your card — here.', 'אפשר — להצמיד — את הכרטיס — כאן.'), he: 'אפשר — להצמיד — את הכרטיס — כאן.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Je peux avoir un ticket ?', tr: TR('Could I have a receipt?', 'אפשר קבלה?'), he: 'אפשר קבלה?', itemId: 'fr.phrase.pay.receipt-please', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'C’est très gentil, merci ! Autre chose ?', tr: TR("That's very kind, thank you! Anything else?", 'מאוד נחמד, תודה! עוד משהו?'), he: 'מאוד נחמד, תודה! עוד משהו?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'C’est tout, merci.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n4' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Il y a — autre — chose ?', tr: TR('Is there — anything — else?', 'יש — עוד — משהו?'), he: 'יש — עוד — משהו?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'C’est tout, merci.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Voici votre ticket. Merci — bonne journée !', tr: TR("Here's your receipt. Thank you — have a great day!", 'הנה הקבלה שלך. תודה — שיהיה יום מעולה!'), he: 'הנה הקבלה שלך. תודה — שיהיה יום מעולה!' },
  ],
};

export const DAY15_FR: BootcampDayContent = {
  day: 15,
  title: T('לשלם בכל מקום', 'Paying Anywhere'),
  items: DAY15_FR_ITEMS,
  dialogues: { 'pay-checkout': SCENE_CHECKOUT },
  steps: [
    { kind: 'talk', icon: '💳', title: T('משימה 15: לשלם בכל מקום', 'Mission 15: Paying Anywhere'),
      body: [
        T('הרגע המביך של התשלום נעלם היום. כל דרך לסגור עסקה — במקום אחד.', 'The awkward payment moment disappears today. Every way to close a transaction — in one place.'),
        T('כרטיס, מזומן, טיפ חלק, קבלה. אחרי היום אתה סוגר עסקאות בלי להסס.', 'Card, cash, a smooth tip, a receipt. After today you close transactions without hesitating.'),
      ], cta: T('לגשת לקופה', 'Step up to the counter') },
    { kind: 'tool', itemId: 'fr.phrase.pay.by-card', index: 1, total: 4, label: T('לבחור אמצעי תשלום', 'Choose how to pay') },
    { kind: 'tool', itemId: 'fr.phrase.pay.by-cash', index: 2, total: 4, label: T('לשלם במזומן', 'Pay in cash') },
    { kind: 'tool', itemId: 'fr.phrase.pay.keep-change', index: 3, total: 4, label: T('הטיפ החלק', 'The smooth tip') },
    { kind: 'tool', itemId: 'fr.phrase.pay.receipt-please', index: 4, total: 4, label: T('לבקש קבלה', 'Ask for a receipt') },
    { kind: 'replies', saidItemId: 'fr.phrase.pay.by-card',
      replyIds: ['fr.reply.pay.cash-card', 'fr.reply.pay.tap-card', 'fr.reply.pay.receipt-q', 'fr.reply.pay.together-separate'] },
    { kind: 'receipt', text: T('אתה מזהה כל שאלה של קופאי — מזומן/כרטיס, קבלה, ביחד/בנפרד.', 'You recognize every cashier question — cash/card, receipt, together/separate.') },
    { kind: 'quiz', itemId: 'fr.reply.pay.cash-card', wrongIds: ['fr.reply.pay.receipt-q', 'fr.reply.pay.together-separate'] },
    { kind: 'quiz', itemId: 'fr.reply.pay.together-separate', wrongIds: ['fr.reply.pay.tap-card', 'fr.reply.pay.heres-change'] },
    { kind: 'dialogue', dialogueId: 'pay-checkout' },
    { kind: 'receipt', text: T('סגרת תשלום שלם — בחרת אמצעי, נתת טיפ, וביקשת קבלה. חלק לגמרי.', 'You closed a full payment — chose a method, tipped, and asked for a receipt. Completely smooth.') },
    { kind: 'swipe', itemIds: DAY15_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Ah désolé, la machine à carte est en panne pour le moment — vous avez du liquide sur vous ?', tr: TR("Ah sorry the card machine is down right now do you have any cash on you?", 'אה, סליחה, מכונת הכרטיסים מושבתת כרגע — יש עליך מזומן?'), he: 'אה, סליחה, מכונת הכרטיסים מושבתת כרגע — יש עליך מזומן?' },
      correctItemId: 'fr.phrase.pay.by-cash', wrongItemId: 'fr.phrase.pay.receipt-please' },
    { kind: 'receipt', text: T('הכרטיס לא עבד — ובלי היסוס עברת למזומן. גמישות היא ביטחון.', 'The card failed — and without hesitation you switched to cash. Flexibility is confidence.') },
    { kind: 'summary' },
  ],
};
