import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { m08Flow } from '../practiceArrival.js';

/**
 * Spanish Mission 8 — "Registro en el hotel" (Hotel Check-in). Spanish parallel of English mission 7:
 * same objective (reservation → passport → key → floor → breakfast), same step structure, same
 * engine. Spanish target lines + `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY7_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.hotel.reservation', text: 'Tengo una reserva.', meaning: T('יש לי הזמנה.', 'I have a reservation.'),
    tip: T('הפתיח לדלפק המלון. תבנית: Tengo una ___.', 'The front-desk opener. Template: Tengo una ___.') },
  { id: 'es.phrase.hotel.under-name', text: 'A nombre de Cohen.', meaning: T('על השם כהן.', 'Under the name Cohen.') },
  { id: 'es.phrase.hotel.breakfast', text: '¿El desayuno está incluido?', meaning: T('ארוחת הבוקר כלולה?', 'Is breakfast included?') },
  { id: 'es.phrase.hotel.here-you-go', text: 'Aquí tiene.', meaning: T('בבקשה, הנה.', 'Here you go.') },
  // hear
  { id: 'es.reply.hotel.passport', text: 'Su pasaporte, por favor.', meaning: T('הדרכון שלך, בבקשה.', 'Your passport, please.') },
  { id: 'es.reply.hotel.sign-here', text: 'Firme aquí, por favor.', meaning: T('תחתום כאן, בבקשה.', 'Sign here, please.') },
  { id: 'es.reply.hotel.room-number', text: 'Está en la habitación doscientos cuatro.', meaning: T('אתה בחדר 204.', "You're in room two-oh-four.") },
  { id: 'es.reply.hotel.second-floor', text: 'Está en el segundo piso.', meaning: T('זה בקומה השנייה.', "It's on the second floor.") },
  { id: 'es.reply.hotel.breakfast-time', text: 'El desayuno es de siete a diez.', meaning: T('ארוחת בוקר משבע עד עשר.', 'Breakfast is from seven to ten.') },
  { id: 'es.reply.hotel.elevator', text: 'El ascensor está a su derecha.', meaning: T('המעלית מימינך.', 'The elevator is on your right.') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you', 'es.phrase.recovery.one-moment'),
];

const SCENE: BootcampDialogue = {
  id: 'hotel-checkin',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Buenas noches! ¿En qué puedo ayudarle?', tr: TR('Good evening! How can I help you?', 'ערב טוב! איך אפשר לעזור?'), he: 'ערב טוב! איך אפשר לעזור?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Tengo una reserva, a nombre de Cohen.', tr: TR('I have a reservation, under the name Cohen.', 'יש לי הזמנה, על השם כהן.'), he: 'יש לי הזמנה, על השם כהן.', itemId: 'es.phrase.hotel.reservation', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: '¿En — qué — puedo — ayudarle?', tr: TR('How — can — I — help you?', 'איך — אפשר — לעזור — לך?'), he: 'איך — אפשר — לעזור — לך?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Tengo una reserva, a nombre de Cohen.', tr: TR('I have a reservation, under the name Cohen.', 'יש לי הזמנה, על השם כהן.'), he: 'יש לי הזמנה, על השם כהן.', itemId: 'es.phrase.hotel.reservation', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Bienvenido, señor Cohen. Su pasaporte, por favor.', tr: TR('Welcome, Mr. Cohen. Your passport, please.', 'ברוך הבא, מר כהן. הדרכון שלך, בבקשה.'), he: 'ברוך הבא, מר כהן. הדרכון שלך, בבקשה.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Aquí tiene.', tr: TR('Here you go.', 'בבקשה, הנה.'), he: 'בבקשה, הנה.', itemId: 'es.phrase.hotel.here-you-go', correct: true, next: 'n3' },
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'Gracias. Está en la habitación doscientos cuatro, en el segundo piso. Aquí tiene su llave.', tr: TR("Thank you. You're in room two-oh-four, on the second floor. Here is your key.", 'תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.'), he: 'תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿El desayuno está incluido?', tr: TR('Is breakfast included?', 'ארוחת הבוקר כלולה?'), he: 'ארוחת הבוקר כלולה?', itemId: 'es.phrase.hotel.breakfast', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'n5', en: '¡Sí! El desayuno es de siete a diez. El ascensor está a su derecha.', tr: TR('Yes! Breakfast is from seven to ten. The elevator is on your right.', 'כן! ארוחת בוקר משבע עד עשר. המעלית מימינך.'), he: 'כן! ארוחת בוקר משבע עד עשר. המעלית מימינך.' },
    { id: 'n5', who: 'npc', end: true, en: '¡Que disfrute su estancia!', tr: TR('Enjoy your stay!', 'תיהנה מהשהות!'), he: 'תיהנה מהשהות!' },
  ],
};

export const DAY7_ES: BootcampDayContent = {
  day: 7,
  title: T("צ'ק-אין במלון", 'Hotel Check-in'),
  items: DAY7_ES_ITEMS,
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
        { text: 'reserva', meaning: T('הזמנה', 'reservation'), emoji: '📅' },
        { text: 'nombre', meaning: T('שם', 'name'), emoji: '📛', review: true },
        { text: 'desayuno', meaning: T('ארוחת בוקר', 'breakfast'), emoji: '🍳' },
        { text: 'pasaporte', meaning: T('דרכון', 'passport'), emoji: '🛂' },
      ], buildFromItemId: 'es.phrase.hotel.reservation' },
    // From the key sentences onward the flow is shared by all languages: see practiceArrival.ts.
    ...m08Flow('es'),
  ],
};
