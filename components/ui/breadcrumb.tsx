import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "cn"

type BreadcrumbVariant = "plain" | "border" | "underline"
const BreadcrumbVariantContext = React.createContext<BreadcrumbVariant>("plain")

function Breadcrumb({
  variant = "plain",
  ...props
}: React.ComponentProps<"nav"> & { variant?: BreadcrumbVariant }) {
  return (
    <BreadcrumbVariantContext.Provider value={variant}>
      <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
    </BreadcrumbVariantContext.Provider>
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  const variant = React.useContext(BreadcrumbVariantContext)
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-xs font-medium break-words",
        variant === "border" && "overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  const variant = React.useContext(BreadcrumbVariantContext)
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("flex items-center gap-2", variant === "border" && "px-2.5 py-2", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a">) {
  const variant = React.useContext(BreadcrumbVariantContext)
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn(
        "flex items-center gap-2 text-text-tertiary transition-colors duration-fast ease-move hover:text-foreground [&_svg]:size-4",
        variant === "underline" && "underline underline-offset-4 decoration-border hover:decoration-primary",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      aria-disabled="true"
      className={cn("flex items-center gap-2 text-foreground [&_svg]:size-4", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ className, children, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("text-text-tertiary [&>svg]:size-4", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator }
