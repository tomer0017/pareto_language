import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { DAY7_FR_ITEMS } from './day7.js';
import { DAY8_FR_ITEMS } from './day8.js';

/**
 * French Mission 10 — "Point de contrôle : jour d’arrivée" (Arrival Day Checkpoint). Cold integration,
 * no new content: chains taxi → hotel at speed with cold ambushes, reusing days 7 & 8 items. Same
 * structure as English day 10. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY7_FR_ITEMS, ...DAY8_FR_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY10_FR_ITEMS: BootcampItem[] = [
  ...pick(
    'fr.phrase.taxi.to-address', 'fr.phrase.taxi.stop-here', 'fr.reply.taxi.about-fifteen', 'fr.reply.taxi.here-good',
    'fr.phrase.hotel.reservation', 'fr.phrase.hotel.breakfast', 'fr.reply.hotel.passport', 'fr.reply.hotel.second-floor', 'fr.reply.hotel.breakfast-time',
  ),
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const TAXI_COLD: BootcampDialogue = {
  id: 'cold-taxi',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Bonsoir ! Où puis-je vous emmener ?', tr: TR('Evening! Where can I take you?', 'ערב! לאן לקחת אותך?'), he: 'ערב! לאן לקחת אותך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'À cette adresse, s’il vous plaît.', tr: TR('To this address, please.', 'לכתובת הזאת, בבקשה.'), he: 'לכתובת הזאת, בבקשה.', itemId: 'fr.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Bien sûr — ce sera environ quinze euros avec la circulation.', tr: TR("Sure — it'll be about fifteen euros with the traffic.", 'בטח — זה יהיה בערך חמישה עשר יורו עם הפקקים.'), he: 'בטח — זה יהיה בערך חמישה עשר יורו עם הפקקים.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'D’accord, merci.', tr: TR('Okay, thank you.', 'בסדר, תודה.'), he: 'בסדר, תודה.', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Nous voilà arrivés. Bonne soirée !', tr: TR('Here we are. Have a great night!', 'הגענו. לילה נהדר!'), he: 'הגענו. לילה נהדר!' },
  ],
};

const HOTEL_COLD: BootcampDialogue = {
  id: 'cold-hotel',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Bienvenue ! Vous arrivez ce soir ?', tr: TR('Welcome! Checking in tonight?', 'ברוך הבא! עושה צ\'ק-אין הערב?'), he: 'ברוך הבא! עושה צ\'ק-אין הערב?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'J’ai une réservation.', tr: TR('I have a reservation.', 'יש לי הזמנה.'), he: 'יש לי הזמנה.', itemId: 'fr.phrase.hotel.reservation', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Parfait — chambre deux cent quatre, deuxième étage, petit-déjeuner de sept à dix heures.', tr: TR("Great — room two-oh-four, second floor, breakfast is seven to ten.", 'מצוין — חדר 204, קומה שנייה, ארוחת בוקר משבע עד עשר.'), he: 'מצוין — חדר 204, קומה שנייה, ארוחת בוקר משבע עד עשר.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Le petit-déjeuner est compris ?', tr: TR('Is breakfast included?', 'ארוחת הבוקר כלולה?'), he: 'ארוחת הבוקר כלולה?', itemId: 'fr.phrase.hotel.breakfast', correct: true, next: 'n3' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Bon séjour !', tr: TR('Enjoy your stay!', 'תיהנה מהשהות!'), he: 'תיהנה מהשהות!' },
  ],
};

export const DAY10_FR: BootcampDayContent = {
  day: 10,
  title: T('נקודת ביקורת: יום הגעה', 'Arrival Day Checkpoint'),
  items: DAY10_FR_ITEMS,
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
    { kind: 'ambush', npc: { en: 'Ici, ça va, ou vous préférez l’entrée principale, juste devant ?', tr: TR('Is here alright or would you prefer the main entrance just up ahead?', 'כאן בסדר או שאתה מעדיף את הכניסה הראשית קצת קדימה?'), he: 'כאן בסדר או שאתה מעדיף את הכניסה הראשית קצת קדימה?' },
      correctItemId: 'fr.reply.taxi.here-good', wrongItemId: 'fr.reply.taxi.about-fifteen' },
    { kind: 'dialogue', dialogueId: 'cold-hotel' },
    { kind: 'receipt', text: T('שרדת צ\'ק-אין בקור — הזמנה, חדר, ארוחת בוקר.', 'You survived a cold check-in — reservation, room, breakfast.') },
    { kind: 'ambush', npc: { en: 'Juste pour info, le petit-déjeuner est en bas à partir de sept heures, et le code wifi est sur votre carte.', tr: TR('Just so you have it breakfast is downstairs from seven and the wifi code is on your key card.', 'רק שיהיה לך — ארוחת בוקר למטה משבע, וקוד הוויי-פיי על כרטיס המפתח.'), he: 'רק שיהיה לך — ארוחת בוקר למטה משבע, וקוד הוויי-פיי על כרטיס המפתח.' },
      correctItemId: 'fr.reply.hotel.breakfast-time', wrongItemId: 'fr.reply.hotel.passport' },
    { kind: 'receipt', text: T('יום הגעה שלם — מונית ומלון — בקור. אתה מוכן לנחות באמת.', 'A full arrival day — taxi and hotel — cold. You are ready to actually land.') },
    { kind: 'summary' },
  ],
};
