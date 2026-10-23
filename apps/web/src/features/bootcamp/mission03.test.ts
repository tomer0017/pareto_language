import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M03_CONCEPTS } from './mission03Coverage.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { customizeResult, isHelpToolId, validatePracticeStep } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { coachFor } from '../companion/companionCoach.js';
import type { BootcampDayContent, BootcampStep } from './types.js';
import type * as StepsModule from './PracticeSteps.js';

/**
 * Mission 03 — Coffee Shop, on the Mission 01/02 standard: finishing it must mean "I understand the
 * whole café conversation". The dialogue is LOCKED; every meaningful chunk of it — the barista's lines
 * as much as the learner's — is met at least three times, in different ways, before the mission ends,
 * and nothing is tested before it was met with its meaning.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const day = (lang: CoverageLang, n = 3): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((d) => cinematicTranscript(d)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const boards = (d: BootcampDayContent) => stepsOf(d, 'visualMatch');
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const afterVideo = (d: BootcampDayContent): BootcampStep[] => d.steps.slice(d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again') + 1);
const gates = (d: BootcampDayContent) => afterVideo(d).filter((s): s is Extract<BootcampStep, { kind: 'visualMatch' }> => s.kind === 'visualMatch');
const tileOf = (b: Extract<BootcampStep, { kind: 'visualMatch' }>, id: string) => b.tiles.find((t) => t.id === id)!;

const LOCKED: Record<CoverageLang, string[]> = {
  en: [
    'NPC: Good morning! What can I get you?', "YOU: I'd like an iced coffee, please.", 'NPC: Sure! Medium or large?', 'YOU: Medium, please.',
    'NPC: Milk and sugar?', 'YOU: Milk, no sugar.', 'NPC: Anything to eat?', 'YOU: A croissant, please.',
    'NPC: Great choice. Would you like anything else?', "YOU: That's all, thanks.", "NPC: That'll be six fifty. Cash or card?", 'YOU: Card, please.',
    'NPC: Would you like the receipt?', 'YOU: Yes, please.', 'NPC: Here you go — enjoy your day!',
  ],
  es: [
    'NPC: ¡Buenos días! ¿Qué le sirvo?', 'YOU: Quiero un café con hielo, por favor.', 'NPC: ¡Perfecto! ¿Mediano o grande?', 'YOU: Mediano, por favor.',
    'NPC: ¿Leche y azúcar?', 'YOU: Con leche, sin azúcar.', 'NPC: ¿Algo de comer?', 'YOU: Un cruasán, por favor.',
    'NPC: Buena elección. ¿Algo más?', 'YOU: Eso es todo, gracias.', 'NPC: Son seis con cincuenta. ¿Efectivo o tarjeta?', 'YOU: Con tarjeta, por favor.',
    'NPC: ¿Quiere el recibo?', 'YOU: Sí, por favor.', 'NPC: Aquí tiene — ¡que tenga un buen día!',
  ],
  fr: [
    'NPC: Bonjour ! Qu’est-ce que je vous sers ?', 'YOU: Je voudrais un café glacé, s’il vous plaît.', 'NPC: Parfait ! Moyen ou grand ?', 'YOU: Moyen, s’il vous plaît.',
    'NPC: Lait et sucre ?', 'YOU: Avec du lait, sans sucre.', 'NPC: Quelque chose à manger ?', 'YOU: Un croissant, s’il vous plaît.',
    'NPC: Excellent choix. Vous désirez autre chose ?', 'YOU: C’est tout, merci.', 'NPC: Ça fait six euros cinquante. Espèces ou carte ?', 'YOU: Par carte, s’il vous plaît.',
    'NPC: Vous voulez le ticket ?', 'YOU: Oui, s’il vous plaît.', 'NPC: Voilà — bonne journée !',
  ],
};
const line = (lang: CoverageLang, i: number): string => LOCKED[lang][i]!.slice(5);

describe('the dialogue is locked', () => {
  for (const lang of LANGS) {
    it(`${lang}: the conversation is word for word the frozen one`, () => { expect(script(lang)).toEqual(LOCKED[lang]); });
  }
  it('the whole dialogue tree is byte-for-byte what it was before this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual({ en: 'dca4cfc9', es: '93b6af2b', fr: '64e0dc53' });
    for (const lang of LANGS) expect(Object.keys(day(lang).dialogues), lang).toEqual(['breakfast-order']);
  });
  it('Missions 01 and 02 are byte-for-byte unchanged by this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l, 1)))]))).toEqual({ en: '63b23508', es: '4802a27c', fr: '4d41f68e' });
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l, 2)))]))).toEqual({ en: '28382d4a', es: '202d56bb', fr: '9eab5081' });
  });
  it('every barista sentence of the mission is a line of the conversation, word for word — no prompt the video does not say', () => {
    for (const lang of LANGS) {
      const npc = LOCKED[lang].filter((l) => l.startsWith('NPC')).map((l) => l.slice(5));
      for (const id of ['what-can-i-get', 'medium-or-large', 'milk-sugar', 'anything-to-eat', 'anything-else', 'cash-or-card', 'receipt', 'enjoy']) {
        expect(npc, `${lang} ${id}`).toContain(text(day(lang), `${lang}.reply.coffee.${id}`));
      }
    }
  });
});

describe('the coverage specification', () => {
  it('names the twenty-four meaningful chunks, each really in the frozen conversation', () => {
    expect(M03_CONCEPTS.map((c) => c.id)).toEqual([
      'good-morning', 'what-can-i-get', 'id-like', 'iced-coffee', 'please', 'sure', 'medium-or-large', 'medium', 'milk-sugar', 'milk', 'no-sugar', 'anything-to-eat',
      'croissant', 'great-choice', 'anything-else', 'thats-all', 'thanks', 'six-fifty', 'cash-or-card', 'card', 'receipt', 'yes', 'here-you-go', 'enjoy-day',
    ]);
    for (const lang of LANGS) for (const c of M03_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}: “${c.chunk[lang]}”`).toBe(true);
  });
  it('no video line is orphaned: the chunks account for every word of every line', () => {
    // Small joining words that carry no meaning of their own in these lines.
    const GLUE: Record<CoverageLang, string[]> = { en: ['an'], es: ['un'], fr: ['un'] };
    for (const lang of LANGS) {
      const known = new Set(M03_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')).concat(GLUE[lang]));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
});

describe('every meaningful chunk of the video is learned before the video', () => {
  for (const lang of LANGS) {
    it(`${lang}: all twenty-four are COVERED — three or more encounters, in different ways, never the conversation alone`, () => {
      for (const row of coverageOf(day(lang), lang, M03_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    });
  }
  it('the encounter counts, per chunk — the same in English, Spanish and French (EN "milk" is also the word of the barista’s question)', () => {
    const counts = (lang: CoverageLang): Record<string, string> => Object.fromEntries(coverageOf(day(lang), lang, M03_CONCEPTS).map((r) => [r.id, `${r.total} = meaning ${r.byKind.meaning} · listening ${r.byKind.listening} · retrieval ${r.byKind.retrieval} · context ${r.byKind.context}`]));
    // English "Milk" is both the answer's word and the question's ("Milk and sugar?"); in Spanish and
    // French the answer chunk is "Con leche" / "Avec du lait". Everything else is identical.
    const same = (lang: CoverageLang): Record<string, string> => ({ ...counts(lang), milk: '' });
    expect(same('es')).toEqual(same('en'));
    expect(same('fr')).toEqual(same('en'));
    expect(counts('en')).toMatchInlineSnapshot(`
      {
        "anything-else": "7 = meaning 2 · listening 2 · retrieval 1 · context 2",
        "anything-to-eat": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "card": "8 = meaning 2 · listening 2 · retrieval 3 · context 1",
        "cash-or-card": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "croissant": "9 = meaning 2 · listening 2 · retrieval 4 · context 1",
        "enjoy-day": "4 = meaning 2 · listening 1 · retrieval 0 · context 1",
        "good-morning": "7 = meaning 3 · listening 1 · retrieval 1 · context 2",
        "great-choice": "8 = meaning 3 · listening 2 · retrieval 1 · context 2",
        "here-you-go": "4 = meaning 2 · listening 1 · retrieval 0 · context 1",
        "iced-coffee": "10 = meaning 2 · listening 2 · retrieval 5 · context 1",
        "id-like": "9 = meaning 1 · listening 2 · retrieval 5 · context 1",
        "medium": "8 = meaning 2 · listening 2 · retrieval 3 · context 1",
        "medium-or-large": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "milk": "15 = meaning 4 · listening 4 · retrieval 5 · context 2",
        "milk-sugar": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "no-sugar": "10 = meaning 2 · listening 2 · retrieval 5 · context 1",
        "please": "27 = meaning 3 · listening 8 · retrieval 15 · context 1",
        "receipt": "8 = meaning 2 · listening 3 · retrieval 1 · context 2",
        "six-fifty": "9 = meaning 1 · listening 5 · retrieval 1 · context 2",
        "sure": "6 = meaning 2 · listening 1 · retrieval 1 · context 2",
        "thanks": "8 = meaning 1 · listening 2 · retrieval 4 · context 1",
        "thats-all": "8 = meaning 1 · listening 2 · retrieval 4 · context 1",
        "what-can-i-get": "6 = meaning 2 · listening 1 · retrieval 1 · context 2",
        "yes": "7 = meaning 2 · listening 0 · retrieval 4 · context 1",
      }
    `);
  });
  it('the barista-only lines are comprehension-covered (heard and understood), and never asked for as something to say', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const id of ['good-morning', 'sure', 'great-choice', 'here-you-go', 'enjoy-day']) {
        const c = M03_CONCEPTS.find((x) => x.id === id)!;
        expect(encounters(d, c.chunk[lang]).filter((e) => e.kind !== 'context').length, `${lang} ${id}`).toBeGreaterThanOrEqual(2);
      }
      const produced = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => strip(o.itemId)))), ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId))), ...stepsOf(d, 'tool').map((s) => strip(s.itemId))];
      for (const id of ['reply.coffee.good-morning', 'reply.coffee.sure', 'reply.coffee.great-choice', 'reply.coffee.enjoy']) expect(produced, `${lang} ${id}`).not.toContain(id);
    }
  });
  it('removing the café games is caught: without the boards, the configurator and the matches, chunks fall out of coverage', () => {
    const d = day('en');
    const without: BootcampDayContent = { ...d, steps: d.steps.filter((s) => s.kind !== 'visualMatch' && s.kind !== 'customize' && s.kind !== 'matchPairs' && s.kind !== 'replies') };
    expect(coverageOf(without, 'en', M03_CONCEPTS).filter((r) => !r.covered).map((r) => r.id)).toEqual(expect.arrayContaining(['sure', 'great-choice', 'here-you-go', 'enjoy-day']));
  });
});

describe('question → answer: the seven pairs of the order', () => {
  const PAIRS = [
    ['reply.coffee.what-can-i-get', 'phrase.coffee.iced-coffee'], ['reply.coffee.medium-or-large', 'phrase.coffee.medium'], ['reply.coffee.milk-sugar', 'phrase.coffee.no-sugar'],
    ['reply.coffee.anything-to-eat', 'phrase.coffee.croissant'], ['reply.coffee.anything-else', 'phrase.coffee.thats-all'], ['reply.coffee.cash-or-card', 'phrase.coffee.card'],
    ['reply.coffee.receipt', 'phrase.coffee.yes-please'],
  ];
  for (const lang of LANGS) {
    it(`${lang}: every pair is connected on a match board, and answered at speed against the barista's own line`, () => {
      const d = day(lang);
      const matched = stepsOf(d, 'matchPairs').flatMap((s) => s.pairs.filter((p) => !p.answerLabel).map((p) => [strip(p.promptItemId), strip(p.answerItemId)]));
      expect(matched).toEqual(PAIRS);
      const rush = stepsOf(d, 'quickReply').find((s) => s.challenge)!;
      expect(rush.rounds.map((r) => `NPC: ${r.npc!.en}`), lang).toEqual([0, 2, 4, 6, 8, 10, 12].map((i) => LOCKED[lang][i]));
      expect(rush.rounds.map((r) => strip(r.options.find((o) => o.correct)!.itemId))).toEqual(PAIRS.map((p) => p[1]));
      for (const r of rush.rounds) expect(r.options.filter((o) => o.correct), lang).toHaveLength(1);
    });
  }
  it('the opening "What can I get you?" is understood as "what would you like to order?" — a chunk, not word by word', () => {
    for (const lang of LANGS) {
      const opening = day(lang).items.find((i) => strip(i.id) === 'reply.coffee.what-can-i-get')!;
      expect(`NPC: ${opening.text}`).toBe(LOCKED[lang][0]);
      expect(opening.tip!.en).toMatch(/what would you like to order\?/);
      expect(stepsOf(day(lang), 'swipe')[0]!.itemIds.map(strip)).toContain('reply.coffee.what-can-i-get');
      // heard and answered before the conversation: the first Quick Reply round, and the first match pair
      const quick = stepsOf(day(lang), 'quickReply').find((s) => !s.challenge)!;
      expect(strip(quick.rounds[0]!.promptItemId)).toBe('reply.coffee.what-can-i-get');
      expect(coverageOf(day(lang), lang, M03_CONCEPTS).find((r) => r.id === 'what-can-i-get')!.byKind.listening).toBeGreaterThanOrEqual(1);
    }
  });
  it('"anything else?" → "that\'s all" is practised four ways: the order board, the match, the speed run and the conversation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const order = boards(d)[0]!;
      expect(order.rounds.map((r) => r.correct)).toEqual(expect.arrayContaining(['more', 'done']));
      expect(order.rounds.find((r) => r.correct === 'more')!.audio.en).toBe(line(lang, 8));
      expect(order.rounds.find((r) => r.correct === 'done')!.audio.en).toBe(line(lang, 9));
      expect(coverageOf(d, lang, M03_CONCEPTS).find((r) => r.id === 'thats-all')!.byKind.retrieval).toBeGreaterThanOrEqual(4);
    }
  });
  it('the learner\'s seven lines are each retrieved at least three times; the two longest are built from their pieces', () => {
    for (const lang of LANGS) {
      for (const id of ['id-like', 'iced-coffee', 'medium', 'no-sugar', 'croissant', 'thats-all', 'card', 'yes']) {
        expect(coverageOf(day(lang), lang, M03_CONCEPTS).find((r) => r.id === id)!.byKind.retrieval, `${lang} ${id}`).toBeGreaterThanOrEqual(3);
      }
      const d = day(lang);
      for (const r of stepsOf(d, 'sentenceBuilder')[0]!.rounds) expect(r.chunks.join(' '), lang).toBe(text(d, r.itemId));
    }
  });
});

const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url));
type Board = Extract<BootcampStep, { kind: 'visualMatch' }>;
/** What a round puts on screen: its own tiles (`show`), or the whole board. */
const shown = (b: Board, r: Board['rounds'][number]) => (r.show ? b.tiles.filter((t) => r.show!.includes(t.id)) : b.tiles);
const pic = (path: string | undefined): string => (path ?? '').replace(/^images\//, '');
const orderBoard = (d: BootcampDayContent): Board => boards(d).find((b) => b.tiles.some((t) => t.id === 'more') && !afterVideo(d).includes(b))!;
const priceBoard = (d: BootcampDayContent): Board => boards(d).find((b) => b.tiles.every((t) => t.id.startsWith('e')))!;
const cards = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);

describe('the café in approved pictures — one picture, one meaning', () => {
  /** meaning → the approved picture that shows it, everywhere in the mission (EN = ES = FR). */
  const MEANING: Record<string, string> = {
    iced: 'mission03/iced-coffee.jpg', hot: 'mission03/hot-coffee.jpg', medium: 'mission03/medium.jpg', large: 'mission03/large.jpg',
    croissant: 'mission03/croissant.jpg', muffin: 'mission03/muffin.jpg', more: 'mission03/anything-else.jpg', done: 'mission03/order-complete.jpg',
    receipt: 'mission03/receipt-question.jpg', 'milk-no-sugar': 'mission03/milk-no-sugar.jpg', 'milk-and-sugar': 'mission03/milk-and-sugar.jpg',
    bye: 'mission03/handoff-good-day.jpg', card: 'mission02/pay-card.jpg', cash: 'mission02/cash.jpg',
  };
  it('every picture tile of every board is an approved picture of its meaning — no emoji tile anywhere in the mission', () => {
    for (const lang of LANGS) for (const b of boards(day(lang))) for (const t of b.tiles) {
      if (t.label && !t.image) { expect(t.label, `${lang} price`).toMatch(/^€\d+\.\d\d$/); continue; } // prices are written, not drawn
      expect(t.emoji, `${lang} ${t.id}`).toBeUndefined();
      expect(pic(t.image), `${lang} ${t.id}`).toBe(MEANING[t.id]);
      expect(t.alt, `${lang} ${t.id}`).toBeTruthy();
    }
  });
  it('the same meaning is the same picture in every step — teaching cards, boards, matches, the configurator and the final gate', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const byPicture = new Map<string, Set<string>>();
      const note = (path: string | undefined, meaning: string): void => { if (path) byPicture.set(pic(path), (byPicture.get(pic(path)) ?? new Set()).add(meaning)); };
      for (const b of boards(d)) for (const t of b.tiles) note(t.image, t.id);
      const CARD_MEANING: Record<string, string> = {
        'cafe.iced-coffee': 'iced', 'size.medium': 'medium', 'size.large': 'large', 'cafe.line.opening': 'opening', 'cafe.line.anything-else': 'more',
        'cafe.line.receipt': 'receipt', 'cafe.line.handoff': 'bye', 'cafe.line.medium': 'medium', 'cafe.line.milk-no-sugar': 'milk-no-sugar',
        'cafe.line.croissant': 'croissant', 'cafe.line.thats-all': 'done', 'cafe.line.card': 'card',
      };
      for (const w of cards(d)) if (w.image) note(w.image, CARD_MEANING[w.key!] ?? `?${w.key}`);
      for (const s of stepsOf(d, 'matchPairs')) for (const p of s.pairs) if (p.answerImage) note(p.answerImage, strip(p.answerItemId) === 'reply.coffee.enjoy' ? 'bye' : strip(p.answerItemId));
      note(stepsOf(d, 'customize')[0]!.base, 'iced');
      for (const [path, meanings] of byPicture) expect([...meanings], `${lang} ${path}`).toHaveLength(1);
      expect(byPicture.get('mission03/what-can-i-get.jpg')).toEqual(new Set(['opening']));
      expect(byPicture.get('mission03/good-morning.jpg')).toEqual(new Set(['reply.coffee.good-morning']));
    }
  });
  it('the distinctions are real: iced ≠ hot · M ≠ L · iced coffee ≠ milk-no-sugar ≠ milk-and-sugar · croissant ≠ order complete · receipt question ≠ anything else ≠ that\'s all', () => {
    const files = Object.values(MEANING);
    expect(new Set(files).size).toBe(files.length);
    for (const f of files) { expect(existsSync(PUBLIC + 'images/' + f), f).toBe(true); expect(statSync(PUBLIC + 'images/' + f).size, f).toBeGreaterThan(10_000); }
    // the generic "iced coffee" is the standalone glass — never a picture that also says milk / sugar
    for (const lang of LANGS) {
      expect(pic(tileOf(orderBoard(day(lang)), 'iced').image)).toBe('mission03/iced-coffee.jpg');
      expect(pic(cards(day(lang)).find((w) => w.key === 'cafe.iced-coffee')!.image)).toBe('mission03/iced-coffee.jpg');
    }
  });
  it('the Mission 03 folder holds exactly the fourteen approved pictures; card and cash are Mission 02\'s, reused, not copied', () => {
    const mine = readdirSync(PUBLIC + 'images/mission03').sort();
    expect(mine).toEqual(['anything-else.jpg', 'croissant.jpg', 'good-morning.jpg', 'handoff-good-day.jpg', 'hot-coffee.jpg', 'iced-coffee.jpg', 'large.jpg', 'medium.jpg',
      'milk-and-sugar.jpg', 'milk-no-sugar.jpg', 'muffin.jpg', 'order-complete.jpg', 'receipt-question.jpg', 'what-can-i-get.jpg']);
    const m02 = readdirSync(PUBLIC + 'images/mission02').map((f) => readFileSync(PUBLIC + 'images/mission02/' + f).toString('base64'));
    for (const f of mine) expect(m02, f).not.toContain(readFileSync(PUBLIC + 'images/mission03/' + f).toString('base64'));
  });
  it('no symbol stands in for a conversational meaning: no ✋ for "that\'s all", no ➕❓ for "anything else?", no lone 🧾 for the receipt QUESTION', () => {
    for (const lang of LANGS) {
      const json = JSON.stringify(boards(day(lang)));
      expect(json, lang).not.toMatch(/✋|➕|❓|👋|☀️/);
      expect(json, lang).not.toContain('"emoji":"🧾"');
    }
  });
  it('croissant and muffin are pictures of the same quality — the right answer never looks better than its contrast', () => {
    for (const lang of LANGS) for (const b of boards(day(lang))) for (const r of b.rounds) {
      const kinds = new Set(shown(b, r).map((t) => (t.image ? 'picture' : 'text')));
      expect(kinds.size, `${lang} ${r.audio.en}`).toBe(1);
    }
  });
});

