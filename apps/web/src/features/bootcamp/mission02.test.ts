import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M02_CONCEPTS, M02_NUMBERS } from './mission02Coverage.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { isHelpToolId, validatePracticeStep } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { UI_DICTIONARIES } from '../../shared/i18n/strings.js';
import type { BootcampDayContent, BootcampStep } from './types.js';
import type * as PlayerModule from './Bootcamp.js';

/**
 * Mission 02 — Numbers & Money, on the Mission 01 standard: finishing it must mean "I understand the
 * whole market conversation". The dialogue is LOCKED; every meaningful chunk of it — the vendor's
 * lines as much as the learner's — is met at least three times, in different ways, before the video.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const day = (lang: CoverageLang, n = 2): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((d) => cinematicTranscript(d)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const boards = (d: BootcampDayContent) => stepsOf(d, 'visualMatch');
const label = (b: Extract<BootcampStep, { kind: 'visualMatch' }>, id: string): string => { const t = b.tiles.find((x) => x.id === id)!; return `${t.emoji ?? ''}${t.label ? ` ${t.label}` : ''}`; };

const LOCKED: Record<CoverageLang, string[]> = {
  en: [
    'NPC: Fresh strawberries! Best in the market!', 'YOU: How much is it?', 'NPC: Five euros a box, or two for eight!', 'YOU: One box, please.',
    "NPC: Perfect. That's five euros. Cash or card?", 'YOU: By card, please.', 'NPC: Thank you! Enjoy the strawberries!',
  ],
  es: [
    'NPC: ¡Fresas frescas! ¡Las mejores del mercado!', 'YOU: ¿Cuánto es?', 'NPC: ¡Cinco euros la caja, o dos por ocho!', 'YOU: Una caja, por favor.',
    'NPC: Perfecto. Son cinco euros. ¿Efectivo o tarjeta?', 'YOU: Con tarjeta, por favor.', 'NPC: ¡Gracias! ¡Que las disfrute!',
  ],
  fr: [
    'NPC: Fraises fraîches ! Les meilleures du marché !', 'YOU: C’est combien ?', 'NPC: Cinq euros la barquette, ou deux pour huit !', 'YOU: Une barquette, s’il vous plaît.',
    'NPC: Parfait. Ça fait cinq euros. Espèces ou carte ?', 'YOU: Par carte, s’il vous plaît.', 'NPC: Merci ! Bonne dégustation !',
  ],
};

describe('the dialogue is locked', () => {
  for (const lang of LANGS) {
    it(`${lang}: the conversation is word for word the frozen one`, () => { expect(script(lang)).toEqual(LOCKED[lang]); });
  }
  it('the whole dialogue tree is byte-for-byte what it was before this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual({ en: '7574e271', fr: 'bcc3bbff', es: '64da9d41' });
    for (const lang of LANGS) expect(Object.keys(day(lang).dialogues), lang).toEqual(['market-stall']);
  });
  it('Mission 01 is byte-for-byte unchanged by this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l, 1)))]))).toEqual({ en: '63b23508', fr: '4d41f68e', es: '4802a27c' });
  });
});

describe('the coverage specification', () => {
  it('names the fourteen meaningful chunks, each really in the frozen conversation', () => {
    expect(M02_CONCEPTS.map((c) => c.id)).toEqual(['fresh-strawberries', 'best-market', 'how-much', 'five-euros', 'box', 'two', 'two-for-eight', 'one-box', 'perfect', 'thats-five', 'cash-or-card', 'by-card', 'thank-you', 'enjoy']);
    for (const lang of LANGS) for (const c of M02_CONCEPTS) expect(LOCKED[lang].some((line) => hasChunk(line.slice(5), c.chunk[lang])), `${lang} ${c.id}: “${c.chunk[lang]}”`).toBe(true);
  });
  it('the chunks account for every word of every line — nothing in the video is outside the specification', () => {
    // Small joining words that carry no meaning of their own in these lines.
    const GLUE: Record<CoverageLang, string[]> = { en: ['a', 'or'], es: ['la', 'o'], fr: ['la', 'ou'] };
    for (const lang of LANGS) {
      const known = new Set(M02_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')).concat(GLUE[lang]));
      for (const line of LOCKED[lang]) for (const w of plain(line.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${line}”`).toBe(true);
    }
  });
});

describe('every meaningful chunk of the video is learned before the video', () => {
  for (const lang of LANGS) {
    it(`${lang}: all fourteen are COVERED — three or more encounters, in different ways, never the conversation alone`, () => {
      for (const row of coverageOf(day(lang), lang, M02_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    });
  }
  it('the encounter counts, per chunk — the same in English, Spanish and French (the price question is one building block richer in Spanish and French)', () => {
    const counts = (lang: CoverageLang): Record<string, string> => Object.fromEntries(coverageOf(day(lang), lang, M02_CONCEPTS).map((r) => [r.id, `${r.total} = meaning ${r.byKind.meaning} · listening ${r.byKind.listening} · retrieval ${r.byKind.retrieval} · context ${r.byKind.context}`]));
    // "c’est combien" / "¿cuánto es?" ARE the whole question, so the building block itself teaches it;
    // English "how much" is only its first half. Everything else is identical.
    const same = (lang: CoverageLang): Record<string, string> => ({ ...counts(lang), 'how-much': '' });
    expect(same('es')).toEqual(same('en'));
    expect(same('fr')).toEqual(same('en'));
    expect([counts('es')['how-much'], counts('fr')['how-much']]).toEqual(['9 = meaning 3 · listening 1 · retrieval 4 · context 1', '9 = meaning 3 · listening 1 · retrieval 4 · context 1']);
    expect(counts('en')).toMatchInlineSnapshot(`
      {
        "best-market": "5 = meaning 1 · listening 1 · retrieval 0 · context 3",
        "box": "16 = meaning 3 · listening 6 · retrieval 5 · context 2",
        "by-card": "10 = meaning 2 · listening 2 · retrieval 5 · context 1",
        "cash-or-card": "7 = meaning 1 · listening 3 · retrieval 1 · context 2",
        "enjoy": "6 = meaning 2 · listening 3 · retrieval 0 · context 1",
        "five-euros": "11 = meaning 1 · listening 5 · retrieval 2 · context 3",
        "fresh-strawberries": "7 = meaning 2 · listening 2 · retrieval 0 · context 3",
        "how-much": "8 = meaning 2 · listening 1 · retrieval 4 · context 1",
        "one-box": "10 = meaning 2 · listening 2 · retrieval 5 · context 1",
        "perfect": "4 = meaning 1 · listening 1 · retrieval 0 · context 2",
        "thank-you": "6 = meaning 2 · listening 3 · retrieval 0 · context 1",
        "thats-five": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "two": "9 = meaning 2 · listening 4 · retrieval 1 · context 2",
        "two-for-eight": "8 = meaning 1 · listening 4 · retrieval 1 · context 2",
      }
    `);
  });
  it('the promotional opening and the closing wish are comprehension-covered, and never asked for as something to say', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const id of ['fresh-strawberries', 'best-market', 'perfect', 'thank-you', 'enjoy']) {
        const c = M02_CONCEPTS.find((x) => x.id === id)!;
        const outside = encounters(d, c.chunk[lang]).filter((e) => e.kind !== 'context');
        expect(outside.length, `${lang} ${id}`).toBeGreaterThanOrEqual(2);
      }
      const produced = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => strip(o.itemId)))), ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId))), ...stepsOf(d, 'tool').map((s) => strip(s.itemId))];
      for (const id of ['reply.money.fresh-strawberries', 'reply.money.best-market', 'reply.money.offer', 'reply.money.perfect', 'reply.money.enjoy-strawberries']) {
        expect(d.items.some((i) => strip(i.id) === id), `${lang} ${id}`).toBe(true);
        expect(produced, `${lang} ${id}`).not.toContain(id);
      }
    }
  });
  it('removing the stall practice is caught: without the boards, the match and the review, chunks fall out of coverage', () => {
    const d = day('en');
    const without: BootcampDayContent = { ...d, steps: d.steps.filter((s) => s.kind !== 'visualMatch' && s.kind !== 'matchPairs' && s.kind !== 'swipe' && s.kind !== 'replies') };
    expect(coverageOf(without, 'en', M02_CONCEPTS).filter((r) => !r.covered).map((r) => r.id)).toEqual(expect.arrayContaining(['fresh-strawberries', 'best-market', 'perfect', 'enjoy', 'two-for-eight']));
  });
});

describe('numbers are caught BY EAR', () => {
  for (const lang of LANGS) {
    it(`${lang}: 1, 2, 5 and 8 are each heard on a board and tapped — not only read`, () => {
      const heard = boards(day(lang)).flatMap((b) => b.rounds.map((r) => r.audio.en));
      for (const n of [1, 2, 5, 8] as const) expect(heard.some((a) => hasChunk(a, M02_NUMBERS[lang][n])), `${lang} ${n} (${M02_NUMBERS[lang][n]})`).toBe(true);
      // …and each is a building block of Step 0.
      const blocks = stepsOf(day(lang), 'prime')[0]!.words.map((w) => w.text);
      for (const n of [1, 2, 5, 8] as const) expect(blocks, `${lang} ${n}`).toContain(M02_NUMBERS[lang][n]);
    });
  }
  it('the price board: a spoken price → its tag', () => {
    const b = boards(day('en'))[0]!;
    expect(b.rounds.map((r) => [r.audio.en, label(b, r.correct)])).toEqual([
      ["That's five euros.", ' €5'], ['Eight euros.', ' €8'], ['Fifteen fifty.', ' €15.50'], ['Twenty euros, please.', ' €20'], ["That'll be ten euros.", ' €10'],
    ]);
  });
});

describe('the stall board: nine approved pictures, one 3×3 board, the purchase in the order it happens', () => {
  const stall = (lang: CoverageLang) => boards(day(lang))[1]!;
  const picture = (b: ReturnType<typeof stall>, id: string): string => b.tiles.find((t) => t.id === id)!.image!.replace('images/mission02/', '');
  const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url));
  /** Heard → the picture that shows it. One picture per meaning, the same file in every language. */
  const HEARD: Record<CoverageLang, string[]> = {
    en: ['Fresh strawberries!', 'How much is it?', 'Five euros a box.', 'Two for eight.', 'One box, please.', 'Cash or card?', 'By card, please.', 'In cash.', 'Thank you! Enjoy the strawberries!'],
    es: ['¡Fresas frescas!', '¿Cuánto es?', 'Cinco euros la caja.', 'Dos por ocho.', 'Una caja, por favor.', '¿Efectivo o tarjeta?', 'Con tarjeta, por favor.', 'En efectivo.', '¡Gracias! ¡Que las disfrute!'],
    fr: ['Fraises fraîches !', 'C’est combien ?', 'Cinq euros la barquette.', 'Deux pour huit.', 'Une barquette, s’il vous plaît.', 'Espèces ou carte ?', 'Par carte, s’il vous plaît.', 'En espèces.', 'Merci ! Bonne dégustation !'],
  };
  const PICTURES = ['fresh-strawberries-v2.jpg', 'how-much.jpg', 'five-euros.jpg', 'two-for-eight.jpg', 'one-box.jpg', 'cash-or-card.jpg', 'pay-card.jpg', 'cash.jpg', 'enjoy-strawberries.jpg'];

  it('exactly nine tiles — a full 3×3 board with no empty cell — on the 3-column grid', () => {
    for (const lang of LANGS) {
      expect(stall(lang).tiles, lang).toHaveLength(9);
      expect(stall(lang).tiles.length % 3, lang).toBe(0);
    }
    const css = readFileSync(fileURLToPath(new URL('../../app/styles.css', import.meta.url)), 'utf8');
    expect(css).toContain('.pgrid { display: grid; grid-template-columns: repeat(3, 1fr);');
  });
  it('every tile is a real picture, never an emoji, and every picture is in the app', () => {
    for (const lang of LANGS) {
      for (const t of stall(lang).tiles) {
        expect(t.emoji, `${lang} ${t.id}`).toBeUndefined();
        expect(t.image, `${lang} ${t.id}`).toMatch(/^images\/mission02\/[a-z0-9-]+\.jpg$/);
        expect(t.alt, `${lang} ${t.id}`).toBeTruthy();
        expect(existsSync(PUBLIC + t.image!), `${t.image} on disk`).toBe(true);
        expect(statSync(PUBLIC + t.image!).size, t.image).toBeGreaterThan(10_000);
      }
      expect(new Set(stall(lang).tiles.map((t) => t.image)).size, lang).toBe(9);
    }
  });
  it('one shared set of pictures — English, Spanish and French use the very same tiles', () => {
    expect(stall('es').tiles).toEqual(stall('en').tiles);
    expect(stall('fr').tiles).toEqual(stall('en').tiles);
    // the folder holds the nine stall pictures, the two wrong offer readings of the gate and "best in the market"
    expect(readdirSync(PUBLIC + 'images/mission02').sort()).toEqual([...PICTURES, 'offer-two-for-sixteen.jpg', 'offer-prices-swapped.jpg', 'best-in-market.jpg'].sort());
  });
  for (const lang of LANGS) {
    it(`${lang}: each sentence heard lands on the picture of what it means, in the order of the purchase`, () => {
      const b = stall(lang);
      expect(b.rounds.map((r) => r.audio.en)).toEqual(HEARD[lang]);
      expect(b.rounds.map((r) => picture(b, r.correct))).toEqual(PICTURES);
    });
  }
  it('the key meanings: two for eight → two boxes / €8 · by card → the terminal · in cash → the hand with cash · the goodbye → the customer eating a strawberry', () => {
    for (const lang of LANGS) {
      const b = stall(lang);
      const at = (heard: number): string => picture(b, b.rounds.find((r) => r.audio.en === HEARD[lang][heard])!.correct);
      expect([at(3), at(6), at(7), at(8)], lang).toEqual(['two-for-eight.jpg', 'pay-card.jpg', 'cash.jpg', 'enjoy-strawberries.jpg']);
      // the closing line is the locked vendor line itself — comprehension only, never asked to be said
      expect(`NPC: ${HEARD[lang][8]}`).toBe(LOCKED[lang][6]);
    }
  });
});

describe('the market offer is understood: one box = €5, two boxes = €8 TOGETHER', () => {
  it('"two for eight" is its own picture (two boxes, one €8 tag); the "two = €16" reading is checked on the offer tiles after the video', () => {
    for (const lang of LANGS) {
      const b = boards(day(lang))[1]!;
      expect(b.rounds.find((r) => r.correct === 'two8')!.audio.en, lang).toBe({ en: 'Two for eight.', es: 'Dos por ocho.', fr: 'Deux pour huit.' }[lang]);
      expect(b.rounds.find((r) => r.correct === 'one5')!.audio.en, lang).toBe({ en: 'Five euros a box.', es: 'Cinco euros la caja.', fr: 'Cinq euros la barquette.' }[lang]);
      const gate = boards(day(lang)).find((x) => x.tiles.some((t) => t.id === 'offer'))!;
      expect(gate.tiles.map((t) => t.label), lang).toContain('1 box = €5\n2 = €16 total');
    }
  });
  it('the offer line is a sentence of its own, with the explanation on its card — never "8 each"', () => {
    for (const lang of LANGS) {
      const offer = day(lang).items.find((i) => strip(i.id) === 'reply.money.offer')!;
      expect(`NPC: ${offer.text}`, lang).toBe(LOCKED[lang][2]);
      expect(offer.tip!.en).toBe('One box = 5 euros. Two boxes = 8 euros together (not 8 each).');
    }
  });
  it('after the video, the offer is ONE tile showing both prices — the two-for-eight picture with its numbers, against the two wrong readings', () => {
    const gate = boards(day('en')).find((b) => b.tiles.some((t) => t.id === 'offer'))!;
    expect(gate.tiles.filter((t) => t.id.startsWith('offer')).map((t) => t.label)).toEqual(['1 box = €5\n2 = €8 total', '1 box = €5\n2 = €16 total', '1 box = €8\n2 = €5 total']);
    // all three are picture + short label, in the same form: no picture-vs-text shortcut to the right one
    expect(gate.tiles.filter((t) => t.id.startsWith('offer')).map((t) => t.image)).toEqual(['two-for-eight', 'offer-two-for-sixteen', 'offer-prices-swapped'].map((f) => `images/mission02/${f}.jpg`));
    for (const t of gate.tiles.filter((x) => x.id.startsWith('offer'))) {
      expect(t.emoji, t.id).toBeUndefined();
      expect(t.alt, t.id).toBeTruthy();
      expect(t.label, t.id).toMatch(/^1 box = €\d+\n2 = €\d+ total$/);
      expect(Object.keys(t).sort(), t.id).toEqual(['alt', 'id', 'image', 'label']);
    }
    expect(gate.rounds.find((r) => r.correct === 'offer')!.audio.en).toBe('Five euros a box, or two for eight!');
  });
});

