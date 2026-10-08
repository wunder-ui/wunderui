"use client"

import { Meter as MeterPrimitive } from "@base-ui/react/meter"
import { cn } from "cn"

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

function MeterIndicator({ className, ...props }: MeterPrimitive.Indicator.Props) {
  return (
    <MeterPrimitive.Indicator
      data-slot="meter-indicator"
      className={cn("h-full bg-primary transition-[width] duration-ambient ease-entrance", className)}
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
