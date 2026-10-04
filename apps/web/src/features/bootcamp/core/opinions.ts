import { item, npc, you, type MissionSpec } from '../author.js';

/**
 * Opinions, Feelings & Reactions — the chunks that make a learner sound like a person instead of a
 * phrasebook: I think / I don't think so / why / because / but / maybe / really / of course.
 * One coherent conversation: two travelers choosing a tour. Informal register (tu / tú).
 * AI linguistic review completed; native review still recommended.
 */
const THINK_EXPENSIVE = item('phrase.opin.i-think-expensive', "I think it's too expensive.", 'Je pense que c’est trop cher.', 'Creo que es demasiado caro.', 'אני חושב שזה יקר מדי.',
  ['I think ___ — כל דעה מתחילה ככה.', 'I think ___ — every opinion starts like this.']);
const DONT_THINK_SO = item('phrase.opin.dont-think-so', "I don't think so.", 'Je ne crois pas.', 'No lo creo.', 'לא נראה לי.');
const BECAUSE = item('phrase.opin.because', "Because it's only one hour.", 'Parce que c’est seulement une heure.', 'Porque es solo una hora.', 'כי זה רק שעה אחת.',
  ['Because ___ — התשובה לכל "למה?"', 'Because ___ — the answer to every "why?"']);
const LIKE_IT = item('phrase.opin.i-like-it', 'Yes, I like it.', 'Oui, ça me plaît.', 'Sí, me gusta.', 'כן, זה מוצא חן בעיניי.');
const DONT_LIKE_IT = item('phrase.opin.dont-like-it', "I don't like it.", 'Ça ne me plaît pas.', 'No me gusta.', 'זה לא מוצא חן בעיניי.');
const STRANGE = item('phrase.opin.thats-strange', "That's strange.", 'C’est bizarre.', 'Qué raro.', 'זה מוזר.');
const NOT_SURE = item('phrase.opin.not-sure', "I'm not sure.", 'Je ne suis pas sûr.', 'No estoy seguro.', 'אני לא בטוח.',
  ['כשאתה לא יודע מה אתה חושב — זו תשובה שלמה.', 'When you do not know what you think — this is a complete answer.']);
const LETS_DO_IT = item('phrase.opin.lets-do-it', "Okay, let's do it.", 'D’accord, on y va.', 'Vale, vamos.', 'בסדר, הולכים על זה.');
const OF_COURSE = item('phrase.opin.of-course', 'Of course!', 'Bien sûr !', '¡Claro!', 'ברור!');

