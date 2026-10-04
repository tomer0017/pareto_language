import type { LocalizedText } from '@ready/content-schema';
import type { CompanionStage } from './companionModel.js';

/**
 * Everything the companion feature says in the APP language (Hebrew / English). Kept inside the
 * feature so the mascot can be developed without touching the shared dictionary.
 *
 * Voice: a travel buddy learning alongside you — warm, curious, a little mischievous. Never a
 * teacher, never a nag, never disappointed.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });

export interface StageCopy {
  name: LocalizedText;
  /** The learner's own state at this stage, in their voice. */
  feeling: LocalizedText;
  /** What this stage means, in one or two lines. */
  meaning: LocalizedText;
  /** What the companion itself can say at this stage. */
  speech: LocalizedText;
  /** Shown when this stage is reached. */
  arrived: LocalizedText;
}

export const STAGE_COPY: Record<CompanionStage, StageCopy> = {
  1: {
    name: T('דג מבוהל', 'Scared Fish'),
    feeling: T('״אני עדיין לא מבין כלום.״', '“I don’t understand anything yet.”'),
    meaning: T('ככה מתחילים כולם: שפה חדשה נשמעת כמו רעש. הדג שלך שומע בועות וסימני שאלה.', 'Everyone starts here: a new language sounds like noise. Your fish hears bubbles and question marks.'),
    speech: T('עדיין לא מדבר — רק בועות והבעות פנים.', 'No speech yet — only bubbles and expressions.'),
    arrived: T('הדג שלך נולד. הוא מבוהל — בינתיים.', 'Your fish is here. It is startled — for now.'),
  },
  2: {
    name: T('דג מרוכז', 'Focused Fish'),
    feeling: T('״אני מתחיל לזהות מה שאני שומע.״', '“I’m starting to recognize what I hear.”'),
    meaning: T('הרעש מתחיל להתפרק לצלילים מוכרים. הדג שלך נרגע, מקשיב, ומבין שמישהו מדבר אליו.', 'The noise is breaking into familiar sounds. Your fish has calmed down, listens, and knows someone is talking to it.'),
    speech: T('מקשיב ומהנהן. עדיין בלי מילים.', 'Listens and nods. Still no words.'),
    arrived: T('הוא כבר לא נבהל — הוא מקשיב.', 'It no longer panics — it listens.'),
  },
  3: {
    name: T('דג תוכי', 'Parrotfish'),
    feeling: T('״הצלילים הופכים למילים.״', '“Sounds are becoming words.”'),
    meaning: T('שלב הגשר: דג תוכי אמיתי, עם מקור. הוא מתחיל לחקות — הברה, ואז מילה שכבר למדת.', 'The bridge stage: a real parrotfish, beak and all. It begins to imitate — a syllable, then a word you already learned.'),
    speech: T('ממלמל, ולפעמים חוזר על מילה אחת שלמדת.', 'Babbles, and sometimes repeats one word you learned.'),
    arrived: T('הדג שלך הפך לדג תוכי — ויש לו מקור.', 'Your fish became a parrotfish — and it has a beak.'),
  },
  4: {
    name: T('תוכי צעיר', 'Young Parrot'),
    feeling: T('״אני יכול לבנות משפט שימושי.״', '“I can form useful language.”'),
    meaning: T('יצאנו מהמים. התוכי הצעיר אומר מילים וצירופים קצרים שלמדת, ומנפנף בכנפיים כשמצליחים.', 'Out of the water. The young parrot says words and short phrases you learned, and flaps when things go well.'),
    speech: T('צירופים קצרים מאוד — רק מתוך מה שכבר למדת.', 'Very short phrases — only from what you already learned.'),
    arrived: T('יש לו כנפיים, ויש לו מה להגיד.', 'It has wings, and it has something to say.'),
  },
  5: {
    name: T('תוכי מדבר', 'Talking Parrot'),
    feeling: T('״אני מסתדר בשיחה.״', '“I can handle conversations.”'),
    meaning: T('בטוח וחברותי. מדבר במשפטים קצרים, מגיב בטבעיות, ומזכיר דברים שכבר למדתם יחד.', 'Confident and social. Speaks in short sentences, reacts naturally, and brings up things you learned together.'),
    speech: T('משפטים קצרים מתוך החומר שלמדת.', 'Short sentences from what you have learned.'),
    arrived: T('התוכי שלך מדבר. זה הישג אמיתי.', 'Your parrot talks. That is a real achievement.'),
  },
  6: {
    name: T('פטפטן', 'Chatterbox'),
    feeling: T('״שפה קורית סביבי — ואני מסתדר.״', '“Language is happening around me — and I can handle it.”'),
    meaning: T('הדג שלא הבין מילה כבר לא מפסיק לדבר: טלפון, מוזיקה, טלוויזיה — הכל בבת אחת, בנחת.', 'The fish that couldn’t understand a word now won’t stop talking: phone, music, TV — all at once, completely at ease.'),
    speech: T('מדבר בחופשיות, צוחק, ועושה חמישה דברים במקביל.', 'Talks freely, laughs, and does five things at once.'),
    arrived: T('זה קרה. הוא לא מפסיק לדבר.', 'It happened. It will not stop talking.'),
  },
};

