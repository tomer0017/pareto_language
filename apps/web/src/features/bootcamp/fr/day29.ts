import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';
import { DAY7_FR_ITEMS } from './day7.js';
import { DAY13_FR_ITEMS } from './day13.js';
import { DAY15_FR_ITEMS } from './day15.js';
import { DAY25_FR_ITEMS } from './day25.js';

/**
 * French Mission 29 — "Répétition générale : soirée complète" (Dress Rehearsal: Full Evening). Cold
 * integration, no new content: taxi → restaurant → problem → payment, one take, one designed
 * surprise. Reuses days 7, 13, 15 & 25 items. `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

const byId = new Map([...DAY7_FR_ITEMS, ...DAY13_FR_ITEMS, ...DAY15_FR_ITEMS, ...DAY25_FR_ITEMS].map((i) => [i.id, i]));
const pick = (...ids: string[]): BootcampItem[] => ids.map((id) => byId.get(id)!).filter(Boolean);

export const DAY29_FR_ITEMS: BootcampItem[] = [
  ...pick(
    'fr.phrase.taxi.to-address', 'fr.phrase.taxi.stop-here',
    'fr.phrase.rest.table-for-two', 'fr.phrase.rest.ill-have', 'fr.phrase.rest.bill-please',
    'fr.phrase.fix.not-ordered', 'fr.phrase.fix.charged-twice',
    'fr.phrase.pay.by-card',
  ),
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const COLD_TAXI: BootcampDialogue = {
  id: 'dr-taxi',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1', en: 'Bonsoir ! Où allez-vous ?', tr: TR('Evening! Where to?', 'ערב! לאן?'), he: 'ערב! לאן?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'À cette adresse, s’il vous plaît.', tr: TR('To this address, please.', 'לכתובת הזאת, בבקשה.'), he: 'לכתובת הזאת, בבקשה.', itemId: 'fr.phrase.taxi.to-address', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Environ quinze avec la circulation. Ici, ça va ?', tr: TR('About fifteen with the traffic. Here okay?', 'בערך חמש-עשרה עם הפקקים. כאן בסדר?'), he: 'בערך חמש-עשרה עם הפקקים. כאן בסדר?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Arrêtez-vous ici, s’il vous plaît.', tr: TR('Stop here, please.', 'עצור כאן, בבקשה.'), he: 'עצור כאן, בבקשה.', itemId: 'fr.phrase.taxi.stop-here', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Nous voilà — bonne soirée !', tr: TR('Here you are — have a good night!', 'הגענו — לילה טוב!'), he: 'הגענו — לילה טוב!' },
  ],
};

const COLD_ORDER: BootcampDialogue = {
  id: 'dr-order',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bienvenue ! Vous êtes combien ?', tr: TR('Welcome! How many people?', 'ברוך הבא! כמה אנשים?'), he: 'ברוך הבא! כמה אנשים?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Une table pour deux, s’il vous plaît.', tr: TR('A table for two, please.', 'שולחן לשניים, בבקשה.'), he: 'שולחן לשניים, בבקשה.', itemId: 'fr.phrase.rest.table-for-two', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Suivez-moi. Prêt à commander ?', tr: TR('Right this way. Ready to order?', 'בבקשה אחריי. מוכן להזמין?'), he: 'בבקשה אחריי. מוכן להזמין?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais prendre les pâtes, s’il vous plaît.', tr: TR("I'll have the pasta, please.", 'אני אקח את הפסטה, בבקשה.'), he: 'אני אקח את הפסטה, בבקשה.', itemId: 'fr.phrase.rest.ill-have', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Excellent — ça arrive tout de suite !', tr: TR('Excellent — coming right up!', 'מצוין — תכף מגיע!'), he: 'מצוין — תכף מגיע!' },
  ],
};

const COLD_PROBLEM: BootcampDialogue = {
  id: 'dr-problem',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Voici votre plat — un steak !', tr: TR("Here's your meal — one steak!", 'הנה הארוחה — סטייק אחד!'), he: 'הנה הארוחה — סטייק אחד!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Ce n’est pas ce que j’ai commandé.', tr: TR("This isn't what I ordered.", 'זה לא מה שהזמנתי.'), he: 'זה לא מה שהזמנתי.', itemId: 'fr.phrase.fix.not-ordered', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Oh non — vraiment désolé ! Je vous apporte le bon tout de suite.', tr: TR("Oh no — so sorry! I'll bring the right one right away.", 'אוי לא — מצטער מאוד! אביא את הנכון מיד.'), he: 'אוי לא — מצטער מאוד! אביא את הנכון מיד.' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n3' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Le bon plat, et c’est offert par la maison. Bon appétit !', tr: TR("The right dish, and it's on the house. Enjoy!", 'המנה הנכונה, ועל חשבון הבית. בתיאבון!'), he: 'המנה הנכונה, ועל חשבון הבית. בתיאבון!' },
  ],
};

const COLD_PAY: BootcampDialogue = {
  id: 'dr-pay',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'C’est tout ? Autre chose pour vous ce soir ?', tr: TR('All done? Anything else for you tonight?', 'סיימנו? עוד משהו הערב?'), he: 'סיימנו? עוד משהו הערב?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'On peut avoir l’addition, s’il vous plaît ?', tr: TR('Could we have the bill, please?', 'אפשר את החשבון, בבקשה?'), he: 'אפשר את החשבון, בבקשה?', itemId: 'fr.phrase.rest.bill-please', correct: true, next: 'n2' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', fast: true, next: 'c2', en: 'Voici — ça fait trente. Espèces ou carte ?', tr: TR("Here you go — that's thirty. Cash or card?", 'בבקשה — זה שלושים. מזומן או כרטיס?'), he: 'בבקשה — זה שלושים. מזומן או כרטיס?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je vais payer par carte.', tr: TR("I'll pay by card.", 'אני אשלם בכרטיס.'), he: 'אני אשלם בכרטיס.', itemId: 'fr.phrase.pay.by-card', correct: true, next: 'n3' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', end: true, en: 'Parfait — bonne soirée !', tr: TR('Perfect — have a lovely evening!', 'מושלם — ערב נפלא!'), he: 'מושלם — ערב נפלא!' },
  ],
};

export const DAY29_FR: BootcampDayContent = {
  day: 29,
  title: T('חזרה גנרלית: ערב שלם', 'Dress Rehearsal: Full Evening'),
  items: DAY29_FR_ITEMS,
  dialogues: { 'dr-taxi': COLD_TAXI, 'dr-order': COLD_ORDER, 'dr-problem': COLD_PROBLEM, 'dr-pay': COLD_PAY },
  steps: [
    { kind: 'talk', icon: '🎬', title: T('משימה 29: חזרה גנרלית — ערב שלם', 'Mission 29: Dress Rehearsal — Full Evening'),
      body: [
        T('אין חומר חדש. ערב שלם בטייק אחד: מונית, מסעדה, תקלה, תשלום.', 'No new material. A full evening in one take: taxi, restaurant, a problem, payment.'),
        T('זו החזרה של הספורטאי לפני יום התחרות — עם הפתעה מתוכננת אחת. בוא נזרום.', 'This is the athlete’s rehearsal before race day — with one designed surprise. Let’s flow.'),
      ], cta: T('אקשן — מתחילים', 'Action — begin') },
    { kind: 'dialogue', dialogueId: 'dr-taxi' },
    { kind: 'receipt', text: T('מונית בקור — יעד, מחיר, עצירה. הערב יצא לדרך.', 'A cold taxi — destination, price, stop. The evening is underway.') },
    { kind: 'dialogue', dialogueId: 'dr-order' },
    { kind: 'receipt', text: T('שולחן והזמנה — חלק, בלי הכנה.', 'Table and order — smooth, no prep.') },
    { kind: 'dialogue', dialogueId: 'dr-problem' },
    { kind: 'receipt', text: T('ההפתעה: מנה שגויה — ותיקנת אותה ברוגע.', 'The surprise: a wrong dish — and you fixed it calmly.') },
    { kind: 'ambush', npc: { en: 'En attendant qu’on répare ça, je peux vous apporter une boisson offerte pour me faire pardonner ?', tr: TR('While we fix that can I bring you a drink on the house to make up for it?', 'בזמן שאנחנו מתקנים — שאביא לך משקה על חשבון הבית כפיצוי?'), he: 'בזמן שאנחנו מתקנים — שאביא לך משקה על חשבון הבית כפיצוי?' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.phrase.fix.charged-twice' },
    { kind: 'dialogue', dialogueId: 'dr-pay' },
    { kind: 'receipt', text: T('ערב שלם בטייק אחד — מונית, ארוחה, תקלה, תשלום. זרימה אחת. כמעט כיף.', 'A full evening in one take — taxi, meal, problem, payment. One flow. Almost fun.') },
    { kind: 'summary' },
  ],
};
