import { RECOVERY_ITEMS, T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/** Mission 8 — "Hotel Check-in" (real objective: reservation → key → floor → breakfast). */
export const DAY8_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.hotel.reservation', text: 'I have a reservation.', meaning: T('יש לי הזמנה.', 'I have a reservation.'),
    tip: T('הפתיח לדלפק המלון. תבנית: I have a ___.', 'The front-desk opener. Template: I have a ___.') },
  { id: 'en.phrase.hotel.under-name', text: 'Under the name Cohen.', meaning: T('על השם כהן.', 'Under the name Cohen.') },
  { id: 'en.phrase.hotel.two-nights', text: 'For two nights.', meaning: T('לשני לילות.', 'For two nights.'),
    tip: T('תבנית: for ___ nights — משך השהות.', 'Template: for ___ nights — the length of your stay.') },
  { id: 'en.phrase.hotel.breakfast', text: 'Is breakfast included?', meaning: T('ארוחת הבוקר כלולה?', 'Is breakfast included?') },
  { id: 'en.phrase.hotel.wifi', text: "What's the wifi password?", meaning: T('מה סיסמת הוויי-פיי?', "What's the wifi password?") },
  // hear
  { id: 'en.reply.hotel.passport', text: 'Your passport, please.', meaning: T('הדרכון שלך, בבקשה.', 'Your passport, please.') },
  { id: 'en.reply.hotel.sign-here', text: 'Sign here, please.', meaning: T('תחתום כאן, בבקשה.', 'Sign here, please.') },
  { id: 'en.reply.hotel.room-number', text: "You're in room two-oh-four.", meaning: T('אתה בחדר 204.', "You're in room two-oh-four.") },
  { id: 'en.reply.hotel.second-floor', text: "It's on the second floor.", meaning: T('זה בקומה השנייה.', "It's on the second floor.") },
  { id: 'en.reply.hotel.breakfast-time', text: 'Breakfast is from seven to ten.', meaning: T('ארוחת בוקר משבע עד עשר.', 'Breakfast is from seven to ten.') },
  { id: 'en.reply.hotel.elevator', text: 'The elevator is on your right.', meaning: T('המעלית מימינך.', 'The elevator is on your right.') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you', 'en.phrase.recovery.one-moment'),
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
      { en: 'Here you go.', he: 'בבקשה, הנה.', correct: true, next: 'n3' },
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה.', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: "Thank you. You're in room two-oh-four, on the second floor. Is breakfast included in your booking?", he: 'תודה. אתה בחדר 204, בקומה השנייה. ארוחת בוקר כלולה בהזמנה שלך?' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Is breakfast included?', he: 'ארוחת הבוקר כלולה?', itemId: 'en.phrase.hotel.breakfast', correct: true, next: 'n4' },
      // A different question gets a DIFFERENT, matching answer — the NPC never ignores what you said.
      { en: "What's the wifi password?", he: 'מה סיסמת הוויי-פיי?', itemId: 'en.phrase.hotel.wifi', correct: true, next: 'n4w' },
    ] },
    { id: 'n4', who: 'npc', next: 'n5', en: 'Yes! Breakfast is from seven to ten. The elevator is on your right.', he: 'כן! ארוחת בוקר משבע עד עשר. המעלית מימינך.' },
    { id: 'n4w', who: 'npc', next: 'n5', en: "The wifi code is on your key card. And breakfast's from seven to ten — the elevator's on your right.", he: 'קוד הוויי-פיי על כרטיס המפתח. וארוחת בוקר משבע עד עשר — המעלית מימינך.' },
    { id: 'n5', who: 'npc', end: true, en: 'Enjoy your stay!', he: 'תיהנה מהשהות!' },
  ],
};

export const DAY8: BootcampDayContent = {
  day: 8,
  title: T("צ'ק-אין במלון", 'Hotel Check-in'),
  items: DAY8_ITEMS,
  dialogues: { 'hotel-checkin': SCENE },
  steps: [
    { kind: 'talk', icon: '🏨', title: T('משימה 8: צ\'ק-אין במלון', 'Mission 8: Hotel Check-in'),
      body: [
        T('בסיס הבית שלך בטיול. הזמנה, דרכון, מפתח, קומה, ארוחת בוקר.', 'Your home base for the trip. Reservation, passport, key, floor, breakfast.'),
        T('הפעם אחת — ותהיה רגוע כל השבוע.', 'Nail it once — and relax all week.'),
      ], cta: T('להגיע לדלפק', 'Approach the desk') },
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('המילים של הצ׳ק-אין — אחת מהן כבר מוכרת לך.', 'The check-in words — one of them you already know.'),
      words: [
        { text: 'reservation', meaning: T('הזמנה', 'reservation'), emoji: '📅' },
        { text: 'name', meaning: T('שם', 'name'), emoji: '📛', review: true },
        { text: 'night', meaning: T('לילה', 'night'), emoji: '🌙' },
        { text: 'breakfast', meaning: T('ארוחת בוקר', 'breakfast'), emoji: '🍳' },
        { text: 'passport', meaning: T('דרכון', 'passport'), emoji: '🛂' },
      ], buildFromItemId: 'en.phrase.hotel.reservation' },
    { kind: 'tool', itemId: 'en.phrase.hotel.reservation', index: 1, total: 4, label: T('הפתיח', 'The opener') },
    { kind: 'tool', itemId: 'en.phrase.hotel.two-nights', index: 2, total: 4, label: T('משך השהות', 'Length of stay') },
    { kind: 'tool', itemId: 'en.phrase.hotel.breakfast', index: 3, total: 4, label: T('ארוחת בוקר', 'Breakfast') },
    { kind: 'tool', itemId: 'en.phrase.hotel.wifi', index: 4, total: 4, label: T('וויי-פיי', 'Wifi') },
    { kind: 'replies', saidItemId: 'en.phrase.hotel.reservation',
      replyIds: ['en.reply.hotel.passport', 'en.reply.hotel.room-number', 'en.reply.hotel.second-floor', 'en.reply.hotel.breakfast-time'] },
    { kind: 'receipt', text: T('אתה מזהה כל מה שפקיד הקבלה אומר — דרכון, חדר, קומה, שעות.', 'You recognize everything the receptionist says — passport, room, floor, hours.') },
    { kind: 'quiz', itemId: 'en.reply.hotel.second-floor', wrongIds: ['en.reply.hotel.elevator', 'en.reply.hotel.breakfast-time'] },
    { kind: 'dialogue', dialogueId: 'hotel-checkin' },
    { kind: 'receipt', text: T("צ'ק-אין שלם: הזמנה, דרכון, חדר, מידע — ואתה בפנים.", 'A full check-in: reservation, passport, room, info — and you’re in.') },
    { kind: 'swipe', itemIds: DAY8_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Just so you know breakfast is served in the room on the lower level next to the pool.', he: 'רק שתדע, ארוחת הבוקר מוגשת בחדר בקומה התחתונה ליד הבריכה.' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.reply.hotel.passport' },
    { kind: 'receipt', text: T('מידע ארוך ומהיר — ובמקום לקפוא, ביקשת לחזור עליו. זה כלי.', 'Long, fast info — and instead of freezing, you asked them to repeat. That’s a tool.') },
    { kind: 'summary' },
  ],
};
void RECOVERY_ITEMS;
