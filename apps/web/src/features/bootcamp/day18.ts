import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m19Flow } from './practiceCity.js';

/**
 * Mission 19 — "Public Transport" (Phase 4 · City Life).
 * Independence beyond taxi budgets: ticket, platform, direction, the right stop. Half of this
 * is pure listening — the platform number, how many stops, how often it leaves — so the ears do the work.
 */
export const DAY18_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.trans.one-ticket', text: 'One ticket to the centre, please.', meaning: T('כרטיס אחד למרכז, בבקשה.', 'One ticket to the centre, please.'),
    tip: T('התבנית: One ticket to ___ — קונה כרטיס לכל יעד.', 'Template: One ticket to ___ — buys a ticket to anywhere.') },
  { id: 'en.phrase.trans.which-platform', text: 'Which platform?', meaning: T('איזה רציף?', 'Which platform?'),
    tip: T('שתי מילים שמונעות עלייה לרכבת הלא נכונה.', 'Two words that stop you boarding the wrong train.') },
  { id: 'en.phrase.trans.does-stop', text: 'Does this stop at the museum?', meaning: T('זה עוצר במוזיאון?', 'Does this stop at the museum?'),
    tip: T('התבנית: Does this stop at ___? — מוודאת שאתה יורד נכון.', 'Template: Does this stop at ___? — makes sure you get off in the right place.') },
  { id: 'en.phrase.trans.next-one', text: "When's the next one?", meaning: T('מתי הבא?', "When's the next one?") },
  { id: 'en.phrase.trans.single', text: 'Single, please.', meaning: T('הלוך, בבקשה.', 'Single, please.') },
  // hear — booth + platform
  { id: 'en.reply.trans.single-return', text: 'Single or return?', meaning: T('הלוך או הלוך-חזור?', 'Single or return?') },
  { id: 'en.reply.trans.platform-two', text: 'Platform two.', meaning: T('רציף שתיים.', 'Platform two.') },
  { id: 'en.reply.trans.every-ten', text: 'Every ten minutes.', meaning: T('כל עשר דקות.', 'Every ten minutes.') },
  { id: 'en.reply.trans.three-stops', text: "It's three stops.", meaning: T('זה שלוש תחנות.', "It's three stops.") },
  { id: 'en.reply.trans.wrong-way', text: "You're going the wrong way.", meaning: T('אתה בכיוון הלא נכון.', "You're going the wrong way.") },
  { id: 'en.reply.trans.stop-next', text: 'Your stop is next.', meaning: T('התחנה שלך הבאה.', 'Your stop is next.') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_TRANSPORT: BootcampDialogue = {
  id: 'transport',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hello! Where are you headed?', he: 'שלום! לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'One ticket to the centre, please.', he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'en.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Where — are you — going?', he: 'לאן — אתה — נוסע?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'One ticket to the centre, please.', he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'en.phrase.trans.one-ticket', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Single or return?', he: 'הלוך או הלוך-חזור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Single, please.', he: 'הלוך, בבקשה.', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Single — or — return?', he: 'הלוך — או — הלוך-חזור?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Single, please.', he: 'הלוך, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: "That's three euros. It leaves every ten minutes.", he: 'זה שלושה יורו. יוצא כל עשר דקות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Which platform?', he: 'איזה רציף?', itemId: 'en.phrase.trans.which-platform', correct: true, next: 'n3b' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: 'Platform two. Straight ahead.', he: 'רציף שתיים. ישר קדימה.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: "The train's right here. Hop on.", he: 'הרכבת ממש כאן. עלה.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Does this stop at the museum?', he: 'זה עוצר במוזיאון?', itemId: 'en.phrase.trans.does-stop', correct: true, next: 'n5' },
      { en: "When's the next one?", he: 'מתי הבא?', itemId: 'en.phrase.trans.next-one', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c4b', en: 'The next one? Every ten minutes — but this one is fine, hop on.', he: 'הבא? כל עשר דקות — אבל זה בסדר, עלה.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Does this stop at the museum?', he: 'זה עוצר במוזיאון?', itemId: 'en.phrase.trans.does-stop', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: "Yes — it's three stops. I'll tell you when.", he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: "It's — three — stops.", he: 'זה — שלוש — תחנות.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Here we are — your stop is next. Enjoy the museum!', he: 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!' },
  ],
};

export const DAY18: BootcampDayContent = {
  day: 18,
  title: T('תחבורה ציבורית', 'Public Transport'),
  items: DAY18_ITEMS,
  dialogues: { transport: SCENE_TRANSPORT },
  steps: [
    { kind: 'talk', icon: '🚇', title: T('משימה 19: תחבורה ציבורית', 'Mission 19: Public Transport'),
      body: [
        T('העיר זזה בשבילך — בזול. כרטיס, רציף, כיוון, והתחנה הנכונה.', 'The city moves for you — cheaply. Ticket, platform, direction, the right stop.'),
        T('חצי מהמשימה הזאת היא האזנה: מספר הרציף, כמה תחנות, כל כמה דקות — ותיקון מהיר אחד בסוף.', 'Half of this mission is listening: the platform number, how many stops, how often it leaves — and one fast correction at the end.'),
      ], cta: T('לגשת לדלפק הכרטיסים', 'Step up to the ticket desk') },
    // From the key sentences onward the flow is shared by all languages: see practiceCity.ts.
    ...m19Flow('en'),
  ],
};
