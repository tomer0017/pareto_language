import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { m07Steps } from '../practiceArrival.js';

/**
 * French Mission 7 — "Taxi / VTC". French parallel of English mission 6: same objective (destination →
 * price → stop, the address-show move), same step structure, same engine. French target lines +
 * `tr:{en,he}` glosses; `fr.*` ids. No French video yet. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY6_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.taxi.to-address', text: 'À cette adresse, s’il vous plaît.', meaning: T('לכתובת הזאת, בבקשה.', 'To this address, please.'),
    tip: T('הפתיח למונית — תגיד את זה ותראה את הכתובת בטלפון.', 'The taxi opener — say it and show the address on your phone.') },
  { id: 'fr.phrase.taxi.to-airport', text: 'À l’aéroport, s’il vous plaît.', meaning: T('לשדה התעופה, בבקשה.', 'To the airport, please.') },
  { id: 'fr.phrase.taxi.how-much', text: 'C’est combien pour le centre ?', meaning: T('כמה עד המרכז?', 'How much to the centre?'),
    tip: T('לשאול מחיר לפני שנוסעים — חוסך הפתעות.', 'Ask the price before you ride — no surprises.') },
  { id: 'fr.phrase.taxi.stop-here', text: 'Arrêtez-vous ici, s’il vous plaît.', meaning: T('עצור כאן, בבקשה.', 'Stop here, please.'),
    tip: T('העיתוי חשוב — תגיד את זה קצת לפני היעד.', 'Timing matters — say it just before the destination.') },
  { id: 'fr.phrase.taxi.keep-change', text: 'Gardez la monnaie.', meaning: T('תשאיר את העודף.', 'Keep the change.') },
  { id: 'fr.phrase.taxi.speak-slowly', text: 'Pardon, parlez lentement, s’il vous plaît.', meaning: T('סליחה, דבר לאט, בבקשה.', 'Sorry, please speak slowly.'),
    tip: T('כשהנהג מדבר מהר מדי — תגיד את זה. הוא יחזור, לאט.', 'When the driver speaks too fast — say it. He will say it again, slowly.') },
  { id: 'fr.phrase.taxi.okay-thanks', text: 'D’accord, merci.', meaning: T('בסדר, תודה.', 'Okay, thank you.') },
  // hear
  { id: 'fr.reply.taxi.where-to', text: 'Où allez-vous ?', meaning: T('לאן?', 'Where to?') },
  { id: 'fr.reply.taxi.about-fifteen', text: 'C’est environ quinze euros.', meaning: T('זה בערך חמישה עשר יורו.', "It's about fifteen euros.") },
  { id: 'fr.reply.taxi.traffic', text: 'Il y a beaucoup de circulation en ce moment.', meaning: T('יש הרבה פקקים עכשיו.', "There's a lot of traffic right now.") },
  { id: 'fr.reply.taxi.here-good', text: 'Ici, ça va ?', meaning: T('כאן זה בסדר?', 'Is here okay?') },
  { id: 'fr.reply.taxi.off-we-go', text: 'D’accord. Pas de problème — on y va !', meaning: T('הבנתי. אין בעיה — יוצאים!', 'Got it. No problem — off we go!') },
  { id: 'fr.reply.taxi.goodbye', text: 'Merci beaucoup ! Bon voyage !', meaning: T('תודה רבה! תיהנה מהטיול!', 'Thank you very much! Enjoy your trip!') },
  // Not in this conversation: the driver's small talk, kept because the final checkpoint (Mission 29) asks it.
  { id: 'fr.reply.taxi.first-visit', text: 'C’est votre première fois dans la ville ?', meaning: T('פעם ראשונה בעיר?', 'First time in the city?') },
  ...recoveryFr('fr.phrase.recovery.slowly', 'fr.phrase.recovery.show-me', 'fr.phrase.recovery.thank-you'),
];

const SCENE: BootcampDialogue = {
  id: 'taxi-ride',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Où allez-vous ?', tr: TR('Hello! Where to?', 'שלום! לאן?'), he: 'שלום! לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'À cette adresse, s’il vous plaît.', tr: TR('To this address, please.', 'לכתובת הזאת, בבקשה.'), he: 'לכתובת הזאת, בבקשה.', itemId: 'fr.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'À l’aéroport, s’il vous plaît.', tr: TR('To the airport, please.', 'לשדה התעופה, בבקשה.'), he: 'לשדה התעופה, בבקשה.', itemId: 'fr.phrase.taxi.to-airport', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'D’accord. Pas de problème — on y va !', tr: TR('Got it. No problem — off we go!', 'הבנתי. אין בעיה — יוצאים!'), he: 'הבנתי. אין בעיה — יוצאים!' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'C’est combien pour le centre ?', tr: TR('How much to the centre?', 'כמה עד המרכז?'), he: 'כמה עד המרכז?', itemId: 'fr.phrase.taxi.how-much', correct: true, next: 'n3' },
      { en: 'Vous pouvez me montrer ?', tr: TR('Can you show me?', 'אתה יכול להראות לי? (בקש לראות את המונה)'), he: 'אתה יכול להראות לי?', itemId: 'fr.phrase.recovery.show-me', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'C’est environ quinze euros. Il y a beaucoup de circulation en ce moment.', tr: TR("It's about fifteen euros. There's a lot of traffic right now.", 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.'), he: 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Pardon, parlez lentement, s’il vous plaît.', tr: TR('Sorry, please speak slowly.', 'סליחה, דבר לאט, בבקשה.'), he: 'סליחה, דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r3' },
      { en: 'D’accord, merci.', tr: TR('Okay, thank you.', 'בסדר, תודה.'), he: 'בסדר, תודה.', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Bien sûr. Environ quinze euros. Il y a beaucoup de circulation.', tr: TR("Sure. About fifteen euros. There's a lot of traffic.", 'בטח. בערך חמישה עשר יורו. יש הרבה פקקים.'), he: 'בטח. בערך חמישה עשר יורו. יש הרבה פקקים.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'D’accord, merci.', tr: TR('Okay, thank you.', 'בסדר, תודה.'), he: 'בסדר, תודה.', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: '…On est presque arrivés. Ici, ça va ?', tr: TR('…We are almost there. Is here okay?', '…כמעט הגענו. כאן זה בסדר?'), he: '…כמעט הגענו. כאן זה בסדר?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Arrêtez-vous ici, s’il vous plaît. Gardez la monnaie.', tr: TR('Stop here, please. Keep the change.', 'עצור כאן, בבקשה. תשאיר את העודף.'), he: 'עצור כאן, בבקשה. תשאיר את העודף.', itemId: 'fr.phrase.taxi.stop-here', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Merci beaucoup ! Bon voyage !', tr: TR('Thank you very much! Enjoy your trip!', 'תודה רבה! תיהנה מהטיול!'), he: 'תודה רבה! תיהנה מהטיול!' },
  ],
};

export const DAY6_FR: BootcampDayContent = {
  day: 6,
  title: T('מונית', 'Taxi / Uber'),
  items: DAY6_FR_ITEMS,
  dialogues: { 'taxi-ride': SCENE },
  // The whole journey is shared by all languages: see practiceArrival.ts (`m07Steps`).
  steps: m07Steps('fr'),
};
