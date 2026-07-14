import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { DAY4_FR_ITEMS } from './day4.js';
import { DAY7_FR_ITEMS } from './day7.js';
import { DAY13_FR_ITEMS } from './day13.js';
import { DAY23_FR_ITEMS } from './day23.js';
import { DAY25_FR_ITEMS } from './day25.js';

/**
 * French Mission 30 — "Une journée complète seul à l’étranger" (A Complete Day Abroad Alone). The
 * finale — cold, no new content: coffee → taxi → lunch → a problem → a warm goodbye, one take.
 * Reuses days 4, 7, 13, 23 & 25 items. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY4_FR_ITEMS, ...DAY7_FR_ITEMS, ...DAY13_FR_ITEMS, ...DAY23_FR_ITEMS, ...DAY25_FR_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY30_FR_ITEMS: BootcampItem[] = [
  ...pick(
    'fr.phrase.coffee.iced-coffee',
    'fr.phrase.taxi.to-address',
    'fr.phrase.rest.table-for-two', 'fr.phrase.rest.ill-have',
    'fr.phrase.fix.not-ordered',
    'fr.phrase.talk.beautiful-place', 'fr.phrase.talk.nice-talking',
  ),
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const COLD_MORNING: BootcampDialogue = {
  id: 'fin-morning',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Bonjour ! Qu’est-ce que je vous sers ?', tr: TR('Morning! What can I get you?', 'בוקר! מה להביא לך?'), he: 'בוקר! מה להביא לך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je voudrais un café glacé, s’il vous plaît.', tr: TR("I'd like an iced coffee, please.", 'אני רוצה קפה קר, בבקשה.'), he: 'אני רוצה קפה קר, בבקשה.', itemId: 'fr.phrase.coffee.iced-coffee', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Ça arrive — autre chose ce matin ?', tr: TR('Coming up — anything else this morning?', 'תכף מוכן — עוד משהו הבוקר?'), he: 'תכף מוכן — עוד משהו הבוקר?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'C’est tout, merci.', tr: TR("That's all, thanks.", 'זה הכל, תודה.'), he: 'זה הכל, תודה.', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Passez une excellente journée !', tr: TR('Have a wonderful day!', 'שיהיה יום נפלא!'), he: 'שיהיה יום נפלא!' },
  ],
};

const COLD_TAXI: BootcampDialogue = {
  id: 'fin-taxi',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Où puis-je vous emmener ?', tr: TR('Where can I take you?', 'לאן לקחת אותך?'), he: 'לאן לקחת אותך?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'À cette adresse, s’il vous plaît.', tr: TR('To this address, please.', 'לכתובת הזאת, בבקשה.'), he: 'לכתובת הזאת, בבקשה.', itemId: 'fr.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Ce sera environ dix. Nous voilà.', tr: TR("It'll be about ten. We're here.", 'זה יהיה בערך עשרה. הגענו.'), he: 'זה יהיה בערך עשרה. הגענו.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Bonne journée !', tr: TR('Enjoy your day!', 'תיהנה מהיום!'), he: 'תיהנה מהיום!' },
  ],
};

const COLD_LUNCH: BootcampDialogue = {
  id: 'fin-lunch',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Vous êtes combien ?', tr: TR('Hello! How many people?', 'שלום! כמה אנשים?'), he: 'שלום! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Une table pour deux, s’il vous plaît.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'fr.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Parfait. Prêt à commander ?', tr: TR('Wonderful. Ready to order?', 'נהדר. מוכן להזמין?'), he: 'נהדר. מוכן להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais prendre les pâtes, s’il vous plaît.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'fr.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Excellent choix — ça arrive tout de suite !', tr: TR('Great choice — coming right up!', 'בחירה מעולה — תכף מגיע!'), he: 'בחירה מעולה — תכף מגיע!' },
  ],
};

const COLD_TWIST: BootcampDialogue = {
  id: 'fin-twist',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Voici — le risotto aux fruits de mer !', tr: TR("Here you are — the seafood risotto!", 'בבקשה — ריזוטו פירות ים!'), he: 'בבקשה — ריזוטו פירות ים!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Ce n’est pas ce que j’ai commandé.', tr: TR("This isn't what I ordered.", 'זה לא מה שהזמנתי.'), he: 'זה לא מה שהזמנתי.', itemId: 'fr.phrase.fix.not-ordered', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Oh — toutes mes excuses ! Les pâtes, c’est ça ? Je corrige tout de suite.', tr: TR("Oh — my apologies! The pasta, right? I'll fix it now.", 'אוי — סליחה! הפסטה, נכון? אני מתקן עכשיו.'), he: 'אוי — סליחה! הפסטה, נכון? אני מתקן עכשיו.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Le bon plat, offert par la maison. Encore désolé !', tr: TR('The right dish, on the house. So sorry again!', 'המנה הנכונה, על חשבון הבית. שוב סליחה!'), he: 'המנה הנכונה, על חשבון הבית. שוב סליחה!' },
  ],
};

const COLD_EVENING: BootcampDialogue = {
  id: 'fin-evening',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Quel coucher de soleil. Vous avez choisi un endroit magnifique.', tr: TR("What a sunset. You've picked a beautiful spot.", 'איזו שקיעה. בחרת מקום יפהפה.'), he: 'איזו שקיעה. בחרת מקום יפהפה.' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Cet endroit est magnifique.', tr: TR('This place is beautiful.', 'המקום הזה יפהפה.'), he: 'המקום הזה יפהפה.', itemId: 'fr.phrase.talk.beautiful-place', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'C’est vrai. Alors — bon voyage, mon ami.', tr: TR('It really is. Well — safe travels, my friend.', 'באמת. אז — נסיעה טובה, חבר.'), he: 'באמת. אז — נסיעה טובה, חבר.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'C’était sympa de discuter avec vous.', tr: TR('It was nice talking to you.', 'היה נעים לדבר איתך.'), he: 'היה נעים לדבר איתך.', itemId: 'fr.phrase.talk.nice-talking', correct: true, next: 'n3' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Prenez soin de vous — et revenez un jour !', tr: TR('Take care — and come back one day!', 'שמור על עצמך — ותחזור יום אחד!'), he: 'שמור על עצמך — ותחזור יום אחד!' },
  ],
};

export const DAY30_FR: BootcampDayContent = {
  day: 30,
  title: T('יום שלם לבד בחו״ל', 'A Complete Day Abroad Alone'),
  items: DAY30_FR_ITEMS,
  dialogues: { 'fin-morning': COLD_MORNING, 'fin-taxi': COLD_TAXI, 'fin-lunch': COLD_LUNCH, 'fin-twist': COLD_TWIST, 'fin-evening': COLD_EVENING },
  steps: [
    { kind: 'talk', icon: '🎖️', title: T('משימה 30: יום שלם לבד בחו״ל', 'Mission 30: A Complete Day Abroad Alone'),
      body: [
        T('זהו. אין חומר חדש — רק אתה, מבוקר עד לילה, לבד.', 'This is it. No new material — just you, morning to night, alone.'),
        T('קפה, מונית, ארוחה, תקלה, ופרידה חמה. טייק אחד, בקור. פסק דין אמיתי.', 'Coffee, a taxi, a meal, a problem, and a warm goodbye. One take, cold. A real verdict.'),
        T('לפני 30 משימות פחדת לפתוח את הפה. עכשיו תראה מי אתה.', 'Thirty missions ago you were afraid to open your mouth. Now — see who you are.'),
      ], cta: T('להתחיל את היום', 'Begin the day') },
    { kind: 'dialogue', dialogueId: 'fin-morning' },
    { kind: 'receipt', text: T('בוקר: קפה בקור, בלי הכנה. היום התחיל טוב.', 'Morning: a cold coffee, no prep. The day started well.') },
    { kind: 'dialogue', dialogueId: 'fin-taxi' },
    { kind: 'receipt', text: T('מונית: יעד ותשלום. אתה זז בעיר לבד.', 'Taxi: destination and payment. You move through the city alone.') },
    { kind: 'ambush', npc: { en: 'Ça vous dérange si je prends la route panoramique ? Ça peut ajouter quelques minutes mais sans supplément.', tr: TR('Mind if I take the scenic route it might add a few minutes but no extra charge?', 'אכפת לך אם אקח את הדרך היפה? זה אולי יוסיף כמה דקות אבל בלי תוספת תשלום.'), he: 'אכפת לך אם אקח את הדרך היפה? זה אולי יוסיף כמה דקות אבל בלי תוספת תשלום.' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.phrase.taxi.to-address' },
    { kind: 'dialogue', dialogueId: 'fin-lunch' },
    { kind: 'receipt', text: T('צהריים: שולחן והזמנה — חלק לגמרי.', 'Noon: a table and an order — completely smooth.') },
    { kind: 'dialogue', dialogueId: 'fin-twist' },
    { kind: 'receipt', text: T('תקלה: מנה שגויה — ותיקנת אותה ברוגע, כמו מקצוען.', 'A problem: a wrong dish — and you fixed it calmly, like a pro.') },
    { kind: 'ambush', npc: { en: 'Et vous voulez que je vous emballe aussi le mauvais plat à emporter, sans frais ?', tr: TR('And would you like me to box the wrong dish for you to take away as well no charge?', 'ותרצה שאארוז לך גם את המנה השגויה לקחת, בלי תשלום?'), he: 'ותרצה שאארוז לך גם את המנה השגויה לקחת, בלי תשלום?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.fix.not-ordered' },
    { kind: 'dialogue', dialogueId: 'fin-evening' },
    { kind: 'receipt', text: T('ערב: שיחה חמה עם זר, ופרידה יפה. יום שלם לבד בחו״ל — שרדת. יותר מזה: נהנית.', 'Evening: a warm chat with a stranger, and a lovely goodbye. A full day abroad alone — you survived. More than that: you enjoyed it.') },
    { kind: 'summary' },
  ],
};
