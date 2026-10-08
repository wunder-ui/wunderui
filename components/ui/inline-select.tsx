"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"
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
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50",
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

const InlineSelectValue = SelectPrimitive.Value
const InlineSelectContent = NativeSelectContent
const InlineSelectItem = NativeSelectItem

export { InlineSelect, InlineSelectTrigger, InlineSelectValue, InlineSelectContent, InlineSelectItem }
