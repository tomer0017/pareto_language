# Mission 09 — Shopping: visual manifest

**Status: FINAL ART INTEGRATED (2026-11-02).** 13 semantic slots and 2 props use canonical JPEG paths, with no semantic emoji fallback. Two supplemental scenes provide the continuous store map and purchase completion. All 17 assets are separately generated 1672 × 941 images, shared by EN / ES / FR. Approved dialogue, 33 interactions, answers and reveal timing are preserved.

See [visual integration report](MISSION09_VISUAL_REPORT.md) and [asset provenance/checksums](mission09-artwork.json).

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

The live map uses one continuous `store-layout.jpg`, with four equal semantic hit areas for fitting room, till, racks and entrance. Canonical prop/slot references remain in the map data; separate cell images are not rendered. Correctness uses semantic IDs, independently of array order or grid coordinates. `purchase-complete.jpg` decorates only the final receipt.

## Data stays UI — never artwork

| Choice | Representation |
|---|---|
| Size ladder | Text tiles `S · M · L · XL`, identical style (answer: L — one size up from M) |
| Discount | Text tiles `−10% · −20% · −50%`, identical style (answer: −20%) |
| Shopping Journey | Text stages `Browse · Try on · Size fixed · Sale understood · Buy` with ✅ / ⬜ |
| Too-small state | App-language receipt text ("In the fitting room: size M is too small for you.") |
