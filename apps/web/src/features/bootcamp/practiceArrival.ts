import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep } from './types.js';

/**
 * Practice depth — the Arrival phase: Missions 06 (Airport & Border), 07 (Taxi), 08 (Hotel
 * Check-in) and 09 (Shopping). Defined ONCE for English, French and Spanish.
 *
 * Each mission file keeps what is genuinely its own — sentences, the locked dialogue, its intro
 * card, its word intro, its video — and takes everything from the key sentences onward from here,
 * so a practice step can never exist in one language only.
 *
 * The aim is capability, not coverage: after the listening drill the learner ANSWERS (Quick Reply),
 * changes a detail (Swap It), reads real information off a board, and ends on a final challenge
 * that is honestly one of two things — known language at natural speed, or a line that is meant to
 * be too much, where the win is a conversation-help tool.
 *
 * Rules kept here:
 *   - no new sentence ids: every answer is a sentence the mission already had;
 *   - a speed challenge uses ONLY lines the learner has met (they are the dialogue's own lines);
 *   - no app-language text before the learner answers, except a situation card (which IS the cue);
 *   - service register throughout (vous / usted).
 *
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

const OKAY_THANKS: L3 = ['Okay, thank you.', 'D’accord, merci.', 'De acuerdo, gracias.'];

/* ── Mission 06 — Airport & Border ───────────────────────────────────────────────────────────── */

/**
 * Mission 06's image slots — one per meaning (the same meaning is the same picture everywhere it is
 * used). Until the final artwork is approved a slot shows its placeholder emoji; giving a slot an
 * `image` (public path) swaps it in. One continuous world: the same traveller, the same officer, the
 * same passport booth.
 *   Group 1 — the trip and its concepts · Group 2 — the officer's questions · Group 3 — the end of the check.
 *   (Beyond the brief's list: `week`, the calendar's unit — the calendar game is made of weeks, and the
 *   Arrival checkpoint later asks "One week? Two weeks?" — and `hotel` / `city-centre`, the two
 *   building blocks of "a hotel in the city centre".)
 */
type M06Slot =
  | 'passport' | 'holiday' | 'week' | 'two-weeks' | 'hotel' | 'city-centre' | 'hotel-city-centre' | 'nothing-to-declare'
  | 'passport-question' | 'purpose-question' | 'duration-question' | 'where-staying-question'
  | 'anything-to-declare' | 'almost-done' | 'welcome-enjoy-stay';
export const M06_SLOTS: Record<M06Slot, { emoji: string; image?: string }> = {
  passport: { emoji: '🛂' }, holiday: { emoji: '🏖️' }, week: { emoji: '🗓️' }, 'two-weeks': { emoji: '📅' },
  hotel: { emoji: '🛏️' }, 'city-centre': { emoji: '🏙️' }, 'hotel-city-centre': { emoji: '🏨' }, 'nothing-to-declare': { emoji: '🟢' },
  'passport-question': { emoji: '👮' }, 'purpose-question': { emoji: '❓' }, 'duration-question': { emoji: '⏳' }, 'where-staying-question': { emoji: '🗺️' },
  'anything-to-declare': { emoji: '🛃' }, 'almost-done': { emoji: '☑️' }, 'welcome-enjoy-stay': { emoji: '🎉' },
};
/**
 * The other things on the desk — what the learner could pick instead. Picture-only: they are never
 * named in the learning language. They sit in the same games as the slots above, so they must get
 * their artwork together with them (a test refuses a game that mixes a picture with an emoji — the
 * answer would show by its quality alone).
 */
export const M06_PROPS = {
  phone: { emoji: '📱' }, suitcase: { emoji: '🧳' }, work: { emoji: '💼' }, study: { emoji: '🎓' },
  'red-channel': { emoji: '🔴' }, house: { emoji: '🏠' }, airport: { emoji: '✈️' }, 'hotel-outskirts': { emoji: '🏨' },
} as const satisfies Record<string, { emoji: string; image?: string }>;
const slot6 = (s: M06Slot): { emoji: string } | { image: string } => (M06_SLOTS[s].image ? { image: M06_SLOTS[s].image! } : { emoji: M06_SLOTS[s].emoji });
const tile6 = (id: string, look: { emoji: string; image?: string }, caption?: Copy) => ({
  id, ...(look.image ? { image: look.image } : { emoji: look.emoji }), ...(caption ? { caption: { he: caption[0], en: caption[1] } } : {}), scale: 1.4,
});

/**
 * THE traveller. One trip, the same in every exercise: the officer does not know it — the learner
 * does, and answers from it (an information gap, not a quiz).
 */
export const M06_PROFILE = { purpose: 'holiday', duration: 'two-weeks', stay: 'hotel-city-centre', declaration: 'nothing' } as const;
/** The five things the border check clears, in the order the officer asks them. */
export const M06_CHECKS = ['passport', 'purpose', 'duration', 'stay', 'declaration'] as const;
const CHECK_NAME: Record<(typeof M06_CHECKS)[number], Copy> = {
  passport: ['דרכון', 'Passport'], purpose: ['מטרה', 'Purpose'], duration: ['משך', 'Duration'], stay: ['מקום לינה', 'Stay'], declaration: ['מכס', 'Declaration'],
};
/** The border checklist after `done` of the five steps — the learner's progress through the real process. */
export const borderChecklist = (done: number): Copy => {
  const row = (i: 0 | 1): string => M06_CHECKS.map((c, k) => `${k < done ? '✅' : '⬜'} ${CHECK_NAME[c][i]}`).join(' · ');
  return [row(0), row(1)];
};

/* The locked conversation (EN · FR · ES · HE), line by line. */
const L_NEXT: L4 = ['Next, please. Passport?', 'Au suivant, s’il vous plaît. Passeport ?', 'El siguiente, por favor. ¿Pasaporte?', 'הבא בתור, בבקשה. דרכון?'];
const L_PASSPORT: L4 = ['Here is my passport.', 'Voici mon passeport.', 'Aquí tiene mi pasaporte.', 'הנה הדרכון שלי.'];
const L_PURPOSE: L4 = ["Thank you. What's the purpose of your visit?", 'Merci. Quel est le motif de votre visite ?', 'Gracias. ¿Cuál es el motivo de su viaje?', 'תודה. מה מטרת הביקור?'];
const L_HOLIDAY: L4 = ["I'm here on holiday.", 'Je suis en vacances.', 'Estoy de vacaciones.', 'אני כאן בחופשה.'];
const L_HOW_LONG: L4 = ['All right. How long are you staying?', 'Très bien. Vous restez combien de temps ?', 'Muy bien. ¿Cuánto tiempo se queda?', 'בסדר. לכמה זמן אתה נשאר?'];
const L_TWO_WEEKS: L4 = ['For two weeks.', 'Pour deux semaines.', 'Dos semanas.', 'לשבועיים.'];
const L_WHERE: L4 = ['And where are you staying?', 'Et où logez-vous ?', '¿Y dónde se aloja?', 'ואיפה אתה מתאכסן?'];
const L_HOTEL: L4 = ['At a hotel in the city centre.', 'Dans un hôtel dans le centre-ville.', 'En un hotel en el centro.', 'במלון במרכז העיר.'];
const L_DECLARE: L4 = ['Almost done. Anything to declare?', 'C’est presque fini. Quelque chose à déclarer ?', 'Ya casi está. ¿Algo que declarar?', 'כמעט סיימנו. יש לך מה להצהיר?'];
const L_NOTHING: L4 = ['Nothing to declare.', 'Rien à déclarer.', 'Nada que declarar.', 'אין לי מה להצהיר.'];
const L_WELCOME: L4 = ['Welcome, and enjoy your stay!', 'Bienvenue, et bon séjour !', 'Bienvenido, ¡y que disfrute su estancia!', 'ברוך הבא, ותיהנה מהשהות!'];
/* …and the short piece worth a card of its own. */
const C_ALMOST: L4 = ['Almost done.', 'C’est presque fini.', 'Ya casi está.', 'כמעט סיימנו.'];

/* The desk: what the officer may ask for, and the three games' tiles. */
const DESK = [tile6('passport', M06_SLOTS.passport), tile6('phone', M06_PROPS.phone), tile6('suitcase', M06_PROPS.suitcase)];
const PURPOSES = [
  tile6('holiday', M06_SLOTS.holiday, ['חופשה', 'Holiday']), tile6('work', M06_PROPS.work, ['עבודה', 'Work']), tile6('study', M06_PROPS.study, ['לימודים', 'Study']),
];
const CHANNELS = [
  tile6('nothing', M06_SLOTS['nothing-to-declare'], ['אין מה להצהיר', 'Nothing to declare']), tile6('declare', M06_PROPS['red-channel'], ['יש מה להצהיר', 'Goods to declare']),
];
/** A month on the calendar: the stay is the first two weeks of it. */
const CALENDAR = {
  base: '📅',
  options: [1, 2, 3, 4].map((n) => ({ id: `week-${n}`, emoji: M06_SLOTS.week.emoji, label: [`שבוע ${n}`, `Week ${n}`] as Copy })),
};
const TWO_WEEKS_ON = ['week-1', 'week-2'];
/** The city: your hotel is the one in the centre; another hotel out of town, a house, the airport. */
const CITY = (): { id: string; row: 0 | 1 | 2; col: 0 | 1 | 2; emoji: string; tappable?: boolean }[] => [
  { id: 'hotel-centre', row: 1, col: 1, emoji: M06_SLOTS['hotel-city-centre'].emoji, tappable: true },
  { id: 'hotel-outskirts', row: 0, col: 2, emoji: M06_PROPS['hotel-outskirts'].emoji, tappable: true },
  { id: 'house', row: 2, col: 0, emoji: M06_PROPS.house.emoji, tappable: true },
  { id: 'airport', row: 2, col: 2, emoji: M06_PROPS.airport.emoji, tappable: true },
  // the centre itself: buildings around the square (not tappable, never named)
  { id: 'centre-west', row: 1, col: 0, emoji: '🏛️' }, { id: 'centre-north', row: 0, col: 1, emoji: '🏬' }, { id: 'centre-east', row: 1, col: 2, emoji: '🏢' },
  { id: 'outskirts', row: 0, col: 0, emoji: '🌳' },
];
/** Which tile / cell is the traveller's own answer, from the profile (never chosen per exercise). */
export const M06_ANSWER = { desk: 'passport', purpose: M06_PROFILE.purpose, stay: 'hotel-centre', declaration: M06_PROFILE.declaration, calendar: TWO_WEEKS_ON } as const;

