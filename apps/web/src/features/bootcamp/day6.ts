import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/** Mission 6 — "Directions" (real objective: ask, then UNDERSTAND the answer; 90% listening). */
export const DAY6_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.dir.excuse-me', text: 'Excuse me!', meaning: T('סליחה!', 'Excuse me!'),
    tip: T('פותח כל פנייה לזר ברחוב.', 'Opens any approach to a stranger on the street.') },
  { id: 'en.phrase.dir.where-is', text: 'Where is the station?', meaning: T('איפה התחנה?', 'Where is the station?'),
    tip: T('תבנית: Where is the ___? — התחנה, השירותים, המלון.', 'Template: Where is the ___? — the station, the bathroom, the hotel.') },
  { id: 'en.phrase.dir.how-do-i-get', text: 'How do I get to the beach?', meaning: T('איך מגיעים לחוף?', 'How do I get to the beach?') },
  { id: 'en.phrase.dir.is-it-far', text: 'Is it far?', meaning: T('זה רחוק?', 'Is it far?'),
    tip: T('שלוש מילים שמחליטות: ללכת ברגל או לקחת מונית.', 'Three words that decide: walk or take a taxi.') },
  { id: 'en.phrase.dir.show-me-map', text: 'Can you show me on the map?', meaning: T('אתה יכול להראות לי על המפה?', 'Can you show me on the map?'),
    tip: T('כשמילים לא מספיקות — עוברים לעיניים.', 'When words aren’t enough — switch to eyes.') },
  // hear — the direction answers (this is the whole mission)
  { id: 'en.reply.dir.left', text: "It's on the left.", meaning: T('זה בצד שמאל.', "It's on the left.") },
  { id: 'en.reply.dir.right', text: "It's on the right.", meaning: T('זה בצד ימין.', "It's on the right.") },
  { id: 'en.reply.dir.straight', text: 'Go straight ahead.', meaning: T('לך ישר.', 'Go straight ahead.') },
  { id: 'en.reply.dir.turn-left', text: 'Turn left at the corner.', meaning: T('פנה שמאלה בפינה.', 'Turn left at the corner.') },
  { id: 'en.reply.dir.next-to', text: "It's next to the bank.", meaning: T('זה ליד הבנק.', "It's next to the bank.") },
  { id: 'en.reply.dir.five-minutes', text: "It's about five minutes on foot.", meaning: T('זה בערך חמש דקות ברגל.', "It's about five minutes on foot.") },
  { id: 'en.reply.dir.cant-miss', text: "You can't miss it.", meaning: T('אי אפשר לפספס.', "You can't miss it.") },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.show-me', 'en.phrase.recovery.thank-you'),
];

const SCENE: BootcampDialogue = {
  id: 'lost-in-town',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'you', next: 'n2', en: 'Excuse me! Where is the station?', he: 'סליחה! איפה התחנה?' },
    { id: 'n2', who: 'npc', fast: true, next: 'c1', en: 'The station? Go straight ahead, then turn left at the corner.', he: 'התחנה? לך ישר, ואז פנה שמאלה בפינה.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה? (הרבה כיוונים ברצף — עצור אותו!)', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r1' },
      { en: 'Is it far?', he: 'זה רחוק?', itemId: 'en.phrase.dir.is-it-far', correct: true, next: 'n3' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Straight… then… left… at the corner.', he: 'ישר… ואז… שמאלה… בפינה.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Is it far?', he: 'זה רחוק?', itemId: 'en.phrase.dir.is-it-far', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c2', en: "No, it's about five minutes on foot. It's next to the bank.", he: 'לא, זה בערך חמש דקות ברגל. זה ליד הבנק.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Can you show me on the map?', he: 'אתה יכול להראות לי על המפה?', itemId: 'en.phrase.dir.show-me-map', correct: true, next: 'n4' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n4', who: 'npc', next: 'n5', en: 'Of course — here, we are here, and the station is right there.', he: 'כמובן — הנה, אנחנו כאן, והתחנה בדיוק שם.' },
    { id: 'n5', who: 'npc', end: true, en: "You can't miss it. Have a good day!", he: 'אי אפשר לפספס. שיהיה יום טוב!' },
  ],
};

export const DAY6: BootcampDayContent = {
  day: 6,
  title: T('כיוונים', 'Directions'),
  items: DAY6_ITEMS,
  dialogues: { 'lost-in-town': SCENE },
  steps: [
    { kind: 'talk', icon: '🧭', title: T('משימה 6: כיוונים', 'Mission 6: Directions'),
      body: [
        T('לשאול "איפה?" זה קל. הקושי האמיתי: להבין את התשובה המהירה.', 'Asking “where?” is easy. The real challenge: understanding the fast answer.'),
        T('היום זו בעיקר האזנה. שמאל, ימין, ישר, ליד — עד שזה טבעי.', 'Today is mostly listening. Left, right, straight, next to — until it’s automatic.'),
      ], cta: T('מתחילים', 'Start') },
    { kind: 'tool', itemId: 'en.phrase.dir.where-is', index: 1, total: 3, label: T('לשאול איפה', 'Ask where') },
    { kind: 'tool', itemId: 'en.phrase.dir.is-it-far', index: 2, total: 3, label: T('ללכת או מונית?', 'Walk or taxi?') },
    { kind: 'tool', itemId: 'en.phrase.dir.show-me-map', index: 3, total: 3, label: T('לעבור לעיניים', 'Switch to eyes') },
    { kind: 'replies', saidItemId: 'en.phrase.dir.where-is',
      replyIds: ['en.reply.dir.left', 'en.reply.dir.right', 'en.reply.dir.straight', 'en.reply.dir.next-to'] },
    { kind: 'receipt', text: T('שמאל, ימין, ישר, ליד — אתה מזהה כל כיוון במשפט.', 'Left, right, straight, next to — you catch every direction in a sentence.') },
    { kind: 'quiz', itemId: 'en.reply.dir.turn-left', wrongIds: ['en.reply.dir.straight', 'en.reply.dir.right'] },
    { kind: 'quiz', itemId: 'en.reply.dir.five-minutes', wrongIds: ['en.reply.dir.next-to', 'en.reply.dir.cant-miss'] },
    { kind: 'dialogue', dialogueId: 'lost-in-town' },
    { kind: 'receipt', text: T('שאלת דרך, הבנת הוראות מהירות, והגעת. ללכת לאיבוד כבר לא מפחיד.', 'You asked for directions, understood fast instructions, and arrived. Being lost isn’t scary anymore.') },
    { kind: 'swipe', itemIds: DAY6_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Go past the church take the second right and it is just opposite the pharmacy.', he: 'תעבור את הכנסייה, פנה ימינה בשנייה, וזה ממש מול בית המרקחת.' },
      correctItemId: 'en.reply.dir.right', wrongItemId: 'en.reply.dir.left' },
    { kind: 'receipt', text: T('הוראה ארוכה ומהירה עם שלושה שלבים — ותפסת את הפנייה הנכונה.', 'A long, fast three-step instruction — and you caught the right turn.') },
    { kind: 'summary' },
  ],
};
void RECOVERY_ITEMS;
