import type { LocalizedText } from '@ready/content-schema';
import type { BootcampDayContent, BootcampItem, BootcampDialogue } from './types.js';

/**
 * Mission 1 — "I Can Survive." (interactive rebuild, Sprint 7)
 * Dialogue-first and one-line-at-a-time: the user meets the tools inside a live scene,
 * chooses their own lines, and never sees the conversation in advance.
 */

const T = (he: string, en: string): LocalizedText => ({ he, en });

export const DAY1_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.recovery.dont-understand', text: "Sorry, I don't understand.",
    meaning: T('סליחה, אני לא מבין.', "Sorry, I don't understand."),
    tip: T('ברגע שלא הבנת — אומרים. בלי בושה. זה מאפס את השיחה.', 'The moment you miss something — say it. It resets the exchange.') },
  { id: 'en.phrase.recovery.repeat', text: 'Can you repeat that?',
    meaning: T('אפשר לחזור על זה?', 'Can you repeat that?'),
    tip: T('קונה לך האזנה שנייה, בחינם.', 'Buys you a second listen, free.') },
  { id: 'en.phrase.recovery.slowly', text: 'Please speak slowly.',
    meaning: T('דבר לאט, בבקשה.', 'Please speak slowly.'),
    tip: T('הופך מהירות של מקומיים למהירות שלך.', 'Turns native speed into your speed.') },
  { id: 'en.phrase.recovery.show-me', text: 'Can you show me?',
    meaning: T('אתה יכול להראות לי?', 'Can you show me?'),
    tip: T('כשמילים לא עוזרות — עוברים לעיניים: מפה, תפריט, מסך.', 'When words fail — switch to eyes: map, menu, screen.') },
  { id: 'en.phrase.recovery.one-moment', text: 'One moment, please.',
    meaning: T('רגע אחד, בבקשה.', 'One moment, please.'),
    tip: T('קונה זמן לחשוב. אף אחד לא ממהר באמת.', 'Buys thinking time. Nobody is actually in a hurry.') },
  { id: 'en.phrase.recovery.thank-you', text: 'Thank you!',
    meaning: T('תודה!', 'Thank you!'),
    tip: T('קונה סבלנות וחיוכים. להגיד הרבה.', 'Buys patience and smiles. Use generously.') },
  { id: 'en.phrase.recovery.sorry', text: 'Sorry!',
    meaning: T('סליחה!', 'Sorry!'),
    tip: T('פותחת דלתות, מרככת טעויות, עוצרת אנשים בנימוס.', 'Opens doors, softens mistakes, stops strangers politely.') },
];

/** Scene 1 (guided): the fast barista — survive with the tools. Wrong picks branch to
 *  recovery beats and come back; the conversation continues naturally either way. */
const SCENE_STUCK: BootcampDialogue = {
  id: 'stuck-traveler',
  start: 'n1',
  nodes: [
    { id: 'n1', who: 'npc', fast: true, next: 'c1',
      en: "Hi there! What can I get you today — we've got a special on the flat white!",
      he: 'היי! מה להביא לך היום — יש מבצע על flat white (אספרסו עם חלב מוקצף)!' },
    { id: 'c1', who: 'you', en: '', he: '', choices: [
      { en: "Sorry, I don't understand.", he: 'סליחה, אני לא מבין.', itemId: 'en.phrase.recovery.dont-understand', correct: true, next: 'n2' },
      { en: 'Goodbye!', he: 'להגיד שלום וללכת', correct: false, next: 'r1' },
    ] },
    { id: 'r1', who: 'npc', next: 'c1b',
      en: "Oh — wait, don't go! I can help. Coffee?", he: 'רגע — אל תלך! אני אעזור. קפה?' },
    { id: 'c1b', who: 'you', en: '', he: '', choices: [
      { en: "Sorry, I don't understand.", he: 'סליחה, אני לא מבין.', itemId: 'en.phrase.recovery.dont-understand', correct: true, next: 'n2' },
      { en: 'Sorry!', he: 'סליחה!', itemId: 'en.phrase.recovery.sorry', correct: true, next: 'n2' },
    ] },
    { id: 'n2', who: 'npc', slow: true, next: 'c2',
      en: 'No problem! Coffee? Tea?', he: 'אין בעיה! קפה? תה?' },
    { id: 'c2', who: 'you', en: '', he: '', choices: [
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה.', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'n3' },
      { en: 'My name is Dan.', he: 'להציג את עצמך', correct: false, next: 'r2' },
    ] },
    { id: 'r2', who: 'npc', next: 'c2b',
      en: "Ha! Nice to meet you, Dan. So… coffee, or tea?", he: 'נעים מאוד, דן! אז… קפה או תה?' },
    { id: 'c2b', who: 'you', en: '', he: '', choices: [
      { en: 'One moment, please.', he: 'רגע אחד, בבקשה.', itemId: 'en.phrase.recovery.one-moment', correct: true, next: 'n3' },
    ] },
    { id: 'n3', who: 'npc', next: 'y1', en: 'Sure, take your time.', he: 'בטח, קח את הזמן.' },
    { id: 'y1', who: 'you', next: 'n4', en: 'Coffee, please.', he: 'קפה, בבקשה.' },
    { id: 'n4', who: 'npc', next: 'c3', en: 'Here you go!', he: 'בבקשה, הנה!' },
    { id: 'c3', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
      { en: 'Please speak slowly.', he: 'לבקש שידבר לאט', correct: false, next: 'r3' },
    ] },
    { id: 'r3', who: 'npc', slow: true, next: 'c3b',
      en: 'Ha — I only said: HERE — YOU — GO!', he: 'הא — רק אמרתי: בבקשה, הנה!' },
    { id: 'c3b', who: 'you', en: '', he: '', choices: [
      { en: 'Thank you!', he: 'תודה!', itemId: 'en.phrase.recovery.thank-you', correct: true, next: 'n5' },
    ] },
    { id: 'n5', who: 'npc', end: true, en: 'Enjoy!', he: 'תהנה!' },
  ],
};

