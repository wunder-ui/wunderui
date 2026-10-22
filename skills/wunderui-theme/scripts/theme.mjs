#!/usr/bin/env node
// wunderui-theme — one brand colour in, a complete WunderUI brand theme out. No dependencies, Node 20+.
//
//   theme.mjs make --brand "#0F766E" [--accent "#F59E0B"] [--radius none|sm|md|lg|xl] [--font "Geist"]
//                  [--scope .acme] [--out wunderui-theme.css] [--report .wunderui/theme-report.md]
//                  [--parity] [--json] [--force]
//   theme.mjs check [wunderui-theme.css] [--report .wunderui/theme-report.md] [--json]
//
// The generator is a line-by-line port of the website's Theme Builder
// (https://wunderui.com/theme-builder): for the same colour, the scale, the token map, the contrast
// checks and the theme CSS are identical. Everything this script adds on top (cascade corrections,
// accent, radius, font, subtree scope) goes into a clearly marked block after that CSS; `--parity`
// leaves it out and writes exactly what the Theme Builder shows.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"

/* ================================================================ colour maths (as brand-theme.ts) */

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export function hexToRgb(hex) {
  const h = hex.replace("#", "")
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()
}

function rgbToOklch(rgb) {
  const [r, g, b] = rgb.map(toLinear)
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 }
}

function oklchToRgbUnclamped({ l, c, h }) {
  const A = c * Math.cos((h * Math.PI) / 180)
  const B = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3
  const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_
  const b = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_
  return [toGamma(r), toGamma(g), toGamma(b)]
}

const inGamut = (rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005)

/** OKLCH → sRGB, reducing chroma until the colour fits the gamut. */
function oklchToRgb(color) {
  let { c } = color
  let rgb = oklchToRgbUnclamped({ ...color, c })
  while (!inGamut(rgb) && c > 0) {
    c = Math.max(0, c - 0.002)
    rgb = oklchToRgbUnclamped({ ...color, c })
  }
  return rgb
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/* ======================================================================== the scale */

/** WunderUI's indigo scale — the reference every brand scale is fitted to. */
const INDIGO = {
  50: "#F4F5FF",
  100: "#EEEFFE",
  200: "#DDDEFD",
  300: "#BBBEFA",
  400: "#999DF8",
  500: "#777DF5",
  600: "#555CF3",
  700: "#444AC2",
  800: "#333792",
  900: "#222561",
  1000: "#111231",
}
export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]

export function brandScale(hex) {
  const brand = rgbToOklch(hexToRgb(hex))
  const ref = Object.fromEntries(STEPS.map((s) => [s, rgbToOklch(hexToRgb(INDIGO[s]))]))
  const out = {}
  for (const s of STEPS) {
    if (s === 600) {
      out[s] = hex.toUpperCase()
      continue
    }
    // same lightness as indigo's step, the brand's hue, chroma in indigo's proportion
    const c = brand.c * (ref[s].c / ref[600].c)
    out[s] = rgbToHex(oklchToRgb({ l: ref[s].l, c, h: brand.h }))
  }
  return out
}

/* ====================================================================== the mapping */

const LIGHT_PAGE = "#FFFFFF"
const DARK_PAGE = "#17181A"
const DARK_CARD = "#1C1D20"
const INK = "#17181A"

/** The first step from `order` that clears `min` against every background. */
function pick(scale, order, against, min) {
  for (const s of order) if (against.every((bg) => contrast(scale[s], bg) >= min)) return { step: s, moved: s !== order[0] }
  return { step: order[order.length - 1], moved: true, failed: true }
}

