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
    practice: [
      // like / love / don't like — the hobby stays, the feeling changes. Only hobbies already met.
      {
        kind: 'swap',
        label: ['אוהב, מאוד אוהב, או לא אוהב?', 'Like it, love it, or not for you?'],
        rounds: ([
          ['dislike', 'phrase.hobby.dont-like-running', '🙅', ['ריצה — זה לא בשבילך', 'Running — not for you'], ['I ___ running.', '___ courir.', '___ correr.'], ['לרוץ', 'running']],
          ['love', 'phrase.hobby.i-love-surfing', '😍', ['גלישה — אתה מת על זה', 'Surfing — you love it'], ['I ___ surfing!', '___ le surf !', '¡___ el surf!'], ['לגלוש', 'surfing']],
          ['like', 'phrase.hobby.i-like-drawing', '🙂', ['ציור — אתה אוהב את זה', 'Drawing — you like it'], ['I ___ drawing.', '___ dessiner.', '___ dibujar.'], ['לצייר', 'drawing']],
        ] as const).map(([right, itemId, emoji, cue, frame, hobby]) => ({
          frame,
          itemId,
          cue: { emoji, text: cue },
          options: [
            [['like', 'J’aime', 'Me gusta'], `אני אוהב ${hobby[0]}.`, right === 'like'],
            [['love', 'J’adore', 'Me encanta'], `אני מאוד אוהב ${hobby[0]}.`, right === 'love'],
            [["don't like", 'Je n’aime pas', 'No me gusta'], `אני לא אוהב ${hobby[0]}.`, right === 'dislike'],
          ] as const,
        })),
      },
      // "Usually" — put together piece by piece.
      {
        kind: 'sentenceBuilder',
        rounds: [{ itemId: 'phrase.hobby.i-usually', chunks: [['I usually', 'draw', 'in the evening.'], ['D’habitude,', 'je dessine', 'le soir.'], ['Normalmente', 'dibujo', 'por la noche.']] }],
      },
      // A chat about free time: six moments, ending with you asking back.
      {
        kind: 'quickReply',
        label: ['שיחה על זמן פנוי — מה עונים?', 'A chat about free time — what do you say?'],
        rounds: [
          { prompt: 'reply.hobby.do-you-like-surfing', options: [['phrase.hobby.i-love-surfing', true], ['phrase.hobby.want-to-try', false], ['phrase.hobby.i-usually', false]] },
          { prompt: 'reply.hobby.what-else', options: [['phrase.hobby.i-like-drawing', true], ['phrase.hobby.like-to-listen', true], ['phrase.hobby.do-you-like', false]] },
          { npc: ['Nice! When do you draw?', 'Sympa ! Tu dessines quand ?', '¡Qué bien! ¿Cuándo dibujas?', 'יפה! מתי אתה מצייר?'],
            options: [['phrase.hobby.i-usually', true], ['phrase.hobby.i-like-drawing', false], ['phrase.hobby.want-to-try', false]] },
          { npc: ['And sport? Do you like running?', 'Et le sport ? Tu aimes courir ?', '¿Y el deporte? ¿Te gusta correr?', 'וספורט? אתה אוהב לרוץ?'],
            options: [
              ['phrase.hobby.dont-like-running', true, ["No, I don't like running.", 'Non, je n’aime pas courir.', 'No, no me gusta correr.']],
              ['phrase.hobby.i-usually', false], ['phrase.hobby.what-for-fun', false],
            ] },
          { prompt: 'reply.hobby.want-to-try-q', options: [['phrase.hobby.want-to-try', true], ['phrase.hobby.i-usually', false], ['phrase.hobby.like-to-listen', false]] },
          { situation: ['סיפרת על עצמך. עכשיו תשאל אותו מה הוא אוהב לעשות.', 'You have talked about yourself. Now ask what they like doing.'],
            options: [['phrase.hobby.what-for-fun', true], ['phrase.hobby.i-like-drawing', false], ['phrase.hobby.want-to-try', false]] },
        ],
      },
    ],
    review: [
      'phrase.hobby.what-for-fun', 'phrase.hobby.i-like-drawing', 'phrase.hobby.i-love-surfing', 'phrase.hobby.dont-like-running', 'phrase.hobby.i-usually',
      'phrase.hobby.like-to-listen', 'phrase.hobby.want-to-try', 'phrase.hobby.do-you-like',
      'reply.hobby.what-else', 'reply.hobby.want-to-try-q', 'reply.hobby.me-neither',
      'phrase.recovery.what-mean',
    ],
    // The chat at natural speed — your friend's own lines.
    finale: [{
      practice: {
        kind: 'quickReply',
        challenge: true,
        rounds: [
          { npc: ['I surf a lot. Do you like surfing?', 'Je fais beaucoup de surf. Tu aimes le surf ?', 'Hago mucho surf. ¿Te gusta el surf?', 'אני גולש הרבה. אתה אוהב לגלוש?'],
            options: [['phrase.hobby.i-love-surfing', true], ['phrase.hobby.i-usually', false], ['phrase.hobby.what-for-fun', false]] },
          { npc: ['Great! And what else do you like?', 'Super ! Et tu aimes quoi d’autre ?', '¡Genial! ¿Y qué más te gusta?', 'מעולה! ומה עוד אתה אוהב?'],
            options: [['phrase.hobby.i-like-drawing', true], ['phrase.hobby.do-you-like', false], ['phrase.hobby.what-for-fun', false]] },
          { npc: ['Nice! When do you draw?', 'Sympa ! Tu dessines quand ?', '¡Qué bien! ¿Cuándo dibujas?', 'יפה! מתי אתה מצייר?'],
            options: [['phrase.hobby.i-usually', true], ['phrase.hobby.want-to-try', false], ['phrase.hobby.i-love-surfing', false]] },
          { npc: ['In the evening I like to listen to music. Do you like music?', 'Le soir, j’aime écouter de la musique. Tu aimes la musique ?', 'Por la noche me gusta escuchar música. ¿Te gusta la música?', 'בערב אני אוהב לשמוע מוזיקה. אתה אוהב מוזיקה?'],
            options: [
              ['phrase.hobby.like-to-listen', true, ['Yes, I like to listen to music too.', 'Oui, moi aussi j’aime écouter de la musique.', 'Sí, a mí también me gusta escuchar música.']],
              ['phrase.hobby.dont-like-running', false], ['phrase.hobby.want-to-try', false],
            ] },
          { npc: ['Me neither! Is there something you want to try here?', 'Moi non plus ! Il y a quelque chose que tu veux essayer ici ?', '¡Yo tampoco! ¿Hay algo que quieras probar aquí?', 'גם אני לא! יש משהו שאתה רוצה לנסות כאן?'],
            options: [['phrase.hobby.want-to-try', true], ['phrase.hobby.i-usually', false], ['phrase.hobby.i-like-drawing', false]] },
        ],
      },
      receipt: ['שיחה שלמה על מה שאתה אוהב, בקצב רגיל — בלי לחפש מילים.', 'A whole chat about what you like, at normal pace — without hunting for words.'],
    }],
  },
};
