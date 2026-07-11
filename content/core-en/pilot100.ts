/**
 * READY Core 100 — the emoji-first travel-vocabulary PILOT (authored source of truth).
 *
 * Selection methodology (see docs/CORE-100.md):
 *   Every concept must clear BOTH bars — (1) real travel/everyday communication value, and
 *   (2) a clear, unambiguous emoji (this pilot exists to validate the emoji games). Function
 *   words with high travel value but no picture (where/when/want/need…) live in the research
 *   draft core100.draft.yaml and are intentionally NOT in the emoji pilot.
 *
 * Balanced across categories so distractor generation is exercised (no category so small that
 * the quiz repeats options, none so dominant that distractors are always trivial).
 *
 * This TS array is authored input; `build-core-en.ts` derives the canonical ConceptSchema
 * concepts (content/concepts/core-en.yaml) and the app pack (public/content/core-en.v1.json).
 * Hebrew is human-authored, natural (no transliteration); quality is `ai_reviewed` → the pilot
 * ships honestly as "pending native Hebrew review".
 */

export type Skill = 'recognize' | 'recall' | 'fluent';

export interface PilotWord {
  /** slug → concept.word.{slug} and en.word.{slug}. Unique. */
  slug: string;
  en: string;
  he: string;
  emoji: string;
  /** Primary pilot category (drives situation links + distractor grouping). */
  cat: string;
  tier: 0 | 1;
  skill: Skill;
  /** Return on Failure 1–3 (what breaks without it). */
  rof: 1 | 2 | 3;
  /** Visual confidence 0–1: how unambiguously the emoji reads as this exact meaning. */
  vis: number;
  ex: string;
  exHe: string;
}

