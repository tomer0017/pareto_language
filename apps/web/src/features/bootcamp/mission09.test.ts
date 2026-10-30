import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HotelStaySummary, splitJourney } from './HotelStaySummary.js';
import { missionVideo } from '../videos/missionVideo.js';
import { beforeCueFreeze } from './cueFreeze.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M09_CONCEPTS } from './mission09Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import { M09_ANSWER, M09_PROPS, M09_SHOP, M09_SIZES, M09_SLOTS, M09_STAGES, shoppingJourney, shoppingState } from './practiceArrival.js';
import { validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, missionWalk, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { RETIRED_SENTENCES } from './retired.js';
import type { BootcampDayContent, BootcampStep, MatchTile } from './types.js';

/**
 * Mission 09 — Shopping: "I actually bought something in a foreign-language store." The conversation
 * is LOCKED. The shopper walks in knowing only the shop and the jacket they like; the size problem,
 * one size up, the sale and the till all happen to them — and the journey shows STAGES, never answers.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const day = (lang: CoverageLang, n = 9): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M09_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
type Game = Extract<BootcampStep, { kind: 'visualMatch' | 'miniMap' }>;
const accepted = (r: QR['rounds'][number]): string => strip(r.options.find((o) => o.correct)!.itemId);
const cardKeys = (d: BootcampDayContent): (string | undefined)[] => stepsOf(d, 'prime').filter((p) => !p.gate).flatMap((p) => p.words.map((w) => w.key));
const primeAt = (d: BootcampDayContent, key: string): number => d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === key));

const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Hi there! Can I help you find anything?', "YOU: I'm just looking, thanks.", 'NPC: Of course, take your time. Let me know if you need a hand.', 'YOU: Can I try this on?',
    'NPC: Sure! What size are you? The fitting room is over there.', 'YOU: Do you have a bigger size?', 'NPC: Here you go, one size up. And good news — it’s on sale, twenty percent off!', "YOU: Great, I'll take it.",
    'NPC: Wonderful — I’ll ring you up at the till. Thank you!'],
  es: ['NPC: ¡Hola! ¿Le ayudo a encontrar algo?', 'YOU: Solo estoy mirando, gracias.', 'NPC: Claro, tómese su tiempo. Avíseme si necesita ayuda.', 'YOU: ¿Puedo probarme esto?',
    'NPC: ¡Claro! ¿Qué talla usa? El probador está allí.', 'YOU: ¿Tiene una talla más grande?', 'NPC: Aquí tiene, una talla más. Y buena noticia — ¡está rebajado, un veinte por ciento de descuento!', 'YOU: Genial, me lo llevo.',
    'NPC: Perfecto — le cobro en la caja. ¡Gracias!'],
  fr: ['NPC: Bonjour ! Je peux vous aider à trouver quelque chose ?', 'YOU: Je regarde seulement, merci.', 'NPC: Bien sûr, prenez votre temps. Dites-moi si vous avez besoin d’aide.', 'YOU: Je peux essayer ça ?',
    'NPC: Bien sûr ! Vous faites quelle taille ? La cabine d’essayage est là-bas.', 'YOU: Vous avez une taille au-dessus ?', 'NPC: Voilà, une taille au-dessus. Et bonne nouvelle — c’est en solde, vingt pour cent de réduction !', 'YOU: Super, je le prends.',
    'NPC: Parfait — je vous encaisse à la caisse. Merci !'],
};
const line = (lang: CoverageLang, i: number): string => LOCKED[lang][i]!.slice(5);
const DIALOGUE_PRINT = { en: 'cac51b9b', es: '79dcf646', fr: 'b7cec987' };
/** The tree before this pass (it pinned in practiceArrival.test.ts) — reached again by undoing the one itemId change. */
const DIALOGUE_BEFORE = { en: 'd465f995', es: 'a509ca20', fr: '652f21b9' };
const LEARNER = ['phrase.shop.just-looking', 'phrase.shop.try-on', 'phrase.shop.bigger', 'phrase.shop.great-take-it'];
const games = (d: BootcampDayContent) => d.steps.flatMap((s, at) => (s.kind === 'visualMatch' || s.kind === 'miniMap' ? s.rounds.map((r) => ({ s, r, at })) : []));
const sizeGames = (d: BootcampDayContent) => stepsOf(d, 'visualMatch').filter((s) => s.tiles.some((t) => t.id === 'size-L'));
const discountGames = (d: BootcampDayContent) => stepsOf(d, 'visualMatch').filter((s) => s.tiles.some((t) => t.id === 'off-20'));
const storeGames = (d: BootcampDayContent) => stepsOf(d, 'miniMap');
const SPOILERS = /bigger|más grande|au-dessus|size up|una talla más|on sale|rebajado|en solde|20|twenty|veinte|vingt|percent|por ciento|pour cent|PURCHASE|I'll take|me lo llevo|je le prends|till|caja|caisse|גדולה יותר|מבצע|הנחה|קופה|לקנות!/i;

describe('the conversation is locked, and Mission 09 is in its place', () => {
  for (const lang of LANGS) it(`${lang}: word for word the frozen one`, () => { expect(script(lang)).toEqual(LOCKED[lang]); });
  it('the dialogue tree keeps every line and side-branch; only "Great, I\'ll take it." now points at its own sentence', () => {
    for (const lang of LANGS) {
      const nodes = day(lang).dialogues['clothing-shop']!.nodes;
      expect(nodes.map((n) => n.id), lang).toEqual(['n1', 'c1', 'n2', 'c1b', 'n3', 'c2', 'r2', 'c2b', 'n4', 'c3', 'n4b', 'c3b', 'n5']);
      const c3 = nodes.find((n) => n.id === 'c3')!.choices!;
      expect(c3.map((c) => strip(c.itemId)), lang).toEqual(['phrase.shop.great-take-it', 'phrase.shop.too-expensive']);
      expect(text(day(lang), c3[0]!.itemId), lang).toBe(c3[0]!.en);
      expect(strip(nodes.find((n) => n.id === 'c3b')!.choices![0]!.itemId), lang).toBe('phrase.shop.take-it');
    }
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual(DIALOGUE_PRINT);
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify([beforeCueFreeze(day(l), l)].map((d) => d.dialogues)).replace(`"${l}.phrase.shop.great-take-it"`, `"${l}.phrase.shop.take-it"`))]))).toEqual(DIALOGUE_BEFORE);
  });
  it('Mission 09 is "Shopping", ninth on the journey', () => {
    expect(BOOTCAMP_PLAN[8]!.id).toBe('shopping');
    expect(missionNumber(BOOTCAMP_PLAN[8]!.day)).toBe(9);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Shopping');
  });
  it('Missions 01–08 and 10–30 are byte-for-byte unchanged by this pass', () => {
    const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
    expect(raw(0, 8)).toEqual({ en: 'e616596b', es: 'b87a5773', fr: '4a0094dd' });
    expect(raw(9)).toEqual({ en: '0a05d32a', es: '344c16b8', fr: 'b2f019ab' });
  });
});
describe('coverage: every meaningful chunk, no orphan', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M09_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M09_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
    expect(M09_CONCEPTS.map((c) => c.id)).toEqual(['hi-there', 'help-find', 'just-looking', 'thanks', 'take-your-time', 'need-a-hand', 'try-this-on', 'sure', 'what-size', 'fitting-room', 'over-there', 'bigger-size', 'here-you-go', 'one-size-up', 'good-news', 'on-sale', 'twenty-percent-off', 'great', 'take-it', 'wonderful', 'ring-you-up', 'till', 'thank-you']);
  });
  for (const lang of LANGS) {
    it(`${lang}: every chunk is COVERED`, () => { for (const row of coverageOf(day(lang), lang, M09_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true); });
  }
  it('the same steps in every language', () => {
    const kinds = (lang: CoverageLang) => day(lang).steps.map((s) => s.kind);
    expect(kinds('es')).toEqual(kinds('en'));
    expect(kinds('fr')).toEqual(kinds('en'));
  });
});

