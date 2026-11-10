import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { m19Steps } from '../practiceTransport.js';

/**
 * Spanish Mission 19 — "Transporte público" (Public Transport): catch your train. The conversation is
 * LOCKED (mission19.test.ts pins it word for word); the journey around it is `m19Steps`
 * (practiceTransport.ts). `tr:{en,he}` glosses; `es.*` ids; es-ES: "billete", "andén", "parada"; usted. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY18_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.trans.one-ticket', text: 'Un billete para el centro, por favor.', meaning: T('כרטיס אחד למרכז, בבקשה.', 'One ticket to the centre, please.'),
    tip: T('התבנית: Un billete para ___ — קונה כרטיס לכל יעד.', 'Template: Un billete para ___ — buys a ticket to anywhere.') },
  { id: 'es.phrase.trans.which-platform', text: '¿Qué andén?', meaning: T('איזה רציף?', 'Which platform?'),
    tip: T('שתי מילים שמונעות עלייה לרכבת הלא נכונה.', 'Two words that stop you boarding the wrong train.') },
  { id: 'es.phrase.trans.does-stop', text: '¿Para en el museo?', meaning: T('זה עוצר במוזיאון?', 'Does this stop at the museum?'),
    tip: T('התבנית: ¿Para en ___ ? — מוודאת שאתה יורד נכון.', 'Template: ¿Para en ___ ? — makes sure you get off in the right place.') },
  { id: 'es.phrase.trans.single', text: 'Solo ida, por favor.', meaning: T('הלוך, בבקשה.', 'Single, please.') },
  // hear — the staff's whole lines
  { id: 'es.reply.trans.where-headed', text: '¡Hola! ¿A dónde va?', meaning: T('שלום! לאן אתה נוסע?', 'Hello! Where are you headed?') },
  { id: 'es.reply.trans.single-return', text: '¿Solo ida o ida y vuelta?', meaning: T('הלוך או הלוך-חזור?', 'Single or return?') },
  { id: 'es.reply.trans.fare', text: 'Son tres euros. Sale cada diez minutos.', meaning: T('זה שלושה יורו. יוצא כל עשר דקות.', "That's three euros. It leaves every ten minutes.") },
  { id: 'es.reply.trans.platform-straight', text: 'Andén número dos. Todo recto.', meaning: T('רציף שתיים. ישר קדימה.', 'Platform two. Straight ahead.') },
  { id: 'es.reply.trans.hop-on', text: 'El tren está justo ahí. Suba.', meaning: T('הרכבת ממש כאן. עלה.', "The train's right here. Hop on.") },
  { id: 'es.reply.trans.stops-tell', text: 'Sí — son tres paradas. Le aviso cuándo.', meaning: T('כן — זה שלוש תחנות. אני אגיד לך מתי.', "Yes — it's three stops. I'll tell you when.") },
  { id: 'es.reply.trans.stop-is-next', text: 'Ya llegamos — su parada es la siguiente. ¡Que disfrute del museo!', meaning: T('הגענו — התחנה שלך הבאה. תיהנה במוזיאון!', 'Here we are — your stop is next. Enjoy the museum!') },
  // Not taught or tested here: kept, id and wording, because the City checkpoint (Mission 24) reuses them.
  { id: 'es.reply.trans.three-stops', text: 'Son tres paradas.', meaning: T('זה שלוש תחנות.', "It's three stops.") },
  { id: 'es.reply.trans.wrong-way', text: 'Va en dirección contraria.', meaning: T('אתה בכיוון הלא נכון.', "You're going the wrong way.") },
  // "Thank you!" — the toolkit's own sentence (prior learning: never taught here)
  ...recoveryEs('es.phrase.recovery.thank-you'),
];

const SCENE_TRANSPORT: BootcampDialogue = {
  id: 'transport',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the ride does not fit — a miss is
  // asked again, slowly, and the same choice comes back.
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿A dónde va?', tr: TR('Hello! Where are you headed?', 'שלום! לאן אתה נוסע?'), he: 'שלום! לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un billete para el centro, por favor.', tr: TR('One ticket to the centre, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'es.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: '¿Para en el museo?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'es.phrase.trans.does-stop', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: '¡Hola! ¿A dónde va?', tr: TR('Hello! Where are you headed?', 'שלום! לאן אתה נוסע?'), he: 'שלום! לאן אתה נוסע?' },
    { id: 'n2', who: 'npc', next: 'c2', en: '¿Solo ida o ida y vuelta?', tr: TR('Single or return?', 'הלוך או הלוך-חזור?'), he: 'הלוך או הלוך-חזור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Solo ida, por favor.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', itemId: 'es.phrase.trans.single', correct: true, next: 'n3' },
      { en: '¿Qué andén?', tr: TR('Which platform?', 'איזה רציף?'), he: 'איזה רציף?', itemId: 'es.phrase.trans.which-platform', correct: false, next: 'm2' },
    ] },
    { id: 'm2', who: 'npc', slow: true, next: 'c2', en: '¿Solo ida o ida y vuelta?', tr: TR('Single or return?', 'הלוך או הלוך-חזור?'), he: 'הלוך או הלוך-חזור?' },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Son tres euros. Sale cada diez minutos.', tr: TR("That's three euros. It leaves every ten minutes.", 'זה שלושה יורו. יוצא כל עשר דקות.'), he: 'זה שלושה יורו. יוצא כל עשר דקות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Qué andén?', tr: TR('Which platform?', 'איזה רציף?'), he: 'איזה רציף?', itemId: 'es.phrase.trans.which-platform', correct: true, next: 'n4' },
      { en: 'Solo ida, por favor.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', itemId: 'es.phrase.trans.single', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: 'Son tres euros. Sale cada diez minutos.', tr: TR("That's three euros. It leaves every ten minutes.", 'זה שלושה יורו. יוצא כל עשר דקות.'), he: 'זה שלושה יורו. יוצא כל עשר דקות.' },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Andén número dos. Todo recto.', tr: TR('Platform two. Straight ahead.', 'רציף שתיים. ישר קדימה.'), he: 'רציף שתיים. ישר קדימה.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
      { en: 'Un billete para el centro, por favor.', tr: TR('One ticket to the centre, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'es.phrase.trans.one-ticket', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Andén número dos. Todo recto.', tr: TR('Platform two. Straight ahead.', 'רציף שתיים. ישר קדימה.'), he: 'רציף שתיים. ישר קדימה.' },
    { id: 'n5', who: 'npc', next: 'c5', en: 'El tren está justo ahí. Suba.', tr: TR("The train's right here. Hop on.", 'הרכבת ממש כאן. עלה.'), he: 'הרכבת ממש כאן. עלה.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¿Para en el museo?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'es.phrase.trans.does-stop', correct: true, next: 'n6' },
      { en: '¿Qué andén?', tr: TR('Which platform?', 'איזה רציף?'), he: 'איזה רציף?', itemId: 'es.phrase.trans.which-platform', correct: false, next: 'm5' },
    ] },
    { id: 'm5', who: 'npc', slow: true, next: 'c5', en: 'El tren está justo ahí. Suba.', tr: TR("The train's right here. Hop on.", 'הרכבת ממש כאן. עלה.'), he: 'הרכבת ממש כאן. עלה.' },
    { id: 'n6', who: 'npc', next: 'c6', en: 'Sí — son tres paradas. Le aviso cuándo.', tr: TR("Yes — it's three stops. I'll tell you when.", 'כן — זה שלוש תחנות. אני אגיד לך מתי.'), he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n7' },
      { en: 'Solo ida, por favor.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', itemId: 'es.phrase.trans.single', correct: false, next: 'm6' },
    ] },
    { id: 'm6', who: 'npc', slow: true, next: 'c6', en: 'Sí — son tres paradas. Le aviso cuándo.', tr: TR("Yes — it's three stops. I'll tell you when.", 'כן — זה שלוש תחנות. אני אגיד לך מתי.'), he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'n7', who: 'npc', end: true, en: 'Ya llegamos — su parada es la siguiente. ¡Que disfrute del museo!', tr: TR('Here we are — your stop is next. Enjoy the museum!', 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!'), he: 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!' },
  ],
};

export const DAY18_ES: BootcampDayContent = {
  day: 18,
  title: T('תחבורה ציבורית', 'Public Transport'),
  items: DAY18_ES_ITEMS,
  dialogues: { transport: SCENE_TRANSPORT },
  // The whole journey is shared by all languages: see practiceTransport.ts (`m19Steps`).
  steps: m19Steps('es'),
};
