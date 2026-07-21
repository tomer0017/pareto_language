import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 11 — "Aéroport et frontière" (Airport & Border). French parallel of English day 11:
 * same objective (the officer's question-chain: passport → purpose → how long → where → declare),
 * same step structure, same engine. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY11_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.border.passport-here', text: 'Voici mon passeport.', meaning: T('הנה הדרכון שלי.', 'Here is my passport.'),
    tip: T('מגישים ואומרים. שלוש מילים שפותחות כל גבול.', 'Hand it over and say it. Three words that open any border.') },
  { id: 'fr.phrase.border.on-holiday', text: 'Je suis en vacances.', meaning: T('אני כאן בחופשה.', "I'm here on holiday."),
    tip: T('התשובה ל-"מטרת הביקור?". ידידותית ובטוחה.', 'The answer to “purpose of your visit?” — friendly and safe.') },
  { id: 'fr.phrase.border.two-weeks', text: 'Pour deux semaines.', meaning: T('לשבועיים.', 'For two weeks.'),
    tip: T('התבנית: Pour + משך זמן. Pour trois jours / Pour une semaine.', 'Template: Pour + duration. Pour trois jours / Pour une semaine.') },
  { id: 'fr.phrase.border.staying-hotel', text: 'Dans un hôtel dans le centre-ville.', meaning: T('במלון במרכז העיר.', 'At a hotel in the city center.'),
    tip: T('התשובה ל-"איפה אתה מתאכסן?". שם המלון עדיף, אבל זה מספיק.', 'Answers “where are you staying?”. The hotel name is better, but this is enough.') },
  { id: 'fr.phrase.border.nothing-declare', text: 'Rien à déclarer.', meaning: T('אין לי מה להצהיר.', 'Nothing to declare.'),
    tip: T('המשפט הקבוע במכס. אומרים אותו רגוע.', 'The fixed customs line. Say it calmly.') },
  // hear — the border question-chain
  { id: 'fr.reply.border.passport-please', text: 'Passeport, s’il vous plaît.', meaning: T('דרכון, בבקשה.', 'Passport, please.') },
  { id: 'fr.reply.border.purpose', text: 'Quel est le motif de votre visite ?', meaning: T('מה מטרת הביקור?', "What's the purpose of your visit?") },
  { id: 'fr.reply.border.how-long', text: 'Vous restez combien de temps ?', meaning: T('לכמה זמן אתה נשאר?', 'How long are you staying?') },
  { id: 'fr.reply.border.where-staying', text: 'Où logez-vous ?', meaning: T('איפה אתה מתאכסן?', 'Where are you staying?') },
  { id: 'fr.reply.border.anything-declare', text: 'Quelque chose à déclarer ?', meaning: T('יש לך מה להצהיר?', 'Anything to declare?') },
  { id: 'fr.reply.border.enjoy', text: 'Bon séjour !', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.one-moment', 'fr.phrase.recovery.thank-you'),
];

const SCENE_BORDER: BootcampDialogue = {
  id: 'border-control',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Au suivant, s’il vous plaît. Passeport ?', tr: TR('Next, please. Passport?', 'הבא בתור, בבקשה. דרכון?'), he: 'הבא בתור, בבקשה. דרכון?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Voici mon passeport.', tr: TR('Here is my passport.', 'הנה הדרכון שלי.'), he: 'הנה הדרכון שלי.', itemId: 'fr.phrase.border.passport-here', correct: true, next: 'n2' },
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (כלי — לחפש את הדרכון)'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Pas de souci. Quand vous êtes prêt.', tr: TR("No rush. Whenever you're ready.", 'אין לחץ. מתי שתהיה מוכן.'), he: 'אין לחץ. מתי שתהיה מוכן.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Voici mon passeport.', tr: TR('Here is my passport.', 'הנה הדרכון שלי.'), he: 'הנה הדרכון שלי.', itemId: 'fr.phrase.border.passport-here', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Merci. Quel est le motif de votre visite ?', tr: TR("Thank you. What's the purpose of your visit?", 'תודה. מה מטרת הביקור?'), he: 'תודה. מה מטרת הביקור?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis en vacances.', tr: TR("I'm here on holiday.", 'אני כאן בחופשה.'), he: 'אני כאן בחופשה.', itemId: 'fr.phrase.border.on-holiday', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה? (לא הבנת? תשאל)'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Le — motif — de votre visite ?', tr: TR('The — purpose — of your visit?', 'מה — מטרת — הביקור?'), he: 'מה — מטרת — הביקור?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis en vacances.', tr: TR("I'm here on holiday.", 'אני כאן בחופשה.'), he: 'אני כאן בחופשה.', itemId: 'fr.phrase.border.on-holiday', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Très bien. Vous restez combien de temps ?', tr: TR('Lovely. How long are you staying?', 'נהדר. לכמה זמן אתה נשאר?'), he: 'נהדר. לכמה זמן אתה נשאר?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Pour deux semaines.', tr: TR('For two weeks.', 'לשבועיים.'), he: 'לשבועיים.', itemId: 'fr.phrase.border.two-weeks', correct: true, next: 'n4' },
      { en: 'Voici mon passeport.', tr: TR('Here is my passport.', 'הנה הדרכון שלי. (כבר נתת — הוא שאל משהו אחר)'), he: 'הנה הדרכון שלי.', itemId: 'fr.phrase.border.passport-here', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'J’ai votre passeport — je vous demande combien de temps vous restez.', tr: TR("I have your passport — I asked how long you're staying.", 'הדרכון אצלי — שאלתי לכמה זמן אתה נשאר.'), he: 'הדרכון אצלי — שאלתי לכמה זמן אתה נשאר.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Pour deux semaines.', tr: TR('For two weeks.', 'לשבועיים.'), he: 'לשבועיים.', itemId: 'fr.phrase.border.two-weeks', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Et où logez-vous ?', tr: TR('And where are you staying?', 'ואיפה אתה מתאכסן?'), he: 'ואיפה אתה מתאכסן?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Dans un hôtel dans le centre-ville.', tr: TR('At a hotel in the city center.', 'במלון במרכז העיר.'), he: 'במלון במרכז העיר.', itemId: 'fr.phrase.border.staying-hotel', correct: true, next: 'n5' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה. (בשלב הזה מותר!)'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'Où — logez — vous ?', tr: TR('Where — are you — staying?', 'איפה — אתה — מתאכסן?'), he: 'איפה — אתה — מתאכסן?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Dans un hôtel dans le centre-ville.', tr: TR('At a hotel in the city center.', 'במלון במרכז העיר.'), he: 'במלון במרכז העיר.', itemId: 'fr.phrase.border.staying-hotel', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'C’est presque fini. Quelque chose à déclarer ?', tr: TR('Almost done. Anything to declare?', 'כמעט סיימנו. יש לך מה להצהיר?'), he: 'כמעט סיימנו. יש לך מה להצהיר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Rien à déclarer.', tr: TR('Nothing to declare.', 'אין לי מה להצהיר.'), he: 'אין לי מה להצהיר.', itemId: 'fr.phrase.border.nothing-declare', correct: true, next: 'n6' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה! (מנומס — אבל תגיד קודם שאין לך מה להצהיר)'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: false, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', next: 'c5b', en: 'Ah — alors, quelque chose à déclarer ? Des marchandises ?', tr: TR('Ha — so, anything to declare? Any goods?', 'הא — אז, יש מה להצהיר? סחורה כלשהי?'), he: 'הא — אז, יש מה להצהיר? סחורה כלשהי?' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Rien à déclarer.', tr: TR('Nothing to declare.', 'אין לי מה להצהיר.'), he: 'אין לי מה להצהיר.', itemId: 'fr.phrase.border.nothing-declare', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Bienvenue, et bon séjour !', tr: TR('Welcome, and enjoy your stay!', 'ברוך הבא, ותיהנה מהשהות!'), he: 'ברוך הבא, ותיהנה מהשהות!' },
  ],
};

