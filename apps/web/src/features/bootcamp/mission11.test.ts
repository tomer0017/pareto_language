import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HotelStaySummary, splitJourney } from './HotelStaySummary.js';
import { missionVideo } from '../videos/missionVideo.js';
import { answersFollow, runNpcBeat } from './dialogueBeat.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M11_CONCEPTS } from './mission11Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import {
  L_BYE, L_FOOD, L_TIP, M11_PROPS, M11_SLOTS, M11_STAGES, M11_TIP, SMALL_TALK_COMPLETE, Y_CLOSE, Y_ORIGIN,
  conversationFlow, localTip, smallTalkState,
} from './practiceSmallTalk.js';
import { validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, missionWalk, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { SpeakResult } from '../../shared/audio/tts.js';
import type { BootcampDayContent, BootcampStep } from './types.js';

/**
 * Mission 11 — Small Talk & Recommendations: "I talked to a local and got a recommendation." The
 * conversation is LOCKED. The traveller knows only that they are from Israel and that this is their
 * first visit; that the other person is local, the food, Mama Rosa and the Old Town all come from the
 * local's own lines — and the flow shows STAGES (Connect → Share → Ask → Close), never answers.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const IX = { en: 0, fr: 1, es: 2 } as const;
const day = (lang: CoverageLang, n = 11): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M11_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
/** Typography only: the brief writes ’ and ‘ ’ where the content writes ' (an apostrophe is an apostrophe). */
const quotes = (s: string): string => s.replace(/[’‘]/g, "'");
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
type VM = Extract<BootcampStep, { kind: 'visualMatch' }>;
type Round = QR['rounds'][number];
const accepted = (r: Round): string => strip(r.options.find((o) => o.correct)!.itemId);
const said = (d: BootcampDayContent, r: Round): string => { const o = r.options.find((x) => x.correct)!; return o.text ?? text(d, o.itemId); };
const heardIn = (d: BootcampDayContent, r: Round): string => r.npc?.en ?? text(d, r.promptItemId);
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));
const cardsOf = (d: BootcampDayContent) => stepsOf(d, 'prime').flatMap((p) => p.words);
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
const dialogueAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'dialogue');

/** The conversation exactly as the brief froze it (pasted verbatim). */
const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Hi! Beautiful view, isn’t it?', 'YOU: This place is beautiful.', 'NPC: It really is. Where are you from?', 'YOU: I’m from Israel. How about you?',
    'NPC: I’m from here! Is this your first time here?', 'YOU: Yes, it’s my first time here.', 'NPC: Welcome! Do you like it here?', 'YOU: Yes, I like it a lot.',
    'NPC: Me too. And the food here is wonderful.', 'YOU: Can you recommend a place?', 'NPC: Of course — try ‘Mama Rosa’, in the old town. It’s very good.',
    'YOU: Thank you! It was nice talking to you.', 'NPC: You too! Enjoy the rest of your trip!'],
  es: ['NPC: ¡Hola! Bonita vista, ¿verdad?', 'YOU: Este lugar es precioso.', 'NPC: Es verdad. ¿De dónde es?', 'YOU: Soy de Israel. ¿Y usted?',
    'NPC: ¡Soy de aquí! ¿Es su primera vez aquí?', 'YOU: Sí, es mi primera vez aquí.', 'NPC: ¡Bienvenido! ¿Le gusta este lugar?', 'YOU: Sí, me gusta mucho.',
    'NPC: Yo también. Y la comida de aquí es estupenda.', 'YOU: ¿Me puede recomendar un sitio?', 'NPC: Claro — pruebe «Mama Rosa», en el casco antiguo. Es muy bueno.',
    'YOU: ¡Gracias! Ha sido un placer hablar con usted.', 'NPC: ¡Igualmente! ¡Que disfrute del resto del viaje!'],
  fr: ['NPC: Bonjour ! Belle vue, n’est-ce pas ?', 'YOU: Cet endroit est magnifique.', 'NPC: C’est vrai. Vous venez d’où ?', 'YOU: Je viens d’Israël. Et vous ?',
    'NPC: Je suis d’ici ! C’est votre première fois ici ?', 'YOU: Oui, c’est ma première fois ici.', 'NPC: Bienvenue ! Ça vous plaît ici ?', 'YOU: Oui, j’aime beaucoup.',
    'NPC: Moi aussi. Et la cuisine ici est excellente.', 'YOU: Vous pouvez recommander un endroit ?', 'NPC: Bien sûr — essayez « Mama Rosa », dans la vieille ville. C’est très bon.',
    'YOU: Merci ! C’était sympa de discuter avec vous.', 'NPC: Vous aussi ! Profitez bien du reste de votre voyage !'],
};
const line = (lang: CoverageLang, i: number): string => script(lang)[i]!.slice(5);
/** The six lines the traveller says — the same sentence ids in every language. */
const LEARNER = ['phrase.talk.beautiful-place', 'phrase.talk.how-about-you', 'phrase.social.first-time', 'phrase.talk.i-like-it', 'phrase.talk.recommend-place', 'phrase.talk.nice-talking'];
const ORDER = [...LEARNER];
const SPOILERS = /Mama Rosa|old town|vieille ville|casco antiguo|Old Town|העיר העתיקה|מאמא רוזה|I'm from here|Je suis d’ici|Soy de aquí|מכאן|food|cuisine|comida|אוכל/i;
const TIP = /Mama Rosa|old town|vieille ville|casco antiguo|העיר העתיקה|מאמא רוזה/i;
const DIALOGUE_PRINT = { en: 'a78df554', es: 'cca14957', fr: '2cffe72c' };

