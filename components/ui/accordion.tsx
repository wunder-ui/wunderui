"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDown, Minus, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

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
          // The hover fill belongs to the whole item: an open item lights up
          // completely (title and answer), a closed one is only its title row.
          // The trigger itself stays transparent, so the two never stack.
          "hover:bg-muted/50 has-data-[disabled]:hover:bg-transparent",
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
        data-icon={icon ? iconVariant : undefined}
        data-indicator={indicatorVariant}
        data-indicator-position={indicatorPosition}
        className={cn(
          "group/accordion-trigger flex flex-1 items-center gap-4 px-4 py-3 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
          // The hover fill sits on the item (see AccordionItem), not on the row.
          "transition-colors duration-fast ease-move",
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
  // Opens and closes on grid-template-rows 0fr ↔ 1fr instead of height: the
  // single row follows the content, so nothing has to be measured, and the
  // frames match the old height transition. The clip sits on the row's child;
  // the padding one level further in, so it shrinks away with the content.
  // The text starts where the label starts: the trigger tells (data-icon,
  // data-indicator, data-indicator-position) what sits before and after the
  // label, and the item's group variants turn that into the three indent
  // variables below. Pure CSS, so there is no layout shift on first paint.
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "grid grid-rows-[1fr] text-sm text-text-secondary transition-[grid-template-rows] duration-base ease-entrance data-[ending-style]:grid-rows-[0fr] data-[starting-style]:grid-rows-[0fr]",
        // leading icon: box 2.5rem or bare 1.25rem, plus the 1rem gap
        "group-has-[[data-icon=box]]/accordion-item:[--acc-icon:3.5rem] group-has-[[data-icon=plain]]/accordion-item:[--acc-icon:2.25rem]",
        // leading indicator: +/− box and chevron are 1.25rem, the bare +/× is 1rem, plus the 1rem gap
        "group-has-[[data-indicator-position=leading][data-indicator=button]]/accordion-item:[--acc-lead:2.25rem] group-has-[[data-indicator-position=leading][data-indicator=chevron]]/accordion-item:[--acc-lead:2.25rem] group-has-[[data-indicator-position=leading][data-indicator=plus]]/accordion-item:[--acc-lead:2rem]",
        // trailing indicator: the same widths on the other side
        "group-has-[[data-indicator-position=trailing][data-indicator=button]]/accordion-item:[--acc-trail:2.25rem] group-has-[[data-indicator-position=trailing][data-indicator=chevron]]/accordion-item:[--acc-trail:2.25rem] group-has-[[data-indicator-position=trailing][data-indicator=plus]]/accordion-item:[--acc-trail:2rem]",
        className
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="pr-[calc(1rem+var(--acc-trail,0rem))] pb-4 pl-[calc(1rem+var(--acc-icon,0rem)+var(--acc-lead,0rem))]">{children}</div>
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
