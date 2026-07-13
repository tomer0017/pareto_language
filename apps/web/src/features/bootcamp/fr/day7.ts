import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 7 — "Taxi / VTC". French parallel of English day 7: same objective (destination →
 * price → stop, the address-show move), same step structure, same engine. French target lines +
 * `tr:{en,he}` glosses; `fr.*` ids. No French video yet. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY7_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.taxi.to-address', text: 'À cette adresse, s’il vous plaît.', meaning: T('לכתובת הזאת, בבקשה.', 'To this address, please.'),
    tip: T('הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון.', 'The taxi opener — say it and show the address on your phone.') },
  { id: 'fr.phrase.taxi.to-airport', text: 'À l’aéroport, s’il vous plaît.', meaning: T('לשדה התעופה, בבקשה.', 'To the airport, please.') },
  { id: 'fr.phrase.taxi.how-much', text: 'C’est combien pour le centre ?', meaning: T('כמה עד המרכז?', 'How much to the centre?'),
    tip: T('לשאול מחיר לפני שנוסעים — חוסך הפתעות.', 'Ask the price before you ride — no surprises.') },
  { id: 'fr.phrase.taxi.stop-here', text: 'Arrêtez-vous ici, s’il vous plaît.', meaning: T('עצור כאן, בבקשה.', 'Stop here, please.'),
    tip: T('העיתוי חשוב — תגיד את זה קצת לפני היעד.', 'Timing matters — say it just before the destination.') },
  { id: 'fr.phrase.taxi.keep-change', text: 'Gardez la monnaie.', meaning: T('תשאיר את העודף.', 'Keep the change.') },
  // hear
  { id: 'fr.reply.taxi.where-to', text: 'Où allez-vous ?', meaning: T('לאן?', 'Where to?') },
  { id: 'fr.reply.taxi.about-fifteen', text: 'C’est environ quinze euros.', meaning: T('זה בערך חמישה עשר יורו.', "It's about fifteen euros.") },
  { id: 'fr.reply.taxi.traffic', text: 'Il y a beaucoup de circulation en ce moment.', meaning: T('יש הרבה פקקים עכשיו.', "There's a lot of traffic right now.") },
  { id: 'fr.reply.taxi.here-good', text: 'Ici, ça va ?', meaning: T('כאן זה בסדר?', 'Is here okay?') },
  { id: 'fr.reply.taxi.first-visit', text: 'C’est votre première fois dans la ville ?', meaning: T('פעם ראשונה בעיר?', 'First time in the city?') },
  ...recoveryFr('fr.phrase.recovery.slowly', 'fr.phrase.recovery.show-me', 'fr.phrase.recovery.thank-you'),
];

const SCENE: BootcampDialogue = {
  id: 'taxi-ride',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Où allez-vous ?', tr: TR('Hello! Where to?', 'שלום! לאן?'), he: 'שלום! לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'À cette adresse, s’il vous plaît.', tr: TR('To this address, please.', 'לכתובת הזאת, בבקשה.'), he: 'לכתובת הזאת, בבקשה.', itemId: 'fr.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'À l’aéroport, s’il vous plaît.', tr: TR('To the airport, please.', 'לשדה התעופה, בבקשה.'), he: 'לשדה התעופה, בבקשה.', itemId: 'fr.phrase.taxi.to-airport', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'D’accord. Vous pensiez payer combien ?', tr: TR('Got it. How much did you expect to pay?', 'הבנתי. כמה חשבת לשלם?'), he: 'הבנתי. כמה חשבת לשלם?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'C’est combien pour le centre ?', tr: TR('How much to the centre?', 'כמה עד המרכז?'), he: 'כמה עד המרכז?', itemId: 'fr.phrase.taxi.how-much', correct: true, next: 'n3' },
      { en: 'Vous pouvez me montrer ?', tr: TR('Can you show me?', 'אתה יכול להראות לי? (בקש לראות את המונה)'), he: 'אתה יכול להראות לי?', itemId: 'fr.phrase.recovery.show-me', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'C’est environ quinze euros — il y a beaucoup de circulation en ce moment.', tr: TR("It's about fifteen euros — there's a lot of traffic right now.", 'זה בערך חמישה עשר יורו — יש הרבה פקקים עכשיו.'), he: 'זה בערך חמישה עשר יורו — יש הרבה פקקים עכשיו.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r3' },
      { en: 'D’accord, merci.', tr: TR('Okay, thank you.', 'בסדר, תודה.'), he: 'בסדר, תודה.', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Quinze — euros. La circulation.', tr: TR('Fifteen — euros. Traffic.', 'חמישה עשר — יורו. פקקים.'), he: 'חמישה עשר — יורו. פקקים.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'D’accord, merci.', tr: TR('Okay, thank you.', 'בסדר, תודה.'), he: 'בסדר, תודה.', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: '…On est presque arrivés. Ici, ça va ?', tr: TR('…We are almost there. Is here okay?', '…כמעט הגענו. כאן זה בסדר?'), he: '…כמעט הגענו. כאן זה בסדר?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Arrêtez-vous ici, s’il vous plaît. Gardez la monnaie.', tr: TR('Stop here, please. Keep the change.', 'עצור כאן, בבקשה. תשאיר את העודף.'), he: 'עצור כאן, בבקשה. תשאיר את העודף.', itemId: 'fr.phrase.taxi.stop-here', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Merci beaucoup ! Bon voyage !', tr: TR('Thank you very much! Enjoy your trip!', 'תודה רבה! תיהנה מהטיול!'), he: 'תודה רבה! תיהנה מהטיול!' },
  ],
};