describe('the conversation is locked, and Mission 11 is in its place', () => {
  for (const lang of LANGS) it(`${lang}: word for word the frozen one (tests 1–3)`, () => { expect(script(lang).map(quotes)).toEqual(LOCKED[lang].map(quotes)); });
  it('the dialogue tree is pinned: every turn a real decision, a miss is asked again slowly', () => {
    for (const lang of LANGS) {
      const nodes = day(lang).dialogues['small-talk']!.nodes;
      for (const n of nodes.filter((x) => x.who === 'you')) {
        expect(n.choices!.filter((c) => c.correct), `${lang} ${n.id}`).toHaveLength(1);
        for (const c of n.choices!.filter((x) => !x.correct)) {
          const reask = nodes.find((x) => x.id === c.next)!;
          expect([reask.who, reask.slow, reask.next], `${lang} ${n.id}`).toEqual(['npc', true, n.id]);
        }
      }
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
  });
  it('4. Mission 11 is "Small Talk & Recommendations", eleventh on the journey', () => {
    expect(BOOTCAMP_PLAN[10]!.id).toBe('small-talk');
    expect(missionNumber(BOOTCAMP_PLAN[10]!.day)).toBe(11);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Small Talk & Recommendations');
  });
  const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
  it('5. Missions 01–10 are byte-for-byte unchanged by this pass', () => { expect(raw(0, 10)).toEqual({ en: 'ba829776', es: '20686b5a', fr: '9e5aa74a' }); });
  it('6. Missions 12–30 are byte-for-byte unchanged by this pass', () => { expect(raw(11)).toEqual({ en: '1b79e2ea', es: '84144870', fr: '256a223c' }); });
  it('7. EN / ES / FR parity: the same journey, step for step, each in its own words', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [strip(r.promptItemId), Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct, Boolean(o.text)])])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles.map((t) => t.id), s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => [strip(r.itemId), r.chunks.length])];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'prime') return [s.kind, s.gate, s.label, s.words.map((w) => [w.key, w.emoji, w.image, w.line, w.review, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of ['es', 'fr'] as const) expect(shape(day(lang)), lang).toEqual(shape(day('en')));
    for (const lang of LANGS) {
      const d = day(lang);
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
    }
  });
});

describe('roles — the traveller says the six locked lines; the local is understood', () => {
  const productions = (d: BootcampDayContent): { id: string; text: string }[] => [
    ...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map((r) => ({ id: accepted(r), text: said(d, r) }))),
    ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => ({ id: strip(r.itemId), text: r.chunks.join(' ') }))),
  ];
  it('8. every line the traveller produces is a locked YOU line (or its known half) — all six are produced', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const you = LOCKED[lang].filter((l) => l.startsWith('YOU')).map((l) => quotes(l.slice(5)));
      expect(new Set(productions(d).map((p) => p.id)), lang).toEqual(new Set(LEARNER));
      for (const p of productions(d)) expect(you.some((y) => hasChunk(y, p.text)), `${lang} “${p.text}”`).toBe(true);
      for (const y of you) expect(productions(d).some((p) => quotes(p.text) === y || (y.endsWith('?') && quotes(p.text) === y)), `${lang} “${y}” is produced whole`).toBe(true);
    }
  });
  it('9. the local\'s lines are comprehension only — never an answer to pick', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const offered = stepsOf(d, 'quickReply').flatMap((s) => s.rounds.flatMap((r) => r.options.map((o) => o.text ?? text(d, o.itemId))));
      for (const c of M11_CONCEPTS.filter((x) => x.role === 'hear')) expect(offered.some((o) => hasChunk(o, c.chunk[lang])), `${lang} ${c.id}`).toBe(false);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect([...LEARNER, 'phrase.social.from-israel'], lang).toContain(strip(o.itemId));
    }
  });
  it('10. no line of the local is ever a builder target; the one builder is the traveller\'s request', () => {
    for (const lang of LANGS) {
      const b = stepsOf(day(lang), 'sentenceBuilder');
      expect(b.map((s) => strip(s.rounds[0]!.itemId))).toEqual(['phrase.talk.recommend-place']);
      for (const s of b) for (const r of s.rounds) expect(r.chunks.join(' '), lang).toBe(text(day(lang), r.itemId));
    }
  });
});

describe('PRIOR LEARNING — verified, not assumed (learnedBefore(lang, 11))', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 11);
  it('11. built from Missions 01–10, and reuses only what they really taught', () => {
    for (const lang of LANGS) {
      const p = prior(lang);
      expect(p.missions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      for (const id of ['from-israel', 'first-time-q', 'welcome', 'thank-you', 'of-course']) expect(p.knowsChunk(chunk(id, lang)), `${lang} ${id} is prior`).toBe(true);
      // "Yes, it's my first time here." is prior as its two Mission 01 pieces — "Yes" and "it's my first time here".
      for (const c of [['Yes', 'Sí', 'Oui'], ["it's my first time here", 'es mi primera vez aquí', 'c’est ma première fois ici']]) expect(p.knowsChunk(c[['en', 'es', 'fr'].indexOf(lang)]!), `${lang} ${c[0]}`).toBe(true);
      expect(p.knowsChunk(['Can you', '¿Me puede', 'Vous pouvez'][['en', 'es', 'fr'].indexOf(lang)]!), `${lang} "can you"`).toBe(true);
      for (const id of ['how-about-you', 'recommend', 'nice-talking', 'place-beautiful', 'like-it', 'beautiful-view', 'from-here', 'food-wonderful', 'mama-rosa', 'old-town', 'enjoy-trip']) expect(p.knowsChunk(chunk(id, lang)), `${lang} ${id} is new`).toBe(false);
    }
    // "Where are you from?" is prior in English and Spanish — Mission 01's French said "D’où venez-vous ?", not "Vous venez d’où ?".
    expect(LANGS.map((l) => prior(l).knowsChunk(chunk('where-from', l)))).toEqual([true, true, false]);
  });
  it('12. a line met only inside an earlier conversation is NOT learned', () => {
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 9) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} How about you? Can you recommend a place?` } : x)) } } };
    };
    const p = learnedBefore('en', 11, seen);
    expect(p.knowsChunk('How about you?')).toBe(false);
    expect(p.words.has('recommend')).toBe(false);
  });
  it('13. partial prior: the known half is a ♻️ review card, the new half its own card — never one whole "new" line', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const card = (key: string) => cardsOf(d).find((w) => w.key === key)!;
      expect(card('talk.line.from-israel').review, lang).toBe(true);
      expect(prior(lang).knowsChunk(card('talk.line.from-israel').text)).toBe(true);
      expect(card('talk.line.how-about-you').review, lang).toBeUndefined();
      expect(prior(lang).knowsChunk(card('talk.line.how-about-you').text)).toBe(false);
      expect(card('talk.line.first-time').review, lang).toBe(true);
      expect(cardsOf(d).some((w) => quotes(w.text) === quotes(Y_ORIGIN[IX[lang]])), lang).toBe(false); // the whole line is taught as its two halves
      // The request: "Can you" is reactivated, "recommend a place" is the new part — the builder keeps them apart.
      const [first, ...rest] = stepsOf(d, 'sentenceBuilder')[0]!.rounds[0]!.chunks;
      expect(prior(lang).knowsChunk(first!), lang).toBe(true);
      expect(prior(lang).knowsChunk(rest.join(' ')), lang).toBe(false);
      expect(primeAt(d, 'talk.line.from-israel')).toBeLessThan(primeAt(d, 'talk.line.how-about-you') + 1);
    }
  });
  /** A tested chunk is prepared when it is prior, or was taught earlier in Mission 11. */
  const unprepared = (d: BootcampDayContent, lang: CoverageLang): string[] => unpreparedChunks(d, lang, M11_CONCEPTS.filter((c) => !prior(lang).knowsChunk(c.chunk[lang])));
  for (const lang of LANGS) {
    it(`14. ${lang}: every tested word is taught here or verifiably learned before; every NEW chunk is taught before it is tested`, () => {
      expect(unpreparedWords(day(lang), prior(lang).words)).toEqual([]);
      expect(unprepared(day(lang), lang)).toEqual([]);
    });
  }
  it('14b. the only chunk tested before its card is a prior one: "I’m from Israel." (Mission 01), a wrong option in the first answer', () => {
    for (const lang of LANGS) {
      const strict = unpreparedChunks(day(lang), lang, M11_CONCEPTS);
      expect(strict.map((s) => s.replace(/ in “.*$/, '')), lang).toEqual(['step 3 quickReply: from-israel']);
      expect(prior(lang).knowsChunk(chunk('from-israel', lang))).toBe(true);
    }
  });
  const order = (d: BootcampDayContent, c: string) => {
    const { taught, tested } = missionWalk(d);
    return { teach: Math.min(...taught.filter((e) => hasChunk(e.text, c)).map((e) => e.at)), test: Math.min(...tested.filter((e) => hasChunk(e.text, c)).map((e) => e.at)) };
  };
  it('14c. TEACH → TEST for every new chunk: its card always comes before its first test', () => {
    for (const lang of LANGS) for (const c of M11_CONCEPTS.filter((x) => !prior(lang).knowsChunk(x.chunk[lang]))) {
      const o = order(day(lang), c.chunk[lang]);
      if (!Number.isFinite(o.test)) continue; // heard only (cards, by ear, the conversation)
      expect(o.teach, `${lang} ${c.id}`).toBeLessThan(o.test);
    }
  });
  it('negative mutation: "souvenir market" planted in a tested line is caught — and in an earlier conversation it is still not learned', () => {
    const d = day('en');
    const at = d.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge);
    const qr = d.steps[at] as QR;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, i) => (i === at ? { ...qr, rounds: [{ ...qr.rounds[0]!, npc: { en: "Hi! Beautiful souvenir market, isn't it?", he: 'x' } }, ...qr.rounds.slice(1)] } : s)) };
    const caught = unpreparedWords(planted, prior('en').words);
    // "market" is verifiably prior (Mission 02 is set at a market) — so only "souvenir" is new, and caught.
    expect(caught.map((c) => c.replace(/^.*: (“\w+”) in .*$/, '$1'))).toEqual(['“souvenir”']);
    expect(prior('en').words.has('market')).toBe(true);
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 9) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} The souvenir market is over there.` } : x)) } } };
    };
    const earlier = learnedBefore('en', 11, seen);
    expect(earlier.words.has('souvenir')).toBe(false);
    expect(unpreparedWords(planted, earlier.words).join(' ')).toMatch(/“souvenir”/);
  });
  it('negative mutation: without the "How about you?" card or the request card, their retrieval is unprepared', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (...keys: string[]): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => !keys.includes(w.key ?? '')) } : s)) });
      expect(unprepared(without('talk.line.how-about-you'), lang).join(' '), lang).toMatch(/how-about-you/);
      expect(unprepared(without('talk.line.recommend'), lang).join(' '), lang).toMatch(/recommend/);
      expect(unprepared(without('talk.line.tip'), lang).join(' '), lang).toMatch(/mama-rosa|old-town/);
    }
  });
});

