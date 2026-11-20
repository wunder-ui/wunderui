import type { ReactNode } from "react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage, type AvatarColor } from "@/components/ui/avatar"
import { Badge, type BadgeColor } from "@/components/ui/badge"
import { readableOn, readableOnCss } from "@/lib/readable-on"

type TimelineItem = {
  id: string
  title: ReactNode
  description?: ReactNode
  timestamp?: string
  icon?: ReactNode
  /** A person instead of the dot, for activity feeds: an Avatar, for example. */
  avatar?: ReactNode
  /** Fill of the dot. The glyph inside switches between white and a dark colour so it stays readable (WCAG 1.4.11). */
  color?: string
}

/** Dot fill plus a glyph colour with enough contrast on it. */
function dotStyle(color: string | undefined) {
  const tone = color ? readableOn(color) : "light"
  return {
    className: tone === "dark" ? "text-neutral-dark-content" : "text-white",
    // A fill that is not a literal colour (var(), color-mix) is resolved in CSS.
    style: {
      backgroundColor: color ?? "var(--primary)",
      ...(tone === null && color ? { color: readableOnCss(color) } : null),
    },
  }
}

function Timeline({
  items,
  orientation = "vertical",
  compact = false,
  className,
}: {
  items: TimelineItem[]
  /** "vertical" stacks the entries, "horizontal" lays them out in a row with the time above each dot. */
  orientation?: "vertical" | "horizontal"
  /** Smaller dots and text, for milestones and long lists. */
  compact?: boolean
  className?: string
}) {
  const dot = (item: TimelineItem) =>
    item.avatar ?? (
      <span
        data-slot="timeline-dot"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          compact ? "size-4 [&_svg]:size-2.5" : "size-6",
          dotStyle(item.color).className
        )}
        style={dotStyle(item.color).style}
      >
        {item.icon ?? <span className={cn("rounded-full bg-current", compact ? "size-1" : "size-1.5")} />}
      </span>
    )

  if (orientation === "horizontal") {
    return (
      <div data-slot="timeline" data-orientation="horizontal" className={cn("flex", className)}>
        {items.map((item, i) => (
          <div key={item.id} className="flex min-w-0 flex-1 flex-col gap-2">
            {item.timestamp && <span className="text-xs text-text-tertiary">{item.timestamp}</span>}
            <div className="flex items-center">
              {dot(item)}
              {i !== items.length - 1 && <span className="mx-2 h-px flex-1 bg-border" />}
            </div>
            <div className="flex flex-col gap-0.5 pr-3">
              <p className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>{item.title}</p>
              {item.description && <p className={cn("text-text-secondary", compact ? "text-xs" : "text-[13px]")}>{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div data-slot="timeline" className={cn("flex flex-col", className)}>
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            {dot(item)}
            {i !== items.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
          </div>
          <div className={cn("flex flex-col gap-0.5", i !== items.length - 1 && (compact ? "pb-4" : "pb-6"))}>
            <div className="flex items-center gap-2">
              <p className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>{item.title}</p>
              {item.timestamp && (
                <span className="text-xs text-text-tertiary">{item.timestamp}</span>
              )}
            </div>
            {item.description && (
              <p className={cn("text-text-secondary", compact ? "text-xs" : "text-[13px]")}>{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/** One entry of an activity feed or history: an avatar or a status dot, a title, a time, an object chip, a badge, a meta line, content below and a line to the next entry. Stack entries in a column; pass `last` on the final one. */
type TimelineEntryProps = {
  /** Actor avatar (Type=event). */
  avatar?: { src?: string; initials?: string; color?: AvatarColor }
  /** Status dot (Type=step): tone + icon. */
  status?: { tone?: "success" | "primary" | "warning" | "muted"; icon?: ReactNode }
  title: ReactNode
  time?: ReactNode
  /** Small object chip under the title (Type=event) — e.g. project name. */
  object?: { icon?: ReactNode; label: ReactNode }
  /** Trailing badge/label on the title row (Type=step). */
  badge?: ReactNode
  badgeColor?: BadgeColor
  meta?: ReactNode
  /** Extra content below the title (comment excerpt, reactions, attachments …). */
  children?: ReactNode
  /** The last entry of the list: no connector line below it. */
  last?: boolean
  className?: string
}

const ENTRY_TONE = {
  success: "bg-success text-success-foreground",
  primary: "bg-primary text-primary-foreground",
  warning: "bg-brand-quaternary text-foreground",
  muted: "bg-muted text-text-secondary",
}

function TimelineEntry({ avatar, status, title, time, object, badge, badgeColor = "grey", meta, children, last, className }: TimelineEntryProps) {
  const lineColor = status?.tone === "success" ? "bg-success" : "bg-border"
  return (
    <div data-slot="timeline-entry" className={cn("flex gap-4", className)}>
      <div className="flex w-10 shrink-0 flex-col items-center">
        {avatar ? (
          <Avatar size="lg" color={avatar.src ? undefined : avatar.color}>
            {avatar.src && <AvatarImage src={avatar.src} alt="" />}
            <AvatarFallback>{avatar.initials}</AvatarFallback>
          </Avatar>
        ) : (
          <span className={cn("grid size-8 place-items-center rounded-full [&_svg]:size-3.5", ENTRY_TONE[status?.tone ?? "muted"])}>
            {status?.icon ?? <Icon name="check" strokeWidth={1.5} />}
          </span>
        )}
        {!last && <span className={cn("mt-1 w-0.5 flex-1", lineColor)} />}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1", !last && "pb-6")}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-text-secondary [&_strong]:font-medium [&_strong]:text-foreground">{title}</p>
          {time && <span className="shrink-0 text-xs text-text-tertiary">{time}</span>}
          {badge && (
            <Badge color={badgeColor} badgeStyle="light" shape="pill" className="shrink-0">
              {badge}
            </Badge>
          )}
        </div>
        {object && (
          <span className="inline-flex w-fit items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-text-secondary [&_svg]:size-3">
            {object.icon ?? <Icon name="folder" strokeWidth={1.5} />}
            {object.label}
          </span>
        )}
        {meta && <p className="text-xs text-text-tertiary">{meta}</p>}
        {children}
      </div>
    </div>
  )
}

export { Timeline, TimelineEntry }
export type { TimelineItem, TimelineEntryProps }
