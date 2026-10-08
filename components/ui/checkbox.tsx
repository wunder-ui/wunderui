"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "cn"
import { CheckIcon, MinusIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-muted-foreground transition-colors hover:not-data-checked:border-primary outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-muted-foreground after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-muted/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className={cn(
          "grid place-content-center text-current opacity-0 transition-opacity duration-fast data-checked:opacity-100 data-indeterminate:opacity-100 [&>svg]:size-4 [&>svg:last-child]:hidden data-indeterminate:[&>svg:first-child]:hidden data-indeterminate:[&>svg:last-child]:block",
          // The box fills instantly (see Root's data-checked:bg-primary above);
          // the check stroke draws in after via stroke-dashoffset. 23 is
          // lucide's CheckIcon path length (getTotalLength()), rounded up by 1
          // so the draw never over/under-shoots. Uncheck reverses fast with no
          // draw — transitioning offset (not toggling display) is what lets a
          // mid-draw uncheck reverse cleanly instead of jumping.
          "[&_svg_path]:[stroke-dasharray:23] [&_svg_path]:[stroke-dashoffset:23] [&_svg_path]:transition-[stroke-dashoffset] [&_svg_path]:duration-fast [&_svg_path]:ease-entrance data-checked:[&_svg_path]:[stroke-dashoffset:0] data-checked:[&_svg_path]:duration-slow"
        )}
      >
        <CheckIcon />
        <MinusIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
