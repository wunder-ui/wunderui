#!/usr/bin/env node
/**
 * Builds the npm package @wunderui/react (WunderUI Free) from this repository.
 *
 *   npm run build:package                 (= node package/build.mjs)
 *   node package/build.mjs --out <dir>    stage the package somewhere else (default: package/out)
 *
 * Everything it reads is in this repository: components/, lib/ and styles/wunderui.css (the free
 * source), package/index.ts (the entry point), package/package.base.json (name, version and metadata),
 * package/design.json and package/figma-map.json (the agent context of the free components),
 * package/THIRD-PARTY-NOTICES.md and package/pro-export-names.json (the export names of the paid
 * WunderUI components, which must never appear in this package).
 *
 * Steps
 *   1. Source: copies components/, lib/, styles/wunderui.css and package/index.ts to package/.build/src.
 *   2. Build: tsup (ESM, d.ts, source maps, "use client" banner) into <out>/dist, plus dist/styles.css.
 *   3. Package: package.json (dependencies computed from the imports, ranges from the root
 *      package.json), README, LICENSE, THIRD-PARTY-NOTICES.md, design.json, figma-map.json.
 *   4. Verify: fails when any shipped file uses a name from pro-export-names.json, or when a free
 *      component export is missing from the typings.
 *
 * This file is generated from the WunderUI source (scripts/free-package/build.mjs) with every release.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const pkgDir = dirname(fileURLToPath(import.meta.url))
const root = resolve(pkgDir, "..")
const buildDir = join(pkgDir, ".build")
const stageSrc = join(buildDir, "src")
const outArg = process.argv.indexOf("--out")
const outDir = outArg > 0 ? resolve(process.argv[outArg + 1]) : join(pkgDir, "out")
const posix = (p) => p.replace(/\\/g, "/")
const json = (o) => JSON.stringify(o, null, 2) + "\n"
const readJson = (f) => JSON.parse(readFileSync(f, "utf8"))
const step = (s) => console.log(`\n▸ ${s}`)
const fail = (msg) => {
  console.error(`\n✖ ${msg}`)
  process.exit(1)
}

const base = readJson(join(pkgDir, "package.base.json"))
const rootPkg = readJson(join(root, "package.json"))
const design = readJson(join(pkgDir, "design.json"))
const free = design.components
const freeExports = new Set(free.flatMap((c) => c.exports))
/** Export names of the paid (Core/Pro) components: none of them may appear in the package. */
const paidNames = new Set(readJson(join(pkgDir, "pro-export-names.json")))
for (const n of freeExports) if (paidNames.has(n)) fail(`${n} is both a free export and in pro-export-names.json`)

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/** Value and type names a source file exports. */
function exportedNames(code) {
  const names = new Set()
  for (const m of code.matchAll(/export\s+(?:default\s+)?(?:declare\s+)?(?:async\s+)?(?:function|const|let|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1])
  for (const m of code.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g))
    for (const part of m[1].split(",")) {
      const p = part.trim().replace(/^type\s+/, "")
      if (p) names.add(p.split(/\s+as\s+/).pop().trim())
    }
  return names
}

const IMPORT_RE = /(?:import|export)\s[^"']*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|@import\s+["']([^"']+)["']/g
const pkgOf = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0])
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")

/* --------------------------------------------------------------- 1. source */

step("Free source tree")
rmSync(buildDir, { recursive: true, force: true })
mkdirSync(stageSrc, { recursive: true })
for (const d of ["components", "lib"]) cpSync(join(root, d), join(stageSrc, d), { recursive: true })
cpSync(join(root, "styles/wunderui.css"), join(stageSrc, "styles.css"))
cpSync(join(pkgDir, "index.ts"), join(stageSrc, "index.ts"))
// the free source never exports a paid component (the export stops before that); checked again here
for (const f of walk(stageSrc).filter((f) => /\.tsx?$/.test(f))) {
  const paid = [...exportedNames(readFileSync(f, "utf8"))].filter((n) => paidNames.has(n))
  if (paid.length) fail(`${posix(relative(stageSrc, f))} exports Core/Pro names: ${paid.join(", ")}`)
}
writeFileSync(join(buildDir, "tsconfig.json"), json({
  compilerOptions: {
    target: "ES2020", lib: ["dom", "dom.iterable", "ES2020"], jsx: "react-jsx", module: "ESNext", moduleResolution: "bundler",
    strict: true, esModuleInterop: true, skipLibCheck: true, forceConsistentCasingInFileNames: true, resolveJsonModule: true,
    isolatedModules: true, noEmit: true, declaration: true, baseUrl: ".", paths: { "@/*": ["./src/*"] },
  },
  include: ["src"],
}))

