import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { m19Steps } from '../practiceTransport.js';

/**
 * French Mission 19 — "Transports en commun" (Public Transport): catch your train. The conversation is
 * LOCKED (mission19.test.ts pins it word for word); the journey around it is `m19Steps`
 * (practiceTransport.ts). `tr:{en,he}` glosses; `fr.*` ids; vous. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY18_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.trans.one-ticket', text: 'Un billet pour le centre, s’il vous plaît.', meaning: T('כרטיס אחד למרכז, בבקשה.', 'One ticket to the centre, please.'),
    tip: T('התבנית: Un billet pour ___ — קונה כרטיס לכל יעד.', 'Template: Un billet pour ___ — buys a ticket to anywhere.') },
  { id: 'fr.phrase.trans.which-platform', text: 'Quel quai ?', meaning: T('איזה רציף?', 'Which platform?'),
    tip: T('שתי מילים שמונעות עלייה לרכבת הלא נכונה.', 'Two words that stop you boarding the wrong train.') },
  { id: 'fr.phrase.trans.does-stop', text: 'Ça s’arrête au musée ?', meaning: T('זה עוצר במוזיאון?', 'Does this stop at the museum?'),
    tip: T('התבנית: Ça s’arrête à ___ ? — מוודאת שאתה יורד נכון.', 'Template: Ça s’arrête à ___? — makes sure you get off in the right place.') },
  { id: 'fr.phrase.trans.single', text: 'Aller simple, s’il vous plaît.', meaning: T('הלוך, בבקשה.', 'Single, please.') },
  // hear — the staff's whole lines
  { id: 'fr.reply.trans.where-headed', text: 'Bonjour ! Vous allez où ?', meaning: T('שלום! לאן אתה נוסע?', 'Hello! Where are you headed?') },
  { id: 'fr.reply.trans.single-return', text: 'Aller simple ou aller-retour ?', meaning: T('הלוך או הלוך-חזור?', 'Single or return?') },
  { id: 'fr.reply.trans.fare', text: 'Ça fait trois euros. Ça part toutes les dix minutes.', meaning: T('זה שלושה יורו. יוצא כל עשר דקות.', "That's three euros. It leaves every ten minutes.") },
  { id: 'fr.reply.trans.platform-straight', text: 'Quai numéro deux. Tout droit.', meaning: T('רציף שתיים. ישר קדימה.', 'Platform two. Straight ahead.') },
  { id: 'fr.reply.trans.hop-on', text: 'Le train est juste là. Montez.', meaning: T('הרכבת ממש כאן. עלה.', "The train's right here. Hop on.") },
  { id: 'fr.reply.trans.stops-tell', text: 'Oui — c’est à trois arrêts. Je vous dirai quand.', meaning: T('כן — זה שלוש תחנות. אני אגיד לך מתי.', "Yes — it's three stops. I'll tell you when.") },
  { id: 'fr.reply.trans.stop-is-next', text: 'Nous voilà — votre arrêt est le prochain. Bonne visite du musée !', meaning: T('הגענו — התחנה שלך הבאה. תיהנה במוזיאון!', 'Here we are — your stop is next. Enjoy the museum!') },
  // Not taught or tested here: kept, id and wording, because the City checkpoint (Mission 24) reuses them.
  { id: 'fr.reply.trans.three-stops', text: 'C’est à trois arrêts.', meaning: T('זה שלוש תחנות.', "It's three stops.") },
  { id: 'fr.reply.trans.wrong-way', text: 'Vous allez dans le mauvais sens.', meaning: T('אתה בכיוון הלא נכון.', "You're going the wrong way.") },
  // "Thank you!" — the toolkit's own sentence (prior learning: never taught here)
  ...recoveryFr('fr.phrase.recovery.thank-you'),
];

const SCENE_TRANSPORT: BootcampDialogue = {
  id: 'transport',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the ride does not fit — a miss is
  // asked again, slowly, and the same choice comes back.
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Vous allez où ?', tr: TR('Hello! Where are you headed?', 'שלום! לאן אתה נוסע?'), he: 'שלום! לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un billet pour le centre, s’il vous plaît.', tr: TR('One ticket to the centre, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'fr.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Ça s’arrête au musée ?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'fr.phrase.trans.does-stop', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: 'Bonjour ! Vous allez où ?', tr: TR('Hello! Where are you headed?', 'שלום! לאן אתה נוסע?'), he: 'שלום! לאן אתה נוסע?' },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Aller simple ou aller-retour ?', tr: TR('Single or return?', 'הלוך או הלוך-חזור?'), he: 'הלוך או הלוך-חזור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Aller simple, s’il vous plaît.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', itemId: 'fr.phrase.trans.single', correct: true, next: 'n3' },
      { en: 'Quel quai ?', tr: TR('Which platform?', 'איזה רציף?'), he: 'איזה רציף?', itemId: 'fr.phrase.trans.which-platform', correct: false, next: 'm2' },
    ] },
    { id: 'm2', who: 'npc', slow: true, next: 'c2', en: 'Aller simple ou aller-retour ?', tr: TR('Single or return?', 'הלוך או הלוך-חזור?'), he: 'הלוך או הלוך-חזור?' },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Ça fait trois euros. Ça part toutes les dix minutes.', tr: TR("That's three euros. It leaves every ten minutes.", 'זה שלושה יורו. יוצא כל עשר דקות.'), he: 'זה שלושה יורו. יוצא כל עשר דקות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Quel quai ?', tr: TR('Which platform?', 'איזה רציף?'), he: 'איזה רציף?', itemId: 'fr.phrase.trans.which-platform', correct: true, next: 'n4' },
      { en: 'Aller simple, s’il vous plaît.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', itemId: 'fr.phrase.trans.single', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: 'Ça fait trois euros. Ça part toutes les dix minutes.', tr: TR("That's three euros. It leaves every ten minutes.", 'זה שלושה יורו. יוצא כל עשר דקות.'), he: 'זה שלושה יורו. יוצא כל עשר דקות.' },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Quai numéro deux. Tout droit.', tr: TR('Platform two. Straight ahead.', 'רציף שתיים. ישר קדימה.'), he: 'רציף שתיים. ישר קדימה.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
      { en: 'Un billet pour le centre, s’il vous plaît.', tr: TR('One ticket to the centre, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'fr.phrase.trans.one-ticket', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Quai numéro deux. Tout droit.', tr: TR('Platform two. Straight ahead.', 'רציף שתיים. ישר קדימה.'), he: 'רציף שתיים. ישר קדימה.' },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Le train est juste là. Montez.', tr: TR("The train's right here. Hop on.", 'הרכבת ממש כאן. עלה.'), he: 'הרכבת ממש כאן. עלה.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Ça s’arrête au musée ?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'fr.phrase.trans.does-stop', correct: true, next: 'n6' },
      { en: 'Quel quai ?', tr: TR('Which platform?', 'איזה רציף?'), he: 'איזה רציף?', itemId: 'fr.phrase.trans.which-platform', correct: false, next: 'm5' },
    ] },
    { id: 'm5', who: 'npc', slow: true, next: 'c5', en: 'Le train est juste là. Montez.', tr: TR("The train's right here. Hop on.", 'הרכבת ממש כאן. עלה.'), he: 'הרכבת ממש כאן. עלה.' },
    { id: 'n6', who: 'npc', next: 'c6', en: 'Oui — c’est à trois arrêts. Je vous dirai quand.', tr: TR("Yes — it's three stops. I'll tell you when.", 'כן — זה שלוש תחנות. אני אגיד לך מתי.'), he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n7' },
      { en: 'Aller simple, s’il vous plaît.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', itemId: 'fr.phrase.trans.single', correct: false, next: 'm6' },
    ] },
    { id: 'm6', who: 'npc', slow: true, next: 'c6', en: 'Oui — c’est à trois arrêts. Je vous dirai quand.', tr: TR("Yes — it's three stops. I'll tell you when.", 'כן — זה שלוש תחנות. אני אגיד לך מתי.'), he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'n7', who: 'npc', end: true, en: 'Nous voilà — votre arrêt est le prochain. Bonne visite du musée !', tr: TR('Here we are — your stop is next. Enjoy the museum!', 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!'), he: 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!' },
  ],
};

export const DAY18_FR: BootcampDayContent = {
  day: 18,
  title: T('תחבורה ציבורית', 'Public Transport'),
  items: DAY18_FR_ITEMS,
  dialogues: { transport: SCENE_TRANSPORT },
  // The whole journey is shared by all languages: see practiceTransport.ts (`m19Steps`).
  steps: m19Steps('fr'),
};
