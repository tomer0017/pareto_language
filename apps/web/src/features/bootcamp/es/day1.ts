import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampItem, BootcampDialogue } from '../types.js';

/**
 * Spanish Mission 1 — "Puedo sobrevivir." (Recovery Toolkit), the Spanish parallel of the English
 * day-1 mission. PROVES the language-agnostic Bootcamp: identical `BootcampDayContent` shape, the
 * SAME engine/player renders it. Only the content is Spanish.
 *
 * Field convention (engine): `en` = the SPOKEN line in the LEARNING language (here Spanish); `tr` =
 * the app-language translation ({en,he}) the learner reads. Item ids are `es.phrase.*` so Spanish
 * progress + review events never mix with English/French. Instructional `talk`/`coach` copy stays
 * app-language ({he,en}) — it is coaching, not the target language.
 *
 * HONESTY: Spanish is AI-drafted, neutral international Spanish (usted for service), pending review.
 */

const T = (he: string, en: string): LocalizedText => ({ he, en });
/** App-language translation of a Spanish line (what the learner reads): {en, he}. */
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY1_ES_ITEMS: BootcampItem[] = [
  { id: 'es.phrase.recovery.dont-understand', text: 'Perdón, no entiendo.',
    meaning: T('סליחה, אני לא מבין.', "Sorry, I don't understand."),
    tip: T('ברגע שלא הבנת — אומרים. בלי בושה. זה מאפס את השיחה.', 'The moment you miss something — say it. It resets the exchange.') },
  { id: 'es.phrase.recovery.repeat', text: '¿Puede repetir, por favor?',
    meaning: T('אפשר לחזור על זה?', 'Can you repeat that?'),
    tip: T('קונה לך האזנה שנייה, בחינם.', 'Buys you a second listen, free.') },
  { id: 'es.phrase.recovery.slowly', text: 'Más despacio, por favor.',
    meaning: T('דבר לאט, בבקשה.', 'Please speak slowly.'),
    tip: T('הופך מהירות של מקומיים למהירות שלך.', 'Turns native speed into your speed.') },
  { id: 'es.phrase.recovery.show-me', text: '¿Me lo puede mostrar?',
    meaning: T('אתה יכול להראות לי?', 'Can you show me?'),
    tip: T('כשמילים לא עוזרות — עוברים לעיניים: מפה, תפריט, מסך.', 'When words fail — switch to eyes: map, menu, screen.') },
  { id: 'es.phrase.recovery.one-moment', text: 'Un momento, por favor.',
    meaning: T('רגע אחד, בבקשה.', 'One moment, please.'),
    tip: T('קונה זמן לחשוב. אף אחד לא ממהר באמת.', 'Buys thinking time. Nobody is actually in a hurry.') },
  { id: 'es.phrase.recovery.thank-you', text: '¡Gracias!',
    meaning: T('תודה!', 'Thank you!'),
    tip: T('קונה סבלנות וחיוכים. להגיד הרבה.', 'Buys patience and smiles. Use generously.') },
  { id: 'es.phrase.recovery.sorry', text: '¡Perdón!',
    meaning: T('סליחה!', 'Sorry! / Excuse me!'),
    tip: T('פותחת דלתות, מרככת טעויות, עוצרת אנשים בנימוס.', 'Opens doors, softens mistakes, stops strangers politely.') },
];

/** Scene 1 (guided): the fast barista, in Spanish — survive with the tools. Wrong picks branch to
 *  recovery beats and return; the conversation continues naturally either way. */
