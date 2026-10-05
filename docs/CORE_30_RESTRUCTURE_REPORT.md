# Core 30 Restructure Report

> **Superseded in part.** A final curriculum pass followed this report. For the current dialogues, video actions and Practice map see **[CORE_30_FINAL_CURRICULUM_REPORT.md](./CORE_30_FINAL_CURRICULUM_REPORT.md)** and **[CORE30_FINAL_VIDEO_ACTION_MAP.md](./CORE30_FINAL_VIDEO_ACTION_MAP.md)**. This file remains the record of the 29 → 30 restructure.

_2026-10-03 · READY Bootcamp, 29 missions → the Core 30 · English / French / Spanish learning content, Hebrew + English glosses_

Companion files:

- **[ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md](./ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md)** — the final dialogues, Mission 01–30, four language sections each. Generated from the runtime (`npm run gen:dialogues-doc`); a test fails if it is stale.
- **[archive/DIALOGUES_BY_MISSION_V1_29-mission-runtime.md](./archive/DIALOGUES_BY_MISSION_V1_29-mission-runtime.md)** — the same document rendered from the runtime _before_ any change (the backup of the 29-mission dialogues).

"Old N" always means the mission's number in the 29-mission curriculum; "Mission N" means its number in the Core 30.

---

## 1. Executive summary

**What changed.** The Bootcamp is now the **Core 30**: 30 missions, checkpoints at 10 / 18 / 24 / 30. Eight missions are new and teach reusable sentence machinery instead of situations — want / need / have / can, time and plans, home and family, hobbies, the past, the future, opinions, and a lost-or-stolen scenario. Small Talk moved from the end of the course (old 22) to Mission 11. Seven old missions are no longer standalone Core missions: two were merged into another mission, one was retired, and four moved to an Extended Mission Pool with their content intact.

**Why.** The old course taught 29 mostly transactional situations. A learner could order, pay and check in, but could not say "I'm going to eat at my grandmother's", "I stayed in a hostel", "Where are you going next?" or "I think it's too expensive". The Core 30 keeps the travel survival and adds the frames that generate ordinary conversation.

**The application uses the new structure.** The runtime content was changed first; the documents are generated from it.

**Three findings worth knowing before reading on:**

1. **The "missing lines" in the supplied reference Markdown were not in the app.** Before editing, every old mission was compared turn by turn across English, French and Spanish in the runtime source: all 29 were already identical in structure. The gaps in the Markdown (French Coffee Shop, Spanish Restaurant Meal, and the rest of that list) came from how that file was produced. Nothing was "restored", because nothing was missing. A test now enforces turn-for-turn parity for every Core mission, so it cannot happen in the runtime either.
2. **The logic defects were real**, and are fixed in all three languages plus the Hebrew gloss: the taxi question, the duplicated breakfast question, the unanswered breakfast question, the incoherent small talk, the two safety guarantees, the unexplained fruit, the lost passport inside the emergency call, and a question in Fixing Problems that was never answered.
3. **No mission id or registry key was renumbered, so no progress migration was needed.** Progress is stored by stable mission id. Reordering is done in `plan.ts`. A mission's `day` is its content-registry key, not its position: Taxi is still `day: 6` and still plays `En_day6.mp4`, and is now shown as Mission 7.

**Scale.** 22 old missions remain in the Core, 8 are new, 7 left. The sentence catalog grew from 242 to 316 canonical sentences in English (FR 315, ES 313).

---

## 2. Final Core 30

| # | Mission | Source | Action | Main learning objective |
|---|---|---|---|---|
| 01 | Introduce Myself | old 01 | Keep | Name, where from, first time here. |
| 02 | Numbers & Money | old 02 | Keep | Prices by ear, how much, cash or card. |
| 03 | Coffee Shop | old 03 | Keep | A full order and every follow-up question. |
| 04 | Everyday Core: Want / Need / Have / Can | NEW | New | I want / need / have / don't have / can / can't / know / don't know; Do you have…? Can you…? |
| 05 | Directions | old 05 | Keep | Ask where something is and understand the answer. |
| 06 | Airport & Border | old 10 | Move | Passport, purpose, how long, where staying, nothing to declare. |
| 07 | Taxi / Uber | old 06 | Move + patch | Destination, price, traffic, speak slowly, stop here. |
| 08 | Hotel Check-in | old 07 | Move + patch | Reservation, name, passport, room and floor, breakfast, elevator. |
| 09 | Shopping | old 08 | Move | Just looking, try on, size, on sale, I'll take it. |
| 10 | CHECKPOINT: Arrival Day | old 09 | Move + patch | Cold taxi → hotel, only known language. |
| 11 | Small Talk & Recommendations | old 22 | Move + rewrite | Where from, first time, I like it, recommend a place, nice talking to you. |
| 12 | Time & Plans | NEW | New | Today / tonight / tomorrow / later; what time, are you free, let's meet at. |
| 13 | Home, Family & Daily Routine | NEW | New | I'm going home / to eat at my grandmother's / to sleep; I'm tired; where is…? |
| 14 | Restaurant Meal | old 04 + old 12 | Merge | Table, menu, order, drink, without X, anything else, everything okay, bill. |
| 15 | Food Preferences & Allergies | old 13 | Move + patch | Allergic, vegetarian, does this have X, without X, checking with the kitchen. |
| 16 | Hobbies & Free Time | NEW | New | I like / love / don't like / usually / want to try; do you like…? |
| 17 | Supermarket & Everyday Shopping | old 16 | Move + patch | Where is X, aisle and left, just this, a bag, card here. |
| 18 | CHECKPOINT: Everyday Day | old 17 (rebuilt) | Rewrite | Coffee, plans with a friend, a purchase, dinner — only known language. |
| 19 | Public Transport | old 18 | Move | Ticket, single or return, platform, every ten minutes, stops. |
| 20 | Past & Recent Events | NEW | New | I went / saw / ate / stayed; it was good; what did you do? |
| 21 | Future Travel & Plans | NEW | New | I'm going to…, I'll be there for…, I want to…, after that…, where next? |
| 22 | Fixing Problems | old 24 + old 11 | Merge | Not what I ordered, charged twice, X isn't working, noisy room, can you fix it, can I change rooms. |
| 23 | Opinions, Feelings & Reactions | NEW | New | I think, I don't think so, why, because, but, maybe, really, of course. |
| 24 | CHECKPOINT: City & Conversation | old 23 (rebuilt) | Rewrite | Transport, a chat with a local, past, future, opinion — only known language. |
| 25 | Lost / Stolen / Police | NEW | New | I can't find, I lost, it was stolen, where is the police station, I want to report it. |
| 26 | Pharmacy & Health | old 25 | Move + patch | Headache, it hurts here, allergic to, something for, how often. |
| 27 | Emergency | old 26 | Move + rewrite | I need help, someone is hurt, call an ambulance, I'm at…, stay there. |
| 28 | No Subtitles | old 27 | Move | Known language at natural speed. |
| 29 | Dress Rehearsal: Full Evening | old 28 | Move | Taxi → restaurant → problem → payment, one take. |
| 30 | A Complete Day Abroad Alone | old 29 (rebuilt) | Rewrite | Needs, taxi, a meal that goes wrong, small talk with past / future / opinion, and one recovery. |

Phases: Foundations (1–5) · Arrival (6–10) · Everyday Life (11–18) · City & Conversation (19–24) · Mastery (25–30).

**Global Recovery Toolkit — not one of the 30.** It remains a shared kit reused inside dialogues. It gained an eighth phrase, "What does that mean?" (FR "Qu'est-ce que ça veut dire ?", ES "¿Qué significa eso?"). The existing "Can you repeat that?" serves as "Can you say that again?". All six help tools appear as valid choices inside Core dialogues, and asking for help is never marked wrong.

---

## 3. Removed and merged content

| Old mission | What happened |
|---|---|
| Old 12 — Restaurant Basics | **Merged into Mission 14, Restaurant Meal.** The merged dialogue adds "Anything else?", "That's all, thanks" and "Is everything okay?" to the Restaurant Meal flow, and the pasta order becomes an equally valid alternative to the chicken. Three sentences were carried over under their original ids, so earlier practice still counts. The old dialogue file is kept as a sentence source (No Subtitles and Dress Rehearsal reuse its lines). |
| Old 11 — Hotel Requests & Problems | **Reusable part merged into Mission 22, Fixing Problems**, as a second short scene: "There's a problem with my room", "The air conditioning isn't working", "Can you fix it?", "My room is very noisy", "Can I change rooms?". The towel and wifi-password requests were not carried over. The old file is kept as a sentence source. |
| Old 14 — Paying Anywhere | **Retired as a standalone mission.** Payment already recurs in Missions 2, 3, 17, 18 and 29. Its file is kept: Dress Rehearsal still uses "I'll pay by card." Its known receipt/reply logic flaw was left as it is, since the mission is no longer shown. |
| Old 15 — Street Food & Markets | Moved to the Extended Mission Pool, unchanged. |
| Old 19 — Tickets & Attractions | Moved to the Extended Mission Pool, unchanged. |
| Old 20 — Wifi, SIM & Practical | Moved to the Extended Mission Pool, unchanged. |
| Old 21 — Souvenirs & Gifts | Moved to the Extended Mission Pool, unchanged. |

