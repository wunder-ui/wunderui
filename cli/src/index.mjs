import { mkdir, readFile, writeFile, access } from "node:fs/promises"
import { constants, existsSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { homedir } from "node:os"
import path from "node:path"
import readline from "node:readline/promises"

/**
 * The WunderUI CLI.
 *
 *   wunderui-cli add button badge     free components: source from the public registry
 *                                 (github.com/wunder-ui/wunderui, MIT) with every file
 *                                 they need, their dependencies and, on first use, the
 *                                 WunderUI styles
 *   wunderui-cli add auth/sign-in     a block (WunderUI Pro): source from wunderui.com with
 *                                 a licence key
 *
 * From then on the code is the user's to edit, the same deal as a design template.
 *
 * Three things decide where a licence key comes from, in this order: the --key
 * flag, WUNDERUI_LICENSE_KEY, then ~/.wunderui/config.json written by `login`.
 */

const DEFAULT_REGISTRY = "https://wunderui.com"
/** The free components as shadcn registry items (r/<name>.json). */
const DEFAULT_COMPONENTS = "https://raw.githubusercontent.com/wunder-ui/wunderui/main/r"
const CONFIG_FILE = "wunderui.json"
const GLOBAL_CONFIG = path.join(homedir(), ".wunderui", "config.json")

const DEFAULT_CONFIG = {
  /** Where blocks land, relative to the project root. */
  componentsDir: "components/wunderui",
  /** The import alias that resolves to that directory. */
  alias: "@/components/wunderui",
  registry: DEFAULT_REGISTRY,
  components: DEFAULT_COMPONENTS,
}

/* ------------------------------------------------------------------ output */

const c = {
  bold: (s) => `\u001b[1m${s}\u001b[0m`,
  dim: (s) => `\u001b[2m${s}\u001b[0m`,
  green: (s) => `\u001b[32m${s}\u001b[0m`,
  red: (s) => `\u001b[31m${s}\u001b[0m`,
  cyan: (s) => `\u001b[36m${s}\u001b[0m`,
}

const log = (line = "") => console.log(line)

/* ------------------------------------------------------------------ config */

async function exists(file) {
  try {
    await access(file, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"))
  } catch {
    return null
  }
}

async function projectConfig() {
  const file = path.join(process.cwd(), CONFIG_FILE)
  return { ...DEFAULT_CONFIG, ...((await readJson(file)) ?? {}) }
}

async function storedKey() {
  return (await readJson(GLOBAL_CONFIG))?.licenseKey ?? null
}

async function resolveKey(flags) {
  return flags.key ?? process.env.WUNDERUI_LICENSE_KEY ?? (await storedKey())
}

/* ---------------------------------------------------------------- registry */

async function fetchJson(url, key) {
  const res = await fetch(url, {
    headers: key ? { Authorization: `Bearer ${key}` } : {},
  }).catch(() => null)

  if (!res) throw new Error(`Could not reach the registry at ${url}.`)
  if (res.status === 401) {
    throw new Error(
      "This block is part of WunderUI Pro.\n  Run `wunderui-cli login <key>`, or buy a licence at https://wunderui.com/#pricing."
    )
  }
  if (res.status === 404) throw new Error("No such block. Run `wunderui-cli list` to see what exists.")
  if (!res.ok) throw new Error(`The registry answered ${res.status}.`)
  return res.json()
}

/* -------------------------------------------------------------- components */

/** JSON with comments and trailing commas, as tsconfig files are written. */
function looseJson(raw) {
  try {
    return JSON.parse(raw.replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "").replace(/,(\s*[}\]])/g, "$1"))
  } catch {
    return null
  }
}

/** Where `@/` points in this project: the tsconfig/jsconfig paths, else src/ when it exists, else the root. */
async function sourceRoot() {
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    const raw = await readFile(path.join(process.cwd(), name), "utf8").catch(() => null)
    const json = raw ? looseJson(raw) : null
    const target = json?.compilerOptions?.paths?.["@/*"]?.[0]
    if (target) return path.join(process.cwd(), json.compilerOptions.baseUrl ?? ".", target.replace(/\*$/, ""))
  }
  return (await exists(path.join(process.cwd(), "src"))) ? path.join(process.cwd(), "src") : process.cwd()
}

async function fetchItem(url) {
  const res = await fetch(url).catch(() => null)
  if (!res) throw new Error(`Could not reach the component registry at ${url}.`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`The component registry answered ${res.status} for ${url}.`)
  return res.json()
}

