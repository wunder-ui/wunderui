"use client"

import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset"
import { cn } from "@/lib/utils"

function Fieldset({ className, ...props }: FieldsetPrimitive.Root.Props) {
  return (
    <FieldsetPrimitive.Root
      data-slot="fieldset"
      className={cn("flex flex-col gap-5 rounded-lg border border-border bg-card p-4 data-invalid:border-destructive/60 data-invalid:bg-tint-red data-disabled:data-invalid:bg-card", className)}
      {...props}
    />
  )
}

function FieldsetLegend({ className, ...props }: FieldsetPrimitive.Legend.Props) {
  return (
    <FieldsetPrimitive.Legend
      data-slot="fieldset-legend"
      className={cn("p-0 text-sm font-semibold text-foreground data-disabled:opacity-40", className)}
      {...props}
    />
  )
}

export { Fieldset, FieldsetLegend }
