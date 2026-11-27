import { afterEach, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HotelStaySummary, splitTimeBoard } from './HotelStaySummary.js';
import { missionVideo } from '../videos/missionVideo.js';
import { coachFor } from '../companion/companionCoach.js';
import { answersFollow, runNpcBeat } from './dialogueBeat.js';
import { cinematicTranscript } from './exportDialogue.js';
import { coverageOf, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M22_CONCEPTS } from './mission22Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  FINAL_SAID, FIX_IT, FIX_STAGES, HOTEL_TILES, M22_PROPS, M22_SLOTS, NOT_WORKING, N_BILL, N_BRING, N_DESSERT, N_FISH, N_KEY_204, N_NEW_KEY, N_REFUND, N_SEND,
  MEAL_TILES, N_SO_SORRY, RESTAURANT_TILES, SAID, TOOLS, fixIt, fixState, newProblems,
} from './practiceFix.js';
import { validatePracticeStep } from './practiceEngines.js';
import { WORD_SENSES, learnedBefore, missionContent, senseWords, teachingEncounters, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 22 — Fixing Problems: NOTICE → EXPLAIN → ASK FOR A FIX. Two locked scenes, ONE skill. Four production tools
 * (This isn't what I ordered. · I think there's a mistake. · ___ isn't working. · Can you fix it?), the staff's
 * solutions as comprehension ("what did they do?"), the learner's own problems on 🧰 FIX IT (every solution "?" until
 * understood), one not-working transfer (the key), and a final of NEW PROBLEMS. No grammar.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 22): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const SCENES = ['fixing-problems', 'room-problem'] as const;
const scene = (d: BootcampDayContent, i: 0 | 1) => d.dialogues[SCENES[i]]!;
const script = (lang: CoverageLang, i: 0 | 1): string[] => cinematicTranscript(scene(day(lang), i)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
type VM = Extract<BootcampStep, { kind: 'visualMatch' }>;
type Round = QR['rounds'][number];
const accepted = (r: Round): string => strip(r.options.find((o) => o.correct)!.itemId);
const said = (d: BootcampDayContent, o: Round['options'][number]): string => o.text ?? text(d, o.itemId);
const heardIn = (d: BootcampDayContent, r: Round): string => r.npc?.en ?? text(d, r.promptItemId);
const cardsOf = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const dialogueAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'dialogue');
const lastDialogueAt = (d: BootcampDayContent): number => d.steps.map((s) => s.kind).lastIndexOf('dialogue');
const at = (x: L4, lang: CoverageLang): string => x[IX[lang]];
const boardOf = (tiles: { id: string }[]) => (s: BootcampStep): s is VM => s.kind === 'visualMatch' && s.tiles.length === tiles.length && s.tiles.every((t, i) => t.id === tiles[i]!.id);
const isMealCheck = boardOf(MEAL_TILES);
const isRestaurantCheck = boardOf(RESTAURANT_TILES);
const isHotelCheck = boardOf(HOTEL_TILES);
const interactions = (d: BootcampDayContent): number => d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
  : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);
const quickRounds = (d: BootcampDayContent, from = 0, to = d.steps.length) => d.steps.slice(from, to).flatMap((s, i) => (s.kind === 'quickReply' ? s.rounds.map((r) => [from + i, r] as const) : []));
const phaseOf = (d: BootcampDayContent, i: number): 'teaching' | 'no help' | 'final' => (i < dialogueAt(d) ? 'teaching' : i < videoAt(d) ? 'no help' : 'final');

/** The two conversations exactly as the brief froze them (pasted verbatim) — compared EXACTLY. The "Later…" cue is not a line. */
const LOCKED: Record<CoverageLang, [string[], string[]]> = {
  en: [
    ["NPC: Here's your meal — one steak!", "YOU: This isn't what I ordered.", "NPC: Oh no, I'm so sorry! What did you order?", 'YOU: I ordered the pasta.', "NPC: Of course — I'll bring the right one right away.",
      "NPC: Here's your bill.", "YOU: I think there's a mistake.", "NPC: Let me check the bill. What's the problem?", 'YOU: I was charged twice.', "NPC: You're right — my mistake. I'll refund it now.",
      'YOU: No problem, thank you.', 'NPC: Thank you for your patience. Dessert is on the house!'],
    ['NPC: Good evening! How can I help you?', "YOU: There's a problem with my room.", "NPC: I'm sorry to hear that. What's the problem?", "YOU: The air conditioning isn't working.",
      "NPC: I'm so sorry about that.", 'YOU: Can you fix it?', "NPC: Yes, I'll send someone right away. Is everything else okay?", 'YOU: No. My room is very noisy.',
      'NPC: I understand. We have a quieter room.', 'YOU: Can I change rooms?', 'NPC: Of course — room 305. Here is your new key. Good night!'],
  ],
  es: [
    ['NPC: Aquí tiene su plato — ¡un filete!', 'YOU: Esto no es lo que pedí.', 'NPC: ¡Ay, lo siento muchísimo! ¿Qué pidió?', 'YOU: Pedí la pasta.', 'NPC: Claro — le traigo el correcto enseguida.',
      'NPC: Aquí tiene la cuenta.', 'YOU: Creo que hay un error.', 'NPC: Déjeme revisar la cuenta. ¿Cuál es el problema?', 'YOU: Me han cobrado dos veces.',
      'NPC: Tiene razón — es culpa mía. Le hago el reembolso ahora mismo.', 'YOU: No pasa nada, gracias.', 'NPC: Gracias por su paciencia. ¡El postre corre por cuenta de la casa!'],
    ['NPC: ¡Buenas noches! ¿En qué puedo ayudarle?', 'YOU: Hay un problema con mi habitación.', 'NPC: Lo siento. ¿Cuál es el problema?', 'YOU: El aire acondicionado no funciona.',
      'NPC: Lo siento muchísimo.', 'YOU: ¿Lo puede arreglar?', 'NPC: Sí, mando a alguien ahora mismo. ¿Todo lo demás está bien?', 'YOU: No. Mi habitación es muy ruidosa.',
      'NPC: Lo entiendo. Tenemos una habitación más tranquila.', 'YOU: ¿Puedo cambiar de habitación?', 'NPC: Claro — habitación 305. Aquí tiene su nueva llave. ¡Buenas noches!'],
  ],
  fr: [
    ['NPC: Voici votre plat — un steak !', 'YOU: Ce n’est pas ce que j’ai commandé.', 'NPC: Oh non, je suis vraiment désolé ! Qu’avez-vous commandé ?', 'YOU: J’ai commandé les pâtes.',
      'NPC: Bien sûr — je vous apporte le bon tout de suite.', 'NPC: Voici l’addition.', 'YOU: Je crois qu’il y a une erreur.', 'NPC: Laissez-moi vérifier l’addition. Quel est le problème ?',
      'YOU: On m’a facturé deux fois.', 'NPC: Vous avez raison — c’est ma faute. Je vous rembourse tout de suite.', 'YOU: Pas de problème, merci.', 'NPC: Merci de votre patience. Le dessert est offert par la maison !'],
    ['NPC: Bonsoir ! Comment puis-je vous aider ?', 'YOU: Il y a un problème avec ma chambre.', 'NPC: Je suis désolé. Quel est le problème ?', 'YOU: La climatisation ne marche pas.',
      'NPC: Je suis vraiment désolé.', 'YOU: Vous pouvez arranger ça ?', 'NPC: Oui, j’envoie quelqu’un tout de suite. Tout le reste va bien ?', 'YOU: Non. Ma chambre est très bruyante.',
      'NPC: Je comprends. Nous avons une chambre plus calme.', 'YOU: Je peux changer de chambre ?', 'NPC: Bien sûr — chambre 305. Voici votre nouvelle clé. Bonne nuit !'],
  ],
};
/** The brief's Hebrew support meaning, line by line (the "Later…" cue is shown, not a line). */
const HEBREW: [string[], string[]] = [
  ['הנה הארוחה שלך — סטייק אחד!', 'זה לא מה שהזמנתי.', 'אוי לא, אני מצטער מאוד! מה הזמנת?', 'הזמנתי את הפסטה.', 'כמובן — אביא את הנכון מיד.', 'הנה החשבון.', 'אני חושב שיש טעות.',
    'תן לי לבדוק את החשבון. מה הבעיה?', 'חייבו אותי פעמיים.', 'אתה צודק — הטעות שלי. אחזיר לך עכשיו.', 'אין בעיה, תודה.', 'תודה על הסבלנות. הקינוח על חשבון הבית!'],
  ['ערב טוב! איך אפשר לעזור?', 'יש בעיה בחדר שלי.', 'אני מצטער לשמוע. מה הבעיה?', 'המזגן לא עובד.', 'אני מצטער על זה מאוד.', 'אפשר לתקן את זה?', 'כן, אשלח מישהו מיד. כל השאר בסדר?',
    'לא. החדר שלי מאוד רועש.', 'אני מבין. יש לנו חדר שקט יותר.', 'אפשר להחליף חדר?', 'כמובן — חדר 305. הנה המפתח החדש. לילה טוב!'],
];
/** Canonical transcripts ([who, text], exact) — the same value before this pass and after. */
const TRANSCRIPT_PRINT = { en: 'f58045c8', es: 'd3fceefa', fr: '44c460c9' };
/** The dialogue TREES — changed on purpose: one wrong line per turn, asked again slowly; no alternative answer, no recovery branch. */
const DIALOGUE_PRINT = { en: '0e2c3dcd', es: 'df9bd1a1', fr: 'a6c34221' };
const [NOT_ORDERED, MISTAKE, AC, FIX] = TOOLS;
const I_ORDERED = 'phrase.fix.i-ordered';
const CHARGED = 'phrase.fix.charged-twice';
const NO_PROBLEM = 'phrase.fix.no-problem-thanks';
const ROOM_PROBLEM = 'phrase.fix.theres-problem';
const NOISY = 'phrase.hotelreq.room-noisy';
const CHANGE = 'phrase.fix.change-rooms';
const LEARNER: [string[], string[]] = [[NOT_ORDERED, I_ORDERED, MISTAKE, CHARGED, NO_PROBLEM], [ROOM_PROBLEM, AC, FIX, NOISY, CHANGE]];
const ALL_LEARNER = [...LEARNER[0], ...LEARNER[1]];
/** Grammar the mission must never show (EN / HE). */
const GRAMMAR = /grammar|tense|past simple|simple past|passive|participle|modal|comparative|conjugat|future|\bverbs?\b|adjective|quiet → quieter|was \+|isn't = |I'll = |דקדוק|זמן עבר|זמן עתיד|סביל|פועל|פעלים|שם תואר|ערך היתרון|נטייה|הטיה/i;
const SCOREBOARD = /score|points|\bXP\b|streak|timer|seconds|%|\d+\s*\/\s*\d+|ניקוד|נקודות|רצף|טיימר|שניות/i;

