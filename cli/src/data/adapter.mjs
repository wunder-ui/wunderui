/**
 * Reads a component entry of design.json in either of its two shapes and returns one shape.
 *
 *   older design.json   `props` is the TypeScript signature as a string
 *                        ("function Button({ variant, size, ...props }: …): React.JSX.Element;")
 *   newer design.json   `api` lists every exported part with typed props
 *                        ({ name, type, values?, default?, required?, description? }),
 *                        and `props` may still hold the signature
 *   also accepted       `props` as an array of prop objects (one part, named after the component)
 *
 * Output (one per component part):
 *   { name, props: [{ name, type, values, default, required, description }], inherits, source }
 * where `source` is "api" (typed data) or "signature" (parsed from the string: names and defaults,
 * types only where the signature spells them out).
 */

const strip = (s) => (typeof s === "string" ? s.trim() : s)

/** `"md"` → `md`; numbers and expressions stay as written. */
export function cleanDefault(value) {
  if (value === undefined || value === null || value === "") return null
  const s = String(value).trim()
  const quoted = s.match(/^(["'`])(.*)\1$/)
  return quoted ? quoted[2] : s
}

/** String-literal members of a union type, or null when the type is not a pure literal union. */
export function literalValues(type) {
  if (!type || typeof type !== "string") return null
  const parts = splitTopLevel(type.replace(/^\s*\|/, ""), "|").map((p) => p.trim()).filter(Boolean)
  if (parts.length < 2) return null
  const values = []
  for (const p of parts) {
    const m = p.match(/^(["'])(.*)\1$/)
    if (m) values.push(m[2])
    else if (p === "undefined" || p === "null") continue
    else return null
  }
  return values.length ? values : null
}

function normalizeProp(p) {
  const values = Array.isArray(p.values) && p.values.length ? p.values.map(String) : literalValues(p.type)
  return {
    name: String(p.name),
    type: strip(p.type) ?? "unknown",
    values: values ?? null,
    default: cleanDefault(p.default),
    required: Boolean(p.required),
    description: strip(p.description) ?? null,
  }
}

export function normalizeParts(component) {
  if (Array.isArray(component.api) && component.api.length) {
    return component.api.map((part) => ({
      name: part.name,
      props: (part.props ?? []).map(normalizeProp),
      inherits: part.inherits ?? null,
      source: "api",
    }))
  }
  if (Array.isArray(component.props)) {
    return [{ name: component.exports?.[0] ?? component.title, props: component.props.map(normalizeProp), inherits: null, source: "api" }]
  }
  if (typeof component.props === "string" && component.props.trim()) return parseSignature(component.props)
  return []
}

/** The props with a fixed set of values (variant, size, tone …) of the main part. */
export function variantsOf(parts) {
  const main = parts[0]
  if (!main) return {}
  const out = {}
  for (const p of main.props) if (p.values && p.values.length > 1 && !isBooleanUnion(p.values)) out[p.name] = p.values
  return out
}

const isBooleanUnion = (values) => values.every((v) => v === "true" || v === "false")

/* ------------------------------------------------------------ signature parsing */

/** Split at `sep` outside brackets, braces, parentheses, angle brackets and strings. */
export function splitTopLevel(text, sep = ",") {
  const out = []
  let depth = 0
  let quote = null
  let cur = ""
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      cur += ch
      if (ch === quote && text[i - 1] !== "\\") quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch
      cur += ch
      continue
    }
    if ("([{<".includes(ch)) depth++
    else if (")]}>".includes(ch) && !(ch === ">" && text[i - 1] === "=")) depth--
    if (ch === sep && depth === 0) {
      out.push(cur)
      cur = ""
    } else cur += ch
  }
  if (cur.trim()) out.push(cur)
  return out
}

/** Index of the bracket that closes the one at `open`. */
function closing(text, open) {
  const pairs = { "(": ")", "{": "}", "[": "]", "<": ">" }
  const want = pairs[text[open]]
  let depth = 0
  let quote = null
  for (let i = open; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch
    else if (ch === text[open]) depth++
    else if (ch === want && !(want === ">" && text[i - 1] === "=")) {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Best effort for the older format: prop names and defaults from the destructuring, types and
 * descriptions from an inline `{ name?: Type }` literal, values from `type X = "a" | "b"` aliases.
 */
export function parseSignature(signature) {
  const aliases = {}
  for (const m of signature.matchAll(/(?:^|\n)\s*(?:export\s+)?type\s+(\w+)\s*=\s*([^;]+);/g)) aliases[m[1]] = m[2].trim()
  const parts = []
  for (const m of signature.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*(?:<[^(]*>)?\s*\(/g)) {
    const open = m.index + m[0].length - 1
    const close = closing(signature, open)
    if (close < 0) continue
    const params = signature.slice(open + 1, close)
    parts.push({ name: m[1], props: propsFromParams(params, aliases), inherits: null, source: "signature" })
  }
  return parts
}

function propsFromParams(params, aliases) {
  const text = params.trim()
  if (!text.startsWith("{")) return []
  const end = closing(text, 0)
  if (end < 0) return []
  const pattern = text.slice(1, end)
  const typeText = text.slice(end + 1).replace(/^\s*:\s*/, "")
  const typed = inlineTypes(typeText)
  const props = []
  for (const raw of splitTopLevel(pattern, ",")) {
    const item = raw.trim()
    if (!item || item.startsWith("...")) continue
    const [lhs, ...rest] = splitTopLevel(item, "=")
    const def = rest.length ? rest.join("=").trim() : null
    const name = lhs.split(":")[0].trim().replace(/^["']|["']$/g, "")
    if (!name) continue
    const t = typed[name]
    const type = t?.type ? (aliases[t.type] ?? t.type) : "unknown"
    props.push(
      normalizeProp({ name, type, default: def ?? undefined, required: t ? !t.optional && def === null : false, description: t?.description })
    )
  }
  return props
}

/** Members of every `{ … }` object literal in a type expression. */
function inlineTypes(typeText) {
  const out = {}
  for (let i = 0; i < typeText.length; i++) {
    if (typeText[i] !== "{") continue
    const end = closing(typeText, i)
    if (end < 0) break
    const body = typeText.slice(i + 1, end)
    let doc = null
    for (const member of splitTopLevel(body.replace(/\n/g, " "), ";")) {
      const docMatch = member.match(/\/\*\*([\s\S]*?)\*\//)
      if (docMatch) doc = docMatch[1].replace(/\s*\*\s?/g, " ").trim()
      const m = member.replace(/\/\*\*[\s\S]*?\*\//g, "").trim().match(/^["']?([\w-]+)["']?(\?)?\s*:\s*([\s\S]+)$/)
      if (m) {
        out[m[1]] = { type: m[3].trim(), optional: Boolean(m[2]), description: doc }
        doc = null
      }
    }
    i = end
  }
  return out
}
