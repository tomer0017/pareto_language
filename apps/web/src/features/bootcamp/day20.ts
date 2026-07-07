import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 20 — "Tickets & Attractions" (Phase 4 · City Life).
 * The trip becomes a trip: buy tickets, ask opening hours, find a discount, catch the tour.
 * High-joy content, and it drills the one comprehension task hiding everywhere — time.
 */
export const DAY20_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.attr.two-tickets', text: 'Two tickets, please.', meaning: T('שני כרטיסים, בבקשה.', 'Two tickets, please.'),
    tip: T('התבנית: ___ tickets, please. שני מספרים וגמרנו.', 'Template: ___ tickets, please. Just a number, done.') },
  { id: 'en.phrase.attr.what-time-open', text: 'What time do you open?', meaning: T('באיזו שעה אתם פותחים?', 'What time do you open?'),
    tip: T('התבנית: What time do you ___? — פותחת כל שאלת שעה.', 'Template: What time do you ___? — opens any time question.') },
  { id: 'en.phrase.attr.discount', text: 'Is there a discount?', meaning: T('יש הנחה?', 'Is there a discount?'),
    tip: T('התבנית: Is there a ___? — בודקת אם קיים משהו. שאלה ששווה כסף.', 'Template: Is there a ___? — checks if something exists. A question worth money.') },
  { id: 'en.phrase.attr.guided-tour', text: 'Is there a guided tour?', meaning: T('יש סיור מודרך?', 'Is there a guided tour?') },
  // hear — ticket desk
  { id: 'en.reply.attr.how-many-tickets', text: 'How many tickets?', meaning: T('כמה כרטיסים?', 'How many tickets?') },
  { id: 'en.reply.attr.opens-nine', text: 'We open at nine.', meaning: T('אנחנו פותחים בתשע.', 'We open at nine.') },
  { id: 'en.reply.attr.last-entry', text: 'Last entry is at five.', meaning: T('כניסה אחרונה בחמש.', 'Last entry is at five.') },
  { id: 'en.reply.attr.tour-eleven', text: 'The tour starts at eleven.', meaning: T('הסיור מתחיל באחת-עשרה.', 'The tour starts at eleven.') },
  { id: 'en.reply.attr.students-half', text: 'Students get half price.', meaning: T('סטודנטים משלמים חצי מחיר.', 'Students get half price.') },
  { id: 'en.reply.attr.sold-out', text: 'Today is sold out.', meaning: T('היום אזל.', 'Today is sold out.') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_ATTRACTION: BootcampDialogue = {
  id: 'ticket-desk',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hi! Welcome to the museum. How many tickets?', he: 'היי! ברוך הבא למוזיאון. כמה כרטיסים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Two tickets, please.', he: 'שני כרטיסים, בבקשה.', itemId: 'en.phrase.attr.two-tickets', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'How — many — tickets?', he: 'כמה — כרטיסים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Two tickets, please.', he: 'שני כרטיסים, בבקשה.', itemId: 'en.phrase.attr.two-tickets', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: "Two — that's twenty euros. Anything else?", he: 'שניים — זה עשרים יורו. עוד משהו?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Is there a discount?', he: 'יש הנחה?', itemId: 'en.phrase.attr.discount', correct: true, next: 'n3' },
      { en: 'What time do you open?', he: 'באיזו שעה אתם פותחים?', itemId: 'en.phrase.attr.what-time-open', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: 'We open at nine, and last entry is at five.', he: 'אנחנו פותחים בתשע, וכניסה אחרונה בחמש.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Is there a discount?', he: 'יש הנחה?', itemId: 'en.phrase.attr.discount', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Students get half price — do you have a student card?', he: 'סטודנטים חצי מחיר — יש לך כרטיס סטודנט?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Students — get — half price.', he: 'סטודנטים — משלמים — חצי מחיר.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Here are your tickets. Anything else I can help with?', he: 'הנה הכרטיסים. עוד משהו שאוכל לעזור?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Is there a guided tour?', he: 'יש סיור מודרך?', itemId: 'en.phrase.attr.guided-tour', correct: true, next: 'n5' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'Anything — else?', he: 'עוד — משהו?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Is there a guided tour?', he: 'יש סיור מודרך?', itemId: 'en.phrase.attr.guided-tour', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Yes — the tour starts at eleven, in the main hall.', he: 'כן — הסיור מתחיל באחת-עשרה, באולם המרכזי.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'The tour — starts — at eleven.', he: 'הסיור — מתחיל — באחת-עשרה.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Enjoy the museum — and the tour!', he: 'תיהנה מהמוזיאון — ומהסיור!' },
  ],
};

export const DAY20: BootcampDayContent = {
  day: 20,
  title: T('כרטיסים ואטרקציות', 'Tickets & Attractions'),
  items: DAY20_ITEMS,
  dialogues: { 'ticket-desk': SCENE_ATTRACTION },
  steps: [
    { kind: 'talk', icon: '🎟️', title: T('משימה 20: כרטיסים ואטרקציות', 'Mission 20: Tickets & Attractions'),
      body: [
        T('הטיול נהיה טיול. היום קונים כרטיסים, שואלים שעות, מוצאים הנחה ותופסים סיור.', 'The trip becomes a trip. Today you buy tickets, ask hours, find a discount, and catch a tour.'),
        T('ומאחורי הכל מסתתרת מיומנות אחת: להבין שעות. היא נמצאת בכל מקום.', 'And behind it all hides one skill: understanding times. It’s everywhere.'),
      ], cta: T('לגשת לקופה', 'Step up to the ticket desk') },
    { kind: 'tool', itemId: 'en.phrase.attr.two-tickets', index: 1, total: 4, label: T('לקנות כרטיסים', 'Buy tickets') },
    { kind: 'tool', itemId: 'en.phrase.attr.what-time-open', index: 2, total: 4, label: T('לשאול שעות', 'Ask the hours') },
    { kind: 'tool', itemId: 'en.phrase.attr.discount', index: 3, total: 4, label: T('לבקש הנחה', 'Ask for a discount') },
    { kind: 'tool', itemId: 'en.phrase.attr.guided-tour', index: 4, total: 4, label: T('לשאול על סיור', 'Ask about a tour') },
    { kind: 'replies', saidItemId: 'en.phrase.attr.two-tickets',
      replyIds: ['en.reply.attr.how-many-tickets', 'en.reply.attr.opens-nine', 'en.reply.attr.students-half', 'en.reply.attr.tour-eleven'] },
    { kind: 'receipt', text: T('אתה מזהה תשובות של קופה — כמות, שעות, הנחות, זמני סיור.', 'You recognize a ticket desk’s answers — quantity, hours, discounts, tour times.') },
    { kind: 'quiz', itemId: 'en.reply.attr.opens-nine', wrongIds: ['en.reply.attr.last-entry', 'en.reply.attr.tour-eleven'] },
    { kind: 'quiz', itemId: 'en.reply.attr.students-half', wrongIds: ['en.reply.attr.how-many-tickets', 'en.reply.attr.sold-out'] },
    { kind: 'dialogue', dialogueId: 'ticket-desk' },
    { kind: 'receipt', text: T('קנית כרטיסים, גילית הנחה, ותפסת את זמני הסיור — הכל באנגלית.', 'You bought tickets, found a discount, and caught the tour times — all in English.') },
    { kind: 'swipe', itemIds: DAY20_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: "The main exhibit's closed today but the rooftop terrace is open would you prefer that instead?", he: 'התערוכה הראשית סגורה היום, אבל גג הצפייה פתוח — אתה מעדיף את זה במקום?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.attr.two-tickets' },
    { kind: 'receipt', text: T('שינוי תוכניות מפתיע ומהיר — וביקשת שיאט במקום להנהן בעיוורון.', 'A fast, surprise change of plans — and you asked them to slow down instead of nodding blindly.') },
    { kind: 'summary' },
  ],
};
