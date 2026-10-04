import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { m08Flow } from '../practiceArrival.js';

/**
 * French Mission 8 — "Arrivée à l’hôtel" (Hotel Check-in). French parallel of English mission 7: same
 * objective (reservation → passport → key → floor → breakfast), same step structure, same engine.
 * French target lines + `tr:{en,he}` glosses; `fr.*` ids. No French video yet. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY7_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.hotel.reservation', text: 'J’ai une réservation.', meaning: T('יש לי הזמנה.', 'I have a reservation.'),
    tip: T('הפתיח לדלפק המלון. תבנית: J’ai une ___.', 'The front-desk opener. Template: J’ai une ___.') },
  { id: 'fr.phrase.hotel.under-name', text: 'Au nom de Cohen.', meaning: T('על השם כהן.', 'Under the name Cohen.') },
  { id: 'fr.phrase.hotel.breakfast', text: 'Le petit-déjeuner est compris ?', meaning: T('ארוחת הבוקר כלולה?', 'Is breakfast included?') },
  { id: 'fr.phrase.hotel.here-you-go', text: 'Voilà, tenez.', meaning: T('בבקשה, הנה.', 'Here you go.') },
  // hear
  { id: 'fr.reply.hotel.passport', text: 'Votre passeport, s’il vous plaît.', meaning: T('הדרכון שלך, בבקשה.', 'Your passport, please.') },
  { id: 'fr.reply.hotel.sign-here', text: 'Signez ici, s’il vous plaît.', meaning: T('תחתום כאן, בבקשה.', 'Sign here, please.') },
  { id: 'fr.reply.hotel.room-number', text: 'Vous êtes dans la chambre deux cent quatre.', meaning: T('אתה בחדר 204.', "You're in room two-oh-four.") },
  { id: 'fr.reply.hotel.second-floor', text: 'C’est au deuxième étage.', meaning: T('זה בקומה השנייה.', "It's on the second floor.") },
  { id: 'fr.reply.hotel.breakfast-time', text: 'Le petit-déjeuner est de sept heures à dix heures.', meaning: T('ארוחת בוקר משבע עד עשר.', 'Breakfast is from seven to ten.') },
  { id: 'fr.reply.hotel.elevator', text: 'L’ascenseur est sur votre droite.', meaning: T('המעלית מימינך.', 'The elevator is on your right.') },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you', 'fr.phrase.recovery.one-moment'),
];

const SCENE: BootcampDialogue = {
  id: 'hotel-checkin',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonsoir ! Comment puis-je vous aider ?', tr: TR('Good evening! How can I help you?', 'ערב טוב! איך אפשר לעזור?'), he: 'ערב טוב! איך אפשר לעזור?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai une réservation, au nom de Cohen.', tr: TR('I have a reservation, under the name Cohen.', 'יש לי הזמנה, על השם כהן.'), he: 'יש לי הזמנה, על השם כהן.', itemId: 'fr.phrase.hotel.reservation', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Comment — puis-je — vous — aider ?', tr: TR('How — can — I — help you?', 'איך — אפשר — לעזור — לך?'), he: 'איך — אפשר — לעזור — לך?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai une réservation, au nom de Cohen.', tr: TR('I have a reservation, under the name Cohen.', 'יש לי הזמנה, על השם כהן.'), he: 'יש לי הזמנה, על השם כהן.', itemId: 'fr.phrase.hotel.reservation', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Bienvenue, monsieur Cohen. Votre passeport, s’il vous plaît.', tr: TR('Welcome, Mr. Cohen. Your passport, please.', 'ברוך הבא, מר כהן. הדרכון שלך, בבקשה.'), he: 'ברוך הבא, מר כהן. הדרכון שלך, בבקשה.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Voilà, tenez.', tr: TR('Here you go.', 'בבקשה, הנה.'), he: 'בבקשה, הנה.', itemId: 'fr.phrase.hotel.here-you-go', correct: true, next: 'n3' },
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', fast: true, next: 'c3', en: 'Merci. Vous êtes dans la chambre deux cent quatre, au deuxième étage. Voici votre clé.', tr: TR("Thank you. You're in room two-oh-four, on the second floor. Here is your key.", 'תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.'), he: 'תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Le petit-déjeuner est compris ?', tr: TR('Is breakfast included?', 'ארוחת הבוקר כלולה?'), he: 'ארוחת הבוקר כלולה?', itemId: 'fr.phrase.hotel.breakfast', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'n5', en: 'Oui ! Le petit-déjeuner est de sept heures à dix heures. L’ascenseur est sur votre droite.', tr: TR('Yes! Breakfast is from seven to ten. The elevator is on your right.', 'כן! ארוחת בוקר משבע עד עשר. המעלית מימינך.'), he: 'כן! ארוחת בוקר משבע עד עשר. המעלית מימינך.' },
    { id: 'n5', who: 'npc', end: true, en: 'Bon séjour !', tr: TR('Enjoy your stay!', 'תיהנה מהשהות!'), he: 'תיהנה מהשהות!' },
  ],
};

export const DAY7_FR: BootcampDayContent = {
  day: 7,
  title: T("צ'ק-אין במלון", 'Hotel Check-in'),
  items: DAY7_FR_ITEMS,
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
        { text: 'réservation', meaning: T('הזמנה', 'reservation'), emoji: '📅' },
        { text: 'nom', meaning: T('שם', 'name'), emoji: '📛', review: true },
        { text: 'petit-déjeuner', meaning: T('ארוחת בוקר', 'breakfast'), emoji: '🍳' },
        { text: 'passeport', meaning: T('דרכון', 'passport'), emoji: '🛂' },
      ], buildFromItemId: 'fr.phrase.hotel.reservation' },
    // From the key sentences onward the flow is shared by all languages: see practiceArrival.ts.
    ...m08Flow('fr'),
  ],
};
