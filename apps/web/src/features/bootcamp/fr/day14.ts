import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampDialogue, BootcampItem } from '../types.js';
import { recoveryFr } from './recovery.js';

/**
 * French Mission 14 — "Demandes spéciales et allergies" (Special Requests & Allergies). French
 * parallel of English day 14: keep your body safe in any kitchen (allergy, "sans ___", vegetarian,
 * check an ingredient). `tr:{en,he}` glosses; `fr.*` ids. AI-drafted, vous, pending review.
 */
const T = (he: string, en: string): LocalizedText => ({ he, en });
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY14_FR_ITEMS: BootcampItem[] = [
  // say
  { id: 'fr.phrase.diet.allergic-nuts', text: 'Je suis allergique aux noix.', meaning: T('אני אלרגי לאגוזים.', "I'm allergic to nuts."),
    tip: T('התבנית שמצילה: Je suis allergique à/aux ___. אומרים ברור, פעם אחת, בלי היסוס.', 'The life-saving template: Je suis allergique à/aux ___. Say it clearly, once, no hesitation.') },
  { id: 'fr.phrase.diet.without-onions', text: 'Sans oignons, s’il vous plaît.', meaning: T('בלי בצל, בבקשה.', 'Without onions, please.'),
    tip: T('התבנית: Sans ___ — מסירה כל מרכיב שלא בא לך.', 'Template: Sans ___ — removes any ingredient you don’t want.') },
  { id: 'fr.phrase.diet.vegetarian', text: 'Je suis végétarien.', meaning: T('אני צמחוני.', "I'm vegetarian."),
    tip: T('שתי מילים שחוסכות עשר שאלות.', 'Two words that save ten questions.') },
  { id: 'fr.phrase.diet.does-have-dairy', text: 'Est-ce qu’il y a des produits laitiers dedans ?', meaning: T('יש בזה מוצרי חלב?', 'Does this have dairy?'),
    tip: T('התבנית: Est-ce qu’il y a ___ dedans ? — בודקת כל מרכיב לפני שהוא מגיע אליך.', 'Template: Est-ce qu’il y a ___ dedans? — checks any ingredient before it reaches you.') },
  { id: 'fr.phrase.diet.is-spicy', text: 'C’est épicé ?', meaning: T('זה חריף?', 'Is this spicy?') },
  // hear — the kitchen's replies
  { id: 'fr.reply.diet.let-me-check', text: 'Je vérifie avec la cuisine.', meaning: T('אבדוק עם המטבח.', 'Let me check with the kitchen.') },
  { id: 'fr.reply.diet.make-without', text: 'On peut le faire sans.', meaning: T('אפשר להכין בלי.', 'We can make it without.') },
  { id: 'fr.reply.diet.contains-nuts', text: 'Celui-là contient des noix.', meaning: T('זה מכיל אגוזים.', 'That one contains nuts.') },
  { id: 'fr.reply.diet.not-spicy', text: 'Non, ce n’est pas épicé.', meaning: T('לא, זה לא חריף.', "No, it's not spicy.") },
  { id: 'fr.reply.diet.good-option', text: 'Celui-ci est une bonne option pour vous.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.') },
  { id: 'fr.reply.diet.anything-else-allergic', text: 'Vous êtes allergique à autre chose ?', meaning: T('עוד משהו שאתה אלרגי אליו?', "Anything else you're allergic to?") },
  ...recoveryFr('fr.phrase.recovery.repeat', 'fr.phrase.recovery.slowly', 'fr.phrase.recovery.thank-you'),
];

