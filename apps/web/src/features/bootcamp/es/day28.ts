import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { DAY13_ES_ITEMS } from './day13.js';
import { DAY19_ES_ITEMS } from './day19.js';
import { DAY23_ES_ITEMS } from './day23.js';

/**
 * Spanish Mission 28 — "Sin subtítulos" (No Subtitles). Cold integration, no new content: every
 * scene at full speed with surprise variants — your ears stand alone. Reuses days 13, 19 & 23 items.
 * Same structure as English day 28. `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY13_ES_ITEMS, ...DAY19_ES_ITEMS, ...DAY23_ES_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY28_ES_ITEMS: BootcampItem[] = [
  ...pick(
    'es.phrase.trans.one-ticket', 'es.phrase.trans.does-stop',
    'es.phrase.rest.table-for-two', 'es.phrase.rest.ill-have',
    'es.phrase.talk.beautiful-place', 'es.phrase.talk.recommend-place',
  ),
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const COLD_TRANSIT: BootcampDialogue = {
  id: 'ns-transit',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Bueno — ¿a dónde va?', tr: TR('Right — where to?', 'טוב — לאן?'), he: 'טוב — לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un billete para el centro, por favor.', tr: TR('One ticket to the center, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'es.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'El andén ha cambiado — ahora es el cuatro, ¡rápido!', tr: TR("Platform's changed — it's four now, quick!", 'הרציף השתנה — עכשיו ארבע, מהר!'), he: 'הרציף השתנה — עכשיו ארבע, מהר!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Para en el museo?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'es.phrase.trans.does-stop', correct: true, next: 'n3' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Tres paradas — ¡vamos, vamos!', tr: TR('Three stops — go, go!', 'שלוש תחנות — קדימה, קדימה!'), he: 'שלוש תחנות — קדימה, קדימה!' },
  ],
};

const COLD_DINER: BootcampDialogue = {
  id: 'ns-diner',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Buenas — ¿mesa para cuántos?', tr: TR('Evening — table for how many?', 'ערב — שולחן לכמה?'), he: 'ערב — שולחן לכמה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Una mesa para dos, por favor.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'es.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'La cocina va a cerrar — ¿listos para pedir?', tr: TR("Kitchen's about to close — ready to order?", 'המטבח עומד להיסגר — מוכן להזמין?'), he: 'המטבח עומד להיסגר — מוכן להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Voy a tomar la pasta, por favor.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'es.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Buena decisión — ¡el último en entrar! Enseguida sale.', tr: TR('Good call — last one in! Coming up.', 'בחירה טובה — האחרון שנכנס! תכף מגיע.'), he: 'בחירה טובה — האחרון שנכנס! תכף מגיע.' },
  ],
};

const COLD_LOCAL: BootcampDialogue = {
  id: 'ns-local',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Un sitio precioso, ¿verdad? ¿Primera vez aquí?', tr: TR('Gorgeous spot, right? First time here?', 'מקום מהמם, נכון? פעם ראשונה כאן?'), he: 'מקום מהמם, נכון? פעם ראשונה כאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Este lugar es precioso.', tr: TR('This place is beautiful.', 'המקום הזה יפהפה.'), he: 'המקום הזה יפהפה.', itemId: 'es.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Tiene que ver el casco antiguo — ¿tiene un segundo?', tr: TR("You've gotta see the old town — got a second?", 'אתה חייב לראות את העיר העתיקה — יש לך רגע?'), he: 'אתה חייב לראות את העיר העתיקה — יש לך רגע?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Me puede recomendar un sitio?', tr: TR('Can you recommend a place?', 'אתה יכול להמליץ על מקום?'), he: 'אתה יכול להמליץ על מקום?', itemId: 'es.phrase.talk.recommend-place', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: '«Mamá Rosa» — vaya ahora, ¡dígales que la mando yo!', tr: TR("Mama Rosa's — go now, tell 'em I sent you!", "'מאמא רוזה' — לך עכשיו, תגיד שאני שלחתי!"), he: "'מאמא רוזה' — לך עכשיו, תגיד שאני שלחתי!" },
  ],
};

export const DAY28_ES: BootcampDayContent = {
  day: 28,
  title: T('בלי כתוביות', 'No Subtitles'),
  items: DAY28_ES_ITEMS,
  dialogues: { 'ns-transit': COLD_TRANSIT, 'ns-diner': COLD_DINER, 'ns-local': COLD_LOCAL },
  steps: [
    { kind: 'talk', icon: '👂', title: T('משימה 28: בלי כתוביות', 'Mission 28: No Subtitles'),
      body: [
        T('אין חומר חדש. היום מורידים את גלגלי העזר — הכל במהירות מלאה, עם וריאציות הפתעה.', 'No new material. Today the training wheels come off — everything at full speed, with surprise variants.'),
        T('האוזניים שלך עומדות לבד עכשיו. וזה בדיוק מה שנוכיח.', 'Your ears stand alone now. And that’s exactly what we’ll prove.'),
      ], cta: T('לסמוך על האוזניים', 'Trust your ears') },
    { kind: 'dialogue', dialogueId: 'ns-transit' },
    { kind: 'receipt', text: T('שרדת תחבורה מהירה עם שינוי רציף פתאומי — בלי להיתקע.', 'You survived fast transit with a sudden platform change — without getting stuck.') },
    { kind: 'ambush', npc: { en: 'Esa máquina es solo en efectivo, por cierto — ¿lleva monedas encima?', tr: TR("That machine's cash only by the way — you got coins on you?", 'המכונה הזאת מקבלת רק מזומן, דרך אגב — יש עליך מטבעות?'), he: 'המכונה הזאת מקבלת רק מזומן, דרך אגב — יש עליך מטבעות?' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.trans.does-stop' },
    { kind: 'dialogue', dialogueId: 'ns-diner' },
    { kind: 'receipt', text: T('שרדת הזמנה מהירה לפני סגירת מטבח — בלי כתוביות איטיות.', 'You survived a fast order before the kitchen closed — no slow subtitles.') },
    { kind: 'ambush', npc: { en: 'En realidad se nos ha acabado la pasta esta noche — ¿el risotto en su lugar, quizás?', tr: TR("We're actually all out of pasta tonight — the risotto instead maybe?", 'בעצם נגמרה לנו הפסטה הערב — אולי ריזוטו במקום?'), he: 'בעצם נגמרה לנו הפסטה הערב — אולי ריזוטו במקום?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.phrase.rest.table-for-two' },
    { kind: 'dialogue', dialogueId: 'ns-local' },
    { kind: 'receipt', text: T('שיחה מהירה עם מקומי — הבנת, הגבת, וקיבלת המלצה. האוזניים ניצחו.', 'A fast chat with a local — you understood, responded, and got a recommendation. Your ears won.') },
    { kind: 'summary' },
  ],
};
