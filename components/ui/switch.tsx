"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"
import * as React from "react"

/**
 * Base UI renders a hidden native <input> next to the visible control and gives it no name.
 * It is aria-hidden, but page checkers still list it as an unlabelled form control, so the
 * control's aria-label / aria-labelledby is mirrored onto it.
 */
function useNamedHiddenInput(inputRef: React.Ref<HTMLInputElement> | undefined, label?: string, labelledBy?: string) {
  return React.useCallback(
    (node: HTMLInputElement | null) => {
      if (node) {
        if (label) node.setAttribute("aria-label", label)
        else node.removeAttribute("aria-label")
        if (labelledBy) node.setAttribute("aria-labelledby", labelledBy)
        else node.removeAttribute("aria-labelledby")
      }
      if (typeof inputRef === "function") inputRef(node)
      else if (inputRef) (inputRef as React.RefObject<HTMLInputElement | null>).current = node
    },
    [inputRef, label, labelledBy]
  )
}

function Switch({
  className,
  size = "default",
  inputRef,
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  const namedInputRef = useNamedHiddenInput(inputRef, props["aria-label"], props["aria-labelledby"])
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      inputRef={namedInputRef}
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition duration-fast ease-entrance outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18px] data-[size=default]:w-8 data-[size=default]:[--switch-travel:14px] data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[size=sm]:[--switch-travel:10px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-dark-400 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* M13: a transition with the overshoot curve still swings past the end and settles,
          but a second click reverses it from wherever it is instead of replaying keyframes. */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform duration-base ease-overshoot group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-checked:translate-x-(--switch-travel) dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
