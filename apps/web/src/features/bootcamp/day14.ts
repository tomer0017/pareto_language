import { T, recovery } from './recovery.js';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from './types.js';

/**
 * Mission 14 — "Special Requests & Allergies" (Phase 3 · Food).
 * Rare need, catastrophic to lack. You learn to keep your body safe in any kitchen:
 * allergies, "without ___", vegetarian, and checking an ingredient before it reaches you.
 * Said clearly, once, calmly — the kitchen does the rest.
 */
export const DAY14_ITEMS: BootcampItem[] = [
  // say
  { id: 'en.phrase.diet.allergic-nuts', text: "I'm allergic to nuts.", meaning: T('אני אלרגי לאגוזים.', "I'm allergic to nuts."),
    tip: T('התבנית שמצילה: I’m allergic to ___. אומרים ברור, פעם אחת, בלי היסוס.', 'The life-saving template: I’m allergic to ___. Say it clearly, once, no hesitation.') },
  { id: 'en.phrase.diet.without-onions', text: 'Without onions, please.', meaning: T('בלי בצל, בבקשה.', 'Without onions, please.'),
    tip: T('התבנית: Without ___ — מסירה כל מרכיב שלא בא לך.', 'Template: Without ___ — removes any ingredient you don’t want.') },
  { id: 'en.phrase.diet.vegetarian', text: "I'm vegetarian.", meaning: T('אני צמחוני.', "I'm vegetarian."),
    tip: T('שתי מילים שחוסכות עשר שאלות.', 'Two words that save ten questions.') },
  { id: 'en.phrase.diet.does-have-dairy', text: 'Does this have dairy?', meaning: T('יש בזה מוצרי חלב?', 'Does this have dairy?'),
    tip: T('התבנית: Does this have ___? — בודקת כל מרכיב לפני שהוא מגיע אליך.', 'Template: Does this have ___? — checks any ingredient before it reaches you.') },
  { id: 'en.phrase.diet.is-spicy', text: 'Is this spicy?', meaning: T('זה חריף?', 'Is this spicy?') },
  // hear — the kitchen's replies
  { id: 'en.reply.diet.let-me-check', text: 'Let me check with the kitchen.', meaning: T('אבדוק עם המטבח.', 'Let me check with the kitchen.') },
  { id: 'en.reply.diet.make-without', text: 'We can make it without.', meaning: T('אפשר להכין בלי.', 'We can make it without.') },
  { id: 'en.reply.diet.contains-nuts', text: 'That one contains nuts.', meaning: T('זה מכיל אגוזים.', 'That one contains nuts.') },
  { id: 'en.reply.diet.not-spicy', text: "No, it's not spicy.", meaning: T('לא, זה לא חריף.', "No, it's not spicy.") },
  { id: 'en.reply.diet.good-option', text: 'This one is a good option for you.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.') },
  { id: 'en.reply.diet.anything-else-allergic', text: "Anything else you're allergic to?", meaning: T('עוד משהו שאתה אלרגי אליו?', "Anything else you're allergic to?") },
  ...recovery('en.phrase.recovery.repeat', 'en.phrase.recovery.slowly', 'en.phrase.recovery.thank-you'),
];

