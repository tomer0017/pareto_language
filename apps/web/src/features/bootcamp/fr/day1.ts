import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampItem, BootcampDialogue } from '../types.js';

/**
 * French Mission 1 — "Je peux survivre." (Recovery Toolkit), the French parallel of the English
 * day-1 mission. PROVES the language-agnostic Bootcamp: identical `BootcampDayContent` shape, the
 * SAME engine/player renders it. Only the content is French.
 *
 * Field convention (engine): `en` = the SPOKEN line in the LEARNING language (here French); `tr` =
 * the app-language translation ({en,he}) the learner reads. Item ids are `fr.phrase.*` so French
 * progress + review events never mix with English. Instructional `talk`/`coach` copy stays app-
 * language ({he,en}) — it is coaching, not the target language.
 *
 * HONESTY: French is AI-drafted, neutral-polite (vous), pending native review.
 */

const T = (he: string, en: string): LocalizedText => ({ he, en });
/** App-language translation of a French line (what the learner reads): {en, he}. */
const TR = (en: string, he: string): LocalizedText => ({ en, he });

export const DAY1_FR_ITEMS: BootcampItem[] = [
  { id: 'fr.phrase.recovery.dont-understand', text: 'Désolé, je ne comprends pas.',
    meaning: T('סליחה, אני לא מבין.', "Sorry, I don't understand."),
    tip: T('ברגע שלא הבנת — אומרים. בלי בושה. זה מאפס את השיחה.', 'The moment you miss something — say it. It resets the exchange.') },
  { id: 'fr.phrase.recovery.repeat', text: 'Vous pouvez répéter ?',
    meaning: T('אפשר לחזור על זה?', 'Can you repeat that?'),
    tip: T('קונה לך האזנה שנייה, בחינם.', 'Buys you a second listen, free.') },
  { id: 'fr.phrase.recovery.slowly', text: 'Parlez lentement, s’il vous plaît.',
    meaning: T('דבר לאט, בבקשה.', 'Please speak slowly.'),
    tip: T('הופך מהירות של מקומיים למהירות שלך.', 'Turns native speed into your speed.') },
  { id: 'fr.phrase.recovery.show-me', text: 'Vous pouvez me montrer ?',
    meaning: T('אתה יכול להראות לי?', 'Can you show me?'),
    tip: T('כשמילים לא עוזרות — עוברים לעיניים: מפה, תפריט, מסך.', 'When words fail — switch to eyes: map, menu, screen.') },
  { id: 'fr.phrase.recovery.one-moment', text: 'Un instant, s’il vous plaît.',
    meaning: T('רגע אחד, בבקשה.', 'One moment, please.'),
    tip: T('קונה זמן לחשוב. אף אחד לא ממהר באמת.', 'Buys thinking time. Nobody is actually in a hurry.') },
  { id: 'fr.phrase.recovery.thank-you', text: 'Merci !',
    meaning: T('תודה!', 'Thank you!'),
    tip: T('קונה סבלנות וחיוכים. להגיד הרבה.', 'Buys patience and smiles. Use generously.') },
  { id: 'fr.phrase.recovery.sorry', text: 'Pardon !',
    meaning: T('סליחה!', 'Sorry! / Excuse me!'),
    tip: T('פותחת דלתות, מרככת טעויות, עוצרת אנשים בנימוס.', 'Opens doors, softens mistakes, stops strangers politely.') },
];

/** Scene 1 (guided): the fast barista, in French — survive with the tools. Wrong picks branch to
 *  recovery beats and return; the conversation continues naturally either way. */
