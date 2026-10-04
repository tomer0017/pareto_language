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
    repliesReceipt: ['אתה מזהה שאלה על העבר — גם בלי להבין כל מילה.', 'You recognize a question about the past — even without catching every word.'],
    quiz: ['reply.past.where-did-you-stay', 'reply.past.where-were-you', 'reply.past.did-you-like'],
    ambush: {
      npc: ['Wait so when you were in Argentina where did you stay was it a hotel?', 'Attends, quand tu étais en Argentine, tu as logé où, à l’hôtel ?', 'Espera, cuando estuviste en Argentina, ¿dónde te quedaste, en un hotel?', 'רגע, כשהיית בארגנטינה — איפה ישנת, במלון?'],
      correct: 'reply.past.where-did-you-stay',
      wrong: 'reply.past.did-you-eat',
      receipt: ['"איפה ישנת בארגנטינה?" — מהר, ובאמצע משפט. הבנת.', '"Where did you stay in Argentina?" — fast, mid-sentence. You got it.'],
    },
  },
};
