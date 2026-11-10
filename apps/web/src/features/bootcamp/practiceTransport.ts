import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep, MatchTile } from './types.js';

/**
 * Mission 19 — Public Transport: CATCH YOUR TRAIN. One real journey, defined ONCE for English, French
 * and Spanish. The conversation is LOCKED (`day18.ts`, `fr/day18.ts`, `es/day18.ts`); this is the short
 * journey around it — no transport vocabulary deck, no timetable, no grammar:
 *
 *   the briefing (the centre, the museum) → buy the ticket → single or return → €3 · every 10 min →
 *   "Which platform?" → platform 2, straight ahead → hop on + "Does this stop at the museum?" → three
 *   stops → your stop is next → the conversation (once, supported) → no help (4) → the video → the
 *   final ride (4 said · 4 understood) → 🚆 RIDE COMPLETE.
 *
 * Rules kept here:
 *   - four production tools (one ticket to ___ · single · which platform · does this stop at ___);
 *     "Thank you!" is the toolkit's, prior — no card, no drill, said only in the conversation;
 *   - every number, the price, the frequency, the platform, the direction, the stop count and "next"
 *     are deterministic UI, shown only AFTER the line that says them;
 *   - "Return" is comprehension only; there is no other ticket type;
 *   - "Hop on" and "Enjoy the museum" are narrative glue: met on a card and in the conversation, never drilled.
 *
 * Coverage: `mission19Coverage.ts`, enforced by `mission19.test.ts`.
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/**
 * PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): one station, one train, one style. Each slot is
 * an emoji until its artwork exists (`image` set): docs/MISSION19_ASSET_MANIFEST.md. No picture carries a
 * platform number, a price, a time, an arrow or a stop count: those are UI.
 */
type M19Slot = 'desk' | 'tickets' | 'platform' | 'train' | 'onboard' | 'museum';
export const M19_SLOTS: Record<M19Slot, { emoji: string; image?: string }> = {
  desk: { emoji: '🎫' },
  tickets: { emoji: '🎟️' },
  platform: { emoji: '🚉' },
  train: { emoji: '🚆' },
  onboard: { emoji: '💺' },
  museum: { emoji: '🏛️' },
};
/** Result picture only — never a choice, never a card. */
export const M19_PROPS: Record<'ride-complete', { emoji: string; image?: string }> = {
  'ride-complete': { emoji: '🚆' },
};
const look19 = (x: { emoji: string; image?: string }): { emoji: string } | { image: string } => (x.image ? { image: x.image } : { emoji: x.emoji });

