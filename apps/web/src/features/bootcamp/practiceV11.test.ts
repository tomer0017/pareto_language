import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN } from './plan.js';
import {
  builderHint, builderPool, builderSentence, builderSolved, matchAnswerOrder, matchRecord, matchSpeaks, matchTap, newMatch, retrievedItemIds,
  validatePracticeStep,
} from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampStep, MatchPair } from './types.js';
import type * as StepsModule from './PracticeSteps.js';
import type * as AppModule from '../../shared/stores/appStore.js';

/**
 * Practice V1.1: Match Pairs and Sentence Builder — the pure rules of each game, what the screens
 * render (direction, no translation before answering), and exactly where they sit in Missions 01–05.
 */
const LANGS = ['en', 'fr', 'es'] as const;
type Lang = (typeof LANGS)[number];
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const mission = (n: number, lang: Lang = 'en'): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const stepsOf = <K extends BootcampStep['kind']>(day: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] =>
  day.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const textOf = (day: BootcampDayContent, id: string): string => day.items.find((i) => i.id === id)!.text;
const HEBREW = /[֐-׿]/;
const PAIRS: MatchPair[] = [
  { promptItemId: 'q0', answerItemId: 'a0' }, { promptItemId: 'q1', answerItemId: 'a1' }, { promptItemId: 'q2', answerItemId: 'a2' },
];

describe('Match Pairs — rules', () => {
  it('a correct pair locks, whichever side is tapped first', () => {
    const first = matchTap(3, newMatch(), 'prompt', 0);
    expect(first.outcome).toBe('selected');
    expect(first.state.picked).toEqual({ side: 'prompt', pair: 0 });
    const hit = matchTap(3, first.state, 'answer', 0);
    expect(hit).toMatchObject({ outcome: 'matched', attempted: 0, complete: false });
    expect(hit.state).toEqual({ matched: [0], picked: null, misses: 0 });
    // answer first, then its question
    const other = matchTap(3, matchTap(3, hit.state, 'answer', 2).state, 'prompt', 2);
    expect(other.outcome).toBe('matched');
    expect(other.state.matched).toEqual([0, 2]);
  });

  it('a wrong pair does not lock: it is let go, costs nothing and can be retried', () => {
    const picked = matchTap(3, newMatch(), 'prompt', 0).state;
    const miss = matchTap(3, picked, 'answer', 1);
    expect(miss).toMatchObject({ outcome: 'missed', attempted: 0, complete: false });
    expect(miss.state).toEqual({ matched: [], picked: null, misses: 1 }); // nothing locked, no lives to lose
    const retry = matchTap(3, matchTap(3, miss.state, 'prompt', 0).state, 'answer', 0);
    expect(retry.outcome).toBe('matched');
  });

  it('tapping the same side again just changes the selection; a locked tile is dead', () => {
    const a = matchTap(3, newMatch(), 'prompt', 0).state;
    const b = matchTap(3, a, 'prompt', 1);
    expect(b.outcome).toBe('selected');
    expect(b.state.picked).toEqual({ side: 'prompt', pair: 1 });
    expect(b.state.misses).toBe(0);
    const locked = matchTap(3, b.state, 'answer', 1).state;
    expect(matchTap(3, locked, 'prompt', 1)).toMatchObject({ outcome: 'ignored', state: locked });
    expect(matchTap(3, locked, 'answer', 1).outcome).toBe('ignored');
  });

  it('the screen completes when — and only when — every pair is locked', () => {
    let state = newMatch();
    const done: boolean[] = [];
    for (const pair of [1, 0, 2]) {
      state = matchTap(3, state, 'prompt', pair).state;
      const hit = matchTap(3, state, 'answer', pair);
      state = hit.state;
      done.push(hit.complete);
    }
    expect(done).toEqual([false, false, true]);
    expect([...state.matched].sort()).toEqual([0, 1, 2]);
  });

  it('practice history: an attempt is recorded on the answer sentence of the question being answered; a selection is not', () => {
    const sel = matchTap(3, newMatch(), 'prompt', 0);
    expect(matchRecord(PAIRS, sel)).toBeNull();
    expect(matchRecord(PAIRS, matchTap(3, sel.state, 'answer', 0))).toEqual({ itemId: 'a0', outcome: 'pass' });
    expect(matchRecord(PAIRS, matchTap(3, sel.state, 'answer', 2))).toEqual({ itemId: 'a0', outcome: 'fail' });
    // answer picked first, then the wrong question: the miss belongs to that question's pair
    const ans = matchTap(3, newMatch(), 'answer', 1);
    expect(matchRecord(PAIRS, matchTap(3, ans.state, 'prompt', 2))).toEqual({ itemId: 'a2', outcome: 'fail' });
    expect(matchRecord(PAIRS, matchTap(3, { matched: [0], picked: null, misses: 0 }, 'prompt', 0))).toBeNull();
  });

  it('audio hook: selecting a question plays it, a locked pair plays the answer, nothing else makes a sound', () => {
    const q = matchTap(3, newMatch(), 'prompt', 0);
    expect(matchSpeaks(q, 'prompt')).toBe('prompt');
    expect(matchSpeaks(matchTap(3, newMatch(), 'answer', 0), 'answer')).toBeNull();
    expect(matchSpeaks(matchTap(3, q.state, 'answer', 0), 'answer')).toBe('answer');
    expect(matchSpeaks(matchTap(3, q.state, 'answer', 1), 'answer')).toBeNull();
  });

  it('answer tiles are a shuffled permutation, stable for a seed', () => {
    const orders = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const order = matchAnswerOrder(3, seed);
      expect([...order].sort()).toEqual([0, 1, 2]);
      expect(matchAnswerOrder(3, seed)).toEqual(order);
      orders.add(order.join(''));
    }
    expect(orders.size).toBeGreaterThan(2);
  });

  it('the validator catches broken pairs', () => {
    const ids = new Set(['q0', 'a0', 'q1', 'a1']);
    expect(validatePracticeStep({ kind: 'matchPairs', pairs: [PAIRS[0]!] }, ids)).toEqual(['matchPairs: needs 2–4 pairs']);
    expect(validatePracticeStep({ kind: 'matchPairs', pairs: PAIRS }, ids)).toHaveLength(2); // q2, a2 unknown
    expect(validatePracticeStep({ kind: 'matchPairs', pairs: [PAIRS[0]!, { promptItemId: 'q1', answerItemId: 'a0' }] }, ids)).toEqual(['matchPairs: an answer appears twice']);
  });
});

describe('Sentence Builder — rules', () => {
  const chunks = ["I'd like", 'an iced', 'coffee,', 'please.'];

  it('tiles are offered shuffled — never already in order', () => {
    for (let seed = 0; seed < 60; seed++) {
      const pool = builderPool(chunks, seed);
      expect([...pool].sort()).toEqual([0, 1, 2, 3]);
      expect(pool).not.toEqual([0, 1, 2, 3]);
      expect(builderPool(chunks, seed)).toEqual(pool);
    }
  });

  it('the right order is accepted; anything else is not, and the learner can try again', () => {
    expect(builderSolved(chunks, [0, 1, 2, 3])).toBe(true);
    expect(builderSolved(chunks, [1, 0, 2, 3])).toBe(false);
    expect(builderSolved(chunks, [0, 1, 2])).toBe(false); // not every tile used
    // retry: take two tiles back (placed is just a list), place them again in order
    const wrong = [0, 2, 1, 3];
    const takenBack = wrong.filter((_, k) => k !== 1 && k !== 2);
    expect(takenBack).toEqual([0, 3]);
    expect(builderSolved(chunks, [...takenBack.slice(0, 1), 1, 2, 3])).toBe(true);
  });

  it('two identical tiles are interchangeable (the sentence is compared as text)', () => {
    expect(builderSolved(['no', 'no', 'yes'], [1, 0, 2])).toBe(true);
  });

  it('the hint keeps what is already right from the start and places one more tile — never the whole answer at once', () => {
    expect(builderHint(chunks, [2, 0, 1, 3])).toEqual([0]);
    expect(builderHint(chunks, [0, 2, 1, 3])).toEqual([0, 1]);
    expect(builderHint(chunks, [0, 1, 3, 2])).toEqual([0, 1, 2]);
    expect(builderHint(chunks, [])).toEqual([0]);
  });

  it('the validator rejects chunks that do not spell the taught sentence exactly', () => {
    const ids = new Set(['s']);
    const text = (): string => "I'd like an iced coffee, please.";
    expect(validatePracticeStep({ kind: 'sentenceBuilder', rounds: [{ itemId: 's', chunks }] }, ids, text)).toEqual([]);
    expect(validatePracticeStep({ kind: 'sentenceBuilder', rounds: [{ itemId: 's', chunks: ["I'd like", 'a iced', 'coffee,', 'please.'] }] }, ids, text)).toHaveLength(1);
    expect(validatePracticeStep({ kind: 'sentenceBuilder', rounds: [{ itemId: 's', chunks: ['a', 'b'] }] }, ids)).toEqual(['sentenceBuilder round 1: needs 3–6 chunks']);
    expect(validatePracticeStep({ kind: 'sentenceBuilder', rounds: [{ itemId: 'x', chunks: ['a ', 'b', 'c'] }] }, ids)).toHaveLength(2);
  });
});