describe('the café games', () => {
  it('the order board, moment by moment: each round shows the meaning beside ITS contrast — never a picture that could also be right', () => {
    for (const lang of LANGS) {
      const b = orderBoard(day(lang));
      expect(b.rounds.map((r) => [r.correct, r.show])).toEqual([
        ['iced', ['iced', 'hot']], ['medium', ['medium', 'large']], ['croissant', ['croissant', 'muffin']],
        ['more', ['more', 'done']], ['done', ['done', 'more']], ['card', ['card', 'cash']], ['receipt', ['receipt', 'more']],
      ]);
      expect(b.rounds.map((r) => r.audio.en)).toEqual([1, 3, 7, 8, 9, 11, 12].map((i) => line(lang, i)));
    }
  });
  it('"anything else?" and "that\'s all" are taught as a pair: the barista offering more vs the order complete', () => {
    const b = orderBoard(day('en'));
    expect([pic(tileOf(b, 'more').image), pic(tileOf(b, 'done').image)]).toEqual(['mission03/anything-else.jpg', 'mission03/order-complete.jpg']);
    expect(b.rounds.filter((r) => r.correct === 'more' || r.correct === 'done').every((r) => r.show!.includes('more') && r.show!.includes('done'))).toBe(true);
  });
  it('medium and large are a pair: the M cup and the larger L cup, always shown together', () => {
    const b = orderBoard(day('en'));
    expect([pic(tileOf(b, 'medium').image), pic(tileOf(b, 'large').image)]).toEqual(['mission03/medium.jpg', 'mission03/large.jpg']);
    for (const g of [b, gates(day('en'))[0]!]) expect(g.rounds.find((r) => r.correct === 'medium')!.show).toEqual(['medium', 'large']);
  });
  it('the milk & sugar configurator: "Milk, no sugar." is SET — milk ✓, sugar ✕, nothing pre-set — on the iced-coffee picture; one round only', () => {
    for (const lang of LANGS) {
      const c = stepsOf(day(lang), 'customize')[0]!;
      expect(pic(c.base)).toBe('mission03/iced-coffee.jpg');
      expect(c.options.map((o) => [o.id, o.emoji]), lang).toEqual([['milk', '🥛'], ['sugar', '🍬']]);
      expect(c.rounds.map((r) => [r.audio.en, r.on]), lang).toEqual([[line(lang, 5), ['milk']]]);
      // before it: milk, sugar, with, without (Step 0), the key sentence, and its picture card
      const d = day(lang);
      const at = d.steps.indexOf(c);
      const before = d.steps.slice(0, at);
      expect(before.some((s) => s.kind === 'tool' && strip(s.itemId) === 'phrase.coffee.no-sugar'), lang).toBe(true);
      expect(before.flatMap((s) => (s.kind === 'prime' ? s.words.map((w) => w.key) : []))).toEqual(expect.arrayContaining(['cafe.milk', 'cafe.sugar', 'core.with', 'core.without', 'cafe.line.milk-no-sugar']));
    }
    const ids = ['milk', 'sugar'];
    expect(customizeResult({}, ids, ['milk'])).toBe('unset');
    expect(customizeResult({ milk: true }, ids, ['milk'])).toBe('unset'); // "no sugar" must be chosen, not assumed
    expect(customizeResult({ milk: true, sugar: false }, ids, ['milk'])).toBe('right');
    expect(customizeResult({ milk: true, sugar: true }, ids, ['milk'])).toBe('wrong');
    expect(customizeResult({ milk: false, sugar: true }, ids, ['milk'])).toBe('wrong');
  });
  it('six fifty is TAUGHT, then earned: one tile (hear it, see €6.50) → two choices → three — never six', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const b = priceBoard(d);
      expect(b.rounds.map((r) => shown(b, r).map((t) => t.label))).toEqual([['€6.50'], ['€6.50', '€16.50'], ['€6.50', '€6.05', '€16.50']].map((x) => expect.arrayContaining(x)));
      expect(b.rounds.map((r) => shown(b, r).length)).toEqual([1, 2, 3]);
      expect(b.rounds.every((r) => r.correct === 'e6_50')).toBe(true);
      expect(b.rounds[0]!.audio.en).toBe({ en: "That'll be six fifty.", es: 'Son seis con cincuenta.', fr: 'Ça fait six euros cinquante.' }[lang]);
      expect(line(lang, 10).startsWith(b.rounds[0]!.audio.en.replace(/\.$/, ''))).toBe(true);
      // nowhere in the mission are more than three prices on screen at once
      for (const g of boards(d)) for (const r of g.rounds) expect(shown(g, r).filter((t) => t.id.startsWith('e')).length, lang).toBeLessThanOrEqual(3);
    }
  });
  it('your order, at a glance, before the conversation: drink, size, milk ✓ sugar ✕, croissant, €6.50, card, receipt', () => {
    const d = day('en');
    const summary = d.steps.findIndex((s) => s.kind === 'talk' && s.icon === '🧾');
    expect(summary).toBeGreaterThan(0);
    expect(summary).toBeLessThan(d.steps.findIndex((s) => s.kind === 'dialogue'));
  });
  it('"What can I get you?" is taught with its ordering picture before it is answered, before the speed run', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cardAt = d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'cafe.line.opening'));
      const card = cards(d).find((w) => w.key === 'cafe.line.opening')!;
      expect(card.text).toBe(line(lang, 0));
      expect(pic(card.image)).toBe('mission03/what-can-i-get.jpg');
      expect(card.meaning.en).toMatch(/what would you like to order\?/i);
      expect(cardAt).toBeLessThan(d.steps.findIndex((s) => s.kind === 'quickReply'));
      expect(cardAt).toBeLessThan(d.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge));
    }
  });
  it('the coach names the order board for what it is (not "the price")', () => {
    const steps = day('en').steps;
    expect(coachFor(steps, steps.findIndex((s) => s.kind === 'visualMatch'), 'coffee-shop')?.line.en).toBe('Listen — and tap what was ordered.');
    expect(coachFor(steps, steps.findIndex((s) => s.kind === 'customize'), 'coffee-shop')?.line.en).toBe('Hear the order — and set ✓ or ✕.');
  });
});

