---
name: commit
description: Create git commits that follow the commitlint conventional format (type(scope): subject, with optional body and footer), staging only the intended files and validating the message before committing. Use when the user asks to commit, save changes to git, or write a commit message.
---

# commit

Commit the current work with a message that passes `@commitlint/config-conventional`. Invoking this skill is the user's request to commit; it does **not** authorize pushing, amending, or rewriting history.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type** (required, lowercase): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **scope** (optional, lowercase, kebab-case): the area changed. Suggested for this repo: `car-block`, `car-list`, `types`, `design-system`, `storybook`, `adr`, `docs`, `plans`, `agents`, `skills`, `config`, `deps`. Reuse the scopes in `git log` when they fit; omit the scope when the change spans areas.
- **subject** (required): imperative mood ("add", not "added"), lowercase first letter, no trailing period, header (whole first line) ≤ 100 characters. Describe _what_ and _why it matters_, not the file list.
- **body** (optional): blank line before it, wrapped at 100 characters. Explain motivation and non-obvious decisions.
- **footer** (optional): blank line before it. Breaking changes: `BREAKING CHANGE: <description>` (or `!` after type/scope: `feat(car-list)!: …`). References: `Refs: #123`. Trailers such as `Co-Authored-By:` go here.

Type guide: `feat` new behaviour/component · `fix` bug fix · `docs` ADRs, plans, README, CLAUDE/AGENTS · `test` tests only · `refactor` no behaviour change · `style` formatting only (not CSS styling work, which is `feat`/`fix`) · `build` deps/bundler/tsconfig · `ci` pipelines · `chore` anything else non-source (agent/skill files are `chore(agents)` / `chore(skills)`, or `docs` if purely documentation) · `perf` · `revert`.

## Workflow

1. **Check the repo.** Run `git rev-parse --is-inside-work-tree`. If this is not a git repository, tell the user and ask whether to `git init`; don't initialise on your own.
2. **Inspect.** Run `git status --short`, `git diff` and `git diff --staged`, and `git log --oneline -10` to match existing scopes and style. If nothing changed, say so and stop.
3. **Group the changes.** One commit = one logical change. If the diff mixes unrelated work (e.g. a component and an unrelated docs edit), split it into several commits, each staged separately. Propose the split if it isn't obvious.
4. **Check what you are about to commit.**
   - Never stage `.env*` (except `.env.example`), tokens, credentials, `node_modules/`, `dist/`, `storybook-static/`, `coverage/`, or generated junk. If a secret appears in the diff, stop and warn the user.
   - Stage explicit paths (`git add <paths>`), never `git add -A` / `git add .`, unless the user asked to commit everything and you reviewed the full list.
   - If code changed, run `npm run lint` and `npm test` first when they are quick, and mention failures; don't commit known-broken code without the user's say-so. Docs-only commits don't need them.
5. **Write the message** following the format above, based on the staged diff (not on the conversation alone). Prefer a body when the _why_ isn't obvious from the subject.
6. **Validate** with commitlint (config: `commitlint.config.js`, extends `@commitlint/config-conventional`) before committing:
   ```bash
   printf '%s\n' "<full message>" | npx --no -- commitlint
   ```
   Fix any reported problem and re-run until it passes. The husky `commit-msg` hook (`.husky/commit-msg`) runs the same check on `git commit`, so a message that fails here will be rejected there. If `@commitlint/cli` isn't installed (`npx --no -- commitlint --version` fails), tell the user to run `npm install` (or install per "Setup" below); in the meantime follow the format above by hand and say that it was not machine-validated.
7. **Commit.** Use a heredoc so multi-line messages keep their formatting:
   ```bash
   git commit -F - <<'EOF'
   feat(car-block): render vehicle details and price

   Body explaining why, wrapped at 100 characters.

   Co-Authored-By: …
   EOF
   ```
   Append the attribution trailer the session instructs (the system/CLAUDE.md attribution line for commits) as the last footer line, after a blank line. Never invent one.
8. **Report** the resulting hash(es) and subjects (`git log --oneline -n <count>`), and anything left uncommitted.

## Setup (one-time, needs the user)

The repo is wired for [commitlint](https://github.com/conventional-changelog/commitlint) + [husky](https://typicode.github.io/husky/): `commitlint.config.js` and `.husky/commit-msg` exist, but the packages must be installed and the repo must be a git repository for the hook to activate:

```bash
npm install -D @commitlint/cli @commitlint/config-conventional husky
npm pkg set scripts.prepare="husky"
npm run prepare   # points git at .husky (needs `git init` first)
```

Adding dependencies and the `prepare` script changes `package.json`; do it only with the user's go-ahead, and never work around registry authentication errors yourself.

## Rules

- Never use `--no-verify`, `--no-gpg-sign`, `--amend`, `git reset --hard`, or force-push unless the user explicitly asks. If a hook fails, fix the cause and make a **new** commit.
- Never push, tag, or open a PR as part of this skill; offer it afterwards.
- Don't change git config.
- If commitlint or the hook rejects the message, don't bypass it; fix the message.
- Keep subjects specific: `feat(car-list): render one block per car` beats `feat: update components`.

## Examples

```
feat(car-block): add vehicle details and price summary
fix(car-list): keep list semantic when the response is empty
test(car-block): cover formatted price and cancellation policy
docs(adr): record car block and car list decision
chore(skills): add figma-spec extraction skill
build(deps): add @vitest/coverage-v8
refactor(types): split rental rate types from vehicle types
feat(car-block)!: require a Car prop instead of raw JSON

BREAKING CHANGE: CarBlock no longer accepts the response envelope.
```
