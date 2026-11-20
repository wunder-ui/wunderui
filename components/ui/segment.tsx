"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SegmentOption = {
  value: string
  label: React.ReactNode
  /** Optional leading icon (Figma Segment Option · Show Icon). */
  icon?: React.ReactNode
  disabled?: boolean
}

type SegmentSize = "xs" | "sm" | "md" | "lg"

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

/** "250ms" or "0.25s" to milliseconds. */
function toMilliseconds(value: string) {
  const number = parseFloat(value)
  return value.endsWith("ms") ? number : number * 1000
}

/** The CSS custom property `--duration-base` or `--ease-move` of an element, with a fallback for tests and old browsers. */
function motionToken(element: HTMLElement, name: string, fallback: string) {
  const value = getComputedStyle(element).getPropertyValue(name).trim()
  return value || fallback
}

/**
 * `pill` is the fully rounded track (default); `rounded` keeps the corners square-ish like the Button:
 * 8 px track, options concentric to it (track radius minus the inner padding): 6 px at 2 px padding (xs, sm), 4 px at 4 px padding (md, lg).
 */
type SegmentShape = "pill" | "rounded"

const SEGMENT_SHAPE: Record<SegmentShape, { track: string; option: string }> = {
  pill: { track: "rounded-full", option: "rounded-full" },
  // The rounded option radius depends on the size, see SEGMENT_SIZE.rounded.
  rounded: { track: "rounded-md", option: "" },
}

// Figma Segmented Control · Size (track incl. padding): xs 32 (charts and chart cards), small 28,
// regular and large = the Button md/lg from the density tokens — compact 36/40,
// data-density="comfortable" 40/44. The option fills the track minus 4 px on each side.
// A badge or counter in an option (owner 15 Nov 2026, "Unread 6", "Yearly - Save 17%"): the badge is as far from the
// top, bottom and right edge of the option as from each other (4 px), label to badge is the option's gap. Heights:
// xs 28 -> badge 20, sm 24 -> 16, md 28 -> 20, lg 32 -> 24. A neutral counter is bg-subtle like the track (bg-muted)
// in light mode, so on an option that is not selected it takes bg-surface (Figma: not selected surface, selected subtle).
const SEGMENT_BADGE: Record<SegmentSize, string> = {
  xs: "has-[>[data-slot=badge]:last-child]:pe-1 has-[>[data-slot=badge-counter]:last-child]:pe-1",
  sm: "has-[>[data-slot=badge]:last-child]:pe-1 has-[>[data-slot=badge-counter]:last-child]:pe-1 [&>[data-slot=badge]]:h-4 [&>[data-slot=badge]]:px-1.5 [&>[data-slot=badge-counter]]:h-4 [&>[data-slot=badge-counter]]:min-w-4 [&>[data-slot=badge-counter]]:px-1",
  md: "has-[>[data-slot=badge]:last-child]:pe-1 has-[>[data-slot=badge-counter]:last-child]:pe-1",
  lg: "has-[>[data-slot=badge]:last-child]:pe-1 has-[>[data-slot=badge-counter]:last-child]:pe-1 [&>[data-slot=badge]]:h-6 [&>[data-slot=badge]]:px-2.5 [&>[data-slot=badge-counter]]:h-6 [&>[data-slot=badge-counter]]:min-w-6",
}

// wrap: the track grows to more rows instead of running past its container (phones). The fixed height becomes
// vertical padding with the same total row height, and the pill track keeps the radius of one row, so a
// one-row track looks exactly as without wrap.
const SEGMENT_WRAP: Record<SegmentSize, { track: string; pill: string }> = {
  xs: { track: "flex-wrap", pill: "rounded-[calc(0.875rem+0.125rem)]" },
  sm: { track: "flex-wrap", pill: "rounded-[calc(0.75rem+0.125rem)]" },
  md: { track: "flex-wrap h-auto py-1", pill: "rounded-[calc(var(--control-md)/2)]" },
  lg: { track: "flex-wrap h-auto py-1", pill: "rounded-[calc(var(--control-lg)/2)]" },
}

