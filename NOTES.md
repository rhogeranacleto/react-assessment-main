# Notes

## `npm install` fails with E401 (private registry in the lockfile)

### Problem

`npm install` (including `npm install -D @commitlint/cli @commitlint/config-conventional husky`) failed with:

```
npm error code E401
npm error Unable to authenticate, your authentication token seems to be invalid.
```

The new packages were found on the public registry, but npm also had to fetch the tarballs already pinned in `package-lock.json`.

### Cause

`package-lock.json` had 408 `resolved` URLs pointing to a private AWS CodeArtifact registry (`ct-codeartifact-domain-prd01-…eu-west-1.amazonaws.com`, repository `npm-public`) instead of `https://registry.npmjs.org`. Likely reasons:

- The starter was generated on a machine whose npm was configured to use CodeArtifact, and npm recorded those URLs in the lockfile.
- CodeArtifact auth tokens are short-lived (about 12 hours), so the login had expired, and npm answered 401.
- The AWS CLI needed to refresh the token (`aws codeartifact login …`) was not available in the environment.
- Anyone without access to that registry (for example reviewers of the assessment) would hit the same error.

### Solution

Deleted `package-lock.json` and ran `npm install` again. npm re-resolved every dependency from the public registry and generated a new lockfile: all `resolved` URLs now point to `https://registry.npmjs.org` (0 CodeArtifact references left, 408 before). Install completed without errors.

### Follow-ups

- The lockfile change is uncommitted. Review the diff and commit it (suggested: `build(deps): resolve lockfile from the public npm registry`).
- Re-resolving can bump transitive versions within the ranges in `package.json`; run `npm run lint`, `npm test` and `npm run build` to confirm nothing regressed.
- `@commitlint/cli`, `@commitlint/config-conventional` and `husky` are not installed yet. `commitlint.config.js` and `.husky/commit-msg` exist, but the hook stays inactive until you run:
  ```bash
  npm install -D @commitlint/cli @commitlint/config-conventional husky
  npm pkg set scripts.prepare="husky"
  npm run prepare
  ```
- To avoid this in the future, don't commit a lockfile generated against a private registry; check `grep -c codeartifact package-lock.json` is `0` before submitting.

## Typography: font-family and letter-spacing not found in Figma

### Problem

Figma's text styles reference a `Font-family` variable and set `letter-spacing: 0px` (for example the Car Block title: Bold, `Font Size/Subtitle-S`, `Line Height/Subtitle-S`). Neither is available in the repo:

- `src/design-system.css` defines font sizes, line heights and weights (`.ts-*` classes, `--font-weight-*`) but no font-family token and no letter-spacing.
- No stylesheet in the project sets `font-family` or `letter-spacing`, and the font is not loaded anywhere.

### Decision

`letter-spacing` is not set anywhere: the browser default (`normal`) is used, which matches the design's 0px.

The font family was not found, and without one the browser falls back to its default serif font, which looks nothing like the design. A sans-serif stack closest to Figma (the design looks like Inter) was added to `src/design-system.css`, with the approval of rhoger.anacleto on 2026-10-21: the variable `--font-family-base` (`Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) and a `body { font-family: var(--font-family-base); }` rule. It lives there because both the app (`main.tsx`) and Storybook (`.storybook/preview.ts`) import that file, so no tooling config had to change. Inter itself is not loaded, so it only applies if installed on the machine; otherwise the system sans-serif is used. Weight, size and line height come from the `.ts-*` classes.

### Follow-ups

- Replace the variable's value with the real Figma font-family when it is known, and load the font (for example self-hosted or from Google Fonts; adding a dependency or external request needs approval) so every viewer gets the same one.
- Re-check text widths and line wrapping against Figma, since the fallback fonts have different metrics.

## Typography: no font-size or line-height variables (Car Block title)

### Problem

Figma sets the Car Block title to `Font Size/Body-L` (Small), `Subtitle-S` (Medium) and `Subtitle-M` (Large and XL), each with the matching `Line Height/*` and weight 700. `src/design-system.css` exposes font sizes and line heights only inside the `.ts-*` classes (no `--font-size-*` or `--line-height-*` variables), and a class cannot be switched inside a media query.

### Decision

Small uses the class `.ts-body-l-heavy`. Medium and Large/XL override `font-size` and `line-height` in `CarBlock.css` with the closest variables, which are spacing tokens used as typography values (the match is by value, not by meaning):

| Size     | Style      | `font-size` value | Built from                        | Result | `line-height` value | Built from                    | Result             |
| -------- | ---------- | ----------------- | --------------------------------- | ------ | ------------------- | ----------------------------- | ------------------ |
| Small    | Body-L     | `1rem`            | `.ts-body-l-heavy`                | exact  | `1.5`               | `.ts-body-l-heavy`            | exact              |
| Medium   | Subtitle-S | `1.125rem`        | `--space-200` + `--space-050` / 2 | exact  | `1.55` (1.74rem)    | `--space-300` + `--space-050` | 1.75rem (+0.01rem) |
| Large/XL | Subtitle-M | `1.25rem`         | `--space-250`                     | exact  | `1.6` (2rem)        | `--space-400`                 | exact              |

No existing variable equals `1.125rem` (the nearest are `--space-200` and `--space-250`, which would make Medium match Small or Large), so two variables were added to `src/design-system.css`, with the approval of rhoger.anacleto on 2026-10-21: `--font-size-subtitle-s: 1.125rem` and `--line-height-subtitle-s: 1.55`. The `.ts-subtitle-s-*` classes now reference them, so their computed values are unchanged and there is a single source. The weight always comes from the `.ts-body-l-heavy` class.

### Change to the design system (necessary)

`src/design-system.css` is normally read-only. It was changed because Figma's Subtitle-S size and line height had no variable and no existing spacing variable matched, so the Medium title could not follow the design without a hard-coded value or a wrong size. The diff is only these two new variables plus the three `.ts-subtitle-s-*` classes pointing at them. If the design system is re-synced from upstream, re-apply this or ask the design-system owners to publish the variables.

### Follow-ups

- Add `--font-size-*` and `--line-height-*` variables to `design-system.css` (needs approval) and switch the title to them.
- If the design system's typography values change, update these variables by hand: nothing links them to the `.ts-*` classes.

## "Free Cancellation" cannot be seen as in Figma with the fixture

Figma shows the green "Free Cancellation" badge on every card, but `src/assets/response.json` has no free cancellation: all 5 rates carry a cancellation fee. With the real data every card therefore renders the neutral "Cancellation fee €X" badge, and the Figma look cannot be reproduced in `npm run dev` or in the `CarList` stories.

The free variant exists in the code (`kind: "free"`, green `--bg-fill-positive-subtle` / `--text-positive`) and can be seen only in Storybook: `Components/CarBlock/Badge` (the `Free`, `WithFee` and `Alternatives` stories) and the `CarBlock` `FreeCancellation` story, whose data is derived from the fixture. How a "free" policy would be detected in a real API response is an assumption (see the spec); confirm it before relying on it.
