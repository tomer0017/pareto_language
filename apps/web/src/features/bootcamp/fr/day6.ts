import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 6 — "Directions". French parallel of English day 6: same objective (ask, then
 * UNDERSTAND the fast answer — 90% listening), same step structure, same engine. French target
 * lines + `tr:{en,he}` glosses; `fr.*` ids. No French video yet. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY6_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.dir.excuse-me', text: 'Excusez-moi !', meaning: T('סליחה!', 'Excuse me!'),
    tip: T('פותח כל פנייה לזר ברחוב.', 'Opens any approach to a stranger on the street.') },
  { id: 'fr.phrase.dir.where-is', text: 'Où est la gare ?', meaning: T('איפה התחנה?', 'Where is the station?'),
    tip: T('תבנית: Où est le/la ___ ? — התחנה, השירותים, המלון.', 'Template: Où est le/la ___ ? — the station, the bathroom, the hotel.') },
  { id: 'fr.phrase.dir.how-do-i-get', text: 'Comment aller à la plage ?', meaning: T('איך מגיעים לחוף?', 'How do I get to the beach?') },
  { id: 'fr.phrase.dir.is-it-far', text: 'C’est loin ?', meaning: T('זה רחוק?', 'Is it far?'),
    tip: T('שתי מילים שמחליטות: ללכת ברגל או לקחת מונית.', 'Two words that decide: walk or take a taxi.') },
  { id: 'fr.phrase.dir.show-me-map', text: 'Vous pouvez me montrer sur la carte ?', meaning: T('אתה יכול להראות לי על המפה?', 'Can you show me on the map?'),
    tip: T('כשמילים לא מספיקות — עוברים לעיניים.', 'When words aren’t enough — switch to eyes.') },
  // hear — the direction answers (this is the whole mission)
  { id: 'fr.reply.dir.left', text: 'C’est à gauche.', meaning: T('זה בצד שמאל.', "It's on the left.") },
  { id: 'fr.reply.dir.right', text: 'C’est à droite.', meaning: T('זה בצד ימין.', "It's on the right.") },
  { id: 'fr.reply.dir.straight', text: 'Allez tout droit.', meaning: T('לך ישר.', 'Go straight ahead.') },
  { id: 'fr.reply.dir.turn-left', text: 'Tournez à gauche au coin.', meaning: T('פנה שמאלה בפינה.', 'Turn left at the corner.') },
  { id: 'fr.reply.dir.next-to', text: 'C’est à côté de la banque.', meaning: T('זה ליד הבנק.', "It's next to the bank.") },
  { id: 'fr.reply.dir.five-minutes', text: 'C’est à environ cinq minutes à pied.', meaning: T('זה בערך חמש דקות ברגל.', "It's about five minutes on foot.") },
  { id: 'fr.reply.dir.cant-miss', text: 'Vous ne pouvez pas la manquer.', meaning: T('אי אפשר לפספס.', "You can't miss it.") },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.show-me', 'fr.phrase.recovery.thank-you'),
];

const SCENE: BootcampDialogue = {
  id: 'lost-in-town',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'you', next: 'n2', en: 'Excusez-moi ! Où est la gare ?', tr: TR('Excuse me! Where is the station?', 'סליחה! איפה התחנה?'), he: 'סליחה! איפה התחנה?' },
    { id: 'n2', who: 'npc', fast: true, next: 'c1', en: 'La gare ? Allez tout droit, puis tournez à gauche au coin.', tr: TR('The station? Go straight ahead, then turn left at the corner.', 'התחנה? לך ישר, ואז פנה שמאלה בפינה.'), he: 'התחנה? לך ישר, ואז פנה שמאלה בפינה.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה? (הרבה כיוונים ברצף — עצור אותו!)'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r1' },
      { en: 'C’est loin ?', tr: TR('Is it far?', 'זה רחוק?'), he: 'זה רחוק?', itemId: 'fr.phrase.dir.is-it-far', correct: true, next: 'n3' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Tout droit… puis… à gauche… au coin.', tr: TR('Straight… then… left… at the corner.', 'ישר… ואז… שמאלה… בפינה.'), he: 'ישר… ואז… שמאלה… בפינה.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'C’est loin ?', tr: TR('Is it far?', 'זה רחוק?'), he: 'זה רחוק?', itemId: 'fr.phrase.dir.is-it-far', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c2', en: 'Non, c’est à environ cinq minutes à pied. C’est à côté de la banque.', tr: TR("No, it's about five minutes on foot. It's next to the bank.", 'לא, זה בערך חמש דקות ברגל. זה ליד הבנק.'), he: 'לא, זה בערך חמש דקות ברגל. זה ליד הבנק.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Vous pouvez me montrer sur la carte ?', tr: TR('Can you show me on the map?', 'אתה יכול להראות לי על המפה?'), he: 'אתה יכול להראות לי על המפה?', itemId: 'fr.phrase.dir.show-me-map', correct: true, next: 'n4' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n4', who: 'npc', next: 'n5', en: 'Bien sûr — tenez, nous sommes ici, et la gare est juste là.', tr: TR('Of course — here, we are here, and the station is right there.', 'כמובן — הנה, אנחנו כאן, והתחנה בדיוק שם.'), he: 'כמובן — הנה, אנחנו כאן, והתחנה בדיוק שם.' },
    { id: 'n5', who: 'npc', end: true, en: 'Vous ne pouvez pas la manquer. Bonne journée !', tr: TR("You can't miss it. Have a good day!", 'אי אפשר לפספס. שיהיה יום טוב!'), he: 'אי אפשר לפספס. שיהיה יום טוב!' },
  ],
};

