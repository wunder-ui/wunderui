import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import {
  Check,
  Loader2,
  Lock,
  Minus,
  Moon,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { opticalCenter } from "@/lib/optical-center"

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
    "group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden border border-transparent font-semibold whitespace-nowrap transition duration-fast ease-entrance [&>svg]:pointer-events-none",
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
    "[&:is(button,a)]:cursor-pointer [&:is(button,a)]:outline-none [&:is(button,a)]:hover:ring-2 [&:is(button,a)]:hover:ring-current/30 [&:is(button,a)]:active:scale-95 motion-reduce:[&:is(button,a)]:active:scale-100 [&:is(button,a)]:focus-ring"
  ),
  {
    variants: {
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
      },
      size: {
        sm: "h-5 gap-1 px-2 text-xs [&>svg]:size-3!",
        md: "h-6 gap-1.5 px-2.5 text-sm [&>svg]:size-3.5!",
      },
    },
    defaultVariants: {
      shape: "rounded",
      size: "sm",
    },
  }
)

type BadgeStyle = "plain" | "light" | "light_border" | "border_color" | "border_grey" | "ghost"

// Hues that have a Figma tint pair (`tint/<hue>` surface + `tint-text/<hue>`
// text, both mode-aware). Grey, black and white have none and fall back to
// color-mix() below.
const TINTED: readonly BadgeColor[] = ["blue", "green", "red", "yellow", "purple", "indigo", "pink", "orange", "alternative"]

// Text on a solid fill — the Figma Badge "primary" state: white on indigo,
// alternative and black (≥ 5:1), and on every lighter hue the darkest step of that
// same hue (the Primitives <hue>-1000 variable, the same one Figma binds), so label
// and icon still read as one tone and pass AA (6.1–8.0:1). The pale tint used before
// fell to 1.5–3:1. Mode-independent on purpose: the fill keeps its bright hue in dark mode.
const WHITE_TEXT_ON: readonly BadgeColor[] = ["indigo", "alternative", "black"]

const SOLID_TEXT: Partial<Record<BadgeColor, string>> = {
  blue: "var(--blue-1000)",
  purple: "var(--purple-1000)",
  pink: "var(--pink-1000)",
  red: "var(--red-1000)",
  orange: "var(--orange-1000)",
  yellow: "var(--yellow-1000)",
  green: "var(--green-1000)",
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
    border: "var(--border-control)",
  },
}

// Figma Badge / Plain: the label sits on the page, not on a tint, so it takes the semantic text token
// (link, success, error) where one exists and the hue's tint-text everywhere else.
const GHOST_TEXT: Partial<Record<BadgeColor, string>> = {
  indigo: "var(--text-link)",
  green: "var(--text-success)",
  red: "var(--text-error)",
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
  // Figma Badge / Outline: the rim is the tint-text token of the hue itself (a variable, not a blend).
  const outlineBorder = flat ? flat.border : tinted ? `var(--tint-text-${color})` : tintBorder
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
        borderColor: outlineBorder,
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
        color: GHOST_TEXT[color] ?? inkText,
      }
  }
}

function Badge({
  className,
  shape,
  size = "sm",
  color = "blue",
  badgeStyle = "plain",
  style,
  render,
  dot,
  onRemove,
  removeLabel = "Remove",
  children,
  ...props
}: useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    color?: BadgeColor
    badgeStyle?: BadgeStyle
    dot?: boolean
    onRemove?: () => void
    removeLabel?: string
  }) {
  // Don't render the remove button when the badge is a button/link (`render`),
  // as that would nest interactive elements.
  const removeButton = onRemove && render === undefined ? (
    <button
      type="button"
      data-slot="badge-remove"
      aria-label={removeLabel}
      onClick={onRemove}
      className="-mr-1 ml-0.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition duration-fast ease-entrance hover:bg-current/15 active:scale-90 motion-reduce:active:scale-100 focus-ring"
    >
      <X aria-hidden="true" className="size-3" />
    </button>
  ) : null

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ shape, size }), className),
        style: { ...styleToCss(color, badgeStyle), ...style },
        children: (
          <>
            {dot && (
              <span
                data-slot="badge-dot"
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-current"
              />
            )}
            {opticalCenter(children)}
            {removeButton}
          </>
        ),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      color,
      badgeStyle,
      size,
      ...(dot ? { dot: true } : {}),
    },
  })
}

type BadgeCounterTone = "neutral" | "brand" | "danger"

const BADGE_COUNTER_TONE_CLASSES: Record<BadgeCounterTone, string> = {
  neutral: "bg-bg-subtle text-foreground data-[zero]:text-text-tertiary",
  brand: "bg-primary text-primary-foreground",
  danger: "bg-destructive text-destructive-foreground",
}

const BADGE_COUNTER_KIND_CLASSES: Record<"inline" | "overlay", string> = {
  inline: "h-5 min-w-5 px-1.5 text-xs font-semibold",
  overlay: "absolute top-0 right-0 z-10 h-4 min-w-4 translate-x-1/2 -translate-y-1/2 px-1 text-[11px] font-medium ring-2 ring-card",
}

