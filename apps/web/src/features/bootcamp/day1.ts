import type { LocalizedText } from '@ready/content-schema';

/**
 * Bootcamp Day 1 — "I can survive." (Sprint 6 Parts 2–8)
 * Fully authored, dialogue-first, listening-first. This file is the TEMPLATE:
 * days 2–20 are new files of the same shape — zero new code.
 *
 * Minute map (~20:00):
 * 00:00 welcome · 01:30 briefing · 03:00 dialogue WATCH (tools appear in life first)
 * 05:30 tools 1–4 (hear→meaning→say) · 10:00 tools 5–7 · 12:30 listening quiz
 * 15:00 swipe game · 16:30 dialogue PLAY · 18:30 confidence ambush · 19:30 summary
 */

export interface BootcampItem {
  id: string;                 // frozen convention — matches future en-pack ids
  text: string;               // English
  meaning: LocalizedText;     // he + en
  tip?: LocalizedText;        // one-line "when to use"
}

export interface DialogueLine {
  who: 'npc' | 'you';
  en: string;
  he: string;
  /** play-mode choice point: pick the right line (itemId) vs a clearly-wrong option. */
  choice?: { correctItemId: string; wrong: LocalizedText };
  fast?: boolean;             // spoken at full speed
}

export type BootcampStep =
  | { kind: 'talk'; icon: string; title: LocalizedText; body: LocalizedText[]; cta?: LocalizedText }
  | { kind: 'tool'; itemId: string; index: number; total: number }
  | { kind: 'quiz'; itemId: string; wrongIds: [string, string] }
  | { kind: 'swipe'; itemIds: string[] }
  | { kind: 'dialogue'; mode: 'watch' | 'play' }
  | { kind: 'ambush'; npc: { en: string; he: string }; correctItemId: string; wrongItemId: string }
  | { kind: 'receipt'; text: LocalizedText }
  | { kind: 'summary' };

export interface BootcampDayContent {
  day: number;
  title: LocalizedText;
  items: BootcampItem[];
  dialogue: DialogueLine[];
  steps: BootcampStep[];
}

export const DAY1_ITEMS: BootcampItem[] = [
  { id: 'en.phrase.recovery.dont-understand', text: "Sorry, I don't understand.",
    meaning: { he: 'סליחה, אני לא מבין.', en: "Sorry, I don't understand." },
    tip: { he: 'ברגע שלא הבנת — אומרים. בלי בושה. זה מאפס את השיחה.', en: 'The moment you miss something — say it. It resets the exchange.' } },
  { id: 'en.phrase.recovery.repeat', text: 'Can you repeat that?',
    meaning: { he: 'אפשר לחזור על זה?', en: 'Can you repeat that?' },
    tip: { he: 'קונה לך האזנה שנייה, בחינם.', en: 'Buys you a second listen, free.' } },
  { id: 'en.phrase.recovery.slowly', text: 'Please speak slowly.',
    meaning: { he: 'דבר לאט, בבקשה.', en: 'Please speak slowly.' },
    tip: { he: 'הופך מהירות של מקומיים למהירות שלך.', en: 'Turns native speed into your speed.' } },
  { id: 'en.phrase.recovery.show-me', text: 'Can you show me?',
    meaning: { he: 'אתה יכול להראות לי?', en: 'Can you show me?' },
    tip: { he: 'כשמילים לא עוזרות — עוברים לעיניים: מפה, תפריט, מסך.', en: 'When words fail — switch to eyes: map, menu, screen.' } },
  { id: 'en.phrase.recovery.one-moment', text: 'One moment, please.',
    meaning: { he: 'רגע אחד, בבקשה.', en: 'One moment, please.' },
    tip: { he: 'קונה זמן לחשוב. אף אחד לא ממהר באמת.', en: 'Buys thinking time. Nobody is actually in a hurry.' } },
  { id: 'en.phrase.recovery.thank-you', text: 'Thank you!',
    meaning: { he: 'תודה!', en: 'Thank you!' },
    tip: { he: 'המילה שקונה סבלנות וחיוכים. להגיד הרבה.', en: 'Buys patience and smiles. Use generously.' } },
  { id: 'en.phrase.recovery.sorry', text: 'Sorry!',
    meaning: { he: 'סליחה!', en: 'Sorry!' },
    tip: { he: 'פותחת דלתות, מרככת טעויות, עוצרת אנשים ברחוב.', en: 'Opens doors, softens mistakes, stops strangers politely.' } },
];

