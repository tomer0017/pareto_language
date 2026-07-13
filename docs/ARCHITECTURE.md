# Architecture

READY is an npm-workspaces monorepo. The design follows the PDF §11: a pure isomorphic engine,
content separated from user state, and a `DataProvider` interface the UI depends on.

```
packages/content-schema/  zod schemas — the single source of truth for all data shapes
packages/engine/          pure TS: memory model, scheduler, planner, readiness (ZERO I/O deps)
packages/data/            DataProvider interface + Mock / Local(IndexedDB) / Api implementations
apps/web/                 React 18 + Vite PWA (feature-sliced)
server/                   Express + Mongoose API (user state only)
content/                  YAML sources + build/validate pipeline → versioned JSON packs
docs/                     this folder
```

## Key decisions (see DECISIONS.md for the full log)

1. **The engine is pure and isomorphic** (PDF §11.2 D1). It has no import from React, Express, or
   any storage. The same code projects memory state on the client (offline) and the server
   (analytics / restore), and is validated by simulated-learner tests before any UI exists.

2. **Content ≠ user state** (PDF §11.2 D2). Content is static, versioned JSON built by a pipeline
   and served statically (precached offline). User state lives in IndexedDB (offline) and MongoDB.

3. **`ReviewEvent` is the append-only source of truth** (PDF §11.4). `MemoryState`,
   `ReadinessSnapshot`, etc. are deterministic projections rebuildable by `packages/engine`. Sync
   is "replay events in timestamp order"; idempotent by client-generated UUID.

4. **`DataProvider` interface from day one** (PDF §11.2 D3): `MockProvider` → `LocalProvider`
   (IndexedDB, the permanent offline layer) → `ApiProvider` (wraps Local, background sync).

## Build & module strategy

- TypeScript **project references** (`tsc -b`) build packages in dependency order and typecheck
  cross-package via emitted declarations.
- Cross-package imports at **test/app** time resolve to source via Vite/Vitest aliases (no build
  step needed to run tests). At runtime, the server consumes built `dist` via workspace symlinks.
- The engine is the product; it targets ≥85% coverage (currently ~98% statements).

## The learning engine (packages/engine)

| Module | Responsibility | PDF |
| --- | --- | --- |
| `params.ts` | Tunable FSRS-inspired constants + evidence weights | §8.2, §16 R2 |
| `memory.ts` | Stability/retrievability/difficulty model, `R(t)=exp(-t/S)`, event projection | §8.2, §11.4 |
| `modemixer.ts` | Which drill trains an item given its ladder level | §9.1 |
| `scheduler.ts` | Deadline-aware greedy: `value × R-gain / seconds-cost` toward `R(T_departure)` | §8.3 |
| `planner.ts` | Tier selection, situation ordering, new-item taper, graceful re-plan | §8.1 |
| `readiness.ts` | Honest badges: notStarted / inProgress / ready / fading | §10.4 |

## Randomization (apps/web/src/shared/util/shuffle.ts)

One tested utility for all controlled randomness — uniform Fisher–Yates with an injectable RNG
(`shuffle`, `seededShuffle`, `sample`, `pickOne`, `mulberry32`, `sessionSeed`). Replaces the biased
`.sort(() => Math.random() - 0.5)` idiom app-wide (quiz/replies/ambush options, Picture Quiz rounds,
Listen & NumberSprint distractors, session builder, Videos). Seeds make it deterministic in tests and
stable across re-renders. **Narrative dialogue order is never shuffled** — only options / review order.

## Vocabulary priming & sentence flashcards

- `{ kind: 'prime' }` — a mission step ("Before we speak") of 3–8 building-block words shown before a
  longer sentence, optionally assembling a canonical mission item (`buildFromItemId`). Renderer:
  `PrimeStep` in `Bootcamp.tsx`. Opt-in, language-agnostic. `PrimeWord.review` + `primeVocab.ts`
  (`priorPrimeVocabulary`) track prior knowledge so a reused word shows a ♻️ review hint instead of
  being re-taught. Every mission's decision is recorded in `vocabAudit.ts` (`MISSION_VOCAB_AUDIT`,
  all 30) and bound to the actual steps by tests. Currently primed: Missions 1–8 (FR 1–4 in parity).
