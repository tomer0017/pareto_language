import { fromItems, itemOf, npc, tool, you, type MissionSpec, type SpecItem } from '../author.js';
import type { BootcampItem } from '../types.js';
import { DAY1_ITEMS } from '../day1.js';
import { DAY2_ITEMS } from '../day2.js';
import { DAY3_ITEMS } from '../day3.js';
import { DAY4_ITEMS } from '../day4.js';
import { DAY6_ITEMS } from '../day6.js';
import { DAY7_ITEMS } from '../day7.js';
import { DAY8_ITEMS } from '../day8.js';
import { DAY10_ITEMS } from '../day10.js';
import { DAY12_ITEMS } from '../day12.js';
import { DAY18_ITEMS } from '../day18.js';
import { DAY1_FR_ITEMS } from '../fr/day1.js';
import { DAY2_FR_ITEMS } from '../fr/day2.js';
import { DAY3_FR_ITEMS } from '../fr/day3.js';
import { DAY4_FR_ITEMS } from '../fr/day4.js';
import { DAY6_FR_ITEMS } from '../fr/day6.js';
import { DAY7_FR_ITEMS } from '../fr/day7.js';
import { DAY8_FR_ITEMS } from '../fr/day8.js';
import { DAY10_FR_ITEMS } from '../fr/day10.js';
import { DAY12_FR_ITEMS } from '../fr/day12.js';
import { DAY18_FR_ITEMS } from '../fr/day18.js';
import { DAY1_ES_ITEMS } from '../es/day1.js';
import { DAY2_ES_ITEMS } from '../es/day2.js';
import { DAY3_ES_ITEMS } from '../es/day3.js';
import { DAY4_ES_ITEMS } from '../es/day4.js';
import { DAY6_ES_ITEMS } from '../es/day6.js';
import { DAY7_ES_ITEMS } from '../es/day7.js';
import { DAY8_ES_ITEMS } from '../es/day8.js';
import { DAY10_ES_ITEMS } from '../es/day10.js';
import { DAY12_ES_ITEMS } from '../es/day12.js';
import { DAY18_ES_ITEMS } from '../es/day18.js';
import { EVERYDAY_CORE } from './everydayCore.js';
import { FIXING_PROBLEMS } from './fixingProblems.js';
import { FUTURE_PLANS } from './futurePlans.js';
import { HOBBIES } from './hobbies.js';
import { HOME_FAMILY } from './homeFamily.js';
import { OPINIONS } from './opinions.js';
import { PAST_EVENTS } from './pastEvents.js';
import { SMALL_TALK } from './smallTalk.js';
import { TIME_PLANS } from './timePlans.js';

/**
 * The integration missions of the Core 30 — Arrival Day (10), Everyday Day (18), City &
 * Conversation (24), No Subtitles (28) and the finale, A Complete Day Abroad Alone (30). They are
 * retrieval tests, not lessons: EVERY
 * learner line here is a sentence an earlier mission already taught (same id, same wording), in a
 * new combination and at a more natural pace. Only the NPC lines are new.
 * AI linguistic review completed; native review still recommended.
 */
const EN: BootcampItem[] = [...DAY1_ITEMS, ...DAY2_ITEMS, ...DAY3_ITEMS, ...DAY4_ITEMS, ...DAY6_ITEMS, ...DAY7_ITEMS, ...DAY8_ITEMS, ...DAY10_ITEMS, ...DAY12_ITEMS, ...DAY18_ITEMS];
const FR: BootcampItem[] = [...DAY1_FR_ITEMS, ...DAY2_FR_ITEMS, ...DAY3_FR_ITEMS, ...DAY4_FR_ITEMS, ...DAY6_FR_ITEMS, ...DAY7_FR_ITEMS, ...DAY8_FR_ITEMS, ...DAY10_FR_ITEMS, ...DAY12_FR_ITEMS, ...DAY18_FR_ITEMS];
const ES: BootcampItem[] = [...DAY1_ES_ITEMS, ...DAY2_ES_ITEMS, ...DAY3_ES_ITEMS, ...DAY4_ES_ITEMS, ...DAY6_ES_ITEMS, ...DAY7_ES_ITEMS, ...DAY8_ES_ITEMS, ...DAY10_ES_ITEMS, ...DAY12_ES_ITEMS, ...DAY18_ES_ITEMS];
/** A sentence taught by one of the hand-written missions. */
const known = (id: string): SpecItem => fromItems(id, EN, FR, ES);

/**
 * Arrival Day — the checkpoint of Missions 06–09. Nobody helps: three cold scenes in a row.
 *   - Nothing is taught, quizzed or reviewed. Every word, in every language, is one the learner has
 *     already met in Missions 01–09 (a test enforces it).
 *   - The other speaker's lines are not translated before the learner answers (`cold`).
 *   - Almost every turn is a real decision: the line that fits, a line that belongs to another
 *     moment of the day, and — twice — a conversation-help tool, which counts as success.
 *   - One moment is at natural speed with nothing new in it.
 */
