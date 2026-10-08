"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDown, Minus, Plus, X } from "lucide-react"
import { cn } from "cn"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  )
}

type AccordionItemVariant = "card" | "divider"

const AccordionItemVariantContext = React.createContext<AccordionItemVariant>("card")

function AccordionItem({
  className,
  variant = "card",
  ...props
}: AccordionPrimitive.Item.Props & { variant?: AccordionItemVariant }) {
  return (
    <AccordionItemVariantContext.Provider value={variant}>
      <AccordionPrimitive.Item
        data-slot="accordion-item"
        className={cn(
          "group/accordion-item transition-colors duration-fast ease-move",
          // Horizontal padding lives on the trigger and the panel, not here, so
          // the hover fill of a row reaches the full width of the item.
          // The Figma focused state tints the container, not just the control:
          // a card takes an indigo border, a divider row a subtle fill.
          variant === "card" &&
            "overflow-hidden rounded-lg border border-border bg-card has-[:focus-visible]:border-ring",
          // Without a frame there is nothing to fill: a divider list sits on
          // whatever is behind it.
          variant === "divider" &&
            "border-b border-border first:border-t has-[:focus-visible]:bg-muted",
          "has-data-[disabled]:opacity-50",
          className
        )}
        {...props}
      />
    </AccordionItemVariantContext.Provider>
  )
}

/** "button" = +/− inside a bordered box, "plus" = bare + morphing to ×,
 *  "chevron" = a chevron that flips on open. */
type AccordionIndicatorVariant = "button" | "plus" | "chevron"
type AccordionIndicatorPosition = "leading" | "trailing"
/** A leading icon sits either in its own bordered box or bare next to the label. */
type AccordionIconVariant = "box" | "plain"

function AccordionIndicator({ variant }: { variant: AccordionIndicatorVariant }) {
  if (variant === "chevron") {
    return (
      <ChevronDown
        className="size-5 shrink-0 text-foreground transition-transform duration-base ease-move group-data-[panel-open]/accordion-trigger:rotate-180"
        aria-hidden
      />
    )
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center text-foreground",
        variant === "button" &&
          "size-5 rounded-md border border-border bg-card shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)]"
      )}
      aria-hidden
    >
      <Plus
        className={cn(
          variant === "button" ? "size-2.5" : "size-4",
          "group-data-[panel-open]/accordion-trigger:hidden"
        )}
      />
      {variant === "button" ? (
        <Minus className="hidden size-2.5 group-data-[panel-open]/accordion-trigger:block" />
      ) : (
        <X className="hidden size-4 group-data-[panel-open]/accordion-trigger:block" />
      )}
    </span>
  )
}

function AccordionTrigger({
  className,
  children,
  icon,
  iconVariant = "box",
  indicatorVariant = "button",
  indicatorPosition = "trailing",
  ...props
}: AccordionPrimitive.Trigger.Props & {
  /** Optional leading decorative icon. */
  icon?: React.ReactNode
  /** "box" puts the leading icon in a bordered square, "plain" renders it bare. */
  iconVariant?: AccordionIconVariant
  /** The open/close affordance: bordered +/− button, bare +/×, or a chevron. */
  indicatorVariant?: AccordionIndicatorVariant
  /** Where that affordance sits relative to the label. */
  indicatorPosition?: AccordionIndicatorPosition
}) {
  const itemVariant = React.useContext(AccordionItemVariantContext)

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-center gap-4 px-4 py-3 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
          // Only the row itself lights up — never the answer it revealed.
          "transition-colors duration-fast ease-move hover:bg-muted data-disabled:hover:bg-transparent",
          itemVariant === "divider" && "py-4",
          className
        )}
        {...props}
      >
        {icon &&
          (iconVariant === "box" ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)]">
              <span className="[&_svg]:size-5">{icon}</span>
            </span>
          ) : (
            <span className="flex shrink-0 items-center justify-center text-foreground [&_svg]:size-5">
              {icon}
            </span>
          ))}
        {indicatorPosition === "leading" && <AccordionIndicator variant={indicatorVariant} />}
        <span className="flex-1 text-sm font-medium text-foreground">{children}</span>
        {indicatorPosition === "trailing" && <AccordionIndicator variant={indicatorVariant} />}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden text-sm text-text-secondary transition-[height] duration-base ease-entrance data-[ending-style]:h-0 data-[starting-style]:h-0",
        className
      )}
      {...props}
    >
      <div className="px-4 pb-4">{children}</div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
