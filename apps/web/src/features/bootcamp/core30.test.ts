import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CORE_SPECS } from './core/index.js';
import { DOC_SECTIONS, missionConversation, missionScenes, renderDialogueDoc } from './dialogueDoc.js';
import { cinematicTranscript, missionDialogues } from './exportDialogue.js';
import { EXTENDED_MISSIONS, MERGED_SOURCES } from './extended.js';
import { unreachableOrDeadEnds } from './parity.js';
import { BOOTCAMP_PLAN, EXTENDED_POOL, MERGED_MISSIONS, missionNumber } from './plan.js';
import { fromStored, toStored } from './progress.js';
import { travelReadiness } from './readiness.js';
import { MISSIONS_BY_LANG } from './registry.js';
import { dialogueTranscript } from './transcript.js';
import type { BootcampDayContent, BootcampDialogue } from './types.js';

/**
 * Core 30 — the gates that keep the restructure true:
 *   1. every Core mission is the SAME conversation in every language, turn for turn (a language can
 *      never silently lose a line again);
 *   2. the journey is exactly Missions 1–30, checkpoints where agreed, Recovery outside the count;
 *   3. what left the Core is kept (Extended Pool / merged sources) but never reaches the journey;
 *   4. checkpoints test, they do not teach;
 *   5. the human-readable document is generated from this content and is not stale.
 */
const LANGS = ['en', 'fr', 'es'] as const;
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');
/** The six global conversation-help tools (the kit also holds the courtesies "Thank you!" / "Sorry!"). */
const HELP_TOOLS = ['dont-understand', 'repeat', 'slowly', 'one-moment', 'show-me', 'what-mean'] as const;

/** Language-independent shape of a dialogue tree: who speaks, where each turn leads, what it trains. */
function shape(d: BootcampDialogue): unknown {
  return {
    start: d.start,
    nodes: d.nodes.map((n) => ({
      id: n.id, who: n.who, next: n.next ?? null, end: n.end ?? false, fast: n.fast ?? false, slow: n.slow ?? false,
      choices: (n.choices ?? []).map((c) => ({ next: c.next, correct: c.correct, item: strip(c.itemId) })),
    })),
  };
}

describe('every Core mission is the same conversation in every language', () => {
  for (const [i, m] of BOOTCAMP_PLAN.entries()) {
    const number = i + 1;
    const en = MISSIONS_BY_LANG.en![m.day]!;

    it(`Mission ${number} (${m.id}): identical dialogue trees — same turns, same branches, same trained sentences`, () => {
      for (const lang of LANGS) {
        const other = MISSIONS_BY_LANG[lang]![m.day]!;
        expect(Object.keys(other.dialogues), lang).toEqual(Object.keys(en.dialogues));
        for (const [id, d] of Object.entries(en.dialogues)) expect(shape(other.dialogues[id]!), `${lang} ${id}`).toEqual(shape(d));
      }
    });

    it(`Mission ${number} (${m.id}): the spoken conversation has the same NPC/You turns, and no empty line`, () => {
      const turns = (lang: string): string => missionConversation(lang, m.day).map((l) => l.who).join(' ');
      for (const lang of LANGS) {
        expect(turns(lang), lang).toBe(turns('en'));
        for (const d of missionDialogues(MISSIONS_BY_LANG[lang]![m.day]!)) {
          expect(dialogueTranscript(d).map((l) => l.who), `${lang} ${d.id} happy path`).toEqual(dialogueTranscript(en.dialogues[d.id]!).map((l) => l.who));
          for (const line of cinematicTranscript(d)) {
            expect(line.en.trim(), `${lang} ${d.id}`).not.toBe('');
            expect((line.tr?.he ?? line.he).trim(), `${lang} ${d.id} Hebrew`).not.toBe('');
          }
        }
      }
      // A conversation alternates: the learner never gets two turns in a row.
      expect(turns('en')).not.toMatch(/you you/);
    });

    it(`Mission ${number} (${m.id}): the same scenes, each with the same turns, in all four document languages`, () => {
      const perScene = (lang: string): string[] => missionScenes(lang, m.day).map((s) => s.map((l) => l.who).join(' '));
      for (const lang of LANGS) expect(perScene(lang), lang).toEqual(perScene('en'));
      for (const scene of missionScenes('en', m.day)) {
        expect(scene.at(-1)!.who).toBe('npc'); // a scene closes on the other person, never mid-air
        for (const line of scene) expect(line.he.trim()).not.toBe(''); // the Hebrew section is this gloss
      }
    });

    it(`Mission ${number} (${m.id}): the same items, steps and step order in every language`, () => {
      for (const lang of LANGS) {
        const other = MISSIONS_BY_LANG[lang]![m.day]!;
        expect(other.items.map((it) => strip(it.id)), lang).toEqual(en.items.map((it) => strip(it.id)));
        expect(other.steps.map((s) => s.kind), lang).toEqual(en.steps.map((s) => s.kind));
        for (const it of other.items) {
          expect(it.text.trim(), `${lang} ${it.id}`).not.toBe('');
          expect(it.meaning.he?.trim(), `${lang} ${it.id} Hebrew`).toBeTruthy();
          expect(it.meaning.en?.trim(), `${lang} ${it.id} English`).toBeTruthy();
        }
      }
    });
  }
});

