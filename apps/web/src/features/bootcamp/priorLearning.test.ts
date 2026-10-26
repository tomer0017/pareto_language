import { describe, expect, it } from 'vitest';
import type { CoverageLang } from './mission01Coverage.js';
import {
  auditWords, learnedBefore, MISSION_CONCEPTS, missionContent, missionWalk, teachingEncounters, unpreparedWords,
} from './priorLearning.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * SEEN BEFORE ≠ LEARNED BEFORE. Prior knowledge is built only from verified teaching: what an earlier
 * mission showed WITH ITS MEANING, and the chunks that pass its coverage rule — never from the
 * conversation alone, a distractor, or a test.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const dialogueWords = (d: BootcampDayContent): Set<string> => new Set(Object.values(d.dialogues).flatMap((dl) => dl.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)])).flatMap(auditWords));
/** Swap one mission's content for a modified copy — the rest of the journey as it is. */
const withMission = (n: number, change: (d: BootcampDayContent) => BootcampDayContent) => (lang: CoverageLang, m: number): BootcampDayContent => (m === n ? change(missionContent(lang, m)) : missionContent(lang, m));

describe('what does NOT count as learned before', () => {
  it('a word that only appears in an earlier conversation is not prior knowledge', () => {
    const ONLY_IN_A_CONVERSATION: Record<CoverageLang, [mission: number, word: string][]> = {
      en: [[1, 'likewise'], [2, 'friend'], [3, 'but'], [4, 'way']],
      es: [[1, 'igualmente'], [2, 'amigo'], [3, 'pero'], [4, 'camino']],
      fr: [[2, 'ami'], [3, 'mais'], [4, 'chemin']],
    };
    for (const lang of LANGS) {
      const prior = learnedBefore(lang, 5);
      for (const [m, w] of ONLY_IN_A_CONVERSATION[lang]) {
        expect(dialogueWords(missionContent(lang, m)).has(w), `${lang} “${w}” is in the Mission 0${m} conversation`).toBe(true);
        expect(prior.words.has(w), `${lang} “${w}” was only seen`).toBe(false);
      }
    }
  });
  it('a word met only inside a test is not prior knowledge (the Mission 02 price boards: “ten”, “fifteen”)', () => {
    for (const [lang, ws] of [['en', ['ten', 'fifteen']], ['es', ['diez', 'quince']], ['fr', ['dix', 'quinze']]] as const) {
      const tested = missionWalk(missionContent(lang, 2)).tested.flatMap((t) => auditWords(t.text));
      for (const w of ws) {
        expect(tested, `${lang} “${w}” is tested in Mission 02`).toContain(w);
        expect(teachingEncounters(missionContent(lang, 2)).some((e) => auditWords(e.text).includes(w)), `${lang} “${w}” never taught`).toBe(false);
        expect(learnedBefore(lang, 5).words.has(w), `${lang} “${w}”`).toBe(false);
      }
    }
  });
  it('a distractor does not count — a wrong Quick Reply option, a wrong conversation choice, a decoy board tile', () => {
    const planted = withMission(2, (d) => {
      const qr = d.steps.findIndex((s) => s.kind === 'quickReply');
      const vm = d.steps.findIndex((s) => s.kind === 'visualMatch');
      const steps = d.steps.map((s, i): BootcampStep => {
        if (i === qr && s.kind === 'quickReply') return { ...s, rounds: s.rounds.map((r, k) => (k === 0 ? { ...r, options: [...r.options, { itemId: r.options[0]!.itemId, text: 'A pineapple, please.', correct: false }] } : r)) };
        if (i === vm && s.kind === 'visualMatch') return { ...s, rounds: s.rounds.map((r, k) => (k === 0 ? { ...r, audio: { ...r.audio, en: `${r.audio.en} Umbrella.` } } : r)) };
        return s;
      });
      const [id, dl] = Object.entries(d.dialogues)[0]!;
      const node = dl.nodes.findIndex((n) => n.choices?.length);
      const nodes = dl.nodes.map((n, i) => (i === node ? { ...n, choices: [...n.choices!, { ...n.choices![0]!, en: 'Banana boat!', correct: false }] } : n));
      return { ...d, steps, dialogues: { ...d.dialogues, [id]: { ...dl, nodes } } };
    });
    // they are really in Mission 02 now…
    const d1 = planted('en', 2);
    expect(JSON.stringify(d1)).toContain('A pineapple, please.');
    expect(JSON.stringify(d1)).toContain('Umbrella.');
    expect(JSON.stringify(d1)).toContain('Banana boat!');
    // …and none of them is learned
    const prior = learnedBefore('en', 3, planted);
    for (const w of ['pineapple', 'umbrella', 'banana', 'boat']) expect(prior.words.has(w), w).toBe(false);
  });
  it('a test question teaches nothing — but the same line as a one-tile teaching round does', () => {
    const asTest = withMission(1, (d) => ({ ...d, steps: [...d.steps, { kind: 'visualMatch', tiles: [{ id: 'a', emoji: '☂️' }, { id: 'b', emoji: '🍍' }], rounds: [{ audio: { en: 'An umbrella.', he: 'מטרייה.' }, correct: 'a' }] } as BootcampStep] }));
    const asTeaching = withMission(1, (d) => ({ ...d, steps: [...d.steps, { kind: 'visualMatch', tiles: [{ id: 'a', emoji: '☂️' }, { id: 'b', emoji: '🍍' }], rounds: [{ audio: { en: 'An umbrella.', he: 'מטרייה.' }, correct: 'a', show: ['a'] }] } as BootcampStep] }));
    expect(learnedBefore('en', 2, asTest).words.has('umbrella')).toBe(false);
    expect(learnedBefore('en', 2, asTeaching).words.has('umbrella')).toBe(true);
  });
});

