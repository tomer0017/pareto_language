import { T, recovery } from './recovery.js';
import { DAY7_ITEMS } from './day7.js';
import { DAY8_ITEMS } from './day8.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 10 — "Arrival Day Checkpoint" (cold integration, no new content).
 * Chains the arrival situations (taxi → hotel) at speed with cold ambushes — the first proof
 * milestone. Reuses items from missions 7 & 8; the value is evidence, not new vocabulary.
 */
const byId = new Map([...DAY7_ITEMS, ...DAY8_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY10_ITEMS: BootcampItem[] = [
  ...pick(
    'en.phrase.taxi.to-address', 'en.phrase.taxi.stop-here', 'en.reply.taxi.about-fifteen', 'en.reply.taxi.here-good',
    'en.phrase.hotel.reservation', 'en.phrase.hotel.breakfast', 'en.reply.hotel.passport', 'en.reply.hotel.second-floor', 'en.reply.hotel.breakfast-time',
  ),
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const TAXI_COLD: BootcampDialogue = {
  id: 'cold-taxi',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Evening! Where can I take you?', he: 'ערב! לאן לקחת אותך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'To this address, please.', he: 'לכתובת הזאת, בבקשה.', itemId: 'en.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: "Sure — it'll be about fifteen euros with the traffic.", he: 'בטח — זה יהיה בערך חמישה עשר יורו עם הפקקים.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Okay, thank you.', he: 'בסדר, תודה.', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Here we are. Have a great night!', he: 'הגענו. לילה נהדר!' },
  ],
};

const HOTEL_COLD: BootcampDialogue = {
  id: 'cold-hotel',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Welcome! Checking in tonight?', he: 'ברוך הבא! עושה צ\'ק-אין הערב?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'I have a reservation.', he: 'יש לי הזמנה.', itemId: 'en.phrase.hotel.reservation', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: "Great — room two-oh-four, second floor, breakfast is seven to ten.", he: 'מצוין — חדר 204, קומה שנייה, ארוחת בוקר משבע עד עשר.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Is breakfast included?', he: 'ארוחת הבוקר כלולה?', itemId: 'en.phrase.hotel.breakfast', correct: true, next: 'n3' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Enjoy your stay!', he: 'תיהנה מהשהות!' },
  ],
};

export const DAY10: BootcampDayContent = {
  day: 10,
  title: T('נקודת ביקורת: יום הגעה', 'Arrival Day Checkpoint'),
  items: DAY10_ITEMS,
  dialogues: { 'cold-taxi': TAXI_COLD, 'cold-hotel': HOTEL_COLD },
  steps: [
    { kind: 'talk', icon: '🛬', title: T('נקודת ביקורת: יום הגעה', 'Checkpoint: Arrival Day'),
      body: [
        T('אין חומר חדש היום. רק הוכחה.', 'No new material today. Just proof.'),
        T('נחתת. מונית למלון, ואז צ\'ק-אין — הכל מהר, בלי הכנה, בלי כתוביות מלאות.', 'You’ve landed. A taxi to the hotel, then check-in — all fast, unprepared, minimal subtitles.'),
        T('בוא נראה מה באמת נשאר לך בראש.', 'Let’s see what actually stuck.'),
      ], cta: T('נחתנו — קדימה', 'We’ve landed — go') },
    { kind: 'dialogue', dialogueId: 'cold-taxi' },
    { kind: 'receipt', text: T('שרדת מונית בקור — יעד, מחיר, תשלום. בלי הכנה.', 'You survived a cold taxi — destination, price, payment. No prep.') },
    { kind: 'ambush', npc: { en: 'Is here alright or would you prefer the main entrance just up ahead?', he: 'כאן בסדר או שאתה מעדיף את הכניסה הראשית קצת קדימה?' },
      correctItemId: 'en.reply.taxi.here-good', wrongItemId: 'en.reply.taxi.about-fifteen' },
    { kind: 'dialogue', dialogueId: 'cold-hotel' },
    { kind: 'receipt', text: T('שרדת צ\'ק-אין בקור — הזמנה, חדר, ארוחת בוקר.', 'You survived a cold check-in — reservation, room, breakfast.') },
    { kind: 'ambush', npc: { en: 'Just so you have it breakfast is downstairs from seven and the wifi code is on your key card.', he: 'רק שיהיה לך — ארוחת בוקר למטה משבע, וקוד הוויי-פיי על כרטיס המפתח.' },
      correctItemId: 'en.reply.hotel.breakfast-time', wrongItemId: 'en.reply.hotel.passport' },
    { kind: 'receipt', text: T('יום הגעה שלם — מונית ומלון — בקור. אתה מוכן לנחות באמת.', 'A full arrival day — taxi and hotel — cold. You are ready to actually land.') },
    { kind: 'summary' },
  ],
};
