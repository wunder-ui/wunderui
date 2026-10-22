/**
 * Offline search over the CLI data: BM25 over weighted fields, no network, no dependencies.
 *
 * Documents: components (name, exports, synonyms, category, description), blocks (id, title,
 * screens, description), documentation topics (title, headings, body) and design tokens (name,
 * value, use). A field's weight repeats its tokens, so a hit in a name counts more than one in a
 * description. Query words are expanded with a few spelling variants (plural, -ing) but not with
 * synonyms: those sit on the documents, where they belong to one component.
 */

const STOP = new Set(
  "a an and are as at be by for from how i in into is it me my of on or show the this to use what when where which with without you your need want".split(" ")
)

/** Lower-case words; camelCase and kebab-case are split, and the joined form is kept too. */
export function tokenize(text) {
  if (!text) return []
  const out = []
  for (const raw of String(text).split(/[^A-Za-z0-9-]+/)) {
    if (!raw) continue
    const words = raw
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .split(/[\s-]+/)
      .map((w) => w.toLowerCase())
      .filter(Boolean)
    for (const w of words) if (!STOP.has(w)) out.push(stem(w))
    if (words.length > 1) out.push(words.join(""))
  }
  return out
}

/** A very small stemmer: enough to match "tables"/"table", "loading"/"load", "easing"/"ease". */
export function stem(w) {
  let s = w
  if (s.length > 5 && s.endsWith("ies")) s = `${s.slice(0, -3)}y`
  else if (s.length > 5 && s.endsWith("ing")) s = s.slice(0, -3)
  else if (s.length > 4 && /(ch|sh|x|ss)es$/.test(s)) s = s.slice(0, -2)
  else if (s.length > 3 && s.endsWith("s") && !s.endsWith("ss") && !s.endsWith("us")) s = s.slice(0, -1)
  if (s.length > 3 && s.endsWith("e")) s = s.slice(0, -1)
  return s
}

const WEIGHTS = { name: 4, keys: 3, title: 3, synonyms: 3, category: 1.5, headings: 1.5, description: 1, body: 0.5 }

/** Fields that name the document; a query found entirely in them gets a bonus. */
const NAMING = new Set(["name", "keys", "title", "synonyms"])

/** A small preference by kind: a component beats a block that merely mentions the same word. */
const KIND_WEIGHT = { component: 1.4, docs: 1.15, block: 1, token: 0.9 }

function docTokens(fields) {
  const tf = new Map()
  const naming = new Set()
  let length = 0
  for (const [field, text] of Object.entries(fields)) {
    const w = WEIGHTS[field] ?? 1
    for (const t of tokenize(Array.isArray(text) ? text.join(" ") : text)) {
      tf.set(t, (tf.get(t) ?? 0) + w)
      if (NAMING.has(field)) naming.add(t)
      length += w
    }
  }
  return { tf, naming, length }
}

/** The searchable documents of a data bundle. */
export function corpus(data) {
  const docs = []
  for (const c of data.components) {
    docs.push({
      kind: "component",
      id: c.slug,
      title: c.title,
      tier: c.tier,
      summary: c.description,
      fields: { name: [c.title, c.slug], keys: c.exports, synonyms: c.synonyms, category: [c.category, c.group], description: c.description },
    })
  }
  for (const b of data.blocks ?? []) {
    docs.push({
      kind: "block",
      id: b.id,
      title: b.title,
      tier: b.tier,
      summary: b.description,
      fields: { name: [b.title, b.id.replace("/", " ")], category: b.categoryTitle, headings: b.screens.map((s) => s.title), description: b.description },
    })
  }
  for (const t of data.topics ?? []) {
    docs.push({
      kind: "docs",
      id: t.id,
      title: t.title,
      tier: "free",
      summary: t.summary,
      fields: { name: [t.title, t.id], synonyms: t.aliases, headings: t.headings, description: t.summary, body: t.body },
    })
  }
  for (const theme of ["light", "dark"]) {
    for (const [name, value] of Object.entries(data.tokens?.[theme] ?? {})) {
      if (theme === "dark" && data.tokens?.light && name in data.tokens.light) continue
      docs.push({ kind: "token", id: name, title: name, tier: "free", summary: `${value}${theme === "dark" ? " (dark)" : ""}`, fields: { name, description: String(value) } })
    }
  }
  for (const group of ["durations", "easings", "amplitudes"]) {
    for (const m of data.motion?.[group] ?? []) {
      docs.push({ kind: "token", id: m.token, title: m.token, tier: "free", summary: `${m.value} — ${m.use}`, fields: { name: m.token, description: m.use } })
    }
  }
  return docs
}

export function createIndex(data) {
  const docs = corpus(data).map((d) => ({ ...d, ...docTokens(d.fields) }))
  const df = new Map()
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1)
  const avg = docs.reduce((n, d) => n + d.length, 0) / Math.max(docs.length, 1)
  return { docs, df, avg, n: docs.length }
}

const K1 = 1.2
const B = 0.75

/**
 * Ranked results for a query. `kinds` limits the document kinds; `limit` the number of results.
 * A document that matches every query word gets a bonus, so "date picker" ranks Date Picker above
 * everything that is only about dates.
 */
export function search(index, query, { kinds = null, limit = 10 } = {}) {
  const terms = [...new Set(tokenize(query))]
  if (!terms.length) return []
  const results = []
  for (const d of index.docs) {
    if (kinds && !kinds.includes(d.kind)) continue
    let score = 0
    let matched = 0
    for (const t of terms) {
      const f = d.tf.get(t)
      if (!f) continue
      matched++
      const df = index.df.get(t) ?? 0
      const idf = Math.log(1 + (index.n - df + 0.5) / (df + 0.5))
      score += (idf * f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.length) / index.avg))
    }
    if (!score) continue
    if (matched === terms.length && terms.length > 1) score *= 1.5
    if (terms.every((t) => d.naming.has(t))) score *= 1.6
    score *= KIND_WEIGHT[d.kind] ?? 1
    const exact = tokenize(query).join("") === tokenize(d.title).join("")
    if (exact) score *= 2
    results.push({ kind: d.kind, id: d.id, title: d.title, tier: d.tier, summary: d.summary, score: Math.round(score * 100) / 100 })
  }
  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit)
}
