import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m17Flow } from './practiceEveryday.js';

/**
 * Mission 17 — "Supermarket" (Phase 3 · Food).
 * The independence multiplier: find it, weigh it, pay for it — self-checkout included.
 * Basic groceries with zero dependence on anyone. Cheap wins, heavy on recognition.
 */
export const DAY16_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.super.where-is', text: 'Where is the milk?', meaning: T('איפה החלב?', 'Where is the milk?'),
    tip: T('התבנית: Where is the ___? — מוצאת כל מוצר בכל חנות.', 'Template: Where is the ___? — finds any product in any shop.') },
  { id: 'en.phrase.super.do-you-have', text: 'Do you have bread?', meaning: T('יש לכם לחם?', 'Do you have bread?'),
    tip: T('התבנית: Do you have ___? — בודקת אם קיים במלאי.', 'Template: Do you have ___? — checks if it’s in stock.') },
  { id: 'en.phrase.super.just-this', text: 'Just this, thanks.', meaning: T('רק את זה, תודה.', 'Just this, thanks.') },
  { id: 'en.phrase.super.need-bag', text: 'Could I get a bag?', meaning: T('אפשר שקית?', 'Could I get a bag?') },
  // hear — signs and cashier lines
  { id: 'en.reply.super.aisle-three', text: "It's in aisle three.", meaning: T('זה במעבר שלוש.', "It's in aisle three.") },
  { id: 'en.reply.super.over-there', text: 'Over there, on the left.', meaning: T('שם, משמאל.', 'Over there, on the left.') },
  { id: 'en.reply.super.bag-q', text: 'Do you need a bag?', meaning: T('צריך שקית?', 'Do you need a bag?') },
  { id: 'en.reply.super.card-here', text: 'Insert your card here.', meaning: T('הכנס את הכרטיס כאן.', 'Insert your card here.') },
  { id: 'en.reply.super.sold-out', text: "Sorry, we're sold out.", meaning: T('סליחה, אזל המלאי.', "Sorry, we're sold out.") },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.show-me', 'en.phrase.recovery.thank-you'),
];

const SCENE_SUPER: BootcampDialogue = {
  id: 'supermarket',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hi there! Can I help you find something?', he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Where is the milk?', he: 'איפה החלב?', itemId: 'en.phrase.super.where-is', correct: true, next: 'n2' },
      { en: 'Do you have bread?', he: 'יש לכם לחם?', itemId: 'en.phrase.super.do-you-have', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: 'Bread? Yes — fresh this morning, in aisle one.', he: 'לחם? כן — טרי מהבוקר, במעבר אחת.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Where is the milk?', he: 'איפה החלב?', itemId: 'en.phrase.super.where-is', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: "The milk is in aisle three, on the left.", he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Aisle — three — on the left.', he: 'מעבר — שלוש — משמאל.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', cue: T('בקופה…', 'At the checkout…'), en: 'Hi! Is that everything?', he: 'היי! זה הכל?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Can you show me?', he: 'אתה יכול להראות לי? (כלי — כשמילים לא מספיקות)', itemId: 'en.phrase.recovery.show-me', correct: true, next: 'r3' },
      { en: 'Just this, thanks.', he: 'רק את זה, תודה.', itemId: 'en.phrase.super.just-this', correct: true, next: 'n4' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Of course — put it here, press the picture, done.', he: 'בטח — שים כאן, לחץ על התמונה, גמרנו.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Just this, thanks.', he: 'רק את זה, תודה.', itemId: 'en.phrase.super.just-this', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Do you need a bag?', he: 'צריך שקית?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Could I get a bag?', he: 'אפשר שקית?', itemId: 'en.phrase.super.need-bag', correct: true, next: 'n5' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Insert your card here… all done. Have a nice day!', he: 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!' },
  ],
};

export const DAY16: BootcampDayContent = {
  day: 16,
  title: T('סופרמרקט וקניות יום-יום', 'Supermarket & Everyday Shopping'),
  items: DAY16_ITEMS,
  dialogues: { supermarket: SCENE_SUPER },
  steps: [
    { kind: 'talk', icon: '🛒', title: T('משימה 17: סופרמרקט', 'Mission 17: Supermarket'),
      body: [
        T('סופר, לבד: למצוא מוצר, להבין באיזה מעבר ובאיזה צד הוא, לעבור קופה ולבקש שקית.', 'The supermarket, on your own: find a product, understand which aisle and which side it is on, get through the checkout and ask for a bag.'),
        T('כמה שאלות קצרות — וכמה תשובות שכדאי לזהות כשאומרים אותן מהר.', 'A few short questions — and a few answers worth recognizing when they are said fast.'),
      ], cta: T('להיכנס לסופר', 'Walk into the shop') },
    // From the key sentences onward the flow is shared by all languages: see practiceEveryday.ts.
    ...m17Flow('en'),
  ],
};
