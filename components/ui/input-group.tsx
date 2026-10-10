import * as React from "react"
import { cn } from "cn"

/** Wraps an Input plus leading/trailing addons (icons, buttons) in one
 *  bordered field — the outer border/focus ring lives here, not on the
 *  inner <input>, so addons sit flush inside it. */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-sm transition-colors duration-fast ease-entrance has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus-visible]:border-ring has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-0 [&>input]:h-full [&>input]:flex-1 [&>input]:rounded-none [&>input]:border-none [&>input]:bg-transparent [&>input]:p-0 [&>input]:text-sm [&>input]:shadow-none [&>input]:outline-none [&>input]:focus-visible:ring-0 [&>input]:aria-invalid:ring-0 dark:[&>input]:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "flex shrink-0 items-center text-text-tertiary [&_svg]:pointer-events-none [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon }
