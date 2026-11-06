import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 13 — Home, Family & Daily Routine: "I could actually visit someone's home and handle this."
 * Defined ONCE for English, French and Spanish. The conversation is LOCKED (`core/homeFamily.ts`); this
 * is the journey around it — a home visit, not a list of rooms or relatives, and no "going to" grammar:
 *
 *   the briefing (a friend invited you home — nothing more) → come in + the compliment → the living
 *   room + YOUR sofa question → YOUR family question → mother → kitchen (captured) + "I live with my
 *   family" → the food invitation + the polite decline (the one builder: thank → but → my plan) →
 *   "I'm just tired" → "I'm going home" → after dinner: "I'm going to sleep" + the goodbye →
 *   a FLEX ROUND (transfer only) → the supported visit (Home Visit board + evening route) → the
 *   conversation → no help → the video → the final → 🏠 HOME VISIT COMPLETE.
 *
 * Rules kept here:
 *   - the learner says only the eight locked lines; the friend's lines are comprehension;
 *   - the board starts "?" and fills ONLY when the visit reveals it: the room after "Let's sit in the
 *     living room", mother → kitchen after the friend says it, dinner → grandmother's / feeling → tired
 *     / next → home → sleep only after the LEARNER says them (their own plan and state);
 *   - "I'm going home", "I'm going to eat…" and "I'm going to sleep" are three useful chunks, each in
 *     its own language's words (je rentre / je vais…, me voy / voy a…) — never one English rule;
 *   - the Flex Round recombines ONLY words this mission has taught; it is marked `transferOnly`, so it
 *     never counts as teaching, coverage or a sentence of the course.
 *
 * Coverage: `mission13Coverage.ts`, enforced by `mission13.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/** Final semantic artwork: one continuous home visit, shared by EN / ES / FR.
 * Room captures and Flex remain deterministic semantic UI, never picture choices.
 * Reviewed generation records: docs/mission13-artwork.json.
 */
type M13Slot =
  | 'at-the-door' | 'home-compliment' | 'living-room-sofa' | 'ask-family' | 'mother-kitchen' | 'live-with-family'
  | 'food-invitation' | 'polite-decline' | 'tired' | 'going-home' | 'after-dinner' | 'goodbye';
export const M13_SLOTS: Record<M13Slot, { image: string }> = {
  'at-the-door': { image: 'images/mission13/at-the-door.jpg' },
  'home-compliment': { image: 'images/mission13/home-compliment.jpg' },
  'living-room-sofa': { image: 'images/mission13/living-room-sofa.jpg' },
  'ask-family': { image: 'images/mission13/ask-family.jpg' },
  'mother-kitchen': { image: 'images/mission13/mother-kitchen.jpg' },
  'live-with-family': { image: 'images/mission13/live-with-family.jpg' },
  'food-invitation': { image: 'images/mission13/food-invitation.jpg' },
  'polite-decline': { image: 'images/mission13/polite-decline.jpg' },
  'tired': { image: 'images/mission13/tired.jpg' },
  'going-home': { image: 'images/mission13/going-home.jpg' },
  'after-dinner': { image: 'images/mission13/after-dinner.jpg' },
  'goodbye': { image: 'images/mission13/goodbye.jpg' },
};
/** Result picture only — never a choice, never a card. */
export const M13_PROPS = {
  'home-visit-complete': { image: 'images/mission13/home-visit-complete.jpg' },
} as const;
const look13 = (x: { image: string }): { image: string } => ({ image: x.image });

/* The locked conversation (EN · FR · ES · HE), line by line — the friend's lines… */
export const L_COME: L4 = ['Hi! Come in.', 'Salut ! Entre.', '¡Hola! Pasa.', 'היי! תיכנס.'];
export const L_SIT: L4 = ["Thank you. Let's sit in the living room.", 'Merci. On s’assoit dans le salon.', 'Gracias. Vamos a sentarnos en el salón.', 'תודה. בוא נשב בסלון.'];
export const L_NEW: L4 = ["Yes, it's new.", 'Oui, il est nouveau.', 'Sí, es nuevo.', 'כן, היא חדשה.'];
export const L_MOTHER: L4 = ['My mother is in the kitchen. Do you live with your family?', 'Ma mère est dans la cuisine. Tu habites avec ta famille ?', 'Mi madre está en la cocina. ¿Vives con tu familia?', 'אמא שלי במטבח. אתה גר עם המשפחה שלך?'];
export const L_HUNGRY: L4 = ['Nice. Are you hungry? Do you want to eat with us?', 'Super. Tu as faim ? Tu veux manger avec nous ?', 'Qué bien. ¿Tienes hambre? ¿Quieres comer con nosotros?', 'יפה. אתה רעב? רוצה לאכול איתנו?'];
export const L_TIRED: L4 = ['Lovely! You look tired. Are you okay?', 'C’est bien ! Tu as l’air fatigué. Ça va ?', '¡Qué bien! Pareces cansado. ¿Estás bien?', 'איזה יופי! אתה נראה עייף. הכל בסדר?'];
export const L_REST: L4 = ['Then go home and rest!', 'Alors rentre chez toi et repose-toi !', '¡Entonces vete a casa y descansa!', 'אז לך הביתה ותנוח!'];
export const L_AFTER: L4 = ["And after dinner at your grandmother's?", 'Et après le dîner chez ta grand-mère ?', '¿Y después de la cena en casa de tu abuela?', 'ואחרי הארוחה אצל סבתא?'];
export const L_BYE: L4 = ['Ha! Good night. Say hi to your family!', 'Ha ! Bonne nuit. Dis bonjour à ta famille !', '¡Ja! Buenas noches. ¡Saluda a tu familia!', 'חה! לילה טוב. תמסור ד״ש למשפחה!'];
/* …and the traveller's, as said. */
export const Y_HOME: L4 = ['Thanks. Your home is beautiful.', 'Merci. Ta maison est très belle.', 'Gracias. Tu casa es preciosa.', 'תודה. הבית שלך יפהפה.'];
export const Y_SOFA: L4 = ['Is this sofa new?', 'Ce canapé est nouveau ?', '¿Este sofá es nuevo?', 'הספה הזאת חדשה?'];
export const Y_FAMILY: L4 = ['Where is your family?', 'Où est ta famille ?', '¿Dónde está tu familia?', 'איפה המשפחה שלך?'];
export const Y_LIVE: L4 = ['Yes, I live with my family.', 'Oui, j’habite avec ma famille.', 'Sí, vivo con mi familia.', 'כן, אני גר עם המשפחה שלי.'];
export const Y_DECLINE: L4 = ["Thanks, but I'm going to eat at my grandmother's.", 'Merci, mais je vais manger chez ma grand-mère.', 'Gracias, pero voy a comer en casa de mi abuela.', 'תודה, אבל אני הולך לאכול אצל סבתא שלי.'];
export const Y_TIRED: L4 = ["Yes, I'm just tired.", 'Oui, je suis juste fatigué.', 'Sí, solo estoy cansado.', 'כן, אני רק עייף.'];
export const Y_GO_HOME: L4 = ["Yes, I'm going home.", 'Oui, je rentre chez moi.', 'Sí, me voy a casa.', 'כן, אני הולך הביתה.'];
export const Y_SLEEP: L4 = ["I'm going to sleep.", 'Je vais dormir.', 'Me voy a dormir.', 'אני הולך לישון.'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── The Home Visit board — "?" until the visit says it ────────────────────────────────────────── */

/**
 * How much the visit has revealed, in the order it reveals it:
 *   0 nothing · 1 the room (the friend: "Let's sit in the living room") · 2 mother → kitchen (the friend)
 *   · 3 dinner → grandmother's (YOU) · 4 feeling → tired (YOU) · 5 next → home (YOU) · 6 → sleep (YOU).
 */
export const M13_REVEALS = ['nothing', 'room', 'mother', 'dinner', 'feeling', 'home', 'sleep'] as const;
export type M13Reveal = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const BOARD_COPY = {
  home: ['🏠 הבית', '🏠 Home'], evening: ['🌙 הערב שלי', '🌙 My evening'],
  room: ['חדר ?', 'Room ?'], family: ['משפחה ?', 'Family ?'], dinner: ['ארוחת ערב ?', 'Dinner ?'], feeling: ['הרגשה ?', 'Feeling ?'], next: ['הלאה ?', 'Next ?'],
  livingRoom: ['חדר: סלון', 'Room: Living room'], motherKitchen: ['אמא: מטבח', 'Mother: Kitchen'],
  grandmothers: ['ארוחת ערב: אצל סבתא', 'Dinner: Grandmother’s'], tired: ['הרגשה: עייף', 'Feeling: Tired'],
  nextHome: ['הלאה: הביתה', 'Next: Home'], nextSleep: ['הלאה: הביתה → לישון', 'Next: Home → Sleep'],
} as const satisfies Record<string, Copy>;
/** The Home Visit board at reveal `n`, as text the screen renders as two columns (`homeBoard(0)` is all "?"). */
export const homeBoard = (n: M13Reveal): Copy => {
  const row = (i: 0 | 1): string => {
    const room = n >= 1 ? BOARD_COPY.livingRoom[i] : BOARD_COPY.room[i];
    const family = n >= 2 ? BOARD_COPY.motherKitchen[i] : BOARD_COPY.family[i];
    const dinner = n >= 3 ? BOARD_COPY.grandmothers[i] : BOARD_COPY.dinner[i];
    const feeling = n >= 4 ? BOARD_COPY.tired[i] : BOARD_COPY.feeling[i];
    const next = n >= 6 ? BOARD_COPY.nextSleep[i] : n >= 5 ? BOARD_COPY.nextHome[i] : BOARD_COPY.next[i];
    return `${BOARD_COPY.home[i]}: ${room} / ${family} ‖ ${BOARD_COPY.evening[i]}: ${dinner} / ${feeling} / ${next}`;
  };
  return [row(0), row(1)];
};

/** The evening route — none until you say you are going home; then where you are now, and what is next. */
const ROUTE: Record<'now' | 'home' | 'homeRest' | 'dinner' | 'sleep', Copy> = {
  now: ['עכשיו: אצל החבר ●', 'Now: Friend’s home ●'], home: ['הבא: הביתה', 'Next: Home'],
  homeRest: ['הביתה · מנוחה', 'Home · rest'], dinner: ['ארוחת ערב אצל סבתא', 'Dinner at grandmother’s'], sleep: ['לישון', 'Sleep'],
};
export const eveningRoute = (n: M13Reveal): Copy | null => {
  if (n < 5) return null;
  const steps = n >= 6 ? [ROUTE.now, ROUTE.homeRest, ROUTE.dinner, ROUTE.sleep] : [ROUTE.now, ROUTE.home];
  const row = (i: 0 | 1): string => `🧭 ${steps.map((s) => s[i]).join(' → ')}`;
  return [row(0), row(1)];
};
/** The parts of a board label, joined: the screen draws the route and the board, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const board = (n: M13Reveal, prompt?: Copy): Copy => {
  const route = eveningRoute(n);
  const join = (i: 0 | 1): string => [...(route ? [route[i]] : []), homeBoard(n)[i], ...(prompt ? [prompt[i]] : [])].join(BOARD_SEP);
  return [join(0), join(1)];
};

/** The visit, as plain serialisable data — every value null (or empty) until the visit has revealed it. */
export const homeVisitState = (n: M13Reveal) => ({
  conversationStage: M13_REVEALS[n],
  homeRoom: n >= 1 ? 'living-room' : null,
  familyLocation: n >= 2 ? { person: 'mother', room: 'kitchen' } : null,
  dinnerPlan: n >= 3 ? 'grandmothers' : null,
  feeling: n >= 4 ? 'tired' : null,
  nextSteps: n >= 6 ? ['home', 'sleep'] : n >= 5 ? ['home'] : [],
});

/** The ending — the outcome is the visit and your evening, never a score. */
export const HOME_VISIT_COMPLETE: Copy = [
  `🏠 הביקור הושלם${BOARD_SEP}${eveningRoute(6)![0]}${BOARD_SEP}${homeBoard(6)[0]}`,
  `🏠 HOME VISIT COMPLETE${BOARD_SEP}${eveningRoute(6)![1]}${BOARD_SEP}${homeBoard(6)[1]}`,
];

/* Situations — the moments with no question to answer: the learner's own move. */
const ENTER: Copy = ['נכנסת לבית של חבר.', 'You enter a friend’s home.'];
const WANT_FAMILY: Copy = ['אתה רוצה לדעת איפה המשפחה של החבר.', 'You want to know where your friend’s family is.'];
const AFTER_DINNER: Copy = ['אחרי הארוחה אצל סבתא — מה הלאה?', 'After dinner at your grandmother’s — what’s next?'];

/** The rooms of THIS home — tiles are semantic (their id is the room), captioned in the app language. */
export const M13_ROOMS: Record<'living-room' | 'kitchen', MatchTile> = {
  'living-room': { id: 'living-room', emoji: '🛋️', caption: { he: 'סלון', en: 'Living room' } },
  kitchen: { id: 'kitchen', emoji: '🍳', caption: { he: 'מטבח', en: 'Kitchen' } },
};

/**
 * THE FLEX ROUND — transfer only. Every interaction recombines what Mission 13 itself taught (no new
 * word), is marked `transferOnly`, and is never a sentence of the course: no item, no dialogue line.
 */
export const M13_FLEX = {
  transferOnly: true,
  /** Canonical: mother → kitchen. Here: the same words, another room. */
  location: { audio: ['My mother is in the living room.', 'Ma mère est dans le salon.', 'Mi madre está en el salón.', 'אמא שלי בסלון.'] as L4, correct: 'living-room' as const },
  /** A situation → the function (the canonical line, in a new frame). */
  next: { situation: AFTER_DINNER, answer: 'phrase.home.going-to-sleep' },
} as const;

export function m13Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M13Slot) => ({ line: true, key, t: l3(line), meaning, ...look13(M13_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  const rooms = (challenge = false): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true, ...(challenge ? { challenge: true } : {}),
    label: board(1, ['איפה האמא של החבר?', 'Where is your friend’s mother?']),
    tiles: [M13_ROOMS['living-room'], M13_ROOMS.kitchen], rounds: [{ audio: L_MOTHER, correct: 'kitchen', reinforce: L_MOTHER }],
  });
  const steps: BootcampStep[] = [
    // COME IN — the door opens; entering means a compliment (one social move, never word by word).
    cards(['נכנסים', 'Coming in'], board(0, ['החבר פותח את הדלת — ומה אתה אומר. הקש כדי לשמוע.', 'Your friend opens the door — and what you say. Tap to hear.']), [
      card('home.line.come-in', L_COME, ['היי! תיכנס.', 'Hi! Come in.'], 'at-the-door'),
      card('home.line.beautiful', Y_HOME, ['תודה. הבית שלך יפהפה. (נכנסים — ומחמיאים לבית)', 'Thanks. Your home is beautiful. (you come in — and compliment the home)'], 'home-compliment'),
    ]),
    // THE LIVING ROOM — where you sit; and YOUR question about something you notice there.
    cards(['בסלון', 'In the living room'], board(0, ['איפה יושבים — והשאלה שלך על משהו שאתה רואה. הקש כדי לשמוע.', 'Where you sit — and your question about something you see. Tap to hear.']), [
      card('home.line.sit', L_SIT, ['תודה. בוא נשב בסלון.', 'Thank you. Let’s sit in the living room.'], 'living-room-sofa'),
      card('home.line.sofa', Y_SOFA, ['הספה הזאת חדשה? (היוזמה שלך — שמת לב לספה)', 'Is this sofa new? (your initiative — you noticed the sofa)'], 'living-room-sofa'),
      card('home.line.new', L_NEW, ['כן, היא חדשה.', 'Yes, it’s new.'], 'living-room-sofa'),
    ]),
    // YOUR FAMILY QUESTION — nobody asked: you want to know where the family is.
    cards(['המשפחה', 'The family'], board(1, ['עכשיו אתה שואל — על המשפחה. הקש כדי לשמוע.', 'Now you ask — about the family. Tap to hear.']), [
      card('home.line.where-family', Y_FAMILY, ['איפה המשפחה שלך? (היוזמה שלך)', 'Where is your family? (your initiative)'], 'ask-family'),
    ]),
    k.practice({ kind: 'quickReply', label: board(1, ['מה אתה שואל?', 'What do you ask?']), rounds: [
      { situation: WANT_FAMILY, options: [['phrase.home.where-family', true], ['phrase.home.is-this-new', false], ['phrase.home.beautiful-home', false, l3(Y_HOME)]] },
    ] }),
    // THE ANSWER — and a question back: where the mother is, and who you live with.
    cards(['תשובה ושאלה', 'An answer — and a question'], board(1, ['החבר עונה — ושואל אותך. הקש כדי לשמוע.', 'Your friend answers — and asks you. Tap to hear.']), [
      card('home.line.mother', L_MOTHER, ['אמא שלי במטבח. אתה גר עם המשפחה שלך?', 'My mother is in the kitchen. Do you live with your family?'], 'mother-kitchen'),
      card('home.line.live-with', Y_LIVE, ['כן, אני גר עם המשפחה שלי.', 'Yes, I live with my family.'], 'live-with-family'),
    ]),
    rooms(),
    k.practice({ kind: 'quickReply', label: board(2, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.home.mother', options: [['phrase.home.live-with-family', true], ['phrase.home.where-family', false], ['phrase.home.is-this-new', false]] },
    ] }),
    // THE INVITATION — and the first time your own dinner plan exists: thank → but → my plan.
    cards(['הזמנה לאכול', 'An invitation to eat'], board(2, ['מזמינים אותך לאכול — אבל כבר יש לך תוכנית לארוחת ערב. הקש כדי לשמוע.', 'You’re invited to eat — but you already have dinner plans. Tap to hear.']), [
      card('home.line.hungry', L_HUNGRY, ['יפה. אתה רעב? רוצה לאכול איתנו?', 'Nice. Are you hungry? Want to eat with us?'], 'food-invitation'),
      card('home.line.decline', Y_DECLINE, ['תודה, אבל אני הולך לאכול אצל סבתא שלי. (תודה ← אבל ← התוכנית שלך)', 'Thanks, but I’m going to eat at my grandmother’s. (thank → but → your plan)'], 'polite-decline'),
    ]),
    k.practice({
      kind: 'sentenceBuilder', label: board(2, ['סרב יפה: תודה ← אבל ← התוכנית שלך', 'Decline politely: thank → but → your plan']),
      rounds: [{ itemId: 'phrase.home.thanks-but-grandmothers', chunks: [['Thanks, but', "I'm going to eat", "at my grandmother's."], ['Merci, mais', 'je vais manger', 'chez ma grand-mère.'], ['Gracias, pero', 'voy a comer', 'en casa de mi abuela.']] }],
    }),
    // HOW YOU FEEL — you're fine, only tired.
    cards(['איך אתה מרגיש', 'How you feel'], board(3, ['החבר שם לב למשהו. הקש כדי לשמוע.', 'Your friend notices something. Tap to hear.']), [
      card('home.line.tired-q', L_TIRED, ['איזה יופי! אתה נראה עייף. הכל בסדר?', 'Lovely! You look tired. Are you okay?'], 'tired'),
      card('home.line.just-tired', Y_TIRED, ['כן, אני רק עייף. (הכל בסדר — רק עייף)', 'Yes, I’m just tired. (I’m fine — only tired)'], 'tired'),
    ]),
    k.practice({ kind: 'quickReply', label: board(3, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.home.tired', options: [['phrase.home.im-tired', true, l3(Y_TIRED)], ['phrase.home.live-with-family', false], ['phrase.home.eat-at-grandmothers', false, l3(Y_DECLINE)]] },
    ] }),
    // GOING HOME — where you go next.
    cards(['הביתה', 'Home'], board(4, ['לאן אתה הולך עכשיו? הקש כדי לשמוע.', 'Where are you going now? Tap to hear.']), [
      card('home.line.rest', L_REST, ['אז לך הביתה ותנוח!', 'Then go home and rest!'], 'going-home'),
      card('home.line.going-home', Y_GO_HOME, ['כן, אני הולך הביתה. (לאן עכשיו: הביתה)', 'Yes, I’m going home. (where now: home)'], 'going-home'),
    ]),
    k.practice({ kind: 'quickReply', label: board(4, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.home.rest', options: [['phrase.home.going-home', true, l3(Y_GO_HOME)], ['phrase.home.im-tired', false, l3(Y_TIRED)], ['phrase.home.where-family', false]] },
    ] }),
    // AFTER DINNER — the next step, and the goodbye.
    cards(['ואחר כך', 'And after'], board(5, ['ומה אחרי הארוחה? הקש כדי לשמוע.', 'And after dinner? Tap to hear.']), [
      card('home.line.after', L_AFTER, ['ואחרי הארוחה אצל סבתא?', 'And after dinner at your grandmother’s?'], 'going-home'),
      card('home.line.sleep', Y_SLEEP, ['אני הולך לישון. (מה הלאה: לישון)', 'I’m going to sleep. (what’s next: sleep)'], 'after-dinner'),
      card('home.line.bye', L_BYE, ['חה! לילה טוב. תמסור ד״ש למשפחה!', 'Ha! Good night. Say hi to your family!'], 'goodbye'),
    ]),
    k.quiz('reply.home.goodbye', 'reply.home.rest', 'reply.home.come-in'),
    // THE FLEX ROUND — transfer only: the same words, recombined; the same functions, a new frame.
    k.practice({
      kind: 'visualMatch', quiet: true, transferOnly: true,
      label: ['🔁 סבב גמיש — ביקור אחר, אותן מילים. איפה האמא עכשיו?', '🔁 Flex round — another visit, the same words. Where is the mother now?'],
      tiles: [M13_ROOMS['living-room'], M13_ROOMS.kitchen], rounds: [{ audio: M13_FLEX.location.audio, correct: M13_FLEX.location.correct, reinforce: M13_FLEX.location.audio }],
    }),
    k.practice({ kind: 'quickReply', transferOnly: true, label: ['🔁 סבב גמיש — מה אתה אומר?', '🔁 Flex round — what do you say?'], rounds: [
      { situation: M13_FLEX.next.situation, options: [[M13_FLEX.next.answer, true], ['phrase.home.where-family', false], ['phrase.home.live-with-family', false]] },
    ] }),
    k.receipt(board(6, ['הערב שלך: הביתה, ארוחת ערב אצל סבתא, ואז לישון.', 'Your evening: home, dinner at your grandmother’s, then sleep.'])),
    // THE SUPPORTED VISIT — the whole conversation, in order; the board and the route fill as it goes.
    k.practice({ kind: 'quickReply', label: board(0), rounds: [
      { prompt: 'reply.home.come-in', options: [['phrase.home.beautiful-home', true, l3(Y_HOME)], ['phrase.home.is-this-new', false], ['phrase.home.going-home', false, l3(Y_GO_HOME)]] },
      { prompt: 'reply.home.sit', options: [['phrase.home.is-this-new', true], ['phrase.home.going-to-sleep', false], ['phrase.home.live-with-family', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(1), rounds: [
      { prompt: 'reply.home.new', options: [['phrase.home.where-family', true], ['phrase.home.live-with-family', false], ['phrase.home.beautiful-home', false, l3(Y_HOME)]] },
      { prompt: 'reply.home.mother', options: [['phrase.home.live-with-family', true], ['phrase.home.where-family', false], ['phrase.home.im-tired', false, l3(Y_TIRED)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(2), rounds: [
      { prompt: 'reply.home.hungry', options: [['phrase.home.eat-at-grandmothers', true, l3(Y_DECLINE)], ['phrase.home.is-this-new', false], ['phrase.home.going-to-sleep', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(3), rounds: [
      { prompt: 'reply.home.tired', options: [['phrase.home.im-tired', true, l3(Y_TIRED)], ['phrase.home.where-family', false], ['phrase.home.beautiful-home', false, l3(Y_HOME)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(4), rounds: [
      { prompt: 'reply.home.rest', options: [['phrase.home.going-home', true, l3(Y_GO_HOME)], ['phrase.home.live-with-family', false], ['phrase.home.is-this-new', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(5), rounds: [
      { prompt: 'reply.home.after', options: [['phrase.home.going-to-sleep', true], ['phrase.home.beautiful-home', false, l3(Y_HOME)], ['phrase.home.where-family', false]] },
    ] }),
    k.receipt(board(6, ['כל הביקור — מהדלת ועד הערב שלך.', 'The whole visit — from the door to your evening.'])),
    k.dialogue('at-a-friends-home'),
    k.receipt(['כל השיחה — נכנסת, שאלת, סירבת יפה וסיפרת מה הלאה.', 'The whole conversation — you came in, asked, declined politely and said what’s next.']),
    // NO HELP — the friend's real lines, in order, at natural speed: no meaning, no cards, no hints.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: L_COME, options: [['phrase.home.beautiful-home', true, l3(Y_HOME)], ['phrase.home.going-to-sleep', false], ['phrase.home.where-family', false]] },
        { npc: L_SIT, options: [['phrase.home.is-this-new', true], ['phrase.home.going-home', false, l3(Y_GO_HOME)], ['phrase.home.live-with-family', false]] },
        { npc: L_NEW, options: [['phrase.home.where-family', true], ['phrase.home.im-tired', false, l3(Y_TIRED)], ['phrase.home.beautiful-home', false, l3(Y_HOME)]] },
        { npc: L_MOTHER, options: [['phrase.home.live-with-family', true], ['phrase.home.is-this-new', false], ['phrase.home.going-to-sleep', false]] },
      ],
    }),
    k.practice({ kind: 'quickReply', challenge: true, label: board(2), rounds: [
      { npc: L_HUNGRY, options: [['phrase.home.eat-at-grandmothers', true, l3(Y_DECLINE)], ['phrase.home.where-family', false], ['phrase.home.im-tired', false, l3(Y_TIRED)]] },
      { npc: L_TIRED, options: [['phrase.home.im-tired', true, l3(Y_TIRED)], ['phrase.home.is-this-new', false], ['phrase.home.live-with-family', false]] },
    ] }),
    k.practice({ kind: 'quickReply', challenge: true, label: board(4), rounds: [
      { npc: L_REST, options: [['phrase.home.going-home', true, l3(Y_GO_HOME)], ['phrase.home.beautiful-home', false, l3(Y_HOME)], ['phrase.home.where-family', false]] },
      { npc: L_AFTER, options: [['phrase.home.going-to-sleep', true], ['phrase.home.is-this-new', false], ['phrase.home.live-with-family', false]] },
    ] }),
    k.receipt(['בלי עזרה — כל הביקור, בקצב של חבר.', 'No help — the whole visit, at a friend’s pace.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: a visit to a friend — run the conversation and settle your evening.
    k.practice({ kind: 'quickReply', label: board(0, ['ביקור אצל חבר. תנהל את השיחה ותסגור את הערב שלך.', 'A visit to a friend. Run the conversation and settle your evening.']), rounds: [
      { situation: ENTER, options: [['phrase.home.beautiful-home', true, l3(Y_HOME)], ['phrase.home.going-home', false, l3(Y_GO_HOME)], ['phrase.home.where-family', false]] },
      { npc: L_SIT, options: [['phrase.home.is-this-new', true], ['phrase.home.live-with-family', false], ['phrase.home.going-to-sleep', false]] },
      { npc: L_NEW, options: [['phrase.home.where-family', true], ['phrase.home.is-this-new', false], ['phrase.home.im-tired', false, l3(Y_TIRED)]] },
    ] }),
    rooms(true),
    k.practice({ kind: 'quickReply', label: board(2), rounds: [
      { npc: L_MOTHER, options: [['phrase.home.live-with-family', true], ['phrase.home.where-family', false], ['phrase.home.going-home', false, l3(Y_GO_HOME)]] },
      { npc: L_HUNGRY, options: [['phrase.home.eat-at-grandmothers', true, l3(Y_DECLINE)], ['phrase.home.live-with-family', false], ['phrase.home.beautiful-home', false, l3(Y_HOME)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(3), rounds: [
      { npc: L_TIRED, options: [['phrase.home.im-tired', true, l3(Y_TIRED)], ['phrase.home.going-to-sleep', false], ['phrase.home.is-this-new', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(4), rounds: [
      { npc: L_REST, options: [['phrase.home.going-home', true, l3(Y_GO_HOME)], ['phrase.home.eat-at-grandmothers', false, l3(Y_DECLINE)], ['phrase.home.where-family', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(5), rounds: [
      { npc: L_AFTER, options: [['phrase.home.going-to-sleep', true], ['phrase.home.is-this-new', false], ['phrase.home.live-with-family', false]] },
    ] }),
    k.receipt(HOME_VISIT_COMPLETE),
    { kind: 'summary' },
  ];
  // The result picture appears only at its earned receipt — with no semantic emoji fallback.
  const result: { image: string } = M13_PROPS['home-visit-complete'];
  return steps.map((step) => (step.kind === 'receipt' && step.text.en === HOME_VISIT_COMPLETE[1] && result.image ? { ...step, image: result.image } : step));
}

/** The briefing reveals only the arrival at the door — no later visit facts. */
export const M13_BRIEFING_IMAGE = M13_SLOTS['at-the-door'].image;
