import type { LocalizedText } from '@ready/content-schema';
import { COPY } from './companionCopy.js';
import type { CompanionMood } from './companionMood.js';

/**
 * What the companion says INSIDE a mission — always in the app language, so it can never expose
 * target-language material the learner has not met. Two kinds of line, both one short sentence:
 *   - the mission's goal, on its intro card;
 *   - what to do, the first time each kind of game appears in a mission.
 * Pure data + one pure function; the mission content itself is not touched.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });

/** One line per Core mission, keyed by the stable mission id. */
export const MISSION_INTRO: Record<string, LocalizedText> = {
  'introduce-myself': T('היום נלמד איך להתחיל שיחה.', 'Today we learn how to start a conversation.'),
  'numbers-money': T('בוא נתרגל מחירים ומספרים.', 'Let’s practise prices and numbers.'),
  'coffee-shop': T('היום מזמינים קפה — עם כל השאלות שבדרך.', 'Today we order a coffee — with every question on the way.'),
  'everyday-core': T('חמש מילים קטנות. מאות משפטים.', 'Five small words. Hundreds of sentences.'),
  'directions': T('היום בעיקר מקשיבים: ימינה, שמאלה, ישר.', 'Today is mostly listening: right, left, straight.'),
  'airport-border': T('ביקורת גבולות. זה בסך הכל תסריט.', 'Border control. It is just a script.'),
  'taxi': T('שישים שניות עם נהג. יעד, מחיר, עצירה.', 'Sixty seconds with a driver. Where, how much, stop.'),
  'hotel-check-in': T('מגיעים למלון. הזמנה, מפתח, ארוחת בוקר.', 'Arriving at the hotel. Reservation, key, breakfast.'),
  'shopping': T('רק מסתכלים, מודדים, לוקחים.', 'Just looking, trying on, taking it.'),
  'arrival-day-checkpoint': T('אין חדש היום. רק לראות מה נשאר.', 'Nothing new today. Just seeing what stuck.'),
  'small-talk': T('שיחה קטנה עם זר. לא עסקה — שיחה.', 'A little chat with a stranger. Not a transaction — a chat.'),
  'time-plans': T('היום קובעים תוכניות: מתי, ובאיזו שעה.', 'Today we make plans: when, and what time.'),
  'home-family': T('מבקרים אצל חבר. חיים רגילים.', 'Visiting a friend. Ordinary life.'),
  'restaurant-meal': T('ארוחה שלמה, משולחן ועד חשבון.', 'A whole meal, from table to bill.'),
  'special-requests-allergies': T('אומרים מה אסור לנו — ברור ורגוע.', 'Saying what we can’t eat — clearly and calmly.'),
  'hobbies-free-time': T('מה אתה אוהב לעשות? היום אומרים את זה.', 'What do you like doing? Today we say it.'),
  'supermarket': T('למצוא, לשלם, לבקש שקית.', 'Find it, pay, ask for a bag.'),
  'food-day-checkpoint': T('יום רגיל אחד. הכל כבר אצלך.', 'One ordinary day. You already have it all.'),
  'public-transport': T('כרטיס, רציף, תחנה.', 'Ticket, platform, stop.'),
  'past-events': T('איפה היית? מה עשית? היום מספרים.', 'Where were you? What did you do? Today we tell.'),
  'future-plans': T('לאן ממשיכים? היום מספרים על התוכניות.', 'Where next? Today we talk about plans.'),
  'fixing-problems': T('משהו השתבש. יש לנו מה להגיד.', 'Something went wrong. We know what to say.'),
  'opinions-reactions': T('היום אומרים מה אנחנו חושבים.', 'Today we say what we think.'),
  'city-day-checkpoint': T('עיר, שיחה, ואפס קפיאות.', 'A city, a conversation, and zero freezing.'),
  'lost-stolen-police': T('משהו נעלם. נסביר מה קרה.', 'Something is missing. We explain what happened.'),
  'pharmacy-health': T('מה כואב, ומה צריך.', 'What hurts, and what we need.'),
  'emergency': T('קצר וחשוב: איך מבקשים עזרה.', 'Short and important: how to ask for help.'),
  'no-subtitles': T('אין מילה חדשה. רק מהר יותר.', 'Not one new word. Just faster.'),
  'dress-rehearsal': T('ערב שלם, בטייק אחד.', 'A whole evening, in one take.'),
  'complete-day-abroad': T('זה היום. יום שלם, לבד.', 'This is the day. A whole day, alone.'),
};
export const MISSION_INTRO_FALLBACK = T('בוא נתחיל.', 'Let’s begin.');

/** What to do in each kind of game — never the engine's internal name. */
export const GAME_INTRO: Record<string, LocalizedText> = {
  matchPairs: T('חבר בין השאלה לתשובה.', 'Match each question to its answer.'),
  visualMatch: T('שמע את המחיר ומצא אותו.', 'Hear the price and find it.'),
  miniMap: T('תקשיב לכיוון ובחר לאן הולכים.', 'Listen to the direction and choose the way.'),
  sentenceBuilder: T('בנה את המשפט.', 'Build the sentence.'),
  swap: T('משפט אחד, סיומות שונות. בחר את הנכונה.', 'One sentence, different endings. Pick the right one.'),
  quickReply: T('שומעים שאלה — ועונים מהר.', 'Hear the question — answer quickly.'),
};

export interface CoachLine {
  line: LocalizedText;
  /** intro = the mission's goal · game = how to play the game that starts now */
  role: 'intro' | 'game';
}

/**
 * The companion's line for a step, or null (most steps have none — it stays out of the way).
 *   - the FIRST intro card of a mission: its goal;
 *   - the FIRST step of each game kind in a mission: one instruction.
 */
export function coachFor(steps: readonly { kind: string }[], index: number, missionId: string | undefined): CoachLine | null {
  const step = steps[index];
  if (!step) return null;
  const firstOfKind = steps.findIndex((s) => s.kind === step.kind) === index;
  if (!firstOfKind) return null;
  if (step.kind === 'talk') return { line: (missionId && MISSION_INTRO[missionId]) || MISSION_INTRO_FALLBACK, role: 'intro' };
  const game = GAME_INTRO[step.kind];
  return game ? { line: game, role: 'game' } : null;
}

/** The mood the buddy brings to each game's instruction: explaining is always its studying pose. */
export const GAME_MOOD: Record<string, CompanionMood> = {
  matchPairs: 'teaching', visualMatch: 'teaching', miniMap: 'teaching', sentenceBuilder: 'teaching', swap: 'teaching', quickReply: 'teaching',
};

export interface Presence { line: LocalizedText; mood: CompanionMood }
/**
 * The buddy on the Route and on Home: one contextual line and a mood, from where the learner stands.
 * It waves hello — to a new learner and to one coming back — and rests when everything is done.
 */
export function presenceFor(at: { done: number; resume: boolean; allDone: boolean }): Presence {
  if (at.allDone) return { line: COPY.presence.allDone, mood: 'resting' };
  if (at.resume) return { line: COPY.presence.resume, mood: 'greeting' };
  if (at.done === 0) return { line: COPY.presence.fresh, mood: 'greeting' };
  return { line: COPY.presence.next, mood: 'greeting' };
}
