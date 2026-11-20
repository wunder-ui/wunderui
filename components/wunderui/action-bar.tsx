import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/** The buttons inside have an 8 px radius and sit 8 px from the edge, so the bar is 16 px (inner radius + distance). */
function ActionBar({
  label,
  children,
  className,
}: {
  label?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card py-2 pe-2 ps-4 shadow-lg",
        className
      )}
    >
      {label && (
        <>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Separator orientation="vertical" className="h-5" />
        </>
      )}
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">{children}</div>
    </div>
  )
}

export { ActionBar }
