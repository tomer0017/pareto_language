import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/** Mission 9 — "Shopping" (real objective: browse, try, decide, pay — in control). */
export const DAY9_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.shop.just-looking', text: "I'm just looking, thanks.", meaning: T('אני רק מסתכל, תודה.', "I'm just looking, thanks."),
    tip: T('משפט שקונה לך מרחב בלי לחץ מוכר.', 'A phrase that buys you space from a pushy seller.') },
  { id: 'en.phrase.shop.try-on', text: 'Can I try this on?', meaning: T('אפשר למדוד את זה?', 'Can I try this on?') },
  { id: 'en.phrase.shop.bigger', text: 'Do you have a bigger size?', meaning: T('יש מידה גדולה יותר?', 'Do you have a bigger size?'),
    tip: T('תבנית: Do you have a ___ size? (bigger/smaller).', 'Template: Do you have a ___ size? (bigger/smaller).') },
  { id: 'en.phrase.shop.take-it', text: "I'll take it.", meaning: T('אני אקח את זה.', "I'll take it."),
    tip: T('החלטת? שתי מילים סוגרות עסקה.', 'Decided? Two words close the deal.') },
  { id: 'en.phrase.shop.too-expensive', text: "It's a bit expensive.", meaning: T('זה קצת יקר.', "It's a bit expensive."),
    tip: T('פתח מנומס להנחה או לחלופה זולה יותר.', 'A polite opening for a discount or a cheaper option.') },
  // hear
  { id: 'en.reply.shop.can-i-help', text: 'Can I help you find anything?', meaning: T('אפשר לעזור לך למצוא משהו?', 'Can I help you find anything?') },
  { id: 'en.reply.shop.what-size', text: 'What size are you?', meaning: T('איזו מידה אתה?', 'What size are you?') },
  { id: 'en.reply.shop.fitting-room', text: 'The fitting room is over there.', meaning: T('חדר ההלבשה שם.', 'The fitting room is over there.') },
  { id: 'en.reply.shop.out-of-stock', text: "Sorry, that's out of stock.", meaning: T('סליחה, זה אזל מהמלאי.', "Sorry, that's out of stock.") },
  { id: 'en.reply.shop.on-sale', text: "It's on sale — twenty percent off.", meaning: T('זה במבצע — עשרים אחוז הנחה.', "It's on sale — twenty percent off.") },
  { id: 'en.reply.shop.anything-else', text: 'Anything else for you today?', meaning: T('עוד משהו היום?', 'Anything else for you today?') },
  ...recovery('en.phrase.recovery.slowly', 'en.phrase.recovery.repeat', 'en.phrase.recovery.thank-you', 'en.phrase.recovery.show-me'),
];

const SCENE: BootcampDialogue = {
  id: 'clothing-shop',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hi there! Can I help you find anything?', he: 'היי! אפשר לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "I'm just looking, thanks.", he: 'אני רק מסתכל, תודה.', itemId: 'en.phrase.shop.just-looking', correct: true, next: 'n2' },
      { en: 'Can I try this on?', he: 'אפשר למדוד את זה?', itemId: 'en.phrase.shop.try-on', correct: true, next: 'n3' },
    ] },
    { id: 'n2', who: 'npc', next: 'c1b', en: 'Of course, take your time. Let me know if you need a hand.', he: 'כמובן, קח את הזמן. תגיד אם אתה צריך עזרה.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Can I try this on?', he: 'אפשר למדוד את זה?', itemId: 'en.phrase.shop.try-on', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c2', en: 'Sure! What size are you? The fitting room is over there.', he: 'בטח! איזו מידה אתה? חדר ההלבשה שם.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Do you have a bigger size?', he: 'יש מידה גדולה יותר?', itemId: 'en.phrase.shop.bigger', correct: true, next: 'n4' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'What — size? Fitting room — there.', he: 'איזו — מידה? חדר הלבשה — שם.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Do you have a bigger size?', he: 'יש מידה גדולה יותר?', itemId: 'en.phrase.shop.bigger', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c3', en: 'Here you go, one size up. And good news — it’s on sale, twenty percent off!', he: 'הנה, מידה אחת גדולה יותר. ובשורה טובה — זה במבצע, עשרים אחוז הנחה!' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: "Great, I'll take it.", he: 'מעולה, אני אקח את זה.', itemId: 'en.phrase.shop.take-it', correct: true, next: 'n5' },
      { en: "It's a bit expensive.", he: 'זה קצת יקר.', itemId: 'en.phrase.shop.too-expensive', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Wonderful — I’ll ring you up at the till. Thank you!', he: 'נהדר — אחייב אותך בקופה. תודה!' },
  ],
};

export const DAY9: BootcampDayContent = {
  day: 9,
  title: T('קניות', 'Shopping'),
  items: DAY9_ITEMS,
  dialogues: { 'clothing-shop': SCENE },
  steps: [
    { kind: 'talk', icon: '🛍️', title: T('משימה 9: קניות', 'Mission 9: Shopping'),
      body: [
        T('חנות בגדים: להסתכל בשקט, למדוד, לבקש מידה, להחליט.', 'A clothing shop: browse in peace, try on, ask for a size, decide.'),
        T('לא צריך לקנות. צריך להרגיש בשליטה מול המוכר.', 'You don’t have to buy. You do have to feel in control with the seller.'),
      ], cta: T('להיכנס לחנות', 'Walk in') },
    { kind: 'tool', itemId: 'en.phrase.shop.just-looking', index: 1, total: 4, label: T('מרחב אישי', 'Personal space') },
    { kind: 'tool', itemId: 'en.phrase.shop.try-on', index: 2, total: 4, label: T('למדוד', 'Try it on') },
    { kind: 'tool', itemId: 'en.phrase.shop.bigger', index: 3, total: 4, label: T('מידה', 'Sizes') },
    { kind: 'tool', itemId: 'en.phrase.shop.take-it', index: 4, total: 4, label: T('להחליט', 'Decide') },
    { kind: 'replies', saidItemId: 'en.phrase.shop.try-on',
      replyIds: ['en.reply.shop.what-size', 'en.reply.shop.fitting-room', 'en.reply.shop.on-sale', 'en.reply.shop.anything-else'] },
    { kind: 'receipt', text: T('אתה מזהה מה מוכר שואל — מידה, חדר הלבשה, מבצע.', 'You recognize what a seller asks — size, fitting room, sale.') },
    { kind: 'quiz', itemId: 'en.reply.shop.out-of-stock', wrongIds: ['en.reply.shop.on-sale', 'en.reply.shop.fitting-room'] },
    { kind: 'dialogue', dialogueId: 'clothing-shop' },
    { kind: 'receipt', text: T('קניה שלמה: הסתכלת, מדדת, ביקשת מידה, החלטת. בשליטה מלאה.', 'A full shop: browsed, tried on, asked for a size, decided. Fully in control.') },
    { kind: 'swipe', itemIds: DAY9_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'That one is actually the last piece we have in that colour would you like me to hold it?', he: 'זה בעצם הפריט האחרון שיש לנו בצבע הזה — שאשמור לך אותו?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.reply.shop.what-size' },
    { kind: 'receipt', text: T('משפט ארוך ומהיר — ובמקום לקפוא, ביקשת הבהרה. זה בדיוק הרפלקס.', 'A long, fast sentence — and instead of freezing, you asked for clarity. Exactly the reflex.') },
    { kind: 'summary' },
  ],
};
void RECOVERY_ITEMS;
