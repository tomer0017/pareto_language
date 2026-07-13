import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { DAY4_FR_ITEMS } from './day4.js';
import { DAY13_FR_ITEMS } from './day13.js';
import { DAY16_FR_ITEMS } from './day16.js';

/**
 * French Mission 18 — "Point de contrôle : journée gastronomie" (Food Day Checkpoint). Cold
 * integration, no new content: coffee morning → market noon → restaurant night, reusing days 4, 13
 * & 16 items. Same structure as English day 18. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY4_FR_ITEMS, ...DAY13_FR_ITEMS, ...DAY16_FR_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY18_FR_ITEMS: BootcampItem[] = [
  ...pick(
    'fr.phrase.coffee.iced-coffee', 'fr.reply.coffee.milk-sugar',
    'fr.phrase.street.one-of-those', 'fr.phrase.street.how-much', 'fr.reply.street.how-many',
    'fr.phrase.rest.table-for-two', 'fr.phrase.rest.ill-have', 'fr.phrase.rest.bill-please',
  ),
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const COLD_COFFEE: BootcampDialogue = {
  id: 'cold-coffee',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Bonjour ! Qu’est-ce que je vous sers ?', tr: TR('Morning! What can I get you?', 'בוקר! מה להביא לך?'), he: 'בוקר! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je voudrais un café glacé, s’il vous plaît.', tr: TR("I'd like an iced coffee, please.", 'אני רוצה קפה קר, בבקשה.'), he: 'אני רוצה קפה קר, בבקשה.', itemId: 'fr.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Bien sûr — lait et sucre ?', tr: TR('Sure — milk and sugar?', 'בטח — חלב וסוכר?'), he: 'בטח — חלב וסוכר?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Avec du lait, sans sucre.', tr: TR('Milk, no sugar.', 'עם חלב, בלי סוכר.'), he: 'עם חלב, בלי סוכר.', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Ça arrive tout de suite. Bonne matinée !', tr: TR('Coming right up. Have a great morning!', 'תכף מוכן. בוקר נהדר!'), he: 'תכף מוכן. בוקר נהדר!' },
  ],
};

const COLD_MARKET: BootcampDialogue = {
  id: 'cold-market',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Fruits frais, fruits frais ! Vous voulez quoi ?', tr: TR('Fresh fruit, fresh fruit! What would you like?', 'פירות טריים, פירות טריים! מה תרצה?'), he: 'פירות טריים, פירות טריים! מה תרצה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'C’est combien ?', tr: TR('How much is it?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'fr.phrase.street.how-much', correct: true, next: 'n2' },
      { en: 'Un de ceux-là, s’il vous plaît.', tr: TR('One of those, please.', 'אחד מאלה, בבקשה.'), he: 'אחד מאלה, בבקשה.', itemId: 'fr.phrase.street.one-of-those', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Meilleur prix pour vous — six ! Combien ?', tr: TR('Best price for you — six! How many?', 'מחיר הכי טוב בשבילך — שישה! כמה?'), he: 'מחיר הכי טוב בשבילך — שישה! כמה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Deux, s’il vous plaît.', tr: TR('Two, please.', 'שניים, בבקשה.'), he: 'שניים, בבקשה.', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Tenez — régalez-vous, mon ami !', tr: TR('Here you go — enjoy, my friend!', 'הנה לך — תיהנה, חבר!'), he: 'הנה לך — תיהנה, חבר!' },
  ],
};

const COLD_RESTAURANT: BootcampDialogue = {
  id: 'cold-restaurant',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonsoir ! Vous êtes combien ?', tr: TR('Good evening! How many people?', 'ערב טוב! כמה אנשים?'), he: 'ערב טוב! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Une table pour deux, s’il vous plaît.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'fr.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Suivez-moi. Vous êtes prêts à commander ?', tr: TR('Right this way. Are you ready to order?', 'בבקשה אחריי. מוכנים להזמין?'), he: 'בבקשה אחריי. מוכנים להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais prendre les pâtes, s’il vous plaît.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'fr.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Excellent. Je vous apporte ça tout de suite. Faites-moi signe quand vous voulez l’addition.', tr: TR("Excellent. I'll bring it right out. Just wave when you'd like the bill.", 'מצוין. אביא מיד. תסמן כשתרצה את החשבון.'), he: 'מצוין. אביא מיד. תסמן כשתרצה את החשבון.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'On peut avoir l’addition, s’il vous plaît ?', tr: TR('Could we have the bill, please?', 'אפשר את החשבון, בבקשה?'), he: 'אפשר את החשבון, בבקשה?', itemId: 'fr.phrase.rest.bill-please', correct: true, next: 'n4' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Bien sûr — voici. Bonne soirée !', tr: TR('Of course — here you go. Have a lovely evening!', 'כמובן — בבקשה. ערב נפלא!'), he: 'כמובן — בבקשה. ערב נפלא!' },
  ],
};

export const DAY18_FR: BootcampDayContent = {
  day: 18,
  title: T('נקודת ביקורת: יום אוכל', 'CHECKPOINT: Food Day'),
  items: DAY18_FR_ITEMS,
  dialogues: { 'cold-coffee': COLD_COFFEE, 'cold-market': COLD_MARKET, 'cold-restaurant': COLD_RESTAURANT },
  steps: [
    { kind: 'talk', icon: '🍽️', title: T('נקודת ביקורת: יום אוכל', 'Checkpoint: Food Day'),
      body: [
        T('אין חומר חדש היום. רק הוכחה — יום אוכל שלם, מהבוקר עד הלילה.', 'No new material today. Just proof — a full food day, morning to night.'),
        T('קפה בבוקר, שוק בצהריים, מסעדה בערב. הכל קר, מהר, בלי הכנה.', 'Coffee in the morning, a market at noon, a restaurant at night. All cold, fast, unprepared.'),
      ], cta: T('בוקר טוב — קדימה', 'Good morning — go') },
    { kind: 'dialogue', dialogueId: 'cold-coffee' },
    { kind: 'receipt', text: T('שרדת קפה בבוקר בקור — הזמנה וחלב/סוכר, בלי הכנה.', 'You survived a cold morning coffee — order and milk/sugar, no prep.') },
    { kind: 'ambush', npc: { en: 'Désolé — rappelez-moi, c’était avec lait et sucre ou juste du lait ?', tr: TR('Sorry — remind me, was that with milk and sugar or just milk?', 'סליחה — תזכיר לי, זה היה עם חלב וסוכר או רק חלב?'), he: 'סליחה — תזכיר לי, זה היה עם חלב וסוכר או רק חלב?' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.reply.coffee.milk-sugar' },
    { kind: 'dialogue', dialogueId: 'cold-market' },
    { kind: 'receipt', text: T('שרדת דוכן שוק רועש בקור — מחיר, כמות, וסגירה.', 'You survived a loud market stall cold — price, quantity, and a close.') },
    { kind: 'ambush', npc: { en: 'Deux pour six ou cinq pour treize — quelle offre vous voulez, chef ?', tr: TR('Two for six or five for thirteen — which deal do you want boss?', 'שניים בשישה או חמישה בשלוש-עשרה — איזו עסקה אתה רוצה, בוס?'), he: 'שניים בשישה או חמישה בשלוש-עשרה — איזו עסקה אתה רוצה, בוס?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.reply.street.how-many' },
    { kind: 'dialogue', dialogueId: 'cold-restaurant' },
    { kind: 'receipt', text: T('יום אוכל שלם — קפה, שוק, ומסעדה — בקור. אף אחד לא ירעיב אותך.', 'A full food day — coffee, market, and restaurant — cold. Nobody can starve you.') },
    { kind: 'summary' },
  ],
};
