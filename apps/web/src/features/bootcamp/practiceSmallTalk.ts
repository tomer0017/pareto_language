import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 11 — Small Talk & Recommendations: "I talked to a local and got a recommendation."
 * Defined ONCE for English, French and Spanish. The conversation is LOCKED (`core/smallTalk.ts`); this
 * is the journey around it. The lesson is conversational RHYTHM, not vocabulary:
 *
 *   CONNECT (react to the place) → SHARE (where from + bounce the question back, first time, I like it)
 *   → ASK (the local praises the food — YOUR initiative: ask for a tip; the tip is Mama Rosa, in the Old
 *   Town) → CLOSE (thank you, it was nice talking to you).
 *
 *   the briefing (only what the traveller knows: Israel, first visit) → each beat as cards, then
 *   answered → the local tip captured (place, area) → the local's goodbye by ear → the supported
 *   conversation (flow on screen: stages only) → the conversation → no help → the video → the final
 *   conversation → 💬 SMALL TALK COMPLETE · 📍 LOCAL TIP FOUND.
 *
 * Rules kept here:
 *   - the learner says only the six locked lines; the local's lines are comprehension (cards, heard);
 *   - prior learning is reactivated, not retaught: "I'm from Israel." and "it's my first time here"
 *     (Mission 01) are ♻️ review cards; the new function — "How about you?" — gets its own card;
 *   - nothing names the local (or Mama Rosa, or the Old Town) before the line that reveals it;
 *   - no grammar, no isolated adjective, no icon quiz, no navigation: the capture is the tip itself.
 *
 * Coverage: `mission11Coverage.ts`, enforced by `mission11.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * Mission 11's image slots — one per meaning, shared across EN / ES / FR. PLACEHOLDERS: no slot has its
 * artwork yet (`image` unset — the emoji stands in); giving a slot an `image` swaps it in. One
 * continuous world for the final art: the same traveller, the same local, the same viewpoint over the
 * same city, the same late-afternoon light (`docs/MISSION11_ASSET_MANIFEST.md`).
 */
type M11Slot =
  | 'scenic-viewpoint' | 'local-opens' | 'traveler-reacts' | 'origin' | 'bounce-back' | 'first-time'
  | 'like-it' | 'food-comment' | 'ask-recommendation' | 'local-recommends' | 'friendly-closing';
export const M11_SLOTS: Record<M11Slot, { emoji: string; image?: string }> = {
  'scenic-viewpoint': { emoji: '🌄' }, 'local-opens': { emoji: '👋' }, 'traveler-reacts': { emoji: '😍' },
  origin: { emoji: '🌍' }, 'bounce-back': { emoji: '🔄' }, 'first-time': { emoji: '🧳' }, 'like-it': { emoji: '😊' },
  'food-comment': { emoji: '🍝' }, 'ask-recommendation': { emoji: '🙋' }, 'local-recommends': { emoji: '🗺️' },
  'friendly-closing': { emoji: '🤝' },
};
/** Result pictures only — never a choice, never a card: the tip once found, and the walk away. */
export const M11_PROPS = {
  'mama-rosa': { emoji: '🍽️' }, 'small-talk-complete': { emoji: '💬' },
} as const satisfies Record<string, { emoji: string; image?: string }>;
const look11 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/* The locked conversation (EN · FR · ES · HE), line by line — the local's lines… */
export const L_OPEN: L4 = ["Hi! Beautiful view, isn't it?", 'Bonjour ! Belle vue, n’est-ce pas ?', '¡Hola! Bonita vista, ¿verdad?', 'היי! נוף יפה, נכון?'];
export const L_WHERE: L4 = ['It really is. Where are you from?', 'C’est vrai. Vous venez d’où ?', 'Es verdad. ¿De dónde es?', 'באמת. מאיפה אתה?'];
export const L_HERE: L4 = ["I'm from here! Is this your first time here?", 'Je suis d’ici ! C’est votre première fois ici ?', '¡Soy de aquí! ¿Es su primera vez aquí?', 'אני מכאן! זו הפעם הראשונה שלך כאן?'];
export const L_LIKE: L4 = ['Welcome! Do you like it here?', 'Bienvenue ! Ça vous plaît ici ?', '¡Bienvenido! ¿Le gusta este lugar?', 'ברוך הבא! אתה אוהב את המקום?'];
export const L_FOOD: L4 = ['Me too. And the food here is wonderful.', 'Moi aussi. Et la cuisine ici est excellente.', 'Yo también. Y la comida de aquí es estupenda.', 'גם אני. והאוכל כאן נהדר.'];
export const L_TIP: L4 = ["Of course — try 'Mama Rosa', in the old town. It's very good.", 'Bien sûr — essayez « Mama Rosa », dans la vieille ville. C’est très bon.', 'Claro — pruebe «Mama Rosa», en el casco antiguo. Es muy bueno.', "בטח — תנסה את 'מאמא רוזה', בעיר העתיקה. מאוד טוב שם."];
export const L_BYE: L4 = ['You too! Enjoy the rest of your trip!', 'Vous aussi ! Profitez bien du reste de votre voyage !', '¡Igualmente! ¡Que disfrute del resto del viaje!', 'גם לי! תיהנה משאר הטיול!'];
/* …and the traveller's, as said (some wrap a shorter sentence: "Yes, it's my first time here."). */
export const Y_BEAUTIFUL: L4 = ['This place is beautiful.', 'Cet endroit est magnifique.', 'Este lugar es precioso.', 'המקום הזה יפהפה.'];
export const Y_ORIGIN: L4 = ["I'm from Israel. How about you?", 'Je viens d’Israël. Et vous ?', 'Soy de Israel. ¿Y usted?', 'אני מישראל. ואתה?'];
export const Y_FIRST: L4 = ["Yes, it's my first time here.", 'Oui, c’est ma première fois ici.', 'Sí, es mi primera vez aquí.', 'כן, זו הפעם הראשונה שלי כאן.'];
export const Y_LIKE: L4 = ['Yes, I like it a lot.', 'Oui, j’aime beaucoup.', 'Sí, me gusta mucho.', 'כן, אני מאוד אוהב.'];
export const Y_RECOMMEND: L4 = ['Can you recommend a place?', 'Vous pouvez recommander un endroit ?', '¿Me puede recomendar un sitio?', 'אתה יכול להמליץ על מקום?'];
export const Y_CLOSE: L4 = ['Thank you! It was nice talking to you.', 'Merci ! C’était sympa de discuter avec vous.', '¡Gracias! Ha sido un placer hablar con usted.', 'תודה! היה נעים לדבר איתך.'];
/* Pieces worth a card of their own (partial prior learning: the known half, the new half). */
const Y_FROM_ISRAEL: L4 = ["I'm from Israel.", 'Je viens d’Israël.', 'Soy de Israel.', 'אני מישראל.'];
const Y_HOW_ABOUT_YOU: L4 = ['How about you?', 'Et vous ?', '¿Y usted?', 'ואתה?'];
const P_PLACE: L4 = ["try 'Mama Rosa'", 'essayez « Mama Rosa »', 'pruebe «Mama Rosa»', 'תנסה את Mama Rosa'];
const P_AREA: L4 = ['in the old town', 'dans la vieille ville', 'en el casco antiguo', 'בעיר העתיקה'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/**
 * THE tip — the SIMULATION'S truth: Mama Rosa, in the Old Town. The traveller does not know it until
 * the local says it; the Local Tip card is "?" until then.
 */
export const M11_TIP = { place: 'mama-rosa', area: 'old-town' } as const;
const PLACES: Record<'mama-rosa' | 'luna-cafe' | 'casa-verde', string> = { 'mama-rosa': 'Mama Rosa', 'luna-cafe': 'Luna Café', 'casa-verde': 'Casa Verde' };
/** The areas, as a local names them: the Old Town, and two equally real parts of a city. */
const AREAS: Record<'old-town' | 'city-centre' | 'beach', L3> = { 'old-town': ['Old Town', 'Vieille ville', 'Casco antiguo'], 'city-centre': ['City Centre', 'Centre-ville', 'Centro'], beach: ['Beach', 'Plage', 'Playa'] };
const AREA_COPY: Copy = ['העיר העתיקה', 'Old Town'];

/** The conversation's stages — the flow shows STAGES, never what is said in them. */
export const M11_STAGES = ['connect', 'share', 'ask', 'close'] as const;
const STAGE11: Record<(typeof M11_STAGES)[number], Copy> = {
  connect: ['💬 חיבור', '💬 Connect'], share: ['🗣️ שיתוף', '🗣️ Share'], ask: ['🙋 בקשה', '🙋 Ask'], close: ['👋 פרידה', '👋 Close'],
};
/** The conversation flow once `done` of its four stages are behind the learner. */
export const conversationFlow = (done: number): Copy => {
  const row = (i: 0 | 1): string => M11_STAGES.map((s, k) => `${STAGE11[s][i]} ${k < done ? '✅' : '⬜'}`).join(' · ');
  return [row(0), row(1)];
};
/** The Local Tip card: "?" until the local has said it — never prefilled. */
export const localTip = (found: boolean): Copy => (found
  ? [`📍 Mama Rosa · ${AREA_COPY[0]}`, `📍 Mama Rosa · ${AREA_COPY[1]}`]
  : ['📍 טיפ מקומי: ?', '📍 Local tip: ?']);
const flowAndTip = (done: number, found: boolean): Copy => [`${conversationFlow(done)[0]} · ${localTip(found)[0]}`, `${conversationFlow(done)[1]} · ${localTip(found)[1]}`];
/** Where the conversation is — plain serialisable data; the tip is null until it has been heard. */
export const smallTalkState = (done: number, tipFound = false) => ({
  conversationStage: M11_STAGES[Math.max(0, Math.min(done, M11_STAGES.length - 1))]!,
  stagesDone: Math.max(0, Math.min(done, M11_STAGES.length)),
  localTipPlace: tipFound ? M11_TIP.place : null,
  localTipArea: tipFound ? M11_TIP.area : null,
});

/** The ending — the outcome is the conversation and the tip, never a score. */
export const SMALL_TALK_COMPLETE: Copy = [
  `💬 שיחת החולין הושלמה · 📍 נמצא טיפ מקומי: Mama Rosa · ${AREA_COPY[0]} — דיברת עם מקומי וקיבלת המלצה.`,
  `💬 SMALL TALK COMPLETE · 📍 LOCAL TIP FOUND: Mama Rosa · ${AREA_COPY[1]} — You talked to a local and got a recommendation.`,
];
const TIP_FOUND: Copy = [`📍 נמצא טיפ מקומי · Mama Rosa · ${AREA_COPY[0]}`, `📍 LOCAL TIP FOUND · Mama Rosa · ${AREA_COPY[1]}`];

/* Situations — the moments with no question to answer: the learner's own move. */
const BOUNCE: Copy = ['ענית מאיפה אתה. עכשיו תחזיר את השאלה — כדי שהשיחה תמשיך.', 'You said where you are from. Now return the question — keep the conversation going.'];
const WANT_TIP: Copy = ['המקומי אומר שהאוכל כאן נהדר. אתה רוצה המלצה מקומית.', 'The local says the food here is wonderful. You want a local recommendation.'];
const LEAVE: Copy = ['קיבלת המלצה, והגיע הזמן להמשיך. סיים את השיחה יפה.', 'You got your recommendation, and it is time to move on. End the conversation naturally.'];

export function m11Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const ix = { en: 0, fr: 1, es: 2 }[lang];
  const card = (key: string, line: L4, meaning: Copy, s: M11Slot, review = false) => ({ line: true, key, t: l3(line), meaning, ...look11(M11_SLOTS[s]), ...(review ? { review: true } : {}) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, widePictures: true, words });
  /* The tip, captured: the place and the area — names, as the local says them (no pictures, no map). */
  const placeTiles: MatchTile[] = Object.entries(PLACES).map(([id, label]) => ({ id, label }));
  const areaTiles: MatchTile[] = Object.entries(AREAS).map(([id, label]) => ({ id, label: label[ix] }));
  const capture = (): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true, label: ['📍 טיפ מקומי: ? — מה הוא המליץ, ואיפה?', '📍 Local tip: ? — what did the local recommend, and where?'],
    tiles: [...placeTiles, ...areaTiles],
    rounds: [
      { audio: L_TIP, correct: M11_TIP.place, show: placeTiles.map((t) => t.id), reinforce: P_PLACE },
      { audio: L_TIP, correct: M11_TIP.area, show: areaTiles.map((t) => t.id), reinforce: P_AREA },
    ],
  });
  /* …and later in one tap: both facts at once, against a wrong place and a wrong area. */
  const tip = (area: keyof typeof AREAS, place: keyof typeof PLACES): MatchTile => ({ id: `${place}@${area}`, label: `${PLACES[place]} · ${AREAS[area][ix]}` });
  const captureBoth = (challenge = false): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true, ...(challenge ? { challenge: true } : {}), label: ['📍 טיפ מקומי: ? — מה ההמלצה?', '📍 Local tip: ? — what is the tip?'],
    tiles: [tip('old-town', 'mama-rosa'), tip('city-centre', 'mama-rosa'), tip('old-town', 'luna-cafe')],
    rounds: [{ audio: L_TIP, correct: `${M11_TIP.place}@${M11_TIP.area}`, reinforce: L_TIP }],
  });
  const steps: BootcampStep[] = [
    // CONNECT — someone next to you comments on the view (who they are is still to come).
    cards(['פותחים שיחה', 'Connect'], ['מישהו לידך מעיר על המקום — ומה אתה עונה. הקש כדי לשמוע.', 'Someone next to you comments on the place — and what you answer. Tap to hear.'], [
      card('talk.line.opening', L_OPEN, ['היי! נוף יפה, נכון? (כלומר: הנוף יפה, נכון?)', 'Hi! The view is beautiful, right?'], 'local-opens'),
      card('talk.line.beautiful', Y_BEAUTIFUL, ['המקום הזה יפהפה.', 'This place is beautiful.'], 'traveler-reacts'),
    ]),
    k.practice({ kind: 'quickReply', label: ['מה אתה עונה?', 'What do you answer?'], rounds: [
      { prompt: 'reply.talk.opening', options: [['phrase.talk.beautiful-place', true], ['phrase.social.from-israel', false], ['phrase.social.first-time', false]] },
    ] }),
    // SHARE — where from: the answer you know, and the NEW move: return the question.
    cards(['מאיפה אתה', 'Where you’re from'], ['ענה — והחזר את השאלה. הקש כדי לשמוע.', 'Answer — and return the question. Tap to hear.'], [
      card('talk.line.where', L_WHERE, ['באמת. מאיפה אתה?', 'It really is. Where are you from?'], 'origin'),
      card('talk.line.from-israel', Y_FROM_ISRAEL, ['אני מישראל. (את זה כבר אמרת במשימה 1)', 'I’m from Israel. (you said this in Mission 1)'], 'origin', true),
      card('talk.line.how-about-you', Y_HOW_ABOUT_YOU, ['ואתה? — מחזירים את השאלה, והשיחה ממשיכה.', 'And you? — return the question, and the conversation goes on.'], 'bounce-back'),
    ]),
    k.practice({ kind: 'quickReply', label: ['ענה ← החזר את השאלה', 'Answer → return the question'], rounds: [
      { prompt: 'reply.talk.really-where', options: [['phrase.talk.how-about-you', true, l3(Y_ORIGIN)], ['phrase.social.from-israel', false], ['phrase.talk.beautiful-place', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: ['מה אתה אומר?', 'What do you say?'], rounds: [
      { situation: BOUNCE, options: [['phrase.talk.how-about-you', true], ['phrase.talk.beautiful-place', false], ['phrase.social.first-time', false]] },
    ] }),
    // NEWS — the person is local. And your first time here (Mission 01 again, in a new conversation).
    cards(['פעם ראשונה', 'First time here'], ['עכשיו אתה מגלה משהו עליו — ומה אתה עונה. הקש כדי לשמוע.', 'Now you find something out — and what you answer. Tap to hear.'], [
      card('talk.line.from-here', L_HERE, ['אני מכאן! זו הפעם הראשונה שלך כאן? (הוא מקומי)', 'I’m from here! Is this your first time here? (a local)'], 'first-time'),
      card('talk.line.first-time', Y_FIRST, ['כן, זו הפעם הראשונה שלי כאן.', 'Yes, it’s my first time here.'], 'first-time', true),
    ]),
    k.practice({ kind: 'quickReply', label: ['מה אתה עונה?', 'What do you answer?'], rounds: [
      { prompt: 'reply.talk.from-here', options: [['phrase.social.first-time', true, l3(Y_FIRST)], ['phrase.talk.how-about-you', false], ['phrase.talk.beautiful-place', false]] },
    ] }),
    // OPINION — a question about what you think, a simple positive answer.
    cards(['אוהב את המקום?', 'Do you like it?'], ['שאלה על הדעה שלך — ותשובה פשוטה וחיובית. הקש כדי לשמוע.', 'A question about your opinion — and a simple, positive answer. Tap to hear.'], [
      card('talk.line.like-q', L_LIKE, ['ברוך הבא! אתה אוהב את המקום?', 'Welcome! Do you like it here?'], 'like-it'),
      card('talk.line.like', Y_LIKE, ['כן, אני מאוד אוהב.', 'Yes, I like it a lot.'], 'like-it'),
    ]),
    k.practice({ kind: 'quickReply', label: ['מה אתה עונה?', 'What do you answer?'], rounds: [
      { prompt: 'reply.talk.welcome-like', options: [['phrase.talk.i-like-it', true, l3(Y_LIKE)], ['phrase.social.first-time', false], ['phrase.talk.how-about-you', false]] },
    ] }),
    // ASK — the local praises the food: nobody asked you anything. Your initiative.
    cards(['טיפ מקומי', 'A local tip'], ['המקומי מספר שהאוכל כאן נהדר. זה הרגע שלך לבקש המלצה. הקש כדי לשמוע.', 'The local says the food here is wonderful. This is your moment to ask for a tip. Tap to hear.'], [
      card('talk.line.food', L_FOOD, ['גם אני. והאוכל כאן נהדר.', 'Me too. And the food here is wonderful.'], 'food-comment'),
      card('talk.line.recommend', Y_RECOMMEND, ['אתה יכול להמליץ על מקום? (היוזמה שלך)', 'Can you recommend a place? (your initiative)'], 'ask-recommendation'),
    ]),
    k.practice({
      kind: 'sentenceBuilder',
      label: ['הבקשה שלך', 'Your request'],
      rounds: [{ itemId: 'phrase.talk.recommend-place', chunks: [['Can you', 'recommend', 'a place?'], ['Vous pouvez', 'recommander', 'un endroit ?'], ['¿Me puede', 'recomendar', 'un sitio?']] }],
    }),
    k.practice({ kind: 'quickReply', label: ['מה אתה אומר?', 'What do you say?'], rounds: [
      { situation: WANT_TIP, options: [['phrase.talk.recommend-place', true], ['phrase.talk.i-like-it', false], ['phrase.talk.how-about-you', false]] },
    ] }),
    // THE TIP — the first time Mama Rosa and the Old Town exist.
    cards(['ההמלצה', 'The recommendation'], ['מה הוא ממליץ — ואיפה. הקש כדי לשמוע.', 'What the local recommends — and where. Tap to hear.'], [
      card('talk.line.tip', L_TIP, ['בטח — תנסה את Mama Rosa, בעיר העתיקה. מאוד טוב שם.', 'Of course — try Mama Rosa, in the old town. It’s very good.'], 'local-recommends'),
    ]),
    capture(),
    k.receipt(TIP_FOUND),
    // CLOSE — one warm unit, and what you hear back.
    cards(['פרידה', 'Closing'], ['ככה נפרדים יפה — ומה עונים לך. הקש כדי לשמוע.', 'This is how you end it warmly — and what you hear back. Tap to hear.'], [
      card('talk.line.close', Y_CLOSE, ['תודה! היה נעים לדבר איתך.', 'Thank you! It was nice talking to you.'], 'friendly-closing'),
      card('talk.line.goodbye', L_BYE, ['גם לי! תיהנה משאר הטיול!', 'You too! Enjoy the rest of your trip!'], 'friendly-closing'),
    ]),
    k.practice({ kind: 'quickReply', label: ['מה אתה אומר?', 'What do you say?'], rounds: [
      { situation: LEAVE, options: [['phrase.talk.nice-talking', true, l3(Y_CLOSE)], ['phrase.talk.recommend-place', false], ['phrase.talk.how-about-you', false]] },
    ] }),
    // BY EAR — the local's goodbye: heard, its meaning picked (the other meanings are the local's own lines).
    k.quiz('reply.talk.goodbye', 'reply.talk.food', 'reply.talk.welcome-like'),
    // THE SUPPORTED CONVERSATION — the whole chat, in order; the flow shows stages, the tip is "?".
    k.practice({ kind: 'quickReply', label: flowAndTip(0, false), rounds: [
      { prompt: 'reply.talk.opening', options: [['phrase.talk.beautiful-place', true], ['phrase.talk.nice-talking', false], ['phrase.talk.recommend-place', false]] },
      { prompt: 'reply.talk.really-where', options: [['phrase.talk.how-about-you', true, l3(Y_ORIGIN)], ['phrase.social.first-time', false], ['phrase.talk.i-like-it', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: flowAndTip(1, false), rounds: [
      { prompt: 'reply.talk.from-here', options: [['phrase.social.first-time', true, l3(Y_FIRST)], ['phrase.talk.recommend-place', false], ['phrase.talk.nice-talking', false]] },
      { prompt: 'reply.talk.welcome-like', options: [['phrase.talk.i-like-it', true, l3(Y_LIKE)], ['phrase.talk.how-about-you', false], ['phrase.talk.beautiful-place', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: flowAndTip(2, false), rounds: [
      { prompt: 'reply.talk.food', options: [['phrase.talk.recommend-place', true], ['phrase.talk.nice-talking', false], ['phrase.talk.i-like-it', false]] },
    ] }),
    captureBoth(),
    k.practice({ kind: 'quickReply', label: flowAndTip(3, true), rounds: [
      { prompt: 'reply.talk.tip', options: [['phrase.talk.nice-talking', true, l3(Y_CLOSE)], ['phrase.talk.recommend-place', false], ['phrase.talk.how-about-you', false]] },
    ] }),
    k.receipt(flowAndTip(4, true)),
    k.dialogue('small-talk'),
    k.receipt(['כל השיחה — מהנוף ועד הפרידה.', 'The whole conversation — from the view to the goodbye.']),
    // NO HELP — the local's real lines, in order, at natural speed: no flow, no tip card, no translation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: L_OPEN, options: [['phrase.talk.beautiful-place', true], ['phrase.social.from-israel', false], ['phrase.talk.nice-talking', false]] },
        { npc: L_WHERE, options: [['phrase.talk.how-about-you', true, l3(Y_ORIGIN)], ['phrase.talk.recommend-place', false], ['phrase.talk.i-like-it', false]] },
        { npc: L_HERE, options: [['phrase.social.first-time', true, l3(Y_FIRST)], ['phrase.talk.beautiful-place', false], ['phrase.talk.nice-talking', false]] },
        { npc: L_LIKE, options: [['phrase.talk.i-like-it', true, l3(Y_LIKE)], ['phrase.social.from-israel', false], ['phrase.talk.recommend-place', false]] },
        { npc: L_FOOD, options: [['phrase.talk.recommend-place', true], ['phrase.social.first-time', false], ['phrase.talk.beautiful-place', false]] },
      ],
    }),
    captureBoth(true),
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { npc: L_TIP, options: [['phrase.talk.nice-talking', true, l3(Y_CLOSE)], ['phrase.talk.how-about-you', false], ['phrase.talk.i-like-it', false]] },
    ] }),
    k.receipt(['בלי עזרה — כל השיחה, בקצב של מקומי.', 'No help — the whole conversation, at a local’s pace.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL CONVERSATION: compact — react, share and bounce, first time, like, ask, the tip, close.
    k.practice({ kind: 'quickReply', label: flowAndTip(0, false), rounds: [
      { npc: L_OPEN, options: [['phrase.talk.beautiful-place', true], ['phrase.talk.recommend-place', false], ['phrase.social.from-israel', false]] },
      { npc: L_WHERE, options: [['phrase.talk.how-about-you', true, l3(Y_ORIGIN)], ['phrase.talk.nice-talking', false], ['phrase.social.first-time', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: flowAndTip(1, false), rounds: [
      { npc: L_HERE, options: [['phrase.social.first-time', true, l3(Y_FIRST)], ['phrase.talk.i-like-it', false], ['phrase.talk.how-about-you', false]] },
      { npc: L_LIKE, options: [['phrase.talk.i-like-it', true, l3(Y_LIKE)], ['phrase.talk.nice-talking', false], ['phrase.talk.beautiful-place', false]] },
    ] }),
    k.practice({ kind: 'quickReply', label: flowAndTip(2, false), rounds: [
      { npc: L_FOOD, options: [['phrase.talk.recommend-place', true], ['phrase.talk.how-about-you', false], ['phrase.talk.nice-talking', false]] },
    ] }),
    captureBoth(true),
    k.practice({ kind: 'quickReply', label: flowAndTip(3, true), rounds: [
      { npc: L_TIP, options: [['phrase.talk.nice-talking', true, l3(Y_CLOSE)], ['phrase.talk.i-like-it', false], ['phrase.talk.recommend-place', false]] },
    ] }),
    k.receipt(SMALL_TALK_COMPLETE),
    { kind: 'summary' },
  ];
  // Result pictures, once their artwork exists (placeholders draw nothing on a receipt).
  const pic = (x: { emoji: string; image?: string }): { image?: string } => (x.image ? { image: x.image } : {});
  return steps.map((step) => {
    if (step.kind === 'receipt' && step.text.en === TIP_FOUND[1]) return { ...step, ...pic(M11_PROPS['mama-rosa']) };
    if (step.kind === 'receipt' && step.text.en === SMALL_TALK_COMPLETE[1]) return { ...step, ...pic(M11_PROPS['small-talk-complete']) };
    return step;
  });
}

/** The briefing picture, once its artwork exists. */
export const M11_BRIEFING_IMAGE: string | undefined = (M11_SLOTS['scenic-viewpoint'] as { image?: string }).image;
