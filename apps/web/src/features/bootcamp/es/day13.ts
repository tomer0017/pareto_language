import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 15 — "Peticiones especiales y alergias" (Special Requests & Allergies). Spanish
 * parallel of English mission 13: keep your body safe in any kitchen (allergy, "sin ___", vegetarian,
 * check an ingredient). `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY13_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.diet.allergic-nuts', text: 'Soy alérgico a los frutos secos.', meaning: T('אני אלרגי לאגוזים.', "I'm allergic to nuts."),
    tip: T('התבנית שמצילה: Soy alérgico a ___. אומרים ברור, פעם אחת, בלי היסוס.', 'The life-saving template: Soy alérgico a ___. Say it clearly, once, no hesitation.') },
  { id: 'es.phrase.diet.without-onions', text: 'Sin cebolla, por favor.', meaning: T('בלי בצל, בבקשה.', 'Without onions, please.'),
    tip: T('התבנית: Sin ___ — מסירה כל מרכיב שלא בא לך.', 'Template: Sin ___ — removes any ingredient you don’t want.') },
  { id: 'es.phrase.diet.vegetarian', text: 'Soy vegetariano.', meaning: T('אני צמחוני.', "I'm vegetarian."),
    tip: T('שתי מילים שחוסכות עשר שאלות.', 'Two words that save ten questions.') },
  { id: 'es.phrase.diet.does-have-dairy', text: '¿Esto lleva lácteos?', meaning: T('יש בזה מוצרי חלב?', 'Does it have dairy?'),
    tip: T('התבנית: ¿Esto lleva ___ ? — בודקת כל מרכיב לפני שהוא מגיע אליך.', 'Template: ¿Esto lleva ___ ? — checks any ingredient before it reaches you.') },
  { id: 'es.phrase.diet.is-spicy', text: '¿Esto pica?', meaning: T('זה חריף?', 'Is this spicy?') },
  // hear — the kitchen's replies
  { id: 'es.reply.diet.let-me-check', text: 'Lo consulto con la cocina.', meaning: T('אבדוק עם המטבח.', 'Let me check with the kitchen.') },
  { id: 'es.reply.diet.make-without', text: 'Se lo podemos hacer sin eso.', meaning: T('אפשר להכין בלי.', 'We can make it without.') },
  { id: 'es.reply.diet.contains-nuts', text: 'Ese lleva frutos secos.', meaning: T('זה מכיל אגוזים.', 'That one contains nuts.') },
  { id: 'es.reply.diet.not-spicy', text: 'No, no pica.', meaning: T('לא, זה לא חריף.', "No, it's not spicy.") },
  { id: 'es.reply.diet.good-option', text: 'Este es una buena opción para usted.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.') },
  { id: 'es.reply.diet.anything-else-allergic', text: '¿Alguna otra alergia?', meaning: T('יש עוד אלרגיות?', "Any other allergies?") },
  ...recoveryEs('es.phrase.recovery.repeat', 'es.phrase.recovery.slowly', 'es.phrase.recovery.thank-you'),
];

const SCENE_ALLERGY: BootcampDialogue = {
  id: 'allergy-order',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: '¡Hola! ¿Está listo para pedir?', tr: TR('Hi there! Are you ready to order?', 'היי! מוכן להזמין?'), he: 'היי! מוכן להזמין?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Soy alérgico a los frutos secos.', tr: TR("I'm allergic to nuts.", 'אני אלרגי לאגוזים. (אומרים קודם כל — לפני ההזמנה)'), he: 'אני אלרגי לאגוזים.', itemId: 'es.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Claro — ¿está listo para pedir?', tr: TR('Sure — are you ready to order?', 'בטח — מוכן להזמין?'), he: 'בטח — מוכן להזמין?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Soy alérgico a los frutos secos.', tr: TR("I'm allergic to nuts.", 'אני אלרגי לאגוזים.'), he: 'אני אלרגי לאגוזים.', itemId: 'es.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Gracias por avisarme. ¿Alguna otra alergia o restricción alimentaria?', tr: TR("Thank you for telling me. Any other allergies or dietary restrictions?", 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?'), he: 'תודה שאמרת. יש עוד אלרגיות או הגבלות תזונה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Soy vegetariano.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'es.phrase.diet.vegetarian', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה! (מנומס — אבל הוא שאל שאלה)'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Claro — pero, ¿hay algo más que deba saber?', tr: TR('Of course — but is there anything else I should know?', 'כמובן — אבל יש עוד משהו שכדאי שאדע?'), he: 'כמובן — אבל יש עוד משהו שכדאי שאדע?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Soy vegetariano.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'es.phrase.diet.vegetarian', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Entendido. El risotto de champiñones es vegetariano, pero lo compruebo con la cocina por los frutos secos.', tr: TR("Got it. The mushroom risotto is vegetarian, but I'll check with the kitchen about the nuts.", 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.'), he: 'הבנתי. ריזוטו הפטריות צמחוני, אבל אבדוק עם המטבח לגבי האגוזים.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Esto lleva lácteos?', tr: TR('Does it have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'es.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'El risotto de champiñones — es vegetariano.', tr: TR('The mushroom risotto — is vegetarian.', 'ריזוטו הפטריות — צמחוני.'), he: 'ריזוטו הפטריות — צמחוני.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¿Esto lleva lácteos?', tr: TR('Does it have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'es.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Sí, lleva un poco de nata, pero se lo podemos hacer sin ella.', tr: TR('Yes, it has some cream, but we can make it without.', 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.'), he: 'כן, יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Genial. Sin cebolla, por favor.', tr: TR('Great. Without onions, please.', 'מעולה. בלי בצל, בבקשה.'), he: 'מעולה. בלי בצל, בבקשה.', itemId: 'es.phrase.diet.without-onions', correct: true, next: 'n5' },
      { en: '¿Esto pica?', tr: TR('Is this spicy?', 'זה חריף?'), he: 'זה חריף?', itemId: 'es.phrase.diet.is-spicy', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c4b', en: 'Para nada — es muy suave.', tr: TR("Not at all — it's very mild.", 'ממש לא — הוא עדין מאוד.'), he: 'ממש לא — הוא עדין מאוד.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Sin cebolla, por favor.', tr: TR('Without onions, please.', 'בלי בצל, בבקשה.'), he: 'בלי בצל, בבקשה.', itemId: 'es.phrase.diet.without-onions', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Claro. Aviso a la cocina de su alergia.', tr: TR("Of course. I'll tell the kitchen about your allergy.", 'כמובן. אגיד למטבח על האלרגיה שלך.'), he: 'כמובן. אגיד למטבח על האלרגיה שלך.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Aviso — a la cocina — de su alergia.', tr: TR("I'll tell — the kitchen — about your allergy.", 'אני אגיד — למטבח — על האלרגיה.'), he: 'אני אגיד — למטבח — על האלרגיה.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Lo compruebo con ellos y vuelvo enseguida.', tr: TR("I'll check with them and come right back.", 'אבדוק איתם ואחזור מיד.'), he: 'אבדוק איתם ואחזור מיד.' },
  ],
};

export const DAY13_ES: BootcampDayContent = {
  day: 13,
  title: T('העדפות אוכל ואלרגיות', 'Food Preferences & Allergies'),
  items: DAY13_ES_ITEMS,
  dialogues: { 'allergy-order': SCENE_ALLERGY },
  steps: [
    { kind: 'talk', icon: '🥜', title: T('משימה 15: בקשות מיוחדות ואלרגיות', 'Mission 15: Special Requests & Allergies'),
      body: [
        T('יש מילים שאתה אולי תצטרך רק פעם אחת בחיים — אבל אז הן קריטיות.', 'Some words you may need only once in your life — but then they’re critical.'),
        T('היום נלמד לשמור על הגוף שלך בכל מטבח: אלרגיה, "בלי", צמחוני, ובדיקת מרכיב.', 'Today we learn to keep your body safe in any kitchen: allergy, “without”, vegetarian, and checking an ingredient.'),
      ], cta: T('לשבת ולהזמין בבטחה', 'Sit down and order safely') },
    { kind: 'tool', itemId: 'es.phrase.diet.allergic-nuts', index: 1, total: 4, label: T('המשפט שמציל', 'The line that protects') },
    { kind: 'tool', itemId: 'es.phrase.diet.without-onions', index: 2, total: 4, label: T('להסיר מרכיב', 'Remove an ingredient') },
    { kind: 'tool', itemId: 'es.phrase.diet.vegetarian', index: 3, total: 4, label: T('להגדיר את עצמך', 'Define yourself') },
    { kind: 'tool', itemId: 'es.phrase.diet.does-have-dairy', index: 4, total: 4, label: T('לבדוק מרכיב', 'Check an ingredient') },
    { kind: 'replies', saidItemId: 'es.phrase.diet.allergic-nuts',
      replyIds: ['es.reply.diet.let-me-check', 'es.reply.diet.make-without', 'es.reply.diet.contains-nuts', 'es.reply.diet.good-option'] },
    { kind: 'receipt', text: T('אתה מזהה איך המטבח מגיב לאלרגיה — בדיקה, אזהרה, ופתרון.', 'You recognize how a kitchen responds to an allergy — check, warning, and solution.') },
    { kind: 'quiz', itemId: 'es.reply.diet.contains-nuts', wrongIds: ['es.reply.diet.make-without', 'es.reply.diet.good-option'] },
    { kind: 'quiz', itemId: 'es.reply.diet.let-me-check', wrongIds: ['es.reply.diet.not-spicy', 'es.reply.diet.contains-nuts'] },
    { kind: 'dialogue', dialogueId: 'allergy-order' },
    { kind: 'receipt', text: T('הזמנת ארוחה שמתאימה לך — אלרגיה, צמחוני, בלי בצל, בדיקת מרכיבים.', 'You ordered a meal that works for you — allergy, vegetarian, no onions, ingredients checked.') },
    { kind: 'swipe', itemIds: DAY13_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Solo para asegurarme, ¿su alergia a los frutos secos significa que también debemos evitar la freidora compartida?', tr: TR('Just to be safe does your nut allergy mean we should avoid the shared fryer too?', 'רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?'), he: 'רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.diet.vegetarian' },
    { kind: 'receipt', text: T('שאלת בטיחות מפורטת ומהירה — וביקשת שיחזרו במקום לנחש. עם אלרגיה, זה בדיוק הצעד הנכון.', 'A detailed, fast safety question — and you asked them to repeat instead of guessing. With an allergy, exactly the right move.') },
    { kind: 'summary' },
  ],
};
