import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HotelStaySummary, splitHotelStay } from './HotelStaySummary.js';
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { missionVideo } from '../videos/missionVideo.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { coverageOf, encounters, hasChunk, plain, type CoverageLang } from './mission01Coverage.js';
import { M08_CONCEPTS } from './mission08Coverage.js';
import { missionPhases, practiceReplay } from './missionFlow.js';
import { BOOTCAMP_PLAN, missionNumber } from './plan.js';
import { M08_ANSWER, M08_KNOWN_AT_START, M08_PROPS, M08_SLOTS, M08_STAY, M08_STAY_FACTS, stayCard } from './practiceArrival.js';
import { validatePracticeStep } from './practiceEngines.js';
import { learnedBefore, missionContent, missionWalk, unpreparedChunks, unpreparedWords } from './priorLearning.js';
import { MISSIONS_BY_LANG } from './registry.js';
import type { BootcampDayContent, BootcampStep, MatchTile } from './types.js';

/**
 * Mission 08 — Hotel Check-in: "I actually checked into a hotel and now I know where to go." The
 * conversation is LOCKED. The guest walks in knowing only the reservation (under Cohen) and the
 * passport; the room, the floor, the breakfast hours and the elevator come from the receptionist —
 * and the stay card fills only as each one is understood.
 */
const LANGS = ['en', 'es', 'fr'] as const;
const day = (lang: CoverageLang, n = 8): BootcampDayContent => missionContent(lang, n);
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
const fnv = (s: string): string => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const stepsOf = <K extends BootcampStep['kind']>(d: BootcampDayContent, kind: K): Extract<BootcampStep, { kind: K }>[] => d.steps.filter((s): s is Extract<BootcampStep, { kind: K }> => s.kind === kind);
const text = (d: BootcampDayContent, id: string | undefined): string => d.items.find((i) => i.id === id)?.text ?? '';
const script = (lang: CoverageLang): string[] => missionDialogues(day(lang)).flatMap((x) => cinematicTranscript(x)).map((l) => `${l.who === 'npc' ? 'NPC' : 'YOU'}: ${l.en}`);
const chunk = (id: string, lang: CoverageLang): string => M08_CONCEPTS.find((c) => c.id === id)!.chunk[lang];
const videoAt = (d: BootcampDayContent): number => d.steps.findIndex((s) => s.kind === 'video' && s.mode === 'again');
type QR = Extract<BootcampStep, { kind: 'quickReply' }>;
const accepted = (r: QR['rounds'][number]): string => strip(r.options.find((o) => o.correct)!.itemId);

const LOCKED: Record<CoverageLang, string[]> = {
  en: ['NPC: Good evening! How can I help you?', 'YOU: I have a reservation, under the name Cohen.', 'NPC: Welcome, Mr. Cohen. Your passport, please.', 'YOU: Here you go.',
    "NPC: Thank you. You're in room two-oh-four, on the second floor. Here is your key.", 'YOU: Is breakfast included?', 'NPC: Yes! Breakfast is from seven to ten. The elevator is on your right.', 'NPC: Enjoy your stay!'],
  es: ['NPC: ¡Buenas noches! ¿En qué puedo ayudarle?', 'YOU: Tengo una reserva, a nombre de Cohen.', 'NPC: Bienvenido, señor Cohen. Su pasaporte, por favor.', 'YOU: Aquí tiene.',
    'NPC: Gracias. Está en la habitación doscientos cuatro, en el segundo piso. Aquí tiene su llave.', 'YOU: ¿El desayuno está incluido?', 'NPC: ¡Sí! El desayuno es de siete a diez. El ascensor está a su derecha.', 'NPC: ¡Que disfrute su estancia!'],
  fr: ['NPC: Bonsoir ! Comment puis-je vous aider ?', 'YOU: J’ai une réservation, au nom de Cohen.', 'NPC: Bienvenue, monsieur Cohen. Votre passeport, s’il vous plaît.', 'YOU: Voilà, tenez.',
    'NPC: Merci. Vous êtes dans la chambre deux cent quatre, au deuxième étage. Voici votre clé.', 'YOU: Le petit-déjeuner est compris ?', 'NPC: Oui ! Le petit-déjeuner est de sept heures à dix heures. L’ascenseur est sur votre droite.', 'NPC: Bon séjour !'],
};
const line = (lang: CoverageLang, i: number): string => LOCKED[lang][i]!.slice(5);
const LEARNER = ['phrase.hotel.reservation-name', 'phrase.hotel.here-you-go', 'phrase.hotel.breakfast'];
/** Every game round, in order, with its step index (boards and maps). */
const games = (d: BootcampDayContent) => d.steps.flatMap((s, at) => (s.kind === 'visualMatch' || s.kind === 'miniMap' ? s.rounds.map((r) => ({ s, r, at })) : []));
const roomGames = (d: BootcampDayContent) => stepsOf(d, 'visualMatch').filter((s) => s.tiles.some((t) => t.id === 'r204'));
const floorGames = (d: BootcampDayContent) => stepsOf(d, 'miniMap').filter((s) => s.rounds.some((r) => r.correct === 'floor-2'));
const hourGames = (d: BootcampDayContent) => stepsOf(d, 'visualMatch').filter((s) => s.tiles.some((t) => t.id === 'h7-10'));
const directionGames = (d: BootcampDayContent) => stepsOf(d, 'miniMap').filter((s) => s.rounds.some((r) => r.correct === 'right'));

describe('the conversation is locked, and Mission 08 is in its place', () => {
  for (const lang of LANGS) it(`${lang}: word for word the frozen one`, () => { expect(script(lang)).toEqual(LOCKED[lang]); });
  it('the dialogue tree (with its side-branches) is byte-for-byte what it was before this pass', () => {
    expect(Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(day(l).dialogues))]))).toEqual({ en: '3fec0ca9', es: '5e4be6fb', fr: '24e3f43f' });
  });
  it('Mission 08 is "Hotel Check-in", eighth on the journey', () => {
    expect(BOOTCAMP_PLAN[7]!.id).toBe('hotel-check-in');
    expect(missionNumber(BOOTCAMP_PLAN[7]!.day)).toBe(8);
    for (const lang of LANGS) expect(day(lang).title.en).toBe('Hotel Check-in');
  });
  it('Missions 01–07 and 09–30 are byte-for-byte unchanged by this pass', () => {
    const raw = (a: number, b?: number) => Object.fromEntries(LANGS.map((l) => [l, fnv(JSON.stringify(BOOTCAMP_PLAN.slice(a, b).map((m) => MISSIONS_BY_LANG[l]![m.day]!)))]));
    expect(raw(0, 7)).toEqual({ en: '17db9d4a', es: '4a1f6209', fr: 'e936fa44' });
    expect(raw(8)).toEqual({ en: '4e06a0e6', es: 'f4d9682d', fr: 'e59888bd' });
  });
});

describe('coverage: every meaningful chunk, no orphan', () => {
  it('every chunk is really in the frozen conversation, and the chunks account for every word of it', () => {
    for (const lang of LANGS) {
      for (const c of M08_CONCEPTS) expect(LOCKED[lang].some((l) => hasChunk(l.slice(5), c.chunk[lang])), `${lang} ${c.id}`).toBe(true);
      const known = new Set(M08_CONCEPTS.flatMap((c) => plain(c.chunk[lang]).trim().split(' ')));
      for (const l of LOCKED[lang]) for (const w of plain(l.slice(5)).trim().split(' ')) expect(known.has(w), `${lang}: “${w}” in “${l}”`).toBe(true);
    }
  });
  for (const lang of LANGS) {
    it(`${lang}: every chunk is COVERED`, () => { for (const row of coverageOf(day(lang), lang, M08_CONCEPTS)) expect(row.covered, `${lang} ${row.id}: ${row.why}`).toBe(true); });
  }
  it('coverage parity: the same chunks covered in English, Spanish and French, met the same ways', () => {
    // (Spanish "Aquí tiene" is also the start of "Aquí tiene su llave", so it is compared by kind, not count.)
    const kinds = (lang: CoverageLang) => Object.fromEntries(coverageOf(day(lang), lang, M08_CONCEPTS).map((r) => [r.id, r.id === 'here-you-go' ? [r.covered] : [r.covered, r.byKind.meaning, r.byKind.listening, r.byKind.retrieval, r.byKind.context]]));
    expect(kinds('es')).toEqual(kinds('en'));
    expect(kinds('fr')).toEqual(kinds('en'));
  });
});

describe('TEACH before TEST — strict, against VERIFIED prior learning', () => {
  const prior = (lang: CoverageLang) => learnedBefore(lang, 8);
  for (const lang of LANGS) {
    it(`${lang}: no tested line has a word not taught here or verifiably learned in Missions 01–07`, () => { expect(unpreparedWords(day(lang), prior(lang).words)).toEqual([]); });
    it(`${lang}: no tested line has a chunk of this conversation not taught first`, () => { expect(unpreparedChunks(day(lang), lang, M08_CONCEPTS)).toEqual([]); });
  }
  it('what is reused is verified, not assumed: passport, thank you, welcome, enjoy your stay — and the stay itself is not', () => {
    for (const lang of LANGS) {
      expect(prior(lang).missions).toEqual([1, 2, 3, 4, 5, 6, 7]);
      for (const c of [['passport', 'pasaporte', 'passeport'], ['thank you', 'gracias', 'merci'], ['welcome', 'bienvenido', 'bienvenue'], ['enjoy your stay', 'que disfrute su estancia', 'bon séjour']]) {
        expect(prior(lang).knowsChunk(c[LANGS.indexOf(lang)]!), `${lang} ${c[0]}`).toBe(true);
      }
      for (const id of ['reservation', 'room-204', 'second-floor', 'breakfast-included', 'breakfast-7-to-10', 'elevator-right', 'here-key']) expect(prior(lang).knowsChunk(chunk(id, lang)), `${lang} ${id}`).toBe(false);
    }
  });
  it('the passport is a REVIEW word here (Mission 06 taught it) — never presented as new', () => {
    for (const lang of LANGS) {
      const w = stepsOf(day(lang), 'prime').find((p) => p.gate)!.words.find((x) => x.key === 'hotel.passport')!;
      expect(w.review, lang).toBe(true);
      expect(learnedBefore(lang, 8).knowsChunk(w.text), lang).toBe(true);
    }
  });
  it('the audit has teeth: "swimming pool" planted in a test is caught — and in an earlier conversation it is still not learned', () => {
    const d = day('en');
    const at = d.steps.findIndex((s) => s.kind === 'quickReply' && s.challenge);
    const qr = d.steps[at] as QR;
    const planted: BootcampDayContent = { ...d, steps: d.steps.map((s, i) => (i === at ? { ...qr, rounds: [{ ...qr.rounds[0]!, npc: { en: 'The swimming pool is open.', he: 'x' } }] } : s)) };
    expect(unpreparedWords(planted, prior('en').words).join(' ')).toMatch(/“swimming”/);
    const seen = (lang: CoverageLang, n: number): BootcampDayContent => {
      const m = missionContent(lang, n);
      if (n !== 7) return m;
      const [id, dl] = Object.entries(m.dialogues)[0]!;
      return { ...m, dialogues: { ...m.dialogues, [id]: { ...dl, nodes: dl.nodes.map((x, k) => (k === 0 ? { ...x, en: `${x.en} The swimming pool is open.` } : x)) } } };
    };
    expect(learnedBefore('en', 8, seen).words.has('swimming')).toBe(false);
  });
  it('the audit has teeth: without the "on your right" card the direction is unprepared; without the room card, 204 is', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const without = (key: string): BootcampDayContent => ({ ...d, steps: d.steps.map((s) => (s.kind === 'prime' ? { ...s, words: s.words.filter((w) => w.key !== key && w.key !== 'hotel.line.hours-elevator' && w.key !== 'hotel.line.room-floor-key') } : s)) });
      expect(unpreparedChunks(without('hotel.line.elevator'), lang, M08_CONCEPTS).join(' '), lang).toMatch(/elevator-right/);
      expect(unpreparedChunks(without('hotel.line.room'), lang, M08_CONCEPTS).join(' '), lang).toMatch(/room-204/);
    }
  });
  const order = (d: BootcampDayContent, c: string) => {
    const { taught, tested } = missionWalk(d);
    const realTeach = taught.filter((e) => hasChunk(e.text, c) && !(d.steps[e.at]!.kind === 'prime' && (d.steps[e.at] as { gate?: boolean }).gate));
    return { teach: Math.min(...realTeach.map((e) => e.at)), test: Math.min(...tested.filter((e) => hasChunk(e.text, c)).map((e) => e.at)) };
  };
  for (const id of ['reservation', 'passport-please', 'here-you-go', 'room-204', 'second-floor', 'breakfast-included', 'breakfast-7-to-10', 'elevator-right']) {
    it(`TEACH → TEST: ${id}`, () => {
      for (const lang of LANGS) {
        const o = order(day(lang), chunk(id, lang));
        expect(Number.isFinite(o.test), `${lang} ${id} is tested`).toBe(true);
        expect(o.teach, `${lang} ${id}`).toBeLessThan(o.test);
      }
    });
  }
  it('the key and the goodbye are comprehension: a card with the meaning, then heard', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const cards = stepsOf(d, 'prime').filter((p) => !p.gate).flatMap((p) => p.words);
      for (const id of ['here-key', 'enjoy-stay']) {
        expect(cards.some((w) => hasChunk(w.text, chunk(id, lang)) && w.meaning.he), `${lang} ${id}`).toBe(true);
        expect(encounters(d, chunk(id, lang)).some((e) => e.kind === 'listening'), `${lang} ${id} heard`).toBe(true);
      }
    }
  });
});

