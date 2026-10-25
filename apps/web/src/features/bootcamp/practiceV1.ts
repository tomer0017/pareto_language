import type { LocalizedText } from '@ready/content-schema';
import { buildPractice, buildPrime, spokenLine, type Copy, type L3, type L4, type MissionLang, type PracticeSpec, type PrimeSpec } from './author.js';
import type { BootcampStep, MapCell } from './types.js';

/**
 * Practice V1 — the step sequences of the hand-written Missions 01, 02, 03 and 05, defined ONCE for
 * English, French and Spanish. (Mission 04 is a multilingual spec: `core/everydayCore.ts`.)
 *
 * The per-language mission files keep what is genuinely per-language — sentences, dialogue trees,
 * video — and take their `steps` from here, so a practice step can never exist in one language
 * only. The backbone is unchanged: intro → before we speak → key sentences → expected replies →
 * active practice → dialogue → review → final challenge → victory. What changed is the middle:
 * hear-and-translate repeats were replaced by acting on what was heard (Quick Reply · Visual Match
 * · Swap It · Mini Map · Match Pairs · Sentence Builder), the closing review is selective, and each final challenge is honestly one
 * of two things — a recovery ambush (the win is a conversation-help tool) or a speed challenge.
 *
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

const T = (c: Copy): LocalizedText => ({ he: c[0], en: c[1] });

/** Small step factory for one language. */
export function kit(lang: MissionLang) {
  const id = (suffix: string): string => `${lang}.${suffix}`;
  return {
    id,
    talk: (icon: string, title: Copy, body: Copy[], cta: Copy): BootcampStep => ({ kind: 'talk', icon, title: T(title), body: body.map(T), cta: T(cta) }),
    prime: (p: PrimeSpec): BootcampStep => buildPrime(p, lang),
    tools: (list: (readonly [suffix: string, label: Copy])[]): BootcampStep[] =>
      list.map(([suffix, label], i) => ({ kind: 'tool', itemId: id(suffix), index: i + 1, total: list.length, label: T(label) })),
    replies: (said: string, ids: string[]): BootcampStep => ({ kind: 'replies', saidItemId: id(said), replyIds: ids.map(id) }),
    quiz: (answer: string, w1: string, w2: string): BootcampStep => ({ kind: 'quiz', itemId: id(answer), wrongIds: [id(w1), id(w2)] }),
    receipt: (text: Copy): BootcampStep => ({ kind: 'receipt', text: T(text) }),
    dialogue: (dialogueId: string): BootcampStep => ({ kind: 'dialogue', dialogueId }),
    review: (ids: string[]): BootcampStep => ({ kind: 'swipe', itemIds: ids.map(id) }),
    practice: (p: PracticeSpec): BootcampStep => buildPractice(p, lang),
    ambush: (mode: 'recovery' | 'speed', npc: L4, correct: string, wrong: string): BootcampStep =>
      ({ kind: 'ambush', mode, npc: spokenLine(npc, lang), correctItemId: id(correct), wrongItemId: id(wrong) }),
  };
}

/* ── Mission 01 — Introduce Myself ───────────────────────────────────────────────────────────── */

/**
 * Mission 01 is the gold standard: finishing it must mean "I understand this conversation", not "I
 * memorised my three answers". The conversation is LOCKED; everything here is the journey around it.
 *
 *   orientation → building blocks → your three answers → what you will HEAR (the questions, then the
 *   warm words) → question ↔ answer → build your answers → answer on your own → the conversation →
 *   review → the conversation's own lines at speed → one line you cannot know (ask again) →
 *   the video with no translation → did you catch it?
 *
 * Every meaningful chunk of the conversation — the host's lines as much as the learner's — is met at
 * least three times, in different ways (meaning, listening, retrieval / association). That promise
 * is written down in `mission01Coverage.ts` and enforced by `mission01.test.ts`: a phrase that is in
 * the video can never again lose all of its practice.
 */
