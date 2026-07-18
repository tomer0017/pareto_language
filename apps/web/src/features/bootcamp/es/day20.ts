import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 20 — "Entradas y atracciones" (Tickets & Attractions). Spanish parallel of English
 * day 20: buy tickets, ask opening hours, find a discount, catch the tour — the hidden skill is
 * understanding times. `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY20_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.attr.two-tickets', text: 'Dos entradas, por favor.', meaning: T('שני כרטיסים, בבקשה.', 'Two tickets, please.'),
    tip: T('התבנית: ___ entradas, por favor. פשוט מספר, וגמרנו.', 'Template: ___ entradas, por favor. Just a number, done.') },
  { id: 'es.phrase.attr.what-time-open', text: '¿A qué hora abren?', meaning: T('באיזו שעה אתם פותחים?', 'What time do you open?'),
    tip: T('התבנית: ¿A qué hora ___ ? — פותחת כל שאלת שעה.', 'Template: ¿A qué hora ___ ? — opens any time question.') },
  { id: 'es.phrase.attr.discount', text: '¿Hay descuento?', meaning: T('יש הנחה?', 'Is there a discount?'),
    tip: T('התבנית: ¿Hay ___ ? — בודקת אם קיים משהו. שאלה ששווה כסף.', 'Template: ¿Hay ___ ? — checks if something exists. A question worth money.') },
  { id: 'es.phrase.attr.guided-tour', text: '¿Hay visita guiada?', meaning: T('יש סיור מודרך?', 'Is there a guided tour?') },
  // hear — ticket desk
  { id: 'es.reply.attr.how-many-tickets', text: '¿Cuántas entradas?', meaning: T('כמה כרטיסים?', 'How many tickets?') },
  { id: 'es.reply.attr.opens-nine', text: 'Abrimos a las nueve.', meaning: T('אנחנו פותחים בתשע.', 'We open at nine.') },
  { id: 'es.reply.attr.last-entry', text: 'La última entrada es a las cinco.', meaning: T('כניסה אחרונה בחמש.', 'Last entry is at five.') },
  { id: 'es.reply.attr.tour-eleven', text: 'La visita empieza a las once.', meaning: T('הסיור מתחיל באחת-עשרה.', 'The tour starts at eleven.') },
  { id: 'es.reply.attr.students-half', text: 'Los estudiantes pagan la mitad.', meaning: T('סטודנטים משלמים חצי מחיר.', 'Students get half price.') },
  { id: 'es.reply.attr.sold-out', text: 'Hoy está agotado.', meaning: T('היום אזל.', 'Today is sold out.') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_ATTRACTION: BootcampDialogue = {
  id: 'ticket-desk',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! Bienvenido al museo. ¿Cuántas entradas?', tr: TR('Hi! Welcome to the museum. How many tickets?', 'היי! ברוך הבא למוזיאון. כמה כרטיסים?'), he: 'היי! ברוך הבא למוזיאון. כמה כרטיסים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Dos entradas, por favor.', tr: TR('Two tickets, please.', 'שני כרטיסים, בבקשה.'), he: 'שני כרטיסים, בבקשה.', itemId: 'es.phrase.attr.two-tickets', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: '¿Cuántas — entradas?', tr: TR('How — many — tickets?', 'כמה — כרטיסים?'), he: 'כמה — כרטיסים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Dos entradas, por favor.', tr: TR('Two tickets, please.', 'שני כרטיסים, בבקשה.'), he: 'שני כרטיסים, בבקשה.', itemId: 'es.phrase.attr.two-tickets', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Dos — son veinte euros. ¿Algo más?', tr: TR("Two — that's twenty euros. Anything else?", 'שניים — זה עשרים יורו. עוד משהו?'), he: 'שניים — זה עשרים יורו. עוד משהו?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Hay descuento?', tr: TR('Is there a discount?', 'יש הנחה?'), he: 'יש הנחה?', itemId: 'es.phrase.attr.discount', correct: true, next: 'n3' },
      { en: '¿A qué hora abren?', tr: TR('What time do you open?', 'באיזו שעה אתם פותחים?'), he: 'באיזו שעה אתם פותחים?', itemId: 'es.phrase.attr.what-time-open', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: 'Abrimos a las nueve, y la última entrada es a las cinco.', tr: TR('We open at nine, and last entry is at five.', 'אנחנו פותחים בתשע, וכניסה אחרונה בחמש.'), he: 'אנחנו פותחים בתשע, וכניסה אחרונה בחמש.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: '¿Hay descuento?', tr: TR('Is there a discount?', 'יש הנחה?'), he: 'יש הנחה?', itemId: 'es.phrase.attr.discount', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Los estudiantes pagan la mitad — ¿tiene carné de estudiante?', tr: TR('Students get half price — do you have a student card?', 'סטודנטים חצי מחיר — יש לך כרטיס סטודנט?'), he: 'סטודנטים חצי מחיר — יש לך כרטיס סטודנט?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Los estudiantes — pagan — la mitad.', tr: TR('Students — get — half price.', 'סטודנטים — משלמים — חצי מחיר.'), he: 'סטודנטים — משלמים — חצי מחיר.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Aquí tiene sus entradas. ¿Algo más en lo que pueda ayudar?', tr: TR('Here are your tickets. Anything else I can help with?', 'הנה הכרטיסים. עוד משהו שאוכל לעזור?'), he: 'הנה הכרטיסים. עוד משהו שאוכל לעזור?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: '¿Hay visita guiada?', tr: TR('Is there a guided tour?', 'יש סיור מודרך?'), he: 'יש סיור מודרך?', itemId: 'es.phrase.attr.guided-tour', correct: true, next: 'n5' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: '¿Algo — más?', tr: TR('Anything — else?', 'עוד — משהו?'), he: 'עוד — משהו?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: '¿Hay visita guiada?', tr: TR('Is there a guided tour?', 'יש סיור מודרך?'), he: 'יש סיור מודרך?', itemId: 'es.phrase.attr.guided-tour', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Sí — la visita empieza a las once, en el vestíbulo principal.', tr: TR('Yes — the tour starts at eleven, in the main hall.', 'כן — הסיור מתחיל באחת-עשרה, באולם המרכזי.'), he: 'כן — הסיור מתחיל באחת-עשרה, באולם המרכזי.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'La visita — empieza — a las once.', tr: TR('The tour — starts — at eleven.', 'הסיור — מתחיל — באחת-עשרה.'), he: 'הסיור — מתחיל — באחת-עשרה.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: '¡Que disfrute del museo — y de la visita!', tr: TR('Enjoy the museum — and the tour!', 'תיהנה מהמוזיאון — ומהסיור!'), he: 'תיהנה מהמוזיאון — ומהסיור!' },
  ],
};

export const DAY20_ES: BootcampDayContent = {
  day: 20,
  title: T('כרטיסים ואטרקציות', 'Tickets & Attractions'),
  items: DAY20_ES_ITEMS,
  dialogues: { 'ticket-desk': SCENE_ATTRACTION },
  steps: [
    { kind: 'talk', icon: '🎟️', title: T('משימה 20: כרטיסים ואטרקציות', 'Mission 20: Tickets & Attractions'),
      body: [
        T('הטיול נהיה טיול. היום קונים כרטיסים, שואלים שעות, מוצאים הנחה ותופסים סיור.', 'The trip becomes a trip. Today you buy tickets, ask hours, find a discount, and catch a tour.'),
        T('ומאחורי הכל מסתתרת מיומנות אחת: להבין שעות. היא נמצאת בכל מקום.', 'And behind it all hides one skill: understanding times. It’s everywhere.'),
      ], cta: T('לגשת לקופה', 'Step up to the ticket desk') },
    { kind: 'tool', itemId: 'es.phrase.attr.two-tickets', index: 1, total: 4, label: T('לקנות כרטיסים', 'Buy tickets') },
    { kind: 'tool', itemId: 'es.phrase.attr.what-time-open', index: 2, total: 4, label: T('לשאול שעות', 'Ask the hours') },
    { kind: 'tool', itemId: 'es.phrase.attr.discount', index: 3, total: 4, label: T('לבקש הנחה', 'Ask for a discount') },
    { kind: 'tool', itemId: 'es.phrase.attr.guided-tour', index: 4, total: 4, label: T('לשאול על סיור', 'Ask about a tour') },
    { kind: 'replies', saidItemId: 'es.phrase.attr.two-tickets',
      replyIds: ['es.reply.attr.how-many-tickets', 'es.reply.attr.opens-nine', 'es.reply.attr.students-half', 'es.reply.attr.tour-eleven'] },
    { kind: 'receipt', text: T('אתה מזהה תשובות של קופה — כמות, שעות, הנחות, זמני סיור.', 'You recognize a ticket desk’s answers — quantity, hours, discounts, tour times.') },
    { kind: 'quiz', itemId: 'es.reply.attr.opens-nine', wrongIds: ['es.reply.attr.last-entry', 'es.reply.attr.tour-eleven'] },
    { kind: 'quiz', itemId: 'es.reply.attr.students-half', wrongIds: ['es.reply.attr.how-many-tickets', 'es.reply.attr.sold-out'] },
    { kind: 'dialogue', dialogueId: 'ticket-desk' },
    { kind: 'receipt', text: T('קנית כרטיסים, גילית הנחה, ותפסת את זמני הסיור — הכל בספרדית.', 'You bought tickets, found a discount, and caught the tour times — all in Spanish.') },
    { kind: 'swipe', itemIds: DAY20_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'La exposición principal está cerrada hoy, pero la terraza de la azotea está abierta — ¿prefiere eso en su lugar?', tr: TR("The main exhibit's closed today but the rooftop terrace is open would you prefer that instead?", 'התערוכה הראשית סגורה היום, אבל גג הצפייה פתוח — אתה מעדיף את זה במקום?'), he: 'התערוכה הראשית סגורה היום, אבל גג הצפייה פתוח — אתה מעדיף את זה במקום?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.phrase.attr.two-tickets' },
    { kind: 'receipt', text: T('שינוי תוכניות מפתיע ומהיר — וביקשת שיאט במקום להנהן בעיוורון.', 'A fast, surprise change of plans — and you asked them to slow down instead of nodding blindly.') },
    { kind: 'summary' },
  ],
};
