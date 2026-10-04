# READY Core 30 — Curriculum V1.0 — Final Report

_2026-10-04 · final dialogue audit pass on the Core 30 · English / French / Spanish, Hebrew gloss_

**Status: READY Core 30 — Curriculum V1.0 LOCKED** — structure, dialogues, four-language parity and automated guards. A closing round of eight micro-fixes was applied after the audit pass (section 3a). Linguistic status: **AI linguistic review completed; native review still recommended.** Nothing was opened in a browser and no footage was watched.

Files:

- Final dialogues: [ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md](./ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md) (generated from the runtime; a test fails if it is stale)
- Video actions: [CORE_30_FINAL_VIDEO_ACTION_MAP.md](./CORE_30_FINAL_VIDEO_ACTION_MAP.md)
- Snapshot before this pass: [archive/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2-pre-final-audit.md](./archive/ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2-pre-final-audit.md)
- The restructure that preceded this pass: [CORE_30_RESTRUCTURE_REPORT.md](./CORE_30_RESTRUCTURE_REPORT.md) (historical; where the two differ, this report is current)

---

## 1. Executive summary

The 30-mission architecture was not touched: same missions, same order, same ids, same registry keys, checkpoints at 10 / 18 / 24 / 30, Recovery outside the count.

This pass implemented the mission-by-mission audit decisions in the runtime content:

- **12 missions unchanged in dialogue** (02, 03, 05, 08, 09, 11, 17, 18, 20, 21, 24, 27).
- **10 missions with a small fix or small rewrite** (01, 06, 07, 12, 13, 14, 16, 19, 23, 26), plus one-line polish in 22, 29 and 30.
- **5 missions rewritten or rebuilt** (04, 10, 15, 25, 28).

Languages were normalised in one controlled pass: British-leaning English ("centre"), es-ES Spanish ("billete"), the tu / vous and tú / usted split kept, and more natural French and Hebrew for "I don't think so".

The generated document now shows scene boundaries, so a multi-scene mission no longer reads as one conversation.

Twenty-one new automated checks protect the audit decisions. All repository gates pass.

Three things you should know that are not "all green":

1. **Mission 01's change costs two existing videos** (`En_day1`, `Fr_day1`), and the one-word change in Mission 06 puts `En_day10` in question. Seven of the fifteen existing files now need replacing; see the video map.
2. **Resolved in the micro-fix round:** the Mission 30 Vietnam line now follows "How long will you be there?" → "I'll be there for two weeks.", and Mission 10's "Here you go." is scored as itself.
3. **Three scenes end one NPC line later than the audit script** (Mission 10 scenes 1 and 2, Mission 25 scene 1), because the runtime requires a scene to close on the other speaker. The added lines are short closings ("Welcome. Enjoy your stay!", "Thank you! Have a good evening!", "Good luck!").

---

## 2. Final Core 30

| # | Mission | Final status | What changed in this pass | Main learner-production goal |
|---|---|---|---|---|
| 01 | Introduce Myself | Small fix | Closing line simplified. | My name is…, I'm from…, it's my first time here. |
| 02 | Numbers & Money | Keep | Nothing. | How much is it? One…, by card. |
| 03 | Coffee Shop | Keep | Nothing. | I'd like…, answering every follow-up question. |
| 04 | Everyday Core | Rewritten | One long scene became two short ones. | I want / need / have / don't have / can / can't / don't know; Do you have…? Can you…? |
| 05 | Directions | Keep | Nothing. | Where is…? Is it far? Can you show me on the map? |
| 06 | Airport & Border | Small fix | "Lovely." → "All right."; "centre". | Here is my passport, on holiday, for two weeks, at a hotel, nothing to declare. |
| 07 | Taxi / Uber | Small rewrite | Natural recovery exchange. | To this address, how much, please speak slowly, stop here, keep the change. |
| 08 | Hotel Check-in | Keep | Nothing. | I have a reservation, under the name…, is breakfast included? |
| 09 | Shopping | Keep | Nothing. | I'm just looking, can I try this on, a bigger size, I'll take it. |
| 10 | CHECKPOINT: Arrival Day | Rebuilt | Border → taxi → hotel, three scenes. | Recombination of Missions 06–08. No new sentences. |
| 11 | Small Talk & Recommendations | Keep | Spanish: "¿Le gusta este lugar?". | How about you? I like it a lot. Can you recommend a place? |
| 12 | Time & Plans | Small rewrite | Past-tense line removed. | Maybe later, I'm free tonight, what time, let's meet here at seven. |
| 13 | Home, Family & Daily Routine | Small rewrite | New, natural opening. | I'm going to eat at my grandmother's, I'm tired, I'm going home / to sleep. |
| 14 | Restaurant Meal | Small rewrite | Request rides with the order; "Anything else?" → "That's all, thanks." | A table for two, I'll have…, without…, that's all, the bill. |
| 15 | Food Preferences & Allergies | Rewritten | Allergy and diet separated; kitchen check, no guarantee. | I'm allergic to…, I'm vegetarian, does it have…?, without…. |
| 16 | Hobbies & Free Time | Small fix | Opening is now "Are you free today?". | I like / love / don't like, I usually…, I want to try…, do you like…? |
| 17 | Supermarket & Everyday Shopping | Keep | Nothing. | Where is…? Just this. Could I get a bag? |
| 18 | CHECKPOINT: Everyday Day | Keep | Spanish wording only. | Recombination of Missions 02–16. No new sentences. |
| 19 | Public Transport | Small fix | Platform is asked for, not announced first; "centre", "billete". | One ticket to…, which platform, does this stop at…? |
| 20 | Past & Recent Events | Keep | Nothing. | I went, I saw, I ate, I stayed, it was…, what did you do? |
| 21 | Future Travel & Plans | Keep | Nothing. | I'm going to…, I'll be there for…, I want to…, after that…, where next? |
| 22 | Fixing Problems | Structure fix | Already two runtime scenes; now shown as two in the document. "right away". | This isn't what I ordered, I was charged twice, X isn't working, can you fix it, can I change rooms? |
| 23 | Opinions, Feelings & Reactions | Small rewrite | "I'm not sure" added; ends with a decision. | I think…, I don't think so, because…, maybe, I'm not sure, let's do it. |
| 24 | CHECKPOINT: City & Conversation | Keep | Spanish wording only. | Recombination of Missions 11–23. No new sentences. |
| 25 | Lost / Stolen / Police | Rewritten | Two scenes: a passer-by, then the police station. | I can't find…, I think it was stolen, my phone was stolen, where is the police station, I want to report it. |
| 26 | Pharmacy & Health | Small rewrite | "This may help." and "follow the instructions on the label". | I have a headache, I'm allergic to…, how often, something for a cold. |
| 27 | Emergency | Keep | Nothing. | I need help, someone is hurt, call an ambulance, I'm at…, I'll stay here. |
| 28 | No Subtitles | Rewritten | Three scenes in known language; idioms removed; mismatch fixed. | Nothing new — known sentences at natural speed. |
| 29 | Dress Rehearsal: Full Evening | Keep + polish | One NPC line. | Nothing new — one take. |
| 30 | A Complete Day Abroad Alone | Small rewrite | The Vietnam disagreement line. | Everything, including "Please speak slowly." |

---

## 3. Mission-by-mission change log

**01 Introduce Myself — small fix.** Last NPC line: "Well, enjoy your stay! Let me know if you need anything." → "Enjoy your stay! Have a great day!" (FR "Bon séjour ! Bonne journée !", ES "¡Que disfrute su estancia! ¡Que tenga un buen día!").

**02 Numbers & Money — keep.** No change.

**03 Coffee Shop — keep.** No change.

**04 Everyday Core — rewritten.** Scene 1, hostel desk (polite register): need a towel, have my key, don't have the password, do you have a map, can you show me. Scene 2, a friend (informal register): want a coffee, don't know the way, can walk, can't come to dinner. "Yes, I know." and "Can you help me?" remain taught as swap-in sentences. The scene 1 opening has "Hi!" added; the content is otherwise the audit script.