/* ── what each step shows ─────────────────────────────────────────────────────────────────────── */

const boardText = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''] : [];
};
function speakable(d: BootcampDayContent): string[] {
  const out = SCENES.flatMap((id) => d.dialogues[id]!.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)]));
  for (const s of d.steps) {
    if (s.kind === 'quickReply') for (const r of s.rounds) out.push(heardIn(d, r), ...r.options.map((o) => said(d, o)));
    if (s.kind === 'visualMatch') for (const r of s.rounds) out.push(r.audio.en);
    if (s.kind === 'swap') for (const r of s.rounds) out.push(...r.options.map((o) => r.frame.replace('___', o.slot)));
    if (s.kind === 'prime') out.push(...s.words.map((w) => w.text));
  }
  return out.filter(Boolean);
}
function appCopy(d: BootcampDayContent): string {
  const out: string[] = [];
  for (const s of d.steps) {
    out.push(...boardText(s));
    if (s.kind === 'talk') for (const b of [s.title, ...s.body, s.cta]) out.push(b?.he ?? '', b?.en ?? '');
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'visualMatch') for (const t of s.tiles) out.push(t.label ?? '', t.caption?.he ?? '', t.caption?.en ?? '');
    if (s.kind === 'swap') for (const r of s.rounds) out.push(r.cue.text.he ?? '', r.cue.text.en ?? '', ...r.options.map((o) => `${o.meaning.he} ${o.meaning.en}`));
  }
  return out.join(' | ');
}

describe('the conversations are locked, and Mission 22 is in its place', () => {
  const N = { en: [1, 2], es: [3, 4], fr: [5, 6] } as const;
  for (const lang of LANGS) for (const i of [0, 1] as const) it(`${N[lang][i]}. ${lang} scene ${i + 1}: the brief's canonical dialogue, word for word — EXACT (no normalisation)`, () => {
    expect(script(lang, i)).toEqual(LOCKED[lang][i]);
  });
  it('the canonical transcripts are byte-identical to the pre-pass ones (target text unchanged) — and the Hebrew support is the brief\'s', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(SCENES.flatMap((id) => cinematicTranscript(day(l).dialogues[id]!)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
    for (const lang of LANGS) for (const i of [0, 1] as const) expect(cinematicTranscript(scene(day(lang), i)).map((l) => l.he), `${lang} ${i}`).toEqual(HEBREW[i]);
  });
  it('7. all ten canonical learner turns remain exact — and they are the only lines the learner says in the conversations', () => {
    for (const lang of LANGS) for (const i of [0, 1] as const) {
      const turns = cinematicTranscript(scene(day(lang), i)).filter((l) => l.who === 'you').map((l) => l.en);
      expect(turns, `${lang} ${i}`).toEqual(LEARNER[i].map((id) => at(SAID[id]!, lang)));
      expect(turns, `${lang} ${i}`).toEqual(LOCKED[lang][i].filter((l) => l.startsWith('YOU: ')).map((l) => l.slice(5)));
    }
  });
  it('8. the silent "Later…" cue is shown above the bill line and is NEVER spoken (not a line, not in any audio)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cued = SCENES.flatMap((id) => d.dialogues[id]!.nodes.filter((n) => n.cue));
      expect(cued.map((n) => [n.cue!.en, n.cue!.he, n.en]), lang).toEqual([['Later…', 'מאוחר יותר…', at(N_BILL, lang)]]);
      for (const t of speakable(d)) expect(t, lang).not.toMatch(/Later|Plus tard|Más tarde|מאוחר/);
      for (const id of SCENES) for (const l of cinematicTranscript(d.dialogues[id]!)) expect(l.en, lang).not.toMatch(/Later|Plus tard|Más tarde/);
    }
  });
  it('the dialogue trees are pinned: every turn a real decision — one wrong line of these conversations, asked again slowly, then the same choice', () => {
    for (const lang of LANGS) for (const id of SCENES) {
      const nodes = day(lang).dialogues[id]!.nodes;
      for (const n of nodes.filter((x) => x.who === 'you')) {
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        const wrong = n.choices!.filter((c) => !c.correct);
        expect(wrong, `${lang} ${n.id}`).toHaveLength(1);
        expect(ALL_LEARNER, `${lang} ${n.id}`).toContain(strip(wrong[0]!.itemId));
        const again = nodes.find((x) => x.id === wrong[0]!.next)!;
        expect([again.who, again.slow, again.next], `${lang} ${n.id}`).toEqual(['npc', true, n.id]);
      }
      expect(JSON.stringify(nodes), lang).not.toMatch(/recovery\.|core\.can-you-help/);
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('9. Mission 22 is "Fixing Problems", twenty-second on the journey (registry key 24) — a normal mission', () => {
    expect(BOOTCAMP_PLAN[21]!.id).toBe('fixing-problems');
    expect(BOOTCAMP_PLAN[21]!.day).toBe(24);
    expect(missionNumber(24)).toBe(22);
    expect(BOOTCAMP_PLAN[21]!.video).toBeUndefined();
    expect(BOOTCAMP_PLAN[21]!.checkpoint).toBeUndefined();
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Fixing Problems');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('54. Missions 01–21 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 21)).toEqual({ en: '0805f717', es: '1d47a41c', fr: '77ce788c' }); });
  it('55. Missions 23–30 are byte-for-byte unchanged — the learner sentences the checkpoints reuse keep their id and wording (all four languages)', () => {
    expect(raw(22)).toEqual({ en: 'c136fa2c', es: '1abda9c1', fr: '9332620b' });
    let reused = 0;
    for (const lang of LANGS) for (let n = 23; n <= 30; n++) for (const id of ALL_LEARNER) {
      const later = day(lang, n).items.find((i) => strip(i.id) === id);
      if (!later) continue;
      reused++;
      expect(later, `${lang} M${n} ${id}`).toEqual(day(lang).items.find((i) => strip(i.id) === id));
    }
    expect(reused).toBeGreaterThan(0);
  });
  it('46. EN / ES / FR parity: the same journey, step for step, each in its own words', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.ordered ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'swap') return [s.kind, s.label, s.rounds.map((r) => [strip(r.itemId), r.cue, r.options.map((o) => [o.correct, o.meaning])])];
      if (s.kind === 'prime') return [s.kind, s.label, s.intro, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(day(lang)), lang).toEqual(shape(day('en')));
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      expect(interactions(d), lang).toBe(interactions(day('en')));
    }
  });
});