const SCENE_ALLERGY: BootcampDialogue = {
  id: 'allergy-order',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Hi there! Are you ready to order?', he: 'היי! מוכן להזמין?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "I'm allergic to nuts.", he: 'אני אלרגי לאגוזים. (אומרים קודם כל — לפני ההזמנה)', itemId: 'en.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Sure — are you ready to order?', he: 'בטח — מוכן להזמין?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: "I'm allergic to nuts.", he: 'אני אלרגי לאגוזים.', itemId: 'en.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: "Thank you for telling me — that's important. Anything else you're allergic to?", he: 'תודה שאמרת — זה חשוב. עוד משהו שאתה אלרגי אליו?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: "I'm vegetarian.", he: 'אני צמחוני.', itemId: 'en.phrase.diet.vegetarian', correct: true, next: 'n3' },
      { en: 'Thank you!', he: 'תודה! (מנומס — אבל הוא שאל שאלה)', itemId: 'en.phrase.recovery.thank-you', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Of course — but is there anything else I should know?', he: 'כמובן — אבל יש עוד משהו שכדאי שאדע?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: "I'm vegetarian.", he: 'אני צמחוני.', itemId: 'en.phrase.diet.vegetarian', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Got it — no nuts, vegetarian. The mushroom risotto is a good option for you.', he: 'הבנתי — בלי אגוזים, צמחוני. ריזוטו הפטריות אפשרות טובה בשבילך.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Does this have dairy?', he: 'יש בזה מוצרי חלב?', itemId: 'en.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
      { en: 'Can you repeat that?', he: 'אפשר לחזור על זה?', itemId: 'en.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'The — mushroom — risotto — is good for you.', he: 'ריזוטו — הפטריות — טוב — בשבילך.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Does this have dairy?', he: 'יש בזה מוצרי חלב?', itemId: 'en.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Good question — it has a little cream, but we can make it without.', he: 'שאלה טובה — יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Without onions, please.', he: 'בלי בצל, בבקשה.', itemId: 'en.phrase.diet.without-onions', correct: true, next: 'n5' },
      { en: 'Is this spicy?', he: 'זה חריף?', itemId: 'en.phrase.diet.is-spicy', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c4b', en: "Not at all — it's very mild.", he: 'ממש לא — הוא עדין מאוד.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Without onions, please.', he: 'בלי בצל, בבקשה.', itemId: 'en.phrase.diet.without-onions', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: "No onions, no problem — and I'll make sure the kitchen knows about the nuts.", he: 'בלי בצל, אין בעיה — ואוודא שהמטבח יודע על האגוזים.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Please speak slowly.', he: 'דבר לאט, בבקשה.', itemId: 'en.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: "I'll tell — the kitchen — about the nuts.", he: 'אני אגיד — למטבח — על האגוזים.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Perfect. Your food will be completely safe. Enjoy!', he: 'מושלם. האוכל שלך יהיה בטוח לגמרי. בתיאבון!' },
  ],
};

export const DAY14: BootcampDayContent = {
  day: 14,
  title: T('בקשות מיוחדות ואלרגיות', 'Special Requests & Allergies'),
  items: DAY14_ITEMS,
  dialogues: { 'allergy-order': SCENE_ALLERGY },
  steps: [
    { kind: 'talk', icon: '🥜', title: T('משימה 14: בקשות מיוחדות ואלרגיות', 'Mission 14: Special Requests & Allergies'),
      body: [
        T('יש מילים שאתה אולי תצטרך רק פעם אחת בחיים — אבל אז הן קריטיות.', 'Some words you may need only once in your life — but then they’re critical.'),
        T('היום נלמד לשמור על הגוף שלך בכל מטבח: אלרגיה, "בלי", צמחוני, ובדיקת מרכיב.', 'Today we learn to keep your body safe in any kitchen: allergy, “without”, vegetarian, and checking an ingredient.'),
      ], cta: T('לשבת ולהזמין בבטחה', 'Sit down and order safely') },
    { kind: 'tool', itemId: 'en.phrase.diet.allergic-nuts', index: 1, total: 4, label: T('המשפט שמציל', 'The line that protects') },
    { kind: 'tool', itemId: 'en.phrase.diet.without-onions', index: 2, total: 4, label: T('להסיר מרכיב', 'Remove an ingredient') },
    { kind: 'tool', itemId: 'en.phrase.diet.vegetarian', index: 3, total: 4, label: T('להגדיר את עצמך', 'Define yourself') },
    { kind: 'tool', itemId: 'en.phrase.diet.does-have-dairy', index: 4, total: 4, label: T('לבדוק מרכיב', 'Check an ingredient') },
    { kind: 'replies', saidItemId: 'en.phrase.diet.allergic-nuts',
      replyIds: ['en.reply.diet.let-me-check', 'en.reply.diet.make-without', 'en.reply.diet.contains-nuts', 'en.reply.diet.good-option'] },
    { kind: 'receipt', text: T('אתה מזהה איך המטבח מגיב לאלרגיה — בדיקה, אזהרה, ופתרון.', 'You recognize how a kitchen responds to an allergy — check, warning, and solution.') },
    { kind: 'quiz', itemId: 'en.reply.diet.contains-nuts', wrongIds: ['en.reply.diet.make-without', 'en.reply.diet.good-option'] },
    { kind: 'quiz', itemId: 'en.reply.diet.let-me-check', wrongIds: ['en.reply.diet.not-spicy', 'en.reply.diet.contains-nuts'] },
    { kind: 'dialogue', dialogueId: 'allergy-order' },
    { kind: 'receipt', text: T('הזמנת ארוחה בטוחה לגמרי — אלרגיה, צמחוני, בלי בצל, בדיקת מרכיבים.', 'You ordered a completely safe meal — allergy, vegetarian, no onions, ingredients checked.') },
    { kind: 'swipe', itemIds: DAY14_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Just to be safe does your nut allergy mean we should avoid the shared fryer too?', he: 'רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?' },
      correctItemId: 'en.phrase.recovery.repeat', wrongItemId: 'en.phrase.diet.vegetarian' },
    { kind: 'receipt', text: T('שאלת בטיחות מפורטת ומהירה — וביקשת שיחזרו במקום לנחש. עם אלרגיה, זה בדיוק הצעד הנכון.', 'A detailed, fast safety question — and you asked them to repeat instead of guessing. With an allergy, exactly the right move.') },
    { kind: 'summary' },
  ],
};
