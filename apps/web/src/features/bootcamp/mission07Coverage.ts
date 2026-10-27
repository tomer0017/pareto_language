import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 07 — Taxi / Uber: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words — the segmentation is not forced to match).
 *
 * say = the traveller's own lines (learner production) · hear = the driver's lines (comprehension
 * first — never asked for as something to say). Every word of every line belongs to one of these
 * chunks or to a small joining word (a test proves it).
 */
export const M07_CONCEPTS: readonly CoverageConcept[] = [
  // pickup
  { id: 'hello', label: 'Hello', role: 'hear', chunk: { en: 'Hello', es: 'Hola', fr: 'Bonjour' } },
  { id: 'where-to', label: 'Where to?', role: 'hear', chunk: { en: 'Where to?', es: '¿A dónde va?', fr: 'Où allez-vous ?' } },
  { id: 'this-address', label: 'To this address, please', role: 'say', chunk: { en: 'To this address, please', es: 'A esta dirección, por favor', fr: 'À cette adresse, s’il vous plaît' } },
  { id: 'got-it', label: 'Got it', role: 'hear', chunk: { en: 'Got it', es: 'De acuerdo', fr: 'D’accord' } },
  { id: 'no-problem', label: 'No problem', role: 'hear', chunk: { en: 'No problem', es: 'Sin problema', fr: 'Pas de problème' } },
  { id: 'off-we-go', label: 'Off we go!', role: 'hear', chunk: { en: 'off we go', es: 'vamos', fr: 'on y va' } },
  // the fare
  { id: 'how-much-centre', label: 'How much to the centre?', role: 'say', chunk: { en: 'How much to the centre?', es: '¿Cuánto cuesta al centro?', fr: 'C’est combien pour le centre ?' } },
  { id: 'fifteen-euros', label: 'about fifteen euros', role: 'hear', chunk: { en: 'about fifteen euros', es: 'unos quince euros', fr: 'environ quinze euros' } },
  { id: 'traffic', label: 'There’s a lot of traffic', role: 'hear', chunk: { en: "There's a lot of traffic", es: 'Hay mucho tráfico', fr: 'Il y a beaucoup de circulation' } },
  { id: 'right-now', label: 'right now', role: 'hear', chunk: { en: 'right now', es: 'ahora mismo', fr: 'en ce moment' } },
  // the recovery
  { id: 'sorry', label: 'Sorry', role: 'say', chunk: { en: 'Sorry', es: 'Perdone', fr: 'Pardon' } },
  { id: 'speak-slowly', label: 'please speak slowly', role: 'say', chunk: { en: 'please speak slowly', es: 'más despacio, por favor', fr: 'parlez lentement, s’il vous plaît' } },
  { id: 'sure', label: 'Sure', role: 'hear', chunk: { en: 'Sure', es: 'Claro', fr: 'Bien sûr' } },
  { id: 'okay-thank-you', label: 'Okay, thank you', role: 'say', chunk: { en: 'Okay, thank you', es: 'De acuerdo, gracias', fr: 'D’accord, merci' } },
  // arrival and payment
  { id: 'almost-there', label: 'We are almost there', role: 'hear', chunk: { en: '…We are almost there', es: '…Ya casi llegamos', fr: '…On est presque arrivés' } },
  { id: 'here-okay', label: 'Is here okay?', role: 'hear', chunk: { en: 'Is here okay?', es: '¿Aquí está bien?', fr: 'Ici, ça va ?' } },
  { id: 'stop-here', label: 'Stop here, please', role: 'say', chunk: { en: 'Stop here, please', es: 'Pare aquí, por favor', fr: 'Arrêtez-vous ici, s’il vous plaît' } },
  { id: 'keep-change', label: 'Keep the change', role: 'say', chunk: { en: 'Keep the change', es: 'Quédese con el cambio', fr: 'Gardez la monnaie' } },
  { id: 'thank-you-very-much', label: 'Thank you very much', role: 'hear', chunk: { en: 'Thank you very much', es: 'Muchas gracias', fr: 'Merci beaucoup' } },
  { id: 'enjoy-trip', label: 'Enjoy your trip', role: 'hear', chunk: { en: 'Enjoy your trip', es: 'Buen viaje', fr: 'Bon voyage' } },
];
