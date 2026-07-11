import type { CorpusRow } from '../types.js';

/**
 * Numbers, time and colors. Numbers store only the NON-compositional atoms (methodology §4
 * Never-Teach: 21–99 and o'clock patterns are generator-drilled in Speed Challenge, never
 * stored as concepts). Days of the week are recognition-first — opening hours and tickets.
 */
export const NUMBERS_TIME: CorpusRow[] = [
  // ── Numbers (17) ───────────────────────────────────────────────────────────
  { slug: 'one', kind: 'number', pos: 'num', en: 'one', he: 'אחת', cat: 'numbers', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], emoji: '1️⃣', vis: 0.97, ex: 'One ticket, please.', exHe: 'כרטיס אחד, בבקשה.' },
  { slug: 'two', kind: 'number', pos: 'num', en: 'two', he: 'שתיים', cat: 'numbers', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], emoji: '2️⃣', vis: 0.97, ex: 'A table for two.', exHe: 'שולחן לשניים.' },
  { slug: 'three', kind: 'number', pos: 'num', en: 'three', he: 'שלוש', cat: 'numbers', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], emoji: '3️⃣', vis: 0.97, ex: 'Three nights.', exHe: 'שלושה לילות.' },
  { slug: 'four', kind: 'number', pos: 'num', en: 'four', he: 'ארבע', cat: 'numbers', layer: 1, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], emoji: '4️⃣', vis: 0.97, ex: 'Four people.', exHe: 'ארבעה אנשים.' },
  { slug: 'five', kind: 'number', pos: 'num', en: 'five', he: 'חמש', cat: 'numbers', layer: 1, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], emoji: '5️⃣', vis: 0.97, ex: 'It is five minutes away.', exHe: 'זה במרחק חמש דקות.' },
  { slug: 'six', kind: 'number', pos: 'num', en: 'six', he: 'שש', cat: 'numbers', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 5, 4, 4], emoji: '6️⃣', vis: 0.97, ex: 'Room six.', exHe: 'חדר שש.' },
  { slug: 'seven', kind: 'number', pos: 'num', en: 'seven', he: 'שבע', cat: 'numbers', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 5, 4, 4], emoji: '7️⃣', vis: 0.97, ex: 'Breakfast is at seven.', exHe: 'ארוחת הבוקר בשבע.' },
  { slug: 'eight', kind: 'number', pos: 'num', en: 'eight', he: 'שמונה', cat: 'numbers', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 5, 4, 4], emoji: '8️⃣', vis: 0.97, ex: 'Gate eight.', exHe: 'שער שמונה.' },
  { slug: 'nine', kind: 'number', pos: 'num', en: 'nine', he: 'תשע', cat: 'numbers', layer: 2, rof: 2, skill: 'recall', s: [4, 4, 5, 4, 4], emoji: '9️⃣', vis: 0.97, ex: 'Nine euros.', exHe: 'תשעה יורו.' },
  { slug: 'ten', kind: 'number', pos: 'num', en: 'ten', he: 'עשר', cat: 'numbers', layer: 1, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], emoji: '🔟', vis: 0.97, ex: 'Ten percent tip.', exHe: 'טיפ של עשרה אחוזים.' },
  { slug: 'eleven', kind: 'number', pos: 'num', en: 'eleven', he: 'אחת עשרה', cat: 'numbers', layer: 2, rof: 2, skill: 'recognize', s: [3, 3, 4, 3, 3], ex: 'Checkout is at eleven.', exHe: 'העזיבה באחת עשרה.' },
  { slug: 'twelve', kind: 'number', pos: 'num', en: 'twelve', he: 'שתים עשרה', cat: 'numbers', layer: 2, rof: 2, skill: 'recognize', s: [3, 3, 4, 3, 3], ex: 'Lunch at twelve.', exHe: 'צהריים בשתים עשרה.' },
  { slug: 'twenty', kind: 'number', pos: 'num', en: 'twenty', he: 'עשרים', cat: 'numbers', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 5, 4, 4], ex: 'Twenty euros, please.', exHe: 'עשרים יורו, בבקשה.' },
  { slug: 'fifty', kind: 'number', pos: 'num', en: 'fifty', he: 'חמישים', cat: 'numbers', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 5, 4, 4], ex: 'It costs fifty.', exHe: 'זה עולה חמישים.' },
  { slug: 'hundred', kind: 'number', pos: 'num', en: 'hundred', he: 'מאה', cat: 'numbers', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 5, 4, 4], ex: 'One hundred shekels.', exHe: 'מאה שקלים.' },
  { slug: 'thousand', kind: 'number', pos: 'num', en: 'thousand', he: 'אלף', cat: 'numbers', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 4, 3, 3], ex: 'A thousand people were there.', exHe: 'אלף אנשים היו שם.' },
  { slug: 'half', kind: 'number', pos: 'num', en: 'half', he: 'חצי', cat: 'numbers', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 5, 4, 4], ex: 'Half past nine.', exHe: 'תשע וחצי.' },

  // ── Time (28) ──────────────────────────────────────────────────────────────
  { slug: 'now', pos: 'adv', en: 'now', he: 'עכשיו', cat: 'time', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], ex: 'I need it now.', exHe: 'אני צריך את זה עכשיו.', opp: ['later'] },
  { slug: 'later', pos: 'adv', en: 'later', he: 'אחר כך', cat: 'time', layer: 1, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], ex: 'Come back later.', exHe: 'תחזור אחר כך.', opp: ['now'] },
  { slug: 'today', pos: 'adv', en: 'today', he: 'היום', cat: 'time', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], ex: 'Is it open today?', exHe: 'זה פתוח היום?' },
  { slug: 'tomorrow', pos: 'adv', en: 'tomorrow', he: 'מחר', cat: 'time', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], ex: 'We leave tomorrow.', exHe: 'אנחנו עוזבים מחר.', opp: ['yesterday'] },
  { slug: 'yesterday', pos: 'adv', en: 'yesterday', he: 'אתמול', cat: 'time', layer: 2, rof: 1, skill: 'recall', s: [4, 4, 4, 4, 3], ex: 'We arrived yesterday.', exHe: 'הגענו אתמול.', opp: ['tomorrow'] },
  { slug: 'morning', pos: 'noun', en: 'morning', he: 'בוקר', cat: 'time', layer: 2, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], ex: 'Tomorrow morning at eight.', exHe: 'מחר בבוקר בשמונה.', opp: ['evening'] },
  { slug: 'afternoon', pos: 'noun', en: 'afternoon', he: 'אחר הצהריים', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 4, 3], ex: 'Closed in the afternoon.', exHe: 'סגור אחר הצהריים.' },
  { slug: 'evening', pos: 'noun', en: 'evening', he: 'ערב', cat: 'time', layer: 2, rof: 2, skill: 'recall', s: [5, 4, 5, 4, 4], ex: 'A table for this evening.', exHe: 'שולחן להערב.', opp: ['morning'] },
  { slug: 'night', pos: 'noun', en: 'night', he: 'לילה', cat: 'time', layer: 2, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 5], ex: 'Two nights, please.', exHe: 'שני לילות, בבקשה.', opp: ['day'] },
  { slug: 'day', pos: 'noun', en: 'day', he: 'יום', cat: 'time', layer: 2, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 5], ex: 'Three days in the city.', exHe: 'שלושה ימים בעיר.', opp: ['night'] },
  { slug: 'week', pos: 'noun', en: 'week', he: 'שבוע', cat: 'time', layer: 2, rof: 1, skill: 'recall', s: [5, 4, 4, 4, 4], ex: 'One week in Italy.', exHe: 'שבוע אחד באיטליה.' },
  { slug: 'month', pos: 'noun', en: 'month', he: 'חודש', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 3], ex: 'Next month.', exHe: 'בחודש הבא.' },
  { slug: 'year', pos: 'noun', en: 'year', he: 'שנה', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 4, 3, 3], ex: 'Happy new year!', exHe: 'שנה טובה!' },
  { slug: 'hour', pos: 'noun', en: 'hour', he: 'שעה', cat: 'time', layer: 2, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], ex: 'The tour is one hour.', exHe: 'הסיור הוא שעה אחת.' },
  { slug: 'minute', pos: 'noun', en: 'minute', he: 'דקה', cat: 'time', layer: 2, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], ex: 'Five minutes on foot.', exHe: 'חמש דקות ברגל.' },
  { slug: 'time', pos: 'noun', en: 'time', he: 'זמן', cat: 'time', layer: 2, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], ex: 'We have no time.', exHe: 'אין לנו זמן.' },
  { slug: 'late', pos: 'adj', en: 'late', he: 'מאוחר', cat: 'time', layer: 2, rof: 2, skill: 'recall', s: [5, 4, 5, 4, 4], ex: 'The bus is late.', exHe: 'האוטובוס מאחר.', opp: ['early'] },
  { slug: 'early', pos: 'adj', en: 'early', he: 'מוקדם', cat: 'time', layer: 2, rof: 1, skill: 'recall', s: [4, 3, 4, 4, 3], ex: 'We arrived early.', exHe: 'הגענו מוקדם.', opp: ['late'] },
  { slug: 'soon', pos: 'adv', en: 'soon', he: 'בקרוב', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 5, 4, 3], ex: 'The train comes soon.', exHe: 'הרכבת מגיעה בקרוב.' },
  { slug: 'always', pos: 'adv', en: 'always', he: 'תמיד', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 4, 3, 2], ex: 'It is always open.', exHe: 'זה תמיד פתוח.', opp: ['never'] },
  { slug: 'never', pos: 'adv', en: 'never', he: 'אף פעם', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 4, 3, 2], ex: 'I never eat meat.', exHe: 'אני אף פעם לא אוכל בשר.', opp: ['always'] },
  { slug: 'weekend', pos: 'noun', en: 'weekend', he: 'סוף שבוע', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 3], ex: 'Closed on the weekend.', exHe: 'סגור בסוף השבוע.' },
  { slug: 'monday', pos: 'noun', en: 'Monday', he: 'יום שני', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 5, 3, 3], ex: 'Closed on Monday.', exHe: 'סגור ביום שני.' },
  { slug: 'tuesday', pos: 'noun', en: 'Tuesday', he: 'יום שלישי', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 4, 3, 3], ex: 'The market is on Tuesday.', exHe: 'השוק ביום שלישי.' },
  { slug: 'wednesday', pos: 'noun', en: 'Wednesday', he: 'יום רביעי', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 4, 3, 3], ex: 'We fly on Wednesday.', exHe: 'אנחנו טסים ביום רביעי.' },
  { slug: 'thursday', pos: 'noun', en: 'Thursday', he: 'יום חמישי', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 4, 3, 3], ex: 'Until Thursday.', exHe: 'עד יום חמישי.' },
  { slug: 'friday', pos: 'noun', en: 'Friday', he: 'יום שישי', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 3], ex: 'Friday evening.', exHe: 'ערב שישי.' },
  { slug: 'saturday', pos: 'noun', en: 'Saturday', he: 'יום שבת', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 3], ex: 'Open on Saturday?', exHe: 'פתוח בשבת?' },
  { slug: 'sunday', pos: 'noun', en: 'Sunday', he: 'יום ראשון', cat: 'time', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 3], ex: 'Everything is closed on Sunday.', exHe: 'הכול סגור ביום ראשון.' },

  // ── Colors (10) ────────────────────────────────────────────────────────────
  { slug: 'red', pos: 'adj', en: 'red', he: 'אדום', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 3], emoji: '🔴', vis: 0.9, ex: 'The red bus.', exHe: 'האוטובוס האדום.' },
  { slug: 'blue', pos: 'adj', en: 'blue', he: 'כחול', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 3], emoji: '🔵', vis: 0.9, ex: 'The blue line.', exHe: 'הקו הכחול.' },
  { slug: 'green', pos: 'adj', en: 'green', he: 'ירוק', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 4, 3, 3], emoji: '🟢', vis: 0.9, ex: 'Cross on green.', exHe: 'חוצים בירוק.' },
  { slug: 'yellow', pos: 'adj', en: 'yellow', he: 'צהוב', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 2], emoji: '🟡', vis: 0.9, ex: 'The yellow taxi.', exHe: 'המונית הצהובה.' },
  { slug: 'black', pos: 'adj', en: 'black', he: 'שחור', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 2], emoji: '⚫', vis: 0.9, ex: 'Black coffee, please.', exHe: 'קפה שחור, בבקשה.', opp: ['white'] },
  { slug: 'white', pos: 'adj', en: 'white', he: 'לבן', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [4, 3, 3, 2, 2], emoji: '⚪', vis: 0.9, ex: 'White wine.', exHe: 'יין לבן.', opp: ['black'] },
  { slug: 'orange', pos: 'adj', en: 'orange', he: 'כתום', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 2], emoji: '🟠', vis: 0.88, ex: 'The orange building.', exHe: 'הבניין הכתום.' },
  { slug: 'pink', pos: 'adj', en: 'pink', he: 'ורוד', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 2], emoji: '💗', vis: 0.8, ex: 'The pink dress.', exHe: 'השמלה הוורודה.' },
  { slug: 'brown', pos: 'adj', en: 'brown', he: 'חום', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [3, 2, 3, 2, 2], emoji: '🟤', vis: 0.88, ex: 'The brown bag.', exHe: 'התיק החום.' },
  { slug: 'purple', pos: 'adj', en: 'purple', he: 'סגול', cat: 'colors', layer: 2, rof: 1, skill: 'recognize', s: [2, 2, 3, 2, 2], emoji: '🟣', vis: 0.88, ex: 'The purple line.', exHe: 'הקו הסגול.' },
];
