"use client"

import * as React from "react"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import { Toggle } from "@base-ui/react/toggle"
import { cn } from "cn"

function CheckboxButtonGroup<Value extends string>({
  className,
  ...props
}: ToggleGroup.Props<Value>) {
  return (
    <ToggleGroup
      data-slot="checkbox-button-group"
      multiple
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  )
}

function RadioButtonGroup<Value extends string>({
  className,
  ...props
}: Omit<ToggleGroup.Props<Value>, "multiple">) {
  return (
    <ToggleGroup
      data-slot="radio-button-group"
      multiple={false}
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  )
}

function ToggleButton({
  className,
  ...props
}: React.ComponentProps<typeof Toggle>) {
  return (
    <Toggle
      data-slot="toggle-button"
      className={cn(
        "rounded-md border border-border-control px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors data-pressed:border-primary data-pressed:bg-tint-indigo data-pressed:text-tint-text-indigo hover:bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { CheckboxButtonGroup, RadioButtonGroup, ToggleButton }