const SCENE_STUCK_ES: BootcampDialogue = {
  id: 'stuck-traveler',
  coaching: true,
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1',
      en: '¡Buenos días! ¿Qué le pongo? ¡Tenemos una oferta en el café con leche!',
      tr: TR('Hi! What can I get you? We have a special on the café con leche!', 'בוקר טוב! מה להביא לך? יש מבצע על קפה עם חלב!'), he: 'בוקר טוב! מה להביא לך? יש מבצע על קפה עם חלב!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Perdón, no entiendo.', tr: TR("Sorry, I don't understand.", 'סליחה, אני לא מבין.'), he: 'סליחה, אני לא מבין.', itemId: 'es.phrase.recovery.dont-understand', correct: true, next: 'n2' },
      { en: '¡Adiós!', tr: TR('Goodbye!', 'להיפרד וללכת'), he: 'להיפרד וללכת', correct: false, next: 'r1',
        coach: T('לצאת עכשיו זה לוותר על הקפה. כלי הישרדות היה משאיר אותך בפנים — בלי לחץ.', 'Leaving now means giving up the coffee. A survival tool would have kept you in it — no pressure.') },
    ] },
    { id: 'r1', who: 'npc', next: 'c1b',
      en: 'Ah — ¡espere, no se vaya! Le puedo ayudar. ¿Un café?',
      tr: TR("Oh — wait, don't go! I can help. Coffee?", 'רגע — אל תלך! אני אעזור. קפה?'), he: 'רגע — אל תלך! אני אעזור. קפה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Perdón, no entiendo.', tr: TR("Sorry, I don't understand.", 'סליחה, אני לא מבין.'), he: 'סליחה, אני לא מבין.', itemId: 'es.phrase.recovery.dont-understand', correct: true, next: 'n2' },
      { en: '¡Perdón!', tr: TR('Sorry!', 'סליחה!'), he: 'סליחה!', itemId: 'es.phrase.recovery.sorry', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', slow: true, next: 'c2',
      en: '¡No pasa nada! ¿Café? ¿Té?', tr: TR('No problem! Coffee? Tea?', 'אין בעיה! קפה? תה?'), he: 'אין בעיה! קפה? תה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'n3' },
      { en: 'Me llamo Dan.', tr: TR('My name is Dan.', 'להציג את עצמך'), he: 'להציג את עצמך', correct: false, next: 'r2',
        coach: T('הצגת את עצמך — אבל הוא שאל מה תרצה. פה כלי הישרדות עוזר לך יותר.', 'You introduced yourself — but he asked what you’d like. Here a survival tool helps you more.') },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b',
      en: '¡Ja! Mucho gusto, Dan. Entonces… ¿café o té?', tr: TR('Ha! Nice to meet you, Dan. So… coffee or tea?', 'הא! נעים מאוד, דן! אז… קפה או תה?'), he: 'הא! נעים מאוד, דן! אז… קפה או תה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Un momento, por favor.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'es.phrase.recovery.one-moment', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'y1', en: 'Claro, tómese su tiempo.', tr: TR('Sure, take your time.', 'בטח, קח את הזמן.'), he: 'בטח, קח את הזמן.' },
    { id: 'y1', who: 'you', next: 'n4', en: 'Un café, por favor.', tr: TR('A coffee, please.', 'קפה, בבקשה.'), he: 'קפה, בבקשה.' },
    { id: 'n4', who: 'npc', next: 'c3', en: '¡Aquí tiene!', tr: TR('Here you go!', 'בבקשה, הנה!'), he: 'בבקשה, הנה!' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
      { en: 'Más despacio, por favor.', tr: TR('Please speak slowly.', 'לבקש שידבר לאט'), he: 'לבקש שידבר לאט', correct: false, next: 'r3',
        coach: T('"דבר לאט" הוא כלי מעולה — אבל הוא רק אמר "בבקשה, הנה". פה תודה מתאימה יותר.', '“Speak slowly” is a great tool — but he only said “Here you go”. Here a thank-you fits better.') },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b',
      en: 'Ja — solo dije: ¡AQUÍ — TIENE!', tr: TR('Ha — I only said: HERE — YOU — GO!', 'הא — רק אמרתי: בבקשה, הנה!'), he: 'הא — רק אמרתי: בבקשה, הנה!' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: '¡Gracias!', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'es.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: '¡Que aproveche!', tr: TR('Enjoy!', 'תהנה!'), he: 'תהנה!' },
  ],
};

