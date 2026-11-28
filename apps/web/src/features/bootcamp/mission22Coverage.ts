import type { CoverageConcept } from './mission01Coverage.js';

/**
 * Mission 22 — Fixing Problems: the dialogue coverage specification, on the Mission 01 pattern (the counting and
 * the rule live in `mission01Coverage.ts`; this file names the chunks of THESE two conversations, in each
 * language's own words).
 *
 * say = the four production tools — "This isn't what I ordered." · "I think there's a mistake." · "___ isn't
 * working" (with its canonical thing, the air conditioning) · "Can you fix it?". Everything else is `hear`:
 *   - the staff's lines (comprehension — the apologies, the questions, the four solutions, the dessert);
 *   - the SECONDARY learner lines — "I ordered the pasta", "I was charged twice", "There's a problem with my room",
 *     "My room is very noisy", "Can I change rooms?" — the learner says each in the supported conversation (and the
 *     bill's and the room change's once more), but they are not production targets of their own (the brief: four
 *     tools, everything else context or one-time support), so they are held to the comprehension standard;
 *   - "No problem, thank you." — both halves verified prior in every language ("No problem" / "No pasa nada" /
 *     "Pas de problème", Mission 04; "thank you" / "gracias" / "merci"): the conversation carries it.
 * Every word of every line belongs to one of these chunks (a test proves it).
 *
 * A chunk is accounted for in one of two ways (mission22.test.ts):
 *   - VERIFIED PRIOR — Missions 01–21 really taught it (`learnedBefore(lang, 22)`): used, not re-taught;
 *   - COVERED here — the standard rule (`coverageOf`).
 */
