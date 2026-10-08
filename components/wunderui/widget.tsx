import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

function Widget({
  title,
  description,
  action,
  footer,
  children,
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-lg border border-border bg-card p-5", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h3 className="text-base font-bold text-foreground">{title}</h3>}
            {description && <p className="text-xs text-text-secondary">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="flex-1">{children}</div>
      {footer && <div className="border-t border-border pt-3">{footer}</div>}
    </div>
  )
}

export { Widget }
