"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon-provider"
import { Spinner } from "@/components/ui/spinner"

/**
 * A menu of actions: an entry does something and the menu closes. Not for
 * picking a value in a form (use Select) and not for links to pages (use a
 * disclosure such as the Navbar mega menu).
 *
 * Disabled entries stay focusable but cannot be activated (WAI-ARIA APG, and
 * what Base UI does): arrow keys still reach them, so screen reader users
 * learn the action exists.
 */
function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

/**
 * Motion is a transition, not a keyframe animation, so a menu closed halfway
 * through opening reverses smoothly. It grows from the trigger
 * (`--transform-origin`), slides in from the side it opened on, and closes a
 * step faster than it opens. Keyboard-opened submenus (`data-instant`) skip it.
 */
const POPUP_MOTION =
  "transition-[opacity,scale,translate] duration-fast ease-entrance motion-reduce:transition-none " +
  "data-starting-style:opacity-0 data-starting-style:scale-(--scale-enter) " +
  "data-ending-style:opacity-0 data-ending-style:scale-(--scale-enter) data-ending-style:duration-fast data-ending-style:ease-exit " +
  "data-[side=bottom]:data-starting-style:-translate-y-(--travel-sm) data-[side=top]:data-starting-style:translate-y-(--travel-sm) " +
  "data-[side=inline-end]:data-starting-style:-translate-x-(--travel-sm) data-[side=right]:data-starting-style:-translate-x-(--travel-sm) " +
  "data-[side=inline-start]:data-starting-style:translate-x-(--travel-sm) data-[side=left]:data-starting-style:translate-x-(--travel-sm) " +
  "data-closed:pointer-events-none data-instant:transition-none"

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  submenu = false,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    /** Submenus are smaller, so they open a step faster (duration-fast). */
    submenu?: boolean
  }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        // A menu whose trigger scrolled out of its container hides instead of floating.
        className="isolate z-50 outline-none data-anchor-hidden:invisible"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            // As wide as its longest entry (a menu, not a select); never taller than the room left.
            "z-50 [--surface:var(--popover)] max-h-[max(0px,var(--available-height))] w-max min-w-32 has-[[data-slot=dropdown-menu-item][aria-describedby]]:min-w-64 max-w-[min(20rem,var(--available-width))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            // 2 px between two entries (owner rule, 10 Nov 2026), so a hovered, focused or checked row never touches the next one.
            "[&_[role^=menuitem]+[role^=menuitem]]:mt-0.5",
            POPUP_MOTION,
            submenu ? "duration-fast shadow-lg" : "duration-base",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

/**
 * Set by DropdownMenuGroup and DropdownMenuRadioGroup so a label knows whether
 * it can use Base UI's GroupLabel — which throws outside a group — or has to
 * fall back to a plain heading.
 */
const DropdownMenuGroupContext = React.createContext(false)

function DropdownMenuGroup({ children, ...props }: MenuPrimitive.Group.Props) {
  return (
    <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props}>
      <DropdownMenuGroupContext.Provider value>{children}</DropdownMenuGroupContext.Provider>
    </MenuPrimitive.Group>
  )
}

const DROPDOWN_LABEL_CLASSES = "px-2 py-1.5 text-xs font-medium text-muted-foreground data-inset:ps-7"

/**
 * A section heading inside a menu. Inside a group it becomes the group's
 * accessible name; on its own it is a plain heading, so it can never crash
 * a menu that is not grouped.
 */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  const inGroup = React.useContext(DropdownMenuGroupContext)
  if (!inGroup) {
    const { render: _render, ...rest } = props
    return (
      <div
        data-slot="dropdown-menu-label"
        data-inset={inset || undefined}
        className={cn(DROPDOWN_LABEL_CLASSES, typeof className === "string" ? className : undefined)}
        {...(rest as React.ComponentProps<"div">)}
      />
    )
  }
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(DROPDOWN_LABEL_CLASSES, className)}
      {...props}
    />
  )
}

/**
 * Row styles shared by every entry type. The highlight moves instantly (arrow
 * keys and type-ahead are rapid-fire). A checked or selected entry is neutral
 * (owner rule, 13 Nov 2026): no tint fill and no coloured text, only its check
 * or dot marks it, like the options of Select and Combobox.
 */
