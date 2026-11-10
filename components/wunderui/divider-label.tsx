import type { ReactNode } from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type DividerWithLabelSize = "default" | "sm"

function hasLabel(children: ReactNode): boolean {
  return (
    children !== null &&
    children !== undefined &&
    children !== false &&
    children !== true &&
    !(typeof children === "string" && children.trim() === "")
  )
}

function DividerWithLabel({
  children,
  className,
  size = "default",
  dashed = false,
  ...props
}: React.ComponentProps<"div"> & {
  children?: ReactNode
  className?: string
  size?: DividerWithLabelSize
  dashed?: boolean
}) {
  const hasLabelValue = hasLabel(children)

  return (
    <div
      data-slot="divider-with-label"
      data-size={size}
      className={cn(
        "flex w-full items-center",
        hasLabelValue ? (size === "default" ? "gap-3" : "gap-4") : "gap-0",
        className
      )}
      role={hasLabelValue ? undefined : "separator"}
      {...props}
    >
      <Separator className="flex-1" dashed={dashed} aria-hidden role="presentation" />
      {hasLabelValue && (
        <span
          className={size === "default" ? "text-sm font-medium text-text-tertiary" : "text-xs font-normal text-text-tertiary"}
        >
          {children}
        </span>
      )}
      <Separator className="flex-1" dashed={dashed} aria-hidden role="presentation" />
    </div>
  )
}

export { DividerWithLabel }
