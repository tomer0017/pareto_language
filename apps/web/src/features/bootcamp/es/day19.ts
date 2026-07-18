import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 19 — "Transporte público" (Public Transport). Spanish parallel of English day 19:
 * ticket, platform, direction, the right stop — half of it pure listening. `tr:{en,he}` glosses;
 * `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY19_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.trans.one-ticket', text: 'Un boleto para el centro, por favor.', meaning: T('כרטיס אחד למרכז, בבקשה.', 'One ticket to the center, please.'),
    tip: T('התבנית: Un boleto para ___ — קונה כרטיס לכל יעד.', 'Template: Un boleto para ___ — buys a ticket to anywhere.') },
  { id: 'es.phrase.trans.which-platform', text: '¿Qué andén?', meaning: T('איזה רציף?', 'Which platform?'),
    tip: T('שתי מילים שמונעות עלייה לרכבת הלא נכונה.', 'Two words that stop you boarding the wrong train.') },
  { id: 'es.phrase.trans.does-stop', text: '¿Para en el museo?', meaning: T('זה עוצר במוזיאון?', 'Does this stop at the museum?'),
    tip: T('התבנית: ¿Para en ___ ? — מוודאת שאתה יורד נכון.', 'Template: ¿Para en ___ ? — makes sure you get off in the right place.') },
  { id: 'es.phrase.trans.next-one', text: '¿Cuándo es el próximo?', meaning: T('מתי הבא?', "When's the next one?") },
  // hear — booth + platform
  { id: 'es.reply.trans.single-return', text: '¿Solo ida o ida y vuelta?', meaning: T('הלוך או הלוך-חזור?', 'Single or return?') },
  { id: 'es.reply.trans.platform-two', text: 'Andén número dos.', meaning: T('רציף שתיים.', 'Platform two.') },
  { id: 'es.reply.trans.every-ten', text: 'Cada diez minutos.', meaning: T('כל עשר דקות.', 'Every ten minutes.') },
  { id: 'es.reply.trans.three-stops', text: 'Son tres paradas.', meaning: T('זה שלוש תחנות.', "It's three stops.") },
  { id: 'es.reply.trans.wrong-way', text: 'Va en dirección contraria.', meaning: T('אתה בכיוון הלא נכון.', "You're going the wrong way.") },
  { id: 'es.reply.trans.stop-next', text: 'Su parada es la siguiente.', meaning: T('התחנה שלך הבאה.', 'Your stop is next.') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_TRANSPORT: BootcampDialogue = {
  id: 'transport',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿A dónde va?', tr: TR('Hello! Where are you headed?', 'שלום! לאן אתה נוסע?'), he: 'שלום! לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un boleto para el centro, por favor.', tr: TR('One ticket to the center, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'es.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: '¿A — dónde — va?', tr: TR('Where — are you — going?', 'לאן — אתה — נוסע?'), he: 'לאן — אתה — נוסע?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Un boleto para el centro, por favor.', tr: TR('One ticket to the center, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'es.phrase.trans.one-ticket', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: '¿Solo ida o ida y vuelta?', tr: TR('Single or return?', 'הלוך או הלוך-חזור?'), he: 'הלוך או הלוך-חזור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Solo ida, por favor.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', correct: true, next: 'n3' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: '¿Solo ida — o — ida y vuelta?', tr: TR('Single — or — return?', 'הלוך — או — הלוך-חזור?'), he: 'הלוך — או — הלוך-חזור?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Solo ida, por favor.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'Son tres euros. Andén número dos, sale cada diez minutos.', tr: TR("That's three euros. Platform two, leaves every ten minutes.", 'זה שלושה יורו. רציף שתיים, יוצא כל עשר דקות.'), he: 'זה שלושה יורו. רציף שתיים, יוצא כל עשר דקות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Qué andén?', tr: TR('Which platform?', 'איזה רציף?'), he: 'איזה רציף?', itemId: 'es.phrase.trans.which-platform', correct: true, next: 'n3b' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n3b', who: 'npc', slow: true, next: 'c3b', en: 'Andén — dos. Todo recto.', tr: TR('Platform — two. Straight ahead.', 'רציף — שתיים. ישר קדימה.'), he: 'רציף — שתיים. ישר קדימה.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'El tren está justo ahí. Suba.', tr: TR("The train's right here. Hop on.", 'הרכבת ממש כאן. עלה.'), he: 'הרכבת ממש כאן. עלה.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: '¿Para en el museo?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'es.phrase.trans.does-stop', correct: true, next: 'n5' },
      { en: '¿Cuándo es el próximo?', tr: TR("When's the next one?", 'מתי הבא?'), he: 'מתי הבא?', itemId: 'es.phrase.trans.next-one', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c4b', en: '¿El próximo? Cada diez minutos — pero este va bien, suba.', tr: TR('The next one? Every ten minutes — but this one is fine, hop on.', 'הבא? כל עשר דקות — אבל זה בסדר, עלה.'), he: 'הבא? כל עשר דקות — אבל זה בסדר, עלה.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: '¿Para en el museo?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'es.phrase.trans.does-stop', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Sí — son tres paradas. Le aviso cuándo.', tr: TR("Yes — it's three stops. I'll tell you when.", 'כן — זה שלוש תחנות. אני אגיד לך מתי.'), he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Son — tres — paradas.', tr: TR("It's — three — stops.", 'זה — שלוש — תחנות.'), he: 'זה — שלוש — תחנות.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Ya llegamos — su parada es la siguiente. ¡Que disfrute del museo!', tr: TR('Here we are — your stop is next. Enjoy the museum!', 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!'), he: 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!' },
  ],
};

export const DAY19_ES: BootcampDayContent = {
  day: 19,
  title: T('תחבורה ציבורית', 'Public Transport'),
  items: DAY19_ES_ITEMS,
  dialogues: { transport: SCENE_TRANSPORT },
  steps: [
    { kind: 'talk', icon: '🚇', title: T('משימה 19: תחבורה ציבורית', 'Mission 19: Public Transport'),
      body: [
        T('העיר זזה בשבילך — בזול. כרטיס, רציף, כיוון, והתחנה הנכונה.', 'The city moves for you — cheaply. Ticket, platform, direction, the right stop.'),
        T('חצי מהמשימה הזאת היא האזנה: הכרזות ותשובות מהירות של איזה-רציף.', 'Half of this mission is listening: announcements and fast which-platform answers.'),
      ], cta: T('לגשת לדלפק הכרטיסים', 'Step up to the ticket desk') },
    { kind: 'tool', itemId: 'es.phrase.trans.one-ticket', index: 1, total: 4, label: T('לקנות כרטיס', 'Buy a ticket') },
    { kind: 'tool', itemId: 'es.phrase.trans.which-platform', index: 2, total: 4, label: T('לאתר רציף', 'Find the platform') },
    { kind: 'tool', itemId: 'es.phrase.trans.does-stop', index: 3, total: 4, label: T('לוודא יעד', 'Confirm the stop') },
    { kind: 'tool', itemId: 'es.phrase.trans.next-one', index: 4, total: 4, label: T('לשאול על הבא', 'Ask about the next one') },
    { kind: 'replies', saidItemId: 'es.phrase.trans.one-ticket',
      replyIds: ['es.reply.trans.single-return', 'es.reply.trans.platform-two', 'es.reply.trans.every-ten', 'es.reply.trans.three-stops'] },
    { kind: 'receipt', text: T('אתה מזהה את תשובות הדלפק והרציף — הלוך/חזור, מספר רציף, תדירות.', 'You recognize the booth and platform answers — single/return, platform number, frequency.') },
    { kind: 'quiz', itemId: 'es.reply.trans.single-return', wrongIds: ['es.reply.trans.platform-two', 'es.reply.trans.three-stops'] },
    { kind: 'quiz', itemId: 'es.reply.trans.every-ten', wrongIds: ['es.reply.trans.wrong-way', 'es.reply.trans.stop-next'] },
    { kind: 'dialogue', dialogueId: 'transport' },
    { kind: 'receipt', text: T('קנית כרטיס, מצאת רציף, ווידאת שהרכבת עוצרת ביעד שלך.', 'You bought a ticket, found the platform, and confirmed the train stops at your destination.') },
    { kind: 'swipe', itemIds: DAY19_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Este tren lleva retraso — mejor coja el autobús alternativo en la parada C.', tr: TR("This train's been delayed — you'll want the replacement bus from stand C instead.", 'הרכבת הזאת מתעכבת — עדיף לך את האוטובוס החלופי מעמדה C.'), he: 'הרכבת הזאת מתעכבת — עדיף לך את האוטובוס החלופי מעמדה C.' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.trans.which-platform' },
    { kind: 'receipt', text: T('הודעת שיבוש מהירה — וביקשת שיחזרו במקום לעלות לרכבת הלא נכונה.', 'A fast disruption announcement — and you asked them to repeat instead of boarding the wrong train.') },
    { kind: 'summary' },
  ],
};
