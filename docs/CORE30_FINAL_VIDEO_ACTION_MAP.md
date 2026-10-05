# Core 30 — Final Video Action Map

_Generated from the runtime at commit `dfdad8a` by `scripts/export-core30-video-docs.ts`. Companion file: `CORE30_FINAL_DIALOGUES_EN_ES_FR_HE.md` (the scripts to shoot from)._

**This is the canonical video action map.** Regenerate it with `npm run export:video-docs` (never edit by hand). The earlier map of 2026-10-04 is archived as `docs/archive/CORE_30_FINAL_VIDEO_ACTION_MAP_2026-10-04_superseded.md` and must not be used. No video file was created, edited, renamed, moved or deleted by this export.

**Basis of every verdict.** The existing videos were added in July 2026 and renamed in commit `752463f` (the 29-mission runtime). For all 15 files, the NPC lines in the mission source at the commit the video was added are identical to those at `752463f`, so the dialogue each video was made for is the 29-mission runtime, archived in `docs/archive/DIALOGUES_BY_MISSION_V1_29-mission-runtime.md`. Each verdict is an exact line-by-line comparison of that archived conversation with today's canonical conversation. **Nobody watched the videos**: a verdict says what the script was, not what is audible in the file.

Statuses: **KEEP** · **MOVE / RELABEL** (same dialogue, mission changed position) · **REPLACE** (a spoken line changed) · **NEW VIDEO** (none exists) · **CHECK MANUALLY** (history cannot prove it).

## Totals

| Status | All 90 mission × language cells | Of the existing video files |
|---|---|---|
| KEEP | 4 | 4 |
| MOVE / RELABEL | 4 | 4 |
| REPLACE | 6 | 6 |
| NEW VIDEO | 75 | — |
| CHECK MANUALLY | 1 | 1 |
| **Total** | **90** | **15** |

## A. Current video inventory

Folder: `apps/web/public/videos/` — 15 files. A video is attached to a mission by an explicit path in that mission's content (`introVideo`). The number in a file name is the mission's **registry key**, not its displayed number.

| File | Language | Size | Registry key | Position when made (29-mission course) | Current mission | Same dialogue as when made? |
|---|---|---|---|---|---|---|
| `En_day1.mp4` | English | 3.7 MB | 1 | 01 Introduce Myself | **M01** Introduce Myself | No |
| `En_day2.mp4` | English | 4.1 MB | 2 | 02 Numbers & Money | **M02** Numbers & Money | Yes |
| `En_day3.mp4` | English | 3.9 MB | 3 | 03 Coffee Shop | **M03** Coffee Shop | Yes |
| `En_day4.mp4` | English | 3.5 MB | 4 | 04 Restaurant Meal | **M14** Restaurant Meal | No |
| `En_day6.mp4` | English | 2.8 MB | 6 | 06 Taxi / Uber | **M07** Taxi / Uber | No |
| `En_day7.mp4` | English | 3.0 MB | 7 | 07 Hotel Check-in | **M08** Hotel Check-in | No |
| `En_day8.mp4` | English | 4.1 MB | 8 | 08 Shopping | **M09** Shopping | Yes |
| `En_day10.mp4` | English | 2.8 MB | 10 | 10 Airport & Border | **M06** Airport & Border | Yes |
| `Fr_day1.mp4` | French | 2.7 MB | 1 | 01 Introduce Myself | **M01** Introduce Myself | No |
| `Fr_day2.mp4` | French | 3.6 MB | 2 | 02 Numbers & Money | **M02** Numbers & Money | Yes |
| `Fr_day3.mp4` | French | 2.4 MB | 3 | 03 Coffee Shop | **M03** Coffee Shop | Script yes — video unverified |
| `Fr_day4.mp4` | French | 5.0 MB | 4 | 04 Restaurant Meal | **M14** Restaurant Meal | No |
| `Fr_day5.mp4` | French | 3.2 MB | 5 | 05 Directions | **M05** Directions | Yes |
| `Fr_day8.mp4` | French | 4.2 MB | 8 | 08 Shopping | **M09** Shopping | Yes |
| `Fr_day10.mp4` | French | 3.3 MB | 10 | 10 Airport & Border | **M06** Airport & Border | Yes |

Spanish has no video files. Every file in the folder is referenced by exactly one mission, and every path the runtime references exists.

Before the 29-mission refactor the same files were named one number higher (`En_day2.mp4` … `En_day11.mp4`), because a Recovery Toolkit mission then occupied position 1.

## C. Master action table

| Mission | Title | English | Spanish | French |
|---|---|---|---|---|
| 01 | Introduce Myself | REPLACE | NEW VIDEO | REPLACE |
| 02 | Numbers & Money | KEEP | NEW VIDEO | KEEP |
| 03 | Coffee Shop | KEEP | NEW VIDEO | CHECK MANUALLY |
| 04 | Everyday Core: Want / Need / Have / Can | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 05 | Directions | NEW VIDEO | NEW VIDEO | KEEP |
| 06 | Airport & Border | MOVE / RELABEL — ACCEPTABLE MINOR SPOKEN VARIANT | NEW VIDEO | MOVE / RELABEL |
| 07 | Taxi / Uber | REPLACE | NEW VIDEO | NEW VIDEO |
| 08 | Hotel Check-in | REPLACE | NEW VIDEO | NEW VIDEO |
| 09 | Shopping | MOVE / RELABEL | NEW VIDEO | MOVE / RELABEL |
| 10 | CHECKPOINT: Arrival Day | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 11 | Small Talk & Recommendations | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 12 | Time & Plans | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 13 | Home, Family & Daily Routine | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 14 | Restaurant Meal | REPLACE | NEW VIDEO | REPLACE |
| 15 | Food Preferences & Allergies | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 16 | Hobbies & Free Time | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 17 | Supermarket & Everyday Shopping | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 18 | CHECKPOINT: Everyday Day | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 19 | Public Transport | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 20 | Past & Recent Events | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 21 | Future Travel & Plans | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 22 | Fixing Problems | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 23 | Opinions, Feelings & Reactions | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 24 | CHECKPOINT: City & Conversation | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 25 | Lost / Stolen / Police | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 26 | Pharmacy & Health | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 27 | Emergency | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 28 | No Subtitles | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 29 | Dress Rehearsal: Full Evening | NEW VIDEO | NEW VIDEO | NEW VIDEO |
| 30 | A Complete Day Abroad Alone | NEW VIDEO | NEW VIDEO | NEW VIDEO |

## D. Existing video detail

### `En_day1.mp4`

Current mission: M01 — Introduce Myself (English)

Status: **REPLACE**

Why: 1 spoken line(s) differ from the dialogue the video was made for.

Exact spoken changes (OLD = the 29-mission script the video was made for; CURRENT = today):

- OLD: `NPC: Well, enjoy your stay! Let me know if you need anything.`
- CURRENT: `NPC: Enjoy your stay! Have a great day!`

Production note: regenerate the full video from the Mission 01 English script (1 line affected). Keep the file name — the runtime already points at it.

### `En_day2.mp4`

Current mission: M02 — Numbers & Money (English)

Status: **KEEP**

Why: Spoken dialogue is line-for-line identical, and the mission kept its position.

Production note: nothing to do.

### `En_day3.mp4`

Current mission: M03 — Coffee Shop (English)

Status: **KEEP**

Why: Spoken dialogue is line-for-line identical, and the mission kept its position.

Production note: nothing to do.

### `En_day4.mp4`

Current mission: M14 — Restaurant Meal (English)

Status: **REPLACE**

Why: 6 spoken line(s) differ from the dialogue the video was made for.

Exact spoken changes (OLD = the 29-mission script the video was made for; CURRENT = today):

- OLD: `YOU: I'll have the chicken.`
- OLD: `NPC: Excellent choice. Anything to drink?`
- OLD: `NPC: Great — and would you like anything else with that?`
- OLD: `YOU: No onions, please.`
- OLD: `NPC: …Later… How was everything?`
- OLD: `YOU: That was delicious! The bill, please.`
- CURRENT: `YOU: I'll have the chicken, without onions, please.`
- CURRENT: `NPC: Of course. Anything to drink?`
- CURRENT: `NPC: Anything else?`
- CURRENT: `YOU: That's all, thanks.`
- CURRENT: `NPC: Is everything okay?`
- CURRENT: `YOU: Yes, that was delicious! The bill, please.`

Production note: regenerate the full video from the Mission 14 English script (6 lines affected). Keep the file name — the runtime already points at it.

### `En_day6.mp4`

Current mission: M07 — Taxi / Uber (English)

Status: **REPLACE**

Why: 4 spoken line(s) differ from the dialogue the video was made for.

Exact spoken changes (OLD = the 29-mission script the video was made for; CURRENT = today):

- OLD: `NPC: Got it. How much did you expect to pay?`
- OLD: `NPC: It's about fifteen euros — there's a lot of traffic right now.`
- OLD: `YOU: Please speak slowly.`
- OLD: `NPC: Fifteen — euros. Traffic.`
- CURRENT: `NPC: Got it. No problem — off we go!`
- CURRENT: `NPC: It's about fifteen euros. There's a lot of traffic right now.`
- CURRENT: `YOU: Sorry, please speak slowly.`
- CURRENT: `NPC: Sure. About fifteen euros. There's a lot of traffic.`

Production note: regenerate the full video from the Mission 07 English script (4 lines affected). Keep the file name — the runtime already points at it.

### `En_day7.mp4`

Current mission: M08 — Hotel Check-in (English)

Status: **REPLACE**

Why: 1 spoken line(s) differ from the dialogue the video was made for.

Exact spoken changes (OLD = the 29-mission script the video was made for; CURRENT = today):

- OLD: `NPC: Thank you. You're in room two-oh-four, on the second floor. Is breakfast included in your booking?`
- CURRENT: `NPC: Thank you. You're in room two-oh-four, on the second floor. Here is your key.`

Production note: regenerate the full video from the Mission 08 English script (1 line affected). Keep the file name — the runtime already points at it.

### `En_day8.mp4`

Current mission: M09 — Shopping (English)

Status: **MOVE / RELABEL**

Why: Spoken dialogue is line-for-line identical. The mission moved from position 08 to 09.

Production note: nothing to re-shoot. Old displayed position 08, current displayed position 09. Do not rename the file: the runtime references `En_day8.mp4` by path. Only update any on-screen "Mission 8" title card or caption inside the video, if it has one.

