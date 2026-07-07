import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 25 — "Fixing Problems" (Phase 5 · Mastery).
 * The Day-1 recovery kit graduates to full adversity: wrong order, double charge — fixed with
 * grace. Friction is a script, not a crisis. You state the problem calmly and let them solve it.
 */
export const DAY25_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.fix.not-ordered', text: "This isn't what I ordered.", meaning: T('זה לא מה שהזמנתי.', "This isn't what I ordered."),
    tip: T('רגוע ועובדתי — לא ריב. מתארים, לא מאשימים.', 'Calm and factual — not a fight. You describe, you don’t accuse.') },
  { id: 'en.phrase.fix.theres-mistake', text: "I think there's a mistake.", meaning: T('אני חושב שיש טעות.', "I think there's a mistake."),
    tip: T('הפתיח העדין לכל בעיה. פותח דלת במקום להרים קול.', 'The gentle opener for any problem. Opens a door instead of raising a voice.') },
  { id: 'en.phrase.fix.charged-twice', text: 'I was charged twice.', meaning: T('חייבו אותי פעמיים.', 'I was charged twice.') },
  { id: 'en.phrase.fix.can-you-fix', text: 'Can you fix it?', meaning: T('אפשר לתקן את זה?', 'Can you fix it?') },
  { id: 'en.phrase.fix.no-problem-thanks', text: 'No problem, thank you.', meaning: T('אין בעיה, תודה.', 'No problem, thank you.'),
    tip: T('סוגר תקלה בחן. השארת אותם עם חיוך, לא עם מתח.', 'Closes friction with grace. You leave them with a smile, not tension.') },
  // hear — staff solutions
  { id: 'en.reply.fix.so-sorry', text: "I'm so sorry about that.", meaning: T('אני מצטער על זה מאוד.', "I'm so sorry about that.") },
  { id: 'en.reply.fix.bring-right', text: "I'll bring the right one.", meaning: T('אביא את הנכון.', "I'll bring the right one.") },
  { id: 'en.reply.fix.check-bill', text: 'Let me check the bill.', meaning: T('תן לי לבדוק את החשבון.', 'Let me check the bill.') },
  { id: 'en.reply.fix.refund-now', text: "I'll refund it now.", meaning: T('אחזיר לך את הכסף עכשיו.', "I'll refund it now.") },
  { id: 'en.reply.fix.on-the-house', text: "It's on the house.", meaning: T('זה על חשבון הבית.', "It's on the house.") },
  { id: 'en.reply.fix.anything-else', text: 'Is there anything else?', meaning: T('יש עוד משהו?', 'Is there anything else?') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_FIX: BootcampDialogue = {
  id: 'fixing-problems',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: "Here's your meal — one steak!", he: 'הנה הארוחה שלך — סטייק אחד!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "This isn't what I ordered.", he: 'זה לא מה שהזמנתי.', itemId: 'en.phrase.fix.not-ordered', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: "Here's — your — steak!", he: 'הנה — הסטייק — שלך!' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: "This isn't what I ordered.", he: 'זה לא מה שהזמנתי.', itemId: 'en.phrase.fix.not-ordered', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: "Oh no, I'm so sorry! What did you order?", he: 'אוי לא, אני מצטער מאוד! מה הזמנת?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Can you fix it?', he: 'אפשר לתקן את זה?', itemId: 'en.phrase.fix.can-you-fix', correct: true, next: 'n3' },
      { en: "I think there's a mistake.", he: 'אני חושב שיש טעות.', itemId: 'en.phrase.fix.theres-mistake', correct: true, next: 'n2b' },
    ] },
    { id: 'n2b', who: 'npc', next: 'c2b', en: "You're right, there's been a mix-up — I'll sort it out.", he: 'אתה צודק, הייתה אי-הבנה — אני אסדר את זה.' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Can you fix it?', he: 'אפשר לתקן את זה?', itemId: 'en.phrase.fix.can-you-fix', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "Of course — I'll bring the right one right away. And it's on the house.", he: 'כמובן — אביא את הנכון מיד. וזה על חשבון הבית.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: "It's — on — the house.", he: 'זה — על — חשבון הבית.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: "Here's your bill for this evening.", he: 'הנה החשבון לערב.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'I was charged twice.', he: 'חייבו אותי פעמיים.', itemId: 'en.phrase.fix.charged-twice', correct: true, next: 'n5' },
      { en: 'No problem, thank you.', he: 'אין בעיה, תודה. (רגע — יש טעות בחשבון)', itemId: 'en.phrase.fix.no-problem-thanks', correct: false, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', next: 'c4b', en: 'Is everything alright with the bill?', he: 'הכל בסדר עם החשבון?' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'I was charged twice.', he: 'חייבו אותי פעמיים.', itemId: 'en.phrase.fix.charged-twice', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: "You're right — my mistake. I'll refund it now.", he: 'אתה צודק — הטעות שלי. אחזיר לך עכשיו.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'No problem, thank you.', he: 'אין בעיה, תודה.', itemId: 'en.phrase.fix.no-problem-thanks', correct: true, next: 'n6' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: "I'll refund — it — now.", he: 'אחזיר — לך — עכשיו.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'No problem, thank you.', he: 'אין בעיה, תודה.', itemId: 'en.phrase.fix.no-problem-thanks', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: "All fixed. Thank you for your patience — the evening's on us!", he: 'הכל תוקן. תודה על הסבלנות — הערב עלינו!' },
  ],
};

export const DAY25: BootcampDayContent = {
  day: 25,
  title: T('לתקן בעיה', 'Fixing Problems'),
  items: DAY25_ITEMS,
  dialogues: { 'fixing-problems': SCENE_FIX },
  steps: [
    { kind: 'talk', icon: '🛠️', title: T('משימה 25: לתקן בעיה', 'Mission 25: Fixing Problems'),
      body: [
        T('דברים משתבשים בטיולים — מנה לא נכונה, חיוב כפול. אתה לא. תקלה היא תסריט, לא משבר.', 'Things go wrong on trips — a wrong dish, a double charge. You don’t. Friction is a script, not a crisis.'),
        T('ערכת ההישרדות מיום 1 מתבגרת: מתארים בעיה ברוגע, ונותנים להם לפתור אותה.', 'The Day-1 kit grows up: you state a problem calmly, and let them solve it.'),
      ], cta: T('להתמודד עם התקלה', 'Handle the problem') },
    { kind: 'tool', itemId: 'en.phrase.fix.not-ordered', index: 1, total: 4, label: T('לתאר בעיה', 'State the problem') },
    { kind: 'tool', itemId: 'en.phrase.fix.theres-mistake', index: 2, total: 4, label: T('פתיח עדין', 'A gentle opener') },
    { kind: 'tool', itemId: 'en.phrase.fix.charged-twice', index: 3, total: 4, label: T('בעיה בחשבון', 'A billing problem') },
    { kind: 'tool', itemId: 'en.phrase.fix.can-you-fix', index: 4, total: 4, label: T('לבקש פתרון', 'Ask for a fix') },
    { kind: 'replies', saidItemId: 'en.phrase.fix.not-ordered',
      replyIds: ['en.reply.fix.so-sorry', 'en.reply.fix.bring-right', 'en.reply.fix.on-the-house', 'en.reply.fix.refund-now'] },
    { kind: 'receipt', text: T('אתה מזהה איך צוות מגיב לתלונה מנומסת — התנצלות, תיקון, פיצוי.', 'You recognize how staff respond to a polite complaint — apology, fix, compensation.') },
    { kind: 'quiz', itemId: 'en.reply.fix.bring-right', wrongIds: ['en.reply.fix.check-bill', 'en.reply.fix.on-the-house'] },
    { kind: 'quiz', itemId: 'en.reply.fix.refund-now', wrongIds: ['en.reply.fix.so-sorry', 'en.reply.fix.anything-else'] },
    { kind: 'dialogue', dialogueId: 'fixing-problems' },
    { kind: 'receipt', text: T('תיקנת מנה שגויה וחיוב כפול — ברוגע, בנימוס, ויצאת עם ארוחה חינם.', 'You fixed a wrong dish and a double charge — calmly, politely, and walked out with a free meal.') },
    { kind: 'swipe', itemIds: DAY25_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'The manager says we can only refund to the original card is that alright with you?', he: 'המנהל אומר שאפשר להחזיר רק לכרטיס המקורי — זה בסדר מבחינתך?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.fix.charged-twice' },
    { kind: 'receipt', text: T('תנאי החזר מפתיע ומהיר — וביקשת שיחזרו עליו לפני שאתה מסכים.', 'A fast, surprise refund condition — and you asked them to repeat it before agreeing.') },
    { kind: 'summary' },
  ],
};
