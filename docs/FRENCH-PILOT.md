# READY — French Pilot (status & plan)

> **Honest status: French is NOT a shippable learning language yet.** This sprint delivered the
> *foundation* — a validated proof that French is content-only through the existing pipeline, plus
> the validator gate that prevents a half-French pack from ever shipping. The full French Core 500
> and French Bootcamp are **deferred** to their own content sprint (see §7). Nothing in this
> document claims native review.

---

## 1. Scope delivered this sprint (foundation only)

- **Proof that French is content-only.** `content/core-corpus/fr-proof.ts` is a small set of
  genuine, high-value French travel realizations (17 concepts: glue, directions, places, transport,
  water, doctor, help). The SAME pure functions the English builder uses (`validateCorpus`,
  `buildPackWords`) turn these rows into a valid `core-fr` pack — proven in
  `content/core-corpus/fr-proof.test.ts`. No engine, component, or store was forked for French.
- **The partial-pack gate is now testable and enforced for any language.** `validateCorpus` gained
  an optional `declaredLangs` argument (default = production `DECLARED_LANGS`). A French pack that
  is missing even one `t.fr` realization is **rejected** (`missing "fr" realization`), and French
  realizations are rejected entirely unless `fr` is declared (`undeclared language "fr"`). This is
  the sprint's "validator rejects partial packs" requirement, proven with real French.
- **Game TTS is now learning-language aware.** Picture Quiz and Swipe Recall previously hardcoded
  `speak(word, 'en')`; they now take a `lang` prop and speak the active learning language, so a
  French pack will pronounce with the French voice. TTS locale for French is `fr-FR`
  (`apps/web/src/shared/i18n/languages.ts`).

## 2. What is deliberately NOT done (and why)

- **French is not added to `DECLARED_LANGS`.** Declaring `fr` is all-or-nothing: the validator
  requires a `t.fr` on **every** one of the 500 production concepts or the content build fails. We
  do not have a reviewed 500-concept French set, so declaring `fr` now would break the build (or
  force fake content). The production corpus stays English-complete; `fr` joins `DECLARED_LANGS`
  only as the *final* step of the real French Core sprint.
- **French stays `available: false`** in the language registry, so it cannot be selected in
  onboarding/Profile. `appStore.setLearningLang` refuses any language whose registry entry is not
  `available` — French cannot be entered until its content is complete. This keeps the pilot honest.
- **No French Bootcamp missions were authored.** ~29 missions with dialogue trees, recovery
  branches, quizzes and transcripts is a multi-week authoring effort and is out of this sprint.

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