describe('the bounce-back — answer, then return the question', () => {
  it('15. the origin answer is BOTH halves: I’m from Israel + How about you?', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const wrapped = stepsOf(d, 'quickReply').flatMap((s) => s.rounds).filter((r) => accepted(r) === 'phrase.talk.how-about-you' && r.options.find((o) => o.correct)!.text);
      expect(wrapped.length, lang).toBeGreaterThanOrEqual(4);
      for (const r of wrapped) {
        expect(hasChunk(said(d, r), chunk('from-israel', lang)) && hasChunk(said(d, r), chunk('how-about-you', lang)), lang).toBe(true);
        expect(heardIn(d, r), lang).toBe(line(lang, 2));
      }
      expect(line(lang, 3)).toBe(Y_ORIGIN[IX[lang]]);
    }
  });
  it('16. "How about you?" is trained as conversational continuation — after your answer, to keep it going', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const qr = stepsOf(d, 'quickReply');
      const bounce = qr.find((s) => s.label?.en === 'Answer → return the question')!;
      expect(bounce.rounds[0]!.options.map((o) => [strip(o.itemId), o.correct])).toContainEqual(['phrase.social.from-israel', false]); // answering alone is not enough here
      const alone = qr.flatMap((s) => s.rounds).filter((r) => accepted(r) === 'phrase.talk.how-about-you' && !r.options.find((o) => o.correct)!.text);
      expect(alone.map((r) => r.situation?.en)).toEqual(['You said where you are from. Now return the question — keep the conversation going.']);
    }
  });
  it('17. it is never icon matching: no picture or emoji is ever an answer in this mission', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'matchPairs').length + stepsOf(d, 'miniMap').length + stepsOf(d, 'swap').length + stepsOf(d, 'customize').length, lang).toBe(0);
      for (const s of stepsOf(d, 'visualMatch')) for (const t of s.tiles) { expect(t.emoji, lang).toBeUndefined(); expect(t.image, lang).toBeUndefined(); }
    }
  });
});

describe('the traveller\'s initiative — asking for a recommendation', () => {
  it('18–19. it always follows the local\'s food comment — a comment, not a question', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const food = primeAt(d, 'talk.line.food');
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
        if (accepted(r) !== 'phrase.talk.recommend-place') continue;
        expect(d.steps.indexOf(s), lang).toBeGreaterThan(food);
        if (r.situation) expect(r.situation.en).toBe('The local says the food here is wonderful. You want a local recommendation.');
        else { expect(heardIn(d, r)).toBe(L_FOOD[IX[lang]]); expect(heardIn(d, r)).not.toMatch(/\?/); }
      }
    }
  });
  it('20. in the conversation, nobody asks: the traveller takes the turn after "the food here is wonderful"', () => {
    for (const lang of LANGS) {
      const nodes = day(lang).dialogues['small-talk']!.nodes;
      const ask = nodes.find((n) => n.choices?.some((c) => c.correct && strip(c.itemId) === 'phrase.talk.recommend-place'))!;
      const before = nodes.find((n) => n.next === ask.id && n.who === 'npc' && !n.slow)!;
      expect(before.en, lang).toBe(L_FOOD[IX[lang]]);
      expect(before.en).not.toMatch(/\?/);
    }
  });
});

