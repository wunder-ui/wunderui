"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useOverflowX } from "@/lib/use-overflow-x"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  // A table wider than its container scrolls sideways: then the container takes
  // focus so keyboard users can scroll it with the arrow keys.
  const scrolls = useOverflowX(containerRef)
  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      tabIndex={scrolls ? 0 : undefined}
      role={scrolls ? "region" : undefined}
      aria-label={scrolls ? (props["aria-label"] ?? "Table") : undefined}
      className="relative w-full overflow-x-auto rounded-[inherit] outline-none focus-ring"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-bg-page [&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-surface font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors duration-fast ease-entrance hover:bg-bg-page has-aria-expanded:bg-bg-page data-[state=selected]:bg-bg-subtle data-[state=selected]:hover:bg-bg-subtle",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-(--control-md) px-3 text-left align-middle font-medium whitespace-nowrap text-foreground outline-none hover:bg-bg-subtle focus-visible:bg-bg-subtle first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // the first column carries the row (primary text); the others are secondary, so the eye lands on the name first.
        // A leading checkbox or expand column does not count: the cell after it is the primary one.
        "px-3 py-(--row-py) align-middle whitespace-nowrap text-text-secondary outline-none focus-visible:bg-bg-page first:pl-4 first:text-foreground last:pr-4 data-primary:text-foreground [&:has([role=checkbox])+td]:text-foreground [&:has([aria-expanded])+td]:text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
