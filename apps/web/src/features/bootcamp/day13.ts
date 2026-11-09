import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m15Steps } from './practiceAllergies.js';

/**
 * Mission 15 — Food Preferences & Allergies. The conversation is LOCKED (mission15.test.ts pins it
 * word for word); the journey around it is `m15Steps` (practiceAllergies.ts). The four functions keep
 * their sentence ids; off-scope sentences are archived in retired.ts. Service register (vous / usted).
 */
export const DAY13_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.diet.allergic-nuts', text: "I'm allergic to nuts.", meaning: T('אני אלרגי לאגוזים.', "I'm allergic to nuts."),
    tip: T('התבנית שמצילה: I’m allergic to ___. אומרים ברור, פעם אחת, בלי היסוס.', 'The life-saving template: I’m allergic to ___. Say it clearly, once, no hesitation.') },
  { id: 'en.phrase.diet.without-onions', text: 'Without onions, please.', meaning: T('בלי בצל, בבקשה.', 'Without onions, please.'),
    tip: T('התבנית: Without ___ — מסירה כל מרכיב שלא בא לך.', 'Template: Without ___ — removes any ingredient you don’t want.') },
  { id: 'en.phrase.diet.vegetarian', text: "I'm vegetarian.", meaning: T('אני צמחוני.', "I'm vegetarian."),
    tip: T('שתי מילים שחוסכות עשר שאלות.', 'Two words that save ten questions.') },
  { id: 'en.phrase.diet.does-have-dairy', text: 'Does it have dairy?', meaning: T('יש בזה מוצרי חלב?', 'Does it have dairy?'),
    tip: T('התבנית: Does this have ___? — בודקת כל מרכיב לפני שהוא מגיע אליך.', 'Template: Does this have ___? — checks any ingredient before it reaches you.') },
  // hear — the waiter's whole lines
  { id: 'en.reply.diet.ready', text: 'Hi there! Are you ready to order?', meaning: T('היי! מוכן להזמין?', 'Hi there! Are you ready to order?') },
  { id: 'en.reply.diet.other', text: 'Thank you for telling me. Any other allergies or dietary restrictions?', meaning: T('תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?', 'Thank you for telling me. Any other allergies or dietary restrictions?') },
  { id: 'en.reply.diet.risotto', text: "Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", meaning: T('הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.', "Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.") },
  { id: 'en.reply.diet.cream', text: 'Yes, it has some cream, but we can make it without.', meaning: T('כן, יש בו קצת שמנת, אבל אפשר להכין בלי.', 'Yes, it has some cream, but we can make it without.') },
  { id: 'en.reply.diet.tell', text: "Of course. I'll tell the kitchen about your allergy.", meaning: T('כמובן. אגיד למטבח על האלרגיה שלך.', "Of course. I'll tell the kitchen about your allergy.") },
  { id: 'en.reply.diet.back', text: "I'll check with them and come right back.", meaning: T('אבדוק איתם ואחזור מיד.', "I'll check with them and come right back.") },
  // "Thank you!" — the toolkit's own sentence (prior learning: never taught here)
  ...recovery('en.phrase.recovery.thank-you'),
];

const SCENE_ALLERGY: BootcampDialogue = {
  id: 'allergy-order',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the order does not fit — a miss is
  // asked again, slowly, and the same choice comes back. A polite "Thank you!" to "Any other allergies…?"
  // keeps its own answer: the waiter asks once more, in other words (Mission 24 relies on its "should").
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hi there! Are you ready to order?', he: 'היי! מוכן להזמין?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "I'm allergic to nuts.", he: 'אני אלרגי לאגוזים.', itemId: 'en.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
      { en: 'Does it have dairy?', he: 'יש בזה מוצרי חלב?', itemId: 'en.phrase.diet.does-have-dairy', correct: false, next: 'm1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: 'Hi there! Are you ready to order?', he: 'היי! מוכן להזמין?' },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Thank you for telling me. Any other allergies or dietary restrictions?', he: 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'm vegetarian.", he: 'אני צמחוני.', itemId: 'en.phrase.diet.vegetarian', correct: true, next: 'n3' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Of course — but is there anything else I should know?', he: 'כמובן — אבל יש עוד משהו שכדאי שאדע?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: "I'm vegetarian.", he: 'אני צמחוני.', itemId: 'en.phrase.diet.vegetarian', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", he: 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Does it have dairy?', he: 'יש בזה מוצרי חלב?', itemId: 'en.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
      { en: "I'm vegetarian.", he: 'אני צמחוני.', itemId: 'en.phrase.diet.vegetarian', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: "Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", he: 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.' },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Yes, it has some cream, but we can make it without.', he: 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Great. Without onions, please.', he: 'מעולה. בלי בצל, בבקשה.', itemId: 'en.phrase.diet.without-onions', correct: true, next: 'n5' },
      { en: 'Does it have dairy?', he: 'יש בזה מוצרי חלב?', itemId: 'en.phrase.diet.does-have-dairy', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Yes, it has some cream, but we can make it without.', he: 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'n5', who: 'npc', next: 'c5', en: "Of course. I'll tell the kitchen about your allergy.", he: 'כמובן. אגיד למטבח על האלרגיה שלך.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: "I'm allergic to nuts.", he: 'אני אלרגי לאגוזים.', itemId: 'en.phrase.diet.allergic-nuts', correct: false, next: 'm5' },
    ] },
    { id: 'm5', who: 'npc', slow: true, next: 'c5', en: "Of course. I'll tell the kitchen about your allergy.", he: 'כמובן. אגיד למטבח על האלרגיה שלך.' },
    { id: 'n6', who: 'npc', end: true, en: "I'll check with them and come right back.", he: 'אבדוק איתם ואחזור מיד.' },
  ],
};

export const DAY13: BootcampDayContent = {
  day: 13,
  title: T('העדפות אוכל ואלרגיות', 'Food Preferences & Allergies'),
  items: DAY13_ITEMS,
  dialogues: { 'allergy-order': SCENE_ALLERGY },
  // The whole journey is shared by all languages: see practiceAllergies.ts (`m15Steps`).
  steps: m15Steps('en'),
};
