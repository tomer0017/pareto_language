import type { ZeroChunk, ZeroModule, ZeroPath } from './types.js';

/**
 * "מתחילים מאפס" content — the ONE authored source for the zero-beginner path (en / fr / es).
 *
 * Every chunk is a real, natural utterance in each language (correct politeness, contractions and
 * gender — NOT a word-for-word map of the Hebrew gloss) and earns its place by being needed in a
 * traveller's first interactions, by generating many more sentences, or by keeping a conversation
 * alive when it breaks down. Concept ids link to the existing Foundation corpus so progress syncs;
 * chunks the corpus has no single concept for (e.g. "thank you") simply omit it. Keep this list tight
 * — prefer fewer excellent bricks over filler (see the content-budget rules in the mission).
 *
 * `{name}` (the learner's saved name) and `{targetLangName}` (the learning language's own name in the
 * app language, e.g. "צרפתית") are substituted at RENDER time — the gloss always matches the exact
 * sentence shown for the active language (never a partial/wrong translation).
 */

/** Compact chunk constructor: `c(id, {en,fr,es}, heGloss, enGloss, emoji?, conceptId?)`. */
function c(
  id: string,
  target: { en: string; fr: string; es: string },
  he: string,
  en: string,
  emoji?: string,
  conceptId?: string,
): ZeroChunk {
  return { id, target, tr: { en, he }, emoji, conceptId };
}

