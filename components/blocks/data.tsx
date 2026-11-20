"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon-provider"
import { AvatarGroup, AvatarLabel, type Person } from "@/components/ui/avatar"
import { IconButton } from "@/components/ui/icon-button"
import { Rating } from "@/components/wunderui/rating"
import { AvatarStack } from "./avatar-stack"

/* ------------------------------------------------------------------ */
/* Event Chip + Agenda Event (calendar)                                */
/* Figma: Event Chip (722:112), Agenda Event (722:129)                 */
/* ------------------------------------------------------------------ */

type EventColor = "indigo" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green"

const EVENT_TINT: Record<EventColor, string> = {
  indigo: "bg-tint-indigo text-tint-text-indigo",
  blue: "bg-tint-blue text-tint-text-blue",
  purple: "bg-tint-purple text-tint-text-purple",
  pink: "bg-tint-pink text-tint-text-pink",
  red: "bg-tint-red text-tint-text-red",
  orange: "bg-tint-orange text-tint-text-orange",
  yellow: "bg-tint-yellow text-tint-text-yellow",
  green: "bg-tint-green text-tint-text-green",
}

// A slightly stronger tint on hover: 8 % of the tint text colour mixed into the tint, both tokens.
const EVENT_TINT_HOVER: Record<EventColor, string> = {
  indigo: "enabled:hover:bg-[color-mix(in_srgb,var(--tint-text-indigo)_8%,var(--tint-indigo))]",
  blue: "enabled:hover:bg-[color-mix(in_srgb,var(--tint-text-blue)_8%,var(--tint-blue))]",
  purple: "enabled:hover:bg-[color-mix(in_srgb,var(--tint-text-purple)_8%,var(--tint-purple))]",
  pink: "enabled:hover:bg-[color-mix(in_srgb,var(--tint-text-pink)_8%,var(--tint-pink))]",
  red: "enabled:hover:bg-[color-mix(in_srgb,var(--tint-text-red)_8%,var(--tint-red))]",
  orange: "enabled:hover:bg-[color-mix(in_srgb,var(--tint-text-orange)_8%,var(--tint-orange))]",
  yellow: "enabled:hover:bg-[color-mix(in_srgb,var(--tint-text-yellow)_8%,var(--tint-yellow))]",
  green: "enabled:hover:bg-[color-mix(in_srgb,var(--tint-text-green)_8%,var(--tint-green))]",
}

const EVENT_BAR: Record<EventColor, string> = {
  indigo: "bg-primary",
  blue: "bg-brand-secondary",
  purple: "bg-chart-3",
  pink: "bg-brand-tertiary",
  red: "bg-destructive",
  orange: "bg-brand-septenary",
  yellow: "bg-brand-quaternary",
  green: "bg-success",
}

// Forwards button props, so a chip can itself be a popover or menu trigger
// (render={<AgendaEventChip />}) instead of being wrapped in a second interactive element.
// The chip has no border, so the standard focus-ring shows as the 2 px ring only (offset 0). Hover mixes a little of
// the tint text colour into the tint; `disabled` dims once (opacity) and switches the hover off.
function AgendaEventChip({ color = "indigo", children, className, ...props }: React.ComponentProps<"button"> & { color?: EventColor }) {
  return (
    <button
      type="button"
      {...props}
      // After the spread: a Popover or Menu trigger passes its own data-slot, the chip keeps its own.
      data-slot="agenda-event-chip"
      className={cn(
        "flex min-h-6 w-full items-center gap-1 rounded-sm px-1 py-0.5 text-start text-[11px] leading-4 transition-colors duration-fast ease-entrance motion-reduce:transition-none outline-none focus-ring disabled:pointer-events-none disabled:opacity-40",
        EVENT_TINT[color],
        EVENT_TINT_HOVER[color],
        className
      )}
    >
      <span className={cn("h-3 w-[3px] shrink-0 rounded-full", EVENT_BAR[color])} />
      <span className="truncate">{children}</span>
    </button>
  )
}

/** @deprecated Use `AgendaEventChip` with the same props. */
const EventChip = AgendaEventChip

