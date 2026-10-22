import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Same contrast rules as Button (see the long comment in button.tsx): hover on
// the filled variants darkens with brightness-95 instead of bg-*/90 (an alpha
// fill is LIGHTER than the solid fill on a white page: primary/brand 4.99 ->
// 4.17:1, destructive 5.04 -> 4.44:1, now 4.85 / 4.91:1). The gradient top stop
// was --gradient-start-3 (#6f74f5, 3.82:1 with a white icon, 3.52:1 on the old
// brightness-105 hover); it is now 85 % primary + 15 % brand-500, which is
// 4.73:1 at rest and 4.61:1 hovered. The light variant's icon is light-1000
// (5.93:1 on light-600) instead of light-900 (3.84:1), so a text label would pass too.
const iconButtonVariants = cva(
  "group/icon-button inline-flex shrink-0 items-center justify-center border border-transparent transition duration-fast ease-entrance outline-none select-none shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)] active:scale-[0.97] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-40 focus-visible:border-ring focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        plain: "bg-card border-border-control text-foreground hover:bg-muted/50",
        primary: "border-primary bg-primary text-primary-foreground hover:brightness-95",
        brand:
          "border-brand-primary bg-brand-primary text-brand-primary-foreground hover:brightness-95",
        gradient:
          "border-primary bg-gradient-to-b from-[color-mix(in_srgb,var(--primary)_85%,var(--brand-500))] to-primary text-primary-foreground shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.35)] hover:brightness-95",
        dark: "bg-inverse text-text-inverse hover:bg-(--dark-400) hover:text-white",
        light: "bg-(--light-600) text-(--light-1000) hover:brightness-95",
        outline: "bg-card border-primary text-foreground hover:bg-primary/5",
        // Figma Type=ghost / destructive (added Sep 2026)
        ghost: "bg-transparent text-foreground shadow-none hover:bg-muted/50",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:brightness-95",
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

function IconButton({
  className,
  variant,
  shape,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof iconButtonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="icon-button"
      className={cn(iconButtonVariants({ variant, shape, size, className }))}
      {...props}
    />
  )
}

export { IconButton, iconButtonVariants }
