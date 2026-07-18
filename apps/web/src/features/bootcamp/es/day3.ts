import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission (day 3) — "Números y dinero" (Numbers & Money). Spanish parallel of English day 3:
 * same objective (hear a price and pay without freezing), same step structure, same engine. Spanish
 * target lines + `tr:{en,he}` glosses; `es.*` ids. No Spanish video yet → the hub Watch card shows
 * "Coming Soon". AI-drafted, neutral international Spanish, pending native review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY3_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.money.how-much', text: '¿Cuánto es?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('השאלה שפותחת כל עסקה. תלמד אותה עד הסוף.', 'The question that opens every transaction. Learn it cold.') },
  { id: 'es.phrase.money.by-card', text: 'Con tarjeta, por favor.', meaning: T('בכרטיס, בבקשה.', 'By card, please.') },
  { id: 'es.phrase.money.in-cash', text: 'En efectivo.', meaning: T('במזומן.', 'In cash.') },
  { id: 'es.phrase.money.too-expensive', text: 'Es muy caro.', meaning: T('זה יקר מדי.', "That's too expensive."),
    tip: T('משפט מיקוח מנומס — ופתח למחיר טוב יותר.', 'A polite haggle — and an opening for a better price.') },
  // hear — prices at speed (the real skill)
  { id: 'es.reply.money.five-euros', text: 'Son cinco euros.', meaning: T('זה חמישה יורו.', "That's five euros."),
    tip: T('cinco = 5. תתרגל לזהות מספרים במשפט.', 'cinco = 5. Train to catch numbers inside a sentence.') },
  { id: 'es.reply.money.ten-euros', text: 'Serán diez euros.', meaning: T('זה יעלה עשרה יורו.', "That'll be ten euros.") },
  { id: 'es.reply.money.twenty-euros', text: 'Veinte euros, por favor.', meaning: T('עשרים יורו, בבקשה.', 'Twenty euros, please.') },
  { id: 'es.reply.money.fifteen-fifty', text: 'Quince con cincuenta.', meaning: T('חמש עשרה וחצי (15.50).', 'Fifteen fifty (15.50).') },
  { id: 'es.reply.money.cash-or-card', text: '¿Efectivo o tarjeta?', meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'es.reply.money.your-change', text: 'Aquí tiene su cambio.', meaning: T('הנה העודף שלך.', "Here's your change.") },
  { id: 'es.reply.money.no-change', text: 'Lo siento, no tengo cambio.', meaning: T('סליחה, אין לי עודף.', "Sorry, I have no change.") },
  ...recoveryEs('es.phrase.recovery.slowly', 'es.phrase.recovery.repeat', 'es.phrase.recovery.thank-you', 'es.phrase.recovery.one-moment'),
];

const SCENE: BootcampDialogue = {
  id: 'market-stall',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Fresas frescas! ¡Las mejores del mercado!', tr: TR('Fresh strawberries! Best in the market!', 'תותים טריים! הכי טובים בשוק!'), he: 'תותים טריים! הכי טובים בשוק!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: '¿Cuánto es?', tr: TR('How much is it?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'es.phrase.money.how-much', correct: true, next: 'n2' },
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', next: 'c1', en: '¡Tómese su tiempo, amigo!', tr: TR('Take your time, my friend!', 'קח את הזמן, חבר!'), he: 'קח את הזמן, חבר!' },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: '¡Cinco euros la caja, o dos por ocho!', tr: TR('Five euros a punnet, or two for eight!', 'חמישה יורו קופסה, או שתיים בשמונה!'), he: 'חמישה יורו קופסה, או שתיים בשמונה!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה. (מספרים מהירים? עצור אותו!)'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r2' },
      { en: 'Una caja, por favor.', tr: TR('One punnet, please.', 'קופסה אחת, בבקשה.'), he: 'קופסה אחת, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Cinco — euros — una caja.', tr: TR('Five — euros — one punnet.', 'חמישה — יורו — קופסה אחת.'), he: 'חמישה — יורו — קופסה אחת.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Una caja, por favor.', tr: TR('One punnet, please.', 'קופסה אחת, בבקשה.'), he: 'קופסה אחת, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Perfecto. Son cinco euros. ¿Efectivo o tarjeta?', tr: TR("Perfect. That's five euros. Cash or card?", 'מצוין. זה חמישה יורו. מזומן או כרטיס?'), he: 'מצוין. זה חמישה יורו. מזומן או כרטיס?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Con tarjeta, por favor.', tr: TR('By card, please.', 'בכרטיס, בבקשה.'), he: 'בכרטיס, בבקשה.', itemId: 'es.phrase.money.by-card', correct: true, next: 'n4' },
      { en: 'En efectivo.', tr: TR('In cash.', 'במזומן.'), he: 'במזומן.', itemId: 'es.phrase.money.in-cash', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: '¡Gracias! ¡Que las disfrute!', tr: TR('Thank you! Enjoy the strawberries!', 'תודה! תיהנה מהתותים!'), he: 'תודה! תיהנה מהתותים!' },
  ],
};

export const DAY3_ES: BootcampDayContent = {
  day: 3,
  title: T('כסף ומספרים', 'Numbers & Money'),
  items: DAY3_ES_ITEMS,
  dialogues: { 'market-stall': SCENE },
  steps: [
    { kind: 'talk', icon: '💶', title: T('משימה 3: כסף ומספרים', 'Mission 3: Numbers & Money'),
      body: [
        T('הכישלון הכי נפוץ של מטייל: לא הבנת את המחיר, אז פשוט הושטת שטר גדול וקיווית.', 'The most common traveler failure: you didn’t catch the price, so you just held out a big bill and hoped.'),
        T('היום זה נגמר. אתה תשמע מחירים — ותבין אותם.', 'Today that ends. You’ll hear prices — and understand them.'),
      ], cta: T('מתחילים', 'Start') },
    // Numbers priming (Part 6) — the key price numbers a traveler hears at a stall or counter.
    { kind: 'prime', label: T('לפני שנדבר: מספרים בספרדית', 'Before we speak: Spanish numbers'),
      intro: T('כמה מספרים שחוזרים בכל מחיר. תכיר אותם מראש כדי לתפוס אותם במשפט מהיר.', 'A few numbers that recur in every price. Meet them first so you catch them in a fast sentence.'),
      words: [
        { text: 'cinco', meaning: T('חמש (5)', 'five (5)') },
        { text: 'diez', meaning: T('עשר (10)', 'ten (10)') },
        { text: 'veinte', meaning: T('עשרים (20)', 'twenty (20)') },
        { text: 'setenta', meaning: T('שבעים (70)', 'seventy (70)') },
        { text: 'ochenta', meaning: T('שמונים (80)', 'eighty (80)') },
        { text: 'noventa', meaning: T('תשעים (90)', 'ninety (90)') },
      ], buildFromItemId: 'es.reply.money.five-euros' },
    { kind: 'tool', itemId: 'es.phrase.money.how-much', index: 1, total: 3, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'es.phrase.money.by-card', index: 2, total: 3, label: T('לשלם בכרטיס', 'Pay by card') },
    { kind: 'tool', itemId: 'es.phrase.money.too-expensive', index: 3, total: 3, label: T('מיקוח מנומס', 'Polite haggle') },
    { kind: 'replies', saidItemId: 'es.phrase.money.how-much',
      replyIds: ['es.reply.money.five-euros', 'es.reply.money.ten-euros', 'es.reply.money.twenty-euros', 'es.reply.money.cash-or-card'] },
    { kind: 'receipt', text: T('שמעת ארבעה מחירים שונים — וזיהית כל אחד.', 'You heard four different prices — and caught every one.') },
    { kind: 'quiz', itemId: 'es.reply.money.twenty-euros', wrongIds: ['es.reply.money.ten-euros', 'es.reply.money.five-euros'] },
    { kind: 'quiz', itemId: 'es.reply.money.your-change', wrongIds: ['es.reply.money.no-change', 'es.reply.money.cash-or-card'] },
    { kind: 'dialogue', dialogueId: 'market-stall' },
    { kind: 'receipt', text: T('קנית בשוק, הבנת את המחיר, ושילמת. עסקה שלמה.', 'You bought at the market, understood the price, and paid. A full transaction.') },
    { kind: 'swipe', itemIds: DAY3_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Son quince con cincuenta en total, ¿le parece bien?', tr: TR('That comes to fifteen fifty altogether, is that alright?', 'זה יוצא חמש עשרה וחצי בסך הכל, זה בסדר?'), he: 'זה יוצא חמש עשרה וחצי בסך הכל, זה בסדר?' },
      correctItemId: 'es.reply.money.fifteen-fifty', wrongItemId: 'es.reply.money.five-euros' },
    { kind: 'receipt', text: T('מספר עם אגורות, מהיר — ותפסת אותו. זה כסף בשליטה.', 'A fast decimal price — and you caught it. That’s money, under control.') },
    { kind: 'summary' },
  ],
};
