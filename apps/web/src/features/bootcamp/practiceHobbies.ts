import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 16 — Hobbies & Free Time: SHORT, VISUAL, TRANSFER-DRIVEN. Defined ONCE for English, French
 * and Spanish. The conversation is LOCKED (`core/hobbies.ts`); this is the short journey around it — a
 * reusable preference system, not a hobby vocabulary list, and no grammar (no like + -ing, no
 * want + infinitive, no frequency adverbs):
 *
 *   the briefing (your own preferences) → "What do you do for fun?" → LOVE (surfing) → LIKE (drawing)
 *   → WHEN (usually · evening — one time choice) → TOO (music) → DON'T LIKE (running) → WANT TO TRY
 *   (diving) → the diving school → YOU ask back ("Do you like diving?" — transfer, no card) → the plan
 *   for tomorrow → the conversation (once, supported) → no help (5) → the video → the final (7) →
 *   🎯 FREE TIME MATCH.
 *
 * Rules kept here:
 *   - the learner says only the eight locked lines; the friend's lines are comprehension;
 *   - SORT YOUR HOBBIES — the one game: five moments, one per hobby, each the same presentation (the
 *     hobby's picture, your own line heard, four category tiles). The answer moves the hobby into the
 *     My Free Time profile, which fills only as the mission reveals it. No score, no streak, no timer;
 *   - "Do you like diving?" has NO card: it is built from "Do you like ___?" (the friend asked it three
 *     times) and "diving" (your want-to-try line) — the evidence that the pattern transferred;
 *   - no Flex Round, no extra hobby, no builder.
 *
 * Coverage: `mission16Coverage.ts`, enforced by `mission16.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): one friend, one beach town, one style.
 * Each slot is an emoji until its artwork exists (`image` set): docs/MISSION16_ASSET_MANIFEST.md.
 * The five hobbies get EQUAL treatment (same frame, same size, same style). Pictures are on cards and
 * as the subject of a sorting round — never an answer.
 */
export type M16Hobby = 'surfing' | 'drawing' | 'music' | 'running' | 'diving';
type M16Slot = 'friends' | M16Hobby | 'diving-school';
export const M16_SLOTS: Record<M16Slot, { emoji: string; image?: string }> = {
  friends: { emoji: '🙂' },
  surfing: { emoji: '🏄' },
  drawing: { emoji: '🎨' },
  music: { emoji: '🎵' },
  running: { emoji: '🏃' },
  diving: { emoji: '🤿' },
  'diving-school': { emoji: '🏖️' },
};
/** Result picture only — never a choice, never a card. */
export const M16_PROPS: Record<'free-time-match', { emoji: string; image?: string }> = {
  'free-time-match': { emoji: '🤝' },
};
const look16 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/* The locked conversation (EN · FR · ES · HE), line by line — the friend's lines… */
export const N_FREE: L4 = ['Hi! Are you free today?', 'Salut ! Tu es libre aujourd’hui ?', '¡Hola! ¿Estás libre hoy?', 'היי! אתה פנוי היום?'];
export const N_SURF: L4 = ['I surf a lot. Do you like surfing?', 'Je fais beaucoup de surf. Tu aimes le surf ?', 'Hago mucho surf. ¿Te gusta el surf?', 'אני גולש הרבה. אתה אוהב לגלוש?'];
export const N_ELSE: L4 = ['Great! And what else do you like?', 'Super ! Et tu aimes quoi d’autre ?', '¡Genial! ¿Y qué más te gusta?', 'מעולה! ומה עוד אתה אוהב?'];
export const N_WHEN: L4 = ['Nice! When do you draw?', 'Sympa ! Tu dessines quand ?', '¡Qué bien! ¿Cuándo dibujas?', 'יפה! מתי אתה מצייר?'];
export const N_MUSIC: L4 = ['In the evening I like to listen to music. Do you like music?', 'Le soir, j’aime écouter de la musique. Tu aimes la musique ?', 'Por la noche me gusta escuchar música. ¿Te gusta la música?', 'בערב אני אוהב לשמוע מוזיקה. אתה אוהב מוזיקה?'];
export const N_SPORT: L4 = ['And sport? Do you like running?', 'Et le sport ? Tu aimes courir ?', '¿Y el deporte? ¿Te gusta correr?', 'וספורט? אתה אוהב לרוץ?'];
export const N_TRY: L4 = ['Me neither! Is there something you want to try here?', 'Moi non plus ! Il y a quelque chose que tu veux essayer ici ?', '¡Yo tampoco! ¿Hay algo que quieras probar aquí?', 'גם אני לא! יש משהו שאתה רוצה לנסות כאן?'];
export const N_SCHOOL: L4 = ["Good idea! There's a diving school near the beach.", 'Bonne idée ! Il y a une école de plongée près de la plage.', '¡Buena idea! Hay una escuela de buceo cerca de la playa.', 'רעיון טוב! יש בית ספר לצלילה ליד החוף.'];
export const N_TOMORROW: L4 = ["I love it! Let's go together tomorrow.", 'J’adore ! On y va ensemble demain.', '¡Me encanta! Vamos juntos mañana.', 'מאוד! בוא נלך יחד מחר.'];
/* …and the traveller's, as said. */
export const Y_FUN: L4 = ['Yes! What do you do for fun?', 'Oui ! Qu’est-ce que tu aimes faire ?', '¡Sí! ¿Qué te gusta hacer?', 'כן! מה אתה אוהב לעשות בזמן הפנוי?'];
export const Y_LOVE: L4 = ['I love surfing!', 'J’adore le surf !', '¡Me encanta el surf!', 'אני מאוד אוהב לגלוש!'];
export const Y_LIKE: L4 = ['I like drawing.', 'J’aime dessiner.', 'Me gusta dibujar.', 'אני אוהב לצייר.'];
export const Y_USUALLY: L4 = ['I usually draw in the evening.', 'D’habitude, je dessine le soir.', 'Normalmente dibujo por la noche.', 'בדרך כלל אני מצייר בערב.'];
export const Y_TOO: L4 = ['Yes, I like to listen to music too.', 'Oui, moi aussi j’aime écouter de la musique.', 'Sí, a mí también me gusta escuchar música.', 'כן, גם אני אוהב לשמוע מוזיקה.'];
export const Y_DONT: L4 = ["No, I don't like running.", 'Non, je n’aime pas courir.', 'No, no me gusta correr.', 'לא, אני לא אוהב לרוץ.'];
export const Y_TRY: L4 = ['I want to try diving.', 'Je veux essayer la plongée.', 'Quiero probar el buceo.', 'אני רוצה לנסות צלילה.'];
export const Y_ASK: L4 = ['Do you like diving?', 'Tu aimes la plongée ?', '¿Te gusta el buceo?', 'אתה אוהב לצלול?'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── My Free Time — your profile, and only what the chat has revealed ───────────────────────────── */

/** The four preference categories — semantic ids, the same in every language. */
export type Preference = 'love' | 'like' | 'dislike' | 'wantToTry';
export const PREFERENCES: readonly Preference[] = ['love', 'like', 'dislike', 'wantToTry'];
/** What each hobby IS in your profile (the briefing's own facts). */
export const HOBBY_PREFERENCE: Record<M16Hobby, Preference> = { surfing: 'love', drawing: 'like', music: 'like', running: 'dislike', diving: 'wantToTry' };
export const HOBBIES_IN_ORDER: readonly M16Hobby[] = ['surfing', 'drawing', 'music', 'running', 'diving'];

/**
 * How far the mission has got, in the order it reveals things:
 *   0 nothing · 1 surfing → LOVE (you) + your friend surfs a lot · 2 drawing → LIKE · 3 drawing → evening
 *   · 4 music → LIKE + your friend likes music in the evening · 5 running → DON'T LIKE · 6 diving →
 *   WANT TO TRY + your friend doesn't like running either · 7 the diving school, near the beach ·
 *   8 your friend loves diving + the plan: tomorrow, together.
 * Your column fills when YOU place a hobby (the sorting game) or say when; your friend's when they say it.
 */
export const M16_REVEALS = ['nothing', 'surfing', 'drawing', 'evening', 'music', 'running', 'diving', 'school', 'tomorrow'] as const;
export type M16Reveal = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
/** The stage at which each hobby is placed in your profile. */
const PLACED_AT: Record<M16Hobby, M16Reveal> = { surfing: 1, drawing: 2, music: 4, running: 5, diving: 6 };

export const HOBBY_NAME: Record<M16Hobby, Copy> = {
  surfing: ['גלישה', 'Surfing'], drawing: ['ציור', 'Drawing'], music: ['מוזיקה', 'Music'], running: ['ריצה', 'Running'], diving: ['צלילה', 'Diving'],
};
/** The category labels — the game's four tiles and the profile's four rows say the same thing. */
export const PREFERENCE_COPY: Record<Preference, { emoji: string; copy: Copy }> = {
  love: { emoji: '😍', copy: ['אוהב מאוד', 'Love'] },
  like: { emoji: '🙂', copy: ['אוהב', 'Like'] },
  dislike: { emoji: '🙅', copy: ['לא אוהב', 'Don’t like'] },
  wantToTry: { emoji: '✨', copy: ['רוצה לנסות', 'Want to try'] },
};
const PROFILE_COPY = {
  you: ['🎯 הזמן הפנוי שלי', '🎯 My free time'], friend: ['👋 החבר', '👋 My friend'],
  when: ['🕒 מתי: ?', '🕒 When: ?'], drawingEvening: ['🕒 ציור → ערב', '🕒 Drawing → Evening'],
  surfALot: ['גלישה: הרבה', 'Surfing: a lot'], musicEvening: ['מוזיקה: בערב', 'Music: in the evening'],
  runningNo: ['ריצה: גם הוא לא אוהב', 'Running: doesn’t like it either'], divingLove: ['צלילה: אוהב מאוד', 'Diving: loves it'],
  school: ['בית ספר לצלילה · ליד החוף', 'Diving school · near the beach'], tomorrow: ['מחר · יחד', 'Tomorrow · together'],
} as const satisfies Record<string, Copy>;

/** My Free Time, as plain serialisable data — every value null (or false) until the mission has revealed it. */
export const freeTimeState = (n: M16Reveal) => ({
  phase: M16_REVEALS[n],
  hobbyPreferences: Object.fromEntries(HOBBIES_IN_ORDER.map((h) => [h, n >= PLACED_AT[h] ? HOBBY_PREFERENCE[h] : null])) as Record<M16Hobby, Preference | null>,
  drawingTime: n >= 3 ? ('evening' as const) : null,
  friend: {
    surfing: n >= 1 ? ('a-lot' as const) : null,
    music: n >= 4 ? ('evening' as const) : null,
    running: n >= 6 ? ('dislike' as const) : null,
    diving: n >= 8 ? ('love' as const) : null,
  },
  divingSchoolKnown: n >= 7,
  tomorrowPlan: n >= 8 ? ('diving-together' as const) : null,
});

/** The profile at reveal `n`, as text the screen renders as two columns (`freeTimeProfile(0)` is all "?"). */
export const freeTimeProfile = (n: M16Reveal): Copy => {
  const s = freeTimeState(n);
  const row = (i: 0 | 1): string => {
    const placed = (p: Preference): string => {
      const hobbies = HOBBIES_IN_ORDER.filter((h) => s.hobbyPreferences[h] === p).map((h) => HOBBY_NAME[h][i]);
      return `${PREFERENCE_COPY[p].emoji} ${PREFERENCE_COPY[p].copy[i]}: ${hobbies.length ? hobbies.join(' · ') : '?'}`;
    };
    const mine = [...PREFERENCES.map(placed), s.drawingTime ? PROFILE_COPY.drawingEvening[i] : PROFILE_COPY.when[i]];
    const c = PROFILE_COPY;
    const friend = [s.friend.surfing ? c.surfALot[i] : '', s.friend.music ? c.musicEvening[i] : '', s.friend.running ? c.runningNo[i] : '', s.friend.diving ? c.divingLove[i] : ''].filter(Boolean);
    return `${c.you[i]}: ${mine.join(' / ')} ‖ ${c.friend[i]}: ${friend.length ? friend.join(' / ') : '?'}`;
  };
  return [row(0), row(1)];
};
/** The plan — none until the diving school is mentioned; then where, and (once agreed) when. */
export const freeTimePlan = (n: M16Reveal): Copy | null => {
  if (n < 7) return null;
  const cells = n >= 8 ? [PROFILE_COPY.school, PROFILE_COPY.tomorrow] : [PROFILE_COPY.school];
  const row = (i: 0 | 1): string => `🧭 ${cells.map((x) => x[i]).join(' → ')}`;
  return [row(0), row(1)];
};
/** The parts of a board label, joined: the screen draws the plan and the profile, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const board = (n: M16Reveal, prompt?: Copy): Copy => {
  const plan = freeTimePlan(n);
  const join = (i: 0 | 1): string => [...(plan ? [plan[i]] : []), freeTimeProfile(n)[i], ...(prompt ? [prompt[i]] : [])].join(BOARD_SEP);
  return [join(0), join(1)];
};

/** The ending — your profile, what your friend shared, and tomorrow's plan. Never a score. */
export const FREE_TIME_MATCH: Copy = [
  `🎯 התאמת זמן פנוי${BOARD_SEP}${freeTimePlan(8)![0]}${BOARD_SEP}${freeTimeProfile(8)[0]}`,
  `🎯 FREE TIME MATCH${BOARD_SEP}${freeTimePlan(8)![1]}${BOARD_SEP}${freeTimeProfile(8)[1]}`,
];

/* ── The tiles — semantic (the id is the meaning), captioned in the app language ────────────────── */

/** SORT YOUR HOBBIES — the four categories. */
export const CATEGORY_TILES: MatchTile[] = PREFERENCES.map((p) => ({ id: p, emoji: PREFERENCE_COPY[p].emoji, caption: { he: PREFERENCE_COPY[p].copy[0], en: PREFERENCE_COPY[p].copy[1] } }));
/** When do you draw? — a time of day, deterministic UI (never a picture). */
export const TIME_TILES: MatchTile[] = [
  { id: 'morning', emoji: '🌅', caption: { he: 'בוקר', en: 'Morning' } },
  { id: 'afternoon', emoji: '☀️', caption: { he: 'צהריים', en: 'Afternoon' } },
  { id: 'evening', emoji: '🌙', caption: { he: 'ערב', en: 'Evening' } },
];
/** When is the dive? — today or tomorrow. */
export const PLAN_TILES: MatchTile[] = [
  { id: 'today', emoji: '📅', caption: { he: 'היום', en: 'Today' } },
  { id: 'tomorrow', emoji: '🌄', caption: { he: 'מחר', en: 'Tomorrow' } },
];
/** The line that places each hobby: your own line, heard. */
export const SORT_LINE: Record<M16Hobby, L4> = { surfing: Y_LOVE, drawing: Y_LIKE, music: Y_TOO, running: Y_DONT, diving: Y_TRY };

/* Learner sentence ids. */
const FUN = 'phrase.hobby.what-for-fun';
const LOVE = 'phrase.hobby.i-love-surfing';
const LIKE = 'phrase.hobby.i-like-drawing';
const USUALLY = 'phrase.hobby.i-usually';
const TOO = 'phrase.hobby.like-to-listen';
const DONT = 'phrase.hobby.dont-like-running';
const TRY = 'phrase.hobby.want-to-try';
const ASK = 'phrase.hobby.do-you-like';
/** What each learner sentence is said as — the whole locked line. */
export const SAID: Record<string, L4> = { [FUN]: Y_FUN, [LOVE]: Y_LOVE, [LIKE]: Y_LIKE, [USUALLY]: Y_USUALLY, [TOO]: Y_TOO, [DONT]: Y_DONT, [TRY]: Y_TRY, [ASK]: Y_ASK };
export const LEARNER_IDS = [FUN, LOVE, LIKE, USUALLY, TOO, DONT, TRY, ASK] as const;

/* The final's own moves, in the app language — the category, never the sentence. */
const FINAL_LOVE: Copy = ['🏄 גלישה — אתה מת על זה. תגיד לו.', '🏄 Surfing — you love it. Tell your friend.'];
const FINAL_DONT: Copy = ['🏃 ריצה — זה לא בשבילך. תגיד לו.', '🏃 Running — not for you. Tell your friend.'];
const FINAL_TRY: Copy = ['🤿 צלילה — משהו חדש שבא לך לנסות. תגיד לו.', '🤿 Diving — something new you’d like to do. Tell your friend.'];

export function m16Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M16Slot) => ({ line: true, key, t: l3(line), meaning, ...look16(M16_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  // Every reply option is one of the eight lines, said whole.
  const say = (id: string, ok: boolean) => [id, ok, l3(SAID[id]!)] as const;
  const sort = (h: M16Hobby, n: M16Reveal): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true,
    label: board(n, ['🎯 מיין את התחביבים — שמע, והקש לאן זה שייך.', '🎯 Sort your hobbies — listen, and tap where it goes.']),
    tiles: CATEGORY_TILES, rounds: [{ audio: SORT_LINE[h], correct: HOBBY_PREFERENCE[h], picture: { ...M16_SLOTS[h] } }],
  });
  const steps: BootcampStep[] = [
    // FREE TIME — the opener: ask what someone does for fun (one whole function, never word by word).
    cards(['זמן פנוי', 'Free time'], board(0, ['החבר פנוי היום — ואתה שואל מה הוא אוהב לעשות. הקש כדי לשמוע.', 'Your friend is free today — and you ask what they do for fun. Tap to hear.']), [
      card('hobby.line.free', N_FREE, ['היי! אתה פנוי היום?', 'Hi! Are you free today?'], 'friends'),
      card('hobby.line.for-fun', Y_FUN, ['כן! מה אתה אוהב לעשות בזמן הפנוי? (שואלים מה מישהו עושה בשביל הכיף)', 'Yes! What do you do for fun? (ask what someone likes doing in their free time)'], 'friends'),
    ]),
    // LOVE — the strongest yes.
    cards(['אוהב מאוד', 'Love'], board(0, ['החבר גולש — ואתה מת על גלישה. הקש כדי לשמוע.', 'Your friend surfs — and you love surfing. Tap to hear.']), [
      card('hobby.line.surf', N_SURF, ['אני גולש הרבה. אתה אוהב לגלוש?', 'I surf a lot. Do you like surfing?'], 'surfing'),
      card('hobby.line.love', Y_LOVE, ['אני מאוד אוהב לגלוש! (אוהב מאוד — ה"כן" הכי חזק)', 'I love surfing! (love — the strongest “yes”)'], 'surfing'),
    ]),
    k.practice({ kind: 'quickReply', label: board(0, ['החבר אומר היי. מה אתה שואל?', 'Your friend says hi. What do you ask?']), rounds: [
      { prompt: 'reply.hobby.free-today', options: [say(FUN, true), say(LOVE, false)] },
    ] }),
    sort('surfing', 0),
    // LIKE — the same system, a normal yes.
    cards(['אוהב', 'Like'], board(1, ['מה עוד? אותה מערכת — "כן" רגיל. הקש כדי לשמוע.', 'What else? The same system — a normal “yes”. Tap to hear.']), [
      card('hobby.line.what-else', N_ELSE, ['מעולה! ומה עוד אתה אוהב?', 'Great! And what else do you like?'], 'friends'),
      card('hobby.line.like', Y_LIKE, ['אני אוהב לצייר. (אוהב — "כן" רגיל)', 'I like drawing. (like — a normal “yes”)'], 'drawing'),
    ]),
    sort('drawing', 1),
    // WHEN — usually = what I normally do; in the evening.
    cards(['מתי', 'When'], board(2, ['מתי אתה מצייר? הקש כדי לשמוע.', 'When do you draw? Tap to hear.']), [
      card('hobby.line.when', N_WHEN, ['יפה! מתי אתה מצייר?', 'Nice! When do you draw?'], 'drawing'),
      card('hobby.line.usually', Y_USUALLY, ['בדרך כלל אני מצייר בערב. (בדרך כלל = מה שאני עושה בדרך כלל · בערב)', 'I usually draw in the evening. (usually = what I normally do · in the evening)'], 'drawing'),
    ]),
    k.practice({
      kind: 'visualMatch', quiet: true, ordered: true,
      label: board(2, ['מתי אתה מצייר? שמע — והקש על הזמן.', 'When do you draw? Listen — and tap the time.']),
      tiles: TIME_TILES, rounds: [{ audio: Y_USUALLY, correct: 'evening' }],
    }),
    // TOO — you both like music.
    cards(['גם אני', 'Me too'], board(3, ['החבר אוהב מוזיקה — וגם אתה. הקש כדי לשמוע.', 'Your friend likes music — and so do you. Tap to hear.']), [
      card('hobby.line.music', N_MUSIC, ['בערב אני אוהב לשמוע מוזיקה. אתה אוהב מוזיקה?', 'In the evening I like to listen to music. Do you like music?'], 'music'),
      card('hobby.line.too', Y_TOO, ['כן, גם אני אוהב לשמוע מוזיקה. (גם אני — שנינו אוהבים)', 'Yes, I like to listen to music too. (too — we both like it)'], 'music'),
    ]),
    k.practice({ kind: 'quickReply', label: board(3, ['החבר אוהב מוזיקה בערב. מה אתה עונה?', 'Your friend likes music in the evening. What do you answer?']), rounds: [
      { prompt: 'reply.hobby.do-you-like-music', options: [say(TOO, true), say(LIKE, false), say(USUALLY, false)] },
    ] }),
    sort('music', 3),
    // DON'T LIKE — the negative preference.
    cards(['לא אוהב', 'Don’t like'], board(4, ['ספורט? ריצה — זה לא בשבילך. הקש כדי לשמוע.', 'Sport? Running — not for you. Tap to hear.']), [
      card('hobby.line.sport', N_SPORT, ['וספורט? אתה אוהב לרוץ?', 'And sport? Do you like running?'], 'running'),
      card('hobby.line.dont-like', Y_DONT, ['לא, אני לא אוהב לרוץ. (לא אוהב — זה לא בשבילי)', "No, I don't like running. (don't like — not for me)"], 'running'),
    ]),
    sort('running', 4),
    // WANT TO TRY — something new.
    cards(['רוצה לנסות', 'Want to try'], board(5, ['גם החבר לא אוהב לרוץ — ושואל מה אתה רוצה לנסות. הקש כדי לשמוע.', 'Your friend doesn’t like running either — and asks what you want to try. Tap to hear.']), [
      card('hobby.line.try-q', N_TRY, ['גם אני לא! יש משהו שאתה רוצה לנסות כאן? (גם אני לא = גם הוא לא אוהב לרוץ)', 'Me neither! Is there something you want to try here? (me neither = your friend doesn’t like it either)'], 'friends'),
      card('hobby.line.want-to-try', Y_TRY, ['אני רוצה לנסות צלילה. (רוצה לנסות = משהו חדש שבא לי לעשות)', 'I want to try diving. (want to try = something new I’d like to do)'], 'diving'),
    ]),
    sort('diving', 5),
    // THE DIVING SCHOOL — where (comprehension only).
    cards(['בית ספר לצלילה', 'The diving school'], board(6, ['החבר יודע איפה אפשר לצלול. הקש כדי לשמוע.', 'Your friend knows where to dive. Tap to hear.']), [
      card('hobby.line.school', N_SCHOOL, ['רעיון טוב! יש בית ספר לצלילה ליד החוף. (בית ספר לצלילה ← ליד החוף)', 'Good idea! There’s a diving school near the beach. (diving school → near the beach)'], 'diving-school'),
    ]),
    // YOU ASK BACK — no card: the friend's own question, now with your hobby.
    k.practice({ kind: 'quickReply', label: board(7, ['עכשיו תורך לשאול — אותה שאלה שהחבר שאל אותך.', 'Now you ask back — the same question your friend asked you.']), rounds: [
      { prompt: 'reply.hobby.diving-school', options: [say(ASK, true), say(TRY, false), say(LOVE, false)] },
    ] }),
    // THE PLAN — your friend loves it too: tomorrow, together.
    cards(['התוכנית', 'The plan'], board(7, ['החבר עונה — ומציע תוכנית. הקש כדי לשמוע.', 'Your friend answers — and suggests a plan. Tap to hear.']), [
      card('hobby.line.tomorrow', N_TOMORROW, ['מאוד! בוא נלך יחד מחר. (גם הוא אוהב צלילה · התוכנית: מחר, יחד)', 'I love it! Let’s go together tomorrow. (your friend loves diving · the plan: tomorrow, together)'], 'friends'),
    ]),
    k.practice({
      kind: 'visualMatch', quiet: true, ordered: true,
      label: board(7, ['מתי הולכים לצלול יחד?', 'When do you go diving together?']),
      tiles: PLAN_TILES, rounds: [{ audio: N_TOMORROW, correct: 'tomorrow' }],
    }),
    k.receipt(board(8, ['הזמן הפנוי שלך — ותוכנית למחר.', 'Your free time — and a plan for tomorrow.'])),
    // THE CONVERSATION — once, supported (translations on).
    k.dialogue('free-time-chat'),
    k.receipt(['כל השיחה — מה אתה אוהב, מה לא, מתי, מה אתה רוצה לנסות — ושאלת בחזרה.', 'The whole chat — what you love, like and don’t, when, what you want to try — and you asked back.']),
    // NO HELP — the core five at a friend's pace: no meaning, no cards, no profile.
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { prompt: 'reply.hobby.do-you-like-surfing', options: [say(LOVE, true), say(TRY, false), say(USUALLY, false)] },
      { prompt: 'reply.hobby.when-draw', options: [say(USUALLY, true), say(LIKE, false), say(ASK, false)] },
      { prompt: 'reply.hobby.sport', options: [say(DONT, true), say(LOVE, false), say(FUN, false)] },
      { prompt: 'reply.hobby.want-to-try-q', options: [say(TRY, true), say(DONT, false), say(TOO, false)] },
      { prompt: 'reply.hobby.diving-school', options: [say(ASK, true), say(TRY, false), say(FUN, false)] },
    ] }),
    k.receipt(['בלי עזרה — אוהב, מתי, לא אוהב, רוצה לנסות, ושאלת בחזרה.', 'No help — love, when, don’t like, want to try, and you asked back.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: the system, once — ask, love, like, when, don't like, want to try, ask back.
    k.practice({ kind: 'quickReply', label: ['🎯 עכשיו לבד: לשאול, לספר מה אתה אוהב, מתי, מה לא, מה לנסות — ולשאול בחזרה.', '🎯 On your own now: ask, say what you love and like, when, what not, what to try — and ask back.'], rounds: [
      { prompt: 'reply.hobby.free-today', options: [say(FUN, true), say(ASK, false), say(USUALLY, false)] },
      { situation: FINAL_LOVE, ...(M16_SLOTS.surfing.image ? { situationImage: M16_SLOTS.surfing.image } : {}), options: [say(LOVE, true), say(LIKE, false), say(TRY, false)] },
      { prompt: 'reply.hobby.what-else', options: [say(LIKE, true), say(DONT, false), say(FUN, false)] },
      { prompt: 'reply.hobby.when-draw', options: [say(USUALLY, true), say(LIKE, false), say(TRY, false)] },
      { situation: FINAL_DONT, ...(M16_SLOTS.running.image ? { situationImage: M16_SLOTS.running.image } : {}), options: [say(DONT, true), say(LOVE, false), say(TOO, false)] },
      { situation: FINAL_TRY, ...(M16_SLOTS.diving.image ? { situationImage: M16_SLOTS.diving.image } : {}), options: [say(TRY, true), say(ASK, false), say(LOVE, false)] },
      { prompt: 'reply.hobby.diving-school', options: [say(ASK, true), say(TRY, false), say(FUN, false)] },
    ] }),
    k.receipt(FREE_TIME_MATCH),
    { kind: 'summary' },
  ];
  // The result picture appears only at its earned receipt, once its artwork exists.
  const result = M16_PROPS['free-time-match'];
  return steps.map((step) => (step.kind === 'receipt' && step.text.en === FREE_TIME_MATCH[1] && result.image ? { ...step, image: result.image } : step));
}

/** The briefing's picture, once its artwork exists (the two friends — no hobby, no plan). */
export const M16_BRIEFING_IMAGE = M16_SLOTS.friends.image;
