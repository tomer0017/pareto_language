import { item, npc, you, type MissionSpec } from '../author.js';

/**
 * Emergency — ONE coherent emergency call: someone is hurt, an ambulance, where you are, stay there.
 * The lost-passport exchange that used to interrupt this call now lives in Lost / Stolen / Police.
 * Sentence ids of the kept lines are unchanged. Polite register (vous / usted).
 * AI linguistic review completed; native review still recommended.
 */
const NEED_HELP = item('phrase.emerg.need-help', 'I need help.', 'J’ai besoin d’aide.', 'Necesito ayuda.', 'אני צריך עזרה.',
  ['שלוש מילים. קודם כל אומרים את זה.', 'Three words. Say this first.']);
const SOMEONE_HURT = item('phrase.emerg.someone-hurt', 'Someone is hurt.', 'Quelqu’un est blessé.', 'Hay alguien herido.', 'מישהו נפצע.');
const CALL_AMBULANCE = item('phrase.emerg.call-ambulance', 'Please call an ambulance.', 'Appelez une ambulance, s’il vous plaît.', 'Llame a una ambulancia, por favor.', 'תזמינו אמבולנס, בבקשה.');
const CALL_DOCTOR = item('phrase.emerg.call-doctor', 'Please call a doctor.', 'Appelez un médecin, s’il vous plaît.', 'Llame a un médico, por favor.', 'תקראו לרופא, בבקשה.');
const IM_AT = item('phrase.emerg.im-at-station', "I'm at the train station.", 'Je suis à la gare.', 'Estoy en la estación de tren.', 'אני בתחנת הרכבת.',
  ['I’m at ___ — המקום הוא המידע הכי חשוב.', 'I’m at ___ — the place is the most important information.']);
const STAY_HERE = item('phrase.emerg.stay-here', "Okay, I'll stay here.", 'D’accord, je reste ici.', 'De acuerdo, me quedo aquí.', 'בסדר, אני נשאר כאן.');
const CALL_POLICE = item('phrase.emerg.call-police', 'Call the police!', 'Appelez la police !', '¡Llame a la policía!', 'תקראו למשטרה!');
const WHERE_HOSPITAL = item('phrase.emerg.where-hospital', 'Where is the hospital?', 'Où est l’hôpital ?', '¿Dónde está el hospital?', 'איפה בית החולים?');

