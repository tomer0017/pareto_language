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
| `missionFoundationWords` + store `session` | The mission "Learn now" **guided session** (Word X of N, progress, Prev/Next/Back to Mission) over exactly the mission's Foundation words. |
| `FoundationOnboarding.tsx` / `TapCoachmark.tsx` / `foundationCoach.ts` | One-time discovery: first-arrival intro dialog (+ FAB pulse) and the first tappable-word tooltip, each shown once and persisted. |

Reusable primitives: `shared/ui/Sheet.tsx` (bottom sheet) and `shared/ui/SpeakerButton.tsx` (one
tap-to-hear button). There is exactly ONE word sheet and ONE tap entry point app-wide — dialogue,
flashcards, Core Words/Phrases and mission drills all reuse them. Words come from
`loadCoreWords(learningLang)`, so English + French (and any future pack) work through one code path.

## Zero-Beginner Path — "מתחילים מאפס" (apps/web/src/features/zerostart)

A guided, cumulative Pre-A1 bridge for a learner who knows zero words — a fixed sequence OVER the
same survival concepts, never a parallel engine. Data-driven and split into layers:

| File | Role |
| --- | --- |
| `types.ts` | `ZeroChunk` (per-language `target` + one he/en `tr` + optional Foundation `conceptId`), the `ZeroStep` union (introduce / recognize / picture / listen / cloze / build / recall / dialogue), `ZeroModule` (+ `masteryStart`), `ZeroPath`. |
| `content.ts` (data) | The ONE authored source: a shared chunk library + 8 modules (First contact → Readiness checkpoint), natural EN/FR/ES phrasing. `{name}` is substituted at render time (no PII in static data). |
| `zeroStartProgress.ts` (pure, tested) | Completed-step progress, `resumePosition` (first incomplete step), and `validatePath` (references, EN/FR/ES + he/en parity, checkpoint-reuse rule). |
| `zeroStartStore.ts` | Per-language persisted progress (`ready.zerostart.v1`) + saved learner name; "current step" is derived, never stored. |
| `ZeroStart.tsx` | The renderer (hub → lesson steps → module outcome → graduation). Audio via the shared `tts` engine; learning a chunk calls `foundationStore.markViewed(conceptId)` (idempotent progress sync). Graduates into the first real Bootcamp mission (never auto-completes it). |

Routed as the `zerostart` view (not a pilot tab, so the bottom nav auto-hides during lessons). Home
shows the entry card + a first-use recommendation for a new learner in a supported language.

## Parrot Mode — Universal Listen (apps/web/src/shared/playback)

ONE content-agnostic listening system every learning surface reuses. A screen supplies a list of
`PlaybackItem` (`target` + `targetLang`, optional `translation` + `translationLang`); the engine owns
all playback. Nothing here imports Bootcamp/Core — a new surface reuses it with zero changes.

| Module | Responsibility |
| --- | --- |
| `types.ts` | The public contract: `PlaybackItem`, `PlaybackSettings` (repeat ×1–3 / order / translation), the per-surface `SpeakOrderOverride`, `PlaybackStatus`. |
| `playbackPlan.ts` (pure, tested) | The two testable decisions: `buildUtterancePlan(item, settings, order?)` → flat speak/pause steps (target→translation, or translation→target when a surface passes `order.translationFirst`, × repeat — each line in its own locale) and `buildOrder(count, order, seed)` → play order (sequential or a seeded shuffle, reusing `shuffle.ts`). Pause durations are exported constants — the tuning seam. |
| `useParrotPlayback.ts` | The engine hook: status, current item, the async play loop, wake lock, resume-from-exact-item, persisted settings. Run-token cancellation (same contract as the Transcript reader — a superseded/cancelled `speak()` never advances). Settings read via refs so changes apply at the next item boundary. |
| `wakeLock.ts` | Guarded Screen Wake Lock wrapper (module-level sentinel; re-acquired on visibility while playing; silent no-op where unsupported). |
| `sleepTimer.ts` (pure, tested) | Framework-free countdown controller (`arm/resume/pauseTicking/reset/off/dispose`) that counts only active playback time; the engine drives it so pause/resume preserve the remainder and expiry stops playback + releases the lock. |
| `preferences.ts` (pure, tested) | Persistence via the existing localStorage convention: `sanitizeSettings` (validate/fallback), load/persist, and per-surface listening bookmarks (`resolveBookmarkIndex` matches by stable content id, never array position). "Currently playing" is never stored. |
| `PlaybackControls.tsx` | The single controls component — Play/Pause, Repeat, Sequential/Random, Translation, prev/next — a pure view over the engine handle. |
| `ListenPanel.tsx` | Reusable "now playing" single-item screen (Core Words + Core Sentences share it). The Dialogue Transcript uses the engine directly for its full-list + highlight presentation. |

Consumers: **Core Words** (`CoreWords.tsx` `listen` mode) and **Core Sentences** (`Core.tsx` phrases
`listen` view) mount `ListenPanel`; the **Dialogue Transcript** (`DialogueReader` in `Bootcamp.tsx`)
drives its existing scroll/highlight sheet from the same hook + `PlaybackControls`. Future knobs
(speed, loop-forever, pause length, voice, bookmark) land in `playbackPlan.ts` / `PlaybackControls`
once and appear everywhere — no playback logic is duplicated.

Sprint-3 capabilities — continuous **Loop** (`planNextCycle`, anti-boundary-repeat), a **sleep
timer**, **speed** (0.5/0.75/1/1.25×), **pause durations** (`PAUSE_PRESETS`), persisted **preferences**
and per-surface **listening bookmarks** — are all engine-level, so every current and future
surface gets them for free. Voice selection / background playback / lock-screen controls remain
out of scope (browser TTS + Wake Lock cannot guarantee them once the OS suspends the page).

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
