import { describe, expect, it } from 'vitest';
import { DAYS_ES } from './index.js';
import { DAYS } from '../registry.js';
import { missionParity, unreachableOrDeadEnds } from '../parity.js';
import { dialogueTranscript } from '../transcript.js';

/**
 * Spanish Bootcamp integrity (Sprint 4) — for EVERY built Spanish mission: `es.*` ids (progress/review
 * isolation), the spoken primary is Spanish (never the English gloss), no dead-end branches, and the
 * transcript is fully bilingual (Spanish line + en & he glosses). Structural parity vs English is
 * covered here too; this guards the CONTENT for no English/French leaks.
 */
const builtDays = Object.keys(DAYS_ES).map(Number).sort((a, b) => a - b);

describe('Spanish missions — full parity + content integrity', () => {
  it('covers all 30 missions', () => {
    expect(builtDays).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it('every Spanish mission item uses an es.* id', () => {
    for (const d of builtDays) {
      for (const item of DAYS_ES[d]!.items) expect(item.id.startsWith('es.')).toBe(true);
    }
  });

  it('every spoken dialogue line is Spanish, not the English gloss', () => {
    for (const d of builtDays) {
      for (const dlg of Object.values(DAYS_ES[d]!.dialogues)) {
        for (const node of dlg.nodes) {
          if (node.en && node.tr?.en) expect(node.en).not.toBe(node.tr.en); // primary ≠ English gloss
          for (const c of node.choices ?? []) {
            if (c.en && c.tr?.en) expect(c.en).not.toBe(c.tr.en);
          }
        }
      }
    }
  });

  it('no Spanish target field contains a stray French recovery marker (ç/œ or common FR words)', () => {
    // Guards against accidental French text pasted into Spanish target positions.
    const frMarkers = /(s['’]il vous plaît|merci|bonjour|au revoir|c['’]est|vous pouvez)/i;
    for (const d of builtDays) {
      for (const item of DAYS_ES[d]!.items) expect(frMarkers.test(item.text)).toBe(false);
      for (const dlg of Object.values(DAYS_ES[d]!.dialogues)) {
        for (const node of dlg.nodes) {
          if (node.en) expect(frMarkers.test(node.en)).toBe(false);
          for (const c of node.choices ?? []) if (c.en) expect(frMarkers.test(c.en)).toBe(false);
        }
      }
    }
  });

  it('every mission transcript is fully bilingual (Spanish + en & he glosses)', () => {
    for (const d of builtDays) {
      for (const dlg of Object.values(DAYS_ES[d]!.dialogues)) {
        const lines = dialogueTranscript(dlg);
        expect(lines.length).toBeGreaterThan(0);
        for (const l of lines) {
          expect(l.en.trim().length).toBeGreaterThan(0);      // Spanish spoken line
          expect(l.tr?.en?.trim().length).toBeGreaterThan(0); // English gloss
          expect(l.tr?.he?.trim().length).toBeGreaterThan(0); // Hebrew gloss
        }
      }
    }
  });

  it('no dialogue branch dead-ends, and each mission structurally matches its English counterpart', () => {
    for (const d of builtDays) {
      for (const dlg of Object.values(DAYS_ES[d]!.dialogues)) expect(unreachableOrDeadEnds(dlg)).toEqual([]);
    }
    const report = missionParity('es', DAYS, DAYS_ES);
    for (const m of report.perMission) expect(m.ok).toBe(true);
    expect(report.covered).toBe(30);
    expect(report.complete).toBe(true);
  });

  it('Spanish references no video file yet (video steps degrade to an honest "unavailable")', () => {
    // Parity keeps Mission 2's intro/again video steps, but no Es_day*.mp4 exists, so no mission
    // sets introVideo — the VideoStep renderer shows "video unavailable" (never an English video).
    for (const d of builtDays) expect(DAYS_ES[d]!.introVideo).toBeUndefined();
  });
});
