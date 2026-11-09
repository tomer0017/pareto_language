import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 14 — Restaurant Meal: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words — French and Spanish are not cut to English boundaries).
 *
 * say = the traveller's own lines · hear = the waiter's lines (comprehension — never asked for as
 * something to say). Every word of every line belongs to one of these chunks (a test proves it).
 * "Later…" is a scene cue, not a line: it is no chunk here. The Flex Round (`transferOnly`) never
 * counts: coverage is the canonical conversation only.
 *
 * A chunk is accounted for in one of three ways (mission14.test.ts):
 *   - VERIFIED PRIOR — Missions 01–13 really taught it (`learnedBefore(lang, 14)`): used, not re-taught;
 *   - COVERED here — the standard rule (`coverageOf`);
 *   - CONTEXT — `M14_CONTEXT_ONLY`: a waiter line with nothing to answer ("follow me", the menus,
 *     "Coming right up!", the goodbye) is understood from its card (meaning shown, heard on tap) and
 *     the conversation — deliberately never drilled.
 */
export const M14_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'good-evening', label: 'Good evening', role: 'hear', chunk: { en: 'Good evening', es: 'Buenas noches', fr: 'Bonsoir' } },
  { id: 'reservation-q', label: 'Do you have a reservation?', role: 'hear', chunk: { en: 'Do you have a reservation?', es: '¿Tiene reserva?', fr: 'Vous avez une réservation ?' } },
  { id: 'no', label: 'No', role: 'say', chunk: { en: 'No', es: 'No', fr: 'Non' } },
  { id: 'table-for-two', label: 'A table for two', role: 'say', chunk: { en: 'a table for two', es: 'una mesa para dos', fr: 'une table pour deux' } },
  { id: 'please', label: 'Please', role: 'say', chunk: { en: 'please', es: 'por favor', fr: 's’il vous plaît' } },
  { id: 'perfect', label: 'Perfect', role: 'hear', chunk: { en: 'Perfect', es: 'Perfecto', fr: 'Parfait' } },
  { id: 'follow-me', label: 'Follow me', role: 'hear', chunk: { en: 'follow me', es: 'sígame', fr: 'suivez-moi' } },
  { id: 'menus', label: 'Here are your menus', role: 'hear', chunk: { en: 'Here are your menus', es: 'Aquí tienen las cartas', fr: 'Voici vos menus' } },
  { id: 'ready-to-order', label: 'Are you ready to order?', role: 'hear', chunk: { en: 'Are you ready to order?', es: '¿Están listos para pedir?', fr: 'Vous êtes prêts à commander ?' } },
  { id: 'ill-have', label: 'I’ll have (the order request)', role: 'say', chunk: { en: "I'll have", es: 'Voy a tomar', fr: 'Je vais prendre' } },
  { id: 'the-chicken', label: 'The chicken', role: 'say', chunk: { en: 'the chicken', es: 'el pollo', fr: 'le poulet' } },
  { id: 'without-onions', label: 'Without onions', role: 'say', chunk: { en: 'without onions', es: 'sin cebolla', fr: 'sans oignons' } },
  { id: 'of-course', label: 'Of course', role: 'hear', chunk: { en: 'Of course', es: 'Claro', fr: 'Bien sûr' } },
  { id: 'to-drink', label: 'Anything to drink?', role: 'hear', chunk: { en: 'Anything to drink?', es: '¿Algo de beber?', fr: 'Quelque chose à boire ?' } },
  { id: 'bottle-of-water', label: 'A bottle of water', role: 'say', chunk: { en: 'A bottle of water', es: 'Una botella de agua', fr: 'Une bouteille d’eau' } },
  { id: 'anything-else', label: 'Anything else?', role: 'hear', chunk: { en: 'Anything else?', es: '¿Algo más?', fr: 'Autre chose ?' } },
  { id: 'thats-all', label: 'That’s all', role: 'say', chunk: { en: "That's all", es: 'Eso es todo', fr: 'C’est tout' } },
  { id: 'thanks', label: 'Thanks', role: 'say', chunk: { en: 'thanks', es: 'gracias', fr: 'merci' } },
  { id: 'coming-right-up', label: 'Coming right up!', role: 'hear', chunk: { en: 'Coming right up!', es: '¡Enseguida se lo traigo!', fr: 'Ça arrive tout de suite !' } },
  { id: 'everything-okay', label: 'Is everything okay?', role: 'hear', chunk: { en: 'Is everything okay?', es: '¿Va todo bien?', fr: 'Tout va bien ?' } },
  { id: 'yes', label: 'Yes', role: 'say', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'delicious', label: 'That was delicious', role: 'say', chunk: { en: 'that was delicious', es: 'estaba delicioso', fr: 'c’était délicieux' } },
  { id: 'the-bill', label: 'The bill', role: 'say', chunk: { en: 'The bill', es: 'La cuenta', fr: 'L’addition' } },
  { id: 'glad-enjoyed', label: 'So glad you enjoyed it', role: 'hear', chunk: { en: 'So glad you enjoyed it', es: 'Me alegro de que les gustara', fr: 'Ravi que ça vous ait plu' } },
  { id: 'here-you-are', label: 'Here you are', role: 'hear', chunk: { en: 'Here you are', es: 'Aquí tienen', fr: 'Voici' } },
  { id: 'lovely-evening', label: 'Have a lovely evening', role: 'hear', chunk: { en: 'have a lovely evening', es: 'que pasen buena noche', fr: 'passez une bonne soirée' } },
];

/** The waiter's lines with nothing to answer: understood from their card and the conversation — never drilled. */
export const M14_CONTEXT_ONLY: readonly string[] = ['follow-me', 'menus', 'coming-right-up', 'glad-enjoyed', 'here-you-are', 'lovely-evening'];
