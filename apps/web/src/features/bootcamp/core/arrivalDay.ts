import type { LocalizedText } from '@ready/content-schema';
import { fromItems, npc, spokenLine, tool, you, type Copy, type L4, type MissionLang, type MissionSpec, type NpcLine, type SceneSpec, type SpecItem, type YouLine } from '../author.js';
import type { CaptureGroup, CheckpointLine, CheckpointPlan, CheckpointTurn } from '../checkpoint.js';
import { M07_PROPS, M07_SLOTS } from '../practiceArrival.js';
import type { BootcampStep } from '../types.js';
import { DAY6_ITEMS } from '../day6.js';
import { DAY7_ITEMS } from '../day7.js';
import { DAY10_ITEMS } from '../day10.js';
import { DAY6_FR_ITEMS } from '../fr/day6.js';
import { DAY7_FR_ITEMS } from '../fr/day7.js';
import { DAY10_FR_ITEMS } from '../fr/day10.js';
import { DAY6_ES_ITEMS } from '../es/day6.js';
import { DAY7_ES_ITEMS } from '../es/day7.js';
import { DAY10_ES_ITEMS } from '../es/day10.js';

/**
 * Mission 10 — CHECKPOINT: Arrival Day. "Can the learner actually survive their arrival day abroad
 * using what they already learned?" One continuous day — 🛂 border → 🚕 taxi → 🏨 hotel — run as an
 * ADAPTIVE checkpoint (`checkpoint.ts`): retrieve first, repair only what fails, retrieve again in
 * real context. Nothing is taught before the day starts: no Step 0, no cards, no builders.
 *
 * The dialogue is LOCKED (wording, order, roles, facts). The learner says ONLY the traveller's lines —
 * the sentences Missions 06–08 taught, same id and same wording; every other line is the other
 * person's, and is understood, never said. Where the next line would not prove that the learner
 * understood (the fare, the room), a compact capture asks for the meaning — and only after the line
 * has been heard: €15, traffic, 204, floor 2 and 7–10 are never on screen before that.
 */

const EN = [...DAY6_ITEMS, ...DAY7_ITEMS, ...DAY10_ITEMS];
const FR = [...DAY6_FR_ITEMS, ...DAY7_FR_ITEMS, ...DAY10_FR_ITEMS];
const ES = [...DAY6_ES_ITEMS, ...DAY7_ES_ITEMS, ...DAY10_ES_ITEMS];
/** A sentence taught by Missions 06–08 (same id, same wording). */
const known = (id: string): SpecItem => fromItems(id, EN, FR, ES);