describe('what DOES count as learned before', () => {
  it('a chunk genuinely taught in an earlier mission — Mission 03’s croissant, taught on a card and covered — is prior knowledge for Mission 04', () => {
    for (const [lang, w] of [['en', 'croissant'], ['es', 'cruasán'], ['fr', 'croissant']] as const) {
      const how = teachingEncounters(missionContent(lang, 3)).filter((e) => auditWords(e.text).includes(w)).map((e) => e.how);
      expect(how, lang).toContain('building block');
      const prior = learnedBefore(lang, 4);
      expect(prior.words.has(w), lang).toBe(true);
      expect(prior.concepts.map((c) => c.id), lang).toContain('m03:croissant');
      expect(prior.knowsChunk(w), lang).toBe(true);
    }
  });
  it('every word of every teaching encounter of Missions 01–04 is prior knowledge for Mission 05, and every covered concept is listed', () => {
    for (const lang of LANGS) {
      const prior = learnedBefore(lang, 5);
      expect(prior.missions).toEqual([1, 2, 3, 4]);
      for (const n of [1, 2, 3, 4]) for (const e of teachingEncounters(missionContent(lang, n))) for (const w of auditWords(e.text)) expect(prior.words.has(w), `${lang} M0${n} “${w}”`).toBe(true);
      // Missions 01–04 cover every chunk of their conversations, so every concept is verified
      expect(prior.concepts.length, lang).toBe([1, 2, 3, 4].reduce((k, n) => k + MISSION_CONCEPTS[n]!.length, 0));
    }
  });
  it('nothing comes from a later mission, and Mission 01 starts from nothing', () => {
    for (const lang of LANGS) {
      expect(learnedBefore(lang, 1).words.size).toBe(0);
      expect(learnedBefore(lang, 4).concepts.every((c) => c.mission < 4)).toBe(true);
      expect(learnedBefore(lang, 4).words.has(lang === 'en' ? 'station' : lang === 'es' ? 'estación' : 'gare')).toBe(false); // Mission 05's word
    }
  });
  it('compared with the old “anything seen” bag: words only seen are gone, and the only words added are ones taught on a card (or in a covered chunk) that the bag missed', () => {
    for (const lang of LANGS) {
      const seen = new Set<string>();
      for (const n of [1, 2, 3, 4]) { const d = missionContent(lang, n); d.items.forEach((i) => auditWords(i.text).forEach((w) => seen.add(w))); dialogueWords(d).forEach((w) => seen.add(w)); }
      const prior = learnedBefore(lang, 5);
      const cardWords = new Set([1, 2, 3, 4].flatMap((n) => teachingEncounters(missionContent(lang, n)).filter((e) => e.how === 'building block').flatMap((e) => auditWords(e.text)))
        .concat(prior.concepts.flatMap((c) => auditWords(c.chunk)))); // e.g. French “d'” — Mission 01’s covered “Je viens d'”
      const added = [...prior.words].filter((x) => !seen.has(x));
      for (const w of added) expect(cardWords.has(w), `${lang} “${w}” added without a card or covered chunk`).toBe(true);
      expect(added.length, `${lang}: ${added.join(', ')}`).toBeLessThanOrEqual(3);
      expect([...seen].filter((w) => !prior.words.has(w)).length, `${lang} words only seen are dropped`).toBeGreaterThanOrEqual(9);
    }
  });
});