export const ARRIVAL_DAY: MissionSpec = {
  day: 9,
  title: ['נקודת ביקורת: יום הגעה', 'CHECKPOINT: Arrival Day'],
  icon: '🛬',
  intro: [
    ['אין חומר חדש היום. רק הוכחה.', 'No new material today. Just proof.'],
    ['נחתת. ביקורת גבולות, מונית למלון, צ\'ק-אין — ברצף, בלי הכנה ובלי תרגום.', 'You have landed. Border control, a taxi to the hotel, check-in — in a row, unprepared and untranslated.'],
    ['בוא נראה מה באמת נשאר לך בראש.', 'Let’s see what actually stuck.'],
  ],
  cta: ['נחתנו — קדימה', 'We’ve landed — go'],
  scenes: [
    {
      id: 'cold-border',
      cold: true,
      receipt: ['עברת ביקורת גבולות: דרכון, מטרה, משך, מקום ומכס — בלי עזרה.', 'You cleared the border: passport, purpose, how long, where, and customs — with no help.'],
      lines: [
        npc('Passport, please.', 'Passeport, s’il vous plaît.', 'Pasaporte, por favor.', 'דרכון, בבקשה.', 'fast'),
        you(known('phrase.hotel.here-you-go'), { wrong: [known('phrase.border.on-holiday')] }),
        npc("What's the purpose of your visit?", 'Quel est le motif de votre visite ?', '¿Cuál es el motivo de su viaje?', 'מה מטרת הביקור?', 'fast'),
        you(known('phrase.border.on-holiday'), { wrong: [known('phrase.border.two-weeks')] }),
        npc('How long are you staying?', 'Vous restez combien de temps ?', '¿Cuánto tiempo se queda?', 'לכמה זמן אתה נשאר?', 'fast'),
        you(known('phrase.border.two-weeks'), {
          wrong: [known('phrase.border.staying-hotel')],
          rec: { tool: 'repeat', npc: ['How long? One week? Two weeks?', 'Combien de temps ? Une semaine ? Deux semaines ?', '¿Cuánto tiempo? ¿Una semana? ¿Dos semanas?', 'כמה זמן? שבוע? שבועיים?'] },
        }),
        npc('Where are you staying?', 'Où logez-vous ?', '¿Dónde se aloja?', 'איפה אתה מתאכסן?'),
        you(known('phrase.border.staying-hotel'), { wrong: [known('phrase.border.nothing-declare')] }),
        npc('Anything to declare?', 'Quelque chose à déclarer ?', '¿Algo que declarar?', 'יש לך מה להצהיר?'),
        you(known('phrase.border.nothing-declare'), { wrong: [known('phrase.border.on-holiday')] }),
        npc('Welcome, and enjoy your stay!', 'Bienvenue, et bon séjour !', 'Bienvenido, ¡y que disfrute su estancia!', 'ברוך הבא, ותיהנה מהשהות!'),
      ],
    },
    {
      id: 'cold-taxi',
      cold: true,
      receipt: ['מונית בלי הכנה — יעד, מחיר, עצירה, עודף.', 'A cold taxi — destination, price, stop, change.'],
      lines: [
        npc('Hello! Where to?', 'Bonjour ! Où allez-vous ?', '¡Hola! ¿A dónde va?', 'שלום! לאן?', 'fast'),
        you(known('phrase.taxi.to-address'), { wrong: [known('phrase.taxi.stop-here')] }),
        npc("It's about fifteen euros. There's a lot of traffic right now.", 'C’est environ quinze euros. Il y a beaucoup de circulation en ce moment.', 'Son unos quince euros. Hay mucho tráfico ahora mismo.', 'זה בערך חמישה עשר יורו. יש הרבה פקקים עכשיו.', 'fast'),
        you(tool('thank-you'), {
          say: ['Okay, thank you.', 'D’accord, merci.', 'De acuerdo, gracias.', 'בסדר, תודה.'],
          wrong: [known('phrase.taxi.how-much')],
          rec: { tool: 'slowly', npc: ["Sure. About fifteen euros. There's a lot of traffic.", 'Bien sûr. Environ quinze euros. Il y a beaucoup de circulation.', 'Claro. Unos quince euros. Hay mucho tráfico.', 'בטח. בערך חמישה עשר יורו. יש הרבה פקקים.'] },
        }),
        npc('…We are almost there. Is here okay?', '…On est presque arrivés. Ici, ça va ?', '…Ya casi llegamos. ¿Aquí está bien?', '…כמעט הגענו. כאן זה בסדר?'),
        you(known('phrase.taxi.stop-here'), {
          say: ['Stop here, please. Keep the change.', 'Arrêtez-vous ici, s’il vous plaît. Gardez la monnaie.', 'Pare aquí, por favor. Quédese con el cambio.', 'עצור כאן, בבקשה. תשאיר את העודף.'],
          wrong: [known('phrase.taxi.to-address')],
        }),
        npc('Thank you very much! Enjoy your trip!', 'Merci beaucoup ! Bon voyage !', '¡Muchas gracias! ¡Buen viaje!', 'תודה רבה! תיהנה מהטיול!'),
      ],
    },
    {
      id: 'cold-hotel',
      cold: true,
      receipt: ['צ\'ק-אין בלי הכנה — הזמנה, דרכון, חדר, ארוחת בוקר.', 'A cold check-in — reservation, passport, room, breakfast.'],
      // One moment at natural speed, built only from what the receptionist already said in Mission 08.
      ambush: {
        mode: 'speed',
        npc: ['The elevator is on your right. Breakfast is from seven to ten. Enjoy your stay!', 'L’ascenseur est sur votre droite. Le petit-déjeuner est de sept heures à dix heures. Bon séjour !', 'El ascensor está a su derecha. El desayuno es de siete a diez. ¡Que disfrute su estancia!', 'המעלית מימינך. ארוחת בוקר משבע עד עשר. תיהנה מהשהות!'],
        correct: 'reply.hotel.breakfast-time',
        wrong: 'reply.hotel.room-number',
        receipt: ['מידע בקצב רגיל, בלי שום מילה חדשה — ותפסת את שעות ארוחת הבוקר.', 'Information at normal speed, with not one new word — and you caught the breakfast hours.'],
      },
      lines: [
        npc('Good evening! How can I help you?', 'Bonsoir ! Comment puis-je vous aider ?', '¡Buenas noches! ¿En qué puedo ayudarle?', 'ערב טוב! איך אפשר לעזור?', 'fast'),
        you(known('phrase.hotel.reservation'), {
          say: ['I have a reservation, under the name Cohen.', 'J’ai une réservation, au nom de Cohen.', 'Tengo una reserva, a nombre de Cohen.', 'יש לי הזמנה, על השם כהן.'],
          wrong: [known('phrase.hotel.breakfast')],
        }),
        npc('Welcome, Mr. Cohen. Your passport, please.', 'Bienvenue, monsieur Cohen. Votre passeport, s’il vous plaît.', 'Bienvenido, señor Cohen. Su pasaporte, por favor.', 'ברוך הבא, מר כהן. הדרכון שלך, בבקשה.'),
        you(known('phrase.hotel.here-you-go'), { wrong: [known('phrase.border.nothing-declare')] }),
        npc("Thank you. You're in room two-oh-four, on the second floor. Here is your key.", 'Merci. Vous êtes dans la chambre deux cent quatre, au deuxième étage. Voici votre clé.', 'Gracias. Está en la habitación doscientos cuatro, en el segundo piso. Aquí tiene su llave.', 'תודה. אתה בחדר 204, בקומה השנייה. הנה המפתח שלך.', 'fast'),
        you(known('phrase.hotel.breakfast'), {
          wrong: [known('phrase.hotel.reservation')],
          rec: { tool: 'repeat', npc: ["You're in room two-oh-four. It's on the second floor.", 'Vous êtes dans la chambre deux cent quatre. C’est au deuxième étage.', 'Está en la habitación doscientos cuatro. Está en el segundo piso.', 'אתה בחדר 204. זה בקומה השנייה.'] },
        }),
        npc('Yes, from seven to ten. Enjoy your stay.', 'Oui, de sept à dix heures. Bon séjour.', 'Sí, de siete a diez. Que disfrute su estancia.', 'כן, משבע עד עשר. תיהנה מהשהות.'),
      ],
    },
  ],
  hear: [known('reply.hotel.breakfast-time'), known('reply.hotel.room-number')],
  closing: ['יום הגעה שלם, בלי עזרה: עברת גבול, לקחת מונית והבנת את המחיר, עשית צ\'ק-אין — וגם כשזה היה מהיר, לא קפאת.', 'A full arrival day, alone: you cleared the border, took a taxi and understood the fare, checked in — and when it got fast, you did not freeze.'],
};

export const EVERYDAY_DAY: MissionSpec = {
  day: 17,
  title: ['נקודת ביקורת: יום רגיל', 'CHECKPOINT: Everyday Day'],
  icon: '☀️',
  intro: [
    ['אין חומר חדש היום. רק הוכחה.', 'No new material today. Just proof.'],
    ['יום רגיל אחד: קפה בבוקר, תוכניות עם חבר, קנייה קטנה, וארוחת ערב.', 'One ordinary day: a morning coffee, plans with a friend, a small purchase, and dinner.'],
    ['הכל משפטים שכבר למדת — בסדר חדש, ובקצב רגיל.', 'Every line is one you already know — in a new order, at normal speed.'],
  ],
  cta: ['להתחיל את היום', 'Start the day'],
  scenes: [
    {
      id: 'cold-morning',
      receipt: ['בוקר: הזמנת, התלבטת ושילמת — בלי הכנה.', 'Morning: you ordered, hesitated and paid — with no preparation.'],
      ambush: {
        npc: ['Sorry before I forget did you want milk and sugar in that?', 'Pardon, avant que j’oublie : vous vouliez du lait et du sucre dedans ?', 'Perdone, antes de que se me olvide: ¿lo quería con leche y azúcar?', 'סליחה, לפני שאני שוכח — רצית בזה חלב וסוכר?'],
        correct: 'reply.coffee.milk-sugar',
        wrong: 'reply.coffee.cash-or-card',
        receipt: ['שאלה שחזרה אליך באיחור — והבנת אותה.', 'A question that came back late — and you understood it.'],
      },
      lines: [
        npc('Morning! What can I get you?', 'Bonjour ! Qu’est-ce que je vous sers ?', '¡Buenos días! ¿Qué le sirvo?', 'בוקר! מה להביא לך?', 'fast'),
        you(known('phrase.coffee.iced-coffee')),
        npc('Sure. Anything to eat?', 'Très bien. Quelque chose à manger ?', 'Claro. ¿Algo de comer?', 'בטח. משהו לאכול?'),
        you(itemOf(TIME_PLANS, 'phrase.time.maybe-later'), { say: ["I don't know. Maybe later.", 'Je ne sais pas. Peut-être plus tard.', 'No lo sé. Quizás más tarde.', 'אני לא יודע. אולי אחר כך.'] }),
        npc("No problem. That's four euros. Cash or card?", 'Pas de problème. Ça fait quatre euros. Espèces ou carte ?', 'No pasa nada. Son cuatro euros. ¿Efectivo o tarjeta?', 'אין בעיה. זה ארבעה יורו. מזומן או כרטיס?'),
        you(known('phrase.money.by-card')),
        npc('Thank you — have a great morning!', 'Merci — bonne matinée !', 'Gracias — ¡que tenga una buena mañana!', 'תודה — בוקר נהדר!'),
      ],
    },
    {
      id: 'cold-plans',
      receipt: ['קבעת תוכניות למחר ואמרת מה אתה עושה עכשיו.', 'You made plans for tomorrow and said what you are doing now.'],
      lines: [
        npc('Hey! Are you free tomorrow?', 'Salut ! Tu es libre demain ?', '¡Hola! ¿Estás libre mañana?', 'היי! אתה פנוי מחר?', 'fast'),
        you(itemOf(TIME_PLANS, 'phrase.time.free-tomorrow'), {
          rec: { tool: 'repeat', npc: ['Tomorrow. Are you — free?', 'Demain. Tu es — libre ?', 'Mañana. ¿Estás — libre?', 'מחר. אתה — פנוי?'] },
        }),
        npc("We're going surfing. Do you like surfing?", 'On va faire du surf. Tu aimes le surf ?', 'Vamos a hacer surf. ¿Te gusta el surf?', 'אנחנו הולכים לגלוש. אתה אוהב לגלוש?'),
        you(itemOf(HOBBIES, 'phrase.hobby.i-love-surfing')),
        npc('Great! What time is good for you?', 'Super ! Quelle heure te convient ?', '¡Genial! ¿Qué hora te va bien?', 'מעולה! איזו שעה טובה לך?'),
        you(itemOf(TIME_PLANS, 'phrase.time.lets-meet')),
        npc('Perfect. And now? Are you coming to the beach?', 'Parfait. Et maintenant ? Tu viens à la plage ?', 'Perfecto. ¿Y ahora? ¿Vienes a la playa?', 'מושלם. ועכשיו? אתה בא לים?'),
        you(itemOf(HOME_FAMILY, 'phrase.home.going-home'), { say: ["Not now, I'm tired. I'm going home.", 'Pas maintenant, je suis fatigué. Je rentre chez moi.', 'Ahora no, estoy cansado. Me voy a casa.', 'לא עכשיו, אני עייף. אני הולך הביתה.'] }),
        npc('Okay. See you tomorrow!', 'D’accord. À demain !', 'Vale. ¡Hasta mañana!', 'בסדר. נתראה מחר!'),
      ],
    },
    {
      id: 'cold-shop',
      receipt: ['קנייה קטנה: הסתכלת, שאלת מחיר והחלטת.', 'A small purchase: you browsed, asked the price and decided.'],
      lines: [
        npc('Hi there! Can I help you find anything?', 'Bonjour ! Je peux vous aider à trouver quelque chose ?', '¡Hola! ¿Le ayudo a encontrar algo?', 'היי! אפשר לעזור לך למצוא משהו?', 'fast'),
        you(known('phrase.shop.just-looking')),
        npc('Of course. This one is on sale today.', 'Bien sûr. Celui-ci est en solde aujourd’hui.', 'Claro. Este está rebajado hoy.', 'כמובן. זה במבצע היום.'),
        you(known('phrase.money.how-much')),
        npc('Twenty euros.', 'Vingt euros.', 'Veinte euros.', 'עשרים יורו.'),
        you(known('phrase.shop.take-it')),
        npc('Great choice. Thank you!', 'Excellent choix. Merci !', 'Buena elección. ¡Gracias!', 'בחירה מצוינת. תודה!'),
      ],
    },
    {
      id: 'cold-dinner',
      receipt: ['ארוחת ערב שלמה — שולחן, הזמנה, שתייה, חשבון — בקצב רגיל.', 'A whole dinner — table, order, drink, bill — at normal speed.'],
      ambush: {
        npc: ['Before I bring the bill would you like to see the dessert menu?', 'Avant que j’apporte l’addition, vous voulez voir la carte des desserts ?', 'Antes de traerle la cuenta, ¿quiere ver la carta de postres?', 'לפני שאני מביא את החשבון — רוצה לראות את תפריט הקינוחים?'],
        correct: 'reply.rest.dessert',
        wrong: 'reply.rest.reservation',
        receipt: ['הצעה מהירה בסוף הארוחה — והבנת שמציעים קינוח.', 'A quick offer at the end of the meal — and you understood it was dessert.'],
      },
      lines: [
        npc('Good evening! How many people?', 'Bonsoir ! Vous êtes combien ?', '¡Buenas noches! ¿Cuántos son?', 'ערב טוב! כמה אנשים?', 'fast'),
        you(known('phrase.rest.table-two')),
        npc('Right this way. Are you ready to order?', 'Suivez-moi. Vous êtes prêts à commander ?', 'Síganme. ¿Están listos para pedir?', 'בבקשה אחריי. מוכנים להזמין?'),
        you(known('phrase.rest.ill-have-chicken')),
        npc('Excellent. Anything to drink?', 'Excellent. Quelque chose à boire ?', 'Excelente. ¿Algo de beber?', 'מצוין. משהו לשתות?'),
        you(known('phrase.rest.water')),
        npc('…Later… Is everything okay?', '…Plus tard… Tout va bien ?', '…Más tarde… ¿Va todo bien?', '…אחר כך… הכל בסדר?'),
        you(known('phrase.rest.the-bill'), { say: ['Yes, that was delicious! The bill, please.', 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', '¡Sí, estaba delicioso! La cuenta, por favor.', 'כן, היה טעים מאוד! החשבון, בבקשה.'] }),
        npc('Here you are. Have a lovely evening!', 'Voici. Passez une bonne soirée !', 'Aquí tienen. ¡Que pasen buena noche!', 'בבקשה. ערב נעים!'),
      ],
    },
  ],
  hear: [known('reply.coffee.milk-sugar'), known('reply.coffee.cash-or-card'), known('reply.rest.dessert'), known('reply.rest.reservation')],
  closing: ['יום רגיל שלם — קפה, חבר, קנייה וארוחה — בלי רשת ביטחון.', 'A whole ordinary day — coffee, a friend, a purchase and a meal — without the safety net.'],
};

export const CITY_CONVERSATION: MissionSpec = {
  day: 23,
  title: ['נקודת ביקורת: עיר ושיחה', 'CHECKPOINT: City & Conversation'],
  icon: '🏙️',
  intro: [
    ['אין חומר חדש היום. רק הוכחה.', 'No new material today. Just proof.'],
    ['לזוז בעיר — וגם להחזיק שיחה: מאיפה אתה, מה עשית, לאן אתה ממשיך, מה אתה חושב.', 'Move through the city — and hold a conversation too: where you are from, what you did, where you go next, what you think.'],
  ],
  cta: ['לצאת לעיר', 'Head into the city'],
  scenes: [
    {
      id: 'cold-transport',
      receipt: ['כרטיס, רציף ותחנה — בקצב של תחנה אמיתית.', 'Ticket, platform and stop — at the pace of a real station.'],
      ambush: {
        npc: ['Careful this one is going the wrong way you need the other platform', 'Attention, celui-ci va dans le mauvais sens, il vous faut l’autre quai', 'Cuidado, este va en dirección contraria, necesita el otro andén', 'זהירות, זה נוסע בכיוון ההפוך — אתה צריך את הרציף השני'],
        correct: 'reply.trans.wrong-way',
        wrong: 'reply.trans.three-stops',
        receipt: ['אזהרה מהירה — והבנת שאתה בכיוון הלא נכון.', 'A quick warning — and you understood you were going the wrong way.'],
      },
      lines: [
        npc('Where are you headed?', 'Vous allez où ?', '¿A dónde va?', 'לאן אתה נוסע?', 'fast'),
        you(known('phrase.trans.one-ticket')),
        npc('Platform two — it leaves in five minutes.', 'Quai numéro deux — il part dans cinq minutes.', 'Andén número dos — sale en cinco minutos.', 'רציף שתיים — יוצא בעוד חמש דקות.'),
        you(known('phrase.trans.does-stop')),
        npc('Yes — three stops. Enjoy!', 'Oui — trois arrêts. Bonne visite !', 'Sí — tres paradas. ¡Que lo disfrute!', 'כן — שלוש תחנות. תיהנה!'),
      ],
    },
    {
      id: 'cold-chat',
      receipt: ['שיחה עם מקומי: מאיפה אתה, מה אתה חושב, ומה מומלץ.', 'A chat with a local: where you are from, what you think, and what to try.'],
      lines: [
        npc('Hi! Where are you from?', 'Bonjour ! Vous venez d’où ?', '¡Hola! ¿De dónde es?', 'היי! מאיפה אתה?'),
        you(known('phrase.social.from-israel')),
        npc('Welcome! Do you like it here?', 'Bienvenue ! Ça vous plaît ici ?', '¡Bienvenido! ¿Le gusta este lugar?', 'ברוך הבא! אתה אוהב את המקום?'),
        you(itemOf(SMALL_TALK, 'phrase.talk.i-like-it')),
        npc("You should take the boat tour. It's fifty euros.", 'Vous devriez faire le tour en bateau. C’est cinquante euros.', 'Debería hacer el paseo en barco. Son cincuenta euros.', 'כדאי לך לעשות את הסיור בסירה. זה חמישים יורו.'),
        you(itemOf(OPINIONS, 'phrase.opin.i-think-expensive')),
        npc("Hmm, maybe. Then walk in the old town — it's free!", 'Hmm, peut-être. Alors promenez-vous dans la vieille ville — c’est gratuit !', 'Mmm, puede ser. Entonces pasee por el casco antiguo — ¡es gratis!', 'הממ, אולי. אז תטייל בעיר העתיקה — זה בחינם!'),
        you(itemOf(SMALL_TALK, 'phrase.talk.recommend-place')),
        npc("'Mama Rosa'. The food is wonderful. Enjoy!", '« Mama Rosa ». La cuisine est excellente. Bonne journée !', '«Mama Rosa». La comida es estupenda. ¡Que disfrute!', "'מאמא רוזה'. האוכל נהדר. תיהנה!"),
      ],
    },
    {
      id: 'cold-hostel',
      receipt: ['סיפרת מה עשית, לאן אתה נוסע, ושאלת על מחר. זו כבר שיחה אמיתית.', 'You said what you did, where you are going, and asked about tomorrow. That is a real conversation.'],
      ambush: {
        npc: ['Vietnam nice so how long will you be there a week or more?', 'Le Vietnam, sympa ! Et tu restes combien de temps, une semaine ou plus ?', 'Vietnam, ¡qué bien! ¿Y cuánto tiempo vas a estar allí, una semana o más?', 'וייטנאם, יפה! וכמה זמן תהיה שם — שבוע או יותר?'],
        correct: 'reply.future.how-long',
        wrong: 'reply.past.did-you-like',
        receipt: ['שאלת המשך על התוכניות שלך — והבנת.', 'A follow-up about your plans — and you understood.'],
      },
      lines: [
        npc('Hey! Where were you today?', 'Salut ! Tu étais où aujourd’hui ?', '¡Hola! ¿Dónde estuviste hoy?', 'היי! איפה היית היום?', 'fast'),
        you(itemOf(PAST_EVENTS, 'phrase.past.i-went'), {
          rec: { tool: 'slowly', npc: ['Today. Where — were you?', 'Aujourd’hui. Tu étais — où ?', 'Hoy. ¿Dónde — estuviste?', 'היום. איפה — היית?'] },
        }),
        npc('Did you like it?', 'Tu as aimé ?', '¿Te gustó?', 'אהבת?'),
        you(itemOf(PAST_EVENTS, 'phrase.past.it-was-great')),
        npc('Good! And where are you going next?', 'Super ! Et tu vas où après ?', '¡Qué bien! ¿Y a dónde vas después?', 'יופי! ולאן אתה נוסע אחרי זה?'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.going-to-vietnam')),
        npc("Wow! I'm going home next week.", 'Waouh ! Moi, je rentre chez moi la semaine prochaine.', '¡Guau! Yo me voy a casa la semana que viene.', 'וואו! אני חוזר הביתה בשבוע הבא.'),
        you(itemOf(TIME_PLANS, 'phrase.time.what-doing-tomorrow')),
        npc("Tomorrow I'm free. Do you want to go to the beach?", 'Demain, je suis libre. Tu veux aller à la plage ?', 'Mañana estoy libre. ¿Quieres ir a la playa?', 'מחר אני פנוי. רוצה ללכת לים?'),
        you(itemOf(OPINIONS, 'phrase.opin.of-course')),
        npc('Great. See you tomorrow!', 'Super. À demain !', 'Genial. ¡Hasta mañana!', 'מעולה. נתראה מחר!'),
      ],
    },
  ],
  hear: [known('reply.trans.wrong-way'), known('reply.trans.three-stops'), itemOf(FUTURE_PLANS, 'reply.future.how-long'), itemOf(PAST_EVENTS, 'reply.past.did-you-like')],
  closing: ['עיר זרה — וגם שיחה של בני אדם. שלוש הוכחות, אפס קפיאות.', 'A foreign city — and a human conversation too. Three proofs, zero freezes.'],
};

export const NO_SUBTITLES: MissionSpec = {
  day: 27,
  title: ['בלי כתוביות', 'No Subtitles'],
  icon: '🎧',
  numbered: true,
  intro: [
    ['אין כאן מילה חדשה. הקושי הוא המהירות.', 'There is not one new word here. The difficulty is the speed.'],
    ['שלוש סצנות קצרות — תחנה, מסעדה, שיחה — בקצב של דוברים אמיתיים.', 'Three short scenes — a station, a restaurant, a chat — at the pace of real speakers.'],
    ['על הנייר זה קל. באוזניים — זה האימון.', 'On paper this is easy. By ear — that is the training.'],
  ],
  cta: ['להוריד את הכתוביות', 'Take the subtitles off'],
  scenes: [
    {
      id: 'ns-transit',
      receipt: ['תחנה בקצב אמיתי — כרטיס, רציף שהשתנה, ותחנה.', 'A station at real speed — ticket, a changed platform, and your stop.'],
      ambush: {
        npc: ['Heads up your stop is next get ready to get off', 'Attention, votre arrêt est le prochain, préparez-vous à descendre', 'Atención, su parada es la siguiente, prepárese para bajar', 'שים לב, התחנה שלך הבאה — תתכונן לרדת'],
        correct: 'reply.trans.stop-next',
        wrong: 'reply.trans.single-return',
        receipt: ['הודעה מהירה — והבנת שהתחנה שלך הבאה.', 'A fast announcement — and you understood your stop is next.'],
      },
      lines: [
        npc('Right — where to?', 'Bon — vous allez où ?', 'A ver — ¿a dónde va?', 'טוב — לאן?', 'fast'),
        you(known('phrase.trans.one-ticket'), {
          rec: { tool: 'repeat', npc: ['Where — are you going?', 'Vous allez — où ?', '¿A dónde — va?', 'לאן — אתה נוסע?'] },
        }),
        npc("Platform's changed. It's four now — quick!", 'Le quai a changé. C’est le quatre maintenant — vite !', 'Ha cambiado el andén. Ahora es el cuatro — ¡rápido!', 'הרציף השתנה. עכשיו זה ארבע — מהר!', 'fast'),
        you(known('phrase.trans.does-stop')),
        npc('Yes. Three stops.', 'Oui. Trois arrêts.', 'Sí. Tres paradas.', 'כן. שלוש תחנות.', 'fast'),
      ],
    },
    {
      id: 'ns-diner',
      receipt: ['מסעדה בקצב אמיתי — שולחן והזמנה, רגע לפני שהמטבח נסגר.', 'A restaurant at real speed — a table and an order, just before the kitchen closes.'],
      ambush: {
        npc: ['Sorry to rush you is everything okay or do you need anything else?', 'Désolé de vous presser — tout va bien, ou vous avez besoin d’autre chose ?', 'Perdone las prisas — ¿va todo bien, o necesita algo más?', 'סליחה שאני מזרז — הכל בסדר, או שצריך עוד משהו?'],
        correct: 'reply.rest.everything-okay',
        wrong: 'reply.rest.ready-to-order',
        receipt: ['שאלה מהירה באמצע הארוחה — והבנת ששואלים אם הכל בסדר.', 'A fast question mid-meal — and you understood you were asked whether everything is okay.'],
      },
      lines: [
        npc('Evening — table for how many?', 'Bonsoir — une table pour combien ?', 'Buenas noches — ¿mesa para cuántos?', 'ערב טוב — שולחן לכמה?', 'fast'),
        you(known('phrase.rest.table-two')),
        npc("Kitchen's about to close. Ready to order?", 'La cuisine va fermer. Vous êtes prêt à commander ?', 'La cocina está a punto de cerrar. ¿Listo para pedir?', 'המטבח עומד להיסגר. מוכן להזמין?', 'fast'),
        you(known('phrase.rest.ill-have')),
        npc('Great. Coming up.', 'Très bien. Ça arrive.', 'Muy bien. Enseguida.', 'מצוין. תכף מגיע.', 'fast'),
      ],
    },
    {
      id: 'ns-local',
      receipt: ['שיחה עם מקומי בקצב אמיתי — מחמאה, המלצה, וזהו.', 'A chat with a local at real speed — a compliment, a recommendation, done.'],
      lines: [
        npc('Beautiful place, right?', 'Bel endroit, non ?', 'Bonito sitio, ¿verdad?', 'מקום יפה, נכון?', 'fast'),
        you(itemOf(SMALL_TALK, 'phrase.talk.beautiful-place')),
        npc('You should see the old town.', 'Vous devriez voir la vieille ville.', 'Debería ver el casco antiguo.', 'כדאי לך לראות את העיר העתיקה.', 'fast'),
        you(itemOf(SMALL_TALK, 'phrase.talk.recommend-place')),
        npc("Mama Rosa. It's very good.", '« Mama Rosa ». C’est très bon.', '«Mama Rosa». Es muy bueno.', "'מאמא רוזה'. מאוד טוב שם.", 'fast'),
      ],
    },
  ],
  hear: [known('reply.trans.stop-next'), known('reply.trans.single-return'), known('reply.rest.everything-okay'), known('reply.rest.ready-to-order')],
  closing: ['שלוש סצנות בלי כתוביות — והאוזניים שלך עמדו בזה לבד.', 'Three scenes with no subtitles — and your ears managed alone.'],
};

export const COMPLETE_DAY: MissionSpec = {
  day: 29,
  title: ['יום שלם לבד בחו״ל', 'A Complete Day Abroad Alone'],
  icon: '🎖️',
  intro: [
    ['זה היום. מבוקר עד לילה, לבד, בלי חומר חדש.', 'This is the day. Morning to night, alone, with nothing new.'],
    ['מה שאתה צריך בבוקר, מונית, ארוחה שמשתבשת, שיחה עם מטייל — ורגע אחד שבו לא תבין הכל.', 'What you need in the morning, a taxi, a meal that goes wrong, a chat with a traveler — and one moment where you will not catch everything.'],
    ['גם לזה יש לך כלי.', 'You have a tool for that too.'],
  ],
  cta: ['לצאת ליום', 'Start the day'],
  scenes: [
    {
      id: 'fin-morning',
      receipt: ['בוקר: אמרת מה יש לך וביקשת מה שחסר.', 'Morning: you said what you have and asked for what you were missing.'],
      lines: [
        npc('Good morning! Do you have your key?', 'Bonjour ! Vous avez votre clé ?', '¡Buenos días! ¿Tiene su llave?', 'בוקר טוב! יש לך את המפתח?'),
        you(itemOf(EVERYDAY_CORE, 'phrase.core.i-have')),
        npc('Good. Do you need anything else?', 'Très bien. Vous avez besoin d’autre chose ?', 'Muy bien. ¿Necesita algo más?', 'יופי. אתה צריך עוד משהו?'),
        you(itemOf(EVERYDAY_CORE, 'phrase.core.do-you-have')),
        npc('Here you go. Have a great day!', 'Tenez. Bonne journée !', 'Aquí tiene. ¡Que tenga un buen día!', 'בבקשה. שיהיה יום מעולה!'),
      ],
    },
    {
      id: 'fin-taxi',
      receipt: ['מונית: יעד, מחיר, עצירה.', 'Taxi: destination, price, stop.'],
      ambush: {
        npc: ['Sorry the road ahead is closed is it alright if I drop you around the corner?', 'Désolé, la route est barrée devant — ça vous va si je vous dépose au coin de la rue ?', 'Perdone, la calle está cortada más adelante — ¿le va bien si le dejo en la esquina?', 'סליחה, הכביש קדימה חסום — בסדר שאוריד אותך מעבר לפינה?'],
        correct: 'reply.taxi.here-good',
        wrong: 'reply.taxi.where-to',
        receipt: ['שינוי של הרגע האחרון — והבנת שמציעים להוריד אותך קרוב.', 'A last-minute change — and you understood the offer to drop you nearby.'],
      },
      lines: [
        npc('Where can I take you?', 'Où puis-je vous emmener ?', '¿A dónde le llevo?', 'לאן לקחת אותך?', 'fast'),
        you(known('phrase.taxi.to-address')),
        npc('About fifteen euros, with the traffic. Is here okay?', 'Environ quinze euros, avec la circulation. Ici, ça va ?', 'Unos quince euros, con el tráfico. ¿Aquí está bien?', 'בערך חמישה עשר יורו, עם הפקקים. כאן זה בסדר?'),
        you(known('phrase.taxi.stop-here')),
        npc('Here we are. Enjoy your day!', 'Nous y voilà. Bonne journée !', 'Ya estamos. ¡Que disfrute el día!', 'הגענו. תיהנה מהיום!'),
      ],
    },
    {
      id: 'fin-lunch',
      receipt: ['הזמנת, קיבלת מנה לא נכונה — ותיקנת את זה ברוגע.', 'You ordered, got the wrong dish — and fixed it calmly.'],
      lines: [
        npc('Hello! How many people?', 'Bonjour ! Vous êtes combien ?', '¡Hola! ¿Cuántos son?', 'שלום! כמה אנשים?'),
        you(known('phrase.rest.table-two')),
        npc('Right this way. Ready to order?', 'Suivez-moi. Vous êtes prêt à commander ?', 'Sígame. ¿Listo para pedir?', 'בבקשה אחריי. מוכן להזמין?'),
        you(known('phrase.rest.ill-have')),
        npc("…Here's your meal — one steak!", '…Voici votre plat — un steak !', '…Aquí tiene su plato — ¡un filete!', '…הנה הארוחה שלך — סטייק אחד!', 'fast'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.not-ordered')),
        npc("Oh no — I'm so sorry! I'll bring the right one.", 'Oh non — je suis vraiment désolé ! Je vous apporte le bon.', '¡Ay, no — lo siento muchísimo! Le traigo el correcto.', 'אוי לא — אני מצטער מאוד! אביא את הנכון.'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.no-problem-thanks')),
        npc("Here's the pasta. Enjoy your meal!", 'Voici les pâtes. Bon appétit !', 'Aquí tiene la pasta. ¡Buen provecho!', 'הנה הפסטה. בתיאבון!'),
      ],
    },
    {
      id: 'fin-chat',
      receipt: ['שיחה עם מטייל: מאיפה, מה עשית, לאן אתה נוסע — וגם לא הסכמת.', 'A chat with a traveler: where from, what you did, where next — and you disagreed, too.'],
      lines: [
        npc('Hi! Where are you from?', 'Salut ! Tu viens d’où ?', '¡Hola! ¿De dónde eres?', 'היי! מאיפה אתה?'),
        you(known('phrase.social.from-israel')),
        npc('Nice! What did you do today?', 'Sympa ! Tu as fait quoi aujourd’hui ?', '¡Qué bien! ¿Qué hiciste hoy?', 'יפה! מה עשית היום?'),
        you(itemOf(PAST_EVENTS, 'phrase.past.i-went')),
        npc('And where are you going next?', 'Et tu vas où après ?', '¿Y a dónde vas después?', 'ולאן אתה נוסע אחרי זה?'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.going-to-vietnam')),
        npc('How long will you be there?', 'Tu restes combien de temps ?', '¿Cuánto tiempo vas a estar allí?', 'כמה זמן תהיה שם?'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.ill-be-there')),
        npc("Two weeks in Vietnam? I think that's too short.", 'Deux semaines au Vietnam ? Je pense que c’est trop court.', '¿Dos semanas en Vietnam? Creo que es muy poco.', 'שבועיים בווייטנאם? אני חושב שזה קצר מדי.'),
        you(itemOf(OPINIONS, 'phrase.opin.dont-think-so')),
        npc("Ha! Maybe you're right. Have a great trip!", 'Ha ! Tu as peut-être raison. Bon voyage !', '¡Ja! Puede que tengas razón. ¡Buen viaje!', 'חה! אולי אתה צודק. נסיעה טובה!'),
      ],
    },
    {
      id: 'fin-evening',
      receipt: ['לא הבנת הכל — ביקשת לאט, והבנת. זה בדיוק הכוח.', 'You did not catch everything — you asked for it slowly, and you got it. That is exactly the power.'],
      lines: [
        npc('Welcome back! Is breakfast at seven okay for you tomorrow, or are you leaving early?', 'Bon retour ! Le petit-déjeuner à sept heures, ça vous va demain, ou vous partez tôt ?', '¡Bienvenido de nuevo! ¿Le va bien el desayuno a las siete mañana, o sale temprano?', 'ברוך השב! ארוחת בוקר בשבע מתאימה לך מחר, או שאתה יוצא מוקדם?', 'fast'),
        you(tool('slowly')),
        npc('Tomorrow. Breakfast — at seven. Okay?', 'Demain. Petit-déjeuner — à sept heures. D’accord ?', 'Mañana. Desayuno — a las siete. ¿De acuerdo?', 'מחר. ארוחת בוקר — בשבע. בסדר?', 'slow'),
        you(tool('thank-you'), { say: ['Okay, thank you.', 'D’accord, merci.', 'De acuerdo, gracias.', 'בסדר, תודה.'] }),
        npc('Good night — sleep well!', 'Bonne nuit — dormez bien !', 'Buenas noches — ¡que descanse!', 'לילה טוב — תישן טוב!'),
      ],
    },
  ],
  hear: [known('reply.taxi.here-good'), known('reply.taxi.where-to')],
  closing: ['יום שלם, לבד, בשפה אחרת. אתה מוכן. באמת מוכן.', 'A whole day, alone, in another language. You are ready. Actually ready.'],
};
