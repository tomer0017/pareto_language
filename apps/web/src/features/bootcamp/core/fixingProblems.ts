import { fromItems, item, npc, you, type MissionSpec } from '../author.js';
import { DAY11_ITEMS } from '../day11.js';
import { DAY11_FR_ITEMS } from '../fr/day11.js';
import { DAY11_ES_ITEMS } from '../es/day11.js';
import {
  N_BILL, N_BRING, N_CHECK, N_DESSERT, N_HELP, N_MEAL, N_NEW_KEY, N_QUIETER, N_REFUND, N_SEND, N_SO_SORRY, N_WHATS_PROBLEM, N_WHAT_ORDER, Y_NOISY, m22Steps,
} from '../practiceFix.js';

/**
 * Fixing Problems — ONE practical skill in two short locked scenes: NOTICE the problem → EXPLAIN it → ASK FOR A FIX.
 * A restaurant (the wrong meal, charged twice) and a hotel desk (the air conditioning isn't working, a noisy room, a
 * room change). The conversations are LOCKED (mission22.test.ts pins them word for word); the journey around them is
 * `m22Steps` (practiceFix.ts).
 *
 * Several sentences here are reused, by id and wording, by the later checkpoints ("This isn't what I ordered.", "I
 * ordered the pasta.", "I was charged twice.", "No problem, thank you.", "Can you fix it?") — every learner sentence
 * is kept byte-identical (all four languages) so no later mission changes.
 * Polite register (vous / usted). AI linguistic review completed; native review still recommended.
 */
const hotel = (id: string) => fromItems(id, DAY11_ITEMS, DAY11_FR_ITEMS, DAY11_ES_ITEMS);

const NOT_ORDERED = item('phrase.fix.not-ordered', "This isn't what I ordered.", 'Ce n’est pas ce que j’ai commandé.', 'Esto no es lo que pedí.', 'זה לא מה שהזמנתי.',
  ['רגוע וברור. לא צריך להתנצל.', 'Calm and clear. No need to apologize.']);
const I_ORDERED = item('phrase.fix.i-ordered', 'I ordered the pasta.', 'J’ai commandé les pâtes.', 'Pedí la pasta.', 'הזמנתי את הפסטה.');
const MISTAKE = item('phrase.fix.theres-mistake', "I think there's a mistake.", 'Je crois qu’il y a une erreur.', 'Creo que hay un error.', 'אני חושב שיש טעות.');
const CHARGED_TWICE = item('phrase.fix.charged-twice', 'I was charged twice.', 'On m’a facturé deux fois.', 'Me han cobrado dos veces.', 'חייבו אותי פעמיים.');
const NO_PROBLEM = item('phrase.fix.no-problem-thanks', 'No problem, thank you.', 'Pas de problème, merci.', 'No pasa nada, gracias.', 'אין בעיה, תודה.');
const THERES_PROBLEM = item('phrase.fix.theres-problem', "There's a problem with my room.", 'Il y a un problème avec ma chambre.', 'Hay un problema con mi habitación.', 'יש בעיה בחדר שלי.',
  ['There’s a problem with ___ — פותח כל תלונה בנימוס.', 'There’s a problem with ___ — opens any complaint politely.']);
const CAN_YOU_FIX = item('phrase.fix.can-you-fix', 'Can you fix it?', 'Vous pouvez arranger ça ?', '¿Lo puede arreglar?', 'אפשר לתקן את זה?');
const CHANGE_ROOMS = item('phrase.fix.change-rooms', 'Can I change rooms?', 'Je peux changer de chambre ?', '¿Puedo cambiar de habitación?', 'אפשר להחליף חדר?');
const AC = hotel('phrase.hotelreq.ac-not-working');
const NOISY = hotel('phrase.hotelreq.room-noisy');

export const FIXING_PROBLEMS: MissionSpec = {
  day: 24,
  title: ['לתקן בעיה', 'Fixing Problems'],
  icon: '🛠️',
  numbered: true,
  // The brief's own opening — no phrase list, no grammar, none of the staff's solutions.
  intro: [
    ['משהו השתבש.', 'Something went wrong.'],
    ['תגיד מה הבעיה ותבקש פתרון.', 'Say what the problem is and ask for a fix.'],
  ],
  cta: ['לפתור את זה', 'Sort it out'],
  scenes: [
    {
      id: 'fixing-problems',
      receipt: ['מנה שגויה וחיוב כפול — ושניהם תוקנו. בנימוס.', 'A wrong dish and a double charge — both fixed. Politely.'],
      // Each turn is a real decision: a line from another moment does not fit here — a miss is asked again,
      // slowly, and the same choice comes back. No alternative answer, no recovery branch.
      lines: [
        npc(...N_MEAL),
        you(NOT_ORDERED, { wrong: [NO_PROBLEM] }),
        npc(...N_WHAT_ORDER),
        you(I_ORDERED, { wrong: [NOT_ORDERED] }),
        // The jump in time is a scene transition, shown and never spoken: the line is two beats.
        { ...npc(...N_BRING), after: { cue: ['מאוחר יותר…', 'Later…'], t: N_BILL } },
        you(MISTAKE, { wrong: [NO_PROBLEM] }),
        npc(...N_CHECK),
        you(CHARGED_TWICE, { wrong: [I_ORDERED] }),
        npc(...N_REFUND),
        you(NO_PROBLEM, { wrong: [CHARGED_TWICE] }),
        npc(...N_DESSERT),
      ],
    },
    {
      id: 'room-problem',
      receipt: ['מזגן, רעש, והחלפת חדר — אמרת מה הבעיה וביקשת פתרון.', 'Air conditioning, noise, and a new room — you named the problem and asked for a fix.'],
      lines: [
        npc(...N_HELP),
        you(THERES_PROBLEM, { wrong: [NO_PROBLEM] }),
        npc(...N_WHATS_PROBLEM),
        you(AC, { wrong: [CHARGED_TWICE] }),
        npc(...N_SO_SORRY),
        you(CAN_YOU_FIX, { wrong: [I_ORDERED] }),
        npc(...N_SEND, 'fast'),
        you(NOISY, { say: Y_NOISY, wrong: [AC] }),
        npc(...N_QUIETER),
        you(CHANGE_ROOMS, { wrong: [CAN_YOU_FIX] }),
        npc(...N_NEW_KEY),
      ],
    },
  ],
  // The staff's lines, whole, as they are played before the learner answers.
  hear: [
    item('reply.fix.meal', ...N_MEAL),
    item('reply.fix.what-did-you-order', ...N_WHAT_ORDER),
    item('reply.fix.bill', ...N_BILL),
    item('reply.fix.check-the-bill', ...N_CHECK),
    item('reply.fix.how-can-i-help', ...N_HELP),
    item('reply.fix.whats-the-problem', ...N_WHATS_PROBLEM),
    item('reply.fix.so-sorry', ...N_SO_SORRY),
    item('reply.fix.quieter-room', ...N_QUIETER),
  ],
  steps: m22Steps,
};
