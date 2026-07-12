# READY — Project Structure & Product Rules

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

Permanent bottom navigation (English pilot): **Home · Bootcamp · Core · Profile**. The nav is
hidden only inside an active mission (a focused, full-screen flow with its own controls).

- **Home** — the real entry point (answers "what can I do here?"): the language strip, a welcoming
  header, a **Quick Settings** card owning **Theme** + **Speech Speed** (reusing the same
  appStore/TTS — no duplicate state), and four large **action cards** as the primary navigation
  (🗣️ Common Situations → Bootcamp · 📖 Learn New Words → Core Words · 💬 Core Phrases → Core
  Phrases · 🎬 Videos). **Continue** remains as a quieter secondary card lower down. No dashboards.
- **Videos** — an experience, not a list: plays a random available mission video, then asks "did
  you understand everything?" → load another random video, or drop into the exact Mission Hub that
  owns the video (Practice / Transcript / Video). Honest empty state; only Mission 2 has a video today.
- **Bootcamp** — the heart of the product: a **29-mission numbered journey** in 5 phases
  (Foundations → Arrival → Food → City Life → Mastery), beginning with **Introduce Myself**.
  Checkpoints are cold integration days. The **Recovery Toolkit** (the 7 survival tools, formerly
  "Mission 1") is now an **optional special mission** shown unnumbered at the end of the map — its
  content is unchanged; only its placement/presentation moved (pilot testers read it as a broken
  first mission because its answers are escape tools, not answers to the conversation). Display
  numbering is presentational (`missionNumber()`); the internal `day`/DAYS keys never change.
- **Core** — the practical communication engine, a two-layer **knowledge center**: a grid of
  **category cards** (📖 Core Phrases · 📝 Core Words · ❓ Common Questions · 🚨 Emergency · 🧩 Core
  Patterns · ⭐ Favorites) → the existing tabbed page opened on the chosen category (top tabs +
  content), with a back button to the cards. **Core Phrases** is live (every sentence READY teaches,
  grouped by mission, tap to hear) and **Core Words** is now live too — the **Core 100** emoji pilot
  (`CoreWords.tsx`) with three modes on one screen: Browse · Picture Quiz · Swipe Recall (see
  **[CORE-100.md](./CORE-100.md)**). **Core Phrases** also hosts **🎴 Sentence Flashcards**
  (`SentenceFlashcards.tsx` + pure `flashcards.ts`): flip / hear / next-prev / shuffle / direction
  toggle over the SAME canonical mission sentences (`buildSentenceDeck` reuses item ids — no
  duplication), per-language, shuffled per session. The rest stay honest "coming soon". The chosen
  category lives in `appStore.coreCategory`. Not "1500 words" yet — a validated 100-word pilot.
- **Mission vocabulary priming** — a `{ kind: 'prime' }` mission step ("Before we speak") teaches 3–8
  building-block words before a longer sentence, optionally assembling into a canonical mission
  sentence, with a ♻️ review hint for words seen earlier (`primeVocab.ts`). Primed: **Missions 1–8**
  (FR 1–4 in parity). Every mission's priming decision is recorded and test-bound in `vocabAudit.ts`
  (30 audited · 8 primed · 22 no-priming-needed). Essential connectors/sizes (`with/without/and/or/
  here/there/can/more/less/medium/large`) are now **global Core** concepts (corpus 511). French
  numbers (70/80/90 vigesimal) live in `fr/frenchNumbers.ts`. See **[VOCABULARY-AUDIT.md](./VOCABULARY-AUDIT.md)**.
- **Randomization** — one tested seeded shuffle (`shared/util/shuffle.ts`, Fisher–Yates + `mulberry32`)
  backs all answer-option / distractor / review ordering (games, quizzes, flashcards, session builder).
  Narrative dialogue order is never shuffled; only options and review order are.
- **Profile** — everything personal: language (trip = English pilot; app = EN/HE), audio
  (enable/test sound), and honest disabled "coming soon" rows (Google sign-in, statistics,
  notifications). The two most-changed controls — **Theme** and the single global **speech-speed**
  (80–105%, default 95%) — now live in Home's Quick Settings for one-tap access, reading/writing
  the exact same appStore/TTS source of truth (no duplicate state).
