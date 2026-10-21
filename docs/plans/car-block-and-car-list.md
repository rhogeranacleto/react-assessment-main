# Plan: Car Block and Car List

```
Status: APPROVED by rhoger.anacleto on 2026-10-21 (revision 1)
Revision: 1
```

Approval note: approved with all default decisions (1–10) as written; visual
details will be revisited in the QA phase.

Structure change (requested by rhoger.anacleto on 2026-10-21, after
implementation): components are reorganized into feature folders
(`src/components/CarList/`, `src/components/CarBlock/` with sub-features
`Badge/ Features/ Location/ Media/ Price/ Vendor/ Icons/` directly under it,
and `money.ts` / `carRental.ts` moved into `CarBlock/`). The file paths in the
sections below describe the original flat layout; the conventions in
`CLAUDE.md` / `AGENTS.md` ("Feature folders") now take precedence.

- ADR: `docs/adr/0001-car-block-and-car-list-components.md`
- Design spec: `docs/design/car-block-and-car-list/spec.md` (**manually derived
  from screenshots, not from Figma**; Figma returned 403 "File not exportable")
- Unanswered design questions: `docs/design/design-questions.md`

## 1. Goal and scope

Build `CarBlock` (one car result card) and `CarList` (a `<ul>` of Car Blocks
for every car in the fixture) as small, typed, presentational components,
styled only with `src/design-system.css` tokens and `.ts-*` classes, responsive
across four card sizes (Small / Medium / Large / XL) mapped onto the
design-system breakpoints mobile-first. Includes: a shared types file, a typed
fixture module, pure formatting/selection helpers, inline SVG icons (no new
dependency), stories and colocated tests, replacing the `Counter` scaffolding in
`App.tsx`, and keeping `AGENTS.md` in sync with `CLAUDE.md`.

Out of scope: data fetching, filtering/sorting UI, the "Important information"
content (only a link/callback), rental-date search, i18n beyond English, any
change to `design-system.css`, the fixture, tooling config or dependencies.

All styling values live in `CarBlock.css` / `CarList.css` behind
component-scoped custom properties so the human can fine-tune against Figma
without touching TSX.

## 2. Acceptance criteria

From the ADR (verbatim):

- [ ] **Car Block** component matches the design.
- [ ] **Car List** component renders the full set of cars from the fixture.
- [ ] Both are **responsive** (mobile → tablet → desktop).
- [ ] Styling uses the **design system** tokens and classes from
      `design-system.css`, with no ad-hoc values.
- [ ] **Storybook stories** exist for each component (happy path and
      interesting edge cases).
- [ ] **Unit tests** (Vitest + Testing Library) are colocated with each
      component.
- [ ] **`AGENTS.md`** with instructions for AI agents is present at the repo
      root and committed.
- [ ] `npm run lint` passes cleanly.
- [ ] `npm test` passes cleanly.
- [ ] `npm run build` passes.

Task-specific:

- [ ] Four sizes render per spec section 1–2 at viewports 375 / 700 / 900 /
      1280px (Small / Medium / Large / XL).
- [ ] Mileage slot shows the real mileage policy at every size (not the
      "4 seats" design typo).
- [ ] Rate shown = lowest `config.orderByRelevance`; ties keep array order;
      cars without rates render without crashing.
- [ ] Money formatted only through `Intl.NumberFormat` in `src/lib/money.ts`.
- [ ] `npm run format:check` passes.
- [ ] `Counter.*` removed; `App.tsx` renders `CarList` from the typed fixture.

## 3. Design details

Build from `docs/design/car-block-and-car-list/spec.md`. Summary of what the
implementer needs; the spec wins on any detail not repeated here.

### 3.1 Breakpoints and size mapping

| Size   | Viewport   | Query (mobile-first)                                          |
| ------ | ---------- | ------------------------------------------------------------- |
| Small  | `< 608`    | base styles                                                   |
| Medium | `608–839`  | `@media (min-width: 608px) /* --breakpoint-mobile */`         |
| Large  | `840–1024` | `@media (min-width: 840px) /* --breakpoint-tablet */`         |
| XL     | `>= 1025`  | `@media (min-width: 1025px) /* --breakpoint-desktop-small */` |

No change at 1328px (`--breakpoint-desktop-large`).

### 3.2 Layout per size

| Element             | Small                                                                                | Medium                                              | Large                                                                | XL                                  |
| ------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| `.car-block`        | flex column                                                                          | flex column                                         | grid, columns `minmax(0,1fr) minmax(0,2fr)`                          | grid, `minmax(0,2fr) minmax(0,3fr)` |
| media               | height `--space-1400`, fill width                                                    | height `calc(var(--space-1400) + var(--space-200))` | full height, divider `--bw-xs` solid `--border-subtle` on inline-end | same as Large                       |
| media inset         | `--space-100`                                                                        | `--space-100`                                       | `--space-200`                                                        | `--space-200`                       |
| content padding     | `--space-150`                                                                        | `--space-200`                                       | `--space-200`                                                        | `--space-200`                       |
| content gap         | `--space-150`                                                                        | `--space-150`                                       | `--space-150`                                                        | `--space-150`                       |
| body (main ↔ aside) | row, gap `--space-200`                                                               | same                                                | same                                                                 | same                                |
| main gap            | `--space-100`                                                                        | `--space-100`                                       | `--space-150`                                                        | `--space-150`                       |
| aside               | column, `align-items: flex-end`, `justify-content: space-between`, `text-align: end` | same                                                | same                                                                 | same                                |
| fuel policy item    | hidden                                                                               | shown                                               | shown                                                                | shown                               |
| included cover item | hidden                                                                               | hidden                                              | shown                                                                | shown                               |
| Important info link | hidden                                                                               | hidden                                              | shown, margin-top `--space-100` (total `--space-200` after location) | shown                               |
| Select button       | hidden                                                                               | hidden                                              | shown, margin-top `--space-150`                                      | shown                               |

