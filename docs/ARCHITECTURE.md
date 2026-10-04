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

## Product IA & responsive shell

- **Destinations** — `app/nav.ts` is the single navigation model: `PRIMARY_TABS` = Home · Path
  (`bootcamp` view; labelled "מסלול" / "Path") · Listen · Profile; `navTabOf(view)` maps every secondary screen to the
  destination that stays highlighted (readiness/review → Home, core/zerostart → Learn,
  reading/videos → Listen, languages → Profile); `shouldShowNav` decides the phone/tablet bottom
  bar (hidden in focused flows); `hasAppShell` decides whether the shell + desktop rail exist.
  `shared/ui/AppNav` renders it once — CSS alone turns the bar into a rail at ≥ 1100px.
- **Layout tokens (`app/styles.css`)** — `--page-max` (browse pages, `.screen.screen-wide`),
  `--focus-max` (focused flows, plain `.screen`; also the width of the fixed `.action-zone`,
  readers and transports), `--rail-w` and `--gutter`, each stepped at 768px and 1100px.
  `.app-shell.has-rail` reserves the rail and exposes `--shell-start` so fixed bars centre over the
  content. Logical properties throughout (RTL/LTR mirror without per-direction rules).
- **Shared primitives (`shared/ui`)** — `Icon` (inline SVG set; `flip` = direction-aware),
  `AppNav`, `PageHeader` + `BackButton`, `ProgressRing`, plus CSS building blocks (`.icon-tile`,
  `.link-row`, `.tabs`, `.stat-row`, `.mcard`, `.jstep`). Arrows are icons owned by components —
  never glyphs inside translated strings.
- **Travel Readiness** — `features/bootcamp/readiness.ts` (pure) → `useTravelReadiness()`; every
  screen that shows progress reads it, so the numbers always agree. Denominator = `BOOTCAMP_PLAN.length`.
- **Mission journey** — `features/bootcamp/missionFlow.ts` (pure): `missionPhases` splits the
  unchanged step list into Learn / Practice; `bootcampStore.enterPractice(at?)` enters the flow at a
  chosen step and makes it the resume point. No pedagogy-engine change.
