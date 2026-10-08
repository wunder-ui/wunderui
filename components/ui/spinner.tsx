import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "cn"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Spinner }
