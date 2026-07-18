import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { DAY4_ES_ITEMS } from './day4.js';
import { DAY7_ES_ITEMS } from './day7.js';
import { DAY13_ES_ITEMS } from './day13.js';
import { DAY23_ES_ITEMS } from './day23.js';
import { DAY25_ES_ITEMS } from './day25.js';

/**
 * Spanish Mission 30 — "Un día completo solo en el extranjero" (A Complete Day Abroad Alone). The
 * finale — cold, no new content: coffee → taxi → lunch → a problem → a warm goodbye, one take.
 * Reuses days 4, 7, 13, 23 & 25 items. `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY4_ES_ITEMS, ...DAY7_ES_ITEMS, ...DAY13_ES_ITEMS, ...DAY23_ES_ITEMS, ...DAY25_ES_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY30_ES_ITEMS: BootcampItem[] = [
  ...pick(
    'es.phrase.coffee.iced-coffee',
    'es.phrase.taxi.to-address',
    'es.phrase.rest.table-for-two', 'es.phrase.rest.ill-have',
    'es.phrase.fix.not-ordered',
    'es.phrase.talk.beautiful-place', 'es.phrase.talk.nice-talking',
  ),
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const COLD_MORNING: BootcampDialogue = {
  id: 'fin-morning',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: '¡Buenos días! ¿Qué le pongo?', tr: TR('Morning! What can I get you?', 'בוקר! מה להביא לך?'), he: 'בוקר! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Quiero un café con hielo, por favor.', tr: TR("I'd like an iced coffee, please.", 'אני רוצה קפה קר, בבקשה.'), he: 'אני רוצה קפה קר, בבקשה.', itemId: 'es.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Enseguida — ¿algo más esta mañana?', tr: TR('Coming up — anything else this morning?', 'תכף מוכן — עוד משהו הבוקר?'), he: 'תכף מוכן — עוד משהו הבוקר?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Eso es todo, gracias.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n3' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: '¡Que tenga un día estupendo!', tr: TR('Have a wonderful day!', 'שיהיה יום נפלא!'), he: 'שיהיה יום נפלא!' },
  ],
};

const COLD_TAXI: BootcampDialogue = {
  id: 'fin-taxi',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: '¿A dónde le llevo?', tr: TR('Where can I take you?', 'לאן לקחת אותך?'), he: 'לאן לקחת אותך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'A esta dirección, por favor.', tr: TR('To this address, please.', 'לכתובת הזאת, בבקשה.'), he: 'לכתובת הזאת, בבקשה.', itemId: 'es.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Serán unos diez. Ya hemos llegado.', tr: TR("It'll be about ten. We're here.", 'זה יהיה בערך עשרה. הגענו.'), he: 'זה יהיה בערך עשרה. הגענו.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: '¡Que tenga buen día!', tr: TR('Enjoy your day!', 'תיהנה מהיום!'), he: 'תיהנה מהיום!' },
  ],
};

const COLD_LUNCH: BootcampDialogue = {
  id: 'fin-lunch',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿Cuántos son?', tr: TR('Hello! How many people?', 'שלום! כמה אנשים?'), he: 'שלום! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Una mesa para dos, por favor.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'es.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Perfecto. ¿Listo para pedir?', tr: TR('Wonderful. Ready to order?', 'נהדר. מוכן להזמין?'), he: 'נהדר. מוכן להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Voy a tomar la pasta, por favor.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'es.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Excelente elección — ¡enseguida se lo traigo!', tr: TR('Great choice — coming right up!', 'בחירה מעולה — תכף מגיע!'), he: 'בחירה מעולה — תכף מגיע!' },
  ],
};

const COLD_TWIST: BootcampDialogue = {
  id: 'fin-twist',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Aquí tiene — ¡el risotto de marisco!', tr: TR("Here you are — the seafood risotto!", 'בבקשה — ריזוטו פירות ים!'), he: 'בבקשה — ריזוטו פירות ים!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Esto no es lo que pedí.', tr: TR("This isn't what I ordered.", 'זה לא מה שהזמנתי.'), he: 'זה לא מה שהזמנתי.', itemId: 'es.phrase.fix.not-ordered', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: '¡Ay — mis disculpas! La pasta, ¿verdad? Lo corrijo ahora mismo.', tr: TR("Oh — my apologies! The pasta, right? I'll fix it now.", 'אוי — סליחה! הפסטה, נכון? אני מתקן עכשיו.'), he: 'אוי — סליחה! הפסטה, נכון? אני מתקן עכשיו.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'El plato correcto, invita la casa. ¡Disculpe otra vez!', tr: TR('The right dish, on the house. So sorry again!', 'המנה הנכונה, על חשבון הבית. שוב סליחה!'), he: 'המנה הנכונה, על חשבון הבית. שוב סליחה!' },
  ],
};

const COLD_EVENING: BootcampDialogue = {
  id: 'fin-evening',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Qué puesta de sol. Ha elegido un sitio precioso.', tr: TR("What a sunset. You've picked a beautiful spot.", 'איזו שקיעה. בחרת מקום יפהפה.'), he: 'איזו שקיעה. בחרת מקום יפהפה.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Este lugar es precioso.', tr: TR('This place is beautiful.', 'המקום הזה יפהפה.'), he: 'המקום הזה יפהפה.', itemId: 'es.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Es verdad. Bueno — buen viaje, amigo.', tr: TR('It really is. Well — safe travels, my friend.', 'באמת. אז — נסיעה טובה, חבר.'), he: 'באמת. אז — נסיעה טובה, חבר.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Ha sido un placer hablar con usted.', tr: TR('It was nice talking to you.', 'היה נעים לדבר איתך.'), he: 'היה נעים לדבר איתך.', itemId: 'es.phrase.talk.nice-talking', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Cuídese — ¡y vuelva algún día!', tr: TR('Take care — and come back one day!', 'שמור על עצמך — ותחזור יום אחד!'), he: 'שמור על עצמך — ותחזור יום אחד!' },
  ],
};

export const DAY30_ES: BootcampDayContent = {
  day: 30,
  title: T('יום שלם לבד בחו״ל', 'A Complete Day Abroad Alone'),
  items: DAY30_ES_ITEMS,
  dialogues: { 'fin-morning': COLD_MORNING, 'fin-taxi': COLD_TAXI, 'fin-lunch': COLD_LUNCH, 'fin-twist': COLD_TWIST, 'fin-evening': COLD_EVENING },
  steps: [
    { kind: 'talk', icon: '🎖️', title: T('משימה 30: יום שלם לבד בחו״ל', 'Mission 30: A Complete Day Abroad Alone'),
      body: [
        T('זהו. אין חומר חדש — רק אתה, מבוקר עד לילה, לבד.', 'This is it. No new material — just you, morning to night, alone.'),
        T('קפה, מונית, ארוחה, תקלה, ופרידה חמה. טייק אחד, בקור. פסק דין אמיתי.', 'Coffee, a taxi, a meal, a problem, and a warm goodbye. One take, cold. A real verdict.'),
        T('לפני 30 משימות פחדת לפתוח את הפה. עכשיו תראה מי אתה.', 'Thirty missions ago you were afraid to open your mouth. Now — see who you are.'),
      ], cta: T('להתחיל את היום', 'Begin the day') },
    { kind: 'dialogue', dialogueId: 'fin-morning' },
    { kind: 'receipt', text: T('בוקר: קפה בקור, בלי הכנה. היום התחיל טוב.', 'Morning: a cold coffee, no prep. The day started well.') },
    { kind: 'dialogue', dialogueId: 'fin-taxi' },
    { kind: 'receipt', text: T('מונית: יעד ותשלום. אתה זז בעיר לבד.', 'Taxi: destination and payment. You move through the city alone.') },
    { kind: 'ambush', npc: { en: '¿Le importa si voy por la ruta panorámica? Puede añadir unos minutos pero sin coste extra.', tr: TR('Mind if I take the scenic route it might add a few minutes but no extra charge?', 'אכפת לך אם אקח את הדרך היפה? זה אולי יוסיף כמה דקות אבל בלי תוספת תשלום.'), he: 'אכפת לך אם אקח את הדרך היפה? זה אולי יוסיף כמה דקות אבל בלי תוספת תשלום.' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.taxi.to-address' },
    { kind: 'dialogue', dialogueId: 'fin-lunch' },
    { kind: 'receipt', text: T('צהריים: שולחן והזמנה — חלק לגמרי.', 'Noon: a table and an order — completely smooth.') },
    { kind: 'dialogue', dialogueId: 'fin-twist' },
    { kind: 'receipt', text: T('תקלה: מנה שגויה — ותיקנת אותה ברוגע, כמו מקצוען.', 'A problem: a wrong dish — and you fixed it calmly, like a pro.') },
    { kind: 'ambush', npc: { en: '¿Y quiere que le ponga también el plato equivocado para llevar, sin coste?', tr: TR('And would you like me to box the wrong dish for you to take away as well no charge?', 'ותרצה שאארוז לך גם את המנה השגויה לקחת, בלי תשלום?'), he: 'ותרצה שאארוז לך גם את המנה השגויה לקחת, בלי תשלום?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.phrase.fix.not-ordered' },
    { kind: 'dialogue', dialogueId: 'fin-evening' },
    { kind: 'receipt', text: T('ערב: שיחה חמה עם זר, ופרידה יפה. יום שלם לבד בחו״ל — שרדת. יותר מזה: נהנית.', 'Evening: a warm chat with a stranger, and a lovely goodbye. A full day abroad alone — you survived. More than that: you enjoyed it.') },
    { kind: 'summary' },
  ],
};
