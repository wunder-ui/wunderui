"use client"

import * as React from "react"
import { EllipsisVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage, type AvatarColor } from "@/components/ui/avatar"
import { IconButton } from "@/components/ui/icon-button"

/* ------------------------------------------------------------------ */
/* Shared: tiny initials avatar stack used by kanban/agenda/task rows  */
/* ------------------------------------------------------------------ */

type Person = { name: string; initials?: string; src?: string; color?: AvatarColor }

const initialsOf = (p: Person) => p.initials ?? p.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()

function AvatarStack({ people, size = "sm", max = 3, className }: { people: Person[]; size?: "sm" | "xs" | "default"; max?: number; className?: string }) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <div data-slot="avatar-stack" className={cn("flex items-center -space-x-1", className)}>
      {shown.map((p) => (
        <Avatar key={p.name} size={size} color={p.src ? undefined : (p.color ?? "indigo")} className="ring-2 ring-card" title={p.name}>
          {p.src && <AvatarImage src={p.src} alt={p.name} />}
          <AvatarFallback className="text-[10px]">{initialsOf(p)}</AvatarFallback>
        </Avatar>
      ))}
      {rest > 0 && (
        <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-medium text-text-secondary ring-2 ring-card">
          +{rest}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Event Chip + Agenda Event (calendar)                                */
/* Figma: Event Chip (722:112), Agenda Event (722:129)                 */
/* ------------------------------------------------------------------ */

type EventColor = "indigo" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green"

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

type AgendaEventProps = {
  start: React.ReactNode
  end?: React.ReactNode
  title: React.ReactNode
  meta?: React.ReactNode
  color?: EventColor
  guests?: Person[]
  onMenu?: () => void
  onClick?: () => void
  className?: string
}

function AgendaEvent({ start, end, title, meta, color = "purple", guests, onMenu, onClick, className }: AgendaEventProps) {
  return (
    // onClick: the title becomes a real button stretched over the row (keyboard and pointer),
    // the menu sits above it, so no interactive element is nested in another.
    <div
      data-slot="agenda-event"
      className={cn("relative flex items-center gap-3 border-b border-border px-5 py-3", onClick && "cursor-pointer hover:bg-muted/40 has-[[data-stretch]:focus-visible]:ring-1 has-[[data-stretch]:focus-visible]:ring-ring has-[[data-stretch]:focus-visible]:ring-inset", className)}
    >
      <div className="flex w-16 shrink-0 flex-col">
        <span className="text-xs font-medium text-foreground">{start}</span>
        {end && <span className="text-[11px] text-text-tertiary">{end}</span>}
      </div>
      <span className={cn("h-8 w-[3px] shrink-0 rounded-full", EVENT_BAR[color])} />
      <div className="flex min-w-0 flex-1 flex-col">
        {onClick ? (
          <button type="button" data-stretch onClick={onClick} className="truncate text-sm font-medium text-foreground text-left outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']">
            {title}
          </button>
        ) : (
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
        )}
        {meta && <span className="truncate text-xs text-text-tertiary">{meta}</span>}
      </div>
      {guests && guests.length > 0 && <AvatarStack people={guests} size="sm" />}
      {onMenu && (
        <IconButton variant="ghost" size="sm" aria-label="Event menu" className="relative z-10" onClick={(e) => { e.stopPropagation(); onMenu() }}>
          <EllipsisVertical className="size-4" />
        </IconButton>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Person Cell — avatar + name + role (+ capacity bar)                 */
/* Figma: ❖ Avatar / Person Cell (722:177)                             */
/* ------------------------------------------------------------------ */

type PersonCellProps = {
  person: Person
  role?: React.ReactNode
  /** Size=lg adds a capacity bar: value 0–100 and a label like "32h". */
  capacity?: { value: number; label?: React.ReactNode }
  className?: string
}

export { AvatarStack, AgendaEvent }
export type { Person, EventColor, AgendaEventProps, PersonCellProps }
