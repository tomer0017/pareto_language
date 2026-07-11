import type { CorpusRow } from '../types.js';

/**
 * Conversation glue + question words + pronouns — the "never freeze" layer of the corpus.
 *
 * Grounded in docs/EXPRESSION-RESEARCH.md: short reactive replies a traveler constantly hears
 * or says. Meanings already owned by the Bootcamp concept set (missions-core.yaml) are NOT
 * duplicated here: thank-you, sorry, I-don't-understand, repeat, slowly, one-moment, how-much
 * stay canonical there (concept-first: one meaning, one concept).
 */
export const GLUE: CorpusRow[] = [
  // ── Glue words & replies (40) ──────────────────────────────────────────────
  { slug: 'yes', pos: 'interj', en: 'yes', he: 'כן', cat: 'glue', layer: 1, rof: 2, skill: 'fluent', role: 'say', s: [5, 5, 5, 5, 5], ex: 'Yes, please.', exHe: 'כן, בבקשה.', opp: ['no'] },
  { slug: 'no', pos: 'interj', en: 'no', he: 'לא', cat: 'glue', layer: 1, rof: 2, skill: 'fluent', role: 'say', s: [5, 5, 5, 5, 5], ex: 'No, thank you.', exHe: 'לא, תודה.', opp: ['yes'] },
  { slug: 'please', pos: 'interj', en: 'please', he: 'בבקשה', cat: 'glue', layer: 1, rof: 2, skill: 'fluent', role: 'say', s: [5, 5, 4, 5, 5], ex: 'One ticket, please.', exHe: 'כרטיס אחד, בבקשה.' },
  { slug: 'okay', pos: 'interj', en: 'okay', he: 'בסדר', cat: 'glue', layer: 1, rof: 2, skill: 'fluent', role: 'say', s: [5, 5, 5, 5, 5], ex: 'Okay, no problem.', exHe: 'בסדר, אין בעיה.', alias: ['OK'] },
  { slug: 'hello', pos: 'interj', en: 'hello', he: 'שלום', cat: 'glue', layer: 1, rof: 2, skill: 'fluent', role: 'say', s: [5, 5, 5, 5, 5], ex: 'Hello! A table for two?', exHe: 'שלום! שולחן לשניים?', alias: ['hi'] },
  { slug: 'goodbye', pos: 'interj', en: 'goodbye', he: 'להתראות', cat: 'glue', layer: 1, rof: 1, skill: 'recall', role: 'say', s: [5, 5, 4, 5, 4], ex: 'Goodbye, and thanks!', exHe: 'להתראות, ותודה!', alias: ['bye'] },
  { slug: 'good-morning', kind: 'phrase', pos: 'phrase', en: 'Good morning.', he: 'בוקר טוב', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [5, 4, 5, 4, 4], ex: 'Good morning! Breakfast, please.', exHe: 'בוקר טוב! ארוחת בוקר, בבקשה.' },
  { slug: 'good-evening', kind: 'phrase', pos: 'phrase', en: 'Good evening.', he: 'ערב טוב', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [4, 4, 4, 4, 4], ex: 'Good evening! We have a reservation.', exHe: 'ערב טוב! יש לנו הזמנה.' },
  { slug: 'good-night', kind: 'phrase', pos: 'phrase', en: 'Good night.', he: 'לילה טוב', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [4, 3, 4, 3, 3], ex: 'Good night, see you tomorrow.', exHe: 'לילה טוב, נתראה מחר.' },
  { slug: 'youre-welcome', kind: 'reply', pos: 'phrase', en: "You're welcome.", he: 'על לא דבר', cat: 'glue', layer: 2, rof: 1, skill: 'recognize', role: 'hear', s: [5, 3, 5, 5, 4], ex: '"Thank you!" — "You\'re welcome."', exHe: '"תודה!" — "על לא דבר."' },
  { slug: 'sounds-good', kind: 'reply', pos: 'phrase', en: 'Sounds good.', he: 'נשמע טוב', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [5, 5, 5, 5, 4], ex: '"Pizza tonight?" — "Sounds good!"', exHe: '"פיצה הערב?" — "נשמע טוב!"' },
  { slug: 'no-worries', kind: 'reply', pos: 'phrase', en: 'No worries.', he: 'אל דאגה', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [5, 4, 5, 5, 4], ex: '"Sorry, we are late." — "No worries."', exHe: '"סליחה, איחרנו." — "אל דאגה."' },
  { slug: 'never-mind', kind: 'reply', pos: 'phrase', en: 'Never mind.', he: 'לא משנה', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'recovery', s: [4, 5, 4, 5, 4], ex: 'Never mind, thank you anyway.', exHe: 'לא משנה, תודה בכל זאת.' },
  { slug: 'of-course', kind: 'reply', pos: 'phrase', en: 'Of course.', he: 'כמובן', cat: 'glue', layer: 2, rof: 1, skill: 'recognize', role: 'hear', s: [5, 4, 5, 5, 4], ex: '"Can I sit here?" — "Of course."', exHe: '"אפשר לשבת כאן?" — "כמובן."' },
  { slug: 'thats-fine', kind: 'reply', pos: 'phrase', en: "That's fine.", he: 'זה בסדר', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [5, 5, 5, 5, 4], ex: '"Only card, no cash." — "That\'s fine."', exHe: '"רק כרטיס, בלי מזומן." — "זה בסדר."' },
  { slug: 'up-to-you', kind: 'reply', pos: 'phrase', en: "It's up to you.", he: 'זה תלוי בך', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [4, 4, 4, 4, 3], ex: '"Inside or outside?" — "It\'s up to you."', exHe: '"בפנים או בחוץ?" — "זה תלוי בך."' },
  { slug: 'im-not-sure', kind: 'reply', pos: 'phrase', en: "I'm not sure.", he: 'אני לא בטוח', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [4, 5, 4, 5, 4], ex: "I'm not sure. Maybe at nine.", exHe: 'אני לא בטוח. אולי בתשע.' },
  { slug: 'maybe', pos: 'adv', en: 'maybe', he: 'אולי', cat: 'glue', layer: 1, rof: 2, skill: 'recall', role: 'say', s: [5, 5, 4, 5, 4], ex: 'Maybe tomorrow.', exHe: 'אולי מחר.' },
  { slug: 'maybe-later', kind: 'reply', pos: 'phrase', en: 'Maybe later.', he: 'אולי אחר כך', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [4, 4, 4, 4, 4], ex: '"Dessert?" — "Maybe later."', exHe: '"קינוח?" — "אולי אחר כך."' },
  { slug: 'here-you-go', kind: 'reply', pos: 'phrase', en: 'Here you go.', he: 'הנה, בבקשה', cat: 'glue', layer: 1, rof: 2, skill: 'recognize', role: 'hear', s: [5, 3, 5, 5, 5], ex: '"Here you go." — "Thank you!"', exHe: '"הנה, בבקשה." — "תודה!"' },
  { slug: 'go-ahead', kind: 'reply', pos: 'phrase', en: 'Go ahead.', he: 'בבקשה, קדימה', cat: 'glue', layer: 2, rof: 1, skill: 'recognize', role: 'hear', s: [4, 3, 5, 4, 4], ex: '"Can I ask something?" — "Go ahead."', exHe: '"אפשר לשאול משהו?" — "בבקשה, קדימה."' },
  { slug: 'take-your-time', kind: 'reply', pos: 'phrase', en: 'Take your time.', he: 'קח את הזמן', cat: 'glue', layer: 2, rof: 1, skill: 'recognize', role: 'hear', s: [4, 2, 5, 4, 4], ex: '"One minute…" — "Take your time."', exHe: '"רגע אחד…" — "קח את הזמן."' },
  { slug: 'me-too', kind: 'reply', pos: 'phrase', en: 'Me too.', he: 'גם אני', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [5, 4, 4, 4, 3], ex: '"I love this city." — "Me too!"', exHe: '"אני אוהב את העיר הזאת." — "גם אני!"' },
  { slug: 'really', pos: 'interj', en: 'really', he: 'באמת', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [5, 4, 5, 4, 3], ex: 'Really? That is great!', exHe: 'באמת? זה מעולה!' },
  { slug: 'great', pos: 'interj', en: 'great', he: 'מעולה', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [5, 5, 5, 5, 4], ex: 'Great, thank you!', exHe: 'מעולה, תודה!' },
  { slug: 'no-problem', kind: 'reply', pos: 'phrase', en: 'No problem.', he: 'אין בעיה', cat: 'glue', layer: 2, rof: 2, skill: 'recognize', role: 'hear', s: [5, 4, 5, 5, 4], ex: '"Can we pay separately?" — "No problem."', exHe: '"אפשר לשלם בנפרד?" — "אין בעיה."' },
  { slug: 'i-dont-know', kind: 'reply', pos: 'phrase', en: "I don't know.", he: 'אני לא יודע', cat: 'glue', layer: 1, rof: 2, skill: 'recall', role: 'say', s: [5, 5, 4, 5, 4], ex: "I don't know. Let's ask.", exHe: 'אני לא יודע. בוא נשאל.' },
  { slug: 'lets-go', kind: 'reply', pos: 'phrase', en: "Let's go.", he: 'בוא נלך', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [5, 4, 4, 4, 4], ex: "The taxi is here. Let's go!", exHe: 'המונית כאן. בוא נלך!' },
  { slug: 'see-you-later', kind: 'reply', pos: 'phrase', en: 'See you later.', he: 'נתראה', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [5, 4, 4, 4, 3], ex: 'See you later at the hotel.', exHe: 'נתראה אחר כך במלון.' },
  { slug: 'have-a-nice-day', kind: 'reply', pos: 'phrase', en: 'Have a nice day.', he: 'שיהיה לך יום נעים', cat: 'glue', layer: 2, rof: 1, skill: 'recognize', role: 'hear', s: [5, 3, 5, 5, 4], ex: '"Have a nice day!" — "You too!"', exHe: '"שיהיה לך יום נעים!" — "גם לך!"' },
  { slug: 'cheers', pos: 'interj', en: 'cheers', he: 'לחיים', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [4, 3, 4, 2, 3], ex: 'Cheers! To the trip!', exHe: 'לחיים! לכבוד הטיול!' },
  { slug: 'congratulations', pos: 'interj', en: 'congratulations', he: 'מזל טוב', cat: 'glue', layer: 2, rof: 1, skill: 'recognize', role: 'say', s: [3, 3, 3, 2, 2], ex: 'Congratulations!', exHe: 'מזל טוב!' },
  { slug: 'thats-all', kind: 'reply', pos: 'phrase', en: "That's all.", he: 'זה הכול', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [4, 5, 4, 4, 4], ex: '"Anything else?" — "That\'s all, thanks."', exHe: '"עוד משהו?" — "זה הכול, תודה."' },
  { slug: 'nothing-else', kind: 'reply', pos: 'phrase', en: 'Nothing else.', he: 'שום דבר נוסף', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [3, 4, 3, 3, 3], ex: 'Nothing else, just the coffee.', exHe: 'שום דבר נוסף, רק הקפה.' },
  { slug: 'just-looking', kind: 'reply', pos: 'phrase', en: "I'm just looking.", he: 'אני רק מסתכל', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [4, 5, 3, 3, 4], ex: '"Can I help you?" — "I\'m just looking."', exHe: '"אפשר לעזור?" — "אני רק מסתכל."' },
  { slug: 'excuse-me', kind: 'phrase', pos: 'phrase', en: 'Excuse me.', he: 'סליחה, אפשר?', cat: 'glue', layer: 1, rof: 2, skill: 'fluent', role: 'say', s: [5, 5, 4, 5, 5], ex: 'Excuse me, where is the exit?', exHe: 'סליחה, איפה היציאה?' },
  { slug: 'one-more', kind: 'reply', pos: 'phrase', en: 'One more, please.', he: 'עוד אחד, בבקשה', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [4, 5, 3, 4, 4], ex: 'One more, please. It was great.', exHe: 'עוד אחד, בבקשה. זה היה מעולה.' },
  { slug: 'to-go', kind: 'reply', pos: 'phrase', en: 'To go, please.', he: 'לקחת, בבקשה', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [4, 5, 4, 3, 4], ex: 'A coffee to go, please.', exHe: 'קפה לקחת, בבקשה.', alias: ['takeaway'] },
  { slug: 'enough', pos: 'interj', en: 'enough', he: 'מספיק', cat: 'glue', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [4, 4, 3, 4, 3], ex: "That's enough, thank you.", exHe: 'זה מספיק, תודה.' },
  { slug: 'and-you', kind: 'reply', pos: 'phrase', en: 'And you?', he: 'ואתה?', cat: 'glue', layer: 2, rof: 1, skill: 'recall', role: 'say', s: [5, 4, 4, 4, 3], ex: '"I\'m fine. And you?"', exHe: '"אני בסדר. ואתה?"' },

  // ── Question words (10) ────────────────────────────────────────────────────
  { slug: 'where', pos: 'adv', en: 'where', he: 'איפה', cat: 'questions', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], ex: 'Where is the exit?', exHe: 'איפה היציאה?' },
  { slug: 'when', pos: 'adv', en: 'when', he: 'מתי', cat: 'questions', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], ex: 'When does it open?', exHe: 'מתי זה נפתח?' },
  { slug: 'what', pos: 'pron', en: 'what', he: 'מה', cat: 'questions', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 4], ex: 'What is this?', exHe: 'מה זה?' },
  { slug: 'who', pos: 'pron', en: 'who', he: 'מי', cat: 'questions', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 5, 4, 3], ex: 'Who is next?', exHe: 'מי הבא בתור?' },
  { slug: 'why', pos: 'adv', en: 'why', he: 'למה', cat: 'questions', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 5, 4, 3], ex: 'Why is it closed?', exHe: 'למה זה סגור?' },
  { slug: 'how', pos: 'adv', en: 'how', he: 'איך', cat: 'questions', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], ex: 'How do I get to the beach?', exHe: 'איך מגיעים לחוף?' },
  { slug: 'which', pos: 'pron', en: 'which', he: 'איזה', cat: 'questions', layer: 2, rof: 2, skill: 'recognize', s: [4, 3, 5, 4, 4], ex: 'Which gate?', exHe: 'איזה שער?' },
  { slug: 'how-many', kind: 'phrase', pos: 'phrase', en: 'How many?', he: 'כמה?', cat: 'questions', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [4, 4, 5, 4, 4], ex: '"How many people?" — "Two."', exHe: '"כמה אנשים?" — "שניים."' },
  { slug: 'what-time', kind: 'phrase', pos: 'phrase', en: 'What time?', he: 'באיזו שעה?', cat: 'questions', layer: 1, rof: 2, skill: 'recall', role: 'say', s: [5, 5, 5, 5, 5], ex: 'What time is checkout?', exHe: 'באיזו שעה העזיבה?' },
  { slug: 'how-long', kind: 'phrase', pos: 'phrase', en: 'How long?', he: 'כמה זמן?', cat: 'questions', layer: 2, rof: 2, skill: 'recall', role: 'say', s: [4, 4, 4, 4, 4], ex: 'How long is the ride?', exHe: 'כמה זמן הנסיעה?' },

  // ── Pronouns & determiners (11) ────────────────────────────────────────────
  { slug: 'i', pos: 'pron', en: 'I', he: 'אני', cat: 'pronouns', layer: 1, rof: 2, skill: 'fluent', s: [5, 5, 5, 5, 4], ex: 'I want a coffee.', exHe: 'אני רוצה קפה.' },
  { slug: 'you', pos: 'pron', en: 'you', he: 'אתה', cat: 'pronouns', layer: 1, rof: 2, skill: 'recall', s: [5, 4, 5, 5, 4], ex: 'You are very kind.', exHe: 'אתה מאוד אדיב.' },
  { slug: 'he', pos: 'pron', en: 'he', he: 'הוא', cat: 'pronouns', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 5, 4, 3], ex: 'He is my friend.', exHe: 'הוא חבר שלי.', opp: ['she'] },
  { slug: 'she', pos: 'pron', en: 'she', he: 'היא', cat: 'pronouns', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 5, 4, 3], ex: 'She speaks English.', exHe: 'היא מדברת אנגלית.', opp: ['he'] },
  { slug: 'it', pos: 'pron', en: 'it', he: 'זה', cat: 'pronouns', layer: 2, rof: 1, skill: 'recognize', s: [5, 4, 5, 5, 3], ex: 'It is very good.', exHe: 'זה טוב מאוד.' },
  { slug: 'we', pos: 'pron', en: 'we', he: 'אנחנו', cat: 'pronouns', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 4, 5, 4], ex: 'We have a reservation.', exHe: 'יש לנו הזמנה.' },
  { slug: 'they', pos: 'pron', en: 'they', he: 'הם', cat: 'pronouns', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 4, 4, 3], ex: 'They are with me.', exHe: 'הם איתי.' },
  { slug: 'this', pos: 'pron', en: 'this', he: 'זה (הזה)', cat: 'pronouns', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 5, 5, 5], ex: 'This one, please.', exHe: 'את זה, בבקשה.', opp: ['that'] },
  { slug: 'that', pos: 'pron', en: 'that', he: 'ההוא', cat: 'pronouns', layer: 2, rof: 1, skill: 'recall', s: [5, 4, 5, 4, 4], ex: 'That one over there.', exHe: 'ההוא שם.', opp: ['this'] },
  { slug: 'my', pos: 'det', en: 'my', he: 'שלי', cat: 'pronouns', layer: 1, rof: 2, skill: 'recall', s: [5, 5, 4, 5, 4], ex: 'This is my bag.', exHe: 'זה התיק שלי.', opp: ['your'] },
  { slug: 'your', pos: 'det', en: 'your', he: 'שלך', cat: 'pronouns', layer: 2, rof: 1, skill: 'recognize', s: [5, 3, 5, 4, 3], ex: 'Your passport, please.', exHe: 'הדרכון שלך, בבקשה.', opp: ['my'] },
];