describe('PRIOR LEARNING — verified per language, not assumed (learnedBefore(lang, 22))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 22);
  const known = (lang: CoverageLang, c: string): boolean => (c.includes('#') ? prior(lang).words.has(c) : plain(c).trim().includes(' ') ? prior(lang).knowsChunk(c) : prior(lang).words.has(plain(c).trim()));
  /** The brief's audit list — a chunk per language, and what it really is before Mission 22. */
  const AUDIT: Record<CoverageLang, Record<string, string>> = {
    en: { order: 'order', ordered: 'ordered', pasta: 'pasta', steak: 'steak', bill: 'the bill', mistake: 'mistake', twice: 'twice', charged: 'charged', refund: 'refund', room: 'room', 'air conditioning': 'air conditioning', working: 'working', fix: 'fix', noisy: 'noisy', quieter: 'quieter', 'change rooms': 'change rooms', key: 'key', 'right away': 'right away', 'the right one': 'the right one', 'thank you': 'thank you', 'no problem': 'no problem', dessert: 'dessert', 'on the house': 'on the house', 'send someone': 'send someone', problem: 'problem', "what's the problem": "what's the problem", 'how can I help you': 'how can I help you', chicken: 'chicken', fish: 'fish', wifi: 'wifi', shower: 'shower' },
    es: { order: 'pedí', ordered: 'pedí', pasta: 'pasta', steak: 'filete', bill: 'la cuenta', mistake: 'error', twice: 'dos veces', charged: 'cobrado', refund: 'reembolso', room: 'habitación', 'air conditioning': 'aire acondicionado', working: 'funciona', fix: 'arreglar', noisy: 'ruidosa', quieter: 'más tranquila', 'change rooms': 'cambiar de habitación', key: 'llave', 'right away': 'enseguida', 'the right one': 'el correcto', 'thank you': 'gracias', 'no problem': 'no pasa nada', dessert: 'postre', 'on the house': 'cuenta#on-the-house', 'send someone': 'mando a alguien', problem: 'problema', "what's the problem": '¿cuál es el problema?', 'how can I help you': '¿en qué puedo ayudarle?', chicken: 'pollo', fish: 'pescado', wifi: 'wifi', shower: 'ducha' },
    fr: { order: 'commandé', ordered: 'commandé', pasta: 'pâtes', steak: 'steak', bill: 'l’addition', mistake: 'erreur', twice: 'deux fois', charged: 'facturé', refund: 'rembourse', room: 'chambre', 'air conditioning': 'climatisation', working: 'marche', fix: 'arranger', noisy: 'bruyante', quieter: 'plus calme', 'change rooms': 'changer de chambre', key: 'clé', 'right away': 'tout de suite', 'the right one': 'le bon', 'thank you': 'merci', 'no problem': 'pas de problème', dessert: 'dessert', 'on the house': 'offert par la maison', 'send someone': 'j’envoie quelqu’un', problem: 'problème', "what's the problem": 'quel est le problème', 'how can I help you': 'comment puis-je vous aider', chicken: 'poulet', fish: 'poisson', wifi: 'wifi', shower: 'douche' },
  };
  const COMMON = ['bill', 'room', 'key', 'thank you', 'no problem', 'problem', 'how can I help you', 'chicken', 'fish', 'wifi'];
  const VERIFIED: Record<CoverageLang, string[]> = {
    en: [...COMMON, 'order'], // "Are you ready to order?" (Missions 14–15) — the restaurant sense
    es: [...COMMON, 'right away'], // "enseguida" (Missions 14–15)
    fr: [...COMMON, 'right away'], // "tout de suite" (Missions 14–15)
  };
  for (const lang of LANGS) it(`${lang}: every audited item classified — VERIFIED GUARANTEED PRIOR, or NEW (taught here, on a card)`, () => {
    const verified = Object.entries(AUDIT[lang]).filter(([, c]) => known(lang, c)).map(([k]) => k).sort();
    expect(verified).toEqual([...VERIFIED[lang]].sort());
    for (const k of Object.keys(AUDIT[lang]).filter((x) => !verified.includes(x) && !['chicken', 'fish', 'wifi', 'shower'].includes(x))) {
      const c = AUDIT[lang][k]!.split('#')[0]!.replace(/^¿|\?$/g, '');
      expect(cardsOf(day(lang)).some((w) => hasChunk(w.text, c === 'cuenta' ? 'por cuenta de la casa' : c)), `${lang} ${k}`).toBe(true);
    }
  });
  it('38. SAME FORM ≠ SAME MEANING — "right": Missions 05–21 only had right there / on your right / right now / right back / all right / right?; "the right one" (correct) and "right away" are NOT prior — the cards teach them before any test', () => {
    const taughtRight = Array.from({ length: 21 }, (_, m) => m + 1).flatMap((m) => teachingEncounters(missionContent('en', m)).map((e) => e.text)).filter((t) => plain(t).split(' ').includes('right'));
    for (const t of taughtRight) expect(t).not.toMatch(/the right one|you're right|right away/i);
    expect(prior('en').knowsChunk('the right one')).toBe(false);
    expect(prior('en').knowsChunk("you're right")).toBe(false);
    expect(prior('en').knowsChunk('right away')).toBe(false);
    // One locked line holds TWO senses ("the right one right away"), so a single-sense registry cannot tag it: the guarantee is chunk-level.
    expect(WORD_SENSES.en?.right).toBeUndefined();
    const d = day('en');
    const unprepared = unpreparedChunks(d, 'en', M22_CONCEPTS.filter((c) => ['bring-the-right-one', 'right-away', 'youre-right'].includes(c.id)));
    expect(unprepared).toEqual([]);
    expect(unpreparedChunks({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== 'fix.line.bring') } : s)) }, 'en', M22_CONCEPTS.filter((c) => c.id === 'bring-the-right-one')).join(' ')).toMatch(/bring-the-right-one/);
  });
  it('39. SAME FORM ≠ SAME MEANING — "change": English only had money change ("Here\'s your change", "Keep the change"); "change rooms" is NOT prior — taught on its card before its one retrieval', () => {
    const taught = Array.from({ length: 21 }, (_, m) => m + 1).flatMap((m) => teachingEncounters(missionContent('en', m)).map((e) => e.text)).filter((t) => plain(t).split(' ').includes('change'));
    expect(taught.length).toBeGreaterThan(0);
    for (const t of taught) expect(t).not.toMatch(/change rooms/i);
    expect(prior('en').knowsChunk('change rooms')).toBe(false);
    for (const lang of LANGS) {
      const d = day(lang);
      const first = quickRounds(d).find(([, r]) => accepted(r) === CHANGE)![0];
      expect(primeAt(d, 'fix.line.change'), lang).toBeLessThan(first);
    }
    expect(prior('es').words.has('cambiar')).toBe(false);
    expect(prior('fr').words.has('changer')).toBe(false);
  });
  it('40. SAME FORM ≠ SAME MEANING — "working" (functioning) was never met before in any sense — no collision, taught on the card', () => {
    expect(prior('en').words.has('working')).toBe(false);
    expect(prior('es').words.has('funciona')).toBe(false);
    expect(prior('fr').words.has('marche')).toBe(false); // (not "marché", the market — another word)
    for (const lang of LANGS) expect(primeAt(day(lang), 'fix.line.ac'), lang).toBeGreaterThan(0);
  });
  it('the ES "cuenta" sense is registered: the bill (Mission 14) ≠ "por cuenta de la casa" (on the house) — the dessert line is not prior', () => {
    expect(WORD_SENSES.es!.cuenta!.map((s) => s.sense)).toEqual(['bill', 'on-the-house']);
    expect(prior('es').words.has('cuenta#bill')).toBe(true);
    expect(prior('es').words.has('cuenta#on-the-house')).toBe(false);
    expect(senseWords(at(N_DESSERT, 'es'), 'es')).toContain('cuenta#on-the-house');
    // "room" is the hotel sense (Mission 08: "You're in room two-oh-four"), not only "the living room" / "the fitting room".
    expect(teachingEncounters(missionContent('en', 8)).some((e) => /room two-oh-four/.test(e.text))).toBe(true);
  });
  it('the final\'s new details are VERIFIED PRIOR in every language — chicken (Mission 14), fish (Mission 20), the key (Missions 04, 08), room 204 (Mission 08)', () => {
    const DETAIL: Record<CoverageLang, string[]> = { en: ['chicken', 'fish', 'key', 'two-oh-four'], es: ['pollo', 'pescado', 'llave', 'doscientos'], fr: ['poulet', 'poisson', 'clé', 'quatre'] };
    const FROM = [14, 20, 4, 8];
    for (const lang of LANGS) DETAIL[lang].forEach((w, i) => {
      expect(prior(lang).words.has(plain(w).trim().split(' ')[0]!), `${lang} ${w}`).toBe(true);
      const taughtIn = Array.from({ length: 21 }, (_, m) => m + 1).filter((m) => teachingEncounters(missionContent(lang, m)).some((e) => hasChunk(e.text, w)));
      expect(taughtIn, `${lang} ${w}`).toContain(FROM[i]);
    });
  });
  it('41–42. optional and transfer content never creates false prior: a skippable miss of these conversations, the swap, the final', () => {
    for (const lang of LANGS) {
      const noMiss = (l: CoverageLang, n: number): BootcampDayContent => {
        const d = missionContent(l, n);
        if (n !== 22) return d;
        return { ...d, dialogues: Object.fromEntries(Object.entries(d.dialogues).map(([id, t]) => [id, { ...t, nodes: t.nodes.filter((x) => !/^m\d+$/.test(x.id)).map((x) => ({ ...x, choices: x.choices?.filter((c) => c.correct) })) }])) };
      };
      const a = learnedBefore(lang, 23);
      const b = learnedBefore(lang, 23, noMiss);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
      // The swap and the final are tests, never teaching: "The key isn't working" is not a chunk anyone has learned.
      expect(a.knowsChunk(FINAL_SAID[AC][IX[lang]]), lang).toBe(false);
      expect(a.knowsChunk(FINAL_SAID[I_ORDERED][IX[lang]]), lang).toBe(false);
      expect(a.knowsChunk(at(N_FISH, lang)), lang).toBe(false);
    }
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M22_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`44. STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior (with its meaning); every new chunk taught before it is tested (wrong options included)`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words, lang)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('removing a card fails the audit — every tested line depends on the card that teaches it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (key: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== key) } : s)) });
      for (const [key, id] of [['fix.line.meal', 'heres-your-meal'], ['fix.line.not-ordered', 'not-ordered'], ['fix.line.mistake', 'mistake'], ['fix.line.check', 'let-me-check'], ['fix.line.charged', 'charged-twice'],
        ...(lang === 'en' ? [['fix.line.whats-problem', 'sorry-to-hear'] as const] : []), ['fix.line.ac', 'the-air-conditioning'], ['fix.line.fix', 'can-you-fix'], ['fix.line.quieter', 'quieter-room'], ['fix.line.change', 'change-rooms'],
        ['fix.line.refund', 'refund'], ['fix.line.send', 'send-someone'], ['fix.line.new-key', 'new-key']] as const) {
        expect(`${unprepared(without(key), lang).join(' ')} ${unpreparedWords(without(key), prior(lang).words, lang).join(' ')}`, `${lang} ${key}`).toMatch(new RegExp(`${id}|“`));
      }
    }
  });
});