describe('the final gate: the video, then what you ordered and how you paid — with the pictures that taught it', () => {
  for (const lang of LANGS) {
    it(`${lang}: drink · size · milk / sugar · food · that's all, then price · card · receipt · goodbye — the conversation's own lines`, () => {
      const d = day(lang);
      expect(afterVideo(d).map((s) => s.kind)).toEqual(['visualMatch', 'visualMatch', 'receipt', 'summary']);
      const [order, pay] = gates(d);
      expect(order!.rounds.map((r) => [r.audio.en, r.correct, r.show])).toEqual([
        [line(lang, 1), 'iced', ['iced', 'hot']], [line(lang, 3), 'medium', ['medium', 'large']], [line(lang, 5), 'milk-no-sugar', ['milk-no-sugar', 'milk-and-sugar']],
        [line(lang, 7), 'croissant', ['croissant', 'muffin']], [line(lang, 9), 'done', ['done', 'more']],
      ]);
      expect(pay!.rounds.map((r) => [r.audio.en, r.correct, r.show])).toEqual([
        [{ en: "That'll be six fifty.", es: 'Son seis con cincuenta.', fr: 'Ça fait six euros cinquante.' }[lang], 'e6_50', ['e6_50', 'e16_50']],
        [line(lang, 11), 'card', ['card', 'cash']], [line(lang, 12), 'receipt', ['receipt', 'more']], [line(lang, 14), 'bye', ['bye', 'receipt']],
      ]);
      expect(stepsOf(d, 'quiz'), lang).toHaveLength(0); // nothing is checked by re-translating
    });
  }
  it('milk-no-sugar and milk-and-sugar are two different approved pictures, side by side', () => {
    const [order] = gates(day('en'));
    expect([pic(tileOf(order!, 'milk-no-sugar').image), pic(tileOf(order!, 'milk-and-sugar').image)]).toEqual(['mission03/milk-no-sugar.jpg', 'mission03/milk-and-sugar.jpg']);
  });
});

