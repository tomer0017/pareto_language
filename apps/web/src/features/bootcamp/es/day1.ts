import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { m01Steps } from '../practiceV1.js';

/**
 * Spanish Mission 1 — "Presentarme" (Introduce Myself). Spanish parallel of English mission 1: same
 * learning journey (name · origin · purpose · warm reply), same step structure, through the SAME
 * engine. Spanish target lines + `tr:{en,he}` glosses; `es.*` ids. No Spanish video yet → the video
 * steps degrade to an honest "unavailable" (never an English video). AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY1_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.social.my-name', text: 'Me llamo Dan.', meaning: T('קוראים לי דן.', 'My name is Dan.'),
    tip: T('התבנית: Me llamo ___ — פשוט תחליף את השם.', 'Template: Me llamo ___ — just swap the name.') },
  { id: 'es.phrase.social.nice-to-meet', text: '¡Mucho gusto!', meaning: T('נעים להכיר!', 'Nice to meet you!'),
    tip: T('התשובה החמה לכל היכרות. עובד לכולם.', 'The warm answer to any introduction. Works for everyone.') },
  { id: 'es.phrase.social.from-israel', text: 'Soy de Israel.', meaning: T('אני מישראל.', "I'm from Israel."),
    tip: T('התבנית: Soy de ___ — התשובה ל-"¿De dónde es?".', 'Template: Soy de ___ — the answer to “Where are you from”.') },
  { id: 'es.phrase.social.first-time', text: 'Es mi primera vez aquí.', meaning: T('זו הפעם הראשונה שלי כאן.', "It's my first time here."),
    tip: T('פותח שיחה ומזמין המלצות.', 'Opens conversation and invites recommendations.') },
  // hear
  { id: 'es.reply.social.whats-your-name', text: '¿Cómo se llama?', meaning: T('איך קוראים לך?', "What's your name?") },
  { id: 'es.reply.social.where-from', text: '¿De dónde es?', meaning: T('מאיפה אתה?', 'Where are you from?') },
  { id: 'es.reply.social.first-time-q', text: '¿Es su primera vez aquí?', meaning: T('זו הפעם הראשונה שלך כאן?', 'Is this your first time here?') },
  { id: 'es.reply.social.enjoy-stay', text: '¡Que disfrute su estancia!', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  // heard in the conversation (and the video) — comprehension, not production
  { id: 'es.reply.social.hello', text: '¡Hola!', meaning: T('היי!', 'Hi!') },
  { id: 'es.reply.social.welcome', text: '¡Bienvenido!', meaning: T('ברוך הבא!', 'Welcome!') },
  { id: 'es.reply.social.wonderful', text: '¡Qué maravilla!', meaning: T('נהדר!', 'Wonderful!') },
  { id: 'es.reply.social.great-day', text: '¡Que tenga un buen día!', meaning: T('שיהיה יום נהדר!', 'Have a great day!') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly'),
];

const SCENE: BootcampDialogue = {
  id: 'meeting-host',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! Bienvenido. ¿Cómo se llama?', tr: TR("Hi! Welcome. What's your name?", 'היי! ברוך הבא. איך קוראים לך?'), he: 'היי! ברוך הבא. איך קוראים לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Me llamo Dan.', tr: TR('My name is Dan.', 'קוראים לי דן.'), he: 'קוראים לי דן.', itemId: 'es.phrase.social.my-name', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה? (כלי — תמיד מותר)'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Claro — ¿cómo — se — llama?', tr: TR('Of course — what — is — your — name?', 'כמובן — איך — קוראים — לך?'), he: 'כמובן — איך — קוראים — לך?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Me llamo Dan.', tr: TR('My name is Dan.', 'קוראים לי דן.'), he: 'קוראים לי דן.', itemId: 'es.phrase.social.my-name', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: '¡Mucho gusto, Dan! ¿De dónde es?', tr: TR('Nice to meet you, Dan! Where are you from?', 'נעים להכיר, דן! מאיפה אתה?'), he: 'נעים להכיר, דן! מאיפה אתה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Soy de Israel.', tr: TR("I'm from Israel.", 'אני מישראל.'), he: 'אני מישראל.', itemId: 'es.phrase.social.from-israel', correct: true, next: 'n3' },
      { en: '¡Mucho gusto!', tr: TR('Nice to meet you!', 'נעים להכיר! (מנומס — אבל הוא שאל מאיפה)'), he: 'נעים להכיר!', itemId: 'es.phrase.social.nice-to-meet', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: '¡Igualmente! ¿Y de dónde es?', tr: TR('Likewise! And where are you from?', 'גם לי! ומאיפה אתה?'), he: 'גם לי! ומאיפה אתה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Soy de Israel.', tr: TR("I'm from Israel.", 'אני מישראל.'), he: 'אני מישראל.', itemId: 'es.phrase.social.from-israel', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: '¡Israel, qué maravilla! ¿Es su primera vez aquí?', tr: TR('Israel, wonderful! Is this your first time here?', 'ישראל, נהדר! זו הפעם הראשונה שלך כאן?'), he: 'ישראל, נהדר! זו הפעם הראשונה שלך כאן?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Sí, es mi primera vez aquí.', tr: TR("Yes, it's my first time here.", 'כן, זו הפעם הראשונה שלי כאן.'), he: 'כן, זו הפעם הראשונה שלי כאן.', itemId: 'es.phrase.social.first-time', correct: true, next: 'n4' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Claro. ¿Es — su primera vez — aquí?', tr: TR('Sure. Is this — your first time — here?', 'בטח. זו — הפעם הראשונה שלך — כאן?'), he: 'בטח. זו — הפעם הראשונה שלך — כאן?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Sí, es mi primera vez aquí.', tr: TR("Yes, it's my first time here.", 'כן, זו הפעם הראשונה שלי כאן.'), he: 'כן, זו הפעם הראשונה שלי כאן.', itemId: 'es.phrase.social.first-time', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: '¡Que disfrute su estancia! ¡Que tenga un buen día!', tr: TR('Enjoy your stay! Have a great day!', 'תיהנה מהשהות! שיהיה יום נהדר!'), he: 'תיהנה מהשהות! שיהיה יום נהדר!' },
  ],
};

export const DAY1_ES: BootcampDayContent = {
  day: 1,
  title: T('להציג את עצמי', 'Introduce Myself'),
  items: DAY1_ES_ITEMS,
  dialogues: { 'meeting-host': SCENE },
  steps: m01Steps('es'),
};
