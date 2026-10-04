import { item, npc, you, type MissionSpec } from '../author.js';

/**
 * Time & Plans — two travelers making plans. Not a lesson about clocks: today / tonight / tomorrow /
 * later / early / late, as people actually use them. Informal register (tu / tú) — this is a
 * conversation between friends. AI linguistic review completed; native review still recommended.
 */
const MAYBE_LATER = item('phrase.time.maybe-later', 'Maybe later.', 'Peut-être plus tard.', 'Quizás más tarde.', 'אולי אחר כך.',
  ['התשובה הכי שימושית כשלא החלטת.', 'The most useful answer when you have not decided.']);
const FREE_TONIGHT = item('phrase.time.free-tonight', "I'm free tonight.", 'Je suis libre ce soir.', 'Estoy libre esta noche.', 'אני פנוי הערב.');
const WHAT_TIME = item('phrase.time.what-time', 'What time?', 'À quelle heure ?', '¿A qué hora?', 'באיזו שעה?');
const WHEN = item('phrase.time.when', 'When?', 'Quand ?', '¿Cuándo?', 'מתי?');
const NOT_TOO_LATE = item('phrase.time.not-too-late', "No, that's not too late.", 'Non, ce n’est pas trop tard.', 'No, no es muy tarde.', 'לא, זה לא מאוחר מדי.');
const WHAT_DOING_TOMORROW = item('phrase.time.what-doing-tomorrow', 'What are you doing tomorrow?', 'Tu fais quoi demain ?', '¿Qué haces mañana?', 'מה אתה עושה מחר?',
  ['מחליפים tomorrow ב-today / tonight ויש לך שלוש שאלות.', 'Swap tomorrow for today / tonight and you have three questions.']);
const FREE_TOMORROW = item('phrase.time.free-tomorrow', "Yes, I'm free tomorrow.", 'Oui, je suis libre demain.', 'Sí, estoy libre mañana.', 'כן, אני פנוי מחר.');
const LETS_MEET = item('phrase.time.lets-meet', "Let's meet here at seven.", 'On se retrouve ici à sept heures.', 'Quedamos aquí a las siete.', 'ניפגש כאן בשבע.',
  ['Let’s meet ___ at ___ — מקום ושעה, וזהו.', 'Let’s meet ___ at ___ — a place and a time, and you are done.']);

