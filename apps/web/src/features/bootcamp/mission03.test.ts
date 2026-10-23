import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
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
        "anything-else": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "anything-to-eat": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "card": "6 = meaning 1 · listening 1 · retrieval 3 · context 1",
        "cash-or-card": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "croissant": "8 = meaning 1 · listening 2 · retrieval 4 · context 1",
        "enjoy-day": "4 = meaning 1 · listening 2 · retrieval 0 · context 1",
        "good-morning": "6 = meaning 2 · listening 1 · retrieval 1 · context 2",
        "great-choice": "7 = meaning 2 · listening 2 · retrieval 1 · context 2",
        "here-you-go": "4 = meaning 1 · listening 2 · retrieval 0 · context 1",
        "iced-coffee": "10 = meaning 2 · listening 2 · retrieval 5 · context 1",
        "id-like": "9 = meaning 1 · listening 2 · retrieval 5 · context 1",
        "medium": "7 = meaning 1 · listening 2 · retrieval 3 · context 1",
        "medium-or-large": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "milk": "15 = meaning 3 · listening 5 · retrieval 5 · context 2",
        "milk-sugar": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "no-sugar": "9 = meaning 1 · listening 2 · retrieval 5 · context 1",
        "please": "25 = meaning 2 · listening 7 · retrieval 15 · context 1",
        "receipt": "7 = meaning 1 · listening 3 · retrieval 1 · context 2",
        "six-fifty": "7 = meaning 1 · listening 3 · retrieval 1 · context 2",
        "sure": "6 = meaning 2 · listening 1 · retrieval 1 · context 2",
        "thanks": "8 = meaning 1 · listening 2 · retrieval 4 · context 1",
        "thats-all": "8 = meaning 1 · listening 2 · retrieval 4 · context 1",
        "what-can-i-get": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "yes": "6 = meaning 1 · listening 0 · retrieval 4 · context 1",
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

describe('the café games', () => {
  it('the order board: hear it → tap it, in the order it happens (drink · size · food · anything else? · that\'s all · receipt)', () => {
    for (const lang of LANGS) {
      const b = boards(day(lang))[0]!;
      expect(b.tiles.map((t) => t.id), lang).toEqual(['iced', 'hot', 'medium', 'large', 'croissant', 'muffin', 'more', 'done', 'receipt']);
      expect(b.rounds.map((r) => r.correct)).toEqual(['iced', 'medium', 'croissant', 'more', 'done', 'receipt']);
      expect(b.rounds.map((r) => r.audio.en)).toEqual([1, 3, 7, 8, 9, 12].map((i) => line(lang, i)));
    }
  });
  it('medium and large are told apart by size: the same cup, the large one visibly bigger', () => {
    const b = boards(day('en'))[0]!;
    expect([tileOf(b, 'medium').emoji, tileOf(b, 'medium').label]).toEqual(['🥤', 'M']);
    expect([tileOf(b, 'large').emoji, tileOf(b, 'large').label]).toEqual(['🥤', 'L']);
    expect(tileOf(b, 'large').scale! / tileOf(b, 'medium').scale!).toBeGreaterThan(1.3);
  });
  it('the milk & sugar configurator: "Milk, no sugar." is SET — milk ✓, sugar ✕, nothing pre-set — then the pattern, swapped', () => {
    for (const lang of LANGS) {
      const c = stepsOf(day(lang), 'customize')[0]!;
      expect(c.options.map((o) => [o.id, o.emoji]), lang).toEqual([['milk', '🥛'], ['sugar', '🍬']]);
      expect(c.rounds[0]!.audio.en, lang).toBe(line(lang, 5));
      expect(c.rounds[0]!.on).toEqual(['milk']);
      expect(c.rounds[1]!.on).toEqual(['sugar']);
      expect(c.rounds[1]!.audio.en).toBe({ en: 'Sugar, no milk.', es: 'Con azúcar, sin leche.', fr: 'Avec du sucre, sans lait.' }[lang]);
    }
    const ids = ['milk', 'sugar'];
    expect(customizeResult({}, ids, ['milk'])).toBe('unset');
    expect(customizeResult({ milk: true }, ids, ['milk'])).toBe('unset'); // "no sugar" must be chosen, not assumed
    expect(customizeResult({ milk: true, sugar: false }, ids, ['milk'])).toBe('right');
    expect(customizeResult({ milk: true, sugar: true }, ids, ['milk'])).toBe('wrong');
    expect(customizeResult({ milk: false, sugar: true }, ids, ['milk'])).toBe('wrong');
  });
  it('six fifty by ear — Mission 02\'s skill, reactivated fast: two rounds, against €6.05, €16.50 and €60.50', () => {
    for (const lang of LANGS) {
      const price = boards(day(lang)).find((b) => b.tiles.some((t) => t.id === 'e6_05'))!;
      expect(price.tiles.map((t) => t.label)).toEqual(['€6.50', '€6.05', '€16.50', '€60.50', '€5.60', '€6']);
      expect(price.rounds.map((r) => r.correct)).toEqual(['e6_50', 'e16_50']);
      expect(price.rounds[0]!.audio.en, lang).toBe({ en: "That'll be six fifty.", es: 'Son seis con cincuenta.', fr: 'Ça fait six euros cinquante.' }[lang]);
      expect(line(lang, 10).startsWith(price.rounds[0]!.audio.en.replace(/\.$/, '')), lang).toBe(true);
    }
  });
  it('your order, at a glance, before the conversation: drink, size, milk ✓ sugar ✕, croissant, €6.50, card, receipt', () => {
    const d = day('en');
    const summary = d.steps.findIndex((s) => s.kind === 'talk' && s.icon === '🧾');
    expect(summary).toBeGreaterThan(0);
    expect(summary).toBeLessThan(d.steps.findIndex((s) => s.kind === 'dialogue'));
    const card = d.steps[summary] as Extract<BootcampStep, { kind: 'talk' }>;
    expect(card.body.map((b) => b.en).join(' | ')).toBe('☕🧊 Iced coffee · 🥤 medium (M) | 🥛 Milk ✓ · 🍬 sugar ✕ | 🥐 A croissant — ✋ and that’s all | 💶 €6.50 · 💳 by card · 🧾 receipt — yes');
  });
  it('one picture = one meaning: across every board of the mission, a picture always means the same thing, and no two meanings share a picture', () => {
    for (const lang of LANGS) {
      const byLook = new Map<string, string>();
      for (const b of boards(day(lang))) for (const t of b.tiles) {
        const look = `${t.emoji ?? ''}|${t.label ?? ''}`;
        expect(byLook.get(look) ?? t.id, `${lang} ${look}`).toBe(t.id);
        byLook.set(look, t.id);
      }
      const ids = [...byLook.values()];
      expect(new Set(ids).size, lang).toBe(ids.length);
    }
  });
  it('the coach names the order board for what it is (not "the price")', () => {
    const steps = day('en').steps;
    expect(coachFor(steps, steps.findIndex((s) => s.kind === 'visualMatch'), 'coffee-shop')?.line.en).toBe('Listen — and tap what was ordered.');
    expect(coachFor(steps, steps.findIndex((s) => s.kind === 'customize'), 'coffee-shop')?.line.en).toBe('Hear the order — and set ✓ or ✕.');
  });
});

