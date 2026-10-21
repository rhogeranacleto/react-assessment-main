# React Assessment Starter

A blank, opinionated starter for the React assessment. It is pre-configured with
everything you need to build, test, and document components — so you can focus on
the task itself.

## Tech stack

- [Vite](https://vite.dev/) — dev server & bundler
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Storybook](https://storybook.js.org/) — component workshop
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — unit tests
- [ESLint](https://eslint.org/) (flat config) + [Prettier](https://prettier.io/) — linting & formatting

## Getting started

```bash
npm install
npm run dev        # start the Vite dev server (http://localhost:5173)
```

## Scripts

| Command                   | Description                             |
| ------------------------- | --------------------------------------- |
| `npm run dev`             | Start the Vite dev server               |
| `npm run build`           | Type-check and build for production     |
| `npm run preview`         | Preview the production build            |
| `npm test`                | Run unit tests once (Vitest)            |
| `npm run test:watch`      | Run unit tests in watch mode            |
| `npm run lint`            | Lint the project (ESLint)               |
| `npm run lint:fix`        | Lint and auto-fix what ESLint can       |
| `npm run format`          | Format all files (Prettier)             |
| `npm run format:check`    | Check formatting without writing        |
| `npm run storybook`       | Start Storybook (http://localhost:6006) |
| `npm run build-storybook` | Build the static Storybook site         |

## Project structure

```
src/
  assets/
    response.json        # sample car rental API response fixture
  components/
    Counter.tsx          # example component
    Counter.test.tsx     # its unit tests
    Counter.stories.tsx  # its Storybook stories
  App.tsx
  main.tsx
  index.css
.storybook/              # Storybook configuration
vite.config.ts           # Vite + Vitest configuration
vitest.setup.ts          # Vitest global setup (jest-dom matchers)
```

## Sample data

- `src/assets/response.json` — a sample car rental search response. It contains an array of `cars`, each with vehicle details (make, model, transmission, capacity), rental rates, pricing, deposits, fuel/mileage policies, and insurance coverage. Use it as a fixture when building or testing components that render rental results.

## Conventions

- Use the `@/` alias to import from `src/` (e.g. `import Counter from "@/components/Counter"`).
- Keep components, their tests (`*.test.tsx`), and stories (`*.stories.tsx`) colocated.
- Run `npm run lint` and `npm test` before submitting your work.
