import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 17 — "Supermarché" (Supermarket). French parallel of English day 17: find it, weigh
 * it, pay for it — self-checkout included, zero dependence on anyone. `tr:{en,he}` glosses; `fr.*`
 * ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY17_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.super.where-is', text: 'Où est le lait ?', meaning: T('איפה החלב?', 'Where is the milk?'),
    tip: T('התבנית: Où est le/la ___ ? — מוצאת כל מוצר בכל חנות.', 'Template: Où est le/la ___ ? — finds any product in any shop.') },
  { id: 'fr.phrase.super.do-you-have', text: 'Vous avez du pain ?', meaning: T('יש לכם לחם?', 'Do you have bread?'),
    tip: T('התבנית: Vous avez ___ ? — בודקת אם קיים במלאי.', 'Template: Vous avez ___ ? — checks if it’s in stock.') },
  { id: 'fr.phrase.super.just-this', text: 'Juste ça, merci.', meaning: T('רק את זה, תודה.', 'Just this, thanks.') },
  { id: 'fr.phrase.super.need-bag', text: 'Je peux avoir un sac ?', meaning: T('אפשר שקית?', 'Could I get a bag?') },
  // hear — signs and cashier lines
  { id: 'fr.reply.super.aisle-three', text: 'C’est dans l’allée trois.', meaning: T('זה במעבר שלוש.', "It's in aisle three.") },
  { id: 'fr.reply.super.over-there', text: 'Là-bas, sur la gauche.', meaning: T('שם, משמאל.', 'Over there, on the left.') },
  { id: 'fr.reply.super.weigh-it', text: 'Vous devez d’abord le peser.', meaning: T('צריך לשקול קודם.', 'You need to weigh it first.') },
  { id: 'fr.reply.super.bag-q', text: 'Vous avez besoin d’un sac ?', meaning: T('צריך שקית?', 'Do you need a bag?') },
  { id: 'fr.reply.super.card-here', text: 'Insérez votre carte ici.', meaning: T('הכנס את הכרטיס כאן.', 'Insert your card here.') },
  { id: 'fr.reply.super.sold-out', text: 'Désolé, c’est épuisé.', meaning: T('סליחה, אזל המלאי.', "Sorry, we're sold out.") },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.show-me', 'fr.phrase.recovery.thank-you'),
];

const SCENE_SUPER: BootcampDialogue = {
  id: 'supermarket',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Je peux vous aider à trouver quelque chose ?', tr: TR('Hi there! Can I help you find something?', 'היי! לעזור לך למצוא משהו?'), he: 'היי! לעזור לך למצוא משהו?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Où est le lait ?', tr: TR('Where is the milk?', 'איפה החלב?'), he: 'איפה החלב?', itemId: 'fr.phrase.super.where-is', correct: true, next: 'n2' },
      { en: 'Vous avez du pain ?', tr: TR('Do you have bread?', 'יש לכם לחם?'), he: 'יש לכם לחם?', itemId: 'fr.phrase.super.do-you-have', correct: true, next: 'n1b' },
    ] },
    { id: 'n1b', who: 'npc', next: 'c1b', en: 'Du pain ? Oui — frais de ce matin, dans l’allée une.', tr: TR('Bread? Yes — fresh this morning, in aisle one.', 'לחם? כן — טרי מהבוקר, במעבר אחת.'), he: 'לחם? כן — טרי מהבוקר, במעבר אחת.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Où est le lait ?', tr: TR('Where is the milk?', 'איפה החלב?'), he: 'איפה החלב?', itemId: 'fr.phrase.super.where-is', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Le lait est dans l’allée trois, sur la gauche.', tr: TR("The milk is in aisle three, on the left.", 'החלב במעבר שלוש, משמאל.'), he: 'החלב במעבר שלוש, משמאל.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Allée — trois — sur la gauche.', tr: TR('Aisle — three — on the left.', 'מעבר — שלוש — משמאל.'), he: 'מעבר — שלוש — משמאל.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'À la caisse — juste ça ? Vous devez d’abord peser les fruits.', tr: TR("At the checkout — just these? You'll need to weigh the fruit first.", 'בקופה — רק אלה? צריך לשקול קודם את הפירות.'), he: 'בקופה — רק אלה? צריך לשקול קודם את הפירות.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Vous pouvez me montrer ?', tr: TR('Can you show me?', 'אתה יכול להראות לי? (כלי — כשמילים לא מספיקות)'), he: 'אתה יכול להראות לי?', itemId: 'fr.phrase.recovery.show-me', correct: true, next: 'r3' },
      { en: 'Juste ça, merci.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'fr.phrase.super.just-this', correct: true, next: 'n4' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Bien sûr — posez-le ici, appuyez sur l’image, voilà.', tr: TR('Of course — put it here, press the picture, done.', 'בטח — שים כאן, לחץ על התמונה, גמרנו.'), he: 'בטח — שים כאן, לחץ על התמונה, גמרנו.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Juste ça, merci.', tr: TR('Just this, thanks.', 'רק את זה, תודה.'), he: 'רק את זה, תודה.', itemId: 'fr.phrase.super.just-this', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Vous avez besoin d’un sac ?', tr: TR('Do you need a bag?', 'צריך שקית?'), he: 'צריך שקית?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Je peux avoir un sac ?', tr: TR('Could I get a bag?', 'אפשר שקית?'), he: 'אפשר שקית?', itemId: 'fr.phrase.super.need-bag', correct: true, next: 'n5' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Insérez votre carte ici… c’est bon. Bonne journée !', tr: TR('Insert your card here… all done. Have a nice day!', 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!'), he: 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!' },
  ],
};

