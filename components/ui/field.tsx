"use client"

import { Field as FieldPrimitive } from "@base-ui/react/field"
import { cn } from "cn"

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      className={cn("group/field flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-xs text-text-tertiary", className)}
      {...props}
    />
  )
}

function FieldError({ className, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn("text-xs text-text-error", className)}
      {...props}
    />
  )
}

function FieldControl({ ...props }: FieldPrimitive.Control.Props) {
  return <FieldPrimitive.Control data-slot="field-control" {...props} />
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldControl }
