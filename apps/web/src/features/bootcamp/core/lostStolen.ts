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
    quiz: ['reply.lost.where-happen', 'reply.lost.did-you-lose-it', 'reply.lost.have-passport-q'],
    ambush: {
      npc: ['Okay try to remember where did it happen was it here or on the bus?', 'Bon, essayez de vous rappeler : ça s’est passé où, ici ou dans le bus ?', 'A ver, intente recordar: ¿dónde ha ocurrido, aquí o en el autobús?', 'טוב, נסה להיזכר — איפה זה קרה, כאן או באוטובוס?'],
      correct: 'reply.lost.where-happen',
      wrong: 'reply.lost.go-to-police',
      receipt: ['גם בלחץ — הבנת ששואלים איפה זה קרה.', 'Even under stress — you understood you were asked where it happened.'],
    },
  },
};