describe('the final gate: the video, then what you ordered and how you paid — answered by tapping', () => {
  for (const lang of LANGS) {
    it(`${lang}: drink · size · milk / sugar · food · that's all, then price · card · receipt · goodbye — the conversation's own lines`, () => {
      const d = day(lang);
      expect(afterVideo(d).map((s) => s.kind)).toEqual(['visualMatch', 'visualMatch', 'receipt', 'summary']);
      const [order, pay] = gates(d);
      expect(order!.rounds.map((r) => [r.audio.en, r.correct])).toEqual([
        [line(lang, 1), 'iced'], [line(lang, 3), 'medium'], [line(lang, 5), 'milk-no-sugar'], [line(lang, 7), 'croissant'], [line(lang, 9), 'done'],
      ]);
      expect(pay!.rounds.map((r) => [r.audio.en, r.correct])).toEqual([
        [{ en: "That'll be six fifty.", es: 'Son seis con cincuenta.', fr: 'Ça fait six euros cinquante.' }[lang], 'e6_50'], [line(lang, 11), 'card'], [line(lang, 12), 'receipt'], [line(lang, 14), 'bye'],
      ]);
      expect(stepsOf(d, 'quiz'), lang).toHaveLength(0); // nothing is checked by re-translating
    });
  }
  it('each gate answer has its wrong reading beside it: hot vs iced, L vs M, sugar ✓ vs ✕, muffin vs croissant, €16.50 vs €6.50, cash vs card', () => {
    const [order, pay] = gates(day('en'));
    expect(order!.tiles.map((t) => t.id)).toEqual(['iced', 'hot', 'medium', 'large', 'milk-no-sugar', 'milk-and-sugar', 'croissant', 'muffin', 'done']);
    expect([tileOf(order!, 'milk-no-sugar').label, tileOf(order!, 'milk-and-sugar').label]).toEqual(['🥛✓ 🍬✕', '🥛✓ 🍬✓']);
    expect(pay!.tiles.map((t) => t.id)).toEqual(['e6_50', 'e16_50', 'cash', 'card', 'receipt', 'bye']);
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
    // Recovery keeps its natural home — inside the conversation, where the reason is shown.
    const scene = day('en').dialogues['breakfast-order']!;
    expect(scene.nodes.flatMap((n) => n.choices ?? []).map((c) => strip(c.itemId)).filter((id) => id.startsWith('phrase.recovery.'))).toEqual(['phrase.recovery.one-moment', 'phrase.recovery.repeat', 'phrase.recovery.slowly', 'phrase.recovery.thank-you']);
  });
});

describe('nothing unexplained: every target-language word the learner meets was prepared first', () => {
  const words = (s: string): string[] => plain(s).trim().split(' ').filter(Boolean);
  /**
   * Walk the mission in order (the Mission 02 rule). A word is PREPARED once the learner has met it
   * with its meaning: a building block, a key sentence, a listening-drill sentence (the answer card
   * shows the meaning), a match tile, a review card, a line of the conversation (shown with its
   * translation), or a board / configurator round before the video (it teaches by its picture and
   * shows the line after the tap). Lines that TEST — a Quick Reply prompt or answer, a speed round, a
   * sentence builder, the checks after the video — may use only words already prepared.
   */
  const unexplainedIn = (d: BootcampDayContent): string[] => {
    const known = new Set<string>();
    const learn = (s: string): void => { for (const w of words(s)) known.add(w); };
    const out: string[] = [];
    const test = (s: string, where: string): void => { for (const w of words(s)) if (!known.has(w)) out.push(`${where}: “${w}” in “${s}”`); };
    let after = false;
    d.steps.forEach((s, i) => {
      const at = `step ${i + 1} ${s.kind}`;
      if (s.kind === 'video' && s.mode === 'again') after = true;
      else if (s.kind === 'prime') { s.words.forEach((w) => learn(w.text)); if (s.buildFromItemId) learn(text(d, s.buildFromItemId)); }
      else if (s.kind === 'tool') learn(text(d, s.itemId));
      else if (s.kind === 'replies') s.replyIds.forEach((id) => learn(text(d, id)));
      else if (s.kind === 'swipe') s.itemIds.forEach((id) => learn(text(d, id)));
      else if (s.kind === 'matchPairs') s.pairs.forEach((p) => { learn(text(d, p.promptItemId)); learn(p.answerText ?? text(d, p.answerItemId)); });
      else if (s.kind === 'sentenceBuilder') s.rounds.forEach((r) => test(r.chunks.join(' '), at));
      else if (s.kind === 'dialogue') d.dialogues[s.dialogueId]!.nodes.forEach((n) => { if (n.en) learn(n.en); n.choices?.forEach((c) => learn(c.en)); });
      else if (s.kind === 'visualMatch') s.rounds.forEach((r) => { if (s.challenge || after) test(r.audio.en, at); else learn(r.audio.en); });
      else if (s.kind === 'customize') s.rounds.forEach((r) => { if (after) test(r.audio.en, at); else learn(r.audio.en); });
      else if (s.kind === 'quickReply') s.rounds.forEach((r) => { test(r.npc?.en ?? text(d, r.promptItemId), at); r.options.forEach((o) => test(o.text ?? text(d, o.itemId), at)); });
      else if (s.kind === 'quiz') test(text(d, s.itemId), at);
      else if (s.kind === 'ambush') test(s.npc.en, at);
    });
    return out;
  };
  for (const lang of LANGS) {
    it(`${lang}: no test line contains a word that was not prepared earlier in the mission`, () => {
      expect(unexplainedIn(day(lang))).toEqual([]);
    });
  }
  it('the audit has teeth: a speed round with an unprepared line is caught', () => {
    const d = day('en');
    const sneaky = stepsOf(d, 'quickReply').find((s) => s.challenge)!;
    const bad: BootcampStep = { ...sneaky, rounds: [{ ...sneaky.rounds[0]!, npc: { en: 'Would you like oat milk instead?', he: 'x' } }] };
    const probe: BootcampDayContent = { ...d, steps: d.steps.map((s) => (s === sneaky ? bad : s)) };
    expect(unexplainedIn(probe).join(' ')).toMatch(/“oat”/);
    expect(unexplainedIn(probe).join(' ')).toMatch(/“instead”/);
  });
});

describe('the learning arc and the pacing', () => {
  it('Step 0 → three key sentences → what the barista says → the order board → milk & sugar → the barista\'s words → ordering pairs → build → six fifty → finishing pairs → answer → your order → conversation → review → speed run → video → what you ordered / how you paid', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'quickReply' && s.challenge ? 'quickReply:speed' : s.kind === 'video' ? `video:${s.mode}` : s.kind === 'prime' && s.gate ? 'prime:step0' : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0', 'tool', 'tool', 'tool', 'replies', 'receipt',
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
  it('same journey in the three languages; every step is valid; the mission is 49 quick questions — most of them one tap', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.tiles, s.rounds.map((r) => [r.correct, strip(r.itemId)])];
      if (s.kind === 'customize') return [s.kind, s.base, s.options, s.rounds.map((r) => [r.on, strip(r.itemId)])];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel, p.answerGloss])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))]; // each language cuts its sentence its own way
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
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
    expect(out).toContain('class="pcup-base">☕🧊</span>');
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
