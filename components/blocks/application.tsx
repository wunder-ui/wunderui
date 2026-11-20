"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon-provider"
import { handleTabListKeyDown, useRovingTabStop } from "@/lib/roving-tabs"
import { Badge } from "@/components/ui/badge"
import { KbdHint } from "@/components/ui/kbd"
import { ItemCardCover, ItemCardFile, type ItemCardFileProps } from "@/components/wunderui/item-card"
import { TimelineEntry, type TimelineEntryProps } from "@/components/wunderui/timeline"

/* ------------------------------------------------------------------ */
/* Keyboard Hint, Command Item Row, Search Result — deprecated aliases */
/* of KbdHint (Kbd), CommandRow (Command), SearchResultRow (Search     */
/* Result Card)                                                         */
/* ------------------------------------------------------------------ */

/** @deprecated Use `KbdHint`. */
const KeyboardHint = KbdHint

/* ------------------------------------------------------------------ */
/* Checklist Task — onboarding checklist row                            */
/* Figma: Checklist Task (693:123)                                     */
/* ------------------------------------------------------------------ */

/**
 * One step of an onboarding checklist. Three states, as in the Figma set:
 * `done` (green tick, muted label), the `current` step (tinted row, a line of
 * explanation and its own call to action) and everything still to do (empty
 * circle and a chevron).
 *
 * The row is a toggle: `onClick` fires for done and open steps alike, so a
 * step can be ticked and unticked again. On the current step the circle is its
 * own button, because the row already carries the `action`.
 */
function ChecklistTask({
  done,
  current,
  children,
  meta,
  action,
  onClick,
  className,
}: {
  done?: boolean
  /** The step to do next — tinted, with room for `meta` and an `action`. */
  current?: boolean
  children: React.ReactNode
  meta?: React.ReactNode
  /** A button shown on the current step, e.g. "Start". */
  action?: React.ReactNode
  /** Toggle the step. */
  onClick?: () => void
  className?: string
}) {
  const circle = (
    <span
      className={cn(
        "grid size-[22px] shrink-0 place-items-center rounded-full transition-colors duration-fast ease-move",
        done ? "bg-success text-success-foreground" : cn("border-[1.5px] bg-card", current ? "border-tint-text-indigo" : "border-muted-foreground group-hover/task:border-primary")
      )}
    >
      {done && <Icon name="check" className="size-3.5 animate-in zoom-in-50 duration-fast" strokeWidth={1.5} />}
    </span>
  )

  const label = (
    <span className="flex min-w-0 flex-1 flex-col">
      <span
        className={cn(
          "text-sm font-medium transition-colors duration-fast ease-move",
          done ? "text-text-tertiary" : current ? "text-tint-text-indigo" : "text-foreground"
        )}
      >
        {children}
      </span>
      {meta && (
        <span className={cn("text-xs", current ? "text-tint-text-indigo" : "text-text-tertiary")}>{meta}</span>
      )}
    </span>
  )

  const classes = cn(
    "group/task flex w-full items-center gap-3 rounded-md px-3 py-2 text-start transition-colors duration-fast ease-move outline-none focus-ring",
    current ? "bg-tint-indigo py-3" : "hover:bg-muted/50",
    className
  )

  // The current step carries its own button, so the row itself must not be one.
  if (current) {
    return (
      <div data-slot="checklist-task" data-current className={classes}>
        <button type="button" role="checkbox" aria-checked={Boolean(done)} aria-label="Mark as done" onClick={onClick} className="rounded-full outline-none focus-ring">
          {circle}
        </button>
        {label}
        {action}
      </div>
    )
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={Boolean(done)}
      data-slot="checklist-task"
      data-done={done || undefined}
      onClick={onClick}
      className={cn(classes, "outline-none focus-ring")}
    >
      {circle}
      {label}
      {!done && <Icon name="chevronRight" className="size-4 text-text-tertiary" strokeWidth={1.5} />}
    </button>
  )
}

/** @deprecated Use `ItemCardCover` with the same props. */
const ProjectCard = ItemCardCover

type FileCardProps = ItemCardFileProps

/** @deprecated Use `ItemCardFile` with the same props. */
const FileCard = ItemCardFile

/* ------------------------------------------------------------------ */
/* Tab Item — underline tab with optional count                        */
/* Figma: Tab Item (693:167)                                           */
/* ------------------------------------------------------------------ */

type TabItemProps = Omit<React.ComponentProps<"button">, "children" | "onClick"> & {
  active?: boolean
  count?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}

/**
 * @deprecated Use `Tabs` (`variant="line"`) with `TabsTrigger count`.
 *
 * Pass `id` and `aria-controls` (and `aria-labelledby` on your panel) to tie the tab to its panel.
 */
function TabItem({ active, count, children, onClick, className, ...props }: TabItemProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={!!active}
      data-slot="tab-item"
      onClick={onClick}
      {...props}
      className={cn("group/tab-item -mb-px flex shrink-0 flex-col gap-2 rounded-sm pt-2 text-sm font-medium whitespace-nowrap transition-colors duration-fast ease-entrance outline-none focus-ring focus-visible:-outline-offset-2! disabled:pointer-events-none disabled:opacity-40", active ? "text-text-link" : "text-text-secondary hover:text-foreground", className)}
    >
      <span className="flex items-center gap-2">
        {children}
        {active && count !== undefined && (
          <Badge color="indigo" badgeStyle="light" shape="pill">
            {count}
          </Badge>
        )}
      </span>
      {/* The bar overlaps the 1 px line of the TabBar (-mb-px on the tab): the underline, active or on hover, sits exactly on the divider. */}
      <span className={cn("h-0.5 w-full rounded-full transition-colors duration-fast ease-entrance", active ? "bg-primary" : "bg-transparent group-hover/tab-item:bg-border-control")} />
    </button>
  )
}

/** @deprecated Use `Tabs` with `TabsList variant="line"`. Tabs pattern: one tab stop (the active tab); ←/→ move and activate, Home/End jump, both wrap. */
function TabBar({ children, className, "aria-label": ariaLabel }: { children: React.ReactNode; className?: string; "aria-label"?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  useRovingTabStop(ref)
  return (
    <div ref={ref} role="tablist" aria-label={ariaLabel} data-slot="tab-bar" onKeyDown={handleTabListKeyDown} className={cn("flex gap-6 overflow-x-auto border-b border-border [scrollbar-width:none]", className)}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Timeline Event — moved to TimelineEntry (wunderui/timeline.tsx)     */
/* ------------------------------------------------------------------ */

/** @deprecated Use `TimelineEntry` from the Timeline component. Same props, same look. */
const TimelineEvent = TimelineEntry
type TimelineEventProps = TimelineEntryProps

export { KeyboardHint, ChecklistTask, ProjectCard, FileCard, TabItem, TabBar, TimelineEvent }
export type { TabItemProps, FileCardProps, TimelineEventProps }
