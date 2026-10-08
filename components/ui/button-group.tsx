import * as React from "react"
import { cn } from "cn"

type ButtonGroupShape = "rounded" | "pill"

function ButtonGroup({
  shape = "rounded",
  className,
  ...props
}: React.ComponentProps<"div"> & { shape?: ButtonGroupShape }) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-shape={shape}
      className={cn(
        "inline-flex",
        "[&>*]:rounded-none [&>*]:focus-visible:z-10",
        "[&>*:not(:first-child)]:-ml-px",
        "data-[shape=rounded]:[&>*:first-child]:rounded-l-md data-[shape=rounded]:[&>*:last-child]:rounded-r-md",
        "data-[shape=pill]:[&>*:first-child]:rounded-l-full data-[shape=pill]:[&>*:last-child]:rounded-r-full",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup }
