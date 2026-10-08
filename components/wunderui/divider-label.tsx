import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

function DividerWithLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <Separator className="flex-1" />
      <span className="text-sm font-medium text-text-tertiary">{children}</span>
      <Separator className="flex-1" />
    </div>
  )
}

export { DividerWithLabel }
