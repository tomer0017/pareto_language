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

### Mobile UX pass — Listen module, story player, visual Foundations (2026-10-06)
- **Listen:** the tabs and what they switch are now ONE card (`listen-module`: tabs as header, a
  `tabpanel` body that fades in on switch; inner cards flat). The story card moved into the Stories
  tab. Nothing audible changed.
- **Story reader:** the bottom controls were stacking vertically (two same-specificity rules; the
  later `flex-direction: column` won), which pushed the player low and tall. The player is now a solid
  card that names the story it plays (cover thumbnail, title, line i/n) over one row of controls, and
  carries previous / next story arrows; the cover has the same arrows (`adjacentStories`, pure).
- **Foundations:** the sheet is a visual, tappable area. Categories are 3-up tiles in two groups —
  "The world around you" (colours, animals, fruits & vegetables, food & drink, home & furniture,
  nature & garden, sports, transport, body, clothing, weather, places — 11 new, all slices of the
  existing Core packs via `taxonomy.ts`, every word in exactly one topic) and the building blocks.
  Words are 3-up tiles: tap = hear it (+ counts as seen), ⓘ = the word page; colour tiles are painted
  in their colour (`foundationTiles.ts`, by concept id); order is a seeded per-visit shuffle with
  unseen words first. In-mission nudges stay limited to the building blocks.
- Not done: browser / device QA. Limitation: world-topic words have no authored FR/ES example
  sentence yet (the page shows the meaning; it never falls back to English).

### Free learning restored — one obvious door to every self-directed tool (2026-10-05)
- **Root cause (from git):** the 29-mission refactor (`752463f`) turned Home into a coach and moved
  every self-directed tool under Learn → "More practice" → the Core library's inner menus; the
  Foundation button and its one-time introduction were deleted. Nothing was removed from the code —
  the swipe word cards (`SwipeRecall`), sentence cards (`SentenceFlashcards`), both players
  (`ListenPanel`, Listen's playlists), Stories and the Foundation sheet all still worked, three or
  four taps deep.
- **Two learning modes, both on Home:** the Journey ("your next step") and a full-width card
  "למידה באופן חופשי" → `features/free/FreeLearning.tsx` (view `free`, under the Home tab): seven
  cards — word cards, sentence cards, word player, sentence player, stories, dialogues, foundations —
  each opening the EXISTING surface through a one-shot intent (`coreIntent`, `listenIntent` in the
  app store). Core's Back returns to the hub when opened from it.
- **Listen** lost only its duplicate "sentence library" row; everything audible stays.
- **Foundations:** the Journey's one entry is now a card at the top of Phase 1, before Mission 01
  ("יסודות בשפה"; the phase heading above it is a section title, not a control); the duplicate row
  under More practice is gone. The one-time introduction is
  back on the Journey (`FoundationOnboarding`, per-language `ready.foundation.onboarded.*`), with
  "Open Foundations" / "Later"; the sheet stays reachable from the Journey and the hub.
- **Mascot:** a mission introduction now greets (`hello`); the pom-poms (`cheer`) were its default.
- Tests: `features/free/freeLearning.test.ts`. Not done: browser / device QA.

### Mission videos are auto-discovered by language and number (2026-10-05)
- **Convention:** `apps/web/public/videos/{language}/{language}_{displayedMissionNumber}.mp4` — the language being
  learned and the mission number the learner sees, no zero padding (M04 Spanish = `videos/es/es_4.mp4`).
- **Build-time manifest:** `apps/web/videoManifest.ts` scans the three folders on every dev start,
  build and test run (Vite plugin, module `virtual:ready-video-manifest`; nothing generated is
  committed). A malformed name fails the build with the convention spelled out.
- **One resolver:** `features/videos/missionVideo.ts`. The hub, the in-lesson "watch the full
  conversation" button, the video steps, the victory screen and the Videos screen all ask it. No
  file → no video UI; Mission 1's video steps are skipped.
- **Mission content no longer names videos** (`introVideo` is gone). The 15 older files were renamed
  from registry-key names to displayed numbers, byte-for-byte unchanged; 7 Spanish videos joined.
- **To add a video:** put the MP4 at its path, commit, push, `npm run deploy`. Nothing else.
- Tests: `features/videos/missionVideo.test.ts`. Not done: browser / device QA.

### Production freeze for video — scene transitions are cues (2026-10-05)
- Seven lines carried a time / place jump inside the spoken text ("…Later…", "…At the checkout…"),
  so text-to-speech read the label aloud. Each is now a `cue` on the line — shown in the app
  language, never spoken (Missions 14, 17, 18 ×2, 22, 29, 30; Mission 28 already had one). In
  Mission 22 the label sat mid-line, so that line is now two beats of the same speaker (`after`).
  No spoken word was changed. The speed chains of 14 and 17 quote the same lines without the label.
- The earlier byte-for-byte fingerprints of Missions 01–24 still pass: `cueFreeze.ts` (test support)
  puts the labels back before hashing, proving nothing else moved.
- **Video production docs** are generated: `npm run export:video-docs` writes
  `docs/CORE30_FINAL_DIALOGUES_EN_ES_FR_HE.md` (master script) and
  `docs/CORE30_FINAL_VIDEO_ACTION_MAP.md` (the one canonical action map, with a dialogue hash per
  mission × language to detect stale videos). The 2026-10-04 map is archived as superseded.

### Final Core practice pass — Missions 25–30, Mastery (2026-10-04)
Scope: Missions 25–30 only. Missions 01–24 are fingerprinted byte-for-byte; the conversations and
sentences of 25–27, mission order, the Companion and progression are unchanged.
- **Scaffolding decreases.** 25–27 still teach (key sentences, one drill of each question, then
  answering in context); 28–30 teach nothing — no key sentences, quiz, review or translation before
  the answer. Difficulty is speed and recombination: a per-language guard proves every word of 28 /
  29 / 30 was met in Missions 01–27 / 01–28 / 01–29.
- **25 Lost / Stolen / Police:** situation match (words beside the icon), the report Quick Reply ×5,
  Swap It "I can't find ___ / I lost ___" ×3, the two scenes, review 16 → 8, a speed chain of the
  scenes' own lines ×4, and one fast double question where asking for it slowly is the answer. The
  quiz and the old cold open are gone: "Where did it happen?" is drilled once, then only answered.
- **26 Pharmacy** (`practiceMastery.ts`, one flow for three languages): symptom match ×4, the counter
  Quick Reply ×4, instruction match ×3, review 15 → 8, a chain ×3, then the instruction said fast —
  "thank you" is the miss, "slowly" is the answer. No dose, duration or remedy is invented; the old
  cold open ("if it doesn't improve in three days…") is gone. Language practice, not medical advice.
- **27 Emergency:** the dispatcher's four questions, a service choice (injury → ambulance, danger or
  crime → police), review 15 → 6, the whole call at speed ×5. No quiz, no cold open, no emergency
  number, no promise that help arrives.
- **28 No Subtitles:** a new `audioOnly` dialogue flag — the other speaker's line is not written and
  not translated before the answer (the bubble is a replay button). 12 real decisions in 3 scenes,
  Recovery on 2 lines. Before this pass the mission showed both the text and its translation.
- **29 Dress Rehearsal:** now one multilingual spec (`DRESS_REHEARSAL` in `core/checkpoints.ts`; the
  three hand-written `day28.ts` files are deleted). 13 real decisions, a Recovery budget of 2 that
  actually repeats the line, one disruption (the wrong dish), one faster moment (the bill).
- **30 A Complete Day Abroad Alone:** 21 real decisions + a goodnight across five scenes, 3 Recovery
  moments, one real problem at the meal, no manufactured police / medical / emergency incident. The
  final card lists what was demonstrated and does not claim fluency.
- **Left the Core:** three Extended-only sentences Mission 29 borrowed (`phrase.rest.table-for-two`,
  `phrase.rest.bill-please`, `phrase.pay.by-card`) — replaced by the Core sentences. They stay
  defined in the Extended files, are not active Core sentences and are not in `retired.ts`. Each is a
  legacy alias of the Core sentence now said at that turn (`rest.table-two`, `rest.the-bill`,
  `money.by-card`), so practice stored under the old ids still counts.
- **Mission 28's "Later…"** is a scene transition (`cue`): shown in the app language, never spoken.
- **Tests:** `practiceMastery.test.ts` (69). **Not done:** manual browser / device QA.

### Practice depth — Missions 19–24, City & Conversation (2026-10-04)
Scope: Practice of Missions 19–24 only. Missions 01–18 and 25–30, the dialogues of 19–23, mission
order, the Companion and progression are fingerprinted or untouched. Nothing was retired.
- **Where it lives:** Mission 19 takes its flow from the new `practiceCity.ts`; Missions 20–23 are
  specs — their `teach` blocks in `core/*.ts`.
- **Every teaching mission** ends on a chain at natural speed built only from its own conversation's
  lines, has a 12-card review, and no meaning quiz: each line that used to be re-tested is drilled
  once and then answered.
- **19 Transport:** station board by ear (platform / stops / minutes), station Quick Reply ×6, Swap
  It ticket to centre / museum / airport, ticket → platform → stop at speed, and a fast correction
  made only of known words where asking again is the answer. One sentence id was added —
  `phrase.trans.single` ("Single, please."), the conversation's own answer, which had no id.
  Spanish already said "billete"; there was no "boleto".
- **20 Past:** answering about yesterday ×6, Swap It place / bed / verdict ×5, builder ×2, the story
  at speed ×6; the ask-back is retrieved four ways.
- **21 Future:** plans Quick Reply ×6, Swap It duration (the three lengths of stay from Mission 06)
  and destination, builder ×2, the itinerary at speed ×5.
- **22 Fixing Problems:** line ↔ situation Match (written out), a restaurant chain ×5 and a hotel
  chain ×5 (asking to slow down accepted on the fast line), Swap It "There's a problem with ___",
  builder ×2, both problems at speed ×6; review 19 → 12.
- **23 Opinions:** opinion chat ×6, reactions ×3, Swap It "I think it's ___" ×3, opinion + reason
  builder, the conversation at speed ×6. "Because…" is only ever retrieved as the answer to "Why?".
- **24 Checkpoint:** four cold scenes (station, a local, the wrong dish, a traveler) with 16 real
  decisions — several with the same idea in the wrong time as the distractor — 3 recovery offers,
  one speed-listening moment, zero vocabulary not met in Missions 01–23 (tested per language).
  **Mission 24's scenes changed**, as the earlier checkpoints' did.
- **Final micro-pass:** Mission 19's intro no longer promises announcements (it now names the
  numbers by ear and the one fast correction). Mission 22 lost its sentence builder and its speed
  chain went from 6 to 4 decisions (dish, bill, room, fix) — 26 → 22 active retrieval, both domains
  and all four problem types kept. Mission 24's "You should take the boat tour." is kept: Mission 11
  drills and answers "You should try…" in all three languages, so it is recombination, not new language.
- **Tests:** `practiceCity.test.ts` (69).
- **Not done:** manual browser / device QA.

### Practice depth — Missions 11–18, Everyday Life (2026-10-04)
Scope: Practice of Missions 11–18 only. Missions 01–10 and 19–30, the dialogues and sentences of
11–17, mission order, the Companion and progression are fingerprinted or untouched.
- **Where it lives:** Missions 11, 12, 13, 16 are specs — their `teach` blocks in `core/*.ts`;
  Missions 14, 15, 17 take their flow from the new `practiceEveryday.ts` (once for EN / FR / ES).
- **Every teaching mission** now ends on a chain at natural speed built only from its own
  conversation's lines (tested: no new word), has a selective review (11–12 cards) and 15–17 active
  retrieval moments (was 1–5). All redundant meaning quizzes and the old un-labelled cold opens with
  untaught words are gone.
- **11 Small Talk:** chat Quick Reply ×6, "How about you?" retrieved 3×, the recommendation request
  chosen / built / at speed. **12 Time & Plans:** time board by ear ×4, plan Quick Reply ×5, Swap It
  today / tonight / tomorrow, builder "Let's meet here at seven."
