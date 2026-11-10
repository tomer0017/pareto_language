# READY — Project Structure & Product Rules

## Mission 11 final artwork (2026-11-03)

The 11 shared semantic slots and 2 result props now use individual final JPEGs.
Approved EN/ES/FR content and all 32 interactions remain unchanged. Exact tip data
and choices remain application UI. See [visual production report](./MISSION11_VISUAL_REPORT.md)
and [asset manifest](./MISSION11_ASSET_MANIFEST.md) for provenance, QA and limitations.
A follow-up CSS correction keeps wide teaching images above their text on desktop;
no learning or architecture change was required.


> **Read this file before starting any development on READY.** It is the permanent source of
> truth for *how the app is built and why*. If a change would improve engineering but hurt
> learner confidence, confidence wins. After a sprint, update this file (see §10).

---

## 1. Product vision

READY is **not** a generic language app. READY helps a **complete beginner** prepare for
**real travel communication** in **minimum time**. The unit of success is not vocabulary learned —
it is a real situation survived.

## 2. Core principle — Pareto 20/80

Every screen and every decision follows the 20/80 rule: **minimum learning time, maximum
real-world confidence**. Every screen must answer: *"What is the fastest way to help this
traveler communicate tomorrow?"* If something exists only because other language apps do it, it
does not belong here.

## 3. Main user goal

A user with **zero English** should be able to study **~20 minutes a day** and feel **confident
handling common travel situations abroad** — ordering, arriving, asking, recovering, connecting.

## 4. Product philosophy

- **Confidence over knowledge.** READY sells the feeling "I can handle this," not a word count.
- **Sentences before isolated words.** The learning unit is a usable line, not a flashcard.
- **Dialogue before vocabulary.** Learners meet phrases inside a live scene, then drill them.
- **Recovery tools are valid answers.** "Sorry, I don't understand / Can you repeat that?" are
  winning moves, not failures. The point is to **never freeze**.
- **Understanding replies > speaking perfectly.** Comprehension of what you'll *hear* is trained
  as a first-class skill (expected-reply drills).
- **Mission completion = surviving a real-life situation**, taken end to end (depth before breadth).
- **Nothing is ever locked.** Completed missions stay replayable forever (watch / read / practice).

## 5. Current app structure (screens)

Primary navigation — **Home · Path · Listen · Profile** (בית · מסלול · להאזין · פרופיל; exactly four
destinations — Stories live inside Listen, words and the sentence library under the Path). ONE model
(`app/nav.ts`) and ONE component (`shared/ui/AppNav`) for every screen size: a floating bottom bar
on phones/tablets, a side rail on desktop (on the inline-start edge — right in Hebrew, left in
English). The bottom bar hides inside a focused flow (an active mission, a game); the desktop rail
stays as a calm way out. READY is used in two modes over the SAME content: **active learning**
(the Path) and **passive listening** (Listen).

- **Home** — the coach, not a menu. It answers "what is the single best thing to do now?" with
  exactly four surfaces: **Travel Readiness** (ring + "X of 30 situations ready", plus "X of Y core
  sentences practiced" read from the real review log; Y is the canonical sentence count — one per
  distinct wording — from `sentenceCatalog`, the same number every screen shows), **Your next step** (the mission to continue
  or start — icon, objective, "Situation N of 30", estimated minutes, one primary button), **Quick
  review** (up to 5 sentences from the learner's own practice log; **hidden** until something was
  practiced — no empty disabled card) and **Quick listen** (10 hands-free minutes). No settings, libraries or
  tools on Home — they live in Learn / Listen / Profile. A brand-new learner additionally sees one
  quiet text link to the zero-beginner path.
- **Travel Readiness (מוכנות לטיול)** — the one progress model: completed missions ÷ the plan's
  length (`features/bootcamp/readiness.ts`, pure). Never "% of a language", never a hard-coded
  number. The detail screen (`readiness` view, opened from Home's ring or Learn's summary) lists
  every situation as ready / in progress / not started. Capability is the motivation — there are
  no points, streaks, hearts or invented achievement badges.
- **Path (מסלול)** — the structured path through the 30 real situations and the ONE route to them
  (labelled "מסלול" / "Path" because everything in READY is learning; internally still the `bootcamp` view):
  a small readiness summary, the plan's phases as groups, compact mission cards (number, the
  mission's own icon, title, objective, status), and exactly ONE card highlighted as "your next
  step". One column on phones, two on tablets, three on desktop. Below the curriculum, a quiet
  **More practice** row: the zero-beginner path, the Foundation building blocks, words, and the
  sentence library — ordinary rows, nothing floating over the mission list.
- **Listen (להאזין)** — passive mode: press Play and learn while driving or walking. Three
  categories — **Core sentences · Dialogues · Stories** — each a playlist built from content that
  already exists (`features/listen/playlists.ts`; nothing is duplicated). A **queue** of topics, a
  **now-playing** card (sentence in its own direction + translation), prev / play / next,
  **Repeats (חזרות)** 1× 2× 3× (how many times a sentence is said — NOT speed), a separate
  **Continuous play (ניגון רציף)** switch, three
  **listening modes** (app language → target · target only · target → app language) and a **Quick
  listen** (10 minutes, then it stops itself). Speech speed is NOT here: the one global speed lives
  in Profile. Desktop uses two columns (queue beside the player). **Stories are surfaced visually**:
  a card with one real story cover (the story being read, else the first unfinished one — from stored
  reading progress) opens the reader directly; "All stories" opens the list. The Videos experience
  and the sentence library are linked under "More ways to practice".
- **Videos** — an experience, not a list: plays a random available mission video, then asks "did
  you understand everything?" → load another random video, or drop into the exact Mission Hub that
  owns the video (Practice / Transcript / Video). Honest empty state. Videos ship for EN Missions
  1–3, 6–9, 14, ES Missions 1–7 and FR Missions 1–3, 5, 6, 9, 14 (whatever files exist under
  `public/videos/{language}/`, discovered at build time per learning language); missions without one show "Coming soon".