describe('authored content — every language has its own', () => {
  it('each builder round spells its mission sentence exactly, in 3–6 chunks, in English, French and Spanish', () => {
    for (const lang of LANGS) for (const n of [1, 2, 3, 4, 5]) {
      const day = mission(n, lang);
      for (const s of stepsOf(day, 'sentenceBuilder')) for (const r of s.rounds) {
        expect(builderSentence(r.chunks), `${lang} M0${n}`).toBe(textOf(day, r.itemId));
        expect(r.chunks.length, `${lang} M0${n}`).toBeGreaterThanOrEqual(3);
        expect(r.chunks.length, `${lang} M0${n}`).toBeLessThanOrEqual(6);
        for (let seed = 0; seed < 20; seed++) expect(builderSentence(r.chunks, builderPool(r.chunks, seed)), `${lang} M0${n}`).not.toBe(builderSentence(r.chunks));
      }
    }
  });

  it('French and Spanish chunks are authored, not English chunks translated one by one', () => {
    const rounds = (lang: Lang) => [2, 3].flatMap((n) => stepsOf(mission(n, lang), 'sentenceBuilder').flatMap((s) => s.rounds));
    const en = rounds('en');
    for (const lang of ['fr', 'es'] as const) {
      const other = rounds(lang);
      expect(other.map((r) => strip(r.itemId))).toEqual(en.map((r) => strip(r.itemId)));
      other.forEach((r, k) => { for (const c of r.chunks) expect(en[k]!.chunks, `${lang} “${c}”`).not.toContain(c); });
    }
    // The languages do not even cut the sentence in the same number of places.
    const noSugar = (lang: Lang) => rounds(lang).find((r) => strip(r.itemId) === 'phrase.coffee.no-sugar')!.chunks;
    expect(noSugar('en')).toEqual(['Milk,', 'no', 'sugar.']);
    expect(noSugar('fr')).toEqual(['Avec', 'du lait,', 'sans', 'sucre.']);
    expect(noSugar('es')).toEqual(['Con', 'leche,', 'sin', 'azúcar.']);
  });

  it('match and builder rounds count as active retrieval of their sentences', () => {
    const m1 = stepsOf(mission(1), 'matchPairs')[0]!;
    expect(retrievedItemIds(m1).map(strip)).toEqual(['phrase.social.my-name', 'phrase.social.from-israel', 'phrase.social.first-time']);
    expect(retrievedItemIds(stepsOf(mission(2), 'sentenceBuilder')[0]!).map(strip)).toEqual(['phrase.money.too-expensive']);
  });
});

