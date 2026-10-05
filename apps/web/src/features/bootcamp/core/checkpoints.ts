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
import { DAY16_ITEMS } from '../day16.js';
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
import { DAY16_FR_ITEMS } from '../fr/day16.js';
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
import { DAY16_ES_ITEMS } from '../es/day16.js';
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
 * Conversation (24), No Subtitles (28), the Dress Rehearsal (29) and the finale, A Complete Day
 * Abroad Alone (30). They are retrieval tests, not lessons: EVERY
 * learner line here is a sentence an earlier mission already taught (same id, same wording), in a
 * new combination and at a more natural pace. Only the NPC lines are new.
 * AI linguistic review completed; native review still recommended.
 */
const EN: BootcampItem[] = [...DAY1_ITEMS, ...DAY2_ITEMS, ...DAY3_ITEMS, ...DAY4_ITEMS, ...DAY6_ITEMS, ...DAY7_ITEMS, ...DAY8_ITEMS, ...DAY10_ITEMS, ...DAY12_ITEMS, ...DAY16_ITEMS, ...DAY18_ITEMS];
const FR: BootcampItem[] = [...DAY1_FR_ITEMS, ...DAY2_FR_ITEMS, ...DAY3_FR_ITEMS, ...DAY4_FR_ITEMS, ...DAY6_FR_ITEMS, ...DAY7_FR_ITEMS, ...DAY8_FR_ITEMS, ...DAY10_FR_ITEMS, ...DAY12_FR_ITEMS, ...DAY16_FR_ITEMS, ...DAY18_FR_ITEMS];
const ES: BootcampItem[] = [...DAY1_ES_ITEMS, ...DAY2_ES_ITEMS, ...DAY3_ES_ITEMS, ...DAY4_ES_ITEMS, ...DAY6_ES_ITEMS, ...DAY7_ES_ITEMS, ...DAY8_ES_ITEMS, ...DAY10_ES_ITEMS, ...DAY12_ES_ITEMS, ...DAY16_ES_ITEMS, ...DAY18_ES_ITEMS];
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

/**
 * Everyday Day — the checkpoint of Missions 11–17. One ordinary day, cold: a morning coffee, plans
 * with a friend, the supermarket, dinner. Same rules as Arrival Day: nothing is taught, quizzed or
 * reviewed; no translation before the learner answers; every word was met in Missions 01–17 (a test
 * enforces it); nearly every turn is a real decision between the line that fits and a real line
 * from another moment; a conversation-help tool counts as success; one moment is at natural speed.
 */
