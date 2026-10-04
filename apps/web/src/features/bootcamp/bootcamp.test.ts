import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOTCAMP_PLAN, EXTENDED_POOL, MERGED_MISSIONS, PHASES, missionNumber, nextMission } from './plan.js';
import { DAYS_FR } from './fr/index.js';
import { DAYS_ES } from './es/index.js';
import { DAYS } from './registry.js';
import { DAY1 } from './day1.js';
import { DAY2 } from './day2.js';
import { DAY3 } from './day3.js';
import { DAY4 } from './day4.js';
import { DAY5 } from './day5.js';
import { DAY6 } from './day6.js';
import { DAY7 } from './day7.js';
import { DAY8 } from './day8.js';
import { DAY10 } from './day10.js';

import type { BootcampDayContent, BootcampDialogue, BootcampStep } from './types.js';

/**
 * Mission data integrity (Sprint 7). The pedagogy is enforced by tests, not convention:
 * dialogue trees must be sound (no dead ends, wrong choices branch and return), every
 * reference must resolve, and depth/ordering rules hold per mission.
 */

/** Graph validator: every target resolves, an end exists and is reachable, choices are sane. */
function validateDialogue(d: BootcampDialogue): string[] {
  const issues: string[] = [];
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  if (!byId.has(d.start)) issues.push(`start ${d.start} missing`);
  let hasEnd = false;
  for (const n of d.nodes) {
    if (n.end) hasEnd = true;
    if (n.next && !byId.has(n.next)) issues.push(`${n.id} → missing ${n.next}`);
    if (n.who === 'you' && !n.next && !n.choices?.length && !n.end) issues.push(`${n.id}: you-node with no way forward`);
    for (const c of n.choices ?? []) {
      if (!byId.has(c.next)) issues.push(`${n.id} choice "${c.en}" → missing ${c.next}`);
    }
    if (n.choices && !n.choices.some((c) => c.correct)) issues.push(`${n.id}: no correct choice`);
  }
  if (!hasEnd) issues.push('no end node');
  // Reachability: BFS from start must reach an end node.
  const seen = new Set<string>();
  const queue = [d.start];
  let reachedEnd = false;
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const n = byId.get(id);
    if (!n) continue;
    if (n.end) reachedEnd = true;
    if (n.next) queue.push(n.next);
    for (const c of n.choices ?? []) queue.push(c.next);
  }
  if (!reachedEnd) issues.push('end unreachable from start');
  const unreachable = d.nodes.filter((n) => !seen.has(n.id));
  if (unreachable.length > 0) issues.push(`unreachable nodes: ${unreachable.map((n) => n.id).join(',')}`);
  return issues;
}

/** Every step/dialogue reference in a mission must resolve to a real item. */
function validateMission(day: BootcampDayContent): string[] {
  const issues: string[] = [];
  const ids = new Set(day.items.map((i) => i.id));
  for (const step of day.steps) {
    if (step.kind === 'tool' && !ids.has(step.itemId)) issues.push(`tool → ${step.itemId}`);
    if (step.kind === 'quiz') {
      if (!ids.has(step.itemId)) issues.push(`quiz → ${step.itemId}`);
      for (const w of step.wrongIds) if (!ids.has(w)) issues.push(`quiz wrong → ${w}`);
    }
    if (step.kind === 'replies') {
      if (!ids.has(step.saidItemId)) issues.push(`replies said → ${step.saidItemId}`);
      for (const r of step.replyIds) if (!ids.has(r)) issues.push(`replies → ${r}`);
    }
    if (step.kind === 'swipe') for (const id of step.itemIds) if (!ids.has(id)) issues.push(`swipe → ${id}`);
    if (step.kind === 'ambush') {
      if (!ids.has(step.correctItemId)) issues.push(`ambush correct → ${step.correctItemId}`);
      if (!ids.has(step.wrongItemId)) issues.push(`ambush wrong → ${step.wrongItemId}`);
    }
    if (step.kind === 'prime') {
      if (step.buildFromItemId && !ids.has(step.buildFromItemId)) issues.push(`prime build → ${step.buildFromItemId}`);
      if (step.words.length === 0) issues.push('prime: no words');
    }
    if (step.kind === 'dialogue' && !day.dialogues[step.dialogueId]) issues.push(`dialogue → ${step.dialogueId}`);
  }
  for (const d of Object.values(day.dialogues)) {
    issues.push(...validateDialogue(d).map((x) => `${d.id}: ${x}`));
    for (const n of d.nodes) for (const c of n.choices ?? []) {
      if (c.itemId && !ids.has(c.itemId)) issues.push(`${d.id}/${n.id}: choice item → ${c.itemId}`);
    }
  }
  return issues;
}

describe('Core 30 roadmap', () => {
  it('has exactly 30 missions across 5 phases with full metadata', () => {
    expect(BOOTCAMP_PLAN.length).toBe(30);
    expect(PHASES.length).toBe(5);
    for (const m of BOOTCAMP_PLAN) {
      expect(PHASES.some((p) => p.n === m.phase)).toBe(true);
      expect(m.title.he && m.title.en).toBeTruthy();
      expect(m.why.length).toBeGreaterThan(10);
      expect(m.preparesNext.length).toBeGreaterThan(10);
      expect(m.minutes).toBeGreaterThanOrEqual(18);
    }
  });

  it('opens with Introduce Myself and ends with A Complete Day Abroad Alone', () => {
    expect(BOOTCAMP_PLAN[0]!.id).toBe('introduce-myself');
    expect(BOOTCAMP_PLAN[0]!.title.en).toBe('Introduce Myself');
    expect(missionNumber(BOOTCAMP_PLAN[0]!.day)).toBe(1);
    expect(BOOTCAMP_PLAN.at(-1)!.id).toBe('complete-day-abroad');
    expect(BOOTCAMP_PLAN.at(-1)!.title.en).toBe('A Complete Day Abroad Alone');
    expect(missionNumber(BOOTCAMP_PLAN.at(-1)!.day)).toBe(30);
  });

  it('walks the journey in the agreed order', () => {
    expect(BOOTCAMP_PLAN.map((m) => m.id)).toEqual([
      'introduce-myself', 'numbers-money', 'coffee-shop', 'everyday-core', 'directions',
      'airport-border', 'taxi', 'hotel-check-in', 'shopping', 'arrival-day-checkpoint',
      'small-talk', 'time-plans', 'home-family', 'restaurant-meal', 'special-requests-allergies',
      'hobbies-free-time', 'supermarket', 'food-day-checkpoint',
      'public-transport', 'past-events', 'future-plans', 'fixing-problems', 'opinions-reactions', 'city-day-checkpoint',
      'lost-stolen-police', 'pharmacy-health', 'emergency', 'no-subtitles', 'dress-rehearsal', 'complete-day-abroad',
    ]);
  });

  it('shows the agreed Core 30 titles, in order', () => {
    expect(BOOTCAMP_PLAN.map((m) => m.title.en)).toEqual([
      'Introduce Myself', 'Numbers & Money', 'Coffee Shop', 'Everyday Core: Want / Need / Have / Can', 'Directions',
      'Airport & Border', 'Taxi / Uber', 'Hotel Check-in', 'Shopping', 'CHECKPOINT: Arrival Day',
      'Small Talk & Recommendations', 'Time & Plans', 'Home, Family & Daily Routine', 'Restaurant Meal',
      'Food Preferences & Allergies', 'Hobbies & Free Time', 'Supermarket & Everyday Shopping', 'CHECKPOINT: Everyday Day',
      'Public Transport', 'Past & Recent Events', 'Future Travel & Plans', 'Fixing Problems',
      'Opinions, Feelings & Reactions', 'CHECKPOINT: City & Conversation',
      'Lost / Stolen / Police', 'Pharmacy & Health', 'Emergency', 'No Subtitles', 'Dress Rehearsal: Full Evening',
      'A Complete Day Abroad Alone',
    ]);
  });

  it('a mission\'s registry key is not its position — reordering the journey renames nothing', () => {
    // The whole point of the id / day / number split: Taxi kept its key (and its video file) when it
    // moved from 6th to 7th; the new missions took fresh keys instead of shifting everyone else.
    const taxi = BOOTCAMP_PLAN.find((m) => m.id === 'taxi')!;
    expect(taxi.day).toBe(6);
    expect(missionNumber(taxi.day)).toBe(7);
    expect(BOOTCAMP_PLAN.find((m) => m.id === 'everyday-core')!.day).toBe(30);
    expect(missionNumber(30)).toBe(4);
  });

  it('display numbers are continuous 1–30 with no duplicates', () => {
    const numbers = BOOTCAMP_PLAN.map((m) => missionNumber(m.day));
    expect(numbers).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(new Set(numbers).size).toBe(BOOTCAMP_PLAN.length);
    expect(missionNumber(0)).toBeNull();
    for (const m of [...EXTENDED_POOL, ...MERGED_MISSIONS]) expect(missionNumber(m.day), m.id).toBeNull(); // out of the Core: no number
  });

  it('mission ids are stable semantic slugs — unique, and never a number or a day key', () => {
    const ids = BOOTCAMP_PLAN.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    expect(new Set(BOOTCAMP_PLAN.map((m) => m.day)).size).toBe(BOOTCAMP_PLAN.length);
  });

  it('every plan entry resolves to built content in every language, and nothing is registered outside the plan', () => {
    const planDays = BOOTCAMP_PLAN.map((m) => m.day).sort((a, b) => a - b);
    for (const [lang, set] of Object.entries({ en: DAYS, fr: DAYS_FR, es: DAYS_ES })) {
      expect(Object.keys(set).map(Number).sort((a, b) => a - b), lang).toEqual(planDays);
      for (const m of BOOTCAMP_PLAN) expect(set[m.day]!.day, `${lang} ${m.id}`).toBe(m.day);
    }
    // The plan card and the content it opens are the same mission — in both app languages.
    for (const m of BOOTCAMP_PLAN) {
      expect(DAYS[m.day]!.title.he, m.id).toBe(m.title.he);
      expect(DAYS[m.day]!.title.en, m.id).toBe(m.title.en);
    }
  });

  it('the Recovery Toolkit is not a Bootcamp mission — in the plan or in any language', () => {
    const recoveryTitle = /recovery toolkit|rescue kit|ערכת חילוץ|i can survive/i;
    for (const m of BOOTCAMP_PLAN) {
      expect(`${m.id} ${m.title.en} ${m.title.he}`).not.toMatch(recoveryTitle);
      expect(m.situations).not.toContain('recovery');
    }
    for (const set of [DAYS, DAYS_FR, DAYS_ES]) {
      for (const day of Object.values(set)) {
        expect(`${day.title.en} ${day.title.he}`).not.toMatch(recoveryTitle);
        expect(day.dialogues['stuck-traveler']).toBeUndefined();
        // No mission is a recovery-only lesson: the tools are reused, never the whole item list.
        expect(day.items.every((i) => i.id.includes('.phrase.recovery.'))).toBe(false);
      }
    }
  });

  it('checkpoints sit at 10, 18, 24 and the finale (30) — cold integration, no new content', () => {
    const cps = BOOTCAMP_PLAN.filter((m) => m.checkpoint);
    expect(cps.map((m) => missionNumber(m.day))).toEqual([10, 18, 24, 30]);
    expect(cps.map((m) => m.id)).toEqual(['arrival-day-checkpoint', 'food-day-checkpoint', 'city-day-checkpoint', 'complete-day-abroad']);
    for (const cp of cps) {
      expect(cp.targets.concepts).toBe(0);
      expect(cp.targets.phrases).toBe(0);
    }
  });
});

describe('next-mission navigation follows plan order', () => {
  const all = (): boolean => true;
  const none = (): boolean => false;
  const dayOf = (id: string): number => BOOTCAMP_PLAN.find((m) => m.id === id)!.day;

  it('Introduce Myself leads to Numbers & Money, and so on down the shifted journey', () => {
    expect(nextMission(dayOf('introduce-myself'), all, none)?.id).toBe('numbers-money');
    expect(nextMission(dayOf('coffee-shop'), all, none)?.id).toBe('everyday-core');
    expect(nextMission(dayOf('directions'), all, none)?.id).toBe('airport-border');
    expect(nextMission(dayOf('shopping'), all, none)?.id).toBe('arrival-day-checkpoint');
    expect(nextMission(dayOf('arrival-day-checkpoint'), all, none)?.id).toBe('small-talk');
    expect(nextMission(dayOf('dress-rehearsal'), all, none)?.id).toBe('complete-day-abroad');
  });

  it('every mission but the last has a next, and each one is preceded by the mission before it', () => {
    BOOTCAMP_PLAN.forEach((m, i) => {
      expect(nextMission(m.day, all, none)).toBe(BOOTCAMP_PLAN[i + 1]);
    });
  });

  it('the finale has no next mission; an unknown day has none either', () => {
    expect(nextMission(dayOf('complete-day-abroad'), all, none)).toBeUndefined();
    expect(nextMission(999, all, none)).toBeUndefined();
  });

  it('skips completed and unbuilt missions', () => {
    const done = new Set(['numbers-money']);
    expect(nextMission(dayOf('introduce-myself'), all, (m) => done.has(m.id))?.id).toBe('coffee-shop');
    expect(nextMission(dayOf('introduce-myself'), (m) => m.id === 'directions', none)?.id).toBe('directions');
    expect(nextMission(dayOf('introduce-myself'), none, none)).toBeUndefined();
  });
});

describe('all built missions are structurally sound', () => {
  const built = Object.entries(DAYS);
  it('has every mission of the plan built', () => {
    expect(Object.keys(DAYS).map(Number).sort((a, b) => a - b)).toEqual(BOOTCAMP_PLAN.map((m) => m.day).sort((a, b) => a - b));
  });
  for (const [num, day] of built) {
    it(`mission ${num} passes reference + dialogue-graph validation`, () => {
      expect(validateMission(day)).toEqual([]);
    });
    it(`mission ${num} is dialogue-deep and ends with evidence + summary`, () => {
      const kinds = day.steps.map((s) => s.kind);
      expect(kinds).toContain('dialogue');
      expect(kinds.filter((k) => k === 'receipt').length).toBeGreaterThanOrEqual(2);
      expect(kinds.at(-1)).toBe('summary');
      // Every 'you' choice node offers at least one recovery-tool escape hatch OR a valid line.
      for (const d of Object.values(day.dialogues)) {
        for (const n of d.nodes) {
          if (n.choices) expect(n.choices.some((c) => c.correct)).toBe(true);
        }
      }
    });
  }
  it('content missions train expected replies (comprehension-first)', () => {
    // Cold/checkpoint missions (plan concepts === 0) introduce no new content, so they
    // legitimately skip the replies drill.
    const coldDays = new Set(BOOTCAMP_PLAN.filter((m) => m.targets.concepts === 0).map((m) => m.day));
    for (const [num, day] of built) {
      const n = Number(num);
      if (coldDays.has(n)) continue;
      expect(day.steps.some((s) => s.kind === 'replies')).toBe(true);
    }
  });
});

describe('Mission 1 — Introduce Myself (the first encounter)', () => {
  it('is structurally sound (all references + dialogue graph)', () => {
    expect(DAY1.title.en).toBe('Introduce Myself');
    expect(validateMission(DAY1)).toEqual([]);
  });

  it('teaches its own phrases — recovery tools are a reused minority, not the lesson', () => {
    const own = DAY1.items.filter((i) => !i.id.startsWith('en.phrase.recovery.'));
    const reused = DAY1.items.filter((i) => i.id.startsWith('en.phrase.recovery.'));
    expect(own.length).toBeGreaterThan(reused.length);
    const tools = DAY1.steps.filter((s) => s.kind === 'tool') as Extract<BootcampStep, { kind: 'tool' }>[];
    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) expect(tool.itemId.startsWith('en.phrase.social.')).toBe(true);
  });

  it('names itself Mission 1 on its opening card', () => {
    const talk = DAY1.steps.find((s) => s.kind === 'talk') as Extract<BootcampStep, { kind: 'talk' }>;
    expect(talk.title.en).toBe('Mission 1: Introduce Myself');
    expect(talk.title.he).toBe('משימה 1: להציג את עצמי');
  });
});

describe('in-mission titles match the mission\'s display number', () => {
  for (const [lang, set] of Object.entries({ en: DAYS, fr: DAYS_FR, es: DAYS_ES })) {
    it(`${lang}: every "Mission N:" card shows the mission's own number`, () => {
      for (const day of Object.values(set)) {
        for (const step of day.steps) {
          if (step.kind !== 'talk') continue;
          for (const title of [step.title.en ?? '', step.title.he ?? '']) {
            const n = /^(?:Mission|משימה) (\d+):/.exec(title)?.[1];
            if (n !== undefined) expect(Number(n), `${lang} day ${day.day}: ${title}`).toBe(missionNumber(day.day));
          }
        }
      }
    });
  }
});

describe('recovery tools stay reusable inside other missions', () => {
  it('missions still bundle the shared kit, and every recovery line in a dialogue resolves to an item', () => {
    const usedIn = Object.values(DAYS).filter((d) => d.items.some((i) => i.id.startsWith('en.phrase.recovery.')));
    expect(usedIn.length).toBeGreaterThan(10);
    for (const day of Object.values(DAYS)) {
      const ids = new Set(day.items.map((i) => i.id));
      for (const d of Object.values(day.dialogues)) {
        for (const c of d.nodes.flatMap((n) => n.choices ?? [])) {
          if (c.itemId?.startsWith('en.phrase.recovery.')) expect(ids.has(c.itemId)).toBe(true);
        }
      }
    }
  });
});

/** Node ids visited on the ideal run: follow `next`; at a choice take the first correct one. */
function happyPathNodes(d: BootcampDialogue): Set<string> {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  let node = byId.get(d.start);
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    if (node.who === 'you' && node.choices?.length) {
      const choice = node.choices.find((c) => c.correct) ?? node.choices[0]!;
      node = byId.get(choice.next);
      continue;
    }
    if (node.end || !node.next) break;
    node = byId.get(node.next);
  }
  return seen;
}

describe('Dialogue integrity — the NPC never continues as if a wrong pick were correct', () => {
  // The learning bug we guard against: a `correct: false` choice whose `next` lands directly on
  // the happy path (so the NPC ignores the wrong answer) or shares its target with a correct
  // sibling (identical response either way). Every wrong pick MUST route to its own recovery beat.
  for (const [num, day] of Object.entries(DAYS)) {
    it(`mission ${num}: every wrong choice routes to a distinct recovery beat`, () => {
      const offenders: string[] = [];
      for (const d of Object.values(day.dialogues)) {
        const byId = new Map(d.nodes.map((n) => [n.id, n]));
        const happy = happyPathNodes(d);
        for (const n of d.nodes) {
          if (!n.choices) continue;
          const correctTargets = new Set(n.choices.filter((c) => c.correct).map((c) => c.next));
          for (const c of n.choices) {
            if (c.correct) continue;
            if (happy.has(c.next)) offenders.push(`${d.id}/${n.id}: "${c.en}" → happy-path node ${c.next}`);
            else if (correctTargets.has(c.next)) offenders.push(`${d.id}/${n.id}: "${c.en}" shares next with a correct choice`);
            const target = byId.get(c.next);
            if (target && target.who !== 'npc') offenders.push(`${d.id}/${n.id}: "${c.en}" → non-NPC node ${c.next} (no reaction)`);
          }
        }
      }
      expect(offenders).toEqual([]);
    });
  }
});

describe('Believability — a different answer gets a different, matching reaction', () => {
  it('Mission 7: asking the wifi password is answered about wifi, not breakfast', () => {
    const scene = DAY7.dialogues['hotel-checkin']!;
    const byId = new Map(scene.nodes.map((n) => [n.id, n]));
    const node = scene.nodes.find((n) => n.choices?.some((c) => c.en.includes('wifi password')))!;
    const wifi = node.choices!.find((c) => c.en.includes('wifi password'))!;
    const breakfast = node.choices!.find((c) => c.en.includes('breakfast'))!;
    expect(wifi.next).not.toBe(breakfast.next); // no shared, one-size-fits-all answer
    expect(byId.get(wifi.next)!.en.toLowerCase()).toContain('wifi'); // reacts to what was actually asked
  });

  it('Mission 8: a price objection is acknowledged, not ignored', () => {
    const scene = DAY8.dialogues['clothing-shop']!;
    const byId = new Map(scene.nodes.map((n) => [n.id, n]));
    const node = scene.nodes.find((n) => n.choices?.some((c) => c.en.includes('expensive')))!;
    const takeIt = node.choices!.find((c) => c.en.includes("take it"))!;
    const object = node.choices!.find((c) => c.en.includes('expensive'))!;
    expect(object.next).not.toBe(takeIt.next);
    expect(byId.get(object.next)!.en.toLowerCase()).toMatch(/off|price|understand/); // reacts to the objection
  });
});

describe('dialogue coaching mode is dormant', () => {
  it('no built mission enables dialogue coaching (it belonged to the retired Recovery Toolkit)', () => {
    for (const day of Object.values(DAYS)) {
      for (const d of Object.values(day.dialogues)) expect(d.coaching ?? false).toBe(false);
    }
  });
});

describe('Mission 3 — Coffee Shop (Deep Moment exemplar)', () => {
  it('is structurally sound (all references + dialogue graph)', () => {
    expect(validateMission(DAY3)).toEqual([]);
  });

  it('covers the full barista question-chain as expected replies', () => {
    const replyIds = DAY3.items.filter((i) => i.id.startsWith('en.reply.')).map((i) => i.id);
    for (const key of ['here-or-to-go', 'medium-or-large', 'milk-sugar', 'anything-to-eat', 'anything-else', 'cash-or-card', 'receipt', 'enjoy']) {
      expect(replyIds.some((id) => id.includes(key))).toBe(true);
    }
    expect(replyIds.length).toBeGreaterThanOrEqual(8); // depth before breadth
  });

  it('trains expected replies BEFORE the live dialogue, and includes an off-script cold open', () => {
    const kinds = DAY3.steps.map((s) => s.kind);
    expect(kinds.indexOf('replies')).toBeGreaterThan(-1);
    expect(kinds.indexOf('replies')).toBeLessThan(kinds.indexOf('dialogue'));
    expect(kinds).toContain('ambush');
    expect(kinds.at(-1)).toBe('summary');
  });

  it('reuses recovery tools inside the scene (spaced review in context)', () => {
    const scene = DAY3.dialogues['breakfast-order']!;
    const recoveryChoices = scene.nodes.flatMap((n) => (n.choices ?? []).filter((c) => c.itemId?.startsWith('en.phrase.recovery.')));
    expect(recoveryChoices.length).toBeGreaterThanOrEqual(3);
    expect(recoveryChoices.every((c) => c.correct)).toBe(true); // using a tool is ALWAYS a valid move
  });

  it('the breakfast scene walks the founder flow: order → size → milk/sugar → food → pay → receipt → goodbye', () => {
    const en = DAY3.dialogues['breakfast-order']!.nodes.map((n) => n.en).join(' ');
    for (const beat of ['What can I get you', 'Medium or large', 'Milk and sugar', 'Anything to eat', 'anything else', 'Cash or card', 'receipt', 'enjoy your day']) {
      expect(en.toLowerCase()).toContain(beat.toLowerCase());
    }
  });
});