/* The locked conversation (EN · FR · ES · HE), line by line — the staff's lines… */
export const N_WHERE: L4 = ['Hello! Where are you headed?', 'Bonjour ! Vous allez où ?', '¡Hola! ¿A dónde va?', 'שלום! לאן אתה נוסע?'];
export const N_TYPE: L4 = ['Single or return?', 'Aller simple ou aller-retour ?', '¿Solo ida o ida y vuelta?', 'הלוך או הלוך-חזור?'];
export const N_FARE: L4 = ["That's three euros. It leaves every ten minutes.", 'Ça fait trois euros. Ça part toutes les dix minutes.', 'Son tres euros. Sale cada diez minutos.', 'זה שלושה יורו. יוצא כל עשר דקות.'];
export const N_PLATFORM: L4 = ['Platform two. Straight ahead.', 'Quai numéro deux. Tout droit.', 'Andén número dos. Todo recto.', 'רציף שתיים. ישר קדימה.'];
export const N_HOP: L4 = ["The train's right here. Hop on.", 'Le train est juste là. Montez.', 'El tren está justo ahí. Suba.', 'הרכבת ממש כאן. עלה.'];
export const N_STOPS: L4 = ["Yes — it's three stops. I'll tell you when.", 'Oui — c’est à trois arrêts. Je vous dirai quand.', 'Sí — son tres paradas. Le aviso cuándo.', 'כן — זה שלוש תחנות. אני אגיד לך מתי.'];
export const N_NEXT: L4 = ['Here we are — your stop is next. Enjoy the museum!', 'Nous voilà — votre arrêt est le prochain. Bonne visite du musée !', 'Ya llegamos — su parada es la siguiente. ¡Que disfrute del museo!', 'הגענו — התחנה שלך הבאה. תיהנה במוזיאון!'];
/* …and the traveller's, as said. */
export const Y_TICKET: L4 = ['One ticket to the centre, please.', 'Un billet pour le centre, s’il vous plaît.', 'Un billete para el centro, por favor.', 'כרטיס אחד למרכז, בבקשה.'];
export const Y_SINGLE: L4 = ['Single, please.', 'Aller simple, s’il vous plaît.', 'Solo ida, por favor.', 'הלוך, בבקשה.'];
export const Y_WHICH: L4 = ['Which platform?', 'Quel quai ?', '¿Qué andén?', 'איזה רציף?'];
export const Y_THANKS: L4 = ['Thank you!', 'Merci !', '¡Gracias!', 'תודה!'];
export const Y_STOP: L4 = ['Does this stop at the museum?', 'Ça s’arrête au musée ?', '¿Para en el museo?', 'זה עוצר במוזיאון?'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/* ── 🚆 YOUR RIDE — the travel ticket, "?" until the conversation says it ─────────────────────────── */

/**
 * How far the ride has got, in order:
 *   0 the plan (your own destination: the centre) · 1 "Single, please." · 2 the fare and the frequency
 *   · 3 the platform and the way · 4 on board · 5 the museum is three stops away · 6 your stop is next.
 * Every value is something a line of the conversation has just said — never earlier.
 */
export const M19_STAGES = ['plan', 'ticket', 'fare', 'platform', 'boarded', 'museum', 'next'] as const;
export type RideStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const RIDE = {
  title: ['🚆 הנסיעה שלך', '🚆 Your ride'], ticket: ['🎫 כרטיס', '🎫 Ticket'], ride: ['🚉 נסיעה', '🚉 Ride'], onBoard: ['🚆 ברכבת', '🚆 On board'],
  dest: ['יעד: מרכז', 'Destination: Centre'],
  type: ['סוג: ?', 'Ticket: ?'], single: ['סוג: הלוך ➡️', 'Ticket: Single ➡️'],
  price: ['מחיר: ?', 'Price: ?'], price3: ['מחיר: €3', 'Price: €3'],
  every: ['תדירות: ?', 'Every: ?'], every10: ['תדירות: כל 10 דק׳', 'Every: 10 min'],
  platform: ['רציף: ?', 'Platform: ?'], platform2: ['רציף: 2 ⬆️ ישר', 'Platform: 2 ⬆️ straight'],
  museum: ['מוזיאון: ?', 'Museum: ?'], museum3: ['מוזיאון: 3 תחנות', 'Museum: 3 stops'],
  off: ['ירידה: ?', 'Get off: ?'], offNext: ['ירידה: בתחנה הבאה', 'Get off: Next stop'], offDone: ['ירידה: ✅ בתחנה הנכונה', 'Got off: ✅ the right stop'],
} as const satisfies Record<string, Copy>;
/** The travel ticket at stage `n`, as text the screen renders as two columns (`rideTicket(0)` knows only the destination). */
export const rideTicket = (n: RideStage, done = false): Copy => {
  const row = (i: 0 | 1): string => {
    const c = RIDE;
    const left = [c.dest[i], n >= 1 ? c.single[i] : c.type[i], n >= 2 ? c.price3[i] : c.price[i], n >= 2 ? c.every10[i] : c.every[i]];
    const right = [n >= 3 ? c.platform2[i] : c.platform[i], n >= 5 ? c.museum3[i] : c.museum[i], done ? c.offDone[i] : n >= 6 ? c.offNext[i] : c.off[i]];
    return `${c.ticket[i]}: ${left.join(' / ')} ‖ ${(n >= 4 ? c.onBoard : c.ride)[i]}: ${right.join(' / ')}`;
  };
  return [row(0), row(1)];
};
/**
 * The route strip, once the line has said how far: start → stop 1 → stop 2 → the museum (stop 3). No stop
 * names — only numbers. " ●" marks where you are: at the start (stage 5), then one stop before yours (6).
 */
export const routeStrip = (n: 5 | 6): Copy => {
  const cells: Copy[] = n === 5
    ? [['🚉 יציאה ●', '🚉 Start ●'], ['🛑 1', '🛑 1'], ['🛑 2', '🛑 2'], ['🏛️ 3 · מוזיאון', '🏛️ 3 · Museum']]
    : [['🚉 יציאה', '🚉 Start'], ['🛑 1', '🛑 1'], ['🛑 2 ●', '🛑 2 ●'], ['🏛️ הבאה: מוזיאון', '🏛️ Next: Museum']];
  const row = (i: 0 | 1): string => `🧭 ${cells.map((c) => c[i]).join(' → ')}`;
  return [row(0), row(1)];
};
/** The parts of a board label, joined: the screen draws the route and the ticket, the rest is text. */
export const BOARD_SEP = ' ¦ ';
const ride = (n: RideStage, prompt?: Copy): Copy => {
  const join = (i: 0 | 1): string => [RIDE.title[i], ...(n >= 5 ? [routeStrip(n as 5 | 6)[i]] : []), rideTicket(n)[i], ...(prompt ? [prompt[i]] : [])].join(BOARD_SEP);
  return [join(0), join(1)];
};

/** The ride, as plain serialisable data — every value null (or false) until a line has said it. */
export const rideState = (n: RideStage) => ({
  phase: M19_STAGES[n],
  destination: 'centre' as const,
  ticketType: n >= 1 ? ('single' as const) : null,
  priceKnown: n >= 2 ? { euros: 3 } : null,
  frequencyKnown: n >= 2 ? { everyMinutes: 10 } : null,
  platformKnown: n >= 3 ? { platform: 2 } : null,
  directionKnown: n >= 3 ? ('straight' as const) : null,
  boarded: n >= 4,
  museumConfirmed: n >= 5,
  stopsRemaining: n >= 6 ? 1 : n >= 5 ? 3 : null,
  nextStopKnown: n >= 6,
});

/** The ending — the whole ride, never a score. */
export const RIDE_COMPLETE: Copy = [
  `🚆 הנסיעה הושלמה${BOARD_SEP}${rideTicket(6, true)[0]}${BOARD_SEP}קנית כרטיס, מצאת את הרציף, וידאת את היעד וירדת בתחנה הנכונה.`,
  `🚆 RIDE COMPLETE${BOARD_SEP}${rideTicket(6, true)[1]}${BOARD_SEP}You bought the ticket, found the platform, checked the train and got off at the right stop.`,
];

/* ── The boards — deterministic UI (the id is the meaning) ────────────────────────────────────── */

/** Single or return — the two ticket types, by what they MEAN (no target word on the tile). */
export const TICKET_TYPES: Record<'single' | 'return', MatchTile> = {
  single: { id: 'single', emoji: '➡️', caption: { he: 'לכיוון אחד — רק לשם', en: 'One way — there only' } },
  return: { id: 'return', emoji: '↔️', caption: { he: 'לשם ובחזרה', en: 'There and back' } },
};
/** The fare and the frequency, heard in one line — one tile holds both facts. A number never wraps away
 *  from its unit on a narrow phone ("10 min" is one unit: a no-break space). */
export const FARE_TILES: MatchTile[] = [
  { id: 'f3-10', label: '💶 €3 · 🕒 10\u00a0min' }, { id: 'f10-3', label: '💶 €10 · 🕒 3\u00a0min' },
  { id: 'f3-2', label: '💶 €3 · 🕒 2\u00a0min' }, { id: 'f2-10', label: '💶 €2 · 🕒 10\u00a0min' },
];
/** The Platform Finder — platforms 1–3, straight ahead or to the left. */
export const PLATFORM_TILES: MatchTile[] = [
  { id: 'p1s', label: '🚉 1 ⬆️' }, { id: 'p2s', label: '🚉 2 ⬆️' }, { id: 'p3s', label: '🚉 3 ⬆️' },
  { id: 'p1l', label: '🚉 1 ⬅️' }, { id: 'p2l', label: '🚉 2 ⬅️' }, { id: 'p3l', label: '🚉 3 ⬅️' },
];
/** The route, stop by stop — numbers only: which one is the museum? */
export const STOP_TILES: MatchTile[] = [{ id: 's1', label: '🛑 1' }, { id: 's2', label: '🛑 2' }, { id: 's3', label: '🛑 3' }];
/** What the line about your stop tells you to do. */
export const GET_OFF_TILES: Record<'next' | 'three' | 'missed', MatchTile> = {
  next: { id: 'next', emoji: '🚪', caption: { he: 'יורדים בתחנה הבאה', en: 'Get off at the next stop' } },
  three: { id: 'three', emoji: '🛑', caption: { he: 'עוד שלוש תחנות', en: 'Three more stops' } },
  missed: { id: 'missed', emoji: '↩️', caption: { he: 'פספסת את התחנה', en: 'You missed your stop' } },
};

/* Sentence ids. */
const TICKET = 'phrase.trans.one-ticket';
const SINGLE = 'phrase.trans.single';
const WHICH = 'phrase.trans.which-platform';
const STOP = 'phrase.trans.does-stop';
const THANKS = 'phrase.recovery.thank-you';
/** What each learner sentence is said as — the whole locked line. */
export const SAID: Record<string, L4> = { [TICKET]: Y_TICKET, [SINGLE]: Y_SINGLE, [WHICH]: Y_WHICH, [STOP]: Y_STOP, [THANKS]: Y_THANKS };

export function m19Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const card = (key: string, line: L4, meaning: Copy, s: M19Slot) => ({ line: true, key, t: l3(line), meaning, ...look19(M19_SLOTS[s]) });
  const cards = (label: Copy, intro: Copy, words: ReturnType<typeof card>[]): BootcampStep => k.prime({ label, intro, bigPictures: true, words });
  const plain = (id: string, ok: boolean) => [id, ok] as const;
  // A wrong option is tested too: in teaching it is only a line already met (or the prior "Thank you!", never an answer).
  const ask = (n: RideStage, prompt: string, right: string, wrong: string[], label?: Copy): BootcampStep => k.practice({
    kind: 'quickReply', label: ride(n, label), rounds: [{ prompt, options: [plain(right, true), ...wrong.map((w) => plain(w, false))] }],
  });
  const board = (n: RideStage, prompt: Copy, tiles: MatchTile[], audio: L4, correct: string, ordered = false): BootcampStep => k.practice({
    kind: 'visualMatch', quiet: true, ...(ordered ? { ordered: true } : {}), label: ride(n, prompt), tiles, rounds: [{ audio, correct }],
  });
  const fare = (): BootcampStep => board(1, ['מה המחיר, וכל כמה זמן יוצאת הרכבת? הקש.', 'The fare, and how often it leaves? Tap it.'], FARE_TILES, N_FARE, 'f3-10');
  const platform = (): BootcampStep => board(2, ['איזה רציף, ולאיזה כיוון? הקש.', 'Which platform, and which way? Tap it.'], PLATFORM_TILES, N_PLATFORM, 'p2s', true);
  const stops = (): BootcampStep => board(4, ['איפה המוזיאון? הקש על התחנה.', 'Where is the museum? Tap its stop.'], STOP_TILES, N_STOPS, 's3', true);
  const getOff = (): BootcampStep => board(5, ['מה עושים עכשיו?', 'What do you do now?'], Object.values(GET_OFF_TILES), N_NEXT, 'next');
  const steps: BootcampStep[] = [
    // THE BRIEFING — your own destination only: the centre, the museum. Nothing the station will tell you.
    k.talk('🚆', ['משימה 19: תחבורה ציבורית', 'Mission 19: Public Transport'], [
      ['אתה נוסע למרכז ורוצה להגיע למוזיאון.', 'You are going to the centre and want to reach the museum.'],
      ['קנה כרטיס, מצא את הרציף וודא שאתה יורד במקום הנכון.', 'Buy a ticket, find the platform and make sure you get off at the right place.'],
    ], ['לגשת לדלפק הכרטיסים', 'Step up to the ticket desk']),
    // BUY THE TICKET — one whole line buys a ticket to anywhere.
    cards(['לקנות כרטיס', 'Buy a ticket'], ride(0, ['בדלפק שואלים לאן — ואתה קונה כרטיס. הקש כדי לשמוע.', 'At the desk they ask where to — and you buy a ticket. Tap to hear.']), [
      card('trans.line.where', N_WHERE, ['שלום! לאן אתה נוסע?', 'Hello! Where are you headed?'], 'desk'),
      card('trans.line.ticket', Y_TICKET, ['כרטיס אחד למרכז, בבקשה. (כרטיס אחד ל___ — קונה כרטיס לכל יעד)', 'One ticket to the centre, please. (one ticket to ___ — buys a ticket to anywhere)'], 'desk'),
    ]),
    ask(0, 'reply.trans.where-headed', TICKET, [THANKS], ['מה אתה אומר?', 'What do you say?']),
    // SINGLE OR RETURN — one way, or there and back.
    cards(['הלוך או הלוך-חזור', 'Single or return'], ride(0, ['הקופאי שואל איזה כרטיס. הקש כדי לשמוע.', 'The clerk asks which ticket. Tap to hear.']), [
      card('trans.line.type', N_TYPE, ['הלוך או הלוך-חזור? (➡️ הלוך: לכיוון אחד · ↔️ הלוך-חזור: לשם ובחזרה)', 'Single or return? (➡️ single: one way · ↔️ return: there and back)'], 'tickets'),
      card('trans.line.single', Y_SINGLE, ['הלוך, בבקשה. (➡️ רק לשם)', 'Single, please. (➡️ there only)'], 'tickets'),
    ]),
    board(0, ['איזה כרטיס זה? הקש.', 'Which ticket is this? Tap it.'], Object.values(TICKET_TYPES), Y_SINGLE, 'single'),
    ask(0, 'reply.trans.single-return', SINGLE, [TICKET, THANKS], ['מה אתה עונה?', 'What do you answer?']),
    // THE FARE — two facts in one line: the price and how often it leaves.
    cards(['מחיר ותדירות', 'Price and frequency'], ride(1, ['שתי עובדות במשפט אחד. הקש כדי לשמוע.', 'Two facts in one line. Tap to hear.']), [
      card('trans.line.fare', N_FARE, ['זה שלושה יורו. יוצא כל עשר דקות. (💶 €3 · 🕒 כל 10 דקות)', "That's three euros. It leaves every ten minutes. (💶 €3 · 🕒 every 10 min)"], 'desk'),
    ]),
    fare(),
    // WHICH PLATFORM? — ask where your train leaves from.
    cards(['איזה רציף', 'Which platform'], ride(2, ['שאלה אחת לפני שעולים. הקש כדי לשמוע.', 'One question before you board. Tap to hear.']), [
      card('trans.line.which', Y_WHICH, ['איזה רציף? (מאיפה הרכבת שלך יוצאת)', 'Which platform? (where your train leaves from)'], 'platform'),
    ]),
    ask(2, 'reply.trans.fare', WHICH, [SINGLE, TICKET], ['מה אתה שואל?', 'What do you ask?']),
    // THE PLATFORM FINDER — a number and a way.
    cards(['למצוא את הרציף', 'Find the platform'], ride(2, ['איפה הרציף? הקש כדי לשמוע.', 'Where is the platform? Tap to hear.']), [
      card('trans.line.platform', N_PLATFORM, ['רציף שתיים. ישר קדימה. (🚉 2 · ⬆️ ישר)', 'Platform two. Straight ahead. (🚉 2 · ⬆️ straight)'], 'platform'),
    ]),
    platform(),
    // ON BOARD — the train is here; check it goes where you go.
    cards(['לעלות ולוודא', 'Board and check'], ride(3, ['הרכבת כאן. לפני הנסיעה — לוודא. הקש כדי לשמוע.', 'The train is here. Before the ride — check. Tap to hear.']), [
      card('trans.line.hop', N_HOP, ['הרכבת ממש כאן. עלה. (הרכבת כאן ← עולים)', "The train's right here. Hop on. (the train is here → get on)"], 'train'),
      card('trans.line.stop', Y_STOP, ['זה עוצר במוזיאון? (זה עוצר ב___? — בודקים שהרכבת מגיעה ליעד)', 'Does this stop at the museum? (does this stop at ___? — check the train reaches your stop)'], 'museum'),
    ]),
    ask(3, 'reply.trans.hop-on', STOP, [WHICH, SINGLE], ['מה אתה שואל?', 'What do you ask?']),
    // THE ROUTE — how far is the museum?
    cards(['כמה תחנות', 'How many stops'], ride(4, ['כמה רחוק המוזיאון? הקש כדי לשמוע.', 'How far is the museum? Tap to hear.']), [
      card('trans.line.stops', N_STOPS, ['כן — זה שלוש תחנות. אני אגיד לך מתי. (🏛️ בעוד 3 תחנות · יגידו לך)', "Yes — it's three stops. I'll tell you when. (🏛️ 3 stops away · they'll tell you)"], 'onboard'),
    ]),
    stops(),
    // YOUR STOP IS NEXT — comprehension only; the route moves on.
    cards(['התחנה שלך', 'Your stop'], ride(5, ['עוד מעט מגיעים. הקש כדי לשמוע.', 'Nearly there. Tap to hear.']), [
      card('trans.line.next', N_NEXT, ['הגענו — התחנה שלך הבאה. תיהנה במוזיאון! (🏛️ התחנה הבאה היא שלך)', 'Here we are — your stop is next. Enjoy the museum! (🏛️ the next stop is yours)'], 'museum'),
    ]),
    k.receipt(ride(6, ['כרטיס, רציף, יעד — ואתה יודע מתי לרדת.', 'Ticket, platform, destination — and you know when to get off.'])),
    // THE CONVERSATION — once, supported (translations on).
    k.dialogue('transport'),
    k.receipt(['כל הנסיעה — מהדלפק ועד התחנה שלך, לבד.', 'The whole ride — from the desk to your stop, on your own.']),
    // NO HELP — the four tools at a real station's pace: no meaning, no cards, no ticket.
    k.practice({ kind: 'quickReply', challenge: true, rounds: [
      { prompt: 'reply.trans.where-headed', options: [plain(TICKET, true), plain(STOP, false), plain(WHICH, false)] },
      { prompt: 'reply.trans.single-return', options: [plain(SINGLE, true), plain(WHICH, false), plain(TICKET, false)] },
      { prompt: 'reply.trans.fare', options: [plain(WHICH, true), plain(SINGLE, false), plain(STOP, false)] },
      { prompt: 'reply.trans.hop-on', options: [plain(STOP, true), plain(TICKET, false), plain(WHICH, false)] },
    ] }),
    k.receipt(['בלי עזרה — כרטיס, הלוך, רציף ויעד.', 'No help — ticket, single, platform and destination.']),
    // THE PAYOFF — the whole scene (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then THE FINAL: one ride — four things you say, four things you understand.
    ask(0, 'reply.trans.where-headed', TICKET, [WHICH, STOP], ['נסיעה אחת. קדימה.', 'One ride. Go.']),
    ask(0, 'reply.trans.single-return', SINGLE, [TICKET, STOP]),
    fare(),
    ask(2, 'reply.trans.fare', WHICH, [TICKET, SINGLE]),
    platform(),
    ask(3, 'reply.trans.hop-on', STOP, [SINGLE, WHICH]),
    stops(),
    getOff(),
    k.receipt(RIDE_COMPLETE),
    { kind: 'summary' },
  ];
  // The pictures appear once their artwork exists: the briefing (the desk), the result (its prop).
  const result = M19_PROPS['ride-complete'];
  return steps.map((step, index) => (index === 0 && M19_SLOTS.desk.image ? { ...step, image: M19_SLOTS.desk.image }
    : step.kind === 'receipt' && step.text.en === RIDE_COMPLETE[1] && result.image ? { ...step, image: result.image } : step));
}
