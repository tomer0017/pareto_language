# STATUS — READY build report

## 📚 Start here — required reading for every sprint

Before touching this codebase, read the living docs **in this order**:

1. **[READY_MASTER_OVERVIEW.md](./READY_MASTER_OVERVIEW.md)** — the single source of truth for
   understanding READY: what it is, why it exists, how it's built, the rules, and current status.
2. **[READY_PROJECT_STRUCTURE.md](./READY_PROJECT_STRUCTURE.md)** — product rules + app/architecture detail.
3. **[BOOTCAMP_CONVERSATIONS.md](./BOOTCAMP_CONVERSATIONS.md)** — every Bootcamp mission's content
   (phrases, expected replies, recovery tools, cold opens, dialogues), for content review. Read
   this before touching any Bootcamp content.

**Before development:** read (1); if touching Bootcamp content, also read (2).
**After development:** update (1) if architecture/product rules/navigation/data-model/learning
philosophy/pipeline/language support/Bootcamp behavior changed; regenerate (2) with
`npm run gen:conversations` if Bootcamp content changed.


Date: 2026-07-04 · All four milestones (M0–M4) complete and committed. Full verification
loop (typecheck → lint → tests → build → smoke) green at every milestone.

## What's done

### Sprint — Universal Listen Mode ("Parrot Mode") (2026-07-17)
One shared, content-agnostic listening architecture (no engine/schema/pipeline/pedagogy/Mongo
changes; no Bootcamp mission content changed — `gen:conversations` produces zero diff). EN/FR parity
preserved; offline preserved (uses the existing Web Speech TTS, no network). Full gate loop
(typecheck → lint → 715 tests → build → smoke) green.
- **New shared module `apps/web/src/shared/playback/`** — ONE playback engine + ONE controls
  component, reused everywhere. A surface provides only a list of `PlaybackItem { target, targetLang,
  translation?, translationLang? }`; the engine owns all behaviour.
  - `playbackPlan.ts` (pure, unit-tested) — `buildUtterancePlan` (target → pause → translation, ×
    repeat) and `buildOrder` (sequential / seeded shuffle). The tuning seam (pause durations exported).
  - `useParrotPlayback.ts` — the React engine: play / pause / resume-from-exact-item, sequential &
    random order, repeat ×1–3, translation on/off, wake lock, persisted settings. Run-token
    cancellation mirrors the Transcript play-all contract (a cancelled line never advances).
  - `wakeLock.ts` — guarded Screen Wake Lock (re-acquired on visibility while playing; no-op where
    unsupported). `PlaybackControls.tsx` — the single controls UI. `ListenPanel.tsx` — the reusable
    single-item "now playing" screen shared by Core Words + Core Sentences.
- **Integrated into three surfaces, zero duplicated playback logic:** Core Words gets a 🎧 **Listen
  Mode** mode; Core Sentences (Core Phrases) gets a 🎧 **Listen Mode** entry — both mount the same
  `ListenPanel`. The **Dialogue Transcript** (`DialogueReader`) was refactored to drive its existing
  scrolling/highlight/auto-scroll study sheet from the same engine + `PlaybackControls` (its bespoke
  play-all loop was deleted — no second player), gaining repeat / random / translation.

### Sprint — UX Improvements (answers · Home translator · Foundation review) (2026-07-17)
UX-only sprint (no engine/schema/pipeline/pedagogy/Mongo changes; no Bootcamp mission content
changed — `gen:conversations` produces zero diff). EN/FR parity preserved; offline preserved.
- **Answer choices no longer show the native translation.** In the "Your turn / choose the correct
  sentence" dialogue step (`DialogueStep` in `Bootcamp.tsx`), each answer card previously rendered
  the target line **and** its native gloss, so the learner could match Hebrew instead of
  understanding. The gloss is removed from every answer option (all languages, coaching + normal
  mode); the **question** (NPC line) keeps its translation and the post-answer feedback still shows
  full context. Other exercise types are unchanged (comprehension quizzes/replies show only the
  meaning by design; the Transcript reader stays bilingual).
- **Home hero replaced by a compact Quick Translator** (`features/home/QuickTranslator.tsx` + pure,
  tested `quickTranslate.ts`). Source is **locked to the UI language**, target **locked to the
  learning language** (no swap): the learner types and instantly gets the phrase they'll say abroad,
  with a 🔊 speaker (reuses `SpeakerButton`) and a 📋 copy. It is a **pure offline dictionary** over
  the vocabulary READY already knows (Core Corpus words + mission sentences) — no network, no API,
  offline intact. Language-agnostic (resolves the gloss in the active UI language, no English
  bridge). Honest empty state when a phrase isn't in the word bank. Compact — no added vertical
  weight vs the old "Your training" hero.
- **Foundation "Learn" is now always available.** The in-mission `FoundationHint` used to disappear
  once every building block was viewed; it now keeps a **Review** action (opens the guided session in
  review mode over the whole mission deck). Reviewing only re-reads word pages — it **never resets**
  Foundation progress (`openSession` doesn't touch `viewed`/`dismissed`). Renders nothing only when a
  mission has no Foundation words at all.
- Gates green: typecheck · lint · **706 tests** (+6 `quickTranslate`) · build (17 precache) · smoke.

### Sprint — More mission videos wired (2026-07-13)
- Added **5 full-conversation videos** to `apps/web/public/videos` and mapped each to its mission via
  the mission's optional `introVideo` (public path resolved against `BASE_URL`): **EN** `En_day7`→
  day7 (Taxi/Uber), `En_day8`→day8 (Hotel Check-in), `En_day9`→day9 (Shopping), `En_day11`→day11
  (Airport & Border); **FR** `Fr_day4`→fr/day4 (Coffee Shop). Same days-3–5 pattern (video in the
  hub / Videos experience, no injected video steps; only Mission 2 injects intro/again steps).
- The Videos experience auto-discovers these via `missionsFor(lang).introVideo` — **no code change**.
- Tests updated to lock the mapping (`bootcamp.test.ts` EN set now `[2,3,4,5,7,8,9,11]`; new FR video
  assertion in `fr-missions.test.ts`). **Verified in-browser** each plays from its lesson (readyState
  4, real durations 15–20s, actually playing). Gates green: typecheck · lint · **662 tests** · build.

### Sprint — Foundation UX polish: guided sessions, discovery, affordance (2026-07-13)
- **Guided mini-session from a mission.** The hint's **Learn now** now opens a guided run over
  EXACTLY the current mission's Foundation words (`missionFoundationWords`, pure): a header
  "Foundation Building Blocks", **Word X of N** + progress bar, **Prev / Next**, and a final
  **✓ Back to Mission**. Never browses the whole database. The FAB keeps the existing category
  browsing; Universal Tap keeps single-word "peek and return". New store mode `session` +
  `openSession`/`sessionGo` (unit-tested); architecture unchanged.
- **Learning-language example first.** Every word page shows the example in the LEARNING language
  first (spoken via its own audio button), the app-language translation underneath (deduped when
  identical) — `buildExample` (pure, tested). Consistent everywhere.
- **First-time discovery.** `FoundationOnboarding` — a one-time dialog on first Bootcamp arrival per
  learning language ("Got it"), then a **pulse** on the 🛟 FAB (`foundationCoach.ts` persistence).
- **Tappable-word tooltip.** `TapCoachmark` — a one-time tooltip anchored to the first tappable word
  ("Tap underlined words…"), auto-dismiss ~2s, dismiss on tap, `pointer-events:none` so it never
  steals the tap; claimed once globally + persisted.
- **Stronger tap affordance.** `.tappable-word` is now a subtle brand chip + 2px dotted underline
  with hover / active / focus-visible states — recognizable without making a sentence noisy.
- **Removed the duplicated word title.** A word page shows the word ONCE as the big page title; the
  sheet header no longer repeats it, and the gloss line is hidden when it equals the word.
- RTL verified (Hebrew UI: guided session, tooltip, learning-first example with Hebrew underneath).
  Gates green (typecheck · lint · **661 tests** · build · smoke). No architecture, taxonomy, progress,
  detection, shared-sheet or corpus changes — polish only.

### Sprint — Foundation complete: Universal Tap · Smart Detection · Progress (2026-07-13)
- **Universal Tap everywhere.** Every Core-Corpus word is now tappable across the app and opens the
  ONE shared Foundation word sheet — no duplicated UI. `TappableText` (pure `corpusIndex.ts` tokenizer:
  whole-word, greedy longest-match, lossless) marks Core words inside sentences (dialogue NPC line,
  tool step, Core Phrases, sentence flashcards); `TappableWord` is the single-word form (Core Words
  Browse). All funnel through `foundationStore.openWord` → `FoundationSheet`. Rows gained a reusable
  `shared/ui/SpeakerButton` so audio stays one tap away without nested-button hacks.
- **Smart Foundation Detection.** `FoundationHint` (in the mission player) surfaces the first
  building-block word the learner has never viewed as a tiny non-blocking "🛟 Missing Foundation
  Brick — learn it in 20 sec" banner: **Learn now** (opens the word sheet) / **Dismiss** (suppress
  forever). Never blocks progression; renders nothing when there's nothing new.
- **Foundation Progress** (motivational, never gates). `foundationProgress.ts` (pure) computes
  per-category `viewed/total` + an overall %, shown as bars on the sheet's category grid. Viewing a
  word page marks its concept viewed; **viewed + dismissed persist to localStorage**
  (`ready.foundation.viewed` / `.dismissed`), concept-id keyed so it holds across languages.
- **Word page integration**: translation · audio · examples · frequency stars · related missions ·
  **Foundation category** chip (falls back to the raw corpus category for tapped non-Foundation words).
- Any Core word is openable (not just the ten categories) via the shared single-word builder
  `buildWord`. New pure tests: `corpusIndex.test.ts`, `foundationProgress.test.ts` (+ extended
  `foundationContent.test.ts`). Verified end-to-end in Chrome (EN): hint→learn, inline word taps in
  dialogue/phrases, 511 browse rows, progress bars. Gates green (typecheck · lint · **654 tests** ·
  build · smoke).

### Sprint — Foundation System: data-driven building-blocks surface (2026-07-13)
- **New always-on 🛟 Foundation surface inside the Bootcamp** (an architecture sprint, not a content
  one): a floating action button on the Bootcamp map (hidden inside an active mission) opens a
  reusable bottom **Sheet** → 10 Foundation categories → word list → word page (target word,
  app-language translation, native audio, frequency stars + "Essential", example, and derived
  "Appears in" mission chips). No progression, no gating — pure Pareto "grab the missing brick".
- **Fully data-driven, zero content duplication.** Foundation is a curated VIEW over the existing
  **Core Corpus** packs (`core-{lang}.v1.json`), not new content. Categories are declared as DATA in
  `features/foundation/taxonomy.ts` (selectors over the language-independent `category`/`pos`/
  `conceptId` fields), so the surface scales from hundreds → thousands of words and lights up a new
  language with **zero code**. Proven for **English + French** by an end-to-end Chrome run and a
  coverage test asserting every category resolves in both `core-en` and `core-fr`.
- **Pure model builder** `features/foundation/foundationContent.ts` (+ tests): `buildFoundation`,
  `frequencyStars` (tier/rank → 1–5), `relatedMissions` (whole-word scan of real mission text via
  `missionsFor(lang)`). **New reusable primitive** `shared/ui/Sheet.tsx` (bottom sheet, RTL/theme
  aware) generalizing the `Modal` scrim — the seam a future Universal-Tap word sheet reuses.
- Shell wiring: `shouldShowFoundationFab` (pure, tested in `nav.test.ts`), mount in `App.tsx`,
  `foundationStore` (open/close), en+he strings, `.foundation-*`/`.sheet-*` CSS. Gates green
  (typecheck · lint · **640 tests** · build · smoke).

### Sprint — Complete priming coverage + global function words + French numbers (2026-07-12)
- **8 foundation missions primed** (EN 1–8; FR 1–4 in parity): added justified `prime` steps to EN
  Missions 2,3,5,6,7,8 and FR 2,3 (Day 1 + 4 already done). Every mission decision is recorded in
  `MISSION_VOCAB_AUDIT` (`vocabAudit.ts`, all 30) and **bound to reality** by `vocabAudit.test.ts`
  (decision ⇔ actual prime step). **30 audited · 8 primed · 22 explicitly no-priming-needed.**
- **New-vs-review tracking**: `PrimeWord.review` + `primeVocab.ts` (`priorPrimeVocabulary`) so later
  missions mark a reused word as ♻️ review, never re-teaching it as new; `prime.test.ts` proves every
  review word appeared earlier and every "new" word is genuinely new.
- **11 function words promoted to global Core** (corpus **500 → 511**): `with, without, and, or, here,
  there, can, more, less, medium, large`, each with a natural French realization (`avec, sans, et, ou,
  ici, là, pouvoir, plus, moins, moyen, grand` — Fr "large"=wide, size=`grand`). Now in Browse / audio
  / word-flashcards; `essential-words.test.ts` verifies the §4 essential set in both emitted packs.
  Packs regenerated (`npm run build:content`); corpus/parity/fr tests green at 511.
- **French numbers** (`fr/frenchNumbers.ts` + 36 tests): the ONE tested source of truth for spoken
  `fr-FR` 0–9999 incl. the vigesimal 70/80/90 rules (`soixante-dix`, `soixante et onze`,
  `quatre-vingts`+ -s, `quatre-vingt-un`, `quatre-vingt-dix`, …). Taught in-situation via a
  French-numbers priming step in Mission 3 whose forms are generated by `frenchNumber()` (no drift).
- Honest status: French content AI-drafted, **pending native review**; FR missions 5–30 remain unbuilt
  (so their audit rows describe the English mission's plan). See **[VOCABULARY-AUDIT.md](./VOCABULARY-AUDIT.md)**.
- Gates: typecheck · lint · **618 tests** (was 465) · build:content (511) · build (PWA) · smoke — all green.

### Sprint — Vocabulary priming + sentence flashcards + seeded randomization (2026-07-12)
- **Seeded shuffle utility** (`shared/util/shuffle.ts`, pure + 11 tests): uniform Fisher–Yates with an
  injectable/seedable RNG (`mulberry32`), replacing scattered biased `.sort(() => Math.random()-0.5)`
  calls. Refactored: Bootcamp quiz/replies/ambush option order, Picture Quiz rounds, Listen &
  NumberSprint distractors, session builder, Videos picker. Options no longer land in biased slots;
  tests prove no-missing/no-dup, seed determinism, order-varies, and ~uniform position.
- **Mission vocabulary priming** (`{ kind: 'prime' }` step + `PrimeStep` renderer): 3–8 building-block
  words on one "Before we speak" screen, tap-to-hear, optionally assembling into a canonical mission
  sentence (`buildFromItemId`) — sentences stay the learning unit. Added to **EN Day 1 + Day 4** and
  **FR Day 1 + Day 4** (café words `avec/sans` literally compose the French sentence). Language-
  agnostic + opt-in; `prime.test.ts` (11) enforces small sets, resolvable refs, prime-before-sentence.
- **Sentence flashcards** (`core/flashcards.ts` pure deck + `SentenceFlashcards.tsx`): flip / hear /
  next-prev / shuffle / direction toggle (comprehension ↔ recall), over the **canonical** mission
  sentences (`buildSentenceDeck` reuses mission item ids — no duplication), per-language (no English
  leak), shuffled per session. Wired into Core → Phrases as "🎴 Sentence flashcards". Tests (8).
- Essential vocab audit: pronouns/verbs/descriptions/politeness already exist as global Core concepts;
  connectors (`with/without/and/or`) and café `medium/large` are primed **in-context** (80/20). French
  hard numbers (`soixante-dix/quatre-vingts`) remain an honest gap. See **[VOCABULARY-AUDIT.md](./VOCABULARY-AUDIT.md)**.
- Gates: typecheck · lint · **465 tests** (was 435, +30) · build (PWA) · smoke — all green.

### Tool — Dialogue Export (cinematic screenplays for AI video/voice) (2026-07-12)
- Permanent **dev** tool: `npm run export:dialogues [-- --lang=fr --mission=5 | --all]`. Exports each
  Bootcamp mission's **main successful conversation** as a clean screenplay (learning language +
  English + Hebrew, `👤 NPC` / `🧑 You`) to `exports/dialogues/<lang>/mission-NN.md` +
  `ALL_DIALOGUES.md`. No recovery/wrong-answer/quiz/ambush/coaching, no ids/metadata/tables.
- Pure logic in `apps/web/src/features/bootcamp/exportDialogue.ts` (`cinematicTranscript` prefers the
  **direct** correct answer over a recovery tool) + tests (`exportDialogue.test.ts`, 7); CLI in
  `scripts/export-dialogues.ts`. Reuses `missionsFor` + `tr` glosses → **language-agnostic**: a new
  language exports automatically; a new app-language gloss = one line (`GLOSS_LANGS`). `exports/` is
  git-ignored (generated). Verified: en 30 + fr 4 files, no id/metadata leaks. See
  **[DIALOGUE-EXPORT.md](./DIALOGUE-EXPORT.md)**. Gates: typecheck · lint · **435 tests** green.

### Sprint — Cross-device TTS engine: scored voice resolver + outcome model (2026-07-12)
- **Scored VoiceResolver** (`shared/audio/voiceResolver.ts`, pure + 16 tests): ranks the OS's
  installed voices — exact locale +1000, ordered fallback locale, same-base region, preferred-name
  bonus, local-voice bonus, engine-default; **wrong language disqualified**. `en-US` beats `en-GB`,
  `fr-FR` beats `fr-CA`, a preferred name never overrides a wrong locale, and no correct voice →
  `null` (speak the locale tag, never a wrong-language voice).
- **Registry-driven profiles** (`voiceProfiles.ts`): locale = `languageTtsTag(lang)` (single source
  of truth — the old `LANG_TAG` duplicate table is gone) + per-language fallbacks/preferred names/
  natural test phrase (en/fr/it/es/ar).
- **Outcome model:** `speak()` now returns `Promise<SpeakResult>` (`ended|interrupted|error|
  unavailable`). Dialogue auto-advance, scripted you-lines, Transcript **Play-All** and the listening
  reveal proceed **only on `ended`** — a superseded/cancelled utterance never advances the UI (fixes
  a real stale-callback bug). Mocked-engine tests cover ended/interrupted/unavailable + locale.
- **Voice loading** hardened: bounded `ensureVoices()` (≤1.2s, `voiceschanged` + poll, no infinite
  loop), voices refreshed on the unlock gesture. Preserved Chrome keep-alive + visibility-resume +
  iOS gesture-unlock + global speech-rate (all still green). `prepareTextForSpeech` strips emoji only
  from the spoken string (display unchanged).
- **Test Voice** now speaks the **active learning language's** natural phrase and shows the resolved
  locale + voice + an honest note when the accent is a different region / a system voice.
- **Explicit accent match quality** (correction pass): `exact-locale` / `approved-fallback` /
  `same-language-different-region` / `browser-managed` / `unavailable`. **Regional accents are not
  equivalent** — en-US ≠ en-GB, fr-FR ≠ fr-CA, es-ES ≠ es-MX; only registry-approved locales are
  `approved-fallback` (today: region-neutral base only), and a different region is degraded/last-resort,
  never surfaced as native. Tests assert this.
- **Honesty:** Chrome/Safari/iOS/Android/Edge reliability is **implemented from browser documentation,
  NOT validated on physical devices** in this environment (mocked-engine tests only). Device QA matrix
  is pending. See **[TTS_RESEARCH.md](./TTS_RESEARCH.md)** §10.
- Gates: typecheck · lint · **428 tests** · build · smoke (offline).

### Sprint — Display consolidation + French missions 3–4 + Early Access end-state (2026-07-12)
- **Canonical display resolver adopted in the real app.** `resolveLearningItem(item, appLang,
  learningLang) → LearningDisplayModel` (`shared/i18n/display.ts`) is now the single path Core Words
  (browse) and Core Phrases use — primary target text + app-language gloss + audio(text+lang) + both
  directions + review id, in one object. Games/Bootcamp drills consume the same primitives
  (`speak(learningLang)`/`L`/item-id) and are documented as equivalent policy. Permanent rule added:
  no learning-UI component independently re-selects realization/gloss/TTS/direction/review id.
- **French Bootcamp 2/30 → 4/30**: authored visible **Mission 2 (Numbers & Money, day3)** and
  **Mission 3 (Coffee Shop, day4)** — natural spoken `vous` French, `fr.*` ids, `tr:{en,he}` glosses,
  full branch/recovery/ambush/transcript parity with English (parity checker: steps/items match, no
  dead ends). New test `fr/fr-missions.test.ts` guards fr ids, French-primary lines, bilingual transcripts.
- **Early Access completion state** (Part C): after the last built French mission, Victory shows an
  honest "you're at the front of Early Access — more coming soon" card + Back-to-map, and never
  offers a next-mission that routes into unbuilt content.
- Honest coverage: **visible Missions 1–3 + Recovery** playable; Missions 4–10 remain Coming Soon
  (this sprint targeted 10 — delivered 3; the remaining 7 are pure content on the same pattern).
  Gates: typecheck · lint · **402 tests** · content + production build · parity. English unchanged.

### Sprint — True any-to-any multilingual architecture + proof (2026-07-12)
- **Any-to-any display rule** (`shared/i18n/display.ts` `resolveDisplay`): one pure function maps
  (concept, appLang, learningLang) → primary target realization + app-language gloss (the SAME
  concept realized in the app language — **no English bridge**) + TTS locale + independent RTL/LTR +
  review id (`concept@learningLang`). `LocalizedText` was already an open map; this makes the display
  rule explicit and testable.
- **Proof (architectural evidence, not shipped languages):** `display.test.ts` (14 tests) proves
  **Arabic UI → Spanish** and **Spanish UI → French** with correct primary/gloss/TTS/RTL/review-id
  and **no English in the visible flow**, plus RTL-target-under-LTR-app, progress isolation by
  learning language, English-leak detection, and "future language = data" (a `de` realization
  resolves with zero engine change).
- **Registry generalized:** `capabilities(code)`, `languageDirection(code)` (RTL is not Hebrew-only),
  `languageTtsTag(code)`; additive capability fields (coreAvailable / bootcamp / appUi / nativeReviewed).
- **Any-to-any validator:** `assertPairsComplete` fails loudly when an enabled pair would fall back to
  English (missing realization or app gloss); distinguishes error vs early-access vs pending review.
- **Audit outcome:** the platform was already largely general (open `LocalizedText`, keyed
  realizations, per-language progress/TTS/missions, Mongo `Mixed` realizations, `itemId`-scoped review
  events). Honest gaps remain: production app languages are **en/he only** (no es/ar UI dict), and
  `en` stays the LocalizedText safety pivot. Arabic/Spanish are **proof-only**, not production. New
  doc: **[MULTILINGUAL-ARCHITECTURE.md](./MULTILINGUAL-ARCHITECTURE.md)**. Gates: typecheck · lint ·
  **398 tests** · content + production build · parity — English & French unchanged.

### Sprint — Polish / QA (replay · Picture Quiz reveal · Core Phrases leak) (2026-07-12)
- **Replay after CORRECT answers (root cause in shared `AnswerFeedback`).** The correct branch
  rendered the prompt as static text (no replay); only the wrong branch used the replayable `<Line>`.
  Now the correct branch shows the prompt with its replay button whenever it carries audio — one fix
  covers every caller (Picture Quiz, comprehension drills, dialogue, ambush, quiz, expected-reply).
  Replay uses the active learning language and never records review or advances.
