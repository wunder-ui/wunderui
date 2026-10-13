"use client"

import type * as React from "react"
import { Combobox as ComboboxPrimitive, type ComboboxItemCollection } from "@base-ui/react/combobox"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/** A group of items: `{ items }` plus any fields of your own (e.g. a label). */
type ComboboxItemGroup<Item> = { readonly items: readonly Item[]; readonly [key: string]: unknown }

type ComboboxProps<Value, Multiple extends boolean | undefined = false, Item = Value> = Omit<
  ComboboxPrimitive.Root.Props<Value, Multiple, Item>,
  "items" | "onValueChange"
> & {
  /**
   * The items to list: a flat array, an array of groups (`{ items }`), or a
   * collection from Base UI's `Combobox.createItems()`. A flat array or groups
   * type `Value`.
   */
  items?: readonly Value[] | readonly ComboboxItemGroup<Value>[] | ComboboxItemCollection<Item, Value> | undefined
  /**
   * Called with the new selection. In single mode it is `null` when the
   * selection is cleared, so keep the state as `useState<Value | null>`.
   */
  onValueChange?:
    | ((
        value: Multiple extends true ? Value[] : Value | null,
        eventDetails: ComboboxPrimitive.Root.ChangeEventDetails
      ) => void)
    | undefined
}

/**
 * Generic like Base UI's root: `Value` is inferred from `items`, `value`,
 * `defaultValue` or the item callbacks, so `onValueChange`,
 * `itemToStringLabel`, `itemToStringValue` and `isItemEqualToValue` are typed
 * from usage. `multiple` switches the value to `Value[]`.
 */
function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>(
  props: ComboboxProps<Value, Multiple, Item>
): React.JSX.Element
/**
 * Backward compatible: a handler that does not take `null` (e.g. the setter of
 * a `useState<string>`) still compiles. It does receive `null` when the
 * selection is cleared — widen the state to `Value | null` when you can.
 */
function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>(
  props: Omit<ComboboxProps<Value, Multiple, Item>, "onValueChange"> & {
    onValueChange?: ((value: Multiple extends true ? Value[] : Value, eventDetails: ComboboxPrimitive.Root.ChangeEventDetails) => void) | undefined
  }
): React.JSX.Element
function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>({
  items,
  onValueChange,
  ...props
}: ComboboxProps<Value, Multiple, Item>) {
  return (
    <ComboboxPrimitive.Root<Value, Multiple, Item>
      data-slot="combobox"
      {...props}
      items={items}
      onValueChange={onValueChange as ComboboxPrimitive.Root.Props<Value, Multiple, Item>["onValueChange"]}
    />
  )
}

function ComboboxInputGroup({ className, ...props }: ComboboxPrimitive.InputGroup.Props) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      className={cn(
        "flex h-(--field-md) w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-sm transition-colors duration-fast ease-entrance has-[input:focus-visible]:border-ring",
        className
      )}
      {...props}
    />
  )
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn("h-full flex-1 border-none bg-transparent p-0 text-sm text-foreground outline-none", className)}
      {...props}
    />
  )
}

function ComboboxTrigger({ className, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      aria-label="Show options"
      className={cn("flex shrink-0 items-center justify-center text-text-tertiary", className)}
      {...props}
    >
      <ChevronDown className="size-4" />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxPortal({ ...props }: ComboboxPrimitive.Portal.Props) {
  return <ComboboxPrimitive.Portal {...props} />
}

function ComboboxPopup({ className, children, ...props }: ComboboxPrimitive.Popup.Props) {
  return (
    <ComboboxPortal>
      <ComboboxPrimitive.Positioner className="isolate z-50 outline-none" sideOffset={4}>
        <ComboboxPrimitive.Popup
          data-slot="combobox-popup"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-48 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            className
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPortal>
  )
}

function ComboboxList({ ...props }: ComboboxPrimitive.List.Props) {
  return <ComboboxPrimitive.List data-slot="combobox-list" {...props} />
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn("px-2 py-4 text-center text-sm text-text-tertiary", className)}
      {...props}
    />
  )
}

function ComboboxGroup({ ...props }: ComboboxPrimitive.Group.Props) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" {...props} />
}

function ComboboxGroupLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
      <span className="absolute right-2 flex items-center justify-center">
        <ComboboxPrimitive.ItemIndicator>
          <Check className="size-4" />
        </ComboboxPrimitive.ItemIndicator>
      </span>
    </ComboboxPrimitive.Item>
  )
}

export type { ComboboxProps, ComboboxItemGroup }
export {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxPopup,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
}