### `En_day10.mp4`

Current mission: M06 — Airport & Border (English)

Status: **MOVE / RELABEL — ACCEPTABLE MINOR SPOKEN VARIANT**

Why: ACCEPTABLE MINOR SPOKEN VARIANT — the only audible difference is one word: the video says "Lovely. How long are you staying?", the app now says "All right. How long are you staying?". ("center" → "centre" is spelling only.) Accepted for production; the runtime dialogue was not changed to match the video. The mission moved from position 10 to 06.

The accepted difference:

- VIDEO SAYS: `NPC: Lovely. How long are you staying?`
- VIDEO SAYS: `YOU: At a hotel in the city center.`
- APP SAYS: `NPC: All right. How long are you staying?`
- APP SAYS: `YOU: At a hotel in the city centre.`

Production note: nothing to re-shoot. Do not rename the file. If this video is ever re-shot for another reason, use the current line.

### `Fr_day1.mp4`

Current mission: M01 — Introduce Myself (French)

Status: **REPLACE**

Why: 1 spoken line(s) differ from the dialogue the video was made for.

Exact spoken changes (OLD = the 29-mission script the video was made for; CURRENT = today):

- OLD: `NPC: Eh bien, bon séjour ! Dites-moi si vous avez besoin de quelque chose.`
- CURRENT: `NPC: Bon séjour ! Bonne journée !`

Production note: regenerate the full video from the Mission 01 French script (1 line affected). Keep the file name — the runtime already points at it.

### `Fr_day2.mp4`

Current mission: M02 — Numbers & Money (French)

Status: **KEEP**

Why: Spoken dialogue is line-for-line identical, and the mission kept its position.

Production note: nothing to do.

### `Fr_day3.mp4`

Current mission: M03 — Coffee Shop (French)

Status: **CHECK MANUALLY**

Why: The runtime dialogue is unchanged since the video was added, but the reference Markdown that existed when it was produced was missing two spoken lines ("Moyen ou grand ?" and "Lait et sucre ?"). If the video followed that file it lacks them. Watch it once: if both lines are spoken, treat as KEEP.

Production note: watch the file once and compare it with the current script before deciding.

### `Fr_day4.mp4`

Current mission: M14 — Restaurant Meal (French)

Status: **REPLACE**

Why: 6 spoken line(s) differ from the dialogue the video was made for.

Exact spoken changes (OLD = the 29-mission script the video was made for; CURRENT = today):

- OLD: `YOU: Je vais prendre le poulet.`
- OLD: `NPC: Excellent choix. Quelque chose à boire ?`
- OLD: `NPC: Très bien — et avec ça, vous voulez autre chose ?`
- OLD: `YOU: Sans oignons, s’il vous plaît.`
- OLD: `NPC: …Plus tard… Tout s’est bien passé ?`
- OLD: `YOU: C’était délicieux ! L’addition, s’il vous plaît.`
- CURRENT: `YOU: Je vais prendre le poulet, sans oignons, s’il vous plaît.`
- CURRENT: `NPC: Bien sûr. Quelque chose à boire ?`
- CURRENT: `NPC: Autre chose ?`
- CURRENT: `YOU: C’est tout, merci.`
- CURRENT: `NPC: Tout va bien ?`
- CURRENT: `YOU: Oui, c’était délicieux ! L’addition, s’il vous plaît.`

Production note: regenerate the full video from the Mission 14 French script (6 lines affected). Keep the file name — the runtime already points at it.

### `Fr_day5.mp4`

Current mission: M05 — Directions (French)

Status: **KEEP**

Why: Spoken dialogue is line-for-line identical, and the mission kept its position.

Production note: nothing to do.

### `Fr_day8.mp4`

Current mission: M09 — Shopping (French)

Status: **MOVE / RELABEL**

Why: Spoken dialogue is line-for-line identical. The mission moved from position 08 to 09.

Production note: nothing to re-shoot. Old displayed position 08, current displayed position 09. Do not rename the file: the runtime references `Fr_day8.mp4` by path. Only update any on-screen "Mission 8" title card or caption inside the video, if it has one.

### `Fr_day10.mp4`

Current mission: M06 — Airport & Border (French)

Status: **MOVE / RELABEL**

Why: Spoken dialogue is line-for-line identical. The mission moved from position 10 to 06.

Production note: nothing to re-shoot. Old displayed position 10, current displayed position 06. Do not rename the file: the runtime references `Fr_day10.mp4` by path. Only update any on-screen "Mission 10" title card or caption inside the video, if it has one.

## E. What changed across the curriculum

The old course had 29 missions; the final Core has 30.

**Final displayed order** (registry key in brackets — the number used in video file names):

