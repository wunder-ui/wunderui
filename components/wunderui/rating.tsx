"use client"

import * as React from "react"
import { Heart, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingType = "stars" | "hearts" | "emojis" | "scale"
type RatingLabel = "none" | "left" | "right" | "tooltip"

const EMOJIS = ["😍", "🙂", "😐", "🙁", "😡"]

/** Shortest form of a value: 3.5 stays 3.5, 4 stays 4, 3.25 becomes 3.3. */
function formatValue(value: number) {
  return String(Math.round(value * 10) / 10)
}

/**
 * Rating — mirrors the Figma Rating set (Type × Value × Label).
 * - `stars` / `hearts`: fill `value` of `max` icons (yellow / pink).
 * - `emojis`: single-select reaction 1–5 (😍 🙂 😐 🙁 😡), 0 = none.
 * - `scale`: 0–10 NPS row, the selected number is filled.
 * `label` shows the value beside the rating or as a tooltip above it.
 *
 * Interactive, it is a radio group: one Tab stop (the checked option, or the
 * first), ←/→/↑/↓ move and select, Home/End jump to the ends. `readOnly`
 * renders one image whose name carries the value ("Rated 3.5 out of 5").
 */
function Rating({
  value,
  onValueChange,
  max,
  type = "stars",
  label = "none",
  readOnly = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: {
  value: number
  onValueChange?: (value: number) => void
  max?: number
  type?: RatingType
  label?: RatingLabel
  readOnly?: boolean
  className?: string
  /** Names the group ("Rating" by default); read-only, it replaces "Rated 3.5 out of 5". */
  "aria-label"?: string
  /** Id of a visible label that names the group, instead of `aria-label`. */
  "aria-labelledby"?: string
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const optionRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const display = readOnly ? value : (hover ?? value)
  const count = type === "emojis" ? EMOJIS.length : (max ?? (type === "scale" ? 11 : 5))
  const text = type === "scale" || type === "emojis" ? String(value) : `${value.toFixed(1)}`

  // Option values: stars, hearts and emojis 1…n, the scale 0…n-1.
  const first = type === "scale" ? 0 : 1
  const last = type === "scale" ? count - 1 : count
  // 0 means "nothing chosen" for stars, hearts and emojis; on the scale 0 is an answer.
  const hasChecked = type === "scale" ? value >= first && value <= last : value >= 1
  // A fractional value (3.5) has no exact option: the nearest one is checked.
  const checkedValue = Math.min(last, Math.max(first, Math.round(value)))
  const tabStop = hasChecked ? checkedValue : first

  const optionLabel = (v: number) =>
    type === "stars" ? `${v} of ${count} stars` : type === "hearts" ? `${v} of ${count} hearts` : undefined

  function select(next: number) {
    const clamped = Math.min(last, Math.max(first, next))
    onValueChange?.(clamped)
    optionRefs.current[clamped - first]?.focus()
  }

  // Arrows move and select (no wrap at the ends), Home/End jump; mirrored in RTL.
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, current: number) {
    const rtl = e.currentTarget.closest("[dir=rtl]") != null
    let next: number | null = null
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight") || e.key === "ArrowUp") next = current + 1
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft") || e.key === "ArrowDown") next = current - 1
    else if (e.key === "Home") next = first
    else if (e.key === "End") next = last
    if (next === null) return
    e.preventDefault()
    select(next)
  }

  const labelNode =
    label === "none" ? null : label === "tooltip" ? (
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground shadow-md">
        {text}
      </span>
    ) : (
      <span className="text-sm font-medium tabular-nums text-foreground">{text}</span>
    )

  /** One option: a radio in the group, or a plain span when read-only. */
  function option(
    v: number,
    className: string,
    children: React.ReactNode,
    handlers: Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "onMouseEnter" | "onMouseLeave">,
    name?: string
  ) {
    if (readOnly) {
      return (
        <span key={v} className={className}>
          {children}
        </span>
      )
    }
    return (
      <button
        key={v}
        ref={(el) => {
          optionRefs.current[v - first] = el
        }}
        type="button"
        role="radio"
        aria-checked={hasChecked && v === checkedValue}
        aria-label={name}
        tabIndex={v === tabStop ? 0 : -1}
        onKeyDown={(e) => handleKeyDown(e, v)}
        className={className}
        {...handlers}
      >
        {children}
      </button>
    )
  }

  let items: React.ReactNode
  if (type === "stars" || type === "hearts") {
    const Icon = type === "stars" ? Star : Heart
    items = Array.from({ length: count }).map((_, i) => {
      // Rounded, so 3.2 fills three stars and 4.5 five (it filled four and five before: any fraction rounded up).
      const filled = i < Math.round(display)
      return option(
        i + 1,
        "grid size-6 place-items-center rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring",
        <Icon aria-hidden className={cn("size-4", filled ? (type === "stars" ? "fill-brand-quaternary text-brand-quaternary" : "fill-brand-tertiary text-brand-tertiary") : "fill-none text-border-control")} />,
        { onMouseEnter: () => setHover(i + 1), onMouseLeave: () => setHover(null), onClick: () => select(i + 1) },
        optionLabel(i + 1)
      )
    })
  } else if (type === "emojis") {
    items = EMOJIS.map((emoji, i) => {
      const selected = value === i + 1
      return option(
        i + 1,
        cn("flex size-12 items-center justify-center rounded-md border text-xl transition-colors duration-fast ease-entrance", selected ? "border-primary bg-tint-indigo" : cn("border-transparent bg-background", !readOnly && "hover:bg-subtle")),
        emoji,
        // Clicking the chosen face again clears it (0 = none), as before.
        { onClick: () => onValueChange?.(selected ? 0 : i + 1) },
        emoji
      )
    })
  } else {
    items = Array.from({ length: count }).map((_, i) => {
      const selected = value === i
      return option(
        i,
        cn("flex size-10 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-base ease-entrance", selected ? "bg-primary text-primary-foreground" : cn("bg-background text-text-secondary", !readOnly && "hover:bg-subtle hover:text-foreground")),
        i,
        { onClick: () => onValueChange?.(i) }
      )
    })
  }

  const groupClassName = cn("flex items-center", type === "emojis" ? "gap-2" : type === "scale" ? "gap-1" : "gap-0")
  const rootClassName = cn("relative inline-flex items-center", type === "emojis" ? "gap-2" : type === "scale" ? "gap-1" : "gap-0.5", label === "left" || label === "right" ? "gap-2.5" : "", className)

  if (readOnly) {
    // One image for assistive tech; the stars and the visible label are its picture.
    return (
      <div
        data-slot="rating"
        role="img"
        aria-label={ariaLabel ?? `Rated ${formatValue(value)} out of ${type === "scale" ? last : count}`}
        aria-labelledby={ariaLabelledBy}
        className={rootClassName}
      >
        {label === "left" && labelNode}
        {label === "tooltip" && labelNode}
        <div className={groupClassName}>{items}</div>
        {label === "right" && labelNode}
      </div>
    )
  }

  return (
    <div data-slot="rating" className={rootClassName}>
      {label === "left" && labelNode}
      {label === "tooltip" && labelNode}
      <div
        role="radiogroup"
        aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? "Rating")}
        aria-labelledby={ariaLabelledBy}
        className={groupClassName}
      >
        {items}
      </div>
      {label === "right" && labelNode}
    </div>
  )
}

export { Rating }
export type { RatingType, RatingLabel }
