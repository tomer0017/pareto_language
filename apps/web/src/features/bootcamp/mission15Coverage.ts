import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 15 — Food Preferences & Allergies: the dialogue coverage specification, on the Mission 01
 * pattern (the counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words — French and Spanish are not cut to English boundaries).
 *
 * say = the traveller's own lines · hear = the waiter's lines (comprehension — never asked for as
 * something to say). Every word of every line belongs to one of these chunks (a test proves it).
 *
 * A chunk is accounted for in one of three ways (mission15.test.ts):
 *   - VERIFIED PRIOR — Missions 01–14 really taught it (`learnedBefore(lang, 15)`): used, not re-taught
 *     ("without onions", "Great", please, "Thank you", "Of course");
 *   - COVERED here — the standard rule (`coverageOf`);
 *   - CONTEXT — `M15_CONTEXT_ONLY`: the waiter's last line ("I'll check with them and come right back")
 *     has nothing to answer: its card (meaning shown, heard on tap) and the conversation carry it.
 */
export const M15_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hi-there', label: 'Hi there', role: 'hear', chunk: { en: 'Hi there', es: '¡Hola!', fr: 'Bonjour' } },
  { id: 'ready-to-order', label: 'Are you ready to order?', role: 'hear', chunk: { en: 'Are you ready to order?', es: '¿Está listo para pedir?', fr: 'Vous êtes prêt à commander ?' } },
  { id: 'allergic-nuts', label: 'I’m allergic to nuts', role: 'say', chunk: { en: "I'm allergic to nuts", es: 'Soy alérgico a los frutos secos', fr: 'Je suis allergique aux noix' } },
  { id: 'thanks-for-telling', label: 'Thank you for telling me', role: 'hear', chunk: { en: 'Thank you for telling me', es: 'Gracias por avisarme', fr: 'Merci de me le dire' } },
  { id: 'other-allergies', label: 'Any other allergies', role: 'hear', chunk: { en: 'Any other allergies', es: '¿Alguna otra alergia', fr: 'D’autres allergies' } },
  { id: 'dietary-restrictions', label: 'Or dietary restrictions', role: 'hear', chunk: { en: 'or dietary restrictions?', es: 'o restricción alimentaria?', fr: 'ou restrictions alimentaires ?' } },
  { id: 'vegetarian', label: 'I’m vegetarian', role: 'say', chunk: { en: "I'm vegetarian", es: 'Soy vegetariano', fr: 'Je suis végétarien' } },
  { id: 'got-it', label: 'Got it', role: 'hear', chunk: { en: 'Got it', es: 'Entendido', fr: 'Compris' } },
  { id: 'risotto-vegetarian', label: 'The mushroom risotto is vegetarian', role: 'hear', chunk: { en: 'The mushroom risotto is vegetarian', es: 'El risotto de champiñones es vegetariano', fr: 'Le risotto aux champignons est végétarien' } },
  { id: 'check-kitchen', label: 'But I’ll check with the kitchen', role: 'hear', chunk: { en: "but I'll check with the kitchen", es: 'pero lo compruebo con la cocina', fr: 'mais je vérifie avec la cuisine' } },
  { id: 'about-nuts', label: 'About the nuts', role: 'hear', chunk: { en: 'about the nuts', es: 'por los frutos secos', fr: 'pour les noix' } },
  { id: 'dairy-q', label: 'Does it have dairy?', role: 'say', chunk: { en: 'Does it have dairy?', es: '¿Esto lleva lácteos?', fr: 'Est-ce qu’il y a des produits laitiers dedans ?' } },
  { id: 'yes', label: 'Yes', role: 'hear', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'some-cream', label: 'It has some cream', role: 'hear', chunk: { en: 'it has some cream', es: 'lleva un poco de nata', fr: 'il y a un peu de crème' } },
  { id: 'make-without', label: 'But we can make it without', role: 'hear', chunk: { en: 'but we can make it without', es: 'pero se lo podemos hacer sin ella', fr: 'mais on peut le faire sans' } },
  { id: 'great', label: 'Great', role: 'say', chunk: { en: 'Great', es: 'Genial', fr: 'Parfait' } },
  { id: 'without-onions', label: 'Without onions', role: 'say', chunk: { en: 'Without onions', es: 'Sin cebolla', fr: 'Sans oignons' } },
  { id: 'please', label: 'Please', role: 'say', chunk: { en: 'please', es: 'por favor', fr: 's’il vous plaît' } },
  { id: 'of-course', label: 'Of course', role: 'hear', chunk: { en: 'Of course', es: 'Claro', fr: 'Bien sûr' } },
  { id: 'tell-kitchen', label: 'I’ll tell the kitchen about your allergy', role: 'hear', chunk: { en: "I'll tell the kitchen about your allergy", es: 'Aviso a la cocina de su alergia', fr: 'Je préviens la cuisine pour votre allergie' } },
  { id: 'thank-you', label: 'Thank you', role: 'say', chunk: { en: 'Thank you!', es: '¡Gracias!', fr: 'Merci !' } },
  { id: 'check-come-back', label: 'I’ll check with them and come right back', role: 'hear', chunk: { en: "I'll check with them and come right back", es: 'Lo compruebo con ellos y vuelvo enseguida', fr: 'Je vérifie avec eux et je reviens tout de suite' } },
];

/** The waiter's line with nothing to answer: understood from its card and the conversation — never drilled. */
export const M15_CONTEXT_ONLY: readonly string[] = ['check-come-back'];
