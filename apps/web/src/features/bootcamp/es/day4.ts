import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampItem, BootcampDialogue } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission (day 4) — "Cafetería" (Coffee Shop), the deep-moment exemplar in Spanish. Same
 * objective and full follow-up chain as English day 4 (order → size → milk/sugar → to eat → anything
 * else → pay → receipt → goodbye), same engine. Spanish target lines + `tr:{en,he}` glosses; `es.*`
 * ids. No Spanish video yet → the hub Watch card shows "Coming Soon". AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY4_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.coffee.iced-coffee', text: 'Quiero un café con hielo, por favor.',
    meaning: T('אני רוצה קפה קר, בבקשה.', "I'd like an iced coffee, please."),
    tip: T('התבנית: Quiero ___, por favor — עובדת על הכל.', 'The template: Quiero ___, por favor — works for everything.') },
  { id: 'es.phrase.coffee.to-go', text: 'Para llevar, por favor.',
    meaning: T('לקחת, בבקשה.', 'To go, please.') },
  { id: 'es.phrase.coffee.no-sugar', text: 'Con leche, sin azúcar.',
    meaning: T('עם חלב, בלי סוכר.', 'Milk, no sugar.'),
    tip: T('con = עם · sin = בלי. שתי מילים ששולטות בכל הזמנה.', 'con = with · sin = without — two words that control every order.') },
  { id: 'es.phrase.coffee.croissant', text: 'Un cruasán, por favor.',
    meaning: T('קרואסון, בבקשה.', 'A croissant, please.'),
    tip: T('“cruasán” — מאפה חמאה. אותה מילה, כתיב ספרדי.', '“cruasán” — the same pastry, Spanish spelling.') },
  { id: 'es.phrase.coffee.thats-all', text: 'Eso es todo, gracias.',
    meaning: T('זה הכל, תודה.', "That's all, thanks."),
    tip: T('סוגר כל הזמנה בנימוס.', 'Closes any order politely.') },
  { id: 'es.phrase.coffee.card', text: 'Con tarjeta, por favor.',
    meaning: T('בכרטיס, בבקשה.', 'Card, please.') },
  // hear — the barista question-chain
  { id: 'es.reply.coffee.what-can-i-get', text: '¿Qué le sirvo?', meaning: T('מה להביא לך?', 'What can I get you?') },
  { id: 'es.reply.coffee.hot-or-iced', text: '¿Caliente o con hielo?', meaning: T('חם או קר?', 'Hot or iced?') },
  { id: 'es.reply.coffee.here-or-to-go', text: '¿Para aquí o para llevar?', meaning: T('לשבת כאן או לקחת?', 'For here or to go?') },
  { id: 'es.reply.coffee.medium-or-large', text: '¿Mediano o grande?', meaning: T('בינוני או גדול?', 'Medium or large?') },
  { id: 'es.reply.coffee.milk-sugar', text: '¿Leche y azúcar?', meaning: T('חלב וסוכר?', 'Milk and sugar?') },
  { id: 'es.reply.coffee.anything-to-eat', text: '¿Algo de comer?', meaning: T('משהו לאכול?', 'Anything to eat?') },
  { id: 'es.reply.coffee.anything-else', text: '¿Algo más?', meaning: T('עוד משהו?', 'Would you like anything else?') },
  { id: 'es.reply.coffee.cash-or-card', text: '¿Efectivo o tarjeta?', meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'es.reply.coffee.receipt', text: '¿Quiere el recibo?', meaning: T('רוצה את הקבלה?', 'Would you like the receipt?') },
  { id: 'es.reply.coffee.enjoy', text: '¡Que tenga un buen día!', meaning: T('שיהיה לך יום מעולה!', 'Enjoy your day!') },
];

const SCENE_BREAKFAST: BootcampDialogue = {
  id: 'breakfast-order',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Buenos días! ¿Qué le sirvo?', tr: TR('Good morning! What can I get you?', 'בוקר טוב! מה להביא לך?'), he: 'בוקר טוב! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Quiero un café con hielo, por favor.', tr: TR("I'd like an iced coffee, please.", 'אני רוצה קפה קר, בבקשה.'), he: 'אני רוצה קפה קר, בבקשה.', itemId: 'es.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (כלי הישרדות)'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Claro — ¡tómese su tiempo!', tr: TR('Of course — take your time!', 'ברור — קח את הזמן!'), he: 'ברור — קח את הזמן!' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Quiero un café con hielo, por favor.', tr: TR("I'd like an iced coffee, please.", 'אני רוצה קפה קר, בבקשה.'), he: 'אני רוצה קפה קר, בבקשה.', itemId: 'es.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: '¡Perfecto! ¿Mediano o grande?', tr: TR('Sure! Medium or large?', 'סגור! בינוני או גדול?'), he: 'סגור! בינוני או גדול?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Mediano, por favor.', tr: TR('Medium, please.', 'בינוני, בבקשה.'), he: 'בינוני, בבקשה.', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: '¿MEDIANO — o GRANDE?', tr: TR('MEDIUM — or LARGE?', 'בינוני — או גדול?'), he: 'בינוני — או גדול?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Mediano, por favor.', tr: TR('Medium, please.', 'בינוני, בבקשה.'), he: 'בינוני, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: '¿Leche y azúcar?', tr: TR('Milk and sugar?', 'חלב וסוכר?'), he: 'חלב וסוכר?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Con leche, sin azúcar.', tr: TR('Milk, no sugar.', 'עם חלב, בלי סוכר.'), he: 'עם חלב, בלי סוכר.', itemId: 'es.phrase.coffee.no-sugar', correct: true, next: 'n4' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה! (רגע — הוא שאל שאלה…)'), he: 'תודה!', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: '¡De nada! Pero — ¿leche? ¿azúcar?', tr: TR("You're welcome! But — milk? sugar?", 'בבקשה! אבל — חלב? סוכר?'), he: 'בבקשה! אבל — חלב? סוכר?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Con leche, sin azúcar.', tr: TR('Milk, no sugar.', 'עם חלב, בלי סוכר.'), he: 'עם חלב, בלי סוכר.', itemId: 'es.phrase.coffee.no-sugar', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: '¿Algo de comer?', tr: TR('Anything to eat?', 'משהו לאכול?'), he: 'משהו לאכול?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Un cruasán, por favor.', tr: TR('A croissant, please.', 'קרואסון, בבקשה.'), he: 'קרואסון, בבקשה.', itemId: 'es.phrase.coffee.croissant', correct: true, next: 'n5' },
      { en: 'Eso es todo, gracias.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', itemId: 'es.phrase.coffee.thats-all', correct: true, next: 'n6' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Buena elección. ¿Algo más?', tr: TR('Great choice. Would you like anything else?', 'בחירה מצוינת. עוד משהו?'), he: 'בחירה מצוינת. עוד משהו?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Eso es todo, gracias.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', itemId: 'es.phrase.coffee.thats-all', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', fast: true, next: 'c6', en: 'Son seis con cincuenta. ¿Efectivo o tarjeta?', tr: TR("That'll be six fifty. Cash or card?", 'שש חמישים בבקשה. מזומן או כרטיס?'), he: 'שש חמישים בבקשה. מזומן או כרטיס?' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: 'Con tarjeta, por favor.', tr: TR('Card, please.', 'בכרטיס, בבקשה.'), he: 'בכרטיס, בבקשה.', itemId: 'es.phrase.coffee.card', correct: true, next: 'n7' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט בבקשה. (המספר ברח לך?)'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r6' },
    ] },
    { id: 'r6', who: 'npc', slow: true, next: 'c6b', en: 'Seis — cincuenta. ¿Efectivo, o tarjeta?', tr: TR('Six — fifty. Cash, or card?', 'שש — חמישים. מזומן או כרטיס?'), he: 'שש — חמישים. מזומן או כרטיס?' },
    { id: 'c6b', who: 'you', en: '', he: '', choices: [
      { en: 'Con tarjeta, por favor.', tr: TR('Card, please.', 'בכרטיס, בבקשה.'), he: 'בכרטיס, בבקשה.', itemId: 'es.phrase.coffee.card', correct: true, next: 'n7' },
    ] },
    { id: 'n7', who: 'npc', next: 'c7', en: '¿Quiere el recibo?', tr: TR('Would you like the receipt?', 'רוצה את הקבלה?'), he: 'רוצה את הקבלה?' },
    { id: 'c7', who: 'you', en: '', he: '', choices: [
      { en: '¡No, gracias!', tr: TR('No, thank you!', 'לא, תודה!'), he: 'לא, תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n8' },
      { en: 'Sí, por favor.', tr: TR('Yes, please.', 'כן, בבקשה.'), he: 'כן, בבקשה.', correct: true, next: 'n8' },
    ] },
    { id: 'n8', who: 'npc', end: true, en: 'Aquí tiene — ¡que tenga un buen día!', tr: TR('Here you go — enjoy your day!', 'בבקשה — שיהיה יום מעולה!'), he: 'בבקשה — שיהיה יום מעולה!' },
  ],
};

