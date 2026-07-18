import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 21 — "Wifi, SIM y práctico" (Wifi, SIM & Practical). Spanish parallel of English
 * day 21: a SIM plan, data, a charger, the wifi password — phone alive, you alive. `tr:{en,he}`
 * glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY21_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.sim.need-sim', text: 'Necesito una tarjeta SIM.', meaning: T('אני צריך כרטיס סים.', 'I need a SIM card.'),
    tip: T('התבנית: Necesito ___ — מבקשת כל דבר בפשטות ובביטחון.', 'Template: Necesito ___ — asks for anything, simply and confidently.') },
  { id: 'es.phrase.sim.data-plan', text: 'Un plan de datos, por favor.', meaning: T('חבילת גלישה, בבקשה.', 'A data plan, please.') },
  { id: 'es.phrase.sim.how-much', text: '¿Cuánto es?', meaning: T('כמה זה עולה?', 'How much is it?'),
    tip: T('לפני שמתחייבים לחבילה — תמיד שואלים מחיר.', 'Before committing to a plan — always ask the price.') },
  { id: 'es.phrase.sim.charger', text: '¿Tienen un cargador?', meaning: T('יש לכם מטען?', 'Do you have a charger?') },
  // hear — the shop's replies
  { id: 'es.reply.sim.how-long-stay', text: '¿Cuánto tiempo se queda?', meaning: T('לכמה זמן אתה נשאר?', 'How long are you staying?') },
  { id: 'es.reply.sim.ten-gigs', text: 'Este tiene diez gigas.', meaning: T("לזה יש עשרה ג'יגה.", 'This one has ten gigs.') },
  { id: 'es.reply.sim.twenty-euros', text: 'Son veinte euros.', meaning: T('זה עשרים יורו.', "It's twenty euros.") },
  { id: 'es.reply.sim.need-passport', text: 'Voy a necesitar su pasaporte.', meaning: T('אצטרך את הדרכון שלך.', "I'll need your passport.") },
  { id: 'es.reply.sim.set-up-now', text: 'Se la configuro ahora mismo.', meaning: T('אני אתקין עכשיו.', "I'll set it up now.") },
  { id: 'es.reply.sim.password-receipt', text: 'La contraseña del wifi está en su tique.', meaning: T('סיסמת הוויי-פיי על הקבלה.', 'The wifi password is on your receipt.') },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_SIM: BootcampDialogue = {
  id: 'sim-shop',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿En qué puedo ayudarle?', tr: TR('Hi there! How can I help?', 'היי! איך אפשר לעזור?'), he: 'היי! איך אפשר לעזור?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Necesito una tarjeta SIM.', tr: TR('I need a SIM card.', 'אני צריך כרטיס סים.'), he: 'אני צריך כרטיס סים.', itemId: 'es.phrase.sim.need-sim', correct: true, next: 'n2' },
      { en: 'Un plan de datos, por favor.', tr: TR('A data plan, please.', 'חבילת גלישה, בבקשה.'), he: 'חבילת גלישה, בבקשה.', itemId: 'es.phrase.sim.data-plan', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Perfecto — este plan turístico tiene diez gigas. ¿Cuánto tiempo se queda?', tr: TR('Great — this tourist plan has ten gigs. How long are you staying?', "מעולה — לחבילה התיירותית הזאת יש עשרה ג'יגה. לכמה זמן אתה נשאר?"), he: "מעולה — לחבילה התיירותית הזאת יש עשרה ג'יגה. לכמה זמן אתה נשאר?" },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: '¿Cuánto es?', tr: TR('How much is it?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'es.phrase.sim.how-much', correct: true, next: 'n3' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', slow: true, next: 'c2b', en: '¿Cuánto tiempo — se — queda?', tr: TR('How long — are you — staying?', 'לכמה זמן — אתה — נשאר?'), he: 'לכמה זמן — אתה — נשאר?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: '¿Cuánto es?', tr: TR('How much is it?', 'כמה זה עולה?'), he: 'כמה זה עולה?', itemId: 'es.phrase.sim.how-much', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Son veinte euros, y voy a necesitar su pasaporte.', tr: TR("It's twenty euros, and I'll need your passport.", 'זה עשרים יורו, ואצטרך את הדרכון שלך.'), he: 'זה עשרים יורו, ואצטרך את הדרכון שלך.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Tienen un cargador?', tr: TR('Do you have a charger?', 'יש לכם מטען?'), he: 'יש לכם מטען?', itemId: 'es.phrase.sim.charger', correct: true, next: 'n3b' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה! (מגיש דרכון)'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n3b', who: 'npc', next: 'c3b', en: '¿Un cargador? Sí — justo detrás de usted. ¿Algo más?', tr: TR('A charger? Yes — right behind you. Anything else?', 'מטען? כן — ממש מאחוריך. עוד משהו?'), he: 'מטען? כן — ממש מאחוריך. עוד משהו?' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Todo listo — se la configuro ahora mismo. La contraseña del wifi está en su tique.', tr: TR("All set — I'll set it up now. The wifi password is on your receipt.", 'הכל מוכן — אני אתקין עכשיו. סיסמת הוויי-פיי על הקבלה.'), he: 'הכל מוכן — אני אתקין עכשיו. סיסמת הוויי-פיי על הקבלה.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r4' },
    ] },
    { id: 'r4', who: 'npc', slow: true, next: 'c4b', en: 'La contraseña del wifi — está en — su tique.', tr: TR('The wifi password — is on — your receipt.', 'סיסמת הוויי-פיי — נמצאת — על הקבלה.'), he: 'סיסמת הוויי-פיי — נמצאת — על הקבלה.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: '¡Ya está conectado! Buen viaje.', tr: TR("You're connected! Enjoy your trip.", 'אתה מחובר! תיהנה מהטיול.'), he: 'אתה מחובר! תיהנה מהטיול.' },
  ],
};

