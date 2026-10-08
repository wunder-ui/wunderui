"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

// No dedicated Figma page yet for Slider — styled to match the Progress
// track/indicator tokens (bg-muted track, bg-primary fill) for consistency.
function Slider({ className, children, value, defaultValue, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }: SliderPrimitive.Root.Props) {
  const resolvedValue = value ?? defaultValue
  const thumbCount = Array.isArray(resolvedValue) ? resolvedValue.length : 1
  // The name belongs on the thumb: that is the focusable range input screen readers announce.
  const thumbLabel = (i: number) => (ariaLabel && thumbCount > 1 ? `${ariaLabel}, ${i === 0 ? "minimum" : "maximum"}` : ariaLabel)

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {children}
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          {Array.from({ length: thumbCount }, (_, i) => (
            <SliderThumb key={i} index={i} aria-label={thumbLabel(i)} aria-labelledby={ariaLabelledBy} />
          ))}
        </SliderTrack>
      </SliderControl>
    </SliderPrimitive.Root>
  )
}

function SliderControl({ className, ...props }: SliderPrimitive.Control.Props) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={cn("relative flex w-full items-center py-2 select-none touch-none", className)}
      {...props}
    />
  )
}

function SliderTrack({ className, ...props }: SliderPrimitive.Track.Props) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn("relative h-1.5 w-full rounded-full bg-muted", className)}
      {...props}
    />
  )
}

function SliderIndicator({ className, ...props }: SliderPrimitive.Indicator.Props) {
  return (
    <SliderPrimitive.Indicator
      data-slot="slider-indicator"
      className={cn("h-full rounded-full bg-primary", className)}
      {...props}
    />
  )
}

function SliderThumb({ className, ...props }: SliderPrimitive.Thumb.Props) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className={cn(
        "block size-4 rounded-full border-2 border-primary bg-card shadow-[0px_1px_2px_0px_rgba(16,24,40,0.1)] outline-none transition-colors",
        "focus-visible:ring-1 focus-visible:ring-ring",
        "data-dragging:cursor-grabbing",
        className
      )}
      {...props}
    />
  )
}

function SliderLabel({ className, ...props }: SliderPrimitive.Label.Props) {
  return (
    <SliderPrimitive.Label
      data-slot="slider-label"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SliderValue({ className, ...props }: SliderPrimitive.Value.Props) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-value"
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

export { Slider, SliderControl, SliderTrack, SliderIndicator, SliderThumb, SliderLabel, SliderValue }
