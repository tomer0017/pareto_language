import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M04_CONCEPTS } from './mission04Coverage.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { fillFrame, validatePracticeStep } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { coachFor } from '../companion/companionCoach.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 04 — Everyday Core, on the Mission 01–03 standard — but a PATTERN mission: the learner
 * leaves with a small engine (want · need · have · know · can, and the flips don't have · don't know
 * · can't) shown working in two places. The two conversations are LOCKED; every meaningful chunk is
 * met in different ways, nothing is tested before it was TAUGHT (meaning shown), and the transfer
 * uses only words the learner already has.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const day = (lang: CoverageLang, n = 4): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[n - 1]!.day]!;
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((d) => cinematicTranscript(d)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
type Board = Extract<BootcampStep, { kind: 'visualMatch' }>;
const boards = (d: BootcampDayContent): Board[] => stepsOf(d, 'visualMatch');
const boardWith = (d: BootcampDayContent, tile: string): Board => boards(d).find((b) => b.tiles.some((t) => t.id === tile))!;
const afterVideo = (d: BootcampDayContent): BootcampStep[] => d.steps.slice(d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again') + 1);
const cards = (d: BootcampDayContent) => stepsOf(d, 'prime').filter((p) => p.words.every((w) => w.line));

const LOCKED: Record<CoverageLang, string[]> = {
  en: [
    'NPC: Hi! Do you need anything?', 'YOU: I need a towel.', 'NPC: Sure. Do you have your key?', 'YOU: Yes, I have my key.', 'NPC: And the wifi password?', "YOU: I don't have it.",
    "NPC: It's here.", 'YOU: Do you have a map?', 'NPC: Yes.', 'YOU: Can you show me?', 'NPC: Of course.',
    'NPC: Do you want a coffee?', 'YOU: Yes, I want a coffee.', 'NPC: Do you know how to get to the centre?', "YOU: I don't know.", "NPC: You can walk. It's about twenty minutes.",
    'YOU: I can walk.', "NPC: We're having dinner at seven. Can you come?", "YOU: Sorry, I can't.", 'NPC: No problem.',
  ],
  es: [
    'NPC: ¡Hola! ¿Necesita algo?', 'YOU: Necesito una toalla.', 'NPC: Claro. ¿Tiene su llave?', 'YOU: Sí, tengo mi llave.', 'NPC: ¿Y la contraseña del wifi?', 'YOU: No la tengo.',
    'NPC: Está aquí.', 'YOU: ¿Tiene un mapa?', 'NPC: Sí.', 'YOU: ¿Me lo puede mostrar?', 'NPC: Claro.',
    'NPC: ¿Quieres un café?', 'YOU: Sí, quiero un café.', 'NPC: ¿Sabes cómo ir al centro?', 'YOU: No lo sé.', 'NPC: Puedes ir a pie. Son unos veinte minutos.',
    'YOU: Puedo ir a pie.', 'NPC: Cenamos a las siete. ¿Puedes venir?', 'YOU: Lo siento, no puedo.', 'NPC: No pasa nada.',
  ],
  fr: [
    'NPC: Bonjour ! Vous avez besoin de quelque chose ?', 'YOU: J’ai besoin d’une serviette.', 'NPC: Bien sûr. Vous avez votre clé ?', 'YOU: Oui, j’ai ma clé.', 'NPC: Et le mot de passe du wifi ?', 'YOU: Je ne l’ai pas.',
    'NPC: Il est ici.', 'YOU: Vous avez une carte ?', 'NPC: Oui.', 'YOU: Vous pouvez me montrer ?', 'NPC: Bien sûr.',
    'NPC: Tu veux un café ?', 'YOU: Oui, je veux un café.', 'NPC: Tu sais comment aller au centre ?', 'YOU: Je ne sais pas.', 'NPC: Tu peux y aller à pied. C’est à environ vingt minutes.',
    'YOU: Je peux y aller à pied.', 'NPC: On dîne à sept heures. Tu peux venir ?', 'YOU: Désolé, je ne peux pas.', 'NPC: Pas de problème.',
  ],
};
const line = (lang: CoverageLang, i: number): string => LOCKED[lang][i]!.slice(5);

describe('the two conversations are locked', () => {
  for (const lang of LANGS) {
    it(`${lang}: both scenes, word for word the frozen ones`, () => { expect(script(lang)).toEqual(LOCKED[lang]); });
  }
  it('the dialogue trees are byte-for-byte what they were before this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual({ en: 'dc4db10f', es: '9899041a', fr: '9cf3dc60' });
    for (const lang of LANGS) expect(Object.keys(day(lang).dialogues), lang).toEqual(['hostel-desk', 'coffee-with-a-friend']);
  });
  it('Missions 01, 02 and 03 are byte-for-byte unchanged by this pass', () => {
    const print = (n: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l, n)))]));
    expect(print(1)).toEqual({ en: '63b23508', es: '4802a27c', fr: '4d41f68e' });
    expect(print(2)).toEqual({ en: '28382d4a', es: '202d56bb', fr: '9eab5081' });
    expect(print(3)).toEqual({ en: 'e97d7f7c', es: '8d64f857', fr: '7dcc6a5d' });
  });
  it('the register is kept, not normalised: polite at the desk (usted / vous), everyday with the friend (tú / tu)', () => {
    expect([line('es', 0), line('es', 2), line('es', 7), line('es', 9)].join(' ')).toMatch(/¿Necesita algo\?.*¿Tiene su llave\?.*¿Tiene un mapa\?.*¿Me lo puede mostrar\?/);
    expect([line('es', 11), line('es', 13), line('es', 15), line('es', 17)].join(' ')).toMatch(/¿Quieres un café\?.*¿Sabes cómo.*Puedes ir a pie.*¿Puedes venir\?/);
    expect([line('fr', 0), line('fr', 2), line('fr', 7), line('fr', 9)].every((l) => /\bVous\b/.test(l))).toBe(true);
    expect([line('fr', 11), line('fr', 13), line('fr', 15), line('fr', 17)].every((l) => /\bTu\b/.test(l))).toBe(true);
    // …and the learner is told so, in one line, where the friend's forms first appear — no grammar lesson
    const friend = cards(day('fr')).find((p) => p.words.some((w) => w.key === 'core.line.want-coffee'))!;
    expect(friend.intro!.he).toMatch(/יומיומית.*מנומסת.*שתיהן/);
  });
});

describe('the coverage specification', () => {
  it('names the meaningful chunks of both scenes, each really in the frozen conversations', () => {
    for (const lang of LANGS) for (const c of M04_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}: “${c.chunk[lang]}”`).toBe(true);
  });
  it('no line is orphaned: the chunks account for every word of every line', () => {
    const GLUE: Record<CoverageLang, string[]> = { en: ['a'], es: ['una'], fr: ["d'une"] };
    for (const lang of LANGS) {
      const known = new Set(M04_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')).concat(GLUE[lang]));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) {
    it(`${lang}: every chunk is COVERED — three or more encounters, in different ways, never the conversation alone`, () => {
      for (const row of coverageOf(day(lang), lang, M04_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
    });
  }
  it('the encounters, per chunk, are the same in English, Spanish and French (Spanish / French say "Sure" and "Of course" with one word)', () => {
    const counts = (lang: CoverageLang): Record<string, string> => Object.fromEntries(coverageOf(day(lang), lang, M04_CONCEPTS).map((r) => [r.id, `${r.total} = meaning ${r.byKind.meaning} · listening ${r.byKind.listening} · retrieval ${r.byKind.retrieval} · context ${r.byKind.context}`]));
    // In Spanish and French a Step 0 block can BE the whole chunk ("no lo sé", "necesito"); English
    // blocks are shorter ("don't know", "need"). Outside Step 0, every encounter is the same.
    const beyondStep0 = (lang: CoverageLang): Record<string, string> => Object.fromEntries(M04_CONCEPTS.filter((c) => c.id !== 'sure' && c.id !== 'of-course')
      .map((c) => [c.id, encounters(day(lang), c.chunk[lang]).filter((e) => e.how !== 'building block').map((e) => `${e.step}:${e.kind}`).join(' ')]));
    expect(beyondStep0('es')).toEqual(beyondStep0('en'));
    expect(beyondStep0('fr')).toEqual(beyondStep0('en'));
    expect(counts('en')).toMatchInlineSnapshot(`
      {
        "can-you-come": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "cant": "7 = meaning 1 · listening 2 · retrieval 3 · context 1",
        "dinner": "4 = meaning 1 · listening 1 · retrieval 0 · context 2",
        "do-you-have-map": "5 = meaning 1 · listening 1 · retrieval 2 · context 1",
        "do-you-know": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "do-you-want": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "dont-have": "6 = meaning 1 · listening 1 · retrieval 3 · context 1",
        "dont-know": "7 = meaning 1 · listening 2 · retrieval 3 · context 1",
        "have-your-key": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "hi": "4 = meaning 1 · listening 1 · retrieval 0 · context 2",
        "i-can-walk": "5 = meaning 1 · listening 1 · retrieval 2 · context 1",
        "i-have-key": "7 = meaning 1 · listening 2 · retrieval 3 · context 1",
        "i-need": "6 = meaning 1 · listening 0 · retrieval 4 · context 1",
        "i-want": "7 = meaning 1 · listening 1 · retrieval 4 · context 1",
        "its-here": "3 = meaning 1 · listening 1 · retrieval 0 · context 1",
        "need-anything": "5 = meaning 1 · listening 1 · retrieval 1 · context 2",
        "no-problem": "3 = meaning 1 · listening 1 · retrieval 0 · context 1",
        "of-course": "3 = meaning 1 · listening 1 · retrieval 0 · context 1",
        "show-me": "5 = meaning 1 · listening 0 · retrieval 3 · context 1",
        "sorry": "7 = meaning 1 · listening 2 · retrieval 3 · context 1",
        "sure": "4 = meaning 1 · listening 1 · retrieval 0 · context 2",
        "towel": "6 = meaning 1 · listening 0 · retrieval 4 · context 1",
        "twenty-minutes": "3 = meaning 1 · listening 1 · retrieval 0 · context 1",
        "wifi": "3 = meaning 1 · listening 0 · retrieval 1 · context 1",
        "yes": "15 = meaning 3 · listening 3 · retrieval 7 · context 2",
        "you-can-walk": "4 = meaning 1 · listening 1 · retrieval 1 · context 1",
      }
    `);
  });
  it('comprehension-first lines are understood (met outside the conversation, with a meaning or by ear) and never asked for', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const c of M04_CONCEPTS.filter((x) => x.role === 'hear')) expect(encounters(d, c.chunk[lang]).filter((e) => e.kind !== 'context').length, `${lang} ${c.id}`).toBeGreaterThanOrEqual(1);
      for (const id of ['twenty-minutes', 'dinner', 'its-here', 'no-problem']) {
        const c = M04_CONCEPTS.find((x) => x.id === id)!;
        expect(cards(d).flatMap((p) => p.words).some((w) => hasChunk(w.text, c.chunk[lang])), `${lang} ${id} has a picture card`).toBe(true);
      }
      const asked = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.filter((o) => o.correct).map((o) => text(d, o.itemId)))), ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => text(d, r.itemId)))];
      for (const id of ['twenty-minutes', 'dinner', 'its-here', 'no-problem', 'sure']) expect(asked.some((a) => hasChunk(a, M04_CONCEPTS.find((x) => x.id === id)!.chunk[lang])), `${lang} ${id}`).toBe(false);
    }
  });
  it('learner lines are retrieved — matched, built, swapped or answered — at least twice before the conversation is over', () => {
    for (const lang of LANGS) for (const c of M04_CONCEPTS.filter((x) => x.role === 'say')) {
      expect(coverageOf(day(lang), lang, [c])[0]!.byKind.retrieval, `${lang} ${c.id}`).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('TEACH before TEST — the strict in-order audit', () => {
  const words = (s: string): string[] => plain(s).trim().split(' ').filter(Boolean);
  /** What the learner already has from Missions 01–03 (their sentences and their conversations). */
  const prior = (lang: CoverageLang): Set<string> => {
    const out = new Set<string>();
    for (const n of [1, 2, 3]) {
      const d = day(lang, n);
      for (const i of d.items) for (const w of words(i.text)) out.add(w);
      for (const dl of Object.values(d.dialogues)) for (const node of dl.nodes) { for (const w of words(node.en)) out.add(w); for (const c of node.choices ?? []) for (const w of words(c.en)) out.add(w); }
    }
    return out;
  };
  type Event = { at: number; text: string; where: string };
  /**
   * Prepared = met WITH ITS MEANING: a building block or picture card, a key sentence, a listening
   * drill, a review card, the conversation (shown with its translation), a meaning match, a one-tile
   * teaching round. TESTS (they prepare nothing): picture boards with 2+ choices, matches of question
   * ↔ answer, builders, the sentence machine (every ending it offers), Quick Replies, speed runs.
   */
  const walk = (d: BootcampDayContent): { taught: Event[]; tested: Event[] } => {
    const taught: Event[] = [];
    const tested: Event[] = [];
    d.steps.forEach((s, at) => {
      const where = `step ${at + 1} ${s.kind}`;
      const teach = (t: string): void => { if (t) taught.push({ at, text: t, where }); };
      const test = (t: string): void => { if (t) tested.push({ at, text: t, where }); };
      if (s.kind === 'prime') { s.words.forEach((w) => teach(w.text)); if (s.buildFromItemId) teach(text(d, s.buildFromItemId)); }
      else if (s.kind === 'tool') teach(text(d, s.itemId));
      else if (s.kind === 'replies') s.replyIds.forEach((id) => teach(text(d, id)));
      else if (s.kind === 'swipe') s.itemIds.forEach((id) => teach(text(d, id)));
      else if (s.kind === 'dialogue') d.dialogues[s.dialogueId]!.nodes.forEach((n) => { teach(n.en); n.choices?.forEach((c) => teach(c.en)); });
      else if (s.kind === 'matchPairs') s.pairs.forEach((p) => { if (p.answerLabel) teach(text(d, p.promptItemId)); else { test(text(d, p.promptItemId)); test(p.answerText ?? text(d, p.answerItemId)); } });
      else if (s.kind === 'visualMatch') s.rounds.forEach((r) => (r.show?.length === 1 ? teach(r.audio.en) : test(r.audio.en)));
      else if (s.kind === 'customize') s.rounds.forEach((r) => test(r.audio.en));
      else if (s.kind === 'sentenceBuilder') s.rounds.forEach((r) => test(r.chunks.join(' ')));
      else if (s.kind === 'swap') s.rounds.forEach((r) => r.options.forEach((o) => test(fillFrame(r.frame, o.slot))));
      else if (s.kind === 'quickReply') s.rounds.forEach((r) => { test(r.npc?.en ?? text(d, r.promptItemId)); r.options.forEach((o) => test(o.text ?? text(d, o.itemId))); });
      else if (s.kind === 'quiz') test(text(d, s.itemId));
      else if (s.kind === 'ambush') test(s.npc.en);
    });
    return { taught, tested };
  };
  const unpreparedWords = (d: BootcampDayContent, lang: CoverageLang): string[] => {
    const { taught, tested } = walk(d);
    const already = prior(lang);
    return tested.flatMap((t) => words(t.text).filter((w) => !already.has(w) && !taught.some((e) => e.at < t.at && words(e.text).includes(w))).map((w) => `${t.where}: “${w}” in “${t.text}”`));
  };
  const unpreparedChunks = (d: BootcampDayContent, lang: CoverageLang): string[] => {
    const { taught, tested } = walk(d);
    return tested.flatMap((t) => M04_CONCEPTS.filter((c) => hasChunk(t.text, c.chunk[lang]) && !taught.some((e) => e.at < t.at && hasChunk(e.text, c.chunk[lang]))).map((c) => `${t.where}: ${c.id} in “${t.text}”`));
  };
  for (const lang of LANGS) {
    it(`${lang}: no tested line has a word the learner has not met with its meaning (here, or in Missions 01–03)`, () => { expect(unpreparedWords(day(lang), lang)).toEqual([]); });
    it(`${lang}: no tested line has a chunk of the conversations that this mission had not taught first`, () => { expect(unpreparedChunks(day(lang), lang)).toEqual([]); });
  }
  it('the audit has teeth: a planted unknown word is caught, and without the picture cards the games test cold', () => {
    const d = day('en');
    const rush = stepsOf(d, 'quickReply').find((s) => s.challenge)!;
    const planted: BootcampStep = { ...rush, rounds: [{ ...rush.rounds[0]!, npc: { en: 'Do you need a pillow too?', he: 'x' } }] };
    expect(unpreparedWords({ ...d, steps: d.steps.map((s) => (s === rush ? planted : s)) }, 'en').join(' ')).toMatch(/“pillow”/);
    const noCards: BootcampDayContent = { ...d, steps: d.steps.filter((s) => !(s.kind === 'prime' && s.words.some((w) => w.line))) };
    expect(unpreparedChunks(noCards, 'en').length).toBeGreaterThan(10);
  });
  // The five engines and the three flips, as they sound in each language.
  const ENGINE: Record<string, Record<CoverageLang, RegExp>> = {
    want: { en: /\bwant\b/i, es: /\bquier/i, fr: /\bveu[xt]\b/i },
    need: { en: /\bneed\b/i, es: /\bnecesit/i, fr: /\bbesoin\b/i },
    have: { en: /\bhave\b/i, es: /\b(tengo|tiene)\b/i, fr: /\b(j’ai|avez|l’ai)\b/i },
    know: { en: /\bknow\b/i, es: /\b(sé|sabes)\b/i, fr: /\bsai[st]\b/i },
    can: { en: /\bcan\b/i, es: /\bpued/i, fr: /\b(peu[xt]|pouvez)\b/i },
    "don't have": { en: /don't have/i, es: /no la tengo/i, fr: /ne l’ai pas/i },
    "don't know": { en: /don't know/i, es: /no lo sé/i, fr: /ne sais pas/i },
    "can't": { en: /can't/i, es: /no puedo/i, fr: /ne peux pas/i },
  };
  for (const [engine, re] of Object.entries(ENGINE)) {
    it(`${engine.toUpperCase()} is taught (with its meaning, in a non-skippable step) before it is ever tested`, () => {
      for (const lang of LANGS) {
        const d = day(lang);
        const { taught, tested } = walk(d);
        const firstTest = Math.min(...tested.filter((e) => re[lang].test(e.text)).map((e) => e.at));
        const firstCard = Math.min(...taught.filter((e) => re[lang].test(e.text) && d.steps[e.at]!.kind === 'prime' && !(d.steps[e.at] as { gate?: boolean }).gate).map((e) => e.at));
        expect(Number.isFinite(firstTest), `${lang} ${engine} is tested`).toBe(true);
        expect(firstCard, `${lang} ${engine}`).toBeLessThan(firstTest);
      }
    });
  }
  it('every learner line goes TEACH → (recognise) → RETRIEVE → the conversation', () => {
    // ("Do you have a map?" has no approved picture yet: it is TAUGHT on its own one-tile round, then retrieved.)
    const PICTURED = new Set(['i-have-key', 'dont-have', 'dont-know', 'i-can-walk', 'cant']);
    for (const lang of LANGS) {
      const d = day(lang);
      const { taught } = walk(d);
      const conversation = d.steps.findIndex((s) => s.kind === 'dialogue');
      for (const c of M04_CONCEPTS.filter((x) => x.role === 'say' && x.id !== 'towel' && x.id !== 'sorry')) {
        const chunk = c.chunk[lang];
        const teach = Math.min(...taught.filter((e) => hasChunk(e.text, chunk)).map((e) => e.at));
        const recognise = d.steps.findIndex((s) => s.kind === 'visualMatch' && s.rounds.some((r) => (r.show?.length ?? 2) >= 2 && hasChunk(r.audio.en, chunk)));
        const retrieve = d.steps.findIndex((s) => (s.kind === 'matchPairs' && s.pairs.some((p) => !p.answerLabel && hasChunk(text(d, p.answerItemId), chunk)))
          || (s.kind === 'sentenceBuilder' && s.rounds.some((r) => hasChunk(r.chunks.join(' '), chunk)))
          || (s.kind === 'swap' && s.rounds.some((r) => r.options.some((o) => o.correct && hasChunk(fillFrame(r.frame, o.slot), chunk))))
          || (s.kind === 'quickReply' && s.rounds.some((r) => r.options.some((o) => o.correct && hasChunk(text(d, o.itemId), chunk)))));
        expect(teach, `${lang} ${c.id}`).toBeLessThan(retrieve);
        if (PICTURED.has(c.id)) { expect(teach, `${lang} ${c.id}`).toBeLessThan(recognise); expect(recognise, `${lang} ${c.id}`).toBeLessThan(conversation); }
        expect(retrieve, `${lang} ${c.id}`).toBeLessThan(conversation);
      }
    }
  });
});

describe('the engine games', () => {
  it('which engine? — the start of each real question, both scenes, against three other engines', () => {
    for (const lang of LANGS) {
      const b = boardWith(day(lang), 'want');
      expect(b.tiles.map((t) => [t.id, t.caption!.en])).toEqual([['want', 'want'], ['need', 'need'], ['have', 'have'], ['know', 'know'], ['can', 'can']]);
      expect(b.rounds.map((r) => [r.audio.en, r.correct])).toEqual([[line(lang, 0), 'need'], [line(lang, 11), 'want'], [line(lang, 2), 'have'], [line(lang, 13), 'know'], [{ en: 'Can you come?', es: '¿Puedes venir?', fr: 'Tu peux venir ?' }[lang], 'can']]);
      for (const r of b.rounds) expect(r.show!.length, lang).toBe(4);
    }
  });
  it('have / don\'t have / do you have? — my things at the desk: key ✓, wifi password ✕ (then: here it is), map ❓', () => {
    for (const lang of LANGS) {
      const b = boardWith(day(lang), 'ask-map');
      expect(b.rounds.map((r) => [r.audio.en, r.correct])).toEqual([[line(lang, 3), 'have-key'], [line(lang, 5), 'no-wifi'], [line(lang, 7), 'ask-map']]);
      // …and what the desk says back — "It's here." — on the reactions board, with "Of course." and "No problem."
      const reactions = boardWith(day(lang), 'no-problem');
      expect(reactions.rounds.map((r) => [r.audio.en, r.correct])).toEqual([[line(lang, 10), 'sure'], [line(lang, 6), 'wifi-here'], [line(lang, 19), 'no-problem']]);
    }
  });
  it('flip it — ✓ or ✕ by ear: know / don\'t know · can / can\'t, each round showing only its own switch', () => {
    for (const lang of LANGS) {
      const b = boardWith(day(lang), 'can-no');
      expect(b.rounds.map((r) => [r.audio.en, r.correct, r.show])).toEqual([[line(lang, 14), 'know-no', ['know-yes', 'know-no']], [line(lang, 16), 'can-yes', ['can-yes', 'can-no']], [line(lang, 18), 'can-no', ['can-yes', 'can-no']]]);
    }
  });
  it('the sentence machine: the object changes · the same object with another engine · words the learner already has', () => {
    const swap = stepsOf(day('en'), 'swap')[0]!;
    expect(swap.rounds.map((r) => fillFrame(r.frame, r.options.find((o) => o.correct)!.slot))).toEqual(['I want a coffee.', 'I have a coffee.', 'I want a croissant.', 'Can you show me?', 'Can you help me?']);
    expect(stepsOf(day('es'), 'swap')[0]!.rounds.map((r) => fillFrame(r.frame, r.options.find((o) => o.correct)!.slot))).toEqual(['Quiero un café.', 'Tengo un café.', 'Quiero un cruasán.', '¿Me lo puede mostrar?', '¿Me puede ayudar?']);
    expect(stepsOf(day('fr'), 'swap')[0]!.rounds.map((r) => fillFrame(r.frame, r.options.find((o) => o.correct)!.slot))).toEqual(['Je veux un café.', 'J’ai un café.', 'Je veux un croissant.', 'Vous pouvez me montrer ?', 'Vous pouvez m’aider ?']);
  });
  it('the CAN game stays on the conversations\' own actions (show me · walk · come) — no swimming, dancing or flying', () => {
    for (const lang of LANGS) expect(JSON.stringify(day(lang).steps), lang).not.toMatch(/swim|danc|fly|nadar|bailar|volar|nager|danser|voler/i);
  });
  it('the coach names the first board for what it is (not "the price")', () => {
    const steps = day('en').steps;
    expect(coachFor(steps, steps.findIndex((s) => s.kind === 'visualMatch'), 'everyday-core')?.line.en).toBe('Listen — and tap what it means.');
  });
});

describe('questions ↔ answers, the speed run, and the recovery rule', () => {
  for (const lang of LANGS) {
    it(`${lang}: the real pairs are matched — the desk's three, the friend's four`, () => {
      const pairs = stepsOf(day(lang), 'matchPairs').map((s) => s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId)]));
      expect(pairs).toEqual([
        [['reply.core.need-anything', 'phrase.core.i-need'], ['reply.core.have-your-key', 'phrase.core.i-have'], ['reply.core.wifi', 'phrase.core.i-dont-have']],
        [['reply.core.do-you-want', 'phrase.core.i-want'], ['reply.core.do-you-know', 'phrase.core.i-dont-know'], ['reply.core.you-can-walk', 'phrase.core.i-can'], ['reply.core.can-you-come', 'phrase.core.i-cant']],
      ]);
      for (const s of stepsOf(day(lang), 'matchPairs')) for (const p of s.pairs) expect(LOCKED[lang].map((l) => l.slice(5)).some((l) => l.includes(text(day(lang), p.promptItemId))), `${lang} ${p.promptItemId}`).toBe(true);
    });
    it(`${lang}: the speed run is the conversations' own questions, in order — ending on dinner → "Sorry, I can't."`, () => {
      const rush = stepsOf(day(lang), 'quickReply').find((s) => s.challenge)!;
      expect(rush.rounds.map((r) => `NPC: ${r.npc!.en}`)).toEqual([0, 2, 11, 13, 17].map((i) => LOCKED[lang][i]));
      expect(strip(rush.rounds.at(-1)!.options.find((o) => o.correct)!.itemId)).toBe('phrase.core.i-cant');
    });
  }
  it('no Quick Reply is answered with a recovery phrase (repeat / slowly / don\'t understand / one moment); "Can you show me?" is the conversation\'s own line, asked from a clear situation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
        for (const o of r.options) expect(strip(o.itemId), lang).not.toMatch(/^phrase\.recovery\.(repeat|slowly|dont-understand|one-moment|what-mean)$/);
        if (r.npc) expect(LOCKED[lang].map((l) => l.slice(5)), lang).toContain(r.npc.en);
      }
      expect(stepsOf(d, 'ambush'), lang).toHaveLength(0);
      const show = stepsOf(d, 'quickReply').flatMap((s) => s.rounds).find((r) => r.options.some((o) => o.correct && strip(o.itemId) === 'phrase.recovery.show-me'))!;
      expect(show.situation!.en).toMatch(/cannot see how to get there/);
      expect(text(d, show.options.find((o) => o.correct)!.itemId)).toBe(line(lang, 9));
    }
  });
  it('the old invented speed line ("Before you go out…still in the room?") and the untaught water / help / phone endings are gone', () => {
    for (const lang of LANGS) expect(JSON.stringify(day(lang).steps), lang).not.toMatch(/still in the room|encore dans la chambre|sigue en la habitación|my phone|mon téléphone|mi teléfono/);
  });
});

describe('the transfer: new sentences from words the learner already has', () => {
  it('every off-conversation sentence the mission tests uses only words taught here or in Missions 01–03 — no hidden vocabulary debt', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const conversation = new Set(LOCKED[lang].map((l) => l.slice(5)));
      const off = stepsOf(d, 'swap').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => fillFrame(r.frame, o.slot)))).filter((x) => !conversation.has(x));
      expect(off.length, lang).toBeGreaterThanOrEqual(5);
      const taughtHere = new Set(stepsOf(d, 'prime').flatMap((p) => p.words.flatMap((w) => plain(w.text).trim().split(' '))));
      const before = new Set([1, 2, 3].flatMap((n) => day(lang, n).items.flatMap((i) => plain(i.text).trim().split(' '))));
      for (const x of off) for (const w of plain(x).trim().split(' ')) expect(taughtHere.has(w) || before.has(w), `${lang}: “${w}” in “${x}”`).toBe(true);
    }
  });
  it('"water" is taught on a card before it is offered — later missions count on it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const card = cards(d).flatMap((p) => p.words).find((w) => w.key === 'core.line.want-water')!;
      expect(card.text).toBe({ en: 'I want water.', es: 'Quiero agua.', fr: 'Je veux de l’eau.' }[lang]);
      expect(d.steps.findIndex((s) => s.kind === 'prime' && s.words.includes(card))).toBeLessThan(d.steps.findIndex((s) => s.kind === 'swap'));
    }
  });
});