const CHUNK_LIST: ZeroChunk[] = [
  // ── Module 1 — First contact ──────────────────────────────────────────
  c('hello', { en: 'Hello.', fr: 'Bonjour.', es: 'Hola.' }, 'שלום.', 'Hello.', '👋', 'concept.word.hello'),
  c('thanks', { en: 'Thank you.', fr: 'Merci.', es: 'Gracias.' }, 'תודה.', 'Thank you.', '🙏'),
  c('please', { en: 'Please.', fr: "S’il vous plaît.", es: 'Por favor.' }, 'בבקשה.', 'Please.', '🙂', 'concept.word.please'),
  c('yes', { en: 'Yes.', fr: 'Oui.', es: 'Sí.' }, 'כן.', 'Yes.', '✅', 'concept.word.yes'),
  c('no', { en: 'No.', fr: 'Non.', es: 'No.' }, 'לא.', 'No.', '⛔', 'concept.word.no'),
  c('excuse', { en: 'Excuse me.', fr: 'Excusez-moi.', es: 'Perdón.' }, 'סליחה.', 'Excuse me.', '🙋', 'concept.phrase.excuse-me'),
  c('goodbye', { en: 'Goodbye.', fr: 'Au revoir.', es: 'Adiós.' }, 'להתראות.', 'Goodbye.', '👋', 'concept.word.goodbye'),
  c('goodmorning', { en: 'Good morning.', fr: 'Bonjour.', es: 'Buenos días.' }, 'בוקר טוב.', 'Good morning.', '🌅', 'concept.phrase.good-morning'),

  // ── Module 2 — Me and my identity ─────────────────────────────────────
  c('myname', { en: 'My name is {name}.', fr: 'Je m’appelle {name}.', es: 'Me llamo {name}.' }, 'קוראים לי {name}.', 'My name is {name}.', '🙂', 'concept.word.name'),
  c('hello_myname', { en: 'Hello, my name is {name}.', fr: 'Bonjour, je m’appelle {name}.', es: 'Hola, me llamo {name}.' }, 'שלום, קוראים לי {name}.', 'Hello, my name is {name}.', '👋'),
  c('from_israel', { en: 'I am from Israel.', fr: 'Je viens d’Israël.', es: 'Soy de Israel.' }, 'אני מישראל.', 'I am from Israel.', '🌍'),
  // Each TARGET hardcodes the language name in its OWN language (so the audio is right); only the
  // GLOSS uses {targetLangName}, resolved to the app-language name (e.g. "צרפתית") at render.
  c('speak_little', { en: 'I speak a little English.', fr: 'Je parle un peu français.', es: 'Hablo un poco de español.' }, 'אני מדבר/ת קצת {targetLangName}.', 'I speak a little {targetLangName}.', '🗣️', 'concept.word.speak'),
  c('nice_meet', { en: 'Nice to meet you.', fr: 'Enchanté.', es: 'Mucho gusto.' }, 'נעים מאוד.', 'Nice to meet you.', '🤝'),

  // ── Module 3 — Wants and needs ────────────────────────────────────────
  c('water', { en: 'water', fr: 'de l’eau', es: 'agua' }, 'מים', 'water', '💧', 'concept.word.water'),
  c('coffee', { en: 'coffee', fr: 'un café', es: 'un café' }, 'קפה', 'coffee', '☕', 'concept.word.coffee'),
  c('want_water', { en: 'I want water.', fr: 'Je voudrais de l’eau.', es: 'Quiero agua.' }, 'אני רוצה מים.', 'I want water.', '💧', 'concept.word.want'),
  c('coffee_please', { en: 'I would like a coffee, please.', fr: 'Je voudrais un café, s’il vous plaît.', es: 'Quiero un café, por favor.' }, 'אני רוצה קפה, בבקשה.', 'I would like a coffee, please.', '☕', 'concept.word.coffee'),
  c('coffee_milk', { en: 'a coffee with milk', fr: 'un café au lait', es: 'un café con leche' }, 'קפה עם חלב', 'a coffee with milk', '🥛', 'concept.word.with'),
  c('need_help', { en: 'I need help.', fr: 'J’ai besoin d’aide.', es: 'Necesito ayuda.' }, 'אני צריך/ה עזרה.', 'I need help.', '🆘', 'concept.word.help'),

  // ── Module 4 — Finding things ─────────────────────────────────────────
  c('bathroom', { en: 'the bathroom', fr: 'les toilettes', es: 'el baño' }, 'השירותים', 'the bathroom', '🚻', 'concept.word.bathroom'),
  c('station', { en: 'the station', fr: 'la gare', es: 'la estación' }, 'התחנה', 'the station', '🚉', 'concept.word.station'),
  c('hotel', { en: 'the hotel', fr: 'l’hôtel', es: 'el hotel' }, 'המלון', 'the hotel', '🏨', 'concept.word.hotel'),
  c('where_bathroom', { en: 'Where is the bathroom?', fr: 'Où sont les toilettes ?', es: '¿Dónde está el baño?' }, 'איפה השירותים?', 'Where is the bathroom?', '🚻', 'concept.word.where'),
  c('excuse_where_station', { en: 'Excuse me, where is the station?', fr: 'Excusez-moi, où est la gare ?', es: 'Perdón, ¿dónde está la estación?' }, 'סליחה, איפה התחנה?', 'Excuse me, where is the station?', '🚉', 'concept.word.station'),
  c('here', { en: 'Here.', fr: 'Ici.', es: 'Aquí.' }, 'כאן.', 'Here.', '📍', 'concept.word.here'),
  c('where_exit', { en: 'Where is the exit?', fr: 'Où est la sortie ?', es: '¿Dónde está la salida?' }, 'איפה היציאה?', 'Where is the exit?', '🚪', 'concept.word.exit'),

  // ── Module 5 — Buying and paying ──────────────────────────────────────
  c('this', { en: 'this', fr: 'ça', es: 'esto' }, 'זה', 'this', '👉', 'concept.word.this'),
  c('ticket', { en: 'a ticket', fr: 'un billet', es: 'un boleto' }, 'כרטיס', 'a ticket', '🎫', 'concept.word.ticket'),
  c('bag', { en: 'a bag', fr: 'un sac', es: 'una bolsa' }, 'תיק', 'a bag', '👜', 'concept.word.bag'),
  c('how_much_this', { en: 'How much is this?', fr: 'Ça coûte combien ?', es: '¿Cuánto cuesta esto?' }, 'כמה זה עולה?', 'How much is this?', '💰', 'concept.word.price'),
  c('one_please', { en: 'One, please.', fr: 'Un, s’il vous plaît.', es: 'Uno, por favor.' }, 'אחד, בבקשה.', 'One, please.', '1️⃣', 'concept.number.one'),
  c('by_card', { en: 'Can I pay by card?', fr: 'Je peux payer par carte ?', es: '¿Puedo pagar con tarjeta?' }, 'אפשר לשלם בכרטיס?', 'Can I pay by card?', '💳', 'concept.word.card'),
  c('thats_all', { en: 'That’s all, thank you.', fr: 'C’est tout, merci.', es: 'Eso es todo, gracias.' }, 'זה הכול, תודה.', 'That’s all, thank you.', '🧾', 'concept.reply.thats-all'),

  // ── Module 6 — Understanding & repair ─────────────────────────────────
  c('dont_understand', { en: 'Sorry, I don’t understand.', fr: 'Désolé, je ne comprends pas.', es: 'Perdón, no entiendo.' }, 'סליחה, אני לא מבין/ה.', 'Sorry, I don’t understand.', '😕', 'concept.word.understand'),
  c('slowly', { en: 'Can you speak slowly, please?', fr: 'Vous pouvez parler lentement, s’il vous plaît ?', es: '¿Puede hablar despacio, por favor?' }, 'אפשר לדבר לאט, בבקשה?', 'Can you speak slowly, please?', '🐢', 'concept.word.slow'),
  c('repeat', { en: 'Can you repeat?', fr: 'Vous pouvez répéter ?', es: '¿Puede repetir?' }, 'אפשר לחזור על זה?', 'Can you repeat?', '🔁'),
  c('speak_english', { en: 'Do you speak English?', fr: 'Vous parlez anglais ?', es: '¿Habla inglés?' }, 'אתם מדברים אנגלית?', 'Do you speak English?', '🇬🇧'),
  c('what_mean', { en: 'What does this mean?', fr: 'Qu’est-ce que ça veut dire ?', es: '¿Qué significa esto?' }, 'מה זה אומר?', 'What does this mean?', '❔', 'concept.word.what'),

  // ── Module 7 — Essential questions ────────────────────────────────────
  c('what_is_this', { en: 'What is this?', fr: 'Qu’est-ce que c’est ?', es: '¿Qué es esto?' }, 'מה זה?', 'What is this?', '❓', 'concept.word.what'),
  c('can_i_water', { en: 'Can I have some water?', fr: 'Je peux avoir de l’eau ?', es: '¿Puedo tener agua?' }, 'אפשר לקבל מים?', 'Can I have some water?', '💧', 'concept.word.can'),
  c('is_there_wifi', { en: 'Is there Wi-Fi?', fr: 'Il y a du wifi ?', es: '¿Hay wifi?' }, 'יש וויי-פיי?', 'Is there Wi-Fi?', '📶', 'concept.word.wifi'),
  c('where_hotel', { en: 'Where is the hotel?', fr: 'Où est l’hôtel ?', es: '¿Dónde está el hotel?' }, 'איפה המלון?', 'Where is the hotel?', '🏨', 'concept.word.hotel'),

  // ── Module 8 — Readiness checkpoint (NPC prompts; all replies are reused chunks) ──
  c('npc_order', { en: 'Hello, what would you like?', fr: 'Bonjour, vous désirez ?', es: 'Hola, ¿qué desea?' }, 'שלום, מה תרצה?', 'Hello, what would you like?', '🧑‍🍳'),
  c('npc_help', { en: 'Can I help you?', fr: 'Je peux vous aider ?', es: '¿Puedo ayudarle?' }, 'אפשר לעזור לך?', 'Can I help you?', '💁'),
  c('npc_fast', { en: 'The train leaves at nine from platform two.', fr: 'Le train part à neuf heures du quai deux.', es: 'El tren sale a las nueve del andén dos.' }, 'הרכבת יוצאת בתשע מרציף שתיים.', 'The train leaves at nine from platform two.', '🚆'),
];

