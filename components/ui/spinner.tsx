import * as React from "react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin text-muted-foreground motion-reduce:animate-none", className)}
      {...props}
      name="spinner"
    />
  )
}

export { Spinner }