Hidden = `display: none` from CSS; elements are always rendered in the DOM.
Tweakable values are declared once as custom properties at the top of
`.car-block` and overridden inside each media query, e.g.:

```css
.car-block {
  --car-block-media-height: var(--space-1400);
  --car-block-media-inset: var(--space-100);
  --car-block-padding: var(--space-150);
  --car-block-main-gap: var(--space-100);
  /* ... */
}
```

### 3.3 Tokens per element

| Element                                | Class                   | Colour                                             | Background / border / radius / spacing                                                                                                                                                                                       |
| -------------------------------------- | ----------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card `article`                         | —                       | —                                                  | bg `--container-default`; border `--bw-xs` solid `--border-subtle`; radius `--br-xs`; shadow `--e-light-s`; `overflow: hidden`                                                                                               |
| Media                                  | —                       | —                                                  | bg `--container-alt`; image `object-fit: contain`                                                                                                                                                                            |
| Missing-image placeholder              | —                       | `--text-disabled`                                  | icon size `--space-600`, centred                                                                                                                                                                                             |
| Badge (free)                           | `.ts-body-s-medium`     | `--text-positive`                                  | bg `--bg-fill-positive-subtle`; radius `--br-xxs`; padding `--space-050` `--space-100`; `align-self: flex-start`                                                                                                             |
| Badge (fee)                            | `.ts-body-s-medium`     | `--text-subtle`                                    | bg `--bg-fill-neutral-subtle`; same shape                                                                                                                                                                                    |
| Title `h3`                             | `.ts-subtitle-s-heavy`  | `--text-default`                                   | margin `--space-none`                                                                                                                                                                                                        |
| Vehicle name `p`                       | `.ts-body-m-normal`     | `--text-grey`                                      | margin `--space-none`                                                                                                                                                                                                        |
| Features `ul`                          | `.ts-body-m-normal`     | `--text-subtle`                                    | flex wrap; column gap `--space-150`; row gap `--space-050`; list reset                                                                                                                                                       |
| Feature icon                           | —                       | `currentColor`                                     | `--space-200` square; gap to text `--space-050`                                                                                                                                                                              |
| Location name                          | `.ts-body-m-medium`     | `--text-brand-primary`                             | —                                                                                                                                                                                                                            |
| Pickup type                            | `.ts-body-s-normal`     | `--text-grey`                                      | —                                                                                                                                                                                                                            |
| Vendor box                             | —                       | —                                                  | bg `--container-default`; border `--bw-xs` solid `--border-subtle`; radius `--br-xxs`; padding `--space-050`; gap `--space-100`                                                                                              |
| Vendor logo `img`                      | —                       | —                                                  | height `--space-250`; width auto                                                                                                                                                                                             |
| Vendor name fallback                   | `.ts-body-s-heavy`      | `--text-default`                                   | shown only when no logo URL                                                                                                                                                                                                  |
| Rating chip                            | `.ts-body-m-medium`     | `--text-inverse`                                   | bg from score band (3.5); radius `--br-xxs`; padding `--space-none` `--space-050`                                                                                                                                            |
| Rating label                           | `.ts-body-s-heavy`      | `--text-default`                                   | margin-top `--space-050`                                                                                                                                                                                                     |
| Price amount                           | `.ts-headline-xs-heavy` | `--price-primary-default`                          | —                                                                                                                                                                                                                            |
| Price unit                             | `.ts-body-m-heavy`      | `--price-primary-default`                          | baseline aligned                                                                                                                                                                                                             |
| Total                                  | `.ts-body-m-normal`     | `--text-grey`                                      | —                                                                                                                                                                                                                            |
| Important info (button styled as link) | `.ts-body-m-heavy`      | `--link-brand-default`; hover `--link-brand-hover` | underline, `text-decoration-thickness: var(--bw-xs)`; reset button bg/border/padding to `--bg-fill-transparent` / `--bw-none` / `--space-none`                                                                               |
| Select button                          | `.ts-button-m-heavy`    | `--button-text-primary`                            | bg `--button-bg-primary`; border `--bw-xs` solid `--button-border-primary`; radius `--br-xs`; padding `--space-100` `--space-300`; hover/active `--button-bg-primary-hover/-active`, `--button-border-primary-hover/-active` |
| Focus (link, button)                   | —                       | —                                                  | `outline: var(--bw-s) solid var(--border-focus)`; `outline-offset: var(--space-050)`                                                                                                                                         |
| CarList `ul`                           | —                       | —                                                  | list reset; flex column; gap `--space-200`                                                                                                                                                                                   |
| CarList status / empty                 | `.ts-body-m-normal`     | `--text-grey`                                      | padding `--space-200`; bg `--container-subtle`; radius `--br-xs`                                                                                                                                                             |
| CarList error                          | `.ts-body-m-medium`     | `--text-negative`                                  | bg `--bg-fill-negative-subtle`; border `--bw-xs` solid `--border-negative`; radius `--br-xs`; padding `--space-200`                                                                                                          |
| CarList skeleton card                  | —                       | —                                                  | bg `--container-alt`; radius `--br-xs`; height `--space-1400`                                                                                                                                                                |

