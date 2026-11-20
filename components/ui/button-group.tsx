"use client"

import * as React from "react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type ButtonGroupShape = "rounded" | "pill"
type ButtonGroupOrientation = "horizontal" | "vertical"

/** aria-orientation is only valid on these roles (WAI-ARIA 1.2); on the default
 *  role="group" it is an axe violation, so the stacking lives in data-orientation. */
const ORIENTED_ROLES = new Set(["radiogroup", "toolbar", "listbox", "menu", "menubar", "tablist", "tree", "treegrid"])

function ButtonGroup({
  shape = "rounded",
  orientation = "horizontal",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  shape?: ButtonGroupShape
  /** "horizontal" puts the buttons in a row, "vertical" stacks them with shared edges. */
  orientation?: ButtonGroupOrientation
}) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-shape={shape}
      data-orientation={orientation}
      aria-orientation={orientation === "vertical" && props.role && ORIENTED_ROLES.has(props.role) ? "vertical" : undefined}
      className={cn(
        "inline-flex data-[orientation=vertical]:flex-col",
        "[&>*]:rounded-none [&>*]:focus-visible:z-10",
        // The buttons share one edge: the next one overlaps the border of the previous by 1 px.
        "data-[orientation=horizontal]:[&>*:not(:first-child)]:-ms-px data-[orientation=vertical]:[&>*:not(:first-child)]:-mt-px",
        // Only the two outer ends are rounded: left and right in a row, top and bottom in a stack.
        "data-[orientation=horizontal]:data-[shape=rounded]:[&>*:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-s-md data-[orientation=horizontal]:data-[shape=rounded]:[&>*:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-e-md",
        "data-[orientation=horizontal]:data-[shape=pill]:[&>*:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-s-full data-[orientation=horizontal]:data-[shape=pill]:[&>*:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-e-full",
        "data-[orientation=vertical]:data-[shape=rounded]:[&>*:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-t-md data-[orientation=vertical]:data-[shape=rounded]:[&>*:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-b-md",
        "data-[orientation=vertical]:data-[shape=pill]:[&>*:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-t-xl data-[orientation=vertical]:data-[shape=pill]:[&>*:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

type SplitButtonSize = "sm" | "md" | "lg" | "xl" | "2xl"

/** Width of the menu part: as wide as the button is high (a square at every density). */
const SPLIT_MENU_WIDTH: Record<SplitButtonSize, string> = {
  sm: "w-(--control-sm)",
  md: "w-(--control-md)",
  lg: "w-(--control-lg)",
  xl: "w-(--control-xl)",
  "2xl": "w-(--control-2xl)",
}

/**
 * Button / Split has no focus ring (Owner rule 30.10.2026). Every ring class of the Button
 * is replaced, so keyboard focus shows only through the hover and pressed fills below.
 */
const SPLIT_NO_RING =
  "focus-visible:outline-none! focus-visible:outline-0! focus-visible:outline-offset-0! focus-visible:outline-transparent!"

/** Hover, pressed and open fills per part (plain: hover = bg-page, pressed and open = bg-subtle). */
const SPLIT_VARIANT: Record<"plain" | "solid", { variant: "plain" | "primary"; part: string; menu: string }> = {
  plain: {
    variant: "plain",
    part:
      "focus-visible:border-border-control! hover:bg-bg-page focus-visible:bg-bg-page active:bg-bg-subtle " +
      "active:not-aria-[haspopup]:scale-100",
    menu: "data-popup-open:bg-bg-subtle data-popup-open:hover:bg-bg-subtle",
  },
  solid: {
    variant: "primary",
    part:
      "focus-visible:border-primary! focus-visible:bg-(--brand-700) " +
      "active:not-aria-[haspopup]:scale-100",
    // The divider is white at 30 % on the primary fill, the same hue family as the label.
    menu: "border-s-primary-foreground/30 data-popup-open:bg-(--brand-800) data-popup-open:border-(color:--brand-800)",
  },
}

/** The props of the menu popup (the DropdownMenu content), without its children. */
type SplitButtonMenuProps = Omit<React.ComponentProps<typeof DropdownMenuContent>, "children">

type SplitButtonProps = Omit<React.ComponentProps<typeof Button>, "variant" | "shape" | "size" | "children" | "onClick"> & {
  /** "plain" (default) is a white button with a border, "solid" the primary fill. */
  variant?: "plain" | "solid"
  /**
   * Same sizes as the Button. The Figma "Medium 40" is `size="lg"`; the default stays the
   * Button default `md`.
   */
  size?: SplitButtonSize
  shape?: ButtonGroupShape
  /** Disables both parts. */
  disabled?: boolean
  /** The label of the action part. */
  children?: React.ReactNode
  /** Leading icon of the action part. Decorative. */
  icon?: React.ReactNode
  /** Runs when the action part is pressed. */
  onAction?: React.MouseEventHandler<HTMLButtonElement>
  /** The entries of the menu: DropdownMenuItem, DropdownMenuSeparator and so on. */
  menu?: React.ReactNode
  /** Accessible name of the menu part. Default "More actions". */
  menuLabel?: string
  /** Props for the menu popup, for example `align`. Default `align="end"`. */
  menuProps?: SplitButtonMenuProps
  /** Controlled open state of the menu. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Class names for the group wrapping both parts. */
  groupClassName?: string
}

/**
 * Figma: Button / Split 2574:154817 — an action part and a menu part (chevron)
 * with a divider between them. Press the action part to run the primary action;
 * the chevron opens a DropdownMenu with the alternatives.
 *
 * Each part has its own hover (plain: bg-page), pressed and open fill (plain:
 * bg-subtle; the menu part stays pressed while its menu is open). There is
 * **no focus ring** by Owner rule (30.10.2026): keyboard focus shows through
 * the hover fill. For a single button that opens a menu use
 * `DropdownMenuTrigger render={<Button />}` (that one keeps the ring).
 *
 * ```tsx
 * <SplitButton onAction={save} menu={<DropdownMenuItem>Save as draft</DropdownMenuItem>}>
 *   Save
 * </SplitButton>
 * ```
 */
function SplitButton({
  variant = "plain",
  size = "md",
  shape = "rounded",
  disabled,
  children,
  icon,
  onAction,
  menu,
  menuLabel = "More actions",
  menuProps,
  open,
  defaultOpen,
  onOpenChange,
  className,
  groupClassName,
  ...props
}: SplitButtonProps) {
  const v = SPLIT_VARIANT[variant]
  return (
    <ButtonGroup shape={shape} data-slot="split-button" data-variant={variant} className={groupClassName}>
      <Button
        data-slot="split-button-action"
        type="button"
        variant={v.variant}
        size={size}
        disabled={disabled}
        onClick={onAction}
        className={cn(SPLIT_NO_RING, v.part, className)}
        {...props}
      >
        {icon && (
          <span aria-hidden className="flex shrink-0">
            {icon}
          </span>
        )}
        {children}
      </Button>
      <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <Button
              data-slot="split-button-menu"
              type="button"
              variant={v.variant}
              size={size}
              aria-label={menuLabel}
              className={cn(SPLIT_NO_RING, v.part, v.menu, "px-0", SPLIT_MENU_WIDTH[size])}
            />
          }
        >
          <Icon name="chevronDown" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" {...menuProps}>
          {menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}

export { ButtonGroup, SplitButton }
export type { ButtonGroupOrientation, ButtonGroupShape, SplitButtonProps, SplitButtonSize }