export const PILOT100: PilotWord[] = [
  // ── Body parts (8) ───────────────────────────────────────────────────────
  { slug: 'nose', en: 'nose', he: 'אף', emoji: '👃', cat: 'body', tier: 1, skill: 'recognize', rof: 1, vis: 0.98, ex: 'My nose hurts.', exHe: 'האף שלי כואב.' },
  { slug: 'eye', en: 'eye', he: 'עין', emoji: '👁️', cat: 'body', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'Something is in my eye.', exHe: 'משהו נכנס לי לעין.' },
  { slug: 'ear', en: 'ear', he: 'אוזן', emoji: '👂', cat: 'body', tier: 1, skill: 'recognize', rof: 1, vis: 0.96, ex: 'My ear hurts.', exHe: 'האוזן שלי כואבת.' },
  { slug: 'hand', en: 'hand', he: 'יד', emoji: '✋', cat: 'body', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'Give me your hand.', exHe: 'תן לי את היד.' },
  { slug: 'mouth', en: 'mouth', he: 'פה', emoji: '👄', cat: 'body', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'Open your mouth.', exHe: 'תפתח את הפה.' },
  { slug: 'foot', en: 'foot', he: 'כף רגל', emoji: '🦶', cat: 'body', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'My foot hurts.', exHe: 'כף הרגל שלי כואבת.' },
  { slug: 'leg', en: 'leg', he: 'רגל', emoji: '🦵', cat: 'body', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'I hurt my leg.', exHe: 'פגעתי ברגל.' },
  { slug: 'tooth', en: 'tooth', he: 'שן', emoji: '🦷', cat: 'body', tier: 1, skill: 'recognize', rof: 2, vis: 0.9, ex: 'I have a toothache.', exHe: 'יש לי כאב שיניים.' },

  // ── Food & drink (15) ────────────────────────────────────────────────────
  { slug: 'water', en: 'water', he: 'מים', emoji: '💧', cat: 'food', tier: 0, skill: 'recall', rof: 2, vis: 0.85, ex: 'Water, please.', exHe: 'מים, בבקשה.' },
  { slug: 'coffee', en: 'coffee', he: 'קפה', emoji: '☕', cat: 'food', tier: 0, skill: 'recall', rof: 1, vis: 0.95, ex: 'A coffee, please.', exHe: 'קפה, בבקשה.' },
  { slug: 'tea', en: 'tea', he: 'תה', emoji: '🍵', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'Tea with milk.', exHe: 'תה עם חלב.' },
  { slug: 'bread', en: 'bread', he: 'לחם', emoji: '🍞', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'Fresh bread.', exHe: 'לחם טרי.' },
  { slug: 'milk', en: 'milk', he: 'חלב', emoji: '🥛', cat: 'food', tier: 1, skill: 'recognize', rof: 2, vis: 0.92, ex: 'With milk, please.', exHe: 'עם חלב, בבקשה.' },
  { slug: 'egg', en: 'egg', he: 'ביצה', emoji: '🥚', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'Two eggs, please.', exHe: 'שתי ביצים, בבקשה.' },
  { slug: 'apple', en: 'apple', he: 'תפוח', emoji: '🍎', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.98, ex: 'One apple.', exHe: 'תפוח אחד.' },
  { slug: 'banana', en: 'banana', he: 'בננה', emoji: '🍌', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.98, ex: 'A banana, please.', exHe: 'בננה, בבקשה.' },
  { slug: 'chicken', en: 'chicken', he: 'עוף', emoji: '🍗', cat: 'food', tier: 1, skill: 'recognize', rof: 2, vis: 0.85, ex: 'Grilled chicken.', exHe: 'עוף בגריל.' },
  { slug: 'fish', en: 'fish', he: 'דג', emoji: '🐟', cat: 'food', tier: 1, skill: 'recognize', rof: 2, vis: 0.9, ex: 'Fish of the day.', exHe: 'דג היום.' },
  { slug: 'meat', en: 'meat', he: 'בשר', emoji: '🥩', cat: 'food', tier: 1, skill: 'recognize', rof: 2, vis: 0.88, ex: 'No meat, please.', exHe: 'בלי בשר, בבקשה.' },
  { slug: 'cheese', en: 'cheese', he: 'גבינה', emoji: '🧀', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'Bread and cheese.', exHe: 'לחם וגבינה.' },
  { slug: 'rice', en: 'rice', he: 'אורז', emoji: '🍚', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.85, ex: 'Rice, please.', exHe: 'אורז, בבקשה.' },
  { slug: 'soup', en: 'soup', he: 'מרק', emoji: '🍲', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.82, ex: 'Hot soup.', exHe: 'מרק חם.' },
  { slug: 'wine', en: 'wine', he: 'יין', emoji: '🍷', cat: 'food', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'A glass of wine.', exHe: 'כוס יין.' },

  // ── Animals (5) ──────────────────────────────────────────────────────────
  { slug: 'dog', en: 'dog', he: 'כלב', emoji: '🐶', cat: 'animals', tier: 1, skill: 'recognize', rof: 1, vis: 0.98, ex: 'A big dog.', exHe: 'כלב גדול.' },
  { slug: 'cat', en: 'cat', he: 'חתול', emoji: '🐱', cat: 'animals', tier: 1, skill: 'recognize', rof: 1, vis: 0.98, ex: 'A small cat.', exHe: 'חתול קטן.' },
  { slug: 'bird', en: 'bird', he: 'ציפור', emoji: '🐦', cat: 'animals', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'A little bird.', exHe: 'ציפור קטנה.' },
  { slug: 'horse', en: 'horse', he: 'סוס', emoji: '🐴', cat: 'animals', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'A brown horse.', exHe: 'סוס חום.' },
  { slug: 'cow', en: 'cow', he: 'פרה', emoji: '🐄', cat: 'animals', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'A cow in the field.', exHe: 'פרה בשדה.' },

  // ── Transport (7) ────────────────────────────────────────────────────────
  { slug: 'car', en: 'car', he: 'מכונית', emoji: '🚗', cat: 'transport', tier: 1, skill: 'recognize', rof: 2, vis: 0.95, ex: 'By car.', exHe: 'במכונית.' },
  { slug: 'bus', en: 'bus', he: 'אוטובוס', emoji: '🚌', cat: 'transport', tier: 0, skill: 'recall', rof: 2, vis: 0.95, ex: 'Where is the bus?', exHe: 'איפה האוטובוס?' },
  { slug: 'train', en: 'train', he: 'רכבת', emoji: '🚆', cat: 'transport', tier: 0, skill: 'recall', rof: 2, vis: 0.95, ex: 'The train to the center.', exHe: 'הרכבת למרכז.' },
  { slug: 'plane', en: 'plane', he: 'מטוס', emoji: '✈️', cat: 'transport', tier: 1, skill: 'recognize', rof: 2, vis: 0.97, ex: 'My plane is late.', exHe: 'המטוס שלי מאחר.' },
  { slug: 'taxi', en: 'taxi', he: 'מונית', emoji: '🚕', cat: 'transport', tier: 0, skill: 'recall', rof: 2, vis: 0.95, ex: 'Call a taxi, please.', exHe: 'תזמין מונית, בבקשה.' },
  { slug: 'bike', en: 'bike', he: 'אופניים', emoji: '🚲', cat: 'transport', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'I want to rent a bike.', exHe: 'אני רוצה לשכור אופניים.' },
  { slug: 'boat', en: 'boat', he: 'סירה', emoji: '⛵', cat: 'transport', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'A boat trip.', exHe: 'טיול בסירה.' },

  // ── Places (11) ──────────────────────────────────────────────────────────
  { slug: 'hotel', en: 'hotel', he: 'מלון', emoji: '🏨', cat: 'places', tier: 0, skill: 'recall', rof: 2, vis: 0.92, ex: 'Where is my hotel?', exHe: 'איפה המלון שלי?' },
  { slug: 'hospital', en: 'hospital', he: 'בית חולים', emoji: '🏥', cat: 'places', tier: 0, skill: 'recognize', rof: 3, vis: 0.9, ex: 'To the hospital, fast!', exHe: 'לבית החולים, מהר!' },
  { slug: 'restaurant', en: 'restaurant', he: 'מסעדה', emoji: '🍴', cat: 'places', tier: 1, skill: 'recognize', rof: 1, vis: 0.85, ex: 'A good restaurant.', exHe: 'מסעדה טובה.' },
  { slug: 'bank', en: 'bank', he: 'בנק', emoji: '🏦', cat: 'places', tier: 1, skill: 'recognize', rof: 1, vis: 0.85, ex: 'It is next to the bank.', exHe: 'זה ליד הבנק.' },
  { slug: 'pharmacy', en: 'pharmacy', he: 'בית מרקחת', emoji: '💊', cat: 'places', tier: 0, skill: 'recognize', rof: 3, vis: 0.72, ex: 'Where is a pharmacy?', exHe: 'איפה יש בית מרקחת?' },
  { slug: 'beach', en: 'beach', he: 'חוף', emoji: '🏖️', cat: 'places', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'How do I get to the beach?', exHe: 'איך מגיעים לחוף?' },
  { slug: 'museum', en: 'museum', he: 'מוזיאון', emoji: '🏛️', cat: 'places', tier: 1, skill: 'recognize', rof: 1, vis: 0.82, ex: 'Two tickets to the museum.', exHe: 'שני כרטיסים למוזיאון.' },
  { slug: 'market', en: 'market', he: 'שוק', emoji: '🏪', cat: 'places', tier: 1, skill: 'recognize', rof: 1, vis: 0.7, ex: 'The fruit market.', exHe: 'שוק הפירות.' },
  { slug: 'station', en: 'station', he: 'תחנה', emoji: '🚉', cat: 'places', tier: 1, skill: 'recognize', rof: 2, vis: 0.85, ex: 'Where is the station?', exHe: 'איפה התחנה?' },
  { slug: 'toilet', en: 'toilet', he: 'שירותים', emoji: '🚻', cat: 'places', tier: 0, skill: 'recall', rof: 3, vis: 0.85, ex: 'Where is the toilet?', exHe: 'איפה השירותים?' },
  { slug: 'church', en: 'church', he: 'כנסייה', emoji: '⛪', cat: 'places', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'The old church.', exHe: 'הכנסייה העתיקה.' },

  // ── Common objects (12) ──────────────────────────────────────────────────
  { slug: 'key', en: 'key', he: 'מפתח', emoji: '🔑', cat: 'objects', tier: 1, skill: 'recognize', rof: 2, vis: 0.95, ex: 'My room key.', exHe: 'המפתח של החדר שלי.' },
  { slug: 'phone', en: 'phone', he: 'טלפון', emoji: '📱', cat: 'objects', tier: 1, skill: 'recognize', rof: 2, vis: 0.95, ex: 'I lost my phone.', exHe: 'איבדתי את הטלפון שלי.' },
  { slug: 'bag', en: 'bag', he: 'תיק', emoji: '🎒', cat: 'objects', tier: 1, skill: 'recall', rof: 2, vis: 0.9, ex: 'I lost my bag.', exHe: 'איבדתי את התיק שלי.' },
  { slug: 'money', en: 'money', he: 'כסף', emoji: '💰', cat: 'objects', tier: 1, skill: 'recognize', rof: 2, vis: 0.85, ex: 'I have no money.', exHe: 'אין לי כסף.' },
  { slug: 'card', en: 'card', he: 'כרטיס אשראי', emoji: '💳', cat: 'objects', tier: 0, skill: 'recall', rof: 2, vis: 0.9, ex: 'By card, please.', exHe: 'בכרטיס, בבקשה.' },
  { slug: 'ticket', en: 'ticket', he: 'כרטיס', emoji: '🎫', cat: 'objects', tier: 1, skill: 'recall', rof: 2, vis: 0.85, ex: 'One ticket, please.', exHe: 'כרטיס אחד, בבקשה.' },
  { slug: 'passport', en: 'passport', he: 'דרכון', emoji: '🛂', cat: 'objects', tier: 0, skill: 'recall', rof: 3, vis: 0.75, ex: 'Here is my passport.', exHe: 'הנה הדרכון שלי.' },
  { slug: 'umbrella', en: 'umbrella', he: 'מטרייה', emoji: '☂️', cat: 'objects', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'Take an umbrella.', exHe: 'קח מטרייה.' },
  { slug: 'camera', en: 'camera', he: 'מצלמה', emoji: '📷', cat: 'objects', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'Can I use my camera here?', exHe: 'אפשר לצלם כאן?' },
  { slug: 'glasses', en: 'glasses', he: 'משקפיים', emoji: '👓', cat: 'objects', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'I need my glasses.', exHe: 'אני צריך את המשקפיים שלי.' },
  { slug: 'watch', en: 'watch', he: 'שעון', emoji: '⌚', cat: 'objects', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'A nice watch.', exHe: 'שעון יפה.' },
  { slug: 'map', en: 'map', he: 'מפה', emoji: '🗺️', cat: 'objects', tier: 1, skill: 'recall', rof: 2, vis: 0.9, ex: 'Can you show me on the map?', exHe: 'אפשר להראות לי על המפה?' },

  // ── Clothing (8) ─────────────────────────────────────────────────────────
  { slug: 'shirt', en: 'shirt', he: 'חולצה', emoji: '👕', cat: 'clothing', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'A blue shirt.', exHe: 'חולצה כחולה.' },
  { slug: 'shoes', en: 'shoes', he: 'נעליים', emoji: '👟', cat: 'clothing', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'New shoes.', exHe: 'נעליים חדשות.' },
  { slug: 'hat', en: 'hat', he: 'כובע', emoji: '🧢', cat: 'clothing', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'A sun hat.', exHe: 'כובע שמש.' },
  { slug: 'jacket', en: 'jacket', he: 'מעיל', emoji: '🧥', cat: 'clothing', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'A warm jacket.', exHe: 'מעיל חם.' },
  { slug: 'dress', en: 'dress', he: 'שמלה', emoji: '👗', cat: 'clothing', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'A red dress.', exHe: 'שמלה אדומה.' },
  { slug: 'socks', en: 'socks', he: 'גרביים', emoji: '🧦', cat: 'clothing', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'Warm socks.', exHe: 'גרביים חמים.' },
  { slug: 'pants', en: 'pants', he: 'מכנסיים', emoji: '👖', cat: 'clothing', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'Black pants.', exHe: 'מכנסיים שחורים.' },
  { slug: 'gloves', en: 'gloves', he: 'כפפות', emoji: '🧤', cat: 'clothing', tier: 1, skill: 'recognize', rof: 1, vis: 0.88, ex: 'Winter gloves.', exHe: 'כפפות חורף.' },

  // ── Weather (6) ──────────────────────────────────────────────────────────
  { slug: 'sun', en: 'sun', he: 'שמש', emoji: '☀️', cat: 'weather', tier: 1, skill: 'recognize', rof: 1, vis: 0.97, ex: 'A sunny day.', exHe: 'יום שמשי.' },
  { slug: 'rain', en: 'rain', he: 'גשם', emoji: '🌧️', cat: 'weather', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'It is raining.', exHe: 'יורד גשם.' },
  { slug: 'snow', en: 'snow', he: 'שלג', emoji: '❄️', cat: 'weather', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'A lot of snow.', exHe: 'הרבה שלג.' },
  { slug: 'cloud', en: 'cloud', he: 'ענן', emoji: '☁️', cat: 'weather', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'A cloudy sky.', exHe: 'שמיים מעוננים.' },
  { slug: 'wind', en: 'wind', he: 'רוח', emoji: '💨', cat: 'weather', tier: 1, skill: 'recognize', rof: 1, vis: 0.7, ex: 'A strong wind.', exHe: 'רוח חזקה.' },
  { slug: 'storm', en: 'storm', he: 'סערה', emoji: '⛈️', cat: 'weather', tier: 1, skill: 'recognize', rof: 1, vis: 0.85, ex: 'A big storm is coming.', exHe: 'מגיעה סערה גדולה.' },

  // ── Health & emergency (8) ───────────────────────────────────────────────
  { slug: 'doctor', en: 'doctor', he: 'רופא', emoji: '🧑‍⚕️', cat: 'health', tier: 0, skill: 'fluent', rof: 3, vis: 0.85, ex: 'I need a doctor.', exHe: 'אני צריך רופא.' },
  { slug: 'ambulance', en: 'ambulance', he: 'אמבולנס', emoji: '🚑', cat: 'health', tier: 0, skill: 'recognize', rof: 3, vis: 0.95, ex: 'Call an ambulance!', exHe: 'תזמינו אמבולנס!' },
  { slug: 'police', en: 'police', he: 'משטרה', emoji: '👮', cat: 'health', tier: 0, skill: 'recognize', rof: 3, vis: 0.9, ex: 'Call the police!', exHe: 'תתקשרו למשטרה!' },
  { slug: 'fire', en: 'fire', he: 'שריפה', emoji: '🔥', cat: 'health', tier: 0, skill: 'recognize', rof: 3, vis: 0.85, ex: 'Fire! Get out!', exHe: 'שריפה! צאו החוצה!' },
  { slug: 'medicine', en: 'medicine', he: 'תרופה', emoji: '💉', cat: 'health', tier: 1, skill: 'recognize', rof: 2, vis: 0.72, ex: 'Medicine for a headache.', exHe: 'תרופה לכאב ראש.' },
  { slug: 'bandage', en: 'bandage', he: 'תחבושת', emoji: '🩹', cat: 'health', tier: 1, skill: 'recognize', rof: 2, vis: 0.82, ex: 'I need a bandage.', exHe: 'אני צריך תחבושת.' },
  { slug: 'pain', en: 'pain', he: 'כאב', emoji: '🤕', cat: 'health', tier: 1, skill: 'recall', rof: 2, vis: 0.7, ex: 'I have pain here.', exHe: 'יש לי כאב כאן.' },
  { slug: 'sick', en: 'sick', he: 'חולה', emoji: '🤒', cat: 'health', tier: 1, skill: 'recall', rof: 2, vis: 0.8, ex: 'I feel sick.', exHe: 'אני מרגיש חולה.' },

  // ── Nature (5) ───────────────────────────────────────────────────────────
  { slug: 'tree', en: 'tree', he: 'עץ', emoji: '🌳', cat: 'nature', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'A big tree.', exHe: 'עץ גדול.' },
  { slug: 'flower', en: 'flower', he: 'פרח', emoji: '🌸', cat: 'nature', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'A beautiful flower.', exHe: 'פרח יפה.' },
  { slug: 'mountain', en: 'mountain', he: 'הר', emoji: '⛰️', cat: 'nature', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'A high mountain.', exHe: 'הר גבוה.' },
  { slug: 'sea', en: 'sea', he: 'ים', emoji: '🌊', cat: 'nature', tier: 1, skill: 'recognize', rof: 1, vis: 0.85, ex: 'The sea is warm.', exHe: 'הים חם.' },
  { slug: 'moon', en: 'moon', he: 'ירח', emoji: '🌙', cat: 'nature', tier: 1, skill: 'recognize', rof: 1, vis: 0.92, ex: 'A full moon.', exHe: 'ירח מלא.' },

  // ── Sports & activities (5) ──────────────────────────────────────────────
  { slug: 'swim', en: 'swim', he: 'לשחות', emoji: '🏊', cat: 'activities', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'I want to swim.', exHe: 'אני רוצה לשחות.' },
  { slug: 'run', en: 'run', he: 'לרוץ', emoji: '🏃', cat: 'activities', tier: 1, skill: 'recognize', rof: 1, vis: 0.85, ex: 'I run every morning.', exHe: 'אני רץ כל בוקר.' },
  { slug: 'football', en: 'football', he: 'כדורגל', emoji: '⚽', cat: 'activities', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'Let us watch football.', exHe: 'בוא נראה כדורגל.' },
  { slug: 'walk', en: 'walk', he: 'ללכת', emoji: '🚶', cat: 'activities', tier: 1, skill: 'recognize', rof: 1, vis: 0.82, ex: 'It is a short walk.', exHe: 'זו הליכה קצרה.' },
  { slug: 'dance', en: 'dance', he: 'לרקוד', emoji: '💃', cat: 'activities', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'They love to dance.', exHe: 'הם אוהבים לרקוד.' },

  // ── People & family (6) ──────────────────────────────────────────────────
  { slug: 'man', en: 'man', he: 'גבר', emoji: '👨', cat: 'people', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'That man over there.', exHe: 'הגבר שם.' },
  { slug: 'woman', en: 'woman', he: 'אישה', emoji: '👩', cat: 'people', tier: 1, skill: 'recognize', rof: 1, vis: 0.9, ex: 'Ask that woman.', exHe: 'תשאל את האישה הזאת.' },
  { slug: 'baby', en: 'baby', he: 'תינוק', emoji: '👶', cat: 'people', tier: 1, skill: 'recognize', rof: 1, vis: 0.95, ex: 'I am traveling with a baby.', exHe: 'אני נוסע עם תינוק.' },
  { slug: 'child', en: 'child', he: 'ילד', emoji: '🧒', cat: 'people', tier: 1, skill: 'recognize', rof: 1, vis: 0.88, ex: 'One adult, one child.', exHe: 'מבוגר אחד, ילד אחד.' },
  { slug: 'family', en: 'family', he: 'משפחה', emoji: '👪', cat: 'people', tier: 1, skill: 'recognize', rof: 1, vis: 0.88, ex: 'I am here with my family.', exHe: 'אני כאן עם המשפחה שלי.' },
  { slug: 'friend', en: 'friend', he: 'חבר', emoji: '👫', cat: 'people', tier: 1, skill: 'recognize', rof: 1, vis: 0.7, ex: 'This is my friend.', exHe: 'זה החבר שלי.' },

  // ── Directions (4) ───────────────────────────────────────────────────────
  { slug: 'left', en: 'left', he: 'שמאלה', emoji: '⬅️', cat: 'directions', tier: 0, skill: 'recognize', rof: 2, vis: 0.85, ex: 'It is on the left.', exHe: 'זה בצד שמאל.' },
  { slug: 'right', en: 'right', he: 'ימינה', emoji: '➡️', cat: 'directions', tier: 0, skill: 'recognize', rof: 2, vis: 0.85, ex: 'Turn right.', exHe: 'פנה ימינה.' },
  { slug: 'up', en: 'up', he: 'למעלה', emoji: '⬆️', cat: 'directions', tier: 1, skill: 'recognize', rof: 1, vis: 0.8, ex: 'The room is up the stairs.', exHe: 'החדר למעלה במדרגות.' },
  { slug: 'down', en: 'down', he: 'למטה', emoji: '⬇️', cat: 'directions', tier: 1, skill: 'recognize', rof: 1, vis: 0.8, ex: 'Breakfast is down the stairs.', exHe: 'ארוחת הבוקר למטה במדרגות.' },
];