**05 Directions — keep.** No change.

**06 Airport & Border — small fix.** "Lovely." → "All right." (Hebrew gloss adjusted; French and Spanish were already neutral). "city centre".

**07 Taxi / Uber — small rewrite.** Price line split into two sentences. Recovery: "Sorry, please speak slowly." → "Sure. About fifteen euros. There's a lot of traffic."

**08 Hotel Check-in — keep.** No change.

**09 Shopping — keep.** No change.

**10 CHECKPOINT: Arrival Day — rebuilt.** Three scenes: border, taxi, hotel. Every learner line is a sentence taught in Missions 06–08, under its existing id. "Here you go." is the Hotel Check-in sentence and is scored as itself; "Stop here, please. Keep the change." and "I have a reservation, under the name Cohen." are spoken the way their teaching missions speak them. Two short NPC closings were added (see summary, point 3).

**11 Small Talk & Recommendations — keep.** Spanish "¿Le gusta esto?" → "¿Le gusta este lugar?".

**12 Time & Plans — small rewrite.** "We ate there yesterday — it was very good." → "It's very good there." No past tense remains in the mission.

**13 Home, Family & Daily Routine — small rewrite.** New opening: come in → "Thanks. Your home is beautiful." → living room → "Is this sofa new?" → "Where is your family?". The back-to-back "sit here" / "let's sit in the living room" is gone. The rest is unchanged.

**14 Restaurant Meal — small rewrite.** "I'll have the chicken, without onions, please." → "Of course. Anything to drink?" → water → "Anything else?" → "That's all, thanks."

**15 Food Preferences & Allergies — rewritten.** "Any other allergies or dietary restrictions?" → "I'm vegetarian." The waiter says the risotto is vegetarian and that he will check with the kitchen about the nuts; he tells the kitchen about the allergy and comes back. No safety claim anywhere.

**16 Hobbies & Free Time — small fix.** "A free day today?" → "Are you free today?".

**17 Supermarket & Everyday Shopping — keep.** No change.

**18 CHECKPOINT: Everyday Day — keep.** Structure unchanged.

**19 Public Transport — small fix.** "That's three euros. It leaves every ten minutes." → "Which platform?" → "Platform two. Straight ahead."

**20 Past & Recent Events — keep.** No change.

**21 Future Travel & Plans — keep.** No change.

**22 Fixing Problems — structure fix.** The mission was already two runtime scenes; the generated document used to print them as one list, which is what made them read as one conversation. They are now shown as Scene 1 and Scene 2. "I'll send someone today." → "right away."

**23 Opinions, Feelings & Reactions — small rewrite.** Ending: "Maybe. I'm not sure — I'm tired." → "Come on — it's only two hours, and it's free." → "Okay, let's do it." → "Great! See you at six!". "Of course!" is no longer a turn in this dialogue but stays a taught sentence of the mission (Mission 24 reuses it).

**24 CHECKPOINT: City & Conversation — keep.** Structure unchanged.

**25 Lost / Stolen / Police — rewritten.** Scene 1, a passer-by: can't find my phone, I think it was stolen, where is the police station. Scene 2, the police station: my phone was stolen, on the bus this morning, I want to report it, I have my passport. Swap-in variants taught but not in the dialogue: "I lost my passport.", "I can't find my wallet."

**26 Pharmacy & Health — small rewrite.** "Good to know. This may help." and "Twice a day, after meals. Please follow the instructions on the label." "It hurts here." remains an alternative first line.

**27 Emergency — keep.** No change.

**28 No Subtitles — rewritten.** Three scenes — transport, restaurant, small talk — in which every learner sentence comes from an earlier mission. "Good call", "last one in", "you've gotta", "got a second?" removed. "Beautiful place, right?" is answered by "This place is beautiful."

**29 Dress Rehearsal — keep + polish.** "Here's the right dish — and it's on the house."