- **Listen** — `features/listen/`: `playlists.ts` (pure; sentences via `core/phraseGroups.ts`,
  dialogues via `transcript.ts`, stories via `reading/readingCore.ts`), `listenMode.ts` (modes →
  the engine's speak-order override), `Listen.tsx` (queue + now playing + the story card). Playback
  is the shared `useParrotPlayback` in the `listen` scope. Quick Listen = the engine's sleep timer
  (10 min), cleared when it ends or the screen is left.
- **Sentence catalog** — `features/core/phraseGroups.ts` `sentenceCatalog(lang)` is the one source
  for the sentence library, the flashcard deck, Listen and every "N core sentences" count. One id
  never means two sentences (`sentenceIdConflicts` must be empty — tested); one wording is one
  canonical sentence, and later ids that re-declare the same wording are ALIASES, so a drill logged
  under any of them counts once (`canonicalSentenceId`). Counts today: EN 319 · FR 318 · ES 316.
- **Developer diagnostics** — `shared/ui/devOverlay.ts`: rendered only when the build is a dev
  build AND `?debug=1` was requested (remembered until `?debug=0`). Never in production.
- **Quick Review** — `features/core/review.ts` (pure) picks sentences from the real review-event
  log (`provider.getReviewEvents`); `QuickReview.tsx` reuses `SentenceFlashcards` with that subset.

## Bootcamp curriculum: identity, order, persistence

- **One source of truth** — `features/bootcamp/plan.ts` `BOOTCAMP_PLAN` (30 entries — the Core 30). Its length is the
  mission count and its array order is the journey; UI progress (`Home`, the map header, Victory) and
  tests read it — no other constant holds "30".
- **Three separate concepts per mission:** `id` (stable semantic slug, e.g. `introduce-myself` — what
  persisted progress is keyed by), display number (`missionNumber(day)` = 1-based plan position), and
  `day` (the numeric content-registry key shared by `DAYS` / `DAYS_FR` / `DAYS_ES` and the in-memory
  store handle). `nextMission()` walks plan order, never `day` arithmetic. Since the Core 30
  restructure `day` and number genuinely differ (Taxi: `day` 6, Mission 7; Everyday Core: `day` 30,
  Mission 4) — nothing may order or number missions by `day`.
- **Authoring** — `author.ts` (pure): a `MissionSpec` holds every line as `[en, fr, es, he]`;
  `buildMission(spec, lang)` emits the ordinary `BootcampDayContent` (items, dialogue tree with
  conversation-help branches, the standard step sequence). `core/index.ts` lists the spec missions
  and `specMissions(lang)` feeds each language's registry — a spec mission cannot exist in one
  language only. Checkpoint specs reuse earlier sentences by id (`fromItems` / `itemOf`), never retype them.
- **Outside the Core** — `plan.ts` `EXTENDED_POOL` (kept for a 31+ track) and `MERGED_MISSIONS`
  (merged into another mission); their content lives in `extended.ts`, is tested, and never reaches
  the journey, Listen, the sentence library or Videos.
- **Active-practice steps (Practice V1)** — four generic step kinds beside the original ones:
  `quickReply`, `visualMatch`, `swap`, `miniMap`. Content is data (`types.ts`); what a round shows and
  whether a step is well-formed is pure (`practiceEngines.ts`, `validatePracticeStep`); the screens are
  `PracticeSteps.tsx`. Multilingual authoring goes through `author.ts` (`buildPractice`), used both by
  spec missions and by `practiceV1.ts`, which holds the step lists of the hand-written Missions 01, 02,
  03 and 05 once for all languages. `ambush.mode` (`recovery` / `speed`) states what a final challenge
  tests. `PrimeWord.key` lets tests compare word-intro content across languages by concept.
  Practice V1.1 added `matchPairs` and `sentenceBuilder` the same way (pure rules `matchTap`,
  `matchRecord`, `builderPool`, `builderSolved`, `builderHint`); builder chunks are authored per
  language and validated to spell the taught sentence exactly.
- **Companion inside a mission** — `companionCoach.ts` (`coachFor(steps, index, missionId)`) decides,
  purely, whether a step gets one app-language line (the mission goal on its intro card; how to play
  the first game of each kind). `Bootcamp.tsx` renders it with `CompanionCoach`; answer cards take a
  reaction through `AnswerFeedback`'s `aside` slot. None of it writes to any store.
- **Shared practice flows** — `practiceV1.ts` (Missions 01, 02, 03, 05) and `practiceArrival.ts`
  (Missions 06–09) define the step lists of hand-written missions once for all languages. Checkpoint
  scenes may be `cold` (no gloss before answering) and may offer `wrong` lines: a miss routes to its
  own slow re-ask beat and back to the same choice. A Quick Reply step may be a speed `challenge`; a
  Match Pairs answer tile may be a language-neutral `answerLabel`.
  `practiceMastery.ts` holds Mission 26. A scene may also be `audio` (dialogue `audioOnly`, always
  with `cold`): the other speaker's line is not written before the answer — `NpcSpeech` in
  `ConvoScene.tsx` renders a replay button in its place (Mission 28 only). A line may carry a `cue` — a scene
  transition in the app language, shown above the bubble and never spoken. Missions 28–30 are specs
  in `core/checkpoints.ts` with no teaching steps. `canonicalSentenceId` also resolves legacy ids the
  Core no longer declares (`LEGACY_ALIASES` in `core/phraseGroups.ts`), so stored practice keeps counting.
- **Practice presentation** — each engine renders on an open `.pcanvas[data-engine]`, not a shared
  card. `ConvoScene.tsx` is the conversation shell (`NpcLine`, `YouLine`, `AudioBubble`, `useNpc`)
  used by dialogues and Quick Reply; `npcCast.ts` maps a mission id to who is speaking (a glyph today,
  `art` when illustrations exist). Game sounds live in `shared/audio/sfx.ts` behind one on/off switch.
- **No-spoiler rule** — companion surfaces never show a stage name, count, threshold or unreached
  form; see `COMPANION_SYSTEM.md`. Stage data stays in `companionModel.ts` and is not rendered.
- **Turn parity gate** — `core30.test.ts` compares every Core dialogue tree across EN / FR / ES node
  by node, and proves `docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md` equals `renderDialogueDoc()`.
- **Persistence** — `progress.ts` (pure): in memory the store keeps `completedDays` / `receipts` /
  `stepIndex` by `day`; on disk (`ready.bootcamp.v2.<lang>`) the same data is keyed by mission `id`.
  `migrateV1` converts the old `ready.bootcamp.v1[.<lang>]` day-number data once (old 2 → Introduce
  Myself … old 30 → the finale; old day 1, the retired Recovery Toolkit, is dropped). v1 keys are
  left untouched on disk. The Core 30 restructure needed **no** migration: every surviving mission
  kept its id. Extended Pool ids still round-trip (kept on disk, not counted as readiness); ids of
  merged-away missions are ignored on read.
- **Videos** — `introVideo.src` is an explicit asset path on the mission (`/videos/En_day1.mp4`),
  never computed from the mission number. A test asserts every referenced file exists in `public/`.
- **Recovery phrases** — there is no recovery mission. `recovery.ts` / `fr/recovery.ts` /
  `es/recovery.ts` hold the shared 8 tools (six help tools + two courtesies) that other missions bundle into their item lists and
  dialogue choices. The dialogue player's opt-in `coaching` mode is dormant (no mission sets it).

## Vocabulary priming & sentence flashcards

- `{ kind: 'prime' }` — a mission step ("Before we speak") of 3–8 building-block words shown before a
  longer sentence, optionally assembling a canonical mission item (`buildFromItemId`). Renderer:
  `PrimeStep` in `Bootcamp.tsx`. Opt-in, language-agnostic. `PrimeWord.review` + `primeVocab.ts`
  (`priorPrimeVocabulary`) track prior knowledge so a reused word shows a ♻️ review hint instead of
  being re-taught. Every mission's decision is recorded in `vocabAudit.ts` (`MISSION_VOCAB_AUDIT`,
  all 30) and bound to the actual steps by tests. Currently primed: registry keys 1–7 + 30 (Everyday Core), all languages in parity.
- `fr/frenchNumbers.ts` — the tested source of truth for spoken `fr-FR` numbers (0–9999) incl. the
  vigesimal 70/80/90 rules; feeds the French-numbers priming step in Mission 2.
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

## Audio preference ownership

RULE: a playback option must never affect a screen where the learner cannot see or change it, unless
it is explicitly global.

| Owner | What | Stored in |
| --- | --- | --- |
| **Global** | speech rate — the ONLY speed; applied by `tts.speak()` to every utterance | `ready.speechRate` (Profile) |
| **Listen** | repeats, continuous play, shuffle, quick-listen timer; listening mode | `ready.playback.listen`, `ready.listen.mode` |
| **Story** | reading mode, voice order (target / target→translation / translation→target) | `ready.reading.v1` |
| **Transcript** | its controls panel (repeats, translation, order, loop, pause, sleep timer) | `ready.playback.transcript` |
| **Word listening** | the same panel | `ready.playback.words` |

How it is enforced: `useParrotPlayback(items, { scope })` loads/persists settings per
`PlaybackScope`; `preferences.ts` `SCOPE_OWNS` lists the options each surface exposes, and
`scopedSettings` forces every other option to its default (the `story` scope owns none, so a story
is always one pass, once per sentence). The engine has NO speed: a speak step carries text + locale
only (`runUtterancePlan`), and the old shared record `ready.parrot.settings` is no longer read.
Locked by `shared/playback/ownership.test.ts`.

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
(loop-forever, pause length, voice, bookmark) land in `playbackPlan.ts` / `PlaybackControls`
once and appear everywhere — no playback logic is duplicated.

Sprint-3 capabilities — continuous **Loop** (`planNextCycle`, anti-boundary-repeat), a **sleep
timer**, **pause durations** (`PAUSE_PRESETS`), persisted **preferences**
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