Old 17, 23 and 29 (Food Day, City Day and the finale) keep their slot, id and progress, but their dialogues were rebuilt; the old scripts survive in the archive snapshot and in git history.

Nothing outside the Core is registered in the journey, the sentence library, Listen or Videos. Tests assert this.

---

## 4. Extended Mission Pool

Kept complete in English, French and Spanish, structurally tested, and not shown anywhere in the app. No final 31+ numbers are assigned.

| Pool mission | Id (progress key) | Registry key | Useful material |
|---|---|---|---|
| Street Food & Markets | `street-food-markets` | 15 | One of those, how many, light haggling, vendor calls at speed. |
| Tickets & Attractions | `tickets-attractions` | 19 | Two tickets, is there a discount, guided tour, opening times. |
| Wifi, SIM & Practical | `wifi-sim-practical` | 20 | I need a SIM card, do you have a charger, plan and price. |
| Souvenirs & Gifts | `souvenirs-gifts` | 21 | How much is this one, I'll take this one, gift-wrap. |

Where they live: `plan.ts` (`EXTENDED_POOL`) and `extended.ts` (`EXTENDED_MISSIONS`). A learner who completed one of these before the restructure keeps that completion on disk; it is not counted in Travel Readiness while the mission is outside the journey.

Also preserved, as sentence sources rather than future missions: Hotel Requests & Problems, Restaurant Basics, Paying Anywhere (`MERGED_MISSIONS`, `MERGED_SOURCES`).

Their in-mission "Mission N:" headlines still show the old numbers; they will need new ones when the pool is numbered.

---

## 5. Multilingual repair report

Status key: **OK** = unchanged and structurally complete · **Patched** = specific lines changed · **Rewritten** = new dialogue · **New** = new mission.
All four columns always have the same turn structure; this is enforced by test for every mission.

