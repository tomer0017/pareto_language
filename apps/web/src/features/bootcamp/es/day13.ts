import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { m15Steps } from '../practiceAllergies.js';

/**
 * Spanish Mission 15 — Food Preferences & Allergies. The conversation is LOCKED (mission15.test.ts pins it
 * word for word); the journey around it is `m15Steps` (practiceAllergies.ts). The four functions keep
 * their sentence ids; off-scope sentences are archived in retired.ts. Service register (vous / usted).
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY13_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.diet.allergic-nuts', text: 'Soy alérgico a los frutos secos.', meaning: T('אני אלרגי לאגוזים.', "I'm allergic to nuts."),
    tip: T('התבנית שמצילה: Soy alérgico a ___. אומרים ברור, פעם אחת, בלי היסוס.', 'The life-saving template: Soy alérgico a ___. Say it clearly, once, no hesitation.') },
  { id: 'es.phrase.diet.without-onions', text: 'Sin cebolla, por favor.', meaning: T('בלי בצל, בבקשה.', 'Without onions, please.'),
    tip: T('התבנית: Sin ___ — מסירה כל מרכיב שלא בא לך.', 'Template: Sin ___ — removes any ingredient you don’t want.') },
  { id: 'es.phrase.diet.vegetarian', text: 'Soy vegetariano.', meaning: T('אני צמחוני.', "I'm vegetarian."),
    tip: T('שתי מילים שחוסכות עשר שאלות.', 'Two words that save ten questions.') },
  { id: 'es.phrase.diet.does-have-dairy', text: '¿Esto lleva lácteos?', meaning: T('יש בזה מוצרי חלב?', 'Does it have dairy?'),
    tip: T('התבנית: ¿Esto lleva ___ ? — בודקת כל מרכיב לפני שהוא מגיע אליך.', 'Template: ¿Esto lleva ___ ? — checks any ingredient before it reaches you.') },
  // hear — the waiter's whole lines
  { id: 'es.reply.diet.ready', text: '¡Hola! ¿Está listo para pedir?', meaning: T('היי! מוכן להזמין?', 'Hi there! Are you ready to order?') },
  { id: 'es.reply.diet.other', text: 'Gracias por avisarme. ¿Alguna otra alergia o restricción alimentaria?', meaning: T('תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?', 'Thank you for telling me. Any other allergies or dietary restrictions?') },
  { id: 'es.reply.diet.risotto', text: 'Entendido. El risotto de champiñones es vegetariano, pero lo compruebo con la cocina por los frutos secos.', meaning: T('הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.', "Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.") },
  { id: 'es.reply.diet.cream', text: 'Sí, lleva un poco de nata, pero se lo podemos hacer sin ella.', meaning: T('כן, יש בו קצת שמנת, אבל אפשר להכין בלי.', 'Yes, it has some cream, but we can make it without.') },
  { id: 'es.reply.diet.tell', text: 'Claro. Aviso a la cocina de su alergia.', meaning: T('כמובן. אגיד למטבח על האלרגיה שלך.', "Of course. I'll tell the kitchen about your allergy.") },
  { id: 'es.reply.diet.back', text: 'Lo compruebo con ellos y vuelvo enseguida.', meaning: T('אבדוק איתם ואחזור מיד.', "I'll check with them and come right back.") },
  // "Thank you!" — the toolkit's own sentence (prior learning: never taught here)
  ...recoveryEs('es.phrase.recovery.thank-you'),
];

const SCENE_ALLERGY: BootcampDialogue = {
  id: 'allergy-order',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the order does not fit — a miss is
  // asked again, slowly, and the same choice comes back. A polite "Thank you!" to "Any other allergies…?"
  // keeps its own answer: the waiter asks once more, in other words (Mission 24 relies on its "should").
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿Está listo para pedir?', tr: TR('Hi there! Are you ready to order?', 'היי! מוכן להזמין?'), he: 'היי! מוכן להזמין?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Soy alérgico a los frutos secos.', tr: TR("I'm allergic to nuts.", 'אני אלרגי לאגוזים.'), he: 'אני אלרגי לאגוזים.', itemId: 'es.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
      { en: '¿Esto lleva lácteos?', tr: TR('Does it have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'es.phrase.diet.does-have-dairy', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: '¡Hola! ¿Está listo para pedir?', tr: TR('Hi there! Are you ready to order?', 'היי! מוכן להזמין?'), he: 'היי! מוכן להזמין?' },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Gracias por avisarme. ¿Alguna otra alergia o restricción alimentaria?', tr: TR('Thank you for telling me. Any other allergies or dietary restrictions?', 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?'), he: 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Soy vegetariano.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'es.phrase.diet.vegetarian', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Claro — pero, ¿hay algo más que deba saber?', tr: TR('Of course — but is there anything else I should know?', 'כמובן — אבל יש עוד משהו שכדאי שאדע?'), he: 'כמובן — אבל יש עוד משהו שכדאי שאדע?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Soy vegetariano.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'es.phrase.diet.vegetarian', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Entendido. El risotto de champiñones es vegetariano, pero lo compruebo con la cocina por los frutos secos.', tr: TR("Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.'), he: 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Esto lleva lácteos?', tr: TR('Does it have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'es.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
      { en: 'Soy vegetariano.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'es.phrase.diet.vegetarian', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: 'Entendido. El risotto de champiñones es vegetariano, pero lo compruebo con la cocina por los frutos secos.', tr: TR("Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.'), he: 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.' },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Sí, lleva un poco de nata, pero se lo podemos hacer sin ella.', tr: TR('Yes, it has some cream, but we can make it without.', 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.'), he: 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Genial. Sin cebolla, por favor.', tr: TR('Great. Without onions, please.', 'מעולה. בלי בצל, בבקשה.'), he: 'מעולה. בלי בצל, בבקשה.', itemId: 'es.phrase.diet.without-onions', correct: true, next: 'n5' },
      { en: '¿Esto lleva lácteos?', tr: TR('Does it have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'es.phrase.diet.does-have-dairy', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Sí, lleva un poco de nata, pero se lo podemos hacer sin ella.', tr: TR('Yes, it has some cream, but we can make it without.', 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.'), he: 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Claro. Aviso a la cocina de su alergia.', tr: TR("Of course. I'll tell the kitchen about your allergy.", 'כמובן. אגיד למטבח על האלרגיה שלך.'), he: 'כמובן. אגיד למטבח על האלרגיה שלך.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Soy alérgico a los frutos secos.', tr: TR("I'm allergic to nuts.", 'אני אלרגי לאגוזים.'), he: 'אני אלרגי לאגוזים.', itemId: 'es.phrase.diet.allergic-nuts', correct: false, next: 'm5' },
    ] },
    { id: 'm5', who: 'npc', slow: true, next: 'c5', en: 'Claro. Aviso a la cocina de su alergia.', tr: TR("Of course. I'll tell the kitchen about your allergy.", 'כמובן. אגיד למטבח על האלרגיה שלך.'), he: 'כמובן. אגיד למטבח על האלרגיה שלך.' },
    { id: 'n6', who: 'npc', end: true, en: 'Lo compruebo con ellos y vuelvo enseguida.', tr: TR("I'll check with them and come right back.", 'אבדוק איתם ואחזור מיד.'), he: 'אבדוק איתם ואחזור מיד.' },
  ],
};

export const DAY13_ES: BootcampDayContent = {
  day: 13,
  title: T('העדפות אוכל ואלרגיות', 'Food Preferences & Allergies'),
  items: DAY13_ES_ITEMS,
  dialogues: { 'allergy-order': SCENE_ALLERGY },
  // The whole journey is shared by all languages: see practiceAllergies.ts (`m15Steps`).
  steps: m15Steps('es'),
};
