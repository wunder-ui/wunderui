import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Hex per color - the same hue set as the Figma "Badge" component (600 step
// of each Primitives scale). Kept as plain hex (not CSS vars) so color-mix()
// below can compute the light/opacity variants at runtime.
const BADGE_COLORS = {
  blue: "#12AFF0",
  green: "#1AD598",
  red: "#F47690",
  yellow: "#FACA4A",
  purple: "#A584F3",
  indigo: "#555CF3",
  pink: "#FE6BBA",
  orange: "#F3654A",
  alternative: "#6E6D86",
  grey: "#A2A3A3",
  black: "#000000",
  white: "#FFFFFF",
} as const

type BadgeColor = keyof typeof BADGE_COLORS

const badgeVariants = cva(
  cn(
    "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2 text-xs font-semibold whitespace-nowrap transition duration-fast ease-entrance [&>svg]:pointer-events-none [&>svg]:size-3!",
    // Rendered as a button or link, a badge is a chip: it answers the pointer
    // and the keyboard like any other control.
    //
    // The hover cue is a ring in the label's own colour, not a brightness
    // filter. brightness() moves fill and label together, and because the label
    // polarity differs per colour — a deep hue on a bright fill in light mode,
    // white on indigo and alternative in dark mode — no single factor is safe in
    // both directions: brightness-95/125 measured 3.40:1 on dark alternative,
    // 3.81:1 on dark indigo and 4.44:1 on light orange, and the factors that
    // clear AA everywhere (98%/106%) are too small to see. A ring changes
    // nothing about the label's backdrop, so contrast is unaffected whatever the
    // colour. See /scripts/contrast-audit.mjs, which reads this hover treatment
    // out of this file.
    "[&:is(button,a)]:cursor-pointer [&:is(button,a)]:outline-none [&:is(button,a)]:hover:ring-2 [&:is(button,a)]:hover:ring-current/30 [&:is(button,a)]:active:scale-95 [&:is(button,a)]:focus-visible:ring-1 [&:is(button,a)]:focus-visible:ring-ring"
  ),
  {
    variants: {
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      shape: "rounded",
    },
  }
)

type BadgeStyle = "plain" | "light" | "light_border" | "border_color" | "border_grey" | "ghost"

// Hues that have a Figma tint pair (`tint/<hue>` surface + `tint-text/<hue>`
// text, both mode-aware). Grey, black and white have none and fall back to
// color-mix() below.
const TINTED: readonly BadgeColor[] = ["blue", "green", "red", "yellow", "purple", "indigo", "pink", "orange", "alternative"]

// Text on a solid fill — the Figma Badge "primary" state: white on indigo,
// alternative and black (≥ 5:1), and on every lighter hue a deep shade of that
// same hue (28 % of it), so label and icon still read as one tone and pass AA
// (4.75–7.4:1). The pale tint used before fell to 1.5–3:1. Fixed hex rather
// than mode-aware tokens on purpose: the fill keeps its bright hue in dark mode.
const WHITE_TEXT_ON: readonly BadgeColor[] = ["indigo", "alternative", "black"]

const SOLID_TEXT: Partial<Record<BadgeColor, string>> = {
  blue: "#053143",
  purple: "#2E2544",
  pink: "#471E34",
  red: "#442128",
  orange: "#441C15",
  yellow: "#463915",
  green: "#073C2B",
  grey: "#2D2E2E",
}

// The two achromatic badges are spelled out in Figma rather than derived: a
// black badge pales to the grey scale, a white one to the surface grey — a
// color-mix of #000 or #FFF lands somewhere else entirely.
// `text` sits on the badge's own fill; `ink` sits on the card or on nothing at
// all (outline, ghost), so it has to follow the mode — pure black there would
// vanish into a dark card.
const ACHROMATIC: Partial<Record<BadgeColor, { bg: string; text: string; ink: string; border: string }>> = {
  black: { bg: "var(--dark-200)", text: "#000000", ink: "var(--foreground)", border: "var(--dark-300)" },
  white: { bg: "var(--muted)", text: "var(--foreground)", ink: "var(--foreground)", border: "var(--border-control)" },
  // Grey has no tint pair; its 600 hue (#A2A3A3) is a fill colour, too pale
  // for a label on white. Text takes the tertiary text token instead (AA in
  // both modes), the surface keeps the grey hue.
  grey: {
    // 10 % (not 16 %) keeps the tertiary text at 4.7:1 on the surface — 16 % measured 4.46:1
    bg: "color-mix(in srgb, #A2A3A3 10%, var(--card))",
    text: "var(--text-tertiary)",
    ink: "var(--text-tertiary)",
    border: "color-mix(in srgb, #A2A3A3 45%, var(--card))",
  },
}

function styleToCss(color: BadgeColor, style: BadgeStyle) {
  const hex = BADGE_COLORS[color]
  const tinted = TINTED.includes(color)
  const flat = ACHROMATIC[color]
  const tintBg = flat ? flat.bg : tinted ? `var(--tint-${color})` : `color-mix(in srgb, ${hex} 12%, var(--card))`
  const tintText = flat ? flat.text : tinted ? `var(--tint-text-${color})` : hex === "#FFFFFF" ? "#000000" : hex
  const inkText = flat ? flat.ink : tintText
  const tintBorder = flat
    ? flat.border
    : tinted
      ? `color-mix(in srgb, var(--tint-text-${color}) 40%, var(--card))`
      : `color-mix(in srgb, ${hex} 40%, var(--card))`
  switch (style) {
    case "plain":
      return {
        background: hex,
        borderColor: hex,
        color: WHITE_TEXT_ON.includes(color) ? "#FFFFFF" : (SOLID_TEXT[color] ?? "#000000"),
      }
    case "light":
      return {
        background: tintBg,
        borderColor: "transparent",
        color: tintText,
      }
    case "light_border":
      return {
        background: tintBg,
        borderColor: tintBorder,
        color: tintText,
      }
    case "border_color":
      return {
        background: "var(--card)",
        borderColor: tintBorder,
        color: inkText,
      }
    case "border_grey":
      return {
        background: "var(--card)",
        borderColor: "var(--border)",
        color: inkText,
      }
    case "ghost":
      return {
        background: "transparent",
        borderColor: "transparent",
        color: inkText,
      }
  }
}

function Badge({
  className,
  shape,
  color = "blue",
  badgeStyle = "plain",
  style,
  render,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    color?: BadgeColor
    badgeStyle?: BadgeStyle
  }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ shape }), className),
        style: { ...styleToCss(color, badgeStyle), ...style },
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      color,
      badgeStyle,
    },
  })
}

export { Badge, badgeVariants, BADGE_COLORS }
export type { BadgeColor, BadgeStyle }
