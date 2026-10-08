"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { Plus, Minus } from "lucide-react"
import { cn } from "cn"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  className,
  children,
  ...props
}: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "group/collapsible-trigger flex w-full items-center justify-between gap-4 rounded-md text-left text-sm font-medium text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children}
      <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-card text-text-secondary">
        <Plus className="size-2.5 group-data-[panel-open]/collapsible-trigger:hidden" />
        <Minus className="hidden size-2.5 group-data-[panel-open]/collapsible-trigger:block" />
      </span>
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden text-sm text-text-secondary transition-[height] duration-base ease-entrance data-[ending-style]:h-0 data-[starting-style]:h-0",
        className
      )}
      {...props}
    >
      <div className="pt-3">{children}</div>
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
