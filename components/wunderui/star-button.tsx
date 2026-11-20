"use client"

import * as React from "react"
import { IconButton } from "@/components/ui/icon-button"
import { Icon } from "@/components/ui/icon-provider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type StarButtonProps = Omit<React.ComponentProps<typeof IconButton>, "children" | "onClick" | "aria-pressed" | "aria-label"> & {
  /** Controlled state. Leave it out and the button keeps its own. */
  starred?: boolean
  defaultStarred?: boolean
  onStarredChange?: (starred: boolean) => void
  /** The accessible name; the pressed state says whether it is on. Default "Star". */
  label?: string
  /** Where the Tooltip opens. Default "top". */
  tooltipSide?: "top" | "bottom" | "left" | "right"
}

/**
 * A favourite toggle: an outline star, filled yellow when starred. The Tooltip reads "Star" or "Unstar".
 * A quiet (ghost) Icon Button, so it sits in a header or a row without a frame.
 */
function StarButton({ starred, defaultStarred = false, onStarredChange, label = "Star", tooltipSide = "top", variant = "ghost", size = "sm", className, ...props }: StarButtonProps) {
  const [inner, setInner] = React.useState(defaultStarred)
  const on = starred ?? inner
  const toggle = () => {
    if (starred === undefined) setInner(!on)
    onStarredChange?.(!on)
  }
  return (
    <Tooltip>
      <TooltipTrigger
        describe={false}
        render={
          <IconButton
            data-slot="star-button"
            data-starred={on ? "" : undefined}
            variant={variant}
            size={size}
            aria-label={label}
            aria-pressed={on}
            onClick={toggle}
            className={cn("transition-colors", on && "text-(--yellow-700) [&_svg]:fill-(--yellow-600)", className)}
            {...props}
          />
        }
      >
        <Icon name="star" aria-hidden />
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{on ? "Unstar" : "Star"}</TooltipContent>
    </Tooltip>
  )
}

export type { StarButtonProps }
export { StarButton }