describe('placement in Missions 01–05', () => {
  const count = (n: number, kind: BootcampStep['kind'], lang: Lang = 'en'): number => stepsOf(mission(n, lang), kind).length;

  it('Mission 01 has ONE question ↔ answer board with exactly the three intended pairs (and, since the Mission 01 gold-standard pass, a meaning match for the warm words after it)', () => {
    for (const lang of LANGS) {
      const day = mission(1, lang);
      const steps = stepsOf(day, 'matchPairs');
      expect(steps, lang).toHaveLength(2);
      expect(steps.filter((s) => s.pairs.every((p) => !p.answerLabel)), lang).toHaveLength(1); // one Q↔A board
      expect(steps[1]!.pairs.every((p) => p.answerLabel && p.answerGloss), lang).toBe(true); // the second is icon + words
      expect(steps[0]!.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId)]), lang).toEqual([
        ['reply.social.whats-your-name', 'phrase.social.my-name'],
        ['reply.social.where-from', 'phrase.social.from-israel'],
        ['reply.social.first-time-q', 'phrase.social.first-time'],
      ]);
      expect(validatePracticeStep(steps[0]!, new Set(day.items.map((i) => i.id))), lang).toEqual([]);
    }
    const shown = (lang: Lang): string[] => { const day = mission(1, lang); return stepsOf(day, 'matchPairs')[0]!.pairs.flatMap((p) => [textOf(day, p.promptItemId), p.answerText ?? textOf(day, p.answerItemId)]); };
    expect(shown('en')).toEqual(["What's your name?", "My name is Dan.", 'Where are you from?', "I'm from Israel.", 'Is this your first time here?', "Yes, it's my first time here."]);
    for (const lang of ['fr', 'es'] as const) for (const line of shown(lang)) expect(shown('en'), `${lang} “${line}”`).not.toContain(line);
  });

  it('the retired holiday / how-long sentences are not on the board, in any language', () => {
    for (const lang of LANGS) {
      const board = JSON.stringify(stepsOf(mission(1, lang), 'matchPairs'));
      expect(board, lang).not.toMatch(/here-on-holiday|how-long|holiday|How long|vacances|vacaciones|combien de temps|cuánto tiempo/i);
    }
  });

  it('Mission 01: the board comes after the sentences are met and before the conversation and the final challenge', () => {
    const steps = mission(1).steps;
    const at = steps.findIndex((s) => s.kind === 'matchPairs');
    const ids = stepsOf(mission(1), 'matchPairs')[0]!.pairs.flatMap((p) => [p.promptItemId, p.answerItemId]);
    const met = new Set<string>();
    steps.slice(0, at).forEach((s) => {
      if (s.kind === 'tool') met.add(s.itemId);
      if (s.kind === 'replies') s.replyIds.forEach((x) => met.add(x));
    });
    for (const id of ids) expect(met.has(id), id).toBe(true);
    expect(at).toBeLessThan(steps.findIndex((s) => s.kind === 'dialogue'));
    expect(at).toBeLessThan(steps.findIndex((s) => s.kind === 'ambush'));
    // Quick Reply asks all three questions (Mission 01 gold-standard pass: the name question is
    // paired on the board AND answered on its own — question → answer must become automatic).
    const quick = stepsOf(mission(1), 'quickReply')[0]!.rounds.map((r) => strip(r.promptItemId));
    expect(quick).toEqual(['reply.social.whats-your-name', 'reply.social.where-from', 'reply.social.first-time-q']);
  });

  it('Mission 01 builds its three answers; Mission 02 one sentence; Mission 03 two; Missions 04 and 05 none', () => {
    const rounds = (n: number): string[] => stepsOf(mission(n), 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId)));
    expect(rounds(1)).toEqual(['phrase.social.my-name', 'phrase.social.from-israel', 'phrase.social.first-time']);
    expect(rounds(2)).toEqual(['phrase.money.too-expensive']);
    expect(rounds(3)).toEqual(['phrase.coffee.iced-coffee', 'phrase.coffee.no-sugar']);
    expect(rounds(4)).toEqual([]);
    expect(rounds(5)).toEqual([]);
    for (const n of [2, 3, 4, 5]) expect(count(n, 'matchPairs'), `M0${n}`).toBe(0);
    for (const lang of LANGS) for (const n of [2, 3]) {
      const steps = mission(n, lang).steps;
      expect(steps.findIndex((s) => s.kind === 'sentenceBuilder'), `${lang} M0${n}`).toBeLessThan(steps.findIndex((s) => s.kind === 'dialogue'));
    }
  });
});

describe('what the screens render', () => {
  let ui: typeof StepsModule;
  let app: typeof AppModule;
  const render = (n: number, kind: 'matchPairs' | 'sentenceBuilder', lang: Lang): string => {
    app.useAppStore.setState({ learningLang: lang });
    const day = mission(n, lang);
    const step = stepsOf(day, kind)[0]!;
    const itemsById = new Map(day.items.map((i) => [i.id, i]));
    const Step = (kind === 'matchPairs' ? ui.MatchPairsStep : ui.SentenceBuilderStep) as (p: { step: BootcampStep; itemsById: typeof itemsById; onDone: () => void }) => JSX.Element;
    return renderToStaticMarkup(createElement(Step, { step, itemsById, onDone: () => undefined }));
  };
  const board = (html: string): string => html.slice(html.indexOf('class="pmatch"'), html.indexOf('</div>', html.indexOf('class="pmatch"')));

  beforeAll(async () => {
    const disk = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => void disk.set(k, v), removeItem: (k: string) => void disk.delete(k) });
    app = await import('../../shared/stores/appStore.js');
    ui = await import('./PracticeSteps.js');
    (await import('../../shared/i18n/strings.js')).setUiLangDict('he'); // the hard case: a right-to-left app around left-to-right content
  });

  it('Match Pairs under a Hebrew UI: six live tiles, laid out left-to-right, with no translation and nothing to continue to yet', () => {
    for (const lang of LANGS) {
      const html = render(1, 'matchPairs', lang);
      expect(HEBREW.test(html), lang).toBe(true); // the title is in the app language…
      const b = board(html);
      expect(b, lang).toContain('dir="ltr"');
      expect(HEBREW.test(b), lang).toBe(false); // …the board is target language only
      expect(b.match(/<button/g), lang).toHaveLength(6);
      expect(b, lang).not.toContain('disabled');
      expect(b.match(/<span dir="ltr">/g), lang).toHaveLength(6); // every sentence isolated left-to-right
      expect(html, lang).not.toContain('btn-primary'); // Continue only once every pair is locked
      for (const p of stepsOf(mission(1, lang), 'matchPairs')[0]!.pairs) expect(html.includes(textOf(mission(1, lang), p.promptItemId).replace(/'/g, '&#x27;')), lang).toBe(true);
    }
  });

  it('Sentence Builder under a Hebrew UI: the meaning is the cue, the tiles and the answer line are left-to-right, Check waits for every tile', () => {
    for (const lang of LANGS) {
      const day = mission(2, lang);
      const round = stepsOf(day, 'sentenceBuilder')[0]!.rounds[0]!;
      const html = render(2, 'sentenceBuilder', lang);
      expect(html, lang).toContain(day.items.find((i) => i.id === round.itemId)!.meaning.he);
      expect(html, lang).toContain(`class="pbuild-answer " dir="ltr" lang="${lang}"`);
      expect(html, lang).toContain('class="pbuild-pool" dir="ltr"');
      const pool = html.slice(html.indexOf('class="pbuild-pool"'), html.indexOf('</div>', html.indexOf('class="pbuild-pool"')));
      expect(pool.match(/<button/g), lang).toHaveLength(round.chunks.length);
      expect(HEBREW.test(pool), lang).toBe(false);
      expect(html, lang).not.toContain(builderSentence(round.chunks).replace(/'/g, '&#x27;')); // the solution is not on screen
      expect(html, lang).toMatch(/<button class="btn-primary" disabled="">/); // Check is locked until all tiles are placed
    }
  });

  it('the new screens respect reduced motion and keep 44px touch targets', () => {
    const css = readFileSync(fileURLToPath(new URL('../../app/styles.css', import.meta.url)), 'utf8');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ \.pmatch-tile\.is-miss, \.pbuild-answer\.is-bad \{ animation: none; \} \}/);
    const rule = (sel: string): string => css.slice(css.indexOf(`${sel} {`), css.indexOf('}', css.indexOf(`${sel} {`)));
    for (const sel of ['.pmatch-tile', '.pchip']) {
      const px = Number(/min-height: (\d+)px/.exec(rule(sel))?.[1]);
      expect(px, sel).toBeGreaterThanOrEqual(44);
    }
    for (const sel of ['.pmatch', '.pbuild-answer', '.pbuild-pool']) expect(rule(sel), sel).toMatch(/direction: ltr;[^}]*unicode-bidi: isolate/);
  });
});