01 Introduce Myself [1] · 02 Numbers & Money [2] · 03 Coffee Shop [3] · 04 Everyday Core: Want / Need / Have / Can [30] · 05 Directions [5] · 06 Airport & Border [10] · 07 Taxi / Uber [6] · 08 Hotel Check-in [7] · 09 Shopping [8] · 10 CHECKPOINT: Arrival Day [9] · 11 Small Talk & Recommendations [22] · 12 Time & Plans [31] · 13 Home, Family & Daily Routine [32] · 14 Restaurant Meal [4] · 15 Food Preferences & Allergies [13] · 16 Hobbies & Free Time [33] · 17 Supermarket & Everyday Shopping [16] · 18 CHECKPOINT: Everyday Day [17] · 19 Public Transport [18] · 20 Past & Recent Events [34] · 21 Future Travel & Plans [35] · 22 Fixing Problems [24] · 23 Opinions, Feelings & Reactions [36] · 24 CHECKPOINT: City & Conversation [23] · 25 Lost / Stolen / Police [37] · 26 Pharmacy & Health [25] · 27 Emergency [26] · 28 No Subtitles [27] · 29 Dress Rehearsal: Full Evening [28] · 30 A Complete Day Abroad Alone [29]

- **Kept their position (4):** 01 Introduce Myself, 02 Numbers & Money, 03 Coffee Shop, 05 Directions.
- **Moved (18):** Airport & Border 10 → 06, Taxi / Uber 06 → 07, Hotel Check-in 07 → 08, Shopping 08 → 09, CHECKPOINT: Arrival Day 09 → 10, Small Talk & Recommendations 22 → 11, Restaurant Meal 04 → 14, Food Preferences & Allergies 13 → 15, Supermarket & Everyday Shopping 16 → 17, CHECKPOINT: Everyday Day 17 → 18, Public Transport 18 → 19, Fixing Problems 24 → 22, CHECKPOINT: City & Conversation 23 → 24, Pharmacy & Health 25 → 26, Emergency 26 → 27, No Subtitles 27 → 28, Dress Rehearsal: Full Evening 28 → 29, A Complete Day Abroad Alone 29 → 30.
- **New Core missions (8):** 04 Everyday Core: Want / Need / Have / Can, 12 Time & Plans, 13 Home, Family & Daily Routine, 16 Hobbies & Free Time, 20 Past & Recent Events, 21 Future Travel & Plans, 23 Opinions, Feelings & Reactions, 25 Lost / Stolen / Police.
- **No longer standalone Core missions (7):** old 11 Hotel Requests & Problems, old 12 Restaurant Basics, old 14 Paying Anywhere, old 15 Street Food & Markets, old 19 Tickets & Attractions, old 20 Wifi, SIM & Practical, old 21 Souvenirs & Gifts. See section F for where each went.
- **Checkpoints / integrated missions rebuilt** (their old scripts are obsolete): 10 Arrival Day, 18 Everyday Day (was "Food Day"), 24 City & Conversation (was "City Day"), 28 No Subtitles, 29 Dress Rehearsal, 30 A Complete Day Abroad Alone.
- **Final Mastery changes (Missions 25–30):** the conversations of 25, 26 and 27 were not touched by the last pass; 28, 29 and 30 were rebuilt. 28 is audio-only in the app and carries one non-spoken cue; 29 is one evening in four scenes; 30 is one whole day in five scenes.

## F. New and merged Core missions

**No equivalent standalone script existed in the old course** (verified: their registry keys 30–37 are absent from the 29-mission archive):

- M04 — Everyday Core: Want / Need / Have / Can
- M12 — Time & Plans
- M13 — Home, Family & Daily Routine
- M16 — Hobbies & Free Time
- M20 — Past & Recent Events
- M21 — Future Travel & Plans
- M23 — Opinions, Feelings & Reactions
- M25 — Lost / Stolen / Police

**Old standalone topics and where they went** (verified against `plan.ts` / `extended.ts`):

- Old 12 **Restaurant Basics** → merged into M14 Restaurant Meal.
- Old 11 **Hotel Requests & Problems** → merged: the room problem is scene 2 of M22 Fixing Problems.
- Old 14 **Paying Anywhere** → no standalone mission; paying recurs inside M02, M03, M14, M17, M18, M28, M29.
- Old 15 **Street Food & Markets**, 19 **Tickets & Attractions**, 20 **Wifi, SIM & Practical**, 21 **Souvenirs & Gifts** → moved to the Extended pool. Not in the Core, not in these documents, no video needed now.
- The lost-passport exchange that used to sit inside Emergency → M25 Lost / Stolen / Police.

# Things to pay attention to before generating videos

### 1. Displayed mission number vs file name

File names carry the registry key. Only Missions 01, 02, 03 and 05 have a key equal to their number. Use this table, not the file name:

| Mission | Key | File name a video for it uses |
|---|---|---|
| 01 Introduce Myself | 1 | `En_day1.mp4` · `Es_day1.mp4` · `Fr_day1.mp4` |
| 02 Numbers & Money | 2 | `En_day2.mp4` · `Es_day2.mp4` · `Fr_day2.mp4` |
| 03 Coffee Shop | 3 | `En_day3.mp4` · `Es_day3.mp4` · `Fr_day3.mp4` |
| 04 Everyday Core: Want / Need / Have / Can | 30 | `En_day30.mp4` · `Es_day30.mp4` · `Fr_day30.mp4` |
| 05 Directions | 5 | `En_day5.mp4` · `Es_day5.mp4` · `Fr_day5.mp4` |
| 06 Airport & Border | 10 | `En_day10.mp4` · `Es_day10.mp4` · `Fr_day10.mp4` |
| 07 Taxi / Uber | 6 | `En_day6.mp4` · `Es_day6.mp4` · `Fr_day6.mp4` |
| 08 Hotel Check-in | 7 | `En_day7.mp4` · `Es_day7.mp4` · `Fr_day7.mp4` |
| 09 Shopping | 8 | `En_day8.mp4` · `Es_day8.mp4` · `Fr_day8.mp4` |
| 10 CHECKPOINT: Arrival Day | 9 | `En_day9.mp4` · `Es_day9.mp4` · `Fr_day9.mp4` |
| 11 Small Talk & Recommendations | 22 | `En_day22.mp4` · `Es_day22.mp4` · `Fr_day22.mp4` |
| 12 Time & Plans | 31 | `En_day31.mp4` · `Es_day31.mp4` · `Fr_day31.mp4` |
| 13 Home, Family & Daily Routine | 32 | `En_day32.mp4` · `Es_day32.mp4` · `Fr_day32.mp4` |
| 14 Restaurant Meal | 4 | `En_day4.mp4` · `Es_day4.mp4` · `Fr_day4.mp4` |
| 15 Food Preferences & Allergies | 13 | `En_day13.mp4` · `Es_day13.mp4` · `Fr_day13.mp4` |
| 16 Hobbies & Free Time | 33 | `En_day33.mp4` · `Es_day33.mp4` · `Fr_day33.mp4` |
| 17 Supermarket & Everyday Shopping | 16 | `En_day16.mp4` · `Es_day16.mp4` · `Fr_day16.mp4` |
| 18 CHECKPOINT: Everyday Day | 17 | `En_day17.mp4` · `Es_day17.mp4` · `Fr_day17.mp4` |
| 19 Public Transport | 18 | `En_day18.mp4` · `Es_day18.mp4` · `Fr_day18.mp4` |
| 20 Past & Recent Events | 34 | `En_day34.mp4` · `Es_day34.mp4` · `Fr_day34.mp4` |
| 21 Future Travel & Plans | 35 | `En_day35.mp4` · `Es_day35.mp4` · `Fr_day35.mp4` |
| 22 Fixing Problems | 24 | `En_day24.mp4` · `Es_day24.mp4` · `Fr_day24.mp4` |
| 23 Opinions, Feelings & Reactions | 36 | `En_day36.mp4` · `Es_day36.mp4` · `Fr_day36.mp4` |
| 24 CHECKPOINT: City & Conversation | 23 | `En_day23.mp4` · `Es_day23.mp4` · `Fr_day23.mp4` |
| 25 Lost / Stolen / Police | 37 | `En_day37.mp4` · `Es_day37.mp4` · `Fr_day37.mp4` |
| 26 Pharmacy & Health | 25 | `En_day25.mp4` · `Es_day25.mp4` · `Fr_day25.mp4` |
| 27 Emergency | 26 | `En_day26.mp4` · `Es_day26.mp4` · `Fr_day26.mp4` |
| 28 No Subtitles | 27 | `En_day27.mp4` · `Es_day27.mp4` · `Fr_day27.mp4` |
| 29 Dress Rehearsal: Full Evening | 28 | `En_day28.mp4` · `Es_day28.mp4` · `Fr_day28.mp4` |
| 30 A Complete Day Abroad Alone | 29 | `En_day29.mp4` · `Es_day29.mp4` · `Fr_day29.mp4` |

A replacement for an existing file keeps its name and needs no code change. A video for a mission that has none is only picked up by the app after its path is added to that mission's content (`introVideo`) — a small code change per file, not done here.

### 2. Multi-scene missions

9 missions have more than one scene: M04 (2), M10 (3), M18 (4), M22 (2), M24 (4), M25 (2), M28 (3), M29 (4), M30 (5). The other 21 are a single scene.

### 3. Spoken vs non-spoken cues

**Not spoken** (a real cue in the runtime — shown, never sent to speech; written as `[SCENE CUE — NOT SPOKEN: …]` in the script): 

- M14 scene 1, before `NPC: Is everything okay?` — cue "Later…" / "מאוחר יותר…"
- M17 scene 1, before `NPC: Hi! Is that everything?` — cue "At the checkout…" / "בקופה…"
- M18 scene 3, before `NPC: Hi! Is that everything?` — cue "At the checkout…" / "בקופה…"
- M18 scene 4, before `NPC: Is everything okay?` — cue "Later…" / "מאוחר יותר…"
- M22 scene 1, before `NPC: Here's your bill.` — cue "Later…" / "מאוחר יותר…"
- M28 scene 2, before `NPC: Is everything okay?` — cue "Later…" / "מאוחר יותר…"
- M29 scene 4, before `NPC: Is everything okay?` — cue "Later…" / "מאוחר יותר…"
- M30 scene 3, before `NPC: Is everything okay?` — cue "Later…" / "מאוחר יותר…"

Treat each cue as a cut, a caption or a pause; no character says it. **Transition labels written inside a spoken line: 0.** (Until the production freeze there were seven; each is now one of the cues above.)