describe('TEACH before TEST — strict, against VERIFIED prior learning', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 9);
  for (const lang of LANGS) {
    it(`${lang}: no tested line has a word not taught here or verifiably learned in Missions 01–08`, () => { expect(unpreparedWords(day(lang), prior(lang).words)).toEqual([]); });
    it(`${lang}: no tested line has a chunk of this conversation not taught first`, () => { expect(unpreparedChunks(day(lang), lang, M09_CONCEPTS)).toEqual([]); });
  }
  it('what is reused is verified, not assumed: thank you, here you go — and the shop itself is not', () => {
    for (const lang of LANGS) {
      expect(prior(lang).missions).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      for (const c of [['thank you', 'gracias', 'merci'], ['here you go', 'aquí tiene', 'voilà']]) expect(prior(lang).knowsChunk(c[LANGS.indexOf(lang)]!), `${lang} ${c[0]}`).toBe(true);
      for (const id of ['just-looking', 'try-this-on', 'bigger-size', 'fitting-room', 'one-size-up', 'on-sale', 'twenty-percent-off', 'ring-you-up']) expect(prior(lang).knowsChunk(chunk(id, lang)), `${lang} ${id}`).toBe(false);
    }
  });
  it('"receipt" is NOT new here — Mission 03 verifiably taught it ("Would you like the receipt?"), so the audit rightly accepts it', () => {
    for (const lang of LANGS) expect(prior(lang).knowsChunk(['receipt', 'recibo', 'ticket'][LANGS.indexOf(lang)]!), lang).toBe(true);
  });
  it('the audit has teeth: "scarf" planted in a test is caught — and in an earlier conversation it is still not learned', () => {
    const d = day('en');
    const at = d.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge);
    const qr = d.steps[at] as QR;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, i) => (i === at ? { ...qr, rounds: [{ ...qr.rounds[0]!, npc: { en: 'Would you like a scarf?', he: 'x' } }] } : s)) };
    expect(unpreparedWords(planted, prior('en').words).join(' ')).toMatch(/“scarf”/);
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 8) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} Would you like a scarf?` } : x)) } } };
    };
    expect(learnedBefore('en', 9, seen).words.has('scarf')).toBe(false);
  });
  it('the audit has teeth: without the sale cards the 20% is unprepared; without the bigger-size card, the bigger size is', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (...keys: string[]): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => !keys.includes(w.key ?? '')) } : s)) });
      expect(unpreparedChunks(without('shop.line.sale', 'shop.line.size-up-sale'), lang, M09_CONCEPTS).join(' '), lang).toMatch(/twenty-percent-off/);
      expect(unpreparedChunks(without('shop.line.bigger'), lang, M09_CONCEPTS).join(' '), lang).toMatch(/bigger-size/);
    }
  });
  const order = (d: BootcampDayContent, c: string) => {
    const { taught, tested } = missionWalk(d);
    const realTeach = taught.filter((e) => hasChunk(e.text, c) && !(d.steps[e.at]!.kind === 'prime' && (d.steps[e.at] as { gate?: boolean }).gate));
    return { teach: Math.min(...realTeach.map((e) => e.at)), test: Math.min(...tested.filter((e) => hasChunk(e.text, c)).map((e) => e.at)) };
  };
  it('TEACH → TEST for every line of the conversation: its card always comes before its first test', () => {
    for (const lang of LANGS) for (const id of ['just-looking', 'try-this-on', 'what-size', 'fitting-room', 'bigger-size', 'one-size-up', 'twenty-percent-off', 'take-it', 'till']) {
      const o = order(day(lang), chunk(id, lang));
      expect(Number.isFinite(o.test), `${lang} ${id} is tested`).toBe(true);
      expect(o.teach, `${lang} ${id}`).toBeLessThan(o.test);
    }
  });
  it('her lines are comprehension: each is a card with its meaning, then heard', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cards = stepsOf(d, 'prime').filter((p) => !p.gate).flatMap((p) => p.words);
      for (const id of ['help-find', 'take-your-time', 'need-a-hand', 'what-size', 'one-size-up', 'on-sale', 'ring-you-up']) {
        expect(cards.some((w) => hasChunk(w.text, chunk(id, lang)) && w.meaning.he), `${lang} ${id}`).toBe(true);
        expect(encounters(d, chunk(id, lang)).some((e) => e.kind === 'listening'), `${lang} ${id} heard`).toBe(true);
      }
    }
  });
});

describe('THE BRIEFING and the journey — no spoilers', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('the briefing: you walked into a clothes shop and found something you like — nothing more', () => {
    for (const lang of LANGS) {
      const b = briefing(lang);
      expect(b.body[0]!.he).toBe('נכנסת לחנות בגדים ומצאת פריט שמוצא חן בעיניך. תמדוד אותו ותראה אם תרצה לקנות.');
      expect(b.cta).toEqual({ he: 'התחל קניות', en: 'Start shopping' });
      expect(b.facts!.map((f) => f.label.en)).toEqual(['Where', 'What']);
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
    }
  });
  it('the briefing gives NOTHING away: no bigger size, no one size up, no sale, no 20%, no purchase', () => {
    for (const lang of LANGS) expect(JSON.stringify(briefing(lang)), lang).not.toMatch(SPOILERS);
  });
  it('Step 0 is optional and only the trying-on words — no size problem, no sale, no till', () => {
    for (const lang of LANGS) {
      const g = stepsOf(day(lang), 'prime').find((p) => p.gate)!;
      expect(g.words.map((w) => w.key)).toEqual(['shop.size', 'shop.fitting-room']);
      expect(JSON.stringify(g.words), lang).not.toMatch(SPOILERS);
      expect(stepsOf(day(lang), 'prime').filter((p) => p.gate)).toHaveLength(1);
    }
  });
  it('the Shopping Journey shows STAGES, never their answers — Browse ✅ at the start, the rest ⬜', () => {
    expect(M09_STAGES).toEqual(['browse', 'try-on', 'size-fixed', 'sale-understood', 'buy']);
    expect(shoppingJourney(1)[1]).toBe('👀 Browse ✅ · 🪞 Try on ⬜ · 📏 Size fixed ⬜ · 🏷️ Sale understood ⬜ · 🛍️ Buy ⬜');
    expect(shoppingJourney(5)[1]).toBe('👀 Browse ✅ · 🪞 Try on ✅ · 📏 Size fixed ✅ · 🏷️ Sale understood ✅ · 🛍️ Buy ✅');
    for (let n = 0; n <= 5; n++) for (const s of shoppingJourney(n)) expect(s).not.toMatch(/\bL\b|\bM\b|20|%|jacket/);
    for (const lang of LANGS) {
      const d = day(lang);
      const first = d.steps.findIndex((s) => JSON.stringify(s).includes('Sale understood'));
      expect(first, lang).toBeGreaterThan(d.steps.indexOf(storeGames(d)[0]!)); // not in the briefing: it appears once trying on is done
    }
  });
  it('nothing reveals the size-up or the sale before her line\'s card; nothing says "too small" before the fitting room', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const firstWith = (re: RegExp) => d.steps.findIndex((s) => re.test(JSON.stringify(s)));
      const saleCard = primeAt(d, 'shop.line.size-up-sale');
      expect(firstWith(/one size up|Aquí tiene, una talla más|Voilà, une taille au-dessus/), lang).toBe(saleCard);
      expect(firstWith(/twenty percent|veinte por ciento|vingt pour cent|−20%/), lang).toBe(saleCard);
      expect(firstWith(/too small/), lang).toBeGreaterThan(stepsOf(d, 'miniMap').map((s) => d.steps.indexOf(s))[0]!);
    }
  });
});

describe('who says what — the shopper\'s four lines', () => {
  const produced = (d: BootcampDayContent): string[] => [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map(accepted)), ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId)))];
  it('the shopper produces ONLY the four shopper lines; builders for the two questions', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(new Set(produced(d))).toEqual(new Set(LEARNER));
      expect(stepsOf(d, 'sentenceBuilder').map((s) => strip(s.rounds[0]!.itemId))).toEqual(['phrase.shop.try-on', 'phrase.shop.bigger']);
      for (const s of stepsOf(d, 'sentenceBuilder')) for (const r of s.rounds) expect(r.chunks.join(' '), lang).toBe(text(d, r.itemId));
      for (const [id, i] of [['phrase.shop.just-looking', 1], ['phrase.shop.try-on', 3], ['phrase.shop.bigger', 5], ['phrase.shop.great-take-it', 7]] as const) expect(text(d, `${lang}.${id}`)).toBe(line(lang, i));
    }
  });
  it('the salesperson\'s lines are never produced, and every option offered is a shopper line', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const said = produced(d).map((id) => text(d, `${lang}.${id}`));
      // (her "one size up" echoes the shopper's own words in Spanish and French — una talla más · une taille au-dessus — so an echo is not hers)
      const echo = (c: string) => M09_CONCEPTS.some((x) => x.role === 'say' && hasChunk(x.chunk[lang], c));
      for (const c of M09_CONCEPTS.filter((x) => x.role === 'hear' && !echo(x.chunk[lang]))) expect(said.some((s) => hasChunk(s, c.chunk[lang])), `${lang} ${c.id}`).toBe(false);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(LEARNER, lang).toContain(strip(o.itemId));
    }
  });
  it('"Can I try this on?" is the shopper\'s INITIATIVE: asked from the situation (you found the jacket), or after "take your time"', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'quickReply')) for (const r of s.rounds) {
      if (accepted(r) !== 'phrase.shop.try-on') continue;
      if (r.situation) expect(r.situation.en).toMatch(/found a jacket/);
      else expect(r.npc!.en, lang).toBe(line(lang, 2));
    }
  });
  it('"Do you have a bigger size?" comes only after the too-small state (app language, no invented target line)', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const tooSmall = d.steps.findIndex((s) => s.kind === 'receipt' && /too small/.test(s.text.en ?? ''));
      expect(tooSmall, lang).toBeGreaterThan(0);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) {
        if (accepted(r) !== 'phrase.shop.bigger') continue;
        expect(d.steps.indexOf(s), lang).toBeGreaterThan(tooSmall);
        if (r.situation) expect(r.situation.en).toMatch(/size M is too small/);
        else expect(r.npc!.en).toBe(line(lang, 4));
      }
      expect(stepsOf(d, 'quickReply').flatMap((s) => s.rounds).filter((r) => r.situation).every((r) => !r.npc)).toBe(true);
    }
  });
  it('the purchase is a DECISION: it fits and it is on sale, so you take it', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'quickReply')) for (const r of s.rounds) {
      if (accepted(r) !== 'phrase.shop.great-take-it') continue;
      if (r.situation) expect(r.situation.en).toBe('Size L fits you, and it is on sale. You decide to buy it.');
      else expect(r.npc!.en).toBe(line(lang, 6));
    }
  });
  it('mission-local: no help-tool answers, no ambush, no quiz, no swap, nothing from another shop', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'ambush').length + stepsOf(d, 'quiz').length + stepsOf(d, 'swap').length + stepsOf(d, 'swipe').length, lang).toBe(0);
      expect(JSON.stringify(d.steps), lang).not.toMatch(/out-of-stock|anything-else|recovery\./);
      const said = Object.values(d.dialogues).flatMap((dl) => dl.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)])).filter(Boolean);
      for (const i of d.items) expect(said.some((l) => hasChunk(l, i.text)), `${lang} ${i.id} “${i.text}”`).toBe(true);
    }
  });
  it('out of stock, the sale as its own sentence and "anything else" are retired: archived, shown nowhere', () => {
    for (const lang of LANGS) {
      const archived = RETIRED_SENTENCES[lang].filter((r) => r.retiredFrom === 'shopping');
      expect(archived.map((r) => strip(r.id))).toEqual(['reply.shop.out-of-stock', 'reply.shop.on-sale', 'reply.shop.anything-else']);
      const everywhere = JSON.stringify(BOOTCAMP_PLAN.map((m) => MISSIONS_BY_LANG[lang]![m.day]!));
      for (const r of archived) expect(everywhere.includes(`"${r.id}"`), `${lang} ${r.id}`).toBe(false);
    }
  });
});

describe('SEMANTIC choices — the store, the size, the sale', () => {
  it('the fitting room and the till are PLACES in the store (zones), not positions', () => {
    for (const lang of LANGS) {
      const maps = storeGames(day(lang));
      expect(maps.map((s) => s.rounds[0]!.correct)).toEqual(['fitting-room', 'till', 'fitting-room', 'till', 'fitting-room', 'till']);
      for (const s of maps) for (const r of s.rounds) {
        expect(r.cells.find((c) => c.id === r.correct)!.zone).toBe(r.correct);
        expect(r.cells.filter((c) => c.tappable).map((c) => c.zone).sort()).toEqual(['entrance', 'fitting-room', 'racks', 'till']);
        expect(r.audio.en).toBe(line(lang, r.correct === 'till' ? 8 : 4));
      }
    }
  });
  it('the size ladder is the deterministic S · M · L · XL; you had M, she brought L — one size up, not a position', () => {
    expect(M09_SIZES).toEqual(['S', 'M', 'L', 'XL']);
    expect(M09_SIZES.indexOf(M09_SHOP.replacement)).toBe(M09_SIZES.indexOf(M09_SHOP.size) + 1);
    for (const lang of LANGS) for (const s of sizeGames(day(lang))) {
      expect(s.tiles.map((t) => t.label)).toEqual(['S', 'M', 'L', 'XL']);
      for (const r of s.rounds) { expect(r.correct).toBe(M09_ANSWER.size); expect(r.audio.en).toBe(line(lang, 6)); }
      expect(s.label!.en).toMatch(/You had M/);
    }
  });
  it('the 20% is chosen from three equal discounts — no arithmetic, no price to compute', () => {
    for (const lang of LANGS) {
      const ds = discountGames(day(lang));
      expect(ds.length).toBeGreaterThanOrEqual(3);
      for (const s of ds) {
        expect(s.tiles.map((t) => t.label)).toEqual(['−10%', '−20%', '−50%']);
        for (const r of s.rounds) expect(r.correct).toBe(M09_ANSWER.discount);
      }
      expect(JSON.stringify(day(lang).steps)).not.toMatch(/[€$£]\s?\d|\d\s?[€$£]/);
    }
  });
  it('integration is situation → action: no answer is an emoji for one of her lines', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(stepsOf(d, 'matchPairs'), lang).toHaveLength(0);
      for (const { s } of games(d)) if (s.kind === 'visualMatch') for (const t of s.tiles) { expect(t.emoji).toBeUndefined(); expect(t.image).toBeUndefined(); }
    }
  });
  it('fairness: what a round offers is all of one kind — artwork, emoji or figures — on boards and maps', () => {
    const kindOf = (t: Pick<MatchTile, 'image' | 'emoji' | 'label'>): string => (t.image ? 'image' : t.emoji ? 'emoji' : 'label');
    for (const lang of LANGS) for (const { s, r } of games(day(lang))) {
      const shown = s.kind === 'visualMatch' ? s.tiles : (r as { cells: { tappable?: boolean }[] }).cells.filter((c) => c.tappable) as Pick<MatchTile, 'image' | 'emoji' | 'label'>[];
      expect(new Set(shown.map(kindOf)).size, lang).toBe(1);
    }
  });
});

describe('the shopping trip, as it happens', () => {
  it('the journey moves only when a stage is done: Try on after the fitting room, Sale after the size and the 20%', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const receiptOf = (n: number) => d.steps.findIndex((s) => s.kind === 'receipt' && (s.text.en ?? '').includes(shoppingJourney(n)[1]));
      expect(receiptOf(2), lang).toBeGreaterThan(d.steps.indexOf(storeGames(d)[0]!));
      expect(receiptOf(4), lang).toBeGreaterThan(Math.max(d.steps.indexOf(sizeGames(d)[0]!), d.steps.indexOf(discountGames(d)[0]!)));
      expect(receiptOf(5), lang).toBeGreaterThan(d.steps.indexOf(storeGames(d)[1]!));
    }
  });
  it('the supported trip: help → just looking, the jacket → try on, fitting room, too small → bigger, L, −20%, decide, till', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const from = d.steps.findIndex((s) => s.kind === 'replies') + 1;
      const run = d.steps.slice(from, d.steps.findIndex((s) => s.kind === 'dialogue'));
      expect(run.map((s) => s.kind)).toEqual(['quickReply', 'miniMap', 'quickReply', 'visualMatch', 'visualMatch', 'quickReply', 'miniMap', 'receipt']);
      const [qa, , qb, , , qc] = run as QR[];
      expect(qa!.label!.en).toBe(shoppingJourney(1)[1]);
      expect(qa!.rounds.map(accepted)).toEqual(['phrase.shop.just-looking', 'phrase.shop.try-on']);
      expect(qa!.rounds[0]!.npc!.en).toBe(line(lang, 0));
      expect([qb!.label!.en, qb!.rounds.map(accepted)]).toEqual([shoppingJourney(2)[1], ['phrase.shop.bigger']]);
      expect([qc!.label!.en, qc!.rounds.map(accepted)]).toEqual([shoppingJourney(4)[1], ['phrase.shop.great-take-it']]);
    }
  });
  it('the trip with no help: her real lines in order, no journey, no translation — then the 20% at speed', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const s = stepsOf(d, 'quickReply').find((x) => x.challenge)!;
      expect(s.label).toBeUndefined();
      expect(s.rounds.map((r) => [r.npc!.en, accepted(r)])).toEqual([[line(lang, 0), 'phrase.shop.just-looking'], [line(lang, 2), 'phrase.shop.try-on'], [line(lang, 4), 'phrase.shop.bigger'], [line(lang, 6), 'phrase.shop.great-take-it']]);
      const next = d.steps[d.steps.indexOf(s) + 1] as Game;
      expect([next.kind, next.challenge, next.rounds[0]!.correct]).toEqual(['visualMatch', true, M09_ANSWER.discount]);
      expect(d.steps.indexOf(s)).toBeGreaterThan(d.steps.findIndex((x) => x.kind === 'dialogue'));
    }
  });
  it('the final trip (after the video) is compact — each ability once — and ends 🛍️ PURCHASE COMPLETE', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const gate = d.steps.slice(videoAt(d) + 1);
      expect(gate.map((s) => s.kind)).toEqual(['quickReply', 'miniMap', 'quickReply', 'visualMatch', 'visualMatch', 'quickReply', 'miniMap', 'receipt', 'summary']);
      const captures = gate.filter((s): s is Game => s.kind === 'visualMatch' || s.kind === 'miniMap');
      expect(captures.map((s) => s.rounds[0]!.correct)).toEqual(['fitting-room', M09_ANSWER.size, M09_ANSWER.discount, 'till']);
      const end = gate[7]!;
      expect(end.kind === 'receipt' && end.text.en).toBe(`🛍️ PURCHASE COMPLETE · ${shoppingJourney(5)[1]}`);
    }
  });
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'prime' ? (s.gate ? 'prime:step0' : 'prime:cards') : s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'miniMap' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0',
      'prime:cards',
      'prime:cards', 'sentenceBuilder', 'quickReply',
      'prime:cards', 'miniMap', 'receipt',
      'prime:cards', 'sentenceBuilder', 'quickReply',
      'prime:cards', 'visualMatch', 'visualMatch', 'receipt',
      'prime:cards', 'quickReply', 'miniMap',
      'replies',
      'quickReply', 'miniMap', 'quickReply', 'visualMatch', 'visualMatch', 'quickReply', 'miniMap', 'receipt',
      'dialogue', 'receipt', 'quickReply:speed', 'visualMatch:speed', 'receipt',
      'video:again', 'quickReply', 'miniMap:speed', 'quickReply', 'visualMatch:speed', 'visualMatch:speed', 'quickReply', 'miniMap:speed', 'receipt', 'summary',
    ]);
  });
});

describe('visual slots — placeholders until the ASTRA pass', () => {
  it('13 semantic slots and 2 props; none has artwork yet (VISUAL PRODUCTION REQUIRED), every one has its stand-in', () => {
    expect(Object.keys(M09_SLOTS).sort()).toEqual(['ask-bigger-size', 'fitting-room', 'just-looking', 'one-size-up', 'sale-reveal', 'salesperson-offers-help', 'selected-item', 'store-browse', 'take-it', 'take-your-time', 'till', 'too-small', 'try-this-on']);
    expect(Object.keys(M09_PROPS).sort()).toEqual(['entrance', 'racks']);
    for (const s of [...Object.values(M09_SLOTS), ...Object.values(M09_PROPS)]) { expect((s as { image?: string }).image).toBeUndefined(); expect(s.emoji).toBeTruthy(); }
  });
  it('every card picture comes from a slot, the same in every language — wide pictures', () => {
    const pictures = new Set(Object.values(M09_SLOTS).map((s) => s.emoji));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) {
      for (const [key, pic] of pics(lang)) expect(pictures, `${lang} ${key}`).toContain(pic);
      for (const p of stepsOf(day(lang), 'prime')) expect(p.widePictures).toBe(true);
    }
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    expect(cardKeys(day('en'))).toEqual(cardKeys(day('fr')));
  });
});

describe('the journey and the ladder on a phone', () => {
  it('the journey renders as five stage cells — ✅ for each stage done — and adds nothing', () => {
    for (let n = 0; n <= 5; n++) for (const str of shoppingJourney(n)) {
      const parts = splitJourney(str)!;
      expect(parts.facts).toHaveLength(5);
      expect(parts.facts.join(' · ')).toBe(str);
      expect(parts.facts.filter((f) => f.endsWith('✅'))).toHaveLength(n);
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `🛍️ PURCHASE COMPLETE · ${str}` }));
      expect(html.match(/class="hotel-stay-fact"/g)).toHaveLength(5);
      expect(html).toContain('is-journey');
    }
    expect(splitJourney(`🛍️ PURCHASE COMPLETE · ${shoppingJourney(5)[1]}`)!.before).toBe('🛍️ PURCHASE COMPLETE');
    expect(splitJourney('A different mission')).toBeNull();
  });
  it('the size ladder is ORDERED — S · M · L · XL left to right, never shuffled; the discounts stay shuffled', () => {
    for (const lang of LANGS) {
      for (const s of sizeGames(day(lang))) expect(s.ordered, lang).toBe(true);
      for (const s of discountGames(day(lang))) expect(s.ordered, lang).toBeUndefined();
    }
  });
});

describe('video, state, parity and pacing', () => {
  it('the video: English and French have one (standard resolver), replayable at every practice step; Spanish has none yet — safely skipped', () => {
    expect(missionVideo('en', BOOTCAMP_PLAN[8]!.day)?.src).toMatch(/videos\/en\/en_9\.mp4$/);
    expect(missionVideo('fr', BOOTCAMP_PLAN[8]!.day)?.src).toMatch(/videos\/fr\/fr_9\.mp4$/);
    expect(missionVideo('es', BOOTCAMP_PLAN[8]!.day)).toBeUndefined();
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[8]!.day);
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
  it('plain serialisable state: stage, item, current size, replacement, discount known, decision — nothing known early', () => {
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
    expect(shoppingState(1)).toEqual({ stage: 'browse', item: 'jacket', currentSize: 'M', replacementSize: null, discountKnown: false, purchaseDecision: null });
    expect(shoppingState(5)).toEqual({ stage: 'buy', item: 'jacket', currentSize: 'L', replacementSize: 'L', discountKnown: true, purchaseDecision: 'buy' });
    for (let n = 1; n <= 5; n++) expect(JSON.parse(JSON.stringify(shoppingState(n)))).toEqual(shoppingState(n));
    expect(M09_SHOP).toEqual({ item: 'jacket', size: 'M', replacement: 'L', discount: 20, outcome: 'buy' });
  });
  it('same journey in EN / ES / FR; every step valid; 33 meaningful interactions (inside 30–33, no filler)', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'miniMap') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [r.correct, r.cells])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))];
      if (s.kind === 'replies') return [s.kind, strip(s.saidItemId), s.replyIds.map(strip)];
      if (s.kind === 'prime') return [s.kind, s.gate, s.label, s.words.map((w) => [w.key, w.emoji, w.line, w.review, w.meaning])];
      if (s.kind === 'receipt' || s.kind === 'talk') return [s.kind, JSON.stringify(s)];
      return s.kind;
    });
    for (const lang of LANGS) {
      const d = day(lang);
      if (lang !== 'en') expect(shape(d), lang).toEqual(shape(day('en')));
      const ids = new Set(d.items.map((i) => i.id));
      for (const s of d.steps) expect(validatePracticeStep(s, ids, (id) => d.items.find((i) => i.id === id)?.text), `${lang} ${s.kind}`).toEqual([]);
      const n = d.steps.reduce((k, s) => k + (s.kind === 'quickReply' || s.kind === 'miniMap' || s.kind === 'visualMatch' || s.kind === 'sentenceBuilder' ? s.rounds.length
        : s.kind === 'replies' ? s.replyIds.length : s.kind === 'matchPairs' ? s.pairs.length : 0), 0);
      expect(n, lang).toBe(33);
    }
  });
  it('the salesperson by ear: her three lines with no game of their own, after "I\'m just looking"', () => {
    for (const lang of LANGS) {
      const r = stepsOf(day(lang), 'replies');
      expect(r.map((s) => [strip(s.saidItemId), s.replyIds.map(strip)])).toEqual([['phrase.shop.just-looking', ['reply.shop.help-find', 'reply.shop.take-your-time', 'reply.shop.till-line']]]);
      for (const [id, i] of [['reply.shop.help-find', 0], ['reply.shop.take-your-time', 2], ['reply.shop.till-line', 8]] as const) expect(text(day(lang), `${lang}.${id}`)).toBe(line(lang, i));
    }
  });
});
