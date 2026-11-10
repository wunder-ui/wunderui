"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  NativeSelect,
  NativeSelectContent,
  NativeSelectItem,
  NativeSelectTrigger,
  NativeSelectValue,
} from "@/components/ui/native-select"

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

/** English number format with a comma as the thousands separator: 1,842. */
function formatCount(n: number): string {
  return n.toLocaleString("en-US")
}

type PaginationShape = "rounded" | "pill"

const SHAPE_CLASSES: Record<PaginationShape, string> = {
  rounded: "rounded-md",
  pill: "rounded-full",
}

// Regular 32 px (--control-sm), 13 px label (text-label-sm): the Figma Pagination row.
// The keyboard ring is the shared 2 px focus-ring (owner rule 31 Oct 2026), directly on the border.
const CELL =
  "flex h-(--control-sm) shrink-0 items-center justify-center text-label-sm font-medium outline-none select-none focus-ring"
const NAV_BUTTON =
  "gap-2 border border-border bg-card px-3 text-text-secondary transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-subtle disabled:pointer-events-none disabled:opacity-40"
const EDGE_BUTTON =
  "min-w-(--control-sm) border border-border bg-card px-1 text-text-secondary transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-subtle disabled:pointer-events-none disabled:opacity-40"

/** How the current page is drawn: `primary` fills it with the brand colour (default), `subtle` marks it with a quiet `bg-subtle` surface. */
type PaginationCurrentStyle = "primary" | "subtle"

const CURRENT_CLASSES: Record<PaginationCurrentStyle, string> = {
  primary: "bg-primary text-primary-foreground",
  subtle: "bg-subtle text-foreground hover:bg-bg-page active:bg-subtle",
}

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
  /** "pill" rounds every button fully (Figma Shape=Pill). Default "rounded". */
  shape?: PaginationShape
  /** Adds "First page" and "Last page" as their own buttons at the two ends. */
  showEdges?: boolean
  /** Figma "Current style": the current page in the brand colour or on a subtle surface. Default "primary". */
  currentStyle?: PaginationCurrentStyle
}

/**
 * Figma: Pagination / Navigation 2749:2347 (rows), Pagination / Item 2748:1595
 * and Pagination / Ellipsis 2748:1600 (cells). Prev/Next text+chevron buttons,
 * numbered pages with the current page in --primary, every control 32 px
 * (--control-sm) with a 13 px label. Below sm the Prev/Next labels are
 * screen-reader only, so the row fits 320 px.
 *
 * `shape="pill"` rounds the buttons fully; `showEdges` adds first/last page
 * buttons. For a table footer put it next to PaginationSummary,
 * PaginationPageSize and PaginationJump.
 */
function Pagination({ page, pageCount, onPageChange, className, shape = "rounded", showEdges = false, currentStyle = "primary" }: PaginationProps) {
  const pages = getPageList(page, pageCount)
  const round = SHAPE_CLASSES[shape]

  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      data-shape={shape}
      data-current-style={currentStyle}
      className={cn("flex items-center gap-1", className)}
    >
      {showEdges && (
        <button
          type="button"
          aria-label="First page"
          data-slot="pagination-first"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className={cn(CELL, EDGE_BUTTON, round)}
        >
          <ChevronsLeft aria-hidden className="size-4 rtl:rotate-180" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(CELL, NAV_BUTTON, round)}
      >
        <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
        <span className="sr-only sm:not-sr-only">Prev</span>
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              data-slot="pagination-ellipsis"
              className="flex h-(--control-sm) min-w-(--control-sm) items-center justify-center text-label-sm text-text-tertiary"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className={cn(
                CELL,
                "min-w-(--control-sm) px-1 tabular-nums transition-colors duration-base ease-entrance",
                round,
                p === page
                  ? CURRENT_CLASSES[currentStyle]
                  : "text-text-secondary hover:bg-bg-page active:bg-subtle"
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
        className={cn(CELL, NAV_BUTTON, round)}
      >
        <span className="sr-only sm:not-sr-only">Next</span>
        <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
      </button>
      {showEdges && (
        <button
          type="button"
          aria-label="Last page"
          data-slot="pagination-last"
          onClick={() => onPageChange(pageCount)}
          disabled={page >= pageCount}
          className={cn(CELL, EDGE_BUTTON, round)}
        >
          <ChevronsRight aria-hidden className="size-4 rtl:rotate-180" />
        </button>
      )}
    </nav>
  )
}

type PaginationSimpleProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
  /** "pill" rounds both buttons fully. Default "rounded". */
  shape?: PaginationShape
}

// The Figma variant with no page numbers — just Prev/Next and a "Page X of Y" label.
function PaginationSimple({ page, pageCount, onPageChange, className, shape = "rounded" }: PaginationSimpleProps) {
  const round = SHAPE_CLASSES[shape]
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination-simple"
      data-shape={shape}
      className={cn("flex items-center justify-between gap-4", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(CELL, "gap-2 border border-border bg-card px-3.5 text-foreground transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-subtle disabled:pointer-events-none disabled:opacity-40", round)}
      >
        <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
        Previous
      </button>
      <span className="text-label-sm text-text-tertiary tabular-nums">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className={cn(CELL, "gap-2 border border-border bg-card px-3.5 text-foreground transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-subtle disabled:pointer-events-none disabled:opacity-40", round)}
      >
        Next
        <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
      </button>
    </nav>
  )
}

type PaginationSummaryProps = {
  /** Current page, 1-based. Together with `pageSize` it gives the range "1–10". */
  page?: number
  /** Rows per page. */
  pageSize?: number
  /** Total number of rows. Leave it out when the total is not known. */
  total?: number
  /** Rows on the current page, for an unknown total or a short last page. Defaults to `pageSize`. */
  itemCount?: number
  /** "loading" shows a skeleton, "error" says the count failed and offers a retry. */
  status?: "ready" | "loading" | "error"
  /** Singular noun for the total, "result" in "248 results". */
  noun?: string
  /** Plural noun, defaults to `noun` + "s". */
  nounPlural?: string
  /** Shown instead of the default message while `status="error"`. */
  errorMessage?: React.ReactNode
  /** Makes the error state show a "Retry" button. */
  onRetry?: () => void
  className?: string
}

/**
 * Figma: Pagination / Summary 2750:1881 (Kind = Range of total, Total only,
 * Unknown total, Loading, Error).
 *
 * - `page` + `pageSize` + `total`: "1–10 of 248" (Range of total)
 * - `total` only: "248 results" (Total only)
 * - `page` + `pageSize` without `total`: "Showing 1–10" (Unknown total)
 * - `status="loading"`: skeleton, announced as "Loading results"
 * - `status="error"` (+ `onRetry`): "Couldn’t load the results. Retry"
 *
 * Numbers use the English format with a comma as the thousands separator.
 */
function PaginationSummary({
  page,
  pageSize,
  total,
  itemCount,
  status = "ready",
  noun = "result",
  nounPlural,
  errorMessage,
  onRetry,
  className,
}: PaginationSummaryProps) {
  const base = "text-label-sm text-text-secondary tabular-nums"

  if (status === "loading") {
    return (
      <div
        role="status"
        aria-busy="true"
        data-slot="pagination-summary"
        data-state="loading"
        className={cn("flex items-center", className)}
      >
        <Skeleton variant="text" className="h-4 w-24" />
        <span className="sr-only">Loading {nounPlural ?? `${noun}s`}</span>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        data-slot="pagination-summary"
        data-state="error"
        className={cn("flex items-center gap-2 text-label-sm text-destructive", className)}
      >
        <span>{errorMessage ?? `Couldn’t load the ${nounPlural ?? `${noun}s`}.`}</span>
        {onRetry && (
          <Button type="button" variant="plain" size="sm" shape="rounded" onClick={onRetry} className="text-label-sm">
            Retry
          </Button>
        )}
      </div>
    )
  }

  const plural = nounPlural ?? `${noun}s`
  const hasRange = page !== undefined && pageSize !== undefined
  let text: string
  if (hasRange) {
    const shown = itemCount ?? pageSize
    const from = (page - 1) * pageSize + 1
    const rawTo = from + shown - 1
    const to = total === undefined ? rawTo : Math.min(rawTo, total)
    if (total === 0 || shown === 0 || from > to) text = `No ${plural}`
    else text = total === undefined ? `Showing ${formatCount(from)}–${formatCount(to)}` : `${formatCount(from)}–${formatCount(to)} of ${formatCount(total)}`
  } else if (total !== undefined) {
    text = total === 0 ? `No ${plural}` : `${formatCount(total)} ${total === 1 ? noun : plural}`
  } else {
    text = ""
  }

  return (
    <p data-slot="pagination-summary" data-state="ready" className={cn(base, className)}>
      {text}
    </p>
  )
}

type PaginationPageSizeProps = {
  /** Current page size. */
  value: number
  onValueChange: (value: number) => void
  /** Choices in the menu. Default 10, 25, 50, 100. */
  options?: number[]
  /** Visible label. Default "Rows per page". */
  label?: string
  disabled?: boolean
  className?: string
}

/**
 * Figma: Pagination / PageSize 2750:1906 (label + select, 32 px, Trigger
 * XSmall). The trigger is the NativeSelect trigger at Button-sm height
 * (--control-sm) with a 13 px label.
 */
function PaginationPageSize({
  value,
  onValueChange,
  options = [10, 25, 50, 100],
  label = "Rows per page",
  disabled,
  className,
}: PaginationPageSizeProps) {
  const labelId = React.useId()
  const items = React.useMemo(() => options.map((n) => ({ value: String(n), label: String(n) })), [options])
  return (
    <div data-slot="pagination-page-size" className={cn("flex items-center gap-2", className)}>
      <span id={labelId} className="text-label-sm text-text-secondary">
        {label}
      </span>
      <NativeSelect
        value={String(value)}
        items={items}
        disabled={disabled}
        onValueChange={(v) => {
          if (v) onValueChange(Number(v))
        }}
      >
        <NativeSelectTrigger
          aria-labelledby={labelId}
          className="h-(--control-sm) w-auto min-w-16 gap-1 px-(--control-px-sm) text-label-sm tabular-nums"
        >
          <NativeSelectValue />
        </NativeSelectTrigger>
        <NativeSelectContent>
          {options.map((n) => (
            <NativeSelectItem key={n} value={String(n)} className="text-label-sm tabular-nums">
              {n}
            </NativeSelectItem>
          ))}
        </NativeSelectContent>
      </NativeSelect>
    </div>
  )
}

type PaginationJumpProps = {
  pageCount: number
  /** Called with a valid page (a whole number from 1 to `pageCount`). */
  onPageChange: (page: number) => void
  /** Visible label. Default "Go to page". */
  label?: string
  /** Text of the button. Default "Go". */
  buttonLabel?: string
  disabled?: boolean
  className?: string
}

/**
 * Figma: Pagination / Jump 2750:2027 (labelled input + button, 32 px: Input
 * Small, Button Small). Enter or the button jumps; a value outside 1 to
 * `pageCount` (or no whole number) shows the error under the row without
 * making the row taller, and never calls `onPageChange`.
 */
function PaginationJump({
  pageCount,
  onPageChange,
  label = "Go to page",
  buttonLabel = "Go",
  disabled,
  className,
}: PaginationJumpProps) {
  const id = React.useId()
  const errorId = `${id}-error`
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const submit = () => {
    const trimmed = draft.trim()
    const n = Number(trimmed)
    if (trimmed === "" || !Number.isInteger(n) || n < 1 || n > pageCount) {
      setError(`Enter a page from 1 to ${formatCount(pageCount)}.`)
      return
    }
    setError(null)
    onPageChange(n)
  }

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      data-slot="pagination-jump"
      className={cn("relative flex items-center gap-2", className)}
    >
      <label id={`${id}-label`} htmlFor={id} className="text-label-sm text-text-secondary">
        {label}
      </label>
      <Input
        id={id}
        size="sm"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        value={draft}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-16 text-center tabular-nums"
        onChange={(event) => {
          setDraft(event.target.value)
          if (error) setError(null)
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return
          // Do not submit a form the pagination happens to sit in.
          event.preventDefault()
          submit()
        }}
      />
      <Button type="button" variant="plain" size="sm" disabled={disabled} onClick={submit} className="text-label-sm">
        {buttonLabel}
      </Button>
      {error && (
        <p id={errorId} role="alert" className="absolute start-0 top-full mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export { Pagination, PaginationSimple, PaginationSummary, PaginationPageSize, PaginationJump }
export type {
  PaginationProps,
  PaginationShape,
  PaginationCurrentStyle,
  PaginationSimpleProps,
  PaginationSummaryProps,
  PaginationPageSizeProps,
  PaginationJumpProps,
}
