# AGENTS.md

Instructions for AI agents working in this repo. `CLAUDE.md` carries the same guidance for Claude Code; keep both files in sync.

## Project overview

React assessment starter (CarTrawler-style car rental UI). The task (see `INSTRUCTIONS.md` and `docs/adr/0001-car-block-and-car-list-components.md`) is to build two **responsive** Storybook components that match the Figma designs:

1. **Car Block** — a single car result card (vehicle details, pricing, policies).
2. **Car List** — a list of Car Blocks rendered from every car in `src/assets/response.json`.

Reviewers weigh _how_ the code is built (clean structure, design-system fidelity, tests, a11y) as much as the result. Prefer small, composable, well-typed components.

## Stack

Vite 8, React 19, TypeScript 5.9 (strict), Storybook 10 (`@storybook/react-vite`), Vitest 5 + Testing Library (jsdom), ESLint 10 flat config + Prettier. Node 24 (`.nvmrc`).

## Commands

```bash
npm install
npm run dev            # Vite dev server  :5173
npm run storybook      # Storybook        :6006
npm test               # Vitest, single run
npm run test:watch     # Vitest watch
npm run lint           # ESLint (lint:fix to auto-fix)
npm run format         # Prettier write (format:check to verify)
npm run build          # tsc -b && vite build (type-check + bundle)
npm run build-storybook
```

## File map

```
src/
  assets/response.json     # fixture: { productType, searchId, responseTime, cars[], vendors[], locations[] }
  types/carRental.ts       # types shared by several features, modelled on response.json (no runtime code)
  data/searchResponse.ts   # the fixture typed as SearchResponse (components never import the JSON)
  components/              # one folder per feature; CarBlock/ is the pattern to follow
    CarList/               # CarList.tsx/.css/.test.tsx/.stories.tsx + index.ts
    CarBlock/              # CarBlock.tsx/.css/.test.tsx/.stories.tsx + index.ts
      money.ts             # formatMoney / divideMoney / isZeroMoney (only place that parses Money.amount); tests next to it
      carRental.ts         # selectRate + formatters for the card; tests next to it
      Badge/ Features/ Location/ Media/ Price/ Vendor/   # sub-features, each X.tsx + X.test.tsx + index.ts (no stories)
      Icons/               # inline SVG icons used by Features and Media (no icon dependency)
  design-system.css        # tokens + typography utility classes (source of truth for styling)
  App.tsx, App.css, main.tsx
docs/
  adr/                     # architecture decision records (0001 = Car Block / Car List)
  design/<slug>/           # design specs (spec.md, ...); car-block-and-car-list/spec.md is manual, derived from the PNGs in docs/design/ because Figma was not exportable
  plans/                   # development plans written by the architect agent
.claude/skills/figma-spec/ # skill that turns a Figma link into docs/design/<slug>/
.claude/skills/commit/     # skill that commits with the commitlint conventional format
.claude/agents/            # agent definitions (architect, implementer, qa-specialist)
.storybook/                # main.ts (stories glob), preview.ts (imports design-system.css)
vite.config.ts             # Vite + Vitest config, `@` alias
vitest.setup.ts            # jest-dom matchers
commitlint.config.js       # commitlint rules (extends config-conventional)
.husky/commit-msg          # git hook that runs commitlint on every commit
```

## Workflow