const SCENE_STUCK_FR: BootcampDialogue = {
  id: 'stuck-traveler',
  coaching: true,
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1',
      en: 'Bonjour ! Qu’est-ce que je vous sers ? On a une promo sur le café crème !',
      tr: TR('Hi! What can I get you? We have a special on the café crème!', 'בוקר טוב! מה להביא לך? יש מבצע על קפה עם חלב!'), he: 'בוקר טוב! מה להביא לך? יש מבצע על קפה עם חלב!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: 'Désolé, je ne comprends pas.', tr: TR("Sorry, I don't understand.", 'סליחה, אני לא מבין.'), he: 'סליחה, אני לא מבין.', itemId: 'fr.phrase.recovery.dont-understand', correct: true, next: 'n2' },
      { en: 'Au revoir !', tr: TR('Goodbye!', 'להיפרד וללכת'), he: 'להיפרד וללכת', correct: false, next: 'r1',
        coach: T('לצאת עכשיו זה לוותר על הקפה. כלי הישרדות היה משאיר אותך בפנים — בלי לחץ.', 'Leaving now means giving up the coffee. A survival tool would have kept you in it — no pressure.') },
    ] },
    { id: 'r1', who: 'npc', next: 'c1b',
      en: 'Oh — attendez, ne partez pas ! Je peux vous aider. Un café ?',
      tr: TR("Oh — wait, don't go! I can help. Coffee?", 'רגע — אל תלך! אני אעזור. קפה?'), he: 'רגע — אל תלך! אני אעזור. קפה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: 'Désolé, je ne comprends pas.', tr: TR("Sorry, I don't understand.", 'סליחה, אני לא מבין.'), he: 'סליחה, אני לא מבין.', itemId: 'fr.phrase.recovery.dont-understand', correct: true, next: 'n2' },
      { en: 'Pardon !', tr: TR('Sorry!', 'סליחה!'), he: 'סליחה!', itemId: 'fr.phrase.recovery.sorry', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', slow: true, next: 'c2',
      en: 'Pas de problème ! Café ? Thé ?', tr: TR('No problem! Coffee? Tea?', 'אין בעיה! קפה? תה?'), he: 'אין בעיה! קפה? תה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'n3' },
      { en: 'Je m’appelle Dan.', tr: TR('My name is Dan.', 'להציג את עצמך'), he: 'להציג את עצמך', correct: false, next: 'r2',
        coach: T('הצגת את עצמך — אבל הוא שאל מה תרצה. פה כלי הישרדות עוזר לך יותר.', 'You introduced yourself — but he asked what you’d like. Here a survival tool helps you more.') },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b',
      en: 'Ha ! Enchanté, Dan. Alors… café ou thé ?', tr: TR('Ha! Nice to meet you, Dan. So… coffee or tea?', 'הא! נעים מאוד, דן! אז… קפה או תה?'), he: 'הא! נעים מאוד, דן! אז… קפה או תה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'Un instant, s’il vous plaît.', tr: TR('One moment, please.', 'רגע אחד, בבקשה.'), he: 'רגע אחד, בבקשה.', itemId: 'fr.phrase.recovery.one-moment', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'y1', en: 'Bien sûr, prenez votre temps.', tr: TR('Sure, take your time.', 'בטח, קח את הזמן.'), he: 'בטח, קח את הזמן.' },
    { id: 'y1', who: 'you', next: 'n4', en: 'Un café, s’il vous plaît.', tr: TR('A coffee, please.', 'קפה, בבקשה.'), he: 'קפה, בבקשה.' },
    { id: 'n4', who: 'npc', next: 'c3', en: 'Et voilà !', tr: TR('Here you go!', 'בבקשה, הנה!'), he: 'בבקשה, הנה!' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
      { en: 'Parlez lentement, s’il vous plaît.', tr: TR('Please speak slowly.', 'לבקש שידבר לאט'), he: 'לבקש שידבר לאט', correct: false, next: 'r3',
        coach: T('"דבר לאט" הוא כלי מעולה — אבל הוא רק אמר "בבקשה, הנה". פה תודה מתאימה יותר.', '“Speak slowly” is a great tool — but he only said “Here you go”. Here a thank-you fits better.') },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b',
      en: 'Ha — j’ai juste dit : ET — VOILÀ !', tr: TR('Ha — I only said: HERE — YOU — GO!', 'הא — רק אמרתי: בבקשה, הנה!'), he: 'הא — רק אמרתי: בבקשה, הנה!' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Merci !', tr: TR('Thank you!', 'תודה!'), he: 'תודה!', itemId: 'fr.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Bonne dégustation !', tr: TR('Enjoy!', 'תהנה!'), he: 'תהנה!' },
  ],
};

export const DAY1_FR: BootcampDayContent = {
  day: 1,
  title: T('ערכת חילוץ — כשלא מבינים', 'Recovery Toolkit'),
  items: DAY1_FR_ITEMS,
  dialogues: { 'stuck-traveler': SCENE_STUCK_FR },
  steps: [
    { kind: 'talk', icon: '🎖️', title: T('ברוכים הבאים ל-READY', 'Welcome to READY'),
      body: [
        T('20 דקות. זה הכל.', 'Twenty minutes. That’s all.'),
        T('לא נלמד היום "צרפתית". נלמד דבר אחד: איך אי אפשר להיתקע.', 'We won’t “learn French” today. We’ll learn one thing: how to never get stuck.'),
        T('בסוף המשימה עדיין לא תדע צרפתית — אבל כבר תפחד הרבה פחות.', 'By the end you still won’t know French — but you’ll be far less afraid.'),
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
    { kind: 'receipt', text: T('שרדת שיחה אמיתית בצרפתית — בלי לדעת צרפתית.', 'You survived a real conversation in French — without knowing French.') },
    { kind: 'talk', icon: '🛟', title: T('אז מה בעצם קרה שם?', 'So what actually happened there?'),
      body: [
        T('השתמשת בכלי הישרדות. עכשיו נכיר את כל השבעה — אחד-אחד.', 'You used survival tools. Now let’s meet all seven — one by one.'),
        T('אלה לא "מילים ללימוד". אלה רפלקסים.', 'These aren’t “vocabulary”. They’re reflexes.'),
      ] },
    // Vocabulary priming (Part 6), French parallel: the smallest word foundation before the tools.
    // "Désolé, je ne comprends pas." is composed of désolé + je + comprends — met here first.
    { kind: 'prime', label: T('לפני שנדבר', 'Before we speak'),
      intro: T('כמה מילים קטנות שחוזרות בכל הכלים.', 'A few tiny words that recur across the tools.'),
      words: [
        { text: 'désolé', meaning: T('סליחה', 'sorry'), emoji: '🙏' },
        { text: 'je', meaning: T('אני', 'I') },
        { text: 'comprends', meaning: T('מבין', 'understand'), emoji: '💡' },
        { text: 'lentement', meaning: T('לאט', 'slowly'), emoji: '🐢' },
        { text: 's’il vous plaît', meaning: T('בבקשה', 'please') },
      ], buildFromItemId: 'fr.phrase.recovery.dont-understand' },
    { kind: 'tool', itemId: 'fr.phrase.recovery.dont-understand', index: 1, total: 7 },
    { kind: 'tool', itemId: 'fr.phrase.recovery.repeat', index: 2, total: 7 },
    { kind: 'tool', itemId: 'fr.phrase.recovery.slowly', index: 3, total: 7 },
    { kind: 'tool', itemId: 'fr.phrase.recovery.show-me', index: 4, total: 7 },
    { kind: 'tool', itemId: 'fr.phrase.recovery.one-moment', index: 5, total: 7 },
    { kind: 'tool', itemId: 'fr.phrase.recovery.thank-you', index: 6, total: 7 },
    { kind: 'tool', itemId: 'fr.phrase.recovery.sorry', index: 7, total: 7 },
    { kind: 'quiz', itemId: 'fr.phrase.recovery.slowly', wrongIds: ['fr.phrase.recovery.repeat', 'fr.phrase.recovery.thank-you'] },
    { kind: 'quiz', itemId: 'fr.phrase.recovery.dont-understand', wrongIds: ['fr.phrase.recovery.one-moment', 'fr.phrase.recovery.sorry'] },
    { kind: 'quiz', itemId: 'fr.phrase.recovery.show-me', wrongIds: ['fr.phrase.recovery.slowly', 'fr.phrase.recovery.dont-understand'] },
    { kind: 'quiz', itemId: 'fr.phrase.recovery.one-moment', wrongIds: ['fr.phrase.recovery.thank-you', 'fr.phrase.recovery.repeat'] },
    { kind: 'swipe', itemIds: DAY1_FR_ITEMS.map((i) => i.id) },
    { kind: 'dialogue', dialogueId: 'stuck-traveler' },
    { kind: 'receipt', text: T('סיבוב שני — הפעם ידעת בדיוק מה אתה עושה.', 'Round two — this time you knew exactly what you were doing.') },
    { kind: 'ambush', npc: { en: 'Vous voulez le ticket ou un email, c’est bon pour vous ?', tr: TR('Would you like the receipt or is email okay for you?', 'רוצה קבלה או שאימייל בסדר?'), he: 'רוצה קבלה או שאימייל בסדר?' },
      correctItemId: 'fr.phrase.recovery.slowly', wrongItemId: 'fr.phrase.recovery.thank-you' },
    { kind: 'receipt', text: T('מישהו ירה בך משפט מהיר — ולא קפאת. הגבת.', 'Someone fired a fast sentence at you — and you didn’t freeze. You responded.') },
    { kind: 'summary' },
  ],
};
