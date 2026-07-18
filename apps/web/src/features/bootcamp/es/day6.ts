import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 6 — "Direcciones" (Directions). Spanish parallel of English day 6: same objective
 * (ask, then UNDERSTAND the fast answer — 90% listening), same step structure, same engine. Spanish
 * target lines + `tr:{en,he}` glosses; `es.*` ids. No Spanish video yet. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY6_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.dir.excuse-me', text: '¡Perdone!', meaning: T('סליחה!', 'Excuse me!'),
    tip: T('פותח כל פנייה לזר ברחוב.', 'Opens any approach to a stranger on the street.') },
  { id: 'es.phrase.dir.where-is', text: '¿Dónde está la estación?', meaning: T('איפה התחנה?', 'Where is the station?'),
    tip: T('תבנית: ¿Dónde está ___ ? — התחנה, השירותים, המלון.', 'Template: ¿Dónde está ___ ? — the station, the bathroom, the hotel.') },
  { id: 'es.phrase.dir.how-do-i-get', text: '¿Cómo se llega a la playa?', meaning: T('איך מגיעים לחוף?', 'How do I get to the beach?') },
  { id: 'es.phrase.dir.is-it-far', text: '¿Está lejos?', meaning: T('זה רחוק?', 'Is it far?'),
    tip: T('שתי מילים שמחליטות: ללכת ברגל או לקחת מונית.', 'Two words that decide: walk or take a taxi.') },
  { id: 'es.phrase.dir.show-me-map', text: '¿Me lo puede mostrar en el mapa?', meaning: T('אתה יכול להראות לי על המפה?', 'Can you show me on the map?'),
    tip: T('כשמילים לא מספיקות — עוברים לעיניים.', 'When words aren’t enough — switch to eyes.') },
  // hear — the direction answers (this is the whole mission)
  { id: 'es.reply.dir.left', text: 'Está a la izquierda.', meaning: T('זה בצד שמאל.', "It's on the left.") },
  { id: 'es.reply.dir.right', text: 'Está a la derecha.', meaning: T('זה בצד ימין.', "It's on the right.") },
  { id: 'es.reply.dir.straight', text: 'Siga todo recto.', meaning: T('לך ישר.', 'Go straight ahead.') },
  { id: 'es.reply.dir.turn-left', text: 'Gire a la izquierda en la esquina.', meaning: T('פנה שמאלה בפינה.', 'Turn left at the corner.') },
  { id: 'es.reply.dir.next-to', text: 'Está al lado del banco.', meaning: T('זה ליד הבנק.', "It's next to the bank.") },
  { id: 'es.reply.dir.five-minutes', text: 'Está a unos cinco minutos a pie.', meaning: T('זה בערך חמש דקות ברגל.', "It's about five minutes on foot.") },
  { id: 'es.reply.dir.cant-miss', text: 'No tiene pérdida.', meaning: T('אי אפשר לפספס.', "You can't miss it.") },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.show-me', 'es.phrase.recovery.thank-you'),
];

const SCENE: BootcampDialogue = {
  id: 'lost-in-town',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'you', next: 'n2', en: '¡Perdone! ¿Dónde está la estación?', tr: TR('Excuse me! Where is the station?', 'סליחה! איפה התחנה?'), he: 'סליחה! איפה התחנה?' },
    { id: 'n2', who: 'npc', fast: true, next: 'c1', en: '¿La estación? Siga todo recto y luego gire a la izquierda en la esquina.', tr: TR('The station? Go straight ahead, then turn left at the corner.', 'התחנה? לך ישר, ואז פנה שמאלה בפינה.'), he: 'התחנה? לך ישר, ואז פנה שמאלה בפינה.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה? (הרבה כיוונים ברצף — עצור אותו!)'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r1' },
      { en: '¿Está lejos?', tr: TR('Is it far?', 'זה רחוק?'), he: 'זה רחוק?', itemId: 'es.phrase.dir.is-it-far', correct: true, next: 'n3' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Todo recto… luego… a la izquierda… en la esquina.', tr: TR('Straight… then… left… at the corner.', 'ישר… ואז… שמאלה… בפינה.'), he: 'ישר… ואז… שמאלה… בפינה.' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: '¿Está lejos?', tr: TR('Is it far?', 'זה רחוק?'), he: 'זה רחוק?', itemId: 'es.phrase.dir.is-it-far', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c2', en: 'No, está a unos cinco minutos a pie. Está al lado del banco.', tr: TR("No, it's about five minutes on foot. It's next to the bank.", 'לא, זה בערך חמש דקות ברגל. זה ליד הבנק.'), he: 'לא, זה בערך חמש דקות ברגל. זה ליד הבנק.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Me lo puede mostrar en el mapa?', tr: TR('Can you show me on the map?', 'אתה יכול להראות לי על המפה?'), he: 'אתה יכול להראות לי על המפה?', itemId: 'es.phrase.dir.show-me-map', correct: true, next: 'n4' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n4', who: 'npc', next: 'n5', en: 'Claro — mire, estamos aquí, y la estación está justo ahí.', tr: TR('Of course — here, we are here, and the station is right there.', 'כמובן — הנה, אנחנו כאן, והתחנה בדיוק שם.'), he: 'כמובן — הנה, אנחנו כאן, והתחנה בדיוק שם.' },
    { id: 'n5', who: 'npc', end: true, en: 'No tiene pérdida. ¡Que tenga buen día!', tr: TR("You can't miss it. Have a good day!", 'אי אפשר לפספס. שיהיה יום טוב!'), he: 'אי אפשר לפספס. שיהיה יום טוב!' },
  ],
};

