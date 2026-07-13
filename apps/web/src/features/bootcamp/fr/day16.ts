import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 16 — "Street food et marchés" (Street Food & Markets). French parallel of English
 * day 16: point, order, ask a price, haggle a little, eat like a local. `tr:{en,he}` glosses;
 * `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY16_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.street.one-of-those', text: 'Un de ceux-là, s’il vous plaît.', meaning: T('אחד מאלה, בבקשה.', 'One of those, please.'),
    tip: T('לא יודע את השם? מצביע ואומר Un de ceux-là. עובד בכל דוכן בעולם.', "Don't know the name? Point and say Un de ceux-là. Works at every stall on earth.") },
  { id: 'fr.phrase.street.how-much', text: 'C’est combien ?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('השאלה שאסור לוותר עליה בשוק. תמיד שואלים לפני.', 'The one question you never skip at a market. Always ask first.') },
  { id: 'fr.phrase.street.two-please', text: 'Deux, s’il vous plaît.', meaning: T('שניים, בבקשה.', 'Two, please.') },
  { id: 'fr.phrase.street.too-expensive', text: 'C’est un peu cher.', meaning: T('זה קצת יקר.', "That's a bit much."),
    tip: T('פתיח עדין להתמקחות. חיוך, לא ריב.', 'A gentle haggling opener. A smile, not a fight.') },
  { id: 'fr.phrase.street.take-it', text: 'Je le prends.', meaning: T('אני אקח.', "I'll take it."),
    tip: T('סוגר את העסקה. שתי מילים, וגמרנו.', 'Closes the deal. Two words, and you’re done.') },
  // hear — the vendor's calls
  { id: 'fr.reply.street.what-you-want', text: 'Vous voulez quoi ?', meaning: T('מה תרצה?', 'What would you like?') },
  { id: 'fr.reply.street.how-many', text: 'Combien ?', meaning: T('כמה?', 'How many?') },
  { id: 'fr.reply.street.five-each', text: 'Cinq chacun.', meaning: T('חמישה כל אחד.', 'Five each.') },
  { id: 'fr.reply.street.best-price', text: 'Pour vous — meilleur prix, huit.', meaning: T('בשבילך — מחיר הכי טוב, שמונה.', 'For you — best price, eight.') },
  { id: 'fr.reply.street.fresh-today', text: 'C’est frais aujourd’hui !', meaning: T('טרי היום!', "It's fresh today!") },
  { id: 'fr.reply.street.anything-else', text: 'Autre chose, mon ami ?', meaning: T('עוד משהו, חבר?', 'Anything else, my friend?') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.show-me', 'fr.phrase.recovery.thank-you'),
];

const SCENE_STALL: BootcampDialogue = {
  id: 'market-stall',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'C’est frais aujourd’hui, c’est frais ! Vous voulez quoi ?', tr: TR('Fresh today, fresh today! What would you like?', 'טרי היום, טרי היום! מה תרצה?'), he: 'טרי היום, טרי היום! מה תרצה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un de ceux-là, s’il vous plaît.', tr: TR('One of those, please.', 'אחד מאלה, בבקשה. (מצביע!)'), he: 'אחד מאלה, בבקשה.', itemId: 'fr.phrase.street.one-of-those', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Vous — voulez — quoi ?', tr: TR('What — would you — like?', 'מה — תרצה?'), he: 'מה — תרצה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Un de ceux-là, s’il vous plaît.', tr: TR('One of those, please.', 'אחד מאלה, בבקשה.'), he: 'אחד מאלה, בבקשה.', itemId: 'fr.phrase.street.one-of-those', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Ceux-là ? Excellent choix — combien ?', tr: TR('These? Great choice — how many?', 'אלה? בחירה מעולה — כמה?'), he: 'אלה? בחירה מעולה — כמה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Deux, s’il vous plaît.', tr: TR('Two, please.', 'שניים, בבקשה.'), he: 'שניים, בבקשה.', itemId: 'fr.phrase.street.two-please', correct: true, next: 'n3' },
      { en: 'C’est combien ?', tr: TR('How much is it?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'fr.phrase.street.how-much', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: 'Cinq chacun ! Alors — combien ?', tr: TR('Five each! So — how many?', 'חמישה כל אחד! אז — כמה?'), he: 'חמישה כל אחד! אז — כמה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Deux, s’il vous plaît.', tr: TR('Two, please.', 'שניים, בבקשה.'), he: 'שניים, בבקשה.', itemId: 'fr.phrase.street.two-please', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Deux — ça fait dix, mon ami.', tr: TR("Two — that's ten, my friend.", 'שניים — זה עשרה, חבר.'), he: 'שניים — זה עשרה, חבר.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'C’est un peu cher.', tr: TR("That's a bit much.", 'זה קצת יקר. (חיוך — מתמקחים)'), he: 'זה קצת יקר.', itemId: 'fr.phrase.street.too-expensive', correct: true, next: 'n4' },
      { en: 'Je le prends.', tr: TR("I'll take it.", 'אני אקח.'), he: 'אני אקח.', itemId: 'fr.phrase.street.take-it', correct: true, next: 'n5' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Ha ! Bon, bon — pour vous, huit. Meilleur prix !', tr: TR('Ha! Okay, okay — for you, eight. Best price!', 'הא! טוב, טוב — בשבילך, שמונה. מחיר הכי טוב!'), he: 'הא! טוב, טוב — בשבילך, שמונה. מחיר הכי טוב!' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Je le prends.', tr: TR("I'll take it.", 'אני אקח.'), he: 'אני אקח.', itemId: 'fr.phrase.street.take-it', correct: true, next: 'n5' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'Pour vous — huit. Meilleur prix !', tr: TR('For you — eight. Best price!', 'בשבילך — שמונה. מחיר הכי טוב!'), he: 'בשבילך — שמונה. מחיר הכי טוב!' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Je le prends.', tr: TR("I'll take it.", 'אני אקח.'), he: 'אני אקח.', itemId: 'fr.phrase.street.take-it', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Bon choix, mon ami ! Tenez — régalez-vous !', tr: TR('Good choice, my friend! Here you go — enjoy!', 'בחירה טובה, חבר! הנה לך — תיהנה!'), he: 'בחירה טובה, חבר! הנה לך — תיהנה!' },
  ],
};

export const DAY16_FR: BootcampDayContent = {
  day: 16,
  title: T('אוכל רחוב ושווקים', 'Street Food & Markets'),
  items: DAY16_FR_ITEMS,
  dialogues: { 'market-stall': SCENE_STALL },
  steps: [
    { kind: 'talk', icon: '🌮', title: T('משימה 16: אוכל רחוב ושווקים', 'Mission 16: Street Food & Markets'),
      body: [
        T('האוכל הכי טוב בטיול הוא בחוץ — בדוכן רועש, מהיר, בלי תפריט מסודר.', 'The best food on the trip is outside — a loud, fast stall with no tidy menu.'),
        T('לא צריך לדעת שמות. מצביעים, שואלים מחיר, מתמקחים קצת, ואוכלים כמו מקומי.', 'You don’t need the names. You point, ask a price, haggle a little, and eat like a local.'),
      ], cta: T('לגשת לדוכן', 'Walk up to the stall') },
    { kind: 'tool', itemId: 'fr.phrase.street.one-of-those', index: 1, total: 4, label: T('להזמין בלי שם', 'Order without the name') },
    { kind: 'tool', itemId: 'fr.phrase.street.how-much', index: 2, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'fr.phrase.street.too-expensive', index: 3, total: 4, label: T('להתמקח בעדינות', 'Haggle gently') },
    { kind: 'tool', itemId: 'fr.phrase.street.take-it', index: 4, total: 4, label: T('לסגור עסקה', 'Close the deal') },
    { kind: 'replies', saidItemId: 'fr.phrase.street.one-of-those',
      replyIds: ['fr.reply.street.how-many', 'fr.reply.street.five-each', 'fr.reply.street.best-price', 'fr.reply.street.anything-else'] },
    { kind: 'receipt', text: T('אתה מזהה את קריאות המוכר — כמות, מחיר, והצעת ההתמקחות.', 'You recognize the vendor’s calls — quantity, price, and the haggle offer.') },
    { kind: 'quiz', itemId: 'fr.reply.street.how-many', wrongIds: ['fr.reply.street.best-price', 'fr.reply.street.fresh-today'] },
    { kind: 'quiz', itemId: 'fr.reply.street.best-price', wrongIds: ['fr.reply.street.five-each', 'fr.reply.street.anything-else'] },
    { kind: 'dialogue', dialogueId: 'market-stall' },
    { kind: 'receipt', text: T('הזמנת בדוכן רועש, שאלת מחיר, התמקחת — וקיבלת מחיר טוב יותר.', 'You ordered at a loud stall, asked a price, haggled — and got a better price.') },
    { kind: 'swipe', itemIds: DAY16_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Vous le voulez avec la sauce piquante ou sans piment aujourd’hui, chef ?', tr: TR('You want it with the hot sauce or no spice today boss?', 'רוצה את זה עם הרוטב החריף או בלי חריף היום, בוס?'), he: 'רוצה את זה עם הרוטב החריף או בלי חריף היום, בוס?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.street.take-it' },
    { kind: 'receipt', text: T('המוכר ירה שאלה מהירה על רקע רעש — וביקשת שיאט. באוזניים מנצחים.', 'The vendor fired a fast question over the noise — and you asked him to slow down. Ears win.') },
    { kind: 'summary' },
  ],
};