describe('the recovery-phrase rule: no prompt is invented to force "please repeat"', () => {
  it('no Quick Reply is answered with a help phrase, every prompt is a real line of the conversation, and there is no off-script ambush', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const npc = new Set(LOCKED[lang].filter((l) => l.startsWith('NPC')).map((l) => l.slice(5)));
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
        for (const o of r.options) expect(isHelpToolId(o.itemId), `${lang}: ${o.itemId}`).toBe(false);
        expect(r.situation, lang).toBeUndefined();
        expect(npc.has(r.npc?.en ?? text(d, r.promptItemId)), `${lang}: ${r.npc?.en ?? r.promptItemId}`).toBe(true);
      }
      expect(stepsOf(d, 'ambush'), lang).toHaveLength(0);
      expect(JSON.stringify(d.steps), lang).not.toMatch(/muffin à la place|muffin en su lugar|muffin be okay/);
    }
    const scene = day('en').dialogues['breakfast-order']!;
    expect(scene.nodes.flatMap((n) => n.choices ?? []).map((c) => strip(c.itemId)).filter((id) => id.startsWith('phrase.recovery.'))).toEqual(['phrase.recovery.one-moment', 'phrase.recovery.repeat', 'phrase.recovery.slowly', 'phrase.recovery.thank-you']);
  });
  it('"To go, please." is gone: not in the mission, not in its review, and no checkpoint offers it', () => {
    for (const lang of LANGS) {
      expect(day(lang).items.map((i) => strip(i.id)), lang).not.toContain('phrase.coffee.to-go');
      const everywhere = JSON.stringify(BOOTCAMP_PLAN.map((m) => MISSIONS_BY_LANG[lang]![m.day]!));
      expect(everywhere, lang).not.toMatch(/coffee\.(to-go|here-or-to-go|hot-or-iced)/);
    }
  });
});