describe('video-first Bootcamp (intro/review video)', () => {
  const publicDir = fileURLToPath(new URL('../../../public', import.meta.url));

  it('Mission 1 carries the intro video at the documented public path', () => {
    expect(DAY1.introVideo).toBeDefined();
    expect(DAY1.introVideo?.src).toBe('/videos/En_day1.mp4');
    expect(DAY1.introVideo?.language).toBe('en');
    expect(DAYS_FR[1]!.introVideo?.src).toBe('/videos/Fr_day1.mp4');
  });

  it('Mission 1 opens with a video-intro step and replays it before the summary', () => {
    const kinds = DAY1.steps.map((s) => s.kind);
    expect(kinds[0]).toBe('video'); // watch the full conversation first
    const videoSteps = DAY1.steps.filter((s) => s.kind === 'video') as Extract<BootcampStep, { kind: 'video' }>[];
    expect(videoSteps.map((s) => s.mode)).toEqual(['intro', 'again']);
    // "watch again" sits immediately before the final summary.
    expect(kinds[kinds.length - 2]).toBe('video');
    expect(kinds.at(-1)).toBe('summary');
  });

  it('Missions 2–4, 6–8 and 10 ship a full-conversation video (hub / Videos experience), without injecting video steps', () => {
    for (const [day, src] of [
      [DAY2, 'En_day2'], [DAY3, 'En_day3'], [DAY4, 'En_day4'],
      [DAY6, 'En_day6'], [DAY7, 'En_day7'], [DAY8, 'En_day8'], [DAY10, 'En_day10'],
    ] as const) {
      expect(day.introVideo).toBeDefined();
      expect(day.introVideo?.src).toBe(`/videos/${src}.mp4`);
      expect(day.introVideo?.language).toBe('en');
      expect(day.steps.some((s) => s.kind === 'video')).toBe(false);
    }
  });

  it('every video reference, in every language, resolves to a real file in public/', () => {
    let referenced = 0;
    for (const [lang, set] of Object.entries({ en: DAYS, fr: DAYS_FR, es: DAYS_ES })) {
      for (const day of Object.values(set)) {
        if (!day.introVideo) continue;
        referenced++;
        expect(day.introVideo.src).toMatch(/^\/videos\/[A-Za-z]+_day\d+\.mp4$/);
        expect(existsSync(publicDir + day.introVideo.src), `${lang} day ${day.day} → ${day.introVideo.src}`).toBe(true);
      }
    }
    expect(referenced).toBe(15); // 8 English + 7 French; nothing was lost or invented in the rename
  });

  it('videos are opt-in per mission; a mission without one degrades gracefully (no video step, hub still has a transcript)', () => {
    const withVideo = new Set<number>();
    for (const [num, day] of Object.entries(DAYS)) {
      const hasVideoStep = day.steps.some((s) => s.kind === 'video');
      if (day.introVideo) withVideo.add(Number(num));
      else {
        expect(hasVideoStep).toBe(false); // never a placeholder video step without a video
        expect(Object.keys(day.dialogues).length).toBeGreaterThan(0); // the transcript reader still works
      }
    }
    // Missions 1–4, 6–8 and 10 ship the full-conversation video; 5 and 9 are real gaps.
    expect([...withVideo].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 6, 7, 8, 10]);
    expect(DAY5.introVideo).toBeUndefined();
    expect(DAYS[9]!.introVideo).toBeUndefined();
    expect(DAY1.steps.some((s) => s.kind === 'video')).toBe(true);
  });
});
