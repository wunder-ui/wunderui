"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      // Passed on as well, so Base UI knows it too: the arrow keys follow the
      // axis (↑/↓ when vertical), the list says aria-orientation, and the
      // indicator measures the right edge.
      orientation={orientation}
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col data-vertical:flex-row data-vertical:items-start data-vertical:gap-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Two looks, both straight from the Figma Tab Bar page, horizontal or — with
 * `orientation="vertical"` on Tabs — stacked as a side navigation next to the
 * panel:
 *
 * - `default` is the "Tab Button" row — every tab is its own bordered button
 *   and the active one fills with the indigo tint. No track behind them.
 * - `line` is "Tab Item" — bare labels with an indigo underline under the
 *   active one, the shape that sits above a page's content.
 *
 * Vertical: `default` stacks full-width buttons with the label at the start;
 * `line` draws a rail on the left with the indicator gliding along it.
 *
 * The pill-in-a-grey-track control is a different component in Figma
 * ("Segmented Control") and a different one here: `Segment`.
 */
// Too many tabs for the width (a phone): the row scrolls sideways instead of
// pushing the page wider.
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit max-w-full items-center text-muted-foreground group-data-horizontal/tabs:overflow-x-auto group-data-horizontal/tabs:[scrollbar-width:none] group-data-horizontal/tabs:[&::-webkit-scrollbar]:hidden [&>[data-slot=tabs-trigger]]:shrink-0 group-data-vertical/tabs:h-fit group-data-vertical/tabs:shrink-0 group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-stretch",
  {
    variants: {
      variant: {
        default: "gap-2 group-data-vertical/tabs:gap-1.5",
        // Horizontal: a 1 px grey baseline under the whole row (Figma Tab Bar),
        // drawn as an inset shadow so it stays inside the scroll box and the
        // 2 px indicator, painted above it, covers it: one line, no gap.
        line: "gap-6 group-data-horizontal/tabs:w-full group-data-horizontal/tabs:shadow-[inset_0_-1px_0_var(--border)] group-data-vertical/tabs:gap-0 group-data-vertical/tabs:border-l group-data-vertical/tabs:border-border",
      },
      // The Button heights, from the density tokens: compact 32/36/40,
      // data-density="comfortable" 36/40/44 (Figma Tab Button regular/medium/large).
      size: {
        // Horizontal: the row has the height and every tab fills it.
        // Vertical: each tab takes the height itself (--tab-h).
        sm: "[--tab-h:var(--control-sm)] group-data-horizontal/tabs:h-(--tab-h) [&_[data-slot=tabs-trigger]]:text-sm",
        md: "[--tab-h:var(--control-md)] group-data-horizontal/tabs:h-(--tab-h) [&_[data-slot=tabs-trigger]]:text-sm",
        lg: "[--tab-h:var(--control-lg)] group-data-horizontal/tabs:h-(--tab-h) [&_[data-slot=tabs-trigger]]:text-sm",
      },
      shape: {
        rounded: "[&_[data-slot=tabs-trigger]]:rounded-md",
        pill: "[&_[data-slot=tabs-trigger]]:rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      shape: "rounded",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  size = "sm",
  shape = "rounded",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn("relative", tabsListVariants({ variant, size, shape }), className)}
      {...props}
    >
      {children}
      {variant === "line" && <TabsIndicator />}
    </TabsPrimitive.List>
  )
}

/** Base length (px) the indicator is scaled from; any constant works. */
const INDICATOR_BASE = 100

/**
 * The underline of the `line` variant. Base UI measures the active tab; the
 * indicator follows it with `translate` and `scale` only (M2), from a fixed
 * 100 px base, so it glides from one label to the next on the compositor.
 * Before hydration the --active-tab-* variables Base UI's inline script sets
 * place it (width/height from the variables, no transition).
 */
function TabsIndicator({ className, style, ...props }: TabsPrimitive.Indicator.Props) {
  // The first measured position must not animate from the pre-hydration box.
  const positioned = React.useRef(false)
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      renderBeforeHydration
      className={cn(
        "pointer-events-none absolute z-0 bg-primary transition-transform duration-base ease-entrance motion-reduce:transition-none",
        // Horizontal: flush with the list's bottom edge, covering the baseline.
        "group-data-horizontal/tabs:bottom-0 group-data-horizontal/tabs:left-0 group-data-horizontal/tabs:h-0.5 group-data-horizontal/tabs:w-(--active-tab-width) group-data-horizontal/tabs:translate-x-(--active-tab-left) group-data-horizontal/tabs:origin-left",
        // Vertical: sits on the rail (the list's left border), covering it.
        "group-data-vertical/tabs:top-0 group-data-vertical/tabs:-left-px group-data-vertical/tabs:h-(--active-tab-height) group-data-vertical/tabs:w-0.5 group-data-vertical/tabs:translate-y-(--active-tab-top) group-data-vertical/tabs:origin-top",
        className
      )}
      style={(state) => {
        const own = typeof style === "function" ? style(state) : style
        const pos = state.activeTabPosition
        const size = state.activeTabSize
        if (!pos || !size) return own
        const first = !positioned.current
        positioned.current = true
        const placed: React.CSSProperties =
          state.orientation === "vertical"
            ? { height: INDICATOR_BASE, translate: `0 ${pos.top}px`, scale: `1 ${size.height / INDICATOR_BASE}` }
            : { width: INDICATOR_BASE, translate: `${pos.left}px 0`, scale: `${size.width / INDICATOR_BASE} 1` }
        return { ...placed, ...(first ? { transition: "none" } : null), ...own }
      }}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors duration-fast ease-move",
        "text-text-secondary hover:text-foreground",
        // Focus: one 1 px indigo line. The bordered Tab Button recolours its border;
        // the borderless line tab draws it inside.
        "focus-visible:outline-none group-data-[variant=default]/tabs-list:focus-visible:border-ring group-data-[variant=line]/tabs-list:focus-visible:ring-1 group-data-[variant=line]/tabs-list:focus-visible:ring-ring group-data-[variant=line]/tabs-list:focus-visible:ring-inset",
        "disabled:pointer-events-none disabled:text-text-tertiary aria-disabled:pointer-events-none aria-disabled:text-text-tertiary",
        "group-data-horizontal/tabs:h-full group-data-vertical/tabs:h-(--tab-h) group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Tab Button: bordered, filling with the indigo tint when active.
        "group-data-horizontal/tabs:group-data-[variant=default]/tabs-list:flex-1 group-data-[variant=default]/tabs-list:border group-data-[variant=default]/tabs-list:border-border group-data-[variant=default]/tabs-list:bg-card group-data-[variant=default]/tabs-list:px-4",
        "group-data-[variant=default]/tabs-list:hover:bg-muted/50",
        "group-data-[variant=default]/tabs-list:data-active:bg-tint-indigo group-data-[variant=default]/tabs-list:data-active:text-text-link",
        // Tab Item: nothing but the label and the underline below it.
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:data-active:text-text-link",
        // Vertical line: the label sits right of the rail.
        "group-data-vertical/tabs:group-data-[variant=line]/tabs-list:px-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 rounded-md text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsIndicator, TabsContent, tabsListVariants }