describe('the journey is exactly Missions 1–30', () => {
  it('every number 1–30 exists exactly once, in every language', () => {
    expect(BOOTCAMP_PLAN.map((m) => missionNumber(m.day))).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    for (const lang of LANGS) expect(Object.keys(MISSIONS_BY_LANG[lang]!).length, lang).toBe(30);
  });

  it('the eight new missions sit at 4, 12, 13, 16, 20, 21, 23 and 25', () => {
    const at = (id: string): number => BOOTCAMP_PLAN.findIndex((m) => m.id === id) + 1;
    expect([
      at('everyday-core'), at('time-plans'), at('home-family'), at('hobbies-free-time'),
      at('past-events'), at('future-plans'), at('opinions-reactions'), at('lost-stolen-police'),
    ]).toEqual([4, 12, 13, 16, 20, 21, 23, 25]);
  });

  it('missions authored once for all languages are exactly the ones the registry serves for their keys', () => {
    for (const spec of CORE_SPECS) {
      expect(BOOTCAMP_PLAN.some((m) => m.day === spec.day), `spec day ${spec.day}`).toBe(true);
      for (const lang of LANGS) expect(MISSIONS_BY_LANG[lang]![spec.day]!.title.en).toBe(spec.title[1]);
    }
  });
});

describe('the conversation-help toolkit is global — not a mission, and never out of reach', () => {
  it('no mission is about recovery, and the six tools all recur inside Core dialogues', () => {
    const used = new Map<string, number>();
    for (const m of BOOTCAMP_PLAN) {
      expect(m.id).not.toMatch(/recovery/);
      const tools = new Set<string>();
      for (const d of Object.values(MISSIONS_BY_LANG.en![m.day]!.dialogues)) {
        for (const c of d.nodes.flatMap((n) => n.choices ?? [])) if (c.itemId?.includes('.phrase.recovery.')) tools.add(strip(c.itemId));
      }
      for (const t of tools) used.set(t, (used.get(t) ?? 0) + 1);
    }
    for (const tool of HELP_TOOLS) {
      expect(used.get(`phrase.recovery.${tool}`) ?? 0, tool).toBeGreaterThanOrEqual(1);
    }
    // "Can you say that again?" and "Please speak slowly." are met again and again, not once.
    expect(used.get('phrase.recovery.repeat')!).toBeGreaterThanOrEqual(8);
    expect(used.get('phrase.recovery.slowly')!).toBeGreaterThanOrEqual(8);
  });

  it('asking for help is always a valid move — never marked wrong', () => {
    // "Thank you!" also lives in the kit, but it is a courtesy, not a help tool: answering a
    // question with it can legitimately be the less useful pick.
    const isHelp = (id: string | undefined): boolean => HELP_TOOLS.some((t) => id?.endsWith(`.phrase.recovery.${t}`));
    for (const lang of LANGS) {
      for (const m of BOOTCAMP_PLAN) {
        for (const d of Object.values(MISSIONS_BY_LANG[lang]![m.day]!.dialogues)) {
          for (const c of d.nodes.flatMap((n) => n.choices ?? [])) {
            if (isHelp(c.itemId)) expect(c.correct, `${lang} ${m.id} ${d.id}`).toBe(true);
          }
        }
      }
    }
  });
});

