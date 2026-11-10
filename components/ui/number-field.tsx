"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

function NumberField({ ...props }: NumberFieldPrimitive.Root.Props) {
  return <NumberFieldPrimitive.Root data-slot="number-field" {...props} />
}

function NumberFieldGroup({ className, ...props }: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn("flex h-9 w-fit items-stretch overflow-hidden rounded-md border border-input bg-card transition-colors duration-fast ease-entrance hover:border-text-muted focus-ring-within has-[button:focus-visible]:focus-ring-on has-disabled:opacity-40 has-[input[aria-invalid=true]]:border-error has-[input[aria-invalid=true]]:focus-ring-within-error", className)}
      {...props}
    />
  )
}

function NumberFieldDecrement({ className, ...props }: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      className={cn(
        "flex w-9 shrink-0 items-center justify-center outline-none border-r border-input text-text-secondary transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-bg-subtle disabled:pointer-events-none disabled:opacity-40",
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
        "flex w-9 shrink-0 items-center justify-center outline-none border-l border-input text-text-secondary transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-bg-subtle disabled:pointer-events-none disabled:opacity-40",
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