type AgendaEventProps = {
  start: React.ReactNode
  end?: React.ReactNode
  title: React.ReactNode
  meta?: React.ReactNode
  color?: EventColor
  guests?: Person[]
  onMenu?: () => void
  onClick?: () => void
  /** The title and the meta line wrap onto more lines instead of clamping (title, 2 lines) and truncating (meta). Default: false. */
  wrap?: boolean
  className?: string
}

function AgendaEvent({ start, end, title, meta, color = "purple", guests, onMenu, onClick, wrap = false, className }: AgendaEventProps) {
  const titleFit = wrap ? "text-pretty break-words" : "line-clamp-2 break-words"
  return (
    // onClick: the title becomes a real button stretched over the row (keyboard and pointer),
    // the menu sits above it, so no interactive element is nested in another.
    <div
      data-slot="agenda-event"
      className={cn("relative flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-5 py-3", onClick && "cursor-pointer hover:bg-muted/50 hover:[--surface:color-mix(in_oklab,var(--muted)_50%,var(--card))] has-[[data-stretch]:focus-visible]:focus-ring-on has-[[data-stretch]:focus-visible]:-outline-offset-2", className)}
    >
      <div className="flex w-16 shrink-0 flex-col">
        <span className="text-xs font-medium text-foreground">{start}</span>
        {end && <span className="text-[11px] text-text-tertiary">{end}</span>}
      </div>
      <span className={cn("h-8 w-[3px] shrink-0 rounded-full", EVENT_BAR[color])} />
      <div className="flex min-w-[7rem] flex-1 flex-col">
        {onClick ? (
          <button type="button" data-stretch onClick={onClick} className={cn(titleFit, "text-sm font-medium text-foreground text-start outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']")}>
            {title}
          </button>
        ) : (
          <span className={cn(titleFit, "text-sm font-medium text-foreground")}>{title}</span>
        )}
        {meta && <span data-slot="agenda-event-meta" className={cn(wrap ? "text-pretty break-words" : "truncate", "text-xs text-text-tertiary")}>{meta}</span>}
      </div>
      {/* the guests and the menu wrap below the title when the row is too narrow for all of it, so the title always keeps its room */}
      {((guests && guests.length > 0) || onMenu) && (
        <div className="ms-auto flex shrink-0 items-center gap-3">
          {guests && guests.length > 0 && <AvatarGroup people={guests} size="sm" />}
          {onMenu && (
            <IconButton variant="ghost" size="sm" aria-label="Event menu" className="relative z-10" onClick={(e) => { e.stopPropagation(); onMenu() }}>
              <Icon name="moreVertical" className="size-4" strokeWidth={1.5} />
            </IconButton>
          )}
        </div>
      )}
    </div>
  )
}

type PersonCellProps = {
  person: Person
  role?: React.ReactNode
  /** Size=lg adds a capacity bar: value 0–100 and a label like "32h". */
  capacity?: { value: number; label?: React.ReactNode }
  className?: string
}

/** @deprecated Use `AvatarLabel` (`name`, `subtext`, `capacity`). Renders the same row. */
function PersonCell({ person, role, capacity, className }: PersonCellProps) {
  return (
    <AvatarLabel
      name={person.name}
      initials={person.initials}
      src={person.src}
      color={person.color ?? "indigo"}
      subtext={role}
      capacity={capacity}
      className={cn(capacity && "px-4 py-3", className)}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Stars — deprecated alias of Rating readOnly size="sm"               */
/* ------------------------------------------------------------------ */

/** @deprecated Use `<Rating readOnly size="sm" value={…} />`. */
function Stars({ value, max = 5, className }: { value: number; max?: number; className?: string }) {
  // NaN, negative and over-max values are clamped to [0, max]; the label reads "4.5 out of 5 stars".
  const total = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 5
  const clamped = Number.isFinite(value) ? Math.max(0, Math.min(total, value)) : 0
  return <Rating readOnly size="sm" value={clamped} max={total} aria-label={`${Number(clamped.toFixed(1))} out of ${total} stars`} className={className} />
}

export { AvatarStack, EventChip, AgendaEventChip, AgendaEvent, PersonCell, Stars }
export type { Person, EventColor, AgendaEventProps, PersonCellProps }
