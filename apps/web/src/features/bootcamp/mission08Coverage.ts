import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 08 — Hotel Check-in: the dialogue coverage specification, on the Mission 01 pattern (the
 * counting and the rule live in `mission01Coverage.ts`; this file names the chunks of THIS
 * conversation, in each language's own words).
 *
 * say = the guest's own lines · hear = the receptionist's lines (comprehension first — never asked for
 * as something to say). Every word of every line belongs to one of these chunks (a test proves it).
 */
export const M08_CONCEPTS: readonly CoverageConcept[] = [
  { id: 'good-evening', label: 'Good evening', role: 'hear', chunk: { en: 'Good evening', es: 'Buenas noches', fr: 'Bonsoir' } },
  { id: 'how-can-help', label: 'How can I help you?', role: 'hear', chunk: { en: 'How can I help you?', es: '¿En qué puedo ayudarle?', fr: 'Comment puis-je vous aider ?' } },
  { id: 'reservation', label: 'I have a reservation', role: 'say', chunk: { en: 'I have a reservation', es: 'Tengo una reserva', fr: 'J’ai une réservation' } },
  { id: 'under-name-cohen', label: 'under the name Cohen', role: 'say', chunk: { en: 'under the name Cohen', es: 'a nombre de Cohen', fr: 'au nom de Cohen' } },
  { id: 'welcome-mr-cohen', label: 'Welcome, Mr. Cohen', role: 'hear', chunk: { en: 'Welcome, Mr. Cohen', es: 'Bienvenido, señor Cohen', fr: 'Bienvenue, monsieur Cohen' } },
  { id: 'passport-please', label: 'Your passport, please', role: 'hear', chunk: { en: 'Your passport, please', es: 'Su pasaporte, por favor', fr: 'Votre passeport, s’il vous plaît' } },
  { id: 'here-you-go', label: 'Here you go', role: 'say', chunk: { en: 'Here you go', es: 'Aquí tiene.', fr: 'Voilà, tenez' } },
  { id: 'thank-you', label: 'Thank you', role: 'hear', chunk: { en: 'Thank you', es: 'Gracias', fr: 'Merci' } },
  { id: 'room-204', label: 'You’re in room 204', role: 'hear', chunk: { en: "You're in room two-oh-four", es: 'Está en la habitación doscientos cuatro', fr: 'Vous êtes dans la chambre deux cent quatre' } },
  { id: 'second-floor', label: 'on the second floor', role: 'hear', chunk: { en: 'on the second floor', es: 'en el segundo piso', fr: 'au deuxième étage' } },
  { id: 'here-key', label: 'Here is your key', role: 'hear', chunk: { en: 'Here is your key', es: 'Aquí tiene su llave', fr: 'Voici votre clé' } },
  { id: 'breakfast-included', label: 'Is breakfast included?', role: 'say', chunk: { en: 'Is breakfast included?', es: '¿El desayuno está incluido?', fr: 'Le petit-déjeuner est compris ?' } },
  { id: 'yes', label: 'Yes', role: 'hear', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'breakfast-7-to-10', label: 'Breakfast is from seven to ten', role: 'hear', chunk: { en: 'Breakfast is from seven to ten', es: 'El desayuno es de siete a diez', fr: 'Le petit-déjeuner est de sept heures à dix heures' } },
  { id: 'elevator-right', label: 'The elevator is on your right', role: 'hear', chunk: { en: 'The elevator is on your right', es: 'El ascensor está a su derecha', fr: 'L’ascenseur est sur votre droite' } },
  { id: 'enjoy-stay', label: 'Enjoy your stay', role: 'hear', chunk: { en: 'Enjoy your stay', es: 'Que disfrute su estancia', fr: 'Bon séjour' } },
];
