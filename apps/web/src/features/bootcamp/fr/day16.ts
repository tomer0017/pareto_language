import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { m17Steps } from '../practiceSupermarket.js';

/**
 * French Mission 17 — "Supermarché" (Supermarket & Everyday Shopping). The conversation is LOCKED
 * (mission17.test.ts pins it word for word); the journey around it is `m17Steps` (practiceSupermarket.ts),
 * shared with English. `tr:{en,he}` glosses; `fr.*` ids; vous. AI linguistic review completed;
 * native review still recommended.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY16_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.super.where-is', text: 'Où est le lait ?', meaning: T('איפה החלב?', 'Where is the milk?'),
    tip: T('התבנית: Où est le/la ___ ? — מוצאת כל מוצר בכל חנות.', 'Template: Où est le/la ___ ? — finds any product in any shop.') },
  { id: 'fr.phrase.super.just-this', text: 'Juste ça, merci.', meaning: T('רק את זה, תודה.', 'Just this, thanks.') },
  { id: 'fr.phrase.super.need-bag', text: 'Je peux avoir un sac ?', meaning: T('אפשר שקית?', 'Could I get a bag?') },
  // Not taught or tested here: kept, id and wording, because the Everyday checkpoint (Mission 18) offers
  // it as a wrong option — an archived sentence may not appear in any mission.
  { id: 'fr.phrase.super.do-you-have', text: 'Vous avez du pain ?', meaning: T('יש לכם לחם?', 'Do you have bread?'),
    tip: T('התבנית: Vous avez ___ ? — בודקת אם קיים במלאי.', 'Template: Vous avez ___ ? — checks if it’s in stock.') },
  // hear — the staff's whole lines
  { id: 'fr.reply.super.can-help', text: 'Bonjour ! Je peux vous aider à trouver quelque chose ?', meaning: T('היי! לעזור לך למצוא משהו?', 'Hi there! Can I help you find something?') },
  { id: 'fr.reply.super.aisle-three', text: 'Le lait est dans l’allée trois, sur la gauche.', meaning: T('החלב במעבר שלוש, משמאל.', 'The milk is in aisle three, on the left.') },
  { id: 'fr.reply.super.everything', text: 'Bonjour ! Ce sera tout ?', meaning: T('היי! זה הכל?', 'Hi! Is that everything?') },
  { id: 'fr.reply.super.bag-q', text: 'Vous avez besoin d’un sac ?', meaning: T('צריך שקית?', 'Do you need a bag?') },
  { id: 'fr.reply.super.card-here', text: 'Insérez votre carte ici… c’est bon. Bonne journée !', meaning: T('הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!', 'Insert your card here… all done. Have a nice day!') },
  // "Merci !" — the toolkit's own sentence (prior learning: never taught here)
  ...recoveryFr('fr.phrase.recovery.thank-you'),
];

const SCENE_SUPER: BootcampDialogue = {
  id: 'supermarket',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the trip does not fit — a miss is
  // asked again, slowly, and the same choice comes back. "At the checkout…" is a silent cue.
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Je peux vous aider à trouver quelque chose ?', tr: TR('Hi there! Can I help you find something?', 'היי! לעזור לך למצוא משהו?'), he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Où est le lait ?', tr: TR('Where is the milk?', 'איפה החלב?'), he: 'איפה החלב?', itemId: 'fr.phrase.super.where-is', correct: true, next: 'n2' },
      { en: 'Juste ça, merci.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'fr.phrase.super.just-this', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: 'Bonjour ! Je peux vous aider à trouver quelque chose ?', tr: TR('Hi there! Can I help you find something?', 'היי! לעזור לך למצוא משהו?'), he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Le lait est dans l’allée trois, sur la gauche.', tr: TR('The milk is in aisle three, on the left.', 'החלב במעבר שלוש, משמאל.'), he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Je peux avoir un sac ?', tr: TR('Could I get a bag?', 'אפשר שקית?'), he: 'אפשר שקית?', itemId: 'fr.phrase.super.need-bag', correct: false, next: 'm2' },
    ] },
    { id: 'm2', who: 'npc', slow: true, next: 'c2', en: 'Le lait est dans l’allée trois, sur la gauche.', tr: TR('The milk is in aisle three, on the left.', 'החלב במעבר שלוש, משמאל.'), he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'n3', who: 'npc', next: 'c3', cue: T('בקופה…', 'At the checkout…'), en: 'Bonjour ! Ce sera tout ?', tr: TR('Hi! Is that everything?', 'היי! זה הכל?'), he: 'היי! זה הכל?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Juste ça, merci.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'fr.phrase.super.just-this', correct: true, next: 'n4' },
      { en: 'Où est le lait ?', tr: TR('Where is the milk?', 'איפה החלב?'), he: 'איפה החלב?', itemId: 'fr.phrase.super.where-is', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: 'Bonjour ! Ce sera tout ?', tr: TR('Hi! Is that everything?', 'היי! זה הכל?'), he: 'היי! זה הכל?' },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Vous avez besoin d’un sac ?', tr: TR('Do you need a bag?', 'צריך שקית?'), he: 'צריך שקית?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Je peux avoir un sac ?', tr: TR('Could I get a bag?', 'אפשר שקית?'), he: 'אפשר שקית?', itemId: 'fr.phrase.super.need-bag', correct: true, next: 'n5' },
      { en: 'Juste ça, merci.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'fr.phrase.super.just-this', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Vous avez besoin d’un sac ?', tr: TR('Do you need a bag?', 'צריך שקית?'), he: 'צריך שקית?' },
    { id: 'n5', who: 'npc', end: true, en: 'Insérez votre carte ici… c’est bon. Bonne journée !', tr: TR('Insert your card here… all done. Have a nice day!', 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!'), he: 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!' },
  ],
};

export const DAY16_FR: BootcampDayContent = {
  day: 16,
  title: T('סופרמרקט וקניות יום-יום', 'Supermarket & Everyday Shopping'),
  items: DAY16_FR_ITEMS,
  dialogues: { supermarket: SCENE_SUPER },
  // The whole journey is shared by all languages: see practiceSupermarket.ts (`m17Steps`).
  steps: m17Steps('fr'),
};
