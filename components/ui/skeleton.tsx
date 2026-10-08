import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const skeletonVariants = cva(
  // Shimmer wave instead of a plain pulse: a soft highlight sweeps across each
  // placeholder every 1.8 s (keyframes in styles.css, off for reduced motion).
  "relative isolate overflow-hidden bg-muted before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-foreground/6 before:to-transparent before:[animation:wunderui-shimmer_1.8s_ease-in-out_infinite] motion-reduce:before:animate-none dark:before:via-foreground/10",
  {
  variants: {
    variant: {
      text: "h-3.5 w-full rounded-sm",
      title: "h-5 w-2/3 rounded-sm",
      avatar: "size-10 rounded-full",
      block: "h-[100px] w-full rounded-md",
    },
  },
  defaultVariants: {
    variant: "block",
  },
})

function Skeleton({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
