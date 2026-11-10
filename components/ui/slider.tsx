"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"
import { Input } from "./input"

// Figma: ❖ Slider (185:2) — Slider / Field 2887:1071, Control 2884:241279 (its
// Style axis is the handle: Primary circle, Neutral circle, Grip bars, Grip dots),
// Track 2884:240655. The track and thumb follow the Progress tokens (bg-muted
// track, bg-primary fill). The thumb fills with bg-page on hover and bg-subtle while dragging, like the Figma Interaction axis; the focus ring stays as it was. Disabled dims the whole
// control to 0.4, like the Figma set; the value stays readable.
// Invalid (owner, Nov 2026): red fill and thumb, error text under the slider.

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Position of a value on the scale, 0–100. */
function toPercent(value: number, min: number, max: number) {
  if (max === min) return 0
  return clamp(((value - min) / (max - min)) * 100, 0, 100)
}

function decimalsOf(n: number) {
  const text = String(n)
  const dot = text.indexOf(".")
  return dot < 0 ? 0 : text.length - dot - 1
}

/** English number format: 1,200.5. */
function formatEn(value: number, step = 1, format?: Intl.NumberFormatOptions, locale?: Intl.LocalesArgument) {
  return new Intl.NumberFormat(locale ?? "en-US", { maximumFractionDigits: Math.min(decimalsOf(step), 6), ...format }).format(value)
}

/** Reads "1,200.5" or "12.5"; anything else is not a number. */
function parseEn(text: string): number | null {
  const compact = text.trim().replace(/[,\s]/g, "")
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(compact)) return null
  return Number(compact)
}

function toValues(value: number | readonly number[] | undefined, min: number): number[] {
  if (value === undefined) return [min]
  return typeof value === "number" ? [value] : [...value]
}

const JOIN_BELOW = 0.15 // range thumbs closer than 15 % of the scale share one bubble

/* -------------------------------------------------------------------------- */
/* Slider                                                                      */
/* -------------------------------------------------------------------------- */

type SliderMark = { value: number; label?: React.ReactNode }
type SliderMarkInput = number | SliderMark

/** The handle the thumb is drawn as. `circle` is the brand-outlined default; `circle-neutral` has a grey rim like a plain button; the grip styles are a rounded drag item. */
type SliderHandle = "circle" | "circle-neutral" | "grip-bars" | "grip-dots"

type SliderProps = SliderPrimitive.Root.Props & {
  /** Handle style of every thumb. Default `circle`. */
  handle?: SliderHandle
  /**
   * Fill from the middle of the scale instead of from the start, and mark the zero point.
   * `true` uses the middle of min and max; a number sets the origin (`centered={0}` on -50…50).
   * Single value only; a range keeps its normal fill.
   */
  centered?: boolean | number
  /** Show the value in a bubble above the thumb (beside it when vertical) while it has focus or is dragged. `"always"` keeps the bubble visible. */
  bubble?: boolean | "always"
  /** Text for the bubble and for `aria-valuetext`, e.g. `(n) => \`$\${n}\``. Default: English number format. */
  formatValue?: (value: number) => string
  /** Tick marks under the track. A number is a tick; `{ value, label }` also names it. Decorative, `aria-hidden`. */
  marks?: readonly SliderMarkInput[]
  /** Marks the slider invalid: red fill and thumb, `aria-invalid` on the thumbs. */
  invalid?: boolean
  /** Extra classes for every thumb, for example to show a state: `thumbClassName="bg-bg-subtle"`. */
  thumbClassName?: string
  /**
   * Error text under a horizontal slider. It is announced (`role="alert"`), linked to every thumb through `aria-describedby`
   * and marks the slider invalid: red fill and thumb, `aria-invalid` on the thumbs. For a vertical slider the text is not drawn
   * (use `SliderField`); the slider is still marked invalid.
   */
  error?: React.ReactNode
}

function Slider({
  className,
  children,
  value,
  defaultValue,
  min = 0,
  max = 100,
  orientation = "horizontal",
  onValueChange,
  handle,
  centered,
  bubble,
  formatValue,
  marks,
  invalid,
  thumbClassName,
  error,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SliderProps) {
  // Uncontrolled sliders keep their value inside Base UI; the centred fill and the bubble need it too.
  const [inner, setInner] = React.useState<number | readonly number[] | undefined>(defaultValue)
  const values = toValues(value ?? inner, min)
  const thumbCount = values.length
  const multi = thumbCount > 1
  const vertical = orientation === "vertical"
  const uid = React.useId()
  const [focused, setFocused] = React.useState<number | null>(null)

  const hasError = error !== undefined && error !== null && error !== false
  const isInvalid = !!invalid || hasError
  const showError = hasError && !vertical
  const errorId = `${uid}-error`
  const describedBy = [ariaDescribedBy, showError ? errorId : undefined].filter(Boolean).join(" ") || undefined

  // The name belongs on the thumb: that is the focusable range input screen readers announce.
  const thumbLabel = (i: number) => (ariaLabel && multi ? `${ariaLabel}, ${i === 0 ? "minimum" : "maximum"}` : ariaLabel)
  // A shared visible label names every thumb the same; a hidden word per thumb tells them apart.
  const thumbLabelledBy = (i: number) => (ariaLabelledBy && multi ? `${ariaLabelledBy} ${uid}-${i}` : ariaLabelledBy)

  const text = (n: number) => (formatValue ? formatValue(n) : formatEn(n, props.step, props.format, props.locale))
  const centerOrigin = centered === undefined || centered === false ? null : centered === true ? (min + max) / 2 : centered
  const showCenter = centerOrigin !== null && !multi
  const joined = !!bubble && multi && thumbCount === 2 && max !== min && Math.abs(values[1] - values[0]) / Math.abs(max - min) < JOIN_BELOW
  const joinedAt = joined ? (toPercent(values[0], min, max) + toPercent(values[1], min, max)) / 2 : 0

  const control = (
    <SliderControl>
      <SliderTrack>
        {showCenter ? (
          <>
            <SliderCenterFill value={values[0]} origin={centerOrigin} min={min} max={max} vertical={vertical} />
            <SliderOriginMark origin={centerOrigin} min={min} max={max} vertical={vertical} />
          </>
        ) : (
          <SliderIndicator />
        )}
        {values.map((v, i) => (
          <SliderThumb
            key={i}
            index={i}
            handle={handle}
            className={thumbClassName}
            aria-label={thumbLabel(i)}
            aria-labelledby={thumbLabelledBy(i)}
            aria-describedby={describedBy}
            getAriaValueText={formatValue ? (_formatted, n) => formatValue(n) : undefined}
            invalid={isInvalid}
            onFocus={bubble ? () => setFocused(i) : undefined}
            onBlur={bubble ? () => setFocused((current) => (current === i ? null : current)) : undefined}
          >
            {bubble && !joined && (
              <SliderBubble orientation={orientation} visible={bubble === "always" || focused === i}>
                {text(v)}
              </SliderBubble>
            )}
          </SliderThumb>
        ))}
        {joined && (
          <SliderBubble
            joined
            orientation={orientation}
            visible={bubble === "always" || focused !== null}
            style={vertical ? { bottom: `${joinedAt}%` } : { left: `${joinedAt}%` }}
          >
            {text(values[0])} – {text(values[1])}
          </SliderBubble>
        )}
      </SliderTrack>
    </SliderControl>
  )

  const body = marks && marks.length > 0 ? (
    <div data-slot="slider-body" className={cn("flex", vertical ? "h-full flex-row" : "w-full flex-col")}>
      {control}
      <SliderMarks marks={marks} min={min} max={max} orientation={orientation} />
    </div>
  ) : (
    control
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-invalid={isInvalid ? "" : undefined}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      orientation={orientation}
      onValueChange={(next, details) => {
        setInner(next)
        onValueChange?.(next, details)
      }}
      className={cn(
        "group/slider flex flex-col gap-3 data-[orientation=vertical]:h-full data-[orientation=vertical]:flex-row",
        // Room for the bubble, so it never lands on the label or the text beside the slider.
        bubble && "data-[orientation=horizontal]:pt-7 data-[orientation=vertical]:pe-12",
        className
      )}
      {...props}
    >
      {children}
      {ariaLabelledBy && multi && values.map((_, i) => (
        <span key={i} id={`${uid}-${i}`} hidden>
          {i === 0 ? "minimum" : "maximum"}
        </span>
      ))}
      {body}
      {showError && (
        <p id={errorId} data-slot="slider-error" role="alert" className="-mt-1 text-xs text-text-error">
          {error}
        </p>
      )}
    </SliderPrimitive.Root>
  )
}

function SliderControl({ className, ...props }: SliderPrimitive.Control.Props) {
  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      className={cn(
        "relative flex w-full items-center py-2 select-none touch-none data-disabled:opacity-40",
        // Vertical: the control stands up, the thumb travels from the bottom to the top.
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:min-h-32 data-[orientation=vertical]:flex-col data-[orientation=vertical]:px-2 data-[orientation=vertical]:py-0",
        className
      )}
      {...props}
    />
  )
}

function SliderTrack({ className, ...props }: SliderPrimitive.Track.Props) {
  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      className={cn("relative h-1.5 w-full rounded-full bg-muted data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5", className)}
      {...props}
    />
  )
}

function SliderIndicator({ className, ...props }: SliderPrimitive.Indicator.Props) {
  return (
    <SliderPrimitive.Indicator
      data-slot="slider-indicator"
      className={cn("h-full rounded-full bg-primary group-data-invalid/slider:bg-error data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-full", className)}
      {...props}
    />
  )
}

type SliderThumbProps = SliderPrimitive.Thumb.Props & {
  /** Sets `aria-invalid` on the range input inside the thumb. */
  invalid?: boolean
  /** How the thumb is drawn. Default `circle`. */
  handle?: SliderHandle
}

// 16 px circle with a 1 px grey rim, or a 20 px rounded drag item; the 24 px footprint of the Figma slot is the thumb's own box.
const HANDLE_CLASS: Record<SliderHandle, string> = {
  circle: "size-4 rounded-full border-2 border-primary",
  "circle-neutral": "size-4 rounded-full border border-border",
  "grip-bars": "flex size-5 items-center justify-center rounded-md border border-border",
  "grip-dots": "flex size-5 items-center justify-center rounded-md border border-border",
}

function SliderGrip({ handle }: { handle: "grip-bars" | "grip-dots" }) {
  if (handle === "grip-bars") {
    return (
      <span aria-hidden data-slot="slider-grip" className="flex gap-0.5">
        <i className="h-2.5 w-0.5 rounded-full bg-text-secondary" />
        <i className="h-2.5 w-0.5 rounded-full bg-text-secondary" />
        <i className="h-2.5 w-0.5 rounded-full bg-text-secondary" />
      </span>
    )
  }
  return (
    <span aria-hidden data-slot="slider-grip" className="grid grid-cols-2 gap-x-0.75 gap-y-0.5">
      {Array.from({ length: 6 }, (_, i) => (
        <i key={i} className="size-0.5 rounded-full bg-text-secondary" />
      ))}
    </span>
  )
}

function SliderThumb({ className, invalid, inputRef, handle = "circle", children, ...props }: SliderThumbProps) {
  const inputNode = React.useRef<HTMLInputElement | null>(null)
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputNode.current = node
      if (typeof inputRef === "function") inputRef(node)
      else if (inputRef) (inputRef as React.RefObject<HTMLInputElement | null>).current = node
    },
    [inputRef]
  )
  // The thumb's own props land on the wrapper div; the focusable input needs the flag.
  React.useEffect(() => {
    const input = inputNode.current
    if (!input) return
    if (invalid) input.setAttribute("aria-invalid", "true")
    else input.removeAttribute("aria-invalid")
  }, [invalid])

  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      data-handle={handle}
      inputRef={setInputRef}
      className={cn(
        "block bg-card shadow-[0px_1px_2px_0px_rgba(16,24,40,0.1)] outline-none transition-colors duration-fast ease-entrance",
        HANDLE_CLASS[handle],
        "focus-ring-within group-data-invalid/slider:border-error group-data-invalid/slider:focus-ring-within-error",
        "data-dragging:cursor-grabbing not-data-disabled:hover:bg-bg-page data-dragging:bg-bg-subtle data-dragging:hover:bg-bg-subtle",
        className
      )}
      {...props}
    >
      {handle === "grip-bars" || handle === "grip-dots" ? <SliderGrip handle={handle} /> : null}
      {children}
    </SliderPrimitive.Thumb>
  )
}

