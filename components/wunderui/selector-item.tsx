"use client"

import { cloneElement, createContext, isValidElement, useContext, useId, useMemo, type ReactNode } from "react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"
import { Badge, type BadgeColor } from "@/components/ui/badge"
import { RadioGroup } from "@/components/ui/radio-group"

type SelectorItemGroupContextValue = { invalid?: boolean }
const SelectorItemGroupContext = createContext<SelectorItemGroupContextValue>({})

// Selected card, read from the control (data-checked, a switch excluded) or from the `selected` prop: indigo tint surface,
// 1.5 px rim (primary in light, tint-text in dark), kept on hover and while pressed. Literal class strings so the Tailwind scanner finds them.
const SELECTED_SURFACE =
  "has-[label_[data-checked]:not([data-slot^=switch])]:border-[1.5px] has-[label_[data-checked]:not([data-slot^=switch])]:border-primary dark:has-[label_[data-checked]:not([data-slot^=switch])]:border-tint-text-indigo has-[label_[data-checked]:not([data-slot^=switch])]:bg-tint-indigo has-[label_[data-checked]:not([data-slot^=switch])]:hover:bg-tint-indigo has-[label_[data-checked]:not([data-slot^=switch])]:[--surface:var(--tint-indigo)] has-[label_[data-checked]:not([data-slot^=switch])]:hover:[--surface:var(--tint-indigo)]"
// Avatar rings in the colour behind them (owner rule): --surface follows the card's fill in every state (card, hover under
// @media (hover: hover) via the hover variant, pressed, checked tint, error tint), so a ring or presence dot of an avatar in
// the leading slot matches the card.
const SURFACE =
  "[--surface:var(--card)] hover:[--surface:var(--bg-page)] has-[label:active]:[--surface:var(--subtle)] has-[label_[data-disabled]]:hover:[--surface:var(--card)]"
// Avatar height = text block (owner, Nov 14 2026): the card's title and description are 20 + 4 + 20 = 44 px, so a 36 px
// (default size) avatar in the leading slot grows to 44 px (the xl size, 15 px initials) when the row has a description.
const AVATAR_TEXT =
  "has-[[data-slot=selector-item-description]]:[&_[data-slot=selector-item-leading]>[data-slot=avatar][data-size=default]]:size-11 has-[[data-slot=selector-item-description]]:[&_[data-slot=selector-item-leading]>[data-slot=avatar][data-size=default]_[data-slot=avatar-fallback]]:text-[15px]"
// The mark of a checked radio or checkbox on that surface takes the tint colours of the same hue (filled in primary in light and tint-text in dark, dot or check in tint).
// Secondary text on the selected surface: muted-foreground drops under AA on the tint in dark, text-secondary keeps it.
const SELECTED_SECONDARY =
  "group-has-[label_[data-checked]:not([data-slot^=switch])]/selector-item-row:text-text-secondary group-data-selected/selector-item-row:text-text-secondary"
const SELECTED_MARK =
  "has-[label_[data-checked]:not([data-slot^=switch])]:[&_[data-slot=selector-item-control]_[data-checked]:not([data-slot$=indicator])]:border-primary has-[label_[data-checked]:not([data-slot^=switch])]:[&_[data-slot=selector-item-control]_[data-checked]:not([data-slot$=indicator])]:bg-primary dark:has-[label_[data-checked]:not([data-slot^=switch])]:[&_[data-slot=selector-item-control]_[data-checked]:not([data-slot$=indicator])]:border-tint-text-indigo dark:has-[label_[data-checked]:not([data-slot^=switch])]:[&_[data-slot=selector-item-control]_[data-checked]:not([data-slot$=indicator])]:bg-tint-text-indigo has-[label_[data-checked]:not([data-slot^=switch])]:[&_[data-slot=selector-item-control]_[data-checked]:not([data-slot$=indicator])]:text-tint-indigo has-[label_[data-checked]:not([data-slot^=switch])]:[&_[data-slot=radio-group-indicator]_span]:bg-tint-indigo"

/** A list row pairing a label/description with a control — pass a
 *  RadioGroupItem, Checkbox, or Switch as `control`. Stack rows inside
 *  SelectorItemGroup for a single bordered list.
 *
 *  The label (leading, title, description, metadata and the control) is one
 *  <label>, so a click on it toggles the control. The border answers the
 *  pointer on hover (bg-page), the row takes bg-subtle while pressed and the border turns
 *  indigo while the control is checked — the state is read from the control
 *  itself, so it follows a radio group or a controlled checkbox without extra props.
 *
 *  `action` is a secondary control (a menu button, an "Edit" link). It is a
 *  sibling of the <label>, never inside it: a click on it does not toggle the
 *  control, and the row has one tab stop for the control and one for the action.
 *  `metadata` sits inside the label and is plain text, not interactive.
 *
 *  The surrounding <label> only names native inputs; Base UI controls render a
 *  role="radio" / role="checkbox" span, so the title and description are wired
 *  to the control with aria-labelledby / aria-describedby unless the control
 *  brings its own name. `helper` and `error` are linked the same way; an `error`
 *  also marks the control aria-invalid (unless it sets that itself).
 *
 *  A selected card (the control is checked, or `selected` is set) takes the indigo tint surface with a 1.5 px
 *  tint-text rim; the text stays neutral and the mark of a radio or checkbox turns into the tint mark.
 *  `icon` puts a 40 px tint tile in front of the text, `badge` a small pill next to the title. With `href` the row
 *  is a link with a chevron instead of a control. */
