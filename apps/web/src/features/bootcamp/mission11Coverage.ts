import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 11 — Small Talk & Recommendations: the dialogue coverage specification, on the Mission 01
 * pattern (the counting and the rule live in `mission01Coverage.ts`; this file names the chunks of
 * THIS conversation, in each language's own words).
 *
 * say = the traveller's own lines · hear = the local's lines (comprehension first — never asked for as
 * something to say). Every word of every line belongs to one of these chunks (a test proves it).
 */
export const M11_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'hi', label: 'Hi', role: 'hear', chunk: { en: 'Hi', es: '¡Hola!', fr: 'Bonjour' } },
  { id: 'beautiful-view', label: 'Beautiful view, isn’t it?', role: 'hear', chunk: { en: "Beautiful view, isn't it?", es: 'Bonita vista, ¿verdad?', fr: 'Belle vue, n’est-ce pas ?' } },
  { id: 'place-beautiful', label: 'This place is beautiful', role: 'say', chunk: { en: 'This place is beautiful', es: 'Este lugar es precioso', fr: 'Cet endroit est magnifique' } },
  { id: 'it-really-is', label: 'It really is', role: 'hear', chunk: { en: 'It really is', es: 'Es verdad', fr: 'C’est vrai' } },
  { id: 'where-from', label: 'Where are you from?', role: 'hear', chunk: { en: 'Where are you from?', es: '¿De dónde es?', fr: 'Vous venez d’où ?' } },
  { id: 'from-israel', label: 'I’m from Israel', role: 'say', chunk: { en: "I'm from Israel", es: 'Soy de Israel', fr: 'Je viens d’Israël' } },
  { id: 'how-about-you', label: 'How about you?', role: 'say', chunk: { en: 'How about you?', es: '¿Y usted?', fr: 'Et vous ?' } },
  { id: 'from-here', label: 'I’m from here', role: 'hear', chunk: { en: "I'm from here", es: '¡Soy de aquí!', fr: 'Je suis d’ici' } },
  { id: 'first-time-q', label: 'Is this your first time here?', role: 'hear', chunk: { en: 'Is this your first time here?', es: '¿Es su primera vez aquí?', fr: 'C’est votre première fois ici ?' } },
  { id: 'first-time', label: 'Yes, it’s my first time here', role: 'say', chunk: { en: "Yes, it's my first time here", es: 'Sí, es mi primera vez aquí', fr: 'Oui, c’est ma première fois ici' } },
  { id: 'welcome', label: 'Welcome', role: 'hear', chunk: { en: 'Welcome', es: '¡Bienvenido!', fr: 'Bienvenue' } },
  { id: 'like-it-q', label: 'Do you like it here?', role: 'hear', chunk: { en: 'Do you like it here?', es: '¿Le gusta este lugar?', fr: 'Ça vous plaît ici ?' } },
  { id: 'like-it', label: 'Yes, I like it a lot', role: 'say', chunk: { en: 'Yes, I like it a lot', es: 'Sí, me gusta mucho', fr: 'Oui, j’aime beaucoup' } },
  { id: 'me-too', label: 'Me too', role: 'hear', chunk: { en: 'Me too', es: 'Yo también', fr: 'Moi aussi' } },
  { id: 'food-wonderful', label: 'And the food here is wonderful', role: 'hear', chunk: { en: 'And the food here is wonderful', es: 'Y la comida de aquí es estupenda', fr: 'Et la cuisine ici est excellente' } },
  { id: 'recommend', label: 'Can you recommend a place?', role: 'say', chunk: { en: 'Can you recommend a place?', es: '¿Me puede recomendar un sitio?', fr: 'Vous pouvez recommander un endroit ?' } },
  { id: 'of-course', label: 'Of course', role: 'hear', chunk: { en: 'Of course', es: 'Claro', fr: 'Bien sûr' } },
  { id: 'mama-rosa', label: 'try ‘Mama Rosa’', role: 'hear', chunk: { en: "try 'Mama Rosa'", es: 'pruebe «Mama Rosa»', fr: 'essayez « Mama Rosa »' } },
  { id: 'old-town', label: 'in the old town', role: 'hear', chunk: { en: 'in the old town', es: 'en el casco antiguo', fr: 'dans la vieille ville' } },
  { id: 'very-good', label: 'It’s very good', role: 'hear', chunk: { en: "It's very good", es: 'Es muy bueno', fr: 'C’est très bon' } },
  { id: 'thank-you', label: 'Thank you', role: 'say', chunk: { en: 'Thank you', es: '¡Gracias!', fr: 'Merci' } },
  { id: 'nice-talking', label: 'It was nice talking to you', role: 'say', chunk: { en: 'It was nice talking to you', es: 'Ha sido un placer hablar con usted', fr: 'C’était sympa de discuter avec vous' } },
  { id: 'you-too', label: 'You too', role: 'hear', chunk: { en: 'You too', es: '¡Igualmente!', fr: 'Vous aussi' } },
  { id: 'enjoy-trip', label: 'Enjoy the rest of your trip', role: 'hear', chunk: { en: 'Enjoy the rest of your trip', es: '¡Que disfrute del resto del viaje!', fr: 'Profitez bien du reste de votre voyage' } },
];
