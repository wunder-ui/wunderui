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
        "grid grid-cols-6 gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg",
        className
      )}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect?.(emoji)}
          className="flex size-8 items-center justify-center rounded-md text-lg outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export { EmojiPicker }