export const EMERGENCY: MissionSpec = {
  day: 26,
  title: ['חירום', 'Emergency'],
  icon: '🚨',
  intro: [
    ['מישהו נפצע. אתה מתקשר. תחת לחץ נשאר רק מה שאוטומטי.', 'Someone is hurt. You make the call. Under stress, only what is automatic survives.'],
    ['ארבעה דברים: אני צריך עזרה, מה קרה, איפה אני, ואני נשאר כאן.', 'Four things: I need help, what happened, where I am, and I am staying here.'],
  ],
  cta: ['להתקשר', 'Make the call'],
  scenes: [{
    id: 'emergency',
    receipt: ['שיחת חירום שלמה: עזרה, מה קרה, איפה אתה, ואתה נשאר במקום.', 'A complete emergency call: help, what happened, where you are, and that you are staying put.'],
    lines: [
      npc("Emergency services — what's wrong?", 'Services d’urgence — qu’est-ce qui se passe ?', 'Emergencias — ¿qué ocurre?', 'שירותי חירום — מה קרה?'),
      you(NEED_HELP),
      npc('Okay, stay calm. Are you hurt?', 'D’accord, restez calme. Vous êtes blessé ?', 'De acuerdo, mantenga la calma. ¿Está herido?', 'טוב, תישאר רגוע. אתה פצוע?'),
      you(SOMEONE_HURT, { say: ['No, but someone is hurt.', 'Non, mais quelqu’un est blessé.', 'No, pero hay alguien herido.', 'לא, אבל מישהו נפצע.'] }),
      npc('Do you need an ambulance or the police?', 'Vous avez besoin d’une ambulance ou de la police ?', '¿Necesita una ambulancia o a la policía?', 'אתה צריך אמבולנס או משטרה?'),
      you(CALL_AMBULANCE, { alts: [CALL_DOCTOR] }),
      npc('An ambulance is on the way. Where are you?', 'Une ambulance arrive. Où êtes-vous ?', 'Una ambulancia va en camino. ¿Dónde está?', 'אמבולנס בדרך. איפה אתה?', 'fast'),
      you(IM_AT, {
        rec: { tool: 'slowly', npc: ['Where — are — you?', 'Où — êtes — vous ?', '¿Dónde — está — usted?', 'איפה — אתה — נמצא?'] },
      }),
      npc('Good. Stay there, and stay with the person.', 'Très bien. Restez là, et restez avec la personne.', 'Muy bien. Quédese ahí, y quédese con la persona.', 'טוב. תישאר שם, ותישאר עם האדם.'),
      you(STAY_HERE),
      npc("Help is on the way. You're doing everything right.", 'Les secours arrivent. Vous faites tout ce qu’il faut.', 'La ayuda va en camino. Lo está haciendo todo bien.', 'העזרה בדרך. אתה עושה הכל נכון.'),
    ],
  }],
  extra: [CALL_POLICE, WHERE_HOSPITAL],
  hear: [
    item('reply.emerg.whats-wrong', "What's wrong?", 'Qu’est-ce qui se passe ?', '¿Qué ocurre?', 'מה קרה?'),
    item('reply.emerg.stay-calm', 'Stay calm, help is coming.', 'Restez calme, les secours arrivent.', 'Mantenga la calma, la ayuda va en camino.', 'תישאר רגוע, עזרה בדרך.'),
    item('reply.emerg.where-you', 'Where are you?', 'Où êtes-vous ?', '¿Dónde está?', 'איפה אתה?'),
    item('reply.emerg.are-you-hurt', 'Are you hurt?', 'Vous êtes blessé ?', '¿Está herido?', 'אתה פצוע?'),
    item('reply.emerg.on-the-way', 'An ambulance is on the way.', 'Une ambulance arrive.', 'Una ambulancia va en camino.', 'אמבולנס בדרך.'),
    item('reply.emerg.stay-there', 'Stay there.', 'Restez là.', 'Quédese ahí.', 'תישאר שם.'),
  ],
  teach: {
    tools: [
      { id: 'phrase.emerg.need-help', label: ['עזרה', 'Help'] },
      { id: 'phrase.emerg.someone-hurt', label: ['מה קרה', 'What happened'] },
      { id: 'phrase.emerg.call-ambulance', label: ['אמבולנס', 'Ambulance'] },
      { id: 'phrase.emerg.call-police', label: ['משטרה', 'Police'] },
      { id: 'phrase.emerg.im-at-station', label: ['איפה אני', 'Where I am'] },
    ],
    said: 'phrase.emerg.need-help',
    replies: ['reply.emerg.whats-wrong', 'reply.emerg.are-you-hurt', 'reply.emerg.where-you', 'reply.emerg.stay-there'],
    repliesReceipt: ['אתה מזהה את שאלות המוקד: מה קרה, אתה פצוע, איפה אתה.', 'You recognize the dispatcher’s questions: what’s wrong, are you hurt, where are you.'],
    // "Where are you?" is drilled once above; from here on it is only ever ANSWERED.
    practice: [
      // The four questions of the call — the answer has to be automatic.
      {
        kind: 'quickReply',
        label: ['המוקד שואל — מה עונים?', 'The dispatcher asks — what do you answer?'],
        rounds: [
          { prompt: 'reply.emerg.whats-wrong', options: [['phrase.emerg.need-help', true], ['phrase.emerg.im-at-station', false], ['phrase.emerg.stay-here', false]] },
          { prompt: 'reply.emerg.are-you-hurt', options: [['phrase.emerg.someone-hurt', true, ['No, but someone is hurt.', 'Non, mais quelqu’un est blessé.', 'No, pero hay alguien herido.']], ['phrase.emerg.stay-here', false], ['phrase.emerg.where-hospital', false]] },
          { prompt: 'reply.emerg.where-you', options: [['phrase.emerg.im-at-station', true], ['phrase.emerg.need-help', false], ['phrase.emerg.call-ambulance', false]] },
          { prompt: 'reply.emerg.stay-there', options: [['phrase.emerg.stay-here', true], ['phrase.emerg.im-at-station', false], ['phrase.emerg.call-police', false]] },
        ],
      },
      // Which service do you ask for?
      {
        kind: 'quickReply',
        label: ['איזה שירות מבקשים?', 'Which service do you ask for?'],
        rounds: [
          { situation: ['מישהו נפצע.', 'Someone is injured.'], options: [['phrase.emerg.call-ambulance', true], ['phrase.emerg.call-police', false]] },
          { situation: ['מישהו בסכנה, או שקרה פשע.', 'Someone is in danger, or there has been a crime.'], options: [['phrase.emerg.call-police', true], ['phrase.emerg.call-ambulance', false]] },
        ],
      },
    ],
    review: ['phrase.emerg.need-help', 'phrase.emerg.someone-hurt', 'phrase.emerg.call-ambulance', 'phrase.emerg.call-police', 'phrase.emerg.im-at-station', 'phrase.emerg.stay-here'],
    // The whole call once more, in order, at natural speed — the call's own lines, not one new word.
    finale: [{
      practice: {
        kind: 'quickReply',
        challenge: true,
        rounds: [
          { npc: ["Emergency services — what's wrong?", 'Services d’urgence — qu’est-ce qui se passe ?', 'Emergencias — ¿qué ocurre?', 'שירותי חירום — מה קרה?'], options: [['phrase.emerg.need-help', true], ['phrase.emerg.stay-here', false], ['phrase.emerg.im-at-station', false]] },
          { npc: ['Okay, stay calm. Are you hurt?', 'D’accord, restez calme. Vous êtes blessé ?', 'De acuerdo, mantenga la calma. ¿Está herido?', 'טוב, תישאר רגוע. אתה פצוע?'], options: [['phrase.emerg.someone-hurt', true, ['No, but someone is hurt.', 'Non, mais quelqu’un est blessé.', 'No, pero hay alguien herido.']], ['phrase.emerg.im-at-station', false], ['phrase.emerg.stay-here', false]] },
          { npc: ['Do you need an ambulance or the police?', 'Vous avez besoin d’une ambulance ou de la police ?', '¿Necesita una ambulancia o a la policía?', 'אתה צריך אמבולנס או משטרה?'], options: [['phrase.emerg.call-ambulance', true], ['phrase.emerg.call-police', false], ['phrase.emerg.where-hospital', false]] },
          { npc: ['An ambulance is on the way. Where are you?', 'Une ambulance arrive. Où êtes-vous ?', 'Una ambulancia va en camino. ¿Dónde está?', 'אמבולנס בדרך. איפה אתה?'], options: [['phrase.emerg.im-at-station', true], ['phrase.emerg.need-help', false], ['phrase.emerg.someone-hurt', false]] },
          { npc: ['Good. Stay there, and stay with the person.', 'Très bien. Restez là, et restez avec la personne.', 'Muy bien. Quédese ahí, y quédese con la persona.', 'טוב. תישאר שם, ותישאר עם האדם.'], options: [['phrase.emerg.stay-here', true], ['phrase.emerg.call-doctor', false], ['phrase.emerg.im-at-station', false]] },
        ],
      },
      receipt: ['שיחה שלמה בקצב רגיל: עזרה, מה קרה, איזה שירות, איפה אתה, ואתה נשאר. המשפטים האלה יוצאים לך בלי לחשוב.', 'A whole call at normal speed: help, what happened, which service, where you are, and that you are staying. These lines come out without thinking.'],
    }],
  },
};
