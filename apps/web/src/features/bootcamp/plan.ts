import type { LocalizedText } from '@ready/content-schema';

/**
 * READY MISSIONS — the Core 30, in 5 phases. This array is the ONE source of truth for the
 * curriculum: its length is the mission count and its ORDER is the journey — never hard-code either
 * elsewhere. Pareto-first: the smallest amount of language that gives the largest amount of real
 * communication — reusable sentence frames (want / need / have / can, going to, I think, because)
 * before nouns. Checkpoints and the finale are cold integration missions — no new content, pure
 * evidence.
 *
 * `day` is NOT the mission's position: it is the stable content-registry key, so a mission keeps
 * its key (and its video file) when the journey is reordered. The number a learner sees is
 * `missionNumber(day)`. Missions that left the Core are listed in `EXTENDED_POOL` below.
 */

export interface MissionPlan {
  /** Stable semantic identity — what persisted progress is keyed by. Never derived from the
   *  mission's position, so the journey can be reordered without losing anyone's progress. */
  id: string;
  day: number;                    // content-registry key (DAYS / DAYS_FR / DAYS_ES) + in-memory handle
  phase: number;
  title: LocalizedText;
  objective: LocalizedText;
  confidenceGain: LocalizedText;
  situations: string[];
  targets: { concepts: number; phrases: number; dialogues: number };
  listeningSkill: string;
  speakingSkill: string;
  minutes: number;
  feeling: LocalizedText;
  why: string;
  preparesNext: string;
  checkpoint?: boolean;
}

export const PHASES: { n: number; title: LocalizedText; icon: string }[] = [
  { n: 1, title: { en: 'Foundations', he: 'יסודות' }, icon: '🛟' },
  { n: 2, title: { en: 'Arrival', he: 'הגעה' }, icon: '🛬' },
  { n: 3, title: { en: 'Everyday Life', he: 'חיי יום-יום' }, icon: '🏡' },
  { n: 4, title: { en: 'City & Conversation', he: 'עיר ושיחה' }, icon: '🏙️' },
  { n: 5, title: { en: 'Mastery', he: 'שליטה' }, icon: '🎖️' },
];

const T = (he: string, en: string): LocalizedText => ({ he, en });

