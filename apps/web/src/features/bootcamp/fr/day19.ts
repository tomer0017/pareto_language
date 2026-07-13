import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 19 — "Transports en commun" (Public Transport). French parallel of English day 19:
 * ticket, platform, direction, the right stop — half of it pure listening. `tr:{en,he}` glosses;
 * `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY19_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.trans.one-ticket', text: 'Un billet pour le centre, s’il vous plaît.', meaning: T('כרטיס אחד למרכז, בבקשה.', 'One ticket to the center, please.'),
    tip: T('התבנית: Un billet pour ___ — קונה כרטיס לכל יעד.', 'Template: Un billet pour ___ — buys a ticket to anywhere.') },
  { id: 'fr.phrase.trans.which-platform', text: 'Quel quai ?', meaning: T('איזה רציף?', 'Which platform?'),
    tip: T('שתי מילים שמונעות עלייה לרכבת הלא נכונה.', 'Two words that stop you boarding the wrong train.') },
  { id: 'fr.phrase.trans.does-stop', text: 'Ça s’arrête au musée ?', meaning: T('זה עוצר במוזיאון?', 'Does this stop at the museum?'),
    tip: T('התבנית: Ça s’arrête à ___ ? — מוודאת שאתה יורד נכון.', 'Template: Ça s’arrête à ___? — makes sure you get off in the right place.') },
  { id: 'fr.phrase.trans.next-one', text: 'Le prochain, c’est quand ?', meaning: T('מתי הבא?', "When's the next one?") },
  // hear — booth + platform
  { id: 'fr.reply.trans.single-return', text: 'Aller simple ou aller-retour ?', meaning: T('הלוך או הלוך-חזור?', 'Single or return?') },
  { id: 'fr.reply.trans.platform-two', text: 'Quai numéro deux.', meaning: T('רציף שתיים.', 'Platform two.') },
  { id: 'fr.reply.trans.every-ten', text: 'Toutes les dix minutes.', meaning: T('כל עשר דקות.', 'Every ten minutes.') },
  { id: 'fr.reply.trans.three-stops', text: 'C’est à trois arrêts.', meaning: T('זה שלוש תחנות.', "It's three stops.") },
  { id: 'fr.reply.trans.wrong-way', text: 'Vous allez dans le mauvais sens.', meaning: T('אתה בכיוון הלא נכון.', "You're going the wrong way.") },
  { id: 'fr.reply.trans.stop-next', text: 'Votre arrêt est le prochain.', meaning: T('התחנה שלך הבאה.', 'Your stop is next.') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE_TRANSPORT: BootcampDialogue = {
  id: 'transport',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Vous allez où ?', tr: TR('Hello! Where are you headed?', 'שלום! לאן אתה נוסע?'), he: 'שלום! לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un billet pour le centre, s’il vous plaît.', tr: TR('One ticket to the center, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'fr.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Vous — allez — où ?', tr: TR('Where — are you — going?', 'לאן — אתה — נוסע?'), he: 'לאן — אתה — נוסע?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Un billet pour le centre, s’il vous plaît.', tr: TR('One ticket to the center, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'fr.phrase.trans.one-ticket', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Aller simple ou aller-retour ?', tr: TR('Single or return?', 'הלוך או הלוך-חזור?'), he: 'הלוך או הלוך-חזור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Aller simple, s’il vous plaît.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Aller simple — ou — aller-retour ?', tr: TR('Single — or — return?', 'הלוך — או — הלוך-חזור?'), he: 'הלוך — או — הלוך-חזור?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Aller simple, s’il vous plaît.', tr: TR('Single, please.', 'הלוך, בבקשה.'), he: 'הלוך, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'Ça fait trois euros. Quai numéro deux, ça part toutes les dix minutes.', tr: TR("That's three euros. Platform two, leaves every ten minutes.", 'זה שלושה יורו. רציף שתיים, יוצא כל עשר דקות.'), he: 'זה שלושה יורו. רציף שתיים, יוצא כל עשר דקות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Quel quai ?', tr: TR('Which platform?', 'איזה רציף?'), he: 'איזה רציף?', itemId: 'fr.phrase.trans.which-platform', correct: true, next: 'n3b' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n3b', who: 'npc', slow: true, next: 'c3b', en: 'Quai — deux. Tout droit.', tr: TR('Platform — two. Straight ahead.', 'רציף — שתיים. ישר קדימה.'), he: 'רציף — שתיים. ישר קדימה.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Le train est juste là. Montez.', tr: TR("The train's right here. Hop on.", 'הרכבת ממש כאן. עלה.'), he: 'הרכבת ממש כאן. עלה.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Ça s’arrête au musée ?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'fr.phrase.trans.does-stop', correct: true, next: 'n5' },
      { en: 'Le prochain, c’est quand ?', tr: TR("When's the next one?", 'מתי הבא?'), he: 'מתי הבא?', itemId: 'fr.phrase.trans.next-one', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c4b', en: 'Le prochain ? Toutes les dix minutes — mais celui-là est bien, montez.', tr: TR('The next one? Every ten minutes — but this one is fine, hop on.', 'הבא? כל עשר דקות — אבל זה בסדר, עלה.'), he: 'הבא? כל עשר דקות — אבל זה בסדר, עלה.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Ça s’arrête au musée ?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'fr.phrase.trans.does-stop', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Oui — c’est à trois arrêts. Je vous dirai quand.', tr: TR("Yes — it's three stops. I'll tell you when.", 'כן — זה שלוש תחנות. אני אגיד לך מתי.'), he: 'כן — זה שלוש תחנות. אני אגיד לך מתי.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'C’est — trois — arrêts.', tr: TR("It's — three — stops.", 'זה — שלוש — תחנות.'), he: 'זה — שלוש — תחנות.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Nous voilà — votre arrêt est le prochain. Bonne visite du musée !', tr: TR('Here we are — your stop is next. Enjoy the museum!', 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!'), he: 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!' },
  ],
};

export const DAY19_FR: BootcampDayContent = {
  day: 19,
  title: T('תחבורה ציבורית', 'Public Transport'),
  items: DAY19_FR_ITEMS,
  dialogues: { transport: SCENE_TRANSPORT },
  steps: [
    { kind: 'talk', icon: '🚇', title: T('משימה 19: תחבורה ציבורית', 'Mission 19: Public Transport'),
      body: [
        T('העיר זזה בשבילך — בזול. כרטיס, רציף, כיוון, והתחנה הנכונה.', 'The city moves for you — cheaply. Ticket, platform, direction, the right stop.'),
        T('חצי מהמשימה הזאת היא האזנה: הכרזות ותשובות מהירות של איזה-רציף.', 'Half of this mission is listening: announcements and fast which-platform answers.'),
      ], cta: T('לגשת לדלפק הכרטיסים', 'Step up to the ticket desk') },
    { kind: 'tool', itemId: 'fr.phrase.trans.one-ticket', index: 1, total: 4, label: T('לקנות כרטיס', 'Buy a ticket') },
    { kind: 'tool', itemId: 'fr.phrase.trans.which-platform', index: 2, total: 4, label: T('לאתר רציף', 'Find the platform') },
    { kind: 'tool', itemId: 'fr.phrase.trans.does-stop', index: 3, total: 4, label: T('לוודא יעד', 'Confirm the stop') },
    { kind: 'tool', itemId: 'fr.phrase.trans.next-one', index: 4, total: 4, label: T('לשאול על הבא', 'Ask about the next one') },
    { kind: 'replies', saidItemId: 'fr.phrase.trans.one-ticket',
      replyIds: ['fr.reply.trans.single-return', 'fr.reply.trans.platform-two', 'fr.reply.trans.every-ten', 'fr.reply.trans.three-stops'] },
    { kind: 'receipt', text: T('אתה מזהה את תשובות הדלפק והרציף — הלוך/חזור, מספר רציף, תדירות.', 'You recognize the booth and platform answers — single/return, platform number, frequency.') },
    { kind: 'quiz', itemId: 'fr.reply.trans.single-return', wrongIds: ['fr.reply.trans.platform-two', 'fr.reply.trans.three-stops'] },
    { kind: 'quiz', itemId: 'fr.reply.trans.every-ten', wrongIds: ['fr.reply.trans.wrong-way', 'fr.reply.trans.stop-next'] },
    { kind: 'dialogue', dialogueId: 'transport' },
    { kind: 'receipt', text: T('קנית כרטיס, מצאת רציף, ווידאת שהרכבת עוצרת ביעד שלך.', 'You bought a ticket, found the platform, and confirmed the train stops at your destination.') },
    { kind: 'swipe', itemIds: DAY19_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Ce train a du retard — vous feriez mieux de prendre le bus de remplacement à l’arrêt C.', tr: TR("This train's been delayed — you'll want the replacement bus from stand C instead.", 'הרכבת הזאת מתעכבת — עדיף לך את האוטובוס החלופי מעמדה C.'), he: 'הרכבת הזאת מתעכבת — עדיף לך את האוטובוס החלופי מעמדה C.' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.phrase.trans.which-platform' },
    { kind: 'receipt', text: T('הודעת שיבוש מהירה — וביקשת שיחזרו במקום לעלות לרכבת הלא נכונה.', 'A fast disruption announcement — and you asked them to repeat instead of boarding the wrong train.') },
    { kind: 'summary' },
  ],
};