export const TIME_PLANS: MissionSpec = {
  day: 31,
  title: ['זמן ותוכניות', 'Time & Plans'],
  icon: '🗓️',
  intro: [
    ['היום, הערב, מחר, אחר כך — המילים שקובעות תוכניות.', 'Today, tonight, tomorrow, later — the words that make plans.'],
    ['לא שיעור על שעון. שני מטיילים שקובעים מה לעשות ומתי.', 'Not a lesson about clocks. Two travelers deciding what to do, and when.'],
  ],
  cta: ['לקבוע תוכניות', 'Make plans'],
  scenes: [{
    id: 'making-plans',
    receipt: ['קבעת ערב ובוקר: מתי, באיזו שעה, ואיפה נפגשים.', 'You planned an evening and a morning: when, what time, and where to meet.'],
    lines: [
      npc('Good morning! What are you doing today?', 'Bonjour ! Tu fais quoi aujourd’hui ?', '¡Buenos días! ¿Qué haces hoy?', 'בוקר טוב! מה אתה עושה היום?'),
      you(MAYBE_LATER, { say: ['Nothing this morning. Maybe later.', 'Rien ce matin. Peut-être plus tard.', 'Nada esta mañana. Quizás más tarde.', 'כלום הבוקר. אולי אחר כך.'] }),
      npc('And what are you doing tonight?', 'Et tu fais quoi ce soir ?', '¿Y qué haces esta noche?', 'ומה אתה עושה הערב?'),
      you(FREE_TONIGHT),
      npc("We're going to eat in the centre. Do you want to come?", 'On va manger dans le centre. Tu veux venir ?', 'Vamos a comer en el centro. ¿Quieres venir?', 'אנחנו הולכים לאכול במרכז. רוצה לבוא?'),
      you(WHAT_TIME, { say: ['Yes! What time?', 'Oui ! À quelle heure ?', '¡Sí! ¿A qué hora?', 'כן! באיזו שעה?'], alts: [WHEN] }),
      npc('At eight. Is that too late for you?', 'À huit heures. C’est trop tard pour toi ?', 'A las ocho. ¿Es muy tarde para ti?', 'בשמונה. זה מאוחר מדי בשבילך?', 'fast'),
      you(NOT_TOO_LATE, {
        rec: { tool: 'repeat', npc: ['At eight. Too late?', 'À huit heures. Trop tard ?', 'A las ocho. ¿Muy tarde?', 'בשמונה. מאוחר מדי?'] },
      }),
      npc("Great. It's very good there.", 'Super. C’est très bon là-bas.', 'Genial. Allí se come muy bien.', 'מעולה. מאוד טוב שם.'),
      you(WHAT_DOING_TOMORROW),
      npc("Tomorrow morning I'm going to the beach. Are you free tomorrow?", 'Demain matin, je vais à la plage. Tu es libre demain ?', 'Mañana por la mañana voy a la playa. ¿Estás libre mañana?', 'מחר בבוקר אני הולך לים. אתה פנוי מחר?'),
      you(FREE_TOMORROW),
      npc('Then come with us! But we leave early.', 'Alors viens avec nous ! Mais on part tôt.', '¡Entonces ven con nosotros! Pero salimos temprano.', 'אז בוא איתנו! אבל אנחנו יוצאים מוקדם.'),
      you(LETS_MEET, { say: ["No problem. Let's meet here at seven.", 'Pas de problème. On se retrouve ici à sept heures.', 'No hay problema. Quedamos aquí a las siete.', 'אין בעיה. ניפגש כאן בשבע.'] }),
      npc('Perfect. I have to go now — see you tonight!', 'Parfait. Je dois y aller maintenant — à ce soir !', 'Perfecto. Me tengo que ir ahora — ¡nos vemos esta noche!', 'מושלם. אני חייב ללכת עכשיו — נתראה הערב!'),
    ],
  }],
  hear: [
    item('reply.time.what-doing-today', 'What are you doing today?', 'Tu fais quoi aujourd’hui ?', '¿Qué haces hoy?', 'מה אתה עושה היום?'),
    item('reply.time.what-doing-tonight', 'What are you doing tonight?', 'Tu fais quoi ce soir ?', '¿Qué haces esta noche?', 'מה אתה עושה הערב?'),
    item('reply.time.want-to-come', 'Do you want to come?', 'Tu veux venir ?', '¿Quieres venir?', 'רוצה לבוא?'),
    item('reply.time.at-eight', 'At eight.', 'À huit heures.', 'A las ocho.', 'בשמונה.'),
    item('reply.time.too-late', 'Is that too late for you?', 'C’est trop tard pour toi ?', '¿Es muy tarde para ti?', 'זה מאוחר מדי בשבילך?'),
    item('reply.time.free-tomorrow-q', 'Are you free tomorrow?', 'Tu es libre demain ?', '¿Estás libre mañana?', 'אתה פנוי מחר?'),
    item('reply.time.leave-early', 'We leave early.', 'On part tôt.', 'Salimos temprano.', 'אנחנו יוצאים מוקדם.'),
  ],
  teach: {
    tools: [
      { id: 'phrase.time.what-doing-tomorrow', label: ['לשאול על תוכניות', 'Ask about plans'] },
      { id: 'phrase.time.free-tonight', label: ['אני פנוי', "I'm free"] },
      { id: 'phrase.time.what-time', label: ['באיזו שעה', 'What time'] },
      { id: 'phrase.time.lets-meet', label: ['לקבוע', 'Set it'] },
      { id: 'phrase.time.maybe-later', label: ['אולי אחר כך', 'Maybe later'] },
    ],
    said: 'phrase.time.what-time',
    replies: ['reply.time.at-eight', 'reply.time.too-late', 'reply.time.leave-early', 'reply.time.free-tomorrow-q'],
    repliesReceipt: ['אתה מזהה שעה, "מוקדם" ו"מאוחר" — גם כשזה נאמר מהר.', 'You recognize a time, "early" and "late" — even when it is said fast.'],
    quiz: ['reply.time.free-tomorrow-q', 'reply.time.what-doing-tonight', 'reply.time.too-late'],
    ambush: {
      npc: ['Hey quick question are you free tomorrow or do you already have plans?', 'Dis, petite question : tu es libre demain ou tu as déjà quelque chose de prévu ?', 'Oye, una pregunta rápida: ¿estás libre mañana o ya tienes planes?', 'היי, שאלה קצרה — אתה פנוי מחר או שכבר יש לך תוכניות?'],
      correct: 'reply.time.free-tomorrow-q',
      wrong: 'reply.time.at-eight',
      receipt: ['שאלו אותך מהר אם אתה פנוי מחר — והבנת.', 'You were asked, fast, whether you are free tomorrow — and you got it.'],
    },
  },
};
