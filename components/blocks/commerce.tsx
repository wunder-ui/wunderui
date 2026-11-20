"use client"

import * as React from "react"
import { Icon } from "@/components/ui/icon-provider"
import { ProgressRow } from "@/components/ui/progress"

/* ------------------------------------------------------------------ */
/* Histogram Bar — deprecated alias of ProgressRow (Progress)           */
/* Figma: Histogram Bar (732:1853)                                     */
/* ------------------------------------------------------------------ */

type HistogramBarProps = {
  /** The row's name, usually the star count (5). */
  label: React.ReactNode
  /** Share of the bar, 0 to 100 (clamped). */
  value: number
  /** Shown at the end of the row instead of the rounded percentage (for example a review count). */
  count?: React.ReactNode
  /** Name of the whole row for assistive tech. Default: "5 stars: 78%", built from the label and the end text. */
  "aria-label"?: string
  className?: string
}

/** @deprecated Use `<ProgressRow tone="yellow" icon={<Star … />} valueText={count} …>`. */
function HistogramBar({ label, value, count, "aria-label": ariaLabel, className }: HistogramBarProps) {
  const text = count ?? `${Math.round(Math.max(0, Math.min(100, value)))}%`
  const plain = (node: React.ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : null)
  const name = ariaLabel ?? (plain(label) !== null && plain(text) !== null ? `${plain(label)} ${plain(label) === "1" ? "star" : "stars"}: ${plain(text)}` : undefined)
  return (
    <ProgressRow
      label={label}
      icon={<Icon name="star" className="size-2.5 fill-brand-quaternary text-brand-quaternary" strokeWidth={1.5} />}
      value={value}
      valueText={count}
      tone="yellow"
      aria-label={name}
      className={className}
    />
  )
}

export { HistogramBar }