function SelectorItem({
  leading,
  icon,
  title,
  badge,
  badgeColor = "green",
  description,
  control,
  controlPosition = "trailing",
  selected = false,
  href,
  onSelect,
  layout = "card",
  metadata,
  action,
  helper,
  error,
  announceError,
  className,
}: {
  leading?: ReactNode
  /** Icon in a 40 px tint-indigo tile, in front of the text (no rim). Ignored when `leading` is set. */
  icon?: ReactNode
  title: ReactNode
  /** Small pill next to the title, for example "Recommended". */
  badge?: ReactNode
  badgeColor?: BadgeColor
  description?: ReactNode
  /** The RadioGroupItem, Checkbox or Switch of the row. Not needed (and ignored) when `href` is set. */
  control?: ReactNode
  /** Which side of the label the control sits on. */
  controlPosition?: "leading" | "trailing"
  /** `card` is the bordered row; `inline` is a 24 px row without border or padding. */
  layout?: "card" | "inline"
  /** Short secondary text next to the control (a price, a count). Not interactive. */
  metadata?: ReactNode
  /** Secondary action beside the row. Rendered outside the label; clicking it never toggles the control. */
  action?: ReactNode
  /** Hint text below the row. */
  helper?: ReactNode
  /** Error text below the row; marks the control invalid. It is linked with aria-describedby, so a screen reader reads it when the control gets focus. */
  error?: ReactNode
  /** Announce the error at once (`role="alert"`). Set it only for an error that appears after an action such as a failed submit; leave it off for an error that is already there when the page loads, or it is read twice. */
  announceError?: boolean
  /** Shows the selected look without a checked control, for example the current choice of a link list. A checked control does it on its own. */
  selected?: boolean
  /** Link mode: the whole row is an anchor with a trailing chevron and no control. */
  href?: string
  /** Link mode: called on click. Without a real `href` the click does not jump to "#". */
  onSelect?: () => void
  className?: string
}) {
  const group = useContext(SelectorItemGroupContext)
  const titleId = useId()
  const descriptionId = useId()
  const helperId = useId()
  const errorId = useId()
  const inline = layout === "inline"
  const leadingControl = controlPosition === "leading"
  // On the tint/red surface muted-foreground drops under AA in dark (3.9:1); text-secondary keeps 6.9:1.
  const errorCard = Boolean(error) && !inline

  let named: ReactNode = control
  if (isValidElement<Record<string, unknown>>(control)) {
    const props = control.props
    const brings = props["aria-label"] != null || props["aria-labelledby"] != null
    const ids = [
      brings ? undefined : description ? descriptionId : undefined,
      helper ? helperId : undefined,
      error ? errorId : undefined,
    ].filter(Boolean) as string[]
    const own = props["aria-describedby"] as string | undefined
    const patch: Record<string, unknown> = {}
    if (!brings) patch["aria-labelledby"] = titleId
    if (own) patch["aria-describedby"] = own
    else if (ids.length) patch["aria-describedby"] = ids.join(" ")
    if (error && props["aria-invalid"] == null) patch["aria-invalid"] = true
    if (Object.keys(patch).length) named = cloneElement(control, patch)
  }

  const controlSlot = (
    <span data-slot="selector-item-control" className="shrink-0">
      {named}
    </span>
  )

  const leadingContent =
    leading ??
    (icon ? (
      <span data-slot="selector-item-icon" className="grid size-10 place-items-center rounded-md bg-tint-indigo text-tint-text-indigo [&_svg]:size-5">
        {icon}
      </span>
    ) : null)

  const titleEl = <span id={titleId} className="truncate text-sm font-medium text-foreground">{title}</span>

  const text = (
    <span className={cn("flex min-w-0 flex-col", inline ? "gap-0.5" : "gap-1")}>
      {badge ? (
        <span className="flex min-w-0 items-center gap-2">
          {titleEl}
          <Badge color={badgeColor} badgeStyle="light" shape="pill" className="shrink-0">
            {badge}
          </Badge>
        </span>
      ) : (
        titleEl
      )}
      {description && <span id={descriptionId} data-slot="selector-item-description" className={cn("truncate text-sm text-muted-foreground", SELECTED_SECONDARY, errorCard && "text-text-secondary")}>{description}</span>}
    </span>
  )

  // The leading slot is at least 32 px wide and centres its content, so icons, tiles and avatars of different sizes
  // share one centre line and the text starts at the same x in every row.
  const leadingSlot = leadingContent ? (
    <span data-slot="selector-item-leading" className={cn("flex min-h-8 min-w-8 shrink-0 items-center justify-center", !inline && (icon && leading === undefined ? "-me-1" : "-me-2"))}>
      {leadingContent}
    </span>
  ) : null

  return (
    <div data-slot="selector-item" data-layout={layout} data-control-position={controlPosition} className="flex flex-col gap-1">
      <div
        data-slot="selector-item-row"
        data-selected={selected || undefined}
        className={cn(
          "group/selector-item-row flex items-center",
          !inline && [
            "rounded-lg border border-border bg-card",
            "transition-[border-color,box-shadow,background-color] duration-fast ease-move hover:bg-bg-page",
            "has-[label:active]:bg-subtle",
            SURFACE,
            AVATAR_TEXT,
            // Selected: the indigo tint surface and a 1.5 px tint-text rim; hover keeps it. The mark of the control turns tint too.
            SELECTED_SURFACE,
            SELECTED_MARK,
            "has-[label_[data-disabled]]:cursor-not-allowed has-[label_[data-disabled]]:opacity-40 has-[label_[data-disabled]]:hover:bg-card",
          ],
          inline && "min-h-6 has-[label_[data-disabled]]:cursor-not-allowed has-[label_[data-disabled]]:opacity-40",
          // Error: red border plus the tint/red surface; hover and pressed keep it, disabled wins.
          (errorCard || (group.invalid && !inline)) &&
            "border-destructive/60 bg-tint-red hover:bg-tint-red has-[label:active]:bg-tint-red has-[label_[data-disabled]]:bg-card [--surface:var(--tint-red)] hover:[--surface:var(--tint-red)] has-[label:active]:[--surface:var(--tint-red)] has-[label_[data-disabled]]:[--surface:var(--card)]",
          selected && !inline && "border-[1.5px] border-primary bg-tint-indigo dark:border-tint-text-indigo hover:bg-tint-indigo [--surface:var(--tint-indigo)] hover:[--surface:var(--tint-indigo)]",
          className
        )}
      >
        {href !== undefined ? (
          <a
            data-slot="selector-item-label"
            href={href}
            onClick={(event) => {
              // Without a real href the row is an action: no jump to "#".
              if (href === "" || href === "#") event.preventDefault()
              onSelect?.()
            }}
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-4 rounded-[inherit] px-3 py-4 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-(color:--indigo-300)"
          >
            <span className="flex min-w-0 items-center gap-4">
              {leadingSlot}
              {text}
            </span>
            <span className="flex shrink-0 items-center gap-4">
              {metadata && <span data-slot="selector-item-metadata" className="text-sm text-muted-foreground tabular-nums">{metadata}</span>}
              <Icon name="chevronRight" aria-hidden className="size-4 text-text-tertiary" />
            </span>
          </a>
        ) : (
          <label
            data-slot="selector-item-label"
            className={cn(
              "flex min-w-0 flex-1 cursor-pointer items-center rounded-[inherit]",
              inline ? "min-h-6 gap-2" : "justify-between gap-4 px-3 py-4"
            )}
          >
            <span className={cn("flex min-w-0 items-center", inline ? "gap-2" : "gap-4")}>
              {leadingControl && controlSlot}
              {leadingSlot}
              {text}
            </span>
            {(metadata || !leadingControl) && (
              <span className="flex shrink-0 items-center gap-4">
                {metadata && <span data-slot="selector-item-metadata" className={cn("text-sm text-muted-foreground tabular-nums", SELECTED_SECONDARY, errorCard && "text-text-secondary")}>{metadata}</span>}
                {!leadingControl && controlSlot}
              </span>
            )}
          </label>
        )}
        {action && (
          <span data-slot="selector-item-action" className={cn("flex shrink-0 items-center", inline ? "ps-2" : "pe-3")}>
            {action}
          </span>
        )}
      </div>
      {helper && (
        <p id={helperId} data-slot="selector-item-helper" className={cn("text-sm text-muted-foreground text-pretty", !inline && "px-1")}>
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} data-slot="selector-item-error" role={announceError ? "alert" : undefined} className={cn("text-sm text-text-error text-pretty", !inline && "px-1")}>
          {error}
        </p>
      )}
    </div>
  )
}

type SelectorItemGroupProps = {
  children: ReactNode
  className?: string
  /** Radio mode: the chosen value. Setting any of `value`, `onValueChange`, `name`, `required`, `disabled`, `invalid` or `error` turns the group into a radiogroup. */
  value?: string
  onValueChange?: (value: string) => void
  /** Name of the group in a form: the chosen value is submitted under it (the radios carry hidden inputs). */
  name?: string
  /** A choice is required before the form can be submitted (`aria-required`, and native validation on submit). */
  required?: boolean
  /** Disables every row in the group. Disabled rows are skipped by the arrow keys. */
  disabled?: boolean
  /** Marks the group invalid (`aria-invalid`) and gives the rows that are not chosen the error tint. Implied by `error`. */
  invalid?: boolean
  /** Error message under the list; marks the group invalid and is linked with `aria-describedby`. Announced when it appears. */
  error?: ReactNode
  /** Names the radiogroup. Give this or `aria-labelledby`, or wrap the group in a fieldset with a legend. */
  "aria-label"?: string
  /** Names the radiogroup by another element, for example a heading. */
  "aria-labelledby"?: string
  /** Extra description, for example the id of a hint. The error message is added to it. */
  "aria-describedby"?: string
}

/**
 * Stacks SelectorItems. Without group props it is a plain list. With `value`, `onValueChange`, `name`, `required`,
 * `disabled`, `invalid` or `error` it is a radiogroup: arrow keys move focus and choose, the group is one tab stop and
 * disabled rows are skipped. An `error` is shown under the list with `role="alert"`.
 */
function SelectorItemGroup({
  children,
  className,
  value,
  onValueChange,
  name,
  required,
  disabled,
  invalid,
  error,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}: SelectorItemGroupProps) {
  const errorId = useId()
  const hasError = error !== undefined && error !== null && error !== false && error !== ""
  const isInvalid = Boolean(invalid) || hasError
  const radioMode =
    value !== undefined || onValueChange !== undefined || name !== undefined || required !== undefined || disabled !== undefined || invalid !== undefined || hasError
  const context = useMemo(() => ({ invalid: isInvalid }), [isInvalid])
  if (!radioMode) {
    return <div data-slot="selector-item-group" className={cn("flex flex-col gap-2", className)}>{children}</div>
  }
  const describedBy = [ariaDescribedby, hasError ? errorId : undefined].filter(Boolean).join(" ") || undefined
  const radios = (
    <SelectorItemGroupContext.Provider value={context}>
      <RadioGroup
        data-slot="selector-item-group"
        value={value}
        onValueChange={(v) => onValueChange?.(String(v))}
        name={name}
        required={required}
        disabled={disabled}
        invalid={isInvalid}
        // Only defined names are passed, so a fieldset legend that names the group is not overwritten with undefined.
        {...(ariaLabel ? { "aria-label": ariaLabel } : null)}
        {...(ariaLabelledby ? { "aria-labelledby": ariaLabelledby } : null)}
        {...(describedBy ? { "aria-describedby": describedBy } : null)}
        className={cn("flex flex-col gap-2", className)}
      >
        {children}
      </RadioGroup>
    </SelectorItemGroupContext.Provider>
  )
  if (!hasError) return radios
  return (
    <div data-slot="selector-item-group-field" className="flex w-full min-w-0 flex-col gap-2">
      {radios}
      <p id={errorId} data-slot="selector-item-group-error" role="alert" className="px-1 text-sm text-text-error text-pretty">
        {error}
      </p>
    </div>
  )
}

export { SelectorItem, SelectorItemGroup }
export type { SelectorItemGroupProps }
