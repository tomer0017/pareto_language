import type { LocalizedText } from '@ready/content-schema';
import type { CompanionStage } from './companionModel.js';

/**
 * Everything the companion feature says in the APP language (Hebrew / English). Kept inside the
 * feature so the mascot can be developed without touching the shared dictionary.
 *
 * Voice: a travel buddy learning alongside you — warm, curious, a little mischievous. Never a
 * teacher, never a nag, never disappointed.
 *
 * PRODUCT RULE — the evolution is a discovery. Nothing here that reaches the screen may name a
 * stage, count stages, say what the character will become, or say when. The learner is shown one
 * character — "your buddy" — and notices for themselves that it is changing.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });

export interface StageCopy {
  /** INTERNAL label (docs, tests, debugging). Never rendered: the character has no name on screen. */
  name: LocalizedText;
  /** What the buddy is like right now — behaviour the learner can already see, nothing ahead of it. */
  behaviour: LocalizedText;
}

export const STAGE_COPY: Record<CompanionStage, StageCopy> = {
  1: {
    name: T('דג מבוהל', 'Scared Fish'),
    behaviour: T('הכול עוד נשמע לו כמו בועות. הוא מקשיב איתך — ומנסה להבין מה קורה.', 'Everything still sounds like bubbles to it. It listens with you — and tries to work out what is going on.'),
  },
  2: {
    name: T('דג מרוכז', 'Focused Fish'),
    behaviour: T('הוא כבר לא נבהל. הוא מזהה קולות, ומסתכל על מי שמדבר.', 'It no longer startles. It recognises voices, and looks at whoever is speaking.'),
  },
  3: {
    name: T('דג תוכי', 'Parrotfish'),
    behaviour: T('הוא התחיל לחקות. לפעמים יוצאת לו מילה שלמדתם יחד.', 'It has started to imitate. Sometimes a word you learned together slips out.'),
  },
  4: {
    name: T('תוכי צעיר', 'Young Parrot'),
    behaviour: T('יש לו מה להגיד: צירופים קצרים, מתוך מה שלמדתם.', 'It has things to say: short phrases, from what you learned.'),
  },
  5: {
    name: T('תוכי מדבר', 'Talking Parrot'),
    behaviour: T('הוא מדבר, מגיב, ומזכיר דברים שלמדתם יחד.', 'It talks, reacts, and brings up things you learned together.'),
  },
  6: {
    name: T('פטפטן', 'Chatterbox'),
    behaviour: T('הוא לא מפסיק לדבר. טלפון, מוזיקה, טלוויזיה — הכול בבת אחת, בנחת.', 'It will not stop talking. Phone, music, TV — all at once, completely at ease.'),
  },
};

export const COPY = {
  /** The only thing the character is ever called. */
  buddy: T('החבר שלך', 'Your buddy'),
  buddyFor: (language: string): LocalizedText => T(`החבר שלך ל${language}`, `Your ${language} buddy`),
  open: T('לבקר את החבר שלך', 'Visit your buddy'),
  learnsWithYou: T('החבר שלך לומד איתך.', 'Your buddy is learning with you.'),
  changes: T('ככל שאתה מבין ומדבר יותר, הוא משתנה.', 'The more you understand and speak, the more it changes.'),
  stirring: T('משהו משתנה…', 'Something is changing…'),
  together: T('מה עברתם יחד', 'What you have done together'),
  noMilestones: T('עוד לא התחלתם. המשימה הראשונה מחכה לשניכם.', 'You have not started yet. The first mission is waiting for you both.'),
  perLanguage: T('לכל שפה שתלמד יש חבר משלה.', 'Every language you learn has a buddy of its own.'),
  /** The reveal. No stage, no name, no "level". */
  changedTitle: T('רגע… משהו השתנה!', 'Wait… something changed!'),
  changedLine: T('החבר שלך השתנה איתך ✨', 'Your buddy changed with you ✨'),
  continue: T('ממשיכים', 'Continue'),
  missionDone: [
    T('עוד מצב אחד שאתה מסוגל לעבור.', 'One more situation you can handle.'),
    T('הוא גדל קצת. גם אתה.', 'It grew a little. So did you.'),
    T('זה היה אתה. הוא רק הסתכל.', 'That was all you. It just watched.'),
  ],
  /** Short reactions, for the reusable reaction component. */
  reactions: {
    correct: T('כן!', 'Yes!'),
    encouraging: T('כמעט. אני איתך — עוד פעם?', 'So close. I’m with you — one more go?'),
    thinking: T('הממ…', 'Hmm…'),
    recovery: T('בדיוק. זה מהלך חכם — ככה לא נתקעים.', 'Exactly. That is the smart move — that is how you never get stuck.'),
    celebrate: T('איזה יופי!', 'Lovely!'),
    proud: T('זה שלך. הרווחת את זה.', 'That one is yours. You earned it.'),
  },
  /** The very first hello, before the first mission. */
  welcome: T('היי! אני החבר שלך למסע הזה.', 'Hi! I’m your buddy for this journey.'),
  /** What the buddy says on the Route, by where the learner stands. */
  presence: {
    fresh: T('נעים מאוד. מתחילים?', 'Nice to meet you. Shall we start?'),
    resume: T('טוב שחזרת! עצרנו באמצע — ממשיכים?', 'Good to see you! We stopped halfway — carry on?'),
    next: T('טוב שחזרת! המשימה הבאה מחכה לנו.', 'Welcome back! The next mission is waiting for us.'),
    allDone: T('עברנו את הכול. רוצה לחזור על משהו?', 'We have done it all. Fancy going over something?'),
  },
} as const;
