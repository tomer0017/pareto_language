import { fromItems, item, npc, you, type MissionSpec } from '../author.js';
import { DAY1_ITEMS } from '../day1.js';
import { DAY12_ITEMS } from '../day12.js';
import { DAY1_FR_ITEMS } from '../fr/day1.js';
import { DAY12_FR_ITEMS } from '../fr/day12.js';
import { DAY1_ES_ITEMS } from '../es/day1.js';
import { DAY12_ES_ITEMS } from '../es/day12.js';

/**
 * Small Talk & Recommendations — a short, coherent chat with a local at a viewpoint: where are you
 * from, first time here, do you like it, what do you recommend, nice talking to you. Every answer
 * now matches the question it follows (the previous version answered "Where are you from?" with
 * "This place is beautiful."). Sentence ids are unchanged, so earlier practice still counts.
 * Polite register (vous / usted) — a stranger. AI linguistic review completed; native review still recommended.
 */
const intro = (id: string) => fromItems(id, DAY1_ITEMS, DAY1_FR_ITEMS, DAY1_ES_ITEMS);

const BEAUTIFUL = item('phrase.talk.beautiful-place', 'This place is beautiful.', 'Cet endroit est magnifique.', 'Este lugar es precioso.', 'המקום הזה יפהפה.',
  ['מחמאה למקום פותחת כל שיחה.', 'A compliment about the place opens any conversation.']);
const HOW_ABOUT_YOU = item('phrase.talk.how-about-you', 'How about you?', 'Et vous ?', '¿Y usted?', 'ואתה?',
  ['להחזיר את השאלה — וכבר יש שיחה.', 'Return the question — and you have a conversation.']);
const I_LIKE_IT = item('phrase.talk.i-like-it', 'I like it a lot.', 'J’aime beaucoup.', 'Me gusta mucho.', 'אני מאוד אוהב.');
const LOVE_FOOD = item('phrase.talk.love-food', 'I love the food here.', 'J’adore la nourriture ici.', 'Me encanta la comida de aquí.', 'אני אוהב את האוכל כאן.');
const RECOMMEND = item('phrase.talk.recommend-place', 'Can you recommend a place?', 'Vous pouvez recommander un endroit ?', '¿Me puede recomendar un sitio?', 'אתה יכול להמליץ על מקום?',
  ['מקומיים יודעים הכי טוב. תשאל.', 'Locals know best. Ask.']);
const WHAT_RECOMMEND = fromItems('phrase.rest.recommend', DAY12_ITEMS, DAY12_FR_ITEMS, DAY12_ES_ITEMS);
const NICE_TALKING = item('phrase.talk.nice-talking', 'It was nice talking to you.', 'C’était sympa de discuter avec vous.', 'Ha sido un placer hablar con usted.', 'היה נעים לדבר איתך.');

