import { item, npc, you, type MissionSpec } from '../author.js';
import { L_BEACH, L_BYE, L_EARLY, L_EIGHT, L_GOOD, L_INVITE, L_TODAY, L_TONIGHT, M12_BRIEFING_IMAGE, Y_MEET, Y_TODAY, Y_WHAT_TIME, m12Steps } from '../practiceTimePlans.js';

/**
 * Time & Plans — two travelers making plans. Not a lesson about clocks: today / tonight / tomorrow /
 * later / early / late, as people actually use them. The conversation is LOCKED (mission12.test.ts
 * pins it word for word); the journey around it is `m12Steps` (practiceTimePlans.ts). Sentence ids
 * are unchanged, so earlier practice still counts, and the later missions that reuse these sentences
 * are untouched. Informal register (tu / tú) — this is a conversation between friends.
 * AI linguistic review completed; native review still recommended.
 */
const MAYBE_LATER = item('phrase.time.maybe-later', 'Maybe later.', 'Peut-être plus tard.', 'Quizás más tarde.', 'אולי אחר כך.',
  ['התשובה הכי שימושית כשלא החלטת.', 'The most useful answer when you have not decided.']);
const FREE_TONIGHT = item('phrase.time.free-tonight', "I'm free tonight.", 'Je suis libre ce soir.', 'Estoy libre esta noche.', 'אני פנוי הערב.');
const WHAT_TIME = item('phrase.time.what-time', 'What time?', 'À quelle heure ?', '¿A qué hora?', 'באיזו שעה?');
const NOT_TOO_LATE = item('phrase.time.not-too-late', "No, that's not too late.", 'Non, ce n’est pas trop tard.', 'No, no es muy tarde.', 'לא, זה לא מאוחר מדי.');
const WHAT_DOING_TOMORROW = item('phrase.time.what-doing-tomorrow', 'What are you doing tomorrow?', 'Tu fais quoi demain ?', '¿Qué haces mañana?', 'מה אתה עושה מחר?',
  ['מחליפים tomorrow ב-today / tonight ויש לך שלוש שאלות.', 'Swap tomorrow for today / tonight and you have three questions.']);
const FREE_TOMORROW = item('phrase.time.free-tomorrow', "Yes, I'm free tomorrow.", 'Oui, je suis libre demain.', 'Sí, estoy libre mañana.', 'כן, אני פנוי מחר.');
const LETS_MEET = item('phrase.time.lets-meet', "Let's meet here at seven.", 'On se retrouve ici à sept heures.', 'Quedamos aquí a las siete.', 'ניפגש כאן בשבע.',
  ['Let’s meet ___ at ___ — מקום ושעה, וזהו.', 'Let’s meet ___ at ___ — a place and a time, and you are done.']);

/** A whole line as a sentence of its own — the friend's lines, heard whole (the meaning is the whole line). */
const heard = (id: string, t: readonly [string, string, string, string]) => item(id, t[0], t[1], t[2], t[3]);
/** The whole meeting line — what the one builder puts together (the dialogue's own turn wraps LETS_MEET). */
const MEET_LINE = heard('phrase.time.no-problem-meet', Y_MEET);

export const TIME_PLANS: MissionSpec = {
  day: 31,
  title: ['זמן ותוכניות', 'Time & Plans'],
  icon: '🗓️',
  numbered: true,
  // Only what the traveller knows: their own time is open. Not what the friend will propose.
  intro: [['בוקר. עדיין אין לך תוכניות קבועות. דבר עם חבר ותראה מה עושים היום ומחר.', 'Morning. You have no fixed plans yet. Talk with a friend and see what’s happening today and tomorrow.']],
  facts: [
    { icon: '☀️', label: ['הבוקר', 'This morning'], value: ['פתוח', 'Open'] },
    { icon: '🌙', label: ['הערב', 'Tonight'], value: ['פנוי', 'Free'] },
    { icon: '🌅', label: ['מחר', 'Tomorrow'], value: ['פנוי', 'Free'] },
  ],
  ...(M12_BRIEFING_IMAGE ? { image: M12_BRIEFING_IMAGE } : {}),
  cta: ['לקבוע תוכניות', 'Make plans'],
  scenes: [{
    id: 'making-plans',
    receipt: ['קבעת ערב ובוקר: מתי, באיזו שעה, ואיפה נפגשים.', 'You planned an evening and a morning: when, what time, and where to meet.'],
    // Each turn is a real decision: one line from another moment of the plan would not fit here — a
    // miss is asked again, slowly, and the same choice comes back.
    lines: [
      npc(...L_TODAY),
      you(MAYBE_LATER, { say: Y_TODAY, wrong: [NOT_TOO_LATE] }),
      npc(...L_TONIGHT),
      you(FREE_TONIGHT, { wrong: [WHAT_TIME] }),
      npc(...L_INVITE),
      you(WHAT_TIME, { say: Y_WHAT_TIME, wrong: [FREE_TOMORROW] }),
      npc(...L_EIGHT, 'fast'),
      you(NOT_TOO_LATE, { wrong: [WHAT_DOING_TOMORROW] }),
      npc(...L_GOOD),
      you(WHAT_DOING_TOMORROW, { wrong: [WHAT_TIME] }),
      npc(...L_BEACH),
      you(FREE_TOMORROW, { wrong: [FREE_TONIGHT] }),
      npc(...L_EARLY),
      you(LETS_MEET, { say: Y_MEET, wrong: [NOT_TOO_LATE] }),
      npc(...L_BYE),
    ],
  }],
  extra: [MEET_LINE],
  hear: [
    heard('reply.time.today', L_TODAY),
    heard('reply.time.tonight-q', L_TONIGHT),
    heard('reply.time.invite', L_INVITE),
    heard('reply.time.eight', L_EIGHT),
    heard('reply.time.good', L_GOOD),
    heard('reply.time.beach', L_BEACH),
    heard('reply.time.early', L_EARLY),
    heard('reply.time.goodbye', L_BYE),
  ],
  steps: m12Steps,
};
