import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 27 — "Emergency" (Phase 5 · Mastery).
 * Under real stress only automatic memory survives, so this set is overlearned: help, doctor,
 * police, a lost passport, the hospital. Whatever happens — you act. The worst case has a script.
 */
export const DAY27_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.emerg.need-help', text: 'I need help.', meaning: T('אני צריך עזרה.', 'I need help.'),
    tip: T('שתי מילים שמזמנות עזרה בכל מקום בעולם. תגיד בקול.', 'Two words that summon help anywhere on earth. Say them loud.') },
  { id: 'en.phrase.emerg.call-doctor', text: 'Please call a doctor.', meaning: T('תקראו לרופא, בבקשה.', 'Please call a doctor.') },
  { id: 'en.phrase.emerg.lost-passport', text: 'I lost my passport.', meaning: T('איבדתי את הדרכון.', 'I lost my passport.'),
    tip: T('התבנית: I lost my ___ — לדווח על כל אבידה. passport / bag / phone.', 'Template: I lost my ___ — report any lost item. passport / bag / phone.') },
  { id: 'en.phrase.emerg.call-police', text: 'Call the police!', meaning: T('תקראו למשטרה!', 'Call the police!') },
  { id: 'en.phrase.emerg.where-hospital', text: 'Where is the hospital?', meaning: T('איפה בית החולים?', 'Where is the hospital?') },
  // hear — responders
  { id: 'en.reply.emerg.whats-wrong', text: "What's wrong?", meaning: T('מה קרה?', "What's wrong?") },
  { id: 'en.reply.emerg.stay-calm', text: 'Stay calm, help is coming.', meaning: T('תישאר רגוע, עזרה בדרך.', 'Stay calm, help is coming.') },
  { id: 'en.reply.emerg.where-you', text: 'Where are you?', meaning: T('איפה אתה?', 'Where are you?') },
  { id: 'en.reply.emerg.are-you-hurt', text: 'Are you hurt?', meaning: T('אתה פצוע?', 'Are you hurt?') },
  { id: 'en.reply.emerg.on-the-way', text: 'An ambulance is on the way.', meaning: T('אמבולנס בדרך.', 'An ambulance is on the way.') },
  { id: 'en.reply.emerg.report-here', text: 'You can report it here.', meaning: T('אפשר לדווח כאן.', 'You can report it here.') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_EMERGENCY: BootcampDialogue = {
  id: 'emergency',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "Emergency services — what's wrong?", he: 'שירותי חירום — מה קרה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'I need help.', he: 'אני צריך עזרה.', itemId: 'en.phrase.emerg.need-help', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: "What's — wrong?", he: 'מה — קרה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'I need help.', he: 'אני צריך עזרה.', itemId: 'en.phrase.emerg.need-help', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Okay, stay calm. Are you hurt, or is someone in danger?', he: 'טוב, תישאר רגוע. אתה פצוע, או שמישהו בסכנה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Please call a doctor.', he: 'תקראו לרופא, בבקשה.', itemId: 'en.phrase.emerg.call-doctor', correct: true, next: 'n3' },
      { en: 'Call the police!', he: 'תקראו למשטרה!', itemId: 'en.phrase.emerg.call-police', correct: true, next: 'n2c' },
    ] },
    { id: 'n2c', who: 'npc', next: 'c2b', en: 'Police are on their way. Now — do you need a doctor?', he: 'המשטרה בדרך. עכשיו — אתה צריך רופא?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Please call a doctor.', he: 'תקראו לרופא, בבקשה.', itemId: 'en.phrase.emerg.call-doctor', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'An ambulance is on the way. Where are you?', he: 'אמבולנס בדרך. איפה אתה?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: "I'm at the train station.", he: 'אני בתחנת הרכבת.', correct: true, next: 'n4' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Where — are — you?', he: 'איפה — אתה?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: "I'm at the train station.", he: 'אני בתחנת הרכבת.', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Good. Stay there. You also said something was lost?', he: 'טוב. תישאר שם. אמרת גם שמשהו אבד?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'I lost my passport.', he: 'איבדתי את הדרכון.', itemId: 'en.phrase.emerg.lost-passport', correct: true, next: 'n5' },
      { en: 'Where is the hospital?', he: 'איפה בית החולים? (הוא שאל על האבידה)', itemId: 'en.phrase.emerg.where-hospital', correct: false, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', next: 'c4b', en: "We'll get you to a hospital — but you mentioned something was lost?", he: 'נדאג להביא אותך לבית חולים — אבל אמרת שמשהו אבד?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'I lost my passport.', he: 'איבדתי את הדרכון.', itemId: 'en.phrase.emerg.lost-passport', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: "You can report it here — I'll help you with the form.", he: 'אפשר לדווח כאן — אני אעזור לך עם הטופס.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'You can — report it — here.', he: 'אפשר — לדווח — כאן.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: "You did everything right. Help is here now. You're safe.", he: 'עשית הכל נכון. העזרה כאן עכשיו. אתה בטוח.' },
  ],
};