function BadgeCounter({
  count,
  max = 99,
  tone = "neutral",
  overlay = false,
  hideZero,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  count: number
  max?: number
  tone?: BadgeCounterTone
  overlay?: boolean
  hideZero?: boolean
}) {
  const resolvedHideZero = hideZero ?? overlay
  const shown = Math.max(0, Math.trunc(count))
  if (shown <= 0 && resolvedHideZero) return null
  const text = shown > max ? `${max}+` : String(shown)

  return (
    <span
      data-slot="badge-counter"
      data-tone={tone}
      data-kind={overlay ? "overlay" : "inline"}
      data-zero={shown === 0 ? "" : undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full tabular-nums leading-none whitespace-nowrap select-none",
        BADGE_COUNTER_KIND_CLASSES[overlay ? "overlay" : "inline"],
        BADGE_COUNTER_TONE_CLASSES[tone],
        className
      )}
      {...props}
    >
      <span className="optical-center">{text}</span>
    </span>
  )
}

type BadgeIndicatorKind = "unread" | "online" | "away" | "busy" | "offline" | "check" | "warning" | "lock"

const DEFAULT_LABELS: Record<BadgeIndicatorKind, string> = {
  unread: "Unread",
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
  check: "Done",
  warning: "Warning",
  lock: "Locked",
}

const INDICATOR_CONFIG: Record<
  BadgeIndicatorKind,
  {
    root: string
    size: Record<"sm" | "md", string>
    icon?: LucideIcon
    iconSize: Record<"sm" | "md", string>
    strokeWidth?: number
    fill?: boolean
  }
> = {
  unread: {
    root: "bg-primary",
    size: { sm: "size-2", md: "size-2.5" },
    iconSize: { sm: "", md: "" },
  },
  online: {
    root: "bg-success",
    size: { sm: "size-2", md: "size-2.5" },
    iconSize: { sm: "", md: "" },
  },
  offline: {
    root: "border-[1.5px] border-text-tertiary bg-transparent",
    size: { sm: "size-2", md: "size-2.5" },
    iconSize: { sm: "", md: "" },
  },
  busy: {
    root: "bg-destructive text-destructive-foreground",
    size: { sm: "size-2", md: "size-2.5" },
    icon: Minus,
    iconSize: { sm: "size-1.5", md: "size-2" },
    strokeWidth: 4,
  },
  away: {
    root: "bg-transparent text-brand-quaternary",
    size: { sm: "size-2", md: "size-2.5" },
    icon: Moon,
    iconSize: { sm: "size-2", md: "size-2.5" },
    strokeWidth: 0,
    fill: true,
  },
  check: {
    root: "bg-success text-success-foreground",
    size: { sm: "size-4", md: "size-5" },
    icon: Check,
    iconSize: { sm: "size-2.5", md: "size-3" },
    strokeWidth: 2.5,
  },
  warning: {
    root: "bg-brand-quaternary text-brand-quaternary-foreground",
    size: { sm: "size-4", md: "size-5" },
    icon: TriangleAlert,
    iconSize: { sm: "size-2.5", md: "size-3" },
    strokeWidth: 2.5,
  },
  lock: {
    root: "bg-foreground text-background",
    size: { sm: "size-4", md: "size-5" },
    icon: Lock,
    iconSize: { sm: "size-2.5", md: "size-3" },
    strokeWidth: 2.5,
  },
}

function BadgeIndicator({
  kind,
  size = "sm",
  label,
  overlay = false,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  kind: BadgeIndicatorKind
  size?: "sm" | "md"
  label?: string
  overlay?: boolean
}) {
  const config = INDICATOR_CONFIG[kind]
  const IconComponent = config.icon

  // Overlay mode requires a relative parent to anchor against.
  return (
    <span
      role="img"
      aria-label={label ?? DEFAULT_LABELS[kind]}
      data-slot="badge-indicator"
      data-kind={kind}
      data-size={size}
      data-overlay={overlay ? "" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        overlay && "absolute top-0 right-0 z-10 translate-x-1/2 -translate-y-1/2 ring-2 ring-card",
        config.size[size],
        config.root,
        className
      )}
      {...props}
    >
      {IconComponent && (
        <IconComponent
          aria-hidden="true"
          className={cn(config.iconSize[size], config.fill && "fill-current")}
          strokeWidth={config.strokeWidth}
        />
      )}
    </span>
  )
}

type BadgeProcessingState = "pending" | "success" | "error"

function BadgeProcessing({
  state,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Badge>, "color" | "badgeStyle" | "shape" | "dot" | "onRemove"> & {
  state: BadgeProcessingState
}) {
  const pending = state === "pending"
  const done = state === "success"

  const icon = pending ? (
    <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
  ) : done ? (
    <Check aria-hidden="true" />
  ) : (
    <TriangleAlert aria-hidden="true" />
  )

  const color = pending ? "blue" : done ? "green" : "red"

  return (
    <Badge
      shape="pill"
      badgeStyle="light"
      color={color}
      data-state={state}
      role="status"
      aria-busy={pending ? true : undefined}
      {...props}
    >
      {icon}
      {children}
    </Badge>
  )
}

export { Badge, BadgeCounter, BadgeIndicator, BadgeProcessing, badgeVariants, BADGE_COLORS }
export type { BadgeColor, BadgeStyle, BadgeCounterTone, BadgeIndicatorKind, BadgeProcessingState }
