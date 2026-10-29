import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { missionVideo } from '../videos/missionVideo.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M07_CONCEPTS } from './mission07Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import { M07_ANSWER, M07_KNOWN_AT_START, M07_PROPS, M07_RIDE, M07_SLOTS, M07_STAGES, rideDashboard } from './practiceArrival.js';
import { spokenRate, validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, missionWalk, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { BootcampDayContent, BootcampStep, MatchTile } from './types.js';

/**
 * Mission 07 — Taxi / Uber: "I can handle a taxi ride even if the driver speaks too fast." The
 * conversation is LOCKED; the learner takes ONE ride (this address in the centre · about €15 · a lot
 * of traffic · stop at the address · keep the change), and its key moment is a REAL recovery: the
 * driver's answer comes fast, the learner asks him to slow down, and the same meaning comes again,
 * slowly — and is understood.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const day = (lang: CoverageLang, n = 7): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M07_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const NON_SKIPPABLE = (d: BootcampDayContent, at: number): boolean => !(d.steps[at]!.kind === 'prime' && (d.steps[at] as { gate?: boolean }).gate);

const LOCKED: Record<CoverageLang, string[]> = {
  en: [
    'NPC: Hello! Where to?', 'YOU: To this address, please.', 'NPC: Got it. No problem — off we go!', 'YOU: How much to the centre?',
    "NPC: It's about fifteen euros. There's a lot of traffic right now.", 'YOU: Sorry, please speak slowly.', "NPC: Sure. About fifteen euros. There's a lot of traffic.",
    'YOU: Okay, thank you.', 'NPC: …We are almost there. Is here okay?', 'YOU: Stop here, please. Keep the change.', 'NPC: Thank you very much! Enjoy your trip!',
  ],
  es: [
    'NPC: ¡Hola! ¿A dónde va?', 'YOU: A esta dirección, por favor.', 'NPC: De acuerdo. Sin problema — ¡vamos!', 'YOU: ¿Cuánto cuesta al centro?',
    'NPC: Son unos quince euros. Hay mucho tráfico ahora mismo.', 'YOU: Perdone, más despacio, por favor.', 'NPC: Claro. Unos quince euros. Hay mucho tráfico.',
    'YOU: De acuerdo, gracias.', 'NPC: …Ya casi llegamos. ¿Aquí está bien?', 'YOU: Pare aquí, por favor. Quédese con el cambio.', 'NPC: ¡Muchas gracias! ¡Buen viaje!',
  ],
  fr: [
    'NPC: Bonjour ! Où allez-vous ?', 'YOU: À cette adresse, s’il vous plaît.', 'NPC: D’accord. Pas de problème — on y va !', 'YOU: C’est combien pour le centre ?',
    'NPC: C’est environ quinze euros. Il y a beaucoup de circulation en ce moment.', 'YOU: Pardon, parlez lentement, s’il vous plaît.', 'NPC: Bien sûr. Environ quinze euros. Il y a beaucoup de circulation.',
    'YOU: D’accord, merci.', 'NPC: …On est presque arrivés. Ici, ça va ?', 'YOU: Arrêtez-vous ici, s’il vous plaît. Gardez la monnaie.', 'NPC: Merci beaucoup ! Bon voyage !',
  ],
};
const line = (lang: CoverageLang, i: number): string => LOCKED[lang][i]!.slice(5);
const FAST = (lang: CoverageLang): string => line(lang, 4);
const SLOW = (lang: CoverageLang): string => line(lang, 6);
/** The traveller's six lines, in the order of the ride. */
const LEARNER = ['phrase.taxi.to-address', 'phrase.taxi.how-much', 'phrase.taxi.speak-slowly', 'phrase.taxi.okay-thanks', 'phrase.taxi.stop-here', 'phrase.taxi.keep-change'];
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
const accepted = (r: QR['rounds'][number]): string => strip(r.options.find((o) => o.correct)!.itemId);
/** The supported ride: the Quick Replies between the listening drill and the conversation (one ride, three steps). */
const supportedRide = (d: BootcampDayContent): QR[] => d.steps.slice(d.steps.findIndex((s) => s.kind === 'replies'), d.steps.findIndex((s) => s.kind === 'dialogue')).filter((s): s is QR => s.kind === 'quickReply');

describe('the conversation is locked, and Mission 07 is in its place', () => {
  for (const lang of LANGS) it(`${lang}: word for word the frozen one`, () => { expect(script(lang)).toEqual(LOCKED[lang]); });
  it('the dialogue tree (with its side-branches and its fast / slow beats) is byte-for-byte what it was before this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual({ en: '6db67789', es: 'd6dc6d81', fr: '2f17ed64' });
    for (const lang of LANGS) {
      const nodes = day(lang).dialogues['taxi-ride']!.nodes;
      expect(nodes.find((n) => n.id === 'n3')).toMatchObject({ fast: true, en: FAST(lang) });
      expect(nodes.find((n) => n.id === 'r3')).toMatchObject({ slow: true, en: SLOW(lang) });
    }
  });
  it('Mission 07 is "Taxi / Uber", seventh on the journey', () => {
    expect(BOOTCAMP_PLAN[6]!.id).toBe('taxi');
    expect(missionNumber(BOOTCAMP_PLAN[6]!.day)).toBe(7);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Taxi / Uber');
  });
  it('Missions 01–06 are byte-for-byte unchanged by this pass', () => {
    const print = (n: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l, n)))]));
    expect(print(1)).toEqual({ en: '63b23508', es: '4802a27c', fr: '4d41f68e' });
    expect(print(2)).toEqual({ en: '28382d4a', es: '202d56bb', fr: '9eab5081' });
    expect(print(3)).toEqual({ en: 'e97d7f7c', es: '8d64f857', fr: '7dcc6a5d' });
    expect(print(4)).toEqual({ en: '540b6d7c', es: 'b47c7bda', fr: 'c3eef94a' });
    expect(print(5)).toEqual({ en: '50fa4cd1', es: '8d7d290d', fr: 'e539a4f6' });
    expect(print(6)).toEqual({ en: 'b5a24654', es: '658aff48', fr: '63405a6a' }); // since Mission 06's real-phone UX patch (its own pass; dialogue + sentences unchanged)
  });
  it('Missions 08–30 are byte-for-byte unchanged by this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(8).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]))).toEqual({ en: '4e06a0e6', es: 'f4d9682d', fr: 'e59888bd' }); // Missions 09–30 (Mission 08 has its own pass since)
  });
});

describe('coverage: every meaningful chunk, no orphan', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    const GLUE: Record<CoverageLang, string[]> = { en: ["it's"], es: ['son'], fr: ["c'est"] };
    for (const lang of LANGS) {
      for (const c of M07_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M07_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')).concat(GLUE[lang]));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) {
    it(`${lang}: every chunk is COVERED (3+ encounters, 2+ kinds, meaning shown; driver lines heard-and-understood; learner lines retrieved, 5+)`, () => {
      for (const row of coverageOf(day(lang), lang, M07_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    });
  }
  it('coverage parity: the same chunks covered in English, Spanish and French, met the same ways', () => {
    // (Spanish and French open "Okay, thank you" with the same word as "Got it" — De acuerdo / D’accord —
    // so that one chunk is simply met more often there; it is compared by kind, not by count.)
    const kinds = (lang: CoverageLang) => Object.fromEntries(coverageOf(day(lang), lang, M07_CONCEPTS).map((r) => [r.id, r.id === 'got-it' ? [r.covered] : [r.covered, r.byKind.meaning, r.byKind.listening, r.byKind.retrieval, r.byKind.context]]));
    expect(kinds('es')).toEqual(kinds('en'));
    expect(kinds('fr')).toEqual(kinds('en'));
  });
});

describe('TEACH before TEST — strict, against VERIFIED prior learning', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 7);
  for (const lang of LANGS) {
    it(`${lang}: no tested line, option or label has a word not taught first here or verifiably learned in Missions 01–06`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words)).toEqual([]);
    });
    it(`${lang}: no tested line has a chunk of this conversation that the mission had not taught first`, () => {
      expect(unpreparedChunks(day(lang), lang, M07_CONCEPTS)).toEqual([]);
    });
  }
  it('prior knowledge is the verified kind, from Missions 01–06 — what Mission 07 reuses is there and reactivated; the ride\'s own language is not', () => {
    for (const lang of LANGS) {
      expect(prior(lang).missions).toEqual([1, 2, 3, 4, 5, 6]);
      for (const c of [['thank you', 'gracias', 'merci'], ['centre', 'centro', 'centre'], ['how much', 'cuánto', 'combien']]) expect(prior(lang).knowsChunk(c[LANGS.indexOf(lang)]!), `${lang} ${c[0]}`).toBe(true);
      for (const id of ['this-address', 'fifteen-euros', 'traffic', 'stop-here', 'keep-change', 'off-we-go', 'enjoy-trip']) expect(prior(lang).knowsChunk(chunk(id, lang)), `${lang} ${id}`).toBe(false);
    }
    // Reactivated, not new: what Missions 01–06 verifiably taught of this conversation (the recovery
    // line's "please speak slowly" among it — Mission 07 still teaches the whole line on its card).
    expect(Object.fromEntries(LANGS.map((lang) => [lang, M07_CONCEPTS.filter((c) => prior(lang).knowsChunk(c.chunk[lang])).map((c) => c.id)]))).toEqual({
      en: ['no-problem', 'sorry', 'speak-slowly', 'sure'], es: ['hello', 'sorry', 'speak-slowly', 'sure'], fr: ['hello', 'no-problem', 'speak-slowly', 'sure'],
    });
    // "fifteen" was only ever TESTED (Mission 02's price boards) — never taught: so Mission 07 teaches the fare itself.
    for (const [lang, w] of [['en', 'fifteen'], ['es', 'quince'], ['fr', 'quinze']] as const) expect(prior(lang).words.has(w), `${lang} ${w}`).toBe(false);
  });
  it('the audit has teeth: a planted taxi word is caught — and putting it into an earlier conversation does not make it learned', () => {
    const d = day('en');
    const at = d.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge);
    const qr = d.steps[at] as QR;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, i) => (i === at ? { ...qr, rounds: [{ ...qr.rounds[0]!, npc: { en: 'Fasten your seatbelt.', he: 'x' } }] } : s)) };
    expect(unpreparedWords(planted, prior('en').words).join(' ')).toMatch(/“seatbelt”/);
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 6) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} Fasten your seatbelt.` } : x)) } } };
    };
    expect(JSON.stringify(seen('en', 6).dialogues)).toContain('seatbelt');
    expect(learnedBefore('en', 7, seen).words.has('seatbelt')).toBe(false);
    expect(unpreparedWords(planted, learnedBefore('en', 7, seen).words).join(' ')).toMatch(/“seatbelt”/);
  });
  it('the audit has teeth: without the card that teaches the recovery line, its retrieval tests it cold', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const noRecoveryCard: BootcampDayContent = { ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== 'taxi.line.sorry') } : s)) };
      expect(unpreparedChunks(noRecoveryCard, lang, M07_CONCEPTS).join(' '), lang).toMatch(/speak-slowly/);
      expect(unpreparedChunks(d, lang, M07_CONCEPTS), lang).toEqual([]);
    }
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
    ['where-to', '"Where to?", before the address hand-off'], ['this-address', 'the address line, before it is built'], ['how-much-centre', 'the fare question, before it is built'],
    ['fifteen-euros', '€15, before the meter'], ['traffic', 'the traffic, before the road'], ['speak-slowly', 'the recovery line, before it is built or answered'],
    ['sure', 'the slow repeat, before it is listened for'], ['almost-there', '"almost there", before the stop'], ['stop-here', '"Stop here", before it is retrieved'],
    ['keep-change', '"Keep the change", before the payment'],
  ] as const) {
    it(`TEACH → TEST: ${what}`, () => {
      for (const lang of LANGS) {
        const o = order(day(lang), chunk(id, lang));
        expect(Number.isFinite(o.test), `${lang} ${id} is tested`).toBe(true);
        expect(o.teach, `${lang} ${id}`).toBeLessThan(o.test);
      }
    });
  }
  it('the goodbye and "off we go" are comprehension: a card with the meaning, then heard — never asked for', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cards = stepsOf(d, 'prime').filter((p) => !p.gate).flatMap((p) => p.words);
      for (const id of ['got-it', 'no-problem', 'off-we-go', 'thank-you-very-much', 'enjoy-trip']) {
        expect(cards.some((w) => hasChunk(w.text, chunk(id, lang)) && w.meaning.he), `${lang} ${id} card`).toBe(true);
        expect(encounters(d, chunk(id, lang)).filter((e) => e.kind === 'listening').length, `${lang} ${id} heard`).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('THE RECOVERY — fast, then "please speak slowly", then slowly', () => {
  /** Every place the learner answers the driver's FAST line. */
  const fastRounds = (lang: CoverageLang) => stepsOf(day(lang), 'quickReply').flatMap((s) => s.rounds).filter((r) => r.npc?.en === FAST(lang));
  it('the fast line is played FAST and the repeat SLOWLY — at the conversation\'s own rates', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const lines = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map((r) => r.npc)), ...stepsOf(d, 'visualMatch').flatMap((s) => s.rounds.map((r) => r.audio))].filter(Boolean);
      for (const l of lines) {
        if (l!.en === FAST(lang)) expect(l!.pace, `${lang} fast`).toBe('fast');
        if (l!.en === SLOW(lang)) expect(l!.pace, `${lang} slow`).toBe('slow');
        if (l!.en !== FAST(lang) && l!.en !== SLOW(lang)) expect(l!.pace, `${lang} ${l!.en}`).toBeUndefined();
      }
      expect(lines.filter((l) => l!.pace === 'fast').length, lang).toBeGreaterThanOrEqual(5);
      expect(lines.filter((l) => l!.pace === 'slow').length, lang).toBeGreaterThanOrEqual(5);
    }
    // the same rates as the conversation's own fast / slow lines (Bootcamp.tsx: 1.08 / 0.75) — the slow repeat is clearly slower
    expect([spokenRate({ en: 'x', he: '', pace: 'fast' }), spokenRate({ en: 'x', he: '', pace: 'slow' }), spokenRate({ en: 'x', he: '' }, true), spokenRate({ en: 'x', he: '' })]).toEqual([1.08, 0.75, 1.12, undefined]);
    expect(readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8')).toMatch(/node\.fast \? 1\.08 : node\.slow \? 0\.75/);
  });
  it('"please speak slowly" is the answer to the fast line — and to nothing else', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
        const isFast = r.npc?.en === FAST(lang);
        expect(accepted(r) === 'phrase.taxi.speak-slowly', `${lang} ${r.npc?.en ?? r.situation?.en}`).toBe(isFast);
      }
      expect(fastRounds(lang).length, lang).toBe(4); // the recovery moment, the supported ride, the ride with no help, the final ride
    }
  });
  it('in every ride, the fast line comes first, then the recovery, then the slow repeat — never everything slow', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      // the teaching sequence: fast listen → recovery → slow listen
      const fastListen = d.steps.findIndex((s) => s.kind === 'visualMatch' && s.rounds.some((r) => r.audio.pace === 'fast'));
      const recovery = d.steps.findIndex((s) => s.kind === 'quickReply' && s.rounds.some((r) => r.npc?.en === FAST(lang)));
      const slowListen = d.steps.findIndex((s) => s.kind === 'visualMatch' && s.rounds.some((r) => r.audio.pace === 'slow'));
      expect([fastListen < recovery, recovery < slowListen], lang).toEqual([true, true]);
      // the supported ride (three steps, one ride) and the ride with no help: …fast → speak slowly → slow → okay, thank you…
      for (const rounds of [supportedRide(d).flatMap((x) => x.rounds), stepsOf(d, 'quickReply').find((x) => x.challenge)!.rounds]) {
        const i = rounds.findIndex((r) => r.npc?.en === FAST(lang));
        expect([rounds[i]!.npc!.pace, accepted(rounds[i]!), rounds[i + 1]!.npc?.en, rounds[i + 1]!.npc?.pace, accepted(rounds[i + 1]!)], lang)
          .toEqual(['fast', 'phrase.taxi.speak-slowly', SLOW(lang), 'slow', 'phrase.taxi.okay-thanks']);
      }
      // the final ride: the fast line answered, then the slow repeat listened for
      const gate = d.steps.slice(videoAt(d) + 1);
      const fq = gate.findIndex((s) => s.kind === 'quickReply' && s.rounds.some((r) => r.npc?.en === FAST(lang)));
      const sv = gate.findIndex((s) => s.kind === 'visualMatch' && s.rounds.every((r) => r.audio.en === SLOW(lang) && r.audio.pace === 'slow'));
      expect(fq >= 0 && sv === fq + 1, lang).toBe(true);
    }
  });
  it('the slow repeat keeps the meaning — €15 and the traffic — and is understood the same way as the fast line', () => {
    for (const lang of LANGS) {
      for (const id of ['fifteen-euros', 'traffic']) { expect(hasChunk(FAST(lang), chunk(id, lang)), `${lang} fast ${id}`).toBe(true); expect(hasChunk(SLOW(lang), chunk(id, lang)), `${lang} slow ${id}`).toBe(true); }
      const answers = (pace: 'fast' | 'slow') => stepsOf(day(lang), 'visualMatch').flatMap((s) => s.rounds.filter((r) => r.audio.pace === pace).map((r) => r.correct));
      expect(answers('fast'), lang).toEqual(['e15', 'jam']);
      expect(answers('slow'), lang).toEqual(['e15', 'jam', 'e15', 'jam']);
    }
  });
  it('the success is said: ✓ €15 · ✓ traffic — asking him to slow down worked', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const after = d.steps.slice(d.steps.findIndex((s) => s.kind === 'visualMatch' && s.rounds.some((r) => r.audio.pace === 'slow')) + 1)[0]!;
      expect(after.kind === 'receipt' && after.text.en).toMatch(/✓ €15 understood · ✓ traffic understood — you asked him to slow down, and it worked/);
    }
  });
  it('no artificial recovery: no help-tool phrase in practice, no "Can you repeat?" / "I don\'t understand"', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(strip(o.itemId), lang).not.toMatch(/^phrase\.recovery\./);
      expect(JSON.stringify(d.steps), lang).not.toMatch(/repeat that|don't understand|Répétez|Je ne comprends|Puede repetir|No entiendo|recovery\.(repeat|dont-understand)/i);
      expect(stepsOf(d, 'ambush').length + stepsOf(d, 'quiz').length + stepsOf(d, 'swap').length, lang).toBe(0);
    }
  });
});

describe('mission-local: only this ride\'s language', () => {
  /** Everything the conversation says, on any branch (the locked tree, side-branches included). */
  const said = (d: BootcampDayContent): string[] => Object.values(d.dialogues).flatMap((dl) => dl.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)])).filter(Boolean);
  const justified = (d: BootcampDayContent, lang: CoverageLang, t: string): boolean => said(d).some((l) => hasChunk(l, t)) || learnedBefore(lang, 7).knowsChunk(t);
  it('every sentence of the mission is a line (or a piece of a line) of its own conversation', () => {
    for (const lang of LANGS) { const d = day(lang); for (const i of d.items) expect(said(d).some((l) => hasChunk(l, i.text)), `${lang} ${i.id} “${i.text}”`).toBe(true); }
  });
  it('everything taught, played or asked for comes from this conversation — or is verified prior learning being reactivated', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const shown = [
        ...stepsOf(d, 'prime').flatMap((p) => p.words.map((w) => w.text)),
        ...stepsOf(d, 'replies').flatMap((s) => s.replyIds.map((id) => text(d, id))),
        ...stepsOf(d, 'visualMatch').flatMap((s) => s.rounds.map((r) => r.audio.en)),
        ...stepsOf(d, 'miniMap').flatMap((s) => s.rounds.map((r) => r.audio.en)),
        ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => [r.npc?.en ?? text(d, r.promptItemId), ...r.options.map((o) => o.text ?? text(d, o.itemId))])),
        ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => r.chunks.join(' '))),
        ...stepsOf(d, 'matchPairs').flatMap((s) => s.pairs.flatMap((p) => [text(d, p.promptItemId), text(d, p.answerItemId)])),
      ].filter(Boolean);
      for (const t of shown) expect(justified(d, lang, t), `${lang} “${t}”`).toBe(true);
    }
  });
});

describe('who says what', () => {
  const produced = (d: BootcampDayContent): string[] => [
    ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map(accepted)),
    ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId))),
  ];
  it('the learner produces only the traveller\'s six lines; builders for the three that gain from it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(new Set(produced(d))).toEqual(new Set(LEARNER));
      expect(stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId)))).toEqual(['phrase.taxi.to-address', 'phrase.taxi.how-much', 'phrase.taxi.speak-slowly']);
      for (const s of stepsOf(d, 'sentenceBuilder')) for (const r of s.rounds) expect(r.chunks.join(' '), lang).toBe(text(d, r.itemId));
      // the learner lines are the conversation's own words
      for (const [id, i] of [['phrase.taxi.to-address', 1], ['phrase.taxi.how-much', 3], ['phrase.taxi.speak-slowly', 5], ['phrase.taxi.okay-thanks', 7]] as const) expect(text(d, `${lang}.${id}`), lang).toBe(line(lang, i));
    }
  });
  it('the driver\'s lines are understood, never produced', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const said = produced(d).map((id) => text(d, `${lang}.${id}`));
      for (const c of M07_CONCEPTS.filter((x) => x.role === 'hear' && x.id !== 'got-it')) expect(said.some((s) => hasChunk(s, c.chunk[lang])), `${lang} ${c.id}`).toBe(false);
    }
  });
  it('wrong answers are the traveller\'s own taught lines, or pictures / figures never named in the learning language', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(LEARNER, lang).toContain(strip(o.itemId));
      for (const s of stepsOf(d, 'visualMatch')) for (const t of s.tiles) if (t.label) expect(t.label, `${lang} ${t.id}`).toMatch(/^€\d+$/);
      for (const s of stepsOf(d, 'miniMap')) for (const r of s.rounds) for (const c of r.cells) expect(c.label, `${lang} ${c.id}`).toBeUndefined();
      for (const s of stepsOf(d, 'visualMatch')) for (const t of s.tiles) if (t.caption) expect(t.caption.he).toMatch(/[֐-׿]/);
    }
  });
});

describe('ONE ride: the facts never change', () => {
  it('the SIMULATION keeps one fixed ride — this address · about €15 · heavy traffic · stop at the address · €20 paid, €5 kept — but the LEARNER starts knowing only the destination', () => {
    expect(M07_RIDE).toEqual({ destination: 'this-address', fare: 15, traffic: 'heavy', stop: 'at-the-address', paid: 20, change: 5 });
    expect(M07_KNOWN_AT_START).toEqual(['destination']);
  });
  it('every game answers from the same ride: the address, €15, the jammed road, your stop, the change kept', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'visualMatch')) for (const r of s.rounds) {
        const shown = r.show ?? s.tiles.map((t) => t.id);
        const expected = shown.includes('suitcase') ? 'address' : shown.includes('e50') ? 'e15' : shown.includes('clear') ? 'jam' : 'keep';
        expect(r.correct, `${lang} ${r.audio.en}`).toBe(expected);
      }
      for (const s of stepsOf(d, 'miniMap')) for (const r of s.rounds) expect(r.correct, lang).toBe(r.cells.some((c) => c.id === 'jam') ? 'jam' : 'here');
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) if (r.situation) { expect(r.situation.en).toMatch(/€15.*€20.*€5/); expect(accepted(r)).toBe('phrase.taxi.keep-change'); }
      expect(M07_ANSWER).toEqual({ handoff: 'address', fare: 'e15', road: 'jam', stop: 'here', payment: 'keep' });
    }
  });
});

describe('THE BRIEFING — only what the traveller really knows', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('you are in a taxi, and your goal is this address in the city centre — shown as the destination', () => {
    for (const lang of LANGS) {
      const b = briefing(lang);
      expect(b.kind).toBe('talk');
      expect(b.body[0]!.he).toBe('נכנסת למונית. המטרה שלך: להגיע לכתובת הזאת במרכז העיר.');
      expect(b.body[0]!.en).toMatch(/got into a taxi.*this address in the city centre/);
      expect(b.facts!.map((f) => [f.icon, f.label.en, f.value.en])).toEqual([['📱', 'Destination', 'The address on your phone — in the city centre']]);
      expect(b.cta).toEqual({ he: 'התחל נסיעה', en: 'Start the ride' });
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1); // one briefing; no "your ride" summary card
    }
  });
  it('it does NOT give the ride away: no €15, no heavy traffic, no €20, no €5, no "keep the change" — before the driver says them', () => {
    for (const lang of LANGS) {
      const all = JSON.stringify(briefing(lang));
      expect(all, lang).not.toMatch(/€15|~€15|fifteen|€20|€5\b|keep the change|keeps the change|a lot of traffic|heavy traffic|פקקים|העודף|עשר/i);
    }
  });
  it('the dashboard starts with only the destination: the fare and the traffic are unknown ("?"), arrival and payment not yet', () => {
    expect(rideDashboard(1)[1]).toBe('🚕 📍 Destination ✅ · 💶 Fare ? · 🚦 Traffic ? · 🏁 Arrival ⬜ · 🤝 Payment ⬜');
    expect(rideDashboard(1)[0]).toBe('🚕 📍 יעד ✅ · 💶 מחיר ? · 🚦 תנועה ? · 🏁 הגעה ⬜ · 🤝 תשלום ⬜');
    for (const lang of LANGS) expect(briefing(lang).body.map((x) => x.en)).toContain(rideDashboard(1)[1]);
  });
  it('the fare and the traffic are met FIRST in the driver\'s own words — no screen before the fare card mentions €15, none before the traffic card mentions the traffic', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const firstWith = (re: RegExp) => d.steps.findIndex((x) => re.test(JSON.stringify(x)));
      const fareCard = d.steps.findIndex((x) => x.kind === 'prime' && x.words.some((w) => w.key === 'taxi.line.fifteen'));
      const trafficCard = d.steps.findIndex((x) => x.kind === 'prime' && x.words.some((w) => w.key === 'taxi.line.traffic'));
      expect(firstWith(/€15|fifteen|quince|quinze/), lang).toBe(fareCard);
      expect(firstWith(/a lot of traffic|mucho tráfico|beaucoup de circulation|פקקים/), lang).toBe(trafficCard);
      // and the optional Step 0 no longer pre-teaches them
      const step0 = stepsOf(d, 'prime').find((p) => p.gate)!;
      expect(step0.words.map((w) => w.key)).toEqual(['taxi.address', 'taxi.stop', 'taxi.change']);
    }
  });
});

describe('THE DRIVER SAYS THIS → YOU SAY THIS — conversation, not icons', () => {
  const pairs = (lang: CoverageLang) => stepsOf(day(lang), 'matchPairs')[0]!.pairs;
  it('each driver line that wants an answer, to the traveller\'s real reply — in each language\'s exact words', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(pairs(lang).map((p) => [strip(p.promptItemId), strip(p.answerItemId)])).toEqual([
        ['reply.taxi.where-to', 'phrase.taxi.to-address'], ['reply.taxi.fast-answer', 'phrase.taxi.speak-slowly'],
        ['reply.taxi.slow-repeat', 'phrase.taxi.okay-thanks'], ['reply.taxi.almost-there', 'phrase.taxi.stop-here'],
      ]);
      // the driver's lines as the conversation says them (Where to? is the question inside "Hello! Where to?")…
      expect(pairs(lang).map((p) => text(d, p.promptItemId))).toEqual([chunk('where-to', lang), FAST(lang), SLOW(lang), line(lang, 8)]);
      // …and the traveller's replies as the conversation says them — the stop is the whole locked answer
      expect(pairs(lang).map((p) => p.answerText ?? text(d, p.answerItemId))).toEqual([line(lang, 1), line(lang, 5), line(lang, 7), line(lang, 9)]);
    }
  });
  it('the recovery pair is there: the FAST line → "please speak slowly", the SLOW repeat → "okay, thank you"', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const byPrompt = Object.fromEntries(pairs(lang).map((p) => [text(d, p.promptItemId), strip(p.answerItemId)]));
      expect(byPrompt[FAST(lang)]).toBe('phrase.taxi.speak-slowly');
      expect(byPrompt[SLOW(lang)]).toBe('phrase.taxi.okay-thanks');
    }
  });
  it('the answer is a SENTENCE — no icon, no Hebrew translation; a picture, once there is artwork, is support only', () => {
    for (const lang of LANGS) for (const p of pairs(lang)) {
      expect([p.answerLabel, p.answerGloss], lang).toEqual([undefined, undefined]);
      expect(p.answerText ?? text(day(lang), p.answerItemId), lang).not.toMatch(/[֐-׿]/);
      // the picture slot is the reply's own (address · recovery request · okay · stop) — all placeholders today, so none shown
      expect(p.answerImage, lang).toBeUndefined();
    }
    expect([M07_SLOTS['give-address'], M07_SLOTS['recovery-request'], M07_SLOTS['okay-thanks'], M07_SLOTS['stop-scene']].every((x) => !x.image)).toBe(true);
  });
  it('no forced pair: "Got it… off we go!" and the goodbye want no answer, so they are not matched', () => {
    for (const lang of LANGS) expect(pairs(lang).map((p) => strip(p.promptItemId))).not.toContain('reply.taxi.off-we-go');
    for (const lang of LANGS) expect(pairs(lang).map((p) => strip(p.promptItemId))).not.toContain('reply.taxi.goodbye');
  });
});

describe('the ride, as a journey', () => {
  it('the dashboard REVEALS the ride as it happens: the fare once understood, then the traffic, then arrival, then payment', () => {
    expect(M07_STAGES).toEqual(['destination', 'fare', 'traffic', 'arrival', 'payment']);
    expect([2, 3, 4, 5].map((n) => rideDashboard(n)[1])).toEqual([
      '🚕 📍 Destination ✅ · 💶 ~€15 ✅ · 🚦 Traffic ? · 🏁 Arrival ⬜ · 🤝 Payment ⬜',
      '🚕 📍 Destination ✅ · 💶 ~€15 ✅ · 🚦 Traffic ✅ · 🏁 Arrival ⬜ · 🤝 Payment ⬜',
      '🚕 📍 Destination ✅ · 💶 ~€15 ✅ · 🚦 Traffic ✅ · 🏁 Arrival ✅ · 🤝 Payment ⬜',
      '🚕 📍 Destination ✅ · 💶 ~€15 ✅ · 🚦 Traffic ✅ · 🏁 Arrival ✅ · 🤝 Payment ✅',
    ]);
    for (const lang of LANGS) {
      const d = day(lang);
      const at = (n: number) => d.steps.findIndex((s) => s.kind === 'receipt' && (s.text.en ?? '').endsWith(rideDashboard(n)[1]));
      // each state appears only AFTER its stage was played: the meter, the slow repeat understood, the stop, the payment
      const meter = d.steps.findIndex((s) => s.kind === 'visualMatch' && s.tiles.some((t) => t.id === 'e50'));
      const slow = d.steps.findIndex((s) => s.kind === 'visualMatch' && s.rounds.some((r) => r.audio.pace === 'slow'));
      const stop = d.steps.findIndex((s) => s.kind === 'miniMap' && s.rounds.some((r) => r.correct === 'here'));
      const pay = d.steps.findIndex((s) => s.kind === 'visualMatch' && s.tiles.some((t) => t.id === 'keep'));
      expect([at(1) < meter, meter < at(2), slow < at(3), stop < at(4), pay < at(5)], lang).toEqual([true, true, true, true, true]);
      // nothing before the fare stage says "~€15" on any dashboard
      expect(d.steps.slice(0, meter).some((s) => JSON.stringify(s).includes('~€15')), lang).toBe(false);
    }
  });
  it('each stage is practised its own way: an address handed over, a meter, a road, a fast line and a slow one, a street, a payment', () => {
    const d = day('en');
    const games = d.steps.slice(0, d.steps.findIndex((s) => s.kind === 'matchPairs')).filter((s) => s.kind === 'visualMatch' || s.kind === 'miniMap' || s.kind === 'quickReply');
    expect(games.map((s) => s.kind)).toEqual(['visualMatch', 'visualMatch', 'miniMap', 'visualMatch', 'quickReply', 'visualMatch', 'miniMap', 'visualMatch']);
    expect(stepsOf(d, 'visualMatch').slice(0, 2).map((s) => s.tiles.map((t) => t.id))).toEqual([['address', 'suitcase', 'map'], ['e5', 'e15', 'e50']]);
  });
  it('the supported ride: every moment in order — and its dashboard reveals the ride as it goes (the fare and traffic only after the driver has said them)', () => {
    for (const lang of LANGS) {
      const ride = supportedRide(day(lang));
      expect(ride.map((s) => s.label!.en)).toEqual([rideDashboard(1)[1], rideDashboard(1)[1], rideDashboard(3)[1]]);
      const rounds = ride.flatMap((s) => s.rounds);
      expect(rounds.map((r) => r.npc?.en ?? 'payment')).toEqual([line(lang, 0), line(lang, 2), FAST(lang), SLOW(lang), line(lang, 8), 'payment']);
      expect(rounds.map(accepted)).toEqual(LEARNER);
      // the step that plays the driver's fare does not show it in its heading
      expect(ride[1]!.label!.en).not.toMatch(/€15/);
    }
  });
  it('the ride with no help: the driver\'s real lines in order, after the conversation, no dashboard — ending as the conversation ends', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const s = stepsOf(d, 'quickReply').find((x) => x.challenge)!;
      expect(s.label).toBeUndefined();
      expect(s.rounds.map((r) => r.npc?.en)).toEqual([0, 2, 4, 6, 8].map((i) => line(lang, i)));
      expect(s.rounds.map(accepted)).toEqual(['phrase.taxi.to-address', 'phrase.taxi.how-much', 'phrase.taxi.speak-slowly', 'phrase.taxi.okay-thanks', 'phrase.taxi.stop-here']);
      expect(s.rounds[4]!.options.find((o) => o.correct)!.text).toBe(line(lang, 9)); // "Stop here, please. Keep the change."
      expect(d.steps.indexOf(s)).toBeGreaterThan(d.steps.findIndex((x) => x.kind === 'dialogue'));
    }
  });
  it('the final ride (after the video): destination → fare → too fast → slower → arrival → payment — then RIDE COMPLETE', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const gate = d.steps.slice(videoAt(d) + 1);
      const five = gate.slice(0, 5) as Extract<BootcampStep, { kind: 'visualMatch' | 'quickReply' | 'miniMap' }>[];
      expect(five.map((s) => s.kind)).toEqual(['visualMatch', 'quickReply', 'visualMatch', 'miniMap', 'quickReply']);
      // neutral stage names: no heading gives the answer (the fare is "Fare", never "~€15", until it is understood)
      expect(five.map((s) => s.label!.en)).toEqual(['📍 Destination', '💶 Fare', '🚦 Traffic', '🏁 Arrival', '🤝 Payment'].map((n, i) => `The ride ${i + 1}/5 — ${n}`));
      for (const s of five) expect(JSON.stringify(s.label), lang).not.toMatch(/€15|פקקים/);
      const fare = five[1] as QR;
      expect(fare.rounds.map(accepted)).toEqual(['phrase.taxi.how-much', 'phrase.taxi.speak-slowly']);
      expect((five[4] as QR).rounds.map(accepted)).toEqual(['phrase.taxi.keep-change']);
      const [receipt, summary] = gate.slice(5);
      expect(receipt!.kind === 'receipt' && receipt.text.en).toBe(`🚕 RIDE COMPLETE · ${rideDashboard(5)[1]} · “${line('en', 10)}”`); // the app-language card quotes the driver
      expect(summary!.kind).toBe('summary');
    }
  });
  it('the arc: the briefing → Step 0 → destination → fare → traffic → fast / recovery / slow → arrival → payment → match → by ear → supported ride → conversation → no help → video → final ride', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'prime' ? (s.gate ? 'prime:step0' : 'prime:cards') : s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'miniMap' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0',
      'prime:cards', 'visualMatch', 'sentenceBuilder', 'prime:cards', 'receipt',
      'prime:cards', 'sentenceBuilder', 'visualMatch', 'receipt',
      'prime:cards', 'miniMap', 'visualMatch', 'prime:cards', 'sentenceBuilder', 'quickReply', 'visualMatch', 'receipt',
      'prime:cards', 'miniMap', 'receipt',
      'prime:cards', 'visualMatch', 'receipt',
      'matchPairs', 'replies', 'quickReply', 'quickReply', 'quickReply', 'receipt', 'dialogue', 'receipt', 'quickReply:speed', 'receipt',
      'video:again', 'visualMatch:speed', 'quickReply', 'visualMatch', 'miniMap:speed', 'quickReply', 'receipt', 'summary',
    ]);
  });
});

describe('image slots — ready for the final artwork, one continuous ride', () => {
  const SLOTS = ['address', 'centre', 'fifteen-euros', 'traffic', 'speak-slowly', 'stop-here', 'change', 'where-to', 'give-address', 'off-we-go', 'fare-question', 'driver-fast-fare-traffic', 'recovery-request', 'driver-slow-repeat', 'okay-thanks', 'almost-there', 'here-okay', 'stop-scene', 'keep-change', 'goodbye'];
  it('the twenty slots exist — placeholders, clearly marked: no artwork yet', () => {
    expect(Object.keys(M07_SLOTS).sort()).toEqual([...SLOTS].sort());
    for (const s of Object.values(M07_SLOTS)) { expect(s.emoji).toBeTruthy(); expect(s.image).toBeUndefined(); }
    for (const p of Object.values(M07_PROPS)) expect((p as { image?: string }).image).toBeUndefined();
  });
  it('one meaning, one picture: no two slots share one, and no prop looks like a slot', () => {
    const looks = Object.values(M07_SLOTS).map((s) => s.emoji);
    expect(new Set(looks).size).toBe(looks.length);
    for (const [id, p] of Object.entries(M07_PROPS)) expect(looks, id).not.toContain(p.emoji);
  });
  it('every card picture comes from a slot, the same in every language — and the cards draw wide pictures', () => {
    const pictures = new Set(Object.values(M07_SLOTS).map((s) => s.emoji));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(pictures, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    for (const lang of LANGS) for (const p of stepsOf(day(lang), 'prime')) expect(p.widePictures, lang).toBe(true);
  });
  it('fairness: what a round shows is all of one kind — artwork, emoji or figures — so no answer stands out by its picture quality', () => {
    const kindOf = (t: Pick<MatchTile, 'image' | 'emoji' | 'label'>): string => (t.image ? 'image' : t.emoji ? 'emoji' : 'label');
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'visualMatch')) for (const r of s.rounds) {
        const shown = s.tiles.filter((t) => (r.show ?? s.tiles.map((x) => x.id)).includes(t.id));
        expect(new Set(shown.map(kindOf)).size, `${lang} ${shown.map((t) => t.id).join(',')}`).toBe(1);
      }
      for (const s of stepsOf(d, 'miniMap')) for (const r of s.rounds) expect(new Set(r.cells.filter((c) => c.tappable).map(kindOf)).size, lang).toBe(1);
    }
  });
});

describe('video, progress, parity and pacing', () => {
  it('the video resolves by the usual convention in every language and is replayable at every practice step; a missing one stays safe', () => {
    for (const lang of LANGS) {
      const video = missionVideo(lang, BOOTCAMP_PLAN[6]!.day);
      expect(video?.src, lang).toMatch(new RegExp(`videos/${lang}/${lang}_7\\.mp4$`));
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
  it('the mission is plain data the existing progress handles — the ride stage and the recovery\'s pace are data too', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(JSON.parse(JSON.stringify(d))).toEqual(d);
      const p = missionPhases(d);
      expect(p.learnStart).toBeLessThan(p.practiceStart);
      expect(p.practiceStart).toBeLessThan(d.steps.length);
    }
  });
  it('same journey in EN / ES / FR; every step valid; 37 meaningful interactions (inside 34–38)', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [Boolean(r.npc), r.npc?.pace, r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'miniMap') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [r.correct, strip(r.itemId), r.audio.pace, r.cells])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, strip(r.itemId), r.show, r.audio.pace])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel])];
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
  it('the sentences: later missions\' taxi lines are kept; "First time in the city?" is gone — archived, not taught, not heard', () => {
    for (const lang of LANGS) {
      const ids = day(lang).items.map((i) => strip(i.id));
      for (const id of [...LEARNER, 'phrase.taxi.to-airport', 'reply.taxi.where-to', 'reply.taxi.about-fifteen', 'reply.taxi.traffic', 'reply.taxi.here-good', 'reply.taxi.off-we-go', 'reply.taxi.goodbye']) expect(ids, lang).toContain(id);
      expect(ids, lang).not.toContain('reply.taxi.first-visit');
      expect(RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'taxi').map((r) => strip(r.id)), lang).toEqual(['reply.taxi.first-visit']);
      expect(JSON.stringify(day(lang)), lang).not.toMatch(/first-visit|First time in the city|première fois dans la ville|primera vez en la ciudad/);
      expect(stepsOf(day(lang), 'replies')[0]!.replyIds.map(strip)).toEqual(['reply.taxi.off-we-go', 'reply.taxi.goodbye']);
      expect(JSON.stringify(day(lang).steps), lang).not.toMatch(/About twenty|vingt euros|veinte euros|dix euros|diez euros|ten euros/); // the old fare drill is gone
    }
  });
});
