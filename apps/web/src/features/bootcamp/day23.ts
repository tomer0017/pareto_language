import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 23 — "Small Talk" (Phase 4 · City Life).
 * Three warm minutes with a stranger — connection, not just transactions. A compliment, a
 * question back, a recommendation, a warm goodbye. Trips are remembered by these minutes.
 */
export const DAY23_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.talk.beautiful-place', text: 'This place is beautiful.', meaning: T('המקום הזה יפהפה.', 'This place is beautiful.'),
    tip: T('מחמאה קטנה פותחת חום מיידי. תמיד עובדת.', 'A small compliment opens instant warmth. Always works.') },
  { id: 'en.phrase.talk.how-about-you', text: 'How about you?', meaning: T('ואתה?', 'How about you?'),
    tip: T('שלוש מילים שמחזירות את הכדור וממשיכות כל שיחה.', 'Three words that pass the ball back and keep any conversation going.') },
  { id: 'en.phrase.talk.recommend-place', text: 'Can you recommend a place?', meaning: T('אתה יכול להמליץ על מקום?', 'Can you recommend a place?') },
  { id: 'en.phrase.talk.nice-talking', text: 'It was nice talking to you.', meaning: T('היה נעים לדבר איתך.', 'It was nice talking to you.'),
    tip: T('הדרך החמה לסיים שיחה. משאירה חיוך.', 'The warm way to end a conversation. Leaves a smile.') },
  { id: 'en.phrase.talk.love-food', text: 'I love the food here.', meaning: T('אני אוהב את האוכל כאן.', 'I love the food here.') },
  // hear — the local's lines
  { id: 'en.reply.talk.first-time-q', text: 'Is this your first time here?', meaning: T('זו הפעם הראשונה שלך כאן?', 'Is this your first time here?') },
  { id: 'en.reply.talk.where-from', text: 'Where are you from?', meaning: T('מאיפה אתה?', 'Where are you from?') },
  { id: 'en.reply.talk.you-should-try', text: 'You should try the old town.', meaning: T('כדאי לך לנסות את העיר העתיקה.', 'You should try the old town.') },
  { id: 'en.reply.talk.how-long-here', text: 'How long are you here for?', meaning: T('לכמה זמן אתה כאן?', 'How long are you here for?') },
  { id: 'en.reply.talk.enjoy-rest', text: 'Enjoy the rest of your trip!', meaning: T('תיהנה משאר הטיול!', 'Enjoy the rest of your trip!') },
  { id: 'en.reply.talk.me-too', text: 'Me too!', meaning: T('גם אני!', 'Me too!') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_TALK: BootcampDialogue = {
  id: 'small-talk',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "Beautiful view, isn't it? Where are you from?", he: 'נוף יפה, נכון? מאיפה אתה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'This place is beautiful.', he: 'המקום הזה יפהפה.', itemId: 'en.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Where — are you — from?', he: 'מאיפה — אתה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'This place is beautiful.', he: 'המקום הזה יפהפה.', itemId: 'en.phrase.talk.beautiful-place', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'It really is. Is this your first time here?', he: 'באמת. זו הפעם הראשונה שלך כאן?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'I love the food here.', he: 'אני אוהב את האוכל כאן.', itemId: 'en.phrase.talk.love-food', correct: true, next: 'n3' },
      { en: 'How about you?', he: 'ואתה?', itemId: 'en.phrase.talk.how-about-you', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: "Me? I've lived here twenty years — never get tired of it. And you?", he: 'אני? גר כאן עשרים שנה — לא נמאס לי אף פעם. ואתה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'I love the food here.', he: 'אני אוהב את האוכל כאן.', itemId: 'en.phrase.talk.love-food', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'The food is the best part! You should try the old town — wonderful little restaurants.', he: 'האוכל זה הכי טוב! כדאי לך לנסות את העיר העתיקה — מסעדות קטנות נפלאות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Can you recommend a place?', he: 'אתה יכול להמליץ על מקום?', itemId: 'en.phrase.talk.recommend-place', correct: true, next: 'n4' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'You should — try — the old town.', he: 'כדאי לך — לנסות — את העיר העתיקה.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Can you recommend a place?', he: 'אתה יכול להמליץ על מקום?', itemId: 'en.phrase.talk.recommend-place', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: "Of course — 'Mama Rosa'. Ask for the owner and tell her I sent you!", he: "בטח — 'מאמא רוזה'. תבקש את הבעלים ותגיד שאני שלחתי!" },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'It was nice talking to you.', he: 'היה נעים לדבר איתך.', itemId: 'en.phrase.talk.nice-talking', correct: true, next: 'n5' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: "'Mama Rosa' — ask — for the owner.", he: "'מאמא רוזה' — תבקש — את הבעלים." },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'It was nice talking to you.', he: 'היה נעים לדבר איתך.', itemId: 'en.phrase.talk.nice-talking', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'You too! Enjoy the rest of your trip!', he: 'גם לי! תיהנה משאר הטיול!' },
  ],
};

export const DAY23: BootcampDayContent = {
  day: 23,
  title: T('שיחת חולין', 'Small Talk'),
  items: DAY23_ITEMS,
  dialogues: { 'small-talk': SCENE_TALK },
  steps: [
    { kind: 'talk', icon: '💬', title: T('משימה 23: שיחת חולין', 'Mission 23: Small Talk'),
      body: [
        T('עד עכשיו למדנו עסקאות. היום לומדים חיבור — שלוש דקות חמות עם זר.', 'So far we learned transactions. Today we learn connection — three warm minutes with a stranger.'),
        T('מחמאה, שאלה בחזרה, המלצה, ופרידה חמה. את הטיול זוכרים דרך הרגעים האלה.', 'A compliment, a question back, a recommendation, a warm goodbye. A trip is remembered through these moments.'),
      ], cta: T('להתחיל שיחה', 'Start a conversation') },
    { kind: 'tool', itemId: 'en.phrase.talk.beautiful-place', index: 1, total: 4, label: T('מחמאה פותחת', 'An opening compliment') },
    { kind: 'tool', itemId: 'en.phrase.talk.how-about-you', index: 2, total: 4, label: T('להחזיר את הכדור', 'Pass the ball back') },
    { kind: 'tool', itemId: 'en.phrase.talk.recommend-place', index: 3, total: 4, label: T('לבקש המלצה', 'Ask for a tip') },
    { kind: 'tool', itemId: 'en.phrase.talk.nice-talking', index: 4, total: 4, label: T('פרידה חמה', 'A warm goodbye') },
    { kind: 'replies', saidItemId: 'en.phrase.talk.beautiful-place',
      replyIds: ['en.reply.talk.first-time-q', 'en.reply.talk.where-from', 'en.reply.talk.you-should-try', 'en.reply.talk.how-long-here'] },
    { kind: 'receipt', text: T('אתה מזהה את השאלות הסקרניות שכל מקומי ידידותי שואל.', 'You recognize the curious questions every friendly local asks.') },
    { kind: 'quiz', itemId: 'en.reply.talk.you-should-try', wrongIds: ['en.reply.talk.first-time-q', 'en.reply.talk.enjoy-rest'] },
    { kind: 'quiz', itemId: 'en.reply.talk.how-long-here', wrongIds: ['en.reply.talk.where-from', 'en.reply.talk.me-too'] },
    { kind: 'dialogue', dialogueId: 'small-talk' },
    { kind: 'receipt', text: T('ניהלת שיחת חולין שלמה — מחמאה, שאלות, המלצה, ופרידה חמה.', 'You held a full small-talk conversation — compliment, questions, recommendation, and a warm goodbye.') },
    { kind: 'swipe', itemIds: DAY23_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: "So honestly what's been your favorite thing about the trip so far?", he: 'אז בכנות — מה הדבר האהוב עליך בטיול עד עכשיו?' },
      correctItemId: 'en.phrase.talk.love-food', wrongItemId: 'en.phrase.talk.recommend-place' },
    { kind: 'receipt', text: T('שאלה אישית ופתוחה — וידעת לענות משהו אמיתי, בחיוך.', 'A personal, open question — and you knew how to answer something real, with a smile.') },
    { kind: 'summary' },
  ],
};
