import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonGroupShape = "rounded" | "pill"
type ButtonGroupOrientation = "horizontal" | "vertical"

/** aria-orientation is only valid on these roles (WAI-ARIA 1.2); on the default
 *  role="group" it is an axe violation, so the stacking lives in data-orientation. */
const ORIENTED_ROLES = new Set(["radiogroup", "toolbar", "listbox", "menu", "menubar", "tablist", "tree", "treegrid"])

function ButtonGroup({
  shape = "rounded",
  orientation = "horizontal",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  shape?: ButtonGroupShape
  /** "horizontal" puts the buttons in a row, "vertical" stacks them with shared edges. */
  orientation?: ButtonGroupOrientation
}) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-shape={shape}
      data-orientation={orientation}
      aria-orientation={orientation === "vertical" && props.role && ORIENTED_ROLES.has(props.role) ? "vertical" : undefined}
      className={cn(
        "inline-flex data-[orientation=vertical]:flex-col",
        "[&>*]:rounded-none [&>*]:focus-visible:z-10",
        // The buttons share one edge: the next one overlaps the border of the previous by 1 px.
        "data-[orientation=horizontal]:[&>*:not(:first-child)]:-ml-px data-[orientation=vertical]:[&>*:not(:first-child)]:-mt-px",
        // Only the two outer ends are rounded: left and right in a row, top and bottom in a stack.
        "data-[orientation=horizontal]:data-[shape=rounded]:[&>*:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-l-md data-[orientation=horizontal]:data-[shape=rounded]:[&>*:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-r-md",
        "data-[orientation=horizontal]:data-[shape=pill]:[&>*:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-l-full data-[orientation=horizontal]:data-[shape=pill]:[&>*:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-r-full",
        "data-[orientation=vertical]:data-[shape=rounded]:[&>*:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-t-md data-[orientation=vertical]:data-[shape=rounded]:[&>*:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-b-md",
        "data-[orientation=vertical]:data-[shape=pill]:[&>*:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-t-xl data-[orientation=vertical]:data-[shape=pill]:[&>*:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup }
export type { ButtonGroupOrientation, ButtonGroupShape }
