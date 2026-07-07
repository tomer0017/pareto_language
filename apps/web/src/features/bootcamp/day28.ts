import { T, recovery } from './recovery.js';
import { DAY13_ITEMS } from './day13.js';
import { DAY19_ITEMS } from './day19.js';
import { DAY23_ITEMS } from './day23.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 28 — "No Subtitles" (Phase 5, cold integration, no new content).
 * The training wheels come off: every scene at full speed with surprise variants. Your ears
 * stand alone now — and trusting them is itself a receipt. Reuses items from missions 13, 19 & 23.
 */
const byId = new Map([...DAY13_ITEMS, ...DAY19_ITEMS, ...DAY23_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY28_ITEMS: BootcampItem[] = [
  ...pick(
    'en.phrase.trans.one-ticket', 'en.phrase.trans.does-stop',
    'en.phrase.rest.table-for-two', 'en.phrase.rest.ill-have',
    'en.phrase.talk.beautiful-place', 'en.phrase.talk.recommend-place',
  ),
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const COLD_TRANSIT: BootcampDialogue = {
  id: 'ns-transit',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Right — where to?', he: 'טוב — לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'One ticket to the center, please.', he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'en.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: "Platform's changed — it's four now, quick!", he: 'הרציף השתנה — עכשיו ארבע, מהר!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Does this stop at the museum?', he: 'זה עוצר במוזיאון?', itemId: 'en.phrase.trans.does-stop', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Three stops — go, go!', he: 'שלוש תחנות — קדימה, קדימה!' },
  ],
};

const COLD_DINER: BootcampDialogue = {
  id: 'ns-diner',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Evening — table for how many?', he: 'ערב — שולחן לכמה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'A table for two, please.', he: 'שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: "Kitchen's about to close — ready to order?", he: 'המטבח עומד להיסגר — מוכן להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'll have the pasta, please.", he: 'אני אקח את הפסטה, בבקשה.', itemId: 'en.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Good call — last one in! Coming up.', he: 'בחירה טובה — האחרון שנכנס! תכף מגיע.' },
  ],
};

const COLD_LOCAL: BootcampDialogue = {
  id: 'ns-local',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Gorgeous spot, right? First time here?', he: 'מקום מהמם, נכון? פעם ראשונה כאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'This place is beautiful.', he: 'המקום הזה יפהפה.', itemId: 'en.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: "You've gotta see the old town — got a second?", he: 'אתה חייב לראות את העיר העתיקה — יש לך רגע?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Can you recommend a place?', he: 'אתה יכול להמליץ על מקום?', itemId: 'en.phrase.talk.recommend-place', correct: true, next: 'n3' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: "Mama Rosa's — go now, tell 'em I sent you!", he: "'מאמא רוזה' — לך עכשיו, תגיד שאני שלחתי!" },
  ],
};

export const DAY28: BootcampDayContent = {
  day: 28,
  title: T('בלי כתוביות', 'No Subtitles'),
  items: DAY28_ITEMS,
  dialogues: { 'ns-transit': COLD_TRANSIT, 'ns-diner': COLD_DINER, 'ns-local': COLD_LOCAL },
  steps: [
    { kind: 'talk', icon: '👂', title: T('משימה 28: בלי כתוביות', 'Mission 28: No Subtitles'),
      body: [
        T('אין חומר חדש. היום מורידים את גלגלי העזר — הכל במהירות מלאה, עם וריאציות הפתעה.', 'No new material. Today the training wheels come off — everything at full speed, with surprise variants.'),
        T('האוזניים שלך עומדות לבד עכשיו. וזה בדיוק מה שנוכיח.', 'Your ears stand alone now. And that’s exactly what we’ll prove.'),
      ], cta: T('לסמוך על האוזניים', 'Trust your ears') },
    { kind: 'dialogue', dialogueId: 'ns-transit' },
    { kind: 'receipt', text: T('שרדת תחבורה מהירה עם שינוי רציף פתאומי — בלי להיתקע.', 'You survived fast transit with a sudden platform change — without getting stuck.') },
    { kind: 'ambush', npc: { en: "That machine's cash only by the way — you got coins on you?", he: 'המכונה הזאת מקבלת רק מזומן, דרך אגב — יש עליך מטבעות?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.trans.does-stop' },
    { kind: 'dialogue', dialogueId: 'ns-diner' },
    { kind: 'receipt', text: T('שרדת הזמנה מהירה לפני סגירת מטבח — בלי כתוביות איטיות.', 'You survived a fast order before the kitchen closed — no slow subtitles.') },
    { kind: 'ambush', npc: { en: "We're actually all out of pasta tonight — the risotto instead maybe?", he: 'בעצם נגמרה לנו הפסטה הערב — אולי ריזוטו במקום?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.rest.table-for-two' },
    { kind: 'dialogue', dialogueId: 'ns-local' },
    { kind: 'receipt', text: T('שיחה מהירה עם מקומי — הבנת, הגבת, וקיבלת המלצה. האוזניים ניצחו.', 'A fast chat with a local — you understood, responded, and got a recommendation. Your ears won.') },
    { kind: 'summary' },
  ],
};
