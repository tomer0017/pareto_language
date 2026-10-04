import { item, npc, you, type MissionSpec } from '../author.js';

/**
 * Future Travel & Plans — a hostel conversation about what comes next. Structures over destinations:
 * "I'm going to ___", "I'll be there for ___", "I want to ___", "After that ___". Vietnam, Hanoi and
 * the motorbike are variables. Informal register (tu / tú). AI linguistic review completed; native review still recommended.
 */
const GOING_TO = item('phrase.future.going-to-vietnam', "I'm going to Vietnam.", 'Je vais au Vietnam.', 'Voy a Vietnam.', 'אני נוסע לווייטנאם.',
  ['I’m going to ___ — מדינה, עיר, או המקום הבא.', 'I’m going to ___ — a country, a city, the next place.']);
const ILL_BE_THERE = item('phrase.future.ill-be-there', "I'll be there for two weeks.", 'Je vais rester deux semaines.', 'Voy a estar allí dos semanas.', 'אני אהיה שם שבועיים.');
const WANT_TO_VISIT = item('phrase.future.want-to-visit', 'I want to visit Hanoi.', 'Je veux visiter Hanoï.', 'Quiero visitar Hanói.', 'אני רוצה לבקר בהאנוי.');
const WANT_TO_TRY_FOOD = item('phrase.future.want-to-try-food', 'I want to try the food.', 'Je veux essayer la cuisine.', 'Quiero probar la comida.', 'אני רוצה לנסות את האוכל.');
const BY_MOTORBIKE = item('phrase.future.by-motorbike', 'I want to travel by motorbike.', 'Je veux voyager à moto.', 'Quiero viajar en moto.', 'אני רוצה לטייל באופנוע.');
const RIDE_HORSES = item('phrase.future.ride-horses', 'I want to ride horses there.', 'Je veux faire du cheval là-bas.', 'Quiero montar a caballo allí.', 'אני רוצה לרכוב שם על סוסים.');
const AFTER_THAT = item('phrase.future.after-that', "After that I'm going to Thailand.", 'Après ça, je vais en Thaïlande.', 'Después de eso voy a Tailandia.', 'אחרי זה אני נוסע לתאילנד.');
const TOMORROW_MORNING = item('phrase.future.tomorrow-morning', "Tomorrow morning I'm going to the airport.", 'Demain matin, je vais à l’aéroport.', 'Mañana por la mañana voy al aeropuerto.', 'מחר בבוקר אני נוסע לשדה התעופה.');
const WHERE_NEXT = item('phrase.future.where-next', 'Where are you going next?', 'Tu vas où après ?', '¿A dónde vas después?', 'לאן אתה נוסע אחרי זה?');