export const COPY = {
  pageTitle: T('החבר שלי לשפה', 'My language buddy'),
  cardTitle: (language: string): LocalizedText => T(`החבר שלי ל${language}`, `My ${language} buddy`),
  stageOf: (n: number): LocalizedText => T(`שלב ${n} מתוך 6`, `Stage ${n} of 6`),
  open: T('לפתוח את דף החבר לשפה', 'Open the language buddy page'),
  whyTitle: T('למה הוא משתנה?', 'Why does it change?'),
  why: T(
    'דג לא יודע לדבר. גם מי שמתחיל שפה חדשה לא. ככל שאתה מבין ומתקשר יותר, הדג שלך גדל — עד שהוא תוכי שלא מפסיק לפטפט. הוא גדל רק קדימה: שלב שהגעת אליו נשאר שלך.',
    'A fish cannot speak. Neither can a beginner in a new language. The more you understand and communicate, the more your fish grows — until it is a parrot that will not stop chatting. It only grows forward: a stage you reached stays yours.',
  ),
  notReadiness: T('זה לא ״מוכנות לטיול״. המוכנות מודדת כמה מצבים אתה כבר מסוגל לעבור; החבר מראה כמה השפה חיה אצלך.', 'This is not Trip Readiness. Readiness counts the situations you can already handle; your buddy shows how alive the language is in you.'),
  perLanguage: (language: string): LocalizedText => T(`לכל שפה יש חבר משלה. זה החבר שלך ל${language}.`, `Every language has its own buddy. This one is your ${language} buddy.`),
  journey: T('המסע שלו', 'Its journey'),
  now: T('עכשיו', 'Now'),
  nextStage: T('השלב הבא', 'Next stage'),
  toNext: (pct: number): LocalizedText => T(`${pct}% בדרך לשלב הבא`, `${pct}% of the way to the next stage`),
  howToGrow: T('כל משימה שמסיימים מגדלת אותו. נקודות ביקורת מגדלות אותו יותר.', 'Every mission you finish makes it grow. Checkpoints make it grow more.'),
  beyondCore: T('הפטפטן לא מגיע בסוף המסלול הבסיסי — הוא דורש להמשיך להשתמש בשפה גם אחריו. תכנים נוספים בדרך.', 'The Chatterbox does not arrive at the end of the core path — it takes continued use of the language beyond it. More content is on the way.'),
  finalStage: T('הגעת לשלב האחרון. הוא לא מפסיק לדבר — וגם אתה לא.', 'You reached the final stage. It will not stop talking — and neither will you.'),
  whatItSays: T('מה הוא כבר אומר', 'What it can say'),
  locked: T('עוד לא', 'Not yet'),
  levelUp: T('עלית שלב!', 'Level up!'),
  became: (from: string, to: string): LocalizedText => T(`ה${from} שלך הפך ל${to} 🎉`, `Your ${from} became a ${to} 🎉`),
  continue: T('ממשיכים', 'Continue'),
  meet: T('להכיר אותו', 'Meet your buddy'),
  missionDone: [
    T('עוד מצב אחד שאתה מסוגל לעבור.', 'One more situation you can handle.'),
    T('הוא גדל קצת. גם אתה.', 'It grew a little. So did you.'),
    T('זה היה אתה. הוא רק הסתכל.', 'That was all you. It just watched.'),
  ],
  /** Short reactions by animation state, for the reusable reaction component. */
  reactions: {
    correct: T('כן!', 'Yes!'),
    encouraging: T('קרוב. עוד פעם?', 'Close. One more go?'),
    thinking: T('הממ…', 'Hmm…'),
    recovery: T('זה מהלך מנצח. ככה לא נתקעים.', 'That is a winning move. That is how you never get stuck.'),
    celebrate: T('איזה יופי!', 'Lovely!'),
  },
} as const;
