"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Figma ❖ Icon tile (4347:754970): Size 24/32/36/40/48 × Shape square/circle. */
/* Icon Tile (Nov 19 2026): one icon on a tint surface, the leading mark of a  */
/* list row, a metric, a settings group or a menu entry. Owner rules: the tile */
/* is a plain tint surface without a rim, the icon takes the tint text colour  */
/* of the same hue and is one colour. Neutral is the grey tint.                */
/* -------------------------------------------------------------------------- */

const ICON_TILE_TONES = ["neutral", "indigo", "blue", "purple", "pink", "red", "orange", "yellow", "green"] as const
type IconTileTone = (typeof ICON_TILE_TONES)[number]

const ICON_TILE_SIZES = [24, 32, 36, 40, 48] as const
type IconTileSize = (typeof ICON_TILE_SIZES)[number]

const TONE: Record<IconTileTone, string> = {
  neutral: "bg-tint-alternative text-tint-text-alternative",
  indigo: "bg-tint-indigo text-tint-text-indigo",
  blue: "bg-tint-blue text-tint-text-blue",
  purple: "bg-tint-purple text-tint-text-purple",
  pink: "bg-tint-pink text-tint-text-pink",
  red: "bg-tint-red text-tint-text-red",
  orange: "bg-tint-orange text-tint-text-orange",
  yellow: "bg-tint-yellow text-tint-text-yellow",
  green: "bg-tint-green text-tint-text-green",
}

/** Tile size → tile, icon (14 / 16 / 18 / 20 / 24 px) and square corner (Figma ❖ Icon tile): 4 px at 24, 16 px at 48, 8 px between. */
const SIZE: Record<IconTileSize, { tile: string; icon: string; square: string }> = {
  24: { tile: "size-6", icon: "[&_svg]:size-3.5", square: "rounded-sm" },
  32: { tile: "size-8", icon: "[&_svg]:size-4", square: "rounded-md" },
  36: { tile: "size-9", icon: "[&_svg]:size-[18px]", square: "rounded-md" },
  40: { tile: "size-10", icon: "[&_svg]:size-5", square: "rounded-md" },
  48: { tile: "size-12", icon: "[&_svg]:size-6", square: "rounded-xl" },
}

type IconTileProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The icon: an element (`<Wallet />`) or an icon component (`Wallet`). It is sized by the tile. */
  icon: React.ReactNode | React.ElementType
  /** The tint hue of the tile and its icon. Default `neutral` (grey). */
  tone?: IconTileTone
  /** Tile size in px: 24, 32, 36, 40 or 48, with a 14, 16, 18, 20 or 24 px icon. Default 32. */
  size?: IconTileSize
  /** `square` (rounded corners, default) or `circle`. */
  shape?: "square" | "circle"
  /** Accessible name. Without it the tile is decorative and hidden from screen readers; with it, it is an image. */
  label?: string
}

/** An element type rather than an element: a function component or a forwardRef / memo object such as a Lucide icon. */
function isComponent(icon: unknown): icon is React.ElementType {
  if (typeof icon === "function") return true
  return typeof icon === "object" && icon !== null && !React.isValidElement(icon) && "$$typeof" in icon
}

/**
 * An icon on a tint surface without a rim, in 4 sizes, square or round. Decorative by default (`aria-hidden`); pass
 * `label` when the tile is the only thing that says what it means.
 */
function IconTile({ icon, tone = "neutral", size = 32, shape = "square", label, className, ...props }: IconTileProps) {
  const s = SIZE[size] ?? SIZE[32]
  const IconComponent = isComponent(icon) ? icon : null
  return (
    <span
      data-slot="icon-tile"
      data-tone={tone}
      data-size={size}
      data-shape={shape}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        // the icon keeps a 1.5 px line at every tile size (a 24 px Lucide icon drawn at 14-20 px would thin to ~1 px),
        // the same crisp stroke as the sidebar icons (owner, Nov 20 2026)
        "[&_svg]:[stroke-width:1.5] [&_svg_*]:[vector-effect:non-scaling-stroke]",
        s.tile,
        s.icon, shape === "circle" ? "rounded-full" : s.square, TONE[tone] ?? TONE.neutral, className)}
      {...props}
    >
      {IconComponent ? <IconComponent aria-hidden="true" /> : (icon as React.ReactNode)}
    </span>
  )
}

export { IconTile, ICON_TILE_TONES, ICON_TILE_SIZES }
export type { IconTileProps, IconTileTone, IconTileSize }
