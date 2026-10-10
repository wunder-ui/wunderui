"use client"

import * as React from "react"
import { Heart, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingType = "stars" | "hearts" | "emojis" | "scale"
type RatingLabel = "none" | "left" | "right" | "tooltip"

const EMOJIS = ["😍", "🙂", "😐", "🙁", "😡"]

/**
 * Rating — mirrors the Figma Rating set (Type × Value × Label).
 * - `stars` / `hearts`: fill `value` of `max` icons (yellow / pink).
 * - `emojis`: single-select reaction 1–5 (😍 🙂 😐 🙁 😡), 0 = none.
 * - `scale`: 0–10 NPS row, the selected number is filled.
 * `label` shows the value beside the rating or as a tooltip above it.
 */
function Rating({
  value,
  onValueChange,
  max,
  type = "stars",
  label = "none",
  readOnly = false,
  className,
}: {
  value: number
  onValueChange?: (value: number) => void
  max?: number
  type?: RatingType
  label?: RatingLabel
  readOnly?: boolean
  className?: string
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const display = hover ?? value
  const count = max ?? (type === "scale" ? 11 : 5)
  const text = type === "scale" || type === "emojis" ? String(value) : `${value.toFixed(1)}`

  const labelNode =
    label === "none" ? null : label === "tooltip" ? (
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground shadow-md">
        {text}
      </span>
    ) : (
      <span className="text-sm font-medium tabular-nums text-foreground">{text}</span>
    )

  let items: React.ReactNode
  if (type === "stars" || type === "hearts") {
    const Icon = type === "stars" ? Star : Heart
    items = Array.from({ length: count }).map((_, i) => {
      const filled = i < display
      return (
        <button key={i} type="button" disabled={readOnly} aria-label={`${i + 1} of ${count}`} onMouseEnter={() => !readOnly && setHover(i + 1)} onMouseLeave={() => !readOnly && setHover(null)} onClick={() => !readOnly && onValueChange?.(i + 1)} className="grid size-6 place-items-center rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-default">
          <Icon className={cn("size-4", filled ? (type === "stars" ? "fill-brand-quaternary text-brand-quaternary" : "fill-brand-tertiary text-brand-tertiary") : "fill-none text-border-control")} />
        </button>
      )
    })
  } else if (type === "emojis") {
    items = EMOJIS.map((emoji, i) => {
      const selected = value === i + 1
      return (
        <button key={emoji} type="button" disabled={readOnly} aria-pressed={selected} aria-label={emoji} onClick={() => !readOnly && onValueChange?.(selected ? 0 : i + 1)} className={cn("flex size-12 items-center justify-center rounded-md border text-xl transition-colors duration-fast ease-entrance disabled:cursor-default", selected ? "border-primary bg-tint-indigo" : "border-transparent bg-background hover:bg-subtle")}>
          {emoji}
        </button>
      )
    })
  } else {
    items = Array.from({ length: count }).map((_, i) => {
      const selected = value === i
      return (
        <button key={i} type="button" disabled={readOnly} aria-pressed={selected} onClick={() => !readOnly && onValueChange?.(i)} className={cn("flex size-10 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-base ease-entrance disabled:cursor-default", selected ? "bg-primary text-primary-foreground" : "bg-background text-text-secondary hover:bg-subtle hover:text-foreground")}>
          {i}
        </button>
      )
    })
  }

  return (
    <div className={cn("relative inline-flex items-center", type === "emojis" ? "gap-2" : type === "scale" ? "gap-1" : "gap-0.5", label === "left" || label === "right" ? "gap-2.5" : "", className)}>
      {label === "left" && labelNode}
      {label === "tooltip" && labelNode}
      <div className={cn("flex items-center", type === "emojis" ? "gap-2" : type === "scale" ? "gap-1" : "gap-0")}>{items}</div>
      {label === "right" && labelNode}
    </div>
  )
}

export { Rating }
export type { RatingType, RatingLabel }
