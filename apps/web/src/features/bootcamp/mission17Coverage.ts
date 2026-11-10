import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 17 — Supermarket & Everyday Shopping: the dialogue coverage specification, on the Mission 01
 * pattern (the counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words — French and Spanish are not cut to English boundaries).
 *
 * say = the traveller's own lines · hear = the staff's lines (comprehension — never asked for as
 * something to say). Every word of every line belongs to one of these chunks (a test proves it).
 *
 * "At the checkout…" is NOT here: it is a silent scene cue (UI), never spoken language.
 * The six supermarket essentials are RECOGNITION vocabulary: `M17_PRODUCT_CONCEPTS`, kept apart from
 * the dialogue's chunks (only "milk" is in the conversation).
 *
 * A chunk is accounted for in one of two ways (mission17.test.ts):
 *   - VERIFIED PRIOR — Missions 01–16 really taught it (`learnedBefore(lang, 17)`): used, not re-taught;
 *   - COVERED here — the standard rule (`coverageOf`).
 */
export const M17_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hi-there', label: 'Hi there', role: 'hear', chunk: { en: 'Hi there', es: '¡Hola!', fr: 'Bonjour' } },
  { id: 'help-find', label: 'Can I help you find something?', role: 'hear', chunk: { en: 'Can I help you find something?', es: '¿Le ayudo a encontrar algo?', fr: 'Je peux vous aider à trouver quelque chose ?' } },
  { id: 'where-is-milk', label: 'Where is the milk?', role: 'say', chunk: { en: 'Where is the milk?', es: '¿Dónde está la leche?', fr: 'Où est le lait ?' } },
  { id: 'milk-aisle-three', label: 'The milk is in aisle three', role: 'hear', chunk: { en: 'The milk is in aisle three', es: 'La leche está en el pasillo tres', fr: 'Le lait est dans l’allée trois' } },
  { id: 'on-the-left', label: 'On the left', role: 'hear', chunk: { en: 'on the left', es: 'a la izquierda', fr: 'sur la gauche' } },
  { id: 'thank-you', label: 'Thank you', role: 'say', chunk: { en: 'Thank you!', es: '¡Gracias!', fr: 'Merci !' } },
  { id: 'hi', label: 'Hi', role: 'hear', chunk: { en: 'Hi', es: '¡Hola!', fr: 'Bonjour' } },
  { id: 'everything', label: 'Is that everything?', role: 'hear', chunk: { en: 'Is that everything?', es: '¿Eso es todo?', fr: 'Ce sera tout ?' } },
  { id: 'just-this', label: 'Just this, thanks', role: 'say', chunk: { en: 'Just this, thanks', es: 'Solo esto, gracias', fr: 'Juste ça, merci' } },
  { id: 'need-bag', label: 'Do you need a bag?', role: 'hear', chunk: { en: 'Do you need a bag?', es: '¿Necesita una bolsa?', fr: 'Vous avez besoin d’un sac ?' } },
  { id: 'get-bag', label: 'Could I get a bag?', role: 'say', chunk: { en: 'Could I get a bag?', es: '¿Me da una bolsa?', fr: 'Je peux avoir un sac ?' } },
  { id: 'insert-card', label: 'Insert your card here', role: 'hear', chunk: { en: 'Insert your card here…', es: 'Inserte su tarjeta aquí…', fr: 'Insérez votre carte ici…' } }, // the pause (…) is part of the line's own words
  { id: 'all-done', label: 'All done', role: 'hear', chunk: { en: 'all done', es: 'listo', fr: 'c’est bon' } },
  { id: 'nice-day', label: 'Have a nice day', role: 'hear', chunk: { en: 'Have a nice day', es: '¡Que tenga un buen día!', fr: 'Bonne journée' } },
];

/** The six supermarket essentials — recognition vocabulary (shelf, picture, word, audio); never a production target. */
export const M17_PRODUCT_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'milk', label: 'Milk', role: 'hear', chunk: { en: 'milk', es: 'la leche', fr: 'le lait' } },
  { id: 'water', label: 'Water', role: 'hear', chunk: { en: 'water', es: 'el agua', fr: 'l’eau' } },
  { id: 'bread', label: 'Bread', role: 'hear', chunk: { en: 'bread', es: 'el pan', fr: 'le pain' } },
  { id: 'cheese', label: 'Cheese', role: 'hear', chunk: { en: 'cheese', es: 'el queso', fr: 'le fromage' } },
  { id: 'eggs', label: 'Eggs', role: 'hear', chunk: { en: 'eggs', es: 'los huevos', fr: 'les œufs' } },
  { id: 'apples', label: 'Apples', role: 'hear', chunk: { en: 'apples', es: 'las manzanas', fr: 'les pommes' } },
];
