# READY — French (Early Access) status & plan

> **Status: French is live as an EARLY ACCESS learning language** (`available:true`,
> `earlyAccess:true`). It is selectable from onboarding/Profile; the **complete French Core 500** and
> **all 30 Bootcamp missions** are fully usable and at full structural parity with English. The
> architecture is language-agnostic, so finishing French — and adding
> Spanish/Italian/German/Portuguese — is **primarily content**. Nothing here claims native review.

Run `npm run parity` for the live dashboard. Today: **FR corpus 511/511 (100%) ✅, Bootcamp 30/30 (100%) ✅** —
the full 30-mission journey (days 1–30) is authored in French with structural parity to English.
French remains **Early Access** only because the content is AI-drafted and **pending native review** —
not because anything is missing.

## Early Access guarantees (how "no English leaks / never taken into missing content" hold)

- **Progress is per learning language** (`ready.bootcamp.v1.{lang}`, legacy English migrated once) —
  English completions never appear on the French map; switching languages swaps progress and drops
  any active mission.
- **Map**: unbuilt missions are disabled and labelled "Coming Soon"; completion/resume are gated by
  `built`, so a not-yet-authored mission can never render as done or in progress.
- **Home "Continue/Next"** and **Videos** read the *active language's* mission set (`missionsFor`),
  so neither can start an unbuilt French mission or show an English video.
- **Bootcamp audio/dialogue** speak French and gloss in the app language (`speakL` / `dialogueTr`).

---

## 1. What is done — the language-agnostic engine (content-only from here)

- **Bootcamp engine de-Englished.** The mission registry is now pure and language-keyed
  (`registry.ts` → `MISSIONS_BY_LANG` / `missionsFor(lang)`); audio speaks the active learning
  language (`speakL`, was hardcoded `'en'` in ~23 spots); dialogue translations are app-language
  aware (`tr:{en,he,…}` + `dialogueTr`, English identical by fallback); the transcript carries `tr`;
  and id-prefix checks are language-agnostic (`.includes('.phrase.recovery.')`). A language with no
  missions shows honest "not built" — **never** an English fallback.
- **French Core vocabulary: COMPLETE — 500/500 concepts** (`content/core-corpus/data/fr-pilot.ts`),
  built into `core-fr.v1.json` (500 words, 218 game-eligible — identical count to English; PWA-
  precached) via a curated **pilot-pack** path (`mergePilotRealizations` + `validatePilotPack`) that
  never touches the English 500. Core Words + Picture Quiz + Swipe Recall + TTS all work in French
  from it (games take a `lang` prop; `fr-FR` voice). Concept ids/categories/metadata are identical to
  English by construction — only the realization differs (enforced by `corpusParity`, 0 missing / 0 orphans).
- **French Bootcamp Missions 1–2** authored (`fr/day1.ts` Recovery Toolkit, `fr/day2.ts` Introduce
  Myself) + a shared French recovery kit (`fr/recovery.ts`): French target lines with `tr` glosses,
  `fr.phrase.*`/`fr.reply.*` ids (French progress/review isolated from English). They play through the
  SAME engine; the parity checker confirms each structurally matches its English counterpart, and no
  dialogue branch dead-ends. Missions with no French video degrade to an honest "unavailable" (never
  an English video). **Pattern is repeatable — each further mission is a `fr/dayN.ts` file, no engine change.**
- **Parity validators (Phase 7)** — `content/core-corpus/parity.ts` (`corpusParity` — coverage + no
  orphans) and `apps/web/src/features/bootcamp/parity.ts` (`missionParity`, `unreachableOrDeadEnds`).
  Pure, unit-tested, runnable (`npm run parity`); `assert*` FAIL the build for any language declared
  complete while incomplete.

## 2. What is NOT done (brutally honest)

- **Core corpus: DONE (511/511).** No gap. `corpusParity('fr')` passes with 0 missing, 0 orphans.
- **Bootcamp: COMPLETE — 30 of 30 missions authored in French** (days 1–30; days 5–30 added
  2026-07-13/14). Every mission is at genuine **content parity** with its English counterpart —
  identical items/tools/steps/dialogues, natural idiomatic `vous`-French, complete `tr:{en,he}`
  glosses, priming (incl. the 70/80/90 number system), videos, and full recovery-branch dialogues.
  The checkpoint / integration missions (10, 18, 24, 28, 29, 30) reuse earlier French items by id,
  exactly as English does. `missionParity('fr', …)` reports **30/30 covered, complete, 0 missing**, and every
  per-mission structural check (steps/items/dialogues) matches its English source exactly.
