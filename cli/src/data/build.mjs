import { normalizeParts, variantsOf } from "./adapter.mjs"
import { filterMarkdown, isFree, leaksIn, paidExportNames, paidMatcher } from "./free-filter.mjs"

/**
 * Builds the data the documentation commands read (component, search, docs, build) from the same
 * sources as the MCP server: design.json and DESIGN.md (packages/mcp/data), the block registry,
 * and the CLI's own content (playbooks, keyboard/ARIA notes, synonyms, two hand-written topics).
 *
 *   edition "free"   what the public wunderui-cli ships: free components only, no paid name anywhere
 *                    (checked at the end, the build throws on a leak)
 *   edition "full"   everything, for the monorepo (`--source monorepo`) and the internal build
 *
 * Pure: takes the parsed sources, returns the bundle. Reading files is sources.mjs's job.
 */

export const SCHEMA = 1

/** The text under one heading of a Markdown file, up to the next heading of the same or a higher level. */
export function section(md, heading) {
  const level = heading.match(/^#+/)[0].length
  const lines = md.split("\n")
  let start = -1
  let fence = false
  let ended = false
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trimStart().startsWith("```")) fence = !fence
    const h = !fence && line.match(/^(#{1,6})\s+(.*)$/)
    if (start < 0) {
      if (h && line.trim() === heading) start = i
      continue
    }
    if (h && h[1].length <= level) {
      ended = true
      break
    }
    out.push(line)
  }
  if (start < 0) return null
  // the last section of the file: leave out the footer after the closing rule
  if (!ended) {
    const rule = out.lastIndexOf("---")
    if (rule >= 0) out.length = rule
  }
  return out.join("\n").trim()
}

/** Headings (## and ###) of a Markdown text, for search and the topic outline. */
const headingsOf = (md) => [...(md ?? "").matchAll(/^#{2,4}\s+(.+)$/gm)].map((m) => m[1].trim())

function a11yFor(slug, content) {
  const entry = content.a11y?.[slug]
  if (!entry) return null
  return { keyboard: entry.keyboard ?? [], aria: entry.aria ?? [], notes: entry.notes ?? null }
}

/** One component of design.json (either shape) as the CLI shows it. */
export function componentEntry(c, content = {}) {
  const parts = normalizeParts(c)
  return {
    slug: c.slug,
    title: c.title,
    category: c.category,
    group: c.group ?? null,
    tier: c.tier ?? "pro",
    description: c.description ?? null,
    exports: c.exports ?? [],
    parts,
    variants: variantsOf(parts),
    example: c.example ?? null,
    a11y: a11yFor(c.slug, content),
    synonyms: content.synonyms?.[c.slug] ?? [],
    docs: c.docs ?? null,
    sourceRaw: c.sourceRaw ?? null,
    ...guideOf(c),
  }
}

/** What a theming variable does, in a few words: "background, border · variant=primary · hover". */
export function usedFor(v) {
  const byKey = new Map()
  for (const pair of v.variants ?? []) {
    const [key, value] = pair.split("=")
    byKey.set(key, [...(byKey.get(key) ?? []), value])
  }
  const variants = [...byKey].map(([key, values]) => `${key} ${values.join(", ")}`).join("; ")
  return [v.properties?.join(", "), variants || null, v.states?.length ? v.states.join(", ") : null].filter(Boolean).join(" · ")
}

/** The guide of a component (design.json `anatomy`, `bestPractices`, `themingVariables`), as the CLI shows it. */
function guideOf(c) {
  const out = {}
  if (c.anatomy?.parts?.length)
    out.anatomy = {
      source: c.anatomy.source ?? "generated",
      parts: c.anatomy.parts.map((p) => ({ name: p.name, export: p.export ?? null, slot: p.slot ?? null, required: Boolean(p.required), description: p.description ?? null })),
    }
  if (c.bestPractices?.items?.length) out.bestPractices = { source: c.bestPractices.source ?? "generated", items: c.bestPractices.items.map((i) => ({ kind: i.kind, text: i.text })) }
  if (c.themingVariables?.variables?.length)
    out.themingVariables = c.themingVariables.variables.map((v) => ({ name: v.name, group: v.group ?? null, usedFor: usedFor(v), default: v.value ?? v.default ?? null, ...(v.dark ? { dark: v.dark } : {}) }))
  return out
}

/** A hook of design.json `otherExports` (with its page), as the CLI shows it. */
export function hookEntry(e) {
  return {
    name: e.name,
    slug: e.slug ?? null,
    tier: e.tier ?? "pro",
    summary: e.summary ?? e.description ?? null,
    description: e.guide ?? null,
    signature: e.signature ?? null,
    params: (e.params ?? []).map((p) => ({ name: p.name, type: p.type, optional: Boolean(p.optional), default: p.default ?? null, description: p.description ?? null })),
    returns: e.returns ? { type: e.returns.type, properties: (e.returns.properties ?? []).map((p) => ({ name: p.name, type: p.type, description: p.description ?? null })) } : null,
    notes: e.notes ?? [],
    examples: e.examples ?? [],
    docs: e.docs ?? null,
  }
}

function blockEntries(categories) {
  return (categories ?? []).flatMap((cat) =>
    cat.blocks.map((b) => ({
      id: `${cat.slug}/${b.slug}`,
      category: cat.slug,
      categoryTitle: cat.title,
      title: b.title,
      description: b.description ?? null,
      tier: "pro",
      screens: b.screens.map((s) => ({ slug: s.slug, title: s.title })),
      uses: [...new Set(b.screens.flatMap((s) => s.uses ?? []))],
    }))
  )
}

function docTopics(designMd, content) {
  const topics = []
  for (const t of content.topics ?? []) {
    const parts = []
    for (const src of t.from ?? []) {
      const text = src.section ? section(designMd, src.section) : src.file ? content.files?.[src.file] : null
      if (text == null) throw new Error(`docs topic ${t.id}: source ${src.section ?? src.file} not found`)
      parts.push(src.title ? `## ${src.title}\n\n${text}` : text)
    }
    const body = parts.join("\n\n").trim()
    topics.push({ id: t.id, title: t.title, summary: t.summary, aliases: t.aliases ?? [], headings: headingsOf(body), body })
  }
  return topics
}

/** Every component a playbook names must exist; returns the unknown ones. */
function unknownNames(playbook, known) {
  const names = playbook.steps.flatMap((s) => [...(s.components ?? []), ...(s.free?.components ?? [])])
  return names.filter((n) => !known.has(n))
}

/** Every string of a JSON value through `fn`. */
const mapStrings = (value, fn) =>
  typeof value === "string"
    ? fn(value)
    : Array.isArray(value)
      ? value.map((v) => mapStrings(v, fn))
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, fn)]))
        : value