describe('TEACH before TEST: nothing is tested that was not meaningfully prepared first', () => {
  const words = (s: string): string[] => plain(s).trim().split(' ').filter(Boolean);
  /**
   * Walk the mission in order, with a STRICT notion of "prepared" (the real-device rule): a line is
   * prepared only where its MEANING is shown — a building block or picture card (with its meaning),
   * a key sentence, a listening drill (its answer reveals the meaning), a meaning match, a review
   * card, the conversation (shown with its translation), or a ONE-tile teaching round. A picture
   * board with two or more choices, the configurator, a question ↔ answer match, a builder, a Quick
   * Reply, the speed run and the final checks are TESTS: they prepare nothing.
   */
  type Event = { at: number; text: string };
  const walk = (d: BootcampDayContent): { taught: Event[]; tested: (Event & { where: string })[] } => {
    const taught: Event[] = [];
    const tested: (Event & { where: string })[] = [];
    const teach = (at: number, t: string): void => { if (t) taught.push({ at, text: t }); };
    const test = (at: number, t: string, where: string): void => { if (t) tested.push({ at, text: t, where }); };
    d.steps.forEach((s, at) => {
      const where = `step ${at + 1} ${s.kind}`;
      if (s.kind === 'prime') { s.words.forEach((w) => teach(at, w.text)); if (s.buildFromItemId) teach(at, text(d, s.buildFromItemId)); }
      else if (s.kind === 'tool') teach(at, text(d, s.itemId));
      else if (s.kind === 'replies') s.replyIds.forEach((id) => teach(at, text(d, id)));
      else if (s.kind === 'swipe') s.itemIds.forEach((id) => teach(at, text(d, id)));
      else if (s.kind === 'dialogue') d.dialogues[s.dialogueId]!.nodes.forEach((n) => { teach(at, n.en); n.choices?.forEach((c) => teach(at, c.en)); });
      else if (s.kind === 'matchPairs') s.pairs.forEach((p) => { if (p.answerLabel) teach(at, text(d, p.promptItemId)); else { test(at, text(d, p.promptItemId), where); test(at, p.answerText ?? text(d, p.answerItemId), where); } });
      else if (s.kind === 'visualMatch') s.rounds.forEach((r) => { if (r.show?.length === 1) teach(at, r.audio.en); else test(at, r.audio.en, where); });
      else if (s.kind === 'customize') s.rounds.forEach((r) => test(at, r.audio.en, where));
      else if (s.kind === 'sentenceBuilder') s.rounds.forEach((r) => test(at, r.chunks.join(' '), where));
      else if (s.kind === 'quickReply') s.rounds.forEach((r) => { test(at, r.npc?.en ?? text(d, r.promptItemId), where); r.options.forEach((o) => test(at, o.text ?? text(d, o.itemId), where)); });
      else if (s.kind === 'quiz') test(at, text(d, s.itemId), where);
      else if (s.kind === 'ambush') test(at, s.npc.en, where);
    });
    return { taught, tested };
  };
  /** Words: every word of a tested line was in a line taught at an EARLIER step. */
  const unpreparedWords = (d: BootcampDayContent): string[] => {
    const { taught, tested } = walk(d);
    return tested.flatMap((t) => words(t.text).filter((w) => !taught.some((e) => e.at < t.at && words(e.text).includes(w))).map((w) => `${t.where}: “${w}” in “${t.text}”`));
  };
  /** Chunks: every meaningful chunk inside a tested line was itself in a line taught at an earlier step. */
  const unpreparedChunks = (d: BootcampDayContent, lang: CoverageLang): string[] => {
    const { taught, tested } = walk(d);
    const out: string[] = [];
    for (const t of tested) for (const c of M03_CONCEPTS) {
      if (!hasChunk(t.text, c.chunk[lang])) continue;
      if (!taught.some((e) => e.at < t.at && hasChunk(e.text, c.chunk[lang]))) out.push(`${t.where}: ${c.id} (“${c.chunk[lang]}”) in “${t.text}”`);
    }
    return out;
  };
  for (const lang of LANGS) {
    it(`${lang}: no tested line has a word that was not taught, with its meaning, earlier`, () => { expect(unpreparedWords(day(lang))).toEqual([]); });
    it(`${lang}: no tested line has a chunk of the conversation that was not taught, with its meaning, earlier`, () => { expect(unpreparedChunks(day(lang), lang)).toEqual([]); });
  }
  it('the audit has teeth: a board round no longer counts as teaching, and an unprepared line is caught', () => {
    const d = day('en');
    // Without the picture cards, the board would be testing "anything else?" and "that's all" cold.
    const noCards: BootcampDayContent = { ...d, steps: d.steps.filter((s) => !(s.kind === 'prime' && s.words.some((w) => w.line))) };
    expect(unpreparedChunks(noCards, 'en').join(' | ')).toMatch(/croissant|receipt|card/);
    // Without the one-tile teaching round, the price would be tested before it is taught — caught at the word level.
    const price = priceBoard(d);
    const noTeach: BootcampDayContent = { ...d, steps: d.steps.map((s) => (s === price ? { ...price, rounds: price.rounds.slice(1) } : s)) };
    expect(walk(noTeach).taught.some((e) => e.text === "That'll be six fifty.")).toBe(false);
    const sneaky = stepsOf(d, 'quickReply').find((s) => s.challenge)!;
    const bad: BootcampStep = { ...sneaky, rounds: [{ ...sneaky.rounds[0]!, npc: { en: 'Would you like oat milk instead?', he: 'x' } }] };
    expect(unpreparedWords({ ...d, steps: d.steps.map((s) => (s === sneaky ? bad : s)) }).join(' ')).toMatch(/“oat”.*|“instead”/);
  });
  it('every learner line goes TEACH → RECOGNISE → RETRIEVE → the conversation, in that order', () => {
    // [chunk, recognised on a picture board?] — "Yes, please." has no picture of its own: taught, then retrieved.
    const LINES: [string, boolean][] = [['iced-coffee', true], ['medium', true], ['no-sugar', true], ['croissant', true], ['thats-all', true], ['card', true], ['yes', false]];
    for (const lang of LANGS) {
      const d = day(lang);
      const { taught } = walk(d);
      const conversation = d.steps.findIndex((s) => s.kind === 'dialogue');
      for (const [id, pictured] of LINES) {
        const chunk = M03_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
        const teach = Math.min(...taught.filter((e) => hasChunk(e.text, chunk)).map((e) => e.at));
        const recognise = d.steps.findIndex((s) => (s.kind === 'visualMatch' && s.rounds.some((r) => (r.show?.length ?? 2) >= 2 && hasChunk(r.audio.en, chunk))) || (s.kind === 'customize' && s.rounds.some((r) => hasChunk(r.audio.en, chunk))));
        const retrieve = d.steps.findIndex((s) => (s.kind === 'matchPairs' && s.pairs.some((p) => !p.answerLabel && hasChunk(text(d, p.answerItemId), chunk))) || (s.kind === 'sentenceBuilder' && s.rounds.some((r) => hasChunk(r.chunks.join(' '), chunk))) || (s.kind === 'quickReply' && s.rounds.some((r) => r.options.some((o) => o.correct && hasChunk(text(d, o.itemId), chunk)))));
        expect(teach, `${lang} ${id} taught`).toBeLessThan(retrieve);
        if (pictured) { expect(teach, `${lang} ${id}`).toBeLessThan(recognise); expect(recognise, `${lang} ${id}`).toBeLessThan(retrieve); }
        expect(retrieve, `${lang} ${id}`).toBeLessThan(conversation);
      }
    }
  });
});

