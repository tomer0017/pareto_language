import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 21 — Future Travel & Plans: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS conversation, in
 * each language's own words — French and Spanish are not cut to English boundaries).
 *
 * say = the traveller's own production · hear = understood (the friend's lines — never asked for as something
 * to say). Every word of every line belongs to one of these chunks (a test proves it).
 *
 * The four production tools are FRAMES — "I'm going to", "I'll be there for", "I want to", "Where are you going
 * next?" — so a line that uses a frame with another (verified-prior) detail practises the same chunk. "After
 * that" and "tomorrow morning" are the frames of two reuse lines ("After that I'm going to ___", "Tomorrow
 * morning I'm going to ___"), so they are `say` as well; the third reuse line, "I want to travel by motorbike",
 * is the "I want to" tool with another plan.
 *
 * The plan's details: Vietnam and Hanoi (and "two weeks") are retrieved from memory in No Help — `say`. Thailand,
 * the airport and "travel by motorbike" come only with the reuse lines, which are NOT tools of their own (the
 * brief: do not over-split); they are the learner's own facts, on the MY NEXT TRIP board from the start. They are
 * held to the comprehension standard (`hear`: met with their meaning, chosen in an answer and in the
 * conversation) — never drilled as vocabulary, and the final replaces them anyway.
 *
 * "And you?" is the lead-in of the locked ask-back line only: teaching, No Help and the final retrieve the
 * question ALONE ("Where are you going next?"), so it is `hear` (and verified prior: Mission 20).
 *
 * A chunk is accounted for in one of two ways (mission21.test.ts):
 *   - VERIFIED PRIOR — Missions 01–20 really taught it (`learnedBefore(lang, 21)`): used, not re-taught;
 *   - COVERED here — the standard rule (`coverageOf`).
 */
export const M21_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'so', label: 'So, …', role: 'hear', chunk: { en: 'So', es: 'Bueno', fr: 'Alors' } },
  { id: 'where-going-next', label: 'Where are you going next?', role: 'say', chunk: { en: 'where are you going next?', es: '¿a dónde vas después?', fr: 'tu vas où après ?' } },
  { id: 'going-to', label: 'I’m going to ___', role: 'say', chunk: { en: "I'm going to", es: 'Voy a', fr: 'Je vais' } },
  { id: 'vietnam', label: 'Vietnam', role: 'say', chunk: { en: 'Vietnam', es: 'Vietnam', fr: 'au Vietnam' } },
  { id: 'wow', label: 'Wow!', role: 'hear', chunk: { en: 'Wow!', es: '¡Guau!', fr: 'Waouh !' } },
  { id: 'how-long', label: 'How long will you be there?', role: 'hear', chunk: { en: 'How long will you be there?', es: '¿Cuánto tiempo vas a estar allí?', fr: 'Tu restes combien de temps ?' } },
  { id: 'be-there-for', label: 'I’ll be there for ___', role: 'say', chunk: { en: "I'll be there for", es: 'Voy a estar allí', fr: 'Je vais rester' } },
  { id: 'two-weeks', label: 'Two weeks', role: 'say', chunk: { en: 'two weeks', es: 'dos semanas', fr: 'deux semaines' } },
  { id: 'what-want-to-do', label: 'What do you want to do there?', role: 'hear', chunk: { en: 'What do you want to do there?', es: '¿Qué quieres hacer allí?', fr: 'Tu veux faire quoi là-bas ?' } },
  { id: 'want-to', label: 'I want to ___', role: 'say', chunk: { en: 'I want to', es: 'Quiero', fr: 'Je veux' } },
  { id: 'visit', label: 'visit ___', role: 'say', chunk: { en: 'visit', es: 'visitar', fr: 'visiter' } },
  { id: 'hanoi', label: 'Hanoi', role: 'say', chunk: { en: 'Hanoi', es: 'Hanói', fr: 'Hanoï' } },
  { id: 'nice', label: 'Nice.', role: 'hear', chunk: { en: 'Nice.', es: 'Qué bien.', fr: 'Sympa.' } },
  { id: 'anything-else', label: 'Anything else?', role: 'hear', chunk: { en: 'Anything else?', es: '¿Algo más?', fr: 'Autre chose ?' } },
  { id: 'travel-by-motorbike', label: 'travel by motorbike', role: 'hear', chunk: { en: 'travel by motorbike', es: 'viajar en moto', fr: 'voyager à moto' } },
  { id: 'sounds-amazing', label: 'Sounds amazing!', role: 'hear', chunk: { en: 'Sounds amazing!', es: '¡Suena increíble!', fr: 'Ça a l’air génial !' } },
  { id: 'be-careful', label: 'Be careful.', role: 'hear', chunk: { en: 'Be careful.', es: 'Ten cuidado.', fr: 'Fais attention.' } },
  { id: 'and-after-that', label: 'And after that?', role: 'hear', chunk: { en: 'And after that?', es: '¿Y después de eso?', fr: 'Et après ça ?' } },
  { id: 'after-that', label: 'After that ___', role: 'say', chunk: { en: 'After that', es: 'Después de eso', fr: 'Après ça' } },
  { id: 'thailand', label: 'Thailand', role: 'hear', chunk: { en: 'Thailand', es: 'Tailandia', fr: 'en Thaïlande' } },
  { id: 'great-plan', label: 'Great plan.', role: 'hear', chunk: { en: 'Great plan.', es: 'Buen plan.', fr: 'Super programme.' } },
  { id: 'what-doing-tomorrow', label: 'What are you doing tomorrow morning?', role: 'hear', chunk: { en: 'And what are you doing tomorrow morning?', es: '¿Y qué haces mañana por la mañana?', fr: 'Et tu fais quoi demain matin ?' } },
  { id: 'tomorrow-morning', label: 'Tomorrow morning ___', role: 'say', chunk: { en: 'Tomorrow morning', es: 'Mañana por la mañana', fr: 'Demain matin' } },
  { id: 'airport', label: 'The airport', role: 'hear', chunk: { en: 'the airport', es: 'al aeropuerto', fr: 'à l’aéroport' } },
  { id: 'already', label: 'Already!', role: 'hear', chunk: { en: 'Already!', es: '¡Ya!', fr: 'Déjà !' } },
  { id: 'miss-you', label: 'We’ll miss you.', role: 'hear', chunk: { en: "We'll miss you.", es: 'Te vamos a echar de menos.', fr: 'Tu vas nous manquer.' } },
  { id: 'and-you', label: 'And you?', role: 'hear', chunk: { en: 'And you?', es: '¿Y tú?', fr: 'Et toi ?' } },
  { id: 'me', label: 'Me?', role: 'hear', chunk: { en: 'Me?', es: '¿Yo?', fr: 'Moi ?' } },
  { id: 'going-home', label: 'I’m going home.', role: 'hear', chunk: { en: "I'm going home.", es: 'Me voy a casa.', fr: 'Je rentre chez moi.' } },
  { id: 'great-trip', label: 'Have a great trip!', role: 'hear', chunk: { en: 'Have a great trip!', es: '¡Buen viaje!', fr: 'Bon voyage !' } },
];