- **Picture Quiz no longer reveals the translation before answering.** Removed the pre-answer
  learner-language line; the question now shows only the foreign word + speaker + image options.
  The translation appears in `AnswerFeedback` after answering (every language combination).
- **French Core Phrases leak fixed at root.** `Core.tsx` built the phrase list from the English
  `DAYS` + imported English `RECOVERY_ITEMS` and spoke `speak(text,'en')`. Now it sources from
  `missionsFor(learningLang)` (survival kit = the language's own recovery tools, language-agnostic
  `.phrase.recovery.` matching) and speaks the active language. Verified: French shows French
  ("Désolé, je ne comprends pas." / "Je m’appelle Dan."), English unchanged.
- Audit: no remaining hardcoded `speak(…, 'en')`, English `DAYS`, or `startsWith('en.…')` in app
  code. Gates green: typecheck · lint · **384 tests** · content + production build · parity.

### Sprint — French Early Access enabled (2026-07-12)
- **French is now selectable as an Early Access language** (`available:true` + `earlyAccess:true`,
  badge in onboarding/Profile pickers). Complete French Core 500 + both Bootcamp missions are usable;
  unbuilt missions show honest **"Coming Soon"** and cannot be entered.
- Closed four real leak-paths first (evaluated before enabling): (1) **per-language Bootcamp
  progress** — `ready.bootcamp.v1.{lang}` with one-time legacy→`en` migration + reload-on-switch, so
  English completions never appear on the French map and switching never resumes into another
  language's mission; (2) **Home Continue/Next** now reads `missionsFor(learningLang)` (can't start an
  unbuilt French mission); (3) **Videos** reads the active language's missions (French shows the
  honest empty state, never English videos); (4) **map cards** show "Coming Soon" and gate
  completion/resume by `built`. Gates green: typecheck · lint · **384 tests** · build · PWA · parity.

### Sprint — French content: Core Corpus 500/500 + Bootcamp missions (2026-07-12)
- **French Core Corpus is COMPLETE: 500/500 concepts.** Authored the remaining 300 French
  realizations (`data/fr-pilot.ts`); `core-fr.v1.json` now ships **500 words, 218 game-eligible —
  identical counts to English**. `corpusParity('fr')` = 0 missing, 0 orphans; ids/categories/metadata
  identical to English by construction (only the realization differs). Legitimate target-language
  homographs (porte = door/gate, café = coffee/café, fille = girl/daughter, place = seat/square) are
  allowed — the games key on concept id + emoji, not the surface string.
- **French Bootcamp: missions 1–2 authored** (`fr/day1.ts` Recovery Toolkit, `fr/day2.ts` Introduce
  Myself) + shared `fr/recovery.ts`. Each plays through the SAME engine and the parity checker
  confirms structural equivalence to its English counterpart (23/23·7/7, 16/16·13/13) with no
  dead-end branches. `npm run parity`: **corpus 100%, Bootcamp 2/30**.
- **Honest status:** vocabulary parity is DONE; the remaining work is **28/30 Bootcamp missions**
  (pure content, one `fr/dayN.ts` per mission). French stays `available:false` until the Bootcamp is
  complete enough to not drop a learner into "not built" missions. Gates green: typecheck · lint ·
  **384 tests** · content + production build · parity.

### Sprint — Language-agnostic engine + French parity machinery (2026-07-12)
- **The Bootcamp is now language-agnostic** (the real refactor, not a translation). Removed every
  English assumption in the engine: (1) a single English `DAYS` map → a pure, store-free
  **`registry.ts`** with `MISSIONS_BY_LANG` / `missionsFor(lang)` (a language with no missions shows
  honest "not built", never English); (2) hardcoded `speak(text,'en')` in ~23 spots → `speakL` (the
  active learning language); (3) Hebrew-only dialogue translations (`node.he`) → app-language-aware
  **`tr:{en,he,…}`** via the pure `dialogueTr` helper (English stays byte-identical by fallback);
  (4) transcript now carries `tr`; (5) English-only id-prefix checks (`startsWith('en.phrase…')`)
  → language-agnostic `.includes('.phrase…')` so coaching/mastered-phrases work for any language.
- **French Mission 1 (Recovery Toolkit)** authored and registered under `fr` — French target lines
  + `tr` glosses, `fr.phrase.*` ids (French progress/review isolated from English). It plays through
  the SAME engine; parity checker confirms it structurally matches English mission 1 (23 steps, 7 items).
- **Parity validators (Phase 7)** — pure, tested, and runnable (`npm run parity`): `corpusParity`
  (every concept must have a realization; no orphans) and `missionParity`/`unreachableOrDeadEnds`
  (same mission set, structurally equivalent, no dead-end branches). `assert*` FAIL the build for any
  language declared complete-but-incomplete. Honest dashboard today: **FR corpus 200/500 (40%),
  Bootcamp 1/30 (3%)** — measured, not claimed done.
- **French Core vocabulary** now 200 concepts (`data/fr-pilot.ts`), built into `core-fr.v1.json`
  (PWA-precached) — Core Words + Picture Quiz + Swipe Recall + TTS all work in French from it.
- Adding the NEXT language (es/it/de/pt) is now primarily content: realizations + a mission set +
  registry line. Gates: typecheck · lint · **383 tests** · content build · production build green.
- **Honest status: French is NOT at feature parity and is not user-selectable yet** (`available:false`).
  The engine is ready; the remaining work is content (300 corpus concepts, 29 Bootcamp missions). See
  **[FRENCH-PILOT.md](./FRENCH-PILOT.md)**.

### Sprint — Vocabulary-game fixes + French foundation (2026-07-12)
- **Picture Quiz "stuck on feedback" fixed (Part F).** Root cause was **not** a state bug — the
  advance state machine was correct — but a **stacking/occlusion** bug: the feedback's fixed
  `.action-zone` Continue button (`z-index:15`) sat *behind* the permanent bottom nav
  (`z-index:20`) on the Core tab, so the tap never landed. Fix: a Core learning-game session is now
  a focused, nav-less flow (new `appStore.coreGameActive`; `shouldShowNav` in `apps/web/src/app/nav.ts`
  hides the nav) — the same rule Bootcamp missions already use. Progression is also protected by a
  pure reducer (`advanceQuiz`/`isQuizComplete` in `pictureQuiz/rounds.ts`) with tests.
- **Swipe Recall icon ambiguity fixed (Part E).** Cards now show the concept meaning in the
  learner's app language **below the emoji before reveal** (pure `cardFace` in `swipeRecall/engine.ts`),
  so 🚻 is unmistakably "toilets" without giving away the target word; the target French/English word
  still waits for the press-and-hold reveal. RTL-safe, no change to requeue or review events.
- **Games are learning-language aware.** Both games take a `lang` prop and speak the active learning
  language (was hardcoded `'en'`).
- **French foundation (content-only, honest).** `validateCorpus` takes an injectable `declaredLangs`
  so partial-pack rejection is testable per language; a validated 17-concept French **proof slice**
  (`content/core-corpus/fr-proof.ts` + test) proves French flows through the same builder to a valid
  `core-fr` pack. French is **not** in `DECLARED_LANGS` and stays `available: false` — the full Core
  500 + Bootcamp are a separate sprint. See **[FRENCH-PILOT.md](./FRENCH-PILOT.md)**.
- Gates: typecheck · lint · **363 tests** · content build (`core-en` = 500 words) · production build
  + PWA precache all green. English pilot unregressed. Manual device verification (iPhone Safari/
  Chrome, RTL long-press/swipe) still recommended before release.

### M0 — Foundation & Engine
- npm-workspaces monorepo, TS strict (project references), ESLint 9 + Prettier, Vitest.
- `packages/content-schema`: zod schemas for every content + user-state entity (PDF §12).
- `packages/engine` (pure, zero I/O): FSRS-inspired memory model `R(t)=exp(−t/S)` with
  per-mode evidence weighting (swipe = weak prior); deadline-aware greedy scheduler
  (`value × R-gain / seconds-cost` toward R at departure, long-horizon after the trip);
  plan engine (weighted tier selection ≤85% capacity, situation ordering, new-item taper,
  graceful re-plan); readiness rules (notStarted/inProgress/ready/fading, spaced verification,
  emergency L3 gate). Coverage ~98% statements / 91% branches (bar: 85%).
- **Simulated-learner proof**: virtual learners with configurable forgetting rates run a real
  7-day × 30-min plan; ≥80% of Tier-1 phrases reach L2+ at departure; the scheduler never
  exceeds the daily budget; holds across a 5-seed cohort.

### M1 — Content
- `content/it-IT/pack.yaml`: 182 Tier-0/1 items — 10 situations (core phrases, 4–6 likely
  replies each, recognition words, one branching dialogue, ≤3 culture tips), 14 politeness-glue
  phrases (fluent target), 26-number curriculum incl. prices/time stages. `it-IT v0.1.0`,
  `needsNativeReview: true`.
- Pipeline: YAML → zod validation → referential/tier/dialogue integrity → versioned JSON pack +
  manifest into `apps/web/public/content/`. `validate:content` is the CI gate (8 content tests).
- TTS integration point: asset-path convention + `AudioResolver`/`TtsProvider` interfaces; Web
  Speech API fallback in the app; real recordings swap in per-item with no client change.

### M2 — App (MVP)
- `packages/data`: `DataProvider` interface; `MockProvider`; `LocalProvider` = permanent
  IndexedDB offline layer (append-only event log, sync queue, pack cache, projection via the
  shared engine); `ApiProvider` (M3).
- React 18 PWA (feature-sliced, Zustand): onboarding (§10.1), Home/Mission Control, Session
  Player with one interaction shell and modes 1–6 (Swipe Triage, Flash Recall with latency
  fluency evidence, Echo, Understand-the-Answer with logged slow-replay, Number Sprint with
  personal best, Situation Simulator with branching dialogues), Warm-up→Learn→Integrate→Close
  with capability summary, 3-strike relearn loop, instant per-drill persistence
  (interruptible), Readiness Board (incl. Fading + projected recall), Phrasebook, Emergency
  Card (huge type, show-to-a-local, 112), Plan & Settings with honest re-planning.
- PWA: manifest + service worker; app shell and content pack precached; fully offline after
  first load. Calm two-accent design, thumb-zone actions, no gamification anywhere.

### M3 — Backend, Sync & Google Auth
- Express `/api/v1` (PDF §13): content manifest, anonymous users (adopt client id), plan CRUD,
  idempotent `POST /me/review-events:batch`, memory-state restore, session logs, readiness.
  zod validation everywhere, typed `AppError` middleware, async-safe handlers.
- MongoDB (Mongoose) per §12.3 with indexes; `reviewEvents` append-only; `memoryStates`
  re-projected by the same engine code the client runs.
- Google Sign-In: GIS button (client) → ID-token verification (`google-auth-library`) → JWT
  httpOnly cookie → anonymous→Google identity merge (events moved, state re-projected, plan
  kept). `.env.example` + RUNBOOK document the console steps.
- 10 Supertest API tests against mongodb-memory-server.

### M4 — Hardening & verification
- Error handling: AppError middleware, per-feature ErrorBoundaries, audio fallbacks that never
  dead-end a drill, sync retry with exponential backoff + online-event trigger, user-facing
  retry states in onboarding/init/plan.
- `npm run smoke`: scripted plan → session → events persisted → readiness updates → offline
  reload over the real built pack — 15/15 checks pass.
- Fixed during hardening: planner tier selection now uses weighted item costs (recognition =
  0.35× production per §6.3), so the flagship 7-day × 30-min user correctly gets Tier 1; tier
  selection also caps at the pack's deepest authored tier. Regression-tested.
- Final: 74 tests green, typecheck/lint clean, production builds of web + server.

## Known gaps (honest list)

1. **Content needs native review** — `needsNativeReview: true`; a native Italian speaker must
   sign off per R1. Culture tips are written in Italian; consider English for MVP users.
2. **Audio is Web Speech API TTS** until real recordings (or neural TTS files) are dropped into
   `apps/web/public/audio/it/` — the swap path is built and tested.
3. **Echo mode has no mic record-and-compare** (D017) — v1.1 addition.
4. **Google Sign-In needs your Google Cloud client id** (RUNBOOK steps); until then the app
   runs anonymous + fully offline.
5. **Dev-tooling npm audit findings** (vitest/vite dev-server advisories) require major-version
   bumps of the test/build toolchain; they do not affect production artifacts. Tracked, not
   fixed, to avoid destabilizing the verified toolchain (D026).
6. **In-Trip Mode, Sign Scan, Panic Mode, more languages** — per PDF roadmap (v1.1+), not MVP.

## Decision log

See `docs/DECISIONS.md` (D001–D026) — one line of reasoning each, keyed to PDF sections.

## Verification snapshot

```
typecheck  ✓ tsc -b (schema, engine, data, server) + content + web
lint       ✓ eslint (0 problems)
tests      ✓ 74 passed / 74 (engine 41 · content 10 · data 13 · api 10)
coverage   ✓ engine ~98% stmts / 91% branches (bar 85%)
build      ✓ packages + content pack + PWA (precache 13 entries) + server dist
smoke      ✓ 15/15 checks (plan → session → persistence → readiness → offline reload)
```

---

## M5 — UX overhaul (2026-07-05)

Rebuilt the presentation layer as a complete ecosystem per the founder's UI/UX refinement brief.
The engine, data providers, server and tests are untouched and still green.

- **Multi-language platform**: language registry (🇺🇸 🇪🇸 🇫🇷 🇮🇹 🇸🇦) with per-language accent
  themes, native names and RTL; dynamic UI language (en + he shipped) — adding a language is a
  dictionary + a content pack, zero screen changes. Italian is the first shipped pack (R1);
  the founder's fr/es/en/he vocabulary bank seeds the next packs.
- **Mission-first**: Today's Mission card previews the scheduler's real output with estimated
  minutes and a single Start button; the whole app funnels into it.
- **Equal content surfaces**: bottom nav — Mission · Words · Phrases · Situations · Practice.
- **Travel Confidence**: per-situation rings + the four honest badges; detail view with
  projected recall at departure.
- **Practice hub**: six mini-games (Swipe, Recall, Listening, Speed Challenge, Simulator, Echo)
  reusing the session runtime and the honest evidence model.
- **Micro-interactions**: check-pop, haptics, staggered entrances, breathing CTA, animated
  rings/progress — no XP/coins/streaks/confetti anywhere (P6).

Verification after M5: 74/74 tests, typecheck + lint clean, PWA production build (13 precache
entries), engine untouched at ~98% coverage.

---

## M6 — Real MongoDB-backed data (2026-07-05)

- **Connected to the real cluster** via `MONGO_URI` in `server/.env` (never logged);
  `npm run seed:all` populated: it words 51 · it phrases 131 · it situations 10 · bank words
  3,000 (from the 1,000-row fr/es/en/he vocabulary bank, full import report printed) ·
  5 contentPacks rows. Re-run inserts 0 (idempotent).
- **Live API verified** against real Mongo: /health {mongo:"connected"}, /content/languages
  (5 languages with counts), /words?languageCode=fr → 1000, /content/packs/it/full → full
  engine payload (58 KB).
- **New API surface** (Routes → Controllers → Services → DAL): health, content/languages,
  content/packs(+/:lang, /:lang/full), words, phrases, situations, review-events,
  memory-states, practice-sessions(+end), readiness — all zod-validated, anonymous-friendly.
- **Frontend**: ApiProvider now fetches the pack API-first and caches it into IndexedDB;
  falls back to the static pack when the server is down (tested).
- **Languages**: it = active (pipeline-validated; native review still pending) · en/es/fr =
  coming_soon (bank words seeded; need travel phrases + situations) · ar = coming_soon
  (needs full pack + RTL review).
- **Google Auth**: implementation already present; still needs your `GOOGLE_CLIENT_ID`
  (+ VITE_ vars). GOOGLE_CLIENT_SECRET is NOT required for the ID-token button flow.
- Verification: 92/92 tests, typecheck/lint clean, prod builds, SMOKE PASS.

---

## Epic 1 — Schema Freeze executed (2026-07-05)

LocalizedText canonical schema live across content-schema → pipeline → packs (it 0.2.0) →
Mongo (reseeded in place, 0 new rows) → API → web UI (L() at every render site). Hebrew UI
now renders situation names + culture tips in Hebrew with English fallback elsewhere; culture
tips re-authored en+he. P0 fixes: zero-drill guidance state, per-game practice eligibility,
jargon-free copy, anonymous restore wired. Verification: 97 tests, typecheck/lint clean,
production build, SMOKE PASS, live API checks (he title + localized tip via /packs/it/full).
Remaining Epic 1 tasks (next): ID namespace unification (T2), Moment schema (T3), quality
field (T4).

---

## Sprint 6 — Bootcamp Foundation (vertical slice)

20-day capability plan (data + landing map: Day 1 "I can survive" → Day 20 "a whole day
abroad alone") with per-day objective/confidence gain/targets/skills/feeling/why/prepares-next.
Day 1 fully playable in Hebrew UI (~20 min): welcome → briefing → stuck-traveler dialogue
(watch) → 7 survival tools listening-first (hear→meaning→say) → listening quizzes → swipe
game → dialogue (play, choice points) → fast-sentence confidence ambush → evidence receipts →
day summary + capability card. Real events into the log; resume + replay; walkthrough fixes
(speech-complete advancing, StrictMode-safe transcript, clear ambush CTA). 113 tests green.

---

## Sprint 7 — READY Missions (2026-07-06)

Chrome audio fixed at the root (cancel/speak race + utterance GC + voice priming — D051).
Bootcamp redesigned into 30 missions / 5 phases with cold checkpoints (plan data + map UI).
Deep Moment architecture: dialogue TREES rendered one line at a time with branching recovery
beats; Expected Replies as a first-class comprehension step. Mission 1 rebuilt interactive;
Mission 4 "Coffee Shop" built as the depth exemplar (full barista question-chain). Mission
Complete screen drives the one-more-mission loop. 121 tests green incl. dialogue-graph
validators; typecheck/lint/build/smoke pass.

---

## Sprint 8 — Production Content Acceleration (2026-07-07)

Chrome audio fixed at the TRUE root (D056): the blocker was Chrome's autoplay/gesture-unlock
policy, not the Sprint-7 cancel/speak race — the prior setTimeout defer had made it worse.
Engine now primed inside the first user gesture + explicit unlock on Start, with a dev-only
audio diagnostics panel, a Test Audio button, an always-visible "enable sound" card on the
mission map, and never-silent fallbacks. Missions 2–10 built as pure data on the single Mission
player (Introduce Myself, Numbers & Money, Restaurant, Directions, Taxi, Hotel Check-in,
Shopping, Arrival-Day checkpoint): listening-first tools, Expected-Replies comprehension,
branching recovery-beat dialogue trees, off-script cold opens, evidence receipts. 32 mission
concepts (recovery kit + core say-phrases + expected replies) seeded idempotently through the
pipeline into Mongo (35 total incl. samples) with English playable and es/fr/it/ar honest
DRAFT realizations flagged for native review. Typecheck 0 / lint clean / 143 tests / build /
smoke all green; seed reruns idempotent (0 inserted, 35 updated).

---

## Sprint — Pilot UX Improvements (real pilot feedback, 2026-07-09)

UX-only sprint driven entirely by real pilot testers. No engine/schema/pipeline/pedagogy changes;
Bootcamp content (phrases, replies, dialogues) is untouched — only placement, presentation and
navigation improved.

- **Removed the redundant "I said it" screen** in the Practice tool step. The flow was
  Learn → Hear → "I said it" (which just repeated the same sentence and made testers think the app
  had frozen) → Next. It is now Learn → Practice (say it aloud) → Next, on one screen. The echo
  evidence event is still recorded.
- **Transcript navigation**: the tiny back arrow is now a large, rounded, mobile-friendly icon
  button (52px target), and a **✓ Finish** button returns to the Mission Hub — navigation only, no
  progress reset.
- **First-launch App Language step**: on the very first open the app asks for the app language
  (עברית / English) *before* anything else, instead of assuming English.
- **Language names shown in the app language** (Task 4): a Hebrew UI now shows אנגלית / ספרדית /
  איטלקית / צרפתית / ערבית; an English UI shows English / Spanish / Italian / French / Arabic
  (`languages.ts` `names` + `languageName()`), everywhere trip languages are listed.
- **Core is now a knowledge-center shell** with tabs — Core Phrases (live) · Core Words · Core
  Patterns · Common Questions · Emergency · Favorites (all honest "coming soon"). Structure only,
  no faked content.
- **Survival Toolkit relocated** (biggest reported problem): ex-Mission 1 confused almost every
  tester because its answers are escape tools, not answers to the conversation. It is renamed
  **Recovery Toolkit**, marked **special/optional** (no number), and placed at the end of the
  Bootcamp map. The numbered journey now begins with **Introduce Myself** (#1) and runs 29 missions
  (1–29). The mission's content is unchanged; `day`/DAYS keys and persistence ids are unchanged —
  display numbering is purely presentational (`missionNumber()` / `CORE_MISSIONS`).
- **Mission mapping bug fixed + fully validated** (Task 7): Mission 5's card said "Fast Replies I"
  but opened the Restaurant sit-down-meal content (day5) — the ear-only "Fast Replies" slot never
  had content. The card is corrected to **Restaurant Meal** (distinct from Mission 13's "Restaurant
  Basics" to avoid two identical cards). A script now verifies all 30: every card's title == its
  hub == its content, with a victory summary and a transcript dialogue present. Missions 2 & 3 card
  wording was harmonized to their content ("Introduce Myself", "Numbers & Money").

Verification: typecheck 0 · lint clean · **281 tests** · production build (13 precache entries) ·
SMOKE PASS · `gen:conversations` regenerated. Known follow-ups: the internal "Mission N:" headline
on each mission's first practice screen still carries its original day number (cosmetic, off by one
vs the new display number for missions 2–30); and day5/day13 are two similar restaurant lessons —
next sprint could differentiate or merge them, and add the real "Fast Replies" speed mission.

---

## Sprint — Home Experience & Core UX (2026-07-09)

UX-only sprint making READY feel like a product, not "just a Bootcamp." No engine/schema/
pipeline/mission-logic/progress/content changes; all controls reuse their existing stores.

- **Home is now the real entry point.** Below the (unchanged) language strip: a welcoming header,
  a **Quick Settings** card with **Theme** (Day/Night) and the **Speech Speed** slider — both
  reusing the exact same appStore/TTS source of truth (no duplicate state) — then four large
  **action cards** that are the app's primary navigation: 🗣️ Common Situations → Bootcamp,
  📖 Learn New Words → Core (Words), 💬 Core Phrases → Core (Phrases), 🎬 Videos → the new Videos
  experience. **Continue** is preserved but demoted to a quieter secondary card lower down.
- **Videos experience** (`features/videos/Videos.tsx`) — not a list: plays a random available
  mission video; when it ends (or the learner taps "I finished watching") a popup asks *"Did you
  understand everything?"* → **Yes** loads another random video (excluding ones seen this session),
  **I'd like to practice** opens the exact **Mission Hub** that owns the video (`startDay` → hub,
  unchanged). Honest empty state when no/again-no videos exist. Only Mission 2 ships a video today,
  so the practical flow is: watch → Yes → "that's every video for now". Reuses the existing
  `VideoPlayer` (now exported, with an added optional `onEnded`).
- **Core is a two-layer knowledge center** (Task 3): a grid of **category cards** (📖 Phrases ·
  📝 Words · ❓ Common Questions · 🚨 Emergency · 🧩 Patterns · ⭐ Favorites) → the existing tabbed
  page (top tabs + content) opened on the chosen category, with a back button to the cards. The
  chosen category lives in `appStore.coreCategory` so Home's cards deep-link straight into a
  category and the Core bottom-nav tab resets to the card grid. Only Core Phrases has content;
  the rest stay honest "coming soon". Core content itself is unchanged.
- **Profile** now defers Theme + Speech Speed to Home (single source of truth, surfaced where
  they're used most); Profile keeps Language, Audio and the honest "coming soon" rows.
- **Bottom navigation, Mission Hub, Practice, Transcript, Victory, progress, offline/PWA — all
  unchanged.** New `videos` view is a focused screen (no bottom nav) with a back-to-Home button.

Verification: typecheck 0 · lint clean · **281 tests** · production build (13 precache entries) ·
SMOKE PASS. Light polish only (staggered card entrances via the existing animation). Follow-ups:
Videos becomes richer as more mission videos ship; Core's non-Phrases categories await content.

---

## Sprint — Pareto UX & Learning Experience (2026-07-11)

UX + reusable-infrastructure sprint. No engine/schema/pipeline/pedagogy/Mongo changes; **no
Bootcamp mission content changed** (`gen:conversations` produces zero diff). All controls reuse
their existing stores; new UI is composable and content-agnostic.

- **Dialogue Integrity Audit (P0).** New `scripts/audit-dialogues.ts` walks every mission's happy
  path and flags any `correct: false` choice that routes into the happy path (NPC "continues as if
  correct") or shares a target with a correct sibling. **Result: 0 blockers** — all 13 wrong-answer
  branches across the 30 missions already route to dedicated recovery beats that acknowledge the
  wrong pick; the runtime (`DialogueStep`) routes strictly by `choice.next`. The reported
  "NPC ignores wrong answer" perception traced to the *absence of wrong-answer feedback*, fixed by
  Tasks 4–5. Locked in with **30 new regression tests** (one per mission) so it can never regress.
- **Resume Mission dialog (P0).** Entering a started-but-not-completed mission now asks *"Continue
  your practice?"* → Continue where I left off · Start from the beginning. Restart calls the new
  `restartDay()` which resets **only that mission's step index** — never completion, receipts,
  review events, or any other mission. Fresh missions start immediately; completed ones keep
  Practice-Again. New reusable `shared/ui/Modal.tsx` (generalizes the Videos popup pattern).
- **One-screen listening (P0).** `ToolStep` no longer gates the reveal behind a manual "tap when
  ready" (the gap testers read as a freeze). A play button + "Listening…" transforms *in place* the
  instant playback finishes (speak() resolves) into sentence + translation + Replay + Continue.
- **Global feedback system (P1).** ONE reusable system: `shared/audio/sfx.ts` (synthesized WebAudio
  chime/error tones — no assets, fully offline), `haptics.error()`, `shared/ui/feedbackCue.ts`
  (`feedbackCorrect/Wrong/feedback(ok)`), `shared/ui/Feedback.tsx` (two-polarity burst), and
  `.fx-correct`/`.fx-wrong` motion + glow/shake in CSS. Wired through the shared `AnsweredView`
  (Quiz + Replies), `DialogueStep`, and `AmbushStep` — success/failure now feels identical everywhere.
- **Redesigned wrong-answer experience (P1).** `AnsweredView` wrong state now shows ❌ Not quite →
  Your answer (struck-through) → The right answer → a one-line **Why?** → **Try Again · Continue**
  (never auto-advances). Correct state trimmed to a lean celebration (removed the textbook filler).
- **Pareto victory screen (P1).** Confetti + "{Mission} completed!" + three large action cards
  (Watch Conversation · Open Transcript · Practice Again). The evidence wall is gone from the
  default view — collapsed behind a tiny **"What did I learn?"** toggle (skill · mastered phrases ·
  receipts). Celebrates achievement, not reading.
- **Reading trimmed (P1).** Removed the "no rush / jot it in your notebook" and verbose why-lines
  from answer feedback and the victory paragraph. Mission-intro copy (behind each mission's CTA) is
  intentional content and left to native review, not chrome.
- **Learning-game infrastructure (P2).** New `features/games/` — generic `GameWord`/`GameWordSource`
  types, demo data (`mockWords.ts`), **Picture Quiz** (word → 4 emoji, generic over any word list),
  and **Swipe Recall** (emoji card, press-&-hold reveal, swipe/buttons) over a **pure, unit-tested
  re-queue engine** (`swipeRecall/engine.ts`, 6 tests) where unknown cards return after ~10–15
  others — the exact seam a real SRS scheduler plugs into later. Both reuse the global feedback
  system. Kept **unmounted from pilot nav** (English pilot stays honest) — ready to mount on Core 1500.

Verification: typecheck 0 · lint clean · **318 tests** (was 281: +30 dialogue-integrity, +6 swipe
engine, +1) · production build (13 precache entries) · SMOKE PASS · dialogue audit 0 blockers ·
`gen:conversations` zero diff. Follow-ups: mount the two games when Core 1500 ships; consider a
per-item "why" for missions lacking tips; native-Hebrew review of mission-intro copy.

### Follow-up — pedagogical believability pass (same sprint)

The first audit was structural (no `correct:false` choice silently rejoins the happy path — 0
blockers). This pass experienced every conversation as a beginner and hunted the subtler bug the
founder flagged: an answer that *feels* consequence-free. New `scripts/audit-choices.ts` dumps every
choice node with the NPC prompt and the reaction each option produces — the review surface for the
**alternate-correct** branches the auto-generated conversations doc never shows (which is exactly
why these slipped through).

- **Mission 8 (the founder's Example 1) — fixed.** "What's the wifi password?" and "Is breakfast
  included?" both routed to the *same* breakfast answer — the receptionist ignored the wifi
  question. The wifi choice now routes to its own line ("The wifi code is on your key card…"). The
  NPC never answers a question you didn't ask.
- **Mission 9 — fixed.** "It's a bit expensive" was ignored (NPC rang you up regardless). It now
  gets an acknowledging beat ("it's already twenty percent off — best price I can do") before
  closing. The objection changes what happens.
- **Every wrong dialogue pick now MATTERS (the founder's Example 2).** In `DialogueStep`, a genuine
  wrong pick (`correct:false`) no longer flashes the correction and moves on — it **pauses on a
  "❌ Not quite" card** (with the error cue) and requires a tap before the NPC's recovery beat plays.
  Mission 1's coaching mode is untouched ("never right/wrong", no error buzz).
- **Cold/checkpoint missions (10, 18, 24, 28–30) intentionally left as-is:** their rushed NPC blows
  past a recovery tool by design (real high-pressure moments); documented, not "fixed" (changing
  them would lengthen and dilute the cold-integration intent).

Locked with **2 new believability tests** (Missions 8 & 9). Verification: typecheck 0 · lint clean ·
**320 tests** · build (13 precache) · SMOKE PASS · structural audit 0 blockers. Remaining for future
review: the AI-drafted Hebrew of the new recovery lines; whether cold missions should offer a brief
"repeat" beat for recovery tools.

---

## Sprint — Core 100 Activation + Full-Context Wrong-Answer (2026-07-11)

Two goals: (A/B) ship the first **real** 100 Core Words through the canonical pipeline and turn on
Core Words + both emoji games; (C) give wrong-answer feedback the full learning context. No Bootcamp
mission content changed (`gen:conversations` zero diff); no bottom-nav change; offline preserved.

- **Core 100 corpus (concept-first).** New authored source `content/core-en/pilot100.ts` (100
  emoji-representable, travel-valuable words — balanced across 13 categories) → pure transforms in
  `corpus.ts` → `build-core-en.ts` emits the canonical `content/concepts/core-en.yaml`
  (ConceptSchema, seeded to Mongo by the existing `seedConcepts`, idempotent) **and** the offline app
  pack `apps/web/public/content/core-en.v1.json` (PWA-precached). The `Concept` schema gained
  additive optional visual fields (`emoji`, `iconEligible`, `visualConfidence`, `rank`, `example`);
  the Mongoose model mirrors them. Hebrew is human-authored, `ai_reviewed` (honest — pending native).
  Methodology + expansion path in **[CORE-100.md](./CORE-100.md)**.
- **Core Words activated.** The Core "Words" category is live (was Coming Soon): `CoreWords.tsx`
  loads the real pack (`shared/content/coreWords.ts`, offline-first) and offers one screen with three
  modes — **Browse** (grouped by category, emoji + word + Hebrew, tap to hear) · **Picture Quiz** ·
  **Swipe Recall**. Reuses the existing Core two-layer navigation; bottom nav untouched.
- **Picture Quiz** on the real source: word → four emoji (deduped distractors, pure `rounds.ts`),
  shared full-context feedback, **no auto-advance**, records a `flashRecall` review event.
- **Swipe Recall** on the real source: persistent "press and hold to reveal" helper, **~0.5 s** hold
  with a fill indicator, release hides, physical-direction swipe (RTL-safe) + mirrored buttons, the
  pure re-queue engine (unknown returns after ~10–15 cards), records a `swipe` review event.
- **Full-context wrong answer (Part C).** New reusable `AnswerFeedback` + pure `answerContext.ts`
  builders now power every exercise (quiz · expected-reply · dialogue · ambush · Picture Quiz). The
  wrong state restores the lost connection: **What you heard** (original prompt + translation +
  replay) → **Your answer** → **What you should answer** (+ translation + replay) → **Why** → Try
  again / Continue (never auto-advances). Fixes the Money & Numbers case ("That comes to fifteen
  fifty…" is shown, so "Fifteen fifty." makes sense). Correct state stays fast.
- **Validation & tests (Part D).** `validatePilot` gates the corpus (exactly 100, unique ids/ranks/
  emoji, required fields) and fails the build on violation. **+17 tests** (corpus 7, Picture-Quiz
  rounds 4, swipe engine +2, answer-context 4 incl. the Money regression). Seed idempotency proven in
  the server suite: first seed inserted 135 concepts, second inserted **0**.

Verification: typecheck 0 · lint clean · **337 tests** (21 files) · production build (**15 precache**
entries incl. `core-en.v1.json`) · SMOKE PASS · dialogue audit 0 blockers · `gen:conversations` zero
diff. Known: Hebrew pending native review; TTS audio (no per-word recordings yet); `npm run pipeline`
still reports **pre-existing** orphan warnings for `missions-core.yaml` phrase concepts (unrelated to
this sprint; the seed path is unaffected). es/fr/it/ar realizations intentionally deferred.

---

## Sprint — Beta Polish (games) + Expression Research (2026-07-11)

Final UX polish before the Core Corpus project. No new systems; no Concept-Layer / Bootcamp / review
behavior changes. Both games stay content-agnostic (Core 100 → 500 → 1500 with zero changes).

- **Picture Quiz is a real game session.** New pure `buildSession(words, size)` (in `rounds.ts`)
  draws a randomized, **no-repeat** set of `size` concepts (default `DEFAULT_SESSION_SIZE`, clamped
  to what's available — never hardcoded at call sites). The component runs Question *i/N* with a
  progress counter → shared full-context feedback (no auto-advance) → review event per answer →
  **Victory** with **Play Again** (fresh session) / **Back to Core Words**. +4 session tests.
- **Swipe Recall feels like Tinder.** The card now **follows the finger** with a live rotate, a
  green/red like-nope stamp whose opacity tracks the drag, **springs back** under threshold and
  **flies off-screen** when committed; the next card animates in. Drag runs through **direct GPU
  `translate3d`+rotate on a ref (no React re-render per move → 60 FPS, no reflow)**; `touch-action:
  none` + `will-change: transform`. Press-and-hold-to-reveal, RTL-safe physical-direction semantics,
  the pure re-queue engine, and review events are unchanged. Buttons still mirror the swipes.
- **Pareto Expression Research** (**[EXPRESSION-RESEARCH.md](./EXPRESSION-RESEARCH.md)**) — a
  report-only audit scoring conversational-glue candidates against the "1 of 30 missions" bar.
  Finding: the winners are short reactive replies (*Sounds good · No worries · That's fine · Of
  course · It's up to you · Never mind · I'm not sure*) + hear-first (*Here you go · Go ahead · Take
  your time*); idioms (*Fingers crossed*, *I had to pinch myself*, …) are rejected. Recommendation
  (future sprint): extend Mission 23 (Small Talk) + add *Never mind* to the Recovery Toolkit — **no
  new mission, no content changed this sprint.**

Verification: typecheck 0 · lint clean · **341 tests** (21 files, +4 session tests) · production
build (15 precache) · SMOKE PASS. Both games shipped through the existing `CoreWords` entry (bottom
nav unchanged). Remaining: haptics/animation feel is best judged on a real device; expression
shortlist awaits native review before any content work.

## Sprint — Core Corpus (Core 500, multilingual foundation) (2026-07-11)

READY's first production corpus: **500 language-independent concepts** replacing the 100-word
pilot, built so that **adding a language is content-only** (the sprint's success criterion).

- **New `content/core-corpus/`** (retires `content/core-en/` builders): authored rows in
  `data/*.ts` (25-category taxonomy) → pure `corpus.ts` (validation · ROL · ranking · realization)
  → `build-core.ts` emits `content/concepts/core-corpus.yaml` (seeded to Mongo idempotently) and
  **one offline pack per declared language** (`core-{lang}.v1.json`, PWA-precached).
- **The Core 100 migrated verbatim** (same slugs/ids/emoji/examples) — no Mongo churn, no orphaned
  review events, no progress reset. `exit`/`where` graduated from `samples.yaml` to the corpus.
- **Two-sided scoring**: every concept carries `s: [freq, comm(say), recog(hear), coverage,
  travel]` + RoF + layer + pos; the schema gained additive optional fields (`pos`, `commScore`,
  `recogScore`, `imageEligible`, `aliases`, `relatedConcepts`, `oppositeConcepts`) and the Mongo
  ConceptModel mirrors them. Selection followed CORPUS-METHODOLOGY v2 (Never-Teach enforced; no
  duplicate of Bootcamp-owned meanings like *thank you / sorry / how much*).
- **Validation gates fail the build** on: wrong total (500) · duplicate slug/surface/emoji ·
  missing gloss/example/scores · invalid category/layer/RoF · broken related/opposite refs ·
  emoji without visual confidence · undeclared/incomplete languages · **cross-file concept-id
  duplicates** across all `content/concepts/*.yaml` (seed integrity).
- **Web**: `loadCoreWords(lang)` + `speak(word, learningLang)` are language-parameterized; pack
  rows have optional emoji — games consume exactly the **218 icon-eligible** words (unique emoji =
  distractor safety); Browse shows all 500 grouped by category. Games/components unchanged.
- **French readiness proven by test**: `core-corpus.test.ts` builds a fake-language pack through
  the production functions; language completeness is a hard validator error. See
  **[CORE-CORPUS.md](./CORE-CORPUS.md)** (philosophy · methodology · how to add concepts/languages).

Verification: typecheck 0 · lint clean · **347 tests** (21 files; 13 new corpus gates; schema
sample tests updated) · pipeline + seed green (Mongo idempotent upsert of all 500) · production
build (15 precache, en pack ~205 KB) · SMOKE PASS. Honest status: Hebrew glosses + realizations
ship `ai_reviewed` pending native review; scores are expert estimates pending the telemetry flywheel.
