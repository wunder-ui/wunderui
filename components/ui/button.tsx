import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Loader2, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

// --primary/--brand-primary is the indigo brand color; its text uses
// --primary-foreground/--brand-primary-foreground (white), which is AA-safe
// on indigo. gradient tracks the same primary token (light tint -> primary),
// so its text reuses primary-foreground too. outline keeps a fixed white
// background independent of the primary token, so its text stays a fixed
// dark color (#25272a) rather than tracking primary-foreground, which is
// white and would fail contrast on that fixed white background.
// See /scripts/contrast-audit.mjs.
//
// Hover and pressed on the filled variants are fixed token colours, the Figma values:
// primary and brand go brand-700 on hover and brand-800 pressed (white label 7.0:1 and
// 10.0:1), destructive goes red-800 and red-900 (6.5:1 and 10.6:1), the dark button
// goes dark-400 and dark-500. They replaced brightness-95, which dimmed fill and label
// together and left the pressed state with no colour at all (only a scale). The plain
// button follows the neutral-surface rule: hover bg-page, pressed bg-subtle.
// Focus (owner rule 31 Oct 2026): the border turns indigo and a 2 px indigo-300 outline sits directly on it
// (utility focus-ring); destructive keeps its red hue (focus-ring-error) and the dark button, whose border is
// its fill, gets a dark-300 ring. The gradient hover and pressed states are brand-600/700 and 700/800 stops.
//
// The gradient top stop was #6f74f5, which put the top edge of the button at
// 3.82:1 -- the gradient, not the token, was the failure. #5a5ef4 keeps a
// visible sheen (4.84:1 top, 4.99:1 bottom) and the inset white highlight
// carries the rest of the raised look. Its hover brightened (brightness-105,
// 3.52:1); it now darkens like the other filled variants (4.71:1 top).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border border-transparent text-sm font-medium whitespace-nowrap transition duration-fast ease-entrance outline-none select-none shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)] active:not-aria-[haspopup]:scale-[0.97] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        plain: "bg-card border-border-control text-foreground hover:bg-bg-page data-popup-open:bg-bg-page active:bg-bg-subtle focus-ring",
        primary:
          "border-primary bg-primary text-primary-foreground hover:border-(color:--brand-700) hover:bg-(--brand-700) active:border-(color:--brand-800) active:bg-(--brand-800) focus-ring",
        brand:
          "border-brand-primary bg-brand-primary text-brand-primary-foreground hover:border-(color:--brand-700) hover:bg-(--brand-700) active:border-(color:--brand-800) active:bg-(--brand-800) focus-ring",
        gradient:
          "border-primary bg-gradient-to-b from-[#5a5ef4] to-primary text-primary-foreground shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05),inset_0px_1px_2px_0px_rgba(255,255,255,0.35)] hover:from-(--brand-600) hover:to-(--brand-700) active:from-(--brand-700) active:to-(--brand-800) focus-ring",
        dark: "bg-inverse text-text-inverse hover:bg-(--dark-400) hover:text-white active:bg-(--dark-500) active:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-0 focus-visible:outline-(color:--dark-300)",
        light: "bg-white bg-clip-padding text-primary hover:bg-(--light-200) focus-ring",
        // Figma Type=blue_outline: indigo rim, link-coloured label, indigo tint on hover.
        outline: "bg-card border-primary text-text-link hover:border-tint-text-indigo hover:bg-tint-indigo hover:text-tint-text-indigo active:bg-bg-subtle active:text-tint-text-indigo focus-ring",
        // Indigo tint: the selected-option look of the button group and segmented selectors.
        tint: "bg-tint-indigo text-tint-text-indigo focus-ring",
        // Figma Type=ghost / destructive / link (added Sep 2026)
        ghost: "bg-transparent text-foreground shadow-none hover:bg-bg-page data-popup-open:bg-bg-page active:bg-bg-subtle focus-ring",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:border-red-800 hover:bg-red-800 active:border-red-900 active:bg-red-900 focus-ring-error",
        link: "bg-transparent px-0! text-text-link shadow-none underline-offset-4 hover:text-text-link-hover hover:underline active:text-text-link-pressed focus-ring",
      },
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
      },
      size: {
        // Heights and paddings are density tokens (styles.css): compact 32/36/40/44/48,
        // data-density="comfortable" 36/40/44/48/56. The icon side sits 2 px tighter (2xl 4 px).
        sm: "h-(--control-sm) px-(--control-px-sm) text-sm has-data-[icon=inline-end]:pr-[calc(var(--control-px-sm)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-sm)-0.125rem)]",
        // Icon sizes follow the Figma Button sets: Small and Regular 16 px, Medium 20 px, Large and Xlarge 24 px. Heights and paddings are unchanged.
        md: "h-(--control-md) px-(--control-px-md) text-sm has-data-[icon=inline-end]:pr-[calc(var(--control-px-md)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-md)-0.125rem)]",
        lg: "h-(--control-lg) px-(--control-px-lg) text-sm [&_svg:not([class*='size-'])]:size-5 has-data-[icon=inline-end]:pr-[calc(var(--control-px-lg)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-lg)-0.125rem)]",
        xl: "h-(--control-xl) px-(--control-px-xl) text-base [&_svg:not([class*='size-'])]:size-6 has-data-[icon=inline-end]:pr-[calc(var(--control-px-xl)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-xl)-0.125rem)]",
        "2xl": "h-(--control-2xl) px-(--control-px-2xl) text-lg [&_svg:not([class*='size-'])]:size-6 has-data-[icon=inline-end]:pr-[calc(var(--control-px-2xl)-0.25rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-2xl)-0.25rem)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "rounded",
      size: "md",
    },
  }
)

