import { describe, expect, it } from 'vitest';
import { missionVideo } from '../videos/missionVideo.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M06_CONCEPTS } from './mission06Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import { borderChecklist, M06_ANSWER, M06_CHECKS, M06_PROFILE, M06_PROPS, M06_SLOTS } from './practiceArrival.js';
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
  it('Missions 07–30 are byte-for-byte unchanged by this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(6).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]))).toEqual({ en: '12902a18', es: '0466401b', fr: 'c5b2e73b' });
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
  it('the profile: holiday · two weeks · a hotel in the city centre · nothing to declare — and the profile card says so', () => {
    expect(M06_PROFILE).toEqual({ purpose: 'holiday', duration: 'two-weeks', stay: 'hotel-city-centre', declaration: 'nothing' });
    for (const lang of LANGS) {
      const card = day(lang).steps[1]!;
      expect(card.kind).toBe('talk');
      const body = (card as Extract<BootcampStep, { kind: 'talk' }>).body.map((b) => b.en).join(' ');
      expect(body).toMatch(/Holiday.*Two weeks.*Hotel.*city centre.*Nothing to declare/);
    }
  });
  it('every game answers from the same trip: passport handed over, holiday, the first two weeks of the month, the hotel in the centre, the green channel', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'visualMatch')) for (const r of s.rounds) {
        const tiles = s.tiles.map((t) => t.id);
        const expected = tiles.includes('entry') ? 'entry' : tiles.includes('phone') ? 'passport' : tiles.includes('work') ? 'holiday' : 'nothing';
        expect(r.correct, `${lang} ${r.audio.en}`).toBe(expected);
      }
      for (const s of stepsOf(d, 'customize')) for (const r of s.rounds) expect(r.on, lang).toEqual(['week-1', 'week-2']);
      for (const s of stepsOf(d, 'miniMap')) for (const r of s.rounds) { expect(r.correct, lang).toBe('hotel-centre'); expect(r.cells.find((c) => c.id === 'hotel-centre')).toMatchObject({ row: 1, col: 1 }); }
      expect(M06_ANSWER).toEqual({ desk: 'passport', purpose: 'holiday', stay: 'hotel-centre', declaration: 'nothing', calendar: ['week-1', 'week-2'] });
    }
  });
  it('every interview answer is the same trip: holiday, two weeks, the hotel in the city centre, nothing to declare', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'quickReply')) {
      expect(s.rounds.map((r) => strip(r.options.find((o) => o.correct)!.itemId)), lang).toEqual(LEARNER);
      for (const r of s.rounds) expect(r.options.filter((o) => o.correct), lang).toHaveLength(1);
    }
  });
  it('the questions match the trip: each officer question to what it asks for — not a translation', () => {
    for (const lang of LANGS) {
      const m = stepsOf(day(lang), 'matchPairs')[0]!;
      for (const p of m.pairs) expect(p.answerGloss, lang).toBeUndefined(); // no app-language words: the icon is the trip detail
      expect(m.pairs.map((p) => [strip(p.promptItemId), p.answerLabel])).toEqual([
        ['reply.border.purpose', '🏖️'], ['reply.border.how-long', '📅 2'], ['reply.border.where-staying', '🏨 📍'], ['reply.border.anything-declare', '🟢'],
      ]);
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
  it('each requirement is practised its own way: an object handed over, a situation, a calendar, a map, a channel', () => {
    const d = day('en');
    const firstGames = [5, 9, 13, 16, 20].map((i) => d.steps[i - 1]!.kind);
    expect(firstGames).toEqual(['visualMatch', 'visualMatch', 'customize', 'miniMap', 'visualMatch']);
    const tileSets = stepsOf(d, 'visualMatch').slice(0, 3).map((s) => s.tiles.map((t) => t.id));
    expect(tileSets).toEqual([['passport', 'phone', 'suitcase'], ['holiday', 'work', 'study'], ['nothing', 'declare']]);
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
      const five = gate.slice(0, 5) as Extract<BootcampStep, { kind: 'visualMatch' | 'customize' | 'miniMap' }>[];
      expect(five.map((s) => s.kind)).toEqual(['visualMatch', 'visualMatch', 'customize', 'miniMap', 'visualMatch']);
      expect(five.map((s) => s.label!.en)).toEqual(['Passport', 'Purpose', 'Duration', 'Stay', 'Declaration'].map((n, i) => `Border check ${i + 1}/5 — ${n}`));
      expect(five.map((s) => s.rounds[0]!.audio.en)).toEqual([0, 2, 4, 6, 8].map((i) => line(lang, i)));
      const [stamp, receipt, summary] = gate.slice(5);
      expect(stamp!.kind === 'visualMatch' && stamp.rounds[0]!.show).toEqual(['entry']);
      expect(stamp!.kind === 'visualMatch' && stamp.rounds[0]!.audio.en).toBe(line(lang, 10));
      expect(receipt!.kind === 'receipt' && receipt.text.en).toBe(`🛂 ENTRY APPROVED · ${borderChecklist(5)[1]} · Welcome!`);
      expect(summary!.kind).toBe('summary');
    }
  });
  it('the arc: profile → Step 0 → passport → purpose → duration → stay → declaration → welcome → match → by ear → interview → conversation → no help → video → final check → entry approved', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'prime' ? (s.gate ? 'prime:step0' : 'prime:cards') : s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'miniMap' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk', 'talk', 'prime:step0',
      'prime:cards', 'visualMatch', 'sentenceBuilder', 'receipt',
      'prime:cards', 'visualMatch', 'sentenceBuilder', 'receipt',
      'prime:cards', 'customize', 'receipt',
      'prime:cards', 'miniMap', 'sentenceBuilder', 'receipt',
      'prime:cards', 'visualMatch', 'receipt',
      'prime:cards', 'matchPairs', 'replies', 'quickReply', 'receipt', 'dialogue', 'receipt', 'quickReply:speed', 'receipt',
      'video:again', 'visualMatch:speed', 'visualMatch:speed', 'customize', 'miniMap:speed', 'visualMatch:speed', 'visualMatch', 'receipt', 'summary',
    ]);
  });
});

