import { item, npc, you, type MissionSpec } from '../author.js';

/**
 * Home, Family & Daily Routine — a visit to a friend's home. Connects travel language to ordinary
 * life: going home, eating at grandmother's, being tired, going to sleep. No furniture or family
 * vocabulary lists — the "I'm going to ___" frame is the skill. Informal register (tu / tú).
 * AI linguistic review completed; native review still recommended.
 */
const BEAUTIFUL_HOME = item('phrase.home.beautiful-home', 'Your home is beautiful.', 'Ta maison est très belle.', 'Tu casa es preciosa.', 'הבית שלך יפהפה.');
const IS_THIS_NEW = item('phrase.home.is-this-new', 'Is this sofa new?', 'Ce canapé est nouveau ?', '¿Este sofá es nuevo?', 'הספה הזאת חדשה?',
  ['Is this ___ new? — מחליפים את החפץ.', 'Is this ___ new? — swap the object.']);
const WHERE_FAMILY = item('phrase.home.where-family', 'Where is your family?', 'Où est ta famille ?', '¿Dónde está tu familia?', 'איפה המשפחה שלך?',
  ['Where is ___? — אותה שאלה מהכיוונים, עכשיו על אנשים.', 'Where is ___? — the same question from Directions, now about people.']);
const LIVE_WITH = item('phrase.home.live-with-family', 'Yes, I live with my family.', 'Oui, j’habite avec ma famille.', 'Sí, vivo con mi familia.', 'כן, אני גר עם המשפחה שלי.');
const EAT_AT_GRANDMOTHERS = item('phrase.home.eat-at-grandmothers', "I'm going to eat at my grandmother's.", 'Je vais manger chez ma grand-mère.', 'Voy a comer en casa de mi abuela.', 'אני הולך לאכול אצל סבתא שלי.',
  ['I’m going to ___ — התבנית לכל מה שאתה עומד לעשות.', 'I’m going to ___ — the frame for anything you are about to do.']);
const IM_TIRED = item('phrase.home.im-tired', "I'm tired.", 'Je suis fatigué.', 'Estoy cansado.', 'אני עייף.');
const GOING_HOME = item('phrase.home.going-home', "I'm going home.", 'Je rentre chez moi.', 'Me voy a casa.', 'אני הולך הביתה.');
const GOING_TO_SLEEP = item('phrase.home.going-to-sleep', "I'm going to sleep.", 'Je vais dormir.', 'Me voy a dormir.', 'אני הולך לישון.');

export const HOME_FAMILY: MissionSpec = {
  day: 32,
  title: ['בית, משפחה ושגרה', 'Home, Family & Daily Routine'],
  icon: '🏠',
  intro: [
    ['חבר מזמין אותך אליו הביתה. לא מלון, לא מסעדה — חיים רגילים.', 'A friend invites you to their home. Not a hotel, not a restaurant — ordinary life.'],
    ['משפט אחד עושה כאן את רוב העבודה: I’m going to… — הביתה, לאכול, לישון.', 'One frame does most of the work here: I’m going to… — home, to eat, to sleep.'],
  ],
  cta: ['להיכנס', 'Come in'],
  scenes: [{
    id: 'at-a-friends-home',
    receipt: ['דיברת על בית, משפחה ועל מה שאתה עומד לעשות — בלי מילה אחת על תיירות.', 'You talked about home, family and what you are about to do — without a single tourist word.'],
    lines: [
      npc('Hi! Come in.', 'Salut ! Entre.', '¡Hola! Pasa.', 'היי! תיכנס.'),
      you(BEAUTIFUL_HOME, { say: ['Thanks. Your home is beautiful.', 'Merci. Ta maison est très belle.', 'Gracias. Tu casa es preciosa.', 'תודה. הבית שלך יפהפה.'] }),
      npc("Thank you. Let's sit in the living room.", 'Merci. On s’assoit dans le salon.', 'Gracias. Vamos a sentarnos en el salón.', 'תודה. בוא נשב בסלון.'),
      you(IS_THIS_NEW),
      npc("Yes, it's new.", 'Oui, il est nouveau.', 'Sí, es nuevo.', 'כן, היא חדשה.'),
      you(WHERE_FAMILY),
      npc('My mother is in the kitchen. Do you live with your family?', 'Ma mère est dans la cuisine. Tu habites avec ta famille ?', 'Mi madre está en la cocina. ¿Vives con tu familia?', 'אמא שלי במטבח. אתה גר עם המשפחה שלך?', 'fast'),
      you(LIVE_WITH, {
        rec: { tool: 'dont-understand', npc: ['You — and your family. One home?', 'Toi — et ta famille. La même maison ?', 'Tú — y tu familia. ¿La misma casa?', 'אתה — והמשפחה שלך. אותו בית?'] },
      }),
      npc('Nice. Are you hungry? Do you want to eat with us?', 'Super. Tu as faim ? Tu veux manger avec nous ?', 'Qué bien. ¿Tienes hambre? ¿Quieres comer con nosotros?', 'יפה. אתה רעב? רוצה לאכול איתנו?'),
      you(EAT_AT_GRANDMOTHERS, { say: ["Thanks, but I'm going to eat at my grandmother's.", 'Merci, mais je vais manger chez ma grand-mère.', 'Gracias, pero voy a comer en casa de mi abuela.', 'תודה, אבל אני הולך לאכול אצל סבתא שלי.'] }),
      npc('Lovely! You look tired. Are you okay?', 'C’est bien ! Tu as l’air fatigué. Ça va ?', '¡Qué bien! Pareces cansado. ¿Estás bien?', 'איזה יופי! אתה נראה עייף. הכל בסדר?'),
      you(IM_TIRED, { say: ["Yes, I'm just tired.", 'Oui, je suis juste fatigué.', 'Sí, solo estoy cansado.', 'כן, אני רק עייף.'] }),
      npc('Then go home and rest!', 'Alors rentre chez toi et repose-toi !', '¡Entonces vete a casa y descansa!', 'אז לך הביתה ותנוח!'),
      you(GOING_HOME, { say: ["Yes, I'm going home.", 'Oui, je rentre chez moi.', 'Sí, me voy a casa.', 'כן, אני הולך הביתה.'] }),
      npc("And after dinner at your grandmother's?", 'Et après le dîner chez ta grand-mère ?', '¿Y después de la cena en casa de tu abuela?', 'ואחרי הארוחה אצל סבתא?'),
      you(GOING_TO_SLEEP),
      npc('Ha! Good night. Say hi to your family!', 'Ha ! Bonne nuit. Dis bonjour à ta famille !', '¡Ja! Buenas noches. ¡Saluda a tu familia!', 'חה! לילה טוב. תמסור ד״ש למשפחה!'),
    ],
  }],
  hear: [
    item('reply.home.come-in', 'Come in.', 'Entre.', 'Pasa.', 'תיכנס.'),
    item('reply.home.sit-living-room', "Let's sit in the living room.", 'On s’assoit dans le salon.', 'Vamos a sentarnos en el salón.', 'בוא נשב בסלון.'),
    item('reply.home.live-with-family-q', 'Do you live with your family?', 'Tu habites avec ta famille ?', '¿Vives con tu familia?', 'אתה גר עם המשפחה שלך?'),
    item('reply.home.are-you-hungry', 'Are you hungry?', 'Tu as faim ?', '¿Tienes hambre?', 'אתה רעב?'),
    item('reply.home.eat-with-us', 'Do you want to eat with us?', 'Tu veux manger avec nous ?', '¿Quieres comer con nosotros?', 'רוצה לאכול איתנו?'),
  ],
  teach: {
    tools: [
      { id: 'phrase.home.eat-at-grandmothers', label: ['אני הולך ל…', "I'm going to…"] },
      { id: 'phrase.home.going-home', label: ['הביתה', 'Home'] },
      { id: 'phrase.home.im-tired', label: ['איך אני מרגיש', 'How I feel'] },
      { id: 'phrase.home.going-to-sleep', label: ['לישון', 'To sleep'] },
      { id: 'phrase.home.where-family', label: ['איפה…?', 'Where is…?'] },
      { id: 'phrase.home.beautiful-home', label: ['מחמאה', 'A compliment'] },
    ],
    said: 'phrase.home.beautiful-home',
    replies: ['reply.home.come-in', 'reply.home.sit-living-room', 'reply.home.are-you-hungry', 'reply.home.live-with-family-q'],
    repliesReceipt: ['אתה מבין כשמזמינים אותך להיכנס, לשבת ולאכול.', 'You understand when someone invites you in, to sit, and to eat.'],
    quiz: ['reply.home.are-you-hungry', 'reply.home.sit-living-room', 'reply.home.eat-with-us'],
    ambush: {
      npc: ['Come in come in let us sit in the living room it is warmer there', 'Entre, entre, on s’assoit dans le salon, il y fait plus chaud', 'Pasa, pasa, vamos a sentarnos en el salón, que hace más calor', 'תיכנס, תיכנס, בוא נשב בסלון, יותר חם שם'],
      correct: 'reply.home.sit-living-room',
      wrong: 'reply.home.are-you-hungry',
      receipt: ['מהר וחם — והבנת שמזמינים אותך לשבת.', 'Fast and warm — and you understood you were being invited to sit.'],
    },
  },
};