describe('the local tip — an information gap', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('the briefing is the brief\'s, with the traveller card (🇮🇱 Israel · 🧳 First visit) and nothing more', () => {
    for (const lang of LANGS) {
      const b = briefing(lang);
      expect(b.body.map((x) => x.he)).toEqual(['אתה מטייל במקום יפה ומתחילה שיחה עם מישהו לידך. נסה להחזיק את השיחה ולקבל ממנו המלצה מקומית.']);
      expect(b.facts!.map((f) => [f.icon, f.value.en])).toEqual([['🇮🇱', 'Israel'], ['🧳', 'First visit']]);
      expect(b.title.en).toBe('Mission 11: Small Talk & Recommendations');
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
    }
  });
  it('21–22. the briefing names no Mama Rosa, no Old Town — and not that the person is local, nor the food', () => {
    for (const lang of LANGS) expect(JSON.stringify(briefing(lang)), lang).not.toMatch(SPOILERS);
  });
  it('23–24. Mama Rosa and the Old Town appear first on the card of the recommendation line — nowhere before it', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(d.steps.findIndex((s) => TIP.test(JSON.stringify(s))), lang).toBe(primeAt(d, 'talk.line.tip'));
      // …and nothing tells the learner the person is local before that person says so.
      expect(d.steps.findIndex((s) => /local|מקומי/i.test(JSON.stringify(s).replace(/local recommendation|המלצה מקומית/g, ''))), lang).toBeGreaterThan(primeAt(d, 'talk.line.from-here') - 1);
    }
  });
  it('23–24b. in every run of the conversation (supported, no help, final) the tip appears only from its line on', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const runs = [[stepsOf(d, 'replies').map((s) => d.steps.indexOf(s))[0]! + 1, dialogueAt(d)], [dialogueAt(d) + 2, videoAt(d)], [videoAt(d) + 1, d.steps.length]] as const;
      for (const [from, to] of runs) {
        const run = d.steps.slice(from, to);
        const tipLine = run.findIndex((s) => JSON.stringify(s).includes(JSON.stringify(L_TIP[IX[lang]]).slice(1, -1)));
        expect(tipLine, `${lang} run ${from}`).toBeGreaterThan(0);
        for (const s of run.slice(0, tipLine)) expect(JSON.stringify(s), `${lang} run ${from}`).not.toMatch(TIP);
      }
    }
  });
  it('25–26. the Local Tip card is "?" until the line is heard, and fills only after the capture', () => {
    expect(localTip(false)).toEqual(['📍 טיפ מקומי: ?', '📍 Local tip: ?']);
    expect(localTip(true)).toEqual(['📍 Mama Rosa · העיר העתיקה', '📍 Mama Rosa · Old Town']);
    expect(smallTalkState(0)).toEqual({ conversationStage: 'connect', stagesDone: 0, localTipPlace: null, localTipArea: null });
    for (const lang of LANGS) {
      const d = day(lang);
      const firstCapture = d.steps.findIndex((s) => s.kind === 'visualMatch');
      const filled = d.steps.findIndex((s) => JSON.stringify(s).includes(localTip(true)[1]) || JSON.stringify(s).includes('LOCAL TIP FOUND'));
      expect(filled, lang).toBe(firstCapture + 1);
      for (const s of stepsOf(d, 'quickReply')) if (s.label && d.steps.indexOf(s) < firstCapture) expect(s.label.en, lang).not.toContain('Mama Rosa');
    }
  });
  it('27–28. the capture: the place is Mama Rosa, the area is the Old Town — fair names, no pictures', () => {
    expect(M11_TIP).toEqual({ place: 'mama-rosa', area: 'old-town' });
    for (const lang of LANGS) {
      const caps = stepsOf(day(lang), 'visualMatch') as VM[];
      const first = caps[0]!;
      expect(first.rounds.map((r) => [r.correct, r.show])).toEqual([['mama-rosa', ['mama-rosa', 'luna-cafe', 'casa-verde']], ['old-town', ['old-town', 'city-centre', 'beach']]]);
      expect(first.tiles.find((t) => t.id === 'old-town')!.label).toBe({ en: 'Old Town', es: 'Casco antiguo', fr: 'Vieille ville' }[lang]);
      for (const s of caps) for (const r of s.rounds) expect(r.audio.en, lang).toBe(L_TIP[IX[lang]]);
      for (const s of caps.slice(1)) {
        expect(s.rounds.map((r) => r.correct)).toEqual(['mama-rosa@old-town']);
        expect(s.tiles.map((t) => t.id)).toEqual(['mama-rosa@old-town', 'mama-rosa@city-centre', 'luna-cafe@old-town']); // one fact right is not enough
      }
      expect(caps).toHaveLength(4);
    }
  });
});

describe('closing the conversation', () => {
  it('29. the closing is taught as ONE useful chunk: a card of the whole line, no builder, said whole', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(cardsOf(d).filter((w) => w.text === Y_CLOSE[IX[lang]]), lang).toHaveLength(1);
      expect(stepsOf(d, 'sentenceBuilder').some((s) => s.rounds.some((r) => strip(r.itemId) === 'phrase.talk.nice-talking'))).toBe(false);
      for (const r of stepsOf(d, 'quickReply').flatMap((s) => s.rounds)) if (accepted(r) === 'phrase.talk.nice-talking') expect(said(d, r), lang).toBe(Y_CLOSE[IX[lang]]);
    }
  });
  it('30. the closing comes only after the recommendation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
        if (accepted(r) !== 'phrase.talk.nice-talking') continue;
        expect(d.steps.indexOf(s), lang).toBeGreaterThan(primeAt(d, 'talk.line.tip'));
        if (r.situation) expect(r.situation.en).toMatch(/You got your recommendation/);
        else expect(heardIn(d, r)).toBe(L_TIP[IX[lang]]);
      }
    }
  });
  it('31. the local\'s goodbye stays comprehension: a card, heard by ear — never an answer', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'replies').map((s) => [strip(s.saidItemId), s.replyIds.map(strip)])).toEqual([['phrase.talk.nice-talking', ['reply.talk.goodbye', 'reply.talk.you-should-try']]]);
      expect(text(d, `${lang}.reply.talk.goodbye`)).toBe(L_BYE[IX[lang]]);
      expect(encounters(d, chunk('enjoy-trip', lang)).some((e) => e.kind === 'listening')).toBe(true);
    }
  });
});