export const ZERO_CHUNKS: Record<string, ZeroChunk> = Object.fromEntries(CHUNK_LIST.map((ch) => [ch.id, ch]));

/** Bilingual title/outcome helper. */
function tx(he: string, en: string) {
  return { he, en };
}

export const ZERO_MODULES: ZeroModule[] = [
  {
    id: 'm1',
    icon: '👋',
    title: tx('מפגש ראשון', 'First contact'),
    outcome: tx('אני יכול/ה לברך ולהגיב בנימוס.', 'I can greet someone and respond politely.'),
    masteryStart: 12,
    steps: [
      { kind: 'introduce', chunk: 'hello' },
      { kind: 'listen', chunk: 'hello', distractors: ['thanks', 'goodbye'] },
      { kind: 'introduce', chunk: 'goodmorning' },
      { kind: 'introduce', chunk: 'thanks' },
      { kind: 'recognize', chunk: 'thanks', distractors: ['please', 'goodbye'] },
      { kind: 'introduce', chunk: 'please' },
      { kind: 'recognize', chunk: 'please', distractors: ['thanks', 'excuse'] },
      { kind: 'introduce', chunk: 'yes' },
      { kind: 'introduce', chunk: 'no' },
      { kind: 'recognize', chunk: 'no', distractors: ['yes', 'goodbye'] },
      { kind: 'introduce', chunk: 'excuse' },
      { kind: 'introduce', chunk: 'goodbye' },
      // — mastery —
      { kind: 'listen', chunk: 'goodbye', distractors: ['hello', 'thanks'] },
      { kind: 'recognize', chunk: 'hello', distractors: ['please', 'goodbye'] },
      { kind: 'dialogue', npc: 'hello', answer: 'hello', distractors: ['thanks', 'goodbye'] },
    ],
  },
  {
    id: 'm2',
    icon: '🙂',
    title: tx('אני והזהות שלי', 'Me and my identity'),
    outcome: tx('אני יכול/ה להציג את עצמי.', 'I can introduce myself.'),
    masteryStart: 10,
    steps: [
      { kind: 'introduce', chunk: 'myname' },
      { kind: 'build', chunk: 'myname' },
      { kind: 'introduce', chunk: 'hello_myname' },
      { kind: 'build', chunk: 'hello_myname' },
      { kind: 'introduce', chunk: 'from_israel' },
      { kind: 'recognize', chunk: 'from_israel', distractors: ['speak_little', 'nice_meet'] },
      { kind: 'introduce', chunk: 'speak_little' },
      { kind: 'recognize', chunk: 'speak_little', distractors: ['from_israel', 'nice_meet'] },
      { kind: 'introduce', chunk: 'nice_meet' },
      // — mastery —
      { kind: 'cloze', chunk: 'from_israel', distractors: ['speak_little', 'nice_meet'] },
      { kind: 'listen', chunk: 'hello_myname', distractors: ['from_israel', 'nice_meet'] },
      { kind: 'recall', chunk: 'from_israel' },
      { kind: 'dialogue', npc: 'hello', answer: 'hello_myname', distractors: ['from_israel', 'nice_meet'] },
    ],
  },
  {
    id: 'm3',
    icon: '🙏',
    title: tx('רצונות וצרכים', 'Wants and needs'),
    outcome: tx('אני יכול/ה לבקש משהו שאני צריך/ה.', 'I can ask for something I need.'),
    masteryStart: 12,
    steps: [
      { kind: 'introduce', chunk: 'water' },
      { kind: 'picture', chunk: 'water', distractors: ['coffee', 'coffee_milk'] },
      { kind: 'introduce', chunk: 'coffee' },
      { kind: 'picture', chunk: 'coffee', distractors: ['water', 'coffee_milk'] },
      { kind: 'introduce', chunk: 'want_water' },
      { kind: 'build', chunk: 'want_water' },
      { kind: 'cloze', chunk: 'want_water', distractors: ['coffee', 'coffee_milk'] },
      { kind: 'introduce', chunk: 'coffee_please' },
      { kind: 'recognize', chunk: 'coffee_please', distractors: ['want_water', 'need_help'] },
      { kind: 'introduce', chunk: 'coffee_milk' },
      { kind: 'introduce', chunk: 'need_help' },
      { kind: 'recognize', chunk: 'need_help', distractors: ['want_water', 'coffee_please'] },
      // — mastery —
      { kind: 'listen', chunk: 'coffee_please', distractors: ['want_water', 'need_help'] },
      { kind: 'build', chunk: 'coffee_please' },
      { kind: 'dialogue', npc: 'npc_order', answer: 'coffee_please', distractors: ['need_help', 'water'] },
    ],
  },
  {
    id: 'm4',
    icon: '📍',
    title: tx('למצוא דברים', 'Finding things'),
    outcome: tx('אני יכול/ה לשאול איפה מקום חשוב.', 'I can ask where an essential place is.'),
    masteryStart: 12,
    steps: [
      { kind: 'introduce', chunk: 'bathroom' },
      { kind: 'picture', chunk: 'bathroom', distractors: ['station', 'hotel'] },
      { kind: 'introduce', chunk: 'station' },
      { kind: 'picture', chunk: 'station', distractors: ['bathroom', 'hotel'] },
      { kind: 'introduce', chunk: 'where_bathroom' },
      { kind: 'build', chunk: 'where_bathroom' },
      { kind: 'cloze', chunk: 'where_bathroom', distractors: ['station', 'hotel'] },
      { kind: 'introduce', chunk: 'excuse_where_station' },
      { kind: 'recognize', chunk: 'excuse_where_station', distractors: ['where_bathroom', 'where_exit'] },
      { kind: 'introduce', chunk: 'here' },
      { kind: 'introduce', chunk: 'where_exit' },
      { kind: 'recognize', chunk: 'where_exit', distractors: ['where_bathroom', 'here'] },
      // — mastery —
      { kind: 'listen', chunk: 'where_bathroom', distractors: ['where_exit', 'excuse_where_station'] },
      { kind: 'build', chunk: 'excuse_where_station' },
      { kind: 'dialogue', npc: 'npc_help', answer: 'where_bathroom', distractors: ['here', 'thanks'] },
    ],
  },
  {
    id: 'm5',
    icon: '💳',
    title: tx('לקנות ולשלם', 'Buying and paying'),
    outcome: tx('אני יכול/ה לשאול מחיר ולשלם.', 'I can ask the price and pay.'),
    masteryStart: 13,
    steps: [
      { kind: 'introduce', chunk: 'this' },
      { kind: 'introduce', chunk: 'how_much_this' },
      { kind: 'build', chunk: 'how_much_this' },
      { kind: 'cloze', chunk: 'how_much_this', distractors: ['one_please', 'by_card'] },
      { kind: 'introduce', chunk: 'ticket' },
      { kind: 'picture', chunk: 'ticket', distractors: ['bag', 'coffee'] },
      { kind: 'introduce', chunk: 'bag' },
      { kind: 'picture', chunk: 'bag', distractors: ['ticket', 'coffee'] },
      { kind: 'introduce', chunk: 'one_please' },
      { kind: 'introduce', chunk: 'by_card' },
      { kind: 'recognize', chunk: 'by_card', distractors: ['thats_all', 'how_much_this'] },
      { kind: 'introduce', chunk: 'thats_all' },
      { kind: 'recognize', chunk: 'thats_all', distractors: ['by_card', 'one_please'] },
      // — mastery —
      { kind: 'listen', chunk: 'by_card', distractors: ['how_much_this', 'thats_all'] },
      { kind: 'build', chunk: 'how_much_this' },
      { kind: 'dialogue', npc: 'npc_order', answer: 'how_much_this', distractors: ['thats_all', 'one_please'] },
    ],
  },
  {
    id: 'm6',
    icon: '🆘',
    title: tx('להבין ולתקן', 'Understanding & repair'),
    outcome: tx('אני יכול/ה להמשיך שיחה גם כשלא הבנתי.', 'I can keep going when I don’t understand.'),
    masteryStart: 10,
    steps: [
      { kind: 'introduce', chunk: 'dont_understand' },
      { kind: 'build', chunk: 'dont_understand' },
      { kind: 'recognize', chunk: 'dont_understand', distractors: ['slowly', 'repeat'] },
      { kind: 'introduce', chunk: 'slowly' },
      { kind: 'recognize', chunk: 'slowly', distractors: ['repeat', 'dont_understand'] },
      { kind: 'introduce', chunk: 'repeat' },
      { kind: 'introduce', chunk: 'what_mean' },
      { kind: 'recognize', chunk: 'what_mean', distractors: ['repeat', 'speak_english'] },
      { kind: 'introduce', chunk: 'speak_english' },
      { kind: 'recognize', chunk: 'speak_english', distractors: ['dont_understand', 'slowly'] },
      // — mastery —
      { kind: 'listen', chunk: 'dont_understand', distractors: ['slowly', 'repeat'] },
      { kind: 'listen', chunk: 'slowly', distractors: ['repeat', 'speak_english'] },
      { kind: 'dialogue', npc: 'npc_fast', answer: 'dont_understand', distractors: ['thanks', 'one_please'] },
    ],
  },
  {
    id: 'm7',
    icon: '❓',
    title: tx('שאלות חיוניות', 'Essential questions'),
    outcome: tx('יש לי סט קטן של שאלות שימושיות.', 'I have a small set of reusable questions.'),
    masteryStart: 9,
    steps: [
      { kind: 'introduce', chunk: 'what_is_this' },
      { kind: 'recognize', chunk: 'what_is_this', distractors: ['can_i_water', 'is_there_wifi'] },
      { kind: 'introduce', chunk: 'can_i_water' },
      { kind: 'build', chunk: 'can_i_water' },
      { kind: 'introduce', chunk: 'is_there_wifi' },
      { kind: 'recognize', chunk: 'is_there_wifi', distractors: ['what_is_this', 'can_i_water'] },
      { kind: 'introduce', chunk: 'where_hotel' },
      { kind: 'build', chunk: 'where_hotel' },
      // — mastery —
      { kind: 'cloze', chunk: 'where_hotel', distractors: ['is_there_wifi', 'can_i_water'] },
      { kind: 'listen', chunk: 'can_i_water', distractors: ['is_there_wifi', 'what_is_this'] },
      { kind: 'recognize', chunk: 'where_hotel', distractors: ['is_there_wifi', 'what_is_this'] },
      { kind: 'dialogue', npc: 'npc_help', answer: 'can_i_water', distractors: ['goodbye', 'thats_all'] },
    ],
  },
  {
    id: 'm8',
    icon: '🎯',
    title: tx('נקודת מוכנות', 'Readiness checkpoint'),
    outcome: tx('יש לי בסיס ראשוני — אני מוכן/ה לבוטקאמפ.', 'I have a first foundation — I’m ready for the Bootcamp.'),
    steps: [
      { kind: 'listen', chunk: 'hello_myname', distractors: ['coffee_please', 'where_bathroom'] },
      { kind: 'dialogue', npc: 'hello', answer: 'hello_myname', distractors: ['need_help', 'where_exit'] },
      { kind: 'dialogue', npc: 'npc_order', answer: 'coffee_please', distractors: ['dont_understand', 'goodbye'] },
      { kind: 'recognize', chunk: 'where_bathroom', distractors: ['coffee_please', 'hello_myname'] },
      { kind: 'dialogue', npc: 'npc_help', answer: 'where_bathroom', distractors: ['thanks', 'one_please'] },
      { kind: 'dialogue', npc: 'npc_order', answer: 'how_much_this', distractors: ['where_hotel', 'goodbye'] },
      { kind: 'dialogue', npc: 'npc_fast', answer: 'dont_understand', distractors: ['yes', 'thats_all'] },
      { kind: 'dialogue', npc: 'npc_fast', answer: 'slowly', distractors: ['one_please', 'here'] },
    ],
  },
];

export const ZERO_PATH: ZeroPath = { chunks: ZERO_CHUNKS, modules: ZERO_MODULES };
