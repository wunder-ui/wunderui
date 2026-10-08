import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const iconButtonVariants = cva(
  "group/icon-button inline-flex shrink-0 items-center justify-center border border-transparent transition duration-fast ease-entrance outline-none select-none shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)] active:translate-y-px disabled:pointer-events-none disabled:opacity-40 focus-visible:border-ring [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        plain: "bg-card border-border-control text-foreground hover:bg-muted",
        primary: "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        brand:
          "border-brand-primary bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90",
        gradient:
          "border-primary bg-gradient-to-b from-[#6f74f5] to-primary text-primary-foreground shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.35)] hover:brightness-105",
        dark: "bg-inverse text-text-inverse hover:bg-(--dark-400) hover:text-white",
        light: "bg-(--light-600) text-(--light-900) hover:bg-(--light-600)/90",
        outline: "bg-card border-primary text-foreground hover:bg-primary/5",
        // Figma Type=ghost / destructive (added Sep 2026)
        ghost: "bg-transparent text-foreground shadow-none hover:bg-muted",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
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
