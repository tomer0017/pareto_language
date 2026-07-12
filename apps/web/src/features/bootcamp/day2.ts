import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/** Mission 2 — "Introduce Myself" (real objective: name, origin, purpose; warm first contact). */
export const DAY2_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.social.my-name', text: "My name is Dan.", meaning: T('קוראים לי דן.', 'My name is Dan.'),
    tip: T('התבנית: My name is ___ — פשוט תחליף את השם.', 'Template: My name is ___ — just swap the name.') },
  { id: 'en.phrase.social.nice-to-meet', text: 'Nice to meet you!', meaning: T('נעים להכיר!', 'Nice to meet you!'),
    tip: T('התשובה החמה לכל היכרות. תמיד עובד.', 'The warm answer to any introduction. Always works.') },
  { id: 'en.phrase.social.from-israel', text: "I'm from Israel.", meaning: T('אני מישראל.', "I'm from Israel."),
    tip: T('התבנית: I’m from ___ — התשובה ל-Where are you from.', 'Template: I’m from ___ — the answer to “Where are you from”.') },
  { id: 'en.phrase.social.here-on-holiday', text: "I'm here on holiday.", meaning: T('אני כאן בחופשה.', "I'm here on holiday."),
    tip: T('מטרת הביקור, בגרסה ידידותית.', 'Your purpose, the friendly version.') },
  { id: 'en.phrase.social.first-time', text: "It's my first time here.", meaning: T('זו הפעם הראשונה שלי כאן.', "It's my first time here."),
    tip: T('פותח שיחה ומזמין המלצות.', 'Opens conversation and invites recommendations.') },
  // hear
  { id: 'en.reply.social.whats-your-name', text: "What's your name?", meaning: T('איך קוראים לך?', "What's your name?") },
  { id: 'en.reply.social.where-from', text: 'Where are you from?', meaning: T('מאיפה אתה?', 'Where are you from?') },
  { id: 'en.reply.social.first-time-q', text: 'Is this your first time here?', meaning: T('זו הפעם הראשונה שלך כאן?', 'Is this your first time here?') },
  { id: 'en.reply.social.how-long', text: 'How long are you staying?', meaning: T('לכמה זמן אתה כאן?', 'How long are you staying?') },
  { id: 'en.reply.social.enjoy-stay', text: 'Enjoy your stay!', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
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
      { en: "I'm here on holiday.", he: 'אני כאן בחופשה.', itemId: 'en.phrase.social.here-on-holiday', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Well, enjoy your stay! Let me know if you need anything.', he: 'אז תיהנה מהשהות! תגיד לי אם אתה צריך משהו.' },
  ],
};

export const DAY2: BootcampDayContent = {
  day: 2,
  title: T('להציג את עצמי', 'Introduce Myself'),
  items: DAY2_ITEMS,
  dialogues: { 'meeting-host': SCENE },
  introVideo: {
    src: '/videos/En_day2.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'en',
    type: 'intro',
  },
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
        { text: 'name', meaning: T('שם', 'name'), emoji: '📛' },
        { text: 'from', meaning: T('מ־ (מאיפה)', 'from') },
        { text: 'holiday', meaning: T('חופשה', 'holiday'), emoji: '🏖️' },
        { text: 'first time', meaning: T('פעם ראשונה', 'first time') },
      ], buildFromItemId: 'en.phrase.social.here-on-holiday' },
    { kind: 'tool', itemId: 'en.phrase.social.my-name', index: 1, total: 4, label: T('מי אתה', 'Who you are') },
    { kind: 'tool', itemId: 'en.phrase.social.from-israel', index: 2, total: 4, label: T('מאיפה אתה', 'Where you’re from') },
    { kind: 'tool', itemId: 'en.phrase.social.here-on-holiday', index: 3, total: 4, label: T('למה באת', 'Why you came') },
    { kind: 'tool', itemId: 'en.phrase.social.nice-to-meet', index: 4, total: 4, label: T('התשובה החמה', 'The warm reply') },
    { kind: 'replies', saidItemId: 'en.phrase.social.my-name',
      replyIds: ['en.reply.social.where-from', 'en.reply.social.first-time-q', 'en.reply.social.how-long', 'en.reply.social.enjoy-stay'] },
    { kind: 'receipt', text: T('אתה מזהה את השאלות שכל מקומי סקרן ישאל אותך.', 'You recognize the questions every curious local will ask you.') },
    { kind: 'quiz', itemId: 'en.reply.social.where-from', wrongIds: ['en.reply.social.how-long', 'en.reply.social.enjoy-stay'] },
    { kind: 'dialogue', dialogueId: 'meeting-host' },
    { kind: 'receipt', text: T('ניהלת היכרות שלמה באנגלית — שם, מוצא, מטרה.', 'You handled a full introduction in English — name, origin, purpose.') },
    { kind: 'swipe', itemIds: DAY2_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'So what brings you all the way out here anyway?', he: 'אז מה בכלל הביא אותך עד לכאן?' },
      correctItemId: 'en.phrase.social.here-on-holiday', wrongItemId: 'en.phrase.social.my-name' },
    { kind: 'receipt', text: T('שאלה פתוחה ומהירה — וידעת בדיוק מה לענות.', 'An open, fast question — and you knew exactly what to answer.') },
    { kind: 'video', mode: 'again' },
    { kind: 'summary' },
  ],
};
void RECOVERY_ITEMS;
