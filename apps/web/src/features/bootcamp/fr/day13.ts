import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { m15Steps } from '../practiceAllergies.js';

/**
 * French Mission 15 — Food Preferences & Allergies. The conversation is LOCKED (mission15.test.ts pins it
 * word for word); the journey around it is `m15Steps` (practiceAllergies.ts). The four functions keep
 * their sentence ids; off-scope sentences are archived in retired.ts. Service register (vous / usted).
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY13_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.diet.allergic-nuts', text: 'Je suis allergique aux noix.', meaning: T('אני אלרגי לאגוזים.', "I'm allergic to nuts."),
    tip: T('התבנית שמצילה: Je suis allergique à/aux ___. אומרים ברור, פעם אחת, בלי היסוס.', 'The life-saving template: Je suis allergique à/aux ___. Say it clearly, once, no hesitation.') },
  { id: 'fr.phrase.diet.without-onions', text: 'Sans oignons, s’il vous plaît.', meaning: T('בלי בצל, בבקשה.', 'Without onions, please.'),
    tip: T('התבנית: Sans ___ — מסירה כל מרכיב שלא בא לך.', 'Template: Sans ___ — removes any ingredient you don’t want.') },
  { id: 'fr.phrase.diet.vegetarian', text: 'Je suis végétarien.', meaning: T('אני צמחוני.', "I'm vegetarian."),
    tip: T('שתי מילים שחוסכות עשר שאלות.', 'Two words that save ten questions.') },
  { id: 'fr.phrase.diet.does-have-dairy', text: 'Est-ce qu’il y a des produits laitiers dedans ?', meaning: T('יש בזה מוצרי חלב?', 'Does it have dairy?'),
    tip: T('התבנית: Est-ce qu’il y a ___ dedans ? — בודקת כל מרכיב לפני שהוא מגיע אליך.', 'Template: Est-ce qu’il y a ___ dedans? — checks any ingredient before it reaches you.') },
  // hear — the waiter's whole lines
  { id: 'fr.reply.diet.ready', text: 'Bonjour ! Vous êtes prêt à commander ?', meaning: T('היי! מוכן להזמין?', 'Hi there! Are you ready to order?') },
  { id: 'fr.reply.diet.other', text: 'Merci de me le dire. D’autres allergies ou restrictions alimentaires ?', meaning: T('תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?', 'Thank you for telling me. Any other allergies or dietary restrictions?') },
  { id: 'fr.reply.diet.risotto', text: 'Compris. Le risotto aux champignons est végétarien, mais je vérifie avec la cuisine pour les noix.', meaning: T('הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.', "Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.") },
  { id: 'fr.reply.diet.cream', text: 'Oui, il y a un peu de crème, mais on peut le faire sans.', meaning: T('כן, יש בו קצת שמנת, אבל אפשר להכין בלי.', 'Yes, it has some cream, but we can make it without.') },
  { id: 'fr.reply.diet.tell', text: 'Bien sûr. Je préviens la cuisine pour votre allergie.', meaning: T('כמובן. אגיד למטבח על האלרגיה שלך.', "Of course. I'll tell the kitchen about your allergy.") },
  { id: 'fr.reply.diet.back', text: 'Je vérifie avec eux et je reviens tout de suite.', meaning: T('אבדוק איתם ואחזור מיד.', "I'll check with them and come right back.") },
  // "Thank you!" — the toolkit's own sentence (prior learning: never taught here)
  ...recoveryFr('fr.phrase.recovery.thank-you'),
];

const SCENE_ALLERGY: BootcampDialogue = {
  id: 'allergy-order',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the order does not fit — a miss is
  // asked again, slowly, and the same choice comes back. A polite "Thank you!" to "Any other allergies…?"
  // keeps its own answer: the waiter asks once more, in other words (Mission 24 relies on its "should").
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Vous êtes prêt à commander ?', tr: TR('Hi there! Are you ready to order?', 'היי! מוכן להזמין?'), he: 'היי! מוכן להזמין?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis allergique aux noix.', tr: TR("I'm allergic to nuts.", 'אני אלרגי לאגוזים.'), he: 'אני אלרגי לאגוזים.', itemId: 'fr.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
      { en: 'Est-ce qu’il y a des produits laitiers dedans ?', tr: TR('Does it have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'fr.phrase.diet.does-have-dairy', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: 'Bonjour ! Vous êtes prêt à commander ?', tr: TR('Hi there! Are you ready to order?', 'היי! מוכן להזמין?'), he: 'היי! מוכן להזמין?' },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Merci de me le dire. D’autres allergies ou restrictions alimentaires ?', tr: TR('Thank you for telling me. Any other allergies or dietary restrictions?', 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?'), he: 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis végétarien.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'fr.phrase.diet.vegetarian', correct: true, next: 'n3' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Bien sûr — mais y a-t-il autre chose que je devrais savoir ?', tr: TR('Of course — but is there anything else I should know?', 'כמובן — אבל יש עוד משהו שכדאי שאדע?'), he: 'כמובן — אבל יש עוד משהו שכדאי שאדע?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis végétarien.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'fr.phrase.diet.vegetarian', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Compris. Le risotto aux champignons est végétarien, mais je vérifie avec la cuisine pour les noix.', tr: TR("Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.'), he: 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Est-ce qu’il y a des produits laitiers dedans ?', tr: TR('Does it have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'fr.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
      { en: 'Je suis végétarien.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'fr.phrase.diet.vegetarian', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: 'Compris. Le risotto aux champignons est végétarien, mais je vérifie avec la cuisine pour les noix.', tr: TR("Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.'), he: 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.' },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Oui, il y a un peu de crème, mais on peut le faire sans.', tr: TR('Yes, it has some cream, but we can make it without.', 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.'), he: 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Parfait. Sans oignons, s’il vous plaît.', tr: TR('Great. Without onions, please.', 'מעולה. בלי בצל, בבקשה.'), he: 'מעולה. בלי בצל, בבקשה.', itemId: 'fr.phrase.diet.without-onions', correct: true, next: 'n5' },
      { en: 'Est-ce qu’il y a des produits laitiers dedans ?', tr: TR('Does it have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'fr.phrase.diet.does-have-dairy', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Oui, il y a un peu de crème, mais on peut le faire sans.', tr: TR('Yes, it has some cream, but we can make it without.', 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.'), he: 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Bien sûr. Je préviens la cuisine pour votre allergie.', tr: TR("Of course. I'll tell the kitchen about your allergy.", 'כמובן. אגיד למטבח על האלרגיה שלך.'), he: 'כמובן. אגיד למטבח על האלרגיה שלך.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Je suis allergique aux noix.', tr: TR("I'm allergic to nuts.", 'אני אלרגי לאגוזים.'), he: 'אני אלרגי לאגוזים.', itemId: 'fr.phrase.diet.allergic-nuts', correct: false, next: 'm5' },
    ] },
    { id: 'm5', who: 'npc', slow: true, next: 'c5', en: 'Bien sûr. Je préviens la cuisine pour votre allergie.', tr: TR("Of course. I'll tell the kitchen about your allergy.", 'כמובן. אגיד למטבח על האלרגיה שלך.'), he: 'כמובן. אגיד למטבח על האלרגיה שלך.' },
    { id: 'n6', who: 'npc', end: true, en: 'Je vérifie avec eux et je reviens tout de suite.', tr: TR("I'll check with them and come right back.", 'אבדוק איתם ואחזור מיד.'), he: 'אבדוק איתם ואחזור מיד.' },
  ],
};

export const DAY13_FR: BootcampDayContent = {
  day: 13,
  title: T('העדפות אוכל ואלרגיות', 'Food Preferences & Allergies'),
  items: DAY13_FR_ITEMS,
  dialogues: { 'allergy-order': SCENE_ALLERGY },
  // The whole journey is shared by all languages: see practiceAllergies.ts (`m15Steps`).
  steps: m15Steps('fr'),
};
