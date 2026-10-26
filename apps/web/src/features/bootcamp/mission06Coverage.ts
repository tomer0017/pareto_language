import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 06 — Airport & Border: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words — the segmentation is not forced to match).
 *
 * say = the traveller's own lines (learner production) · hear = the officer's lines (comprehension
 * first — never asked for as something to say). Every word of every line belongs to one of these
 * chunks or to a small joining word (a test proves it).
 */
export const M06_CONCEPTS: readonly CoverageConcept[] = [
  // the officer calls you; you hand it over
  { id: 'next-please', label: 'Next, please', role: 'hear', chunk: { en: 'Next, please', es: 'El siguiente, por favor', fr: 'Au suivant, s’il vous plaît' } },
  { id: 'passport', label: 'Passport?', role: 'hear', chunk: { en: 'Passport', es: 'Pasaporte', fr: 'Passeport' } },
  { id: 'here-passport', label: 'Here is my passport', role: 'say', chunk: { en: 'Here is my passport', es: 'Aquí tiene mi pasaporte', fr: 'Voici mon passeport' } },
  // purpose
  { id: 'thank-you', label: 'Thank you', role: 'hear', chunk: { en: 'Thank you', es: 'Gracias', fr: 'Merci' } },
  { id: 'purpose-visit', label: 'What’s the purpose of your visit?', role: 'hear', chunk: { en: "What's the purpose of your visit?", es: '¿Cuál es el motivo de su viaje?', fr: 'Quel est le motif de votre visite ?' } },
  { id: 'holiday', label: 'I’m here on holiday', role: 'say', chunk: { en: "I'm here on holiday", es: 'Estoy de vacaciones', fr: 'Je suis en vacances' } },
  // duration
  { id: 'all-right', label: 'All right', role: 'hear', chunk: { en: 'All right', es: 'Muy bien', fr: 'Très bien' } },
  { id: 'how-long', label: 'How long are you staying?', role: 'hear', chunk: { en: 'How long are you staying?', es: '¿Cuánto tiempo se queda?', fr: 'Vous restez combien de temps ?' } },
  { id: 'two-weeks', label: 'For two weeks', role: 'say', chunk: { en: 'For two weeks', es: 'Dos semanas', fr: 'Pour deux semaines' } },
  // where you stay
  { id: 'where-staying', label: 'Where are you staying?', role: 'hear', chunk: { en: 'where are you staying?', es: 'dónde se aloja?', fr: 'où logez-vous ?' } },
  { id: 'hotel-city-centre', label: 'At a hotel in the city centre', role: 'say', chunk: { en: 'At a hotel in the city centre', es: 'En un hotel en el centro', fr: 'Dans un hôtel dans le centre-ville' } },
  // declaration
  { id: 'almost-done', label: 'Almost done', role: 'hear', chunk: { en: 'Almost done', es: 'Ya casi está', fr: 'C’est presque fini' } },
  { id: 'anything-declare', label: 'Anything to declare?', role: 'hear', chunk: { en: 'Anything to declare?', es: '¿Algo que declarar?', fr: 'Quelque chose à déclarer ?' } },
  { id: 'nothing-declare', label: 'Nothing to declare', role: 'say', chunk: { en: 'Nothing to declare', es: 'Nada que declarar', fr: 'Rien à déclarer' } },
  // the end
  { id: 'welcome', label: 'Welcome', role: 'hear', chunk: { en: 'Welcome', es: 'Bienvenido', fr: 'Bienvenue' } },
  { id: 'enjoy-stay', label: 'Enjoy your stay', role: 'hear', chunk: { en: 'enjoy your stay', es: 'que disfrute su estancia', fr: 'bon séjour' } },
];
