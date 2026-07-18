import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 2 — "Presentarme" (Introduce Myself). Spanish parallel of English day 2: same
 * learning journey (name · origin · purpose · warm reply), same step structure, through the SAME
 * engine. Spanish target lines + `tr:{en,he}` glosses; `es.*` ids. No Spanish video yet → the video
 * steps degrade to an honest "unavailable" (never an English video). AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY2_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.social.my-name', text: 'Me llamo Dan.', meaning: T('קוראים לי דן.', 'My name is Dan.'),
    tip: T('התבנית: Me llamo ___ — פשוט תחליף את השם.', 'Template: Me llamo ___ — just swap the name.') },
  { id: 'es.phrase.social.nice-to-meet', text: '¡Mucho gusto!', meaning: T('נעים להכיר!', 'Nice to meet you!'),
    tip: T('התשובה החמה לכל היכרות. עובד לכולם.', 'The warm answer to any introduction. Works for everyone.') },
  { id: 'es.phrase.social.from-israel', text: 'Soy de Israel.', meaning: T('אני מישראל.', "I'm from Israel."),
    tip: T('התבנית: Soy de ___ — התשובה ל-"¿De dónde es?".', 'Template: Soy de ___ — the answer to “Where are you from”.') },
  { id: 'es.phrase.social.here-on-holiday', text: 'Estoy de vacaciones.', meaning: T('אני כאן בחופשה.', "I'm here on holiday."),
    tip: T('מטרת הביקור, בגרסה ידידותית.', 'Your purpose, the friendly version.') },
  { id: 'es.phrase.social.first-time', text: 'Es mi primera vez aquí.', meaning: T('זו הפעם הראשונה שלי כאן.', "It's my first time here."),
    tip: T('פותח שיחה ומזמין המלצות.', 'Opens conversation and invites recommendations.') },
  // hear
  { id: 'es.reply.social.whats-your-name', text: '¿Cómo se llama?', meaning: T('איך קוראים לך?', "What's your name?") },
  { id: 'es.reply.social.where-from', text: '¿De dónde es?', meaning: T('מאיפה אתה?', 'Where are you from?') },
  { id: 'es.reply.social.first-time-q', text: '¿Es su primera vez aquí?', meaning: T('זו הפעם הראשונה שלך כאן?', 'Is this your first time here?') },
  { id: 'es.reply.social.how-long', text: '¿Cuánto tiempo se queda?', meaning: T('לכמה זמן אתה כאן?', 'How long are you staying?') },
  { id: 'es.reply.social.enjoy-stay', text: '¡Que disfrute su estancia!', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
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
      { en: 'Estoy de vacaciones.', tr: TR("I'm here on holiday.", 'אני כאן בחופשה.'), he: 'אני כאן בחופשה.', itemId: 'es.phrase.social.here-on-holiday', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: '¡Pues que disfrute su estancia! Avíseme si necesita algo.', tr: TR('Well, enjoy your stay! Let me know if you need anything.', 'אז תיהנה מהשהות! תגיד לי אם אתה צריך משהו.'), he: 'אז תיהנה מהשהות! תגיד לי אם אתה צריך משהו.' },
  ],
};

export const DAY2_ES: BootcampDayContent = {
  day: 2,
  title: T('להציג את עצמי', 'Introduce Myself'),
  items: DAY2_ES_ITEMS,
  dialogues: { 'meeting-host': SCENE },
  steps: [
    { kind: 'video', mode: 'intro' },
    { kind: 'talk', icon: '👋', title: T('משימה 2: להציג את עצמי', 'Mission 2: Introduce Myself'),
      body: [
        T('היום אתה פוגש בן אדם — לא דלפק. מארח, נהג, מישהו בבר.', 'Today you meet a person — not a counter. A host, a driver, someone at the bar.'),
        T('בסוף המשימה תוכל לומר מי אתה, מאיפה, ולמה באת — בחיוך.', 'By the end you can say who you are, where you’re from, and why you came — with a smile.'),
      ], cta: T('מתחילים', 'Start') },
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('ארבע מילים שבונות את ההיכרות.', 'Four words that build the introduction.'),
      words: [
        { text: 'nombre', meaning: T('שם', 'name'), emoji: '📛' },
        { text: 'vacaciones', meaning: T('חופשה', 'holiday'), emoji: '🏖️' },
        { text: 'primera vez', meaning: T('פעם ראשונה', 'first time') },
        { text: 'mucho gusto', meaning: T('נעים מאוד', 'nice to meet you') },
      ], buildFromItemId: 'es.phrase.social.here-on-holiday' },
    { kind: 'tool', itemId: 'es.phrase.social.my-name', index: 1, total: 4, label: T('מי אתה', 'Who you are') },
    { kind: 'tool', itemId: 'es.phrase.social.from-israel', index: 2, total: 4, label: T('מאיפה אתה', 'Where you’re from') },
    { kind: 'tool', itemId: 'es.phrase.social.here-on-holiday', index: 3, total: 4, label: T('למה באת', 'Why you came') },
    { kind: 'tool', itemId: 'es.phrase.social.nice-to-meet', index: 4, total: 4, label: T('התשובה החמה', 'The warm reply') },
    { kind: 'replies', saidItemId: 'es.phrase.social.my-name',
      replyIds: ['es.reply.social.where-from', 'es.reply.social.first-time-q', 'es.reply.social.how-long', 'es.reply.social.enjoy-stay'] },
    { kind: 'receipt', text: T('אתה מזהה את השאלות שכל מקומי סקרן ישאל אותך.', 'You recognize the questions every curious local will ask you.') },
    { kind: 'quiz', itemId: 'es.reply.social.where-from', wrongIds: ['es.reply.social.how-long', 'es.reply.social.enjoy-stay'] },
    { kind: 'dialogue', dialogueId: 'meeting-host' },
    { kind: 'receipt', text: T('ניהלת היכרות שלמה בספרדית — שם, מוצא, מטרה.', 'You handled a full introduction in Spanish — name, origin, purpose.') },
    { kind: 'swipe', itemIds: DAY2_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Oye, ¿y qué le trae por aquí?', tr: TR('So what brings you all the way out here anyway?', 'אז מה בכלל הביא אותך עד לכאן?'), he: 'אז מה בכלל הביא אותך עד לכאן?' },
      correctItemId: 'es.phrase.social.here-on-holiday', wrongItemId: 'es.phrase.social.my-name' },
    { kind: 'receipt', text: T('שאלה פתוחה ומהירה — וידעת בדיוק מה לענות.', 'An open, fast question — and you knew exactly what to answer.') },
    { kind: 'video', mode: 'again' },
    { kind: 'summary' },
  ],
};
