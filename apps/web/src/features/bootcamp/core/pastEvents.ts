import { item, npc, you, type MissionSpec } from '../author.js';

/**
 * Past & Recent Events — the simple past through a real conversation, not a grammar table. Five
 * past verbs only (went / saw / ate / stayed / was), chosen because together they answer almost
 * every "what did you do?" a traveler is asked. Informal register (tu / tú).
 * AI linguistic review completed; native review still recommended.
 */
const I_WENT = item('phrase.past.i-went', 'I went to the old town.', 'Je suis allé dans la vieille ville.', 'Fui al casco antiguo.', 'הלכתי לעיר העתיקה.',
  ['I went to ___ — התשובה ל"איפה היית?"', 'I went to ___ — the answer to "where were you?"']);
const I_SAW = item('phrase.past.i-saw', 'I saw the market.', 'J’ai vu le marché.', 'Vi el mercado.', 'ראיתי את השוק.');
const I_ATE = item('phrase.past.i-ate', 'Yes, I ate fish.', 'Oui, j’ai mangé du poisson.', 'Sí, comí pescado.', 'כן, אכלתי דג.');
const WAS_GREAT = item('phrase.past.it-was-great', 'Yes, it was great!', 'Oui, c’était super !', '¡Sí, estuvo genial!', 'כן, היה מעולה!');
const WAS_GOOD = item('phrase.past.it-was-good', 'It was good.', 'C’était bien.', 'Estuvo bien.', 'היה טוב.');
const WAS_BAD = item('phrase.past.it-was-bad', 'It was bad.', 'C’était mauvais.', 'Estuvo mal.', 'היה רע.');
const I_STAYED = item('phrase.past.i-stayed', 'I stayed in a hostel.', 'J’ai logé dans une auberge.', 'Me quedé en un hostal.', 'ישנתי בהוסטל.',
  ['I stayed in ___ — hostel, hotel, apartment.', 'I stayed in ___ — a hostel, a hotel, an apartment.']);
const WHAT_DID_YOU_DO = item('phrase.past.what-did-you-do', 'What did you do yesterday?', 'Tu as fait quoi hier ?', '¿Qué hiciste ayer?', 'מה עשית אתמול?');

