import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { spawnSync } from "node:child_process"
import { homedir } from "node:os"
import path from "node:path"
import { packageEdition } from "../edition.mjs"
import { CliError, createOutput } from "../output.mjs"

/**
 * wunderui-cli doctor — checks a project that uses WunderUI and says how to fix what is wrong.
 *
 * Every check returns { id, title, status: "ok" | "warn" | "fail" | "skip", detail, fix?, patch? }.
 * A `patch` is a safe, mechanical change (an import line, an MCP entry): --fix prints it,
 * --fix --write applies it. Nothing is changed without --write. Exit code 1 when a check fails.
 *
 * Offline tolerant: the only network call is `npm view` for the latest version, skipped with
 * --offline and reported as "skip" when npm cannot answer.
 */

const IGNORE = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "coverage", ".turbo", ".vercel", ".cache", ".wunderui"])
const posix = (p) => p.replace(/\\/g, "/")

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"))
  } catch {
    return null
  }
}

function walk(dir, test, { depth = 0, max = 6, acc = [], limit = 2000 } = {}) {
  if (depth > max || acc.length >= limit) return acc
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return acc
  }
  for (const e of entries) {
    if (acc.length >= limit) break
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (!IGNORE.has(e.name) && !e.name.startsWith(".")) walk(p, test, { depth: depth + 1, max, acc, limit })
    } else if (test(p)) acc.push(p)
  }
  return acc
}

const major = (v) => {
  const m = String(v ?? "").match(/(\d+)\.(\d+)?/)
  return m ? Number(m[1]) : null
}

function compareVersions(a, b) {
  const pa = String(a).split(/[.-]/).map((x) => Number.parseInt(x, 10) || 0)
  const pb = String(b).split(/[.-]/).map((x) => Number.parseInt(x, 10) || 0)
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0)
  return 0
}

/* ------------------------------------------------------------------- context */

