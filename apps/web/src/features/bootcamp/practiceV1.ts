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

/** The café counter, in pictures: what you order, which size, what to eat, finishing, the receipt.
 *  Emoji are drawn 1.5× (the board's tiles are big); the large cup is drawn bigger still than the medium. */
const BIG = 1.5;
const ICED = { id: 'iced', emoji: '☕🧊', scale: BIG };
const HOT = { id: 'hot', emoji: '☕🔥', scale: BIG };
const SIZE_M = { id: 'medium', emoji: '🥤', label: 'M', scale: BIG };
const SIZE_L = { id: 'large', emoji: '🥤', label: 'L', scale: 2.1 };
const CROISSANT = { id: 'croissant', emoji: '🥐', scale: BIG };
const MUFFIN = { id: 'muffin', emoji: '🧁', scale: BIG };
const MORE = { id: 'more', emoji: '➕❓', scale: BIG };
const DONE = { id: 'done', emoji: '✋', scale: BIG };
const RECEIPT = { id: 'receipt', emoji: '🧾', scale: BIG };
const ORDER_TILES = [ICED, HOT, SIZE_M, SIZE_L, CROISSANT, MUFFIN, MORE, DONE, RECEIPT];
/** Six fifty among the prices it is misheard as. */
const CAFE_PRICES = [
  { id: 'e6_50', label: '€6.50' }, { id: 'e6_05', label: '€6.05' }, { id: 'e16_50', label: '€16.50' },
  { id: 'e60_50', label: '€60.50' }, { id: 'e5_60', label: '€5.60' }, { id: 'e6', label: '€6' },
];
/** After the video — your order, then paying. The milk/sugar tiles speak the configurator's ✓ / ✕. */
const GATE_ORDER_TILES = [
  ICED, HOT, SIZE_M, SIZE_L,
  { id: 'milk-no-sugar', emoji: '☕', label: '🥛✓ 🍬✕', scale: 1.3 }, { id: 'milk-and-sugar', emoji: '☕', label: '🥛✓ 🍬✓', scale: 1.3 },
  CROISSANT, MUFFIN, DONE,
];
const GATE_PAY_TILES = [
  { id: 'e6_50', label: '€6.50' }, { id: 'e16_50', label: '€16.50' },
  { id: 'cash', emoji: '💶', scale: BIG }, { id: 'card', emoji: '💳', scale: BIG }, RECEIPT, { id: 'bye', emoji: '👋☀️', scale: BIG },
];

/* The locked conversation, line by line (EN · FR · ES · HE). The barista's lines are the mission's
   `reply.coffee.*` sentences word for word; the learner's are its `phrase.coffee.*` sentences. */