describe('the learning arc and the pacing', () => {
  it('Step 0 → key sentences → the barista in pictures → your answers in pictures → by ear → the order board → milk & sugar → the barista\'s words → ordering pairs → build → six fifty (taught, 2, 3) → finishing pairs → answer → your order → conversation → review → speed run → video → what you ordered / how you paid', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'quickReply' && s.challenge ? 'quickReply:speed' : s.kind === 'video' ? `video:${s.mode}` : s.kind === 'prime' && s.gate ? 'prime:step0' : s.kind === 'prime' && s.words.every((w) => w.line) ? 'prime:pictures' : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0', 'tool', 'tool', 'prime:pictures', 'prime:pictures', 'replies', 'receipt',
      'visualMatch', 'customize', 'matchPairs', 'matchPairs', 'sentenceBuilder', 'visualMatch', 'matchPairs', 'quickReply',
      'talk', 'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt',
      'video:again', 'visualMatch', 'visualMatch', 'receipt', 'summary',
    ]);
  });
  it('Step 0 is short (eight blocks), optional and about THIS order — cash, card and prices are Mission 02\'s, reactivated, not retaught', () => {
    for (const lang of LANGS) {
      const p = stepsOf(day(lang), 'prime')[0]!;
      expect(p.gate, lang).toBe(true);
      expect(p.words.map((w) => w.key), lang).toEqual(['cafe.iced-coffee', 'size.medium', 'size.large', 'cafe.milk', 'cafe.sugar', 'core.with', 'core.without', 'cafe.receipt']);
    }
    expect(stepsOf(day('es'), 'prime')[0]!.words.map((w) => w.text)).toEqual(['café con hielo', 'mediano', 'grande', 'leche', 'azúcar', 'con', 'sin', 'recibo']);
    expect(stepsOf(day('fr'), 'prime')[0]!.words.map((w) => w.text)).toEqual(['café glacé', 'moyen', 'grand', 'lait', 'sucre', 'avec', 'sans', 'ticket']);
    expect(stepsOf(day('en'), 'prime')[0]!.words.map((w) => w.text)).toEqual(['iced coffee', 'medium', 'large', 'milk', 'sugar', 'with', 'no', 'receipt']);
  });
  it('the picture cards are the conversation\'s own lines, word for word, each with its meaning', () => {
    for (const lang of LANGS) {
      const lines = stepsOf(day(lang), 'prime').filter((p) => p.words.every((w) => w.line)).flatMap((p) => p.words);
      expect(lines.map((w) => w.key)).toEqual(['cafe.line.opening', 'cafe.line.anything-else', 'cafe.line.receipt', 'cafe.line.handoff', 'cafe.line.medium', 'cafe.line.milk-no-sugar', 'cafe.line.croissant', 'cafe.line.thats-all', 'cafe.line.card', 'cafe.line.yes']);
      for (const w of lines) { expect(LOCKED[lang].map((l) => l.slice(5)), `${lang} ${w.key}`).toContain(w.text); expect(w.meaning.he && w.meaning.en).toBeTruthy(); }
    }
  });
  it('same journey in the three languages; every step is valid; the mission is still 49 quick questions — not one more', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.tiles, s.rounds.map((r) => [r.correct, strip(r.itemId), r.show])];
      if (s.kind === 'customize') return [s.kind, s.base, s.options, s.rounds.map((r) => [r.on, strip(r.itemId)])];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel, p.answerGloss, p.answerImage])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))]; // each language cuts its sentence its own way
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'tool') return [s.kind, strip(s.itemId)];
      if (s.kind === 'swipe') return [s.kind, s.itemIds.map(strip)];
      if (s.kind === 'prime') return [s.kind, s.gate, s.words.map((w) => [w.key, w.image, w.line])];
      return s;
    });
    for (const lang of LANGS) {
      const d = day(lang);
      if (lang !== 'en') expect(shape(d), lang).toEqual(shape(day('en')));
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      const questions = stepsOf(d, 'replies').reduce((k, s) => k + s.replyIds.length, 0) + stepsOf(d, 'quickReply').reduce((k, s) => k + s.rounds.length, 0)
        + stepsOf(d, 'visualMatch').reduce((k, s) => k + s.rounds.length, 0) + stepsOf(d, 'customize').reduce((k, s) => k + s.rounds.length, 0)
        + stepsOf(d, 'matchPairs').reduce((k, s) => k + s.pairs.length, 0) + stepsOf(d, 'sentenceBuilder').reduce((k, s) => k + s.rounds.length, 0);
      expect(questions, lang).toBe(49);
    }
  });
});