/** Port of brandTheme() — returns the same object (plus the picked steps, for the extras). */
export function brandTheme(hex) {
  const scale = brandScale(hex)
  const primary = scale[600]
  const onPrimary = contrast("#FFFFFF", primary) >= 4.5 ? "#FFFFFF" : contrast(INK, primary) >= contrast("#FFFFFF", primary) ? INK : "#FFFFFF"

  // light: links darker if needed, tint text darker if needed
  const lLink = pick(scale, [600, 700, 800, 900], [LIGHT_PAGE], 4.5)
  const lTintText = pick(scale, [800, 900, 1000], [scale[50]], 4.5)
  // dark: links lighter if needed
  const dLink = pick(scale, [400, 300, 200, 100], [DARK_PAGE, DARK_CARD], 4.5)
  const dTintText = pick(scale, [300, 200, 100], [scale[900]], 4.5)
  const lRing = pick(scale, [600, 700, 800], [LIGHT_PAGE], 3)
  const dRing = pick(scale, [400, 300, 200], [DARK_PAGE], 3)

  const light = {
    "--primary": primary,
    "--brand-primary": primary,
    "--primary-foreground": onPrimary,
    "--brand-primary-foreground": onPrimary,
    "--text-link": scale[lLink.step],
    "--ring": scale[lRing.step],
    "--tint-indigo": scale[50],
    "--tint-text-indigo": scale[lTintText.step],
  }
  const dark = {
    "--primary": primary,
    "--brand-primary": primary,
    "--primary-foreground": onPrimary,
    "--brand-primary-foreground": onPrimary,
    "--text-link": scale[dLink.step],
    "--ring": scale[dRing.step],
    "--tint-indigo": scale[900],
    "--tint-text-indigo": scale[dTintText.step],
  }

  const check = (name, fg, bg, min, picked) => {
    const ratio = contrast(fg, bg)
    const out = { name, fg, bg, ratio, min, pass: ratio >= min }
    out.note = picked?.failed ? "No step passes — choose a darker or more saturated colour" : picked?.moved ? `Moved to step ${picked.step}` : undefined
    return out
  }
  const checks = {
    light: [
      check("Button text on primary", onPrimary, primary, 4.5),
      check("Link on page", light["--text-link"], LIGHT_PAGE, 4.5, lLink),
      check("Tint text on tint", light["--tint-text-indigo"], light["--tint-indigo"], 4.5, lTintText),
      check("Focus ring on page", light["--ring"], LIGHT_PAGE, 3, lRing),
    ],
    dark: [
      check("Button text on primary", onPrimary, primary, 4.5),
      check("Link on page", dark["--text-link"], DARK_PAGE, 4.5, dLink),
      check("Link on card", dark["--text-link"], DARK_CARD, 4.5, dLink),
      check("Tint text on tint", dark["--tint-text-indigo"], dark["--tint-indigo"], 4.5, dTintText),
      check("Focus ring on page", dark["--ring"], DARK_PAGE, 3, dRing),
    ],
  }

  const decl = (vars) => Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")
  const css = `/* WunderUI brand theme — ${hex.toUpperCase()}. Import after @wunderui/react/styles.css. */
:root,
.light {
${STEPS.map((s) => `  --brand-${s}: ${scale[s]};`).join("\n")}
${decl({ "--primary-foreground": onPrimary, "--brand-primary-foreground": onPrimary, "--sidebar-primary-foreground": onPrimary })}
${lLink.step !== 600 ? `  --text-link: var(--brand-${lLink.step});\n` : ""}${lTintText.step !== 800 ? `  --tint-text-indigo: var(--brand-${lTintText.step});\n` : ""}}
.dark {
${decl({ "--primary-foreground": onPrimary, "--brand-primary-foreground": onPrimary, "--sidebar-primary-foreground": onPrimary })}
${dLink.step !== 400 ? `  --text-link: var(--brand-${dLink.step});\n  --ring: var(--brand-${dRing.step});\n` : ""}${dTintText.step !== 300 ? `  --tint-text-indigo: var(--brand-${dTintText.step});\n` : ""}}
`
  return { hex: hex.toUpperCase(), scale, light, dark, checks, css, picks: { onPrimary, lLink, lTintText, dLink, dTintText, lRing, dRing } }
}

/* ============================================================== beyond the Theme Builder */

const ACCENT_INK = "#25272A" // the library's ink on brand-secondary
export const RADII = {
  none: { sm: 0, md: 0, lg: 0, xl: 0, "2xl": 0, radius: "0rem" },
  sm: { sm: 2, md: 4, lg: 6, xl: 8, "2xl": 12, radius: "0.375rem" },
  md: { sm: 4, md: 8, lg: 12, xl: 16, "2xl": 24, radius: "0.75rem" }, // library default
  lg: { sm: 6, md: 10, lg: 16, xl: 20, "2xl": 28, radius: "1rem" },
  xl: { sm: 8, md: 12, lg: 20, xl: 24, "2xl": 32, radius: "1.25rem" },
}
// library defaults the brand tokens fall back to (packages/react/src/styles.css)
const LIB_STEP = { light: { "--text-link": 600, "--ring": 600, "--sidebar-ring": 600, "--tint-text-indigo": 800 }, dark: { "--text-link": 400, "--ring": 400, "--sidebar-ring": 400, "--tint-text-indigo": 300 } }

/**
 * The accent becomes --brand-secondary (and chart series 2). Its text colour is whichever of the
 * library's ink and white reads better. In dark mode the chart colour is lifted the way the library
 * lifts its own chart colours (#12AFF0 → #3CC2F5: lightness +0.05, chroma ×0.9 in OKLCH).
 */
function accentTheme(hex) {
  const color = hex.toUpperCase()
  const fg = contrast(ACCENT_INK, color) >= contrast("#FFFFFF", color) ? ACCENT_INK : "#FFFFFF"
  const o = rgbToOklch(hexToRgb(color))
  const darkChart = rgbToHex(oklchToRgb({ l: Math.min(0.92, o.l + 0.05), c: o.c * 0.9, h: o.h }))
  return { hex: color, fg, darkChart, ratio: contrast(fg, color) }
}

