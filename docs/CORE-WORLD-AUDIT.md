# READY — Core World Audit & Expansion (Phase 1–2)

Audit of the user-supplied ~179-concept Hebrew candidate list against the existing 532-concept
Core Corpus. Produced before any code change, per the mandated workflow.

## 0. Executive finding — why Core World gaps existed

The corpus grew by optimizing a single axis: **adult transactional-travel value** (survival glue,
questions, hotel/restaurant/health/transport). That axis is dense in *communication verbs and
service nouns* but sparse in the *concrete, picturable everyday world* a 3–4-year-old already
names. So the corpus could hold 500+ concepts and still miss `wolf`, `pig`, `mouse`, `book (noun)`,
`lips`, `angry`, `notebook` — none of which appear in a hotel dialogue, all of which saturate
beginner **stories, illustrations, songs and visual drills**. The fix is not "more words" but a
second axis — **Core World** — placed at the right learning depth so breadth ≠ early cognitive load.

Note: a prior session already began this (Phase-1 21 concepts: house, school, farm, grandparents,
people, ball, carrot, potato, bowl, rabbit, clothes, sky, star, play/read/write/cook/wear/build/sing).
Those are **re-audited** below and kept.

## 1. Normalization

- **Raw entries pasted:** 184 (179 in the first block + 5 family terms appended: אח/אחות/אחים/הבן שלי/הבת שלי).
- **Empty tokens removed:** 1 (the `,,` double-comma between תבלינים and כדורגל).
- **Typos corrected (concept preserved, shown in table):**
  - `ילש` → **ילדה** (girl) · `ילדב` → **ילד** (boy) · `אנרב` → **ארנב** (rabbit) · `מךפפון` → **מלפפון** (cucumber)
- **Unique normalized concepts:** 183.

### Near-duplicate / ambiguity notes (kept distinct where the learner must distinguish)
- שעון (clock) vs שעון יד (watch) — kept distinct (existing `watch`=שעון; add `clock`).
- מטרייה (rain umbrella) vs שמשייה (sun parasol) — distinct.
- ארגז (crate) vs קופסה (box) — distinct.
- ספר (book, noun) vs existing `book` (verb "to reserve") — surface collision, see §6.
- תפוז (orange fruit) vs existing `orange` (colour) — surface collision, see §6.
- טבח (cook = person) vs existing `cook` (verb); תרנגול (rooster) vs `chicken` (food);
  זמר (singer) vs `sing` (verb) — resolved with distinct English surfaces (chef/rooster/singer).
- אח (brother) vs אחים (brothers/siblings) — the latter reuses `brother`.
- הבן שלי / הבת שלי — possessive phrases, composed from `son`/`daughter` + `my` (no new concept).
- כוס = glass (existing `glass`); נעל = shoe → existing `shoes`; דג = fish → existing `fish`;
  אש = fire → existing `fire`; פלאפון = mobile → existing `phone`; אסלה → existing `toilet`;
  ריצה = running → existing `run`. All reuse.

## 2. Counts (summary)

| Bucket | Count |
|---|---|
| Already present (reuse, no addition) | 79 |
| **New concepts added** | **101** |
| — Tier A (early Foundation) | 9 (incl. `chin`, `pot` added on review) |
| — Tier B (Extended Core World) | 44 |
| — Tier C (contextual) | 48 |
| No new concept (composed / duplicate) | 5 |
| Requiring architectural handling | 2 (`book` noun, `orange` fruit) |

Resulting corpus size: **532 → 633** (99 from the audited list + `chin`/`pot` from the original
non-negotiable examples).

## 3. Full candidate audit (one row per supplied concept, original order)

Status: **E** = exists (reuse) · **N** = new · **C** = composed/duplicate (no new concept).

| # | Hebrew | EN concept | Status | Tier | Notes |
|---|---|---|---|---|---|
| 1 | עצבני | angry | N | A | emotion; not in corpus |
| 2 | עצוב | sad | E | — | `sad` |
| 3 | שמח | happy | E | — | `happy` |
| 4 | עיר | city | E | — | `city` |
| 5 | עין | eye | E | — | `eye` |
| 6 | אוהב | love | E | — | `love` (verb) |
| 7 | חולה | sick | E | — | `sick` |
| 8 | לתת כיף | high-five | N | C | gesture; phrase-kind |
| 9 | ללחוץ יד | shake hands | N | C | gesture; phrase-kind |
| 10 | נשיקה | kiss | N | B | everyday/emotional |
| 11 | שפתיים | lips | N | A | body part |
| 12 | ילדה *(ילש)* | girl | E | — | typo→girl |
| 13 | ילד *(ילדב)* | boy | E | — | typo→boy |
| 14 | אמא | mother | E | — | `mother` |
| 15 | אבא | father | E | — | `father` |
| 16 | סבתא | grandmother | E | — | `grandmother` |
| 17 | סבא | grandfather | E | — | `grandfather` |
| 18 | טבח | chef | N | B | cook-as-person (vs verb `cook`) |
| 19 | סטודנט | student | N | B | occupation |
| 20 | צייר | painter | N | B | person (vs `drawing`/`art`) |
| 21 | ציור | drawing | N | B | artwork noun |
| 22 | אומנות | art | N | B | abstract but high story/museum value |
| 23 | חתן | groom | N | B | life event |
| 24 | כלה | bride | N | B | life event |
| 25 | תינוק | baby | E | — | `baby` |
| 26 | הריון | pregnant | N | C | health/people; adj `pregnant` |
| 27 | מבולבל | confused | N | A | emotion |
| 28 | תספורת | haircut | N | C | grooming |
| 29 | לק | nail polish | N | C | grooming |
| 30 | ציפורניים | fingernails | N | B | body |
| 31 | נעל | (shoes) | E | — | reuse `shoes` |
| 32 | חולצה | shirt | E | — | `shirt` |
| 33 | מכנס | pants | E | — | `pants` |
| 34 | כובע | hat | E | — | `hat` |
| 35 | משקפיים | glasses | E | — | `glasses` |
| 36 | תיק | bag | E | — | `bag` |
| 37 | שקית | plastic bag | N | C | vs `bag` (shopping/plastic) |
| 38 | מטרייה | umbrella | E | — | `umbrella` |
| 39 | כלב | dog | E | — | `dog` |
| 40 | ארנב *(אנרב)* | rabbit | E | — | typo→rabbit |
| 41 | חתול | cat | E | — | `cat` |
| 42 | שועל | fox | N | B | story animal |
| 43 | קוף | monkey | N | B | story animal |
| 44 | חזיר | pig | N | B | story animal |
| 45 | נמר | tiger | N | B | story animal (נמר=tiger) |
| 46 | אריה | lion | N | B | story animal |
| 47 | דב | bear | N | B | story animal |
| 48 | עכבר | mouse | N | B | story animal |
| 49 | תרנגול | rooster | N | B | animal (vs food `chicken`) |
| 50 | צפרדע | frog | N | B | story animal |
| 51 | סוס | horse | E | — | `horse` |
| 52 | פרפר | butterfly | N | B | story/visual |
| 53 | דג | (fish) | E | — | reuse `fish` |
| 54 | ג׳ירפה | giraffe | N | B | story/zoo animal |
| 55 | פרה | cow | E | — | `cow` |
| 56 | כבשה | sheep | N | B | farm animal |
| 57 | חמור | donkey | N | B | farm animal |
| 58 | תוכי | parrot | N | B | pet/story animal |
| 59 | עץ | tree | E | — | `tree` |
| 60 | עציץ | flowerpot | N | C | home/nature |
| 61 | פרח | flower | E | — | `flower` |
| 62 | פטריה | mushroom | N | B | food/nature/story |
| 63 | שמש | sun | E | — | `sun` |
| 64 | ירח | moon | E | — | `moon` |
| 65 | כדור הארץ | earth (planet) | N | C | vs `soil` |
| 66 | כוכב | star | E | — | `star` |
| 67 | אש | (fire) | E | — | reuse `fire` |
| 68 | קרח | ice | N | B | nature/food |
| 69 | מים | water | E | — | `water` |
| 70 | אוויר | air | N | B | element |
| 71 | אדמה | soil | N | C | ground/soil (vs planet) |
| 72 | גשם | rain | E | — | `rain` |
| 73 | שלג | snow | E | — | `snow` |
| 74 | חם | hot | E | — | `hot` |
| 75 | קר | cold | E | — | `cold` |
| 76 | תפוח | apple | E | — | `apple` |
| 77 | לימון | lemon | N | B | food |
| 78 | בננה | banana | E | — | `banana` |
| 79 | תפוז | orange (fruit) | N | B | ⚠ collision w/ colour `orange` |
| 80 | עגבניה | tomato | E | — | `tomato` |
| 81 | מלפפון *(מךפפון)* | cucumber | N | B | typo→cucumber |
| 82 | גזר | carrot | E | — | `carrot` |
| 83 | בצל | onion | N | B | food |
| 84 | לחם | bread | E | — | `bread` |
| 85 | גבינה | cheese | E | — | `cheese` |
| 86 | ביצה | egg | E | — | `egg` |
| 87 | עוף | chicken (food) | E | — | `chicken` |
| 88 | בשר | meat | E | — | `meat` |
| 89 | צ׳יפס | fries | N | C | food |
| 90 | פיצה | pizza | E | — | `pizza` |
| 91 | פסטה | pasta | E | — | `pasta` |
| 92 | סלט | salad | E | — | `salad` |
| 93 | סנדוויץ | sandwich | E | — | `sandwich` |
| 94 | מרק | soup | E | — | `soup` |
| 95 | אורז | rice | E | — | `rice` |
| 96 | עוגה | cake | E | — | `cake` |
| 97 | ממתקים | candy | N | C | food |
| 98 | חטיפים | snacks | N | C | food |
| 99 | דבש | honey | N | C | food |
| 100 | קנקן | jug | N | C | tableware |
| 101 | כוס | (glass) | E | — | reuse `glass` |
| 102 | בירה | beer | E | — | `beer` |
| 103 | קוקטייל | cocktail | N | C | drink |
| 104 | מלח | salt | E | — | `salt` |
| 105 | תבלינים | spices | N | C | food |
| 106 | כדורגל | football | E | — | `football` |
| 107 | כדורסל | basketball | N | C | sport |
| 108 | טניס | tennis | N | C | sport |
| 109 | סנוקר | billiards | N | C | snooker→billiards |
| 110 | גולף | golf | N | C | sport |
| 111 | צלילה | diving | N | C | sport |
| 112 | ריצה | (running) | C | — | reuse `run` |
| 113 | האבקות | wrestling | N | C | sport |
| 114 | להתאמן | exercise | N | C | verb |
| 115 | לגלוש | surf | N | C | verb |
| 116 | מנצח | winner | N | C | sport/game |
| 117 | מפסיד | loser | N | C | sport/game |
| 118 | קרקס | circus | N | C | entertainment |
| 119 | הופעה | show (performance) | N | C | noun (vs verb `show`) |
| 120 | ליצן | clown | N | C | story/entertainment |
| 121 | זמר | singer | N | C | person (vs verb `sing`) |
| 122 | מוזיקאי | musician | N | C | person |
| 123 | אוזניות | headphones | E | — | `headphones` |
| 124 | קובייה | dice | N | C | game object |
| 125 | גיטרה | guitar | N | B | instrument |
| 126 | לשחק | play | E | — | `play` |
| 127 | מכונית | car | E | — | `car` |
| 128 | אופנוע | motorcycle | N | B | transport |
| 129 | אוטובוס | bus | E | — | `bus` |
| 130 | קורקינט | scooter | N | C | transport |
| 131 | טרקטור | tractor | N | B | story/farm transport |
| 132 | רכבת | train | E | — | `train` |
| 133 | טיל | rocket | N | C | transport/story |
| 134 | חללית | spaceship | N | C | story |
| 135 | מסוק | helicopter | N | B | transport |
| 136 | אונייה | ship | N | B | transport (vs `boat`) |
| 137 | סירה | boat | E | — | `boat` |
| 138 | רמזור | traffic light | E | — | `traffic-light` |
| 139 | אצטדיון | stadium | N | C | place |
| 140 | שמשייה | parasol | N | C | vs `umbrella` |
| 141 | אוהל | tent | N | B | outdoor/story |
| 142 | הר | mountain | E | — | `mountain` |
| 143 | בית | house | E | — | `house` |
| 144 | גינה | garden | E | — | `garden` |
| 145 | מנוף | crane | N | C | machine |
| 146 | בית כנסת | synagogue | N | C | place (vs `church`) |
| 147 | מקדש | temple | N | C | place |
| 148 | זריחה | sunrise | N | B | nature |
| 149 | שקיעה | sunset | N | B | nature |
| 150 | שעון | clock | N | B | vs `watch` |
| 151 | שעון יד | (watch) | E | — | reuse `watch` |
| 152 | טלוויזיה | television | E | — | `television` |
| 153 | מדפסת | printer | N | C | technology |
| 154 | פלאפון | (phone) | E | — | reuse `phone` |
| 155 | טלפון | phone | E | — | `phone` |
| 156 | פטיש | hammer | N | B | tool |
| 157 | מסמר | nail (tool) | N | C | tool (vs `fingernails`) |
| 158 | חיידק | germ | N | C | health/science |
| 159 | כביסה | laundry | E | — | `laundry` |
| 160 | אסלה | (toilet) | E | — | reuse `toilet` |
| 161 | מקלחת | shower | E | — | `shower` |
| 162 | נייר טואלט | toilet paper | E | — | `toilet-paper` |
| 163 | ספוג מקלחת | sponge | N | C | bath |
| 164 | פעמון | bell | N | C | object |
| 165 | מפתח | key | E | — | `key` |
| 166 | דובי | teddy bear | N | B | children's story |
| 167 | דלי | bucket | N | C | object |
| 168 | מתנה | gift | E | — | `gift` |
| 169 | בלון | balloon | N | B | party/story |
| 170 | מראה | mirror | E | — | `mirror` |
| 171 | מכתב | letter | N | C | mail |
| 172 | ארגז | crate | N | C | vs `box` |
| 173 | קופסה | box | N | B | container |
| 174 | תיבת דואר | mailbox | N | C | mail |
| 175 | ספר | book (noun) | N | A | ⚠ collision w/ verb `book` |
| 176 | מחברת | notebook | N | A | school |
| 177 | עט | pen | E | — | `pen` |
| 178 | עיפרון | pencil | N | A | school |
| 179 | מחק | eraser | N | A | school |
| 180 | אח | brother | E | — | `brother` |
| 181 | אחות | sister | E | — | `sister` |
| 182 | אחים | (siblings) | C | — | reuse `brother` (plural/ambiguous) |
| 183 | הבן שלי | my son | C | — | compose `son`+`my` |
| 184 | הבת שלי | my daughter | C | — | compose `daughter`+`my` |

## 4. New concepts — implementation spec (EN / FR / ES / Hebrew gloss)

FR/ES are neutral traveler register (FR **vous**; ES everyday LatAm-leaning), citation form, AI-drafted
**pending native review** — consistent with the existing pilot honesty policy.

### Tier A (7) — early Foundation
| slug | EN | FR | ES | he | cat |
|---|---|---|---|---|---|
| angry | angry | fâché | enojado | עצבני | descriptions |
| confused | confused | confus | confundido | מבולבל | descriptions |
| lips | lips | lèvres (fpl) | labios (mpl) | שפתיים | body |
| book-noun *(surface "book")* | book | livre (m) | libro (m) | ספר | objects |
| notebook | notebook | cahier (m) | cuaderno (m) | מחברת | objects |
| pencil | pencil | crayon (m) | lápiz (m) | עיפרון | objects |
| eraser | eraser | gomme (f) | goma (f) | מחק | objects |

### Tier B (44) — Extended Core World
Animals: fox renard/zorro · monkey singe/mono · pig cochon/cerdo · tiger tigre/tigre ·
lion lion/león · bear ours/oso · mouse souris(f)/ratón · rooster coq/gallo · frog grenouille/rana ·
butterfly papillon/mariposa · giraffe girafe/jirafa · sheep mouton/oveja · donkey âne/burro ·
parrot perroquet/loro.
Nature: mushroom champignon/champiñón · ice glace/hielo · air air/aire · sunrise «lever de soleil»/amanecer ·
sunset «coucher de soleil»/atardecer.
Food: lemon citron/limón · orange(fruit) orange/naranja · cucumber concombre/pepino · onion oignon/cebolla.
People: chef cuisinier/cocinero · student étudiant/estudiante · painter peintre/pintor · singer chanteur/cantante.
Life/objects: groom marié/novio · bride mariée/novia · kiss bisou/beso · tent tente/carpa ·
teddy-bear nounours/«osito de peluche» · balloon ballon/globo · box boîte/caja · guitar guitare/guitarra · clock horloge/reloj.
Creative: drawing dessin/dibujo · art art/arte.
Transport: tractor tracteur/tractor · helicopter hélicoptère/helicóptero · ship navire/barco · motorcycle moto/moto.
Body/tool: fingernails ongles(mpl)/uñas(fpl) · hammer marteau/martillo.

### Tier C (48) — contextual
Gestures: high-five «taper dans la main»/«chocar los cinco» (phrase) · shake-hands «serrer la main»/«dar la mano» (phrase).
Grooming/body: pregnant enceinte/embarazada · haircut «coupe de cheveux»/«corte de pelo» · nail-polish «vernis à ongles»/«esmalte de uñas».
Bag: plastic-bag «sac plastique»/bolsa.
Earth/nature: flowerpot «pot de fleurs»/maceta · earth Terre/Tierra · soil terre/tierra.
Food/drink: fries frites/«papas fritas» · candy bonbon/dulce · snacks «en-cas»/«aperitivo» · honey miel/miel ·
jug pichet/jarra · cocktail cocktail/cóctel · spices épices/especias.
Sports: basketball basket/baloncesto · tennis tennis/tenis · billiards billard/billar · golf golf/golf ·
diving plongée/buceo · wrestling lutte/lucha · exercise s'entraîner/entrenar · surf surfer/surfear ·
winner gagnant/ganador · loser perdant/perdedor.
Entertainment: circus cirque/circo · performance spectacle/espectáculo · clown clown/payaso · musician musicien/músico · dice dé/dado.
Transport: scooter trottinette/patinete · rocket fusée/cohete · spaceship «vaisseau spatial»/«nave espacial» · stadium stade/estadio.
Structures: crane grue/grúa · synagogue synagogue/sinagoga · temple temple/templo · parasol parasol/sombrilla.
Household/tools: printer imprimante/impresora · nail(tool) clou/clavo · germ microbe/germen · sponge éponge/esponja ·
bell cloche/campana · bucket seau/balde · letter lettre/carta · crate caisse/cajón · mailbox «boîte aux lettres»/buzón.

## 5. Reused existing concepts (79)

sad, happy, city, eye, love, sick, girl, boy, mother, father, grandmother, grandfather, baby, shoes,
shirt, pants, hat, glasses, bag, umbrella, dog, rabbit, cat, horse, fish, cow, tree, flower, sun, moon,
star, fire, water, rain, snow, hot, cold, apple, banana, tomato, carrot, bread, cheese, egg, chicken,
meat, pizza, pasta, salad, sandwich, soup, rice, cake, glass, beer, salt, football, run, headphones,
play, car, bus, train, boat, traffic-light, mountain, house, garden, watch, television, phone, laundry,
toilet, shower, toilet-paper, key, gift, mirror, pen, brother, sister.

## 6. Technical collisions & handling

Surface uniqueness is enforced per **kind** only (`corpus.ts` `surfaceKey = kind:en`). Two concepts
with the same English surface *and* kind `word` collide, even when they are different parts of speech.

- **`book` (noun) vs `book` (verb "to reserve")** and **`orange` (fruit) vs `orange` (colour)** — the
  new nouns share a surface with an existing word of a *different* part of speech. Fix: extend the
  uniqueness key to be **pos-aware** (`kind:pos:en`). This is the prompt-endorsed "noun/verb-aware /
  scoped surface uniqueness" — the smallest safe change, and it still forbids genuine same-pos
  duplicates. No slug renames, no game-logic change.
- **cook(verb)/chef, chicken(food)/rooster, sing(verb)/singer, show(verb)/performance, watch/clock,
  box/crate, umbrella/parasol, fingernails/nail(tool)** — resolved with *distinct English surfaces*,
  no architecture change.
- Emoji uniqueness is enforced; each new concept with an emoji gets a Unicode-distinct one; overflow
  concepts ship without emoji (still valid, just not image-game eligible).

## 7. Learning placement

- **Tier A (7)** → early Core/Foundation surface (emotions + school kit + lips + the noun `book`).
- **Tier B (44)** → Extended Core World cards / thematic collections / story unlocks (animals, nature,
  occupations, instruments, larger transport).
- **Tier C (48)** → surfaced contextually by stories, missions and Universal Tap; not competing for
  first-session attention.
- **All 99** → available to Universal Tap the moment a learner encounters them.

## 8. Rejections / no-new-concept (with reason)

None *rejected outright*. Five entries add **no new concept** because they are fully covered:
- `הבן שלי` / `הבת שלי` — possessive phrases composed from existing `son`/`daughter` + `my`.
- `אחים` — plural/ambiguous ("brothers"/"siblings"); covered by `brother` (+`sister`).
- `ריצה` — nominalization of existing verb `run`.
- the empty `,,` token — not a concept.

## 9. Runtime collision audit (POST-implementation)

Build-time acceptance ≠ runtime safety. The pos-scoped uniqueness change let two concepts share one
written surface (`book` noun/verb, `orange` fruit/colour). We traced every surface-based resolver:

| Resolver | Keyed by | Homograph-safe? |
|---|---|---|
| Audio (`SpeakerButton`) | the surface string spoken directly | ✅ speaking "book" is correct for either sense |
| Foundation **Browse** / Core Words | iterates concepts by `conceptId` | ✅ book(noun) and book(verb) are separate cards |
| Foundation **Sheet** page | a specific `CoreWord` | ✅ concept-specific |
| **Universal Tap** (`corpusIndex.bySurface`) | normalized **surface only** | ⚠️ **was broken** — see below |

**Finding.** `buildCorpusIndex` mapped surface→word with `if (bySurface.has(key)) continue` — an
**arbitrary, iteration-order first-match**. Because packs load rank-sorted, tapping "book" always
resolved to the higher-value **verb** ("to reserve") and the noun `book-noun` was **silently
dropped** (unreachable via tap); "orange" always resolved to the **colour**, fruit dropped. A
surface tokenizer *cannot* infer POS from sentence context ("I read a book" vs "book a room") — that
needs a grammar parser, which is out of scope and would itself be fragile/arbitrary.

**Fix (smallest safe, deterministic, no regression).**
- `buildCorpusIndex` now collects **all** senses per surface into `sensesBySurface`, ordered by a
  pure comparator (rank asc, conceptId tiebreak) — the primary is chosen **deterministically,
  independent of input order**. No arbitrary first-match.
- `segmentText` attaches `senses` to a matched span when the surface is a homograph.
- The word sheet renders an **"Other meaning" chip for each alternate sense, labelled with that
  sense's OWN meaning** (ספר / להזמין; תפוז / כתום) — never a generic label — so the learner sees
  what they are choosing before tapping. Tapping a chip re-opens via `openWord`, so the alternate
  shows its own conceptId, gloss, example, audio and marks its OWN concept viewed (progress never
  bleeds across senses). Both directions toggle (verb⇄noun). Audio/Browse/Sheet were already safe.
- The primary sense is unchanged from prior behavior (highest value = lowest rank), so existing
  transactional flows (tap "book" in a hotel mission → "to reserve") do **not** regress; the concrete
  noun is now one tap away via the chip.

**Regression tests added.**
- Build (`core-corpus.test.ts`): same surface + different POS **allowed** (book n/v, orange n/adj);
  same surface + same POS still **rejected**; the four real concepts ship with the right POS.
- Runtime (`corpusIndex.test.ts`): all senses retained; **primary is order-independent** (both input
  orderings agree — the old code would not); homograph spans carry `senses`; single-sense words don't;
  `alternateSenses` returns exactly the OTHER conceptId (never the current one, both directions);
  `senseLabel` shows each sense's own gloss (ספר / להזמין / תפוז / כתום).
- Store (`foundationStore.test.ts`): `openWord` stores `targetSenses` only for homographs (> 1), so
  ordinary words show no chip; `close` clears it.

## 10. Final tier inventory & placement

There is **no stored "Tier A" flag**. The app's learner-facing depth = pack `tier = layer − 1`
(`corpus.ts`), ordered within a tier by `rank` (communicative value). The Core World Audit A/B/C are
*curation labels*; each maps to a `layer` consistent with sibling concepts.

- **tier 0 (layer 1) — the earliest/basic cohort: 99 concepts.** Includes `house` (rank 94), `water`,
  `fire`, plus the survival set (help, toilet, doctor, want, where, eat, pay, hotel …). `house` is
  therefore an **early basic**, not a contextual story word — confirmed.
- tier 1 (layer 2): 449 · tier 2 (layer 3): 83. Everyday-world nouns (dog, cat, eye, book(noun),
  cup, fork, mother …) live in **tier 1 by design** — concrete but lower travel-value than the tier-0
  survival core. Newly-added Core World "Tier A" items sit at tier 1 alongside their siblings
  (`lips` with eye/nose; `book-noun`/`notebook`/`pencil` with `pen`), with `eraser` at tier 2. This
  is internally consistent — none are mis-filed as contextual (Tier C).

**Placement of the explicitly-named concepts** (● present · ○ gap):

| concept | status | tier / rank | note |
|---|---|---|---|
| house ● | tier 0 · 94 | early basic ✓ |
| home ○ | — | **alias of `house`** — see §11 |
| sun ● | tier 1 · 413 | |
| tree ● | tier 1 · 532 | |
| garden ● | tier 1 · 511 | |
| dog ● / cat ● | tier 1 · 409/410 | |
| mother ● / father ● | tier 1 · 402/403 | |
| child ● / baby ● | tier 1 · 287/415 | |
| eye ● ear ● nose ● lips ● | tier 1 · 442/467/466/468 | `lips` newly added |
| chin ● | tier 1 | **added on review** (beside eye/nose/lips) |
| shirt ● pants ● shoes ● hat ● glasses ● bag ● | tier 1 | `shoe`→`shoes` (plural is the concept) |
| bowl ● plate ● fork ● spoon ● knife ● cup ● | tier 1 | |
| pot ● | tier 1 | **added on review** (beside bowl/cup) |
| book ● (noun) | tier 1 · 427 | + `book` verb "reserve" (distinct) |
| notebook ● pen ● pencil ● | tier 1 · 514/405/515 | |
| eraser ● | tier 2 · 619 | genuinely lowest-value of the set |
| key ● | tier 1 · 176 | |
| water ● fire ● | tier 0 · 41/82 | early basic ✓ |
| happy ● sad ● angry ● confused ● | tier 1 · 328/431/433/434 | `angry`/`confused` newly added |
| sick ● love ● | tier 1 · 158/301 | |

Gaps surfaced by this check were **child-basic and outside the 179 list** but in the original
non-negotiable examples: `chin` and `pot` — both **now added** with full EN/FR/ES parity
(chin: menton / barbilla; pot: casserole / olla), bringing the corpus to **633**. (`home` handled in
§11; `shoe`=`shoes`.)

## 11. House vs home — decision: KEEP `house` + `home` alias (do not split yet)

English distinguishes them (`house` = building; `home` = dwelling / adverbial "go home", "at home").
But the split is **not clean under the current architecture and target languages**:
- In **both** current learning languages the two collapse to **one word** — FR `maison`, ES `casa`.
  A standalone `home` concept would realize *identically* to `house` in FR/ES, creating a
  same-realization pair that reads as a pointless duplicate (and my new homograph chip would show
  "maison / maison" — noise, not a distinction).
- The senses the user cites are largely **adverbial/phrasal** — "I'm going home" = *je rentre / à la
  maison*, *voy a casa*; "I'm at home" = *à la maison / chez moi*, *en casa*. These are phrases, not a
  bare noun, and the concept model is noun-centric.

**Decision:** keep the safest current representation — one concept `house` (`בית` / maison / casa)
with `home` as an alias. **Limitation:** the English adverbial "home" is not yet its own tappable
concept (aliases aren't in the Universal-Tap surface index).

**Migration path** (when justified): (1) add phrase/idiom entries for adverbial home (*rentrer* /
*à la maison*; *ir a casa* / *en casa*); (2) add a `home` **noun** concept (English surface "home",
distinct — no collision) once the model can mark two concepts as *intentionally co-realized* in a
language (maison/casa) with distinct glosses; (3) optionally index aliases as secondary tap surfaces
so "home" becomes tappable → `house`. Until then the alias is the honest mapping.

## 12. Family composition — unchanged

`my son`, `my daughter`, `siblings` stay **composed** (`son`/`daughter`/`brother`/`sister` + `my`
all exist). No corpus/story/mission evidence requires standalone concepts; not added for completeness.
