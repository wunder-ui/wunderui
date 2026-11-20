"use client"

import type * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { DialogIcon } from "@/components/ui/dialog"

// AlertDialog reuses Dialog's own visual language (same overlay/popup/title/
// description classes) but does not close on an outside click (Escape still closes it) —
// use it for confirm/destructive actions the user must explicitly resolve.
// showCloseButton defaults to false here (unlike Dialog) for that reason.

function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-neutral-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-open:duration-base data-closed:animate-out data-closed:fade-out-0 data-closed:duration-fast",
        className
      )}
      {...props}
    />
  )
}

const ALERT_DIALOG_SIZES = {
  default: "sm:max-w-sm",
  lg: "sm:max-w-[440px]",
} as const

function AlertDialogContent({
  className,
  children,
  size = "default",
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  /** `lg` is the 440 px Figma width. */
  size?: "default" | "lg"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid grid-cols-[minmax(0,1fr)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-92 data-open:slide-in-from-bottom-2 data-open:duration-slow data-open:ease-overshoot data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-96 data-closed:duration-fast data-closed:ease-exit",
          ALERT_DIALOG_SIZES[size],
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />
  )
}

// Figma "Actions": Inline puts the buttons in one row, Stacked puts them in one column
// (primary on top, then the secondary action, Cancel last — the DOM order is the reverse).
// Without `layout` the footer stays responsive: stacked below sm, inline from sm up.
const ALERT_DIALOG_FOOTER_LAYOUTS = {
  inline: "flex-row justify-end",
  stacked: "flex-col-reverse",
  responsive: "flex-col-reverse sm:flex-row sm:justify-end",
} as const

function AlertDialogFooter({
  className,
  children,
  layout,
  ...props
}: React.ComponentProps<"div"> & {
  /** `inline` forces one row, `stacked` forces one column; omitted = stacked below `sm`, inline from `sm` up. */
  layout?: "inline" | "stacked"
}) {
  return (
    <div
      data-slot="alert-dialog-footer"
      data-layout={layout}
      className={cn(
        "-mx-4 -mb-4 -mt-4 flex gap-2 rounded-b-xl p-4",
        ALERT_DIALOG_FOOTER_LAYOUTS[layout ?? "responsive"],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("font-heading text-base leading-6 font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogCancel({ className, ...props }: AlertDialogPrimitive.Close.Props) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant="plain" className={className} />}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  variant = "primary",
  ...props
}: AlertDialogPrimitive.Close.Props & {
  /** `secondary` is the plain button for the third action ("Discard changes", "Keep editing"); it closes the dialog like the others. */
  variant?: "primary" | "destructive" | "secondary"
}) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-action"
      data-variant={variant}
      // Button's own destructive variant: hover red-800, pressed red-900 (fixed tokens) keep
      // the label at AA; the former bg-destructive/90 hover lightened it to 4.44:1.
      // The secondary action is Button's plain look (the same one Cancel uses, with its border).
      render={<Button variant={variant === "secondary" ? "plain" : variant} className={className} />}
      {...props}
    />
  )
}

// Default icons follow the Figma set: circle-alert (default), trash-2 (destructive).
// The warning tone gets the warning triangle. `icon` replaces the default; children replace both.
function AlertDialogIcon({
  variant = "default",
  icon,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogIcon>, "children"> & {
  icon?: React.ReactNode
  children?: React.ReactNode
}) {
  const fallback =
    variant === "destructive" ? <Icon name="trash" aria-hidden /> : variant === "warning" ? <Icon name="warning" aria-hidden /> : <Icon name="error" aria-hidden />
  return (
    // Figma Alert Dialog icon: a 40 px tile with radius 8 on the tint of its tone (indigo by default);
    // the plain Dialog icon stays a round bg-muted circle.
    // mb-2 plus the header gap of 8 px gives the Figma 16 px between the tile and the title.
    <DialogIcon
      variant={variant}
      {...props}
      className={cn("mb-2 rounded-md", variant === "default" && "bg-tint-indigo text-tint-text-indigo", props.className)}
    >
      {children ?? icon ?? fallback}
    </DialogIcon>
  )
}

// Inline feedback inside the dialog (Figma "Alert Dialog / Feedback"): an announced message,
// e.g. "Could not delete the project. Try again." Same tints as Alert's negative / warning.
const ALERT_DIALOG_FEEDBACK_TONES = {
  error: "border-tint-text-red bg-tint-red text-tint-text-red",
  warning: "border-tint-text-yellow bg-tint-yellow text-tint-text-yellow",
} as const

function AlertDialogFeedback({
  tone = "error",
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  tone?: keyof typeof ALERT_DIALOG_FEEDBACK_TONES
  /** Replaces the leading icon; `null` hides it. */
  icon?: React.ReactNode
}) {
  return (
    <div
      role="alert"
      data-slot="alert-dialog-feedback"
      data-tone={tone}
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm text-pretty",
        ALERT_DIALOG_FEEDBACK_TONES[tone],
        className
      )}
      {...props}
    >
      {icon === null ? null : (
        <span aria-hidden className="mt-0.5 flex shrink-0 [&_svg]:size-4">
          {icon ?? (tone === "warning" ? <Icon name="warning" /> : <Icon name="error" />)}
        </span>
      )}
      <span className="min-w-0">{children}</span>
    </div>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFeedback,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogIcon,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
