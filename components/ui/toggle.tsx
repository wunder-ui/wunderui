"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent text-sm font-medium text-text-secondary transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring disabled:pointer-events-none disabled:opacity-40 data-[pressed]:bg-accent data-[pressed]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 px-2",
        default: "h-9 px-2.5",
        lg: "h-10 px-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Toggle({
  className,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ size }), className)}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
