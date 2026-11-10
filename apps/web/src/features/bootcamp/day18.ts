import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m19Steps } from './practiceTransport.js';

/**
 * Mission 19 — Public Transport: catch your train. The conversation is LOCKED (mission19.test.ts pins it
 * word for word); the journey around it is `m19Steps` (practiceTransport.ts). The four production tools
 * keep their sentence ids; off-scope sentences are archived in retired.ts. Service register.
 */
export const DAY18_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.trans.one-ticket', text: 'One ticket to the centre, please.', meaning: T('כרטיס אחד למרכז, בבקשה.', 'One ticket to the centre, please.'),
    tip: T('התבנית: One ticket to ___ — קונה כרטיס לכל יעד.', 'Template: One ticket to ___ — buys a ticket to anywhere.') },
  { id: 'en.phrase.trans.which-platform', text: 'Which platform?', meaning: T('איזה רציף?', 'Which platform?'),
    tip: T('שתי מילים שמונעות עלייה לרכבת הלא נכונה.', 'Two words that stop you boarding the wrong train.') },
  { id: 'en.phrase.trans.does-stop', text: 'Does this stop at the museum?', meaning: T('זה עוצר במוזיאון?', 'Does this stop at the museum?'),
    tip: T('התבנית: Does this stop at ___? — מוודאת שאתה יורד נכון.', 'Template: Does this stop at ___? — makes sure you get off in the right place.') },
  { id: 'en.phrase.trans.single', text: 'Single, please.', meaning: T('הלוך, בבקשה.', 'Single, please.') },
  // hear — the staff's whole lines
  { id: 'en.reply.trans.where-headed', text: 'Hello! Where are you headed?', meaning: T('שלום! לאן אתה נוסע?', 'Hello! Where are you headed?') },
  { id: 'en.reply.trans.single-return', text: 'Single or return?', meaning: T('הלוך או הלוך-חזור?', 'Single or return?') },
  { id: 'en.reply.trans.fare', text: "That's three euros. It leaves every ten minutes.", meaning: T('זה שלושה יורו. יוצא כל עשר דקות.', "That's three euros. It leaves every ten minutes.") },
  { id: 'en.reply.trans.platform-straight', text: 'Platform two. Straight ahead.', meaning: T('רציף שתיים. ישר קדימה.', 'Platform two. Straight ahead.') },
  { id: 'en.reply.trans.hop-on', text: "The train's right here. Hop on.", meaning: T('הרכבת ממש כאן. עלה.', "The train's right here. Hop on.") },
  { id: 'en.reply.trans.stops-tell', text: "Yes — it's three stops. I'll tell you when.", meaning: T('כן — זה שלוש תחנות. אני אגיד לך מתי.', "Yes — it's three stops. I'll tell you when.") },
  { id: 'en.reply.trans.stop-is-next', text: 'Here we are — your stop is next. Enjoy the museum!', meaning: T('הגענו — התחנה שלך הבאה. תיהנה במוזיאון!', 'Here we are — your stop is next. Enjoy the museum!') },
  // Not taught or tested here: kept, id and wording, because the City checkpoint (Mission 24) reuses them.
  { id: 'en.reply.trans.three-stops', text: "It's three stops.", meaning: T('זה שלוש תחנות.', "It's three stops.") },
  { id: 'en.reply.trans.wrong-way', text: "You're going the wrong way.", meaning: T('אתה בכיוון הלא נכון.', "You're going the wrong way.") },
  // "Thank you!" — the toolkit's own sentence (prior learning: never taught here)
  ...recovery('en.phrase.recovery.thank-you'),
];

const SCENE_TRANSPORT: BootcampDialogue = {
  id: 'transport',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the ride does not fit — a miss is
  // asked again, slowly, and the same choice comes back.
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hello! Where are you headed?', he: 'שלום! לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'One ticket to the centre, please.', he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'en.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Does this stop at the museum?', he: 'זה עוצר במוזיאון?', itemId: 'en.phrase.trans.does-stop', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: 'Hello! Where are you headed?', he: 'שלום! לאן אתה נוסע?' },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Single or return?', he: 'הלוך או הלוך-חזור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Single, please.', he: 'הלוך, בבקשה.', itemId: 'en.phrase.trans.single', correct: true, next: 'n3' },
      { en: 'Which platform?', he: 'איזה רציף?', itemId: 'en.phrase.trans.which-platform', correct: false, next: 'm2' },
    ] },
    { id: 'm2', who: 'npc', slow: true, next: 'c2', en: 'Single or return?', he: 'הלוך או הלוך-חזור?' },
    { id: 'n3', who: 'npc', next: 'c3', en: "That's three euros. It leaves every ten minutes.", he: 'זה שלושה יורו. יוצא כל עשר דקות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Which platform?', he: 'איזה רציף?', itemId: 'en.phrase.trans.which-platform', correct: true, next: 'n4' },
      { en: 'Single, please.', he: 'הלוך, בבקשה.', itemId: 'en.phrase.trans.single', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: "That's three euros. It leaves every ten minutes.", he: 'זה שלושה יורו. יוצא כל עשר דקות.' },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Platform two. Straight ahead.', he: 'רציף שתיים. ישר קדימה.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
      { en: 'One ticket to the centre, please.', he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'en.phrase.trans.one-ticket', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Platform two. Straight ahead.', he: 'רציף שתיים. ישר קדימה.' },
    { id: 'n5', who: 'npc', next: 'c5', en: "The train's right here. Hop on.", he: 'הרכבת ממש כאן. עלה.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Does this stop at the museum?', he: 'זה עוצר במוזיאון?', itemId: 'en.phrase.trans.does-stop', correct: true, next: 'n6' },
      { en: 'Which platform?', he: 'איזה רציף?', itemId: 'en.phrase.trans.which-platform', correct: false, next: 'm5' },
    ] },
    { id: 'm5', who: 'npc', slow: true, next: 'c5', en: "The train's right here. Hop on.", he: 'הרכבת ממש כאן. עלה.' },
    { id: 'n6', who: 'npc', next: 'c6', en: "Yes — it's three stops. I'll tell you when.", he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n7' },
      { en: 'Single, please.', he: 'הלוך, בבקשה.', itemId: 'en.phrase.trans.single', correct: false, next: 'm6' },
    ] },
    { id: 'm6', who: 'npc', slow: true, next: 'c6', en: "Yes — it's three stops. I'll tell you when.", he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'n7', who: 'npc', end: true, en: 'Here we are — your stop is next. Enjoy the museum!', he: 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!' },
  ],
};

export const DAY18: BootcampDayContent = {
  day: 18,
  title: T('תחבורה ציבורית', 'Public Transport'),
  items: DAY18_ITEMS,
  dialogues: { transport: SCENE_TRANSPORT },
  // The whole journey is shared by all languages: see practiceTransport.ts (`m19Steps`).
  steps: m19Steps('en'),
};
