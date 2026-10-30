import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { missionVideo } from '../videos/missionVideo.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M06_CONCEPTS } from './mission06Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import { borderChecklist, M06_ANSWER, M06_CHECKS, M06_PLACES, M06_PROFILE, M06_PROPS, M06_SLOTS } from './practiceArrival.js';
import { validatePracticeStep } from './practiceEngines.js';
import { auditWords, learnedBefore, missionContent, missionWalk, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 06 — Airport & Border: "I am actually going through border control." The conversation is
 * LOCKED; the learner has ONE trip (holiday · two weeks · a hotel in the city centre · nothing to
 * declare), the officer does not know it, and the learner answers from it — one requirement at a
 * time, then the whole interview, then with no help, then the final check: ENTRY APPROVED.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const day = (lang: CoverageLang, n = 6): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M06_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const NON_SKIPPABLE = (d: BootcampDayContent, at: number): boolean => !(d.steps[at]!.kind === 'prime' && (d.steps[at] as { gate?: boolean }).gate);

const LOCKED: Record<CoverageLang, string[]> = {
  en: [
    'NPC: Next, please. Passport?', 'YOU: Here is my passport.', "NPC: Thank you. What's the purpose of your visit?", "YOU: I'm here on holiday.",
    'NPC: All right. How long are you staying?', 'YOU: For two weeks.', 'NPC: And where are you staying?', 'YOU: At a hotel in the city centre.',
    'NPC: Almost done. Anything to declare?', 'YOU: Nothing to declare.', 'NPC: Welcome, and enjoy your stay!',
  ],
  es: [
    'NPC: El siguiente, por favor. ¿Pasaporte?', 'YOU: Aquí tiene mi pasaporte.', 'NPC: Gracias. ¿Cuál es el motivo de su viaje?', 'YOU: Estoy de vacaciones.',
    'NPC: Muy bien. ¿Cuánto tiempo se queda?', 'YOU: Dos semanas.', 'NPC: ¿Y dónde se aloja?', 'YOU: En un hotel en el centro.',
    'NPC: Ya casi está. ¿Algo que declarar?', 'YOU: Nada que declarar.', 'NPC: Bienvenido, ¡y que disfrute su estancia!',
  ],
  fr: [
    'NPC: Au suivant, s’il vous plaît. Passeport ?', 'YOU: Voici mon passeport.', 'NPC: Merci. Quel est le motif de votre visite ?', 'YOU: Je suis en vacances.',
    'NPC: Très bien. Vous restez combien de temps ?', 'YOU: Pour deux semaines.', 'NPC: Et où logez-vous ?', 'YOU: Dans un hôtel dans le centre-ville.',
    'NPC: C’est presque fini. Quelque chose à déclarer ?', 'YOU: Rien à déclarer.', 'NPC: Bienvenue, et bon séjour !',
  ],
};
const line = (lang: CoverageLang, i: number): string => LOCKED[lang][i]!.slice(5);
/** The traveller's five lines, in the order the officer asks for them. */
const LEARNER = ['phrase.border.passport-here', 'phrase.border.on-holiday', 'phrase.border.two-weeks', 'phrase.border.staying-hotel', 'phrase.border.nothing-declare'];

describe('the conversation is locked, and Mission 06 is in its place', () => {
  for (const lang of LANGS) it(`${lang}: word for word the frozen one`, () => { expect(script(lang)).toEqual(LOCKED[lang]); });
  it('the dialogue tree (with its side-branches) is byte-for-byte what it was before this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual({ en: '02b56465', es: '0d50bef4', fr: '36b25c8f' });
  });
  it('Mission 06 is "Airport & Border", sixth on the journey', () => {
    expect(BOOTCAMP_PLAN[5]!.id).toBe('airport-border');
    expect(missionNumber(BOOTCAMP_PLAN[5]!.day)).toBe(6);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Airport & Border');
  });
  it('Missions 01–05 are byte-for-byte unchanged by this pass', () => {
    const print = (n: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l, n)))]));
    expect(print(1)).toEqual({ en: '63b23508', es: '4802a27c', fr: '4d41f68e' });
    expect(print(2)).toEqual({ en: '28382d4a', es: '202d56bb', fr: '9eab5081' });
    expect(print(3)).toEqual({ en: 'e97d7f7c', es: '8d64f857', fr: '7dcc6a5d' });
    expect(print(4)).toEqual({ en: '540b6d7c', es: 'b47c7bda', fr: 'c3eef94a' });
    expect(print(5)).toEqual({ en: '50fa4cd1', es: '8d7d290d', fr: 'e539a4f6' });
  });
  it('Missions 08–30 are byte-for-byte unchanged by this pass (Mission 07 has its own pass since: mission07.test.ts)', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(9).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]))).toEqual({ en: '0a05d32a', es: '344c16b8', fr: 'b2f019ab' }); // Missions 10–30 (Missions 08 and 09 have their own passes since)
  });
});