describe('image slots — ready for the final artwork, one continuous world', () => {
  const SLOTS = ['passport', 'holiday', 'week', 'two-weeks', 'hotel', 'city-centre', 'hotel-city-centre', 'nothing-to-declare', 'passport-question', 'purpose-question', 'duration-question', 'where-staying-question', 'anything-to-declare', 'almost-done', 'welcome-enjoy-stay'];
  it('the slots exist, each with a placeholder and no artwork yet', () => {
    expect(Object.keys(M06_SLOTS).sort()).toEqual([...SLOTS].sort());
    for (const s of Object.values(M06_SLOTS)) { expect(s.emoji).toBeTruthy(); expect((s as { image?: string }).image).toBeUndefined(); }
  });
  it('one meaning, one picture: no two slots share one, and no desk prop looks like a slot (the two hotels differ by place on the map, not by picture)', () => {
    const looks = Object.values(M06_SLOTS).map((s) => s.emoji);
    expect(new Set(looks).size).toBe(looks.length);
    for (const [id, p] of Object.entries(M06_PROPS)) if (id !== 'hotel-outskirts') expect(looks, id).not.toContain(p.emoji);
  });
  it('every card picture comes from a slot, the same in every language', () => {
    const pictures = new Set(Object.values(M06_SLOTS).map((s) => s.emoji));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(pictures, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
  });
  it('no game mixes artwork with emoji — the right answer must never show by its picture quality alone', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'visualMatch')) {
      const withImage = s.tiles.filter((t) => t.image).length;
      expect(withImage === 0 || withImage === s.tiles.length, `${lang} ${s.tiles.map((t) => t.id).join(',')}`).toBe(true);
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