const stripStep = ({ free, tier, ...rest }) => rest

/**
 * The Free playbook: steps that need a Core/Pro component use their `free` alternative or go;
 * the rest keeps only free components; prose is softened; no blocks (they are Pro).
 */
function freePlaybook({ paidExtras, ...p }, matcher) {
  const steps = []
  for (const s of p.steps) {
    const paidStep = s.tier === "paid" || (s.components ?? []).some((n) => matcher.names.has(n))
    if (!paidStep) steps.push(stripStep(s))
    else if (s.free) steps.push({ ...stripStep(s), ...s.free, title: s.free.title ?? s.title })
  }
  const playbook = {
    ...p,
    layout: p.layout?.free ?? p.layout?.default ?? null,
    steps: steps.map((s) => ({ ...s, components: (s.components ?? []).filter((n) => !matcher.names.has(n)) })),
    blocks: [],
  }
  return {
    ...mapStrings(playbook, (s) => matcher.soften(s)),
    paid: paidExtras ? { note: "Core and Pro add more components and ready-made blocks for this screen (https://wunderui.com/#pricing)." } : null,
  }
}

function fullPlaybook({ paidExtras, ...p }) {
  return {
    ...p,
    layout: p.layout?.paid ?? p.layout?.default ?? null,
    steps: p.steps.map(({ free, ...rest }) => rest),
    paid: null,
  }
}

/**
 * `strict`: a playbook naming a component design.json does not export is an error (tests, authoring).
 * Otherwise such names are left out and listed in `bundle.warnings`, so a build against an older
 * design.json (a component not in the catalog yet) still works.
 */
export function buildCliData(sources, { edition = "free", generatedAt, strict = false } = {}) {
  if (!["free", "full"].includes(edition)) throw new Error(`unknown edition ${edition}`)
  const { design, designMd, blockCategories = [] } = sources
  let content = sources.content ?? {}
  const free = edition === "free"
  const paidNames = paidExportNames(design)
  const matcher = paidMatcher(paidNames, design.components.filter(isFree).map((c) => c.title))
  const allExports = new Set(design.components.flatMap((c) => c.exports ?? []))

  const warnings = []
  for (const p of content.playbooks ?? []) {
    const unknown = unknownNames(p, allExports)
    if (unknown.length && strict) throw new Error(`playbook ${p.id} names components design.json does not export: ${unknown.join(", ")}`)
    if (unknown.length) warnings.push(`playbook ${p.id}: left out ${[...new Set(unknown)].join(", ")} (not in design.json)`)
  }
  if (warnings.length) {
    const known = (list) => (list ?? []).filter((n) => allExports.has(n))
    content = {
      ...content,
      playbooks: content.playbooks.map((p) => ({
        ...p,
        steps: p.steps.map((s) => ({ ...s, components: known(s.components), ...(s.free ? { free: { ...s.free, components: known(s.free.components) } } : {}) })),
      })),
    }
  }

  const components = design.components.filter((c) => !free || isFree(c)).map((c) => componentEntry(c, content))
  let hooks = (design.otherExports ?? []).filter((e) => e.kind === "hook" && (!free || e.tier === "free")).map(hookEntry)
  let blocks = blockEntries(blockCategories)
  let topics = docTopics(designMd, content)
  let playbooks = (content.playbooks ?? []).map((p) => (free ? freePlaybook(p, matcher) : fullPlaybook(p)))
  let skills = (design.skills ?? []).map((s) => ({ name: s.name, tier: s.tier, description: s.description }))

  if (free) {
    for (const c of components) {
      c.description = matcher.soften(c.description)
      if (matcher.has(c.example)) c.example = null
      for (const part of c.parts) for (const p of part.props) p.description = matcher.soften(p.description)
      // guide texts are prose: a Core/Pro name in them becomes plain words; a part that is a Core/Pro export goes
      if (c.anatomy) c.anatomy.parts = c.anatomy.parts.filter((p) => !matcher.names.has(p.export)).map((p) => ({ ...p, description: matcher.soften(p.description) }))
      if (c.bestPractices) c.bestPractices.items = c.bestPractices.items.map((i) => ({ ...i, text: matcher.soften(i.text) }))
    }
    hooks = hooks.map((h) => mapStrings(h, (s) => matcher.soften(s)))
    blocks = blocks.map((b) => ({
      ...b,
      title: matcher.soften(b.title),
      description: matcher.soften(b.description),
      screens: b.screens.map((s) => ({ ...s, title: matcher.soften(s.title) })),
      uses: b.uses.filter((n) => !matcher.names.has(n) && allExports.has(n)),
    }))
    topics = topics.map((t) => {
      const body = filterMarkdown(t.body, matcher)
      return { ...t, summary: matcher.soften(t.summary), body, headings: headingsOf(body) }
    })
    skills = skills.filter((s) => s.tier === "free")
  }

  const freeCount = design.components.filter(isFree).length
  const bundle = {
    schema: SCHEMA,
    edition,
    generatedAt: generatedAt ?? design.generatedAt ?? null,
    library: { name: design.name, version: design.version, site: design.site ?? "https://wunderui.com" },
    counts: {
      components: components.length,
      free: freeCount,
      paid: design.components.length - freeCount,
      blocks: blocks.length,
      hooks: hooks.length,
      topics: topics.length,
      playbooks: playbooks.length,
    },
    plans: design.plans ?? null,
    install: free ? { package: "npm install @wunderui/react", note: "The npm package is WunderUI Free (the free components). Core and Pro install the full library from wunderui-core." } : design.install ?? null,
    components,
    hooks,
    blocks,
    tokens: design.tokens ?? null,
    motion: design.motion ?? null,
    topics,
    playbooks,
    skills,
    warnings,
  }

  if (free) {
    const leaks = leaksIn(bundle, matcher)
    if (leaks.length) throw new Error(`the Free data would contain Core/Pro names: ${leaks.join(", ")}`)
  }
  return bundle
}
