"use client"

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { cn } from "@/lib/utils"

/**
 * Generic like Base UI's root: `ItemValue` is inferred from `items`, so
 * `filter`, `itemToStringValue` and the list's render function are typed from
 * usage. `value` / `onValueChange` are the input's text (`string`).
 */
function Autocomplete<ItemValue>({ items, ...props }: AutocompletePrimitive.Root.Props<ItemValue>) {
  // Base UI types flat and grouped `items` as two overloads of the same root;
  // at runtime both shapes go through unchanged.
  return (
    <AutocompletePrimitive.Root
      data-slot="autocomplete"
      {...props}
      items={items as readonly ItemValue[] | undefined}
    />
  )
}

function AutocompleteInputGroup({ className, ...props }: AutocompletePrimitive.InputGroup.Props) {
  return (
    <AutocompletePrimitive.InputGroup
      data-slot="autocomplete-input-group"
      className={cn(
        "flex h-(--field-md) w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-sm transition-colors duration-fast ease-entrance has-[input:focus-visible]:border-ring",
        className
      )}
      {...props}
    />
  )
}

function AutocompleteInput({ className, ...props }: AutocompletePrimitive.Input.Props) {
  return (
    <AutocompletePrimitive.Input
      data-slot="autocomplete-input"
      className={cn("h-full min-w-0 flex-1 border-none bg-transparent p-0 text-sm text-foreground outline-none", className)}
      {...props}
    />
  )
}

function AutocompletePortal({ ...props }: AutocompletePrimitive.Portal.Props) {
  return <AutocompletePrimitive.Portal {...props} />
}

function AutocompletePopup({ className, children, ...props }: AutocompletePrimitive.Popup.Props) {
  return (
    <AutocompletePortal>
      <AutocompletePrimitive.Positioner className="isolate z-50 outline-none" sideOffset={4}>
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-popup"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-48 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            className
          )}
          {...props}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePrimitive.Positioner>
    </AutocompletePortal>
  )
}

function AutocompleteList({ ...props }: AutocompletePrimitive.List.Props) {
  return <AutocompletePrimitive.List data-slot="autocomplete-list" {...props} />
}

function AutocompleteEmpty({ className, ...props }: AutocompletePrimitive.Empty.Props) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={cn("px-2 py-4 text-center text-sm text-text-tertiary empty:hidden", className)}
      {...props}
    />
  )
}

function AutocompleteItem({ className, ...props }: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "flex cursor-default items-center rounded-md py-1.5 px-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Autocomplete,
  AutocompleteInputGroup,
  AutocompleteInput,
  AutocompletePortal,
  AutocompletePopup,
  AutocompleteList,
  AutocompleteEmpty,
  AutocompleteItem,
}
