"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { cn } from "cn"

function NumberStepper({
  value,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  format = (n) => String(n),
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Formats the displayed value, e.g. `(n) => `${n}%`` */
  format?: (value: number) => React.ReactNode
  className?: string
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <div role="group" className={cn("inline-flex items-center gap-2", className)} {...props}>
      <IconButton
        variant="plain"
        size="sm"
        disabled={value <= min}
        onClick={() => onValueChange(clamp(value - step))}
        aria-label="Decrease"
      >
        <Minus />
      </IconButton>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-foreground" aria-live="polite">
        {format(value)}
      </span>
      <IconButton
        variant="plain"
        size="sm"
        disabled={value >= max}
        onClick={() => onValueChange(clamp(value + step))}
        aria-label="Increase"
      >
        <Plus />
      </IconButton>
    </div>
  )
}

export { NumberStepper }
