import * as React from "react"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleDashed,
  CircleDot,
  Square,
  SquareCheck,
  TriangleAlert,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

/** Mark rendered before a Chip's label. */
type ChipMark = "none" | "check" | "radio" | "checkbox" | "suggest"

/** State of an input token. */
type TokenState = "default" | "focused" | "invalid" | "removing"

function ariaFor({
  role,
  selected,
  trailing,
  open,
  onClick,
  mark,
}: {
  role?: "radio" | "checkbox"
  selected: boolean
  trailing: "none" | "chevron" | "remove"
  open: boolean
  onClick?: () => void
  mark: ChipMark
}): React.ButtonHTMLAttributes<HTMLButtonElement> {
  if (role) {
    return { role, "aria-checked": selected }
  }
  if (trailing === "chevron") {
    return { "aria-haspopup": "listbox", "aria-expanded": open }
  }
  if (trailing !== "remove" && onClick && (mark === "check" || mark === "suggest")) {
    return { "aria-pressed": selected }
  }
  return {}
}

/** Badge variant Chip: filter chip. */
function Chip({
  selected = false,
  mark = "none",
  trailing = "none",
  open = false,
  role,
  onClick,
  onRemove,
  removeLabel,
  className,
  children,
}: {
  selected?: boolean
  mark?: ChipMark
  trailing?: "none" | "chevron" | "remove"
  open?: boolean
  role?: "radio" | "checkbox"
  onClick?: () => void
  onRemove?: () => void
  removeLabel?: string
  className?: string
  children: React.ReactNode
}) {
  const applied = selected || open

  return (
    <span
      data-slot="chip"
      data-selected={selected ? "" : undefined}
      className={cn(
        "inline-flex h-7 items-center rounded-full border text-sm font-medium transition-colors duration-fast ease-entrance has-[[data-slot=chip-main]:focus-visible]:focus-ring-on",
        applied
          ? "border-tint-text-indigo bg-tint-indigo text-tint-text-indigo"
          : "border-border-control bg-card text-foreground hover:bg-bg-page active:bg-bg-subtle",
        className,
      )}
    >
      <button
        type="button"
        data-slot="chip-main"
        onClick={onClick}
        className={cn(
          "inline-flex h-full cursor-pointer items-center gap-2 rounded-full pl-2.5 outline-none",
          trailing === "remove" ? "pr-1" : "pr-2.5",
        )}
        {...ariaFor({ role, selected, trailing, open, onClick, mark })}
      >
        {mark === "check" && selected && (
          <Check aria-hidden className="size-4 shrink-0" />
        )}
        {mark === "radio" &&
          (selected ? (
            <CircleDot aria-hidden className="size-4 shrink-0" />
          ) : (
            <Circle aria-hidden className="size-4 shrink-0" />
          ))}
        {mark === "checkbox" &&
          (selected ? (
            <SquareCheck aria-hidden className="size-4 shrink-0" />
          ) : (
            <Square aria-hidden className="size-4 shrink-0" />
          ))}
        {mark === "suggest" && (
          <CircleDashed aria-hidden className="size-4 shrink-0" />
        )}
        {children}
        {trailing === "chevron" &&
          (open ? (
            <ChevronUp aria-hidden className="size-4 shrink-0" />
          ) : (
            <ChevronDown aria-hidden className="size-4 shrink-0" />
          ))}
      </button>
      {trailing === "remove" && (
        <button
          type="button"
          aria-label={removeLabel ?? "Remove"}
          onClick={onRemove}
          className="mr-1 inline-flex size-5 cursor-pointer items-center justify-center rounded-full outline-none transition-colors duration-fast ease-entrance hover:bg-current/15 focus-ring"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      )}
    </span>
  )
}

/** Badge variant EntityChip: entity chip. */
function EntityChip({
  leading,
  children,
  onRemove,
  removeLabel,
}: {
  leading: React.ReactNode
  children: React.ReactNode
  onRemove?: () => void
  removeLabel?: string
}) {
  return (
    <span
      data-slot="entity-chip"
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full bg-muted pl-0.5 text-sm font-medium text-foreground",
        onRemove ? "pr-1" : "pr-2.5",
      )}
    >
      {leading}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel ?? "Remove"}
          onClick={onRemove}
          className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full outline-none transition-colors duration-fast ease-entrance hover:bg-current/15 focus-ring"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      )}
    </span>
  )
}

/** Badge variant TokenChip: input token. */
function TokenChip({
  children,
  state = "default",
  onRemove,
  removeLabel,
}: {
  children: React.ReactNode
  state?: TokenState
  onRemove?: () => void
  removeLabel?: string
}) {
  const stateClasses =
    state === "invalid"
      ? "border-tint-text-red bg-tint-red text-tint-text-red"
      : state === "focused"
        ? "border-primary bg-muted text-foreground outline outline-2 outline-indigo-300"
        : "border-transparent bg-muted text-foreground"

  return (
    <span
      data-slot="token-chip"
      data-state={state}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-md border pl-2 text-xs font-medium",
        onRemove ? "pr-0.5" : "pr-2",
        stateClasses,
      )}
    >
      {state === "invalid" && (
        <TriangleAlert aria-hidden className="size-3 shrink-0" />
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel ?? "Remove"}
          onClick={onRemove}
          className={cn(
            "inline-flex size-5 cursor-pointer items-center justify-center rounded-md outline-none transition-colors duration-fast ease-entrance hover:bg-current/15 focus-ring",
            state === "removing" && "bg-current/15",
          )}
        >
          <X aria-hidden className="size-3" />
        </button>
      )}
    </span>
  )
}

export type { ChipMark, TokenState }
export { Chip, EntityChip, TokenChip }
