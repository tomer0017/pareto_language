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
import { M12_CONCEPTS } from './mission12Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  L_BEACH, L_BYE, L_EARLY, L_EIGHT, L_GOOD, L_INVITE, L_TODAY, L_TONIGHT, M12_PERIODS, M12_PROPS, M12_SLOTS, PLANS_MADE,
  Y_FREE_TOMORROW, Y_MEET, planState, planner, timeStrip,
} from './practiceTimePlans.js';
import { fillFrame, validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, missionWalk, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { L4 } from './author.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 12 — Time & Plans: "We made plans for tonight and tomorrow." The conversation is LOCKED. The
 * traveller knows only their own time (this morning open, tonight and tomorrow free). Dinner, the
 * centre, 20:00, the beach and "early" all come from the friend's own lines; 07:00 and "here" are the
 * LEARNER's proposal. The Time Strip shows time periods; the planner shows only what has been said.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 12): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M12_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
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
/** The supported conversation starts after the last teaching card (the goodbye). */
const supportedAt = (d: BootcampDayContent): number => primeAt(d, 'time.line.bye') + 1;
const at = (x: L4, lang: CoverageLang): string => x[IX[lang]];

/** The conversation exactly as the brief froze it (pasted verbatim). */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Good morning! What are you doing today?', 'YOU: Nothing this morning. Maybe later.', 'NPC: And what are you doing tonight?', 'YOU: I’m free tonight.',
    'NPC: We’re going to eat in the centre. Do you want to come?', 'YOU: Yes! What time?', 'NPC: At eight. Is that too late for you?', 'YOU: No, that’s not too late.',
    'NPC: Great. It’s very good there.', 'YOU: What are you doing tomorrow?', 'NPC: Tomorrow morning I’m going to the beach. Are you free tomorrow?', 'YOU: Yes, I’m free tomorrow.',
    'NPC: Then come with us! But we leave early.', 'YOU: No problem. Let’s meet here at seven.', 'NPC: Perfect. I have to go now — see you tonight!'],
  es: ['NPC: ¡Buenos días! ¿Qué haces hoy?', 'YOU: Nada esta mañana. Quizás más tarde.', 'NPC: ¿Y qué haces esta noche?', 'YOU: Estoy libre esta noche.',
    'NPC: Vamos a comer en el centro. ¿Quieres venir?', 'YOU: ¡Sí! ¿A qué hora?', 'NPC: A las ocho. ¿Es muy tarde para ti?', 'YOU: No, no es muy tarde.',
    'NPC: Genial. Allí se come muy bien.', 'YOU: ¿Qué haces mañana?', 'NPC: Mañana por la mañana voy a la playa. ¿Estás libre mañana?', 'YOU: Sí, estoy libre mañana.',
    'NPC: ¡Entonces ven con nosotros! Pero salimos temprano.', 'YOU: No hay problema. Quedamos aquí a las siete.', 'NPC: Perfecto. Me tengo que ir ahora — ¡nos vemos esta noche!'],
  fr: ['NPC: Bonjour ! Tu fais quoi aujourd’hui ?', 'YOU: Rien ce matin. Peut-être plus tard.', 'NPC: Et tu fais quoi ce soir ?', 'YOU: Je suis libre ce soir.',
    'NPC: On va manger dans le centre. Tu veux venir ?', 'YOU: Oui ! À quelle heure ?', 'NPC: À huit heures. C’est trop tard pour toi ?', 'YOU: Non, ce n’est pas trop tard.',
    'NPC: Super. C’est très bon là-bas.', 'YOU: Tu fais quoi demain ?', 'NPC: Demain matin, je vais à la plage. Tu es libre demain ?', 'YOU: Oui, je suis libre demain.',
    'NPC: Alors viens avec nous ! Mais on part tôt.', 'YOU: Pas de problème. On se retrouve ici à sept heures.', 'NPC: Parfait. Je dois y aller maintenant — à ce soir !'],
};
const line = (lang: CoverageLang, i: number): string => script(lang)[i]!.slice(5);
/** The seven lines the traveller says (+ the builder's whole meeting line) — the same ids in every language. */
const LEARNER = ['phrase.time.maybe-later', 'phrase.time.free-tonight', 'phrase.time.what-time', 'phrase.time.not-too-late', 'phrase.time.what-doing-tomorrow', 'phrase.time.free-tomorrow', 'phrase.time.lets-meet'];
const PRODUCED = [...LEARNER, 'phrase.time.no-problem-meet'];
/** Canonical transcript ([who, text] of each line, exact) — the same value before this pass (792bb0c) and after. */
const TRANSCRIPT_PRINT = { en: '589b1f39', es: '01098237', fr: 'bf1a65a6' };
/** The dialogue TREE (choices, re-asks) — changed on purpose: "When?", the recovery branch out; a miss is asked again. */
const DIALOGUE_PRINT = { en: 'ec000293', es: 'c316a58b', fr: '8f770aca' };

/* Spoiler vocabularies, per fact — app language (he / en) AND each target language. */
const DINNER = /dinner|centre|centro|ארוחת|מרכז|🍽️|\beat\b|manger|comer|לאכול/i;
const HOUR20 = /20:00/;
const BEACH = /beach|plage|playa|חוף|לים|🏖️/i;
const EARLY = /early|\btôt\b|temprano|מוקדם/i;
const HOUR7 = /07:00/;

/* ── the planner reveal checker (each run, in order) ───────────────────────────────────────────── */

