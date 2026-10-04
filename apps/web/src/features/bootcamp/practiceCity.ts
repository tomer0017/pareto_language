import type { Copy, L3, L4, MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep } from './types.js';

/**
 * Practice depth — City & Conversation, the one hand-written mission of the phase: 19 (Public
 * Transport). Defined ONCE for English, French and Spanish. (Missions 20–23 are multilingual specs
 * — their practice lives in `core/`.)
 *
 * The mission file keeps its sentences, its locked dialogue and its intro card, and takes
 * everything from the key sentences onward from here.
 *
 * Rules kept here: the speed chain is made of the conversation's own lines; the disruption that ends
 * the mission is fast and dense but uses ONLY words the learner has met — asking to hear it again is
 * the right answer because of the pace, not because of unknown vocabulary; service register
 * (vous / usted). Spanish is es-ES: "billete", "andén", "parada".
 *
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */

/** What a station tells you: a platform, a number of stops, how often it leaves. */
const STATION_TILES = [
  { id: 'p2', emoji: '🚉', label: '2' }, { id: 'p3', emoji: '🚉', label: '3' },
  { id: 's2', emoji: '🛑', label: '2' }, { id: 's3', emoji: '🛑', label: '3' },
  { id: 'm5', emoji: '⏱️', label: '5' }, { id: 'm10', emoji: '⏱️', label: '10' },
];
const WHERE_HEADED: L4 = ['Hello! Where are you headed?', 'Bonjour ! Vous allez où ?', '¡Hola! ¿A dónde va?', 'שלום! לאן אתה נוסע?'];
const THREE_EUROS: L4 = ["That's three euros. It leaves every ten minutes.", 'Ça fait trois euros. Ça part toutes les dix minutes.', 'Son tres euros. Sale cada diez minutos.', 'זה שלושה יורו. יוצא כל עשר דקות.'];
const HOP_ON: L4 = ["The train's right here. Hop on.", 'Le train est juste là. Montez.', 'El tren está justo ahí. Suba.', 'הרכבת ממש כאן. עלה.'];

const ticketTo = (right: 'centre' | 'museum' | 'airport', emoji: string, cue: Copy) => ({
  frame: ['One ticket to ___, please.', 'Un billet pour ___, s’il vous plaît.', 'Un billete para ___, por favor.'] as L3,
  itemId: 'phrase.trans.one-ticket',
  cue: { emoji, text: cue },
  options: [
    [['the centre', 'le centre', 'el centro'], 'כרטיס אחד למרכז, בבקשה.', right === 'centre'],
    [['the museum', 'le musée', 'el museo'], 'כרטיס אחד למוזיאון, בבקשה.', right === 'museum'],
    [['the airport', 'l’aéroport', 'el aeropuerto'], 'כרטיס אחד לשדה התעופה, בבקשה.', right === 'airport'],
  ] as const,
});

