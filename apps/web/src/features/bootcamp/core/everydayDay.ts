import type { LocalizedText } from '@ready/content-schema';
import { fromItems, itemOf, npc, spokenLine, tool, you, type Copy, type L4, type MissionLang, type MissionSpec, type NpcLine, type SceneSpec, type SpecItem, type YouLine } from '../author.js';
import type { CaptureGroup, CheckpointLine, CheckpointPlan, CheckpointTurn } from '../checkpoint.js';
import type { BootcampItem, BootcampStep } from '../types.js';
import { DAY2_ITEMS } from '../day2.js';
import { DAY3_ITEMS } from '../day3.js';
import { DAY4_ITEMS } from '../day4.js';
import { DAY16_ITEMS } from '../day16.js';
import { DAY2_FR_ITEMS } from '../fr/day2.js';
import { DAY3_FR_ITEMS } from '../fr/day3.js';
import { DAY4_FR_ITEMS } from '../fr/day4.js';
import { DAY16_FR_ITEMS } from '../fr/day16.js';
import { DAY2_ES_ITEMS } from '../es/day2.js';
import { DAY3_ES_ITEMS } from '../es/day3.js';
import { DAY4_ES_ITEMS } from '../es/day4.js';
import { DAY16_ES_ITEMS } from '../es/day16.js';
import { HOBBIES } from './hobbies.js';
import { HOME_FAMILY } from './homeFamily.js';
import { TIME_PLANS } from './timePlans.js';

/**
 * Mission 18 — CHECKPOINT: Everyday Day. "Can this learner handle a normal everyday day abroad?" One
 * day — ☕ morning coffee → 👋 plans & hobbies → 🛒 the supermarket → 🍽️ dinner — run as a SAMPLED
 * adaptive checkpoint (`checkpoint.ts`, `adaptive` rules): TRY FIRST, teach only after failure.
 *
 *   QUICK SCAN   six core probes, nothing taught first: each line is recalled before its options are
 *                shown; "💡 Help" shows a hint and marks the answer ASSISTED. A miss is noted, not shown.
 *   QUICK FIX    only what was missed: one card, one retry (REPAIRED or UNRESOLVED). None if nothing was.
 *   ONE TAKE     the whole day, once, no teaching: a first miss is re-asked slowly, a second shows the
 *                line and gives one supported pick — the day goes on.
 *   FINAL FIX    at most two of the one-take's misses, the most survival-critical first, once each.
 *   REPORT       🟢 READY · 🟡 ALMOST READY · 🔴 REVIEW NEEDED, and what each part of the day took —
 *                never a score.
 *
 * The dialogue is LOCKED (wording, order, roles). The learner says ONLY lines Missions 01–17 taught —
 * same id, same wording. Every wrong option is a canonical line of the same day, from another moment.
 * "At the checkout…" and "Later…" are silent scene cues. There is no video: the one-take is the event.
 */

const EN: BootcampItem[] = [...DAY2_ITEMS, ...DAY3_ITEMS, ...DAY4_ITEMS, ...DAY16_ITEMS];
const FR: BootcampItem[] = [...DAY2_FR_ITEMS, ...DAY3_FR_ITEMS, ...DAY4_FR_ITEMS, ...DAY16_FR_ITEMS];
const ES: BootcampItem[] = [...DAY2_ES_ITEMS, ...DAY3_ES_ITEMS, ...DAY4_ES_ITEMS, ...DAY16_ES_ITEMS];
/** A sentence taught by one of the hand-written missions (same id, same wording). */
const known = (id: string): SpecItem => fromItems(id, EN, FR, ES);