export const BOOTCAMP_PLAN: MissionPlan[] = [
  // ── Phase 1 · Foundations ──
  { id: 'introduce-myself', day: 1, phase: 1, title: T('להציג את עצמי', 'Introduce Myself'),
    objective: T('שם, מאיפה, פעם ראשונה כאן — בביטחון ובחיוך.', 'Name, origin, first time here — with confidence and a smile.'),
    confidenceGain: T('חיבור אנושי ראשון.', 'First human connection.'),
    situations: ['social'], targets: { concepts: 8, phrases: 5, dialogues: 1 },
    listeningSkill: "'Where are you from?' variants", speakingSkill: 'the My-name opener, performance level',
    minutes: 20, feeling: T('אפשר להכיר אותי.', 'People can know me.'),
    why: 'Identity phrases: highest warmth, lowest risk production.',
    preparesNext: 'The opener habit used in every mission after.' },
  { id: 'numbers-money', day: 2, phase: 1, title: T('כסף ומספרים', 'Numbers & Money'),
    objective: T('מספרים בשמיעה, מחירים, עודף — בלי להנהן סתם.', 'Numbers by ear, prices, change — no more blind nodding.'),
    confidenceGain: T('הכסף מובן. תמיד.', 'Money makes sense. Always.'),
    situations: ['paying'], targets: { concepts: 14, phrases: 3, dialogues: 1 },
    listeningSkill: 'price extraction at speed', speakingSkill: 'How-much + number answers',
    minutes: 20, feeling: T('אי אפשר לעבוד עליי במחירים.', 'Nobody can confuse me with a price.'),
    why: 'Numbers are the #1 comprehension task abroad; unlocks every transaction.',
    preparesNext: 'Every payment beat in missions 3–30.' },
  { id: 'coffee-shop', day: 3, phase: 1, title: T('בית קפה', 'Coffee Shop'),
    objective: T('הזמנת בוקר שלמה: שתייה, אוכל, תשלום, קבלה — מקצה לקצה.', 'A complete breakfast order: drink, food, payment, receipt — end to end.'),
    confidenceGain: T('העסקה המלאה הראשונה, כולל כל שאלות ההמשך.', 'First full transaction incl. every follow-up question.'),
    situations: ['restaurant'], targets: { concepts: 14, phrases: 6, dialogues: 2 },
    listeningSkill: 'the full barista question-chain (here/to-go, milk/sugar, anything else…)', speakingSkill: "I'd-like template + closers",
    minutes: 22, feeling: T('אני מסוגל להזמין ארוחת בוקר אמיתית.', 'I can order a real breakfast.'),
    why: 'THE depth exemplar: one situation, every realistic follow-up (deep moment system).',
    preparesNext: 'The reply-chain pattern reused in every service mission; then the want/need/have/can frames.' },
  { id: 'everyday-core', day: 30, phase: 1, title: T('רוצה, צריך, יש לי, יכול', 'Everyday Core: Want / Need / Have / Can'),
    objective: T('אני רוצה, אני צריך, יש לי, אני יכול, אני יודע — והשאלות שלהם.', 'I want, I need, I have, I can, I know — and their questions.'),
    confidenceGain: T('חמש מילים שבונות מאות משפטים.', 'Five words that build hundreds of sentences.'),
    situations: ['social'], targets: { concepts: 10, phrases: 10, dialogues: 1 },
    listeningSkill: 'do-you-want / need / have / can questions', speakingSkill: 'the want / need / have / can / know frames',
    minutes: 22, feeling: T('אני יכול להגיד מה אני צריך.', 'I can say what I need.'),
    why: 'The sentence machinery of the whole course: one frame generates hundreds of sentences.',
    preparesNext: 'Every later mission swaps new nouns into these frames.' },
  { id: 'directions', day: 5, phase: 1, title: T('כיוונים', 'Directions'),
    objective: T('לשאול — ובעיקר להבין את התשובה, כולל ציוני דרך.', 'Ask — and truly understand the answer, landmarks included.'),
    confidenceGain: T('ללכת לאיבוד מפסיק להפחיד.', 'Being lost stops being scary.'),
    situations: ['directions'], targets: { concepts: 9, phrases: 4, dialogues: 1 },
    listeningSkill: 'left/right/straight + landmark chains', speakingSkill: 'How-do-I-get + show-me combo',
    minutes: 20, feeling: T('העיר נפתחה.', 'The city opened up.'),
    why: 'Directions are 90% listening — the anti-freeze muscle, pure.',
    preparesNext: 'Spatial answers feed taxi and transport.' },
  // ── Phase 2 · Arrival ──
  { id: 'airport-border', day: 10, phase: 2, title: T('שדה תעופה וגבול', 'Airport & Border'),
    objective: T('דלפק, שער, ושאלות הגבול — רגוע.', 'Counter, gate, and the border questions — calm.'),
    confidenceGain: T('סמכות מפסיקה להפחיד.', 'Authority stops being frightening.'),
    situations: ['border'], targets: { concepts: 8, phrases: 4, dialogues: 1 },
    listeningSkill: 'purpose/duration variants', speakingSkill: 'trip + nights answers',
    minutes: 20, feeling: T('גבול זה בסך הכל תסריט.', 'A border is just a script.'),
    why: 'Scariest moment, most predictable script — best fear-per-minute ROI.',
    preparesNext: 'Calm-under-authority for emergencies later.' },
  { id: 'taxi', day: 6, phase: 2, title: T('מונית', 'Taxi / Uber'),
    objective: T('יעד, מחיר, עצירה — כולל מהלך הצגת הכתובת.', 'Destination, price, stop — incl. the address-show move.'),
    confidenceGain: T('כל עיר נגישה.', 'Every city is reachable.'),
    situations: ['taxi'], targets: { concepts: 6, phrases: 4, dialogues: 1 },
    listeningSkill: 'driver smalltalk + price', speakingSkill: 'To-this-address opener',
    minutes: 20, feeling: T('אני מגיע לכל מקום.', 'I can get anywhere.'),
    why: 'The highest-stakes 60-second conversation of day one abroad.',
    preparesNext: 'Arrival confidence for hotel check-in.' },
  { id: 'hotel-check-in', day: 7, phase: 2, title: T("צ'ק-אין במלון", 'Hotel Check-in'),
    objective: T('הזמנה ← שם ← מפתח ← קומה ← ארוחת בוקר.', 'Reservation → name → key → floor → breakfast.'),
    confidenceGain: T('בסיס הבית מובטח.', 'Home base secured.'),
    situations: ['hotel'], targets: { concepts: 8, phrases: 5, dialogues: 1 },
    listeningSkill: 'floor/times comprehension', speakingSkill: 'reservation opener',
    minutes: 20, feeling: T('אני שייך לכאן.', 'I belong here.'),
    why: 'Trip-start concentrated; nail it once, relax all week.',
    preparesNext: 'Completes taxi+hotel for the arrival checkpoint.' },
  { id: 'shopping', day: 8, phase: 2, title: T('קניות', 'Shopping'),
    objective: T('להסתכל, למדוד, לבקש מידה, להחליט, לשלם.', 'Browse, try on, ask a size, decide, pay.'),
    confidenceGain: T('חנויות הן טריטוריה ידידותית.', 'Shops are friendly territory.'),
    situations: ['paying'], targets: { concepts: 8, phrases: 5, dialogues: 1 },
    listeningSkill: 'size/stock/sale replies', speakingSkill: 'just-looking + try-on + take-it',
    minutes: 20, feeling: T('אני קונה כמו בן אדם.', 'I shop like a person.'),
    why: 'Low-stakes reps of decision language; joyful and confidence-building.',
    preparesNext: 'Payment + decision confidence for the checkpoint.' },
  { id: 'arrival-day-checkpoint', day: 9, phase: 2, checkpoint: true, title: T('נקודת ביקורת: יום הגעה', 'CHECKPOINT: Arrival Day'),
    objective: T('שרשור קר: מונית ← מלון. רק מה שכבר למדת, בלי הכנה.', 'Cold chain: taxi → hotel. Only what you already know, unannounced.'),
    confidenceGain: T('הוכחה: יום הגעה שלם — שריד.', 'Proof: a full arrival day, survivable.'),
    situations: ['taxi', 'hotel'], targets: { concepts: 0, phrases: 0, dialogues: 2 },
    listeningSkill: 'first cold opens', speakingSkill: 'chained answers under mild stress',
    minutes: 20, feeling: T('אני מוכן לנחות.', 'I am ready to land.'),
    why: 'Checkpoints convert learning into receipts — the boss level without the candy.',
    preparesNext: 'Cold format unlocked for all later missions.' },
  // ── Phase 3 · Everyday Life ──
  { id: 'small-talk', day: 22, phase: 3, title: T('שיחת חולין והמלצות', 'Small Talk & Recommendations'),
    objective: T('מאיפה אתה, פעם ראשונה כאן, מה מומלץ — שלוש דקות עם זר.', 'Where from, first time here, what to try — three minutes with a stranger.'),
    confidenceGain: T('חיבור, לא רק עסקאות.', 'Connection, not just transactions.'),
    situations: ['social'], targets: { concepts: 8, phrases: 5, dialogues: 1 },
    listeningSkill: 'follow-up questions', speakingSkill: 'returning the question + asking for a recommendation',
    minutes: 20, feeling: T('דיברתי עם מישהו — סתם כי היה נעים.', 'I talked to someone — just because it was nice.'),
    why: 'Trips are remembered by these minutes — so it comes right after arrival, not at the end.',
    preparesNext: 'The human-conversation thread: plans, home, hobbies, past and future.' },
  { id: 'time-plans', day: 31, phase: 3, title: T('זמן ותוכניות', 'Time & Plans'),
    objective: T('היום, הערב, מחר, אחר כך — לקבוע מה עושים ומתי.', 'Today, tonight, tomorrow, later — decide what to do, and when.'),
    confidenceGain: T('אני קובע תוכניות עם אנשים.', 'I make plans with people.'),
    situations: ['social'], targets: { concepts: 12, phrases: 8, dialogues: 1 },
    listeningSkill: 'times + early / late + are-you-free', speakingSkill: 'what-time / let-us-meet / I-am-free',
    minutes: 20, feeling: T('קבענו. אני בא.', 'It is set. I am coming.'),
    why: 'Time words turn single sentences into plans; they recur in every conversation.',
    preparesNext: 'The time frame for talking about home, the past and the future.' },
  { id: 'home-family', day: 32, phase: 3, title: T('בית, משפחה ושגרה', 'Home, Family & Daily Routine'),
    objective: T('אני הולך הביתה, לאכול אצל סבתא, לישון — חיים רגילים.', 'I am going home, to eat at my grandmother’s, to sleep — ordinary life.'),
    confidenceGain: T('אני מדבר גם על החיים, לא רק על הטיול.', 'I can talk about life, not only about the trip.'),
    situations: ['social'], targets: { concepts: 10, phrases: 7, dialogues: 1 },
    listeningSkill: 'come in / sit here / are you hungry', speakingSkill: 'the I-am-going-to frame',
    minutes: 20, feeling: T('הרגשתי בבית.', 'I felt at home.'),
    why: 'Connects travel language to normal human life with one reusable frame.',
    preparesNext: 'The going-to frame, reused for hobbies and future plans.' },
  { id: 'restaurant-meal', day: 4, phase: 3, title: T('ארוחה במסעדה', 'Restaurant Meal'),
    objective: T('ארוחה שלמה: שולחן, תפריט, הזמנה, שתייה, בלי בצל, הכל בסדר?, חשבון.', 'A whole meal: table, menu, order, drink, no onions, everything okay?, bill.'),
    confidenceGain: T('העסקה השלמה במסעדה — בידיים שלי.', 'The whole restaurant transaction — in my hands.'),
    situations: ['restaurant'], targets: { concepts: 7, phrases: 4, dialogues: 1 },
    listeningSkill: 'the waiter chain (reservation, ready-to-order, to-drink, dessert)', speakingSkill: 'table opener + order + bill',
    minutes: 22, feeling: T('ארוחת ערב זה שלי.', 'Dinner is mine.'),
    why: 'The ONE restaurant mission: Restaurant Meal and Restaurant Basics were near-duplicates and are merged here.',
    preparesNext: 'The waiter reply-chain, reused for food preferences and every later meal.' },
  { id: 'special-requests-allergies', day: 13, phase: 3, title: T('העדפות אוכל ואלרגיות', 'Food Preferences & Allergies'),
    objective: T('בלי בצל, אלרגי לאגוזים, צמחוני — ברור ובטוח.', 'No onions, allergic to nuts, vegetarian — clear and safe.'),
    confidenceGain: T('אני יודע להגיד מה אסור לי — ולוודא שהמטבח יודע.', 'I can say what I cannot eat — and make sure the kitchen knows.'),
    situations: ['restaurant'], targets: { concepts: 9, phrases: 4, dialogues: 1 },
    listeningSkill: 'kitchen-check replies', speakingSkill: 'Without-template + allergic (timed)',
    minutes: 20, feeling: T('הגוף שלי מוגן.', 'My body is protected.'),
    why: 'RoF-3 content: rare need, catastrophic to lack.',
    preparesNext: 'Safety phrasing for pharmacy/emergency.' },
  { id: 'hobbies-free-time', day: 33, phase: 3, title: T('תחביבים וזמן פנוי', 'Hobbies & Free Time'),
    objective: T('אוהב, לא אוהב, בדרך כלל, רוצה לנסות — ולשאול בחזרה.', 'Like, don’t like, usually, want to try — and ask back.'),
    confidenceGain: T('יש לי על מה לדבר.', 'I have something to talk about.'),
    situations: ['social'], targets: { concepts: 9, phrases: 8, dialogues: 1 },
    listeningSkill: 'do-you-like questions', speakingSkill: 'like / love / don’t like / usually / want to try',
    minutes: 20, feeling: T('מישהו מכיר אותי עכשיו קצת יותר.', 'Someone knows me a little better now.'),
    why: 'Four frames carry any hobby; the hobby itself is a replaceable variable.',
    preparesNext: 'Self-expression for the Everyday Day checkpoint.' },
  { id: 'supermarket', day: 16, phase: 3, title: T('סופרמרקט וקניות יום-יום', 'Supermarket & Everyday Shopping'),
    objective: T('למצוא מוצר, לשלם בקופה, לבקש שקית.', 'Find the product, pay at the checkout, ask for a bag.'),
    confidenceGain: T('קניות בסיסיות בלי תלות באף אחד.', 'Basic groceries with zero dependence.'),
    situations: ['paying'], targets: { concepts: 8, phrases: 3, dialogues: 1 },
    listeningSkill: 'cashier questions', speakingSkill: 'where-is + bag/receipt answers',
    minutes: 18, feeling: T('היום-יום פשוט זול ופשוט.', 'Daily life just got cheap and easy.'),
    why: 'Independence multiplier; heavy recognition (signs, labels) = cheap wins.',
    preparesNext: 'Everyday independence for the Everyday Day checkpoint.' },
  { id: 'food-day-checkpoint', day: 17, phase: 3, checkpoint: true, title: T('נקודת ביקורת: יום רגיל', 'CHECKPOINT: Everyday Day'),
    objective: T('קפה בבוקר, תוכניות עם חבר, קנייה קטנה, ארוחת ערב — קר.', 'Morning coffee, plans with a friend, a small purchase, dinner — cold.'),
    confidenceGain: T('יום רגיל שלם בלי רשת ביטחון.', 'A whole ordinary day without the net.'),
    situations: ['restaurant', 'paying', 'social'], targets: { concepts: 0, phrases: 0, dialogues: 4 },
    listeningSkill: 'cold chains', speakingSkill: 'switching between ordering, planning and talking about myself',
    minutes: 20, feeling: T('יום רגיל — ואני מסתדר בו.', 'An ordinary day — and I manage it.'),
    why: 'Second proof milestone; receipts on the fridge.',
    preparesNext: 'Confidence base for the city and for real conversation.' },
  // ── Phase 4 · City & Conversation ──
  { id: 'public-transport', day: 18, phase: 4, title: T('תחבורה ציבורית', 'Public Transport'),
    objective: T('כרטיס, רציף, כיוון, ירידה נכונה.', 'Ticket, platform, direction, the right stop.'),
    confidenceGain: T('העיר זזה בשבילי, בזול.', 'The city moves for me, cheaply.'),
    situations: ['transport'], targets: { concepts: 8, phrases: 4, dialogues: 1 },
    listeningSkill: 'announcements + which-platform answers', speakingSkill: 'ticket + does-it-stop',
    minutes: 20, feeling: T('אני זז כמו מקומי.', 'I move like a local.'),
    why: 'Unlocks independence beyond taxi budgets.',
    preparesNext: 'City movement; then talking about where you went.' },
  { id: 'past-events', day: 34, phase: 4, title: T('עבר: מה עשיתי', 'Past & Recent Events'),
    objective: T('הלכתי, ראיתי, אכלתי, ישנתי, היה טוב — לספר מה עשית.', 'I went, I saw, I ate, I stayed, it was good — say what you did.'),
    confidenceGain: T('אני יכול לספר מה קרה.', 'I can tell what happened.'),
    situations: ['social'], targets: { concepts: 8, phrases: 8, dialogues: 1 },
    listeningSkill: 'where-were-you / what-did-you-do / did-you-like-it', speakingSkill: 'five past verbs',
    minutes: 20, feeling: T('יש לי סיפור לספר.', 'I have a story to tell.'),
    why: 'Five past verbs answer almost every "what did you do?" a traveler is asked.',
    preparesNext: 'The other half of the story: where you are going next.' },
  { id: 'future-plans', day: 35, phase: 4, title: T('לאן ממשיכים: תוכניות', 'Future Travel & Plans'),
    objective: T('לאן אני נוסע, לכמה זמן, מה אני רוצה לעשות, ומה אחרי זה.', 'Where I am going, for how long, what I want to do, and what comes after.'),
    confidenceGain: T('אני מספר על התוכניות שלי.', 'I can talk about my plans.'),
    situations: ['social'], targets: { concepts: 8, phrases: 9, dialogues: 1 },
    listeningSkill: 'where-next / how-long / and-after-that', speakingSkill: 'going-to / will-be-there / want-to / after-that',
    minutes: 20, feeling: T('הטיול שלי — במילים שלי.', 'My trip — in my words.'),
    why: 'The most common question between travelers; structures over destinations.',
    preparesNext: 'Past + future together, used in the city checkpoint.' },
  { id: 'fixing-problems', day: 24, phase: 4, title: T('לתקן בעיה', 'Fixing Problems'),
    objective: T('הזמנה שגויה, חיוב כפול, מזגן שלא עובד, חדר רועש — נפתרים באלגנטיות.', 'Wrong order, double charge, broken AC, noisy room — fixed with grace.'),
    confidenceGain: T('תקלה היא תסריט, לא משבר.', 'Friction is a script, not a crisis.'),
    situations: ['all'], targets: { concepts: 6, phrases: 5, dialogues: 2 },
    listeningSkill: 'apology/solution replies', speakingSkill: 'polite complaint + recovery chains',
    minutes: 22, feeling: T('דברים משתבשים. אני לא.', 'Things go wrong. I don’t.'),
    why: 'ONE general problem-solving mission (the old Fixing Problems + the reusable part of Hotel Requests).',
    preparesNext: 'Resilience under surprise; then saying what you think.' },
  { id: 'opinions-reactions', day: 36, phase: 4, title: T('דעות, רגשות ותגובות', 'Opinions, Feelings & Reactions'),
    objective: T('אני חושב, למה, כי, אבל, אולי, באמת?, ברור.', 'I think, why, because, but, maybe, really?, of course.'),
    confidenceGain: T('אני נשמע כמו בן אדם, לא כמו שיחון.', 'I sound like a person, not a phrasebook.'),
    situations: ['social'], targets: { concepts: 10, phrases: 9, dialogues: 1 },
    listeningSkill: 'what-do-you-think / why / really', speakingSkill: 'I-think / because / but / maybe',
    minutes: 20, feeling: T('אמרתי מה אני חושב.', 'I said what I think.'),
    why: 'Connectors and reactions are tiny, extremely frequent, and what makes speech sound human.',
    preparesNext: 'Human conversation for the City & Conversation checkpoint.' },
  { id: 'city-day-checkpoint', day: 23, phase: 4, checkpoint: true, title: T('נקודת ביקורת: עיר ושיחה', 'CHECKPOINT: City & Conversation'),
    objective: T('תחבורה ← שיחה עם מקומי ← מה עשיתי ולאן אני ממשיך. קר, ברצף.', 'Transport → a chat with a local → what I did and where I go next. Cold, chained.'),
    confidenceGain: T('עיר זרה = מגרש ביתי.', 'A foreign city = home turf.'),
    situations: ['transport', 'social'], targets: { concepts: 0, phrases: 0, dialogues: 3 },
    listeningSkill: 'mixed cold chains', speakingSkill: 'context switching',
    minutes: 20, feeling: T('שלוש הוכחות. אפס קפיאות.', 'Three proofs. Zero freezes.'),
    why: 'Third milestone: moving through a city AND holding a simple human conversation.',
    preparesNext: 'The mastery phase assumes city fluency.' },
  // ── Phase 5 · Mastery ──
  { id: 'lost-stolen-police', day: 37, phase: 5, title: T('אבד, נגנב, משטרה', 'Lost / Stolen / Police'),
    objective: T('איבדתי, לא מוצא, נגנב, איפה המשטרה, אני רוצה לדווח.', 'I lost, I can’t find, it was stolen, where the police are, I want to report it.'),
    confidenceGain: T('גם כשמשהו נעלם — יש לי תסריט.', 'Even when something disappears — I have a script.'),
    situations: ['emergency'], targets: { concepts: 8, phrases: 9, dialogues: 1 },
    listeningSkill: 'what-happened / where-did-you-last-see-it', speakingSkill: 'lost / can’t find / stolen / report',
    minutes: 20, feeling: T('זה מעצבן, אבל אני מטפל בזה.', 'It is annoying, but I am handling it.'),
    why: 'A common, stressful, non-urgent problem — kept out of the Emergency call so both stay coherent.',
    preparesNext: 'Calm reporting, before health and emergency.' },
  { id: 'pharmacy-health', day: 25, phase: 5, title: T('בית מרקחת ובריאות', 'Pharmacy & Health'),
    objective: T('מה כואב, אלרגיות, כל כמה זמן — להסביר ולהבין.', 'What hurts, allergies, how often — explain and understand.'),
    confidenceGain: T('הגוף שלי מטופל בכל שפה.', 'My body is cared for in any language.'),
    situations: ['medical'], targets: { concepts: 9, phrases: 5, dialogues: 1 },
    listeningSkill: 'instructions comprehension', speakingSkill: 'pain/allergy reporters',
    minutes: 20, feeling: T('גם חולה — אני מסתדר.', 'Even sick — I manage.'),
    why: 'RoF-3; trained near the end so it stays fresh for the trip.',
    preparesNext: 'Health floor under the emergency mission.' },
  { id: 'emergency', day: 26, phase: 5, title: T('חירום', 'Emergency'),
    objective: T('עזרה, אמבולנס, איפה אני — שיחת חירום אחת, אוטומטית תחת לחץ.', 'Help, ambulance, where I am — one emergency call, automatic under stress.'),
    confidenceGain: T('לתרחיש הגרוע ביותר יש תסריט.', 'The worst case has a script.'),
    situations: ['emergency'], targets: { concepts: 7, phrases: 5, dialogues: 1 },
    listeningSkill: 'responder questions', speakingSkill: 'overlearned emergency set, timed',
    minutes: 20, feeling: T('שיקרה מה שיקרה — אפעל.', 'Whatever happens — I act.'),
    why: 'Under real stress only automatic memory survives.',
    preparesNext: 'The safety floor under the finale.' },
  { id: 'no-subtitles', day: 27, phase: 5, title: T('בלי כתוביות', 'No Subtitles'),
    objective: T('כל הדיאלוגים — בלי טקסט, עם וריאציות הפתעה.', 'Every dialogue — no text, surprise variants.'),
    confidenceGain: T('האוזניים עומדות לבד.', 'My ears stand alone.'),
    situations: ['all'], targets: { concepts: 0, phrases: 0, dialogues: 3 },
    listeningSkill: 'no-subtitle + variants', speakingSkill: 'responding under uncertainty',
    minutes: 20, feeling: T('אני סומך על האוזניים שלי.', 'I trust my ears.'),
    why: 'Visible removal of training wheels is itself a receipt.',
    preparesNext: 'Cold format for the rehearsal.' },
  { id: 'dress-rehearsal', day: 28, phase: 5, title: T('חזרה גנרלית: ערב שלם', 'Dress Rehearsal: Full Evening'),
    objective: T('מונית ← מסעדה ← תקלה ← תשלום. טייק אחד.', 'Taxi → restaurant → problem → payment. One take.'),
    confidenceGain: T('רצף רגעים = זרימה אחת.', 'Chained moments feel like one flow.'),
    situations: ['taxi', 'restaurant', 'paying'], targets: { concepts: 0, phrases: 0, dialogues: 4 },
    listeningSkill: 'continuous mixed', speakingSkill: 'sustained, one take',
    minutes: 22, feeling: T('זה היה… כמעט כיף?', 'That was… almost fun?'),
    why: 'The athlete’s rehearsal before race day, one designed surprise included.',
    preparesNext: 'The finale format: a whole day, cold.' },
  { id: 'complete-day-abroad', day: 29, phase: 5, checkpoint: true, title: T('יום שלם לבד בחו״ל', 'A Complete Day Abroad Alone'),
    objective: T('מבוקר עד לילה: מה שאני צריך, מונית, ארוחה שמשתבשת, שיחה עם מטייל, ורגע שלא הבנתי.', 'Morning to night: what I need, a taxi, a meal that goes wrong, a chat with a traveler, and a moment I did not catch.'),
    confidenceGain: T('עצמאות — מוכחת.', 'Independence — proven.'),
    situations: ['all'], targets: { concepts: 0, phrases: 0, dialogues: 5 },
    listeningSkill: 'everything, cold', speakingSkill: 'everything, cold',
    minutes: 25, feeling: T('אני מוכן. באמת מוכן.', "I'm ready. Actually ready."),
    why: 'The finish line must be an experience, not a certificate.',
    preparesNext: 'Real life. The First Move abroad.' },
];

