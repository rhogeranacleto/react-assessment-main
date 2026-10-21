# ADR 0001: Car Block and Car List components

- **Status:** Accepted
- **Date:** 2026-10-21
- **Deciders:** rhoger.anacleto

## Context

### Task description

Build two React components that render car rental search results, documented
in Storybook and covered by unit tests (see `INSTRUCTIONS.md`):

1. **Car Block** — a single car result card showing vehicle details, pricing
   and policies for one car.
2. **Car List** — a list of Car Blocks, one for every car in
   `src/assets/response.json`.

Design source:
[CarTrawler Technical Assessment — Figma](https://www.figma.com/design/JlbW0v2Tmf6kybsOEFyhGx/CarTrawler-Technical-Assesment?node-id=10308-24250&t=JXUySO69t2VzVSnO-0)
(also linked in `INSTRUCTIONS.md`).

Constraints:

- Both components must be **responsive** across mobile, tablet and desktop.
- Figma is the source of truth for layout, spacing and styling.
- All styling must come from the design system in `src/design-system.css`
  (CSS variables and `.ts-*` utility classes), not ad-hoc values.
- Types are modelled on the fixture: each car has a `vehicle` and
  `rentalRates[]` (pricing, deposit, cancellation, fuel and mileage policy,
  insurance coverage, config flags).
- Stack is fixed: React 19, strict TypeScript, Vite, Storybook 10, Vitest +
  Testing Library, ESLint + Prettier. Components, tests and stories are
  colocated and imported through the `@/` alias.
- An `AGENTS.md` for AI agents working in the repo is also required. AI
  assistance is encouraged.

## Alternatives considered

### 1. Styling

| Option                                             | Pros                                                                             | Cons                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Plain colocated CSS using design-system tokens** | Matches the `Counter` pattern; tokens and `.ts-*` classes used directly; no deps | Class naming discipline is manual                                           |
| CSS Modules                                        | Scoped class names                                                               | Extra convention not used by the starter; stories and tests need no benefit |
| Tailwind or CSS-in-JS                              | Fast to write                                                                    | New dependency; duplicates the existing design system; against the brief    |
| Inline styles                                      | No stylesheet                                                                    | No media queries or pseudo-states; encourages hard-coded values             |

### 2. Component structure

| Option                                                         | Pros                                                         | Cons                               |
| -------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| One monolithic `CarBlock`                                      | Fewest files                                                 | Hard to test, read and reuse       |
| **`CarBlock` composed of small presentational sub-components** | Each piece is testable and readable; clean, well-typed props | More files; needs a sensible split |

### 3. Data and types

| Option                                                | Pros                                                | Cons                                     |
| ----------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| Import `response.json` and let TypeScript infer types | Zero effort                                         | Literal-inferred types; fragile; no docs |
| **Dedicated types file modelled on `response.json`**  | Explicit, reusable by components, tests and stories | Must be kept in sync with the fixture    |

`CarBlock` receives a single `Car`; `CarList` receives `Car[]`. Components do
not import the JSON themselves, so they stay reusable and easy to feed edge
case data.

### 4. Responsiveness

| Option                                     | Pros                                                     | Cons                                                              |
| ------------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------- |
| **Mobile-first `min-width` media queries** | Simple, universal, matches the design-system breakpoints | `var(--breakpoint-*)` cannot be used in `@media`; literals needed |
| Container queries                          | Component adapts to its container                        | Breakpoints in the design system are viewport-based               |
| JS-based breakpoints (`matchMedia` hooks)  | Conditional rendering possible                           | Extra runtime logic, flicker, harder to test                      |

### 5. Testing

| Option                                                   | Pros                                 | Cons                             |
| -------------------------------------------------------- | ------------------------------------ | -------------------------------- |
| **Testing Library by role and text, using fixture data** | Tests behaviour users see; resilient | Slightly more verbose            |
| Snapshot tests                                           | Quick to write                       | Brittle, low signal, noisy diffs |

### 6. Cars with several `rentalRates`

| Option                                               | Pros                                  | Cons                                         |
| ---------------------------------------------------- | ------------------------------------- | -------------------------------------------- |
| **Render one rate: the one with the best relevance** | Matches a "single result card" design | Must confirm the rule against Figma and data |
| Render all rates in the block                        | Shows everything                      | Not what the design shows; clutters the card |

## Decision

Build `CarBlock` and `CarList` as small, typed, presentational React
components styled with plain colocated CSS that uses only design-system
tokens, designed mobile-first.

### How

- **Layout of files** under `src/components/`, following `Counter`:
  `CarBlock.tsx`, `CarBlock.css`, `CarBlock.test.tsx`, `CarBlock.stories.tsx`,
  and the same four files for `CarList`. Small sub-components (for example
  vehicle info, price, policies) live next to `CarBlock` and are composed by
  it.
- **Types** live in a dedicated types file under `src/`, modelled on
  `response.json`. Money values are `{ amount: string; currency: string }`
  and are formatted with `Intl.NumberFormat`, never parsed ad hoc.
- **Styling** uses `var(--token)` and `.ts-*` classes only. Each visual
  property is mapped to its token by inspecting Figma. Media queries are
  `min-width` with literal px values mirroring `--breakpoint-mobile` (608px),
  `--breakpoint-tablet` (840px), `--breakpoint-desktop-small` (1025px) and
  `--breakpoint-desktop-large` (1328px), each with a comment naming the token.
- **Semantics and accessibility:** `CarList` renders a `<ul>` of `<li>`;
  `CarBlock` is an `<article>` with a heading; images have meaningful `alt`
  text and `loading="lazy"`; interactive elements are keyboard-operable with
  visible focus.
- **Rate selection:** show the rental rate with the lowest `orderByRelevance`
  (to be confirmed against Figma); cars without rates render a safe fallback
  rather than crashing.
- **Stories** use title `Components/<Name>` with `autodocs`. They cover the
  happy path and edge cases (long names, missing image, no insurance, free
  cancellation vs fee, empty list, loading and error states for the list).
- **Tests** query by role and text and use the real fixture (or slices of it).
  They check that the list renders every car, key fields of a block, and the
  edge cases above.

### Why

- Design-system tokens keep the result consistent with the brand and are an
  explicit requirement; hard-coded values would fail review.
- Plain CSS adds no dependency and follows the existing starter pattern.
- Small composed components keep each unit readable and testable, and show
  structural judgment, which the assessment evaluates.
- Typing from the fixture makes the data contract explicit and gives
  compile-time safety for stories and tests.
- Mobile-first media queries are the simplest approach that satisfies the
  design-system breakpoints without runtime logic.
- Behavioural tests survive refactors; snapshots would not.

## Consequences

**Positive**

- No new dependencies; consistent with `README.md` and `CLAUDE.md`
  conventions.
- Components are reusable and easy to exercise from Storybook with edge case
  data.

**Negative / risks**

- Figma cannot be read automatically here, so token mapping needs manual
  verification against the designs.
- Breakpoint values are duplicated as literals in CSS and can drift from
  `design-system.css`.
- The rate-selection rule is an assumption until confirmed with the designs.

## Acceptance criteria

The task is successful when all of the following hold:

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

Stretch goals ("Impress us"): accessibility (semantic HTML, keyboard
navigation, ARIA, focus states), loading, empty and error states in stories,
small composable sub-components, lazy images, and a well organized Storybook.
