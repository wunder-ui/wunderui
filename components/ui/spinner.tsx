import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin text-muted-foreground motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Spinner }