export function m19Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.trans.one-ticket', ['לקנות כרטיס', 'Buy a ticket']],
      ['phrase.trans.which-platform', ['לאתר רציף', 'Find the platform']],
      ['phrase.trans.does-stop', ['לוודא יעד', 'Confirm the stop']],
      ['phrase.trans.next-one', ['לשאול על הבא', 'Ask about the next one']],
    ]),
    k.replies('phrase.trans.one-ticket', ['reply.trans.single-return', 'reply.trans.platform-two', 'reply.trans.every-ten', 'reply.trans.three-stops']),
    k.receipt(['אתה מזהה את תשובות הדלפק והרציף — הלוך/חזור, מספר רציף, תדירות.', 'You recognize the booth and platform answers — single/return, platform number, frequency.']),
    // The station board: is it a platform, a number of stops, or minutes — and which number?
    k.practice({
      kind: 'visualMatch',
      label: ['רציף, תחנות או דקות? הקש על מה ששמעת', 'Platform, stops or minutes? Tap what you hear'],
      tiles: STATION_TILES,
      rounds: [
        { audio: ['Platform two.', 'Quai numéro deux.', 'Andén número dos.', 'רציף שתיים.'], correct: 'p2', itemId: 'reply.trans.platform-two' },
        { audio: ["It's three stops.", 'C’est à trois arrêts.', 'Son tres paradas.', 'זה שלוש תחנות.'], correct: 's3', itemId: 'reply.trans.three-stops' },
        { audio: ['Every ten minutes.', 'Toutes les dix minutes.', 'Cada diez minutos.', 'כל עשר דקות.'], correct: 'm10', itemId: 'reply.trans.every-ten' },
        { audio: ['Platform three.', 'Quai numéro trois.', 'Andén número tres.', 'רציף שלוש.'], correct: 'p3' },
      ],
    }),
    // At the booth and on the platform: six moments.
    k.practice({
      kind: 'quickReply',
      label: ['בתחנה — מה אומרים?', 'At the station — what do you say?'],
      rounds: [
        { npc: WHERE_HEADED, options: [['phrase.trans.one-ticket', true], ['phrase.trans.which-platform', false], ['phrase.trans.next-one', false]] },
        { prompt: 'reply.trans.single-return', options: [['phrase.trans.single', true], ['phrase.trans.does-stop', false], ['phrase.trans.one-ticket', false]] },
        { npc: THREE_EUROS, options: [['phrase.trans.which-platform', true], ['phrase.recovery.thank-you', true], ['phrase.trans.one-ticket', false]] },
        { npc: HOP_ON, options: [['phrase.trans.does-stop', true], ['phrase.trans.next-one', true], ['phrase.trans.one-ticket', false]] },
        { situation: ['פספסת את הרכבת. אתה רוצה לדעת מתי הבאה.', 'You just missed the train. You want to know when the next one is.'],
          options: [['phrase.trans.next-one', true], ['phrase.trans.which-platform', false], ['phrase.trans.does-stop', false]] },
        // Being told you are going the wrong way: ask for the platform — or ask to hear it again.
        { prompt: 'reply.trans.wrong-way', options: [['phrase.trans.which-platform', true], ['phrase.recovery.repeat', true], ['phrase.trans.one-ticket', false]] },
      ],
    }),
    // One ticket, any destination — three places the learner already has words for.
    k.practice({
      kind: 'swap',
      label: ['לאן הכרטיס?', 'A ticket to where?'],
      rounds: [
        ticketTo('museum', '🏛️', ['אתה נוסע למוזיאון', 'You are going to the museum']),
        ticketTo('airport', '✈️', ['אתה נוסע לשדה התעופה', 'You are going to the airport']),
        ticketTo('centre', '🏙️', ['אתה נוסע למרכז', 'You are going to the centre']),
      ],
    }),
    k.dialogue('transport'),
    k.receipt(['קנית כרטיס, מצאת רציף, ווידאת שהרכבת עוצרת ביעד שלך.', 'You bought a ticket, found the platform, and confirmed the train stops at your destination.']),
    k.review([
      'phrase.trans.one-ticket', 'phrase.trans.single', 'phrase.trans.which-platform', 'phrase.trans.does-stop', 'phrase.trans.next-one',
      'reply.trans.single-return', 'reply.trans.platform-two', 'reply.trans.every-ten', 'reply.trans.three-stops', 'reply.trans.wrong-way', 'reply.trans.stop-next',
      'phrase.recovery.repeat',
    ]),
    // Ticket → platform → stop at a real station's pace — the conversation's own lines.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: WHERE_HEADED, options: [['phrase.trans.one-ticket', true], ['phrase.trans.does-stop', false], ['phrase.trans.next-one', false]] },
        { npc: ['Single or return?', 'Aller simple ou aller-retour ?', '¿Solo ida o ida y vuelta?', 'הלוך או הלוך-חזור?'],
          options: [['phrase.trans.single', true], ['phrase.trans.which-platform', false], ['phrase.trans.one-ticket', false]] },
        { npc: THREE_EUROS, options: [['phrase.trans.which-platform', true], ['phrase.trans.one-ticket', false], ['phrase.trans.single', false]] },
        { npc: HOP_ON, options: [['phrase.trans.does-stop', true], ['phrase.trans.one-ticket', false], ['phrase.trans.single', false]] },
      ],
    }),
    k.receipt(['כרטיס, רציף ותחנה — בקצב של תחנה אמיתית.', 'Ticket, platform and stop — at the pace of a real station.']),
    // A fast correction on the platform. Every word in it is known; it is simply too much at once —
    // so asking to hear it again is the smart answer.
    k.ambush('recovery',
      ["You're going the wrong way. Not this one — platform two. The next one is in ten minutes, and your stop is three stops.", 'Vous allez dans le mauvais sens. Pas celui-là — quai numéro deux. Le prochain est dans dix minutes, et votre arrêt est à trois arrêts.', 'Va en dirección contraria. Este no — andén número dos. El próximo sale en diez minutos, y su parada está a tres paradas.', 'אתה בכיוון הלא נכון. לא זה — רציף שתיים. הבא בעוד עשר דקות, והתחנה שלך בעוד שלוש תחנות.'],
      'phrase.recovery.repeat', 'phrase.trans.does-stop'),
    k.receipt(['תיקון מהיר על הרציף — וביקשת שיחזרו במקום לעלות לרכבת הלא נכונה.', 'A fast correction on the platform — and you asked them to repeat instead of boarding the wrong train.']),
    { kind: 'summary' },
  ];
}
