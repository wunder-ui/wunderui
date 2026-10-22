import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

/**
 * Which @wunderui/react is installed: the Free package from npm or the full library (Core/Pro,
 * packed from wunderui-core). The same test as the wunderui-setup skill (scripts/setup.mjs →
 * edition()), so the CLI and the skill always agree:
 *
 *   1. the Free build marks itself: `"wunderuiEdition": "free"` in its package.json
 *   2. 0.1.0 predates the marker: "WunderUI Free" in the description
 *   3. otherwise the typings decide: no DataTable export means Free
 *
 * Returns "free", "full", or null when the folder holds no package.json.
 */
export function packageEdition(dir) {
  let pkg
  try {
    pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"))
  } catch {
    return null
  }
  if (pkg.wunderuiEdition === "free" || /WunderUI Free/i.test(pkg.description ?? "")) return "free"
  const types = path.join(dir, "dist", "index.d.ts")
  if (existsSync(types) && !/\bDataTable\b/.test(readFileSync(types, "utf8"))) return "free"
  return "full"
}
