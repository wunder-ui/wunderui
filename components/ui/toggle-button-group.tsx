"use client"

import * as React from "react"
import { ToggleGroup } from "@base-ui/react/toggle-group"
import { Toggle } from "@base-ui/react/toggle"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"

// The group tells its buttons which mark to draw: a circle (radio) or a square (checkbox), as in the
// Figma set "Choice Button". Outside a group the context is null and ToggleButton stays a plain toggle.
type ChoiceKind = "radio" | "checkbox"
type ChoiceContextValue = {
  kind: ChoiceKind
  /** Radio only: the chosen value, as the group holds it. */
  value?: readonly string[]
  /** Radio only: set while the chosen button is disabled, so the roving tab stop stays with the composite. */
  checkedDisabled?: boolean
  setCheckedDisabled?: (disabled: boolean) => void
  /** Radio only: true while an arrow key or Home/End moves focus, so the button that gets it also chooses itself. */
  navigating?: React.RefObject<boolean>
}
const ChoiceContext = React.createContext<ChoiceContextValue | null>(null)
const CHECKBOX_CONTEXT: ChoiceContextValue = { kind: "checkbox" }

const NAVIGATION_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"])

// Error: put aria-invalid on the group (same as RadioGroup). Every unselected button then gets the red
// border plus the tint/red surface; the mark stays white with a red rim. Hover keeps it, selected and
// disabled buttons keep their own look.
function CheckboxButtonGroup<Value extends string>({
  className,
  ...props
}: ToggleGroup.Props<Value>) {
  return (
    <ChoiceContext.Provider value={CHECKBOX_CONTEXT}>
      <ToggleGroup
        data-slot="checkbox-button-group"
        multiple
        className={cn("group/toggle-group flex flex-wrap gap-2", className)}
        {...props}
      />
    </ChoiceContext.Provider>
  )
}

// A radio group behaves like native radios: it is one tab stop (the chosen button, or the first one while nothing
// is chosen), the arrow keys and Home/End move focus AND choose, pressing the chosen button again keeps it chosen
// (the value never becomes empty by a press), and disabled buttons are skipped. The group is a `radiogroup`, each
// button a `radio` with `aria-checked`. The value stays an array so the props match the toggle group; it holds
// one entry once a button is chosen.
function RadioButtonGroup<Value extends string>({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = "both",
  onKeyDownCapture,
  onKeyUp,
  ...props
}: Omit<ToggleGroup.Props<Value>, "multiple" | "orientation"> & {
  /**
   * The direction the arrow keys move in. `both` (default) works like native radios: Right and Down go to the next
   * button, Left and Up to the previous one. `horizontal` listens to Left and Right only, `vertical` to Up and Down only.
   */
  orientation?: "horizontal" | "vertical" | "both"
}) {
  const [inner, setInner] = React.useState<readonly Value[]>(defaultValue ?? [])
  const controlled = valueProp !== undefined
  const value = controlled ? valueProp : inner
  const [checkedDisabled, setCheckedDisabled] = React.useState(false)
  const navigating = React.useRef(false)

  const context = React.useMemo<ChoiceContextValue>(
    () => ({ kind: "radio", value, checkedDisabled, setCheckedDisabled, navigating }),
    [value, checkedDisabled]
  )

  return (
    <ChoiceContext.Provider value={context}>
      <ToggleGroup
        data-slot="radio-button-group"
        role="radiogroup"
        multiple={false}
        value={value}
        // Pressing the chosen button again would empty the group: refuse that change, a radio cannot be cleared.
        onValueChange={(next, details) => {
          if (next.length === 0) {
            details.cancel()
            return
          }
          onValueChange?.(next, details)
          if (!details.isCanceled && !controlled) setInner(next)
        }}
        // The Base UI type lists horizontal and vertical only; the composite underneath also knows `both`.
        orientation={orientation as "horizontal"}
        className={cn("group/toggle-group flex flex-wrap gap-2", className)}
        onKeyDownCapture={(event) => {
          onKeyDownCapture?.(event)
          if (!NAVIGATION_KEYS.has(event.key)) return
          navigating.current = true
          // The composite moves focus inside this same key event; the flag only lives for that moment.
          setTimeout(() => {
            navigating.current = false
          }, 0)
        }}
        onKeyUp={(event) => {
          onKeyUp?.(event)
          navigating.current = false
        }}
        {...props}
      />
    </ChoiceContext.Provider>
  )
}

/** True when the children contain visible text (a string or number anywhere in the element tree). */
function hasTextContent(node: React.ReactNode): boolean {
  let found = false
  React.Children.forEach(node, (child) => {
    if (found) return
    if (typeof child === "string") found = child.trim().length > 0
    else if (typeof child === "number") found = true
    else if (React.isValidElement<{ children?: React.ReactNode }>(child)) found = hasTextContent(child.props.children)
  })
  return found
}

