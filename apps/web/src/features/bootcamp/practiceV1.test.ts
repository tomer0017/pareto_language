import { describe, expect, it } from 'vitest';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, validatePracticeStep } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Practice V1 (Missions 01–05). The engines' data is validated in every language, the mission-level
 * decisions are pinned, and Missions 06–30 are fingerprinted so this work provably did not touch them.
 */
const LANGS = ['en', 'fr', 'es'] as const;
type Lang = (typeof LANGS)[number];
const V1 = BOOTCAMP_PLAN.slice(0, 5);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const mission = (n: number, lang: Lang = 'en'): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const stepsOf = <K extends BootcampStep['kind']>(day: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] =>
  day.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (day: BootcampDayContent, id: string): string => day.items.find((i) => strip(i.id) === id)!.text;
/** Every sentence id a mission lets the learner actively pick: dialogue lines, quick replies, swap frames. */
function retrievable(day: BootcampDayContent): Set<string> {
  const ids = new Set<string>();
  for (const d of Object.values(day.dialogues)) for (const n of d.nodes) for (const c of n.choices ?? []) if (c.itemId) ids.add(strip(c.itemId));
  for (const s of stepsOf(day, 'quickReply')) for (const r of s.rounds) for (const o of r.options) ids.add(strip(o.itemId));
  for (const s of stepsOf(day, 'swap')) for (const r of s.rounds) if (r.itemId) ids.add(strip(r.itemId));
  return ids;
}
const reviewed = (day: BootcampDayContent): string[] => stepsOf(day, 'swipe').flatMap((s) => s.itemIds.map(strip));
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };

describe('scope: only Missions 01–05 changed', () => {
  it('Missions 06–30 are byte-for-byte what they were before Practice V1, in every language', () => {
    const print = (lang: Lang): string => fnv(JSON.stringify(BOOTCAMP_PLAN.slice(5).map((m) => MISSIONS_BY_LANG[lang]![m.day])));
    expect({ en: print('en'), fr: print('fr'), es: print('es') }).toEqual({ en: '4227f52a', fr: 'a9379644', es: 'b39863cd' });
  });

  it('mission order, ids and registry keys of 01–05 are unchanged', () => {
    expect(V1.map((m) => `${m.id}:${m.day}`)).toEqual(['introduce-myself:1', 'numbers-money:2', 'coffee-shop:3', 'everyday-core:30', 'directions:5']);
  });

  it('none of the new step types is used outside 01–05', () => {
    for (const lang of LANGS) for (const m of BOOTCAMP_PLAN.slice(5)) {
      for (const s of MISSIONS_BY_LANG[lang]![m.day]!.steps) {
        expect(['quickReply', 'visualMatch', 'swap', 'miniMap', 'matchPairs', 'sentenceBuilder'], `${lang} ${m.id}`).not.toContain(s.kind);
        if (s.kind === 'ambush') expect(s.mode, `${lang} ${m.id}`).toBeUndefined();
      }
    }
  });
});

describe('the engines: authored content is well-formed in every language', () => {
  for (const lang of LANGS) {
    it(`${lang}: every Quick Reply / Visual Match / Swap It / Mini Map step validates`, () => {
      for (const m of V1) {
        const day = MISSIONS_BY_LANG[lang]![m.day]!;
        const ids = new Set(day.items.map((i) => i.id));
        const textOf = (id: string): string | undefined => day.items.find((i) => i.id === id)?.text;
        for (const s of day.steps) expect(validatePracticeStep(s, ids, textOf), `${lang} ${m.id} ${s.kind}`).toEqual([]);
      }
    });
  }

  it('the validator really catches broken content', () => {
    const ids = new Set(['en.a', 'en.b']);
    expect(validatePracticeStep({ kind: 'quickReply', rounds: [{ situation: { he: 'x', en: 'x' }, options: [{ itemId: 'en.a', correct: false }, { itemId: 'en.zzz', correct: false }] }] }, ids)).toHaveLength(2);
    expect(validatePracticeStep({ kind: 'visualMatch', tiles: [{ id: 't1', label: '€5' }, { id: 't2', label: '€5' }], rounds: [{ audio: { en: 'Five', he: 'חמש' }, correct: 't9' }] }, ids)).toHaveLength(2);
    expect(validatePracticeStep({ kind: 'swap', rounds: [{ frame: 'I need.', cue: { text: { he: 'x', en: 'x' } }, options: [{ slot: 'a', meaning: { he: 'x', en: 'x' }, correct: true }, { slot: 'b', meaning: { he: 'x', en: 'x' }, correct: true }] }] }, ids)).toHaveLength(2);
    expect(validatePracticeStep({ kind: 'miniMap', rounds: [{ audio: { en: 'Go', he: 'לך' }, correct: 'x', cells: [{ id: 'a', row: 0, col: 0, tappable: true }] }] }, ids)).toHaveLength(2);
  });

  it('every step has the same rounds, options and accepted answers in English, French and Spanish', () => {
    const shape = (s: BootcampStep): unknown => {
      if (s.kind === 'quickReply') return s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), Boolean(r.situation), r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])]);
      if (s.kind === 'visualMatch') return [s.tiles, s.challenge ?? false, s.rounds.map((r) => [r.correct, strip(r.itemId)])];
      if (s.kind === 'swap') return s.rounds.map((r) => [strip(r.itemId), r.cue, r.options.map((o) => [o.correct, o.meaning])]);
      if (s.kind === 'miniMap') return [s.challenge ?? false, s.rounds.map((r) => [r.correct, strip(r.itemId), r.cells.map((c) => [c.id, c.row, c.col, c.emoji, c.tappable ?? false])])];
      if (s.kind === 'matchPairs') return s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), Boolean(p.answerText)]);
      // A sentence is chunked per language, so only WHICH sentences are built must agree.
      if (s.kind === 'sentenceBuilder') return s.rounds.map((r) => strip(r.itemId));
      if (s.kind === 'ambush') return [s.mode, strip(s.correctItemId), strip(s.wrongItemId)];
      return s.kind;
    };
    for (const m of V1) for (const lang of ['fr', 'es'] as const) {
      expect(MISSIONS_BY_LANG[lang]![m.day]!.steps.map(shape), `${lang} ${m.id}`).toEqual(MISSIONS_BY_LANG.en![m.day]!.steps.map(shape));
    }
  });

  it('no line of a new step leaks English into French or Spanish', () => {
    for (const m of V1) for (const lang of ['fr', 'es'] as const) {
      const en = MISSIONS_BY_LANG.en![m.day]!.steps;
      MISSIONS_BY_LANG[lang]![m.day]!.steps.forEach((s, i) => {
        const ref = en[i]!;
        if (s.kind === 'swap' && ref.kind === 'swap') s.rounds.forEach((r, k) => expect(r.frame, `${lang} ${m.id}`).not.toBe(ref.rounds[k]!.frame));
        if (s.kind === 'miniMap' && ref.kind === 'miniMap') s.rounds.forEach((r, k) => expect(r.audio.en, `${lang} ${m.id}`).not.toBe(ref.rounds[k]!.audio.en));
        if (s.kind === 'visualMatch' && ref.kind === 'visualMatch') s.rounds.forEach((r, k) => expect(r.audio.en, `${lang} ${m.id}`).not.toBe(ref.rounds[k]!.audio.en));
      });
    }
  });
});

describe('recovery ambush vs speed challenge', () => {
  it('a recovery ambush always accepts a real conversation-help tool; a speed challenge never offers one', () => {
    const isTool = (id: string): boolean => /\.phrase\.recovery\.(dont-understand|repeat|slowly|one-moment|show-me|what-mean)$/.test(id);
    for (const lang of LANGS) for (const m of BOOTCAMP_PLAN) {
      for (const s of stepsOf(MISSIONS_BY_LANG[lang]![m.day]!, 'ambush')) {
        if (s.mode === 'recovery') expect(isTool(s.correctItemId), `${lang} ${m.id}`).toBe(true);
        if (s.mode === 'speed') { expect(isTool(s.correctItemId), `${lang} ${m.id}`).toBe(false); expect(isTool(s.wrongItemId), `${lang} ${m.id}`).toBe(false); }
      }
    }
  });

  it('every mission of 01–05 ends on an honest final challenge', () => {
    const final = (n: number): string => {
      const day = mission(n);
      const s = [...day.steps].reverse().find((x) => x.kind === 'ambush' || ((x.kind === 'visualMatch' || x.kind === 'miniMap') && x.challenge))!;
      return s.kind === 'ambush' ? `ambush:${s.mode}` : `${s.kind}:speed`;
    };
    expect([1, 2, 3, 4, 5].map(final)).toEqual(['ambush:recovery', 'visualMatch:speed', 'ambush:recovery', 'ambush:speed', 'miniMap:speed']);
  });
});

describe('Mission 01 — Introduce Myself', () => {
  const day = mission(1);
  it('no longer teaches or drills "I\'m here on holiday." or "How long are you staying?"', () => {
    for (const lang of LANGS) {
      const all = JSON.stringify(mission(1, lang));
      expect(all, lang).not.toMatch(/here-on-holiday|social\.how-long/);
    }
    expect(JSON.stringify(day)).not.toMatch(/on holiday|How long are you staying/);
  });
  it('Quick Reply maps "Where are you from?" → "I\'m from Israel."', () => {
    const round = stepsOf(day, 'quickReply')[0]!.rounds.find((r) => strip(r.promptItemId) === 'reply.social.where-from')!;
    expect(text(day, 'reply.social.where-from')).toBe('Where are you from?');
    expect(round.options.filter((o) => o.correct).map((o) => text(day, strip(o.itemId)))).toEqual(["I'm from Israel."]);
  });
  it('the first-time question accepts only the first-time answer (or a help tool)', () => {
    const c3 = day.dialogues['meeting-host']!.nodes.find((n) => n.id === 'c3')!;
    expect(c3.choices!.map((c) => strip(c.itemId))).toEqual(['phrase.social.first-time', 'phrase.recovery.slowly']);
  });
  it('the word intro builds no fake sentence; the review is short; the finale is a true recovery ambush', () => {
    expect(stepsOf(day, 'prime')[0]!.buildFromItemId).toBeUndefined();
    expect(reviewed(day).length).toBeLessThanOrEqual(10);
    expect(reviewed(day)).toContain('phrase.recovery.repeat');
    expect(strip(stepsOf(day, 'ambush')[0]!.correctItemId)).toBe('phrase.recovery.repeat');
  });
});

describe('Mission 02 — Numbers & Money', () => {
  const day = mission(2);
  it('Visual Match accepts the tile that shows the spoken price', () => {
    const [board, finale] = stepsOf(day, 'visualMatch');
    const label = (s: typeof board, id: string): string => s!.tiles.find((t) => t.id === id)!.label!;
    expect(board!.tiles).toHaveLength(9);
    expect(board!.rounds.map((r) => [r.audio.en, label(board, r.correct)])).toEqual([
      ["That's five euros.", '€5'], ['Twenty euros, please.', '€20'], ['Eight euros.', '€8'], ["That'll be ten euros.", '€10'], ['Fifteen fifty.', '€15.50'],
    ]);
    expect(finale!.challenge).toBe(true);
    expect(label(finale, finale!.rounds[0]!.correct)).toBe('€15.50');
    expect(stepsOf(day, 'ambush')).toHaveLength(0); // the fast price is a speed challenge, not "use a tool"
  });
  it('"That\'s too expensive." and "One box, please." are actively retrieved', () => {
    expect(retrievable(day).has('phrase.money.too-expensive')).toBe(true);
    expect(retrievable(day).has('phrase.money.one-box')).toBe(true);
    for (const lang of LANGS) {
      const picks = mission(2, lang).dialogues['market-stall']!.nodes.flatMap((n) => n.choices ?? []).filter((c) => strip(c.itemId) === 'phrase.money.one-box');
      expect(picks.length, lang).toBe(2);
    }
  });
  it('no price is tested twice through an equivalent translation quiz', () => {
    const replies = stepsOf(day, 'replies').flatMap((s) => s.replyIds);
    for (const quiz of stepsOf(day, 'quiz')) expect(replies).not.toContain(quiz.itemId);
  });
});

