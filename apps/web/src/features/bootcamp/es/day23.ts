import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 23 — "Conversación" (Small Talk). Spanish parallel of English day 23: three warm
 * minutes with a stranger — a compliment, a question back, a recommendation, a warm goodbye.
 * `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY23_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.talk.beautiful-place', text: 'Este lugar es precioso.', meaning: T('המקום הזה יפהפה.', 'This place is beautiful.'),
    tip: T('מחמאה קטנה פותחת חום מיידי. תמיד עובדת.', 'A small compliment opens instant warmth. Always works.') },
  { id: 'es.phrase.talk.how-about-you', text: '¿Y usted?', meaning: T('ואתה?', 'How about you?'),
    tip: T('שתי מילים שמחזירות את הכדור וממשיכות כל שיחה.', 'Two words that pass the ball back and keep any conversation going.') },
  { id: 'es.phrase.talk.recommend-place', text: '¿Me puede recomendar un sitio?', meaning: T('אתה יכול להמליץ על מקום?', 'Can you recommend a place?') },
  { id: 'es.phrase.talk.nice-talking', text: 'Ha sido un placer hablar con usted.', meaning: T('היה נעים לדבר איתך.', 'It was nice talking to you.'),
    tip: T('הדרך החמה לסיים שיחה. משאירה חיוך.', 'The warm way to end a conversation. Leaves a smile.') },
  { id: 'es.phrase.talk.love-food', text: 'Me encanta la comida de aquí.', meaning: T('אני אוהב את האוכל כאן.', 'I love the food here.') },
  // hear — the local's lines
  { id: 'es.reply.talk.first-time-q', text: '¿Es su primera vez aquí?', meaning: T('זו הפעם הראשונה שלך כאן?', 'Is this your first time here?') },
  { id: 'es.reply.talk.where-from', text: '¿De dónde es?', meaning: T('מאיפה אתה?', 'Where are you from?') },
  { id: 'es.reply.talk.you-should-try', text: 'Debería visitar el casco antiguo.', meaning: T('כדאי לך לנסות את העיר העתיקה.', 'You should try the old town.') },
  { id: 'es.reply.talk.how-long-here', text: '¿Cuánto tiempo está aquí?', meaning: T('לכמה זמן אתה כאן?', 'How long are you here for?') },
  { id: 'es.reply.talk.enjoy-rest', text: '¡Que disfrute del resto del viaje!', meaning: T('תיהנה משאר הטיול!', 'Enjoy the rest of your trip!') },
  { id: 'es.reply.talk.me-too', text: '¡Yo también!', meaning: T('גם אני!', 'Me too!') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_TALK: BootcampDialogue = {
  id: 'small-talk',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonitas vistas, ¿verdad? ¿De dónde es?', tr: TR("Beautiful view, isn't it? Where are you from?", 'נוף יפה, נכון? מאיפה אתה?'), he: 'נוף יפה, נכון? מאיפה אתה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Este lugar es precioso.', tr: TR('This place is beautiful.', 'המקום הזה יפהפה.'), he: 'המקום הזה יפהפה.', itemId: 'es.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: '¿De dónde — es?', tr: TR('Where — are you — from?', 'מאיפה — אתה?'), he: 'מאיפה — אתה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Este lugar es precioso.', tr: TR('This place is beautiful.', 'המקום הזה יפהפה.'), he: 'המקום הזה יפהפה.', itemId: 'es.phrase.talk.beautiful-place', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Es verdad. ¿Es su primera vez aquí?', tr: TR('It really is. Is this your first time here?', 'באמת. זו הפעם הראשונה שלך כאן?'), he: 'באמת. זו הפעם הראשונה שלך כאן?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Me encanta la comida de aquí.', tr: TR('I love the food here.', 'אני אוהב את האוכל כאן.'), he: 'אני אוהב את האוכל כאן.', itemId: 'es.phrase.talk.love-food', correct: true, next: 'n3' },
      { en: '¿Y usted?', tr: TR('How about you?', 'ואתה?'), he: 'ואתה?', itemId: 'es.phrase.talk.how-about-you', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: '¿Yo? Llevo veinte años viviendo aquí — nunca me cansa. ¿Y usted?', tr: TR("Me? I've lived here twenty years — never get tired of it. And you?", 'אני? גר כאן עשרים שנה — לא נמאס לי אף פעם. ואתה?'), he: 'אני? גר כאן עשרים שנה — לא נמאס לי אף פעם. ואתה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Me encanta la comida de aquí.', tr: TR('I love the food here.', 'אני אוהב את האוכל כאן.'), he: 'אני אוהב את האוכל כאן.', itemId: 'es.phrase.talk.love-food', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: '¡La comida es lo mejor! Debería visitar el casco antiguo — unos restaurantes pequeños maravillosos.', tr: TR('The food is the best part! You should try the old town — wonderful little restaurants.', 'האוכל זה הכי טוב! כדאי לך לנסות את העיר העתיקה — מסעדות קטנות נפלאות.'), he: 'האוכל זה הכי טוב! כדאי לך לנסות את העיר העתיקה — מסעדות קטנות נפלאות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Me puede recomendar un sitio?', tr: TR('Can you recommend a place?', 'אתה יכול להמליץ על מקום?'), he: 'אתה יכול להמליץ על מקום?', itemId: 'es.phrase.talk.recommend-place', correct: true, next: 'n4' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Debería — visitar — el casco antiguo.', tr: TR('You should — try — the old town.', 'כדאי לך — לנסות — את העיר העתיקה.'), he: 'כדאי לך — לנסות — את העיר העתיקה.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¿Me puede recomendar un sitio?', tr: TR('Can you recommend a place?', 'אתה יכול להמליץ על מקום?'), he: 'אתה יכול להמליץ על מקום?', itemId: 'es.phrase.talk.recommend-place', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Claro — «Mamá Rosa». Pregunte por la dueña y dígale que la mando yo.', tr: TR("Of course — 'Mama Rosa'. Ask for the owner and tell her I sent you!", "בטח — 'מאמא רוזה'. תבקש את הבעלים ותגיד שאני שלחתי!"), he: "בטח — 'מאמא רוזה'. תבקש את הבעלים ותגיד שאני שלחתי!" },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Ha sido un placer hablar con usted.', tr: TR('It was nice talking to you.', 'היה נעים לדבר איתך.'), he: 'היה נעים לדבר איתך.', itemId: 'es.phrase.talk.nice-talking', correct: true, next: 'n5' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: '«Mamá Rosa» — pregunte — por la dueña.', tr: TR("'Mama Rosa' — ask — for the owner.", "'מאמא רוזה' — תבקש — את הבעלים."), he: "'מאמא רוזה' — תבקש — את הבעלים." },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Ha sido un placer hablar con usted.', tr: TR('It was nice talking to you.', 'היה נעים לדבר איתך.'), he: 'היה נעים לדבר איתך.', itemId: 'es.phrase.talk.nice-talking', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: '¡Yo también! ¡Que disfrute del resto del viaje!', tr: TR('You too! Enjoy the rest of your trip!', 'גם לי! תיהנה משאר הטיול!'), he: 'גם לי! תיהנה משאר הטיול!' },
  ],
};

export const DAY23_ES: BootcampDayContent = {
  day: 23,
  title: T('שיחת חולין', 'Small Talk'),
  items: DAY23_ES_ITEMS,
  dialogues: { 'small-talk': SCENE_TALK },
  steps: [
    { kind: 'talk', icon: '💬', title: T('משימה 23: שיחת חולין', 'Mission 23: Small Talk'),
      body: [
        T('עד עכשיו למדנו עסקאות. היום לומדים חיבור — שלוש דקות חמות עם זר.', 'So far we learned transactions. Today we learn connection — three warm minutes with a stranger.'),
        T('מחמאה, שאלה בחזרה, המלצה, ופרידה חמה. את הטיול זוכרים דרך הרגעים האלה.', 'A compliment, a question back, a recommendation, a warm goodbye. A trip is remembered through these moments.'),
      ], cta: T('להתחיל שיחה', 'Start a conversation') },
    { kind: 'tool', itemId: 'es.phrase.talk.beautiful-place', index: 1, total: 4, label: T('מחמאה פותחת', 'An opening compliment') },
    { kind: 'tool', itemId: 'es.phrase.talk.how-about-you', index: 2, total: 4, label: T('להחזיר את הכדור', 'Pass the ball back') },
    { kind: 'tool', itemId: 'es.phrase.talk.recommend-place', index: 3, total: 4, label: T('לבקש המלצה', 'Ask for a tip') },
    { kind: 'tool', itemId: 'es.phrase.talk.nice-talking', index: 4, total: 4, label: T('פרידה חמה', 'A warm goodbye') },
    { kind: 'replies', saidItemId: 'es.phrase.talk.beautiful-place',
      replyIds: ['es.reply.talk.first-time-q', 'es.reply.talk.where-from', 'es.reply.talk.you-should-try', 'es.reply.talk.how-long-here'] },
    { kind: 'receipt', text: T('אתה מזהה את השאלות הסקרניות שכל מקומי ידידותי שואל.', 'You recognize the curious questions every friendly local asks.') },
    { kind: 'quiz', itemId: 'es.reply.talk.you-should-try', wrongIds: ['es.reply.talk.first-time-q', 'es.reply.talk.enjoy-rest'] },
    { kind: 'quiz', itemId: 'es.reply.talk.how-long-here', wrongIds: ['es.reply.talk.where-from', 'es.reply.talk.me-too'] },
    { kind: 'dialogue', dialogueId: 'small-talk' },
    { kind: 'receipt', text: T('ניהלת שיחת חולין שלמה — מחמאה, שאלות, המלצה, ופרידה חמה.', 'You held a full small-talk conversation — compliment, questions, recommendation, and a warm goodbye.') },
    { kind: 'swipe', itemIds: DAY23_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Y, sinceramente, ¿qué es lo que más le ha gustado del viaje hasta ahora?', tr: TR("So honestly what's been your favorite thing about the trip so far?", 'אז בכנות — מה הדבר האהוב עליך בטיול עד עכשיו?'), he: 'אז בכנות — מה הדבר האהוב עליך בטיול עד עכשיו?' },
      correctItemId: 'es.phrase.talk.love-food', wrongItemId: 'es.phrase.talk.recommend-place' },
    { kind: 'receipt', text: T('שאלה אישית ופתוחה — וידעת לענות משהו אמיתי, בחיוך.', 'A personal, open question — and you knew how to answer something real, with a smile.') },
    { kind: 'summary' },
  ],
};