describe('the final gate: both scenes again, then what happened — answered by meaning', () => {
  for (const lang of LANGS) {
    it(`${lang}: key ✓ (the wifi ✕ beside it) · coffee · don't know · twenty minutes on foot · dinner at seven · can't`, () => {
      const d = day(lang);
      expect(afterVideo(d).map((s) => s.kind)).toEqual(['visualMatch', 'receipt', 'summary']);
      const gate = afterVideo(d)[0] as Board;
      expect(gate.rounds.map((r) => [r.audio.en, r.correct, r.show])).toEqual([
        [line(lang, 3), 'have-key', ['have-key', 'no-wifi']], [line(lang, 12), 'want-coffee', ['want-coffee', 'sorry-cant']],
        [line(lang, 14), 'know-no', ['know-no', 'know-yes']], [line(lang, 15), 'walk', ['walk', 'dinner']], [line(lang, 17), 'dinner', ['dinner', 'walk']], [line(lang, 18), 'can-no', ['can-no', 'can-yes']],
      ]);
      expect(stepsOf(d, 'quiz'), lang).toHaveLength(0);
    });
  }
  it('the same meaning is the same tile wherever it appears (the desk game, the flips, the gate)', () => {
    const d = day('en');
    const seen = new Map<string, string>();
    for (const b of boards(d)) for (const t of b.tiles) { const look = JSON.stringify([t.image, t.emoji, t.caption]); expect(seen.get(t.id) ?? look, t.id).toBe(look); seen.set(t.id, look); }
    const looks = [...seen.values()];
    expect(new Set(looks).size).toBe(looks.length);
  });
});

