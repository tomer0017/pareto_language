import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 9 — "Shopping" (achats). French parallel of English day 9: same objective (browse,
 * try, decide, pay — in control), same step structure, same engine. French target lines +
 * `tr:{en,he}` glosses; `fr.*` ids. No French video yet. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY9_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.shop.just-looking', text: 'Je regarde seulement, merci.', meaning: T('אני רק מסתכל, תודה.', "I'm just looking, thanks."),
    tip: T('משפט שקונה לך מרחב בלי לחץ מוכר.', 'A phrase that buys you space from a pushy seller.') },
  { id: 'fr.phrase.shop.try-on', text: 'Je peux essayer ça ?', meaning: T('אפשר למדוד את זה?', 'Can I try this on?') },
  { id: 'fr.phrase.shop.bigger', text: 'Vous avez une taille au-dessus ?', meaning: T('יש מידה גדולה יותר?', 'Do you have a bigger size?'),
    tip: T('תבנית: Vous avez une taille ___ ? (au-dessus/en-dessous).', 'Template: Vous avez une taille ___ ? (au-dessus/en-dessous).') },
  { id: 'fr.phrase.shop.take-it', text: 'Je le prends.', meaning: T('אני אקח את זה.', "I'll take it."),
    tip: T('החלטת? שתי מילים סוגרות עסקה.', 'Decided? Two words close the deal.') },
  { id: 'fr.phrase.shop.too-expensive', text: 'C’est un peu cher.', meaning: T('זה קצת יקר.', "It's a bit expensive."),
    tip: T('פתח מנומס להנחה או לחלופה זולה יותר.', 'A polite opening for a discount or a cheaper option.') },
  // hear
  { id: 'fr.reply.shop.can-i-help', text: 'Je peux vous aider à trouver quelque chose ?', meaning: T('אפשר לעזור לך למצוא משהו?', 'Can I help you find anything?') },
  { id: 'fr.reply.shop.what-size', text: 'Vous faites quelle taille ?', meaning: T('איזו מידה אתה?', 'What size are you?') },
  { id: 'fr.reply.shop.fitting-room', text: 'La cabine d’essayage est là-bas.', meaning: T('חדר ההלבשה שם.', 'The fitting room is over there.') },
  { id: 'fr.reply.shop.out-of-stock', text: 'Désolé, c’est en rupture de stock.', meaning: T('סליחה, זה אזל מהמלאי.', "Sorry, that's out of stock.") },
  { id: 'fr.reply.shop.on-sale', text: 'C’est en solde — vingt pour cent de réduction.', meaning: T('זה במבצע — עשרים אחוז הנחה.', "It's on sale — twenty percent off.") },
  { id: 'fr.reply.shop.anything-else', text: 'Ce sera tout pour vous aujourd’hui ?', meaning: T('עוד משהו היום?', 'Anything else for you today?') },
  ...recoveryFr('fr.phrase.recovery.slowly', 'fr.phrase.recovery.repeat', 'fr.phrase.recovery.thank-you', 'fr.phrase.recovery.show-me'),
];

const SCENE: BootcampDialogue = {
  id: 'clothing-shop',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Je peux vous aider à trouver quelque chose ?', tr: TR('Hi there! Can I help you find anything?', 'היי! אפשר לעזור לך למצוא משהו?'), he: 'היי! אפשר לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je regarde seulement, merci.', tr: TR("I'm just looking, thanks.", 'אני רק מסתכל, תודה.'), he: 'אני רק מסתכל, תודה.', itemId: 'fr.phrase.shop.just-looking', correct: true, next: 'n2' },
      { en: 'Je peux essayer ça ?', tr: TR('Can I try this on?', 'אפשר למדוד את זה?'), he: 'אפשר למדוד את זה?', itemId: 'fr.phrase.shop.try-on', correct: true, next: 'n3' },
    ] },
    { id: 'n2', who: 'npc', next: 'c1b', en: 'Bien sûr, prenez votre temps. Dites-moi si vous avez besoin d’aide.', tr: TR('Of course, take your time. Let me know if you need a hand.', 'כמובן, קח את הזמן. תגיד אם אתה צריך עזרה.'), he: 'כמובן, קח את הזמן. תגיד אם אתה צריך עזרה.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Je peux essayer ça ?', tr: TR('Can I try this on?', 'אפשר למדוד את זה?'), he: 'אפשר למדוד את זה?', itemId: 'fr.phrase.shop.try-on', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c2', en: 'Bien sûr ! Vous faites quelle taille ? La cabine d’essayage est là-bas.', tr: TR('Sure! What size are you? The fitting room is over there.', 'בטח! איזו מידה אתה? חדר ההלבשה שם.'), he: 'בטח! איזו מידה אתה? חדר ההלבשה שם.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Vous avez une taille au-dessus ?', tr: TR('Do you have a bigger size?', 'יש מידה גדולה יותר?'), he: 'יש מידה גדולה יותר?', itemId: 'fr.phrase.shop.bigger', correct: true, next: 'n4' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Quelle — taille ? La cabine — là-bas.', tr: TR('What — size? Fitting room — there.', 'איזו — מידה? חדר הלבשה — שם.'), he: 'איזו — מידה? חדר הלבשה — שם.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Vous avez une taille au-dessus ?', tr: TR('Do you have a bigger size?', 'יש מידה גדולה יותר?'), he: 'יש מידה גדולה יותר?', itemId: 'fr.phrase.shop.bigger', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c3', en: 'Voilà, une taille au-dessus. Et bonne nouvelle — c’est en solde, vingt pour cent de réduction !', tr: TR("Here you go, one size up. And good news — it's on sale, twenty percent off!", 'הנה, מידה אחת גדולה יותר. ובשורה טובה — זה במבצע, עשרים אחוז הנחה!'), he: 'הנה, מידה אחת גדולה יותר. ובשורה טובה — זה במבצע, עשרים אחוז הנחה!' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Super, je le prends.', tr: TR("Great, I'll take it.", 'מעולה, אני אקח את זה.'), he: 'מעולה, אני אקח את זה.', itemId: 'fr.phrase.shop.take-it', correct: true, next: 'n5' },
      { en: 'C’est un peu cher.', tr: TR("It's a bit expensive.", 'זה קצת יקר.'), he: 'זה קצת יקר.', itemId: 'fr.phrase.shop.too-expensive', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c3b', en: 'Je comprends — mais c’est déjà vingt pour cent de réduction. C’est le meilleur prix que je peux faire.', tr: TR("I understand — but it's already twenty percent off. That's the best price I can do.", 'אני מבין — אבל זה כבר בעשרים אחוז הנחה. זה המחיר הכי טוב שאני יכול לתת.'), he: 'אני מבין — אבל זה כבר בעשרים אחוז הנחה. זה המחיר הכי טוב שאני יכול לתת.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'D’accord, je le prends.', tr: TR("Okay, I'll take it.", 'בסדר, אני אקח את זה.'), he: 'בסדר, אני אקח את זה.', itemId: 'fr.phrase.shop.take-it', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Parfait — je vous encaisse à la caisse. Merci !', tr: TR("Wonderful — I'll ring you up at the till. Thank you!", 'נהדר — אחייב אותך בקופה. תודה!'), he: 'נהדר — אחייב אותך בקופה. תודה!' },
  ],
};

