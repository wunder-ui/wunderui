"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "cn"

function Separator({
  className,
  orientation = "horizontal",
  dashed = false,
  ...props
}: SeparatorPrimitive.Props & { dashed?: boolean }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        dashed
          ? "shrink-0 border-border data-horizontal:h-0 data-horizontal:w-full data-horizontal:border-t data-vertical:h-full data-vertical:w-0 data-vertical:self-stretch data-vertical:border-l border-dashed"
          : "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