### 3.4 Content mapping

| Element              | Source                                                            | Rule / formatter (`src/lib/carRental.ts` unless noted)                                             |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Image                | `vehicle.imageUrl`                                                | `alt` = vehicle name; `loading="lazy"`; on missing URL or `onError` → placeholder                  |
| Title                | `vehicle.description`                                             | fallback `vehicle.style`                                                                           |
| Vehicle name         | `vehicle.make`, `vehicle.model`                                   | `formatVehicleName`: `"${make} ${model}"`, `/\bor similar\b/i` → "or similar"                      |
| Seats / bags / doors | `passengerQuantity`, `baggageQuantity`, `doors`                   | `formatCount(n, "seat", "seats")` via `Intl.PluralRules("en")`                                     |
| Transmission         | `vehicle.transmission`                                            | as-is                                                                                              |
| Fuel policy          | `rate.fuelPolicy`                                                 | `formatFuelPolicy` → "Fuel policy: Full to full"; unknown → raw                                    |
| Mileage              | `rate.mileagePolicy`                                              | `formatMileage` → "Mileage: Unlimited" or "Mileage: 200 km/day"; missing → hidden                  |
| Included cover       | `rate.insuranceCoverage.included`, `rate.config.bundledInsurance` | `getIncludedCoverLabel` → "Basic" / "Full" / `undefined` (hidden)                                  |
| Badge                | `rate.pricing.cancellationPolicy`                                 | `getCancellation` → `{ kind: "free" } \| { kind: "fee", fee: Money } \| undefined`                 |
| Vendor logo          | `vendors[String(car.vendorId)]`                                   | `imageSVGUrl` (the `imageUrl` is a PDF), `alt` = `vendor.name`                                     |
| Rating               | `locations[String(car.pickupLocationId)].ratings`                 | chip = `reviewScore`, label = `label`, colour `getRatingTone(score)`                               |
| Location             | `locations[..].name`, `airportCode`, `pickupType`                 | `formatLocationName` → "Malaga - Airport (AGP)"; `formatPickupType` → "Shuttle to counter and car" |
| Price                | `rate.pricing.totalRentalCostRequested`, `rentalDays` prop        | `src/lib/money.ts` (3.6)                                                                           |

### 3.5 Rating tone

`getRatingTone(score: number): RatingTone` with
`type RatingTone = "excellent" | "very-good" | "good" | "average" | "poor"`;
bands `>= 9`, `>= 8`, `>= 7`, `>= 5`, else. CSS:
`.car-block__rating-chip[data-tone="good"] { background: var(--ratings-good); }`
etc. Fixture 7.7 → `good`.

### 3.6 Money

`src/lib/money.ts` is the only place that turns `Money.amount` into a number.

- `formatMoney(money: Money, locale = "en-IE"): string` —
  `Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: f, maximumFractionDigits: f })`
  where `f = Number.isInteger(value) ? 0 : 2` (`€24`, `€132.34`). Do not use
  `trailingZeroDisplay`: `tsconfig.app.json` targets `lib: ES2022`.
- `divideMoney(money: Money, divisor: number): Money` — returns
  `{ amount: (value / divisor).toFixed(2), currency }`; throws `RangeError` on
  `divisor <= 0`.
- `isZeroMoney(money: Money): boolean`.

Price rendering:

| `rentalDays` | Amount                                                   | Unit                                       | Second line |
| ------------ | -------------------------------------------------------- | ------------------------------------------ | ----------- |
| set (>= 1)   | total ÷ days                                             | `/day` (`aria-hidden`) + sr-only "per day" | `Total €X`  |
| not set      | total                                                    | ` total`                                   | none        |
| no rate      | "Price unavailable" (`.ts-body-m-normal`, `--text-grey`) | —                                          | —           |

### 3.7 Token gaps

| Need                       | Gap                                                | Decision                                                                                                             |
| -------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Medium media height ~133px | no space token near 128–136px                      | `calc(var(--space-1400) + var(--space-200))` = 128px                                                                 |
| Image column widths        | not a token category                               | unitless `fr` ratios (`1fr 2fr`, `2fr 3fr`)                                                                          |
| Larger typography at L/XL  | `.ts-*` classes cannot change inside media queries | one class per element at all sizes (spec A27); open question Q7                                                      |
| `@media` widths            | `var()` not allowed in media conditions            | literal 608 / 840 / 1025px with a comment naming the token                                                           |
| Visually hidden text       | no utility in the design system                    | local `.car-block__sr-only` (standard clip pattern; `width/height: var(--bw-xs)`, `margin: calc(var(--bw-xs) * -1)`) |

## 4. Architecture

### 4.1 Files