export const DAY27: BootcampDayContent = {
  day: 27,
  title: T('חירום', 'Emergency'),
  items: DAY27_ITEMS,
  dialogues: { emergency: SCENE_EMERGENCY },
  steps: [
    { kind: 'talk', icon: '🆘', title: T('משימה 27: חירום', 'Mission 27: Emergency'),
      body: [
        T('בלחץ אמיתי שורד רק מה שנחרט אוטומטית. לכן היום נחזור על המשפטים האלה שוב ושוב.', 'Under real stress only what’s burned in automatically survives. So today we repeat these lines again and again.'),
        T('עזרה, רופא, משטרה, אבידה, בית חולים. יקרה מה שיקרה — אתה תפעל.', 'Help, doctor, police, a lost item, the hospital. Whatever happens — you will act.'),
      ], cta: T('להיות מוכן לכל דבר', 'Be ready for anything') },
    { kind: 'tool', itemId: 'en.phrase.emerg.need-help', index: 1, total: 4, label: T('לזמן עזרה', 'Summon help') },
    { kind: 'tool', itemId: 'en.phrase.emerg.call-doctor', index: 2, total: 4, label: T('לקרוא לרופא', 'Call a doctor') },
    { kind: 'tool', itemId: 'en.phrase.emerg.lost-passport', index: 3, total: 4, label: T('לדווח על אבידה', 'Report a lost item') },
    { kind: 'tool', itemId: 'en.phrase.emerg.call-police', index: 4, total: 4, label: T('לקרוא למשטרה', 'Call the police') },
    { kind: 'replies', saidItemId: 'en.phrase.emerg.need-help',
      replyIds: ['en.reply.emerg.whats-wrong', 'en.reply.emerg.are-you-hurt', 'en.reply.emerg.where-you', 'en.reply.emerg.on-the-way'] },
    { kind: 'receipt', text: T('אתה מזהה את שאלות מוקד החירום — מה קרה, איפה אתה, אתה פצוע.', 'You recognize the emergency dispatcher’s questions — what happened, where you are, are you hurt.') },
    { kind: 'quiz', itemId: 'en.reply.emerg.are-you-hurt', wrongIds: ['en.reply.emerg.where-you', 'en.reply.emerg.stay-calm'] },
    { kind: 'quiz', itemId: 'en.reply.emerg.on-the-way', wrongIds: ['en.reply.emerg.whats-wrong', 'en.reply.emerg.report-here'] },
    { kind: 'dialogue', dialogueId: 'emergency' },
    { kind: 'receipt', text: T('ניהלת שיחת חירום שלמה — עזרה, רופא, מיקום, אבידה — בלי לקפוא.', 'You handled a full emergency call — help, doctor, location, lost item — without freezing.') },
    { kind: 'swipe', itemIds: DAY27_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Can you tell me exactly what the man looked like and which direction he ran off in?', he: 'אתה יכול לומר לי בדיוק איך האיש נראה ולאיזה כיוון הוא ברח?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.emerg.need-help' },
    { kind: 'receipt', text: T('שאלה מהירה תחת לחץ — וביקשת שיאט כדי לענות נכון. בחירום, זה עוצמה.', 'A fast question under pressure — and you asked them to slow down to answer well. In an emergency, that’s power.') },
    { kind: 'summary' },
  ],
};