describe('the gate after the video: the same approved pictures, wherever one exists', () => {
  const gate = (lang: CoverageLang) => boards(day(lang)).find((b) => b.tiles.some((t) => t.id === 'offer'))!;
  const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url));
  it('nine tiles (3×3), every one a picture — no emoji, no text-only tile; every picture is an approved Mission 02 file on disk', () => {
    for (const lang of LANGS) {
      const g = gate(lang);
      expect(g.tiles, lang).toHaveLength(9);
      for (const t of g.tiles) {
        expect(t.emoji, `${lang} ${t.id}`).toBeUndefined();
        expect(t.image, `${lang} ${t.id} is a picture`).toBeTruthy();
        expect(existsSync(PUBLIC + t.image!), t.image).toBe(true);
        expect(t.alt, t.id).toBeTruthy();
      }
      expect(g.tiles, lang).toEqual(gate('en').tiles);
    }
  });
  it('each meaning uses its approved picture: sold · offer · one box · card · cash · goodbye', () => {
    const pic = Object.fromEntries(gate('en').tiles.map((t) => [t.id, t.image?.replace('images/mission02/', '')]));
    expect(pic).toEqual({
      berries: 'fresh-strawberries-v2.jpg', offer: 'two-for-eight.jpg', offer16: 'offer-two-for-sixteen.jpg', offer58: 'offer-prices-swapped.jpg',
      box1: 'one-box.jpg', 'cash-or-card': 'cash-or-card.jpg', card: 'pay-card.jpg', cash: 'cash.jpg', bye: 'enjoy-strawberries.jpg',
    });
    // the very same tiles the stall board taught — same picture, same description
    const stall = boards(day('en'))[1]!;
    for (const id of ['berries', 'box1', 'cash-or-card', 'card', 'cash']) expect(gate('en').tiles.find((t) => t.id === id)).toEqual(stall.tiles.find((t) => t.id === id));
  });
});

describe('one picture = one meaning, everywhere in the mission', () => {
  const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url));
  /** Every picture the mission shows, wherever it is shown, with the meaning it stands for there. */
  const meanings = (lang: CoverageLang): [string, string][] => {
    const d = day(lang);
    const fromBoards = boards(d).flatMap((b) => b.tiles.filter((t) => t.image).map((t): [string, string] => [t.image!, t.id === 'bye' ? 'enjoy' : t.id]));
    const fromPairs = stepsOf(d, 'matchPairs').flatMap((s) => s.pairs.filter((p) => p.answerImage).map((p): [string, string] => [p.answerImage!, strip(p.answerItemId)]));
    return [...fromBoards, ...fromPairs];
  };
  /** Ids that name the same meaning in different exercises: the gate's offer tile IS the board's "two for eight". */
  const PAIR_MEANING: Record<string, string> = { 'reply.money.fresh-strawberries': 'berries', 'reply.money.best-market': 'best', 'reply.money.enjoy-strawberries': 'enjoy', offer: 'two8' };
  it('fresh strawberries · best in the market · enjoy: three distinct, approved pictures', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const stall = boards(d)[1]!;
      const vendor = stepsOf(d, 'matchPairs').find((s) => s.pairs.some((p) => strip(p.answerItemId) === 'reply.money.best-market'))!;
      const pairPic = (id: string): string | undefined => vendor.pairs.find((p) => strip(p.answerItemId) === id)!.answerImage;
      const fresh = stall.tiles.find((t) => t.id === 'berries')!.image;
      const enjoy = stall.tiles.find((t) => t.id === 'enjoy')!.image;
      const best = pairPic('reply.money.best-market');
      expect([fresh, best, enjoy], lang).toEqual(['fresh-strawberries-v2', 'best-in-market', 'enjoy-strawberries'].map((f) => `images/mission02/${f}.jpg`));
      expect(new Set([fresh, best, enjoy]).size, lang).toBe(3);
      // …and the vendor's-words match shows the very same pictures as the stall board
      expect([pairPic('reply.money.fresh-strawberries'), pairPic('reply.money.enjoy-strawberries')], lang).toEqual([fresh, enjoy]);
      for (const f of [fresh, best, enjoy]) expect(existsSync(PUBLIC + f!), f).toBe(true);
      // the sentence each of them stands for, heard on the stall board / named in the match
      expect(stall.rounds.find((r) => r.correct === 'berries')!.itemId).toBe(`${lang}.reply.money.fresh-strawberries`);
      expect(stall.rounds.find((r) => r.correct === 'enjoy')!.itemId).toBe(`${lang}.reply.money.enjoy-strawberries`);
    }
  });
  it('no picture stands for two meanings, and no meaning has two pictures — across the board, the gate and the match', () => {
    for (const lang of LANGS) {
      const byPic = new Map<string, Set<string>>();
      const byMeaning = new Map<string, Set<string>>();
      for (const [pic, raw] of meanings(lang)) {
        const m = PAIR_MEANING[raw] ?? raw;
        byPic.set(pic, (byPic.get(pic) ?? new Set()).add(m));
        byMeaning.set(m, (byMeaning.get(m) ?? new Set()).add(pic));
        expect(existsSync(PUBLIC + pic), pic).toBe(true);
      }
      for (const [pic, ms] of byPic) expect([...ms], `${lang} ${pic}`).toHaveLength(1);
      for (const [m, ps] of byMeaning) expect([...ps], `${lang} ${m}`).toHaveLength(1);
      expect(byPic.size, lang).toBe(12); // every file in the folder is used, each for exactly one meaning
    }
    expect(meanings('es')).toEqual(meanings('en'));
    expect(meanings('fr')).toEqual(meanings('en'));
  });
});

describe('question → answer: price, order, payment', () => {
  for (const lang of LANGS) {
    it(`${lang}: each pair is connected on the board, answered in Quick Reply, and retrieved at speed against the vendor's own lines`, () => {
      const d = day(lang);
      const qa = stepsOf(d, 'matchPairs').find((s) => s.pairs.every((p) => !p.answerLabel))!;
      expect(qa.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId)])).toEqual([
        ['phrase.money.how-much', 'reply.money.five-euros'], ['reply.money.offer', 'phrase.money.one-box'], ['reply.money.cash-or-card', 'phrase.money.by-card'],
      ]);
      const quick = stepsOf(d, 'quickReply').find((s) => !s.challenge)!;
      expect(quick.rounds.map((r) => r.options.filter((o) => o.correct).map((o) => strip(o.itemId)))).toEqual([
        ['phrase.money.how-much'], ['phrase.money.one-box'], ['phrase.money.by-card', 'phrase.money.in-cash'], ['phrase.money.too-expensive'],
      ]);
      const rush = stepsOf(d, 'quickReply').find((s) => s.challenge)!;
      const vendor = d.dialogues['market-stall']!.nodes.filter((n) => n.who === 'npc').map((n) => n.en);
      expect(rush.rounds.map((r) => `NPC: ${r.npc!.en}`), lang).toEqual([LOCKED[lang][0], LOCKED[lang][2], LOCKED[lang][4]]);
      for (const r of rush.rounds) expect(vendor).toContain(r.npc!.en);
      expect(rush.rounds.map((r) => strip(r.options.find((o) => o.correct)!.itemId))).toEqual(['phrase.money.how-much', 'phrase.money.one-box', 'phrase.money.by-card']);
    });
  }
  it('the learner\'s three lines are retrieved at least four times each; the two orders are built from their pieces', () => {
    for (const lang of LANGS) {
      for (const id of ['how-much', 'one-box', 'by-card']) expect(coverageOf(day(lang), lang, M02_CONCEPTS).find((r) => r.id === id)!.byKind.retrieval, `${lang} ${id}`).toBeGreaterThanOrEqual(4);
      const d = day(lang);
      for (const r of stepsOf(d, 'sentenceBuilder')[0]!.rounds) expect(r.chunks.join(' '), lang).toBe(d.items.find((i) => i.id === r.itemId)!.text);
    }
    expect(stepsOf(day('fr'), 'sentenceBuilder')[0]!.rounds.map((r) => r.chunks)).toEqual([['Une', 'barquette,', 's’il vous plaît.'], ['Par', 'carte,', 's’il vous plaît.']]);
    expect(stepsOf(day('es'), 'sentenceBuilder')[0]!.rounds.map((r) => r.chunks)).toEqual([['Una', 'caja,', 'por favor.'], ['Con', 'tarjeta,', 'por favor.']]);
  });
});