type ButtonPhase = "idle" | "pending" | "success" | "error"

function Button({
  className,
  variant,
  shape,
  size,
  children,
  onClick,
  pending,
  phase,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /**
     * Shows a spinner in place of the leading icon and ignores presses.
     * The button stays focusable and keeps its colour (it is not disabled).
     */
    pending?: boolean
    /**
     * Async feedback: pending shows a spinner, success a check, error a retry
     * icon. The label is yours (for example Saving…, Saved, Retry). Keep the
     * width constant with a fixed width on the button so it does not jump
     * between phases.
     */
    phase?: ButtonPhase
  }) {
  const status: ButtonPhase = phase ?? (pending ? "pending" : "idle")
  const isIdle = status === "idle"

  const resolvedVariant = variant ?? "primary"
  const effectiveVariant =
    status === "error" &&
    ["primary", "brand", "gradient"].includes(resolvedVariant)
      ? "destructive"
      : variant

  const filteredChildren = React.Children.toArray(children).filter((child) => {
    if (!React.isValidElement<{ "data-icon"?: string }>(child)) {
      return true
    }
    return child.props["data-icon"] !== "inline-start"
  })

  const quiet = ["plain", "ghost", "outline", "tint"].includes(resolvedVariant)

  let statusIcon: React.ReactNode = null
  if (status === "pending") {
    statusIcon = (
      <Loader2
        aria-hidden
        data-icon="inline-start"
        className="animate-spin motion-reduce:animate-none"
      />
    )
  } else if (status === "success") {
    statusIcon = (
      <Check
        aria-hidden
        data-icon="inline-start"
        strokeWidth={1.5}
        className={quiet ? "text-text-success" : undefined}
      />
    )
  } else if (status === "error") {
    statusIcon = (
      <RotateCw
        aria-hidden
        data-icon="inline-start"
        strokeWidth={1.5}
        className={quiet ? "text-text-error" : undefined}
      />
    )
  }

  const handleClick: NonNullable<ButtonPrimitive.Props["onClick"]> = (event) => {
    if (status === "pending") {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant: isIdle ? variant : effectiveVariant, shape, size, className })
      )}
      data-phase={isIdle ? undefined : status}
      aria-busy={isIdle ? undefined : status === "pending" ? true : undefined}
      data-pending={isIdle ? undefined : status === "pending" ? "" : undefined}
      onClick={isIdle ? onClick : handleClick}
      {...props}
    >
      {isIdle ? null : statusIcon}
      {isIdle ? children : filteredChildren}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
export type { ButtonPhase }
