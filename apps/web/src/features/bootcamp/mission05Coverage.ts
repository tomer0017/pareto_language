import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 05 — Directions: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation).
 *
 * say = the traveller's own lines (learner production) · hear = the directions and the reactions
 * (comprehension first — never asked for as something to say). Every word of every line belongs to
 * one of these chunks or to a small joining word (a test proves it).
 */
export const M05_CONCEPTS: readonly CoverageConcept[] = [
  // what the traveller says
  { id: 'excuse-me', label: 'Getting someone’s attention', role: 'say', chunk: { en: 'Excuse me', es: 'Perdone', fr: 'Excusez-moi' } },
  { id: 'where-station', label: 'Where is the station?', role: 'say', chunk: { en: 'Where is the station?', es: '¿Dónde está la estación?', fr: 'Où est la gare ?' } },
  { id: 'is-it-far', label: 'Is it far?', role: 'say', chunk: { en: 'Is it far?', es: '¿Está lejos?', fr: 'C’est loin ?' } },
  { id: 'show-me-map', label: 'Can you show me on the map?', role: 'say', chunk: { en: 'Can you show me on the map?', es: '¿Me lo puede mostrar en el mapa?', fr: 'Vous pouvez me montrer sur la carte ?' } },
  // the directions
  { id: 'the-station', label: 'The station? (the echo)', role: 'hear', chunk: { en: 'The station', es: 'La estación', fr: 'La gare' } },
  { id: 'straight', label: 'Go straight ahead', role: 'hear', chunk: { en: 'Go straight ahead', es: 'Siga todo recto', fr: 'Allez tout droit' } },
  { id: 'turn-left', label: 'turn left', role: 'hear', chunk: { en: 'turn left', es: 'gire a la izquierda', fr: 'tournez à gauche' } },
  { id: 'corner', label: 'at the corner', role: 'hear', chunk: { en: 'at the corner', es: 'en la esquina', fr: 'au coin' } },
  { id: 'five-minutes', label: 'about five minutes on foot', role: 'hear', chunk: { en: 'about five minutes on foot', es: 'a unos cinco minutos a pie', fr: 'à environ cinq minutes à pied' } },
  { id: 'next-to-bank', label: 'next to the bank', role: 'hear', chunk: { en: 'next to the bank', es: 'al lado del banco', fr: 'à côté de la banque' } },
  // the map
  { id: 'of-course', label: 'Of course', role: 'hear', chunk: { en: 'Of course', es: 'Claro', fr: 'Bien sûr' } },
  { id: 'look-here', label: 'here (look)', role: 'hear', chunk: { en: 'here, we', es: 'mire', fr: 'tenez' } },
  { id: 'we-are-here', label: 'we are here', role: 'hear', chunk: { en: 'we are here', es: 'estamos aquí', fr: 'nous sommes ici' } },
  { id: 'right-there', label: 'the station is right there', role: 'hear', chunk: { en: 'the station is right there', es: 'la estación está justo ahí', fr: 'la gare est juste là' } },
  // the goodbye
  { id: 'cant-miss', label: 'You can’t miss it', role: 'hear', chunk: { en: "You can't miss it", es: 'No tiene pérdida', fr: 'Vous ne pouvez pas la manquer' } },
  { id: 'good-day', label: 'Have a good day', role: 'hear', chunk: { en: 'Have a good day', es: 'Que tenga buen día', fr: 'Bonne journée' } },
];
