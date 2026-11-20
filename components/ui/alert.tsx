"use client"

import * as React from "react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"

type AlertVariant = "plain" | "positive" | "primary" | "negative" | "warning"
type AlertSize = "small" | "large" | "inline"

// Colors trace 1:1 to the Figma InlineAlert: a tint fill, with text, icon and border in the tint
// text colour of the same hue (fixed tokens, no alpha mixing).
const ALERT_VARIANT_CLASSES: Record<AlertVariant, string> = {
  plain: "border-border bg-card text-foreground",
  positive: "border-tint-text-green bg-tint-green text-tint-text-green",
  primary: "border-tint-text-indigo bg-tint-indigo text-tint-text-indigo",
  negative: "border-tint-text-red bg-tint-red text-tint-text-red",
  warning: "border-tint-text-yellow bg-tint-yellow text-tint-text-yellow",
}

// `inline` has no box: a line of supporting text with a 14 px icon, both in the text colour of the variant.
const ALERT_INLINE_CLASSES: Record<AlertVariant, string> = {
  plain: "text-text-tertiary",
  positive: "text-text-success",
  primary: "text-tint-text-indigo",
  negative: "text-text-error",
  warning: "text-text-warning",
}

const AlertSizeContext = React.createContext<AlertSize>("large")

function Alert({
  variant = "plain",
  size = "large",
  icon,
  onClose,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: AlertVariant
  size?: AlertSize
  /** Replaces the leading icon (default: a check circle, a warning triangle for negative and warning; with `size="inline"` a shield check). `null` hides it. */
  icon?: React.ReactNode
  onClose?: () => void
}) {
  if (size === "inline") {
    // A static hint, not an announcement: no role="alert", so a screen reader meets it in the reading order.
    const inlineIcon =
      icon === undefined ? (
        variant === "negative" || variant === "warning" ? (
          <Icon name="warning" data-slot="alert-icon" strokeWidth={1.5} className="mt-px size-3.5 shrink-0" />
        ) : variant === "positive" ? (
          <Icon name="success" data-slot="alert-icon" strokeWidth={1.5} className="mt-px size-3.5 shrink-0" />
        ) : (
          <Icon name="verified" data-slot="alert-icon" strokeWidth={1.5} className="mt-px size-3.5 shrink-0" />
        )
      ) : icon === null ? null : (
        <span data-slot="alert-icon" className="mt-px flex shrink-0 [&_svg]:size-3.5">{icon}</span>
      )
    return (
      <AlertSizeContext.Provider value={size}>
        <div data-slot="alert" data-size="inline" className={cn("flex items-start gap-2 text-xs", ALERT_INLINE_CLASSES[variant], className)} {...props}>
          {inlineIcon}
          <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">{children}</div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Dismiss"
              data-slot="alert-close"
              className="shrink-0 rounded-sm opacity-70 outline-none transition-opacity duration-fast ease-entrance hover:opacity-100 focus-visible:opacity-100 focus-ring"
            >
              <Icon name="close" className="size-3.5" />
            </button>
          )}
        </div>
      </AlertSizeContext.Provider>
    )
  }
  return (
    <AlertSizeContext.Provider value={size}>
      <div
        role="alert"
        data-slot="alert"
        className={cn(
          "flex gap-2 rounded-md border px-3 py-2",
          size === "small" ? "items-center" : "items-start",
          ALERT_VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      >
        {icon === undefined ? (
          // Figma: circle-check for plain/positive/primary, triangle-alert for negative and warning
          variant === "negative" || variant === "warning" ? (
            <Icon name="warning" data-slot="alert-icon" className="size-4 shrink-0" />
          ) : (
            <Icon name="success" data-slot="alert-icon" className="size-4 shrink-0" />
          )
        ) : icon === null ? null : (
          <span data-slot="alert-icon" className="flex shrink-0 [&_svg]:size-4">{icon}</span>
        )}
        {/* items-start: an action button keeps its own width instead of stretching across the alert */}
        <div className={cn("flex min-w-0 flex-1", size === "small" ? "items-center gap-2" : "flex-col items-start gap-2")}>
          {children}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss"
            data-slot="alert-close"
            className="shrink-0 rounded-sm opacity-70 outline-none transition-opacity duration-fast ease-entrance hover:opacity-100 focus-visible:opacity-100 focus-ring"
          >
            <Icon name="close" className="size-4" />
          </button>
        )}
      </div>
    </AlertSizeContext.Provider>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  const size = React.useContext(AlertSizeContext)
  // small alerts are one line: the title keeps its width, the description gets
  // what is left and truncates; only a very narrow alert truncates the title
  return (
    <p
      data-slot="alert-title"
      className={cn("text-sm font-medium", size === "small" && "min-w-0 truncate", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  const size = React.useContext(AlertSizeContext)
  return (
    <p
      data-slot="alert-description"
      className={cn("text-sm", size === "small" ? "min-w-0 flex-1 basis-0 truncate" : "[[data-slot=alert-title]+&]:-mt-1", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
