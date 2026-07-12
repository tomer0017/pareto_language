import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 2 — "Me présenter" (Introduce Myself). French parallel of English day 2: same
 * learning journey (name · origin · purpose · warm reply), same step structure, through the SAME
 * engine. French target lines + `tr:{en,he}` glosses; `fr.*` ids. No French video yet → the video
 * steps degrade to an honest "unavailable" (never an English video). AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY2_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.social.my-name', text: 'Je m’appelle Dan.', meaning: T('קוראים לי דן.', 'My name is Dan.'),
    tip: T('התבנית: Je m’appelle ___ — פשוט תחליף את השם.', 'Template: Je m’appelle ___ — just swap the name.') },
  { id: 'fr.phrase.social.nice-to-meet', text: 'Enchanté !', meaning: T('נעים להכיר!', 'Nice to meet you!'),
    tip: T('התשובה החמה לכל היכרות. אישה תאמר "Enchantée".', 'The warm answer to any introduction. A woman says “Enchantée”.') },
  { id: 'fr.phrase.social.from-israel', text: 'Je viens d’Israël.', meaning: T('אני מישראל.', "I'm from Israel."),
    tip: T('התבנית: Je viens de ___ — התשובה ל-"D’où venez-vous".', 'Template: Je viens de ___ — the answer to “Where are you from”.') },
  { id: 'fr.phrase.social.here-on-holiday', text: 'Je suis en vacances.', meaning: T('אני כאן בחופשה.', "I'm here on holiday."),
    tip: T('מטרת הביקור, בגרסה ידידותית.', 'Your purpose, the friendly version.') },
  { id: 'fr.phrase.social.first-time', text: 'C’est ma première fois ici.', meaning: T('זו הפעם הראשונה שלי כאן.', "It's my first time here."),
    tip: T('פותח שיחה ומזמין המלצות.', 'Opens conversation and invites recommendations.') },
  // hear
  { id: 'fr.reply.social.whats-your-name', text: 'Comment vous appelez-vous ?', meaning: T('איך קוראים לך?', "What's your name?") },
  { id: 'fr.reply.social.where-from', text: 'D’où venez-vous ?', meaning: T('מאיפה אתה?', 'Where are you from?') },
  { id: 'fr.reply.social.first-time-q', text: 'C’est votre première fois ici ?', meaning: T('זו הפעם הראשונה שלך כאן?', 'Is this your first time here?') },
  { id: 'fr.reply.social.how-long', text: 'Vous restez combien de temps ?', meaning: T('לכמה זמן אתה כאן?', 'How long are you staying?') },
  { id: 'fr.reply.social.enjoy-stay', text: 'Bon séjour !', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE: BootcampDialogue = {
  id: 'meeting-host',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Bienvenue. Comment vous appelez-vous ?', tr: TR("Hi! Welcome. What's your name?", 'היי! ברוך הבא. איך קוראים לך?'), he: 'היי! ברוך הבא. איך קוראים לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je m’appelle Dan.', tr: TR('My name is Dan.', 'קוראים לי דן.'), he: 'קוראים לי דן.', itemId: 'fr.phrase.social.my-name', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה? (כלי — תמיד מותר)'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Bien sûr — comment — vous — appelez-vous ?', tr: TR('Of course — what — is — your — name?', 'כמובן — איך — קוראים — לך?'), he: 'כמובן — איך — קוראים — לך?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Je m’appelle Dan.', tr: TR('My name is Dan.', 'קוראים לי דן.'), he: 'קוראים לי דן.', itemId: 'fr.phrase.social.my-name', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Enchanté, Dan ! D’où venez-vous ?', tr: TR('Nice to meet you, Dan! Where are you from?', 'נעים להכיר, דן! מאיפה אתה?'), he: 'נעים להכיר, דן! מאיפה אתה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je viens d’Israël.', tr: TR("I'm from Israel.", 'אני מישראל.'), he: 'אני מישראל.', itemId: 'fr.phrase.social.from-israel', correct: true, next: 'n3' },
      { en: 'Enchanté !', tr: TR('Nice to meet you!', 'נעים להכיר! (מנומס — אבל הוא שאל מאיפה)'), he: 'נעים להכיר!', itemId: 'fr.phrase.social.nice-to-meet', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Moi de même ! Et d’où venez-vous ?', tr: TR('Likewise! And where are you from?', 'גם לי! ומאיפה אתה?'), he: 'גם לי! ומאיפה אתה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Je viens d’Israël.', tr: TR("I'm from Israel.", 'אני מישראל.'), he: 'אני מישראל.', itemId: 'fr.phrase.social.from-israel', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'Israël, magnifique ! C’est votre première fois ici ?', tr: TR('Israel, wonderful! Is this your first time here?', 'ישראל, נהדר! זו הפעם הראשונה שלך כאן?'), he: 'ישראל, נהדר! זו הפעם הראשונה שלך כאן?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Oui, c’est ma première fois ici.', tr: TR("Yes, it's my first time here.", 'כן, זו הפעם הראשונה שלי כאן.'), he: 'כן, זו הפעם הראשונה שלי כאן.', itemId: 'fr.phrase.social.first-time', correct: true, next: 'n4' },
      { en: 'Je suis en vacances.', tr: TR("I'm here on holiday.", 'אני כאן בחופשה.'), he: 'אני כאן בחופשה.', itemId: 'fr.phrase.social.here-on-holiday', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Eh bien, bon séjour ! Dites-moi si vous avez besoin de quelque chose.', tr: TR('Well, enjoy your stay! Let me know if you need anything.', 'אז תיהנה מהשהות! תגיד לי אם אתה צריך משהו.'), he: 'אז תיהנה מהשהות! תגיד לי אם אתה צריך משהו.' },
  ],
};

export const DAY2_FR: BootcampDayContent = {
  day: 2,
  title: T('להציג את עצמי', 'Introduce Myself'),
  items: DAY2_FR_ITEMS,
  dialogues: { 'meeting-host': SCENE },
  // No French video yet — the intro/again video steps degrade to an honest "unavailable".
  steps: [
    { kind: 'video', mode: 'intro' },
    { kind: 'talk', icon: '👋', title: T('משימה 2: להציג את עצמי', 'Mission 2: Introduce Myself'),
      body: [
        T('היום אתה פוגש בן אדם — לא דלפק. מארח, נהג, מישהו בבר.', 'Today you meet a person — not a counter. A host, a driver, someone at the bar.'),
        T('בסוף המשימה תוכל לומר מי אתה, מאיפה, ולמה באת — בחיוך.', 'By the end you can say who you are, where you’re from, and why you came — with a smile.'),
      ], cta: T('מתחילים', 'Start') },
    { kind: 'tool', itemId: 'fr.phrase.social.my-name', index: 1, total: 4, label: T('מי אתה', 'Who you are') },
    { kind: 'tool', itemId: 'fr.phrase.social.from-israel', index: 2, total: 4, label: T('מאיפה אתה', 'Where you’re from') },
    { kind: 'tool', itemId: 'fr.phrase.social.here-on-holiday', index: 3, total: 4, label: T('למה באת', 'Why you came') },
    { kind: 'tool', itemId: 'fr.phrase.social.nice-to-meet', index: 4, total: 4, label: T('התשובה החמה', 'The warm reply') },
    { kind: 'replies', saidItemId: 'fr.phrase.social.my-name',
      replyIds: ['fr.reply.social.where-from', 'fr.reply.social.first-time-q', 'fr.reply.social.how-long', 'fr.reply.social.enjoy-stay'] },
    { kind: 'receipt', text: T('אתה מזהה את השאלות שכל מקומי סקרן ישאל אותך.', 'You recognize the questions every curious local will ask you.') },
    { kind: 'quiz', itemId: 'fr.reply.social.where-from', wrongIds: ['fr.reply.social.how-long', 'fr.reply.social.enjoy-stay'] },
    { kind: 'dialogue', dialogueId: 'meeting-host' },
    { kind: 'receipt', text: T('ניהלת היכרות שלמה בצרפתית — שם, מוצא, מטרה.', 'You handled a full introduction in French — name, origin, purpose.') },
    { kind: 'swipe', itemIds: DAY2_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Alors, qu’est-ce qui vous amène jusqu’ici ?', tr: TR('So what brings you all the way out here anyway?', 'אז מה בכלל הביא אותך עד לכאן?'), he: 'אז מה בכלל הביא אותך עד לכאן?' },
      correctItemId: 'fr.phrase.social.here-on-holiday', wrongItemId: 'fr.phrase.social.my-name' },
    { kind: 'receipt', text: T('שאלה פתוחה ומהירה — וידעת בדיוק מה לענות.', 'An open, fast question — and you knew exactly what to answer.') },
    { kind: 'video', mode: 'again' },
    { kind: 'summary' },
  ],
};
