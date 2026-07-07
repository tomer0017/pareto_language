import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 16 — "Street Food & Markets" (Phase 3 · Food).
 * Noisy, fast, informal — the perfect stress inoculation. You point, you order, you ask a
 * price, you haggle a little, you eat like a local. The best food is outside, and you're there.
 */
export const DAY16_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.street.one-of-those', text: 'One of those, please.', meaning: T('אחד מאלה, בבקשה.', 'One of those, please.'),
    tip: T('לא יודע את השם? מצביע ואומר One of those. עובד בכל דוכן בעולם.', "Don't know the name? Point and say One of those. Works at every stall on earth.") },
  { id: 'en.phrase.street.how-much', text: 'How much is it?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('השאלה שאסור לוותר עליה בשוק. תמיד שואלים לפני.', 'The one question you never skip at a market. Always ask first.') },
  { id: 'en.phrase.street.two-please', text: 'Two, please.', meaning: T('שניים, בבקשה.', 'Two, please.') },
  { id: 'en.phrase.street.too-expensive', text: "That's a bit much.", meaning: T('זה קצת יקר.', "That's a bit much."),
    tip: T('פתיח עדין להתמקחות. חיוך, לא ריב.', 'A gentle haggling opener. A smile, not a fight.') },
  { id: 'en.phrase.street.take-it', text: "I'll take it.", meaning: T('אני אקח.', "I'll take it."),
    tip: T('סוגר את העסקה. שתי מילים, וגמרנו.', 'Closes the deal. Two words, and you’re done.') },
  // hear — the vendor's calls
  { id: 'en.reply.street.what-you-want', text: 'What would you like?', meaning: T('מה תרצה?', 'What would you like?') },
  { id: 'en.reply.street.how-many', text: 'How many?', meaning: T('כמה?', 'How many?') },
  { id: 'en.reply.street.five-each', text: 'Five each.', meaning: T('חמישה כל אחד.', 'Five each.') },
  { id: 'en.reply.street.best-price', text: 'For you — best price, eight.', meaning: T('בשבילך — מחיר הכי טוב, שמונה.', 'For you — best price, eight.') },
  { id: 'en.reply.street.fresh-today', text: "It's fresh today!", meaning: T('טרי היום!', "It's fresh today!") },
  { id: 'en.reply.street.anything-else', text: 'Anything else, my friend?', meaning: T('עוד משהו, חבר?', 'Anything else, my friend?') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.show-me', 'en.phrase.recovery.thank-you'),
];

const SCENE_STALL: BootcampDialogue = {
  id: 'market-stall',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Fresh today, fresh today! What would you like?', he: 'טרי היום, טרי היום! מה תרצה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'One of those, please.', he: 'אחד מאלה, בבקשה. (מצביע!)', itemId: 'en.phrase.street.one-of-those', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'What — would you — like?', he: 'מה — תרצה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'One of those, please.', he: 'אחד מאלה, בבקשה.', itemId: 'en.phrase.street.one-of-those', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'These? Great choice — how many?', he: 'אלה? בחירה מעולה — כמה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Two, please.', he: 'שניים, בבקשה.', itemId: 'en.phrase.street.two-please', correct: true, next: 'n3' },
      { en: 'How much is it?', he: 'כמה זה עולה?', itemId: 'en.phrase.street.how-much', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: 'Five each! So — how many?', he: 'חמישה כל אחד! אז — כמה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Two, please.', he: 'שניים, בבקשה.', itemId: 'en.phrase.street.two-please', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "Two — that's ten, my friend.", he: 'שניים — זה עשרה, חבר.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: "That's a bit much.", he: 'זה קצת יקר. (חיוך — מתמקחים)', itemId: 'en.phrase.street.too-expensive', correct: true, next: 'n4' },
      { en: "I'll take it.", he: 'אני אקח.', itemId: 'en.phrase.street.take-it', correct: true, next: 'n5' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Ha! Okay, okay — for you, eight. Best price!', he: 'הא! טוב, טוב — בשבילך, שמונה. מחיר הכי טוב!' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: "I'll take it.", he: 'אני אקח.', itemId: 'en.phrase.street.take-it', correct: true, next: 'n5' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'For you — eight. Best price!', he: 'בשבילך — שמונה. מחיר הכי טוב!' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: "I'll take it.", he: 'אני אקח.', itemId: 'en.phrase.street.take-it', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Good choice, my friend! Here you go — enjoy!', he: 'בחירה טובה, חבר! הנה לך — תיהנה!' },
  ],
};

export const DAY16: BootcampDayContent = {
  day: 16,
  title: T('אוכל רחוב ושווקים', 'Street Food & Markets'),
  items: DAY16_ITEMS,
  dialogues: { 'market-stall': SCENE_STALL },
  steps: [
    { kind: 'talk', icon: '🌮', title: T('משימה 16: אוכל רחוב ושווקים', 'Mission 16: Street Food & Markets'),
      body: [
        T('האוכל הכי טוב בטיול הוא בחוץ — בדוכן רועש, מהיר, בלי תפריט מסודר.', 'The best food on the trip is outside — a loud, fast stall with no tidy menu.'),
        T('לא צריך לדעת שמות. מצביעים, שואלים מחיר, מתמקחים קצת, ואוכלים כמו מקומי.', 'You don’t need the names. You point, ask a price, haggle a little, and eat like a local.'),
      ], cta: T('לגשת לדוכן', 'Walk up to the stall') },
    { kind: 'tool', itemId: 'en.phrase.street.one-of-those', index: 1, total: 4, label: T('להזמין בלי שם', 'Order without the name') },
    { kind: 'tool', itemId: 'en.phrase.street.how-much', index: 2, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'en.phrase.street.too-expensive', index: 3, total: 4, label: T('להתמקח בעדינות', 'Haggle gently') },
    { kind: 'tool', itemId: 'en.phrase.street.take-it', index: 4, total: 4, label: T('לסגור עסקה', 'Close the deal') },
    { kind: 'replies', saidItemId: 'en.phrase.street.one-of-those',
      replyIds: ['en.reply.street.how-many', 'en.reply.street.five-each', 'en.reply.street.best-price', 'en.reply.street.anything-else'] },
    { kind: 'receipt', text: T('אתה מזהה את קריאות המוכר — כמות, מחיר, והצעת ההתמקחות.', 'You recognize the vendor’s calls — quantity, price, and the haggle offer.') },
    { kind: 'quiz', itemId: 'en.reply.street.how-many', wrongIds: ['en.reply.street.best-price', 'en.reply.street.fresh-today'] },
    { kind: 'quiz', itemId: 'en.reply.street.best-price', wrongIds: ['en.reply.street.five-each', 'en.reply.street.anything-else'] },
    { kind: 'dialogue', dialogueId: 'market-stall' },
    { kind: 'receipt', text: T('הזמנת בדוכן רועש, שאלת מחיר, התמקחת — וקיבלת מחיר טוב יותר.', 'You ordered at a loud stall, asked a price, haggled — and got a better price.') },
    { kind: 'swipe', itemIds: DAY16_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'You want it with the hot sauce or no spice today boss?', he: 'רוצה את זה עם הרוטב החריף או בלי חריף היום, בוס?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.street.take-it' },
    { kind: 'receipt', text: T('המוכר ירה שאלה מהירה על רקע רעש — וביקשת שיאט. באוזניים מנצחים.', 'The vendor fired a fast question over the noise — and you asked him to slow down. Ears win.') },
    { kind: 'summary' },
  ],
};
