import { fromItems, item, itemOf, npc, you, type MissionSpec } from '../author.js';
import { DAY11_ITEMS } from '../day11.js';
import { DAY11_FR_ITEMS } from '../fr/day11.js';
import { DAY11_ES_ITEMS } from '../es/day11.js';
import { EVERYDAY_CORE } from './everydayCore.js';

/**
 * Fixing Problems — ONE general problem-solving mission, in two short scenes: a restaurant (wrong
 * dish, charged twice) and a hotel desk (something isn't working, a noisy room, changing rooms).
 * It merges the old Fixing Problems mission with the reusable part of Hotel Requests & Problems;
 * the frames are what transfer ("X isn't working", "Can you fix it?", "Can I change ___?").
 * Polite register (vous / usted). AI linguistic review completed; native review still recommended.
 */
const hotel = (id: string) => fromItems(id, DAY11_ITEMS, DAY11_FR_ITEMS, DAY11_ES_ITEMS);

const NOT_ORDERED = item('phrase.fix.not-ordered', "This isn't what I ordered.", 'Ce n’est pas ce que j’ai commandé.', 'Esto no es lo que pedí.', 'זה לא מה שהזמנתי.',
  ['רגוע וברור. לא צריך להתנצל.', 'Calm and clear. No need to apologize.']);
const I_ORDERED = item('phrase.fix.i-ordered', 'I ordered the pasta.', 'J’ai commandé les pâtes.', 'Pedí la pasta.', 'הזמנתי את הפסטה.');
const MISTAKE = item('phrase.fix.theres-mistake', "I think there's a mistake.", 'Je crois qu’il y a une erreur.', 'Creo que hay un error.', 'אני חושב שיש טעות.');
const CHARGED_TWICE = item('phrase.fix.charged-twice', 'I was charged twice.', 'On m’a facturé deux fois.', 'Me han cobrado dos veces.', 'חייבו אותי פעמיים.');
const NO_PROBLEM = item('phrase.fix.no-problem-thanks', 'No problem, thank you.', 'Pas de problème, merci.', 'No pasa nada, gracias.', 'אין בעיה, תודה.');
const THERES_PROBLEM = item('phrase.fix.theres-problem', "There's a problem with my room.", 'Il y a un problème avec ma chambre.', 'Hay un problema con mi habitación.', 'יש בעיה בחדר שלי.',
  ['There’s a problem with ___ — פותח כל תלונה בנימוס.', 'There’s a problem with ___ — opens any complaint politely.']);
const CAN_YOU_FIX = item('phrase.fix.can-you-fix', 'Can you fix it?', 'Vous pouvez arranger ça ?', '¿Lo puede arreglar?', 'אפשר לתקן את זה?');
const CHANGE_ROOMS = item('phrase.fix.change-rooms', 'Can I change rooms?', 'Je peux changer de chambre ?', '¿Puedo cambiar de habitación?', 'אפשר להחליף חדר?');

export const FIXING_PROBLEMS: MissionSpec = {
  day: 24,
  title: ['לתקן בעיה', 'Fixing Problems'],
  icon: '🛠️',
  intro: [
    ['מנה לא נכונה, חיוב כפול, מזגן שלא עובד, חדר רועש. דברים משתבשים.', 'The wrong dish, a double charge, a broken air conditioner, a noisy room. Things go wrong.'],
    ['התבנית תמיד זהה: מה הבעיה — ומה אתה מבקש.', 'The pattern is always the same: what the problem is — and what you are asking for.'],
  ],
  cta: ['לפתור את זה', 'Sort it out'],
  scenes: [
    {
      id: 'fixing-problems',
      receipt: ['מנה שגויה וחיוב כפול — ושניהם תוקנו. בנימוס.', 'A wrong dish and a double charge — both fixed. Politely.'],
      lines: [
        npc("Here's your meal — one steak!", 'Voici votre plat — un steak !', 'Aquí tiene su plato — ¡un filete!', 'הנה הארוחה שלך — סטייק אחד!'),
        you(NOT_ORDERED),
        npc("Oh no, I'm so sorry! What did you order?", 'Oh non, je suis vraiment désolé ! Qu’avez-vous commandé ?', '¡Ay, lo siento muchísimo! ¿Qué pidió?', 'אוי לא, אני מצטער מאוד! מה הזמנת?'),
        you(I_ORDERED),
        npc("Of course — I'll bring the right one right away. … Later … Here's your bill.", 'Bien sûr — je vous apporte le bon tout de suite. … Plus tard … Voici l’addition.', 'Claro — le traigo el correcto enseguida. … Más tarde … Aquí tiene la cuenta.', 'כמובן — אביא את הנכון מיד. … אחר כך … הנה החשבון.'),
        you(MISTAKE),
        npc("Let me check the bill. What's the problem?", 'Laissez-moi vérifier l’addition. Quel est le problème ?', 'Déjeme revisar la cuenta. ¿Cuál es el problema?', 'תן לי לבדוק את החשבון. מה הבעיה?'),
        you(CHARGED_TWICE),
        npc("You're right — my mistake. I'll refund it now.", 'Vous avez raison — c’est ma faute. Je vous rembourse tout de suite.', 'Tiene razón — es culpa mía. Le hago el reembolso ahora mismo.', 'אתה צודק — הטעות שלי. אחזיר לך עכשיו.'),
        you(NO_PROBLEM),
        npc('Thank you for your patience. Dessert is on the house!', 'Merci de votre patience. Le dessert est offert par la maison !', 'Gracias por su paciencia. ¡El postre corre por cuenta de la casa!', 'תודה על הסבלנות. הקינוח על חשבון הבית!'),
      ],
    },
    {
      id: 'room-problem',
      receipt: ['מזגן, רעש, והחלפת חדר — אמרת מה הבעיה וביקשת פתרון.', 'Air conditioning, noise, and a new room — you named the problem and asked for a fix.'],
      lines: [
        npc('Good evening! How can I help you?', 'Bonsoir ! Comment puis-je vous aider ?', '¡Buenas noches! ¿En qué puedo ayudarle?', 'ערב טוב! איך אפשר לעזור?'),
        you(THERES_PROBLEM, { alts: [itemOf(EVERYDAY_CORE, 'phrase.core.can-you-help')] }),
        npc("I'm sorry to hear that. What's the problem?", 'Je suis désolé. Quel est le problème ?', 'Lo siento. ¿Cuál es el problema?', 'אני מצטער לשמוע. מה הבעיה?'),
        you(hotel('phrase.hotelreq.ac-not-working')),
        npc("I'm so sorry about that.", 'Je suis vraiment désolé.', 'Lo siento muchísimo.', 'אני מצטער על זה מאוד.'),
        you(CAN_YOU_FIX),
        npc("Yes, I'll send someone right away. Is everything else okay?", 'Oui, j’envoie quelqu’un tout de suite. Tout le reste va bien ?', 'Sí, mando a alguien ahora mismo. ¿Todo lo demás está bien?', 'כן, אשלח מישהו מיד. כל השאר בסדר?', 'fast'),
        you(hotel('phrase.hotelreq.room-noisy'), {
          say: ['No. My room is very noisy.', 'Non. Ma chambre est très bruyante.', 'No. Mi habitación es muy ruidosa.', 'לא. החדר שלי מאוד רועש.'],
          rec: { tool: 'slowly', npc: ['The room. Is it — okay?', 'La chambre. Elle est — bien ?', 'La habitación. ¿Está — bien?', 'החדר. הוא — בסדר?'] },
        }),
        npc('I understand. We have a quieter room.', 'Je comprends. Nous avons une chambre plus calme.', 'Lo entiendo. Tenemos una habitación más tranquila.', 'אני מבין. יש לנו חדר שקט יותר.'),
        you(CHANGE_ROOMS),
        npc('Of course — room 305. Here is your new key. Good night!', 'Bien sûr — chambre 305. Voici votre nouvelle clé. Bonne nuit !', 'Claro — habitación 305. Aquí tiene su nueva llave. ¡Buenas noches!', 'כמובן — חדר 305. הנה המפתח החדש. לילה טוב!'),
      ],
    },
  ],
  hear: [
    item('reply.fix.so-sorry', "I'm so sorry about that.", 'Je suis vraiment désolé.', 'Lo siento muchísimo.', 'אני מצטער על זה מאוד.'),
    item('reply.fix.whats-problem', "What's the problem?", 'Quel est le problème ?', '¿Cuál es el problema?', 'מה הבעיה?'),
    item('reply.fix.bring-right', "I'll bring the right one.", 'Je vous apporte le bon.', 'Le traigo el correcto.', 'אביא את הנכון.'),
    item('reply.fix.check-bill', 'Let me check the bill.', 'Laissez-moi vérifier l’addition.', 'Déjeme revisar la cuenta.', 'תן לי לבדוק את החשבון.'),
    item('reply.fix.refund-now', "I'll refund it now.", 'Je vous rembourse tout de suite.', 'Le hago el reembolso ahora mismo.', 'אחזיר לך את הכסף עכשיו.'),
    item('reply.fix.on-the-house', "It's on the house.", 'C’est offert par la maison.', 'Invita la casa.', 'זה על חשבון הבית.'),
    item('reply.fix.anything-else', 'Is there anything else?', 'Il y a autre chose ?', '¿Hay algo más?', 'יש עוד משהו?'),
  ],
  teach: {
    tools: [
      { id: 'phrase.fix.not-ordered', label: ['הזמנה שגויה', 'Wrong order'] },
      { id: 'phrase.fix.charged-twice', label: ['חיוב כפול', 'Double charge'] },
      { id: 'phrase.fix.theres-problem', label: ['יש בעיה', "There's a problem"] },
      { id: 'phrase.hotelreq.ac-not-working', label: ['משהו לא עובד', "Something isn't working"] },
      { id: 'phrase.fix.can-you-fix', label: ['לבקש תיקון', 'Ask for a fix'] },
      { id: 'phrase.fix.change-rooms', label: ['לבקש להחליף', 'Ask to change'] },
    ],
    said: 'phrase.fix.not-ordered',
    replies: ['reply.fix.so-sorry', 'reply.fix.bring-right', 'reply.fix.whats-problem', 'reply.fix.refund-now'],
    repliesReceipt: ['אתה מזהה התנצלות, הצעת פתרון, ו"מה הבעיה?"', 'You recognize an apology, an offered fix, and "what\'s the problem?"'],
    quiz: ['reply.fix.refund-now', 'reply.fix.bring-right', 'reply.fix.on-the-house'],
    ambush: {
      npc: ['So sorry about all of this is there anything else I can fix for you tonight?', 'Vraiment désolé pour tout ça, il y a autre chose que je peux arranger pour vous ce soir ?', 'Lo siento mucho por todo esto, ¿hay algo más que pueda arreglarle esta noche?', 'מצטער מאוד על כל זה — יש עוד משהו שאני יכול לסדר לך הערב?'],
      correct: 'reply.fix.anything-else',
      wrong: 'reply.fix.check-bill',
      receipt: ['גם אחרי תקלה — הבנת ששואלים אם יש עוד משהו.', 'Even after a mishap — you understood you were asked whether there is anything else.'],
    },
  },
};
