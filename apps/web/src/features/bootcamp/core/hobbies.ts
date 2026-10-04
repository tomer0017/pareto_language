import { item, npc, you, type MissionSpec } from '../author.js';

/**
 * Hobbies & Free Time — like / love / don't like / usually / want to try. The hobbies themselves
 * (surfing, drawing, music, running, diving) are replaceable variables; the frames are the skill.
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

export const HOBBIES: MissionSpec = {
  day: 33,
  title: ['תחביבים וזמן פנוי', 'Hobbies & Free Time'],
  icon: '🏄',
  intro: [
    ['אוהב, לא אוהב, בדרך כלל, רוצה לנסות — ארבע תבניות שמחזיקות שיחה שלמה.', 'Like, don’t like, usually, want to try — four frames that carry a whole conversation.'],
    ['התחביבים כאן הם רק דוגמה. תחליף אותם בשלך.', 'The hobbies here are only examples. Swap in your own.'],
  ],
  cta: ['לדבר על עצמי', 'Talk about me'],
  scenes: [{
    id: 'free-time-chat',
    receipt: ['סיפרת מה אתה אוהב, מה לא, ומה אתה רוצה לנסות — ושאלת בחזרה.', 'You said what you like, what you don’t, and what you want to try — and asked back.'],
    lines: [
      npc('Hi! Are you free today?', 'Salut ! Tu es libre aujourd’hui ?', '¡Hola! ¿Estás libre hoy?', 'היי! אתה פנוי היום?'),
      you(WHAT_FOR_FUN, { say: ['Yes! What do you do for fun?', 'Oui ! Qu’est-ce que tu aimes faire ?', '¡Sí! ¿Qué te gusta hacer?', 'כן! מה אתה אוהב לעשות בזמן הפנוי?'] }),
      npc('I surf a lot. Do you like surfing?', 'Je fais beaucoup de surf. Tu aimes le surf ?', 'Hago mucho surf. ¿Te gusta el surf?', 'אני גולש הרבה. אתה אוהב לגלוש?'),
      you(LOVE_SURFING),
      npc('Great! And what else do you like?', 'Super ! Et tu aimes quoi d’autre ?', '¡Genial! ¿Y qué más te gusta?', 'מעולה! ומה עוד אתה אוהב?'),
      you(LIKE_DRAWING),
      npc('Nice! When do you draw?', 'Sympa ! Tu dessines quand ?', '¡Qué bien! ¿Cuándo dibujas?', 'יפה! מתי אתה מצייר?'),
      you(USUALLY),
      npc('In the evening I like to listen to music. Do you like music?', 'Le soir, j’aime écouter de la musique. Tu aimes la musique ?', 'Por la noche me gusta escuchar música. ¿Te gusta la música?', 'בערב אני אוהב לשמוע מוזיקה. אתה אוהב מוזיקה?'),
      you(LIKE_TO_LISTEN, { say: ['Yes, I like to listen to music too.', 'Oui, moi aussi j’aime écouter de la musique.', 'Sí, a mí también me gusta escuchar música.', 'כן, גם אני אוהב לשמוע מוזיקה.'] }),
      npc('And sport? Do you like running?', 'Et le sport ? Tu aimes courir ?', '¿Y el deporte? ¿Te gusta correr?', 'וספורט? אתה אוהב לרוץ?'),
      you(DONT_LIKE, { say: ["No, I don't like running.", 'Non, je n’aime pas courir.', 'No, no me gusta correr.', 'לא, אני לא אוהב לרוץ.'] }),
      npc('Me neither! Is there something you want to try here?', 'Moi non plus ! Il y a quelque chose que tu veux essayer ici ?', '¡Yo tampoco! ¿Hay algo que quieras probar aquí?', 'גם אני לא! יש משהו שאתה רוצה לנסות כאן?', 'fast'),
      you(WANT_TO_TRY, {
        rec: { tool: 'what-mean', npc: ['Something new. What do you want — to try?', 'Quelque chose de nouveau. Tu veux essayer — quoi ?', 'Algo nuevo. ¿Qué quieres — probar?', 'משהו חדש. מה אתה רוצה — לנסות?'] },
      }),
      npc("Good idea! There's a diving school near the beach.", 'Bonne idée ! Il y a une école de plongée près de la plage.', '¡Buena idea! Hay una escuela de buceo cerca de la playa.', 'רעיון טוב! יש בית ספר לצלילה ליד החוף.'),
      you(DO_YOU_LIKE),
      npc("I love it! Let's go together tomorrow.", 'J’adore ! On y va ensemble demain.', '¡Me encanta! Vamos juntos mañana.', 'מאוד! בוא נלך יחד מחר.'),
    ],
  }],
  hear: [
    item('reply.hobby.do-you-like-surfing', 'Do you like surfing?', 'Tu aimes le surf ?', '¿Te gusta el surf?', 'אתה אוהב לגלוש?'),
    item('reply.hobby.what-else', 'What else do you like?', 'Tu aimes quoi d’autre ?', '¿Qué más te gusta?', 'מה עוד אתה אוהב?'),
    item('reply.hobby.do-you-like-music', 'Do you like music?', 'Tu aimes la musique ?', '¿Te gusta la música?', 'אתה אוהב מוזיקה?'),
    item('reply.hobby.me-neither', 'Me neither!', 'Moi non plus !', '¡Yo tampoco!', 'גם אני לא!'),
    item('reply.hobby.want-to-try-q', 'Is there something you want to try?', 'Il y a quelque chose que tu veux essayer ?', '¿Hay algo que quieras probar?', 'יש משהו שאתה רוצה לנסות?'),
    item('reply.hobby.go-together', "Let's go together.", 'On y va ensemble.', 'Vamos juntos.', 'בוא נלך יחד.'),
  ],
  teach: {
    tools: [
      { id: 'phrase.hobby.i-like-drawing', label: ['אוהב', 'Like'] },
      { id: 'phrase.hobby.i-love-surfing', label: ['מאוד אוהב', 'Love'] },
      { id: 'phrase.hobby.dont-like-running', label: ['לא אוהב', "Don't like"] },
      { id: 'phrase.hobby.i-usually', label: ['בדרך כלל', 'Usually'] },
      { id: 'phrase.hobby.want-to-try', label: ['רוצה לנסות', 'Want to try'] },
      { id: 'phrase.hobby.what-for-fun', label: ['לשאול בחזרה', 'Ask back'] },
    ],
    said: 'phrase.hobby.i-like-drawing',
    replies: ['reply.hobby.what-else', 'reply.hobby.do-you-like-music', 'reply.hobby.me-neither', 'reply.hobby.go-together'],
    repliesReceipt: ['אתה מזהה כששואלים מה אתה אוהב — ומה עוד.', 'You recognize it when someone asks what you like — and what else.'],
    quiz: ['reply.hobby.want-to-try-q', 'reply.hobby.do-you-like-music', 'reply.hobby.me-neither'],
    ambush: {
      npc: ['So tell me do you like music or are you more of a sport person?', 'Alors dis-moi, tu aimes la musique ou tu es plutôt sport ?', 'A ver, dime: ¿te gusta la música o eres más de deporte?', 'אז תגיד — אתה אוהב מוזיקה או שאתה יותר טיפוס של ספורט?'],
      correct: 'reply.hobby.do-you-like-music',
      wrong: 'reply.hobby.go-together',
      receipt: ['שאלה כפולה ומהירה — ותפסת שהיא על מה שאתה אוהב.', 'A fast double question — and you caught that it is about what you like.'],
    },
  },
};
