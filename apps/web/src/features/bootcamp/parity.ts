import type { BootcampDayContent, BootcampDialogue } from './types.js';

/**
 * Cross-language BOOTCAMP parity (Phase 7). English is the reference set; a language reaches parity
 * when it registers the SAME mission numbers and each shared mission has a structurally equivalent
 * shape — same step count, same item count, and the same happy-path dialogue length. Structural (not
 * textual) equivalence: the content is translated, but the learning JOURNEY must be identical.
 */
export interface MissionParity {
  day: number;
  enSteps: number;
  frSteps: number;
  enItems: number;
  frItems: number;
  enDialogues: number;
  frDialogues: number;
  ok: boolean;
}

export interface BootcampParityReport {
  lang: string;
  total: number;
  covered: number;
  missing: number[];        // mission numbers English has but the language does not
  mismatched: MissionParity[]; // shared missions whose structure differs
  perMission: MissionParity[];
  complete: boolean;
}

function shape(day: BootcampDayContent): { steps: number; items: number; dialogues: number } {
  return { steps: day.steps.length, items: day.items.length, dialogues: Object.keys(day.dialogues).length };
}

export function missionParity(
  lang: string,
  en: Record<number, BootcampDayContent>,
  other: Record<number, BootcampDayContent>,
): BootcampParityReport {
  const enDays = Object.keys(en).map(Number).sort((a, b) => a - b);
  const missing = enDays.filter((d) => !(d in other));
  const perMission: MissionParity[] = enDays
    .filter((d) => d in other)
    .map((d) => {
      const e = shape(en[d]!);
      const f = shape(other[d]!);
      const ok = e.steps === f.steps && e.items === f.items && e.dialogues === f.dialogues;
      return { day: d, enSteps: e.steps, frSteps: f.steps, enItems: e.items, frItems: f.items, enDialogues: e.dialogues, frDialogues: f.dialogues, ok };
    });
  const mismatched = perMission.filter((m) => !m.ok);
  return {
    lang,
    total: enDays.length,
    covered: enDays.length - missing.length,
    missing,
    mismatched,
    perMission,
    complete: missing.length === 0 && mismatched.length === 0,
  };
}

/** Every dialogue branch must terminate or recover — no dead ends (parity of dialogue integrity). */
export function unreachableOrDeadEnds(d: BootcampDialogue): string[] {
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const problems: string[] = [];
  for (const n of d.nodes) {
    if (n.choices?.length) {
      for (const c of n.choices) if (!byId.has(c.next)) problems.push(`${n.id}: choice → missing node "${c.next}"`);
    } else if (!n.end && (!n.next || !byId.has(n.next))) {
      problems.push(`${n.id}: non-terminal node with no valid next`);
    }
  }
  return problems;
}

/** Fail loudly (Phase 7) — for a language DECLARED complete, any gap must break the build. */
export function assertBootcampParity(report: BootcampParityReport): void {
  if (report.complete) return;
  const errs: string[] = [];
  if (report.missing.length) errs.push(`missions missing in "${report.lang}": ${report.missing.join(', ')}`);
  for (const m of report.mismatched) {
    errs.push(`mission ${m.day} structure differs (steps ${m.enSteps}→${m.frSteps}, items ${m.enItems}→${m.frItems}, dialogues ${m.enDialogues}→${m.frDialogues})`);
  }
  throw new Error(`Bootcamp parity FAILED for "${report.lang}" (${errs.length}):\n - ${errs.join('\n - ')}`);
}
