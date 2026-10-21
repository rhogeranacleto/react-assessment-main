# Car Rental UI — Technical Assessment

Welcome! This is a hands-on technical assessment. You'll build two React components
that render car rental search results, using the provided design system and sample
data. Read this whole document before you start.

## What we're looking for

We care about **how** you build as much as **what** you build: clean, readable code;
thoughtful component structure; attention to detail against the designs; and tests
you'd be proud to ship. There's no single "right" answer — show us your judgment.

## The task

Build two Storybook components that match the designs:

1. **Car Block** — a single car result card (vehicle details, pricing, policies).
2. **Car List** — a list of `Car Block`s rendered from the sample data.

Both components must be **responsive** across mobile, tablet, and desktop.

## Designs

The source of truth for layout, spacing, and styling is Figma:

- [CarTrawler Technical Assessment — Figma](https://www.figma.com/design/JlbW0v2Tmf6kybsOEFyhGx/CarTrawler-Technical-Assesment?node-id=10308-24250&t=JXUySO69t2VzVSnO-0)

Open the frames in Figma and inspect the elements to understand exactly which token
to use for each property (color, font size, spacing, border radius, etc.). Don't guess
values — read them off the design.

## Design system

All styling should come from the design system, not ad-hoc values:

- Use the **CSS variables** and **utility classes** defined in
  [`src/design-system.css`](./src/design-system.css).
  - Color tokens: `--text-*`, `--bg-fill-*`, `--border-*`, `--button-*`, `--price-*`, etc.
  - Typography classes: `.ts-display-*`, `.ts-headline-*`, `.ts-subtitle-*`, `.ts-body-*`, `.ts-label-*`, `.ts-button-*`
  - Spacing / sizing tokens: `--space-*`, `--bw-*` (border width), `--br-*` (border radius)
  - Breakpoints: `--breakpoint-mobile` (608px), `--breakpoint-tablet` (840px), `--breakpoint-desktop-small` (1025px), `--breakpoint-desktop-large` (1328px)
- Inspect the elements in Figma to map each visual property to the correct token.
- Prefer referencing tokens (`var(--token)` or the `.ts-*` classes) over hard-coded
  pixel/hex values so the components stay consistent with the brand.

## Sample data

Use [`src/assets/response.json`](./src/assets/response.json) as your content source.
It's a car rental search response containing an array of `cars`. Each car has:

- `vehicle` — make, model, style, image, doors, passengers, baggage, transmission, fuel type
- `rentalRates[]` — pricing, deposit, cancellation policy, fuel & mileage policy, insurance coverage, config flags

Model your TypeScript types around this shape. The **Car List** should render every
car in the fixture; the **Car Block** should render a single one.

## Requirements checklist

- [ ] **Car Block** component matching the design
- [ ] **Car List** component rendering the full set of cars
- [ ] Both are **responsive** (mobile → tablet → desktop)
- [ ] Styling uses the **design system** tokens/classes from `design-system.css`
- [ ] **Storybook stories** for each component (happy path + interesting edge cases)
- [ ] **Unit tests** (Vitest + Testing Library) colocated with each component
- [ ] **Agent file(s)** (`AGENTS.md`) with instructions for AI agents working in this repo (see below)
- [ ] `npm run lint` and `npm test` pass cleanly

## Using AI (encouraged!)

You are **encouraged** to use AI assistants while working on this. We want to see how
you collaborate with AI, not whether you can avoid it.

To make that collaboration reproducible, add an **`AGENTS.md`** file at the repo root
containing **instructions for AI agents** working in this codebase. Think of it as the
context you'd hand to an agent so it behaves like a good teammate here. A strong file
covers things like:

- **Project overview** — what this repo is and the goal of the task.
- **Commands** — how to install, run, test, lint, format, and build (so an agent never
  has to guess).
- **Conventions & guardrails** — e.g. always style with `design-system.css` tokens /
  `.ts-*` classes (no hard-coded values), keep components + tests + stories colocated,
  use the `@/` alias, model types around `response.json`.
- **File map** — where key things live (`src/components/`, `src/assets/response.json`,
  `src/design-system.css`).
- **Definition of done** — what "finished" looks like (lint + tests pass, responsive,
  matches Figma).
- **Boundaries** — what an agent should *not* touch or change without asking.

The quality of this file tells us a lot about how you think about working with AI.

## Getting started

```bash
npm install
npm run dev        # Vite dev server (http://localhost:5173)
npm run storybook  # Storybook (http://localhost:6006)
```

See the [README](./README.md) for the full script reference and project structure.

## Submitting

When you're done, make sure:

1. `npm run lint` passes.
2. `npm test` passes.
3. `npm run build` passes.
4. Your agent files are committed.
5. Send back a Zip folder of your project. (Please do not include your `node_modules` folder)

## Impress us!

The requirements above are the floor, not the ceiling. Go beyond them if you have
ideas — for example:

- Thoughtful accessibility (semantic HTML, keyboard navigation, ARIA, focus states).
- Nice loading / empty / error states in your stories.
- Clean, well-typed props and small, composable sub-components.
- Performance touches (memoization where it actually matters, lazy images).
- A polished, delightful Storybook setup with good story organization.
- Anything else that shows craft and curiosity.

Good luck — we can't wait to see what you build! 🚗
