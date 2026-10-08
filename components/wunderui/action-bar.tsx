import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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
        "flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-lg",
        className
      )}
    >
      {label && (
        <>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Separator orientation="vertical" className="h-5" />
        </>
      )}
      <div className="flex items-center gap-1">{children}</div>
    </div>
  )
}

export { ActionBar }