- **Bootcamp** — the heart of the product: the **Core 30**, a 30-mission journey in 5 phases
  (Foundations → Arrival → Everyday Life → City & Conversation → Mastery). **Mission 1 = Introduce
  Myself**, Mission 4 = Everyday Core (want / need / have / can), Mission 30 = A Complete Day Abroad
  Alone; checkpoints (cold integration days — they test, never teach) at **10 / 18 / 24 / 30**.
  Missions 28–30 teach nothing: 28 is heard only (no transcript, no translation before the answer),
  29 is one evening, 30 is one whole day of real decisions.
  Pareto-first: reusable sentence frames before nouns, and human conversation (plans, home, hobbies,
  past, future, opinions) alongside travel survival. Missions outside the Core live in the **Extended
  Mission Pool** (`EXTENDED_POOL`; content kept in `extended.ts`, never shown). The former
  **Recovery Toolkit** mission is **removed** — no mission, special card, checkpoint or progress slot;
  the header reads "0 of 30 missions" for a new learner. The shared recovery phrases remain only as
  reusable lines inside other missions (`recovery.ts`, `fr/recovery.ts`, `es/recovery.ts`).
  Identity vs. order: each plan entry has a stable semantic `id` (`introduce-myself`, …) that
  persisted progress is keyed by; the display number is derived from plan order
  (`missionNumber()`); `day` is only the content-registry key. `BOOTCAMP_PLAN` is the single source
  of truth for count and order — nothing else hard-codes 30.
- **Foundation** — a row in the Path's "More practice" section (no longer a floating button; historically an action button on the Bootcamp map, hidden inside an active mission,
  via the pure `shouldShowFoundationFab`) opening a reusable bottom **Sheet**: 10 building-block
  categories → word list → word page (translation · audio · frequency · example · related missions).
  It is a **data-driven VIEW over the Core Corpus** — categories are declared as DATA in
  `features/foundation/taxonomy.ts` (selectors over the language-independent `category`/`pos`/
  `conceptId`), the model is pure (`foundationContent.ts`), and words come from
  `loadCoreWords(learningLang)`. So it never duplicates content, scales to thousands of words with no
  UI change, and works for EN + FR (and any future pack) through one code path. No progression/gating.
  It also powers **Universal Tap** (every Core word in dialogue/flashcards/Core/mission drills is
  tappable → the SAME sheet, via `TappableText`/`corpusIndex.ts` + `foundationStore.openWord`),
  **Smart Detection** (`FoundationHint` — a non-blocking nudge for the first unviewed brick in a
  mission; once all bricks are learned it stays as an always-available **Review** action that reopens
  the guided session in review mode, never resetting progress), and **Progress**
  (`foundationProgress.ts`, per-category + overall, persisted `viewed`/
  `dismissed`). One shared word sheet + one `SpeakerButton`; nothing duplicated.
- **Library (formerly the "Core" tab)** — a SECONDARY screen under Learn (words + sentence library),
  not a navigation destination; its content powers Learn, Listen and Quick Review. Conversation-help
  phrases are the last group ("עזרה בשיחה"), never first. Historical description of the surface: a grid of
  **category cards** (📖 Core Phrases · 📝 Core Words · ❓ Common Questions · 🚨 Emergency · 🧩 Core
  Patterns · ⭐ Favorites) → the existing tabbed page opened on the chosen category (top tabs +
  content), with a back button to the cards. **Core Phrases** is live (every sentence READY teaches,
  grouped by mission, tap to hear) and **Core Words** is now live too — the **Core 100** emoji pilot
  (`CoreWords.tsx`) with four modes on one screen: Browse · **🎧 Listen Mode** (Parrot Mode) · Picture
  Quiz · Swipe Recall (see **[CORE-100.md](./CORE-100.md)**). **Core Phrases** also hosts **🎧 Listen
  Mode**, **🎴 Sentence Flashcards**
  (`SentenceFlashcards.tsx` + pure `flashcards.ts`): flip / hear / next-prev / shuffle / direction
  toggle over the SAME canonical mission sentences (`buildSentenceDeck` reuses item ids — no
  duplication), per-language, shuffled per session. The rest stay honest "coming soon". The chosen
  category lives in `appStore.coreCategory`. Not "1500 words" yet — a validated 100-word pilot.
- **Mission vocabulary priming** — a `{ kind: 'prime' }` mission step ("Before we speak") teaches 3–8
  building-block words before a longer sentence, optionally assembling into a canonical mission
  sentence, with a ♻️ review hint for words seen earlier (`primeVocab.ts`). Primed: **registry keys 1–7 + Everyday Core**
  (all languages in parity). Every mission's priming decision is recorded and test-bound in `vocabAudit.ts`
  (30 audited · 8 primed · 22 no-priming-needed). Essential connectors/sizes (`with/without/and/or/
  here/there/can/more/less/medium/large`) are now **global Core** concepts (corpus 633, incl. the
  Core World Vocabulary Phase 1 — everyday world nouns/verbs that recur in beginner stories). French
  numbers (70/80/90 vigesimal) live in `fr/frenchNumbers.ts`. See **[VOCABULARY-AUDIT.md](./VOCABULARY-AUDIT.md)**.
- **Randomization** — one tested seeded shuffle (`shared/util/shuffle.ts`, Fisher–Yates + `mulberry32`)
  backs all answer-option / distractor / review ordering (games, quizzes, flashcards, session builder).
  Narrative dialogue order is never shuffled; only options and review order are.
- **Profile** — the one home for settings: trip language, app language, the single global
  **speech-speed** (80–105%, default 95%) + Test Voice, appearance (light/dark) and honest "coming
  soon" account rows. Theme and speed are no longer on Home.
- **Mission overview** — ONE guided path, with ONE primary button: **Watch** (the video; with no
  video, **Listen** to the conversation in the transcript reader) → **Learn** (the words, sentences
  and expected replies) → **Practice** (respond) → **Watch again** (the reward). The journey is
  shown as a short list, but a first-time learner never chooses between "Learn" and "Practice":
  the button always runs the next step ("start" / "continue learning" / "continue to practice"),
  and after the first viewing the video offers one way forward — never an "I understood
  everything" shortcut. Once the mission is COMPLETED the steps become shortcuts for revisiting.
  Learn and Practice are entries into the SAME unchanged step-flow (`missionFlow.ts`); cold
  checkpoints have no Learn step. "Watched" is not stored, so the Watch step is ticked only for a
  viewing in the current visit. The transcript stays one quiet tap away.
- **Practice** — the Bootcamp step-flow (talk → tools → expected-reply drills → quizzes →
  dialogue → sentence review → cold open → victory). Unlimited repeats; never "finished."
  Listening is **one screen** (play → transforms in place when audio ends → sentence + Continue,
  no "tap when ready" gate). A **started** mission asks *Continue vs Start over* before resuming.
  Every answer runs the **one global feedback system** (`shared/ui/feedbackCue` + `Feedback` +
  `.fx-*` motion + `shared/audio/sfx`): correct = chime/green glow, wrong = tone/shake + a
  redesigned **wrong-answer view** (your answer · right answer · one-line Why? · Try Again / Continue).
- **Transcript** — the full conversation as a premium bilingual reader with per-line replay and the
  current line highlighted + auto-scrolled. Its playback is driven by the shared **Parrot Mode**
  engine (`shared/playback`), so it gains repeat ×1–3, sequential/random and translation on/off
  alongside play / pause / resume / restart — the same controls Core Words & Core Sentences use.
- **Video** — the full-conversation video (manual play, inline, replayable). EN Missions 1–3, 6–9, 14
  , ES Missions 1–7 and FR Missions 1–3, 5, 6, 9, 14 ship one (`videos/en/en_7.mp4` = Taxi, Mission 7); others show Coming Soon. Missing/broken
  video degrades gracefully.
- **Victory Screen** — completion **celebrates** with minimal reading (Pareto): confetti +
  "{Mission} completed!" + three **large action cards** (Watch Conversation · Open Transcript ·
  Practice Again). Evidence is not a wall — it is collapsed behind a tiny **"What did I learn?"**
  toggle (skill · mastered phrases · receipts). Next Mission stays a quiet ghost action.

## 6. Learning flow (intended order)

**Watch / listen → Understand → Practice → Reply → Recover → Review full conversation → Repeat.**

The emotional loop of a mission: watch the conversation and understand almost nothing → practice
→ watch again and realize "now I understand it." The dialogue player still supports an opt-in
**coaching mode** (`dialogue.coaching`: picks reframed as *more or less useful*, never right/wrong),
but no current mission enables it — it belonged to the retired Recovery Toolkit mission.

## 7. Architecture overview

- **React app (`apps/web`)** — Vite + React 18, mobile-first, RTL-aware, PWA. Screens live under
  `src/features/*`; shared UI/audio/i18n/stores under `src/shared/*`; app shell in `src/app/`.
- **Zustand stores** — `shared/stores/appStore.ts` (routing/`view`, user, content pack, `theme`,
  `uiLang`, `learningLang`, `coreGameActive`), `features/bootcamp/bootcampStore.ts` (active mission,
  hub/play `stage`, progress + receipts in **localStorage** — `ready.bootcamp.v2.<lang>`, keyed by
  stable mission id via the pure `progress.ts`; v1 day-number data migrates once), `shared/stores/sessionStore.ts`. Single
  sources of truth — no duplicated navigation/settings/state. **Nav visibility** is a pure rule
  (`app/nav.ts`: `PRIMARY_TABS`, `navTabOf`, `shouldShowNav`, `hasAppShell`): the bottom bar hides inside any focused full-screen flow
  — an active Bootcamp mission **or** an active Core learning-game session (`coreGameActive`), so a
  game's fixed action zone (Continue) is never occluded by the higher-z nav.