describe('Group 1 pictures: the five engines and the three flips', () => {
  const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url));
  const FILE = {
    want: 'want.jpg', need: 'need.jpg', have: 'have.jpg', dontHave: 'dont-have.jpg', know: 'know.jpg', dontKnow: 'dont-know.jpg', can: 'can.jpg', cant: 'cant.jpg',
  } as const;
  const pic = (path: string | undefined): string => (path ?? '').replace('images/mission04/', '');
  it('the eight files exist, are real pictures, and are eight DIFFERENT files', () => {
    const files = Object.values(FILE);
    expect(new Set(files).size).toBe(8);
    for (const f of files) { expect(existsSync(`${PUBLIC}images/mission04/${f}`), f).toBe(true); expect(statSync(`${PUBLIC}images/mission04/${f}`).size, f).toBeGreaterThan(10_000); }
  });
  it('Step 0: each engine and each flip carries its own picture', () => {
    for (const lang of LANGS) {
      const p = stepsOf(day(lang), 'prime')[0]!;
      expect(p.words.map((w) => [w.key, pic(w.image)])).toEqual([
        ['core.want', FILE.want], ['core.need', FILE.need], ['core.have', FILE.have], ['core.know', FILE.know], ['core.can', FILE.can],
        ['core.dont-have', FILE.dontHave], ['core.dont-know', FILE.dontKnow], ['core.cant', FILE.cant],
      ]);
    }
  });
  it('"Which engine did you hear?" uses the five positive engine pictures, each with its one-word caption, all treated alike', () => {
    for (const lang of LANGS) {
      const b = boardWith(day(lang), 'want');
      expect(b.tiles.map((t) => [t.id, pic(t.image), t.caption!.en])).toEqual([['want', FILE.want, 'want'], ['need', FILE.need, 'need'], ['have', FILE.have, 'have'], ['know', FILE.know, 'know'], ['can', FILE.can, 'can']]);
      for (const t of b.tiles) { expect(t.emoji).toBeUndefined(); expect(t.scale).toBeUndefined(); expect(t.alt).toBeTruthy(); }
    }
  });
  it('Flip It uses the positive / negative pairs: know ↔ don\'t know, can ↔ can\'t; the desk game: have ↔ don\'t have', () => {
    for (const lang of LANGS) {
      const flip = boardWith(day(lang), 'can-no');
      expect(flip.tiles.map((t) => [t.id, pic(t.image)])).toEqual([['know-yes', FILE.know], ['know-no', FILE.dontKnow], ['can-yes', FILE.can], ['can-no', FILE.cant]]);
      const desk = boardWith(day(lang), 'ask-map');
      expect(desk.tiles.filter((t) => !t.image?.includes('desk-')).map((t) => [t.id, pic(t.image)])).toEqual([['have-key', FILE.have], ['no-wifi', FILE.dontHave]]);
    }
  });
  it('the learner lines that are engine examples carry the engine picture — unless the friend\'s scene has the line itself (Group 3)', () => {
    for (const lang of LANGS) {
      const byKey = Object.fromEntries(cards(day(lang)).flatMap((p) => p.words).map((w) => [w.key, pic(w.image)]));
      expect([byKey['core.line.i-need'], byKey['core.line.i-have'], byKey['core.line.i-dont-have'], byKey['core.line.i-know'], byKey['core.line.i-dont-know']])
        .toEqual([FILE.need, FILE.have, FILE.dontHave, FILE.know, FILE.dontKnow]);
      expect([byKey['core.line.i-want'], byKey['core.line.i-can'], byKey['core.line.i-cant']]).toEqual(['friend-want-coffee.jpg', 'friend-i-can-walk.jpg', 'friend-sorry-cant.jpg']);
      // the desk's and the friend's QUESTIONS are not statements of an engine: no ENGINE picture on them
      for (const w of cards(day(lang)).flatMap((p) => p.words)) if (/^core\.line\.(need-anything|have-key|wifi|want-coffee|know-way|walk|dinner)$/.test(w.key!)) expect(Object.values(FILE) as string[], w.key).not.toContain(pic(w.image));
    }
  });
  it('one engine = one picture across the whole mission (Step 0, cards, every board), the same in EN / ES / FR', () => {
    const map = (lang: CoverageLang): Record<string, string> => {
      const out: Record<string, Set<string>> = {};
      const note = (path: string | undefined, meaning: string): void => { if (path) (out[pic(path)] ??= new Set()).add(meaning); };
      for (const w of stepsOf(day(lang), 'prime').flatMap((p) => p.words)) note(w.image, (w.key ?? '').replace(/^core\.(line\.)?/, '').replace(/^i-/, '').replace('want-water', 'water'));
      for (const b of boards(day(lang))) for (const t of b.tiles) note(t.image, t.id);
      // (Group 1 only here — the desk scenes have their own test)
      return Object.fromEntries(Object.entries(out).filter(([f]) => !f.startsWith('desk-') && !f.startsWith('friend-')).map(([f, m]) => [f, [...m].sort().join(' | ')]));
    };
    const SAME: Record<string, string> = {
      [FILE.want]: 'want', [FILE.need]: 'need', [FILE.have]: 'have | have-key', [FILE.dontHave]: 'dont-have | no-wifi',
      [FILE.know]: 'know | know-yes', [FILE.dontKnow]: 'dont-know | know-no', [FILE.can]: 'can | can-yes', [FILE.cant]: 'can-no | cant',
    };
    for (const lang of LANGS) expect(map(lang), lang).toEqual(SAME);
  });
  it('no round mixes a picture and an emoji — the answer is never "the odd tile out"', () => {
    for (const lang of LANGS) for (const b of boards(day(lang))) for (const r of b.rounds) {
      const shown = r.show ? b.tiles.filter((t) => r.show!.includes(t.id)) : b.tiles;
      expect(new Set(shown.map((t) => (t.image ? 'picture' : 'emoji'))).size, `${lang} ${r.audio.en}`).toBe(1);
    }
  });
});