/** The board text of a step (label / intro / receipt), in both app languages. */
const boardOf = (s: BootcampStep): string[] => {
  const t = s.kind === 'prime' ? s.intro : s.kind === 'receipt' ? s.text : 'label' in s ? s.label : undefined;
  return t ? [t.he ?? '', t.en ?? ''] : [];
};
/** The planner facts a board shows: 1 dinner · centre, 2 20:00, 3 beach, 4 leaving early, 5 meet here 07:00, 6 confirmed. */
const MARKS: [number, RegExp][] = [[1, /Dinner · Centre|ארוחת ערב · מרכז/], [2, /20:00/], [3, /: (Beach|חוף הים) \//], [4, /leaving early|יוצאים מוקדם/], [5, /Meet here|נפגשים כאן/], [6, /✅/]];
const shownFacts = (s: BootcampStep): number[] => MARKS.filter(([, re]) => boardOf(s).some((b) => b.split(' ¦ ').some((p) => p.includes('‖') && re.test(p)))).map(([n]) => n);
/** What a step makes the learner hear or say (the facts it reveals for the NEXT steps). */
function revealed(d: BootcampDayContent, s: BootcampStep, lang: CoverageLang): number[] {
  const heard: string[] = [];
  const spoken: string[] = [];
  if (s.kind === 'prime') heard.push(...s.words.map((w) => w.text));
  if (s.kind === 'quickReply') for (const r of s.rounds) { heard.push(heardIn(d, r)); spoken.push(said(d, r)); }
  if (s.kind === 'visualMatch') heard.push(...s.rounds.map((r) => r.audio.en));
  if (s.kind === 'quiz') heard.push(text(d, s.itemId));
  if (s.kind === 'sentenceBuilder') spoken.push(...s.rounds.map((r) => r.chunks.join(' ')));
  if (s.kind === 'dialogue') heard.push(...day(lang).dialogues[s.dialogueId]!.nodes.map((n) => n.en));
  const out: number[] = [];
  const by: [number, L4][] = [[1, L_INVITE], [2, L_EIGHT], [3, L_BEACH], [4, L_EARLY], [6, L_BYE]];
  for (const [n, l] of by) if (heard.includes(at(l, lang))) out.push(n);
  // 07:00 is the learner's OWN plan: revealed by saying it, never by a card presenting it.
  if (spoken.some((t) => hasChunk(t, chunk('lets-meet', lang)))) out.push(5);
  return out;
}
/** Every step of a run that shows a planner fact before the run has revealed it. */
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
  ['teaching', 1, supportedAt(d)], ['supported', supportedAt(d), dialogueAt(d)], ['no help', dialogueAt(d) + 1, videoAt(d)], ['final', videoAt(d) + 1, d.steps.length],
];

describe('the conversation is locked, and Mission 12 is in its place', () => {
  // Two DIFFERENT claims, kept apart:
  //   (a) the repo's canonical transcript is BYTE-IDENTICAL to what it was before this pass (exact, no normalisation);
  //   (b) it matches the brief's pasted text once typographic apostrophes are ignored (’ vs ') — a normalised comparison.
  it('the canonical repo transcript is BYTE-IDENTICAL to the pre-pass one (792bb0c) — exact, no normalisation', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionDialogues(day(l)).flatMap((x) => cinematicTranscript(x)).map((x) => [x.who, x.en])))]))).toEqual(TRANSCRIPT_PRINT);
    expect(line('en', 3)).toBe("I'm free tonight."); // the repo's own straight apostrophe, kept as it was
  });
  for (const lang of LANGS) it(`${lang}: the brief's text, word for word — PUNCTUATION-NORMALISED comparison (apostrophe typography ignored) (tests 1–3)`, () => { expect(script(lang).map(quotes)).toEqual(LOCKED[lang].map(quotes)); });
  it('the dialogue tree is pinned: every turn a real decision, a miss is asked again slowly — no "When?", no recovery branch', () => {
    for (const lang of LANGS) {
      const nodes = day(lang).dialogues['making-plans']!.nodes;
      for (const n of nodes.filter((x) => x.who === 'you')) {
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        expect(n.choices!.filter((c) => !c.correct), `${lang} ${n.id}`).toHaveLength(1);
        for (const c of n.choices!.filter((x) => !x.correct)) {
          const reask = nodes.find((x) => x.id === c.next)!;
          expect([reask.who, reask.slow, reask.next], `${lang} ${n.id}`).toEqual(['npc', true, n.id]);
        }
      }
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('4. Mission 12 is "Time & Plans", twelfth on the journey', () => {
    expect(BOOTCAMP_PLAN[11]!.id).toBe('time-plans');
    expect(missionNumber(BOOTCAMP_PLAN[11]!.day)).toBe(12);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Time & Plans');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('5. Missions 01–11 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 11)).toEqual({ en: '8eacaebe', es: '53d5c9bd', fr: 'c8f5becd' }); });
  it('6. Missions 13–30 are byte-for-byte unchanged by this pass (the Everyday checkpoint still reuses the same five sentences)', () => {
    expect(raw(12)).toEqual({ en: '374354a9', es: 'e62daaff', fr: '036c589c' });
    for (const lang of LANGS) {
      const ids = new Set(day(lang).items.map((i) => i.id));
      for (const id of ['phrase.time.maybe-later', 'phrase.time.free-tonight', 'phrase.time.free-tomorrow', 'phrase.time.lets-meet', 'phrase.time.not-too-late']) expect(ids.has(`${lang}.${id}`), `${lang} ${id}`).toBe(true);
    }
  });
  it('7. EN / ES / FR parity: the same journey, step for step, each in its own words', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.label, s.rounds.map((r) => [strip(r.itemId), r.chunks.length])];
      if (s.kind === 'swap') return [s.kind, s.label, s.rounds.map((r) => [strip(r.itemId), r.cue, r.options.map((o) => [o.correct, o.meaning])])];
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

describe('roles — the traveller says the seven locked lines; the friend is understood', () => {
  const productions = (d: BootcampDayContent): { id: string; text: string }[] => [
    ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map((r) => ({ id: accepted(r), text: said(d, r) }))),
    ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => ({ id: strip(r.itemId), text: r.chunks.join(' ') }))),
    ...stepsOf(d, 'swap').flatMap((s) => s.rounds.map((r) => ({ id: strip(r.itemId), text: fillFrame(r.frame, r.options.find((o) => o.correct)!.slot) }))),
  ];
  it('8 + 10. every line the traveller produces is a locked YOU line — and all seven are produced whole', () => {
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
      for (const c of M12_CONCEPTS.filter((x) => x.role === 'hear')) expect(offered.some((o) => hasChunk(o, c.chunk[lang])), `${lang} ${c.id}`).toBe(false);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(LEARNER, lang).toContain(strip(o.itemId));
    }
  });
});

describe('the opening briefing — only your own time, no spoilers', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('the briefing is the brief\'s: it is morning, no fixed plans — and your availability (open · free · free)', () => {
    for (const lang of LANGS) {
      const b = briefing(lang);
      expect(b.body.map((x) => x.he)).toEqual(['בוקר. עדיין אין לך תוכניות קבועות. דבר עם חבר ותראה מה עושים היום ומחר.']);
      expect(b.facts!.map((f) => [f.icon, f.label.en, f.value.en])).toEqual([['☀️', 'This morning', 'Open'], ['🌙', 'Tonight', 'Free'], ['🌅', 'Tomorrow', 'Free']]);
      expect(b.title.en).toBe('Mission 12: Time & Plans');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
    }
  });
  it('11–15. the briefing names no dinner, no centre, no 20:00, no beach, no 07:00 (and nothing of "early")', () => {
    for (const lang of LANGS) {
      const b = JSON.stringify(briefing(lang));
      for (const re of [DINNER, HOUR20, /eight|huit|ocho|שמונה/i, BEACH, HOUR7, /seven|sept|siete|שבע/i, EARLY]) expect(b, `${lang} ${re}`).not.toMatch(re);
    }
  });
});

describe('the Time Strip — time periods only, highlighting where the conversation is', () => {
  it('16. its order is the order of a day: now (this morning) → later → tonight → tomorrow morning', () => {
    expect(M12_PERIODS).toEqual(['morning', 'later', 'tonight', 'tomorrow']);
    expect(timeStrip()[1]).toBe('☀️ Now · This morning → ⏳ Later → 🌙 Tonight → 🌅 Tomorrow morning');
    expect(timeStrip('tonight')[0]).toBe('☀️ עכשיו · הבוקר → ⏳ אחר כך → 🌙 הערב ● → 🌅 מחר בבוקר');
  });
  it('17. it highlights the time each line is about — this morning, tonight, then tomorrow', () => {
    const PERIOD_OF = new Map<string, string[]>([[L_TODAY[0], ['morning']], [L_TONIGHT[0], ['tonight']], [L_INVITE[0], ['tonight']], [L_EIGHT[0], ['tonight']], [L_GOOD[0], ['tomorrow']], [L_BEACH[0], ['tomorrow']], [L_EARLY[0], ['tomorrow']]]);
    const d = day('en');
    let checked = 0;
    for (const s of stepsOf(d, 'quickReply')) {
      if (!s.label) continue;
      const now = splitTimeBoard(s.label.en ?? '')!.strip!.flatMap((c, i) => (c.now ? [M12_PERIODS[i]] : []));
      for (const r of s.rounds) { const want = PERIOD_OF.get(heardIn(d, r)); if (want) { expect(now, heardIn(d, r)).toEqual(want); checked++; } }
    }
    expect(checked).toBeGreaterThanOrEqual(15);
    // The goodbye card: leaving NOW, seeing each other TONIGHT — both marked.
    const bye = d.steps[primeAt(d, 'time.line.bye')] as Extract<BootcampStep, { kind: 'prime' }>;
    expect(splitTimeBoard(bye.intro?.en ?? '')!.strip!.filter((c) => c.now).map((c) => c.text)).toEqual(['☀️ Now · This morning', '🌙 Tonight']);
  });
  it('18. the strip never carries a fact: no hour, no plan, no place — in any step, any language', () => {
    for (const lang of LANGS) for (const s of day(lang).steps) for (const b of boardOf(s)) {
      const strip12 = splitTimeBoard(b)?.strip;
      if (strip12) for (const c of strip12) expect(c.text, lang).not.toMatch(/\d|beach|dinner|centre|here|early|חוף|ארוחת|מרכז|כאן|מוקדם/i);
    }
  });
  it('19. it is deterministic UI, not a picture: four cells, the current one marked, no image', () => {
    const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `${timeStrip('tonight')[1]} ¦ ${planner(0)[1]} ¦ What do you answer?` }));
    expect(html.match(/class="time-strip-cell"/g)).toHaveLength(4);
    expect(html.match(/data-now="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-current="time"');
    expect(html).not.toMatch(/<img|●/);
    expect(html).toContain('What do you answer?');
    expect(Object.keys(M12_SLOTS).join(' ')).not.toMatch(/clock|strip|time-/);
  });
});

describe('the live planner — "?" until the conversation says it', () => {
  it('20. it starts unknown — and the plan state is all null', () => {
    expect(planner(0)).toEqual(['🌙 הערב: תוכנית ? / שעה ? ‖ 🌅 מחר: תוכנית ? / מפגש ?', '🌙 Tonight: Plan ? / Time ? ‖ 🌅 Tomorrow: Plan ? / Meet ?']);
    expect(planState(0)).toEqual({ timeFocus: 'morning', tonightPlan: null, tonightPlace: null, tonightTime: null, tomorrowPlan: null, tomorrowDeparture: null, tomorrowMeetingPlace: null, tomorrowMeetingTime: null, confirmed: false });
    for (const lang of LANGS) expect(boardOf(day(lang).steps[1]!).join(' ')).toContain(planner(0)[1]);
  });
  it('21–24. each fact appears first right after the line that reveals it — never before (whole mission)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const first = (re: RegExp) => d.steps.findIndex((s) => re.test(JSON.stringify(s)));
      expect(first(DINNER), lang).toBe(primeAt(d, 'time.line.invite')); // 21
      expect(first(HOUR20), lang).toBeGreaterThan(primeAt(d, 'time.line.eight')); // 22: the capture after "At eight"
      expect(first(BEACH), lang).toBe(primeAt(d, 'time.line.beach')); // 23
      const builder = d.steps.findIndex((s) => s.kind === 'sentenceBuilder');
      expect(first(HOUR7), lang).toBe(builder + 1); // 24: only once the LEARNER has put "at seven" together
    }
  });
  it('21–24b. in every run (teaching, supported, no help, final) no planner fact is shown before the run reveals it', () => {
    for (const lang of LANGS) for (const [name, from, to] of RUNS(day(lang))) expect(revealViolations(day(lang), lang, from, to), `${lang} ${name}`).toEqual([]);
  });
  it('25. the final planner is exactly the approved outcome', () => {
    expect(planner(6)[1]).toBe('🌙 Tonight: Dinner · Centre / 20:00 ✅ ‖ 🌅 Tomorrow: Beach / Meet here · 07:00 ✅');
    expect(planState(6, 'tonight')).toEqual({ timeFocus: 'tonight', tonightPlan: 'dinner', tonightPlace: 'centre', tonightTime: '20:00', tomorrowPlan: 'beach', tomorrowDeparture: 'early', tomorrowMeetingPlace: 'here', tomorrowMeetingTime: '07:00', confirmed: true });
    const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: PLANS_MADE[1] }));
    expect(html.match(/class="plan-day"/g)).toHaveLength(2);
    expect(html.match(/data-known="false"/g)).toBeNull();
    expect(html).toContain('📅 PLANS MADE');
  });
});

describe('PRIOR LEARNING — verified, not assumed (learnedBefore(lang, 12))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 12);
  const P = (lang: CoverageLang, en: string, es: string, fr: string): boolean => prior(lang).knowsChunk({ en, es, fr }[lang]);
  it('built from Missions 01–11: numbers, here, the centre, eat, come, "do you want", great, perfect are prior', () => {
    for (const lang of LANGS) {
      const p = prior(lang);
      expect(p.missions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      for (const [en, es, fr] of [['seven', 'siete', 'sept'], ['eight', 'ocho', 'huit'], ['here', 'aquí', 'ici'], ['centre', 'centro', 'centre'], ['eat', 'comer', 'manger'], ['come', 'venir', 'venir'], ['Do you want', '¿Quieres', 'Tu veux']] as const) expect(P(lang, en, es, fr), `${lang} ${en}`).toBe(true);
      for (const id of ['great', 'perfect', 'good-morning']) expect(p.knowsChunk(chunk(id, lang)), `${lang} ${id}`).toBe(true);
      for (const id of ['maybe-later', 'nothing-this-morning', 'im-free', 'free-tonight', 'what-time', 'at-eight', 'too-late-q', 'not-too-late', 'what-doing-tomorrow', 'tomorrow-morning', 'going-to-beach', 'leave-early', 'lets-meet', 'see-you-tonight', 'what-doing-tonight'])
        expect(p.knowsChunk(chunk(id, lang)), `${lang} ${id} is new`).toBe(false);
      for (const [en, es, fr] of [['tonight', 'esta noche', 'ce soir'], ['tomorrow', 'mañana', 'demain'], ['early', 'temprano', 'tôt'], ['beach', 'playa', 'plage'], ['free', 'libre', 'libre']] as const) expect(P(lang, en, es, fr), `${lang} ${en} is new`).toBe(false);
    }
  });
  it('partial prior, per language: "No problem" is prior in English and French (not Spanish); "It\'s very good" in English and French', () => {
    expect(LANGS.map((l) => prior(l).knowsChunk(chunk('no-problem', l)))).toEqual([true, false, true]);
    expect(LANGS.map((l) => P(l, "It's very good", 'Allí se come muy bien', 'C’est très bon'))).toEqual([true, false, true]);
  });
  it('a line met only inside an earlier conversation is NOT learned (dialogue-only exposure)', () => {
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 11) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} I'm free tonight. What time? Let's meet at the train station.` } : x)) } } };
    };
    const p = learnedBefore('en', 12, seen);
    expect(p.knowsChunk("I'm free tonight")).toBe(false);
    expect(p.knowsChunk('What time?')).toBe(false);
    expect(p.words.has('train')).toBe(false);
  });
  it('partial prior: the meeting builder keeps the known pieces apart from the new one ("Let\'s meet")', () => {
    for (const lang of LANGS) {
      const [noProblem, meet, here, time] = stepsOf(day(lang), 'sentenceBuilder')[0]!.rounds[0]!.chunks;
      expect(prior(lang).knowsChunk(noProblem!), lang).toBe(lang !== 'es');
      expect(prior(lang).knowsChunk(meet!), lang).toBe(false);
      expect(prior(lang).knowsChunk(here!), lang).toBe(true);
      expect(prior(lang).words.has({ en: 'seven', es: 'siete', fr: 'sept' }[lang]), lang).toBe(true);
      expect(time).toBeTruthy();
    }
  });
  /** A tested chunk is prepared when it is prior, or was taught earlier in Mission 12. */
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M12_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`STRICT TEACH-BEFORE-TEST — ${lang}: every tested word is taught here or verifiably prior; every NEW chunk is taught before it is tested`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
      expect(unpreparedChunks(day(lang), lang, M12_CONCEPTS)).toEqual([]); // not even a prior chunk is tested before its card
    });
  }
  it('negative mutation: "train station" planted in a tested line is caught', () => {
    const d = day('en');
    const at12 = d.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge);
    const qr = d.steps[at12] as QR;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, i) => (i === at12 ? { ...qr, rounds: [{ ...qr.rounds[0]!, npc: { en: 'Good morning! What are you doing at the train station?', he: 'x' } }, ...qr.rounds.slice(1)] } : s)) };
    const caught = unpreparedWords(planted, prior('en').words);
    expect(caught.length).toBeGreaterThan(0);
    expect(caught.join(' ')).toMatch(/“train”/);
  });
  it('negative mutation: "train station" put ONLY in an earlier conversation is still not learned — the audit still fails', () => {
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 11) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} The train station is over there.` } : x)) } } };
    };
    const earlier = learnedBefore('en', 12, seen);
    const d = day('en');
    const target = d.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge);
    const qr = d.steps[target] as QR;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, i) => (i === target ? { ...qr, rounds: [{ ...qr.rounds[0]!, npc: { en: 'Good morning! What are you doing at the train station?', he: 'x' } }, ...qr.rounds.slice(1)] } : s)) };
    expect(earlier.words.has('train')).toBe(false);
    expect(unpreparedWords(planted, earlier.words).join(' ')).toMatch(/“train”/);
  });
  it('negative mutation: without the "Yes! What time?" card or the meeting card, their retrieval is unprepared', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (...keys: string[]): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => !keys.includes(w.key ?? '')) } : s)) });
      expect(unprepared(without('time.line.what-time'), lang).join(' '), lang).toMatch(/what-time/);
      expect(unprepared(without('time.line.meet'), lang).join(' '), lang).toMatch(/lets-meet/);
      expect(unprepared(without('time.line.free-tonight'), lang).join(' '), lang).toMatch(/free-tonight|im-free/);
    }
  });
  it('negative mutation: breaking the planner\'s reveal order is caught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      // Show tonight's 20:00 on the invitation answer — before "At eight" was heard.
      const invite = primeAt(d, 'time.line.invite') + 1;
      const broken = d.steps.map((s, i) => (i === invite && s.kind === 'quickReply' ? { ...s, label: { he: planner(2)[0], en: `${timeStrip('tonight')[1]} ¦ ${planner(2)[1]}` } } : s));
      expect(revealViolations(d, lang, 1, supportedAt(d), broken).join(' '), lang).toMatch(/fact 2/);
      // …and 07:00 in the supported run before the learner proposes it.
      const s0 = supportedAt(d);
      const early = d.steps.map((s, i) => (i === s0 && s.kind === 'quickReply' ? { ...s, label: { he: planner(5)[0], en: `${timeStrip('morning')[1]} ¦ ${planner(5)[1]}` } } : s));
      expect(revealViolations(d, lang, s0, dialogueAt(d), early).join(' '), lang).toMatch(/fact 5/);
    }
  });
});

