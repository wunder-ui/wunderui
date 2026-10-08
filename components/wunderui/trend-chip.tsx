import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Minus, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

/** Figma Trend Chip · Icon: which glyph carries the direction. */
type TrendChipIcon =
  | "trending"
  | "arrow"
  | "arrow-diagonal"
  | "triangle"
  | "circle-trending"
  | "circle-diagonal"
  | "circle-arrow"

/**
 * The filled caret from the Figma icon set (Icons_Arrows · sort). Lucide has no
 * filled triangle, so these are the Figma vectors: the chip's 4 × 3 caret in its
 * 16 px box, and Number Value's 8 × 6 caret in a 14 px box (`large`).
 */
function TrendCaret({ down, large, className }: { down?: boolean; large?: boolean; className?: string }) {
  return (
    <svg
      viewBox={large ? "0 0 14 14" : "0 0 16 16"}
      aria-hidden
      className={cn(large ? "size-3.5" : "size-4", "shrink-0", down && "rotate-180", className)}
    >
      <path
        fill="currentColor"
        d={
          large
            ? "M7.05967 4.5C7.44558 4.50012 7.81159 4.67115 8.05967 4.9668L10.8146 8.24805C11.1407 8.63695 11.2123 9.17962 10.9981 9.63965C10.7836 10.0997 10.3212 10.3945 9.81358 10.3945H4.30576C3.79822 10.3946 3.33666 10.0996 3.12217 9.63965C2.90786 9.17955 2.97948 8.63685 3.30576 8.24805L6.05869 4.9668C6.30686 4.67101 6.67359 4.5 7.05967 4.5Z"
            : "M8.07212 6.66667C8.26909 6.66674 8.45625 6.75405 8.58286 6.90495L9.98814 8.57975C10.1547 8.77831 10.1914 9.05486 10.0819 9.28971C9.97239 9.5245 9.73651 9.67448 9.4774 9.67448H6.66685C6.40773 9.67456 6.17185 9.5245 6.06236 9.28971C5.95293 9.05489 5.98958 8.7782 6.15611 8.57975L7.56138 6.90495C7.68805 6.75399 7.87506 6.66667 8.07212 6.66667Z"
        }
      />
    </svg>
  )
}

/* The three circled glyphs are the Figma vectors (14 px box, 1 px stroke);
   lucide only has the plain circled arrow, and that one is drawn heavier. */
const CIRCLE = "M12.25 7C12.25 4.10051 9.8995 1.75 7.00001 1.75C4.10051 1.75 1.75001 4.10051 1.75001 7C1.75001 9.8995 4.10051 12.25 7.00001 12.25C9.8995 12.25 12.25 9.8995 12.25 7Z"
const CIRCLE_GLYPH: Record<"circle-trending" | "circle-diagonal" | "circle-arrow", string> = {
  "circle-trending": "M9.62499 5.5418L7.17499 7.9918L6.24166 6.5918L4.37499 8.45847M9.62499 6.70847V5.5418H8.45832",
  "circle-diagonal": "M6.41667 5.25H8.75001V7.58334M8.75001 5.25L5.25001 8.75",
  "circle-arrow": "M5.25 6.41667L7 4.66667L8.75 6.41667M7 4.66667V9.33334",
}

function CircleGlyph({ icon, down }: { icon: keyof typeof CIRCLE_GLYPH; down?: boolean }) {
  // down = the same glyph turned: the trend line mirrors, the diagonal turns a
  // quarter, the arrow a half — exactly the Figma "down" variants.
  const turn = icon === "circle-trending" ? "-scale-y-100" : icon === "circle-diagonal" ? "rotate-90" : "rotate-180"
  return (
    <svg viewBox="0 0 14 14" aria-hidden className={cn("size-3.5 shrink-0", down && turn)} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d={CIRCLE} />
      <path d={CIRCLE_GLYPH[icon]} />
    </svg>
  )
}

function TrendGlyph({ icon, down }: { icon: TrendChipIcon; down: boolean }) {
  switch (icon) {
    case "trending":
      return down ? <TrendingDown className="size-3 shrink-0" /> : <TrendingUp className="size-3 shrink-0" />
    case "arrow":
      return down ? <ArrowDown className="size-4 shrink-0" /> : <ArrowUp className="size-4 shrink-0" />
    case "arrow-diagonal":
      return down ? <ArrowDownRight className="size-4 shrink-0" /> : <ArrowUpRight className="size-4 shrink-0" />
    case "triangle":
      return <TrendCaret down={down} />
    default:
      return <CircleGlyph icon={icon} down={down} />
  }
}

/* Figma: the 16 px glyphs sit on 8 px of padding, the 14 px circles and the
   caret pull the pill in to 4 px on the icon side; the trend line has 6 px to
   the label, everything else 4 px. */
const CHIP_SPACING: Record<TrendChipIcon, string> = {
  trending: "gap-1.5 px-2",
  arrow: "gap-1 px-2",
  "arrow-diagonal": "gap-1 px-2",
  triangle: "gap-1 pl-1 pr-2",
  "circle-trending": "gap-1 pl-1 pr-2",
  "circle-diagonal": "gap-1 pl-1 pr-2",
  "circle-arrow": "gap-1 pl-1 pr-2",
}

function TrendChip({
  value,
  direction = "up",
  icon = "trending",
  className,
}: {
  value: string
  /** Figma Trend Chip · Trend; `flat` is the old name for `neutral`. */
  direction?: "up" | "down" | "neutral" | "flat"
  /** Figma Trend Chip · Icon; the same glyph turns for `down`. */
  icon?: TrendChipIcon
  className?: string
}) {
  const positive = direction === "up"
  const negative = direction === "down"
  const neutral = direction === "neutral" || direction === "flat"

  return (
    <span
      data-slot="trend-chip"
      className={cn(
        "inline-flex h-5 items-center rounded-full py-0.5 text-xs font-semibold leading-4",
        neutral ? "gap-1 px-2 bg-muted text-text-secondary" : CHIP_SPACING[icon],
        positive && "bg-tint-green text-tint-text-green",
        negative && "bg-tint-red text-tint-text-red",
        className
      )}
    >
      {neutral ? <Minus className="size-3 shrink-0" /> : <TrendGlyph icon={icon} down={negative} />}
      {value}
    </span>
  )
}

export type { TrendChipIcon }
export { TrendChip, TrendCaret }