export const DAY1: BootcampDayContent = {
  day: 1,
  title: T('אני יכול לשרוד.', 'I Can Survive'),
  items: DAY1_ITEMS,
  dialogues: { 'stuck-traveler': SCENE_STUCK },
  steps: [
    { kind: 'talk', icon: '🎖️', title: T('ברוכים הבאים ל-READY', 'Welcome to READY'),
      body: [
        T('20 דקות. זה הכל.', 'Twenty minutes. That’s all.'),
        T('לא נלמד היום "אנגלית". נלמד דבר אחד: איך אי אפשר להיתקע.', 'We won’t “learn English” today. We’ll learn one thing: how to never get stuck.'),
        T('בסוף המשימה עדיין לא תדע אנגלית — אבל כבר תפחד הרבה פחות.', 'By the end you still won’t know English — but you’ll be far less afraid.'),
      ], cta: T('יאללה, מתחילים', 'Let’s go') },
    { kind: 'talk', icon: '🎯', title: T('משימה 1: אני יכול לשרוד', 'Mission 1: I Can Survive'),
      body: [
        T('עוד רגע תיכנס לבית קפה. הבריסטה מדבר מהר. אין לך מושג מה הוא אומר.', 'In a moment you’ll walk into a coffee shop. The barista talks fast. You have no idea what he’s saying.'),
        T('וזה בסדר גמור — כי יש לך כלים.', 'And that’s completely fine — because you have tools.'),
        T('בחר את השורות שלך. אי אפשר להיכשל כאן — רק לשרוד יפה יותר.', 'Choose your own lines. You can’t fail here — only survive with more style.'),
      ], cta: T('להיכנס לבית הקפה', 'Walk in') },
    { kind: 'dialogue', dialogueId: 'stuck-traveler' },
    { kind: 'receipt', text: T('שרדת שיחה אמיתית באנגלית — בלי לדעת אנגלית.', 'You survived a real conversation in English — without knowing English.') },
    { kind: 'talk', icon: '🛟', title: T('אז מה בעצם קרה שם?', 'So what actually happened there?'),
      body: [
        T('השתמשת בכלי הישרדות. עכשיו נכיר את כל השבעה — אחד-אחד.', 'You used survival tools. Now let’s meet all seven — one by one.'),
        T('אלה לא "מילים ללימוד". אלה רפלקסים.', 'These aren’t “vocabulary”. They’re reflexes.'),
      ] },
    { kind: 'tool', itemId: 'en.phrase.recovery.dont-understand', index: 1, total: 7 },
    { kind: 'tool', itemId: 'en.phrase.recovery.repeat', index: 2, total: 7 },
    { kind: 'tool', itemId: 'en.phrase.recovery.slowly', index: 3, total: 7 },
    { kind: 'tool', itemId: 'en.phrase.recovery.show-me', index: 4, total: 7 },
    { kind: 'tool', itemId: 'en.phrase.recovery.one-moment', index: 5, total: 7 },
    { kind: 'tool', itemId: 'en.phrase.recovery.thank-you', index: 6, total: 7 },
    { kind: 'tool', itemId: 'en.phrase.recovery.sorry', index: 7, total: 7 },
    { kind: 'quiz', itemId: 'en.phrase.recovery.slowly', wrongIds: ['en.phrase.recovery.repeat', 'en.phrase.recovery.thank-you'] },
    { kind: 'quiz', itemId: 'en.phrase.recovery.dont-understand', wrongIds: ['en.phrase.recovery.one-moment', 'en.phrase.recovery.sorry'] },
    { kind: 'quiz', itemId: 'en.phrase.recovery.show-me', wrongIds: ['en.phrase.recovery.slowly', 'en.phrase.recovery.dont-understand'] },
    { kind: 'quiz', itemId: 'en.phrase.recovery.one-moment', wrongIds: ['en.phrase.recovery.thank-you', 'en.phrase.recovery.repeat'] },
    { kind: 'swipe', itemIds: DAY1_ITEMS.map((i) => i.id) },
    { kind: 'dialogue', dialogueId: 'stuck-traveler' },
    { kind: 'receipt', text: T('סיבוב שני — הפעם ידעת בדיוק מה אתה עושה.', 'Round two — this time you knew exactly what you were doing.') },
    { kind: 'ambush', npc: { en: 'Would you like the receipt with that or is email okay for you?', he: 'רוצה קבלה מודפסת או שאימייל בסדר?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.recovery.thank-you' },
    { kind: 'receipt', text: T('מישהו ירה בך משפט מהיר — ולא קפאת. הגבת.', 'Someone fired a fast sentence at you — and you didn’t freeze. You responded.') },
    { kind: 'summary' },
  ],
};
