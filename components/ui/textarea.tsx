"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "w-full min-w-0 resize-y rounded-md border border-input bg-card px-3 pt-3 pb-2 text-sm transition-colors duration-fast ease-entrance outline-none placeholder:text-muted-foreground hover:border-text-muted focus-ring aria-invalid:border-error aria-invalid:focus-ring-error [&[readonly]]:bg-bg-subtle disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
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

type TextareaControlProps = Omit<React.ComponentProps<"textarea">, "size"> &
  VariantProps<typeof textareaVariants> & {
    /** Show a "n/maxLength" character counter in the bottom-right corner. Requires maxLength. */
    showCount?: boolean
  }

type TextareaFieldProps = {
  /** Visible label. Joined to the control with `htmlFor`. */
  label?: React.ReactNode
  /** Adds the "(optional)" tag to the label. */
  optional?: boolean
  /** Hint below the field. Replaced by `error` while there is one. */
  helper?: React.ReactNode
  /** Error message below the field. Sets `aria-invalid` and `aria-describedby`. */
  error?: React.ReactNode
  /** Class names for the wrapper around label, field and message. */
  wrapperClassName?: string
}

type TextareaProps = TextareaControlProps & TextareaFieldProps

/** The props that turn the bare control into a field. Presence of the prop counts, not its value, so a
 *  conditional `error={cond ? "…" : undefined}` never swaps the DOM (and drops the focus) when it flips. */
const FIELD_PROPS = ["label", "optional", "helper", "error", "wrapperClassName"] as const

/**
 * Multi-line text field.
 *
 * Without any of the field props (`label`, `optional`, `helper`, `error`,
 * `wrapperClassName`) it renders the bare `<textarea>` (inside the box that
 * carries the counter). With one of them it renders the field: label row, the
 * control and the helper or error line, wired with `htmlFor`, `aria-invalid` and
 * `aria-describedby`.
 */
function Textarea(props: TextareaProps) {
  const autoId = React.useId()
  if (!FIELD_PROPS.some((key) => key in props)) return <TextareaControl {...props} />

  const { label, optional, helper, error, wrapperClassName, id: idProp, ...rest } = props
  const id = idProp ?? autoId
  // A disabled field dims its label and helper line with the control (Figma Field / Disabled).
  const dim = rest.disabled ? "opacity-40" : undefined
  return (
    <div data-slot="textarea-field" className={cn("flex flex-col gap-1", wrapperClassName)}>
      {label && (
        <label htmlFor={id} className={cn("mb-1 text-sm font-medium text-foreground", dim)}>
          {label}
          {optional && <span className="ms-1 font-normal text-text-tertiary">(optional)</span>}
        </label>
      )}
      <TextareaControl
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-text-error">
          {error}
        </p>
      ) : (
        helper && (
          <p id={`${id}-helper`} className={cn("text-xs text-text-tertiary", dim)}>
            {helper}
          </p>
        )
      )}
    </div>
  )
}

function TextareaControl({
  className,
  size = "default",
  showCount,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaControlProps) {
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
        defaultValue={isControlled ? undefined : defaultValue}
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
export type { TextareaProps }