/**
 * Mission 06 — Airport & Border: "I am actually going through border control." The conversation is
 * LOCKED (with its side-branches); the journey around it is the check itself, one requirement at a
 * time, each cleared on the border checklist:
 *
 *   your trip (the profile) → Step 0 (optional) → PASSPORT: hand it over, say it → PURPOSE: the
 *   question, your answer → DURATION: two weeks on the calendar → STAY: your hotel in the centre →
 *   DECLARATION: the green channel → "welcome" (known from Mission 01) → each question to its answer
 *   → the officer's questions by ear → the supported interview → the conversation → the interview
 *   with no help → the video → the final check, one requirement after another → ENTRY APPROVED.
 *
 * TEACH before TEST: every line is first shown with its meaning on a card; the officer's questions
 * are understood, never asked for as something to say. Wrong answers are the traveller's own taught
 * lines, or pictures that are never named. The trip never changes. Coverage: `mission06Coverage.ts`,
 * enforced by `mission06.test.ts` (strict audit against `learnedBefore(lang, 6)`).
 */
export function m06Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4 | L3, meaning: Copy, s: M06Slot) => ({ line: true, key, t: [line[0], line[1], line[2]] as L3, meaning, ...slot6(s) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, widePictures: true, words });
  const step = (n: number, name: Copy): Copy => [`ביקורת גבולות ${n}/5 — ${name[0]}`, `Border check ${n}/5 — ${name[1]}`];
  return [
    k.talk('🛂', ['משימה 6: שדה תעופה וגבול', 'Mission 6: Airport & Border'], [
      ['נחתת. לפניך ביקורת הגבולות, והפקיד ישאל אותך כמה שאלות.', 'You have landed. Border control is ahead, and the officer will ask you a few questions.'],
      ['הוא לא יודע עליך כלום. אתה יודע — ותענה לו. בסוף: כניסה מאושרת.', 'He knows nothing about you. You do — and you will answer him. At the end: entry approved.'],
    ], ['לגשת לדלפק', 'Approach the desk']),
    // STEP 0 — THE TRAVELLER: the facts of the trip, the same from here to the end.
    k.talk('🧳', ['הטיול שלך', 'Your trip'], [
      ['🏖️ חופשה', '🏖️ Holiday'],
      ['📅 שבועיים', '📅 Two weeks'],
      ['🏨 מלון · 📍 במרכז העיר', '🏨 Hotel · 📍 In the city centre'],
      ['🟢 אין מה להצהיר', '🟢 Nothing to declare'],
    ], ['זה הטיול שלי', 'That’s my trip']),
    // The pieces (optional).
    k.prime({
      gate: true,
      widePictures: true,
      intro: ['המילים של הטיול שלך. הקש כדי לשמוע.', 'The words of your trip. Tap to hear.'],
      words: [
        { key: 'border.holiday', t: ['holiday', 'vacances', 'vacaciones'], meaning: ['חופשה', 'holiday'], ...slot6('holiday') },
        // the calendar's unit (each row of it is a week) — and "two weeks", whose "two" is Mission 02's
        { key: 'border.week', t: ['week', 'semaine', 'semana'], meaning: ['שבוע', 'week'], ...slot6('week') },
        { key: 'border.two-weeks', review: true, t: ['two weeks', 'deux semaines', 'dos semanas'], meaning: ['שבועיים', 'two weeks'], ...slot6('two-weeks') },
        { key: 'border.hotel', t: ['hotel', 'hôtel', 'hotel'], meaning: ['מלון', 'hotel'], ...slot6('hotel') },
        { key: 'border.city-centre', t: ['city centre', 'centre-ville', 'centro'], meaning: ['מרכז העיר', 'city centre'], ...slot6('city-centre') },
      ],
      build: 'phrase.border.staying-hotel',
    }),
    // 1/5 PASSPORT — the officer calls you; you hand it over and say it.
    cards(step(1, CHECK_NAME.passport), ['הפקיד קורא לך — ומה אתה אומר כשאתה מגיש. הקש כדי לשמוע.', 'The officer calls you — and what you say as you hand it over. Tap to hear.'], [
      card('border.line.next', L_NEXT, ['הבא בתור, בבקשה. דרכון?', 'Next, please. Passport?'], 'passport-question'),
      card('border.line.passport', L_PASSPORT, ['הנה הדרכון שלי.', 'Here is my passport.'], 'passport'),
    ]),
    k.practice({
      kind: 'visualMatch',
      label: ['מה הוא מבקש? הגש לו', 'What is he asking for? Hand it over'],
      tiles: DESK,
      rounds: [{ audio: L_NEXT, correct: M06_ANSWER.desk }],
    }),
    k.practice({
      kind: 'sentenceBuilder',
      label: ['מגישים — ואומרים', 'Hand it over — and say it'],
      rounds: [{ itemId: 'phrase.border.passport-here', chunks: [['Here is', 'my', 'passport.'], ['Voici', 'mon', 'passeport.'], ['Aquí tiene', 'mi', 'pasaporte.']] }],
    }),
    k.receipt(borderChecklist(1)),
    // 2/5 PURPOSE — why you are here.
    cards(step(2, CHECK_NAME.purpose), ['השאלה — למה באת — והתשובה שלך. הקש כדי לשמוע.', 'The question — why you came — and your answer. Tap to hear.'], [
      card('border.line.purpose', L_PURPOSE, ['תודה. מה מטרת הביקור? (למה באת?)', 'Thank you. What’s the purpose of your visit? (why are you here?)'], 'purpose-question'),
      card('border.line.holiday', L_HOLIDAY, ['אני כאן בחופשה.', 'I’m here on holiday.'], 'holiday'),
    ]),
    k.practice({
      kind: 'visualMatch',
      label: ['למה באת? הקש על הטיול שלך', 'Why are you here? Tap your trip'],
      tiles: PURPOSES,
      rounds: [{ audio: L_PURPOSE, correct: M06_ANSWER.purpose }, { audio: L_HOLIDAY, correct: M06_ANSWER.purpose, itemId: 'phrase.border.on-holiday' }],
    }),
    k.practice({
      kind: 'sentenceBuilder',
      label: ['התשובה שלך', 'Your answer'],
      rounds: [{ itemId: 'phrase.border.on-holiday', chunks: [["I'm", 'here', 'on holiday.'], ['Je suis', 'en', 'vacances.'], ['Estoy', 'de', 'vacaciones.']] }],
    }),
    k.receipt(borderChecklist(2)),
    // 3/5 DURATION — two weeks, on the calendar.
    cards(step(3, CHECK_NAME.duration), ['כמה זמן אתה נשאר — והתשובה שלך. הקש כדי לשמוע.', 'How long you are staying — and your answer. Tap to hear.'], [
      card('border.line.how-long', L_HOW_LONG, ['בסדר. לכמה זמן אתה נשאר?', 'All right. How long are you staying?'], 'duration-question'),
      card('border.line.two-weeks', L_TWO_WEEKS, ['לשבועיים.', 'For two weeks.'], 'two-weeks'),
    ]),
    k.practice({
      kind: 'customize',
      label: ['סמן בלוח השנה את השהות שלך', 'Mark your stay on the calendar'],
      ...CALENDAR,
      rounds: [{ audio: L_TWO_WEEKS, on: M06_ANSWER.calendar, itemId: 'phrase.border.two-weeks' }, { audio: L_HOW_LONG, on: M06_ANSWER.calendar }],
    }),
    k.receipt(borderChecklist(3)),
    // 4/5 STAY — your hotel, in the centre.
    cards(step(4, CHECK_NAME.stay), ['איפה אתה מתאכסן — והתשובה שלך. הקש כדי לשמוע.', 'Where you are staying — and your answer. Tap to hear.'], [
      card('border.line.where', L_WHERE, ['ואיפה אתה מתאכסן?', 'And where are you staying?'], 'where-staying-question'),
      card('border.line.hotel', L_HOTEL, ['במלון במרכז העיר.', 'At a hotel in the city centre.'], 'hotel-city-centre'),
    ]),
    k.practice({
      kind: 'miniMap',
      label: ['איפה אתה ישן? הקש על המקום', 'Where are you sleeping? Tap the place'],
      rounds: [
        { audio: L_HOTEL, cells: CITY(), correct: M06_ANSWER.stay, itemId: 'phrase.border.staying-hotel' },
        { audio: L_WHERE, cells: CITY(), correct: M06_ANSWER.stay },
      ],
    }),
    k.practice({
      kind: 'sentenceBuilder',
      label: ['התשובה שלך', 'Your answer'],
      rounds: [{ itemId: 'phrase.border.staying-hotel', chunks: [['At a hotel', 'in the', 'city centre.'], ['Dans un hôtel', 'dans le', 'centre-ville.'], ['En un hotel', 'en el', 'centro.']] }],
    }),
    k.receipt(borderChecklist(4)),
    // 5/5 DECLARATION — almost done; the green channel.
    cards(step(5, CHECK_NAME.declaration), ['כמעט סיימנו — השאלה האחרונה, והתשובה שלך. הקש כדי לשמוע.', 'Almost done — the last question, and your answer. Tap to hear.'], [
      card('border.line.declare', L_DECLARE, ['כמעט סיימנו. יש לך מה להצהיר? (משהו שצריך לדווח עליו במכס)', 'Almost done. Anything to declare? (anything you must report at customs)'], 'anything-to-declare'),
      card('border.line.almost', C_ALMOST, ['כמעט סיימנו.', 'Almost done.'], 'almost-done'),
      card('border.line.nothing', L_NOTHING, ['אין לי מה להצהיר.', 'Nothing to declare.'], 'nothing-to-declare'),
    ]),
    k.practice({
      kind: 'visualMatch',
      label: ['המזוודה שלך — לאיזה מסלול?', 'Your suitcase — which way through?'],
      tiles: CHANNELS,
      rounds: [{ audio: L_DECLARE, correct: M06_ANSWER.declaration }, { audio: L_NOTHING, correct: M06_ANSWER.declaration, itemId: 'phrase.border.nothing-declare' }],
    }),
    k.receipt(borderChecklist(5)),
    // WELCOME — known from Mission 01; here it is the end of the check.
    cards(['ובסוף', 'And at the end'], ['את זה אתה כבר מכיר ממשימה 1. כאן זה אומר: עברת. הקש כדי לשמוע.', 'You already know this from Mission 1. Here it means: you are through. Tap to hear.'], [
      card('border.line.welcome', L_WELCOME, ['ברוך הבא, ותיהנה מהשהות!', 'Welcome, and enjoy your stay!'], 'welcome-enjoy-stay'),
    ]),
    // EACH QUESTION, TO YOUR TRIP — what does he want to know? (icons only: the trip detail, not a translation)
    k.practice({
      kind: 'matchPairs',
      label: ['כל שאלה — ומה היא שואלת', 'Each question — and what it asks for'],
      pairs: [
        ['reply.border.purpose', 'phrase.border.on-holiday', undefined, '🏖️'],
        ['reply.border.how-long', 'phrase.border.two-weeks', undefined, '📅 2'],
        ['reply.border.where-staying', 'phrase.border.staying-hotel', undefined, '🏨 📍'],
        ['reply.border.anything-declare', 'phrase.border.nothing-declare', undefined, '🟢'],
      ],
    }),
    // THE OFFICER, BY EAR — his questions and his last line (the answer reveals the meaning).
    k.replies('phrase.border.passport-here', ['reply.border.purpose', 'reply.border.how-long', 'reply.border.where-staying', 'reply.border.anything-declare', 'reply.border.enjoy']),
    // THE SUPPORTED INTERVIEW — the officer asks everything, in order; your trip stays on screen.
    k.practice({
      kind: 'quickReply',
      label: ['הראיון בגבול — 🏖️ חופשה · 📅 שבועיים · 🏨 מרכז העיר · 🟢 כלום', 'The border interview — 🏖️ holiday · 📅 two weeks · 🏨 city centre · 🟢 nothing'],
      rounds: [
        { npc: L_NEXT, options: [['phrase.border.passport-here', true], ['phrase.border.nothing-declare', false], ['phrase.border.two-weeks', false]] },
        { prompt: 'reply.border.purpose', options: [['phrase.border.on-holiday', true], ['phrase.border.two-weeks', false], ['phrase.border.staying-hotel', false]] },
        { prompt: 'reply.border.how-long', options: [['phrase.border.two-weeks', true], ['phrase.border.on-holiday', false], ['phrase.border.nothing-declare', false]] },
        { prompt: 'reply.border.where-staying', options: [['phrase.border.staying-hotel', true], ['phrase.border.two-weeks', false], ['phrase.border.passport-here', false]] },
        { prompt: 'reply.border.anything-declare', options: [['phrase.border.nothing-declare', true], ['phrase.border.on-holiday', false], ['phrase.border.staying-hotel', false]] },
      ],
    }),
    k.receipt([`${borderChecklist(5)[0]} — ענית על כל השאלות.`, `${borderChecklist(5)[1]} — you answered every question.`]),
    k.dialogue('border-control'),
    k.receipt(['כל השיחה — מ"הבא בתור" ועד "ברוך הבא".', 'The whole conversation — from “next, please” to “welcome”.']),
    // NO HELP — the officer's real lines, at his pace; no trip card, no translation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: L_NEXT, options: [['phrase.border.passport-here', true], ['phrase.border.on-holiday', false], ['phrase.border.staying-hotel', false]] },
        { npc: L_PURPOSE, options: [['phrase.border.on-holiday', true], ['phrase.border.passport-here', false], ['phrase.border.nothing-declare', false]] },
        { npc: L_HOW_LONG, options: [['phrase.border.two-weeks', true], ['phrase.border.staying-hotel', false], ['phrase.border.on-holiday', false]] },
        { npc: L_WHERE, options: [['phrase.border.staying-hotel', true], ['phrase.border.nothing-declare', false], ['phrase.border.two-weeks', false]] },
        { npc: L_DECLARE, options: [['phrase.border.nothing-declare', true], ['phrase.border.passport-here', false], ['phrase.border.two-weeks', false]] },
      ],
    }),
    k.receipt(['בלי עזרה — כל שאלה בקצב שלו, וענית על כולן.', 'No help — every question at his pace, and you answered them all.']),
    // THE PAYOFF — the whole scene again (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL CHECK: the officer's real lines, one requirement after another.
    k.practice({ kind: 'visualMatch', challenge: true, label: step(1, CHECK_NAME.passport), tiles: DESK, rounds: [{ audio: L_NEXT, correct: M06_ANSWER.desk }] }),
    k.practice({ kind: 'visualMatch', challenge: true, label: step(2, CHECK_NAME.purpose), tiles: PURPOSES, rounds: [{ audio: L_PURPOSE, correct: M06_ANSWER.purpose }] }),
    k.practice({ kind: 'customize', label: step(3, CHECK_NAME.duration), ...CALENDAR, rounds: [{ audio: L_HOW_LONG, on: M06_ANSWER.calendar }] }),
    k.practice({ kind: 'miniMap', challenge: true, label: step(4, CHECK_NAME.stay), rounds: [{ audio: L_WHERE, cells: CITY(), correct: M06_ANSWER.stay }] }),
    k.practice({ kind: 'visualMatch', challenge: true, label: step(5, CHECK_NAME.declaration), tiles: CHANNELS, rounds: [{ audio: L_DECLARE, correct: M06_ANSWER.declaration }] }),
    // ENTRY APPROVED — the stamp, and his last line.
    k.practice({
      kind: 'visualMatch',
      label: ['🛂 כניסה מאושרת', '🛂 Entry approved'],
      // one tile shown: nothing to choose — the stamp, and his line (the passport is the step's other tile)
      tiles: [tile6('entry', M06_SLOTS['welcome-enjoy-stay'], ['כניסה מאושרת', 'Entry approved']), tile6('passport', M06_SLOTS.passport)],
      rounds: [{ audio: L_WELCOME, correct: 'entry', show: ['entry'], itemId: 'reply.border.enjoy' }],
    }),
    k.receipt([`🛂 כניסה מאושרת · ${borderChecklist(5)[0]} · ברוך הבא!`, `🛂 ENTRY APPROVED · ${borderChecklist(5)[1]} · Welcome!`]),
    { kind: 'summary' },
  ];
}

