# Car hire card (Car Block / Car List) — design spec

> **Manually derived from screenshots, not from Figma.** The Figma API returned
> 403 "File not exportable", so this spec was written by reading the PNGs in
> `docs/design/` and mapping every visual value to the nearest token in
> `src/design-system.css`. Approximate px values are estimates, kept only so a
> human can check them against Figma. Every guess is listed under
> [Assumptions](#assumptions); the human will fine-tune visuals later.

- Figma node: `10308-24250` (CarTrawler Technical Assessment, "Car hire card
  [Pattern]")
- Sources: `docs/design/Car hire card.png` (all four sizes),
  `docs/design/card small.png`, `docs/design/card medium.png`,
  `docs/design/car large.png`, `docs/design/car xl.png`
- Open style questions (unanswered): `docs/design/design-questions.md`
- Date: 2026-10-21

## 1. Sizes and breakpoints

Four card sizes. The design-system breakpoints are viewport widths, so each size
is bound to a viewport range (mobile-first `min-width`). Media queries must use
the literal px value with a comment naming the token.

| Size   | Viewport (proposed) | Media query                      | Layout                             | Est. card width in design |
| ------ | ------------------- | -------------------------------- | ---------------------------------- | ------------------------- |
| Small  | `< 608px`           | base styles (no query)           | Image on top, content below        | ~320px                    |
| Medium | `608px – 839px`     | `(min-width: 608px)` mobile      | Image on top, content below        | ~363px                    |
| Large  | `840px – 1024px`    | `(min-width: 840px)` tablet      | Image column left, content right   | ~625px                    |
| XL     | `>= 1025px`         | `(min-width: 1025px)` desk-small | Image column left (wider), content | ~778px                    |
| —      | `>= 1328px`         | `--breakpoint-desktop-large`     | No change (same as XL)             | —                         |

Card widths are derived from the overview frame (feature-row pitch of 12px at
Small = 20px line height of `.ts-body-m-*`, scale ~0.6). The card always fills
its container width; widths above are only for proportion checks.

## 2. What each size shows

| Element                                  | Small | Medium | Large |  XL  |
| ---------------------------------------- | :---: | :----: | :---: | :--: |
| Car image                                |  top  |  top   | left  | left |
| Cancellation badge ("Free Cancellation") |  yes  |  yes   |  yes  | yes  |
| Category title ("Economy")               |  yes  |  yes   |  yes  | yes  |
| Vehicle name ("Fiat 500 or similar")     |  yes  |  yes   |  yes  | yes  |
| Vendor logo + rating chip + rating label |  yes  |  yes   |  yes  | yes  |
| Seats, bags, doors, transmission         |  yes  |  yes   |  yes  | yes  |
| Fuel policy                              |  no   |  yes   |  yes  | yes  |
| Mileage                                  |  yes  | yes\*  | yes\* | yes  |
| Included Cover                           |  no   |   no   |  yes  | yes  |
| Pickup location name + pickup type       |  yes  |  yes   |  yes  | yes  |
| Price per day + total                    |  yes  |  yes   |  yes  | yes  |
| "Important information" link             |  no   |   no   |  yes  | yes  |
| "Select" button                          |  no   |   no   |  yes  | yes  |

\* **Design typo:** Medium and Large show the mileage icon followed by
"4 seats". Render the real mileage policy text (as Small and XL do).

Feature items flow in a single wrapping row list; line breaks in the
screenshots are natural wrapping (Large: "Fuel policy" does not fit after
"Manual" so it wraps; "Included Cover" wraps after "Mileage"). Order: seats,
bags, doors, transmission, fuel policy, mileage, included cover.

## 3. Layout (all sizes)

```
article.car-block                      (Small/Medium: column; Large/XL: 2-col grid)
├── media     (image area)
└── content   (column)
    ├── badge                          (full width, start-aligned)
    └── body  (row: main | aside, space-between)
        ├── main  (column, flex 1)
        │   ├── title + vehicle name
        │   ├── features list (wrapping row)
        │   ├── location (name + pickup type)
        │   └── "Important information" link   (Large/XL)
        └── aside (column, align end, justify space-between)
            ├── vendor box (logo + rating chip) + rating label
            └── price group (per-day price, total, Select button (Large/XL))
```

The price group sits bottom-right in every size (aside uses
`justify-content: space-between`), aligned with the location block at
Small/Medium and with the Important information link / Select at Large/XL.

### Per-size layout values

| Property                      | Small                         | Medium                                            | Large                                          | XL                    |
| ----------------------------- | ----------------------------- | ------------------------------------------------- | ---------------------------------------------- | --------------------- |
| Card direction                | column                        | column                                            | grid `minmax(0,1fr) minmax(0,2fr)`             | grid `2fr 3fr`        |
| Media height                  | `--space-1400` (~107px meas.) | `calc(--space-1400 + --space-200)` (~133px meas.) | stretch to card height                         | stretch               |
| Media divider                 | none                          | none                                              | `--bw-xs` solid `--border-subtle` (inline-end) | same                  |
| Media padding (image inset)   | `--space-100`                 | `--space-100`                                     | `--space-200`                                  | `--space-200`         |
| Content padding               | `--space-150` (~11px meas.)   | `--space-200` (~14px)                             | `--space-200` (~14px)                          | `--space-200` (~15px) |
| Content gap (badge → body)    | `--space-150`                 | `--space-150`                                     | `--space-150`                                  | `--space-150`         |
| Body gap (main ↔ aside)       | `--space-200`                 | `--space-200`                                     | `--space-200`                                  | `--space-200`         |
| Main gap (between groups)     | `--space-100`                 | `--space-100`                                     | `--space-150`                                  | `--space-150`         |
| Gap location → Important info | —                             | —                                                 | `--space-200`                                  | `--space-200`         |

## 4. Tokens per element

### Card and media

| Element       | Property    | Token                                                        |
| ------------- | ----------- | ------------------------------------------------------------ |
| Card          | background  | `--container-default`                                        |
| Card          | border      | `--bw-xs` solid `--border-subtle`                            |
| Card          | radius      | `--br-s` (Figma: Corner radius/radius-s), `overflow: hidden` |
| Card          | shadow      | none (confirmed in Figma)                                    |
| Media         | background  | `--container-alt` (rgb 242)                                  |
| Car image     | fit         | `object-fit: contain`, centred, max 100%                     |
| Missing image | placeholder | car icon, colour `--text-disabled`, size `--space-600`       |

### Typography and colour

| Element                     | `.ts-*` class                                                          | Colour                           | Other                                                                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Badge (free cancellation)   | `.ts-body-s-medium`                                                    | `--text-positive`                | bg `--bg-fill-positive-subtle`, radius `--br-xxs`, padding `--space-050` `--space-100`                                                                                                                      |
| Badge (cancellation fee)    | `.ts-body-s-medium`                                                    | `--text-subtle`                  | bg `--bg-fill-neutral-subtle`, same radius/padding                                                                                                                                                          |
| Title "Economy" (heading)   | `.ts-body-l-heavy` (Medium: Subtitle-S, Large/XL: Subtitle-M, see A27) | `--text-default`                 | margin 0                                                                                                                                                                                                    |
| Vehicle name                | `.ts-body-m-normal`                                                    | `--text-grey`                    | margin 0                                                                                                                                                                                                    |
| Feature item text           | `.ts-body-m-normal`                                                    | `--text-subtle`                  | list gap: column `--space-150`, row `--space-050`; icon ↔ text `--space-050`                                                                                                                                |
| Feature icon                | —                                                                      | `--text-subtle` (`currentColor`) | size `--space-200` (16px)                                                                                                                                                                                   |
| Location name               | `.ts-body-m-medium`                                                    | `--text-brand-primary`           |                                                                                                                                                                                                             |
| Pickup type ("In terminal") | `.ts-body-s-normal`                                                    | `--text-grey`                    |                                                                                                                                                                                                             |
| Vendor box                  | —                                                                      | —                                | border `--bw-xs` solid `--border-subtle`, radius `--br-xxs`, padding `--space-050`, gap `--space-100`, bg `--container-default`                                                                             |
| Vendor logo image           | —                                                                      | —                                | height `--space-250` (20px), width auto                                                                                                                                                                     |
| Rating chip ("8.6")         | `.ts-body-m-medium`                                                    | `--text-inverse`                 | bg by score band (see 5.4), radius `--br-xxs`, padding `--space-none` `--space-050`                                                                                                                         |
| Rating label ("Very good")  | `.ts-body-s-heavy`                                                     | `--text-default`                 | gap below vendor box `--space-050`                                                                                                                                                                          |
| Price amount ("€12")        | `.ts-headline-xs-heavy`                                                | `--price-primary-default`        |                                                                                                                                                                                                             |
| Price unit ("/day")         | `.ts-body-m-heavy`                                                     | `--price-primary-default`        | baseline-aligned with amount                                                                                                                                                                                |
| Total ("Total €24")         | `.ts-body-m-normal`                                                    | `--text-grey`                    |                                                                                                                                                                                                             |
| Important information link  | `.ts-body-m-heavy`                                                     | `--link-brand-default`           | underline, thickness `--bw-xs`; hover `--link-brand-hover`                                                                                                                                                  |
| Select button               | `.ts-button-m-heavy`                                                   | `--button-text-primary`          | bg `--button-bg-primary`, border `--bw-xs` solid `--button-border-primary`, radius `--br-xs`, padding `--space-150` `--space-300`; hover/active use the `-hover`/`-active` tokens; margin-top `--space-150` |
| Focus ring (link, button)   | —                                                                      | `--border-focus`                 | `outline: --bw-s solid`, `outline-offset: --space-050`                                                                                                                                                      |

## 5. Content mapping (`src/assets/response.json`)

Fixture facts (checked with `jq`): 5 cars, 1 vendor (`321` NIZA), 1 location
(`203367` Malaga - Airport). Every car has exactly **one** rental rate, every
rate has `orderByRelevance: 0`, a cancellation **fee** (no free cancellation),
`fuelPolicy: "FULLFULL"`, limited mileage (200 km/day), three included
insurance items and `bundledInsurance: false`.

| Design element | Design text               | Source field(s)                                                           | Fixture example                                |
| -------------- | ------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------- |
| Car image      | —                         | `vehicle.imageUrl`                                                        | `.../toyota/yaris/primary.png`                 |
| Title          | Economy                   | `vehicle.description`                                                     | `SUV`, `Compact`, `Economy`                    |
| Vehicle name   | Fiat 500 or similar       | `vehicle.make` + `vehicle.model` (normalise "OR SIMILAR" casing)          | `Toyota Yaris or similar`, `BMW X5 or similar` |
| Seats          | 4 seats                   | `vehicle.passengerQuantity`                                               | `5 seats`                                      |
| Bags           | 1 bag                     | `vehicle.baggageQuantity` (plural)                                        | `6 bags`                                       |
| Doors          | 3 doors                   | `vehicle.doors` (plural)                                                  | `5 doors`                                      |
| Transmission   | Manual                    | `vehicle.transmission`                                                    | `Automatic`, `Manual`                          |
| Fuel policy    | Fuel policy: Full to full | `rate.fuelPolicy` (`FULLFULL` → "Full to full")                           | `Fuel policy: Full to full`                    |
| Mileage        | Mileage: Unlimited        | `rate.mileagePolicy` (see 5.3)                                            | `Mileage: 200 km/day`                          |
| Included Cover | Included Cover: Basic     | `rate.insuranceCoverage.included` + `rate.config.bundledInsurance`        | `Included Cover: Basic`                        |
| Badge          | Free Cancellation         | `rate.pricing.cancellationPolicy.fee`                                     | fee `€180.93` → fee badge                      |
| Vendor logo    | Hertz logo                | `vendors[car.vendorId].imageSVGUrl`, alt `vendors[..].name`               | `niza.svg`, alt "NIZA"                         |
| Rating chip    | 8.6                       | `locations[car.pickupLocationId].ratings.reviewScore`                     | `7.7`                                          |
| Rating label   | Very good                 | `locations[car.pickupLocationId].ratings.label`                           | `Good`                                         |
| Location name  | Lisbon airport (LIS)      | `locations[..].name` + ` (` + `airportCode` + `)`                         | `Malaga - Airport (AGP)`                       |
| Pickup type    | In terminal               | `locations[..].pickupType` (humanised)                                    | `Shuttle to counter and car`                   |
| Price per day  | €12/day                   | `rate.pricing.totalRentalCostRequested` ÷ rental days (**no days field**) | see 5.1                                        |
| Total          | Total €24                 | `rate.pricing.totalRentalCostRequested`                                   | `Total €132.34`                                |

Not shown in the design (not rendered): `vehicle.fuelType` (always
"Unspecified"), `vehicle.acrissCode`, `deposit`, `config.paymentType`,
`supportsDebitCard`, location address/phone.

### 5.1 Price

- No rental duration exists in the fixture. Per-day price needs a
  `rentalDays` input. With it: amount = total ÷ days, unit "/day", plus
  "Total €X". Without it: amount = total, unit text "total", no second line.
- Format with `Intl.NumberFormat` (`style: "currency"`, currency from the
  data, locale `en-IE`), 0 fraction digits for whole amounts (`€24`), 2
  otherwise (`€132.34`).
- The screenshots disagree (Small/Medium `€12/day · Total €24`; Large/XL
  `€24/day · Total €24`); Small/Medium are taken as correct (2-day rental).

### 5.2 Cancellation badge

- Free when the rate has a `cancellationPolicy` and its `fee` is missing or
  `0`. Shows "Free Cancellation" (positive style).
- Otherwise shows "Cancellation fee €180.93" (neutral style).
- No `cancellationPolicy` at all: no badge.

### 5.3 Mileage

- Unlimited when `mileagePolicy.description` matches `/unlimited/i` or
  `quantity` is missing or `"0"` → "Mileage: Unlimited".
- Otherwise "Mileage: {quantity} {distUnitName lower-case}/{vehiclePeriodUnitName
  lower-case}" → "Mileage: 200 km/day".
- No `mileagePolicy`: item hidden.

### 5.4 Rating chip colour

Score band → token: `>= 9` `--ratings-excellent`, `>= 8` `--ratings-very-good`,
`>= 7` `--ratings-good`, `>= 5` `--ratings-average`, else `--ratings-poor`.
The label text comes from the data, not from the band.

### 5.5 Included cover

`included` non-empty → "Included Cover: Basic" when `bundledInsurance` is
false, "Included Cover: Full" when true. Missing or empty `included` → item
hidden.

### 5.6 Formatting rules

- Pluralise with `Intl.PluralRules("en")`: `1 bag` / `2 bags`, `1 seat` /
  `5 seats`, `1 door` / `3 doors`.
- Fuel policy map: `FULLFULL` → "Full to full", `FULLEMPTY` → "Full to empty",
  `EMPTYEMPTY` → "Empty to empty", `SAMESAME` → "Same to same"; unknown →
  raw value.
- Pickup type: `InTerminal` → "In terminal", otherwise split PascalCase into
  sentence case (`ShuttleToCounterAndCar` → "Shuttle to counter and car").

## 6. Icons

No icon set is specified and no icon dependency may be added. Use inline SVG
React components, 24x24 viewBox, `fill="currentColor"`, `aria-hidden="true"`,
`focusable="false"`: person (seats), suitcase (bags), car door (doors), gear
shift (transmission), fuel pump (fuel policy), speedometer (mileage), shield
(included cover), car silhouette (missing-image placeholder).

## 7. States

- Hover/focus: only the link and the Select button are interactive. Focus ring
  per section 4. The card itself has no hover state in the screenshots.
- Loading / empty / error are not in the design; see the plan for the
  proposed Car List states (built from the same tokens).

## Assumptions

Every value below is a guess made because Figma could not be read and
`design-questions.md` is unanswered. Each maps to a question number there.

| #   | Q     | Assumption                                                                                                                                                      | Token / value chosen                                                                 | Why                                                                                                                                                                                                      |
| --- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | 1     | Small < 608, Medium 608–839, Large 840–1024, XL >= 1025; no change at 1328                                                                                      | breakpoints 608 / 840 / 1025                                                         | Matches the design-system breakpoints and the proposal in the questions file                                                                                                                             |
| A2  | 1     | Car List is always one column; gap between cards                                                                                                                | `--space-200`                                                                        | The overview stacks cards vertically; cards are full-width result rows                                                                                                                                   |
| A3  | 2     | Card radius                                                                                                                                                     | `--br-s`                                                                             | Confirmed by the human from Figma ("Corner radius/radius-s")                                                                                                                                             |
| A4  | 2     | Card border and shadow                                                                                                                                          | `--bw-xs` `--border-subtle`, no shadow                                               | Border is still a guess; shadow removed: the human confirmed Figma has none                                                                                                                              |
| A5  | 2     | Card background                                                                                                                                                 | `--container-default`                                                                | Human's Figma uses `var(--container-default, #FFFFFF)`                                                                                                                                                   |
| A6  | 2     | Content padding Small `--space-150`, Medium+ `--space-200`                                                                                                      | `--space-150`, `--space-200`                                                         | ~11px measured at Small, ~14–15px at other sizes                                                                                                                                                         |
| A7  | 3     | Media background                                                                                                                                                | `--container-alt`                                                                    | rgb(242,242,242) sampled from screenshots                                                                                                                                                                |
| A8  | 3     | Media height Small `--space-1400`, Medium `calc(--space-1400 + --space-200)`; Large/XL column fills height                                                      | 112px / 128px                                                                        | ~107px and ~133px measured; nearest token combinations                                                                                                                                                   |
| A9  | 3     | Image column Large 1/3, XL 2/5 of card width                                                                                                                    | `1fr 2fr`, `2fr 3fr`                                                                 | ~205/625 and ~304/778 measured                                                                                                                                                                           |
| A10 | 3     | Image `object-fit: contain`, inset `--space-100` (stacked) / `--space-200` (side)                                                                               | `--space-100`, `--space-200`                                                         | Car is fully visible with margin in all sizes                                                                                                                                                            |
| A11 | 3     | Divider between image and content at Large/XL                                                                                                                   | `--bw-xs` `--border-subtle`                                                          | A thin light line is visible at the column edge                                                                                                                                                          |
| A12 | 4     | Free cancellation badge colours                                                                                                                                 | `--bg-fill-positive-subtle`, `--text-positive`                                       | Visual match; semantic "positive"                                                                                                                                                                        |
| A13 | 4     | Badge typography, padding, radius                                                                                                                               | `.ts-body-s-medium`, `--space-050`/`--space-100`, `--br-xxs`                         | Small text, tight pill with small radius                                                                                                                                                                 |
| A14 | 4     | When there is a fee, show a neutral "Cancellation fee €X" badge                                                                                                 | `--bg-fill-neutral-subtle`, `--text-subtle`                                          | Every fixture rate has a fee; hiding the badge would hide the policy                                                                                                                                     |
| A15 | 5     | Title / subtitle typography; no gap between them                                                                                                                | `.ts-subtitle-s-heavy` `--text-default`; `.ts-body-m-normal` `--text-grey`           | Measured ~16px (Small) to ~20px (Large) for the title; one class for all sizes (see A27)                                                                                                                 |
| A16 | 5     | Title = `vehicle.description`, subtitle = `make + model` with "or similar" lower-cased                                                                          | —                                                                                    | Matches "Economy" / "Fiat 500 or similar"; fixture mixes "OR SIMILAR" and "or similar"                                                                                                                   |
| A17 | 6     | Vendor box: border, radius, padding                                                                                                                             | `--bw-xs` `--border-subtle`, `--br-xxs`, `--space-050`                               | Thin grey outline with small radius                                                                                                                                                                      |
| A18 | 6     | Rating chip colour by score band; label text from data                                                                                                          | `--ratings-*`, `--text-inverse`                                                      | 8.6 "Very good" in the design matches `--ratings-very-good`                                                                                                                                              |
| A19 | 6     | Rating source = pickup location `ratings` (no vendor rating in the data)                                                                                        | —                                                                                    | Only rating in the fixture                                                                                                                                                                               |
| A20 | 7     | Feature typography and colour                                                                                                                                   | `.ts-body-m-normal`, `--text-subtle`                                                 | ~14px measured at Small/Medium; dark grey text                                                                                                                                                           |
| A21 | 7     | Feature spacing: icon↔text `--space-050`, column gap `--space-150`, row gap `--space-050`; icon `--space-200`                                                   | as listed                                                                            | Measured ~6px / ~7–13px / ~4px; 16px icons                                                                                                                                                               |
| A22 | 7     | Per-size feature visibility as in section 2; render real mileage instead of the "4 seats" typo                                                                  | —                                                                                    | Instruction from the human                                                                                                                                                                               |
| A23 | 8     | Location name / pickup type                                                                                                                                     | `.ts-body-m-medium` `--text-brand-primary`; `.ts-body-s-normal` `--text-grey`        | Green semi-bold, small grey                                                                                                                                                                              |
| A24 | 9     | Price typography                                                                                                                                                | `.ts-headline-xs-heavy`, `.ts-body-m-heavy`, total `.ts-body-m-normal` `--text-grey` | ~24px measured at Small; 28px at Large/XL (see A27)                                                                                                                                                      |
| A25 | 9     | Per-day = total ÷ `rentalDays` input; without it show the total only                                                                                            | —                                                                                    | No duration in the data                                                                                                                                                                                  |
| A26 | 10    | Select button: primary variant, `.ts-button-m-heavy`, `--br-xs`, padding `--space-150` `--space-300`; link `--link-brand-default` underlined `.ts-body-m-heavy` | as listed                                                                            | Mint button with dark text; green underlined link                                                                                                                                                        |
| A27 | 9/5/7 | Typography is the same at every size, except the title: Body-L on Small, Subtitle-S on Medium, Subtitle-M on Large/XL (confirmed from Figma)                    | one `.ts-*` class per element                                                        | Large/XL text looks ~1 step bigger (title 20px, price 28px, features 16px), but `.ts-*` classes cannot switch inside media queries without hard-coded font sizes or JS breakpoints (rejected in the ADR) |
| A28 | 10    | Select and Important information are hidden below 840px (`display: none`)                                                                                       | —                                                                                    | Follows the design; see plan open question on mobile selection                                                                                                                                           |
| A29 | 11    | Price group bottom-right in every size                                                                                                                          | aside `justify-content: space-between`                                               | Consistent across all screenshots                                                                                                                                                                        |
| A30 | 12    | No hover state on the card; focus ring on link/button                                                                                                           | `--border-focus`, `--bw-s`                                                           | Same pattern as `Counter.css`                                                                                                                                                                            |
