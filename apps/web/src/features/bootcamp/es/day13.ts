import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 13 — "Restaurante: lo básico" (Restaurant Basics, the deep exemplar). Spanish
 * parallel of English day 13: one situation end-to-end (greeting → table → menu → drinks → order →
 * recommendation → follow-ups → bill → goodbye). `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY13_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.rest.table-for-two', text: 'Una mesa para dos, por favor.', meaning: T('שולחן לשניים, בבקשה.', 'A table for two, please.'),
    tip: T('התבנית: Una mesa para ___ — פשוט מספר. para uno / para cuatro.', 'Template: Una mesa para ___ — just a number. para uno / para cuatro.') },
  { id: 'es.phrase.rest.menu-please', text: '¿Nos trae la carta?', meaning: T('אפשר לראות את התפריט?', 'Could we see the menu?') },
  { id: 'es.phrase.rest.ill-have', text: 'Voy a tomar la pasta, por favor.', meaning: T('אני אקח את הפסטה, בבקשה.', "I'll have the pasta, please."),
    tip: T('התבנית הגדולה של המסעדה: Voy a tomar ___ — מזמינים כל דבר בתפריט.', 'The restaurant’s big template: Voy a tomar ___ — order anything on the menu.') },
  { id: 'es.phrase.rest.recommend', text: '¿Qué me recomienda?', meaning: T('מה אתה ממליץ?', 'What do you recommend?'),
    tip: T('אם התפריט מבלבל — תן למלצר להחליט. תמיד עובד.', 'If the menu confuses you — let the waiter decide. Always works.') },
  { id: 'es.phrase.rest.water-please', text: 'Una botella de agua, por favor.', meaning: T('בקבוק מים, בבקשה.', 'A bottle of water, please.') },
  { id: 'es.phrase.rest.bill-please', text: '¿Nos trae la cuenta, por favor?', meaning: T('אפשר את החשבון, בבקשה?', 'Could we have the bill, please?'),
    tip: T('המשפט שסוגר כל ארוחה: la cuenta.', 'The line that closes every meal: la cuenta.') },
  // hear — the waiter's chain
  { id: 'es.reply.rest.how-many', text: '¿Cuántos son?', meaning: T('כמה אנשים?', 'How many people?') },
  { id: 'es.reply.rest.something-drink', text: '¿Algo de beber?', meaning: T('משהו לשתות?', 'Something to drink?') },
  { id: 'es.reply.rest.ready-order', text: '¿Están listos para pedir?', meaning: T('מוכנים להזמין?', 'Are you ready to order?') },
  { id: 'es.reply.rest.anything-else', text: '¿Algo más?', meaning: T('עוד משהו?', 'Anything else?') },
  { id: 'es.reply.rest.everything-okay', text: '¿Va todo bien?', meaning: T('הכל בסדר?', 'Is everything okay?') },
  { id: 'es.reply.rest.enjoy-meal', text: '¡Buen provecho!', meaning: T('בתיאבון!', 'Enjoy your meal!') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.one-moment', 'es.phrase.recovery.thank-you'),
];

const SCENE_DINNER: BootcampDialogue = {
  id: 'restaurant-dinner',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Buenas noches, bienvenidos! ¿Cuántos son?', tr: TR('Good evening, welcome! How many people?', 'ערב טוב, ברוכים הבאים! כמה אנשים?'), he: 'ערב טוב, ברוכים הבאים! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Una mesa para dos, por favor.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'es.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (כלי — לספור כמה אתם)'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'No hay problema — ¿cuántos son?', tr: TR('No problem — how many people?', 'אין בעיה — כמה אנשים?'), he: 'אין בעיה — כמה אנשים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Una mesa para dos, por favor.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'es.phrase.rest.table-for-two', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Perfecto, síganme. Aquí tienen las cartas. ¿Algo de beber?', tr: TR('Perfect, right this way. Here are your menus. Something to drink?', 'מצוין, בבקשה אחריי. הנה התפריטים. משהו לשתות?'), he: 'מצוין, בבקשה אחריי. הנה התפריטים. משהו לשתות?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Una botella de agua, por favor.', tr: TR('A bottle of water, please.', 'בקבוק מים, בבקשה.'), he: 'בקבוק מים, בבקשה.', itemId: 'es.phrase.rest.water-please', correct: true, next: 'n3' },
      { en: '¿Nos trae la carta?', tr: TR('Could we see the menu?', 'אפשר לראות את התפריט? (הוא בדיוק נתן — הקשב)'), he: 'אפשר לראות את התפריט?', itemId: 'es.phrase.rest.menu-please', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Las cartas están justo delante de ustedes — ¿algo de beber primero?', tr: TR("The menus are right there in front of you — anything to drink first?", 'התפריטים ממש מולך — משהו לשתות קודם?'), he: 'התפריטים ממש מולך — משהו לשתות קודם?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Una botella de agua, por favor.', tr: TR('A bottle of water, please.', 'בקבוק מים, בבקשה.'), he: 'בקבוק מים, בבקשה.', itemId: 'es.phrase.rest.water-please', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Muy bien. Les doy un momento… ¿Están listos para pedir?', tr: TR("Great. I'll give you a minute… Are you ready to order?", 'יופי. אתן לכם רגע… מוכנים להזמין?'), he: 'יופי. אתן לכם רגע… מוכנים להזמין?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Voy a tomar la pasta, por favor.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'es.phrase.rest.ill-have', correct: true, next: 'n4' },
      { en: '¿Qué me recomienda?', tr: TR('What do you recommend?', 'מה אתה ממליץ? (מהלך חכם כשמתלבטים)'), he: 'מה אתה ממליץ?', itemId: 'es.phrase.rest.recommend', correct: true, next: 'n3b' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: 'La pasta con marisco es nuestra especialidad — muy fresca hoy.', tr: TR('The seafood pasta is our best — very fresh today.', 'פסטת פירות הים היא הכי טובה שלנו — טרייה מאוד היום.'), he: 'פסטת פירות הים היא הכי טובה שלנו — טרייה מאוד היום.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Voy a tomar la pasta, por favor.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'es.phrase.rest.ill-have', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', fast: true, next: 'c4', en: 'Excelente elección. ¿Algo más?', tr: TR('Excellent choice. Anything else?', 'בחירה מצוינת. עוד משהו?'), he: 'בחירה מצוינת. עוד משהו?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Eso es todo, gracias.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n5' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: '¿Quieren — algo más?', tr: TR('Would you like — anything else?', 'תרצו — עוד משהו?'), he: 'תרצו — עוד משהו?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Eso es todo, gracias.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Aquí tienen. ¡Buen provecho!… ¿Va todo bien?', tr: TR('Here you are. Enjoy your meal!… Is everything okay?', 'בבקשה. בתיאבון!… הכל בסדר?'), he: 'בבקשה. בתיאבון!… הכל בסדר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¡Sí, gracias!', tr: TR('Yes, thank you!', 'כן, תודה!'), he: 'כן, תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: '¿Va — todo bien — con el plato?', tr: TR('Is — everything — okay with the food?', 'הכל — בסדר — עם האוכל?'), he: 'הכל — בסדר — עם האוכל?' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: '¡Sí, gracias!', tr: TR('Yes, thank you!', 'כן, תודה!'), he: 'כן, תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', next: 'c6', en: 'Perfecto. Avísenme cuando necesiten algo.', tr: TR('Wonderful. Let me know when you need anything.', 'נהדר. תגידו לי כשתצטרכו משהו.'), he: 'נהדר. תגידו לי כשתצטרכו משהו.' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: '¿Nos trae la cuenta, por favor?', tr: TR('Could we have the bill, please?', 'אפשר את החשבון, בבקשה?'), he: 'אפשר את החשבון, בבקשה?', itemId: 'es.phrase.rest.bill-please', correct: true, next: 'n7' },
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'r6' },
    ] },
    { id: 'r6', who: 'npc', slow: true, next: 'c6b', en: 'Claro — tómense su tiempo.', tr: TR('Of course — take your time.', 'כמובן — קחו את הזמן.'), he: 'כמובן — קחו את הזמן.' },
    { id: 'c6b', who: 'you', en: '', he: '', choices: [
      { en: '¿Nos trae la cuenta, por favor?', tr: TR('Could we have the bill, please?', 'אפשר את החשבון, בבקשה?'), he: 'אפשר את החשבון, בבקשה?', itemId: 'es.phrase.rest.bill-please', correct: true, next: 'n7' },
    ] },
    { id: 'n7', who: 'npc', end: true, en: 'Aquí tienen la cuenta. ¡Gracias, y que pasen buena noche!', tr: TR("Here's the bill. Thank you, and have a lovely evening!", 'הנה החשבון. תודה, וערב נפלא!'), he: 'הנה החשבון. תודה, וערב נפלא!' },
  ],
};

export const DAY13_ES: BootcampDayContent = {
  day: 13,
  title: T('מסעדה — בסיס', 'Restaurant Basics'),
  items: DAY13_ES_ITEMS,
  dialogues: { 'restaurant-dinner': SCENE_DINNER },
  steps: [
    { kind: 'talk', icon: '🍽️', title: T('משימה 13: מסעדה — בסיס', 'Mission 13: Restaurant Basics'),
      body: [
        T('לב הטיול הוא ארוחת ערב. היום לא לומדים "מילים על אוכל" — לומדים לנהל מסעדה שלמה.', 'The heart of travel is dinner. Today we don’t learn “food words” — we learn to run a whole restaurant.'),
        T('משולחן, דרך תפריט, הזמנה ושאלות המלצר — ועד החשבון. מקצה לקצה.', 'From the table, through the menu, the order, and the waiter’s questions — all the way to the bill. End to end.'),
      ], cta: T('להיכנס למסעדה', 'Walk into the restaurant') },
    { kind: 'tool', itemId: 'es.phrase.rest.table-for-two', index: 1, total: 4, label: T('להשיג שולחן', 'Get a table') },
    { kind: 'tool', itemId: 'es.phrase.rest.ill-have', index: 2, total: 4, label: T('תבנית ההזמנה', 'The ordering template') },
    { kind: 'tool', itemId: 'es.phrase.rest.recommend', index: 3, total: 4, label: T('כשמתלבטים', 'When unsure') },
    { kind: 'tool', itemId: 'es.phrase.rest.bill-please', index: 4, total: 4, label: T('לסגור חשבון', 'Close the bill') },
    { kind: 'replies', saidItemId: 'es.phrase.rest.ill-have',
      replyIds: ['es.reply.rest.something-drink', 'es.reply.rest.ready-order', 'es.reply.rest.anything-else', 'es.reply.rest.everything-okay'] },
    { kind: 'receipt', text: T('אתה מזהה את כל שאלות המלצר — לפני, במהלך, ואחרי הארוחה.', 'You recognize every waiter question — before, during, and after the meal.') },
    { kind: 'quiz', itemId: 'es.reply.rest.ready-order', wrongIds: ['es.reply.rest.something-drink', 'es.reply.rest.enjoy-meal'] },
    { kind: 'quiz', itemId: 'es.reply.rest.how-many', wrongIds: ['es.reply.rest.anything-else', 'es.reply.rest.everything-okay'] },
    { kind: 'dialogue', dialogueId: 'restaurant-dinner' },
    { kind: 'receipt', text: T('ניהלת ארוחת ערב שלמה בספרדית — שולחן, הזמנה, המלצה, חשבון.', 'You ran a full dinner in Spanish — table, order, recommendation, bill.') },
    { kind: 'swipe', itemIds: DAY13_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: '¿Y cómo lo quiere — poco hecho, al punto, o muy hecho?', tr: TR('And how would you like that cooked — rare, medium, or well done?', 'ואיך תרצה שיהיה מבושל — נא, בינוני, או עשוי היטב?'), he: 'ואיך תרצה שיהיה מבושל — נא, בינוני, או עשוי היטב?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.phrase.rest.bill-please' },
    { kind: 'receipt', text: T('המלצר ירה שלוש אפשרויות במהירות — וביקשת שיאט במקום לנחש.', 'The waiter fired three options fast — and you asked him to slow down instead of guessing.') },
    { kind: 'summary' },
  ],
};