// Mark states read the button through the named group `toggle-button` (pressed, hover, disabled) and the
// group through `toggle-group` (aria-invalid), so the mark needs no state of its own.
const MARK =
  "pointer-events-none relative flex size-4 shrink-0 items-center justify-center border border-border-control bg-bg-surface text-tint-indigo transition-colors duration-fast ease-entrance group-hover/toggle-button:border-primary group-data-pressed/toggle-button:border-primary group-data-pressed/toggle-button:bg-primary dark:group-data-pressed/toggle-button:border-tint-text-indigo dark:group-data-pressed/toggle-button:bg-tint-text-indigo group-aria-invalid/toggle-group:not-group-data-pressed/toggle-button:not-group-data-disabled/toggle-button:border-destructive"

function ToggleButton({
  className,
  children,
  indicator,
  value,
  disabled,
  onFocus,
  ...props
}: React.ComponentProps<typeof Toggle> & {
  /**
   * Draws the radio circle or the checkbox square in front of the label. Default: on inside a
   * RadioButtonGroup / CheckboxButtonGroup when the button has a text label, off for icon-only buttons
   * (no text in children) and outside a group. Pass `false` to hide it, or `true` to force it when the
   * label comes from a custom component that the text check cannot see.
   */
  indicator?: boolean
}) {
  const choice = React.useContext(ChoiceContext)
  const kind = choice?.kind ?? null
  const showMark = kind !== null && (indicator ?? hasTextContent(children))

  // Inside a RadioButtonGroup the button is a radio: `role="radio"` with `aria-checked`, no `aria-pressed`.
  const isRadio = kind === "radio"
  const checked = isRadio && value !== undefined && (choice?.value ?? []).includes(value)
  const setCheckedDisabled = choice?.setCheckedDisabled
  React.useEffect(() => {
    if (!isRadio || !checked || !disabled) return
    setCheckedDisabled?.(true)
    return () => setCheckedDisabled?.(false)
  }, [isRadio, checked, disabled, setCheckedDisabled])
  // One tab stop: the chosen button. While nothing is chosen (or the chosen one is disabled) the composite's own
  // roving tab stop (the first button) stays in charge.
  const roving = isRadio && (choice?.value?.length ?? 0) > 0 && !choice?.checkedDisabled
  const radioProps = isRadio
    ? {
        role: "radio",
        "aria-checked": checked,
        "aria-pressed": undefined,
        ...(roving ? { tabIndex: checked ? 0 : -1 } : null),
      }
    : null

  return (
    <Toggle
      data-slot="toggle-button"
      value={value}
      disabled={disabled}
      onFocus={(event) => {
        onFocus?.(event)
        // Arrow keys and Home/End choose the button they move to, like native radios.
        if (isRadio && choice?.navigating?.current && !checked && !event.currentTarget.disabled) event.currentTarget.click()
      }}
      className={cn(
        "group/toggle-button inline-flex items-center justify-center gap-2 border border-border py-2 text-label-sm/4 font-medium text-text-primary outline-none transition duration-fast ease-entrance select-none hover:not-data-pressed:bg-bg-page active:not-data-pressed:bg-subtle focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(color:--indigo-300) data-disabled:pointer-events-none data-disabled:opacity-40 data-pressed:border-primary data-pressed:bg-tint-indigo data-pressed:text-primary dark:data-pressed:border-tint-text-indigo dark:data-pressed:text-tint-text-indigo group-aria-invalid/toggle-group:not-data-pressed:not-data-disabled:border-destructive group-aria-invalid/toggle-group:not-data-pressed:not-data-disabled:bg-tint-red group-aria-invalid/toggle-group:not-data-pressed:not-data-disabled:hover:bg-tint-red",
        // A radio option is a pill: the 16 px circle sits 9 px from the edge, so it follows the corner (17 - 9 = 8).
        showMark && kind === "radio" ? "rounded-full ps-2 pe-4" : "rounded-md px-3",
        className
      )}
      {...radioProps}
      {...props}
    >
      {showMark && (
        <span
          aria-hidden
          data-slot="toggle-button-mark"
          data-kind={kind}
          className={cn(MARK, kind === "radio" ? "rounded-full" : "rounded-[4px]")}
        >
          {kind === "checkbox" ? (
            <Icon
              name="check"
              strokeWidth={3}
              className="size-3.5 opacity-0 transition-opacity duration-fast ease-entrance group-data-pressed/toggle-button:opacity-100"
            />
          ) : (
            <span className="size-1.5 rounded-full bg-tint-indigo opacity-0 transition-opacity duration-fast ease-entrance group-data-pressed/toggle-button:opacity-100" />
          )}
        </span>
      )}
      {children}
    </Toggle>
  )
}

export { CheckboxButtonGroup, RadioButtonGroup, ToggleButton }