describe('THE INFORMATION GAP — the stay comes from the receptionist', () => {
  const briefing = (lang: CoverageLang) => day(lang).steps[0] as Extract<BootcampStep, { kind: 'talk' }>;
  it('the briefing: you have a reservation under Cohen and your passport — your goal is to check in', () => {
    expect(M08_KNOWN_AT_START).toEqual({ reservation: true, name: 'Cohen', passport: true });
    for (const lang of LANGS) {
      const b = briefing(lang);
      expect(b.body[0]!.he).toBe('הגעת למלון. יש לך הזמנה על שם Cohen ויש לך דרכון. המטרה: לבצע צ׳ק־אין ולהגיע לחדר.');
      expect(b.facts!.map((f) => [f.label.en, f.value.en])).toEqual([['Reservation', 'Under the name Cohen'], ['Passport', 'With you']]);
      expect(b.cta).toEqual({ he: 'התחל צ׳ק־אין', en: 'Start check-in' });
      expect(day(lang).steps.filter((x) => x.kind === 'talk')).toHaveLength(1);
    }
  });
  it('the briefing gives NOTHING away: no 204, no floor 2, no 7–10, no elevator direction', () => {
    for (const lang of LANGS) {
      const all = JSON.stringify(briefing(lang));
      expect(all, lang).not.toMatch(/204|two-oh-four|second floor|Floor 2|7–10|seven|right|→|ימינ|קומה 2/i);
      expect(briefing(lang).body.map((x) => x.en)).toContain(stayCard([])[1]);
    }
    expect(stayCard([])[1]).toBe('🚪 Room ? · 🏢 Floor ? · 🍳 Breakfast ? · 🛗 Elevator ?');
  });
  it('the stay card fills only after each line is understood: room + floor after the room line\'s games, breakfast + elevator after hers', () => {
    expect(M08_STAY).toEqual({ room: 204, floor: 2, breakfast: '7–10', elevator: 'right' });
    expect(M08_STAY_FACTS).toEqual(['room', 'floor', 'breakfast', 'elevator']);
    expect(stayCard(['room', 'floor'])[1]).toBe('🚪 Room 204 ✅ · 🏢 Floor 2 ✅ · 🍳 Breakfast ? · 🛗 Elevator ?');
    expect(stayCard(M08_STAY_FACTS)[1]).toBe('🚪 Room 204 ✅ · 🏢 Floor 2 ✅ · 🍳 Breakfast 7–10 ✅ · 🛗 Elevator → ✅');
    for (const lang of LANGS) {
      const d = day(lang);
      const firstWith = (re: RegExp) => d.steps.findIndex((s) => re.test(JSON.stringify(s)));
      const roomLine = d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'hotel.line.room-floor-key'));
      const hoursLine = d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'hotel.line.hours-elevator'));
      // nothing says 204 / floor 2 before the receptionist's room line, nor 7–10 / right before her breakfast line
      expect(firstWith(/204|two-oh-four|doscientos cuatro|deux cent quatre/), lang).toBe(roomLine);
      expect(firstWith(/7–10|seven to ten|siete a diez|sept heures/), lang).toBe(hoursLine);
      expect(firstWith(/on your right|a su derecha|sur votre droite|Elevator → /), lang).toBe(hoursLine);
      const card = (k: readonly string[]) => d.steps.findIndex((s) => s.kind === 'receipt' && s.text.en === stayCard(k as typeof M08_STAY_FACTS)[1]);
      const lastOf = (xs: Extract<BootcampStep, { kind: 'visualMatch' | 'miniMap' }>[]) => d.steps.indexOf(xs[0]!);
      expect(card(['room', 'floor']), lang).toBeGreaterThan(Math.max(lastOf(roomGames(d)), lastOf(floorGames(d))));
      expect(card(M08_STAY_FACTS), lang).toBeGreaterThan(Math.max(lastOf(hourGames(d)), lastOf(directionGames(d))));
    }
  });
});

describe('SEMANTIC choices — no hidden rules', () => {
  it('the room is the NUMBER 204 heard in her line — figures, not positions, not words', () => {
    for (const lang of LANGS) for (const s of roomGames(day(lang))) {
      expect(s.tiles.map((t) => t.label)).toEqual(['204', '214', '240']);
      for (const r of s.rounds) { expect(r.correct).toBe('r204'); expect(r.audio.en).toBe(line(lang, 4)); }
      expect(s.tiles.find((t) => t.id === M08_ANSWER.room)!.label).toBe(String(M08_STAY.room));
    }
  });
  it('the floor is chosen on an ELEVATOR PANEL: floors stacked as in a building, the answer is the floor numbered 2', () => {
    for (const lang of LANGS) for (const s of floorGames(day(lang))) for (const r of s.rounds) {
      const btn = (n: number) => r.cells.find((c) => c.zone === `floor-${n}`)!;
      expect([btn(3).row, btn(2).row, btn(1).row]).toEqual([0, 1, 2]); // 3 on top, 1 at the bottom — the building's order
      expect(r.cells.find((c) => c.id === r.correct)!.zone).toBe(`floor-${M08_STAY.floor}`);
      expect(btn(2).symbol).toBe(M08_PROPS['floor-2'].symbol);
      expect(s.presentation).toBe('hotel-floor');
      for (const n of [1, 2, 3]) { expect(btn(n).symbol).toBe(String(n)); expect(btn(n).image).toBeUndefined(); expect(btn(n).emoji).toBeUndefined(); }
      expect(r.cells.some((c) => c.id === 'lift' && !c.tappable)).toBe(true); // the lift itself, beside the panel
    }
  });
  it('breakfast is ONE time range chosen from three — no clock to set, no toggles', () => {
    for (const lang of LANGS) {
      for (const s of hourGames(day(lang))) { expect(s.tiles.map((t) => t.label)).toEqual(['7–10', '7–9', '8–10']); for (const r of s.rounds) expect(r.correct).toBe('h7-10'); }
      expect(stepsOf(day(lang), 'customize'), lang).toHaveLength(0);
    }
  });
  it('right is SPATIAL right from the guest\'s point of view: you face the desk; the corridors look alike; only the side differs', () => {
    for (const lang of LANGS) for (const s of directionGames(day(lang))) for (const r of s.rounds) {
      const guest = r.cells.find((c) => c.id === 'guest')!;
      const desk = r.cells.find((c) => c.id === 'desk')!;
      expect(desk.row, lang).toBeLessThan(guest.row); // the desk is in front of you
      const right = r.cells.find((c) => c.id === r.correct)!;
      expect([right.zone, right.col > guest.col, right.row]).toEqual(['right', true, desk.row]); // on your right, level with the desk
      const corridors = r.cells.filter((c) => c.tappable);
      expect(new Set(corridors.map((c) => c.image)).size, lang).toBe(1);
      expect(corridors.every((c) => c.image === M08_PROPS['corridor-left'].image)).toBe(true);
      expect(s.presentation).toBe('hotel-lobby');
      expect(s.scene).toBe(M08_PROPS.desk.image);
      expect(s.revealImage).toBe(M08_SLOTS['elevator-right'].image); // identical corridors: no picture gives the answer
      expect(corridors.map((c) => c.zone).sort()).toEqual(['ahead', 'left', 'right']);
    }
  });
  it('the passport is HANDED OVER from what you carry (passport, phone, booking) — and "Here you go." comes back', () => {
    for (const lang of LANGS) {
      const s = stepsOf(day(lang), 'visualMatch').find((x) => x.tiles.some((t) => t.id === 'phone'))!;
      expect(s.tiles.map((t) => t.id)).toEqual(['passport', 'phone', 'booking']);
      expect(s.rounds[0]!.correct).toBe('passport');
      expect(s.rounds[0]!.reinforce!.en).toBe(line(lang, 3));
    }
  });
  it('no answer is an icon for a conversational meaning: the match pairs her line with YOUR reply', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const m = stepsOf(d, 'matchPairs')[0]!;
      expect(m.pairs.map((p) => [text(d, p.promptItemId), text(d, p.answerItemId)])).toEqual([[line(lang, 0), line(lang, 1)], [line(lang, 2), line(lang, 3)]]);
      for (const p of m.pairs) expect([p.answerLabel, p.answerGloss]).toEqual([undefined, undefined]);
    }
  });
});