describe('TEACHING vs TRANSFER', () => {
  const firstProduced = (d: BootcampDayContent, id: string): number => d.steps.findIndex((s) =>
    (s.kind === 'quickReply' && s.rounds.some((r) => accepted(r) === id)) || (s.kind === 'swap' && s.rounds.some((r) => strip(r.itemId) === id)) || (s.kind === 'sentenceBuilder' && s.rounds.some((r) => strip(r.itemId) === id)));
  it('26. "I\'m free tonight." is TAUGHT (its own card) before it is retrieved', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(primeAt(d, 'time.line.free-tonight'), lang).toBeGreaterThan(0);
      expect(primeAt(d, 'time.line.free-tonight')).toBeLessThan(firstProduced(d, 'phrase.time.free-tonight'));
    }
  });
  it('27. "Yes, I\'m free tomorrow." TRANSFERS the pattern: first met as a retrieval, against "I\'m free tonight", every word already taught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const at27 = firstProduced(d, 'phrase.time.free-tomorrow');
      expect(at27, lang).toBeGreaterThan(primeAt(d, 'time.line.free-tonight'));
      const r = (d.steps[at27] as QR).rounds.find((x) => accepted(x) === 'phrase.time.free-tomorrow')!;
      expect(r.options.map((o) => strip(o.itemId)), lang).toContain('phrase.time.free-tonight'); // the near-miss: the old time
      expect(heardIn(d, r), lang).toBe(at(L_BEACH, lang)); // after "Are you free tomorrow?"
      const { taught } = missionWalk(d);
      const known = new Set([...prior(lang).words, ...taught.filter((e) => e.at < at27).flatMap((e) => plain(e.text).trim().split(' '))]);
      for (const w of plain(at(Y_FREE_TOMORROW, lang)).trim().split(' ')) expect(known.has(w), `${lang} “${w}”`).toBe(true);
    }
  });
  const prior = (lang: CoverageLang) => learnedBefore(lang, 12);
  it('28. "I\'m free tomorrow" is NOT retaught: no card, no builder, no chunk of its own — the pattern is "I\'m free" + a time', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) expect(hasChunk(w.text, at(Y_FREE_TOMORROW, lang).replace(/^[^,]+, /, '')), `${lang} ${w.key}`).toBe(false);
      expect(stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId)))).not.toContain('phrase.time.free-tomorrow');
      expect(M12_CONCEPTS.map((c) => c.id)).not.toContain('free-tomorrow');
      expect(encounters(d, chunk('im-free', lang)).filter((e) => e.kind === 'retrieval').length, lang).toBeGreaterThanOrEqual(8);
    }
  });
  it('29. "What are you doing tomorrow?" is produced only after the friend\'s today / tonight questions — shown as one pattern', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const ask = firstProduced(d, 'phrase.time.what-doing-tomorrow');
      expect(primeAt(d, 'time.line.today'), lang).toBeLessThan(ask);
      expect(primeAt(d, 'time.line.tonight'), lang).toBeLessThan(ask);
      const pattern = d.steps[primeAt(d, 'time.line.tomorrow')] as Extract<BootcampStep, { kind: 'prime' }>;
      expect(pattern.words.map((w) => w.key)).toEqual(['time.line.good', 'time.pattern.today', 'time.pattern.tonight', 'time.line.tomorrow']);
      expect(d.steps[ask]!.kind, lang).toBe('swap');
      const swap = d.steps[ask] as Extract<BootcampStep, { kind: 'swap' }>;
      expect(swap.rounds).toHaveLength(1);
      expect(swap.rounds[0]!.options.map((o) => fillFrame(swap.rounds[0]!.frame, o.slot)), lang).toEqual({
        en: ['What are you doing today?', 'What are you doing tonight?', 'What are you doing tomorrow?'],
        fr: ['Tu fais quoi aujourd’hui ?', 'Tu fais quoi ce soir ?', 'Tu fais quoi demain ?'],
        es: ['¿Qué haces hoy?', '¿Qué haces esta noche?', '¿Qué haces mañana?'],
      }[lang]);
      expect(swap.rounds[0]!.options.map((o) => o.correct)).toEqual([false, false, true]);
    }
  });
  it('30. no grammar is needed for the transfer — no rule, no tense, no table, anywhere in the app-language copy', () => {
    for (const lang of LANGS) expect(appCopy(day(lang)), lang).not.toMatch(/grammar|tense|conjugat|verb|future|present continuous|going-to|preposition|דקדוק|זמן עתיד|הווה|נטייה|פועל|מילת יחס/i);
  });
});
/** All app-language copy of the mission (labels, intros, meanings, receipts, cues, captions) — never target text. */
function appCopy(d: BootcampDayContent): string {
  const out: string[] = [];
  for (const s of d.steps) {
    for (const b of boardOf(s)) out.push(b);
    if (s.kind === 'prime') for (const w of s.words) out.push(w.meaning.he ?? '', w.meaning.en ?? '');
    if (s.kind === 'swap') for (const r of s.rounds) out.push(r.cue.text.he ?? '', r.cue.text.en ?? '');
    if (s.kind === 'quickReply') for (const r of s.rounds) if (r.situation) out.push(r.situation.he ?? '', r.situation.en ?? '');
    if (s.kind === 'visualMatch') for (const t of s.tiles) out.push(t.caption?.he ?? '', t.caption?.en ?? '');
  }
  return out.join(' | ');
}

describe('time comprehension — 20:00, by ear, as plain readable text', () => {
  const hours = (d: BootcampDayContent) => stepsOf(d, 'visualMatch').filter((s) => s.tiles.some((t) => t.label === '20:00')) as VM[];
  it('31. the evening time is 20:00 — heard in the friend\'s own line', () => {
    for (const lang of LANGS) {
      const h = hours(day(lang));
      expect(h, lang).toHaveLength(2); // taught once, captured again in the final
      for (const s of h) expect(s.rounds.map((r) => [r.audio.en, r.correct]), lang).toEqual([[at(L_EIGHT, lang), '20:00']]);
    }
  });
  it('32–33. no arithmetic, equal treatment: three plain 24-hour times, the same form, no picture, no icon, no caption', () => {
    for (const lang of LANGS) for (const s of hours(day(lang))) {
      expect(s.tiles).toEqual([{ id: '18:00', label: '18:00' }, { id: '20:00', label: '20:00' }, { id: '22:00', label: '22:00' }]);
      expect(s.label!.en).toMatch(/What time is dinner\?$/);
    }
  });
  it('34. no positional shortcut: the board is shuffled (never `ordered`), and the answer is not the first tile', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'visualMatch')) {
      expect(s.ordered, lang).toBeUndefined();
      if (s.tiles.some((t) => t.label === '20:00')) expect(s.tiles.findIndex((t) => t.id === s.rounds[0]!.correct)).not.toBe(0);
    }
    const src = readFileSync(fileURLToPath(new URL('./PracticeSteps.tsx', import.meta.url)), 'utf8');
    expect(src).toMatch(/step\.ordered \? step\.tiles : shuffle\(step\.tiles/);
  });
});

