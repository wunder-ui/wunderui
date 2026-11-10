"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon } from "./input-group"
import { Tooltip, TooltipContent } from "./tooltip"

const inputVariants = cva(
  "w-full min-w-0 rounded-md border border-input bg-card text-sm transition-colors duration-fast ease-entrance outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-text-muted focus-ring [&[readonly]]:bg-bg-subtle disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error aria-invalid:focus-ring-error",
  {
    variants: {
      size: {
        // Field heights are density tokens (styles.css): compact 32/36/40 — the
        // Button sm/md/lg — and data-density="comfortable" 36/44/52.
        sm: "h-(--field-sm) px-3 text-[13px]/[18px]",
        default: "h-(--field-md) px-3",
        lg: "h-(--field-lg) px-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type InputControlProps = Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>

/**
 * The bare control: the `<input>` and its validation tooltip. Constraint
 * validation (`required`, `type="email"`, `pattern`, `minLength`…) answers in
 * the WunderUI tooltip instead of the browser's own bubble: on submit the first
 * invalid field is focused and shows the browser's message in a Tooltip, and
 * the message clears as soon as the user types or leaves the field.
 */
function InputControl({
  className,
  type,
  size = "default",
  ref,
  onInvalid,
  onInput,
  onBlur,
  ...props
}: InputControlProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const shown = React.useRef("")
  if (message) shown.current = message

  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node
    },
    [ref]
  )

  return (
    <>
      <InputPrimitive
        ref={setRefs}
        type={type}
        data-slot="input"
        className={cn(inputVariants({ size }), className)}
        onInvalid={(event: React.FormEvent<HTMLInputElement>) => {
          onInvalid?.(event)
          if (event.defaultPrevented) return
          event.preventDefault()
          const input = event.currentTarget
          // Every invalid field fires; only the first one in the form speaks.
          // Controls only: a <fieldset> around an invalid field matches :invalid too
          // and comes first in document order, which would silence every field in it.
          const first = input.form?.querySelector<HTMLElement>(":is(input, select, textarea):invalid")
          if (first && first !== input) return
          input.focus()
          setMessage(input.validationMessage)
        }}
        onInput={(event: React.InputEvent<HTMLInputElement>) => {
          onInput?.(event)
          if (message) setMessage(null)
        }}
        onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
          onBlur?.(event)
          if (message) setMessage(null)
        }}
        {...props}
        aria-invalid={message ? true : props["aria-invalid"]}
      />
      <Tooltip open={!!message}>
        <TooltipContent anchor={inputRef} side="bottom" align="start" role="alert">
          {shown.current}
        </TooltipContent>
      </Tooltip>
    </>
  )
}

type InputFieldProps = {
  /** Visible label. Joined to the control with `htmlFor`. */
  label?: React.ReactNode
  /** A tag or a link on the label row, right-aligned (for example "Forgot password?"). */
  labelTrailing?: React.ReactNode
  /** Adds the "(optional)" tag to the label. */
  optional?: boolean
  /** Hint below the field. Replaced by `error` while there is one. */
  helper?: React.ReactNode
  /** Error message below the field. Sets `aria-invalid` and `aria-describedby`. */
  error?: React.ReactNode
  /** Content inside the field, before the text (icon, prefix). */
  leading?: React.ReactNode
  /** Content inside the field, after the text (icon, suffix, button). */
  trailing?: React.ReactNode
  /** Class names for the wrapper around label, field and message. */
  wrapperClassName?: string
  /** With `type="password"`: adds the button that shows or hides what was typed. */
  revealable?: boolean
}

type InputProps = InputControlProps & InputFieldProps

/** The props that turn the bare control into a field. Presence of the prop counts, not its value, so a
 *  conditional `error={cond ? "…" : undefined}` never swaps the DOM (and drops the focus) when it flips. */
const FIELD_PROPS = ["label", "labelTrailing", "optional", "helper", "error", "leading", "trailing", "wrapperClassName", "revealable"] as const

/**
 * Text input. Constraint validation (`required`, `type="email"`, `pattern`,
 * `minLength`…) answers in the WunderUI tooltip instead of the browser's own
 * bubble: on submit the first invalid field is focused and shows the browser's
 * message in a Tooltip, and the message clears as soon as the user types or
 * leaves the field.
 *
 * Without any of the field props (`label`, `labelTrailing`, `optional`, `helper`,
 * `error`, `leading`, `trailing`, `wrapperClassName`, `revealable`) it renders
 * the bare `<input>`. With one of them it renders the field: label row, the
 * control (inside an Input Group when there is leading or trailing content),
 * and the helper or error line, wired with `htmlFor`, `aria-invalid` and
 * `aria-describedby`. `revealable` on `type="password"` adds the show/hide button.
 */
function Input(props: InputProps) {
  const autoId = React.useId()
  const [visible, setVisible] = React.useState(false)
  if (!FIELD_PROPS.some((key) => key in props)) return <InputControl {...props} />

  const { label, labelTrailing, optional, helper, error, leading, trailing, wrapperClassName, revealable, size, id: idProp, className, ...rest } = props
  const id = idProp ?? autoId
  const reveal = !!revealable && rest.type === "password"
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined
  // A disabled field dims its label and helper line with the control (Figma Field / Disabled).
  const dim = rest.disabled ? "opacity-40" : undefined
  const end = reveal ? (
    <>
      {trailing}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="rounded-sm text-text-tertiary outline-none hover:text-foreground focus-ring"
      >
        {/* The icon shows the current state: dots hidden behind a
            crossed-out eye, plain text behind an open one. */}
        {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>
    </>
  ) : (
    trailing
  )
  const control = (
    <InputControl
      id={id}
      size={size}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={className}
      {...rest}
      type={reveal && visible ? "text" : rest.type}
    />
  )
  return (
    <div data-slot="input-field" className={cn("flex flex-col gap-1", wrapperClassName)}>
      {(label || labelTrailing) && (
        <div className="mb-1 flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={id} className={cn("text-sm font-medium text-foreground", dim)}>
              {label}
              {optional && <span className="ml-1 font-normal text-text-tertiary">(optional)</span>}
            </label>
          )}
          {labelTrailing}
        </div>
      )}
      {leading || end ? (
        <InputGroup className={cn(size === "sm" && "h-(--field-sm)", size === "lg" && "h-(--field-lg)", error && "border-destructive")}>
          {leading && <InputGroupAddon>{leading}</InputGroupAddon>}
          {control}
          {end && <InputGroupAddon>{end}</InputGroupAddon>}
        </InputGroup>
      ) : (
        control
      )}
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

export { Input, inputVariants }
export type { InputProps, InputFieldProps }
