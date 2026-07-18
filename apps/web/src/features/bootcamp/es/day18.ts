import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { DAY4_ES_ITEMS } from './day4.js';
import { DAY13_ES_ITEMS } from './day13.js';
import { DAY16_ES_ITEMS } from './day16.js';

/**
 * Spanish Mission 18 — "Punto de control: día gastronómico" (Food Day Checkpoint). Cold integration,
 * no new content: coffee morning → market noon → restaurant night, reusing days 4, 13 & 16 items.
 * Same structure as English day 18. `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY4_ES_ITEMS, ...DAY13_ES_ITEMS, ...DAY16_ES_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY18_ES_ITEMS: BootcampItem[] = [
  ...pick(
    'es.phrase.coffee.iced-coffee', 'es.reply.coffee.milk-sugar',
    'es.phrase.street.one-of-those', 'es.phrase.street.how-much', 'es.reply.street.how-many',
    'es.phrase.rest.table-for-two', 'es.phrase.rest.ill-have', 'es.phrase.rest.bill-please',
  ),
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const COLD_COFFEE: BootcampDialogue = {
  id: 'cold-coffee',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: '¡Buenos días! ¿Qué le pongo?', tr: TR('Morning! What can I get you?', 'בוקר! מה להביא לך?'), he: 'בוקר! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Quiero un café con hielo, por favor.', tr: TR("I'd like an iced coffee, please.", 'אני רוצה קפה קר, בבקשה.'), he: 'אני רוצה קפה קר, בבקשה.', itemId: 'es.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Claro — ¿leche y azúcar?', tr: TR('Sure — milk and sugar?', 'בטח — חלב וסוכר?'), he: 'בטח — חלב וסוכר?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Con leche, sin azúcar.', tr: TR('Milk, no sugar.', 'עם חלב, בלי סוכר.'), he: 'עם חלב, בלי סוכר.', correct: true, next: 'n3' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Enseguida se lo preparo. ¡Buenos días!', tr: TR('Coming right up. Have a great morning!', 'תכף מוכן. בוקר נהדר!'), he: 'תכף מוכן. בוקר נהדר!' },
  ],
};

const COLD_MARKET: BootcampDialogue = {
  id: 'cold-market',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: '¡Fruta fresca, fruta fresca! ¿Qué quiere?', tr: TR('Fresh fruit, fresh fruit! What would you like?', 'פירות טריים, פירות טריים! מה תרצה?'), he: 'פירות טריים, פירות טריים! מה תרצה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: '¿Cuánto es?', tr: TR('How much is it?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'es.phrase.street.how-much', correct: true, next: 'n2' },
      { en: 'Uno de esos, por favor.', tr: TR('One of those, please.', 'אחד מאלה, בבקשה.'), he: 'אחד מאלה, בבקשה.', itemId: 'es.phrase.street.one-of-those', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Mejor precio para usted — ¡seis! ¿Cuántos?', tr: TR('Best price for you — six! How many?', 'מחיר הכי טוב בשבילך — שישה! כמה?'), he: 'מחיר הכי טוב בשבילך — שישה! כמה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Dos, por favor.', tr: TR('Two, please.', 'שניים, בבקשה.'), he: 'שניים, בבקשה.', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Tenga — ¡que aproveche, amigo!', tr: TR('Here you go — enjoy, my friend!', 'הנה לך — תיהנה, חבר!'), he: 'הנה לך — תיהנה, חבר!' },
  ],
};

const COLD_RESTAURANT: BootcampDialogue = {
  id: 'cold-restaurant',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Buenas noches! ¿Cuántos son?', tr: TR('Good evening! How many people?', 'ערב טוב! כמה אנשים?'), he: 'ערב טוב! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Una mesa para dos, por favor.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'es.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Síganme. ¿Están listos para pedir?', tr: TR('Right this way. Are you ready to order?', 'בבקשה אחריי. מוכנים להזמין?'), he: 'בבקשה אחריי. מוכנים להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Voy a tomar la pasta, por favor.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'es.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Excelente. Se lo traigo enseguida. Avíseme cuando quiera la cuenta.', tr: TR("Excellent. I'll bring it right out. Just wave when you'd like the bill.", 'מצוין. אביא מיד. תסמן כשתרצה את החשבון.'), he: 'מצוין. אביא מיד. תסמן כשתרצה את החשבון.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Nos trae la cuenta, por favor?', tr: TR('Could we have the bill, please?', 'אפשר את החשבון, בבקשה?'), he: 'אפשר את החשבון, בבקשה?', itemId: 'es.phrase.rest.bill-please', correct: true, next: 'n4' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Claro — aquí tiene. ¡Que pasen buena noche!', tr: TR('Of course — here you go. Have a lovely evening!', 'כמובן — בבקשה. ערב נפלא!'), he: 'כמובן — בבקשה. ערב נפלא!' },
  ],
};

export const DAY18_ES: BootcampDayContent = {
  day: 18,
  title: T('נקודת ביקורת: יום אוכל', 'CHECKPOINT: Food Day'),
  items: DAY18_ES_ITEMS,
  dialogues: { 'cold-coffee': COLD_COFFEE, 'cold-market': COLD_MARKET, 'cold-restaurant': COLD_RESTAURANT },
  steps: [
    { kind: 'talk', icon: '🍽️', title: T('נקודת ביקורת: יום אוכל', 'Checkpoint: Food Day'),
      body: [
        T('אין חומר חדש היום. רק הוכחה — יום אוכל שלם, מהבוקר עד הלילה.', 'No new material today. Just proof — a full food day, morning to night.'),
        T('קפה בבוקר, שוק בצהריים, מסעדה בערב. הכל קר, מהר, בלי הכנה.', 'Coffee in the morning, a market at noon, a restaurant at night. All cold, fast, unprepared.'),
      ], cta: T('בוקר טוב — קדימה', 'Good morning — go') },
    { kind: 'dialogue', dialogueId: 'cold-coffee' },
    { kind: 'receipt', text: T('שרדת קפה בבוקר בקור — הזמנה וחלב/סוכר, בלי הכנה.', 'You survived a cold morning coffee — order and milk/sugar, no prep.') },
    { kind: 'ambush', npc: { en: 'Perdone — recuérdeme, ¿era con leche y azúcar o solo con leche?', tr: TR('Sorry — remind me, was that with milk and sugar or just milk?', 'סליחה — תזכיר לי, זה היה עם חלב וסוכר או רק חלב?'), he: 'סליחה — תזכיר לי, זה היה עם חלב וסוכר או רק חלב?' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.reply.coffee.milk-sugar' },
    { kind: 'dialogue', dialogueId: 'cold-market' },
    { kind: 'receipt', text: T('שרדת דוכן שוק רועש בקור — מחיר, כמות, וסגירה.', 'You survived a loud market stall cold — price, quantity, and a close.') },
    { kind: 'ambush', npc: { en: 'Dos por seis o cinco por trece — ¿qué oferta quiere, jefe?', tr: TR('Two for six or five for thirteen — which deal do you want boss?', 'שניים בשישה או חמישה בשלוש-עשרה — איזו עסקה אתה רוצה, בוס?'), he: 'שניים בשישה או חמישה בשלוש-עשרה — איזו עסקה אתה רוצה, בוס?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.reply.street.how-many' },
    { kind: 'dialogue', dialogueId: 'cold-restaurant' },
    { kind: 'receipt', text: T('יום אוכל שלם — קפה, שוק, ומסעדה — בקור. אף אחד לא ירעיב אותך.', 'A full food day — coffee, market, and restaurant — cold. Nobody can starve you.') },
    { kind: 'summary' },
  ],
};
