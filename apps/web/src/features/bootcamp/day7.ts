import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';
import { m08Steps } from './practiceArrival.js';

/** Mission 8 — "Hotel Check-in" (real objective: reservation → key → floor → breakfast). */
export const DAY7_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.hotel.reservation', text: 'I have a reservation.', meaning: T('יש לי הזמנה.', 'I have a reservation.'),
    tip: T('הפתיח לדלפק המלון. תבנית: I have a ___.', 'The front-desk opener. Template: I have a ___.') },
  { id: 'en.phrase.hotel.under-name', text: 'Under the name Cohen.', meaning: T('על השם כהן.', 'Under the name Cohen.') },
  { id: 'en.phrase.hotel.breakfast', text: 'Is breakfast included?', meaning: T('ארוחת הבוקר כלולה?', 'Is breakfast included?') },
  { id: 'en.phrase.hotel.here-you-go', text: 'Here you go.', meaning: T('בבקשה, הנה.', 'Here you go.') },
  { id: 'en.phrase.hotel.reservation-name', text: 'I have a reservation, under the name Cohen.', meaning: T('יש לי הזמנה, על השם כהן.', 'I have a reservation, under the name Cohen.') },
  // hear
  { id: 'en.reply.hotel.passport', text: 'Your passport, please.', meaning: T('הדרכון שלך, בבקשה.', 'Your passport, please.') },
  { id: 'en.reply.hotel.room-number', text: "You're in room two-oh-four.", meaning: T('אתה בחדר 204.', "You're in room two-oh-four.") },
  { id: 'en.reply.hotel.breakfast-time', text: 'Breakfast is from seven to ten.', meaning: T('ארוחת בוקר משבע עד עשר.', 'Breakfast is from seven to ten.') },
  { id: 'en.reply.hotel.elevator', text: 'The elevator is on your right.', meaning: T('המעלית מימינך.', 'The elevator is on your right.') },
  // the receptionist's lines, whole (as the conversation says them)
  { id: 'en.reply.hotel.how-help', text: 'Good evening! How can I help you?', meaning: T('ערב טוב! איך אפשר לעזור?', 'Good evening! How can I help you?') },
  { id: 'en.reply.hotel.welcome-passport', text: 'Welcome, Mr. Cohen. Your passport, please.', meaning: T('ברוך הבא, מר כהן. הדרכון שלך, בבקשה.', 'Welcome, Mr. Cohen. Your passport, please.') },
  { id: 'en.reply.hotel.room-key', text: "Thank you. You're in room two-oh-four, on the second floor. Here is your key.", meaning: T('תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.', "Thank you. You're in room 204, on the second floor. Here is your key.") },
  { id: 'en.reply.hotel.breakfast-elevator', text: 'Yes! Breakfast is from seven to ten. The elevator is on your right.', meaning: T('כן! ארוחת בוקר משבע עד עשר. המעלית מימינך.', 'Yes! Breakfast is from seven to ten. The elevator is on your right.') },
  { id: 'en.reply.hotel.enjoy', text: 'Enjoy your stay!', meaning: T('תיהנה מהשהות!', 'Enjoy your stay!') },
  // the help sentences this conversation offers (its side-branches)
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.one-moment'),
];

const SCENE: BootcampDialogue = {
  id: 'hotel-checkin',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Good evening! How can I help you?', he: 'ערב טוב! איך אפשר לעזור?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'I have a reservation, under the name Cohen.', he: 'יש לי הזמנה, על השם כהן.', itemId: 'en.phrase.hotel.reservation', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'How — can — I — help you?', he: 'איך — אפשר — לעזור — לך?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'I have a reservation, under the name Cohen.', he: 'יש לי הזמנה, על השם כהן.', itemId: 'en.phrase.hotel.reservation', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Welcome, Mr. Cohen. Your passport, please.', he: 'ברוך הבא, מר כהן. הדרכון שלך, בבקשה.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Here you go.', he: 'בבקשה, הנה.', itemId: 'en.phrase.hotel.here-you-go', correct: true, next: 'n3' },
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה.', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: "Thank you. You're in room two-oh-four, on the second floor. Here is your key.", he: 'תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Is breakfast included?', he: 'ארוחת הבוקר כלולה?', itemId: 'en.phrase.hotel.breakfast', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'n5', en: 'Yes! Breakfast is from seven to ten. The elevator is on your right.', he: 'כן! ארוחת בוקר משבע עד עשר. המעלית מימינך.' },
    { id: 'n5', who: 'npc', end: true, en: 'Enjoy your stay!', he: 'תיהנה מהשהות!' },
  ],
};

export const DAY7: BootcampDayContent = {
  day: 7,
  title: T("צ'ק-אין במלון", 'Hotel Check-in'),
  items: DAY7_ITEMS,
  dialogues: { 'hotel-checkin': SCENE },
  // The whole journey is shared by all languages: see practiceArrival.ts (`m08Steps`).
  steps: m08Steps('en'),
};
void RECOVERY_ITEMS;
