import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 25 — "Resolver un problema" (Fixing Problems). Spanish parallel of English day 25:
 * wrong order, double charge — fixed with grace. Friction is a script, not a crisis. `tr:{en,he}`
 * glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY25_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.fix.not-ordered', text: 'Esto no es lo que pedí.', meaning: T('זה לא מה שהזמנתי.', "This isn't what I ordered."),
    tip: T('רגוע ועובדתי — לא ריב. מתארים, לא מאשימים.', 'Calm and factual — not a fight. You describe, you don’t accuse.') },
  { id: 'es.phrase.fix.theres-mistake', text: 'Creo que hay un error.', meaning: T('אני חושב שיש טעות.', "I think there's a mistake."),
    tip: T('הפתיח העדין לכל בעיה. פותח דלת במקום להרים קול.', 'The gentle opener for any problem. Opens a door instead of raising a voice.') },
  { id: 'es.phrase.fix.charged-twice', text: 'Me han cobrado dos veces.', meaning: T('חייבו אותי פעמיים.', 'I was charged twice.') },
  { id: 'es.phrase.fix.can-you-fix', text: '¿Lo puede arreglar?', meaning: T('אפשר לתקן את זה?', 'Can you fix it?') },
  { id: 'es.phrase.fix.no-problem-thanks', text: 'No pasa nada, gracias.', meaning: T('אין בעיה, תודה.', 'No problem, thank you.'),
    tip: T('סוגר תקלה בחן. השארת אותם עם חיוך, לא עם מתח.', 'Closes friction with grace. You leave them with a smile, not tension.') },
  // hear — staff solutions
  { id: 'es.reply.fix.so-sorry', text: 'Lo siento muchísimo.', meaning: T('אני מצטער על זה מאוד.', "I'm so sorry about that.") },
  { id: 'es.reply.fix.bring-right', text: 'Le traigo el correcto.', meaning: T('אביא את הנכון.', "I'll bring the right one.") },
  { id: 'es.reply.fix.check-bill', text: 'Déjeme revisar la cuenta.', meaning: T('תן לי לבדוק את החשבון.', 'Let me check the bill.') },
  { id: 'es.reply.fix.refund-now', text: 'Le hago el reembolso ahora mismo.', meaning: T('אחזיר לך את הכסף עכשיו.', "I'll refund it now.") },
  { id: 'es.reply.fix.on-the-house', text: 'Invita la casa.', meaning: T('זה על חשבון הבית.', "It's on the house.") },
  { id: 'es.reply.fix.anything-else', text: '¿Hay algo más?', meaning: T('יש עוד משהו?', 'Is there anything else?') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_FIX: BootcampDialogue = {
  id: 'fixing-problems',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Aquí tiene su plato — ¡un filete!', tr: TR("Here's your meal — one steak!", 'הנה הארוחה שלך — סטייק אחד!'), he: 'הנה הארוחה שלך — סטייק אחד!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Esto no es lo que pedí.', tr: TR("This isn't what I ordered.", 'זה לא מה שהזמנתי.'), he: 'זה לא מה שהזמנתי.', itemId: 'es.phrase.fix.not-ordered', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Aquí tiene — su — filete.', tr: TR("Here's — your — steak!", 'הנה — הסטייק — שלך!'), he: 'הנה — הסטייק — שלך!' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Esto no es lo que pedí.', tr: TR("This isn't what I ordered.", 'זה לא מה שהזמנתי.'), he: 'זה לא מה שהזמנתי.', itemId: 'es.phrase.fix.not-ordered', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: '¡Ay, no, lo siento muchísimo! ¿Qué había pedido?', tr: TR("Oh no, I'm so sorry! What did you order?", 'אוי לא, אני מצטער מאוד! מה הזמנת?'), he: 'אוי לא, אני מצטער מאוד! מה הזמנת?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Lo puede arreglar?', tr: TR('Can you fix it?', 'אפשר לתקן את זה?'), he: 'אפשר לתקן את זה?', itemId: 'es.phrase.fix.can-you-fix', correct: true, next: 'n3' },
      { en: 'Creo que hay un error.', tr: TR("I think there's a mistake.", 'אני חושב שיש טעות.'), he: 'אני חושב שיש טעות.', itemId: 'es.phrase.fix.theres-mistake', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: 'Tiene razón, ha habido una confusión — lo soluciono.', tr: TR("You're right, there's been a mix-up — I'll sort it out.", 'אתה צודק, הייתה אי-הבנה — אני אסדר את זה.'), he: 'אתה צודק, הייתה אי-הבנה — אני אסדר את זה.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: '¿Lo puede arreglar?', tr: TR('Can you fix it?', 'אפשר לתקן את זה?'), he: 'אפשר לתקן את זה?', itemId: 'es.phrase.fix.can-you-fix', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Claro — le traigo el correcto enseguida. Y invita la casa.', tr: TR("Of course — I'll bring the right one right away. And it's on the house.", 'כמובן — אביא את הנכון מיד. וזה על חשבון הבית.'), he: 'כמובן — אביא את הנכון מיד. וזה על חשבון הבית.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Invita — la — casa.', tr: TR("It's — on — the house.", 'זה — על — חשבון הבית.'), he: 'זה — על — חשבון הבית.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Aquí tiene su cuenta de esta noche.', tr: TR("Here's your bill for this evening.", 'הנה החשבון לערב.'), he: 'הנה החשבון לערב.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Me han cobrado dos veces.', tr: TR('I was charged twice.', 'חייבו אותי פעמיים.'), he: 'חייבו אותי פעמיים.', itemId: 'es.phrase.fix.charged-twice', correct: true, next: 'n5' },
      { en: 'No pasa nada, gracias.', tr: TR('No problem, thank you.', 'אין בעיה, תודה. (רגע — יש טעות בחשבון)'), he: 'אין בעיה, תודה.', itemId: 'es.phrase.fix.no-problem-thanks', correct: false, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', next: 'c4b', en: '¿Va todo bien con la cuenta?', tr: TR('Is everything alright with the bill?', 'הכל בסדר עם החשבון?'), he: 'הכל בסדר עם החשבון?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Me han cobrado dos veces.', tr: TR('I was charged twice.', 'חייבו אותי פעמיים.'), he: 'חייבו אותי פעמיים.', itemId: 'es.phrase.fix.charged-twice', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Tiene razón — es un error mío. Le hago el reembolso ahora mismo.', tr: TR("You're right — my mistake. I'll refund it now.", 'אתה צודק — הטעות שלי. אחזיר לך עכשיו.'), he: 'אתה צודק — הטעות שלי. אחזיר לך עכשיו.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'No pasa nada, gracias.', tr: TR('No problem, thank you.', 'אין בעיה, תודה.'), he: 'אין בעיה, תודה.', itemId: 'es.phrase.fix.no-problem-thanks', correct: true, next: 'n6' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Le hago el reembolso — ahora — mismo.', tr: TR("I'll refund — it — now.", 'אחזיר — לך — עכשיו.'), he: 'אחזיר — לך — עכשיו.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'No pasa nada, gracias.', tr: TR('No problem, thank you.', 'אין בעיה, תודה.'), he: 'אין בעיה, תודה.', itemId: 'es.phrase.fix.no-problem-thanks', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Todo resuelto. Gracias por su paciencia — ¡la cena corre de nuestra cuenta!', tr: TR("All fixed. Thank you for your patience — the evening's on us!", 'הכל תוקן. תודה על הסבלנות — הערב עלינו!'), he: 'הכל תוקן. תודה על הסבלנות — הערב עלינו!' },
  ],
};

export const DAY25_ES: BootcampDayContent = {
  day: 25,
  title: T('לתקן בעיה', 'Fixing Problems'),
  items: DAY25_ES_ITEMS,
  dialogues: { 'fixing-problems': SCENE_FIX },
  steps: [
    { kind: 'talk', icon: '🛠️', title: T('משימה 25: לתקן בעיה', 'Mission 25: Fixing Problems'),
      body: [
        T('דברים משתבשים בטיולים — מנה לא נכונה, חיוב כפול. אתה לא. תקלה היא תסריט, לא משבר.', 'Things go wrong on trips — a wrong dish, a double charge. You don’t. Friction is a script, not a crisis.'),
        T('ערכת ההישרדות מיום 1 מתבגרת: מתארים בעיה ברוגע, ונותנים להם לפתור אותה.', 'The Day-1 kit grows up: you state a problem calmly, and let them solve it.'),
      ], cta: T('להתמודד עם התקלה', 'Handle the problem') },
    { kind: 'tool', itemId: 'es.phrase.fix.not-ordered', index: 1, total: 4, label: T('לתאר בעיה', 'State the problem') },
    { kind: 'tool', itemId: 'es.phrase.fix.theres-mistake', index: 2, total: 4, label: T('פתיח עדין', 'A gentle opener') },
    { kind: 'tool', itemId: 'es.phrase.fix.charged-twice', index: 3, total: 4, label: T('בעיה בחשבון', 'A billing problem') },
    { kind: 'tool', itemId: 'es.phrase.fix.can-you-fix', index: 4, total: 4, label: T('לבקש פתרון', 'Ask for a fix') },
    { kind: 'replies', saidItemId: 'es.phrase.fix.not-ordered',
      replyIds: ['es.reply.fix.so-sorry', 'es.reply.fix.bring-right', 'es.reply.fix.on-the-house', 'es.reply.fix.refund-now'] },
    { kind: 'receipt', text: T('אתה מזהה איך צוות מגיב לתלונה מנומסת — התנצלות, תיקון, פיצוי.', 'You recognize how staff respond to a polite complaint — apology, fix, compensation.') },
    { kind: 'quiz', itemId: 'es.reply.fix.bring-right', wrongIds: ['es.reply.fix.check-bill', 'es.reply.fix.on-the-house'] },
    { kind: 'quiz', itemId: 'es.reply.fix.refund-now', wrongIds: ['es.reply.fix.so-sorry', 'es.reply.fix.anything-else'] },
    { kind: 'dialogue', dialogueId: 'fixing-problems' },
    { kind: 'receipt', text: T('תיקנת מנה שגויה וחיוב כפול — ברוגע, בנימוס, ויצאת עם ארוחה חינם.', 'You fixed a wrong dish and a double charge — calmly, politely, and walked out with a free meal.') },
    { kind: 'swipe', itemIds: DAY25_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'El encargado dice que solo podemos hacer el reembolso a la tarjeta original — ¿le parece bien?', tr: TR('The manager says we can only refund to the original card is that alright with you?', 'המנהל אומר שאפשר להחזיר רק לכרטיס המקורי — זה בסדר מבחינתך?'), he: 'המנהל אומר שאפשר להחזיר רק לכרטיס המקורי — זה בסדר מבחינתך?' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.fix.charged-twice' },
    { kind: 'receipt', text: T('תנאי החזר מפתיע ומהיר — וביקשת שיחזרו עליו לפני שאתה מסכים.', 'A fast, surprise refund condition — and you asked them to repeat it before agreeing.') },
    { kind: 'summary' },
  ],
};
