import { item, npc, tool, you, type MissionSpec } from '../author.js';
import { m04Steps } from '../practiceV1.js';

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
  // The Mission 04 pass: a hand-built journey (practiceV1.ts — m04Steps) — teach before test.
  steps: m04Steps,
  numbered: true,
  hear: [
    item('reply.core.do-you-want', 'Do you want a coffee?', 'Tu veux un café ?', '¿Quieres un café?', 'רוצה קפה?'),
    item('reply.core.need-anything', 'Do you need anything?', 'Vous avez besoin de quelque chose ?', '¿Necesita algo?', 'אתה צריך משהו?'),
    item('reply.core.have-your-key', 'Do you have your key?', 'Vous avez votre clé ?', '¿Tiene su llave?', 'יש לך את המפתח?'),
    item('reply.core.do-you-know', 'Do you know how to get to the centre?', 'Tu sais comment aller au centre ?', '¿Sabes cómo ir al centro?', 'אתה יודע איך להגיע למרכז?'),
    item('reply.core.can-you-come', 'Can you come?', 'Tu peux venir ?', '¿Puedes venir?', 'אתה יכול לבוא?'),
    item('reply.core.you-can-walk', 'You can walk.', 'Tu peux y aller à pied.', 'Puedes ir a pie.', 'אתה יכול ללכת ברגל.'),
    item('reply.core.wifi', 'And the wifi password?', 'Et le mot de passe du wifi ?', '¿Y la contraseña del wifi?', 'והסיסמה של הוויי-פיי?'),
  ],
};