describe('the strict audit, end to end', () => {
  it('Mission 05 passes the stricter audit in every language', () => {
    for (const lang of LANGS) expect(unpreparedWords(missionContent(lang, 5), learnedBefore(lang, 5).words), lang).toEqual([]);
  });
  it('Mission 04 passes it too', () => {
    for (const lang of LANGS) expect(unpreparedWords(missionContent(lang, 4), learnedBefore(lang, 4).words), lang).toEqual([]);
  });
  it('a planted unknown word is still caught', () => {
    const d = missionContent('en', 5);
    const at = d.steps.findIndex((s) => s.kind === 'quickReply');
    const qr = d.steps[at] as Extract<BootcampStep, { kind: 'quickReply' }>;
    const planted = { ...d, steps: d.steps.map((s, i) => (i === at ? { ...qr, rounds: [{ ...qr.rounds[0]!, situation: undefined, npc: { en: 'Take the roundabout.', he: 'x' } }] } : s)) };
    expect(unpreparedWords(planted, learnedBefore('en', 5).words).join(' ')).toMatch(/“roundabout”/);
  });
  it('remove a genuine earlier teaching exposure, and the later audit catches the word: no croissant card in Mission 03 → Mission 04’s croissant is unprepared', () => {
    for (const [lang, w] of [['en', 'croissant'], ['es', 'cruasán'], ['fr', 'croissant']] as const) {
      const noCroissantTaught = withMission(3, (d) => ({
        ...d,
        steps: d.steps.map((s): BootcampStep => {
          if (s.kind === 'prime') return { ...s, words: s.words.filter((x) => !auditWords(x.text).includes(w)) };
          if (s.kind === 'swipe') return { ...s, itemIds: s.itemIds.filter((id) => !auditWords(d.items.find((i) => i.id === id)?.text ?? '').includes(w)) };
          return s;
        }),
      }));
      const prior = learnedBefore(lang, 4, noCroissantTaught);
      expect(prior.words.has(w), `${lang} no longer learned`).toBe(false);
      expect(prior.concepts.map((c) => c.id), `${lang} no longer covered`).not.toContain('m03:croissant');
      expect(unpreparedWords(missionContent(lang, 4), prior.words).join(' '), lang).toContain(`“${w}”`);
    }
  });
});

describe('the content itself is untouched', () => {
  it('Missions 01–05 are byte-for-byte what they were (this pass changed the audit, not the missions)', () => {
    const print = (n: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(missionContent(l, n)))]));
    expect(print(1)).toEqual({ en: '63b23508', es: '4802a27c', fr: '4d41f68e' });
    expect(print(2)).toEqual({ en: '28382d4a', es: '202d56bb', fr: '9eab5081' });
    expect(print(3)).toEqual({ en: 'e97d7f7c', es: '8d64f857', fr: '7dcc6a5d' });
    expect(print(4)).toEqual({ en: '540b6d7c', es: 'b47c7bda', fr: 'c3eef94a' });
    expect(print(5)).toMatchInlineSnapshot(`
      {
        "en": "50fa4cd1",
        "es": "8d7d290d",
        "fr": "e539a4f6",
      }
    `);
  });
});