const ITEM_BASE =
  "relative flex cursor-default items-center gap-2 rounded-md px-2 py-(--menu-item-py) text-label-sm font-medium outline-hidden select-none " +
  "focus:bg-bg-page focus:text-foreground active:bg-bg-subtle data-inset:ps-7 " +
  "data-disabled:text-text-tertiary data-disabled:focus:bg-bg-page data-disabled:focus:text-text-tertiary " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  icon,
  avatar,
  description,
  children,
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  /** Destructive entries also say it in the label ("Delete project"), never by colour alone. */
  variant?: "default" | "destructive"
  /** Leading icon; decorative, hidden from assistive technology. */
  icon?: React.ReactNode
  /**
   * Leading avatar, for an entry that stands for a person or a workspace
   * (`<Avatar size="sm">…</Avatar>`, 24 px). It sits where the icon would and takes its
   * place when both are set; the row stays 32 px. Decorative, hidden from assistive
   * technology, so the label has to name the entry.
   */
  avatar?: React.ReactNode
  /** A second line under the label. The label names the entry, the line describes it. */
  description?: React.ReactNode
}) {
  const id = React.useId()
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      aria-labelledby={description ? labelId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "group/dropdown-menu-item",
        ITEM_BASE,
        "not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:*:[svg]:text-destructive",
        description && "items-start",
        className
      )}
      {...props}
    >
      {avatar ? (
        // A 24 px avatar in the 20 px text line: the negative margin keeps the row at 32 px.
        <span aria-hidden data-slot="dropdown-menu-item-avatar" className={cn("flex shrink-0", description ? "mt-0.5" : "-my-0.5")}>
          {avatar}
        </span>
      ) : (
        icon && (
          <span aria-hidden className={cn("flex shrink-0", description && "mt-0.5")}>
            {icon}
          </span>
        )
      )}
      {description ? (
        <>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span id={labelId}>{children}</span>
            <span id={descriptionId} className="text-xs font-normal text-text-tertiary group-focus/dropdown-menu-item:text-accent-foreground/80">
              {description}
            </span>
          </span>
        </>
      ) : (
        children
      )}
    </MenuPrimitive.Item>
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

/**
 * Opens its submenu on hover after 100 ms (Base UI's safe polygon keeps it
 * open on the diagonal way over) or instantly with → / Enter.
 */
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      delay={100}
      className={cn(
        ITEM_BASE,
        "focus:**:text-accent-foreground data-popup-open:bg-bg-page data-popup-open:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <Icon name="chevronRight" aria-hidden className="ms-auto rtl:rotate-180" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -5,
  side = "inline-end",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      // No gap between entry and submenu: an unbridged offset is its own version of the diagonal bug.
      submenu
      className={className}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

/** The check confirms instantly: opacity and scale, duration-instant. */
// keepMounted leaves the unchecked indicators in the DOM (so they can animate in): hide them while unchecked
const INDICATOR_MOTION =
  "transition-[opacity,scale] duration-instant ease-entrance motion-reduce:transition-none data-starting-style:scale-50 data-starting-style:opacity-0 data-ending-style:opacity-0 data-unchecked:scale-50 data-unchecked:opacity-0"

/**
 * A menu entry that toggles an option. Base UI only knows a boolean `checked`, so the
 * mixed state is built here: with `indeterminate` the entry reports `aria-checked="mixed"`
 * and shows a dash instead of the check (Figma: Dropdown Item, Checkbox, Mixed).
 *
 * `indeterminate` is controlled: a click still calls `onCheckedChange(true)`, the
 * entry becomes checked as soon as the parent drops `indeterminate` (for "Select all":
 * all items on, `indeterminate` off).
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  indeterminate,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
  /** The mixed state (some, not all). Shows a dash and `aria-checked="mixed"`; ignores `checked`. */
  indeterminate?: boolean
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      data-indeterminate={indeterminate ? "" : undefined}
      className={cn(ITEM_BASE, "pe-8 focus:**:text-accent-foreground", className)}
      checked={indeterminate ? false : checked}
      {...props}
      {...(indeterminate ? { "aria-checked": "mixed" as const } : null)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator keepMounted className={INDICATOR_MOTION}>
          <Icon name="check" />
        </MenuPrimitive.CheckboxItemIndicator>
        <Icon
          name="minus"
          data-slot="dropdown-menu-checkbox-item-mixed"
          className={cn(
            "absolute transition-[opacity,scale] duration-instant ease-entrance motion-reduce:transition-none",
            indeterminate ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ children, ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props}>
      <DropdownMenuGroupContext.Provider value>{children}</DropdownMenuGroupContext.Provider>
    </MenuPrimitive.RadioGroup>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(ITEM_BASE, "pe-8 focus:**:text-accent-foreground", className)}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator keepMounted className={INDICATOR_MOTION}>
          <Icon name="check" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

/**
 * The visible shortcut hint. Hidden from assistive technology so the entry is
 * named "Copy", not "Copy ⌘C"; put the machine-readable binding on the entry
 * with `aria-keyshortcuts="Meta+C"`.
 */
function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ms-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * Shown while the entries load. A status line, not an entry: arrow keys never
 * land on it. Set `aria-busy` on DropdownMenuContent while it is visible.
 */
function DropdownMenuLoading({ className, children = "Loading…", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      data-slot="dropdown-menu-loading"
      className={cn("flex items-center gap-2 px-2 py-2 text-label-sm text-text-tertiary", className)}
      {...props}
    >
      <Spinner className="size-4" />
      {children}
    </div>
  )
}

/** Shown when there is nothing to act on, so the menu is never an empty dead end. */
function DropdownMenuEmpty({ className, children = "Nothing here yet", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-empty"
      className={cn("px-2 py-4 text-center text-label-sm text-text-tertiary", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLoading,
  DropdownMenuEmpty,
}
