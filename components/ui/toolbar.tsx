"use client"

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import { cn } from "@/lib/utils"

function Toolbar({ className, ...props }: ToolbarPrimitive.Root.Props) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={cn("flex items-center gap-1 rounded-lg border border-border bg-card p-1", className)}
      {...props}
    />
  )
}

function ToolbarGroup({ className, ...props }: ToolbarPrimitive.Group.Props) {
  return (
    <ToolbarPrimitive.Group
      data-slot="toolbar-group"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

function ToolbarButton({ className, ...props }: ToolbarPrimitive.Button.Props) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      className={cn(
        "flex size-8 items-center justify-center rounded-md border border-transparent text-text-secondary transition-colors duration-fast ease-entrance outline-none hover:bg-bg-page hover:text-foreground active:bg-bg-subtle focus-ring disabled:pointer-events-none disabled:opacity-40 data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[pressed]:border-(color:--indigo-300) data-[pressed]:bg-tint-indigo data-[pressed]:text-tint-text-indigo data-[pressed]:hover:bg-tint-indigo data-[pressed]:active:bg-bg-subtle [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ToolbarSeparator({ className, ...props }: ToolbarPrimitive.Separator.Props) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn("mx-1 h-5 w-px bg-border", className)}
      {...props}
    />
  )
}

function ToolbarLink({ className, ...props }: ToolbarPrimitive.Link.Props) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn("rounded-sm text-sm text-text-secondary outline-none hover:text-foreground focus-ring", className)}
      {...props}
    />
  )
}

export { Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator, ToolbarLink }
