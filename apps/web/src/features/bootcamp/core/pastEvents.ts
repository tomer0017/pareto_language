import { item, npc, you, type MissionSpec } from '../author.js';
import { N_EAT, N_END, N_GOOD, N_LIKE, N_SEE, N_STAY, N_WHERE, Y_BACK, Y_STAYED, m20Steps } from '../practicePast.js';

/**
 * Past & Recent Events — talking about yesterday (and last month) as a real conversation, never a grammar
 * lesson: understand what a friend asks (where you were, what you saw, whether you ate there, if you liked it,
 * where you stayed, if it was good), answer it, and turn the question back. The conversation is LOCKED
 * (mission20.test.ts pins it word for word); the journey around it is `m20Steps` (practicePast.ts).
 *
 * Four sentences here are reused, by id and wording, by later missions (the City checkpoint and the last
 * missions): "I went…", "Yes, it was great!", "I stayed in a hostel." and "It was good." — they are kept
 * byte-identical (all four languages) so no later mission changes. The brief's Hebrew support for the stay
 * ("התארחתי בהוסטל") is what THIS mission shows (the conversation's `say`, the cards, the story).
 * Informal register (tu / tú). AI linguistic review completed; native review still recommended.
 */
const I_WENT = item('phrase.past.i-went', 'I went to the old town.', 'Je suis allé dans la vieille ville.', 'Fui al casco antiguo.', 'הלכתי לעיר העתיקה.',
  ['I went to ___ — התשובה ל"איפה היית?"', 'I went to ___ — the answer to "where were you?"']);
const I_SAW = item('phrase.past.i-saw', 'I saw the market.', 'J’ai vu le marché.', 'Vi el mercado.', 'ראיתי את השוק.');
const I_ATE = item('phrase.past.i-ate', 'Yes, I ate fish.', 'Oui, j’ai mangé du poisson.', 'Sí, comí pescado.', 'כן, אכלתי דג.');
const WAS_GREAT = item('phrase.past.it-was-great', 'Yes, it was great!', 'Oui, c’était super !', '¡Sí, estuvo genial!', 'כן, היה מעולה!');
const WAS_GOOD = item('phrase.past.it-was-good', 'It was good.', 'C’était bien.', 'Estuvo bien.', 'היה טוב.');
const I_STAYED = item('phrase.past.i-stayed', 'I stayed in a hostel.', 'J’ai logé dans une auberge.', 'Me quedé en un hostal.', 'ישנתי בהוסטל.',
  ['I stayed in ___ — hostel, hotel, apartment.', 'I stayed in ___ — a hostel, a hotel, an apartment.']);
const WHAT_DID_YOU_DO = item('phrase.past.what-did-you-do', 'What did you do yesterday?', 'Tu as fait quoi hier ?', '¿Qué hiciste ayer?', 'מה עשית אתמול?');

export const PAST_EVENTS: MissionSpec = {
  day: 34,
  title: ['עבר: מה עשיתי', 'Past & Recent Events'],
  icon: '⏪',
  numbered: true,
  // The brief's own opening — nothing the friend will ask, and none of the answers.
  intro: [
    ['אתמול טיילת בעיר.', 'Yesterday you spent the day out in the city.'],
    ['ספר לחבר מה עשית.', 'Tell your friend what you did.'],
  ],
  cta: ['לספר על אתמול', 'Tell about yesterday'],
  scenes: [{
    id: 'what-did-you-do',
    receipt: ['סיפרת איפה היית, מה ראית, מה אכלת ואיפה התארחת — ושאלת בחזרה.', 'You said where you were, what you saw, what you ate and where you stayed — and asked back.'],
    // Each turn is a real decision: a line from another moment of the chat does not fit here — a miss is
    // asked again, slowly, and the same choice comes back.
    lines: [
      npc(...N_WHERE),
      you(I_WENT, { wrong: [I_SAW] }),
      npc(...N_SEE),
      you(I_SAW, { wrong: [I_ATE] }),
      npc(...N_EAT),
      you(I_ATE, { wrong: [I_SAW] }),
      npc(...N_LIKE),
      you(WAS_GREAT, { wrong: [I_STAYED] }),
      npc(...N_STAY, 'fast'),
      you(I_STAYED, { say: Y_STAYED, wrong: [I_WENT] }),
      npc(...N_GOOD),
      you(WHAT_DID_YOU_DO, { say: Y_BACK, wrong: [I_ATE] }),
      npc(...N_END),
    ],
  }],
  // "It was good." — the start of the ask-back line; a sentence of its own that later missions use.
  extra: [WAS_GOOD],
  hear: [
    item('reply.past.where-were-you', 'Where were you yesterday?', 'Tu étais où hier ?', '¿Dónde estuviste ayer?', 'איפה היית אתמול?'),
    item('reply.past.what-did-you-see', 'What did you see?', 'Tu as vu quoi ?', '¿Qué viste?', 'מה ראית?'),
    item('reply.past.did-you-eat', 'Did you eat there?', 'Tu as mangé là-bas ?', '¿Comiste allí?', 'אכלת שם?'),
    item('reply.past.did-you-like', 'Did you like it?', 'Tu as aimé ?', '¿Te gustó?', 'אהבת?'),
    item('reply.past.where-did-you-stay', 'Where did you stay?', 'Tu as logé où ?', '¿Dónde te quedaste?', 'איפה התארחת?'),
    item('reply.past.was-it-good', 'Was it good?', 'C’était bien ?', '¿Estuvo bien?', 'היה טוב?'),
  ],
  steps: m20Steps,
};
