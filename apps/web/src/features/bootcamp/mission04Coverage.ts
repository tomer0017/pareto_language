import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 04 — Everyday Core: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THESE two
 * conversations).
 *
 * hear = comprehension-first (the desk / the friend says it) · say = learner production (rapid
 * recall). Every word of every line belongs to one of these chunks (a test proves it).
 */
export const M04_CONCEPTS: readonly CoverageConcept[] = [
  // the desk (polite forms in Spanish and French)
  { id: 'hi', label: 'Greeting', role: 'hear', chunk: { en: 'Hi', es: 'Hola', fr: 'Bonjour' } },
  { id: 'need-anything', label: 'Do you need anything?', role: 'hear', chunk: { en: 'Do you need anything?', es: '¿Necesita algo?', fr: 'Vous avez besoin de quelque chose ?' } },
  { id: 'i-need', label: 'I need …', role: 'say', chunk: { en: 'I need', es: 'Necesito', fr: 'J’ai besoin' } },
  { id: 'towel', label: 'a towel', role: 'say', chunk: { en: 'towel', es: 'toalla', fr: 'serviette' } },
  { id: 'sure', label: 'Sure / of course', role: 'hear', chunk: { en: 'Sure', es: 'Claro', fr: 'Bien sûr' } },
  { id: 'have-your-key', label: 'Do you have your key?', role: 'hear', chunk: { en: 'Do you have your key?', es: '¿Tiene su llave?', fr: 'Vous avez votre clé ?' } },
  { id: 'yes', label: 'Yes', role: 'hear', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'i-have-key', label: 'I have my key', role: 'say', chunk: { en: 'I have my key', es: 'tengo mi llave', fr: 'j’ai ma clé' } },
  { id: 'wifi', label: 'And the wifi password?', role: 'hear', chunk: { en: 'And the wifi password?', es: '¿Y la contraseña del wifi?', fr: 'Et le mot de passe du wifi ?' } },
  { id: 'dont-have', label: 'I don’t have it', role: 'say', chunk: { en: "I don't have it", es: 'No la tengo', fr: 'Je ne l’ai pas' } },
  { id: 'its-here', label: 'It’s here', role: 'hear', chunk: { en: "It's here", es: 'Está aquí', fr: 'Il est ici' } },
  { id: 'do-you-have-map', label: 'Do you have a map?', role: 'say', chunk: { en: 'Do you have a map?', es: '¿Tiene un mapa?', fr: 'Vous avez une carte ?' } },
  { id: 'show-me', label: 'Can you show me?', role: 'say', chunk: { en: 'Can you show me?', es: '¿Me lo puede mostrar?', fr: 'Vous pouvez me montrer ?' } },
  { id: 'of-course', label: 'Of course', role: 'hear', chunk: { en: 'Of course', es: 'Claro', fr: 'Bien sûr' } },
  // the friend (everyday forms in Spanish and French)
  { id: 'do-you-want', label: 'Do you want a coffee?', role: 'hear', chunk: { en: 'Do you want a coffee?', es: '¿Quieres un café?', fr: 'Tu veux un café ?' } },
  { id: 'i-want', label: 'I want a coffee', role: 'say', chunk: { en: 'I want a coffee', es: 'quiero un café', fr: 'je veux un café' } },
  { id: 'do-you-know', label: 'Do you know how to get to the centre?', role: 'hear', chunk: { en: 'Do you know how to get to the centre?', es: '¿Sabes cómo ir al centro?', fr: 'Tu sais comment aller au centre ?' } },
  { id: 'dont-know', label: 'I don’t know', role: 'say', chunk: { en: "I don't know", es: 'No lo sé', fr: 'Je ne sais pas' } },
  { id: 'you-can-walk', label: 'You can walk', role: 'hear', chunk: { en: 'You can walk', es: 'Puedes ir a pie', fr: 'Tu peux y aller à pied' } },
  { id: 'twenty-minutes', label: 'It’s about twenty minutes', role: 'hear', chunk: { en: "It's about twenty minutes", es: 'Son unos veinte minutos', fr: 'C’est à environ vingt minutes' } },
  { id: 'i-can-walk', label: 'I can walk', role: 'say', chunk: { en: 'I can walk', es: 'Puedo ir a pie', fr: 'Je peux y aller à pied' } },
  { id: 'dinner', label: 'We’re having dinner at seven', role: 'hear', chunk: { en: "We're having dinner at seven", es: 'Cenamos a las siete', fr: 'On dîne à sept heures' } },
  { id: 'can-you-come', label: 'Can you come?', role: 'hear', chunk: { en: 'Can you come?', es: '¿Puedes venir?', fr: 'Tu peux venir ?' } },
  { id: 'sorry', label: 'Sorry', role: 'say', chunk: { en: 'Sorry', es: 'Lo siento', fr: 'Désolé' } },
  { id: 'cant', label: 'I can’t', role: 'say', chunk: { en: "I can't", es: 'no puedo', fr: 'je ne peux pas' } },
  { id: 'no-problem', label: 'No problem', role: 'hear', chunk: { en: 'No problem', es: 'No pasa nada', fr: 'Pas de problème' } },
];
