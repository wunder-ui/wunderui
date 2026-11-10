"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "@/lib/utils"

// Invalid lives on the group (Figma Radio / Invalid): aria-invalid on the radiogroup element, and
// every item reads it through group-aria-invalid/radio-group — the items themselves carry no
// aria-invalid, so the error is announced once for the group and not once per radio.
function RadioGroup({
  className,
  invalid,
  ...props
}: RadioGroupPrimitive.Props & {
  /** Marks the whole group invalid (sets aria-invalid on the group; same as passing aria-invalid). */
  invalid?: boolean
}) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("group/radio-group grid w-full min-w-0 gap-2", className)}
      {...(invalid ? { "aria-invalid": true } : null)}
      {...props}
    />
  )
}

// Mark of a selected option on a tint surface (Figma Choice Button / Radio, pressed): the same filled circle as
// the Toggle Button Group mark — border and fill tint-text, the dot tint. The hover, pressed and invalid variants
// repeat the base ones so the default brand colours cannot win; only the checked state is touched.
const TINT_MARK =
  "data-checked:border-tint-text-indigo data-checked:bg-tint-text-indigo hover:data-checked:bg-tint-text-indigo active:data-checked:bg-tint-text-indigo hover:data-checked:not-aria-invalid:border-tint-text-indigo active:data-checked:not-aria-invalid:border-tint-text-indigo aria-invalid:data-checked:border-tint-text-indigo group-aria-invalid/radio-group:data-checked:border-tint-text-indigo group-aria-invalid/radio-group:hover:data-checked:border-tint-text-indigo group-aria-invalid/radio-group:active:data-checked:border-tint-text-indigo"

function RadioGroupItem({
  className,
  tone = "default",
  ...props
}: RadioPrimitive.Root.Props & {
  /**
   * `tint` for a radio that sits on a tint surface when selected (a selected option card): the mark takes the
   * tint colours of the same hue, like the Choice Button. `default` is the plain brand radio on a white surface.
   */
  tone?: "default" | "tint"
}) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      data-tone={tone === "tint" ? "tint" : undefined}
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-border-control bg-card outline-none transition-colors duration-fast ease-entrance hover:not-data-checked:not-aria-invalid:border-primary active:not-data-checked:not-aria-invalid:border-primary hover:not-data-checked:bg-bg-page active:not-data-checked:bg-bg-subtle hover:data-checked:bg-(--brand-700) hover:data-checked:not-aria-invalid:border-(color:--brand-700) active:data-checked:bg-(--brand-800) active:data-checked:not-aria-invalid:border-(color:--brand-800) after:absolute after:-inset-x-3 after:-inset-y-2 focus-ring data-disabled:cursor-not-allowed data-disabled:opacity-40 aria-invalid:border-error aria-invalid:focus-ring-error data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground aria-invalid:data-checked:border-error group-aria-invalid/radio-group:border-error group-aria-invalid/radio-group:focus-ring-error group-aria-invalid/radio-group:data-checked:border-error group-aria-invalid/radio-group:hover:data-checked:border-error group-aria-invalid/radio-group:active:data-checked:border-error",
        tone === "tint" && TINT_MARK,
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span
          className={cn(
            "absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
            tone === "tint" ? "bg-tint-indigo" : "bg-primary-foreground"
          )}
        />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
