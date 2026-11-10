import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 19 — Public Transport: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS conversation,
 * in each language's own words — French and Spanish are not cut to English boundaries).
 *
 * say = the traveller's own lines · hear = the staff's lines (comprehension — never asked for as
 * something to say). Every word of every line belongs to one of these chunks (a test proves it).
 * "the centre" is its own chunk too: the learner's destination, already prior.
 *
 * A chunk is accounted for in one of two ways (mission19.test.ts):
 *   - VERIFIED PRIOR — Missions 01–18 really taught it (`learnedBefore(lang, 19)`): used, not re-taught;
 *   - COVERED here — the standard rule (`coverageOf`).
 */
export const M19_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hello', label: 'Hello', role: 'hear', chunk: { en: 'Hello', es: '¡Hola!', fr: 'Bonjour' } },
  { id: 'where-headed', label: 'Where are you headed?', role: 'hear', chunk: { en: 'Where are you headed?', es: '¿A dónde va?', fr: 'Vous allez où ?' } },
  { id: 'one-ticket', label: 'One ticket to the centre, please', role: 'say', chunk: { en: 'One ticket to the centre, please', es: 'Un billete para el centro, por favor', fr: 'Un billet pour le centre, s’il vous plaît' } },
  { id: 'centre', label: 'The centre', role: 'hear', chunk: { en: 'the centre', es: 'el centro', fr: 'le centre' } },
  { id: 'single-or-return', label: 'Single or return?', role: 'hear', chunk: { en: 'Single or return?', es: '¿Solo ida o ida y vuelta?', fr: 'Aller simple ou aller-retour ?' } },
  { id: 'single-please', label: 'Single, please', role: 'say', chunk: { en: 'Single, please', es: 'Solo ida, por favor', fr: 'Aller simple, s’il vous plaît' } },
  { id: 'three-euros', label: 'That’s three euros', role: 'hear', chunk: { en: "That's three euros", es: 'Son tres euros', fr: 'Ça fait trois euros' } },
  { id: 'every-ten-minutes', label: 'It leaves every ten minutes', role: 'hear', chunk: { en: 'It leaves every ten minutes', es: 'Sale cada diez minutos', fr: 'Ça part toutes les dix minutes' } },
  { id: 'which-platform', label: 'Which platform?', role: 'say', chunk: { en: 'Which platform?', es: '¿Qué andén?', fr: 'Quel quai ?' } },
  { id: 'platform-two', label: 'Platform two', role: 'hear', chunk: { en: 'Platform two', es: 'Andén número dos', fr: 'Quai numéro deux' } },
  { id: 'straight-ahead', label: 'Straight ahead', role: 'hear', chunk: { en: 'Straight ahead', es: 'Todo recto', fr: 'Tout droit' } },
  { id: 'thank-you', label: 'Thank you', role: 'say', chunk: { en: 'Thank you!', es: '¡Gracias!', fr: 'Merci !' } },
  { id: 'train-right-here', label: 'The train’s right here', role: 'hear', chunk: { en: "The train's right here", es: 'El tren está justo ahí', fr: 'Le train est juste là' } },
  { id: 'hop-on', label: 'Hop on', role: 'hear', chunk: { en: 'Hop on', es: 'Suba', fr: 'Montez' } },
  { id: 'does-this-stop', label: 'Does this stop at the museum?', role: 'say', chunk: { en: 'Does this stop at the museum?', es: '¿Para en el museo?', fr: 'Ça s’arrête au musée ?' } },
  { id: 'yes', label: 'Yes', role: 'hear', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'three-stops', label: 'It’s three stops', role: 'hear', chunk: { en: "it's three stops", es: 'son tres paradas', fr: 'c’est à trois arrêts' } },
  { id: 'tell-you-when', label: 'I’ll tell you when', role: 'hear', chunk: { en: "I'll tell you when", es: 'Le aviso cuándo', fr: 'Je vous dirai quand' } },
  { id: 'here-we-are', label: 'Here we are', role: 'hear', chunk: { en: 'Here we are', es: 'Ya llegamos', fr: 'Nous voilà' } },
  { id: 'stop-is-next', label: 'Your stop is next', role: 'hear', chunk: { en: 'your stop is next', es: 'su parada es la siguiente', fr: 'votre arrêt est le prochain' } },
  { id: 'enjoy-museum', label: 'Enjoy the museum', role: 'hear', chunk: { en: 'Enjoy the museum!', es: '¡Que disfrute del museo!', fr: 'Bonne visite du musée !' } },
];