describe('the configurator on screen', () => {
  let steps: typeof StepsModule;
  beforeAll(async () => {
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    steps = await import('./PracticeSteps.js');
  });
  it('a cup, one row per add-in with a ✓ and a ✕ (nothing pre-set), and the check locked until every row is set', () => {
    const step = stepsOf(day('en'), 'customize')[0]!;
    const out = renderToStaticMarkup(createElement(steps.CustomizeStep, { step, onDone: () => undefined }));
    expect(out).toContain('data-engine="customize"');
    expect(out).toMatch(/<img class="pcup-img" src="[^"]*images\/mission03\/iced-coffee\.jpg"/);
    expect(out.match(/class="pcust-row /g)).toHaveLength(2);
    expect(out.match(/pcust-btn is-yes/g)).toHaveLength(2);
    expect(out.match(/pcust-btn is-no/g)).toHaveLength(2);
    expect(out).not.toContain('is-on'); // "no sugar" is a choice, not a default
    expect(out).toMatch(/<button class="btn-primary" disabled="">[^<]+<\/button>/);
    expect(out).not.toContain('Milk, no sugar.'); // the order is heard, not shown, until the check
  });
  it('the ✓ / ✕ buttons are big enough to tap (≥ 44px) and the cup animates only without reduced motion', () => {
    const css = readFileSync(fileURLToPath(new URL('../../app/styles.css', import.meta.url)), 'utf8');
    const btn = css.slice(css.indexOf('.pcust-btn {'), css.indexOf('}', css.indexOf('.pcust-btn {')));
    expect(Number(/height: (\d+)px/.exec(btn)![1])).toBeGreaterThanOrEqual(44);
    expect(Number(/width: (\d+)px/.exec(btn)![1])).toBeGreaterThanOrEqual(44);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ \.pcup-add \{ animation: none; \}/);
  });
});
