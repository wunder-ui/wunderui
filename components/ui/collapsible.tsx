"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { ChevronDown, Minus, Plus, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { BadgeCounter } from "./badge"
import { Skeleton } from "./skeleton"

type CollapsibleAppearance = "row" | "inline"
type CollapsibleIndicator = "button" | "chevron"
type CollapsibleContentAlign = "start" | "title"

const CollapsibleContext = React.createContext<{
  appearance: CollapsibleAppearance | undefined
  nested: boolean
}>({
  appearance: undefined,
  nested: false,
})

const CollapsibleBodyContext = React.createContext<boolean>(false)

function Collapsible({
  appearance,
  ...props
}: CollapsiblePrimitive.Root.Props & { appearance?: CollapsibleAppearance }) {
  const nested = React.useContext(CollapsibleBodyContext)

  return (
    <CollapsibleContext.Provider value={{ appearance, nested }}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        data-appearance={appearance}
        {...props}
      />
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({
  className,
  children,
  icon,
  description,
  summary,
  count,
  indicator,
  ...props
}: CollapsiblePrimitive.Trigger.Props & {
  /** Optional leading decorative icon. */
  icon?: React.ReactNode
  /** Optional second line under the label. */
  description?: React.ReactNode
  /** Shown only while the panel is closed. */
  summary?: React.ReactNode
  /** Renders a badge counter. */
  count?: number
  /** "button" = the Plus/Minus box, "chevron" = a chevron that flips. */
  indicator?: CollapsibleIndicator
}) {
  const { appearance } = React.useContext(CollapsibleContext)

  const legacy =
    appearance === undefined &&
    !icon &&
    !description &&
    !summary &&
    count === undefined &&
    (indicator === undefined || indicator === "button")

  if (legacy) {
    return (
      <CollapsiblePrimitive.Trigger
        data-slot="collapsible-trigger"
        className={cn(
          "group/collapsible-trigger flex w-full items-center justify-between gap-4 rounded-md text-left text-sm font-medium text-foreground outline-none focus-ring",
          className
        )}
        {...props}
      >
        {children}
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-card text-text-secondary">
          <Plus className="size-2.5 group-data-[panel-open]/collapsible-trigger:hidden" />
          <Minus className="hidden size-2.5 group-data-[panel-open]/collapsible-trigger:block" />
        </span>
      </CollapsiblePrimitive.Trigger>
    )
  }

  const resolvedIndicator = indicator ?? (appearance === undefined ? "button" : "chevron")

  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      data-appearance={appearance}
      className={cn(
        // The transparent border keeps the outer size stable, so the indigo
        // focus ring can draw on it without shifting the layout.
        "group/collapsible-trigger flex items-center rounded-md text-left text-sm font-medium border border-transparent focus-ring transition-colors duration-fast ease-move hover:bg-bg-page active:bg-bg-subtle data-[disabled]:opacity-40 data-[disabled]:hover:bg-transparent",
        appearance === "inline"
          ? "w-fit max-w-full gap-1 px-[11px] py-[5px] text-text-link"
          : "w-full min-w-0 gap-2 px-[11px] py-[7px] text-foreground",
        className
      )}
      {...props}
    >
      {icon && (
        <span
          aria-hidden
          className="flex shrink-0 text-foreground [&_svg]:size-4"
        >
          {icon}
        </span>
      )}
      {description ? (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span>{children}</span>
          <span className="text-xs font-normal text-text-secondary">{description}</span>
        </span>
      ) : (
        <span className={cn("min-w-0", appearance !== "inline" && "flex-1")}>
          {children}
        </span>
      )}
      {summary && (
        <span className="shrink-0 text-xs font-normal text-text-secondary group-data-[panel-open]/collapsible-trigger:hidden">
          {summary}
        </span>
      )}
      {count !== undefined && <BadgeCounter count={count} className="text-text-secondary" />}
      {resolvedIndicator === "chevron" ? (
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 transition-transform duration-base ease-move group-data-[panel-open]/collapsible-trigger:rotate-180"
        />
      ) : (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-card text-text-secondary">
          <Plus className="size-2.5 group-data-[panel-open]/collapsible-trigger:hidden" />
          <Minus className="hidden size-2.5 group-data-[panel-open]/collapsible-trigger:block" />
        </span>
      )}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({
  className,
  children,
  align = "start",
  ...props
}: CollapsiblePrimitive.Panel.Props & { align?: CollapsibleContentAlign }) {
  const { appearance, nested } = React.useContext(CollapsibleContext)

  // Same technique as the Accordion panel: the row animates between 0fr and
  // 1fr, the clip sits on its child and the padding one level further in, so
  // the padding shrinks away with the content. A padding on the panel itself
  // (or a measured height) would stay behind until the panel is hidden, and
  // the row would jump at the very end of closing.
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        // transition-duration only: the duration-base utility also sets animation-duration, which Base UI reads as a keyframe animation on an open panel
        "grid grid-rows-[1fr] text-sm text-text-secondary transition-[grid-template-rows] [transition-duration:var(--duration-base)] ease-entrance data-[ending-style]:grid-rows-[0fr] data-[starting-style]:grid-rows-[0fr]",
        className
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            appearance === undefined
              ? "pt-4"
              : nested
                ? cn("px-3 pt-4 pb-3", align === "title" && "pl-9")
                : cn("px-3 pt-6 pb-3", align === "title" && "pl-9")
          )}
        >
          <CollapsibleBodyContext.Provider value={true}>
            {children}
          </CollapsibleBodyContext.Provider>
        </div>
      </div>
    </CollapsiblePrimitive.Panel>
  )
}

/**
 * Put the `CollapsibleTrigger` as children and a button (for example a Plain
 * small Button "Edit") as `action`. It sits inside `Collapsible`, around the
 * trigger only (the panel stays a sibling below the row).
 */
function CollapsibleRow({
  action,
  className,
  children,
}: {
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="collapsible-row"
      className={cn("flex items-center gap-1", className)}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  )
}

function CollapsibleFeedback({
  kind,
  title,
  description,
  action,
  loadingLabel,
  className,
}: {
  kind: "loading" | "empty" | "error"
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  loadingLabel?: string
  className?: string
}) {
  if (kind === "loading") {
    return (
      <div
        data-slot="collapsible-feedback"
        data-kind="loading"
        role="status"
        aria-busy="true"
        className={cn("flex flex-col gap-0.5", className)}
      >
        <div className="flex flex-col gap-2">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-4/5" />
          <Skeleton className="h-2.5 w-3/5" />
        </div>
        <p className="pt-1 text-xs">{loadingLabel ?? "Loading…"}</p>
      </div>
    )
  }

  if (kind === "empty") {
    return (
      <div
        data-slot="collapsible-feedback"
        data-kind="empty"
        className={cn("flex flex-col gap-0.5", className)}
      >
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        {description && <p className="text-xs">{description}</p>}
        {action}
      </div>
    )
  }

  return (
    <div
      data-slot="collapsible-feedback"
      data-kind="error"
      role="alert"
      className={cn("flex flex-col gap-0.5", className)}
    >
      {title && (
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-error" aria-hidden />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
      )}
      {description && <p className="text-xs">{description}</p>}
      {action}
    </div>
  )
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleRow,
  CollapsibleFeedback,
}
export type { CollapsibleAppearance, CollapsibleIndicator, CollapsibleContentAlign }