describe('Mission 03 — Coffee Shop', () => {
  const day = mission(3);
  it('"To go, please." is actively retrieved', () => {
    expect(retrievable(day).has('phrase.coffee.to-go')).toBe(true);
  });
  it('Coffee Rush uses only sentences the mission already taught', () => {
    const rush = stepsOf(day, 'quickReply')[0]!;
    const ids = new Set(day.items.map((i) => i.id));
    expect(rush.rounds.length).toBeGreaterThanOrEqual(5);
    for (const r of rush.rounds) {
      expect(ids.has(r.promptItemId!)).toBe(true);
      for (const o of r.options) expect(ids.has(o.itemId)).toBe(true);
    }
    expect(day.steps.findIndex((s) => s.kind === 'replies')).toBeLessThan(day.steps.indexOf(rush)); // after the replies were learned
    expect(day.steps.indexOf(rush)).toBeLessThan(day.steps.findIndex((s) => s.kind === 'dialogue'));
  });
  it('"Medium, please." and "Yes, please." are tracked sentences; the wrong "Thank you!" branch is not', () => {
    const picks = day.dialogues['breakfast-order']!.nodes.flatMap((n) => n.choices ?? []);
    expect(picks.filter((c) => c.en === 'Medium, please.').every((c) => strip(c.itemId) === 'phrase.coffee.medium')).toBe(true);
    expect(picks.find((c) => c.en === 'Yes, please.')!.itemId).toBe('en.phrase.coffee.yes-please');
    expect(picks.find((c) => !c.correct)!.itemId).toBeUndefined();
  });
});

describe('Mission 04 — Everyday Core', () => {
  const day = mission(4);
  it('Swap It builds valid sentences from authored frames and values, in every language', () => {
    for (const lang of LANGS) {
      const swap = stepsOf(mission(4, lang), 'swap')[0]!;
      expect(swap.rounds.length).toBeGreaterThanOrEqual(6);
      for (const r of swap.rounds) for (const o of r.options) {
        const sentence = fillFrame(r.frame, o.slot);
        expect(sentence, lang).not.toContain('___');
        expect(sentence.startsWith(r.frame.split('___')[0]!), lang).toBe(true);
        expect(sentence, lang).not.toMatch(/\s{2}| \.|à le |a el |de le /);
      }
    }
    const frames = stepsOf(day, 'swap')[0]!.rounds.map((r) => r.frame);
    for (const f of ['I need ___.', 'I have ___.', "I don't have ___.", 'I want ___.', 'I can ___.', "I can't ___."]) expect(frames).toContain(f);
    expect(fillFrame('I need ___.', 'water')).toBe('I need water.');
  });
  it('the "Do you know…" practice sentence is the dialogue\'s own wording', () => {
    for (const lang of LANGS) {
      const d = mission(4, lang);
      const line = d.dialogues['coffee-with-a-friend']!.nodes.map((n) => n.en);
      expect(line, lang).toContain(text(d, 'reply.core.do-you-know'));
    }
    expect(text(day, 'reply.core.do-you-know')).toBe('Do you know how to get to the centre?');
  });
  it('"Yes, I know." and "Can you help me?" are actively retrieved, and no translation quiz remains', () => {
    expect(retrievable(day).has('phrase.core.i-know')).toBe(true);
    expect(retrievable(day).has('phrase.core.can-you-help')).toBe(true);
    expect(stepsOf(day, 'quiz')).toHaveLength(0);
  });
});

describe('Mission 05 — Directions', () => {
  const day = mission(5);
  it('"Where is the station?" is actively retrieved before the dialogue', () => {
    const round = stepsOf(day, 'quickReply')[0]!.rounds[0]!;
    expect(round.situation).toBeDefined();
    const accepted = round.options.find((o) => o.correct)!;
    expect(strip(accepted.itemId)).toBe('phrase.dir.where-is');
    expect(accepted.text).toBe('Excuse me! Where is the station?');
    expect(day.steps.findIndex((s) => s.kind === 'quickReply')).toBeLessThan(day.steps.findIndex((s) => s.kind === 'dialogue'));
    expect(retrievable(day).has('phrase.dir.how-do-i-get')).toBe(true);
  });
  it('Mini Map tests direction meaning by acting on it — no translation is on the board', () => {
    const [map, finale] = stepsOf(day, 'miniMap');
    expect(map!.rounds.map((r) => [r.audio.en, r.correct])).toEqual([
      ['Go straight ahead.', 'straight'], ['Turn left at the corner.', 'left'], ["It's on the right.", 'right'], ["It's next to the bank.", 'left'],
    ]);
    for (const lang of LANGS) for (const s of stepsOf(mission(5, lang), 'miniMap')) for (const r of s.rounds) {
      // Tappable cells carry no words at all, and nothing on the board is Hebrew.
      for (const c of r.cells) {
        if (c.tappable) expect(c.label, lang).toBeUndefined();
        expect(`${c.label ?? ''}${c.emoji ?? ''}`, lang).not.toMatch(/[֐-׿]/);
      }
      expect(r.audio.he).toBeTruthy(); // the gloss exists — it is shown only after the tap
    }
    // "Next to the bank" has exactly one answer: only the accepted cell touches the bank.
    const bankRound = map!.rounds[3]!;
    const bank = bankRound.cells.find((c) => c.id === 'bank')!;
    const touching = bankRound.cells.filter((c) => c.tappable && Math.abs(c.row - bank.row) + Math.abs(c.col - bank.col) === 1).map((c) => c.id);
    expect(touching).toEqual([bankRound.correct]);
    expect(finale!.challenge).toBe(true);
    expect(finale!.rounds[0]!.audio.en).not.toMatch(/church|second|opposite|pharmacy/i);
  });
});

