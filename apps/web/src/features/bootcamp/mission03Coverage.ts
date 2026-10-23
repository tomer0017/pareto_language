import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 03 — the dialogue coverage specification, on the Mission 01 pattern (the counting and the
 * rule live in `mission01Coverage.ts`; this file only names the chunks of THIS conversation).
 *
 * hear = the barista says it (comprehension first) · say = the learner says it (rapid recall).
 * Chunks, not words: "What can I get you?" is one functional piece ("what would you like to order?"),
 * and so is "Would you like anything else?". Every word of every line belongs to one of them (a test
 * proves it), so no line of the video is outside the specification.
 */
export const M03_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'good-morning', label: 'Greeting', role: 'hear', chunk: { en: 'Good morning', es: 'Buenos días', fr: 'Bonjour' } },
  { id: 'what-can-i-get', label: 'The opening: what would you like?', role: 'hear', chunk: { en: 'What can I get you?', es: '¿Qué le sirvo?', fr: 'Qu’est-ce que je vous sers ?' } },
  { id: 'id-like', label: 'The order template', role: 'say', chunk: { en: "I'd like", es: 'Quiero', fr: 'Je voudrais' } },
  { id: 'iced-coffee', label: 'The drink', role: 'say', chunk: { en: 'iced coffee', es: 'café con hielo', fr: 'café glacé' } },
  { id: 'please', label: 'Please', role: 'say', chunk: { en: 'please', es: 'por favor', fr: 's’il vous plaît' } },
  { id: 'sure', label: 'The barista’s yes', role: 'hear', chunk: { en: 'Sure', es: 'Perfecto', fr: 'Parfait' } },
  { id: 'medium-or-large', label: 'Size question', role: 'hear', chunk: { en: 'Medium or large?', es: '¿Mediano o grande?', fr: 'Moyen ou grand ?' } },
  { id: 'medium', label: 'Size answer', role: 'say', chunk: { en: 'Medium, please', es: 'Mediano, por favor', fr: 'Moyen, s’il vous plaît' } },
  { id: 'milk-sugar', label: 'Milk / sugar question', role: 'hear', chunk: { en: 'Milk and sugar?', es: '¿Leche y azúcar?', fr: 'Lait et sucre ?' } },
  { id: 'milk', label: 'With milk', role: 'say', chunk: { en: 'Milk', es: 'Con leche', fr: 'Avec du lait' } },
  { id: 'no-sugar', label: 'Without sugar', role: 'say', chunk: { en: 'no sugar', es: 'sin azúcar', fr: 'sans sucre' } },
  { id: 'anything-to-eat', label: 'Food question', role: 'hear', chunk: { en: 'Anything to eat?', es: '¿Algo de comer?', fr: 'Quelque chose à manger ?' } },
  { id: 'croissant', label: 'Food answer', role: 'say', chunk: { en: 'A croissant, please', es: 'Un cruasán, por favor', fr: 'Un croissant, s’il vous plaît' } },
  { id: 'great-choice', label: 'The barista’s praise', role: 'hear', chunk: { en: 'Great choice', es: 'Buena elección', fr: 'Excellent choix' } },
  { id: 'anything-else', label: 'Anything else?', role: 'hear', chunk: { en: 'Would you like anything else?', es: '¿Algo más?', fr: 'Vous désirez autre chose ?' } },
  { id: 'thats-all', label: 'That’s all', role: 'say', chunk: { en: "That's all", es: 'Eso es todo', fr: 'C’est tout' } },
  { id: 'thanks', label: 'Thanks', role: 'say', chunk: { en: 'thanks', es: 'gracias', fr: 'merci' } },
  { id: 'six-fifty', label: 'The price', role: 'hear', chunk: { en: "That'll be six fifty", es: 'Son seis con cincuenta', fr: 'Ça fait six euros cinquante' } },
  { id: 'cash-or-card', label: 'Payment question', role: 'hear', chunk: { en: 'Cash or card?', es: '¿Efectivo o tarjeta?', fr: 'Espèces ou carte ?' } },
  { id: 'card', label: 'Payment answer', role: 'say', chunk: { en: 'Card, please', es: 'Con tarjeta, por favor', fr: 'Par carte, s’il vous plaît' } },
  { id: 'receipt', label: 'Receipt question', role: 'hear', chunk: { en: 'Would you like the receipt?', es: '¿Quiere el recibo?', fr: 'Vous voulez le ticket ?' } },
  { id: 'yes', label: 'Receipt answer', role: 'say', chunk: { en: 'Yes, please', es: 'Sí, por favor', fr: 'Oui, s’il vous plaît' } },
  { id: 'here-you-go', label: 'Handing it over', role: 'hear', chunk: { en: 'Here you go', es: 'Aquí tiene', fr: 'Voilà' } },
  { id: 'enjoy-day', label: 'The closing wish', role: 'hear', chunk: { en: 'enjoy your day', es: 'que tenga un buen día', fr: 'bonne journée' } },
];