export function m01Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const YES_FIRST_TIME: L3 = ["Yes, it's my first time here.", 'Oui, c’est ma première fois ici.', 'Sí, es mi primera vez aquí.'];
  return [
    { kind: 'video', mode: 'intro' },
    k.talk('👋', ['משימה 1: להציג את עצמי', 'Mission 1: Introduce Myself'], [
      ['היום אתה פוגש בן אדם — לא דלפק. מארח, נהג, מישהו בבר.', 'Today you meet a person — not a counter. A host, a driver, someone at the bar.'],
      ['בסוף המשימה תוכל לומר מי אתה, מאיפה אתה, ושזו הפעם הראשונה שלך כאן — ותבין כל מה שעונים לך.', 'By the end you can say who you are, where you’re from, and that it’s your first time here — and understand everything said back to you.'],
    ], ['מתחילים', 'Start']),
    k.prime({
      intro: ['אבני הבניין של כל היכרות — גם מה שתגיד, וגם מה שתשמע.', 'The building blocks of every introduction — what you say, and what you hear.'],
      words: [
        { key: 'intro.hello', t: ['Hi', 'Bonjour', 'Hola'], meaning: ['היי / שלום', 'hi / hello'], emoji: '👋' },
        { key: 'intro.welcome', t: ['welcome', 'bienvenue', 'bienvenido'], meaning: ['ברוך הבא', 'welcome'], emoji: '🤗' },
        { key: 'intro.name', t: ['name', 'nom', 'nombre'], meaning: ['שם', 'name'], emoji: '📛' },
        { key: 'intro.from', t: ['from', 'de', 'de'], meaning: ['מ־ (מאיפה)', 'from'], emoji: '🌍' },
        { key: 'intro.first-time', t: ['first time', 'première fois', 'primera vez'], meaning: ['פעם ראשונה', 'first time'] },
        { key: 'intro.nice-to-meet', t: ['nice to meet you', 'enchanté', 'mucho gusto'], meaning: ['נעים להכיר', 'nice to meet you'], emoji: '🤝' },
        { key: 'intro.yes', t: ['yes', 'oui', 'sí'], meaning: ['כן', 'yes'], emoji: '✅' },
      ],
    }),
    ...k.tools([
      ['phrase.social.my-name', ['מי אתה', 'Who you are']],
      ['phrase.social.from-israel', ['מאיפה אתה', 'Where you’re from']],
      ['phrase.social.first-time', ['פעם ראשונה כאן', 'First time here']],
      ['phrase.social.nice-to-meet', ['התשובה החמה', 'The warm reply']],
    ]),
    // LISTENING 1 — the three questions, and the warm thing said right after your name.
    k.replies('phrase.social.my-name', ['reply.social.whats-your-name', 'reply.social.where-from', 'reply.social.first-time-q', 'phrase.social.nice-to-meet']),
    k.receipt(['אתה מזהה את השאלות שכל מקומי סקרן ישאל אותך.', 'You recognize the questions every curious local will ask you.']),
    // QUESTION ↔ ANSWER — the game-like moment of the mission: connect each question to your own answer.
    k.practice({
      kind: 'matchPairs',
      pairs: [
        ['reply.social.whats-your-name', 'phrase.social.my-name'],
        ['reply.social.where-from', 'phrase.social.from-israel'],
        ['reply.social.first-time-q', 'phrase.social.first-time', YES_FIRST_TIME],
      ],
    }),
    // LISTENING 2 — the warm words. Nobody asks you to say them; you only have to know them when you hear them.
    k.replies('phrase.social.first-time', ['reply.social.hello', 'reply.social.welcome', 'reply.social.wonderful', 'reply.social.enjoy-stay', 'reply.social.great-day']),
    // …and what each of them means, at a glance (words beside the icon, never an icon alone).
    k.practice({
      kind: 'matchPairs',
      label: ['מילים חמות שתשמע — מה כל אחת אומרת?', 'Warm words you will hear — what does each one say?'],
      pairs: [
        ['reply.social.hello', 'reply.social.hello', undefined, '👋', ['היי / שלום', 'Hi / hello']],
        ['reply.social.welcome', 'reply.social.welcome', undefined, '🤗', ['ברוך הבא', 'Welcome']],
        ['reply.social.wonderful', 'reply.social.wonderful', undefined, '🤩', ['נהדר', 'Wonderful']],
        ['reply.social.great-day', 'reply.social.great-day', undefined, '☀️', ['שיהיה יום נהדר', 'Have a great day']],
      ],
    }),
    // BUILD — your three answers, put together piece by piece (each language in its own order).
    k.practice({
      kind: 'sentenceBuilder',
      rounds: [
        { itemId: 'phrase.social.my-name', chunks: [['My name', 'is', 'Dan.'], ['Je', 'm’appelle', 'Dan.'], ['Me', 'llamo', 'Dan.']] },
        { itemId: 'phrase.social.from-israel', chunks: [["I'm", 'from', 'Israel.'], ['Je', 'viens', 'd’Israël.'], ['Soy', 'de', 'Israel.']] },
        { itemId: 'phrase.social.first-time', chunks: [["It's", 'my', 'first time', 'here.'], ['C’est', 'ma', 'première fois', 'ici.'], ['Es', 'mi', 'primera vez', 'aquí.']] },
      ],
    }),
    // ANSWER — all three questions, one after another: hear it, pick your answer.
    k.practice({
      kind: 'quickReply',
      rounds: [
        { prompt: 'reply.social.whats-your-name', options: [['phrase.social.my-name', true], ['phrase.social.from-israel', false], ['phrase.social.nice-to-meet', false]] },
        { prompt: 'reply.social.where-from', options: [['phrase.social.from-israel', true], ['phrase.social.my-name', false], ['phrase.social.first-time', false]] },
        { prompt: 'reply.social.first-time-q', options: [
          ['phrase.social.first-time', true, YES_FIRST_TIME],
          ['phrase.social.from-israel', false], ['phrase.social.nice-to-meet', false],
        ] },
      ],
    }),
    k.dialogue('meeting-host'),
    k.receipt(['ניהלת היכרות שלמה — שם, מוצא, פעם ראשונה כאן.', 'You handled a full introduction — name, origin, first time here.']),
    k.review([
      'phrase.social.my-name', 'phrase.social.from-israel', 'phrase.social.first-time', 'phrase.social.nice-to-meet',
      'reply.social.whats-your-name', 'reply.social.where-from', 'reply.social.first-time-q',
      // (kept to ten cards: the greeting, the welcome and the reaction already had their own meaning match)
      'reply.social.enjoy-stay', 'reply.social.great-day',
      'phrase.recovery.repeat',
    ]),
    // FAST — the host's own three lines, word for word, at natural speed and with no translation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: ["Hi! Welcome. What's your name?", 'Bonjour ! Bienvenue. Comment vous appelez-vous ?', '¡Hola! Bienvenido. ¿Cómo se llama?', 'היי! ברוך הבא. איך קוראים לך?'],
          options: [['phrase.social.my-name', true], ['phrase.social.from-israel', false], ['phrase.social.first-time', false]] },
        { npc: ['Nice to meet you, Dan! Where are you from?', 'Enchanté, Dan ! D’où venez-vous ?', '¡Mucho gusto, Dan! ¿De dónde es?', 'נעים להכיר, דן! מאיפה אתה?'],
          options: [['phrase.social.from-israel', true], ['phrase.social.my-name', false], ['phrase.social.nice-to-meet', false]] },
        { npc: ['Israel, wonderful! Is this your first time here?', 'Israël, magnifique ! C’est votre première fois ici ?', '¡Israel, qué maravilla! ¿Es su primera vez aquí?', 'ישראל, נהדר! זו הפעם הראשונה שלך כאן?'],
          options: [['phrase.social.first-time', true, YES_FIRST_TIME], ['phrase.social.from-israel', false], ['phrase.social.my-name', false]] },
      ],
    }),
    k.receipt(['שלוש שאלות ברצף, בקצב רגיל ובלי תרגום — וענית על כולן.', 'Three questions in a row, at normal speed and with no translation — and you answered them all.']),
    k.ambush('recovery',
      ["And what do you do back home, if you don't mind me asking?", 'Et vous faites quoi dans la vie, si ce n’est pas indiscret ?', '¿Y a qué se dedica, si no es indiscreción?', 'ומה אתה עושה בחיים, אם מותר לשאול?'],
      'phrase.recovery.repeat', 'phrase.social.nice-to-meet'),
    k.receipt(['לא הבנת — והיה לך מה לעשות. לא להבין זה לא סוף השיחה.', 'You didn’t understand — and you had a move. Not understanding is not the end of the conversation.']),
    // THE GATE — first the whole conversation again with no help (the video)…
    { kind: 'video', mode: 'again' },
    // …then: did you catch it? The four things the host says that nobody asked you to say — the
    // welcome, the reaction, and the two wishes that close the conversation.
    k.quiz('reply.social.welcome', 'reply.social.great-day', 'reply.social.where-from'),
    k.quiz('reply.social.wonderful', 'phrase.social.nice-to-meet', 'reply.social.first-time-q'),
    k.quiz('reply.social.enjoy-stay', 'reply.social.great-day', 'reply.social.welcome'),
    k.quiz('reply.social.great-day', 'reply.social.enjoy-stay', 'reply.social.hello'),
    k.receipt(['הבנת את כל השיחה — מה"היי" ועד "שיהיה יום נהדר". בלי תרגום.', 'You understood the whole conversation — from “Hi” to “Have a great day”. No translation.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 02 — Numbers & Money ────────────────────────────────────────────────────────────── */

/** The price board of Mission 02 — nine plausible neighbours (5 / 15 / 50, 5.50 / 15.50…). */
const PRICE_TILES = [
  { id: 'e2', label: '€2' }, { id: 'e5', label: '€5' }, { id: 'e8', label: '€8' },
  { id: 'e10', label: '€10' }, { id: 'e15', label: '€15' }, { id: 'e20', label: '€20' },
  { id: 'e50', label: '€50' }, { id: 'e5_50', label: '€5.50' }, { id: 'e15_50', label: '€15.50' },
];

/**
 * The market stall — nine pictures, one per moment of the purchase (3×3, no empty cell), shared by
 * English, French and Spanish: only the audio is per language. The "two = €16" misreading is checked
 * after the video, on the offer tiles of AFTER_VIDEO_TILES — not as a tenth tile here.
 */
const M02_IMG = 'images/mission02/';
const STALL_TILES = [
  { id: 'berries', image: `${M02_IMG}fresh-strawberries-v2.jpg`, alt: 'A crate of fresh strawberries' },
  { id: 'how-much', image: `${M02_IMG}how-much.jpg`, alt: 'A strawberry with a price tag and a question mark' },
  { id: 'one5', image: `${M02_IMG}five-euros.jpg`, alt: 'One strawberry box with a €5 tag' },
  { id: 'two8', image: `${M02_IMG}two-for-eight.jpg`, alt: 'Two strawberry boxes with one €8 tag' },
  { id: 'box1', image: `${M02_IMG}one-box.jpg`, alt: 'One strawberry box, chosen' },
  { id: 'cash-or-card', image: `${M02_IMG}cash-or-card.jpg`, alt: 'Cash and a bank card side by side' },
  { id: 'card', image: `${M02_IMG}pay-card.jpg`, alt: 'A card tapped on a payment terminal' },
  { id: 'cash', image: `${M02_IMG}cash.jpg`, alt: 'A hand handing over banknotes' },
  { id: 'enjoy', image: `${M02_IMG}enjoy-strawberries.jpg`, alt: 'A happy customer eating one of the strawberries' },
];
/**
 * After the video: what happened at the stall? The same approved pictures as the stall board, so
 * the answer is the meaning already learned. The offer is one tile — both prices at once — against
 * the two wrong readings ("€8 each" = €16, and the prices swapped). All three are picture + short
 * label in the same form, so nothing but the numbers tells them apart.
 */
const offerLabel = (one: number, two: number): string => `1 box = €${one}\n2 = €${two} total`;
const AFTER_VIDEO_TILES = [
  STALL_TILES.find((t) => t.id === 'berries')!,
  { id: 'offer', image: `${M02_IMG}two-for-eight.jpg`, alt: 'Two strawberry boxes with one €8 tag', label: offerLabel(5, 8) },
  { id: 'offer16', image: `${M02_IMG}offer-two-for-sixteen.jpg`, alt: 'Two strawberry boxes with one €16 tag', label: offerLabel(5, 16) },
  { id: 'offer58', image: `${M02_IMG}offer-prices-swapped.jpg`, alt: 'One box tagged €8 beside two boxes tagged €5', label: offerLabel(8, 5) },
  STALL_TILES.find((t) => t.id === 'box1')!,
  STALL_TILES.find((t) => t.id === 'cash-or-card')!,
  STALL_TILES.find((t) => t.id === 'card')!,
  STALL_TILES.find((t) => t.id === 'cash')!,
  { ...STALL_TILES.find((t) => t.id === 'enjoy')!, id: 'bye' },
];
const STALL_OPENS: L4 = ['Fresh strawberries! Best in the market!', 'Fraises fraîches ! Les meilleures du marché !', '¡Fresas frescas! ¡Las mejores del mercado!', 'תותים טריים! הכי טובים בשוק!'];
const STALL_OFFER: L4 = ['Five euros a box, or two for eight!', 'Cinq euros la barquette, ou deux pour huit !', '¡Cinco euros la caja, o dos por ocho!', 'חמישה יורו קופסה, או שתיים בשמונה!'];
const STALL_TOTAL: L4 = ["Perfect. That's five euros. Cash or card?", 'Parfait. Ça fait cinq euros. Espèces ou carte ?', 'Perfecto. Son cinco euros. ¿Efectivo o tarjeta?', 'מצוין. זה חמישה יורו. מזומן או כרטיס?'];
const ONE_BOX: L4 = ['One box, please.', 'Une barquette, s’il vous plaît.', 'Una caja, por favor.', 'קופסה אחת, בבקשה.'];
const STALL_CLOSES: L4 = ['Thank you! Enjoy the strawberries!', 'Merci ! Bonne dégustation !', '¡Gracias! ¡Que las disfrute!', 'תודה! תיהנה מהתותים!'];
const BY_CARD: L4 = ['By card, please.', 'Par carte, s’il vous plaît.', 'Con tarjeta, por favor.', 'בכרטיס, בבקשה.'];

/**
 * Mission 02 follows the Mission 01 standard: finishing it must mean "I understand the whole market
 * conversation". The conversation is LOCKED; everything here is the journey around it.
 *
 *   Step 0 (optional building blocks: how much, 1 · 2 · 5 · 8, box, cash, card) → your sentences →
 *   what the vendor answers (the price, the offer, the payment question) → hear the prices → the
 *   stall board (what the offer MEANS: one = €5, two = €8 together) → the vendor's friendly words →
 *   question ↔ answer → build your two orders → answer on your own → the conversation → review →
 *   the vendor's own lines at speed → one fast price → the video → what happened at the stall?
 *
 * Every Quick Reply prompt is a real line of the conversation or one that plainly belongs at a
 * stall; no prompt is invented to force a "please repeat" answer (recovery stays where it has a
 * reason: inside the conversation, on the fast offer). The coverage promise is written down in
 * `mission02Coverage.ts` and enforced by `mission02.test.ts`.
 */
export function m02Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    k.talk('💶', ['משימה 2: כסף ומספרים', 'Mission 2: Numbers & Money'], [
      ['הכישלון הכי נפוץ של מטייל: לא הבנת את המחיר, אז פשוט הושטת שטר גדול וקיווית.', 'The most common traveler failure: you didn’t catch the price, so you just held out a big bill and hoped.'],
      ['היום זה נגמר. דוכן תותים בשוק: תשאל כמה, תבין את המחיר ואת המבצע, תזמין ותשלם.', 'Today that ends. A strawberry stall at the market: you ask how much, understand the price and the offer, order and pay.'],
    ], ['מתחילים', 'Start']),
    // STEP 0 — optional, short: only what helps decode THIS conversation.
    k.prime({
      gate: true,
      intro: ['המספרים והמילים של הדוכן. הקש על כל אחד כדי לשמוע.', 'The numbers and words of the stall. Tap each one to hear it.'],
      words: [
        { key: 'money.how-much', t: ['how much', 'c’est combien', '¿cuánto es?'], meaning: ['כמה (עולה)', 'how much'] },
        { key: 'number.one', t: ['one', 'une', 'una'], meaning: ['אחת (1)', 'one (1)'], emoji: '1️⃣' },
        { key: 'number.two', t: ['two', 'deux', 'dos'], meaning: ['שתיים (2)', 'two (2)'], emoji: '2️⃣' },
        { key: 'number.five', t: ['five', 'cinq', 'cinco'], meaning: ['חמש (5)', 'five (5)'], emoji: '5️⃣' },
        { key: 'number.eight', t: ['eight', 'huit', 'ocho'], meaning: ['שמונה (8)', 'eight (8)'], emoji: '8️⃣' },
        { key: 'money.box', t: ['box', 'barquette', 'caja'], meaning: ['קופסה', 'box'], emoji: '📦' },
        { key: 'money.cash', t: ['cash', 'espèces', 'efectivo'], meaning: ['מזומן', 'cash'], emoji: '💵' },
        { key: 'money.card', t: ['card', 'carte', 'tarjeta'], meaning: ['כרטיס', 'card'], emoji: '💳' },
      ],
      build: 'phrase.money.how-much',
    }),
    ...k.tools([
      ['phrase.money.how-much', ['לשאול מחיר', 'Ask the price']],
      ['phrase.money.one-box', ['להזמין', 'Order']],
      ['phrase.money.by-card', ['לשלם בכרטיס', 'Pay by card']],
      ['phrase.money.too-expensive', ['מיקוח מנומס', 'Polite haggle']],
    ]),
    // LISTENING — what the vendor says back: the price, the offer, "perfect", the payment question, the goodbye.
    k.replies('phrase.money.how-much', ['reply.money.five-euros', 'reply.money.offer', 'reply.money.perfect', 'reply.money.cash-or-card', 'reply.money.enjoy-strawberries']),
    k.receipt(['שמעת מחיר, מבצע ושאלת תשלום — וזיהית כל אחד.', 'You heard a price, an offer and the payment question — and caught every one.']),
    // NUMBERS BY EAR — the price tag you hear.
    k.practice({
      kind: 'visualMatch',
      label: ['הקש על המחיר ששמעת', 'Tap the price you hear'],
      tiles: PRICE_TILES,
      rounds: [
        { audio: ["That's five euros.", 'Ça fait cinq euros.', 'Son cinco euros.', 'זה חמישה יורו.'], correct: 'e5', itemId: 'reply.money.five-euros' },
        { audio: ['Eight euros.', 'Huit euros.', 'Ocho euros.', 'שמונה יורו.'], correct: 'e8' },
        // taught here, with its tag, before it is asked for at speed (and before "fifty" is heard in a prompt)
        { audio: ['Fifteen fifty.', 'Quinze cinquante.', 'Quince con cincuenta.', 'חמש עשרה וחצי.'], correct: 'e15_50', itemId: 'reply.money.fifteen-fifty' },
        { audio: ['Twenty euros, please.', 'Vingt euros, s’il vous plaît.', 'Veinte euros, por favor.', 'עשרים יורו, בבקשה.'], correct: 'e20', itemId: 'reply.money.twenty-euros' },
        { audio: ["That'll be ten euros.", 'Ça fera dix euros.', 'Serán diez euros.', 'זה יעלה עשרה יורו.'], correct: 'e10', itemId: 'reply.money.ten-euros' },
      ],
    }),
    // THE STALL — the whole purchase in pictures, in the order it happens: what is sold, the price
    // question, one box = €5, two boxes = €8 TOGETHER, the order, the payment question, card, cash, goodbye.
    k.practice({
      kind: 'visualMatch',
      label: ['בדוכן — הקש על מה ששמעת', 'At the stall — tap what you hear'],
      tiles: STALL_TILES,
      rounds: [
        { audio: ['Fresh strawberries!', 'Fraises fraîches !', '¡Fresas frescas!', 'תותים טריים!'], correct: 'berries', itemId: 'reply.money.fresh-strawberries' },
        { audio: ['How much is it?', 'C’est combien ?', '¿Cuánto es?', 'כמה זה עולה?'], correct: 'how-much', itemId: 'phrase.money.how-much' },
        { audio: ['Five euros a box.', 'Cinq euros la barquette.', 'Cinco euros la caja.', 'חמישה יורו קופסה.'], correct: 'one5' },
        { audio: ['Two for eight.', 'Deux pour huit.', 'Dos por ocho.', 'שתיים בשמונה.'], correct: 'two8' },
        { audio: ONE_BOX, correct: 'box1', itemId: 'phrase.money.one-box' },
        { audio: ['Cash or card?', 'Espèces ou carte ?', '¿Efectivo o tarjeta?', 'מזומן או כרטיס?'], correct: 'cash-or-card', itemId: 'reply.money.cash-or-card' },
        { audio: BY_CARD, correct: 'card', itemId: 'phrase.money.by-card' },
        // the other way to pay — off the locked script; met here, with its picture, before it is offered as an answer
        { audio: ['In cash.', 'En espèces.', 'En efectivo.', 'במזומן.'], correct: 'cash', itemId: 'phrase.money.in-cash' },
        { audio: STALL_CLOSES, correct: 'enjoy', itemId: 'reply.money.enjoy-strawberries' },
      ],
    }),
    // THE VENDOR'S FRIENDLY WORDS — nobody asks you to say them; you only have to know them.
    k.practice({
      kind: 'matchPairs',
      label: ['מה המוכר אומר? התאם כל משפט למשמעות שלו', 'What does the vendor say? Match each line to its meaning'],
      pairs: [
        // the same picture per meaning as on the stall board and the gate ("perfect" has no picture)
        ['reply.money.fresh-strawberries', 'reply.money.fresh-strawberries', undefined, '🍓', ['תותים טריים', 'Fresh strawberries'], `${M02_IMG}fresh-strawberries-v2.jpg`],
        ['reply.money.best-market', 'reply.money.best-market', undefined, '🏆', ['הכי טובים בשוק', 'Best in the market'], `${M02_IMG}best-in-market.jpg`],
        ['reply.money.perfect', 'reply.money.perfect', undefined, '👌', ['מצוין', 'Perfect']],
        ['reply.money.enjoy-strawberries', 'reply.money.enjoy-strawberries', undefined, '😋', ['תודה! תיהנה מהתותים', 'Thank you! Enjoy the strawberries'], `${M02_IMG}enjoy-strawberries.jpg`],
      ],
    }),
    // QUESTION ↔ ANSWER — why each line follows the one before: price, order, payment.
    k.practice({
      kind: 'matchPairs',
      label: ['מה בא אחרי מה? חבר כל משפט לתשובה שלו', 'What follows what? Connect each line to its reply'],
      pairs: [
        ['phrase.money.how-much', 'reply.money.five-euros'],
        ['reply.money.offer', 'phrase.money.one-box'],
        ['reply.money.cash-or-card', 'phrase.money.by-card'],
      ],
    }),
    // BUILD — your two orders, piece by piece (each language in its own order).
    k.practice({
      kind: 'sentenceBuilder',
      rounds: [
        { itemId: 'phrase.money.one-box', chunks: [['One', 'box,', 'please.'], ['Une', 'barquette,', 's’il vous plaît.'], ['Una', 'caja,', 'por favor.']] },
        { itemId: 'phrase.money.by-card', chunks: [['By', 'card,', 'please.'], ['Par', 'carte,', 's’il vous plaît.'], ['Con', 'tarjeta,', 'por favor.']] },
      ],
    }),
    // ANSWER — the vendor's real lines, and one more that plainly belongs at a stall.
    k.practice({
      kind: 'quickReply',
      rounds: [
        { npc: STALL_OPENS, options: [['phrase.money.how-much', true], ['phrase.money.by-card', false], ['phrase.money.in-cash', false]] },
        { prompt: 'reply.money.offer', options: [['phrase.money.one-box', true], ['phrase.money.by-card', false], ['phrase.money.how-much', false]] },
        { prompt: 'reply.money.cash-or-card', options: [['phrase.money.by-card', true], ['phrase.money.in-cash', true], ['phrase.money.how-much', false]] },
        { npc: ["That's fifty euros.", 'Ça fait cinquante euros.', 'Son cincuenta euros.', 'זה חמישים יורו.'],
          options: [['phrase.money.too-expensive', true], ['phrase.money.how-much', false], ['phrase.money.one-box', false]] },
      ],
    }),
    k.dialogue('market-stall'),
    k.receipt(['קנית בשוק, הבנת את המחיר, ושילמת. עסקה שלמה.', 'You bought at the market, understood the price, and paid. A full transaction.']),
    k.review([
      'phrase.money.how-much', 'phrase.money.one-box', 'phrase.money.by-card', 'phrase.money.in-cash', 'phrase.money.too-expensive',
      'reply.money.offer', 'reply.money.five-euros', 'reply.money.cash-or-card', 'reply.money.your-change',
      'reply.money.fresh-strawberries', 'reply.money.enjoy-strawberries', 'phrase.recovery.slowly',
    ]),
    // FAST — the vendor's own three lines, word for word, at natural speed and with no translation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: STALL_OPENS, options: [['phrase.money.how-much', true], ['phrase.money.one-box', false], ['phrase.money.by-card', false]] },
        { npc: STALL_OFFER, options: [['phrase.money.one-box', true], ['phrase.money.how-much', false], ['phrase.money.in-cash', false]] },
        { npc: STALL_TOTAL, options: [['phrase.money.by-card', true], ['phrase.money.one-box', false], ['phrase.money.too-expensive', false]] },
      ],
    }),
    k.receipt(['שלוש השורות של המוכר, בקצב רגיל ובלי תרגום — וענית על כולן.', 'The vendor’s three lines, at normal speed and with no translation — and you answered them all.']),
    // …and one price said fast, with pennies: the mission's real skill. The line is the number
    // alone, in words already met ("That's…" + "fifteen fifty") — nothing unexplained.
    k.practice({
      kind: 'visualMatch',
      challenge: true,
      tiles: PRICE_TILES,
      rounds: [{
        audio: ["That's fifteen fifty.", 'Ça fait quinze cinquante.', 'Son quince con cincuenta.', 'זה חמש עשרה וחצי.'],
        correct: 'e15_50', itemId: 'reply.money.fifteen-fifty',
      }],
    }),
    k.receipt(['מספר עם אגורות, מהיר — ותפסת אותו. זה כסף בשליטה.', 'A fast decimal price — and you caught it. That’s money, under control.']),
    // THE GATE — the whole conversation again with no help (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then: what happened at the stall? Answered by tapping, not by translating.
    k.practice({
      kind: 'visualMatch',
      label: ['מה קרה בדוכן? הקש על מה ששמעת', 'What happened at the stall? Tap what you hear'],
      tiles: AFTER_VIDEO_TILES,
      rounds: [
        { audio: STALL_OPENS, correct: 'berries' },
        { audio: STALL_OFFER, correct: 'offer', itemId: 'reply.money.offer' },
        { audio: ONE_BOX, correct: 'box1', itemId: 'phrase.money.one-box' },
        { audio: BY_CARD, correct: 'card', itemId: 'phrase.money.by-card' },
        { audio: STALL_CLOSES, correct: 'bye', itemId: 'reply.money.enjoy-strawberries' },
      ],
    }),
    k.receipt(['הבנת את כל מה שקרה בדוכן — מה נמכר, כמה זה עולה, מה המבצע, כמה לקחת ואיך שילמת.', 'You understood everything at the stall — what was sold, the price, the offer, how many you took and how you paid.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 03 — Coffee Shop ────────────────────────────────────────────────────────────────── */

/**
 * The café, in approved pictures (`public/images/mission03/`, one set for EN / ES / FR; payment reuses
 * Mission 02's card and cash pictures). ONE PICTURE = ONE MEANING: almost every café scene has an
 * iced coffee in it, so a round never shows the whole set — it shows the meaning and ITS contrast
 * (iced vs hot, M vs L, anything else? vs that's all…), and no other tile can also be a fair answer.
 */
const M03_IMG = 'images/mission03/';
const ICED = { id: 'iced', image: `${M03_IMG}iced-coffee.jpg`, alt: 'An iced coffee' };
const HOT = { id: 'hot', image: `${M03_IMG}hot-coffee.jpg`, alt: 'A hot, steaming coffee' };
const MEDIUM = { id: 'medium', image: `${M03_IMG}medium.jpg`, alt: 'A medium cup, marked M' };
const LARGE = { id: 'large', image: `${M03_IMG}large.jpg`, alt: 'A large cup, marked L' };
const CROISSANT = { id: 'croissant', image: `${M03_IMG}croissant.jpg`, alt: 'A croissant' };
const MUFFIN = { id: 'muffin', image: `${M03_IMG}muffin.jpg`, alt: 'A muffin' };
const MORE = { id: 'more', image: `${M03_IMG}anything-else.jpg`, alt: 'The barista offering something more' };
const DONE = { id: 'done', image: `${M03_IMG}order-complete.jpg`, alt: 'The order complete: an iced coffee and a croissant, ticked' };
const RECEIPT_Q = { id: 'receipt', image: `${M03_IMG}receipt-question.jpg`, alt: 'The barista holding out the receipt, asking' };
const MILK_NO_SUGAR = { id: 'milk-no-sugar', image: `${M03_IMG}milk-no-sugar.jpg`, alt: 'Iced coffee: milk yes, sugar no' };
const MILK_AND_SUGAR = { id: 'milk-and-sugar', image: `${M03_IMG}milk-and-sugar.jpg`, alt: 'Iced coffee: milk yes, sugar yes' };
const HANDOFF = { id: 'bye', image: `${M03_IMG}handoff-good-day.jpg`, alt: 'The barista handing over the order with a smile' };
const CARD = { id: 'card', image: 'images/mission02/pay-card.jpg', alt: 'A card tapped on a payment terminal' };
const CASH = { id: 'cash', image: 'images/mission02/cash.jpg', alt: 'A hand handing over banknotes' };
const P6_50 = { id: 'e6_50', label: '€6.50' };
const P6_05 = { id: 'e6_05', label: '€6.05' };
const P16_50 = { id: 'e16_50', label: '€16.50' };

/* The locked conversation, line by line (EN · FR · ES · HE). The barista's lines are the mission's
   `reply.coffee.*` sentences word for word; the learner's are its `phrase.coffee.*` sentences. */
const B_OPENS: L4 = ['Good morning! What can I get you?', 'Bonjour ! Qu’est-ce que je vous sers ?', '¡Buenos días! ¿Qué le sirvo?', 'בוקר טוב! מה להביא לך?'];
const B_SIZE: L4 = ['Sure! Medium or large?', 'Parfait ! Moyen ou grand ?', '¡Perfecto! ¿Mediano o grande?', 'סגור! בינוני או גדול?'];
const B_MILK: L4 = ['Milk and sugar?', 'Lait et sucre ?', '¿Leche y azúcar?', 'חלב וסוכר?'];
const B_EAT: L4 = ['Anything to eat?', 'Quelque chose à manger ?', '¿Algo de comer?', 'משהו לאכול?'];
const B_ELSE: L4 = ['Great choice. Would you like anything else?', 'Excellent choix. Vous désirez autre chose ?', 'Buena elección. ¿Algo más?', 'בחירה מצוינת. עוד משהו?'];
const B_PAY: L4 = ["That'll be six fifty. Cash or card?", 'Ça fait six euros cinquante. Espèces ou carte ?', 'Son seis con cincuenta. ¿Efectivo o tarjeta?', 'זה שש יורו וחמישים. מזומן או כרטיס?'];
/** The first sentence of the payment line, alone — the price. */
const B_PRICE: L4 = ["That'll be six fifty.", 'Ça fait six euros cinquante.', 'Son seis con cincuenta.', 'זה שש יורו וחמישים.'];
const B_RECEIPT: L4 = ['Would you like the receipt?', 'Vous voulez le ticket ?', '¿Quiere el recibo?', 'רוצה את הקבלה?'];
const B_BYE: L4 = ['Here you go — enjoy your day!', 'Voilà — bonne journée !', 'Aquí tiene — ¡que tenga un buen día!', 'בבקשה — שיהיה לך יום מעולה!'];
const Y_ICED: L4 = ["I'd like an iced coffee, please.", 'Je voudrais un café glacé, s’il vous plaît.', 'Quiero un café con hielo, por favor.', 'אני רוצה קפה קר, בבקשה.'];
const Y_MEDIUM: L4 = ['Medium, please.', 'Moyen, s’il vous plaît.', 'Mediano, por favor.', 'בינוני, בבקשה.'];
const Y_MILK: L4 = ['Milk, no sugar.', 'Avec du lait, sans sucre.', 'Con leche, sin azúcar.', 'עם חלב, בלי סוכר.'];
const Y_CROISSANT: L4 = ['A croissant, please.', 'Un croissant, s’il vous plaît.', 'Un cruasán, por favor.', 'קרואסון, בבקשה.'];
const Y_ALL: L4 = ["That's all, thanks.", 'C’est tout, merci.', 'Eso es todo, gracias.', 'זה הכל, תודה.'];
const Y_CARD: L4 = ['Card, please.', 'Par carte, s’il vous plaît.', 'Con tarjeta, por favor.', 'בכרטיס, בבקשה.'];
const Y_YES: L3 = ['Yes, please.', 'Oui, s’il vous plaît.', 'Sí, por favor.'];
const l3 = (x: L4): L3 => [x[0], x[1], x[2]];

/**
 * Mission 03 — Coffee Shop, on the Mission 01/02 standard: finishing it must mean "I understand the
 * whole café conversation". The conversation is LOCKED; everything here is the journey around it.
 *
 * TEACH before TEST. Every line is first SHOWN with its meaning — a building block, a key sentence,
 * a picture card (an approved picture of what the line means, tap to hear it), a listening drill
 * whose answer reveals the meaning, or a one-tile price card — and only then recognised (a picture
 * board that shows the meaning beside its own contrast), retrieved (match, build, answer) and met in
 * the conversation:
 *
 *   Step 0 (optional) → two key sentences → the barista's lines in pictures → your answers in
 *   pictures → the barista's follow-ups by ear → the order board (pairs) → milk & sugar ✓ / ✕ → the
 *   barista's friendly words → ordering pairs → build → six fifty: taught, then 2 choices, then 3 →
 *   finishing & paying pairs → answer on your own → your order at a glance → the conversation →
 *   review → the barista speed run → the video → what did you order? how did you pay?
 *
 * Mission 02's money is reactivated quickly, not retaught. Every Quick Reply prompt is a real line
 * of the conversation; recovery stays inside the conversation, where its reason is shown. The
 * coverage promise is in `mission03Coverage.ts` and enforced by `mission03.test.ts`.
 */
export function m03Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    k.talk('☕', ['משימה 3: בית קפה', 'Mission 3: Coffee Shop'], [
      ['היום לא לומדים "מילים על קפה". היום לומדים לצאת מבית קפה עם ארוחת בוקר ביד.', 'Today we don’t learn “coffee words”. Today you walk out of a café holding breakfast.'],
      ['הסוד: אחרי שאתה מזמין, הבריסטה שואל שאלות המשך. מי שמכיר אותן מראש — אף פעם לא קופא.', 'The secret: after you order, the barista fires follow-up questions. Know them in advance — never freeze.'],
    ], ['להיכנס', 'Walk in']),
    // STEP 0 — optional, short: only what decodes THIS order (cash / card are Mission 02's).
    k.prime({
      gate: true,
      intro: ['הדברים של ההזמנה. הקש על כל אחד כדי לשמוע.', 'The things of the order. Tap each one to hear it.'],
      words: [
        { key: 'cafe.iced-coffee', t: ['iced coffee', 'café glacé', 'café con hielo'], meaning: ['קפה קר (עם קרח)', 'iced coffee'], image: ICED.image },
        { key: 'size.medium', t: ['medium', 'moyen', 'mediano'], meaning: ['בינוני (M)', 'medium (M)'], image: MEDIUM.image },
        { key: 'size.large', t: ['large', 'grand', 'grande'], meaning: ['גדול (L)', 'large (L)'], image: LARGE.image },
        { key: 'cafe.milk', t: ['milk', 'lait', 'leche'], meaning: ['חלב', 'milk'], emoji: '🥛' },
        { key: 'cafe.sugar', t: ['sugar', 'sucre', 'azúcar'], meaning: ['סוכר', 'sugar'], emoji: '🍬' },
        { key: 'core.with', t: ['with', 'avec', 'con'], meaning: ['עם (כן ✓)', 'with (yes ✓)'], emoji: '✓' },
        { key: 'core.without', t: ['no', 'sans', 'sin'], meaning: ['בלי (לא ✕)', 'no / without (✕)'], emoji: '✕' },
        { key: 'cafe.receipt', t: ['receipt', 'ticket', 'recibo'], meaning: ['קבלה', 'receipt'], emoji: '🧾' },
      ],
      build: 'phrase.coffee.no-sugar',
    }),
    ...k.tools([
      ['phrase.coffee.iced-coffee', ['משפט הזהב', 'The golden template']],
      ['phrase.coffee.no-sugar', ['עם ובלי', 'With and without']],
    ]),
    // TEACH — the barista's lines, each with the picture of what it means. Tap to hear.
    k.prime({
      label: ['מה הבריסטה אומר', 'What the barista says'],
      intro: ['תמונה לכל משפט. הקש כדי לשמוע — ותבין מה הוא שואל.', 'One picture per line. Tap to hear it — and see what is being asked.'],
      words: [
        { line: true, key: 'cafe.line.opening', t: l3(B_OPENS), meaning: ['בוקר טוב! מה תרצה להזמין?', 'Good morning! What would you like to order?'], image: `${M03_IMG}what-can-i-get.jpg` },
        { line: true, key: 'cafe.line.anything-else', t: l3(B_ELSE), meaning: ['בחירה מצוינת. רוצה עוד משהו?', 'Great choice. Would you like anything else?'], image: MORE.image },
        { line: true, key: 'cafe.line.receipt', t: l3(B_RECEIPT), meaning: ['רוצה את הקבלה?', 'Would you like the receipt?'], image: RECEIPT_Q.image },
        { line: true, key: 'cafe.line.handoff', t: l3(B_BYE), meaning: ['הנה ההזמנה שלך — שיהיה לך יום מעולה!', 'Here is your order — enjoy your day!'], image: HANDOFF.image },
      ],
    }),
    // TEACH — your answers, each with the picture of what it means.
    k.prime({
      label: ['מה אתה עונה', 'What you answer'],
      intro: ['כל תשובה — והתמונה של מה שהיא אומרת. הקש כדי לשמוע.', 'Each answer — and the picture of what it says. Tap to hear.'],
      words: [
        { line: true, key: 'cafe.line.medium', t: l3(Y_MEDIUM), meaning: ['בינוני, בבקשה.', 'Medium, please.'], image: MEDIUM.image },
        { line: true, key: 'cafe.line.milk-no-sugar', t: l3(Y_MILK), meaning: ['עם חלב, בלי סוכר.', 'Milk, no sugar.'], image: MILK_NO_SUGAR.image },
        { line: true, key: 'cafe.line.croissant', t: l3(Y_CROISSANT), meaning: ['קרואסון, בבקשה.', 'A croissant, please.'], image: CROISSANT.image },
        { line: true, key: 'cafe.line.thats-all', t: l3(Y_ALL), meaning: ['זה הכל, תודה. (ההזמנה גמורה)', "That's all, thanks. (the order is complete)"], image: DONE.image },
        { line: true, key: 'cafe.line.card', t: l3(Y_CARD), meaning: ['בכרטיס, בבקשה.', 'Card, please.'], image: CARD.image },
        { line: true, key: 'cafe.line.yes', t: Y_YES, meaning: ['כן, בבקשה.', 'Yes, please.'], emoji: '👍' },
      ],
    }),
    // LISTENING — the barista's follow-ups by ear, exactly as the video says them; each answer reveals the meaning.
    k.replies('phrase.coffee.iced-coffee', ['reply.coffee.medium-or-large', 'reply.coffee.milk-sugar', 'reply.coffee.anything-to-eat', 'reply.coffee.anything-else', 'reply.coffee.cash-or-card']),
    k.receipt(['אתה כבר מזהה את שאלות ההמשך של הבריסטה — גודל, חלב, אוכל, עוד משהו, ותשלום.', 'You now recognize the barista’s follow-ups — size, milk, food, anything else, and payment.']),
    // GUIDED RECOGNITION — the order, moment by moment: each round shows the meaning and its own contrast.
    k.practice({
      kind: 'visualMatch',
      label: ['ההזמנה — הקש על מה ששמעת', 'The order — tap what you hear'],
      tiles: [ICED, HOT, MEDIUM, LARGE, CROISSANT, MUFFIN, MORE, DONE, RECEIPT_Q, CARD, CASH],
      rounds: [
        { audio: Y_ICED, correct: 'iced', itemId: 'phrase.coffee.iced-coffee', show: ['iced', 'hot'] },
        { audio: Y_MEDIUM, correct: 'medium', itemId: 'phrase.coffee.medium', show: ['medium', 'large'] },
        { audio: Y_CROISSANT, correct: 'croissant', itemId: 'phrase.coffee.croissant', show: ['croissant', 'muffin'] },
        { audio: B_ELSE, correct: 'more', itemId: 'reply.coffee.anything-else', show: ['more', 'done'] },
        { audio: Y_ALL, correct: 'done', itemId: 'phrase.coffee.thats-all', show: ['done', 'more'] },
        { audio: Y_CARD, correct: 'card', itemId: 'phrase.coffee.card', show: ['card', 'cash'] },
        { audio: B_RECEIPT, correct: 'receipt', itemId: 'reply.coffee.receipt', show: ['receipt', 'more'] },
      ],
    }),
    // THE MILK & SUGAR CONFIGURATOR — "with / without" by doing it, after the words, the key sentence and its picture.
    k.practice({
      kind: 'customize',
      label: ['חלב וסוכר? — הכן את הקפה בדיוק כמו ששמעת', 'Milk and sugar? — make the coffee exactly as you heard it'],
      base: ICED.image,
      options: [{ id: 'milk', emoji: '🥛', label: ['חלב', 'Milk'] }, { id: 'sugar', emoji: '🍬', label: ['סוכר', 'Sugar'] }],
      rounds: [{ audio: Y_MILK, on: ['milk'], itemId: 'phrase.coffee.no-sugar' }],
    }),
    // THE BARISTA'S FRIENDLY WORDS — nobody asks you to say them; you only have to know them.
    k.practice({
      kind: 'matchPairs',
      label: ['מה הבריסטה אומר? התאם כל משפט למשמעות שלו', 'What does the barista say? Match each line to its meaning'],
      pairs: [
        ['reply.coffee.good-morning', 'reply.coffee.good-morning', undefined, '🌅', ['בוקר טוב', 'Good morning'], `${M03_IMG}good-morning.jpg`],
        ['reply.coffee.sure', 'reply.coffee.sure', undefined, '👍', ['בטח / מצוין', 'Sure / perfect']],
        ['reply.coffee.great-choice', 'reply.coffee.great-choice', undefined, '👌', ['בחירה מצוינת', 'Great choice']],
        ['reply.coffee.enjoy', 'reply.coffee.enjoy', undefined, '👋☀️', ['הנה ההזמנה — שיהיה לך יום מעולה', 'Here you go — enjoy your day'], HANDOFF.image],
      ],
    }),
    // QUESTION ↔ ANSWER — ordering: each question and the line that answers it.
    k.practice({
      kind: 'matchPairs',
      label: ['מה עונים לבריסטה? חבר כל שאלה לתשובה שלה', 'What do you answer the barista? Connect each question to its answer'],
      pairs: [
        ['reply.coffee.what-can-i-get', 'phrase.coffee.iced-coffee'],
        ['reply.coffee.medium-or-large', 'phrase.coffee.medium'],
        ['reply.coffee.milk-sugar', 'phrase.coffee.no-sugar'],
        ['reply.coffee.anything-to-eat', 'phrase.coffee.croissant'],
      ],
    }),
    // BUILD — your two longest lines, piece by piece (each language in its own order).
    k.practice({
      kind: 'sentenceBuilder',
      rounds: [
        { itemId: 'phrase.coffee.iced-coffee', chunks: [["I'd like", 'an iced', 'coffee,', 'please.'], ['Je voudrais', 'un café', 'glacé,', 's’il vous plaît.'], ['Quiero', 'un café', 'con hielo,', 'por favor.']] },
        { itemId: 'phrase.coffee.no-sugar', chunks: [['Milk,', 'no', 'sugar.'], ['Avec', 'du lait,', 'sans', 'sucre.'], ['Con', 'leche,', 'sin', 'azúcar.']] },
      ],
    }),
    // THE PRICE — earned gradually: TAUGHT (one tile: hear it, see €6.50), then 2 choices, then 3.
    k.practice({
      kind: 'visualMatch',
      label: ['כמה זה עולה? שמע — והקש על המחיר', 'How much is it? Listen — and tap the price'],
      tiles: [P6_50, P6_05, P16_50],
      rounds: [
        { audio: B_PRICE, correct: 'e6_50', show: ['e6_50'] },
        { audio: B_PRICE, correct: 'e6_50', show: ['e6_50', 'e16_50'] },
        { audio: B_PRICE, correct: 'e6_50', show: ['e6_50', 'e6_05', 'e16_50'] },
      ],
    }),
    // QUESTION ↔ ANSWER — finishing and paying: anything else → that's all · cash or card → card · receipt → yes.
    k.practice({
      kind: 'matchPairs',
      label: ['מסיימים ומשלמים — חבר כל שאלה לתשובה שלה', 'Finishing and paying — connect each question to its answer'],
      pairs: [
        ['reply.coffee.anything-else', 'phrase.coffee.thats-all'],
        ['reply.coffee.cash-or-card', 'phrase.coffee.card'],
        ['reply.coffee.receipt', 'phrase.coffee.yes-please'],
      ],
    }),
    // ANSWER — the barista's real questions, on your own.
    k.practice({
      kind: 'quickReply',
      label: ['הבריסטה שואל — מה עונים?', 'The barista asks — what do you say?'],
      rounds: [
        { prompt: 'reply.coffee.what-can-i-get', options: [['phrase.coffee.iced-coffee', true], ['phrase.coffee.medium', false], ['phrase.coffee.card', false]] },
        { prompt: 'reply.coffee.milk-sugar', options: [['phrase.coffee.no-sugar', true], ['phrase.coffee.medium', false], ['phrase.coffee.card', false]] },
        { prompt: 'reply.coffee.anything-to-eat', options: [['phrase.coffee.croissant', true], ['phrase.coffee.thats-all', true], ['phrase.coffee.card', false]] },
        { prompt: 'reply.coffee.receipt', options: [['phrase.coffee.yes-please', true], ['phrase.coffee.medium', false], ['phrase.coffee.croissant', false]] },
      ],
    }),
    // YOUR ORDER, at a glance — the whole event before you live it.
    k.talk('🧾', ['ההזמנה שלך', 'Your order'], [
      ['☕🧊 קפה קר · 🥤 בינוני (M)', '☕🧊 Iced coffee · 🥤 medium (M)'],
      ['🥛 חלב ✓ · 🍬 סוכר ✕', '🥛 Milk ✓ · 🍬 sugar ✕'],
      ['🥐 קרואסון — וזה הכל', '🥐 A croissant — and that’s all'],
      ['💶 ‎€6.50 · 💳 בכרטיס · 🧾 קבלה — כן', '💶 €6.50 · 💳 by card · 🧾 receipt — yes'],
    ], ['להזמין', 'Order it']),
    k.dialogue('breakfast-order'),
    k.receipt(['הזמנת ארוחת בוקר שלמה: שתייה, גודל, חלב, מאפה, תשלום וקבלה. הכל.', 'You ordered a full breakfast: drink, size, milk, pastry, payment and receipt. All of it.']),
    k.review([
      'reply.coffee.what-can-i-get', 'reply.coffee.medium-or-large', 'phrase.coffee.medium', 'reply.coffee.milk-sugar',
      'reply.coffee.anything-to-eat', 'phrase.coffee.croissant', 'reply.coffee.anything-else', 'reply.coffee.cash-or-card',
      'phrase.coffee.card', 'reply.coffee.receipt', 'phrase.coffee.yes-please', 'phrase.recovery.repeat',
    ]),
    // THE BARISTA SPEED RUN — all seven questions, in order, at natural speed and with no translation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: B_OPENS, options: [['phrase.coffee.iced-coffee', true], ['phrase.coffee.medium', false], ['phrase.coffee.card', false]] },
        { npc: B_SIZE, options: [['phrase.coffee.medium', true], ['phrase.coffee.no-sugar', false], ['phrase.coffee.yes-please', false]] },
        { npc: B_MILK, options: [['phrase.coffee.no-sugar', true], ['phrase.coffee.medium', false], ['phrase.coffee.croissant', false]] },
        { npc: B_EAT, options: [['phrase.coffee.croissant', true], ['phrase.coffee.card', false], ['phrase.coffee.medium', false]] },
        { npc: B_ELSE, options: [['phrase.coffee.thats-all', true], ['phrase.coffee.no-sugar', false], ['phrase.coffee.card', false]] },
        { npc: B_PAY, options: [['phrase.coffee.card', true], ['phrase.coffee.thats-all', false], ['phrase.coffee.croissant', false]] },
        { npc: B_RECEIPT, options: [['phrase.coffee.yes-please', true], ['phrase.coffee.card', false], ['phrase.coffee.medium', false]] },
      ],
    }),
    k.receipt(['שבע שאלות של בריסטה, בקצב אמיתי ובלי תרגום — ושרדת את כולן.', 'Seven barista questions, at real speed and with no translation — and you got through all of them.']),
    // THE GATE — the whole conversation again with no help (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then: what did you order? how did you pay? The SAME pictures that taught each meaning.
    k.practice({
      kind: 'visualMatch',
      label: ['מה הזמנת? הקש על מה ששמעת', 'What did you order? Tap what you hear'],
      tiles: [ICED, HOT, MEDIUM, LARGE, MILK_NO_SUGAR, MILK_AND_SUGAR, CROISSANT, MUFFIN, DONE, MORE],
      rounds: [
        { audio: Y_ICED, correct: 'iced', itemId: 'phrase.coffee.iced-coffee', show: ['iced', 'hot'] },
        { audio: Y_MEDIUM, correct: 'medium', itemId: 'phrase.coffee.medium', show: ['medium', 'large'] },
        { audio: Y_MILK, correct: 'milk-no-sugar', itemId: 'phrase.coffee.no-sugar', show: ['milk-no-sugar', 'milk-and-sugar'] },
        { audio: Y_CROISSANT, correct: 'croissant', itemId: 'phrase.coffee.croissant', show: ['croissant', 'muffin'] },
        { audio: Y_ALL, correct: 'done', itemId: 'phrase.coffee.thats-all', show: ['done', 'more'] },
      ],
    }),
    k.practice({
      kind: 'visualMatch',
      label: ['ואיך שילמת? הקש על מה ששמעת', 'And how did you pay? Tap what you hear'],
      tiles: [P6_50, P16_50, CARD, CASH, RECEIPT_Q, MORE, HANDOFF],
      rounds: [
        { audio: B_PRICE, correct: 'e6_50', show: ['e6_50', 'e16_50'] },
        { audio: Y_CARD, correct: 'card', itemId: 'phrase.coffee.card', show: ['card', 'cash'] },
        { audio: B_RECEIPT, correct: 'receipt', itemId: 'reply.coffee.receipt', show: ['receipt', 'more'] },
        { audio: B_BYE, correct: 'bye', itemId: 'reply.coffee.enjoy', show: ['bye', 'receipt'] },
      ],
    }),
    k.receipt(['הבנת את כל השיחה בבית הקפה — מה הזמנת, איזה גודל, עם מה ובלי מה, מה אכלת, כמה שילמת ואיך.', 'You understood the whole café conversation — what you ordered, the size, with and without, what you ate, the price and how you paid.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 04 — Everyday Core: want / need / have / know / can ───────────────────────────────── */

/** A tile's app-language words — what it MEANS, so the picture is never a guess. */
const cap = (he: string, en: string): LocalizedText => ({ he, en });
/** The eight engine pictures (public/images/mission04/, shared by EN / ES / FR): one picture per
 *  engine or flip, used wherever a tile or card MEANS that engine — never as a stand-in for an object. */
const M04_IMG = 'images/mission04/';
const ENGINE_IMG = {
  want: `${M04_IMG}want.jpg`, need: `${M04_IMG}need.jpg`, have: `${M04_IMG}have.jpg`, dontHave: `${M04_IMG}dont-have.jpg`,
  know: `${M04_IMG}know.jpg`, dontKnow: `${M04_IMG}dont-know.jpg`, can: `${M04_IMG}can.jpg`, cant: `${M04_IMG}cant.jpg`,
} as const;
/** Group 2 — the hotel-desk SCENES (what is asked / shown at the desk), never stand-ins for the engines. */
const DESK_IMG = {
  needAnything: `${M04_IMG}desk-need-anything.jpg`, haveKey: `${M04_IMG}desk-have-key.jpg`, wifiPassword: `${M04_IMG}desk-wifi-password.jpg`,
  wifiHere: `${M04_IMG}desk-wifi-here.jpg`, haveMap: `${M04_IMG}desk-have-map.jpg`, mapYes: `${M04_IMG}desk-map-yes.jpg`,
  showMe: `${M04_IMG}desk-show-me.jpg`, ofCourse: `${M04_IMG}desk-of-course.jpg`,
} as const;
/* The engines, as one family of tiles: the same symbol always means the same engine. */
const E_WANT = { id: 'want', image: ENGINE_IMG.want, alt: 'Reaching for a coffee that is offered', caption: cap('רוצה', 'want') };
const E_NEED = { id: 'need', image: ENGINE_IMG.need, alt: 'Asking at the desk for a towel', caption: cap('צריך', 'need') };
const E_HAVE = { id: 'have', image: ENGINE_IMG.have, alt: 'Holding up the room key, ticked', caption: cap('יש לי', 'have') };
const E_KNOW = { id: 'know', image: ENGINE_IMG.know, alt: 'Tracing the route on a map, sure of the way', caption: cap('יודע', 'know') };
const E_CAN = { id: 'can', image: ENGINE_IMG.can, alt: 'Walking happily through town, ticked', caption: cap('יכול', 'can') };
/* My things at the desk: what I have, what I don't, what I ask for. */
const T_KEY = { id: 'have-key', image: ENGINE_IMG.have, alt: 'Holding up the room key, ticked', caption: cap('יש לי ✓', 'I have it ✓') };
const T_WIFI = { id: 'no-wifi', image: ENGINE_IMG.dontHave, alt: 'Shrugging at the wifi password, crossed out', caption: cap('אין לי ✕', 'I don’t have it ✕') };
const T_MAP = { id: 'ask-map', image: DESK_IMG.haveMap, alt: 'Asking the receptionist for a tourist map', caption: cap('יש לך? ❓', 'do you have one? ❓') };
const T_HERE = { id: 'wifi-here', image: DESK_IMG.wifiHere, alt: 'The receptionist pointing at the wifi password on the desk', caption: cap('הנה הסיסמה', 'here’s the password') };
/* How the other person reacts. */
const R_SURE = { id: 'sure', image: DESK_IMG.ofCourse, alt: 'The receptionist pointing out the route on the map', caption: cap('בטח / כמובן', 'sure / of course') };
const R_OK = { id: 'no-problem', emoji: '👌', caption: cap('אין בעיה', 'no problem'), scale: 1.6 };
/* The flips: the same symbol, ✓ or ✕. */
const F_KNOW = { id: 'know-yes', image: ENGINE_IMG.know, alt: 'Tracing the route on a map, sure of the way', caption: cap('יודע ✓', 'I know ✓') };
const F_DONT_KNOW = { id: 'know-no', image: ENGINE_IMG.dontKnow, alt: 'Puzzled over a map, a question mark', caption: cap('לא יודע ✕', 'I don’t know ✕') };
const F_CAN = { id: 'can-yes', image: ENGINE_IMG.can, alt: 'Walking happily through town, ticked', caption: cap('יכול ✓', 'I can ✓') };
const F_CANT = { id: 'can-no', image: ENGINE_IMG.cant, alt: 'Politely declining the dinner, crossed out', caption: cap('לא יכול ✕', 'I can’t ✕') };
/* The friend's scene, in the symbols its picture cards use. */
const S_COFFEE = { id: 'want-coffee', emoji: '☕', caption: cap('רוצה קפה', 'want a coffee'), scale: 1.6 };
const S_TOWEL = { id: 'need-towel', emoji: '🛁', caption: cap('צריך מגבת', 'need a towel'), scale: 1.6 };
const S_WALK = { id: 'walk', emoji: '🚶', caption: cap('ברגל · ~20 דק׳', 'on foot · ~20 min'), scale: 1.6 };
const S_DINNER = { id: 'dinner', emoji: '🍽️', caption: cap('ארוחת ערב ב-7', 'dinner at 7'), scale: 1.6 };

/* The locked conversation (EN · FR · ES · HE). */
const D_NEED: L4 = ['Hi! Do you need anything?', 'Bonjour ! Vous avez besoin de quelque chose ?', '¡Hola! ¿Necesita algo?', 'שלום! אתה צריך משהו?'];
const D_KEY: L4 = ['Sure. Do you have your key?', 'Bien sûr. Vous avez votre clé ?', 'Claro. ¿Tiene su llave?', 'בטח. יש לך את המפתח?'];
const D_WIFI: L4 = ['And the wifi password?', 'Et le mot de passe du wifi ?', '¿Y la contraseña del wifi?', 'והסיסמה של הוויי-פיי?'];
const D_COFFEE: L4 = ['Do you want a coffee?', 'Tu veux un café ?', '¿Quieres un café?', 'רוצה קפה?'];
const D_KNOW: L4 = ['Do you know how to get to the centre?', 'Tu sais comment aller au centre ?', '¿Sabes cómo ir al centro?', 'אתה יודע איך להגיע למרכז?'];
const D_WALK: L4 = ["You can walk. It's about twenty minutes.", 'Tu peux y aller à pied. C’est à environ vingt minutes.', 'Puedes ir a pie. Son unos veinte minutos.', 'אתה יכול ללכת ברגל. זה בערך עשרים דקות.'];
const D_DINNER: L4 = ["We're having dinner at seven. Can you come?", 'On dîne à sept heures. Tu peux venir ?', 'Cenamos a las siete. ¿Puedes venir?', 'אנחנו אוכלים ארוחת ערב בשבע. אתה יכול לבוא?'];
const D_COME: L4 = ['Can you come?', 'Tu peux venir ?', '¿Puedes venir?', 'אתה יכול לבוא?'];
const M_NEED: L4 = ['I need a towel.', 'J’ai besoin d’une serviette.', 'Necesito una toalla.', 'אני צריך מגבת.'];
const M_HAVE: L4 = ['Yes, I have my key.', 'Oui, j’ai ma clé.', 'Sí, tengo mi llave.', 'כן, יש לי את המפתח.'];
const M_DONT_HAVE: L4 = ["I don't have it.", 'Je ne l’ai pas.', 'No la tengo.', 'אין לי אותה.'];
const M_MAP: L4 = ['Do you have a map?', 'Vous avez une carte ?', '¿Tiene un mapa?', 'יש לך מפה?'];
const M_WANT: L4 = ['Yes, I want a coffee.', 'Oui, je veux un café.', 'Sí, quiero un café.', 'כן, אני רוצה קפה.'];
const M_KNOW: L4 = ['Yes, I know.', 'Oui, je sais.', 'Sí, lo sé.', 'כן, אני יודע.'];
const M_DONT_KNOW: L4 = ["I don't know.", 'Je ne sais pas.', 'No lo sé.', 'אני לא יודע.'];
const M_CAN: L4 = ['I can walk.', 'Je peux y aller à pied.', 'Puedo ir a pie.', 'אני יכול ללכת ברגל.'];
const M_CANT: L4 = ["Sorry, I can't.", 'Désolé, je ne peux pas.', 'Lo siento, no puedo.', 'סליחה, אני לא יכול.'];

/**
 * Mission 04 — Everyday Core. Not a script: a small LANGUAGE ENGINE (want · need · have · know · can,
 * and the flips don't have · don't know · can't) shown working in two places — the hostel desk
 * (polite forms) and a friend (everyday forms). The conversations are LOCKED; this is the journey:
 *
 *   Step 0 (optional: the five engines + the three flips) → AT THE DESK: what you hear and what you
 *   say, in picture cards → have / don't have / do you have? → question ↔ answer → what do you say
 *   here? → WITH A FRIEND: the same engines, everyday forms, in picture cards → which engine did you
 *   hear? → question ↔ answer → flip it → build two frames → the sentence machine (the object
 *   changes · the engine changes · new words you already know) → both conversations → the speed run
 *   → the video → what happened?
 *
 * TEACH before TEST: every line is first shown with its meaning (a building block or a picture card);
 * only then recognised, flipped, matched, built and answered. No word appears that the learner has
 * not met — the transfer uses the conversations' own nouns and Mission 03's croissant. Recovery
 * stays inside the conversation (the fast "Do you know…?" line), where its reason is shown.
 * Coverage: `mission04Coverage.ts`, enforced by `mission04.test.ts`.
 */
export function m04Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  const l3 = (x: L4): L3 => [x[0], x[1], x[2]];
  // French "carte" was a CARD in Missions 02–03; here it is a MAP — said once, where it is met.
  const deskSayIntro: Copy = lang === 'fr'
    ? ['שלושה מנועים: צריך · יש לי / אין לי · יכול. שים לב: כאן carte = מפה (במשימות הקודמות — כרטיס). הקש כדי לשמוע.', 'Three engines: need · have / don’t have · can. Note: here carte = map (in earlier missions, a card). Tap to hear.']
    : ['שלושה מנועים: צריך · יש לי / אין לי · יכול. הקש כדי לשמוע.', 'Three engines: need · have / don’t have · can. Tap to hear.'];
  return [
    // STEP 0 — optional: the five engines and the three flips. No grammar words — just the pieces.
    k.prime({
      gate: true,
      intro: ['חמש תבניות קצרות שבונות המון משפטים — ושלושה "הפוכים". הקש כדי לשמוע.', 'Five short patterns that build lots of sentences — and three flips. Tap to hear.'],
      words: [
        { key: 'core.want', t: ['want', 'je veux', 'quiero'], meaning: ['רוצה (☕ רוצה קפה)', 'want (☕ I want a coffee)'], image: ENGINE_IMG.want },
        { key: 'core.need', t: ['need', 'j’ai besoin de', 'necesito'], meaning: ['צריך (🛁 צריך מגבת)', 'need (🛁 I need a towel)'], image: ENGINE_IMG.need },
        { key: 'core.have', t: ['have', 'j’ai', 'tengo'], meaning: ['יש לי (🔑 יש לי מפתח)', 'have (🔑 I have my key)'], image: ENGINE_IMG.have },
        { key: 'core.know', t: ['know', 'je sais', 'sé'], meaning: ['יודע', 'know'], image: ENGINE_IMG.know },
        { key: 'core.can', t: ['can', 'je peux', 'puedo'], meaning: ['יכול (🚶 יכול ללכת ברגל)', 'can (🚶 I can walk)'], image: ENGINE_IMG.can },
        { key: 'core.dont-have', t: ["don't have", 'je ne l’ai pas', 'no la tengo'], meaning: ['אין לי ✕ (ההפך של "יש לי")', 'don’t have ✕ (the flip of "have")'], image: ENGINE_IMG.dontHave },
        { key: 'core.dont-know', t: ["don't know", 'je ne sais pas', 'no lo sé'], meaning: ['לא יודע ✕', 'don’t know ✕'], image: ENGINE_IMG.dontKnow },
        { key: 'core.cant', t: ["can't", 'je ne peux pas', 'no puedo'], meaning: ['לא יכול ✕', 'can’t ✕'], image: ENGINE_IMG.cant },
      ],
      build: 'phrase.core.i-need',
    }),
    // AT THE DESK — what you hear (the polite forms of a desk), each line with its meaning.
    k.prime({
      label: ['בדלפק — מה שומעים', 'At the desk — what you hear'],
      bigPictures: true,
      intro: ['כל משפט — ומה הוא אומר. בדלפק מדברים בצורה מנומסת. הקש כדי לשמוע.', 'Each line — and what it says. At a desk people use the polite form. Tap to hear.'],
      words: [
        { line: true, key: 'core.line.need-anything', t: l3(D_NEED), meaning: ['שלום! אתה צריך משהו?', 'Hi! Do you need anything?'], image: DESK_IMG.needAnything },
        { line: true, key: 'core.line.have-key', t: l3(D_KEY), meaning: ['בטח. יש לך את המפתח?', 'Sure. Do you have your key?'], image: DESK_IMG.haveKey },
        { line: true, key: 'core.line.wifi', t: l3(D_WIFI), meaning: ['והסיסמה של הוויי-פיי?', 'And the wifi password?'], image: DESK_IMG.wifiPassword },
        { line: true, key: 'core.line.its-here', t: ['It\'s here.', 'Il est ici.', 'Está aquí.'], meaning: ['היא כאן. (הנה הסיסמה)', 'It’s here. (here is the password)'], image: DESK_IMG.wifiHere },
        { line: true, key: 'core.line.map-yes', t: ['Yes.', 'Oui.', 'Sí.'], meaning: ['כן. (יש מפה — הנה היא)', 'Yes. (there is a map — here it is)'], image: DESK_IMG.mapYes },
        { line: true, key: 'core.line.of-course', t: ['Of course.', 'Bien sûr.', 'Claro.'], meaning: ['כמובן. / בטח.', 'Of course.'], image: DESK_IMG.ofCourse },
      ],
    }),
    // AT THE DESK — what you say.
    k.prime({
      label: ['בדלפק — מה אתה אומר', 'At the desk — what you say'],
      bigPictures: true,
      intro: deskSayIntro,
      words: [
        { line: true, key: 'core.line.i-need', t: l3(M_NEED), meaning: ['אני צריך מגבת.', 'I need a towel.'], image: ENGINE_IMG.need },
        { line: true, key: 'core.line.i-have', t: l3(M_HAVE), meaning: ['כן, יש לי את המפתח. ✓', 'Yes, I have my key. ✓'], image: ENGINE_IMG.have },
        { line: true, key: 'core.line.i-dont-have', t: l3(M_DONT_HAVE), meaning: ['אין לי אותה. ✕ (את הסיסמה)', 'I don’t have it. ✕ (the password)'], image: ENGINE_IMG.dontHave },
        { line: true, key: 'core.line.do-you-have', t: l3(M_MAP), meaning: ['יש לך מפה?', 'Do you have a map?'], image: DESK_IMG.haveMap },
        { line: true, key: 'core.line.show-me', t: ['Can you show me?', 'Vous pouvez me montrer ?', '¿Me lo puede mostrar?'], meaning: ['אתה יכול להראות לי?', 'Can you show me?'], image: DESK_IMG.showMe },
        { line: true, key: 'core.line.help-me', t: ['Can you help me?', 'Vous pouvez m’aider ?', '¿Me puede ayudar?'], meaning: ['אתה יכול לעזור לי? (אותו "יכול", בקשה אחרת)', 'Can you help me? (the same "can", another request)'], emoji: '🤝' },
      ],
    }),
    // HAVE / DON'T HAVE / DO YOU HAVE? — my things at the desk.
    k.practice({
      kind: 'visualMatch',
      label: ['הדברים שלך בדלפק — הקש על מה ששמעת', 'Your things at the desk — tap what you hear'],
      tiles: [T_KEY, T_WIFI, T_MAP],
      rounds: [
        { audio: M_HAVE, correct: 'have-key', itemId: 'phrase.core.i-have' },
        { audio: M_DONT_HAVE, correct: 'no-wifi', itemId: 'phrase.core.i-dont-have' },
        { audio: M_MAP, correct: 'ask-map', itemId: 'phrase.core.do-you-have' },
      ],
    }),
    // QUESTION ↔ ANSWER — the desk's real questions and your answers.
    k.practice({
      kind: 'matchPairs',
      label: ['מה עונים בדלפק? חבר כל שאלה לתשובה שלה', 'What do you answer at the desk? Connect each question to its answer'],
      pairs: [
        ['reply.core.need-anything', 'phrase.core.i-need'],
        ['reply.core.have-your-key', 'phrase.core.i-have'],
        ['reply.core.wifi', 'phrase.core.i-dont-have'],
      ],
    }),
    // YOUR TURN — the two things YOU ask at the desk, from the situation (no invented barista line).
    k.practice({
      kind: 'quickReply',
      label: ['מה אתה אומר כאן?', 'What do you say here?'],
      rounds: [
        { situation: ['אתה רוצה מפה של העיר. מה תשאל בדלפק?', 'You would like a map of the town. What do you ask at the desk?'],
          options: [['phrase.core.do-you-have', true], ['phrase.core.i-need', false], ['phrase.core.i-dont-have', false]] },
        { situation: ['יש להם מפה — אבל אתה לא מבין איך להגיע. מה תבקש?', 'They have a map — but you cannot see how to get there. What do you ask?'],
          options: [['phrase.recovery.show-me', true], ['phrase.core.do-you-have', false], ['phrase.core.i-have', false]] },
      ],
    }),
    // WITH A FRIEND — the SAME engines, another situation, the everyday form.
    k.prime({
      label: ['עם חבר — מה שומעים', 'With a friend — what you hear'],
      bigPictures: true,
      intro: ['אותם מנועים — מצב אחר. עם חבר תשמע צורה יומיומית; בדלפק — מנומסת. פשוט תכיר את שתיהן.', 'The same engines — another situation. With a friend you hear the everyday form; at a desk, the polite one. Just know both.'],
      words: [
        { line: true, key: 'core.line.want-coffee', t: l3(D_COFFEE), meaning: ['רוצה קפה?', 'Do you want a coffee?'], emoji: '☕' },
        { line: true, key: 'core.line.know-way', t: l3(D_KNOW), meaning: ['אתה יודע איך להגיע למרכז?', 'Do you know how to get to the centre?'], emoji: '🧭' },
        { line: true, key: 'core.line.walk', t: l3(D_WALK), meaning: ['אתה יכול ללכת ברגל. זה בערך עשרים דקות. (⏱️ ~20)', 'You can walk. It’s about twenty minutes. (⏱️ ~20)'], emoji: '🚶' },
        { line: true, key: 'core.line.dinner', t: l3(D_DINNER), meaning: ['אנחנו אוכלים ארוחת ערב בשבע (🕖). אתה יכול לבוא?', 'We’re having dinner at seven (🕖). Can you come?'], emoji: '🍽️' },
        { line: true, key: 'core.line.no-problem', t: ['No problem.', 'Pas de problème.', 'No pasa nada.'], meaning: ['אין בעיה.', 'No problem.'], emoji: '👌' },
      ],
    }),
    k.prime({
      label: ['עם חבר — מה אתה אומר', 'With a friend — what you say'],
      bigPictures: true,
      intro: ['רוצה · יודע / לא יודע · יכול / לא יכול. הקש כדי לשמוע.', 'Want · know / don’t know · can / can’t. Tap to hear.'],
      words: [
        { line: true, key: 'core.line.i-want', t: l3(M_WANT), meaning: ['כן, אני רוצה קפה.', 'Yes, I want a coffee.'], image: ENGINE_IMG.want },
        { line: true, key: 'core.line.want-water', t: ['I want water.', 'Je veux de l’eau.', 'Quiero agua.'], meaning: ['אני רוצה מים. (אותו "רוצה", דבר אחר)', 'I want water. (the same "want", another thing)'], emoji: '💧' },
        { line: true, key: 'core.line.i-know', t: l3(M_KNOW), meaning: ['כן, אני יודע. ✓', 'Yes, I know. ✓'], image: ENGINE_IMG.know },
        { line: true, key: 'core.line.i-dont-know', t: l3(M_DONT_KNOW), meaning: ['אני לא יודע. ✕', 'I don’t know. ✕'], image: ENGINE_IMG.dontKnow },
        { line: true, key: 'core.line.i-can', t: l3(M_CAN), meaning: ['אני יכול ללכת ברגל. ✓', 'I can walk. ✓'], image: ENGINE_IMG.can },
        { line: true, key: 'core.line.i-cant', t: l3(M_CANT), meaning: ['סליחה, אני לא יכול. ✕', 'Sorry, I can’t. ✕'], image: ENGINE_IMG.cant },
      ],
    }),
    // WHICH ENGINE? — the start of each real question, both scenes.
    k.practice({
      kind: 'visualMatch',
      label: ['איזה מנוע שמעת?', 'Which engine did you hear?'],
      tiles: [E_WANT, E_NEED, E_HAVE, E_KNOW, E_CAN],
      rounds: [
        { audio: D_NEED, correct: 'need', itemId: 'reply.core.need-anything', show: ['need', 'want', 'have', 'can'] },
        { audio: D_COFFEE, correct: 'want', itemId: 'reply.core.do-you-want', show: ['want', 'need', 'have', 'know'] },
        { audio: D_KEY, correct: 'have', itemId: 'reply.core.have-your-key', show: ['have', 'need', 'know', 'want'] },
        { audio: D_KNOW, correct: 'know', itemId: 'reply.core.do-you-know', show: ['know', 'can', 'have', 'want'] },
        { audio: D_COME, correct: 'can', itemId: 'reply.core.can-you-come', show: ['can', 'know', 'want', 'need'] },
      ],
    }),
    // QUESTION ↔ ANSWER — the friend's real questions and your answers.
    k.practice({
      kind: 'matchPairs',
      label: ['מה עונים לחבר? חבר כל שאלה לתשובה שלה', 'What do you answer your friend? Connect each question to its answer'],
      pairs: [
        ['reply.core.do-you-want', 'phrase.core.i-want'],
        ['reply.core.do-you-know', 'phrase.core.i-dont-know'],
        ['reply.core.you-can-walk', 'phrase.core.i-can'],
        ['reply.core.can-you-come', 'phrase.core.i-cant'],
      ],
    }),
    // FLIP IT — ✓ or ✕, by ear.
    k.practice({
      kind: 'visualMatch',
      label: ['הפוך את זה — ✓ או ✕?', 'Flip it — ✓ or ✕?'],
      tiles: [F_KNOW, F_DONT_KNOW, F_CAN, F_CANT],
      rounds: [
        { audio: M_DONT_KNOW, correct: 'know-no', itemId: 'phrase.core.i-dont-know', show: ['know-yes', 'know-no'] },
        { audio: M_CAN, correct: 'can-yes', itemId: 'phrase.core.i-can', show: ['can-yes', 'can-no'] },
        { audio: M_CANT, correct: 'can-no', itemId: 'phrase.core.i-cant', show: ['can-yes', 'can-no'] },
      ],
    }),
    // HOW DO THEY REACT? — the short answers you will hear back, by ear.
    k.practice({
      kind: 'visualMatch',
      label: ['איך מגיבים לך? הקש על מה ששמעת', 'How do they react? Tap what you hear'],
      tiles: [R_SURE, T_HERE, R_OK],
      rounds: [
        { audio: ['Of course.', 'Bien sûr.', 'Claro.', 'בטח.'], correct: 'sure', show: ['sure', 'wifi-here'] },
        { audio: ["It's here.", 'Il est ici.', 'Está aquí.', 'היא כאן.'], correct: 'wifi-here', show: ['wifi-here', 'sure'] },
        // "No problem." has no picture until the friend's scene gets its own (next pass): on its own,
        // never the emoji odd-one-out beside two pictures
        { audio: ['No problem.', 'Pas de problème.', 'No pasa nada.', 'אין בעיה.'], correct: 'no-problem', show: ['no-problem'] },
      ],
    }),
    // BUILD — two frames: the engine + the object, and the flip.
    k.practice({
      kind: 'sentenceBuilder',
      rounds: [
        { itemId: 'phrase.core.i-need', chunks: [['I', 'need', 'a towel.'], ['J’ai besoin', 'd’une', 'serviette.'], ['Necesito', 'una', 'toalla.']] },
        { itemId: 'phrase.core.i-dont-have', chunks: [['I', "don't have", 'it.'], ['Je', 'ne l’ai', 'pas.'], ['No', 'la', 'tengo.']] },
      ],
    }),
    // THE SENTENCE MACHINE — the object changes · the engine changes · words you already know.
    k.practice({
      kind: 'swap',
      label: ['מכונת המשפטים — בחר את הסוף שמתאים', 'The sentence machine — pick the ending that fits'],
      rounds: [
        { frame: ['I ___ a coffee.', '___ un café.', '___ un café.'], itemId: 'phrase.core.i-want', cue: { emoji: '☕', text: ['מציעים לך קפה — ובא לך', 'You are offered a coffee — and you would like one'] },
          options: [[['want', 'Je veux', 'Quiero'], 'אני רוצה קפה.', true], [['have', 'J’ai', 'Tengo'], 'יש לי קפה.', false]] },
        { frame: ['I ___ a coffee.', '___ un café.', '___ un café.'], cue: { emoji: '☕', text: ['הקפה כבר ביד שלך', 'The coffee is already in your hand'] },
          options: [[['have', 'J’ai', 'Tengo'], 'יש לי קפה.', true], [['want', 'Je veux', 'Quiero'], 'אני רוצה קפה.', false]] },
        // transfer: a word you already know from Mission 03, in a frame you know from today
        { frame: ['I want ___.', 'Je veux ___.', 'Quiero ___.'], cue: { emoji: '🥐', text: ['בא לך קרואסון (ממשימה 3)', 'You feel like a croissant (from Mission 3)'] },
          options: [[['a croissant', 'un croissant', 'un cruasán'], 'אני רוצה קרואסון.', true], [['water', 'de l’eau', 'agua'], 'אני רוצה מים.', false]] },
        { frame: ['Can you ___ me?', 'Vous pouvez ___ ?', '¿Me ___?'], itemId: 'phrase.recovery.show-me', cue: { emoji: '🗺️', text: ['יש מפה — אבל אתה לא מוצא את הדרך עליה', 'There is a map — but you cannot find the way on it'] },
          options: [[['show', 'me montrer', 'lo puede mostrar'], 'אתה יכול להראות לי?', true], [['help', 'm’aider', 'puede ayudar'], 'אתה יכול לעזור לי?', false]] },
        { frame: ['Can you ___ me?', 'Vous pouvez ___ ?', '¿Me ___?'], itemId: 'phrase.core.can-you-help', cue: { emoji: '🎒', text: ['התיק כבד — אתה צריך עזרה', 'Your bag is heavy — you need a hand'] },
          options: [[['help', 'm’aider', 'puede ayudar'], 'אתה יכול לעזור לי?', true], [['show', 'me montrer', 'lo puede mostrar'], 'אתה יכול להראות לי?', false]] },
      ],
    }),
    k.receipt(['תראה מה אתה כבר יכול להגיד: מחליפים את הסוף — או את המנוע — ויש משפט חדש.', 'Look what you can already say: change the ending — or the engine — and you have a new sentence.']),
    // THE TWO CONVERSATIONS — the same engines, two situations.
    k.dialogue('hostel-desk'),
    k.receipt(['אמרת מה אתה צריך, מה יש לך ומה אין — וביקשת עזרה.', 'You said what you need, what you have and what you don’t — and asked for help.']),
    k.dialogue('coffee-with-a-friend'),
    k.receipt(['אותם מנועים, עם חבר: רוצה, לא יודע, יכול, לא יכול.', 'The same engines, with a friend: want, don’t know, can, can’t.']),
    // THE SPEED RUN — the real questions of both scenes, at natural speed, no translation.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: D_NEED, options: [['phrase.core.i-need', true], ['phrase.core.i-want', false], ['phrase.core.i-cant', false]] },
        { npc: D_KEY, options: [['phrase.core.i-have', true], ['phrase.core.i-dont-know', false], ['phrase.core.i-want', false]] },
        { npc: D_COFFEE, options: [['phrase.core.i-want', true], ['phrase.core.i-need', false], ['phrase.core.i-dont-have', false]] },
        { npc: D_KNOW, options: [['phrase.core.i-dont-know', true], ['phrase.core.i-know', true], ['phrase.core.i-have', false]] },
        { npc: D_DINNER, options: [['phrase.core.i-cant', true], ['phrase.core.i-have', false], ['phrase.core.i-need', false]] },
      ],
    }),
    k.receipt(['חמש שאלות אמיתיות, בקצב אמיתי — וזיהית בכל אחת את המנוע.', 'Five real questions, at real speed — and you caught the engine in every one.']),
    // THE PAYOFF — both scenes again with no help (the video, where one exists)…
    { kind: 'video', mode: 'again' },
    // …then: what happened? Answered by tapping the meaning, in the symbols that taught it.
    k.practice({
      kind: 'visualMatch',
      label: ['מה קרה? הקש על מה ששמעת', 'What happened? Tap what you hear'],
      tiles: [T_KEY, T_WIFI, S_COFFEE, S_TOWEL, F_KNOW, F_DONT_KNOW, S_WALK, S_DINNER, F_CAN, F_CANT],
      rounds: [
        { audio: M_HAVE, correct: 'have-key', itemId: 'phrase.core.i-have', show: ['have-key', 'no-wifi'] },
        { audio: M_WANT, correct: 'want-coffee', itemId: 'phrase.core.i-want', show: ['want-coffee', 'need-towel'] },
        { audio: M_DONT_KNOW, correct: 'know-no', itemId: 'phrase.core.i-dont-know', show: ['know-no', 'know-yes'] },
        { audio: D_WALK, correct: 'walk', show: ['walk', 'dinner'] },
        { audio: D_DINNER, correct: 'dinner', show: ['dinner', 'walk'] },
        { audio: M_CANT, correct: 'can-no', itemId: 'phrase.core.i-cant', show: ['can-no', 'can-yes'] },
      ],
    }),
    k.receipt(['הבנת את שתי השיחות — ובנית משפטים משלך עם חמישה מנועים.', 'You understood both conversations — and built your own sentences with five engines.']),
    { kind: 'summary' },
  ];
}

/* ── Mission 05 — Directions ─────────────────────────────────────────────────────────────────── */

type Cell = Omit<MapCell, 'label'> & { label?: L3 };
const CAFE: L3 = ['café', 'café', 'café'];
const HOTEL: L3 = ['hotel', 'hôtel', 'hotel'];
const BANK: L3 = ['bank', 'banque', 'banco'];

/** A junction seen from above: you at the bottom, three ways to go. `mark` is what the three
 *  tappable cells show (arrows for "which way", pins for "which spot"); the bank sits bottom-left
 *  or bottom-right, so "next to the bank" has exactly one answer. */
function junction(mark: 'arrows' | 'pins', bank: 'left' | 'right'): Cell[] {
  const arrows = mark === 'arrows';
  return [
    { id: 'cafe', row: 0, col: 0, emoji: '☕', label: CAFE },
    { id: 'straight', row: 0, col: 1, emoji: arrows ? '⬆️' : '📍', tappable: true },
    { id: 'left', row: 1, col: 0, emoji: arrows ? '⬅️' : '📍', tappable: true },
    { id: 'right', row: 1, col: 2, emoji: arrows ? '➡️' : '📍', tappable: true },
    { id: 'bank', row: 2, col: bank === 'left' ? 0 : 2, emoji: '🏦', label: BANK },
    { id: 'you', row: 2, col: 1, emoji: '🧍' },
    { id: 'hotel', row: 2, col: bank === 'left' ? 2 : 0, emoji: '🏨', label: HOTEL },
  ];
}

