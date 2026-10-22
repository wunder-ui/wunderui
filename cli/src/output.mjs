/**
 * Output for the documentation commands (component, search, docs, build, doctor).
 *
 * Two audiences read the same command: a person in a terminal and an agent in a pipe.
 *
 *   text      headings and colour, only when stdout is a terminal and NO_COLOR is unset
 *   --dense   the same facts on fewer lines (no descriptions, no blank lines), to save tokens
 *   --json    one JSON document on stdout, always the same envelope:
 *             { "ok": true,  "data": {…}, "error": null }
 *             { "ok": false, "data": null | {…}, "error": { "code": "NOT_FOUND", "message": "…" } }
 *             --json --dense prints it on one line and leaves out long prose fields.
 *
 * Nothing else is ever written to stdout in JSON mode: no colour codes, no spinners, no hints.
 */

/** Exit codes. Stable: scripts may branch on them. */
export const EXIT = {
  OK: 0,
  /** something went wrong, or `doctor` found a failing check */
  ERROR: 1,
  /** the command line itself is wrong (missing argument, unknown option value) */
  USAGE: 2,
  /** the component, topic or playbook does not exist (in this edition) */
  NOT_FOUND: 3,
  /** the content exists but needs a Core or Pro licence */
  LICENSE_REQUIRED: 4,
  /** wunderui.com could not be reached */
  NETWORK: 5,
  /** the bundled data is missing or unreadable */
  DATA: 6,
}

const EXIT_BY_CODE = {
  USAGE: EXIT.USAGE,
  NOT_FOUND: EXIT.NOT_FOUND,
  LICENSE_REQUIRED: EXIT.LICENSE_REQUIRED,
  NETWORK: EXIT.NETWORK,
  DATA_MISSING: EXIT.DATA,
  CHECKS_FAILED: EXIT.ERROR,
}

/** An error with a stable code for the JSON envelope and the exit status. */
export class CliError extends Error {
  constructor(code, message, { data = null, exit, shown = false } = {}) {
    super(message)
    this.code = code
    this.data = data
    /** the command already printed the explanation (text mode prints nothing more) */
    this.shown = shown
    this.exit = exit ?? EXIT_BY_CODE[code] ?? EXIT.ERROR
  }
}

/** The envelope every --json answer uses. */
export function envelope(data, error = null) {
  return error
    ? { ok: false, data: data ?? null, error: { code: error.code ?? "ERROR", message: error.message ?? String(error) } }
    : { ok: true, data, error: null }
}

/** Colour only for a person at a terminal. */
export function colorEnabled(flags = {}, stream = process.stdout, env = process.env) {
  return Boolean(stream?.isTTY) && !flags.json && !("NO_COLOR" in env) && env.TERM !== "dumb"
}

const paint = (on, open, close = 0) => (s) => (on ? `\u001b[${open}m${s}\u001b[${close}m` : String(s))

export function palette(on) {
  return {
    bold: paint(on, 1, 22),
    dim: paint(on, 2, 22),
    green: paint(on, 32, 39),
    yellow: paint(on, 33, 39),
    red: paint(on, 31, 39),
    cyan: paint(on, 36, 39),
  }
}

/**
 * The printer a command gets. `out.text(lines)` is ignored in JSON mode; `out.result(data)` prints
 * the envelope in JSON mode and nothing otherwise, so a command writes both and the mode decides.
 */
export function createOutput(flags = {}, { stdout = process.stdout, env = process.env } = {}) {
  const json = Boolean(flags.json)
  const dense = Boolean(flags.dense)
  const c = palette(colorEnabled(flags, stdout, env))
  const write = (s) => stdout.write(s)
  return {
    json,
    dense,
    c,
    /** human text: an array of lines or one string; blank lines are dropped in dense mode */
    text(lines) {
      if (json) return
      const list = (Array.isArray(lines) ? lines : [lines]).flat().filter((l) => l !== null && l !== undefined && l !== false)
      const kept = dense ? list.filter((l) => String(l).trim() !== "") : list
      write(`${kept.join("\n")}\n`)
    },
    result(data) {
      if (json) write(`${JSON.stringify(envelope(data), null, dense ? 0 : 2)}\n`)
    },
    failure(error, data = null) {
      if (json) write(`${JSON.stringify(envelope(data, error), null, dense ? 0 : 2)}\n`)
    },
  }
}

/** Shorten prose for dense output: the first sentence, at most `max` characters. */
export function brief(text, max = 140) {
  if (!text) return ""
  const s = String(text).replace(/\s+/g, " ").trim()
  const first = s.match(/^(.+?[.!?])(\s|$)/)?.[1] ?? s
  return first.length > max ? `${first.slice(0, max - 1)}…` : first
}

/** Fixed-width columns for terminal tables. */
export function columns(rows, gap = 2) {
  const widths = []
  for (const row of rows) row.forEach((cell, i) => (widths[i] = Math.max(widths[i] ?? 0, visibleLength(cell))))
  return rows.map((row) =>
    row
      .map((cell, i) => (i === row.length - 1 ? String(cell) : String(cell) + " ".repeat(widths[i] - visibleLength(cell) + gap)))
      .join("")
      .trimEnd()
  )
}

const visibleLength = (s) => String(s).replace(/\u001b\[\d+m/g, "").length
