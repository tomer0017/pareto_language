import type { LocalizedText } from '@ready/content-schema';
import { m26Flow } from '../practiceMastery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 26 — "Farmacia y salud" (Pharmacy & Health). Spanish parallel of English mission 25:
 * describe a symptom, state an allergy, understand the dosage — even sick, you manage. `tr:{en,he}`
 * glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY25_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.pharm.headache', text: 'Me duele la cabeza.', meaning: T('יש לי כאב ראש.', 'I have a headache.'),
    tip: T('התבנית: Me duele ___ — מתארת כל כאב. la cabeza / el estómago / la garganta.', 'Template: Me duele ___ — describes any ache. head / stomach / throat.') },
  { id: 'es.phrase.pharm.something-for', text: '¿Tienen algo para el resfriado?', meaning: T('יש לכם משהו לצינון?', 'Do you have something for a cold?'),
    tip: T('התבנית: algo para ___ — מבקשת תרופה בלי לדעת את השם שלה.', 'Template: algo para ___ — asks for medicine without knowing its name.') },
  { id: 'es.phrase.pharm.how-often', text: '¿Cada cuánto lo tomo?', meaning: T('כל כמה זמן לוקחים?', 'How often do I take it?'),
    tip: T('השאלה שאסור לוותר עליה עם תרופה. תמיד מוודאים מינון.', 'The one question you never skip with medicine. Always confirm the dosage.') },
  { id: 'es.phrase.pharm.allergic-penicillin', text: 'Soy alérgico a la penicilina.', meaning: T('אני אלרגי לפניצילין.', "I'm allergic to penicillin.") },
  { id: 'es.phrase.pharm.stomach-ache', text: 'Me duele el estómago.', meaning: T('יש לי כאב בטן.', 'I have a stomach ache.') },
  { id: 'es.phrase.pharm.hurts-here', text: 'Me duele aquí.', meaning: T('כואב לי כאן.', 'It hurts here.'),
    tip: T('מצביעים על המקום ואומרים את זה. לא צריך לדעת איך קוראים לו.', 'Point at the spot and say it. You do not need its name.') },
  // hear — the pharmacist's replies
  { id: 'es.reply.pharm.whats-matter', text: '¿Qué le pasa?', meaning: T('מה קרה?', "What's the matter?") },
  { id: 'es.reply.pharm.take-twice', text: 'Tómelo dos veces al día.', meaning: T('קח את זה פעמיים ביום.', 'Take this twice a day.') },
  { id: 'es.reply.pharm.after-meals', text: 'Después de las comidas.', meaning: T('אחרי הארוחות.', 'After meals.') },
  { id: 'es.reply.pharm.any-allergies', text: '¿Alguna alergia?', meaning: T('יש אלרגיות?', 'Any allergies?') },
  { id: 'es.reply.pharm.see-doctor', text: 'Debería ver a un médico.', meaning: T('כדאי לך לראות רופא.', 'You should see a doctor.') },
  { id: 'es.reply.pharm.feel-better', text: '¡Que se mejore!', meaning: T('תרגיש טוב יותר!', 'Feel better soon!') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_PHARMACY: BootcampDialogue = {
  id: 'pharmacy',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿Qué le pasa?', tr: TR("Hello! What's the matter?", 'שלום! מה קרה?'), he: 'שלום! מה קרה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Me duele la cabeza.', tr: TR('I have a headache.', 'יש לי כאב ראש.'), he: 'יש לי כאב ראש.', itemId: 'es.phrase.pharm.headache', correct: true, next: 'n2' },
      { en: 'Me duele aquí.', tr: TR('It hurts here.', 'כואב לי כאן.'), he: 'כואב לי כאן.', itemId: 'es.phrase.pharm.hurts-here', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: '¿Qué — le — pasa?', tr: TR("What's — the — matter?", 'מה — קרה?'), he: 'מה — קרה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Me duele la cabeza.', tr: TR('I have a headache.', 'יש לי כאב ראש.'), he: 'יש לי כאב ראש.', itemId: 'es.phrase.pharm.headache', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Entiendo. Antes de darle algo — ¿alguna alergia?', tr: TR('I see. Before I give you anything — any allergies?', 'הבנתי. לפני שאתן לך משהו — יש אלרגיות?'), he: 'הבנתי. לפני שאתן לך משהו — יש אלרגיות?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Soy alérgico a la penicilina.', tr: TR("I'm allergic to penicillin.", 'אני אלרגי לפניצילין.'), he: 'אני אלרגי לפניצילין.', itemId: 'es.phrase.pharm.allergic-penicillin', correct: true, next: 'n3' },
      { en: 'Me duele el estómago.', tr: TR('I have a stomach ache.', 'יש לי כאב בטן. (חשוב — אבל הוא שאל על אלרגיות)'), he: 'יש לי כאב בטן.', itemId: 'es.phrase.pharm.stomach-ache', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Lo anoto — pero primero, ¿alguna alergia a medicamentos?', tr: TR("I'll note that — but first, any allergies to medicine?", 'ארשום את זה — אבל קודם, יש אלרגיה לתרופות?'), he: 'ארשום את זה — אבל קודם, יש אלרגיה לתרופות?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Soy alérgico a la penicilina.', tr: TR("I'm allergic to penicillin.", 'אני אלרגי לפניצילין.'), he: 'אני אלרגי לפניצילין.', itemId: 'es.phrase.pharm.allergic-penicillin', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Gracias por decírmelo. Esto puede ayudarle.', tr: TR('Good to know. This may help.', 'טוב לדעת. זה יכול לעזור.'), he: 'טוב לדעת. זה יכול לעזור.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Cada cuánto lo tomo?', tr: TR('How often do I take it?', 'כל כמה זמן לוקחים?'), he: 'כל כמה זמן לוקחים?', itemId: 'es.phrase.pharm.how-often', correct: true, next: 'n3b' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b2', en: 'Tómelo — dos veces — al día.', tr: TR('Take it — twice — a day.', 'קח — פעמיים — ביום.'), he: 'קח — פעמיים — ביום.' },
    { id: 'c3b2', who: 'you', en: '', he: '', choices: [
      { en: '¿Cada cuánto lo tomo?', tr: TR('How often do I take it?', 'כל כמה זמן לוקחים?'), he: 'כל כמה זמן לוקחים?', itemId: 'es.phrase.pharm.how-often', correct: true, next: 'n3b' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: 'Dos veces al día, después de las comidas. Siga las instrucciones del prospecto.', tr: TR('Twice a day, after meals. Please follow the instructions on the label.', 'פעמיים ביום, אחרי הארוחות. תפעל לפי ההוראות בעלון.'), he: 'פעמיים ביום, אחרי הארוחות. תפעל לפי ההוראות בעלון.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: '¿Necesita algo más?', tr: TR('Is there anything else you need?', 'עוד משהו שאתה צריך?'), he: 'עוד משהו שאתה צריך?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: '¿Tienen algo para el resfriado?', tr: TR('Do you have something for a cold?', 'יש לכם משהו לצינון?'), he: 'יש לכם משהו לצינון?', itemId: 'es.phrase.pharm.something-for', correct: true, next: 'n5' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Tenga. ¡Que se mejore!', tr: TR('Here you go. Feel better soon!', 'הנה לך. תרגיש טוב יותר!'), he: 'הנה לך. תרגיש טוב יותר!' },
  ],
};

export const DAY25_ES: BootcampDayContent = {
  day: 25,
  title: T('בית מרקחת ובריאות', 'Pharmacy & Health'),
  items: DAY25_ES_ITEMS,
  dialogues: { pharmacy: SCENE_PHARMACY },
  steps: [
    { kind: 'talk', icon: '💊', title: T('משימה 26: בית מרקחת ובריאות', 'Mission 26: Pharmacy & Health'),
      body: [
        T('יש מילים שתקווה לא להזדקק להן — אבל אם כן, הן חשובות מאוד.', 'Some words you hope never to need — but if you do, they matter a great deal.'),
        T('לתאר תסמין, להצהיר על אלרגיה, להבין מינון. גם חולה, אתה מסתדר בכל שפה.', 'Describe a symptom, state an allergy, understand the dosage. Even sick, you manage in any language.'),
      ], cta: T('להיכנס לבית המרקחת', 'Walk into the pharmacy') },
    ...m26Flow('es'),
  ],
};
