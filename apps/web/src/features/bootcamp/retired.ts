import { T } from './recovery.js';
import type { BootcampItem } from './types.js';

/**
 * Retired sentences — an ARCHIVE, not content. A sentence lands here when the mission it belonged
 * to stopped teaching it (the conversation changed, or the line no longer fits the product rules).
 *
 * Nothing registers this file: these sentences are in no mission, so they do not appear in the
 * sentence library (Core), in Listen, in review / flashcards, in a mission's "what did I learn"
 * list, or in what the companion may say. Their ids and wording are kept so that
 *   - practice history already stored under these ids still refers to something real, and
 *   - a later mission or the Extended material can bring a sentence back under its original id.
 * To bring one back, move it into that mission's sentence list — do not redefine the id.
 */
export interface RetiredSentence extends BootcampItem {
  /** The stable id of the mission that used to hold it. */
  retiredFrom: string;
  reason: string;
}

export const RETIRED_SENTENCES: Record<'en' | 'fr' | 'es', RetiredSentence[]> = {
  en: [
    { id: 'en.phrase.hotel.two-nights', text: 'For two nights.', meaning: T('לשני לילות.', 'For two nights.'), tip: T('תבנית: for ___ nights — משך השהות.', 'Template: for ___ nights — the length of your stay.'), retiredFrom: 'hotel-check-in', reason: "Not part of the check-in conversation; no longer taught or practised." },
    { id: 'en.phrase.hotel.wifi', text: "What's the wifi password?", meaning: T('מה סיסמת הוויי-פיי?', "What's the wifi password?"), retiredFrom: 'hotel-check-in', reason: "Wifi / SIM belongs to the Extended material; removed from the check-in conversation." },
    { id: 'en.phrase.rest.menu', text: 'The menu, please.', meaning: T('התפריט, בבקשה.', 'The menu, please.'), retiredFrom: 'restaurant-meal', reason: "Not said in the current conversation and no longer practised." },
    { id: 'en.reply.rest.how-was-it', text: 'How was everything?', meaning: T('איך היה הכל?', 'How was everything?'), retiredFrom: 'restaurant-meal', reason: "The conversation now asks \"Is everything okay?\"." },
    { id: 'en.reply.rest.dessert', text: 'Would you like dessert?', meaning: T('רוצים קינוח?', 'Would you like dessert?'), retiredFrom: 'restaurant-meal', reason: "The conversation no longer offers dessert." },
    { id: 'en.reply.diet.good-option', text: 'This one is a good option for you.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.'), retiredFrom: 'special-requests-allergies', reason: "Removed with the allergy pass: nothing in the mission may read as a safety assurance." },
    { id: 'en.reply.super.weigh-it', text: 'You need to weigh it first.', meaning: T('צריך לשקול קודם.', 'You need to weigh it first.'), retiredFrom: 'supermarket', reason: "Weighing produce left the conversation." },
    { id: 'en.phrase.coffee.to-go', text: 'To go, please.', meaning: T('לקחת, בבקשה.', 'To go, please.'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; the Mission 03 pass stopped teaching it, so nothing may use it as taught.' },
    { id: 'en.reply.coffee.hot-or-iced', text: 'Hot or iced?', meaning: T('חם או קר?', 'Hot or iced?'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; never practised.' },
    { id: 'en.reply.coffee.here-or-to-go', text: 'For here or to go?', meaning: T('לשבת כאן או לקחת?', 'For here or to go?'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; no longer practised after the Mission 03 pass.' },
    { id: 'en.reply.dir.left', text: "It's on the left.", meaning: T('זה בצד שמאל.', "It's on the left."), retiredFrom: 'directions', reason: 'Not in the directions conversation (it says "turn left at the corner"); no longer practised.' },
    { id: 'en.reply.dir.right', text: "It's on the right.", meaning: T('זה בצד ימין.', "It's on the right."), retiredFrom: 'directions', reason: '"Right" is not in the directions conversation; it is no longer taught as a word.' },
    { id: 'en.phrase.dir.how-do-i-get', text: 'How do I get to the beach?', meaning: T('איך מגיעים לחוף?', 'How do I get to the beach?'), retiredFrom: 'directions', reason: 'Off the directions conversation (the beach); no longer practised.' },
  ],
  fr: [
    { id: 'fr.phrase.hotel.two-nights', text: 'Pour deux nuits.', meaning: T('לשני לילות.', 'For two nights.'), tip: T('תבנית: Pour ___ nuits — משך השהות.', 'Template: Pour ___ nuits — the length of your stay.'), retiredFrom: 'hotel-check-in', reason: "Not part of the check-in conversation; no longer taught or practised." },
    { id: 'fr.phrase.hotel.wifi', text: 'C’est quoi le mot de passe du wifi ?', meaning: T('מה סיסמת הוויי-פיי?', "What's the wifi password?"), retiredFrom: 'hotel-check-in', reason: "Wifi / SIM belongs to the Extended material; removed from the check-in conversation." },
    { id: 'fr.phrase.rest.menu', text: 'La carte, s’il vous plaît.', meaning: T('התפריט, בבקשה.', 'The menu, please.'), retiredFrom: 'restaurant-meal', reason: "Not said in the current conversation and no longer practised." },
    { id: 'fr.reply.rest.how-was-it', text: 'Tout s’est bien passé ?', meaning: T('איך היה הכל?', 'How was everything?'), retiredFrom: 'restaurant-meal', reason: "The conversation now asks \"Is everything okay?\"." },
    { id: 'fr.reply.rest.dessert', text: 'Vous voulez un dessert ?', meaning: T('רוצים קינוח?', 'Would you like dessert?'), retiredFrom: 'restaurant-meal', reason: "The conversation no longer offers dessert." },
    { id: 'fr.reply.diet.good-option', text: 'Celui-ci est une bonne option pour vous.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.'), retiredFrom: 'special-requests-allergies', reason: "Removed with the allergy pass: nothing in the mission may read as a safety assurance." },
    { id: 'fr.reply.super.weigh-it', text: 'Vous devez d’abord le peser.', meaning: T('צריך לשקול קודם.', 'You need to weigh it first.'), retiredFrom: 'supermarket', reason: "Weighing produce left the conversation." },
    { id: 'fr.phrase.coffee.to-go', text: 'À emporter, s’il vous plaît.', meaning: T('לקחת, בבקשה.', 'To go, please.'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; the Mission 03 pass stopped teaching it, so nothing may use it as taught.' },
    { id: 'fr.reply.coffee.hot-or-iced', text: 'Chaud ou glacé ?', meaning: T('חם או קר?', 'Hot or iced?'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; never practised.' },
    { id: 'fr.reply.coffee.here-or-to-go', text: 'Sur place ou à emporter ?', meaning: T('לשבת כאן או לקחת?', 'For here or to go?'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; no longer practised after the Mission 03 pass.' },
    { id: 'fr.reply.dir.left', text: 'C’est à gauche.', meaning: T('זה בצד שמאל.', "It's on the left."), retiredFrom: 'directions', reason: 'Not in the directions conversation (it says "turn left at the corner"); no longer practised.' },
    { id: 'fr.reply.dir.right', text: 'C’est à droite.', meaning: T('זה בצד ימין.', "It's on the right."), retiredFrom: 'directions', reason: '"Right" is not in the directions conversation; it is no longer taught as a word.' },
    { id: 'fr.phrase.dir.how-do-i-get', text: 'Comment aller à la plage ?', meaning: T('איך מגיעים לחוף?', 'How do I get to the beach?'), retiredFrom: 'directions', reason: 'Off the directions conversation (the beach); no longer practised.' },
  ],
  es: [
    { id: 'es.phrase.hotel.two-nights', text: 'Para dos noches.', meaning: T('לשני לילות.', 'For two nights.'), tip: T('תבנית: Para ___ noches — משך השהות.', 'Template: Para ___ noches — the length of your stay.'), retiredFrom: 'hotel-check-in', reason: "Not part of the check-in conversation; no longer taught or practised." },
    { id: 'es.phrase.hotel.wifi', text: '¿Cuál es la contraseña del wifi?', meaning: T('מה סיסמת הוויי-פיי?', "What's the wifi password?"), retiredFrom: 'hotel-check-in', reason: "Wifi / SIM belongs to the Extended material; removed from the check-in conversation." },
    { id: 'es.phrase.rest.menu', text: 'La carta, por favor.', meaning: T('התפריט, בבקשה.', 'The menu, please.'), retiredFrom: 'restaurant-meal', reason: "Not said in the current conversation and no longer practised." },
    { id: 'es.reply.rest.how-was-it', text: '¿Qué tal todo?', meaning: T('איך היה הכל?', 'How was everything?'), retiredFrom: 'restaurant-meal', reason: "The conversation now asks \"Is everything okay?\"." },
    { id: 'es.reply.rest.dessert', text: '¿Quieren postre?', meaning: T('רוצים קינוח?', 'Would you like dessert?'), retiredFrom: 'restaurant-meal', reason: "The conversation no longer offers dessert." },
    { id: 'es.reply.diet.good-option', text: 'Este es una buena opción para usted.', meaning: T('זו אפשרות טובה בשבילך.', 'This one is a good option for you.'), retiredFrom: 'special-requests-allergies', reason: "Removed with the allergy pass: nothing in the mission may read as a safety assurance." },
    { id: 'es.reply.super.weigh-it', text: 'Primero tiene que pesarlo.', meaning: T('צריך לשקול קודם.', 'You need to weigh it first.'), retiredFrom: 'supermarket', reason: "Weighing produce left the conversation." },
    { id: 'es.phrase.coffee.to-go', text: 'Para llevar, por favor.', meaning: T('לקחת, בבקשה.', 'To go, please.'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; the Mission 03 pass stopped teaching it, so nothing may use it as taught.' },
    { id: 'es.reply.coffee.hot-or-iced', text: '¿Caliente o con hielo?', meaning: T('חם או קר?', 'Hot or iced?'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; never practised.' },
    { id: 'es.reply.coffee.here-or-to-go', text: '¿Para aquí o para llevar?', meaning: T('לשבת כאן או לקחת?', 'For here or to go?'), retiredFrom: 'coffee-shop', reason: 'Not in the coffee-shop conversation; no longer practised after the Mission 03 pass.' },
    { id: 'es.reply.dir.left', text: 'Está a la izquierda.', meaning: T('זה בצד שמאל.', "It's on the left."), retiredFrom: 'directions', reason: 'Not in the directions conversation (it says "turn left at the corner"); no longer practised.' },
    { id: 'es.reply.dir.right', text: 'Está a la derecha.', meaning: T('זה בצד ימין.', "It's on the right."), retiredFrom: 'directions', reason: '"Right" is not in the directions conversation; it is no longer taught as a word.' },
    { id: 'es.phrase.dir.how-do-i-get', text: '¿Cómo se llega a la playa?', meaning: T('איך מגיעים לחוף?', 'How do I get to the beach?'), retiredFrom: 'directions', reason: 'Off the directions conversation (the beach); no longer practised.' },
  ],
};
