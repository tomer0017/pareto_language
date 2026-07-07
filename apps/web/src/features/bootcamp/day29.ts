import { T, recovery } from './recovery.js';
import { DAY7_ITEMS } from './day7.js';
import { DAY13_ITEMS } from './day13.js';
import { DAY15_ITEMS } from './day15.js';
import { DAY25_ITEMS } from './day25.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 29 — "Dress Rehearsal: Full Evening" (Phase 5, cold integration, no new content).
 * Taxi → restaurant → problem → payment, one take, with one designed surprise. The athlete's
 * rehearsal before race day: chained moments that finally feel like a single flow. Reuses 7, 13, 15 & 25.
 */
const byId = new Map([...DAY7_ITEMS, ...DAY13_ITEMS, ...DAY15_ITEMS, ...DAY25_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY29_ITEMS: BootcampItem[] = [
  ...pick(
    'en.phrase.taxi.to-address', 'en.phrase.taxi.stop-here',
    'en.phrase.rest.table-for-two', 'en.phrase.rest.ill-have', 'en.phrase.rest.bill-please',
    'en.phrase.fix.not-ordered', 'en.phrase.fix.charged-twice',
    'en.phrase.pay.by-card',
  ),
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const COLD_TAXI: BootcampDialogue = {
  id: 'dr-taxi',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Evening! Where to?', he: 'ערב! לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'To this address, please.', he: 'לכתובת הזאת, בבקשה.', itemId: 'en.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'About fifteen with the traffic. Here okay?', he: 'בערך חמש-עשרה עם הפקקים. כאן בסדר?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Stop here, please.', he: 'עצור כאן, בבקשה.', itemId: 'en.phrase.taxi.stop-here', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Here you are — have a good night!', he: 'הגענו — לילה טוב!' },
  ],
};

const COLD_ORDER: BootcampDialogue = {
  id: 'dr-order',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Welcome! How many people?', he: 'ברוך הבא! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'A table for two, please.', he: 'שולחן לשניים, בבקשה.', itemId: 'en.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Right this way. Ready to order?', he: 'בבקשה אחריי. מוכן להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'll have the pasta, please.", he: 'אני אקח את הפסטה, בבקשה.', itemId: 'en.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Excellent — coming right up!', he: 'מצוין — תכף מגיע!' },
  ],
};

const COLD_PROBLEM: BootcampDialogue = {
  id: 'dr-problem',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "Here's your meal — one steak!", he: 'הנה הארוחה — סטייק אחד!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "This isn't what I ordered.", he: 'זה לא מה שהזמנתי.', itemId: 'en.phrase.fix.not-ordered', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: "Oh no — so sorry! I'll bring the right one right away.", he: 'אוי לא — מצטער מאוד! אביא את הנכון מיד.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'The right dish, and it\'s on the house. Enjoy!', he: 'המנה הנכונה, ועל חשבון הבית. בתיאבון!' },
  ],
};

const COLD_PAY: BootcampDialogue = {
  id: 'dr-pay',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'All done? Anything else for you tonight?', he: 'סיימנו? עוד משהו הערב?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Could we have the bill, please?', he: 'אפשר את החשבון, בבקשה?', itemId: 'en.phrase.rest.bill-please', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: "Here you go — that's thirty. Cash or card?", he: 'בבקשה — זה שלושים. מזומן או כרטיס?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'll pay by card.", he: 'אני אשלם בכרטיס.', itemId: 'en.phrase.pay.by-card', correct: true, next: 'n3' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Perfect — have a lovely evening!', he: 'מושלם — ערב נפלא!' },
  ],
};

export const DAY29: BootcampDayContent = {
  day: 29,
  title: T('חזרה גנרלית: ערב שלם', 'Dress Rehearsal: Full Evening'),
  items: DAY29_ITEMS,
  dialogues: { 'dr-taxi': COLD_TAXI, 'dr-order': COLD_ORDER, 'dr-problem': COLD_PROBLEM, 'dr-pay': COLD_PAY },
  steps: [
    { kind: 'talk', icon: '🎬', title: T('משימה 29: חזרה גנרלית — ערב שלם', 'Mission 29: Dress Rehearsal — Full Evening'),
      body: [
        T('אין חומר חדש. ערב שלם בטייק אחד: מונית, מסעדה, תקלה, תשלום.', 'No new material. A full evening in one take: taxi, restaurant, a problem, payment.'),
        T('זו החזרה של הספורטאי לפני יום התחרות — עם הפתעה מתוכננת אחת. בוא נזרום.', 'This is the athlete’s rehearsal before race day — with one designed surprise. Let’s flow.'),
      ], cta: T('אקשן — מתחילים', 'Action — begin') },
    { kind: 'dialogue', dialogueId: 'dr-taxi' },
    { kind: 'receipt', text: T('מונית בקור — יעד, מחיר, עצירה. הערב יצא לדרך.', 'A cold taxi — destination, price, stop. The evening is underway.') },
    { kind: 'dialogue', dialogueId: 'dr-order' },
    { kind: 'receipt', text: T('שולחן והזמנה — חלק, בלי הכנה.', 'Table and order — smooth, no prep.') },
    { kind: 'dialogue', dialogueId: 'dr-problem' },
    { kind: 'receipt', text: T('ההפתעה: מנה שגויה — ותיקנת אותה ברוגע.', 'The surprise: a wrong dish — and you fixed it calmly.') },
    { kind: 'ambush', npc: { en: 'While we fix that can I bring you a drink on the house to make up for it?', he: 'בזמן שאנחנו מתקנים — שאביא לך משקה על חשבון הבית כפיצוי?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.fix.charged-twice' },
    { kind: 'dialogue', dialogueId: 'dr-pay' },
    { kind: 'receipt', text: T('ערב שלם בטייק אחד — מונית, ארוחה, תקלה, תשלום. זרימה אחת. כמעט כיף.', 'A full evening in one take — taxi, meal, problem, payment. One flow. Almost fun.') },
    { kind: 'summary' },
  ],
};