describe('early — qualitative, and 07:00 is the learner\'s own plan', () => {
  it('35. "early" appears first on the card of the friend\'s line — nowhere before it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.findIndex((s) => EARLY.test(JSON.stringify(s))), lang).toBe(primeAt(d, 'time.line.early'));
    }
  });
  it('36. "early" never reveals 07:00: the planner says "leaving early", with no hour; no picture of a clock', () => {
    expect(planner(4)[1]).toBe('🌙 Tonight: Dinner · Centre / 20:00 ‖ 🌅 Tomorrow: Beach / Meet ? · leaving early');
    expect(planState(4).tomorrowMeetingTime).toBeNull();
    expect(planState(4).tomorrowDeparture).toBe('early');
    for (const lang of LANGS) {
      const d = day(lang);
      const card = cardsOf(d).find((w) => w.key === 'time.line.early')!;
      expect(JSON.stringify(card), lang).not.toMatch(/07|seven|sept|siete|שבע|⏰|🕖/);
    }
  });
  it('37. 07:00 is learner-created: no line of the friend contains seven — it exists only after the learner says it', () => {
    for (const lang of LANGS) {
      const npcLines = script(lang).filter((l) => l.startsWith('NPC'));
      for (const l of npcLines) expect(l, lang).not.toMatch(/seven|sept|siete/i);
      expect(script(lang).findIndex((l) => /seven|sept|siete/i.test(l)), lang).toBe(13); // the learner's own line
    }
    expect(planState(5).tomorrowMeetingTime).toBe('07:00');
  });
});

describe('the meeting — where and when, the one builder', () => {
  it('38. the learner produces the exact meeting line', () => {
    for (const lang of LANGS) {
      const b = stepsOf(day(lang), 'sentenceBuilder');
      expect(b.map((s) => strip(s.rounds[0]!.itemId))).toEqual(['phrase.time.no-problem-meet']);
      expect(b[0]!.rounds[0]!.chunks.join(' '), lang).toBe(at(Y_MEET, lang));
      expect(quotes(at(Y_MEET, lang))).toBe(quotes(LOCKED[lang][13]!.slice(5)));
    }
  });
  it('39–40. WHERE = here, WHEN = seven — in the line, and in the plan it creates', () => {
    expect(planState(5)).toMatchObject({ tomorrowMeetingPlace: 'here', tomorrowMeetingTime: '07:00' });
    for (const lang of LANGS) {
      const [, , where, when] = stepsOf(day(lang), 'sentenceBuilder')[0]!.rounds[0]!.chunks;
      expect(where).toBe({ en: 'here', es: 'aquí', fr: 'ici' }[lang]);
      expect(when).toBe({ en: 'at seven.', es: 'a las siete.', fr: 'à sept heures.' }[lang]);
    }
  });
  it('41. the builder uses each language\'s own chunks — never English segmentation forced on French or Spanish', () => {
    const c = (lang: CoverageLang) => stepsOf(day(lang), 'sentenceBuilder')[0]!.rounds[0]!.chunks;
    expect(c('en')).toEqual(['No problem.', "Let's meet", 'here', 'at seven.']);
    expect(c('fr')).toEqual(['Pas de problème.', 'On se retrouve', 'ici', 'à sept heures.']);
    expect(c('es')).toEqual(['No hay problema.', 'Quedamos', 'aquí', 'a las siete.']);
    for (const x of c('fr')) expect(c('en')).not.toContain(x);
  });
});

describe('no bad pedagogy', () => {
  it('42. no grammar lesson for "going to" (or any future): the lines are taught by their whole meaning', () => {
    for (const lang of LANGS) {
      expect(appCopy(day(lang)), lang).not.toMatch(/going-to|going to \+|future|tense|grammar|דקדוק|עתיד/i);
      expect(cardsOf(day(lang)).some((w) => /^(going to|je vais|voy a|vamos a|on va)$/i.test(plain(w.text).trim())), lang).toBe(false);
    }
  });
  it('43. no flashcard chain for today / tonight / tomorrow: no time word alone on a card, one swap round only', () => {
    const lone = /^(today|tonight|tomorrow|aujourd'hui|ce soir|demain|hoy|esta noche|mañana|this morning|ce matin|esta mañana|later|plus tard|más tarde)$/i;
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) expect(plain(w.text).trim(), lang).not.toMatch(lone);
      expect(stepsOf(d, 'swap').flatMap((s) => s.rounds), lang).toHaveLength(1);
      for (const s of stepsOf(d, 'visualMatch')) for (const t of s.tiles) expect(t.label ?? '', lang).not.toMatch(lone);
    }
  });
  it('44. no adjective quiz for "good" (or "great" / "perfect"): never alone on a card, a tile, an answer or a quiz', () => {
    const lone = /^(good|very good|great|perfect|bon|très bon|super|parfait|bien|muy bien|genial|perfecto)$/i;
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) expect(plain(w.text).trim(), lang).not.toMatch(lone);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(plain(o.text ?? text(d, o.itemId)).trim()).not.toMatch(lone);
      expect(stepsOf(d, 'quiz').map((s) => strip(s.itemId))).toEqual(['reply.time.early']);
    }
  });
  it('45. no AI clock puzzle: no picture is ever a tile; no slot or prop is a clock', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'visualMatch')) for (const t of s.tiles) expect(t.image, lang).toBeUndefined();
    for (const x of [...Object.values(M12_SLOTS), ...Object.values(M12_PROPS)]) expect(x.emoji).not.toMatch(/[⏰⏱⏲🕐-🕧]/u);
    expect(Object.keys(M12_SLOTS).join(' ') + Object.keys(M12_PROPS).join(' ')).not.toMatch(/clock|hour|20-00|07-00/);
  });
  it('46. no unrelated plans: the only plans on screen are the conversation\'s own (dinner in the centre, the beach)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(JSON.stringify(d), lang).not.toMatch(/cinema|museum|shopping|concert|movie|park|cinéma|musée|cine|museo|קולנוע|מוזיאון|קניות/i);
      const captions = stepsOf(d, 'visualMatch').flatMap((s) => s.tiles.map((t) => t.caption?.en)).filter(Boolean);
      expect(new Set(captions)).toEqual(new Set(['Beach', 'Dinner · Centre', 'Tonight', 'Tomorrow morning']));
    }
  });
  it('47. no artificial recovery phrase, no alternative "When?" — not in the practice, not in the conversation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(JSON.stringify(d), lang).not.toMatch(/recovery\.|phrase\.time\.when/);
      expect(stepsOf(d, 'ambush').length + stepsOf(d, 'swipe').length + stepsOf(d, 'tool').length + stepsOf(d, 'replies').length, lang).toBe(0);
    }
  });
  /** Every target-language text Mission 12 puts in front of the learner. */
  const targetTexts = (d: BootcampDayContent): string[] => [
    ...d.items.map((i) => i.text),
    ...cardsOf(d).map((w) => w.text),
    ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => [heardIn(d, r), ...r.options.map((o) => o.text ?? text(d, o.itemId))])),
    ...stepsOf(d, 'visualMatch').flatMap((s) => s.rounds.flatMap((r) => [r.audio.en, r.reinforce?.en ?? ''])),
    ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => r.chunks.join(' '))),
    ...stepsOf(d, 'swap').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => fillFrame(r.frame, o.slot)))),
    ...stepsOf(d, 'quiz').flatMap((s) => [s.itemId, ...s.wrongIds].map((id) => text(d, id))),
    ...Object.values(d.dialogues).flatMap((dl) => dl.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)])),
  ].filter(Boolean);
  it('48. no invented target-language sentence: every one is a locked line, a piece of one, or verified prior learning', () => {
    for (const lang of LANGS) {
      const locked = LOCKED[lang].map((l) => quotes(l.slice(5)));
      const prior = learnedBefore(lang, 12);
      for (const t of targetTexts(day(lang))) expect(locked.some((l) => hasChunk(l, quotes(t))) || prior.knowsChunk(t), `${lang} “${t}”`).toBe(true);
    }
  });
});

