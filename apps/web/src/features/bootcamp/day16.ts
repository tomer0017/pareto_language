import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m17Steps } from './practiceSupermarket.js';

/**
 * Mission 17 — Supermarket & Everyday Shopping. The conversation is LOCKED (mission17.test.ts pins it
 * word for word); the journey around it is `m17Steps` (practiceSupermarket.ts). The three production
 * tools keep their sentence ids; off-scope sentences are archived in retired.ts. Service register.
 */
export const DAY16_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.super.where-is', text: 'Where is the milk?', meaning: T('איפה החלב?', 'Where is the milk?'),
    tip: T('התבנית: Where is the ___? — מוצאת כל מוצר בכל חנות.', 'Template: Where is the ___? — finds any product in any shop.') },
  { id: 'en.phrase.super.just-this', text: 'Just this, thanks.', meaning: T('רק את זה, תודה.', 'Just this, thanks.') },
  { id: 'en.phrase.super.need-bag', text: 'Could I get a bag?', meaning: T('אפשר שקית?', 'Could I get a bag?') },
  // Not taught or tested here: kept, id and wording, because the Everyday checkpoint (Mission 18) offers
  // it as a wrong option — an archived sentence may not appear in any mission.
  { id: 'en.phrase.super.do-you-have', text: 'Do you have bread?', meaning: T('יש לכם לחם?', 'Do you have bread?'),
    tip: T('התבנית: Do you have ___? — בודקת אם קיים במלאי.', 'Template: Do you have ___? — checks if it’s in stock.') },
  // hear — the staff's whole lines
  { id: 'en.reply.super.can-help', text: 'Hi there! Can I help you find something?', meaning: T('היי! לעזור לך למצוא משהו?', 'Hi there! Can I help you find something?') },
  { id: 'en.reply.super.aisle-three', text: 'The milk is in aisle three, on the left.', meaning: T('החלב במעבר שלוש, משמאל.', 'The milk is in aisle three, on the left.') },
  { id: 'en.reply.super.everything', text: 'Hi! Is that everything?', meaning: T('היי! זה הכל?', 'Hi! Is that everything?') },
  { id: 'en.reply.super.bag-q', text: 'Do you need a bag?', meaning: T('צריך שקית?', 'Do you need a bag?') },
  { id: 'en.reply.super.card-here', text: 'Insert your card here… all done. Have a nice day!', meaning: T('הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!', 'Insert your card here… all done. Have a nice day!') },
  // "Thank you!" — the toolkit's own sentence (prior learning: never taught here)
  ...recovery('en.phrase.recovery.thank-you'),
];

const SCENE_SUPER: BootcampDialogue = {
  id: 'supermarket',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the trip does not fit — a miss is
  // asked again, slowly, and the same choice comes back. "At the checkout…" is a silent cue.
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hi there! Can I help you find something?', he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Where is the milk?', he: 'איפה החלב?', itemId: 'en.phrase.super.where-is', correct: true, next: 'n2' },
      { en: 'Just this, thanks.', he: 'רק את זה, תודה.', itemId: 'en.phrase.super.just-this', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: 'Hi there! Can I help you find something?', he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'n2', who: 'npc', next: 'c2', en: 'The milk is in aisle three, on the left.', he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Could I get a bag?', he: 'אפשר שקית?', itemId: 'en.phrase.super.need-bag', correct: false, next: 'm2' },
    ] },
    { id: 'm2', who: 'npc', slow: true, next: 'c2', en: 'The milk is in aisle three, on the left.', he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'n3', who: 'npc', next: 'c3', cue: T('בקופה…', 'At the checkout…'), en: 'Hi! Is that everything?', he: 'היי! זה הכל?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Just this, thanks.', he: 'רק את זה, תודה.', itemId: 'en.phrase.super.just-this', correct: true, next: 'n4' },
      { en: 'Where is the milk?', he: 'איפה החלב?', itemId: 'en.phrase.super.where-is', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: 'Hi! Is that everything?', he: 'היי! זה הכל?' },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Do you need a bag?', he: 'צריך שקית?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Could I get a bag?', he: 'אפשר שקית?', itemId: 'en.phrase.super.need-bag', correct: true, next: 'n5' },
      { en: 'Just this, thanks.', he: 'רק את זה, תודה.', itemId: 'en.phrase.super.just-this', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Do you need a bag?', he: 'צריך שקית?' },
    { id: 'n5', who: 'npc', end: true, en: 'Insert your card here… all done. Have a nice day!', he: 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!' },
  ],
};

export const DAY16: BootcampDayContent = {
  day: 16,
  title: T('סופרמרקט וקניות יום-יום', 'Supermarket & Everyday Shopping'),
  items: DAY16_ITEMS,
  dialogues: { supermarket: SCENE_SUPER },
  // The whole journey is shared by all languages: see practiceSupermarket.ts (`m17Steps`).
  steps: m17Steps('en'),
};
