"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Ellipsis, Lock, Slash } from "lucide-react"
import { cn } from "@/lib/utils"

type BreadcrumbVariant = "plain" | "contained" | "border" | "underline"
type BreadcrumbDensity = "default" | "compact"

type BreadcrumbContextValue = {
  variant: BreadcrumbVariant
  density: BreadcrumbDensity | undefined
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({
  variant: "plain",
  density: undefined,
})

function Breadcrumb({
  variant = "plain",
  density,
  ...props
}: React.ComponentProps<"nav"> & { variant?: BreadcrumbVariant; density?: BreadcrumbDensity }) {
  return (
    <BreadcrumbContext.Provider value={{ variant, density }}>
      <nav
        aria-label="breadcrumb"
        data-slot="breadcrumb"
        data-variant={variant}
        {...(density !== undefined ? { "data-density": density } : {})}
        {...props}
      />
    </BreadcrumbContext.Provider>
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  const { variant, density } = React.useContext(BreadcrumbContext)
  const sized = density !== undefined

  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        sized
          ? cn(
              "flex min-w-0 flex-nowrap items-center gap-0 text-xs font-medium",
              density === "default" ? "h-9" : "h-7",
              (variant === "contained" || variant === "border") && "w-fit max-w-full rounded-lg border border-border bg-card px-1",
              variant === "underline" && "w-fit max-w-full border-b border-border"
            )
          : cn(
              "flex flex-wrap items-center gap-2 text-xs font-medium break-words",
              (variant === "border" || variant === "contained") && "overflow-hidden rounded-lg border border-border bg-card"
            ),
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  const { variant, density } = React.useContext(BreadcrumbContext)
  const sized = density !== undefined

  return (
    <li
      data-slot="breadcrumb-item"
      className={cn(
        sized
          ? "flex min-w-0 items-center gap-0"
          : cn("flex items-center gap-2", (variant === "border" || variant === "contained") && "px-2.5 py-2"),
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbLink({
  className,
  truncated,
  children,
  title,
  ...props
}: React.ComponentProps<"a"> & { truncated?: boolean }) {
  const { variant, density } = React.useContext(BreadcrumbContext)
  const sized = density !== undefined
  const resolvedTitle = title ?? (truncated && typeof children === "string" ? children : undefined)

  return (
    <a
      data-slot="breadcrumb-link"
      title={resolvedTitle}
      className={cn(
        sized
          ? cn(
              "flex items-center gap-2 rounded-md px-1.5 text-text-secondary transition-colors duration-fast ease-move outline-none focus-ring [&_svg]:size-4 [&_svg]:shrink-0 hover:text-foreground hover:underline hover:underline-offset-4 active:bg-bg-subtle active:text-foreground",
              density === "default" ? "h-7" : "h-6"
            )
          : cn(
              "flex items-center gap-2 rounded-sm text-text-tertiary transition-colors duration-fast ease-move hover:text-foreground outline-none focus-ring [&_svg]:size-4",
              variant === "underline" && "underline underline-offset-4 decoration-border hover:decoration-primary"
            ),
        truncated && "max-w-40 min-w-0",
        className
      )}
      {...props}
    >
      {truncated
        ? React.Children.map(children, (child) =>
            typeof child === "string" ? <span className="truncate">{child}</span> : child
          )
        : children}
    </a>
  )
}

function BreadcrumbPage({
  className,
  truncated,
  children,
  title,
  ...props
}: React.ComponentProps<"span"> & { truncated?: boolean }) {
  const { density } = React.useContext(BreadcrumbContext)
  const sized = density !== undefined
  const resolvedTitle = title ?? (truncated && typeof children === "string" ? children : undefined)

  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      aria-disabled="true"
      title={resolvedTitle}
      className={cn(
        "flex items-center gap-2 text-foreground [&_svg]:size-4",
        sized && cn("px-1.5", density === "default" ? "h-7" : "h-6"),
        truncated && "max-w-40 min-w-0",
        className
      )}
      {...props}
    >
      {truncated
        ? React.Children.map(children, (child) =>
            typeof child === "string" ? <span className="truncate">{child}</span> : child
          )
        : children}
    </span>
  )
}

function BreadcrumbSeparator({
  className,
  children,
  type = "chevron",
  ...props
}: React.ComponentProps<"li"> & { type?: "chevron" | "slash" }) {
  const { density } = React.useContext(BreadcrumbContext)
  const sized = density !== undefined

  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "text-text-tertiary [&>svg]:size-4",
        sized && "flex size-4 shrink-0 items-center justify-center",
        className
      )}
      {...props}
    >
      {children ?? (type === "slash" ? <Slash /> : <ChevronRight />)}
    </li>
  )
}

function BreadcrumbEllipsis({ className, children, ...props }: React.ComponentProps<"button">) {
  const { density } = React.useContext(BreadcrumbContext)

  return (
    <button
      type="button"
      data-slot="breadcrumb-ellipsis"
      aria-label="Show hidden levels"
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-text-secondary outline-none transition-colors duration-fast ease-move focus-ring [&_svg]:size-4 hover:bg-bg-page hover:text-foreground aria-expanded:border-border-control aria-expanded:bg-bg-page aria-expanded:text-foreground data-popup-open:border-border-control data-popup-open:bg-bg-page data-popup-open:text-foreground disabled:pointer-events-none disabled:opacity-40",
        density === "compact" ? "size-6" : "size-7",
        className
      )}
    >
      {children ?? <Ellipsis aria-hidden />}
    </button>
  )
}

