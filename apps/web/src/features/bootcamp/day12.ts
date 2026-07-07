import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 12 — "Hotel Requests & Problems" (Phase 2 · Arrival).
 * The first "friction" mission: something isn't right and you ask for it to be fixed.
 * Towels, wifi, a broken AC, a noisy room — polite persistence is a confidence skill.
 * You learn you don't have to suffer quietly: you ask, and the hotel works for you.
 */
export const DAY12_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.hotelreq.more-towels', text: 'Could I get some more towels?', meaning: T('אפשר לקבל עוד מגבות?', 'Could I get some more towels?'),
    tip: T('התבנית: Could I get ___? — הדרך המנומסת לבקש כל דבר.', 'Template: Could I get ___? — the polite way to ask for anything.') },
  { id: 'en.phrase.hotelreq.wifi-password', text: "What's the wifi password?", meaning: T('מה הסיסמה של הוויי-פיי?', "What's the wifi password?"),
    tip: T('הבקשה הכי שימושית של המאה. שווה לדעת בעל פה.', 'The most useful request of the century. Worth knowing by heart.') },
  { id: 'en.phrase.hotelreq.ac-not-working', text: "The air conditioning isn't working.", meaning: T('המזגן לא עובד.', "The air conditioning isn't working."),
    tip: T('התבנית: The ___ isn’t working. עובדת על כל דבר שהתקלקל.', 'Template: The ___ isn’t working. Works for anything broken.') },
  { id: 'en.phrase.hotelreq.room-noisy', text: 'My room is very noisy.', meaning: T('החדר שלי מאוד רועש.', 'My room is very noisy.'),
    tip: T('לתאר בעיה זה לא להתלונן. זה לתת להם לתקן.', 'Describing a problem isn’t complaining. It’s letting them fix it.') },
  { id: 'en.phrase.hotelreq.can-you-help', text: 'Could you help me with something?', meaning: T('אפשר עזרה במשהו?', 'Could you help me with something?'),
    tip: T('פותח כל בקשה בנימוס. אף אחד לא מסרב לזה.', 'Opens any request politely. Nobody says no to it.') },
  // hear — reception's replies
  { id: 'en.reply.hotelreq.how-can-help', text: 'How can I help you?', meaning: T('איך אפשר לעזור לך?', 'How can I help you?') },
  { id: 'en.reply.hotelreq.right-away', text: "I'll send someone right away.", meaning: T('אשלח מישהו מיד.', "I'll send someone right away.") },
  { id: 'en.reply.hotelreq.so-sorry', text: "I'm so sorry about that.", meaning: T('אני מצטער על זה מאוד.', "I'm so sorry about that.") },
  { id: 'en.reply.hotelreq.password-card', text: 'The password is on your key card.', meaning: T('הסיסמה על כרטיס המפתח.', 'The password is on your key card.') },
  { id: 'en.reply.hotelreq.change-rooms', text: 'Would you like to change rooms?', meaning: T('תרצה להחליף חדר?', 'Would you like to change rooms?') },
  { id: 'en.reply.hotelreq.anything-else', text: 'Anything else I can do?', meaning: T('עוד משהו שאוכל לעשות?', 'Anything else I can do?') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_DESK: BootcampDialogue = {
  id: 'hotel-desk',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Good evening! How can I help you?', he: 'ערב טוב! איך אפשר לעזור?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Could I get some more towels?', he: 'אפשר לקבל עוד מגבות?', itemId: 'en.phrase.hotelreq.more-towels', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה. (כלי — תמיד מותר)', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Of course — how can I help you?', he: 'כמובן — איך אפשר לעזור?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Could I get some more towels?', he: 'אפשר לקבל עוד מגבות?', itemId: 'en.phrase.hotelreq.more-towels', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: "Of course, I'll send some up right away. Anything else?", he: 'בטח, אשלח מיד. עוד משהו?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "What's the wifi password?", he: 'מה הסיסמה של הוויי-פיי?', itemId: 'en.phrase.hotelreq.wifi-password', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'I asked — is there anything else?', he: 'שאלתי — יש עוד משהו?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: "What's the wifi password?", he: 'מה הסיסמה של הוויי-פיי?', itemId: 'en.phrase.hotelreq.wifi-password', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'The password is on your key card. Anything else?', he: 'הסיסמה על כרטיס המפתח. עוד משהו?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: "The air conditioning isn't working.", he: 'המזגן לא עובד.', itemId: 'en.phrase.hotelreq.ac-not-working', correct: true, next: 'n4' },
      { en: 'Thank you!', he: 'תודה! (מנומס — אבל יש עוד בעיה לספר)', itemId: 'en.phrase.recovery.thank-you', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', next: 'c3b', en: "You're welcome! Is the room itself okay?", he: 'בבקשה! והחדר עצמו בסדר?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: "The air conditioning isn't working.", he: 'המזגן לא עובד.', itemId: 'en.phrase.hotelreq.ac-not-working', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: "Oh, I'm so sorry about that. I'll have it fixed today. Is the room comfortable otherwise?", he: 'אוי, אני מצטער מאוד. אדאג שיתקנו היום. החדר נוח חוץ מזה?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'My room is very noisy.', he: 'החדר שלי מאוד רועש.', itemId: 'en.phrase.hotelreq.room-noisy', correct: true, next: 'n5' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'Is the room — comfortable — otherwise?', he: 'החדר — נוח — חוץ מזה?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'My room is very noisy.', he: 'החדר שלי מאוד רועש.', itemId: 'en.phrase.hotelreq.room-noisy', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'I understand. Would you like to change to a quieter room?', he: 'אני מבין. תרצה לעבור לחדר שקט יותר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Yes, thank you!', he: 'כן, תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Would you — like — a quieter room?', he: 'תרצה — חדר — שקט יותר?' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Yes, thank you!', he: 'כן, תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: "All sorted — room 305, and someone's on the way up. Have a lovely night!", he: 'הכל מסודר — חדר 305, ומישהו כבר בדרך. לילה נעים!' },
  ],
};

export const DAY12: BootcampDayContent = {
  day: 12,
  title: T('בקשות ובעיות במלון', 'Hotel Requests & Problems'),
  items: DAY12_ITEMS,
  dialogues: { 'hotel-desk': SCENE_DESK },
  steps: [
    { kind: 'talk', icon: '🛎️', title: T('משימה 12: בקשות ובעיות במלון', 'Mission 12: Hotel Requests & Problems'),
      body: [
        T('משהו לא בסדר בחדר? אתה לא צריך לסבול בשקט. אתה מבקש — והמלון עובד בשבילך.', 'Something wrong in the room? You don’t have to suffer quietly. You ask — and the hotel works for you.'),
        T('לתאר בעיה בנימוס זה לא להתלונן. זה כלי. היום נלמד את הכלי הזה.', 'Describing a problem politely isn’t complaining. It’s a skill. Today we learn that skill.'),
      ], cta: T('לגשת לקבלה', 'Go to reception') },
    { kind: 'tool', itemId: 'en.phrase.hotelreq.more-towels', index: 1, total: 4, label: T('לבקש בנימוס', 'Ask politely') },
    { kind: 'tool', itemId: 'en.phrase.hotelreq.wifi-password', index: 2, total: 4, label: T('הבקשה של המאה', 'The must-have request') },
    { kind: 'tool', itemId: 'en.phrase.hotelreq.ac-not-working', index: 3, total: 4, label: T('לדווח על תקלה', 'Report a fault') },
    { kind: 'tool', itemId: 'en.phrase.hotelreq.room-noisy', index: 4, total: 4, label: T('לתאר בעיה', 'Describe a problem') },
    { kind: 'replies', saidItemId: 'en.phrase.hotelreq.ac-not-working',
      replyIds: ['en.reply.hotelreq.right-away', 'en.reply.hotelreq.so-sorry', 'en.reply.hotelreq.change-rooms', 'en.reply.hotelreq.anything-else'] },
    { kind: 'receipt', text: T('אתה מזהה איך צוות המלון מגיב לבקשה — כולל התנצלות ופתרון.', 'You recognize how hotel staff respond to a request — apology and solution included.') },
    { kind: 'quiz', itemId: 'en.reply.hotelreq.change-rooms', wrongIds: ['en.reply.hotelreq.password-card', 'en.reply.hotelreq.how-can-help'] },
    { kind: 'quiz', itemId: 'en.reply.hotelreq.right-away', wrongIds: ['en.reply.hotelreq.so-sorry', 'en.reply.hotelreq.anything-else'] },
    { kind: 'dialogue', dialogueId: 'hotel-desk' },
    { kind: 'receipt', text: T('ביקשת מגבות, וויי-פיי, ותיקון — ואפילו קיבלת חדר שקט יותר.', 'You asked for towels, wifi, and a repair — and even got a quieter room.') },
    { kind: 'swipe', itemIds: DAY12_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: "By the way there's been a small mix-up with your booking — could you come down to the desk?", he: 'אגב, הייתה אי-הבנה קטנה עם ההזמנה שלך — אפשר שתרד לקבלה?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.hotelreq.wifi-password' },
    { kind: 'receipt', text: T('הודעה מפתיעה מהקבלה — וביקשת שיחזרו עליה במקום לקפוא.', 'A surprise message from the desk — and you asked them to repeat it instead of freezing.') },
    { kind: 'summary' },
  ],
};