/** The stuck-traveler scene: a coffee kiosk. The tools appear IN LIFE before any explanation. */
export const DAY1_DIALOGUE: DialogueLine[] = [
  { who: 'npc', en: "Hi there! What can I get you today — we've got a special on the flat white!", he: 'היי! מה להביא לך היום — יש לנו מבצע על הפלאט וייט!', fast: true },
  { who: 'you', en: "Sorry, I don't understand.", he: 'סליחה, אני לא מבין.',
    choice: { correctItemId: 'en.phrase.recovery.dont-understand', wrong: { he: '"Goodbye!" — להגיד שלום וללכת', en: '"Goodbye!" — say bye and leave' } } },
  { who: 'npc', en: 'No problem! Coffee? Tea?', he: 'אין בעיה! קפה? תה?' },
  { who: 'you', en: 'One moment, please.', he: 'רגע אחד, בבקשה.',
    choice: { correctItemId: 'en.phrase.recovery.one-moment', wrong: { he: '"My name is Dan" — להציג את עצמך', en: '"My name is Dan" — introduce yourself' } } },
  { who: 'npc', en: 'Sure, take your time.', he: 'בטח, קח את הזמן.' },
  { who: 'you', en: 'Coffee, please.', he: 'קפה, בבקשה.' },
  { who: 'npc', en: 'Here you go!', he: 'בבקשה, הנה!' },
  { who: 'you', en: 'Thank you!', he: 'תודה!',
    choice: { correctItemId: 'en.phrase.recovery.thank-you', wrong: { he: '"Please speak slowly" — לבקש שידבר לאט', en: '"Please speak slowly" — ask them to slow down' } } },
];

const T = (he: string, en: string): LocalizedText => ({ he, en });

export const DAY1: BootcampDayContent = {
  day: 1,
  title: T('אני יכול לשרוד.', 'I can survive.'),
  items: DAY1_ITEMS,
  dialogue: DAY1_DIALOGUE,
  steps: [
    { kind: 'talk', icon: '🎖️', title: T('ברוכים הבאים ל-READY', 'Welcome to READY'),
      body: [
        T('20 דקות. זה הכל.', 'Twenty minutes. That’s all.'),
        T('לא נלמד היום "אנגלית". נלמד דבר אחד: איך אי אפשר להיתקע.', 'We won’t “learn English” today. We’ll learn one thing: how to never get stuck.'),
        T('בסוף היום הזה עדיין לא תדע אנגלית — אבל כבר תפחד הרבה פחות.', 'By the end you still won’t know English — but you’ll be far less afraid.'),
      ], cta: T('יאללה, מתחילים', 'Let’s go') },
    { kind: 'talk', icon: '🎯', title: T('המשימה של היום', 'Today’s mission'),
      body: [
        T('היכולת של היום: אני יכול לשרוד.', 'Today’s capability: I can survive.'),
        T('שבעה כלים. שיחה אמיתית אחת. בלי רשימות מילים.', 'Seven tools. One real conversation. No word lists.'),
        T('קודם תראה מישהו שורד — ואז זה יהיה אתה.', 'First you’ll watch someone survive — then it’ll be you.'),
      ], cta: T('להתחיל', 'Start') },
    { kind: 'dialogue', mode: 'watch' },
    { kind: 'receipt', text: T('הבנת שיחה שלמה באנגלית. כן, עכשיו.', 'You just understood a full conversation in English. Yes, just now.') },
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
    { kind: 'dialogue', mode: 'play' },
    { kind: 'receipt', text: T('שרדת את השיחה הראשונה שלך — עם הכלים, בלי לקפוא.', 'You survived your first conversation — with the tools, without freezing.') },
    { kind: 'ambush', npc: { en: 'Would you like the receipt with that or is email okay for you?', he: 'רוצה קבלה מודפסת או שאימייל בסדר מבחינתך?' },
      correctItemId: 'en.phrase.recovery.slowly', wrongItemId: 'en.phrase.recovery.thank-you' },
    { kind: 'receipt', text: T('מישהו ירה בך משפט מהיר — ולא קפאת. הגבת.', 'Someone fired a fast sentence at you — and you didn’t freeze. You responded.') },
    { kind: 'summary' },
  ],
};
