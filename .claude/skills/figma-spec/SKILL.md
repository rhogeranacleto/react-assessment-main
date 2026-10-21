---
name: figma-spec
description: Extract a Figma design link into a compact local spec (layout, sizes, colors, typography, borders, radii, shadows, screenshots) mapped to the repo's design-system tokens, saved under docs/design/ so agents can build components without calling Figma again. Use when the user shares a Figma URL, asks to "read/inspect/extract the design", or when building or checking a component against Figma and no local spec exists yet.
---

# figma-spec

Turn a Figma link into a **local, token-annotated spec** once, so every later agent reads a small file instead of calling Figma (which is slow and token-expensive).

Output lives in `docs/design/<file-slug>-<node-id>/` and is committed to the repo:

| File               | Purpose                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `spec.md`          | **Read this.** Used-values tables + a node tree outline with all styling.  |
| `spec.json`        | Same data, machine-readable (full tree, `used` summary, source metadata).  |
| `screenshots/*.png`| Visual reference at 2x. Open only if `spec.md` is ambiguous (costly).      |

## Workflow

### 1. Reuse before fetching

Find the node id in the link (`?node-id=10308-24250` → `10308:24250`). If `docs/design/*-10308-24250/spec.md` already exists, **use it and stop** — don't call Figma — unless the user asks to refresh or says the design changed. `spec.md` records `Last modified` and the file version.

### 2. Extract (pick one path)

**A. REST script (preferred, deterministic).** Needs `FIGMA_TOKEN` (personal access token, file read scope) in the environment or in a git-ignored `.env`. Never print, log, or commit the token. Run from the repo root:

```bash
node --env-file=.env .claude/skills/figma-spec/scripts/extract.mjs "<figma-url>" [--depth 12] [--no-images] [--out <dir>]
npm run format   # generated files must pass Prettier
```

If `FIGMA_TOKEN` is missing, ask the user to create one (Figma → Settings → Security → Personal access tokens) and put it in `.env`; don't ask them to paste it in chat.

**B. Figma MCP (fallback when there is no token).** The `claude.ai Figma` MCP server may need `authenticate` first. Use its design-context / metadata / variable-definitions / screenshot tools on the node, then write `spec.md` by hand in the format below. Map values to tokens yourself (step 3).

### 3. Verify the result

- Open `spec.md` and check the **Used values** tables: colors, spacing, radii, border widths and `.ts-*` typography classes should mostly carry a `(--token)` or class name.
- Entries without a token are real gaps: use the nearest token, and note the deviation in the component's PR/summary. Don't invent hex or px values in components.
- Tokens separated by `/` share one value: choose by semantics (`--text-*` for text, `--bg-fill-*`/`--surface-*` for backgrounds, `--border-*` for borders).
- If the tree is truncated or noisy, re-run with a different `--depth` or a more specific node link (one frame/component per run is best).

### 4. Hand off

Tell the user where the spec is. Any agent building components should be pointed at `spec.md` only; mention in the task prompt: _"Use docs/design/<slug>/spec.md; don't call Figma."_

## spec.md format (for path B, or when reading)

```
# Figma spec: <file> — <node>
- Source / Node / Version / Last modified / Fetched
## Used values
  Colors (value + matching tokens), Spacing/border/radius, Typography, Shadows
## Screenshots
## Node tree        # one bullet per node, children indented
- **Name** [TYPE] "text" size=[w,h] · sizing={"w":"FILL","h":"HUG"} · layout={direction,gap,padding,justify,align}
  · fill=… · color=… · border={color,width,align} · radius=… · effects=[…] · font={…} · typeClass=ts-… · component=… · props={…}
```

Field meanings:

- `size` px `[w,h]` as designed; `sizing` is Figma's resizing (`FIXED` / `HUG` / `FILL`) — translate `FILL` to flex/grid fill and `HUG` to intrinsic size instead of copying fixed px.
- `layout` is Figma auto-layout → flexbox: `direction` row/column, `gap`, `padding`, `justify` (main axis: MIN/CENTER/MAX/SPACE_BETWEEN), `align` (cross axis). Frames without `layout` use `pos` (offset from parent) and `constraints`.
- `fill` is background, `color` is text color; `border.width` maps to `--bw-*`, `radius` to `--br-*`, paddings/gaps to `--space-*`.
- `component` / `props` identify design-system variants (e.g. button type/state) — implement them as component props.
- Responsive: when the node link is a section/page with several frames (mobile/tablet/desktop), each frame is a breakpoint; compare their `size[0]` with `--breakpoint-*` (608/840/1025/1328) and build mobile-first.

## Limits

- Figma **variables** are not resolved by the REST script (only available on some plans). Token mapping is by exact value match against `src/design-system.css`, so renamed/aliased tokens can be ambiguous; confirm with the Figma MCP variable-definitions tool if a mapping looks wrong.
- Vector icons are reported as size + fill only; export SVGs separately if needed.
- Prototype interactions/animations are not captured.
- The script has not been run against a live Figma file in this repo yet; if it errors on a Figma response shape, fix the script rather than working around it by hand.