describe('selective review (01–05)', () => {
  it('each closing review is short, and lists only sentences and tools the mission actually uses', () => {
    for (const lang of LANGS) for (const [i, m] of V1.entries()) {
      const day = MISSIONS_BY_LANG[lang]![m.day]!;
      const list = reviewed(day);
      expect(list.length, `${lang} ${m.id}`).toBeLessThanOrEqual(14);
      expect(new Set(list).size).toBe(list.length);
      const offered = new Set(Object.values(day.dialogues).flatMap((d) => d.nodes.flatMap((n) => (n.choices ?? []).map((c) => strip(c.itemId)))));
      for (const s of stepsOf(day, 'quickReply')) for (const r of s.rounds) for (const o of r.options) offered.add(strip(o.itemId));
      for (const s of stepsOf(day, 'ambush')) offered.add(strip(s.correctItemId));
      for (const id of list.filter((x) => x.startsWith('phrase.recovery.'))) expect(offered.has(id), `${lang} M${i + 1} reviews unused tool ${id}`).toBe(true);
      // Every toolkit phrase bundled into the mission is one the learner can actually use in it.
      for (const it of day.items.filter((x) => x.id.includes('.phrase.recovery.'))) expect(offered.has(strip(it.id)), `${lang} M${i + 1} bundles unused ${it.id}`).toBe(true);
    }
  });

  it('every learner sentence of 01–05 has at least one active retrieval opportunity', () => {
    for (const [i, m] of V1.entries()) {
      const day = MISSIONS_BY_LANG.en![m.day]!;
      const can = retrievable(day);
      const never = day.items.map((x) => strip(x.id)).filter((id) => id.startsWith('phrase.') && !id.startsWith('phrase.recovery.') && !can.has(id));
      // "Excuse me!" is retrieved inside the wrapped line "Excuse me! Where is the station?".
      expect(never.filter((id) => id !== 'phrase.dir.excuse-me'), `Mission ${i + 1}`).toEqual([]);
    }
  });
});

describe('word-intro parity: languages are compared by concept key, not by position', () => {
  it('in 01–05 every primed word has a key, and the three languages prime the same concepts in the same order', () => {
    for (const m of V1) {
      const keys = (lang: Lang): string[][] => stepsOf(MISSIONS_BY_LANG[lang]![m.day]!, 'prime').map((s) => s.words.map((w) => w.key ?? '∅'));
      const shared = (lang: Lang): string[][] => keys(lang).map((list) => list.filter((k) => !k.startsWith(`${lang}.`)));
      for (const lang of LANGS) {
        expect(keys(lang).flat(), `${lang} ${m.id}`).not.toContain('∅');
        expect(shared(lang), `${lang} ${m.id}`).toEqual(shared('en'));
        // A language may add words only under its own prefix (French 70 / 80).
        for (const k of keys(lang).flat()) if (/^(en|fr|es)\./.test(k)) expect(k.startsWith(`${lang}.`), k).toBe(true);
      }
    }
  });

  it('the same key carries the same meaning in every language', () => {
    for (const m of V1) {
      const en = stepsOf(MISSIONS_BY_LANG.en![m.day]!, 'prime').flatMap((s) => s.words);
      for (const lang of ['fr', 'es'] as const) {
        for (const w of stepsOf(MISSIONS_BY_LANG[lang]![m.day]!, 'prime').flatMap((s) => s.words)) {
          const ref = en.find((x) => x.key === w.key);
          if (ref) expect(w.meaning, `${lang} ${w.key}`).toEqual(ref.meaning);
        }
      }
    }
  });
});
