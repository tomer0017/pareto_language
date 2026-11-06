# Mission 13 — Home, Family & Daily Routine: artwork manifest

**Status: VISUAL PRODUCTION REQUIRED (Astra pass).** Mission 13 ships with emoji placeholders in every
slot (`M13_SLOTS` / `M13_PROPS` in `apps/web/src/features/bootcamp/practiceHomeFamily.ts`, `image` unset).
No image generation was available in the build session; no stock images were used. Emojis are NOT final.
To integrate an asset, put the file at `apps/web/public/images/mission13/<slot>.jpg` and set that slot's
`image: 'images/mission13/<slot>.jpg'`. One file per asset: never a collage, contact sheet, storyboard or
sprite sheet that gets cropped later. Reuse one whole asset for two slots where the meaning is the same.
Then update the "PLACEHOLDERS" test in `mission13.test.ts` to pin the real files, as Missions 11–12 do.

## One continuous world

ONE home visit, one evening. Keep these identical across all assets:

- **the traveller**: the same adult traveller as in Missions 11–12;
- **the host**: one adult friend, the same face, hair and clothes in every scene. The Hebrew copy addresses
  the host in the masculine, so draw a man;
- **the home**: one warm apartment — the same front door, the same living room with the same (visibly new)
  sofa, the same kitchen visible through a doorway;
- **the light**: the same early-evening interior light in every image.

Style: premium polished 3D animated illustration, warm, clean. Not photorealistic, not emoji art. **No text
in any picture.** The same art serves EN / ES / FR. Format: about 16:9, at least 1536 px wide, JPEG at full
quality (the cards draw them as scenes).

## Spoilers to avoid (tested by step order)

- **Before "My mother is in the kitchen"**, no picture shows the mother, and none shows anyone in the kitchen.
  In `living-room-sofa` and `ask-family` the kitchen doorway may be visible but EMPTY.
- **Before the food invitation**, nothing about grandmother: no older woman, no family-dinner table.
- **Before "You look tired"**, the traveller looks normal — no yawning, no slumped posture.
- **Before the after-dinner line**, nothing about sleep: no bed, no pyjamas, no night sky.

## Fairness

No Mission 13 image is ever an answer tile. The room capture uses semantic tiles (`living-room` / `kitchen`)
with app-language captions; correctness comes from the room id, never from a picture or a position.
If a picture's meaning is ambiguous at phone size (360 px wide), it still never becomes an answer.

## Slots: the visit

| Slot | Meaning | Composition | Used in |
|---|---|---|---|
| `at-the-door` | "Hi! Come in." | the host opens the front door with a welcoming gesture; the traveller on the doorstep | briefing (`M13_BRIEFING_IMAGE`); Coming-in card |
| `home-compliment` | "Thanks. Your home is beautiful." | the traveller just inside, looking around admiringly, hand gesturing at the room | Coming-in card |
| `living-room-sofa` | "Let's sit in the living room." / "Is this sofa new?" / "Yes, it's new." | both in the living room by the new sofa; the traveller points at it, curious; the kitchen doorway empty | Living-room cards |
| `ask-family` | "Where is your family?" | the traveller, seated, asks with an open, curious face; the host about to answer | Family card |
| `mother-kitchen` | "My mother is in the kitchen." | the host gestures toward the kitchen doorway; the host's mother visible in the kitchen | Answer card |
| `live-with-family` | "Yes, I live with my family." | the traveller answers warmly, hand on chest (no family photos needed) | Answer card |
| `food-invitation` | "Are you hungry? Do you want to eat with us?" | the host invites with a gesture toward the kitchen / table | Invitation card |
| `polite-decline` | "Thanks, but I'm going to eat at my grandmother's." | the traveller smiles, a polite "thank you, but…" hand; a small thought-bubble-free hint of another plan (e.g. glancing at a phone) — no grandmother shown | Invitation card |
| `tired` | "You look tired. Are you okay?" / "Yes, I'm just tired." | the traveller visibly tired but smiling; the host concerned | How-you-feel cards |
| `going-home` | "Then go home and rest!" / "Yes, I'm going home." | the traveller standing up to leave, jacket in hand; the host encouraging | Home cards |
| `after-dinner` | "And after dinner at your grandmother's?" / "I'm going to sleep." | the traveller at the door, miming "sleep" (hands by the cheek), both laughing | After cards |
| `goodbye` | "Ha! Good night. Say hi to your family!" | a warm goodbye at the door, a wave | After card |

## Props: result pictures (never a card, never a choice)

| Prop | Meaning | Composition | Used in |
|---|---|---|---|
| `home-visit-complete` | the visit done | the traveller walking off into the evening, the host waving from the lit doorway | the 🏠 HOME VISIT COMPLETE receipt |
