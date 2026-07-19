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

  it('ships exactly 8 modules ending in a mixed, no-NEW-material readiness checkpoint', () => {
    expect(ZERO_MODULES).toHaveLength(8);
    const last = ZERO_MODULES[7]!;
    expect(last.id).toBe('m8');
    // The checkpoint never INTRODUCES or builds new material — only recognition/recall/dialogue over
    // already-taught chunks — and it exercises more than one activity type.
    expect(last.steps.some((s) => s.kind === 'introduce' || s.kind === 'build')).toBe(false);
    expect(new Set(last.steps.map((s) => s.kind)).size).toBeGreaterThan(1);
  });

  it('every module m1–m7 ends with a badged mastery stretch that introduces nothing new', () => {
    for (let mi = 0; mi < 7; mi++) {
      const m = ZERO_MODULES[mi]!;
      expect(m.masteryStart, `${m.id} masteryStart`).toBeTypeOf('number');
      // Learner material available by the time mastery starts: everything referenced in earlier
      // modules + this module's pre-mastery steps.
      const taught = new Set<string>();
      for (let k = 0; k < mi; k++) for (const s of ZERO_MODULES[k]!.steps) for (const id of stepChunkIds(s)) taught.add(id);
      for (let i = 0; i < m.masteryStart!; i++) for (const id of stepChunkIds(m.steps[i]!)) taught.add(id);
      for (let i = m.masteryStart!; i < m.steps.length; i++) {
        const s = m.steps[i]!;
        expect(s.kind, `${m.id} mastery step ${i}`).not.toBe('introduce');
        // Learner-FACING chunks (exclude an NPC prompt — that is comprehension context) must be taught.
        const learnerIds = s.kind === 'dialogue' ? [s.answer, ...s.distractors] : stepChunkIds(s);
        for (const id of learnerIds) expect(taught.has(id), `${m.id} mastery uses unseen ${id}`).toBe(true);
      }
    }
  });

  it('uses a variety of exercise types across the path (listening, picture, cloze, build, dialogue…)', () => {
    const kinds = new Set(ZERO_MODULES.flatMap((m) => m.steps.map((s) => s.kind)));
    for (const k of ['introduce', 'recognize', 'picture', 'listen', 'cloze', 'build', 'recall', 'dialogue']) {
      expect(kinds.has(k as never), `missing exercise type ${k}`).toBe(true);
    }
  });

  it('most modules are substantially deeper than a click-through (≥ 12 micro-steps)', () => {
    const deep = ZERO_MODULES.filter((m) => m.steps.length >= 12).length;
    expect(deep).toBeGreaterThanOrEqual(5);
  });

  it('every picture step has an emoji on its answer chunk', () => {
    for (const m of ZERO_MODULES) {
      for (const s of m.steps) {
        if (s.kind === 'picture') expect(ZERO_PATH.chunks[s.chunk]!.emoji, `${s.chunk} needs emoji`).toBeTruthy();
      }
    }
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

  it('keeps the {name} placeholder in sync between each target and its gloss', () => {
    for (const ch of Object.values(ZERO_PATH.chunks)) {
      const inAnyTarget = ZERO_LANGS.some((l) => ch.target[l].includes('{name}'));
      const inGloss = `${ch.tr.he ?? ''}${ch.tr.en ?? ''}`.includes('{name}');
      // {name} personalizes both the sentence and its meaning — it must appear in both or neither.
      expect(inAnyTarget, `${ch.id} {name} target/gloss mismatch`).toBe(inGloss);
    }
  });

  it('keeps {targetLangName} out of every target (targets hardcode the real language name)', () => {
    // The language name is baked into each target in its OWN language (so the audio is correct); the
    // placeholder is only for the gloss, resolved to the app-language name at render.
    for (const ch of Object.values(ZERO_PATH.chunks)) {
      for (const l of ZERO_LANGS) expect(ch.target[l].includes('{targetLangName}'), `${ch.id}/${l}`).toBe(false);
    }
  });

  it('fixes the "I speak a little …" gloss: it names the learning language (regression)', async () => {
    const { languageInfo } = await import('../../shared/i18n/languages.js');
    const ch = ZERO_PATH.chunks['speak_little']!;
    expect(ch.tr.he ?? '').toContain('{targetLangName}');
    // French → "צרפתית", Spanish → "ספרדית", English → "אנגלית"
    expect(languageInfo('fr').names.he).toBe('צרפתית');
    const heFilled = (ch.tr.he ?? '').replace('{targetLangName}', languageInfo('fr').names.he);
    expect(heFilled).toBe('אני מדבר/ת קצת צרפתית.');
  });

  it('flags a dangling chunk reference', () => {
    const broken = { chunks: ZERO_PATH.chunks, modules: [{ id: 'x', icon: '', title: { en: 'x', he: 'x' }, outcome: { en: 'x', he: 'x' }, steps: [{ kind: 'introduce', chunk: 'nope' } as const] }] };
    expect(validatePath(broken).some((p) => p.includes('nope'))).toBe(true);
  });
});

describe('Zero-Beginner Path — runtime exercise data is playable in every language', () => {
  // Mirror the renderer's cloze answer: last whitespace token, trailing sentence punctuation stripped.
  const lastWord = (s: string): string => {
    const core = s.replace(/[.?!¿¡]+$/g, '').trimEnd();
    const i = core.lastIndexOf(' ');
    return i >= 0 ? core.slice(i + 1) : core;
  };
  const tgt = (id: string, l: (typeof ZERO_LANGS)[number]): string => ZERO_PATH.chunks[id]!.target[l];

  it('every picture/listen/dialogue step yields distinct options containing the answer (en/fr/es)', () => {
    for (const l of ZERO_LANGS) {
      for (const m of ZERO_MODULES) {
        for (const s of m.steps) {
          if (s.kind === 'picture' || s.kind === 'listen') {
            const opts = [s.chunk, ...s.distractors].map((id) => tgt(id, l));
            expect(new Set(opts).size, `${m.id}/${s.kind}/${l}`).toBe(opts.length);
            expect(opts).toContain(tgt(s.chunk, l));
          }
          if (s.kind === 'dialogue') {
            const opts = [s.answer, ...s.distractors].map((id) => tgt(id, l));
            expect(new Set(opts).size, `${m.id}/dialogue/${l}`).toBe(opts.length);
            expect(opts).toContain(tgt(s.answer, l));
          }
        }
      }
    }
  });

  it('every cloze step has a real blanked word and distinct options with the answer (en/fr/es)', () => {
    for (const l of ZERO_LANGS) {
      for (const m of ZERO_MODULES) {
        for (const s of m.steps) {
          if (s.kind !== 'cloze') continue;
          const answer = lastWord(tgt(s.chunk, l));
          expect(answer.length, `${m.id}/cloze/${l} empty answer`).toBeGreaterThan(0);
          const opts = [answer, ...s.distractors.map((id) => lastWord(tgt(id, l)))].filter((w, i, a) => a.indexOf(w) === i);
          expect(opts.length, `${m.id}/cloze/${l} needs ≥2 options`).toBeGreaterThanOrEqual(2);
          expect(opts).toContain(answer);
        }
      }
    }
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
