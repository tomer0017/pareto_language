# Sprint 9 — Bootcamp Polish · QA Report

**Scope:** Refinement only. No new features, no architecture / DB / pipeline / engine changes.
**Focus:** Chrome audio stability, learning-flow pacing, full-dialogue experience, offline, regression.

Verification suite (all green):

| Gate | Result |
| --- | --- |
| `npm run typecheck` (monorepo + web) | ✅ clean |
| `npm run lint` (eslint) | ✅ clean |
| `npm run test` | ✅ **170 passed** (17 files) |
| `npm run build` (content + web + PWA) | ✅ clean |
| `npm run smoke` | ✅ **SMOKE PASS** (incl. offline cache assertions) |

New tests: `apps/web/src/features/bootcamp/transcript.test.ts` (24 cases). Existing tts + bootcamp suites still pass.

---

## P0 — Chrome Audio Stability

### Root cause (the real one)
The Sprint 8 fix (gesture unlock) was correct but **incomplete**. It solved *"audio never starts"* but not *"audio works then stops."* Those are two different Chrome bugs:

1. **Autoplay unlock** (Sprint 8, already fixed): Chrome refuses `speechSynthesis.speak()` unless first primed inside a user gesture.
2. **Engine self-pause / watchdog** (this sprint): once running, Chrome's speech engine does **not** stay alive on its own. It dies silently — no error event — in two documented ways:
   - **(a) ~15s internal watchdog** kills/pauses long-running synthesis.
   - **(b) Tab visibility:** backgrounding the tab (tab switch, minimise, screen lock) **pauses** the engine, and Chrome routinely leaves it **stuck `paused`** on return — so every subsequent `speak()` enqueues behind a paused engine and never plays. This is the exact "worked at launch, dead later" symptom.

Both bugs share one lever: `speechSynthesis.resume()`.

