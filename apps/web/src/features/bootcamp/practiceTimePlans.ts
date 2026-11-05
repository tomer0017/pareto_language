import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 12 — Time & Plans: "We made plans for tonight and tomorrow." Defined ONCE for English,
 * French and Spanish. The conversation is LOCKED (`core/timePlans.ts`); this is the journey around it.
 * The lesson is MAKING PLANS, not clock vocabulary:
 *
 *   the briefing (it is morning; only YOUR availability is known) → this morning / later → free
 *   tonight → the invitation (dinner in the centre) + "Yes! What time?" → 20:00 captured + "not too
 *   late" → YOUR initiative: what are you doing tomorrow? (today / tonight → tomorrow) → the beach
 *   captured + "I'm free tomorrow" (TRANSFER, not a new lesson) → leaving early + the one builder:
 *   "No problem. Let's meet here at seven." → see you tonight → the supported conversation (Time Strip +
 *   planner) → the conversation → no help → the video → the final → 📅 PLANS MADE.
 *
 * Rules kept here:
 *   - the learner says only the seven locked lines; the friend's lines are comprehension;
 *   - the planner starts "?" and fills ONLY after the line that reveals each fact — dinner / centre
 *     after the invitation, 20:00 after "At eight", the beach after the tomorrow-morning line, "early"
 *     after "we leave early" — and 07:00 only after the LEARNER proposes seven (their plan, not news);
 *   - the Time Strip shows time periods only (this morning · later · tonight · tomorrow morning) and
 *     highlights where the conversation is — never 20:00, the beach or 07:00;
 *   - teach once, then transfer: "I'm free tonight" is taught; "I'm free tomorrow" is the same pattern
 *     with a new time and gets no card of its own; "What are you doing tomorrow?" is shown next to the
 *     two questions the friend already asked (today, tonight) — a pattern, never a grammar lesson;
 *   - no clock pictures: every time is deterministic text (18:00 · 20:00 · 22:00), all tiles alike.
 *
 * Coverage: `mission12Coverage.ts`, enforced by `mission12.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/** Final semantic artwork shared by EN / ES / FR. Related gestures reuse a whole asset;
 * exact times and planner facts remain UI. See docs/MISSION12_ASSET_MANIFEST.md. */
type M12Slot =
  | 'morning-meeting' | 'morning-question' | 'open-morning' | 'tonight-question' | 'free-tonight' | 'dinner-invitation' | 'ask-time' | 'not-too-late' | 'very-good-there' | 'ask-tomorrow' | 'beach-plan' | 'leave-early' | 'meeting-plan' | 'see-you-tonight';
export const M12_SLOTS: Record<M12Slot, { image: string }> = {
  'morning-meeting': { image: 'images/mission12/morning-meeting.jpg' },
  'morning-question': { image: 'images/mission12/morning-meeting.jpg' },
  'open-morning': { image: 'images/mission12/availability.jpg' },
  'tonight-question': { image: 'images/mission12/morning-meeting.jpg' },
  'free-tonight': { image: 'images/mission12/availability.jpg' },
  'dinner-invitation': { image: 'images/mission12/dinner-invitation.jpg' },
  'ask-time': { image: 'images/mission12/ask-time.jpg' },
  'not-too-late': { image: 'images/mission12/not-too-late.jpg' },
  'very-good-there': { image: 'images/mission12/dinner-invitation.jpg' },
  'ask-tomorrow': { image: 'images/mission12/ask-time.jpg' },
  'beach-plan': { image: 'images/mission12/beach-plan.jpg' },
  'leave-early': { image: 'images/mission12/leave-early.jpg' },
  'meeting-plan': { image: 'images/mission12/meeting-plan.jpg' },
  'see-you-tonight': { image: 'images/mission12/see-you-tonight.jpg' },
};
/** Result pictures only — never a choice, never a card. */
export const M12_PROPS = {
  'plans-made': { image: 'images/mission12/plans-made.jpg' },
} as const;
const look12 = (x: { image: string }): { image: string } => ({ image: x.image });

/* The locked conversation (EN · FR · ES · HE), line by line — the friend's lines… */
export const L_TODAY: L4 = ['Good morning! What are you doing today?', 'Bonjour ! Tu fais quoi aujourd’hui ?', '¡Buenos días! ¿Qué haces hoy?', 'בוקר טוב! מה אתה עושה היום?'];
export const L_TONIGHT: L4 = ['And what are you doing tonight?', 'Et tu fais quoi ce soir ?', '¿Y qué haces esta noche?', 'ומה אתה עושה הערב?'];
export const L_INVITE: L4 = ["We're going to eat in the centre. Do you want to come?", 'On va manger dans le centre. Tu veux venir ?', 'Vamos a comer en el centro. ¿Quieres venir?', 'אנחנו הולכים לאכול במרכז. רוצה לבוא?'];
export const L_EIGHT: L4 = ['At eight. Is that too late for you?', 'À huit heures. C’est trop tard pour toi ?', 'A las ocho. ¿Es muy tarde para ti?', 'בשמונה. זה מאוחר מדי בשבילך?'];
export const L_GOOD: L4 = ["Great. It's very good there.", 'Super. C’est très bon là-bas.', 'Genial. Allí se come muy bien.', 'מעולה. מאוד טוב שם.'];
export const L_BEACH: L4 = ["Tomorrow morning I'm going to the beach. Are you free tomorrow?", 'Demain matin, je vais à la plage. Tu es libre demain ?', 'Mañana por la mañana voy a la playa. ¿Estás libre mañana?', 'מחר בבוקר אני הולך לים. אתה פנוי מחר?'];
export const L_EARLY: L4 = ['Then come with us! But we leave early.', 'Alors viens avec nous ! Mais on part tôt.', '¡Entonces ven con nosotros! Pero salimos temprano.', 'אז בוא איתנו! אבל אנחנו יוצאים מוקדם.'];
export const L_BYE: L4 = ['Perfect. I have to go now — see you tonight!', 'Parfait. Je dois y aller maintenant — à ce soir !', 'Perfecto. Me tengo que ir ahora — ¡nos vemos esta noche!', 'מושלם. אני חייב ללכת עכשיו — נתראה הערב!'];
/* …and the traveller's, as said. */
export const Y_TODAY: L4 = ['Nothing this morning. Maybe later.', 'Rien ce matin. Peut-être plus tard.', 'Nada esta mañana. Quizás más tarde.', 'כלום הבוקר. אולי אחר כך.'];
export const Y_TONIGHT: L4 = ["I'm free tonight.", 'Je suis libre ce soir.', 'Estoy libre esta noche.', 'אני פנוי הערב.'];
export const Y_WHAT_TIME: L4 = ['Yes! What time?', 'Oui ! À quelle heure ?', '¡Sí! ¿A qué hora?', 'כן! באיזו שעה?'];
export const Y_NOT_LATE: L4 = ["No, that's not too late.", 'Non, ce n’est pas trop tard.', 'No, no es muy tarde.', 'לא, זה לא מאוחר מדי.'];
export const Y_TOMORROW: L4 = ['What are you doing tomorrow?', 'Tu fais quoi demain ?', '¿Qué haces mañana?', 'מה אתה עושה מחר?'];
export const Y_FREE_TOMORROW: L4 = ["Yes, I'm free tomorrow.", 'Oui, je suis libre demain.', 'Sí, estoy libre mañana.', 'כן, אני פנוי מחר.'];
export const Y_MEET: L4 = ["No problem. Let's meet here at seven.", 'Pas de problème. On se retrouve ici à sept heures.', 'No hay problema. Quedamos aquí a las siete.', 'אין בעיה. ניפגש כאן בשבע.'];
/* The opening answer is two practical chunks — never three isolated words. */
const Y_NOTHING: L4 = ['Nothing this morning.', 'Rien ce matin.', 'Nada esta mañana.', 'כלום הבוקר.'];
const Y_LATER: L4 = ['Maybe later.', 'Peut-être plus tard.', 'Quizás más tarde.', 'אולי אחר כך.'];
/* The pattern the friend has used twice — the question without the friend's own greeting / "and". */
const P_TODAY: L4 = ['What are you doing today?', 'Tu fais quoi aujourd’hui ?', '¿Qué haces hoy?', 'מה אתה עושה היום?'];
const P_TONIGHT: L4 = ['What are you doing tonight?', 'Tu fais quoi ce soir ?', '¿Qué haces esta noche?', 'מה אתה עושה הערב?'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── The Time Strip — time periods only, never a fact ────────────────────────────────────────── */

/** The four moments, in the order a day runs. `now` is this morning: the conversation happens now. */
export const M12_PERIODS = ['morning', 'later', 'tonight', 'tomorrow'] as const;
export type M12Period = (typeof M12_PERIODS)[number];
const PERIOD: Record<M12Period, Copy> = {
  morning: ['☀️ עכשיו · הבוקר', '☀️ Now · This morning'],
  later: ['⏳ אחר כך', '⏳ Later'],
  tonight: ['🌙 הערב', '🌙 Tonight'],
  tomorrow: ['🌅 מחר בבוקר', '🌅 Tomorrow morning'],
};
/** The highlighted cell carries this mark (the screen draws it as the highlight, not as a character). */
export const NOW_MARK = ' ●';
/** The strip with `focus` highlighted — as text the screen renders as four cells. */
export const timeStrip = (...focus: M12Period[]): Copy => {
  const row = (i: 0 | 1): string => M12_PERIODS.map((p) => `${PERIOD[p][i]}${focus.includes(p) ? NOW_MARK : ''}`).join(' → ');
  return [row(0), row(1)];
};

/* ── The live planner — "?" until the conversation says it ──────────────────────────────────── */

/**
 * How much of the plan the conversation has revealed, in the order it reveals it:
 *   0 nothing · 1 the invitation (dinner, centre) · 2 "At eight" (20:00) · 3 the beach · 4 "we leave
 *   early" · 5 the LEARNER's "Let's meet here at seven" (here, 07:00) · 6 the goodbye (both confirmed).
 */
export const M12_REVEALS = ['nothing', 'invitation', 'eight', 'beach', 'early', 'meeting', 'confirmed'] as const;
export type M12Reveal = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const PLAN_COPY = {
  tonight: ['🌙 הערב', '🌙 Tonight'], tomorrow: ['🌅 מחר', '🌅 Tomorrow'],
  plan: ['תוכנית ?', 'Plan ?'], time: ['שעה ?', 'Time ?'], meet: ['מפגש ?', 'Meet ?'],
  dinner: ['ארוחת ערב · מרכז', 'Dinner · Centre'], beach: ['חוף הים', 'Beach'],
  early: ['מפגש ? · יוצאים מוקדם', 'Meet ? · leaving early'], meetHere: ['נפגשים כאן · 07:00', 'Meet here · 07:00'],
} as const satisfies Record<string, Copy>;
/** The planner at reveal `n`, as text the screen renders as two days (`planner(0)` is all "?"). */
export const planner = (n: M12Reveal): Copy => {
  const row = (i: 0 | 1): string => {
    const ok = n >= 6 ? ' ✅' : '';
    const tonightPlan = n >= 1 ? PLAN_COPY.dinner[i] : PLAN_COPY.plan[i];
    const tonightTime = n >= 2 ? `20:00${ok}` : PLAN_COPY.time[i];
    const tomorrowPlan = n >= 3 ? PLAN_COPY.beach[i] : PLAN_COPY.plan[i];
    const tomorrowMeet = n >= 5 ? `${PLAN_COPY.meetHere[i]}${ok}` : n >= 4 ? PLAN_COPY.early[i] : PLAN_COPY.meet[i];
    return `${PLAN_COPY.tonight[i]}: ${tonightPlan} / ${tonightTime} ‖ ${PLAN_COPY.tomorrow[i]}: ${tomorrowPlan} / ${tomorrowMeet}`;
  };
  return [row(0), row(1)];
};
/** The parts of a board label, joined: the screen draws the strip and the planner, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const board = (strip: Copy, plan: Copy | null, prompt?: Copy): Copy => {
  const join = (i: 0 | 1): string => [strip[i], ...(plan ? [plan[i]] : []), ...(prompt ? [prompt[i]] : [])].join(BOARD_SEP);
  return [join(0), join(1)];
};

/** The plan, as plain serialisable data — every value null until the conversation has revealed it. */
export const planState = (n: M12Reveal, timeFocus: M12Period = 'morning') => ({
  timeFocus,
  tonightPlan: n >= 1 ? 'dinner' : null,
  tonightPlace: n >= 1 ? 'centre' : null,
  tonightTime: n >= 2 ? '20:00' : null,
  tomorrowPlan: n >= 3 ? 'beach' : null,
  tomorrowDeparture: n >= 4 ? 'early' : null,
  tomorrowMeetingPlace: n >= 5 ? 'here' : null,
  tomorrowMeetingTime: n >= 5 ? '07:00' : null,
  confirmed: n >= 6,
});

/** The ending — the outcome is the two plans, never a score. */
export const PLANS_MADE: Copy = [`📅 התוכניות נקבעו${BOARD_SEP}${planner(6)[0]}`, `📅 PLANS MADE${BOARD_SEP}${planner(6)[1]}`];

/* Situations — the moments with no question to answer: the learner's own move. */
const EVENING_FREE: Copy = ['הערב שלך פנוי. תגיד לחבר.', 'Your evening is free. Tell your friend.'];
const NO_TIME_YET: Copy = ['מזמינים אותך — אבל אתה לא יודע מתי.', 'Someone invites you — but you don’t know when.'];

/** The capture tiles: deterministic UI — the same plain text for every time, no clock, no picture. */
const HOURS: MatchTile[] = ['18:00', '20:00', '22:00'].map((h) => ({ id: h, label: h }));
/** Tomorrow morning: where is the friend going? The two plans the conversation itself has named. */
const PLACE_TILES: MatchTile[] = [
  { id: 'beach', emoji: '🏖️', caption: { he: 'חוף הים', en: 'Beach' } },
  { id: 'dinner-centre', emoji: '🍽️', caption: { he: 'ארוחת ערב · מרכז', en: 'Dinner · Centre' } },
];
/** "See you tonight": when do you see your friend next? Two cells of the Time Strip. */
const NEXT_TILES: MatchTile[] = [
  { id: 'tonight', emoji: '🌙', caption: { he: 'הערב', en: 'Tonight' } },
  { id: 'tomorrow', emoji: '🌅', caption: { he: 'מחר בבוקר', en: 'Tomorrow morning' } },
];

export function m12Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M12Slot) => ({ line: true, key, t: l3(line), meaning, ...look12(M12_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  const hour = (challenge = false): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true, ...(challenge ? { challenge: true } : {}),
    label: board(timeStrip('tonight'), planner(1), ['באיזו שעה ארוחת הערב?', 'What time is dinner?']),
    tiles: HOURS, rounds: [{ audio: L_EIGHT, correct: '20:00', reinforce: L_EIGHT }],
  });
  const seeYou = (challenge = false): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true, ...(challenge ? { challenge: true } : {}),
    // The strip marks only NOW here: highlighting tonight would answer the question for the learner.
    label: board(timeStrip('morning'), planner(5), ['מתי אתם נפגשים שוב?', 'When do you see your friend next?']),
    tiles: NEXT_TILES, rounds: [{ audio: L_BYE, correct: 'tonight', reinforce: L_BYE }],
  });
  const steps: BootcampStep[] = [
    // THIS MORNING — the friend's first question, and an answer in two practical chunks.
    cards(['הבוקר', 'This morning'], board(timeStrip('morning'), planner(0), ['החבר שואל מה אתה עושה היום. הקש כדי לשמוע.', 'Your friend asks what you are doing today. Tap to hear.']), [
      card('time.line.today', L_TODAY, ['בוקר טוב! מה אתה עושה היום?', 'Good morning! What are you doing today?'], 'morning-question'),
      card('time.line.nothing', Y_NOTHING, ['כלום הבוקר. (הבוקר פנוי)', 'Nothing this morning. (your morning is open)'], 'open-morning'),
      card('time.line.later', Y_LATER, ['אולי אחר כך. (עוד לא החלטת)', 'Maybe later. (you have not decided yet)'], 'open-morning'),
    ]),
    // TONIGHT — the reusable pattern, taught ONCE: I'm free + a time.
    cards(['הערב', 'Tonight'], board(timeStrip('tonight'), planner(0), ['ועכשיו — הערב. הקש כדי לשמוע.', 'Now — tonight. Tap to hear.']), [
      card('time.line.tonight', L_TONIGHT, ['ומה אתה עושה הערב?', 'And what are you doing tonight?'], 'tonight-question'),
      card('time.line.free-tonight', Y_TONIGHT, ['אני פנוי הערב. (אני פנוי + מתי)', 'I’m free tonight. (I’m free + when)'], 'free-tonight'),
    ]),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tonight'), planner(0), ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.time.tonight-q', options: [['phrase.time.free-tonight', true], ['phrase.time.maybe-later', false, l3(Y_TODAY)]] },
    ] }),
    // THE INVITATION — the first time dinner and the centre exist.
    cards(['הזמנה', 'An invitation'], board(timeStrip('tonight'), planner(0), ['החבר מזמין אותך — ואתה רוצה לדעת מתי. הקש כדי לשמוע.', 'Your friend invites you — and you want to know when. Tap to hear.']), [
      card('time.line.invite', L_INVITE, ['אנחנו הולכים לאכול במרכז. רוצה לבוא?', 'We’re going to eat in the centre. Do you want to come?'], 'dinner-invitation'),
      card('time.line.what-time', Y_WHAT_TIME, ['כן! באיזו שעה? (מתאים לי — רק תגיד מתי)', 'Yes! What time? (you’re in — you just need the time)'], 'ask-time'),
    ]),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tonight'), planner(1), ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { situation: NO_TIME_YET, options: [['phrase.time.what-time', true, l3(Y_WHAT_TIME)], ['phrase.time.free-tonight', false], ['phrase.time.maybe-later', false, l3(Y_TODAY)]] },
    ] }),
    // 20:00 — the first time the hour exists; then whether it works for you.
    cards(['השעה', 'The time'], board(timeStrip('tonight'), planner(1), ['החבר אומר שעה — ושואל אם זה מתאים לך. הקש כדי לשמוע.', 'Your friend names a time — and asks if it works for you. Tap to hear.']), [
      card('time.line.eight', L_EIGHT, ['בשמונה. זה מאוחר מדי בשבילך?', 'At eight. Is that too late for you?'], 'dinner-invitation'),
      card('time.line.not-too-late', Y_NOT_LATE, ['לא, זה לא מאוחר מדי. (השעה מתאימה לי)', 'No, that’s not too late. (the time works for me)'], 'not-too-late'),
    ]),
    hour(),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tonight'), planner(2), ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.time.eight', options: [['phrase.time.not-too-late', true], ['phrase.time.what-time', false, l3(Y_WHAT_TIME)], ['phrase.time.free-tonight', false]] },
    ] }),
    // YOUR INITIATIVE — the friend asked "today?" and "tonight?"; now YOU ask about tomorrow.
    cards(['מחר', 'Tomorrow'], board(timeStrip('tomorrow'), planner(2), ['החבר שאל אותך על היום ועל הערב. עכשיו תורך לשאול — על מחר. הקש כדי לשמוע.', 'Your friend asked you about today and tonight. Now it’s your turn to ask — about tomorrow. Tap to hear.']), [
      card('time.line.good', L_GOOD, ['מעולה. מאוד טוב שם.', 'Great. It’s very good there.'], 'very-good-there'),
      card('time.pattern.today', P_TODAY, ['מה אתה עושה היום? (שמעת בבוקר)', 'What are you doing today? (you heard it this morning)'], 'morning-question'),
      card('time.pattern.tonight', P_TONIGHT, ['מה אתה עושה הערב? (שמעת עכשיו)', 'What are you doing tonight? (you just heard it)'], 'tonight-question'),
      card('time.line.tomorrow', Y_TOMORROW, ['מה אתה עושה מחר? (אותה שאלה — זמן חדש)', 'What are you doing tomorrow? (the same question — a new time)'], 'ask-tomorrow'),
    ]),
    k.practice({ kind: 'swap', label: board(timeStrip('tomorrow'), planner(2), ['על מתי אתה שואל?', 'Which time are you asking about?']), rounds: [{
      frame: ['What are you doing ___?', 'Tu fais quoi ___ ?', '¿Qué haces ___?'], itemId: 'phrase.time.what-doing-tomorrow',
      cue: { emoji: '🌅', text: ['אתה רוצה לדעת מה החבר עושה מחר', 'You want to know your friend’s plans for tomorrow'] },
      options: [
        [['today', 'aujourd’hui', 'hoy'], 'מה אתה עושה היום?', false],
        [['tonight', 'ce soir', 'esta noche'], 'מה אתה עושה הערב?', false],
        [['tomorrow', 'demain', 'mañana'], 'מה אתה עושה מחר?', true],
      ],
    }] }),
    // TOMORROW MORNING — the first time the beach exists. Then "I'm free" again, with a new time.
    cards(['מחר בבוקר', 'Tomorrow morning'], board(timeStrip('tomorrow'), planner(2), ['מה החבר עושה מחר בבוקר? הקש כדי לשמוע.', 'What is your friend doing tomorrow morning? Tap to hear.']), [
      card('time.line.beach', L_BEACH, ['מחר בבוקר אני הולך לים. אתה פנוי מחר?', 'Tomorrow morning I’m going to the beach. Are you free tomorrow?'], 'beach-plan'),
    ]),
    k.practice({ kind: 'visualMatch', quiet: true, label: board(timeStrip('tomorrow'), planner(2), ['מחר בבוקר — לאן החבר הולך?', 'Tomorrow morning — where is your friend going?']), tiles: PLACE_TILES, rounds: [{ audio: L_BEACH, correct: 'beach', reinforce: L_BEACH }] }),
    // TRANSFER — no new card: "I'm free tonight." with tomorrow in its place.
    k.practice({ kind: 'quickReply', label: board(timeStrip('tomorrow'), planner(3), ['אתה פנוי מחר. מה אתה עונה?', 'You’re free tomorrow. What do you answer?']), rounds: [
      { prompt: 'reply.time.beach', options: [['phrase.time.free-tomorrow', true], ['phrase.time.free-tonight', false], ['phrase.time.what-doing-tomorrow', false]] },
    ] }),
    // EARLY — no hour yet. Then the arrangement is YOURS: here, at seven.
    cards(['הסידור', 'The arrangement'], board(timeStrip('tomorrow'), planner(3), ['הם יוצאים מוקדם — ואתה קובע איפה ומתי נפגשים. הקש כדי לשמוע.', 'They leave early — and you decide where and when to meet. Tap to hear.']), [
      card('time.line.early', L_EARLY, ['אז בוא איתנו! אבל אנחנו יוצאים מוקדם. (עוד אין שעה)', 'Then come with us! But we leave early. (no time yet)'], 'leave-early'),
      card('time.line.meet', Y_MEET, ['אין בעיה. ניפגש כאן בשבע. (איפה: כאן · מתי: שבע)', 'No problem. Let’s meet here at seven. (where: here · when: seven)'], 'meeting-plan'),
    ]),
    k.quiz('reply.time.early', 'reply.time.eight', 'reply.time.tonight-q'),
    k.practice({
      kind: 'sentenceBuilder', label: board(timeStrip('tomorrow'), planner(4), ['קבע את המפגש: איפה ומתי', 'Set the meeting: where and when']),
      rounds: [{ itemId: 'phrase.time.no-problem-meet', chunks: [['No problem.', "Let's meet", 'here', 'at seven.'], ['Pas de problème.', 'On se retrouve', 'ici', 'à sept heures.'], ['No hay problema.', 'Quedamos', 'aquí', 'a las siete.']] }],
    }),
    // THE GOODBYE — leaving NOW, seeing each other TONIGHT.
    cards(['להתראות', 'See you'], board(timeStrip('morning', 'tonight'), planner(5), ['החבר צריך ללכת — ומתי תתראו? הקש כדי לשמוע.', 'Your friend has to go — and when will you see each other? Tap to hear.']), [
      card('time.line.bye', L_BYE, ['מושלם. אני חייב ללכת עכשיו — נתראה הערב!', 'Perfect. I have to go now — see you tonight!'], 'see-you-tonight'),
    ]),
    // THE SUPPORTED CONVERSATION — the whole plan, in order; the Time Strip and the planner fill as it goes.
    k.practice({ kind: 'quickReply', label: board(timeStrip('morning'), planner(0)), rounds: [
      { prompt: 'reply.time.today', options: [['phrase.time.maybe-later', true, l3(Y_TODAY)], ['phrase.time.free-tonight', false], ['phrase.time.not-too-late', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tonight'), planner(0)), rounds: [
      { prompt: 'reply.time.tonight-q', options: [['phrase.time.free-tonight', true], ['phrase.time.what-time', false], ['phrase.time.maybe-later', false, l3(Y_TODAY)]] },
      { prompt: 'reply.time.invite', options: [['phrase.time.what-time', true, l3(Y_WHAT_TIME)], ['phrase.time.free-tomorrow', false], ['phrase.time.not-too-late', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tonight'), planner(1)), rounds: [
      { prompt: 'reply.time.eight', options: [['phrase.time.not-too-late', true], ['phrase.time.what-doing-tomorrow', false], ['phrase.time.maybe-later', false, l3(Y_TODAY)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tomorrow'), planner(2)), rounds: [
      { prompt: 'reply.time.good', options: [['phrase.time.what-doing-tomorrow', true], ['phrase.time.what-time', false, l3(Y_WHAT_TIME)], ['phrase.time.free-tonight', false]] },
      { prompt: 'reply.time.beach', options: [['phrase.time.free-tomorrow', true], ['phrase.time.free-tonight', false], ['phrase.time.not-too-late', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tomorrow'), planner(3)), rounds: [
      { prompt: 'reply.time.early', options: [['phrase.time.lets-meet', true, l3(Y_MEET)], ['phrase.time.not-too-late', false], ['phrase.time.what-time', false, l3(Y_WHAT_TIME)]] },
    ] }),
    k.receipt(board(timeStrip('morning', 'tonight'), planner(5), ['הערב ומחר — שתי תוכניות, מהשיחה עצמה.', 'Tonight and tomorrow — two plans, from the conversation itself.'])),
    k.dialogue('making-plans'),
    k.receipt(['כל השיחה — מהבוקר הפתוח ועד שתי תוכניות.', 'The whole conversation — from an open morning to two plans.']),
    // NO HELP — the friend's real lines, in order, at natural speed: no meaning, no cards, no hints.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: L_TODAY, options: [['phrase.time.maybe-later', true, l3(Y_TODAY)], ['phrase.time.free-tomorrow', false], ['phrase.time.what-time', false]] },
        { npc: L_TONIGHT, options: [['phrase.time.free-tonight', true], ['phrase.time.free-tomorrow', false], ['phrase.time.lets-meet', false, l3(Y_MEET)]] },
        { npc: L_INVITE, options: [['phrase.time.what-time', true, l3(Y_WHAT_TIME)], ['phrase.time.not-too-late', false], ['phrase.time.what-doing-tomorrow', false]] },
        { npc: L_EIGHT, options: [['phrase.time.not-too-late', true], ['phrase.time.maybe-later', false, l3(Y_TODAY)], ['phrase.time.free-tomorrow', false]] },
      ],
    }),
    k.practice({ kind: 'quickReply', challenge: true, label: board(timeStrip('tomorrow'), planner(2)), rounds: [
      { npc: L_GOOD, options: [['phrase.time.what-doing-tomorrow', true], ['phrase.time.not-too-late', false], ['phrase.time.free-tonight', false]] },
      { npc: L_BEACH, options: [['phrase.time.free-tomorrow', true], ['phrase.time.free-tonight', false], ['phrase.time.what-time', false, l3(Y_WHAT_TIME)]] },
    ] }),
    k.practice({ kind: 'quickReply', challenge: true, label: board(timeStrip('tomorrow'), planner(3)), rounds: [
      { npc: L_EARLY, options: [['phrase.time.lets-meet', true, l3(Y_MEET)], ['phrase.time.not-too-late', false], ['phrase.time.free-tonight', false]] },
    ] }),
    k.receipt(['בלי עזרה — כל השיחה, בקצב של חבר.', 'No help — the whole conversation, at a friend’s pace.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: close your plans for tonight and tomorrow — each ability once, in order.
    k.practice({ kind: 'quickReply', label: board(timeStrip('morning'), planner(0), ['סגור את התוכניות שלך להערב ולמחר.', 'Close your plans for tonight and tomorrow.']), rounds: [
      { npc: L_TODAY, options: [['phrase.time.maybe-later', true, l3(Y_TODAY)], ['phrase.time.not-too-late', false], ['phrase.time.what-doing-tomorrow', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tonight'), planner(0)), rounds: [
      { situation: EVENING_FREE, options: [['phrase.time.free-tonight', true], ['phrase.time.free-tomorrow', false], ['phrase.time.what-time', false]] },
      { npc: L_INVITE, options: [['phrase.time.what-time', true, l3(Y_WHAT_TIME)], ['phrase.time.not-too-late', false], ['phrase.time.lets-meet', false, l3(Y_MEET)]] },
    ] }),
    hour(true),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tonight'), planner(2)), rounds: [
      { npc: L_EIGHT, options: [['phrase.time.not-too-late', true], ['phrase.time.free-tonight', false], ['phrase.time.maybe-later', false, l3(Y_TODAY)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tomorrow'), planner(2)), rounds: [
      { npc: L_GOOD, options: [['phrase.time.what-doing-tomorrow', true], ['phrase.time.free-tomorrow', false], ['phrase.time.what-time', false, l3(Y_WHAT_TIME)]] },
      { npc: L_BEACH, options: [['phrase.time.free-tomorrow', true], ['phrase.time.free-tonight', false], ['phrase.time.lets-meet', false, l3(Y_MEET)]] },
    ] }),
    k.practice({ kind: 'quickReply', label: board(timeStrip('tomorrow'), planner(3)), rounds: [
      { npc: L_EARLY, options: [['phrase.time.lets-meet', true, l3(Y_MEET)], ['phrase.time.what-time', false, l3(Y_WHAT_TIME)], ['phrase.time.free-tonight', false]] },
    ] }),
    seeYou(true),
    k.receipt(PLANS_MADE),
    { kind: 'summary' },
  ];
  // The result picture appears only at its earned receipt.
  const result = M12_PROPS['plans-made'];
  return steps.map((step) => (step.kind === 'receipt' && step.text.en === PLANS_MADE[1] && result.image ? { ...step, image: result.image } : step));
}

/** The briefing reveals only the morning meeting. */
export const M12_BRIEFING_IMAGE = M12_SLOTS['morning-meeting'].image;
