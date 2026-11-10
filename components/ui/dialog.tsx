"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-open:duration-base data-closed:animate-out data-closed:fade-out-0 data-closed:duration-fast",
        className
      )}
      {...props}
    />
  )
}

const DIALOG_SIZES = {
  sm: "",
  md: "sm:max-w-[512px]",
  lg: "sm:max-w-[720px]",
} as const

const DIALOG_FOOTER_LAYOUTS = {
  inline: "flex-row justify-end",
  stacked: "flex-col-reverse *:w-full",
} as const

const SURFACE_WIDTHS = {
  sm: "max-w-sm",
  md: "max-w-[512px]",
  lg: "max-w-[720px]",
} as const

function DialogCloseButton({
  onClick,
}: {
  onClick?: React.MouseEventHandler<HTMLElement>
}) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      onClick={onClick}
      render={
        <IconButton
          variant="plain"
          className="absolute top-2 right-2 border-transparent shadow-none"
          size="sm"
        />
      }
    >
      <XIcon
      />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  overlayClassName,
  size = "sm",
  appearance = "surface",
  showOverlay = true,
  placement = "center",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  /** Restyle the backdrop, e.g. a flat page colour for a screen that is only the modal. */
  overlayClassName?: string
  /** Figma Dialog / Surface Size: Small 384, Medium 512, Large 720. */
  size?: "sm" | "md" | "lg"
  /** Figma look (default) or the earlier plain look. */
  appearance?: "surface" | "plain"
  /** Non-modal dialog: omit the backdrop. */
  showOverlay?: boolean
  /** Figma dialog placement: center or bottom-right (help panels). */
  placement?: "center" | "bottom-right"
}) {
  return (
    <DialogPortal>
      {showOverlay && <DialogOverlay className={overlayClassName} />}
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-size={size}
        data-appearance={appearance}
        data-placement={placement}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full grid-cols-[minmax(0,1fr)] [--surface:var(--popover)] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-92 data-open:slide-in-from-bottom-2 data-open:duration-slow data-open:ease-overshoot data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-96 data-closed:duration-fast data-closed:ease-exit",
          "group/dialog",
          DIALOG_SIZES[size],
          appearance === "surface" && "shadow-xl",
          placement === "bottom-right" && "right-4 bottom-4 top-auto left-auto translate-x-0 translate-y-0",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && <DialogCloseButton />}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 group-data-[appearance=surface]/dialog:pr-9", className)}
      {...props}
    />
  )
}

const DIALOG_ICON_VARIANTS = {
  default: "bg-muted text-foreground",
  warning: "bg-tint-yellow text-tint-text-yellow",
  destructive: "bg-tint-red text-tint-text-red",
} as const

// A colored icon circle for confirm/warning/destructive dialogs, matching
// the icon-header pattern used across most design-system modal libraries
// (e.g. "Delete project?" with a red trash icon above the title).
function DialogIcon({
  variant = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & { variant?: keyof typeof DIALOG_ICON_VARIANTS }) {
  return (
    <div
      data-slot="dialog-icon"
      className={cn(
        "mb-1 flex size-10 items-center justify-center rounded-full [&_svg]:size-5",
        DIALOG_ICON_VARIANTS[variant],
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  band,
  layout,
  start,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  /** Figma "Band": `true` paints the footer fill; omitted = band inside surface dialogs. */
  band?: boolean
  /** Figma Footer Layout: `inline` one row, `stacked` one column with the primary on top. */
  layout?: "inline" | "stacked"
  /** Figma Footer Layout "Split": action at the left edge (Back, Compare). */
  start?: React.ReactNode
}) {
  return (
    <div
      data-slot="dialog-footer"
      data-layout={layout}
      data-band={band === true ? "" : undefined}
      className={cn(
        layout === undefined
          ? "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl p-4 sm:flex-row sm:justify-end"
          : ["-mx-4 -mb-4 flex gap-2 rounded-b-xl p-4", DIALOG_FOOTER_LAYOUTS[layout]],
        band === true ? "bg-bg-page" : band === undefined ? "group-data-[appearance=surface]/dialog:bg-bg-page" : "",
        className
      )}
      {...props}
    >
      {start && (
        <div data-slot="dialog-footer-start" className="flex items-center sm:mr-auto">
          {start}
        </div>
      )}
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="plain" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium group-data-[appearance=surface]/dialog:leading-6 group-data-[appearance=surface]/dialog:font-semibold",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DialogBody({
  className,
  scrollable = false,
  tabIndex,
  role,
  ...props
}: React.ComponentProps<"div"> & {
  /** Figma Scrollable body: title and footer stay fixed, the body scrolls. With aria-label or aria-labelledby the scrolling body is announced as a region. */
  scrollable?: boolean
}) {
  return (
    <div
      data-slot="dialog-body"
      data-scrollable={scrollable ? "" : undefined}
      tabIndex={scrollable ? (tabIndex ?? 0) : tabIndex}
      role={role ?? (scrollable && (props["aria-label"] || props["aria-labelledby"]) ? "region" : undefined)}
      className={cn(
        "flex min-w-0 flex-col gap-4",
        scrollable && "-mx-4 max-h-[296px] overflow-y-auto border-y border-border px-4 py-3 has-[+[data-slot=dialog-footer]]:-mb-4 focus-ring",
        className
      )}
      {...props}
    />
  )
}

function DialogProgress({
  step,
  steps,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  step: number
  steps: number
  label?: React.ReactNode
}) {
  const total = Math.max(1, Math.floor(steps))
  const current = Math.min(Math.max(1, Math.floor(step)), total)
  return (
    <div
      data-slot="dialog-progress"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-valuetext={`Step ${current} of ${total}`}
      aria-label={`Step ${current} of ${total}`}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">Step {current} of {total}</span>
        {label && <span className="font-medium text-foreground">{label}</span>}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            aria-hidden
            data-state={index < current ? "done" : "todo"}
            className={cn("h-1 flex-1 rounded-full", index < current ? "bg-primary" : "bg-border")}
          />
        ))}
      </div>
    </div>
  )
}

function DialogSurface({
  size = "sm",
  appearance = "surface",
  showCloseButton = true,
  onClose,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Figma Dialog / Surface Size: Small 384, Medium 512, Large 720. */
  size?: "sm" | "md" | "lg"
  /** Figma look (default) or the earlier plain look. */
  appearance?: "surface" | "plain"
  showCloseButton?: boolean
  /** Called when the corner close button is pressed (the static panel has no open state of its own). */
  onClose?: () => void
}) {
  return (
    <DialogPrimitive.Root open={false}>
      <div
        role="group"
        data-slot="dialog-surface"
        data-size={size}
        data-appearance={appearance}
        className={cn(
          "group/dialog relative grid w-full grid-cols-[minmax(0,1fr)] [--surface:var(--popover)] gap-4 rounded-xl bg-popover p-4 text-left text-sm text-popover-foreground ring-1 ring-foreground/10",
          SURFACE_WIDTHS[size],
          appearance === "surface" && "shadow-xl",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && <DialogCloseButton onClick={onClose} />}
      </div>
    </DialogPrimitive.Root>
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogOverlay,
  DialogPortal,
  DialogProgress,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
}