/** Core/Pro components are listed in the public design.json; their source comes with a plan. */
async function knownComponent(registry, name) {
  const data = await fetch(`${registry}/design.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  return data?.components?.find((x) => x.slug.replace(/-/g, "") === key || x.exports?.some((e) => e.toLowerCase() === key)) ?? null
}

function packageManager() {
  const at = (f) => existsSync(path.join(process.cwd(), f))
  if (at("pnpm-lock.yaml")) return "pnpm"
  if (at("yarn.lock")) return "yarn"
  if (at("bun.lockb") || at("bun.lock")) return "bun"
  return "npm"
}

const packageName = (spec) => (spec.startsWith("@") ? spec.split("@").slice(0, 2).join("@") : spec.split("@")[0])

async function missingDependencies(wanted) {
  const pkg = (await readJson(path.join(process.cwd(), "package.json"))) ?? {}
  const have = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }
  return [...new Set(wanted)].filter((spec) => !have[packageName(spec)])
}

async function addComponents(names, flags, config) {
  const root = await sourceRoot()
  const files = new Map()
  const deps = []
  const added = []
  const notFree = []
  const unknown = []
  const queue = names.map((n) => ({ url: `${config.components}/${n.toLowerCase()}.json`, asked: n }))
  const seen = new Set()

  while (queue.length) {
    const { url, asked } = queue.shift()
    if (seen.has(url)) continue
    seen.add(url)
    const item = await fetchItem(url)
    if (!item) {
      if (!asked) continue
      const known = await knownComponent(config.registry, asked)
      if (known) notFree.push(`${asked} (${known.title})`)
      else unknown.push(asked)
      continue
    }
    if (item.type !== "registry:style") added.push(item.title ?? item.name)
    for (const file of item.files ?? []) {
      const rel = file.target ?? file.path
      if (!files.has(rel)) files.set(rel, file.content)
    }
    deps.push(...(item.dependencies ?? []))
    for (const dep of item.registryDependencies ?? []) if (dep.startsWith("http")) queue.push({ url: dep })
  }

  const written = []
  const skipped = []
  let stylesWritten = false
  for (const [rel, content] of files) {
    const target = path.join(root, rel)
    const isStyles = rel === "styles/wunderui.css"
    if (!flags.overwrite && (await exists(target))) {
      if (!isStyles) skipped.push(path.relative(process.cwd(), target))
      continue
    }
    if (!flags["dry-run"]) {
      await mkdir(path.dirname(target), { recursive: true })
      await writeFile(target, content, "utf8")
    }
    if (isStyles) stylesWritten = true
    written.push(path.relative(process.cwd(), target))
  }

  if (added.length) log(`\n  ${c.bold(added.join(", "))}`)
  for (const file of written) log(`    ${c.green("+")} ${file}`)
  for (const file of skipped) log(`    ${c.dim("· skipped (exists)")} ${file}`)
  if (flags["dry-run"]) log(`\n  ${c.dim("Dry run — nothing was written.")}`)
  else if (skipped.length) log(`\n  ${c.dim("Pass --overwrite to replace the skipped files.")}`)

  const missing = await missingDependencies(deps)
  if (missing.length) {
    const pm = packageManager()
    const cmd = [pm === "npm" ? "install" : "add", ...missing]
    if (flags["no-install"] || flags["dry-run"]) {
      log(`\n  Install the dependencies:\n    ${c.cyan(`${pm} ${cmd.join(" ")}`)}`)
    } else {
      log(`\n  ${c.dim(`${pm} ${cmd.join(" ")}`)}`)
      // one quoted command line: Windows needs the shell for npm.cmd, and quotes keep `^` in version ranges
      const result = spawnSync([pm, ...cmd.map((a) => `"${a}"`)].join(" "), { stdio: "inherit", shell: true })
      if (result.status !== 0) log(`  ${c.red("Install failed")} — run it yourself: ${c.cyan(`${pm} ${cmd.join(" ")}`)}`)
    }
  }

  if (stylesWritten) {
    const css = path.relative(process.cwd(), path.join(root, "styles/wunderui.css")).replace(/\\/g, "/")
    const comps = path.relative(process.cwd(), path.join(root, "components")).replace(/\\/g, "/")
    log(`\n  Add the WunderUI styles to your Tailwind entry file, after Tailwind`)
    log(`  ${c.dim("(paths relative to that CSS file):")}`)
    log(`    ${c.cyan('@import "tailwindcss";')}`)
    log(`    ${c.cyan(`@import "<path to ${css}>";`)}`)
    log(`    ${c.cyan(`@source "<path to ${comps}>";`)}`)
  }

  if (notFree.length) {
    log(`\n  ${c.bold("Core / Pro:")} ${notFree.join(", ")}`)
    log(`  ${c.dim("Their source comes with WunderUI Core or Pro — https://wunderui.com/#pricing")}`)
  }
  if (unknown.length) log(`\n  ${c.red("Not found:")} ${unknown.join(", ")} ${c.dim("— run `wunderui-cli list --components` to see every free component.")}`)
  log()
  if (!added.length && (notFree.length || unknown.length)) process.exitCode = 1
}

/* ------------------------------------------------------------- file writing */

/**
 * Block sources import their helpers from the path they had in the docs app.
 * Point them at wherever this project keeps them instead.
 */
function rewriteImports(content, alias) {
  return content.replaceAll("@/components/blocks/shared/", `${alias}/shared/`)
}

async function writeFiles(files, { root, alias, overwrite, dryRun }) {
  const written = []
  const skipped = []

  for (const file of files) {
    const target = path.join(root, file.path)
    if (!overwrite && (await exists(target))) {
      skipped.push(path.relative(process.cwd(), target))
      continue
    }
    if (!dryRun) {
      await mkdir(path.dirname(target), { recursive: true })
      await writeFile(target, rewriteImports(file.content, alias), "utf8")
    }
    written.push(path.relative(process.cwd(), target))
  }

  return { written, skipped }
}

/* ------------------------------------------------------------------ commands */

async function commandInit() {
  const file = path.join(process.cwd(), CONFIG_FILE)
  if (await exists(file)) {
    log(`\n  ${CONFIG_FILE} already exists — nothing to do.\n`)
    return
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const dir = (await rl.question(`  Where should blocks be written? ${c.dim(`(${DEFAULT_CONFIG.componentsDir})`)} `)).trim()
  const alias = (await rl.question(`  Which import alias points there? ${c.dim(`(${DEFAULT_CONFIG.alias})`)} `)).trim()
  rl.close()

  const config = {
    componentsDir: dir || DEFAULT_CONFIG.componentsDir,
    alias: alias || DEFAULT_CONFIG.alias,
    registry: DEFAULT_CONFIG.registry,
  }
  await writeFile(file, `${JSON.stringify(config, null, 2)}\n`, "utf8")

  log(`\n  ${c.green("✓")} Wrote ${c.bold(CONFIG_FILE)}`)
  log(`\n  Next: ${c.cyan("npx wunderui-cli add button")} ${c.dim("— a component with its files, dependencies and the WunderUI styles")}\n`)
}

async function commandLogin(args, flags) {
  const key = args[0] ?? flags.key
  if (!key) throw new Error("Usage: wunderui-cli login <license-key>")

  const { registry } = await projectConfig()
  const res = await fetch(`${registry}/api/license`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licenseKey: key }),
  }).catch(() => null)

  if (!res) throw new Error(`Could not reach ${registry}.`)
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.ok) throw new Error(body?.error ?? "That licence key was not accepted.")

  await mkdir(path.dirname(GLOBAL_CONFIG), { recursive: true })
  await writeFile(GLOBAL_CONFIG, `${JSON.stringify({ licenseKey: key }, null, 2)}\n`, { mode: 0o600 })

  log(`\n  ${c.green("✓")} Signed in${body.customer ? ` as ${c.bold(body.customer)}` : ""}.`)
  log(`  ${c.dim(`Key stored in ${GLOBAL_CONFIG}`)}\n`)
}

async function commandList(_args, flags) {
  const { registry, components } = await projectConfig()
  const free = await fetch(`${components}/index.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
  if (free) {
    let group = null
    log(`\n  ${c.bold("Free components")} ${c.dim("— MIT · wunderui-cli add <name>")}`)
    for (const item of [...free.items].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name))) {
      if (item.group !== group) {
        group = item.group
        log(`  ${c.dim(group)}`)
      }
      log(`    ${c.cyan(item.name)}`)
    }
  }
  if (flags.components) return log()

  const data = await fetchJson(`${registry}/api/registry/index`, null)
  let category = null
  log(`\n  ${c.bold("Blocks")} ${c.dim("— WunderUI Pro · wunderui-cli add <category>/<block>")}`)
  for (const block of data.blocks) {
    if (block.categoryTitle !== category) {
      category = block.categoryTitle
      log(`  ${c.dim(category)}`)
    }
    log(`    ${c.cyan(block.id.padEnd(34))} ${c.dim(`${block.screens.length} screens`)}`)
    if (flags.screens) for (const screen of block.screens) log(`      ${c.dim(screen.slug)}`)
  }
  log(`\n  ${c.dim("wunderui-cli add <id>  ·  --screen <slug> for a single screen")}\n`)
}