export function normalizeHex(raw) {
  if (!raw) return null
  let h = String(raw).trim().replace(/^#/, "")
  if (/^[0-9a-f]{3}$/i.test(h)) h = [...h].map((c) => c + c).join("")
  return /^[0-9a-f]{6}$/i.test(h) ? `#${h.toUpperCase()}` : null
}

const fontStack = (font) => (/^var\(|,/.test(font) ? font : `${/[\s]/.test(font) && !/^["']/.test(font) ? `"${font}"` : font}, ui-sans-serif, system-ui, sans-serif`)

/**
 * The full skill theme. `parity` = exactly the Theme Builder's CSS. Otherwise the Theme Builder CSS
 * comes first, unchanged, and a marked block follows with:
 *  - corrections: the Theme Builder writes light-only overrides into `:root, .light`. With the usual
 *    `<html class="dark">`, that rule matches the html element too and comes after the library's
 *    `.dark` rule (same specificity), so a moved light link / tint text would leak into dark mode.
 *    The block restates the dark value for every such token, and applies the focus ring step the
 *    contrast check picked (the Theme Builder checks it but writes it only in one case).
 *  - accent, radius and font when asked for.
 * With `scope`, the theme is written for one subtree instead of :root (no Theme Builder equivalent).
 */
export function makeTheme({ brand, accent, radius = "md", font, scope, parity = false }) {
  const t = brandTheme(brand)
  const p = t.picks
  const acc = accent ? accentTheme(accent) : null
  const r = RADII[radius]
  const notes = []

  // the value each brand token should end up with, per mode (as steps of the scale)
  const want = {
    light: { "--text-link": p.lLink.step, "--ring": p.lRing.step, "--sidebar-ring": p.lRing.step, "--tint-text-indigo": p.lTintText.step },
    dark: { "--text-link": p.dLink.step, "--ring": p.dRing.step, "--sidebar-ring": p.dRing.step, "--tint-text-indigo": p.dTintText.step },
  }

  let css
  if (scope) {
    const sel = scope.trim()
    const block = (mode) => {
      const w = want[mode]
      const lines = [
        ...(mode === "light" ? STEPS.map((s) => `  --brand-${s}: ${t.scale[s]};`) : []),
        `  --primary: var(--brand-600);`,
        `  --brand-primary: var(--brand-600);`,
        `  --sidebar-primary: var(--brand-600);`,
        `  --chart-1: var(--brand-600);`,
        `  --primary-foreground: ${p.onPrimary};`,
        `  --brand-primary-foreground: ${p.onPrimary};`,
        `  --sidebar-primary-foreground: ${p.onPrimary};`,
        `  --text-link: var(--brand-${w["--text-link"]});`,
        `  --ring: var(--brand-${w["--ring"]});`,
        `  --sidebar-ring: var(--brand-${w["--sidebar-ring"]});`,
        `  --tint-indigo: var(--brand-${mode === "light" ? 50 : 900});`,
        `  --tint-text-indigo: var(--brand-${w["--tint-text-indigo"]});`,
      ]
      if (acc) lines.push(`  --brand-secondary: ${acc.hex};`, `  --brand-secondary-foreground: ${acc.fg};`, `  --chart-2: ${mode === "light" ? acc.hex : acc.darkChart};`)
      if (font && mode === "light") lines.push(`  --font-sans: ${fontStack(font)};`)
      return lines.join("\n")
    }
    css = `/* WunderUI brand theme — ${t.hex}, scoped to ${sel}. Import after @wunderui/react/styles.css. */
${sel},
${sel} .light {
${block("light")}
}
.dark ${sel},
${sel}.dark,
${sel} .dark {
${block("dark")}
}
`
    if (r && radius !== "md") {
      notes.push("Radius is global in WunderUI (Tailwind writes the radius scale into the utilities), so it cannot be scoped — it was left out. Run make without --scope for a global radius.")
    }
    notes.push(`Scoped theme: put the class ${sel} on the wrapper. Light/dark still follow the .light/.dark class on or above it.`)
  } else {
    css = t.css
    if (!parity) {
      const lightBase = new Set(["--primary-foreground", "--brand-primary-foreground", "--sidebar-primary-foreground"])
      if (p.lLink.step !== 600) lightBase.add("--text-link")
      if (p.lTintText.step !== 800) lightBase.add("--tint-text-indigo")
      const darkBase = new Set(["--primary-foreground", "--brand-primary-foreground", "--sidebar-primary-foreground"])
      if (p.dLink.step !== 400) darkBase.add("--text-link").add("--ring")
      if (p.dTintText.step !== 300) darkBase.add("--tint-text-indigo")

      const addLight = {}
      if (p.lRing.step !== 600) {
        addLight["--ring"] = `var(--brand-${p.lRing.step})`
        addLight["--sidebar-ring"] = `var(--brand-${p.lRing.step})`
        notes.push(`Focus ring (light) moved to step ${p.lRing.step}: the Theme Builder checks this but does not write it.`)
      }
      const lightSet = new Set([...lightBase, ...Object.keys(addLight)])
      const addDark = {}
      const restated = []
      for (const tok of Object.keys(want.dark)) {
        if (darkBase.has(tok)) continue
        const leaks = lightSet.has(tok)
        const differs = want.dark[tok] !== LIB_STEP.dark[tok]
        if (leaks || differs) addDark[tok] = `var(--brand-${want.dark[tok]})`
        if (leaks) restated.push(`${tok} → step ${want.dark[tok]}`)
        else if (differs) notes.push(`${tok} (dark) moved to step ${want.dark[tok]}: the Theme Builder checks this but does not write it.`)
      }
      if (restated.length) notes.push(`Restated for .dark (${restated.join(", ")}): the light override in ":root, .light" also matches <html class="dark"> and would otherwise win over the library's dark value.`)
      if (acc) {
        addLight["--brand-secondary"] = acc.hex
        addLight["--brand-secondary-foreground"] = acc.fg
        addLight["--chart-2"] = acc.hex
        addDark["--brand-secondary"] = acc.hex
        addDark["--brand-secondary-foreground"] = acc.fg
        addDark["--chart-2"] = acc.darkChart
      }
      if (font) addLight["--font-sans"] = fontStack(font)
      if (r && radius !== "md") addLight["--radius"] = r.radius

      const decl = (vars) => Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")
      let extra = ""
      if (Object.keys(addLight).length) extra += `:root,\n.light {\n${decl(addLight)}\n}\n`
      if (Object.keys(addDark).length) extra += `.dark {\n${decl(addDark)}\n}\n`
      if (r && radius !== "md") {
        extra += `/* Radius "${radius}". @theme needs this file to be processed by Tailwind: import it from the CSS file that imports tailwindcss. */\n@theme inline {\n${["sm", "md", "lg", "xl", "2xl"].map((k) => `  --radius-${k}: ${r[k]}px;`).join("\n")}\n}\n`
      }
      if (extra) css += `\n/* Added by the wunderui-theme skill — not part of the Theme Builder output. */\n${extra}`
    }
  }
  if (parity && (acc || font || (radius && radius !== "md"))) notes.push("--parity writes the Theme Builder CSS only; --accent, --radius and --font were ignored.")
  return { theme: t, accent: acc, radius, font, scope, css, notes }
}

/* ========================================================================= presets */

// The library's surfaces (packages/react/src/styles.css): text tokens must read on all of them.
const SURFACES = {
  light: ["#FFFFFF", "#F9FBFC", "#F1F5F7"], // background/card/popover, bg-page, muted/subtle/accent
  dark: ["#17181A", "#1C1D20", "#25272A", "#323438"], // background/bg-page, card/popover, subtle, muted/accent
}

const LIGHT_200 = "#F1F5F7" // hover fill of Button variant "light"
const GRADIENT_STOP = "#5A5EF4" // top stop of Button variant "gradient" (button.tsx)

// Which step of the brand scale each brand token uses. A list means "the first step that passes".
const BRAND_STEPS = {
  light: { primary: 600, link: [600, 700, 800, 900], ring: [600, 700, 800], tint: 50, tintText: [800, 900, 1000], chart1: 600, gradientStart: 500 },
  dark: { primary: 600, link: [400, 300, 200, 100], ring: [400, 300, 200], tint: 900, tintText: [300, 200, 100], chart1: 600, gradientStart: 500 },
}
// Mono: an almost-black primary in light mode; in dark mode the mid-grey step 600 with white text, because
// the library also sets primary as text on white (Button variant "light") and under its hard-coded gradient stop.
const MONO_STEPS = {
  light: { primary: 900, link: [800, 900], ring: [700, 800], tint: 100, tintText: [900, 1000], chart1: 800, gradientStart: 700 },
  dark: { primary: 600, link: [300, 200, 100], ring: [400, 300], tint: 900, tintText: [200, 100], chart1: 300, gradientStart: 500 },
}

/** The dark-mode lift the library applies to its own chart colours (#12AFF0 → #3CC2F5). */
const liftForDark = (hex) => {
  const o = rgbToOklch(hexToRgb(hex))
  return rgbToHex(oklchToRgb({ l: Math.min(0.92, o.l + 0.05), c: o.c * 0.9, h: o.h }))
}

/**
 * The ready-made themes. Each one is a brand colour run through the same generator as `make`
 * (step 600 = the colour, the other steps at indigo's lightness), plus the extra values it needs:
 * `mono` uses the grey scale the other way round, `charts` replaces a chart series whose hue
 * would sit too close to the brand. Only values of existing tokens change — no new token names.
 * WunderUI's own indigo is the default and needs no file.
 */
export const PRESETS = {
  lagoon: {
    label: "Lagoon",
    description: "Cool teal-green. Calm and technical — health, climate, developer tools.",
    brand: "#0A7C72",
    // chart-4 (green) sits next to the teal brand: an orange series keeps the five apart
    charts: { light: { "--chart-4": "#F3654A" }, dark: { "--chart-4": liftForDark("#F3654A") } },
  },
  ember: {
    label: "Ember",
    description: "Warm coral-red. Energetic and friendly — consumer apps, commerce, media.",
    brand: "#C73F2C",
  },
  graphite: {
    label: "Graphite",
    description: "Neutral graphite, almost monochrome. Quiet and editorial — the content brings the colour.",
    brand: "#686F7C",
    mono: true,
  },
}

/**
 * One preset as a complete theme: the scale, the token map per mode (as CSS values and as hex),
 * the contrast checks and the CSS file. Every token the light block sets is set again for .dark,
 * so <html class="dark"> (which also matches :root) never picks up a light value.
 */
export function presetTheme(name) {
  const p = PRESETS[name]
  if (!p) throw new Error(`unknown preset "${name}" — one of ${Object.keys(PRESETS).join(", ")}`)
  const scale = brandScale(p.brand)
  const steps = p.mono ? MONO_STEPS : BRAND_STEPS
  const tokens = {}
  const hexes = {}
  const checks = {}
  for (const mode of ["light", "dark"]) {
    const s = steps[mode]
    const surfaces = SURFACES[mode]
    const primary = scale[s.primary]
    const onPrimary = contrast("#FFFFFF", primary) >= contrast(INK, primary) ? "#FFFFFF" : INK
    const link = pick(scale, s.link, surfaces, 4.5)
    const ring = pick(scale, s.ring, [surfaces[0], surfaces[1]], 3)
    const tintText = pick(scale, s.tintText, [scale[s.tint]], 4.5)
    const v = (step) => `var(--brand-${step})`
    tokens[mode] = {
      "--primary": v(s.primary),
      "--brand-primary": v(s.primary),
      "--sidebar-primary": v(s.primary),
      "--primary-foreground": onPrimary,
      "--brand-primary-foreground": onPrimary,
      "--sidebar-primary-foreground": onPrimary,
      "--text-link": v(link.step),
      "--ring": v(ring.step),
      "--sidebar-ring": v(ring.step),
      "--tint-indigo": v(s.tint),
      "--tint-text-indigo": v(tintText.step),
      "--chart-1": v(s.chart1),
      "--gradient-start-3": v(s.gradientStart),
      ...(p.charts?.[mode] ?? {}),
    }
    hexes[mode] = Object.fromEntries(Object.entries(tokens[mode]).map(([k, val]) => [k, /^var\(--brand-(\d+)\)$/.test(val) ? scale[Number(val.match(/\d+/)[0])] : val]))
    const h = hexes[mode]
    const page = surfaces[0]
    const note = (picked) => (picked.failed ? "No step passes" : picked.moved ? `Moved to step ${picked.step}` : undefined)
    const c = (name, fg, bg, min, n) => ({ name, fg, bg, ratio: contrast(fg, bg), min, pass: contrast(fg, bg) >= min, note: n })
    checks[mode] = [
      c("Button text on primary", h["--primary-foreground"], h["--primary"], 4.5),
      ...surfaces.map((bg) => c(`Link on ${bg}`, h["--text-link"], bg, 4.5, note(link))),
      c("Tint text on tint", h["--tint-text-indigo"], h["--tint-indigo"], 4.5, note(tintText)),
      c("Focus ring on page", h["--ring"], page, 3, note(ring)),
      c("Focus ring on card", h["--ring"], surfaces[1], 3, note(ring)),
      c("Primary fill on page (UI)", h["--primary"], page, 3),
      c("Chart 1 on page (UI)", h["--chart-1"], page, 3),
      // Button variant "light" (bg-white text-primary, hover light-200) looks the same in both modes
      c("Primary as text on white", h["--primary"], "#FFFFFF", 4.5),
      c("Primary as text on #F1F5F7", h["--primary"], LIGHT_200, 4.5),
      // Button variant "gradient" starts at a hard-coded indigo stop in button.tsx
      c("Button text on gradient stop", h["--primary-foreground"], GRADIENT_STOP, 4.5),
    ]
  }
  const decl = (vars) => Object.entries(vars).map(([k, val]) => `  ${k}: ${val};`).join("\n")
  const css = `/* WunderUI theme "${p.label}" (${p.brand}) — ${p.description}
   Import after the WunderUI stylesheet:  @import "@wunderui/react/themes/${name}.css";
   Generated by the wunderui-theme skill (theme.mjs preset ${name}); do not edit by hand. */
:root,
.light {
${STEPS.map((s) => `  --brand-${s}: ${scale[s]};`).join("\n")}
${decl(tokens.light)}
}
/* Every token above is set again here: <html class="dark"> also matches :root. */
.dark {
${decl(tokens.dark)}
}
`
  return { name, label: p.label, description: p.description, brand: p.brand, mono: Boolean(p.mono), scale, tokens, hexes, checks, css }
}

/* =========================================================================== check */

function parseColor(v) {
  if (!v) return null
  const s = v.trim()
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(s)) return normalizeHex(s)
  if (/^#[0-9a-f]{8}$/i.test(s)) return normalizeHex(s.slice(0, 7))
  const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s)
  if (m) return rgbToHex([m[1], m[2], m[3]].map((x) => Number(x) / 255))
  if (/^white$/i.test(s)) return "#FFFFFF"
  if (/^black$/i.test(s)) return "#000000"
  return null
}

/** `{ selectors, decls, order }` for every innermost `selector { … }` block. */
function blocks(css, offset = 0) {
  const out = []
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "")
  let i = 0
  for (const [, sel, body] of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = sel.split(";").pop().trim()
    if (selector.startsWith("@")) continue
    const decls = {}
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) decls[name] = value.trim()
    out.push({ selectors: selector.split(",").map((x) => x.trim()).filter(Boolean), decls, order: offset + i++ })
  }
  return out
}