**30 A Complete Day Abroad Alone — small rewrite.** "How long will you be there?" → "I'll be there for two weeks." → "Two weeks in Vietnam? I think that's too short." → "I don't think so." → "Ha! Maybe you're right. Have a great trip!". The recovery ending is intact: long sentence → "Please speak slowly." → shorter repeat → "Okay, thank you."

### 3a. Closing micro-fixes

| # | Mission | Fix |
|---|---|---|
| 1 | 30 | Inserted "How long will you be there?" → "I'll be there for two weeks." before the Vietnam opinion. Learner line reuses Mission 21's `phrase.future.ill-be-there`; no new sentence. |
| 2 | 10 / 08 | "Here you go." was a learner line in Hotel Check-in with **no sentence id**. It now has one, `phrase.hotel.here-you-go` (EN "Here you go." / FR "Voilà, tenez." / ES "Aquí tiene."), attached to that existing line; Mission 10 reuses it. The French checkpoint line changed from "Voilà." to "Voilà, tenez." to match. Mission 08's dialogue wording is unchanged. |
| 3 | 21 | Hebrew gloss: "אני רוצה לטייל באופנוע." |
| 4 | 22 | Spanish: "¡El postre corre por cuenta de la casa!" |
| 5 | 26 | Spanish: "Gracias por decírmelo. Esto puede ayudarle." |
| 6 | 29 | Spanish: "Aquí tiene el plato correcto — y corre por cuenta de la casa." |
| 7 | 23, 30 | Spanish "I don't think so.": "No lo creo." One item (`phrase.opin.dont-think-so`), so both missions follow. |
| 8 | 30 | Hebrew closing: "לילה טוב — תישן טוב!" |

---

## 4. Language normalisation

**English.** British-leaning, internationally plain. "center" → "centre" in every Core mission (items, dialogue lines and glosses); a test forbids "center". "holiday", "till" and "motorbike" kept. Apostrophes in lines edited in this pass are straight. Two older lines in Shopping still use a typographic apostrophe ("it’s on sale", "I’ll ring you up"); left alone because the mission is KEEP.

**French.** Register split kept: vous for service and strangers, tu between friends and travellers (Missions 12, 13, 16, 20, 21, 23, the friend scene of 04, and friend scenes in 18, 24, 30). "I don't think so." is now "Je ne crois pas." Mission 04's friend scene and its expected-reply items moved from vous to tu.

**Spanish (es-ES).** "boleto" → "billete" everywhere in the Core (Public Transport, No Subtitles, the City checkpoint, and one border cold-open line); a test forbids "boleto". Usted for service and strangers, tú between friends. "¿Le gusta esto?" → "¿Le gusta este lugar?".

**Hebrew.** "I don't think so." is now "לא נראה לי" instead of the literal "אני לא חושב". New lines were written as natural Hebrew rather than word-for-word. Hebrew remains a gloss, written in the masculine singular like the rest of the course.

**Parity.** Every Core mission has the same scenes, the same turns in the same order, and the same trained sentences in English, French and Spanish, and the same NPC/You sequence in the Hebrew section. This is enforced per mission by test.

**Review status.** AI linguistic review completed; native review still recommended. No native speaker has read any of this text.

---

## 5. Stable id / progress report

- **Mission ids changed: 0.** **Registry keys changed: 0.** A test now pins all thirty id-and-key pairs.
- **Progress migration required: no.**
- **Files:** Arrival Day (key 9) and No Subtitles (key 27) moved from hand-written per-language files into the shared multilingual specs. Their keys and ids did not change.

**Sentence ids.** No sentence id that existed in the last committed version of the app was removed or repurposed. All id changes below are inside missions that were created in the previous (uncommitted) restructure pass, so no learner can have history on them.

| Change | Ids |
|---|---|
| Added | `phrase.hotel.here-you-go` (an id for an existing Mission 08 line), `phrase.opin.not-sure`, `phrase.opin.lets-do-it`, `phrase.home.beautiful-home`, `reply.home.eat-with-us`, `phrase.lost.phone-stolen`, `phrase.lost.cant-find-wallet`, `reply.lost.did-you-lose-it`, `reply.lost.where-happen` |
| Removed | `phrase.opin.maybe-tired`, `phrase.opin.thats-good`, `reply.home.come-here`, `reply.home.sit-here`, `phrase.lost.lost-phone`, `phrase.lost.lost-wallet`, `reply.lost.what-happened`, `reply.lost.where-last-see`, `reply.lost.police-can-help` |

**Same id, wording adjusted, same function:**

| Id | Now |
|---|---|
| `phrase.border.staying-hotel` | "At a hotel in the city centre." (spelling) |
| `phrase.trans.one-ticket` | "One ticket to the centre, please." / ES "Un billete para el centro, por favor." |
| `phrase.diet.does-have-dairy` | EN "Does it have dairy?" |
| `reply.diet.anything-else-allergic` | "Any other allergies?" |
| `phrase.core.i-want` | "Yes, I want a coffee." |
| `phrase.core.i-dont-have` | "I don't have it." |
| `phrase.home.is-this-new` | "Is this sofa new?" |
| `phrase.lost.was-stolen` | "I think it was stolen." |
| `phrase.opin.dont-think-so` | FR "Je ne crois pas." / ES "No lo creo." / HE "לא נראה לי" |
| `reply.core.*` (four items) | French and Spanish moved to the informal register |

The first four existed before the restructure. A learner's review history on them carries over to the adjusted wording, which is the intended behaviour for a spelling or regional correction.

Canonical sentence count: EN 316 · FR 315 · ES 313.

---

## 6. Video action summary

Full table: **[CORE_30_FINAL_VIDEO_ACTION_MAP.md](./CORE_30_FINAL_VIDEO_ACTION_MAP.md)**.

15 existing files: KEEP 4 · MOVE / RELABEL 3 · REPLACE — DIALOGUE CHANGED 7 · CHECK MANUALLY 1. 21 missions have no video in any language.

REPLACE: `En_day1`, `Fr_day1`, `En_day4`, `Fr_day4`, `En_day6`, `En_day7`, `En_day10` (the last for a single word). The four mismatches recorded by the previous report (`En_day4`, `Fr_day4`, `En_day6`, `En_day7`) are all in this list.

---

## 7. Practice impact map

The Practice architecture was not touched and no game was added.

**Stale references repaired in this pass** (only what was needed for coherence):

| Mission | Repair |
|---|---|
| 04 Everyday Core | Expected-reply items follow the new informal register; scene receipts rewritten. |
| 13 Home, Family | Reply drill, quiz and cold open no longer reference the removed "Sit here." / "Come here."; a key-sentence step added for "Your home is beautiful." |
| 23 Opinions | Key-sentence step now teaches "I'm not sure." instead of the removed "Maybe. But I'm tired." |
| 25 Lost / Stolen | Key sentences, reply drill, quiz and cold open rebuilt around the two new scenes. |
| 10, 28 | Cold opens carried over to the rebuilt scenes; all their items are previously taught sentences. |

**Still mismatched — works, but trains a line the dialogue no longer says:**

| Mission | Detail |
|---|---|
| 14 Restaurant Meal | A key-sentence step teaches "No onions, please." while the dialogue says "…, without onions, please." The reply drill still includes "How was everything?". |
| 15 Food Preferences | The quiz uses "This one is a good option for you." as a distractor; the waiter no longer says it. |
| 17 Supermarket | The reply drill and quiz still use "You need to weigh it first." |
| 26 Pharmacy | The reply drill and quiz use "Take this twice a day."; the pharmacist now says "Twice a day, after meals." "It hurts here." has no key-sentence step. |

**Flagged for pedagogical redesign in the next phase:**

- New missions, running on the generic template: 04, 12, 13, 16, 20, 21, 23, 25.
- Rewritten or rebuilt, running on the generic template: 10, 11, 18, 22, 24, 27, 28, 30.
- Hand-written Practice with the mismatches above: 14, 15, 17, 26.
- Changed lightly in this pass, Practice still valid: 01, 06, 07, 19, 29.
- Unchanged: 02, 03, 05, 08, 09.