export const FUTURE_PLANS: MissionSpec = {
  day: 35,
  title: ['לאן ממשיכים: תוכניות', 'Future Travel & Plans'],
  icon: '🧭',
  intro: [
    ['"לאן אתה ממשיך?" — השאלה הכי נפוצה בין מטיילים.', '"Where are you going next?" — the most common question between travelers.'],
    ['ארבע תבניות עונות עליה: אני נוסע ל…, אהיה שם…, אני רוצה…, אחרי זה….', 'Four frames answer it: I’m going to…, I’ll be there for…, I want to…, after that….'],
  ],
  cta: ['לספר לאן אני נוסע', 'Say where I am going'],
  scenes: [{
    id: 'where-next',
    receipt: ['סיפרת לאן אתה נוסע, לכמה זמן ומה אתה רוצה לעשות — ושאלת בחזרה.', 'You said where you are going, for how long and what you want to do — and asked back.'],
    lines: [
      npc('So, where are you going next?', 'Alors, tu vas où après ?', 'Bueno, ¿a dónde vas después?', 'אז לאן אתה נוסע אחרי זה?'),
      you(GOING_TO),
      npc('Wow! How long will you be there?', 'Waouh ! Tu restes combien de temps ?', '¡Guau! ¿Cuánto tiempo vas a estar allí?', 'וואו! כמה זמן תהיה שם?', 'fast'),
      you(ILL_BE_THERE, {
        rec: { tool: 'slowly', npc: ['How long? One week? Two weeks?', 'Combien de temps ? Une semaine ? Deux semaines ?', '¿Cuánto tiempo? ¿Una semana? ¿Dos semanas?', 'כמה זמן? שבוע? שבועיים?'] },
      }),
      npc('What do you want to do there?', 'Tu veux faire quoi là-bas ?', '¿Qué quieres hacer allí?', 'מה אתה רוצה לעשות שם?'),
      you(WANT_TO_VISIT, { alts: [WANT_TO_TRY_FOOD] }),
      npc('Nice. Anything else?', 'Sympa. Autre chose ?', 'Qué bien. ¿Algo más?', 'יפה. עוד משהו?'),
      you(BY_MOTORBIKE, { alts: [RIDE_HORSES] }),
      npc('Sounds amazing! Be careful. And after that?', 'Ça a l’air génial ! Fais attention. Et après ça ?', '¡Suena increíble! Ten cuidado. ¿Y después de eso?', 'נשמע מדהים! תיזהר. ואחרי זה?'),
      you(AFTER_THAT),
      npc('Great plan. And what are you doing tomorrow morning?', 'Super programme. Et tu fais quoi demain matin ?', 'Buen plan. ¿Y qué haces mañana por la mañana?', 'תוכנית מעולה. ומה אתה עושה מחר בבוקר?'),
      you(TOMORROW_MORNING),
      npc("Already! We'll miss you.", 'Déjà ! Tu vas nous manquer.', '¡Ya! Te vamos a echar de menos.', 'כבר! נתגעגע אליך.'),
      you(WHERE_NEXT, { say: ['And you? Where are you going next?', 'Et toi ? Tu vas où après ?', '¿Y tú? ¿A dónde vas después?', 'ואתה? לאן אתה נוסע אחרי זה?'] }),
      npc("Me? I'm going home. Have a great trip!", 'Moi ? Je rentre chez moi. Bon voyage !', '¿Yo? Me voy a casa. ¡Buen viaje!', 'אני? אני חוזר הביתה. נסיעה טובה!'),
    ],
  }],
  hear: [
    item('reply.future.how-long', 'How long will you be there?', 'Tu restes combien de temps ?', '¿Cuánto tiempo vas a estar allí?', 'כמה זמן תהיה שם?'),
    item('reply.future.what-do-there', 'What do you want to do there?', 'Tu veux faire quoi là-bas ?', '¿Qué quieres hacer allí?', 'מה אתה רוצה לעשות שם?'),
    item('reply.future.and-after', 'And after that?', 'Et après ça ?', '¿Y después de eso?', 'ואחרי זה?'),
    item('reply.future.tomorrow-morning-q', 'What are you doing tomorrow morning?', 'Tu fais quoi demain matin ?', '¿Qué haces mañana por la mañana?', 'מה אתה עושה מחר בבוקר?'),
    item('reply.future.be-careful', 'Be careful.', 'Fais attention.', 'Ten cuidado.', 'תיזהר.'),
    item('reply.future.great-trip', 'Have a great trip!', 'Bon voyage !', '¡Buen viaje!', 'נסיעה טובה!'),
  ],
  teach: {
    tools: [
      { id: 'phrase.future.going-to-vietnam', label: ['לאן', 'Where to'] },
      { id: 'phrase.future.ill-be-there', label: ['לכמה זמן', 'For how long'] },
      { id: 'phrase.future.want-to-visit', label: ['מה אני רוצה', 'What I want'] },
      { id: 'phrase.future.after-that', label: ['אחרי זה', 'After that'] },
      { id: 'phrase.future.where-next', label: ['לשאול בחזרה', 'Ask back'] },
    ],
    said: 'phrase.future.going-to-vietnam',
    replies: ['reply.future.how-long', 'reply.future.what-do-there', 'reply.future.and-after', 'reply.future.be-careful'],
    repliesReceipt: ['אתה מזהה את שאלות ההמשך: לכמה זמן, מה תעשה, ומה אחר כך.', 'You recognize the follow-ups: how long, what will you do, and what next.'],
    quiz: ['reply.future.how-long', 'reply.future.and-after', 'reply.future.tomorrow-morning-q'],
    ambush: {
      npc: ['Hold on before you go what are you doing tomorrow morning do you have time for a coffee?', 'Attends, avant de partir : tu fais quoi demain matin, tu as le temps pour un café ?', 'Espera, antes de irte: ¿qué haces mañana por la mañana, tienes tiempo para un café?', 'רגע, לפני שאתה נוסע — מה אתה עושה מחר בבוקר, יש לך זמן לקפה?'],
      correct: 'reply.future.tomorrow-morning-q',
      wrong: 'reply.future.how-long',
      receipt: ['שאלה ארוכה על מחר בבוקר — והבנת מה שואלים.', 'A long question about tomorrow morning — and you understood what was asked.'],
    },
  },
};
