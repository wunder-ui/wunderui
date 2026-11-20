"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Figma Button / Toggle and Icon Toggle / Selected: Off is a white control with the control border, hover bg-page,
// pressed bg-subtle; On is the indigo tint (tint fill, indigo-300 border, tint-text label and icon) and stays tinted
// on hover; focus is the shared 2 px focus-ring (owner rule 31 Oct 2026).
// Tone neutral keeps this default behavior; tone indigo applies the Figma Indigo tone, tinted at rest and solid brand fill when pressed.
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border border-border-control bg-card text-sm font-medium text-text-primary transition-colors duration-fast ease-entrance outline-none select-none hover:bg-bg-page active:bg-bg-subtle focus-ring disabled:pointer-events-none disabled:opacity-40 data-pressed:border-(color:--indigo-300) data-pressed:bg-tint-indigo data-pressed:text-tint-text-indigo data-pressed:active:bg-bg-subtle data-pressed:hover:bg-tint-indigo [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 px-2",
        default: "h-9 px-2.5",
        lg: "h-10 px-3",
        xl: "h-11 px-3.5 text-base",
        "2xl": "h-12 px-4 text-lg",
      },
      shape: {
        rounded: "",
        pill: "rounded-full",
      },
      tone: {
        neutral: "",
        indigo:
          "border-(color:--indigo-300) bg-tint-indigo text-tint-text-indigo hover:bg-tint-indigo active:bg-tint-indigo data-pressed:border-brand-primary data-pressed:bg-brand-primary data-pressed:text-brand-primary-foreground data-pressed:hover:border-(color:--brand-700) data-pressed:hover:bg-(--brand-700) data-pressed:active:border-(color:--brand-800) data-pressed:active:bg-(--brand-800)",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "rounded",
      tone: "neutral",
    },
  }
)

function Toggle({
  className,
  size,
  shape,
  tone,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ size, shape, tone }), className)}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
