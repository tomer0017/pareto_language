import { fromItems, item, npc, you, type MissionSpec } from '../author.js';
import { DAY1_ITEMS } from '../day1.js';
import { DAY1_FR_ITEMS } from '../fr/day1.js';
import { DAY1_ES_ITEMS } from '../es/day1.js';
import { L_BYE, L_FOOD, L_HERE, L_LIKE, L_OPEN, L_TIP, L_WHERE, M11_BRIEFING_IMAGE, Y_CLOSE, Y_FIRST, Y_LIKE, Y_ORIGIN, m11Steps } from '../practiceSmallTalk.js';

/**
 * Small Talk & Recommendations — a short, coherent chat with a local at a viewpoint: the view, where
 * are you from (and how about you?), first time here, do you like it, can you recommend a place,
 * nice talking to you. The conversation is LOCKED (mission11.test.ts pins it word for word); the
 * journey around it is `m11Steps` (practiceSmallTalk.ts). Sentence ids are unchanged, so earlier
 * practice still counts, and the later missions that reuse these sentences are untouched.
 * Polite register (vous / usted) — a stranger. AI linguistic review completed; native review still recommended.
 */
const intro = (id: string) => fromItems(id, DAY1_ITEMS, DAY1_FR_ITEMS, DAY1_ES_ITEMS);

const BEAUTIFUL = item('phrase.talk.beautiful-place', 'This place is beautiful.', 'Cet endroit est magnifique.', 'Este lugar es precioso.', 'המקום הזה יפהפה.',
  ['מחמאה למקום פותחת כל שיחה.', 'A compliment about the place opens any conversation.']);
const HOW_ABOUT_YOU = item('phrase.talk.how-about-you', 'How about you?', 'Et vous ?', '¿Y usted?', 'ואתה?',
  ['להחזיר את השאלה — וכבר יש שיחה.', 'Return the question — and you have a conversation.']);
const I_LIKE_IT = item('phrase.talk.i-like-it', 'I like it a lot.', 'J’aime beaucoup.', 'Me gusta mucho.', 'אני מאוד אוהב.');
const RECOMMEND = item('phrase.talk.recommend-place', 'Can you recommend a place?', 'Vous pouvez recommander un endroit ?', '¿Me puede recomendar un sitio?', 'אתה יכול להמליץ על מקום?',
  ['מקומיים יודעים הכי טוב. תשאל.', 'Locals know best. Ask.']);
const NICE_TALKING = item('phrase.talk.nice-talking', 'It was nice talking to you.', 'C’était sympa de discuter avec vous.', 'Ha sido un placer hablar con usted.', 'היה נעים לדבר איתך.');
const FROM_ISRAEL = intro('phrase.social.from-israel');
const FIRST_TIME = intro('phrase.social.first-time');

/** A local's line, as a sentence the learner HEARS (heard whole — the meaning is the whole line). */
const heard = (id: string, t: readonly [string, string, string, string]) => item(id, t[0], t[1], t[2], t[3]);

export const SMALL_TALK: MissionSpec = {
  day: 22,
  title: ['שיחת חולין והמלצות', 'Small Talk & Recommendations'],
  icon: '💬',
  numbered: true,
  // Only what the traveller knows: where they are from, that it is their first visit. Not who they will
  // meet, nor that a tip is coming.
  intro: [['אתה מטייל במקום יפה ומתחילה שיחה עם מישהו לידך. נסה להחזיק את השיחה ולקבל ממנו המלצה מקומית.', 'You are sightseeing somewhere beautiful, and a conversation starts with someone next to you. Try to keep it going — and get a local recommendation.']],
  facts: [
    { icon: '🇮🇱', label: ['מאיפה', 'From'], value: ['ישראל', 'Israel'] },
    { icon: '🧳', label: ['הביקור', 'Visit'], value: ['ביקור ראשון', 'First visit'] },
  ],
  ...(M11_BRIEFING_IMAGE ? { image: M11_BRIEFING_IMAGE } : {}),
  cta: ['לפתוח שיחה', 'Start a chat'],
  scenes: [{
    id: 'small-talk',
    receipt: ['שיחה שלמה עם זר: מאיפה, פעם ראשונה, מה אהבת, המלצה ופרידה.', 'A whole chat with a stranger: where from, first time, what you like, a recommendation and a goodbye.'],
    // Each turn is a real decision: one line from another moment of the chat would not fit here — a
    // miss is asked again, slowly, and the same choice comes back.
    lines: [
      npc(...L_OPEN),
      you(BEAUTIFUL, { wrong: [FROM_ISRAEL] }),
      npc(...L_WHERE),
      you(HOW_ABOUT_YOU, { say: Y_ORIGIN, wrong: [FIRST_TIME] }),
      npc(...L_HERE),
      you(FIRST_TIME, { say: Y_FIRST, wrong: [I_LIKE_IT] }),
      npc(...L_LIKE),
      you(I_LIKE_IT, { say: Y_LIKE, wrong: [RECOMMEND] }),
      npc(...L_FOOD),
      you(RECOMMEND, { wrong: [NICE_TALKING] }),
      npc(...L_TIP),
      you(NICE_TALKING, { say: Y_CLOSE, wrong: [HOW_ABOUT_YOU] }),
      npc(...L_BYE),
    ],
  }],
  extra: [FROM_ISRAEL],
  hear: [
    heard('reply.talk.opening', L_OPEN),
    heard('reply.talk.really-where', L_WHERE),
    heard('reply.talk.from-here', L_HERE),
    heard('reply.talk.welcome-like', L_LIKE),
    heard('reply.talk.food', L_FOOD),
    heard('reply.talk.tip', L_TIP),
    heard('reply.talk.goodbye', L_BYE),
    // One more way a local gives a tip, heard as you part (Mission 24's "You should take the boat tour." builds on it).
    item('reply.talk.you-should-try', 'You should try the old town.', 'Vous devriez essayer la vieille ville.', 'Debería visitar el casco antiguo.', 'כדאי לך לנסות את העיר העתיקה.'),
  ],
  steps: m11Steps,
};
