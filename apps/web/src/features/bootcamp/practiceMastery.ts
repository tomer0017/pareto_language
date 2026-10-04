import type { MissionLang } from './author.js';
import { kit } from './practiceV1.js';
import type { BootcampStep } from './types.js';

/**
 * Practice depth — Mastery, the one hand-written teaching mission of the phase: 26 (Pharmacy &
 * Health). Defined ONCE for English, French and Spanish. (Missions 25 and 27 are multilingual specs
 * — their practice lives in `core/`; 28–30 teach nothing and live in `core/checkpoints.ts`.)
 *
 * The mission file keeps its sentences, its conversation and its intro card, and takes everything
 * from the key sentences onward from here.
 *
 * This is language practice, not medical advice. Rules kept here:
 *   - the only instructions the learner hears are lines the mission already had ("twice a day",
 *     "after meals", "follow the instructions on the label", "you should see a doctor") — no dose,
 *     duration or remedy is invented;
 *   - nothing says a medicine is right or safe for anyone;
 *   - asking to hear an instruction again is a correct answer, never a failure: with health you
 *     understand before you act.
 * "Any allergies?" and the dosage are each drilled once, then only answered or recognised in context.
 *
 * All French and Spanish wording: AI linguistic review completed; native review still recommended.
 */
export function m26Flow(lang: MissionLang): BootcampStep[] {
  const k = kit(lang);
  return [
    ...k.tools([
      ['phrase.pharm.headache', ['לתאר תסמין', 'Describe a symptom']],
      ['phrase.pharm.something-for', ['לבקש תרופה', 'Ask for a remedy']],
      ['phrase.pharm.allergic-penicillin', ['להצהיר על אלרגיה', 'State an allergy']],
      ['phrase.pharm.how-often', ['לשאול כל כמה זמן', 'Ask how often']],
    ]),
    k.replies('phrase.pharm.headache', ['reply.pharm.whats-matter', 'reply.pharm.any-allergies', 'reply.pharm.feel-better']),
    k.receipt(['אתה מזהה את מה שהרוקח שואל: מה קרה, ואם יש אלרגיות.', 'You recognize what the pharmacist asks: what is the matter, and whether you have allergies.']),
    // Which sentence says what? (Words beside the icon, never an icon alone.)
    k.practice({
      kind: 'matchPairs',
      label: ['מה אתה אומר? התאם כל משפט למה שהוא מתאר', 'What are you saying? Match each sentence to what it describes'],
      pairs: [
        ['phrase.pharm.headache', 'phrase.pharm.headache', undefined, '🤕', ['כאב ראש', 'A headache']],
        ['phrase.pharm.stomach-ache', 'phrase.pharm.stomach-ache', undefined, '🤢', ['כאב בטן', 'A stomach ache']],
        ['phrase.pharm.hurts-here', 'phrase.pharm.hurts-here', undefined, '👉', ['כואב כאן — מצביעים', 'It hurts here — you point']],
        ['phrase.pharm.something-for', 'phrase.pharm.something-for', undefined, '🤧', ['משהו לצינון', 'Something for a cold']],
      ],
    }),
    // At the counter: the question decides the answer.
    k.practice({
      kind: 'quickReply',
      label: ['בבית המרקחת — מה עונים?', 'At the pharmacy — what do you say?'],
      rounds: [
        { prompt: 'reply.pharm.whats-matter', options: [['phrase.pharm.headache', true], ['phrase.pharm.how-often', false], ['phrase.pharm.allergic-penicillin', false]] },
        { prompt: 'reply.pharm.any-allergies', options: [['phrase.pharm.allergic-penicillin', true], ['phrase.pharm.stomach-ache', false], ['phrase.pharm.how-often', false]] },
        { npc: ['Good to know. This may help.', 'Bon à savoir. Ceci peut vous aider.', 'Gracias por decírmelo. Esto puede ayudarle.', 'טוב לדעת. זה יכול לעזור.'], options: [['phrase.pharm.how-often', true], ['phrase.pharm.headache', false], ['phrase.pharm.hurts-here', false]] },
        { situation: ['יש לך צינון, ואתה לא יודע איך קוראים לתרופה.', 'You have a cold, and you do not know what the medicine is called.'], options: [['phrase.pharm.something-for', true], ['phrase.pharm.how-often', false], ['phrase.pharm.allergic-penicillin', false]] },
      ],
    }),
    // Understanding an instruction: only the three things the pharmacist says in this mission.
    k.practice({
      kind: 'matchPairs',
      label: ['מה הרוקח אמר? התאם כל הוראה למשמעות שלה', 'What did the pharmacist say? Match each instruction to its meaning'],
      pairs: [
        ['reply.pharm.take-twice', 'reply.pharm.take-twice', undefined, '2×', ['פעמיים ביום', 'Twice a day']],
        ['reply.pharm.after-meals', 'reply.pharm.after-meals', undefined, '🍽️', ['אחרי הארוחות', 'After meals']],
        ['reply.pharm.see-doctor', 'reply.pharm.see-doctor', undefined, '👩‍⚕️', ['כדאי לראות רופא', 'You should see a doctor']],
      ],
    }),
    k.dialogue('pharmacy'),
    k.receipt(['תיארת תסמין, אמרת על האלרגיה, ושאלת כל כמה זמן. שואלים — ולא מנחשים.', 'You described a symptom, stated your allergy, and asked how often. You ask — you do not guess.']),
    k.review([
      'phrase.pharm.headache', 'phrase.pharm.stomach-ache', 'phrase.pharm.hurts-here', 'phrase.pharm.something-for',
      'phrase.pharm.allergic-penicillin', 'phrase.pharm.how-often', 'reply.pharm.take-twice', 'reply.pharm.after-meals',
    ]),
    // Symptom → allergy → the medicine question, at natural speed: the conversation's own lines.
    k.practice({
      kind: 'quickReply',
      challenge: true,
      rounds: [
        { npc: ["Hello! What's the matter?", 'Bonjour ! Qu’est-ce qui ne va pas ?', '¡Hola! ¿Qué le pasa?', 'שלום! מה קרה?'], options: [['phrase.pharm.headache', true], ['phrase.pharm.how-often', false], ['phrase.pharm.something-for', false]] },
        { npc: ['I see. Before I give you anything — any allergies?', 'Je vois. Avant de vous donner quelque chose — des allergies ?', 'Entiendo. Antes de darle algo — ¿alguna alergia?', 'הבנתי. לפני שאתן לך משהו — יש אלרגיות?'], options: [['phrase.pharm.allergic-penicillin', true], ['phrase.pharm.headache', false], ['phrase.pharm.hurts-here', false]] },
        { npc: ['Good to know. This may help.', 'Bon à savoir. Ceci peut vous aider.', 'Gracias por decírmelo. Esto puede ayudarle.', 'טוב לדעת. זה יכול לעזור.'], options: [['phrase.pharm.how-often', true], ['phrase.pharm.stomach-ache', false], ['phrase.pharm.allergic-penicillin', false]] },
      ],
    }),
    k.receipt(['תסמין, אלרגיה, והשאלה על התרופה — ברצף ובקצב רגיל.', 'Symptom, allergy, and the question about the medicine — in a row, at normal speed.']),
    // …then the instruction, fast. Every word is known; the pace is the difficulty. Saying "thank
    // you" to an instruction you did not catch is the wrong move — asking for it slowly is the right one.
    k.ambush('recovery',
      ['Take this twice a day, after meals, and please follow the instructions on the label. Any other allergies?', 'Prenez-en deux fois par jour, après les repas, et suivez bien les instructions de la notice. D’autres allergies ?', 'Tómelo dos veces al día, después de las comidas, y siga las instrucciones del prospecto. ¿Alguna otra alergia?', 'קח את זה פעמיים ביום, אחרי הארוחות, ותפעל לפי ההוראות בעלון. יש עוד אלרגיות?'],
      'phrase.recovery.slowly', 'phrase.recovery.thank-you'),
    k.receipt(['הוראה מהירה — וביקשת לאט במקום להנהן. עם בריאות קודם מבינים, ורק אז פועלים.', 'A fast instruction — and you asked for it slowly instead of nodding. With health you understand first, and only then act.']),
    { kind: 'summary' },
  ];
}
