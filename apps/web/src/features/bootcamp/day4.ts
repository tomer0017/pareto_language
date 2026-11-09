import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { DAY12_ITEMS } from './day12.js';
import { DAY3_ITEMS } from './day3.js';
import { m14Steps } from './practiceRestaurant.js';

/**
 * Mission 14 — Restaurant Meal (table to bill, one full sit-down meal). The conversation is LOCKED
 * (mission14.test.ts pins it word for word); the journey around it is `m14Steps` (practiceRestaurant.ts).
 */
export const DAY4_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.rest.table-two', text: 'A table for two, please.', meaning: T('שולחן לשניים, בבקשה.', 'A table for two, please.'),
    tip: T('הפתיח למסעדה. תבנית: a table for ___.', 'The restaurant opener. Template: a table for ___.') },
  { id: 'en.phrase.rest.ill-have-chicken', text: "I'll have the chicken.", meaning: T('אני אקח את העוף.', "I'll have the chicken."),
    tip: T('תבנית ההזמנה: I’ll have the ___.', 'The ordering template: I’ll have the ___.') },
  { id: 'en.phrase.rest.water', text: 'A bottle of water, please.', meaning: T('בקבוק מים, בבקשה.', 'A bottle of water, please.') },
  { id: 'en.phrase.rest.no-onions', text: 'No onions, please.', meaning: T('בלי בצל, בבקשה.', 'No onions, please.'),
    tip: T('תבנית: No ___, please — לכל מה שאתה לא רוצה בצלחת.', 'Template: No ___, please — for anything you don’t want on the plate.') },
  { id: 'en.phrase.rest.the-bill', text: 'The bill, please.', meaning: T('החשבון, בבקשה.', 'The bill, please.') },
  { id: 'en.phrase.rest.delicious', text: 'That was delicious!', meaning: T('זה היה טעים מאוד!', 'That was delicious!'),
    tip: T('מחמאה קטנה שקונה חיוך גדול.', 'A small compliment that buys a big smile.') },
  // hear
  { id: 'en.reply.rest.reservation', text: 'Do you have a reservation?', meaning: T('יש לכם הזמנה?', 'Do you have a reservation?') },
  { id: 'en.reply.rest.follow-me', text: 'Follow me, please.', meaning: T('בואו אחריי, בבקשה.', 'Follow me, please.') },
  { id: 'en.reply.rest.ready-to-order', text: 'Are you ready to order?', meaning: T('מוכנים להזמין?', 'Are you ready to order?') },
  { id: 'en.reply.rest.to-drink', text: 'Anything to drink?', meaning: T('משהו לשתות?', 'Anything to drink?') },
  // Merged in from Restaurant Basics — same ids and wording, so earlier practice still counts.
  ...DAY12_ITEMS.filter((i) => ['en.phrase.rest.ill-have', 'en.reply.rest.anything-else', 'en.reply.rest.everything-okay'].includes(i.id)),
  { id: 'en.phrase.rest.chicken-no-onions', text: "I'll have the chicken, without onions, please.", meaning: T('אני אקח את העוף, בלי בצל, בבקשה.', "I'll have the chicken, without onions, please.") },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you', 'en.phrase.recovery.one-moment', 'en.phrase.recovery.dont-understand'),
  // Mission 03's own sentence, same id and wording — the learner already knows it (no card here).
  ...DAY3_ITEMS.filter((i) => i.id === 'en.phrase.coffee.thats-all'),
];

const SCENE: BootcampDialogue = {
  id: 'sit-down-meal',
  start: 'n1',
  // Every turn is a real decision: a line from another moment of the meal does not fit — a miss is
  // asked again, slowly, and the same choice comes back. At the door, "I don't understand" stays the
  // one recovery move (the only Core turn where it is met): the waiter asks again, simply.
  // "Later…" is a scene cue on the line it comes before: shown in the app language, never spoken.
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Good evening! Do you have a reservation?', he: 'ערב טוב! יש לכם הזמנה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'No — a table for two, please.', he: 'לא — שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-two', correct: true, next: 'n2' },
      { en: 'Yes, that was delicious! The bill, please.', he: 'כן, היה טעים מאוד! החשבון, בבקשה.', itemId: 'en.phrase.rest.the-bill', correct: false, next: 'm1' },
      { en: 'Sorry, I don’t understand.', he: 'סליחה, אני לא מבין.', itemId: 'en.phrase.recovery.dont-understand', correct: true, next: 'r1' },
    ] },
    { id: 'm1', who: 'npc', slow: true, next: 'c1', en: 'Good evening! Do you have a reservation?', he: 'ערב טוב! יש לכם הזמנה?' },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'A table? For how many people?', he: 'שולחן? לכמה אנשים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'A table for two, please.', he: 'שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-two', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'n2b', en: 'Perfect, follow me. Here are your menus.', he: 'מצוין, בואו אחריי. הנה התפריטים.' },
    { id: 'n2b', who: 'npc', next: 'c2', en: 'Are you ready to order?', he: 'מוכנים להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'll have the chicken, without onions, please.", he: 'אני אקח את העוף, בלי בצל, בבקשה.', itemId: 'en.phrase.rest.ill-have-chicken', correct: true, next: 'n3' },
      { en: "That's all, thanks.", he: 'זה הכל, תודה.', itemId: 'en.phrase.coffee.thats-all', correct: false, next: 'm2' },
    ] },
    { id: 'm2', who: 'npc', slow: true, next: 'c2', en: 'Are you ready to order?', he: 'מוכנים להזמין?' },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Of course. Anything to drink?', he: 'כמובן. משהו לשתות?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'A bottle of water, please.', he: 'בקבוק מים, בבקשה.', itemId: 'en.phrase.rest.water', correct: true, next: 'n4' },
      { en: 'Yes, that was delicious! The bill, please.', he: 'כן, היה טעים מאוד! החשבון, בבקשה.', itemId: 'en.phrase.rest.the-bill', correct: false, next: 'm3' },
    ] },
    { id: 'm3', who: 'npc', slow: true, next: 'c3', en: 'Of course. Anything to drink?', he: 'כמובן. משהו לשתות?' },
    { id: 'n4', who: 'npc', fast: true, next: 'c4', en: 'Anything else?', he: 'עוד משהו?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: "That's all, thanks.", he: 'זה הכל, תודה.', itemId: 'en.phrase.coffee.thats-all', correct: true, next: 'n5' },
      { en: 'No — a table for two, please.', he: 'לא — שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-two', correct: false, next: 'm4' },
    ] },
    { id: 'm4', who: 'npc', slow: true, next: 'c4', en: 'Anything else?', he: 'עוד משהו?' },
    { id: 'n5', who: 'npc', next: 'n5b', en: 'Coming right up!', he: 'מגיע עוד רגע!' },
    { id: 'n5b', who: 'npc', next: 'c5', cue: T('מאוחר יותר…', 'Later…'), en: 'Is everything okay?', he: 'הכל בסדר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Yes, that was delicious! The bill, please.', he: 'כן, היה טעים מאוד! החשבון, בבקשה.', itemId: 'en.phrase.rest.the-bill', correct: true, next: 'n6' },
      { en: "I'll have the chicken, without onions, please.", he: 'אני אקח את העוף, בלי בצל, בבקשה.', itemId: 'en.phrase.rest.ill-have-chicken', correct: false, next: 'm5' },
    ] },
    { id: 'm5', who: 'npc', slow: true, next: 'c5', en: 'Is everything okay?', he: 'הכל בסדר?' },
    { id: 'n6', who: 'npc', end: true, en: 'So glad you enjoyed it. Here you are — have a lovely evening!', he: 'שמח שנהניתם. בבקשה — ערב נעים!' },
  ],
};

export const DAY4: BootcampDayContent = {
  day: 4,
  title: T('ארוחה במסעדה', 'Restaurant Meal'),
  items: DAY4_ITEMS,
  dialogues: { 'sit-down-meal': SCENE },
  // The whole journey is shared by all languages: see practiceRestaurant.ts (`m14Steps`).
  steps: m14Steps('en'),
};
