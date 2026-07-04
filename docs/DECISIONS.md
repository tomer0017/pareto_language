# Decision Log

Every non-obvious technical decision, with one line of reasoning. Referenced by principle
(P1–P7) from the PDF where relevant.

## M0 — Foundation & Engine

- **D001 — npm workspaces over pnpm.** Zero extra install step for the reviewer; Node 20 ships
  npm 10 with stable workspace support. Fewer moving parts serves P5 (ship, don't ceremony).
- **D002 — TS path aliases resolve to package `src`, not built `dist`.** Vitest and Vite resolve
  cross-package imports from source, so the engine can be tested with zero build step. `dist` is
  still emitted for consumers that need declarations.
- **D003 — `strict` + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`.** Maximum type safety;
  the engine is the product (per PDF final word), so its types must be airtight. No `any` outside
  third-party boundaries (quality bar).
- **D004 — ESLint 9 flat config with `typescript-eslint`.** Current standard; `no-explicit-any` is
  an error to enforce the quality bar.
- **D005 — Memory model is FSRS-inspired but hand-rolled, not the `ts-fsrs` npm package.** The PDF
  wants a deadline-aware *wrapper* around a two-component (stability/retrievability) model. Rolling
  a small, fully-owned model keeps the package dependency-free (Decision 1: pure, isomorphic) and
  lets us tune evidence weighting per PDF §8.2 exactly. `R(t) = exp(-t/S)` is used verbatim.
- **D006 — Knowledge ladder level is derived from evidence history, not stored independently.**
  Level (L0–L4) is computed from stability, successful-recall count, spacing gaps and simulator
  completion so it can never drift from the event log (P3: honest knowledge). MemoryState caches it.
- **D007 — Scheduler is greedy (`value × R-gain / seconds-cost`) per PDF §8.3.** Simple enough for
  MVP, principled enough to be right. No LP solver; the objective is evaluated per-item per-tick.

## M1 — Content

- **D008 — Content authored in YAML, built to versioned JSON.** Reviewable in Git (PDF §11.3);
  the build step validates against zod and emits `it-IT.v0.1.0.json`.
- **D009 — TTS via a `TtsProvider` interface with a Web Speech API fallback.** No cloud key needed
  to use the app today; audio asset paths resolve through the interface so real recordings swap in
  later without client changes (PDF §7.4, §11.3).

## M2 — App

- **D010 — DataProvider composition: ApiProvider *wraps* LocalProvider.** Local-first writes always
  hit IndexedDB first (PDF §11.4); the API layer syncs the append-only event queue in the
  background. LocalProvider is permanent production code, not scaffolding (PDF §11.2 note).

## M3 — Backend

- **D011 — Memory state is a rebuildable projection; `reviewEvents` is the source of truth.** Same
  `packages/engine` code projects state on client and server (Decision 1), so re-computation after
  an algorithm change needs no migration (PDF §11.4).
