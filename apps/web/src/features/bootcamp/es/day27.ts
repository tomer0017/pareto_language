import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 27 — "Emergencia" (Emergency). Spanish parallel of English day 27, overlearned for
 * stress: help, doctor, police, a lost passport, the hospital. The worst case has a script.
 * `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY27_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.emerg.need-help', text: 'Necesito ayuda.', meaning: T('אני צריך עזרה.', 'I need help.'),
    tip: T('שתי מילים שמזמנות עזרה בכל מקום בעולם. תגיד בקול.', 'Words that summon help anywhere on earth. Say them loud.') },
  { id: 'es.phrase.emerg.call-doctor', text: 'Llame a un médico, por favor.', meaning: T('תקראו לרופא, בבקשה.', 'Please call a doctor.') },
  { id: 'es.phrase.emerg.lost-passport', text: 'He perdido mi pasaporte.', meaning: T('איבדתי את הדרכון.', 'I lost my passport.'),
    tip: T('התבנית: He perdido mi ___ — לדווח על כל אבידה. pasaporte / bolso / teléfono.', 'Template: He perdido mi ___ — report any lost item. passport / bag / phone.') },
  { id: 'es.phrase.emerg.call-police', text: '¡Llame a la policía!', meaning: T('תקראו למשטרה!', 'Call the police!') },
  { id: 'es.phrase.emerg.where-hospital', text: '¿Dónde está el hospital?', meaning: T('איפה בית החולים?', 'Where is the hospital?') },
  // hear — responders
  { id: 'es.reply.emerg.whats-wrong', text: '¿Qué ocurre?', meaning: T('מה קרה?', "What's wrong?") },
  { id: 'es.reply.emerg.stay-calm', text: 'Mantenga la calma, la ayuda va en camino.', meaning: T('תישאר רגוע, עזרה בדרך.', 'Stay calm, help is coming.') },
  { id: 'es.reply.emerg.where-you', text: '¿Dónde está?', meaning: T('איפה אתה?', 'Where are you?') },
  { id: 'es.reply.emerg.are-you-hurt', text: '¿Está herido?', meaning: T('אתה פצוע?', 'Are you hurt?') },
  { id: 'es.reply.emerg.on-the-way', text: 'Una ambulancia va en camino.', meaning: T('אמבולנס בדרך.', 'An ambulance is on the way.') },
  { id: 'es.reply.emerg.report-here', text: 'Puede denunciarlo aquí.', meaning: T('אפשר לדווח כאן.', 'You can report it here.') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_EMERGENCY: BootcampDialogue = {
  id: 'emergency',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Servicios de emergencia — ¿qué ocurre?', tr: TR("Emergency services — what's wrong?", 'שירותי חירום — מה קרה?'), he: 'שירותי חירום — מה קרה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Necesito ayuda.', tr: TR('I need help.', 'אני צריך עזרה.'), he: 'אני צריך עזרה.', itemId: 'es.phrase.emerg.need-help', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: '¿Qué — ocurre?', tr: TR("What's — wrong?", 'מה — קרה?'), he: 'מה — קרה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Necesito ayuda.', tr: TR('I need help.', 'אני צריך עזרה.'), he: 'אני צריך עזרה.', itemId: 'es.phrase.emerg.need-help', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'De acuerdo, mantenga la calma. ¿Está herido, o alguien está en peligro?', tr: TR('Okay, stay calm. Are you hurt, or is someone in danger?', 'טוב, תישאר רגוע. אתה פצוע, או שמישהו בסכנה?'), he: 'טוב, תישאר רגוע. אתה פצוע, או שמישהו בסכנה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Llame a un médico, por favor.', tr: TR('Please call a doctor.', 'תקראו לרופא, בבקשה.'), he: 'תקראו לרופא, בבקשה.', itemId: 'es.phrase.emerg.call-doctor', correct: true, next: 'n3' },
      { en: '¡Llame a la policía!', tr: TR('Call the police!', 'תקראו למשטרה!'), he: 'תקראו למשטרה!', itemId: 'es.phrase.emerg.call-police', correct: true, next: 'n2c' },
    ] },
    { id: 'n2c', who: 'npc', next: 'c2b', en: 'La policía va en camino. Ahora — ¿necesita un médico?', tr: TR("Police are on their way. Now — do you need a doctor?", 'המשטרה בדרך. עכשיו — אתה צריך רופא?'), he: 'המשטרה בדרך. עכשיו — אתה צריך רופא?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Llame a un médico, por favor.', tr: TR('Please call a doctor.', 'תקראו לרופא, בבקשה.'), he: 'תקראו לרופא, בבקשה.', itemId: 'es.phrase.emerg.call-doctor', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Una ambulancia va en camino. ¿Dónde está?', tr: TR('An ambulance is on the way. Where are you?', 'אמבולנס בדרך. איפה אתה?'), he: 'אמבולנס בדרך. איפה אתה?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Estoy en la estación de tren.', tr: TR("I'm at the train station.", 'אני בתחנת הרכבת.'), he: 'אני בתחנת הרכבת.', correct: true, next: 'n4' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: '¿Dónde — está?', tr: TR('Where — are — you?', 'איפה — אתה?'), he: 'איפה — אתה?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Estoy en la estación de tren.', tr: TR("I'm at the train station.", 'אני בתחנת הרכבת.'), he: 'אני בתחנת הרכבת.', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Bien. Quédese ahí. ¿También dijo que había perdido algo?', tr: TR('Good. Stay there. You also said something was lost?', 'טוב. תישאר שם. אמרת גם שמשהו אבד?'), he: 'טוב. תישאר שם. אמרת גם שמשהו אבד?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'He perdido mi pasaporte.', tr: TR('I lost my passport.', 'איבדתי את הדרכון.'), he: 'איבדתי את הדרכון.', itemId: 'es.phrase.emerg.lost-passport', correct: true, next: 'n5' },
      { en: '¿Dónde está el hospital?', tr: TR('Where is the hospital?', 'איפה בית החולים? (הוא שאל על האבידה)'), he: 'איפה בית החולים?', itemId: 'es.phrase.emerg.where-hospital', correct: false, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', next: 'c4b', en: 'Le llevaremos a un hospital — pero, ¿mencionó que había perdido algo?', tr: TR("We'll get you to a hospital — but you mentioned something was lost?", 'נדאג להביא אותך לבית חולים — אבל אמרת שמשהו אבד?'), he: 'נדאג להביא אותך לבית חולים — אבל אמרת שמשהו אבד?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'He perdido mi pasaporte.', tr: TR('I lost my passport.', 'איבדתי את הדרכון.'), he: 'איבדתי את הדרכון.', itemId: 'es.phrase.emerg.lost-passport', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Puede denunciarlo aquí — le ayudo con el formulario.', tr: TR("You can report it here — I'll help you with the form.", 'אפשר לדווח כאן — אני אעזור לך עם הטופס.'), he: 'אפשר לדווח כאן — אני אעזור לך עם הטופס.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Puede — denunciarlo — aquí.', tr: TR('You can — report it — here.', 'אפשר — לדווח — כאן.'), he: 'אפשר — לדווח — כאן.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Ha hecho todo bien. La ayuda ya está aquí. Está a salvo.', tr: TR("You did everything right. Help is here now. You're safe.", 'עשית הכל נכון. העזרה כאן עכשיו. אתה בטוח.'), he: 'עשית הכל נכון. העזרה כאן עכשיו. אתה בטוח.' },
  ],
};

export const DAY27_ES: BootcampDayContent = {
  day: 27,
  title: T('חירום', 'Emergency'),
  items: DAY27_ES_ITEMS,
  dialogues: { emergency: SCENE_EMERGENCY },
  steps: [
    { kind: 'talk', icon: '🆘', title: T('משימה 27: חירום', 'Mission 27: Emergency'),
      body: [
        T('בלחץ אמיתי שורד רק מה שנחרט אוטומטית. לכן היום נחזור על המשפטים האלה שוב ושוב.', 'Under real stress only what’s burned in automatically survives. So today we repeat these lines again and again.'),
        T('עזרה, רופא, משטרה, אבידה, בית חולים. יקרה מה שיקרה — אתה תפעל.', 'Help, doctor, police, a lost item, the hospital. Whatever happens — you will act.'),
      ], cta: T('להיות מוכן לכל דבר', 'Be ready for anything') },
    { kind: 'tool', itemId: 'es.phrase.emerg.need-help', index: 1, total: 4, label: T('לזמן עזרה', 'Summon help') },
    { kind: 'tool', itemId: 'es.phrase.emerg.call-doctor', index: 2, total: 4, label: T('לקרוא לרופא', 'Call a doctor') },
    { kind: 'tool', itemId: 'es.phrase.emerg.lost-passport', index: 3, total: 4, label: T('לדווח על אבידה', 'Report a lost item') },
    { kind: 'tool', itemId: 'es.phrase.emerg.call-police', index: 4, total: 4, label: T('לקרוא למשטרה', 'Call the police') },
    { kind: 'replies', saidItemId: 'es.phrase.emerg.need-help',
      replyIds: ['es.reply.emerg.whats-wrong', 'es.reply.emerg.are-you-hurt', 'es.reply.emerg.where-you', 'es.reply.emerg.on-the-way'] },
    { kind: 'receipt', text: T('אתה מזהה את שאלות מוקד החירום — מה קרה, איפה אתה, אתה פצוע.', 'You recognize the emergency dispatcher’s questions — what happened, where you are, are you hurt.') },
    { kind: 'quiz', itemId: 'es.reply.emerg.are-you-hurt', wrongIds: ['es.reply.emerg.where-you', 'es.reply.emerg.stay-calm'] },
    { kind: 'quiz', itemId: 'es.reply.emerg.on-the-way', wrongIds: ['es.reply.emerg.whats-wrong', 'es.reply.emerg.report-here'] },
    { kind: 'dialogue', dialogueId: 'emergency' },
    { kind: 'receipt', text: T('ניהלת שיחת חירום שלמה — עזרה, רופא, מיקום, אבידה — בלי לקפוא.', 'You handled a full emergency call — help, doctor, location, lost item — without freezing.') },
    { kind: 'swipe', itemIds: DAY27_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: '¿Me puede decir exactamente cómo era el hombre y en qué dirección salió corriendo?', tr: TR('Can you tell me exactly what the man looked like and which direction he ran off in?', 'אתה יכול לומר לי בדיוק איך האיש נראה ולאיזה כיוון הוא ברח?'), he: 'אתה יכול לומר לי בדיוק איך האיש נראה ולאיזה כיוון הוא ברח?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.phrase.emerg.need-help' },
    { kind: 'receipt', text: T('שאלה מהירה תחת לחץ — וביקשת שיאט כדי לענות נכון. בחירום, זה עוצמה.', 'A fast question under pressure — and you asked them to slow down to answer well. In an emergency, that’s power.') },
    { kind: 'summary' },
  ],
};
