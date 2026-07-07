import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 22 — "Souvenirs & Gifts" (Phase 4 · City Life).
 * Low-stakes, joyful reps of decision language: browse without pressure, ask a price, ask for
 * another color, have it gift-wrapped, pay. Shops are friendly territory — you shop like a person.
 */
export const DAY22_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.gift.just-looking', text: "I'm just looking, thanks.", meaning: T('אני רק מסתכל, תודה.', "I'm just looking, thanks."),
    tip: T('מוריד את כל הלחץ. אתה מסתכל בשקט, בלי התחייבות.', 'Takes all the pressure off. You browse in peace, no commitment.') },
  { id: 'en.phrase.gift.how-much-this', text: 'How much is this one?', meaning: T('כמה זה עולה?', 'How much is this one?') },
  { id: 'en.phrase.gift.different-color', text: 'Do you have another color?', meaning: T('יש בצבע אחר?', 'Do you have another color?'),
    tip: T('התבנית: Do you have another ___? — מבקשת גרסה אחרת של כל דבר.', 'Template: Do you have another ___? — asks for a different version of anything.') },
  { id: 'en.phrase.gift.gift-wrap', text: 'Could you gift-wrap it?', meaning: T('אפשר לעטוף למתנה?', 'Could you gift-wrap it?') },
  { id: 'en.phrase.gift.take-this', text: "I'll take this one.", meaning: T('אני אקח את זה.', "I'll take this one."),
    tip: T('סוגר את הקנייה. בחירה, וגמרנו.', 'Closes the purchase. A choice, and you’re done.') },
  // hear — the shopkeeper's replies
  { id: 'en.reply.gift.help-find', text: 'Can I help you find anything?', meaning: T('לעזור לך למצוא משהו?', 'Can I help you find anything?') },
  { id: 'en.reply.gift.handmade', text: 'These are handmade.', meaning: T('אלה בעבודת יד.', 'These are handmade.') },
  { id: 'en.reply.gift.which-color', text: 'Which color would you like?', meaning: T('איזה צבע תרצה?', 'Which color would you like?') },
  { id: 'en.reply.gift.is-it-gift', text: 'Of course — is it a gift?', meaning: T('בטח — זה מתנה?', 'Of course — is it a gift?') },
  { id: 'en.reply.gift.last-one', text: 'This is the last one.', meaning: T('זה האחרון.', 'This is the last one.') },
  { id: 'en.reply.gift.thatll-be', text: "That'll be fifteen.", meaning: T('זה יוצא חמש-עשרה.', "That'll be fifteen.") },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_SOUVENIR: BootcampDialogue = {
  id: 'souvenir-shop',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hello! Can I help you find anything?', he: 'שלום! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "I'm just looking, thanks.", he: 'אני רק מסתכל, תודה.', itemId: 'en.phrase.gift.just-looking', correct: true, next: 'n2' },
      { en: 'Do you have another color?', he: 'יש בצבע אחר?', itemId: 'en.phrase.gift.different-color', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: 'We have a few colors — take your time and have a look.', he: 'יש לנו כמה צבעים — קח את הזמן ותסתכל.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: "I'm just looking, thanks.", he: 'אני רק מסתכל, תודה.', itemId: 'en.phrase.gift.just-looking', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Of course — these little bowls are handmade, very popular.', he: 'כמובן — הקערות הקטנות האלה בעבודת יד, מאוד פופולריות.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'How much is this one?', he: 'כמה זה עולה?', itemId: 'en.phrase.gift.how-much-this', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'These — are — handmade.', he: 'אלה — בעבודת — יד.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'How much is this one?', he: 'כמה זה עולה?', itemId: 'en.phrase.gift.how-much-this', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "That one's fifteen. Would you like it?", he: 'זה עולה חמש-עשרה. תרצה אותו?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: "I'll take this one.", he: 'אני אקח את זה.', itemId: 'en.phrase.gift.take-this', correct: true, next: 'n4' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'That one — is — fifteen.', he: 'זה — עולה — חמש-עשרה.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: "I'll take this one.", he: 'אני אקח את זה.', itemId: 'en.phrase.gift.take-this', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Lovely choice — is it a gift?', he: 'בחירה נהדרת — זה מתנה?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Could you gift-wrap it?', he: 'אפשר לעטוף למתנה?', itemId: 'en.phrase.gift.gift-wrap', correct: true, next: 'n5' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'All wrapped up — here you go. Enjoy, and safe travels!', he: 'הכל עטוף — בבקשה. תיהנה, ונסיעה טובה!' },
  ],
};

export const DAY22: BootcampDayContent = {
  day: 22,
  title: T('מזכרות ומתנות', 'Souvenirs & Gifts'),
  items: DAY22_ITEMS,
  dialogues: { 'souvenir-shop': SCENE_SOUVENIR },
  steps: [
    { kind: 'talk', icon: '🎁', title: T('משימה 22: מזכרות ומתנות', 'Mission 22: Souvenirs & Gifts'),
      body: [
        T('חנויות הן טריטוריה ידידותית. היום קונים מתנה — בלי לחץ ובלי מבוכה.', 'Shops are friendly territory. Today you buy a gift — no pressure, no awkwardness.'),
        T('להסתכל בשקט, לשאול מחיר, לבקש צבע אחר, לעטוף. אתה קונה כמו בן אדם.', 'Browse in peace, ask a price, ask for another color, get it wrapped. You shop like a person.'),
      ], cta: T('להיכנס לחנות', 'Walk into the shop') },
    { kind: 'tool', itemId: 'en.phrase.gift.just-looking', index: 1, total: 4, label: T('להסתכל בשקט', 'Browse in peace') },
    { kind: 'tool', itemId: 'en.phrase.gift.how-much-this', index: 2, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'en.phrase.gift.different-color', index: 3, total: 4, label: T('לבקש גרסה אחרת', 'Ask for another version') },
    { kind: 'tool', itemId: 'en.phrase.gift.gift-wrap', index: 4, total: 4, label: T('לעטוף למתנה', 'Have it wrapped') },
    { kind: 'replies', saidItemId: 'en.phrase.gift.just-looking',
      replyIds: ['en.reply.gift.help-find', 'en.reply.gift.handmade', 'en.reply.gift.which-color', 'en.reply.gift.is-it-gift'] },
    { kind: 'receipt', text: T('אתה מזהה את פניות המוכר — עזרה, מידע על המוצר, צבע, עטיפה.', 'You recognize the shopkeeper’s lines — offer to help, product info, color, wrapping.') },
    { kind: 'quiz', itemId: 'en.reply.gift.which-color', wrongIds: ['en.reply.gift.handmade', 'en.reply.gift.last-one'] },
    { kind: 'quiz', itemId: 'en.reply.gift.is-it-gift', wrongIds: ['en.reply.gift.help-find', 'en.reply.gift.thatll-be'] },
    { kind: 'dialogue', dialogueId: 'souvenir-shop' },
    { kind: 'receipt', text: T('בחרת מתנה, שאלת מחיר, וביקשת עטיפה — קנייה שלמה ונינוחה.', 'You chose a gift, asked a price, and had it wrapped — a full, relaxed purchase.') },
    { kind: 'swipe', itemIds: DAY22_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: "We've got a buy-two-get-one-free deal on today would you like to add a second one?", he: 'יש לנו היום מבצע קנה-שניים-קבל-אחד-חינם — תרצה להוסיף עוד אחד?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.gift.gift-wrap' },
    { kind: 'receipt', text: T('הצעת מבצע מהירה — וביקשת שיאט כדי להבין לפני שאתה מחליט.', 'A fast deal offer — and you asked them to slow down so you could understand before deciding.') },
    { kind: 'summary' },
  ],
};
