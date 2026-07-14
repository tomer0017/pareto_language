import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { DAY13_FR_ITEMS } from './day13.js';
import { DAY19_FR_ITEMS } from './day19.js';
import { DAY23_FR_ITEMS } from './day23.js';

/**
 * French Mission 28 — "Sans sous-titres" (No Subtitles). Cold integration, no new content: every
 * scene at full speed with surprise variants — your ears stand alone. Reuses days 13, 19 & 23 items.
 * Same structure as English day 28. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY13_FR_ITEMS, ...DAY19_FR_ITEMS, ...DAY23_FR_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY28_FR_ITEMS: BootcampItem[] = [
  ...pick(
    'fr.phrase.trans.one-ticket', 'fr.phrase.trans.does-stop',
    'fr.phrase.rest.table-for-two', 'fr.phrase.rest.ill-have',
    'fr.phrase.talk.beautiful-place', 'fr.phrase.talk.recommend-place',
  ),
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const COLD_TRANSIT: BootcampDialogue = {
  id: 'ns-transit',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Bon — vous allez où ?', tr: TR('Right — where to?', 'טוב — לאן?'), he: 'טוב — לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un billet pour le centre, s’il vous plaît.', tr: TR('One ticket to the center, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'fr.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Le quai a changé — c’est le quatre maintenant, vite !', tr: TR("Platform's changed — it's four now, quick!", 'הרציף השתנה — עכשיו ארבע, מהר!'), he: 'הרציף השתנה — עכשיו ארבע, מהר!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Ça s’arrête au musée ?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'fr.phrase.trans.does-stop', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Trois arrêts — allez, allez !', tr: TR('Three stops — go, go!', 'שלוש תחנות — קדימה, קדימה!'), he: 'שלוש תחנות — קדימה, קדימה!' },
  ],
};

const COLD_DINER: BootcampDialogue = {
  id: 'ns-diner',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Bonsoir — une table pour combien ?', tr: TR('Evening — table for how many?', 'ערב — שולחן לכמה?'), he: 'ערב — שולחן לכמה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Une table pour deux, s’il vous plaît.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'fr.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'La cuisine va fermer — prêt à commander ?', tr: TR("Kitchen's about to close — ready to order?", 'המטבח עומד להיסגר — מוכן להזמין?'), he: 'המטבח עומד להיסגר — מוכן להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais prendre les pâtes, s’il vous plaît.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'fr.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Bien joué — le dernier admis ! Ça arrive.', tr: TR('Good call — last one in! Coming up.', 'בחירה טובה — האחרון שנכנס! תכף מגיע.'), he: 'בחירה טובה — האחרון שנכנס! תכף מגיע.' },
  ],
};

const COLD_LOCAL: BootcampDialogue = {
  id: 'ns-local',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Superbe endroit, non ? Première fois ici ?', tr: TR('Gorgeous spot, right? First time here?', 'מקום מהמם, נכון? פעם ראשונה כאן?'), he: 'מקום מהמם, נכון? פעם ראשונה כאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Cet endroit est magnifique.', tr: TR('This place is beautiful.', 'המקום הזה יפהפה.'), he: 'המקום הזה יפהפה.', itemId: 'fr.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Vous devez voir la vieille ville — vous avez une seconde ?', tr: TR("You've gotta see the old town — got a second?", 'אתה חייב לראות את העיר העתיקה — יש לך רגע?'), he: 'אתה חייב לראות את העיר העתיקה — יש לך רגע?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Vous pouvez recommander un endroit ?', tr: TR('Can you recommend a place?', 'אתה יכול להמליץ על מקום?'), he: 'אתה יכול להמליץ על מקום?', itemId: 'fr.phrase.talk.recommend-place', correct: true, next: 'n3' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: '« Mama Rosa » — allez-y tout de suite, dites-leur que je vous envoie !', tr: TR("Mama Rosa's — go now, tell 'em I sent you!", "'מאמא רוזה' — לך עכשיו, תגיד שאני שלחתי!"), he: "'מאמא רוזה' — לך עכשיו, תגיד שאני שלחתי!" },
  ],
};

export const DAY28_FR: BootcampDayContent = {
  day: 28,
  title: T('בלי כתוביות', 'No Subtitles'),
  items: DAY28_FR_ITEMS,
  dialogues: { 'ns-transit': COLD_TRANSIT, 'ns-diner': COLD_DINER, 'ns-local': COLD_LOCAL },
  steps: [
    { kind: 'talk', icon: '👂', title: T('משימה 28: בלי כתוביות', 'Mission 28: No Subtitles'),
      body: [
        T('אין חומר חדש. היום מורידים את גלגלי העזר — הכל במהירות מלאה, עם וריאציות הפתעה.', 'No new material. Today the training wheels come off — everything at full speed, with surprise variants.'),
        T('האוזניים שלך עומדות לבד עכשיו. וזה בדיוק מה שנוכיח.', 'Your ears stand alone now. And that’s exactly what we’ll prove.'),
      ], cta: T('לסמוך על האוזניים', 'Trust your ears') },
    { kind: 'dialogue', dialogueId: 'ns-transit' },
    { kind: 'receipt', text: T('שרדת תחבורה מהירה עם שינוי רציף פתאומי — בלי להיתקע.', 'You survived fast transit with a sudden platform change — without getting stuck.') },
    { kind: 'ambush', npc: { en: 'Cette machine, c’est en espèces seulement au fait — vous avez de la monnaie sur vous ?', tr: TR("That machine's cash only by the way — you got coins on you?", 'המכונה הזאת מקבלת רק מזומן, דרך אגב — יש עליך מטבעות?'), he: 'המכונה הזאת מקבלת רק מזומן, דרך אגב — יש עליך מטבעות?' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.phrase.trans.does-stop' },
    { kind: 'dialogue', dialogueId: 'ns-diner' },
    { kind: 'receipt', text: T('שרדת הזמנה מהירה לפני סגירת מטבח — בלי כתוביות איטיות.', 'You survived a fast order before the kitchen closed — no slow subtitles.') },
    { kind: 'ambush', npc: { en: 'En fait, on n’a plus de pâtes ce soir — le risotto à la place, peut-être ?', tr: TR("We're actually all out of pasta tonight — the risotto instead maybe?", 'בעצם נגמרה לנו הפסטה הערב — אולי ריזוטו במקום?'), he: 'בעצם נגמרה לנו הפסטה הערב — אולי ריזוטו במקום?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.rest.table-for-two' },
    { kind: 'dialogue', dialogueId: 'ns-local' },
    { kind: 'receipt', text: T('שיחה מהירה עם מקומי — הבנת, הגבת, וקיבלת המלצה. האוזניים ניצחו.', 'A fast chat with a local — you understood, responded, and got a recommendation. Your ears won.') },
    { kind: 'summary' },
  ],
};
