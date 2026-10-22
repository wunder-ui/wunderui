"use client"

import * as React from "react"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar, type CalendarProps, type DateRange } from "@/components/wunderui/calendar"
import { cn } from "@/lib/utils"

function formatDate(date?: Date) {
  if (!date) return undefined
  // Fixed locale (as in Calendar), so server and browser render the same text.
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatRange(range?: DateRange) {
  if (!range?.from) return undefined
  return range.to ? `${formatDate(range.from)} – ${formatDate(range.to)}` : formatDate(range.from)
}

function addMonths(date: Date, n: number) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

type DatePreset = { label: string; range: () => DateRange }

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** A range cut to `min` and `max` (whole days). */
function clampRange(range: DateRange, min?: Date, max?: Date): DateRange {
  let from = range.from && startOfDay(range.from)
  let to = range.to && startOfDay(range.to)
  if (min) {
    const lo = startOfDay(min)
    if (from && from < lo) from = lo
    if (to && to < lo) to = lo
  }
  if (max) {
    const hi = startOfDay(max)
    if (from && from > hi) from = hi
    if (to && to > hi) to = hi
  }
  return { from, to }
}

/** The quick ranges of the Figma Date Picker · Type=presets sidebar. */
const DEFAULT_PRESETS: DatePreset[] = [
  { label: "Today", range: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 days", range: () => ({ from: daysAgo(6), to: new Date() }) },
  { label: "Last 30 days", range: () => ({ from: daysAgo(29), to: new Date() }) },
  { label: "Last 3 months", range: () => ({ from: addMonths(new Date(), -3), to: new Date() }) },
  { label: "Last 12 months", range: () => ({ from: addMonths(new Date(), -12), to: new Date() }) },
  { label: "Month to date", range: () => ({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() }) },
  { label: "Year to date", range: () => ({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() }) },
]

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

type DatePickerSingleProps = {
  mode?: "single"
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
}

type DatePickerRangeProps = {
  mode: "range"
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  /** Quick-select sidebar (Figma: Type=presets). `true` uses the built-in presets. */
  presets?: boolean | DatePreset[]
  /** Months shown side by side. Defaults to 2 for range mode. */
  numberOfMonths?: 1 | 2
}

type DatePickerProps = (DatePickerSingleProps | DatePickerRangeProps) & {
  placeholder?: string
  /** Earliest day that can be picked (passed to Calendar). */
  min?: Date
  /** Latest day that can be picked (passed to Calendar). */
  max?: Date
  /** Days that cannot be picked: a list of dates or a test (passed to Calendar). */
  disabled?: CalendarProps["disabled"]
  className?: string
}

/**
 * DatePicker — mirrors the Figma Date Picker set: Type=single (one month),
 * Type=range (two months, start/end), Type=presets (range + quick-select sidebar).
 */
function DatePicker(props: DatePickerProps) {
  const { placeholder, className, min, max, disabled } = props
  const isRange = props.mode === "range"
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState<Date | DateRange | undefined>(props.defaultValue)
  const isControlled = props.value !== undefined
  const selected = isControlled ? props.value : uncontrolled
  const [draft, setDraft] = React.useState<Date | DateRange | undefined>(selected)
  const [month, setMonth] = React.useState<Date>(() => {
    const d = isRange ? (selected as DateRange | undefined)?.from : (selected as Date | undefined)
    return addMonths(d ?? new Date(), 0)
  })

  const presets = isRange ? (props.presets === true ? DEFAULT_PRESETS : props.presets || null) : null
  const months = isRange ? (props.numberOfMonths ?? 2) : 1

  function handleOpenChange(next: boolean) {
    if (next) setDraft(selected)
    setOpen(next)
  }

  function apply() {
    if (!isControlled) setUncontrolled(draft)
    if (isRange) (props as DatePickerRangeProps).onValueChange?.(draft as DateRange | undefined)
    else (props as DatePickerSingleProps).onValueChange?.(draft as Date | undefined)
    setOpen(false)
  }

  const display = isRange ? formatRange(selected as DateRange | undefined) : formatDate(selected as Date | undefined)
  const draftRange = draft as DateRange | undefined

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger render={<Button variant="plain" className={cn(isRange ? "w-72" : "w-56", "justify-start font-normal", className)} />}>
        <CalendarDays className="size-4" />
        {display ?? <span className="text-text-tertiary">{placeholder ?? (isRange ? "Pick a date range" : "Pick a date")}</span>}
      </PopoverTrigger>
      <PopoverContent aria-label={isRange ? "Choose a date range" : "Choose a date"} className="w-auto p-0">
        <div className="flex">
          {presets && (
            <div className="flex w-40 flex-col gap-0.5 border-r border-border p-3">
              {presets.map((p) => {
                // a preset is cut to min and max; one that falls entirely outside them is switched off
                const raw = p.range()
                const r = clampRange(raw, min, max)
                const unavailable = !raw.from || !raw.to || (!!min && startOfDay(raw.to) < startOfDay(min)) || (!!max && startOfDay(raw.from) > startOfDay(max))
                const active = draftRange?.from?.toDateString() === r.from?.toDateString() && draftRange?.to?.toDateString() === r.to?.toDateString()
                return (
                  <button key={p.label} type="button" disabled={unavailable} onClick={() => (setDraft(r), setMonth(addMonths(r.from ?? new Date(), 0)))} className={cn("rounded-lg px-3 py-2 disabled:pointer-events-none disabled:opacity-40 text-left text-xs font-medium transition-colors duration-fast ease-entrance", active ? "bg-subtle font-semibold text-foreground" : "text-text-secondary hover:bg-subtle hover:text-foreground")}>
                    {p.label}
                  </button>
                )
              })}
            </div>
          )}
          <div className="flex gap-6 p-3">
            {Array.from({ length: months }).map((_, i) =>
              isRange ? (
                <Calendar key={i} mode="range" selected={draftRange} onSelect={setDraft} month={addMonths(month, i)} onMonthChange={(m) => setMonth(addMonths(m, -i))} min={min} max={max} disabled={disabled} />
              ) : (
                <Calendar key={i} mode="single" selected={draft as Date | undefined} onSelect={setDraft} month={month} onMonthChange={setMonth} min={min} max={max} disabled={disabled} />
              )
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-3">
          <Button variant="plain" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DEFAULT_PRESETS as datePickerPresets }
export type { DatePickerProps, DatePreset }
