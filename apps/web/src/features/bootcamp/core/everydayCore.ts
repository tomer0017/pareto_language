import { item, npc, tool, you, type MissionSpec } from '../author.js';

/**
 * Everyday Core — want / need / have / can / know. The sentence machinery of the whole course:
 * the nouns are deliberately tiny (coffee, towel, key, map) because the FRAMES are the skill.
 * Two short scenes instead of one long interview: practical needs at a hostel desk (polite
 * register), then a friend offering coffee and dinner (informal register).
 * AI linguistic review completed; native review still recommended.
 */
const WANT = item('phrase.core.i-want', 'Yes, I want a coffee.', 'Oui, je veux un café.', 'Sí, quiero un café.', 'כן, אני רוצה קפה.',
  ['התבנית: I want ___. מחליפים רק את המילה האחרונה.', 'The frame: I want ___. Only the last word changes.']);
const NEED = item('phrase.core.i-need', 'I need a towel.', 'J’ai besoin d’une serviette.', 'Necesito una toalla.', 'אני צריך מגבת.',
  ['I need ___ — לכל דבר שחסר לך.', 'I need ___ — for anything you are missing.']);
const HAVE = item('phrase.core.i-have', 'Yes, I have my key.', 'Oui, j’ai ma clé.', 'Sí, tengo mi llave.', 'כן, יש לי את המפתח.');
const DONT_HAVE = item('phrase.core.i-dont-have', "I don't have it.", 'Je ne l’ai pas.', 'No la tengo.', 'אין לי אותה.',
  ['I don’t have ___ — ההפך מ-I have. מילה אחת משנה הכל.', 'I don’t have ___ — the opposite of I have. One word changes everything.']);
const DONT_KNOW = item('phrase.core.i-dont-know', "I don't know.", 'Je ne sais pas.', 'No lo sé.', 'אני לא יודע.',
  ['תשובה לגיטימית לגמרי. לא יודע — אומרים.', 'A perfectly good answer. If you don’t know, say so.']);
const KNOW = item('phrase.core.i-know', 'Yes, I know.', 'Oui, je sais.', 'Sí, lo sé.', 'כן, אני יודע.');
const CAN = item('phrase.core.i-can', 'I can walk.', 'Je peux y aller à pied.', 'Puedo ir a pie.', 'אני יכול ללכת ברגל.');
const CANT = item('phrase.core.i-cant', "Sorry, I can't.", 'Désolé, je ne peux pas.', 'Lo siento, no puedo.', 'סליחה, אני לא יכול.');
const DO_YOU_HAVE = item('phrase.core.do-you-have', 'Do you have a map?', 'Vous avez une carte ?', '¿Tiene un mapa?', 'יש לך מפה?',
  ['Do you have ___? — עובד בכל חנות, מלון ומסעדה.', 'Do you have ___? — works in every shop, hotel and restaurant.']);
const CAN_YOU_HELP = item('phrase.core.can-you-help', 'Can you help me?', 'Vous pouvez m’aider ?', '¿Me puede ayudar?', 'אתה יכול לעזור לי?',
  ['Can you ___? — הדרך לבקש כל דבר.', 'Can you ___? — the way to ask for anything.']);