describe('Group 2 pictures: the hotel-desk scenes', () => {
  const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url));
  const G1 = ['want.jpg', 'need.jpg', 'have.jpg', 'dont-have.jpg', 'know.jpg', 'dont-know.jpg', 'can.jpg', 'cant.jpg'];
  const DESK = {
    needAnything: 'desk-need-anything.jpg', haveKey: 'desk-have-key.jpg', wifiPassword: 'desk-wifi-password.jpg', wifiHere: 'desk-wifi-here.jpg',
    haveMap: 'desk-have-map.jpg', mapYes: 'desk-map-yes.jpg', showMe: 'desk-show-me.jpg', ofCourse: 'desk-of-course.jpg',
  } as const;
  const G2 = Object.values(DESK) as string[];
  const pic = (path: string | undefined): string => (path ?? '').replace('images/mission04/', '');
  const cardPic = (lang: CoverageLang, key: string): string => pic(cards(day(lang)).flatMap((p) => p.words).find((w) => w.key === key)!.image);
  it('the eight desk scenes exist and are eight different files', () => {
    expect(new Set(G2).size).toBe(8);
    for (const f of G2) { expect(existsSync(`${PUBLIC}images/mission04/${f}`), f).toBe(true); expect(statSync(`${PUBLIC}images/mission04/${f}`).size, f).toBeGreaterThan(10_000); }
  });
  it('the map request and the map "yes" are never the same picture (all Mission 04 pictures are different images — see Group 3)', () => {
    expect(readFileSync(`${PUBLIC}images/mission04/${DESK.haveMap}`).equals(readFileSync(`${PUBLIC}images/mission04/${DESK.mapYes}`))).toBe(false);
  });
  it('each desk line uses its own scene — the same in EN / ES / FR', () => {
    for (const lang of LANGS) {
      expect([
        cardPic(lang, 'core.line.need-anything'), cardPic(lang, 'core.line.have-key'), cardPic(lang, 'core.line.wifi'), cardPic(lang, 'core.line.its-here'),
        cardPic(lang, 'core.line.do-you-have'), cardPic(lang, 'core.line.map-yes'), cardPic(lang, 'core.line.show-me'), cardPic(lang, 'core.line.of-course'),
      ], lang).toEqual([DESK.needAnything, DESK.haveKey, DESK.wifiPassword, DESK.wifiHere, DESK.haveMap, DESK.mapYes, DESK.showMe, DESK.ofCourse]);
    }
    // …and each card is the conversation's own line
    const desk = cards(day('es')).flatMap((p) => p.words).filter((w) => w.image?.includes('desk-')).map((w) => w.text);
    expect(desk).toEqual(['¡Hola! ¿Necesita algo?', 'Claro. ¿Tiene su llave?', '¿Y la contraseña del wifi?', 'Está aquí.', 'Sí.', 'Claro.', '¿Tiene un mapa?', '¿Me lo puede mostrar?']);
  });
  it('one scene = one meaning: no desk scene stands for two lines, and no line has two scenes', () => {
    for (const lang of LANGS) {
      const byPic = new Map<string, Set<string>>();
      const note = (path: string | undefined, meaning: string): void => { if (path?.includes('desk-')) byPic.set(pic(path), (byPic.get(pic(path)) ?? new Set()).add(meaning)); };
      for (const w of cards(day(lang)).flatMap((p) => p.words)) note(w.image, w.key!.replace('core.line.', ''));
      for (const b of boards(day(lang))) for (const t of b.tiles) note(t.image, { 'ask-map': 'do-you-have', 'wifi-here': 'its-here', sure: 'of-course' }[t.id] ?? t.id);
      expect(byPic.size, lang).toBe(8);
      for (const [f, m] of byPic) expect([...m], `${lang} ${f}`).toHaveLength(1);
    }
  });
  it('the engine game and the flips still use Group 1 only; Group 1 files never carry a desk line', () => {
    for (const lang of LANGS) {
      for (const id of ['want', 'can-no']) for (const t of boardWith(day(lang), id).tiles) expect(G1, `${lang} ${t.id}`).toContain(pic(t.image));
      const g1Lines = cards(day(lang)).flatMap((p) => p.words).filter((w) => G1.includes(pic(w.image))).map((w) => w.key);
      for (const k of g1Lines) expect(k, lang).not.toMatch(/need-anything|have-key|wifi|its-here|do-you-have|map-yes|show-me|of-course/);
    }
  });
  it('the map workaround is gone: "Do you have a map?" is a fair three-picture choice again (have ✓ · don\'t have ✕ · do you have? ❓)', () => {
    for (const lang of LANGS) {
      const b = boardWith(day(lang), 'ask-map');
      expect(b.rounds.map((r) => r.show)).toEqual([undefined, undefined, undefined]);
      expect(b.tiles.map((t) => [t.id, pic(t.image)])).toEqual([['have-key', 'have.jpg'], ['no-wifi', 'dont-have.jpg'], ['ask-map', DESK.haveMap]]);
    }
  });
  it('the reactions keep their desk scenes: "Of course" and "It\'s here"', () => {
    for (const lang of LANGS) {
      const b = boardWith(day(lang), 'no-problem');
      expect([pic(b.tiles.find((t) => t.id === 'sure')!.image), pic(b.tiles.find((t) => t.id === 'wifi-here')!.image)]).toEqual([DESK.ofCourse, DESK.wifiHere]);
    }
  });
  it('the scene cards are drawn large (whole scenes, not thumbnails)', () => {
    for (const lang of LANGS) for (const p of cards(day(lang))) expect(p.bigPictures, lang).toBe(true);
    expect(stepsOf(day('en', 3), 'prime').some((p) => p.bigPictures)).toBe(false); // Mission 03 untouched
  });
  it('the French "carte = map" note stays; the polite desk forms stay', () => {
    const desk = cards(day('fr')).find((p) => p.words.some((w) => w.key === 'core.line.do-you-have'))!;
    expect(desk.intro!.en).toMatch(/carte = map/);
    expect(cards(day('fr')).flatMap((p) => p.words).find((w) => w.key === 'core.line.show-me')!.text).toBe('Vous pouvez me montrer ?');
  });
});