describe('checkpoints test — they do not teach', () => {
  const checkpoints = BOOTCAMP_PLAN.filter((m) => m.checkpoint);

  it('sit at 10, 18, 24 and 30', () => {
    expect(checkpoints.map((m) => missionNumber(m.day))).toEqual([10, 18, 24, 30]);
  });

  for (const cp of checkpoints) {
    it(`${cp.id}: every sentence was taught by an earlier mission (same id, same wording)`, () => {
      const at = BOOTCAMP_PLAN.indexOf(cp);
      for (const lang of LANGS) {
        const earlier = new Map(BOOTCAMP_PLAN.slice(0, at).flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items).map((it) => [it.id, it.text]));
        const content = MISSIONS_BY_LANG[lang]![cp.day]!;
        for (const it of content.items) expect(earlier.get(it.id), `${lang} ${it.id}`).toBe(it.text);
        expect(content.steps.some((s) => s.kind === 'tool' || s.kind === 'prime' || s.kind === 'replies'), lang).toBe(false);
      }
    });
  }
});

describe('what left the Core is kept — and stays out of the journey', () => {
  const outside = [...EXTENDED_POOL, ...MERGED_MISSIONS];

  it('seven old missions are no longer Core missions: four in the Extended Pool, three merged', () => {
    expect(EXTENDED_POOL.map((m) => m.id)).toEqual(['street-food-markets', 'tickets-attractions', 'wifi-sim-practical', 'souvenirs-gifts']);
    expect(MERGED_MISSIONS.map((m) => [m.id, m.into])).toEqual([
      ['restaurant-basics', 'restaurant-meal'], ['hotel-requests', 'fixing-problems'], ['paying-anywhere', null],
    ]);
    for (const m of outside) {
      expect(BOOTCAMP_PLAN.some((p) => p.id === m.id || p.day === m.day), m.id).toBe(false);
      for (const lang of LANGS) expect(MISSIONS_BY_LANG[lang]![m.day], `${lang} ${m.id}`).toBeUndefined();
    }
    for (const m of MERGED_MISSIONS) if (m.into) expect(BOOTCAMP_PLAN.some((p) => p.id === m.into), m.into).toBe(true);
  });

  it('their content is preserved, complete and sound in every language', () => {
    for (const [pool, list] of [[EXTENDED_MISSIONS, EXTENDED_POOL], [MERGED_SOURCES, MERGED_MISSIONS]] as const) {
      for (const lang of LANGS) {
        expect(Object.keys(pool[lang]!).map(Number).sort((a, b) => a - b), lang).toEqual(list.map((m) => m.day).sort((a, b) => a - b));
        for (const m of list) {
          const content: BootcampDayContent = pool[lang]![m.day]!;
          expect(content.title.he, `${lang} ${m.id}`).toBe(m.title.he);
          expect(content.items.length).toBeGreaterThan(0);
          for (const d of Object.values(content.dialogues)) {
            expect(unreachableOrDeadEnds(d), `${lang} ${m.id} ${d.id}`).toEqual([]);
            expect(dialogueTranscript(d).length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('a completion earned in an Extended Pool mission survives on disk — without counting as readiness', () => {
    const street = EXTENDED_POOL[0]!;
    const taxi = BOOTCAMP_PLAN.find((m) => m.id === 'taxi')!;
    const stored = toStored({ completedDays: [street.day, taxi.day], receipts: [], stepIndex: {} });
    expect(stored.completed).toEqual([street.id, 'taxi']);
    const loaded = fromStored(stored);
    expect(loaded.completedDays).toEqual([street.day, taxi.day]);
    expect(travelReadiness(loaded, () => true).ready).toBe(1); // only the Core mission counts
    // A merged-away mission has nowhere to land: ignored, never a crash.
    expect(fromStored({ completed: ['restaurant-basics', 'taxi'] }).completedDays).toEqual([taxi.day]);
  });
});

describe('content repairs stay repaired', () => {
  const allLines = (lang: string): string =>
    BOOTCAMP_PLAN.flatMap((m) => missionConversation(lang, m.day)).map((l) => `${l.en} ${l.tr?.en ?? ''}`).join('\n');
  const conversation = (id: string): string => missionConversation('en', BOOTCAMP_PLAN.find((m) => m.id === id)!.day).map((l) => l.en).join('\n');

  it('nobody guarantees safety — not the waiter, not the pharmacist', () => {
    for (const lang of LANGS) expect(allLines(lang)).not.toMatch(/completely safe|safe for you|tout à fait sûr|sans danger pour vous|totalmente seguro|seguro para usted/i);
    expect(conversation('special-requests-allergies')).toMatch(/check with the kitchen/i);
  });

  it('the taxi driver no longer asks what you expected to pay', () => {
    expect(conversation('taxi')).not.toMatch(/expect to pay/i);
    expect(conversation('taxi')).toMatch(/How much to the centre\?/);
  });

  it('at check-in only the learner asks about breakfast — and the checkpoint answers it', () => {
    expect(conversation('hotel-check-in').match(/breakfast included/gi)).toHaveLength(1);
    const arrival = conversation('arrival-day-checkpoint');
    expect(arrival.indexOf('Is breakfast included?')).toBeGreaterThan(-1);
    expect(arrival.slice(arrival.indexOf('Is breakfast included?'))).toMatch(/Yes, from seven to ten/i);
  });

  it('small talk answers the question that was asked', () => {
    const talk = missionConversation('en', BOOTCAMP_PLAN.find((m) => m.id === 'small-talk')!.day).map((l) => l.en);
    const asked = talk.findIndex((l) => l.includes('Where are you from?'));
    expect(talk[asked + 1]).toMatch(/I'm from Israel/);
  });

  it('the emergency call is one emergency — the lost passport moved to Lost / Stolen / Police', () => {
    expect(conversation('emergency')).not.toMatch(/passport|lost/i);
    const lost = MISSIONS_BY_LANG.en![BOOTCAMP_PLAN.find((m) => m.id === 'lost-stolen-police')!.day]!;
    expect(lost.items.some((i) => i.text === 'I lost my passport.')).toBe(true);
  });

  it('the supermarket no longer weighs fruit nobody picked up', () => {
    expect(conversation('supermarket')).not.toMatch(/weigh|fruit/i);
  });

  it('there is ONE restaurant mission, and it runs table → order → without → anything else → bill', () => {
    expect(BOOTCAMP_PLAN.filter((m) => /restaurant/i.test(m.title.en ?? ''))).toHaveLength(1);
    const meal = conversation('restaurant-meal');
    for (const beat of ['table for two', 'menus', 'ready to order', "I'll have", 'without onions', 'to drink', 'Anything else', "That's all", 'everything okay', 'delicious', 'bill']) {
      expect(meal.toLowerCase(), beat).toContain(beat.toLowerCase());
    }
  });
});

describe('Curriculum V1.0 lock — the final audit decisions stay decided', () => {
  const dayOf = (id: string): number => BOOTCAMP_PLAN.find((m) => m.id === id)!.day;
  const turns = (id: string, lang = 'en'): { who: string; text: string }[] => missionConversation(lang, dayOf(id)).map((l) => ({ who: l.who, text: l.en }));
  const text = (id: string, lang = 'en'): string => turns(id, lang).map((t) => t.text).join('\n');
  /** What the learner says right after the NPC line matching `q`. */
  const answerTo = (id: string, q: RegExp): string => {
    const t = turns(id);
    const at = t.findIndex((x) => x.who === 'npc' && q.test(x.text));
    expect(at, `${id}: no NPC line matching ${q}`).toBeGreaterThan(-1);
    return t[at + 1]!.text;
  };

  it('mission ids and registry keys are exactly the locked ones', () => {
    expect(BOOTCAMP_PLAN.map((m) => `${m.id}:${m.day}`)).toEqual([
      'introduce-myself:1', 'numbers-money:2', 'coffee-shop:3', 'everyday-core:30', 'directions:5',
      'airport-border:10', 'taxi:6', 'hotel-check-in:7', 'shopping:8', 'arrival-day-checkpoint:9',
      'small-talk:22', 'time-plans:31', 'home-family:32', 'restaurant-meal:4', 'special-requests-allergies:13',
      'hobbies-free-time:33', 'supermarket:16', 'food-day-checkpoint:17',
      'public-transport:18', 'past-events:34', 'future-plans:35', 'fixing-problems:24', 'opinions-reactions:36', 'city-day-checkpoint:23',
      'lost-stolen-police:37', 'pharmacy-health:25', 'emergency:26', 'no-subtitles:27', 'dress-rehearsal:28', 'complete-day-abroad:29',
    ]);
  });

  it('the benchmark sentences are all learner lines of the Core', () => {
    const said = new Set(BOOTCAMP_PLAN.flatMap((m) => MISSIONS_BY_LANG.en![m.day]!.items.map((i) => i.text)));
    for (const s of [
      "I'm going to eat at my grandmother's.", 'I stayed in a hostel.', "I'm going to Vietnam.", 'I like drawing.',
      "Yes, I'm free tomorrow.", "I think it's too expensive.", "I don't think so.", "I can't find my phone.", "I'm not sure.", 'Of course!',
    ]) expect(said.has(s), s).toBe(true);
  });

  it('English is British-leaning: "centre", never "center"', () => {
    for (const m of BOOTCAMP_PLAN) {
      const day = MISSIONS_BY_LANG.en![m.day]!;
      const all = [...day.items.map((i) => i.text), ...Object.values(day.dialogues).flatMap((d) => d.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)]))];
      for (const line of all) expect(line, m.id).not.toMatch(/\bcenter\b/i);
    }
  });

  it('Spanish is es-ES: a ticket is a "billete", never a "boleto"', () => {
    for (const m of BOOTCAMP_PLAN) {
      const day = MISSIONS_BY_LANG.es![m.day]!;
      const all = [
        ...day.items.map((i) => i.text),
        ...Object.values(day.dialogues).flatMap((d) => d.nodes.flatMap((n) => [n.en, ...(n.choices ?? []).map((c) => c.en)])),
        ...day.steps.flatMap((s) => (s.kind === 'ambush' ? [s.npc.en] : [])),
      ];
      for (const line of all) expect(line, m.id).not.toMatch(/boleto/i);
    }
    expect(text('public-transport', 'es')).toMatch(/billete/);
  });

  it('Mission 04 is two short scenes that still carry every engine', () => {
    const scenes = missionScenes('en', dayOf('everyday-core'));
    expect(scenes).toHaveLength(2);
    for (const s of scenes) expect(s.length).toBeLessThanOrEqual(11);
    const said = MISSIONS_BY_LANG.en![dayOf('everyday-core')]!.items.map((i) => i.text).join('\n');
    for (const engine of [/I want/, /I need/, /I have/, /I don't have/, /I know/, /I don't know/, /I can /, /I can't/, /Do you have/, /Can you/]) expect(said, String(engine)).toMatch(engine);
  });

  it('Mission 10 is a real arrival: border → taxi → hotel', () => {
    expect(Object.keys(MISSIONS_BY_LANG.en![dayOf('arrival-day-checkpoint')]!.dialogues)).toEqual(['cold-border', 'cold-taxi', 'cold-hotel']);
  });

  it('Mission 10: every line the learner says IS the sentence it is scored as', () => {
    for (const lang of LANGS) {
      const day = MISSIONS_BY_LANG[lang]![dayOf('arrival-day-checkpoint')]!;
      const border = day.dialogues['cold-border']!;
      const first = border.nodes.find((n) => n.choices?.length)!.choices![0]!;
      expect(first.itemId, lang).toBe(`${lang}.phrase.hotel.here-you-go`);
      expect(day.items.find((i) => i.id === first.itemId)!.text, lang).toBe(first.en); // shown = scored
      // …and it is the sentence Hotel Check-in teaches, not a second copy.
      expect(MISSIONS_BY_LANG[lang]![dayOf('hotel-check-in')]!.items.some((i) => i.id === first.itemId && i.text === first.en), lang).toBe(true);
    }
  });

  it('Mission 12 teaches no past tense — that is Mission 20', () => {
    expect(text('time-plans')).not.toMatch(/\b(ate|was|were|went|yesterday)\b/i);
  });

  it('Mission 14: "Anything else?" is answered with "That\'s all" — the special request rides with the order', () => {
    expect(answerTo('restaurant-meal', /^Anything else\?$/)).toBe("That's all, thanks.");
    expect(answerTo('restaurant-meal', /ready to order/i)).toMatch(/chicken, without onions/);
  });

  it('Mission 15 never calls vegetarianism an allergy, and never guarantees safety', () => {
    const asked = turns('special-requests-allergies').find((t) => t.who === 'npc' && /vegetarian/i.test(answerToOrEmpty(t.text)));
    expect(asked).toBeUndefined();
    expect(answerTo('special-requests-allergies', /dietary restrictions/i)).toBe("I'm vegetarian.");
    for (const lang of LANGS) expect(text('special-requests-allergies', lang)).not.toMatch(/completely safe|is safe|tout à fait sûr|sans danger|totalmente seguro|es seguro/i);
    expect(text('special-requests-allergies')).toMatch(/check with the kitchen/i);

    /** The learner's reply to a question that asks ONLY about allergies. */
    function answerToOrEmpty(npcLine: string): string {
      if (!/allergic to\?|allergies\?$/i.test(npcLine)) return '';
      const t = turns('special-requests-allergies');
      return t[t.findIndex((x) => x.text === npcLine) + 1]?.text ?? '';
    }
  });

  it('Mission 19: the platform is not announced before the learner asks for it', () => {
    const t = turns('public-transport');
    const ask = t.findIndex((x) => x.text === 'Which platform?');
    expect(ask).toBeGreaterThan(-1);
    for (const before of t.slice(0, ask)) expect(before.text).not.toMatch(/platform/i);
    expect(t[ask + 1]!.text).toMatch(/Platform two/);
  });

  it('Mission 22 is two scenes — a restaurant and a hotel — not one conversation', () => {
    expect(Object.keys(MISSIONS_BY_LANG.en![dayOf('fixing-problems')]!.dialogues)).toEqual(['fixing-problems', 'room-problem']);
    expect(text('fixing-problems')).toMatch(/send someone right away/);
  });

  it('Mission 23 has "I\'m not sure." and ends with a decision', () => {
    expect(text('opinions-reactions')).toMatch(/I'm not sure/);
    expect(answerTo('opinions-reactions', /only two hours/)).toBe("Okay, let's do it.");
  });

  it('Mission 25 is two scenes, and each person has one job', () => {
    expect(Object.keys(MISSIONS_BY_LANG.en![dayOf('lost-stolen-police')]!.dialogues)).toEqual(['asking-for-help', 'police-station']);
  });

  it('Mission 26 gives no medical guarantee', () => {
    for (const lang of LANGS) expect(text('pharmacy-health', lang)).not.toMatch(/safe for you|is safe|sans danger|es seguro|definitely|will work/i);
    expect(text('pharmacy-health')).toMatch(/This may help/);
    expect(text('pharmacy-health')).toMatch(/follow the instructions on the label/);
  });

  it('Mission 28 uses only known language, drops the idioms, and answers what was asked', () => {
    const at = BOOTCAMP_PLAN.findIndex((m) => m.id === 'no-subtitles');
    for (const lang of LANGS) {
      const earlier = new Map(BOOTCAMP_PLAN.slice(0, at).flatMap((m) => MISSIONS_BY_LANG[lang]![m.day]!.items).map((it) => [it.id, it.text]));
      for (const it of MISSIONS_BY_LANG[lang]![dayOf('no-subtitles')]!.items) expect(earlier.get(it.id), `${lang} ${it.id}`).toBe(it.text);
    }
    expect(text('no-subtitles')).not.toMatch(/good call|last one in|gotta|got a second|first time here/i);
    expect(answerTo('no-subtitles', /Beautiful place, right\?/)).toBe('This place is beautiful.');
  });

  it('Mission 30 still contains a successful recovery: slow down → simpler repeat → understood', () => {
    const t = turns('complete-day-abroad');
    const ask = t.findIndex((x) => x.who === 'you' && x.text === 'Please speak slowly.');
    expect(ask).toBeGreaterThan(0);
    expect(t[ask - 1]!.text.length).toBeGreaterThan(t[ask + 1]!.text.length); // the repeat is simpler
    expect(t[ask + 2]!.text).toBe('Okay, thank you.');
    expect(text('complete-day-abroad')).toMatch(/Two weeks in Vietnam\? I think that's too short\./);
    expect(answerTo('complete-day-abroad', /too short/)).toBe("I don't think so.");
    // The duration is stated before anyone disputes it.
    const stated = t.findIndex((x) => x.text === "I'll be there for two weeks.");
    expect(stated).toBeGreaterThan(-1);
    expect(stated).toBeLessThan(t.findIndex((x) => /Two weeks in Vietnam/.test(x.text)));
  });
});

describe('the generated four-language document', () => {
  const doc = renderDialogueDoc();

  it('lists Mission 01–30 once each, with the four language sections in the agreed order', () => {
    const headings = doc.split('\n').filter((l) => l.startsWith('# Mission '));
    expect(headings).toHaveLength(30);
    headings.forEach((h, i) => expect(h.startsWith(`# Mission ${String(i + 1).padStart(2, '0')} — `), h).toBe(true));
    for (const block of doc.split('\n---\n')) {
      const labels = block.split('\n').filter((l) => DOC_SECTIONS.some((s) => s.label === l));
      expect(labels).toEqual(['english:', 'franch:', 'spanish:', 'עברית:']);
      const sections = block.split(/\n(?:english:|franch:|spanish:|עברית:)\n/).slice(1);
      const turns = sections.map((s) => s.split('\n').filter((l) => l.startsWith('**')).map((l) => l.slice(0, 8)).join('|'));
      expect(new Set(turns).size, block.split('\n')[0]).toBe(1); // identical NPC/You sequence in all four
      const sceneMarks = sections.map((s) => s.split('\n').filter((l) => /^_Scene \d+_$/.test(l)).join('|'));
      expect(new Set(sceneMarks).size, block.split('\n')[0]).toBe(1); // identical scene boundaries in all four
    }
  });

  it('the checked-in docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md is exactly what the runtime content renders', () => {
    const file = fileURLToPath(new URL('../../../../../docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md', import.meta.url));
    expect(readFileSync(file, 'utf8'), 'stale — run: npm run gen:dialogues-doc').toBe(doc);
  });
});