1. **Architect** (`.claude/agents/architect.md`) reads the ADR, obtains the Figma spec and writes a detailed development plan to `docs/plans/<slug>.md`.
2. **Human approval gate.** The plan is written as `Status: DRAFT — awaiting human approval`. A human must review it and explicitly approve it or request changes; changes bump `Revision` and keep it DRAFT. Only an explicit approval sets `Status: APPROVED by <name> on <date> (revision <n>)`. Agents never approve a plan themselves.
3. **Implementer** (`.claude/agents/implementer.md`) starts only when the plan header reads `APPROVED`, then follows it step by step, building from the local spec and never calling Figma. If the plan changes after approval it returns to DRAFT.
4. **QA specialist** (`.claude/agents/qa-specialist.md`) audits the code against the plan and ADR acceptance criteria, writes success-path tests to reach at least 80% coverage, then starts Storybook and the dev server so a human can compare the result with Figma.
5. **Final human acceptance.** QA leaves `QA Status: AWAITING HUMAN APPROVAL` in the plan. Only the human's explicit approval sets `QA Status: ACCEPTED by <name> on <date>`; reported design differences go back to the implementer as a defect list. The feature is done only when ACCEPTED.
6. Verify against the definition of done below.

There is no user-story step; the ADR acceptance criteria are the requirements.

### Agents (`.claude/agents/`)

| Agent         | Role                                                                                                                                                                                                                                                                                                                                                                        | May edit                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| architect     | Reads the ADR, gets the Figma spec via the `figma-spec` skill, writes the detailed plan as a DRAFT and stops at the approval gate.                                                                                                                                                                                                                                          | `docs/plans/` only                       |
| implementer   | Reads an APPROVED plan and builds it with the project standards: tokens-only CSS, colocated component/test/stories, strict TS. Refuses to start on a non-APPROVED plan, never calls Figma, runs lint/test/build/format:check before reporting.                                                                                                                              | `src/` and the plan's checkboxes         |
| qa-specialist | Feature-agnostic: audits the code against any approved plan and its ADR criteria, writes success-path tests for at least 80% coverage of the changed code (coverage needs `@vitest/coverage-v8`; ask before adding it), runs the app for the human to review (against the design spec when there is one), and waits for final human approval. Never fixes application code. | `*.test.ts(x)` and the plan's QA section |

The implementer stops and reports (instead of deviating) if the plan is wrong or ambiguous; scope or design changes send the plan back to DRAFT for re-approval. Visual fidelity still needs a human check in Storybook.

## Architecture & conventions

- **Imports**: use the `@/` alias for anything under `src/` (`import CarList from "@/components/CarList"`). Relative imports only inside one feature folder: siblings and descendants (`./Badge`, `./money`), never `../`. Cross-feature imports go through the other feature's `index.ts`, not its internals.
- **Feature folders**: each feature is a folder `src/components/<Feature>/` holding the component and everything only it needs: `.css`, `*.test.tsx`, `*.stories.tsx`, helpers, and an `index.ts` re-exporting the component (named and default). A feature made of several parts nests them directly under it as sub-feature folders (`CarBlock/Badge/`), with no intermediate `components/` folder, and recurses with the same rules. File names match their folder (`Badge/Badge.tsx`). Stories for top-level features; sub-features get tests, plus a story only when comparing their variants visually helps (title `Components/<Feature>/<Sub>`, e.g. `CarBlock/Badge`). Anything used by two or more features moves up to the lowest common parent (types and fixture data shared app-wide stay in `src/types/` and `src/data/`). A dependency used only by sibling sub-features (e.g. `Icons/`) is its own sub-feature folder under their parent.
- **Styling files**: one `.css` per feature folder, imported by the feature's root component; sub-features may use the parent's classes (BEM-style `car-block__badge`) or add their own `.css` if they grow. Components are exported both named and default (see `CarBlock.tsx`).
- **Props**: declare a `type XProps` above the component with JSDoc on each prop; Storybook `argTypes` mirror them.
- **Styling**: plain CSS files imported by the component (no CSS-in-JS/Tailwind). Style **only** with design-system tokens — never hard-code colors, px spacing, radii or font sizes if a token exists:
  - Colors: `--text-*`, `--bg-fill-*`, `--border-*`, `--button-*`, `--price-*`, `--surface-*`, `--container-*`, etc.
  - Typography: apply `.ts-display-*`, `.ts-headline-*`, `.ts-subtitle-*`, `.ts-body-*`, `.ts-label-*`, `.ts-button-*` classes.
  - Spacing/sizing: `--space-*`, `--bw-*` (border width), `--br-*` (radius).
  - Breakpoints: mobile 608px, tablet 840px, desktop-small 1025px, desktop-large 1328px. CSS custom properties can't be used inside `@media` conditions, so write the literal px value and note which breakpoint it mirrors in a comment. Design mobile-first (`min-width`).
  - Read exact tokens off Figma; don't guess. Figma: see `INSTRUCTIONS.md`.
  - **Don't call Figma while building.** Use the `figma-spec` skill (`.claude/skills/figma-spec/`) to extract a Figma link once into `docs/design/<slug>/spec.md` (token-mapped colors, spacing, radii, typography, layout), then build from that file. Reuse an existing spec instead of re-fetching; only refresh if the design changed. Needs `FIGMA_TOKEN` in a git-ignored `.env`; never print or commit it.
