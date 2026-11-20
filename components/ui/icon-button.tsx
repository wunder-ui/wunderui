import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"

// Same states as Button (see button.tsx and the Figma Button / Icon set): the filled variants use fixed
// hover and pressed fills (brand-700/800, red-800/900, dark-400/500, bg-page/bg-subtle on neutral surfaces)
// instead of brightness-95, and focus is the shared 2 px focus-ring (owner rule 31 Oct 2026). The gradient top
// stop is 85 % primary + 15 % brand-500 (4.73:1 with a white icon); hover and pressed step the gradient to
// brand-600/700 and brand-700/800. The light variant's icon is light-1000 (5.93:1 on light-600); it has no
// Figma counterpart, hover and pressed step to the lighter light-500 and light-400 so the icon keeps >= 3:1.
const iconButtonVariants = cva(
  "group/icon-button inline-flex shrink-0 items-center justify-center border border-transparent transition duration-fast ease-entrance outline-none select-none shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)] active:scale-[0.97] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        plain: "bg-card border-border-control text-foreground hover:bg-bg-page data-expanded:bg-bg-subtle data-expanded:hover:bg-bg-subtle active:bg-bg-subtle focus-ring",
        primary:
          "border-primary bg-primary text-primary-foreground hover:border-(color:--brand-700) hover:bg-(--brand-700) active:border-(color:--brand-800) active:bg-(--brand-800) focus-ring",
        brand:
          "border-brand-primary bg-brand-primary text-brand-primary-foreground hover:border-(color:--brand-700) hover:bg-(--brand-700) active:border-(color:--brand-800) active:bg-(--brand-800) focus-ring",
        gradient:
          "border-primary bg-gradient-to-b from-[color-mix(in_srgb,var(--primary)_85%,var(--brand-500))] to-primary text-primary-foreground shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05),inset_0px_1px_2px_0px_rgba(255,255,255,0.35)] hover:from-(--brand-600) hover:to-(--brand-700) active:from-(--brand-700) active:to-(--brand-800) focus-ring",
        dark: "bg-inverse text-text-inverse hover:bg-(--dark-400) hover:text-neutral-white active:bg-(--dark-500) active:text-neutral-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-0 focus-visible:outline-(color:--dark-300)",
        light: "bg-(--light-600) text-(--light-1000) hover:bg-(--light-500) data-expanded:bg-bg-subtle data-expanded:hover:bg-bg-subtle active:bg-(--light-400) focus-ring",
        outline: "bg-card border-primary text-foreground hover:border-tint-text-indigo hover:bg-tint-indigo hover:text-tint-text-indigo data-expanded:bg-bg-subtle data-expanded:hover:bg-bg-subtle active:bg-bg-subtle focus-ring",
        // Figma Type=ghost / destructive (added Sep 2026)
        ghost: "bg-transparent text-foreground shadow-none hover:bg-bg-page data-expanded:bg-bg-subtle data-expanded:hover:bg-bg-subtle active:bg-bg-subtle focus-ring",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:border-(color:--red-800) hover:bg-(color:--red-800) active:border-(color:--red-900) active:bg-(color:--red-900) focus-ring-error",
      },
      shape: {
        rounded: "rounded-md",
        circle: "rounded-full",
      },
      size: {
        sm: "size-8 [&_svg]:size-4",
        md: "size-9 [&_svg]:size-[18px]",
        lg: "size-10 [&_svg]:size-5",
        xl: "size-11 [&_svg]:size-[22px]",
        "2xl": "size-12 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "rounded",
      size: "md",
    },
  }
)

type IconButtonPhase = "idle" | "pending" | "success" | "error"

function IconButton({
  className,
  variant,
  shape,
  size,
  children,
  onClick,
  pending,
  phase,
  expanded,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof iconButtonVariants> & {
    /**
     * Shows a spinner in place of the icon, in the same square, and ignores presses.
     * The button stays focusable and keeps its colour (it is not disabled).
     */
    pending?: boolean
    /**
     * Async feedback in the same square: pending shows a spinner, success a check, error a retry icon.
     * The size never changes. The accessible name is yours: change the aria-label with the phase
     * (for example Copy link, Copying, Copied, Retry copying).
     */
    phase?: IconButtonPhase
    /**
     * Marks a trigger whose menu or panel is open: sets aria-expanded and the pressed surface
     * (bg-bg-subtle) on the quiet variants. Leave it undefined when the button does not control a popup.
     */
    expanded?: boolean
  }) {
  const status: IconButtonPhase = phase ?? (pending ? "pending" : "idle")
  const isIdle = status === "idle"

  const resolvedVariant = variant ?? "primary"
  const effectiveVariant =
    status === "error" && ["primary", "brand", "gradient"].includes(resolvedVariant)
      ? "destructive"
      : variant

  const quiet = ["plain", "ghost", "outline"].includes(resolvedVariant)

  let statusIcon: React.ReactNode = null
  if (status === "pending") {
    statusIcon = (
      <Icon name="spinner" aria-hidden className="animate-spin motion-reduce:animate-none" />
    )
  } else if (status === "success") {
    statusIcon = (
      <Icon name="check" aria-hidden strokeWidth={2} className={quiet ? "text-text-success" : undefined} />
    )
  } else if (status === "error") {
    statusIcon = (
      <Icon name="retry" aria-hidden strokeWidth={2} className={quiet ? "text-text-error" : undefined} />
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
      data-slot="icon-button"
      className={cn(iconButtonVariants({ variant: isIdle ? variant : effectiveVariant, shape, size, className }))}
      aria-expanded={expanded}
      data-expanded={expanded ? "" : undefined}
      data-phase={isIdle ? undefined : status}
      aria-busy={isIdle ? undefined : status === "pending" ? true : undefined}
      data-pending={isIdle ? undefined : status === "pending" ? "" : undefined}
      onClick={isIdle ? onClick : handleClick}
      {...props}
    >
      {isIdle ? children : statusIcon}
    </ButtonPrimitive>
  )
}

export { IconButton, iconButtonVariants }
export type { IconButtonPhase }
