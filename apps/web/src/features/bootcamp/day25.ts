import { T, recovery } from './recovery.js';
import { m26Flow } from './practiceMastery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 26 — "Pharmacy & Health" (Phase 5 · Mastery).
 * Rare need, high stakes — trained near the end so it stays fresh for the trip. Describe a
 * symptom, state an allergy, understand the dosage. Even sick, in any language, you manage.
 */
export const DAY25_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.pharm.headache', text: 'I have a headache.', meaning: T('יש לי כאב ראש.', 'I have a headache.'),
    tip: T('התבנית: I have a ___ — מתארת כל תסמין. headache / cough / fever.', 'Template: I have a ___ — describes any symptom. headache / cough / fever.') },
  { id: 'en.phrase.pharm.something-for', text: 'Do you have something for a cold?', meaning: T('יש לכם משהו לצינון?', 'Do you have something for a cold?'),
    tip: T('התבנית: something for ___ — מבקשת תרופה בלי לדעת את השם שלה.', 'Template: something for ___ — asks for medicine without knowing its name.') },
  { id: 'en.phrase.pharm.how-often', text: 'How often do I take it?', meaning: T('כל כמה זמן לוקחים?', 'How often do I take it?'),
    tip: T('השאלה שאסור לוותר עליה עם תרופה. תמיד מוודאים מינון.', 'The one question you never skip with medicine. Always confirm the dosage.') },
  { id: 'en.phrase.pharm.allergic-penicillin', text: "I'm allergic to penicillin.", meaning: T('אני אלרגי לפניצילין.', "I'm allergic to penicillin.") },
  { id: 'en.phrase.pharm.stomach-ache', text: 'I have a stomach ache.', meaning: T('יש לי כאב בטן.', 'I have a stomach ache.') },
  { id: 'en.phrase.pharm.hurts-here', text: 'It hurts here.', meaning: T('כואב לי כאן.', 'It hurts here.'),
    tip: T('מצביעים על המקום ואומרים את זה. לא צריך לדעת איך קוראים לו.', 'Point at the spot and say it. You do not need its name.') },
  // hear — the pharmacist's replies
  { id: 'en.reply.pharm.whats-matter', text: "What's the matter?", meaning: T('מה קרה?', "What's the matter?") },
  { id: 'en.reply.pharm.take-twice', text: 'Take this twice a day.', meaning: T('קח את זה פעמיים ביום.', 'Take this twice a day.') },
  { id: 'en.reply.pharm.after-meals', text: 'After meals.', meaning: T('אחרי הארוחות.', 'After meals.') },
  { id: 'en.reply.pharm.any-allergies', text: 'Any allergies?', meaning: T('יש אלרגיות?', 'Any allergies?') },
  { id: 'en.reply.pharm.see-doctor', text: 'You should see a doctor.', meaning: T('כדאי לך לראות רופא.', 'You should see a doctor.') },
  { id: 'en.reply.pharm.feel-better', text: 'Feel better soon!', meaning: T('תרגיש טוב יותר!', 'Feel better soon!') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_PHARMACY: BootcampDialogue = {
  id: 'pharmacy',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "Hello! What's the matter?", he: 'שלום! מה קרה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'I have a headache.', he: 'יש לי כאב ראש.', itemId: 'en.phrase.pharm.headache', correct: true, next: 'n2' },
      { en: 'It hurts here.', he: 'כואב לי כאן.', itemId: 'en.phrase.pharm.hurts-here', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: "What's — the — matter?", he: 'מה — קרה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'I have a headache.', he: 'יש לי כאב ראש.', itemId: 'en.phrase.pharm.headache', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'I see. Before I give you anything — any allergies?', he: 'הבנתי. לפני שאתן לך משהו — יש אלרגיות?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'm allergic to penicillin.", he: 'אני אלרגי לפניצילין.', itemId: 'en.phrase.pharm.allergic-penicillin', correct: true, next: 'n3' },
      { en: 'I have a stomach ache.', he: 'יש לי כאב בטן. (חשוב — אבל הוא שאל על אלרגיות)', itemId: 'en.phrase.pharm.stomach-ache', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: "I'll note that — but first, any allergies to medicine?", he: 'ארשום את זה — אבל קודם, יש אלרגיה לתרופות?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: "I'm allergic to penicillin.", he: 'אני אלרגי לפניצילין.', itemId: 'en.phrase.pharm.allergic-penicillin', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Good to know. This may help.', he: 'טוב לדעת. זה יכול לעזור.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'How often do I take it?', he: 'כל כמה זמן לוקחים?', itemId: 'en.phrase.pharm.how-often', correct: true, next: 'n3b' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b2', en: 'Take it — twice — a day.', he: 'קח — פעמיים — ביום.' },
    { id: 'c3b2', who: 'you', en: '', he: '', choices: [
      { en: 'How often do I take it?', he: 'כל כמה זמן לוקחים?', itemId: 'en.phrase.pharm.how-often', correct: true, next: 'n3b' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: 'Twice a day, after meals. Please follow the instructions on the label.', he: 'פעמיים ביום, אחרי הארוחות. תפעל לפי ההוראות בעלון.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Is there anything else you need?', he: 'עוד משהו שאתה צריך?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Do you have something for a cold?', he: 'יש לכם משהו לצינון?', itemId: 'en.phrase.pharm.something-for', correct: true, next: 'n5' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Here you go. Feel better soon!', he: 'הנה לך. תרגיש טוב יותר!' },
  ],
};

export const DAY25: BootcampDayContent = {
  day: 25,
  title: T('בית מרקחת ובריאות', 'Pharmacy & Health'),
  items: DAY25_ITEMS,
  dialogues: { pharmacy: SCENE_PHARMACY },
  steps: [
    { kind: 'talk', icon: '💊', title: T('משימה 26: בית מרקחת ובריאות', 'Mission 26: Pharmacy & Health'),
      body: [
        T('יש מילים שתקווה לא להזדקק להן — אבל אם כן, הן חשובות מאוד.', 'Some words you hope never to need — but if you do, they matter a great deal.'),
        T('לתאר תסמין, להצהיר על אלרגיה, להבין מינון. גם חולה, אתה מסתדר בכל שפה.', 'Describe a symptom, state an allergy, understand the dosage. Even sick, you manage in any language.'),
      ], cta: T('להיכנס לבית המרקחת', 'Walk into the pharmacy') },
    ...m26Flow('en'),
  ],
};