describe('the recovery-phrase rule: no prompt is invented to force "please repeat"', () => {
  it('every Quick Reply prompt is a real line of the conversation, a trained sentence, or one that plainly belongs at a stall — and none is answered with a help phrase', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const vendor = new Set(d.dialogues['market-stall']!.nodes.filter((n) => n.who === 'npc').map((n) => n.en));
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
        for (const o of r.options) expect(isHelpToolId(o.itemId), `${lang}: ${o.itemId}`).toBe(false);
        if (r.npc) expect(vendor.has(r.npc.en) || /fifty|cinquante|cincuenta/.test(r.npc.en), `${lang}: ${r.npc.en}`).toBe(true); // "That's fifty euros." → "That's too expensive."
        else expect(d.items.some((i) => i.id === r.promptItemId), lang).toBe(true);
      }
      expect(stepsOf(d, 'ambush'), lang).toHaveLength(0); // no off-script line at all in this mission
    }
    // Recovery keeps its one natural home: inside the conversation, on the fast offer.
    const c2 = day('en').dialogues['market-stall']!.nodes.find((n) => n.id === 'c2')!;
    expect(c2.choices!.map((c) => strip(c.itemId))).toContain('phrase.recovery.slowly');
  });
});

describe('nothing unexplained: every target-language word the learner meets was prepared first', () => {
  const words = (s: string): string[] => plain(s).trim().split(' ').filter(Boolean);
  /**
   * Walk the mission in order. A word is PREPARED once the learner has met it with its meaning: a
   * building block, a key sentence, a listening-drill sentence (the answer card shows the meaning), a
   * match tile, a review card, a line of the conversation (shown with its translation), or a board
   * round that teaches by its picture. Lines that TEST — a Quick Reply prompt, a speed round, a
   * speed board, the check after the video — may use only words already prepared.
   */
  const unexplained = (lang: CoverageLang): string[] => {
    const d = day(lang);
    const text = (id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
    const known = new Set<string>();
    const learn = (s: string): void => { for (const w of words(s)) known.add(w); };
    const out: string[] = [];
    const test = (s: string, where: string): void => { for (const w of words(s)) if (!known.has(w)) out.push(`${where}: “${w}” in “${s}”`); };
    let afterVideo = false;
    d.steps.forEach((s, i) => {
      const at = `step ${i + 1} ${s.kind}`;
      if (s.kind === 'video' && s.mode === 'again') afterVideo = true;
      else if (s.kind === 'prime') { s.words.forEach((w) => learn(w.text)); if (s.buildFromItemId) learn(text(s.buildFromItemId)); }
      else if (s.kind === 'tool') learn(text(s.itemId));
      else if (s.kind === 'replies') s.replyIds.forEach((id) => learn(text(id)));
      else if (s.kind === 'swipe') s.itemIds.forEach((id) => learn(text(id)));
      else if (s.kind === 'matchPairs') s.pairs.forEach((p) => { learn(text(p.promptItemId)); learn(p.answerText ?? text(p.answerItemId)); });
      else if (s.kind === 'sentenceBuilder') s.rounds.forEach((r) => test(r.chunks.join(' '), at));
      else if (s.kind === 'dialogue') d.dialogues[s.dialogueId]!.nodes.forEach((n) => { if (n.en) learn(n.en); n.choices?.forEach((c) => learn(c.en)); });
      else if (s.kind === 'visualMatch') s.rounds.forEach((r) => { if (s.challenge || afterVideo) test(r.audio.en, at); else learn(r.audio.en); });
      else if (s.kind === 'quickReply') s.rounds.forEach((r) => { test(r.npc?.en ?? text(r.promptItemId), at); r.options.forEach((o) => test(o.text ?? text(o.itemId), at)); });
      else if (s.kind === 'quiz') test(text(s.itemId), at);
      else if (s.kind === 'ambush') test(s.npc.en, at);
    });
    return out;
  };
  for (const lang of LANGS) {
    it(`${lang}: no test line contains a word that was not prepared earlier in the mission`, () => {
      expect(unexplained(lang)).toEqual([]);
    });
  }
  it('the fast price is the number alone, in words the learner already has — the old "altogether / alright" line is gone', () => {
    const fast = (lang: CoverageLang): string => boards(day(lang)).find((b) => b.challenge)!.rounds[0]!.audio.en;
    expect([fast('en'), fast('fr'), fast('es')]).toEqual(["That's fifteen fifty.", 'Ça fait quinze cinquante.', 'Son quince con cincuenta.']);
    for (const lang of LANGS) expect(JSON.stringify(day(lang).steps), lang).not.toMatch(/altogether|alright|comes to|en tout|c’est bon pour vous|en total|le parece/i);
    // …and "fifteen fifty" itself is taught on the price board before it is asked for at speed.
    const b = boards(day('en'))[0]!;
    expect(b.rounds.map((r) => r.audio.en)).toContain('Fifteen fifty.');
    expect(label(b, b.rounds.find((r) => r.audio.en === 'Fifteen fifty.')!.correct)).toBe(' €15.50');
  });
});

describe('the learning arc', () => {
  it('Step 0 → sentences → what you hear → prices by ear → the stall → the vendor\'s words → pairs → build → answer → conversation → review → speed → video → what happened?', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'quickReply' && s.challenge ? 'quickReply:speed' : s.kind === 'visualMatch' && s.challenge ? 'visualMatch:speed' : s.kind === 'video' ? `video:${s.mode}` : s.kind === 'prime' && s.gate ? 'prime:step0' : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0', 'tool', 'tool', 'tool', 'tool',
      'replies', 'receipt', 'visualMatch', 'visualMatch', 'matchPairs', 'matchPairs', 'sentenceBuilder', 'quickReply',
      'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'visualMatch:speed', 'receipt',
      'video:again', 'visualMatch', 'receipt', 'summary',
    ]);
  });
  it('Step 0 is short (eight blocks), optional and about THIS conversation: how much, 1 · 2 · 5 · 8, box, cash, card', () => {
    for (const lang of LANGS) {
      const p = stepsOf(day(lang), 'prime')[0]!;
      expect(p.gate, lang).toBe(true);
      expect(p.words.map((w) => w.key), lang).toEqual(['money.how-much', 'number.one', 'number.two', 'number.five', 'number.eight', 'money.box', 'money.cash', 'money.card']);
    }
    expect(stepsOf(day('es'), 'prime')[0]!.words.map((w) => w.text)).toEqual(['¿cuánto es?', 'una', 'dos', 'cinco', 'ocho', 'caja', 'efectivo', 'tarjeta']);
    expect(stepsOf(day('fr'), 'prime')[0]!.words.map((w) => w.text)).toEqual(['c’est combien', 'une', 'deux', 'cinq', 'huit', 'barquette', 'espèces', 'carte']);
    // No other mission has the gate (Mission 01 is unchanged) — except Missions 03–05, whose own passes added their Step 0.
    for (let n = 1; n <= 30; n++) if (n < 2 || n > 5) for (const s of stepsOf(day('en', n), 'prime')) expect(s.gate, `M${n}`).toBeUndefined();
    for (const key of ['primeGateTitle', 'primeGateBody', 'primeGateStart', 'primeGateSkip'] as const) { expect(UI_DICTIONARIES.he![key]).toBeTruthy(); expect(UI_DICTIONARIES.en![key]).toBeTruthy(); }
    expect(UI_DICTIONARIES.he!.primeGateStart).toBe('בואו נתחיל');
    expect(UI_DICTIONARIES.he!.primeGateSkip).toBe('אני כבר יודע — דלג');
  });
  it('the final gate: the video first (where one exists), then what happened at the stall — answered by tapping', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const again = d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
      const after = d.steps.slice(again + 1);
      expect(after.map((s) => s.kind), lang).toEqual(['visualMatch', 'receipt', 'summary']);
      expect(stepsOf(d, 'quiz'), lang).toHaveLength(0); // nothing is checked by re-translating
      const gate = after[0] as Extract<BootcampStep, { kind: 'visualMatch' }>;
      // What is sold · the offer · how many · how you pay — the conversation's own lines, heard again.
      // …each answered with the approved picture of its meaning (the offer also carries its numbers).
      expect(gate.rounds.map((r) => gate.tiles.find((t) => t.id === r.correct)!.image), lang).toEqual(['fresh-strawberries-v2', 'two-for-eight', 'one-box', 'pay-card', 'enjoy-strawberries'].map((f) => `images/mission02/${f}.jpg`));
      // What is sold · the offer · how many · how you pay · the goodbye — the conversation's own lines.
      expect(gate.rounds.map((r) => r.audio.en)).toEqual([0, 2, 3, 5, 6].map((i) => LOCKED[lang][i]!.slice(5)));
    }
  });
  it('same journey in the three languages; every step is valid; the mission is 44 quick questions — most of them one tap', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.tiles, s.rounds.map((r) => [r.correct, strip(r.itemId)])];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel, p.answerGloss])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => [strip(r.itemId), r.chunks.length])];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'quiz') return [s.kind, strip(s.itemId), s.wrongIds.map(strip)];
      if (s.kind === 'tool') return [s.kind, strip(s.itemId)];
      if (s.kind === 'swipe') return [s.kind, s.itemIds.map(strip)];
      if (s.kind === 'prime') return [s.kind, s.gate, s.words.map((w) => w.key)];
      return s;
    });
    for (const lang of LANGS) {
      const d = day(lang);
      if (lang !== 'en') expect(shape(d), lang).toEqual(shape(day('en')));
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      const questions = stepsOf(d, 'replies').reduce((k, s) => k + s.replyIds.length, 0) + stepsOf(d, 'quickReply').reduce((k, s) => k + s.rounds.length, 0) + stepsOf(d, 'visualMatch').reduce((k, s) => k + s.rounds.length, 0)
        + stepsOf(d, 'matchPairs').reduce((k, s) => k + s.pairs.length, 0) + stepsOf(d, 'sentenceBuilder').reduce((k, s) => k + s.rounds.length, 0) + 3;
      expect(questions, lang).toBe(44);
    }
  });
});

describe('Step 0 on screen', () => {
  let player: typeof PlayerModule;
  beforeAll(async () => {
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    player = await import('./Bootcamp.js');
  });
  it('the player source: a gated building-blocks step opens on the invitation, with start and skip', async () => {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const src = readFileSync(fileURLToPath(new URL('./Bootcamp.tsx', import.meta.url)), 'utf8');
    expect(player).toBeTruthy();
    expect(src).toContain('const [started, setStarted] = useState(!step.gate);');
    expect(src).toContain("<button className=\"btn-primary\" onClick={() => { tap(); setStarted(true); }}>{t('primeGateStart')}</button>");
    expect(src).toContain("<button className=\"btn-ghost\" onClick={() => { tap(); cancelSpeech(); onNext(); }}>{t('primeGateSkip')}</button>"); // skip = straight on, nothing blocked
    expect(renderToStaticMarkup(createElement('span', null, UI_DICTIONARIES.he!.primeGateTitle))).toContain('לפני שמתחילים — כמה אבני יסוד');
  });
});
