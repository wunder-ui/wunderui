"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { Plus, Minus } from "lucide-react"
import { cn } from "cn"

function NumberField({ ...props }: NumberFieldPrimitive.Root.Props) {
  return <NumberFieldPrimitive.Root data-slot="number-field" {...props} />
}

function NumberFieldGroup({ className, ...props }: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn("flex h-9 w-fit items-stretch overflow-hidden rounded-md border border-input bg-card has-[input:focus-visible]:border-ring", className)}
      {...props}
    />
  )
}

function NumberFieldDecrement({ className, ...props }: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      className={cn(
        "flex w-9 shrink-0 items-center justify-center border-r border-input text-text-secondary transition-colors duration-fast ease-entrance hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      <Minus className="size-3.5" />
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({ className, ...props }: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      className={cn(
        "flex w-9 shrink-0 items-center justify-center border-l border-input text-text-secondary transition-colors duration-fast ease-entrance hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      <Plus className="size-3.5" />
    </NumberFieldPrimitive.Increment>
  )
}

function NumberFieldInput({ className, ...props }: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn("w-16 shrink-0 bg-transparent text-center text-sm outline-none", className)}
      {...props}
    />
  )
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
}
