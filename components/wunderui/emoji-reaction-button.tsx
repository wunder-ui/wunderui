"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function EmojiReactionButton({
  emoji,
  count,
  active,
  onToggle,
  className,
}: {
  emoji: string
  count: number
  active?: boolean
  onToggle?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-colors duration-fast ease-entrance",
        active
          ? "border-primary bg-tint-indigo text-tint-text-indigo"
          : "border-border text-text-secondary hover:bg-muted",
        className
      )}
    >
      <span>{emoji}</span>
      {count}
    </button>
  )
}

export { EmojiReactionButton }
