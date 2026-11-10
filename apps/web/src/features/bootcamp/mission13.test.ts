import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HotelStaySummary, splitTimeBoard } from './HotelStaySummary.js';
import { missionVideo } from '../videos/missionVideo.js';
import { answersFollow, runNpcBeat } from './dialogueBeat.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M13_CONCEPTS } from './mission13Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  HOME_VISIT_COMPLETE, L_AFTER, L_BYE, L_HUNGRY, L_MOTHER, L_NEW, L_REST, L_SIT, L_TIRED, M13_FLEX, M13_PROPS, M13_ROOMS, M13_SLOTS,
  Y_DECLINE, Y_GO_HOME, Y_SLEEP, eveningRoute, homeBoard, homeVisitState,
} from './practiceHomeFamily.js';
import { validatePracticeStep } from './practiceEngines.js';
import { WORD_SENSES, auditWords, learnedBefore, missionContent, missionWalk, senseOf, senseWords, teachingEncounters, unpreparedChunks, unpreparedWords, type SenseRegistry } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 13 — Home, Family & Daily Routine: one natural home visit. The conversation is LOCKED. The
 * traveller knows only that a friend invited them home; the living room and mother → kitchen come from
 * the friend, while dinner at grandmother's, being tired and going home → to sleep are the LEARNER's
 * own plan and state. A short Flex Round (transfer only) proves the functions, not the frozen data.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 13): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M13_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
/** Typography only: the brief writes ’ where the content writes ' (an apostrophe is an apostrophe). */
const quotes = (s: string): string => s.replace(/[’‘]/g, "'");
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
type VM = Extract<BootcampStep, { kind: 'visualMatch' }>;
type Round = QR['rounds'][number];
const accepted = (r: Round): string => strip(r.options.find((o) => o.correct)!.itemId);
const said = (d: BootcampDayContent, r: Round): string => { const o = r.options.find((x) => x.correct)!; return o.text ?? text(d, o.itemId); };
const heardIn = (d: BootcampDayContent, r: Round): string => r.npc?.en ?? text(d, r.promptItemId);
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));
const cardsOf = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const dialogueAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'dialogue');
const isFlex = (s: BootcampStep): boolean => 'transferOnly' in s && s.transferOnly === true;
const flexAt = (d: BootcampDayContent): number[] => d.steps.flatMap((s, i) => (isFlex(s) ? [i] : []));
const supportedAt = (d: BootcampDayContent): number => Math.max(...flexAt(d)) + 2; // the flex round, then its evening receipt
const at = (x: L4, lang: CoverageLang): string => x[IX[lang]];
const withoutFlex = (d: BootcampDayContent): BootcampDayContent => ({ ...d, steps: d.steps.filter((s) => !isFlex(s)) });

/** The conversation exactly as the brief froze it (pasted verbatim). */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Hi! Come in.', 'YOU: Thanks. Your home is beautiful.', 'NPC: Thank you. Let’s sit in the living room.', 'YOU: Is this sofa new?', 'NPC: Yes, it’s new.', 'YOU: Where is your family?',
    'NPC: My mother is in the kitchen. Do you live with your family?', 'YOU: Yes, I live with my family.', 'NPC: Nice. Are you hungry? Do you want to eat with us?', 'YOU: Thanks, but I’m going to eat at my grandmother’s.',
    'NPC: Lovely! You look tired. Are you okay?', 'YOU: Yes, I’m just tired.', 'NPC: Then go home and rest!', 'YOU: Yes, I’m going home.', 'NPC: And after dinner at your grandmother’s?', 'YOU: I’m going to sleep.',
    'NPC: Ha! Good night. Say hi to your family!'],
  es: ['NPC: ¡Hola! Pasa.', 'YOU: Gracias. Tu casa es preciosa.', 'NPC: Gracias. Vamos a sentarnos en el salón.', 'YOU: ¿Este sofá es nuevo?', 'NPC: Sí, es nuevo.', 'YOU: ¿Dónde está tu familia?',
    'NPC: Mi madre está en la cocina. ¿Vives con tu familia?', 'YOU: Sí, vivo con mi familia.', 'NPC: Qué bien. ¿Tienes hambre? ¿Quieres comer con nosotros?', 'YOU: Gracias, pero voy a comer en casa de mi abuela.',
    'NPC: ¡Qué bien! Pareces cansado. ¿Estás bien?', 'YOU: Sí, solo estoy cansado.', 'NPC: ¡Entonces vete a casa y descansa!', 'YOU: Sí, me voy a casa.', 'NPC: ¿Y después de la cena en casa de tu abuela?', 'YOU: Me voy a dormir.',
    'NPC: ¡Ja! Buenas noches. ¡Saluda a tu familia!'],
  fr: ['NPC: Salut ! Entre.', 'YOU: Merci. Ta maison est très belle.', 'NPC: Merci. On s’assoit dans le salon.', 'YOU: Ce canapé est nouveau ?', 'NPC: Oui, il est nouveau.', 'YOU: Où est ta famille ?',
    'NPC: Ma mère est dans la cuisine. Tu habites avec ta famille ?', 'YOU: Oui, j’habite avec ma famille.', 'NPC: Super. Tu as faim ? Tu veux manger avec nous ?', 'YOU: Merci, mais je vais manger chez ma grand-mère.',
    'NPC: C’est bien ! Tu as l’air fatigué. Ça va ?', 'YOU: Oui, je suis juste fatigué.', 'NPC: Alors rentre chez toi et repose-toi !', 'YOU: Oui, je rentre chez moi.', 'NPC: Et après le dîner chez ta grand-mère ?', 'YOU: Je vais dormir.',
    'NPC: Ha ! Bonne nuit. Dis bonjour à ta famille !'],
};
const line = (lang: CoverageLang, i: number): string => script(lang)[i]!.slice(5);
/** The eight lines the traveller says — the same sentence ids in every language. */
const LEARNER = ['phrase.home.beautiful-home', 'phrase.home.is-this-new', 'phrase.home.where-family', 'phrase.home.live-with-family', 'phrase.home.eat-at-grandmothers', 'phrase.home.im-tired', 'phrase.home.going-home', 'phrase.home.going-to-sleep'];
const PRODUCED = [...LEARNER, 'phrase.home.thanks-but-grandmothers'];
/** Canonical transcript ([who, text], exact) — the same value before this pass (091100a) and after. */
const TRANSCRIPT_PRINT = { en: '9e0af824', es: 'b1f9987e', fr: '92ae0169' };
/** The dialogue TREE — changed on purpose: the recovery branch out; every turn a real decision, a miss re-asked. */
const DIALOGUE_PRINT = { en: '83d630d3', es: 'dcd6be3c', fr: '3c5d9dd0' };

/* Spoiler vocabularies, per fact — app language (he / en) AND each target language. */
const MOTHER = /mother|mère|madre|אמא|kitchen|cuisine|cocina|מטבח|🍳/i;
const GRANDMOTHER = /grandmother|grand-mère|abuela|סבתא/i;
const TIRED = /tired|fatigué|cansado|עייף|🥱/i;
const SLEEP = /sleep|dormir|לישון/i;

/* ── the Home Visit board reveal checker (each run, in order) ──────────────────────────────────── */

