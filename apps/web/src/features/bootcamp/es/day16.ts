import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { m17Flow } from '../practiceEveryday.js';

/**
 * Spanish Mission 17 — "Supermercado" (Supermarket). Spanish parallel of English mission 16: find it,
 * weigh it, pay for it — self-checkout included, zero dependence on anyone. `tr:{en,he}` glosses;
 * `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY16_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.super.where-is', text: '¿Dónde está la leche?', meaning: T('איפה החלב?', 'Where is the milk?'),
    tip: T('התבנית: ¿Dónde está ___ ? — מוצאת כל מוצר בכל חנות.', 'Template: ¿Dónde está ___ ? — finds any product in any shop.') },
  { id: 'es.phrase.super.do-you-have', text: '¿Tienen pan?', meaning: T('יש לכם לחם?', 'Do you have bread?'),
    tip: T('התבנית: ¿Tienen ___ ? — בודקת אם קיים במלאי.', 'Template: ¿Tienen ___ ? — checks if it’s in stock.') },
  { id: 'es.phrase.super.just-this', text: 'Solo esto, gracias.', meaning: T('רק את זה, תודה.', 'Just this, thanks.') },
  { id: 'es.phrase.super.need-bag', text: '¿Me da una bolsa?', meaning: T('אפשר שקית?', 'Could I get a bag?') },
  // hear — signs and cashier lines
  { id: 'es.reply.super.aisle-three', text: 'Está en el pasillo tres.', meaning: T('זה במעבר שלוש.', "It's in aisle three.") },
  { id: 'es.reply.super.over-there', text: 'Allí, a la izquierda.', meaning: T('שם, משמאל.', 'Over there, on the left.') },
  { id: 'es.reply.super.bag-q', text: '¿Necesita una bolsa?', meaning: T('צריך שקית?', 'Do you need a bag?') },
  { id: 'es.reply.super.card-here', text: 'Inserte su tarjeta aquí.', meaning: T('הכנס את הכרטיס כאן.', 'Insert your card here.') },
  { id: 'es.reply.super.sold-out', text: 'Lo siento, se ha agotado.', meaning: T('סליחה, אזל המלאי.', "Sorry, we're sold out.") },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.show-me', 'es.phrase.recovery.thank-you'),
];

const SCENE_SUPER: BootcampDialogue = {
  id: 'supermarket',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿Le ayudo a encontrar algo?', tr: TR('Hi there! Can I help you find something?', 'היי! לעזור לך למצוא משהו?'), he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: '¿Dónde está la leche?', tr: TR('Where is the milk?', 'איפה החלב?'), he: 'איפה החלב?', itemId: 'es.phrase.super.where-is', correct: true, next: 'n2' },
      { en: '¿Tienen pan?', tr: TR('Do you have bread?', 'יש לכם לחם?'), he: 'יש לכם לחם?', itemId: 'es.phrase.super.do-you-have', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: '¿Pan? Sí — recién hecho esta mañana, en el pasillo uno.', tr: TR('Bread? Yes — fresh this morning, in aisle one.', 'לחם? כן — טרי מהבוקר, במעבר אחת.'), he: 'לחם? כן — טרי מהבוקר, במעבר אחת.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: '¿Dónde está la leche?', tr: TR('Where is the milk?', 'איפה החלב?'), he: 'איפה החלב?', itemId: 'es.phrase.super.where-is', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'La leche está en el pasillo tres, a la izquierda.', tr: TR("The milk is in aisle three, on the left.", 'החלב במעבר שלוש, משמאל.'), he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Pasillo — tres — a la izquierda.', tr: TR('Aisle — three — on the left.', 'מעבר — שלוש — משמאל.'), he: 'מעבר — שלוש — משמאל.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', cue: T('בקופה…', 'At the checkout…'), en: '¡Hola! ¿Eso es todo?', tr: TR('Hi! Is that everything?', 'היי! זה הכל?'), he: 'היי! זה הכל?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Me lo puede mostrar?', tr: TR('Can you show me?', 'אתה יכול להראות לי? (כלי — כשמילים לא מספיקות)'), he: 'אתה יכול להראות לי?', itemId: 'es.phrase.recovery.show-me', correct: true, next: 'r3' },
      { en: 'Solo esto, gracias.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'es.phrase.super.just-this', correct: true, next: 'n4' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Claro — póngalo aquí, pulse la imagen, listo.', tr: TR('Of course — put it here, press the picture, done.', 'בטח — שים כאן, לחץ על התמונה, גמרנו.'), he: 'בטח — שים כאן, לחץ על התמונה, גמרנו.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Solo esto, gracias.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'es.phrase.super.just-this', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: '¿Necesita una bolsa?', tr: TR('Do you need a bag?', 'צריך שקית?'), he: 'צריך שקית?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: '¿Me da una bolsa?', tr: TR('Could I get a bag?', 'אפשר שקית?'), he: 'אפשר שקית?', itemId: 'es.phrase.super.need-bag', correct: true, next: 'n5' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Inserte su tarjeta aquí… listo. ¡Que tenga un buen día!', tr: TR('Insert your card here… all done. Have a nice day!', 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!'), he: 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!' },
  ],
};

export const DAY16_ES: BootcampDayContent = {
  day: 16,
  title: T('סופרמרקט וקניות יום-יום', 'Supermarket & Everyday Shopping'),
  items: DAY16_ES_ITEMS,
  dialogues: { supermarket: SCENE_SUPER },
  steps: [
    { kind: 'talk', icon: '🛒', title: T('משימה 17: סופרמרקט', 'Mission 17: Supermarket'),
      body: [
        T('סופר, לבד: למצוא מוצר, להבין באיזה מעבר ובאיזה צד הוא, לעבור קופה ולבקש שקית.', 'The supermarket, on your own: find a product, understand which aisle and which side it is on, get through the checkout and ask for a bag.'),
        T('כמה שאלות קצרות — וכמה תשובות שכדאי לזהות כשאומרים אותן מהר.', 'A few short questions — and a few answers worth recognizing when they are said fast.'),
      ], cta: T('להיכנס לסופר', 'Walk into the shop') },
    // From the key sentences onward the flow is shared by all languages: see practiceEveryday.ts.
    ...m17Flow('es'),
  ],
};