describe('who says what', () => {
  const produced = (d: BootcampDayContent): string[] => [...stepsOf(d, 'quickReply').flatMap((s) => s.rounds.map(accepted)), ...stepsOf(d, 'sentenceBuilder').flatMap((s) => s.rounds.map((r) => strip(r.itemId)))];
  it('the guest produces only the three guest lines; builders for the reservation and the breakfast question', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      expect(new Set(produced(d))).toEqual(new Set(LEARNER));
      expect(stepsOf(d, 'sentenceBuilder').map((s) => strip(s.rounds[0]!.itemId))).toEqual(['phrase.hotel.reservation-name', 'phrase.hotel.breakfast']);
      for (const s of stepsOf(d, 'sentenceBuilder')) for (const r of s.rounds) expect(r.chunks.join(' '), lang).toBe(text(d, r.itemId));
      for (const [id, i] of [['phrase.hotel.reservation-name', 1], ['phrase.hotel.here-you-go', 3], ['phrase.hotel.breakfast', 5]] as const) expect(text(d, `${lang}.${id}`)).toBe(line(lang, i));
    }
  });
  it('the receptionist\'s lines are never produced — no room, floor, hours or direction said by the guest', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const said = produced(d).map((id) => text(d, `${lang}.${id}`));
      for (const c of M08_CONCEPTS.filter((x) => x.role === 'hear')) expect(said.some((s) => hasChunk(s, c.chunk[lang])), `${lang} ${c.id}`).toBe(false);
    }
  });
  it('the breakfast question is the guest\'s INITIATIVE: asked from a situation, or right after the key — never as an answer to a question about breakfast', () => {
    for (const lang of LANGS) for (const s of stepsOf(day(lang), 'quickReply')) for (const r of s.rounds) {
      if (accepted(r) !== 'phrase.hotel.breakfast') continue;
      expect(r.situation ? 'situation' : r.npc!.en, lang).toMatch(r.situation ? /situation/ : new RegExp(line(lang, 4).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
  it('no artificial recovery and nothing from another mission: no help-tool answers, no ambush, no "sign here"', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      for (const s of stepsOf(d, 'quickReply')) for (const r of s.rounds) for (const o of r.options) expect(LEARNER, lang).toContain(strip(o.itemId));
      expect(stepsOf(d, 'ambush').length + stepsOf(d, 'quiz').length + stepsOf(d, 'swap').length, lang).toBe(0);
      expect(JSON.stringify(d), lang).not.toMatch(/sign-here|Sign here|Firme aquí|Signez ici|two nights|wifi/i);
    }
  });
});

describe('the check-in, as it happens', () => {
  it('the supported check-in: her lines in order, your replies, the room and floor caught, your question, the hours and the way — the card filling as you go', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const from = d.steps.findIndex((s) => s.kind === 'replies') + 1;
      const run = d.steps.slice(from, d.steps.findIndex((s) => s.kind === 'dialogue'));
      expect(run.map((s) => s.kind)).toEqual(['quickReply', 'visualMatch', 'miniMap', 'quickReply', 'visualMatch', 'miniMap', 'receipt']);
      const [qa, , , qb] = run as QR[];
      expect(qa!.label!.en).toBe(stayCard([])[1]);
      expect(qa!.rounds.map((r) => [r.npc!.en, accepted(r)])).toEqual([[line(lang, 0), 'phrase.hotel.reservation-name'], [line(lang, 2), 'phrase.hotel.here-you-go']]);
      expect(qb!.label!.en).toBe(stayCard(['room', 'floor'])[1]);
      expect(qb!.rounds.map(accepted)).toEqual(['phrase.hotel.breakfast']);
    }
  });
  it('the check-in with no help: her real lines, no card, no translation — then the room and the way caught at speed', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const s = stepsOf(d, 'quickReply').find((x) => x.challenge)!;
      expect(s.label).toBeUndefined();
      expect(s.rounds.map((r) => [r.npc!.en, accepted(r)])).toEqual([[line(lang, 0), 'phrase.hotel.reservation-name'], [line(lang, 2), 'phrase.hotel.here-you-go'], [line(lang, 4), 'phrase.hotel.breakfast']]);
      const after = d.steps.slice(d.steps.indexOf(s) + 1, d.steps.indexOf(s) + 3);
      expect(after.map((x) => [x.kind, (x as { challenge?: boolean }).challenge])).toEqual([['visualMatch', true], ['miniMap', true]]);
      expect(d.steps.indexOf(s)).toBeGreaterThan(d.steps.findIndex((x) => x.kind === 'dialogue'));
    }
  });
  it('the final check-in (after the video) starts knowing nothing of the stay and ends with all four — CHECK-IN COMPLETE', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const gate = d.steps.slice(videoAt(d) + 1);
      expect(gate.map((s) => s.kind)).toEqual(['quickReply', 'visualMatch', 'miniMap', 'quickReply', 'visualMatch', 'miniMap', 'receipt', 'summary']);
      expect((gate[0] as QR).label!.en).toBe(stayCard([])[1]);
      expect((gate[3] as QR).label!.en).toBe(stayCard(['room', 'floor'])[1]);
      const captures = gate.filter((s): s is Extract<BootcampStep, { kind: 'visualMatch' | 'miniMap' }> => s.kind === 'visualMatch' || s.kind === 'miniMap');
      expect(captures.map((s) => s.rounds[0]!.correct)).toEqual(['r204', 'floor-2', 'h7-10', 'right']);
      expect(gate[6]!.kind === 'receipt' && gate[6].text.en).toBe(`🏨 CHECK-IN COMPLETE · ${stayCard(M08_STAY_FACTS)[1]}`);
    }
  });
  it('the arc', () => {
    const kinds = day('en').steps.map((s) => (s.kind === 'prime' ? (s.gate ? 'prime:step0' : 'prime:cards') : s.kind === 'video' ? `video:${s.mode}` : (s.kind === 'visualMatch' || s.kind === 'miniMap' || s.kind === 'quickReply') && s.challenge ? `${s.kind}:speed` : s.kind));
    expect(kinds).toEqual([
      'talk', 'prime:step0',
      'prime:cards', 'sentenceBuilder',
      'prime:cards', 'visualMatch', 'quickReply',
      'prime:cards', 'visualMatch', 'miniMap', 'visualMatch', 'receipt',
      'prime:cards', 'sentenceBuilder', 'quickReply',
      'prime:cards', 'visualMatch', 'miniMap', 'receipt',
      'prime:cards', 'matchPairs', 'replies',
      'quickReply', 'visualMatch', 'miniMap', 'quickReply', 'visualMatch', 'miniMap', 'receipt',
      'dialogue', 'receipt', 'quickReply:speed', 'visualMatch:speed', 'miniMap:speed', 'receipt',
      'video:again', 'quickReply', 'visualMatch:speed', 'miniMap:speed', 'quickReply', 'visualMatch:speed', 'miniMap:speed', 'receipt', 'summary',
    ]);
  });
});