const boardOf = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''] : [];
};
/** The facts a board shows: 1 room · 2 mother → kitchen · 3 dinner → grandmother's · 4 tired · 5 next → home · 6 → sleep. */
const MARKS: [number, RegExp][] = [[1, /Room: Living room|חדר: סלון/], [2, /Mother: Kitchen|אמא: מטבח/], [3, /Dinner: Grandmother’s|ארוחת ערב: אצל סבתא/], [4, /Feeling: Tired|הרגשה: עייף/], [5, /Next: Home|הלאה: הביתה|^🧭/], [6, /Sleep|לישון/]];
const shownFacts = (s: BootcampStep): number[] => MARKS.filter(([, re]) => boardOf(s).some((b) => b.split(' ¦ ').some((p) => (p.includes('‖') || p.startsWith('🧭')) && re.test(p)))).map(([n]) => n);
/** What a step makes known for the NEXT steps: the friend's lines heard; the learner's lines SAID. */
function revealed(d: BootcampDayContent, s: BootcampStep, lang: CoverageLang): number[] {
  const heard: string[] = [];
  const spoken: string[] = [];
  if (s.kind === 'prime') heard.push(...s.words.map((w) => w.text));
  if (s.kind === 'quickReply') for (const r of s.rounds) { heard.push(heardIn(d, r)); spoken.push(said(d, r)); }
  if (s.kind === 'visualMatch') heard.push(...s.rounds.map((r) => r.audio.en));
  if (s.kind === 'quiz') heard.push(text(d, s.itemId));
  if (s.kind === 'sentenceBuilder') spoken.push(...s.rounds.map((r) => r.chunks.join(' ')));
  if (s.kind === 'dialogue') { const n = d.dialogues[s.dialogueId]!.nodes; heard.push(...n.map((x) => x.en)); spoken.push(...n.flatMap((x) => (x.choices ?? []).filter((c) => c.correct).map((c) => c.en))); }
  const out: number[] = [];
  if (heard.includes(at(L_SIT, lang))) out.push(1);
  if (heard.includes(at(L_MOTHER, lang))) out.push(2);
  for (const [n, id] of [[3, 'going-to-eat'], [4, 'just-tired'], [5, 'going-home'], [6, 'going-to-sleep']] as const) if (spoken.some((t) => hasChunk(t, chunk(id, lang)))) out.push(n);
  return out;
}
function revealViolations(d: BootcampDayContent, lang: CoverageLang, from: number, to: number, steps: readonly BootcampStep[] = d.steps): string[] {
  const known = new Set<number>();
  const bad: string[] = [];
  for (let i = from; i < to; i++) {
    const s = steps[i]!;
    for (const f of shownFacts(s)) if (!known.has(f)) bad.push(`step ${i + 1} ${s.kind} shows fact ${f} before it is revealed`);
    for (const f of revealed(d, s, lang)) known.add(f);
  }
  return bad;
}
const RUNS = (d: BootcampDayContent): [string, number, number][] => [
  ['teaching + flex', 1, supportedAt(d)], ['supported', supportedAt(d), dialogueAt(d)], ['no help', dialogueAt(d) + 1, videoAt(d)], ['final', videoAt(d) + 1, d.steps.length],
];

describe('the conversation is locked, and Mission 13 is in its place', () => {
  // Two DIFFERENT claims, kept apart:
  //   (a) the canonical transcript is BYTE-IDENTICAL to what it was before this pass (exact, no normalisation);
  //   (b) it matches the brief's pasted text once typographic apostrophes are ignored (’ vs ') — a normalised comparison.
  it('the canonical repo transcript is BYTE-IDENTICAL to the pre-pass one (091100a) — exact, no normalisation', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
    expect(line('en', 2)).toBe("Thank you. Let's sit in the living room."); // the repo's own straight apostrophe, kept as it was
  });
  for (const lang of LANGS) it(`${lang}: the brief's text, word for word — PUNCTUATION-NORMALISED comparison (apostrophe typography ignored) (tests 1–3)`, () => { expect(script(lang).map(quotes)).toEqual(LOCKED[lang].map(quotes)); });
  it('the dialogue tree is pinned: every turn a real decision, a miss is asked again slowly — no recovery branch', () => {
    for (const lang of LANGS) {
      const nodes = day(lang).dialogues['at-a-friends-home']!.nodes;
      for (const n of nodes.filter((x) => x.who === 'you')) {
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        expect(n.choices!.filter((c) => !c.correct), `${lang} ${n.id}`).toHaveLength(1);
        for (const c of n.choices!.filter((x) => !x.correct)) expect([nodes.find((x) => x.id === c.next)!.who, nodes.find((x) => x.id === c.next)!.slow, nodes.find((x) => x.id === c.next)!.next]).toEqual(['npc', true, n.id]);
      }
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('4. Mission 13 is "Home, Family & Daily Routine", thirteenth on the journey', () => {
    expect(BOOTCAMP_PLAN[12]!.id).toBe('home-family');
    expect(missionNumber(BOOTCAMP_PLAN[12]!.day)).toBe(13);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Home, Family & Daily Routine');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('5. Missions 01–12 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 12)).toEqual({ en: '3653c2a7', es: '1fb40bdf', fr: 'a82d32df' }); });
  it('6. Missions 19–30 (Missions 16–18 have their own passes since: mission16.test.ts … mission18.test.ts) are byte-for-byte unchanged by this pass — Missions 14 and 15 have their own passes since (mission14.test.ts, mission15.test.ts); the Everyday checkpoint still reuses the same sentences', () => {
    expect(raw(18, 23)).toEqual({ en: '2610dcde', es: 'b7abb616', fr: '223af58a' }); expect(raw(24)).toEqual({ en: 'aee7fe64', es: '4b9c9cd9', fr: '6af8deb0' }); // Mission 24 left out: its own correction since (the "should" card — practiceCity.test.ts)
    for (const lang of LANGS) for (const id of ['phrase.home.going-home', 'phrase.home.where-family']) expect(day(lang).items.map((i) => strip(i.id)), `${lang} ${id}`).toContain(id);
  });
  it('7. EN / ES / FR parity: the same journey, step for step, each in its own words', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.transferOnly ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.transferOnly ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.label, s.rounds.map((r) => [strip(r.itemId), r.chunks.length])];
      if (s.kind === 'quiz') return [s.kind, strip(s.itemId), s.wrongIds.map(strip)];
      if (s.kind === 'prime') return [s.kind, s.label, s.intro, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.review, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(day(lang)), lang).toEqual(shape(day('en')));
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
    }
  });
});

describe('roles — the traveller says the eight locked lines; the friend is understood', () => {
  const productions = (d: BootcampDayContent): { id: string; text: string }[] => [
    ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map((r) => ({ id: accepted(r), text: said(d, r) }))),
    ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => ({ id: strip(r.itemId), text: r.chunks.join(' ') }))),
  ];
  it('8. every line the traveller produces is a locked YOU line — and all eight are produced whole', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const you = LOCKED[lang].filter((l) => l.startsWith('YOU')).map((l) => quotes(l.slice(5)));
      expect(new Set(productions(d).map((p) => p.id)), lang).toEqual(new Set(PRODUCED));
      for (const p of productions(d)) expect(you.some((y) => hasChunk(y, p.text)), `${lang} “${p.text}”`).toBe(true);
      for (const y of you) expect(productions(d).some((p) => quotes(p.text) === y), `${lang} “${y}” is produced whole`).toBe(true);
    }
  });
  it('9. the friend\'s lines are comprehension only — never an answer to pick', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const offered = stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => o.text ?? text(d, o.itemId))));
      for (const c of M13_CONCEPTS.filter((x) => x.role === 'hear' && !['thank-you', 'hi'].includes(x.id))) expect(offered.some((o) => hasChunk(o, c.chunk[lang])), `${lang} ${c.id}`).toBe(false);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(LEARNER, lang).toContain(strip(o.itemId));
    }
  });
  it('10. no line of the friend is ever a builder target; the one builder is the learner\'s polite decline', () => {
    for (const lang of LANGS) {
      const b = stepsOf(day(lang), 'sentenceBuilder');
      expect(b.map((s) => strip(s.rounds[0]!.itemId))).toEqual(['phrase.home.thanks-but-grandmothers']);
      for (const c of M13_CONCEPTS.filter((x) => x.role === 'hear' && !['thank-you'].includes(x.id))) expect(hasChunk(b[0]!.rounds[0]!.chunks.join(' '), c.chunk[lang]), `${lang} ${c.id}`).toBe(false);
    }
  });
});

describe('the opening briefing — an invitation home, nothing more', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('the briefing is the brief\'s Hebrew line, and the only opening card', () => {
    for (const lang of LANGS) {
      expect(briefing(lang).body.map((x) => x.he)).toEqual(['חבר הזמין אותך אליו הביתה. תדברו קצת על הבית, המשפחה ומה שאתה עושה בהמשך הערב.']);
      expect(briefing(lang).title.en).toBe('Mission 13: Home, Family & Daily Routine');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
    }
  });
  it('it names no mother, kitchen, grandmother, tiredness or sleep', () => {
    for (const lang of LANGS) for (const re of [MOTHER, GRANDMOTHER, TIRED, SLEEP]) expect(JSON.stringify(briefing(lang)), `${lang} ${re}`).not.toMatch(re);
  });
});

describe('the Home Visit board — "?" until the visit says it', () => {
  it('11. it starts unknown, and so does the state', () => {
    expect(homeBoard(0)[1]).toBe('🏠 Home: Room ? / Family ? ‖ 🌙 My evening: Dinner ? / Feeling ? / Next ?');
    expect(homeVisitState(0)).toEqual({ conversationStage: 'nothing', homeRoom: null, familyLocation: null, dinnerPlan: null, feeling: null, nextSteps: [] });
    expect(eveningRoute(0)).toBeNull();
    for (const lang of LANGS) expect(boardOf(day(lang).steps[1]!).join(' ')).toContain(homeBoard(0)[1]);
  });
  it('12–16. each fact appears first right after the line that reveals it — never before (whole mission)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const firstFact = (n: number) => d.steps.findIndex((s) => shownFacts(s).includes(n));
      expect(firstFact(1), lang).toBe(primeAt(d, 'home.line.sit') + 1); // 12: after "Let's sit in the living room"
      expect(firstFact(2), lang).toBeGreaterThan(primeAt(d, 'home.line.mother')); // 13: after the friend says it
      expect(firstFact(3), lang).toBe(d.steps.findIndex((s) => s.kind === 'sentenceBuilder') + 1); // 14: after YOU explain your plan
      const tiredAnswer = d.steps.findIndex((s) => s.kind === 'quickReply' && s.rounds.some((r) => accepted(r) === 'phrase.home.im-tired'));
      expect(firstFact(4), lang).toBe(tiredAnswer + 1); // 15: after YOUR answer
      const homeAnswer = d.steps.findIndex((s) => s.kind === 'quickReply' && s.rounds.some((r) => accepted(r) === 'phrase.home.going-home'));
      expect(firstFact(5), lang).toBe(homeAnswer + 1); // 16: home, after you say it…
      const sleepAnswer = d.steps.findIndex((s) => s.kind === 'quickReply' && s.rounds.some((r) => accepted(r) === 'phrase.home.going-to-sleep'));
      expect(firstFact(6), lang).toBe(sleepAnswer + 1); // …and sleep, after you say that
    }
  });
  it('17. no future leakage in any run (teaching + flex, supported, no help, final)', () => {
    for (const lang of LANGS) for (const [name, from, to] of RUNS(day(lang))) expect(revealViolations(day(lang), lang, from, to), `${lang} ${name}`).toEqual([]);
  });
  it('spoilers by word: the mother / kitchen, grandmother, tiredness and sleep first appear on the card of their own line', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const first = (re: RegExp) => d.steps.findIndex((s, i) => i > 0 && re.test(JSON.stringify(s)));
      expect(first(MOTHER), lang).toBe(primeAt(d, 'home.line.mother'));
      expect(first(GRANDMOTHER), lang).toBe(primeAt(d, 'home.line.decline'));
      expect(first(TIRED), lang).toBe(primeAt(d, 'home.line.tired-q'));
      expect(first(SLEEP), lang).toBe(primeAt(d, 'home.line.sleep'));
      // …and inside the invitation card step, the invitation comes before your plan.
      const inv = (d.steps[primeAt(d, 'home.line.decline')] as Extract<BootcampStep, { kind: 'prime' }>).words.map((w) => w.key);
      expect(inv).toEqual(['home.line.hungry', 'home.line.decline']);
    }
  });
});

describe('family location — semantic rooms, not tile positions', () => {
  const roomBoards = (d: BootcampDayContent) => stepsOf(d, 'visualMatch') as VM[];
  it('18. mother → kitchen: the answer is the room id, heard in the friend\'s own line', () => {
    for (const lang of LANGS) {
      const canonical = roomBoards(day(lang)).filter((s) => !s.transferOnly);
      expect(canonical, lang).toHaveLength(2); // taught once, captured again in the final
      for (const s of canonical) expect(s.rounds.map((r) => [r.audio.en, r.correct])).toEqual([[at(L_MOTHER, lang), 'kitchen']]);
    }
  });
  it('19. correctness is never position: the boards are shuffled, and the SAME two tiles have different answers (canonical vs flex)', () => {
    for (const lang of LANGS) {
      const all = roomBoards(day(lang));
      for (const s of all) { expect(s.ordered).toBeUndefined(); expect(s.tiles).toEqual([M13_ROOMS['living-room'], M13_ROOMS.kitchen]); }
      expect(new Set(all.map((s) => s.rounds[0]!.correct))).toEqual(new Set(['kitchen', 'living-room']));
    }
    expect(readFileSync(fileURLToPath(new URL('./PracticeSteps.tsx', import.meta.url)), 'utf8')).toMatch(/step\.ordered \? step\.tiles : shuffle\(step\.tiles/);
  });
  it('20. living room and kitchen are meaningful rooms: ids are the rooms, captions in the app language — never an emoji alone', () => {
    expect(M13_ROOMS['living-room']).toEqual({ id: 'living-room', emoji: '🛋️', caption: { he: 'סלון', en: 'Living room' } });
    expect(M13_ROOMS.kitchen).toEqual({ id: 'kitchen', emoji: '🍳', caption: { he: 'מטבח', en: 'Kitchen' } });
    expect(homeVisitState(2).familyLocation).toEqual({ person: 'mother', room: 'kitchen' });
    expect(homeVisitState(1).homeRoom).toBe('living-room');
  });
});

describe('the learner\'s initiative — two questions nobody asked', () => {
  it('21–23. "Is this sofa new?" and "Where is your family?" follow a statement or a situation — never a question they would answer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const nodes = d.dialogues['at-a-friends-home']!.nodes;
      for (const id of ['phrase.home.is-this-new', 'phrase.home.where-family']) {
        const ask = nodes.find((n) => n.choices?.some((c) => c.correct && strip(c.itemId) === id))!;
        const before = nodes.find((n) => n.next === ask.id && n.who === 'npc' && !n.slow)!;
        expect(before.en, `${lang} ${id}`).not.toMatch(/\?/);
        for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
          if (accepted(r) !== id) continue;
          if (r.situation) expect(r.situation.en).toBe('You want to know where your friend’s family is.');
          else expect(heardIn(d, r), `${lang} ${id}`).not.toMatch(/\?/);
        }
      }
      expect(at(L_SIT, lang)).not.toMatch(/\?/);
      expect(at(L_NEW, lang)).not.toMatch(/\?/);
    }
  });
});