/* The locked conversation (EN · FR · ES · HE) — the other people's lines. */
const M_HELLO = npc('Good morning! What can I get you?', 'Bonjour ! Qu’est-ce que je vous sers ?', '¡Buenos días! ¿Qué le sirvo?', 'בוקר טוב! מה להביא לך?', 'fast');
const M_EAT = npc('Sure. Anything to eat?', 'Très bien. Quelque chose à manger ?', 'Claro. ¿Algo de comer?', 'בטח. משהו לאכול?');
const M_PAY = npc('No problem. Cash or card?', 'Pas de problème. Espèces ou carte ?', 'Sin problema. ¿Efectivo o tarjeta?', 'אין בעיה. מזומן או כרטיס?', 'fast');
const M_BYE = npc('Thank you! Have a nice day!', 'Merci ! Bonne journée !', '¡Gracias! ¡Que tenga un buen día!', 'תודה! שיהיה יום נעים!');
const P_FREE = npc('Hi! Are you free tomorrow?', 'Salut ! Tu es libre demain ?', '¡Hola! ¿Estás libre mañana?', 'היי! אתה פנוי מחר?', 'fast');
const P_SURF = npc('I surf a lot. Do you like surfing?', 'Je fais beaucoup de surf. Tu aimes le surf ?', 'Hago mucho surf. ¿Te gusta el surf?', 'אני גולש הרבה. אתה אוהב לגלוש?');
const P_EARLY = npc('Then come with us! But we leave early.', 'Alors viens avec nous ! Mais on part tôt.', '¡Entonces ven con nosotros! Pero salimos temprano.', 'אז בוא איתנו! אבל אנחנו יוצאים מוקדם.');
const P_TONIGHT = npc('Perfect. And what are you doing tonight?', 'Parfait. Et tu fais quoi ce soir ?', 'Perfecto. ¿Y qué haces esta noche?', 'מושלם. ומה אתה עושה הערב?');
const P_BYE = npc('Good night. See you tomorrow!', 'Bonne nuit. À demain !', 'Buenas noches. ¡Nos vemos mañana!', 'לילה טוב. נתראה מחר!');
const S_HELP = npc('Hi there! Can I help you find something?', 'Bonjour ! Je peux vous aider à trouver quelque chose ?', '¡Hola! ¿Le ayudo a encontrar algo?', 'היי! לעזור לך למצוא משהו?', 'fast');
const S_AISLE = npc('The milk is in aisle three, on the left.', 'Le lait est dans l’allée trois, sur la gauche.', 'La leche está en el pasillo tres, a la izquierda.', 'החלב במעבר שלוש, משמאל.', 'fast');
const S_EVERYTHING = npc('Hi! Is that everything?', 'Bonjour ! Ce sera tout ?', '¡Hola! ¿Eso es todo?', 'היי! זה הכל?');
const S_BAG = npc('Do you need a bag?', 'Vous avez besoin d’un sac ?', '¿Necesita una bolsa?', 'צריך שקית?');
const S_CARD = npc('Insert your card here… all done. Have a nice day!', 'Insérez votre carte ici… c’est bon. Bonne journée !', 'Inserte su tarjeta aquí… listo. ¡Que tenga un buen día!', 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!');
const D_RESERVATION = npc('Good evening! Do you have a reservation?', 'Bonsoir ! Vous avez une réservation ?', '¡Buenas noches! ¿Tiene reserva?', 'ערב טוב! יש לכם הזמנה?', 'fast');
const D_READY = npc('Are you ready to order?', 'Vous êtes prêts à commander ?', '¿Están listos para pedir?', 'מוכנים להזמין?');
const D_DRINK = npc('Of course. Anything to drink?', 'Bien sûr. Quelque chose à boire ?', 'Claro. ¿Algo de beber?', 'כמובן. משהו לשתות?');
const D_OKAY = npc('Is everything okay?', 'Tout va bien ?', '¿Va todo bien?', 'הכל בסדר?');
const D_BYE = npc('So glad you enjoyed it. Here you are — have a lovely evening!', 'Ravi que ça vous ait plu. Voici — passez une bonne soirée !', 'Me alegro de que les gustara. Aquí tienen — ¡que pasen buena noche!', 'שמח שנהניתם. בבקשה — ערב נעים!');

/** The silent scene cues — shown, never spoken; no sentence, no concept. */
export const CHECKOUT_CUE: Copy = ['בקופה…', 'At the checkout…'];
export const LATER_CUE: Copy = ['מאוחר יותר…', 'Later…'];

/** The traveller's lines — each one a CONCEPT of the checkpoint, and the sentence it is scored as. */
export const SAY = {
  'coffee.order': you(known('phrase.coffee.iced-coffee')),
  'coffee.later': you(itemOf(TIME_PLANS, 'phrase.time.maybe-later')),
  'coffee.card': you(known('phrase.money.by-card')),
  'plans.free': you(itemOf(TIME_PLANS, 'phrase.time.free-tomorrow')),
  'plans.surf': you(itemOf(HOBBIES, 'phrase.hobby.i-love-surfing')),
  'plans.meet': you(itemOf(TIME_PLANS, 'phrase.time.lets-meet')),
  'plans.home': you(itemOf(HOME_FAMILY, 'phrase.home.going-home'), { say: ["I'm tired. I'm going home.", 'Je suis fatigué. Je rentre chez moi.', 'Estoy cansado. Me voy a casa.', 'אני עייף. אני הולך הביתה.'] }),
  'shop.where': you(known('phrase.super.where-is')),
  'shop.thanks': you(tool('thank-you')),
  'shop.just': you(known('phrase.super.just-this')),
  'shop.bag': you(known('phrase.super.need-bag')),
  'dinner.table': you(known('phrase.rest.table-two'), { say: ['No — a table for two, please.', 'Non — une table pour deux, s’il vous plaît.', 'No — una mesa para dos, por favor.', 'לא — שולחן לשניים, בבקשה.'] }),
  'dinner.order': you(known('phrase.rest.ill-have-chicken'), { say: ["I'll have the chicken, without onions, please.", 'Je vais prendre le poulet, sans oignons, s’il vous plaît.', 'Voy a tomar el pollo, sin cebolla, por favor.', 'אני אקח את העוף, בלי בצל, בבקשה.'] }),
  'dinner.water': you(known('phrase.rest.water')),
  'dinner.bill': you(known('phrase.rest.the-bill'), { say: ['Yes, that was delicious! The bill, please.', 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', '¡Sí, estaba delicioso! La cuenta, por favor.', 'כן, היה טעים מאוד! החשבון, בבקשה.'] }),
} as const satisfies Record<string, YouLine>;
export type SayConcept = keyof typeof SAY;

/**
 * Each production turn's wrong options: canonical lines of THIS day that clearly belong to another
 * moment — never a second right answer, never a sentence the course did not teach ("Do you have
 * bread?" left: it was never taught; "Where is the milk?" takes its place at the bag question).
 */
export const WRONG: Record<SayConcept, readonly [SayConcept, SayConcept]> = {
  'coffee.order': ['dinner.table', 'plans.meet'],
  'coffee.later': ['coffee.card', 'plans.surf'],
  'coffee.card': ['coffee.later', 'shop.bag'],
  'plans.free': ['plans.home', 'coffee.order'],
  'plans.surf': ['plans.meet', 'dinner.bill'],
  'plans.meet': ['plans.surf', 'shop.just'],
  'plans.home': ['plans.surf', 'shop.where'],
  'shop.where': ['shop.bag', 'dinner.table'],
  'shop.thanks': ['shop.just', 'coffee.order'],
  'shop.just': ['shop.where', 'plans.free'],
  'shop.bag': ['shop.where', 'dinner.water'],
  'dinner.table': ['dinner.bill', 'coffee.card'],
  'dinner.order': ['dinner.bill', 'plans.free'],
  'dinner.water': ['dinner.table', 'plans.home'],
  'dinner.bill': ['dinner.order', 'coffee.later'],
};

/** The four scenes, exactly as locked — the mission's conversation for the transcript and Listen. The
 *  day itself is played by the checkpoint (`everydayDayPlan`), where every turn is a real decision. */
const line = (c: SayConcept): YouLine => SAY[c];
export const EVERYDAY_SCENES: SceneSpec[] = [
  { id: 'cold-morning', cold: true, receipt: ['☕ בוקר', '☕ Morning'], lines: [M_HELLO, line('coffee.order'), M_EAT, line('coffee.later'), M_PAY, line('coffee.card'), M_BYE] },
  { id: 'cold-plans', cold: true, receipt: ['👋 תוכניות', '👋 Plans'], lines: [P_FREE, line('plans.free'), P_SURF, line('plans.surf'), P_EARLY, line('plans.meet'), P_TONIGHT, line('plans.home'), P_BYE] },
  {
    id: 'cold-shop', cold: true, receipt: ['🛒 סופר', '🛒 Supermarket'],
    lines: [S_HELP, line('shop.where'), S_AISLE, line('shop.thanks'), { ...S_EVERYTHING, cue: CHECKOUT_CUE }, line('shop.just'), S_BAG, line('shop.bag'), S_CARD],
  },
  {
    id: 'cold-dinner', cold: true, receipt: ['🍽️ ארוחת ערב', '🍽️ Dinner'],
    lines: [D_RESERVATION, line('dinner.table'), D_READY, line('dinner.order'), D_DRINK, line('dinner.water'), { ...D_OKAY, cue: LATER_CUE }, line('dinner.bill'), D_BYE],
  },
];

/* ── the checkpoint ───────────────────────────────────────────────────────────────────────────── */

const T = (c: Copy): LocalizedText => ({ he: c[0], en: c[1] });
const IX: Record<MissionLang, 0 | 1 | 2> = { en: 0, fr: 1, es: 2 };

/** The six core capabilities — the quick scan probes exactly these. */
export const CORE: readonly { id: string; concept: SayConcept; hint: Copy }[] = [
  { id: 'coffee-order', concept: 'coffee.order', hint: ['☕ אתה רוצה קפה קר.', '☕ You want an iced coffee.'] },
  { id: 'preference', concept: 'plans.surf', hint: ['🏄 אתה מת על גלישה.', '🏄 You love surfing.'] },
  { id: 'plan-time', concept: 'plans.meet', hint: ['🕖 הצע להיפגש כאן בשבע.', '🕖 Suggest meeting here at seven.'] },
  { id: 'find-item', concept: 'shop.where', hint: ['🥛 אתה מחפש חלב.', '🥛 You are looking for the milk.'] },
  { id: 'bag', concept: 'shop.bag', hint: ['🛍️ אתה רוצה שקית.', '🛍️ You want a bag.'] },
  { id: 'restaurant-order', concept: 'dinner.order', hint: ['🍗 עוף — בלי בצל.', '🍗 Chicken — no onions.'] },
];
/** Survival value first: restaurant ordering → the supermarket → paying → plans → preferences. */
export const PRIORITY = [
  'dinner.order', 'shop.where', 'shop.bag', 'coffee.order', 'coffee.card', 'shop.card', 'dinner.bill', 'dinner.table', 'dinner.water',
  'shop.just', 'shop.aisle', 'shop.side', 'plans.meet', 'plans.free', 'plans.home', 'coffee.later', 'shop.thanks', 'plans.surf',
] as const;

/** The supermarket's facts — on screen only after the person has said them. */
export const EVERYDAY_ANSWER = { aisle: 'aisle-3', side: 'left', card: 'card' } as const;

/** The day as checkpoint turns, in one language. */
export function everydayDayPlan(lang: MissionLang): CheckpointPlan {
  const spoken = (l: NpcLine) => ({ ...spokenLine(l.t, lang), ...(l.fast ? { pace: 'fast' as const } : {}) });
  const said = (c: SayConcept): CheckpointLine => {
    const y = SAY[c];
    const t: L4 = 'say' in y && y.say ? y.say : y.item.t;
    return { conceptId: c, itemId: `${lang}.${y.item.id}`, text: t[IX[lang]], meaning: { he: t[3], en: t[0] } };
  };
  const hint = (c: SayConcept) => CORE.find((k) => k.concept === c)?.hint;
  const say = (id: string, scene: string, cue: NpcLine, c: SayConcept, extra: { heard?: true; sceneCue?: Copy } = {}): CheckpointTurn => ({
    kind: 'say', id, scene, cue: spoken(cue), conceptId: c, answer: said(c), wrong: WRONG[c].map(said),
    ...(extra.heard ? { heard: true } : {}), ...(extra.sceneCue ? { sceneCue: T(extra.sceneCue) } : {}), ...(hint(c) ? { situation: T(hint(c)!) } : {}),
  });
  const capture = (id: string, scene: string, cue: NpcLine, groups: CaptureGroup[]): CheckpointTurn => ({ kind: 'capture', id, scene, cue: spoken(cue), groups, meaning: { he: cue.t[3], en: cue.t[0] } });
  // Aisle and side are figures and arrows (Mission 17's Aisle Finder), in their natural order.
  const aisle: CaptureGroup = { conceptId: 'shop.aisle', label: T(['🛒 המעבר', '🛒 Aisle']), ui: 'figures', choices: [{ id: 'aisle-1', label: '1' }, { id: 'aisle-2', label: '2' }, { id: 'aisle-3', label: '3' }], correct: EVERYDAY_ANSWER.aisle };
  const side: CaptureGroup = { conceptId: 'shop.side', label: T(['↔️ הצד', '↔️ Side']), ui: 'figures', choices: [{ id: 'left', label: '⬅️' }, { id: 'right', label: '➡️' }], correct: EVERYDAY_ANSWER.side };
  // What the cashier wants — Mission 17's own three checkout signals.
  const card: CaptureGroup = {
    conceptId: 'shop.card', label: T(['💳 הקופאית', '💳 The cashier']), ui: 'figures', correct: EVERYDAY_ANSWER.card,
    choices: [
      { id: 'everything', emoji: '🧾', caption: T(['שואלת אם זה הכל', 'Asks if that’s everything']) },
      { id: 'bag', emoji: '🛍️', caption: T(['שואלת אם צריך שקית', 'Asks if you need a bag']) },
      { id: 'card', emoji: '💳', caption: T(['כרטיס במכשיר — שולם', 'Card in the machine — paid']) },
    ],
  };
  const outcome: Record<string, Copy> = { independent: ['לבד', 'Independent'], 'needed-help': ['נעזרת', 'Needed help'], recovered: ['התאוששת', 'Recovered'], 'needs-review': ['צריך חזרה', 'Needs review'] };

  return {
    id: 'everyday-day',
    scenes: [
      { id: 'morning', icon: '☕', label: T(['בוקר', 'Morning']), cast: 'coffee-shop', closing: spoken(M_BYE), stamp: T(['☕ בוקר ✅', '☕ MORNING ✅']) },
      { id: 'plans', icon: '👋', label: T(['תוכניות', 'Plans']), cast: 'time-plans', closing: spoken(P_BYE), stamp: T(['👋 תוכניות ✅', '👋 PLANS ✅']) },
      { id: 'shop', icon: '🛒', label: T(['סופר', 'Supermarket']), cast: 'supermarket', stamp: T(['🛒 סופר ✅', '🛒 SUPERMARKET ✅']) },
      { id: 'dinner', icon: '🍽️', label: T(['ארוחת ערב', 'Dinner']), cast: 'restaurant-meal', closing: spoken(D_BYE), stamp: T(['🍽️ ארוחת ערב ✅', '🍽️ DINNER ✅']) },
    ],
    turns: [
      say('morning.order', 'morning', M_HELLO, 'coffee.order'),
      say('morning.eat', 'morning', M_EAT, 'coffee.later'),
      say('morning.pay', 'morning', M_PAY, 'coffee.card'),
      say('plans.free', 'plans', P_FREE, 'plans.free'),
      say('plans.surf', 'plans', P_SURF, 'plans.surf'),
      say('plans.early', 'plans', P_EARLY, 'plans.meet'),
      say('plans.tonight', 'plans', P_TONIGHT, 'plans.home'),
      say('shop.help', 'shop', S_HELP, 'shop.where'),
      capture('shop.aisle', 'shop', S_AISLE, [aisle, side]),
      say('shop.thanks', 'shop', S_AISLE, 'shop.thanks', { heard: true }),
      say('shop.everything', 'shop', S_EVERYTHING, 'shop.just', { sceneCue: CHECKOUT_CUE }),
      say('shop.bag', 'shop', S_BAG, 'shop.bag'),
      capture('shop.card', 'shop', S_CARD, [card]),
      say('dinner.reservation', 'dinner', D_RESERVATION, 'dinner.table'),
      say('dinner.ready', 'dinner', D_READY, 'dinner.order'),
      say('dinner.drink', 'dinner', D_DRINK, 'dinner.water'),
      say('dinner.okay', 'dinner', D_OKAY, 'dinner.bill', { sceneCue: LATER_CUE }),
    ],
    adaptive: {
      diagnostic: CORE.map((k) => k.concept),
      core: CORE.map((k) => ({ id: k.id, concept: k.concept })),
      report: [
        { id: 'order-pay', icon: '☕', label: T(['הזמנה ותשלום', 'Order & pay']), concepts: ['coffee.order', 'coffee.later', 'coffee.card'] },
        { id: 'plans-time', icon: '📅', label: T(['תוכניות ושעה', 'Plans & time']), concepts: ['plans.free', 'plans.meet', 'plans.home'] },
        { id: 'preferences', icon: '🏄', label: T(['העדפות', 'Preferences']), concepts: ['plans.surf'] },
        { id: 'shopping', icon: '🛒', label: T(['קניות', 'Shopping']), concepts: ['shop.where', 'shop.aisle', 'shop.side', 'shop.thanks', 'shop.just', 'shop.bag', 'shop.card'] },
        { id: 'restaurant', icon: '🍽️', label: T(['מסעדה', 'Restaurant']), concepts: ['dinner.table', 'dinner.order', 'dinner.water', 'dinner.bill'] },
      ],
      finalRepairMax: 2,
      priority: [...PRIORITY],
    },
    copy: {
      scan: T(['סריקה מהירה', 'Quick scan']),
      repairIntro: T(['🔧 תיקון קטן — רק מה שפספסת.', '🔧 A small fix — only what you missed.']),
      oneTakeIntro: T(['🌤️ עכשיו היום כולו, בטייק אחד: בוקר, תוכניות, סופר, ארוחת ערב.', '🌤️ Now the whole day, in one take: morning, plans, the supermarket, dinner.']),
      finalRepairIntro: T(['🔧 עוד רגע — רק מה שהכי חשוב לחזק.', '🔧 One moment — only what matters most to strengthen.']),
      completeTitle: T(['🌤️ יום רגיל — הושלם', '🌤️ EVERYDAY DAY COMPLETE']),
      completeBody: T(['עברת יום שלם: קפה, תוכניות, סופר וארוחת ערב.', 'You got through a whole day: coffee, plans, the supermarket and dinner.']),
      readiness: {
        ready: { title: T(['🟢 מוכן', '🟢 READY']), body: T(['אתה יכול להתמודד עם המצבים המרכזיים של יום רגיל בחו״ל.', 'You can handle the core situations of an everyday day abroad.']) },
        almost: { title: T(['🟡 כמעט מוכן', '🟡 ALMOST READY']), body: T(['אתה עובר את היום — אבל כמה מצבים עוד צריכים חזרה אחת.', 'You can get through the day, but a few situations still need one more review.']) },
        review: { title: T(['🔴 צריך חזרה', '🔴 REVIEW NEEDED']), body: T(['כמה מצבים יומיומיים עוד צריכים תרגול עד שירגישו אוטומטיים.', 'Some everyday situations still need practice before they feel automatic.']) },
      },
      outcome: Object.fromEntries(Object.entries(outcome).map(([k, v]) => [k, T(v)])) as NonNullable<CheckpointPlan['copy']['outcome']>,
    },
  };
}

/** The journey after the briefing: the checkpoint, then the summary. No video step — ever. */
const everydaySteps = (lang: MissionLang): BootcampStep[] => [{ kind: 'checkpoint', plan: everydayDayPlan(lang) }, { kind: 'summary' }];

export const EVERYDAY_DAY: MissionSpec = {
  day: 17,
  title: ['נקודת ביקורת: יום רגיל', 'CHECKPOINT: Everyday Day'],
  icon: '☀️',
  intro: [
    ['נקודת ציון. בלי שיעור — רק לראות שאתה באמת יכול.', 'A milestone. No lesson — just seeing that you really can.'],
    ['קודם סריקה קצרה. אחר כך יום רגיל אחד, בטייק אחד.', 'First a short scan. Then one ordinary day, in one take.'],
    ['☕ בוקר ← 👋 תוכניות ← 🛒 סופר ← 🍽️ ארוחת ערב', '☕ Morning → 👋 Plans → 🛒 Supermarket → 🍽️ Dinner'],
  ],
  cta: ['מתחילים', 'Start'],
  scenes: EVERYDAY_SCENES,
  hear: [],
  steps: everydaySteps,
};
