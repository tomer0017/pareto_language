import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 26 — "Pharmacie et santé" (Pharmacy & Health). French parallel of English day 26:
 * describe a symptom, state an allergy, understand the dosage — even sick, you manage. `tr:{en,he}`
 * glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY26_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.pharm.headache', text: 'J’ai mal à la tête.', meaning: T('יש לי כאב ראש.', 'I have a headache.'),
    tip: T('התבנית: J’ai mal à ___ — מתארת כל כאב. à la tête / au ventre / à la gorge.', 'Template: J’ai mal à ___ — describes any ache. head / stomach / throat.') },
  { id: 'fr.phrase.pharm.something-for', text: 'Vous avez quelque chose pour un rhume ?', meaning: T('יש לכם משהו לצינון?', 'Do you have something for a cold?'),
    tip: T('התבנית: quelque chose pour ___ — מבקשת תרופה בלי לדעת את השם שלה.', 'Template: quelque chose pour ___ — asks for medicine without knowing its name.') },
  { id: 'fr.phrase.pharm.how-often', text: 'Je le prends tous les combien ?', meaning: T('כל כמה זמן לוקחים?', 'How often do I take it?'),
    tip: T('השאלה שאסור לוותר עליה עם תרופה. תמיד מוודאים מינון.', 'The one question you never skip with medicine. Always confirm the dosage.') },
  { id: 'fr.phrase.pharm.allergic-penicillin', text: 'Je suis allergique à la pénicilline.', meaning: T('אני אלרגי לפניצילין.', "I'm allergic to penicillin.") },
  { id: 'fr.phrase.pharm.stomach-ache', text: 'J’ai mal au ventre.', meaning: T('יש לי כאב בטן.', 'I have a stomach ache.') },
  // hear — the pharmacist's replies
  { id: 'fr.reply.pharm.whats-matter', text: 'Qu’est-ce qui ne va pas ?', meaning: T('מה קרה?', "What's the matter?") },
  { id: 'fr.reply.pharm.take-twice', text: 'Prenez-en deux fois par jour.', meaning: T('קח את זה פעמיים ביום.', 'Take this twice a day.') },
  { id: 'fr.reply.pharm.after-meals', text: 'Après les repas.', meaning: T('אחרי הארוחות.', 'After meals.') },
  { id: 'fr.reply.pharm.any-allergies', text: 'Des allergies ?', meaning: T('יש אלרגיות?', 'Any allergies?') },
  { id: 'fr.reply.pharm.see-doctor', text: 'Vous devriez voir un médecin.', meaning: T('כדאי לך לראות רופא.', 'You should see a doctor.') },
  { id: 'fr.reply.pharm.feel-better', text: 'Bon rétablissement !', meaning: T('תרגיש טוב יותר!', 'Feel better soon!') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE_PHARMACY: BootcampDialogue = {
  id: 'pharmacy',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Qu’est-ce qui ne va pas ?', tr: TR("Hello! What's the matter?", 'שלום! מה קרה?'), he: 'שלום! מה קרה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai mal à la tête.', tr: TR('I have a headache.', 'יש לי כאב ראש.'), he: 'יש לי כאב ראש.', itemId: 'fr.phrase.pharm.headache', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Qu’est-ce — qui — ne va pas ?', tr: TR("What's — the — matter?", 'מה — קרה?'), he: 'מה — קרה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai mal à la tête.', tr: TR('I have a headache.', 'יש לי כאב ראש.'), he: 'יש לי כאב ראש.', itemId: 'fr.phrase.pharm.headache', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Je vois. Avant de vous donner quelque chose — des allergies ?', tr: TR('I see. Before I give you anything — any allergies?', 'הבנתי. לפני שאתן לך משהו — יש אלרגיות?'), he: 'הבנתי. לפני שאתן לך משהו — יש אלרגיות?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis allergique à la pénicilline.', tr: TR("I'm allergic to penicillin.", 'אני אלרגי לפניצילין.'), he: 'אני אלרגי לפניצילין.', itemId: 'fr.phrase.pharm.allergic-penicillin', correct: true, next: 'n3' },
      { en: 'J’ai mal au ventre.', tr: TR('I have a stomach ache.', 'יש לי כאב בטן. (חשוב — אבל הוא שאל על אלרגיות)'), he: 'יש לי כאב בטן.', itemId: 'fr.phrase.pharm.stomach-ache', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Je le note — mais d’abord, une allergie aux médicaments ?', tr: TR("I'll note that — but first, any allergies to medicine?", 'ארשום את זה — אבל קודם, יש אלרגיה לתרופות?'), he: 'ארשום את זה — אבל קודם, יש אלרגיה לתרופות?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis allergique à la pénicilline.', tr: TR("I'm allergic to penicillin.", 'אני אלרגי לפניצילין.'), he: 'אני אלרגי לפניצילין.', itemId: 'fr.phrase.pharm.allergic-penicillin', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Bon à savoir. Celui-ci est sans danger pour vous — prenez-le deux fois par jour.', tr: TR('Good to know. This one is safe for you — take it twice a day.', 'טוב לדעת. זה בטוח בשבילך — קח פעמיים ביום.'), he: 'טוב לדעת. זה בטוח בשבילך — קח פעמיים ביום.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Je le prends tous les combien ?', tr: TR('How often do I take it?', 'כל כמה זמן לוקחים?'), he: 'כל כמה זמן לוקחים?', itemId: 'fr.phrase.pharm.how-often', correct: true, next: 'n3b' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b2', en: 'Prenez-le — deux fois — par jour.', tr: TR('Take it — twice — a day.', 'קח — פעמיים — ביום.'), he: 'קח — פעמיים — ביום.' },
    { id: 'c3b2', who: 'you', en: '', he: '', choices: [
      { en: 'Je le prends tous les combien ?', tr: TR('How often do I take it?', 'כל כמה זמן לוקחים?'), he: 'כל כמה זמן לוקחים?', itemId: 'fr.phrase.pharm.how-often', correct: true, next: 'n3b' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: 'Deux fois par jour, après les repas.', tr: TR('Twice a day, after meals.', 'פעמיים ביום, אחרי הארוחות.'), he: 'פעמיים ביום, אחרי הארוחות.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Vous avez besoin d’autre chose ?', tr: TR('Is there anything else you need?', 'עוד משהו שאתה צריך?'), he: 'עוד משהו שאתה צריך?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Vous avez quelque chose pour un rhume ?', tr: TR('Do you have something for a cold?', 'יש לכם משהו לצינון?'), he: 'יש לכם משהו לצינון?', itemId: 'fr.phrase.pharm.something-for', correct: true, next: 'n5' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Tenez. Bon rétablissement !', tr: TR('Here you go. Feel better soon!', 'הנה לך. תרגיש טוב יותר!'), he: 'הנה לך. תרגיש טוב יותר!' },
  ],
};

export const DAY26_FR: BootcampDayContent = {
  day: 26,
  title: T('בית מרקחת ובריאות', 'Pharmacy & Health'),
  items: DAY26_FR_ITEMS,
  dialogues: { pharmacy: SCENE_PHARMACY },
  steps: [
    { kind: 'talk', icon: '💊', title: T('משימה 26: בית מרקחת ובריאות', 'Mission 26: Pharmacy & Health'),
      body: [
        T('יש מילים שתקווה לא להזדקק להן — אבל אם כן, הן חשובות מאוד.', 'Some words you hope never to need — but if you do, they matter a great deal.'),
        T('לתאר תסמין, להצהיר על אלרגיה, להבין מינון. גם חולה, אתה מסתדר בכל שפה.', 'Describe a symptom, state an allergy, understand the dosage. Even sick, you manage in any language.'),
      ], cta: T('להיכנס לבית המרקחת', 'Walk into the pharmacy') },
    { kind: 'tool', itemId: 'fr.phrase.pharm.headache', index: 1, total: 4, label: T('לתאר תסמין', 'Describe a symptom') },
    { kind: 'tool', itemId: 'fr.phrase.pharm.something-for', index: 2, total: 4, label: T('לבקש תרופה', 'Ask for a remedy') },
    { kind: 'tool', itemId: 'fr.phrase.pharm.allergic-penicillin', index: 3, total: 4, label: T('להצהיר על אלרגיה', 'State an allergy') },
    { kind: 'tool', itemId: 'fr.phrase.pharm.how-often', index: 4, total: 4, label: T('לוודא מינון', 'Confirm the dosage') },
    { kind: 'replies', saidItemId: 'fr.phrase.pharm.headache',
      replyIds: ['fr.reply.pharm.whats-matter', 'fr.reply.pharm.any-allergies', 'fr.reply.pharm.take-twice', 'fr.reply.pharm.after-meals'] },
    { kind: 'receipt', text: T('אתה מזהה את שאלות הרוקח — תסמין, אלרגיות, והוראות מינון.', 'You recognize the pharmacist’s questions — symptom, allergies, and dosage instructions.') },
    { kind: 'quiz', itemId: 'fr.reply.pharm.take-twice', wrongIds: ['fr.reply.pharm.after-meals', 'fr.reply.pharm.see-doctor'] },
    { kind: 'quiz', itemId: 'fr.reply.pharm.any-allergies', wrongIds: ['fr.reply.pharm.whats-matter', 'fr.reply.pharm.feel-better'] },
    { kind: 'dialogue', dialogueId: 'pharmacy' },
    { kind: 'receipt', text: T('תיארת תסמין, הצהרת על אלרגיה, ווידאת מינון — טיפול בטוח בכל שפה.', 'You described a symptom, stated an allergy, and confirmed the dosage — safe care in any language.') },
    { kind: 'swipe', itemIds: DAY26_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Et si ça ne s’améliore pas dans trois jours, il faudra vraiment voir un médecin, d’accord ?', tr: TR("And if it doesn't improve in three days you'll really need to see a doctor okay?", 'ואם זה לא משתפר תוך שלושה ימים, תצטרך באמת לראות רופא, בסדר?'), he: 'ואם זה לא משתפר תוך שלושה ימים, תצטרך באמת לראות רופא, בסדר?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.pharm.headache' },
    { kind: 'receipt', text: T('הוראת המשך רפואית מהירה — וביקשת שיאט. עם בריאות לא מנחשים.', 'A fast medical follow-up instruction — and you asked them to slow down. With health, you never guess.') },
    { kind: 'summary' },
  ],
};