export const EVERYDAY_CORE: MissionSpec = {
  day: 30,
  title: ['רוצה, צריך, יש לי, יכול', 'Everyday Core: Want / Need / Have / Can'],
  icon: '🧩',
  intro: [
    ['חמש מילים קטנות בונות מאות משפטים: רוצה, צריך, יש לי, יכול, יודע.', 'Five small words build hundreds of sentences: want, need, have, can, know.'],
    ['שתי שיחות קצרות — בדלפק ההוסטל ועם חבר — ואתה משתמש בכולן. מחליפים רק את המילה האחרונה.', 'Two short conversations — at the hostel desk and with a friend — and you use them all. Only the last word changes.'],
  ],
  cta: ['להתחיל', 'Start'],
  scenes: [
    {
      id: 'hostel-desk',
      receipt: ['אמרת מה אתה צריך, מה יש לך ומה אין — וביקשת עזרה.', 'You said what you need, what you have and what you don’t — and asked for help.'],
      lines: [
        npc('Hi! Do you need anything?', 'Bonjour ! Vous avez besoin de quelque chose ?', '¡Hola! ¿Necesita algo?', 'שלום! אתה צריך משהו?'),
        you(NEED),
        npc('Sure. Do you have your key?', 'Bien sûr. Vous avez votre clé ?', 'Claro. ¿Tiene su llave?', 'בטח. יש לך את המפתח?'),
        you(HAVE),
        npc('And the wifi password?', 'Et le mot de passe du wifi ?', '¿Y la contraseña del wifi?', 'והסיסמה של הוויי-פיי?'),
        you(DONT_HAVE),
        npc("It's here.", 'Il est ici.', 'Está aquí.', 'היא כאן.'),
        you(DO_YOU_HAVE),
        npc('Yes.', 'Oui.', 'Sí.', 'כן.'),
        you(tool('show-me')),
        npc('Of course.', 'Bien sûr.', 'Claro.', 'בטח.'),
      ],
    },
    {
      id: 'coffee-with-a-friend',
      receipt: ['אמרת מה אתה רוצה, מה אתה יודע ומה אתה יכול — בשיחה עם חבר.', 'You said what you want, what you know and what you can do — in a chat with a friend.'],
      lines: [
        npc('Do you want a coffee?', 'Tu veux un café ?', '¿Quieres un café?', 'רוצה קפה?'),
        you(WANT),
        npc('Do you know how to get to the centre?', 'Tu sais comment aller au centre ?', '¿Sabes cómo ir al centro?', 'אתה יודע איך להגיע למרכז?', 'fast'),
        you(DONT_KNOW, {
          rec: { tool: 'slowly', npc: ['The centre. Do you know — the way?', 'Le centre. Tu connais — le chemin ?', 'El centro. ¿Sabes — el camino?', 'המרכז. אתה יודע — את הדרך?'] },
        }),
        npc("You can walk. It's about twenty minutes.", 'Tu peux y aller à pied. C’est à environ vingt minutes.', 'Puedes ir a pie. Son unos veinte minutos.', 'אתה יכול ללכת ברגל. זה בערך עשרים דקות.'),
        you(CAN),
        npc("We're having dinner at seven. Can you come?", 'On dîne à sept heures. Tu peux venir ?', 'Cenamos a las siete. ¿Puedes venir?', 'אנחנו אוכלים ארוחת ערב בשבע. אתה יכול לבוא?'),
        you(CANT),
        npc('No problem.', 'Pas de problème.', 'No pasa nada.', 'אין בעיה.'),
      ],
    },
  ],
  extra: [KNOW, CAN_YOU_HELP],
  hear: [
    item('reply.core.do-you-want', 'Do you want a coffee?', 'Tu veux un café ?', '¿Quieres un café?', 'רוצה קפה?'),
    item('reply.core.need-anything', 'Do you need anything?', 'Vous avez besoin de quelque chose ?', '¿Necesita algo?', 'אתה צריך משהו?'),
    item('reply.core.have-your-key', 'Do you have your key?', 'Vous avez votre clé ?', '¿Tiene su llave?', 'יש לך את המפתח?'),
    item('reply.core.do-you-know', 'Do you know how to get to the centre?', 'Tu sais comment aller au centre ?', '¿Sabes cómo ir al centro?', 'אתה יודע איך להגיע למרכז?'),
    item('reply.core.can-you-come', 'Can you come?', 'Tu peux venir ?', '¿Puedes venir?', 'אתה יכול לבוא?'),
    item('reply.core.you-can-walk', 'You can walk.', 'Tu peux y aller à pied.', 'Puedes ir a pie.', 'אתה יכול ללכת ברגל.'),
  ],
  teach: {
    prime: {
      intro: ['חמשת הפעלים שמניעים כל שיחה. אחריהם בא רק מה שאתה רוצה לומר.', 'The five verbs that drive every conversation. After them comes only what you want to say.'],
      words: [
        { key: 'core.want', t: ['want', 'je veux', 'quiero'], meaning: ['רוצה', 'I want'], emoji: '🙋' },
        { key: 'core.need', t: ['need', 'j’ai besoin de', 'necesito'], meaning: ['צריך', 'I need'], emoji: '❗' },
        { key: 'core.have', t: ['have', 'j’ai', 'tengo'], meaning: ['יש לי', 'I have'], emoji: '🤲' },
        { key: 'core.can', t: ['can', 'je peux', 'puedo'], meaning: ['יכול', 'I can'], emoji: '💪' },
        { key: 'core.know', t: ['know', 'je sais', 'sé'], meaning: ['יודע', 'I know'], emoji: '💡' },
      ],
      build: 'phrase.core.i-need',
    },
    tools: [
      { id: 'phrase.core.i-want', label: ['רוצה', 'Want'] },
      { id: 'phrase.core.i-need', label: ['צריך', 'Need'] },
      { id: 'phrase.core.i-dont-have', label: ['אין לי', "Don't have"] },
      { id: 'phrase.core.i-cant', label: ['לא יכול', "Can't"] },
      { id: 'phrase.core.do-you-have', label: ['לשאול אם יש', 'Ask if they have it'] },
      { id: 'phrase.core.can-you-help', label: ['לבקש עזרה', 'Ask for help'] },
    ],
    said: 'phrase.core.i-need',
    replies: ['reply.core.need-anything', 'reply.core.have-your-key', 'reply.core.do-you-know', 'reply.core.can-you-come'],
    repliesReceipt: ['אתה מזהה את ארבע השאלות הכי נפוצות: רוצה? צריך? יש לך? יכול?', 'You recognize the four most common questions: want? need? have? can?'],
    // Practice V1: the frames are drilled as ENGINES (Swap It), then as reactions (Quick Reply) —
    // in place of a second hear-and-translate quiz.
    practice: [
      {
        kind: 'swap',
        rounds: [
          { frame: ['I need ___.', 'J’ai besoin ___.', 'Necesito ___.'], itemId: 'phrase.core.i-need', cue: { emoji: '💧', text: ['אתה צמא — צריך מים', 'You are thirsty — you need water'] },
            options: [[['water', 'd’eau', 'agua'], 'אני צריך מים.', true], [['a towel', 'd’une serviette', 'una toalla'], 'אני צריך מגבת.', false], [['my key', 'de ma clé', 'mi llave'], 'אני צריך את המפתח שלי.', false]] },
          { frame: ['I need ___.', 'J’ai besoin ___.', 'Necesito ___.'], itemId: 'phrase.core.i-need', cue: { emoji: '🆘', text: ['אתה צריך עזרה', 'You need help'] },
            options: [[['help', 'd’aide', 'ayuda'], 'אני צריך עזרה.', true], [['a coffee', 'd’un café', 'un café'], 'אני צריך קפה.', false], [['a map', 'd’une carte', 'un mapa'], 'אני צריך מפה.', false]] },
          { frame: ['I have ___.', 'J’ai ___.', 'Tengo ___.'], itemId: 'phrase.core.i-have', cue: { emoji: '📱', text: ['הטלפון אצלך', 'Your phone is with you'] },
            options: [[['my phone', 'mon téléphone', 'mi teléfono'], 'יש לי את הטלפון שלי.', true], [['a map', 'une carte', 'un mapa'], 'יש לי מפה.', false], [['my key', 'ma clé', 'mi llave'], 'יש לי את המפתח שלי.', false]] },
          { frame: ["I don't have ___.", 'Je n’ai pas ___.', 'No tengo ___.'], itemId: 'phrase.core.i-dont-have', cue: { emoji: '🗺️', text: ['אין לך מפה', 'You have no map'] },
            options: [[['a map', 'de carte', 'mapa'], 'אין לי מפה.', true], [['my key', 'ma clé', 'mi llave'], 'אין לי את המפתח שלי.', false], [['my phone', 'mon téléphone', 'mi teléfono'], 'אין לי את הטלפון שלי.', false]] },
          { frame: ['I want ___.', 'Je veux ___.', 'Quiero ___.'], itemId: 'phrase.core.i-want', cue: { emoji: '☕', text: ['אתה רוצה קפה', 'You want a coffee'] },
            options: [[['a coffee', 'un café', 'un café'], 'אני רוצה קפה.', true], [['water', 'de l’eau', 'agua'], 'אני רוצה מים.', false], [['a towel', 'une serviette', 'una toalla'], 'אני רוצה מגבת.', false]] },
          { frame: ['I can ___.', 'Je peux ___.', 'Puedo ___.'], itemId: 'phrase.core.i-can', cue: { emoji: '🤝', text: ['אתה יכול לעזור', 'You can help'] },
            options: [[['help', 'aider', 'ayudar'], 'אני יכול לעזור.', true], [['walk', 'y aller à pied', 'ir a pie'], 'אני יכול ללכת ברגל.', false], [['come', 'venir', 'venir'], 'אני יכול לבוא.', false]] },
          { frame: ["I can't ___.", 'Je ne peux pas ___.', 'No puedo ___.'], itemId: 'phrase.core.i-cant', cue: { emoji: '🚫', text: ['אתה לא יכול לבוא', 'You cannot come'] },
            options: [[['come', 'venir', 'venir'], 'אני לא יכול לבוא.', true], [['walk', 'y aller à pied', 'ir a pie'], 'אני לא יכול ללכת ברגל.', false], [['help', 'aider', 'ayudar'], 'אני לא יכול לעזור.', false]] },
        ],
      },
      {
        kind: 'quickReply',
        rounds: [
          { prompt: 'reply.core.need-anything', options: [['phrase.core.i-need', true], ['phrase.core.i-know', false], ['phrase.core.i-cant', false]] },
          { prompt: 'reply.core.have-your-key', options: [['phrase.core.i-have', true], ['phrase.core.i-dont-know', false], ['phrase.core.i-want', false]] },
          { prompt: 'reply.core.do-you-know', options: [['phrase.core.i-dont-know', true], ['phrase.core.i-know', true], ['phrase.core.i-have', false]] },
          { prompt: 'reply.core.can-you-come', options: [['phrase.core.i-cant', true], ['phrase.core.i-need', false], ['phrase.core.i-have', false]] },
          { situation: ['התיק כבד מדי ואתה צריך יד.', 'Your bag is too heavy and you need a hand.'],
            options: [['phrase.core.can-you-help', true], ['phrase.core.i-can', false], ['phrase.core.i-know', false]] },
        ],
      },
    ],
    review: [
      'phrase.core.i-want', 'phrase.core.i-need', 'phrase.core.i-have', 'phrase.core.i-dont-have', 'phrase.core.i-dont-know',
      'phrase.core.i-can', 'phrase.core.i-cant', 'phrase.core.do-you-have', 'phrase.core.can-you-help',
      'reply.core.need-anything', 'reply.core.have-your-key', 'reply.core.do-you-know', 'reply.core.can-you-come',
      'phrase.recovery.show-me',
    ],
    ambush: {
      mode: 'speed',
      npc: ['Before you go out do you have your key with you or is it still in the room?', 'Avant de sortir, vous avez votre clé sur vous ou elle est encore dans la chambre ?', 'Antes de salir, ¿tiene su llave encima o sigue en la habitación?', 'לפני שאתה יוצא — המפתח עליך או שהוא עדיין בחדר?'],
      correct: 'reply.core.have-your-key',
      wrong: 'reply.core.can-you-come',
      receipt: ['משפט ארוך ומהיר — ותפסת את השאלה שבפנים: יש לך את המפתח?', 'A long, fast sentence — and you caught the question inside it: do you have your key?'],
    },
  },
};
