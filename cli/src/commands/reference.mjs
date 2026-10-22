import { componentEntry } from "../data/build.mjs"
import { findComponent, keyOf, loadData } from "../data/load.mjs"
import { CliError, brief, columns, createOutput } from "../output.mjs"
import { createIndex, search, tokenize } from "../search.mjs"

/**
 * The reference commands: component, search, docs, build. Each one prints text for people and,
 * with --json, the envelope for agents (see output.mjs). They read the bundled data (Free edition
 * in the public CLI); `--source monorepo` reads the full data inside the WunderUI monorepo.
 */

const PAID_HINT = "Core/Pro: details through the MCP server (wunderui-mcp) or after `wunderui-cli login <key>`."

/* ------------------------------------------------------------------ component */

function denseComponent(c) {
  return {
    ...c,
    description: brief(c.description),
    parts: c.parts.map((part) => ({
      name: part.name,
      props: part.props.map(({ description, ...p }) => p),
      ...(part.inherits ? { inherits: part.inherits } : {}),
    })),
  }
}

const PRACTICE = { do: "do", dont: "don't", when: "when" }

function typeLabel(p, max = 60) {
  const t = p.values ? p.values.map((v) => `"${v}"`).join(" | ") : p.type
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

function renderComponent(out, c, { edition, source }) {
  const { c: k, dense } = out
  const tier = c.tier === "free" ? "Free" : "Core/Pro"
  const lines = []
  if (dense) {
    lines.push(`${c.title} [${c.category}, ${tier}] ${brief(c.description)}`)
    lines.push(`import { ${c.exports.join(", ")} } from "@wunderui/react"  (props below without className/style/render)`)
    // className, style and render exist on nearly every part: left out of the dense line
    const common = new Set(["className", "style", "render"])
    for (const part of c.parts) {
      const props = part.props.filter((p) => !common.has(p.name)).map((p) => `${p.name}${p.required ? "*" : ""}:${typeLabel(p, 80).replace(/ \| /g, "|")}${p.default != null ? `=${p.default}` : ""}`)
      const inherits = part.inherits?.from?.length ? ` +${part.inherits.from.join(",")}` : ""
      lines.push(`${part.name}(${props.join("; ")})${inherits}`)
    }
    if (c.a11y) lines.push(`a11y: ${[...c.a11y.keyboard, ...c.a11y.aria].join(" · ")}`)
    if (c.anatomy) lines.push(`anatomy: ${c.anatomy.parts.map((p) => `${p.export ?? p.name}${p.slot ? `[${p.slot}]` : ""}${p.required ? "" : "?"}`).join(" ")}`)
    if (c.bestPractices) for (const i of c.bestPractices.items) lines.push(`${PRACTICE[i.kind] ?? "note"}: ${i.text}`)
    if (c.themingVariables) lines.push(`theming: ${c.themingVariables.map((v) => v.name).join(" ")}`)
    if (c.example) lines.push(c.example)
    if (c.docs) lines.push(c.docs)
    return out.text(lines)
  }
  lines.push("", `  ${k.bold(c.title)}  ${k.dim(`${c.category} · ${tier}${c.group ? ` · ${c.group}` : ""}`)}`)
  if (c.description) lines.push(`  ${c.description}`)
  lines.push("", `  ${k.cyan(`import { ${c.exports.join(", ")} } from "@wunderui/react"`)}`)
  if (!c.parts.length) lines.push("", `  ${k.dim("No prop data for this component.")}`)
  for (const part of c.parts) {
    lines.push("", `  ${k.bold(`Props — ${part.name}`)}${part.source === "signature" ? k.dim("  (from the signature: names and defaults)") : ""}`)
    if (!part.props.length) lines.push(`    ${k.dim("no props of its own")}`)
    const rows = part.props.map((p) => [`    ${p.name}${p.required ? k.red("*") : ""}`, typeLabel(p), p.default != null ? k.dim(`default ${p.default}`) : ""])
    const table = columns(rows)
    part.props.forEach((p, i) => {
      lines.push(table[i])
      if (p.description) lines.push(`      ${k.dim(brief(p.description, 160))}`)
    })
    if (part.inherits?.from?.length) lines.push(`    ${k.dim(`+ ${part.inherits.count ?? "the"} props of ${part.inherits.from.join(", ")}`)}`)
  }
  const variants = Object.entries(c.variants ?? {})
  if (variants.length) {
    lines.push("", `  ${k.bold("Variants")}`)
    for (const [name, values] of variants) lines.push(`    ${name}: ${values.join(", ")}`)
  }
  if (c.a11y) {
    lines.push("", `  ${k.bold("Keyboard and ARIA")}`)
    for (const s of c.a11y.keyboard) lines.push(`    ${s}`)
    for (const s of c.a11y.aria) lines.push(`    ${s}`)
    if (c.a11y.notes) lines.push(`    ${k.dim(c.a11y.notes)}`)
  }
  if (c.anatomy) {
    lines.push("", `  ${k.bold("Anatomy")}${c.anatomy.source === "authored" ? "" : k.dim("  (drafted from the code)")}`)
    const rows = c.anatomy.parts.map((p) => [`    ${p.export ?? p.name}`, p.slot ? k.dim(`data-slot="${p.slot}"`) : "", p.required ? "" : k.dim("optional")])
    const table = columns(rows)
    c.anatomy.parts.forEach((p, i) => {
      lines.push(table[i])
      if (p.description) lines.push(`      ${k.dim(brief(p.description, 160))}`)
    })
  }
  if (c.bestPractices) {
    lines.push("", `  ${k.bold("Best practices")}`)
    for (const i of c.bestPractices.items) lines.push(`    ${i.kind === "dont" ? k.red("Don't") : i.kind === "do" ? k.cyan("Do") : k.dim("When")}  ${i.text}`)
  }
  if (c.themingVariables) {
    lines.push("", `  ${k.bold("Theming variables")}`)
    const rows = c.themingVariables.map((v) => [`    ${v.name}`, v.usedFor, k.dim(v.default ?? "")])
    for (const row of columns(rows)) lines.push(row)
  }
  if (c.example) {
    lines.push("", `  ${k.bold("Example")}`)
    for (const l of c.example.split("\n")) lines.push(`    ${l}`)
  }
  lines.push("")
  if (c.docs) lines.push(`  ${k.dim("Docs")}    ${c.docs}`)
  if (c.sourceRaw && c.tier === "free") lines.push(`  ${k.dim("Add")}     npx wunderui-cli add ${c.slug}`)
  if (source === "licensed") lines.push(`  ${k.dim("Data from wunderui.com with your licence key.")}`)
  else if (edition === "free" && c.tier === "free") lines.push(`  ${k.dim("WunderUI Free · MIT")}`)
  lines.push("")
  out.text(lines)
}

function renderHook(out, h) {
  const { c: k } = out
  const tier = h.tier === "free" ? "Free" : "Core/Pro"
  if (out.dense) {
    const lines = [`${h.name} [Hook, ${tier}] ${brief(h.summary ?? "")}`, h.signature ?? ""]
    for (const n of h.notes) lines.push(`note: ${n}`)
    if (h.docs) lines.push(h.docs)
    return out.text(lines.filter(Boolean))
  }
  const lines = ["", `  ${k.bold(h.name)}  ${k.dim(`Hook · ${tier}`)}`]
  if (h.summary) lines.push(`  ${h.summary}`)
  if (h.signature) lines.push("", `  ${k.cyan(h.signature)}`)
  if (h.params.length) {
    lines.push("", `  ${k.bold("Parameters")}`)
    for (const row of columns(h.params.map((p) => [`    ${p.name}${p.optional ? "?" : ""}`, p.type, p.default != null ? k.dim(`default ${p.default}`) : ""]))) lines.push(row)
  }
  if (h.returns) {
    lines.push("", `  ${k.bold("Returns")}  ${h.returns.type}`)
    for (const row of columns(h.returns.properties.map((p) => [`    ${p.name}`, p.type.length > 70 ? `${p.type.slice(0, 69)}…` : p.type]))) lines.push(row)
  }
  if (h.notes.length) {
    lines.push("", `  ${k.bold("Notes")}`)
    for (const n of h.notes) lines.push(`    ${n}`)
  }
  for (const ex of h.examples) {
    lines.push("", `  ${k.bold(ex.title ?? "Example")}`)
    for (const l of String(ex.code).split("\n")) lines.push(`    ${l}`)
  }
  lines.push("")
  if (h.docs) lines.push(`  ${k.dim("Docs")}    ${h.docs}`, "")
  out.text(lines)
}

function renderPaidStub(out, stub) {
  const { c: k } = out
  if (out.dense) return out.text([`${stub.title} [${stub.category ?? "?"}, Core/Pro] ${PAID_HINT}`])
  out.text(["", `  ${k.bold(stub.title)}  ${k.dim(`${stub.category ?? ""} · Core/Pro`)}`, "", `  ${PAID_HINT}`, `  ${k.dim("Plans: https://wunderui.com/#pricing")}`, ""])
}

async function remoteComponent(name, flags, ctx) {
  const config = await ctx.projectConfig()
  const registry = ctx.trustedRegistry(config.registry) ? config.registry : ctx.DEFAULT_REGISTRY
  const key = await ctx.licenceKey(flags, registry)
  const res = await fetch(`${registry}/api/registry/component/${encodeURIComponent(name)}`, {
    headers: key ? { Authorization: `Bearer ${key}` } : {},
    signal: AbortSignal.timeout(8000),
  }).catch(() => null)
  if (!res) return { offline: true }
  const body = await res.json().catch(() => null)
  if (res.ok && body?.component) return { component: body.component }
  if (res.ok && body?.hook) return { hook: body.hook }
  if (res.status === 401 && body?.component) return { stub: body.component }
  if (res.status === 404 && body?.error === "not_found") return { missing: true }
  // the route is not there (older site): the public design.json still names the component
  const design = await fetch(`${registry}/design.json`, { signal: AbortSignal.timeout(8000) })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
  if (!design) return { offline: true }
  const k = keyOf(name)
  const hit = design.components?.find((x) => keyOf(x.slug) === k || keyOf(x.title) === k || x.exports?.some((e) => keyOf(e) === k))
  if (hit) return { stub: { slug: hit.slug, title: hit.title, category: hit.category, tier: hit.tier ?? "pro" } }
  // an older site has no hook route either: a hook that design.json lists but this edition does not ship is Core/Pro
  const hook = design.otherExports?.find((x) => x.kind === "hook" && (keyOf(x.name) === k || (x.slug && keyOf(x.slug) === k)))
  return hook ? { stub: { slug: hook.slug ?? hook.name, title: hook.name, category: "Hooks", tier: hook.tier ?? "pro" } } : { missing: true }
}

function listComponents(out, data) {
  const items = data.components.map((c) => ({ slug: c.slug, title: c.title, category: c.category, tier: c.tier, exports: c.exports }))
  out.result({ edition: data.edition, components: items, paidNotListed: data.edition === "free" ? data.counts.paid : 0 })
  const byCat = new Map()
  for (const c of items) byCat.set(c.category, [...(byCat.get(c.category) ?? []), c])
  const { c: k } = out
  if (out.dense) {
    out.text([...byCat].map(([cat, list]) => `${cat}: ${list.map((c) => c.slug).join(" ")}`))
  } else {
    const lines = ["", `  ${k.bold(`${items.length} components`)} ${k.dim(data.edition === "free" ? "— WunderUI Free" : "— all plans")}`]
    for (const [cat, list] of byCat) {
      lines.push("", `  ${k.dim(cat)}`)
      for (const c of list) lines.push(`    ${c.slug.padEnd(26)} ${c.tier === "free" ? "" : k.dim("Core/Pro")}`)
    }
    lines.push("", `  ${k.dim("wunderui-cli component <name>  ·  details, props, variants, example")}`)
    if (data.edition === "free") lines.push(`  ${k.dim(`${data.counts.paid} more components come with Core and Pro — https://wunderui.com/#pricing`)}`)
    lines.push("")
    out.text(lines)
  }
}

export async function commandComponent(args, flags, ctx) {
  const out = createOutput(flags)
  const { data, source } = await loadData(flags)
  if (flags.list) return listComponents(out, data)
  const name = args.join(" ").trim()
  if (!name) throw new CliError("USAGE", "Usage: wunderui-cli component <name>  or  wunderui-cli component --list")

  const local = findComponent(data, name)
  const hook = local ? null : (data.hooks ?? []).find((h) => keyOf(h.name) === keyOf(name) || keyOf(h.slug) === keyOf(name))
  if (hook) {
    out.result({ edition: data.edition, source, hook })
    return renderHook(out, hook)
  }
  if (local) {
    out.result({ edition: data.edition, source, component: out.dense ? denseComponent(local) : local })
    return renderComponent(out, local, { edition: data.edition, source })
  }

  if (data.edition === "free" && !flags.offline) {
    const remote = await remoteComponent(name, flags, ctx)
    if (remote.hook) {
      out.result({ edition: data.edition, source: "licensed", hook: remote.hook })
      return renderHook(out, remote.hook)
    }
    if (remote.component) {
      const entry = componentEntry(remote.component, {})
      out.result({ edition: data.edition, source: "licensed", component: out.dense ? denseComponent(entry) : entry })
      return renderComponent(out, entry, { edition: data.edition, source: "licensed" })
    }
    if (remote.stub) {
      renderPaidStub(out, remote.stub)
      throw new CliError("LICENSE_REQUIRED", `${remote.stub.title} is a Core/Pro component. ${PAID_HINT}`, {
        data: { component: { ...remote.stub, tier: remote.stub.tier ?? "pro" }, hint: PAID_HINT },
        shown: true,
      })
    }
    if (remote.offline) {
      throw new CliError("NOT_FOUND", `"${name}" is not a free component. wunderui.com could not be reached to check Core/Pro — try again online, or run \`wunderui-cli component --list\`.`)
    }
  }
  const suggestions = search(createIndex(data), name, { kinds: ["component"], limit: 3 }).map((r) => r.id)
  const offlineNote = data.edition === "free" && flags.offline ? " Core/Pro components are looked up on wunderui.com (without --offline)." : ""
  throw new CliError("NOT_FOUND", `No component "${name}" in this edition.${suggestions.length ? ` Did you mean: ${suggestions.join(", ")}?` : ""}${offlineNote}`, {
    data: { suggestions },
  })
}

/* --------------------------------------------------------------------- search */

const KINDS = ["component", "block", "docs", "token"]

/** Blocks come with Pro; Core/Pro components with either paid plan. */
const planLabel = (r) => (r.tier === "free" ? "" : r.kind === "block" ? "Pro" : "Core/Pro")

export async function commandSearch(args, flags) {
  const out = createOutput(flags)
  const query = args.join(" ").trim()
  if (!query) throw new CliError("USAGE", 'Usage: wunderui-cli search "<question>" [--kind component,block,docs,token] [--limit 10]')
  const kinds = flags.kind ? String(flags.kind).split(",").map((s) => s.trim()) : null
  const bad = kinds?.filter((k) => !KINDS.includes(k)) ?? []
  if (bad.length) throw new CliError("USAGE", `--kind takes ${KINDS.join(", ")} (not ${bad.join(", ")}).`)
  const limit = flags.limit ? Number(flags.limit) : 10
  if (!Number.isInteger(limit) || limit < 1) throw new CliError("USAGE", "--limit takes a whole number above 0.")

  const { data } = await loadData(flags)
  const results = search(createIndex(data), query, { kinds, limit }).map((r) => ({
    ...r,
    summary: out.dense ? brief(r.summary, 100) : r.summary,
    next: next(r),
  }))
  out.result({ query, edition: data.edition, results })

  const { c: k } = out
  if (!results.length) return out.text(out.dense ? "no results" : ["", `  No results for "${query}". Try other words, or \`wunderui-cli docs\` for the topics.`, ""])
  if (out.dense) return out.text(results.map((r) => `${r.kind} ${r.id}${planLabel(r) ? ` (${planLabel(r)})` : ""} — ${r.summary ?? ""}`))
  const lines = [""]
  for (const r of results) {
    lines.push(`  ${k.dim(r.kind.padEnd(10))}${k.bold(r.title)}${planLabel(r) ? k.dim(`  ${planLabel(r)}`) : ""}`)
    if (r.summary) lines.push(`  ${" ".repeat(10)}${brief(r.summary, 110)}`)
    lines.push(`  ${" ".repeat(10)}${k.cyan(r.next)}`)
  }
  lines.push("")
  out.text(lines)
}

function next(r) {
  if (r.kind === "component") return `wunderui-cli component ${r.id}`
  if (r.kind === "docs") return `wunderui-cli docs ${r.id}`
  if (r.kind === "block") return `wunderui-cli add ${r.id}`
  return "wunderui-cli docs tokens"
}

/* ----------------------------------------------------------------------- docs */

function findTopic(data, name) {
  const k = keyOf(name)
  return data.topics.find((t) => keyOf(t.id) === k || keyOf(t.title) === k || t.aliases.some((a) => keyOf(a) === k)) ?? null
}

/** Dense Markdown: no blank lines, code blocks reduced to their first lines. */
function denseMarkdown(md) {
  return md
    .replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code) => {
      const lines = code.trimEnd().split("\n")
      return lines.length > 6 ? `${lines.slice(0, 6).join("\n")}\n…` : lines.join("\n")
    })
    .split("\n")
    .filter((l) => l.trim())
    .join("\n")
}

export async function commandDocs(args, flags) {
  const out = createOutput(flags)
  const { data } = await loadData(flags)
  const name = args.join(" ").trim()
  const { c: k } = out

  if (!name || flags.list) {
    const topics = data.topics.map((t) => ({ id: t.id, title: t.title, summary: t.summary }))
    out.result({ edition: data.edition, topics })
    if (out.dense) return out.text(topics.map((t) => `${t.id} — ${brief(t.summary, 90)}`))
    return out.text(["", `  ${k.bold("Topics")}  ${k.dim("wunderui-cli docs <topic>")}`, "", ...columns(topics.map((t) => [`    ${k.cyan(t.id)}`, t.summary])), ""])
  }

  const topic = findTopic(data, name)
  if (!topic) {
    const suggestions = search(createIndex(data), name, { kinds: ["docs"], limit: 3 }).map((r) => r.id)
    throw new CliError("NOT_FOUND", `No topic "${name}". Topics: ${data.topics.map((t) => t.id).join(", ")}.`, { data: { suggestions } })
  }
  const body = out.dense ? denseMarkdown(topic.body) : topic.body
  const extra = topic.id === "tokens" ? { tokens: data.tokens } : topic.id === "motion" ? { motion: data.motion } : {}
  out.result({ edition: data.edition, topic: { id: topic.id, title: topic.title, summary: topic.summary, headings: topic.headings, body }, ...extra })
  if (out.dense) return out.text([`# ${topic.title}`, body])
  out.text(["", k.bold(`# ${topic.title}`), "", topic.summary, "", body, ""])
}

