# Car Block / Car List — design questions

Screenshots in this folder: `Car hire card.png` (overview), `card small.png`,
`card medium.png`, `car large.png`, `car xl.png`.

Write the answer under each **Answer:** line. Raw Figma "inspect" values are
fine; they get mapped to design-system tokens. If a value is unknown, write
"use closest token" and it will be flagged in the spec as an assumption.

Observed layout: Small and Medium stack the image above the content. Large and
XL put the image on the left. Only Large and XL show the **Select** button, the
"Included Cover" line and the "Important information" link.

## 1. Breakpoints

- Which viewport width maps to each size? Proposed: Small < 608px, Medium
  608–839px, Large 840–1024px, XL ≥ 1025px.
- Does Car List change columns by breakpoint (e.g. 1 column mobile, 2 tablet),
  or is it always a single column? What is the gap between cards?

**Answer:**

## 2. Card container (all sizes)

- Border radius, border (width and colour), shadow, background.
- Padding of the content area; gap between sections.

**Answer:**

## 3. Image area

- Background colour (looks like `--container-alt`, rgb(242, 242, 242)).
- Height or aspect ratio at Small and Medium; width of the image column at
  Large and XL.
- Image fit and padding (`contain` or `cover`).
- Is there a divider line between image and content at Large and XL?

**Answer:**

## 4. "Free Cancellation" badge

- Background and text colour (looks like `--bg-fill-positive-subtle` with
  `--text-positive`), typography style, padding, radius.
- What does the card show when the rate has no free cancellation?

**Answer:**

## 5. Title ("Economy") and subtitle ("Fiat 500 or similar")

- Typography style and colour for each; gap between them.
- Which fields feed them? ("Economy" = vehicle category? "Fiat 500 or
  similar" = make + model?)

**Answer:**

## 6. Vendor logo and rating (Hertz, 8.6, "Very good")

- Logo box: border, radius, padding, size.
- Rating chip: background, text colour, radius, typography (looks like
  `--ratings-*`).
- "Very good" label: typography and colour. Is it derived from the score?
  Thresholds?
- Which `response.json` fields supply the logo and the score?

**Answer:**

## 7. Feature rows (seats, bag, doors, transmission, fuel, mileage, cover)

- Typography and colour; icon size and colour; gap between icon and text,
  between items, and between rows.
- Which icons? Provide the SVGs or the icon-set name (no new icon dependency
  without approval).
- Items shown per size (from the screenshots, please confirm):
  - Small: seats, bag, doors, transmission, mileage
  - Medium: the above + fuel policy
  - Large: the above + Included Cover
  - XL: same as Large
- Medium and Large show "4 seats" where the mileage should be (looks like a
  design typo). Render the real mileage policy ("Mileage: Unlimited") as Small
  and XL do?

**Answer:**

## 8. Location block

- Typography and colour for "Lisbon airport (LIS)" (looks like
  `--text-brand-primary`) and "In terminal" (looks like `--text-grey`).
- Which `response.json` fields supply them (`locations[]`?).

**Answer:**

## 9. Price block

- Typography for "€12" and for "/day" (smaller, different weight).
- "Total €24": typography and colour.
- Is the per-day price calculated (total ÷ days) or a field? Small shows
  €12/day with a €24 total, while Large shows €24/day with a €24 total, so the
  screenshots are inconsistent. Which rule applies?

**Answer:**

## 10. "Select" button and "Important information" link

- Button: variant (looks like `--button-bg-primary`), size (`.ts-button-*`),
  radius, padding.
- Link: underline style and colour (looks like `--link-brand-default`).
- Behaviour: should Select be a callback prop (e.g. `onSelect(car)`)? Should
  the link be an `href` or a callback?

**Answer:**

## 11. Alignment

- At Large and XL the vendor and price blocks are right-aligned and the left
  content is left-aligned. Does the price block sit bottom-right in every
  size?

**Answer:**

## 12. Anything else

Notes, extra frames, hover/focus states, loading or empty states, other details
the screenshots don't show.

**Answer:**