describe('production — four tools, taught whole, then retrieved (10, 19–22)', () => {
  it('10. exactly four core production tools: This isn\'t what I ordered. · I think there\'s a mistake. · ___ isn\'t working. · Can you fix it?', () => {
    expect([...TOOLS]).toEqual(['phrase.fix.not-ordered', 'phrase.fix.theres-mistake', 'phrase.hotelreq.ac-not-working', 'phrase.fix.can-you-fix']);
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(lastDialogueAt(d) + 1, videoAt(d)).find((s) => s.kind === 'quickReply') as QR;
      expect(run.rounds.map(accepted), lang).toEqual([...TOOLS]);
      for (const id of TOOLS) expect(M22_CONCEPTS.find((c) => hasChunk(at(SAID[id]!, lang), c.chunk[lang]) && c.role === 'say'), `${lang} ${id}`).toBeTruthy();
      expect(M22_CONCEPTS.filter((c) => c.role === 'say').map((c) => c.id), lang).toEqual(['not-ordered', 'mistake', 'the-air-conditioning', 'not-working', 'can-you-fix']);
    }
  });
  it('19–22. each tool is taught WHOLE on a card (with its meaning) before it is first retrieved — and retrieved in teaching, No Help and the final', () => {
    const cardOf: Record<string, string> = { [NOT_ORDERED]: 'fix.line.not-ordered', [MISTAKE]: 'fix.line.mistake', [AC]: 'fix.line.ac', [FIX]: 'fix.line.fix' };
    for (const lang of LANGS) {
      const d = day(lang);
      const rounds = quickRounds(d);
      for (const id of TOOLS) {
        const first = rounds.find(([, r]) => accepted(r) === id)![0];
        expect(primeAt(d, cardOf[id]!), `${lang} ${id}`).toBeGreaterThan(-1);
        expect(primeAt(d, cardOf[id]!), `${lang} ${id}`).toBeLessThan(first);
        expect(cardsOf(d).find((w) => w.key === cardOf[id])!.text, `${lang} ${id}`).toBe(SAID[id]![IX[lang]]);
        expect(new Set(rounds.filter(([, r]) => accepted(r) === id).map(([i]) => phaseOf(d, i))), `${lang} ${id}`).toEqual(new Set(['teaching', 'no help', 'final']));
      }
      const lines = [0, 1].flatMap((i) => script(lang, i as 0 | 1).map((l) => l.slice(5)));
      for (const w of cardsOf(d)) { expect(w.line, `${lang} ${w.key}`).toBe(true); expect(lines, `${lang} ${w.key}`).toContain(w.text); }
    }
  });
  it('23–28. the secondary lines get minimal valid support: a card and the conversation; "I was charged twice" one light round, "Can I change rooms?" ONE meaningful retrieval; "No problem, thank you." no card, no drill', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cards = (t: string) => cardsOf(d).filter((w) => w.text === t).length;
      const teach = (id: string) => quickRounds(d, 0, dialogueAt(d)).filter(([, r]) => accepted(r) === id).length;
      for (const id of [I_ORDERED, CHARGED, ROOM_PROBLEM, NOISY, CHANGE]) expect(cards(at(SAID[id]!, lang)), `${lang} ${id}`).toBe(1);
      expect([teach(I_ORDERED), teach(CHARGED), teach(ROOM_PROBLEM), teach(NOISY), teach(CHANGE), teach(NO_PROBLEM)], lang).toEqual([0, 1, 0, 0, 1, 0]);
      expect(cards(at(SAID[NO_PROBLEM]!, lang)), lang).toBe(0); // verified prior — the conversation carries it
      expect(quickRounds(d).filter(([, r]) => accepted(r) === NO_PROBLEM), lang).toHaveLength(0);
      for (const id of [ROOM_PROBLEM, NOISY]) expect(quickRounds(d).filter(([, r]) => accepted(r) === id), `${lang} ${id}`).toHaveLength(0);
      // the change of room is the alternative, not the fix: its round puts "Can you fix it?" against it
      const [, change] = quickRounds(d).find(([, r]) => accepted(r) === CHANGE)!;
      expect(change.options.map((o) => strip(o.itemId)), lang).toContain(FIX);
      for (const id of ['no-problem', 'thank-you']) expect(learnedBefore(lang, 22).knowsChunk(M22_CONCEPTS.find((c) => c.id === id)!.chunk[lang]), `${lang} ${id}`).toBe(true);
    }
  });
  it('the one not-working transfer: the key (verified prior), on the same sentence — the canonical line and the new one, nothing else', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const swaps = stepsOf(d, 'swap');
      expect(swaps, lang).toHaveLength(1);
      const r = swaps[0]!.rounds[0]!;
      expect(strip(r.itemId), lang).toBe(AC);
      expect(r.options.map((o) => [r.frame.replace('___', o.slot), o.correct]), lang).toEqual([[at(SAID[AC]!, lang), false], [FINAL_SAID[AC][IX[lang]], true]]);
      expect(swaps[0]!.transferOnly, lang).toBeUndefined();
      expect(learnedBefore(lang, 22).words.has(plain(NOT_WORKING.other[IX[lang]]).split(' ')[1]!), lang).toBe(true);
    }
  });
  it('43. every option anywhere is a learner line of these conversations said whole — or, in the final, the same line with the final\'s detail; a staff line is never an answer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const allowed = [...ALL_LEARNER.map((id) => at(SAID[id]!, lang)), ...Object.values(FINAL_SAID).map((x) => x[IX[lang]])];
      for (const [, r] of quickRounds(d)) for (const o of r.options) expect(allowed, `${lang} ${said(d, o)}`).toContain(said(d, o));
    }
  });
  it('wrong options fit the conversation: plausible, already learned — and never as natural as the right one', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const [i, r] of quickRounds(d)) {
        const ok = accepted(r);
        const wrong = r.options.filter((o) => !o.correct).map((o) => strip(o.itemId));
        expect(wrong, `${lang} step ${i}`).not.toContain(ok);
        // "There's a problem with my room." answers "How can I help you?" as well as the right answer would — never a wrong option there.
        if (strip(r.promptItemId) === 'reply.fix.how-can-i-help') expect(wrong, `${lang} step ${i}`).not.toContain(ROOM_PROBLEM);
        // After an apology, "No problem, thank you." would be polite — never the wrong option against "Can you fix it?".
        if (ok === FIX) expect(wrong, `${lang} step ${i}`).not.toContain(NO_PROBLEM);
        // The wrong meal: "I think there's a mistake." would also be right — never a wrong option there.
        if (ok === NOT_ORDERED) expect(wrong, `${lang} step ${i}`).not.toContain(MISTAKE);
      }
    }
  });
  it('sentences: the ten learner lines and the staff\'s eight answered lines — the short staff lines archived, the help phrase and the alternative no longer bundled', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.items.map((i) => strip(i.id)).sort(), lang).toEqual([
        'phrase.fix.can-you-fix', 'phrase.fix.change-rooms', 'phrase.fix.charged-twice', 'phrase.fix.i-ordered', 'phrase.fix.no-problem-thanks', 'phrase.fix.not-ordered', 'phrase.fix.theres-mistake', 'phrase.fix.theres-problem',
        'phrase.hotelreq.ac-not-working', 'phrase.hotelreq.room-noisy',
        'reply.fix.bill', 'reply.fix.check-the-bill', 'reply.fix.how-can-i-help', 'reply.fix.meal', 'reply.fix.quieter-room', 'reply.fix.so-sorry', 'reply.fix.what-did-you-order', 'reply.fix.whats-the-problem',
      ]);
      expect(RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'fixing-problems').map((r) => strip(r.id)), lang).toEqual([
        'reply.fix.whats-problem', 'reply.fix.bring-right', 'reply.fix.check-bill', 'reply.fix.refund-now', 'reply.fix.on-the-house', 'reply.fix.anything-else',
      ]);
      const live = new Set(BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items.map((i) => i.id)));
      for (const r of RETIRED_SENTENCES[lang].filter((x) => x.retiredFrom === 'fixing-problems')) expect(live.has(r.id), `${lang} ${r.id}`).toBe(false);
    }
  });
});

describe('the opening and 🧰 FIX IT — the learner\'s own problems, never the staff\'s solutions (16–18)', () => {
  it('16. the opening is the brief\'s two short lines — no phrase list, no grammar, no solution', () => {
    for (const lang of LANGS) {
      const b = day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
      expect(b.kind).toBe('talk');
      expect(b.body.map((x) => x.he).join('\n')).toBe('משהו השתבש.\nתגיד מה הבעיה ותבקש פתרון.');
      expect(b.title.en).toBe('Mission 22: Fixing Problems');
      expect(JSON.stringify(b), lang).not.toMatch(/refund|dessert|someone|305|quieter|key|steak|pasta|ordered|mistake|grammar|דקדוק/i);
    }
  });
  it('17. the learner\'s own problem facts are on the board from the start (ordered 🍝, got 🥩 · charged twice · AC not working · noisy) — every solution "?"', () => {
    expect(splitTimeBoard(fixIt(FIX_STAGES.start)[1])!.plan!.flatMap((c) => c.rows.map((r) => r.text))).toEqual(['🍽️ Ordered 🍝, got 🥩 → ⚠️ ?', '💳 Charged twice → ⚠️ ?', '❄️ AC not working → ⚠️ ?', '🔊 Noisy room → ⚠️ ?']);
    expect(splitTimeBoard(fixIt(FIX_STAGES.start)[1])!.plan!.map((c) => c.day)).toEqual(['🍽️ Restaurant', '🏨 Hotel']);
    expect(splitTimeBoard(fixIt(FIX_STAGES.done)[1])!.plan!.flatMap((c) => c.rows.map((r) => r.text))).toEqual(['🍽️ Ordered 🍝, got 🥩 → ✅ The right meal', '💳 Charged twice → ✅ Money back + 🍰', '❄️ AC not working → ✅ Someone is coming', '🔊 Noisy room → ✅ Room 305']);
    for (const lang of LANGS) {
      const first = day(lang).steps[1] as Extract<BootcampStep, { kind: 'prime' }>;
      expect(first.intro!.en, lang).toContain(fixIt(FIX_STAGES.start)[1]);
      expect(first.intro!.he, lang).toContain(fixIt(FIX_STAGES.start)[0]);
    }
    const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `${fixIt(FIX_STAGES.start)[1]} ¦ Go` }));
    expect(html.match(/data-known="false"/g)).toHaveLength(4);
  });
  it('each problem moves ⚠️ → 🗣️ → ✅ in order, and only after the learner has done its part — never back', () => {
    const rank = { open: 0, explained: 1, solved: 2 } as const;
    for (const lang of LANGS) {
      const d = day(lang);
      const seen = d.steps.map((s) => boardText(s)[1] ?? '').filter((t) => t.startsWith('🧰 FIX IT ¦ '))
        .map((t) => splitTimeBoard(t)!.plan!.flatMap((c) => c.rows.map((r) => (r.text.includes('✅') ? 2 : r.text.includes('🗣️') ? 1 : 0))));
      for (let i = 1; i < seen.length; i++) seen[i]!.forEach((v, p) => expect(v, `${lang} board ${i} problem ${p}`).toBeGreaterThanOrEqual(seen[i - 1]![p]!));
      expect(seen[0], lang).toEqual([0, 0, 0, 0]);
      expect(seen.at(-1), lang).toEqual([2, 2, 2, 2]);
    }
    expect(Object.values(FIX_STAGES).every((s) => Object.values(s).every((v) => v in rank))).toBe(true);
  });
  it('18. the staff\'s solutions never leak before they are spoken — the right meal, the refund, the dessert, someone coming, the quieter room, room 305, the new key (artwork counts as information)', () => {
    const FACTS: [string, RegExp][] = [
      ['fix.line.bring', /right meal|right one|המנה הנכונה|el correcto|le bon/i],
      ['fix.line.refund', /refund|money back|הכסף חוזר|reembolso|rembourse|💰/i],
      ['fix.line.dessert', /dessert|postre|קינוח|🍰/i],
      ['fix.line.send', /send someone|someone is coming|someone comes|מישהו|alguien|quelqu’un|👨‍🔧/i],
      ['fix.line.quieter', /quieter|שקט יותר|tranquila|plus calme/i],
      ['fix.line.new-key', /305|new key|nueva llave|nouvelle clé|המפתח החדש/i],
    ];
    for (const lang of LANGS) {
      const d = day(lang);
      for (const [card, fact] of FACTS) for (const s of d.steps.slice(0, primeAt(d, card))) expect(JSON.stringify(s), `${lang} ${card}`).not.toMatch(fact);
      expect(d.steps.findIndex(isRestaurantCheck), lang).toBeGreaterThan(primeAt(d, 'fix.line.dessert'));
      expect(d.steps.findIndex(isHotelCheck), lang).toBeGreaterThan(primeAt(d, 'fix.line.new-key'));
    }
  });
  it('the hotel is a clear transition: another place, the same skill', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const p = d.steps[primeAt(d, 'fix.line.room-problem')] as Extract<BootcampStep, { kind: 'prime' }>;
      expect(p.label?.en, lang).toBe('🏨 The hotel — the same skill');
      expect(p.intro!.en, lang).toContain('🏨 Another place — the same skill');
      expect(primeAt(d, 'fix.line.room-problem'), lang).toBeGreaterThan(d.steps.findIndex(isRestaurantCheck));
    }
  });
});

describe('THE STAFF\'S SOLUTIONS — comprehension: what did they do? (29–32)', () => {
  it('29–32. "what did they do?" right after each fix is heard: the right meal (not keep the steak) · the money back · a free dessert — then someone comes · another room', () => {
    expect(MEAL_TILES.map((t) => [t.id, t.emoji])).toEqual([['right-meal', '🍝'], ['keep', '🥩']]);
    expect(RESTAURANT_TILES.map((t) => [t.id, t.emoji])).toEqual([['right-meal', '🍝'], ['refund', '💰'], ['dessert', '🍰']]);
    expect(HOTEL_TILES.map((t) => [t.id, t.emoji])).toEqual([['someone', '👨‍🔧'], ['new-room', '🔑'], ['refund', '💰']]);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.filter(isMealCheck).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_BRING, lang), 'right-meal']]);
      expect(d.steps.filter(isRestaurantCheck).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_REFUND, lang), 'refund'], [at(N_DESSERT, lang), 'dessert']]);
      expect(d.steps.filter(isHotelCheck).flatMap((s) => s.rounds.map((r) => [r.audio.en, r.correct])), lang).toEqual([[at(N_SEND, lang), 'someone'], [at(N_NEW_KEY, lang), 'new-room']]);
      // never a production target: no solution line is ever an option or a sentence to learn
      for (const line of [N_BRING, N_REFUND, N_DESSERT, N_SEND, N_NEW_KEY]) {
        for (const [, r] of quickRounds(d)) for (const o of r.options) expect(said(d, o), lang).not.toBe(at(line, lang));
        expect(d.items.some((i) => i.text === at(line, lang)), lang).toBe(false);
      }
      for (const s of [...d.steps.filter(isMealCheck), ...d.steps.filter(isRestaurantCheck), ...d.steps.filter(isHotelCheck)]) expect(s.quiet, lang).toBe(true);
      expect(d.steps.findIndex(isMealCheck), lang).toBeGreaterThan(primeAt(d, 'fix.line.bring'));
    }
  });
  it('the companion introduces the first board as the solution — never "the future"', () => {
    const d = day('en');
    expect(coachFor(d.steps, d.steps.findIndex((s) => s.kind === 'visualMatch'), BOOTCAMP_PLAN[21]!.id)!.line.en).toBe('Listen — and tap what they did to fix it.');
  });
});

describe('NO HELP — exactly the four tools (33)', () => {
  it('33. after both conversations: one speed run of four — the wrong meal · the bill · what\'s the problem · the apology — no meaning, no card, no board', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const run = d.steps.slice(lastDialogueAt(d) + 1, videoAt(d));
      expect(run.map((s) => s.kind), lang).toEqual(['receipt', 'quickReply', 'receipt']);
      const qr = run[1] as QR;
      expect(qr.challenge, lang).toBe(true);
      expect(qr.label, lang).toBeUndefined();
      for (const r of qr.rounds) { expect(r.situation, lang).toBeUndefined(); expect(r.npc, lang).toBeUndefined(); }
      expect(qr.rounds.map((r) => [strip(r.promptItemId), accepted(r)]), lang).toEqual([['reply.fix.meal', NOT_ORDERED], ['reply.fix.bill', MISTAKE], ['reply.fix.whats-the-problem', AC], ['reply.fix.so-sorry', FIX]]);
      for (const r of qr.rounds) for (const o of r.options) expect(ALL_LEARNER.map((id) => at(SAID[id]!, lang)), lang).toContain(said(d, o));
    }
  });
});

describe('THE FINAL — NEW PROBLEMS: the same functions, new details (34–37)', () => {
  it('34. after the video: ONE quick reply of five — not the conversations again', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const after = d.steps.slice(videoAt(d) + 1);
      expect(after.map((s) => s.kind), lang).toEqual(['quickReply', 'receipt', 'summary']);
      const qr = after[0] as QR;
      expect(qr.rounds.map(accepted), lang).toEqual([NOT_ORDERED, I_ORDERED, AC, FIX, MISTAKE]);
      // not a replay: the two new staff lines are not lines of the conversations, and two answers carry new details
      const lines = [...LOCKED[lang][0], ...LOCKED[lang][1]].map((l) => l.slice(5));
      expect(lines, lang).not.toContain(at(N_FISH, lang));
      expect(lines, lang).not.toContain(at(N_KEY_204, lang));
      for (const r of qr.rounds) { const o = r.options.find((x) => x.correct)!; if (o.text && o.text !== text(d, o.itemId)) expect(lines, lang).not.toContain(o.text); }
    }
  });
  it('35–36. at least three meaningful details change — four: you got fish (not steak) · you ordered chicken (not pasta) · THE KEY isn\'t working (not the AC) · the key is for room 204 (yours is 305)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const qr = d.steps[videoAt(d) + 1] as QR;
      const changedAnswers = qr.rounds.map((r) => r.options.find((o) => o.correct)!).filter((o) => o.text && o.text !== text(d, o.itemId)).map((o) => o.text);
      expect(changedAnswers, lang).toEqual([FINAL_SAID[I_ORDERED][IX[lang]], FINAL_SAID[AC][IX[lang]]]);
      const changedPrompts = qr.rounds.filter((r) => r.npc).map((r) => r.npc!.en);
      expect(changedPrompts, lang).toEqual([at(N_FISH, lang), at(N_KEY_204, lang)]);
      expect(changedAnswers.length + changedPrompts.length, lang).toBeGreaterThanOrEqual(3);
      // 36: the not-working final uses another, verified-prior object — the key, not the air conditioning
      expect(FINAL_SAID[AC][IX[lang]], lang).not.toMatch(/air|aire|climatisation/i);
    }
    expect(splitTimeBoard(newProblems[1])!.plan!.flatMap((c) => c.rows.map((r) => r.text))).toEqual(['🍽️ Ordered 🍗, got 🐟 → ⚠️ ?', '🔑 Key not working → ⚠️ ?', '🚪 Your room → 305']);
  });
  it('37. no untaught final vocabulary: every word of every final line and option is taught in this mission or verified prior', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(unpreparedWords(d, learnedBefore(lang, 22).words, lang).filter((u) => u.includes(`step ${videoAt(d) + 2} `)), lang).toEqual([]);
    }
  });
});

describe('bloat guards — one skill, not two lessons (11–15, 48–51)', () => {
  it('14–15. INTERACTION BUDGET: 21 meaningful interactions (hard ceiling 22): 12 teaching / comprehension · 4 no help · 5 final', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(interactions(d), lang).toBe(21);
      expect(interactions(d), lang).toBeLessThanOrEqual(22);
      expect(interactions({ ...d, steps: d.steps.slice(0, dialogueAt(d)) }), lang).toBe(12);
      expect(interactions({ ...d, steps: d.steps.slice(lastDialogueAt(d) + 1, videoAt(d)) }), lang).toBe(4);
      expect(interactions({ ...d, steps: d.steps.slice(videoAt(d) + 1) }), lang).toBe(5);
      // no passive card chain: never two card screens in a row, and every card screen holds a pair or more of lines (one solution card excepted)
      d.steps.forEach((s, i) => { if (s.kind === 'prime' && i > 0) expect(d.steps[i - 1]!.kind, `${lang} step ${i}`).not.toBe('prime'); });
      expect(stepsOf(d, 'prime').length, lang).toBeLessThanOrEqual(9);
    }
  });
  it('11. no grammar lesson: no past tense, no passive, no "can", no comparative, no "I\'ll" — anywhere the learner reads', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(appCopy(d), lang).not.toMatch(GRAMMAR);
      expect(stepsOf(d, 'tool').length + stepsOf(d, 'replies').length + stepsOf(d, 'quiz').length + stepsOf(d, 'swipe').length + stepsOf(d, 'matchPairs').length + stepsOf(d, 'ambush').length + stepsOf(d, 'miniMap').length, lang).toBe(0);
    }
  });
  it('12. no sentence builder', () => { for (const lang of LANGS) expect(stepsOf(day(lang), 'sentenceBuilder'), lang).toHaveLength(0); });
  it('13. no separate Flex Round: no transfer-only step, no "flex" copy — the one swap and the final are the transfer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.some((s) => 'transferOnly' in s && s.transferOnly), lang).toBe(false);
      expect(appCopy(d), lang).not.toMatch(/flex|גמיש|🔁/i);
    }
  });
  it('48–51. no score, no XP, no streak, no timer', () => {
    for (const lang of LANGS) {
      expect(appCopy(day(lang)), lang).not.toMatch(SCOREBOARD);
      expect(appCopy(day(lang)), lang).not.toMatch(/\bXP\b/);
      expect(appCopy(day(lang)), lang).not.toMatch(/streak|רצף/i);
      expect(appCopy(day(lang)), lang).not.toMatch(/timer|seconds|טיימר|שניות/i);
    }
    expect(FIX_IT.join(' ')).not.toMatch(SCOREBOARD);
  });
  it('no vocabulary deck: no shower, Wi-Fi, TV, hot water, wrong price, discount or repair words — one example per function', () => {
    for (const lang of LANGS) for (const t of speakable(day(lang))) {
      expect(t, lang).not.toMatch(/shower|wi-?fi|\bTV\b|hot water|price|discount|fee|total|ducha|precio|descuento|douche|prix|remise|repair|broken|roto|cassé|plumber|fontanero|plombier/i);
    }
  });
});

