import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { DAY19_FR_ITEMS } from './day19.js';
import { DAY20_FR_ITEMS } from './day20.js';
import { DAY23_FR_ITEMS } from './day23.js';

/**
 * French Mission 24 — "Point de contrôle : journée en ville" (City Day Checkpoint). Cold integration,
 * no new content: transport → attraction → chat, cold and chained, reusing days 19, 20 & 23 items.
 * Same structure as English day 24. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY19_FR_ITEMS, ...DAY20_FR_ITEMS, ...DAY23_FR_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY24_FR_ITEMS: BootcampItem[] = [
  ...pick(
    'fr.phrase.trans.one-ticket', 'fr.phrase.trans.does-stop',
    'fr.phrase.attr.two-tickets', 'fr.phrase.attr.discount',
    'fr.phrase.talk.beautiful-place', 'fr.phrase.talk.recommend-place',
  ),
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const COLD_TRANSPORT: BootcampDialogue = {
  id: 'cold-transport',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Vous allez où ?', tr: TR('Where are you headed?', 'לאן אתה נוסע?'), he: 'לאן אתה נוסע?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Un billet pour le centre, s’il vous plaît.', tr: TR('One ticket to the center, please.', 'כרטיס אחד למרכז, בבקשה.'), he: 'כרטיס אחד למרכז, בבקשה.', itemId: 'fr.phrase.trans.one-ticket', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Quai numéro deux, ça part dans cinq minutes.', tr: TR('Platform two, leaves in five minutes.', 'רציף שתיים, יוצא בעוד חמש דקות.'), he: 'רציף שתיים, יוצא בעוד חמש דקות.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Ça s’arrête au musée ?', tr: TR('Does this stop at the museum?', 'זה עוצר במוזיאון?'), he: 'זה עוצר במוזיאון?', itemId: 'fr.phrase.trans.does-stop', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Oui — trois arrêts. Bonne journée !', tr: TR('Yep — three stops. Enjoy!', 'כן — שלוש תחנות. תיהנה!'), he: 'כן — שלוש תחנות. תיהנה!' },
  ],
};

const COLD_ATTRACTION: BootcampDialogue = {
  id: 'cold-attraction',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bienvenue ! Combien de billets ?', tr: TR('Welcome! How many tickets?', 'ברוך הבא! כמה כרטיסים?'), he: 'ברוך הבא! כמה כרטיסים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Deux billets, s’il vous plaît.', tr: TR('Two tickets, please.', 'שני כרטיסים, בבקשה.'), he: 'שני כרטיסים, בבקשה.', itemId: 'fr.phrase.attr.two-tickets', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Vingt euros. On ouvre à neuf heures, dernière entrée à dix-sept heures.', tr: TR('Twenty euros. We open at nine, last entry at five.', 'עשרים יורו. פותחים בתשע, כניסה אחרונה בחמש.'), he: 'עשרים יורו. פותחים בתשע, כניסה אחרונה בחמש.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Il y a une réduction ?', tr: TR('Is there a discount?', 'יש הנחה?'), he: 'יש הנחה?', itemId: 'fr.phrase.attr.discount', correct: true, next: 'n3' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Les étudiants paient demi-tarif. Bonne visite du musée !', tr: TR('Students get half price. Enjoy the museum!', 'סטודנטים חצי מחיר. תיהנה במוזיאון!'), he: 'סטודנטים חצי מחיר. תיהנה במוזיאון!' },
  ],
};

const COLD_CHAT: BootcampDialogue = {
  id: 'cold-chat',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Belle journée ! Vous venez d’où ?', tr: TR('Beautiful day! Where are you from?', 'יום יפה! מאיפה אתה?'), he: 'יום יפה! מאיפה אתה?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Cet endroit est magnifique.', tr: TR('This place is beautiful.', 'המקום הזה יפהפה.'), he: 'המקום הזה יפהפה.', itemId: 'fr.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Première fois ici ? Vous devriez essayer la vieille ville.', tr: TR('First time here? You should try the old town.', 'פעם ראשונה כאן? כדאי לך לנסות את העיר העתיקה.'), he: 'פעם ראשונה כאן? כדאי לך לנסות את העיר העתיקה.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Vous pouvez recommander un endroit ?', tr: TR('Can you recommend a place?', 'אתה יכול להמליץ על מקום?'), he: 'אתה יכול להמליץ על מקום?', itemId: 'fr.phrase.talk.recommend-place', correct: true, next: 'n3' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: '« Mama Rosa » — dites-lui que je vous envoie. Bon voyage !', tr: TR("'Mama Rosa' — tell her I sent you. Enjoy your trip!", "'מאמא רוזה' — תגיד שאני שלחתי. תיהנה מהטיול!"), he: "'מאמא רוזה' — תגיד שאני שלחתי. תיהנה מהטיול!" },
  ],
};

export const DAY24_FR: BootcampDayContent = {
  day: 24,
  title: T('נקודת ביקורת: יום עיר', 'CHECKPOINT: City Day'),
  items: DAY24_FR_ITEMS,
  dialogues: { 'cold-transport': COLD_TRANSPORT, 'cold-attraction': COLD_ATTRACTION, 'cold-chat': COLD_CHAT },
  steps: [
    { kind: 'talk', icon: '🏙️', title: T('נקודת ביקורת: יום עיר', 'Checkpoint: City Day'),
      body: [
        T('אין חומר חדש. רק הוכחה — יום שלם בעיר זרה, לבד.', 'No new material. Just proof — a full day in a foreign city, alone.'),
        T('תחבורה, אטרקציה, שיחה עם מקומי. הכל קר, ברצף, עם החלפת הקשר בין רגע לרגע.', 'Transport, an attraction, a chat with a local. All cold, chained, switching context from moment to moment.'),
      ], cta: T('לצאת ליום בעיר', 'Head out into the city') },
    { kind: 'dialogue', dialogueId: 'cold-transport' },
    { kind: 'receipt', text: T('שרדת תחבורה ציבורית בקור — כרטיס, רציף, יעד.', 'You survived public transport cold — ticket, platform, destination.') },
    { kind: 'ambush', npc: { en: 'Changement de plan, c’est maintenant le quai quatre — dépêchez-vous !', tr: TR("Change of plan that platform's now platform four — better hurry along!", 'שינוי — הרציף עכשיו רציף ארבע — כדאי שתמהר!'), he: 'שינוי — הרציף עכשיו רציף ארבע — כדאי שתמהר!' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.phrase.trans.does-stop' },
    { kind: 'dialogue', dialogueId: 'cold-attraction' },
    { kind: 'receipt', text: T('שרדת קופת אטרקציה בקור — כרטיסים, שעות, הנחה.', 'You survived an attraction desk cold — tickets, hours, discount.') },
    { kind: 'ambush', npc: { en: 'La visite guidée en anglais commence en fait dans deux minutes — vous voulez la rejoindre ?', tr: TR('The English guided tour actually starts in two minutes would you like to join it?', 'הסיור המודרך באנגלית מתחיל בעצם בעוד שתי דקות — תרצה להצטרף?'), he: 'הסיור המודרך באנגלית מתחיל בעצם בעוד שתי דקות — תרצה להצטרף?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.attr.discount' },
    { kind: 'dialogue', dialogueId: 'cold-chat' },
    { kind: 'receipt', text: T('יום עיר שלם — תחבורה, אטרקציה, ושיחה — בקור. עיר זרה נהייתה מגרש ביתי.', 'A full city day — transport, attraction, and a chat — cold. A foreign city became home turf.') },
    { kind: 'summary' },
  ],
};
