import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
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
// Hover on the filled variants darkens with brightness-95 instead of the
// former bg-*/90. An alpha fill composites against whatever is behind the
// button, so on the white page it made the fill LIGHTER: white label on
// primary measured 4.99:1 at rest but only 4.17:1 while hovered, and
// destructive 5.04 -> 4.44 -- both under AA 4.5. brightness-95 darkens in
// both themes and keeps every filled variant at 4.85:1 (primary, brand) and
// 4.91:1 (destructive). Measured values are for the label, white or near
// white, against the fill; contrast-audit.mjs reads flat background colors
// only, so neither the hover alpha nor the gradient below was covered by it.
//
// The gradient top stop was #6f74f5, which put the top edge of the button at
// 3.82:1 -- the gradient, not the token, was the failure. #5a5ef4 keeps a
// visible sheen (4.84:1 top, 4.99:1 bottom) and the inset white highlight
// carries the rest of the raised look. Its hover brightened (brightness-105,
// 3.52:1); it now darkens like the other filled variants (4.71:1 top).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 border border-transparent text-sm font-medium whitespace-nowrap transition duration-fast ease-entrance outline-none select-none shadow-[0px_1px_1px_0px_rgba(16,24,40,0.05)] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 focus-visible:border-ring focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        plain: "bg-card border-border-control text-foreground hover:bg-muted/50",
        primary: "border-primary bg-primary text-primary-foreground hover:brightness-95",
        brand:
          "border-brand-primary bg-brand-primary text-brand-primary-foreground hover:brightness-95",
        gradient:
          "border-primary bg-gradient-to-b from-[#5a5ef4] to-primary text-primary-foreground shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.35)] hover:brightness-95",
        dark: "bg-inverse text-text-inverse hover:bg-(--dark-400) hover:text-white",
        light: "bg-white bg-clip-padding text-primary hover:bg-(--light-200)",
        // Figma Type=blue_outline: indigo rim, link-coloured label, indigo tint on hover.
        outline: "bg-card border-primary text-text-link hover:bg-tint-indigo hover:text-tint-text-indigo",
        // Indigo tint: the selected-option look of the button group and segmented selectors.
        tint: "bg-tint-indigo text-tint-text-indigo hover:bg-tint-indigo hover:brightness-95",
        // Figma Type=ghost / destructive / link (added Sep 2026)
        ghost: "bg-transparent text-foreground shadow-none hover:bg-muted/50",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground hover:brightness-95",
        link: "bg-transparent px-0! text-text-link shadow-none underline-offset-4 hover:underline",
      },
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
      },
      size: {
        // Heights and paddings are density tokens (styles.css): compact 32/36/40/44/48,
        // data-density="comfortable" 36/40/44/48/56. The icon side sits 2 px tighter (2xl 4 px).
        sm: "h-(--control-sm) px-(--control-px-sm) text-sm has-data-[icon=inline-end]:pr-[calc(var(--control-px-sm)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-sm)-0.125rem)]",
        md: "h-(--control-md) px-(--control-px-md) text-sm has-data-[icon=inline-end]:pr-[calc(var(--control-px-md)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-md)-0.125rem)]",
        lg: "h-(--control-lg) px-(--control-px-lg) text-sm has-data-[icon=inline-end]:pr-[calc(var(--control-px-lg)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-lg)-0.125rem)]",
        xl: "h-(--control-xl) px-(--control-px-xl) text-base has-data-[icon=inline-end]:pr-[calc(var(--control-px-xl)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-xl)-0.125rem)]",
        "2xl": "h-(--control-2xl) px-(--control-px-2xl) text-lg has-data-[icon=inline-end]:pr-[calc(var(--control-px-2xl)-0.25rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px-2xl)-0.25rem)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "rounded",
      size: "md",
    },
  }
)

function Button({
  className,
  variant,
  shape,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, shape, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
