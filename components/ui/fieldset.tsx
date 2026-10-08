"use client"

import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset"
import { cn } from "cn"

function Fieldset({ className, ...props }: FieldsetPrimitive.Root.Props) {
  return (
    <FieldsetPrimitive.Root
      data-slot="fieldset"
      className={cn("flex flex-col gap-4 rounded-lg border border-border p-4", className)}
      {...props}
    />
  )
}

function FieldsetLegend({ className, ...props }: FieldsetPrimitive.Legend.Props) {
  return (
    <FieldsetPrimitive.Legend
      data-slot="fieldset-legend"
      className={cn("px-1 text-sm font-semibold text-foreground", className)}
      {...props}
    />
  )
}

export { Fieldset, FieldsetLegend }
