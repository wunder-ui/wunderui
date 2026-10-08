"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "cn"

function getPageList(page: number, pageCount: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = []
  const add = (p: number | "ellipsis") => pages.push(p)

  add(1)
  if (page > 3) add("ellipsis")
  for (let p = Math.max(2, page - 1); p <= Math.min(pageCount - 1, page + 1); p++) add(p)
  if (page < pageCount - 2) add("ellipsis")
  if (pageCount > 1) add(pageCount)

  return pages
}

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

// Matches the Figma Pagination component: bordered pill container, Prev/Next
// text+chevron buttons, numbered pages with the current page in --primary.
function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const pages = getPageList(page, pageCount)

  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn("flex items-center gap-1", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
        Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-text-tertiary">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className={cn(
                "flex h-10 min-w-10 items-center justify-center rounded-md px-1 text-[13px] font-medium tabular-nums transition-colors",
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:bg-muted"
              )}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className="flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        Next
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}

type PaginationSimpleProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

// The Figma variant with no page numbers — just Prev/Next and a "Page X of Y" label.
function PaginationSimple({ page, pageCount, onPageChange, className }: PaginationSimpleProps) {
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination-simple"
      className={cn("flex items-center justify-between gap-4", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
        Previous
      </button>
      <span className="text-sm text-text-tertiary">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        Next
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}

export { Pagination, PaginationSimple }
