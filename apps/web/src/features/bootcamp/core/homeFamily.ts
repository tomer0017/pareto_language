import { item, npc, you, type MissionSpec } from '../author.js';
import { L_AFTER, L_BYE, L_COME, L_HUNGRY, L_MOTHER, L_NEW, L_REST, L_SIT, L_TIRED, M13_BRIEFING_IMAGE, Y_DECLINE, Y_GO_HOME, Y_HOME, Y_TIRED, m13Steps } from '../practiceHomeFamily.js';

/**
 * Home, Family & Daily Routine — a visit to a friend's home: going home, eating at grandmother's, being
 * tired, going to sleep. No furniture or family vocabulary lists, no grammar. The conversation is LOCKED
 * (mission13.test.ts pins it word for word); the journey around it is `m13Steps` (practiceHomeFamily.ts).
 * Sentence ids are unchanged, so earlier practice still counts and the Everyday checkpoint that reuses
 * them is untouched. Informal register (tu / tú). AI linguistic review completed; native review still recommended.
 */
const BEAUTIFUL_HOME = item('phrase.home.beautiful-home', 'Your home is beautiful.', 'Ta maison est très belle.', 'Tu casa es preciosa.', 'הבית שלך יפהפה.');
const IS_THIS_NEW = item('phrase.home.is-this-new', 'Is this sofa new?', 'Ce canapé est nouveau ?', '¿Este sofá es nuevo?', 'הספה הזאת חדשה?',
  ['Is this ___ new? — מחליפים את החפץ.', 'Is this ___ new? — swap the object.']);
const WHERE_FAMILY = item('phrase.home.where-family', 'Where is your family?', 'Où est ta famille ?', '¿Dónde está tu familia?', 'איפה המשפחה שלך?',
  ['Where is ___? — אותה שאלה מהכיוונים, עכשיו על אנשים.', 'Where is ___? — the same question from Directions, now about people.']);
const LIVE_WITH = item('phrase.home.live-with-family', 'Yes, I live with my family.', 'Oui, j’habite avec ma famille.', 'Sí, vivo con mi familia.', 'כן, אני גר עם המשפחה שלי.');
const EAT_AT_GRANDMOTHERS = item('phrase.home.eat-at-grandmothers', "I'm going to eat at my grandmother's.", 'Je vais manger chez ma grand-mère.', 'Voy a comer en casa de mi abuela.', 'אני הולך לאכול אצל סבתא שלי.',
  ['I’m going to ___ — התבנית לכל מה שאתה עומד לעשות.', 'I’m going to ___ — the frame for anything you are about to do.']);
const IM_TIRED = item('phrase.home.im-tired', "I'm tired.", 'Je suis fatigué.', 'Estoy cansado.', 'אני עייף.');
const GOING_HOME = item('phrase.home.going-home', "I'm going home.", 'Je rentre chez moi.', 'Me voy a casa.', 'אני הולך הביתה.');
const GOING_TO_SLEEP = item('phrase.home.going-to-sleep', "I'm going to sleep.", 'Je vais dormir.', 'Me voy a dormir.', 'אני הולך לישון.');

/** A whole line as a sentence of its own — the friend's lines, heard whole (the meaning is the whole line). */
const heard = (id: string, t: readonly [string, string, string, string]) => item(id, t[0], t[1], t[2], t[3]);
/** The whole decline — what the one builder puts together (the dialogue's own turn wraps EAT_AT_GRANDMOTHERS). */
const DECLINE_LINE = heard('phrase.home.thanks-but-grandmothers', Y_DECLINE);

export const HOME_FAMILY: MissionSpec = {
  day: 32,
  title: ['בית, משפחה ושגרה', 'Home, Family & Daily Routine'],
  icon: '🏠',
  numbered: true,
  // Only the invitation: not who is home, not your dinner plan, not how you feel.
  intro: [['חבר הזמין אותך אליו הביתה. תדברו קצת על הבית, המשפחה ומה שאתה עושה בהמשך הערב.', 'A friend has invited you to their home. You’ll talk a little about the home, the family and what you’re doing later this evening.']],
  ...(M13_BRIEFING_IMAGE ? { image: M13_BRIEFING_IMAGE } : {}),
  cta: ['להיכנס', 'Come in'],
  scenes: [{
    id: 'at-a-friends-home',
    receipt: ['דיברת על בית, משפחה ועל מה שאתה עומד לעשות — בלי מילה אחת על תיירות.', 'You talked about home, family and what you are about to do — without a single tourist word.'],
    // Each turn is a real decision: one line from another moment of the visit would not fit here — a
    // miss is asked again, slowly, and the same choice comes back.
    lines: [
      npc(...L_COME),
      you(BEAUTIFUL_HOME, { say: Y_HOME, wrong: [IS_THIS_NEW] }),
      npc(...L_SIT),
      you(IS_THIS_NEW, { wrong: [GOING_TO_SLEEP] }),
      npc(...L_NEW),
      you(WHERE_FAMILY, { wrong: [LIVE_WITH] }),
      npc(...L_MOTHER, 'fast'),
      you(LIVE_WITH, { wrong: [WHERE_FAMILY] }),
      npc(...L_HUNGRY),
      you(EAT_AT_GRANDMOTHERS, { say: Y_DECLINE, wrong: [IS_THIS_NEW] }),
      npc(...L_TIRED),
      you(IM_TIRED, { say: Y_TIRED, wrong: [WHERE_FAMILY] }),
      npc(...L_REST),
      you(GOING_HOME, { say: Y_GO_HOME, wrong: [LIVE_WITH] }),
      npc(...L_AFTER),
      you(GOING_TO_SLEEP, { wrong: [BEAUTIFUL_HOME] }),
      npc(...L_BYE),
    ],
  }],
  extra: [DECLINE_LINE],
  hear: [
    heard('reply.home.come-in', L_COME),
    heard('reply.home.sit', L_SIT),
    heard('reply.home.new', L_NEW),
    heard('reply.home.mother', L_MOTHER),
    heard('reply.home.hungry', L_HUNGRY),
    heard('reply.home.tired', L_TIRED),
    heard('reply.home.rest', L_REST),
    heard('reply.home.after', L_AFTER),
    heard('reply.home.goodbye', L_BYE),
  ],
  steps: m13Steps,
};
