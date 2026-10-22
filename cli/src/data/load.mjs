import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { CliError } from "../output.mjs"
import { SCHEMA } from "./build.mjs"

/**
 * Where the documentation commands get their data.
 *
 *   --source bundle (default)   data/cli-data.json next to the CLI, written by the build
 *                               (the public wunderui-cli ships the Free edition)
 *   --source monorepo           built in memory from the monorepo's design.json and DESIGN.md,
 *                               all components (the internal Core variant); needs the monorepo
 */

const here = path.dirname(fileURLToPath(import.meta.url))
export const BUNDLE = path.join(here, "..", "..", "data", "cli-data.json")

let cache = null

export async function loadData(flags = {}, { bundle = BUNDLE } = {}) {
  const source = flags.source ?? "bundle"
  if (cache?.key === `${source}:${bundle}`) return cache.value
  let value
  if (source === "monorepo") {
    const [{ loadSources, findRepoRoot }, { buildCliData }] = await Promise.all([import("./sources.mjs"), import("./build.mjs")])
    const root = findRepoRoot()
    if (!root) throw new CliError("DATA_MISSING", "--source monorepo needs the WunderUI monorepo (run it inside a checkout).")
    value = { data: buildCliData(loadSources(root), { edition: "full" }), source: "monorepo" }
  } else if (source === "bundle") {
    if (!existsSync(bundle)) {
      throw new CliError("DATA_MISSING", `The CLI data is missing (${bundle}). In the monorepo run \`npm run build:data --workspace=@wunderui/cli\` or pass --source monorepo.`)
    }
    let data
    try {
      data = JSON.parse(readFileSync(bundle, "utf8"))
    } catch (error) {
      throw new CliError("DATA_MISSING", `The CLI data could not be read: ${error.message}`)
    }
    if (data.schema !== SCHEMA) throw new CliError("DATA_MISSING", `The CLI data has schema ${data.schema}, this CLI reads ${SCHEMA}. Reinstall wunderui-cli.`)
    value = { data, source: "bundle" }
  } else {
    throw new CliError("USAGE", `--source is bundle or monorepo, not "${source}".`)
  }
  cache = { key: `${source}:${bundle}`, value }
  return value
}

/** "Date Picker", "date-picker", "DatePicker", "datepicker" → "datepicker". */
export const keyOf = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")

/** A component by slug, title or any of its export names. */
export function findComponent(data, name) {
  const k = keyOf(name)
  if (!k) return null
  return (
    data.components.find((c) => keyOf(c.slug) === k || keyOf(c.title) === k) ??
    data.components.find((c) => c.exports.some((e) => keyOf(e) === k)) ??
    null
  )
}