const SCENE_ALLERGY: BootcampDialogue = {
  id: 'allergy-order',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', next: 'c1', en: 'Bonjour ! Vous êtes prêt à commander ?', tr: TR('Hi there! Are you ready to order?', 'היי! מוכן להזמין?'), he: 'היי! מוכן להזמין?' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis allergique aux noix.', tr: TR("I'm allergic to nuts.", 'אני אלרגי לאגוזים. (אומרים קודם כל — לפני ההזמנה)'), he: 'אני אלרגי לאגוזים.', itemId: 'fr.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', slow: true, next: 'c1b', en: 'Bien sûr — vous êtes prêt à commander ?', tr: TR('Sure — are you ready to order?', 'בטח — מוכן להזמין?'), he: 'בטח — מוכן להזמין?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis allergique aux noix.', tr: TR("I'm allergic to nuts.", 'אני אלרגי לאגוזים.'), he: 'אני אלרגי לאגוזים.', itemId: 'fr.phrase.diet.allergic-nuts', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', next: 'c2', en: 'Merci de me le dire — c’est important. Vous êtes allergique à autre chose ?', tr: TR("Thank you for telling me — that's important. Anything else you're allergic to?", 'תודה שאמרת — זה חשוב. עוד משהו שאתה אלרגי אליו?'), he: 'תודה שאמרת — זה חשוב. עוד משהו שאתה אלרגי אליו?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis végétarien.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'fr.phrase.diet.vegetarian', correct: true, next: 'n3' },
      { en: 'Merci !', tr: TR('Thank you!', 'תודה! (מנומס — אבל הוא שאל שאלה)'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b', en: 'Bien sûr — mais y a-t-il autre chose que je devrais savoir ?', tr: TR('Of course — but is there anything else I should know?', 'כמובן — אבל יש עוד משהו שכדאי שאדע?'), he: 'כמובן — אבל יש עוד משהו שכדאי שאדע?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Je suis végétarien.', tr: TR("I'm vegetarian.", 'אני צמחוני.'), he: 'אני צמחוני.', itemId: 'fr.phrase.diet.vegetarian', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'c3', en: 'Compris — pas de noix, végétarien. Le risotto aux champignons est une bonne option pour vous.', tr: TR('Got it — no nuts, vegetarian. The mushroom risotto is a good option for you.', 'הבנתי — בלי אגוזים, צמחוני. ריזוטו הפטריות אפשרות טובה בשבילך.'), he: 'הבנתי — בלי אגוזים, צמחוני. ריזוטו הפטריות אפשרות טובה בשבילך.' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Est-ce qu’il y a des produits laitiers dedans ?', tr: TR('Does this have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'fr.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
      { en: 'Vous pouvez répéter ?', tr: TR('Can you repeat that?', 'אפשר לחזור על זה?'), he: 'אפשר לחזור על זה?', itemId: 'fr.phrase.recovery.repeat', correct: true, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b', en: 'Le — risotto — aux champignons — est bon pour vous.', tr: TR('The — mushroom — risotto — is good for you.', 'ריזוטו — הפטריות — טוב — בשבילך.'), he: 'ריזוטו — הפטריות — טוב — בשבילך.' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Est-ce qu’il y a des produits laitiers dedans ?', tr: TR('Does this have dairy?', 'יש בזה מוצרי חלב?'), he: 'יש בזה מוצרי חלב?', itemId: 'fr.phrase.diet.does-have-dairy', correct: true, next: 'n4' },
    ] },
    { id: 'n4', who: 'npc', next: 'c4', en: 'Bonne question — il y a un peu de crème, mais on peut le faire sans.', tr: TR('Good question — it has a little cream, but we can make it without.', 'שאלה טובה — יש בו קצת שמנת, אבל אפשר להכין בלי.'), he: 'שאלה טובה — יש בו קצת שמנת, אבל אפשר להכין בלי.' },
    { id: 'c4', who: 'you', en: '', he: '', choices: [
      { en: 'Sans oignons, s’il vous plaît.', tr: TR('Without onions, please.', 'בלי בצל, בבקשה.'), he: 'בלי בצל, בבקשה.', itemId: 'fr.phrase.diet.without-onions', correct: true, next: 'n5' },
      { en: 'C’est épicé ?', tr: TR('Is this spicy?', 'זה חריף?'), he: 'זה חריף?', itemId: 'fr.phrase.diet.is-spicy', correct: true, next: 'n4b' },
    ] },
    { id: 'n4b', who: 'npc', next: 'c4b', en: 'Pas du tout — c’est très doux.', tr: TR("Not at all — it's very mild.", 'ממש לא — הוא עדין מאוד.'), he: 'ממש לא — הוא עדין מאוד.' },
    { id: 'c4b', who: 'you', en: '', he: '', choices: [
      { en: 'Sans oignons, s’il vous plaît.', tr: TR('Without onions, please.', 'בלי בצל, בבקשה.'), he: 'בלי בצל, בבקשה.', itemId: 'fr.phrase.diet.without-onions', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', next: 'c5', en: 'Sans oignons, pas de problème — et je m’assure que la cuisine est au courant pour les noix.', tr: TR("No onions, no problem — and I'll make sure the kitchen knows about the nuts.", 'בלי בצל, אין בעיה — ואוודא שהמטבח יודע על האגוזים.'), he: 'בלי בצל, אין בעיה — ואוודא שהמטבח יודע על האגוזים.' },
    { id: 'c5', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'דבר לאט, בבקשה.'), he: 'דבר לאט, בבקשה.', itemId: 'fr.phrase.recovery.slowly', correct: true, next: 'r5' },
    ] },
    { id: 'r5', who: 'npc', slow: true, next: 'c5b', en: 'Je préviens — la cuisine — pour les noix.', tr: TR("I'll tell — the kitchen — about the nuts.", 'אני אגיד — למטבח — על האגוזים.'), he: 'אני אגיד — למטבח — על האגוזים.' },
    { id: 'c5b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n6' },
    ] },
    { id: 'n6', who: 'npc', end: true, en: 'Parfait. Votre plat sera tout à fait sûr. Bon appétit !', tr: TR('Perfect. Your food will be completely safe. Enjoy!', 'מושלם. האוכל שלך יהיה בטוח לגמרי. בתיאבון!'), he: 'מושלם. האוכל שלך יהיה בטוח לגמרי. בתיאבון!' },
  ],
};

export const DAY14_FR: BootcampDayContent = {
  day: 14,
  title: T('בקשות מיוחדות ואלרגיות', 'Special Requests & Allergies'),
  items: DAY14_FR_ITEMS,
  dialogues: { 'allergy-order': SCENE_ALLERGY },
  steps: [
    { kind: 'talk', icon: '🥜', title: T('משימה 14: בקשות מיוחדות ואלרגיות', 'Mission 14: Special Requests & Allergies'),
      body: [
        T('יש מילים שאתה אולי תצטרך רק פעם אחת בחיים — אבל אז הן קריטיות.', 'Some words you may need only once in your life — but then they’re critical.'),
        T('היום נלמד לשמור על הגוף שלך בכל מטבח: אלרגיה, "בלי", צמחוני, ובדיקת מרכיב.', 'Today we learn to keep your body safe in any kitchen: allergy, “without”, vegetarian, and checking an ingredient.'),
      ], cta: T('לשבת ולהזמין בבטחה', 'Sit down and order safely') },
    { kind: 'tool', itemId: 'fr.phrase.diet.allergic-nuts', index: 1, total: 4, label: T('המשפט שמציל', 'The line that protects') },
    { kind: 'tool', itemId: 'fr.phrase.diet.without-onions', index: 2, total: 4, label: T('להסיר מרכיב', 'Remove an ingredient') },
    { kind: 'tool', itemId: 'fr.phrase.diet.vegetarian', index: 3, total: 4, label: T('להגדיר את עצמך', 'Define yourself') },
    { kind: 'tool', itemId: 'fr.phrase.diet.does-have-dairy', index: 4, total: 4, label: T('לבדוק מרכיב', 'Check an ingredient') },
    { kind: 'replies', saidItemId: 'fr.phrase.diet.allergic-nuts',
      replyIds: ['fr.reply.diet.let-me-check', 'fr.reply.diet.make-without', 'fr.reply.diet.contains-nuts', 'fr.reply.diet.good-option'] },
    { kind: 'receipt', text: T('אתה מזהה איך המטבח מגיב לאלרגיה — בדיקה, אזהרה, ופתרון.', 'You recognize how a kitchen responds to an allergy — check, warning, and solution.') },
    { kind: 'quiz', itemId: 'fr.reply.diet.contains-nuts', wrongIds: ['fr.reply.diet.make-without', 'fr.reply.diet.good-option'] },
    { kind: 'quiz', itemId: 'fr.reply.diet.let-me-check', wrongIds: ['fr.reply.diet.not-spicy', 'fr.reply.diet.contains-nuts'] },
    { kind: 'dialogue', dialogueId: 'allergy-order' },
    { kind: 'receipt', text: T('הזמנת ארוחה בטוחה לגמרי — אלרגיה, צמחוני, בלי בצל, בדיקת מרכיבים.', 'You ordered a completely safe meal — allergy, vegetarian, no onions, ingredients checked.') },
    { kind: 'swipe', itemIds: DAY14_FR_ITEMS.map((i) => i.id) },
    { kind: 'ambush', npc: { en: 'Juste pour être sûr, votre allergie aux noix veut dire qu’on doit aussi éviter la friteuse partagée ?', tr: TR('Just to be safe does your nut allergy mean we should avoid the shared fryer too?', 'רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?'), he: 'רק ליתר ביטחון — האלרגיה לאגוזים אומרת שכדאי להימנע גם מהמטגן המשותף?' },
      correctItemId: 'fr.phrase.recovery.repeat', wrongItemId: 'fr.phrase.diet.vegetarian' },
    { kind: 'receipt', text: T('שאלת בטיחות מפורטת ומהירה — וביקשת שיחזרו במקום לנחש. עם אלרגיה, זה בדיוק הצעד הנכון.', 'A detailed, fast safety question — and you asked them to repeat instead of guessing. With an allergy, exactly the right move.') },
    { kind: 'summary' },
  ],
};