export const DAY6_ES: BootcampDayContent = {
  day: 6,
  title: T('כיוונים', 'Directions'),
  items: DAY6_ES_ITEMS,
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
        { text: 'perdone', meaning: T('סליחה (לפנות)', 'excuse me') },
        { text: 'izquierda', meaning: T('שמאלה', 'left'), emoji: '⬅️' },
        { text: 'derecha', meaning: T('ימינה', 'right'), emoji: '➡️' },
        { text: 'todo recto', meaning: T('ישר', 'straight'), emoji: '⬆️' },
        { text: 'cerca', meaning: T('קרוב', 'near') },
        { text: 'lejos', meaning: T('רחוק', 'far') },
      ], buildFromItemId: 'es.reply.dir.turn-left' },
    { kind: 'tool', itemId: 'es.phrase.dir.where-is', index: 1, total: 3, label: T('לשאול איפה', 'Ask where') },
    { kind: 'tool', itemId: 'es.phrase.dir.is-it-far', index: 2, total: 3, label: T('ללכת או מונית?', 'Walk or taxi?') },
    { kind: 'tool', itemId: 'es.phrase.dir.show-me-map', index: 3, total: 3, label: T('לעבור לעיניים', 'Switch to eyes') },
    { kind: 'replies', saidItemId: 'es.phrase.dir.where-is',
      replyIds: ['es.reply.dir.left', 'es.reply.dir.right', 'es.reply.dir.straight', 'es.reply.dir.next-to'] },
    { kind: 'receipt', text: T('שמאל, ימין, ישר, ליד — אתה מזהה כל כיוון במשפט.', 'Left, right, straight, next to — you catch every direction in a sentence.') },
    { kind: 'quiz', itemId: 'es.reply.dir.turn-left', wrongIds: ['es.reply.dir.straight', 'es.reply.dir.right'] },
    { kind: 'quiz', itemId: 'es.reply.dir.five-minutes', wrongIds: ['es.reply.dir.next-to', 'es.reply.dir.cant-miss'] },
    { kind: 'dialogue', dialogueId: 'lost-in-town' },
    { kind: 'receipt', text: T('שאלת דרך, הבנת הוראות מהירות, והגעת. ללכת לאיבוד כבר לא מפחיד.', 'You asked for directions, understood fast instructions, and arrived. Being lost isn’t scary anymore.') },
    { kind: 'swipe', itemIds: DAY6_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Pase la iglesia, tome la segunda a la derecha, y está justo enfrente de la farmacia.', tr: TR('Go past the church take the second right and it is just opposite the pharmacy.', 'תעבור את הכנסייה, פנה ימינה בשנייה, וזה ממש מול בית המרקחת.'), he: 'תעבור את הכנסייה, פנה ימינה בשנייה, וזה ממש מול בית המרקחת.' },
      correctItemId: 'es.reply.dir.right', wrongItemId: 'es.reply.dir.left' },
    { kind: 'receipt', text: T('הוראה ארוכה ומהירה עם שלושה שלבים — ותפסת את הפנייה הנכונה.', 'A long, fast three-step instruction — and you caught the right turn.') },
    { kind: 'summary' },
  ],
};