export const DAY11_FR: BootcampDayContent = {
  day: 11,
  title: T('שדה תעופה וגבול', 'Airport & Border'),
  items: DAY11_FR_ITEMS,
  dialogues: { 'border-control': SCENE_BORDER },
  introVideo: {
    src: '/videos/Fr_day11.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'fr',
    type: 'intro',
  },
  steps: [
    { kind: 'talk', icon: '🛂', title: T('משימה 11: שדה תעופה וגבול', 'Mission 11: Airport & Border'),
      body: [
        T('הרגע הכי מפחיד בטיול הוא גם הצפוי ביותר. פקיד הגבול שואל תמיד את אותן שאלות.', 'The scariest moment of the trip is also the most predictable. The border officer always asks the same questions.'),
        T('נכיר אותן מראש. אחר כך גבול זה בסך הכל תסריט שכבר קראת.', 'We’ll learn them in advance. After that, a border is just a script you’ve already read.'),
      ], cta: T('להתקרב לדלפק', 'Approach the counter') },
    { kind: 'tool', itemId: 'fr.phrase.border.passport-here', index: 1, total: 4, label: T('המשפט הפותח', 'The opener') },
    { kind: 'tool', itemId: 'fr.phrase.border.on-holiday', index: 2, total: 4, label: T('מטרת הביקור', 'Purpose of visit') },
    { kind: 'tool', itemId: 'fr.phrase.border.two-weeks', index: 3, total: 4, label: T('כמה זמן', 'How long') },
    { kind: 'tool', itemId: 'fr.phrase.border.staying-hotel', index: 4, total: 4, label: T('איפה מתאכסן', 'Where staying') },
    { kind: 'replies', saidItemId: 'fr.phrase.border.passport-here',
      replyIds: ['fr.reply.border.purpose', 'fr.reply.border.how-long', 'fr.reply.border.where-staying', 'fr.reply.border.anything-declare'] },
    { kind: 'receipt', text: T('אתה מזהה את כל שרשרת השאלות של פקיד הגבול — מראש.', 'You recognize the border officer’s whole question-chain — in advance.') },
    { kind: 'quiz', itemId: 'fr.reply.border.purpose', wrongIds: ['fr.reply.border.how-long', 'fr.reply.border.enjoy'] },
    { kind: 'quiz', itemId: 'fr.reply.border.where-staying', wrongIds: ['fr.reply.border.anything-declare', 'fr.reply.border.passport-please'] },
    { kind: 'dialogue', dialogueId: 'border-control' },
    { kind: 'receipt', text: T('עברת ביקורת גבול שלמה בצרפתית — דרכון, מטרה, משך, מקום, מכס.', 'You cleared a full border check in French — passport, purpose, duration, place, customs.') },
    { kind: 'swipe', itemIds: DAY11_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Et vous avez un billet de retour réservé pour votre vol de retour ?', tr: TR('And do you have a return ticket booked for your flight home at all?', 'ויש לך בכלל כרטיס חזור מוזמן לטיסה הביתה?'), he: 'ויש לך בכלל כרטיס חזור מוזמן לטיסה הביתה?' },
      correctItemId: 'fr.phrase.recovery.one-moment', wrongItemId: 'fr.phrase.border.two-weeks' },
    { kind: 'receipt', text: T('שאלה שלא ציפית לה — ולא קפאת. קנית שנייה עם כלי.', 'A question you didn’t expect — and you didn’t freeze. You bought a second with a tool.') },
    { kind: 'summary' },
  ],
};
