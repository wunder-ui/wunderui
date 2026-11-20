import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Reads the sources of the CLI data inside the WunderUI monorepo. Only the build
 * (`npm run build:data`, scripts/export-oss-free.mjs) and `--source monorepo` use this; the
 * published CLI reads the bundle in data/ instead.
 */

const here = path.dirname(fileURLToPath(import.meta.url))

const isRepo = (dir) => existsSync(path.join(dir, "packages", "mcp", "data", "design.json")) && existsSync(path.join(dir, "packages", "cli", "content"))

/** The monorepo root: from the working directory upwards, then from this file upwards. */
export function findRepoRoot(start = process.cwd()) {
  for (const from of [start, here]) {
    let dir = path.resolve(from)
    for (;;) {
      if (isRepo(dir)) return dir
      const up = path.dirname(dir)
      if (up === dir) break
      dir = up
    }
  }
  return null
}

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"))

/**
 * The redesigned blocks (apps/docs/lib/blocks-v2.ts): the blocks come from the generated JSON, the category
 * titles from the CATEGORIES list of the TS module (it uses "@/" imports, so it is read as text). A block's
 * variants are its screens.
 */
function loadBlockCategories(root) {
  const json = path.join(root, "apps", "docs", "lib", "generated", "blocks-v2.json")
  const ts = path.join(root, "apps", "docs", "lib", "blocks-v2.ts")
  if (!existsSync(json) || !existsSync(ts)) return []
  const blocks = JSON.parse(readFileSync(json, "utf8")).blocks
  const categories = [...readFileSync(ts, "utf8").matchAll(/{ slug: "([a-z]+)", title: "([^"]+)"/g)].map(([, slug, title]) => ({ slug, title }))
  return categories
    .map((c) => ({
      ...c,
      blocks: blocks
        .filter((b) => b.category === c.slug)
        .sort((x, y) => x.title.localeCompare(y.title, "en", { sensitivity: "base" }))
        .map((b) => ({ slug: b.slug, title: b.title, description: b.description, screens: b.variants.map((v) => ({ slug: v.file, title: v.title, uses: v.uses })) })),
    }))
    .filter((c) => c.blocks.length)
}

export function loadContent(dir) {
  const playbookDir = path.join(dir, "playbooks")
  const playbooks = existsSync(playbookDir)
    ? readdirSync(playbookDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => readJson(path.join(playbookDir, f)))
    : []
  const docsDir = path.join(dir, "docs")
  const files = {}
  if (existsSync(docsDir)) for (const f of readdirSync(docsDir)) if (f.endsWith(".md")) files[f] = readFileSync(path.join(docsDir, f), "utf8")
  const opt = (f) => (existsSync(path.join(dir, f)) ? readJson(path.join(dir, f)) : {})
  return { playbooks, files, a11y: opt("a11y.json"), synonyms: opt("synonyms.json"), topics: opt("topics.json").topics ?? [] }
}

export function loadSources(root = findRepoRoot()) {
  if (!root) throw new Error("Not inside the WunderUI monorepo (packages/mcp/data/design.json not found).")
  const data = path.join(root, "packages", "mcp", "data")
  return {
    root,
    design: readJson(path.join(data, "design.json")),
    designMd: readFileSync(path.join(data, "DESIGN.md"), "utf8").replace(/\r\n/g, "\n"),
    blockCategories: loadBlockCategories(root),
    content: loadContent(path.join(root, "packages", "cli", "content")),
  }
}
