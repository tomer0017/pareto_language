import { ZERO_LANGS, stepId, type ZeroModule, type ZeroPath, type ZeroStep } from './types.js';

/**
 * Zero-Beginner Path — PURE progress + validation (no React, no storage). Given the authored modules
 * and the set of completed step ids, it reports honest progress (a step counts only once its required
 * interaction is done — the store never marks a step on "screen visited") and resolves the resume
 * position. `validatePath` guards the content invariants the tests assert (parity, references, no
 * unseen checkpoint material).
 */

/** The chunk ids a single step references (its own chunk + any option/answer chunks). */
export function stepChunkIds(step: ZeroStep): string[] {
  switch (step.kind) {
    case 'introduce':
    case 'build':
    case 'recall':
      return [step.chunk];
    case 'recognize':
      return [step.chunk, ...step.distractors];
    case 'dialogue':
      return [step.npc, step.answer, ...step.distractors];
  }
}

/** Every step id in the whole path, in order. */
export function allStepIds(modules: ZeroModule[]): string[] {
  return modules.flatMap((m) => m.steps.map((_, i) => stepId(m.id, i)));
}

/** Is every step in this module complete? */
export function isModuleComplete(module: ZeroModule, done: ReadonlySet<string>): boolean {
  return module.steps.every((_, i) => done.has(stepId(module.id, i)));
}

export interface ResumePosition {
  /** Index of the module to resume in (clamped to the last when the path is complete). */
  moduleIndex: number;
  /** Index of the first incomplete step in that module (0 when the module is complete). */
  stepIndex: number;
}

/** First incomplete step across the path; when everything is done, the very last step. */
export function resumePosition(modules: ZeroModule[], done: ReadonlySet<string>): ResumePosition {
  for (let m = 0; m < modules.length; m++) {
    const steps = modules[m]!.steps;
    for (let s = 0; s < steps.length; s++) {
      if (!done.has(stepId(modules[m]!.id, s))) return { moduleIndex: m, stepIndex: s };
    }
  }
  const last = Math.max(0, modules.length - 1);
  return { moduleIndex: last, stepIndex: 0 };
}

export interface PathProgress {
  totalModules: number;
  completedModules: number;
  totalSteps: number;
  doneSteps: number;
  /** Overall completion percentage from COMPLETED STEPS (never from screens visited). */
  pct: number;
  isComplete: boolean;
  resume: ResumePosition;
}

export function pathProgress(modules: ZeroModule[], done: ReadonlySet<string>): PathProgress {
  const totalSteps = modules.reduce((n, m) => n + m.steps.length, 0);
  const ids = new Set(allStepIds(modules));
  let doneSteps = 0;
  for (const id of done) if (ids.has(id)) doneSteps++;
  const completedModules = modules.filter((m) => isModuleComplete(m, done)).length;
  return {
    totalModules: modules.length,
    completedModules,
    totalSteps,
    doneSteps,
    pct: totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100),
    isComplete: modules.length > 0 && modules.every((m) => isModuleComplete(m, done)),
    resume: resumePosition(modules, done),
  };
}

/** Per-module completed-step count (for the "step 3 of 8" style module rows). */
export function moduleDoneCount(module: ZeroModule, done: ReadonlySet<string>): number {
  return module.steps.reduce((n, _, i) => n + (done.has(stepId(module.id, i)) ? 1 : 0), 0);
}

/**
 * Content invariants — returns a list of problems (empty = valid). Covers: duplicate module ids,
 * empty modules, dangling chunk references, malformed interactions, EN/FR/ES + he/en parity for
 * every referenced chunk, and the checkpoint rule (the last module may only reuse chunks that appear
 * earlier — never surprise the learner with unseen material).
 */
export function validatePath(path: ZeroPath): string[] {
  const problems: string[] = [];
  const { chunks, modules } = path;
  const seenModuleIds = new Set<string>();

  const requireChunk = (id: string, where: string): void => {
    if (!chunks[id]) problems.push(`${where}: unknown chunk "${id}"`);
  };

  for (const m of modules) {
    if (seenModuleIds.has(m.id)) problems.push(`duplicate module id "${m.id}"`);
    seenModuleIds.add(m.id);
    if (m.steps.length === 0) problems.push(`module "${m.id}" has no steps`);
    m.steps.forEach((step, i) => {
      const where = `${m.id} step ${i} (${step.kind})`;
      for (const id of stepChunkIds(step)) requireChunk(id, where);
      if (step.kind === 'recognize') {
        if (step.distractors.includes(step.chunk)) problems.push(`${where}: distractor equals the answer`);
        if (step.distractors.length === 0) problems.push(`${where}: needs at least one distractor`);
      }
      if (step.kind === 'dialogue') {
        if (step.distractors.includes(step.answer)) problems.push(`${where}: distractor equals the answer`);
        if (step.distractors.length === 0) problems.push(`${where}: needs at least one distractor`);
      }
    });
  }

  // Parity: every referenced chunk must realize in every learning language + carry both glosses.
  const referenced = new Set<string>();
  for (const m of modules) for (const step of m.steps) for (const id of stepChunkIds(step)) referenced.add(id);
  for (const id of referenced) {
    const ch = chunks[id];
    if (!ch) continue; // already reported
    for (const lang of ZERO_LANGS) {
      if (!ch.target[lang]?.trim()) problems.push(`chunk "${id}": missing ${lang} target`);
    }
    if (!ch.tr.en?.trim()) problems.push(`chunk "${id}": missing en gloss`);
    if (!ch.tr.he?.trim()) problems.push(`chunk "${id}": missing he gloss`);
  }

  // Checkpoint rule: the final module may only use chunks that appeared in an earlier module.
  if (modules.length > 1) {
    const last = modules[modules.length - 1]!;
    const earlier = new Set<string>();
    for (let m = 0; m < modules.length - 1; m++) {
      for (const step of modules[m]!.steps) for (const id of stepChunkIds(step)) earlier.add(id);
    }
    for (const step of last.steps) {
      for (const id of stepChunkIds(step)) {
        if (!earlier.has(id)) problems.push(`checkpoint "${last.id}": chunk "${id}" was never taught earlier`);
      }
    }
  }

  return problems;
}