export const DAY21_ES: BootcampDayContent = {
  day: 21,
  title: T('וויי-פיי, סים ופרקטיקה', 'Wifi, SIM & Practical'),
  items: DAY21_ES_ITEMS,
  dialogues: { 'sim-shop': SCENE_SIM },
  steps: [
    { kind: 'talk', icon: '📶', title: T('משימה 21: וויי-פיי, סים ופרקטיקה', 'Mission 21: Wifi, SIM & Practical'),
      body: [
        T('הצרכים של המאה ה-21 שאף שיחון לא מלמד: כרטיס סים, גלישה, מטען, סיסמת וויי-פיי.', 'The 21st-century needs no phrasebook teaches: a SIM card, data, a charger, the wifi password.'),
        T('טלפון חי — אתה חי. וגיבוי המתרגם תמיד בכיס.', 'Phone alive — you alive. And the translator backup is always in your pocket.'),
      ], cta: T('להיכנס לחנות הטלפונים', 'Walk into the phone shop') },
    { kind: 'tool', itemId: 'es.phrase.sim.need-sim', index: 1, total: 4, label: T('לבקש מה שצריך', 'Ask for what you need') },
    { kind: 'tool', itemId: 'es.phrase.sim.data-plan', index: 2, total: 4, label: T('לבקש גלישה', 'Ask for data') },
    { kind: 'tool', itemId: 'es.phrase.sim.how-much', index: 3, total: 4, label: T('לשאול מחיר', 'Ask the price') },
    { kind: 'tool', itemId: 'es.phrase.sim.charger', index: 4, total: 4, label: T('לבקש מטען', 'Ask for a charger') },
    { kind: 'replies', saidItemId: 'es.phrase.sim.need-sim',
      replyIds: ['es.reply.sim.how-long-stay', 'es.reply.sim.ten-gigs', 'es.reply.sim.twenty-euros', 'es.reply.sim.need-passport'] },
    { kind: 'receipt', text: T('אתה מזהה את שאלות המוכר — משך שהות, נפח גלישה, מחיר, דרכון.', 'You recognize the seller’s questions — length of stay, data amount, price, passport.') },
    { kind: 'quiz', itemId: 'es.reply.sim.ten-gigs', wrongIds: ['es.reply.sim.twenty-euros', 'es.reply.sim.set-up-now'] },
    { kind: 'quiz', itemId: 'es.reply.sim.need-passport', wrongIds: ['es.reply.sim.how-long-stay', 'es.reply.sim.password-receipt'] },
    { kind: 'dialogue', dialogueId: 'sim-shop' },
    { kind: 'receipt', text: T('קנית סים, חבילת גלישה ומטען — והתחברת לאינטרנט. הטלפון חי.', 'You bought a SIM, a data plan, and a charger — and got online. Your phone is alive.') },
    { kind: 'swipe', itemIds: DAY21_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: '¿Quiere que el plan se renueve automáticamente cada mes o solo una recarga única por ahora?', tr: TR('Would you like the plan to auto-renew each month or just the one-time top-up for now?', 'תרצה שהחבילה תתחדש אוטומטית כל חודש או רק טעינה חד-פעמית לעכשיו?'), he: 'תרצה שהחבילה תתחדש אוטומטית כל חודש או רק טעינה חד-פעמית לעכשיו?' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.sim.charger' },
    { kind: 'receipt', text: T('שאלה טכנית ומהירה על החבילה — וביקשת שיחזרו במקום לבחור בעיוורון.', 'A fast, technical question about the plan — and you asked them to repeat instead of choosing blindly.') },
    { kind: 'summary' },
  ],
};
