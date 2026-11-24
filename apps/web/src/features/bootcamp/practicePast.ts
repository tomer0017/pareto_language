import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 20 — Past & Recent Events: TELL YOUR YESTERDAY. SHORT, PRACTICAL, GAME-LIKE — defined ONCE for
 * English, French and Spanish. The conversation is LOCKED (`core/pastEvents.ts`); this is the short journey
 * around it. The learner does not study a tense: they learn to understand what a friend asks about their
 * yesterday, answer it, and turn the question back.
 *
 *   the briefing → "Where were you yesterday?" (which part of your story? 📍) → I went to ___ · I saw ___
 *   (answer both) → the same sentence, another place → "Did you eat there?" → I ate ___ → another food →
 *   "Did you like it?" → great (not just good) → last month: "Where did you stay?" (🛏️, not 📍) → I stayed
 *   in ___ → another place to stay → "Was it good?" → it was good — and you ask back → the friend's own day
 *   (😴) → the conversation (once, supported) → no help (4) → the video → the final: ANOTHER day, the same
 *   questions, new details (6) → 🗓️ YESTERDAY STORY.
 *
 * Rules kept here:
 *   - four production tools: I went to ___ · I saw ___ · I ate ___ · What did you do yesterday? (asked back);
 *     "It was great" and "I stayed in ___" are secondary — one card, one small check, the conversation;
 *   - no grammar: no tense, no verb, no "did", no went/saw/ate list, no table, no builder, no Flex Round;
 *   - THE YESTERDAY STORY — the one game object: a compact two-column story (🗓️ yesterday ‖ 📅 last month),
 *     "?" until the conversation has said it. The questions are played and the learner taps WHICH PART of
 *     the story is asked about (📍 / 👀 / 🍽️ / ⭐ / 🛏️) — the function of the question, never its grammar;
 *   - transfer is real, and verified prior (`learnedBefore(lang, 20)`): the beach, the centre, the museum,
 *     chicken and a hotel are all met in Missions 01–19 in every language — no new word comes with them;
 *   - the friend's own day ("Me? Nothing! I was tired. I slept all day.") is ONE comprehension moment.
 *
 * Coverage: `mission20Coverage.ts`, enforced by `mission20.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * Artwork: none yet — VISUAL PRODUCTION REQUIRED (docs/MISSION20_ASSET_MANIFEST.md). Every slot has a semantic
 * emoji, which is what the cards show until production artwork exists. No picture may carry an answer:
 * the story's exact data (the place, the thing, the food, how it was, where you stayed) is UI.
 */
type M20Slot = 'chat' | 'old-town' | 'market' | 'meal' | 'hostel' | 'friend-day';
export const M20_SLOTS: Record<M20Slot, { emoji: string; image?: string }> = {
  chat: { emoji: '💬' },
  'old-town': { emoji: '🏘️' },
  market: { emoji: '🧺' },
  meal: { emoji: '🍽️' },
  hostel: { emoji: '🛏️' },
  'friend-day': { emoji: '😴' },
};
/** Result picture only — never a choice, never a card. */
export const M20_PROPS: Record<'yesterday-story', { emoji: string; image?: string }> = {
  'yesterday-story': { emoji: '🗓️' },
};
const look20 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/* The locked conversation (EN · FR · ES · HE support), line by line — the friend's lines… */
export const N_WHERE: L4 = ['Hey! Where were you yesterday?', 'Salut ! Tu étais où hier ?', '¡Hola! ¿Dónde estuviste ayer?', 'היי! איפה היית אתמול?'];
export const N_SEE: L4 = ['Nice! What did you see?', 'Sympa ! Tu as vu quoi ?', '¡Qué bien! ¿Qué viste?', 'יפה! מה ראית?'];
export const N_EAT: L4 = ['Did you eat there?', 'Tu as mangé là-bas ?', '¿Comiste allí?', 'אכלת שם?'];
export const N_LIKE: L4 = ['Did you like it?', 'Tu as aimé ?', '¿Te gustó?', 'אהבת?'];
export const N_STAY: L4 = ['You were in Argentina last month, right? Where did you stay?', 'Tu étais en Argentine le mois dernier, non ? Tu as logé où ?', 'Estuviste en Argentina el mes pasado, ¿no? ¿Dónde te quedaste?', 'היית בארגנטינה בחודש שעבר, נכון? איפה התארחת?'];
export const N_GOOD: L4 = ['A hostel! Was it good?', 'Une auberge ! C’était bien ?', '¡Un hostal! ¿Estuvo bien?', 'הוסטל! היה טוב?'];
export const N_END: L4 = ['Me? Nothing! I was tired. I slept all day.', 'Moi ? Rien ! J’étais fatigué. J’ai dormi toute la journée.', '¿Yo? ¡Nada! Estaba cansado. Dormí todo el día.', 'אני? כלום! הייתי עייף. ישנתי כל היום.'];
/* …and the traveller's, as said. */
export const Y_WENT: L4 = ['I went to the old town.', 'Je suis allé dans la vieille ville.', 'Fui al casco antiguo.', 'הלכתי לעיר העתיקה.'];
export const Y_SAW: L4 = ['I saw the market.', 'J’ai vu le marché.', 'Vi el mercado.', 'ראיתי את השוק.'];
export const Y_ATE: L4 = ['Yes, I ate fish.', 'Oui, j’ai mangé du poisson.', 'Sí, comí pescado.', 'כן, אכלתי דג.'];
export const Y_GREAT: L4 = ['Yes, it was great!', 'Oui, c’était super !', '¡Sí, estuvo genial!', 'כן, היה מעולה!'];
export const Y_STAYED: L4 = ['I stayed in a hostel.', 'J’ai logé dans une auberge.', 'Me quedé en un hostal.', 'התארחתי בהוסטל.'];
export const Y_BACK: L4 = ['It was good. And you? What did you do yesterday?', 'C’était bien. Et toi ? Tu as fait quoi hier ?', 'Estuvo bien. ¿Y tú? ¿Qué hiciste ayer?', 'היה טוב. ואתה? מה עשית אתמול?'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── 🗓️ THE YESTERDAY STORY — "?" until the conversation says it ─────────────────────────────────── */

/**
 * How far the story has got, in the order the conversation tells it:
 *   0 nothing · 1 went → the old town · 2 saw → the market · 3 ate → fish · 4 it was → great ·
 *   5 (last month) stayed → a hostel.
 * A row fills only AFTER the learner has heard and answered the line that says it — never before.
 */
export const M20_STAGES = ['nothing', 'went', 'saw', 'ate', 'how', 'stayed'] as const;
export type StoryStage = 0 | 1 | 2 | 3 | 4 | 5;
/** The five parts of a "what did you do?" story — semantic ids, the same in every language. */
export type StoryPart = 'went' | 'saw' | 'ate' | 'how' | 'stayed';
export const STORY_PARTS: readonly StoryPart[] = ['went', 'saw', 'ate', 'how', 'stayed'];
const ROW: Record<StoryPart, Copy> = { went: ['📍 הלכתי', '📍 Went'], saw: ['👀 ראיתי', '👀 Saw'], ate: ['🍽️ אכלתי', '🍽️ Ate'], how: ['⭐ היה', '⭐ It was'], stayed: ['🛏️ התארחתי', '🛏️ Stayed'] };
/** What the canonical story holds, once said (app language — the meaning, never the target word). */
const CANON: Record<StoryPart, Copy> = { went: ['העיר העתיקה', 'Old Town'], saw: ['השוק', 'Market'], ate: ['דג', 'Fish'], how: ['מעולה', 'Great'], stayed: ['הוסטל', 'Hostel'] };
const FILLED_AT: Record<StoryPart, StoryStage> = { went: 1, saw: 2, ate: 3, how: 4, stayed: 5 };
const HEAD = { yesterday: ['🗓️ אתמול', '🗓️ Yesterday'], lastMonth: ['📅 חודש שעבר', '📅 Last month'], another: ['🗓️ יום אחר', '🗓️ Another day'] } as const satisfies Record<string, Copy>;

/** The story as plain serialisable data — every value null until the conversation has said it. */
export const yesterdayState = (n: StoryStage) => ({
  phase: M20_STAGES[n],
  went: n >= FILLED_AT.went ? ('old-town' as const) : null,
  saw: n >= FILLED_AT.saw ? ('market' as const) : null,
  ate: n >= FILLED_AT.ate ? ('fish' as const) : null,
  howItWas: n >= FILLED_AT.how ? ('great' as const) : null,
  stayed: n >= FILLED_AT.stayed ? ('hostel' as const) : null,
});

/** One story as the two-column board the screen draws: yesterday (four parts) ‖ last month (where you stayed). */
const storyBoard = (head: Copy, value: (p: StoryPart) => Copy | null): Copy => {
  const row = (i: 0 | 1): string => {
    const cell = (p: StoryPart): string => `${ROW[p][i]} → ${value(p)?.[i] ?? '?'}`;
    return `${head[i]}: ${(['went', 'saw', 'ate', 'how'] as const).map(cell).join(' / ')} ‖ ${HEAD.lastMonth[i]}: ${cell('stayed')}`;
  };
  return [row(0), row(1)];
};
/** The Yesterday Story at stage `n` (`yesterdayStory(0)` is all "?"). */
export const yesterdayStory = (n: StoryStage): Copy => storyBoard(HEAD.yesterday, (p) => (n >= FILLED_AT[p] ? CANON[p] : null));

/**
 * THE FINAL'S DAY — the same five parts with new details, every one verified prior in every language
 * (`learnedBefore(lang, 20)`): the centre (Missions 04–07, 12, 19), the museum (Mission 19), chicken (Mission 14),
 * a hotel (Mission 06). "Great" stays: how it was is a feeling, not a detail. It is the learner's own day — shown
 * whole, as their memory; their job is to SAY it.
 */
const ANOTHER: Record<StoryPart, Copy> = { went: ['🏙️ המרכז', '🏙️ Centre'], saw: ['🏛️ המוזיאון', '🏛️ Museum'], ate: ['🍗 עוף', '🍗 Chicken'], how: ['מעולה', 'Great'], stayed: ['🏨 מלון', '🏨 Hotel'] };
export const anotherDayStory: Copy = storyBoard(HEAD.another, (p) => ANOTHER[p]);

/** The parts of a board label, joined: the screen draws the story, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const board = (n: StoryStage, prompt: Copy): Copy => [`${yesterdayStory(n)[0]}${BOARD_SEP}${prompt[0]}`, `${yesterdayStory(n)[1]}${BOARD_SEP}${prompt[1]}`];

/** The ending — your yesterday, told; another day, told; and the friend's own day. Never a score. */
export const YESTERDAY_STORY: Copy = [
  `🗓️ סיפור של אתמול${BOARD_SEP}${yesterdayStory(5)[0]}${BOARD_SEP}סיפרת את האתמול שלך — וגם יום אחר — ושאלת בחזרה. 😴 והחבר? ישן כל היום.`,
  `🗓️ YESTERDAY STORY${BOARD_SEP}${yesterdayStory(5)[1]}${BOARD_SEP}You told your yesterday — and another day — and asked back. 😴 Your friend? Slept all day.`,
];

/* ── The tiles — semantic (the id is the meaning), captioned in the app language ────────────────── */

/** WHICH PART OF YOUR STORY? — what a question asks about (the story's own five rows). */
export const STORY_TILES: MatchTile[] = [
  { id: 'went', emoji: '📍', caption: { he: 'לאן הלכת', en: 'Where you went' } },
  { id: 'saw', emoji: '👀', caption: { he: 'מה ראית', en: 'What you saw' } },
  { id: 'ate', emoji: '🍽️', caption: { he: 'מה אכלת', en: 'What you ate' } },
  { id: 'how', emoji: '⭐', caption: { he: 'איך היה', en: 'How it was' } },
  { id: 'stayed', emoji: '🛏️', caption: { he: 'איפה התארחת', en: 'Where you stayed' } },
];
/** How was it? — good (prior), or GREAT. Two feelings, no new adjective. */
export const HOW_TILES: MatchTile[] = [
  { id: 'good', emoji: '🙂', caption: { he: 'טוב', en: 'Good' } },
  { id: 'great', emoji: '🤩', caption: { he: 'מעולה', en: 'Great' } },
];
/** And your friend's day? — only things this conversation already knows. */
export const FRIEND_TILES: MatchTile[] = [
  { id: 'slept', emoji: '😴', caption: { he: 'כלום — ישן כל היום', en: 'Nothing — slept all day' } },
  { id: 'market', emoji: '🧺', caption: { he: 'ראה את השוק', en: 'Saw the market' } },
  { id: 'fish', emoji: '🐟', caption: { he: 'אכל דג', en: 'Ate fish' } },
];

/* Learner sentence ids. */
const WENT = 'phrase.past.i-went';
const SAW = 'phrase.past.i-saw';
const ATE = 'phrase.past.i-ate';
const GREAT = 'phrase.past.it-was-great';
const STAYED = 'phrase.past.i-stayed';
const BACK = 'phrase.past.what-did-you-do';
/** What each learner sentence is said as in the conversation — the whole locked line. */
export const SAID: Record<string, L4> = { [WENT]: Y_WENT, [SAW]: Y_SAW, [ATE]: Y_ATE, [GREAT]: Y_GREAT, [STAYED]: Y_STAYED, [BACK]: Y_BACK };
/** The four production tools — the No Help run is exactly these. */
export const TOOLS = [WENT, SAW, ATE, BACK] as const;

/** The final's day, said — the same sentences with the new details (each answers the same question). */
export const FINAL_SAID: Record<typeof WENT | typeof SAW | typeof ATE | typeof STAYED, L3> = {
  [WENT]: ['I went to the centre.', 'Je suis allé au centre.', 'Fui al centro.'],
  [SAW]: ['I saw the museum.', 'J’ai vu le musée.', 'Vi el museo.'],
  [ATE]: ['Yes, I ate chicken.', 'Oui, j’ai mangé du poulet.', 'Sí, comí pollo.'],
  [STAYED]: ['I stayed in a hotel.', 'J’ai logé dans un hôtel.', 'Me quedé en un hotel.'],
};
/** The friend's line in the final, with the final's own place to stay (the same question; a hotel, not a hostel). */
export const N_GOOD_FINAL: L4 = ['A hotel! Was it good?', 'Un hôtel ! C’était bien ?', '¡Un hotel! ¿Estuvo bien?', 'מלון! היה טוב?'];

/** The small transfers in teaching — the same sentence, one other verified-prior detail each. */
export const TRANSFER = {
  went: { frame: ['I went to ___.', 'Je suis allé ___.', 'Fui ___.'] as L3, canon: ['the old town', 'dans la vieille ville', 'al casco antiguo'] as L3, other: ['the beach', 'à la plage', 'a la playa'] as L3,
    cue: { emoji: '🏖️', text: ['הפעם היית בים', 'This time you were at the beach'] as Copy }, he: ['הלכתי לעיר העתיקה.', 'הלכתי לים.'] },
  ate: { frame: ['Yes, I ate ___.', 'Oui, j’ai mangé ___.', 'Sí, comí ___.'] as L3, canon: ['fish', 'du poisson', 'pescado'] as L3, other: ['chicken', 'du poulet', 'pollo'] as L3,
    cue: { emoji: '🍗', text: ['הפעם אכלת עוף', 'This time you ate chicken'] as Copy }, he: ['כן, אכלתי דג.', 'כן, אכלתי עוף.'] },
  stayed: { frame: ['I stayed in ___.', 'J’ai logé dans ___.', 'Me quedé en ___.'] as L3, canon: ['a hostel', 'une auberge', 'un hostal'] as L3, other: ['a hotel', 'un hôtel', 'un hotel'] as L3,
    cue: { emoji: '🏨', text: ['הפעם התארחת במלון', 'This time you stayed in a hotel'] as Copy }, he: ['התארחתי בהוסטל.', 'התארחתי במלון.'] },
} as const;

export function m20Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M20Slot) => ({ line: true, key, t: l3(line), meaning, ...look20(M20_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  // Every option is one of the learner's own locked lines, said whole — or, in the final, the same line with the final's details.
  const say = (id: string, ok: boolean) => [id, ok, l3(SAID[id]!)] as const;
  const fin = (id: keyof typeof FINAL_SAID, ok: boolean) => [id, ok, FINAL_SAID[id]] as const;
  // The fourth tool, retrieved ALONE: "What did you do yesterday?" — the reusable question, not the whole locked line
  // (no text override: the button says the sentence itself). Only the conversation keeps "It was good. And you? …".
  // Its wrong options never start with "Yes": the right answer no longer answers "Was it good?", so a "Yes, …" line would be a trap.
  const ask = (ok: boolean) => [BACK, ok] as const;
  // WHICH PART OF YOUR STORY? — a question is played; the learner taps the part it asks about.
  // A set of meanings, not a scale: the tiles are shuffled and follow the page's direction (a left-to-right
  // "ordered" row would put the story's first part on the far left of a Hebrew screen).
  const which = (n: StoryStage, audio: L4, part: StoryPart): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true,
    label: board(n, ['🧩 על איזה חלק בסיפור החבר שואל? שמע — והקש.', '🧩 Which part of your story is your friend asking about? Listen — and tap.']),
    tiles: STORY_TILES, rounds: [{ audio, correct: part }],
  });
  const transfer = (t: (typeof TRANSFER)[keyof typeof TRANSFER], itemId: string, label: Copy): BootcampStep => k.practice({
    kind: 'swap', label,
    rounds: [{ frame: t.frame, itemId, cue: { emoji: t.cue.emoji, text: t.cue.text }, options: [[t.canon, t.he[0], false], [t.other, t.he[1], true]] }],
  });
  return [
    // WHERE WERE YOU? — the place (📍). One whole answer: I went to ___.
    cards(['איפה היית?', 'Where were you?'], board(0, ['החבר שואל על אתמול. הקש כדי לשמוע.', 'Your friend asks about yesterday. Tap to hear.']), [
      card('past.line.where', N_WHERE, ['היי! איפה היית אתמול? (📍 שואלים על מקום — לאן הלכת)', 'Hey! Where were you yesterday? (📍 a question about a place — where you went)'], 'chat'),
      card('past.line.went', Y_WENT, ['הלכתי לעיר העתיקה. (הלכתי ל___ — המקום שהלכת אליו)', 'I went to the old town. (I went to ___ — the place you went to)'], 'old-town'),
    ]),
    which(0, N_WHERE, 'went'),
    // WHAT DID YOU SEE? — the thing (👀). I saw ___.
    cards(['מה ראית?', 'What did you see?'], board(1, ['ומה ראית שם? הקש כדי לשמוע.', 'And what did you see there? Tap to hear.']), [
      card('past.line.see', N_SEE, ['יפה! מה ראית? (👀 שואלים מה ראית)', 'Nice! What did you see? (👀 a question about what you saw)'], 'chat'),
      card('past.line.saw', Y_SAW, ['ראיתי את השוק. (ראיתי ___ — מה שראית)', 'I saw the market. (I saw ___ — what you saw)'], 'market'),
    ]),
    k.practice({ kind: 'quickReply', label: board(1, ['החבר שואל — מה אתה עונה?', 'Your friend asks — what do you answer?']), rounds: [
      { prompt: 'reply.past.where-were-you', options: [say(WENT, true), say(SAW, false)] },
      { prompt: 'reply.past.what-did-you-see', options: [say(SAW, true), say(WENT, false)] },
    ] }),
    // THE SAME SENTENCE, ANOTHER PLACE — the beach (verified prior), nothing new.
    transfer(TRANSFER.went, WENT, ['אותו משפט — מקום אחר.', 'The same sentence — another place.']),
    // DID YOU EAT THERE? — the food (🍽️). I ate ___.
    cards(['אכלת שם?', 'Did you eat there?'], board(2, ['ואוכל? הקש כדי לשמוע.', 'And food? Tap to hear.']), [
      card('past.line.eat', N_EAT, ['אכלת שם? (🍽️ אוכל — באותו מקום)', 'Did you eat there? (🍽️ food — at that place)'], 'meal'),
      card('past.line.ate', Y_ATE, ['כן, אכלתי דג. (אכלתי ___ — מה שאכלת)', 'Yes, I ate fish. (I ate ___ — what you ate)'], 'meal'),
    ]),
    k.practice({ kind: 'quickReply', label: board(2, ['מה אתה עונה?', 'What do you answer?']), rounds: [
      { prompt: 'reply.past.did-you-eat', options: [say(ATE, true), say(SAW, false), say(WENT, false)] },
    ] }),
    transfer(TRANSFER.ate, ATE, ['אותו משפט — אוכל אחר.', 'The same sentence — other food.']),
    // DID YOU LIKE IT? — how it was (⭐): great, not just good.
    cards(['איך היה?', 'How was it?'], board(3, ['החבר שואל איך היה. הקש כדי לשמוע.', 'Your friend asks how it was. Tap to hear.']), [
      card('past.line.like', N_LIKE, ['אהבת? (⭐ איך היה?)', 'Did you like it? (⭐ how was it?)'], 'chat'),
      card('past.line.great', Y_GREAT, ['כן, היה מעולה! (🤩 מעולה — יותר מטוב)', 'Yes, it was great! (🤩 great — better than good)'], 'chat'),
    ]),
    k.practice({ kind: 'visualMatch', quiet: true, ordered: true, label: board(3, ['איך היה? שמע — והקש.', 'How was it? Listen — and tap.']), tiles: HOW_TILES, rounds: [{ audio: Y_GREAT, correct: 'great' }] }),
    // LAST MONTH — another time, and another "where": where you STAYED (🛏️), not where you went (📍).
    cards(['חודש שעבר', 'Last month'], board(4, ['עכשיו החבר שואל על חודש שעבר. הקש כדי לשמוע.', 'Now your friend asks about last month. Tap to hear.']), [
      card('past.line.stay', N_STAY, ['היית בארגנטינה בחודש שעבר, נכון? איפה התארחת? (📅 חודש שעבר · 🛏️ המקום שבו התארחת בטיול — לא לאן הלכת)', 'You were in Argentina last month, right? Where did you stay? (📅 last month · 🛏️ your place on that trip — not where you went)'], 'hostel'),
      card('past.line.stayed', Y_STAYED, ['התארחתי בהוסטל. (התארחתי ב___ — המקום שלך בטיול)', 'I stayed in a hostel. (I stayed in ___ — your place on that trip)'], 'hostel'),
    ]),
    which(4, N_STAY, 'stayed'),
    transfer(TRANSFER.stayed, STAYED, ['אותו משפט — מקום לינה אחר.', 'The same sentence — another place to stay.']),
    // WAS IT GOOD? — answer, and turn the conversation back.
    cards(['ואתה?', 'And you?'], board(5, ['ענית על הכל. עכשיו — לשאול בחזרה. הקש כדי לשמוע.', 'You have answered it all. Now — ask back. Tap to hear.']), [
      card('past.line.good', N_GOOD, ['הוסטל! היה טוב? (איך היה שם?)', 'A hostel! Was it good? (how was it there?)'], 'hostel'),
      card('past.line.back', Y_BACK, ['היה טוב. ואתה? מה עשית אתמול? (ענית — ועכשיו שואלים בחזרה: „מה עשית אתמול?” — שאלה לכל אחד)', 'It was good. And you? What did you do yesterday? (you answered — now ask back: “What did you do yesterday?” works with anyone)'], 'chat'),
    ]),
    k.practice({ kind: 'quickReply', label: board(5, ['היה טוב — ועכשיו תורך: שאל את החבר על האתמול שלו.', 'It was good — now your turn: ask your friend about their yesterday.']), rounds: [
      { prompt: 'reply.past.was-it-good', options: [ask(true), say(SAW, false), say(STAYED, false)] },
    ] }),
    // THE FRIEND'S DAY — one comprehension moment, no deck.
    cards(['והחבר?', 'And your friend?'], board(5, ['עכשיו החבר מספר. הקש כדי לשמוע.', 'Now your friend tells. Tap to hear.']), [
      card('past.line.end', N_END, ['אני? כלום! הייתי עייף. ישנתי כל היום. (😴 לא עשה כלום — היה עייף וישן)', 'Me? Nothing! I was tired. I slept all day. (😴 did nothing — tired, slept all day)'], 'friend-day'),
    ]),
    k.practice({ kind: 'visualMatch', quiet: true, label: board(5, ['מה החבר עשה אתמול? שמע — והקש.', 'What did your friend do yesterday? Listen — and tap.']), tiles: FRIEND_TILES, rounds: [{ audio: N_END, correct: 'slept' }] }),
    k.receipt(board(5, ['הסיפור שלך מאתמול — ושאלת בחזרה.', 'Your yesterday story — and you asked back.'])),
    // THE CONVERSATION — once, supported (translations on).
    k.dialogue('what-did-you-do'),
    k.receipt(['כל השיחה — אתמול, חודש שעבר, ושאלת בחזרה.', 'The whole conversation — yesterday, last month, and you asked back.']),
    // NO HELP — the four tools at a friend's pace: no meaning, no cards, no story.
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { prompt: 'reply.past.where-were-you', options: [say(WENT, true), say(SAW, false), say(STAYED, false)] },
      { prompt: 'reply.past.what-did-you-see', options: [say(SAW, true), say(WENT, false), say(ATE, false)] },
      { prompt: 'reply.past.did-you-eat', options: [say(ATE, true), say(SAW, false), say(STAYED, false)] },
      { prompt: 'reply.past.was-it-good', options: [ask(true), say(SAW, false), say(WENT, false)] },
    ] }),
    k.receipt(['בלי עזרה — לאן הלכת, מה ראית, מה אכלת, ושאלת בחזרה.', 'No help — where you went, what you saw, what you ate, and you asked back.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: ANOTHER day — the same questions, new details. Not the conversation again.
    k.practice({ kind: 'quickReply', label: [`${anotherDayStory[0]}${BOARD_SEP}🎯 יום אחר — אותן שאלות. ספר לחבר.`, `${anotherDayStory[1]}${BOARD_SEP}🎯 Another day — the same questions. Tell your friend.`], rounds: [
      { prompt: 'reply.past.where-were-you', options: [fin(WENT, true), fin(SAW, false), fin(STAYED, false)] },
      { prompt: 'reply.past.what-did-you-see', options: [fin(SAW, true), fin(WENT, false), fin(ATE, false)] },
      { prompt: 'reply.past.did-you-eat', options: [fin(ATE, true), fin(SAW, false), fin(STAYED, false)] },
      { prompt: 'reply.past.did-you-like', options: [say(GREAT, true), fin(WENT, false), fin(ATE, false)] },
      { prompt: 'reply.past.where-did-you-stay', options: [fin(STAYED, true), fin(WENT, false), fin(ATE, false)] },
      { npc: N_GOOD_FINAL, options: [ask(true), fin(SAW, false), fin(WENT, false)] },
    ] }),
    k.receipt(YESTERDAY_STORY),
    { kind: 'summary' },
  ];
}