| # | Mission | EN | FR | ES | HE | Repairs made |
|---|---|---|---|---|---|---|
| 01 | Introduce Myself | OK | OK | OK | OK | None. |
| 02 | Numbers & Money | OK | OK | OK | OK | None. |
| 03 | Coffee Shop | OK | OK | OK | OK | None needed: the French runtime already had "Moyen ou grand ?" and "Lait et sucre ?". |
| 04 | Everyday Core | New | New | New | New | — |
| 05 | Directions | OK | OK | OK | OK | None. |
| 06 | Airport & Border | OK | OK | OK | OK | None needed: the Spanish runtime already had "En un hotel en el centro." |
| 07 | Taxi / Uber | Patched | Patched | Patched | Patched | "How much did you expect to pay?" replaced by "Got it. No problem — off we go!"; the learner still asks the price. |
| 08 | Hotel Check-in | Patched | Patched | Patched | Patched | The receptionist no longer asks "Is breakfast included in your booking?" before the learner asks the same thing; they hand over the key instead. Spanish reservation line was already present. |
| 09 | Shopping | OK | OK | OK | OK | None. |
| 10 | CHECKPOINT: Arrival Day | Patched | Patched | Patched | Patched | "Is breakfast included?" is now answered ("Yes, it is included — from seven to ten"). The NPC no longer volunteers the breakfast time before being asked. |
| 11 | Small Talk & Recommendations | Rewritten | Rewritten | Rewritten | Rewritten | Every answer now matches its question. "Where are you from?" → "I'm from Israel. How about you?"; "Is this your first time here?" → "Yes, it's my first time here." Added "I like it a lot" and "What do you recommend?". |
| 12 | Time & Plans | New | New | New | New | — |
| 13 | Home, Family & Daily Routine | New | New | New | New | — |
| 14 | Restaurant Meal | Patched | Patched | Patched | Patched | Merge with Restaurant Basics. "Would you like anything else with that?" → "Anything else?"; "No onions, please. That's all, thanks."; "Is everything okay?" → "Yes, that was delicious! The bill, please." |
| 15 | Food Preferences & Allergies | Patched | Patched | Patched | Patched | "Your food will be completely safe" → "Of course. I will check with the kitchen and come right back." The receipt no longer says "a completely safe meal". |
| 16 | Hobbies & Free Time | New | New | New | New | — |
| 17 | Supermarket & Everyday Shopping | Patched | Patched | Patched | Patched | The line about weighing fruit is gone; the cashier asks "Is that everything?". |
| 18 | CHECKPOINT: Everyday Day | Rewritten | Rewritten | Rewritten | Rewritten | Rebuilt as four short scenes. Every learner line is a sentence taught earlier. Spanish pasta line: not a runtime defect. |
| 19 | Public Transport | OK | OK | OK | OK | None needed: the French runtime already had "Aller simple ou aller-retour ?" and "Quel quai ?". |
| 20 | Past & Recent Events | New | New | New | New | — |
| 21 | Future Travel & Plans | New | New | New | New | — |
| 22 | Fixing Problems | Rewritten | Rewritten | Rewritten | Rewritten | "What did you order?" was answered with "Can you fix it?"; it is now answered with "I ordered the pasta." Hotel scene added from Hotel Requests. |
| 23 | Opinions, Feelings & Reactions | New | New | New | New | — |
| 24 | CHECKPOINT: City & Conversation | Rewritten | Rewritten | Rewritten | Rewritten | Rebuilt: one transport scene and two conversations, instead of three tourism transactions. The copied small-talk incoherence is gone. |
| 25 | Lost / Stolen / Police | New | New | New | New | "I lost my passport." moved here from Emergency, under its original sentence id. |
| 26 | Pharmacy & Health | Patched | Patched | Patched | Patched | "This one is safe for you" → "You can try this one — please read the label first"; dosage is now "The label says: …". Added "It hurts here." as an alternative opening. Receipt no longer says "safe care". |
| 27 | Emergency | Rewritten | Rewritten | Rewritten | Rewritten | One coherent call. Lost-passport exchange removed. Added "Someone is hurt", "Please call an ambulance", "Okay, I'll stay here". |
| 28 | No Subtitles | OK | OK | OK | OK | None needed: the Spanish runtime already had "Voy a tomar la pasta, por favor." |
| 29 | Dress Rehearsal: Full Evening | OK | OK | OK | OK | None needed: both Spanish lines were already present. |
| 30 | A Complete Day Abroad Alone | Rewritten | Rewritten | Rewritten | Rewritten | Rebuilt to reflect the new Core: needs, taxi, wrong dish, a conversation with past / future / disagreement, and one moment solved with "Please speak slowly." |

**Defect accounting.**

- Structural defects (a language missing a turn) found in the runtime: **0**. All 17 reported in the task were checked individually and were artifacts of the reference Markdown.
- Dialogue and logic defects repaired: **10**, each in English, French, Spanish and the Hebrew gloss — taxi question; hotel duplicated question; checkpoint unanswered question; small-talk question/answer mismatch (in Small Talk, and its copy in the City checkpoint); allergy safety guarantee; pharmacy safety claim; supermarket fruit; emergency mixed with lost passport; Fixing Problems unanswered question; the awkward "anything else with that?" exchange in Restaurant Meal.
- Not repaired, deliberately: the Paying Anywhere receipt exchange (mission retired) and the Extended Pool missions (out of scope until 31+).

**Register.** Missions between travelers or friends (12, 13, 16, 20, 21, 23, and the friend scenes in 18, 24, 30) use the informal form in French and Spanish (tu / tú). Service situations and strangers keep the polite form (vous / usted), as before.

**All French, Spanish and Hebrew text is AI-drafted and has not been reviewed by a native speaker.** This is the same status as the rest of the Bootcamp.

---

## 6. Video migration map

No video file was generated, replaced, renamed or deleted. Fifteen files exist: 8 English, 7 French, none Spanish.

Videos are attached to a mission by an explicit path on the mission content, not by its number. File names carry the **registry key**: `En_day6.mp4` is Taxi (key 6), now Mission 7. Do not rename files to follow the new numbers.

Classification is based on the dialogue text. I did not watch the videos, so "KEEP" means "the script did not change", not "the footage was verified".

| Old mission | New mission | Class | Existing video | Explanation |
|---|---|---|---|---|
| 01 Introduce Myself | 01 | KEEP | `En_day1`, `Fr_day1` | Dialogue unchanged. |
| 02 Numbers & Money | 02 | KEEP | `En_day2`, `Fr_day2` | Dialogue unchanged. |
| 03 Coffee Shop | 03 | KEEP | `En_day3`, `Fr_day3` | Dialogue unchanged. Check `Fr_day3` first: if it was produced from the reference Markdown, it may lack the two questions that file was missing. |
| 04 Restaurant Meal | 14 | PATCH | `En_day4`, `Fr_day4` | Four lines changed by the merge (anything else / no onions + that's all / is everything okay / yes, that was delicious). |
| 05 Directions | 05 | KEEP | `Fr_day5` | Dialogue unchanged. No English video yet. |
| 06 Taxi / Uber | 07 | PATCH | `En_day6` | One NPC line changed. |
| 07 Hotel Check-in | 08 | PATCH | `En_day7` | One NPC line changed (ends with "Here is your key."). |
| 08 Shopping | 09 | MOVE | `En_day8`, `Fr_day8` | Same dialogue, new number. |
| 09 Arrival Day Checkpoint | 10 | PATCH | — | Two hotel lines changed. |
| 10 Airport & Border | 06 | MOVE | `En_day10`, `Fr_day10` | Same dialogue, new number. |
| 11 Hotel Requests & Problems | 22 (part) | MERGE | — | AC, noisy room and room change became scene 2 of Fixing Problems. |
| 12 Restaurant Basics | 14 (part) | MERGE | — | Merged into Restaurant Meal. |
| 13 Special Requests & Allergies | 15 | PATCH | — | Final NPC line changed. |
| 14 Paying Anywhere | — | RETIRE | — | No longer a mission. |
| 15 Street Food & Markets | pool | EXTENDED | — | Unchanged, outside the Core. |
| 16 Supermarket | 17 | PATCH | — | One NPC line changed. |
| 17 CHECKPOINT: Food Day | 18 | NEW | — | Rebuilt as Everyday Day; the old script is retired. |
| 18 Public Transport | 19 | MOVE | — | Same dialogue, new number. |
| 19 Tickets & Attractions | pool | EXTENDED | — | Unchanged, outside the Core. |
| 20 Wifi, SIM & Practical | pool | EXTENDED | — | Unchanged, outside the Core. |
| 21 Souvenirs & Gifts | pool | EXTENDED | — | Unchanged, outside the Core. |
| 22 Small Talk | 11 | NEW | — | Rewritten; the old script is retired. |
| 23 CHECKPOINT: City Day | 24 | NEW | — | Rebuilt as City & Conversation; the old script is retired. |
| 24 Fixing Problems | 22 | MERGE | — | Rewritten as two scenes (restaurant + hotel). |
| 25 Pharmacy & Health | 26 | PATCH | — | Two NPC lines changed. |
| 26 Emergency | 27 | NEW | — | Rewritten from the fourth line on; the old script is retired. |
| 27 No Subtitles | 28 | MOVE | — | Same dialogue, new number. |
| 28 Dress Rehearsal | 29 | MOVE | — | Same dialogue, new number. |
| 29 A Complete Day Abroad Alone | 30 | NEW | — | Rebuilt; the old script is retired. |
| — | 04, 12, 13, 16, 20, 21, 23, 25 | NEW | — | Eight new missions. |

**Status of the 15 existing files:**

- 11 are unaffected by text: `En_day1`, `En_day2`, `En_day3`, `En_day8`, `En_day10`, `Fr_day1`, `Fr_day2`, `Fr_day3`, `Fr_day5`, `Fr_day8`, `Fr_day10`.
- 4 now differ from their transcript: `En_day4`, `Fr_day4`, `En_day6`, `En_day7`. They still play in the app; a learner hears a slightly different line than the transcript shows until the audit decides whether to re-shoot.

**Video Audit status: ready to start.** The script for every mission is final in `ALL_LANGUAGES_DIALOGUES_BY_MISSION_V2.md`, and per-language screenplays numbered by mission are in `exports/dialogues/` (`npm run export:dialogues`).

---

## 7. Practice impact map

The Practice system was not redesigned and no game was added. The existing flow runs for all 30 missions.

**Existing Practice can remain as it is** — dialogue and exercises unchanged:
01, 02, 03, 05, 06, 09, 19, 28, 29.

**Dialogue changed, exercises left untouched — need a review pass:**

| Mission | What to review |
|---|---|
| 07 Taxi | Exercises still valid. Low priority. |
| 08 Hotel Check-in | Exercises still valid. Low priority. |
| 10 CHECKPOINT: Arrival Day | Receipts and ambush still valid. |
| 14 Restaurant Meal | The reply drill still trains "How was everything?", which the dialogue no longer says. The three sentences merged in ("I'll have the pasta", "Anything else?", "Is everything okay?") have no tool or reply step yet. |
| 15 Food Preferences & Allergies | Exercises still valid; intro copy speaks of "keeping your body safe". |
| 17 Supermarket | The reply drill still trains "You need to weigh it first", which the dialogue no longer says. |
| 26 Pharmacy & Health | The reply item "Take this twice a day." no longer matches the dialogue wording. "It hurts here." has no tool step. |

**Rewritten missions — Practice was generated from the standard template and needs real design:**
11 Small Talk, 22 Fixing Problems, 27 Emergency, and the three rebuilt integration missions 18, 24, 30.

**New missions — need Practice content from scratch:**
04, 12, 13, 16, 20, 21, 23, 25. Each currently has the standard sequence (intro → key sentences → expected replies → quiz → dialogue → sentence review → cold open), built automatically from the mission's sentences. It works, but none of it was designed for the mission. Mission 04 also has a "Before we speak" word step (want / need / have / can / know).

For the next phase: the specs in `apps/web/src/features/bootcamp/core/` list each mission's sentences, its expected replies and its swap-in variants, which is the raw material for the planned activities.

---

## 8. Validation results

| Check | Result |
|---|---|
| Dialogue structural validation (`core30.test.ts`, 112 tests) | Pass. Every Core mission has identical dialogue trees, items and step order in EN / FR / ES; identical NPC/You turn sequence in all four document sections; no empty line; no two learner turns in a row. |
| Mission 01–30 each exist exactly once, no gap, no duplicate | Pass, in all three languages. |
| Checkpoints at 10, 18, 24, 30 | Pass. Every sentence in a checkpoint was taught by an earlier mission (same id, same wording). |
| Recovery not counted among the 30 | Pass. |
| Removed content not registered in the Core | Pass. Not in the plan, the registry, the sentence library, Listen or Videos. |
| Progress and routing | Pass. Ids unchanged; store load path and v1 migration tests pass; Extended Pool completions round-trip without counting as readiness. |
| Video references | Pass. All 15 referenced files exist; none was touched. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. |
| `npm run test` | Pass — 62 files, 1129 tests. |
| `npm run build` (production, PWA) | Pass. |
| `npm run smoke` | Pass. |
| `npm run parity` | Pass — Bootcamp 30/30 for French and Spanish. |
| `scripts/audit-dialogues.ts` | 0 blockers (no wrong answer silently continues the conversation). |
| Generated document in sync with the runtime | Pass — enforced by test. |

Not validated: the app was not opened in a browser, and no native speaker read the new text.

---

## 9. Open issues

1. **Native review.** All new and changed French, Spanish and Hebrew lines are AI-drafted. The informal register in the conversation missions (tu / tú) is a deliberate choice and should be confirmed by a native reviewer.
2. **Four videos no longer match their transcript:** `En_day4`, `Fr_day4`, `En_day6`, `En_day7`. They still play. Decide in the video audit whether to re-shoot or accept.
3. **Two rebuilt checkpoints kept their old ids** (`food-day-checkpoint`, `city-day-checkpoint`) so that existing progress is not lost. A learner who completed the old Food Day or City Day checkpoint sees the rebuilt one as completed, although its content is new. If you would rather have them redo it, the ids should be changed — this is a product decision.
4. **Learners who completed only Restaurant Basics, Hotel Requests or Paying Anywhere** lose that completion mark, because those missions no longer exist. Their practice history on individual sentences is unaffected.
5. **No Subtitles (Mission 28)** still has one loose exchange: "Gorgeous spot, right? First time here?" is answered with "This place is beautiful." It was left alone because the mission was specified as "keep".
6. **Spanish transport vocabulary** uses "boleto" in Public Transport, a Latin American word, while the course targets `es-ES` ("billete"). Pre-existing; not changed here.
7. **Mission 04 is long** — 19 turns, 9 of them the learner's. Each line is short, but it is the longest teaching dialogue in the first phase. Worth watching in testing.
8. **File names no longer indicate mission numbers.** `day6.ts` is Taxi, Mission 7; new missions live in `core/`. The mapping is in `plan.ts`. This follows from keeping registry keys stable.
