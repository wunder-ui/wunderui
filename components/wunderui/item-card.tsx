import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

function ItemCard({
  icon,
  title,
  description,
  meta,
  action,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-card p-3",
        className
      )}
    >
      {icon && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-text-secondary [&_svg]:size-5">
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="truncate text-[13px] text-text-secondary">{description}</p>
        )}
      </div>
      {meta && <div className="shrink-0 text-xs text-text-tertiary">{meta}</div>}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

function ItemCardGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-border bg-card p-2", className)}>
      {children}
    </div>
  )
}

export { ItemCard, ItemCardGroup }