describe('final hotel visuals — scenes explain actions, UI explains data', () => {
  it('15 canonical slots without emoji fallbacks; 10 props deliberately split between art and UI', () => {
    const slots = ['reservation', 'passport', 'breakfast', 'how-can-help', 'reservation-response', 'passport-request', 'passport-handoff', 'room-floor-key', 'breakfast-question', 'breakfast-hours', 'elevator-right', 'enjoy-stay', 'room-204', 'second-floor', 'key'];
    expect(Object.keys(M08_SLOTS).sort()).toEqual(slots.sort());
    for (const [key, slot] of Object.entries(M08_SLOTS)) {
      const path = key === 'passport' ? 'images/mission06/passport.jpg' : `images/mission08/${key}.${['room-204', 'second-floor'].includes(key) ? 'svg' : 'jpg'}`;
      expect(slot).toEqual({ image: path });
    }
    expect(Object.keys(M08_PROPS)).toHaveLength(10);
    expect(M08_PROPS.phone).toEqual({ image: 'images/mission06/phone.jpg' });
    for (const n of [1, 2, 3] as const) expect(M08_PROPS[`floor-${n}`]).toEqual({ symbol: String(n) });
    for (const id of ['corridor-left', 'corridor-right', 'corridor-ahead', 'desk'] as const) expect(M08_PROPS[id]).toEqual({ image: 'images/mission08/lobby.jpg' });
  });
  it('every canonical file exists, scenes are high-resolution wide JPEGs and distinct meanings have distinct files', () => {
    const paths = [...Object.values(M08_SLOTS).map((s) => s.image), M08_PROPS.phone.image, M08_PROPS.desk.image];
    expect(new Set(paths).size).toBe(17);
    const hashes = paths.map((path) => {
      const data = readFileSync(new URL(`../../../public/${path}`, import.meta.url));
      if (path.endsWith('.svg')) {
        expect(data.toString()).toContain('viewBox="0 0 1600 900"');
      } else {
        expect(data.subarray(0, 2).toString('hex')).toBe('ffd8');
        let width = 0; let height = 0;
        for (let i = 2; i < data.length - 9;) {
          if ([0xc0, 0xc1, 0xc2].includes(data[i + 1]!)) { height = data.readUInt16BE(i + 5); width = data.readUInt16BE(i + 7); break; }
          i += 2 + data.readUInt16BE(i + 2);
        }
        expect(width, path).toBeGreaterThanOrEqual(1536);
        expect(width / height).toBeGreaterThan(1.7);
        expect(width / height).toBeLessThan(1.9);
      }
      return createHash('sha256').update(data).digest('hex');
    });
    expect(new Set(hashes).size).toBe(17);
  });
  it('room and breakfast choices stay plain figures, never AI-image puzzles', () => {
    for (const lang of LANGS) for (const step of [...roomGames(day(lang)), ...hourGames(day(lang))]) for (const tile of step.tiles) {
      expect(tile.image).toBeUndefined(); expect(tile.emoji).toBeUndefined(); expect(tile.label).toBeTruthy();
    }
  });
  it('stay summary presentation preserves all four values and every reveal state without supplying new facts', () => {
    for (const known of [[], ['room', 'floor'], M08_STAY_FACTS] as const) for (const str of stayCard(known)) {
      const parsed = splitHotelStay(str)!;
      expect(parsed.facts).toHaveLength(4);
      expect(parsed.facts.join(' · ')).toBe(str);
      expect(parsed.facts.filter((f) => f.endsWith('✅'))).toHaveLength(known.length);
    }
    expect(splitHotelStay('A different mission')).toBeNull();
  });
  it('opening and breakfast-question cards use only their non-spoiler canonical scenes', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const beforeRoom = d.steps.slice(0, d.steps.findIndex((s) => s.kind === 'prime' && s.words.some((w) => w.key === 'hotel.line.room-floor-key')));
      const allowed = ['reservation', 'reservation-response', 'passport', 'breakfast', 'how-can-help', 'passport-request', 'passport-handoff'].map((k) => M08_SLOTS[k as keyof typeof M08_SLOTS].image);
      for (const step of beforeRoom) if (step.kind === 'prime') for (const w of step.words) expect(allowed).toContain(w.image);
      const q = stepsOf(d, 'prime').flatMap((s) => s.words).find((w) => w.key === 'hotel.line.breakfast')!;
      expect(q.image).toBe(M08_SLOTS['breakfast-question'].image);
    }
  });
  it('every card picture comes from a slot, the same in every language — wide pictures', () => {
    const pictures = new Set(Object.values(M08_SLOTS).map((s) => s.image));
    const pics = (lang: CoverageLang) => stepsOf(day(lang), 'prime').flatMap((p) => p.words.map((w) => [w.key, w.image ?? w.emoji]));
    for (const lang of LANGS) {
      for (const [key, pic] of pics(lang)) expect(pictures, `${lang} ${key}`).toContain(pic);
      for (const w of stepsOf(day(lang), 'prime').flatMap((p) => p.words)) { expect(w.image).toBeTruthy(); expect(w.emoji).toBeUndefined(); }
    }
    expect(pics('es')).toEqual(pics('en'));
    expect(pics('fr')).toEqual(pics('en'));
    for (const lang of LANGS) for (const p of stepsOf(day(lang), 'prime')) expect(p.widePictures).toBe(true);
  });
  it('fairness: what a round offers is all of one kind — artwork, emoji or figures — on boards and maps', () => {
    const kindOf = (t: Pick<MatchTile, 'image' | 'emoji' | 'label'>): string => (t.image ? 'image' : t.emoji ? 'emoji' : 'label');
    for (const lang of LANGS) {
      for (const { s, r } of games(day(lang))) {
        const shown = s.kind === 'visualMatch' ? s.tiles.filter((t) => ((r as { show?: string[] }).show ?? s.tiles.map((x) => x.id)).includes(t.id)) : (r as { cells: { tappable?: boolean }[] }).cells.filter((c) => c.tappable) as Pick<MatchTile, 'image' | 'emoji' | 'label'>[];
        expect(new Set(shown.map(kindOf)).size, lang).toBe(1);
      }
    }
  });
});