export const PAST_EVENTS: MissionSpec = {
  day: 34,
  title: ['עבר: מה עשיתי', 'Past & Recent Events'],
  icon: '⏪',
  intro: [
    ['"איפה היית?" "מה עשית?" — שואלים את זה כל מטייל, כל יום.', '"Where were you?" "What did you do?" — every traveler is asked this, every day.'],
    ['חמישה פעלים בעבר מספיקים: הלכתי, ראיתי, אכלתי, ישנתי, היה.', 'Five past verbs are enough: went, saw, ate, stayed, was.'],
  ],
  cta: ['לספר מה עשיתי', 'Tell what I did'],
  scenes: [{
    id: 'what-did-you-do',
    receipt: ['סיפרת איפה היית, מה ראית, מה אכלת ואיפה ישנת — בעבר.', 'You said where you were, what you saw, what you ate and where you stayed — in the past.'],
    lines: [
      npc('Hey! Where were you yesterday?', 'Salut ! Tu étais où hier ?', '¡Hola! ¿Dónde estuviste ayer?', 'היי! איפה היית אתמול?'),
      you(I_WENT),
      npc('Nice! What did you see?', 'Sympa ! Tu as vu quoi ?', '¡Qué bien! ¿Qué viste?', 'יפה! מה ראית?'),
      you(I_SAW),
      npc('Did you eat there?', 'Tu as mangé là-bas ?', '¿Comiste allí?', 'אכלת שם?'),
      you(I_ATE),
      npc('Did you like it?', 'Tu as aimé ?', '¿Te gustó?', 'אהבת?'),
      you(WAS_GREAT, { alts: [WAS_GOOD] }),
      npc('You were in Argentina last month, right? Where did you stay?', 'Tu étais en Argentine le mois dernier, non ? Tu as logé où ?', 'Estuviste en Argentina el mes pasado, ¿no? ¿Dónde te quedaste?', 'היית בארגנטינה בחודש שעבר, נכון? איפה ישנת?', 'fast'),
      you(I_STAYED, {
        rec: { tool: 'repeat', npc: ['In Argentina. Where — did you stay?', 'En Argentine. Tu as logé — où ?', 'En Argentina. ¿Dónde — te quedaste?', 'בארגנטינה. איפה — ישנת?'] },
      }),
      npc('A hostel! Was it good?', 'Une auberge ! C’était bien ?', '¡Un hostal! ¿Estuvo bien?', 'הוסטל! היה טוב?'),
      you(WHAT_DID_YOU_DO, { say: ['It was good. And you? What did you do yesterday?', 'C’était bien. Et toi ? Tu as fait quoi hier ?', 'Estuvo bien. ¿Y tú? ¿Qué hiciste ayer?', 'היה טוב. ואתה? מה עשית אתמול?'] }),
      npc('Me? Nothing! I was tired. I slept all day.', 'Moi ? Rien ! J’étais fatigué. J’ai dormi toute la journée.', '¿Yo? ¡Nada! Estaba cansado. Dormí todo el día.', 'אני? כלום! הייתי עייף. ישנתי כל היום.'),
    ],
  }],
  extra: [WAS_BAD],
  hear: [
    item('reply.past.where-were-you', 'Where were you yesterday?', 'Tu étais où hier ?', '¿Dónde estuviste ayer?', 'איפה היית אתמול?'),
    item('reply.past.what-did-you-see', 'What did you see?', 'Tu as vu quoi ?', '¿Qué viste?', 'מה ראית?'),
    item('reply.past.did-you-eat', 'Did you eat there?', 'Tu as mangé là-bas ?', '¿Comiste allí?', 'אכלת שם?'),
    item('reply.past.did-you-like', 'Did you like it?', 'Tu as aimé ?', '¿Te gustó?', 'אהבת?'),
    item('reply.past.where-did-you-stay', 'Where did you stay?', 'Tu as logé où ?', '¿Dónde te quedaste?', 'איפה ישנת?'),
    item('reply.past.was-it-good', 'Was it good?', 'C’était bien ?', '¿Estuvo bien?', 'היה טוב?'),
  ],
  teach: {
    tools: [
      { id: 'phrase.past.i-went', label: ['הלכתי', 'I went'] },
      { id: 'phrase.past.i-saw', label: ['ראיתי', 'I saw'] },
      { id: 'phrase.past.i-ate', label: ['אכלתי', 'I ate'] },
      { id: 'phrase.past.i-stayed', label: ['ישנתי / התארחתי', 'I stayed'] },
      { id: 'phrase.past.it-was-great', label: ['איך היה', 'How it was'] },
      { id: 'phrase.past.what-did-you-do', label: ['לשאול בחזרה', 'Ask back'] },
    ],
    said: 'phrase.past.i-went',
    replies: ['reply.past.what-did-you-see', 'reply.past.did-you-eat', 'reply.past.did-you-like', 'reply.past.where-did-you-stay'],
    repliesReceipt: ['אתה מזהה שאלה על אתמול — גם בלי להבין כל מילה.', 'You recognize a question about yesterday — even without catching every word.'],
    practice: [
      // Telling someone about yesterday: their questions, your answers — and then you ask back.
      {
        kind: 'quickReply',
        label: ['שואלים אותך על אתמול — מה עונים?', 'They ask about yesterday — what do you say?'],
        rounds: [
          { prompt: 'reply.past.what-did-you-see', options: [['phrase.past.i-saw', true], ['phrase.past.i-ate', false], ['phrase.past.i-stayed', false]] },
          { prompt: 'reply.past.did-you-eat', options: [['phrase.past.i-ate', true], ['phrase.past.i-saw', false], ['phrase.past.i-went', false]] },
          { prompt: 'reply.past.did-you-like', options: [['phrase.past.it-was-great', true], ['phrase.past.it-was-good', true], ['phrase.past.i-stayed', false]] },
          { prompt: 'reply.past.where-did-you-stay', options: [['phrase.past.i-stayed', true], ['phrase.past.i-went', false], ['phrase.past.i-ate', false]] },
          { prompt: 'reply.past.was-it-good', options: [
            ['phrase.past.what-did-you-do', true, ['It was good. And you? What did you do yesterday?', 'C’était bien. Et toi ? Tu as fait quoi hier ?', 'Estuvo bien. ¿Y tú? ¿Qué hiciste ayer?']],
            ['phrase.past.i-saw', false], ['phrase.past.i-went', false],
          ] },
          { situation: ['סיפרת על אתמול שלך. עכשיו תורך לשאול אותו.', 'You have told them about your day. Now it is your turn to ask.'],
            options: [['phrase.past.what-did-you-do', true], ['phrase.past.it-was-good', false], ['phrase.past.i-went', false]] },
        ],
      },
      // The same story with another place, another bed, another verdict. Each language says it its own way.
      {
        kind: 'swap',
        label: ['איך היה אתמול?', 'How was yesterday?'],
        rounds: [
          ...([['market', '🧺', ['אתמול היית בשוק', 'Yesterday you were at the market']], ['beach', '🏖️', ['אתמול היית בים', 'Yesterday you were at the beach']]] as const).map(([right, emoji, cue]) => ({
            frame: ['I went to ___.', 'Je suis allé ___.', 'Fui ___.'] as const,
            itemId: 'phrase.past.i-went',
            cue: { emoji, text: cue },
            options: [
              [['the old town', 'dans la vieille ville', 'al casco antiguo'], 'הלכתי לעיר העתיקה.', false],
              [['the market', 'au marché', 'al mercado'], 'הלכתי לשוק.', right === 'market'],
              [['the beach', 'à la plage', 'a la playa'], 'הלכתי לים.', right === 'beach'],
            ] as const,
          })),
          {
            frame: ['I stayed in ___.', 'J’ai logé dans ___.', 'Me quedé en ___.'] as const,
            itemId: 'phrase.past.i-stayed',
            cue: { emoji: '🏨', text: ['ישנת במלון', 'You stayed in a hotel'] },
            options: [
              [['a hostel', 'une auberge', 'un hostal'], 'ישנתי בהוסטל.', false],
              [['a hotel', 'un hôtel', 'un hotel'], 'ישנתי במלון.', true],
            ] as const,
          },
          ...([['good', 'phrase.past.it-was-good', '🙂', ['היה בסדר, טוב', 'It was fine — good']], ['bad', 'phrase.past.it-was-bad', '😕', ['לא היה טוב', 'It was not good']]] as const).map(([right, itemId, emoji, cue]) => ({
            frame: ['It was ___.', 'C’était ___.', 'Estuvo ___.'] as const,
            itemId,
            cue: { emoji, text: cue },
            options: [
              [['great', 'super', 'genial'], 'היה מעולה.', false],
              [['good', 'bien', 'bien'], 'היה טוב.', right === 'good'],
              [['bad', 'mauvais', 'mal'], 'היה רע.', right === 'bad'],
            ] as const,
          })),
        ],
      },
      // Where you went — and the question that hands the conversation back.
      {
        kind: 'sentenceBuilder',
        rounds: [
          { itemId: 'phrase.past.i-went', chunks: [['I went', 'to', 'the old town.'], ['Je suis allé', 'dans', 'la vieille ville.'], ['Fui', 'al', 'casco antiguo.']] },
          { itemId: 'phrase.past.what-did-you-do', chunks: [['What', 'did you do', 'yesterday?'], ['Tu as fait', 'quoi', 'hier ?'], ['¿Qué', 'hiciste', 'ayer?']] },
        ],
      },
    ],
    review: [
      'phrase.past.i-went', 'phrase.past.i-saw', 'phrase.past.i-ate', 'phrase.past.i-stayed', 'phrase.past.it-was-great', 'phrase.past.it-was-good',
      'phrase.past.what-did-you-do',
      'reply.past.where-were-you', 'reply.past.what-did-you-see', 'reply.past.did-you-eat', 'reply.past.where-did-you-stay',
      'phrase.recovery.repeat',
    ],
    // The whole story at natural speed — your friend's own questions.
    finale: [{
      practice: {
        kind: 'quickReply',
        challenge: true,
        rounds: [
          { npc: ['Hey! Where were you yesterday?', 'Salut ! Tu étais où hier ?', '¡Hola! ¿Dónde estuviste ayer?', 'היי! איפה היית אתמול?'],
            options: [['phrase.past.i-went', true], ['phrase.past.i-stayed', false], ['phrase.past.it-was-great', false]] },
          { npc: ['Nice! What did you see?', 'Sympa ! Tu as vu quoi ?', '¡Qué bien! ¿Qué viste?', 'יפה! מה ראית?'],
            options: [['phrase.past.i-saw', true], ['phrase.past.i-ate', false], ['phrase.past.i-went', false]] },
          { npc: ['Did you eat there?', 'Tu as mangé là-bas ?', '¿Comiste allí?', 'אכלת שם?'],
            options: [['phrase.past.i-ate', true], ['phrase.past.i-saw', false], ['phrase.past.i-stayed', false]] },
          { npc: ['Did you like it?', 'Tu as aimé ?', '¿Te gustó?', 'אהבת?'],
            options: [['phrase.past.it-was-great', true], ['phrase.past.i-went', false], ['phrase.past.what-did-you-do', false]] },
          { npc: ['You were in Argentina last month, right? Where did you stay?', 'Tu étais en Argentine le mois dernier, non ? Tu as logé où ?', 'Estuviste en Argentina el mes pasado, ¿no? ¿Dónde te quedaste?', 'היית בארגנטינה בחודש שעבר, נכון? איפה ישנת?'],
            options: [['phrase.past.i-stayed', true], ['phrase.past.i-went', false], ['phrase.past.i-ate', false]] },
          { npc: ['A hostel! Was it good?', 'Une auberge ! C’était bien ?', '¡Un hostal! ¿Estuvo bien?', 'הוסטל! היה טוב?'],
            options: [
              ['phrase.past.what-did-you-do', true, ['It was good. And you? What did you do yesterday?', 'C’était bien. Et toi ? Tu as fait quoi hier ?', 'Estuvo bien. ¿Y tú? ¿Qué hiciste ayer?']],
              ['phrase.past.i-saw', false], ['phrase.past.i-ate', false],
            ] },
        ],
      },
      receipt: ['סיפרת סיפור קטן על אתמול — לאן הלכת, מה ראית, מה אכלת, איפה ישנת ואיך היה — ושאלת בחזרה.', 'You told a small story about yesterday — where you went, what you saw, what you ate, where you stayed and how it was — and asked back.'],
    }],
  },
};