export const DAY1_ES: BootcampDayContent = {
  day: 1,
  title: T('ערכת חילוץ — כשלא מבינים', 'Recovery Toolkit'),
  items: DAY1_ES_ITEMS,
  dialogues: { 'stuck-traveler': SCENE_STUCK_ES },
  steps: [
    { kind: 'talk', icon: '🎖️', title: T('ברוכים הבאים ל-READY', 'Welcome to READY'),
      body: [
        T('20 דקות. זה הכל.', 'Twenty minutes. That’s all.'),
        T('לא נלמד היום "ספרדית". נלמד דבר אחד: איך אי אפשר להיתקע.', 'We won’t “learn Spanish” today. We’ll learn one thing: how to never get stuck.'),
        T('בסוף המשימה עדיין לא תדע ספרדית — אבל כבר תפחד הרבה פחות.', 'By the end you still won’t know Spanish — but you’ll be far less afraid.'),
      ], cta: T('יאללה, מתחילים', 'Let’s go') },
    { kind: 'talk', icon: '🎯', title: T('ערכת חילוץ: אני יכול לשרוד', 'Recovery Toolkit: I Can Survive'),
      body: [
        T('עוד רגע תיכנס לבית קפה. הבריסטה מדבר מהר. אין לך מושג מה הוא אומר.', 'In a moment you’ll walk into a coffee shop. The barista talks fast. You have no idea what he’s saying.'),
        T('וזה בסדר גמור — כי יש לך כלים.', 'And that’s completely fine — because you have tools.'),
        T('בחר את השורות שלך. אי אפשר להיכשל כאן — רק לשרוד יפה יותר.', 'Choose your own lines. You can’t fail here — only survive with more style.'),
      ], cta: T('להיכנס לבית הקפה', 'Walk in') },
    { kind: 'talk', icon: '🛟', title: T('אין כאן תשובה מושלמת — יש דרך לצאת מהמצב', 'There’s no perfect answer here — there’s a way out'),
      body: [
        T('הבריסטה ידבר מהר. סביר שלא תבין הכול — וזה בסדר גמור.', 'The barista talks fast. You probably won’t understand everything — and that’s completely fine.'),
        T('המטרה שלך היא לא לענות נכון. המטרה היא לבחור כלי הישרדות.', 'Your job isn’t to answer perfectly. Your job is to pick a survival tool.'),
        T('כל משפט הישרדות הוא בחירה מתאימה. לפעמים כמה מהם מתאימים — וכולם עובדים.', 'Any survival phrase is a valid move. Sometimes several fit — and they all work.'),
        T('העיקר: לא לקפוא. יצאת מהמצב — ניצחת.', 'The main thing: don’t freeze. Get out of the moment — and you’ve won.'),
      ], cta: T('הבנתי — יאללה', 'Got it — let’s go') },
    { kind: 'dialogue', dialogueId: 'stuck-traveler' },
    { kind: 'receipt', text: T('שרדת שיחה אמיתית בספרדית — בלי לדעת ספרדית.', 'You survived a real conversation in Spanish — without knowing Spanish.') },
    { kind: 'talk', icon: '🛟', title: T('אז מה בעצם קרה שם?', 'So what actually happened there?'),
      body: [
        T('השתמשת בכלי הישרדות. עכשיו נכיר את כל השבעה — אחד-אחד.', 'You used survival tools. Now let’s meet all seven — one by one.'),
        T('אלה לא "מילים ללימוד". אלה רפלקסים.', 'These aren’t “vocabulary”. They’re reflexes.'),
      ] },
    // Vocabulary priming (Part 6), Spanish parallel: the smallest word foundation before the tools.
    // "Perdón, no entiendo." is composed of perdón + no + entiendo — met here first.
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('כמה מילים קטנות שחוזרות בכל הכלים.', 'A few tiny words that recur across the tools.'),
      words: [
        { text: 'perdón', meaning: T('סליחה', 'sorry'), emoji: '🙏' },
        { text: 'no', meaning: T('לא', 'no') },
        { text: 'entiendo', meaning: T('מבין', 'understand'), emoji: '💡' },
        { text: 'despacio', meaning: T('לאט', 'slowly'), emoji: '🐢' },
        { text: 'por favor', meaning: T('בבקשה', 'please') },
      ], buildFromItemId: 'es.phrase.recovery.dont-understand' },
    { kind: 'tool', itemId: 'es.phrase.recovery.dont-understand', index: 1, total: 7 },
    { kind: 'tool', itemId: 'es.phrase.recovery.repeat', index: 2, total: 7 },
    { kind: 'tool', itemId: 'es.phrase.recovery.slowly', index: 3, total: 7 },
    { kind: 'tool', itemId: 'es.phrase.recovery.show-me', index: 4, total: 7 },
    { kind: 'tool', itemId: 'es.phrase.recovery.one-moment', index: 5, total: 7 },
    { kind: 'tool', itemId: 'es.phrase.recovery.thank-you', index: 6, total: 7 },
    { kind: 'tool', itemId: 'es.phrase.recovery.sorry', index: 7, total: 7 },
    { kind: 'quiz', itemId: 'es.phrase.recovery.slowly', wrongIds: ['es.phrase.recovery.repeat', 'es.phrase.recovery.thank-you'] },
    { kind: 'quiz', itemId: 'es.phrase.recovery.dont-understand', wrongIds: ['es.phrase.recovery.one-moment', 'es.phrase.recovery.sorry'] },
    { kind: 'quiz', itemId: 'es.phrase.recovery.show-me', wrongIds: ['es.phrase.recovery.slowly', 'es.phrase.recovery.dont-understand'] },
    { kind: 'quiz', itemId: 'es.phrase.recovery.one-moment', wrongIds: ['es.phrase.recovery.thank-you', 'es.phrase.recovery.repeat'] },
    { kind: 'swipe', itemIds: DAY1_ES_ITEMS.map((i) => i.id) },
    { kind: 'dialogue', dialogueId: 'stuck-traveler' },
    { kind: 'receipt', text: T('סיבוב שני — הפעם ידעת בדיוק מה אתה עושה.', 'Round two — this time you knew exactly what you were doing.') },
    { kind: 'ambush', npc: { en: '¿Quiere el tique o le vale con un email?', tr: TR('Would you like the receipt or is email okay for you?', 'רוצה קבלה או שאימייל בסדר?'), he: 'רוצה קבלה או שאימייל בסדר?' },
      correctItemId: 'es.phrase.recovery.slowly', wrongItemId: 'es.phrase.recovery.thank-you' },
    { kind: 'receipt', text: T('מישהו ירה בך משפט מהיר — ולא קפאת. הגבת.', 'Someone fired a fast sentence at you — and you didn’t freeze. You responded.') },
    { kind: 'summary' },
  ],
};
