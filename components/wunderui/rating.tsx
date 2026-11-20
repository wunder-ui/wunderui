"use client"

import * as React from "react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"

type RatingType = "stars" | "hearts" | "emojis" | "scale"
type RatingLabel = "none" | "left" | "right" | "tooltip"
type RatingSize = "md" | "sm"

const EMOJIS = ["😍", "🙂", "😐", "🙁", "😡"]
/** Spoken names of the faces, in the same order (1 = Love it … 5 = Hate it). */
const EMOJI_LABELS = ["Love it", "Good", "Okay", "Bad", "Hate it"]

/** Shortest form of a value: 3.5 stays 3.5, 4 stays 4, 3.25 becomes 3.3. */
function formatValue(value: number) {
  return String(Math.round(value * 10) / 10)
}

/**
 * Rating — mirrors the Figma Rating set (Type × Value × Label).
 * - `stars` / `hearts`: fill `value` of `max` icons (yellow / pink).
 * - `emojis`: single-select reaction 1–5 (😍 🙂 😐 🙁 😡), 0 = none.
 * - `scale`: 0–10 NPS row, the selected number is filled. On narrow containers the cells shrink down to 32 px and wrap into two rows below 352 px.
 * `label` shows the value beside the rating or as a tooltip above it. `tooltip` shows a dark bubble with an arrow on the rated option.
 *
 * Interactive, it is a radio group: one Tab stop (the checked option, or the
 * first), ←/→/↑/↓ move and select, Home/End jump to the ends. `readOnly`
 * renders one image whose name carries the value ("Rated 3.5 out of 5"). `size="sm"` is the compact display
 * size of a read-only star or heart row, 12 px icons with a filled grey for the empty ones, as on a product card or
 * a review line; an interactive rating keeps its 24 px targets.
 */
function Rating({
  value,
  onValueChange,
  max,
  type = "stars",
  label = "none",
  readOnly = false,
  size = "md",
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
  /** `sm`: the compact 12 px display of a read-only star or heart row. Ignored while the rating is interactive. */
  size?: RatingSize
  className?: string
  /** Names the group ("Rating" by default); read-only, it replaces "Rated 3.5 out of 5". */
  "aria-label"?: string
  /** Id of a visible label that names the group, instead of `aria-label`. */
  "aria-labelledby"?: string
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const optionRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const display = readOnly ? value : (hover ?? value)
  const compact = size === "sm" && readOnly && (type === "stars" || type === "hearts")
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
  const tooltipTarget = checkedValue

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
    label === "none" || label === "tooltip" ? null : (
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
    const optionClassName = cn(className, "relative")
    const bubble =
      label === "tooltip" && v === tooltipTarget ? (
        <span aria-hidden="true" data-slot="rating-bubble" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2">
          <span className="inline-flex h-6 items-center whitespace-nowrap rounded-md bg-neutral-dark-content px-2 text-xs font-medium leading-none text-neutral-white shadow-md">{text}</span>
          <svg width="10" height="5" viewBox="0 0 10 5" fill="none" className="absolute left-1/2 top-full -translate-x-1/2">
            <path d="M0 0L5 5L10 0Z" className="fill-neutral-dark-content" />
          </svg>
        </span>
      ) : null

    if (readOnly) {
      return (
        <span key={v} className={optionClassName}>
          {children}
          {bubble}
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
        className={optionClassName}
        {...handlers}
      >
        {children}
        {bubble}
      </button>
    )
  }

  let items: React.ReactNode
  if (type === "stars" || type === "hearts") {
    const glyph = type === "stars" ? "star" : "heart"
    items = Array.from({ length: count }).map((_, i) => {
      // Rounded, so 3.2 fills three stars and 4.5 five (it filled four and five before: any fraction rounded up).
      const filled = i < Math.round(display)
      const filledClass = type === "stars" ? "fill-brand-quaternary text-brand-quaternary" : "fill-brand-tertiary text-brand-tertiary"
      return option(
        i + 1,
        compact ? "grid size-3 place-items-center" : "grid size-6 place-items-center rounded-sm outline-none focus-ring",
        compact ? (
          <Icon name={glyph} aria-hidden strokeWidth={1.5} className={cn("size-3", filled ? filledClass : "fill-border text-border")} />
        ) : (
          <Icon name={glyph} aria-hidden className={cn("size-4", filled ? filledClass : "fill-none text-border-control")} />
        ),
        { onMouseEnter: () => setHover(i + 1), onMouseLeave: () => setHover(null), onClick: () => select(i + 1) },
        optionLabel(i + 1)
      )
    })
  } else if (type === "emojis") {
    items = EMOJIS.map((emoji, i) => {
      const selected = value === i + 1
      return option(
        i + 1,
        cn("flex size-12 items-center justify-center rounded-md border text-xl transition-colors duration-fast ease-entrance outline-none focus-ring", selected ? "border-tint-text-indigo bg-tint-indigo" : cn("border-transparent bg-background", !readOnly && "hover:bg-subtle")),
        emoji,
        // Clicking the chosen face again clears it (0 = none), as before.
        { onClick: () => onValueChange?.(selected ? 0 : i + 1) },
        `${i + 1} of ${EMOJIS.length}, ${EMOJI_LABELS[i]}`
      )
    })
  } else {
    items = Array.from({ length: count }).map((_, i) => {
      const selected = value === i
      return option(
        i,
        cn("flex h-10 w-full min-w-8 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-base ease-entrance outline-none focus-ring", selected ? "bg-primary text-primary-foreground" : cn("bg-background text-text-secondary", !readOnly && "hover:bg-subtle hover:text-foreground")),
        i,
        { onClick: () => onValueChange?.(i) }
      )
    })
  }

  const groupClassName = type === "scale"
    ? "grid grid-cols-6 gap-1 @min-[352px]:grid-cols-11 @min-[352px]:gap-0 @min-[392px]:gap-1"
    : cn("flex items-center", type === "emojis" ? "gap-2" : compact ? "gap-0.5" : "gap-0")
  const rootClassName = cn(
    "relative inline-flex items-center",
    type === "emojis" ? "gap-2" : type === "scale" ? "gap-1 max-w-full" : "gap-0.5",
    label === "left" || label === "right" ? "gap-2.5" : "",
    className
  )

  const group = (
    <div className={groupClassName}>{items}</div>
  )
  const scaleGroup = type === "scale" ? (
    <div className="@container w-[480px] min-w-0 max-w-full">{group}</div>
  ) : group

  if (readOnly) {
    // One image for assistive tech; the stars and the visible label are its picture. Stars, hearts and emojis render
    // as spans only, so a read-only rating can sit inside a line of text (a <p> in a product card or a review).
    const imgProps = {
      "data-slot": "rating",
      role: "img",
      "aria-label": ariaLabel ?? `Rated ${formatValue(value)} out of ${type === "scale" ? last : count}`,
      "aria-labelledby": ariaLabelledBy,
      className: rootClassName,
    }
    if (type !== "scale") {
      return (
        <span {...imgProps}>
          {label === "left" && labelNode}
          <span className={groupClassName}>{items}</span>
          {label === "right" && labelNode}
        </span>
      )
    }
    return (
      <div {...imgProps}>
        {label === "left" && labelNode}
        {scaleGroup}
        {label === "right" && labelNode}
      </div>
    )
  }

  return (
    <div data-slot="rating" className={rootClassName}>
      {label === "left" && labelNode}
      {type === "scale" ? (
        <div className="@container w-[480px] min-w-0 max-w-full">
          <div
            role="radiogroup"
            aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? "Rating")}
            aria-labelledby={ariaLabelledBy}
            className={groupClassName}
          >
            {items}
          </div>
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? "Rating")}
          aria-labelledby={ariaLabelledBy}
          className={groupClassName}
        >
          {items}
        </div>
      )}
      {label === "right" && labelNode}
    </div>
  )
}

export { Rating }
export type { RatingType, RatingLabel, RatingSize }
