"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"
import { collectSelectItems } from "@/lib/select-items"

/**
 * Opens like the DropdownMenu: below the trigger (never over it, unlike a
 * macOS select), out of its anchor on --duration-base, quickly out again.
 */
const POPUP_MOTION =
  "origin-(--transform-origin) transition-[opacity,scale,translate] duration-base ease-entrance motion-reduce:transition-none " +
  "data-starting-style:opacity-0 data-starting-style:scale-(--scale-enter) " +
  "data-ending-style:opacity-0 data-ending-style:scale-(--scale-enter) data-ending-style:duration-fast data-ending-style:ease-exit " +
  "data-[side=bottom]:data-starting-style:-translate-y-(--travel-sm) data-[side=top]:data-starting-style:translate-y-(--travel-sm)"

const TRIGGER_FIELD =
  "flex h-(--field-md) w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors duration-fast ease-entrance hover:border-text-muted focus-ring data-popup-open:border-primary data-disabled:pointer-events-none data-disabled:opacity-40 aria-invalid:border-error aria-invalid:focus-ring-error"
const TRIGGER_INLINE =
  "inline-flex items-center gap-2 rounded-md px-2 py-0.5 text-sm font-medium text-foreground outline-none transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-bg-subtle data-popup-open:bg-bg-page focus-ring data-disabled:pointer-events-none data-disabled:opacity-40"

function Select({ items, children, ...props }: SelectPrimitive.Root.Props<string>) {
  // Derive the value → label map from the items in `children` unless given,
  // so the trigger shows "Germany" for value "de" right away.
  const derived = React.useMemo(() => (items ? undefined : collectSelectItems(children)), [items, children])
  return (
    <SelectPrimitive.Root data-slot="select" items={items ?? (derived && derived.length > 0 ? derived : undefined)} {...props}>
      {children}
    </SelectPrimitive.Root>
  )
}

/** `field` is the full form field, `inline` a compact trigger that sits inside a sentence or a toolbar. */
function SelectTrigger({
  variant = "field",
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { variant?: "field" | "inline" }) {
  const inline = variant === "inline"
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-variant={inline ? "inline" : undefined}
      className={cn(inline ? TRIGGER_INLINE : TRIGGER_FIELD, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <Icon name="chevronDown" className={cn(inline ? "size-3.5" : "size-4", "text-text-tertiary")} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  // flex: an option with an icon shows the icon and the label side by side in the field; the placeholder is quieter than a value
  return <SelectPrimitive.Value data-slot="select-value" className={cn("flex min-w-0 items-center gap-2 data-placeholder:text-text-tertiary", className)} {...props} />
}

function SelectContent({ className, children, ...props }: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner className="isolate z-50 outline-none" side="bottom" align="start" sideOffset={4} alignItemWithTrigger={false}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "z-50 max-h-(--available-height) w-max min-w-[max(8rem,var(--anchor-width))] max-w-[max(var(--anchor-width),20rem)] overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            // Wide enough for the longest option, at least as wide as the trigger and at most 20 rem (owner 15 Nov 2026):
            // options with a description (a role picker) no longer wrap into a narrow column.
            // 2 px between two options (owner rule, 10 Nov 2026), so a highlighted or checked row never touches the next one.
            "[&_[role=option]+[role=option]]:mt-0.5",
            POPUP_MOTION,
            className
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex cursor-default items-center rounded-md py-1.5 pe-8 ps-2 text-sm outline-hidden select-none data-highlighted:bg-bg-page data-highlighted:text-foreground",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex items-center gap-2">{children}</SelectPrimitive.ItemText>
      <span className="absolute right-2 flex items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icon name="check" className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
