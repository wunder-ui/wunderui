"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { collectSelectItems } from "@/lib/select-items"
import {
  NativeSelectContent,
  NativeSelectItem,
} from "@/components/ui/native-select"

function InlineSelect({ items, children, ...props }: SelectPrimitive.Root.Props<string>) {
  // Derive the value → label map from the items in `children` unless given,
  // so the trigger shows "Germany" for value "de" right away.
  const derived = React.useMemo(() => (items ? undefined : collectSelectItems(children)), [items, children])
  return (
    <SelectPrimitive.Root data-slot="inline-select" items={items ?? (derived && derived.length > 0 ? derived : undefined)} {...props}>
      {children}
    </SelectPrimitive.Root>
  )
}

function InlineSelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="inline-select-trigger"
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-2 py-0.5 text-sm font-medium text-foreground outline-none transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-bg-subtle data-popup-open:bg-bg-page focus-ring data-disabled:pointer-events-none data-disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="size-3.5 text-text-tertiary" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function InlineSelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  // flex: an option with an icon shows the icon and the label side by side in the trigger; the placeholder is quieter than a value
  return <SelectPrimitive.Value data-slot="inline-select-value" className={cn("flex min-w-0 items-center gap-2 data-placeholder:text-text-tertiary", className)} {...props} />
}
const InlineSelectContent = NativeSelectContent
const InlineSelectItem = NativeSelectItem

export { InlineSelect, InlineSelectTrigger, InlineSelectValue, InlineSelectContent, InlineSelectItem }