```
src/
  types/carRental.ts            # shared types (no runtime code)
  data/searchResponse.ts        # typed fixture: `export const searchResponse: SearchResponse = response;`
  lib/money.ts                  # + money.test.ts
  lib/carRental.ts              # selectRate + formatters; + carRental.test.ts
  components/
    icons/CarIcons.tsx          # inline SVG icon components; + CarIcons.test.tsx (smoke)
    CarBlock.tsx  CarBlock.css  CarBlock.test.tsx  CarBlock.stories.tsx
    CarBlockMedia.tsx           # + CarBlockMedia.test.tsx
    CarBlockBadge.tsx           # + CarBlockBadge.test.tsx
    CarBlockVendor.tsx          # + CarBlockVendor.test.tsx
    CarBlockFeatures.tsx        # + CarBlockFeatures.test.tsx
    CarBlockLocation.tsx        # + CarBlockLocation.test.tsx
    CarBlockPrice.tsx           # + CarBlockPrice.test.tsx
    CarList.tsx   CarList.css   CarList.test.tsx   CarList.stories.tsx
  App.tsx                       # renders <CarList> from searchResponse
deleted: src/components/Counter.{tsx,css,test.tsx,stories.tsx}
```

All `CarBlock*` sub-components are styled by `CarBlock.css` (BEM
`car-block__*`), so every visual decision for the card is in one file. Only
`CarBlock.tsx` imports `./CarBlock.css`. Sub-components are internal parts of
the card, so they have tests but no stories.

### 4.2 Types (`src/types/carRental.ts`)

Use `string` (not literal unions) for enum-like JSON fields so the inferred
JSON type stays assignable; document known values in JSDoc.

```ts
export type Money = { amount: string; currency: string };

export type Vehicle = {
  style: string;
  description: string;
  make: string;
  model: string;
  imageUrl?: string;
  acrissCode: string;
  doors: number;
  baggageQuantity: number;
  passengerQuantity: number;
  transmission: string;
  fuelType: string;
  commitment: string;
};

export type CancellationPolicy = {
  fee?: Money;
  applicability: string;
  unitType: string;
  quantity: string;
  limitTimestamp: string;
};

export type Pricing = {
  totalRentalCostRequested: Money;
  cancellationPolicy?: CancellationPolicy;
};

export type Deposit = { amount: Money; minAmount: string; maxAmount: string };

export type MileagePolicy = {
  description: string;
  taxInclusive: boolean;
  includedInRate: boolean;
  distUnitName?: string;
  quantity?: string;
  vehiclePeriodUnitName?: string;
  additionalDistance?: Money & { applicability: string };
};

export type RateConfig = {
  orderByRelevance: number;
  insuranceAvailable: boolean;
  bundledInsurance: boolean;
  supportsDebitCard: boolean;
  paymentType: string;
};

export type InsuranceItem = {
  description: string;
  taxInclusive: boolean;
  includedInRate: boolean;
  deductible?: { requestCurrency: Money };
};

export type InsuranceCoverage = { included: InsuranceItem[] };

export type RentalRate = {
  carId: string;
  pricing: Pricing;
  deposit?: Deposit;
  fuelPolicy?: string;
  mileagePolicy?: MileagePolicy;
  config: RateConfig;
  insuranceCoverage?: InsuranceCoverage;
};

export type Car = {
  id: string;
  vendorId: number;
  pickupLocationId: number;
  dropOffLocationId: number;
  vehicle: Vehicle;
  rentalRates: RentalRate[];
};

export type Vendor = {
  name: string;
  imageUrl?: string;
  imageSVGUrl?: string;
  imageName?: string;
  flightDetailsRequired: boolean;
};

export type LocationRatings = { label: string; reviewScore: string };

export type Location = {
  name: string;
  atAirport: boolean;
  atTrainStation: boolean;
  latitude: string;
  longitude: string;
  addressLine: string;
  countryCode: string;
  phoneNumber: string;
  timezone: string;
  ratings?: LocationRatings;
  pickupType: string;
  airportCode?: string;
};

export type SearchResponse = {
  productType: string;
  searchId: string;
  responseTime: string;
  cars: Car[];
  vendors: Record<string, Vendor>;
  locations: Record<string, Location>;
};

export type CancellationInfo = { kind: "free" } | { kind: "fee"; fee: Money };

export type RatingTone =
  "excellent" | "very-good" | "good" | "average" | "poor";
```

(Prettier will reflow these; the field list is what matters.)

### 4.3 Helpers (`src/lib/carRental.ts`)

```ts
export function selectRate(
  rates: readonly RentalRate[],
): RentalRate | undefined;
export function getCancellation(rate: RentalRate): CancellationInfo | undefined;
export function formatVehicleName(vehicle: Vehicle): string;
export function formatCount(
  count: number,
  singular: string,
  plural: string,
): string;
export function formatFuelPolicy(policy: string): string;
export function formatMileage(policy: MileagePolicy): string;
export function getIncludedCoverLabel(rate: RentalRate): string | undefined;
export function getRatingTone(score: number): RatingTone;
export function formatLocationName(location: Location): string;
export function formatPickupType(pickupType: string): string;
```

**Rate selection (verified against the fixture):** every car has exactly one
rate and every `orderByRelevance` is `0`, so the fixture cannot distinguish
rules. `selectRate` returns the rate with the lowest `orderByRelevance`;
on ties the earliest in the array wins (use a single `reduce` with strict `<`);
empty array → `undefined`. Tests use synthetic multi-rate cars derived from
the fixture. `CarList` keeps fixture order (no sorting).

### 4.4 Components and props