- **13 Home:** Swap It "I'm going…" (each language's own verbs), builder ×2, home Quick Reply ×5,
  "I'm tired." in context. **16 Hobbies:** Swap It like / love / don't like, builder "usually",
  chat Quick Reply ×6 ending on the ask-back.
- **14 Restaurant:** the listening drill now matches the dialogue ("How was everything?" and the
  dessert offer are no longer drilled); Restaurant Rush ×6 incl. "Anything else?" → "That's all,
  thanks." and "Is everything okay?"; Swap It chicken / pasta; review 21 → 12.
- **15 Allergies:** both duplicate quizzes removed; icon Match for checking / can-make-without /
  contains nuts (no "safe" label); safety Quick Reply ×5 where asking again is accepted on a warning;
  the recovery challenge is kept and labelled. "Good option for you" is no longer drilled.
- **17 Supermarket:** "weigh it first" removed from drill, quiz, review, the intro card and the proof
  card; aisle + side board by ear ×3; Swap It milk / bread / water; shelf-to-checkout Quick Reply ×5.
- **18 Checkpoint:** four cold scenes (coffee, a friend, the supermarket — replacing the clothes
  shop — and dinner) with 15 real decisions, 3 recovery offers, one speed-listening moment, no
  translation before answering, zero vocabulary not met in Missions 01–17 (tested per language).
  **Mission 18's scenes changed**, as Mission 10's did.
- **Model:** `TeachSpec.finale` lets a spec mission end on practice steps instead of (or before) a
  cold open. No new engine.
- **Final cleanup:** five sentences retired from their missions and moved to the archive
  `features/bootcamp/retired.ts` (EN / FR / ES, ids and wording kept, registered nowhere): M14 "The
  menu, please.", "How was everything?", "Would you like dessert?"; M15 "This one is a good option
  for you."; M17 "You need to weigh it first." They no longer appear in the sentence library (Core),
  Listen, review or any mission. M15's match tiles now say checking / can make it without / contains
  nuts in words beside the icon. M17's intro promises find → aisle and side → checkout → bag. M14's
  word intro keeps "menu" (the waiter says "Here are your menus."); the French word is now "menu".
- **Mission 08 follow-up:** "For two nights." and "What's the wifi password?" were retired the same
  way (out of Mission 08's sentence list, into `retired.ts`); a fingerprint proves nothing else in
  Missions 01–18 changed.
- **Tests:** `practiceEveryday.test.ts` (71).
- **Not done:** manual browser / device QA.

### Practice depth — Missions 06–10, the Arrival phase (2026-10-04)
Scope: Practice of Missions 06–10 only. Missions 01–05 and 11–30, the dialogues / sentences / intro
cards of 06–09, mission order, the Companion and progression are fingerprinted or untouched.
- **Shared flow:** `practiceArrival.ts` defines everything after the intro card (and word intro) of
  Missions 06–09 once for EN / FR / ES; the 12 mission files keep sentences, dialogue, intro, video.
- **06 Border:** both meaning quizzes removed; "Nothing to declare." is now a key sentence; Quick
  Reply ×4 (purpose / how long / where / customs); Swap It "For ___" ×3; final = Border Rush, a
  speed Quick Reply made of the officer's own lines. The untaught "return ticket" cold open is gone.
- **07 Taxi:** quiz removed; fare board by ear (taught numbers only); Taxi Rush ×5 incl. the fast
  fare line where "Please speak slowly." is accepted; final = the ride at speed (driver's own lines).
- **08 Hotel:** "For two nights." and the wifi password are gone from the mission — not taught,
  reviewed or offered (the wifi option and its reply were removed from the dialogue; both sentence
  ids still exist for history / Extended); "night" left the word intro; Hotel Match (sentence ↔ number/icon),
  room number by ear ×2, front-desk Quick Reply ×4; final = a real recovery challenge.
- **09 Shopping:** Shop Rush ×4, size Swap It ×2 (EN bigger / smaller · FR plus grande / plus petite · ES más grande / más pequeña), out-of-stock stays receptive
  (one listening quiz); final = a real recovery challenge.
- **10 Checkpoint:** three cold scenes with 11 real decisions (the right line + a line from another
  moment, 3 with a conversation-help tool), no translation before answering, one speed-listening
  moment, zero vocabulary not met in Missions 01–09 (tested per language), no one-button screens.
  A miss gets its own slow re-ask and the same decision again. **Mission 10's scenes changed** — the
  one deliberate exception to "dialogues unchanged", required by the checkpoint brief.
- **Small model additions (no new engine):** `quickReply.challenge`, `MatchPair.answerLabel`,
  `BootcampDialogue.cold`, `YouLine.wrong` in `author.ts`.
- **Review** of 06–09 is now selective (11–12 lines) instead of every sentence.
- **Tests:** `practiceArrival.test.ts` (51). 1360 tests in all.
- **Not done:** manual browser / device QA.

### Companion artwork, expressions and entry screen (2026-10-04)
Presentation only — no curriculum, dialogue, scoring or progression change.
- **Final character art:** 48 isolated transparent renders (6 stages × 8 poses) replace the scenery
  crops. `companionAssets.ts` maps stage + pose → file; `companionMood.ts` maps each moment to a pose
  (hello / winner / celebrate / learning / sad / crown / cheer / idle). Table in `COMPANION_SYSTEM.md` §8.
- **Only its own artwork:** the emoji prop beside the character and the generated bubble / sparkle
  effects are gone.
- **Entry screen:** classroom hero, READY, a warm line, the app-language choice (live switch) and
  Continue; then the buddy waves hello on the welcome screen.
- **Where poses appear:** Route (hello), Home (cheer), mission intro (cheer), game instructions
  (learning), right answer (winner), wrong answer (sad + supportive line), recovery tool and proof
  cards (crown), mission complete and the change (celebrate).
- **Offline / spoilers:** companion art is outside the precache; only the reached stage is fetched
  and warmed.
- **Not done:** manual browser / device QA.

### Companion & learning experience redesign (2026-10-04)
A presentation / emotional-design pass after mobile QA. No curriculum, dialogue, scoring or
progression change (Missions 06–30 fingerprint, dialogue sync and practice-audit sync are green).
- **The evolution is hidden.** Removed from every screen: stage names, "Stage X of 6", the progress
  bar, the six-stage track, next-stage name / silhouette / percentage, "Level up!", "X became Y".
  The character is only "your buddy". Product rule + test in `COMPANION_SYSTEM.md`.
- **A character, not an avatar.** `CompanionFigure`: no circle or frame; moods (`companionMood.ts`)
  pick pose, motion and a small effect; the asset table supports per-pose art with fallback.
- **Where it lives:** Home (peeks over the next step), Route (floats beside the path with one
  contextual line), mission intro (introduces the mission, looking at its icon), first appearance
  of a game, beside Quick Reply and the Mini Map, answer cards, mission complete (replaces 🎉), and
  the change itself ("Wait… something changed!").
- **Practice no longer shares one white card.** Each engine has its own open canvas: Quick Reply and
  dialogues are conversations (other speaker + bubble, reply bubbles; `ConvoScene.tsx`, `npcCast.ts`);
  the price board and the map lead with an audio bubble; Swap It is a sentence with a socket and
  pieces; Match Pairs tiles lock with a pulse; Sentence Builder pieces drop onto a rail.
- **Sound:** READY's own soft cues for a placed piece, a match, a finished sentence / mission and the
  change; a Sounds on/off setting in Profile (speech unaffected).
- **Video:** the clip paints its own first frame as poster; until then a READY poster (mission icon
  + title) — never an empty rectangle. No card around it.
- **Onboarding:** the app starts in the device language before one is chosen, and the language
  question is asked in both languages.
- **Tests:** 1304. New `experience.test.ts`; `companion.test.ts` inverted where it used to assert
  stage labels, plus mood / pose / same-character / no-spoiler coverage.
- **Not done:** manual browser / device QA (no browser tooling in the build environment); final
  transparent artwork, per-pose and per-mission art, NPC illustrations (the structure is ready).

### Practice V1.1 + Companion inside the learning flow (2026-10-04)
Scope: two more games in Missions 01–03, and the companion present inside missions. Missions 06–30
content is fingerprinted by test and unchanged; no dialogue changed; companion progression unchanged.
- **Match Pairs** (`matchPairs`): 2–4 question ↔ answer pairs on one screen, tap one then its partner
  (either side first). A right pair locks under a shared number and is spoken; a wrong one shakes and
  lets go — no lives. No translation before answering. Records `simulator` pass/fail on the answer.
- **Sentence Builder** (`sentenceBuilder`): rebuild a taught sentence from 3–6 **authored** chunks per
  language (validated to spell the sentence exactly — nothing is generated). Tap to place, tap to take
  back, Check when all are used. A miss shows nothing; a hint after one miss, reveal after two.
- **Placement:** 01 — one Match Pairs board (name / from / first time) after the listening drill;
  Quick Reply trimmed 3 → 2 rounds (the name round moved to the board). 02 — one builder round
  ("too expensive"). 03 — two builder rounds (iced coffee; milk, no sugar). 04, 05 — unchanged.
- **Companion in missions:** one app-language line on the mission's existing intro card (30 lines,
  `companionCoach.ts`, keyed by mission id — mission content untouched); one instruction the first
  time each game appears in a mission; small reactions on answer cards (avatar-only pop when right,
  encouragement when wrong, applause when a conversation-help tool was the winning move). Stages 1–3
  show the line as a caption beside the character; from Stage 4 it is the character's own bubble.
  Never target-language text. Practice answers award no growth; thresholds and points are unchanged.
- **Direction:** every target-language board / tile / answer line is `direction: ltr` +
  `unicode-bidi: isolate` under the Hebrew UI; tested by rendering under a Hebrew UI.
- **Tests:** `practiceV11.test.ts` (rules, authored content, placement, rendered markup) and new
  companion cases in `companion.test.ts`. 1282 tests.
- **Not done:** manual browser / device QA (no browser tooling in the build environment).

### Language Companion V1 — fish → parrot, per language (2026-10-04)
Source of truth: **[COMPANION_SYSTEM.md](./COMPANION_SYSTEM.md)**. Isolated feature `features/companion/`.
- **Six stages** (Scared Fish → Focused Fish → Parrotfish → Young Parrot → Talking Parrot → Chatterbox),
  one companion per learning language.
- **Progression is separate from Trip Readiness:** cumulative growth points from keyed events, stage =
  highest ever reached (stored, monotonic), no denominator. Thresholds 0 / 20 / 70 / 150 / 300 / 600;
  the whole Core is 340 points, so Stage 6 is not reachable until another growth source is connected.
- **Surfaces:** Path card, companion page, mission-complete reaction, full-screen evolution (once per
  stage), reusable `CompanionReaction`. Not inserted into Practice questions.
- **Never spoils:** target-language lines come only from completed missions of that language.
- **Persistence:** `ready.companion.v1`; first record per language is derived from mission history and
  marked as seen (no replay). The store listens to mission completions — mission code does not call it.
- **Art:** (superseded — see the artwork entry above) originally crops of the concept sheet.
  Motion is CSS on still images; `prefers-reduced-motion` switches it off.
- **Hooks:** `appStore` (view), `nav.ts`, `App.tsx`, `Learn.tsx` (card), `Bootcamp.tsx` (one line).
- **Not done:** manual browser QA; real character animation; Stage-6 growth sources.

### Practice V1 — Missions 01–05 (2026-10-04)
Scope: Practice only, Missions 01–05 only. Missions 06–30 are fingerprinted by test and unchanged.
- **Four reusable, data-driven step types** (`types.ts`, pure logic in `practiceEngines.ts`, UI in
  `PracticeSteps.tsx`): `quickReply` (hear a question → tap your response), `visualMatch` (hear → tap
  one of up to 9 tiles), `swap` (one sentence frame, several endings), `miniMap` (hear a direction →
  tap the way / spot on a 3×3 schematic). Wrong answers still never block: Try again / Continue.
- **Final challenge has two honest modes:** `ambush.mode` = `recovery` (the win is a
  conversation-help tool) or `speed` (known language, fast; never "use a tool"). A visual-match or
  mini-map step can be the speed challenge. Missions 06–30 keep the original, un-moded ambush.
- **Shared step definitions:** `practiceV1.ts` defines the steps of Missions 01, 02, 03 and 05 once
  for EN / FR / ES; Mission 04 gained `practice` / `review` in its spec (`author.ts`).
- **Per mission:** 01 — holiday / how-long removed, Quick Reply ×3, true recovery ambush; 02 — price
  board (Visual Match), "too expensive" retrieved, speed challenge on a price; 03 — Coffee Rush
  (Quick Reply ×6), "To go" retrieved; 04 — Swap It ×7 + Quick Reply ×5 replace the quiz; 05 — Mini
  Map ×4, "Where is the station?" retrieved, "How do I get to ___?" as a frame, map speed challenge.
- **Word-intro parity (real bug, fixed for 01–05):** the three languages primed different words in
  Missions 01 and 02. `PrimeWord.key` now names the concept; a test compares languages by key.
  French keeps 70 / 80 as declared language-specific extras.
- **Sentence ids:** added `phrase.money.one-box`, `phrase.coffee.medium`, `phrase.coffee.yes-please`;
  removed from Mission 01 `phrase.social.here-on-holiday`, `reply.social.how-long`.
- **Selective review:** 9–14 cards per mission instead of every sentence object.
- **Dialogue UI:** a screen with exactly one line is headed "say your line", not "pick your line".
- **Audit:** `READY_CORE30_COMPLETE_PRACTICE_AUDIT_SOURCE.md` regenerated; the generator knows the
  new steps and pairs word-intro items by key. 01–05: questions 66 → 97, auto-flags 57 → 27.
- **Not done:** manual browser QA (no browser tooling in this session); native review.
- Gates green: typecheck · lint · **1220 tests** · build (PWA) · smoke · parity.

### Core 30 — Curriculum V1.0 lock: final dialogue audit (2026-10-04)
Full detail: **[CORE_30_FINAL_CURRICULUM_REPORT.md](./CORE_30_FINAL_CURRICULUM_REPORT.md)** · video actions:
**[CORE30_FINAL_VIDEO_ACTION_MAP.md](./CORE30_FINAL_VIDEO_ACTION_MAP.md) (canonical; the 2026-10-04 map is archived as superseded)**.
- **Architecture untouched:** same 30 missions, order, ids and registry keys; checkpoints 10/18/24/30.
- **Dialogues:** 12 missions unchanged; small fixes in 01, 06, 07, 12, 13, 14, 16, 19, 23, 26 (+ one-line
  polish in 22, 29, 30); rewritten/rebuilt 04 (two scenes), 10 (border → taxi → hotel), 15 (allergy vs.
  diet, no guarantees), 25 (passer-by + police station), 28 (known language only).
- **Languages:** English "centre"; Spanish es-ES "billete"; French "Je ne crois pas"; Hebrew "לא נראה לי".
  AI linguistic review completed; native review still recommended.
- **Authoring:** Arrival Day (key 9) and No Subtitles (key 27) moved into the multilingual specs
  (`core/checkpoints.ts`); `MissionSpec.numbered` lets a cold mission keep its "Mission N:" headline.
- **Document:** multi-scene missions now print `_Scene N_` boundaries (`dialogueDoc.ts`).
- **Guards:** 21 lock checks in `core30.test.ts` (ids/keys pinned, es-ES vocabulary, per-mission audit rules).
- **Videos:** none touched. 15 files → KEEP 4 · MOVE 3 · REPLACE 7 · CHECK 1.
- **Practice:** architecture untouched; stale references repaired in 04, 13, 23, 25; mismatches remain in
  14, 15, 17, 26 (listed in the report). Sentence catalog: EN 315 · FR 314 · ES 312.
- **Closing micro-fixes:** Mission 30 states the duration before it is disputed; Mission 10's "Here you go." is
  scored as itself (`phrase.hotel.here-you-go`, an id for an existing Mission 08 line); six Spanish / Hebrew
  wording fixes. Sentence catalog: EN 316 · FR 315 · ES 313.
- Gates green: typecheck · lint · **1182 tests** · build (PWA) · smoke · parity. (Smoke has a pre-existing
  clock-timing flake in the trip-plan check — see the report's open issues.)

### Core 30 restructure — Pareto-first curriculum, 29 → 30 missions (2026-10-03)
> Entries below this one use the previous numbering (29 missions, checkpoints 9/17/23/29). Full
> detail, old → new mapping, video and Practice maps: **[CORE_30_RESTRUCTURE_REPORT.md](./CORE_30_RESTRUCTURE_REPORT.md)**.
- **Curriculum:** the **Core 30**. 8 new missions (Everyday Core · Time & Plans · Home, Family & Daily
  Routine · Hobbies & Free Time · Past & Recent Events · Future Travel & Plans · Opinions, Feelings &
  Reactions · Lost / Stolen / Police); Small Talk moved from 22 → 11; checkpoints now 10 / 18 / 24 / 30.
  Phases 3–4 renamed Everyday Life / City & Conversation.
- **Merged / moved out:** Restaurant Basics → Restaurant Meal; Hotel Requests → Fixing Problems;
  Paying Anywhere retired as a standalone mission. Street Food, Tickets, Wifi/SIM and Souvenirs →
  Extended Mission Pool (`EXTENDED_POOL` + `extended.ts`; content kept and tested, never shown).
- **Identity:** no id or registry key was renumbered. `day` is now visibly NOT the mission number
  (Taxi = `day` 6 = Mission 7); new missions use keys 30–37. Progress needed **no migration**.
- **Authoring:** `author.ts` + `core/*.ts` — 14 missions (8 new, 3 rewritten, 3 rebuilt checkpoints)
  are written once with EN / FR / ES / HE side by side and built per language.
- **Content repairs:** taxi ("how much did you expect to pay?"), hotel check-in (duplicated breakfast
  question), arrival checkpoint (breakfast never answered), small talk (answers now match questions),
  allergies + pharmacy (no safety guarantees), supermarket (unexplained fruit), emergency (lost
  passport moved out), fixing problems ("What did you order?" now answered).
- **Recovery:** 8th kit phrase "What does that mean?" (EN/FR/ES). The six help tools recur inside
  Core dialogues; still no recovery mission.
- **Audit finding:** the "missing French/Spanish lines" in the supplied reference Markdown were NOT in
  the runtime — all 29 old missions were already turn-for-turn identical across EN/FR/ES. A test now
  guarantees it for every Core mission.
- **Docs/tools:** `npm run gen:dialogues-doc` → `docs/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md`
  (test-bound); dialogue export numbered by mission number; pre-change snapshot in `docs/archive/`.
- **Not done (by design):** no video was generated/replaced/deleted; Practice/games were not
  redesigned (new missions use the existing step template). Sentence catalog: EN 316 · FR 315 · ES 313.
- Gates green: typecheck · lint · **1129 tests** · build (PWA) · smoke.

### Final frontend polish + stabilization (2026-10-01)
- **Path / מסלול:** the Learn destination is labelled "מסלול" / "Path" (tab, rail, title). Internal
  names (`bootcamp` view) unchanged.
- **Playback ownership (bug fix):** Listen's repeats leaked into the story reader / transcript /
  word listening through one shared settings record. Preferences are now per surface
  (`ready.playback.<scope>`), each keeping only the options its screen exposes; the story reader
  owns none. The engine's relative speed is removed entirely — ONE speech speed (Profile).
- **Sentence identity:** `…rest.ill-have` meant "the chicken" in Restaurant Meal and "the pasta"
  in Restaurant Basics → the Restaurant Meal sentence is now `…rest.ill-have-chicken` (EN/FR/ES).
  New `sentenceCatalog`: one canonical sentence per wording; re-declared wordings are aliases.
  Canonical counts: **EN 242 · FR 239 · ES 236** (was shown as 261).
- **Stories:** a visual story card (real cover, next unfinished story) in Listen opens the reader.
- **Mission entry:** one primary button on the mission overview; steps are shortcuts only after
  completion; the video offers one way forward; Videos screen no longer offers "I understood
  everything".
- **Home:** Quick Review is hidden until there is something to review; new desktop heading.
- **Removed from normal UI:** the dev diagnostics badges (now `?debug=1` + dev build only) and the
  floating Foundation button (now a row under "More practice").
- **Copy:** no directional arrows inside any interface string (tested); "ניגון רציף", "עוד דרכים
  לתרגל"; Hebrew sequence arrows in four mission descriptions now point the reading direction.
- **Conversation help:** six phrases is the correct set — "Sorry!" is defined in the kit but used by
  no mission since the Recovery mission was removed.

### Product IA + responsive UI refactor — Home · Learn · Listen · Profile (2026-10-01)
> Entries below describe the earlier navigation (Home · Bootcamp · Core · Profile, Home as a card
> menu, a three-tool Mission Hub). They are kept as history.
- **Navigation:** four destinations from one model (`app/nav.ts`) and one component (`AppNav`):
  bottom bar on phones/tablets, side rail on desktop (inline-start edge). "Core" is no longer a tab.
- **Home = coach:** Travel Readiness · Your next step · Quick review · Quick listen. Theme, speech
  speed, the mode grid, videos and stories left Home.
- **Travel Readiness:** completed missions ÷ plan length, derived (never hard-coded); detail screen
  listing every situation's real status. "Core sentences practiced" comes from the review log.
- **Learn:** phases → compact mission cards, one highlighted next step; 1 / 2 / 3 columns.
- **Mission overview:** Watch → Learn → Practice → Watch again (reward), over the unchanged
  step-flow. No-video missions get Listen as step 1.
- **Listen (new):** core sentences / dialogues / stories playlists from existing content; queue,
  now playing, repeats (חזרות), non-stop, three listening modes, Quick listen (10 min).
- **Profile:** all settings in one place (languages, the one speech speed + test, appearance).
- **Design system:** layout tokens (`--page-max`, `--focus-max`, `--rail-w`), `Icon`, `AppNav`,
  `PageHeader`/`BackButton`, `ProgressRing`, shared row/tile/tab classes; dark-mode contrast token.
- **Debt closed:** the double arrow on "Next mission" (arrow is now one direction-aware icon; copy
  carries none); recovery phrases moved last and renamed "עזרה בשיחה / Conversation help" in the
  library, flashcards and Listen; the legacy content-pack Mission screen retired from the journey.
- **Omitted on purpose (no real data):** achievements/badges, time-based progress bars, mission
  photos, "learned" phrase counts (we show "practiced", which the log supports), favourites.
- **Tests:** nav model, readiness, mission journey over all 87 missions, Listen playlists/modes,
  review picker, UI copy rules, store entry point. 923 tests.

### Bootcamp restructure — Recovery Toolkit removed, 30 → 29 missions (2026-10-01)
> Entries below this one predate the change and use the OLD numbering (30 missions, Recovery
> Toolkit as Mission 1 / "special" mission, checkpoints 10/18/24/30, videos `En_day2…`). They are
> kept as history; subtract one from any mission/day number ≥ 2 to get today's number.
- **Curriculum:** the Recovery Toolkit ("ערכת חילוץ — כשלא מבינים") is gone from the Bootcamp — no
  mission, no special card, no progress slot. **29 missions**; Mission 1 = Introduce Myself, Mission
  29 = A Complete Day Abroad Alone; checkpoints 9 / 17 / 23 / 29. Old mission N (2–30) = new N−1.
- **Files:** `day1.ts` (EN/FR/ES Recovery mission) deleted; `day2..30.ts` → `day1..29.ts` in all three
  languages, with `day:` keys, exports, cross-references and the in-mission "Mission N:" headline
  shifted (this also closes the old "headline is off by one" follow-up from the Pilot UX sprint).
- **Identity:** `BOOTCAMP_PLAN` entries gained stable `id` slugs; `special` / `CORE_MISSIONS` /
  `SPECIAL_MISSIONS` removed; display number and next-mission logic derive from plan order
  (`missionNumber`, `nextMission`).
- **Progress:** localStorage moved to `ready.bootcamp.v2.<lang>`, keyed by mission id (`progress.ts`).
  One-time migration from v1: old 2 → Introduce Myself … old 30 → finale; old Recovery completion,
  receipts and resume point dropped. v1 keys left on disk.
- **Videos:** renamed down by one — EN `2,3,4,5,7,8,9,11` → `1,2,3,4,6,7,8,10`; FR `2,3,4,5,6,9,11` →
  `1,2,3,4,5,8,10`. Real gaps remain (EN 5, 9; FR 6, 7, 9; everything from 11 up; no Spanish videos).
- **Recovery content kept:** `recovery.ts`, `fr/recovery.ts`, `es/recovery.ts` (reused by the other
  missions). Coffee Shop (EN) now bundles its four tools from the shared kit instead of importing
  the deleted mission. The dialogue player's `coaching` mode is dormant (nothing enables it).
- **Priming:** "please" / "s’il vous plaît" / "por favor" in Mission 4 is now a new word, not a ♻️
  review (it was introduced by the removed mission). Audit: 29 audited · 7 primed · 22 none.
- **Tests:** `bootcamp.test.ts` (count, first/last, order, continuous numbering, ids, registry
  parity, no Recovery mission, checkpoints, next-mission navigation, in-mission titles, video files
  exist, graceful no-video), new `progress.test.ts` (migration + round-trip).

### Sprint 13 — Core World Audit + runtime homograph fix (corpus 532 → 633) (2026-07-21)
Full audit of a user-supplied ~179-item Hebrew candidate list (the "why is `house` missing?" review) —
see **[CORE-WORLD-AUDIT.md](./CORE-WORLD-AUDIT.md)** for the per-item table. 183 unique concepts →
79 already present, **99 new**, 5 composed/duplicate. Placed by learning depth, not all early:
**Tier A 7** (angry, confused, lips, the NOUN `book`, notebook, pencil, eraser), **Tier B 44**
(story animals fox/pig/lion/bear/mouse/frog…, occupations, nature, instruments, larger transport),
**Tier C 48** (sports, entertainment, structures, household tools — contextual/Universal-Tap).
- **Reversed the Sprint-12 `book`(noun) rejection.** Root cause was a validator limit, not pedagogy:
  surface-uniqueness keyed on `kind:en` blocked a second `book`. Fix = pos-scoped key `kind:pos:en`
  in `corpus.ts`, so `book`(noun) coexists with `book`(verb "reserve") and `orange`(fruit) with
  `orange`(colour). Still forbids genuine same-pos duplicates. Smallest safe change; no slug renames.
- **+99 concept-first rows** across `data/{descriptions,visual-pilot,food-places,health-people,
  objects-home,transport-money,actions}.ts` (existing categories, no taxonomy change); `CORPUS_SIZE 532 → 633` (incl. chin + pot, added on review).
- **EN/FR/ES parity complete:** all 99 added to `fr-pilot.ts` + `es-pilot.ts` (AI-drafted, gendered,
  pending native review — consistent with pilot honesty policy). Packs regenerated: **633/633** in all
  three, 305 game-eligible. Distinct collision pairs verified (book noun/verb, orange fruit/colour,
  clock/watch) in en/fr/es. `chin` (beside eye/nose/lips) + `pot` (beside bowl/cup) added on review.
- **Runtime homograph fix (Universal Tap).** Pos-scoping let two concepts share a surface, but the
  tap index (`corpusIndex.bySurface`) was surface-only with an arbitrary iteration-order first-match —
  tapping "book" always hit the verb and silently dropped the noun. Now `buildCorpusIndex` keeps ALL
  senses (`sensesBySurface`), picks the primary deterministically (rank, order-independent), and the
  word sheet shows an **"Other meaning" chip labelled with the alternate's own gloss** (ספר / תפוז) —
  both senses reachable, no context-guessing, existing primary (booking) behavior unchanged. Files:
  `corpusIndex.ts`, `foundationStore.ts`, `TappableText.tsx`, `FoundationSheet.tsx`, `strings.ts`,
  `styles.css`. See CORE-WORLD-AUDIT.md §9.
- Gates green: typecheck · lint · **872 tests** · build (PWA) · smoke.

### Sprint 12 — Core World Vocabulary Phase 1 (corpus 511 → 532) (2026-07-21)
Closed the highest-value *everyday physical world* gaps that beginner Reading stories run on — the
travel-optimized corpus had none of `house/school/farm/sky/star/grandparents/people/rabbit/carrot/
potato/ball/bowl/clothes` nor the verbs `play/read/write/cook/wear/build/sing`. Pareto-selected (each
recurs across many stories + is known before school + is highly reusable); `book`(noun) rejected
(English surface owned by the "reserve" verb — one surface per kind), fairy-tale-only words dropped.
- **+21 concept-first rows** across `content/core-corpus/data/{visual-pilot,objects-home,food-places,
  health-people,actions}.ts`, all in existing categories (no taxonomy change); `CORPUS_SIZE 511 → 532`.
- **EN/FR/ES parity** kept complete: added all 21 to `fr-pilot.ts` + `es-pilot.ts` (identical slug set,
  enforced by `es-pilot.test.ts`), and the 7 verbs' authored Foundation examples to `frenchExamples.ts`
  + `spanishExamples.ts` (the fr/es coverage gate). Packs regenerated (`npm run build:core`): 532/532
  in all three, 225 game-eligible.
- Gates green: typecheck · lint · **862 tests** · build (PWA) · smoke. See **CORE-CORPUS.md**.

### Sprint 11 — Zero Start polish: depth, exercise variety & per-item audio (2026-07-19)
Polish pass on "מתחילים מאפס" (no redesign). Gates green (typecheck · lint · 862 tests · build · smoke).
- **Per-item replay everywhere.** A small, secondary speaker (`.zs-speaker`) sits beside every
  target-language item (introduce/recall/recognize prompt/build assembly/cloze sentence/dialogue NPC +
  every target-language answer option) — replays ONLY that line, correct locale + target voice, respects
  global speed, cancels prior speech, never speaks the Hebrew translation. Listening options stay silent
  until answered so the task isn't given away.
- **Translation audit + fixes.** Fixed the reported bug ("Je parle un peu français" → "אני מדבר/ת קצת"
  now "…קצת צרפתית"): the language-name glosses use a `{targetLangName}` placeholder resolved to the
  app-language name at render (targets hardcode the name in their own language so audio is right). Also
  "אפשר לחזור?" → "אפשר לחזור על זה?" and "אתה מדבר אנגלית?" → "אתם מדברים אנגלית?". A placeholder-sync
  test + a `{targetLangName}` regression test guard it.
- **Depth + exercise variety.** New data-driven exercise types (`picture`, `listen`, `cloze`) join
  introduce/recognize/build/recall/dialogue; modules rotate them with a natural word→chunk→sentence→
  dialogue progression, spaced micro-review, and end (m1–m7) with a **badged "🏆 אתגר שליטה" mastery
  stretch** (no new material, `masteryStart`). Modules grew from ~7 to 12–16 steps (107 total). Five new
  survival-noun chunks (coffee/station/hotel/ticket/bag) power picture recognition; all reuse existing
  Foundation concept ids (validated against all three packs). m8 is now a mixed no-new-material checkpoint.
- Progress/validation/tests extended (26 zerostart tests incl. per-language runtime-data checks that
  every picture/listen/dialogue/cloze yields distinct, answer-containing, playable options in en/fr/es).

### Sprint 10 — RTL fix, Reading playback restore & Zero-Beginner Path (2026-07-19)
Three-part mission. Gates green (typecheck · lint · 853 tests · build · smoke).
- **Part 1 — RTL answer buttons (Swipe Recall).** The "ידעתי / לא ידעתי" answer buttons map to
  PHYSICAL swipe directions (right = known, left = unknown), which are layout-independent. The row is
  now pinned with `.recall-actions { direction: ltr }` so the positive action is always physically on
  the RIGHT ("ידעתי →") and the negative on the LEFT ("← לא ידעתי") in RTL *and* LTR, with arrows
  pointing outward. Swipe/scoring/keyboard semantics unchanged. Guard test: `swipeRecall/rtlButtons.test.ts`.
- **Part 2 — Reading playback restored (Reading-scoped, not global).** Reading now offers all three
  voice orders — target only / target→translation / translation→target — each line in its own locale
  (target = learning voice, translation = app voice). The order is a **Reading-only** preference
  persisted in the reading store (`ready.reading.v1`) and applied to the shared Parrot engine purely as
  a per-surface `speakOrder` override (`SpeakOrderOverride` + `buildUtterancePlan(item, settings, order)`
  + `ParrotOptions.speakOrder`) — it never writes the shared `translation` preference, so Core /
  Dialogue Parrot playback is unaffected. Speed stays global. Exposed in the compact Reading settings
  sheet as "השמעה קולית" beside the existing mode (translation display) + speed; changing the order
  pauses playback so no stale speech continues. Tests: `playbackPlan.test.ts` (override behaviour),
  `preferences.test.ts` (no global `translationFirst`), `reading.test.ts` (order persists in the
  reading key, not the parrot key).
- **Part 3 — "מתחילים מאפס" (Zero-Beginner Path).** A new data-driven guided path
  (`features/zerostart/`): a shared chunk library + 8 cumulative modules (First contact → Readiness
  checkpoint) authored naturally in EN/FR/ES with one he/en gloss each. Learning loop per brick
  (introduce → recognize → build → recall → mini-dialogue). Progress is completed-step based, per
  language, persisted (`ready.zerostart.v1`), resumable from the first incomplete step; learning a
  chunk marks its Foundation concept viewed (idempotent sync, no double-count). Home shows an entry
  card + a first-use recommendation ("לא מכיר עדיין את השפה? כדאי להתחיל כאן."); the checkpoint reuses
  only taught material and graduates into the first real Bootcamp mission (never auto-completes it).
  Validation + progress + store + concept-id parity covered by `zerostart/zeroStart.test.ts`.
  **Honesty:** the EN/FR/ES Zero Start content is AI-authored and user-facing but **not yet natively
  reviewed** — FR/ES inherit Early-Access status (do not describe them as native-reviewed/shipped).
  Follow-up: no analytics abstraction exists in the app, so path/step events are not emitted yet.

### Sprint 8 — UI polish & pilot readiness (2026-07-19)
Polish-only pass before external testers (no new features/content/backend). Gates green (typecheck ·
lint · 825 tests · build · smoke).
- **Global BiDi / punctuation fix** (high priority): `TappableText` now renders target text with the
  correct `dir` + `lang` + `unicode-bidi: isolate`, so LTR sentences ("¿…?", trailing ".") stay correct
  under the Hebrew (RTL) UI — even when split into clickable word spans. Added a non-tappable sibling
  `TargetText` for places where a whole element is the click target (quiz-option buttons, feedback
  pills, prime chips). Routed the remaining plain target renders (Bootcamp transcript/assembled/prompt/
  ambush lines, quiz options, `AnswerFeedback`) through them. Covers Reading, Core Words/Sentences,
  Foundation, Bootcamp, Transcript, Quiz, Feedback, tappable/highlighted words.
- **RTL navigation**: the shared Parrot transport (‹ prev / ▶ / › next) and the Reading transport are
  forced `dir="ltr"` (media-player convention) so arrows are consistent in every UI direction.
- **Reading simplification**: the story is now the hero — it fills the scroll area. Reading mode +
  speed moved into a compact bottom **Sheet**; only the essential transport + settings + quiz stay
  visible. Reading is **sequential-only** (new `useParrotPlayback({ order })` lock; Random stays on
  Core/Transcript). Removed Loop/Pause/Sleep/Translation/Random from Reading.
- **Learning Hub**: exposes only **Core Words** + **Core Sentences** (Emergency/FAQ/Templates/Favorites
  removed from the grid + tabs; implementations kept for a future release). De-duplicated titles —
  screen title is the area (**Core**), cards are the activity.
- **Discoverability**: the one-time "tap underlined words" coachmark (existing `TapCoachmark`) already
  fires in Reading via `TappableText` — verified, no change needed.

### Sprint 7 — Reading Mode: Beginner Stories (2026-07-18)
Added a brand-new **Reading** learning surface — a REUSABLE reading system (not a one-off Stories
feature), with **Beginner Stories** as the first collection. Gates green (typecheck · lint · 825
tests · build · smoke). Reuses `shared/playback`, Foundation Universal Tap, and the localStorage
persistence convention — no second speech engine, no duplicated logic.
- **Reusable architecture** (`features/reading/`): `types.ts` (Story/Sentence/Quiz/Collection —
  collection-agnostic), `authoring.ts` (terse `s`/`title`/`mc`/`tf`/`order` helpers), `readingCore.ts`
  (PURE: `readingTimeMin`, `buildStoryItems`, `scoreQuiz`, `storyParityIssues`/`collectionParity`),
  `readingStore.ts` (mode pref · per-story resume position · completion · quiz score · reading
  streak), and `collections.ts` (registry whose `load()` DYNAMIC-imports each collection → code-split
  25 kB chunk, PWA-precached). Adding a future collection = one data file + one registry entry.
- **Beginner Stories** — 15 stories across A1/A1+/A2 (8 · 5 · 2 by level), each in EN (canonical) · FR ·
  ES with a Hebrew native gloss and a 3–4-question comprehension quiz. Folk tales (Three Little Pigs,
  Goldilocks) are ORIGINAL simplified adaptations. Vocabulary deliberately recycles animals/colors/
  food/fruit/veg/numbers/family/routines/clothing/house/weather/transport/market/verbs.
- **UI** (`Reading.tsx`): collection browse → story list (title · A1/A2 · est. time · done/resume) →
  full-screen reader. Three persisted **modes** — Original / Bilingual / Tap-to-reveal — sentence by
  sentence (generous spacing), each word **tappable** (Universal Tap → the ONE Foundation sheet;
  reading position is preserved since the reader never unmounts). Per-sentence 🔊 + whole-story play/
  pause/resume/repeat/loop/speed/sleep-timer/bookmark/Wake Lock all come from `useParrotPlayback` +
  `PlaybackControls`. Reached from a new **Read Stories** Home card (view `reading`).
- **Tests** (`reading.test.ts`, 15): lazy load, unique ids, level ranges, **language parity** (all 15
  complete in en/fr/es), playback-item + language-switch contract, quiz scoring, streak transitions,
  and store persistence (mode · forward-only resume · completion + best-score).

### Sprint 6 — Remove the Home Quick Translator (2026-07-18)
Removed the experimental Quick Translator from Home cleanly — Home now goes straight to Quick Settings,
the four action cards and Continue, with no dead UI, state, CSS or strings left behind. No change to
Missions, Foundation, Parrot Mode, Core, Bootcamp, language selection, progress or navigation. Gates
green (typecheck · lint · 811 tests · build · smoke).
- **Deleted** `features/home/QuickTranslator.tsx`, its pure logic `quickTranslate.ts`, and its test
  `quickTranslate.test.ts` (the whole feature was self-contained — nothing else imported them).
- **Cleaned** `Home.tsx` (removed the import + render + stale hero comment; nudged the first section's
  top margin so nothing feels cramped under the language strip), `app/styles.css` (removed the dead
  `.quick-translator` / `.qt-*` block), and `shared/i18n/strings.ts` (removed the four translator-only
  keys × en/he). Living docs (overview + project structure) updated to drop the hero from the Home
  description.
- No translator entry point remains in the production Home screen; `grep` for
  `QuickTranslator|quickTranslate|quickTrans|qt-` over `apps/web/src` is empty.

### Sprint 5 — Global speech-speed: add 0.5× (2026-07-18)
Extended the ONE shared Parrot-Mode speed configuration with a **0.5×** option so beginners can slow
every spoken sentence right down; default stays **1×**. No new engine, no duplicate speed logic, no
redesign. Gates green (typecheck · lint · 814 tests · build · smoke).
- **One source, propagated everywhere**: `PlaybackSpeed` (`shared/playback/types.ts`) is now
  `0.5 | 0.75 | 1 | 1.25`. The set is consumed once by `DEFAULT_SETTINGS`/`sanitizeSettings`
  (`preferences.ts`) and the `SPEEDS` selector (`PlaybackControls.tsx`), and flows through
  `buildUtterancePlan` → each `speak` step's `rate` → the existing `tts.speak(rate)` layer. Every
  Parrot surface (Core Words, Core Sentences, Dialogue Transcript, single-item taps) picks it up with
  zero per-surface change; the global speech-rate slider and per-line mission pacing are untouched.
- **UI**: the speed selector now exposes `0.5× · 0.75× · 1× · 1.25×` in that order everywhere it
  renders (label `${s}×`), with the active value shown selected.
- **Persistence**: unchanged shared `ready.parrot.settings` key; 0.5× survives refresh. Corrupt/legacy
  values still fall back to 1×.
- **Tests** (`playbackPlan.test.ts`, `preferences.test.ts`): 0.5× propagates to every spoken step;
  0.5× is accepted by sanitize (invalid → 1×); a real persist→load round-trip restores 0.5×.

### Sprint 4 — Complete Spanish learning-language integration (2026-07-18)
Added **Spanish (`es`, speech locale `es-ES`)** as a complete learning language at full parity with
English, through the existing data-driven seams only — no engine, schema, or pedagogy changes. Gates
green (typecheck · lint · 814 tests · build · smoke · parity · export · `gen:conversations` zero diff).
- **Registration** — `languages.ts` flips `es` to `available/coreAvailable/earlyAccess: true`,
  `bootcamp: 'full'`. Picker, onboarding, appStore validation, TTS voice profile (already present)
  and exports light up with zero screen changes. Saved EN/FR selections stay valid; invalid values
  still fall back to the pilot.
- **Bootcamp 30/30** — `features/bootcamp/es/` (recovery kit + `day1..30` + `index`), registered in
  `registry.ts` under `es`. Each mission mirrors its English counterpart exactly (step count, item
  count, dialogue count, speaker order, exercise semantics, checkpoint reuse days 10/18/24) with
  natural neutral-international Spanish targets and unchanged `{en,he}` glosses. No Spanish video yet →
  Mission 2 keeps its intro/again video steps but sets no `introVideo`, so they degrade to an honest
  "video unavailable" (never an English video).
- **Core 511 / Foundation** — `content/core-corpus/data/es-pilot.ts` realizes ALL 511 concepts onto
  the same concept rows (stable ids, categories, ranking, emoji preserved) → `core-es.v1.json` pilot
  pack via the existing builder. `spanishExamples.ts` supplies all 192 Foundation example sentences.
  Foundation, Universal Tap, Parrot Mode and Core games work in Spanish through the one shared path.
- **Validation** — `es/es-missions.test.ts` (30/30 structural parity + `es.*` ids + Spanish-primary +
  bilingual transcript + no French leaks) and `es-pilot.test.ts` (500/500 slug parity, no orphans,
  genuine Spanish forms). `scripts/parity.ts` measures ES: Core 511/511, Bootcamp 30/30, Fnd 192/192,
  Audio es-ES — all 100%.
- Honest status: Spanish content is **AI-drafted, pending native review** (marked Early Access).

### Sprint — Parrot Mode Completion: loop, sleep timer, speed, pause, prefs, bookmarks (2026-07-17)
Extended the ONE shared playback module (no second engine/controls; no content/schema/pedagogy
changes; `gen:conversations` zero diff; EN/FR parity + offline preserved). Gates green
(typecheck · lint · 740 tests · build · smoke). All logic lives in `shared/playback` and is available
identically on Core Words, Core Sentences and the Dialogue Transcript.
- **Continuous Loop** (`planNextCycle`) — OFF finishes (status `finished`, Wake Lock released); ON
  starts a fresh cycle (sequential from item 0; random reshuffles and avoids an immediate boundary
  repeat).
- **Sleep timer** (Off/10/15/30/60) — a framework-free `sleepTimer.ts` controller that counts only
  active playback time (pause pauses it, resume continues the remainder), resets on duration change,
  and on expiry stops cleanly, releases the lock, keeps the item as the resume position and shows a
  non-blocking notice + compact `M:SS` countdown. Disposed on unmount.
- **Playback speed** (0.75×/1×/1.25×) and **Pause duration** (Short/Normal/Long) — both flow from the
  ONE `PAUSE_PRESETS` mapping and the utterance plan through the existing `tts.speak(rate)`; no second
  speaker.
- **Persistence** (`preferences.ts`) — all seven prefs persist via the existing localStorage
  convention with `sanitizeSettings` validation/fallback; "currently playing" is never stored (no
  auto-start after refresh).
- **Listening bookmarks** — last item remembered per surface by stable content id
  (`words:<lang>` · `sentences:<lang>` · `transcript:<lang>:<dialogueId>`); returning refocuses it,
  a missing id falls back to the first item. Never auto-plays.
- **Random hardening + Transcript restart fix** — a shuffle is a complete cycle; pause/resume and
  repeat/translation/speed/pause changes never reshuffle; `restart()` now restarts the ACTIVE
  sequence (line 0 sequential; shuffle position 0 random) instead of confusing content index with
  shuffle position.
- **Wake Lock hardening** — held only while playing; released on pause/finish/expiry/unmount;
  re-acquired on resume and on visibility return; unsupported browsers are a silent no-op.
- **Controls redesign (progressive disclosure)** — primary row (Prev · Play/Pause · Next · Repeat)
  always visible; the rest (Translation · Order · Loop · Speed · Pause · Sleep timer) in a collapsible
  panel. A11y: translated aria-labels, aria-pressed/aria-expanded, `:focus-visible`, a polite
  status-only live region, reduced-motion honoured. All strings EN + HE.

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