const B_OPENS: L4 = ['Good morning! What can I get you?', 'Bonjour ! Qu’est-ce que je vous sers ?', '¡Buenos días! ¿Qué le sirvo?', 'בוקר טוב! מה להביא לך?'];
const B_SIZE: L4 = ['Sure! Medium or large?', 'Parfait ! Moyen ou grand ?', '¡Perfecto! ¿Mediano o grande?', 'סגור! בינוני או גדול?'];
const B_MILK: L4 = ['Milk and sugar?', 'Lait et sucre ?', '¿Leche y azúcar?', 'חלב וסוכר?'];
const B_EAT: L4 = ['Anything to eat?', 'Quelque chose à manger ?', '¿Algo de comer?', 'משהו לאכול?'];
const B_ELSE: L4 = ['Great choice. Would you like anything else?', 'Excellent choix. Vous désirez autre chose ?', 'Buena elección. ¿Algo más?', 'בחירה מצוינת. עוד משהו?'];
const B_PAY: L4 = ["That'll be six fifty. Cash or card?", 'Ça fait six euros cinquante. Espèces ou carte ?', 'Son seis con cincuenta. ¿Efectivo o tarjeta?', 'זה שש יורו וחמישים. מזומן או כרטיס?'];
/** The first sentence of the payment line, alone — the price, where cash and card are also on the board. */
const B_PRICE: L4 = ["That'll be six fifty.", 'Ça fait six euros cinquante.', 'Son seis con cincuenta.', 'זה שש יורו וחמישים.'];
const B_RECEIPT: L4 = ['Would you like the receipt?', 'Vous voulez le ticket ?', '¿Quiere el recibo?', 'רוצה את הקבלה?'];
const B_BYE: L4 = ['Here you go — enjoy your day!', 'Voilà — bonne journée !', 'Aquí tiene — ¡que tenga un buen día!', 'בבקשה — שיהיה לך יום מעולה!'];
const Y_ICED: L4 = ["I'd like an iced coffee, please.", 'Je voudrais un café glacé, s’il vous plaît.', 'Quiero un café con hielo, por favor.', 'אני רוצה קפה קר, בבקשה.'];
const Y_MEDIUM: L4 = ['Medium, please.', 'Moyen, s’il vous plaît.', 'Mediano, por favor.', 'בינוני, בבקשה.'];
const Y_MILK: L4 = ['Milk, no sugar.', 'Avec du lait, sans sucre.', 'Con leche, sin azúcar.', 'עם חלב, בלי סוכר.'];
const Y_CROISSANT: L4 = ['A croissant, please.', 'Un croissant, s’il vous plaît.', 'Un cruasán, por favor.', 'קרואסון, בבקשה.'];
const Y_ALL: L4 = ["That's all, thanks.", 'C’est tout, merci.', 'Eso es todo, gracias.', 'זה הכל, תודה.'];
const Y_CARD: L4 = ['Card, please.', 'Par carte, s’il vous plaît.', 'Con tarjeta, por favor.', 'בכרטיס, בבקשה.'];

/**
 * Mission 03 — Coffee Shop, on the Mission 01/02 standard: finishing it must mean "I understand the
 * whole café conversation" — fifteen lines, the longest yet. The conversation is LOCKED; everything
 * here is the journey around it, and it is built like the order itself:
 *
 *   Step 0 (optional: iced coffee, medium / large, milk, sugar, with / without, receipt) → your
 *   three key sentences → the barista's follow-up questions, as heard → THE ORDER BOARD (hear it →
 *   tap it: drink · size · food · anything else? · that's all · receipt) → THE MILK & SUGAR
 *   CONFIGURATOR (✓ / ✕, "no" is a choice of its own) → the barista's friendly words → question ↔
 *   answer (ordering) → build your order → six fifty by ear → question ↔ answer (finishing and
 *   paying) → answer on your own → your order at a glance → the conversation → review → the barista
 *   speed run (all seven questions, in order) → the video → what did you order? how did you pay?
 *
 * Mission 02's money (cash / card, prices by ear) is reactivated quickly, not retaught. Every Quick
 * Reply prompt is a real line of the conversation; recovery stays where it has a reason — inside the
 * conversation, on the fast lines, with the reason shown. The coverage promise is written down in
 * `mission03Coverage.ts` and enforced by `mission03.test.ts`.
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
        { key: 'cafe.iced-coffee', t: ['iced coffee', 'café glacé', 'café con hielo'], meaning: ['קפה קר (עם קרח)', 'iced coffee'], emoji: '🧊' },
        { key: 'size.medium', t: ['medium', 'moyen', 'mediano'], meaning: ['בינוני (M)', 'medium (M)'], emoji: '🥤' },
        { key: 'size.large', t: ['large', 'grand', 'grande'], meaning: ['גדול (L)', 'large (L)'] },
        { key: 'cafe.milk', t: ['milk', 'lait', 'leche'], meaning: ['חלב', 'milk'], emoji: '🥛' },
        { key: 'cafe.sugar', t: ['sugar', 'sucre', 'azúcar'], meaning: ['סוכר', 'sugar'], emoji: '🍬' },
        { key: 'core.with', t: ['with', 'avec', 'con'], meaning: ['עם', 'with'], emoji: '✓' },
        { key: 'core.without', t: ['no', 'sans', 'sin'], meaning: ['בלי', 'no / without'], emoji: '✕' },
        { key: 'cafe.receipt', t: ['receipt', 'ticket', 'recibo'], meaning: ['קבלה', 'receipt'], emoji: '🧾' },
      ],
      build: 'phrase.coffee.no-sugar',
    }),
    ...k.tools([
      ['phrase.coffee.iced-coffee', ['משפט הזהב', 'The golden template']],
      ['phrase.coffee.no-sugar', ['שליטה בהזמנה', 'Order control']],
      ['phrase.coffee.thats-all', ['הסוגר האוניברסלי', 'The universal closer']],
    ]),
    // LISTENING — after you order, the barista's follow-ups (and the goodbye), exactly as the video says them.
    k.replies('phrase.coffee.iced-coffee', ['reply.coffee.medium-or-large', 'reply.coffee.milk-sugar', 'reply.coffee.anything-to-eat', 'reply.coffee.anything-else', 'reply.coffee.cash-or-card', 'reply.coffee.enjoy']),
    k.receipt(['אתה כבר מזהה את כל מה שהבריסטה אומר אחרי שהזמנת — גודל, חלב, אוכל, עוד משהו, תשלום ופרידה.', 'You now recognize everything the barista says after you order — size, milk, food, anything else, payment and goodbye.']),
    // THE ORDER BOARD — the order in the sequence it happens: hear it, tap what it means.
    k.practice({
      kind: 'visualMatch',
      label: ['ההזמנה — הקש על מה ששמעת', 'The order — tap what you hear'],
      tiles: ORDER_TILES,
      rounds: [
        { audio: Y_ICED, correct: 'iced', itemId: 'phrase.coffee.iced-coffee' },
        { audio: Y_MEDIUM, correct: 'medium', itemId: 'phrase.coffee.medium' },
        { audio: Y_CROISSANT, correct: 'croissant', itemId: 'phrase.coffee.croissant' },
        { audio: B_ELSE, correct: 'more', itemId: 'reply.coffee.anything-else' },
        { audio: Y_ALL, correct: 'done', itemId: 'phrase.coffee.thats-all' },
        { audio: B_RECEIPT, correct: 'receipt', itemId: 'reply.coffee.receipt' },
      ],
    }),
    // THE MILK & SUGAR CONFIGURATOR — "with / without" by doing it; then the same two words, swapped.
    k.practice({
      kind: 'customize',
      label: ['חלב וסוכר? — הכן את הקפה בדיוק כמו ששמעת', 'Milk and sugar? — make the coffee exactly as you heard it'],
      base: '☕🧊',
      options: [{ id: 'milk', emoji: '🥛', label: ['חלב', 'Milk'] }, { id: 'sugar', emoji: '🍬', label: ['סוכר', 'Sugar'] }],
      rounds: [
        { audio: Y_MILK, on: ['milk'], itemId: 'phrase.coffee.no-sugar' },
        // one tiny transfer: the same two words, the other way round — the pattern, not the sentence
        { audio: ['Sugar, no milk.', 'Avec du sucre, sans lait.', 'Con azúcar, sin leche.', 'עם סוכר, בלי חלב.'], on: ['sugar'] },
      ],
    }),
    // THE BARISTA'S FRIENDLY WORDS — nobody asks you to say them; you only have to know them.
    k.practice({
      kind: 'matchPairs',
      label: ['מה הבריסטה אומר? התאם כל משפט למשמעות שלו', 'What does the barista say? Match each line to its meaning'],
      pairs: [
        ['reply.coffee.good-morning', 'reply.coffee.good-morning', undefined, '🌅', ['בוקר טוב', 'Good morning']],
        ['reply.coffee.sure', 'reply.coffee.sure', undefined, '👍', ['בטח / מצוין', 'Sure / perfect']],
        ['reply.coffee.great-choice', 'reply.coffee.great-choice', undefined, '👌', ['בחירה מצוינת', 'Great choice']],
        ['reply.coffee.enjoy', 'reply.coffee.enjoy', undefined, '👋☀️', ['בבקשה — שיהיה לך יום מעולה', 'Here you go — enjoy your day']],
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
    // THE PRICE — Mission 02's skill, in the café: six fifty, against the price it is misheard as.
    k.practice({
      kind: 'visualMatch',
      label: ['כמה זה? הקש על המחיר ששמעת', 'How much? Tap the price you hear'],
      tiles: CAFE_PRICES,
      rounds: [
        { audio: B_PRICE, correct: 'e6_50' },
        { audio: ['Sixteen fifty.', 'Seize euros cinquante.', 'Dieciséis con cincuenta.', 'שש עשרה וחמישים.'], correct: 'e16_50' },
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
      ['🥐 קרואסון — ✋ וזה הכל', '🥐 A croissant — ✋ and that’s all'],
      ['💶 ‎€6.50 · 💳 בכרטיס · 🧾 קבלה — כן', '💶 €6.50 · 💳 by card · 🧾 receipt — yes'],
    ], ['להזמין', 'Order it']),
    k.dialogue('breakfast-order'),
    k.receipt(['הזמנת ארוחת בוקר שלמה: שתייה, גודל, חלב, מאפה, תשלום וקבלה. הכל.', 'You ordered a full breakfast: drink, size, milk, pastry, payment and receipt. All of it.']),
    k.review([
      'reply.coffee.what-can-i-get', 'reply.coffee.medium-or-large', 'phrase.coffee.medium', 'reply.coffee.milk-sugar',
      'reply.coffee.anything-to-eat', 'phrase.coffee.croissant', 'reply.coffee.anything-else', 'reply.coffee.cash-or-card',
      'phrase.coffee.card', 'reply.coffee.receipt', 'phrase.coffee.yes-please', 'phrase.recovery.repeat',
      // not in this conversation, never asked for here — met once, so that the Arrival Day checkpoint,
      // which offers it as a WRONG option, uses only sentences the learner has seen
      'phrase.coffee.to-go',
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
    // …then: what did you order? how did you pay? Answered by tapping, not by translating.
    k.practice({
      kind: 'visualMatch',
      label: ['מה הזמנת? הקש על מה ששמעת', 'What did you order? Tap what you hear'],
      tiles: GATE_ORDER_TILES,
      rounds: [
        { audio: Y_ICED, correct: 'iced', itemId: 'phrase.coffee.iced-coffee' },
        { audio: Y_MEDIUM, correct: 'medium', itemId: 'phrase.coffee.medium' },
        { audio: Y_MILK, correct: 'milk-no-sugar', itemId: 'phrase.coffee.no-sugar' },
        { audio: Y_CROISSANT, correct: 'croissant', itemId: 'phrase.coffee.croissant' },
        { audio: Y_ALL, correct: 'done', itemId: 'phrase.coffee.thats-all' },
      ],
    }),
    k.practice({
      kind: 'visualMatch',
      label: ['ואיך שילמת? הקש על מה ששמעת', 'And how did you pay? Tap what you hear'],
      tiles: GATE_PAY_TILES,
      rounds: [
        { audio: B_PRICE, correct: 'e6_50' },
        { audio: Y_CARD, correct: 'card', itemId: 'phrase.coffee.card' },
        { audio: B_RECEIPT, correct: 'receipt', itemId: 'reply.coffee.receipt' },
        { audio: B_BYE, correct: 'bye', itemId: 'reply.coffee.enjoy' },
      ],
    }),
    k.receipt(['הבנת את כל השיחה בבית הקפה — מה הזמנת, איזה גודל, עם מה ובלי מה, מה אכלת, כמה שילמת ואיך.', 'You understood the whole café conversation — what you ordered, the size, with and without, what you ate, the price and how you paid.']),
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
