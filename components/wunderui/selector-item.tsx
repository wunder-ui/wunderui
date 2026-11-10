"use client"

import { cloneElement, isValidElement, useId, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A list row pairing a label/description with a control — pass a
 *  RadioGroupItem, Checkbox, or Switch as `control`. Stack rows inside
 *  SelectorItemGroup for a single bordered list.
 *
 *  The label (leading, title, description, metadata and the control) is one
 *  <label>, so a click on it toggles the control. The border answers the
 *  pointer on hover (bg-page), the row takes bg-subtle while pressed and the border turns
 *  indigo while the control is checked — the state is read from the control
 *  itself, so it follows a radio group or a controlled checkbox without extra props.
 *
 *  `action` is a secondary control (a menu button, an "Edit" link). It is a
 *  sibling of the <label>, never inside it: a click on it does not toggle the
 *  control, and the row has one tab stop for the control and one for the action.
 *  `metadata` sits inside the label and is plain text, not interactive.
 *
 *  The surrounding <label> only names native inputs; Base UI controls render a
 *  role="radio" / role="checkbox" span, so the title and description are wired
 *  to the control with aria-labelledby / aria-describedby unless the control
 *  brings its own name. `helper` and `error` are linked the same way; an `error`
 *  also marks the control aria-invalid (unless it sets that itself). */
function SelectorItem({
  leading,
  title,
  description,
  control,
  controlPosition = "trailing",
  layout = "card",
  metadata,
  action,
  helper,
  error,
  announceError,
  className,
}: {
  leading?: ReactNode
  title: ReactNode
  description?: ReactNode
  control: ReactNode
  /** Which side of the label the control sits on. */
  controlPosition?: "leading" | "trailing"
  /** `card` is the bordered row; `inline` is a 24 px row without border or padding. */
  layout?: "card" | "inline"
  /** Short secondary text next to the control (a price, a count). Not interactive. */
  metadata?: ReactNode
  /** Secondary action beside the row. Rendered outside the label; clicking it never toggles the control. */
  action?: ReactNode
  /** Hint text below the row. */
  helper?: ReactNode
  /** Error text below the row; marks the control invalid. It is linked with aria-describedby, so a screen reader reads it when the control gets focus. */
  error?: ReactNode
  /** Announce the error at once (`role="alert"`). Set it only for an error that appears after an action such as a failed submit; leave it off for an error that is already there when the page loads, or it is read twice. */
  announceError?: boolean
  className?: string
}) {
  const titleId = useId()
  const descriptionId = useId()
  const helperId = useId()
  const errorId = useId()
  const inline = layout === "inline"
  const leadingControl = controlPosition === "leading"
  // On the tint/red surface muted-foreground drops under AA in dark (3.9:1); text-secondary keeps 6.9:1.
  const errorCard = Boolean(error) && !inline

  let named: ReactNode = control
  if (isValidElement<Record<string, unknown>>(control)) {
    const props = control.props
    const brings = props["aria-label"] != null || props["aria-labelledby"] != null
    const ids = [
      brings ? undefined : description ? descriptionId : undefined,
      helper ? helperId : undefined,
      error ? errorId : undefined,
    ].filter(Boolean) as string[]
    const own = props["aria-describedby"] as string | undefined
    const patch: Record<string, unknown> = {}
    if (!brings) patch["aria-labelledby"] = titleId
    if (own) patch["aria-describedby"] = own
    else if (ids.length) patch["aria-describedby"] = ids.join(" ")
    if (error && props["aria-invalid"] == null) patch["aria-invalid"] = true
    if (Object.keys(patch).length) named = cloneElement(control, patch)
  }

  const controlSlot = (
    <span data-slot="selector-item-control" className="shrink-0">
      {named}
    </span>
  )

  return (
    <div data-slot="selector-item" data-layout={layout} data-control-position={controlPosition} className="flex flex-col gap-1">
      <div
        data-slot="selector-item-row"
        className={cn(
          "flex items-center",
          !inline && [
            "rounded-lg border border-border bg-card",
            "transition-[border-color,box-shadow,background-color] duration-fast ease-move hover:bg-bg-page",
            "has-[label:active]:bg-subtle",
            "has-[label_[data-checked]:not([data-slot^=switch])]:border-primary has-[label_[data-checked]:not([data-slot^=switch])]:bg-bg-subtle has-[label_[data-checked]:not([data-slot^=switch])]:hover:bg-bg-subtle",
            "has-[label_[data-disabled]]:cursor-not-allowed has-[label_[data-disabled]]:opacity-40 has-[label_[data-disabled]]:hover:bg-card",
          ],
          inline && "min-h-6 has-[label_[data-disabled]]:cursor-not-allowed has-[label_[data-disabled]]:opacity-40",
          // Error: red border plus the tint/red surface; hover and pressed keep it, disabled wins.
          errorCard &&
            "border-destructive/60 bg-tint-red hover:bg-tint-red has-[label:active]:bg-tint-red has-[label_[data-disabled]]:bg-card",
          className
        )}
      >
        <label
          data-slot="selector-item-label"
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer items-center rounded-[inherit]",
            inline ? "min-h-6 gap-2" : "justify-between gap-4 px-3 py-4"
          )}
        >
          <span className={cn("flex min-w-0 items-center", inline ? "gap-2" : "gap-4")}>
            {leadingControl && controlSlot}
            {/* The leading slot is at least 32 px wide and centres its content, so icons, tiles and avatars of different sizes
                share one centre line and the text starts at the same x in every row. */}
            {leading && (
              <span data-slot="selector-item-leading" className={cn("flex min-h-8 min-w-8 shrink-0 items-center justify-center", !inline && "-mr-2")}>
                {leading}
              </span>
            )}
            <span className={cn("flex min-w-0 flex-col", inline ? "gap-0.5" : "gap-1")}>
              <span id={titleId} className="truncate text-sm font-medium text-foreground">{title}</span>
              {description && <span id={descriptionId} className={cn("truncate text-sm text-muted-foreground", errorCard && "text-text-secondary")}>{description}</span>}
            </span>
          </span>
          {(metadata || !leadingControl) && (
            <span className="flex shrink-0 items-center gap-4">
              {metadata && <span data-slot="selector-item-metadata" className={cn("text-sm text-muted-foreground tabular-nums", errorCard && "text-text-secondary")}>{metadata}</span>}
              {!leadingControl && controlSlot}
            </span>
          )}
        </label>
        {action && (
          <span data-slot="selector-item-action" className={cn("flex shrink-0 items-center", inline ? "ps-2" : "pe-3")}>
            {action}
          </span>
        )}
      </div>
      {helper && (
        <p id={helperId} data-slot="selector-item-helper" className={cn("text-sm text-muted-foreground text-pretty", !inline && "px-1")}>
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} data-slot="selector-item-error" role={announceError ? "alert" : undefined} className={cn("text-sm text-text-error text-pretty", !inline && "px-1")}>
          {error}
        </p>
      )}
    </div>
  )
}

function SelectorItemGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div data-slot="selector-item-group" className={cn("flex flex-col gap-2", className)}>{children}</div>
}

export { SelectorItem, SelectorItemGroup }
