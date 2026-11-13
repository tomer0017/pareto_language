# Mission 16 — Hobbies & Free Time: artwork manifest

**Status: VISUAL PRODUCTION COMPLETE.** Eight independently generated, optimized JPEG assets are
integrated in `M16_SLOTS` / `M16_PROPS`. Cards, sorting rounds, final situations and the result read
the same canonical `images/mission16/<slot>.jpg` mapping in EN, ES and FR. Emoji remain fallback
metadata; production pictures are primary. See `MISSION16_VISUAL_REPORT.md` for validation.

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

## Completed integration

All eight assets were generated independently with the built-in image generator; prompts are in
`MISSION16_IMAGE_PROMPTS.json`. Exact reviewed pixels, dimensions and byte sizes are recorded in
`mission16-artwork.json`. No contact sheet or derived crop was used. Each image is 1672 × 941,
approximately 16:9, optimized as JPEG quality 85 without resizing. Prime cards wrap full-width;
sorting and final situations use `object-fit: contain`. No defining action is cropped.

The traveler retains curly dark hair, light olive skin, teal clothing and a natural average build.
The friend has medium brown skin, swept straight dark hair, a rust shirt and sand trousers. Practical
teal sports/scuba clothes replace the overshirt for those activities. Both return in the final prop.

The Quick Reply renderer removes 🏄 / 🏃 / 🤿 prefixes only when artwork is present. Text-only rounds
retain their original cues. Category, time and plan tiles remain deterministic UI. Emoji slot
metadata remains available to the existing fallback contract, but production cards use images.

## Final files

| Canonical public path | Dimensions | Bytes |
|---|---|---:|
| `images/mission16/friends.jpg` | 1672 × 941 | 658403 |
| `images/mission16/surfing.jpg` | 1672 × 941 | 739444 |
| `images/mission16/drawing.jpg` | 1672 × 941 | 654416 |
| `images/mission16/music.jpg` | 1672 × 941 | 632454 |
| `images/mission16/running.jpg` | 1672 × 941 | 683137 |
| `images/mission16/diving.jpg` | 1672 × 941 | 696627 |
| `images/mission16/diving-school.jpg` | 1672 × 940 | 852104 |
| `images/mission16/free-time-match.jpg` | 1672 × 941 | 736835 |
