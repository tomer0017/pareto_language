import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { missionVideo } from '../videos/missionVideo.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M05_CONCEPTS } from './mission05Coverage.js';
import { learnedBefore, missionWalk, unpreparedChunks as auditUnpreparedChunks, unpreparedWords as auditUnpreparedWords } from './priorLearning.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import { M05_ROUTE, M05_SLOTS, M05_TOWN, type TownSpot } from './practiceV1.js';
import { validatePracticeStep } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampStep, MapCell } from './types.js';

/**
 * Mission 05 — Directions: "I am actually navigating through a foreign city." The conversation is
 * LOCKED; the learner discovers ONE town, walks it an instruction at a time, then whole, then with no
 * help — and nothing is tested before it was taught with its meaning.
 */
const LANGS = ['en', 'es', 'fr'] as const;
/** Width × height from a JPEG's start-of-frame marker. */
const jpegSize = (b: Buffer): { w: number; h: number } => {
  for (let i = 2; i < b.length;) {
    const marker = b[i + 1]!; const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error('no SOF');
};
const day = (lang: CoverageLang, n = 5): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const maps = (d: BootcampDayContent) => stepsOf(d, 'miniMap');
const afterVideo = (d: BootcampDayContent): BootcampStep[] => d.steps.slice(d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again') + 1);

const LOCKED: Record<CoverageLang, string[]> = {
  en: [
    'YOU: Excuse me! Where is the station?', 'NPC: The station? Go straight ahead, then turn left at the corner.', 'YOU: Is it far?',
    "NPC: No, it's about five minutes on foot. It's next to the bank.", 'YOU: Can you show me on the map?',
    'NPC: Of course — here, we are here, and the station is right there.', "NPC: You can't miss it. Have a good day!",
  ],
  es: [
    'YOU: ¡Perdone! ¿Dónde está la estación?', 'NPC: ¿La estación? Siga todo recto y luego gire a la izquierda en la esquina.', 'YOU: ¿Está lejos?',
    'NPC: No, está a unos cinco minutos a pie. Está al lado del banco.', 'YOU: ¿Me lo puede mostrar en el mapa?',
    'NPC: Claro — mire, estamos aquí, y la estación está justo ahí.', 'NPC: No tiene pérdida. ¡Que tenga buen día!',
  ],
  fr: [
    'YOU: Excusez-moi ! Où est la gare ?', 'NPC: La gare ? Allez tout droit, puis tournez à gauche au coin.', 'YOU: C’est loin ?',
    'NPC: Non, c’est à environ cinq minutes à pied. C’est à côté de la banque.', 'YOU: Vous pouvez me montrer sur la carte ?',
    'NPC: Bien sûr — tenez, nous sommes ici, et la gare est juste là.', 'NPC: Vous ne pouvez pas la manquer. Bonne journée !',
  ],
};
const line = (lang: CoverageLang, i: number): string => LOCKED[lang][i]!.slice(5);

describe('the conversation is locked, and Mission 05 is in its place', () => {
  for (const lang of LANGS) it(`${lang}: word for word the frozen one`, () => { expect(script(lang)).toEqual(LOCKED[lang]); });
  it('the dialogue tree is byte-for-byte what it was before this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual({ en: 'be07a2d6', es: '661d8659', fr: 'bf5a84f0' });
  });
  it('Mission 05 is "directions", fifth on the journey', () => {
    expect(BOOTCAMP_PLAN[4]!.id).toBe('directions');
    expect(missionNumber(BOOTCAMP_PLAN[4]!.day)).toBe(5);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Directions');
  });
  it('Missions 01–04 are byte-for-byte unchanged by this pass (Missions 06–30: the practice fingerprints)', () => {
    const print = (n: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l, n)))]));
    expect(print(1)).toEqual({ en: '63b23508', es: '4802a27c', fr: '4d41f68e' });
    expect(print(2)).toEqual({ en: '28382d4a', es: '202d56bb', fr: '9eab5081' });
    expect(print(3)).toEqual({ en: 'e97d7f7c', es: '8d64f857', fr: '7dcc6a5d' });
    expect(print(4)).toEqual({ en: '540b6d7c', es: 'b47c7bda', fr: 'c3eef94a' });
  });
});

describe('coverage: every meaningful chunk, no orphan', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    const GLUE: Record<CoverageLang, string[]> = { en: ['then', 'no', "it's", 'and'], es: ['y', 'luego'], fr: ['puis', 'non', 'et'] };
    for (const lang of LANGS) {
      for (const c of M05_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M05_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')).concat(GLUE[lang]));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) {
    it(`${lang}: every chunk is COVERED (3+ encounters, 2+ kinds, met outside the conversation; learner lines retrieved, 5+)`, () => {
      for (const row of coverageOf(day(lang), lang, M05_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    });
  }
  it('the encounters are the same in English, Spanish and French', () => {
    const counts = (lang: CoverageLang) => Object.fromEntries(coverageOf(day(lang), lang, M05_CONCEPTS).map((r) => [r.id, `${r.total} · m${r.byKind.meaning} l${r.byKind.listening} r${r.byKind.retrieval} c${r.byKind.context}`]));
    expect(counts('es')).toEqual(counts('en'));
    expect(counts('fr')).toEqual(counts('en'));
    expect(counts('en')).toMatchInlineSnapshot(`
      {
        "cant-miss": "3 · m1 l1 r0 c1",
        "corner": "13 · m1 l10 r0 c2",
        "excuse-me": "5 · m1 l1 r2 c1",
        "five-minutes": "7 · m1 l4 r0 c2",
        "good-day": "3 · m1 l1 r0 c1",
        "is-it-far": "5 · m1 l0 r3 c1",
        "look-here": "3 · m1 l1 r0 c1",
        "next-to-bank": "9 · m1 l6 r0 c2",
        "of-course": "3 · m1 l1 r0 c1",
        "right-there": "5 · m1 l3 r0 c1",
        "show-me-map": "5 · m1 l0 r3 c1",
        "straight": "11 · m1 l8 r0 c2",
        "the-station": "18 · m3 l11 r2 c2",
        "turn-left": "11 · m1 l8 r0 c2",
        "we-are-here": "6 · m1 l4 r0 c1",
        "where-station": "5 · m1 l1 r2 c1",
      }
    `);
  });
  it('the directions and the reactions are comprehension-first: heard and understood, never asked for as something to say', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const said = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.filter((o) => o.correct).map((o) => o.text ?? text(d, o.itemId)))), ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => text(d, r.itemId)))];
      // "The station?" is the guide echoing the traveller's own words, so it is inside "Where is the station?" — not a separate production
      for (const c of M05_CONCEPTS.filter((x) => x.role === 'hear' && x.id !== 'the-station')) {
        expect(said.some((x) => hasChunk(x, c.chunk[lang])), `${lang} ${c.id} is never produced`).toBe(false);
        expect(encounters(d, c.chunk[lang]).filter((e) => e.kind === 'listening').length, `${lang} ${c.id} is heard`).toBeGreaterThanOrEqual(1);
      }
    }
  });
  it('"You can’t miss it" and "Have a good day" are comprehension-covered: a picture card with the meaning, then heard in the listening drill', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cards = stepsOf(d, 'prime').flatMap((p) => p.words);
      for (const id of ['cant-miss', 'good-day']) {
        const c = M05_CONCEPTS.find((x) => x.id === id)!;
        expect(cards.some((w) => hasChunk(w.text, c.chunk[lang]) && w.meaning.he), `${lang} ${id} card`).toBe(true);
        expect(stepsOf(d, 'replies').some((s) => s.replyIds.some((r) => hasChunk(text(d, r), c.chunk[lang]))), `${lang} ${id} heard`).toBe(true);
      }
    }
  });
});

describe('TEACH before TEST — the strict in-order audit', () => {
  /** What the learner VERIFIABLY learned in Missions 01–04 — taught with its meaning, never merely seen (`priorLearning.ts`). */
  const prior = (lang: CoverageLang): ReadonlySet<string> => learnedBefore(lang, 5).words;
  /** The shared in-order walk (`priorLearning.ts`): taught = met with its meaning; every map round, board, builder and Quick Reply is a TEST. */
  const walk = missionWalk;
  const unpreparedWords = (d: BootcampDayContent, lang: CoverageLang): string[] => auditUnpreparedWords(d, prior(lang));
  const unpreparedChunks = (d: BootcampDayContent, lang: CoverageLang): string[] => auditUnpreparedChunks(d, lang, M05_CONCEPTS);
  for (const lang of LANGS) {
    it(`${lang}: no tested line or map label has a word not met with its meaning first (here, or in Missions 01–04)`, () => { expect(unpreparedWords(day(lang), lang)).toEqual([]); });
    it(`${lang}: no tested line has a chunk of the conversation this mission had not taught first`, () => { expect(unpreparedChunks(day(lang), lang)).toEqual([]); });
  }
  it('the audit has teeth: a planted unknown word is caught, and without the picture cards the map tests cold', () => {
    const d = day('en');
    const finale = maps(d).find((s) => s.challenge && s.rounds.length === 3)!;
    const planted: BootcampStep = { ...finale, rounds: [{ ...finale.rounds[0]!, audio: { en: 'Take the roundabout.', he: 'x' } }] };
    expect(unpreparedWords({ ...d, steps: d.steps.map((s) => (s === finale ? planted : s)) }, 'en').join(' ')).toMatch(/“roundabout”/);
    const noCards: BootcampDayContent = { ...d, steps: d.steps.filter((s) => !(s.kind === 'prime' && s.words.some((w) => w.line))) };
    expect(unpreparedChunks(noCards, 'en').length).toBeGreaterThan(10);
  });
  /** First step that TEACHES a chunk vs the first that TESTS it. */
  const order = (d: BootcampDayContent, chunk: string) => {
    const { taught, tested } = walk(d);
    return { teach: Math.min(...taught.filter((e) => hasChunk(e.text, chunk)).map((e) => e.at)), test: Math.min(...tested.filter((e) => hasChunk(e.text, chunk)).map((e) => e.at)) };
  };
  const NON_SKIPPABLE = (d: BootcampDayContent, at: number) => !(d.steps[at]!.kind === 'prime' && (d.steps[at] as { gate?: boolean }).gate);
  for (const [id, label] of [['the-station', 'station'], ['straight', 'straight'], ['turn-left', 'left'], ['corner', 'the corner'], ['is-it-far', 'is it far?'], ['five-minutes', 'five minutes on foot'], ['next-to-bank', 'next to the bank'], ['show-me-map', 'can you show me on the map?'], ['we-are-here', 'we are here'], ['right-there', 'right there']] as const) {
    it(`"${label}" is taught (in a step that cannot be skipped) before it is first tested`, () => {
      for (const lang of LANGS) {
        const d = day(lang);
        const c = M05_CONCEPTS.find((x) => x.id === id)!.chunk[lang];
        const { taught } = walk(d);
        const o = order(d, c);
        expect(Number.isFinite(o.test), `${lang} ${id} is tested`).toBe(true);
        const firstReal = Math.min(...taught.filter((e) => hasChunk(e.text, c) && NON_SKIPPABLE(d, e.at)).map((e) => e.at));
        expect(firstReal, `${lang} ${id}`).toBeLessThan(o.test);
      }
    });
  }
  it('the pieces come before the whole: straight and left and the corner are taught before the combined route is walked; here / there before the final gate', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const route = d.steps.findIndex((s) => s.kind === 'miniMap' && s.rounds.some((r) => r.audio.en === line(lang, 1)));
      for (const id of ['straight', 'turn-left', 'corner']) expect(order(d, M05_CONCEPTS.find((x) => x.id === id)!.chunk[lang]).teach, `${lang} ${id}`).toBeLessThan(route);
      const gate = d.steps.indexOf(afterVideo(d)[0]!);
      for (const id of ['we-are-here', 'right-there']) expect(order(d, M05_CONCEPTS.find((x) => x.id === id)!.chunk[lang]).teach, `${lang} ${id}`).toBeLessThan(gate);
      // the map request: taught before it is built or answered
      const ask = order(d, M05_CONCEPTS.find((x) => x.id === 'show-me-map')!.chunk[lang]);
      expect(ask.teach).toBeLessThan(d.steps.findIndex((s) => s.kind === 'sentenceBuilder'));
    }
  });
});

describe('the one town', () => {
  const LANDMARKS: TownSpot[] = ['bank', 'cafe', 'station', 'house', 'park'];
  it('every map round of the mission is drawn from the same town: the same places in the same spots', () => {
    for (const lang of LANGS) for (const s of maps(day(lang))) for (const r of s.rounds) {
      const at = (id: string): MapCell | undefined => r.cells.find((c) => c.id === id);
      for (const c of r.cells) {
        expect(Object.keys(M05_TOWN), `${lang} ${c.id}`).toContain(c.id);
        expect([c.row, c.col], `${lang} ${c.id}`).toEqual([M05_TOWN[c.id as TownSpot].row, M05_TOWN[c.id as TownSpot].col]);
      }
      for (const id of LANDMARKS) expect(at(id), `${lang} ${id} on every map`).toBeTruthy();
    }
  });
  it('the station is next to the bank — and it is the only spot a "next to the bank" round offers that touches the bank', () => {
    const d = (a: TownSpot, b: TownSpot) => Math.abs(M05_TOWN[a].row - M05_TOWN[b].row) + Math.abs(M05_TOWN[a].col - M05_TOWN[b].col);
    expect(d('station', 'bank')).toBe(1);
    for (const lang of LANGS) for (const s of maps(day(lang))) for (const r of s.rounds.filter((x) => hasChunk(x.audio.en, M05_CONCEPTS.find((c) => c.id === 'next-to-bank')!.chunk[lang]))) {
      const touching = r.cells.filter((c) => c.tappable && d(c.id as TownSpot, 'bank') === 1).map((c) => c.id);
      expect(touching, lang).toEqual(['station']);
      expect(r.correct).toBe('station');
    }
  });
  it('the route is straight to the corner, then left to the station — and every walked round follows it', () => {
    expect(M05_ROUTE).toEqual([{ from: 'start', move: 'straight', to: 'corner' }, { from: 'corner', move: 'left', to: 'station' }]);
    // left from the corner IS the station's side; straight from the start IS the corner
    expect([M05_TOWN.corner.col - M05_TOWN.start.col, M05_TOWN.corner.row - M05_TOWN.start.row]).toEqual([0, -1]);
    expect([M05_TOWN.station.col - M05_TOWN.corner.col, M05_TOWN.station.row - M05_TOWN.corner.row]).toEqual([-1, 0]);
    for (const lang of LANGS) {
      const walked = maps(day(lang)).filter((s) => s.rounds.some((r) => r.audio.en === line(lang, 1)));
      expect(walked.length, lang).toBeGreaterThanOrEqual(3); // the route game, the no-help walk, the final gate
      for (const s of walked) {
        const legs = s.rounds.filter((r) => r.audio.en === line(lang, 1));
        expect(legs.map((r) => [r.cells.find((c) => c.emoji === '🧍')!.id, r.correct]), lang).toEqual([['start', 'corner'], ['corner', 'station']]);
      }
    }
  });
  it('the walk with no help ends at the station, and so does the final gate', () => {
    for (const lang of LANGS) {
      const noHelp = maps(day(lang)).filter((s) => s.challenge).at(-1)!;
      expect(noHelp.rounds.at(-1)!.correct).toBe('station');
      const gate = afterVideo(day(lang))[0] as Extract<BootcampStep, { kind: 'miniMap' }>;
      expect(gate.kind).toBe('miniMap');
      expect(gate.rounds.map((r) => r.correct)).toEqual(['station', 'corner', 'station', 'station', 'start']);
    }
  });
  it('a place you can tap carries no word (you find it from what it is); places you cannot tap show their name', () => {
    for (const lang of LANGS) for (const s of maps(day(lang))) for (const r of s.rounds) for (const c of r.cells) {
      if (c.tappable) expect(c.label, `${lang} ${c.id}`).toBeUndefined();
      expect(`${c.label ?? ''}${c.emoji ?? ''}`).not.toMatch(/[֐-׿]/);
    }
  });
});

describe('no untaught "right", no artificial recovery, real learner lines only', () => {
  it('"right" is never taught or asked for: a street to the right is only a picture (➡️)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'prime').flatMap((p) => p.words.map((w) => w.key)), lang).not.toContain('direction.right');
      const steps = JSON.stringify(d.steps);
      expect(steps, lang).not.toMatch(/turn right|on the right|à droite|tournez à droite|derecha|ימינה/i);
      expect(d.items.map((i) => strip(i.id)), lang).not.toContain('reply.dir.right');
      expect(steps).toContain('➡️'); // the wrong way you could go is still on the map
    }
  });
  it('Quick Reply asks only for the traveller\'s own lines — and no practice answer is a recovery phrase', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
        for (const o of r.options.filter((x) => x.correct)) expect(['phrase.dir.excuse-me', 'phrase.dir.where-is', 'phrase.dir.is-it-far', 'phrase.dir.show-me-map'], lang).toContain(strip(o.itemId));
        for (const o of r.options) expect(strip(o.itemId), lang).not.toMatch(/^phrase\.recovery\./);
        if (r.npc) expect(LOCKED[lang].map((l) => l.slice(5)), lang).toContain(r.npc.en);
      }
      expect(stepsOf(d, 'ambush'), lang).toHaveLength(0);
      expect(stepsOf(d, 'quiz'), lang).toHaveLength(0);
      expect(stepsOf(d, 'swap'), lang).toHaveLength(0); // the old "How do I get to the beach?" is retired
    }
  });
  it('the builders are the traveller\'s two questions, each language cut its own way', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'sentenceBuilder')[0]!.rounds.map((r) => strip(r.itemId))).toEqual(['phrase.dir.where-is', 'phrase.dir.show-me-map']);
      for (const r of stepsOf(d, 'sentenceBuilder')[0]!.rounds) expect(r.chunks.join(' ')).toBe(text(d, r.itemId));
    }
  });
});

describe('image slots — all nineteen have their final picture: Group 1 (building blocks), Group 2 (the directions), Group 3 (the map and the goodbye)', () => {
  const SLOTS = ['station', 'straight', 'left', 'corner', 'far', 'five-minutes-on-foot', 'next-to', 'bank', 'map', 'ask-where-station', 'npc-gives-directions', 'is-it-far', 'five-minutes-walk', 'next-to-bank', 'show-me-map', 'we-are-here', 'station-right-there', 'cant-miss-it', 'good-day'];
  const GROUP1 = ['station', 'straight', 'left', 'corner', 'far', 'five-minutes-on-foot', 'next-to', 'bank', 'map'] as const;
  const GROUP2 = ['ask-where-station', 'npc-gives-directions', 'is-it-far', 'five-minutes-walk', 'next-to-bank'] as const;
  const GROUP3 = ['show-me-map', 'we-are-here', 'station-right-there', 'cant-miss-it', 'good-day'] as const;
  const PUBLIC = new URL('../../../public/', import.meta.url);
  const md5 = (id: string): string => createHash('md5').update(readFileSync(new URL(M05_SLOTS[id as keyof typeof M05_SLOTS].image!, PUBLIC))).digest('hex');
  const ALL = [...GROUP1, ...GROUP2, ...GROUP3];
  it('all nineteen slots exist and every one has its final picture (the emoji is only a fallback)', () => {
    expect(Object.keys(M05_SLOTS).sort()).toEqual([...SLOTS].sort());
    expect([...ALL].sort()).toEqual([...SLOTS].sort());
    for (const id of SLOTS) { const s = M05_SLOTS[id as keyof typeof M05_SLOTS]; expect(s.emoji, id).toBeTruthy(); expect(s.image, id).toBeTruthy(); }
  });
  it('no Mission 05 card is left emoji-only: every card carries a picture', () => {
    for (const lang of LANGS) for (const w of stepsOf(day(lang), 'prime').flatMap((p) => p.words)) { expect(w.image, `${lang} ${w.key}`).toBeTruthy(); expect(w.emoji, `${lang} ${w.key}`).toBeUndefined(); }
  });
  it('each slot is mapped to its own file — the one named for its meaning — and all nineteen are distinct files', () => {
    for (const id of ALL) expect(M05_SLOTS[id].image, id).toBe(`images/mission05/${id}.jpg`);
    expect(new Set(ALL.map((id) => M05_SLOTS[id].image)).size).toBe(19);
    expect(new Set(ALL.map(md5)).size).toBe(19); // not the same picture under two names
  });
  it('Group 2 is frozen: the five direction scenes are byte-for-byte the approved ones', () => {
    expect(Object.fromEntries(GROUP2.map((id) => [id, md5(id)]))).toEqual({
      'ask-where-station': '89d539f1ccaf2d73b39f149c08c79bf4', 'npc-gives-directions': '489fe9bff84c5b6baa80d35f75135f22', 'is-it-far': 'e75b5ab2908320b7ef94da6d35887f18',
      'five-minutes-walk': '2b71340af12bf302ceae7474c49dd5da', 'next-to-bank': '7c88286e305259af3d16fa26df6464ee',
    });
  });
  it('here is not there, and asking is not answering: the request, the current location and the destination are three different pictures', () => {
    for (const [a, b] of [['show-me-map', 'we-are-here'], ['we-are-here', 'station-right-there'], ['show-me-map', 'station-right-there'], ['map', 'show-me-map'], ['station', 'station-right-there']] as const) {
      expect(M05_SLOTS[a].image, `${a} / ${b}`).not.toBe(M05_SLOTS[b].image);
      expect(md5(a), `${a} / ${b}`).not.toBe(md5(b));
    }
  });
  it('"You can’t miss it" and "Have a good day" have their own pictures — and stay comprehension-only (no new exercise asks for them)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const [slotId, conceptId] of [['cant-miss-it', 'cant-miss'], ['good-day', 'good-day']] as const) {
        const cards = stepsOf(d, 'prime').flatMap((p) => p.words).filter((w) => w.image === M05_SLOTS[slotId].image);
        expect(cards.map((w) => w.key), `${lang} ${slotId}`).toEqual([`dir.line.${conceptId}`]);
        const chunk = M05_CONCEPTS.find((c) => c.id === conceptId)!.chunk[lang];
        const asked = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.filter((o) => o.correct).map((o) => o.text ?? text(d, o.itemId)))), ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => text(d, r.itemId)))];
        expect(asked.some((x) => hasChunk(x, chunk)), `${lang} ${slotId}`).toBe(false);
      }
    }
  });
  it('Group 1 is frozen: the nine building-block files are byte-for-byte the approved ones', () => {
    expect(Object.fromEntries(GROUP1.map((id) => [id, md5(id)]))).toEqual({
      station: 'c8faede8100f3075f950f99f768f9501', straight: 'c9d4ba9bff75af082eb941e59979ac1a', left: '8476f52a2cf71e14195edbf6b3d2f148',
      corner: '3ab8bc1979742b32df33dc2d90f7d370', far: 'aff41d34d33885f1b3dd5eb176181a04', 'five-minutes-on-foot': '6a9f0fc43786a9dde42dfe2b632ebcea',
      'next-to': 'b40027d063e666635f3f48bdb5ba175f', bank: '99e2c4db8f6b43d9dc46006c4d80cfc7', map: '239d5d74d89fd0688cea20a40c7420cc',
    });
  });
  it('a scene never stands in for its building block: the question "Is it far?", the five-minute answer and "next to the bank" each sit beside — not instead of — far, five minutes on foot, next to', () => {
    for (const [scene, block] of [['is-it-far', 'far'], ['five-minutes-walk', 'five-minutes-on-foot'], ['next-to-bank', 'next-to']] as const) {
      expect(M05_SLOTS[scene].image).not.toBe(M05_SLOTS[block].image);
      expect(md5(scene)).not.toBe(md5(block));
      for (const lang of LANGS) {
        const words = stepsOf(day(lang), 'prime').flatMap((p) => p.words);
        expect(words.some((w) => w.image === M05_SLOTS[block].image), `${lang} ${block} still shown`).toBe(true);
        expect(words.some((w) => w.image === M05_SLOTS[scene].image), `${lang} ${scene} shown`).toBe(true);
      }
    }
  });
  it('each scene picture is on the card of its own line (the traveller asking ≠ the local answering)', () => {
    const ON: Record<(typeof GROUP2)[number] | (typeof GROUP3)[number], string> = {
      'ask-where-station': 'dir.line.ask', 'npc-gives-directions': 'dir.line.directions', 'is-it-far': 'dir.line.is-it-far', 'five-minutes-walk': 'dir.line.five-minutes', 'next-to-bank': 'dir.line.next-to-bank',
      'show-me-map': 'dir.line.show-me-map', 'we-are-here': 'dir.line.we-are-here', 'station-right-there': 'dir.line.right-there', 'cant-miss-it': 'dir.line.cant-miss', 'good-day': 'dir.line.good-day',
    };
    for (const lang of LANGS) {
      const words = stepsOf(day(lang), 'prime').flatMap((p) => p.words);
      for (const id of [...GROUP2, ...GROUP3]) expect(words.filter((w) => w.image === M05_SLOTS[id].image).map((w) => w.key), `${lang} ${id}`).toEqual([ON[id]]);
    }
  });
  it('all nineteen files exist, are real JPEGs, and are wide as supplied (never squared, never upscaled)', () => {
    for (const id of [...GROUP2, ...GROUP3]) expect(jpegSize(readFileSync(new URL(M05_SLOTS[id].image!, PUBLIC))), id).toEqual({ w: 444, h: 222 }); // the supplied scenes, at their own size
    for (const id of ALL) {
      const bytes = readFileSync(new URL(M05_SLOTS[id].image!, PUBLIC));
      expect([bytes[0], bytes[1]], id).toEqual([0xff, 0xd8]);
      const { w, h } = jpegSize(bytes);
      expect(w / h, `${id} ${w}×${h}`).toBeGreaterThan(1.8); // the approved panels are ~2:1
      expect(w, id).toBeLessThanOrEqual(600); // a third of the 1808-px collage: no upscaling
    }
  });
  it('English, Spanish and French show the same picture for the same meaning', () => {
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? null]));
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    expect(pics('en').every(([, i]) => i)).toBe(true);
  });
  it('every Mission 05 card picture comes from a slot — one meaning, one slot — and the map\'s station and bank still read from the same slots', () => {
    const pictures = new Set(Object.values(M05_SLOTS).flatMap((s) => [s.emoji, s.image]));
    for (const lang of LANGS) for (const w of stepsOf(day(lang), 'prime').flatMap((p) => p.words)) expect(pictures, `${lang} ${w.key}`).toContain(w.image ?? w.emoji);
    expect([M05_TOWN.station.emoji, M05_TOWN.bank.emoji]).toEqual([M05_SLOTS.station.emoji, M05_SLOTS.bank.emoji]);
  });
  it('the pictures are shown wide (their own shape) on Mission 05\'s cards — and on no mission before it (Mission 06\'s own pass uses it too)', () => {
    for (const lang of LANGS) for (const p of stepsOf(day(lang), 'prime')) expect(p.widePictures, lang).toBe(true);
    for (const n of [1, 2, 3, 4, 10]) for (const lang of LANGS) expect(stepsOf(day(lang, n), 'prime').some((p) => p.widePictures), `M${n} ${lang}`).toBe(false);
  });
  it('the pictures changed nothing else: the town, every map round, the sentences, the conversation, every step', () => {
    expect(fnv(JSON.stringify(M05_TOWN))).toBe('e126fc30');
    const prints = Object.fromEntries(LANGS.flatMap((lang) => {
      const d = day(lang);
      const bare = d.steps.map((s) => (s.kind === 'prime' ? { ...s, widePictures: undefined, words: s.words.map((w) => ({ ...w, image: undefined, emoji: undefined })) } : s));
      return [[`${lang}.maps`, fnv(JSON.stringify(maps(d)))], [`${lang}.steps`, fnv(JSON.stringify(bare))], [`${lang}.items+dialogues`, fnv(JSON.stringify([d.items, d.dialogues]))]];
    }));
    expect(prints).toEqual({
      'en.maps': 'a3a2c006', 'en.steps': '9424439b', 'en.items+dialogues': '77df8f94',
      'es.maps': 'de7bca9f', 'es.steps': 'd24be53f', 'es.items+dialogues': '2360b09e',
      'fr.maps': '3bb93845', 'fr.steps': '1585b4fb', 'fr.items+dialogues': '7c439c11',
    });
  });
});

