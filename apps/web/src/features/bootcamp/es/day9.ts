import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 9 — "Compras" (Shopping). Spanish parallel of English day 9: same objective (browse,
 * try, decide, pay — in control), same step structure, same engine. Spanish target lines +
 * `tr:{en,he}` glosses; `es.*` ids. No Spanish video yet. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY9_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.shop.just-looking', text: 'Solo estoy mirando, gracias.', meaning: T('אני רק מסתכל, תודה.', "I'm just looking, thanks."),
    tip: T('משפט שקונה לך מרחב בלי לחץ מוכר.', 'A phrase that buys you space from a pushy seller.') },
  { id: 'es.phrase.shop.try-on', text: '¿Puedo probarme esto?', meaning: T('אפשר למדוד את זה?', 'Can I try this on?') },
  { id: 'es.phrase.shop.bigger', text: '¿Tiene una talla más grande?', meaning: T('יש מידה גדולה יותר?', 'Do you have a bigger size?'),
    tip: T('תבנית: ¿Tiene una talla más ___ ? (grande/pequeña).', 'Template: ¿Tiene una talla más ___ ? (bigger/smaller).') },
  { id: 'es.phrase.shop.take-it', text: 'Me lo llevo.', meaning: T('אני אקח את זה.', "I'll take it."),
    tip: T('החלטת? שתי מילים סוגרות עסקה.', 'Decided? Two words close the deal.') },
  { id: 'es.phrase.shop.too-expensive', text: 'Es un poco caro.', meaning: T('זה קצת יקר.', "It's a bit expensive."),
    tip: T('פתח מנומס להנחה או לחלופה זולה יותר.', 'A polite opening for a discount or a cheaper option.') },
  // hear
  { id: 'es.reply.shop.can-i-help', text: '¿Le ayudo a encontrar algo?', meaning: T('אפשר לעזור לך למצוא משהו?', 'Can I help you find anything?') },
  { id: 'es.reply.shop.what-size', text: '¿Qué talla usa?', meaning: T('איזו מידה אתה?', 'What size are you?') },
  { id: 'es.reply.shop.fitting-room', text: 'El probador está allí.', meaning: T('חדר ההלבשה שם.', 'The fitting room is over there.') },
  { id: 'es.reply.shop.out-of-stock', text: 'Lo siento, está agotado.', meaning: T('סליחה, זה אזל מהמלאי.', "Sorry, that's out of stock.") },
  { id: 'es.reply.shop.on-sale', text: 'Está rebajado — un veinte por ciento de descuento.', meaning: T('זה במבצע — עשרים אחוז הנחה.', "It's on sale — twenty percent off.") },
  { id: 'es.reply.shop.anything-else', text: '¿Algo más para hoy?', meaning: T('עוד משהו היום?', 'Anything else for you today?') },
  ...recoveryEs('es.phrase.recovery.slowly', 'es.phrase.recovery.repeat', 'es.phrase.recovery.thank-you', 'es.phrase.recovery.show-me'),
];

const SCENE: BootcampDialogue = {
  id: 'clothing-shop',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿Le ayudo a encontrar algo?', tr: TR('Hi there! Can I help you find anything?', 'היי! אפשר לעזור לך למצוא משהו?'), he: 'היי! אפשר לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Solo estoy mirando, gracias.', tr: TR("I'm just looking, thanks.", 'אני רק מסתכל, תודה.'), he: 'אני רק מסתכל, תודה.', itemId: 'es.phrase.shop.just-looking', correct: true, next: 'n2' },
      { en: '¿Puedo probarme esto?', tr: TR('Can I try this on?', 'אפשר למדוד את זה?'), he: 'אפשר למדוד את זה?', itemId: 'es.phrase.shop.try-on', correct: true, next: 'n3' },
    ] },
    { id: 'n2', who: 'npc', next: 'c1b', en: 'Claro, tómese su tiempo. Avíseme si necesita ayuda.', tr: TR('Of course, take your time. Let me know if you need a hand.', 'כמובן, קח את הזמן. תגיד אם אתה צריך עזרה.'), he: 'כמובן, קח את הזמן. תגיד אם אתה צריך עזרה.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: '¿Puedo probarme esto?', tr: TR('Can I try this on?', 'אפשר למדוד את זה?'), he: 'אפשר למדוד את זה?', itemId: 'es.phrase.shop.try-on', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c2', en: '¡Claro! ¿Qué talla usa? El probador está allí.', tr: TR('Sure! What size are you? The fitting room is over there.', 'בטח! איזו מידה אתה? חדר ההלבשה שם.'), he: 'בטח! איזו מידה אתה? חדר ההלבשה שם.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Tiene una talla más grande?', tr: TR('Do you have a bigger size?', 'יש מידה גדולה יותר?'), he: 'יש מידה גדולה יותר?', itemId: 'es.phrase.shop.bigger', correct: true, next: 'n4' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: '¿Qué — talla? El probador — allí.', tr: TR('What — size? Fitting room — there.', 'איזו — מידה? חדר הלבשה — שם.'), he: 'איזו — מידה? חדר הלבשה — שם.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: '¿Tiene una talla más grande?', tr: TR('Do you have a bigger size?', 'יש מידה גדולה יותר?'), he: 'יש מידה גדולה יותר?', itemId: 'es.phrase.shop.bigger', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c3', en: 'Aquí tiene, una talla más. Y buena noticia — ¡está rebajado, un veinte por ciento de descuento!', tr: TR("Here you go, one size up. And good news — it's on sale, twenty percent off!", 'הנה, מידה אחת גדולה יותר. ובשורה טובה — זה במבצע, עשרים אחוז הנחה!'), he: 'הנה, מידה אחת גדולה יותר. ובשורה טובה — זה במבצע, עשרים אחוז הנחה!' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Genial, me lo llevo.', tr: TR("Great, I'll take it.", 'מעולה, אני אקח את זה.'), he: 'מעולה, אני אקח את זה.', itemId: 'es.phrase.shop.take-it', correct: true, next: 'n5' },
      { en: 'Es un poco caro.', tr: TR("It's a bit expensive.", 'זה קצת יקר.'), he: 'זה קצת יקר.', itemId: 'es.phrase.shop.too-expensive', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c3b', en: 'Lo entiendo — pero ya tiene un veinte por ciento de descuento. Es el mejor precio que le puedo hacer.', tr: TR("I understand — but it's already twenty percent off. That's the best price I can do.", 'אני מבין — אבל זה כבר בעשרים אחוז הנחה. זה המחיר הכי טוב שאני יכול לתת.'), he: 'אני מבין — אבל זה כבר בעשרים אחוז הנחה. זה המחיר הכי טוב שאני יכול לתת.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'De acuerdo, me lo llevo.', tr: TR("Okay, I'll take it.", 'בסדר, אני אקח את זה.'), he: 'בסדר, אני אקח את זה.', itemId: 'es.phrase.shop.take-it', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Perfecto — le cobro en la caja. ¡Gracias!', tr: TR("Wonderful — I'll ring you up at the till. Thank you!", 'נהדר — אחייב אותך בקופה. תודה!'), he: 'נהדר — אחייב אותך בקופה. תודה!' },
  ],
};