- **Types**: model them on `response.json` (`vehicle`, `rentalRates[]` with `pricing`, `deposit`, `fuelPolicy`, `mileagePolicy`, `insuranceCoverage`, `config`). Money values are `{ amount: string, currency: string }` — amounts are strings; format via `Intl.NumberFormat`, don't parse ad hoc. Put shared types in a dedicated types file under `src/`, not inside components. Do not use `any`.
- **TypeScript rules in force**: `strict`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax` (use `import type` for types), `erasableSyntaxOnly` (no enums, namespaces, or parameter properties).
- **ESLint**: `react-hooks` rules and `react-refresh/only-export-components` (warn) — keep non-component exports out of component files.
- **Formatting** (Prettier): double quotes, semicolons, trailing commas, 80 cols, 2-space indent. Run `npm run format` rather than hand-formatting.
- **Commits**: Conventional Commits enforced by commitlint (`@commitlint/config-conventional`) through a husky `commit-msg` hook: `type(scope): subject`, lowercase imperative subject, no trailing period, header ≤ 100 chars. Use the `commit` skill (`.claude/skills/commit/`) to stage explicit files, validate and commit; never `--no-verify`, never amend/push unless asked. Packages are installed per the skill's Setup section (needs `git init` and `npm install`).
- **Accessibility**: semantic HTML (lists for the Car List, headings in a sensible order), meaningful `alt` text on car images, visible focus states, keyboard-operable controls.
- **Performance**: `loading="lazy"` on images; memoize only where it measurably matters.

## Testing

- Vitest globals are on, but the existing tests still import `describe/it/expect` from `vitest` — follow that.
- Query by role/text (`getByRole`, `getByText`) first; `data-testid` only as a fallback.
- Use `userEvent.setup()` for interactions.
- Test with the real fixture (or a slice of it) for Car Block / Car List: renders every car, key fields (make/model, price, policies), edge cases (missing optional fields, empty list).

## Storybook

- Title convention: `Components/<Name>`, with `tags: ["autodocs"]` and typed `Meta`/`StoryObj`.
- Cover the happy path plus edge cases: long names, missing image, no insurance, free cancellation vs. fee, empty list, loading/error states for the list.
- Verify responsive behavior with Storybook viewports (mobile/tablet/desktop).

## Definition of done

- Matches Figma at mobile, tablet and desktop widths.
- Uses design-system tokens/classes only.
- Stories and colocated unit tests exist for each component.
- `npm run lint`, `npm test` and `npm run build` all pass cleanly.
- `AGENTS.md` is present and up to date.

## Boundaries — ask before changing

- `src/design-system.css` (read-only source of truth; add local CSS in component files instead).
- `src/assets/response.json` (fixture; build edge cases as story/test data derived from it).
- Tooling config: `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc.json`, `commitlint.config.js`, `.husky/*`, `.storybook/*`, `package.json` dependencies.
- Don't add new dependencies without asking. Never commit `node_modules`, `dist` or `storybook-static`.