describe('the conversation flow — supported, no help, final', () => {
  const runAnswers = (d: BootcampDayContent, from: number, to: number): string[] => d.steps.slice(from, to).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map(accepted) : s.kind === 'visualMatch' ? s.rounds.map((r) => `🎯${r.correct}`) : []));
  it('49. the supported conversation: all seven lines in order — with the Time Strip and the planner on screen', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, supportedAt(d), dialogueAt(d)), lang).toEqual(LEARNER);
      for (const s of d.steps.slice(supportedAt(d), dialogueAt(d))) if (s.kind === 'quickReply') { const b = splitTimeBoard(s.label!.en ?? '')!; expect(b.strip && b.plan, lang).toBeTruthy(); for (const r of s.rounds) expect(r.promptItemId, lang).toBeDefined(); }
      expect((d.steps[dialogueAt(d) - 1] as Extract<BootcampStep, { kind: 'receipt' }>).text.en).toContain(planner(5)[1]);
    }
  });
  it('50. no help: the same order, the friend\'s real lines at natural speed — no meaning, no card, no hint (the board shows only what was said)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, dialogueAt(d) + 1, videoAt(d)), lang).toEqual(LEARNER);
      const run = d.steps.slice(dialogueAt(d) + 1, videoAt(d));
      expect(run.some((s) => s.kind === 'prime')).toBe(false);
      for (const s of run) if (s.kind === 'quickReply') {
        expect(s.challenge, lang).toBe(true);
        if (s.label) expect(splitTimeBoard(s.label.en ?? '')!.before.concat(splitTimeBoard(s.label.en ?? '')!.after), lang).toEqual([]); // the board only
        for (const r of s.rounds) { expect(r.npc, lang).toBeDefined(); expect(r.situation).toBeUndefined(); }
      }
      expect((run[0] as QR).label).toBeUndefined(); // it opens with an empty screen: the planner starts unknown
      expect(run.flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map((r) => r.npc!.en) : []))).toEqual([0, 2, 4, 6, 8, 10, 12].map((i) => line(lang, i)));
    }
  });
  it('51. the final: "close your plans" — the seven abilities once, in order, plus 20:00 and "see you tonight" by ear', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const gate = d.steps.slice(videoAt(d) + 1);
      expect(gate.map((s) => s.kind)).toEqual(['quickReply', 'quickReply', 'visualMatch', 'quickReply', 'quickReply', 'quickReply', 'visualMatch', 'receipt', 'summary']);
      expect(runAnswers(d, videoAt(d) + 1, d.steps.length), lang).toEqual([...LEARNER.slice(0, 3), '🎯20:00', ...LEARNER.slice(3), '🎯tonight']);
      expect((gate[0] as QR).label!.he).toContain('סגור את התוכניות שלך להערב ולמחר.');
      const heardLines = gate.flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map((r) => r.npc?.en ?? '') : s.kind === 'visualMatch' ? s.rounds.map((r) => r.audio.en) : []));
      for (const l of [L_INVITE, L_EIGHT, L_BEACH, L_EARLY, L_BYE]) expect(heardLines, lang).toContain(at(l, lang)); // dinner · 20:00 · beach · early · see you tonight
    }
  });
  it('52. the planner reveal order holds in each run (supported · no help · final)', () => {
    for (const lang of LANGS) for (const [name, from, to] of RUNS(day(lang)).slice(1)) expect(revealViolations(day(lang), lang, from, to), `${lang} ${name}`).toEqual([]);
  });
  it('53. 📅 PLANS MADE only once, at the very end, after both plans are complete — no score', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const ends = d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('PLANS MADE'));
      expect(ends.map(([, i]) => i), lang).toEqual([d.steps.length - 2]);
      const end = ends[0]![0] as Extract<BootcampStep, { kind: 'receipt' }>;
      expect(end.text).toEqual({ he: PLANS_MADE[0], en: PLANS_MADE[1] });
      expect(end.text.en).toBe('📅 PLANS MADE ¦ 🌙 Tonight: Dinner · Centre / 20:00 ✅ ‖ 🌅 Tomorrow: Beach / Meet here · 07:00 ✅');
      expect(end.text.en).not.toMatch(/%|points|score|\d+\/\d+/i);
      expect(d.steps.at(-1)!.kind).toBe('summary');
    }
  });
});