export const M22_CONCEPTS: readonly CoverageConcept[] = [
  // 🍽️ The restaurant
  { id: 'heres-your-meal', label: 'Here’s your meal', role: 'hear', chunk: { en: "Here's your meal", es: 'Aquí tiene su plato', fr: 'Voici votre plat' } },
  { id: 'one-steak', label: 'One steak!', role: 'hear', chunk: { en: 'one steak!', es: '¡un filete!', fr: 'un steak !' } },
  { id: 'not-ordered', label: 'This isn’t what I ordered.', role: 'say', chunk: { en: "This isn't what I ordered.", es: 'Esto no es lo que pedí.', fr: 'Ce n’est pas ce que j’ai commandé.' } },
  { id: 'oh-no-sorry', label: 'Oh no, I’m so sorry!', role: 'hear', chunk: { en: "Oh no, I'm so sorry!", es: '¡Ay, lo siento muchísimo!', fr: 'Oh non, je suis vraiment désolé !' } },
  { id: 'what-did-you-order', label: 'What did you order?', role: 'hear', chunk: { en: 'What did you order?', es: '¿Qué pidió?', fr: 'Qu’avez-vous commandé ?' } },
  { id: 'i-ordered-pasta', label: 'I ordered the pasta.', role: 'hear', chunk: { en: 'I ordered the pasta.', es: 'Pedí la pasta.', fr: 'J’ai commandé les pâtes.' } },
  { id: 'of-course', label: 'Of course', role: 'hear', chunk: { en: 'Of course', es: 'Claro', fr: 'Bien sûr' } },
  { id: 'bring-the-right-one', label: 'I’ll bring the right one', role: 'hear', chunk: { en: "I'll bring the right one", es: 'le traigo el correcto', fr: 'je vous apporte le bon' } },
  { id: 'right-away', label: 'right away', role: 'hear', chunk: { en: 'right away', es: 'enseguida', fr: 'tout de suite' } },
  { id: 'heres-your-bill', label: 'Here’s your bill.', role: 'hear', chunk: { en: "Here's your bill.", es: 'Aquí tiene la cuenta.', fr: 'Voici l’addition.' } },
  { id: 'mistake', label: 'I think there’s a mistake.', role: 'say', chunk: { en: "I think there's a mistake.", es: 'Creo que hay un error.', fr: 'Je crois qu’il y a une erreur.' } },
  { id: 'let-me-check', label: 'Let me check the bill.', role: 'hear', chunk: { en: 'Let me check the bill.', es: 'Déjeme revisar la cuenta.', fr: 'Laissez-moi vérifier l’addition.' } },
  { id: 'whats-the-problem', label: 'What’s the problem?', role: 'hear', chunk: { en: "What's the problem?", es: '¿Cuál es el problema?', fr: 'Quel est le problème ?' } },
  { id: 'charged-twice', label: 'I was charged twice.', role: 'hear', chunk: { en: 'I was charged twice.', es: 'Me han cobrado dos veces.', fr: 'On m’a facturé deux fois.' } },
  { id: 'youre-right', label: 'You’re right', role: 'hear', chunk: { en: "You're right", es: 'Tiene razón', fr: 'Vous avez raison' } },
  { id: 'my-mistake', label: 'my mistake', role: 'hear', chunk: { en: 'my mistake', es: 'es culpa mía', fr: 'c’est ma faute' } },
  { id: 'refund', label: 'I’ll refund it now.', role: 'hear', chunk: { en: "I'll refund it now.", es: 'Le hago el reembolso ahora mismo.', fr: 'Je vous rembourse tout de suite.' } },
  { id: 'no-problem', label: 'No problem', role: 'hear', chunk: { en: 'No problem', es: 'No pasa nada', fr: 'Pas de problème' } },
  { id: 'thank-you', label: 'thank you', role: 'hear', chunk: { en: 'thank you', es: 'gracias', fr: 'merci' } },
  { id: 'patience', label: 'Thank you for your patience.', role: 'hear', chunk: { en: 'Thank you for your patience.', es: 'Gracias por su paciencia.', fr: 'Merci de votre patience.' } },
  { id: 'dessert-on-the-house', label: 'Dessert is on the house!', role: 'hear', chunk: { en: 'Dessert is on the house!', es: '¡El postre corre por cuenta de la casa!', fr: 'Le dessert est offert par la maison !' } },
  // 🏨 The hotel
  { id: 'how-can-i-help', label: 'Good evening! How can I help you?', role: 'hear', chunk: { en: 'Good evening! How can I help you?', es: '¡Buenas noches! ¿En qué puedo ayudarle?', fr: 'Bonsoir ! Comment puis-je vous aider ?' } },
  { id: 'problem-with-room', label: 'There’s a problem with my room.', role: 'hear', chunk: { en: "There's a problem with my room.", es: 'Hay un problema con mi habitación.', fr: 'Il y a un problème avec ma chambre.' } },
  { id: 'sorry-to-hear', label: 'I’m sorry to hear that.', role: 'hear', chunk: { en: "I'm sorry to hear that.", es: 'Lo siento.', fr: 'Je suis désolé.' } },
  { id: 'the-air-conditioning', label: 'The air conditioning', role: 'say', chunk: { en: 'The air conditioning', es: 'El aire acondicionado', fr: 'La climatisation' } },
  { id: 'not-working', label: '___ isn’t working', role: 'say', chunk: { en: "isn't working", es: 'no funciona', fr: 'ne marche pas' } },
  { id: 'so-sorry-about-that', label: 'I’m so sorry about that.', role: 'hear', chunk: { en: "I'm so sorry about that.", es: 'Lo siento muchísimo.', fr: 'Je suis vraiment désolé.' } },
  { id: 'can-you-fix', label: 'Can you fix it?', role: 'say', chunk: { en: 'Can you fix it?', es: '¿Lo puede arreglar?', fr: 'Vous pouvez arranger ça ?' } },
  { id: 'yes', label: 'Yes', role: 'hear', chunk: { en: 'Yes', es: 'Sí', fr: 'Oui' } },
  { id: 'send-someone', label: 'I’ll send someone right away.', role: 'hear', chunk: { en: "I'll send someone", es: 'mando a alguien ahora mismo', fr: 'j’envoie quelqu’un' } },
  { id: 'everything-else', label: 'Is everything else okay?', role: 'hear', chunk: { en: 'Is everything else okay?', es: '¿Todo lo demás está bien?', fr: 'Tout le reste va bien ?' } },
  { id: 'no', label: 'No.', role: 'hear', chunk: { en: 'No.', es: 'No.', fr: 'Non.' } },
  { id: 'room-noisy', label: 'My room is very noisy.', role: 'hear', chunk: { en: 'My room is very noisy.', es: 'Mi habitación es muy ruidosa.', fr: 'Ma chambre est très bruyante.' } },
  { id: 'i-understand', label: 'I understand.', role: 'hear', chunk: { en: 'I understand.', es: 'Lo entiendo.', fr: 'Je comprends.' } },
  { id: 'quieter-room', label: 'We have a quieter room.', role: 'hear', chunk: { en: 'We have a quieter room.', es: 'Tenemos una habitación más tranquila.', fr: 'Nous avons une chambre plus calme.' } },
  { id: 'change-rooms', label: 'Can I change rooms?', role: 'hear', chunk: { en: 'Can I change rooms?', es: '¿Puedo cambiar de habitación?', fr: 'Je peux changer de chambre ?' } },
  { id: 'room-305', label: 'Room 305', role: 'hear', chunk: { en: 'room 305', es: 'habitación 305', fr: 'chambre 305' } },
  { id: 'new-key', label: 'Here is your new key.', role: 'hear', chunk: { en: 'Here is your new key.', es: 'Aquí tiene su nueva llave.', fr: 'Voici votre nouvelle clé.' } },
  { id: 'good-night', label: 'Good night!', role: 'hear', chunk: { en: 'Good night!', es: '¡Buenas noches!', fr: 'Bonne nuit !' } },
];

/**
 * Context only — met with their meaning (a card, or the conversation's translation) but deliberately never TESTED
 * (the compression brief: not survival-critical, no exercise of their own): the waiter's "Let me check the bill."
 * (the question that follows, "What's the problem?", is covered), the dessert line ("Thank you for your patience.
 * Dessert is on the house!" — nice to know, understood from the conversation), and room 305 / the new key (the
 * outcome "another room" is understood on the hotel board; the number stays UI). Every other chunk is covered or
 * verified prior.
 */
export const M22_CONTEXT_ONLY: readonly string[] = ['let-me-check', 'patience', 'dessert-on-the-house', 'room-305', 'new-key'];
