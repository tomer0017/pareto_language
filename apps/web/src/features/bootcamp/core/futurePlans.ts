import { item, npc, you, type MissionSpec } from '../author.js';
import { N_AFTER, N_ELSE, N_END, N_HOW_LONG, N_MISS, N_TOMORROW, N_WHAT_DO, N_WHERE, Y_BACK, m21Steps } from '../practiceFuture.js';

/**
 * Future Travel & Plans — a casual conversation about the NEXT TRIP, never a future-tense lesson: understand
 * what a friend asks (where next, how long, what you want to do, anything else, after that, tomorrow morning),
 * say the right part of your own plan, and ask back. The conversation is LOCKED (mission21.test.ts pins it word
 * for word); the journey around it is `m21Steps` (practiceFuture.ts).
 *
 * Five sentences here are reused, by id and wording, by later missions (the City checkpoint and the last
 * mission): "I'm going to Vietnam." (with its tip), "I'll be there for two weeks.", "After that I'm going to
 * Thailand.", "Tomorrow morning I'm going to the airport." and "Where are you going next?" — they are kept
 * byte-identical (all four languages) so no later mission changes.
 * Informal register (tu / tú). AI linguistic review completed; native review still recommended.
 */
const GOING_TO = item('phrase.future.going-to-vietnam', "I'm going to Vietnam.", 'Je vais au Vietnam.', 'Voy a Vietnam.', 'אני נוסע לווייטנאם.',
  ['I’m going to ___ — מדינה, עיר, או המקום הבא.', 'I’m going to ___ — a country, a city, the next place.']);
const ILL_BE_THERE = item('phrase.future.ill-be-there', "I'll be there for two weeks.", 'Je vais rester deux semaines.', 'Voy a estar allí dos semanas.', 'אני אהיה שם שבועיים.');
const WANT_TO_VISIT = item('phrase.future.want-to-visit', 'I want to visit Hanoi.', 'Je veux visiter Hanoï.', 'Quiero visitar Hanói.', 'אני רוצה לבקר בהאנוי.');
const BY_MOTORBIKE = item('phrase.future.by-motorbike', 'I want to travel by motorbike.', 'Je veux voyager à moto.', 'Quiero viajar en moto.', 'אני רוצה לטייל באופנוע.');
const AFTER_THAT = item('phrase.future.after-that', "After that I'm going to Thailand.", 'Après ça, je vais en Thaïlande.', 'Después de eso voy a Tailandia.', 'אחרי זה אני נוסע לתאילנד.');
const TOMORROW_MORNING = item('phrase.future.tomorrow-morning', "Tomorrow morning I'm going to the airport.", 'Demain matin, je vais à l’aéroport.', 'Mañana por la mañana voy al aeropuerto.', 'מחר בבוקר אני נוסע לשדה התעופה.');
const WHERE_NEXT = item('phrase.future.where-next', 'Where are you going next?', 'Tu vas où après ?', '¿A dónde vas después?', 'לאן אתה נוסע אחרי זה?');

export const FUTURE_PLANS: MissionSpec = {
  day: 35,
  title: ['לאן ממשיכים: תוכניות', 'Future Travel & Plans'],
  icon: '🧭',
  numbered: true,
  // The brief's own opening — the learner's plan comes next, on the board; nothing the friend will say.
  intro: [
    ['יש לך תוכנית להמשך הטיול.', 'You have a plan for the rest of your trip.'],
    ['ספר עליה לחבר.', 'Tell your friend about it.'],
  ],
  cta: ['לספר על התוכנית', 'Tell my plan'],
  scenes: [{
    id: 'where-next',
    receipt: ['סיפרת לאן אתה נוסע, לכמה זמן ומה אתה רוצה לעשות — ושאלת בחזרה.', 'You said where you are going, for how long and what you want to do — and asked back.'],
    // Each turn is a real decision: a line from another moment of the chat does not fit here — a miss is
    // asked again, slowly, and the same choice comes back. No alternative answer, no recovery branch.
    lines: [
      npc(...N_WHERE),
      you(GOING_TO, { wrong: [ILL_BE_THERE] }),
      npc(...N_HOW_LONG, 'fast'),
      you(ILL_BE_THERE, { wrong: [GOING_TO] }),
      npc(...N_WHAT_DO),
      you(WANT_TO_VISIT, { wrong: [ILL_BE_THERE] }),
      npc(...N_ELSE),
      you(BY_MOTORBIKE, { wrong: [WANT_TO_VISIT] }),
      npc(...N_AFTER),
      you(AFTER_THAT, { wrong: [GOING_TO] }),
      npc(...N_TOMORROW),
      you(TOMORROW_MORNING, { wrong: [AFTER_THAT] }),
      npc(...N_MISS),
      you(WHERE_NEXT, { say: Y_BACK, wrong: [WANT_TO_VISIT] }),
      npc(...N_END),
    ],
  }],
  // The friend's lines, whole, as they are played before the learner answers.
  hear: [
    item('reply.future.where-next', ...N_WHERE),
    item('reply.future.wow-how-long', ...N_HOW_LONG),
    item('reply.future.what-do-there', ...N_WHAT_DO),
    item('reply.future.anything-else', ...N_ELSE),
    item('reply.future.after-that-q', ...N_AFTER),
    item('reply.future.tomorrow-plan-q', ...N_TOMORROW),
    item('reply.future.miss-you', ...N_MISS),
  ],
  steps: m21Steps,
};
