"use client"

import * as React from "react"
import { PreviewCard } from "@base-ui/react/preview-card"
import { cn } from "@/lib/utils"

function HoverCard({ ...props }: PreviewCard.Root.Props) {
  return <PreviewCard.Root data-slot="hover-card" {...props} />
}

// The card opens after 100 ms and closes 100 ms after the pointer leaves. The
// primitive's own defaults (600 / 300 ms) make a preview feel like it never loads.
function HoverCardTrigger({ delay = 100, closeDelay = 100, ...props }: PreviewCard.Trigger.Props) {
  return <PreviewCard.Trigger data-slot="hover-card-trigger" delay={delay} closeDelay={closeDelay} {...props} />
}

function HoverCardContent({
  className,
  sideOffset = 8,
  side,
  ...props
}: PreviewCard.Popup.Props & Pick<PreviewCard.Positioner.Props, "sideOffset" | "side">) {
  return (
    <PreviewCard.Portal>
      <PreviewCard.Positioner className="isolate z-50 outline-none" sideOffset={sideOffset} side={side}>
        <PreviewCard.Popup
          data-slot="hover-card-content"
          className={cn(
            "z-50 w-72 rounded-md border border-border bg-popover p-4 text-sm text-popover-foreground shadow-lg outline-none",
            "data-open:animate-in data-open:fade-in-0 origin-(--transform-origin) data-open:zoom-in-97 data-open:duration-instant data-open:ease-entrance data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-99 data-closed:duration-instant data-closed:ease-exit",
            className
          )}
          {...props}
        />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