export const EVERYDAY_DAY: MissionSpec = {
  day: 17,
  title: ['נקודת ביקורת: יום רגיל', 'CHECKPOINT: Everyday Day'],
  icon: '☀️',
  intro: [
    ['אין חומר חדש היום. רק הוכחה.', 'No new material today. Just proof.'],
    ['יום רגיל אחד: קפה בבוקר, תוכניות עם חבר, קנייה בסופר, וארוחת ערב.', 'One ordinary day: a morning coffee, plans with a friend, the supermarket, and dinner.'],
    ['הכל משפטים שכבר למדת — בסדר חדש, בקצב רגיל, ובלי תרגום.', 'Every line is one you already know — in a new order, at normal speed, with no translation.'],
  ],
  cta: ['להתחיל את היום', 'Start the day'],
  scenes: [
    {
      id: 'cold-morning',
      cold: true,
      receipt: ['בוקר: הזמנת, התלבטת ושילמת — בלי הכנה.', 'Morning: you ordered, hesitated and paid — with no preparation.'],
      lines: [
        npc('Good morning! What can I get you?', 'Bonjour ! Qu’est-ce que je vous sers ?', '¡Buenos días! ¿Qué le sirvo?', 'בוקר טוב! מה להביא לך?', 'fast'),
        you(known('phrase.coffee.iced-coffee'), { wrong: [known('phrase.rest.table-two')] }),
        npc('Sure. Anything to eat?', 'Très bien. Quelque chose à manger ?', 'Claro. ¿Algo de comer?', 'בטח. משהו לאכול?'),
        you(itemOf(TIME_PLANS, 'phrase.time.maybe-later'), { wrong: [known('phrase.money.by-card')] }),
        npc('No problem. Cash or card?', 'Pas de problème. Espèces ou carte ?', 'Sin problema. ¿Efectivo o tarjeta?', 'אין בעיה. מזומן או כרטיס?', 'fast'),
        you(known('phrase.money.by-card'), {
          wrong: [known('phrase.coffee.to-go')],
          rec: { tool: 'slowly', npc: ['Cash — or card?', 'Espèces — ou carte ?', '¿Efectivo — o tarjeta?', 'מזומן — או כרטיס?'] },
        }),
        npc('Thank you! Have a nice day!', 'Merci ! Bonne journée !', '¡Gracias! ¡Que tenga un buen día!', 'תודה! שיהיה יום נעים!'),
      ],
    },
    {
      id: 'cold-plans',
      cold: true,
      receipt: ['קבעת תוכניות למחר, אמרת מה אתה אוהב ומה אתה עושה עכשיו.', 'You made plans for tomorrow, said what you like and what you are doing now.'],
      lines: [
        npc('Hi! Are you free tomorrow?', 'Salut ! Tu es libre demain ?', '¡Hola! ¿Estás libre mañana?', 'היי! אתה פנוי מחר?', 'fast'),
        you(itemOf(TIME_PLANS, 'phrase.time.free-tomorrow'), {
          wrong: [itemOf(TIME_PLANS, 'phrase.time.free-tonight')],
          rec: { tool: 'repeat', npc: ['Tomorrow. Are you — free?', 'Demain. Tu es — libre ?', 'Mañana. ¿Estás — libre?', 'מחר. אתה — פנוי?'] },
        }),
        npc('I surf a lot. Do you like surfing?', 'Je fais beaucoup de surf. Tu aimes le surf ?', 'Hago mucho surf. ¿Te gusta el surf?', 'אני גולש הרבה. אתה אוהב לגלוש?'),
        you(itemOf(HOBBIES, 'phrase.hobby.i-love-surfing'), { wrong: [itemOf(HOBBIES, 'phrase.hobby.i-usually')] }),
        npc('Then come with us! But we leave early.', 'Alors viens avec nous ! Mais on part tôt.', '¡Entonces ven con nosotros! Pero salimos temprano.', 'אז בוא איתנו! אבל אנחנו יוצאים מוקדם.'),
        you(itemOf(TIME_PLANS, 'phrase.time.lets-meet'), { wrong: [itemOf(TIME_PLANS, 'phrase.time.not-too-late')] }),
        npc('Perfect. And what are you doing tonight?', 'Parfait. Et tu fais quoi ce soir ?', 'Perfecto. ¿Y qué haces esta noche?', 'מושלם. ומה אתה עושה הערב?'),
        you(itemOf(HOME_FAMILY, 'phrase.home.going-home'), {
          say: ["I'm tired. I'm going home.", 'Je suis fatigué. Je rentre chez moi.', 'Estoy cansado. Me voy a casa.', 'אני עייף. אני הולך הביתה.'],
          wrong: [itemOf(HOME_FAMILY, 'phrase.home.where-family')],
        }),
        npc('Good night. See you tomorrow!', 'Bonne nuit. À demain !', 'Buenas noches. ¡Nos vemos mañana!', 'לילה טוב. נתראה מחר!'),
      ],
    },
    {
      id: 'cold-shop',
      cold: true,
      receipt: ['סופר: מצאת מוצר, הבנת באיזה מעבר, ועברת קופה.', 'The supermarket: you found a product, understood which aisle, and got through the checkout.'],
      lines: [
        npc('Hi there! Can I help you find something?', 'Bonjour ! Je peux vous aider à trouver quelque chose ?', '¡Hola! ¿Le ayudo a encontrar algo?', 'היי! לעזור לך למצוא משהו?', 'fast'),
        you(known('phrase.super.where-is'), { wrong: [known('phrase.super.need-bag')] }),
        npc('The milk is in aisle three, on the left.', 'Le lait est dans l’allée trois, sur la gauche.', 'La leche está en el pasillo tres, a la izquierda.', 'החלב במעבר שלוש, משמאל.', 'fast'),
        you(tool('thank-you'), {
          wrong: [known('phrase.super.just-this')],
          rec: { tool: 'repeat', npc: ['Aisle — three — on the left.', 'Allée — trois — sur la gauche.', 'Pasillo — tres — a la izquierda.', 'מעבר — שלוש — משמאל.'] },
        }),
        { ...npc('Hi! Is that everything?', 'Bonjour ! Ce sera tout ?', '¡Hola! ¿Eso es todo?', 'היי! זה הכל?'), cue: ['בקופה…', 'At the checkout…'] },
        you(known('phrase.super.just-this'), { wrong: [known('phrase.super.where-is')] }),
        npc('Do you need a bag?', 'Vous avez besoin d’un sac ?', '¿Necesita una bolsa?', 'צריך שקית?'),
        you(known('phrase.super.need-bag'), { wrong: [known('phrase.super.do-you-have')] }),
        npc('Insert your card here… all done. Have a nice day!', 'Insérez votre carte ici… c’est bon. Bonne journée !', 'Inserte su tarjeta aquí… listo. ¡Que tenga un buen día!', 'הכנס את הכרטיס כאן… הכל מוכן. שיהיה יום נעים!'),
      ],
    },
    {
      id: 'cold-dinner',
      cold: true,
      receipt: ['ארוחת ערב שלמה — שולחן, הזמנה, שתייה, חשבון — בקצב רגיל.', 'A whole dinner — table, order, drink, bill — at normal speed.'],
      // One moment at natural speed, built only from what the waiter already said in Mission 14.
      ambush: {
        mode: 'speed',
        npc: ['Perfect, follow me. Here are your menus. Are you ready to order?', 'Parfait, suivez-moi. Voici vos menus. Vous êtes prêts à commander ?', 'Perfecto, sígame. Aquí tienen las cartas. ¿Están listos para pedir?', 'מצוין, בואו אחריי. הנה התפריטים. מוכנים להזמין?'],
        correct: 'reply.rest.ready-to-order',
        wrong: 'reply.rest.to-drink',
        receipt: ['שלושה משפטים ברצף, בקצב רגיל ובלי מילה חדשה — ותפסת ששואלים אם אתה מוכן להזמין.', 'Three sentences in a row, at normal speed, with not one new word — and you caught that you were being asked to order.'],
      },
      lines: [
        npc('Good evening! Do you have a reservation?', 'Bonsoir ! Vous avez une réservation ?', '¡Buenas noches! ¿Tiene reserva?', 'ערב טוב! יש לכם הזמנה?', 'fast'),
        you(known('phrase.rest.table-two'), {
          say: ['No — a table for two, please.', 'Non — une table pour deux, s’il vous plaît.', 'No — una mesa para dos, por favor.', 'לא — שולחן לשניים, בבקשה.'],
          wrong: [known('phrase.rest.the-bill')],
        }),
        npc('Are you ready to order?', 'Vous êtes prêts à commander ?', '¿Están listos para pedir?', 'מוכנים להזמין?'),
        you(known('phrase.rest.ill-have-chicken'), {
          say: ["I'll have the chicken, without onions, please.", 'Je vais prendre le poulet, sans oignons, s’il vous plaît.', 'Voy a tomar el pollo, sin cebolla, por favor.', 'אני אקח את העוף, בלי בצל, בבקשה.'],
          wrong: [known('phrase.rest.water')],
        }),
        npc('Of course. Anything to drink?', 'Bien sûr. Quelque chose à boire ?', 'Claro. ¿Algo de beber?', 'כמובן. משהו לשתות?'),
        you(known('phrase.rest.water'), { wrong: [known('phrase.rest.table-two')] }),
        { ...npc('Is everything okay?', 'Tout va bien ?', '¿Va todo bien?', 'הכל בסדר?'), cue: ['מאוחר יותר…', 'Later…'] },
        you(known('phrase.rest.the-bill'), {
          say: ['Yes, that was delicious! The bill, please.', 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', '¡Sí, estaba delicioso! La cuenta, por favor.', 'כן, היה טעים מאוד! החשבון, בבקשה.'],
          wrong: [known('phrase.rest.ill-have-chicken')],
        }),
        npc('So glad you enjoyed it. Here you are — have a lovely evening!', 'Ravi que ça vous ait plu. Voici — passez une bonne soirée !', 'Me alegro de que les gustara. Aquí tienen — ¡que pasen buena noche!', 'שמח שנהניתם. בבקשה — ערב נעים!'),
      ],
    },
  ],
  hear: [known('reply.rest.ready-to-order'), known('reply.rest.to-drink')],
  closing: ['יום רגיל שלם, בלי עזרה: קפה, תוכניות עם חבר, סופר וארוחת ערב — וגם כשזה היה מהיר, לא קפאת.', 'A whole ordinary day, alone: coffee, plans with a friend, the supermarket and dinner — and when it got fast, you did not freeze.'],
};

/**
 * City & Conversation — the checkpoint of Missions 19–23: one day in a city, cold. The station, a
 * chat with a local, a meal that goes wrong, and an evening talk with another traveler about what
 * you did and where you are going. Same rules as the earlier checkpoints: nothing is taught, quizzed
 * or reviewed; no translation before the learner answers; every word was met in Missions 01–23 (a
 * test enforces it); every turn is a real decision between the line that fits and a real line from
 * another moment — often the same idea in the wrong time (went / going); a conversation-help tool
 * counts as success; one moment is at natural speed.
 */
export const CITY_CONVERSATION: MissionSpec = {
  day: 23,
  title: ['נקודת ביקורת: עיר ושיחה', 'CHECKPOINT: City & Conversation'],
  icon: '🏙️',
  intro: [
    ['אין חומר חדש היום. רק הוכחה.', 'No new material today. Just proof.'],
    ['יום אחד בעיר: תחנה, שיחה עם מקומי, ארוחה שמשתבשת, ושיחת ערב עם מטייל — בלי הכנה ובלי תרגום.', 'One day in a city: the station, a chat with a local, a meal that goes wrong, and an evening talk with a traveler — unprepared and untranslated.'],
  ],
  cta: ['לצאת לעיר', 'Head into the city'],
  scenes: [
    {
      id: 'cold-transport',
      cold: true,
      receipt: ['כרטיס, רציף ותחנה — בקצב של תחנה אמיתית.', 'Ticket, platform and stop — at the pace of a real station.'],
      // A correction at natural speed, made only of what Mission 19 already said.
      ambush: {
        mode: 'speed',
        npc: ["You're going the wrong way. Platform two — it leaves every ten minutes.", 'Vous allez dans le mauvais sens. Quai numéro deux — ça part toutes les dix minutes.', 'Va en dirección contraria. Andén número dos — sale cada diez minutos.', 'אתה בכיוון הלא נכון. רציף שתיים — יוצא כל עשר דקות.'],
        correct: 'reply.trans.wrong-way',
        wrong: 'reply.trans.three-stops',
        receipt: ['תיקון מהיר על הרציף, בלי מילה חדשה — והבנת שאתה בכיוון הלא נכון.', 'A quick correction on the platform, with not one new word — and you understood you were going the wrong way.'],
      },
      lines: [
        npc('Hello! Where are you headed?', 'Bonjour ! Vous allez où ?', '¡Hola! ¿A dónde va?', 'שלום! לאן אתה נוסע?', 'fast'),
        you(known('phrase.trans.one-ticket'), { wrong: [known('phrase.trans.does-stop')] }),
        npc('Single or return?', 'Aller simple ou aller-retour ?', '¿Solo ida o ida y vuelta?', 'הלוך או הלוך-חזור?', 'fast'),
        you(known('phrase.trans.single'), {
          wrong: [known('phrase.trans.which-platform')],
          rec: { tool: 'slowly', npc: ['Single — or — return?', 'Aller simple — ou — aller-retour ?', '¿Solo ida — o — ida y vuelta?', 'הלוך — או — הלוך-חזור?'] },
        }),
        npc("That's three euros. It leaves every ten minutes.", 'Ça fait trois euros. Ça part toutes les dix minutes.', 'Son tres euros. Sale cada diez minutos.', 'זה שלושה יורו. יוצא כל עשר דקות.'),
        you(known('phrase.trans.which-platform'), { wrong: [known('phrase.trans.one-ticket')] }),
        npc('Platform two. Straight ahead.', 'Quai numéro deux. Tout droit.', 'Andén número dos. Todo recto.', 'רציף שתיים. ישר קדימה.'),
        you(known('phrase.trans.does-stop'), { wrong: [known('phrase.trans.single')] }),
        npc("Yes — it's three stops. I'll tell you when.", 'Oui — c’est à trois arrêts. Je vous dirai quand.', 'Sí — son tres paradas. Le aviso cuándo.', 'כן — זה שלוש תחנות. אני אגיד לך מתי.'),
      ],
    },
    {
      id: 'cold-chat',
      cold: true,
      receipt: ['שיחה עם מקומי: מה אתה אוהב, מה אתה חושב, ומה מומלץ.', 'A chat with a local: what you like, what you think, and what to try.'],
      lines: [
        npc('Welcome! Do you like it here?', 'Bienvenue ! Ça vous plaît ici ?', '¡Bienvenido! ¿Le gusta este lugar?', 'ברוך הבא! אתה אוהב את המקום?'),
        you(itemOf(SMALL_TALK, 'phrase.talk.i-like-it'), {
          say: ['Yes, I like it a lot.', 'Oui, j’aime beaucoup.', 'Sí, me gusta mucho.', 'כן, אני מאוד אוהב.'],
          wrong: [itemOf(SMALL_TALK, 'phrase.talk.nice-talking')],
        }),
        npc("You should take the boat tour. It's fifty euros.", 'Vous devriez faire le tour en bateau. C’est cinquante euros.', 'Debería hacer el paseo en barco. Son cincuenta euros.', 'כדאי לך לעשות את הסיור בסירה. זה חמישים יורו.'),
        you(itemOf(OPINIONS, 'phrase.opin.i-think-expensive'), { wrong: [itemOf(OPINIONS, 'phrase.opin.because')] }),
        npc("Really? Then you should try the old town. It's free.", 'Vraiment ? Alors vous devriez essayer la vieille ville. C’est gratuit.', '¿De verdad? Entonces debería visitar el casco antiguo. Es gratis.', 'באמת? אז כדאי לך לנסות את העיר העתיקה. זה בחינם.'),
        you(itemOf(SMALL_TALK, 'phrase.talk.recommend-place'), { wrong: [itemOf(OPINIONS, 'phrase.opin.dont-think-so')] }),
        npc("Of course — try 'Mama Rosa', in the old town. It's very good.", 'Bien sûr — essayez « Mama Rosa », dans la vieille ville. C’est très bon.', 'Claro — pruebe «Mama Rosa», en el casco antiguo. Es muy bueno.', "בטח — תנסה את 'מאמא רוזה', בעיר העתיקה. מאוד טוב שם."),
      ],
    },
    {
      id: 'cold-problem',
      cold: true,
      receipt: ['המנה הלא נכונה הגיעה — ואמרת את זה, בנימוס, עד שזה סודר.', 'The wrong dish arrived — and you said so, politely, until it was sorted.'],
      lines: [
        npc("Here's your meal — one steak!", 'Voici votre plat — un steak !', 'Aquí tiene su plato — ¡un filete!', 'הנה הארוחה שלך — סטייק אחד!', 'fast'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.not-ordered'), {
          wrong: [itemOf(FIXING_PROBLEMS, 'phrase.fix.no-problem-thanks')],
          rec: { tool: 'repeat', npc: ['Your meal. One — steak.', 'Votre plat. Un — steak.', 'Su plato. Un — filete.', 'הארוחה שלך. סטייק — אחד.'] },
        }),
        npc("Oh no, I'm so sorry! What did you order?", 'Oh non, je suis vraiment désolé ! Qu’avez-vous commandé ?', '¡Ay, lo siento muchísimo! ¿Qué pidió?', 'אוי לא, אני מצטער מאוד! מה הזמנת?'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.i-ordered'), { wrong: [itemOf(FIXING_PROBLEMS, 'phrase.fix.charged-twice')] }),
        npc("Of course — I'll bring the right one right away.", 'Bien sûr — je vous apporte le bon tout de suite.', 'Claro — le traigo el correcto enseguida.', 'כמובן — אביא את הנכון מיד.'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.no-problem-thanks'), { wrong: [itemOf(FIXING_PROBLEMS, 'phrase.fix.can-you-fix')] }),
        npc('Thank you for your patience. Dessert is on the house!', 'Merci de votre patience. Le dessert est offert par la maison !', 'Gracias por su paciencia. ¡El postre corre por cuenta de la casa!', 'תודה על הסבלנות. הקינוח על חשבון הבית!'),
      ],
    },
    {
      id: 'cold-hostel',
      cold: true,
      receipt: ['סיפרת מה עשית, לאן אתה נוסע ולכמה זמן — ושאלת בחזרה. זו כבר שיחה אמיתית.', 'You said what you did, where you are going and for how long — and asked back. That is a real conversation.'],
      lines: [
        npc('Hey! Where were you yesterday?', 'Salut ! Tu étais où hier ?', '¡Hola! ¿Dónde estuviste ayer?', 'היי! איפה היית אתמול?', 'fast'),
        you(itemOf(PAST_EVENTS, 'phrase.past.i-went'), {
          wrong: [itemOf(FUTURE_PLANS, 'phrase.future.going-to-vietnam')],
          rec: { tool: 'slowly', npc: ['Yesterday. Where — were you?', 'Hier. Tu étais — où ?', 'Ayer. ¿Dónde — estuviste?', 'אתמול. איפה — היית?'] },
        }),
        npc('Did you like it?', 'Tu as aimé ?', '¿Te gustó?', 'אהבת?'),
        you(itemOf(PAST_EVENTS, 'phrase.past.it-was-great'), { wrong: [itemOf(PAST_EVENTS, 'phrase.past.i-stayed')] }),
        npc('So, where are you going next?', 'Alors, tu vas où après ?', 'Bueno, ¿a dónde vas después?', 'אז לאן אתה נוסע אחרי זה?'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.going-to-vietnam'), { wrong: [itemOf(PAST_EVENTS, 'phrase.past.i-went')] }),
        npc('Wow! How long will you be there?', 'Waouh ! Tu restes combien de temps ?', '¡Guau! ¿Cuánto tiempo vas a estar allí?', 'וואו! כמה זמן תהיה שם?'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.ill-be-there'), { wrong: [itemOf(FUTURE_PLANS, 'phrase.future.after-that')] }),
        npc("Already! We'll miss you.", 'Déjà ! Tu vas nous manquer.', '¡Ya! Te vamos a echar de menos.', 'כבר! נתגעגע אליך.'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.where-next'), {
          say: ['And you? Where are you going next?', 'Et toi ? Tu vas où après ?', '¿Y tú? ¿A dónde vas después?', 'ואתה? לאן אתה נוסע אחרי זה?'],
          wrong: [itemOf(PAST_EVENTS, 'phrase.past.it-was-good')],
        }),
        npc("Me? I'm going home. Are you coming?", 'Moi ? Je rentre chez moi. Tu viens ?', '¿Yo? Me voy a casa. ¿Vienes?', 'אני? אני חוזר הביתה. אתה בא?'),
        you(itemOf(OPINIONS, 'phrase.opin.not-sure'), {
          say: ["Maybe. I'm not sure — I'm tired.", 'Peut-être. Je ne suis pas sûr — je suis fatigué.', 'Quizás. No estoy seguro — estoy cansado.', 'אולי. אני לא בטוח — אני עייף.'],
          wrong: [itemOf(OPINIONS, 'phrase.opin.because')],
        }),
        npc('Great! See you at six!', 'Super ! À six heures !', '¡Genial! ¡Nos vemos a las seis!', 'מעולה! נתראה בשש!'),
      ],
    },
  ],
  hear: [known('reply.trans.wrong-way'), known('reply.trans.three-stops')],
  closing: ['יום שלם בעיר, בלי עזרה: תחנה, שיחה עם מקומי, בעיה שנפתרה, ושיחה על מה שעשית ולאן אתה ממשיך — וגם כשזה היה מהיר, לא קפאת.', 'A whole day in a city, alone: the station, a chat with a local, a problem solved, and a talk about what you did and where you go next — and when it got fast, you did not freeze.'],
};

/**
 * No Subtitles — Mission 28. Nothing is taught, and nothing the other speaker says is WRITTEN before
 * the learner answers: every scene is `audio` (heard only — no transcript, no translation; a bubble
 * replays the line). The learner's own possible answers are still written, in the target language.
 *   - Zero new language: every word, in every language, was met in Missions 01–27 (a test enforces it).
 *   - Twelve real decisions across a station, a restaurant and a chat with a local — the line that
 *     fits against a real line from another moment.
 *   - Natural speed throughout. Asking to hear it again is offered on the two densest lines only.
 * After the answer the feedback card shows what was said, with its translation.
 */
export const NO_SUBTITLES: MissionSpec = {
  day: 27,
  title: ['בלי כתוביות', 'No Subtitles'],
  icon: '🎧',
  numbered: true,
  intro: [
    ['אין כאן מילה חדשה. הקושי הוא שאתה רק שומע.', 'There is not one new word here. The difficulty is that you only hear it.'],
    ['מה שאומרים לך לא כתוב על המסך — לא בשפה שאתה לומד ולא בתרגום. מקשיבים, ועונים.', 'What people say to you is not written on the screen — not in the language you are learning, and not in translation. You listen, and you answer.'],
    ['שלוש סצנות קצרות בקצב רגיל: תחנה, מסעדה, שיחה. אפשר תמיד לשמוע שוב.', 'Three short scenes at normal speed: a station, a restaurant, a chat. You can always hear a line again.'],
  ],
  cta: ['להוריד את הכתוביות', 'Take the subtitles off'],
  scenes: [
    {
      id: 'ns-transit',
      audio: true,
      receipt: ['תחנה, רק באוזניים: יעד, סוג כרטיס, תשלום ורציף.', 'A station, by ear alone: destination, ticket type, payment and platform.'],
      lines: [
        npc('Hello! Where to?', 'Bonjour ! Où allez-vous ?', '¡Hola! ¿A dónde va?', 'שלום! לאן?', 'fast'),
        you(known('phrase.trans.one-ticket'), { wrong: [known('phrase.taxi.to-address')] }),
        npc('Single or return?', 'Aller simple ou aller-retour ?', '¿Solo ida o ida y vuelta?', 'הלוך או הלוך-חזור?', 'fast'),
        you(known('phrase.trans.single'), { wrong: [known('phrase.money.in-cash')] }),
        npc("That's three euros. Cash or card?", 'Ça fait trois euros. Espèces ou carte ?', 'Son tres euros. ¿Efectivo o tarjeta?', 'זה שלושה יורו. מזומן או כרטיס?', 'fast'),
        you(known('phrase.money.by-card'), { wrong: [known('phrase.trans.single')] }),
        npc('Platform two. It leaves every ten minutes.', 'Quai numéro deux. Ça part toutes les dix minutes.', 'Andén número dos. Sale cada diez minutos.', 'רציף שתיים. יוצא כל עשר דקות.', 'fast'),
        // The platform was just given: asking for it again shows the line was not caught.
        you(known('phrase.trans.does-stop'), {
          wrong: [known('phrase.trans.which-platform')],
          rec: { tool: 'repeat', npc: ['Platform — two. Every — ten — minutes.', 'Quai — numéro deux. Toutes — les dix — minutes.', 'Andén — número dos. Cada — diez — minutos.', 'רציף — שתיים. כל — עשר — דקות.'] },
        }),
        npc("Yes — it's three stops. I'll tell you when.", 'Oui — c’est à trois arrêts. Je vous dirai quand.', 'Sí — son tres paradas. Le aviso cuándo.', 'כן — זה שלוש תחנות. אני אגיד לך מתי.', 'fast'),
      ],
    },
    {
      id: 'ns-diner',
      audio: true,
      receipt: ['מסעדה, רק באוזניים: שולחן, שתייה, הזמנה וחשבון.', 'A restaurant, by ear alone: table, drink, order and bill.'],
      lines: [
        npc('Good evening! A table for how many people?', 'Bonsoir ! Une table pour combien de personnes ?', '¡Buenas noches! ¿Una mesa para cuántas personas?', 'ערב טוב! שולחן לכמה אנשים?', 'fast'),
        you(known('phrase.rest.table-two'), { wrong: [known('phrase.rest.ill-have')] }),
        npc('Perfect, follow me. Here are your menus. Anything to drink?', 'Parfait, suivez-moi. Voici vos menus. Quelque chose à boire ?', 'Perfecto, sígame. Aquí tienen las cartas. ¿Algo de beber?', 'מצוין, בואו אחריי. הנה התפריטים. משהו לשתות?', 'fast'),
        you(known('phrase.rest.water'), {
          wrong: [known('phrase.rest.the-bill')],
          rec: { tool: 'slowly', npc: ['Anything — to drink?', 'Quelque chose — à boire ?', '¿Algo — de beber?', 'משהו — לשתות?'] },
        }),
        npc('Are you ready to order?', 'Vous êtes prêts à commander ?', '¿Están listos para pedir?', 'מוכנים להזמין?', 'fast'),
        you(known('phrase.rest.ill-have'), { wrong: [known('phrase.rest.delicious')] }),
        // The jump in time is a scene transition, not something the waiter says: it is shown (in the
        // app language) and never spoken, so it is not part of what the learner has to catch by ear.
        { ...npc('Is everything okay?', 'Tout va bien ?', '¿Va todo bien?', 'הכל בסדר?', 'fast'), cue: ['מאוחר יותר…', 'Later…'] },
        you(known('phrase.rest.the-bill'), {
          say: ['Yes, that was delicious! The bill, please.', 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', '¡Sí, estaba delicioso! La cuenta, por favor.', 'כן, היה טעים מאוד! החשבון, בבקשה.'],
          wrong: [known('phrase.rest.no-onions')],
        }),
        npc('So glad you enjoyed it. Here you are — have a lovely evening!', 'Ravi que ça vous ait plu. Voici — passez une bonne soirée !', 'Me alegro de que les gustara. Aquí tienen — ¡que pasen buena noche!', 'שמח שנהניתם. בבקשה — ערב נעים!', 'fast'),
      ],
    },
    {
      id: 'ns-local',
      audio: true,
      receipt: ['שיחה עם מקומי, רק באוזניים: מחמאה, פעם ראשונה, המלצה ופרידה.', 'A chat with a local, by ear alone: a compliment, first time here, a recommendation and goodbye.'],
      lines: [
        npc("Hi! Beautiful view, isn't it?", 'Bonjour ! Belle vue, n’est-ce pas ?', '¡Hola! Bonita vista, ¿verdad?', 'היי! נוף יפה, נכון?', 'fast'),
        you(itemOf(SMALL_TALK, 'phrase.talk.beautiful-place'), { wrong: [known('phrase.social.from-israel')] }),
        npc('It really is. Is this your first time here?', 'C’est vrai. C’est votre première fois ici ?', 'Es verdad. ¿Es su primera vez aquí?', 'באמת. זו הפעם הראשונה שלך כאן?', 'fast'),
        you(known('phrase.social.first-time'), {
          say: ["Yes, it's my first time here.", 'Oui, c’est ma première fois ici.', 'Sí, es mi primera vez aquí.', 'כן, זו הפעם הראשונה שלי כאן.'],
          wrong: [itemOf(SMALL_TALK, 'phrase.talk.i-like-it')],
        }),
        npc('Welcome! You should try the old town.', 'Bienvenue ! Vous devriez essayer la vieille ville.', '¡Bienvenido! Debería visitar el casco antiguo.', 'ברוך הבא! כדאי לך לנסות את העיר העתיקה.', 'fast'),
        you(itemOf(SMALL_TALK, 'phrase.talk.recommend-place'), { wrong: [itemOf(SMALL_TALK, 'phrase.talk.nice-talking')] }),
        npc("Of course — try 'Mama Rosa', in the old town. It's very good.", 'Bien sûr — essayez « Mama Rosa », dans la vieille ville. C’est très bon.', 'Claro — pruebe «Mama Rosa», en el casco antiguo. Es muy bueno.', "בטח — תנסה את 'מאמא רוזה', בעיר העתיקה. מאוד טוב שם.", 'fast'),
        you(itemOf(SMALL_TALK, 'phrase.talk.nice-talking'), {
          say: ['Thank you! It was nice talking to you.', 'Merci ! C’était sympa de discuter avec vous.', '¡Gracias! Ha sido un placer hablar con usted.', 'תודה! היה נעים לדבר איתך.'],
          wrong: [itemOf(SMALL_TALK, 'phrase.talk.how-about-you')],
        }),
        npc('You too! Enjoy the rest of your trip!', 'Vous aussi ! Profitez bien du reste de votre voyage !', '¡Igualmente! ¡Que disfrute del resto del viaje!', 'גם אתה! תיהנה מהמשך הטיול!', 'fast'),
      ],
    },
  ],
  hear: [],
  closing: ['שלוש סצנות בלי כתוביות ובלי תרגום — שמעת, הבנת וענית. וכשזה היה צפוף מדי, ביקשת לשמוע שוב.', 'Three scenes with no subtitles and no translation — you heard, understood and answered. And when a line was too dense, you asked to hear it again.'],
};

/**
 * Dress Rehearsal — Mission 29. One continuous evening: taxi → restaurant → the wrong dish →
 * payment. Nothing is taught, quizzed or reviewed, and nothing is translated before the learner
 * answers (`cold`).
 *   - Zero new language: every word was met in Missions 01–28 (a test enforces it).
 *   - Thirteen real decisions; the wrong option is a real line from another moment of the evening.
 *   - Exactly one disruption (the wrong dish) and one faster moment (the bill).
 *   - A Recovery budget of two: asking again is offered where a line is fast or unexpected, not on
 *     every screen — and it changes what happens (the line is said again, slowly).
 */
export const DRESS_REHEARSAL: MissionSpec = {
  day: 28,
  title: ['חזרה גנרלית: ערב שלם', 'Dress Rehearsal: Full Evening'],
  icon: '🎬',
  numbered: true,
  intro: [
    ['אין חומר חדש, ואין תרגום. ערב שלם ברצף: מונית, מסעדה, תקלה אחת, תשלום.', 'No new material, and no translation. One evening in a row: taxi, restaurant, one thing that goes wrong, payment.'],
    ['זו החזרה של הספורטאי לפני יום התחרות. בכל רגע בוחרים את המשפט שמתאים — לא כל משפט מתאים.', 'This is the athlete’s rehearsal before race day. At every turn you choose the line that fits — not every line does.'],
  ],
  cta: ['אקשן — מתחילים', 'Action — begin'],
  scenes: [
    {
      id: 'dr-taxi',
      cold: true,
      receipt: ['מונית: יעד, שיחה קצרה ועצירה. הערב יצא לדרך.', 'Taxi: destination, a little chat and the stop. The evening is underway.'],
      lines: [
        npc('Good evening! Where to?', 'Bonsoir ! Où allez-vous ?', '¡Buenas noches! ¿A dónde va?', 'ערב טוב! לאן?'),
        you(known('phrase.taxi.to-address'), { wrong: [known('phrase.rest.table-two')] }),
        npc('No problem. First time in the city?', 'Pas de problème. C’est votre première fois dans la ville ?', 'Sin problema. ¿Es su primera vez en la ciudad?', 'אין בעיה. פעם ראשונה בעיר?'),
        you(known('phrase.social.first-time'), {
          say: ["Yes, it's my first time here.", 'Oui, c’est ma première fois ici.', 'Sí, es mi primera vez aquí.', 'כן, זו הפעם הראשונה שלי כאן.'],
          wrong: [known('phrase.taxi.keep-change')],
        }),
        npc('…We are almost there. Is here okay?', '…On est presque arrivés. Ici, ça va ?', '…Ya casi llegamos. ¿Aquí está bien?', '…כמעט הגענו. כאן זה בסדר?'),
        you(known('phrase.taxi.stop-here'), {
          say: ['Stop here, please. Keep the change.', 'Arrêtez-vous ici, s’il vous plaît. Gardez la monnaie.', 'Pare aquí, por favor. Quédese con el cambio.', 'עצור כאן, בבקשה. תשאיר את העודף.'],
          wrong: [known('phrase.taxi.to-address')],
        }),
        npc('Thank you very much! Have a lovely evening!', 'Merci beaucoup ! Passez une bonne soirée !', '¡Muchas gracias! ¡Buenas noches!', 'תודה רבה! ערב נעים!'),
      ],
    },
    {
      id: 'dr-order',
      cold: true,
      receipt: ['שולחן, הזמנה ושתייה — בלי הכנה.', 'Table, order and a drink — with no preparation.'],
      lines: [
        npc('Welcome! A table for how many people?', 'Bienvenue ! Une table pour combien de personnes ?', '¡Bienvenido! ¿Una mesa para cuántas personas?', 'ברוך הבא! שולחן לכמה אנשים?'),
        you(known('phrase.rest.table-two'), { wrong: [known('phrase.border.two-weeks')] }),
        npc('Perfect, follow me. Are you ready to order?', 'Parfait, suivez-moi. Vous êtes prêts à commander ?', 'Perfecto, sígame. ¿Están listos para pedir?', 'מצוין, בואו אחריי. מוכנים להזמין?'),
        you(known('phrase.rest.ill-have'), { wrong: [known('phrase.rest.delicious')] }),
        npc('Of course. Anything to drink?', 'Bien sûr. Quelque chose à boire ?', 'Claro. ¿Algo de beber?', 'כמובן. משהו לשתות?'),
        you(known('phrase.rest.water'), { wrong: [known('phrase.rest.the-bill')] }),
        npc('Anything else?', 'Autre chose ?', '¿Algo más?', 'עוד משהו?'),
        you(known('phrase.coffee.thats-all'), { wrong: [known('phrase.rest.table-two')] }),
        npc('Coming right up!', 'Ça arrive tout de suite !', '¡Enseguida se lo traigo!', 'תכף מגיע!'),
      ],
    },
    {
      id: 'dr-problem',
      cold: true,
      receipt: ['ההפתעה היחידה של הערב: מנה שגויה — ואמרת את זה, בנימוס, עד שזה סודר.', 'The one surprise of the evening: the wrong dish — and you said so, politely, until it was sorted.'],
      lines: [
        npc("Here's your meal — one steak!", 'Voici votre plat — un steak !', 'Aquí tiene su plato — ¡un filete!', 'הנה הארוחה שלך — סטייק אחד!'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.not-ordered'), {
          wrong: [known('phrase.rest.delicious')],
          rec: { tool: 'repeat', npc: ['Your meal. One — steak.', 'Votre plat. Un — steak.', 'Su plato. Un — filete.', 'הארוחה שלך. סטייק — אחד.'] },
        }),
        npc("Oh no, I'm so sorry! What did you order?", 'Oh non, je suis vraiment désolé ! Qu’avez-vous commandé ?', '¡Ay, lo siento muchísimo! ¿Qué pidió?', 'אוי לא, אני מצטער מאוד! מה הזמנת?'),
        // The same dish in the wrong tense: "I'll have…" orders it again instead of saying what was ordered.
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.i-ordered'), { wrong: [known('phrase.rest.ill-have')] }),
        npc("Of course — I'll bring the right one right away.", 'Bien sûr — je vous apporte le bon tout de suite.', 'Claro — le traigo el correcto enseguida.', 'כמובן — אביא את הנכון מיד.'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.no-problem-thanks'), { wrong: [itemOf(FIXING_PROBLEMS, 'phrase.fix.can-you-fix')] }),
        npc("Thank you for your patience. Here's your pasta.", 'Merci de votre patience. Voici vos pâtes.', 'Gracias por su paciencia. Aquí tiene su pasta.', 'תודה על הסבלנות. הנה הפסטה שלך.'),
      ],
    },
    {
      id: 'dr-pay',
      cold: true,
      receipt: ['חשבון ותשלום — גם כשזה נאמר מהר.', 'The bill and the payment — even when it was said fast.'],
      lines: [
        { ...npc('Is everything okay?', 'Tout va bien ?', '¿Va todo bien?', 'הכל בסדר?'), cue: ['מאוחר יותר…', 'Later…'] },
        you(known('phrase.rest.the-bill'), {
          say: ['Yes, that was delicious! The bill, please.', 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', '¡Sí, estaba delicioso! La cuenta, por favor.', 'כן, היה טעים מאוד! החשבון, בבקשה.'],
          wrong: [known('phrase.rest.water')],
        }),
        // The one faster moment of the evening.
        npc("Here's your bill. That's twenty euros. Cash or card?", 'Voici l’addition. Ça fait vingt euros. Espèces ou carte ?', 'Aquí tiene la cuenta. Son veinte euros. ¿Efectivo o tarjeta?', 'הנה החשבון. זה עשרים יורו. מזומן או כרטיס?', 'fast'),
        you(known('phrase.money.by-card'), {
          wrong: [known('phrase.money.how-much')],
          rec: { tool: 'slowly', npc: ['Twenty euros. Cash — or card?', 'Vingt euros. Espèces — ou carte ?', 'Veinte euros. ¿Efectivo — o tarjeta?', 'עשרים יורו. מזומן — או כרטיס?'] },
        }),
        npc('Insert your card here… all done. Would you like the receipt?', 'Insérez votre carte ici… c’est bon. Vous voulez le ticket ?', 'Inserte su tarjeta aquí… listo. ¿Quiere el recibo?', 'הכנס את הכרטיס כאן… הכל מוכן. רוצה קבלה?'),
        you(known('phrase.coffee.yes-please'), { wrong: [known('phrase.taxi.keep-change')] }),
        npc('Here you go. Have a lovely evening!', 'Voilà. Passez une bonne soirée !', 'Aquí tiene. ¡Buenas noches!', 'בבקשה. ערב נעים!'),
      ],
    },
  ],
  hear: [],
  closing: ['ערב שלם בטייק אחד — מונית, הזמנה, מנה שגויה שתוקנה, ותשלום. בכל רגע בחרת את המשפט שמתאים.', 'A full evening in one take — taxi, order, a wrong dish put right, and payment. At every turn you chose the line that fits.'],
};

/**
 * A Complete Day Abroad Alone — Mission 30, the final proof (not another checkpoint): one coherent
 * day, morning to night. Nothing is taught, quizzed or reviewed; nothing is translated before the
 * learner answers (`cold`).
 *   - Zero new language: every word was met in Missions 01–29 (a test enforces it).
 *   - Twenty-one real decisions and one closing line; a miss gets a brief slow re-ask and rejoins.
 *   - Morning at the hotel desk → a taxi → a meal with ONE real problem (the dish arrives with what
 *     was asked to be left out) → a conversation with another traveler (where from, what you did,
 *     where next, an opinion, and asking back) → an evening line that is genuinely dense.
 *   - Three Recovery moments, each on a fast or dense line. No police, medical or emergency incident
 *     is manufactured: it is an ordinary day that goes well.
 */
export const COMPLETE_DAY: MissionSpec = {
  day: 29,
  title: ['יום שלם לבד בחו״ל', 'A Complete Day Abroad Alone'],
  icon: '🎖️',
  intro: [
    ['זה היום. מבוקר עד לילה, לבד — בלי חומר חדש, בלי חזרה ובלי תרגום.', 'This is the day. Morning to night, alone — with nothing new, no review and no translation.'],
    ['בוקר במלון, מונית, ארוחה שמשהו בה משתבש, שיחה עם מטייל, וערב שבו מדברים אליך מהר.', 'A morning at the hotel, a taxi, a meal where something goes wrong, a talk with a traveler, and an evening where someone speaks to you fast.'],
    ['בכל רגע בוחרים את המשפט שמתאים. וכשלא תופסים — מבקשים שוב. גם זה חלק מלדעת שפה.', 'At every turn you choose the line that fits. And when you do not catch it — you ask again. That is part of knowing a language, too.'],
  ],
  cta: ['לצאת ליום', 'Start the day'],
  scenes: [
    {
      id: 'fin-morning',
      cold: true,
      receipt: ['בוקר: אמרת מה יש לך וביקשת מה שחסר.', 'Morning: you said what you have and asked for what you were missing.'],
      lines: [
        npc('Good morning! Do you have your key?', 'Bonjour ! Vous avez votre clé ?', '¡Buenos días! ¿Tiene su llave?', 'בוקר טוב! יש לך את המפתח?'),
        you(itemOf(EVERYDAY_CORE, 'phrase.core.i-have'), { wrong: [known('phrase.hotel.reservation')] }),
        npc('Good. Do you need anything?', 'Très bien. Vous avez besoin de quelque chose ?', 'Muy bien. ¿Necesita algo?', 'יופי. אתה צריך משהו?'),
        you(itemOf(EVERYDAY_CORE, 'phrase.core.do-you-have'), { wrong: [itemOf(EVERYDAY_CORE, 'phrase.core.i-know')] }),
        npc('Here you go. Have a great day!', 'Tenez. Bonne journée !', 'Aquí tiene. ¡Que tenga un buen día!', 'בבקשה. שיהיה יום מעולה!'),
      ],
    },
    {
      id: 'fin-taxi',
      cold: true,
      receipt: ['מונית: יעד, שיחה, מחיר ועצירה — גם כשהמחיר נאמר מהר.', 'Taxi: destination, a chat, the fare and the stop — even when the fare came fast.'],
      lines: [
        npc('Hello! Where to?', 'Bonjour ! Où allez-vous ?', '¡Hola! ¿A dónde va?', 'שלום! לאן?'),
        you(known('phrase.taxi.to-address'), { wrong: [known('phrase.trans.one-ticket')] }),
        npc('How long are you here for?', 'Vous êtes ici pour combien de temps ?', '¿Cuánto tiempo está aquí?', 'לכמה זמן אתה כאן?'),
        you(known('phrase.border.two-weeks'), { wrong: [known('phrase.border.staying-hotel')] }),
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
        npc('Thank you very much! Enjoy your day!', 'Merci beaucoup ! Bonne journée !', '¡Muchas gracias! ¡Que tenga un buen día!', 'תודה רבה! שיהיה יום נעים!'),
      ],
    },
    {
      id: 'fin-lunch',
      cold: true,
      receipt: ['ארוחה: הזמנת בלי בצל, קיבלת עם — אמרת את זה, זה תוקן, ושילמת.', 'A meal: you ordered it without onions, it came with them — you said so, it was put right, and you paid.'],
      lines: [
        npc('Hello! Do you have a reservation?', 'Bonjour ! Vous avez une réservation ?', '¡Hola! ¿Tiene reserva?', 'שלום! יש לכם הזמנה?'),
        you(known('phrase.rest.table-two'), {
          say: ['No — a table for two, please.', 'Non — une table pour deux, s’il vous plaît.', 'No — una mesa para dos, por favor.', 'לא — שולחן לשניים, בבקשה.'],
          wrong: [known('phrase.rest.the-bill')],
        }),
        npc('Are you ready to order?', 'Vous êtes prêts à commander ?', '¿Están listos para pedir?', 'מוכנים להזמין?'),
        you(known('phrase.rest.ill-have-chicken'), {
          say: ["I'll have the chicken, without onions, please.", 'Je vais prendre le poulet, sans oignons, s’il vous plaît.', 'Voy a tomar el pollo, sin cebolla, por favor.', 'אני אקח את העוף, בלי בצל, בבקשה.'],
          wrong: [known('phrase.rest.delicious')],
        }),
        // The one real problem of the day, said fast.
        npc("Here's your chicken — with onions!", 'Voici votre poulet — avec des oignons !', 'Aquí tiene su pollo — ¡con cebolla!', 'הנה העוף שלך — עם בצל!', 'fast'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.not-ordered'), {
          wrong: [known('phrase.rest.delicious')],
          rec: { tool: 'repeat', npc: ['Your chicken. With — onions.', 'Votre poulet. Avec — des oignons.', 'Su pollo. Con — cebolla.', 'העוף שלך. עם — בצל.'] },
        }),
        npc("Oh no, I'm so sorry! What did you order?", 'Oh non, je suis vraiment désolé ! Qu’avez-vous commandé ?', '¡Ay, lo siento muchísimo! ¿Qué pidió?', 'אוי לא, אני מצטער מאוד! מה הזמנת?'),
        // Remembering your own order: the pasta was never ordered today.
        you(known('phrase.rest.no-onions'), {
          say: ['The chicken. No onions, please.', 'Le poulet. Sans oignons, s’il vous plaît.', 'El pollo. Sin cebolla, por favor.', 'את העוף. בלי בצל, בבקשה.'],
          wrong: [itemOf(FIXING_PROBLEMS, 'phrase.fix.i-ordered')],
        }),
        npc("Of course — I'll bring the right one right away.", 'Bien sûr — je vous apporte le bon tout de suite.', 'Claro — le traigo el correcto enseguida.', 'כמובן — אביא את הנכון מיד.'),
        you(itemOf(FIXING_PROBLEMS, 'phrase.fix.no-problem-thanks'), { wrong: [itemOf(FIXING_PROBLEMS, 'phrase.fix.charged-twice')] }),
        { ...npc('Is everything okay?', 'Tout va bien ?', '¿Va todo bien?', 'הכל בסדר?'), cue: ['מאוחר יותר…', 'Later…'] },
        you(known('phrase.rest.the-bill'), {
          say: ['Yes, that was delicious! The bill, please.', 'Oui, c’était délicieux ! L’addition, s’il vous plaît.', '¡Sí, estaba delicioso! La cuenta, por favor.', 'כן, היה טעים מאוד! החשבון, בבקשה.'],
          wrong: [known('phrase.rest.water')],
        }),
        npc('So glad you enjoyed it. Here you are. Thank you!', 'Ravi que ça vous ait plu. Voici. Merci !', 'Me alegro de que les gustara. Aquí tienen. ¡Gracias!', 'שמח שנהניתם. בבקשה. תודה!'),
      ],
    },
    {
      id: 'fin-chat',
      cold: true,
      receipt: ['שיחה עם מטייל: מאיפה אתה, מה עשית, לאן אתה נוסע ולכמה זמן, מה דעתך — ושאלת בחזרה.', 'A talk with a traveler: where you are from, what you did, where you are going and for how long, what you think — and you asked back.'],
      lines: [
        npc("Hi! I'm from here. And you?", 'Salut ! Je suis d’ici. Et toi ?', '¡Hola! Soy de aquí. ¿Y tú?', 'היי! אני מכאן. ואתה?'),
        you(known('phrase.social.from-israel'), { wrong: [known('phrase.social.first-time')] }),
        npc('Nice! What did you do today?', 'Sympa ! Tu as fait quoi aujourd’hui ?', '¡Qué bien! ¿Qué hiciste hoy?', 'יפה! מה עשית היום?'),
        you(itemOf(PAST_EVENTS, 'phrase.past.i-went'), { wrong: [itemOf(FUTURE_PLANS, 'phrase.future.going-to-vietnam')] }),
        npc('Did you like it?', 'Tu as aimé ?', '¿Te gustó?', 'אהבת?'),
        you(itemOf(PAST_EVENTS, 'phrase.past.it-was-great'), { wrong: [itemOf(PAST_EVENTS, 'phrase.past.i-stayed')] }),
        npc('So, where are you going next?', 'Alors, tu vas où après ?', 'Bueno, ¿a dónde vas después?', 'אז לאן אתה נוסע אחרי זה?'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.going-to-vietnam'), { wrong: [itemOf(PAST_EVENTS, 'phrase.past.i-went')] }),
        npc('Wow! How long will you be there?', 'Waouh ! Tu restes combien de temps ?', '¡Guau! ¿Cuánto tiempo vas a estar allí?', 'וואו! כמה זמן תהיה שם?'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.ill-be-there'), { wrong: [itemOf(FUTURE_PLANS, 'phrase.future.after-that')] }),
        npc('Really? I think Vietnam is too far.', 'Vraiment ? Moi, je pense que le Vietnam, c’est trop loin.', '¿De verdad? Yo creo que Vietnam está muy lejos.', 'באמת? אני חושב שווייטנאם רחוקה מדי.'),
        you(itemOf(OPINIONS, 'phrase.opin.dont-think-so'), { wrong: [itemOf(OPINIONS, 'phrase.opin.dont-like-it')] }),
        npc("Ha! That's true.", 'Ha ! C’est vrai.', '¡Ja! Es verdad.', 'חה! זה נכון.'),
        you(itemOf(FUTURE_PLANS, 'phrase.future.where-next'), {
          say: ['And you? Where are you going next?', 'Et toi ? Tu vas où après ?', '¿Y tú? ¿A dónde vas después?', 'ואתה? לאן אתה נוסע אחרי זה?'],
          wrong: [itemOf(OPINIONS, 'phrase.opin.of-course')],
        }),
        npc("Me? I'm going home. Have a great trip!", 'Moi ? Je rentre chez moi. Bon voyage !', '¿Yo? Me voy a casa. ¡Buen viaje!', 'אני? אני חוזר הביתה. נסיעה טובה!'),
      ],
    },
    {
      id: 'fin-evening',
      cold: true,
      receipt: ['ערב: שתי שאלות ברצף, מהר — לא ניחשת. ביקשת לאט, הבנת, וענית.', 'Evening: two questions in a row, fast — you did not guess. You asked for it slowly, understood, and answered.'],
      lines: [
        // Genuinely dense: two questions in one breath, every word known.
        npc('Good evening! Is everything okay with your room? And breakfast tomorrow — is seven okay for you?', 'Bonsoir ! Tout va bien avec votre chambre ? Et le petit-déjeuner demain — sept heures, ça va ?', '¡Buenas noches! ¿Va todo bien con su habitación? ¿Y el desayuno mañana — a las siete está bien?', 'ערב טוב! הכל בסדר עם החדר? וארוחת הבוקר מחר — שבע מתאים לך?', 'fast'),
        you(tool('thank-you'), {
          say: ['Yes, thank you.', 'Oui, merci.', 'Sí, gracias.', 'כן, תודה.'],
          wrong: [known('phrase.hotel.breakfast')],
          rec: { tool: 'slowly', npc: ['Your room — is it okay? Breakfast — tomorrow — at seven?', 'Votre chambre — ça va ? Le petit-déjeuner — demain — à sept heures ?', 'Su habitación — ¿está bien? El desayuno — mañana — ¿a las siete?', 'החדר — בסדר? ארוחת בוקר — מחר — בשבע?'] },
        }),
        npc('Perfect. And how was your day?', 'Parfait. Et c’était comment, votre journée ?', 'Perfecto. ¿Y cómo estuvo su día?', 'מצוין. ואיך היה היום שלך?'),
        you(itemOf(PAST_EVENTS, 'phrase.past.it-was-good'), { wrong: [itemOf(FUTURE_PLANS, 'phrase.future.tomorrow-morning')] }),
        npc('So glad! Good night.', 'Ravi ! Bonne nuit.', '¡Me alegro! Buenas noches.', 'שמח לשמוע! לילה טוב.'),
        you(tool('thank-you'), { say: ['Thank you. Good night!', 'Merci. Bonne nuit !', 'Gracias. ¡Buenas noches!', 'תודה. לילה טוב!'] }),
        npc('See you tomorrow!', 'À demain !', '¡Nos vemos mañana!', 'נתראה מחר!'),
      ],
    },
  ],
  hear: [],
  closing: ['יום שלם, לבד, בשפה אחרת: השגת מה שהיית צריך, הגעת לאן שרצית, פתרת בעיה, סיפרת מה עשית ולאן אתה נוסע, אמרת מה דעתך — וכשדיברו מהר, ביקשת שוב. אתה מוכן. באמת מוכן.', 'A whole day, alone, in another language: you got what you needed, got where you were going, fixed a problem, said what you did and where you are going, gave your opinion — and when it came fast, you asked again. You are ready. Actually ready.'],
};
