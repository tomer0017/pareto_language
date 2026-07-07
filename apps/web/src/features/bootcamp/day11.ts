import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 11 — "Airport & Border" (Phase 2 · Arrival).
 * The scariest moment abroad is also the most predictable script: passport → purpose →
 * how long → where staying → declare → welcome. Learn the officer's question-chain in
 * advance and authority stops being frightening. Listening-first, one line at a time.
 */
export const DAY11_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.border.passport-here', text: 'Here is my passport.', meaning: T('הנה הדרכון שלי.', 'Here is my passport.'),
    tip: T('מגישים ואומרים. שלוש מילים שפותחות כל גבול.', 'Hand it over and say it. Three words that open any border.') },
  { id: 'en.phrase.border.on-holiday', text: "I'm here on holiday.", meaning: T('אני כאן בחופשה.', "I'm here on holiday."),
    tip: T('התשובה ל-"מטרת הביקור?". ידידותית ובטוחה.', 'The answer to “purpose of your visit?” — friendly and safe.') },
  { id: 'en.phrase.border.two-weeks', text: 'For two weeks.', meaning: T('לשבועיים.', 'For two weeks.'),
    tip: T('התבנית: For + משך זמן. For three days / For a week.', 'Template: For + duration. For three days / For a week.') },
  { id: 'en.phrase.border.staying-hotel', text: 'At a hotel in the city center.', meaning: T('במלון במרכז העיר.', 'At a hotel in the city center.'),
    tip: T('התשובה ל-"איפה אתה מתאכסן?". שם המלון עדיף, אבל זה מספיק.', 'Answers “where are you staying?”. The hotel name is better, but this is enough.') },
  { id: 'en.phrase.border.nothing-declare', text: 'Nothing to declare.', meaning: T('אין לי מה להצהיר.', 'Nothing to declare.'),
    tip: T('המשפט הקבוע במכס. אומרים אותו רגוע.', 'The fixed customs line. Say it calmly.') },
  // hear — the border question-chain
  { id: 'en.reply.border.passport-please', text: 'Passport, please.', meaning: T('דרכון, בבקשה.', 'Passport, please.') },
  { id: 'en.reply.border.purpose', text: "What's the purpose of your visit?", meaning: T('מה מטרת הביקור?', "What's the purpose of your visit?") },
  { id: 'en.reply.border.how-long', text: 'How long are you staying?', meaning: T('לכמה זמן אתה נשאר?', 'How long are you staying?') },
  { id: 'en.reply.border.where-staying', text: 'Where are you staying?', meaning: T('איפה אתה מתאכסן?', 'Where are you staying?') },
  { id: 'en.reply.border.anything-declare', text: 'Anything to declare?', meaning: T('יש לך מה להצהיר?', 'Anything to declare?') },
  { id: 'en.reply.border.enjoy', text: 'Enjoy your stay!', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.one-moment', 'en.phrase.recovery.thank-you'),
];

const SCENE_BORDER: BootcampDialogue = {
  id: 'border-control',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Next, please. Passport?', he: 'הבא בתור, בבקשה. דרכון?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Here is my passport.', he: 'הנה הדרכון שלי.', itemId: 'en.phrase.border.passport-here', correct: true, next: 'n2' },
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה. (כלי — לחפש את הדרכון)', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'No rush. Whenever you’re ready.', he: 'אין לחץ. מתי שתהיה מוכן.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Here is my passport.', he: 'הנה הדרכון שלי.', itemId: 'en.phrase.border.passport-here', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: "Thank you. What's the purpose of your visit?", he: 'תודה. מה מטרת הביקור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'm here on holiday.", he: 'אני כאן בחופשה.', itemId: 'en.phrase.border.on-holiday', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה? (לא הבנת? תשאל)', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'The — purpose — of your visit?', he: 'מה — מטרת — הביקור?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: "I'm here on holiday.", he: 'אני כאן בחופשה.', itemId: 'en.phrase.border.on-holiday', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Lovely. How long are you staying?', he: 'נהדר. לכמה זמן אתה נשאר?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'For two weeks.', he: 'לשבועיים.', itemId: 'en.phrase.border.two-weeks', correct: true, next: 'n4' },
      { en: 'Here is my passport.', he: 'הנה הדרכון שלי. (כבר נתת — הוא שאל משהו אחר)', itemId: 'en.phrase.border.passport-here', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'I have your passport — I asked how long you’re staying.', he: 'הדרכון אצלי — שאלתי לכמה זמן אתה נשאר.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'For two weeks.', he: 'לשבועיים.', itemId: 'en.phrase.border.two-weeks', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'And where are you staying?', he: 'ואיפה אתה מתאכסן?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'At a hotel in the city center.', he: 'במלון במרכז העיר.', itemId: 'en.phrase.border.staying-hotel', correct: true, next: 'n5' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה. (בשלב הזה מותר!)', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'Where — are you — staying?', he: 'איפה — אתה — מתאכסן?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'At a hotel in the city center.', he: 'במלון במרכז העיר.', itemId: 'en.phrase.border.staying-hotel', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Almost done. Anything to declare?', he: 'כמעט סיימנו. יש לך מה להצהיר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Nothing to declare.', he: 'אין לי מה להצהיר.', itemId: 'en.phrase.border.nothing-declare', correct: true, next: 'n6' },
      { en: 'Thank you!', he: 'תודה! (מנומס — אבל תגיד קודם שאין לך מה להצהיר)', itemId: 'en.phrase.recovery.thank-you', correct: false, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', next: 'c5b', en: 'Ha — so, anything to declare? Any goods?', he: 'הא — אז, יש מה להצהיר? סחורה כלשהי?' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Nothing to declare.', he: 'אין לי מה להצהיר.', itemId: 'en.phrase.border.nothing-declare', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Welcome, and enjoy your stay!', he: 'ברוך הבא, ותיהנה מהשהות!' },
  ],
};

