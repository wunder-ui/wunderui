"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { cn } from "cn"
import { IconButton } from "@/components/ui/icon-button"

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  container,
  ...props
}: DialogPrimitive.Popup.Props & {
  side?: "right" | "left" | "bottom"
  showCloseButton?: boolean
  /** Portal into this element instead of the body, e.g. a device frame. The
   *  element needs its own containing block (a `transform`) so the sheet and
   *  its scrim cover the frame, not the viewport. */
  container?: DialogPrimitive.Portal.Props["container"]
}) {
  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20 data-open:animate-in data-open:fade-in-0 data-open:duration-slow data-closed:animate-out data-closed:fade-out-0 data-closed:duration-slow" />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover [--surface:var(--popover)] p-5 text-popover-foreground shadow-xl outline-none data-open:duration-deliberate data-open:ease-overshoot data-open:blur-in-2 data-closed:duration-slow data-closed:ease-exit data-closed:blur-out-2",
          side === "right" && "inset-y-0 right-0 h-full w-full max-w-sm border-l border-border data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right",
          side === "left" && "inset-y-0 left-0 h-full w-full max-w-sm border-r border-border data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[80vh] rounded-t-xl border-t border-border data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            render={<IconButton variant="plain" size="sm" className="absolute top-3 right-3 border-transparent shadow-none" />}
          >
            <XIcon aria-hidden />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  )
}

/** Closes the sheet it sits in, e.g. a Cancel button in the footer. */
function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose }
