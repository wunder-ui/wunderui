"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "w-full min-w-0 resize-y rounded-md border border-input bg-card px-3 py-2.5 text-sm transition-colors duration-fast ease-entrance outline-none placeholder:text-muted-foreground focus-visible:border-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:focus-visible:ring-destructive dark:disabled:bg-muted/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        // Density tokens (styles.css): compact 72/96/128, comfortable 80/112/144.
        sm: "min-h-(--textarea-sm)",
        default: "min-h-(--textarea-md)",
        lg: "min-h-(--textarea-lg) text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Textarea({
  className,
  size = "default",
  showCount,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...props
}: Omit<React.ComponentProps<"textarea">, "size"> &
  VariantProps<typeof textareaVariants> & {
    /** Show a "n/maxLength" character counter in the bottom-right corner. Requires maxLength. */
    showCount?: boolean
  }) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? "")
  const isControlled = value !== undefined
  const length = (isControlled ? value : uncontrolledValue)?.toString().length ?? 0
  const withCounter = showCount && maxLength !== undefined

  return (
    <div className="relative">
      <textarea
        data-slot="textarea"
        className={cn(textareaVariants({ size }), withCounter && "pb-6", className)}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => {
          if (!isControlled) setUncontrolledValue(event.target.value)
          onChange?.(event)
        }}
        {...props}
      />
      {withCounter && (
        <span className="pointer-events-none absolute right-3 bottom-2 text-xs text-text-tertiary tabular-nums">
          {length}/{maxLength}
        </span>
      )}
    </div>
  )
}

export { Textarea, textareaVariants }
