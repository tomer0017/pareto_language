# Mission 16 — Hobbies & Free Time: artwork manifest

**Status: PLACEHOLDERS — VISUAL PRODUCTION REQUIRED IN ASTRA PASS.** No image generation was available in
the build pass, and no stock art is used. Every slot below is an emoji placeholder in code
(`M16_SLOTS` / `M16_PROPS` in `apps/web/src/features/bootcamp/practiceHobbies.ts`) until its artwork
exists. To integrate a picture, set `image: 'images/mission16/<slot>.jpg'` on the slot. Nothing else
changes: cards, sorting rounds, the final's situations and the result all read from the slot.

This mission is deliberately visual but small: **five hobby pictures are the priority**. The two
friends, the diving school and the result picture are supporting slots.

## One continuous world

- **the traveller**: the same adult traveller as Missions 11–15;
- **the friend**: one adult local friend, the same face, hair and clothes in every scene. The Hebrew
  copy refers to the friend in the masculine ("גם הוא לא אוהב", "בוא נלך יחד"), so draw a man;
- **the place**: one sunny beach town, one day, the same light. The conversation itself happens in one
  relaxed spot (a seafront café or promenade). The hobby pictures are what each hobby IS, not the chat.

Style: one consistent premium travel / lifestyle illustration style (polished 3D animated
illustration, warm, clean, bright: the Missions 13–15 house style). Not photorealistic, not emoji
art, no collages. **No text in any picture** (no signs, no "DIVING SCHOOL" lettering, no clock
numbers). The same art serves EN / ES / FR.
Format: **16:9**, at least 1536 px wide, JPEG at full quality. One semantic asset per file.

## Visual fairness: the rule above the five hobbies

The five hobby pictures are shown in **the same frame, at the same size, in the same place**: the
subject of a "Sort your hobbies" round, above the same four category tiles. They must be **equal**:

- same aspect ratio (16:9), same style, same quality, same light, same level of detail;
- one person doing one hobby, centred, readable at phone size (360 px wide);
- **no emotion that gives the category away.** The picture shows the HOBBY, never the preference: no
  hearts on surfing, no frown while running, no sparkles on diving. The category comes from the line
  the learner hears, never from the picture;
- never beautiful surfing art next to an emoji running: integrate all five together, or none (a test
  pins that the five slots have the same shape).

## Spoilers to avoid (tested by step order)

- **My Free Time is UI, never art.** The profile rows, Drawing → Evening, the friend's facts and the
  plan appear only after the line that reveals them.
- **Drawing has no time of day in its picture**: no sunset, no lamp-lit evening desk. "Evening" is
  the answer of the time choice (Morning / Afternoon / Evening is deterministic UI).
- **Diving shows diving, not the school**; the diving school is its own slot, shown only on its card.
- **The friends picture shows no hobby and no plan** (it is the briefing picture).

## Slots

| Slot | Meaning | Composition | Used in | Aspect |
|---|---|---|---|---|
| `friends` | "Hi! Are you free today?" / "What do you do for fun?" / "Me neither!" / "I love it! Let's go together tomorrow." | the traveller and the friend meeting in the beach town, relaxed and smiling, no hobby gear visible | briefing; Free-time, Like (the friend's question), Want-to-try (the friend's question) and Plan cards | 16:9 |
| `surfing` | surfing | one person riding a small wave on a surfboard, clear water, readable silhouette | Love cards; sort round 1; final situation "Surfing" | 16:9 |
| `drawing` | drawing | one person drawing in a sketchbook with a pencil, daylight-neutral (no evening cue) | Like, When cards; sort round 2 | 16:9 |
| `music` | listening to music | one person with headphones, eyes half closed, listening (no instrument, no concert) | Me-too cards; sort round 3 | 16:9 |
| `running` | running | one person jogging along the seafront in running clothes, neutral expression | Don't-like cards; sort round 4; final situation "Running" | 16:9 |
| `diving` | diving | one diver underwater with mask and fins, a few fish, clear blue water | Want-to-try card; sort round 5; final situation "Diving" | 16:9 |
| `diving-school` | "There's a diving school near the beach." | a small dive shop / school building right by the sand, tanks and fins outside, **no lettering** | the diving-school card | 16:9 |

## Props: result pictures (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `free-time-match` | a shared plan for tomorrow | the traveller and the friend at the diving school's door with masks in hand, a cheerful "see you tomorrow" | the 🎯 FREE TIME MATCH receipt |

## Reuse opportunities

- `friends` serves the briefing and four cards (the friend's lines with no hobby of their own).
- `drawing` serves both drawing cards (like / when).
- The result prop may reuse the diving-school scene with both characters, as long as it is a whole,
  independently produced image (never crop one asset into two).
- Missions 11–15 supply the traveller's identity; no earlier file is reused directly.

## Integration notes

- The final's three situations ("🏄 Surfing — you love it…") start with the hobby emoji. Once a slot has
  an `image`, the situation shows the picture (`situationImage`). The emoji prefix is then removed by
  the Quick Reply screen only for the emojis it already knows (Mission 15's). Extend that list with
  🏄 🏃 🤿, or drop the prefix, in the art pass.
- Placeholder rendering: a sorting round shows its emoji in the same 16:9 card frame
  (`.pmatch-picture-emoji`) that a picture fills (`.pmatch-picture .situation-image`), so the layout
  does not change when the art arrives.
