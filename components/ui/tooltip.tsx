"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 8,
  children,
  side = "top",
  align,
  anchor,
  shortcut,
  linger = false,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "sideOffset" | "side" | "align" | "anchor"> & {
    /** Keyboard hint rendered after the label, e.g. "⌘K" (Figma Type=shortcut). */
    shortcut?: string
    /**
     * For confirmations such as "Copied to clipboard": appears at once and,
     * when closed, drifts up slightly while it fades out slowly instead of
     * snapping away.
     */
    linger?: boolean
  }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner className="isolate z-50 outline-none" sideOffset={sideOffset} side={side} align={align} anchor={anchor}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            // fill-mode-both: the popup is invisible during the enter delay and stays
            // invisible after the exit — without it, it flashes at full opacity at both ends.
            "z-50 inline-flex items-center rounded-[6px] bg-neutral-dark-content px-4 py-2 text-xs font-medium text-neutral-white shadow-md fill-mode-both data-open:animate-in data-open:fade-in-0 data-open:zoom-in-98 data-open:duration-fast data-open:delay-80 data-open:ease-entrance data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-98 data-closed:duration-instant data-closed:ease-exit",
            linger &&
              "data-open:delay-0 data-open:slide-in-from-bottom-1 data-closed:zoom-out-100 data-closed:slide-out-to-top-1 data-closed:duration-ambient data-closed:ease-[cubic-bezier(0.33,0,0.25,1)]",
            className
          )}
          {...props}
        >
          {children}
          {shortcut && (
            <kbd className="ml-2 inline-flex h-4 items-center rounded-[3px] bg-white/15 px-1 font-sans text-[10px] font-medium text-white/90">
              {shortcut}
            </kbd>
          )}
          {/* The arrow points down by default (tooltip above the trigger); when the
              tooltip flips or sits beside the trigger it turns to keep pointing at it. */}
          <TooltipPrimitive.Arrow className="data-[side=bottom]:top-[-4px] data-[side=bottom]:rotate-180 data-[side=left]:right-[-6px] data-[side=left]:-rotate-90 data-[side=right]:left-[-6px] data-[side=right]:rotate-90 data-[side=top]:bottom-[-4px]">
            <svg width="10" height="5" viewBox="0 0 10 5" fill="none">
              <path d="M0 0L5 5L10 0Z" className="fill-neutral-dark-content" />
            </svg>
          </TooltipPrimitive.Arrow>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent }
