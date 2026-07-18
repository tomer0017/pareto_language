import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';
import { DAY19_ES_ITEMS } from './day19.js';
import { DAY20_ES_ITEMS } from './day20.js';
import { DAY23_ES_ITEMS } from './day23.js';

/**
 * Spanish Mission 24 — "Punto de control: día en la ciudad" (City Day Checkpoint). Cold integration,
 * no new content: transport → attraction → chat, cold and chained, reusing days 19, 20 & 23 items.
 * Same structure as English day 24. `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY19_ES_ITEMS, ...DAY20_ES_ITEMS, ...DAY23_ES_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY24_ES_ITEMS: BootcampItem[] = [
  ...pick(
    'es.phrase.trans.one-ticket', 'es.phrase.trans.does-stop',
    'es.phrase.attr.two-tickets', 'es.phrase.attr.discount',
    'es.phrase.talk.beautiful-place', 'es.phrase.talk.recommend-place',
  ),
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const COLD_TRANSPORT: BootcampDialogue = {
  id: 'cold-transport',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: '¿A dónde va?', tr: TR('Where are you headed?', 'לאן אתה נוסע?'), he: 'לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un boleto para el centro, por favor.', tr: TR('One ticket to the center, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'es.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Andén número dos, sale en cinco minutos.', tr: TR('Platform two, leaves in five minutes.', 'רציף שתיים, יוצא בעוד חמש דקות.'), he: 'רציף שתיים, יוצא בעוד חמש דקות.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Para en el museo?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'es.phrase.trans.does-stop', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Sí — tres paradas. ¡Que tenga buen día!', tr: TR('Yep — three stops. Enjoy!', 'כן — שלוש תחנות. תיהנה!'), he: 'כן — שלוש תחנות. תיהנה!' },
  ],
};

const COLD_ATTRACTION: BootcampDialogue = {
  id: 'cold-attraction',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Bienvenido! ¿Cuántas entradas?', tr: TR('Welcome! How many tickets?', 'ברוך הבא! כמה כרטיסים?'), he: 'ברוך הבא! כמה כרטיסים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Dos entradas, por favor.', tr: TR('Two tickets, please.', 'שני כרטיסים, בבקשה.'), he: 'שני כרטיסים, בבקשה.', itemId: 'es.phrase.attr.two-tickets', correct: true, next: 'n2' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Veinte euros. Abrimos a las nueve, última entrada a las cinco.', tr: TR('Twenty euros. We open at nine, last entry at five.', 'עשרים יורו. פותחים בתשע, כניסה אחרונה בחמש.'), he: 'עשרים יורו. פותחים בתשע, כניסה אחרונה בחמש.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Hay descuento?', tr: TR('Is there a discount?', 'יש הנחה?'), he: 'יש הנחה?', itemId: 'es.phrase.attr.discount', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Los estudiantes pagan la mitad. ¡Que disfrute del museo!', tr: TR('Students get half price. Enjoy the museum!', 'סטודנטים חצי מחיר. תיהנה במוזיאון!'), he: 'סטודנטים חצי מחיר. תיהנה במוזיאון!' },
  ],
};

const COLD_CHAT: BootcampDialogue = {
  id: 'cold-chat',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Bonito día! ¿De dónde es?', tr: TR('Beautiful day! Where are you from?', 'יום יפה! מאיפה אתה?'), he: 'יום יפה! מאיפה אתה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Este lugar es precioso.', tr: TR('This place is beautiful.', 'המקום הזה יפהפה.'), he: 'המקום הזה יפהפה.', itemId: 'es.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: '¿Primera vez aquí? Debería visitar el casco antiguo.', tr: TR('First time here? You should try the old town.', 'פעם ראשונה כאן? כדאי לך לנסות את העיר העתיקה.'), he: 'פעם ראשונה כאן? כדאי לך לנסות את העיר העתיקה.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Me puede recomendar un sitio?', tr: TR('Can you recommend a place?', 'אתה יכול להמליץ על מקום?'), he: 'אתה יכול להמליץ על מקום?', itemId: 'es.phrase.talk.recommend-place', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: '«Mamá Rosa» — dígale que la mando yo. ¡Buen viaje!', tr: TR("'Mama Rosa' — tell her I sent you. Enjoy your trip!", "'מאמא רוזה' — תגיד שאני שלחתי. תיהנה מהטיול!"), he: "'מאמא רוזה' — תגיד שאני שלחתי. תיהנה מהטיול!" },
  ],
};

export const DAY24_ES: BootcampDayContent = {
  day: 24,
  title: T('נקודת ביקורת: יום עיר', 'CHECKPOINT: City Day'),
  items: DAY24_ES_ITEMS,
  dialogues: { 'cold-transport': COLD_TRANSPORT, 'cold-attraction': COLD_ATTRACTION, 'cold-chat': COLD_CHAT },
  steps: [
    { kind: 'talk', icon: '🏙️', title: T('נקודת ביקורת: יום עיר', 'Checkpoint: City Day'),
      body: [
        T('אין חומר חדש. רק הוכחה — יום שלם בעיר זרה, לבד.', 'No new material. Just proof — a full day in a foreign city, alone.'),
        T('תחבורה, אטרקציה, שיחה עם מקומי. הכל קר, ברצף, עם החלפת הקשר בין רגע לרגע.', 'Transport, an attraction, a chat with a local. All cold, chained, switching context from moment to moment.'),
      ], cta: T('לצאת ליום בעיר', 'Head out into the city') },
    { kind: 'dialogue', dialogueId: 'cold-transport' },
    { kind: 'receipt', text: T('שרדת תחבורה ציבורית בקור — כרטיס, רציף, יעד.', 'You survived public transport cold — ticket, platform, destination.') },
    { kind: 'ambush', npc: { en: 'Cambio de plan, ahora es el andén cuatro — ¡dese prisa!', tr: TR("Change of plan that platform's now platform four — better hurry along!", 'שינוי — הרציף עכשיו רציף ארבע — כדאי שתמהר!'), he: 'שינוי — הרציף עכשיו רציף ארבע — כדאי שתמהר!' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.trans.does-stop' },
    { kind: 'dialogue', dialogueId: 'cold-attraction' },
    { kind: 'receipt', text: T('שרדת קופת אטרקציה בקור — כרטיסים, שעות, הנחה.', 'You survived an attraction desk cold — tickets, hours, discount.') },
    { kind: 'ambush', npc: { en: 'La visita guiada en inglés empieza en realidad en dos minutos — ¿quiere unirse?', tr: TR('The English guided tour actually starts in two minutes would you like to join it?', 'הסיור המודרך באנגלית מתחיל בעצם בעוד שתי דקות — תרצה להצטרף?'), he: 'הסיור המודרך באנגלית מתחיל בעצם בעוד שתי דקות — תרצה להצטרף?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.phrase.attr.discount' },
    { kind: 'dialogue', dialogueId: 'cold-chat' },
    { kind: 'receipt', text: T('יום עיר שלם — תחבורה, אטרקציה, ושיחה — בקור. עיר זרה נהייתה מגרש ביתי.', 'A full city day — transport, attraction, and a chat — cold. A foreign city became home turf.') },
    { kind: 'summary' },
  ],
};