describe('no bad pedagogy', () => {
  const copy = (d: BootcampDayContent): string => JSON.stringify(d.steps);
  it('32. no grammar lesson for "isn’t it": the opening is taught by its whole meaning ("the view is beautiful, right?")', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(copy(d), lang).not.toMatch(/tag question|grammar|דקדוק|tense|conjugat|פועל|present simple/i);
      expect(cardsOf(d).some((w) => /^(isn't it\??|n’est-ce pas \??|¿verdad\?)$/i.test(quotes(w.text))), lang).toBe(false);
      expect(cardsOf(d).find((w) => w.key === 'talk.line.opening')!.meaning.en).toBe('Hi! The view is beautiful, right?');
    }
  });
  it('33–34. no isolated adjective quiz: "beautiful" and "wonderful" are never a card, tile or answer on their own', () => {
    const lone = /^(beautiful|wonderful|bonita|precioso|estupenda|belle|magnifique|excellente)$/i;
    for (const lang of LANGS) {
      const d = day(lang);
      for (const w of cardsOf(d)) expect(plain(w.text).trim(), lang).not.toMatch(lone);
      for (const s of stepsOf(d, 'visualMatch')) for (const t of s.tiles) expect(t.label ?? '', lang).not.toMatch(lone);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(plain(o.text ?? text(d, o.itemId)).trim()).not.toMatch(lone);
    }
  });
  it('35–36. no icon matching for the recommendation, and no Old Town navigation game', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'miniMap'), lang).toHaveLength(0);
      expect(stepsOf(d, 'matchPairs'), lang).toHaveLength(0);
      expect(copy(d)).not.toMatch(/⭐|presentation/);
    }
  });
  it('37. nothing off-topic: no weather, family or work', () => {
    for (const lang of LANGS) expect(copy(day(lang)) + JSON.stringify(day(lang).items), lang).not.toMatch(/weather|rain|sunny|family|brother|sister|\bwork\b|\bjob\b|météo|pluie|famille|travail|lluvia|familia|trabajo|מזג אוויר|משפחה|עבודה/i);
  });
  it('38. no artificial recovery phrase anywhere — not in the practice, not in the conversation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(JSON.stringify(d), lang).not.toMatch(/recovery\./);
      expect(stepsOf(d, 'ambush').length + stepsOf(d, 'quiz').length + stepsOf(d, 'swipe').length + stepsOf(d, 'tool').length, lang).toBe(0);
    }
  });
});

describe('the conversation flow — Connect → Share → Ask → Close', () => {
  const runAnswers = (d: BootcampDayContent, from: number, to: number): string[] => d.steps.slice(from, to).flatMap((s) => (s.kind === 'quickReply' ? s.rounds.map(accepted) : s.kind === 'visualMatch' ? ['📍'] : []));
  const WHOLE = [...ORDER.slice(0, 5), '📍', ORDER[5]!];
  it('39. the stages, in order — and the teaching walks the conversation in its own order', () => {
    expect(M11_STAGES).toEqual(['connect', 'share', 'ask', 'close']);
    expect(conversationFlow(0)[1]).toBe('💬 Connect ⬜ · 🗣️ Share ⬜ · 🙋 Ask ⬜ · 👋 Close ⬜');
    expect(conversationFlow(4)[1]).toBe('💬 Connect ✅ · 🗣️ Share ✅ · 🙋 Ask ✅ · 👋 Close ✅');
    for (let n = 0; n <= 4; n++) for (const s of conversationFlow(n)) expect(s).not.toMatch(TIP);
    for (const lang of LANGS) {
      const d = day(lang);
      const at = ['opening', 'where', 'from-here', 'like-q', 'food', 'tip', 'close'].map((k) => primeAt(d, `talk.line.${k}`));
      expect([...at].sort((a, b) => a - b), lang).toEqual(at);
      const teach = runAnswers(d, 0, stepsOf(d, 'replies').map((s) => d.steps.indexOf(s))[0]!);
      expect(teach.filter((x, i) => teach.indexOf(x) === i), lang).toEqual(WHOLE);
    }
  });
  it('40. the supported conversation keeps the whole order — with the flow on screen', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const from = d.steps.findIndex((s) => s.kind === 'replies') + 1;
      expect(runAnswers(d, from, dialogueAt(d)), lang).toEqual(WHOLE);
      const labels = d.steps.slice(from, dialogueAt(d)).filter((s): s is QR => s.kind === 'quickReply').map((s) => s.label!.en);
      expect(labels).toEqual([0, 1, 2, 3].map((n) => `${conversationFlow(n)[1]} · ${localTip(n === 3)[1]}`));
    }
  });
  it('41. no help: the whole order, the local\'s real lines at natural speed — no flow, no tip card, no translation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(runAnswers(d, dialogueAt(d) + 1, videoAt(d)), lang).toEqual(WHOLE);
      for (const s of d.steps.slice(dialogueAt(d) + 1, videoAt(d))) {
        if (s.kind === 'quickReply') { expect(s.challenge, lang).toBe(true); expect(s.label).toBeUndefined(); for (const r of s.rounds) { expect(r.npc, lang).toBeDefined(); expect(r.situation).toBeUndefined(); } }
        if (s.kind === 'visualMatch') expect(s.challenge, lang).toBe(true);
      }
      const ch = stepsOf(d, 'quickReply').find((x) => x.challenge)!;
      expect(ch.rounds.map((r) => r.npc!.en)).toEqual([0, 2, 4, 6, 8].map((i) => line(lang, i)));
    }
  });
  it('42. the final conversation (after the video): compact — each ability once, in order', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const gate = d.steps.slice(videoAt(d) + 1);
      expect(gate.map((s) => s.kind)).toEqual(['quickReply', 'quickReply', 'quickReply', 'visualMatch', 'quickReply', 'receipt', 'summary']);
      expect(runAnswers(d, videoAt(d) + 1, d.steps.length), lang).toEqual(WHOLE);
    }
  });
  it('43. 💬 SMALL TALK COMPLETE (with 📍 LOCAL TIP FOUND) only once, at the very end — no score', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const ends = d.steps.map((s, i) => [s, i] as const).filter(([s]) => JSON.stringify(s).includes('SMALL TALK COMPLETE'));
      expect(ends.map(([, i]) => i), lang).toEqual([d.steps.length - 2]);
      const end = ends[0]![0] as Extract<BootcampStep, { kind: 'receipt' }>;
      expect(end.text).toEqual({ he: SMALL_TALK_COMPLETE[0], en: SMALL_TALK_COMPLETE[1] });
      expect(end.text.en).toMatch(/^💬 SMALL TALK COMPLETE · 📍 LOCAL TIP FOUND: Mama Rosa · Old Town/);
      expect(end.text.en).not.toMatch(/\d+ ?(%|\/|points|score)/i);
      expect(d.steps.at(-1)!.kind).toBe('summary');
    }
  });
});

describe('audio never blocks the answer (the corrected conversation behaviour)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const beat = (lang: CoverageLang, id: string) => {
    const d = day(lang).dialogues['small-talk']!;
    const calls: string[] = [];
    let finish: (r: SpeakResult) => void = () => undefined;
    runNpcBeat(d, d.nodes.find((n) => n.id === id)!, {
      speak: () => { calls.push('speak'); return new Promise<SpeakResult>((r) => { finish = r; }); },
      go: (next) => calls.push(`go:${next}`), end: () => calls.push('end'), later: (fn) => fn(), cancelled: () => false,
    });
    return { calls, finish: async (r: SpeakResult) => { finish(r); await Promise.resolve(); await Promise.resolve(); } };
  };
  it('44–46. every line of the local that is answered shows the choices AT ONCE, while its audio keeps playing', async () => {
    for (const lang of LANGS) {
      const d = day(lang).dialogues['small-talk']!;
      const answered = d.nodes.filter((n) => answersFollow(d, n));
      expect(answered.length, lang).toBeGreaterThanOrEqual(12); // the six lines + their slow re-asks
      for (const n of answered) {
        const run = beat(lang, n.id);
        expect(run.calls, `${lang} ${n.id}`).toEqual(['speak', `go:${n.next}`]); // no waiting for "ended"
        await run.finish('ended');
        expect(run.calls.filter((c) => c.startsWith('go:'))).toHaveLength(1);
      }
      // The goodbye has nothing to answer after it: it is heard to the end, then the scene closes.
      const bye = beat(lang, d.nodes.find((n) => n.end)!.id);
      expect(bye.calls).toEqual(['speak']);
      await bye.finish('ended');
      expect(bye.calls.at(-1)).toBe('end');
    }
  });
  it('47. answering mid-line stops the local\'s line: your answer replaces it — nothing overlaps', async () => {
    class U { text: string; lang = ''; rate = 1; voice: unknown = null; volume = 1; onend: (() => void) | null = null; onerror: ((e: { error: string }) => void) | null = null; constructor(t: string) { this.text = t; } }
    const synth = { speaking: false, current: null as U | null, spoken: [] as string[], getVoices: () => [{ name: 'Samantha', lang: 'en-US', localService: true, default: true }], addEventListener() {}, removeEventListener() {}, resume() {},
      cancel() { const u = this.current; this.speaking = false; this.current = null; u?.onerror?.({ error: 'canceled' }); }, speak(u: U) { this.current = u; this.speaking = true; this.spoken.push(u.text); } };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', U);
    vi.resetModules();
    const tts = await import('../../shared/audio/tts.js');
    const tipLine = tts.speak(L_TIP[0], 'en');
    void tts.speak(Y_CLOSE[0], 'en');
    expect(await tipLine).toBe('interrupted');
    expect(synth.current?.text).toBe(Y_CLOSE[0]);
    tts.cancelSpeech();
    expect(synth.current).toBeNull();
  });
  it('48. replay stays: the conversation and the quick replies keep their 🔊 replay', () => {
    const read = (f: string): string => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');
    expect(read('./Bootcamp.tsx')).toContain("🔊 {t('replayQuestion')}");
    expect(read('./PracticeSteps.tsx')).toMatch(/AudioBubble onPlay=/);
    expect(read('./PracticeSteps.tsx')).not.toMatch(/audioFinished|hasFinishedSpeaking|showChoicesAfterAudio|onAudioEnded/);
  });
});

