"use client"

import * as React from "react"
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"
import { cn } from "@/lib/utils"

function OtpField({ className, ...props }: OTPFieldPrimitive.Root.Props) {
  return (
    <OTPFieldPrimitive.Root
      data-slot="otp-field"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function OtpFieldInput({ className, ...props }: OTPFieldPrimitive.Input.Props) {
  return (
    <OTPFieldPrimitive.Input
      data-slot="otp-field-input"
      className={cn(
        "size-(--control-lg) rounded-md border border-input bg-card text-center text-lg font-medium text-foreground outline-none transition-colors duration-fast ease-entrance placeholder:text-muted-foreground focus:placeholder:text-transparent hover:border-text-muted focus-ring aria-invalid:border-error aria-invalid:focus-ring-error data-invalid:border-error data-invalid:focus-ring-error data-readonly:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

type OtpFieldCodeProps = {
  length?: 4 | 6
  value?: string
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
  invalid?: boolean
  disabled?: boolean
  autoFocus?: boolean
  /** Names the group for screen readers; each digit is announced as "Digit n of N". */
  "aria-label"?: string
  className?: string
}

/**
 * The ready-made code field: 4 or 6 large boxes (56 x 64) in a named group, every digit announced as "Digit n of N",
 * `onComplete` once the last digit is in. Built from OtpField and OtpFieldInput; use those two for a different layout.
 */
function OtpFieldCode({
  length = 6,
  value,
  onValueChange,
  onComplete,
  invalid,
  disabled,
  autoFocus,
  "aria-label": ariaLabel = "One-time code",
  className,
}: OtpFieldCodeProps) {
  // Base UI ignores `aria-label` on the first slot (and warns in the console): the first slot is named by a label
  // element instead. The hidden span is that label; it is out of the layout and not read twice (aria-hidden).
  const firstLabelId = React.useId()
  return (
    <OtpField
      data-slot="otp-field-code"
      role="group"
      aria-label={ariaLabel}
      value={value}
      onValueChange={(v: string) => {
        onValueChange?.(v)
        if (v.length === length) onComplete?.(v)
      }}
      length={length}
      disabled={disabled}
      className={cn("gap-2", className)}
    >
      <span id={firstLabelId} aria-hidden className="sr-only">
        {`Digit 1 of ${length}`}
      </span>
      {Array.from({ length }, (_, i) => (
        <OtpFieldInput
          key={i}
          autoFocus={autoFocus && i === 0}
          aria-label={i === 0 ? undefined : `Digit ${i + 1} of ${length}`}
          aria-labelledby={i === 0 ? firstLabelId : undefined}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-16 w-14 rounded-xl border-border bg-card text-2xl font-bold placeholder:text-muted-foreground",
            "aria-invalid:border-destructive"
          )}
          placeholder="–"
        />
      ))}
    </OtpField>
  )
}

export { OtpField, OtpFieldInput, OtpFieldCode }
export type { OtpFieldCodeProps }