describe('audio never blocks the answer (the approved conversation behaviour)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const beat = (lang: CoverageLang, id: string) => {
    const d = day(lang).dialogues['making-plans']!;
    const calls: string[] = [];
    let finish: (r: SpeakResult) => void = () => undefined;
    runNpcBeat(d, d.nodes.find((n) => n.id === id)!, {
      speak: () => { calls.push('speak'); return new Promise<SpeakResult>((r) => { finish = r; }); },
      go: (next) => calls.push(`go:${next}`), end: () => calls.push('end'), later: (fn) => fn(), cancelled: () => false,
    });
    return { calls, finish: async (r: SpeakResult) => { finish(r); await Promise.resolve(); await Promise.resolve(); } };
  };
  it('54–56. every answered line of the friend shows the choices AT ONCE, while its audio keeps playing', async () => {
    for (const lang of LANGS) {
      const d = day(lang).dialogues['making-plans']!;
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.length, lang).toBe(14); // the seven lines + their slow re-asks
      for (const n of answered) {
        const run = beat(lang, n.id);
        expect(run.calls, `${lang} ${n.id}`).toEqual(['speak', `go:${n.next}`]); // no waiting for "ended"
        await run.finish('ended');
        expect(run.calls.filter((c) => c.startsWith('go:'))).toHaveLength(1);
      }
      const bye = beat(lang, d.nodes.find((n) => n.end)!.id);
      expect(bye.calls).toEqual(['speak']);
      await bye.finish('ended');
      expect(bye.calls.at(-1)).toBe('end');
    }
  });
  it('57. answering mid-line stops the friend\'s line: the previous audio is cleaned up — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, spoken: [] as string[], getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; this.spoken.push(u.text); } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const invite = tts.speak(L_INVITE[0], 'en');
    void tts.speak("Yes! What time?", 'en');
    expect(await invite).toBe('interrupted');
    expect(synth.current?.text).toBe('Yes! What time?');
    tts.cancelSpeech();
    expect(synth.current).toBeNull();
    const src = readFileSync(fileURLToPath(new URL('./PracticeSteps.tsx', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/audioFinished|hasFinishedSpeaking|showChoicesAfterAudio|onAudioEnded/);
  });
});

describe('coverage: every meaningful chunk, no orphan', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M12_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(quotes(l.slice(5)), quotes(c.chunk[lang]))), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M12_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(quotes(l.slice(5))).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) it(`${lang}: every chunk is COVERED (3+ encounters, 2+ kinds, meaning shown, heard or retrieved)`, () => {
    for (const row of coverageOf(day(lang), lang, M12_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
  });
  it('80/20: the six reusable functions get the most retrieval; the opening is not over-taught', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const n = (id: string) => encounters(d, chunk(id, lang)).filter((e) => e.kind === 'retrieval').length;
      for (const id of ['free-tonight', 'what-time', 'not-too-late', 'what-doing-tomorrow', 'lets-meet']) expect(n(id), `${lang} ${id}`).toBeGreaterThanOrEqual(5);
      expect(n('im-free')).toBeGreaterThan(n('maybe-later'));
      expect(n('maybe-later'), lang).toBeLessThanOrEqual(5);
    }
  });
  it('32 meaningful interactions (target 30–32) — counted the same way as Mission 11', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const n = d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'swap' ? s.rounds.length
        : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : s.kind === 'quiz' ? 1 : 0), 0);
      expect(n, lang).toBe(32);
    }
  });
});

describe('the arc, state, visuals and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk',
      'prime',
      'prime', 'quickReply',
      'prime', 'quickReply',
      'prime', 'visualMatch', 'quickReply',
      'prime', 'swap',
      'prime', 'visualMatch', 'quickReply',
      'prime', 'quiz', 'sentenceBuilder',
      'prime',
      'quickReply', 'quickReply', 'quickReply', 'quickReply', 'quickReply', 'receipt',
      'dialogue', 'receipt',
      'quickReply:speed', 'quickReply:speed', 'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'quickReply', 'visualMatch:speed', 'quickReply', 'quickReply', 'quickReply', 'visualMatch:speed', 'receipt', 'summary',
    ]);
  });
  it('plain serialisable state: time focus and the plan — nothing filled before it is revealed', () => {
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
    for (let n = 0; n <= 6; n++) {
      const s = planState(n as 0, 'tonight');
      expect(JSON.parse(JSON.stringify(s))).toEqual(s);
      expect(s.tonightTime === null, `stage ${n}`).toBe(n < 2);
      expect(s.tomorrowPlan === null, `stage ${n}`).toBe(n < 3);
      expect(s.tomorrowMeetingTime === null, `stage ${n}`).toBe(n < 5);
    }
  });
  it('the board renders the strip, the planner and the label\'s own text — nothing added', () => {
    for (let n = 0; n <= 6; n++) {
      const str = `${timeStrip('tomorrow')[1]} ¦ ${planner(n as 0)[1]} ¦ What do you answer?`;
      const b = splitTimeBoard(str)!;
      expect(b.strip!.map((c) => c.now)).toEqual([false, false, false, true]);
      expect(b.plan!.map((p) => p.day)).toEqual(['🌙 Tonight', '🌅 Tomorrow']);
      expect(b.after).toEqual(['What do you answer?']);
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: str }));
      expect(html.match(/class="plan-day-row"/g)).toHaveLength(4);
    }
    expect(splitTimeBoard('Just a sentence.')).toBeNull();
  });
  it('visual slots: 14 semantic slots and 1 result prop — PLACEHOLDERS (emoji, no image yet), listed in the Astra manifest', () => {
    expect(Object.keys(M12_SLOTS).sort()).toEqual(['ask-time', 'ask-tomorrow', 'beach-plan', 'dinner-invitation', 'free-tonight', 'leave-early', 'meeting-plan', 'morning-meeting', 'morning-question', 'not-too-late', 'open-morning', 'see-you-tonight', 'tonight-question', 'very-good-there']);
    expect(Object.keys(M12_PROPS)).toEqual(['plans-made']);
    for (const s of [...Object.values(M12_SLOTS), ...Object.values(M12_PROPS)]) { expect(s.emoji).toBeTruthy(); expect(s).not.toHaveProperty('image'); }
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION12_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/VISUAL PRODUCTION REQUIRED/);
    for (const key of [...Object.keys(M12_SLOTS), ...Object.keys(M12_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language; no plan picture before its line', () => {
    const looks = new Set(Object.values(M12_SLOTS).map((s) => s.emoji));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(looks, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    const d = day('en');
    const before = (key: string) => d.steps.slice(0, primeAt(d, key)).filter((s) => s.kind === 'prime').flatMap((p) => (p as Extract<BootcampStep, { kind: 'prime' }>).words.map((w) => w.emoji));
    expect(before('time.line.invite')).not.toContain(M12_SLOTS['dinner-invitation'].emoji);
    expect(before('time.line.beach')).not.toContain(M12_SLOTS['beach-plan'].emoji);
    expect(before('time.line.early')).not.toContain(M12_SLOTS['leave-early'].emoji);
  });
  it('video: none recorded yet in any language — the standard step is there and safely skipped; replay keeps the mission\'s progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[11]!.day);
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