export const DAY7_FR: BootcampDayContent = {
  day: 7,
  title: T('מונית', 'Taxi / Uber'),
  items: DAY7_FR_ITEMS,
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
        { text: 'adresse', meaning: T('כתובת', 'address'), emoji: '🏠' },
        { text: 'aéroport', meaning: T('שדה תעופה', 'airport'), emoji: '✈️' },
        { text: 'arrêter', meaning: T('לעצור', 'stop'), emoji: '✋' },
        { text: 'ici', meaning: T('כאן', 'here'), emoji: '📍' },
        { text: 'combien', meaning: T('כמה (עולה)', 'how much') },
      ], buildFromItemId: 'fr.phrase.taxi.to-address' },
    { kind: 'tool', itemId: 'fr.phrase.taxi.to-address', index: 1, total: 4, label: T('הפתיח', 'The opener') },
    { kind: 'tool', itemId: 'fr.phrase.taxi.how-much', index: 2, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'fr.phrase.taxi.stop-here', index: 3, total: 4, label: T('לעצור', 'Stop it') },
    { kind: 'tool', itemId: 'fr.phrase.taxi.keep-change', index: 4, total: 4, label: T('לסיים יפה', 'Finish smoothly') },
    { kind: 'replies', saidItemId: 'fr.phrase.taxi.to-address',
      replyIds: ['fr.reply.taxi.where-to', 'fr.reply.taxi.about-fifteen', 'fr.reply.taxi.here-good', 'fr.reply.taxi.first-visit'] },
    { kind: 'receipt', text: T('אתה מזהה מה נהג מונית שואל — לאן, כמה, כאן בסדר?', 'You recognize what a taxi driver asks — where to, how much, is here okay?') },
    { kind: 'quiz', itemId: 'fr.reply.taxi.about-fifteen', wrongIds: ['fr.reply.taxi.where-to', 'fr.reply.taxi.traffic'] },
    { kind: 'dialogue', dialogueId: 'taxi-ride' },
    { kind: 'receipt', text: T('נסיעה שלמה: יעד, מחיר, עצירה, תשלום. שרדת את המונית.', 'A full ride: destination, price, stop, payment. You survived the taxi.') },
    { kind: 'swipe', itemIds: DAY7_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Désolé, la route est barrée devant — ça vous va si je vous dépose au coin de la rue ?', tr: TR('Sorry the road ahead is closed is it alright if I drop you around the corner?', 'סליחה, הכביש קדימה חסום — בסדר שאוריד אותך מעבר לפינה?'), he: 'סליחה, הכביש קדימה חסום — בסדר שאוריד אותך מעבר לפינה?' },
      correctItemId: 'fr.reply.taxi.here-good', wrongItemId: 'fr.reply.taxi.where-to' },
    { kind: 'receipt', text: T('שינוי ברגע האחרון, מהיר — והבנת שהוא מציע להוריד אותך קרוב.', 'A fast last-minute change — and you understood he’s offering to drop you nearby.') },
    { kind: 'summary' },
  ],
};