describe('Group 3 pictures: the friend\'s scene', () => {
  const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url));
  const G1 = ['want.jpg', 'need.jpg', 'have.jpg', 'dont-have.jpg', 'know.jpg', 'dont-know.jpg', 'can.jpg', 'cant.jpg'];
  const G2 = ['desk-need-anything.jpg', 'desk-have-key.jpg', 'desk-wifi-password.jpg', 'desk-wifi-here.jpg', 'desk-have-map.jpg', 'desk-map-yes.jpg', 'desk-show-me.jpg', 'desk-of-course.jpg'];
  const F = {
    offerCoffee: 'friend-offer-coffee.jpg', wantCoffee: 'friend-want-coffee.jpg', knowCentre: 'friend-know-centre.jpg', walkTwenty: 'friend-walk-twenty.jpg',
    iCanWalk: 'friend-i-can-walk.jpg', dinnerSeven: 'friend-dinner-seven.jpg', sorryCant: 'friend-sorry-cant.jpg', noProblem: 'friend-no-problem.jpg',
  } as const;
  const G3 = Object.values(F) as string[];
  const pic = (path: string | undefined): string => (path ?? '').replace('images/mission04/', '');
  const cardPic = (lang: CoverageLang, key: string): string => pic(cards(day(lang)).flatMap((p) => p.words).find((w) => w.key === key)!.image);
  it('the eight friend scenes exist; the folder holds exactly Groups 1, 2 and 3; all twenty-four are different images', () => {
    for (const f of G3) { expect(existsSync(`${PUBLIC}images/mission04/${f}`), f).toBe(true); expect(statSync(`${PUBLIC}images/mission04/${f}`).size, f).toBeGreaterThan(10_000); }
    expect(readdirSync(`${PUBLIC}images/mission04`).sort()).toEqual([...G1, ...G2, ...G3].sort());
    const bytes = [...G1, ...G2, ...G3].map((f) => readFileSync(`${PUBLIC}images/mission04/${f}`).toString('base64'));
    expect(new Set(bytes).size).toBe(24);
  });
  it('every Mission 04 picture reference is one of the twenty-four', () => {
    for (const lang of LANGS) for (const m of JSON.stringify(day(lang)).matchAll(/images\/mission04\/([a-z-]+\.jpg)/g)) expect([...G1, ...G2, ...G3], `${lang} ${m[1]}`).toContain(m[1]);
  });
  it('each friend line uses its own scene — the same in EN / ES / FR', () => {
    for (const lang of LANGS) {
      expect([
        cardPic(lang, 'core.line.want-coffee'), cardPic(lang, 'core.line.i-want'), cardPic(lang, 'core.line.know-way'), cardPic(lang, 'core.line.walk'),
        cardPic(lang, 'core.line.i-can'), cardPic(lang, 'core.line.dinner'), cardPic(lang, 'core.line.i-cant'), cardPic(lang, 'core.line.no-problem'),
      ], lang).toEqual([F.offerCoffee, F.wantCoffee, F.knowCentre, F.walkTwenty, F.iCanWalk, F.dinnerSeven, F.sorryCant, F.noProblem]);
    }
    expect(cards(day('fr')).flatMap((p) => p.words).filter((w) => w.image?.includes('friend-')).map((w) => w.text)).toEqual([
      'Tu veux un café ?', 'Tu sais comment aller au centre ?', 'Tu peux y aller à pied. C’est à environ vingt minutes.', 'On dîne à sept heures. Tu peux venir ?', 'Pas de problème.',
      'Oui, je veux un café.', 'Je peux y aller à pied.', 'Désolé, je ne peux pas.',
    ]);
  });
  it('question and answer are never one picture: coffee offer ≠ coffee accepted · walk advice ≠ "I can walk" · dinner invitation ≠ "Sorry, I can\'t"', () => {
    expect(new Set([F.offerCoffee, F.wantCoffee]).size).toBe(2);
    expect(new Set([F.walkTwenty, F.iCanWalk]).size).toBe(2);
    expect(new Set([F.dinnerSeven, F.sorryCant]).size).toBe(2);
    for (const lang of LANGS) {
      expect(cardPic(lang, 'core.line.want-coffee')).not.toBe(cardPic(lang, 'core.line.i-want'));
      expect(cardPic(lang, 'core.line.walk')).not.toBe(cardPic(lang, 'core.line.i-can'));
      expect(cardPic(lang, 'core.line.dinner')).not.toBe(cardPic(lang, 'core.line.i-cant'));
    }
  });
  it('one scene = one meaning across cards and boards; the engine game, the flips and Step 0 still use Group 1 only', () => {
    for (const lang of LANGS) {
      const byPic = new Map<string, Set<string>>();
      const note = (path: string | undefined, meaning: string): void => { if (path?.includes('friend-')) byPic.set(pic(path), (byPic.get(pic(path)) ?? new Set()).add(meaning)); };
      for (const w of cards(day(lang)).flatMap((p) => p.words)) note(w.image, w.key!.replace('core.line.', ''));
      for (const b of boards(day(lang))) for (const t of b.tiles) note(t.image, { 'want-coffee': 'i-want', 'sorry-cant': 'i-cant', walk: 'walk', dinner: 'dinner', 'no-problem': 'no-problem' }[t.id] ?? t.id);
      expect(byPic.size, lang).toBe(8);
      for (const [f, m] of byPic) expect([...m], `${lang} ${f}`).toHaveLength(1);
      for (const id of ['want', 'can-no']) for (const t of boardWith(day(lang), id).tiles) expect(G1, `${lang} ${t.id}`).toContain(pic(t.image));
      for (const w of stepsOf(day(lang), 'prime')[0]!.words) expect(G1, `${lang} ${w.key}`).toContain(pic(w.image));
    }
  });
  it('the reactions board is fully visual again: of course · it\'s here · no problem — all scenes, no one-tile round, no emoji', () => {
    for (const lang of LANGS) {
      const b = boardWith(day(lang), 'no-problem');
      expect(b.rounds.map((r) => [r.correct, r.show])).toEqual([['sure', undefined], ['wifi-here', undefined], ['no-problem', undefined]]);
      expect(b.tiles.map((t) => pic(t.image))).toEqual(['desk-of-course.jpg', 'desk-wifi-here.jpg', F.noProblem]);
    }
  });
  it('the final gate shows the friend\'s scenes: coffee accepted (vs the refusal), the walk vs the dinner', () => {
    const gate = afterVideo(day('en'))[0] as Board;
    const tile = (id: string) => pic(gate.tiles.find((t) => t.id === id)!.image);
    expect([tile('want-coffee'), tile('sorry-cant'), tile('walk'), tile('dinner')]).toEqual([F.wantCoffee, F.sorryCant, F.walkTwenty, F.dinnerSeven]);
  });
  it('no emoji tile is left on any Mission 04 board, and the friend\'s cards are all pictures except "I want water." (no approved picture)', () => {
    for (const lang of LANGS) {
      for (const b of boards(day(lang))) for (const t of b.tiles) expect(t.emoji, `${lang} ${t.id}`).toBeUndefined();
      const friend = cards(day(lang)).filter((p) => p.words.some((w) => w.key === 'core.line.want-coffee' || w.key === 'core.line.i-want')).flatMap((p) => p.words);
      expect(friend.filter((w) => !w.image).map((w) => w.key)).toEqual(['core.line.want-water']);
    }
  });
});

