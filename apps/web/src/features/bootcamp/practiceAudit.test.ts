import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CORE_SPECS } from './core/index.js';
import { BOOTCAMP_PLAN } from './plan.js';
import { SPEC_SOURCE, allAuditQuestions, practiceAuditStats, renderPracticeAudit } from './practiceAudit.js';
import { MISSIONS_BY_LANG } from './registry.js';

/**
 * The Practice audit export is an inspection document generated from the runtime. These tests keep
 * it honest: complete (every mission, step, question, choice, branch and cold open is in it),
 * deterministic, and in sync with the checked-in file.
 */
const doc = renderPracticeAudit();
const stats = practiceAuditStats();
const strip = (id: string | undefined): string => (id ?? '').replace(/^[a-z]{2}\./, '');

describe('practice audit export', () => {
  it('is deterministic', () => {
    expect(renderPracticeAudit()).toBe(doc);
  });

  it('the checked-in document is exactly what the runtime renders', () => {
    const file = fileURLToPath(new URL('../../../../../docs/READY_CORE30_COMPLETE_PRACTICE_AUDIT_SOURCE.md', import.meta.url));
    expect(readFileSync(file, 'utf8') === doc, 'stale — run: npm run gen:practice-audit').toBe(true);
  });

  it('exports all 30 Core missions, in order, with their ids and registry keys', () => {
    expect(stats.missions).toBe(30);
    BOOTCAMP_PLAN.forEach((m, i) => {
      const n = String(i + 1).padStart(2, '0');
      expect(doc, m.id).toContain(`# Mission ${n} — ${m.title.en}\n\n- Displayed number: ${n}\n- Mission ID: \`${m.id}\`\n- Registry key/day: ${m.day}\n`);
    });
    for (const spec of CORE_SPECS) expect(SPEC_SOURCE[spec.day], `spec day ${spec.day}`).toBeDefined();
  });

  it('represents every runtime Practice step', () => {
    const sections = doc.split(/\n(?=# Mission \d\d — )/).slice(1);
    BOOTCAMP_PLAN.forEach((m, i) => {
      const flow = sections[i]!.split('## Current Practice flow')[1]!.split('\n\nStep sequence identical')[0]!;
      const listed = [...flow.matchAll(/^\d+\. `([a-zA-Z]+)`/gm)].map((x) => x[1]);
      expect(listed, m.id).toEqual(MISSIONS_BY_LANG.en![m.day]!.steps.map((s) => s.kind));
    });
  });

  it('exports every encoded question and every answer choice (counted independently from the content)', () => {
    let questions = 0, choices = 0, wrong = 0, cold = 0, replies = 0;
    for (const m of BOOTCAMP_PLAN) {
      const day = MISSIONS_BY_LANG.en![m.day]!;
      for (const s of day.steps) {
        if (s.kind === 'replies') { questions += s.replyIds.length; replies += s.replyIds.length; choices += s.replyIds.length * Math.min(3, s.replyIds.length); }
        if (s.kind === 'quiz') { questions++; choices += 1 + s.wrongIds.length; }
        if (s.kind === 'ambush') { questions++; cold++; choices += 2; }
        if (s.kind === 'quickReply') for (const r of s.rounds) { questions++; choices += r.options.length; }
        if (s.kind === 'swap') for (const r of s.rounds) { questions++; choices += r.options.length; }
        if (s.kind === 'visualMatch') { questions += s.rounds.length; choices += s.rounds.length * s.tiles.length; }
        if (s.kind === 'miniMap') for (const r of s.rounds) { questions++; choices += r.cells.filter((c) => c.tappable).length; }
        if (s.kind === 'matchPairs') { questions += s.pairs.length; choices += s.pairs.length * s.pairs.length; }
        if (s.kind === 'sentenceBuilder') { questions += s.rounds.length; choices += s.rounds.length; }
        if (s.kind === 'dialogue') {
          for (const node of day.dialogues[s.dialogueId]!.nodes) {
            if (!node.choices?.length) continue;
            questions++;
            choices += node.choices.length;
            wrong += node.choices.filter((c) => !c.correct).length;
          }
        }
      }
    }
    expect(stats.questions).toBe(questions);
    expect(stats.answerChoices).toBe(choices);
    expect(stats.wrongBranches).toBe(wrong);
    expect(stats.coldOpens).toBe(cold);
    expect(stats.expectedReplyItems).toBe(replies);
    expect(allAuditQuestions()).toHaveLength(questions);
    // …and each one is in the Question Bank under its reference.
    expect([...doc.matchAll(/^\*\*M\d\d-Q\d\d\*\* — /gm)]).toHaveLength(questions);
  });

  it('exports every dialogue node, branch and choice line, and every sentence, in all three languages', () => {
    for (const lang of ['en', 'fr', 'es'] as const) {
      for (const m of BOOTCAMP_PLAN) {
        const day = MISSIONS_BY_LANG[lang]![m.day]!;
        for (const it of day.items) {
          expect(doc.includes(it.text), `${lang} ${m.id} sentence "${it.text}"`).toBe(true);
          expect(doc.includes(`\`${strip(it.id)}\``), it.id).toBe(true);
        }
        for (const d of Object.values(day.dialogues)) {
          for (const node of d.nodes) {
            if (node.en) expect(doc.includes(node.en), `${lang} ${m.id} ${d.id}/${node.id}`).toBe(true);
            for (const c of node.choices ?? []) expect(doc.includes(c.en), `${lang} ${m.id} ${d.id}/${node.id} choice`).toBe(true);
          }
        }
        for (const s of day.steps) if (s.kind === 'ambush') expect(doc.includes(s.npc.en), `${lang} ${m.id} cold open`).toBe(true);
      }
    }
  });
});
