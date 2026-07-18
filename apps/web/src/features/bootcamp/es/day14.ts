import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryEs } from './recovery.js';

/**
 * Spanish Mission 14 — "Peticiones especiales y alergias" (Special Requests & Allergies). Spanish
 * parallel of English day 14: keep your body safe in any kitchen (allergy, "sin ___", vegetarian,
 * check an ingredient). `tr:{en,he}` glosses; `es.*` ids. AI-drafted, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY14_ES_ITEMS: BootcampItem[] = [
  // say
  { id: 'es.phrase.diet.allergic-nuts', text: 'Soy alérgico a los frutos secos.', meaning: T('אני אלרגי לאגוזים.', "I'm allergic to nuts."),
    tip: T('התבנית שמצילה: Soy alérgico a ___. אומרים ברור, פעם אחת, בלי היסוס.', 'The life-saving template: Soy alérgico a ___. Say it clearly, once, no hesitation.') },
  { id: 'es.phrase.diet.without-onions', text: 'Sin cebolla, por favor.', meaning: T('בלי בצל, בבקשה.', 'Without onions, please.'),
    tip: T('התבנית: Sin ___ — מסירה כל מרכיב שלא בא לך.', 'Template: Sin ___ — removes any ingredient you don’t want.') },
  { id: 'es.phrase.diet.vegetarian', text: 'Soy vegetariano.', meaning: T('אני צמחוני.', "I'm vegetarian."),
    tip: T('שתי מילים שחוסכות עשר שאלות.', 'Two words that save ten questions.') },
  { id: 'es.phrase.diet.does-have-dairy', text: '¿Esto lleva lácteos?', meaning: T('יש בזה מוצרי חלב?', 'Does this have dairy?'),
    tip: T('התבנית: ¿Esto lleva ___ ? — בודקת כל מרכיב לפני שהוא מגיע אליך.', 'Template: ¿Esto lleva ___ ? — checks any ingredient before it reaches you.') },
  { id: 'es.phrase.diet.is-spicy', text: '¿Esto pica?', meaning: T('זה חריף?', 'Is this spicy?') },
  // hear — the kitchen's replies
  { id: 'es.reply.diet.let-me-check', text: 'Lo consulto con la cocina.', meaning: T('אבדוק עם המטבח.', 'Let me check with the kitchen.') },
  { id: 'es.reply.diet.make-without', text: 'Se lo podemos hacer sin eso.', meaning: T('אפשר להכין בלי.', 'We can make it without.') },
  { id: 'es.reply.diet.contains-nuts', text: 'Ese lleva frutos secos.', meaning: T('זה מכיל אגוזים.', 'That one contains nuts.') },
  { id: 'es.reply.diet.not-spicy', text: 'No, no pica.', meaning: T('לא, זה לא חריף.', "No, it's not spicy.") },
  { id: 'es.reply.diet.good-option', text: 'Este es una buena opción para usted.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.') },
  { id: 'es.reply.diet.anything-else-allergic', text: '¿Es alérgico a algo más?', meaning: T('עוד משהו שאתה אלרגי אליו?', "Anything else you're allergic to?") },
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
    { id: 'n2', who: 'npc', next: 'c2', en: 'Gracias por avisarme — es importante. ¿Es alérgico a algo más?', tr: TR("Thank you for telling me — that's important. Anything else you're allergic to?", 'תודה שאמרת — זה חשוב. עוד משהו שאתה אלרגי אליו?'), he: 'תודה שאמרת — זה חשוב. עוד משהו שאתה אלרגי אליו?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Soy vegetariano.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'es.phrase.diet.vegetarian', correct: true, next: 'n3' },
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה! (מנומס — אבל הוא שאל שאלה)'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Claro — pero, ¿hay algo más que deba saber?', tr: TR('Of course — but is there anything else I should know?', 'כמובן — אבל יש עוד משהו שכדאי שאדע?'), he: 'כמובן — אבל יש עוד משהו שכדאי שאדע?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Soy vegetariano.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'es.phrase.diet.vegetarian', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Entendido — sin frutos secos, vegetariano. El risotto de setas es una buena opción para usted.', tr: TR('Got it — no nuts, vegetarian. The mushroom risotto is a good option for you.', 'הבנתי — בלי אגוזים, צמחוני. ריזוטו הפטריות אפשרות טובה בשבילך.'), he: 'הבנתי — בלי אגוזים, צמחוני. ריזוטו הפטריות אפשרות טובה בשבילך.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¿Esto lleva lácteos?', tr: TR('Does this have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'es.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
      { en: '¿Puede repetir, por favor?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'es.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'El — risotto — de setas — es bueno para usted.', tr: TR('The — mushroom — risotto — is good for you.', 'ריזוטו — הפטריות — טוב — בשבילך.'), he: 'ריזוטו — הפטריות — טוב — בשבילך.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¿Esto lleva lácteos?', tr: TR('Does this have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'es.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Buena pregunta — lleva un poco de nata, pero se lo podemos hacer sin ella.', tr: TR('Good question — it has a little cream, but we can make it without.', 'שאלה טובה — יש בו קצת שמנת, אבל אפשר להכין בלי.'), he: 'שאלה טובה — יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Sin cebolla, por favor.', tr: TR('Without onions, please.', 'בלי בצל, בבקשה.'), he: 'בלי בצל, בבקשה.', itemId: 'es.phrase.diet.without-onions', correct: true, next: 'n5' },
      { en: '¿Esto pica?', tr: TR('Is this spicy?', 'זה חריף?'), he: 'זה חריף?', itemId: 'es.phrase.diet.is-spicy', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c4b', en: 'Para nada — es muy suave.', tr: TR("Not at all — it's very mild.", 'ממש לא — הוא עדין מאוד.'), he: 'ממש לא — הוא עדין מאוד.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Sin cebolla, por favor.', tr: TR('Without onions, please.', 'בלי בצל, בבקשה.'), he: 'בלי בצל, בבקשה.', itemId: 'es.phrase.diet.without-onions', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Sin cebolla, ningún problema — y me aseguro de que la cocina sepa lo de los frutos secos.', tr: TR("No onions, no problem — and I'll make sure the kitchen knows about the nuts.", 'בלי בצל, אין בעיה — ואוודא שהמטבח יודע על האגוזים.'), he: 'בלי בצל, אין בעיה — ואוודא שהמטבח יודע על האגוזים.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'es.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Aviso — a la cocina — de los frutos secos.', tr: TR("I'll tell — the kitchen — about the nuts.", 'אני אגיד — למטבח — על האגוזים.'), he: 'אני אגיד — למטבח — על האגוזים.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Perfecto. Su plato será totalmente seguro. ¡Buen provecho!', tr: TR('Perfect. Your food will be completely safe. Enjoy!', 'מושלם. האוכל שלך יהיה בטוח לגמרי. בתיאבון!'), he: 'מושלם. האוכל שלך יהיה בטוח לגמרי. בתיאבון!' },
  ],
};

export const DAY14_ES: BootcampDayContent = {
  day: 14,
  title: T('בקשות מיוחדות ואלרגיות', 'Special Requests & Allergies'),
  items: DAY14_ES_ITEMS,
  dialogues: { 'allergy-order': SCENE_ALLERGY },
  steps: [
    { kind: 'talk', icon: '🥜', title: T('משימה 14: בקשות מיוחדות ואלרגיות', 'Mission 14: Special Requests & Allergies'),
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
    { kind: 'receipt', text: T('הזמנת ארוחה בטוחה לגמרי — אלרגיה, צמחוני, בלי בצל, בדיקת מרכיבים.', 'You ordered a completely safe meal — allergy, vegetarian, no onions, ingredients checked.') },
    { kind: 'swipe', itemIds: DAY14_ES_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Solo para asegurarme, ¿su alergia a los frutos secos significa que también debemos evitar la freidora compartida?', tr: TR('Just to be safe does your nut allergy mean we should avoid the shared fryer too?', 'רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?'), he: 'רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?' },
      correctItemId: 'es.phrase.recovery.repeat', wrongItemId: 'es.phrase.diet.vegetarian' },
    { kind: 'receipt', text: T('שאלת בטיחות מפורטת ומהירה — וביקשת שיחזרו במקום לנחש. עם אלרגיה, זה בדיוק הצעד הנכון.', 'A detailed, fast safety question — and you asked them to repeat instead of guessing. With an allergy, exactly the right move.') },
    { kind: 'summary' },
  ],
};