/* ---------------------------------------------------------------------- build */

function scorePlaybook(p, query) {
  const q = new Set(tokenize(query))
  if (!q.size) return 0
  const fields = [
    [tokenize([p.id, p.title].join(" ")), 3],
    [tokenize(p.aliases.join(" ")), 3],
    [tokenize(p.summary), 1],
  ]
  let score = 0
  for (const [tokens, w] of fields) for (const t of new Set(tokens)) if (q.has(t)) score += w
  if (p.aliases.some((a) => keyOf(a) === keyOf(query)) || keyOf(p.id) === keyOf(query)) score += 10
  return score
}

export async function commandBuild(args, flags) {
  const out = createOutput(flags)
  const { data } = await loadData(flags)
  const task = args.join(" ").trim()
  const { c: k } = out

  if (!task || flags.list) {
    const list = data.playbooks.map((p) => ({ id: p.id, title: p.title, summary: p.summary }))
    out.result({ edition: data.edition, playbooks: list })
    if (out.dense) return out.text(list.map((p) => `${p.id} — ${brief(p.summary, 90)}`))
    return out.text(["", `  ${k.bold("Playbooks")}  ${k.dim('wunderui-cli build "<task>"')}`, "", ...columns(list.map((p) => [`    ${k.cyan(p.id)}`, p.summary])), ""])
  }

  const ranked = data.playbooks.map((p) => ({ p, score: scorePlaybook(p, task) })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score)
  if (!ranked.length) {
    throw new CliError("NOT_FOUND", `No playbook for "${task}". Playbooks: ${data.playbooks.map((p) => p.id).join(", ")}.`, {
      data: { playbooks: data.playbooks.map((p) => p.id) },
    })
  }
  const p = ranked[0].p
  out.result({ edition: data.edition, task, playbook: p, alternatives: ranked.slice(1, 3).map((x) => x.p.id) })

  if (out.dense) {
    const lines = [`${p.title}: ${p.summary}`]
    if (p.layout) lines.push(`layout: ${p.layout}`)
    p.steps.forEach((s, i) => lines.push(`${i + 1}. ${s.title}: ${s.do}${s.components?.length ? ` [${s.components.join(", ")}]` : ""}`))
    lines.push(`states: ${p.states.join(" | ")}`)
    for (const [kind, rules] of Object.entries(p.rules ?? {})) lines.push(`${kind}: ${rules.join(" | ")}`)
    lines.push(`checks: ${p.checks.join(" | ")}`)
    if (p.blocks?.length) lines.push(`blocks: ${p.blocks.join(" ")}`)
    if (p.paid?.note) lines.push(p.paid.note)
    return out.text(lines)
  }

  const lines = ["", `  ${k.bold(p.title)}  ${k.dim(`playbook ${p.id}${data.edition === "free" ? " · WunderUI Free" : ""}`)}`, `  ${p.summary}`]
  if (p.layout) lines.push("", `  ${k.bold("Layout")}`, `    ${p.layout}`)
  lines.push("", `  ${k.bold("Steps")}`)
  p.steps.forEach((s, i) => {
    lines.push(`    ${i + 1}. ${k.bold(s.title)} — ${s.do}`)
    if (s.components?.length) lines.push(`       ${k.cyan(s.components.join(", "))}`)
  })
  lines.push("", `  ${k.bold("States")}`, ...p.states.map((s) => `    - ${s}`))
  const titles = { tokens: "Tokens", motion: "Motion", a11y: "Accessibility", copy: "Copy" }
  for (const [kind, rules] of Object.entries(p.rules ?? {})) lines.push("", `  ${k.bold(titles[kind] ?? kind)}`, ...rules.map((r) => `    - ${r}`))
  if (p.blocks?.length) lines.push("", `  ${k.bold("Blocks to start from")}`, ...p.blocks.map((b) => `    npx wunderui-cli add ${b}`))
  lines.push("", `  ${k.bold("Checks")}`, ...p.checks.map((c) => `    ${k.cyan(c)}`))
  if (p.paid?.note) lines.push("", `  ${k.dim(p.paid.note)}`)
  if (ranked.length > 1) lines.push("", `  ${k.dim(`Also close: ${ranked.slice(1, 3).map((x) => x.p.id).join(", ")}`)}`)
  lines.push("")
  out.text(lines)
}
