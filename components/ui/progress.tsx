"use client"

import type * as React from "react"
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
          <ProgressValue className="ml-0 w-10 shrink-0 text-right" />
        </div>
      )}
      {valuePosition === "left" && (
        <div className="flex items-center gap-3">
          <ProgressValue className="ml-0 w-10 shrink-0 text-left" />
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
          <ProgressValue className="ml-0 self-end" />
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
        <ProgressValue className="ml-0 text-xs font-medium text-neutral-white" />
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
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}

export type { ProgressValuePosition }
