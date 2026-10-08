"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "cn"
import { collectSelectItems } from "@/lib/select-items"

function NativeSelect({ items, children, ...props }: SelectPrimitive.Root.Props<string>) {
  // Derive the value → label map from the items in `children` unless given,
  // so the trigger shows "Germany" for value "de" right away.
  const derived = React.useMemo(() => (items ? undefined : collectSelectItems(children)), [items, children])
  return (
    <SelectPrimitive.Root data-slot="native-select" items={items ?? (derived && derived.length > 0 ? derived : undefined)} {...props}>
      {children}
    </SelectPrimitive.Root>
  )
}

function NativeSelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="native-select-trigger"
      className={cn(
        "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="size-4 text-text-tertiary" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function NativeSelectValue({ ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="native-select-value" {...props} />
}

function NativeSelectContent({ className, children, ...props }: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner className="isolate z-50 outline-none" sideOffset={4}>
        <SelectPrimitive.Popup
          data-slot="native-select-content"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
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

function NativeSelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="native-select-item"
      className={cn(
        "relative flex cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-2 flex items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
}

export {
  NativeSelect,
  NativeSelectTrigger,
  NativeSelectValue,
  NativeSelectContent,
  NativeSelectItem,
}
