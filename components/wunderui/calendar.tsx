"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function isSameDay(a?: Date, b?: Date) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** The same day n months later, clamped to the last day of the target month (Jan 31 → Feb 28). */
function addMonthsClamped(d: Date, n: number) {
  const lastDay = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), lastDay))
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

/** Days that cannot be picked: a list of dates, or a test that returns true for a blocked day. */
type CalendarDisabled = Date[] | ((date: Date) => boolean)

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
  /** Earliest day that can be picked. Keyboard focus stops here and earlier months cannot be opened. */
  min?: Date
  /** Latest day that can be picked. Keyboard focus stops here and later months cannot be opened. */
  max?: Date
  /** Days inside min–max that cannot be picked. They stay reachable with the arrow keys and are announced as unavailable. */
  disabled?: CalendarDisabled
  className?: string
}

function Calendar({ mode = "single", selected, onSelect, month, defaultMonth, onMonthChange, min, max, disabled, className }: CalendarProps) {
  const initialSelected: Date | undefined = mode === "range" ? (selected as DateRange | undefined)?.from : (selected as Date | undefined)
  const [uncontrolledMonth, setUncontrolledMonth] = React.useState<Date>(
    () => defaultMonth ?? initialSelected ?? new Date()
  )
  const visibleMonth = month ?? uncontrolledMonth
  // The day that holds the grid's single tab stop, once the user has moved it (keyboard, click or month change).
  const [focusDay, setFocusDay] = React.useState<Date | null>(null)
  // Set by keyboard navigation: after the next render the tab-stop day receives DOM focus.
  const focusPending = React.useRef(false)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const headingId = React.useId()

  const days = React.useMemo(() => getMonthGrid(visibleMonth), [visibleMonth])
  const today = React.useMemo(() => startOfDay(new Date()), [])
  const minDay = min ? startOfDay(min) : undefined
  const maxDay = max ? startOfDay(max) : undefined

  function outOfBounds(day: Date) {
    return (!!minDay && day < minDay) || (!!maxDay && day > maxDay)
  }

  function isDisabled(day: Date) {
    if (outOfBounds(day)) return true
    if (!disabled) return false
    return typeof disabled === "function" ? disabled(day) : disabled.some((d) => isSameDay(d, day))
  }

  function clamp(day: Date) {
    if (minDay && day < minDay) return minDay
    if (maxDay && day > maxDay) return maxDay
    return day
  }

  const inVisibleMonth = (d?: Date) =>
    !!d && d.getFullYear() === visibleMonth.getFullYear() && d.getMonth() === visibleMonth.getMonth()
  const inGrid = (d?: Date | null) => !!d && days.some((day) => isSameDay(day, d))

  // Roving tab stop (WAI-ARIA date grid): the moved-to day, else the selected day, else today,
  // else the first day of the month that can be reached — always a day of this grid.
  const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
  const activeDay: Date =
    (focusDay && inGrid(focusDay) ? focusDay : undefined) ??
    (inVisibleMonth(initialSelected) ? startOfDay(initialSelected!) : undefined) ??
    (inVisibleMonth(today) ? today : undefined) ??
    (inVisibleMonth(clamp(firstOfMonth)) ? clamp(firstOfMonth) : firstOfMonth)

  React.useEffect(() => {
    if (!focusPending.current) return
    const target = gridRef.current?.querySelector<HTMLElement>("[data-tab-stop]")
    if (target) {
      focusPending.current = false
      target.focus()
    }
  })

  function changeMonth(next: Date) {
    if (!month) setUncontrolledMonth(next)
    onMonthChange?.(next)
  }

  const prevMonthEnd = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 0)
  const nextMonthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
  // A month that lies completely outside min–max cannot be opened.
  const prevBlocked = !!minDay && prevMonthEnd < minDay
  const nextBlocked = !!maxDay && nextMonthStart > maxDay

  function stepMonth(n: number) {
    changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + n, 1))
    // The tab stop follows: same day in the new month, clamped to its length and to min–max.
    setFocusDay(clamp(addMonthsClamped(activeDay, n)))
  }

  function handleDayClick(day: Date) {
    setFocusDay(day)
    if (isDisabled(day)) return
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

  function handleKeyDown(event: React.KeyboardEvent, day: Date) {
    let next: Date | undefined
    const weekday = (day.getDay() + 6) % 7
    switch (event.key) {
      case "ArrowLeft": next = addDays(day, -1); break
      case "ArrowRight": next = addDays(day, 1); break
      case "ArrowUp": next = addDays(day, -7); break
      case "ArrowDown": next = addDays(day, 7); break
      case "Home": next = addDays(day, -weekday); break
      case "End": next = addDays(day, 6 - weekday); break
      case "PageUp": next = addMonthsClamped(day, event.shiftKey ? -12 : -1); break
      case "PageDown": next = addMonthsClamped(day, event.shiftKey ? 12 : 1); break
      case "Enter":
      case " ":
        event.preventDefault()
        handleDayClick(day)
        return
      default:
        return
    }
    event.preventDefault()
    next = clamp(next)
    if (!inVisibleMonth(next)) changeMonth(new Date(next.getFullYear(), next.getMonth(), 1))
    focusPending.current = true
    setFocusDay(next)
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

  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7))

  return (
    <div data-slot="calendar" className={cn("w-fit", className)}>
      <div className="mb-3 flex items-center justify-between">
        <IconButton
          type="button"
          variant="plain"
          size="sm"
          aria-label="Previous month"
          disabled={prevBlocked}
          onClick={() => stepMonth(-1)}
        >
          <ChevronLeft className="size-4" />
        </IconButton>
        <p id={headingId} aria-live="polite" className="text-sm font-semibold text-foreground">
          {/* Fixed locale like the weekday labels, so server and browser render the same text. */}
          {visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <IconButton
          type="button"
          variant="plain"
          size="sm"
          aria-label="Next month"
          disabled={nextBlocked}
          onClick={() => stepMonth(1)}
        >
          <ChevronRight className="size-4" />
        </IconButton>
      </div>
      <div ref={gridRef} role="grid" aria-labelledby={headingId} className="flex flex-col gap-y-1">
        <div role="row" className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              role="columnheader"
              aria-label={WEEKDAY_NAMES[i]}
              className="flex h-8 items-center justify-center text-xs font-medium text-text-tertiary"
            >
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div key={w} role="row" className="grid grid-cols-7">
            {week.map((day, weekday) => {
              const outside = day.getMonth() !== visibleMonth.getMonth()
              const { selected: isSelected, inRange, rangeStart, rangeEnd } = dayState(day)
              const isToday = isSameDay(day, today)
              const isBlocked = isDisabled(day)
              const isTabStop = isSameDay(day, activeDay)
              // The band runs under the two end circles up to their centres, so it reads as one
              // continuous shape: the start circle covers its left half, the end circle its right half.
              const band = mode === "range" && !!(selected as DateRange | undefined)?.from && !!(selected as DateRange | undefined)?.to && !isSameDay((selected as DateRange).from, (selected as DateRange).to)
              return (
                <div
                  key={weekday}
                  role="gridcell"
                  aria-selected={isSelected}
                  className={cn(
                    "relative flex h-9 items-center justify-center",
                    inRange && "bg-accent",
                    // the band is rounded where a week starts and ends
                    inRange && weekday === 0 && "rounded-l-full",
                    inRange && weekday === 6 && "rounded-r-full",
                    band && rangeStart && "before:absolute before:inset-y-0 before:right-0 before:left-1/2 before:bg-accent before:content-['']",
                    band && rangeEnd && "before:absolute before:inset-y-0 before:right-1/2 before:left-0 before:bg-accent before:content-['']"
                  )}
                >
                  <button
                    type="button"
                    tabIndex={isTabStop ? 0 : -1}
                    data-tab-stop={isTabStop ? "" : undefined}
                    onClick={() => handleDayClick(day)}
                    onKeyDown={(e) => handleKeyDown(e, day)}
                    aria-label={day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    aria-current={isToday ? "date" : undefined}
                    aria-disabled={isBlocked || undefined}
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-full text-sm transition-colors duration-fast ease-entrance hover:bg-muted/50",
                      outside && "text-text-tertiary",
                      !outside && !isSelected && "text-foreground",
                      isToday && !isSelected && "font-semibold text-text-link",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                      isBlocked && "cursor-not-allowed opacity-40 hover:bg-transparent"
                    )}
                  >
                    {day.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export { Calendar }
export type { CalendarProps, DateRange }
