import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type TimelineItem = {
  id: string
  title: ReactNode
  description?: ReactNode
  timestamp?: string
  icon?: ReactNode
  color?: string
}

function Timeline({
  items,
  className,
}: {
  items: TimelineItem[]
  className?: string
}) {
  return (
    <div data-slot="timeline" className={cn("flex flex-col", className)}>
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: item.color ?? "var(--primary)" }}
            >
              {item.icon ?? <span className="size-1.5 rounded-full bg-white" />}
            </span>
            {i !== items.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
          </div>
          <div className={cn("flex flex-col gap-0.5", i !== items.length - 1 && "pb-6")}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              {item.timestamp && (
                <span className="text-xs text-text-tertiary">{item.timestamp}</span>
              )}
            </div>
            {item.description && (
              <p className="text-[13px] text-text-secondary">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export { Timeline }
export type { TimelineItem }