/**
 * The Extended Mission Pool — missions that left the Core 30 but whose content is kept, built and
 * tested for a later 31+ track. They are NOT in the journey: no card, no number, no readiness slot.
 * Listed here (with the id persisted progress is keyed by) so a learner who completed one before
 * the Core 30 restructure keeps that completion on disk until the mission returns.
 */
export interface ExtendedMission {
  id: string;
  day: number;
  title: LocalizedText;
}

export const EXTENDED_POOL: ExtendedMission[] = [
  { id: 'street-food-markets', day: 15, title: T('אוכל רחוב ושווקים', 'Street Food & Markets') },
  { id: 'tickets-attractions', day: 19, title: T('כרטיסים ואטרקציות', 'Tickets & Attractions') },
  { id: 'wifi-sim-practical', day: 20, title: T('וויי-פיי, סים ופרקטיקה', 'Wifi, SIM & Practical') },
  { id: 'souvenirs-gifts', day: 21, title: T('מזכרות ומתנות', 'Souvenirs & Gifts') },
];

/**
 * Missions merged into another Core mission by the Core 30 restructure. Their content files remain
 * as sentence sources for the missions that reuse their lines; they are never registered or shown.
 */
export const MERGED_MISSIONS: (ExtendedMission & { into: string | null })[] = [
  { id: 'restaurant-basics', day: 12, title: T('מסעדה — בסיס', 'Restaurant Basics'), into: 'restaurant-meal' },
  { id: 'hotel-requests', day: 11, title: T('בקשות ובעיות במלון', 'Hotel Requests & Problems'), into: 'fixing-problems' },
  { id: 'paying-anywhere', day: 14, title: T('לשלם בכל מקום', 'Paying Anywhere'), into: null }, // payment recurs inside other missions
];

/** The display number a mission shows to the learner: its 1-based position in the plan, or null
 *  for a day that is not in the curriculum. Derived from ORDER, never from the `day` key or the id,
 *  so numbering stays purely presentational. */
export function missionNumber(day: number): number | null {
  const i = BOOTCAMP_PLAN.findIndex((m) => m.day === day);
  return i === -1 ? null : i + 1;
}

/** The next mission to offer after `day`, walking the plan in journey order: the first later mission
 *  that is available (built for the learning language) and not yet completed. */
export function nextMission(
  day: number,
  isAvailable: (m: MissionPlan) => boolean,
  isCompleted: (m: MissionPlan) => boolean,
): MissionPlan | undefined {
  const from = BOOTCAMP_PLAN.findIndex((m) => m.day === day);
  if (from === -1) return undefined;
  return BOOTCAMP_PLAN.slice(from + 1).find((m) => isAvailable(m) && !isCompleted(m));
}
