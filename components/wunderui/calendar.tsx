"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

function isSameDay(a?: Date, b?: Date) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function getMonthGrid(month: Date) {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstOfMonth = new Date(year, m, 1)
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(year, m, 1 - mondayOffset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

type DateRange = { from?: Date; to?: Date }

type CalendarSingleProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date) => void
}

type CalendarRangeProps = {
  mode: "range"
  selected?: DateRange
  onSelect?: (range: DateRange) => void
}

type CalendarProps = (CalendarSingleProps | CalendarRangeProps) & {
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  className?: string
}

function Calendar({ mode = "single", selected, onSelect, month, defaultMonth, onMonthChange, className }: CalendarProps) {
  const initialSelected: Date | undefined = mode === "range" ? (selected as DateRange | undefined)?.from : (selected as Date | undefined)
  const [uncontrolledMonth, setUncontrolledMonth] = React.useState<Date>(
    () => defaultMonth ?? initialSelected ?? new Date()
  )
  const visibleMonth = month ?? uncontrolledMonth

  function changeMonth(next: Date) {
    if (!month) setUncontrolledMonth(next)
    onMonthChange?.(next)
  }

  const days = React.useMemo(() => getMonthGrid(visibleMonth), [visibleMonth])
  const today = React.useMemo(() => startOfDay(new Date()), [])

  function handleDayClick(day: Date) {
    if (mode === "range") {
      const range = (selected as DateRange | undefined) ?? {}
      const onRangeSelect = onSelect as CalendarRangeProps["onSelect"]
      if (!range.from || (range.from && range.to)) {
        onRangeSelect?.({ from: day, to: undefined })
      } else if (day < range.from) {
        onRangeSelect?.({ from: day, to: range.from })
      } else {
        onRangeSelect?.({ from: range.from, to: day })
      }
    } else {
      ;(onSelect as CalendarSingleProps["onSelect"])?.(day)
    }
  }

  function dayState(day: Date) {
    if (mode === "range") {
      const range = selected as DateRange | undefined
      const isStart = isSameDay(day, range?.from)
      const isEnd = isSameDay(day, range?.to)
      const inRange = !!range?.from && !!range?.to && day > range.from && day < range.to
      return { selected: isStart || isEnd, inRange, rangeStart: isStart, rangeEnd: isEnd }
    }
    return { selected: isSameDay(day, selected as Date | undefined), inRange: false, rangeStart: false, rangeEnd: false }
  }

  return (
    <div data-slot="calendar" className={cn("w-fit", className)}>
      <div className="mb-3 flex items-center justify-between">
        <IconButton
          type="button"
          variant="plain"
          size="sm"
          aria-label="Previous month"
          onClick={() => changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
        >
          <ChevronLeft className="size-4" />
        </IconButton>
        <p className="text-sm font-semibold text-foreground">
          {visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <IconButton
          type="button"
          variant="plain"
          size="sm"
          aria-label="Next month"
          onClick={() => changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
        >
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="flex h-8 items-center justify-center text-xs font-medium text-text-tertiary">
            {label}
          </div>
        ))}
        {days.map((day, i) => {
          const outside = day.getMonth() !== visibleMonth.getMonth()
          const { selected: isSelected, inRange, rangeStart, rangeEnd } = dayState(day)
          const isToday = isSameDay(day, today)
          return (
            <div key={i} className={cn("flex h-9 items-center justify-center", inRange && "bg-accent", rangeStart && "rounded-l-full", rangeEnd && "rounded-r-full")}>
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm transition-colors duration-fast ease-entrance hover:bg-muted",
                  outside && "text-text-tertiary",
                  !outside && !isSelected && "text-foreground",
                  isToday && !isSelected && "font-semibold text-text-link",
                  isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {day.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
export type { CalendarProps, DateRange }
