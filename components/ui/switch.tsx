"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon-provider"
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

// Figma Appearance: Brand (default) fills the checked track with the brand colour, Neutral with the
// inverse surface (black in light, white in dark; the thumb flips with it), Muted with the quiet grey.
// Brand darkens on hover (brand-700) and pressed (brand-800), the fixed tokens of the primary button; an
// unchecked track gets the control rim on hover and dark-500 pressed. Disabled is the rest look at 40 % opacity.
const SWITCH_APPEARANCE_TRACK = {
  brand: "hover:data-checked:bg-(--brand-700) active:data-checked:bg-(--brand-800)",
  neutral: "data-checked:bg-inverse",
  muted: "data-checked:bg-muted-foreground",
} as const

const SWITCH_APPEARANCE_THUMB = {
  brand: "dark:data-checked:bg-primary-foreground",
  neutral: "data-checked:bg-text-inverse",
  muted: "",
} as const

function Switch({
  className,
  size = "default",
  appearance = "brand",
  saving = false,
  inputRef,
  readOnly,
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
  /** Checked-track colour: `brand`, `neutral` (inverse black/white) or `muted` (quiet grey). */
  appearance?: keyof typeof SWITCH_APPEARANCE_TRACK
  /** Pending save: the handle shows a spinner, the switch is `aria-busy` and ignores clicks until it is cleared. */
  saving?: boolean
}) {
  const namedInputRef = useNamedHiddenInput(inputRef, props["aria-label"], props["aria-labelledby"])
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      inputRef={namedInputRef}
      data-size={size}
      data-appearance={appearance}
      data-saving={saving ? "" : undefined}
      aria-busy={saving || undefined}
      readOnly={saving || readOnly}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition duration-fast ease-entrance outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-ring aria-invalid:border-error aria-invalid:focus-ring-error data-[size=default]:h-[18px] data-[size=default]:w-8 data-[size=default]:[--switch-travel:14px] data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[size=sm]:[--switch-travel:10px] data-checked:bg-primary data-unchecked:bg-dark-400 hover:data-unchecked:border-border-control active:data-unchecked:bg-dark-500 data-disabled:cursor-not-allowed data-disabled:opacity-40",
        SWITCH_APPEARANCE_TRACK[appearance],
        saving && "cursor-progress",
        className
      )}
      {...props}
    >
      {/* M13: a transition with the overshoot curve still swings past the end and settles,
          but a second click reverses it from wherever it is instead of replaying keyframes. */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none flex items-center justify-center rounded-full bg-background ring-0 transition-transform duration-base ease-overshoot group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-checked:translate-x-(--switch-travel) group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground",
          SWITCH_APPEARANCE_THUMB[appearance]
        )}
      >
        {/* The spinner turns while a save runs; reduced motion keeps it as a still glyph. */}
        {saving && (
          <Icon
            name="spinner"
            data-slot="switch-spinner"
            aria-hidden
            className="size-2.5 animate-spin text-dark-400 group-data-[size=sm]/switch:size-2 motion-reduce:animate-none"
          />
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