describe('the arc, the pacing and the variety', () => {
  it('Step 0 → the desk (cards, have / don\'t have, pairs, your turn) → the friend (cards, which engine, pairs, flip) → build → the machine → both scenes → speed → video → what happened', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'quickReply' && s.challenge ? 'quickReply:speed' : s.kind === 'video' ? `video:${s.mode}` : s.kind === 'prime' && s.gate ? 'prime:step0' : s.kind === 'prime' ? 'prime:cards' : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0', 'prime:cards', 'prime:cards', 'visualMatch', 'matchPairs', 'quickReply',
      'prime:cards', 'prime:cards', 'visualMatch', 'matchPairs', 'visualMatch', 'visualMatch', 'sentenceBuilder', 'swap', 'receipt',
      'dialogue', 'receipt', 'dialogue', 'receipt', 'quickReply:speed', 'receipt', 'video:again', 'visualMatch', 'receipt', 'summary',
    ]);
  });
  it('Step 0 is optional and small: the five engines and the three flips — no grammar terms', () => {
    for (const lang of LANGS) {
      const p = stepsOf(day(lang), 'prime')[0]!;
      expect(p.gate).toBe(true);
      expect(p.words.map((w) => w.key)).toEqual(['core.want', 'core.need', 'core.have', 'core.know', 'core.can', 'core.dont-have', 'core.dont-know', 'core.cant']);
    }
    expect(JSON.stringify(stepsOf(day('en'), 'prime'))).not.toMatch(/modal|auxiliar|infinitive|subject|verb\b|conjugat/i);
  });
  it('no two games of the same kind in a row before the conversation, and no translation quiz or review run to pad the count', () => {
    for (const lang of LANGS) {
      const kinds = day(lang).steps.slice(0, day(lang).steps.findIndex((s) => s.kind === 'dialogue')).map((s) => s.kind).filter((k) => k !== 'receipt' && k !== 'prime' && k !== 'talk');
      kinds.forEach((k, i) => { if (i > 0) expect(k === kinds[i - 1] && k !== 'visualMatch', `${lang}: ${kinds[i - 1]} → ${k}`).toBe(false); });
      for (let i = 2; i < kinds.length; i++) expect(kinds[i] === kinds[i - 1] && kinds[i] === kinds[i - 2], `${lang}: three ${kinds[i]} in a row`).toBe(false);
      expect(stepsOf(day(lang), 'quiz'), lang).toHaveLength(0);
      expect(stepsOf(day(lang), 'swipe'), lang).toHaveLength(0);
      expect(stepsOf(day(lang), 'tool'), lang).toHaveLength(0);
    }
  });
  it('same journey in the three languages; every step valid; 41 quick interactions', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'visualMatch') return [s.kind, s.tiles, s.rounds.map((r) => [r.correct, strip(r.itemId), r.show])];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId)])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))];
      if (s.kind === 'swap') return [s.kind, s.rounds.map((r) => [strip(r.itemId), r.cue, r.options.map((o) => [o.correct, o.meaning.he])])];
      if (s.kind === 'prime') return [s.kind, s.gate, s.words.map((w) => [w.key, w.line, w.emoji, w.meaning])];
      return s.kind;
    });
    for (const lang of LANGS) {
      const d = day(lang);
      if (lang !== 'en') expect(shape(d), lang).toEqual(shape(day('en')));
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      const n = stepsOf(d, 'quickReply').reduce((k, s) => k + s.rounds.length, 0) + stepsOf(d, 'visualMatch').reduce((k, s) => k + s.rounds.length, 0)
        + stepsOf(d, 'matchPairs').reduce((k, s) => k + s.pairs.length, 0) + stepsOf(d, 'sentenceBuilder').reduce((k, s) => k + s.rounds.length, 0) + stepsOf(d, 'swap').reduce((k, s) => k + s.rounds.length, 0);
      expect(n, lang).toBe(41);
    }
  });
});
