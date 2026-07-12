import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { frenchNumber } from './frenchNumbers.js';

/**
 * French Mission (day 3) — "Argent et chiffres" (Numbers & Money). French parallel of English day 3:
 * same objective (hear a price and pay without freezing), same step structure, same engine. French
 * target lines + `tr:{en,he}` glosses; `fr.*` ids. No French video yet → the hub Watch card shows
 * "Coming Soon". AI-drafted, neutral-polite (vous), pending native review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY3_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.money.how-much', text: 'C’est combien ?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('השאלה שפותחת כל עסקה. תלמד אותה עד הסוף.', 'The question that opens every transaction. Learn it cold.') },
  { id: 'fr.phrase.money.by-card', text: 'Par carte, s’il vous plaît.', meaning: T('בכרטיס, בבקשה.', 'By card, please.') },
  { id: 'fr.phrase.money.in-cash', text: 'En espèces.', meaning: T('במזומן.', 'In cash.') },
  { id: 'fr.phrase.money.too-expensive', text: 'C’est trop cher.', meaning: T('זה יקר מדי.', "That's too expensive."),
    tip: T('משפט מיקוח מנומס — ופתח למחיר טוב יותר.', 'A polite haggle — and an opening for a better price.') },
  // hear — prices at speed (the real skill)
  { id: 'fr.reply.money.five-euros', text: 'Ça fait cinq euros.', meaning: T('זה חמישה יורו.', "That's five euros."),
    tip: T('cinq = 5. תתרגל לזהות מספרים במשפט.', 'cinq = 5. Train to catch numbers inside a sentence.') },
  { id: 'fr.reply.money.ten-euros', text: 'Ça fera dix euros.', meaning: T('זה יעלה עשרה יורו.', "That'll be ten euros.") },
  { id: 'fr.reply.money.twenty-euros', text: 'Vingt euros, s’il vous plaît.', meaning: T('עשרים יורו, בבקשה.', 'Twenty euros, please.') },
  { id: 'fr.reply.money.fifteen-fifty', text: 'Quinze cinquante.', meaning: T('חמש עשרה וחצי (15.50).', 'Fifteen fifty (15.50).') },
  { id: 'fr.reply.money.cash-or-card', text: 'Espèces ou carte ?', meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'fr.reply.money.your-change', text: 'Voici votre monnaie.', meaning: T('הנה העודף שלך.', "Here's your change.") },
  { id: 'fr.reply.money.no-change', text: 'Désolé, je n’ai pas de monnaie.', meaning: T('סליחה, אין לי עודף.', "Sorry, I have no change.") },
  ...recoveryFr('fr.phrase.recovery.slowly', 'fr.phrase.recovery.repeat', 'fr.phrase.recovery.thank-you', 'fr.phrase.recovery.one-moment'),
];

const SCENE: BootcampDialogue = {
  id: 'market-stall',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Fraises fraîches ! Les meilleures du marché !', tr: TR('Fresh strawberries! Best in the market!', 'תותים טריים! הכי טובים בשוק!'), he: 'תותים טריים! הכי טובים בשוק!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'C’est combien ?', tr: TR('How much is it?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'fr.phrase.money.how-much', correct: true, next: 'n2' },
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', next: 'c1', en: 'Prenez votre temps, mon ami !', tr: TR('Take your time, my friend!', 'קח את הזמן, חבר!'), he: 'קח את הזמן, חבר!' },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Cinq euros la barquette, ou deux pour huit !', tr: TR('Five euros a punnet, or two for eight!', 'חמישה יורו קופסה, או שתיים בשמונה!'), he: 'חמישה יורו קופסה, או שתיים בשמונה!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה. (מספרים מהירים? עצור אותו!)'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r2' },
      { en: 'Une barquette, s’il vous plaît.', tr: TR('One punnet, please.', 'קופסה אחת, בבקשה.'), he: 'קופסה אחת, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Cinq — euros — une barquette.', tr: TR('Five — euros — one punnet.', 'חמישה — יורו — קופסה אחת.'), he: 'חמישה — יורו — קופסה אחת.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Une barquette, s’il vous plaît.', tr: TR('One punnet, please.', 'קופסה אחת, בבקשה.'), he: 'קופסה אחת, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Parfait. Ça fait cinq euros. Espèces ou carte ?', tr: TR("Perfect. That's five euros. Cash or card?", 'מצוין. זה חמישה יורו. מזומן או כרטיס?'), he: 'מצוין. זה חמישה יורו. מזומן או כרטיס?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Par carte, s’il vous plaît.', tr: TR('By card, please.', 'בכרטיס, בבקשה.'), he: 'בכרטיס, בבקשה.', itemId: 'fr.phrase.money.by-card', correct: true, next: 'n4' },
      { en: 'En espèces.', tr: TR('In cash.', 'במזומן.'), he: 'במזומן.', itemId: 'fr.phrase.money.in-cash', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Merci ! Bonne dégustation !', tr: TR('Thank you! Enjoy the strawberries!', 'תודה! תיהנה מהתותים!'), he: 'תודה! תיהנה מהתותים!' },
  ],
};

export const DAY3_FR: BootcampDayContent = {
  day: 3,
  title: T('כסף ומספרים', 'Numbers & Money'),
  items: DAY3_FR_ITEMS,
  dialogues: { 'market-stall': SCENE },
  introVideo: {
    src: '/videos/Fr_day3.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'fr',
    type: 'intro',
  },
  steps: [
    { kind: 'talk', icon: '💶', title: T('משימה 3: כסף ומספרים', 'Mission 3: Numbers & Money'),
      body: [
        T('הכישלון הכי נפוץ של מטייל: לא הבנת את המחיר, אז פשוט הושטת שטר גדול וקיווית.', 'The most common traveler failure: you didn’t catch the price, so you just held out a big bill and hoped.'),
        T('היום זה נגמר. אתה תשמע מחירים — ותבין אותם.', 'Today that ends. You’ll hear prices — and understand them.'),
      ], cta: T('מתחילים', 'Start') },
    // French numbers priming (Part 6) — the vigesimal 70/80/90 forms a traveler hears in prices.
    // Sourced from the tested `frenchNumber` builder so the mission and the module never drift.
    { kind: 'prime', label: T('לפני שנדבר: מספרים בצרפתית', 'Before we speak: French numbers'),
      intro: T('בצרפתית 70/80/90 בנויים אחרת — 60+10, 4×20, 4×20+10. תכיר אותם מראש.', 'In French 70/80/90 are built oddly — 60+10, 4×20, 4×20+10. Meet them first.'),
      words: [
        { text: frenchNumber(5), meaning: T('חמש (5)', 'five (5)') },
        { text: frenchNumber(10), meaning: T('עשר (10)', 'ten (10)') },
        { text: frenchNumber(20), meaning: T('עשרים (20)', 'twenty (20)') },
        { text: frenchNumber(70), meaning: T('שבעים (60+10)', 'seventy (60+10)') },
        { text: frenchNumber(80), meaning: T('שמונים (4×20)', 'eighty (4×20)') },
        { text: frenchNumber(90), meaning: T('תשעים (4×20+10)', 'ninety (4×20+10)') },
      ], buildFromItemId: 'fr.reply.money.five-euros' },
    { kind: 'tool', itemId: 'fr.phrase.money.how-much', index: 1, total: 3, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'fr.phrase.money.by-card', index: 2, total: 3, label: T('לשלם בכרטיס', 'Pay by card') },
    { kind: 'tool', itemId: 'fr.phrase.money.too-expensive', index: 3, total: 3, label: T('מיקוח מנומס', 'Polite haggle') },
    { kind: 'replies', saidItemId: 'fr.phrase.money.how-much',
      replyIds: ['fr.reply.money.five-euros', 'fr.reply.money.ten-euros', 'fr.reply.money.twenty-euros', 'fr.reply.money.cash-or-card'] },
    { kind: 'receipt', text: T('שמעת ארבעה מחירים שונים — וזיהית כל אחד.', 'You heard four different prices — and caught every one.') },
    { kind: 'quiz', itemId: 'fr.reply.money.twenty-euros', wrongIds: ['fr.reply.money.ten-euros', 'fr.reply.money.five-euros'] },
    { kind: 'quiz', itemId: 'fr.reply.money.your-change', wrongIds: ['fr.reply.money.no-change', 'fr.reply.money.cash-or-card'] },
    { kind: 'dialogue', dialogueId: 'market-stall' },
    { kind: 'receipt', text: T('קנית בשוק, הבנת את המחיר, ושילמת. עסקה שלמה.', 'You bought at the market, understood the price, and paid. A full transaction.') },
    { kind: 'swipe', itemIds: DAY3_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Ça fait quinze cinquante en tout, c’est bon pour vous ?', tr: TR('That comes to fifteen fifty altogether, is that alright?', 'זה יוצא חמש עשרה וחצי בסך הכל, זה בסדר?'), he: 'זה יוצא חמש עשרה וחצי בסך הכל, זה בסדר?' },
      correctItemId: 'fr.reply.money.fifteen-fifty', wrongItemId: 'fr.reply.money.five-euros' },
    { kind: 'receipt', text: T('מספר עם אגורות, מהיר — ותפסת אותו. זה כסף בשליטה.', 'A fast decimal price — and you caught it. That’s money, under control.') },
    { kind: 'summary' },
  ],
};