describe('coverage: every meaningful chunk, no orphan', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M11_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(quotes(l.slice(5)), quotes(c.chunk[lang]))), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M11_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(quotes(l.slice(5))).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
    expect(M11_CONCEPTS.filter((c) => c.role === 'say').map((c) => c.id)).toEqual(['place-beautiful', 'from-israel', 'how-about-you', 'first-time', 'like-it', 'recommend', 'thank-you', 'nice-talking']);
  });
  for (const lang of LANGS) it(`${lang}: every chunk is COVERED (3+ encounters, 2+ kinds, meaning shown, heard or retrieved)`, () => {
    for (const row of coverageOf(day(lang), lang, M11_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true);
  });
  it('the local\'s lines are each a card with its meaning, then heard outside the conversation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const c of M11_CONCEPTS.filter((x) => x.role === 'hear')) {
        expect(cardsOf(d).some((w) => hasChunk(w.text, c.chunk[lang]) && w.meaning.he), `${lang} ${c.id}`).toBe(true);
        expect(encounters(d, c.chunk[lang]).some((e) => e.kind === 'listening'), `${lang} ${c.id} heard`).toBe(true);
      }
    }
  });
  it('the three superpowers get the most practice: How about you? · Can you recommend a place? · It was nice talking to you.', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const n = (id: string) => encounters(d, chunk(id, lang)).filter((e) => e.kind === 'retrieval').length;
      for (const id of ['how-about-you', 'recommend', 'nice-talking']) expect(n(id), `${lang} ${id}`).toBeGreaterThanOrEqual(5);
      expect(n('recommend')).toBeGreaterThan(n('place-beautiful'));
    }
  });
  it('33 meaningful interactions — inside 30–33, no filler', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const n = d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' ? s.rounds.length
        : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : 0), 0);
      expect(n, lang).toBe(33);
    }
  });
});

describe('the arc, state, visuals and video', () => {
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk',
      'prime', 'quickReply',
      'prime', 'quickReply', 'quickReply',
      'prime', 'quickReply',
      'prime', 'quickReply',
      'prime', 'sentenceBuilder', 'quickReply',
      'prime', 'visualMatch', 'receipt',
      'prime', 'quickReply', 'replies',
      'quickReply', 'quickReply', 'quickReply', 'visualMatch', 'quickReply', 'receipt',
      'dialogue', 'receipt',
      'quickReply:speed', 'visualMatch:speed', 'quickReply:speed', 'receipt',
      'video:again',
      'quickReply', 'quickReply', 'quickReply', 'visualMatch:speed', 'quickReply', 'receipt', 'summary',
    ]);
  });
  it('plain serialisable state: stage, and the tip only once it was heard', () => {
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
    expect(smallTalkState(2)).toEqual({ conversationStage: 'ask', stagesDone: 2, localTipPlace: null, localTipArea: null });
    expect(smallTalkState(4, true)).toEqual({ conversationStage: 'close', stagesDone: 4, localTipPlace: 'mama-rosa', localTipArea: 'old-town' });
    for (let n = 0; n <= 4; n++) for (const t of [false, true]) expect(JSON.parse(JSON.stringify(smallTalkState(n, t)))).toEqual(smallTalkState(n, t));
  });
  it('the flow renders as four stage cells, the tip as a note beside it — nothing added', () => {
    for (let n = 0; n <= 4; n++) for (const tipFound of [false, true]) {
      const str = `${conversationFlow(n)[1]} · ${localTip(tipFound)[1]}`;
      const parts = splitJourney(str)!;
      expect(parts.facts).toHaveLength(4);
      expect(parts.facts.filter((f) => f.endsWith('✅'))).toHaveLength(n);
      expect(parts.after).toBe(localTip(tipFound)[1]);
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: str }));
      expect(html.match(/class="hotel-stay-fact"/g)).toHaveLength(4);
    }
  });
  it('visual slots: 11 semantic slots and 2 result props — PLACEHOLDERS (emoji), no stand-in artwork, no text baked in', () => {
    expect(Object.keys(M11_SLOTS).sort()).toEqual(['ask-recommendation', 'bounce-back', 'first-time', 'food-comment', 'friendly-closing', 'like-it', 'local-opens', 'local-recommends', 'origin', 'scenic-viewpoint', 'traveler-reacts']);
    expect(Object.keys(M11_PROPS).sort()).toEqual(['mama-rosa', 'small-talk-complete']);
    for (const s of [...Object.values(M11_SLOTS), ...Object.values(M11_PROPS)]) expect((s as { image?: string }).image).toBeUndefined();
    const manifest = readFileSync(fileURLToPath(new URL('../../../../../docs/MISSION11_ASSET_MANIFEST.md', import.meta.url)), 'utf8');
    expect(manifest).toMatch(/VISUAL PRODUCTION REQUIRED/);
    for (const key of [...Object.keys(M11_SLOTS), ...Object.keys(M11_PROPS)]) expect(manifest, key).toContain(`\`${key}\``);
  });
  it('every card picture comes from a slot, the same in every language; no picture before its line names the tip', () => {
    const emoji = new Set(Object.values(M11_SLOTS).map((s) => s.emoji));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) for (const [key, pic] of pics(lang)) expect(emoji, `${lang} ${key}`).toContain(pic);
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    const before = stepsOf(day('en'), 'prime').slice(0, 5).flatMap((p) => p.words.map((w) => w.emoji));
    expect(before).not.toContain(M11_SLOTS['local-recommends'].emoji);
    expect(before).not.toContain(M11_PROPS['mama-rosa'].emoji);
  });
  it('video: none recorded yet in any language — the standard step is there and safely skipped; replay keeps the mission\'s progress', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[10]!.day);
      expect(video, lang).toBeUndefined();
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
});
