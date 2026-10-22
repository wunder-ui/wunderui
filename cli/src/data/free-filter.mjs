/**
 * The Free filter: what may go into the data of the public wunderui-cli.
 *
 * The rule is the one scripts/export-oss-free.mjs applies to the public repository: a component is
 * free when design.json marks it `tier: "free"`; every export name that only a Core/Pro component
 * claims is a paid name, and no paid name may appear in the Free data.
 *
 * Code (examples, code blocks, backticked names, table rows) that uses a paid name is dropped.
 * Prose that merely mentions one (a block called "Kanban Board") keeps the word but not the name:
 * it is written in lower case ("kanban board"), which reads the same and names no component.
 */

export const isFree = (component) => component?.tier === "free"

/** Export names of the Core/Pro components that no free component exports too. */
export function paidExportNames(design) {
  const free = new Set(design.components.filter(isFree).flatMap((c) => c.exports ?? []))
  const paid = new Set()
  for (const c of design.components) if (!isFree(c)) for (const e of c.exports ?? []) if (!free.has(e)) paid.add(e)
  for (const e of design.otherExports ?? []) if (e.tier && e.tier !== "free" && !free.has(e.name)) paid.add(e.name)
  return [...paid].sort()
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")

/**
 * A matcher for paid names: `hits(text)` lists the names found, `has(text)` says whether any is,
 * `soften(text)` rewrites them as lower-case words. `allow` lists phrases that contain a paid name
 * but are something else — the titles of free components ("Number Stepper" is free, "Stepper" is not).
 */
export function paidMatcher(names, allow = []) {
  const sorted = [...names].sort((a, b) => b.length - a.length)
  const re = sorted.length ? new RegExp(`\\b(${sorted.map(escapeRe).join("|")})\\b`, "g") : null
  const allowed = [...allow].filter((p) => re && new RegExp(re.source).test(p)).sort((a, b) => b.length - a.length)
  const allowRe = allowed.length ? new RegExp(`\\b(?:${allowed.map(escapeRe).join("|")})\\b`, "g") : null
  /** the text with allowed phrases blanked out, for matching */
  const scrub = (text) => (allowRe ? String(text).replace(allowRe, (m) => " ".repeat(m.length)) : String(text))
  const lower = (n) => n.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").toLowerCase()
  return {
    names: new Set(names),
    hits: (text) => (re && text ? [...new Set([...scrub(text).matchAll(re)].map((m) => m[1]))] : []),
    has: (text) => Boolean(re && text && new RegExp(re.source).test(scrub(text))),
    /** prose: paid names become lower-case words ("DataGrid" → "data grid"); allowed phrases stay */
    soften: (text) => {
      if (!re || !text) return text
      const s = String(text)
      if (!allowRe) return s.replace(re, lower)
      let out = ""
      let last = 0
      for (const m of s.matchAll(allowRe)) {
        out += s.slice(last, m.index).replace(re, lower) + m[0]
        last = m.index + m[0].length
      }
      return out + s.slice(last).replace(re, lower)
    },
  }
}

/**
 * Markdown for the Free data. Chunks separated by `---` (a do/don't pair) go as a whole when any
 * of their code uses a paid name; otherwise code blocks, table rows and list items that use one
 * go, headings left without content go, and the remaining prose is softened.
 */
export function filterMarkdown(md, matcher) {
  if (!md) return md
  const chunks = md.split(/\n---\n/)
  const kept = []
  for (const chunk of chunks) {
    const fences = [...chunk.matchAll(/```[\s\S]*?```/g)].map((m) => m[0])
    if (chunks.length > 1 && fences.some((f) => matcher.has(f))) continue
    kept.push(filterBlocks(chunk, matcher))
  }
  return dropEmptyHeadings(kept.join("\n---\n")).replace(/\n{3,}/g, "\n\n").trim()
}

const codeHit = (text, matcher) => [...text.matchAll(/`([^`]+)`/g)].some((m) => matcher.has(m[1]))

/** A paragraph keeps its sentences that name no paid component in code. */
function filterParagraph(lines, matcher) {
  const text = lines.join("\n")
  if (!codeHit(text, matcher)) return lines.map((l) => matcher.soften(l))
  const sentences = text.split(/(?<=[.!?:])\s+(?=[A-Z`*(])/)
  const kept = sentences.filter((s) => !codeHit(s, matcher))
  return kept.length ? [matcher.soften(kept.join(" "))] : []
}

function filterBlocks(text, matcher) {
  const out = []
  const lines = text.split("\n")
  let para = []
  const flush = () => {
    if (para.length) out.push(...filterParagraph(para, matcher))
    para = []
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trimStart().startsWith("```")) {
      flush()
      let j = i + 1
      while (j < lines.length && !lines[j].trimStart().startsWith("```")) j++
      const block = lines.slice(i, j + 1)
      if (!matcher.has(block.join("\n"))) out.push(...block)
      i = j
      continue
    }
    const isRow = /^\s*\|/.test(line)
    const isItem = /^\s*(?:[-*]|\d+\.)\s/.test(line)
    const isHeading = /^#{1,6}\s/.test(line)
    if (isRow || isItem || isHeading || !line.trim()) {
      flush()
      if ((isRow || isItem) && (codeHit(line, matcher) || matcher.has(line))) continue
      out.push(matcher.soften(line))
      continue
    }
    para.push(line)
  }
  flush()
  return out.join("\n")
}

/** Remove a heading followed only by blank lines up to the next heading of the same or a higher level. */
function dropEmptyHeadings(md) {
  const lines = md.split("\n")
  const keep = new Array(lines.length).fill(true)
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^(#{2,6})\s/)
    if (!h) continue
    let j = i + 1
    let content = false
    for (; j < lines.length; j++) {
      const next = lines[j].match(/^(#{2,6})\s/)
      if (next && next[1].length <= h[1].length) break
      if (next) continue
      if (lines[j].trim() && keep[j]) {
        content = true
        break
      }
    }
    if (!content) keep[i] = false
  }
  return lines.filter((_, i) => keep[i]).join("\n")
}

/** Every string inside a JSON value, for the leak check. */
export function stringsOf(value, out = []) {
  if (typeof value === "string") out.push(value)
  else if (Array.isArray(value)) for (const v of value) stringsOf(v, out)
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) (out.push(k), stringsOf(v, out))
  return out
}

/** Paid names anywhere in a data bundle (keys and values). Empty for a clean Free bundle. */
export function leaksIn(bundle, matcher) {
  const found = new Set()
  for (const s of stringsOf(bundle)) for (const n of matcher.hits(s)) found.add(n)
  return [...found].sort()
}