describe('video, progress, parity and pacing', () => {
  it('the video: English, Spanish and French each have it, by the usual file convention, and it is replayable at every practice step', () => {
    for (const lang of LANGS) {
      const video = missionVideo(lang, BOOTCAMP_PLAN[4]!.day);
      expect(video?.src, lang).toMatch(new RegExp(`videos/${lang}/${lang}_5\\.mp4$`));
      const d = day(lang);
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        // what the player is given: the resolver's answer, not a Mission 05 special case
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i }), `${lang} step ${i}`).toBe(kind === 'video' ? null : 'watch');
        // and were a video ever missing, no broken player (the rule itself; see missionReplay.test.ts for a mission without one)
        expect(practiceReplay({ hasVideo: false, hasConversation: true, stepKind: kind, index: i })).toBe(i === 0 ? 'listen' : null);
      }
    }
  });
  it('the mission is plain data the existing progress handles: serialisable steps, a valid Learn / Practice split', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(JSON.parse(JSON.stringify(d.steps))).toEqual(d.steps);
      const p = missionPhases(d);
      expect(p.learnStart).toBeLessThan(p.practiceStart);
      expect(p.practiceStart).toBeLessThan(d.steps.length);
    }
  });
  it('same journey in EN / ES / FR; every step valid; 37 quick interactions (inside 32–40)', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'miniMap') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [r.correct, strip(r.itemId), r.cells.map((c) => [c.id, c.row, c.col, c.emoji, c.tappable ?? false, Boolean(c.label)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.tiles, s.rounds.map((r) => [r.correct, strip(r.itemId)])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'prime') return [s.kind, s.gate, s.widePictures, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.meaning])];
      return s.kind;
    });
    for (const lang of LANGS) {
      const d = day(lang);
      if (lang !== 'en') expect(shape(d), lang).toEqual(shape(day('en')));
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      const n = stepsOf(d, 'quickReply').reduce((k, s) => k + s.rounds.length, 0) + stepsOf(d, 'miniMap').reduce((k, s) => k + s.rounds.length, 0)
        + stepsOf(d, 'visualMatch').reduce((k, s) => k + s.rounds.length, 0) + stepsOf(d, 'sentenceBuilder').reduce((k, s) => k + s.rounds.length, 0)
        + stepsOf(d, 'replies').reduce((k, s) => k + s.replyIds.length, 0);
      expect(n, lang).toBe(37);
    }
  });
  it('the arc: Step 0 → the town → find the places → which way → each instruction → the route → how far → next to the bank → here / there → build → the goodbye → what they say → what you say → listen & point → the whole way → conversation → no help → video → what happened → how far', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'prime' ? (s.gate ? 'prime:step0' : 'prime:cards') : s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'miniMap' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0', 'prime:cards', 'miniMap', 'prime:cards', 'miniMap', 'miniMap', 'prime:cards', 'visualMatch', 'miniMap', 'prime:cards', 'miniMap',
      'sentenceBuilder', 'prime:cards', 'replies', 'quickReply', 'miniMap:speed', 'miniMap', 'receipt', 'dialogue', 'receipt', 'miniMap:speed', 'receipt',
      'video:again', 'miniMap', 'visualMatch', 'receipt', 'summary',
    ]);
  });
});
