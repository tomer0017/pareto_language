import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { DAY7_ES_ITEMS } from './day7.js';
import { DAY8_ES_ITEMS } from './day8.js';

/**
 * Spanish Mission 10 — "Punto de control: día de llegada" (Arrival Day Checkpoint). Cold integration,
 * no new content: chains taxi → hotel at speed with cold ambushes, reusing days 7 & 8 items. Same
 * structure as English day 10. `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY7_ES_ITEMS, ...DAY8_ES_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY10_ES_ITEMS: BootcampItem[] = [
  ...pick(
    'es.phrase.taxi.to-address', 'es.phrase.taxi.stop-here', 'es.reply.taxi.about-fifteen', 'es.reply.taxi.here-good',
    'es.phrase.hotel.reservation', 'es.phrase.hotel.breakfast', 'es.reply.hotel.passport', 'es.reply.hotel.second-floor', 'es.reply.hotel.breakfast-time',
  ),
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const TAXI_COLD: BootcampDialogue = {
  id: 'cold-taxi',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: '¡Buenas noches! ¿A dónde le llevo?', tr: TR('Evening! Where can I take you?', 'ערב! לאן לקחת אותך?'), he: 'ערב! לאן לקחת אותך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'A esta dirección, por favor.', tr: TR('To this address, please.', 'לכתובת הזאת, בבקשה.'), he: 'לכתובת הזאת, בבקשה.', itemId: 'es.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Claro — serán unos quince euros con el tráfico.', tr: TR("Sure — it'll be about fifteen euros with the traffic.", 'בטח — זה יהיה בערך חמישה עשר יורו עם הפקקים.'), he: 'בטח — זה יהיה בערך חמישה עשר יורו עם הפקקים.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'De acuerdo, gracias.', tr: TR('Okay, thank you.', 'בסדר, תודה.'), he: 'בסדר, תודה.', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Ya hemos llegado. ¡Buenas noches!', tr: TR('Here we are. Have a great night!', 'הגענו. לילה נהדר!'), he: 'הגענו. לילה נהדר!' },
  ],
};

const HOTEL_COLD: BootcampDialogue = {
  id: 'cold-hotel',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: '¡Bienvenido! ¿Se registra esta noche?', tr: TR('Welcome! Checking in tonight?', 'ברוך הבא! עושה צ\'ק-אין הערב?'), he: 'ברוך הבא! עושה צ\'ק-אין הערב?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Tengo una reserva.', tr: TR('I have a reservation.', 'יש לי הזמנה.'), he: 'יש לי הזמנה.', itemId: 'es.phrase.hotel.reservation', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Perfecto — habitación doscientos cuatro, segunda planta, desayuno de siete a diez.', tr: TR("Great — room two-oh-four, second floor, breakfast is seven to ten.", 'מצוין — חדר 204, קומה שנייה, ארוחת בוקר משבע עד עשר.'), he: 'מצוין — חדר 204, קומה שנייה, ארוחת בוקר משבע עד עשר.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿El desayuno está incluido?', tr: TR('Is breakfast included?', 'ארוחת הבוקר כלולה?'), he: 'ארוחת הבוקר כלולה?', itemId: 'es.phrase.hotel.breakfast', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: '¡Que disfrute su estancia!', tr: TR('Enjoy your stay!', 'תיהנה מהשהות!'), he: 'תיהנה מהשהות!' },
  ],
};

export const DAY10_ES: BootcampDayContent = {
  day: 10,
  title: T('נקודת ביקורת: יום הגעה', 'Arrival Day Checkpoint'),
  items: DAY10_ES_ITEMS,
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
    { kind: 'ambush', npc: { en: '¿Aquí está bien, o prefiere la entrada principal, justo ahí delante?', tr: TR('Is here alright or would you prefer the main entrance just up ahead?', 'כאן בסדר או שאתה מעדיף את הכניסה הראשית קצת קדימה?'), he: 'כאן בסדר או שאתה מעדיף את הכניסה הראשית קצת קדימה?' },
      correctItemId: 'es.reply.taxi.here-good', wrongItemId: 'es.reply.taxi.about-fifteen' },
    { kind: 'dialogue', dialogueId: 'cold-hotel' },
    { kind: 'receipt', text: T('שרדת צ\'ק-אין בקור — הזמנה, חדר, ארוחת בוקר.', 'You survived a cold check-in — reservation, room, breakfast.') },
    { kind: 'ambush', npc: { en: 'Solo para que lo tenga, el desayuno es abajo a partir de las siete, y la clave del wifi está en su tarjeta.', tr: TR('Just so you have it breakfast is downstairs from seven and the wifi code is on your key card.', 'רק שיהיה לך — ארוחת בוקר למטה משבע, וקוד הוויי-פיי על כרטיס המפתח.'), he: 'רק שיהיה לך — ארוחת בוקר למטה משבע, וקוד הוויי-פיי על כרטיס המפתח.' },
      correctItemId: 'es.reply.hotel.breakfast-time', wrongItemId: 'es.reply.hotel.passport' },
    { kind: 'receipt', text: T('יום הגעה שלם — מונית ומלון — בקור. אתה מוכן לנחות באמת.', 'A full arrival day — taxi and hotel — cold. You are ready to actually land.') },
    { kind: 'summary' },
  ],
};
