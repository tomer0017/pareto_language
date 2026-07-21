import { describe, expect, it } from 'vitest';
import { DAYS_FR } from './index.js';
import { DAYS } from '../registry.js';
import { missionParity, unreachableOrDeadEnds } from '../parity.js';
import { dialogueTranscript } from '../transcript.js';

/**
 * French Bootcamp integrity (Part D2) — for EVERY built French mission: `fr.*` ids (progress/review
 * isolation), the spoken primary is French (never the English gloss), no dead-end branches, and the
 * transcript is fully bilingual (French line + en & he glosses). Structural parity vs English is
 * covered in parity.test.ts; this guards the CONTENT for no English leaks.
 */
const builtDays = Object.keys(DAYS_FR).map(Number).sort((a, b) => a - b);

describe('French missions — content integrity (no English leaks)', () => {
  it('every French mission item uses an fr.* id', () => {
    for (const d of builtDays) {
      for (const item of DAYS_FR[d]!.items) expect(item.id.startsWith('fr.')).toBe(true);
    }
  });

  it('every spoken dialogue line is French, not the English gloss', () => {
    for (const d of builtDays) {
      for (const dlg of Object.values(DAYS_FR[d]!.dialogues)) {
        for (const node of dlg.nodes) {
          if (node.en && node.tr?.en) expect(node.en).not.toBe(node.tr.en); // primary ≠ English gloss
          for (const c of node.choices ?? []) {
            if (c.en && c.tr?.en) expect(c.en).not.toBe(c.tr.en);
          }
        }
      }
    }
  });

  it('every mission transcript is fully bilingual (French + en & he glosses)', () => {
    for (const d of builtDays) {
      for (const dlg of Object.values(DAYS_FR[d]!.dialogues)) {
        const lines = dialogueTranscript(dlg);
        expect(lines.length).toBeGreaterThan(0);
        for (const l of lines) {
          expect(l.en.trim().length).toBeGreaterThan(0);      // French spoken line
          expect(l.tr?.en?.trim().length).toBeGreaterThan(0); // English gloss
          expect(l.tr?.he?.trim().length).toBeGreaterThan(0); // Hebrew gloss
        }
      }
    }
  });

  it('no dialogue branch dead-ends, and each mission structurally matches its English counterpart', () => {
    for (const d of builtDays) {
      for (const dlg of Object.values(DAYS_FR[d]!.dialogues)) expect(unreachableOrDeadEnds(dlg)).toEqual([]);
    }
    const report = missionParity('fr', DAYS, DAYS_FR);
    for (const m of report.perMission) expect(m.ok).toBe(true);
    expect(report.covered).toBe(builtDays.length);
  });

  it('French full-conversation videos map to Fr_day{n}.mp4 (fr locale); discovered via missionsFor(fr)', () => {
    // Each video-carrying mission points at its own French file. Mission 2 mirrors English Mission 2
    // (intro/again video steps); Missions 3–6 only surface the video in the hub / Videos experience.
    for (const [day, src] of [[2, 'Fr_day2'], [3, 'Fr_day3'], [4, 'Fr_day4'], [5, 'Fr_day5'], [6, 'Fr_day6'], [9, 'Fr_day9'], [11, 'Fr_day11']] as const) {
      const m = DAYS_FR[day]!;
      expect(m.introVideo?.src).toBe(`/videos/${src}.mp4`);
      expect(m.introVideo?.language).toBe('fr');
    }
    for (const day of [3, 4, 5, 6, 9, 11] as const) {
      expect(DAYS_FR[day]!.steps.some((s) => s.kind === 'video')).toBe(false);
    }
    // Video is opt-in — a mission without one never fakes a video step.
    for (const d of builtDays) {
      if (!DAYS_FR[d]!.introVideo) expect(DAYS_FR[d]!.steps.some((s) => s.kind === 'video')).toBe(false);
    }
  });
});
