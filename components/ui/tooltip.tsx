"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

const TooltipContext = React.createContext<{ id: string; open: boolean } | null>(null)

/**
 * Shared delay for a group of tooltips, for example a toolbar: the first tooltip opens after
 * `delay` ms, and moving to the next trigger within `timeout` ms shows its tooltip at once.
 */
function TooltipProvider({ delay = 600, closeDelay = 0, timeout = 300, ...props }: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider delay={delay} closeDelay={closeDelay} timeout={timeout} {...props} />
  )
}

function Tooltip({ defaultOpen, open, onOpenChange, ...props }: TooltipPrimitive.Root.Props) {
  const id = React.useId()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const isOpen = open ?? uncontrolledOpen
  const contextValue = React.useMemo(() => ({ id, open: isOpen }), [id, isOpen])

  return (
    <TooltipContext.Provider value={contextValue}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        defaultOpen={defaultOpen}
        open={open}
        {...props}
        onOpenChange={(nextOpen, eventDetails) => {
          setUncontrolledOpen(nextOpen)
          onOpenChange?.(nextOpen, eventDetails)
        }}
      />
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({ describe = true, "aria-describedby": ariaDescribedBy, ...props }: TooltipPrimitive.Trigger.Props & { describe?: boolean }) {
  const context = React.useContext(TooltipContext)
  const describedBy = context && describe !== false && context.open
    ? [ariaDescribedBy, context.id].filter(Boolean).join(" ")
    : ariaDescribedBy

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      {...props}
      aria-describedby={describedBy}
    />
  )
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
  arrow = true,
  maxWidth = 240,
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
    /** Show the small point towards the trigger (Figma Show arrow). */
    arrow?: boolean
    /** Widest the label grows before the text wraps onto the next line: 240 px, or 320 px for long translations. */
    maxWidth?: 240 | 320
  }) {
  const context = React.useContext(TooltipContext)
  const maxWidthClass = {
    240: "max-w-60",
    320: "max-w-80",
  } as const

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner className="isolate z-50 outline-none" sideOffset={sideOffset} side={side} align={align} anchor={anchor}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          id={context?.id}
          role="tooltip"
          className={cn(
            // fill-mode-both: the popup is invisible during the enter delay and stays
            // invisible after the exit — without it, it flashes at full opacity at both ends.
            "z-50 inline-flex items-center rounded-md bg-neutral-dark-content px-4 py-2 has-[kbd]:py-[7px] text-xs font-medium text-neutral-white shadow-md fill-mode-both data-open:animate-in data-open:data-instant:animate-none data-closed:data-instant:animate-none data-open:fade-in-0 origin-(--transform-origin) data-open:zoom-in-98 data-open:duration-fast data-open:delay-instant data-open:ease-entrance data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-98 data-closed:duration-instant data-closed:ease-exit",
            maxWidthClass[maxWidth],
            linger &&
              "data-open:delay-0 data-open:slide-in-from-bottom-1 data-closed:zoom-out-100 data-closed:slide-out-to-top-1 data-closed:duration-ambient data-closed:ease-move",
            className
          )}
          {...props}
        >
          {children}
          {shortcut && (
            <kbd className="ml-2 inline-flex h-[18px] items-center rounded-sm bg-bg-tooltip-key px-[5px] font-sans text-xs leading-4 font-semibold text-neutral-white shrink-0 whitespace-nowrap">
              {shortcut}
            </kbd>
          )}
          {/* The arrow points down by default (tooltip above the trigger); when the
              tooltip flips or sits beside the trigger it turns to keep pointing at it. */}
          {arrow && (
            <TooltipPrimitive.Arrow className="data-[side=bottom]:top-[-4px] data-[side=bottom]:rotate-180 data-[side=left]:right-[-6px] data-[side=left]:-rotate-90 data-[side=right]:left-[-6px] data-[side=right]:rotate-90 data-[side=top]:bottom-[-4px]">
              <svg width="10" height="5" viewBox="0 0 10 5" fill="none">
                <path d="M0 0L5 5L10 0Z" className="fill-neutral-dark-content" />
              </svg>
            </TooltipPrimitive.Arrow>
          )}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
