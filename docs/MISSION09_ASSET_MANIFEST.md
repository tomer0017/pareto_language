# Mission 09 — Shopping: visual manifest

**Status: VISUAL PRODUCTION REQUIRED IN ASTRA PASS.** Every slot below currently renders its emoji
stand-in (`image` unset in `M09_SLOTS` / `M09_PROPS`, `apps/web/src/features/bootcamp/practiceArrival.ts`).
The learning flow, the 33 interactions, the dialogue, the answers and the reveal timing are final; the
art pass only fills `image` paths. Shared unchanged across EN / ES / FR (no language-specific art).

## Continuity

ONE store for every picture: the same shopper, the same salesperson, the same jacket (the item the
shopper likes), the same racks, fitting room and till. Scenes explain actions; data stays app UI.

## Semantic slots (13)

Canonical path to use: `images/mission09/<slot>.jpg` (wide, ≈16:9, ≥1536 px wide, one file per meaning).

| Slot | Meaning (what the picture must show) | Must NOT show |
|---|---|---|
| store-browse | Shopper browsing the racks of a clothes shop | sizes, price tags, sale signs |
| salesperson-offers-help | Salesperson approaching, friendly offer of help | the jacket being tried |
| just-looking | Shopper smiling, small "just looking" gesture, browsing on | any purchase |
| take-your-time | Salesperson stepping back, open hand — "take your time" | a clock / a number |
| selected-item | The jacket the shopper likes, held up | its size label, its price |
| try-this-on | Shopper holding the jacket, asking to try it | the fitting room interior |
| fitting-room | The fitting room, salesperson pointing towards it | the till |
| too-small | Shopper in the fitting room, jacket visibly too tight | any size letter |
| ask-bigger-size | Shopper at the curtain asking, gesturing "bigger" | the replacement jacket |
| one-size-up | Salesperson handing over the same jacket, one size up | a size letter (the ladder is UI) |
| sale-reveal | Salesperson pointing at a sale tag on the jacket | the figure 20 / % (the discount is UI) |
| take-it | Shopper's decision — happy nod, jacket in hand | payment |
| till | The till / counter, salesperson ready to ring up | a total or a price |

## Props (2, store map only — picture-only, never named in the learning language)

| Prop | Representation |
|---|---|
| racks | Clothes racks seen from above (same style as the map's other cells) |
| entrance | The shop entrance / door seen from above |

On the store map the fitting room and the till cells reuse their slots. **Fairness:** all four
tappable map cells must be of ONE kind (all artwork, or all emoji as today) — never artwork beside emoji.

## Data stays UI — never artwork

| Choice | Representation |
|---|---|
| Size ladder | Text tiles `S · M · L · XL`, identical style (answer: L — one size up from M) |
| Discount | Text tiles `−10% · −20% · −50%`, identical style (answer: −20%) |
| Shopping Journey | Text stages `Browse · Try on · Size fixed · Sale understood · Buy` with ✅ / ⬜ |
| Too-small state | App-language receipt text ("In the fitting room: size M is too small for you.") |
