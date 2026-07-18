import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 22 — "Souvenirs y regalos" (Souvenirs & Gifts). Spanish parallel of English day 22:
 * browse without pressure, ask a price, ask for another color, have it gift-wrapped, pay.
 * `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY22_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.gift.just-looking', text: 'Solo estoy mirando, gracias.', meaning: T('אני רק מסתכל, תודה.', "I'm just looking, thanks."),
    tip: T('מוריד את כל הלחץ. אתה מסתכל בשקט, בלי התחייבות.', 'Takes all the pressure off. You browse in peace, no commitment.') },
  { id: 'es.phrase.gift.how-much-this', text: '¿Cuánto cuesta este?', meaning: T('כמה זה עולה?', 'How much is this one?') },
  { id: 'es.phrase.gift.different-color', text: '¿Lo tiene en otro color?', meaning: T('יש בצבע אחר?', 'Do you have another color?'),
    tip: T('התבנית: ¿Lo tiene en otro ___ ? — מבקשת גרסה אחרת של כל דבר.', 'Template: ¿Lo tiene en otro ___ ? — asks for a different version of anything.') },
  { id: 'es.phrase.gift.gift-wrap', text: '¿Me lo puede envolver para regalo?', meaning: T('אפשר לעטוף למתנה?', 'Could you gift-wrap it?') },
  { id: 'es.phrase.gift.take-this', text: 'Me llevo este.', meaning: T('אני אקח את זה.', "I'll take this one."),
    tip: T('סוגר את הקנייה. בחירה, וגמרנו.', 'Closes the purchase. A choice, and you’re done.') },
  // hear — the shopkeeper's replies
  { id: 'es.reply.gift.help-find', text: '¿Le ayudo a encontrar algo?', meaning: T('לעזור לך למצוא משהו?', 'Can I help you find anything?') },
  { id: 'es.reply.gift.handmade', text: 'Están hechos a mano.', meaning: T('אלה בעבודת יד.', 'These are handmade.') },
  { id: 'es.reply.gift.which-color', text: '¿Qué color quiere?', meaning: T('איזה צבע תרצה?', 'Which color would you like?') },
  { id: 'es.reply.gift.is-it-gift', text: 'Claro — ¿es para regalo?', meaning: T('בטח — זה מתנה?', 'Of course — is it a gift?') },
  { id: 'es.reply.gift.last-one', text: 'Es el último.', meaning: T('זה האחרון.', 'This is the last one.') },
  { id: 'es.reply.gift.thatll-be', text: 'Serán quince.', meaning: T('זה יוצא חמש-עשרה.', "That'll be fifteen.") },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_SOUVENIR: BootcampDialogue = {
  id: 'souvenir-shop',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿Le ayudo a encontrar algo?', tr: TR('Hello! Can I help you find anything?', 'שלום! לעזור לך למצוא משהו?'), he: 'שלום! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Solo estoy mirando, gracias.', tr: TR("I'm just looking, thanks.", 'אני רק מסתכל, תודה.'), he: 'אני רק מסתכל, תודה.', itemId: 'es.phrase.gift.just-looking', correct: true, next: 'n2' },
      { en: '¿Lo tiene en otro color?', tr: TR('Do you have another color?', 'יש בצבע אחר?'), he: 'יש בצבע אחר?', itemId: 'es.phrase.gift.different-color', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: 'Tenemos varios colores — tómese su tiempo para mirar.', tr: TR('We have a few colors — take your time and have a look.', 'יש לנו כמה צבעים — קח את הזמן ותסתכל.'), he: 'יש לנו כמה צבעים — קח את הזמן ותסתכל.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Solo estoy mirando, gracias.', tr: TR("I'm just looking, thanks.", 'אני רק מסתכל, תודה.'), he: 'אני רק מסתכל, תודה.', itemId: 'es.phrase.gift.just-looking', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Claro — estos cuencos pequeños están hechos a mano, muy populares.', tr: TR('Of course — these little bowls are handmade, very popular.', 'כמובן — הקערות הקטנות האלה בעבודת יד, מאוד פופולריות.'), he: 'כמובן — הקערות הקטנות האלה בעבודת יד, מאוד פופולריות.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Cuánto cuesta este?', tr: TR('How much is this one?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'es.phrase.gift.how-much-this', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Están — hechos — a mano.', tr: TR('These — are — handmade.', 'אלה — בעבודת — יד.'), he: 'אלה — בעבודת — יד.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: '¿Cuánto cuesta este?', tr: TR('How much is this one?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'es.phrase.gift.how-much-this', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Ese cuesta quince. ¿Lo quiere?', tr: TR("That one's fifteen. Would you like it?", 'זה עולה חמש-עשרה. תרצה אותו?'), he: 'זה עולה חמש-עשרה. תרצה אותו?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Me llevo este.', tr: TR("I'll take this one.", 'אני אקח את זה.'), he: 'אני אקח את זה.', itemId: 'es.phrase.gift.take-this', correct: true, next: 'n4' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Ese — cuesta — quince.', tr: TR('That one — is — fifteen.', 'זה — עולה — חמש-עשרה.'), he: 'זה — עולה — חמש-עשרה.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Me llevo este.', tr: TR("I'll take this one.", 'אני אקח את זה.'), he: 'אני אקח את זה.', itemId: 'es.phrase.gift.take-this', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Muy buena elección — ¿es para regalo?', tr: TR('Lovely choice — is it a gift?', 'בחירה נהדרת — זה מתנה?'), he: 'בחירה נהדרת — זה מתנה?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: '¿Me lo puede envolver para regalo?', tr: TR('Could you gift-wrap it?', 'אפשר לעטוף למתנה?'), he: 'אפשר לעטוף למתנה?', itemId: 'es.phrase.gift.gift-wrap', correct: true, next: 'n5' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Ya está envuelto — aquí tiene. ¡Que lo disfrute, y buen viaje!', tr: TR('All wrapped up — here you go. Enjoy, and safe travels!', 'הכל עטוף — בבקשה. תיהנה, ונסיעה טובה!'), he: 'הכל עטוף — בבקשה. תיהנה, ונסיעה טובה!' },
  ],
};

export const DAY22_ES: BootcampDayContent = {
  day: 22,
  title: T('מזכרות ומתנות', 'Souvenirs & Gifts'),
  items: DAY22_ES_ITEMS,
  dialogues: { 'souvenir-shop': SCENE_SOUVENIR },
  steps: [
    { kind: 'talk', icon: '🎁', title: T('משימה 22: מזכרות ומתנות', 'Mission 22: Souvenirs & Gifts'),
      body: [
        T('חנויות הן טריטוריה ידידותית. היום קונים מתנה — בלי לחץ ובלי מבוכה.', 'Shops are friendly territory. Today you buy a gift — no pressure, no awkwardness.'),
        T('להסתכל בשקט, לשאול מחיר, לבקש צבע אחר, לעטוף. אתה קונה כמו בן אדם.', 'Browse in peace, ask a price, ask for another color, get it wrapped. You shop like a person.'),
      ], cta: T('להיכנס לחנות', 'Walk into the shop') },
    { kind: 'tool', itemId: 'es.phrase.gift.just-looking', index: 1, total: 4, label: T('להסתכל בשקט', 'Browse in peace') },
    { kind: 'tool', itemId: 'es.phrase.gift.how-much-this', index: 2, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'es.phrase.gift.different-color', index: 3, total: 4, label: T('לבקש גרסה אחרת', 'Ask for another version') },
    { kind: 'tool', itemId: 'es.phrase.gift.gift-wrap', index: 4, total: 4, label: T('לעטוף למתנה', 'Have it wrapped') },
    { kind: 'replies', saidItemId: 'es.phrase.gift.just-looking',
      replyIds: ['es.reply.gift.help-find', 'es.reply.gift.handmade', 'es.reply.gift.which-color', 'es.reply.gift.is-it-gift'] },
    { kind: 'receipt', text: T('אתה מזהה את פניות המוכר — עזרה, מידע על המוצר, צבע, עטיפה.', 'You recognize the shopkeeper’s lines — offer to help, product info, color, wrapping.') },
    { kind: 'quiz', itemId: 'es.reply.gift.which-color', wrongIds: ['es.reply.gift.handmade', 'es.reply.gift.last-one'] },
    { kind: 'quiz', itemId: 'es.reply.gift.is-it-gift', wrongIds: ['es.reply.gift.help-find', 'es.reply.gift.thatll-be'] },
    { kind: 'dialogue', dialogueId: 'souvenir-shop' },
    { kind: 'receipt', text: T('בחרת מתנה, שאלת מחיר, וביקשת עטיפה — קנייה שלמה ונינוחה.', 'You chose a gift, asked a price, and had it wrapped — a full, relaxed purchase.') },
    { kind: 'swipe', itemIds: DAY22_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Hoy tenemos una oferta, dos y el tercero gratis — ¿quiere añadir un segundo?', tr: TR("We've got a buy-two-get-one-free deal on today would you like to add a second one?", 'יש לנו היום מבצע קנה-שניים-קבל-אחד-חינם — תרצה להוסיף עוד אחד?'), he: 'יש לנו היום מבצע קנה-שניים-קבל-אחד-חינם — תרצה להוסיף עוד אחד?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.phrase.gift.gift-wrap' },
    { kind: 'receipt', text: T('הצעת מבצע מהירה — וביקשת שיאט כדי להבין לפני שאתה מחליט.', 'A fast deal offer — and you asked them to slow down so you could understand before deciding.') },
    { kind: 'summary' },
  ],
};
