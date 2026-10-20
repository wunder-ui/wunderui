/**
 * Picks the glyph colour for text or an icon drawn on an arbitrary fill.
 *
 * `readableOn("#FACA4A")` returns "dark" (white would be 1.6:1, the dark
 * content colour 9.8:1). A fill the function cannot parse (var(), named
 * colours, color-mix()) returns null; the caller then lets CSS decide.
 */

const DARK_CONTENT = "#25272A" // --neutral-dark-content

function channel(value: number) {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function luminance([r, g, b]: [number, number, number]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function parseColor(input: string): [number, number, number] | null {
  const value = input.trim().toLowerCase()
  const hex = /^#([0-9a-f]{3,8})$/.exec(value)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("")
    if (h.length !== 6 && h.length !== 8) return null
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(value)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  return null
}

/** "light" = white glyph, "dark" = dark glyph, whichever has the higher WCAG contrast; null = unknown fill. */
export function readableOn(fill: string): "light" | "dark" | null {
  const rgb = parseColor(fill)
  if (!rgb) return null
  const y = luminance(rgb)
  const white = 1.05 / (y + 0.05)
  const dark = (y + 0.05) / (luminance(parseColor(DARK_CONTENT)!) + 0.05)
  return white >= dark ? "light" : "dark"
}

/**
 * CSS-only counterpart for fills that are not literal colours (relative colour
 * syntax: white on dark fills, a near-black on light ones, switching at the
 * point where both have the same contrast).
 */
export function readableOnCss(fill: string): string {
  return `oklch(from ${fill} clamp(0.25, (0.6 - l) * 1000, 1) 0 0)`
}
