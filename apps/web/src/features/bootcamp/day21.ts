import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 21 — "Wifi, SIM & Practical" (Phase 4 · City Life).
 * The 21st-century needs classic phrasebooks skip: a SIM plan, data, a charger, the wifi
 * password. Phone alive, you alive — and the translator backstop is now always in your pocket.
 */
export const DAY21_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.sim.need-sim', text: 'I need a SIM card.', meaning: T('אני צריך כרטיס סים.', 'I need a SIM card.'),
    tip: T('התבנית: I need a ___ — מבקשת כל דבר בפשטות ובביטחון.', 'Template: I need a ___ — asks for anything, simply and confidently.') },
  { id: 'en.phrase.sim.data-plan', text: 'A data plan, please.', meaning: T('חבילת גלישה, בבקשה.', 'A data plan, please.') },
  { id: 'en.phrase.sim.how-much', text: 'How much is it?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('לפני שמתחייבים לחבילה — תמיד שואלים מחיר.', 'Before committing to a plan — always ask the price.') },
  { id: 'en.phrase.sim.charger', text: 'Do you have a charger?', meaning: T('יש לכם מטען?', 'Do you have a charger?') },
  // hear — the shop's replies
  { id: 'en.reply.sim.how-long-stay', text: 'How long are you staying?', meaning: T('לכמה זמן אתה נשאר?', 'How long are you staying?') },
  { id: 'en.reply.sim.ten-gigs', text: 'This one has ten gigs.', meaning: T("לזה יש עשרה ג'יגה.", 'This one has ten gigs.') },
  { id: 'en.reply.sim.twenty-euros', text: "It's twenty euros.", meaning: T('זה עשרים יורו.', "It's twenty euros.") },
  { id: 'en.reply.sim.need-passport', text: "I'll need your passport.", meaning: T('אצטרך את הדרכון שלך.', "I'll need your passport.") },
  { id: 'en.reply.sim.set-up-now', text: "I'll set it up now.", meaning: T('אני אתקין עכשיו.', "I'll set it up now.") },
  { id: 'en.reply.sim.password-receipt', text: 'The wifi password is on your receipt.', meaning: T('סיסמת הוויי-פיי על הקבלה.', 'The wifi password is on your receipt.') },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_SIM: BootcampDialogue = {
  id: 'sim-shop',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hi there! How can I help?', he: 'היי! איך אפשר לעזור?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'I need a SIM card.', he: 'אני צריך כרטיס סים.', itemId: 'en.phrase.sim.need-sim', correct: true, next: 'n2' },
      { en: 'A data plan, please.', he: 'חבילת גלישה, בבקשה.', itemId: 'en.phrase.sim.data-plan', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Great — this tourist plan has ten gigs. How long are you staying?', he: "מעולה — לחבילה התיירותית הזאת יש עשרה ג'יגה. לכמה זמן אתה נשאר?" },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'How much is it?', he: 'כמה זה עולה?', itemId: 'en.phrase.sim.how-much', correct: true, next: 'n3' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: 'How long — are you — staying?', he: 'לכמה זמן — אתה — נשאר?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'How much is it?', he: 'כמה זה עולה?', itemId: 'en.phrase.sim.how-much', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: "It's twenty euros, and I'll need your passport.", he: 'זה עשרים יורו, ואצטרך את הדרכון שלך.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Do you have a charger?', he: 'יש לכם מטען?', itemId: 'en.phrase.sim.charger', correct: true, next: 'n3b' },
      { en: 'Thank you!', he: 'תודה! (מגיש דרכון)', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: 'A charger? Yes — right behind you. Anything else?', he: 'מטען? כן — ממש מאחוריך. עוד משהו?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: "All set — I'll set it up now. The wifi password is on your receipt.", he: 'הכל מוכן — אני אתקין עכשיו. סיסמת הוויי-פיי על הקבלה.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'The wifi password — is on — your receipt.', he: 'סיסמת הוויי-פיי — נמצאת — על הקבלה.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: "You're connected! Enjoy your trip.", he: 'אתה מחובר! תיהנה מהטיול.' },
  ],
};

export const DAY21: BootcampDayContent = {
  day: 21,
  title: T('וויי-פיי, סים ופרקטיקה', 'Wifi, SIM & Practical'),
  items: DAY21_ITEMS,
  dialogues: { 'sim-shop': SCENE_SIM },
  steps: [
    { kind: 'talk', icon: '📶', title: T('משימה 21: וויי-פיי, סים ופרקטיקה', 'Mission 21: Wifi, SIM & Practical'),
      body: [
        T('הצרכים של המאה ה-21 שאף שיחון לא מלמד: כרטיס סים, גלישה, מטען, סיסמת וויי-פיי.', 'The 21st-century needs no phrasebook teaches: a SIM card, data, a charger, the wifi password.'),
        T('טלפון חי — אתה חי. וגיבוי המתרגם תמיד בכיס.', 'Phone alive — you alive. And the translator backup is always in your pocket.'),
      ], cta: T('להיכנס לחנות הטלפונים', 'Walk into the phone shop') },
    { kind: 'tool', itemId: 'en.phrase.sim.need-sim', index: 1, total: 4, label: T('לבקש מה שצריך', 'Ask for what you need') },
    { kind: 'tool', itemId: 'en.phrase.sim.data-plan', index: 2, total: 4, label: T('לבקש גלישה', 'Ask for data') },
    { kind: 'tool', itemId: 'en.phrase.sim.how-much', index: 3, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'en.phrase.sim.charger', index: 4, total: 4, label: T('לבקש מטען', 'Ask for a charger') },
    { kind: 'replies', saidItemId: 'en.phrase.sim.need-sim',
      replyIds: ['en.reply.sim.how-long-stay', 'en.reply.sim.ten-gigs', 'en.reply.sim.twenty-euros', 'en.reply.sim.need-passport'] },
    { kind: 'receipt', text: T('אתה מזהה את שאלות המוכר — משך שהות, נפח גלישה, מחיר, דרכון.', 'You recognize the seller’s questions — length of stay, data amount, price, passport.') },
    { kind: 'quiz', itemId: 'en.reply.sim.ten-gigs', wrongIds: ['en.reply.sim.twenty-euros', 'en.reply.sim.set-up-now'] },
    { kind: 'quiz', itemId: 'en.reply.sim.need-passport', wrongIds: ['en.reply.sim.how-long-stay', 'en.reply.sim.password-receipt'] },
    { kind: 'dialogue', dialogueId: 'sim-shop' },
    { kind: 'receipt', text: T('קנית סים, חבילת גלישה ומטען — והתחברת לאינטרנט. הטלפון חי.', 'You bought a SIM, a data plan, and a charger — and got online. Your phone is alive.') },
    { kind: 'swipe', itemIds: DAY21_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Would you like the plan to auto-renew each month or just the one-time top-up for now?', he: 'תרצה שהחבילה תתחדש אוטומטית כל חודש או רק טעינה חד-פעמית לעכשיו?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.sim.charger' },
    { kind: 'receipt', text: T('שאלה טכנית ומהירה על החבילה — וביקשת שיחזרו במקום לבחור בעיוורון.', 'A fast, technical question about the plan — and you asked them to repeat instead of choosing blindly.') },
    { kind: 'summary' },
  ],
};
