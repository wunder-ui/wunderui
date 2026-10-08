import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type AgendaItem = {
  id: string
  time: string
  title: string
  description?: string
  color?: string
}

function Agenda({
  items,
  className,
}: {
  items: AgendaItem[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-col rounded-lg border border-border bg-card", className)}>
      {items.map((item, i) => (
        <div
          key={item.id}
          className={cn(
            "flex gap-4 p-4",
            i !== items.length - 1 && "border-b border-border"
          )}
        >
          <span className="w-14 shrink-0 text-xs font-semibold text-text-tertiary">
            {item.time}
          </span>
          <span
            className="mt-1 h-full w-0.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color ?? "var(--primary)" }}
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            {item.description && (
              <p className="text-[13px] text-text-secondary">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export { Agenda }
export type { AgendaItem }
