import { T, recovery } from './recovery.js';
import { DAY19_ITEMS } from './day19.js';
import { DAY20_ITEMS } from './day20.js';
import { DAY23_ITEMS } from './day23.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 24 — "City Day Checkpoint" (Phase 4, cold integration, no new content).
 * Transport → attraction → chat, cold and chained. Context-switching is the real-life skill;
 * a foreign city becomes home turf. Reuses items from missions 19, 20 & 23.
 */
const byId = new Map([...DAY19_ITEMS, ...DAY20_ITEMS, ...DAY23_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY24_ITEMS: BootcampItem[] = [
  ...pick(
    'en.phrase.trans.one-ticket', 'en.phrase.trans.does-stop',
    'en.phrase.attr.two-tickets', 'en.phrase.attr.discount',
    'en.phrase.talk.beautiful-place', 'en.phrase.talk.recommend-place',
  ),
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const COLD_TRANSPORT: BootcampDialogue = {
  id: 'cold-transport',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Where are you headed?', he: 'לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'One ticket to the center, please.', he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'en.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Platform two, leaves in five minutes.', he: 'רציף שתיים, יוצא בעוד חמש דקות.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Does this stop at the museum?', he: 'זה עוצר במוזיאון?', itemId: 'en.phrase.trans.does-stop', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Yep — three stops. Enjoy!', he: 'כן — שלוש תחנות. תיהנה!' },
  ],
};

const COLD_ATTRACTION: BootcampDialogue = {
  id: 'cold-attraction',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Welcome! How many tickets?', he: 'ברוך הבא! כמה כרטיסים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Two tickets, please.', he: 'שני כרטיסים, בבקשה.', itemId: 'en.phrase.attr.two-tickets', correct: true, next: 'n2' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Twenty euros. We open at nine, last entry at five.', he: 'עשרים יורו. פותחים בתשע, כניסה אחרונה בחמש.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Is there a discount?', he: 'יש הנחה?', itemId: 'en.phrase.attr.discount', correct: true, next: 'n3' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Students get half price. Enjoy the museum!', he: 'סטודנטים חצי מחיר. תיהנה במוזיאון!' },
  ],
};

const COLD_CHAT: BootcampDialogue = {
  id: 'cold-chat',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Beautiful day! Where are you from?', he: 'יום יפה! מאיפה אתה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'This place is beautiful.', he: 'המקום הזה יפהפה.', itemId: 'en.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'First time here? You should try the old town.', he: 'פעם ראשונה כאן? כדאי לך לנסות את העיר העתיקה.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Can you recommend a place?', he: 'אתה יכול להמליץ על מקום?', itemId: 'en.phrase.talk.recommend-place', correct: true, next: 'n3' },
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: "'Mama Rosa' — tell her I sent you. Enjoy your trip!", he: "'מאמא רוזה' — תגיד שאני שלחתי. תיהנה מהטיול!" },
  ],
};

export const DAY24: BootcampDayContent = {
  day: 24,
  title: T('נקודת ביקורת: יום עיר', 'CHECKPOINT: City Day'),
  items: DAY24_ITEMS,
  dialogues: { 'cold-transport': COLD_TRANSPORT, 'cold-attraction': COLD_ATTRACTION, 'cold-chat': COLD_CHAT },
  steps: [
    { kind: 'talk', icon: '🏙️', title: T('נקודת ביקורת: יום עיר', 'Checkpoint: City Day'),
      body: [
        T('אין חומר חדש. רק הוכחה — יום שלם בעיר זרה, לבד.', 'No new material. Just proof — a full day in a foreign city, alone.'),
        T('תחבורה, אטרקציה, שיחה עם מקומי. הכל קר, ברצף, עם החלפת הקשר בין רגע לרגע.', 'Transport, an attraction, a chat with a local. All cold, chained, switching context from moment to moment.'),
      ], cta: T('לצאת ליום בעיר', 'Head out into the city') },
    { kind: 'dialogue', dialogueId: 'cold-transport' },
    { kind: 'receipt', text: T('שרדת תחבורה ציבורית בקור — כרטיס, רציף, יעד.', 'You survived public transport cold — ticket, platform, destination.') },
    { kind: 'ambush', npc: { en: "Change of plan that platform's now platform four — better hurry along!", he: 'שינוי — הרציף עכשיו רציף ארבע — כדאי שתמהר!' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.trans.does-stop' },
    { kind: 'dialogue', dialogueId: 'cold-attraction' },
    { kind: 'receipt', text: T('שרדת קופת אטרקציה בקור — כרטיסים, שעות, הנחה.', 'You survived an attraction desk cold — tickets, hours, discount.') },
    { kind: 'ambush', npc: { en: 'The English guided tour actually starts in two minutes would you like to join it?', he: 'הסיור המודרך באנגלית מתחיל בעצם בעוד שתי דקות — תרצה להצטרף?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.attr.discount' },
    { kind: 'dialogue', dialogueId: 'cold-chat' },
    { kind: 'receipt', text: T('יום עיר שלם — תחבורה, אטרקציה, ושיחה — בקור. עיר זרה נהייתה מגרש ביתי.', 'A full city day — transport, attraction, and a chat — cold. A foreign city became home turf.') },
    { kind: 'summary' },
  ],
};