- **Bootcamp data files** — **pure data** (no React, no store), registered in `registry.ts`'s `DAYS`
  by `day` (a stable registry key, not the mission's position). Hand-written missions are
  `features/bootcamp/dayN.ts` (+ `fr/`, `es/`); missions authored once for every language are
  `features/bootcamp/core/*.ts` specs built by `author.ts`. `plan.ts` = 30-mission metadata (stable ids + order)
  + the Extended Pool; `types.ts` = the
  content model; `transcript.ts` = happy-path linearizer; `recovery.ts` = the shared survival kit.
  A mission is data; the generic MissionPlayer renders it.
- **Reusable UI/feedback (`shared/ui`, `shared/audio/sfx.ts`)** — `Modal` (confirm/choice dialogs),
  `Feedback` + `feedbackCue` + `sfx` (the single success/error system: burst + glow/shake + chime/
  tone + haptic, synthesized offline, wired through every drill). New patterns compose here first.
- **Learning games (`features/games/*`)** — content-agnostic games mounted in **Core Words** on the
  real **Core 100** (`shared/content/coreWords.ts` → precached `core-en.v1.json`); both scale to Core
  500/1000/1500 with no changes and record review events via `shared/review/recordReview`.
  **Picture Quiz** is a full session (pure `rounds.ts` `buildSession(size)` — randomized, no-repeat,
  configurable/clamped) → progress → shared feedback → Victory (Play Again / Back). **Swipe Recall**
  is a **Tinder-style** card (finger-following drag with live rotate + like/nope stamp, spring-back,
  fly-off; drag via direct GPU `translate3d` on a ref for 60 FPS) over a **pure, unit-tested re-queue
  engine** (unknown returns after ~10–15 — the SRS seam) with press-and-hold reveal. The card shows
  the **learner-language meaning below the icon before reveal** (pure `cardFace`) so an ambiguous
  emoji is never a guess; the target word waits for the hold. Both games take a `lang` prop and
  speak the active learning language (not hardcoded English). Both share the
  reusable **`AnswerFeedback`** + pure `answerContext.ts` builders (the full-context wrong-answer
  model, also used by every Bootcamp drill). The old `mockWords` remains for isolated tests only.
- **Core Corpus (`content/core-corpus/*`, `content/concepts/core-corpus.yaml`)** — the production
  **Core 633**: authored concept rows (`data/*.ts`, 25 categories, five-part scorecard
  freq/comm/recog/coverage/travel + RoF/layer/pos) → pure `corpus.ts` (validate · ROL · rank ·
  realize) → `build-core.ts` (`npm run build:core`) emits the canonical concepts YAML (seeded to
  Mongo via `seedConcepts`, idempotent) and **one offline pack per declared language**
  (`core-{lang}.v1.json`, PWA-precached). Concept-first: gloss stored once; adding a language =
  realizations + declaration, **zero code** (proven by test). The `Concept` schema carries additive
  corpus fields (`pos`, `commScore`, `recogScore`, `imageEligible`, `aliases`, `relatedConcepts`,
  `oppositeConcepts`). The Core 100 pilot migrated in with identical ids. See **CORE-CORPUS.md**.
- **Content schema (`packages/content-schema`)** — `ContentPack` / `ContentItem` / `Situation` /
  memory + review types shared across web, server, engine, and the pipeline.
- **Concept Layer + Pipeline (`content/`)** — the corpus → concepts → phrases → validated pack
  toolchain (`content/pipeline`, `content/build.ts`, `content/concepts`, `content/core-en`). It
  currently builds the **Italian `it-IT` pack** into `apps/web/public/content/`. This is the
  content infrastructure — do **not** bypass it to hardcode content-pack material.
- **MongoDB (`server/`)** — the API + seeders (`contentApi`, `seeders`). Optional for the pilot:
  the web app is local-first and the Bootcamp needs no server. `ApiProvider` is used only when
  `VITE_API_BASE` is set (server pack → IDB cache → static fallback + background sync).
- **Offline / PWA** — `vite-plugin-pwa` precaches the app shell + content JSON; `LocalProvider`
  (IndexedDB, via `@ready/data`) holds users/plans/events/packs and projects memory state offline.
  Videos are **runtime-cached** (not precached — too large) so first load never waits on them.
- **TTS / audio (`shared/audio/tts.ts`)** — Web Speech with a Chrome keep-alive + visibility
  resume (the "works then stops" fix), a gesture unlock, and the **single global speech-rate**
  multiplier (`getSpeechRate`/`setSpeechRate`) applied to every `speak()`. Asset-first, TTS fallback.
- **Videos** — `apps/web/public/videos/{language}/{language}_{displayedMissionNumber}.mp4`, discovered at build
  time (`apps/web/videoManifest.ts`) and resolved by `features/videos/missionVideo.ts`. Adding a video
  is dropping a correctly named file into the folder; no code or mission file changes.

## 8. Important constraints (rules for every future change)

**Before every future development, read this file.** Then:

- Do **not** break Bootcamp logic (missions, hub, player, victory, replay).
- Do **not** bypass the content pipeline; do not hardcode content-pack material.
- Do **not** hardcode language assumptions. Keep the **English pilot honest**: other languages are
  "coming soon" unless real content actually exists.
- Keep **offline** working. Keep **mobile-first**. Keep **RTL** working (en + he UI).
- No **fake native review** — Hebrew/target content is AI-drafted until a native reviewer signs off.
- No **meaningless gamification**. No **unnecessary architecture changes**.
- Prefer reusable components; avoid duplicated state, navigation, or settings.
- Do not change Mongo / Concept Layer / pipeline / review engine as a side effect of UX work.
- **Any-to-any rule (multilingual):** before every multilingual change, verify it works for an
  **arbitrary (app-language × learning-language) pair** and assumes neither English nor Hebrew.
  Content is **concept-first** — realizations per language, gloss = the same concept in the app
  language, never English-as-bridge. Use `shared/i18n/display.ts` (`resolveDisplay`) as the display
  rule and `assertPairsComplete` as the leak gate. Any language-capability change updates
  **[MULTILINGUAL-ARCHITECTURE.md](./MULTILINGUAL-ARCHITECTURE.md)** and `npm run parity`.

## 9. Current pilot state

- **English pilot is active.** English is the default and only selectable trip language.
- **Bootcamp is the main product** and the landing experience (via Home).
- **A full English content pack is not yet complete.** The Words / Phrases / Situations / daily
  Mission tabs are content-pack driven and are therefore gated to an honest "coming soon."
- **Italian / Spanish / French / Arabic are not active yet.** Only the Italian `it-IT` pack is
  actually built (used by the pipeline/server), and it is **not user-facing** in the pilot. A
  **French foundation** exists (validated 17-concept proof slice + partial-pack validator gate) but
  French stays `available: false` and out of `DECLARED_LANGS` until a reviewed Core 500 + Bootcamp
  ship — see **[FRENCH-PILOT.md](./FRENCH-PILOT.md)**. `validateCorpus(rows, size, declaredLangs)`
  proves no half-French pack can build.
- Existing **multilingual infrastructure exists** (language registry, per-language theming, RTL,
  the content-pack chain) but is intentionally not fully surfaced until real content ships.

## 10. Update rule

**After every future sprint, update this file** if any of these changed:

- app structure / screens
- navigation
- data model
- learning philosophy
- content pipeline
- language support
- Bootcamp behavior

And regenerate the content review surface when Bootcamp content changes:

```
npm run gen:conversations   # rewrites docs/BOOTCAMP_CONVERSATIONS.md from source
npm run gen:dialogues-doc    # rewrites docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md (EN / FR / ES / HE, test-bound)
npm run export:dialogues     # cinematic screenplays per language → exports/ (dev tool, see DIALOGUE-EXPORT.md)
```

---

_Companion doc: **[BOOTCAMP_CONVERSATIONS.md](./BOOTCAMP_CONVERSATIONS.md)** — every mission's
phrases, expected replies, recovery tools, cold opens and dialogues, auto-generated from source
for human content review._


### Mission 08 visual integration update (2026-10-29)

Hotel Check-in now has a shared EN/ES/FR hotel artwork system, deterministic floor/room/hour
controls and a 2×2 progressive stay summary. Dialogue, learning order and 34 interactions are
unchanged. Mobile verification and release status: [Mission 08 visual report](./MISSION08_VISUAL_REPORT.md).

## Mission 09 final visual integration — 2026-11-02

Mission 09 now uses 13 canonical semantic images, 2 prop images and 2 supplemental scenes, shared across EN/ES/FR. One continuous store environment replaces the cell-map presentation; four equivalent hit areas retain semantic answer IDs. The ordered S/M/L/XL ladder marks M as current, discounts remain equal text tiles, and Shopping Journey retains its compact grid and reveal timing. Approved dialogue and all 33 interactions are unchanged. Optional talk/receipt images and the opt-in `shopping-store` presentation leave other missions unchanged. See [the visual report](MISSION09_VISUAL_REPORT.md) for validation and asset inventory.

## Mission 10 — Arrival Day, adaptive checkpoint — 2026-11-02

Mission 10 (CHECKPOINT: Arrival Day) is now an ADAPTIVE checkpoint: retrieve first → repair only what
fails → retrieve again in context. One new step kind, `checkpoint`, runs a pure, data-driven state
machine (`features/bootcamp/checkpoint.ts`): DIAGNOSTIC (the whole day: 🛂 border → 🚕 taxi → 🏨 hotel,
14 interactions, nothing taught first; a miss gets one quiet beat — line, meaning, audio — and is
recorded by CONCEPT) → QUICK FIX (only the missed concepts; one supported retry; skipped entirely on
zero misses) → ONE-TAKE (the whole day, no help) → FINAL REPAIR (a card + one retrieval per one-take
miss, until the queue is empty) → 🌍 ARRIVAL DAY COMPLETE. 16 concepts (11 production, 5 comprehension
captures: fare €15 + traffic, room 204 + floor 2, breakfast 7–10, never on screen before their line).
Mastery = every concept answered right at least once with its answer not on screen — no score.
State is plain JSON, saved per mission by the store (`ready.bootcamp.checkpoint.v1.<lang>`), so the
video overlay, leaving and reloading resume exactly; restart / a fresh entry / completion clear it.
Content: `core/arrivalDay.ts` (locked EN/ES/FR dialogue; learner lines are Missions 06–08's sentences,
same id and wording; recovery beats and the elevator ambush removed). Checkpoint-only transparent
recombination: `checkpointAudit.ts` (`learnedBefore` / `unprepared*` unchanged). No new artwork:
M07's road pictures, M08's elevator panel, figures as UI. Strong learner: 28 interactions; gaps add
only their repairs. Tests: `mission10.test.ts` (71); Missions 01–09 and 11–30 byte-for-byte unchanged.

## Mission 11 — Small Talk & Recommendations, full learning flow — 2026-11-03

Mission 11 is rebuilt around its LOCKED EN/ES/FR conversation (unchanged wording) as conversational
RHYTHM: Connect → Share (answer + bounce the question back) → Ask (the learner's own initiative after
"the food here is wonderful") → Close. Journey: `practiceSmallTalk.ts` (`m11Steps`), wired through the
spec (`core/smallTalk.ts`, new optional `facts` / `image` on `MissionSpec`). Briefing = the brief's
Hebrew line + traveller card (🇮🇱 Israel · 🧳 First visit) — nothing about the local, the food or the tip.
Each beat: whole-line cards with their meaning → answered. Partial prior learning: "I'm from Israel." and
"Yes, it's my first time here." (Mission 01, verified by `learnedBefore(lang, 11)`) are ♻️ review cards;
"How about you?" gets its own card; the request builder keeps the prior "Can you" apart from the new
"recommend a place". Mama Rosa / the Old Town first appear on the recommendation card; the Local Tip
("📍 Local tip: ?") fills only after the capture (place, then area; later one combined tap). Then the
local's goodbye by ear → supported
conversation (flow stages + tip card on screen) → the conversation (each turn a real decision; a miss is
re-asked slowly) → no help (natural speed) → video (none recorded yet: safely skipped) → final →
💬 SMALL TALK COMPLETE · 📍 LOCAL TIP FOUND: Mama Rosa · Old Town. 32 interactions. Removed: the
"repeat" recovery tool, the alternative answers, the quiz/tools/review/speed-chain shape and the
unrelated "How long are you here for?". Coverage: `mission11Coverage.ts` (24 chunks, all covered), now
also feeding `learnedBefore` for later missions. Artwork: 11 slots + 2 result props, emoji
PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION11_ASSET_MANIFEST.md`. Tests:
`mission11.test.ts` (61); Missions 01–10 and 12–30 byte-for-byte unchanged (the old "11–30" pins now
pin 12–30).

### Mission 11 cleanup — invented line removed — 2026-11-03

"You should try the old town." (`reply.talk.you-should-try`) was not part of the locked conversation; it
had been kept only so that Mission 24's "You should take the boat tour." would count as recombination.
Removed from Mission 11 entirely (items, the by-ear drill, generated docs). The by-ear drill is now one
listening check on the local's goodbye (its other meanings are the local's own lines): 32 interactions.
Rule: a later mission's need never justifies inserting language into an earlier one. Mission 24 is
unchanged; "should" (devriez / debería) is not verified prior learning before it in any language, and its
strict vocabulary test now records that gap explicitly (FR devriez, ES debería; EN "should" is met only
in Mission 15's dialogue, which does not count as teaching) until Mission 24's design pass teaches it.
`mission11.test.ts`: 66 tests (incl. the canonical transcript, byte-identical to before the rebuild).

## Mission 12 — Time & Plans, full learning flow — 2026-11-05

Mission 12 is rebuilt around its LOCKED EN/ES/FR conversation (transcript byte-identical to before) as
MAKING PLANS, not clock vocabulary: "We made plans for tonight and tomorrow." Journey:
`practiceTimePlans.ts` (`m12Steps`), wired through the spec (`core/timePlans.ts`). Briefing = the brief's
Hebrew line + the traveller's own availability (☀️ this morning open · 🌙 tonight free · 🌅 tomorrow free)
— nothing the friend will propose. New deterministic UI, rendered by `HotelStaySummary.tsx`
(`splitTimeBoard`): the **Time Strip** (Now · this morning → later → tonight → tomorrow morning; the
current period highlighted; never a fact) and the **live planner** (Tonight: Plan ? / Time ? ‖ Tomorrow:
Plan ? / Meet ?), filled only after the line that reveals each fact: dinner · centre after the
invitation, 20:00 after "At eight" (captured as plain 18:00 / 20:00 / 22:00, no clock), the beach after
the tomorrow-morning line, "leaving early" (no hour) after "we leave early", and "Meet here · 07:00" only
after the LEARNER says "Let's meet here at seven" (their plan, not news). Prime intros now go through
`HotelStaySummary` too (plain text renders exactly as before). Teach once, then transfer: "I'm free
tonight." has a card; "Yes, I'm free tomorrow." has none — it is retrieved against "I'm free tonight";
"What are you doing tomorrow?" is shown beside the friend's own today / tonight questions, then one
swap. One builder: "No problem. / Let's meet / here / at seven." in each language's own chunks (new item
`phrase.time.no-problem-meet` = the locked line). Then the supported conversation (strip + planner) →
the conversation (each turn a real decision; a miss is re-asked slowly) → no help → video (none
recorded: safely skipped) → final ("close your plans") → 📅 PLANS MADE. 32 interactions. Removed: the
"repeat" recovery tool, the alternative "When?", the old review/speed shape and the invented "At ten" /
"At five" times. Prior learning (`learnedBefore(lang, 12)`): numbers, here, centre, eat, come, do you
want, great, perfect; "No problem" (EN/FR only) and "It's very good" (EN/FR) are partial prior. Sentence
ids reused by the Everyday checkpoint are unchanged. Coverage: `mission12Coverage.ts` (26 chunks, all
covered), feeding `learnedBefore` for later missions. Artwork: 14 slots + 1 result prop, emoji
PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION12_ASSET_MANIFEST.md`. Tests:
`mission12.test.ts` (72); Missions 01–11 and 13–30 byte-for-byte unchanged (the old "12–30" pins now pin
13–30).

## Mission 13 — Home, Family & Daily Routine, full learning flow — 2026-11-06

Mission 13 is rebuilt around its LOCKED EN/ES/FR conversation (transcript byte-identical to before) as ONE
home visit — no rooms or family list, no "going to" grammar. Journey: `practiceHomeFamily.ts` (`m13Steps`),
wired through the spec (`core/homeFamily.ts`). Briefing = the brief's Hebrew line only (no mother, kitchen,
grandmother, tiredness or sleep). The **Home Visit board** (Home: Room ? / Family ? ‖ My evening: Dinner ? /
Feeling ? / Next ?) fills only when the visit reveals it: the living room after the friend's line, mother →
kitchen after the friend says it (captured on semantic room tiles — ids `living-room` / `kitchen`, app-language
captions, shuffled), and dinner → grandmother's, tired, next → home → sleep only after the LEARNER says them.
The **evening route** (🧭 Now: Friend's home → Home · rest → Dinner at grandmother's → Sleep) appears once the
learner says they are going home. The board parser in `HotelStaySummary.tsx` now takes any number of rows per
column and a 🧭 route (Mission 12's planner parses exactly as before). Learner initiative: the sofa and family
questions follow statements, never questions. The one builder is the polite decline (Thanks, but / I'm going to
eat / at my grandmother's — each language's own chunks; new item `phrase.home.thanks-but-grandmothers` = the
locked line). A **Flex Round** (2 interactions: "My mother is in the living room." by ear; after dinner → "I'm
going to sleep.") recombines only words Mission 13 taught and is marked `transferOnly` (new optional step field):
`teachingEncounters` and coverage `encounters` skip it, so it never becomes prior learning, coverage or a course
sentence. Then the supported visit → the conversation (real decisions; a miss is re-asked slowly; the recovery
tool is gone) → no help → video (none recorded: safe skip) → final → 🏠 HOME VISIT COMPLETE. 34 interactions.
Prior learning (`learnedBefore(lang, 13)`): Thanks, "Where is", "I'm going" (EN) / je vais / voy a, eat, with us.
Sentence ids reused by the Everyday checkpoint are unchanged. Coverage: `mission13Coverage.ts` (27 chunks, all
covered, identical with or without the Flex Round). Artwork: 12 slots + 1 result prop, emoji PLACEHOLDERS —
VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION13_ASSET_MANIFEST.md`. Tests: `mission13.test.ts` (68);
Missions 01–12 and 14–30 byte-for-byte unchanged (the old "13–30" pins now pin 14–30).

**Word senses (2026-11-06 fix): same form ≠ same meaning.** Prior learning used to compare bare surface forms,
so French "cuisine" (food, Mission 11: "la cuisine ici est excellente") counted as prior for Mission 13's
"dans la cuisine" (the kitchen). `priorLearning.ts` now has a small sense registry (`WORD_SENSES`: form →
senses, each recognised by cue chunks of its line). A registered form is tracked as `form#sense`
(`cuisine#food`, `cuisine#kitchen`) by `senseWords`, `learnedBefore` (words and `knowsChunk`) and
`unpreparedWords(day, prior, lang)`; a line that decides no sense (`#?`) never counts as learned and is always
flagged. Same form + same meaning is still prior; same form + another meaning is NEW. French kitchen "cuisine"
is now taught by Mission 13's own mother → kitchen card; it is prior from Mission 14 on. Tests: Mission 13 76.

**Mission 14 — Restaurant Meal (registry key 4), 2026-11-09.** One ordinary sit-down meal, deliberately SHORT
(26 interactions: 5 teaching · 5 Waiter Signals · 1 Flex · 5 supported · 5 no help · 5 final). The locked
dialogue is unchanged word for word (transcript fingerprint identical); the tree changed on purpose: every turn
is a real decision (a miss is re-asked slowly), the pasta and "one moment" branches are gone, and the door keeps
its one recovery move ("I don't understand" → "A table? For how many people?" — the only Core turn where it is
met; Mission 28's word audit relies on it). Journey (`practiceRestaurant.ts`, shared by EN / ES / FR): briefing
(two of you, no reservation, chicken without onions, water) → door cards + "a table for two" → table cards ("Are
you ready to order?" = the waiter wants your food order) + the ONE builder (I'll have → the chicken, → without
onions, please.) → drink cards + water → "Anything else?" → "That's all, thanks." (Mission 03's own sentence
`phrase.coffee.thats-all`: used, never re-taught) → "Coming right up!" → ⏳ Later… → "Is everything okay?" →
"Yes, that was delicious! The bill, please." → WAITER SIGNALS (one fast board: what does the waiter want now?
table / food / drink / more / meal check) → FLEX (transferOnly, one round: "a table for four" by ear — "four"
is verified prior learning, "three" is not) → supported meal → conversation → no help → video (EN / FR exist, ES
safe skip) → final → 🍽️ MEAL COMPLETE. The **Restaurant Ticket** (Table / Main / Change ‖ Drink / Order / Bill)
fills only when the learner has said each fact; "Later…" is a scene cue only (app-language note + `mealPhase`
eating → bill), never spoken, never a sentence, never prior learning or coverage. Coverage:
`mission14Coverage.ts` (26 chunks: covered here, verified prior, or context-only waiter lines with nothing to
answer). New sentence `phrase.rest.chicken-no-onions` (the builder's exact line). The board parser treats a row
ending " —" as not yet known. The companion's first visual-board hint for this mission is the waiter's intent
(`MISSION_GAME_INTRO`), not "hear the price". Artwork: 10 slots + 1 prop, emoji PLACEHOLDERS — VISUAL
PRODUCTION REQUIRED (Astra pass): `MISSION14_ASSET_MANIFEST.md`. Tests: `mission14.test.ts` (71); Missions 01–13
and 15–30 byte-for-byte unchanged (the old "14–30" pins now pin 15–30).

**Mission 15 — Food Preferences & Allergies (registry key 13), 2026-11-09.** A deliberately SMALL survival mission
(20 interactions: 1 kitchen check · 4 "What do you do?" situations · 5 supported · 5 no help · 5 final; no Flex).
The locked dialogue is unchanged word for word (transcript fingerprint identical); the tree changed on purpose:
every turn is a real decision (a miss is re-asked slowly), the "Is this spicy?" branch and the repeat / slowly
recovery branches are gone, and a polite "Thank you!" to "Any other allergies…?" keeps its own follow-up ("…is
there anything else I should know?" — Mission 24's word audit relies on its "should"). Journey
(`practiceAllergies.ts`, shared by EN / ES / FR): briefing (the learner's own needs) → cards: "Are you ready to
order?" (Mission 14; in FR / ES the singular "prêt" / "listo" is new, so it is shown once as the allergy card's
context) + "I'm allergic to nuts." → "Any other allergies…?" + "I'm vegetarian." → the kitchen-check line, then
ONE comprehension board: what did the waiter say about the nuts? (not known yet — the kitchen will check) →
"Does it have dairy?" + the cream answer → "I'll tell the kitchen" / "I'll check with them and come right back"
→ WHAT DO YOU DO? (nuts → allergy, no meat → vegetarian, dairy → the question, onions → "Great. Without onions,
please.") → supported → conversation → no help → video (none recorded: safe skip) → final → 👨‍🍳 KITCHEN CHECK
SENT. "Without onions", "Great", please and "Thank you!" are verified prior: retrieved, never re-taught (no card,
no builder). **Safety:** the **Food Check** (My needs ‖ What the waiter said) fills only from the waiter's lines;
the nuts go from "?" to "Kitchen checking…" and STAY there — the state's nut status has no "safe" value, and no
copy, tile, receipt or result says safe. The board parser treats a row ending "…" as still pending. Six
off-scope sentences (is-spicy, not-spicy, contains-nuts, let-me-check, make-without, anything-else-allergic) are
archived in `retired.ts`; six whole waiter lines are new hear items. The companion's board hint is "Hear the waiter
— and tap what he really said." Coverage: `mission15Coverage.ts`. Artwork: 5 slots + 1 prop, emoji PLACEHOLDERS —
VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION15_ASSET_MANIFEST.md`. Tests: `mission15.test.ts` (61);
Missions 01–14 and 16–30 byte-for-byte unchanged (the old "15–30" pins now pin 16–30). The same release commits
the user's re-recorded videos en_1, en_2, en_3, en_6, en_7, fr_3, fr_5, fr_6 (verified H.264 / AAC, byte-exact).

**Optional exposure ≠ guaranteed learning (2026-11-09 fix).** Mission 15 keeps its optional branch (a polite
"Thank you!" → "…anything else I should know?"), but nothing the learner can skip counts any more: coverage
(`encounters`) counts only a conversation's guaranteed path (`cinematicTranscript`) — and only lines the learner
actually picks as retrieval — and the City-phase word audit (`practiceCity.test.ts`) counts only that path as
"met". `learnedBefore` already ignored conversations entirely, so "should" was never verified prior learning —
only that test-level "met" audit had leaned on the branch. "should" / "devriez" / "debería" is now NEW in Mission
24 (City & Conversation): one context card (`SceneSpec.prime`, a generic checkpoint option) shows "You should
take the boat tour." right before the chat that uses it — no grammar. Missions 01–23 and 25–30 byte-for-byte
unchanged; both locked dialogues unchanged. The same rule surfaced one recorded gap: French "celui(-là)" in
Mission 19's fast correction is met only in Mission 19's own optional branch (flagged in its test; the answer there
is "Can you repeat?").

**Mission 16 — Hobbies & Free Time (registry key 33), 2026-11-10.** SHORT, VISUAL, TRANSFER-DRIVEN: a reusable
preference system (ask what someone does for fun → love / like / don't like → usually + when → want to try → ask
back), not a hobby word list and no grammar (no like + -ing, want + infinitive or frequency adverbs). 22
interactions (10 teaching · 5 no help · 7 final) + the conversation, run ONCE (supported, translations on); no
Flex, no builder, no review deck. The locked dialogue is unchanged word for word (transcript fingerprint
identical); the tree changed on purpose: the "what-mean" recovery branch is gone and every turn is a real decision
(a miss is re-asked slowly). Journey (`practiceHobbies.ts`, shared by EN / ES / FR; the spec is still
`core/hobbies.ts`): briefing (the learner's own preferences, the brief's Hebrew) → whole-line cards for each
function → **SORT YOUR HOBBIES**, the one game: five moments, one per hobby, each identical (the hobby's picture
above four category tiles LOVE / LIKE / DON'T LIKE / WANT TO TRY; the learner HEARS their own line and places the
hobby) → a Morning / Afternoon / Evening time choice for "I usually draw in the evening" → one "too" reply → the
diving school (comprehension card) → **"Do you like diving?" with NO card** — built from the friend's "Do you
like ___?" (asked three times) and "diving" (coverage: `M16_TRANSFER`) → the plan (one check: tomorrow) → the
conversation → no help (love · when · don't like · want to try · ask back) → video (none recorded: safe skip) →
final (ask · love · like · when · don't like · want to try · ask back) → 🎯 FREE TIME MATCH. **My Free Time** (a
two-column board: yours ‖ your friend's, plus the plan route) starts empty and fills only as the mission
reveals it: your hobbies when YOU place them, Drawing → Evening after the time choice, the friend's facts when
the friend says them; serialisable state `freeTimeState` (hobbyPreferences love / like / dislike / wantToTry,
drawingTime, friend, divingSchoolKnown, tomorrowPlan). Verified prior (`learnedBefore(lang, 16)`): Hi, Yes, No,
Great, Nice, "I like", and "Do you like" in English. One generic addition: `VisualMatchRound.picture` (what a round
is about, drawn above the tiles, never an answer). Learner sentence ids unchanged (the Everyday checkpoint's two
reuses intact); the friend's lines are whole-line hear items (four ids kept with their whole line, four new);
"Me neither!" alone is archived in `retired.ts`. Coverage: `mission16Coverage.ts`. Artwork: 7 slots (friends,
five hobbies with equal treatment, the diving school) + 1 prop, emoji PLACEHOLDERS — VISUAL PRODUCTION REQUIRED
(Astra pass): `MISSION16_ASSET_MANIFEST.md`. Tests: `mission16.test.ts` (65); Missions 01–15 and 17–30
byte-for-byte unchanged (the old "16–30" pins now pin 17–30).

**Mission 17 — Supermarket & Everyday Shopping (registry key 16), 2026-11-10.** A MINIMAL, VISUAL, FAST
supermarket sprint and the shortest teaching mission yet: 18 interactions (10 teaching · 3 no help · 5 final)
plus the conversation, run ONCE (supported). The locked dialogue is unchanged word for word (transcript
fingerprint identical); the tree changed on purpose: the "Do you have bread?" branch and the repeat / show-me
recovery branches are gone, and every turn is a real decision (a miss is re-asked slowly). Journey
(`practiceSupermarket.ts`, shared by EN / ES / FR; the day files keep the sentences and the dialogue): briefing
("buy milk", nothing to discover given away) → **Shelf Scan**: EXACTLY six essentials (milk, water, bread,
cheese, eggs, apples; bread is just "bread") on one word card, then three recognition rounds (hear the word, tap
the picture, three tiles each, no product the answer twice) → "Can I help you find something?" + "Where is the
milk?" → "Where is the bread / cheese?" (a `transferOnly` swap: never in the dialogue, never teaching or
coverage) → the **Aisle Finder** (deterministic tiles 1–3 × ⬅️ / ➡️: aisle 3, on the left) → a SILENT checkout
cue → "Is that everything?" + "Just this, thanks." → "Do you need a bag?" + "Could I get a bag?" → the card
(one cashier-signal board) → the conversation → no help (where is · just this · a bag) → video (none recorded:
safe skip) → final micro run (find → aisle → just this → bag → card) → 🛒 QUICK SHOP COMPLETE. The **🛒
Supermarket sprint** (🔎 Find → 📍 Locate → 🧾 Checkout → 🛍️ Bag → 💳 Pay) is a staged journey on the board;
"📍 Aisle 3 ⬅️" appears only after the assistant says it. Serialisable `sprintState` (productsSeen, milkFound,
aisleKnown, checkoutReached, bagRequested, paymentDone, phase; no cart). "Thank you!" is the toolkit's: prior,
no card, no drill. No prices, no payment methods, no receipt, no Flex, no builder, no grammar. Generic
additions: `transferOnly` on swap steps (skipped by teaching and coverage like the other transfer checks) and
the sprint as a third staged journey in the board renderer. "Over there, on the left." and "Sorry, we're sold
out." are archived; "Do you have bread?" stays an (untaught) Mission 17 sentence only because the Everyday
checkpoint reuses it as a wrong option. The old `practiceEveryday.ts` (Mission 17's previous flow) is removed.
Coverage: `mission17Coverage.ts` (+ the six essentials as recognition concepts). Artwork: 9 slots + 1 prop, emoji
PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass): `MISSION17_ASSET_MANIFEST.md`. Tests:
`mission17.test.ts` (63); Missions 01–16 and 18–30 byte-for-byte unchanged (the old "17–30" pins now pin 18–30).

**Mission 18 — CHECKPOINT: Everyday Day (registry key 17), 2026-11-10.** Rebuilt as a SAMPLED adaptive
checkpoint — try first, teach only after failure — on the Mission 10 engine (`checkpoint.ts`) with opt-in
`adaptive` rules, so Mission 10 behaves exactly as before. **Quick scan:** six core probes (coffee order,
preference, plan & time, find an item, the bag, the restaurant order), nothing taught first; each line is
recalled before its options are shown, and "💡 Help" shows a hint and marks the answer ASSISTED; a miss is
noted, not shown. **Quick fix:** only the misses — one card, one retry each (REPAIRED or UNRESOLVED, never a
loop); zero misses → zero quick fix. **One-take day:** ☕ Morning → 👋 Plans → 🛒 Supermarket → 🍽️ Dinner, the
four locked scenes once (15 learner lines + 2 comprehension captures: aisle 3 / left, the card); a first miss
is re-asked slowly, a second shows the line and gives one supported pick — the day goes on. "At the checkout…"
and "Later…" are silent `sceneCue`s on their turns (text, never speech; no sentence, concept or interaction).
**Final repair:** at most two of the one-take's misses, by survival priority (restaurant order → supermarket →
paying → plans → preferences), once each. **Report:** a deterministic `checkpointReport` from the attempt log
(so a restore reads the same): 🟢 READY (0 core needing review · ≥ 4 independent probes · ≤ 1 core line
shown in the one-take) · 🔴 REVIEW NEEDED (2+ core needing review) · 🟡 ALMOST READY otherwise; five rows
(Order & pay · Plans & time · Preferences · Shopping · Restaurant) say Independent / Needed help / Recovered /
Needs review — never a score. **No video:** the plan entry carries `video: false`, and the resolver then never
looks for a file. Prior-learning audit (`learnedBefore(lang, 18)`, per language): no unknown word anywhere;
learner lines are taught chunks except named compositions of verified parts ("Yes, I'm free tomorrow." in all
three; "I'm tired. I'm going home." in EN / FR). "three / trois / tres" is prior only through Mission 17's aisle
card — Mission 02 (its market conversation: five, two, eight) never taught it; no infrastructure bug. "Do you
have bread?" (never taught) left the checkpoint: "Where is the milk?" is the wrong option at the bag question;
the sentence stays an untaught Mission 17 item. New spec file `core/everydayDay.ts`. Tests: `mission18.test.ts`
(52); Missions 01–17 and 19–30 byte-for-byte unchanged (the old "18–30" pins now pin 19–30).

**Mission 19 — Public Transport: Catch Your Train (registry key 18), 2026-11-10.** One train journey, not a
transport vocabulary lesson: 20 interactions (8 teaching · 4 no help · 8 final) plus the conversation, run ONCE
(supported). The locked dialogue is unchanged word for word (transcript fingerprint identical); the tree changed
on purpose: the "When's the next one?" and repeat / slowly branches are gone, "Thank you!" no longer skips the
platform question, and every turn is a real decision (a line from another moment, re-asked slowly). Journey
(`practiceTransport.ts`, shared by EN / ES / FR; the day files keep the sentences and the dialogue): briefing
(the centre, the museum — nothing the station will say) → "Where are you headed?" + "One ticket to the centre,
please." (one whole line, one retrieval) → "Single or return?" + "Single, please." (a ➡️ one-way / ↔️ there-and-back
board, then the answer) → "€3 · every 10 min" (ONE combined fare board) → "Which platform?" → "Platform two.
Straight ahead." (the Platform Finder: six ordered tiles, platforms 1–3 × ⬆️ / ⬅️) → "Hop on" + "Does this stop at
the museum?" → "three stops" (the stops board, 🛑 1 · 2 · 3) → "your stop is next" (card only) → the conversation
→ no help (the four tools) → video (none recorded: safe skip) → the final ride (4 said · 4 understood: ticket,
single, fare, platform, find it, museum check, three stops, get off) → 🚆 RIDE COMPLETE. The **🚆 Your ride**
travel ticket is the two-column board (Destination · Ticket · Price · Every ‖ Platform · Museum · Get off), "?"
until a line has said it, plus a 🧭 route strip (Start → 1 → 2 → 🏛️) once the stop count is heard; reveal tests
pin that no fact appears before its line, in teaching and again in the final. Serialisable `rideState`. Prior
audit (verified, per language): 2 / 3 / 10 are prior everywhere (Missions 02, 17, 08 — "three" only through
Mission 17's aisle), "straight ahead / todo recto / tout droit" is prior (Mission 05), "Thank you!", "Hello" and
"the centre" are prior; ticket, platform, single, return, every, train and museum are not — and "airport" is not,
so there is no transfer round. French "prochain" is not prior (Mission 06 said "suivant"). "Thank you!" is the
toolkit's: no card, no drill. No transport deck, no other ticket type, no money drill, no Flex, no builder, no
grammar. Archived: "When's the next one?", "Platform two.", "Every ten minutes.", "Your stop is next." (the whole
staff lines replace the fragments). KNOWN GAP (flagged, not fixed — Missions 20–30 untouched): "It's three
stops." and "You're going the wrong way." stay untaught Mission 19 sentences because the City checkpoint
(Mission 24) reuses them; the old Mission 19 listening drill that taught "wrong way" is gone, so Mission 24's
speed correction now rests on a line no earlier mission teaches as guaranteed learning. Removed:
`practiceCity.ts` (the old Mission 19 flow). Coverage: `mission19Coverage.ts`, registered as prior for later
missions. Artwork: 6 slots + 1 prop, emoji PLACEHOLDERS — VISUAL PRODUCTION REQUIRED (Astra pass):
`MISSION19_ASSET_MANIFEST.md`. Tests: `mission19.test.ts` (66); Missions 01–18 and 20–30 byte-for-byte unchanged
(the old "19–30" pins now pin 20–30).