const SEGMENT_SIZE: Record<SegmentSize, { track: string; option: string; rounded: string }> = {
  // icon to label follows the icon size: 14 px (xs, sm) -> 6, 16 px (md, lg) -> 8
  // concentric option radius for shape="rounded": 8 px track - 2 px padding = 6 px (xs, sm), 8 - 4 = 4 px (md, lg)
  xs: { track: "p-0.5 gap-0.5", option: "h-7 px-2.5 text-xs gap-1.5 [&_svg]:size-3.5", rounded: "rounded-[calc(var(--radius-md)-0.125rem)]" },
  sm: { track: "p-0.5 gap-0.5", option: "h-6 px-3 text-xs gap-1.5 [&_svg]:size-3.5", rounded: "rounded-[calc(var(--radius-md)-0.125rem)]" },
  md: { track: "h-(--control-md) px-1 gap-0.5", option: "h-[calc(var(--control-md)-0.5rem)] px-3 text-sm gap-2 [&_svg]:size-4", rounded: "rounded-sm" },
  lg: { track: "h-(--control-lg) px-1 gap-0.5", option: "h-[calc(var(--control-lg)-0.5rem)] px-3 text-sm gap-2 [&_svg]:size-4", rounded: "rounded-sm" },
}

function Segment({
  options,
  value,
  onValueChange,
  size = "md",
  shape = "pill",
  slide = true,
  activation = "auto",
  wrap = false,
  className,
  "aria-label": ariaLabel,
}: {
  options: SegmentOption[]
  value: string
  onValueChange: (value: string) => void
  size?: SegmentSize
  /** `pill` (default) or `rounded` for the square-cornered version. */
  shape?: SegmentShape
  /**
   * The selected option's pill slides to the next option instead of switching. It moves with `transform`
   * only (the pill is laid out at its final size and animated from the old one), so it costs no layout, and
   * it stays put when the user prefers reduced motion. On by default; pass `slide={false}` to switch at once.
   */
  slide?: boolean
  /**
   * `auto` (default): the arrow keys move focus and choose the option. `manual`: the arrow keys, Home and End
   * only move focus; Enter or Space chooses. Use it where a wrong choice has a cost (a permission, a payment).
   */
  activation?: "auto" | "manual"
  /**
   * The options wrap to a second row when the track is wider than its container (a phone) instead of running
   * past the edge. One row looks the same as without it. Off by default.
   */
  wrap?: boolean
  className?: string
  /** Names the group for screen readers, e.g. "Version". */
  "aria-label"?: string
}) {
  const s = SEGMENT_SIZE[size]
  const r = SEGMENT_SHAPE[shape]
  const enabled = options.filter((option) => !option.disabled)
  // Tab pattern: one tab stop (the selected option, or the first enabled one);
  // arrow keys, Home and End move between the options and select them.
  const tabStop = enabled.some((option) => option.value === value) ? value : enabled[0]?.value

  const trackRef = React.useRef<HTMLDivElement>(null)
  const pillRef = React.useRef<HTMLSpanElement>(null)
  const previous = React.useRef<{ left: number; top: number; width: number } | null>(null)
  const lastValue = React.useRef(value)
  // False until the pill has been placed: before that the selected option paints its own background,
  // so the server HTML and the first paint never show a track without a selection.
  const [placed, setPlaced] = React.useState(false)

  useIsomorphicLayoutEffect(() => {
    if (!slide) return
    const track = trackRef.current
    const pill = pillRef.current
    if (!track || !pill) return
    const place = (animate: boolean) => {
      const selected = track.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      if (!selected) {
        pill.style.opacity = "0"
        previous.current = null
        return
      }
      const next = { left: selected.offsetLeft, top: selected.offsetTop, width: selected.offsetWidth }
      let from = previous.current
      // a resize callback that does not move the target (the observer fires once on observe) leaves a running slide alone
      if (!animate && from && from.left === next.left && from.top === next.top && from.width === next.width) return
      // an interrupted slide starts from where the pill is drawn now, not from the end of the previous slide (M13)
      const running = typeof pill.getAnimations === "function" ? pill.getAnimations() : []
      if (running.length > 0 && from) {
        const box = pill.getBoundingClientRect()
        const trackBox = track.getBoundingClientRect()
        from = { left: box.left - trackBox.left - track.clientLeft, top: box.top - trackBox.top - track.clientTop, width: box.width }
        running.forEach((animation) => animation.cancel())
      }
      pill.style.opacity = "1"
      pill.style.left = `${next.left}px`
      pill.style.top = `${next.top}px`
      pill.style.width = `${next.width}px`
      pill.style.height = `${selected.offsetHeight}px`
      previous.current = next
      if (
        animate &&
        from &&
        from.width > 0 &&
        next.width > 0 &&
        (from.left !== next.left || from.top !== next.top || from.width !== next.width) &&
        typeof pill.animate === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        pill.animate(
          [
            { transform: `translate(${from.left - next.left}px, ${from.top - next.top}px) scaleX(${from.width / next.width})` },
            { transform: "none" },
          ],
          {
            duration: toMilliseconds(motionToken(track, "--duration-base", "250ms")),
            easing: motionToken(track, "--ease-move", "cubic-bezier(0.65, 0, 0.35, 1)"),
          },
        )
      }
    }
    // the pill only slides when the selection changed, not when the options were added or the track was resized
    const selectionChanged = lastValue.current !== value
    lastValue.current = value
    place(selectionChanged)
    setPlaced(true)
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(() => place(false)) : null
    observer?.observe(track)
    // the options as well: a late font or a changed label can resize one without resizing a fixed-width track
    track.querySelectorAll('[role="tab"]').forEach((tab) => observer?.observe(tab))
    return () => observer?.disconnect()
  }, [slide, value, options.length])

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || enabled.length === 0) return
    event.preventDefault()
    // the focused option, not the selected one: in manual mode they differ
    const focused = (event.target as HTMLElement).closest<HTMLElement>("[role=tab]")
    const focusedOption = focused ? options[Array.from(event.currentTarget.querySelectorAll("[role=tab]")).indexOf(focused)] : undefined
    const current = Math.max(0, enabled.findIndex((option) => option.value === (focusedOption?.value ?? tabStop)))
    const last = enabled.length - 1
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? last : event.key === "ArrowRight" ? (current + 1) % enabled.length : (current + last) % enabled.length
    const target = enabled[next]
    if (activation === "auto") onValueChange(target.value)
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")
    buttons[options.indexOf(target)]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-slot="segment"
      data-size={size}
      data-shape={shape}
      onKeyDown={onKeyDown}
      ref={trackRef}
      className={cn(
        "relative inline-flex w-fit items-center bg-muted",
        r.track,
        s.track,
        wrap && ["max-w-full", SEGMENT_WRAP[size].track, shape === "pill" && SEGMENT_WRAP[size].pill],
        className
      )}
    >
      {slide && (
        <span
          ref={pillRef}
          aria-hidden
          data-slot="segment-pill"
          className={cn(
            "pointer-events-none absolute origin-left bg-background opacity-0 shadow-sm",
            r.option,
            shape === "rounded" && s.rounded,
          )}
        />
      )}
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={option.value === tabStop ? 0 : -1}
            disabled={option.disabled}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "relative inline-flex items-center font-medium transition-colors duration-fast ease-entrance outline-none focus-ring disabled:pointer-events-none disabled:opacity-40",
              r.option,
              shape === "rounded" && s.rounded,
              s.option,
              SEGMENT_BADGE[size],
              // the counter changes its fill with the 250 ms slide of the pill, not ahead of it
              "[&>[data-slot=badge-counter]]:transition-colors [&>[data-slot=badge-counter]]:duration-base [&>[data-slot=badge-counter]]:ease-move",
              wrap && "shrink-0 whitespace-nowrap",
              active
                ? slide && placed
                  ? "text-foreground active:bg-bg-subtle"
                  : "bg-background text-foreground shadow-sm active:bg-bg-subtle"
                : "text-text-secondary [&>[data-slot=badge-counter][data-tone=neutral]]:bg-bg-surface hover:bg-bg-page hover:text-foreground active:bg-bg-subtle active:text-foreground"
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { Segment }
export type { SegmentOption, SegmentShape, SegmentSize }