/* ── Mission 07 — Taxi / Uber ────────────────────────────────────────────────────────────────── */

/** A driver's fare, by ear. Only numbers Mission 02 taught; 15 and 50 sound alike on purpose. */
const FARE_TILES = [
  { id: 'e5', label: '€5' }, { id: 'e8', label: '€8' }, { id: 'e10', label: '€10' },
  { id: 'e15', label: '€15' }, { id: 'e20', label: '€20' }, { id: 'e50', label: '€50' },
];
const FAST_FARE: L4 = ["It's about fifteen euros. There's a lot of traffic right now.", 'C’est environ quinze euros. Il y a beaucoup de circulation en ce moment.', 'Son unos quince euros. Hay mucho tráfico ahora mismo.', 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.'];

export function m07Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.taxi.to-address', ['הפתיח', 'The opener']],
      ['phrase.taxi.how-much', ['לשאול מחיר', 'Ask the price']],
      ['phrase.taxi.stop-here', ['לעצור', 'Stop it']],
      ['phrase.taxi.keep-change', ['לסיים יפה', 'Finish smoothly']],
    ]),
    k.replies('phrase.taxi.to-address', ['reply.taxi.where-to', 'reply.taxi.about-fifteen', 'reply.taxi.here-good', 'reply.taxi.first-visit']),
    k.receipt(['אתה מזהה מה נהג מונית שואל — לאן, כמה, כאן בסדר?', 'You recognize what a taxi driver asks — where to, how much, is here okay?']),
    // The price, by ear: hear the fare → tap it. No translation.
    k.practice({
      kind: 'visualMatch',
      label: ['הנהג אומר מחיר — הקש עליו', 'The driver says a fare — tap it'],
      tiles: FARE_TILES,
      rounds: [
        { audio: ["It's about fifteen euros.", 'C’est environ quinze euros.', 'Son unos quince euros.', 'זה בערך חמישה עשר יורו.'], correct: 'e15', itemId: 'reply.taxi.about-fifteen' },
        { audio: ['About twenty euros.', 'Environ vingt euros.', 'Unos veinte euros.', 'בערך עשרים יורו.'], correct: 'e20' },
        { audio: ["It's about ten euros.", 'C’est environ dix euros.', 'Son unos diez euros.', 'זה בערך עשרה יורו.'], correct: 'e10' },
      ],
    }),
    // Taxi Rush: the whole ride as five moments. The fast fare line is where asking the driver to
    // slow down is the smart move — and it is accepted as one.
    k.practice({
      kind: 'quickReply',
      label: ['בתוך המונית — מה אומרים?', 'In the taxi — what do you say?'],
      rounds: [
        { prompt: 'reply.taxi.where-to', options: [['phrase.taxi.to-address', true], ['phrase.taxi.stop-here', false], ['phrase.taxi.keep-change', false]] },
        { situation: ['לפני שיוצאים: אתה רוצה לדעת כמה זה יעלה.', 'Before you set off: you want to know what it will cost.'],
          options: [['phrase.taxi.how-much', true], ['phrase.taxi.keep-change', false], ['phrase.taxi.stop-here', false]] },
        { npc: FAST_FARE, options: [['phrase.recovery.slowly', true], ['phrase.recovery.thank-you', true, OKAY_THANKS], ['phrase.taxi.to-airport', false]] },
        { prompt: 'reply.taxi.here-good', options: [['phrase.taxi.stop-here', true], ['phrase.taxi.to-address', false], ['phrase.taxi.how-much', false]] },
        { situation: ['משלמים. אתה לא צריך את העודף.', 'You are paying, and you do not need the change back.'],
          options: [['phrase.taxi.keep-change', true], ['phrase.taxi.how-much', false], ['phrase.taxi.to-address', false]] },
      ],
    }),
    k.dialogue('taxi-ride'),
    k.receipt(['נסיעה שלמה: יעד, מחיר, עצירה, תשלום. שרדת את המונית.', 'A full ride: destination, price, stop, payment. You survived the taxi.']),
    k.review([
      'phrase.taxi.to-address', 'phrase.taxi.to-airport', 'phrase.taxi.how-much', 'phrase.taxi.stop-here', 'phrase.taxi.keep-change',
      'reply.taxi.where-to', 'reply.taxi.about-fifteen', 'reply.taxi.traffic', 'reply.taxi.here-good',
      'phrase.recovery.slowly', 'phrase.recovery.show-me',
    ]),
    // The ride at natural speed — the driver's own lines from the conversation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: ['Hello! Where to?', 'Bonjour ! Où allez-vous ?', '¡Hola! ¿A dónde va?', 'שלום! לאן?'],
          options: [['phrase.taxi.to-address', true], ['phrase.taxi.keep-change', false], ['phrase.taxi.stop-here', false]] },
        { npc: ["Sure. About fifteen euros. There's a lot of traffic.", 'Bien sûr. Environ quinze euros. Il y a beaucoup de circulation.', 'Claro. Unos quince euros. Hay mucho tráfico.', 'בטח. בערך חמישה עשר יורו. יש הרבה פקקים.'],
          options: [['phrase.recovery.thank-you', true, OKAY_THANKS], ['phrase.taxi.stop-here', false], ['phrase.taxi.to-address', false]] },
        { npc: ['…We are almost there. Is here okay?', '…On est presque arrivés. Ici, ça va ?', '…Ya casi llegamos. ¿Aquí está bien?', '…כמעט הגענו. כאן זה בסדר?'],
          options: [['phrase.taxi.stop-here', true], ['phrase.taxi.how-much', false], ['phrase.taxi.to-airport', false]] },
      ],
    }),
    k.receipt(['יעד, מחיר ועצירה — בקצב של נהג אמיתי. לא קפאת.', 'Destination, price and stop — at a real driver’s pace. You did not freeze.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 08 — Hotel Check-in ─────────────────────────────────────────────────────────────── */

const ROOM_TILES = [
  { id: 'r104', label: '104' }, { id: 'r204', label: '204' }, { id: 'r214', label: '214' },
  { id: 'r240', label: '240' }, { id: 'r402', label: '402' }, { id: 'r420', label: '420' },
];

export function m08Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    // "For two nights." and the wifi password are not part of this mission any more — not taught,
    // not reviewed, not offered in the conversation (wifi / SIM belongs to the Extended material).
    // The check-in is reservation → name → passport → breakfast.
    ...k.tools([
      ['phrase.hotel.reservation', ['הפתיח', 'The opener']],
      ['phrase.hotel.under-name', ['על איזה שם', 'The name on the booking']],
      ['phrase.hotel.here-you-go', ['להגיש את הדרכון', 'Handing it over']],
      ['phrase.hotel.breakfast', ['ארוחת בוקר', 'Breakfast']],
    ]),
    k.replies('phrase.hotel.reservation', ['reply.hotel.passport', 'reply.hotel.room-number', 'reply.hotel.second-floor', 'reply.hotel.breakfast-time']),
    k.receipt(['אתה מזהה כל מה שפקיד הקבלה אומר — דרכון, חדר, קומה, שעות.', 'You recognize everything the receptionist says — passport, room, floor, hours.']),
    // Hotel Match: what the receptionist says ↔ what it means, as numbers and icons — no translation.
    k.practice({
      kind: 'matchPairs',
      label: ['מה אמרו לך? חבר כל משפט למה שהוא אומר', 'What were you told? Match each line to what it means'],
      pairs: [
        ['reply.hotel.room-number', 'reply.hotel.room-number', undefined, '🚪 204'],
        ['reply.hotel.second-floor', 'reply.hotel.second-floor', undefined, '🏢 2'],
        ['reply.hotel.breakfast-time', 'reply.hotel.breakfast-time', undefined, '🍳 7–10'],
        ['reply.hotel.elevator', 'reply.hotel.elevator', undefined, '🛗 ➡️'],
      ],
    }),
    // The room number, by ear — the one number you must not get wrong.
    k.practice({
      kind: 'visualMatch',
      label: ['באיזה חדר אתה? הקש על המספר', 'Which room is yours? Tap the number'],
      tiles: ROOM_TILES,
      rounds: [
        { audio: ["You're in room two-oh-four.", 'Vous êtes dans la chambre deux cent quatre.', 'Está en la habitación doscientos cuatro.', 'אתה בחדר 204.'], correct: 'r204', itemId: 'reply.hotel.room-number' },
        { audio: ["You're in room four-oh-two.", 'Vous êtes dans la chambre quatre cent deux.', 'Está en la habitación cuatrocientos dos.', 'אתה בחדר 402.'], correct: 'r402' },
      ],
    }),
    k.practice({
      kind: 'quickReply',
      label: ['בדלפק הקבלה — מה אומרים?', 'At the front desk — what do you say?'],
      rounds: [
        { npc: ['Good evening. Do you have a reservation?', 'Bonsoir. Vous avez une réservation ?', 'Buenas noches. ¿Tiene una reserva?', 'ערב טוב. יש לך הזמנה?'],
          options: [['phrase.hotel.reservation', true], ['phrase.hotel.breakfast', false], ['phrase.hotel.here-you-go', false]] },
        { situation: ['הפקיד מחפש את ההזמנה. על איזה שם היא?', 'The receptionist is looking for the booking. Whose name is it under?'],
          options: [['phrase.hotel.under-name', true], ['phrase.hotel.reservation', false], ['phrase.hotel.breakfast', false]] },
        { prompt: 'reply.hotel.passport', options: [['phrase.hotel.here-you-go', true], ['phrase.recovery.one-moment', true], ['phrase.hotel.breakfast', false]] },
        { situation: ['קיבלת מפתח. אתה רוצה לדעת אם ארוחת הבוקר בפנים.', 'You have your key. You want to know whether breakfast comes with the room.'],
          options: [['phrase.hotel.breakfast', true], ['phrase.hotel.reservation', false], ['phrase.hotel.here-you-go', false]] },
      ],
    }),
    k.dialogue('hotel-checkin'),
    k.receipt(["צ'ק-אין שלם: הזמנה, דרכון, חדר, מידע — ואתה בפנים.", 'A full check-in: reservation, passport, room, info — and you’re in.']),
    k.review([
      'phrase.hotel.reservation', 'phrase.hotel.under-name', 'phrase.hotel.here-you-go', 'phrase.hotel.breakfast',
      'reply.hotel.passport', 'reply.hotel.room-number', 'reply.hotel.second-floor', 'reply.hotel.breakfast-time', 'reply.hotel.elevator',
      'phrase.recovery.repeat', 'phrase.recovery.one-moment',
    ]),
    // Fast information that is meant to be too much: asking to hear it again IS the right answer.
    k.ambush('recovery',
      ['Just so you know breakfast is served in the room on the lower level next to the pool.', 'Juste pour info, le petit-déjeuner est servi dans la salle au niveau inférieur, à côté de la piscine.', 'Solo para que lo sepa, el desayuno se sirve en la sala de la planta baja, junto a la piscina.', 'רק שתדע, ארוחת הבוקר מוגשת בחדר בקומה התחתונה ליד הבריכה.'],
      'phrase.recovery.repeat', 'phrase.hotel.here-you-go'),
    k.receipt(['מידע ארוך ומהיר — ובמקום לקפוא, ביקשת לחזור עליו. זה כלי.', 'Long, fast info — and instead of freezing, you asked them to repeat. That’s a tool.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 09 — Shopping ───────────────────────────────────────────────────────────────────── */

/** A larger or a smaller size, the way each language asks for it in a clothes shop. The adjective
 *  agrees with "size" (la taille / la talla), never with the garment, so one wording fits any item. */
const SIZE_FRAME: L3 = ['Do you have a ___ size?', 'Vous avez une taille ___ ?', '¿Tiene una talla ___?'];
const SIZES: Record<'bigger' | 'smaller', readonly [L3, string]> = {
  bigger: [['bigger', 'plus grande', 'más grande'], 'יש מידה גדולה יותר?'],
  smaller: [['smaller', 'plus petite', 'más pequeña'], 'יש מידה קטנה יותר?'],
};
const sizeRound = (right: keyof typeof SIZES, emoji: string, cue: Copy) => ({
  frame: SIZE_FRAME,
  itemId: 'phrase.shop.bigger',
  cue: { emoji, text: cue },
  options: (['bigger', 'smaller'] as const).map((s) => [SIZES[s][0], SIZES[s][1], s === right] as const),
});

export function m09Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.shop.just-looking', ['מרחב אישי', 'Personal space']],
      ['phrase.shop.try-on', ['למדוד', 'Try it on']],
      ['phrase.shop.bigger', ['מידה', 'Sizes']],
      ['phrase.shop.take-it', ['להחליט', 'Decide']],
    ]),
    k.replies('phrase.shop.try-on', ['reply.shop.what-size', 'reply.shop.fitting-room', 'reply.shop.on-sale', 'reply.shop.anything-else']),
    k.receipt(['אתה מזהה מה מוכר שואל — מידה, חדר הלבשה, מבצע.', 'You recognize what a seller asks — size, fitting room, sale.']),
    // "Out of stock" is something you must UNDERSTAND, not say — so it is tested by ear, once.
    k.quiz('reply.shop.out-of-stock', 'reply.shop.on-sale', 'reply.shop.fitting-room'),
    // Shop Rush: four moments with a seller.
    k.practice({
      kind: 'quickReply',
      label: ['בחנות — מה אומרים?', 'In the shop — what do you say?'],
      rounds: [
        { prompt: 'reply.shop.can-i-help', options: [['phrase.shop.just-looking', true], ['phrase.shop.take-it', false], ['phrase.shop.bigger', false]] },
        { situation: ['מצאת משהו שמוצא חן בעיניך. אתה רוצה למדוד אותו.', 'You found something you like. You want to try it on.'],
          options: [['phrase.shop.try-on', true], ['phrase.shop.just-looking', false], ['phrase.shop.take-it', false]] },
        { prompt: 'reply.shop.on-sale', options: [['phrase.shop.take-it', true], ['phrase.shop.just-looking', false], ['phrase.shop.try-on', false]] },
        { situation: ['המחיר גבוה ממה שחשבת. אומרים את זה בנימוס.', 'The price is higher than you expected. Say so politely.'],
          options: [['phrase.shop.too-expensive', true], ['phrase.shop.take-it', false], ['phrase.shop.just-looking', false]] },
      ],
    }),
    // One size up, one size down.
    k.practice({
      kind: 'swap',
      label: ['איזו מידה לבקש?', 'Which size do you ask for?'],
      rounds: [
        sizeRound('bigger', '👕', ['זה קטן עליך', 'It is too small on you']),
        sizeRound('smaller', '🧥', ['זה גדול עליך', 'It is too big on you']),
      ],
    }),
    k.dialogue('clothing-shop'),
    k.receipt(['קניה שלמה: הסתכלת, מדדת, ביקשת מידה, החלטת. בשליטה מלאה.', 'A full shop: browsed, tried on, asked for a size, decided. Fully in control.']),
    k.review([
      'phrase.shop.just-looking', 'phrase.shop.try-on', 'phrase.shop.bigger', 'phrase.shop.take-it', 'phrase.shop.too-expensive',
      'reply.shop.can-i-help', 'reply.shop.what-size', 'reply.shop.fitting-room', 'reply.shop.on-sale', 'reply.shop.out-of-stock',
      'phrase.recovery.slowly', 'phrase.recovery.repeat',
    ]),
    // A long, fast seller sentence that is meant to be too much: asking for it again is the win.
    k.ambush('recovery',
      ['That one is actually the last piece we have in that colour would you like me to hold it?', 'Celui-ci, c’est en fait le dernier qu’il nous reste dans cette couleur — vous voulez que je vous le garde ?', 'Este es en realidad el último que nos queda en ese color — ¿quiere que se lo guarde?', 'זה בעצם הפריט האחרון שיש לנו בצבע הזה — שאשמור לך אותו?'],
      'phrase.recovery.repeat', 'phrase.shop.take-it'),
    k.receipt(['משפט ארוך ומהיר — ובמקום לקפוא, ביקשת הבהרה. זה בדיוק הרפלקס.', 'A long, fast sentence — and instead of freezing, you asked for clarity. Exactly the reflex.']),
    { kind: 'summary' },
  ];
}
