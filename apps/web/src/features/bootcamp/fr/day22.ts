import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 22 — "Souvenirs et cadeaux" (Souvenirs & Gifts). French parallel of English day 22:
 * browse without pressure, ask a price, ask for another color, have it gift-wrapped, pay.
 * `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY22_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.gift.just-looking', text: 'Je regarde seulement, merci.', meaning: T('אני רק מסתכל, תודה.', "I'm just looking, thanks."),
    tip: T('מוריד את כל הלחץ. אתה מסתכל בשקט, בלי התחייבות.', 'Takes all the pressure off. You browse in peace, no commitment.') },
  { id: 'fr.phrase.gift.how-much-this', text: 'C’est combien, celui-ci ?', meaning: T('כמה זה עולה?', 'How much is this one?') },
  { id: 'fr.phrase.gift.different-color', text: 'Vous l’avez dans une autre couleur ?', meaning: T('יש בצבע אחר?', 'Do you have another color?'),
    tip: T('התבנית: Vous l’avez dans un/une autre ___ ? — מבקשת גרסה אחרת של כל דבר.', 'Template: Vous l’avez dans un/une autre ___? — asks for a different version of anything.') },
  { id: 'fr.phrase.gift.gift-wrap', text: 'Vous pouvez faire un paquet cadeau ?', meaning: T('אפשר לעטוף למתנה?', 'Could you gift-wrap it?') },
  { id: 'fr.phrase.gift.take-this', text: 'Je prends celui-ci.', meaning: T('אני אקח את זה.', "I'll take this one."),
    tip: T('סוגר את הקנייה. בחירה, וגמרנו.', 'Closes the purchase. A choice, and you’re done.') },
  // hear — the shopkeeper's replies
  { id: 'fr.reply.gift.help-find', text: 'Je peux vous aider à trouver quelque chose ?', meaning: T('לעזור לך למצוא משהו?', 'Can I help you find anything?') },
  { id: 'fr.reply.gift.handmade', text: 'C’est fait main.', meaning: T('אלה בעבודת יד.', 'These are handmade.') },
  { id: 'fr.reply.gift.which-color', text: 'Vous voulez quelle couleur ?', meaning: T('איזה צבע תרצה?', 'Which color would you like?') },
  { id: 'fr.reply.gift.is-it-gift', text: 'Bien sûr — c’est pour offrir ?', meaning: T('בטח — זה מתנה?', 'Of course — is it a gift?') },
  { id: 'fr.reply.gift.last-one', text: 'C’est le dernier.', meaning: T('זה האחרון.', 'This is the last one.') },
  { id: 'fr.reply.gift.thatll-be', text: 'Ça fera quinze.', meaning: T('זה יוצא חמש-עשרה.', "That'll be fifteen.") },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE_SOUVENIR: BootcampDialogue = {
  id: 'souvenir-shop',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Je peux vous aider à trouver quelque chose ?', tr: TR('Hello! Can I help you find anything?', 'שלום! לעזור לך למצוא משהו?'), he: 'שלום! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je regarde seulement, merci.', tr: TR("I'm just looking, thanks.", 'אני רק מסתכל, תודה.'), he: 'אני רק מסתכל, תודה.', itemId: 'fr.phrase.gift.just-looking', correct: true, next: 'n2' },
      { en: 'Vous l’avez dans une autre couleur ?', tr: TR('Do you have another color?', 'יש בצבע אחר?'), he: 'יש בצבע אחר?', itemId: 'fr.phrase.gift.different-color', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: 'On a plusieurs couleurs — prenez votre temps pour regarder.', tr: TR('We have a few colors — take your time and have a look.', 'יש לנו כמה צבעים — קח את הזמן ותסתכל.'), he: 'יש לנו כמה צבעים — קח את הזמן ותסתכל.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Je regarde seulement, merci.', tr: TR("I'm just looking, thanks.", 'אני רק מסתכל, תודה.'), he: 'אני רק מסתכל, תודה.', itemId: 'fr.phrase.gift.just-looking', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Bien sûr — ces petits bols sont faits main, très populaires.', tr: TR('Of course — these little bowls are handmade, very popular.', 'כמובן — הקערות הקטנות האלה בעבודת יד, מאוד פופולריות.'), he: 'כמובן — הקערות הקטנות האלה בעבודת יד, מאוד פופולריות.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'C’est combien, celui-ci ?', tr: TR('How much is this one?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'fr.phrase.gift.how-much-this', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'C’est — fait — main.', tr: TR('These — are — handmade.', 'אלה — בעבודת — יד.'), he: 'אלה — בעבודת — יד.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'C’est combien, celui-ci ?', tr: TR('How much is this one?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'fr.phrase.gift.how-much-this', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Celui-là, c’est quinze. Vous le voulez ?', tr: TR("That one's fifteen. Would you like it?", 'זה עולה חמש-עשרה. תרצה אותו?'), he: 'זה עולה חמש-עשרה. תרצה אותו?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Je prends celui-ci.', tr: TR("I'll take this one.", 'אני אקח את זה.'), he: 'אני אקח את זה.', itemId: 'fr.phrase.gift.take-this', correct: true, next: 'n4' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Celui-là — c’est — quinze.', tr: TR('That one — is — fifteen.', 'זה — עולה — חמש-עשרה.'), he: 'זה — עולה — חמש-עשרה.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Je prends celui-ci.', tr: TR("I'll take this one.", 'אני אקח את זה.'), he: 'אני אקח את זה.', itemId: 'fr.phrase.gift.take-this', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Très bon choix — c’est pour offrir ?', tr: TR('Lovely choice — is it a gift?', 'בחירה נהדרת — זה מתנה?'), he: 'בחירה נהדרת — זה מתנה?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Vous pouvez faire un paquet cadeau ?', tr: TR('Could you gift-wrap it?', 'אפשר לעטוף למתנה?'), he: 'אפשר לעטוף למתנה?', itemId: 'fr.phrase.gift.gift-wrap', correct: true, next: 'n5' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'C’est emballé — voici. Régalez-vous, et bon voyage !', tr: TR('All wrapped up — here you go. Enjoy, and safe travels!', 'הכל עטוף — בבקשה. תיהנה, ונסיעה טובה!'), he: 'הכל עטוף — בבקשה. תיהנה, ונסיעה טובה!' },
  ],
};

export const DAY22_FR: BootcampDayContent = {
  day: 22,
  title: T('מזכרות ומתנות', 'Souvenirs & Gifts'),
  items: DAY22_FR_ITEMS,
  dialogues: { 'souvenir-shop': SCENE_SOUVENIR },
  steps: [
    { kind: 'talk', icon: '🎁', title: T('משימה 22: מזכרות ומתנות', 'Mission 22: Souvenirs & Gifts'),
      body: [
        T('חנויות הן טריטוריה ידידותית. היום קונים מתנה — בלי לחץ ובלי מבוכה.', 'Shops are friendly territory. Today you buy a gift — no pressure, no awkwardness.'),
        T('להסתכל בשקט, לשאול מחיר, לבקש צבע אחר, לעטוף. אתה קונה כמו בן אדם.', 'Browse in peace, ask a price, ask for another color, get it wrapped. You shop like a person.'),
      ], cta: T('להיכנס לחנות', 'Walk into the shop') },
    { kind: 'tool', itemId: 'fr.phrase.gift.just-looking', index: 1, total: 4, label: T('להסתכל בשקט', 'Browse in peace') },
    { kind: 'tool', itemId: 'fr.phrase.gift.how-much-this', index: 2, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'fr.phrase.gift.different-color', index: 3, total: 4, label: T('לבקש גרסה אחרת', 'Ask for another version') },
    { kind: 'tool', itemId: 'fr.phrase.gift.gift-wrap', index: 4, total: 4, label: T('לעטוף למתנה', 'Have it wrapped') },
    { kind: 'replies', saidItemId: 'fr.phrase.gift.just-looking',
      replyIds: ['fr.reply.gift.help-find', 'fr.reply.gift.handmade', 'fr.reply.gift.which-color', 'fr.reply.gift.is-it-gift'] },
    { kind: 'receipt', text: T('אתה מזהה את פניות המוכר — עזרה, מידע על המוצר, צבע, עטיפה.', 'You recognize the shopkeeper’s lines — offer to help, product info, color, wrapping.') },
    { kind: 'quiz', itemId: 'fr.reply.gift.which-color', wrongIds: ['fr.reply.gift.handmade', 'fr.reply.gift.last-one'] },
    { kind: 'quiz', itemId: 'fr.reply.gift.is-it-gift', wrongIds: ['fr.reply.gift.help-find', 'fr.reply.gift.thatll-be'] },
    { kind: 'dialogue', dialogueId: 'souvenir-shop' },
    { kind: 'receipt', text: T('בחרת מתנה, שאלת מחיר, וביקשת עטיפה — קנייה שלמה ונינוחה.', 'You chose a gift, asked a price, and had it wrapped — a full, relaxed purchase.') },
    { kind: 'swipe', itemIds: DAY22_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'On a une offre aujourd’hui, deux achetés le troisième offert — vous voulez en ajouter un deuxième ?', tr: TR("We've got a buy-two-get-one-free deal on today would you like to add a second one?", 'יש לנו היום מבצע קנה-שניים-קבל-אחד-חינם — תרצה להוסיף עוד אחד?'), he: 'יש לנו היום מבצע קנה-שניים-קבל-אחד-חינם — תרצה להוסיף עוד אחד?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.gift.gift-wrap' },
    { kind: 'receipt', text: T('הצעת מבצע מהירה — וביקשת שיאט כדי להבין לפני שאתה מחליט.', 'A fast deal offer — and you asked them to slow down so you could understand before deciding.') },
    { kind: 'summary' },
  ],
};
