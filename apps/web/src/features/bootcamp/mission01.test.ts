import { describe, expect, it } from 'vitest';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { M01_CONCEPTS, coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { validatePracticeStep } from './practiceEngines.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 01 — the gold standard. Finishing it must mean "I understand this conversation": every
 * meaningful chunk of the LOCKED dialogue (the host's lines as much as the learner's) is met at
 * least three times, in different ways, before the final video — no phrase is video-only.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const day = (lang: CoverageLang): BootcampDayContent => MISSIONS_BY_LANG[lang]![BOOTCAMP_PLAN[0]!.day]!;
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((d) => cinematicTranscript(d)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);

const LOCKED: Record<CoverageLang, string[]> = {
  en: [
    "NPC: Hi! Welcome. What's your name?", 'YOU: My name is Dan.', 'NPC: Nice to meet you, Dan! Where are you from?', "YOU: I'm from Israel.",
    'NPC: Israel, wonderful! Is this your first time here?', "YOU: Yes, it's my first time here.", 'NPC: Enjoy your stay! Have a great day!',
  ],
  es: [
    'NPC: ¡Hola! Bienvenido. ¿Cómo se llama?', 'YOU: Me llamo Dan.', 'NPC: ¡Mucho gusto, Dan! ¿De dónde es?', 'YOU: Soy de Israel.',
    'NPC: ¡Israel, qué maravilla! ¿Es su primera vez aquí?', 'YOU: Sí, es mi primera vez aquí.', 'NPC: ¡Que disfrute su estancia! ¡Que tenga un buen día!',
  ],
  fr: [
    'NPC: Bonjour ! Bienvenue. Comment vous appelez-vous ?', 'YOU: Je m’appelle Dan.', 'NPC: Enchanté, Dan ! D’où venez-vous ?', 'YOU: Je viens d’Israël.',
    'NPC: Israël, magnifique ! C’est votre première fois ici ?', 'YOU: Oui, c’est ma première fois ici.', 'NPC: Bon séjour ! Bonne journée !',
  ],
};

describe('the dialogue is locked', () => {
  for (const lang of LANGS) {
    it(`${lang}: the conversation is word for word the frozen one`, () => {
      expect(script(lang)).toEqual(LOCKED[lang]);
    });
  }
  it('the whole dialogue tree (every branch, gloss and pace) is byte-for-byte what it was before this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual({ en: 'bbc44c0b', fr: '2ea35ee9', es: 'edafda10' });
    for (const lang of LANGS) expect(Object.keys(day(lang).dialogues), lang).toEqual(['meeting-host']); // one scene — the video script is untouched
  });
});

describe('the coverage specification', () => {
  it('names the fourteen meaningful chunks, and each one is really in the frozen conversation', () => {
    expect(M01_CONCEPTS.map((c) => c.id)).toEqual(['hello', 'welcome', 'name-q', 'name-a', 'nice-to-meet', 'from-q', 'from-a', 'israel', 'wonderful', 'first-q', 'yes', 'first-a', 'enjoy-stay', 'great-day']);
    for (const lang of LANGS) for (const c of M01_CONCEPTS) expect(LOCKED[lang].some((line) => hasChunk(line.slice(5), c.chunk[lang])), `${lang} ${c.id}: “${c.chunk[lang]}”`).toBe(true);
  });
  it('the chunks account for every word of every line — nothing in the video is outside the specification', () => {
    for (const lang of LANGS) {
      const known = new Set(M01_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')).concat(['dan']));
      // an elided chunk ("d'") covers the word it runs into ("d'israël")
      const elided = M01_CONCEPTS.map((c) => plain(c.chunk[lang]).trim()).filter((c) => c.endsWith("'")).map((c) => c.split(' ').pop()!);
      for (const line of LOCKED[lang]) for (const w of plain(line.slice(5)).trim().split(' ')) {
        expect(known.has(w) || elided.some((e) => w.startsWith(e) && known.has(w.slice(e.length))), `${lang}: “${w}” in “${line}”`).toBe(true);
      }
    }
  });
  it('matching is by whole words, blind to case, punctuation and apostrophe style', () => {
    expect(hasChunk('¡Israel, qué maravilla!', 'qué maravilla')).toBe(true);
    expect(hasChunk('Israel, wonderful! Is this…', 'Wonderful')).toBe(true);
    expect(hasChunk("Je viens d'Israël.", 'Je viens d’')).toBe(true);
    expect(hasChunk('eyes', 'Yes')).toBe(false);
    expect(hasChunk('Yesterday', 'Yes')).toBe(false);
    expect(hasChunk('Je viens d’Israël.', 'Israël')).toBe(true); // a word after an elision is still that word
  });
});

describe('every meaningful chunk of the video is learned before the video', () => {
  for (const lang of LANGS) {
    it(`${lang}: all fourteen are COVERED — three or more encounters, in different ways, never the conversation alone`, () => {
      const table = coverageOf(day(lang), lang);
      for (const row of table) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
      expect(table.every((r) => r.total >= 3)).toBe(true);
    });
  }
  it('the encounter counts, per chunk — identical in English, Spanish and French', () => {
    const counts = (lang: CoverageLang): Record<string, string> => Object.fromEntries(coverageOf(day(lang), lang).map((r) => [r.id, `${r.total} = meaning ${r.byKind.meaning} · listening ${r.byKind.listening} · retrieval ${r.byKind.retrieval} · context ${r.byKind.context}`]));
    expect(counts('es')).toEqual(counts('en'));
    expect(counts('fr')).toEqual(counts('en'));
    expect(counts('en')).toMatchInlineSnapshot(`
      {
        "enjoy-stay": "4 = meaning 1 · listening 2 · retrieval 0 · context 1",
        "first-a": "8 = meaning 2 · listening 0 · retrieval 5 · context 1",
        "first-q": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "from-a": "8 = meaning 2 · listening 0 · retrieval 5 · context 1",
        "from-q": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "great-day": "5 = meaning 2 · listening 2 · retrieval 0 · context 1",
        "hello": "5 = meaning 2 · listening 1 · retrieval 0 · context 2",
        "israel": "9 = meaning 2 · listening 0 · retrieval 5 · context 2",
        "name-a": "8 = meaning 2 · listening 0 · retrieval 5 · context 1",
        "name-q": "6 = meaning 1 · listening 2 · retrieval 1 · context 2",
        "nice-to-meet": "6 = meaning 3 · listening 1 · retrieval 0 · context 2",
        "welcome": "6 = meaning 2 · listening 2 · retrieval 0 · context 2",
        "wonderful": "5 = meaning 1 · listening 2 · retrieval 0 · context 2",
        "yes": "6 = meaning 1 · listening 0 · retrieval 4 · context 1",
      }
    `);
  });
  it('what used to be video-only is now taught: welcome, the positive reaction, the goodbye wish', () => {
    for (const lang of LANGS) for (const id of ['hello', 'welcome', 'wonderful', 'great-day', 'enjoy-stay', 'nice-to-meet']) {
      const c = M01_CONCEPTS.find((x) => x.id === id)!;
      const outside = encounters(day(lang), c.chunk[lang]).filter((e) => e.kind !== 'context');
      expect(outside.length, `${lang} ${id}`).toBeGreaterThanOrEqual(2);
    }
  });
  it('removing a chunk\'s practice is caught: with the warm-words steps taken out, the build would fail', () => {
    const d = day('en');
    const without: BootcampDayContent = { ...d, steps: d.steps.filter((s) => !(s.kind === 'replies' && s.replyIds.some((id) => id.endsWith('reply.social.welcome'))) && !(s.kind === 'matchPairs' && s.pairs.some((p) => p.answerLabel)) && s.kind !== 'quiz' && s.kind !== 'prime' && s.kind !== 'swipe') };
    const broken = coverageOf(without, 'en').filter((r) => !r.covered).map((r) => r.id);
    expect(broken).toEqual(expect.arrayContaining(['welcome', 'wonderful', 'great-day']));
  });
});

describe('question → answer: the three pairs are drilled together, again and again', () => {
  const PAIRS = [['reply.social.whats-your-name', 'phrase.social.my-name'], ['reply.social.where-from', 'phrase.social.from-israel'], ['reply.social.first-time-q', 'phrase.social.first-time']] as const;
  for (const lang of LANGS) {
    it(`${lang}: each question meets its answer in the match, the quick reply, the speed round and the conversation`, () => {
      const d = day(lang);
      const text = (id: string): string => d.items.find((i) => strip(i.id) === id)!.text;
      const qa = stepsOf(d, 'matchPairs').find((s) => s.pairs.every((p) => !p.answerLabel))!;
      expect(qa.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId)])).toEqual(PAIRS.map((p) => [...p]));
      const quick = stepsOf(d, 'quickReply').find((s) => !s.challenge)!;
      expect(quick.rounds.map((r) => [strip(r.promptItemId), strip(r.options.find((o) => o.correct)!.itemId)])).toEqual(PAIRS.map((p) => [...p]));
      const rush = stepsOf(d, 'quickReply').find((s) => s.challenge)!;
      expect(rush.rounds.map((r) => strip(r.options.find((o) => o.correct)!.itemId))).toEqual(PAIRS.map((p) => p[1]));
      // The speed round quotes the host's own lines, each of which contains its question.
      const host = d.dialogues['meeting-host']!.nodes.filter((n) => n.who === 'npc').map((n) => n.en);
      rush.rounds.forEach((r, i) => { expect(host).toContain(r.npc!.en); expect(hasChunk(r.npc!.en, text(PAIRS[i]![0]))).toBe(true); });
      // …and the learner's three answers are each built from their pieces.
      expect(stepsOf(d, 'sentenceBuilder')[0]!.rounds.map((r) => strip(r.itemId))).toEqual(PAIRS.map((p) => p[1]));
    });
  }
  it('the learner\'s three answers are retrieved at least five times each', () => {
    for (const lang of LANGS) for (const id of ['name-a', 'from-a', 'first-a']) {
      const row = coverageOf(day(lang), lang).find((r) => r.id === id)!;
      expect(row.byKind.retrieval, `${lang} ${id}`).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('the learning arc', () => {
  it('orientation → blocks → answers → the questions (hear, then pair) → the warm words (hear, then meaning) → build → answer → conversation → review → speed → recovery → video → check', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'ambush' ? `ambush:${s.mode}` : s.kind === 'quickReply' && s.challenge ? 'quickReply:speed' : s.kind === 'video' ? `video:${s.mode}` : s.kind));
    expect(kinds).toEqual([
      'video:intro', 'talk', 'prime', 'tool', 'tool', 'tool', 'tool',
      'replies', 'receipt', 'matchPairs', 'replies', 'matchPairs', 'sentenceBuilder', 'quickReply',
      'dialogue', 'receipt', 'swipe', 'quickReply:speed', 'receipt', 'ambush:recovery', 'receipt',
      'video:again', 'quiz', 'quiz', 'quiz', 'quiz', 'receipt', 'summary',
    ]);
  });
  it('the final gate: the whole conversation with no translation first (the video), then a check of what the host says', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const again = d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
      const after = d.steps.slice(again + 1);
      expect(after.map((s) => s.kind), lang).toEqual(['quiz', 'quiz', 'quiz', 'quiz', 'receipt', 'summary']);
      expect(after.filter((s): s is Extract<BootcampStep, { kind: 'quiz' }> => s.kind === 'quiz').map((s) => strip(s.itemId)), lang).toEqual(['reply.social.welcome', 'reply.social.wonderful', 'reply.social.enjoy-stay', 'reply.social.great-day']);
      expect(d.steps.slice(0, again).some((s) => s.kind === 'quiz'), lang).toBe(false); // the check comes only after the video
    }
  });
  it('same journey in the three languages; every step is valid; builder chunks spell each language\'s own sentence', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId), p.answerLabel, p.answerGloss])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => [strip(r.itemId), r.chunks.length])];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'quiz') return [s.kind, strip(s.itemId), s.wrongIds.map(strip)];
      if (s.kind === 'tool') return [s.kind, strip(s.itemId)];
      if (s.kind === 'swipe') return [s.kind, s.itemIds.map(strip)];
      if (s.kind === 'ambush') return [s.kind, s.mode, strip(s.correctItemId), strip(s.wrongItemId)];
      if (s.kind === 'prime') return [s.kind, s.words.map((w) => w.key)];
      return s;
    });
    for (const lang of LANGS) {
      const d = day(lang);
      if (lang !== 'en') expect(shape(d), lang).toEqual(shape(day('en')));
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      for (const r of stepsOf(d, 'sentenceBuilder')[0]!.rounds) expect(r.chunks.join(' '), lang).toBe(d.items.find((i) => i.id === r.itemId)!.text);
    }
    expect(stepsOf(day('fr'), 'sentenceBuilder')[0]!.rounds.map((r) => r.chunks)).toEqual([['Je', 'm’appelle', 'Dan.'], ['Je', 'viens', 'd’Israël.'], ['C’est', 'ma', 'première fois', 'ici.']]);
    expect(stepsOf(day('es'), 'sentenceBuilder')[0]!.rounds.map((r) => r.chunks)).toEqual([['Me', 'llamo', 'Dan.'], ['Soy', 'de', 'Israel.'], ['Es', 'mi', 'primera vez', 'aquí.']]);
  });
  it('the polite forms stay as they are heard — no informal variant is introduced, no grammar is explained', () => {
    const es = JSON.stringify(day('es'));
    const fr = JSON.stringify(day('fr'));
    expect(es).not.toMatch(/¿Cómo te llamas|¿De dónde eres|tu primera vez/);
    expect(fr).not.toMatch(/Comment tu t’appelles|D’où viens-tu|ta première fois/);
    for (const lang of LANGS) expect(JSON.stringify(day(lang).steps)).not.toMatch(/conjugat|third person|גוף שלישי|נטיי/i);
  });
  it('four sentences were added for comprehension only — never asked for as something to say', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const added = ['reply.social.hello', 'reply.social.welcome', 'reply.social.wonderful', 'reply.social.great-day'];
      for (const id of added) expect(d.items.some((i) => strip(i.id) === id), `${lang} ${id}`).toBe(true);
      const produced = [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => strip(o.itemId)))), ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId))), ...stepsOf(d, 'tool').map((s) => strip(s.itemId))];
      for (const id of added) expect(produced, `${lang} ${id}`).not.toContain(id);
    }
    expect(['en', 'fr', 'es'].map((l) => day(l as CoverageLang).items.filter((i) => /reply\.social\.(hello|welcome|wonderful|great-day)$/.test(i.id)).map((i) => i.text))).toEqual([
      ['Hi!', 'Welcome!', 'Wonderful!', 'Have a great day!'], ['Bonjour !', 'Bienvenue !', 'Magnifique !', 'Bonne journée !'], ['¡Hola!', '¡Bienvenido!', '¡Qué maravilla!', '¡Que tenga un buen día!'],
    ]);
  });
});
