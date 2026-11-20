"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "@/lib/utils"

type ProgressValuePosition =
  | "right"
  | "left"
  | "bottom"
  | "tooltip-top"
  | "tooltip-bottom"

type ProgressProps = ProgressPrimitive.Root.Props & {
  valuePosition?: ProgressValuePosition
}

function Progress({
  className,
  children,
  value,
  valuePosition,
  min = 0,
  max = 100,
  ...props
}: ProgressProps) {
  const percent =
    value === null || value === undefined
      ? null
      : max === min
        ? 0
        : Math.min(
            100,
            Math.max(0, ((value - min) / (max - min)) * 100)
          )

  if (valuePosition === undefined) {
    return (
      <ProgressPrimitive.Root
        value={value}
        min={min}
        max={max}
        data-slot="progress"
        className={cn("flex flex-wrap gap-3", className)}
        {...props}
      >
        {children}
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressPrimitive.Root>
    )
  }

  const isTooltip =
    valuePosition === "tooltip-top" || valuePosition === "tooltip-bottom"

  return (
    <ProgressPrimitive.Root
      value={value}
      min={min}
      max={max}
      data-slot="progress"
      data-value-position={valuePosition}
      className={cn(
        "flex flex-col",
        isTooltip ? "gap-1.5" : "gap-2",
        className
      )}
      {...props}
    >
      {children}
      {valuePosition === "right" && (
        <div className="flex items-center gap-3">
          <ProgressTrack className="min-w-0 flex-1">
            <ProgressIndicator />
          </ProgressTrack>
          <ProgressValue className="ms-0 w-10 shrink-0 text-end" />
        </div>
      )}
      {valuePosition === "left" && (
        <div className="flex items-center gap-3">
          <ProgressValue className="ms-0 w-10 shrink-0 text-start" />
          <ProgressTrack className="min-w-0 flex-1">
            <ProgressIndicator />
          </ProgressTrack>
        </div>
      )}
      {valuePosition === "bottom" && (
        <>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
          <ProgressValue className="ms-0 self-end" />
        </>
      )}
      {isTooltip && (
        <>
          {valuePosition === "tooltip-top" && percent !== null && (
            <ProgressBubbleRow percent={percent} position={valuePosition} />
          )}
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
          {valuePosition === "tooltip-bottom" && percent !== null && (
            <ProgressBubbleRow percent={percent} position={valuePosition} />
          )}
        </>
      )}
    </ProgressPrimitive.Root>
  )
}

function ProgressBubbleRow({
  percent,
  position,
}: {
  percent: number
  position: "tooltip-top" | "tooltip-bottom"
}) {
  const isTop = position === "tooltip-top"
  const arrowStyle: React.CSSProperties = {
    left: `clamp(10px, ${percent}%, calc(100% - 10px))`,
    translate: "-50% 0",
  }
  if (isTop) {
    arrowStyle.bottom = -4
  } else {
    arrowStyle.top = -4
    arrowStyle.rotate = "180deg"
  }

  return (
    <div
      aria-hidden="true"
      data-slot="progress-bubble"
      className="relative h-8"
    >
      <span
        className="absolute top-0 inline-flex h-8 items-center rounded-md bg-neutral-dark-content px-4 text-xs font-medium text-neutral-white shadow-md"
        style={{ left: `${percent}%`, translate: `-${percent}% 0` }}
      >
        <ProgressValue className="ms-0 text-xs font-medium text-neutral-white" />
      </span>
      <svg
        width="10"
        height="5"
        viewBox="0 0 10 5"
        fill="none"
        className="absolute"
        style={arrowStyle}
      >
        <path d="M0 0L5 5L10 0Z" className="fill-neutral-dark-content" />
      </svg>
    </div>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

/** Renders the fill at full width scaled to the value, instead of animating its width. */
function scaleFill(props: React.ComponentProps<"div">) {
  const width = props.style?.width
  if (typeof width !== "string" || !width.endsWith("%")) return <div {...props} />
  const { width: _width, ...style } = props.style ?? {}
  return <div {...props} style={{ ...style, width: "100%", scale: `${Number.parseFloat(width) / 100} 1` }} />
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      // Base UI sizes the fill with an inline width (e.g. 65%); `scaleFill`
      // turns that into a scale of a full-width fill (M2), clipped round by
      // the track exactly as the narrower fill was.
      render={scaleFill}
      className={cn("h-full origin-left bg-primary transition-transform duration-ambient ease-entrance", className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ms-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

const INTERACTIVE = "a[href], button, input, select, textarea, [tabindex]"

type ProgressRowProps = {
  /** The row's name at the start, such as a star level, a channel or a skill. */
  label: React.ReactNode
  /** A small mark after the label, such as a star. */
  icon?: React.ReactNode
  /** Share of the bar, 0 to 100 (clamped). */
  value: number
  /** Shown at the end of the row instead of the rounded percentage (for example a review count). */
  valueText?: React.ReactNode
  /** Colour of the fill: the brand indigo or the yellow of a rating. */
  tone?: "primary" | "yellow"
  /** Name of the whole row for assistive tech. Default: "label: end text", built from the label and the end text. */
  "aria-label"?: string
  className?: string
}

/**
 * One row of a breakdown: the label at the start, a thick bar in the middle and the share at the end, like a
 * rating distribution. The row is one image for assistive tech; a link or button inside the label or the end text
 * makes it a group instead, so it stays reachable. For a single bar with a value use `Progress`.
 */
function ProgressRow({ label, icon, value, valueText, tone = "primary", "aria-label": ariaLabel, className }: ProgressRowProps) {
  // The bar and the percentage text share one clamped value, so 140 draws a full bar and reads 100%, not 140%
  const share = Math.max(0, Math.min(100, value))
  const text = valueText ?? `${Math.round(share)}%`
  const rowRef = React.useRef<HTMLDivElement>(null)
  const [interactive, setInteractive] = React.useState(false)
  // A row whose label or end text holds a link or a button must stay reachable: it is a group then, not a flat image.
  React.useLayoutEffect(() => {
    setInteractive(!!rowRef.current?.querySelector(INTERACTIVE))
  })
  const plain = (node: React.ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : null)
  const name = ariaLabel ?? (plain(label) !== null && plain(text) !== null ? `${plain(label)}: ${plain(text)}` : undefined)
  return (
    <div
      ref={rowRef}
      data-slot="progress-row"
      role={name ? (interactive ? "group" : "img") : undefined}
      aria-label={name}
      className={cn("flex items-center gap-2 text-xs", className)}
    >
      <span className="flex min-w-8 shrink-0 items-center gap-0.5 font-medium text-foreground">
        {label}
        {icon}
      </span>
      <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <span className={cn("block h-full rounded-full", tone === "yellow" ? "bg-tint-text-yellow" : "bg-primary")} style={{ width: `${share}%` }} />
      </span>
      <span className="min-w-8 shrink-0 text-end text-text-secondary">{text}</span>
    </div>
  )
}

export {
  Progress,
  ProgressRow,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}

export type { ProgressValuePosition, ProgressRowProps }