export const OPINIONS: MissionSpec = {
  day: 36,
  title: ['דעות, רגשות ותגובות', 'Opinions, Feelings & Reactions'],
  icon: '💭',
  intro: [
    ['אני חושב, למה, כי, אבל, אולי, באמת? — המילים הקטנות שהופכות אותך מספר שיחון לבן אדם.', 'I think, why, because, but, maybe, really? — the small words that turn a phrasebook into a person.'],
    ['שני מטיילים בוחרים סיור. אתה לא חייב להסכים.', 'Two travelers choosing a tour. You don’t have to agree.'],
  ],
  cta: ['להגיד מה אני חושב', 'Say what I think'],
  scenes: [{
    id: 'choosing-a-tour',
    receipt: ['אמרת מה אתה חושב, הסברת למה, התלבטת — והחלטת. שיחה של בני אדם.', 'You said what you think, explained why, hesitated — and decided. A human conversation.'],
    lines: [
      npc('Look — a boat tour, fifty euros. What do you think?', 'Regarde — un tour en bateau, cinquante euros. Tu en penses quoi ?', 'Mira — un paseo en barco, cincuenta euros. ¿Qué te parece?', 'תראה — סיור בסירה, חמישים יורו. מה אתה חושב?'),
      you(THINK_EXPENSIVE),
      npc("Really? I think it's a good price.", 'Vraiment ? Moi, je pense que c’est un bon prix.', '¿De verdad? Yo creo que es un buen precio.', 'באמת? אני חושב שזה מחיר טוב.'),
      you(DONT_THINK_SO),
      npc('Why?', 'Pourquoi ?', '¿Por qué?', 'למה?'),
      you(BECAUSE),
      npc("That's true. Look at this one — a walking tour. Do you like it?", 'C’est vrai. Regarde celui-ci — une visite à pied. Ça te plaît ?', 'Es verdad. Mira este — un paseo a pie. ¿Te gusta?', 'נכון. תראה את זה — סיור רגלי. מוצא חן בעיניך?'),
      you(LIKE_IT),
      npc("It's free. But it starts at six in the morning.", 'C’est gratuit. Mais ça commence à six heures du matin.', 'Es gratis. Pero empieza a las seis de la mañana.', 'זה בחינם. אבל זה מתחיל בשש בבוקר.', 'fast'),
      you(STRANGE, {
        say: ["At six? That's strange.", 'À six heures ? C’est bizarre.', '¿A las seis? Qué raro.', 'בשש? זה מוזר.'],
        rec: { tool: 'repeat', npc: ['Free. It starts — at six. In the morning.', 'Gratuit. Ça commence — à six heures. Le matin.', 'Gratis. Empieza — a las seis. De la mañana.', 'בחינם. מתחיל — בשש. בבוקר.'] },
      }),
      npc("It's because of the heat. Are you coming?", 'C’est à cause de la chaleur. Tu viens ?', 'Es por el calor. ¿Vienes?', 'זה בגלל החום. אתה בא?'),
      you(NOT_SURE, { say: ["Maybe. I'm not sure — I'm tired.", 'Peut-être. Je ne suis pas sûr — je suis fatigué.', 'Quizás. No estoy seguro — estoy cansado.', 'אולי. אני לא בטוח — אני עייף.'] }),
      npc("Come on — it's only two hours, and it's free.", 'Allez — c’est seulement deux heures, et c’est gratuit.', 'Venga — son solo dos horas, y es gratis.', 'נו — זה רק שעתיים, וזה בחינם.'),
      you(LETS_DO_IT),
      npc('Great! See you at six!', 'Super ! À six heures !', '¡Genial! ¡Nos vemos a las seis!', 'מעולה! נתראה בשש!'),
    ],
  }],
  // Not a turn in the scene, but a sentence the course keeps: the City & Conversation checkpoint reuses it.
  extra: [OF_COURSE, DONT_LIKE_IT],
  hear: [
    item('reply.opin.what-do-you-think', 'What do you think?', 'Tu en penses quoi ?', '¿Qué te parece?', 'מה אתה חושב?'),
    item('reply.opin.really', 'Really?', 'Vraiment ?', '¿De verdad?', 'באמת?'),
    item('reply.opin.why', 'Why?', 'Pourquoi ?', '¿Por qué?', 'למה?'),
    item('reply.opin.thats-true', "That's true.", 'C’est vrai.', 'Es verdad.', 'נכון.'),
    item('reply.opin.do-you-like-it', 'Do you like it?', 'Ça te plaît ?', '¿Te gusta?', 'מוצא חן בעיניך?'),
    item('reply.opin.are-you-coming', 'Are you coming?', 'Tu viens ?', '¿Vienes?', 'אתה בא?'),
  ],
  teach: {
    tools: [
      { id: 'phrase.opin.i-think-expensive', label: ['אני חושב', 'I think'] },
      { id: 'phrase.opin.dont-think-so', label: ['לא להסכים', 'Disagree'] },
      { id: 'phrase.opin.because', label: ['כי', 'Because'] },
      { id: 'phrase.opin.not-sure', label: ['לא בטוח', 'Not sure'] },
      { id: 'phrase.opin.i-like-it', label: ['מוצא חן בעיניי', 'I like it'] },
      { id: 'phrase.opin.of-course', label: ['ברור', 'Of course'] },
    ],
    said: 'phrase.opin.i-think-expensive',
    replies: ['reply.opin.really', 'reply.opin.why', 'reply.opin.thats-true', 'reply.opin.what-do-you-think'],
    repliesReceipt: ['אתה מזהה כששואלים לדעתך — וכשמגיבים אליה.', 'You recognize when your opinion is asked for — and when someone reacts to it.'],
    practice: [
      // Saying what you think: an opinion, a disagreement, a reason, a doubt, a decision.
      {
        kind: 'quickReply',
        label: ['מה אתה חושב? — מה אומרים?', 'What do you think? — what do you say?'],
        rounds: [
          { prompt: 'reply.opin.what-do-you-think', options: [['phrase.opin.i-think-expensive', true], ['phrase.opin.because', false], ['phrase.opin.of-course', false]] },
          { situation: ['הוא חושב שהמחיר טוב. אתה לא מסכים.', 'They think the price is good. You do not agree.'],
            options: [['phrase.opin.dont-think-so', true], ['phrase.opin.i-like-it', false], ['phrase.opin.of-course', false]] },
          { prompt: 'reply.opin.why', options: [['phrase.opin.because', true], ['phrase.opin.of-course', false], ['phrase.opin.lets-do-it', false]] },
          { prompt: 'reply.opin.do-you-like-it', options: [['phrase.opin.i-like-it', true], ['phrase.opin.dont-like-it', true], ['phrase.opin.because', false]] },
          { prompt: 'reply.opin.are-you-coming', options: [
            ['phrase.opin.not-sure', true, ["Maybe. I'm not sure — I'm tired.", 'Peut-être. Je ne suis pas sûr — je suis fatigué.', 'Quizás. No estoy seguro — estoy cansado.']],
            ['phrase.opin.of-course', true], ['phrase.opin.because', false],
          ] },
          { situation: ['החלטת. אתה בא.', 'You have decided. You are in.'],
            options: [['phrase.opin.lets-do-it', true], ['phrase.opin.dont-think-so', false], ['phrase.opin.not-sure', false]] },
        ],
      },
      // Short reactions keep a conversation alive without a long sentence.
      {
        kind: 'quickReply',
        label: ['להגיב בקצרה', 'React in a word or two'],
        rounds: [
          { npc: ["It's free. But it starts at six in the morning.", 'C’est gratuit. Mais ça commence à six heures du matin.', 'Es gratis. Pero empieza a las seis de la mañana.', 'זה בחינם. אבל זה מתחיל בשש בבוקר.'],
            options: [
              ['reply.opin.really', true],
              ['phrase.opin.thats-strange', true, ["At six? That's strange.", 'À six heures ? C’est bizarre.', '¿A las seis? Qué raro.']],
              ['phrase.opin.because', false],
            ] },
          { npc: ["Come on — it's only two hours, and it's free.", 'Allez — c’est seulement deux heures, et c’est gratuit.', 'Venga — son solo dos horas, y es gratis.', 'נו — זה רק שעתיים, וזה בחינם.'],
            options: [['reply.opin.thats-true', true], ['phrase.opin.lets-do-it', true], ['phrase.opin.i-think-expensive', false]] },
          { npc: ['Great! See you at six!', 'Super ! À six heures !', '¡Genial! ¡Nos vemos a las seis!', 'מעולה! נתראה בשש!'],
            options: [['phrase.opin.of-course', true], ['phrase.opin.dont-think-so', false], ['phrase.opin.because', false]] },
        ],
      },
      // "I think it's ___" with three verdicts the conversation already uses.
      {
        kind: 'swap',
        label: ['מה אתה חושב על זה?', 'What do you think of it?'],
        rounds: ([['expensive', '💸', ['זה יקר לך מדי', 'It costs too much for you']], ['good', '👍', ['המחיר נראה לך טוב', 'The price looks good to you']], ['strange', '🤔', ['זה נראה לך מוזר', 'It seems odd to you']]] as const).map(([right, emoji, cue]) => ({
          frame: ["I think it's ___.", 'Je pense que c’est ___.', 'Creo que es ___.'] as const,
          itemId: 'phrase.opin.i-think-expensive',
          cue: { emoji, text: cue },
          options: [
            [['too expensive', 'trop cher', 'demasiado caro'], 'אני חושב שזה יקר מדי.', right === 'expensive'],
            [['a good price', 'un bon prix', 'un buen precio'], 'אני חושב שזה מחיר טוב.', right === 'good'],
            [['strange', 'bizarre', 'raro'], 'אני חושב שזה מוזר.', right === 'strange'],
          ] as const,
        })),
      },
      // An opinion, then its reason — the two halves of one thought.
      {
        kind: 'sentenceBuilder',
        rounds: [
          { itemId: 'phrase.opin.i-think-expensive', chunks: [['I think', "it's", 'too expensive.'], ['Je pense', 'que c’est', 'trop cher.'], ['Creo', 'que es', 'demasiado caro.']] },
          { itemId: 'phrase.opin.because', chunks: [['Because', "it's only", 'one hour.'], ['Parce que', 'c’est seulement', 'une heure.'], ['Porque', 'es solo', 'una hora.']] },
        ],
      },
    ],
    review: [
      'phrase.opin.i-think-expensive', 'phrase.opin.dont-think-so', 'phrase.opin.because', 'phrase.opin.not-sure', 'phrase.opin.i-like-it', 'phrase.opin.of-course',
      'phrase.opin.lets-do-it',
      'reply.opin.what-do-you-think', 'reply.opin.really', 'reply.opin.why', 'reply.opin.thats-true',
      'phrase.recovery.repeat',
    ],
    // Choosing a tour with a friend, at natural speed — their own lines.
    finale: [{
      practice: {
        kind: 'quickReply',
        challenge: true,
        rounds: [
          { npc: ['Look — a boat tour, fifty euros. What do you think?', 'Regarde — un tour en bateau, cinquante euros. Tu en penses quoi ?', 'Mira — un paseo en barco, cincuenta euros. ¿Qué te parece?', 'תראה — סיור בסירה, חמישים יורו. מה אתה חושב?'],
            options: [['phrase.opin.i-think-expensive', true], ['phrase.opin.because', false], ['phrase.opin.of-course', false]] },
          { npc: ["Really? I think it's a good price.", 'Vraiment ? Moi, je pense que c’est un bon prix.', '¿De verdad? Yo creo que es un buen precio.', 'באמת? אני חושב שזה מחיר טוב.'],
            options: [['phrase.opin.dont-think-so', true], ['phrase.opin.because', false], ['phrase.opin.i-like-it', false]] },
          { npc: ['Why?', 'Pourquoi ?', '¿Por qué?', 'למה?'],
            options: [['phrase.opin.because', true], ['phrase.opin.of-course', false], ['phrase.opin.lets-do-it', false]] },
          { npc: ["That's true. Look at this one — a walking tour. Do you like it?", 'C’est vrai. Regarde celui-ci — une visite à pied. Ça te plaît ?', 'Es verdad. Mira este — un paseo a pie. ¿Te gusta?', 'נכון. תראה את זה — סיור רגלי. מוצא חן בעיניך?'],
            options: [['phrase.opin.i-like-it', true], ['phrase.opin.because', false], ['phrase.opin.dont-think-so', false]] },
          { npc: ["It's because of the heat. Are you coming?", 'C’est à cause de la chaleur. Tu viens ?', 'Es por el calor. ¿Vienes?', 'זה בגלל החום. אתה בא?'],
            options: [
              ['phrase.opin.not-sure', true, ["Maybe. I'm not sure — I'm tired.", 'Peut-être. Je ne suis pas sûr — je suis fatigué.', 'Quizás. No estoy seguro — estoy cansado.']],
              ['phrase.opin.because', false], ['phrase.opin.i-think-expensive', false],
            ] },
          { npc: ["Come on — it's only two hours, and it's free.", 'Allez — c’est seulement deux heures, et c’est gratuit.', 'Venga — son solo dos horas, y es gratis.', 'נו — זה רק שעתיים, וזה בחינם.'],
            options: [['phrase.opin.lets-do-it', true], ['phrase.opin.because', false], ['phrase.opin.i-think-expensive', false]] },
        ],
      },
      receipt: ['אמרת מה אתה חושב, לא הסכמת, הסברת למה, התלבטת — והחלטת. בקצב של שיחה אמיתית.', 'You said what you think, disagreed, explained why, hesitated — and decided. At the pace of a real conversation.'],
    }],
  },
};
