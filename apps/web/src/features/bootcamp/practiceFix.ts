import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 22 — Fixing Problems: NOTICE → EXPLAIN → ASK FOR A FIX. SHORT, PRACTICAL, GAME-LIKE — defined ONCE for
 * English, French and Spanish. Two locked scenes (`core/fixingProblems.ts`), ONE skill: four problems (a wrong
 * meal, a double charge, the air conditioning, a noisy room) are four examples of the same system.
 *
 *   the briefing → 🧰 FIX IT (the learner's own problems, shown from the start; every solution "?" until heard) →
 *   🍽️ the wrong meal: "This isn't what I ordered." → what did you order? (the pasta) → the bill: "I think there's a
 *   mistake." → charged twice → WHAT DID THEY DO? (the right meal · the money back · a free dessert) → 🏨 another
 *   place, the same skill: a problem with the room → "The air conditioning isn't working." → the same tool, another
 *   thing (the key) → "Can you fix it?" → noisy → "Can I change rooms?" → WHAT DID THEY DO? (someone comes · another
 *   room) → both conversations (once each, supported) → no help (4) → the video → the final: NEW PROBLEMS (5) →
 *   🧰 FIX IT.
 *
 * Rules kept here:
 *   - four production tools: This isn't what I ordered. · I think there's a mistake. · ___ isn't working. · Can you
 *     fix it? — "Can I change rooms?" gets ONE meaningful retrieval (sometimes the fix is an alternative); "I ordered
 *     the pasta", "I was charged twice", "There's a problem with my room", "My room is very noisy" are secondary —
 *     a card and the conversation; "No problem, thank you." is verified prior — the conversation carries it;
 *   - the staff's solutions are COMPREHENSION: one "what did they do?" board per place, never a production drill;
 *   - no grammar: no past tense, no passive, no "can", no "isn't", no comparative, no "I'll", no builder, no Flex;
 *   - the transfer is verified prior (`learnedBefore(lang, 22)`): the key (Missions 04, 08), chicken (Mission 14),
 *     fish (Mission 20), room 204 (Mission 08) — no new object comes with it.
 *
 * Coverage: `mission22Coverage.ts`, enforced by `mission22.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * Artwork: pending (docs/MISSION22_ASSET_MANIFEST.md — VISUAL PRODUCTION REQUIRED IN ASTRA PASS). Semantic emoji
 * stand in. No picture may carry a solution before the staff say it (the right meal, the refund, the dessert, the
 * technician, the quieter room, room 305, the new key), and no exact data (a room number, an amount) is artwork.
 */
type M22Slot = 'restaurant-problem' | 'wrong-meal' | 'bill-error' | 'hotel-problem' | 'ac-not-working' | 'noisy-room' | 'solution';
export const M22_SLOTS: Record<M22Slot, { emoji: string; image?: string }> = {
  'restaurant-problem': { emoji: '🍽️' },
  'wrong-meal': { emoji: '🥩' },
  'bill-error': { emoji: '🧾' },
  'hotel-problem': { emoji: '🏨' },
  'ac-not-working': { emoji: '❄️' },
  'noisy-room': { emoji: '🔊' },
  solution: { emoji: '🛠️' },
};
/** Result picture only — never a choice, never a card. */
export const M22_PROPS: Record<'fix-it', { emoji: string; image?: string }> = {
  'fix-it': { emoji: '🧰' },
};
const look22 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/* The locked conversations (EN · FR · ES · HE support), line by line — the staff's lines… */
export const N_MEAL: L4 = ["Here's your meal — one steak!", 'Voici votre plat — un steak !', 'Aquí tiene su plato — ¡un filete!', 'הנה הארוחה שלך — סטייק אחד!'];
export const N_WHAT_ORDER: L4 = ["Oh no, I'm so sorry! What did you order?", 'Oh non, je suis vraiment désolé ! Qu’avez-vous commandé ?', '¡Ay, lo siento muchísimo! ¿Qué pidió?', 'אוי לא, אני מצטער מאוד! מה הזמנת?'];
export const N_BRING: L4 = ["Of course — I'll bring the right one right away.", 'Bien sûr — je vous apporte le bon tout de suite.', 'Claro — le traigo el correcto enseguida.', 'כמובן — אביא את הנכון מיד.'];
export const N_BILL: L4 = ["Here's your bill.", 'Voici l’addition.', 'Aquí tiene la cuenta.', 'הנה החשבון.'];
export const N_CHECK: L4 = ["Let me check the bill. What's the problem?", 'Laissez-moi vérifier l’addition. Quel est le problème ?', 'Déjeme revisar la cuenta. ¿Cuál es el problema?', 'תן לי לבדוק את החשבון. מה הבעיה?'];
export const N_REFUND: L4 = ["You're right — my mistake. I'll refund it now.", 'Vous avez raison — c’est ma faute. Je vous rembourse tout de suite.', 'Tiene razón — es culpa mía. Le hago el reembolso ahora mismo.', 'אתה צודק — הטעות שלי. אחזיר לך עכשיו.'];
export const N_DESSERT: L4 = ['Thank you for your patience. Dessert is on the house!', 'Merci de votre patience. Le dessert est offert par la maison !', 'Gracias por su paciencia. ¡El postre corre por cuenta de la casa!', 'תודה על הסבלנות. הקינוח על חשבון הבית!'];
export const N_HELP: L4 = ['Good evening! How can I help you?', 'Bonsoir ! Comment puis-je vous aider ?', '¡Buenas noches! ¿En qué puedo ayudarle?', 'ערב טוב! איך אפשר לעזור?'];
export const N_WHATS_PROBLEM: L4 = ["I'm sorry to hear that. What's the problem?", 'Je suis désolé. Quel est le problème ?', 'Lo siento. ¿Cuál es el problema?', 'אני מצטער לשמוע. מה הבעיה?'];
export const N_SO_SORRY: L4 = ["I'm so sorry about that.", 'Je suis vraiment désolé.', 'Lo siento muchísimo.', 'אני מצטער על זה מאוד.'];
export const N_SEND: L4 = ["Yes, I'll send someone right away. Is everything else okay?", 'Oui, j’envoie quelqu’un tout de suite. Tout le reste va bien ?', 'Sí, mando a alguien ahora mismo. ¿Todo lo demás está bien?', 'כן, אשלח מישהו מיד. כל השאר בסדר?'];
export const N_QUIETER: L4 = ['I understand. We have a quieter room.', 'Je comprends. Nous avons une chambre plus calme.', 'Lo entiendo. Tenemos una habitación más tranquila.', 'אני מבין. יש לנו חדר שקט יותר.'];
export const N_NEW_KEY: L4 = ['Of course — room 305. Here is your new key. Good night!', 'Bien sûr — chambre 305. Voici votre nouvelle clé. Bonne nuit !', 'Claro — habitación 305. Aquí tiene su nueva llave. ¡Buenas noches!', 'כמובן — חדר 305. הנה המפתח החדש. לילה טוב!'];
/* …and the traveller's, as said. */
export const Y_NOT_ORDERED: L4 = ["This isn't what I ordered.", 'Ce n’est pas ce que j’ai commandé.', 'Esto no es lo que pedí.', 'זה לא מה שהזמנתי.'];
export const Y_I_ORDERED: L4 = ['I ordered the pasta.', 'J’ai commandé les pâtes.', 'Pedí la pasta.', 'הזמנתי את הפסטה.'];
export const Y_MISTAKE: L4 = ["I think there's a mistake.", 'Je crois qu’il y a une erreur.', 'Creo que hay un error.', 'אני חושב שיש טעות.'];
export const Y_CHARGED: L4 = ['I was charged twice.', 'On m’a facturé deux fois.', 'Me han cobrado dos veces.', 'חייבו אותי פעמיים.'];
export const Y_NO_PROBLEM: L4 = ['No problem, thank you.', 'Pas de problème, merci.', 'No pasa nada, gracias.', 'אין בעיה, תודה.'];
export const Y_ROOM_PROBLEM: L4 = ["There's a problem with my room.", 'Il y a un problème avec ma chambre.', 'Hay un problema con mi habitación.', 'יש בעיה בחדר שלי.'];
export const Y_AC: L4 = ["The air conditioning isn't working.", 'La climatisation ne marche pas.', 'El aire acondicionado no funciona.', 'המזגן לא עובד.'];
export const Y_FIX: L4 = ['Can you fix it?', 'Vous pouvez arranger ça ?', '¿Lo puede arreglar?', 'אפשר לתקן את זה?'];
export const Y_NOISY: L4 = ['No. My room is very noisy.', 'Non. Ma chambre est très bruyante.', 'No. Mi habitación es muy ruidosa.', 'לא. החדר שלי מאוד רועש.'];
export const Y_CHANGE: L4 = ['Can I change rooms?', 'Je peux changer de chambre ?', '¿Puedo cambiar de habitación?', 'אפשר להחליף חדר?'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── 🧰 FIX IT — the learner's own problems; each one: ⚠️ → 🗣️ explained → ✅ the solution, once understood ── */

export type Problem = 'meal' | 'bill' | 'ac' | 'noise';
export const PROBLEMS: readonly Problem[] = ['meal', 'bill', 'ac', 'noise'];
/** Where each problem stands: not said yet · explained (the learner said it) · solved (the staff's solution understood). */
export type ProblemState = 'open' | 'explained' | 'solved';
export type FixState = Record<Problem, ProblemState>;
const HEAD = { restaurant: ['🍽️ מסעדה', '🍽️ Restaurant'], hotel: ['🏨 מלון', '🏨 Hotel'] } as const satisfies Record<string, Copy>;
/** The problem itself — the learner's own fact (app language), shown from the start. */
const WHAT: Record<Problem, Copy> = { meal: ['הזמנת 🍝, קיבלת 🥩', 'Ordered 🍝, got 🥩'], bill: ['💳 חויבת פעמיים', '💳 Charged twice'], ac: ['❄️ המזגן לא עובד', '❄️ AC not working'], noise: ['🔊 החדר רועש', '🔊 Noisy room'] };
/** The staff's solution — only ever on the board once it has been heard AND understood. */
const SOLVED: Record<Problem, Copy> = { meal: ['✅ המנה הנכונה', '✅ The right meal'], bill: ['✅ הכסף חזר + 🍰', '✅ Money back + 🍰'], ac: ['✅ מישהו בא לתקן', '✅ Someone is coming'], noise: ['✅ חדר 305', '✅ Room 305'] };
const STATE: Record<Exclude<ProblemState, 'solved'>, Copy> = { open: ['⚠️ ?', '⚠️ ?'], explained: ['🗣️ ?', '🗣️ ?'] };

/** The board as plain serialisable data — the solutions null until understood. */
export const fixState = (s: FixState) => ({
  problems: { meal: { ordered: 'pasta', got: 'steak' }, bill: 'charged-twice', ac: 'not-working', noise: 'noisy' } as const,
  state: { ...s },
  solutions: {
    meal: s.meal === 'solved' ? ('right-meal' as const) : null,
    bill: s.bill === 'solved' ? ('refund+dessert' as const) : null,
    ac: s.ac === 'solved' ? ('someone-coming' as const) : null,
    noise: s.noise === 'solved' ? ('room-305' as const) : null,
  },
});

/** FIX IT at a given state, as the two-column board the screen draws: the restaurant ‖ the hotel. */
export const fixIt = (s: FixState): Copy => {
  const side = (i: 0 | 1): string => {
    const cell = (p: Problem): string => `${p === 'meal' ? '🍽️ ' : ''}${WHAT[p][i]} → ${s[p] === 'solved' ? SOLVED[p][i] : STATE[s[p]][i]}`;
    return `${HEAD.restaurant[i]}: ${cell('meal')} / ${cell('bill')} ‖ ${HEAD.hotel[i]}: ${cell('ac')} / ${cell('noise')}`;
  };
  return [side(0), side(1)];
};
const at = (meal: ProblemState, bill: ProblemState, ac: ProblemState, noise: ProblemState): FixState => ({ meal, bill, ac, noise });
/** The states the mission passes through, in order. */
export const FIX_STAGES = {
  start: at('open', 'open', 'open', 'open'),
  meal: at('explained', 'open', 'open', 'open'),
  bill: at('explained', 'explained', 'open', 'open'),
  restaurant: at('solved', 'solved', 'open', 'open'),
  ac: at('solved', 'solved', 'explained', 'open'),
  noise: at('solved', 'solved', 'explained', 'explained'),
  done: at('solved', 'solved', 'solved', 'solved'),
} as const;

/** The parts of a board label, joined: the screen draws the board, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const board = (s: FixState, prompt: Copy): Copy => [`🧰 לתקן את זה${BOARD_SEP}${fixIt(s)[0]}${BOARD_SEP}${prompt[0]}`, `🧰 FIX IT${BOARD_SEP}${fixIt(s)[1]}${BOARD_SEP}${prompt[1]}`];

/**
 * NEW PROBLEMS — the final: another evening, the same functions, every changed detail verified prior in every
 * language (`learnedBefore(lang, 22)`): you ordered chicken (Mission 14) and got fish (Mission 20); the key (Missions
 * 04, 08) isn't working; the new key is for room 204 (Mission 08) — but your room is 305. The learner's own facts —
 * shown whole; their job is to SAY what's wrong and ask for the fix.
 */
export const newProblems: Copy = [
  `${HEAD.restaurant[0]}: 🍽️ הזמנת 🍗, קיבלת 🐟 → ⚠️ ? ‖ ${HEAD.hotel[0]}: 🔑 המפתח לא עובד → ⚠️ ? / 🚪 החדר שלך → 305`,
  `${HEAD.restaurant[1]}: 🍽️ Ordered 🍗, got 🐟 → ⚠️ ? ‖ ${HEAD.hotel[1]}: 🔑 Key not working → ⚠️ ? / 🚪 Your room → 305`,
];

/** The ending — every problem fixed; and new ones handled. Never a score. */
export const FIX_IT: Copy = [
  `🧰 לתקן את זה${BOARD_SEP}${fixIt(FIX_STAGES.done)[0]}${BOARD_SEP}ארבע בעיות — אמרת מה הבעיה, ביקשת פתרון, והבנת מה עשו. וגם בעיות חדשות.`,
  `🧰 FIX IT${BOARD_SEP}${fixIt(FIX_STAGES.done)[1]}${BOARD_SEP}Four problems — you said what was wrong, asked for a fix, and understood what they did. New ones too.`,
];

/* ── The tiles — semantic (the id is the meaning), captioned in the app language ────────────────── */

/** WHAT DID THEY DO? — the first fix, right after it is heard: the right meal, or you keep the steak (nothing later shown). */
export const MEAL_TILES: MatchTile[] = [
  { id: 'right-meal', emoji: '🍝', caption: { he: 'מביאים את המנה הנכונה', en: 'They bring the right meal' } },
  { id: 'keep', emoji: '🥩', caption: { he: 'נשארים עם הסטייק', en: 'You keep the steak' } },
];
/** WHAT DID THEY DO? — at the restaurant: only the restaurant's outcomes (no hotel solution shown early). */
export const RESTAURANT_TILES: MatchTile[] = [
  { id: 'right-meal', emoji: '🍝', caption: { he: 'מביאים את המנה הנכונה', en: 'They bring the right meal' } },
  { id: 'refund', emoji: '💰', caption: { he: 'מחזירים את הכסף', en: 'You get the money back' } },
  { id: 'dessert', emoji: '🍰', caption: { he: 'קינוח בחינם', en: 'A free dessert' } },
];
/** WHAT DID THEY DO? — at the hotel (with the restaurant's money back as the known other kind of fix). */
export const HOTEL_TILES: MatchTile[] = [
  { id: 'someone', emoji: '👨‍🔧', caption: { he: 'שולחים מישהו לתקן', en: 'Someone comes to fix it' } },
  { id: 'new-room', emoji: '🔑', caption: { he: 'חדר אחר ומפתח חדש', en: 'Another room, a new key' } },
  { id: 'refund', emoji: '💰', caption: { he: 'מחזירים את הכסף', en: 'You get the money back' } },
];

/* Learner sentence ids — five are reused by later checkpoints (24, 28, 30) and keep their id and wording. */
const NOT_ORDERED = 'phrase.fix.not-ordered';
const I_ORDERED = 'phrase.fix.i-ordered';
const MISTAKE = 'phrase.fix.theres-mistake';
const CHARGED = 'phrase.fix.charged-twice';
const NO_PROBLEM = 'phrase.fix.no-problem-thanks';
const ROOM_PROBLEM = 'phrase.fix.theres-problem';
const AC = 'phrase.hotelreq.ac-not-working';
const FIX = 'phrase.fix.can-you-fix';
const NOISY = 'phrase.hotelreq.room-noisy';
const CHANGE = 'phrase.fix.change-rooms';
/** What each learner sentence is said as in the conversations — the whole locked line. */
export const SAID: Record<string, L4> = {
  [NOT_ORDERED]: Y_NOT_ORDERED, [I_ORDERED]: Y_I_ORDERED, [MISTAKE]: Y_MISTAKE, [CHARGED]: Y_CHARGED, [NO_PROBLEM]: Y_NO_PROBLEM,
  [ROOM_PROBLEM]: Y_ROOM_PROBLEM, [AC]: Y_AC, [FIX]: Y_FIX, [NOISY]: Y_NOISY, [CHANGE]: Y_CHANGE,
};
/** The four production tools — the No Help run is exactly these. */
export const TOOLS = [NOT_ORDERED, MISTAKE, AC, FIX] as const;

/** ___ isn't working: the same tool, another thing — the key (verified prior: Missions 04, 08). */
export const NOT_WORKING = {
  frame: ["___ isn't working.", '___ ne marche pas.', '___ no funciona.'] as L3,
  canon: ['The air conditioning', 'La climatisation', 'El aire acondicionado'] as L3,
  other: ['The key', 'La clé', 'La llave'] as L3,
  cue: { emoji: '🔑', text: ['הפעם: המפתח', 'This time: the key'] as Copy },
  he: ['המזגן לא עובד.', 'המפתח לא עובד.'] as const,
};
/** The final's new problems, said — the same sentences with the new details. */
export const FINAL_SAID = {
  [I_ORDERED]: ['I ordered the chicken.', 'J’ai commandé le poulet.', 'Pedí el pollo.'] as L3,
  [AC]: ["The key isn't working.", 'La clé ne marche pas.', 'La llave no funciona.'] as L3,
};
/** The staff's lines in the final, with the final's own details (each a known frame, verified-prior words). */
export const N_FISH: L4 = ["Here's your fish!", 'Voici votre poisson !', 'Aquí tiene su pescado.', 'הנה הדג שלך!'];
export const N_KEY_204: L4 = ['Here is your new key — room two-oh-four.', 'Voici votre nouvelle clé — chambre deux cent quatre.', 'Aquí tiene su nueva llave — habitación doscientos cuatro.', 'הנה המפתח החדש שלך — חדר מאתיים וארבע.'];

export function m22Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M22Slot) => ({ line: true, key, t: l3(line), meaning, ...look22(M22_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  // Every option is one of the learner's own lines, said whole — or, in the final, the same line with the final's detail.
  const say = (id: string, ok: boolean) => [id, ok, l3(SAID[id]!)] as const;
  const fin = (id: keyof typeof FINAL_SAID, ok: boolean) => [id, ok, FINAL_SAID[id]] as const;
  // WHAT DID THEY DO? — a staff line is played; the learner taps the kind of solution. A set of meanings, shuffled.
  const solved = (s: FixState, tiles: MatchTile[], rounds: { audio: L4; correct: string }[]): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true,
    label: board(s, ['🛠️ מה הם עשו? שמע — והקש.', '🛠️ What did they do? Listen — and tap.']),
    tiles, rounds,
  });
  const S = FIX_STAGES;
  return [
    // 🍽️ THE WRONG MEAL — you ordered pasta, you got steak (your own facts, on the board).
    cards(['מנה לא נכונה', 'The wrong meal'], board(S.start, ['🍽️ במסעדה. המנה מגיעה — הקש כדי לשמוע.', '🍽️ At the restaurant. Your meal arrives — tap to hear.']), [
      card('fix.line.meal', N_MEAL, ['הנה הארוחה שלך — סטייק אחד! (🥩 — אבל הזמנת פסטה)', 'Here’s your meal — one steak! (🥩 — but you ordered pasta)'], 'wrong-meal'),
      card('fix.line.not-ordered', Y_NOT_ORDERED, ['זה לא מה שהזמנתי. (קיבלת משהו אחר — לכל דבר: מנה, משקה, כרטיס)', 'This isn’t what I ordered. (you got something else — any thing: a meal, a drink, a ticket)'], 'restaurant-problem'),
    ]),
    k.practice({ kind: 'quickReply', label: board(S.start, ['מה אתה אומר?', 'What do you say?']), rounds: [
      { prompt: 'reply.fix.meal', options: [say(NOT_ORDERED, true), say(NO_PROBLEM, false)] },
    ] }),
    // What did you order? — the pasta (secondary: a card and the conversation) — and the fix, heard.
    cards(['מה הזמנת?', 'What did you order?'], board(S.meal, ['המלצר שואל — ומתקן. הקש כדי לשמוע.', 'The waiter asks — and fixes it. Tap to hear.']), [
      card('fix.line.what-order', N_WHAT_ORDER, ['אוי לא, אני מצטער מאוד! מה הזמנת? (שואלים מה ביקשת)', 'Oh no, I’m so sorry! What did you order? (a question about what you asked for)'], 'restaurant-problem'),
      card('fix.line.i-ordered', Y_I_ORDERED, ['הזמנתי את הפסטה. (מה שביקשת)', 'I ordered the pasta. (what you asked for)'], 'restaurant-problem'),
      card('fix.line.bring', N_BRING, ['כמובן — אביא את הנכון מיד. (🍝 מביאים את המנה הנכונה)', 'Of course — I’ll bring the right one right away. (🍝 they bring the right meal)'], 'solution'),
    ]),
    solved(S.meal, MEAL_TILES, [{ audio: N_BRING, correct: 'right-meal' }]),
    // THE BILL — "Later…": something is wrong here too — and what's the problem? Charged twice (secondary).
    cards(['החשבון', 'The bill'], board(S.meal, ['מאוחר יותר… החשבון. הקש כדי לשמוע.', 'Later… the bill. Tap to hear.']), [
      card('fix.line.bill', N_BILL, ['הנה החשבון. (💳 — אבל חייבו אותך פעמיים)', 'Here’s your bill. (💳 — but you were charged twice)'], 'bill-error'),
      card('fix.line.mistake', Y_MISTAKE, ['אני חושב שיש טעות. (משהו לא נכון כאן — בחשבון, בכרטיס, בחדר)', 'I think there’s a mistake. (something is wrong here — a bill, a ticket, a room)'], 'bill-error'),
      card('fix.line.check', N_CHECK, ['תן לי לבדוק את החשבון. מה הבעיה? (שואלים מה לא בסדר)', 'Let me check the bill. What’s the problem? (a question about what is wrong)'], 'bill-error'),
      card('fix.line.charged', Y_CHARGED, ['חייבו אותי פעמיים. (💳💳 שילמת פעמיים)', 'I was charged twice. (💳💳 you paid two times)'], 'bill-error'),
    ]),
    k.practice({ kind: 'quickReply', label: board(S.meal, ['מה אתה אומר?', 'What do you say?']), rounds: [
      { prompt: 'reply.fix.bill', options: [say(MISTAKE, true), say(NO_PROBLEM, false), say(I_ORDERED, false)] },
      { prompt: 'reply.fix.check-the-bill', options: [say(CHARGED, true), say(I_ORDERED, false), say(NOT_ORDERED, false)] },
    ] }),
    // …and the fix, heard.
    cards(['הפתרון', 'The fix'], board(S.bill, ['המלצר מתקן. הקש כדי לשמוע.', 'The waiter fixes it. Tap to hear.']), [
      card('fix.line.refund', N_REFUND, ['אתה צודק — הטעות שלי. אחזיר לך עכשיו. (💰 הכסף חוזר אליך)', 'You’re right — my mistake. I’ll refund it now. (💰 you get the money back)'], 'solution'),
      card('fix.line.dessert', N_DESSERT, ['תודה על הסבלנות. הקינוח על חשבון הבית! (🍰 קינוח בחינם)', 'Thank you for your patience. Dessert is on the house! (🍰 a free dessert)'], 'solution'),
    ]),
    solved(S.bill, RESTAURANT_TILES, [{ audio: N_REFUND, correct: 'refund' }, { audio: N_DESSERT, correct: 'dessert' }]),
    // 🏨 THE HOTEL — another place, the same skill.
    cards(['🏨 מלון — אותה מיומנות', '🏨 The hotel — the same skill'], board(S.restaurant, ['🏨 מקום אחר — אותה מיומנות: אומרים מה הבעיה ומבקשים פתרון. הקש כדי לשמוע.', '🏨 Another place — the same skill: say what’s wrong, ask for a fix. Tap to hear.']), [
      card('fix.line.room-problem', Y_ROOM_PROBLEM, ['יש בעיה בחדר שלי. (פותח — לפני שמסבירים)', 'There’s a problem with my room. (an opener — before you explain)'], 'hotel-problem'),
      card('fix.line.whats-problem', N_WHATS_PROBLEM, ['אני מצטער לשמוע. מה הבעיה? (שואלים מה לא בסדר)', 'I’m sorry to hear that. What’s the problem? (a question about what is wrong)'], 'hotel-problem'),
      card('fix.line.ac', Y_AC, ['המזגן לא עובד. (___ לא עובד — כל דבר שמתקלקל)', 'The air conditioning isn’t working. (___ isn’t working — anything that breaks)'], 'ac-not-working'),
    ]),
    k.practice({ kind: 'quickReply', label: board(S.restaurant, ['מה אתה אומר?', 'What do you say?']), rounds: [
      { prompt: 'reply.fix.whats-the-problem', options: [say(AC, true), say(CHARGED, false), say(I_ORDERED, false)] },
    ] }),
    // ___ isn't working — the same tool, another thing: the key.
    k.practice({
      kind: 'swap', label: board(S.ac, ['אותו משפט — דבר אחר.', 'The same sentence — another thing.']),
      rounds: [{ frame: NOT_WORKING.frame, itemId: AC, cue: NOT_WORKING.cue, options: [[NOT_WORKING.canon, NOT_WORKING.he[0], false], [NOT_WORKING.other, NOT_WORKING.he[1], true]] }],
    }),
    // CAN YOU FIX IT? — ask for the solution.
    cards(['אפשר לתקן?', 'Can you fix it?'], board(S.ac, ['ועכשיו — מבקשים פתרון. הקש כדי לשמוע.', 'Now — ask for a fix. Tap to hear.']), [
      card('fix.line.so-sorry', N_SO_SORRY, ['אני מצטער על זה מאוד. (התנצלות — אבל עוד לא פתרון)', 'I’m so sorry about that. (an apology — not a fix yet)'], 'hotel-problem'),
      card('fix.line.fix', Y_FIX, ['אפשר לתקן את זה? (מבקשים פתרון — לכל דבר שלא עובד)', 'Can you fix it? (asking for a fix — for anything that isn’t working)'], 'solution'),
      card('fix.line.send', N_SEND, ['כן, אשלח מישהו מיד. כל השאר בסדר? (👨‍🔧 מישהו בא לתקן)', 'Yes, I’ll send someone right away. Is everything else okay? (👨‍🔧 someone is coming to fix it)'], 'solution'),
    ]),
    k.practice({ kind: 'quickReply', label: board(S.ac, ['התנצלו — אבל המזגן עדיין לא עובד. מה אתה אומר?', 'They apologise — but the AC still isn’t working. What do you say?']), rounds: [
      { prompt: 'reply.fix.so-sorry', options: [say(FIX, true), say(CHARGED, false), say(I_ORDERED, false)] },
    ] }),
    // NOISY — and sometimes the fix is an alternative: "Can I change rooms?"
    cards(['חדר רועש', 'A noisy room'], board(S.ac, ['ועוד בעיה. הקש כדי לשמוע.', 'One more problem. Tap to hear.']), [
      card('fix.line.noisy', Y_NOISY, ['לא. החדר שלי מאוד רועש. (🔊 — אי אפשר לישון)', 'No. My room is very noisy. (🔊 — you can’t sleep)'], 'noisy-room'),
      card('fix.line.quieter', N_QUIETER, ['אני מבין. יש לנו חדר שקט יותר. (מציעים חדר אחר)', 'I understand. We have a quieter room. (they offer another room)'], 'noisy-room'),
      card('fix.line.change', Y_CHANGE, ['אפשר להחליף חדר? (לפעמים הפתרון הוא חלופה — לא תיקון)', 'Can I change rooms? (sometimes the fix is an alternative — not a repair)'], 'solution'),
    ]),
    k.practice({ kind: 'quickReply', label: board(S.noise, ['תיקון — או חלופה? מה אתה אומר?', 'A repair — or an alternative? What do you say?']), rounds: [
      { prompt: 'reply.fix.quieter-room', options: [say(CHANGE, true), say(FIX, false), say(MISTAKE, false)] },
    ] }),
    cards(['החדר החדש', 'The new room'], board(S.noise, ['והפתרון. הקש כדי לשמוע.', 'And the fix. Tap to hear.']), [
      card('fix.line.new-key', N_NEW_KEY, ['כמובן — חדר 305. הנה המפתח החדש. לילה טוב! (🔑 חדר אחר ומפתח חדש)', 'Of course — room 305. Here is your new key. Good night! (🔑 another room, a new key)'], 'solution'),
    ]),
    solved(S.noise, HOTEL_TILES, [{ audio: N_SEND, correct: 'someone' }, { audio: N_NEW_KEY, correct: 'new-room' }]),
    k.receipt(board(S.done, ['ארבע בעיות — אמרת מה הבעיה וביקשת פתרון.', 'Four problems — you said what was wrong and asked for a fix.'])),
    // THE CONVERSATIONS — once each, supported (translations on).
    k.dialogue('fixing-problems'),
    k.receipt(['🍽️ המסעדה — מנה שגויה וחיוב כפול, ושניהם תוקנו.', '🍽️ The restaurant — a wrong meal and a double charge, both fixed.']),
    k.dialogue('room-problem'),
    k.receipt(['🏨 המלון — מזגן, רעש, וחדר חדש.', '🏨 The hotel — the AC, the noise, and a new room.']),
    // NO HELP — the four tools at the staff's pace: no meaning, no cards, no board.
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { prompt: 'reply.fix.meal', options: [say(NOT_ORDERED, true), say(NO_PROBLEM, false), say(CHANGE, false)] },
      { prompt: 'reply.fix.bill', options: [say(MISTAKE, true), say(NO_PROBLEM, false), say(CHANGE, false)] },
      { prompt: 'reply.fix.whats-the-problem', options: [say(AC, true), say(CHARGED, false), say(NOT_ORDERED, false)] },
      { prompt: 'reply.fix.so-sorry', options: [say(FIX, true), say(I_ORDERED, false), say(CHARGED, false)] },
    ] }),
    k.receipt(['בלי עזרה — מנה שגויה, טעות, משהו לא עובד, ובקשה לתקן.', 'No help — the wrong thing, a mistake, something not working, and asking for a fix.']),
    // THE PAYOFF — the scenes (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: NEW PROBLEMS — the same functions, new details. Not the conversations again.
    k.practice({ kind: 'quickReply', label: [`🧰 בעיות חדשות${BOARD_SEP}${newProblems[0]}${BOARD_SEP}🎯 ערב אחר — בעיות חדשות. אמור מה לא בסדר.`, `🧰 NEW PROBLEMS${BOARD_SEP}${newProblems[1]}${BOARD_SEP}🎯 Another evening — new problems. Say what’s wrong.`], rounds: [
      { npc: N_FISH, options: [say(NOT_ORDERED, true), say(NO_PROBLEM, false), say(CHANGE, false)] },
      { prompt: 'reply.fix.what-did-you-order', options: [fin(I_ORDERED, true), say(NOT_ORDERED, false), say(MISTAKE, false)] },
      { prompt: 'reply.fix.how-can-i-help', options: [fin(AC, true), say(CHARGED, false), say(NOT_ORDERED, false)] },
      { prompt: 'reply.fix.so-sorry', options: [say(FIX, true), say(CHARGED, false), fin(I_ORDERED, false)] },
      { npc: N_KEY_204, options: [say(MISTAKE, true), say(NO_PROBLEM, false), say(CHANGE, false)] },
    ] }),
    k.receipt(FIX_IT),
    { kind: 'summary' },
  ];
}