describe('video, progress, parity and pacing', () => {
  it('the video: English has one and it is replayable at every practice step; Spanish and French have none yet — safely skipped', () => {
    expect(missionVideo('en', BOOTCAMP_PLAN[7]!.day)?.src).toMatch(/videos\/en\/en_8\.mp4$/);
    for (const lang of ['es', 'fr'] as const) expect(missionVideo(lang, BOOTCAMP_PLAN[7]!.day), lang).toBeUndefined();
    for (const lang of LANGS) {
      const d = day(lang);
      const video = missionVideo(lang, BOOTCAMP_PLAN[7]!.day);
      expect(d.steps.filter((s) => s.kind === 'video').map((s) => (s as { mode: string }).mode)).toEqual(['again']);
      const phases = missionPhases(d);
      for (let i = phases.practiceStart; i < d.steps.length; i++) {
        const kind = d.steps[i]!.kind;
        expect(practiceReplay({ hasVideo: Boolean(video), hasConversation: true, stepKind: kind, index: i })).toBe(video ? (kind === 'video' ? null : 'watch') : (i === 0 ? 'listen' : null));
      }
    }
  });
  it('plain serialisable data — the stay card is data too (`stayCard`, `M08_STAY`)', () => {
    for (const lang of LANGS) { const d = day(lang); expect(JSON.parse(JSON.stringify(d))).toEqual(d); }
    expect(JSON.parse(JSON.stringify(M08_STAY))).toEqual(M08_STAY);
  });
  it('same journey in EN / ES / FR; every step valid; 34 meaningful interactions (inside 30–34)', () => {
    const shape = (d: BootcampDayContent): unknown => d.steps.map((s) => {
      if (s.kind === 'quickReply') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [Boolean(r.npc), r.situation, r.options.map((o) => [strip(o.itemId), o.correct])])];
      if (s.kind === 'miniMap') return [s.kind, s.challenge ?? false, s.label, s.rounds.map((r) => [r.correct, r.cells])];
      if (s.kind === 'visualMatch') return [s.kind, s.challenge ?? false, s.label, s.tiles, s.rounds.map((r) => [r.correct, r.show])];
      if (s.kind === 'sentenceBuilder') return [s.kind, s.rounds.map((r) => strip(r.itemId))];
      if (s.kind === 'matchPairs') return [s.kind, s.pairs.map((p) => [strip(p.promptItemId), strip(p.answerItemId)])];
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
      expect(n, lang).toBe(34);
    }
  });
  it('mission-local: every sentence of the mission is a line, or a piece of a line, of its own conversation', () => {
    for (const lang of LANGS) {
      const d = day(lang);
      const said = Object.values(d.dialogues).flatMap((dl) => dl.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)])).filter(Boolean);
      for (const i of d.items) expect(said.some((l) => hasChunk(l, i.text)), `${lang} ${i.id} “${i.text}”`).toBe(true);
    }
  });
});


describe('hotel presentation renders the preserved data', () => {
  let ui: typeof import('./PracticeSteps.js');
  let app: typeof import('../../shared/stores/appStore.js');
  beforeAll(async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined });
    app = await import('../../shared/stores/appStore.js');
    ui = await import('./PracticeSteps.js');
  });
  afterAll(() => vi.unstubAllGlobals());
  it('renders exactly four stay cells at every reveal stage and retains surrounding copy', () => {
    for (const known of [[], ['room', 'floor'], M08_STAY_FACTS] as const) for (const text of stayCard(known)) {
      const html = renderToStaticMarkup(createElement(HotelStaySummary, { text: `Before ${text} After` }));
      expect(html.match(/class="hotel-stay-fact"/g)).toHaveLength(4);
      expect(html.match(/data-known="true"/g) ?? []).toHaveLength(known.length);
      expect(html).toContain('Before ');
      expect(html).toContain(' After');
    }
  });
  it('renders one neutral lobby with three equivalent direction controls, never the answer image before selection', () => {
    for (const lang of LANGS) {
      app.useAppStore.setState({ learningLang: lang });
      const html = renderToStaticMarkup(createElement(ui.MiniMapStep, { step: directionGames(day(lang))[0]!, onDone: () => undefined }));
      expect(html.match(/class="hotel-lobby-scene"/g)).toHaveLength(1);
      expect(html).toContain(M08_PROPS.desk.image);
      expect(html).not.toContain(M08_SLOTS['elevator-right'].image);
      expect(html.match(/class="hotel-direction-arrow"/g)).toHaveLength(3);
      expect(html).not.toContain('ptile-emoji');
      for (const zone of ['left', 'right', 'ahead']) expect(html).toContain(`aria-label="${zone}"`);
    }
  });
  it('renders numeric floors in building order without language text, emoji or image buttons', () => {
    for (const lang of LANGS) {
      app.useAppStore.setState({ learningLang: lang });
      const html = renderToStaticMarkup(createElement(ui.MiniMapStep, { step: floorGames(day(lang))[0]!, onDone: () => undefined }));
      const digits = [...html.matchAll(/class="ptile-label">([123])</g)].map((m) => m[1]);
      expect(digits).toEqual(['3', '2', '1']);
      expect(html).not.toContain('ptile-img');
      expect(html).not.toContain('ptile-emoji');
      expect(html).toContain('data-role="lift"');
    }
  });
});
