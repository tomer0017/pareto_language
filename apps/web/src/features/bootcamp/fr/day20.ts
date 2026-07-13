import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 20 — "Billets et attractions" (Tickets & Attractions). French parallel of English
 * day 20: buy tickets, ask opening hours, find a discount, catch the tour — the hidden skill is
 * understanding times. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY20_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.attr.two-tickets', text: 'Deux billets, s’il vous plaît.', meaning: T('שני כרטיסים, בבקשה.', 'Two tickets, please.'),
    tip: T('התבנית: ___ billets, s’il vous plaît. שני מספרים וגמרנו.', 'Template: ___ billets, s’il vous plaît. Just a number, done.') },
  { id: 'fr.phrase.attr.what-time-open', text: 'Vous ouvrez à quelle heure ?', meaning: T('באיזו שעה אתם פותחים?', 'What time do you open?'),
    tip: T('התבנית: Vous ___ à quelle heure ? — פותחת כל שאלת שעה.', 'Template: Vous ___ à quelle heure? — opens any time question.') },
  { id: 'fr.phrase.attr.discount', text: 'Il y a une réduction ?', meaning: T('יש הנחה?', 'Is there a discount?'),
    tip: T('התבנית: Il y a un/une ___ ? — בודקת אם קיים משהו. שאלה ששווה כסף.', 'Template: Il y a un/une ___? — checks if something exists. A question worth money.') },
  { id: 'fr.phrase.attr.guided-tour', text: 'Il y a une visite guidée ?', meaning: T('יש סיור מודרך?', 'Is there a guided tour?') },
  // hear — ticket desk
  { id: 'fr.reply.attr.how-many-tickets', text: 'Combien de billets ?', meaning: T('כמה כרטיסים?', 'How many tickets?') },
  { id: 'fr.reply.attr.opens-nine', text: 'On ouvre à neuf heures.', meaning: T('אנחנו פותחים בתשע.', 'We open at nine.') },
  { id: 'fr.reply.attr.last-entry', text: 'Dernière entrée à dix-sept heures.', meaning: T('כניסה אחרונה בחמש.', 'Last entry is at five.') },
  { id: 'fr.reply.attr.tour-eleven', text: 'La visite commence à onze heures.', meaning: T('הסיור מתחיל באחת-עשרה.', 'The tour starts at eleven.') },
  { id: 'fr.reply.attr.students-half', text: 'Les étudiants paient demi-tarif.', meaning: T('סטודנטים משלמים חצי מחיר.', 'Students get half price.') },
  { id: 'fr.reply.attr.sold-out', text: 'Aujourd’hui, c’est complet.', meaning: T('היום אזל.', 'Today is sold out.') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE_ATTRACTION: BootcampDialogue = {
  id: 'ticket-desk',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Bienvenue au musée. Combien de billets ?', tr: TR('Hi! Welcome to the museum. How many tickets?', 'היי! ברוך הבא למוזיאון. כמה כרטיסים?'), he: 'היי! ברוך הבא למוזיאון. כמה כרטיסים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Deux billets, s’il vous plaît.', tr: TR('Two tickets, please.', 'שני כרטיסים, בבקשה.'), he: 'שני כרטיסים, בבקשה.', itemId: 'fr.phrase.attr.two-tickets', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Combien — de billets ?', tr: TR('How — many — tickets?', 'כמה — כרטיסים?'), he: 'כמה — כרטיסים?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Deux billets, s’il vous plaît.', tr: TR('Two tickets, please.', 'שני כרטיסים, בבקשה.'), he: 'שני כרטיסים, בבקשה.', itemId: 'fr.phrase.attr.two-tickets', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Deux — ça fait vingt euros. Autre chose ?', tr: TR("Two — that's twenty euros. Anything else?", 'שניים — זה עשרים יורו. עוד משהו?'), he: 'שניים — זה עשרים יורו. עוד משהו?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Il y a une réduction ?', tr: TR('Is there a discount?', 'יש הנחה?'), he: 'יש הנחה?', itemId: 'fr.phrase.attr.discount', correct: true, next: 'n3' },
      { en: 'Vous ouvrez à quelle heure ?', tr: TR('What time do you open?', 'באיזו שעה אתם פותחים?'), he: 'באיזו שעה אתם פותחים?', itemId: 'fr.phrase.attr.what-time-open', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: 'On ouvre à neuf heures, et la dernière entrée est à dix-sept heures.', tr: TR('We open at nine, and last entry is at five.', 'אנחנו פותחים בתשע, וכניסה אחרונה בחמש.'), he: 'אנחנו פותחים בתשע, וכניסה אחרונה בחמש.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Il y a une réduction ?', tr: TR('Is there a discount?', 'יש הנחה?'), he: 'יש הנחה?', itemId: 'fr.phrase.attr.discount', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Les étudiants paient demi-tarif — vous avez une carte étudiant ?', tr: TR('Students get half price — do you have a student card?', 'סטודנטים חצי מחיר — יש לך כרטיס סטודנט?'), he: 'סטודנטים חצי מחיר — יש לך כרטיס סטודנט?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Les étudiants — paient — demi-tarif.', tr: TR('Students — get — half price.', 'סטודנטים — משלמים — חצי מחיר.'), he: 'סטודנטים — משלמים — חצי מחיר.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Voici vos billets. Autre chose ?', tr: TR('Here are your tickets. Anything else I can help with?', 'הנה הכרטיסים. עוד משהו שאוכל לעזור?'), he: 'הנה הכרטיסים. עוד משהו שאוכל לעזור?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Il y a une visite guidée ?', tr: TR('Is there a guided tour?', 'יש סיור מודרך?'), he: 'יש סיור מודרך?', itemId: 'fr.phrase.attr.guided-tour', correct: true, next: 'n5' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'Autre — chose ?', tr: TR('Anything — else?', 'עוד — משהו?'), he: 'עוד — משהו?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Il y a une visite guidée ?', tr: TR('Is there a guided tour?', 'יש סיור מודרך?'), he: 'יש סיור מודרך?', itemId: 'fr.phrase.attr.guided-tour', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Oui — la visite commence à onze heures, dans le hall principal.', tr: TR('Yes — the tour starts at eleven, in the main hall.', 'כן — הסיור מתחיל באחת-עשרה, באולם המרכזי.'), he: 'כן — הסיור מתחיל באחת-עשרה, באולם המרכזי.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'La visite — commence — à onze heures.', tr: TR('The tour — starts — at eleven.', 'הסיור — מתחיל — באחת-עשרה.'), he: 'הסיור — מתחיל — באחת-עשרה.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Bonne visite du musée — et de la visite guidée !', tr: TR('Enjoy the museum — and the tour!', 'תיהנה מהמוזיאון — ומהסיור!'), he: 'תיהנה מהמוזיאון — ומהסיור!' },
  ],
};

export const DAY20_FR: BootcampDayContent = {
  day: 20,
  title: T('כרטיסים ואטרקציות', 'Tickets & Attractions'),
  items: DAY20_FR_ITEMS,
  dialogues: { 'ticket-desk': SCENE_ATTRACTION },
  steps: [
    { kind: 'talk', icon: '🎟️', title: T('משימה 20: כרטיסים ואטרקציות', 'Mission 20: Tickets & Attractions'),
      body: [
        T('הטיול נהיה טיול. היום קונים כרטיסים, שואלים שעות, מוצאים הנחה ותופסים סיור.', 'The trip becomes a trip. Today you buy tickets, ask hours, find a discount, and catch a tour.'),
        T('ומאחורי הכל מסתתרת מיומנות אחת: להבין שעות. היא נמצאת בכל מקום.', 'And behind it all hides one skill: understanding times. It’s everywhere.'),
      ], cta: T('לגשת לקופה', 'Step up to the ticket desk') },
    { kind: 'tool', itemId: 'fr.phrase.attr.two-tickets', index: 1, total: 4, label: T('לקנות כרטיסים', 'Buy tickets') },
    { kind: 'tool', itemId: 'fr.phrase.attr.what-time-open', index: 2, total: 4, label: T('לשאול שעות', 'Ask the hours') },
    { kind: 'tool', itemId: 'fr.phrase.attr.discount', index: 3, total: 4, label: T('לבקש הנחה', 'Ask for a discount') },
    { kind: 'tool', itemId: 'fr.phrase.attr.guided-tour', index: 4, total: 4, label: T('לשאול על סיור', 'Ask about a tour') },
    { kind: 'replies', saidItemId: 'fr.phrase.attr.two-tickets',
      replyIds: ['fr.reply.attr.how-many-tickets', 'fr.reply.attr.opens-nine', 'fr.reply.attr.students-half', 'fr.reply.attr.tour-eleven'] },
    { kind: 'receipt', text: T('אתה מזהה תשובות של קופה — כמות, שעות, הנחות, זמני סיור.', 'You recognize a ticket desk’s answers — quantity, hours, discounts, tour times.') },
    { kind: 'quiz', itemId: 'fr.reply.attr.opens-nine', wrongIds: ['fr.reply.attr.last-entry', 'fr.reply.attr.tour-eleven'] },
    { kind: 'quiz', itemId: 'fr.reply.attr.students-half', wrongIds: ['fr.reply.attr.how-many-tickets', 'fr.reply.attr.sold-out'] },
    { kind: 'dialogue', dialogueId: 'ticket-desk' },
    { kind: 'receipt', text: T('קנית כרטיסים, גילית הנחה, ותפסת את זמני הסיור — הכל בצרפתית.', 'You bought tickets, found a discount, and caught the tour times — all in French.') },
    { kind: 'swipe', itemIds: DAY20_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'L’exposition principale est fermée aujourd’hui, mais la terrasse sur le toit est ouverte — vous préférez ça à la place ?', tr: TR("The main exhibit's closed today but the rooftop terrace is open would you prefer that instead?", 'התערוכה הראשית סגורה היום, אבל גג הצפייה פתוח — אתה מעדיף את זה במקום?'), he: 'התערוכה הראשית סגורה היום, אבל גג הצפייה פתוח — אתה מעדיף את זה במקום?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.attr.two-tickets' },
    { kind: 'receipt', text: T('שינוי תוכניות מפתיע ומהיר — וביקשת שיאט במקום להנהן בעיוורון.', 'A fast, surprise change of plans — and you asked them to slow down instead of nodding blindly.') },
    { kind: 'summary' },
  ],
};
