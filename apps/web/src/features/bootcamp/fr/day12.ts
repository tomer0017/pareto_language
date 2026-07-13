import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 12 — "Demandes et problèmes à l’hôtel" (Hotel Requests & Problems). French parallel
 * of English day 12: same objective (polite persistence — towels, wifi, a fault, a noisy room), same
 * step structure, same engine. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY12_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.hotelreq.more-towels', text: 'Je pourrais avoir des serviettes en plus ?', meaning: T('אפשר לקבל עוד מגבות?', 'Could I get some more towels?'),
    tip: T('התבנית: Je pourrais avoir ___ ? — הדרך המנומסת לבקש כל דבר.', 'Template: Je pourrais avoir ___ ? — the polite way to ask for anything.') },
  { id: 'fr.phrase.hotelreq.wifi-password', text: 'C’est quoi le mot de passe du wifi ?', meaning: T('מה הסיסמה של הוויי-פיי?', "What's the wifi password?"),
    tip: T('הבקשה הכי שימושית של המאה. שווה לדעת בעל פה.', 'The most useful request of the century. Worth knowing by heart.') },
  { id: 'fr.phrase.hotelreq.ac-not-working', text: 'La climatisation ne marche pas.', meaning: T('המזגן לא עובד.', "The air conditioning isn't working."),
    tip: T('התבנית: Le/la ___ ne marche pas. עובדת על כל דבר שהתקלקל.', 'Template: Le/la ___ ne marche pas. Works for anything broken.') },
  { id: 'fr.phrase.hotelreq.room-noisy', text: 'Ma chambre est très bruyante.', meaning: T('החדר שלי מאוד רועש.', 'My room is very noisy.'),
    tip: T('לתאר בעיה זה לא להתלונן. זה לתת להם לתקן.', 'Describing a problem isn’t complaining. It’s letting them fix it.') },
  { id: 'fr.phrase.hotelreq.can-you-help', text: 'Vous pourriez m’aider pour quelque chose ?', meaning: T('אפשר עזרה במשהו?', 'Could you help me with something?'),
    tip: T('פותח כל בקשה בנימוס. אף אחד לא מסרב לזה.', 'Opens any request politely. Nobody says no to it.') },
  // hear — reception's replies
  { id: 'fr.reply.hotelreq.how-can-help', text: 'Comment puis-je vous aider ?', meaning: T('איך אפשר לעזור לך?', 'How can I help you?') },
  { id: 'fr.reply.hotelreq.right-away', text: 'J’envoie quelqu’un tout de suite.', meaning: T('אשלח מישהו מיד.', "I'll send someone right away.") },
  { id: 'fr.reply.hotelreq.so-sorry', text: 'Je suis vraiment désolé.', meaning: T('אני מצטער על זה מאוד.', "I'm so sorry about that.") },
  { id: 'fr.reply.hotelreq.password-card', text: 'Le mot de passe est sur votre carte.', meaning: T('הסיסמה על כרטיס המפתח.', 'The password is on your key card.') },
  { id: 'fr.reply.hotelreq.change-rooms', text: 'Vous voulez changer de chambre ?', meaning: T('תרצה להחליף חדר?', 'Would you like to change rooms?') },
  { id: 'fr.reply.hotelreq.anything-else', text: 'Je peux faire autre chose ?', meaning: T('עוד משהו שאוכל לעשות?', 'Anything else I can do?') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE_DESK: BootcampDialogue = {
  id: 'hotel-desk',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonsoir ! Comment puis-je vous aider ?', tr: TR('Good evening! How can I help you?', 'ערב טוב! איך אפשר לעזור?'), he: 'ערב טוב! איך אפשר לעזור?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je pourrais avoir des serviettes en plus ?', tr: TR('Could I get some more towels?', 'אפשר לקבל עוד מגבות?'), he: 'אפשר לקבל עוד מגבות?', itemId: 'fr.phrase.hotelreq.more-towels', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה. (כלי — תמיד מותר)'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Bien sûr — comment puis-je vous aider ?', tr: TR('Of course — how can I help you?', 'כמובן — איך אפשר לעזור?'), he: 'כמובן — איך אפשר לעזור?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Je pourrais avoir des serviettes en plus ?', tr: TR('Could I get some more towels?', 'אפשר לקבל עוד מגבות?'), he: 'אפשר לקבל עוד מגבות?', itemId: 'fr.phrase.hotelreq.more-towels', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Bien sûr, je les fais monter tout de suite. Autre chose ?', tr: TR("Of course, I'll send some up right away. Anything else?", 'בטח, אשלח מיד. עוד משהו?'), he: 'בטח, אשלח מיד. עוד משהו?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'C’est quoi le mot de passe du wifi ?', tr: TR("What's the wifi password?", 'מה הסיסמה של הוויי-פיי?'), he: 'מה הסיסמה של הוויי-פיי?', itemId: 'fr.phrase.hotelreq.wifi-password', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'Je demandais — autre chose ?', tr: TR('I asked — is there anything else?', 'שאלתי — יש עוד משהו?'), he: 'שאלתי — יש עוד משהו?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'C’est quoi le mot de passe du wifi ?', tr: TR("What's the wifi password?", 'מה הסיסמה של הוויי-פיי?'), he: 'מה הסיסמה של הוויי-פיי?', itemId: 'fr.phrase.hotelreq.wifi-password', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Le mot de passe est sur votre carte. Autre chose ?', tr: TR('The password is on your key card. Anything else?', 'הסיסמה על כרטיס המפתח. עוד משהו?'), he: 'הסיסמה על כרטיס המפתח. עוד משהו?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'La climatisation ne marche pas.', tr: TR("The air conditioning isn't working.", 'המזגן לא עובד.'), he: 'המזגן לא עובד.', itemId: 'fr.phrase.hotelreq.ac-not-working', correct: true, next: 'n4' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה! (מנומס — אבל יש עוד בעיה לספר)'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', next: 'c3b', en: 'Je vous en prie ! Et la chambre elle-même, ça va ?', tr: TR("You're welcome! Is the room itself okay?", 'בבקשה! והחדר עצמו בסדר?'), he: 'בבקשה! והחדר עצמו בסדר?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'La climatisation ne marche pas.', tr: TR("The air conditioning isn't working.", 'המזגן לא עובד.'), he: 'המזגן לא עובד.', itemId: 'fr.phrase.hotelreq.ac-not-working', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Oh, je suis vraiment désolé. Je fais réparer ça aujourd’hui. La chambre est confortable autrement ?', tr: TR("Oh, I'm so sorry about that. I'll have it fixed today. Is the room comfortable otherwise?", 'אוי, אני מצטער מאוד. אדאג שיתקנו היום. החדר נוח חוץ מזה?'), he: 'אוי, אני מצטער מאוד. אדאג שיתקנו היום. החדר נוח חוץ מזה?' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Ma chambre est très bruyante.', tr: TR('My room is very noisy.', 'החדר שלי מאוד רועש.'), he: 'החדר שלי מאוד רועש.', itemId: 'fr.phrase.hotelreq.room-noisy', correct: true, next: 'n5' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'La chambre est — confortable — autrement ?', tr: TR('Is the room — comfortable — otherwise?', 'החדר — נוח — חוץ מזה?'), he: 'החדר — נוח — חוץ מזה?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Ma chambre est très bruyante.', tr: TR('My room is very noisy.', 'החדר שלי מאוד רועש.'), he: 'החדר שלי מאוד רועש.', itemId: 'fr.phrase.hotelreq.room-noisy', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Je comprends. Vous voulez passer dans une chambre plus calme ?', tr: TR('I understand. Would you like to change to a quieter room?', 'אני מבין. תרצה לעבור לחדר שקט יותר?'), he: 'אני מבין. תרצה לעבור לחדר שקט יותר?' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Oui, merci !', tr: TR('Yes, thank you!', 'כן, תודה!'), he: 'כן, תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Vous voulez — une chambre — plus calme ?', tr: TR('Would you — like — a quieter room?', 'תרצה — חדר — שקט יותר?'), he: 'תרצה — חדר — שקט יותר?' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Oui, merci !', tr: TR('Yes, thank you!', 'כן, תודה!'), he: 'כן, תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Tout est réglé — chambre 305, et quelqu’un monte déjà. Bonne nuit !', tr: TR("All sorted — room 305, and someone's on the way up. Have a lovely night!", 'הכל מסודר — חדר 305, ומישהו כבר בדרך. לילה נעים!'), he: 'הכל מסודר — חדר 305, ומישהו כבר בדרך. לילה נעים!' },
  ],
};

