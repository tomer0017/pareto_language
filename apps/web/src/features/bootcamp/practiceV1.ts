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

/** The market stall — what is sold, the two prices of the offer, how many, how to pay. */
const STALL_TILES = [
  { id: 'berries', emoji: '🍓' },
  { id: 'one5', emoji: '🍓', label: '= €5' }, { id: 'two8', emoji: '🍓🍓', label: '= €8' }, { id: 'two16', emoji: '🍓🍓', label: '= €16' },
  { id: 'box1', emoji: '📦', label: '×1' }, { id: 'box2', emoji: '📦📦', label: '×2' },
  { id: 'cash', emoji: '💵' }, { id: 'card', emoji: '💳' },
];
/** After the video: what happened at the stall? The offer is one tile — both prices at once. */
const AFTER_VIDEO_TILES = [
  { id: 'berries', emoji: '🍓' }, { id: 'bye', emoji: '🙏😋' },
  { id: 'offer', emoji: '🍓', label: '1 = €5 · 2 = €8' }, { id: 'offer16', emoji: '🍓', label: '1 = €5 · 2 = €16' }, { id: 'offer58', emoji: '🍓', label: '1 = €8 · 2 = €5' },
  { id: 'box1', emoji: '📦', label: '×1' }, { id: 'box2', emoji: '📦📦', label: '×2' },
  { id: 'cash', emoji: '💵' }, { id: 'card', emoji: '💳' },
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
    // THE STALL — what the offer means: one box is €5, two boxes are €8 TOGETHER (never €16).
    k.practice({
      kind: 'visualMatch',
      label: ['בדוכן — הקש על מה ששמעת', 'At the stall — tap what you hear'],
      tiles: STALL_TILES,
      rounds: [
        { audio: ['Fresh strawberries!', 'Fraises fraîches !', '¡Fresas frescas!', 'תותים טריים!'], correct: 'berries', itemId: 'reply.money.fresh-strawberries' },
        { audio: ['Five euros a box.', 'Cinq euros la barquette.', 'Cinco euros la caja.', 'חמישה יורו קופסה.'], correct: 'one5' },
        { audio: ['Two for eight.', 'Deux pour huit.', 'Dos por ocho.', 'שתיים בשמונה.'], correct: 'two8' },
        { audio: ONE_BOX, correct: 'box1', itemId: 'phrase.money.one-box' },
        { audio: BY_CARD, correct: 'card', itemId: 'phrase.money.by-card' },
        // the other way to pay — met here, with its picture, before it is offered as an answer
        { audio: ['In cash.', 'En espèces.', 'En efectivo.', 'במזומן.'], correct: 'cash', itemId: 'phrase.money.in-cash' },
      ],
    }),
    // THE VENDOR'S FRIENDLY WORDS — nobody asks you to say them; you only have to know them.
    k.practice({
      kind: 'matchPairs',
      label: ['מה המוכר אומר? התאם כל משפט למשמעות שלו', 'What does the vendor say? Match each line to its meaning'],
      pairs: [
        ['reply.money.fresh-strawberries', 'reply.money.fresh-strawberries', undefined, '🍓', ['תותים טריים', 'Fresh strawberries']],
        ['reply.money.best-market', 'reply.money.best-market', undefined, '🏆', ['הכי טובים בשוק', 'Best in the market']],
        ['reply.money.perfect', 'reply.money.perfect', undefined, '👌', ['מצוין', 'Perfect']],
        ['reply.money.enjoy-strawberries', 'reply.money.enjoy-strawberries', undefined, '😋', ['תודה! תיהנה מהתותים', 'Thank you! Enjoy the strawberries']],
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

export function m03Steps(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    k.talk('☕', ['משימה 3: בית קפה', 'Mission 3: Coffee Shop'], [
      ['היום לא לומדים "מילים על קפה". היום לומדים לצאת מבית קפה עם ארוחת בוקר ביד.', 'Today we don’t learn “coffee words”. Today you walk out of a café holding breakfast.'],
      ['הסוד: אחרי שאתה מזמין, הבריסטה שואל שאלות המשך. מי שמכיר אותן מראש — אף פעם לא קופא.', 'The secret: after you order, the barista fires follow-up questions. Know them in advance — never freeze.'],
    ], ['להיכנס', 'Walk in']),
    k.prime({
      intro: ['שש מילים שולטות בכל הזמנה בבית קפה.', 'Six words control every café order.'],
      words: [
        { key: 'cafe.coffee', t: ['coffee', 'café', 'café'], meaning: ['קפה', 'coffee'], emoji: '☕' },
        { key: 'cafe.milk', t: ['milk', 'lait', 'leche'], meaning: ['חלב', 'milk'], emoji: '🥛' },
        { key: 'cafe.sugar', t: ['sugar', 'sucre', 'azúcar'], meaning: ['סוכר', 'sugar'], emoji: '🍬' },
        { key: 'size.medium', t: ['medium', 'moyen', 'mediano'], meaning: ['בינוני', 'medium'] },
        { key: 'core.with', t: ['with', 'avec', 'con'], meaning: ['עם', 'with'] },
        { key: 'core.without', t: ['no / without', 'sans', 'sin'], meaning: ['בלי', 'no / without'] },
      ],
      build: 'phrase.coffee.no-sugar',
    }),
    ...k.tools([
      ['phrase.coffee.iced-coffee', ['משפט הזהב', 'The golden template']],
      ['phrase.coffee.no-sugar', ['שליטה בהזמנה', 'Order control']],
      ['phrase.coffee.thats-all', ['הסוגר האוניברסלי', 'The universal closer']],
      ['phrase.coffee.card', ['סוגרים חשבון', 'Settling up']],
    ]),
    k.replies('phrase.coffee.iced-coffee', ['reply.coffee.here-or-to-go', 'reply.coffee.medium-or-large', 'reply.coffee.milk-sugar', 'reply.coffee.anything-else']),
    k.receipt(['אתה כבר מזהה את ארבע שאלות ההמשך של כל בריסטה בעולם.', 'You now recognize the four follow-ups of every barista on earth.']),
    // "Coffee Rush": the barista's questions, one after another — answer each with your own line.
    k.practice({
      kind: 'quickReply',
      label: ['הבריסטה שואל — מה עונים?', 'The barista asks — what do you say?'],
      rounds: [
        { prompt: 'reply.coffee.here-or-to-go', options: [['phrase.coffee.to-go', true], ['phrase.coffee.thats-all', false], ['phrase.coffee.card', false]] },
        { prompt: 'reply.coffee.medium-or-large', options: [['phrase.coffee.medium', true], ['phrase.coffee.no-sugar', false], ['phrase.coffee.croissant', false]] },
        { prompt: 'reply.coffee.milk-sugar', options: [['phrase.coffee.no-sugar', true], ['phrase.coffee.medium', false], ['phrase.coffee.card', false]] },
        { prompt: 'reply.coffee.anything-to-eat', options: [['phrase.coffee.croissant', true], ['phrase.coffee.thats-all', true], ['phrase.coffee.card', false]] },
        { prompt: 'reply.coffee.cash-or-card', options: [['phrase.coffee.card', true], ['phrase.coffee.medium', false], ['phrase.coffee.to-go', false]] },
        { prompt: 'reply.coffee.receipt', options: [['phrase.coffee.yes-please', true], ['phrase.coffee.to-go', false], ['phrase.coffee.iced-coffee', false]] },
      ],
    }),
    // Two orders rebuilt from their pieces. Each language has its own chunks and its own word order.
    k.practice({
      kind: 'sentenceBuilder',
      rounds: [
        { itemId: 'phrase.coffee.iced-coffee', chunks: [["I'd like", 'an iced', 'coffee,', 'please.'], ['Je voudrais', 'un café', 'glacé,', 's’il vous plaît.'], ['Quiero', 'un café', 'con hielo,', 'por favor.']] },
        { itemId: 'phrase.coffee.no-sugar', chunks: [['Milk,', 'no', 'sugar.'], ['Avec', 'du lait,', 'sans', 'sucre.'], ['Con', 'leche,', 'sin', 'azúcar.']] },
      ],
    }),
    k.dialogue('breakfast-order'),
    k.receipt(['הזמנת ארוחת בוקר שלמה: שתייה, גודל, חלב, מאפה, תשלום. הכל.', 'You ordered a full breakfast: drink, size, milk, pastry, payment. All of it.']),
    k.review([
      'phrase.coffee.iced-coffee', 'phrase.coffee.to-go', 'phrase.coffee.medium', 'phrase.coffee.no-sugar', 'phrase.coffee.croissant',
      'phrase.coffee.thats-all', 'phrase.coffee.card', 'phrase.coffee.yes-please',
      'reply.coffee.here-or-to-go', 'reply.coffee.medium-or-large', 'reply.coffee.milk-sugar', 'reply.coffee.anything-to-eat', 'reply.coffee.cash-or-card',
      'phrase.recovery.repeat',
    ]),
    k.ambush('recovery',
      ['Sorry, we are out of croissants — would a muffin be okay instead?', 'Désolé, on n’a plus de croissants — un muffin à la place, ça vous va ?', 'Lo siento, se nos acabaron los cruasanes — ¿le va bien un muffin en su lugar?', 'סליחה, נגמרו הקרואסונים — מאפין במקום זה בסדר?'],
      'phrase.recovery.repeat', 'phrase.coffee.card'),
    k.receipt(['הפתעה מחוץ לתסריט — והגבת עם כלי. זה בדיוק מה שקורה בעולם האמיתי.', 'An off-script surprise — and you answered with a tool. Exactly how real life works.']),
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
