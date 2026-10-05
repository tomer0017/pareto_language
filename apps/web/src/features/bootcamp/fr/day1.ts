import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { m01Steps } from '../practiceV1.js';

/**
 * French Mission 1 — "Me présenter" (Introduce Myself). French parallel of English mission 1: same
 * learning journey (name · origin · purpose · warm reply), same step structure, through the SAME
 * engine. French target lines + `tr:{en,he}` glosses; `fr.*` ids. No French video yet → the video
 * steps degrade to an honest "unavailable" (never an English video). AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY1_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.social.my-name', text: 'Je m’appelle Dan.', meaning: T('קוראים לי דן.', 'My name is Dan.'),
    tip: T('התבנית: Je m’appelle ___ — פשוט תחליף את השם.', 'Template: Je m’appelle ___ — just swap the name.') },
  { id: 'fr.phrase.social.nice-to-meet', text: 'Enchanté !', meaning: T('נעים להכיר!', 'Nice to meet you!'),
    tip: T('התשובה החמה לכל היכרות. אישה תאמר "Enchantée".', 'The warm answer to any introduction. A woman says “Enchantée”.') },
  { id: 'fr.phrase.social.from-israel', text: 'Je viens d’Israël.', meaning: T('אני מישראל.', "I'm from Israel."),
    tip: T('התבנית: Je viens de ___ — התשובה ל-"D’où venez-vous".', 'Template: Je viens de ___ — the answer to “Where are you from”.') },
  { id: 'fr.phrase.social.first-time', text: 'C’est ma première fois ici.', meaning: T('זו הפעם הראשונה שלי כאן.', "It's my first time here."),
    tip: T('פותח שיחה ומזמין המלצות.', 'Opens conversation and invites recommendations.') },
  // hear
  { id: 'fr.reply.social.whats-your-name', text: 'Comment vous appelez-vous ?', meaning: T('איך קוראים לך?', "What's your name?") },
  { id: 'fr.reply.social.where-from', text: 'D’où venez-vous ?', meaning: T('מאיפה אתה?', 'Where are you from?') },
  { id: 'fr.reply.social.first-time-q', text: 'C’est votre première fois ici ?', meaning: T('זו הפעם הראשונה שלך כאן?', 'Is this your first time here?') },
  { id: 'fr.reply.social.enjoy-stay', text: 'Bon séjour !', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly'),
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
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Bien sûr. C’est — votre première fois — ici ?', tr: TR('Sure. Is this — your first time — here?', 'בטח. זו — הפעם הראשונה שלך — כאן?'), he: 'בטח. זו — הפעם הראשונה שלך — כאן?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Oui, c’est ma première fois ici.', tr: TR("Yes, it's my first time here.", 'כן, זו הפעם הראשונה שלי כאן.'), he: 'כן, זו הפעם הראשונה שלי כאן.', itemId: 'fr.phrase.social.first-time', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Bon séjour ! Bonne journée !', tr: TR('Enjoy your stay! Have a great day!', 'תיהנה מהשהות! שיהיה יום נהדר!'), he: 'תיהנה מהשהות! שיהיה יום נהדר!' },
  ],
};

export const DAY1_FR: BootcampDayContent = {
  day: 1,
  title: T('להציג את עצמי', 'Introduce Myself'),
  items: DAY1_FR_ITEMS,
  dialogues: { 'meeting-host': SCENE },
  steps: m01Steps('fr'),
};