export const DAY11: BootcampDayContent = {
  day: 11,
  title: T('שדה תעופה וגבול', 'Airport & Border'),
  items: DAY11_ITEMS,
  dialogues: { 'border-control': SCENE_BORDER },
  steps: [
    { kind: 'talk', icon: '🛂', title: T('משימה 11: שדה תעופה וגבול', 'Mission 11: Airport & Border'),
      body: [
        T('הרגע הכי מפחיד בטיול הוא גם הצפוי ביותר. פקיד הגבול שואל תמיד את אותן שאלות.', 'The scariest moment of the trip is also the most predictable. The border officer always asks the same questions.'),
        T('נכיר אותן מראש. אחר כך גבול זה בסך הכל תסריט שכבר קראת.', 'We’ll learn them in advance. After that, a border is just a script you’ve already read.'),
      ], cta: T('להתקרב לדלפק', 'Approach the counter') },
    { kind: 'tool', itemId: 'en.phrase.border.passport-here', index: 1, total: 4, label: T('המשפט הפותח', 'The opener') },
    { kind: 'tool', itemId: 'en.phrase.border.on-holiday', index: 2, total: 4, label: T('מטרת הביקור', 'Purpose of visit') },
    { kind: 'tool', itemId: 'en.phrase.border.two-weeks', index: 3, total: 4, label: T('כמה זמן', 'How long') },
    { kind: 'tool', itemId: 'en.phrase.border.staying-hotel', index: 4, total: 4, label: T('איפה מתאכסן', 'Where staying') },
    { kind: 'replies', saidItemId: 'en.phrase.border.passport-here',
      replyIds: ['en.reply.border.purpose', 'en.reply.border.how-long', 'en.reply.border.where-staying', 'en.reply.border.anything-declare'] },
    { kind: 'receipt', text: T('אתה מזהה את כל שרשרת השאלות של פקיד הגבול — מראש.', 'You recognize the border officer’s whole question-chain — in advance.') },
    { kind: 'quiz', itemId: 'en.reply.border.purpose', wrongIds: ['en.reply.border.how-long', 'en.reply.border.enjoy'] },
    { kind: 'quiz', itemId: 'en.reply.border.where-staying', wrongIds: ['en.reply.border.anything-declare', 'en.reply.border.passport-please'] },
    { kind: 'dialogue', dialogueId: 'border-control' },
    { kind: 'receipt', text: T('עברת ביקורת גבול שלמה באנגלית — דרכון, מטרה, משך, מקום, מכס.', 'You cleared a full border check in English — passport, purpose, duration, place, customs.') },
    { kind: 'swipe', itemIds: DAY11_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'And do you have a return ticket booked for your flight home at all?', he: 'ויש לך בכלל כרטיס חזור מוזמן לטיסה הביתה?' },
      correctItemId: 'en.phrase.recovery.one-moment', wrongItemId: 'en.phrase.border.two-weeks' },
    { kind: 'receipt', text: T('שאלה שלא ציפית לה — ולא קפאת. קנית שנייה עם כלי.', 'A question you didn’t expect — and you didn’t freeze. You bought a second with a tool.') },
    { kind: 'summary' },
  ],
};
