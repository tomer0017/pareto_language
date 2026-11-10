import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { m17Steps } from '../practiceSupermarket.js';

/**
 * Spanish Mission 17 — "Supermercado" (Supermarket & Everyday Shopping). The conversation is LOCKED
 * (mission17.test.ts pins it word for word); the journey around it is `m17Steps` (practiceSupermarket.ts),
 * shared with English. `tr:{en,he}` glosses; `es.*` ids; usted. AI linguistic review completed;
 * native review still recommended.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY16_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.super.where-is', text: '¿Dónde está la leche?', meaning: T('איפה החלב?', 'Where is the milk?'),
    tip: T('התבנית: ¿Dónde está ___ ? — מוצאת כל מוצר בכל חנות.', 'Template: ¿Dónde está ___ ? — finds any product in any shop.') },
  { id: 'es.phrase.super.just-this', text: 'Solo esto, gracias.', meaning: T('רק את זה, תודה.', 'Just this, thanks.') },
  { id: 'es.phrase.super.need-bag', text: '¿Me da una bolsa?', meaning: T('אפשר שקית?', 'Could I get a bag?') },
  // Not taught or tested here: kept, id and wording, because the Everyday checkpoint (Mission 18) offers
  // it as a wrong option — an archived sentence may not appear in any mission.
  { id: 'es.phrase.super.do-you-have', text: '¿Tienen pan?', meaning: T('יש לכם לחם?', 'Do you have bread?'),
    tip: T('התבנית: ¿Tienen ___ ? — בודקת אם קיים במלאי.', 'Template: ¿Tienen ___ ? — checks if it’s in stock.') },
  // hear — the staff's whole lines
  { id: 'es.reply.super.can-help', text: '¡Hola! ¿Le ayudo a encontrar algo?', meaning: T('היי! לעזור לך למצוא משהו?', 'Hi there! Can I help you find something?') },
  { id: 'es.reply.super.aisle-three', text: 'La leche está en el pasillo tres, a la izquierda.', meaning: T('החלב במעבר שלוש, משמאל.', 'The milk is in aisle three, on the left.') },
  { id: 'es.reply.super.everything', text: '¡Hola! ¿Eso es todo?', meaning: T('היי! זה הכל?', 'Hi! Is that everything?') },
  { id: 'es.reply.super.bag-q', text: '¿Necesita una bolsa?', meaning: T('צריך שקית?', 'Do you need a bag?') },
  { id: 'es.reply.super.card-here', text: 'Inserte su tarjeta aquí… listo. ¡Que tenga un buen día!', meaning: T('הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!', 'Insert your card here… all done. Have a nice day!') },
  // "¡Gracias!" — the toolkit's own sentence (prior learning: never taught here)
  ...recoveryEs('es.phrase.recovery.thank-you'),
];

const SCENE_SUPER: BootcampDialogue = {
  id: 'supermarket',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the trip does not fit — a miss is
  // asked again, slowly, and the same choice comes back. "At the checkout…" is a silent cue.
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿Le ayudo a encontrar algo?', tr: TR('Hi there! Can I help you find something?', 'היי! לעזור לך למצוא משהו?'), he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: '¿Dónde está la leche?', tr: TR('Where is the milk?', 'איפה החלב?'), he: 'איפה החלב?', itemId: 'es.phrase.super.where-is', correct: true, next: 'n2' },
      { en: 'Solo esto, gracias.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'es.phrase.super.just-this', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: '¡Hola! ¿Le ayudo a encontrar algo?', tr: TR('Hi there! Can I help you find something?', 'היי! לעזור לך למצוא משהו?'), he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'n2', who: 'npc', next: 'c2', en: 'La leche está en el pasillo tres, a la izquierda.', tr: TR('The milk is in aisle three, on the left.', 'החלב במעבר שלוש, משמאל.'), he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: '¿Me da una bolsa?', tr: TR('Could I get a bag?', 'אפשר שקית?'), he: 'אפשר שקית?', itemId: 'es.phrase.super.need-bag', correct: false, next: 'm2' },
    ] },
    { id: 'm2', who: 'npc', slow: true, next: 'c2', en: 'La leche está en el pasillo tres, a la izquierda.', tr: TR('The milk is in aisle three, on the left.', 'החלב במעבר שלוש, משמאל.'), he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'n3', who: 'npc', next: 'c3', cue: T('בקופה…', 'At the checkout…'), en: '¡Hola! ¿Eso es todo?', tr: TR('Hi! Is that everything?', 'היי! זה הכל?'), he: 'היי! זה הכל?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Solo esto, gracias.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'es.phrase.super.just-this', correct: true, next: 'n4' },
      { en: '¿Dónde está la leche?', tr: TR('Where is the milk?', 'איפה החלב?'), he: 'איפה החלב?', itemId: 'es.phrase.super.where-is', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: '¡Hola! ¿Eso es todo?', tr: TR('Hi! Is that everything?', 'היי! זה הכל?'), he: 'היי! זה הכל?' },
    { id: 'n4', who: 'npc', next: 'c4', en: '¿Necesita una bolsa?', tr: TR('Do you need a bag?', 'צריך שקית?'), he: 'צריך שקית?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: '¿Me da una bolsa?', tr: TR('Could I get a bag?', 'אפשר שקית?'), he: 'אפשר שקית?', itemId: 'es.phrase.super.need-bag', correct: true, next: 'n5' },
      { en: 'Solo esto, gracias.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'es.phrase.super.just-this', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: '¿Necesita una bolsa?', tr: TR('Do you need a bag?', 'צריך שקית?'), he: 'צריך שקית?' },
    { id: 'n5', who: 'npc', end: true, en: 'Inserte su tarjeta aquí… listo. ¡Que tenga un buen día!', tr: TR('Insert your card here… all done. Have a nice day!', 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!'), he: 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!' },
  ],
};

export const DAY16_ES: BootcampDayContent = {
  day: 16,
  title: T('סופרמרקט וקניות יום-יום', 'Supermarket & Everyday Shopping'),
  items: DAY16_ES_ITEMS,
  dialogues: { supermarket: SCENE_SUPER },
  // The whole journey is shared by all languages: see practiceSupermarket.ts (`m17Steps`).
  steps: m17Steps('es'),
};