export const SMALL_TALK: MissionSpec = {
  day: 22,
  title: ['שיחת חולין והמלצות', 'Small Talk & Recommendations'],
  icon: '💬',
  intro: [
    ['שלוש דקות עם מקומי בנקודת תצפית. לא עסקה — שיחה.', 'Three minutes with a local at a viewpoint. Not a transaction — a conversation.'],
    ['מאיפה אתה, פעם ראשונה כאן, מה מומלץ. ותמיד מחזירים שאלה.', 'Where you are from, first time here, what to try. And always return the question.'],
  ],
  cta: ['לפתוח שיחה', 'Start a chat'],
  scenes: [{
    id: 'small-talk',
    receipt: ['שיחה שלמה עם זר: מאיפה, פעם ראשונה, מה אהבת, המלצה ופרידה.', 'A whole chat with a stranger: where from, first time, what you like, a recommendation and a goodbye.'],
    lines: [
      npc("Hi! Beautiful view, isn't it?", 'Bonjour ! Belle vue, n’est-ce pas ?', '¡Hola! Bonita vista, ¿verdad?', 'היי! נוף יפה, נכון?'),
      you(BEAUTIFUL),
      npc('It really is. Where are you from?', 'C’est vrai. Vous venez d’où ?', 'Es verdad. ¿De dónde es?', 'באמת. מאיפה אתה?'),
      you(HOW_ABOUT_YOU, { say: ["I'm from Israel. How about you?", 'Je viens d’Israël. Et vous ?', 'Soy de Israel. ¿Y usted?', 'אני מישראל. ואתה?'] }),
      npc("I'm from here! Is this your first time here?", 'Je suis d’ici ! C’est votre première fois ici ?', '¡Soy de aquí! ¿Es su primera vez aquí?', 'אני מכאן! זו הפעם הראשונה שלך כאן?', 'fast'),
      you(intro('phrase.social.first-time'), {
        say: ["Yes, it's my first time here.", 'Oui, c’est ma première fois ici.', 'Sí, es mi primera vez aquí.', 'כן, זו הפעם הראשונה שלי כאן.'],
        rec: { tool: 'repeat', npc: ['Your first time — here?', 'Votre première fois — ici ?', '¿Su primera vez — aquí?', 'הפעם הראשונה שלך — כאן?'] },
      }),
      npc('Welcome! Do you like it here?', 'Bienvenue ! Ça vous plaît ici ?', '¡Bienvenido! ¿Le gusta este lugar?', 'ברוך הבא! אתה אוהב את המקום?'),
      you(I_LIKE_IT, { say: ['Yes, I like it a lot.', 'Oui, j’aime beaucoup.', 'Sí, me gusta mucho.', 'כן, אני מאוד אוהב.'], alts: [LOVE_FOOD] }),
      npc('Me too. And the food here is wonderful.', 'Moi aussi. Et la cuisine ici est excellente.', 'Yo también. Y la comida de aquí es estupenda.', 'גם אני. והאוכל כאן נהדר.'),
      you(RECOMMEND, { alts: [WHAT_RECOMMEND] }),
      npc("Of course — try 'Mama Rosa', in the old town. It's very good.", 'Bien sûr — essayez « Mama Rosa », dans la vieille ville. C’est très bon.', 'Claro — pruebe «Mama Rosa», en el casco antiguo. Es muy bueno.', "בטח — תנסה את 'מאמא רוזה', בעיר העתיקה. מאוד טוב שם."),
      you(NICE_TALKING, { say: ['Thank you! It was nice talking to you.', 'Merci ! C’était sympa de discuter avec vous.', '¡Gracias! Ha sido un placer hablar con usted.', 'תודה! היה נעים לדבר איתך.'] }),
      npc('You too! Enjoy the rest of your trip!', 'Vous aussi ! Profitez bien du reste de votre voyage !', '¡Igualmente! ¡Que disfrute del resto del viaje!', 'גם לי! תיהנה משאר הטיול!'),
    ],
  }],
  extra: [intro('phrase.social.from-israel')],
  hear: [
    item('reply.talk.first-time-q', 'Is this your first time here?', 'C’est votre première fois ici ?', '¿Es su primera vez aquí?', 'זו הפעם הראשונה שלך כאן?'),
    item('reply.talk.where-from', 'Where are you from?', 'Vous venez d’où ?', '¿De dónde es?', 'מאיפה אתה?'),
    item('reply.talk.do-you-like-it', 'Do you like it here?', 'Ça vous plaît ici ?', '¿Le gusta este lugar?', 'אתה אוהב את המקום?'),
    item('reply.talk.you-should-try', 'You should try the old town.', 'Vous devriez essayer la vieille ville.', 'Debería visitar el casco antiguo.', 'כדאי לך לנסות את העיר העתיקה.'),
    item('reply.talk.how-long-here', 'How long are you here for?', 'Vous êtes ici pour combien de temps ?', '¿Cuánto tiempo está aquí?', 'לכמה זמן אתה כאן?'),
    item('reply.talk.enjoy-rest', 'Enjoy the rest of your trip!', 'Profitez bien du reste de votre voyage !', '¡Que disfrute del resto del viaje!', 'תיהנה משאר הטיול!'),
    item('reply.talk.me-too', 'Me too!', 'Moi aussi !', '¡Yo también!', 'גם אני!'),
  ],
  teach: {
    tools: [
      { id: 'phrase.talk.beautiful-place', label: ['לפתוח', 'Open'] },
      { id: 'phrase.talk.how-about-you', label: ['להחזיר שאלה', 'Return the question'] },
      { id: 'phrase.talk.i-like-it', label: ['אני אוהב', 'I like'] },
      { id: 'phrase.talk.recommend-place', label: ['לבקש המלצה', 'Ask for a tip'] },
      { id: 'phrase.talk.nice-talking', label: ['להיפרד יפה', 'Close warmly'] },
    ],
    said: 'phrase.talk.beautiful-place',
    replies: ['reply.talk.where-from', 'reply.talk.first-time-q', 'reply.talk.do-you-like-it', 'reply.talk.you-should-try'],
    repliesReceipt: ['אתה מזהה את השאלות שזרים שואלים — מאיפה, פעם ראשונה, אוהב?', 'You recognize what strangers ask — where from, first time, do you like it?'],
    quiz: ['reply.talk.how-long-here', 'reply.talk.where-from', 'reply.talk.enjoy-rest'],
    ambush: {
      npc: ['Oh nice so how long are you here for just a few days or longer?', 'Ah, sympa ! Et vous êtes ici pour combien de temps, quelques jours ou plus ?', '¡Ah, qué bien! ¿Y cuánto tiempo está aquí, unos días o más?', 'אה, יפה! ולכמה זמן אתה כאן — כמה ימים או יותר?'],
      correct: 'reply.talk.how-long-here',
      wrong: 'reply.talk.me-too',
      receipt: ['שאלת המשך מהירה — והבנת ששואלים לכמה זמן אתה כאן.', 'A fast follow-up — and you understood you were asked how long you are staying.'],
    },
  },
};
