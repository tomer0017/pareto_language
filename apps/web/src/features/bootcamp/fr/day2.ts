import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { m02Steps } from '../practiceV1.js';

/**
 * French Mission 2 — "Argent et chiffres" (Numbers & Money). French parallel of English mission 2:
 * same objective (hear a price and pay without freezing), same step structure, same engine. French
 * target lines + `tr:{en,he}` glosses; `fr.*` ids. No French video yet → the hub Watch card shows
 * "Coming Soon". AI-drafted, neutral-polite (vous), pending native review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY2_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.money.how-much', text: 'C’est combien ?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('השאלה שפותחת כל עסקה. תלמד אותה עד הסוף.', 'The question that opens every transaction. Learn it cold.') },
  { id: 'fr.phrase.money.by-card', text: 'Par carte, s’il vous plaît.', meaning: T('בכרטיס, בבקשה.', 'By card, please.') },
  { id: 'fr.phrase.money.in-cash', text: 'En espèces.', meaning: T('במזומן.', 'In cash.') },
  { id: 'fr.phrase.money.one-box', text: 'Une barquette, s’il vous plaît.', meaning: T('קופסה אחת, בבקשה.', 'One box, please.'),
    tip: T('One ___, please — מספר + הדבר. כך קונים כל דבר.', 'One ___, please — a number + the thing. That is how you buy anything.') },
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
  ...recoveryFr('fr.phrase.recovery.slowly', 'fr.phrase.recovery.one-moment'),
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
      { en: 'Une barquette, s’il vous plaît.', tr: TR('One punnet, please.', 'קופסה אחת, בבקשה.'), he: 'קופסה אחת, בבקשה.', itemId: 'fr.phrase.money.one-box', correct: true, next: 'n3' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Cinq — euros — une barquette.', tr: TR('Five — euros — one punnet.', 'חמישה — יורו — קופסה אחת.'), he: 'חמישה — יורו — קופסה אחת.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Une barquette, s’il vous plaît.', tr: TR('One punnet, please.', 'קופסה אחת, בבקשה.'), he: 'קופסה אחת, בבקשה.', itemId: 'fr.phrase.money.one-box', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Parfait. Ça fait cinq euros. Espèces ou carte ?', tr: TR("Perfect. That's five euros. Cash or card?", 'מצוין. זה חמישה יורו. מזומן או כרטיס?'), he: 'מצוין. זה חמישה יורו. מזומן או כרטיס?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Par carte, s’il vous plaît.', tr: TR('By card, please.', 'בכרטיס, בבקשה.'), he: 'בכרטיס, בבקשה.', itemId: 'fr.phrase.money.by-card', correct: true, next: 'n4' },
      { en: 'En espèces.', tr: TR('In cash.', 'במזומן.'), he: 'במזומן.', itemId: 'fr.phrase.money.in-cash', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', end: true, en: 'Merci ! Bonne dégustation !', tr: TR('Thank you! Enjoy the strawberries!', 'תודה! תיהנה מהתותים!'), he: 'תודה! תיהנה מהתותים!' },
  ],
};

export const DAY2_FR: BootcampDayContent = {
  day: 2,
  title: T('כסף ומספרים', 'Numbers & Money'),
  items: DAY2_FR_ITEMS,
  dialogues: { 'market-stall': SCENE },
  steps: m02Steps('fr'),
};
