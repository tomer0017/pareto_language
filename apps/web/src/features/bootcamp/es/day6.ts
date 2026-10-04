import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { m07Flow } from '../practiceArrival.js';

/**
 * Spanish Mission 7 — "Taxi" (Taxi / Uber). Spanish parallel of English mission 6: same objective
 * (destination → price → stop, the address-show move), same step structure, same engine. Spanish
 * target lines + `tr:{en,he}` glosses; `es.*` ids. No Spanish video yet. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY6_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.taxi.to-address', text: 'A esta dirección, por favor.', meaning: T('לכתובת הזאת, בבקשה.', 'To this address, please.'),
    tip: T('הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון.', 'The taxi opener — say it and show the address on your phone.') },
  { id: 'es.phrase.taxi.to-airport', text: 'Al aeropuerto, por favor.', meaning: T('לשדה התעופה, בבקשה.', 'To the airport, please.') },
  { id: 'es.phrase.taxi.how-much', text: '¿Cuánto cuesta al centro?', meaning: T('כמה עד המרכז?', 'How much to the centre?'),
    tip: T('לשאול מחיר לפני שנוסעים — חוסך הפתעות.', 'Ask the price before you ride — no surprises.') },
  { id: 'es.phrase.taxi.stop-here', text: 'Pare aquí, por favor.', meaning: T('עצור כאן, בבקשה.', 'Stop here, please.'),
    tip: T('העיתוי חשוב — תגיד את זה קצת לפני היעד.', 'Timing matters — say it just before the destination.') },
  { id: 'es.phrase.taxi.keep-change', text: 'Quédese con el cambio.', meaning: T('תשאיר את העודף.', 'Keep the change.') },
  // hear
  { id: 'es.reply.taxi.where-to', text: '¿A dónde va?', meaning: T('לאן?', 'Where to?') },
  { id: 'es.reply.taxi.about-fifteen', text: 'Son unos quince euros.', meaning: T('זה בערך חמישה עשר יורו.', "It's about fifteen euros.") },
  { id: 'es.reply.taxi.traffic', text: 'Hay mucho tráfico ahora mismo.', meaning: T('יש הרבה פקקים עכשיו.', "There's a lot of traffic right now.") },
  { id: 'es.reply.taxi.here-good', text: '¿Aquí está bien?', meaning: T('כאן זה בסדר?', 'Is here okay?') },
  { id: 'es.reply.taxi.first-visit', text: '¿Es su primera vez en la ciudad?', meaning: T('פעם ראשונה בעיר?', 'First time in the city?') },
  ...recoveryEs('es.phrase.recovery.slowly', 'es.phrase.recovery.show-me', 'es.phrase.recovery.thank-you'),
];

const SCENE: BootcampDialogue = {
  id: 'taxi-ride',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿A dónde va?', tr: TR('Hello! Where to?', 'שלום! לאן?'), he: 'שלום! לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'A esta dirección, por favor.', tr: TR('To this address, please.', 'לכתובת הזאת, בבקשה.'), he: 'לכתובת הזאת, בבקשה.', itemId: 'es.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'Al aeropuerto, por favor.', tr: TR('To the airport, please.', 'לשדה התעופה, בבקשה.'), he: 'לשדה התעופה, בבקשה.', itemId: 'es.phrase.taxi.to-airport', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'De acuerdo. Sin problema — ¡vamos!', tr: TR('Got it. No problem — off we go!', 'הבנתי. אין בעיה — יוצאים!'), he: 'הבנתי. אין בעיה — יוצאים!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Cuánto cuesta al centro?', tr: TR('How much to the centre?', 'כמה עד המרכז?'), he: 'כמה עד המרכז?', itemId: 'es.phrase.taxi.how-much', correct: true, next: 'n3' },
      { en: '¿Me lo puede mostrar?', tr: TR('Can you show me?', 'אתה יכול להראות לי? (בקש לראות את המונה)'), he: 'אתה יכול להראות לי?', itemId: 'es.phrase.recovery.show-me', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'Son unos quince euros. Hay mucho tráfico ahora mismo.', tr: TR("It's about fifteen euros. There's a lot of traffic right now.", 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.'), he: 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Perdone, más despacio, por favor.', tr: TR('Sorry, please speak slowly.', 'סליחה, דבר לאט, בבקשה.'), he: 'סליחה, דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r3' },
      { en: 'De acuerdo, gracias.', tr: TR('Okay, thank you.', 'בסדר, תודה.'), he: 'בסדר, תודה.', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Claro. Unos quince euros. Hay mucho tráfico.', tr: TR("Sure. About fifteen euros. There's a lot of traffic.", 'בטח. בערך חמישה עשר יורו. יש הרבה פקקים.'), he: 'בטח. בערך חמישה עשר יורו. יש הרבה פקקים.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'De acuerdo, gracias.', tr: TR('Okay, thank you.', 'בסדר, תודה.'), he: 'בסדר, תודה.', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: '…Ya casi llegamos. ¿Aquí está bien?', tr: TR('…We are almost there. Is here okay?', '…כמעט הגענו. כאן זה בסדר?'), he: '…כמעט הגענו. כאן זה בסדר?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Pare aquí, por favor. Quédese con el cambio.', tr: TR('Stop here, please. Keep the change.', 'עצור כאן, בבקשה. תשאיר את העודף.'), he: 'עצור כאן, בבקשה. תשאיר את העודף.', itemId: 'es.phrase.taxi.stop-here', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: '¡Muchas gracias! ¡Buen viaje!', tr: TR('Thank you very much! Enjoy your trip!', 'תודה רבה! תיהנה מהטיול!'), he: 'תודה רבה! תיהנה מהטיול!' },
  ],
};

export const DAY6_ES: BootcampDayContent = {
  day: 6,
  title: T('מונית', 'Taxi / Uber'),
  items: DAY6_ES_ITEMS,
  dialogues: { 'taxi-ride': SCENE },
  steps: [
    { kind: 'talk', icon: '🚕', title: T('משימה 7: מונית', 'Mission 7: Taxi / Uber'),
      body: [
        T('שיחה של 60 שניות עם נהג — יעד, מחיר, עצירה. לחץ גבוה, זמן קצר.', 'A 60-second conversation with a driver — destination, price, stop. High pressure, short window.'),
        T('הסוד: תגיד את היעד ותראה את הכתובת בטלפון. גם אם קפאת — יש לך את הכלים.', 'The trick: say the destination and show the address on your phone. Even if you freeze — you have the tools.'),
      ], cta: T('להיכנס למונית', 'Get in') },
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('המילים שמכניסות אותך למונית ומוציאות אותך במקום הנכון.', 'The words that get you into the taxi and out at the right spot.'),
      words: [
        { text: 'dirección', meaning: T('כתובת', 'address'), emoji: '🏠' },
        { text: 'aeropuerto', meaning: T('שדה תעופה', 'airport'), emoji: '✈️' },
        { text: 'parar', meaning: T('לעצור', 'stop'), emoji: '✋' },
        { text: 'aquí', meaning: T('כאן', 'here'), emoji: '📍' },
        { text: 'cuánto', meaning: T('כמה (עולה)', 'how much') },
      ], buildFromItemId: 'es.phrase.taxi.to-address' },
    // From the key sentences onward the flow is shared by all languages: see practiceArrival.ts.
    ...m07Flow('es'),
  ],
};
