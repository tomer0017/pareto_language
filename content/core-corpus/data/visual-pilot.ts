import type { CorpusRow } from '../types.js';

/**
 * The original Core 100 emoji pilot, migrated verbatim into the Core Corpus (Core 500).
 * Slugs, Hebrew glosses, emoji, visual confidence and examples are UNCHANGED — concept ids and
 * item ids stay stable, so Mongo upserts remain idempotent and no review event is orphaned.
 * New here: pos + the five-part scorecard [freq, comm(say), recog(hear), coverage, travel].
 */
export const VISUAL_PILOT: CorpusRow[] = [
  // ── Body parts ─────────────────────────────────────────────────────────────
  { slug: 'nose', pos: 'noun', en: 'nose', he: 'אף', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 2, 2], emoji: '👃', vis: 0.98, ex: 'My nose hurts.', exHe: 'האף שלי כואב.' },
  { slug: 'eye', pos: 'noun', en: 'eye', he: 'עין', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 2, 2], emoji: '👁️', vis: 0.95, ex: 'Something is in my eye.', exHe: 'משהו נכנס לי לעין.' },
  { slug: 'ear', pos: 'noun', en: 'ear', he: 'אוזן', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 2, 2], emoji: '👂', vis: 0.96, ex: 'My ear hurts.', exHe: 'האוזן שלי כואבת.' },
  { slug: 'hand', pos: 'noun', en: 'hand', he: 'יד', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 3, 2], emoji: '✋', vis: 0.9, ex: 'Give me your hand.', exHe: 'תן לי את היד.' },
  { slug: 'mouth', pos: 'noun', en: 'mouth', he: 'פה', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 2, 2], emoji: '👄', vis: 0.92, ex: 'Open your mouth.', exHe: 'תפתח את הפה.' },
  { slug: 'foot', pos: 'noun', en: 'foot', he: 'כף רגל', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 2, 2], emoji: '🦶', vis: 0.9, ex: 'My foot hurts.', exHe: 'כף הרגל שלי כואבת.' },
  { slug: 'leg', pos: 'noun', en: 'leg', he: 'רגל', cat: 'body', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 2, 2], emoji: '🦵', vis: 0.9, ex: 'I hurt my leg.', exHe: 'פגעתי ברגל.' },
  { slug: 'tooth', pos: 'noun', en: 'tooth', he: 'שן', cat: 'body', layer: 2, rof: 2, skill: 'recognize', s: [2, 2, 2, 2, 2], emoji: '🦷', vis: 0.9, ex: 'I have a toothache.', exHe: 'יש לי כאב שיניים.' },

  // ── Food & drink ───────────────────────────────────────────────────────────
  { slug: 'water', pos: 'noun', en: 'water', he: 'מים', cat: 'food', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 4, 5, 5], emoji: '💧', vis: 0.85, ex: 'Water, please.', exHe: 'מים, בבקשה.' },
  { slug: 'coffee', pos: 'noun', en: 'coffee', he: 'קפה', cat: 'food', layer: 1, rof: 1, skill: 'recall', s: [5, 5, 4, 3, 5], emoji: '☕', vis: 0.95, ex: 'A coffee, please.', exHe: 'קפה, בבקשה.' },
  { slug: 'tea', pos: 'noun', en: 'tea', he: 'תה', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [4, 4, 3, 2, 4], emoji: '🍵', vis: 0.9, ex: 'Tea with milk.', exHe: 'תה עם חלב.' },
  { slug: 'bread', pos: 'noun', en: 'bread', he: 'לחם', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [4, 4, 3, 3, 4], emoji: '🍞', vis: 0.95, ex: 'Fresh bread.', exHe: 'לחם טרי.' },
  { slug: 'milk', pos: 'noun', en: 'milk', he: 'חלב', cat: 'food', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 3, 2, 4], emoji: '🥛', vis: 0.92, ex: 'With milk, please.', exHe: 'עם חלב, בבקשה.' },
  { slug: 'egg', pos: 'noun', en: 'egg', he: 'ביצה', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 3], emoji: '🥚', vis: 0.9, ex: 'Two eggs, please.', exHe: 'שתי ביצים, בבקשה.' },
  { slug: 'apple', pos: 'noun', en: 'apple', he: 'תפוח', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 2, 3], emoji: '🍎', vis: 0.98, ex: 'One apple.', exHe: 'תפוח אחד.' },
  { slug: 'banana', pos: 'noun', en: 'banana', he: 'בננה', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 2, 3], emoji: '🍌', vis: 0.98, ex: 'A banana, please.', exHe: 'בננה, בבקשה.' },
  { slug: 'chicken', pos: 'noun', en: 'chicken', he: 'עוף', cat: 'food', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 4, 2, 4], emoji: '🍗', vis: 0.85, ex: 'Grilled chicken.', exHe: 'עוף בגריל.' },
  { slug: 'fish', pos: 'noun', en: 'fish', he: 'דג', cat: 'food', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 4, 2, 4], emoji: '🐟', vis: 0.9, ex: 'Fish of the day.', exHe: 'דג היום.' },
  { slug: 'meat', pos: 'noun', en: 'meat', he: 'בשר', cat: 'food', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 4, 3, 4], emoji: '🥩', vis: 0.88, ex: 'No meat, please.', exHe: 'בלי בשר, בבקשה.' },
  { slug: 'cheese', pos: 'noun', en: 'cheese', he: 'גבינה', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 3], emoji: '🧀', vis: 0.92, ex: 'Bread and cheese.', exHe: 'לחם וגבינה.' },
  { slug: 'rice', pos: 'noun', en: 'rice', he: 'אורז', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 3], emoji: '🍚', vis: 0.85, ex: 'Rice, please.', exHe: 'אורז, בבקשה.' },
  { slug: 'soup', pos: 'noun', en: 'soup', he: 'מרק', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 3], emoji: '🍲', vis: 0.82, ex: 'Hot soup.', exHe: 'מרק חם.' },
  { slug: 'wine', pos: 'noun', en: 'wine', he: 'יין', cat: 'food', layer: 2, rof: 1, skill: 'recognize', s: [4, 4, 3, 2, 4], emoji: '🍷', vis: 0.95, ex: 'A glass of wine.', exHe: 'כוס יין.' },

  // ── Animals ────────────────────────────────────────────────────────────────
  { slug: 'dog', pos: 'noun', en: 'dog', he: 'כלב', cat: 'animals', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 2, 2], emoji: '🐶', vis: 0.98, ex: 'A big dog.', exHe: 'כלב גדול.' },
  { slug: 'cat', pos: 'noun', en: 'cat', he: 'חתול', cat: 'animals', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 2, 2], emoji: '🐱', vis: 0.98, ex: 'A small cat.', exHe: 'חתול קטן.' },
  { slug: 'bird', pos: 'noun', en: 'bird', he: 'ציפור', cat: 'animals', layer: 2, rof: 1, skill: 'recognize', s: [3, 1, 2, 1, 1], emoji: '🐦', vis: 0.95, ex: 'A little bird.', exHe: 'ציפור קטנה.' },
  { slug: 'horse', pos: 'noun', en: 'horse', he: 'סוס', cat: 'animals', layer: 2, rof: 1, skill: 'recognize', s: [3, 1, 2, 1, 1], emoji: '🐴', vis: 0.95, ex: 'A brown horse.', exHe: 'סוס חום.' },
  { slug: 'cow', pos: 'noun', en: 'cow', he: 'פרה', cat: 'animals', layer: 2, rof: 1, skill: 'recognize', s: [3, 1, 2, 1, 1], emoji: '🐄', vis: 0.95, ex: 'A cow in the field.', exHe: 'פרה בשדה.' },

  // ── Transport ──────────────────────────────────────────────────────────────
  { slug: 'car', pos: 'noun', en: 'car', he: 'מכונית', cat: 'transport', layer: 2, rof: 2, skill: 'recognize', s: [5, 3, 4, 3, 4], emoji: '🚗', vis: 0.95, ex: 'By car.', exHe: 'במכונית.' },
  { slug: 'bus', pos: 'noun', en: 'bus', he: 'אוטובוס', cat: 'transport', layer: 1, rof: 2, skill: 'recall', s: [5, 4, 4, 4, 5], emoji: '🚌', vis: 0.95, ex: 'Where is the bus?', exHe: 'איפה האוטובוס?' },
  { slug: 'train', pos: 'noun', en: 'train', he: 'רכבת', cat: 'transport', layer: 1, rof: 2, skill: 'recall', s: [4, 4, 4, 4, 5], emoji: '🚆', vis: 0.95, ex: 'The train to the center.', exHe: 'הרכבת למרכז.' },
  { slug: 'plane', pos: 'noun', en: 'plane', he: 'מטוס', cat: 'transport', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 4, 3, 5], emoji: '✈️', vis: 0.97, ex: 'My plane is late.', exHe: 'המטוס שלי מאחר.' },
  { slug: 'taxi', pos: 'noun', en: 'taxi', he: 'מונית', cat: 'transport', layer: 1, rof: 2, skill: 'recall', s: [4, 5, 4, 4, 5], emoji: '🚕', vis: 0.95, ex: 'Call a taxi, please.', exHe: 'תזמין מונית, בבקשה.', alias: ['cab'] },
  { slug: 'bike', pos: 'noun', en: 'bike', he: 'אופניים', cat: 'transport', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 3], emoji: '🚲', vis: 0.95, ex: 'I want to rent a bike.', exHe: 'אני רוצה לשכור אופניים.' },
  { slug: 'boat', pos: 'noun', en: 'boat', he: 'סירה', cat: 'transport', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 3], emoji: '⛵', vis: 0.9, ex: 'A boat trip.', exHe: 'טיול בסירה.' },

  // ── Places ─────────────────────────────────────────────────────────────────
  { slug: 'hotel', pos: 'noun', en: 'hotel', he: 'מלון', cat: 'places', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], emoji: '🏨', vis: 0.92, ex: 'Where is my hotel?', exHe: 'איפה המלון שלי?' },
  { slug: 'hospital', pos: 'noun', en: 'hospital', he: 'בית חולים', cat: 'places', layer: 1, rof: 3, skill: 'recognize', s: [3, 4, 4, 3, 5], emoji: '🏥', vis: 0.9, ex: 'To the hospital, fast!', exHe: 'לבית החולים, מהר!' },
  { slug: 'restaurant', pos: 'noun', en: 'restaurant', he: 'מסעדה', cat: 'places', layer: 2, rof: 1, skill: 'recognize', s: [5, 4, 4, 4, 5], emoji: '🍴', vis: 0.85, ex: 'A good restaurant.', exHe: 'מסעדה טובה.' },
  { slug: 'bank', pos: 'noun', en: 'bank', he: 'בנק', cat: 'places', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 3], emoji: '🏦', vis: 0.85, ex: 'It is next to the bank.', exHe: 'זה ליד הבנק.' },
  { slug: 'pharmacy', pos: 'noun', en: 'pharmacy', he: 'בית מרקחת', cat: 'places', layer: 1, rof: 3, skill: 'recognize', s: [3, 4, 3, 3, 5], emoji: '💊', vis: 0.72, ex: 'Where is a pharmacy?', exHe: 'איפה יש בית מרקחת?', alias: ['drugstore'] },
  { slug: 'beach', pos: 'noun', en: 'beach', he: 'חוף', cat: 'places', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 4], emoji: '🏖️', vis: 0.92, ex: 'How do I get to the beach?', exHe: 'איך מגיעים לחוף?' },
  { slug: 'museum', pos: 'noun', en: 'museum', he: 'מוזיאון', cat: 'places', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 4], emoji: '🏛️', vis: 0.82, ex: 'Two tickets to the museum.', exHe: 'שני כרטיסים למוזיאון.' },
  { slug: 'market', pos: 'noun', en: 'market', he: 'שוק', cat: 'places', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 3, 4], emoji: '🏪', vis: 0.7, ex: 'The fruit market.', exHe: 'שוק הפירות.' },
  { slug: 'station', pos: 'noun', en: 'station', he: 'תחנה', cat: 'places', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 4, 4, 5], emoji: '🚉', vis: 0.85, ex: 'Where is the station?', exHe: 'איפה התחנה?' },
  { slug: 'toilet', pos: 'noun', en: 'toilet', he: 'שירותים', cat: 'places', layer: 1, rof: 3, skill: 'recall', s: [5, 5, 4, 5, 5], emoji: '🚻', vis: 0.85, ex: 'Where is the toilet?', exHe: 'איפה השירותים?', alias: ['restroom', 'bathroom', 'WC'] },
  { slug: 'church', pos: 'noun', en: 'church', he: 'כנסייה', cat: 'places', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 3], emoji: '⛪', vis: 0.9, ex: 'The old church.', exHe: 'הכנסייה העתיקה.' },

  // ── Common objects ─────────────────────────────────────────────────────────
  { slug: 'key', pos: 'noun', en: 'key', he: 'מפתח', cat: 'objects', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 4, 3, 4], emoji: '🔑', vis: 0.95, ex: 'My room key.', exHe: 'המפתח של החדר שלי.' },
  { slug: 'phone', pos: 'noun', en: 'phone', he: 'טלפון', cat: 'objects', layer: 2, rof: 2, skill: 'recognize', s: [5, 4, 4, 4, 4], emoji: '📱', vis: 0.95, ex: 'I lost my phone.', exHe: 'איבדתי את הטלפון שלי.' },
  { slug: 'bag', pos: 'noun', en: 'bag', he: 'תיק', cat: 'objects', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 4, 4, 4], emoji: '🎒', vis: 0.9, ex: 'I lost my bag.', exHe: 'איבדתי את התיק שלי.' },
  { slug: 'money', pos: 'noun', en: 'money', he: 'כסף', cat: 'objects', layer: 2, rof: 2, skill: 'recognize', s: [5, 4, 4, 5, 5], emoji: '💰', vis: 0.85, ex: 'I have no money.', exHe: 'אין לי כסף.' },
  { slug: 'card', pos: 'noun', en: 'card', he: 'כרטיס אשראי', cat: 'objects', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], emoji: '💳', vis: 0.9, ex: 'By card, please.', exHe: 'בכרטיס, בבקשה.', alias: ['credit card'] },
  { slug: 'ticket', pos: 'noun', en: 'ticket', he: 'כרטיס', cat: 'objects', layer: 2, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], emoji: '🎫', vis: 0.85, ex: 'One ticket, please.', exHe: 'כרטיס אחד, בבקשה.' },
  { slug: 'passport', pos: 'noun', en: 'passport', he: 'דרכון', cat: 'objects', layer: 1, rof: 3, skill: 'recall', s: [4, 5, 5, 5, 5], emoji: '🛂', vis: 0.75, ex: 'Here is my passport.', exHe: 'הנה הדרכון שלי.' },
  { slug: 'umbrella', pos: 'noun', en: 'umbrella', he: 'מטרייה', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 2], emoji: '☂️', vis: 0.95, ex: 'Take an umbrella.', exHe: 'קח מטרייה.' },
  { slug: 'camera', pos: 'noun', en: 'camera', he: 'מצלמה', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 3], emoji: '📷', vis: 0.95, ex: 'Can I use my camera here?', exHe: 'אפשר לצלם כאן?' },
  { slug: 'glasses', pos: 'noun', en: 'glasses', he: 'משקפיים', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 2], emoji: '👓', vis: 0.92, ex: 'I need my glasses.', exHe: 'אני צריך את המשקפיים שלי.' },
  { slug: 'watch', pos: 'noun', en: 'watch', he: 'שעון', cat: 'objects', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 2], emoji: '⌚', vis: 0.9, ex: 'A nice watch.', exHe: 'שעון יפה.' },
  { slug: 'map', pos: 'noun', en: 'map', he: 'מפה', cat: 'objects', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 3, 4, 5], emoji: '🗺️', vis: 0.9, ex: 'Can you show me on the map?', exHe: 'אפשר להראות לי על המפה?' },

  // ── Clothing ───────────────────────────────────────────────────────────────
  { slug: 'shirt', pos: 'noun', en: 'shirt', he: 'חולצה', cat: 'clothing', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 2], emoji: '👕', vis: 0.92, ex: 'A blue shirt.', exHe: 'חולצה כחולה.' },
  { slug: 'shoes', pos: 'noun', en: 'shoes', he: 'נעליים', cat: 'clothing', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 2], emoji: '👟', vis: 0.95, ex: 'New shoes.', exHe: 'נעליים חדשות.' },
  { slug: 'hat', pos: 'noun', en: 'hat', he: 'כובע', cat: 'clothing', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 2], emoji: '🧢', vis: 0.9, ex: 'A sun hat.', exHe: 'כובע שמש.' },
  { slug: 'jacket', pos: 'noun', en: 'jacket', he: 'מעיל', cat: 'clothing', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 2], emoji: '🧥', vis: 0.9, ex: 'A warm jacket.', exHe: 'מעיל חם.' },
  { slug: 'dress', pos: 'noun', en: 'dress', he: 'שמלה', cat: 'clothing', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 2], emoji: '👗', vis: 0.92, ex: 'A red dress.', exHe: 'שמלה אדומה.' },
  { slug: 'socks', pos: 'noun', en: 'socks', he: 'גרביים', cat: 'clothing', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 2, 1, 1], emoji: '🧦', vis: 0.9, ex: 'Warm socks.', exHe: 'גרביים חמים.' },
  { slug: 'pants', pos: 'noun', en: 'pants', he: 'מכנסיים', cat: 'clothing', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 2], emoji: '👖', vis: 0.9, ex: 'Black pants.', exHe: 'מכנסיים שחורים.', alias: ['trousers'] },
  { slug: 'gloves', pos: 'noun', en: 'gloves', he: 'כפפות', cat: 'clothing', layer: 2, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '🧤', vis: 0.88, ex: 'Winter gloves.', exHe: 'כפפות חורף.' },

  // ── Weather ────────────────────────────────────────────────────────────────
  { slug: 'sun', pos: 'noun', en: 'sun', he: 'שמש', cat: 'weather', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 2, 2], emoji: '☀️', vis: 0.97, ex: 'A sunny day.', exHe: 'יום שמשי.' },
  { slug: 'rain', pos: 'noun', en: 'rain', he: 'גשם', cat: 'weather', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 2, 3], emoji: '🌧️', vis: 0.92, ex: 'It is raining.', exHe: 'יורד גשם.' },
  { slug: 'snow', pos: 'noun', en: 'snow', he: 'שלג', cat: 'weather', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 2], emoji: '❄️', vis: 0.92, ex: 'A lot of snow.', exHe: 'הרבה שלג.' },
  { slug: 'cloud', pos: 'noun', en: 'cloud', he: 'ענן', cat: 'weather', layer: 2, rof: 1, skill: 'recognize', s: [2, 1, 2, 1, 1], emoji: '☁️', vis: 0.92, ex: 'A cloudy sky.', exHe: 'שמיים מעוננים.' },
  { slug: 'wind', pos: 'noun', en: 'wind', he: 'רוח', cat: 'weather', layer: 2, rof: 1, skill: 'recognize', s: [3, 1, 2, 1, 1], emoji: '💨', vis: 0.7, ex: 'A strong wind.', exHe: 'רוח חזקה.' },
  { slug: 'storm', pos: 'noun', en: 'storm', he: 'סערה', cat: 'weather', layer: 2, rof: 1, skill: 'recognize', s: [2, 1, 2, 1, 2], emoji: '⛈️', vis: 0.85, ex: 'A big storm is coming.', exHe: 'מגיעה סערה גדולה.' },

  // ── Health & emergency ─────────────────────────────────────────────────────
  { slug: 'doctor', pos: 'noun', en: 'doctor', he: 'רופא', cat: 'health', layer: 1, rof: 3, skill: 'fluent', s: [4, 5, 4, 4, 5], emoji: '🧑‍⚕️', vis: 0.85, ex: 'I need a doctor.', exHe: 'אני צריך רופא.' },
  { slug: 'ambulance', pos: 'noun', en: 'ambulance', he: 'אמבולנס', cat: 'health', layer: 1, rof: 3, skill: 'recognize', s: [2, 4, 3, 2, 5], emoji: '🚑', vis: 0.95, ex: 'Call an ambulance!', exHe: 'תזמינו אמבולנס!' },
  { slug: 'police', pos: 'noun', en: 'police', he: 'משטרה', cat: 'health', layer: 1, rof: 3, skill: 'recognize', s: [3, 4, 4, 3, 5], emoji: '👮', vis: 0.9, ex: 'Call the police!', exHe: 'תתקשרו למשטרה!' },
  { slug: 'fire', pos: 'noun', en: 'fire', he: 'שריפה', cat: 'health', layer: 1, rof: 3, skill: 'recognize', s: [2, 3, 4, 2, 4], emoji: '🔥', vis: 0.85, ex: 'Fire! Get out!', exHe: 'שריפה! צאו החוצה!' },
  { slug: 'medicine', pos: 'noun', en: 'medicine', he: 'תרופה', cat: 'health', layer: 2, rof: 2, skill: 'recognize', s: [3, 4, 3, 3, 5], emoji: '💉', vis: 0.72, ex: 'Medicine for a headache.', exHe: 'תרופה לכאב ראש.' },
  { slug: 'bandage', pos: 'noun', en: 'bandage', he: 'תחבושת', cat: 'health', layer: 2, rof: 2, skill: 'recognize', s: [2, 3, 2, 1, 3], emoji: '🩹', vis: 0.82, ex: 'I need a bandage.', exHe: 'אני צריך תחבושת.' },
  { slug: 'pain', pos: 'noun', en: 'pain', he: 'כאב', cat: 'health', layer: 2, rof: 2, skill: 'recall', s: [3, 5, 3, 3, 5], emoji: '🤕', vis: 0.7, ex: 'I have pain here.', exHe: 'יש לי כאב כאן.' },
  { slug: 'sick', pos: 'adj', en: 'sick', he: 'חולה', cat: 'health', layer: 2, rof: 2, skill: 'recall', s: [3, 5, 3, 3, 5], emoji: '🤒', vis: 0.8, ex: 'I feel sick.', exHe: 'אני מרגיש חולה.' },

  // ── Nature ─────────────────────────────────────────────────────────────────
  { slug: 'tree', pos: 'noun', en: 'tree', he: 'עץ', cat: 'nature', layer: 2, rof: 1, skill: 'recognize', s: [3, 1, 2, 1, 1], emoji: '🌳', vis: 0.95, ex: 'A big tree.', exHe: 'עץ גדול.' },
  { slug: 'flower', pos: 'noun', en: 'flower', he: 'פרח', cat: 'nature', layer: 2, rof: 1, skill: 'recognize', s: [3, 1, 2, 1, 1], emoji: '🌸', vis: 0.92, ex: 'A beautiful flower.', exHe: 'פרח יפה.' },
  { slug: 'mountain', pos: 'noun', en: 'mountain', he: 'הר', cat: 'nature', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 3], emoji: '⛰️', vis: 0.9, ex: 'A high mountain.', exHe: 'הר גבוה.' },
  { slug: 'sea', pos: 'noun', en: 'sea', he: 'ים', cat: 'nature', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 2, 3], emoji: '🌊', vis: 0.85, ex: 'The sea is warm.', exHe: 'הים חם.' },
  { slug: 'moon', pos: 'noun', en: 'moon', he: 'ירח', cat: 'nature', layer: 2, rof: 1, skill: 'recognize', s: [2, 1, 1, 1, 1], emoji: '🌙', vis: 0.92, ex: 'A full moon.', exHe: 'ירח מלא.' },

  // ── Sports & activities ────────────────────────────────────────────────────
  { slug: 'swim', pos: 'verb', en: 'swim', he: 'לשחות', cat: 'activities', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 2, 2, 3], emoji: '🏊', vis: 0.9, ex: 'I want to swim.', exHe: 'אני רוצה לשחות.' },
  { slug: 'run', pos: 'verb', en: 'run', he: 'לרוץ', cat: 'activities', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 3, 2, 2], emoji: '🏃', vis: 0.85, ex: 'I run every morning.', exHe: 'אני רץ כל בוקר.' },
  { slug: 'football', pos: 'noun', en: 'football', he: 'כדורגל', cat: 'activities', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 2], emoji: '⚽', vis: 0.95, ex: 'Let us watch football.', exHe: 'בוא נראה כדורגל.' },
  { slug: 'walk', pos: 'verb', en: 'walk', he: 'ללכת', cat: 'activities', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 4], emoji: '🚶', vis: 0.82, ex: 'It is a short walk.', exHe: 'זו הליכה קצרה.' },
  { slug: 'dance', pos: 'verb', en: 'dance', he: 'לרקוד', cat: 'activities', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 2, 1, 1], emoji: '💃', vis: 0.9, ex: 'They love to dance.', exHe: 'הם אוהבים לרקוד.' },

  // ── People & family ────────────────────────────────────────────────────────
  { slug: 'man', pos: 'noun', en: 'man', he: 'גבר', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [5, 2, 4, 3, 2], emoji: '👨', vis: 0.9, ex: 'That man over there.', exHe: 'הגבר שם.', opp: ['woman'] },
  { slug: 'woman', pos: 'noun', en: 'woman', he: 'אישה', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [5, 2, 4, 3, 2], emoji: '👩', vis: 0.9, ex: 'Ask that woman.', exHe: 'תשאל את האישה הזאת.', opp: ['man'] },
  { slug: 'baby', pos: 'noun', en: 'baby', he: 'תינוק', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 2], emoji: '👶', vis: 0.95, ex: 'I am traveling with a baby.', exHe: 'אני נוסע עם תינוק.' },
  { slug: 'child', pos: 'noun', en: 'child', he: 'ילד', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 4, 4, 3, 4], emoji: '🧒', vis: 0.88, ex: 'One adult, one child.', exHe: 'מבוגר אחד, ילד אחד.' },
  { slug: 'family', pos: 'noun', en: 'family', he: 'משפחה', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [4, 4, 4, 3, 3], emoji: '👪', vis: 0.88, ex: 'I am here with my family.', exHe: 'אני כאן עם המשפחה שלי.' },
  { slug: 'friend', pos: 'noun', en: 'friend', he: 'חבר', cat: 'people', layer: 2, rof: 1, skill: 'recognize', s: [5, 4, 4, 3, 3], emoji: '👫', vis: 0.7, ex: 'This is my friend.', exHe: 'זה החבר שלי.' },

  // ── Directions ─────────────────────────────────────────────────────────────
  { slug: 'left', pos: 'adv', en: 'left', he: 'שמאלה', cat: 'directions', layer: 1, rof: 2, skill: 'recognize', s: [5, 3, 5, 4, 5], emoji: '⬅️', vis: 0.85, ex: 'It is on the left.', exHe: 'זה בצד שמאל.', opp: ['right'] },
  { slug: 'right', pos: 'adv', en: 'right', he: 'ימינה', cat: 'directions', layer: 1, rof: 2, skill: 'recognize', s: [5, 3, 5, 4, 5], emoji: '➡️', vis: 0.85, ex: 'Turn right.', exHe: 'פנה ימינה.', opp: ['left'] },
  { slug: 'up', pos: 'adv', en: 'up', he: 'למעלה', cat: 'directions', layer: 2, rof: 1, skill: 'recognize', s: [5, 2, 4, 3, 3], emoji: '⬆️', vis: 0.8, ex: 'The room is up the stairs.', exHe: 'החדר למעלה במדרגות.', opp: ['down'] },
  { slug: 'down', pos: 'adv', en: 'down', he: 'למטה', cat: 'directions', layer: 2, rof: 1, skill: 'recognize', s: [5, 2, 4, 3, 3], emoji: '⬇️', vis: 0.8, ex: 'Breakfast is down the stairs.', exHe: 'ארוחת הבוקר למטה במדרגות.', opp: ['up'] },
];
