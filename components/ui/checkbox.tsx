"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
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

// Figma Appearance=Neutral: the filled box is the inverse surface (black in light, white in dark)
// with an inverse-coloured check instead of the brand fill. Hover and disabled stay as they are; an invalid box keeps its red rim.
const NEUTRAL_CHECKED =
  "data-checked:border-inverse data-checked:bg-inverse data-checked:text-text-inverse dark:data-checked:bg-inverse data-indeterminate:border-inverse data-indeterminate:bg-inverse data-indeterminate:text-text-inverse group-has-[:focus-visible]/field-label:data-checked:border-inverse"

// Figma Appearance=Brand: the filled box darkens on hover (brand-700) and pressed (brand-800), the same
// fixed tokens as the primary button, so the white mark keeps its contrast in both themes (7.0:1, 10.0:1).
// The border follows the fill unless the box is invalid (the red rim stays).
const BRAND_STATES =
  "hover:data-checked:bg-(--brand-700) hover:data-indeterminate:bg-(--brand-700) active:data-checked:bg-(--brand-800) active:data-indeterminate:bg-(--brand-800) hover:data-checked:not-aria-invalid:border-(color:--brand-700) hover:data-indeterminate:not-aria-invalid:border-(color:--brand-700) active:data-checked:not-aria-invalid:border-(color:--brand-800) active:data-indeterminate:not-aria-invalid:border-(color:--brand-800)"

type CheckboxControlProps = CheckboxPrimitive.Root.Props & {
  /** `brand` fills the checked box with the brand colour; `neutral` fills it with the inverse (black/white) surface. */
  appearance?: "brand" | "neutral"
}

type CheckboxFieldProps = {
  /** Visible label to the right of the box. Joined to the box with `htmlFor`; a click on it toggles the box. */
  label?: React.ReactNode
  /** A second line under the label in the tertiary colour. */
  description?: React.ReactNode
  /** Error message under the row. Sets `aria-invalid` and `aria-describedby` on the box and turns its rim red. */
  error?: React.ReactNode
  /** Class names for the row (or, with `error`, for the wrapper around the row and the message). */
  wrapperClassName?: string
}

type CheckboxProps = CheckboxControlProps & CheckboxFieldProps

/** The props that turn the bare box into a field row. Presence of the prop counts, not its value, so a
 *  conditional `error={cond ? "…" : undefined}` never swaps the DOM (and drops the focus) when it flips. */
const FIELD_PROPS = ["label", "description", "error", "wrapperClassName"] as const

/**
 * Checkbox. Without any of the field props (`label`, `description`, `error`,
 * `wrapperClassName`) it renders the bare box. With one of them it renders the
 * row: the box and its label (and description) in one `<label>`, so the whole
 * row is the click target; `error` adds the message under the row.
 */
function Checkbox(props: CheckboxProps) {
  const autoId = React.useId()
  if (!FIELD_PROPS.some((key) => key in props)) return <CheckboxControl {...props} />

  const { label, description, error, wrapperClassName, id: idProp, className, ...rest } = props
  const id = idProp ?? autoId
  // The message sits outside the label so it is not read as part of the box's name.
  const withMessage = "error" in props
  const row = (
    <label
      htmlFor={id}
      data-slot={withMessage ? undefined : "checkbox-field"}
      className={cn("group/checkbox-field flex cursor-pointer items-start gap-2 has-[[data-disabled]]:cursor-not-allowed", !withMessage && wrapperClassName)}
    >
      <CheckboxControl
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn("mt-0.5", className)}
        {...rest}
      />
      <span className="flex flex-col gap-0.5">
        {label && (
          <span className="text-sm text-text-secondary group-has-[[data-disabled]]/checkbox-field:opacity-40 [&_a]:font-medium [&_a]:text-text-link [&_a]:hover:underline">{label}</span>
        )}
        {description && <span className="text-xs text-text-tertiary group-has-[[data-disabled]]/checkbox-field:opacity-40">{description}</span>}
      </span>
    </label>
  )
  if (!withMessage) return row
  return (
    <div data-slot="checkbox-field" className={cn("flex flex-col gap-1", wrapperClassName)}>
      {row}
      {error && (
        <p id={`${id}-error`} className="ps-6 text-xs text-text-error">
          {error}
        </p>
      )}
    </div>
  )
}

function CheckboxControl({
  className,
  inputRef,
  appearance = "brand",
  ...props
}: CheckboxControlProps) {
  const namedInputRef = useNamedHiddenInput(inputRef, props["aria-label"], props["aria-labelledby"])
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-appearance={appearance}
      inputRef={namedInputRef}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border-control bg-card transition-colors duration-fast ease-entrance outline-none hover:not-data-checked:not-data-indeterminate:not-aria-invalid:border-primary active:not-data-checked:not-data-indeterminate:not-aria-invalid:border-primary hover:not-data-checked:not-data-indeterminate:bg-bg-page active:not-data-checked:not-data-indeterminate:bg-bg-subtle after:absolute after:-inset-x-3 after:-inset-y-2 focus-ring data-disabled:cursor-not-allowed data-disabled:opacity-40 aria-invalid:border-error aria-invalid:focus-ring-error data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground aria-invalid:data-checked:border-error aria-invalid:data-indeterminate:border-error",
        appearance === "brand" && BRAND_STATES,
        appearance === "neutral" && NEUTRAL_CHECKED,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className={cn(
          "grid place-content-center text-current opacity-0 transition-opacity ease-entrance duration-fast data-checked:opacity-100 data-indeterminate:opacity-100 [&>svg]:size-3.5 [&>svg:last-child]:hidden data-indeterminate:[&>svg:first-child]:hidden data-indeterminate:[&>svg:last-child]:block",
          // The box fills instantly (see Root's data-checked:bg-primary above);
          // the check stroke draws in after via stroke-dashoffset. 23 is
          // lucide's CheckIcon path length (getTotalLength()), rounded up by 1
          // so the draw never over/under-shoots. Uncheck reverses fast with no
          // draw — transitioning offset (not toggling display) is what lets a
          // mid-draw uncheck reverse cleanly instead of jumping. The offset is
          // negative because lucide's path starts at the top-right end: the
          // tick draws from its short stroke up to the long one, like by hand.
          "[&_svg_path]:[stroke-dasharray:23] [&_svg_path]:[stroke-dashoffset:-23] [&_svg_path]:transition-[stroke-dashoffset] [&_svg_path]:duration-fast [&_svg_path]:ease-entrance data-checked:[&_svg_path]:[stroke-dashoffset:0] data-indeterminate:[&_svg_path]:[stroke-dashoffset:0] data-checked:[&_svg_path]:duration-slow"
        )}
      >
        {/* the roles checkboxCheck / checkboxIndeterminate (ui/icon-provider.tsx) draw Lucide heavier so the mark reads at 16 px: 3 on lucide's 24 grid for the check (about 1.75 px at 14 px), 4 for the minus, a short bar that looks thinner than the check at the same weight */}
        <Icon name="checkboxCheck" />
        <Icon name="checkboxIndeterminate" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
export type { CheckboxProps }
