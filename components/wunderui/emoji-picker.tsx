"use client"

import { cn } from "@/lib/utils"

const DEFAULT_EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🔥", "🎉", "❤️", "😢", "😮", "👏", "🚀"]

function EmojiPicker({
  emojis = DEFAULT_EMOJIS,
  onSelect,
  className,
}: {
  emojis?: string[]
  onSelect?: (emoji: string) => void
  className?: string
}) {
  return (
    // Each button's name is the emoji itself; screen readers announce its CLDR name ("grinning face").
    <div
      role="group"
      aria-label="Emoji"
      className={cn(
        // 16 px corners around 8 px buttons with 8 px of air keep the corners concentric.
        "grid grid-cols-6 gap-1 rounded-xl border border-border bg-popover p-2 shadow-lg",
        className
      )}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect?.(emoji)}
          className="flex size-8 items-center justify-center rounded-md text-lg outline-none hover:bg-bg-page active:bg-bg-subtle focus-ring"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export { EmojiPicker }