export const DAY9_ES: BootcampDayContent = {
  day: 9,
  title: T('קניות', 'Shopping'),
  items: DAY9_ES_ITEMS,
  dialogues: { 'clothing-shop': SCENE },
  steps: [
    { kind: 'talk', icon: '🛍️', title: T('משימה 9: קניות', 'Mission 9: Shopping'),
      body: [
        T('חנות בגדים: להסתכל בשקט, למדוד, לבקש מידה, להחליט.', 'A clothing shop: browse in peace, try on, ask for a size, decide.'),
        T('לא צריך לקנות. צריך להרגיש בשליטה מול המוכר.', 'You don’t have to buy. You do have to feel in control with the seller.'),
      ], cta: T('להיכנס לחנות', 'Walk in') },
    { kind: 'tool', itemId: 'es.phrase.shop.just-looking', index: 1, total: 4, label: T('מרחב אישי', 'Personal space') },
    { kind: 'tool', itemId: 'es.phrase.shop.try-on', index: 2, total: 4, label: T('למדוד', 'Try it on') },
    { kind: 'tool', itemId: 'es.phrase.shop.bigger', index: 3, total: 4, label: T('מידה', 'Sizes') },
    { kind: 'tool', itemId: 'es.phrase.shop.take-it', index: 4, total: 4, label: T('להחליט', 'Decide') },
    { kind: 'replies', saidItemId: 'es.phrase.shop.try-on',
      replyIds: ['es.reply.shop.what-size', 'es.reply.shop.fitting-room', 'es.reply.shop.on-sale', 'es.reply.shop.anything-else'] },
    { kind: 'receipt', text: T('אתה מזהה מה מוכר שואל — מידה, חדר הלבשה, מבצע.', 'You recognize what a seller asks — size, fitting room, sale.') },
    { kind: 'quiz', itemId: 'es.reply.shop.out-of-stock', wrongIds: ['es.reply.shop.on-sale', 'es.reply.shop.fitting-room'] },
    { kind: 'dialogue', dialogueId: 'clothing-shop' },
    { kind: 'receipt', text: T('קניה שלמה: הסתכלת, מדדת, ביקשת מידה, החלטת. בשליטה מלאה.', 'A full shop: browsed, tried on, asked for a size, decided. Fully in control.') },
    { kind: 'swipe', itemIds: DAY9_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Este es en realidad el último que nos queda en ese color — ¿quiere que se lo guarde?', tr: TR('That one is actually the last piece we have in that colour would you like me to hold it?', 'זה בעצם הפריט האחרון שיש לנו בצבע הזה — שאשמור לך אותו?'), he: 'זה בעצם הפריט האחרון שיש לנו בצבע הזה — שאשמור לך אותו?' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.reply.shop.what-size' },
    { kind: 'receipt', text: T('משפט ארוך ומהיר — ובמקום לקפוא, ביקשת הבהרה. זה בדיוק הרפלקס.', 'A long, fast sentence — and instead of freezing, you asked for clarity. Exactly the reflex.') },
    { kind: 'summary' },
  ],
};