### Fix (`apps/web/src/shared/audio/tts.ts`)
- **Resume keep-alive:** while any utterance of ours is live, a 5 s interval calls `resume()` (5 s < the 15 s watchdog). It defeats the watchdog *and* un-sticks a spontaneously-paused engine, then stops itself once the queue is idle. No-op on Safari/Firefox.
- **Visibility handler:** on `visibilitychange → visible`, call `resume()` so the next (and any in-flight) `speak()` actually plays after a tab switch.
- **`cancelSpeech()` export:** clean cancel used on step advance, mission exit, player unmount and reader close — no audio bleeds across steps or routes.
- This is the **canonical engine-level fix**, not a per-call retry hack (documented inline as ROOT CAUSE #2).

### Lifecycle checklist (each verified against the new code path)
| Scenario | Behaviour |
| --- | --- |
| Page refresh | Gesture-unlock re-primes on first tap; keep-alive fresh. |
| Route change / back nav | `MissionPlayer` unmount → `cancelSpeech()`; keep-alive cleared. |
| Next step | `advance()` cancels prior audio before the next step speaks. |
| Replay (same sentence, repeated) | Each replay cancels + re-speaks; keep-alive restarts. Unlimited. |
| Multiple consecutive speaks / queue | `cancel()` before each new utterance; keep-alive spans the active one. |
| Tab switch / visibility change | `resume()` on return un-sticks the paused engine. |
| Mission restart / replay same sentences | Idempotent unlock + keep-alive; no stale state. |

**Known limitation:** the fix is validated by code path + the tts unit test, but the tab-switch resume behaviour is inherently a *real-Chrome* concern. It could not be empirically driven inside this environment (no interactive Chrome session) — recommend one manual pass on a real device before release. The implementation follows the well-established community fix for this exact Chrome defect.

---

## P1 — Learning Flow (teach, don't rush)

**Problem found:** `QuizStep`, `RepliesStep`, `AmbushStep` auto-advanced ~700 ms after an answer — no time to learn, no explanation, no translation, no replay.

**Fixed** — every answer now **pauses on a shared "learn" surface** (`AnsweredView`) with manual `NEXT`:
- ✓/✗ success/failure state (green / red header).
- The correct answer **highlighted** in a prominent pill.
- The **translation** (native-language meaning) shown.
- The learning **tip** where the item has one.
- 🔊 **Hear again** — unlimited replays.
- "No rush — replay it, say it aloud, jot it in your notebook" prompt.
- Advances **only** on `NEXT`. Wrong answers can stay on-screen indefinitely.

`RepliesStep` now pauses between **each** reply (not just at the end). `AmbushStep` gained a replay of the fast NPC line before answering, plus the same learn-then-NEXT surface.

---

## P2 — Full Dialogue Experience

- **New pure linearizer** `transcript.ts` → `dialogueTranscript()` collapses the branching visual-novel tree into the **one canonical conversation** (happy path: always the correct choice, never a recovery detour), with a cycle-guard so a malformed tree can never hang. 24 tests cover all 10 missions + a pathological loop.
- **New `DialogueReader`** — a premium study-sheet reader:
  - Every line, both languages, with speaker label.
  - Per-line 🔊 replay.
  - Transport: **Play all · Pause · Restart · Previous · Next** (one sentence at a time).
  - **Currently-playing line highlighted** + auto-scrolled into view.
  - Cancels audio + aborts the play-all loop cleanly on close/unmount.
- **"🎧 Listen to the full conversation"** shortcut at the start of every mission (step 0) → the Listen → Understand → Learn → Practice arc.
- **"📖 Review the full conversation"** on the mission summary → the dialogue becomes the final study sheet.

---

## Offline Mode

Verified — the Bootcamp is **offline-complete by construction**:
- Missions, dialogues and the transcript are **bundled JS** (`day1–10.ts`) — no network.
- Audio uses **Web Speech** (on-device) — works offline; asset-first path degrades gracefully to TTS.
- Progress, receipts, resume-point, and `ReviewEvent`s persist to **localStorage** + the append-only log.
- Content-pack path is already **API → IDB cache → static fallback** (`ApiProvider → LocalProvider`), unchanged.
- `npm run smoke` asserts offline directly: *"content pack served from cache with network disabled"*, *"memory states / plan intact after offline reload"*, *"pack fetched exactly once (then cached)"* — all pass.

**Limitation:** pre-recorded audio **assets** (the asset-first branch) are not part of the PWA precache today, so offline audio falls back to on-device TTS. That is by design and unchanged this sprint.

---

## QA fixes (UX polish applied without asking)

- Removed the rushed 700 ms auto-advance across all quiz-type steps (learning friction).
- Consistent button surfaces: single `AnsweredView` surface reused by quiz / replies / ambush — one look, one interaction.
- Audio never bleeds between steps or when leaving a mission (cancel on advance / exit / unmount).
- Reader transport buttons normalised to consistent heights (no mixed ghost/primary rows).
- Full Hebrew + English strings for every new control (no untranslated UI).

---

## Regression — verified safe

- **Architecture / engine / DB / pipeline:** untouched.
- **Data model (`types.ts`):** unchanged — the reader is a *read-only projection* of existing dialogue trees.
- **Multilingual:** all new UI strings shipped in `en` + `he`; content stays `LocalizedText` via `L()`.
- **Store & persistence:** `bootcampStore` untouched; resume/receipts/events identical.
- **Existing dialogue-graph invariants:** the 33 bootcamp data-integrity tests still pass; the linearizer is additive.
- **Audio diagnostics snapshot** (the white-screen regression guard): still stable — tts test passes.
- Full suite: **170/170**.

---

## Remaining known limitations

1. **Chrome tab-switch audio** — fix is code-correct and follows the canonical resume pattern, but wants one manual real-device confirmation (no interactive browser available here).
2. **Offline pre-recorded audio** — TTS fallback offline; recorded assets are not precached (unchanged, out of sprint scope).
3. **Reader = happy path only** — by design it shows the ideal conversation, not the recovery branches (those remain a teaching device inside the live scene).
4. **Wrong-answer explanation** is meaning-centric ("here's what it actually means") rather than per-distractor ("you picked X"); sufficient for these listen-for-meaning quizzes, could be enriched later.