The generic template turns every "you will hear" sentence of a mission into review material. For the next phase, the three-level split (must produce / should understand / context only) is already visible in the specs: learner turns and swap-in sentences are the production set, the "hear" list is the receptive set, and other NPC wording is context only.

---

## 8. Validation results

| Check | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass — 62 files, **1182 tests** |
| Core structural suite (`core30.test.ts`) | Pass — 159 tests |
| `npm run build` | Pass |
| `npm run smoke` | Pass on 6 of 7 runs. One run failed two trip-plan checks; see Open issues. |
| `npm run parity` | Pass — Bootcamp 30/30 for French and Spanish |
| `scripts/audit-dialogues.ts` | 0 blockers; 6 wrong-answer branches listed for human reading (all pre-existing) |
| `npm run gen:dialogues-doc` + sync test | Pass — document equals runtime |
| `npm run gen:conversations`, `npm run export:dialogues` | Regenerated (30 missions; 90 screenplay files) |

What the automated checks cover, against the required list:

| # | Guard | Where |
|---|---|---|
| 1–2 | Exactly 30 missions, numbers 01–30 once each | `bootcamp.test.ts`, `core30.test.ts` |
| 3 | Checkpoints only at 10 / 18 / 24 / 30 | both |
| 4 | Recovery not counted | both |
| 5–6 | Turn parity and scene parity in all four document languages | `core30.test.ts` (per mission) |
| 7 | No empty line | `core30.test.ts` |
| 8 | No two learner turns in a row; every scene closes on the NPC | `core30.test.ts` |
| 9 | Checkpoint sentences come from earlier missions, same id and wording | `core30.test.ts` |
| 10 | No Extended Pool mission in the Core | `core30.test.ts` |
| 11 | Every referenced video file exists | `bootcamp.test.ts` |
| 12 | Generated document matches runtime | `core30.test.ts` |
| 13 | Mission ids and registry keys pinned | `core30.test.ts` |
| 14 | No "boleto" in the Spanish Core | `core30.test.ts` |
| 15–16 | Mission 15: vegetarian is not an allergy; no safety guarantee | `core30.test.ts` |
| 17 | Mission 26: no medical guarantee | `core30.test.ts` |
| 18 | Mission 19: platform not announced before it is asked | `core30.test.ts` |
| 19–20 | Mission 28: mismatch gone; only previously taught sentences | `core30.test.ts` |
| 21 | Mission 30: successful recovery present | `core30.test.ts` |

**What was not validated.** Technical validation is complete. Linguistic review was done by AI only. No native speaker reviewed the text. The app was not run in a browser, and no video was watched.

---

## 9. Remaining open issues

1. **Native review** of all French, Spanish and Hebrew text.
2. **Intermittent smoke failure, unrelated to the curriculum.** `scripts/smoke.ts` builds a 7-day trip plan from two separate clock readings, and the planner rounds down (`packages/engine/src/planner.ts`). If a millisecond passes between the readings, the plan has 6 days and two checks fail. It failed once in seven runs. Neither file was changed in this work; not fixed here because it is outside the curriculum.
3. **Seven videos need replacing** and one needs checking; until then the learner hears old wording against a new transcript in Missions 01, 06, 07, 08 and 14.
4. **Practice mismatches** in Missions 14, 15, 17 and 26 (section 7).
5. **Three added NPC closings** in Missions 10 and 25, beyond the audit script (summary, point 3). Say so if you want different wording.
6. **Mission 08 gained one reviewed sentence.** Giving "Here you go." an id means it now appears in that mission's sentence review and in the sentence library. The dialogue is unchanged.
7. **The two rebuilt checkpoints kept their old ids** (`food-day-checkpoint`, `city-day-checkpoint`), so a learner who completed the old versions sees the new ones as done. Unchanged from the previous report; still your decision.
8. **Extended Pool** missions were not normalised (they may still contain "center" and older phrasing) and keep their pre-restructure "Mission N:" headlines.
9. **Nothing is committed.** All changes from this pass and the restructure before it are in the working tree.