// the library's defaults, used when the project has no node_modules/@wunderui/react
const FALLBACK_LIB = `:root, .light {
${STEPS.map((s) => `--brand-${s}: ${INDIGO[s]};`).join(" ")}
--background: #FFFFFF; --card: #FFFFFF;
--primary: var(--brand-600); --primary-foreground: #FFFFFF; --brand-primary: var(--brand-600); --brand-primary-foreground: #FFFFFF;
--brand-secondary: #12AFF0; --brand-secondary-foreground: #25272A;
--ring: var(--brand-600); --sidebar-ring: var(--brand-600); --text-link: var(--brand-600);
--tint-indigo: var(--brand-50); --tint-text-indigo: var(--brand-800); }
.dark {
--background: #17181A; --card: #1C1D20;
--primary: var(--brand-600); --primary-foreground: #FFFFFF; --brand-primary: var(--brand-600); --brand-primary-foreground: #FFFFFF;
--brand-secondary: #12AFF0; --brand-secondary-foreground: #25272A;
--ring: var(--brand-400); --sidebar-ring: var(--brand-400); --text-link: var(--brand-400);
--tint-indigo: var(--brand-900); --tint-text-indigo: var(--brand-300); }`

function libraryCss(cwd) {
  for (const p of ["node_modules/@wunderui/react/dist/styles.css", "node_modules/@wunderui/react/src/styles.css"]) {
    const f = join(cwd, p)
    if (existsSync(f)) return { css: readFileSync(f, "utf8"), source: p }
  }
  return { css: FALLBACK_LIB, source: "built-in defaults (no node_modules/@wunderui/react found)" }
}