Lines that merely begin with "…" as a pause (for example the taxi's "…We are almost there.") are ordinary speech.

### 4. Formal vs informal register (French / Spanish)

Read from the French and Spanish lines themselves, scene by scene. "formal" = vous / usted, "informal" = tu / tú, "neutral" = the scene has no marker either way. Service encounters are formal; friends and fellow travelers are informal.

| Mission | Scene | French | Spanish |
|---|---|---|---|
| 04 Everyday Core: Want / Need / Have / Can | 2 | informal | informal |
| 12 Time & Plans | 1 | informal | informal |
| 13 Home, Family & Daily Routine | 1 | informal | informal |
| 16 Hobbies & Free Time | 1 | informal | informal |
| 18 CHECKPOINT: Everyday Day | 2 | informal | informal |
| 20 Past & Recent Events | 1 | informal | informal |
| 21 Future Travel & Plans | 1 | informal | informal |
| 23 Opinions, Feelings & Reactions | 1 | informal | informal |
| 24 CHECKPOINT: City & Conversation | 4 | informal | informal |
| 30 A Complete Day Abroad Alone | 4 | informal | informal |

Every scene not listed is formal (vous / usted) or has no marker, in both languages. This table comes from a word-pattern check, not a linguist: a row where the two languages differ, or that says "mixed", deserves a human look before casting a voice.

### 5. Character and location continuity

- **M04 Everyday Core: Want / Need / Have / Can** — Scene 1: hostel front desk (staff). Scene 2: coffee with a friend — different person, different place, informal.
- **M10 CHECKPOINT: Arrival Day** — Three places, three people, same day: border officer → taxi driver → hotel receptionist.
- **M18 CHECKPOINT: Everyday Day** — Four places, four people, one day: café barista (morning) → a friend (informal) → supermarket staff, then the checkout → restaurant waiter (evening).
- **M22 Fixing Problems** — Scene 1: restaurant waiter (wrong dish, then the bill, with a time jump inside the scene). Scene 2: hotel reception — different place and person.
- **M24 CHECKPOINT: City & Conversation** — Four places, four people, one day: station ticket desk → a local in the street → restaurant waiter → another traveler at the hostel (informal).
- **M25 Lost / Stolen / Police** — Scene 1: a passer-by in the street. Scene 2: a police officer at the station — location change, different person.
- **M28 No Subtitles** — Three unrelated short scenes: station ticket desk → restaurant waiter (with a time jump before the last exchange) → a local.
- **M29 Dress Rehearsal: Full Evening** — One continuous evening. Scene 1: taxi driver. Scenes 2–4: the SAME restaurant and the same waiter — ordering, the wrong dish arriving, then (time jump) the bill.
- **M30 A Complete Day Abroad Alone** — One day, same traveler throughout. Scene 1: hotel desk, morning. Scene 2: taxi driver. Scene 3: restaurant waiter (time jump before the bill). Scene 4: another traveler (informal). Scene 5: the hotel desk again, evening — same hotel as scene 1.

These notes are read from the dialogue and scene names only; the runtime does not define characters, costumes or sets.

### 6. Native-language review warning

French and Spanish have passed structural, parity and automated checks (same scenes, same speaker order, no line left in English). They have **not** received a full native-speaker sign-off. They are safe for internal generation and testing. A native review is recommended **before** spending significant money or time on final polished French or Spanish videos. Hebrew is the app's own gloss of each line, not a dubbing script.

## H. Change summary per mission

### M01 — Introduce Myself

Current dialogue status: changed

Important history: Same conversation as the old Mission 01; the host's closing line was rewritten in the final curriculum audit.

Video impact: EN REPLACE (`En_day1.mp4`) · ES NEW VIDEO · FR REPLACE (`Fr_day1.mp4`)

### M02 — Numbers & Money

Current dialogue status: unchanged

Important history: Market-stall conversation, unchanged since the videos were made.

Video impact: EN KEEP (`En_day2.mp4`) · ES NEW VIDEO · FR KEEP (`Fr_day2.mp4`)

### M03 — Coffee Shop

Current dialogue status: unchanged

Important history: Coffee order, unchanged since the videos were made.

Video impact: EN KEEP (`En_day3.mp4`) · ES NEW VIDEO · FR CHECK MANUALLY (`Fr_day3.mp4`)

Watch for: The French video was produced when the reference Markdown lacked two lines — see its detail block.

### M04 — Everyday Core: Want / Need / Have / Can

Current dialogue status: new

Important history: New Core mission (want / need / have / can). No equivalent script existed in the old course.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Two scenes with different people and registers: a hostel desk (formal), then coffee with a friend (informal). 2 scenes.

### M05 — Directions

Current dialogue status: unchanged

Important history: Asking the way to the station, unchanged since the French video was made. There has never been an English video.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR KEEP (`Fr_day5.mp4`)

### M06 — Airport & Border

Current dialogue status: changed (EN, one audible word) / unchanged (FR)

Important history: Was Mission 10. Moved forward so the arrival story runs border → taxi → hotel.

Video impact: EN MOVE / RELABEL (`En_day10.mp4`) · ES NEW VIDEO · FR MOVE / RELABEL (`Fr_day10.mp4`)

Watch for: English: the existing video says "Lovely." where the app now says "All right." — accepted as a minor spoken variant, so the file is kept.

### M07 — Taxi / Uber

Current dialogue status: changed

Important history: Was Mission 06. The fare exchange and the slow-speech beat were rewritten.

Video impact: EN REPLACE (`En_day6.mp4`) · ES NEW VIDEO · FR NEW VIDEO

### M08 — Hotel Check-in

Current dialogue status: changed

Important history: Was Mission 07. One line changed: the receptionist's room line now ends "Here is your key." instead of asking about breakfast.

Video impact: EN REPLACE (`En_day7.mp4`) · ES NEW VIDEO · FR NEW VIDEO

### M09 — Shopping

Current dialogue status: unchanged

Important history: Was Mission 08. Clothing-shop conversation, unchanged.

Video impact: EN MOVE / RELABEL (`En_day8.mp4`) · ES NEW VIDEO · FR MOVE / RELABEL (`Fr_day8.mp4`)

### M10 — CHECKPOINT: Arrival Day

Current dialogue status: rebuilt

Important history: Checkpoint, was Mission 09. Rebuilt as three cold scenes (border, taxi, hotel).

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: 3 scenes.

### M11 — Small Talk & Recommendations

Current dialogue status: changed

Important history: Was Mission 22 ("Small Talk"). Largely rewritten (3 of the old 9 lines survive) and moved to open the Everyday phase.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

### M12 — Time & Plans

Current dialogue status: new

Important history: New Core mission. No equivalent script existed in the old course.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Informal register (tu / tú): two friends.

### M13 — Home, Family & Daily Routine

Current dialogue status: new

Important history: New Core mission. No equivalent script existed in the old course.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Informal register (tu / tú): at a friend's home.

### M14 — Restaurant Meal

Current dialogue status: changed

Important history: Was Mission 04. Absorbed the old Restaurant Basics (Mission 12): order, drink and closing lines changed.

Video impact: EN REPLACE (`En_day4.mp4`) · ES NEW VIDEO · FR REPLACE (`Fr_day4.mp4`)

Watch for: One non-spoken cue ("Later…").

### M15 — Food Preferences & Allergies

Current dialogue status: changed

Important history: Was Mission 13 ("Special Requests & Allergies"). Largely rewritten (4 of the old 11 lines survive).

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

### M16 — Hobbies & Free Time

Current dialogue status: new

Important history: New Core mission. No equivalent script existed in the old course.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Informal register (tu / tú).

### M17 — Supermarket & Everyday Shopping

Current dialogue status: changed

Important history: Was Mission 16. One line differs from the old script.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: One non-spoken cue ("At the checkout…").

### M18 — CHECKPOINT: Everyday Day

Current dialogue status: rebuilt

Important history: Checkpoint, was Mission 17 ("Food Day"). Rebuilt as one ordinary day in four cold scenes.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Scene 2 is informal (a friend); the other three are service register. Two non-spoken cues (scenes 3 and 4). 4 scenes.

### M19 — Public Transport

Current dialogue status: changed

Important history: Was Mission 18. Four lines changed: the platform is no longer announced before the learner asks for it.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

### M20 — Past & Recent Events

Current dialogue status: new

Important history: New Core mission. No equivalent script existed in the old course.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Informal register (tu / tú).

### M21 — Future Travel & Plans

Current dialogue status: new

Important history: New Core mission. No equivalent script existed in the old course.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Informal register (tu / tú).

### M22 — Fixing Problems

Current dialogue status: rebuilt

Important history: Was Mission 24. Now two scenes: a restaurant problem, then a hotel-room problem (the latter absorbed the old Hotel Requests & Problems, Mission 11).

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Scene 1 has a non-spoken cue ("Later…") between two consecutive waiter lines. 2 scenes.

### M23 — Opinions, Feelings & Reactions

Current dialogue status: new

Important history: New Core mission. No equivalent script existed in the old course.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Informal register (tu / tú).

### M24 — CHECKPOINT: City & Conversation

Current dialogue status: rebuilt

Important history: Checkpoint, was Mission 23 ("City Day"). Rebuilt as four cold scenes.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Scene 4 is informal (another traveler); scenes 1–3 are service register. 4 scenes.

### M25 — Lost / Stolen / Police

Current dialogue status: new

Important history: New Core mission (the lost-passport line used to interrupt Emergency). Two scenes.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: 2 scenes.

### M26 — Pharmacy & Health

Current dialogue status: changed

Important history: Was Mission 25. Two lines changed in the curriculum audit, so that nothing sounds like a medical guarantee.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

### M27 — Emergency

Current dialogue status: changed

Important history: Was Mission 26. Largely rewritten as one coherent call (4 of the old 11 lines survive); the lost-passport exchange moved to Mission 25.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

### M28 — No Subtitles

Current dialogue status: rebuilt

Important history: Was Mission 27. Rebuilt in the Mastery pass: three scenes, heard only in the app.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Scene 2 has a non-spoken cue ("Later…"). 3 scenes.

### M29 — Dress Rehearsal: Full Evening

Current dialogue status: rebuilt

Important history: Was Mission 28. Rebuilt in the Mastery pass as one evening in four scenes; now uses Core sentences only.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Scene 4 opens with a non-spoken cue ("Later…"). 4 scenes.

### M30 — A Complete Day Abroad Alone

Current dialogue status: rebuilt

Important history: The finale, was Mission 29. Rebuilt in the Mastery pass as one whole day in five scenes.

Video impact: EN NEW VIDEO · ES NEW VIDEO · FR NEW VIDEO

Watch for: Scene 4 is informal (a traveler); scene 3 has a non-spoken cue ("Later…"). 5 scenes.

## I. Dialogue hash / freeze marker

One fingerprint per mission × language for the final canonical spoken dialogue. Recipe: every line as `NPC: text` or `YOU: text`, lines joined by a line feed, scenes separated by one empty line, UTF-8, SHA-256, first 16 hex characters. Nothing is stripped — punctuation and case count; non-spoken cues are not included. If a hash here no longer matches what this script prints, that mission's video is stale.

| Mission | EN | ES | FR |
|---|---|---|---|
| 01 Introduce Myself | `b22602117a90672b` | `0076057823e8fdf1` | `3957809139bb1e05` |
| 02 Numbers & Money | `9057d9118e65ce8a` | `4e852eb6ea702f71` | `39b1dcd922d00c40` |
| 03 Coffee Shop | `d70e598594d287fb` | `5069feb800385baa` | `39de979c1260974b` |
| 04 Everyday Core: Want / Need / Have / Can | `bb664e7dd249191e` | `a7a952a3d2b9c5dd` | `09935f717a459cc3` |
| 05 Directions | `b99eaaa05fe486e6` | `db0ca7568e4cb930` | `a25ecbab84bdd06e` |
| 06 Airport & Border | `bd0e8c4110196574` | `c9aac385bbec3394` | `c81feb17876a4768` |
| 07 Taxi / Uber | `eed1f12bd93b1d8e` | `c25482ad43491420` | `ef1afd551f6e1cd9` |
| 08 Hotel Check-in | `7f5c6f7f1d7ad87f` | `08e6bc7fa889dc5f` | `5b5409d887b9663b` |
| 09 Shopping | `78ff53ac840e703f` | `7aea320995bb53b9` | `8029c8f09455d0b4` |
| 10 CHECKPOINT: Arrival Day | `7ee3f9a6298fa8a6` | `952d92302d90dd15` | `75b9e2663a4114ff` |
| 11 Small Talk & Recommendations | `6527ce79daf23189` | `57d36fea423cfafa` | `e7280ec1216d7af2` |
| 12 Time & Plans | `c87e4f5a6b190680` | `a366197da9f61036` | `f3e1a4cdcb624fee` |
| 13 Home, Family & Daily Routine | `922a9c05414080a2` | `0c308588b9908a5a` | `73700e846085e843` |
| 14 Restaurant Meal | `a6b70d78c6be2f5a` | `597918fa5d3b521e` | `be3c1d7be35f3d7a` |
| 15 Food Preferences & Allergies | `2296d77613568c04` | `83723392de3f87c7` | `2820d3498aff5a91` |
| 16 Hobbies & Free Time | `5e46e3f9b84a8c33` | `a81f44c1d65d7df5` | `4472961e0d79b3de` |
| 17 Supermarket & Everyday Shopping | `8420cde864caeb08` | `6d1e7a9bc9c1da84` | `a652464dd7a06bbc` |
| 18 CHECKPOINT: Everyday Day | `48694de710b3035f` | `4e7e973119bc9759` | `ec9a6fb8e067ca57` |
| 19 Public Transport | `4c840516241fedad` | `d8327ca4abfb7d1d` | `f461e9395471198c` |
| 20 Past & Recent Events | `189d1eec1a235735` | `9567b320362f2119` | `ed6ec543af8cd719` |
| 21 Future Travel & Plans | `61a5ca86476b73ef` | `c750f8fd9e376884` | `82b538461337db68` |
| 22 Fixing Problems | `4bd2c97508ea457a` | `8710f1ae3a56ffe7` | `8d0813a31e9873f9` |
| 23 Opinions, Feelings & Reactions | `a09a87e050dd63f7` | `fba8837ad5ed01ae` | `540c28452eb19f67` |
| 24 CHECKPOINT: City & Conversation | `4d6fb998bcd25065` | `8f77d770fa47f260` | `022c5d7237a2705b` |
| 25 Lost / Stolen / Police | `f4aa219c166f2579` | `a808884269394004` | `51c4c6ac62dbf064` |
| 26 Pharmacy & Health | `4c348fddd3d72793` | `012dfa888aa0e02e` | `c1892bbef68abe8e` |
| 27 Emergency | `b52ba03ed22463c9` | `b2eea64aa8bf0e14` | `36fddaa84f50cbf5` |
| 28 No Subtitles | `7b32e271013d4691` | `0f72b22a7e882bfd` | `86cfa4f4947396cf` |
| 29 Dress Rehearsal: Full Evening | `678fd1dee7294366` | `95f2a213db47cd3b` | `ab3feff10133ae24` |
| 30 A Complete Day Abroad Alone | `65d520e29c4e0f72` | `e945e8f60fca3267` | `a44697fe939ae2ee` |

## J. Validation of this export

- Missions exported: 30, numbered 01–30 in displayed order.
- Scenes: 50 per language. Spoken lines: English 510, Spanish 510, French 510, Hebrew 510.
- Scene count and speaker order are identical in English, Spanish and French for every mission: yes.
- Every exported line equals the app's own canonical transcript (the export aborts otherwise): yes.
- Extended missions in the export: none.
- Lines with no Hebrew: 0.
- Hebrew attached to the Spanish / French line differing from the Hebrew of the English line: 0.
- Video inventory: 15 files, 15 referenced, 0 unreferenced. Action cells filled: 90 of 90.
- Problems found: none.
