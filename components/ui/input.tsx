"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tooltip, TooltipContent } from "./tooltip"

const inputVariants = cva(
  "w-full min-w-0 rounded-md border border-input bg-card text-sm transition-colors duration-fast ease-entrance outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-0 aria-invalid:focus-visible:ring-1 aria-invalid:focus-visible:ring-destructive dark:disabled:bg-muted/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        sm: "h-9 px-3 text-[13px]",
        default: "h-11 px-3",
        lg: "h-[52px] px-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/**
 * Text input. Constraint validation (`required`, `type="email"`, `pattern`,
 * `minLength`…) answers in the WunderUI tooltip instead of the browser's own
 * bubble: on submit the first invalid field is focused and shows the browser's
 * message in a Tooltip, and the message clears as soon as the user types or
 * leaves the field.
 */
function Input({
  className,
  type,
  size = "default",
  ref,
  onInvalid,
  onInput,
  onBlur,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
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
          const first = input.form?.querySelector<HTMLElement>(":invalid")
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

export { Input, inputVariants }