// which rules reach the element that carries the theme (<html>, or the scope wrapper) in each mode
const lastCompound = (s) => s.trim().split(/[\s>+~]+/).pop()
const descendant = (s) => /[\s>+~]/.test(s.trim())
const matchesLight = (s) => !/\.dark\b/.test(s) && !(descendant(s) && /\.light\b/.test(lastCompound(s)))
const matchesDark = (s) => !/\.light\b/.test(lastCompound(s)) && !(descendant(s) && /\.dark\b/.test(lastCompound(s)) && !/\.dark\b/.test(s.trim().split(/[\s>+~]+/)[0]))
const specificity = (s) => (s.match(/[.:#[]/g) || []).length

/**
 * Resolves the brand tokens for <html class="light"> and <html class="dark"> (or, for a scoped
 * theme, the scope element under them) the way the cascade does: library rules first, then the
 * theme file, ordered by specificity and then by source order.
 */
export function resolveModes(themeCss, libCss) {
  const lib = blocks(libCss).filter((b) => b.selectors.some((s) => s === ":root" || s === ".light" || s === ".dark"))
  const mine = blocks(themeCss, 100000)
  const result = {}
  for (const mode of ["light", "dark"]) {
    const applied = []
    for (const b of lib) {
      const match = b.selectors.filter((s) => (mode === "light" ? s === ":root" || s === ".light" : s === ":root" || s === ".dark"))
      if (match.length) applied.push({ spec: 1, order: b.order, decls: b.decls })
    }
    for (const b of mine) {
      // ":root, .light" also reaches <html class="dark"> — the leak the corrections block fixes
      const match = b.selectors.filter(mode === "light" ? matchesLight : matchesDark)
      if (match.length) applied.push({ spec: Math.max(...match.map(specificity)), order: b.order, decls: b.decls })
    }
    applied.sort((a, b) => a.spec - b.spec || a.order - b.order)
    const vars = {}
    for (const a of applied) Object.assign(vars, a.decls)
    const get = (name, depth = 0) => {
      const v = vars[name]
      if (v === undefined || depth > 10) return null
      const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(v)
      if (m) return get(m[1], depth + 1) ?? (m[2] ? parseColor(m[2]) : null)
      return parseColor(v)
    }
    result[mode] = { vars, get }
  }
  return result
}

export function checkCss(themeCss, libCss) {
  const modes = resolveModes(themeCss, libCss)
  const out = {}
  for (const mode of ["light", "dark"]) {
    const g = modes[mode].get
    const page = g("--background") ?? (mode === "light" ? LIGHT_PAGE : DARK_PAGE)
    const card = g("--card") ?? (mode === "light" ? LIGHT_PAGE : DARK_CARD)
    const pairs = [
      ["Button text on primary", "--primary-foreground", "--primary", 4.5],
      ["Link on page", "--text-link", page, 4.5],
      ...(mode === "dark" ? [["Link on card", "--text-link", card, 4.5]] : []),
      ["Tint text on tint", "--tint-text-indigo", "--tint-indigo", 4.5],
      ["Focus ring on page", "--ring", page, 3],
      ["Accent text on accent", "--brand-secondary-foreground", "--brand-secondary", 4.5],
    ]
    out[mode] = pairs.map(([name, f, b, min]) => {
      const fg = f.startsWith("--") ? g(f) : f
      const bg = b.startsWith("--") ? g(b) : b
      if (!fg || !bg) return { name, fg, bg, ratio: NaN, min, pass: false, note: `could not resolve ${!fg ? f : b}` }
      const ratio = contrast(fg, bg)
      return { name, fg, bg, ratio, min, pass: ratio >= min }
    })
  }
  return out
}

/* ========================================================================== report */

const fmt = (r) => (Number.isFinite(r) ? `${r.toFixed(2)}:1` : "—")
function checkTable(checks) {
  const rows = []
  for (const mode of ["light", "dark"]) for (const c of checks[mode]) rows.push(`| ${mode} | ${c.name} | \`${c.fg ?? "?"}\` on \`${c.bg ?? "?"}\` | ${fmt(c.ratio)} | ${c.min}:1 | ${c.pass ? "pass" : "**FAIL**"} | ${c.note ?? ""} |`)
  return ["| Mode | Pair | Colours | Ratio | Min | Result | Note |", "|---|---|---|---|---|---|---|", ...rows].join("\n")
}

function makeReport(res, file, verify) {
  const t = res.theme
  const lines = [
    `# WunderUI theme — ${t.hex}`,
    "",
    `Generated by wunderui-theme on ${new Date().toISOString().slice(0, 10)} → \`${file}\`. Same generator as https://wunderui.com/theme-builder.`,
    "",
    "## Brand scale",
    "",
    "| Step | Hex | White text | Ink text |",
    "|---|---|---|---|",
    ...STEPS.map((s) => `| ${s}${s === 600 ? " (primary)" : ""} | \`${t.scale[s]}\` | ${fmt(contrast("#FFFFFF", t.scale[s]))} | ${fmt(contrast(INK, t.scale[s]))} |`),
    "",
    "## Tokens",
    "",
    "| Token | Light | Dark |",
    "|---|---|---|",
    ...Object.keys(t.light).map((k) => `| \`${k}\` | \`${t.light[k]}\` | \`${t.dark[k]}\` |`),
  ]
  if (res.accent) lines.push(`| \`--brand-secondary\` (accent) | \`${res.accent.hex}\` | \`${res.accent.hex}\` |`, `| \`--brand-secondary-foreground\` | \`${res.accent.fg}\` | \`${res.accent.fg}\` |`, `| \`--chart-2\` | \`${res.accent.hex}\` | \`${res.accent.darkChart}\` |`)
  lines.push("", "## Contrast (Theme Builder checks)", "", checkTable(t.checks), "", "## Contrast of the written file (cascade-resolved)", "", checkTable(verify))
  if (res.notes.length) lines.push("", "## Notes", "", ...res.notes.map((n) => `- ${n}`))
  lines.push(
    "",
    "## Install",
    "",
    "```css",
    '@import "tailwindcss";',
    '@import "@wunderui/react/styles.css";',
    `@import "./${file.replace(/^\.\//, "")}"; /* after WunderUI, so the brand tokens win */`,
    "```",
    "",
  )
  return lines.join("\n")
}

/* ============================================================================= CLI */

function args(argv) {
  const o = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=")
      if (v !== undefined) o[k] = v
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) o[k] = argv[++i]
      else o[k] = true
    } else o._.push(a)
  }
  return o
}

const write = (file, text) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
}
const line = (c) => `  ${c.pass ? "pass" : "FAIL"}  ${c.name.padEnd(24)} ${fmt(c.ratio).padStart(8)}  (min ${c.min})${c.note ? `  — ${c.note}` : ""}`

function main() {
  const o = args(process.argv.slice(2))
  const cmd = o._[0]
  const cwd = process.cwd()

  if (cmd === "make") {
    const brand = normalizeHex(o.brand)
    if (!brand) return fail(`--brand needs a hex colour like "#0F766E" (got ${o.brand ?? "nothing"})`)
    const accent = o.accent ? normalizeHex(o.accent) : null
    if (o.accent && !accent) return fail(`--accent needs a hex colour (got ${o.accent})`)
    const radius = typeof o.radius === "string" ? o.radius : "md"
    if (!RADII[radius]) return fail(`--radius must be one of ${Object.keys(RADII).join(", ")}`)
    if (o.scope && !/^[.#][\w-]+$/.test(o.scope)) return fail("--scope must be a single class or id, e.g. .acme")
    const res = makeTheme({ brand, accent, radius, font: typeof o.font === "string" ? o.font : undefined, scope: o.scope, parity: Boolean(o.parity) })
    const outFile = resolve(cwd, typeof o.out === "string" ? o.out : "wunderui-theme.css")
    const reportFile = resolve(cwd, typeof o.report === "string" ? o.report : ".wunderui/theme-report.md")
    if (existsSync(outFile) && !o.force && !readFileSync(outFile, "utf8").startsWith("/* WunderUI brand theme")) {
      return fail(`${relative(cwd, outFile)} exists and was not written by this skill — pass --force to overwrite or choose --out`)
    }
    const lib = libraryCss(cwd)
    const verify = checkCss(res.css, lib.css)
    write(outFile, res.css)
    const rel = relative(cwd, outFile).split("\\").join("/")
    write(reportFile, makeReport(res, rel, verify))
    if (o.json) {
      const { picks, ...theme } = res.theme
      console.log(JSON.stringify({ ...theme, accent: res.accent, cssWritten: res.css, verify, notes: res.notes }, null, 2))
      return
    }
    console.log(`WunderUI theme ${res.theme.hex}${res.scope ? ` scoped to ${res.scope}` : ""}${o.parity ? " (Theme Builder parity)" : ""}`)
    console.log(`  scale  ${STEPS.map((s) => `${s} ${res.theme.scale[s]}`).join("  ")}`)
    console.log(`  primary-foreground ${res.theme.picks.onPrimary}`)
    for (const mode of ["light", "dark"]) {
      console.log(`${mode}:`)
      for (const c of verify[mode]) {
        const tb = res.theme.checks[mode].find((x) => x.name === c.name)
        console.log(line({ ...c, note: tb?.note }))
      }
    }
    for (const n of res.notes) console.log(`note: ${n}`)
    console.log(`wrote ${rel}`)
    console.log(`wrote ${relative(cwd, reportFile).split("\\").join("/")}`)
    const failed = [...verify.light, ...verify.dark].filter((c) => !c.pass)
    if (failed.length) console.log(`${failed.length} pair(s) still below AA — see the report.`)
    process.exitCode = failed.length ? 2 : 0
    return
  }

  if (cmd === "check") {
    const file = resolve(cwd, o._[1] ?? "wunderui-theme.css")
    if (!existsSync(file)) return fail(`${relative(cwd, file)} not found`)
    const lib = libraryCss(cwd)
    const res = checkCss(readFileSync(file, "utf8"), lib.css)
    const rel = relative(cwd, file).split("\\").join("/")
    if (o.json) return console.log(JSON.stringify(res, null, 2))
    console.log(`Contrast of ${rel} on top of ${lib.source}`)
    for (const mode of ["light", "dark"]) {
      console.log(`${mode}:`)
      for (const c of res[mode]) console.log(line(c))
    }
    const report = resolve(cwd, typeof o.report === "string" ? o.report : ".wunderui/theme-report.md")
    write(report, `# WunderUI theme check — ${rel}\n\nResolved through the cascade on top of ${lib.source} (${new Date().toISOString().slice(0, 10)}).\n\n${checkTable(res)}\n`)
    console.log(`wrote ${relative(cwd, report).split("\\").join("/")}`)
    const failed = [...res.light, ...res.dark].filter((c) => !c.pass)
    process.exitCode = failed.length ? 2 : 0
    return
  }

  if (cmd === "preset") {
    const name = o._[1]
    if (!name || name === "list") {
      console.log("Ready-made themes (WunderUI indigo is the default and needs no file):")
      for (const [k, p] of Object.entries(PRESETS)) console.log(`  ${k.padEnd(10)} ${p.brand}  ${p.label} — ${p.description}`)
      console.log(`\nWrite one:  preset <name> [--out wunderui-theme.css] [--force] [--json]`)
      return
    }
    if (!PRESETS[name]) return fail(`unknown preset "${name}" — one of ${Object.keys(PRESETS).join(", ")} (or "list")`)
    const res = presetTheme(name)
    const lib = libraryCss(cwd)
    const verify = checkCss(res.css, lib.css)
    if (o.json) return console.log(JSON.stringify({ ...res, verify }, null, 2))
    const packaged = join(cwd, "node_modules/@wunderui/react/themes", `${name}.css`)
    if (existsSync(packaged) && typeof o.out !== "string") {
      console.log(`${res.label} ships with your @wunderui/react (Core/Pro). Import it after the WunderUI stylesheet:`)
      console.log(`  @import "@wunderui/react/themes/${name}.css";`)
      console.log(`Pass --out <file> to write a local copy instead (to scope or extend it).`)
    } else {
      const outFile = resolve(cwd, typeof o.out === "string" ? o.out : "wunderui-theme.css")
      if (existsSync(outFile) && !o.force && !/^\/\* WunderUI (brand )?theme/.test(readFileSync(outFile, "utf8"))) {
        return fail(`${relative(cwd, outFile)} exists and was not written by this skill — pass --force to overwrite or choose --out`)
      }
      write(outFile, res.css)
      console.log(`wrote ${relative(cwd, outFile).split("\\").join("/")}  — import it after @wunderui/react/styles.css`)
    }
    console.log(`WunderUI theme ${res.label} (${res.brand})`)
    console.log(`  scale  ${STEPS.map((s) => `${s} ${res.scale[s]}`).join("  ")}`)
    for (const mode of ["light", "dark"]) {
      console.log(`${mode}:`)
      for (const c of res.checks[mode]) console.log(line(c))
      for (const c of verify[mode].filter((x) => !x.pass)) console.log(line({ ...c, name: `${c.name} (cascade)` }))
    }
    const failed = [...res.checks.light, ...res.checks.dark, ...verify.light, ...verify.dark].filter((c) => !c.pass)
    process.exitCode = failed.length ? 2 : 0
    return
  }

  console.log(`wunderui-theme — one brand colour in, a checked WunderUI theme out

  make   --brand <hex> [--accent <hex>] [--radius ${Object.keys(RADII).join("|")}] [--font <family>]
         [--scope .class] [--out wunderui-theme.css] [--report .wunderui/theme-report.md]
         [--parity] [--json] [--force]
  preset list | <${Object.keys(PRESETS).join("|")}> [--out wunderui-theme.css] [--force] [--json]
  check  [wunderui-theme.css] [--report .wunderui/theme-report.md] [--json]

Exit code 2 when a pair stays below WCAG AA.`)
}

function fail(msg) {
  console.error(`error: ${msg}`)
  process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main()
