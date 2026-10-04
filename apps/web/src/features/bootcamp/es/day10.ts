import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { m06Flow } from '../practiceArrival.js';

/**
 * Spanish Mission 6 — "Aeropuerto y frontera" (Airport & Border). Spanish parallel of English mission 10:
 * same objective (the officer's question-chain: passport → purpose → how long → where → declare),
 * same step structure, same engine. `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY10_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.border.passport-here', text: 'Aquí tiene mi pasaporte.', meaning: T('הנה הדרכון שלי.', 'Here is my passport.'),
    tip: T('מגישים ואומרים. שלוש מילים שפותחות כל גבול.', 'Hand it over and say it. Three words that open any border.') },
  { id: 'es.phrase.border.on-holiday', text: 'Estoy de vacaciones.', meaning: T('אני כאן בחופשה.', "I'm here on holiday."),
    tip: T('התשובה ל-"מטרת הביקור?". ידידותית ובטוחה.', 'The answer to “purpose of your visit?” — friendly and safe.') },
  { id: 'es.phrase.border.two-weeks', text: 'Dos semanas.', meaning: T('לשבועיים.', 'For two weeks.'),
    tip: T('התבנית: מספר + משך זמן. Tres días / Una semana.', 'Template: number + duration. Tres días / Una semana.') },
  { id: 'es.phrase.border.staying-hotel', text: 'En un hotel en el centro.', meaning: T('במלון במרכז העיר.', 'At a hotel in the city centre.'),
    tip: T('התשובה ל-"איפה אתה מתאכסן?". שם המלון עדיף, אבל זה מספיק.', 'Answers “where are you staying?”. The hotel name is better, but this is enough.') },
  { id: 'es.phrase.border.nothing-declare', text: 'Nada que declarar.', meaning: T('אין לי מה להצהיר.', 'Nothing to declare.'),
    tip: T('המשפט הקבוע במכס. אומרים אותו רגוע.', 'The fixed customs line. Say it calmly.') },
  // hear — the border question-chain
  { id: 'es.reply.border.passport-please', text: 'Pasaporte, por favor.', meaning: T('דרכון, בבקשה.', 'Passport, please.') },
  { id: 'es.reply.border.purpose', text: '¿Cuál es el motivo de su viaje?', meaning: T('מה מטרת הביקור?', "What's the purpose of your visit?") },
  { id: 'es.reply.border.how-long', text: '¿Cuánto tiempo se queda?', meaning: T('לכמה זמן אתה נשאר?', 'How long are you staying?') },
  { id: 'es.reply.border.where-staying', text: '¿Dónde se aloja?', meaning: T('איפה אתה מתאכסן?', 'Where are you staying?') },
  { id: 'es.reply.border.anything-declare', text: '¿Algo que declarar?', meaning: T('יש לך מה להצהיר?', 'Anything to declare?') },
  { id: 'es.reply.border.enjoy', text: '¡Que disfrute su estancia!', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.one-moment', 'es.phrase.recovery.thank-you'),
];

const SCENE_BORDER: BootcampDialogue = {
  id: 'border-control',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'El siguiente, por favor. ¿Pasaporte?', tr: TR('Next, please. Passport?', 'הבא בתור, בבקשה. דרכון?'), he: 'הבא בתור, בבקשה. דרכון?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Aquí tiene mi pasaporte.', tr: TR('Here is my passport.', 'הנה הדרכון שלי.'), he: 'הנה הדרכון שלי.', itemId: 'es.phrase.border.passport-here', correct: true, next: 'n2' },
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (כלי — לחפש את הדרכון)'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Sin prisa. Cuando esté listo.', tr: TR("No rush. Whenever you're ready.", 'אין לחץ. מתי שתהיה מוכן.'), he: 'אין לחץ. מתי שתהיה מוכן.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Aquí tiene mi pasaporte.', tr: TR('Here is my passport.', 'הנה הדרכון שלי.'), he: 'הנה הדרכון שלי.', itemId: 'es.phrase.border.passport-here', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Gracias. ¿Cuál es el motivo de su viaje?', tr: TR("Thank you. What's the purpose of your visit?", 'תודה. מה מטרת הביקור?'), he: 'תודה. מה מטרת הביקור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Estoy de vacaciones.', tr: TR("I'm here on holiday.", 'אני כאן בחופשה.'), he: 'אני כאן בחופשה.', itemId: 'es.phrase.border.on-holiday', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה? (לא הבנת? תשאל)'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'El — motivo — de su viaje?', tr: TR('The — purpose — of your visit?', 'מה — מטרת — הביקור?'), he: 'מה — מטרת — הביקור?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Estoy de vacaciones.', tr: TR("I'm here on holiday.", 'אני כאן בחופשה.'), he: 'אני כאן בחופשה.', itemId: 'es.phrase.border.on-holiday', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Muy bien. ¿Cuánto tiempo se queda?', tr: TR('All right. How long are you staying?', 'בסדר. לכמה זמן אתה נשאר?'), he: 'בסדר. לכמה זמן אתה נשאר?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Dos semanas.', tr: TR('For two weeks.', 'לשבועיים.'), he: 'לשבועיים.', itemId: 'es.phrase.border.two-weeks', correct: true, next: 'n4' },
      { en: 'Aquí tiene mi pasaporte.', tr: TR('Here is my passport.', 'הנה הדרכון שלי. (כבר נתת — הוא שאל משהו אחר)'), he: 'הנה הדרכון שלי.', itemId: 'es.phrase.border.passport-here', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Ya tengo su pasaporte — le pregunto cuánto tiempo se queda.', tr: TR("I have your passport — I asked how long you're staying.", 'הדרכון אצלי — שאלתי לכמה זמן אתה נשאר.'), he: 'הדרכון אצלי — שאלתי לכמה זמן אתה נשאר.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Dos semanas.', tr: TR('For two weeks.', 'לשבועיים.'), he: 'לשבועיים.', itemId: 'es.phrase.border.two-weeks', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: '¿Y dónde se aloja?', tr: TR('And where are you staying?', 'ואיפה אתה מתאכסן?'), he: 'ואיפה אתה מתאכסן?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'En un hotel en el centro.', tr: TR('At a hotel in the city centre.', 'במלון במרכז העיר.'), he: 'במלון במרכז העיר.', itemId: 'es.phrase.border.staying-hotel', correct: true, next: 'n5' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה. (בשלב הזה מותר!)'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: '¿Dónde — se — aloja?', tr: TR('Where — are you — staying?', 'איפה — אתה — מתאכסן?'), he: 'איפה — אתה — מתאכסן?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'En un hotel en el centro.', tr: TR('At a hotel in the city centre.', 'במלון במרכז העיר.'), he: 'במלון במרכז העיר.', itemId: 'es.phrase.border.staying-hotel', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Ya casi está. ¿Algo que declarar?', tr: TR('Almost done. Anything to declare?', 'כמעט סיימנו. יש לך מה להצהיר?'), he: 'כמעט סיימנו. יש לך מה להצהיר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Nada que declarar.', tr: TR('Nothing to declare.', 'אין לי מה להצהיר.'), he: 'אין לי מה להצהיר.', itemId: 'es.phrase.border.nothing-declare', correct: true, next: 'n6' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה! (מנומס — אבל תגיד קודם שאין לך מה להצהיר)'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: false, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', next: 'c5b', en: 'Ah — entonces, ¿algo que declarar? ¿Alguna mercancía?', tr: TR('Ha — so, anything to declare? Any goods?', 'הא — אז, יש מה להצהיר? סחורה כלשהי?'), he: 'הא — אז, יש מה להצהיר? סחורה כלשהי?' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Nada que declarar.', tr: TR('Nothing to declare.', 'אין לי מה להצהיר.'), he: 'אין לי מה להצהיר.', itemId: 'es.phrase.border.nothing-declare', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Bienvenido, ¡y que disfrute su estancia!', tr: TR('Welcome, and enjoy your stay!', 'ברוך הבא, ותיהנה מהשהות!'), he: 'ברוך הבא, ותיהנה מהשהות!' },
  ],
};

export const DAY10_ES: BootcampDayContent = {
  day: 10,
  title: T('שדה תעופה וגבול', 'Airport & Border'),
  items: DAY10_ES_ITEMS,
  dialogues: { 'border-control': SCENE_BORDER },
  steps: [
    { kind: 'talk', icon: '🛂', title: T('משימה 6: שדה תעופה וגבול', 'Mission 6: Airport & Border'),
      body: [
        T('הרגע הכי מפחיד בטיול הוא גם הצפוי ביותר. פקיד הגבול שואל תמיד את אותן שאלות.', 'The scariest moment of the trip is also the most predictable. The border officer always asks the same questions.'),
        T('נכיר אותן מראש. אחר כך גבול זה בסך הכל תסריט שכבר קראת.', 'We’ll learn them in advance. After that, a border is just a script you’ve already read.'),
      ], cta: T('להתקרב לדלפק', 'Approach the counter') },
    // From the key sentences onward the flow is shared by all languages: see practiceArrival.ts.
    ...m06Flow('es'),
  ],
};