// dependencies the source really imports (styles.css @imports tw-animate-css)
const ranges = { ...rootPkg.dependencies }
const external = new Set()
for (const f of walk(stageSrc)) for (const m of stripComments(readFileSync(f, "utf8")).matchAll(IMPORT_RE)) {
  const spec = m[1] ?? m[2] ?? m[3]
  if (!spec.startsWith(".") && !spec.startsWith("@/")) external.add(pkgOf(spec))
}
const peers = Object.keys(base.peerDependencies)
const deps = {}
for (const p of [...external].filter((p) => !peers.includes(p) && p !== "tailwindcss").sort()) {
  if (!ranges[p]) fail(`the source imports ${p}, which the root package.json does not list in dependencies`)
  deps[p] = ranges[p]
}
console.log(`dependencies (${Object.keys(deps).length}): ${Object.keys(deps).join(", ")}`)

/* ---------------------------------------------------------------- 2. build */

step("tsup build")
rmSync(outDir, { recursive: true, force: true })
const { build } = await import("tsup")
// tsup names its output after the nearest package.json: "type": "module" gives index.js / index.d.ts
writeFileSync(join(buildDir, "package.json"), json({ name: "wunderui-free-build", private: true, type: "module" }))
const prevCwd = process.cwd()
process.chdir(buildDir)
try {
  await build({
    config: false,
    entry: { index: join(stageSrc, "index.ts") },
    outDir: join(outDir, "dist"),
    tsconfig: join(buildDir, "tsconfig.json"),
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    // the rich text editor's Tiptap chunk loads lazily
    splitting: true,
    external: [...peers, "tailwindcss", ...Object.keys(deps)].map((p) => new RegExp(`^${escapeRe(p)}(?:/|$)`)),
    banner: { js: '"use client"' },
  })
} catch (e) {
  fail(`tsup build failed: ${e?.message ?? e}`)
} finally {
  process.chdir(prevCwd)
}
cpSync(join(stageSrc, "styles.css"), join(outDir, "dist/styles.css"))

/* -------------------------------------------------------------- 3. package */

step("Package files")
const files = ["dist", "README.md", "LICENSE", "THIRD-PARTY-NOTICES.md", "design.json", "figma-map.json"]
writeFileSync(join(outDir, "package.json"), json({
  name: base.name,
  version: base.version,
  description: base.description,
  keywords: base.keywords,
  homepage: base.homepage,
  // npm provenance checks this against the repository the publish workflow runs in
  repository: base.repository,
  bugs: base.bugs,
  author: base.author,
  license: base.license,
  type: "module",
  sideEffects: base.sideEffects,
  engines: base.engines,
  publishConfig: { access: "public", provenance: true },
  main: "./dist/index.js",
  module: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" }, "./styles.css": "./dist/styles.css" },
  files,
  peerDependencies: base.peerDependencies,
  dependencies: deps,
  // read by the wunderui-setup skill: this package is the Free edition, not the Core/Pro library
  wunderuiEdition: "free",
}))

const site = base.homepage
writeFileSync(join(outDir, "README.md"), `# @wunderui/react — WunderUI Free

The free components of [WunderUI](${site}), a design system and React component library built on
[Base UI](https://base-ui.com) and Tailwind CSS v4: ${free.length} components (buttons, inputs, selects,
dialogs, tables, tabs, calendar, date picker and more) with a matching Figma library, all driven by one
set of design tokens, light and dark. MIT licence.

This package contains the **Free** components only. WunderUI **Core** and **Pro** (charts, data tables,
AI and agent components, UI blocks and templates) come with a plan on [wunderui.com](${site}/#pricing)
and are not part of this package.

- Docs & live examples: ${site}/components
- Source of the free components: ${base.repository.url.replace(/^git\+/, "").replace(/\.git$/, "")}

## Install

\`\`\`bash
npm install @wunderui/react
\`\`\`

Peer dependencies: \`react\` / \`react-dom\` 19 and \`tailwindcss\` 4.

## Styles

Import the tokens after your Tailwind entry point and let Tailwind scan the package's compiled
output for the utility classes the components use:

\`\`\`css
/* app/globals.css */
@import "tailwindcss";
@import "@wunderui/react/styles.css";
@source "../node_modules/@wunderui/react/dist";
\`\`\`

\`styles.css\` defines the light and dark token sets. Dark mode is class-based: add \`class="dark"\` to
\`<html>\` or use the exported \`ThemeProvider\` (wraps \`next-themes\`).

## Use

\`\`\`tsx
import { Button, Card, CardHeader, CardTitle, Badge } from "@wunderui/react"

export function Example() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <Badge color="green">Paid</Badge>
      </CardHeader>
      <Button variant="primary">Download</Button>
    </Card>
  )
}
\`\`\`

All components are client components (\`"use client"\` is baked into the build) and work in Next.js
App Router, Vite, Remix and any other React 19 setup.

## For AI agents

\`design.json\` (in this package) lists every free component with its exports, props and an example;
\`figma-map.json\` maps the Figma component sets to the React components.

## License

MIT — see \`LICENSE\`. WunderUI Core and Pro, the UI blocks, templates and the full Figma library are a
separate, paid product (${site}/#pricing) and are not part of this package.
`)

cpSync(join(root, "LICENSE"), join(outDir, "LICENSE"))

// third-party notices: only the packages this package installs
const notices = readFileSync(join(pkgDir, "THIRD-PARTY-NOTICES.md"), "utf8")
const [head, texts = ""] = notices.split(/\n## Licence texts\n/)
const keepRow = (l) => !/^\| \[/.test(l) || deps[l.match(/^\| \[([^\]]+)\]/)[1]]
const licenceTexts = texts.split(/\n(?=### )/).filter((s) => deps[s.match(/^### (\S+)/)?.[1]])
writeFileSync(join(outDir, "THIRD-PARTY-NOTICES.md"), `${head.split("\n").filter(keepRow).join("\n").trimEnd()}

## Licence texts

${licenceTexts.map((s) => s.trim()).join("\n\n")}
`)
const missingNotice = Object.keys(deps).filter((d) => !licenceTexts.some((s) => s.startsWith(`### ${d} `)))
if (missingNotice.length) fail(`THIRD-PARTY-NOTICES.md has no licence text for ${missingNotice.join(", ")}`)

cpSync(join(pkgDir, "design.json"), join(outDir, "design.json"))
cpSync(join(pkgDir, "figma-map.json"), join(outDir, "figma-map.json"))
const dts = readFileSync(join(outDir, "dist/index.d.ts"), "utf8")
const shipped = exportedNames(dts)

/* --------------------------------------------------------------- 4. verify */

step("Verify: no Core/Pro component in the package")
// Code (js, d.ts, css, the sources inside the source maps) is checked without its comments: a comment like
// "opens like the DropdownMenu" is prose, an identifier is not. JSON is checked field by field: export lists
// exactly, code fields (props, example …) by word, display names (title "Number Stepper", Figma set names) not.
const leaks = []
const paidRe = new RegExp(`\\b(${[...paidNames].map(escapeRe).join("|")})\\b`, "g")
const codeHits = (code) => [...new Set([...stripComments(code).matchAll(paidRe)].map((m) => m[1]))]
const PROSE = new Set(["title", "description", "group", "category", "page", "set", "note", "name", "docs", "available", "more"])
function jsonHits(node, key, out) {
  if (typeof node === "string") {
    if (!PROSE.has(key)) for (const n of codeHits(node)) out.add(n)
  } else if (Array.isArray(node)) {
    for (const v of node) if (typeof v === "string" && ["exports", "components", "uses"].includes(key)) { if (paidNames.has(v)) out.add(v) } else jsonHits(v, key, out)
  } else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) jsonHits(v, k, out)
  return out
}
const shippedFiles = walk(outDir)
for (const f of shippedFiles) {
  const rel = posix(relative(outDir, f))
  const raw = readFileSync(f, "utf8")
  let hits = []
  if (f.endsWith(".map")) hits = [...new Set((JSON.parse(raw).sourcesContent ?? []).flatMap((s) => codeHits(s ?? "")))]
  else if (f.endsWith(".json")) hits = [...jsonHits(JSON.parse(raw), "", new Set())]
  else if (/\.(js|ts|css)$/.test(f)) hits = codeHits(raw)
  else if (f.endsWith(".md")) hits = [...new Set([...raw.matchAll(/`[^`]+`|```[\s\S]*?```/g)].flatMap((m) => codeHits(m[0])))]
  for (const n of hits) leaks.push(`${rel}: ${n}`)
}
// the shipped JS must also not define anything under a paid name (also in strings, e.g. displayName)
for (const f of shippedFiles.filter((f) => f.endsWith(".js")))
  for (const m of readFileSync(f, "utf8").matchAll(/(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)|displayName\s*=\s*["']([^"']+)["']/g))
    if (paidNames.has(m[1] ?? m[2])) leaks.push(`${posix(relative(outDir, f))}: defines ${m[1] ?? m[2]}`)
// design.json lists a few types that no source file exports (AvatarColor …); only names the source defines count
const inSource = new Set(walk(stageSrc).filter((f) => /\.tsx?$/.test(f) && !f.endsWith("index.ts")).flatMap((f) => [...exportedNames(readFileSync(f, "utf8"))]))
const missingFree = [...freeExports].filter((n) => inSource.has(n) && !shipped.has(n))
console.log(`checked ${shippedFiles.length} files against ${paidNames.size} Core/Pro export names: ${leaks.length} hit(s)`)
console.log(`free component exports in index.d.ts: ${freeExports.size - missingFree.length} of ${freeExports.size}${missingFree.length ? ` (missing: ${missingFree.join(", ")})` : ""}`)
if (leaks.length) fail(`Core/Pro names in the free package:\n  ${leaks.join("\n  ")}`)
if (missingFree.length) fail("free component exports are missing from the package")
console.log(`\n✔ ${posix(relative(process.cwd(), outDir)) || "."} ready: ${base.name}@${base.version} (Free, ${free.length} components)`)