const REUSED_RECOVERY = recoveryEs('es.phrase.recovery.one-moment', 'es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you');

export const DAY4_ES: BootcampDayContent = {
  day: 4,
  title: T('בית קפה', 'Coffee Shop'),
  items: [...DAY4_ES_ITEMS, ...REUSED_RECOVERY],
  dialogues: { 'breakfast-order': SCENE_BREAKFAST },
  steps: [
    { kind: 'talk', icon: '☕', title: T('משימה 4: בית קפה', 'Mission 4: Coffee Shop'),
      body: [
        T('היום לא לומדים "מילים על קפה". היום לומדים לצאת מבית קפה עם ארוחת בוקר ביד.', 'Today we don’t learn “coffee words”. Today you walk out of a café holding breakfast.'),
        T('הסוד: אחרי שאתה מזמין, הבריסטה שואל שאלות המשך. מי שמכיר אותן מראש — אף פעם לא קופא.', 'The secret: after you order, the barista fires follow-up questions. Know them in advance — never freeze.'),
      ], cta: T('להיכנס', 'Walk in') },
    // Vocabulary priming (Part 7), authored as Spanish: con/sin are the two order-control words.
    // con + leche + sin + azúcar literally compose "Con leche, sin azúcar." — the assemble beat.
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('שש מילים שולטות בכל הזמנה בבית קפה.', 'Six words control every café order.'),
      words: [
        { text: 'café', meaning: T('קפה', 'coffee'), emoji: '☕' },
        { text: 'leche', meaning: T('חלב', 'milk'), emoji: '🥛' },
        { text: 'azúcar', meaning: T('סוכר', 'sugar'), emoji: '🍬' },
        { text: 'mediano', meaning: T('בינוני', 'medium') },
        { text: 'con', meaning: T('עם', 'with') },
        { text: 'sin', meaning: T('בלי', 'without') },
      ], buildFromItemId: 'es.phrase.coffee.no-sugar' },
    { kind: 'tool', itemId: 'es.phrase.coffee.iced-coffee', index: 1, total: 4, label: T('משפט הזהב', 'The golden template') },
    { kind: 'tool', itemId: 'es.phrase.coffee.no-sugar', index: 2, total: 4, label: T('שליטה בהזמנה', 'Order control') },
    { kind: 'tool', itemId: 'es.phrase.coffee.thats-all', index: 3, total: 4, label: T('הסוגר האוניברסלי', 'The universal closer') },
    { kind: 'tool', itemId: 'es.phrase.coffee.card', index: 4, total: 4, label: T('סוגרים חשבון', 'Settling up') },
    { kind: 'replies', saidItemId: 'es.phrase.coffee.iced-coffee',
      replyIds: ['es.reply.coffee.here-or-to-go', 'es.reply.coffee.medium-or-large', 'es.reply.coffee.milk-sugar', 'es.reply.coffee.anything-else'] },
    { kind: 'receipt', text: T('אתה כבר מזהה את ארבע שאלות ההמשך של כל בריסטה בעולם.', 'You now recognize the four follow-ups of every barista on earth.') },
    { kind: 'quiz', itemId: 'es.reply.coffee.cash-or-card', wrongIds: ['es.reply.coffee.anything-to-eat', 'es.reply.coffee.receipt'] },
    { kind: 'quiz', itemId: 'es.reply.coffee.anything-to-eat', wrongIds: ['es.reply.coffee.hot-or-iced', 'es.reply.coffee.enjoy'] },
    { kind: 'dialogue', dialogueId: 'breakfast-order' },
    { kind: 'receipt', text: T('הזמנת ארוחת בוקר שלמה: שתייה, גודל, חלב, מאפה, תשלום. הכל.', 'You ordered a full breakfast: drink, size, milk, pastry, payment. All of it.') },
    { kind: 'swipe', itemIds: [...DAY4_ES_ITEMS, ...REUSED_RECOVERY].map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Lo siento, se nos acabaron los cruasanes — ¿le va bien un muffin en su lugar?', tr: TR('Sorry, we are out of croissants — would a muffin be okay instead?', 'סליחה, נגמרו הקרואסונים — מאפין במקום זה בסדר?'), he: 'סליחה, נגמרו הקרואסונים — מאפין במקום זה בסדר?' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.coffee.card' },
    { kind: 'receipt', text: T('הפתעה מחוץ לתסריט — והגבת עם כלי. זה בדיוק מה שקורה בעולם האמיתי.', 'An off-script surprise — and you answered with a tool. Exactly how real life works.') },
    { kind: 'summary' },
  ],
};