export const DAY17_FR: BootcampDayContent = {
  day: 17,
  title: T('סופרמרקט', 'Supermarket'),
  items: DAY17_FR_ITEMS,
  dialogues: { supermarket: SCENE_SUPER },
  steps: [
    { kind: 'talk', icon: '🛒', title: T('משימה 17: סופרמרקט', 'Mission 17: Supermarket'),
      body: [
        T('היום-יום נהיה זול ופשוט. אתה מוצא, שוקל, ומשלם — לבד לגמרי.', 'Daily life just got cheap and easy. You find it, weigh it, and pay — completely on your own.'),
        T('רוב העבודה כאן היא זיהוי: שלטים, מעברים, וקול הקופה האוטומטית.', 'Most of the work here is recognition: signs, aisles, and the self-checkout voice.'),
      ], cta: T('להיכנס לסופר', 'Walk into the shop') },
    { kind: 'tool', itemId: 'fr.phrase.super.where-is', index: 1, total: 4, label: T('למצוא מוצר', 'Find a product') },
    { kind: 'tool', itemId: 'fr.phrase.super.do-you-have', index: 2, total: 4, label: T('לבדוק מלאי', 'Check stock') },
    { kind: 'tool', itemId: 'fr.phrase.super.just-this', index: 3, total: 4, label: T('בקופה', 'At the checkout') },
    { kind: 'tool', itemId: 'fr.phrase.super.need-bag', index: 4, total: 4, label: T('לבקש שקית', 'Ask for a bag') },
    { kind: 'replies', saidItemId: 'fr.phrase.super.where-is',
      replyIds: ['fr.reply.super.aisle-three', 'fr.reply.super.over-there', 'fr.reply.super.weigh-it', 'fr.reply.super.bag-q'] },
    { kind: 'receipt', text: T('אתה מזהה תשובות של סדרן וקופה — מעבר, כיוון, שקילה, שקית.', 'You recognize the answers of a shelf-stocker and a checkout — aisle, direction, weighing, bag.') },
    { kind: 'quiz', itemId: 'fr.reply.super.weigh-it', wrongIds: ['fr.reply.super.bag-q', 'fr.reply.super.card-here'] },
    { kind: 'quiz', itemId: 'fr.reply.super.aisle-three', wrongIds: ['fr.reply.super.over-there', 'fr.reply.super.sold-out'] },
    { kind: 'dialogue', dialogueId: 'supermarket' },
    { kind: 'receipt', text: T('מצאת מוצרים, שקלת פירות, ועברת קופה אוטומטית — לבד.', 'You found products, weighed fruit, and cleared a self-checkout — on your own.') },
    { kind: 'swipe', itemIds: DAY17_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Article inattendu dans la zone d’emballage — veuillez attendre de l’aide.', tr: TR('Unexpected item in the bagging area — please wait for assistance.', 'פריט לא צפוי באזור האריזה — אנא המתן לסיוע.'), he: 'פריט לא צפוי באזור האריזה — אנא המתן לסיוע.' },
      correctItemId: 'fr.phrase.recovery.show-me', wrongItemId: 'fr.phrase.super.just-this' },
    { kind: 'receipt', text: T('הקופה האוטומטית נתקעה — וידעת לבקש שיראו לך במקום להיכנס ללחץ.', 'The self-checkout jammed — and you knew to ask someone to show you, instead of panicking.') },
    { kind: 'summary' },
  ],
};