/* The locked conversation (EN · FR · ES · HE). */
const B_PASSPORT = npc('Passport, please.', 'Passeport, s’il vous plaît.', 'Pasaporte, por favor.', 'דרכון, בבקשה.', 'fast');
const B_PURPOSE = npc("What's the purpose of your visit?", 'Quel est le motif de votre visite ?', '¿Cuál es el motivo de su viaje?', 'מה מטרת הביקור?', 'fast');
const B_HOW_LONG = npc('How long are you staying?', 'Vous restez combien de temps ?', '¿Cuánto tiempo se queda?', 'לכמה זמן אתה נשאר?', 'fast');
const B_WHERE = npc('Where are you staying?', 'Où logez-vous ?', '¿Dónde se aloja?', 'איפה אתה מתאכסן?');
const B_DECLARE = npc('Anything to declare?', 'Quelque chose à déclarer ?', '¿Algo que declarar?', 'יש לך מה להצהיר?');
const B_WELCOME = npc('Welcome, and enjoy your stay!', 'Bienvenue, et bon séjour !', 'Bienvenido, ¡y que disfrute su estancia!', 'ברוך הבא, ותיהנה מהשהות!');
const T_HELLO = npc('Hello! Where to?', 'Bonjour ! Où allez-vous ?', '¡Hola! ¿A dónde va?', 'שלום! לאן?', 'fast');
const T_FARE = npc("It's about fifteen euros. There's a lot of traffic right now.", 'C’est environ quinze euros. Il y a beaucoup de circulation en ce moment.', 'Son unos quince euros. Hay mucho tráfico ahora mismo.', 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.', 'fast');
const T_ALMOST = npc('…We are almost there. Is here okay?', '…On est presque arrivés. Ici, ça va ?', '…Ya casi llegamos. ¿Aquí está bien?', '…כמעט הגענו. כאן זה בסדר?');
const T_BYE = npc('Thank you very much! Enjoy your trip!', 'Merci beaucoup ! Bon voyage !', '¡Muchas gracias! ¡Buen viaje!', 'תודה רבה! תיהנה מהטיול!');
const H_EVENING = npc('Good evening! How can I help you?', 'Bonsoir ! Comment puis-je vous aider ?', '¡Buenas noches! ¿En qué puedo ayudarle?', 'ערב טוב! איך אפשר לעזור?', 'fast');
const H_PASSPORT = npc('Welcome, Mr. Cohen. Your passport, please.', 'Bienvenue, monsieur Cohen. Votre passeport, s’il vous plaît.', 'Bienvenido, señor Cohen. Su pasaporte, por favor.', 'ברוך הבא, מר כהן. הדרכון שלך, בבקשה.');
const H_ROOM = npc("Thank you. You're in room two-oh-four, on the second floor. Here is your key.", 'Merci. Vous êtes dans la chambre deux cent quatre, au deuxième étage. Voici votre clé.', 'Gracias. Está en la habitación doscientos cuatro, en el segundo piso. Aquí tiene su llave.', 'תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.', 'fast');
const H_HOURS = npc('Yes, from seven to ten. Enjoy your stay.', 'Oui, de sept à dix heures. Bon séjour.', 'Sí, de siete a diez. Que disfrute su estancia.', 'כן, משבע עד עשר. תיהנה מהשהות.');

/** The traveller's lines — each one a CONCEPT of the checkpoint, and the sentence it is scored as. */
const SAY = {
  'border.passport-response': you(known('phrase.hotel.here-you-go')),
  'border.holiday': you(known('phrase.border.on-holiday')),
  'border.duration': you(known('phrase.border.two-weeks')),
  'border.stay': you(known('phrase.border.staying-hotel')),
  'border.declaration': you(known('phrase.border.nothing-declare')),
  'taxi.destination': you(known('phrase.taxi.to-address')),
  'taxi.acknowledge': you(tool('thank-you'), { say: ['Okay, thank you.', 'D’accord, merci.', 'De acuerdo, gracias.', 'בסדר, תודה.'] }),
  'taxi.stop-change': you(known('phrase.taxi.stop-here'), { say: ['Stop here, please. Keep the change.', 'Arrêtez-vous ici, s’il vous plaît. Gardez la monnaie.', 'Pare aquí, por favor. Quédese con el cambio.', 'עצור כאן, בבקשה. תשאיר את העודף.'] }),
  'hotel.reservation': you(known('phrase.hotel.reservation'), { say: ['I have a reservation, under the name Cohen.', 'J’ai une réservation, au nom de Cohen.', 'Tengo una reserva, a nombre de Cohen.', 'יש לי הזמנה, על השם כהן.'] }),
  'hotel.passport-response': you(known('phrase.hotel.here-you-go')),
  'hotel.breakfast-question': you(known('phrase.hotel.breakfast')),
} as const satisfies Record<string, YouLine>;
type SayConcept = keyof typeof SAY;

/** The three scenes, exactly as locked — also the mission's conversation (transcript, Listen). */
export const ARRIVAL_SCENES: SceneSpec[] = [
  {
    id: 'cold-border', cold: true, receipt: ['עברת את ביקורת הגבולות.', 'You cleared the border.'],
    lines: [B_PASSPORT, SAY['border.passport-response'], B_PURPOSE, SAY['border.holiday'], B_HOW_LONG, SAY['border.duration'], B_WHERE, SAY['border.stay'], B_DECLARE, SAY['border.declaration'], B_WELCOME],
  },
  {
    id: 'cold-taxi', cold: true, receipt: ['הנסיעה הושלמה.', 'The ride is complete.'],
    lines: [T_HELLO, SAY['taxi.destination'], T_FARE, SAY['taxi.acknowledge'], T_ALMOST, SAY['taxi.stop-change'], T_BYE],
  },
  {
    id: 'cold-hotel', cold: true, receipt: ['הצ׳ק־אין הושלם.', 'Check-in is complete.'],
    lines: [H_EVENING, SAY['hotel.reservation'], H_PASSPORT, SAY['hotel.passport-response'], H_ROOM, SAY['hotel.breakfast-question'], H_HOURS],
  },
];

/* ── the checkpoint ───────────────────────────────────────────────────────────────────────────── */

/** The arrival day's facts — the simulation's truth; on screen only after the person has said them. */
export const ARRIVAL_FACTS = { fare: 15, road: 'traffic', room: 204, floor: 2, breakfast: '7–10' } as const;
/** Which capture choice is the day's own (from the facts, never chosen per screen). */
export const ARRIVAL_ANSWER = { fare: 'e15', road: 'traffic', room: 'r204', floor: 'floor-2', hours: 'h7-10' } as const;

const T = (c: Copy): LocalizedText => ({ he: c[0], en: c[1] });
const IX: Record<MissionLang, 0 | 1 | 2> = { en: 0, fr: 1, es: 2 };

/** Each production turn's wrong options: real traveller lines of the same day that clearly belong to
 *  another moment (never a second right answer). */
const WRONG: Record<SayConcept, readonly [SayConcept, SayConcept]> = {
  'border.passport-response': ['border.duration', 'taxi.destination'],
  'border.holiday': ['border.declaration', 'hotel.reservation'],
  'border.duration': ['border.stay', 'border.holiday'],
  'border.stay': ['border.duration', 'border.declaration'],
  'border.declaration': ['border.holiday', 'hotel.breakfast-question'],
  'taxi.destination': ['taxi.stop-change', 'border.holiday'],
  'taxi.acknowledge': ['taxi.stop-change', 'border.declaration'],
  'taxi.stop-change': ['taxi.destination', 'border.duration'],
  'hotel.reservation': ['border.declaration', 'taxi.stop-change'],
  'hotel.passport-response': ['border.holiday', 'hotel.breakfast-question'],
  'hotel.breakfast-question': ['hotel.reservation', 'taxi.destination'],
};

const FIGURES = (pairs: readonly (readonly [id: string, label: string])[]) => pairs.map(([id, label]) => ({ id, label }));

/** The day as checkpoint turns, in one language. */
export function arrivalDayPlan(lang: MissionLang): CheckpointPlan {
  const line = (l: NpcLine) => ({ ...spokenLine(l.t, lang), ...(l.fast ? { pace: 'fast' as const } : {}) });
  const said = (c: SayConcept): CheckpointLine => {
    const y = SAY[c];
    const t: L4 = 'say' in y && y.say ? y.say : y.item.t;
    return { conceptId: c, itemId: `${lang}.${y.item.id}`, text: t[IX[lang]], meaning: { he: t[3], en: t[0] } };
  };
  const say = (id: string, scene: string, cue: NpcLine, c: SayConcept, extra: { heard?: true; situation?: Copy } = {}): CheckpointTurn => ({
    kind: 'say', id, scene, cue: line(cue), conceptId: c, answer: said(c), wrong: WRONG[c].map(said),
    ...(extra.heard ? { heard: true } : {}), ...(extra.situation ? { situation: T(extra.situation) } : {}),
  });
  const capture = (id: string, scene: string, cue: NpcLine, groups: CaptureGroup[]): CheckpointTurn => ({ kind: 'capture', id, scene, cue: line(cue), groups, meaning: { he: cue.t[3], en: cue.t[0] } });

  const fare: CaptureGroup = { conceptId: 'taxi.fare', label: T(['💶 המחיר', '💶 Fare']), ui: 'figures', choices: FIGURES([['e5', '€5'], ['e15', '€15'], ['e50', '€50']]), correct: ARRIVAL_ANSWER.fare };
  // The same pictures Mission 07 uses for the road (same meaning = same visual), with equal treatment.
  const road: CaptureGroup = {
    conceptId: 'taxi.traffic', label: T(['🛣️ הכביש', '🛣️ The road']), ui: 'road', correct: ARRIVAL_ANSWER.road,
    choices: [{ id: 'clear', emoji: M07_PROPS['clear-road'].emoji, caption: T(['כביש פנוי', 'Clear road']) }, { id: 'traffic', emoji: M07_SLOTS.traffic.emoji, caption: T(['פקקים', 'Traffic']) }],
  };
  const room: CaptureGroup = { conceptId: 'hotel.room', label: T(['🚪 החדר', '🚪 Room']), ui: 'figures', choices: FIGURES([['r204', '204'], ['r214', '214'], ['r240', '240']]), correct: ARRIVAL_ANSWER.room };
  // The elevator panel of Mission 08: floors as they are in the building, 3 on top.
  const floor: CaptureGroup = { conceptId: 'hotel.floor', label: T(['🛗 הקומה', '🛗 Floor']), ui: 'floor', choices: FIGURES([['floor-3', '3'], ['floor-2', '2'], ['floor-1', '1']]), correct: ARRIVAL_ANSWER.floor };
  const hours: CaptureGroup = { conceptId: 'hotel.breakfast-hours', label: T(['🍳 ארוחת הבוקר', '🍳 Breakfast']), ui: 'figures', choices: FIGURES([['h7-9', '7–9'], ['h7-10', '7–10'], ['h8-10', '8–10']]), correct: ARRIVAL_ANSWER.hours };

  return {
    id: 'arrival-day',
    scenes: [
      { id: 'border', icon: '🛂', label: T(['ביקורת גבולות', 'Border']), cast: 'airport-border', closing: line(B_WELCOME), stamp: T(['🛂 עברת את ביקורת הגבולות', '🛂 BORDER CLEARED']) },
      { id: 'taxi', icon: '🚕', label: T(['מונית', 'Taxi']), cast: 'taxi', closing: line(T_BYE), stamp: T(['🚕 הנסיעה הושלמה', '🚕 RIDE COMPLETE']) },
      { id: 'hotel', icon: '🏨', label: T(['מלון', 'Hotel']), cast: 'hotel-check-in', stamp: T(['🏨 הצ׳ק־אין הושלם', '🏨 CHECK-IN COMPLETE']) },
    ],
    turns: [
      say('border.passport', 'border', B_PASSPORT, 'border.passport-response'),
      say('border.purpose', 'border', B_PURPOSE, 'border.holiday'),
      say('border.how-long', 'border', B_HOW_LONG, 'border.duration'),
      say('border.where', 'border', B_WHERE, 'border.stay'),
      say('border.declare', 'border', B_DECLARE, 'border.declaration'),
      say('taxi.where-to', 'taxi', T_HELLO, 'taxi.destination'),
      capture('taxi.fare-road', 'taxi', T_FARE, [fare, road]),
      say('taxi.okay', 'taxi', T_FARE, 'taxi.acknowledge', { heard: true }),
      say('taxi.stop', 'taxi', T_ALMOST, 'taxi.stop-change'),
      say('hotel.desk', 'hotel', H_EVENING, 'hotel.reservation'),
      say('hotel.passport', 'hotel', H_PASSPORT, 'hotel.passport-response'),
      capture('hotel.room-floor', 'hotel', H_ROOM, [room, floor]),
      say('hotel.breakfast', 'hotel', H_ROOM, 'hotel.breakfast-question', { heard: true, situation: ['🔑 קיבלת את המפתח. יש לך עוד שאלה אחת.', '🔑 You have your key. You have one more question.'] }),
      capture('hotel.hours', 'hotel', H_HOURS, [hours]),
    ],
    copy: {
      repairIntro: T(['🔧 תיקון מהיר — רק מה שפספסת.', '🔧 Quick fix — only what you missed.']),
      oneTakeIntro: T(['עכשיו מהמטוס עד לחדר — בלי עזרה.', 'Now from the plane to your room — no help.']),
      finalRepairIntro: T(['🔧 עוד רגע — רק מה שהתפספס עכשיו.', '🔧 One moment — only what slipped just now.']),
      completeTitle: T(['🌍 יום ההגעה הושלם', '🌍 ARRIVAL DAY COMPLETE']),
      completeBody: T(['עברת את היום הראשון שלך בחו״ל.', 'You handled your first day abroad.']),
    },
  };
}

/** The mission's journey after the briefing: the checkpoint, then the victory screen. (The video, if
 *  one is ever recorded, is found by the standard resolver and offered by the player as for every
 *  mission — its state survives watching, because it is saved outside the step.) */
const arrivalSteps = (lang: MissionLang): BootcampStep[] => [{ kind: 'checkpoint', plan: arrivalDayPlan(lang) }, { kind: 'summary' }];

export const ARRIVAL_DAY: MissionSpec = {
  day: 9,
  title: ['נקודת ביקורת: יום הגעה', 'CHECKPOINT: Arrival Day'],
  icon: '🛬',
  intro: [
    ['נחתת במדינה חדשה.', 'You have landed in a new country.'],
    ['תעבור ביקורת גבולות, תיקח מונית ותבצע צ׳ק־אין במלון.', 'You will go through border control, take a taxi and check in at the hotel.'],
    ['🛂 גבול ← 🚕 מונית ← 🏨 מלון', '🛂 Border → 🚕 Taxi → 🏨 Hotel'],
  ],
  cta: ['מתחילים את יום ההגעה', 'Start the arrival day'],
  scenes: ARRIVAL_SCENES,
  hear: [],
  steps: arrivalSteps,
};