describe('the polite decline — thank → but → my plan', () => {
  it('24–25. the invitation comes first; the grandmother plan never appears before it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(primeAt(d, 'home.line.hungry')).toBe(primeAt(d, 'home.line.decline'));
      for (const s of d.steps.slice(1, primeAt(d, 'home.line.hungry'))) expect(JSON.stringify(s), lang).not.toMatch(GRANDMOTHER);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) if (accepted(r) === 'phrase.home.eat-at-grandmothers') expect(heardIn(d, r), lang).toBe(at(L_HUNGRY, lang));
    }
  });
  it('26. the builder uses each language\'s own chunks', () => {
    const c = (lang: CoverageLang) => stepsOf(day(lang), 'sentenceBuilder')[0]!.rounds[0]!.chunks;
    expect(c('en')).toEqual(['Thanks, but', "I'm going to eat", "at my grandmother's."]);
    expect(c('fr')).toEqual(['Merci, mais', 'je vais manger', 'chez ma grand-mère.']);
    expect(c('es')).toEqual(['Gracias, pero', 'voy a comer', 'en casa de mi abuela.']);
  });
  it('27. the learner produces the exact locked line (built, and chosen in every run)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'sentenceBuilder')[0]!.rounds[0]!.chunks.join(' ')).toBe(at(Y_DECLINE, lang));
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) if (accepted(r) === 'phrase.home.eat-at-grandmothers') expect(said(d, r)).toBe(at(Y_DECLINE, lang));
      expect(quotes(at(Y_DECLINE, lang))).toBe(quotes(LOCKED[lang][9]!.slice(5)));
    }
  });
});

describe('going / routine — three useful chunks, no grammar', () => {
  it('28. no grammar lesson is needed for "going to": no rule, no tense, no table in the app-language copy', () => {
    for (const lang of LANGS) expect(appCopy(day(lang)), lang).not.toMatch(/grammar|tense|future|present continuous|going-to|conjugat|preposition|possessive|דקדוק|זמן עתיד|הווה|נטייה|פועל|מילת יחס/i);
  });
  it('29–30. going home = where now; going to sleep = what\'s next — each its own card, its own answer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).find((w) => w.key === 'home.line.going-home')!.meaning.en).toMatch(/where now: home/);
      expect(cardsOf(d).find((w) => w.key === 'home.line.sleep')!.meaning.en).toMatch(/what’s next: sleep/);
      expect(cardsOf(d).find((w) => w.key === 'home.line.going-home')!.text).toBe(at(Y_GO_HOME, lang));
      expect(cardsOf(d).find((w) => w.key === 'home.line.sleep')!.text).toBe(at(Y_SLEEP, lang));
    }
  });
  it('31. no English rule forced on French or Spanish: each says "home" its own way', () => {
    expect(at(Y_GO_HOME, 'fr')).toBe('Oui, je rentre chez moi.'); // not "je vais à la maison"
    expect(at(Y_GO_HOME, 'es')).toBe('Sí, me voy a casa.');
    expect(at(Y_SLEEP, 'fr')).toBe('Je vais dormir.');
    expect(at(Y_SLEEP, 'es')).toBe('Me voy a dormir.');
    for (const lang of ['fr', 'es'] as const) for (const x of stepsOf(day(lang), 'sentenceBuilder')[0]!.rounds[0]!.chunks) expect(stepsOf(day('en'), 'sentenceBuilder')[0]!.rounds[0]!.chunks).not.toContain(x);
  });
});