export const DAY9_FR: BootcampDayContent = {
  day: 9,
  title: T('קניות', 'Shopping'),
  items: DAY9_FR_ITEMS,
  dialogues: { 'clothing-shop': SCENE },
  steps: [
    { kind: 'talk', icon: '🛍️', title: T('משימה 9: קניות', 'Mission 9: Shopping'),
      body: [
        T('חנות בגדים: להסתכל בשקט, למדוד, לבקש מידה, להחליט.', 'A clothing shop: browse in peace, try on, ask for a size, decide.'),
        T('לא צריך לקנות. צריך להרגיש בשליטה מול המוכר.', 'You don’t have to buy. You do have to feel in control with the seller.'),
      ], cta: T('להיכנס לחנות', 'Walk in') },
    { kind: 'tool', itemId: 'fr.phrase.shop.just-looking', index: 1, total: 4, label: T('מרחב אישי', 'Personal space') },
    { kind: 'tool', itemId: 'fr.phrase.shop.try-on', index: 2, total: 4, label: T('למדוד', 'Try it on') },
    { kind: 'tool', itemId: 'fr.phrase.shop.bigger', index: 3, total: 4, label: T('מידה', 'Sizes') },
    { kind: 'tool', itemId: 'fr.phrase.shop.take-it', index: 4, total: 4, label: T('להחליט', 'Decide') },
    { kind: 'replies', saidItemId: 'fr.phrase.shop.try-on',
      replyIds: ['fr.reply.shop.what-size', 'fr.reply.shop.fitting-room', 'fr.reply.shop.on-sale', 'fr.reply.shop.anything-else'] },
    { kind: 'receipt', text: T('אתה מזהה מה מוכר שואל — מידה, חדר הלבשה, מבצע.', 'You recognize what a seller asks — size, fitting room, sale.') },
    { kind: 'quiz', itemId: 'fr.reply.shop.out-of-stock', wrongIds: ['fr.reply.shop.on-sale', 'fr.reply.shop.fitting-room'] },
    { kind: 'dialogue', dialogueId: 'clothing-shop' },
    { kind: 'receipt', text: T('קניה שלמה: הסתכלת, מדדת, ביקשת מידה, החלטת. בשליטה מלאה.', 'A full shop: browsed, tried on, asked for a size, decided. Fully in control.') },
    { kind: 'swipe', itemIds: DAY9_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Celui-ci, c’est en fait le dernier qu’il nous reste dans cette couleur — vous voulez que je vous le garde ?', tr: TR('That one is actually the last piece we have in that colour would you like me to hold it?', 'זה בעצם הפריט האחרון שיש לנו בצבע הזה — שאשמור לך אותו?'), he: 'זה בעצם הפריט האחרון שיש לנו בצבע הזה — שאשמור לך אותו?' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.reply.shop.what-size' },
    { kind: 'receipt', text: T('משפט ארוך ומהיר — ובמקום לקפוא, ביקשת הבהרה. זה בדיוק הרפלקס.', 'A long, fast sentence — and instead of freezing, you asked for clarity. Exactly the reflex.') },
    { kind: 'summary' },
  ],
};