export const DAY12_FR: BootcampDayContent = {
  day: 12,
  title: T('בקשות ובעיות במלון', 'Hotel Requests & Problems'),
  items: DAY12_FR_ITEMS,
  dialogues: { 'hotel-desk': SCENE_DESK },
  steps: [
    { kind: 'talk', icon: '🛎️', title: T('משימה 12: בקשות ובעיות במלון', 'Mission 12: Hotel Requests & Problems'),
      body: [
        T('משהו לא בסדר בחדר? אתה לא צריך לסבול בשקט. אתה מבקש — והמלון עובד בשבילך.', 'Something wrong in the room? You don’t have to suffer quietly. You ask — and the hotel works for you.'),
        T('לתאר בעיה בנימוס זה לא להתלונן. זה כלי. היום נלמד את הכלי הזה.', 'Describing a problem politely isn’t complaining. It’s a skill. Today we learn that skill.'),
      ], cta: T('לגשת לקבלה', 'Go to reception') },
    { kind: 'tool', itemId: 'fr.phrase.hotelreq.more-towels', index: 1, total: 4, label: T('לבקש בנימוס', 'Ask politely') },
    { kind: 'tool', itemId: 'fr.phrase.hotelreq.wifi-password', index: 2, total: 4, label: T('הבקשה של המאה', 'The must-have request') },
    { kind: 'tool', itemId: 'fr.phrase.hotelreq.ac-not-working', index: 3, total: 4, label: T('לדווח על תקלה', 'Report a fault') },
    { kind: 'tool', itemId: 'fr.phrase.hotelreq.room-noisy', index: 4, total: 4, label: T('לתאר בעיה', 'Describe a problem') },
    { kind: 'replies', saidItemId: 'fr.phrase.hotelreq.ac-not-working',
      replyIds: ['fr.reply.hotelreq.right-away', 'fr.reply.hotelreq.so-sorry', 'fr.reply.hotelreq.change-rooms', 'fr.reply.hotelreq.anything-else'] },
    { kind: 'receipt', text: T('אתה מזהה איך צוות המלון מגיב לבקשה — כולל התנצלות ופתרון.', 'You recognize how hotel staff respond to a request — apology and solution included.') },
    { kind: 'quiz', itemId: 'fr.reply.hotelreq.change-rooms', wrongIds: ['fr.reply.hotelreq.password-card', 'fr.reply.hotelreq.how-can-help'] },
    { kind: 'quiz', itemId: 'fr.reply.hotelreq.right-away', wrongIds: ['fr.reply.hotelreq.so-sorry', 'fr.reply.hotelreq.anything-else'] },
    { kind: 'dialogue', dialogueId: 'hotel-desk' },
    { kind: 'receipt', text: T('ביקשת מגבות, וויי-פיי, ותיקון — ואפילו קיבלת חדר שקט יותר.', 'You asked for towels, wifi, and a repair — and even got a quieter room.') },
    { kind: 'swipe', itemIds: DAY12_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Au fait, il y a eu un petit souci avec votre réservation — vous pourriez descendre à la réception ?', tr: TR("By the way there's been a small mix-up with your booking — could you come down to the desk?", 'אגב, הייתה אי-הבנה קטנה עם ההזמנה שלך — אפשר שתרד לקבלה?'), he: 'אגב, הייתה אי-הבנה קטנה עם ההזמנה שלך — אפשר שתרד לקבלה?' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.phrase.hotelreq.wifi-password' },
    { kind: 'receipt', text: T('הודעה מפתיעה מהקבלה — וביקשת שיחזרו עליה במקום לקפוא.', 'A surprise message from the desk — and you asked them to repeat it instead of freezing.') },
    { kind: 'summary' },
  ],
};