```ts
// CarBlock.tsx
type CarBlockProps = {
  /** Car to render; the best rate is chosen with `selectRate`. */
  car: Car;
  /** Supplier of the car (logo, name). Omit to hide the vendor box. */
  vendor?: Vendor;
  /** Pickup location (name, pickup type, rating). Omit to hide those parts. */
  pickupLocation?: Location;
  /** Rental length in days. When set, the price shows per day plus total. */
  rentalDays?: number;
  /** Heading level for the category title. Defaults to 3. */
  headingLevel?: 2 | 3 | 4;
  /** Called by the Select button (Large/XL). Button is not rendered without it or without a rate. */
  onSelect?: (car: Car, rate: RentalRate) => void;
  /** Called by the Important information link (Large/XL). Not rendered without it. */
  onImportantInfo?: (car: Car) => void;
};
export function CarBlock(props: CarBlockProps); // + default export; return type inferred
```

Markup: `<article className="car-block" aria-labelledby={`${titleId} ${nameId}`}>`
(ids from `useId`) → `CarBlockMedia`, then `.car-block__content` → `CarBlockBadge`,
`.car-block__body` → `.car-block__main` (heading `h{level}#titleId`,
`p#nameId`, `CarBlockFeatures`, `CarBlockLocation`, Important info button) and
`.car-block__aside` (`CarBlockVendor`, `CarBlockPrice`, Select button with
`aria-label` "Select {vehicle name}").

```ts
type CarBlockMediaProps = {
  /** Image URL. */ src?: string;
  /** Alt text. */ alt: string;
};
// <img loading="lazy" decoding="async">; useState flag on onError → placeholder <CarIcon aria-hidden> + sr-only "No image available"

type CarBlockBadgeProps = {
  /** Cancellation info; nothing renders when undefined. */ cancellation?: CancellationInfo;
};

type CarBlockVendorProps = { vendor?: Vendor; ratings?: LocationRatings };
// renders nothing when both are undefined; chip has aria-label "Rating 7.7 out of 10"

type CarBlockFeaturesProps = { vehicle: Vehicle; rate?: RentalRate };
// <ul className="car-block__features ts-body-m-normal"> with <li> per item; modifier classes
// `car-block__feature--fuel` and `car-block__feature--cover` drive per-size visibility

type CarBlockLocationProps = { location: Location };

type CarBlockPriceProps = { total?: Money; rentalDays?: number };
```

```ts
// CarList.tsx
type CarListStatus = "ready" | "loading" | "error";
type CarListProps = {
  /** Cars to render, in order. */
  cars: Car[];
  /** Vendors keyed by id (as in the response). */
  vendors?: Record<string, Vendor>;
  /** Locations keyed by id (as in the response). */
  locations?: Record<string, Location>;
  /** Forwarded to every CarBlock. */
  rentalDays?: number;
  /** Defaults to "ready". */
  status?: CarListStatus;
  /** Shown with status "error". Defaults to "We couldn't load cars. Please try again." */
  errorMessage?: string;
  /** Shown when ready and `cars` is empty. Defaults to "No cars match your search." */
  emptyMessage?: string;
  /** Accessible name of the list. Defaults to "Car hire results". */
  label?: string;
  onSelect?: (car: Car, rate: RentalRate) => void;
  onImportantInfo?: (car: Car) => void;
};
```

- ready + cars: `<ul className="car-list" aria-label={label}>` → `<li key={car.id}>`
  → `<CarBlock headingLevel={3} vendor={vendors?.[String(car.vendorId)]} pickupLocation={locations?.[String(car.pickupLocationId)]} … />`.
- ready + empty: `<p className="car-list__message ts-body-m-normal" role="status">`.
- loading: wrapper `aria-busy="true"` with `<p role="status">Loading cars…</p>` plus 3
  `aria-hidden` skeleton `<div className="car-list__skeleton">`.
- error: `<p className="car-list__error ts-body-m-medium" role="alert">`.

`CarListStatus` is declared in `CarList.tsx` but not exported (only components
are exported from component files); stories use `CarListProps["status"]` via
`ComponentProps<typeof CarList>` if needed.

### 4.5 Icons (`src/components/icons/CarIcons.tsx`)

Named exports only, each a component: `SeatIcon`, `BagIcon`, `DoorIcon`,
`TransmissionIcon`, `FuelIcon`, `MileageIcon`, `ShieldIcon`, `CarIcon`.
Shared props `{ className?: string }`; each renders
`<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">`.
Paths: hand-authored or adapted from Material Symbols (Apache-2.0; add a
one-line licence comment at the top of the file). Size is set in CSS
(`.car-block__feature-icon { inline-size: var(--space-200); block-size: var(--space-200); }`).

### 4.6 Data flow

`App.tsx` → `searchResponse` (typed fixture) → `<CarList cars vendors locations />`
→ per car: lookup vendor/location → `<CarBlock>` → `selectRate(car.rentalRates)`
→ sub-components receive plain values. Components never import the JSON;
stories/tests import `@/data/searchResponse`.

## 5. Implementation steps

- [x] **1. Types and typed fixture** — `src/types/carRental.ts`,
      `src/data/searchResponse.ts`. Verify: `npx tsc -b` passes (proves the
      fixture conforms to `SearchResponse`).