describe('the FLEX ROUND — transfer only, no new language, no contamination', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 13);
  /** Words taught before the Flex Round: prior learning + Mission 13's own teaching up to the first flex step. */
  const knownBeforeFlex = (d: BootcampDayContent, lang: CoverageLang): Set<string> => {
    const first = flexAt(d)[0]!;
    return new Set([...prior(lang).words, ...missionWalk(d).taught.filter((e) => e.at < first).flatMap((e) => auditWords(e.text))]);
  };
  const flexTexts = (d: BootcampDayContent): string[] => flexAt(d).flatMap((i) => {
    const s = d.steps[i]!;
    return s.kind === 'visualMatch' ? s.rounds.map((r) => r.audio.en) : s.kind === 'quickReply' ? s.rounds.flatMap((r) => [...(r.npc ? [r.npc.en] : []), ...r.options.map((o) => o.text ?? text(d, o.itemId))]) : [];
  });
  it('32. at most 3 interactions — here 2, after the whole canonical conversation has been taught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const n = flexAt(d).reduce((k, i) => k + ((d.steps[i] as QR | VM).rounds.length), 0);
      expect(n, lang).toBe(2);
      expect(flexAt(d)[0]!, lang).toBeGreaterThan(primeAt(d, 'home.line.bye'));
      expect(Math.max(...flexAt(d)), lang).toBeLessThan(dialogueAt(d));
    }
  });
  it('33. every flex step is marked transferOnly — and only flex steps are', () => {
    expect(M13_FLEX.transferOnly).toBe(true);
    for (const lang of LANGS) {
      const d = day(lang);
      expect(flexAt(d).map((i) => d.steps[i]!.kind), lang).toEqual(['visualMatch', 'quickReply']);
      for (const i of flexAt(d)) expect((boardOf(d.steps[i]!)[1] ?? '').startsWith('🔁 Flex round'), lang).toBe(true);
      for (const n of BOOTCAMP_PLAN.map((_, k) => k + 1).filter((k) => k !== 13 && k !== 14 && k !== 17)) expect(missionContent(lang, n).steps.some(isFlex), `${lang} M${n}`).toBe(false); // Mission 14 has its own (mission14.test.ts); Mission 17's two transfer checks too (mission17.test.ts)
    }
  });
  it('34. transferOnly content is never canonical: not a dialogue line, not a sentence of the course', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const audio = at(M13_FLEX.location.audio, lang);
      expect(JSON.stringify(d.dialogues), lang).not.toContain(audio);
      expect(d.items.map((i) => i.text), lang).not.toContain(audio);
      expect(script(lang).map((l) => l.slice(5)), lang).not.toContain(audio);
    }
  });
  it('35. transferOnly content creates no prior learning: learnedBefore(14) is identical with or without the Flex Round', () => {
    for (const lang of LANGS) {
      const without = (l: CoverageLang, n: number) => (n === 13 ? withoutFlex(missionContent(l, n)) : missionContent(l, n));
      const a = learnedBefore(lang, 14);
      const b = learnedBefore(lang, 14, without);
      expect([...a.words].sort(), lang).toEqual([...b.words].sort());
      expect(a.concepts, lang).toEqual(b.concepts);
      expect(teachingEncounters(day(lang)).some((e) => isFlex(day(lang).steps[e.step]!)), lang).toBe(false);
      for (const c of M13_CONCEPTS) expect(encounters(day(lang), c.chunk[lang]).some((e) => flexAt(day(lang)).includes(e.step - 1)), `${lang} ${c.id}`).toBe(false);
    }
  });
  it('36–37. no new word: every word of the flex round was taught before it (mother → living room is pure recombination)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const known = knownBeforeFlex(d, lang);
      for (const t of flexTexts(d)) for (const w of auditWords(t)) expect(known.has(w), `${lang} “${w}” in “${t}”`).toBe(true);
      // the recombination's two halves were each taught as part of a canonical line
      const audio = at(M13_FLEX.location.audio, lang);
      expect(hasChunk(at(L_MOTHER, lang), { en: 'My mother is in the', es: 'Mi madre está en', fr: 'Ma mère est dans' }[lang]), lang).toBe(true);
      expect(hasChunk(at(L_SIT, lang), { en: 'the living room', es: 'el salón', fr: 'le salon' }[lang]), lang).toBe(true);
      expect(hasChunk(audio, { en: 'living room', es: 'salón', fr: 'salon' }[lang]), lang).toBe(true);
    }
  });
  it('38. an unknown-word recombination fails the audit ("My brother is upstairs")', () => {
    const d = day('en');
    const i = flexAt(d)[0]!;
    const vm = d.steps[i] as VM;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, k) => (k === i ? { ...vm, rounds: [{ ...vm.rounds[0]!, audio: { en: 'My brother is upstairs.', he: 'x' } }] } : s)) };
    expect(unpreparedWords(planted, prior('en').words).join(' ')).toMatch(/“brother”.*“upstairs”|“upstairs”.*“brother”|“brother”/);
    expect(unpreparedWords(d, prior('en').words)).toEqual([]);
  });
  it('NO CURRICULUM CONTAMINATION: "my brother is upstairs" placed only in an earlier dialogue is still not learned — the flex audit still fails', () => {
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 12) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} My brother is upstairs.` } : x)) } } };
    };
    const earlier = learnedBefore('en', 13, seen);
    expect(earlier.words.has('brother')).toBe(false);
    expect(earlier.words.has('upstairs')).toBe(false);
    const d = day('en');
    const i = flexAt(d)[0]!;
    const vm = d.steps[i] as VM;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, k) => (k === i ? { ...vm, rounds: [{ ...vm.rounds[0]!, audio: { en: 'My brother is upstairs.', he: 'x' } }] } : s)) };
    expect(unpreparedWords(planted, earlier.words).join(' ')).toMatch(/“brother”/);
  });
});

describe('PRIOR LEARNING — verified, not assumed (learnedBefore(lang, 13))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 13);
  it('built from Missions 01–12, and reuses only what they really taught', () => {
    for (const lang of LANGS) {
      const p = prior(lang);
      expect(p.missions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      expect(p.knowsChunk(chunk('thanks', lang)), `${lang} thanks`).toBe(true);
      expect(p.knowsChunk({ en: 'Where is', es: '¿Dónde está', fr: 'Où est' }[lang]), `${lang} where is`).toBe(true);
      for (const id of ['home-beautiful', 'sit-living-room', 'sofa-new', 'where-family', 'mother-kitchen', 'live-with', 'hungry', 'thanks-but', 'going-to-eat', 'look-tired', 'just-tired', 'going-home', 'going-to-sleep', 'after-dinner', 'say-hi'])
        expect(p.knowsChunk(chunk(id, lang)), `${lang} ${id} is new`).toBe(false);
      for (const w of { en: ['family', 'mother', 'kitchen', 'grandmother', 'tired', 'sleep', 'sofa', 'hungry'], es: ['familia', 'madre', 'abuela', 'cansado', 'dormir', 'sofá', 'hambre'], fr: ['famille', 'mère', 'fatigué', 'dormir', 'canapé', 'faim'] }[lang]) expect(p.words.has(w), `${lang} ${w} is new`).toBe(false);
      if (lang === 'fr') expect(p.knowsChunk('grand-mère')).toBe(false); // "grand" alone IS prior — the whole word is not
    }
  });
  it('partial prior: "Thanks" is known, the plan is new — the builder keeps them apart; "Where is" is known, "your family" is new', () => {
    for (const lang of LANGS) {
      const [thanksBut, eat, place] = stepsOf(day(lang), 'sentenceBuilder')[0]!.rounds[0]!.chunks;
      expect(prior(lang).knowsChunk(chunk('thanks', lang)), lang).toBe(true);
      expect(prior(lang).knowsChunk(thanksBut!), lang).toBe(false); // "Thanks, but" as a unit is new
      expect(prior(lang).knowsChunk(`${eat!} ${place!}`), lang).toBe(false);
      expect(prior(lang).knowsChunk({ en: 'your family', es: 'tu familia', fr: 'ta famille' }[lang]), lang).toBe(false);
    }
  });
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M13_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`STRICT TEACH-BEFORE-TEST — ${lang}: every tested word taught here or verifiably prior; every chunk taught before it is tested`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
      expect(unpreparedChunks(day(lang), lang, M13_CONCEPTS)).toEqual([]);
    });
  }
  it('negative mutations: without the family, decline, tired or sleep card, the retrieval is unprepared', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (...keys: string[]): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => !keys.includes(w.key ?? '')) } : s)) });
      expect(unprepared(without('home.line.where-family'), lang).join(' '), lang).toMatch(/where-family/);
      expect(unprepared(without('home.line.decline'), lang).join(' '), lang).toMatch(/going-to-eat|thanks-but/);
      expect(unprepared(without('home.line.just-tired'), lang).join(' '), lang).toMatch(/just-tired/);
      expect(unprepared(without('home.line.sleep'), lang).join(' '), lang).toMatch(/going-to-sleep/);
    }
  });
  it('negative mutations: mother → kitchen shown too early, or the grandmother plan in the briefing, is caught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const early = d.steps.map((s, i) => (i === 1 && s.kind === 'prime' ? { ...s, intro: { he: homeBoard(2)[0], en: homeBoard(2)[1] } } : s));
      expect(revealViolations(d, lang, 1, supportedAt(d), early).join(' '), lang).toMatch(/fact 2/);
      const talk = d.steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
      const spoiled = { ...talk, body: [...talk.body, { he: 'אחר כך: ארוחת ערב אצל סבתא.', en: "Later: dinner at your grandmother's." }] };
      expect(JSON.stringify(spoiled)).toMatch(GRANDMOTHER);
    }
  });
});

describe('integration — situations map to functions', () => {
  const situations = (d: BootcampDayContent): [string, string][] => stepsOf(d, 'quickReply').flatMap((s) => s.rounds.filter((r) => r.situation).map((r): [string, string] => [r.situation!.en!, accepted(r)]));
  it('39–40. entering → the compliment; wanting to know where the family is → the question', () => {
    for (const lang of LANGS) {
      expect(situations(day(lang)), lang).toContainEqual(['You enter a friend’s home.', 'phrase.home.beautiful-home']);
      expect(situations(day(lang)), lang).toContainEqual(['You want to know where your friend’s family is.', 'phrase.home.where-family']);
    }
  });
  it('41. the decline answers the food invitation, and its card names the existing plan', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).find((w) => w.key === 'home.line.decline')!.meaning.en).toMatch(/thank → but → your plan/);
      expect(stepsOf(d, 'quickReply').flatMap((s) => s.rounds).filter((r) => accepted(r) === 'phrase.home.eat-at-grandmothers').every((r) => heardIn(d, r) === at(L_HUNGRY, lang))).toBe(true);
    }
  });
  it('42–44. "Are you okay?" → just tired; "go home and rest" → going home; after dinner → sleep', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const rounds = stepsOf(d, 'quickReply').flatMap((s) => s.rounds);
      expect(rounds.filter((r) => accepted(r) === 'phrase.home.im-tired').every((r) => heardIn(d, r) === at(L_TIRED, lang))).toBe(true);
      expect(rounds.filter((r) => accepted(r) === 'phrase.home.going-home').every((r) => heardIn(d, r) === at(L_REST, lang))).toBe(true);
      expect(rounds.filter((r) => accepted(r) === 'phrase.home.going-to-sleep').every((r) => (r.situation ? r.situation.en === 'After dinner at your grandmother’s — what’s next?' : heardIn(d, r) === at(L_AFTER, lang)))).toBe(true);
      expect(situations(d), lang).toContainEqual(['After dinner at your grandmother’s — what’s next?', 'phrase.home.going-to-sleep']);
    }
  });
});

describe('the conversation runs — supported, no help, final', () => {
  const runAnswers = (d: BootcampDayContent, from: number, to: number): string[] => d.steps.slice(from, to).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map(accepted) : s.kind === 'visualMatch' ? s.rounds.map((r) => `🏠${r.correct}`) : []));
  it('45–46. the supported visit: all eight lines in order — the board and the route fill as it goes', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, supportedAt(d), dialogueAt(d)), lang).toEqual(LEARNER);
      expect(revealViolations(d, lang, supportedAt(d), dialogueAt(d)), lang).toEqual([]);
      for (const s of d.steps.slice(supportedAt(d), dialogueAt(d))) if (s.kind === 'quickReply') { expect(splitTimeBoard(s.label!.en ?? '')!.plan, lang).toBeTruthy(); for (const r of s.rounds) expect(r.promptItemId, lang).toBeDefined(); }
      expect((d.steps[dialogueAt(d) - 1] as Extract<BootcampStep, { kind: 'receipt' }>).text.en).toContain(homeBoard(6)[1]);
    }
  });
  it('47–48. no help: the board starts unknown (none at first), then shows only what this run has said', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, dialogueAt(d) + 1, videoAt(d)), lang).toEqual(LEARNER);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect((run[0] as QR).label).toBeUndefined();
      expect(run.some((s) => s.kind === 'prime')).toBe(false);
      for (const s of run) if (s.kind === 'quickReply') { expect(s.challenge).toBe(true); for (const r of s.rounds) expect(r.npc).toBeDefined(); if (s.label) expect(splitTimeBoard(s.label.en ?? '')!.after).toEqual([]); }
      expect(revealViolations(d, lang, dialogueAt(d) + 1, videoAt(d)), lang).toEqual([]);
      expect(run.flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map((r) => r.npc!.en) : []))).toEqual([0, 2, 4, 6, 8, 10, 12, 14].map((i) => line(lang, i)));
    }
  });
  it('49. the final tests every key function: compliment, sofa, family, mother → kitchen, live with, decline, tired, home, sleep', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, videoAt(d) + 1, d.steps.length), lang).toEqual([...LEARNER.slice(0, 3), '🏠kitchen', ...LEARNER.slice(3)]);
      expect((d.steps[videoAt(d) + 1] as QR).label!.he).toContain('ביקור אצל חבר. תנהל את השיחה ותסגור את הערב שלך.');
      expect(revealViolations(d, lang, videoAt(d) + 1, d.steps.length), lang).toEqual([]);
    }
  });
  it('50. 🏠 HOME VISIT COMPLETE only once, at the very end — the summary, no score', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const ends = d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('HOME VISIT COMPLETE'));
      expect(ends.map(([, i]) => i), lang).toEqual([d.steps.length - 2]);
      expect((ends[0]![0] as Extract<BootcampStep, { kind: 'receipt' }>).text).toEqual({ he: HOME_VISIT_COMPLETE[0], en: HOME_VISIT_COMPLETE[1] });
      expect(HOME_VISIT_COMPLETE[1]).toBe('🏠 HOME VISIT COMPLETE ¦ 🧭 Now: Friend’s home ● → Home · rest → Dinner at grandmother’s → Sleep ¦ 🏠 Home: Room: Living room / Mother: Kitchen ‖ 🌙 My evening: Dinner: Grandmother’s / Feeling: Tired / Next: Home → Sleep');
      expect(HOME_VISIT_COMPLETE[1]).not.toMatch(/%|points|score|\d+\/\d+/i);
      expect(d.steps.at(-1)!.kind).toBe('summary');
    }
  });
});

describe('audio never blocks the answer (the approved conversation behaviour)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const beat = (lang: CoverageLang, id: string) => {
    const d = day(lang).dialogues['at-a-friends-home']!;
    const calls: string[] = [];
    let finish: (r: SpeakResult) => void = () => undefined;
    runNpcBeat(d, d.nodes.find((n) => n.id === id)!, {
      speak: () => { calls.push('speak'); return new Promise<SpeakResult>((r) => { finish = r; }); },
      go: (next) => calls.push(`go:${next}`), end: () => calls.push('end'), later: (fn) => fn(), cancelled: () => false,
    });
    return { calls, finish: async (r: SpeakResult) => { finish(r); await Promise.resolve(); await Promise.resolve(); } };
  };
  it('51–53. every answered line of the friend shows the choices AT ONCE, while its audio plays in parallel', async () => {
    for (const lang of LANGS) {
      const d = day(lang).dialogues['at-a-friends-home']!;
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.length, lang).toBe(16); // the eight lines + their slow re-asks
      for (const n of answered) {
        const run = beat(lang, n.id);
        expect(run.calls, `${lang} ${n.id}`).toEqual(['speak', `go:${n.next}`]);
        await run.finish('ended');
        expect(run.calls.filter((c) => c.startsWith('go:'))).toHaveLength(1);
      }
      const bye = beat(lang, d.nodes.find((n) => n.end)!.id);
      expect(bye.calls).toEqual(['speak']);
      await bye.finish('ended');
      expect(bye.calls.at(-1)).toBe('end');
    }
  });
  it('54. answering mid-line stops the friend\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, spoken: [] as string[], getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; this.spoken.push(u.text); } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const invite = tts.speak(L_HUNGRY[0], 'en');
    void tts.speak(Y_DECLINE[0], 'en');
    expect(await invite).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_DECLINE[0]);
    tts.cancelSpeech();
    expect(synth.current).toBeNull();
  });
  it('55. replay stays: the conversation and the quick replies keep their 🔊 replay; nothing waits for "audio finished"', () => {
    const read = (f: string): string => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    expect(read('./Bootcamp.tsx')).toContain("🔊 {t('replayQuestion')}");
    expect(read('./PracticeSteps.tsx')).toMatch(/AudioBubble onPlay=/);
    expect(read('./PracticeSteps.tsx')).not.toMatch(/audioFinished|hasFinishedSpeaking|showChoicesAfterAudio|onAudioEnded/);
  });
});

describe('serialisable state', () => {
  it('56–57. the Home Visit board state and the evening route serialise', () => {
    for (let n = 0; n <= 6; n++) {
      const s = homeVisitState(n as 0);
      expect(JSON.parse(JSON.stringify(s))).toEqual(s);
      const r = eveningRoute(n as 0);
      expect(JSON.parse(JSON.stringify(r))).toEqual(r);
    }
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
  });
  it('58. the Flex Round state serialises', () => { expect(JSON.parse(JSON.stringify(M13_FLEX))).toEqual(M13_FLEX); });
  it('59. restoring a state never leaks the future: each stage holds only what was revealed by then', () => {
    for (let n = 0; n <= 6; n++) {
      const s = JSON.parse(JSON.stringify(homeVisitState(n as 0))) as ReturnType<typeof homeVisitState>;
      expect(s.homeRoom === null).toBe(n < 1);
      expect(s.familyLocation === null).toBe(n < 2);
      expect(s.dinnerPlan === null).toBe(n < 3);
      expect(s.feeling === null).toBe(n < 4);
      expect(s.nextSteps).toEqual(n >= 6 ? ['home', 'sleep'] : n >= 5 ? ['home'] : []);
      expect(eveningRoute(n as 0) === null).toBe(n < 5);
      if (n < 6) expect(JSON.stringify([homeBoard(n as 0), eveningRoute(n as 0)])).not.toMatch(SLEEP);
    }
  });
});

describe('coverage: every meaningful chunk, no orphan', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M13_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(quotes(l.slice(5)), quotes(c.chunk[lang]))), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M13_CONCEPTS.flatMap((c) => plain(quotes(c.chunk[lang])).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(quotes(l.slice(5))).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`${lang}: every chunk is COVERED (3+ encounters, 2+ kinds, meaning shown, heard or retrieved) — without the Flex Round`, () => {
    for (const row of coverageOf(day(lang), lang, M13_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    expect(coverageOf(withoutFlex(day(lang)), lang, M13_CONCEPTS)).toEqual(coverageOf(day(lang), lang, M13_CONCEPTS));
  });
  it('80/20: the five reusable functions get the most retrieval; the compliment and the sofa are not over-taught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const n = (id: string) => encounters(d, chunk(id, lang)).filter((e) => e.kind === 'retrieval').length;
      for (const id of ['where-family', 'going-to-eat', 'going-home', 'live-with', 'just-tired']) expect(n(id), `${lang} ${id}`).toBeGreaterThanOrEqual(5);
      for (const id of ['home-beautiful', 'sofa-new']) expect(n(id), `${lang} ${id}`).toBeLessThan(n('where-family'));
    }
  });
  it('34 meaningful interactions (target 31–34), 2 of them the Flex Round — counted the same way as Missions 11–12', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const n = d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
        : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);
      expect(n, lang).toBe(34);
    }
  });
});

describe('no bad pedagogy', () => {
  it('no room or family vocabulary list, no emoji answer as the main mechanic, no recovery phrase', () => {
    const lone = /^(living room|kitchen|sofa|mother|family|grandmother|home|tired|sleep|salon|cuisine|canapé|mère|famille|grand-mère|maison|fatigué|dormir|salón|cocina|sofá|madre|familia|abuela|casa|cansado)$/i;
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) expect(plain(w.text).trim(), lang).not.toMatch(lone);
      for (const s of stepsOf(d, 'visualMatch')) for (const t of s.tiles) { expect(t.caption, lang).toBeDefined(); expect(t.image).toBeUndefined(); }
      expect(JSON.stringify(d), lang).not.toMatch(/recovery\./);
      expect(stepsOf(d, 'ambush').length + stepsOf(d, 'swipe').length + stepsOf(d, 'tool').length + stepsOf(d, 'replies').length + stepsOf(d, 'swap').length + stepsOf(d, 'matchPairs').length, lang).toBe(0);
      expect(JSON.stringify(d), lang).not.toMatch(/brother|sister|father|bedroom|bathroom|aunt|frère|sœur|père|hermano|hermana|padre|אח שלי|אבא/i);
    }
  });
  it('no filler around "Yes, it\'s new", "Lovely", "Good night", "Thank you": only the goodbye is checked, once, by ear', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'quiz').map((s) => [strip(s.itemId), s.wrongIds.map(strip)])).toEqual([['reply.home.goodbye', ['reply.home.rest', 'reply.home.come-in']]]);
      expect(text(d, `${lang}.reply.home.goodbye`)).toBe(at(L_BYE, lang));
    }
  });
});

describe('the arc, visuals and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'quickReply') && s.transferOnly ? `${s.kind}:flex` : (s.kind === 'visualMatch' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk',
      'prime', 'prime',
      'prime', 'quickReply',
      'prime', 'visualMatch', 'quickReply',
      'prime', 'sentenceBuilder',
      'prime', 'quickReply',
      'prime', 'quickReply',
      'prime', 'quiz',
      'visualMatch:flex', 'quickReply:flex', 'receipt',
      'quickReply', 'quickReply', 'quickReply', 'quickReply', 'quickReply', 'quickReply', 'receipt',
      'dialogue', 'receipt',
      'quickReply:speed', 'quickReply:speed', 'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'visualMatch:speed', 'quickReply', 'quickReply', 'quickReply', 'quickReply', 'receipt', 'summary',
    ]);
  });
  it('the board renders two columns and the route as cells — nothing added', () => {
    const str = `${eveningRoute(6)![1]} ¦ ${homeBoard(6)[1]} ¦ What do you answer?`;
    const b = splitTimeBoard(str)!;
    expect(b.route!.map((c) => [c.text, c.now])).toEqual([['Now: Friend’s home', true], ['Home · rest', false], ['Dinner at grandmother’s', false], ['Sleep', false]]);
    expect(b.plan!.map((p) => [p.day, p.rows.length])).toEqual([['🏠 Home', 2], ['🌙 My evening', 3]]);
    expect(b.after).toEqual(['What do you answer?']);
    const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: str }));
    expect(html.match(/class="plan-day-row"/g)).toHaveLength(5);
    expect(html.match(/class="time-strip-cell"/g)).toHaveLength(4);
    expect(renderToStaticMarkup(createElement(HotelStaySummary, { text: homeBoard(0)[1] })).match(/data-known="false"/g)).toHaveLength(5);
  });
  it('visual slots: 12 final semantic slots and 1 result prop, listed in the artwork manifest', () => {
    expect(Object.keys(M13_SLOTS).sort()).toEqual(['after-dinner', 'ask-family', 'at-the-door', 'food-invitation', 'going-home', 'goodbye', 'home-compliment', 'live-with-family', 'living-room-sofa', 'mother-kitchen', 'polite-decline', 'tired']);
    expect(Object.keys(M13_PROPS)).toEqual(['home-visit-complete']);
    for (const s of [...Object.values(M13_SLOTS), ...Object.values(M13_PROPS)]) { expect(s.image).toMatch(/^images\/mission13\/[a-z-]+\.jpg$/); expect(s).not.toHaveProperty('emoji'); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION13_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/VISUAL PRODUCTION COMPLETE/);
    for (const key of [...Object.keys(M13_SLOTS), ...Object.keys(M13_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language; no picture before its line spoils it', () => {
    const looks = new Set(Object.values(M13_SLOTS).map((s) => s.image));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    const d = day('en');
    const before = (key: string) => d.steps.slice(0, primeAt(d, key)).filter((s) => s.kind === 'prime').flatMap((p) => (p as Extract<BootcampStep, { kind: 'prime' }>).words.map((w) => w.image));
    expect(before('home.line.mother')).not.toContain(M13_SLOTS['mother-kitchen'].image);
    expect(before('home.line.decline')).not.toContain(M13_SLOTS['polite-decline'].image);
    expect(before('home.line.tired-q')).not.toContain(M13_SLOTS.tired.image);
    expect(before('home.line.sleep')).not.toContain(M13_SLOTS['after-dinner'].image);
  });
  it('video: none recorded yet in any language — the standard step is there and safely skipped; replay keeps the mission\'s progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[12]!.day);
      expect(video, lang).toBeUndefined();
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});

/** All app-language copy of the mission (labels, intros, meanings, receipts, situations, captions) — never target text. */
function appCopy(d: BootcampDayContent): string {
  const out: string[] = [];
  for (const s of d.steps) {
    out.push(...boardOf(s));
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'quickReply') for (const r of s.rounds) if (r.situation) out.push(r.situation.he ?? '', r.situation.en ?? '');
    if (s.kind === 'visualMatch') for (const t of s.tiles) out.push(t.caption?.he ?? '', t.caption?.en ?? '');
  }
  return out.join(' | ');
}

describe('WORD SENSES — same form + same meaning is prior; same form + another meaning is NEW (French "cuisine")', () => {
  const FOOD = 'Et la cuisine ici est excellente.';
  const tagged = (lang: CoverageLang, n: number): string[] => teachingEncounters(day(lang, n)).flatMap((e) => senseWords(e.text, lang)).filter((w) => w.startsWith('cuisine'));
  it('1. Mission 11 French "cuisine" is the FOOD meaning — in its line and in what it teaches', () => {
    expect(senseOf(FOOD, 'cuisine', 'fr')).toBe('food');
    expect(new Set(tagged('fr', 11))).toEqual(new Set(['cuisine#food']));
    const after11 = learnedBefore('fr', 12);
    expect(after11.words.has('cuisine#food')).toBe(true);
    expect(after11.knowsChunk('la cuisine ici')).toBe(true);
  });
  it('2. it does NOT make the Mission 13 kitchen meaning prior', () => {
    const p = learnedBefore('fr', 13);
    expect(p.words.has('cuisine#food')).toBe(true); // Mission 11's food meaning stays intact
    expect(p.words.has('cuisine#kitchen')).toBe(false);
    expect(p.words.has('cuisine')).toBe(false); // the bare form is never "learned"
    expect(senseOf(at(L_MOTHER, 'fr'), 'cuisine', 'fr')).toBe('kitchen');
    expect(p.knowsChunk('dans la cuisine')).toBe(false);
    expect(p.knowsChunk(chunk('mother-kitchen', 'fr'))).toBe(false);
    expect(p.knowsChunk('cuisine')).toBe(false); // a form alone names no meaning
  });
  it('3. Mission 13 teaches the kitchen meaning (the mother card) before any retrieval tests it', () => {
    const { taught, tested } = missionWalk(day('fr'));
    const has = (t: string): boolean => senseWords(t, 'fr').includes('cuisine#kitchen');
    const firstTaught = taught.find((e) => has(e.text))!;
    const firstTested = tested.find((e) => has(e.text))!;
    expect(firstTaught.at).toBeLessThan(firstTested.at);
    expect(day('fr').steps[firstTaught.at]!.kind).toBe('prime');
    expect(unpreparedWords(day('fr'), learnedBefore('fr', 13).words, 'fr')).toEqual([]);
    for (const lang of LANGS) expect(unpreparedWords(day(lang), learnedBefore(lang, 13).words, lang), lang).toEqual([]);
  });
  it('4. after Mission 13, the kitchen meaning counts as learned for later missions (both meanings now known)', () => {
    const p = learnedBefore('fr', 14);
    expect(p.words.has('cuisine#kitchen')).toBe(true);
    expect(p.words.has('cuisine#food')).toBe(true);
    expect(p.knowsChunk('dans la cuisine')).toBe(true);
  });
  it('5. same form + same meaning still reuses prior learning normally', () => {
    const d = day('fr');
    const i = flexAt(d)[0]!;
    const vm = d.steps[i] as VM;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, k) => (k === i ? { ...vm, rounds: [{ ...vm.rounds[0]!, audio: { en: 'La cuisine ici est excellente.', he: 'x' } }] } : s)) };
    expect(unpreparedWords(planted, learnedBefore('fr', 13).words, 'fr')).toEqual([]); // food = food: prepared by Mission 11
  });
  it('6. same form + different meaning is a collision the audit catches (the bare-form model would have missed it)', () => {
    const d = day('fr');
    const noCard: BootcampDayContent = { ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== 'home.line.mother') } : s)) };
    const prior = learnedBefore('fr', 13);
    expect(unpreparedWords(noCard, prior.words, 'fr').join(' ')).toMatch(/“cuisine” \(kitchen\)/);
    const bare = learnedBefore('fr', 13, missionContent, {}); // no sense model: Mission 11's food "cuisine" looks like the kitchen
    expect(bare.words.has('cuisine')).toBe(true);
    expect(unpreparedWords(noCard, bare.words, 'fr', {}).join(' ')).not.toMatch(/“cuisine”/);
  });
  it('every registered polysemous form resolves to ONE sense wherever the curriculum uses it (no silent #?)', () => {
    for (const lang of LANGS) {
      const forms = Object.keys(WORD_SENSES[lang] ?? {});
      for (let n = 1; n <= BOOTCAMP_PLAN.length; n++) {
        const d = day(lang, n);
        const { taught, tested } = missionWalk(d);
        for (const t of [...taught, ...tested, ...d.items]) for (const w of senseWords(t.text, lang)) if (forms.includes(w.split('#')[0]!)) expect(w, `${lang} M${n}: “${t.text}”`).not.toMatch(/#\?$/);
      }
    }
  });
  it('synthetic mutation — another polysemous form (EN "light": lamp ≠ not heavy) follows the same rule', () => {
    const LIGHT: SenseRegistry = { en: { light: [{ sense: 'lamp', cues: ['the light'] }, { sense: 'not-heavy', cues: ['is light'] }] } };
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 12) return m;
      const [p] = stepsOf(m, 'prime');
      return { ...m, steps: m.steps.map((s) => (s === p ? { ...p, words: [...p.words, { ...p.words[0]!, key: 'synthetic.lamp', text: 'The light is on.' }] } : s)) };
    };
    const prior = learnedBefore('en', 13, seen, LIGHT);
    expect(prior.words.has('light#lamp')).toBe(true);
    expect(prior.words.has('light#not-heavy')).toBe(false);
    const d = day('en');
    const i = flexAt(d)[0]!;
    const vm = d.steps[i] as VM;
    const plant = (line: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s, k) => (k === i ? { ...vm, rounds: [{ ...vm.rounds[0]!, audio: { en: line, he: 'x' } }] } : s)) });
    expect(unpreparedWords(plant('My bag is light.'), prior.words, 'en', LIGHT).join(' ')).toMatch(/“light” \(not-heavy\)/);
    expect(unpreparedWords(plant('The light is on.'), prior.words, 'en', LIGHT)).toEqual([]);
    expect(unpreparedWords(plant('A light.'), prior.words, 'en', LIGHT).join(' ')).toMatch(/“light” \(unresolved sense\)/);
  });
});
