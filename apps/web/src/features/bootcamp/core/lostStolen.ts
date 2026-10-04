import { item, npc, tool, you, type MissionSpec } from '../author.js';

/**
 * Lost / Stolen / Police — two short scenes: asking a passer-by for help, then reporting it at the
 * police station. Each person does one job. The lost-passport line lives here (it used to interrupt
 * the Emergency mission) as a swap-in variant. Polite register (vous / usted).
 * AI linguistic review completed; native review still recommended.
 */
const CANT_FIND = item('phrase.lost.cant-find', "I can't find my phone.", 'Je ne trouve pas mon téléphone.', 'No encuentro mi teléfono.', 'אני לא מוצא את הטלפון שלי.',
  ['I can’t find ___ — לפני שקובעים שזה אבד.', 'I can’t find ___ — before you decide it is lost.']);
const WAS_STOLEN = item('phrase.lost.was-stolen', 'I think it was stolen.', 'Je pense qu’on me l’a volé.', 'Creo que me lo han robado.', 'אני חושב שגנבו לי אותו.');
const WHERE_POLICE = item('phrase.lost.where-police', 'Where is the police station?', 'Où est le commissariat ?', '¿Dónde está la comisaría?', 'איפה תחנת המשטרה?');
const PHONE_STOLEN = item('phrase.lost.phone-stolen', 'My phone was stolen.', 'On m’a volé mon téléphone.', 'Me han robado el teléfono.', 'גנבו לי את הטלפון.',
  ['My ___ was stolen — phone, wallet, bag.', 'My ___ was stolen — phone, wallet, bag.']);
const ON_THE_BUS = item('phrase.lost.on-the-bus', 'On the bus this morning.', 'Dans le bus, ce matin.', 'En el autobús, esta mañana.', 'באוטובוס, הבוקר.');
const WANT_REPORT = item('phrase.lost.want-report', 'Yes, I want to report it.', 'Oui, je veux faire une déclaration.', 'Sí, quiero denunciarlo.', 'כן, אני רוצה לדווח על זה.');
const HAVE_PASSPORT = item('phrase.lost.have-passport', 'Yes, I have my passport.', 'Oui, j’ai mon passeport.', 'Sí, tengo mi pasaporte.', 'כן, יש לי את הדרכון.');
// Swap-in variants: the same two frames with another object.
const LOST_PASSPORT = item('phrase.emerg.lost-passport', 'I lost my passport.', 'J’ai perdu mon passeport.', 'He perdido mi pasaporte.', 'איבדתי את הדרכון.',
  ['I lost my ___ — passport, phone, wallet.', 'I lost my ___ — passport, phone, wallet.']);
const CANT_FIND_WALLET = item('phrase.lost.cant-find-wallet', "I can't find my wallet.", 'Je ne trouve pas mon portefeuille.', 'No encuentro mi cartera.', 'אני לא מוצא את הארנק שלי.');