- [x] **2. Money helpers** — `src/lib/money.ts` + `money.test.ts`. Verify:
      `npm test -- src/lib/money.test.ts` (`€24`, `€132.34`, `€66.17` for
      132.34 ÷ 2, zero detection, `RangeError` on 0 days).
- [x] **3. Car rental helpers** — `src/lib/carRental.ts` + `carRental.test.ts`.
      Verify: `npm test -- src/lib/carRental.test.ts` (cases in section 6.1).
- [x] **4. Icons** — `src/components/icons/CarIcons.tsx` + smoke test (each
      icon renders an `svg` with `aria-hidden="true"`). Verify: test passes,
      `npm run lint` clean.
- [x] **5. Sub-components + tests** — `CarBlockMedia`, `CarBlockBadge`,
      `CarBlockVendor`, `CarBlockFeatures`, `CarBlockLocation`,
      `CarBlockPrice` with their tests (6.2). Verify: `npm test -- CarBlock`.
- [x] **6. CarBlock + CSS + tests** — `CarBlock.tsx`, `CarBlock.css` (Small
      base styles only first), `CarBlock.test.tsx` (6.3). Verify: tests pass;
      grep the CSS for hard-coded values:
      `grep -nE '#[0-9a-fA-F]{3,6}|rgb|[0-9]+px|[0-9.]+rem' src/components/CarBlock.css`
      must only match the `@media` lines.
- [x] **7. CarBlock stories** — `CarBlock.stories.tsx` (section 7). Verify:
      `npm run build-storybook` succeeds.
- [x] **8. CarList + CSS + tests + stories** — `CarList.tsx`, `CarList.css`,
      `CarList.test.tsx`, `CarList.stories.tsx`. Verify: `npm test -- CarList`,
      `npm run build-storybook`.
- [ ] **9. Responsive pass** — add Medium / Large / XL media queries to
      `CarBlock.css` per 3.2, overriding only custom properties and layout.
      Verify in Storybook at 375 / 700 / 900 / 1280px against the four PNGs;
      note differences for the human.