async function commandAdd(args, flags) {
  if (!args.length) throw new Error("Usage: wunderui-cli add <component…>  or  wunderui-cli add <category>/<block> [--screen <slug>]")
  if (!args[0].includes("/")) return addComponents(args, flags, await projectConfig())

  const id = args[0]
  const [category, block] = id.split("/")
  if (!category || !block) throw new Error(`"${id}" is not a block id — try e.g. auth/sign-in.`)

  const config = await projectConfig()
  const key = await resolveKey(flags)

  const url = new URL(`${config.registry}/api/registry/block/${category}/${block}`)
  if (flags.screen) url.searchParams.set("screen", flags.screen)

  const data = await fetchJson(url.toString(), key)
  const root = path.join(process.cwd(), flags.path ?? config.componentsDir)

  const result = await writeFiles([...data.files, ...data.shared], {
    root,
    alias: config.alias,
    overwrite: Boolean(flags.overwrite),
    dryRun: Boolean(flags["dry-run"]),
  })

  log(`\n  ${c.bold(data.title)} ${c.dim(`(${data.files.length} screens)`)}`)
  for (const file of result.written) log(`    ${c.green("+")} ${file}`)
  for (const file of result.skipped) log(`    ${c.dim("· skipped (exists)")} ${file}`)

  if (flags["dry-run"]) log(`\n  ${c.dim("Dry run — nothing was written.")}`)
  else if (result.skipped.length) log(`\n  ${c.dim("Pass --overwrite to replace the skipped files.")}`)

  log(`\n  Make sure these are installed:`)
  log(`    ${c.cyan(`npm install ${data.dependencies.join(" ")}`)}\n`)
}

/* ---------------------------------------------------------------- dispatcher */

const HELP = `
  ${c.bold("wunderui-cli")} — add WunderUI components and blocks to your project as source

  ${c.bold("Commands")}
    add <name…>              free components (button, badge, date-picker …) with their files,
                             dependencies and, on first use, the WunderUI styles
    add <category>/<block>   a block (WunderUI Pro, needs a licence key)
    list [--components]      the free components and the blocks
    login <key>              store your licence key for every project
    init                     create ${CONFIG_FILE} in this project

  ${c.bold("Options for add")}
    --overwrite              replace files that already exist
    --dry-run                show what would be written
    --no-install             print the install command instead of running it
    --screen <slug>          a block: only that one screen
    --path <dir>             a block: write somewhere other than the configured folder
    --key <license-key>      a block: use this key instead of the stored one

  ${c.bold("Examples")}
    npx wunderui-cli add button badge input
    npx wunderui-cli list --components
    npx wunderui-cli login WUI-XXXX-XXXX
    npx wunderui-cli add auth/sign-in
`

function parseArgs(argv) {
  const args = []
  const flags = {}
  const BOOLEAN = new Set(["overwrite", "dry-run", "no-install", "components", "screens", "help"])
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith("--")) {
      args.push(token)
      continue
    }
    const name = token.slice(2)
    const next = argv[i + 1]
    if (!BOOLEAN.has(name) && next && !next.startsWith("--")) {
      flags[name] = next
      i++
    } else {
      flags[name] = true
    }
  }
  return { args, flags }
}

const COMMANDS = { init: commandInit, login: commandLogin, list: commandList, add: commandAdd }

export async function run(argv) {
  const { args, flags } = parseArgs(argv)
  const [command, ...rest] = args

  if (!command || flags.help || command === "help") {
    log(HELP)
    return
  }

  const handler = COMMANDS[command]
  if (!handler) {
    log(`\n  ${c.red("Unknown command")} "${command}".`)
    log(HELP)
    process.exitCode = 1
    return
  }

  await handler(rest, flags)
}