- **Foundation examples: French authored (Foundation words).** `features/foundation/frenchExamples.ts`
  provides an authored French example for **all 192 Foundation building-block concepts** (verified by a
  coverage test); the word page shows French first · Hebrew under · French audio, and the tapped
  **surface** is preserved (tapping "combien" shows "combien", with "Combien ?" as a secondary base
  form). AI-drafted, `pending native review`. For Core words OUTSIDE the Foundation taxonomy the app
  still shows the app-language meaning (never English-as-French). A future step folds French examples
  into the corpus for the remaining concepts.
- **French is Early Access because of native review, not coverage.** The full 30/30 Bootcamp and
  511/511 corpus are structurally at parity with English; the only thing standing between Early Access
  and full parity is professional native review of the AI-drafted content.
- **`fr` is not in `DECLARED_LANGS`.** The pilot pack ships a curated subset deliberately; declaring
  `fr` (the all-or-nothing 500 gate) is the final step once every concept is realized and reviewed.
- **No native review.** All French is AI-drafted, `pending_native_review`.

## 3. Translation methodology (for the proof slice, and the standard for the full pack)

- Every French surface form is **AI-drafted and research-plausible**, and each realization the
  pipeline emits is stamped `quality: 'ai_reviewed'` with `reviewNotes: 'pending native review'`
  (`content/core-corpus/corpus.ts` `toConcept`). **None is native-reviewed.** Do not upgrade any
  status to reviewed without a real native French reviewer signing off.
- Prefer contemporary, widely-understood standard spoken French. Teach one high-value default per
  concept; recognition of variants belongs in notes, not in the primary realization.

## 4. tu / vous policy

The pilot teaches the **`vous` (polite) register** as the traveler default: it is correct in every
service interaction a traveler meets (café, hotel, taxi, shop, pharmacy, border) and is never rude.
`tu` is not taught as a production default; where a `tu` form is common it is recorded as a note for
the review report, not as the taught line. Example: `please` → `s’il vous plaît` (not `s’il te
plaît`). This mirrors READY's "one high-value default" rule.

## 5. French grammar metadata — known schema gap

The proof rows carry a `genderNote` (gender / number / article behaviour, e.g. *toilettes* = f.
plural; *hôtel* = m., elided *l’hôtel*) **for the native-review report only**. The canonical
`Concept.realizations` schema does **not** yet have first-class gender / article / plural fields.
**Adding them is a prerequisite for the full French Core 500** (Task B1) — surface form alone is not
enough for correct article/agreement in dialogue. Tracked as the first item of §7.

## 6. TTS locale

- French locale: **`fr-FR`** (declared in the language registry; used by `speak()` via each
  language's `ttsTag`). The global speech-rate preference applies unchanged.
- Do not use an English voice for French — the games now pass the learning language to `speak()`.

## 7. Path to a real French pilot (next sprint, in order)

1. **Extend the realization schema** with grammatical gender / article / plural (and a French
   example + its learner-language translation). Migrate the English pack (nullable) so nothing breaks.
2. **Author `t.fr` for all 500 concepts**, gender-annotated, AI-drafted, `pending_native_review`.
3. **Declare `fr`** in `DECLARED_LANGS`; `npm run build:core` now emits `core-fr.v1.json` and the
   validator enforces completeness. Fix every gap it reports.
4. **Native French review** of the 500 (and of the review report of ambiguous / gender-sensitive /
   multi-realization concepts). Only then may statuses move off `pending_native_review`.
5. **Author the French Bootcamp** using the existing mission types (`day*.ts` shape) — no new step
   types, no French-only engine. Audit that every Bootcamp surface reads the active learning
   language before flipping French on (Part A).
6. **Flip `available: true`** for French in the registry only after 3–5 pass and the acceptance
   criteria in the sprint's Definition of Done are met.

## 8. How to add French mission videos later

Videos are content, not code: a mission references an optional `introVideo.src` (a public path
under `apps/web/public/videos/`, resolved against `BASE_URL`). Add a French video by dropping the
file in and setting `introVideo.src` on the French mission — missing/absent video degrades to an
honest "Coming soon", exactly like English. Do **not** attach an English video as French content.

## 9. Maintaining parity with English

- French must use the same engines, components, stores, games, transcript generator and review log
  as English. If a feature needs a code change to work in French, that is an **architecture** fix
  (make it read the active learning language), not a French fork.
- Keep the English pilot fully functional at every step; French is additive content behind the
  `available` gate until complete.

## 10. Known limitations

- Only a 17-concept French **proof** exists; there is no French Core 500 and no French Bootcamp.
- No grammatical-gender schema field yet (§5).
- All French is AI-draft, `pending_native_review`.
- Manual device verification (iPhone Safari/Chrome, RTL) of a French experience is not possible
  until French content exists and is enabled.
