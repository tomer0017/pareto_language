import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ZERO_PATH, ZERO_MODULES } from './content.js';
import { ZERO_LANGS, stepId } from './types.js';
import {
  allStepIds, isModuleComplete, moduleDoneCount, pathProgress, resumePosition, stepChunkIds, validatePath,
} from './zeroStartProgress.js';
import { useZeroStartStore } from './zeroStartStore.js';

/** In-memory localStorage so the store's persist/load run under the headless node env. */
function installStorage(): Map<string, string> {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  return store;
}

const loadPack = (lang: string): Set<string> => {
  const raw = readFileSync(fileURLToPath(new URL(`../../../public/content/core-${lang}.v1.json`, import.meta.url)), 'utf8');
  return new Set((JSON.parse(raw).words as { conceptId: string }[]).map((w) => w.conceptId));
};

const allDone = (): Set<string> => new Set(allStepIds(ZERO_MODULES));

describe('Zero-Beginner Path — content schema & parity', () => {
  it('validates with zero problems (references, parity, checkpoint reuse)', () => {
    expect(validatePath(ZERO_PATH)).toEqual([]);
  });

  it('ships exactly 8 modules ending in a readiness checkpoint', () => {
    expect(ZERO_MODULES).toHaveLength(8);
    const last = ZERO_MODULES[7]!;
    expect(last.id).toBe('m8');
    expect(last.steps.every((s) => s.kind === 'dialogue')).toBe(true);
  });

  it('every module has a title, an "I can now…" outcome, and at least one step', () => {
    for (const m of ZERO_MODULES) {
      expect(m.title.he?.trim()).toBeTruthy();
      expect(m.outcome.he?.trim()).toBeTruthy();
      expect(m.steps.length).toBeGreaterThan(0);
    }
  });

  it('has unique step ids across the whole path', () => {
    const ids = allStepIds(ZERO_MODULES);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every chunk realizes in EN/FR/ES with both glosses (language parity)', () => {
    for (const ch of Object.values(ZERO_PATH.chunks)) {
      for (const lang of ZERO_LANGS) expect(ch.target[lang]?.trim(), `${ch.id}/${lang}`).toBeTruthy();
      expect(ch.tr.en?.trim(), `${ch.id}/en`).toBeTruthy();
      expect(ch.tr.he?.trim(), `${ch.id}/he`).toBeTruthy();
    }
  });

  it('every referenced conceptId exists in ALL THREE learning packs (Foundation sync validity)', () => {
    const packs = Object.fromEntries(ZERO_LANGS.map((l) => [l, loadPack(l)]));
    for (const ch of Object.values(ZERO_PATH.chunks)) {
      if (!ch.conceptId) continue;
      for (const lang of ZERO_LANGS) {
        expect(packs[lang]!.has(ch.conceptId), `${ch.id} → ${ch.conceptId} missing in ${lang}`).toBe(true);
      }
    }
  });

  it('the checkpoint reuses ONLY chunks taught earlier (no unseen material)', () => {
    const earlier = new Set<string>();
    for (let m = 0; m < 7; m++) for (const s of ZERO_MODULES[m]!.steps) for (const id of stepChunkIds(s)) earlier.add(id);
    for (const s of ZERO_MODULES[7]!.steps) for (const id of stepChunkIds(s)) expect(earlier.has(id), id).toBe(true);
  });

  it('flags a dangling chunk reference', () => {
    const broken = { chunks: ZERO_PATH.chunks, modules: [{ id: 'x', icon: '', title: { en: 'x', he: 'x' }, outcome: { en: 'x', he: 'x' }, steps: [{ kind: 'introduce', chunk: 'nope' } as const] }] };
    expect(validatePath(broken).some((p) => p.includes('nope'))).toBe(true);
  });
});

describe('Zero-Beginner Path — progress (completed-step based, resumable)', () => {
  it('starts at module 0 / step 0 with 0%', () => {
    const p = pathProgress(ZERO_MODULES, new Set());
    expect(p.pct).toBe(0);
    expect(p.isComplete).toBe(false);
    expect(p.resume).toEqual({ moduleIndex: 0, stepIndex: 0 });
  });

  it('resumes at the FIRST incomplete step, not the last screen visited', () => {
    const m0 = ZERO_MODULES[0]!;
    // complete the first two steps of module 0 only
    const done = new Set([stepId(m0.id, 0), stepId(m0.id, 1)]);
    expect(resumePosition(ZERO_MODULES, done)).toEqual({ moduleIndex: 0, stepIndex: 2 });
    expect(moduleDoneCount(m0, done)).toBe(2);
  });

  it('counts completed modules and reports 100% + complete when all steps are done', () => {
    const p = pathProgress(ZERO_MODULES, allDone());
    expect(p.pct).toBe(100);
    expect(p.isComplete).toBe(true);
    expect(p.completedModules).toBe(8);
    expect(ZERO_MODULES.every((m) => isModuleComplete(m, allDone()))).toBe(true);
  });

  it('a partially-done module is not counted complete', () => {
    const m1 = ZERO_MODULES[1]!;
    const done = new Set([stepId(m1.id, 0)]);
    expect(isModuleComplete(m1, done)).toBe(false);
  });
});

describe('Zero-Beginner Path — persistence store', () => {
  beforeEach(() => {
    installStorage();
    useZeroStartStore.setState({ byLang: {}, name: null });
  });

  it('completes a step idempotently and persists per language', () => {
    const s = useZeroStartStore.getState();
    s.completeStep('fr', 'm1:0');
    s.completeStep('fr', 'm1:0'); // idempotent
    expect(useZeroStartStore.getState().doneSet('fr')).toEqual(new Set(['m1:0']));
    expect(useZeroStartStore.getState().doneSet('en')).toEqual(new Set()); // per-language isolation
    expect(localStorage.getItem('ready.zerostart.v1')).toContain('m1:0');
  });

  it('restart wipes a language’s progress', () => {
    const s = useZeroStartStore.getState();
    s.completeStep('fr', 'm1:0');
    s.restart('fr');
    expect(useZeroStartStore.getState().isDone('fr', 'm1:0')).toBe(false);
  });

  it('marks the path completion date once', () => {
    const s = useZeroStartStore.getState();
    s.markPathComplete('es');
    const first = useZeroStartStore.getState().byLang['es']!.completedAt;
    s.markPathComplete('es');
    expect(useZeroStartStore.getState().byLang['es']!.completedAt).toBe(first);
  });

  it('saves and clears the learner name', () => {
    const s = useZeroStartStore.getState();
    s.setName('  Dana  ');
    expect(useZeroStartStore.getState().name).toBe('Dana');
    s.setName('   ');
    expect(useZeroStartStore.getState().name).toBeNull();
  });
});

describe('Zero-Beginner Path — graduation target (into the real Bootcamp)', () => {
  it('resolves a first non-special Bootcamp mission for every learning language', async () => {
    const { missionsFor } = await import('../bootcamp/bootcampStore.js');
    const { BOOTCAMP_PLAN } = await import('../bootcamp/plan.js');
    for (const lang of ZERO_LANGS) {
      const missions = missionsFor(lang);
      const firstDay = BOOTCAMP_PLAN.filter((m) => m.day in missions && !m.special)[0]?.day;
      expect(firstDay, `no first mission for ${lang}`).toBeTypeOf('number');
    }
  });
});