function SliderLabel({ className, ...props }: SliderPrimitive.Label.Props) {
  return (
    <SliderPrimitive.Label
      data-slot="slider-label"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SliderValue({ className, ...props }: SliderPrimitive.Value.Props) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-value"
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Centred fill                                                                */
/* -------------------------------------------------------------------------- */

/** Fill from the origin to the thumb: Base UI's indicator always starts at the minimum. */
function SliderCenterFill({ value, origin, min, max, vertical }: { value: number; origin: number; min: number; max: number; vertical: boolean }) {
  const a = toPercent(origin, min, max)
  const b = toPercent(value, min, max)
  const start = Math.min(a, b)
  const size = Math.abs(a - b)
  return (
    <span
      data-slot="slider-center-fill"
      data-orientation={vertical ? "vertical" : "horizontal"}
      aria-hidden
      className={cn("absolute rounded-full bg-primary group-data-invalid/slider:bg-error", vertical ? "inset-x-0" : "inset-y-0")}
      style={vertical ? { bottom: `${start}%`, height: `${size}%` } : { left: `${start}%`, width: `${size}%` }}
    />
  )
}

/** The zero point of a centred slider: a short line across the track. */
function SliderOriginMark({ origin, min, max, vertical }: { origin: number; min: number; max: number; vertical: boolean }) {
  const at = toPercent(origin, min, max)
  return (
    <span
      data-slot="slider-origin"
      aria-hidden
      className={cn("pointer-events-none absolute bg-text-tertiary", vertical ? "-inset-x-1 h-px translate-y-1/2" : "-inset-y-1 w-px -translate-x-1/2")}
      style={vertical ? { bottom: `${at}%` } : { left: `${at}%` }}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Marks                                                                       */
/* -------------------------------------------------------------------------- */

type SliderMarksProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Positions on the scale. Label only the ones that need a word; never every step. */
  marks: readonly SliderMarkInput[]
  min?: number
  max?: number
  orientation?: "horizontal" | "vertical"
}

/**
 * Tick marks on the track's scale. Decorative (`aria-hidden`): the slider itself
 * is the control. Give it the same `min`/`max` as the slider, or pass `marks` to
 * `Slider`, which places them for you.
 */
function SliderMarks({ marks, min = 0, max = 100, orientation = "horizontal", className, style, ...props }: SliderMarksProps) {
  const vertical = orientation === "vertical"
  const items = marks.map((mark) => (typeof mark === "number" ? { value: mark } : mark))
  const labelled = items.some((item) => item.label !== undefined && item.label !== null)
  return (
    <div
      data-slot="slider-marks"
      data-orientation={orientation}
      aria-hidden
      className={cn(
        "pointer-events-none relative",
        vertical ? cn("shrink-0 self-stretch", labelled ? "min-w-12" : "w-2") : cn("w-full", labelled ? "h-6" : "h-2"),
        className
      )}
      style={style}
      {...props}
    >
      {items.map((item, i) => {
        const at = toPercent(item.value, min, max)
        const position = vertical ? { bottom: `${at}%` } : { left: `${at}%` }
        const hasLabel = item.label !== undefined && item.label !== null
        // The labels at the two ends sit inside the scale, so nothing sticks out of the field.
        const shift = vertical
          ? at <= 0 ? "translate-y-0" : at >= 100 ? "translate-y-full" : "translate-y-1/2"
          : at <= 0 ? "translate-x-0" : at >= 100 ? "-translate-x-full" : "-translate-x-1/2"
        return (
          <React.Fragment key={`${item.value}-${i}`}>
            <span
              data-slot="slider-mark"
              className={cn("absolute bg-border-control", vertical ? "start-0 h-px w-1.5 translate-y-1/2" : "top-0 h-1.5 w-px -translate-x-1/2")}
              style={position}
            />
            {hasLabel && (
              <span
                data-slot="slider-mark-label"
                className={cn("absolute text-xs leading-4 whitespace-nowrap text-text-tertiary tabular-nums", vertical ? "start-3" : "top-2", shift)}
                style={position}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Value bubble                                                                */
/* -------------------------------------------------------------------------- */

type SliderBubbleProps = React.ComponentProps<"span"> & {
  /** Shown. While the slider is being dragged it shows regardless. */
  visible?: boolean
  /** One bubble for two close range thumbs: place it with `style` (`left` or `bottom` in %). */
  joined?: boolean
  orientation?: "horizontal" | "vertical"
}

/**
 * A small bubble with the value. Put it inside a `SliderThumb`, or use the
 * `bubble` prop on `Slider`. Decorative (`aria-hidden`): the thumb announces its
 * value through `aria-valuetext`, and the bubble never replaces the label.
 * It moves with opacity and transform only; with reduced motion it fades in place.
 */
function SliderBubble({ visible, joined, orientation = "horizontal", className, ...props }: SliderBubbleProps) {
  const vertical = orientation === "vertical"
  return (
    <span
      data-slot="slider-bubble"
      data-visible={visible ? "" : undefined}
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-10 w-max rounded-md bg-inverse px-2 py-0.5 text-xs font-medium tabular-nums text-text-inverse",
        "opacity-0 transition-[opacity,transform] duration-fast ease-exit",
        "data-visible:opacity-100 data-visible:ease-entrance group-data-dragging/slider:opacity-100 group-data-dragging/slider:ease-entrance",
        vertical
          ? cn(
              "start-full -translate-x-1 data-visible:translate-x-0 group-data-dragging/slider:translate-x-0 motion-reduce:translate-x-0",
              joined ? "ms-3.5 translate-y-1/2" : "top-1/2 ms-2 -translate-y-1/2"
            )
          : cn(
              "bottom-full -translate-x-1/2 translate-y-1 data-visible:translate-y-0 group-data-dragging/slider:translate-y-0 motion-reduce:translate-y-0",
              joined ? "mb-3" : "left-1/2 mb-2"
            ),
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Number inputs                                                               */
/* -------------------------------------------------------------------------- */

type SliderInputProps = {
  /** Current value of the slider. */
  value: number
  /** Called with a valid, in-range value as it is typed and again when the field is left. */
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Accessible name; shown above the field when `showLabel` is set. */
  label: string
  showLabel?: boolean
  /** Text inside the field, before and after the number (for example `$` and `%`). */
  prefix?: string
  suffix?: string
  /** Extra rule checked before a value is accepted; return the error text, or null. */
  validate?: (value: number) => string | null
  invalid?: boolean
  disabled?: boolean
  className?: string
}

/**
 * A number field that follows a slider. It reads and writes the English number
 * format (1,200.5). Typing a valid value moves the slider at once; leaving the
 * field (or Enter) clamps a value outside min and max, snaps to `step`, and
 * shows an error for text that is empty or not a number.
 */
function SliderInput({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showLabel,
  prefix,
  suffix,
  validate,
  invalid,
  disabled,
  className,
}: SliderInputProps) {
  const id = React.useId()
  const [draft, setDraft] = React.useState(() => formatEn(value, step))
  const [error, setError] = React.useState<string | null>(null)
  const editing = React.useRef(false)

  // Follow the slider, but never rewrite what the person is typing.
  React.useEffect(() => {
    if (editing.current) return
    setDraft(formatEn(value, step))
    setError(null)
  }, [value, step])

  const snap = (n: number) => {
    const clamped = clamp(n, min, max)
    if (!(step > 0)) return clamped
    const digits = Math.max(decimalsOf(step), decimalsOf(min))
    return clamp(Number((min + Math.round((clamped - min) / step) * step).toFixed(digits)), min, max)
  }

  const attempt = (text: string, final: boolean) => {
    const n = parseEn(text)
    if (n === null) {
      if (final) setError(text.trim() === "" ? "Enter a value." : "Enter a number.")
      return
    }
    // While typing, a value outside the range is just unfinished ("5" on the way to "50").
    if (!final && (n < min || n > max)) return
    const next = snap(n)
    const rule = validate?.(next) ?? null
    if (rule) {
      if (final) setError(rule)
      return
    }
    setError(null)
    if (next !== value) onValueChange(next)
    if (final) setDraft(formatEn(next, step))
  }

  const errorId = `${id}-error`
  return (
    <div data-slot="slider-input" className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className={cn("text-xs font-medium text-text-secondary", showLabel && "mb-1", !showLabel && "sr-only", disabled && "opacity-40")}>
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-text-tertiary">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          size="sm"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={draft}
          disabled={disabled}
          aria-invalid={error || invalid ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn("tabular-nums", prefix && "ps-7", suffix && "pe-8")}
          onFocus={() => {
            editing.current = true
          }}
          onChange={(event) => {
            setDraft(event.target.value)
            attempt(event.target.value, false)
          }}
          onBlur={(event) => {
            editing.current = false
            attempt(event.target.value, true)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") attempt(event.currentTarget.value, true)
          }}
        />
        {suffix && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-text-tertiary">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-text-error">
          {error}
        </p>
      )}
    </div>
  )
}

type SliderRangeInputsProps = Omit<SliderInputProps, "value" | "onValueChange" | "label" | "validate" | "showLabel"> & {
  value: readonly number[]
  onValueChange: (value: [number, number]) => void
  /** Names of the two fields. Default: "Minimum value" and "Maximum value". */
  labels?: readonly [string, string]
}

/**
 * Two number fields for a range slider. The lower value may not pass the upper
 * one and the other way round; a value in the wrong order shows an error and is
 * not applied.
 */
function SliderRangeInputs({ value, onValueChange, labels = ["Minimum value", "Maximum value"], className, ...rest }: SliderRangeInputsProps) {
  const [lower, upper] = [value[0] ?? rest.min ?? 0, value[1] ?? rest.max ?? 100]
  return (
    <div data-slot="slider-range-inputs" className={cn("grid grid-cols-2 items-start gap-3", className)}>
      <SliderInput
        {...rest}
        showLabel
        label={labels[0]}
        value={lower}
        onValueChange={(n) => onValueChange([n, upper])}
        validate={(n) => (n > upper ? "Minimum can't be higher than maximum." : null)}
      />
      <SliderInput
        {...rest}
        showLabel
        label={labels[1]}
        value={upper}
        onValueChange={(n) => onValueChange([lower, n])}
        validate={(n) => (n < lower ? "Maximum can't be lower than minimum." : null)}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Field                                                                       */
/* -------------------------------------------------------------------------- */

type SliderFieldProps = Omit<SliderProps, "aria-label" | "aria-labelledby" | "aria-describedby" | "children" | "invalid"> & {
  /** The label; every thumb is named by it (`aria-labelledby`). */
  label: React.ReactNode
  /** Unit after the current value: `%` sits against the number, a word such as `px` gets a space. */
  unit?: string
  /** Show the current value next to the label. Default true. */
  showValue?: boolean
  /** Show the minimum and maximum under the track. */
  showLimits?: boolean
  /** Hint under the field. Replaced by `error` when there is one. */
  helper?: React.ReactNode
  /** Error text under the field (announced); marks the slider invalid. */
  error?: React.ReactNode
  invalid?: boolean
  /** Number field(s) beside the slider (one) or under it (two, for a range). */
  showInput?: boolean
  /** Name of the single number field. Default: the label. */
  inputLabel?: string
  /** Names of the two range fields. Default: "Minimum …" and "Maximum …" built from the label. */
  inputLabels?: readonly [string, string]
  inputPrefix?: string
  inputSuffix?: string
}

/**
 * A slider as a form field: label, current value with its unit, optional limits
 * and number inputs, and a helper or error text. The label names the thumbs
 * (`aria-labelledby`) and the helper or error describes them (`aria-describedby`).
 */
function SliderField({
  label,
  unit,
  showValue = true,
  showLimits,
  helper,
  error,
  invalid,
  showInput,
  inputLabel,
  inputLabels,
  inputPrefix,
  inputSuffix,
  value,
  defaultValue,
  onValueChange,
  formatValue,
  min = 0,
  max = 100,
  step,
  disabled,
  className,
  ...props
}: SliderFieldProps) {
  const id = React.useId()
  const labelId = `${id}-label`
  const noteId = `${id}-note`
  const [inner, setInner] = React.useState<number | readonly number[]>(defaultValue ?? min)
  const current = value ?? inner
  const values = toValues(current, min)
  const range = values.length > 1
  const hasError = error !== undefined && error !== null && error !== false
  const note = hasError ? error : helper
  const hasNote = note !== undefined && note !== null && note !== false

  const base = (n: number) => (formatValue ? formatValue(n) : formatEn(n, step, props.format, props.locale))
  const withUnit = (n: number) => (unit ? `${base(n)}${unit === "%" || unit.length === 1 ? "" : " "}${unit}` : base(n))
  const shown = range ? `${withUnit(values[0])} – ${withUnit(values[1])}` : withUnit(values[0])

  const commit = (next: number | readonly number[], details?: unknown) => {
    setInner(next)
    ;(onValueChange as ((value: number | readonly number[], details?: unknown) => void) | undefined)?.(next, details)
  }

  const plainLabel = typeof label === "string" ? label : "value"
  const lower = plainLabel.charAt(0).toLowerCase() + plainLabel.slice(1)
  const slider = (
    <Slider
      {...props}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      value={current}
      onValueChange={(next, details) => commit(next, details)}
      formatValue={unit || formatValue ? withUnit : undefined}
      invalid={invalid || hasError}
      aria-labelledby={labelId}
      aria-describedby={hasNote ? noteId : undefined}
      className={showInput && !range ? "flex-1" : undefined}
    />
  )

  return (
    <div
      data-slot="slider-field"
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid || hasError ? "" : undefined}
      className={cn("flex w-full flex-col gap-2", className)}
    >
      <div className={cn("flex items-baseline justify-between gap-3", disabled && "opacity-40")}>
        <span id={labelId} data-slot="slider-field-label" className="text-sm font-medium text-foreground">
          {label}
        </span>
        {showValue && (
          <span data-slot="slider-field-value" aria-hidden className="text-sm tabular-nums text-text-secondary">
            {shown}
          </span>
        )}
      </div>
      {showInput && !range ? (
        <div className="flex items-center gap-4">
          {slider}
          <SliderInput
            value={values[0]}
            onValueChange={(n) => commit(n)}
            min={min}
            max={max}
            step={step}
            label={inputLabel ?? plainLabel}
            prefix={inputPrefix}
            suffix={inputSuffix}
            invalid={invalid || hasError}
            disabled={disabled}
            className="w-24 shrink-0"
          />
        </div>
      ) : (
        slider
      )}
      {showLimits && (
        <div data-slot="slider-field-limits" aria-hidden className={cn("-mt-1 flex justify-between text-xs tabular-nums text-text-tertiary", disabled && "opacity-40")}>
          <span>{withUnit(min)}</span>
          <span>{withUnit(max)}</span>
        </div>
      )}
      {showInput && range && (
        <SliderRangeInputs
          value={values}
          onValueChange={(next) => commit(next)}
          min={min}
          max={max}
          step={step}
          labels={inputLabels ?? [`Minimum ${lower}`, `Maximum ${lower}`]}
          prefix={inputPrefix}
          suffix={inputSuffix}
          invalid={invalid || hasError}
          disabled={disabled}
        />
      )}
      {hasNote && (
        <p
          id={noteId}
          data-slot={hasError ? "slider-field-error" : "slider-field-helper"}
          role={hasError ? "alert" : undefined}
          className={cn("-mt-1 text-xs", hasError ? "text-text-error" : "text-text-tertiary", disabled && "opacity-40")}
        >
          {note}
        </p>
      )}
    </div>
  )
}

export {
  Slider,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
  SliderLabel,
  SliderValue,
  SliderField,
  SliderMarks,
  SliderBubble,
  SliderInput,
  SliderRangeInputs,
}
export type { SliderProps, SliderHandle, SliderMark, SliderMarkInput, SliderMarksProps, SliderBubbleProps, SliderInputProps, SliderRangeInputsProps, SliderFieldProps }