export const DAY6_FR: BootcampDayContent = {
  day: 6,
  title: T('כיוונים', 'Directions'),
  items: DAY6_FR_ITEMS,
  dialogues: { 'lost-in-town': SCENE },
  steps: [
    { kind: 'talk', icon: '🧭', title: T('משימה 6: כיוונים', 'Mission 6: Directions'),
      body: [
        T('לשאול "איפה?" זה קל. הקושי האמיתי: להבין את התשובה המהירה.', 'Asking “where?” is easy. The real challenge: understanding the fast answer.'),
        T('היום זו בעיקר האזנה. שמאל, ימין, ישר, ליד — עד שזה טבעי.', 'Today is mostly listening. Left, right, straight, next to — until it’s automatic.'),
      ], cta: T('מתחילים', 'Start') },
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('שש מילות כיוון — כדי שתבין את התשובה, לא רק תשאל.', 'Six direction words — so you understand the answer, not just ask.'),
      words: [
        { text: 'excusez-moi', meaning: T('סליחה (לפנות)', 'excuse me') },
        { text: 'gauche', meaning: T('שמאלה', 'left'), emoji: '⬅️' },
        { text: 'droite', meaning: T('ימינה', 'right'), emoji: '➡️' },
        { text: 'tout droit', meaning: T('ישר', 'straight'), emoji: '⬆️' },
        { text: 'près', meaning: T('קרוב', 'near') },
        { text: 'loin', meaning: T('רחוק', 'far') },
      ], buildFromItemId: 'fr.reply.dir.turn-left' },
    { kind: 'tool', itemId: 'fr.phrase.dir.where-is', index: 1, total: 3, label: T('לשאול איפה', 'Ask where') },
    { kind: 'tool', itemId: 'fr.phrase.dir.is-it-far', index: 2, total: 3, label: T('ללכת או מונית?', 'Walk or taxi?') },
    { kind: 'tool', itemId: 'fr.phrase.dir.show-me-map', index: 3, total: 3, label: T('לעבור לעיניים', 'Switch to eyes') },
    { kind: 'replies', saidItemId: 'fr.phrase.dir.where-is',
      replyIds: ['fr.reply.dir.left', 'fr.reply.dir.right', 'fr.reply.dir.straight', 'fr.reply.dir.next-to'] },
    { kind: 'receipt', text: T('שמאל, ימין, ישר, ליד — אתה מזהה כל כיוון במשפט.', 'Left, right, straight, next to — you catch every direction in a sentence.') },
    { kind: 'quiz', itemId: 'fr.reply.dir.turn-left', wrongIds: ['fr.reply.dir.straight', 'fr.reply.dir.right'] },
    { kind: 'quiz', itemId: 'fr.reply.dir.five-minutes', wrongIds: ['fr.reply.dir.next-to', 'fr.reply.dir.cant-miss'] },
    { kind: 'dialogue', dialogueId: 'lost-in-town' },
    { kind: 'receipt', text: T('שאלת דרך, הבנת הוראות מהירות, והגעת. ללכת לאיבוד כבר לא מפחיד.', 'You asked for directions, understood fast instructions, and arrived. Being lost isn’t scary anymore.') },
    { kind: 'swipe', itemIds: DAY6_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Passez l’église, prenez la deuxième à droite, et c’est juste en face de la pharmacie.', tr: TR('Go past the church take the second right and it is just opposite the pharmacy.', 'תעבור את הכנסייה, פנה ימינה בשנייה, וזה ממש מול בית המרקחת.'), he: 'תעבור את הכנסייה, פנה ימינה בשנייה, וזה ממש מול בית המרקחת.' },
      correctItemId: 'fr.reply.dir.right', wrongItemId: 'fr.reply.dir.left' },
    { kind: 'receipt', text: T('הוראה ארוכה ומהירה עם שלושה שלבים — ותפסת את הפנייה הנכונה.', 'A long, fast three-step instruction — and you caught the right turn.') },
    { kind: 'summary' },
  ],
};
