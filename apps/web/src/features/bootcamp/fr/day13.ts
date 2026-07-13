import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 13 — "Restaurant : les bases" (Restaurant Basics, the deep exemplar). French parallel
 * of English day 13: one situation end-to-end (greeting → table → menu → drinks → order →
 * recommendation → follow-ups → bill → goodbye). `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY13_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.rest.table-for-two', text: 'Une table pour deux, s’il vous plaît.', meaning: T('שולחן לשניים, בבקשה.', 'A table for two, please.'),
    tip: T('התבנית: Une table pour ___ — פשוט מספר. pour une / pour quatre.', 'Template: Une table pour ___ — just a number. pour une / pour quatre.') },
  { id: 'fr.phrase.rest.menu-please', text: 'On peut voir la carte ?', meaning: T('אפשר לראות את התפריט?', 'Could we see the menu?') },
  { id: 'fr.phrase.rest.ill-have', text: 'Je vais prendre les pâtes, s’il vous plaît.', meaning: T('אני אקח את הפסטה, בבקשה.', "I'll have the pasta, please."),
    tip: T('התבנית הגדולה של המסעדה: Je vais prendre le/la ___ — מזמינים כל דבר בתפריט.', 'The restaurant’s big template: Je vais prendre le/la ___ — order anything on the menu.') },
  { id: 'fr.phrase.rest.recommend', text: 'Qu’est-ce que vous recommandez ?', meaning: T('מה אתה ממליץ?', 'What do you recommend?'),
    tip: T('אם התפריט מבלבל — תן למלצר להחליט. תמיד עובד.', 'If the menu confuses you — let the waiter decide. Always works.') },
  { id: 'fr.phrase.rest.water-please', text: 'Une bouteille d’eau, s’il vous plaît.', meaning: T('בקבוק מים, בבקשה.', 'A bottle of water, please.') },
  { id: 'fr.phrase.rest.bill-please', text: 'On peut avoir l’addition, s’il vous plaît ?', meaning: T('אפשר את החשבון, בבקשה?', 'Could we have the bill, please?'),
    tip: T('המשפט שסוגר כל ארוחה. בצרפת: l’addition.', 'The line that closes every meal. In France: l’addition.') },
  // hear — the waiter's chain
  { id: 'fr.reply.rest.how-many', text: 'Vous êtes combien ?', meaning: T('כמה אנשים?', 'How many people?') },
  { id: 'fr.reply.rest.something-drink', text: 'Quelque chose à boire ?', meaning: T('משהו לשתות?', 'Something to drink?') },
  { id: 'fr.reply.rest.ready-order', text: 'Vous êtes prêts à commander ?', meaning: T('מוכנים להזמין?', 'Are you ready to order?') },
  { id: 'fr.reply.rest.anything-else', text: 'Autre chose ?', meaning: T('עוד משהו?', 'Anything else?') },
  { id: 'fr.reply.rest.everything-okay', text: 'Tout va bien ?', meaning: T('הכל בסדר?', 'Is everything okay?') },
  { id: 'fr.reply.rest.enjoy-meal', text: 'Bon appétit !', meaning: T('בתיאבון!', 'Enjoy your meal!') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.one-moment', 'fr.phrase.recovery.thank-you'),
];

const SCENE_DINNER: BootcampDialogue = {
  id: 'restaurant-dinner',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonsoir, bienvenue ! Vous êtes combien ?', tr: TR('Good evening, welcome! How many people?', 'ערב טוב, ברוכים הבאים! כמה אנשים?'), he: 'ערב טוב, ברוכים הבאים! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Une table pour deux, s’il vous plaît.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'fr.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (כלי — לספור כמה אתם)'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Pas de problème — vous êtes combien ?', tr: TR('No problem — how many people?', 'אין בעיה — כמה אנשים?'), he: 'אין בעיה — כמה אנשים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Une table pour deux, s’il vous plaît.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'fr.phrase.rest.table-for-two', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Parfait, suivez-moi. Voici les cartes. Quelque chose à boire ?', tr: TR('Perfect, right this way. Here are your menus. Something to drink?', 'מצוין, בבקשה אחריי. הנה התפריטים. משהו לשתות?'), he: 'מצוין, בבקשה אחריי. הנה התפריטים. משהו לשתות?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Une bouteille d’eau, s’il vous plaît.', tr: TR('A bottle of water, please.', 'בקבוק מים, בבקשה.'), he: 'בקבוק מים, בבקשה.', itemId: 'fr.phrase.rest.water-please', correct: true, next: 'n3' },
      { en: 'On peut voir la carte ?', tr: TR('Could we see the menu?', 'אפשר לראות את התפריט? (הוא בדיוק נתן — הקשב)'), he: 'אפשר לראות את התפריט?', itemId: 'fr.phrase.rest.menu-please', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Les cartes sont juste devant vous — quelque chose à boire d’abord ?', tr: TR("The menus are right there in front of you — anything to drink first?", 'התפריטים ממש מולך — משהו לשתות קודם?'), he: 'התפריטים ממש מולך — משהו לשתות קודם?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Une bouteille d’eau, s’il vous plaît.', tr: TR('A bottle of water, please.', 'בקבוק מים, בבקשה.'), he: 'בקבוק מים, בבקשה.', itemId: 'fr.phrase.rest.water-please', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Très bien. Je vous laisse un instant… Vous êtes prêts à commander ?', tr: TR("Great. I'll give you a minute… Are you ready to order?", 'יופי. אתן לכם רגע… מוכנים להזמין?'), he: 'יופי. אתן לכם רגע… מוכנים להזמין?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais prendre les pâtes, s’il vous plaît.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'fr.phrase.rest.ill-have', correct: true, next: 'n4' },
      { en: 'Qu’est-ce que vous recommandez ?', tr: TR('What do you recommend?', 'מה אתה ממליץ? (מהלך חכם כשמתלבטים)'), he: 'מה אתה ממליץ?', itemId: 'fr.phrase.rest.recommend', correct: true, next: 'n3b' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: 'Les pâtes aux fruits de mer sont notre spécialité — très fraîches aujourd’hui.', tr: TR('The seafood pasta is our best — very fresh today.', 'פסטת פירות הים היא הכי טובה שלנו — טרייה מאוד היום.'), he: 'פסטת פירות הים היא הכי טובה שלנו — טרייה מאוד היום.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais prendre les pâtes, s’il vous plaît.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'fr.phrase.rest.ill-have', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', fast: true, next: 'c4', en: 'Excellent choix. Autre chose ?', tr: TR('Excellent choice. Anything else?', 'בחירה מצוינת. עוד משהו?'), he: 'בחירה מצוינת. עוד משהו?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'C’est tout, merci.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n5' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'Vous voulez — autre chose ?', tr: TR('Would you like — anything else?', 'תרצו — עוד משהו?'), he: 'תרצו — עוד משהו?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'C’est tout, merci.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Voilà. Bon appétit !… Tout va bien ?', tr: TR('Here you are. Enjoy your meal!… Is everything okay?', 'בבקשה. בתיאבון!… הכל בסדר?'), he: 'בבקשה. בתיאבון!… הכל בסדר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Oui, merci !', tr: TR('Yes, thank you!', 'כן, תודה!'), he: 'כן, תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Tout — va bien — avec le plat ?', tr: TR('Is — everything — okay with the food?', 'הכל — בסדר — עם האוכל?'), he: 'הכל — בסדר — עם האוכל?' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Oui, merci !', tr: TR('Yes, thank you!', 'כן, תודה!'), he: 'כן, תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', next: 'c6', en: 'Parfait. Dites-moi quand vous avez besoin de quelque chose.', tr: TR('Wonderful. Let me know when you need anything.', 'נהדר. תגידו לי כשתצטרכו משהו.'), he: 'נהדר. תגידו לי כשתצטרכו משהו.' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: 'On peut avoir l’addition, s’il vous plaît ?', tr: TR('Could we have the bill, please?', 'אפשר את החשבון, בבקשה?'), he: 'אפשר את החשבון, בבקשה?', itemId: 'fr.phrase.rest.bill-please', correct: true, next: 'n7' },
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'r6' },
    ] },
    { id: 'r6', who: 'npc', slow: true, next: 'c6b', en: 'Bien sûr — prenez votre temps.', tr: TR('Of course — take your time.', 'כמובן — קחו את הזמן.'), he: 'כמובן — קחו את הזמן.' },
    { id: 'c6b', who: 'you', en: '', he: '', choices: [
      { en: 'On peut avoir l’addition, s’il vous plaît ?', tr: TR('Could we have the bill, please?', 'אפשר את החשבון, בבקשה?'), he: 'אפשר את החשבון, בבקשה?', itemId: 'fr.phrase.rest.bill-please', correct: true, next: 'n7' },
    ] },
    { id: 'n7', who: 'npc', end: true, en: 'Voici l’addition. Merci, et bonne soirée !', tr: TR("Here's the bill. Thank you, and have a lovely evening!", 'הנה החשבון. תודה, וערב נפלא!'), he: 'הנה החשבון. תודה, וערב נפלא!' },
  ],
};

export const DAY13_FR: BootcampDayContent = {
  day: 13,
  title: T('מסעדה — בסיס', 'Restaurant Basics'),
  items: DAY13_FR_ITEMS,
  dialogues: { 'restaurant-dinner': SCENE_DINNER },
  steps: [
    { kind: 'talk', icon: '🍽️', title: T('משימה 13: מסעדה — בסיס', 'Mission 13: Restaurant Basics'),
      body: [
        T('לב הטיול הוא ארוחת ערב. היום לא לומדים "מילים על אוכל" — לומדים לנהל מסעדה שלמה.', 'The heart of travel is dinner. Today we don’t learn “food words” — we learn to run a whole restaurant.'),
        T('משולחן, דרך תפריט, הזמנה ושאלות המלצר — ועד החשבון. מקצה לקצה.', 'From the table, through the menu, the order, and the waiter’s questions — all the way to the bill. End to end.'),
      ], cta: T('להיכנס למסעדה', 'Walk into the restaurant') },
    { kind: 'tool', itemId: 'fr.phrase.rest.table-for-two', index: 1, total: 4, label: T('להשיג שולחן', 'Get a table') },
    { kind: 'tool', itemId: 'fr.phrase.rest.ill-have', index: 2, total: 4, label: T('תבנית ההזמנה', 'The ordering template') },
    { kind: 'tool', itemId: 'fr.phrase.rest.recommend', index: 3, total: 4, label: T('כשמתלבטים', 'When unsure') },
    { kind: 'tool', itemId: 'fr.phrase.rest.bill-please', index: 4, total: 4, label: T('לסגור חשבון', 'Close the bill') },
    { kind: 'replies', saidItemId: 'fr.phrase.rest.ill-have',
      replyIds: ['fr.reply.rest.something-drink', 'fr.reply.rest.ready-order', 'fr.reply.rest.anything-else', 'fr.reply.rest.everything-okay'] },
    { kind: 'receipt', text: T('אתה מזהה את כל שאלות המלצר — לפני, במהלך, ואחרי הארוחה.', 'You recognize every waiter question — before, during, and after the meal.') },
    { kind: 'quiz', itemId: 'fr.reply.rest.ready-order', wrongIds: ['fr.reply.rest.something-drink', 'fr.reply.rest.enjoy-meal'] },
    { kind: 'quiz', itemId: 'fr.reply.rest.how-many', wrongIds: ['fr.reply.rest.anything-else', 'fr.reply.rest.everything-okay'] },
    { kind: 'dialogue', dialogueId: 'restaurant-dinner' },
    { kind: 'receipt', text: T('ניהלת ארוחת ערב שלמה בצרפתית — שולחן, הזמנה, המלצה, חשבון.', 'You ran a full dinner in French — table, order, recommendation, bill.') },
    { kind: 'swipe', itemIds: DAY13_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Et vous voulez ça cuit comment — saignant, à point, ou bien cuit ?', tr: TR('And how would you like that cooked — rare, medium, or well done?', 'ואיך תרצה שיהיה מבושל — נא, בינוני, או עשוי היטב?'), he: 'ואיך תרצה שיהיה מבושל — נא, בינוני, או עשוי היטב?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.rest.bill-please' },
    { kind: 'receipt', text: T('המלצר ירה שלוש אפשרויות במהירות — וביקשת שיאט במקום לנחש.', 'The waiter fired three options fast — and you asked him to slow down instead of guessing.') },
    { kind: 'summary' },
  ],
};
