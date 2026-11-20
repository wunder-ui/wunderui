import * as React from "react"
import { Icon } from "@/components/ui/icon-provider"
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

function FilterChip({
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
          "inline-flex h-full cursor-pointer items-center gap-2 rounded-full ps-2.5 outline-none",
          trailing === "remove" ? "pe-1" : "pe-2.5",
        )}
        {...ariaFor({ role, selected, trailing, open, onClick, mark })}
      >
        {mark === "check" && selected && (
          <Icon name="check" aria-hidden className="size-4 shrink-0" />
        )}
        {mark === "radio" &&
          (selected ? (
            <Icon name="radioOn" aria-hidden className="size-4 shrink-0" />
          ) : (
            <Icon name="radioOff" aria-hidden className="size-4 shrink-0" />
          ))}
        {mark === "checkbox" &&
          (selected ? (
            <Icon name="checkboxOn" aria-hidden className="size-4 shrink-0" />
          ) : (
            <Icon name="checkboxOff" aria-hidden className="size-4 shrink-0" />
          ))}
        {mark === "suggest" && (
          <Icon name="circleDashed" aria-hidden className="size-4 shrink-0" />
        )}
        {children}
        {trailing === "chevron" &&
          (open ? (
            <Icon name="chevronUp" aria-hidden className="size-4 shrink-0" />
          ) : (
            <Icon name="chevronDown" aria-hidden className="size-4 shrink-0" />
          ))}
      </button>
      {trailing === "remove" && (
        <button
          type="button"
          aria-label={removeLabel ?? "Remove"}
          onClick={onRemove}
          className="me-1 inline-flex size-5 cursor-pointer items-center justify-center rounded-full outline-none transition-colors duration-fast ease-entrance hover:bg-current/15 focus-ring"
        >
          <Icon name="close" aria-hidden className="size-3.5" />
        </button>
      )}
    </span>
  )
}

function EntityChipImpl({
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
        "inline-flex h-7 items-center gap-2 rounded-full bg-muted ps-0.5 text-sm font-medium text-foreground",
        onRemove ? "pe-1" : "pe-2.5",
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
          <Icon name="close" aria-hidden className="size-3.5" />
        </button>
      )}
    </span>
  )
}

function TokenChipImpl({
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
        ? "border-primary bg-muted text-foreground outline outline-2 outline-(color:--indigo-300)"
        : "border-transparent bg-muted text-foreground"

  return (
    <span
      data-slot="token-chip"
      data-state={state}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-md border ps-2 text-xs font-medium",
        onRemove ? "pe-0.5" : "pe-2",
        stateClasses,
      )}
    >
      {state === "invalid" && (
        <Icon name="warning" aria-hidden className="size-3 shrink-0" />
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
          <Icon name="close" aria-hidden className="size-3" />
        </button>
      )}
    </span>
  )
}

type FilterChipProps = {
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
}

type EntityChipProps = {
  leading: React.ReactNode
  children: React.ReactNode
  onRemove?: () => void
  removeLabel?: string
}

type TokenChipProps = {
  children: React.ReactNode
  state?: TokenState
  onRemove?: () => void
  removeLabel?: string
}

type ChipProps =
  | ({ variant?: "filter" } & FilterChipProps)
  | ({ variant: "entity" } & EntityChipProps)
  | ({ variant: "token" } & TokenChipProps)

/**
 * Badge chip. `variant="filter"` (default) is a filter chip, `"entity"` a rounded
 * chip with an avatar or icon in `leading` and a name, `"token"` an input token
 * with a `state` (default, focused, invalid, removing).
 */
function Chip(props: ChipProps) {
  if (props.variant === "entity") {
    const { variant: _variant, ...rest } = props
    return <EntityChipImpl {...rest} />
  }
  if (props.variant === "token") {
    const { variant: _variant, ...rest } = props
    return <TokenChipImpl {...rest} />
  }
  const { variant: _variant, ...rest } = props
  return <FilterChip {...rest} />
}

/** @deprecated Use `<Chip variant="entity">`. Renders the same chip. */
function EntityChip(props: EntityChipProps) {
  return <Chip variant="entity" {...props} />
}

/** @deprecated Use `<Chip variant="token">`. Renders the same chip. */
function TokenChip(props: TokenChipProps) {
  return <Chip variant="token" {...props} />
}

export type { ChipMark, TokenState, ChipProps }
export { Chip, EntityChip, TokenChip }
