import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A list row pairing a label/description with a trailing control — pass a
 *  RadioGroupItem, Checkbox, or Switch as `control`. Stack rows inside
 *  SelectorItemGroup for a single bordered list.
 *
 *  The whole row is the control's label, so a click anywhere on it toggles
 *  the control. The border answers the pointer on hover and turns indigo while
 *  the control is checked — the state is read from the control itself, so it
 *  follows a radio group or a controlled checkbox without extra props. */
function SelectorItem({
  leading,
  title,
  description,
  control,
  className,
}: {
  leading?: ReactNode
  title: ReactNode
  description?: ReactNode
  control: ReactNode
  className?: string
}) {
  return (
    <label
      data-slot="selector-item"
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-card px-3 py-4",
        "transition-[border-color,box-shadow] duration-fast ease-move hover:border-primary/40",
        "has-[[data-checked]]:border-primary has-[[data-checked]]:ring-3 has-[[data-checked]]:ring-ring/30",
        "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-60 has-[[data-disabled]]:hover:border-border",
        className
      )}
    >
      <span className="flex min-w-0 items-center gap-4">
        {leading}
        <span className="flex min-w-0 flex-col gap-2">
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
          {description && <span className="truncate text-sm text-muted-foreground">{description}</span>}
        </span>
      </span>
      <span className="shrink-0">{control}</span>
    </label>
  )
}

function SelectorItemGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div data-slot="selector-item-group" className={cn("flex flex-col gap-2", className)}>{children}</div>
}

export { SelectorItem, SelectorItemGroup }
