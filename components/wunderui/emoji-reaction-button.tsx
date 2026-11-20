"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type EmojiReactionButtonProps = Omit<React.ComponentProps<"button">, "children" | "onToggle"> & {
  /** The reaction as an emoji. Leave it out and pass `icon` where the product shows no emoji. */
  emoji?: string
  /** The reaction as an icon (14 px, e.g. a thumbs up), in place of `emoji`. */
  icon?: React.ReactNode
  /**
   * What the reaction means ("Agree", "Thanks"): the accessible name is "<label>: <count>". Needed with an `icon`,
   * which has no text of its own; `aria-label` replaces it entirely.
   */
  label?: string
  count: number
  active?: boolean
  onToggle?: () => void
  className?: string
}

function EmojiReactionButton({ emoji, icon, label, count, active, onToggle, onClick, className, ...props }: EmojiReactionButtonProps) {
  return (
    <button
      type="button"
      data-slot="emoji-reaction-button"
      aria-pressed={!!active}
      aria-label={label ? `${label}: ${count}` : undefined}
      {...props}
      onClick={(e) => {
        onClick?.(e)
        onToggle?.()
      }}
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium tabular-nums transition-colors duration-fast ease-entrance outline-none focus-ring [&_svg]:size-3.5 [&_svg]:shrink-0",
        active
          ? "border-tint-text-indigo bg-tint-indigo text-tint-text-indigo"
          : "border-border text-text-secondary hover:bg-bg-page active:bg-bg-subtle",
        className
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="flex items-center">
          {icon}
        </span>
      ) : (
        emoji && <span aria-hidden={label ? true : undefined}>{emoji}</span>
      )}
      <span className="optical-center">{count}</span>
    </button>
  )
}

export { EmojiReactionButton }
export type { EmojiReactionButtonProps }
