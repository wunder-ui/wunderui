"use client"

import type * as React from "react"
import { Meter as MeterPrimitive } from "@base-ui/react/meter"
import { cn } from "@/lib/utils"

/** A fixed-point-in-range gauge (e.g. disk usage, a score) — visually like
 *  Progress, but semantically for a static value rather than a task's
 *  completion percentage. */
function Meter({ className, children, value, ...props }: MeterPrimitive.Root.Props) {
  return (
    <MeterPrimitive.Root
      value={value}
      data-slot="meter"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </MeterPrimitive.Root>
  )
}

function MeterTrack({ className, ...props }: MeterPrimitive.Track.Props) {
  return (
    <MeterPrimitive.Track
      data-slot="meter-track"
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
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

function MeterIndicator({ className, ...props }: MeterPrimitive.Indicator.Props) {
  return (
    <MeterPrimitive.Indicator
      data-slot="meter-indicator"
      // Base UI sizes the fill with an inline width (e.g. 65%); `scaleFill`
      // turns that into a scale of a full-width fill (M2), clipped round by
      // the track exactly as the narrower fill was.
      render={scaleFill}
      className={cn("h-full origin-left bg-primary transition-transform duration-ambient ease-entrance", className)}
      {...props}
    />
  )
}

function MeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return (
    <MeterPrimitive.Label
      data-slot="meter-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function MeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return (
    <MeterPrimitive.Value
      data-slot="meter-value"
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

export { Meter, MeterTrack, MeterIndicator, MeterLabel, MeterValue }
