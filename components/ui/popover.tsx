"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  sideOffset = 8,
  side,
  align,
  anchor,
  ...props
}: PopoverPrimitive.Popup.Props & Pick<PopoverPrimitive.Positioner.Props, "sideOffset" | "side" | "align" | "anchor">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner className="isolate z-50 outline-none" sideOffset={sideOffset} side={side} align={align} anchor={anchor}>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "z-50 rounded-lg border border-border bg-popover [--surface:var(--popover)] p-3 text-popover-foreground shadow-lg outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:duration-base data-open:ease-overshoot data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-99 data-closed:duration-fast data-closed:ease-exit",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

/** Closes the popover it sits in — render it as an icon button for an ×, or around Cancel/Apply. */
function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverClose }
