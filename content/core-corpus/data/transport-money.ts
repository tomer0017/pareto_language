import type { CorpusRow } from '../types.js';

/**
 * Transport signage + money/shopping vocabulary. Heavy recognition bias: platform, gate,
 * departure, receipt and price are things a traveler mostly READS or HEARS — failing to decode
 * them is what strands people (methodology: hear-channel ≥ say-channel at equal impact).
 */
export const TRANSPORT_MONEY: CorpusRow[] = [
  // ── Transport (15) ─────────────────────────────────────────────────────────
  { slug: 'platform', pos: 'noun', en: 'platform', he: 'רציף', cat: 'transport', layer: 2, rof: 2, skill: 'recognize', s: [3, 3, 5, 2, 5], ex: 'Platform three.', exHe: 'רציף שלוש.' },
  { slug: 'gate', pos: 'noun', en: 'gate', he: 'שער (בשדה תעופה)', cat: 'transport', layer: 1, rof: 2, skill: 'recognize', s: [3, 3, 5, 2, 5], ex: 'Gate twelve.', exHe: 'שער שתים עשרה.' },
  { slug: 'seat', pos: 'noun', en: 'seat', he: 'מושב', cat: 'transport', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 5, 3, 4], emoji: '💺', vis: 0.85, ex: 'Is this seat free?', exHe: 'המושב הזה פנוי?' },
  { slug: 'luggage', pos: 'noun', en: 'luggage', he: 'כבודה', cat: 'transport', layer: 2, rof: 2, skill: 'recognize', s: [3, 4, 4, 2, 5], ex: 'My luggage is lost.', exHe: 'הכבודה שלי אבדה.', alias: ['baggage'] },
  { slug: 'suitcase', pos: 'noun', en: 'suitcase', he: 'מזוודה', cat: 'transport', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 3, 2, 4], emoji: '🧳', vis: 0.9, ex: 'A heavy suitcase.', exHe: 'מזוודה כבדה.' },
  { slug: 'bus-stop', pos: 'noun', en: 'bus stop', he: 'תחנת אוטובוס', cat: 'transport', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 4, 2, 5], emoji: '🚏', vis: 0.85, ex: 'The bus stop is there.', exHe: 'תחנת האוטובוס שם.' },
  { slug: 'driver', pos: 'noun', en: 'driver', he: 'נהג', cat: 'transport', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 4], ex: 'Ask the driver.', exHe: 'תשאל את הנהג.' },
  { slug: 'metro', pos: 'noun', en: 'metro', he: 'רכבת תחתית', cat: 'transport', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 4, 2, 5], emoji: '🚇', vis: 0.9, ex: 'The nearest metro station.', exHe: 'תחנת הרכבת התחתית הקרובה.', alias: ['subway', 'underground'] },
  { slug: 'road', pos: 'noun', en: 'road', he: 'כביש', cat: 'transport', layer: 2, rof: 1, skill: 'recognize', s: [4, 2, 4, 2, 3], emoji: '🛣️', vis: 0.7, ex: 'Cross the road carefully.', exHe: 'תחצה את הכביש בזהירות.' },
  { slug: 'traffic-light', pos: 'noun', en: 'traffic light', he: 'רמזור', cat: 'transport', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 5, 2, 4], emoji: '🚦', vis: 0.95, ex: 'Turn left at the traffic light.', exHe: 'פנה שמאלה ברמזור.' },
  { slug: 'corner', pos: 'noun', en: 'corner', he: 'פינה', cat: 'transport', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 5, 2, 4], ex: 'It is around the corner.', exHe: 'זה מעבר לפינה.' },
  { slug: 'flight', pos: 'noun', en: 'flight', he: 'טיסה', cat: 'transport', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 5, 2, 5], ex: 'My flight is at noon.', exHe: 'הטיסה שלי בצהריים.' },
  { slug: 'departure', pos: 'noun', en: 'departure', he: 'יציאה / המראה', cat: 'transport', layer: 2, rof: 2, skill: 'recognize', s: [3, 2, 5, 2, 5], ex: 'Departures are upstairs.', exHe: 'ההמראות למעלה.', opp: ['arrival'] },
  { slug: 'arrival', pos: 'noun', en: 'arrival', he: 'הגעה / נחיתה', cat: 'transport', layer: 2, rof: 2, skill: 'recognize', s: [3, 2, 5, 2, 5], ex: 'The arrivals hall.', exHe: 'אולם הנחיתות.', opp: ['departure'] },
  { slug: 'ferry', pos: 'noun', en: 'ferry', he: 'מעבורת', cat: 'transport', layer: 2, rof: 1, skill: 'recognize', s: [2, 3, 3, 1, 3], emoji: '⛴️', vis: 0.85, ex: 'The ferry to the island.', exHe: 'המעבורת לאי.' },

  // ── Money & shopping (16) ──────────────────────────────────────────────────
  { slug: 'price', pos: 'noun', en: 'price', he: 'מחיר', cat: 'money', layer: 1, rof: 2, skill: 'recall', s: [5, 4, 5, 4, 5], emoji: '🏷️', vis: 0.7, ex: 'What is the price?', exHe: 'מה המחיר?' },
  { slug: 'cash', pos: 'noun', en: 'cash', he: 'מזומן', cat: 'money', layer: 1, rof: 2, skill: 'recall', s: [4, 4, 5, 4, 5], emoji: '💵', vis: 0.9, ex: 'Cash only.', exHe: 'מזומן בלבד.' },
  { slug: 'coin', pos: 'noun', en: 'coin', he: 'מטבע', cat: 'money', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 3], emoji: '🪙', vis: 0.9, ex: 'I need coins for the locker.', exHe: 'אני צריך מטבעות ללוקר.' },
  { slug: 'receipt', pos: 'noun', en: 'receipt', he: 'קבלה (חשבונית)', cat: 'money', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 4, 3, 4], emoji: '🧾', vis: 0.9, ex: 'A receipt, please.', exHe: 'קבלה, בבקשה.' },
  { slug: 'wallet', pos: 'noun', en: 'wallet', he: 'ארנק', cat: 'money', layer: 2, rof: 2, skill: 'recall', s: [3, 4, 3, 2, 4], emoji: '👛', vis: 0.85, ex: 'I lost my wallet.', exHe: 'איבדתי את הארנק שלי.' },
  { slug: 'size', pos: 'noun', en: 'size', he: 'מידה', cat: 'money', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 5, 2, 4], ex: 'A bigger size?', exHe: 'יש מידה גדולה יותר?' },
  { slug: 'discount', pos: 'noun', en: 'discount', he: 'הנחה', cat: 'money', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 4, 2, 3], ex: 'Is there a discount?', exHe: 'יש הנחה?' },
  { slug: 'sale', pos: 'noun', en: 'sale', he: 'מבצע', cat: 'money', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 5, 2, 3], ex: 'Everything is on sale.', exHe: 'הכול במבצע.' },
  { slug: 'euro', pos: 'noun', en: 'euro', he: 'יורו', cat: 'money', layer: 2, rof: 2, skill: 'recognize', s: [4, 4, 5, 3, 5], emoji: '💶', vis: 0.9, ex: 'Ten euros, please.', exHe: 'עשרה יורו, בבקשה.' },
  { slug: 'dollar', pos: 'noun', en: 'dollar', he: 'דולר', cat: 'money', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 5, 3, 4], emoji: '💲', vis: 0.8, ex: 'Twenty dollars.', exHe: 'עשרים דולר.' },
  { slug: 'shekel', pos: 'noun', en: 'shekel', he: 'שקל', cat: 'money', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 3, 2, 3], ex: 'A hundred shekels.', exHe: 'מאה שקלים.' },
  { slug: 'tax', pos: 'noun', en: 'tax', he: 'מס', cat: 'money', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 4, 2, 3], ex: 'Is tax included?', exHe: 'המס כלול?' },
  { slug: 'tip', pos: 'noun', en: 'tip', he: 'טיפ', cat: 'money', layer: 2, rof: 1, skill: 'recognize', s: [3, 3, 4, 2, 4], ex: 'Is the tip included?', exHe: 'הטיפ כלול?' },
  { slug: 'gift', pos: 'noun', en: 'gift', he: 'מתנה', cat: 'money', layer: 2, rof: 1, skill: 'recall', s: [3, 3, 3, 2, 3], emoji: '🎁', vis: 0.95, ex: 'A gift for my family.', exHe: 'מתנה למשפחה שלי.' },
  { slug: 'souvenir', pos: 'noun', en: 'souvenir', he: 'מזכרת', cat: 'money', layer: 2, rof: 1, skill: 'recognize', s: [2, 3, 3, 1, 3], ex: 'A small souvenir.', exHe: 'מזכרת קטנה.' },
  { slug: 'atm', pos: 'noun', en: 'ATM', he: 'כספומט', cat: 'money', layer: 1, rof: 2, skill: 'recall', s: [3, 4, 4, 3, 5], emoji: '🏧', vis: 0.9, ex: 'Is there an ATM near here?', exHe: 'יש כספומט קרוב לכאן?', alias: ['cash machine'] },
];