function projectContext(cwd, home) {
  const pkg = readJson(path.join(cwd, "package.json"))
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies }
  const nm = (name) => path.join(cwd, "node_modules", ...name.split("/"))
  const installed = (name) => readJson(path.join(nm(name), "package.json"))
  const lock = readJson(path.join(cwd, "package-lock.json"))
  const cssFiles = walk(cwd, (p) => p.endsWith(".css"))
  const css = cssFiles.map((file) => ({ file, text: readFileSync(file, "utf8") }))
  const entry = css.find((f) => /@import\s+["']tailwindcss["']/.test(f.text)) ?? null
  // `wunderui-cli add` (source mode) writes styles/wunderui.css under the source root
  const localStyles = cssFiles.find((f) => posix(f).endsWith("/styles/wunderui.css")) ?? null
  return { cwd, home, pkg, deps, nm, installed, lock, css, entry, localStyles }
}

/* -------------------------------------------------------------------- checks */

function checkNode() {
  const v = process.versions.node
  return major(v) >= 20
    ? { id: "node", title: "Node.js", status: "ok", detail: `Node.js ${v} (WunderUI needs 20 or newer)` }
    : { id: "node", title: "Node.js", status: "fail", detail: `Node.js ${v} is too old`, fix: "Install Node.js 20 or newer (https://nodejs.org)." }
}

function checkPackageJson(ctx) {
  return ctx.pkg
    ? { id: "package-json", title: "package.json", status: "ok", detail: `${ctx.pkg.name ?? "(no name)"} in ${posix(ctx.cwd)}` }
    : { id: "package-json", title: "package.json", status: "fail", detail: `No package.json in ${posix(ctx.cwd)}`, fix: "Run doctor in the project root, or create the project first (e.g. npm create vite@latest)." }
}

function checkReact(ctx) {
  const react = ctx.installed("react")
  const dom = ctx.installed("react-dom")
  if (!react) {
    return ctx.deps.react
      ? { id: "react", title: "React", status: "fail", detail: `react ${ctx.deps.react} is in package.json but not installed`, fix: "Run npm install (or your package manager's install)." }
      : { id: "react", title: "React", status: "fail", detail: "react is not a dependency", fix: "npm install react react-dom" }
  }
  if (major(react.version) < 19) {
    return { id: "react", title: "React", status: "warn", detail: `react ${react.version}; WunderUI is built and tested on React 19`, fix: "npm install react@19 react-dom@19" }
  }
  if (dom && major(dom.version) !== major(react.version)) {
    return { id: "react", title: "React", status: "fail", detail: `react ${react.version} but react-dom ${dom.version}`, fix: `npm install react-dom@${react.version}` }
  }
  return { id: "react", title: "React", status: "ok", detail: `react ${react.version}${dom ? `, react-dom ${dom.version}` : ""}` }
}

/** More than one copy of React breaks hooks ("Invalid hook call"). Lockfile first, then node_modules. */
function checkDuplicateReact(ctx) {
  const copies = new Map()
  if (ctx.lock?.packages) {
    for (const [key, info] of Object.entries(ctx.lock.packages)) if (/(^|\/)node_modules\/react$/.test(key) && info?.version) copies.set(key, info.version)
  } else {
    const nmRoot = path.join(ctx.cwd, "node_modules")
    const add = (dir) => {
      const v = readJson(path.join(dir, "package.json"))?.version
      if (v) copies.set(posix(path.relative(ctx.cwd, dir)), v)
    }
    add(path.join(nmRoot, "react"))
    let top = []
    try {
      top = readdirSync(nmRoot)
    } catch {}
    for (const name of top) {
      const dirs = name.startsWith("@") ? (() => { try { return readdirSync(path.join(nmRoot, name)).map((n) => path.join(nmRoot, name, n)) } catch { return [] } })() : [path.join(nmRoot, name)]
      for (const d of dirs) if (existsSync(path.join(d, "node_modules", "react", "package.json"))) add(path.join(d, "node_modules", "react"))
    }
  }
  const versions = [...new Set(copies.values())]
  if (copies.size <= 1) return { id: "react-duplicates", title: "One React", status: "ok", detail: copies.size ? `one copy (${versions[0]})` : "no React copies found to compare" }
  const nested = [...copies.keys()].filter((k) => k !== "node_modules/react")
  const underWunderui = nested.some((k) => k.includes("@wunderui/react/node_modules/react"))
  return {
    id: "react-duplicates",
    title: "One React",
    status: underWunderui || versions.length > 1 ? "fail" : "warn",
    detail: `${copies.size} copies of react (${versions.join(", ")}): ${nested.join(", ")}`,
    fix: "Make every package use the project's React: npm dedupe, or an `overrides` entry for react in package.json, then reinstall.",
  }
}

function setupPlan(ctx) {
  return readJson(path.join(ctx.cwd, ".wunderui", "setup.json"))?.plan ?? null
}

function checkWunderuiPackage(ctx) {
  const pkg = ctx.installed("@wunderui/react")
  const declared = ctx.deps["@wunderui/react"]
  const plan = setupPlan(ctx)
  if (!pkg) {
    if (declared) return { id: "wunderui-package", title: "@wunderui/react", status: "fail", detail: `in package.json (${declared}) but not installed`, fix: "Run npm install." }
    if (ctx.localStyles) {
      return { id: "wunderui-package", title: "@wunderui/react", status: "ok", detail: `not installed — the project uses the component source (${posix(path.relative(ctx.cwd, ctx.localStyles))}, written by wunderui-cli add)`, mode: "source" }
    }
    return {
      id: "wunderui-package",
      title: "@wunderui/react",
      status: "fail",
      detail: "neither the package nor the component source is in this project",
      fix: "Free: npm install @wunderui/react, or npx wunderui-cli add button. Core/Pro: install the full library from your wunderui-core checkout (https://wunderui.com/installation).",
    }
  }
  const edition = packageEdition(ctx.nm("@wunderui/react"))
  const label = edition === "free" ? "WunderUI Free (npm)" : "full library (Core/Pro)"
  if (edition === "free" && (plan === "core" || plan === "pro")) {
    return {
      id: "wunderui-package",
      title: "@wunderui/react",
      status: "fail",
      detail: `${pkg.version}, ${label} — but .wunderui/setup.json says the plan is ${plan}`,
      fix: "Core/Pro need the full library from wunderui-core, not the npm package: run the wunderui-setup skill (setup.mjs install) or see https://wunderui.com/installation.",
      mode: "package",
      edition,
    }
  }
  return { id: "wunderui-package", title: "@wunderui/react", status: "ok", detail: `${pkg.version}, ${label}`, mode: "package", edition }
}

function npmLatest(name) {
  // one fixed command line (Windows needs the shell for npm.cmd; `name` is a constant, never user input)
  const r = spawnSync(`npm view ${name} version`, { encoding: "utf8", timeout: 8000, shell: true })
  const v = r.status === 0 ? r.stdout.trim().split("\n").pop()?.trim() : null
  return v && /^\d+\.\d+\.\d+/.test(v) ? v : null
}

function checkWunderuiVersion(ctx, pkgCheck, flags) {
  const id = "wunderui-version"
  const title = "Version"
  if (pkgCheck.mode !== "package") return { id, title, status: "skip", detail: "no @wunderui/react package installed" }
  const installed = ctx.installed("@wunderui/react").version
  const locked = ctx.lock?.packages?.["node_modules/@wunderui/react"]?.version
  if (locked && locked !== installed) {
    return { id, title, status: "warn", detail: `installed ${installed}, package-lock.json has ${locked}`, fix: "Run npm install so node_modules matches the lockfile." }
  }
  if (pkgCheck.edition !== "free") return { id, title, status: "ok", detail: `${installed} from wunderui-core — update with git pull and a rebuild in the checkout` }
  if (flags.offline) return { id, title, status: "skip", detail: `${installed} installed; latest not checked (--offline)` }
  const latest = npmLatest("@wunderui/react")
  if (!latest) return { id, title, status: "skip", detail: `${installed} installed; npm could not be asked for the latest version (offline?)` }
  return compareVersions(installed, latest) < 0
    ? { id, title, status: "warn", detail: `${installed} installed, ${latest} is out`, fix: "npm install @wunderui/react@latest" }
    : { id, title, status: "ok", detail: `${installed} (latest)` }
}

function checkTailwind(ctx) {
  const tw = ctx.installed("tailwindcss")?.version ?? ctx.deps.tailwindcss
  if (!tw) return { id: "tailwind", title: "Tailwind CSS", status: "fail", detail: "tailwindcss is not installed", fix: "WunderUI needs Tailwind CSS v4: https://tailwindcss.com/docs/installation" }
  return major(tw) >= 4
    ? { id: "tailwind", title: "Tailwind CSS", status: "ok", detail: `tailwindcss ${tw}` }
    : { id: "tailwind", title: "Tailwind CSS", status: "fail", detail: `tailwindcss ${tw}; WunderUI needs v4`, fix: "Upgrade with npx @tailwindcss/upgrade (https://tailwindcss.com/docs/upgrade-guide)." }
}

function insertAfterTailwind(text, lines) {
  const tw = /@import\s+["']tailwindcss["'][^;]*;/.exec(text)
  return tw ? `${text.slice(0, tw.index + tw[0].length)}\n${lines.join("\n")}${text.slice(tw.index + tw[0].length)}` : `${lines.join("\n")}\n${text}`
}

/** The CSS entry: the styles import and, for the package, the @source path Tailwind v4 needs. */
function checkStyles(ctx, pkgCheck) {
  const checks = []
  if (!ctx.entry) {
    checks.push({ id: "css-entry", title: "CSS entry", status: "fail", detail: 'no CSS file with @import "tailwindcss" found', fix: 'Create one (e.g. src/index.css) that starts with @import "tailwindcss"; and import it in your app.' })
    return checks
  }
  const rel = posix(path.relative(ctx.cwd, ctx.entry.file))
  checks.push({ id: "css-entry", title: "CSS entry", status: "ok", detail: rel })
  const text = ctx.entry.text
  const missing = []

  if (pkgCheck.mode === "source") {
    const imported = /@import\s+["'][^"']*wunderui\.css["']/.test(text)
    const target = posix(path.relative(path.dirname(ctx.entry.file), ctx.localStyles))
    const line = `@import "${target.startsWith(".") ? target : `./${target}`}";`
    checks.push(
      imported
        ? { id: "styles-import", title: "WunderUI styles", status: "ok", detail: `${rel} imports wunderui.css` }
        : { id: "styles-import", title: "WunderUI styles", status: "fail", detail: `${rel} does not import ${posix(path.relative(ctx.cwd, ctx.localStyles))}`, fix: `Add after @import "tailwindcss": ${line}`, patch: { file: ctx.entry.file, lines: [line] } }
    )
    return checks
  }
  if (pkgCheck.mode !== "package") return checks

  if (!/@import\s+["']@wunderui\/react\/styles\.css["']/.test(text)) missing.push('@import "@wunderui/react/styles.css";')
  checks.push(
    missing.length
      ? { id: "styles-import", title: "WunderUI styles", status: "fail", detail: `${rel} does not import @wunderui/react/styles.css`, fix: `Add after @import "tailwindcss": ${missing[0]}` }
      : { id: "styles-import", title: "WunderUI styles", status: "ok", detail: `${rel} imports @wunderui/react/styles.css` }
  )

  const dist = path.join(ctx.cwd, "node_modules", "@wunderui", "react", "dist")
  let want = posix(path.relative(path.dirname(ctx.entry.file), dist))
  if (!want.startsWith(".")) want = `./${want}`
  const sources = [...text.matchAll(/@source\s+["']([^"']+)["']/g)].map((m) => m[1])
  const forWunderui = sources.filter((s) => s.includes("@wunderui/react"))
  const resolves = forWunderui.some((s) => existsSync(path.resolve(path.dirname(ctx.entry.file), s)))
  if (resolves) checks.push({ id: "source-path", title: "@source for Tailwind", status: "ok", detail: forWunderui.join(", ") })
  else {
    const line = `@source "${want}";`
    missing.push(line)
    checks.push({
      id: "source-path",
      title: "@source for Tailwind",
      status: "fail",
      detail: forWunderui.length ? `${forWunderui.join(", ")} does not point at node_modules/@wunderui/react/dist from ${rel}` : `${rel} has no @source for @wunderui/react — its utility classes are not generated`,
      fix: forWunderui.length ? `Replace it with ${line}` : `Add after @import "tailwindcss": ${line}`,
    })
  }
  // one patch for both lines (only when nothing wrong has to be replaced)
  if (missing.length && !forWunderui.length) {
    const target = checks.find((c) => c.status === "fail" && (c.id === "styles-import" || c.id === "source-path"))
    target.patch = { file: ctx.entry.file, lines: missing }
  }
  return checks
}

function checkTokens(ctx, pkgCheck) {
  const id = "tokens"
  const title = "Design tokens"
  const sheet =
    pkgCheck.mode === "package" ? path.join(ctx.cwd, "node_modules", "@wunderui", "react", "dist", "styles.css") : pkgCheck.mode === "source" ? ctx.localStyles : null
  if (!sheet) return { id, title, status: "skip", detail: "no WunderUI stylesheet to check" }
  if (!existsSync(sheet)) return { id, title, status: "fail", detail: `${posix(path.relative(ctx.cwd, sheet))} is missing`, fix: pkgCheck.mode === "package" ? "Reinstall @wunderui/react (the package ships dist/styles.css)." : "npx wunderui-cli add button writes styles/wunderui.css again." }
  const text = readFileSync(sheet, "utf8")
  const light = /:root[^{]*\{[^}]*--primary\s*:/.test(text)
  const dark = /\.dark[^{]*\{[^}]*--primary\s*:/.test(text)
  if (!light) return { id, title, status: "fail", detail: `${posix(path.relative(ctx.cwd, sheet))} defines no :root tokens`, fix: "Reinstall the package or re-add the styles; do not edit the generated stylesheet." }
  const own = ctx.entry && /:root[^{]*\{[^}]*--(?:primary|background|foreground)\s*:/.test(ctx.entry.text)
  if (own) {
    return { id, title, status: "warn", detail: `tokens are there (light${dark ? " and dark" : ""}), but ${posix(path.relative(ctx.cwd, ctx.entry.file))} sets --primary/--background itself`, fix: "If these are a starter template's colours, remove them; to re-theme, override tokens on purpose (wunderui-cli docs theming)." }
  }
  return { id, title, status: dark ? "ok" : "warn", detail: dark ? "light (:root) and dark (.dark) tokens" : "light tokens only, no .dark block", ...(dark ? {} : { fix: "Reinstall the package; dark mode needs the .dark tokens." }) }
}

function checkDesignContext(ctx) {
  const found = ["DESIGN.md", "design.json", ".wunderui/DESIGN.md", ".wunderui/design.json"].filter((f) => existsSync(path.join(ctx.cwd, f)))
  if (found.length) return { id: "design-context", title: "DESIGN.md / design.json", status: "ok", detail: found.join(", ") }
  const inPkg = existsSync(path.join(ctx.cwd, "node_modules", "@wunderui", "react", "design.json"))
  return {
    id: "design-context",
    title: "DESIGN.md / design.json",
    status: "warn",
    detail: `not in the project${inPkg ? " (the package has node_modules/@wunderui/react/design.json)" : ""}; agents do not see the rules`,
    fix: "mkdir .wunderui && curl -o .wunderui/DESIGN.md https://wunderui.com/DESIGN.md && curl -o .wunderui/design.json https://wunderui.com/design.json",
  }
}

const isWunderuiServer = (name, entry) => /wunderui/i.test(name) || /wunderui-mcp|packages[\\/]mcp/.test(JSON.stringify(entry ?? {}))

/** Names only: MCP entries may carry a licence key in `env`, so nothing else is read out. */
function checkMcp(ctx) {
  const where = []
  const scan = (label, servers) => {
    for (const [name, entry] of Object.entries(servers ?? {})) if (isWunderuiServer(name, entry)) where.push(`${label} (${name})`)
  }
  const project = [[".mcp.json", "mcpServers"], [".cursor/mcp.json", "mcpServers"], [".vscode/mcp.json", "servers"]]
  for (const [file, key] of project) scan(file, readJson(path.join(ctx.cwd, file))?.[key])
  const home = ctx.home
  const claude = readJson(path.join(home, ".claude.json"))
  if (claude) {
    scan("~/.claude.json", claude.mcpServers)
    const proj = claude.projects?.[ctx.cwd] ?? claude.projects?.[posix(ctx.cwd)]
    scan("~/.claude.json (this project)", proj?.mcpServers)
  }
  scan("~/.cursor/mcp.json", readJson(path.join(home, ".cursor", "mcp.json"))?.mcpServers)
  if (where.length) return { id: "mcp", title: "MCP server", status: "ok", detail: `wunderui-mcp in ${where.join(", ")}` }
  return {
    id: "mcp",
    title: "MCP server",
    status: "warn",
    detail: "wunderui-mcp is not configured for this project",
    fix: "claude mcp add wunderui -- npx -y wunderui-mcp   (or add it to .mcp.json; --fix --write does that)",
    patch: { mcp: path.join(ctx.cwd, ".mcp.json") },
  }
}

function checkThemeProvider(ctx) {
  const roots = ["app", "src", "pages"].map((d) => path.join(ctx.cwd, d)).filter((d) => existsSync(d))
  const files = roots.flatMap((r) => walk(r, (p) => /\.(tsx|jsx|ts|js)$/.test(p), { max: 4, limit: 400 }))
  const hit = files.find((f) => {
    const t = readFileSync(f, "utf8")
    return /\bThemeProvider\b/.test(t) && /["'](?:@wunderui\/react|next-themes)["']/.test(t)
  })
  return hit
    ? { id: "theme-provider", title: "ThemeProvider", status: "ok", detail: posix(path.relative(ctx.cwd, hit)) }
    : {
        id: "theme-provider",
        title: "ThemeProvider",
        status: "warn",
        detail: "no ThemeProvider found — dark mode and the theme toggle stay off",
        fix: 'Wrap the app root: import { ThemeProvider } from "@wunderui/react" … <ThemeProvider>{children}</ThemeProvider>',
      }
}

/** All checks for one project. `home` is the user's home folder (MCP configs); tests pass their own. */
export function runChecks(cwd = process.cwd(), flags = {}, { home = homedir() } = {}) {
  const ctx = projectContext(cwd, home)
  const checks = [checkNode(), checkPackageJson(ctx)]
  if (!ctx.pkg) return checks
  const pkgCheck = checkWunderuiPackage(ctx)
  checks.push(checkReact(ctx), checkDuplicateReact(ctx), pkgCheck, checkWunderuiVersion(ctx, pkgCheck, flags), checkTailwind(ctx))
  checks.push(...checkStyles(ctx, pkgCheck), checkTokens(ctx, pkgCheck), checkDesignContext(ctx), checkMcp(ctx), checkThemeProvider(ctx))
  return checks
}

/* ---------------------------------------------------------------------- fixes */

async function applyPatch(patch) {
  if (patch.file) {
    const text = readFileSync(patch.file, "utf8")
    const todo = patch.lines.filter((l) => !text.includes(l))
    if (!todo.length) return null
    await writeFile(patch.file, insertAfterTailwind(text, todo), "utf8")
    return `${posix(patch.file)}: ${todo.join(" ")}`
  }
  if (patch.mcp) {
    const current = readJson(patch.mcp) ?? {}
    if (existsSync(patch.mcp) && !readJson(patch.mcp)) throw new CliError("ERROR", `${patch.mcp} is not valid JSON — not touched.`)
    const next = { ...current, mcpServers: { ...current.mcpServers, wunderui: { command: "npx", args: ["-y", "wunderui-mcp"] } } }
    await mkdir(path.dirname(patch.mcp), { recursive: true })
    await writeFile(patch.mcp, `${JSON.stringify(next, null, 2)}\n`, "utf8")
    return `${posix(patch.mcp)}: mcpServers.wunderui`
  }
  return null
}

function describePatch(patch) {
  if (patch.file) return `${posix(patch.file)} ← ${patch.lines.join(" ")}`
  if (patch.mcp) return `${posix(patch.mcp)} ← mcpServers.wunderui = npx -y wunderui-mcp`
  return ""
}

export async function commandDoctor(_args, flags) {
  const out = createOutput(flags)
  const cwd = flags.cwd ? path.resolve(String(flags.cwd)) : process.cwd()
  if (!existsSync(cwd) || !statSync(cwd).isDirectory()) throw new CliError("USAGE", `--cwd ${cwd} is not a folder.`)
  let checks = runChecks(cwd, flags)

  const applied = []
  if (flags.fix && flags.write) {
    for (const c of checks) if (c.patch && c.status !== "ok") {
      const done = await applyPatch(c.patch)
      if (done) applied.push(done)
    }
    if (applied.length) checks = runChecks(cwd, flags)
  }

  const counts = { ok: 0, warn: 0, fail: 0, skip: 0 }
  for (const c of checks) counts[c.status]++
  const publicChecks = checks.map(({ patch, mode, edition, ...c }) => ({ ...c, ...(patch && flags.fix ? { patch: describePatch(patch) } : {}) }))
  const data = { cwd: posix(cwd), counts, checks: publicChecks, applied }

  if (!counts.fail) out.result(data)
  const { c: k } = out
  const tag = { ok: k.green("ok  "), warn: k.yellow("warn"), fail: k.red("fail"), skip: k.dim("skip") }
  if (out.dense) {
    out.text(publicChecks.map((c) => `${c.status} ${c.id}: ${c.detail}${c.status === "ok" || c.status === "skip" || !c.fix ? "" : ` → ${c.fix}`}`))
  } else {
    const lines = ["", `  ${k.bold("WunderUI doctor")}  ${k.dim(posix(cwd))}`, ""]
    for (const c of publicChecks) {
      lines.push(`  ${tag[c.status]}  ${k.bold(c.title)} ${k.dim("—")} ${c.detail}`)
      if (c.fix && (c.status === "fail" || c.status === "warn")) lines.push(`        ${k.cyan(c.fix)}`)
      if (c.patch) lines.push(`        ${k.dim(`patch: ${c.patch}`)}`)
    }
    lines.push("", `  ${counts.ok} ok · ${counts.warn} warn · ${counts.fail} fail${counts.skip ? ` · ${counts.skip} skipped` : ""}`)
    for (const a of applied) lines.push(`  ${k.green("written")} ${a}`)
    const patchable = publicChecks.filter((c) => checks.find((x) => x.id === c.id)?.patch && c.status !== "ok")
    if (patchable.length && !flags.fix) lines.push(`  ${k.dim("wunderui-cli doctor --fix shows the safe changes, --fix --write applies them.")}`)
    if (flags.fix && !flags.write && patchable.length) lines.push(`  ${k.dim("Nothing was changed. Add --write to apply the patches above.")}`)
    lines.push("")
    out.text(lines)
  }
  if (counts.fail) throw new CliError("CHECKS_FAILED", `${counts.fail} check${counts.fail === 1 ? "" : "s"} failed`, { data, shown: true })
}
