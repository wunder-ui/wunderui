"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Press feedback: the element scales down while held. On its own it renders a
 * button around `children`; with `asChild` it lends the effect to its single
 * child instead — use that to wrap a Button, so there is never a button inside
 * a button.
 */
function PressableFeedback({
  children,
  onPress,
  className,
  asChild = false,
}: {
  children: React.ReactNode
  onPress?: () => void
  className?: string
  /** Apply the press effect to the child element instead of wrapping it. */
  asChild?: boolean
}) {
  const [pressed, setPressed] = React.useState(false)
  const classes = cn(
    "transition-transform duration-fast ease-move active:scale-95",
    pressed && "scale-95 opacity-90",
    className
  )
  const handlers = {
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string; onClick?: (event: React.MouseEvent) => void }>
    return React.cloneElement(child, {
      ...handlers,
      className: cn(child.props.className, classes),
      onClick: (event: React.MouseEvent) => {
        child.props.onClick?.(event)
        onPress?.()
      },
    })
  }

  return (
    <button type="button" onClick={onPress} {...handlers} className={classes}>
      {children}
    </button>
  )
}

export { PressableFeedback }
