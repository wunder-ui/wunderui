"use client"

import * as React from "react"
import { CalendarDays, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar, type CalendarProps, type DateRange } from "@/components/wunderui/calendar"
import { cn } from "@/lib/utils"

function formatDate(date?: Date) {
  if (!date) return undefined
  // Fixed locale (as in Calendar), so server and browser render the same text.
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatDateShort(date?: Date) {
  if (!date) return undefined
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatRange(range?: DateRange) {
  if (!range?.from) return undefined
  return range.to ? `${formatDate(range.from)} – ${formatDate(range.to)}` : formatDate(range.from)
}

function addMonths(date: Date, n: number) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

type DatePreset = { label: string; range: (ctx: { today: Date; min?: Date }) => DateRange }

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

function daysAgo(today: Date, n: number) {
  const d = startOfDay(today)
  d.setDate(d.getDate() - n)
  return d
}

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
  { label: "Today", range: ({ today }) => ({ from: today, to: today }) },
  { label: "Last 7 days", range: ({ today }) => ({ from: daysAgo(today, 6), to: today }) },
  { label: "Last 30 days", range: ({ today }) => ({ from: daysAgo(today, 29), to: today }) },
  { label: "Last 3 months", range: ({ today }) => ({ from: addMonths(today, -3), to: today }) },
  { label: "Last 12 months", range: ({ today }) => ({ from: addMonths(today, -12), to: today }) },
  { label: "Month to date", range: ({ today }) => ({ from: new Date(today.getFullYear(), today.getMonth(), 1), to: today }) },
  { label: "Year to date", range: ({ today }) => ({ from: new Date(today.getFullYear(), 0, 1), to: today }) },
  { label: "All time", range: ({ today, min }) => ({ from: min ?? new Date(2020, 0, 1), to: today }) },
]

type Mode = "single" | "range"
type Selected = Date | DateRange | undefined

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
  appearance?: "button" | "field"
  label?: string
  helperText?: string | false
  error?: string
  fieldState?: "default" | "disabled" | "readonly"
  typeable?: boolean
  defaultText?: string
  today?: Date
  confirmation?: "apply" | "instant"
  unit?: "days" | "nights"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  /** Earliest day that can be picked (passed to Calendar). */
  min?: Date
  /** Latest day that can be picked (passed to Calendar). */
  max?: Date
  /** Days that cannot be picked: a list of dates or a test (passed to Calendar). */
  disabled?: CalendarProps["disabled"]
  className?: string
}

type DatePickerPanelProps = {
  mode?: "single" | "range"
  value?: Date | DateRange
  onApply?: (value: Date | DateRange | undefined) => void
  onCancel?: () => void
  confirmation?: "apply" | "instant"
  presets?: boolean | DatePreset[]
  numberOfMonths?: 1 | 2
  stacked?: boolean
  min?: Date
  max?: Date
  disabled?: CalendarProps["disabled"]
  today?: Date
  defaultMonth?: Date
  unit?: "days" | "nights"
  error?: string
  surface?: boolean
  header?: "label" | "month-year"
  className?: string
}

type DatePickerFieldProps = {
  mode?: Mode
  value?: Date | DateRange
  label?: string
  helperText?: string | false
  error?: string
  fieldState?: "default" | "disabled" | "readonly"
  placeholder?: string
  open?: boolean
  className?: string
  id?: string
}

type DatePickerFooterProps = {
  summary: React.ReactNode
  invalid?: boolean
  applyDisabled?: boolean
  onCancel?: () => void
  onApply?: () => void
  className?: string
}

const SINGLE_FORMAT = "MM/DD/YYYY"
const SINGLE_PLACEHOLDER = "Pick a date"
const RANGE_PLACEHOLDER = "Pick a date range"
const FIELD_SINGLE_PLACEHOLDER = "MM/DD/YYYY"
const FIELD_RANGE_PLACEHOLDER = "MM/DD/YYYY – MM/DD/YYYY"

const DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
]
const MONTH_ABBR = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

function parseMonthToken(token: string) {
  const lower = token.toLowerCase()
  const abbrIndex = MONTH_ABBR.indexOf(lower)
  if (abbrIndex !== -1) return abbrIndex
  const fullIndex = MONTH_NAMES.indexOf(lower)
  if (fullIndex !== -1) return fullIndex
  return -1
}

function parseFormattedDate(text: string): Date | undefined {
  const trimmed = text.trim()
  const numeric = DATE_RE.exec(trimmed)
  if (numeric) {
    const month = Number(numeric[1])
    const day = Number(numeric[2])
    const year = Number(numeric[3])
    if (month < 1 || month > 12) return undefined
    if (day < 1 || day > 31) return undefined
    const date = new Date(year, month - 1, day)
    if (date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
    return date
  }
  const named = /^([a-zA-Z]+)\s+(\d{1,2}),\s+(\d{4})$/.exec(trimmed)
  if (named) {
    const month = parseMonthToken(named[1])
    const day = Number(named[2])
    const year = Number(named[3])
    if (month === -1 || day < 1 || day > 31) return undefined
    const date = new Date(year, month, day)
    if (date.getMonth() !== month || date.getDate() !== day) return undefined
    return date
  }
  return undefined
}

function isSameDay(a?: Date, b?: Date) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isOutsideRange(date: Date, min?: Date, max?: Date) {
  const minDay = min ? startOfDay(min) : undefined
  const maxDay = max ? startOfDay(max) : undefined
  if (minDay && date < minDay) return true
  if (maxDay && date > maxDay) return true
  return false
}

function isDisabledDate(date: Date, disabled?: CalendarProps["disabled"]) {
  if (!disabled) return false
  return typeof disabled === "function" ? disabled(date) : disabled.some((d) => isSameDay(d, date))
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return matches
}

function FieldControl({
  fieldState = "default",
  invalid,
  open,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  fieldState?: "default" | "disabled" | "readonly"
  invalid?: boolean
  open?: boolean
}) {
  const disabled = fieldState === "disabled"

  if (fieldState === "readonly") {
    const { ref: _ref, ...divProps } = props as Omit<React.ComponentProps<"button">, "type" | "disabled" | "aria-readonly">
    return (
      <div
        role="textbox"
        aria-readonly="true"
        aria-invalid={invalid || undefined}
        tabIndex={0}
        className={cn(
          "flex h-(--field-md) w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-foreground transition-colors duration-fast ease-entrance outline-none hover:border-text-muted focus-ring bg-bg-subtle",
          invalid && "border-error text-error focus-ring-error",
          className
        )}
        {...(divProps as React.HTMLAttributes<HTMLDivElement>)}
      >
        {children}
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-expanded={open || undefined}
      className={cn(
        "flex h-(--field-md) w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-foreground transition-colors duration-fast ease-entrance outline-none hover:border-text-muted focus-ring disabled:pointer-events-none disabled:opacity-40",
        invalid && "border-error text-error focus-ring-error",
        open && (invalid ? "focus-ring-on-error" : "focus-ring-on"),
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function FieldValue({
  mode,
  value,
  singlePlaceholder,
  rangePlaceholder,
  id,
}: {
  mode: Mode
  value?: Selected
  singlePlaceholder: string
  rangePlaceholder: string
  id: string
}) {
  if (mode === "single") {
    const date = value as Date | undefined
    return (
      <span id={id} className="min-w-0 flex-1 truncate text-left">
        {date ? (
          <span className="text-foreground">{formatDate(date)}</span>
        ) : (
          <span className="text-text-tertiary">{singlePlaceholder}</span>
        )}
      </span>
    )
  }

  const range = value as DateRange | undefined
  if (!range?.from) {
    return (
      <span id={id} className="min-w-0 flex-1 truncate text-left">
        <span className="text-text-tertiary">{rangePlaceholder}</span>
      </span>
    )
  }

  if (!range.to) {
    return (
      <span id={id} className="min-w-0 flex-1 truncate text-left">
        <span>{formatDate(range.from)} – </span>
        <span className="text-text-tertiary">MM/DD/YYYY</span>
      </span>
    )
  }

  return (
    <span id={id} className="min-w-0 flex-1 truncate text-left">
      <span>
        {formatDate(range.from)} – {formatDate(range.to)}
      </span>
    </span>
  )
}

function HelperLine({
  id,
  error,
  helperText,
  mode,
  rangeFromOnly,
}: {
  id: string
  error?: string
  helperText?: string | false
  mode: Mode
  rangeFromOnly?: boolean
}) {
  if (error) {
    return (
      <p id={id} className="flex items-center gap-1 text-xs text-error">
        <CircleAlert className="size-3.5 shrink-0" />
        {error}
      </p>
    )
  }

  let text = helperText === false ? undefined : helperText
  if (text === undefined) {
    if (mode === "range" && rangeFromOnly) {
      text = "Select an end date to finish the range."
    } else {
      text = mode === "single" ? "Format: MM/DD/YYYY" : "Format: MM/DD/YYYY – MM/DD/YYYY"
    }
  }

  if (!text) return null

  return (
    <p id={id} className="text-xs text-text-secondary">
      {text}
    </p>
  )
}

function getValueFromRange(range: DateRange, unit: "days" | "nights") {
  if (!range?.from || !range?.to) return undefined
  const from = startOfDay(range.from)
  const to = startOfDay(range.to)
  const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return unit === "nights" ? days - 1 : days
}

function formatRangeSummary(range: DateRange, unit: "days" | "nights") {
  if (!range?.from) return "No dates selected"
  if (!range.to) return `${formatDate(range.from)} – select an end date`

  const count = getValueFromRange(range, unit)
  const countLabel = count === 1 ? `1 ${unit === "nights" ? "night" : "day"}` : `${count} ${unit}`

  const sameYear = range.from.getFullYear() === range.to.getFullYear()
  if (sameYear) {
    return `${formatDateShort(range.from)} – ${formatDateShort(range.to)}, ${range.to.getFullYear()} · ${countLabel}`
  }
  return `${formatDate(range.from)} – ${formatDate(range.to)} · ${countLabel}`
}

function DatePickerFooter({ summary, invalid, applyDisabled, onCancel, onApply, className }: DatePickerFooterProps) {
  return (
    <div className={cn("flex items-center gap-2 border-t border-border pt-3", className)}>
      <p className={cn("flex-1 text-xs", invalid ? "text-error" : "text-text-secondary")}>{summary}</p>
      <Button variant="plain" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="primary" disabled={applyDisabled} onClick={onApply}>
        Apply
      </Button>
    </div>
  )
}

function DatePickerField({
  mode = "single",
  value,
  label,
  helperText,
  error,
  fieldState = "default",
  placeholder,
  open,
  className,
  id,
}: DatePickerFieldProps) {
  const fallbackId = React.useId()
  const resolvedId = id ?? fallbackId
  const labelId = `${resolvedId}-label`
  const valueId = `${resolvedId}-value`
  const helperId = `${resolvedId}-helper`

  const range = value as DateRange | undefined
  const rangeFromOnly = mode === "range" && !!range?.from && !range?.to
  const invalid = !!error || (mode === "range" && !!range?.from && !!range?.to && range.to < range.from)

  const hasHelper = !!error || helperText !== false

  return (
    <div className="flex w-full max-w-[320px] flex-col gap-2">
      {label && (
        <label id={labelId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-1">
        <FieldControl
          fieldState={fieldState}
          invalid={invalid}
          open={open}
          className={className}
          aria-labelledby={label ? `${labelId} ${valueId}` : valueId}
          aria-describedby={hasHelper ? helperId : undefined}
        >
          <CalendarDays className={cn("size-4 shrink-0", invalid ? "text-error" : "text-text-secondary")} />
          <FieldValue
            mode={mode}
            value={value}
            id={valueId}
            singlePlaceholder={placeholder ?? FIELD_SINGLE_PLACEHOLDER}
            rangePlaceholder={placeholder ?? FIELD_RANGE_PLACEHOLDER}
          />
          {invalid && <CircleAlert className="size-4 shrink-0 text-error" />}
        </FieldControl>
        {hasHelper && <HelperLine id={helperId} error={error} helperText={helperText} mode={mode} rangeFromOnly={rangeFromOnly} />}
      </div>
    </div>
  )
}

function DatePickerPanel({
  mode = "single",
  value,
  onApply,
  onCancel,
  confirmation = "apply",
  presets,
  numberOfMonths,
  stacked,
  min,
  max,
  disabled,
  today: todayProp,
  defaultMonth,
  unit = "days",
  error,
  surface,
  header = "label",
  className,
}: DatePickerPanelProps) {
  const isRange = mode === "range"

  const [draft, setDraft] = React.useState<Selected>(() => {
    if (!value) return undefined
    if (isRange) {
      const range = value as DateRange
      return range.from || range.to ? { from: range.from, to: range.to } : undefined
    }
    return value as Date
  })

  const draftRange = draft as DateRange | undefined
  const draftDate = draft as Date | undefined

  React.useEffect(() => {
    const next = (() => {
      if (!value) return undefined
      if (isRange) {
        const range = value as DateRange
        return range.from || range.to ? { from: range.from, to: range.to } : undefined
      }
      return value as Date
    })()
    if (isRange) {
      const nextRange = next as DateRange | undefined
      if (draftRange?.from?.getTime() !== nextRange?.from?.getTime() || draftRange?.to?.getTime() !== nextRange?.to?.getTime()) {
        setDraft(next)
      }
    } else {
      if (draftDate?.getTime() !== (next as Date | undefined)?.getTime()) {
        setDraft(next)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const today = React.useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp])

  const initialMonth = React.useMemo(() => {
    if (defaultMonth) return startOfDay(defaultMonth)
    const d = isRange ? draftRange?.from : draftDate
    if (d) return startOfDay(d)
    return today
  }, [defaultMonth, isRange, draftRange?.from, draftDate, today])

  const [month, setMonth] = React.useState<Date>(() => addMonths(initialMonth, 0))

  React.useEffect(() => {
    setMonth(addMonths(initialMonth, 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMonth.getTime()])

  const presetList = isRange ? (presets === true ? DEFAULT_PRESETS : presets || null) : null

  const months = isRange ? (numberOfMonths ?? 2) : 1

  const canApply = (() => {
    if (error) return false
    if (isRange) {
      return !!draftRange?.from && !!draftRange?.to && draftRange.to >= draftRange.from
    }
    return !!draftDate
  })()

  function handleApply() {
    onApply?.(draft)
  }

  function handleCancel() {
    onCancel?.()
  }

  function handleSingleSelect(day: Date) {
    if (confirmation === "instant") {
      onApply?.(day)
      return
    }
    setDraft(day)
  }

  function handleRangeSelect(range: DateRange) {
    setDraft(range)
    // Without a footer there is no Apply button, so a finished range (both ends set) is applied as soon as it is picked.
    if (confirmation === "instant" && range.from && range.to && range.to >= range.from) onApply?.(range)
  }

  const rangeIncomplete = isRange && !!draftRange?.from && !draftRange?.to

  const footerError =
    error ||
    (isRange && !!draftRange?.from && !!draftRange?.to && draftRange.to < draftRange.from
      ? "The end date must be after the start date."
      : undefined)

  const summaryText = (() => {
    if (footerError) return footerError
    if (isRange) {
      return formatRangeSummary(draftRange ?? {}, unit)
    }
    return draftDate ? formatDate(draftDate) : "No date selected"
  })()

  const presetActive = (preset: DatePreset) => {
    const raw = preset.range({ today, min })
    const r = clampRange(raw, min, max)
    return draftRange?.from?.toDateString() === r.from?.toDateString() && draftRange?.to?.toDateString() === r.to?.toDateString()
  }

  const presetDisabled = (preset: DatePreset) => {
    const raw = preset.range({ today, min })
    if (!raw.from || !raw.to) return true
    if (min && startOfDay(raw.to) < startOfDay(min)) return true
    if (max && startOfDay(raw.from) > startOfDay(max)) return true
    return false
  }

  function handlePresetClick(preset: DatePreset) {
    const raw = preset.range({ today, min })
    const r = clampRange(raw, min, max)
    setDraft(r)
    setMonth(addMonths(r.from ?? today, 0))
    // A preset is a finished range: with instant confirmation (no footer) it applies right away.
    if (confirmation === "instant" && r.from && r.to) onApply?.(r)
  }

  return (
    <div
      className={cn(
        "flex w-fit flex-col gap-4 p-4 text-sm text-popover-foreground",
        surface && "rounded-lg border border-border bg-popover shadow-lg",
        className
      )}
    >
      <div className="flex gap-6">
        {presetList && (
          <div className="flex w-[165px] shrink-0 flex-col gap-0.5 border-r border-border pr-4">
            {presetList.map((preset) => {
              const active = presetActive(preset)
              const unavailable = presetDisabled(preset)
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={unavailable}
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "rounded-lg px-3 py-2 outline-none focus-ring disabled:pointer-events-none disabled:opacity-40 text-left text-xs font-medium transition-colors duration-fast ease-entrance",
                    active
                      ? "bg-subtle font-semibold text-foreground"
                      : "text-text-secondary hover:bg-bg-page hover:text-foreground active:bg-bg-subtle"
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        )}
        <div className={cn("flex gap-6", stacked && "flex-col")}>
          {Array.from({ length: months }).map((_, i) => {
            const isFirst = i === 0
            const isLast = i === months - 1
            const navigation = months === 1 ? "both" : isFirst ? "previous" : isLast ? "next" : "none"
            return isRange ? (
              <Calendar
                key={i}
                mode="range"
                size="md"
                header={header}
                selected={draftRange}
                onSelect={handleRangeSelect}
                month={addMonths(month, i)}
                onMonthChange={(m) => setMonth(addMonths(m, -i))}
                min={min}
                max={max}
                disabled={disabled}
                today={today}
                navigation={navigation}
              />
            ) : (
              <Calendar
                key={i}
                mode="single"
                size="md"
                header={header}
                selected={draftDate}
                onSelect={handleSingleSelect}
                month={month}
                onMonthChange={(m) => setMonth(m)}
                min={min}
                max={max}
                disabled={disabled}
                today={today}
                navigation={navigation}
              />
            )
          })}
        </div>
      </div>
      {confirmation !== "instant" && (
        <DatePickerFooter
          summary={summaryText}
          invalid={!!footerError}
          applyDisabled={!canApply}
          onCancel={handleCancel}
          onApply={handleApply}
        />
      )}
    </div>
  )
}

function DatePicker(props: DatePickerProps) {
  const {
    appearance = "button",
    label,
    helperText,
    error: errorProp,
    fieldState = "default",
    typeable,
    defaultText,
    today: todayProp,
    confirmation = "apply",
    unit = "days",
    placeholder,
    min,
    max,
    disabled,
    className,
  } = props

  const isRange = props.mode === "range"
  const isField = appearance === "field"
  const isDisabled = fieldState === "disabled"
  const isReadonly = fieldState === "readonly"
  const canOpen = !isDisabled && !isReadonly

  const [internalOpen, setInternalOpen] = React.useState<boolean>(props.defaultOpen ?? false)
  const isControlledOpen = props.open !== undefined
  const open = isControlledOpen ? !!props.open : internalOpen
  const [openCounter, setOpenCounter] = React.useState(0)

  const [uncontrolled, setUncontrolled] = React.useState<Selected>(props.defaultValue)
  const isControlled = props.value !== undefined
  const selected = isControlled ? props.value : uncontrolled

  const today = React.useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp])

  const narrow = useMediaQuery("(max-width: 830px)")
  const compact = useMediaQuery("(max-width: 650px)")

  const inputRef = React.useRef<HTMLInputElement>(null)

  function setOpen(next: boolean) {
    if (next) setOpenCounter((c) => c + 1)
    setInternalOpen(next)
    props.onOpenChange?.(next)
  }

  function handleOpenChange(next: boolean) {
    if (!canOpen) return
    setOpen(next)
  }

  function commit(value: Selected) {
    if (!isControlled) setUncontrolled(value)
    if (isRange) {
      ;(props as DatePickerRangeProps).onValueChange?.(value as DateRange | undefined)
    } else {
      ;(props as DatePickerSingleProps).onValueChange?.(value as Date | undefined)
    }
  }

  function handleApply(value: Selected) {
    commit(value)
    setOpen(false)
  }

  function handleCancel() {
    setOpen(false)
  }

  const display = isRange ? formatRange(selected as DateRange | undefined) : formatDate(selected as Date | undefined)
  const displayPlaceholder = placeholder ?? (isRange ? RANGE_PLACEHOLDER : SINGLE_PLACEHOLDER)
  const fieldPlaceholder = placeholder ?? (isRange ? FIELD_RANGE_PLACEHOLDER : FIELD_SINGLE_PLACEHOLDER)

  const rangeValue = selected as DateRange | undefined
  const rangeInvalid = isRange && !!rangeValue?.from && !!rangeValue?.to && rangeValue.to < rangeValue.from
  const error = errorProp || (rangeInvalid ? "The end date must be after the start date." : undefined)

  const labelId = React.useId()
  const valueId = React.useId()
  const helperId = React.useId()
  const controlRef = React.useRef<HTMLDivElement>(null)

  const [text, setText] = React.useState<string>(() => {
    if (defaultText !== undefined) return defaultText
    return isRange ? (formatRange(selected as DateRange | undefined) ?? "") : (formatDate(selected as Date | undefined) ?? "")
  })
  const [textError, setTextError] = React.useState<string | undefined>(undefined)
  const [rangeIncomplete, setRangeIncomplete] = React.useState(false)
  const [rangeFromOnly, setRangeFromOnly] = React.useState(false)

  const formattedValue = React.useMemo(() => {
    return isRange ? (formatRange(selected as DateRange | undefined) ?? "") : (formatDate(selected as Date | undefined) ?? "")
  }, [isRange, selected])

  React.useEffect(() => {
    if (defaultText !== undefined) return
    setText(formattedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedValue])

  function parseSingleText(raw: string): Date | "empty" | "invalid" {
    const trimmed = raw.trim()
    if (!trimmed) return "empty"
    const date = parseFormattedDate(trimmed)
    if (!date) return "invalid"
    if (isOutsideRange(date, min, max)) return "invalid"
    if (isDisabledDate(date, disabled)) return "invalid"
    return date
  }

  function parseRangeText(raw: string): DateRange | "empty" | "invalid" | "incomplete" | "end-before-start" {
    const trimmed = raw.trim()
    if (!trimmed) return "empty"
    const parts = trimmed.split(/\s+[–-]\s+/)
    if (parts.length === 1) {
      const first = parseSingleText(parts[0])
      if (first === "empty") return "empty"
      if (first === "invalid") return "invalid"
      return { from: first as Date, to: undefined }
    }
    if (parts.length !== 2) return "invalid"
    const first = parseSingleText(parts[0])
    if (first === "empty") return "invalid"
    if (first === "invalid") return "invalid"
    const secondRaw = parts[1].trim()
    if (!secondRaw || secondRaw === SINGLE_FORMAT || secondRaw === "MM/DD/YYYY") {
      return { from: first as Date, to: undefined }
    }
    const second = parseSingleText(secondRaw)
    if (second === "empty") return "incomplete"
    if (second === "invalid") return "invalid"
    const from = first as Date
    const to = second as Date
    if (to < from) return "end-before-start"
    return { from, to }
  }

  const initialDefaultTextState = React.useMemo(() => {
    if (defaultText === undefined || !isField) return undefined
    if (isRange) {
      const result = parseRangeText(defaultText)
      if (result === "invalid") {
        return { textError: "Enter a valid date, for example 10/14/2026.", rangeIncomplete: false, rangeFromOnly: false }
      }
      if (result === "end-before-start") {
        return { textError: "The end date must be after the start date.", rangeIncomplete: false, rangeFromOnly: false }
      }
      if (result === "incomplete") {
        return { textError: undefined, rangeIncomplete: true, rangeFromOnly: false }
      }
      if (typeof result === "object" && result.from && !result.to) {
        return { textError: undefined, rangeIncomplete: false, rangeFromOnly: true }
      }
      return { textError: undefined, rangeIncomplete: false, rangeFromOnly: false }
    }
    const result = parseSingleText(defaultText)
    if (result === "invalid") {
      return { textError: "Enter a valid date, for example 10/14/2026.", rangeIncomplete: false, rangeFromOnly: false }
    }
    return { textError: undefined, rangeIncomplete: false, rangeFromOnly: false }
  }, [defaultText, isField, isRange]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!initialDefaultTextState) return
    setTextError(initialDefaultTextState.textError)
    setRangeIncomplete(initialDefaultTextState.rangeIncomplete)
    setRangeFromOnly(initialDefaultTextState.rangeFromOnly)
  }, [initialDefaultTextState])

  function handleTextCommit() {
    if (!typeable || !isField) return
    if (isRange) {
      const result = parseRangeText(text)
      if (result === "empty") {
        setTextError(undefined)
        setRangeIncomplete(false)
        setRangeFromOnly(false)
        commit(undefined)
        return
      }
      if (result === "invalid") {
        setTextError("Enter a valid date, for example 10/14/2026.")
        setRangeIncomplete(false)
        setRangeFromOnly(false)
        return
      }
      if (result === "incomplete") {
        setTextError(undefined)
        setRangeIncomplete(true)
        setRangeFromOnly(false)
        return
      }
      if (result === "end-before-start") {
        setTextError("The end date must be after the start date.")
        setRangeIncomplete(false)
        setRangeFromOnly(false)
        return
      }
      const rangeResult = result as DateRange
      if (rangeResult.from && !rangeResult.to) {
        setTextError(undefined)
        setRangeIncomplete(false)
        setRangeFromOnly(true)
        commit(rangeResult)
        setText(`${formatDate(rangeResult.from)} – ${SINGLE_FORMAT}`)
        return
      }
      setTextError(undefined)
      setRangeIncomplete(false)
      setRangeFromOnly(false)
      commit(rangeResult)
      setText(formatRange(rangeResult) ?? "")
      return
    }

    const result = parseSingleText(text)
    if (result === "empty") {
      setTextError(undefined)
      commit(undefined)
      setText("")
      return
    }
    if (result === "invalid") {
      setTextError("Enter a valid date, for example 10/14/2026.")
      return
    }
    setTextError(undefined)
    commit(result as Date)
    setText(formatDate(result as Date) ?? "")
  }

  const stripError = errorProp || textError

  const monthsForPanel = isRange
    ? ((props as DatePickerRangeProps).numberOfMonths ?? ((props as DatePickerRangeProps).presets && narrow ? 1 : 2))
    : 1
  const stackedPanel = isRange && monthsForPanel === 2 && compact

  const panel = (
    <DatePickerPanel
      key={openCounter}
      mode={props.mode ?? "single"}
      value={selected}
      onApply={handleApply}
      onCancel={handleCancel}
      confirmation={confirmation}
      presets={isRange ? (props as DatePickerRangeProps).presets : undefined}
      numberOfMonths={monthsForPanel}
      stacked={stackedPanel}
      min={min}
      max={max}
      disabled={disabled}
      today={today}
      unit={unit}
      error={stripError}
    />
  )

  if (!isField) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          disabled={isDisabled}
          render={<Button variant="plain" className={cn(isRange ? "w-72" : "w-56", "justify-start font-normal", className)} />}
        >
          <CalendarDays className="size-4" />
          {display ?? <span className="text-text-tertiary">{displayPlaceholder}</span>}
        </PopoverTrigger>
        <PopoverContent aria-label={isRange ? "Choose a date range" : "Choose a date"} className="w-auto p-0">
          {panel}
        </PopoverContent>
      </Popover>
    )
  }

  if (!typeable) {
    const rangeValue = selected as DateRange | undefined
    const rangeFromOnly = isRange && !!rangeValue?.from && !rangeValue?.to
    const hasHelper = !!error || helperText !== false

    if (isReadonly) {
      return (
        <div className="flex w-full max-w-[320px] flex-col gap-2">
          {label && (
            <label id={labelId} className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          <div className="flex flex-col gap-1">
            <FieldControl
              fieldState={fieldState}
              invalid={!!error}
              className={className}
              aria-labelledby={label ? `${labelId} ${valueId}` : valueId}
              aria-describedby={hasHelper ? helperId : undefined}
            >
              <CalendarDays className={cn("size-4 shrink-0", error ? "text-error" : "text-text-secondary")} />
              <FieldValue
                mode={props.mode ?? "single"}
                value={selected}
                id={valueId}
                singlePlaceholder={fieldPlaceholder}
                rangePlaceholder={fieldPlaceholder}
              />
              {error && <CircleAlert className="size-4 shrink-0 text-error" />}
            </FieldControl>
            {hasHelper && (
              <HelperLine id={helperId} error={error} helperText={helperText} mode={props.mode ?? "single"} rangeFromOnly={rangeFromOnly} />
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="flex w-full max-w-[320px] flex-col gap-2">
        {label && (
          <label id={labelId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="flex flex-col gap-1">
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
              disabled={isDisabled}
              render={
                <FieldControl
                  fieldState={fieldState}
                  invalid={!!error}
                  open={open}
                  className={className}
                  aria-labelledby={label ? `${labelId} ${valueId}` : valueId}
                  aria-describedby={hasHelper ? helperId : undefined}
                />
              }
            >
              <CalendarDays className={cn("size-4 shrink-0", error ? "text-error" : "text-text-secondary")} />
              <FieldValue
                mode={props.mode ?? "single"}
                value={selected}
                id={valueId}
                singlePlaceholder={fieldPlaceholder}
                rangePlaceholder={fieldPlaceholder}
              />
              {error && <CircleAlert className="size-4 shrink-0 text-error" />}
            </PopoverTrigger>
            <PopoverContent aria-label={isRange ? "Choose a date range" : "Choose a date"} className="w-auto p-0">
              {panel}
            </PopoverContent>
          </Popover>
          {hasHelper && (
            <HelperLine id={helperId} error={error} helperText={helperText} mode={props.mode ?? "single"} rangeFromOnly={rangeFromOnly} />
          )}
        </div>
      </div>
    )
  }

  // typeable
  const hasHelper = !!(error || textError) || helperText !== false
  const inputInvalid = !!(error || textError)

  return (
    <div className="flex w-full max-w-[320px] flex-col gap-2">
      {label && (
        <label id={labelId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-1">
        <div
          ref={controlRef}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-sm text-foreground transition-colors duration-fast ease-entrance outline-none focus-ring-within",
            inputInvalid && "border-error focus-ring-within-error",
            fieldState === "disabled" && "pointer-events-none opacity-40",
            fieldState === "readonly" && "bg-bg-subtle",
            className
          )}
        >
          {/* One calendar icon: the icon in front of the text is the button that opens the calendar, so the field
              has no second icon on its right. -ml-2 / -mr-2 keep the icon and the text where they were. */}
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
              disabled={isDisabled}
              render={
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Open calendar"
                  className={cn("-ml-2 -mr-2 shrink-0", inputInvalid ? "text-error" : "text-text-secondary")}
                />
              }
            >
              <CalendarDays className="size-4" />
            </PopoverTrigger>
            <PopoverContent
              anchor={controlRef}
              align="start"
              aria-label={isRange ? "Choose a date range" : "Choose a date"}
              className="w-auto p-0"
            >
              {panel}
            </PopoverContent>
          </Popover>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setTextError(undefined)
              setRangeIncomplete(false)
              setRangeFromOnly(false)
            }}
            onBlur={handleTextCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleTextCommit()
              }
            }}
            disabled={fieldState === "disabled"}
            readOnly={fieldState === "readonly"}
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : isRange ? "Date range" : "Date"}
            aria-invalid={inputInvalid || undefined}
            aria-describedby={hasHelper ? helperId : undefined}
            placeholder={fieldPlaceholder}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-tertiary",
              inputInvalid && "text-error"
            )}
          />
        </div>
        {hasHelper && (
          <HelperLine
            id={helperId}
            error={error || textError}
            helperText={helperText}
            mode={props.mode ?? "single"}
            rangeFromOnly={rangeFromOnly || rangeIncomplete}
          />
        )}
      </div>
    </div>
  )
}

export { DatePicker, DatePickerPanel, DatePickerField, DatePickerFooter, DEFAULT_PRESETS as datePickerPresets }
export type { DatePickerProps, DatePickerPanelProps, DatePickerFieldProps, DatePickerFooterProps, DatePreset }