describe('coverage: every meaningful chunk, no orphan', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    const GLUE: Record<CoverageLang, string[]> = { en: ['and'], es: ['y'], fr: ['et'] };
    for (const lang of LANGS) {
      for (const c of M06_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M06_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')).concat(GLUE[lang]));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) {
    it(`${lang}: every chunk is COVERED (3+ encounters, 2+ kinds, meaning shown; officer lines heard-and-understood; learner lines retrieved, 5+)`, () => {
      for (const row of coverageOf(day(lang), lang, M06_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    });
  }
  it('coverage parity: the same chunks covered in English, Spanish and French, met the same ways (each language segmented in its own words)', () => {
    const kinds = (lang: CoverageLang) => Object.fromEntries(coverageOf(day(lang), lang, M06_CONCEPTS).map((r) => [r.id, [r.covered, r.byKind.listening, r.byKind.retrieval, r.byKind.context]]));
    expect(kinds('es')).toEqual(kinds('en'));
    expect(kinds('fr')).toEqual(kinds('en'));
  });
});

describe('TEACH before TEST — strict, against VERIFIED prior learning', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 6);
  for (const lang of LANGS) {
    it(`${lang}: no tested line, option or label has a word not taught first here or verifiably learned in Missions 01–05`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words)).toEqual([]);
    });
    it(`${lang}: no tested line has a chunk of this conversation that the mission had not taught first`, () => {
      expect(unpreparedChunks(day(lang), lang, M06_CONCEPTS)).toEqual([]);
    });
  }
  it('prior knowledge is the verified kind: Missions 01–05, taught with meaning — and a word only seen in an earlier conversation does not count', () => {
    expect(prior('en').missions).toEqual([1, 2, 3, 4, 5]);
    for (const [lang, w] of [['en', 'likewise'], ['es', 'igualmente'], ['fr', 'ami']] as const) expect(prior(lang).words.has(w), `${lang} ${w}`).toBe(false);
  });
  it('what Mission 06 reuses from before is reactivated, not retaught as new: “thank you”, “welcome”, “enjoy your stay” (Missions 01–02); everything else it teaches', () => {
    for (const lang of LANGS) {
      for (const id of ['thank-you', 'welcome', 'enjoy-stay']) expect(prior(lang).knowsChunk(chunk(id, lang)), `${lang} ${id} is prior`).toBe(true);
      for (const id of ['passport', 'here-passport', 'purpose-visit', 'holiday', 'how-long', 'two-weeks', 'where-staying', 'hotel-city-centre', 'almost-done', 'anything-declare', 'nothing-declare']) {
        expect(prior(lang).knowsChunk(chunk(id, lang)), `${lang} ${id} is NOT prior`).toBe(false);
      }
    }
  });
  it('the audit has teeth: a planted unknown concept is caught — and putting it into an earlier conversation does not make it learned', () => {
    const d = day('en');
    const at = d.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge);
    const qr = d.steps[at] as Extract<BootcampStep, { kind: 'quickReply' }>;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, i) => (i === at ? { ...qr, rounds: [{ ...qr.rounds[0]!, npc: { en: 'Show me your boarding pass.', he: 'x' } }] } : s)) };
    expect(unpreparedWords(planted, prior('en').words).join(' ')).toMatch(/“boarding”/);
    // Mission 05's conversation now says it — seen before, still not learned before.
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 5) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} Show me your boarding pass.` } : x)) } } };
    };
    expect(JSON.stringify(seen('en', 5).dialogues)).toContain('boarding pass');
    const stillUnknown = learnedBefore('en', 6, seen);
    expect(stillUnknown.words.has('boarding')).toBe(false);
    expect(unpreparedWords(planted, stillUnknown.words).join(' ')).toMatch(/“boarding”/);
    // and without the picture cards, the games test cold
    const noCards: BootcampDayContent = { ...d, steps: d.steps.filter((s) => !(s.kind === 'prime' && s.words.some((w) => w.line))) };
    expect(unpreparedChunks(noCards, 'en', M06_CONCEPTS).length).toBeGreaterThan(10);
  });
  /** First step that TEACHES a chunk (in a step that cannot be skipped) vs the first that TESTS it. */
  const order = (d: BootcampDayContent, c: string) => {
    const { taught, tested } = missionWalk(d);
    return {
      teach: Math.min(...taught.filter((e) => hasChunk(e.text, c) && NON_SKIPPABLE(d, e.at)).map((e) => e.at)),
      test: Math.min(...tested.filter((e) => hasChunk(e.text, c)).map((e) => e.at)),
    };
  };
  for (const [id, what] of [
    ['passport', 'the passport, before the handover'], ['here-passport', '"Here is my passport", before it is built'], ['purpose-visit', 'the purpose question, before the purpose game'],
    ['holiday', 'the holiday answer, before it is retrieved'], ['how-long', 'the duration question, before the calendar'], ['two-weeks', '"two weeks", before it is retrieved'],
    ['where-staying', 'the staying question, before the city map'], ['hotel-city-centre', 'the hotel in the city centre, before it is retrieved'],
    ['anything-declare', 'the declaration question, before the green channel'], ['nothing-declare', '"Nothing to declare", before it is retrieved'],
  ] as const) {
    it(`TEACH → TEST: ${what}`, () => {
      for (const lang of LANGS) {
        const o = order(day(lang), chunk(id, lang));
        expect(Number.isFinite(o.test), `${lang} ${id} is tested`).toBe(true);
        expect(o.teach, `${lang} ${id}`).toBeLessThan(o.test);
      }
    });
  }
  it('"Almost done" and the welcome are comprehension: a card with the meaning, then heard — never asked for', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cards = stepsOf(d, 'prime').filter((p) => !p.gate).flatMap((p) => p.words);
      for (const id of ['almost-done', 'welcome', 'enjoy-stay']) {
        expect(cards.some((w) => hasChunk(w.text, chunk(id, lang)) && w.meaning.he), `${lang} ${id} card`).toBe(true);
        expect(encounters(d, chunk(id, lang)).filter((e) => e.kind === 'listening').length, `${lang} ${id} heard`).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('who says what', () => {
  const produced = (d: BootcampDayContent): string[] => [
    ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.filter((o) => o.correct).map((o) => strip(o.itemId)))),
    ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId))),
  ];
  it('the officer\'s lines are understood, never produced: no Quick Reply answer or builder is one of them', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const said = produced(d).map((id) => text(d, `${lang}.${id}`));
      for (const c of M06_CONCEPTS.filter((x) => x.role === 'hear' && x.id !== 'passport')) expect(said.some((s) => hasChunk(s, c.chunk[lang])), `${lang} ${c.id}`).toBe(false);
    }
  });
  it('the learner produces only the traveller\'s five lines; builders only for the three that gain from it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const id of produced(d)) expect(LEARNER, lang).toContain(id);
      expect(new Set(produced(d))).toEqual(new Set(LEARNER));
      expect(stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId)))).toEqual(['phrase.border.passport-here', 'phrase.border.on-holiday', 'phrase.border.staying-hotel']);
      for (const s of stepsOf(d, 'sentenceBuilder')) for (const r of s.rounds) expect(r.chunks.join(' '), lang).toBe(text(d, r.itemId));
    }
  });
  it('no artificial recovery: no practice step offers a recovery phrase, and there is no ambush / quiz / swap', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(strip(o.itemId), lang).not.toMatch(/^phrase\.recovery\./);
      expect(stepsOf(d, 'ambush').length + stepsOf(d, 'quiz').length + stepsOf(d, 'swap').length, lang).toBe(0);
    }
  });
  it('wrong answers are the traveller\'s own taught lines, or pictures never named in the learning language', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(LEARNER, lang).toContain(strip(o.itemId));
      for (const s of stepsOf(d, 'visualMatch')) for (const t of s.tiles) expect(t.label, `${lang} ${t.id}`).toBeUndefined();
      for (const s of stepsOf(d, 'miniMap')) for (const r of s.rounds) for (const c of r.cells) expect(c.label, `${lang} ${c.id}`).toBeUndefined();
      // the calendar's rows and the tiles' captions are in the APP language (Hebrew / English UI), never the learning one
      for (const s of stepsOf(d, 'customize')) for (const o of s.options) expect(o.label.he).toMatch(/[֐-׿]/);
      for (const s of stepsOf(d, 'visualMatch')) for (const t of s.tiles) if (t.caption) expect(t.caption.he).toMatch(/[֐-׿]/);
    }
  });
});

describe('ONE traveller: the trip never changes', () => {
  it('the BRIEFING opens the mission: your role (a tourist entering the country), and the four facts you will give the officer — as label → value', () => {
    expect(M06_PROFILE).toEqual({ purpose: 'holiday', duration: 'two-weeks', stay: 'hotel-city-centre', declaration: 'nothing' });
    for (const lang of LANGS) {
      const card = day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
      expect(card.kind).toBe('talk');
      expect(card.body.map((b) => b.he).join(' ')).toBe('במשימה הזו אתה נכנס למדינה כתייר. אלה הפרטים שתצטרך למסור לפקיד הגבולות:');
      expect(card.body.map((b) => b.en).join(' ')).toMatch(/entering a country as a tourist.*details you will give the border officer/);
      expect(card.facts!.map((f) => [f.label.he, f.value.he])).toEqual([['מטרת הביקור', 'חופשה'], ['משך השהייה', 'שבועיים'], ['מקום לינה', 'מלון במרכז העיר'], ['מכס', 'אין מה להצהיר']]);
      expect(card.facts!.map((f) => f.value.en)).toEqual(['Holiday', 'Two weeks', 'A hotel in the city centre', 'Nothing to declare']);
      // the old "this is my trip" (as if the learner had chosen it) is gone
      expect(card.cta).toEqual({ he: 'התחל ביקורת גבולות', en: 'Start border control' });
      expect(JSON.stringify(day(lang).steps)).not.toMatch(/זה הטיול שלי|That’s my trip|This is my trip/);
      // one briefing — not a separate summary screen competing with it
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
    }
    // nothing else on its screen: the player leaves the Foundation hint off a briefing card
    const player = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(player).toMatch(/!\(step\.kind === 'talk' && step\.facts\) && <FoundationHint/);
  });
  it('every game answers from the same trip: passport handed over, holiday, two weeks, the hotel in the city centre, the green channel', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'visualMatch')) for (const r of s.rounds) {
        const tiles = s.tiles.map((t) => t.id);
        const expected = tiles.includes('entry') ? 'entry' : tiles.includes('phone') ? 'passport' : tiles.includes('work') ? 'holiday' : tiles.includes('four-weeks') ? 'two-weeks' : 'nothing';
        expect(r.correct, `${lang} ${r.audio.en}`).toBe(expected);
      }
      for (const s of stepsOf(d, 'miniMap')) for (const r of s.rounds) expect(r.correct, lang).toBe('hotel-centre');
      expect(M06_ANSWER).toEqual({ desk: 'passport', purpose: 'holiday', duration: 'two-weeks', stay: 'hotel-centre', declaration: 'nothing' });
    }
  });
  it('every interview answer is the same trip: holiday, two weeks, the hotel in the city centre, nothing to declare', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'quickReply')) {
      expect(s.rounds.map((r) => strip(r.options.find((o) => o.correct)!.itemId)), lang).toEqual(LEARNER);
      for (const r of s.rounds) expect(r.options.filter((o) => o.correct), lang).toHaveLength(1);
    }
  });
  it('question → the traveller\'s ACTUAL answer: purpose → holiday, how long → two weeks, where → the hotel in the centre, declare → nothing', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const m = stepsOf(d, 'matchPairs')[0]!;
      expect(m.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId)])).toEqual([
        ['reply.border.purpose', 'phrase.border.on-holiday'], ['reply.border.how-long', 'phrase.border.two-weeks'],
        ['reply.border.where-staying', 'phrase.border.staying-hotel'], ['reply.border.anything-declare', 'phrase.border.nothing-declare'],
      ]);
      // the answer IS the sentence (the learning language, exactly as the conversation says it) — never an icon,
      // never a gloss; the picture sits beside it as support
      for (const p of m.pairs) {
        expect([p.answerLabel, p.answerGloss, p.answerText], lang).toEqual([undefined, undefined, undefined]);
        expect(p.answerImage, lang).toBeTruthy();
      }
      expect(m.pairs.map((p) => text(d, p.answerItemId))).toEqual([3, 5, 7, 9].map((i) => line(lang, i)));
      expect(m.pairs.map((p) => p.answerImage)).toEqual([M06_SLOTS.holiday.image, M06_SLOTS['two-weeks'].image, M06_SLOTS['hotel-city-centre'].image, M06_SLOTS['nothing-to-declare'].image]);
    }
    // the player shows the picture BESIDE the sentence, at a size you can read on a phone (not a 48 px thumbnail as the whole answer)
    const ui = readFileSync(fileURLToPath(new URL('./PracticeSteps.tsx', import.meta.url)), 'utf8');
    expect(ui).toMatch(/pmatch-supported"><img className="pmatch-img is-support"[^>]*\/><span><TargetText text=\{answerText\(i\)\} \/>/);
    const css = readFileSync(fileURLToPath(new URL('../../app/styles.css', import.meta.url)), 'utf8');
    expect(css).toMatch(/\.pmatch-img\.is-support \{ width: 104px; height: 59px;/);
  });
});

describe('DURATION — a choice of meaning, not a checkbox puzzle', () => {
  const durations = (d: BootcampDayContent) => stepsOf(d, 'visualMatch').filter((s) => s.tiles.some((t) => t.id === 'four-weeks'));
  it('the officer\'s real question, then three stays on the same calendar — one week, two weeks, four weeks — and the answer is two weeks', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const [teach, gate] = durations(d);
      expect(teach!.tiles.map((t) => [t.id, t.image, t.caption!.he])).toEqual([
        ['one-week', M06_SLOTS.week.image, 'שבוע אחד'], ['two-weeks', M06_SLOTS['two-weeks'].image, 'שבועיים'], ['four-weeks', M06_PROPS['four-weeks'].image, 'ארבעה שבועות'],
      ]);
      expect(teach!.rounds.map((r) => [r.audio.en, r.correct])).toEqual([[line(lang, 4), 'two-weeks'], [line(lang, 5), 'two-weeks']]);
      expect(gate!.rounds.map((r) => [r.audio.en, r.correct])).toEqual([[line(lang, 4), 'two-weeks']]);
      // "For two weeks." is said back, with its meaning, the moment the stay is picked
      for (const s of [teach!, gate!]) expect(s.rounds[0]!.reinforce, lang).toMatchObject({ en: line(lang, 5), he: 'לשבועיים.' });
      // only "two weeks" is ever said in the learning language — one week / four weeks are pictures with app-language names
      for (const t of teach!.tiles) expect(t.label, lang).toBeUndefined();
    }
  });
  it('no four-switch calendar, no officer + calendar + calendar rebus: the customize game is gone from Mission 06', () => {
    for (const lang of LANGS) {
      expect(stepsOf(day(lang), 'customize'), lang).toHaveLength(0);
      expect(JSON.stringify(day(lang).steps), lang).not.toMatch(/week-1|week-2|week-3|week-4|Mark your stay on the calendar/);
    }
  });
});

describe('STAY — the city centre is an area on the map, not the middle square', () => {
  it('the map carries its meaning in its data: a city-centre zone, a residential street, the outskirts', () => {
    expect(M06_PLACES).toEqual({
      'hotel-centre': { kind: 'hotel', zone: 'city-centre' }, 'hotel-outskirts': { kind: 'hotel', zone: 'outskirts' },
      house: { kind: 'house', zone: 'residential' }, airport: { kind: 'airport', zone: 'outskirts' },
    });
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'miniMap')) for (const r of s.rounds) {
      const zone = (id: string) => r.cells.find((c) => c.id === id)!.zone;
      // every place on the map knows its zone, and the cells say the same as M06_PLACES
      for (const [id, place] of Object.entries(M06_PLACES)) expect(zone(id), `${lang} ${id}`).toBe(place.zone);
      // the centre is an AREA: its square and its streets, drawn as one shaded zone
      expect(r.cells.filter((c) => c.zone === 'city-centre').map((c) => c.id).sort()).toEqual(['centre-square', 'centre-street-1', 'centre-street-2', 'hotel-centre']);
      expect(r.cells.find((c) => c.id === 'centre-square')!.image).toBe(M06_SLOTS['city-centre'].image);
    }
  });
  it('the answer is "a hotel" AND "in the city centre" — never "the cell at row 1, col 1"', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'miniMap')) for (const r of s.rounds) {
      const right = r.cells.find((c) => c.id === r.correct)!;
      expect(M06_PLACES[r.correct as keyof typeof M06_PLACES]).toEqual({ kind: 'hotel', zone: 'city-centre' });
      expect([right.row, right.col], lang).not.toEqual([1, 1]); // not the middle square
      // exactly one tappable place is a hotel in the centre: the other hotel is out of town, the house is not a hotel, the airport is not the centre
      const tappable = r.cells.filter((c) => c.tappable).map((c) => c.id) as (keyof typeof M06_PLACES)[];
      expect(tappable.filter((id) => M06_PLACES[id].kind === 'hotel' && M06_PLACES[id].zone === 'city-centre')).toEqual(['hotel-centre']);
      expect(M06_PLACES['hotel-outskirts'].zone).not.toBe('city-centre');
      expect(M06_PLACES.house.kind).not.toBe('hotel');
      expect([M06_PLACES.airport.kind, M06_PLACES.airport.zone]).toEqual(['airport', 'outskirts']);
      // the out-of-town places sit at the map's edges (the bottom row / far column), away from the centre area
      for (const id of ['hotel-outskirts', 'airport'] as const) { const c = r.cells.find((x) => x.id === id)!; expect(c.row, `${lang} ${id}`).toBe(2); }
    }
  });
  it('a wrong pick is explained: the centre area is drawn out, and "At a hotel in the city centre." is said with its meaning', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'miniMap')) {
      if (!s.challenge) expect(s.label!.en, lang).toMatch(/city centre is the shaded area/); // the teaching map says it; the final check (a speed step) shows only its heading
      for (const r of s.rounds) {
        const said = r.reinforce ?? r.audio;
        expect([said.en, said.he], `${lang} ${r.audio.en}`).toEqual([line(lang, 7), 'במלון במרכז העיר.']);
      }
    }
    const ui = readFileSync(fileURLToPath(new URL('./PracticeSteps.tsx', import.meta.url)), 'utf8');
    expect(ui).toMatch(/is-explain/);
    expect(ui).toMatch(/data-zone=\{cell\.zone\}/);
    const css = readFileSync(fileURLToPath(new URL('../../app/styles.css', import.meta.url)), 'utf8');
    expect(css).toMatch(/\.pmap\.is-explain\[data-answer-zone='city-centre'\] \.ptile\[data-zone='city-centre'\]/);
  });
});

describe('feedback — the line is the focus', () => {
  it('every Mission 06 board and map gives QUIET feedback: ✓ / ✕, the line and its meaning, one action', () => {
    for (const lang of LANGS) for (const s of [...stepsOf(day(lang), 'visualMatch'), ...stepsOf(day(lang), 'miniMap')]) expect(s.quiet, lang).toBe(true);
    const ui = readFileSync(fileURLToPath(new URL('./PracticeSteps.tsx', import.meta.url)), 'utf8');
    // quiet: no mascot in the result, and one button — Continue when right, Retry when wrong
    expect(ui).toMatch(/quiet\s*\n\s*\/\/ Quiet: the line is the point/);
    expect(ui).toMatch(/if \(quiet\) return <div className="action-zone">\{ok \? <button className="btn-primary" onClick=\{onNext\}>\{t\('continue'\)\}<\/button> : <button className="btn-primary" onClick=\{onRetry\}>\{t\('tryAgain'\)\}<\/button>\}<\/div>/);
  });
  it('after the officer\'s question, the result shows the traveller\'s ANSWER (the line to learn), not the question again', () => {
    const answerTo: Record<number, number> = { 0: 1, 2: 3, 4: 5, 6: 7, 8: 9 };
    for (const lang of LANGS) for (const s of [...stepsOf(day(lang), 'visualMatch'), ...stepsOf(day(lang), 'miniMap')]) for (const r of s.rounds) {
      const q = [0, 2, 4, 6, 8].find((i) => line(lang, i) === r.audio.en);
      if (q !== undefined) expect(r.reinforce?.en, `${lang} ${r.audio.en}`).toBe(line(lang, answerTo[q]!));
      else expect(r.reinforce, `${lang} ${r.audio.en}`).toBeUndefined(); // the line heard IS the answer
    }
  });
});

describe('visual fairness — every choice set, every engine', () => {
  const kindOf = (x: { image?: string; emoji?: string; label?: string }): string => (x.image ? 'image' : x.emoji ? 'emoji' : 'label');
  it('within one choice set, every choice has the same kind of picture — boards, the map, the matching answers', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'visualMatch')) for (const r of s.rounds) {
        const shown = s.tiles.filter((t) => (r.show ?? s.tiles.map((x) => x.id)).includes(t.id));
        expect(new Set(shown.map(kindOf)), `${lang} ${shown.map((t) => t.id)}`).toEqual(new Set(['image']));
      }
      for (const s of stepsOf(d, 'miniMap')) for (const r of s.rounds) {
        expect(new Set(r.cells.filter((c) => c.tappable).map(kindOf)), lang).toEqual(new Set(['image']));
        // and no emoji anywhere on the map: drawn places are artwork, the rest is the map itself
        for (const c of r.cells) expect(c.emoji, `${lang} ${c.id}`).toBeUndefined();
      }
      for (const s of stepsOf(d, 'matchPairs')) expect(new Set(s.pairs.map((p) => Boolean(p.answerImage))), lang).toEqual(new Set([true]));
    }
  });
});

describe('the border check, as a process', () => {
  it('the checklist fills one requirement at a time — passport, purpose, duration, stay, declaration', () => {
    expect(M06_CHECKS).toEqual(['passport', 'purpose', 'duration', 'stay', 'declaration']);
    expect(borderChecklist(2)[1]).toBe('✅ Passport · ✅ Purpose · ⬜ Duration · ⬜ Stay · ⬜ Declaration');
    for (const lang of LANGS) {
      const d = day(lang);
      const before = d.steps.slice(0, stepsOf(d, 'matchPairs').length ? d.steps.indexOf(stepsOf(d, 'matchPairs')[0]!) : 0);
      expect(before.filter((s): s is Extract<BootcampStep, { kind: 'receipt' }> => s.kind === 'receipt').map((s) => s.text.en), lang).toEqual([1, 2, 3, 4, 5].map((n) => borderChecklist(n)[1]));
    }
  });
  it('each requirement is practised its own way: an object handed over, a situation, a length of stay, a map, a channel', () => {
    const d = day('en');
    const firstGames = [4, 8, 12, 15, 19].map((i) => d.steps[i - 1]!.kind);
    expect(firstGames).toEqual(['visualMatch', 'visualMatch', 'visualMatch', 'miniMap', 'visualMatch']);
    const tileSets = stepsOf(d, 'visualMatch').slice(0, 4).map((s) => s.tiles.map((t) => t.id));
    expect(tileSets).toEqual([['passport', 'phone', 'suitcase'], ['holiday', 'work', 'study'], ['one-week', 'two-weeks', 'four-weeks'], ['nothing', 'declare']]);
  });
  it('the supported interview asks everything, in order, with the trip on screen', () => {
    for (const lang of LANGS) {
      const s = stepsOf(day(lang), 'quickReply').find((x) => !x.challenge)!;
      expect(s.label!.en).toMatch(/holiday.*two weeks.*city centre.*nothing/);
      expect(s.rounds.map((r) => (r.npc ? r.npc.en : strip(r.promptItemId)))).toEqual([line(lang, 0), 'reply.border.purpose', 'reply.border.how-long', 'reply.border.where-staying', 'reply.border.anything-declare']);
    }
  });
  it('the no-help interview: the officer\'s real lines, in order, at speed — after the conversation, with no trip card before it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const s = stepsOf(d, 'quickReply').find((x) => x.challenge)!;
      expect(s.rounds.map((r) => r.npc?.en)).toEqual([0, 2, 4, 6, 8].map((i) => line(lang, i)));
      const at = d.steps.indexOf(s);
      expect(at).toBeGreaterThan(d.steps.findIndex((x) => x.kind === 'dialogue'));
      expect(d.steps.slice(d.steps.findIndex((x) => x.kind === 'dialogue'), at).some((x) => x.kind === 'talk')).toBe(false);
      expect(s.label).toBeUndefined(); // the speed heading, nothing else
    }
  });
  it('the final check (after the video) clears all five requirements in order, from the officer\'s real lines — then ENTRY APPROVED', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const gate = d.steps.slice(videoAt(d) + 1);
      const five = gate.slice(0, 5) as Extract<BootcampStep, { kind: 'visualMatch' | 'miniMap' }>[];
      expect(five.map((s) => s.kind)).toEqual(['visualMatch', 'visualMatch', 'visualMatch', 'miniMap', 'visualMatch']);
      expect(five.map((s) => s.label!.en)).toEqual(['Passport', 'Purpose', 'Duration', 'Stay', 'Declaration'].map((n, i) => `Border check ${i + 1}/5 — ${n}`));
      expect(five.map((s) => s.rounds[0]!.audio.en)).toEqual([0, 2, 4, 6, 8].map((i) => line(lang, i)));
      const [stamp, receipt, summary] = gate.slice(5);
      expect(stamp!.kind === 'visualMatch' && stamp.rounds[0]!.show).toEqual(['entry']);
      expect(stamp!.kind === 'visualMatch' && stamp.rounds[0]!.audio.en).toBe(line(lang, 10));
      expect(receipt!.kind === 'receipt' && receipt.text.en).toBe(`🛂 ENTRY APPROVED · ${borderChecklist(5)[1]} · Welcome!`);
      expect(summary!.kind).toBe('summary');
    }
  });
  it('the arc: briefing → Step 0 → passport → purpose → duration → stay → declaration → welcome → match → by ear → interview → conversation → no help → video → final check → entry approved', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'prime' ? (s.gate ? 'prime:step0' : 'prime:cards') : s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'miniMap' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0',
      'prime:cards', 'visualMatch', 'sentenceBuilder', 'receipt',
      'prime:cards', 'visualMatch', 'sentenceBuilder', 'receipt',
      'prime:cards', 'visualMatch', 'receipt',
      'prime:cards', 'miniMap', 'sentenceBuilder', 'receipt',
      'prime:cards', 'visualMatch', 'receipt',
      'prime:cards', 'matchPairs', 'replies', 'quickReply', 'receipt', 'dialogue', 'receipt', 'quickReply:speed', 'receipt',
      'video:again', 'visualMatch:speed', 'visualMatch:speed', 'visualMatch:speed', 'miniMap:speed', 'visualMatch:speed', 'visualMatch', 'receipt', 'summary',
    ]);
  });
});

describe('final artwork — one meaning, one image, one continuous world', () => {
  const SLOTS = ['passport', 'holiday', 'week', 'two-weeks', 'hotel', 'city-centre', 'hotel-city-centre', 'nothing-to-declare', 'passport-question', 'purpose-question', 'duration-question', 'where-staying-question', 'anything-to-declare', 'almost-done', 'welcome-enjoy-stay'];
  it('all 15 slots have their exact canonical final artwork', () => {
    expect(Object.keys(M06_SLOTS).sort()).toEqual([...SLOTS].sort());
    for (const [id, slot] of Object.entries(M06_SLOTS)) expect(slot.image).toBe(`images/mission06/${id}.jpg`);
  });
  it('all nine distractors have exact canonical artwork, including a distinct outskirts hotel and the four-weeks calendar', () => {
    expect(Object.keys(M06_PROPS).sort()).toEqual(['phone', 'suitcase', 'work', 'study', 'red-channel', 'house', 'airport', 'hotel-outskirts', 'four-weeks'].sort());
    for (const [id, prop] of Object.entries(M06_PROPS)) expect(prop.image).toBe(`images/mission06/${id === 'red-channel' ? 'declare' : id}.jpg`);
  });
  it('all 24 files physically exist as distinct JPEGs with high-resolution wide sources', () => {
    const assets = [...Object.values(M06_SLOTS), ...Object.values(M06_PROPS)].map((a) => a.image);
    expect(new Set(assets).size).toBe(24);
    const hashes = assets.map((asset) => {
      const bytes = readFileSync(new URL(`../../../public/${asset}`, import.meta.url));
      expect(bytes.subarray(0, 2).toString('hex'), asset).toBe('ffd8');
      // Read the JPEG frame: verify real file dimensions, not a claimed manifest size.
      let width = 0; let height = 0;
      for (let i = 2; i < bytes.length - 9;) {
        if (bytes[i] !== 0xff) break;
        const marker = bytes[i + 1]!;
        if ([0xc0, 0xc1, 0xc2].includes(marker)) { height = bytes.readUInt16BE(i + 5); width = bytes.readUInt16BE(i + 7); break; }
        i += 2 + bytes.readUInt16BE(i + 2);
      }
      expect(width, asset).toBeGreaterThanOrEqual(1536);
      expect(width / height, asset).toBeGreaterThan(1.7);
      expect(width / height, asset).toBeLessThan(1.9);
      return createHash('sha256').update(bytes).digest('hex');
    });
    expect(new Set(hashes).size).toBe(24);
  });
  it('every card picture comes from a slot, the same in every language', () => {
    const pictures = new Set(Object.values(M06_SLOTS).map((s) => s.image));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(pictures, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
  });
  it('no game mixes artwork with emoji — the right answer must never show by its picture quality alone', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'visualMatch')) {
      const withImage = s.tiles.filter((t) => t.image).length;
      expect(withImage === s.tiles.length, `${lang} ${s.tiles.map((t) => t.id).join(',')}`).toBe(true);
    }
  });
  it('every semantic card has its exact image and never an emoji-only fallback', () => {
    const mapping: Record<string, keyof typeof M06_SLOTS> = {
      'border.holiday': 'holiday', 'border.week': 'week', 'border.two-weeks': 'two-weeks', 'border.hotel': 'hotel', 'border.city-centre': 'city-centre',
      'border.line.next': 'passport-question', 'border.line.passport': 'passport', 'border.line.purpose': 'purpose-question', 'border.line.holiday': 'holiday',
      'border.line.how-long': 'duration-question', 'border.line.two-weeks': 'two-weeks', 'border.line.where': 'where-staying-question',
      'border.line.hotel': 'hotel-city-centre', 'border.line.declare': 'anything-to-declare', 'border.line.almost': 'almost-done',
      'border.line.nothing': 'nothing-to-declare', 'border.line.welcome': 'welcome-enjoy-stay',
    };
    for (const lang of LANGS) for (const p of stepsOf(day(lang), 'prime')) for (const w of p.words) {
      expect(mapping[w.key!], w.key).toBeTruthy();
      expect(w.image, w.key).toBe(M06_SLOTS[mapping[w.key!]!].image);
      expect(w.emoji).toBeUndefined();
    }
  });
  it('all visual game choices and accommodation cells use the exact canonical art in every language', () => {
    const mapping: Record<string, string> = {
      passport: M06_SLOTS.passport.image, phone: M06_PROPS.phone.image, suitcase: M06_PROPS.suitcase.image,
      holiday: M06_SLOTS.holiday.image, work: M06_PROPS.work.image, study: M06_PROPS.study.image,
      nothing: M06_SLOTS['nothing-to-declare'].image, declare: M06_PROPS['red-channel'].image, entry: M06_SLOTS['welcome-enjoy-stay'].image,
      'one-week': M06_SLOTS.week.image, 'two-weeks': M06_SLOTS['two-weeks'].image, 'four-weeks': M06_PROPS['four-weeks'].image,
      'hotel-centre': M06_SLOTS['hotel-city-centre'].image, 'hotel-outskirts': M06_PROPS['hotel-outskirts'].image,
      house: M06_PROPS.house.image, airport: M06_PROPS.airport.image,
    };
    for (const lang of LANGS) {
      for (const step of stepsOf(day(lang), 'visualMatch')) for (const tile of step.tiles) expect(tile.image, tile.id).toBe(mapping[tile.id]);
      for (const step of stepsOf(day(lang), 'miniMap')) for (const round of step.rounds) {
        expect(round.cells.filter((c) => c.tappable).map((c) => c.id)).toEqual(['hotel-centre', 'house', 'airport', 'hotel-outskirts']);
        for (const cell of round.cells.filter((c) => c.tappable)) expect(cell.image, cell.id).toBe(mapping[cell.id]);
      }
      expect(stepsOf(day(lang), 'matchPairs')[0]!.pairs.map((p) => p.answerImage)).toEqual(['holiday', 'two-weeks', 'hotel-city-centre', 'nothing-to-declare'].map((id) => M06_SLOTS[id as keyof typeof M06_SLOTS].image));
    }
  });
  it('the cards draw wide pictures (the Mission 05 presentation)', () => {
    for (const lang of LANGS) for (const p of stepsOf(day(lang), 'prime')) expect(p.widePictures, lang).toBe(true);
  });
});

describe('video, progress, parity and pacing', () => {
  it('the video resolves by the usual convention in every language and is replayable at every practice step; a missing one stays safe', () => {
    for (const lang of LANGS) {
      const video = missionVideo(lang, BOOTCAMP_PLAN[5]!.day);
      expect(video?.src, lang).toMatch(new RegExp(`videos/${lang}/${lang}_6\\.mp4$`));
      const d = day(lang);
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(kind === 'video' ? null : 'watch');
        expect(practiceReplay({ hasVideo: false, hasConversation: true, stepKind: kind, index: i })).toBe(i === 0 ? 'listen' : null);
      }
    }
  });
  it('the mission is plain data the existing progress handles: serialisable steps, a valid Learn / Practice split', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(JSON.parse(JSON.stringify(d))).toEqual(d);
      const p = missionPhases(d);
      expect(p.learnStart).toBeLessThan(p.practiceStart);
      expect(p.practiceStart).toBeLessThan(d.steps.length);
    }
  });
  it('same journey in EN / ES / FR; every step valid; 37 meaningful interactions (inside 34–39)', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [Boolean(r.npc), strip(r.promptItemId), r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'miniMap') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [r.correct, strip(r.itemId), r.cells])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, strip(r.itemId), r.show])];
      if (s.kind === 'customize') return [s.kind, s.label, s.base, s.options, s.rounds.map((r) => [r.on, strip(r.itemId)])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel, p.answerGloss])];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'prime') return [s.kind, s.gate, s.label, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.review, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of LANGS) {
      const d = day(lang);
      if (lang !== 'en') expect(shape(d), lang).toEqual(shape(day('en')));
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      const n = d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' || s.kind === 'customize' ? s.rounds.length
        : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : 0), 0);
      expect(n, lang).toBe(37);
    }
  });
  it('the sentences: the five learner lines and the officer\'s questions are kept (later missions reuse them); "Passport, please." is retired — the officer says "Passport?"', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = d.items.map((i) => strip(i.id));
      for (const id of [...LEARNER, 'reply.border.purpose', 'reply.border.how-long', 'reply.border.where-staying', 'reply.border.anything-declare', 'reply.border.enjoy']) expect(ids, lang).toContain(id);
      expect(ids, lang).not.toContain('reply.border.passport-please');
      expect(text(d, `${lang}.reply.border.enjoy`), lang).toBe(line(lang, 10)); // the officer's last line, whole
      expect(auditWords(JSON.stringify(d.steps)), lang).not.toContain('three'); // the old "three days / a week" swap is gone
    }
  });
});
