"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

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
  // Same technique as the Accordion panel: the row animates between 0fr and
  // 1fr, the clip sits on its child and the padding one level further in, so
  // the padding shrinks away with the content. A padding on the panel itself
  // (or a measured height) would stay behind until the panel is hidden, and
  // the row would jump at the very end of closing.
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "grid grid-rows-[1fr] text-sm text-text-secondary transition-[grid-template-rows] duration-base ease-entrance data-[ending-style]:grid-rows-[0fr] data-[starting-style]:grid-rows-[0fr]",
        className
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="pt-3">{children}</div>
      </div>
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
