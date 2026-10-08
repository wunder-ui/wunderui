"use client"

import * as React from "react"
import { CircleCheck, TriangleAlert, X } from "lucide-react"
import { cn } from "cn"

type AlertVariant = "plain" | "positive" | "primary" | "negative" | "warning"
type AlertSize = "small" | "large"

// Colors trace 1:1 to the Figma Alert component: each variant's bg/border
// are the same base color at 20%/60% opacity, text/icon at full opacity —
// matching --success/--primary/--destructive/--brand-quaternary exactly.
const ALERT_VARIANT_CLASSES: Record<AlertVariant, string> = {
  plain: "border-border bg-card text-foreground",
  positive: "border-success/60 bg-tint-green text-tint-text-green",
  primary: "border-primary/60 bg-tint-indigo text-tint-text-indigo",
  negative: "border-destructive/60 bg-tint-red text-tint-text-red",
  warning: "border-brand-quaternary/60 bg-brand-quaternary/20 text-text-warning",
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
  /** Replaces the leading icon (default: a check circle, a warning triangle for negative and warning). `null` hides it. */
  icon?: React.ReactNode
  onClose?: () => void
}) {
  return (
    <AlertSizeContext.Provider value={size}>
      <div
        role="alert"
        data-slot="alert"
        className={cn(
          "flex gap-3 rounded-lg border px-3 py-2",
          size === "small" ? "items-center" : "items-start",
          ALERT_VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      >
        {icon === undefined ? (
          // Figma: circle-check for plain/positive/primary, triangle-alert for negative and warning
          variant === "negative" || variant === "warning" ? (
            <TriangleAlert data-slot="alert-icon" className="size-4 shrink-0" />
          ) : (
            <CircleCheck data-slot="alert-icon" className="size-4 shrink-0" />
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
            className="shrink-0 rounded-sm opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X className="size-4" />
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
      className={cn("text-sm", size === "small" && "min-w-0 flex-1 basis-0 truncate", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