- **Mission Hub** — the home of each mission: exactly three always-available modes —
  **🎯 Practice**, **📖 Conversation Transcript**, **🎬 Watch Video** (Coming Soon if no video).
- **Practice** — the Bootcamp step-flow (talk → tools → expected-reply drills → quizzes →
  dialogue → sentence review → cold open → victory). Unlimited repeats; never "finished."
  Listening is **one screen** (play → transforms in place when audio ends → sentence + Continue,
  no "tap when ready" gate). A **started** mission asks *Continue vs Start over* before resuming.
  Every answer runs the **one global feedback system** (`shared/ui/feedbackCue` + `Feedback` +
  `.fx-*` motion + `shared/audio/sfx`): correct = chime/green glow, wrong = tone/shake + a
  redesigned **wrong-answer view** (your answer · right answer · one-line Why? · Try Again / Continue).
- **Transcript** — the full conversation as a premium bilingual reader with per-line replay,
  play-all / pause / restart / prev / next, and the current line highlighted.
- **Video** — the full-conversation video (manual play, inline, replayable). Mission 2 ships one
  (`/videos/En_day2.mp4`); others show Coming Soon. Missing/broken video degrades gracefully.
- **Victory Screen** — completion **celebrates** with minimal reading (Pareto): confetti +
  "{Mission} completed!" + three **large action cards** (Watch Conversation · Open Transcript ·
  Practice Again). Evidence is not a wall — it is collapsed behind a tiny **"What did I learn?"**
  toggle (skill · mastered phrases · receipts). Next Mission stays a quiet ghost action.

## 6. Learning flow (intended order)

**Watch / listen → Understand → Practice → Reply → Recover → Review full conversation → Repeat.**

The emotional loop of a mission: watch the conversation and understand almost nothing → practice
→ watch again and realize "now I understand it." Mission 1 additionally runs in **coaching mode**:
it teaches that survival, not correctness, is the goal — recovery phrases are labeled survival
tools and every pick is reframed as *more or less useful*, never right/wrong.

## 7. Architecture overview

- **React app (`apps/web`)** — Vite + React 18, mobile-first, RTL-aware, PWA. Screens live under
  `src/features/*`; shared UI/audio/i18n/stores under `src/shared/*`; app shell in `src/app/`.
- **Zustand stores** — `shared/stores/appStore.ts` (routing/`view`, user, content pack, `theme`,
  `uiLang`, `learningLang`, `coreGameActive`), `features/bootcamp/bootcampStore.ts` (active mission,
  hub/play `stage`, progress + receipts in **localStorage**), `shared/stores/sessionStore.ts`. Single
  sources of truth — no duplicated navigation/settings/state. **Nav visibility** is a pure rule
  (`app/nav.ts` `shouldShowNav`): the permanent bottom nav hides inside any focused full-screen flow
  — an active Bootcamp mission **or** an active Core learning-game session (`coreGameActive`), so a
  game's fixed action zone (Continue) is never occluded by the higher-z nav.
- **Bootcamp data files** — `features/bootcamp/day1..30.ts` are **pure data** (no React, no store),
  registered in `bootcampStore.ts`'s `DAYS`. `plan.ts` = 30-mission metadata; `types.ts` = the
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
  **Core 511**: authored concept rows (`data/*.ts`, 25 categories, five-part scorecard
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
- **Videos (`apps/web/public/videos`)** — referenced by a mission's optional `introVideo.src`
  (public path, resolved against `BASE_URL`). Only Mission 2 has one today.

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
npm run export:dialogues     # cinematic screenplays per language → exports/ (dev tool, see DIALOGUE-EXPORT.md)
```

---

_Companion doc: **[BOOTCAMP_CONVERSATIONS.md](./BOOTCAMP_CONVERSATIONS.md)** — every mission's
phrases, expected replies, recovery tools, cold opens and dialogues, auto-generated from source
for human content review._