describe('the result — 🧰 FIX IT', () => {
  it('every problem fixed — and new ones handled — no score', () => {
    expect(FIX_IT[1]).toBe('🧰 FIX IT ¦ 🍽️ Restaurant: 🍽️ Ordered 🍝, got 🥩 → ✅ The right meal / 💳 Charged twice → ✅ Money back + 🍰 ‖ 🏨 Hotel: ❄️ AC not working → ✅ Someone is coming / 🔊 Noisy room → ✅ Room 305 ¦ Four problems — you said what was wrong, asked for a fix, and understood what they did. New ones too.');
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.at(-2)!.kind, lang).toBe('receipt');
      expect(JSON.stringify(d.steps.at(-2)), lang).toContain('understood what they did');
      expect(d.steps.at(-1)!.kind, lang).toBe('summary');
    }
  });
});

describe('the supported conversations — once each (47), audio never blocks (52)', () => {
  it('47. both conversations run ONCE, supported (not cold): translations on, every line glossed — after everything is taught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'dialogue').map((s) => s.dialogueId), lang).toEqual([...SCENES]);
      for (const id of SCENES) {
        expect(d.dialogues[id]!.cold, lang).toBeUndefined();
        for (const l of cinematicTranscript(d.dialogues[id]!)) { expect(l.he, lang).toBeTruthy(); if (lang !== 'en') expect(l.tr?.en, lang).toBeTruthy(); }
      }
      expect(dialogueAt(d), lang).toBeGreaterThan(primeAt(d, 'fix.line.new-key'));
    }
  });
  afterEach(() => vi.unstubAllGlobals());
  it('52. every answered line of the staff shows the choices AT ONCE, while its audio plays in parallel', async () => {
    for (const lang of LANGS) for (const id of SCENES) {
      const d = day(lang).dialogues[id]!;
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.length, `${lang} ${id}`).toBe(10); // five lines + five slow re-asks
      for (const n of answered) {
        const calls: string[] = [];
        let finish: (r: SpeakResult) => void = () => undefined;
        runNpcBeat(d, n, { speak: () => { calls.push('speak'); return new Promise<SpeakResult>((r) => { finish = r; }); }, go: (next) => calls.push(`go:${next}`), end: () => calls.push('end'), later: (fn) => fn(), cancelled: () => false });
        expect(calls, `${lang} ${n.id}`).toEqual(['speak', `go:${n.next}`]);
        finish('ended'); await Promise.resolve();
      }
    }
  });
  it('52. answering mid-line stops the staff\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const q = tts.speak(N_SO_SORRY[0], 'en');
    void tts.speak('Can you fix it?', 'en');
    expect(await q).toBe('interrupted');
    expect(synth.current?.text).toBe('Can you fix it?');
    tts.cancelSpeech();
  });
  it('the miss is asked again SLOWLY — a real beat of the conversation', () => {
    for (const lang of LANGS) for (const id of SCENES) expect(day(lang).dialogues[id]!.nodes.filter((n) => n.slow).length, `${lang} ${id}`).toBe(5);
  });
});

describe('serialisable state (53)', () => {
  it('the FIX IT state serialises, and restoring it never shows a solution early', () => {
    for (const s of Object.values(FIX_STAGES)) {
      const back = JSON.parse(JSON.stringify(fixState(s))) as ReturnType<typeof fixState>;
      expect(back).toEqual(fixState(s));
      for (const p of ['meal', 'bill', 'ac', 'noise'] as const) expect(back.solutions[p] !== null, p).toBe(s[p] === 'solved');
    }
    expect(fixState(FIX_STAGES.start).solutions).toEqual({ meal: null, bill: null, ac: null, noise: null });
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
});

describe('coverage: every meaningful chunk, accounted for (45)', () => {
  it('every chunk is really in the frozen conversations, and the chunks account for every word of them', () => {
    for (const lang of LANGS) {
      const lines = [...LOCKED[lang][0], ...LOCKED[lang][1]].map((l) => l.slice(5));
      for (const c of M22_CONCEPTS) expect(lines.some((l) => hasChunk(l, c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M22_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')));
      for (const l of lines) for (const w of plain(l).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`45. ${lang}: every chunk is COVERED here or VERIFIED PRIOR — the four tools and the staff's solutions always covered`, () => {
    const prior = learnedBefore(lang, 22);
    const rows = coverageOf(day(lang), lang, M22_CONCEPTS);
    for (const row of rows) if (!prior.knowsChunk(M22_CONCEPTS.find((x) => x.id === row.id)!.chunk[lang])) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    for (const id of ['not-ordered', 'mistake', 'the-air-conditioning', 'not-working', 'can-you-fix', 'bring-the-right-one', 'refund', 'dessert-on-the-house', 'send-someone', 'quieter-room', 'new-key', 'change-rooms', 'what-did-you-order', 'whats-the-problem']) {
      expect(rows.find((r) => r.id === id)!.covered, `${lang} ${id}`).toBe(true);
    }
  });
  it('a card is a teaching encounter; a board, a swap or a quick reply never is', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const e of teachingEncounters(d)) expect(d.steps[e.step]!.kind, lang).toBe('prime');
    }
  });
});

describe('visuals, the companion and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'quickReply' || s.kind === 'visualMatch') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk',
      'prime', 'quickReply', // the wrong meal
      'prime', 'visualMatch', // what did you order? — the fix, heard: what did they do?
      'prime', 'quickReply', // the bill: a mistake · charged twice
      'prime', 'visualMatch', // the fix, heard — what did they do?
      'prime', 'quickReply', 'swap', // 🏨 the AC isn't working — the key
      'prime', 'quickReply', // can you fix it?
      'prime', 'quickReply', // noisy — can I change rooms?
      'prime', 'visualMatch', 'receipt', // the new key — what did they do?
      'dialogue', 'receipt', 'dialogue', 'receipt',
      'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'receipt', 'summary',
    ]);
  });
  it('visual slots: artwork pending (Astra pass) — semantic emoji only; the problems and solutions stay deterministic UI', () => {
    expect(Object.keys(M22_SLOTS)).toEqual(['restaurant-problem', 'wrong-meal', 'bill-error', 'hotel-problem', 'ac-not-working', 'noisy-room', 'solution']);
    expect(Object.keys(M22_PROPS)).toEqual(['fix-it']);
    for (const slot of [...Object.values(M22_SLOTS), ...Object.values(M22_PROPS)]) { expect(slot.emoji).toBeTruthy(); expect(slot.image).toBeUndefined(); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION22_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/VISUAL PRODUCTION REQUIRED IN ASTRA PASS/);
    for (const key of [...Object.keys(M22_SLOTS), ...Object.keys(M22_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language', () => {
    const looks = new Set(Object.values(M22_SLOTS).map((s) => s.image ?? s.emoji));
    const pics = (lang: CoverageLang) => cardsOf(day(lang)).map((w) => [w.key, w.image ?? w.emoji]);
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
  });
  it('video: the standard resolver ({lang}_22.mp4) — no Mission 22 file in any language today, so the step is safely skipped; replay keeps progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[21]!.day);
      expect(Boolean(video), lang).toBe(existsSync(fileURLToPath(new URL(`../../../public/videos/${lang}/${lang}_22.mp4`, import.meta.url))));
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});
