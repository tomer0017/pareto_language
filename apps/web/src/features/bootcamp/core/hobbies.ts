import { item, npc, you, type MissionSpec } from '../author.js';
import { M16_BRIEFING_IMAGE, N_ELSE, N_FREE, N_MUSIC, N_SCHOOL, N_SPORT, N_SURF, N_TOMORROW, N_TRY, N_WHEN, Y_DONT, Y_FUN, Y_TOO, m16Steps } from '../practiceHobbies.js';

/**
 * Hobbies & Free Time — love / like / don't like / usually / want to try, and asking back. The hobbies
 * themselves (surfing, drawing, music, running, diving) are examples that fill the frames; the frames
 * are the skill. The conversation is LOCKED (mission16.test.ts pins it word for word); the journey
 * around it is `m16Steps` (practiceHobbies.ts). The learner's sentence ids are unchanged, so earlier
 * practice still counts and the Everyday checkpoint that reuses two of them is untouched.
 * Informal register (tu / tú). AI linguistic review completed; native review still recommended.
 */
const WHAT_FOR_FUN = item('phrase.hobby.what-for-fun', 'What do you do for fun?', 'Qu’est-ce que tu aimes faire ?', '¿Qué te gusta hacer?', 'מה אתה אוהב לעשות בזמן הפנוי?');
const LOVE_SURFING = item('phrase.hobby.i-love-surfing', 'I love surfing!', 'J’adore le surf !', '¡Me encanta el surf!', 'אני מאוד אוהב לגלוש!');
const LIKE_DRAWING = item('phrase.hobby.i-like-drawing', 'I like drawing.', 'J’aime dessiner.', 'Me gusta dibujar.', 'אני אוהב לצייר.',
  ['I like ___ — מחליפים את התחביב, המשפט נשאר.', 'I like ___ — swap the hobby, the sentence stays.']);
const USUALLY = item('phrase.hobby.i-usually', 'I usually draw in the evening.', 'D’habitude, je dessine le soir.', 'Normalmente dibujo por la noche.', 'בדרך כלל אני מצייר בערב.');
const LIKE_TO_LISTEN = item('phrase.hobby.like-to-listen', 'I like to listen to music.', 'J’aime écouter de la musique.', 'Me gusta escuchar música.', 'אני אוהב לשמוע מוזיקה.');
const DONT_LIKE = item('phrase.hobby.dont-like-running', "I don't like running.", 'Je n’aime pas courir.', 'No me gusta correr.', 'אני לא אוהב לרוץ.');
const WANT_TO_TRY = item('phrase.hobby.want-to-try', 'I want to try diving.', 'Je veux essayer la plongée.', 'Quiero probar el buceo.', 'אני רוצה לנסות צלילה.',
  ['I want to try ___ — לכל דבר חדש בטיול.', 'I want to try ___ — for anything new on a trip.']);
const DO_YOU_LIKE = item('phrase.hobby.do-you-like', 'Do you like diving?', 'Tu aimes la plongée ?', '¿Te gusta el buceo?', 'אתה אוהב לצלול?');

/** A whole line of the friend's, heard whole (the meaning is the whole line). */
const heard = (id: string, t: readonly [string, string, string, string]) => item(id, t[0], t[1], t[2], t[3]);

export const HOBBIES: MissionSpec = {
  day: 33,
  title: ['תחביבים וזמן פנוי', 'Hobbies & Free Time'],
  icon: '🏄',
  numbered: true,
  // Your own preferences — not the friend's lines, not the plan.
  intro: [
    ['אתה אוהב מאוד לגלוש, אוהב לצייר ולשמוע מוזיקה, לא אוהב לרוץ ורוצה לנסות צלילה.', 'You love surfing, like drawing and listening to music, don’t like running, and want to try diving.'],
    ['תנהל שיחה קצרה על זמן פנוי.', 'Have a short chat about free time.'],
  ],
  ...(M16_BRIEFING_IMAGE ? { image: M16_BRIEFING_IMAGE } : {}),
  cta: ['לדבר על עצמי', 'Talk about me'],
  scenes: [{
    id: 'free-time-chat',
    receipt: ['סיפרת מה אתה אוהב, מה לא, ומה אתה רוצה לנסות — ושאלת בחזרה.', 'You said what you like, what you don’t, and what you want to try — and asked back.'],
    // Each turn is a real decision: a line from another moment of the chat does not fit here — a miss
    // is asked again, slowly, and the same choice comes back.
    lines: [
      npc(...N_FREE),
      you(WHAT_FOR_FUN, { say: Y_FUN, wrong: [LOVE_SURFING] }),
      npc(...N_SURF),
      you(LOVE_SURFING, { wrong: [WANT_TO_TRY] }),
      npc(...N_ELSE),
      you(LIKE_DRAWING, { wrong: [DO_YOU_LIKE] }),
      npc(...N_WHEN),
      you(USUALLY, { wrong: [LIKE_DRAWING] }),
      npc(...N_MUSIC),
      you(LIKE_TO_LISTEN, { say: Y_TOO, wrong: [DONT_LIKE] }),
      npc(...N_SPORT),
      you(DONT_LIKE, { say: Y_DONT, wrong: [LOVE_SURFING] }),
      npc(...N_TRY, 'fast'),
      you(WANT_TO_TRY, { wrong: [USUALLY] }),
      npc(...N_SCHOOL),
      you(DO_YOU_LIKE, { wrong: [WHAT_FOR_FUN] }),
      npc(...N_TOMORROW),
    ],
  }],
  hear: [
    heard('reply.hobby.free-today', N_FREE),
    heard('reply.hobby.do-you-like-surfing', N_SURF),
    heard('reply.hobby.what-else', N_ELSE),
    heard('reply.hobby.when-draw', N_WHEN),
    heard('reply.hobby.do-you-like-music', N_MUSIC),
    heard('reply.hobby.sport', N_SPORT),
    heard('reply.hobby.want-to-try-q', N_TRY),
    heard('reply.hobby.diving-school', N_SCHOOL),
    heard('reply.hobby.go-together', N_TOMORROW),
  ],
  steps: m16Steps,
};
