import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
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

export { Timeline }
export type { TimelineItem }
