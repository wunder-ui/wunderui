"use client"

import * as React from "react"
import { Icon } from "@/components/ui/icon-provider"
import { IconButton } from "@/components/ui/icon-button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { opticalCenter } from "@/lib/optical-center"

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

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
  /** The size of the day cells. */
  size?: "sm" | "md"
  /** Overrides "today" (default `new Date()`). */
  today?: Date
  /** Which navigation arrows to show. Hidden arrows keep their slot. */
  navigation?: "both" | "previous" | "next" | "none"
  /** Header style: a plain label or clickable month/year buttons. */
  header?: "label" | "month-year"
  /** Days that get a dot under the number. */
  markedDays?: Date[] | ((date: Date) => boolean)
  /** Label appended to marked days' aria-label. */
  markedLabel?: string
  /** When set, every blocked day is wrapped in a Tooltip with this text. */
  disabledReason?: string
  /** The day whose disabled tooltip starts open (for documentation). */
  reasonDefaultOpenDay?: Date
  /** Status of the calendar data. Anything but "ready" prevents picking. */
  status?: "ready" | "loading" | "empty" | "error"
  /** Shows the range preview up to this day as if it were hovered. */
  hoverDay?: Date
}

type CalendarDayProps = React.ComponentProps<"button"> & {
  size?: "sm" | "md"
  selection?: "none" | "single" | "start" | "middle" | "end" | "preview"
  today?: boolean
  outside?: boolean
  unavailable?: boolean
  marked?: boolean
  interaction?: "rest" | "hover" | "pressed" | "focus"
}

type CalendarPeriodPickerProps = {
  type: "month" | "year"
  month?: Date
  selected?: Date
  today?: Date
  min?: Date
  max?: Date
  onSelect?: (date: Date) => void
  onNavigate?: (reference: Date) => void
  className?: string
}

type CalendarPeriodCellProps = React.ComponentProps<"button"> & {
  selected?: boolean
  current?: boolean
  unavailable?: boolean
  interaction?: "rest" | "hover" | "pressed" | "focus"
}

type CalendarHeaderProps = {
  month: Date
  type?: "label" | "month-year"
  navigation?: "both" | "previous" | "next" | "none"
  size?: "sm" | "md"
  previousDisabled?: boolean
  nextDisabled?: boolean
  onPrevious?: () => void
  onNext?: () => void
  onMonthClick?: () => void
  onYearClick?: () => void
  headingId?: string
  className?: string
}

function CalendarDay({
  size = "md",
  selection = "none",
  today,
  outside,
  unavailable,
  marked,
  interaction = "rest",
  className,
  children,
  ...props
}: CalendarDayProps) {
  const filled = selection === "single" || selection === "start" || selection === "end"
  const band = selection === "middle" || selection === "preview"

  return (
    <button
      type="button"
      className={cn(
        "relative flex items-center justify-center text-sm transition-colors duration-fast ease-entrance outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-(color:--indigo-300)",
        size === "md" ? "size-10" : "size-8",
        selection === "none" || selection === "single" ? "rounded-full" : undefined,
        selection === "start" && "rounded-s-full rounded-e-none",
        selection === "end" && "rounded-e-full rounded-s-none",
        (selection === "middle" || selection === "preview") && "rounded-none",
        outside && !filled && !band && "text-text-tertiary hover:bg-bg-page active:bg-bg-subtle",
        !outside && !filled && !band && "text-foreground hover:bg-bg-page active:bg-bg-subtle",
        filled && "bg-primary text-primary-foreground hover:bg-(--brand-700) active:bg-(--brand-800) focus-visible:outline-neutral-white",
        band && "bg-tint-indigo text-tint-text-indigo hover:bg-tint-indigo active:bg-tint-indigo",
        selection === "preview" && "bg-bg-subtle text-foreground",
        today && !filled && !band && "border border-primary",
        today &&
          filled &&
          "after:absolute after:inset-[3px] after:rounded-full after:border after:border-primary-foreground after:content-['']",
        today && band && "rounded-md border border-tint-text-indigo",
        unavailable && !outside && "cursor-not-allowed opacity-40 hover:bg-transparent active:bg-transparent",
        unavailable && outside && "cursor-not-allowed hover:bg-transparent active:bg-transparent",
        interaction === "hover" && !filled && !band && "bg-bg-page",
        interaction === "pressed" && !filled && !band && "bg-bg-subtle",
        interaction === "focus" &&
          (filled
            ? "outline-2 -outline-offset-2 outline-solid outline-neutral-white"
            : "outline-2 -outline-offset-2 outline-solid outline-(color:--indigo-300)"),
        className
      )}
      {...props}
    >
      {opticalCenter(children)}
      {/* a selected day shows only its filled circle; the dot would sit on top of it (the aria-label still says it is marked) */}
      {marked && !filled && (
        <span
          aria-hidden
          className={cn("absolute left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary", size === "md" ? "bottom-1" : "bottom-0.5")}
        />
      )}
    </button>
  )
}

function CalendarPeriodCell({
  selected,
  current,
  unavailable,
  interaction = "rest",
  className,
  children,
  onClick,
  ...props
}: CalendarPeriodCellProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={unavailable || undefined}
      className={cn(
        "h-10 w-full rounded-md text-sm transition-colors duration-fast ease-entrance outline-none",
        selected && "bg-primary text-primary-foreground hover:bg-(--brand-700) active:bg-(--brand-800)",
        !selected && !unavailable && "text-foreground hover:bg-bg-page active:bg-bg-subtle",
        current && !selected && "border border-primary",
        unavailable && "cursor-not-allowed opacity-40 hover:bg-transparent",
        interaction === "focus" && "border border-primary outline-2 -outline-offset-2 outline-solid outline-(color:--indigo-300)",
        interaction !== "focus" &&
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-(color:--indigo-300)",
        className
      )}
      onClick={unavailable ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  )
}

function CalendarPeriodPicker({ type, month, selected, today, min, max, onSelect, onNavigate, className }: CalendarPeriodPickerProps) {
  const reference = month ?? selected ?? today ?? new Date()
  const [anchorYear, setAnchorYear] = React.useState(() => reference.getFullYear())
  const [windowStart, setWindowStart] = React.useState(() => reference.getFullYear() - 6)

  const isMonth = type === "month"
  const years = Array.from({ length: 12 }, (_, i) => windowStart + i)

  const isUnavailable = (date: Date) => {
    if (isMonth) {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      if (min && monthEnd < startOfDay(min)) return true
      if (max && monthStart > startOfDay(max)) return true
      return false
    } else {
      const yearStart = new Date(date.getFullYear(), 0, 1)
      const yearEnd = new Date(date.getFullYear(), 11, 31)
      if (min && yearEnd < startOfDay(min)) return true
      if (max && yearStart > startOfDay(max)) return true
      return false
    }
  }

  const changeAnchor = (n: number) => {
    if (isMonth) {
      const next = anchorYear + n
      setAnchorYear(next)
      onNavigate?.(new Date(next, reference.getMonth(), 1))
    } else {
      const next = windowStart + n
      setWindowStart(next)
      onNavigate?.(new Date(windowStart + n + 6, reference.getMonth(), 1))
    }
  }

  const title = isMonth ? anchorYear.toString() : `${windowStart} – ${windowStart + 11}`

  const prevDisabled = isMonth
    ? !!min && new Date(anchorYear - 1, 11, 31) < startOfDay(min)
    : !!min && new Date(windowStart - 1, 11, 31) < startOfDay(min)
  const nextDisabled = isMonth
    ? !!max && new Date(anchorYear + 1, 0, 1) > startOfDay(max)
    : !!max && new Date(windowStart + 12, 0, 1) > startOfDay(max)

  return (
    <div className={cn("flex w-[280px] flex-col gap-2", className)}>
      <div className="flex h-9 items-center justify-between">
        <IconButton
          type="button"
          variant="plain"
          size="md"
          aria-label={isMonth ? "Previous year" : "Previous years"}
          disabled={prevDisabled}
          onClick={() => changeAnchor(isMonth ? -1 : -12)}
        >
          <Icon name="chevronLeft" className="size-4" />
        </IconButton>
        <p aria-live="polite" className="text-sm font-semibold text-foreground">
          {title}
        </p>
        <IconButton
          type="button"
          variant="plain"
          size="md"
          aria-label={isMonth ? "Next year" : "Next years"}
          disabled={nextDisabled}
          onClick={() => changeAnchor(isMonth ? 1 : 12)}
        >
          <Icon name="chevronRight" className="size-4" />
        </IconButton>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {isMonth
          ? MONTH_LABELS.map((label, i) => {
              const date = new Date(anchorYear, i, 1)
              const isSelected = !!selected && selected.getFullYear() === anchorYear && selected.getMonth() === i
              const isCurrent = !!today && today.getFullYear() === anchorYear && today.getMonth() === i
              return (
                <CalendarPeriodCell
                  key={i}
                  selected={isSelected}
                  current={isCurrent}
                  unavailable={isUnavailable(date)}
                  aria-label={`${MONTH_NAMES[i]} ${anchorYear}`}
                  onClick={() => onSelect?.(date)}
                >
                  {label}
                </CalendarPeriodCell>
              )
            })
          : years.map((year) => {
              const date = new Date(year, 0, 1)
              const isSelected = !!selected && selected.getFullYear() === year
              const isCurrent = !!today && today.getFullYear() === year
              return (
                <CalendarPeriodCell
                  key={year}
                  selected={isSelected}
                  current={isCurrent}
                  unavailable={isUnavailable(date)}
                  onClick={() => onSelect?.(date)}
                >
                  {year}
                </CalendarPeriodCell>
              )
            })}
      </div>
    </div>
  )
}

function CalendarHeader({
  month,
  type = "label",
  navigation = "both",
  size = "sm",
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
  onMonthClick,
  onYearClick,
  headingId,
  className,
}: CalendarHeaderProps) {
  const headerHeight = size === "md" ? "h-9" : "h-8"
  const navSize = size === "md" ? "md" : "sm"

  const showPrev = navigation === "both" || navigation === "previous"
  const showNext = navigation === "both" || navigation === "next"

  return (
    <div className={cn("flex items-center justify-between", headerHeight)}>
      {showPrev ? (
        <IconButton
          type="button"
          variant="plain"
          size={navSize}
          aria-label="Previous month"
          disabled={previousDisabled}
          onClick={onPrevious}
        >
          <Icon name="chevronLeft" className="size-4" />
        </IconButton>
      ) : (
        <div className={cn(size === "md" ? "size-9" : "size-8")} />
      )}
      {type === "label" ? (
        <p id={headingId} aria-live="polite" className="flex-1 text-center text-sm font-semibold text-foreground">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      ) : (
        <div className="flex flex-1 items-center justify-center gap-1">
          <button
            type="button"
            aria-label={`Choose month, ${MONTH_NAMES[month.getMonth()]}`}
            aria-haspopup="true"
            aria-expanded={false}
            onClick={onMonthClick}
            className="inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-sm font-medium text-foreground transition-colors duration-fast ease-entrance outline-none hover:bg-bg-page active:bg-bg-subtle focus-ring"
          >
            {month.toLocaleDateString("en-US", { month: "short" })}
            <Icon name="chevronDown" className="size-4 text-text-secondary" />
          </button>
          <button
            type="button"
            aria-label={`Choose year, ${month.getFullYear()}`}
            aria-haspopup="true"
            aria-expanded={false}
            onClick={onYearClick}
            className="inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-sm font-medium text-foreground transition-colors duration-fast ease-entrance outline-none hover:bg-bg-page active:bg-bg-subtle focus-ring"
          >
            {month.getFullYear()}
          </button>
          <p id={headingId} className="sr-only">
            {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      )}
      {showNext ? (
        <IconButton type="button" variant="plain" size={navSize} aria-label="Next month" disabled={nextDisabled} onClick={onNext}>
          <Icon name="chevronRight" className="size-4" />
        </IconButton>
      ) : (
        <div className={cn(size === "md" ? "size-9" : "size-8")} />
      )}
    </div>
  )
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  month,
  defaultMonth,
  onMonthChange,
  min,
  max,
  disabled,
  className,
  size = "sm",
  today: todayProp,
  navigation = "both",
  header = "label",
  markedDays,
  markedLabel = "marked",
  disabledReason,
  reasonDefaultOpenDay,
  status = "ready",
  hoverDay,
}: CalendarProps) {
  const initialSelected: Date | undefined = mode === "range" ? (selected as DateRange | undefined)?.from : (selected as Date | undefined)
  const [uncontrolledMonth, setUncontrolledMonth] = React.useState<Date>(() => defaultMonth ?? initialSelected ?? new Date())
  const visibleMonth = month ?? uncontrolledMonth
  const [focusDay, setFocusDay] = React.useState<Date | null>(null)
  const focusPending = React.useRef(false)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const headingId = React.useId()

  const [view, setView] = React.useState<"days" | "month" | "year">("days")
  const [periodPickerMonth, setPeriodPickerMonth] = React.useState<Date>(() => visibleMonth)
  const [previewDay, setPreviewDay] = React.useState<Date | null>(null)

  const days = React.useMemo(() => getMonthGrid(visibleMonth), [visibleMonth])
  const today = React.useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp])
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

  function isMarked(day: Date) {
    if (!markedDays) return false
    return typeof markedDays === "function" ? markedDays(day) : markedDays.some((d) => isSameDay(d, day))
  }

  function clamp(day: Date) {
    if (minDay && day < minDay) return minDay
    if (maxDay && day > maxDay) return maxDay
    return day
  }

  const inVisibleMonth = (d?: Date) => !!d && d.getFullYear() === visibleMonth.getFullYear() && d.getMonth() === visibleMonth.getMonth()
  const inGrid = (d?: Date | null) => !!d && days.some((day) => isSameDay(day, d))

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
  const prevBlocked = !!minDay && prevMonthEnd < minDay
  const nextBlocked = !!maxDay && nextMonthStart > maxDay

  function stepMonth(n: number) {
    changeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + n, 1))
    setFocusDay(clamp(addMonthsClamped(activeDay, n)))
  }

  function handleDayClick(day: Date) {
    if (status !== "ready") return
    setFocusDay(day)
    if (isDisabled(day)) return
    setPreviewDay(null)
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
      case "ArrowLeft":
        next = addDays(day, -1)
        break
      case "ArrowRight":
        next = addDays(day, 1)
        break
      case "ArrowUp":
        next = addDays(day, -7)
        break
      case "ArrowDown":
        next = addDays(day, 7)
        break
      case "Home":
        next = addDays(day, -weekday)
        break
      case "End":
        next = addDays(day, 6 - weekday)
        break
      case "PageUp":
        next = addMonthsClamped(day, event.shiftKey ? -12 : -1)
        break
      case "PageDown":
        next = addMonthsClamped(day, event.shiftKey ? 12 : 1)
        break
      case "Enter":
      case " ":
        if (status !== "ready") return
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

  function daySelection(day: Date): CalendarDayProps["selection"] {
    if (mode !== "range") {
      return isSameDay(day, selected as Date | undefined) ? "single" : "none"
    }
    const range = selected as DateRange | undefined
    if (!range?.from) return "none"
    if (!range.to) {
      if (isSameDay(day, range.from)) return "single"
      const preview = hoverDay ?? previewDay
      if (preview && day > range.from && day < preview) return "preview"
      return "none"
    }
    if (isSameDay(day, range.from) && isSameDay(day, range.to)) return "single"
    if (isSameDay(day, range.from)) return "start"
    if (isSameDay(day, range.to)) return "end"
    if (day > range.from && day < range.to) return "middle"
    const preview = hoverDay ?? previewDay
    if (preview && day > range.from && day < preview) return "preview"
    return "none"
  }

  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7))

  const cellSize = size === "md" ? "size-10" : "size-8"
  const weekdayHeight = "h-6"

  const handlePeriodSelect = (date: Date) => {
    if (view === "month") {
      changeMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    } else {
      changeMonth(new Date(date.getFullYear(), visibleMonth.getMonth(), 1))
    }
    setView("days")
    setFocusDay(null)
    focusPending.current = true
  }

  const range = selected as DateRange | undefined
  const rangeActive = mode === "range" && !!range?.from && !range?.to

  if (view !== "days") {
    return (
      <div
        data-slot="calendar"
        className={cn("w-fit", className)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setView("days")
            setFocusDay(null)
            focusPending.current = true
          }
        }}
      >
        <CalendarPeriodPicker
          type={view}
          month={periodPickerMonth}
          selected={mode === "range" ? (range?.from ?? range?.to) : (selected as Date | undefined)}
          today={today}
          min={min}
          max={max}
          onSelect={handlePeriodSelect}
        />
      </div>
    )
  }

  return (
    <div data-slot="calendar" className={cn("flex w-fit flex-col gap-2", className)}>
      <CalendarHeader
        month={visibleMonth}
        type={header}
        navigation={navigation}
        size={size}
        previousDisabled={prevBlocked}
        nextDisabled={nextBlocked}
        onPrevious={() => stepMonth(-1)}
        onNext={() => stepMonth(1)}
        onMonthClick={() => {
          setPeriodPickerMonth(visibleMonth)
          setView("month")
        }}
        onYearClick={() => {
          setPeriodPickerMonth(visibleMonth)
          setView("year")
        }}
        headingId={headingId}
      />
      <div
        ref={gridRef}
        role="grid"
        aria-labelledby={headingId}
        aria-busy={status === "loading" || undefined}
        className="flex flex-col gap-y-0.5"
        onMouseLeave={() => setPreviewDay(null)}
      >
        <div role="row" className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              role="columnheader"
              aria-label={WEEKDAY_NAMES[i]}
              className={cn("flex items-center justify-center text-[11px] font-medium text-text-secondary", weekdayHeight)}
            >
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div key={w} role="row" className="grid grid-cols-7">
            {week.map((day, weekday) => {
              const outside = day.getMonth() !== visibleMonth.getMonth()
              const { selected: isSelected } = dayState(day)
              const isToday = isSameDay(day, today)
              const isBlocked = isDisabled(day)
              const isTabStop = isSameDay(day, activeDay)
              const marked = isMarked(day)
              const selection = daySelection(day)
              const unavailable = status !== "ready" || isBlocked
              const showTooltip = !!disabledReason && isBlocked
              const isHoverDay = isSameDay(day, hoverDay)

              const dayContent = (
                <CalendarDay
                  type="button"
                  size={size}
                  selection={selection}
                  today={isToday}
                  outside={outside}
                  unavailable={unavailable}
                  marked={marked}
                  interaction={isHoverDay ? "hover" : "rest"}
                  tabIndex={isTabStop ? 0 : -1}
                  data-tab-stop={isTabStop ? "" : undefined}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => handleKeyDown(e, day)}
                  onMouseEnter={() => {
                    if (rangeActive && !outside && day > range.from!) setPreviewDay(day)
                  }}
                  onFocus={() => {
                    if (rangeActive && !outside && day > range.from!) setPreviewDay(day)
                  }}
                  aria-label={`${day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${marked ? `, ${markedLabel}` : ""}${disabledReason && isBlocked ? `, ${disabledReason}` : ""}`}
                  aria-current={isToday ? "date" : undefined}
                  aria-disabled={unavailable || undefined}
                >
                  {day.getDate()}
                </CalendarDay>
              )

              return (
                <div
                  key={weekday}
                  role="gridcell"
                  aria-selected={isSelected}
                  className={cn("relative flex items-center justify-center", cellSize)}
                >
                  {showTooltip ? (
                    <Tooltip defaultOpen={isSameDay(day, reasonDefaultOpenDay)}>
                      <TooltipTrigger render={<div className="flex items-center justify-center" />}>{dayContent}</TooltipTrigger>
                      <TooltipContent side="top">{disabledReason}</TooltipContent>
                    </Tooltip>
                  ) : (
                    dayContent
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export { Calendar, CalendarDay, CalendarPeriodPicker, CalendarPeriodCell, CalendarHeader }
export type { CalendarProps, CalendarDayProps, CalendarPeriodPickerProps, CalendarPeriodCellProps, CalendarHeaderProps, DateRange }