export const LOST_STOLEN: MissionSpec = {
  day: 37,
  title: ['אבד, נגנב, משטרה', 'Lost / Stolen / Police'],
  icon: '🚓',
  intro: [
    ['הטלפון נעלם. זה לא חירום — אבל צריך לדעת להסביר מה קרה ולבקש עזרה.', 'Your phone is gone. It is not an emergency — but you need to explain what happened and ask for help.'],
    ['קודם שואלים מישהו ברחוב, אחר כך מדווחים במשטרה.', 'First you ask someone in the street, then you report it to the police.'],
  ],
  cta: ['לבקש עזרה', 'Ask for help'],
  scenes: [
    {
      id: 'asking-for-help',
      receipt: ['הסברת מה קרה ושאלת איפה המשטרה.', 'You explained what happened and asked where the police are.'],
      lines: [
        npc('Are you okay?', 'Ça va ?', '¿Está bien?', 'הכל בסדר?'),
        you(CANT_FIND, { say: ["No. I can't find my phone.", 'Non. Je ne trouve pas mon téléphone.', 'No. No encuentro mi teléfono.', 'לא. אני לא מוצא את הטלפון שלי.'] }),
        npc('Did you lose it?', 'Vous l’avez perdu ?', '¿Lo ha perdido?', 'איבדת אותו?'),
        you(WAS_STOLEN, { say: ["I don't know. I think it was stolen.", 'Je ne sais pas. Je pense qu’on me l’a volé.', 'No lo sé. Creo que me lo han robado.', 'אני לא יודע. אני חושב שגנבו לי אותו.'] }),
        npc('You should go to the police.', 'Vous devriez aller à la police.', 'Debería ir a la policía.', 'כדאי לך ללכת למשטרה.'),
        you(WHERE_POLICE),
        npc("It's near here, on the left.", 'C’est tout près, à gauche.', 'Está cerca de aquí, a la izquierda.', 'זה קרוב, משמאל.'),
        you(tool('thank-you')),
        npc('Good luck!', 'Bonne chance !', '¡Buena suerte!', 'בהצלחה!'),
      ],
    },
    {
      id: 'police-station',
      receipt: ['דיווחת במשטרה: מה נגנב, איפה, ושאתה רוצה לדווח. יש לך תסריט גם לזה.', 'You reported it: what was stolen, where, and that you want to report it. You have a script for this too.'],
      lines: [
        npc('Hello. How can I help you?', 'Bonjour. Comment puis-je vous aider ?', 'Hola. ¿En qué puedo ayudarle?', 'שלום. איך אפשר לעזור?'),
        you(PHONE_STOLEN),
        npc('Where did it happen?', 'Ça s’est passé où ?', '¿Dónde ha ocurrido?', 'איפה זה קרה?', 'fast'),
        you(ON_THE_BUS, {
          rec: { tool: 'what-mean', npc: ['Your phone. Where — was it?', 'Votre téléphone. Où — était-il ?', 'Su teléfono. ¿Dónde — estaba?', 'הטלפון שלך. איפה — הוא היה?'] },
        }),
        npc('Do you want to report it?', 'Vous voulez faire une déclaration ?', '¿Quiere denunciarlo?', 'אתה רוצה לדווח על זה?'),
        you(WANT_REPORT),
        npc('Do you have your passport?', 'Vous avez votre passeport ?', '¿Tiene su pasaporte?', 'יש לך את הדרכון?'),
        you(HAVE_PASSPORT),
        npc("Okay. Let's start the report.", 'D’accord. On commence la déclaration.', 'De acuerdo. Empecemos con la denuncia.', 'בסדר. בוא נתחיל את הדיווח.'),
      ],
    },
  ],
  extra: [LOST_PASSPORT, CANT_FIND_WALLET],
  hear: [
    item('reply.lost.did-you-lose-it', 'Did you lose it?', 'Vous l’avez perdu ?', '¿Lo ha perdido?', 'איבדת אותו?'),
    item('reply.lost.go-to-police', 'You should go to the police.', 'Vous devriez aller à la police.', 'Debería ir a la policía.', 'כדאי לך ללכת למשטרה.'),
    item('reply.lost.where-happen', 'Where did it happen?', 'Ça s’est passé où ?', '¿Dónde ha ocurrido?', 'איפה זה קרה?'),
    item('reply.lost.want-to-report', 'Do you want to report it?', 'Vous voulez faire une déclaration ?', '¿Quiere denunciarlo?', 'אתה רוצה לדווח על זה?'),
    item('reply.lost.have-passport-q', 'Do you have your passport?', 'Vous avez votre passeport ?', '¿Tiene su pasaporte?', 'יש לך את הדרכון?'),
  ],
  teach: {
    tools: [
      { id: 'phrase.lost.cant-find', label: ['לא מוצא', "Can't find"] },
      { id: 'phrase.lost.phone-stolen', label: ['נגנב', 'Stolen'] },
      { id: 'phrase.emerg.lost-passport', label: ['איבדתי', 'I lost'] },
      { id: 'phrase.lost.where-police', label: ['איפה המשטרה', 'Where the police are'] },
      { id: 'phrase.lost.want-report', label: ['לדווח', 'Report it'] },
    ],
    said: 'phrase.lost.phone-stolen',
    replies: ['reply.lost.where-happen', 'reply.lost.want-to-report', 'reply.lost.have-passport-q', 'reply.lost.go-to-police'],
    repliesReceipt: ['אתה מזהה את השאלות שישאלו אותך: איפה זה קרה, ואם אתה רוצה לדווח.', 'You recognize the questions you will be asked: where it happened, and whether you want to report it.'],
    // "Where did it happen?" is drilled once above; from here on it is only ever ANSWERED, in context.
    practice: [
      // What is the situation — still looking, taken, or lost? (Words beside the icon, never an icon alone.)
      {
        kind: 'matchPairs',
        label: ['מה קרה? התאם כל משפט למצב', 'What happened? Match each sentence to its situation'],
        pairs: [
          ['phrase.lost.cant-find', 'phrase.lost.cant-find', undefined, '🔍', ['מחפש — ולא מוצא', 'Looking — it is not there']],
          ['phrase.lost.phone-stolen', 'phrase.lost.phone-stolen', undefined, '🏃', ['מישהו לקח את הטלפון', 'Someone took the phone']],
          ['phrase.emerg.lost-passport', 'phrase.emerg.lost-passport', undefined, '🛂', ['הדרכון אבד', 'The passport is lost']],
        ],
      },
      // The report, question by question.
      {
        kind: 'quickReply',
        label: ['מדווחים — מה עונים?', 'Making the report — what do you answer?'],
        rounds: [
          { npc: ['Hello. How can I help you?', 'Bonjour. Comment puis-je vous aider ?', 'Hola. ¿En qué puedo ayudarle?', 'שלום. איך אפשר לעזור?'], options: [['phrase.lost.phone-stolen', true], ['phrase.lost.on-the-bus', false], ['phrase.lost.have-passport', false]] },
          { prompt: 'reply.lost.where-happen', options: [['phrase.lost.on-the-bus', true], ['phrase.lost.want-report', false], ['phrase.lost.phone-stolen', false]] },
          { prompt: 'reply.lost.want-to-report', options: [['phrase.lost.want-report', true], ['phrase.lost.on-the-bus', false], ['phrase.lost.where-police', false]] },
          { prompt: 'reply.lost.go-to-police', options: [['phrase.lost.where-police', true], ['phrase.lost.want-report', false], ['phrase.lost.have-passport', false]] },
          { prompt: 'reply.lost.have-passport-q', options: [['phrase.lost.have-passport', true], ['phrase.lost.on-the-bus', false], ['phrase.lost.where-police', false]] },
        ],
      },
      // The same two frames, another object.
      {
        kind: 'swap',
        rounds: [
          {
            frame: ["I can't find my ___.", 'Je ne trouve pas mon ___.', 'No encuentro mi ___.'],
            itemId: 'phrase.lost.cant-find-wallet',
            cue: { emoji: '👛', text: ['הארנק לא בתיק', 'Your wallet is not in your bag'] },
            options: [
              [['wallet', 'portefeuille', 'cartera'], 'אני לא מוצא את הארנק שלי.', true],
              [['phone', 'téléphone', 'teléfono'], 'אני לא מוצא את הטלפון שלי.', false],
              [['passport', 'passeport', 'pasaporte'], 'אני לא מוצא את הדרכון שלי.', false],
            ],
          },
          {
            frame: ['I lost my ___.', 'J’ai perdu mon ___.', 'He perdido mi ___.'],
            itemId: 'phrase.emerg.lost-passport',
            cue: { emoji: '🛂', text: ['הדרכון אבד', 'Your passport is lost'] },
            options: [
              [['passport', 'passeport', 'pasaporte'], 'איבדתי את הדרכון.', true],
              [['phone', 'téléphone', 'teléfono'], 'איבדתי את הטלפון.', false],
              [['wallet', 'portefeuille', 'cartera'], 'איבדתי את הארנק.', false],
            ],
          },
          {
            frame: ['I lost my ___.', 'J’ai perdu mon ___.', 'He perdido mi ___.'],
            cue: { emoji: '📱', text: ['הטלפון אבד', 'Your phone is lost'] },
            options: [
              [['phone', 'téléphone', 'teléfono'], 'איבדתי את הטלפון.', true],
              [['wallet', 'portefeuille', 'cartera'], 'איבדתי את הארנק.', false],
              [['passport', 'passeport', 'pasaporte'], 'איבדתי את הדרכון.', false],
            ],
          },
        ],
      },
    ],
    review: [
      'phrase.lost.cant-find', 'phrase.lost.phone-stolen', 'phrase.emerg.lost-passport', 'phrase.lost.where-police',
      'phrase.lost.on-the-bus', 'phrase.lost.want-report', 'reply.lost.where-happen', 'reply.lost.want-to-report',
    ],
    // Lost or stolen → help → report: the two conversations' own lines, at natural speed.
    finale: [{
      practice: {
        kind: 'quickReply',
        challenge: true,
        rounds: [
          { npc: ['Are you okay?', 'Ça va ?', '¿Está bien?', 'הכל בסדר?'], options: [['phrase.lost.cant-find', true, ["No. I can't find my phone.", 'Non. Je ne trouve pas mon téléphone.', 'No. No encuentro mi teléfono.']], ['phrase.lost.have-passport', false], ['phrase.lost.want-report', false]] },
          { npc: ['You should go to the police.', 'Vous devriez aller à la police.', 'Debería ir a la policía.', 'כדאי לך ללכת למשטרה.'], options: [['phrase.lost.where-police', true], ['phrase.lost.on-the-bus', false], ['phrase.lost.have-passport', false]] },
          { npc: ['Hello. How can I help you?', 'Bonjour. Comment puis-je vous aider ?', 'Hola. ¿En qué puedo ayudarle?', 'שלום. איך אפשר לעזור?'], options: [['phrase.lost.phone-stolen', true], ['phrase.lost.want-report', false], ['phrase.lost.on-the-bus', false]] },
          { npc: ['Do you want to report it?', 'Vous voulez faire une déclaration ?', '¿Quiere denunciarlo?', 'אתה רוצה לדווח על זה?'], options: [['phrase.lost.want-report', true], ['phrase.lost.where-police', false], ['phrase.lost.cant-find', false]] },
        ],
      },
      receipt: ['אבד או נגנב, עזרה, דיווח — ברצף ובקצב רגיל. אמרת מה קרה וענית על מה ששאלו.', 'Lost or stolen, help, report — in a row, at normal speed. You said what happened and answered what you were asked.'],
    }],
    // One fast follow-up: two questions at once. Every word is known — the pace is the difficulty,
    // and asking for it slowly is the answer that works.
    ambush: {
      mode: 'recovery',
      npc: ['Okay. Was it here, near the station, or on the bus this morning? And do you have your passport?', 'D’accord. C’était ici, près de la gare, ou dans le bus ce matin ? Et vous avez votre passeport ?', 'De acuerdo. ¿Estaba aquí, cerca de la estación, o en el autobús esta mañana? ¿Y tiene su pasaporte?', 'בסדר. זה היה כאן, ליד התחנה, או באוטובוס הבוקר? ויש לך את הדרכון?'],
      correct: 'phrase.recovery.slowly',
      wrong: 'phrase.lost.want-report',
      receipt: ['שתי שאלות ברצף, מהר — וביקשת לאט. בדיווח לא מנחשים: שואלים שוב.', 'Two questions at once, fast — and you asked for it slowly. In a report you do not guess: you ask again.'],
    },
  },
};
