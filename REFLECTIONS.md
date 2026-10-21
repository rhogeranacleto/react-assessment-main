# Reflections

A brief explanation of the process flow behind this assessment.

1. **Workspace setup.** I initialized the Claude workspace with a `CLAUDE.md`, agents (architect, implementer, QA specialist) and skills (`figma-spec`, `commit`). For a code challenge this is more than strictly necessary, but I wanted to set the project up the way I would in a real team.
2. **Automation first.** I automated as much of the process as possible: plan, build, QA and commit. Some steps could not be fully automated because this is an edge situation (for example, Figma was not exportable, so the design spec was derived manually from the PNGs). The intent of the flow is still visible, including the human approval gates.
3. **Issues found along the way.** While implementing, I ran into issues I could not have foreseen up front. They are a normal part of the process, and all of them are documented in the repo (plans, notes and ADR).
4. **Transparent conversations.** I am including the conversations with Claude so the whole process is transparent and open to critique.

## Requirement overview

What `INSTRUCTIONS.md` asked for and how each item was covered.

| Requirement                       | Status | How it was covered                                                                                                                                                                                                                                                                         |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Car Block** matching the design | Done   | `src/components/CarBlock/`, split into small sub-components (`Badge`, `Features`, `Location`, `Media`, `Price`, `Vendor`, `Icons`). Figma was not exportable, so the design spec was derived manually from the PNGs (`docs/design/`). Visual fidelity was checked by a human in Storybook. |
| **Car List** rendering every car  | Done   | `src/components/CarList/` renders a Car Block per car from `response.json` inside a semantic list.                                                                                                                                                                                         |
| **Responsive** (mobile → desktop) | Done   | Mobile-first CSS using the design-system breakpoints (608 / 840 / 1025 / 1328px). The literal px values are noted in comments because CSS variables cannot be used in `@media`.                                                                                                            |
| **Design system** tokens/classes  | Done   | Styling only through `var(--token)` and `.ts-*` classes. `design-system.css` was not modified.                                                                                                                                                                                             |
| **Storybook stories**             | Done   | Car Block: happy path, viewport sizes, free cancellation vs. fee, unlimited mileage, no insurance, missing/broken image, long name, total-only price, no rates, no vendor/location, multiple rates. Car List: default, viewports, empty, loading, error, mixed edge cases.                 |
| **Unit tests** colocated          | Done   | Vitest + Testing Library, colocated with each component and helper (`money`, `carRental`). 62 tests in 11 files, using the real fixture plus derived edge cases.                                                                                                                           |
| **`AGENTS.md`**                   | Done   | At the repo root, kept in sync with `CLAUDE.md` (overview, commands, conventions, file map, definition of done, boundaries). The agents and skills are in `.claude/`.                                                                                                                      |
| **`npm run lint` / `npm test`**   | Pass   | Both pass, and `npm run build` passes too (verified when writing this section).                                                                                                                                                                                                            |
| **Types modelled on the fixture** | Done   | `src/types/carRental.ts`; money amounts stay strings and are formatted via `Intl.NumberFormat` in `money.ts`. No `any`.                                                                                                                                                                    |

### "Impress us" extras

- **Accessibility**: semantic HTML (list for the Car List, sensible headings), meaningful `alt` text, ARIA where needed, visible `:focus-visible` states on the interactive elements.
- **States**: loading, empty and error stories for the list; missing and broken image handling for the block.
- **Performance**: lazy-loaded images. Memoization was deliberately not added because it would not measurably matter here.
- **Structure**: small, well-typed, composable components with JSDoc'd props, an ADR (`docs/adr/`), a reviewed development plan (`docs/plans/`) and a conventional-commit history enforced by commitlint.

### Known gaps

- The 80% coverage target from the QA agent's workflow was skipped by decision (`@vitest/coverage-v8` is not installed and the feature is small). Every helper, sub-component and success path is still tested.
- Design caveats found during the build (typography, breakpoints, free cancellation) are recorded in `NOTES.md`.