export function m05Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    k.talk('🧭', ['משימה 5: כיוונים', 'Mission 5: Directions'], [
      ['לשאול "איפה?" זה קל. הקושי האמיתי: להבין את התשובה המהירה.', 'Asking “where?” is easy. The real challenge: understanding the fast answer.'],
      ['היום זו בעיקר האזנה. שמאל, ימין, ישר, ליד — עד שזה טבעי.', 'Today is mostly listening. Left, right, straight, next to — until it’s automatic.'],
    ], ['מתחילים', 'Start']),
    k.prime({
      intro: ['שש מילות כיוון — כדי שתבין את התשובה, לא רק תשאל.', 'Six direction words — so you understand the answer, not just ask.'],
      words: [
        { key: 'social.excuse-me', t: ['excuse me', 'excusez-moi', 'perdone'], meaning: ['סליחה (לפנות)', 'excuse me'] },
        { key: 'direction.left', t: ['left', 'gauche', 'izquierda'], meaning: ['שמאלה', 'left'], emoji: '⬅️' },
        { key: 'direction.right', t: ['right', 'droite', 'derecha'], meaning: ['ימינה', 'right'], emoji: '➡️' },
        { key: 'direction.straight', t: ['straight', 'tout droit', 'todo recto'], meaning: ['ישר', 'straight'], emoji: '⬆️' },
        { key: 'distance.near', t: ['near', 'près', 'cerca'], meaning: ['קרוב', 'near'] },
        { key: 'distance.far', t: ['far', 'loin', 'lejos'], meaning: ['רחוק', 'far'] },
      ],
      build: 'reply.dir.turn-left',
    }),
    ...k.tools([
      ['phrase.dir.where-is', ['לשאול איפה', 'Ask where']],
      ['phrase.dir.is-it-far', ['ללכת או מונית?', 'Walk or taxi?']],
      ['phrase.dir.show-me-map', ['לעבור לעיניים', 'Switch to eyes']],
    ]),
    k.replies('phrase.dir.where-is', ['reply.dir.left', 'reply.dir.right', 'reply.dir.straight', 'reply.dir.next-to']),
    k.receipt(['שמאל, ימין, ישר, ליד — אתה מזהה כל כיוון במשפט.', 'Left, right, straight, next to — you catch every direction in a sentence.']),
    // Hear the direction → act on it. No translation is shown until the learner has tapped.
    k.practice({
      kind: 'miniMap',
      rounds: [
        { audio: ['Go straight ahead.', 'Allez tout droit.', 'Siga todo recto.', 'לך ישר.'], cells: junction('arrows', 'left'), correct: 'straight', itemId: 'reply.dir.straight' },
        { audio: ['Turn left at the corner.', 'Tournez à gauche au coin.', 'Gire a la izquierda en la esquina.', 'פנה שמאלה בפינה.'], cells: junction('arrows', 'left'), correct: 'left', itemId: 'reply.dir.turn-left' },
        { audio: ["It's on the right.", 'C’est à droite.', 'Está a la derecha.', 'זה בצד ימין.'], cells: junction('arrows', 'left'), correct: 'right', itemId: 'reply.dir.right' },
        { audio: ["It's next to the bank.", 'C’est à côté de la banque.', 'Está al lado del banco.', 'זה ליד הבנק.'], cells: junction('pins', 'left'), correct: 'left', itemId: 'reply.dir.next-to' },
      ],
    }),
    k.quiz('reply.dir.five-minutes', 'reply.dir.next-to', 'reply.dir.cant-miss'),
    k.practice({
      kind: 'quickReply',
      rounds: [
        { situation: ['אתה אבוד ומחפש את התחנה. פונים למישהו ברחוב.', 'You are lost and looking for the station. You stop someone in the street.'],
          options: [
            ['phrase.dir.where-is', true, ['Excuse me! Where is the station?', 'Excusez-moi ! Où est la gare ?', '¡Perdone! ¿Dónde está la estación?']],
            ['phrase.dir.is-it-far', false], ['phrase.dir.show-me-map', false],
          ] },
        { npc: ['Go straight ahead, then turn left at the corner.', 'Allez tout droit, puis tournez à gauche au coin.', 'Siga todo recto y luego gire a la izquierda en la esquina.', 'לך ישר, ואז פנה שמאלה בפינה.'],
          options: [['phrase.recovery.repeat', true], ['phrase.dir.is-it-far', true], ['phrase.dir.where-is', false]] },
      ],
    }),
    // One frame, any destination: "How do I get to ___?"
    k.practice({
      kind: 'swap',
      rounds: [
        { frame: ['How do I get to ___?', 'Comment aller ___ ?', '¿Cómo se llega ___?'], itemId: 'phrase.dir.how-do-i-get', cue: { emoji: '🏖️', text: ['אתה רוצה להגיע לחוף', 'You want to get to the beach'] },
          options: [[['the beach', 'à la plage', 'a la playa'], 'איך מגיעים לחוף?', true], [['the station', 'à la gare', 'a la estación'], 'איך מגיעים לתחנה?', false], [['the bank', 'à la banque', 'al banco'], 'איך מגיעים לבנק?', false]] },
        { frame: ['How do I get to ___?', 'Comment aller ___ ?', '¿Cómo se llega ___?'], itemId: 'phrase.dir.how-do-i-get', cue: { emoji: '🏦', text: ['אתה רוצה להגיע לבנק', 'You want to get to the bank'] },
          options: [[['the bank', 'à la banque', 'al banco'], 'איך מגיעים לבנק?', true], [['the beach', 'à la plage', 'a la playa'], 'איך מגיעים לחוף?', false], [['the station', 'à la gare', 'a la estación'], 'איך מגיעים לתחנה?', false]] },
      ],
    }),
    k.dialogue('lost-in-town'),
    k.receipt(['שאלת דרך, הבנת הוראות מהירות, והגעת. ללכת לאיבוד כבר לא מפחיד.', 'You asked for directions, understood fast instructions, and arrived. Being lost isn’t scary anymore.']),
    k.review([
      'phrase.dir.where-is', 'phrase.dir.how-do-i-get', 'phrase.dir.is-it-far', 'phrase.dir.show-me-map',
      'reply.dir.left', 'reply.dir.right', 'reply.dir.straight', 'reply.dir.turn-left', 'reply.dir.next-to', 'reply.dir.five-minutes',
      'phrase.recovery.repeat',
    ]),
    k.practice({
      kind: 'miniMap',
      challenge: true,
      rounds: [{
        audio: ["Go straight, then turn right. It's next to the bank.", 'Allez tout droit, puis tournez à droite. C’est à côté de la banque.', 'Siga todo recto y luego gire a la derecha. Está al lado del banco.', 'לך ישר, ואז פנה ימינה. זה ליד הבנק.'],
        cells: junction('pins', 'right'), correct: 'right',
      }],
    }),
    k.receipt(['הוראה מהירה בשני שלבים — ומצאת את המקום הנכון על המפה.', 'A fast two-step instruction — and you found the right spot on the map.']),
    { kind: 'summary' },
  ];
}
