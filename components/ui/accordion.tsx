"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

type AccordionAppearance = "plain" | "divided" | "contained" | "separated"
type AccordionDensity = "default" | "compact"
type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6

const AccordionRootContext = React.createContext<{
  appearance: AccordionAppearance | undefined
  density: AccordionDensity
  headingLevel: AccordionHeadingLevel
}>({
  appearance: undefined,
  density: "default",
  headingLevel: 3,
})

/** The accordion list. With an appearance it is one of the four listed looks
 *  plain, divided, contained or separated; without one it keeps the legacy
 *  look of spaced cards with a +/− button, so always set it. */
function Accordion({
  className,
  appearance,
  density = "default",
  headingLevel = 3,
  ...props
}: AccordionPrimitive.Root.Props & {
  /** Visual look of the list: `plain`, `divided`, `contained` or `separated`. Without it the list keeps the legacy look (spaced cards with a +/− button), so always set it. */
  appearance?: AccordionAppearance
  /** Row height: `default` is 48 px, `compact` is 36 px. */
  density?: AccordionDensity
  /** Heading level of every trigger, 2 to 6. Defaults to 3. */
  headingLevel?: AccordionHeadingLevel
}) {
  return (
    <AccordionRootContext.Provider value={{ appearance, density, headingLevel }}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        data-appearance={appearance}
        data-density={density}
        className={cn(
          "flex flex-col gap-3",
          (appearance === "plain" || appearance === "divided") && "gap-0",
          appearance === "contained" && "gap-0 overflow-hidden rounded-lg border border-border bg-card",
          appearance === "separated" && "gap-2",
          className
        )}
        {...props}
      />
    </AccordionRootContext.Provider>
  )
}

type AccordionItemVariant = "card" | "divider"

const AccordionItemVariantContext = React.createContext<AccordionItemVariant>("card")

/** One collapsible section of the accordion. */
function AccordionItem({
  className,
  variant,
  ...props
}: AccordionPrimitive.Item.Props & {
  /** Legacy frame of the item: `card` or `divider`. Leave it out when you set `appearance` on the root; the appearance decides. */
  variant?: AccordionItemVariant
}) {
  const { appearance } = React.useContext(AccordionRootContext)
  const resolvedVariant =
    variant ?? (appearance === undefined || appearance === "separated" ? "card" : "divider")

  return (
    <AccordionItemVariantContext.Provider value={resolvedVariant}>
      <AccordionPrimitive.Item
        data-slot="accordion-item"
        className={cn(
          "group/accordion-item transition-colors duration-fast ease-move",
          // The hover fill belongs to the whole item: an open item lights up
          // completely (title and answer), a closed one is only its title row.
          // The trigger itself stays transparent, so the two never stack.
          "hover:bg-bg-page has-data-[disabled]:hover:bg-transparent",
          // Horizontal padding lives on the trigger and the panel, not here, so
          // the hover fill of a row reaches the full width of the item.
          // Keyboard focus draws no frame around the item: the label and the icons of the focused
          // trigger turn indigo (see AccordionTrigger and AccordionIndicator) and the whole item takes a
          // subtle fill, in every appearance, so focus never rests on colour alone.
          "has-[:focus-visible]:bg-muted",
          resolvedVariant === "card" && "overflow-hidden rounded-lg border border-border bg-card",
          // Without a frame there is nothing to fill: a divider list sits on
          // whatever is behind it.
          resolvedVariant === "divider" &&
            "border-b border-border first:border-t",
          // Plain items drop every frame: the hover fill alone shapes the row.
          appearance === "plain" && "border-0 first:border-0 rounded-md",
          // Contained items share the root frame: no internal top/bottom rules.
          appearance === "contained" &&
            "first:border-t-0 last:border-b-0 first:rounded-t-[calc(var(--radius-lg)-1px)] last:rounded-b-[calc(var(--radius-lg)-1px)]",
          "has-data-[disabled]:opacity-40",
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

/** The open/close affordance of a trigger. */
function AccordionIndicator({ variant }: { variant: AccordionIndicatorVariant }) {
  if (variant === "chevron") {
    return (
      <Icon
        name="chevronDown"
        className="size-5 shrink-0 text-foreground transition-[transform,color] duration-base ease-move group-data-[panel-open]/accordion-trigger:rotate-180 group-focus-visible/accordion-trigger:text-tint-text-indigo"
        aria-hidden
      />
    )
  }

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center text-foreground transition-colors duration-fast ease-move group-focus-visible/accordion-trigger:text-tint-text-indigo",
        variant === "button" &&
          "size-5 rounded-md border border-border bg-card shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)]",
        variant === "plus" && "size-4"
      )}
      aria-hidden
    >
      <Icon
        name="plus"
        className={cn(
          variant === "button" ? "size-2.5" : "size-4",
          "absolute inset-0 m-auto transition-[opacity,scale,filter,visibility] duration-fast ease-entrance motion-reduce:transition-[opacity,visibility]",
          "opacity-100 scale-100 blur-none visible group-data-[panel-open]/accordion-trigger:opacity-0 group-data-[panel-open]/accordion-trigger:scale-[0.25] group-data-[panel-open]/accordion-trigger:blur-[4px] group-data-[panel-open]/accordion-trigger:invisible"
        )}
      />
      {variant === "button" ? (
        <Icon
          name="minus"
          className={cn(
            "size-2.5",
            "absolute inset-0 m-auto transition-[opacity,scale,filter,visibility] duration-fast ease-entrance motion-reduce:transition-[opacity,visibility]",
            "opacity-0 scale-[0.25] blur-[4px] invisible group-data-[panel-open]/accordion-trigger:opacity-100 group-data-[panel-open]/accordion-trigger:scale-100 group-data-[panel-open]/accordion-trigger:blur-none group-data-[panel-open]/accordion-trigger:visible"
          )}
        />
      ) : (
        <Icon
          name="close"
          className={cn(
            "size-4",
            "absolute inset-0 m-auto transition-[opacity,scale,filter,visibility] duration-fast ease-entrance motion-reduce:transition-[opacity,visibility]",
            "opacity-0 scale-[0.25] blur-[4px] invisible group-data-[panel-open]/accordion-trigger:opacity-100 group-data-[panel-open]/accordion-trigger:scale-100 group-data-[panel-open]/accordion-trigger:blur-none group-data-[panel-open]/accordion-trigger:visible"
          )}
        />
      )}
    </span>
  )
}

/** The clickable header of an accordion item. */
function AccordionTrigger({
  className,
  children,
  description,
  meta,
  icon,
  iconVariant = "box",
  indicatorVariant,
  indicatorPosition = "trailing",
  headingLevel,
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
  /** Optional second line under the label. */
  description?: React.ReactNode
  /** Trailing content between the label and the open/close indicator. */
  meta?: React.ReactNode
  /** Heading level of this trigger, 2 to 6. Overrides the level set on `Accordion`. */
  headingLevel?: AccordionHeadingLevel
}) {
  const itemVariant = React.useContext(AccordionItemVariantContext)
  const { appearance, density, headingLevel: rootHeadingLevel } = React.useContext(AccordionRootContext)
  const level = headingLevel ?? rootHeadingLevel

  // Without an appearance the current "+/− button" is the default; separated
  // lists take a bare +/×, every other appearance a chevron.
  const resolvedIndicatorVariant =
    indicatorVariant ??
    (appearance === undefined ? "button" : appearance === "separated" ? "plus" : "chevron")

  // Row height: appearances switch to the 48 px / 36 px scale, legacy keeps
  // today's per-variant padding.
  const rowHeightClass =
    appearance !== undefined
      ? density === "compact"
        ? "py-2"
        : "py-3.5"
      : itemVariant === "divider"
        ? "py-4"
        : "py-3"

  return (
    <AccordionPrimitive.Header className="flex" render={React.createElement(`h${level}`)}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        data-icon={icon ? iconVariant : undefined}
        data-indicator={resolvedIndicatorVariant}
        data-indicator-position={indicatorPosition}
        className={cn(
          "group/accordion-trigger flex flex-1 items-center gap-4 px-4 text-start outline-none",
          rowHeightClass,
          // The hover fill sits on the item (see AccordionItem), not on the row.
          "transition-colors duration-fast ease-move",
          className
        )}
        {...props}
      >
        {icon &&
          (iconVariant === "box" ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)] transition-colors duration-fast ease-move group-focus-visible/accordion-trigger:text-tint-text-indigo">
              <span className="[&_svg]:size-5">{icon}</span>
            </span>
          ) : (
            <span className="flex shrink-0 items-center justify-center text-foreground transition-colors duration-fast ease-move [&_svg]:size-5 group-focus-visible/accordion-trigger:text-tint-text-indigo">
              {icon}
            </span>
          ))}
        {indicatorPosition === "leading" && <AccordionIndicator variant={resolvedIndicatorVariant} />}
        {description ? (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-foreground transition-colors duration-fast ease-move group-focus-visible/accordion-trigger:text-tint-text-indigo">{children}</span>
            <span className="text-xs font-normal text-text-secondary">{description}</span>
          </span>
        ) : (
          <span className="flex-1 text-sm font-medium text-foreground transition-colors duration-fast ease-move group-focus-visible/accordion-trigger:text-tint-text-indigo">{children}</span>
        )}
        {meta && (
          <span className="flex shrink-0 items-center gap-2 text-xs font-normal text-text-secondary">
            {meta}
          </span>
        )}
        {indicatorPosition === "trailing" && <AccordionIndicator variant={resolvedIndicatorVariant} />}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/** The collapsible panel that holds an item's answer. */
function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  const itemVariant = React.useContext(AccordionItemVariantContext)
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
        // transition-duration only: the duration-base utility also sets animation-duration, which Base UI reads as a keyframe animation on an open panel
        "grid grid-rows-[1fr] text-sm text-text-secondary transition-[grid-template-rows] [transition-duration:var(--duration-base)] ease-entrance data-[ending-style]:grid-rows-[0fr] data-[starting-style]:grid-rows-[0fr] data-[ending-style]:[transition-duration:var(--duration-fast)] data-[ending-style]:ease-exit",
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
        {/* The trigger already pads its bottom (12 card, 16 divider), so the top
            padding makes up the rest of the 16 px between label and answer. */}
        <div
          className={cn(
            "pe-[calc(1rem+var(--acc-trail,0rem))] pb-4 ps-[calc(1rem+var(--acc-icon,0rem)+var(--acc-lead,0rem))]",
            itemVariant === "divider" ? "pt-0" : "pt-1"
          )}
        >
          {children}
        </div>
      </div>
    </AccordionPrimitive.Panel>
  )
}

type AccordionRowProps = {
  /** Control before the trigger, such as a checkbox or a switch. It stays outside the trigger. */
  leading?: React.ReactNode
  /** Control after the trigger, such as an Edit button. It stays outside the trigger. */
  action?: React.ReactNode
  /** Extra classes for the row. */
  className?: string
  /** The `AccordionTrigger` of the row. */
  children: React.ReactNode
}

/** A row that puts a leading control, the trigger and a trailing action side by side. */
function AccordionRow({ leading, action, className, children }: AccordionRowProps) {
  return (
    <div
      data-slot="accordion-row"
      className={cn(
        "flex items-center",
        leading ? "gap-2 ps-4" : undefined,
        action ? "gap-2 pe-4" : undefined,
        className
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  )
}

type AccordionFeedbackProps = {
  /** Which state the panel shows: `loading`, `empty` or `error`. */
  kind: "loading" | "empty" | "error"
  /** Heading of the empty and error states. */
  title?: React.ReactNode
  /** Supporting line under the title. */
  description?: React.ReactNode
  /** Action under the text, such as a Retry button. */
  action?: React.ReactNode
  /** Text under the skeleton while loading. Defaults to `Loading…`. */
  loadingLabel?: string
  /** Extra classes for the feedback block. */
  className?: string
}

/** A placeholder block for the loading, empty and error states of a panel. */
function AccordionFeedback({
  kind,
  title,
  description,
  action,
  loadingLabel,
  className,
}: AccordionFeedbackProps) {
  if (kind === "loading") {
    return (
      <div
        data-slot="accordion-feedback"
        data-kind="loading"
        role="status"
        aria-busy="true"
        className={cn("flex flex-col gap-0.5", className)}
      >
        <div className="flex flex-col gap-2">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-4/5" />
          <Skeleton className="h-2.5 w-3/5" />
        </div>
        <p className="pt-1 text-xs">{loadingLabel ?? "Loading…"}</p>
      </div>
    )
  }

  if (kind === "empty") {
    return (
      <div
        data-slot="accordion-feedback"
        data-kind="empty"
        className={cn("flex flex-col gap-0.5", className)}
      >
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        {description && <p className="text-xs">{description}</p>}
        {action}
      </div>
    )
  }

  return (
    <div
      data-slot="accordion-feedback"
      data-kind="error"
      role="alert"
      className={cn("flex flex-col gap-0.5", className)}
    >
      {title && (
        <div className="flex items-center gap-2">
          <Icon name="warning" className="size-4 text-error" aria-hidden />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
      )}
      {description && <p className="text-xs">{description}</p>}
      {action}
    </div>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionRow,
  AccordionFeedback,
}
export type { AccordionAppearance, AccordionDensity, AccordionHeadingLevel }