- `fr/frenchNumbers.ts` — the tested source of truth for spoken `fr-FR` numbers (0–9999) incl. the
  vigesimal 70/80/90 rules; feeds the French-numbers priming step in Mission 3.
- `core/flashcards.ts` (pure) + `SentenceFlashcards.tsx` — flip-card review over the canonical mission
  sentences (`buildSentenceDeck` reuses item ids; no duplication), shuffled per session, both review
  directions. See **[VOCABULARY-AUDIT.md](./VOCABULARY-AUDIT.md)**.

## Foundation (apps/web/src/features/foundation)

The 🛟 "building blocks" surface — a **data-driven VIEW over the Core Corpus**, never new content.

| Module | Responsibility |
| --- | --- |
| `taxonomy.ts` | The ONLY place categories are declared — `FoundationCategory[]` as DATA. Each is a *selector* over the language-independent corpus fields (`category` / `pos` / `conceptId`), so adding a language is zero code and adding a category is one entry. |
| `foundationContent.ts` (pure, tested) | `buildFoundation(words, missions, appLang, learningLang)` → categories → words; `frequencyStars` (tier/rank → 1–5); `relatedMissions` (whole-word scan of real `missionsFor(lang)` text). Reuses `resolveLearningItem` (the any-to-any display model). |
| `FoundationFab.tsx` / `FoundationSheet.tsx` / `foundationStore.ts` | The FAB (shell-mounted, gated by `shouldShowFoundationFab`), one component rendering every level (categories → word list → word page) from the model, and the shared store (open/close + Universal-Tap `openWord` + persisted `viewed`/`dismissed`). |
| `corpusIndex.ts` (pure) + `TappableText.tsx` | **Universal Tap**: `buildCorpusIndex` + `segmentText` (whole-word, greedy longest-match, lossless) mark every Core word in a sentence; `TappableText` / `TappableWord` render them tappable and open the shared sheet via `openWord`. `useCoreWords(lang)` loads the pack + index once per language. |
| `FoundationHint.tsx` | **Smart Detection**: the non-blocking "Missing Foundation Brick" nudge for the first unviewed building block in the current mission text (Learn now / Dismiss). |
| `foundationProgress.ts` (pure, tested) | Per-category + overall completion from the viewed set — motivational only, never gates. |

Reusable primitives: `shared/ui/Sheet.tsx` (bottom sheet) and `shared/ui/SpeakerButton.tsx` (one
tap-to-hear button). There is exactly ONE word sheet and ONE tap entry point app-wide — dialogue,
flashcards, Core Words/Phrases and mission drills all reuse them. Words come from
`loadCoreWords(learningLang)`, so English + French (and any future pack) work through one code path.

## Audio / TTS (apps/web/src/shared/audio)

Runtime, free, cross-device speech via the Web Speech API — no cloud, no keys, no server, offline-capable.

| Module | Responsibility |
| --- | --- |
| `tts.ts` | Central `speak(text, lang, rate) → Promise<SpeakResult>`; Chrome unlock + keep-alive + visibility-resume; global speech rate; diagnostics; asset-first `playItem`. |
| `voiceResolver.ts` | Pure, scored voice selection with explicit **match quality** (`exact-locale` ≫ `approved-fallback` ≫ `same-language-different-region`; wrong language disqualified). Regional accents are NOT equivalent (en-US ≠ en-GB); a different region is degraded, never a native match. + `prepareTextForSpeech`. |
| `voiceProfiles.ts` | Per-language speech profile derived from the registry locale (`languageTtsTag`) + fallbacks / preferred names / test phrase. |

The **learning language** (not the UI/OS language) selects the voice. `SpeakResult`
(`ended|interrupted|error|unavailable`) lets chained actions (dialogue advance, Play-All) proceed only
on a natural finish. Full research, resolver rules, fallback ladder and honest limits:
**[TTS_RESEARCH.md](./TTS_RESEARCH.md)**.
