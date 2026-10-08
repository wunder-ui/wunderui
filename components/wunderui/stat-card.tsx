"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

const EMPTY_STATE_VARIANTS = {
  /** No frame — just centered content (Figma Style=default). */
  default: "",
  outline: "rounded-2xl border border-border",
  dashed: "rounded-2xl border border-dashed border-border",
  background: "rounded-2xl bg-muted/60",
} as const

function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "dashed",
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  /** Frame style — mirrors the Figma Empty State "Style" variants. */
  variant?: keyof typeof EMPTY_STATE_VARIANTS
  className?: string
}) {
  return (
    <div data-slot="empty-state" className={cn("flex flex-col items-center justify-center gap-3 p-10 text-center", EMPTY_STATE_VARIANTS[variant], className)}>
      {icon && (
        <div className="grid size-12 place-items-center rounded-full bg-muted text-text-secondary [&_svg]:size-6">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export { EmptyState }
