import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m01Steps } from './practiceV1.js';

/** Mission 1 — "Introduce Myself" (real objective: name, origin, first time here; warm first contact). */
export const DAY1_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.social.my-name', text: "My name is Dan.", meaning: T('קוראים לי דן.', 'My name is Dan.'),
    tip: T('התבנית: My name is ___ — פשוט תחליף את השם.', 'Template: My name is ___ — just swap the name.') },
  { id: 'en.phrase.social.nice-to-meet', text: 'Nice to meet you!', meaning: T('נעים להכיר!', 'Nice to meet you!'),
    tip: T('התשובה החמה לכל היכרות. תמיד עובד.', 'The warm answer to any introduction. Always works.') },
  { id: 'en.phrase.social.from-israel', text: "I'm from Israel.", meaning: T('אני מישראל.', "I'm from Israel."),
    tip: T('התבנית: I’m from ___ — התשובה ל-Where are you from.', 'Template: I’m from ___ — the answer to “Where are you from”.') },
  { id: 'en.phrase.social.first-time', text: "It's my first time here.", meaning: T('זו הפעם הראשונה שלי כאן.', "It's my first time here."),
    tip: T('פותח שיחה ומזמין המלצות.', 'Opens conversation and invites recommendations.') },
  // hear
  { id: 'en.reply.social.whats-your-name', text: "What's your name?", meaning: T('איך קוראים לך?', "What's your name?") },
  { id: 'en.reply.social.where-from', text: 'Where are you from?', meaning: T('מאיפה אתה?', 'Where are you from?') },
  { id: 'en.reply.social.first-time-q', text: 'Is this your first time here?', meaning: T('זו הפעם הראשונה שלך כאן?', 'Is this your first time here?') },
  { id: 'en.reply.social.enjoy-stay', text: 'Enjoy your stay!', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  // heard in the conversation (and the video) — comprehension, not production
  { id: 'en.reply.social.hello', text: 'Hi!', meaning: T('היי!', 'Hi!') },
  { id: 'en.reply.social.welcome', text: 'Welcome!', meaning: T('ברוך הבא!', 'Welcome!') },
  { id: 'en.reply.social.wonderful', text: 'Wonderful!', meaning: T('נהדר!', 'Wonderful!') },
  { id: 'en.reply.social.great-day', text: 'Have a great day!', meaning: T('שיהיה יום נהדר!', 'Have a great day!') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly'),
];

const SCENE: BootcampDialogue = {
  id: 'meeting-host',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "Hi! Welcome. What's your name?", he: 'היי! ברוך הבא. איך קוראים לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'My name is Dan.', he: 'קוראים לי דן.', itemId: 'en.phrase.social.my-name', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה? (כלי — תמיד מותר)', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Of course — what — is — your — name?', he: 'כמובן — איך — קוראים — לך?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'My name is Dan.', he: 'קוראים לי דן.', itemId: 'en.phrase.social.my-name', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Nice to meet you, Dan! Where are you from?', he: 'נעים להכיר, דן! מאיפה אתה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'm from Israel.", he: 'אני מישראל.', itemId: 'en.phrase.social.from-israel', correct: true, next: 'n3' },
      { en: 'Nice to meet you!', he: 'נעים להכיר! (גם מנומס — אבל הוא שאל מאיפה)', itemId: 'en.phrase.social.nice-to-meet', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Likewise! And where are you from?', he: 'גם לי! ומאיפה אתה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: "I'm from Israel.", he: 'אני מישראל.', itemId: 'en.phrase.social.from-israel', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'Israel, wonderful! Is this your first time here?', he: 'ישראל, נהדר! זו הפעם הראשונה שלך כאן?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: "Yes, it's my first time here.", he: 'כן, זו הפעם הראשונה שלי כאן.', itemId: 'en.phrase.social.first-time', correct: true, next: 'n4' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Sure. Is this — your first time — here?', he: 'בטח. זו — הפעם הראשונה שלך — כאן?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: "Yes, it's my first time here.", he: 'כן, זו הפעם הראשונה שלי כאן.', itemId: 'en.phrase.social.first-time', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Enjoy your stay! Have a great day!', he: 'תיהנה מהשהות! שיהיה יום נהדר!' },
  ],
};

export const DAY1: BootcampDayContent = {
  day: 1,
  title: T('להציג את עצמי', 'Introduce Myself'),
  items: DAY1_ITEMS,
  dialogues: { 'meeting-host': SCENE },
  steps: m01Steps('en'),
};
void RECOVERY_ITEMS;
