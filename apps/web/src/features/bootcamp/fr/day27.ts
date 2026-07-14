import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 27 — "Urgence" (Emergency). French parallel of English day 27, overlearned for
 * stress: help, doctor, police, a lost passport, the hospital. The worst case has a script.
 * `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY27_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.emerg.need-help', text: 'J’ai besoin d’aide.', meaning: T('אני צריך עזרה.', 'I need help.'),
    tip: T('שלוש מילים שמזמנות עזרה בכל מקום בעולם. תגיד בקול.', 'Words that summon help anywhere on earth. Say them loud.') },
  { id: 'fr.phrase.emerg.call-doctor', text: 'Appelez un médecin, s’il vous plaît.', meaning: T('תקראו לרופא, בבקשה.', 'Please call a doctor.') },
  { id: 'fr.phrase.emerg.lost-passport', text: 'J’ai perdu mon passeport.', meaning: T('איבדתי את הדרכון.', 'I lost my passport.'),
    tip: T('התבנית: J’ai perdu mon/ma ___ — לדווח על כל אבידה. passeport / sac / téléphone.', 'Template: J’ai perdu mon/ma ___ — report any lost item. passport / bag / phone.') },
  { id: 'fr.phrase.emerg.call-police', text: 'Appelez la police !', meaning: T('תקראו למשטרה!', 'Call the police!') },
  { id: 'fr.phrase.emerg.where-hospital', text: 'Où est l’hôpital ?', meaning: T('איפה בית החולים?', 'Where is the hospital?') },
  // hear — responders
  { id: 'fr.reply.emerg.whats-wrong', text: 'Qu’est-ce qui se passe ?', meaning: T('מה קרה?', "What's wrong?") },
  { id: 'fr.reply.emerg.stay-calm', text: 'Restez calme, les secours arrivent.', meaning: T('תישאר רגוע, עזרה בדרך.', 'Stay calm, help is coming.') },
  { id: 'fr.reply.emerg.where-you', text: 'Où êtes-vous ?', meaning: T('איפה אתה?', 'Where are you?') },
  { id: 'fr.reply.emerg.are-you-hurt', text: 'Vous êtes blessé ?', meaning: T('אתה פצוע?', 'Are you hurt?') },
  { id: 'fr.reply.emerg.on-the-way', text: 'Une ambulance arrive.', meaning: T('אמבולנס בדרך.', 'An ambulance is on the way.') },
  { id: 'fr.reply.emerg.report-here', text: 'Vous pouvez le signaler ici.', meaning: T('אפשר לדווח כאן.', 'You can report it here.') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE_EMERGENCY: BootcampDialogue = {
  id: 'emergency',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Services d’urgence — qu’est-ce qui se passe ?', tr: TR("Emergency services — what's wrong?", 'שירותי חירום — מה קרה?'), he: 'שירותי חירום — מה קרה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai besoin d’aide.', tr: TR('I need help.', 'אני צריך עזרה.'), he: 'אני צריך עזרה.', itemId: 'fr.phrase.emerg.need-help', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Qu’est-ce — qui se passe ?', tr: TR("What's — wrong?", 'מה — קרה?'), he: 'מה — קרה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai besoin d’aide.', tr: TR('I need help.', 'אני צריך עזרה.'), he: 'אני צריך עזרה.', itemId: 'fr.phrase.emerg.need-help', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'D’accord, restez calme. Vous êtes blessé, ou quelqu’un est en danger ?', tr: TR('Okay, stay calm. Are you hurt, or is someone in danger?', 'טוב, תישאר רגוע. אתה פצוע, או שמישהו בסכנה?'), he: 'טוב, תישאר רגוע. אתה פצוע, או שמישהו בסכנה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Appelez un médecin, s’il vous plaît.', tr: TR('Please call a doctor.', 'תקראו לרופא, בבקשה.'), he: 'תקראו לרופא, בבקשה.', itemId: 'fr.phrase.emerg.call-doctor', correct: true, next: 'n3' },
      { en: 'Appelez la police !', tr: TR('Call the police!', 'תקראו למשטרה!'), he: 'תקראו למשטרה!', itemId: 'fr.phrase.emerg.call-police', correct: true, next: 'n2c' },
    ] },
    { id: 'n2c', who: 'npc', next: 'c2b', en: 'La police est en route. Maintenant — vous avez besoin d’un médecin ?', tr: TR("Police are on their way. Now — do you need a doctor?", 'המשטרה בדרך. עכשיו — אתה צריך רופא?'), he: 'המשטרה בדרך. עכשיו — אתה צריך רופא?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Appelez un médecin, s’il vous plaît.', tr: TR('Please call a doctor.', 'תקראו לרופא, בבקשה.'), he: 'תקראו לרופא, בבקשה.', itemId: 'fr.phrase.emerg.call-doctor', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Une ambulance arrive. Où êtes-vous ?', tr: TR('An ambulance is on the way. Where are you?', 'אמבולנס בדרך. איפה אתה?'), he: 'אמבולנס בדרך. איפה אתה?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis à la gare.', tr: TR("I'm at the train station.", 'אני בתחנת הרכבת.'), he: 'אני בתחנת הרכבת.', correct: true, next: 'n4' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Où — êtes — vous ?', tr: TR('Where — are — you?', 'איפה — אתה?'), he: 'איפה — אתה?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis à la gare.', tr: TR("I'm at the train station.", 'אני בתחנת הרכבת.'), he: 'אני בתחנת הרכבת.', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Bien. Restez là. Vous avez aussi dit que quelque chose était perdu ?', tr: TR('Good. Stay there. You also said something was lost?', 'טוב. תישאר שם. אמרת גם שמשהו אבד?'), he: 'טוב. תישאר שם. אמרת גם שמשהו אבד?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai perdu mon passeport.', tr: TR('I lost my passport.', 'איבדתי את הדרכון.'), he: 'איבדתי את הדרכון.', itemId: 'fr.phrase.emerg.lost-passport', correct: true, next: 'n5' },
      { en: 'Où est l’hôpital ?', tr: TR('Where is the hospital?', 'איפה בית החולים? (הוא שאל על האבידה)'), he: 'איפה בית החולים?', itemId: 'fr.phrase.emerg.where-hospital', correct: false, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', next: 'c4b', en: 'On vous emmènera à l’hôpital — mais vous avez mentionné que quelque chose était perdu ?', tr: TR("We'll get you to a hospital — but you mentioned something was lost?", 'נדאג להביא אותך לבית חולים — אבל אמרת שמשהו אבד?'), he: 'נדאג להביא אותך לבית חולים — אבל אמרת שמשהו אבד?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai perdu mon passeport.', tr: TR('I lost my passport.', 'איבדתי את הדרכון.'), he: 'איבדתי את הדרכון.', itemId: 'fr.phrase.emerg.lost-passport', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Vous pouvez le signaler ici — je vais vous aider avec le formulaire.', tr: TR("You can report it here — I'll help you with the form.", 'אפשר לדווח כאן — אני אעזור לך עם הטופס.'), he: 'אפשר לדווח כאן — אני אעזור לך עם הטופס.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Vous pouvez — le signaler — ici.', tr: TR('You can — report it — here.', 'אפשר — לדווח — כאן.'), he: 'אפשר — לדווח — כאן.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Vous avez tout fait comme il faut. Les secours sont là. Vous êtes en sécurité.', tr: TR("You did everything right. Help is here now. You're safe.", 'עשית הכל נכון. העזרה כאן עכשיו. אתה בטוח.'), he: 'עשית הכל נכון. העזרה כאן עכשיו. אתה בטוח.' },
  ],
};

export const DAY27_FR: BootcampDayContent = {
  day: 27,
  title: T('חירום', 'Emergency'),
  items: DAY27_FR_ITEMS,
  dialogues: { emergency: SCENE_EMERGENCY },
  steps: [
    { kind: 'talk', icon: '🆘', title: T('משימה 27: חירום', 'Mission 27: Emergency'),
      body: [
        T('בלחץ אמיתי שורד רק מה שנחרט אוטומטית. לכן היום נחזור על המשפטים האלה שוב ושוב.', 'Under real stress only what’s burned in automatically survives. So today we repeat these lines again and again.'),
        T('עזרה, רופא, משטרה, אבידה, בית חולים. יקרה מה שיקרה — אתה תפעל.', 'Help, doctor, police, a lost item, the hospital. Whatever happens — you will act.'),
      ], cta: T('להיות מוכן לכל דבר', 'Be ready for anything') },
    { kind: 'tool', itemId: 'fr.phrase.emerg.need-help', index: 1, total: 4, label: T('לזמן עזרה', 'Summon help') },
    { kind: 'tool', itemId: 'fr.phrase.emerg.call-doctor', index: 2, total: 4, label: T('לקרוא לרופא', 'Call a doctor') },
    { kind: 'tool', itemId: 'fr.phrase.emerg.lost-passport', index: 3, total: 4, label: T('לדווח על אבידה', 'Report a lost item') },
    { kind: 'tool', itemId: 'fr.phrase.emerg.call-police', index: 4, total: 4, label: T('לקרוא למשטרה', 'Call the police') },
    { kind: 'replies', saidItemId: 'fr.phrase.emerg.need-help',
      replyIds: ['fr.reply.emerg.whats-wrong', 'fr.reply.emerg.are-you-hurt', 'fr.reply.emerg.where-you', 'fr.reply.emerg.on-the-way'] },
    { kind: 'receipt', text: T('אתה מזהה את שאלות מוקד החירום — מה קרה, איפה אתה, אתה פצוע.', 'You recognize the emergency dispatcher’s questions — what happened, where you are, are you hurt.') },
    { kind: 'quiz', itemId: 'fr.reply.emerg.are-you-hurt', wrongIds: ['fr.reply.emerg.where-you', 'fr.reply.emerg.stay-calm'] },
    { kind: 'quiz', itemId: 'fr.reply.emerg.on-the-way', wrongIds: ['fr.reply.emerg.whats-wrong', 'fr.reply.emerg.report-here'] },
    { kind: 'dialogue', dialogueId: 'emergency' },
    { kind: 'receipt', text: T('ניהלת שיחת חירום שלמה — עזרה, רופא, מיקום, אבידה — בלי לקפוא.', 'You handled a full emergency call — help, doctor, location, lost item — without freezing.') },
    { kind: 'swipe', itemIds: DAY27_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Vous pouvez me dire exactement à quoi ressemblait l’homme et dans quelle direction il s’est enfui ?', tr: TR('Can you tell me exactly what the man looked like and which direction he ran off in?', 'אתה יכול לומר לי בדיוק איך האיש נראה ולאיזה כיוון הוא ברח?'), he: 'אתה יכול לומר לי בדיוק איך האיש נראה ולאיזה כיוון הוא ברח?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.emerg.need-help' },
    { kind: 'receipt', text: T('שאלה מהירה תחת לחץ — וביקשת שיאט כדי לענות נכון. בחירום, זה עוצמה.', 'A fast question under pressure — and you asked them to slow down to answer well. In an emergency, that’s power.') },
    { kind: 'summary' },
  ],
};