function BreadcrumbSiblingTrigger({ className, children, ...props }: React.ComponentProps<"button">) {
  const { density } = React.useContext(BreadcrumbContext)

  return (
    <button
      type="button"
      data-slot="breadcrumb-sibling-trigger"
      aria-label="Show sibling pages"
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-text-secondary outline-none transition-colors duration-fast ease-move focus-ring [&_svg]:size-4 hover:bg-bg-page hover:text-foreground aria-expanded:border-border-control aria-expanded:bg-bg-page aria-expanded:text-foreground data-popup-open:border-border-control data-popup-open:bg-bg-page data-popup-open:text-foreground disabled:pointer-events-none disabled:opacity-40 [&>svg]:transition-transform [&>svg]:duration-fast [&>svg]:ease-move motion-reduce:[&>svg]:transition-none aria-expanded:[&>svg]:rotate-180 data-popup-open:[&>svg]:rotate-180",
        density === "compact" ? "size-6" : "size-7",
        className
      )}
    >
      {children ?? <ChevronDown aria-hidden />}
    </button>
  )
}

function BreadcrumbRestricted({
  className,
  children,
  title = "You do not have access to this level",
  ...props
}: React.ComponentProps<"span">) {
  const { density } = React.useContext(BreadcrumbContext)
  const sized = density !== undefined

  return (
    <span
      data-slot="breadcrumb-restricted"
      tabIndex={0}
      aria-disabled="true"
      title={title}
      role="link"
      {...props}
      className={cn(
        "flex items-center gap-2 rounded-md text-text-tertiary outline-none transition-colors duration-fast ease-move focus-ring [&_svg]:size-4 [&_svg]:shrink-0 hover:text-text-secondary hover:underline hover:decoration-dotted hover:underline-offset-4",
        sized ? cn("px-1.5", density === "default" ? "h-7" : "h-6") : "px-0",
        className
      )}
    >
      <Lock aria-hidden />
      {children}
    </span>
  )
}

function BreadcrumbLoading({
  className,
  label = "Loading",
  ...props
}: React.ComponentProps<"span"> & { label?: string }) {
  const { density } = React.useContext(BreadcrumbContext)

  return (
    <span
      data-slot="breadcrumb-loading"
      role="status"
      aria-label={label}
      {...props}
      className={cn(
        "inline-block h-2.5 w-18 shrink-0 rounded-sm bg-bg-subtle",
        density !== undefined && "mx-1.5",
        className
      )}
    />
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbSiblingTrigger,
  BreadcrumbRestricted,
  BreadcrumbLoading,
}
export type { BreadcrumbVariant, BreadcrumbDensity }
