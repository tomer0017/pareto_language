import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampItem, BootcampDialogue } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission (day 4) — "Café" (Coffee Shop), the deep-moment exemplar in French. Same objective
 * and full follow-up chain as English day 4 (order → size → milk/sugar → to eat → anything else →
 * pay → receipt → goodbye), same engine. French target lines + `tr:{en,he}` glosses; `fr.*` ids.
 * No French video yet → the hub Watch card shows "Coming Soon". AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY4_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.coffee.iced-coffee', text: 'Je voudrais un café glacé, s’il vous plaît.',
    meaning: T('אני רוצה קפה קר, בבקשה.', "I'd like an iced coffee, please."),
    tip: T('התבנית: Je voudrais ___, s’il vous plaît — עובדת על הכל.', 'The template: Je voudrais ___, s’il vous plaît — works for everything.') },
  { id: 'fr.phrase.coffee.to-go', text: 'À emporter, s’il vous plaît.',
    meaning: T('לקחת, בבקשה.', 'To go, please.') },
  { id: 'fr.phrase.coffee.no-sugar', text: 'Avec du lait, sans sucre.',
    meaning: T('עם חלב, בלי סוכר.', 'Milk, no sugar.'),
    tip: T('avec = עם · sans = בלי. שתי מילים ששולטות בכל הזמנה.', 'avec = with · sans = without — two words that control every order.') },
  { id: 'fr.phrase.coffee.croissant', text: 'Un croissant, s’il vous plaît.',
    meaning: T('קרואסון, בבקשה.', 'A croissant, please.'),
    tip: T('“croissant” — מאפה חמאה צרפתי. המילה האנגלית לקוחה מצרפתית.', '“croissant” is French — English borrowed the word.') },
  { id: 'fr.phrase.coffee.thats-all', text: 'C’est tout, merci.',
    meaning: T('זה הכל, תודה.', "That's all, thanks."),
    tip: T('סוגר כל הזמנה בנימוס.', 'Closes any order politely.') },
  { id: 'fr.phrase.coffee.card', text: 'Par carte, s’il vous plaît.',
    meaning: T('בכרטיס, בבקשה.', 'Card, please.') },
  // hear — the barista question-chain
  { id: 'fr.reply.coffee.what-can-i-get', text: 'Qu’est-ce que je vous sers ?', meaning: T('מה להביא לך?', 'What can I get you?') },
  { id: 'fr.reply.coffee.hot-or-iced', text: 'Chaud ou glacé ?', meaning: T('חם או קר?', 'Hot or iced?') },
  { id: 'fr.reply.coffee.here-or-to-go', text: 'Sur place ou à emporter ?', meaning: T('לשבת כאן או לקחת?', 'For here or to go?') },
  { id: 'fr.reply.coffee.medium-or-large', text: 'Moyen ou grand ?', meaning: T('בינוני או גדול?', 'Medium or large?') },
  { id: 'fr.reply.coffee.milk-sugar', text: 'Lait et sucre ?', meaning: T('חלב וסוכר?', 'Milk and sugar?') },
  { id: 'fr.reply.coffee.anything-to-eat', text: 'Quelque chose à manger ?', meaning: T('משהו לאכול?', 'Anything to eat?') },
  { id: 'fr.reply.coffee.anything-else', text: 'Vous désirez autre chose ?', meaning: T('עוד משהו?', 'Would you like anything else?') },
  { id: 'fr.reply.coffee.cash-or-card', text: 'Espèces ou carte ?', meaning: T('מזומן או כרטיס?', 'Cash or card?') },
  { id: 'fr.reply.coffee.receipt', text: 'Vous voulez le ticket ?', meaning: T('רוצה את הקבלה?', 'Would you like the receipt?') },
  { id: 'fr.reply.coffee.enjoy', text: 'Bonne journée !', meaning: T('שיהיה לך יום מעולה!', 'Enjoy your day!') },
];

const SCENE_BREAKFAST: BootcampDialogue = {
  id: 'breakfast-order',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Qu’est-ce que je vous sers ?', tr: TR('Good morning! What can I get you?', 'בוקר טוב! מה להביא לך?'), he: 'בוקר טוב! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je voudrais un café glacé, s’il vous plaît.', tr: TR("I'd like an iced coffee, please.", 'אני רוצה קפה קר, בבקשה.'), he: 'אני רוצה קפה קר, בבקשה.', itemId: 'fr.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה. (כלי הישרדות)'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Bien sûr — prenez votre temps !', tr: TR('Of course — take your time!', 'ברור — קח את הזמן!'), he: 'ברור — קח את הזמן!' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Je voudrais un café glacé, s’il vous plaît.', tr: TR("I'd like an iced coffee, please.", 'אני רוצה קפה קר, בבקשה.'), he: 'אני רוצה קפה קר, בבקשה.', itemId: 'fr.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Parfait ! Moyen ou grand ?', tr: TR('Sure! Medium or large?', 'סגור! בינוני או גדול?'), he: 'סגור! בינוני או גדול?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Moyen, s’il vous plaît.', tr: TR('Medium, please.', 'בינוני, בבקשה.'), he: 'בינוני, בבקשה.', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'MOYEN — ou GRAND ?', tr: TR('MEDIUM — or LARGE?', 'בינוני — או גדול?'), he: 'בינוני — או גדול?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Moyen, s’il vous plaît.', tr: TR('Medium, please.', 'בינוני, בבקשה.'), he: 'בינוני, בבקשה.', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Lait et sucre ?', tr: TR('Milk and sugar?', 'חלב וסוכר?'), he: 'חלב וסוכר?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Avec du lait, sans sucre.', tr: TR('Milk, no sugar.', 'עם חלב, בלי סוכר.'), he: 'עם חלב, בלי סוכר.', itemId: 'fr.phrase.coffee.no-sugar', correct: true, next: 'n4' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה! (רגע — הוא שאל שאלה…)'), he: 'תודה!', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'De rien ! Mais — du lait ? du sucre ?', tr: TR("You're welcome! But — milk? sugar?", 'בבקשה! אבל — חלב? סוכר?'), he: 'בבקשה! אבל — חלב? סוכר?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Avec du lait, sans sucre.', tr: TR('Milk, no sugar.', 'עם חלב, בלי סוכר.'), he: 'עם חלב, בלי סוכר.', itemId: 'fr.phrase.coffee.no-sugar', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Quelque chose à manger ?', tr: TR('Anything to eat?', 'משהו לאכול?'), he: 'משהו לאכול?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Un croissant, s’il vous plaît.', tr: TR('A croissant, please.', 'קרואסון, בבקשה.'), he: 'קרואסון, בבקשה.', itemId: 'fr.phrase.coffee.croissant', correct: true, next: 'n5' },
      { en: 'C’est tout, merci.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', itemId: 'fr.phrase.coffee.thats-all', correct: true, next: 'n6' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Excellent choix. Vous désirez autre chose ?', tr: TR('Great choice. Would you like anything else?', 'בחירה מצוינת. עוד משהו?'), he: 'בחירה מצוינת. עוד משהו?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'C’est tout, merci.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', itemId: 'fr.phrase.coffee.thats-all', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', fast: true, next: 'c6', en: 'Ça fait six euros cinquante. Espèces ou carte ?', tr: TR("That'll be six fifty. Cash or card?", 'שש חמישים בבקשה. מזומן או כרטיס?'), he: 'שש חמישים בבקשה. מזומן או כרטיס?' },
    { id: 'c6', who: 'you', en: '', he: '', choices: [
      { en: 'Par carte, s’il vous plaît.', tr: TR('Card, please.', 'בכרטיס, בבקשה.'), he: 'בכרטיס, בבקשה.', itemId: 'fr.phrase.coffee.card', correct: true, next: 'n7' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט בבקשה. (המספר ברח לך?)'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r6' },
    ] },
    { id: 'r6', who: 'npc', slow: true, next: 'c6b', en: 'Six — cinquante. Espèces, ou carte ?', tr: TR('Six — fifty. Cash, or card?', 'שש — חמישים. מזומן או כרטיס?'), he: 'שש — חמישים. מזומן או כרטיס?' },
    { id: 'c6b', who: 'you', en: '', he: '', choices: [
      { en: 'Par carte, s’il vous plaît.', tr: TR('Card, please.', 'בכרטיס, בבקשה.'), he: 'בכרטיס, בבקשה.', itemId: 'fr.phrase.coffee.card', correct: true, next: 'n7' },
    ] },
    { id: 'n7', who: 'npc', next: 'c7', en: 'Vous voulez le ticket ?', tr: TR('Would you like the receipt?', 'רוצה את הקבלה?'), he: 'רוצה את הקבלה?' },
    { id: 'c7', who: 'you', en: '', he: '', choices: [
      { en: 'Non, merci !', tr: TR('No, thank you!', 'לא, תודה!'), he: 'לא, תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n8' },
      { en: 'Oui, s’il vous plaît.', tr: TR('Yes, please.', 'כן, בבקשה.'), he: 'כן, בבקשה.', correct: true, next: 'n8' },
    ] },
    { id: 'n8', who: 'npc', end: true, en: 'Voilà — bonne journée !', tr: TR('Here you go — enjoy your day!', 'בבקשה — שיהיה יום מעולה!'), he: 'בבקשה — שיהיה יום מעולה!' },
  ],
};

const REUSED_RECOVERY = recoveryFr('fr.phrase.recovery.one-moment', 'fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you');

export const DAY4_FR: BootcampDayContent = {
  day: 4,
  title: T('בית קפה', 'Coffee Shop'),
  items: [...DAY4_FR_ITEMS, ...REUSED_RECOVERY],
  dialogues: { 'breakfast-order': SCENE_BREAKFAST },
  introVideo: {
    src: '/videos/Fr_day4.mp4',
    title: T('השיחה המלאה', 'Full conversation'),
    language: 'fr',
    type: 'intro',
  },
  steps: [
    { kind: 'talk', icon: '☕', title: T('משימה 4: בית קפה', 'Mission 4: Coffee Shop'),
      body: [
        T('היום לא לומדים "מילים על קפה". היום לומדים לצאת מבית קפה עם ארוחת בוקר ביד.', 'Today we don’t learn “coffee words”. Today you walk out of a café holding breakfast.'),
        T('הסוד: אחרי שאתה מזמין, הבריסטה שואל שאלות המשך. מי שמכיר אותן מראש — אף פעם לא קופא.', 'The secret: after you order, the barista fires follow-up questions. Know them in advance — never freeze.'),
      ], cta: T('להיכנס', 'Walk in') },
    // Vocabulary priming (Part 7), authored as French: avec/sans are the two order-control words.
    // avec + lait + sans + sucre literally compose "Avec du lait, sans sucre." — the assemble beat.
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('שש מילים שולטות בכל הזמנה בבית קפה.', 'Six words control every café order.'),
      words: [
        { text: 'café', meaning: T('קפה', 'coffee'), emoji: '☕' },
        { text: 'lait', meaning: T('חלב', 'milk'), emoji: '🥛' },
        { text: 'sucre', meaning: T('סוכר', 'sugar'), emoji: '🍬' },
        { text: 'moyen', meaning: T('בינוני', 'medium') },
        { text: 'avec', meaning: T('עם', 'with') },
        { text: 'sans', meaning: T('בלי', 'without') },
      ], buildFromItemId: 'fr.phrase.coffee.no-sugar' },
    { kind: 'tool', itemId: 'fr.phrase.coffee.iced-coffee', index: 1, total: 4, label: T('משפט הזהב', 'The golden template') },
    { kind: 'tool', itemId: 'fr.phrase.coffee.no-sugar', index: 2, total: 4, label: T('שליטה בהזמנה', 'Order control') },
    { kind: 'tool', itemId: 'fr.phrase.coffee.thats-all', index: 3, total: 4, label: T('הסוגר האוניברסלי', 'The universal closer') },
    { kind: 'tool', itemId: 'fr.phrase.coffee.card', index: 4, total: 4, label: T('סוגרים חשבון', 'Settling up') },
    { kind: 'replies', saidItemId: 'fr.phrase.coffee.iced-coffee',
      replyIds: ['fr.reply.coffee.here-or-to-go', 'fr.reply.coffee.medium-or-large', 'fr.reply.coffee.milk-sugar', 'fr.reply.coffee.anything-else'] },
    { kind: 'receipt', text: T('אתה כבר מזהה את ארבע שאלות ההמשך של כל בריסטה בעולם.', 'You now recognize the four follow-ups of every barista on earth.') },
    { kind: 'quiz', itemId: 'fr.reply.coffee.cash-or-card', wrongIds: ['fr.reply.coffee.anything-to-eat', 'fr.reply.coffee.receipt'] },
    { kind: 'quiz', itemId: 'fr.reply.coffee.anything-to-eat', wrongIds: ['fr.reply.coffee.hot-or-iced', 'fr.reply.coffee.enjoy'] },
    { kind: 'dialogue', dialogueId: 'breakfast-order' },
    { kind: 'receipt', text: T('הזמנת ארוחת בוקר שלמה: שתייה, גודל, חלב, מאפה, תשלום. הכל.', 'You ordered a full breakfast: drink, size, milk, pastry, payment. All of it.') },
    { kind: 'swipe', itemIds: [...DAY4_FR_ITEMS, ...REUSED_RECOVERY].map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Désolé, on n’a plus de croissants — un muffin à la place, ça vous va ?', tr: TR('Sorry, we are out of croissants — would a muffin be okay instead?', 'סליחה, נגמרו הקרואסונים — מאפין במקום זה בסדר?'), he: 'סליחה, נגמרו הקרואסונים — מאפין במקום זה בסדר?' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.phrase.coffee.card' },
    { kind: 'receipt', text: T('הפתעה מחוץ לתסריט — והגבת עם כלי. זה בדיוק מה שקורה בעולם האמיתי.', 'An off-script surprise — and you answered with a tool. Exactly how real life works.') },
    { kind: 'summary' },
  ],
};