- [ ] **10. Accessibility pass** — keyboard through the list (Tab reaches
      Important information then Select per card at >= 840px), visible focus
      ring, `alt` text, `aria-labelledby` names are unique ("Economy, Toyota
      Yaris or similar" vs "Economy, Opel Corsa or similar"), headings h1 → h2
      → h3 in `App`. Verify: tests in 6.3/6.4 plus a manual Tab check.
- [x] **11. Cleanup** — delete `src/components/Counter.*`; `App.tsx` renders
      `<h1>Car hire</h1>`, an `<h2>` "Available cars" (or `CarList` label) and
      `<CarList cars={…} vendors={…} locations={…} />` from `searchResponse`.
      Verify: `npm run dev` shows 5 cards; `grep -r Counter src` is empty.
- [x] **12. AGENTS.md / CLAUDE.md** — both already exist. Update the File map
      in **both** (types, data, lib, icons, CarBlock*/CarList files; note that
      `docs/design/car-block-and-car-list/spec.md` is manual and the Counter
      example is gone, so the pattern reference becomes `CarBlock.*`). Keep the
      only intended differences (title line, intro line, the CLAUDE-only
      "Keep it in sync" and approval-gate sentence). Verify:
      `diff AGENTS.md CLAUDE.md` shows only those lines.
- [ ] **13. Final checks** — `npm run format`, then `npm run lint`,
      `npm test`, `npm run build`, `npm run format:check`,
      `npm run build-storybook`. All clean. (See Q10: the ADR currently fails
      `format:check`.)

## 6. Test plan

Fixture slices come from `@/data/searchResponse`; derived edge-case objects are
built with spreads in the test file (never mutate or edit the fixture).
`describe/it/expect` imported from `vitest`; queries by role/text first.

### 6.1 `src/lib/*.test.ts`

- `selectRate`: single rate → that rate; three rates with relevance `[2, 0, 1]`
  → the `0` one; tie `[0, 0]` → first; `[]` → `undefined`.
- `getCancellation`: fixture rate → `{ kind: "fee", fee: { amount: "180.93", … } }`;
  fee `"0.00"` → `free`; fee removed → `free`; no `cancellationPolicy` → `undefined`.
- `formatVehicleName`: BMW → "BMW X5 or similar"; Toyota → "Toyota Yaris or similar".
- `formatCount`: `1 bag`, `2 bags`, `5 seats`, `1 seat`.
- `formatFuelPolicy("FULLFULL")` → "Fuel policy: Full to full"; unknown → raw.
- `formatMileage`: fixture → "Mileage: 200 km/day"; `{ description: "Unlimited mileage" }` → "Mileage: Unlimited".
- `getIncludedCoverLabel`: fixture → "Basic"; `bundledInsurance: true` → "Full"; no coverage / empty → `undefined`.
- `getRatingTone`: 9.2 / 8.6 / 7.7 / 6 / 3 → five tones.
- `formatLocationName` → "Malaga - Airport (AGP)"; without `airportCode` → "Malaga - Airport".
- `formatPickupType("ShuttleToCounterAndCar")` → "Shuttle to counter and car"; `"InTerminal"` → "In terminal".
- `formatMoney`, `divideMoney`, `isZeroMoney` as in step 2.

### 6.2 Sub-components

- `CarBlockMedia`: renders `img` with alt and `loading="lazy"`; no `src` →
  placeholder text "No image available"; `fireEvent.error(img)` → placeholder.
- `CarBlockBadge`: free → "Free Cancellation"; fee → "Cancellation fee €180.93";
  `undefined` → renders nothing (`container` empty).
- `CarBlockVendor`: logo `img` alt "NIZA"; no `imageSVGUrl` → text "NIZA";
  chip "7.7" with `data-tone="good"`; label "Good"; nothing when both missing.
- `CarBlockFeatures`: list items "5 seats", "6 bags", "5 doors", "Automatic",
  "Fuel policy: Full to full", "Mileage: 200 km/day", "Included Cover: Basic";
  no rate → only vehicle items; no insurance → no cover item.
- `CarBlockLocation`: "Malaga - Airport (AGP)" and "Shuttle to counter and car".
- `CarBlockPrice`: with `rentalDays={2}` for 132.34 → "€66.17", "per day",
  "Total €132.34"; without days → "€132.34" and "total", no "Total" line;
  no total → "Price unavailable".

### 6.3 `CarBlock.test.tsx`

- First fixture car with vendor/location: `article` named "SUV, BMW X5 or similar";
  heading level 3 "SUV"; image alt; key features; badge; vendor; price.
- `headingLevel={2}` renders an `h2`.
- `onSelect` given → button "Select BMW X5 or similar"; `userEvent` click calls
  it with `(car, rate)`; keyboard (`user.tab()` + Enter) also triggers it.
- `onImportantInfo` given → button "Important information" calls it with `car`.
- No `onSelect` / `onImportantInfo` → those controls are absent.
- Car with `rentalRates: []` → renders vehicle info, "Price unavailable", no
  badge, no Select even with `onSelect`.
- Multi-rate car (rate copies with relevance 1 and 0 and different totals) →
  renders the relevance-0 total.
- Missing `imageUrl` → placeholder; long make/model (60+ chars) renders in full.
- No `vendor` / `pickupLocation` → no vendor box, no location, no crash.

### 6.4 `CarList.test.tsx`

- Full fixture → `list` named "Car hire results" with 5 `listitem`s and 5
  `article`s; each car's vehicle name present (loop over `searchResponse.cars`).
- Order matches fixture order.
- Empty `cars` → `status` "No cars match your search."; no `list`.
- `status="loading"` → `status` "Loading cars…", container `aria-busy="true"`, no list.
- `status="error"` → `alert` with default message; custom `errorMessage` shown.
- `onSelect` forwarded: clicking the 3rd card's Select calls it with the 3rd car.
- Vendor/location lookups: the logo alt "NIZA" appears 5 times.

## 7. Storybook plan

Shared data in each story file: `import { searchResponse } from "@/data/searchResponse"`;
helpers to derive edge cases are local, unexported functions. Actions via
`import { fn } from "storybook/test"`. Typed `Meta<typeof X>` /
`StoryObj<typeof X>`, `tags: ["autodocs"]`, `argTypes` mirroring props.

Viewports: Storybook 10 defaults are 320 / 414 / 834 / 1280px and have no
Large (840–1024) option. Define viewports in the story file's `meta.parameters`
(no `.storybook/` change):

```ts
parameters: {
  viewport: {
    options: {
      cardSmall:  { name: "Small (375)",  styles: { width: "375px",  height: "800px" }, type: "mobile" },
      cardMedium: { name: "Medium (700)", styles: { width: "700px",  height: "900px" }, type: "tablet" },
      cardLarge:  { name: "Large (900)",  styles: { width: "900px",  height: "900px" }, type: "tablet" },
      cardXL:     { name: "XL (1280)",    styles: { width: "1280px", height: "900px" }, type: "desktop" },
    },
  },
},
```

Viewport stories set `globals: { viewport: { value: "cardSmall", isRotated: false } }`.

### `Components/CarBlock`

Default args: first Economy car (Toyota Yaris), vendor 321, location 203367,
`rentalDays: 2`, `onSelect: fn()`, `onImportantInfo: fn()`.

| Story                            | Data / globals                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `Default`                        | default args                                                                        |
| `Small`, `Medium`, `Large`, `XL` | default args, viewport `cardSmall` / `cardMedium` / `cardLarge` / `cardXL`          |
| `FreeCancellation`               | rate with `cancellationPolicy.fee` removed                                          |
| `CancellationFee`                | fixture rate as-is (BMW X5, €180.93)                                                |
| `UnlimitedMileage`               | `mileagePolicy: { …, description: "Unlimited mileage", quantity: undefined }`       |
| `NoInsurance`                    | `insuranceCoverage` removed                                                         |
| `MissingImage`                   | `vehicle.imageUrl` removed                                                          |
| `BrokenImage`                    | `vehicle.imageUrl: "https://invalid.example/car.png"`                               |
| `LongName`                       | make "Mercedes-Benz", model "GLE 450 4MATIC Coupé AMG Line Premium Plus or similar" |
| `TotalOnly`                      | `rentalDays: undefined`                                                             |
| `NoRates`                        | `rentalRates: []`                                                                   |
| `NoVendorOrLocation`             | `vendor` and `pickupLocation` undefined                                             |
| `MultipleRates`                  | two rates, relevance 1 (cheaper) and 0; shows the relevance-0 one                   |

### `Components/CarList`

Default args: `cars`, `vendors`, `locations` from `searchResponse`,
`rentalDays: 2`, `onSelect: fn()`, `onImportantInfo: fn()`. Same viewport
options.

| Story                         | Data                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `Default`                     | all 5 cars                                                                                  |
| `Mobile`, `Tablet`, `Desktop` | default, viewport `cardSmall` / `cardMedium` / `cardXL` (plus `LargeTablet` at `cardLarge`) |
| `Empty`                       | `cars: []`                                                                                  |
| `Loading`                     | `status: "loading"`                                                                         |
| `Error`                       | `status: "error"`                                                                           |
| `MixedEdgeCases`              | fixture cars with one free-cancellation, one missing image, one no-insurance variant        |

## 8. Risks and open questions

Every visual guess is in spec section "Assumptions" (A1–A30). Decisions the
human should confirm (defaults in bold are what the plan builds):

| #   | Question                                                                                                       | Default in this plan                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Per-day price: the data has no rental duration.                                                                | **`rentalDays` prop; stories use 2; without it the total is shown with "total". `App` passes none.** Alternative: always show the total only.              |
| Q2  | Rating: no vendor rating exists; only `locations[].ratings` (7.7 "Good").                                      | **Use the pickup-location rating next to the vendor logo.**                                                                                                |
| Q3  | No fixture rate has free cancellation (all have a fee; policy says "48 Hour BeforePickup").                    | **Neutral "Cancellation fee €X" badge.** Alternative: "Free cancellation up to 48h before pickup" (needs confirming the API semantics), or hide the badge. |
| Q4  | "Included Cover: Basic" is not in the data (three included items, `bundledInsurance: false`).                  | **"Basic" when not bundled, "Full" when bundled; hidden without coverage.**                                                                                |
| Q5  | Fixture mileage is limited (200 km/day), design shows "Unlimited".                                             | **Render "Mileage: 200 km/day"; unlimited detection per spec 5.3.**                                                                                        |
| Q6  | Select and Important information are hidden below 840px, so mobile users cannot select.                        | **Follow the design (hidden).** Alternative: show them at all sizes, or make the whole card a link.                                                        |
| Q7  | Large/XL text looks one step larger than Small/Medium.                                                         | **Same `.ts-*` class at all sizes (A27).** Alternative: render both classes and toggle with CSS, or accept literal font sizes (breaks the token rule).     |
| Q8  | "Economy" maps to `vehicle.description`, "Fiat 500 or similar" to `make + model`; fixture "OR SIMILAR" casing. | **As mapped; lower-case "or similar".**                                                                                                                    |
| Q9  | Pickup type: design "In terminal", data `ShuttleToCounterAndCar`.                                              | **Humanise to "Shuttle to counter and car".**                                                                                                              |
| Q10 | `docs/adr/0001-…md` currently fails `npm run format:check` (pre-existing, uncommitted edit).                   | **Implementer runs `npx prettier --write` on the ADR only after the human agrees** (ADR edits are outside the implementer's `src/` scope).                 |
| Q11 | Sub-components without their own CSS/stories (all card styles in `CarBlock.css`).                              | **Yes**, to keep visual tweaks in one file.                                                                                                                |
| Q12 | Icons are hand-drawn/adapted inline SVGs, not the Figma icon set.                                              | **Inline SVGs**; replace paths when the real icons are available.                                                                                          |

Risks: screenshot-derived values may be 1 token step off (human visual pass
planned); remote fixture images may fail in offline Storybook (covered by the
placeholder); literal breakpoint px can drift from `--breakpoint-*`.

## 9. Definition of done

- [ ] Matches the spec (and later Figma, by human review) at mobile, tablet and
      desktop widths (Small / Medium / Large / XL viewports).
- [ ] Styled only with design-system tokens and `.ts-*` classes; no hard-coded
      colours, px spacing, radii or font sizes where a token exists (breakpoint
      literals in `@media` are the one exception, commented with the token they
      mirror).
- [ ] Car Block and Car List both have stories (happy path + edge cases) and
      colocated Vitest + Testing Library tests.
- [ ] `npm run lint`, `npm test` and `npm run build` pass cleanly, and
      `npm run format:check` passes.
- [ ] Accessibility basics: semantic HTML, `alt` text, focus states, keyboard
      operation.
- [ ] `AGENTS.md` and `CLAUDE.md` are present and consistent.
- [ ] Boundaries respected: `src/design-system.css`, `src/assets/response.json`,
      tooling config and dependencies unchanged without asking.

## 10. Approval

Awaiting human review: reply approve, or list changes.

### Revision history

-

## QA

QA Status: AWAITING HUMAN APPROVAL
Coverage: not measured (`@vitest/coverage-v8` not installed, not added without approval); estimated by test inventory at well above 80% for the plan's scope (62 tests in 11 files cover every helper, sub-component, CarBlock and CarList success path plus most edge branches)
Requirements audit: 22 MET, 3 PARTIAL, 0 MISSING (PARTIAL = plan steps 9, 10, 13 and the visual "matches the design" criterion, which need the human)
Deferred (not success path): none written, existing tests already cover empty/error/loading states; automated axe checks, `fuel`/`cover` per-breakpoint visibility (CSS only, jsdom cannot verify), `build-storybook` not run by QA
Gates run by QA: lint pass, test pass (62/62), build pass, format:check fails only on the 5 known untouched files
Servers: Storybook http://localhost:6006, dev http://localhost:5173 (left running)
