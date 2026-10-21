#!/usr/bin/env node
// Fetch a Figma node through the REST API and write a compact, token-annotated
// spec (spec.md + spec.json + screenshots) that agents can use without Figma.
//
// Usage (from the repo root):
//   node --env-file=.env .claude/skills/figma-spec/scripts/extract.mjs <figma-url> \
//     [--out <dir>] [--depth <n>] [--no-images]
//
// Requires FIGMA_TOKEN (a personal access token with file read scope).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OPTS_WITH_VALUE = ["--out", "--depth"];
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const url = args.find(
  (a, i) => !a.startsWith("--") && !OPTS_WITH_VALUE.includes(args[i - 1]),
);
const maxDepth = Number(opt("--depth", 12));
const withImages = !args.includes("--no-images");
const token = process.env.FIGMA_TOKEN;

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

if (!url) fail("Usage: extract.mjs <figma-url> [--out <dir>] [--depth <n>] [--no-images]");
if (!token) fail("FIGMA_TOKEN is not set. Use: node --env-file=.env extract.mjs <url>");

const parsed = new URL(url);
const [, , fileKey, fileNameRaw = "figma"] = parsed.pathname.split("/");
const nodeId = parsed.searchParams.get("node-id")?.replace(/-/g, ":");
if (!fileKey || !nodeId) fail("The URL must contain a file key and a ?node-id=… parameter.");

const slugify = (s) =>
  decodeURIComponent(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const slug = `${slugify(fileNameRaw)}-${nodeId.replace(/[:;]/g, "-")}`;
const outDir = opt("--out", path.join("docs", "design", slug));

const r = (n) => Math.round(n * 100) / 100;

async function api(p) {
  const res = await fetch(`https://api.figma.com${p}`, {
    headers: { "X-Figma-Token": token },
  });
  if (!res.ok) fail(`Figma API ${res.status} for ${p}: ${await res.text()}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Design-system lookup: map raw values to the tokens in src/design-system.css
// ---------------------------------------------------------------------------

async function loadDesignSystem() {
  const css = await readFile("src/design-system.css", "utf8").catch(() => "");
  const colors = new Map();
  for (const [, name, body] of css.matchAll(/(--[\w-]+):\s*(rgba?\([^)]*\))\s*;/g)) {
    const [R, G, B, A = 1] = body.match(/[\d.]+/g).map(Number);
    const key = [R, G, B, r(A)].join(",");
    colors.set(key, [...(colors.get(key) ?? []), name]);
  }
  const lengths = { space: new Map(), bw: new Map(), br: new Map() };
  for (const [, name, group, rem] of css.matchAll(/(--(space|bw|br)-[\w-]+):\s*([\d.]+)rem/g)) {
    lengths[group].set(r(Number(rem) * 16), name);
  }
  const weights = {};
  for (const [, k, v] of css.matchAll(/--font-weight-(\w+):\s*(\d+)/g)) weights[k] = Number(v);
  const type = [];
  for (const [, name, body] of css.matchAll(/\.(ts-[\w-]+)\s*\{([^}]*)\}/g)) {
    const size = body.match(/font-size:\s*([\d.]+)rem/);
    const lh = body.match(/line-height:\s*([\d.]+)(px|rem)?/);
    const w = body.match(/font-weight:\s*(?:var\(--font-weight-(\w+)\)|(\d+))/);
    if (!size || !lh || !w) continue;
    const px = Number(size[1]) * 16;
    const lhPx = !lh[2] ? Number(lh[1]) * px : lh[2] === "rem" ? Number(lh[1]) * 16 : Number(lh[1]);
    type.push({ name, size: r(px), lh: lhPx, weight: w[1] ? weights[w[1]] : Number(w[2]) });
  }
  return { colors, lengths, type, loaded: css.length > 0 };
}

const ds = await loadDesignSystem();
if (!ds.loaded) console.warn("warning: src/design-system.css not found; tokens will not be mapped (run from the repo root).");

const ROLE_PREFIXES = {
  text: ["--text-", "--price-", "--link-", "--ratings-"],
  fill: ["--bg-", "--surface-", "--container-", "--button-", "--background-"],
  stroke: ["--border-"],
};

const used = { colors: new Map(), lengths: new Map(), type: new Map(), shadows: new Set() };
const bump = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);

function color(c, role, extra = 1) {
  const a = r((c.a ?? 1) * extra);
  const [R, G, B] = [c.r, c.g, c.b].map((v) => Math.round(v * 255));
  const css = a < 1 ? `rgba(${R}, ${G}, ${B}, ${a})` : `#${[R, G, B].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  const all = ds.colors.get([R, G, B, a].join(",")) ?? [];
  const hinted = all.filter((n) => ROLE_PREFIXES[role]?.some((p) => n.startsWith(p)));
  const tokens = (hinted.length ? hinted : all).slice(0, 4);
  const label = tokens.length ? `${css} (${tokens.join(" / ")})` : css;
  bump(used.colors, label);
  return label;
}

function len(group, value) {
  const px = r(value);
  const token = ds.lengths[group].get(px);
  const label = `${px}px${token ? ` (${token})` : ""}`;
  if (px !== 0) bump(used.lengths, `${group}: ${label}`);
  return label;
}

function paint(p, role) {
  if (p.visible === false) return null;
  if (p.type === "SOLID") return color(p.color, role, p.opacity ?? 1);
  if (p.type.startsWith("GRADIENT")) {
    const stops = p.gradientStops.map((s) => `${color(s.color, role)} ${r(s.position * 100)}%`);
    return `${p.type.toLowerCase().replace("_", "-")}(${stops.join(", ")})`;
  }
  if (p.type === "IMAGE") return `image(${p.scaleMode ?? "FILL"})`;
  return p.type;
}

const GRAPHIC_TYPES = new Set(["VECTOR", "BOOLEAN_OPERATION", "STAR", "LINE", "ELLIPSE", "POLYGON"]);

// ---------------------------------------------------------------------------
// Node simplification
// ---------------------------------------------------------------------------

let components = {};

function simplify(n, parent, depth) {
  if (n.visible === false) return null;
  const o = { id: n.id, name: n.name, type: n.type };
  const box = n.absoluteBoundingBox;
  const auto = Boolean(n.layoutMode && n.layoutMode !== "NONE");

  if (box) o.size = [r(box.width), r(box.height)];
  if (box && parent.box && !parent.auto) o.pos = [r(box.x - parent.box.x), r(box.y - parent.box.y)];
  if (n.layoutSizingHorizontal || n.layoutSizingVertical) {
    o.sizing = { w: n.layoutSizingHorizontal, h: n.layoutSizingVertical };
  }
  for (const k of ["minWidth", "maxWidth", "minHeight", "maxHeight"]) if (n[k] != null) o[k] = r(n[k]);
  if (n.layoutPositioning === "ABSOLUTE") o.absolute = true;
  if (!parent.auto && n.constraints) o.constraints = n.constraints;

  if (auto) {
    const padding = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].map((k) => len("space", n[k] ?? 0));
    o.layout = {
      direction: n.layoutMode === "HORIZONTAL" ? "row" : "column",
      justify: n.primaryAxisAlignItems ?? "MIN",
      align: n.counterAxisAlignItems ?? "MIN",
    };
    if (n.layoutWrap === "WRAP") o.layout.wrap = true;
    if (n.itemSpacing) o.layout.gap = len("space", n.itemSpacing);
    if (n.counterAxisSpacing) o.layout.rowGap = len("space", n.counterAxisSpacing);
    if (padding.some((p) => !p.startsWith("0px"))) {
      o.layout.padding = padding.every((p) => p === padding[0]) ? padding[0] : padding;
    }
  }
  if (n.clipsContent) o.clip = true;
  if (n.opacity != null && n.opacity < 1) o.opacity = r(n.opacity);

  const fills = (n.fills ?? []).map((p) => paint(p, n.type === "TEXT" ? "text" : "fill")).filter(Boolean);
  if (fills.length) o[n.type === "TEXT" ? "color" : "fill"] = fills.length === 1 ? fills[0] : fills;

  const strokes = (n.strokes ?? []).map((p) => paint(p, "stroke")).filter(Boolean);
  if (strokes.length) {
    const w = n.individualStrokeWeights;
    o.border = {
      color: strokes.length === 1 ? strokes[0] : strokes,
      width: w
        ? { top: len("bw", w.top), right: len("bw", w.right), bottom: len("bw", w.bottom), left: len("bw", w.left) }
        : len("bw", n.strokeWeight ?? 0),
      align: n.strokeAlign,
    };
    if (n.strokeDashes?.length) o.border.dashes = n.strokeDashes;
  }

  if (n.rectangleCornerRadii) o.radius = n.rectangleCornerRadii.map((v) => len("br", v));
  else if (n.cornerRadius) o.radius = len("br", n.cornerRadius);

  const effects = (n.effects ?? [])
    .filter((e) => e.visible !== false)
    .map((e) => {
      if (!e.type.includes("SHADOW")) return `${e.type} ${r(e.radius)}px`;
      const s = `${e.type === "INNER_SHADOW" ? "inset " : ""}${r(e.offset.x)}px ${r(e.offset.y)}px ${r(e.radius)}px ${r(e.spread ?? 0)}px ${color(e.color, "fill")}`;
      used.shadows.add(s);
      return s;
    });
  if (effects.length) o.effects = effects;

  if (n.type === "TEXT") {
    const s = n.style ?? {};
    o.text = n.characters;
    o.font = {
      family: s.fontFamily,
      weight: s.fontWeight,
      size: r(s.fontSize),
      lineHeight: r(s.lineHeightPx),
    };
    if (s.letterSpacing) o.font.letterSpacing = r(s.letterSpacing);
    if (s.textAlignHorizontal && s.textAlignHorizontal !== "LEFT") o.font.align = s.textAlignHorizontal;
    if (s.textCase && s.textCase !== "ORIGINAL") o.font.case = s.textCase;
    if (s.textDecoration && s.textDecoration !== "NONE") o.font.decoration = s.textDecoration;
    const classes = ds.type.filter(
      (t) => t.size === o.font.size && t.weight === s.fontWeight && Math.abs(t.lh - s.lineHeightPx) < 0.5,
    );
    o.typeClass = classes.length ? classes.map((c) => c.name).join(" / ") : "no matching .ts-* class";
    bump(used.type, `${o.typeClass} — ${o.font.family} ${o.font.size}/${o.font.lineHeight} w${o.font.weight}`);
  }

  if (n.type === "INSTANCE") {
    o.component = components[n.componentId]?.name ?? n.componentId;
    if (n.componentProperties) {
      o.props = Object.fromEntries(Object.entries(n.componentProperties).map(([k, v]) => [k, v.value]));
    }
  }

  if (!GRAPHIC_TYPES.has(n.type) && depth < maxDepth) {
    const children = (n.children ?? []).map((c) => simplify(c, { box, auto }, depth + 1)).filter(Boolean);
    if (children.length) o.children = children;
  }
  return o;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function renderNode(n, indent = 0) {
  const skip = new Set(["id", "name", "type", "children", "text"]);
  const rest = Object.entries(n)
    .filter(([k]) => !skip.has(k))
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(" · ");
  const text = n.text != null ? ` "${n.text.replace(/\n/g, "\\n")}"` : "";
  const line = `${"  ".repeat(indent)}- **${n.name}** [${n.type}]${text} ${rest}`.trimEnd();
  return [line, ...(n.children ?? []).flatMap((c) => renderNode(c, indent + 1))];
}

const table = (title, header, map) => {
  const rows = [...map.entries()].sort((a, b) => b[1] - a[1]);
  if (!rows.length) return "";
  return `### ${title}\n\n| ${header} | Uses |\n| --- | --- |\n${rows.map(([k, c]) => `| ${k} | ${c} |`).join("\n")}\n\n`;
};

async function downloadScreenshots(root) {
  const frames = (root.children ?? [])
    .filter((c) => ["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE", "SECTION"].includes(c.type))
    .slice(0, 8);
  const targets = [root, ...frames];
  const { images = {} } = await api(
    `/v1/images/${fileKey}?ids=${encodeURIComponent(targets.map((t) => t.id).join(","))}&format=png&scale=2`,
  );
  await mkdir(path.join(outDir, "screenshots"), { recursive: true });
  const saved = [];
  for (const t of targets) {
    if (!images[t.id]) continue;
    const res = await fetch(images[t.id]);
    if (!res.ok) continue;
    const file = `screenshots/${t.id.replace(/[:;]/g, "-")}-${slugify(t.name) || "node"}.png`;
    await writeFile(path.join(outDir, file), Buffer.from(await res.arrayBuffer()));
    saved.push({ file, name: t.name, size: t.size });
  }
  return saved;
}

const data = await api(`/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`);
const entry = data.nodes?.[nodeId];
if (!entry?.document) fail(`Node ${nodeId} not found in file ${fileKey}.`);
components = entry.components ?? {};

const tree = simplify(entry.document, { box: null, auto: true }, 0);
await mkdir(outDir, { recursive: true });

let screenshots = [];
if (withImages) {
  screenshots = await downloadScreenshots(tree).catch((e) => {
    console.warn(`warning: screenshots skipped (${e.message})`);
    return [];
  });
}

const source = {
  url,
  fileKey,
  fileName: data.name,
  nodeId,
  lastModified: data.lastModified,
  version: data.version,
  fetchedAt: new Date().toISOString(),
};

const usedJson = {
  colors: Object.fromEntries(used.colors),
  lengths: Object.fromEntries(used.lengths),
  typography: Object.fromEntries(used.type),
  shadows: [...used.shadows],
};

await writeFile(path.join(outDir, "spec.json"), `${JSON.stringify({ source, used: usedJson, screenshots, tree }, null, 2)}\n`);

const md = `# Figma spec: ${data.name} — ${tree.name}

Generated by the \`figma-spec\` skill. Do not edit by hand; re-run the extractor.

- Source: ${url}
- Node: \`${nodeId}\` · File version: \`${data.version}\` · Last modified: ${data.lastModified}
- Fetched: ${source.fetchedAt}
- Units are px. Values followed by \`(--token)\` match a design-system token in \`src/design-system.css\`; no token means no exact match (use the nearest token and flag it). Several tokens separated by \`/\` share the same value: pick by semantics.

## Used values

${table("Colors", "Color (matching tokens)", used.colors)}${table("Spacing, border width, radius", "Value", used.lengths)}${table("Typography", "Class — font", used.type)}${used.shadows.size ? `### Shadows\n\n${[...used.shadows].map((s) => `- ${s}`).join("\n")}\n\n` : ""}${screenshots.length ? `## Screenshots\n\n${screenshots.map((s) => `- \`${s.file}\` — ${s.name}`).join("\n")}\n\n` : ""}## Node tree

${renderNode(tree).join("\n")}
`;
await writeFile(path.join(outDir, "spec.md"), md);

console.log(`Wrote ${path.join(outDir, "spec.md")} and spec.json${screenshots.length ? ` (+${screenshots.length} screenshots)` : ""}.`);
console.log("Run `npm run format` so Prettier accepts the generated files.");
