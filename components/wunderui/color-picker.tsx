"use client"

import * as React from "react"
import { ChevronDown, Pipette, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui/icon-button"
import { NativeSelect, NativeSelectContent, NativeSelectItem, NativeSelectTrigger, NativeSelectValue } from "@/components/ui/native-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/* ------------------------------------------------------------------ */
/* Colour maths — hex is the value, HSV is what the picker moves in.    */
/* ------------------------------------------------------------------ */

type RGB = { r: number; g: number; b: number }
type HSV = { h: number; s: number; v: number }
type ColorFormat = "hex" | "rgb" | "hsl"

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const noop = () => () => {}

function hexToRgb(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1]
  const n = parseInt(h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

const rgbToHex = ({ r, g, b }: RGB) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase()

function rgbToHsv({ r, g, b }: RGB): HSV {
  const [R, G, B] = [r / 255, g / 255, b / 255]
  const max = Math.max(R, G, B)
  const d = max - Math.min(R, G, B)
  let h = 0
  if (d) h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max }
}

function hsvToRgb({ h, s, v }: HSV): RGB {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 }
}

function rgbToHsl({ r, g, b }: RGB) {
  const [R, G, B] = [r / 255, g / 255, b / 255]
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const l = (max + min) / 2
  const d = max - min
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0
  const { h } = rgbToHsv({ r, g, b })
  return { h, s, l }
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const v = l + s * Math.min(l, 1 - l)
  return hsvToRgb({ h, s: v ? 2 * (1 - l / v) : 0, v })
}

/* ------------------------------------------------------------------ */
/* A pointer + keyboard 1D/2D surface, used by the area and the tracks. */
/* ------------------------------------------------------------------ */

function usePointerDrag(onMove: (x: number, y: number) => void) {
  const ref = React.useRef<HTMLDivElement>(null)
  const move = React.useCallback(
    (event: React.PointerEvent | PointerEvent) => {
      const box = ref.current?.getBoundingClientRect()
      if (!box) return
      onMove(clamp((event.clientX - box.left) / box.width, 0, 1), clamp((event.clientY - box.top) / box.height, 0, 1))
    },
    [onMove]
  )
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    ref.current?.setPointerCapture(event.pointerId)
    ref.current?.focus()
    move(event)
  }
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (ref.current?.hasPointerCapture(event.pointerId)) move(event)
  }
  return { ref, onPointerDown, onPointerMove }
}

function Track({
  label,
  value,
  onChange,
  background,
  handleColor,
  valueText,
}: {
  label: string
  /** 0–1 */
  value: number
  onChange: (value: number) => void
  background: string
  handleColor: string
  valueText: string
}) {
  const drag = usePointerDrag((x) => onChange(x))
  return (
    <div
      {...drag}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={valueText}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 0.1 : 0.01
        if (event.key === "ArrowRight" || event.key === "ArrowUp") onChange(clamp(value + step, 0, 1))
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown") onChange(clamp(value - step, 0, 1))
        else if (event.key === "Home") onChange(0)
        else if (event.key === "End") onChange(1)
        else return
        event.preventDefault()
      }}
      className="relative h-2 w-full cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
      style={{ background }}
    >
      <span
        aria-hidden
        className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_3px_rgb(0_0_0/0.3)]"
        style={{ left: `${value * 100}%`, background: handleColor }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ColorPicker                                                          */
/* ------------------------------------------------------------------ */

/* The swatch grid: a row of greys, then nine shades of twelve hues. */
function hslHex(h: number, s: number, l: number) {
  return rgbToHex(hslToRgb(h, s / 100, l / 100))
}
const GRID_HUES = [195, 218, 252, 282, 330, 4, 22, 38, 48, 58, 70, 100]
const GRID_LIGHT = [18, 26, 34, 42, 50, 60, 70, 80, 90]
const GRID: string[][] = [
  Array.from({ length: 12 }, (_, c) => hslHex(0, 0, 100 - (c / 11) * 100)),
  ...GRID_LIGHT.map((l) => GRID_HUES.map((h, c) => hslHex(h, c === 11 ? 55 : 85, l))),
]

function ColorGrid({ hex, onPick }: { hex: string; onPick: (hex: string) => void }) {
  const flat = GRID.flat()
  const selected = flat.indexOf(hex)
  const [focus, setFocus] = React.useState(Math.max(0, selected))
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const move = (to: number) => {
    const next = clamp(to, 0, flat.length - 1)
    setFocus(next)
    refs.current[next]?.focus()
  }
  return (
    <div
      role="listbox"
      aria-label="Colours"
      className="grid aspect-[3/2] w-full grid-cols-12 overflow-hidden rounded-lg"
      onKeyDown={(event) => {
        const steps: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 12, ArrowUp: -12 }
        if (event.key in steps) {
          event.preventDefault()
          move(focus + steps[event.key])
        } else if (event.key === "Home") {
          event.preventDefault()
          move(0)
        } else if (event.key === "End") {
          event.preventDefault()
          move(flat.length - 1)
        }
      }}
    >
      {flat.map((c, i) => (
        <button
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="button"
          role="option"
          aria-selected={i === selected}
          aria-label={c}
          tabIndex={i === (selected >= 0 ? selected : focus) ? 0 : -1}
          onFocus={() => setFocus(i)}
          onClick={() => onPick(c)}
          className={cn(
            "relative outline-none focus-visible:z-10 focus-visible:rounded-[3px] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black/40",
            i === selected && "z-10 rounded-[4px] ring-[2.5px] ring-white shadow-[0_1px_3px_rgb(0_0_0/0.35)]"
          )}
          style={{ background: c }}
        />
      ))}
    </div>
  )
}

const DEFAULT_SWATCHES = ["#6E6D86", "#555CF3", "#1AD598", "#F3654A", "#F47690", "#FACA4A", "#12AFF0", "#A584F3", "#FE6BBA"]

const CHECKER = "repeating-conic-gradient(var(--muted) 0% 25%, var(--card) 0% 50%) 0 0 / 8px 8px"

type ColorPickerProps = {
  /** How a colour is picked: a saturation/brightness area or a grid of swatches. */
  variant?: "spectrum" | "grid"
  /** The colour as #RRGGBB. */
  value?: string
  defaultValue?: string
  onValueChange?: (hex: string) => void
  /** Opacity, 0–1. Leave out `onAlphaChange` and `alpha` to hide the opacity slider. */
  alpha?: number
  defaultAlpha?: number
  onAlphaChange?: (alpha: number) => void
  showAlpha?: boolean
  /** The value fields' format; the select in the picker switches it. */
  format?: ColorFormat
  defaultFormat?: ColorFormat
  onFormatChange?: (format: ColorFormat) => void
  /** Saved colours; the + adds the current colour. */
  swatches?: string[]
  defaultSwatches?: string[]
  onSwatchesChange?: (swatches: string[]) => void
  /** Heading of the panel. Hidden when `null`. */
  title?: React.ReactNode
  /** Shows the close button. */
  onClose?: () => void
  className?: string
}

/**
 * Pick a colour: a saturation/brightness area, hue and opacity sliders, an
 * eyedropper where the browser has one, the value in HEX, RGB or HSL, and a
 * row of saved colours. Everything is reachable from the keyboard — the area
 * and both tracks are sliders that take the arrow keys (Shift for big steps).
 */
function ColorPicker({
  variant = "spectrum",
  value,
  defaultValue = "#555CF3",
  onValueChange,
  alpha,
  defaultAlpha = 1,
  onAlphaChange,
  showAlpha = true,
  format,
  defaultFormat = "hex",
  onFormatChange,
  swatches,
  defaultSwatches = DEFAULT_SWATCHES,
  onSwatchesChange,
  title = "Color picker",
  onClose,
  className,
}: ColorPickerProps) {
  const [ownHex, setOwnHex] = React.useState(defaultValue.toUpperCase())
  const hex = (value ?? ownHex).toUpperCase()
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }

  // HSV is kept as its own state: at zero saturation or brightness the hue
  // cannot be read back from the hex, and the hue slider would jump to red.
  const [hsv, setHsv] = React.useState<HSV>(() => rgbToHsv(rgb))
  const [seenHex, setSeenHex] = React.useState(hex)
  if (seenHex !== hex) {
    // the value changed from outside: follow it
    setSeenHex(hex)
    if (rgbToHex(hsvToRgb(hsv)) !== hex) setHsv(rgbToHsv(rgb))
  }

  const [ownAlpha, setOwnAlpha] = React.useState(defaultAlpha)
  const a = alpha ?? ownAlpha
  const [ownFormat, setOwnFormat] = React.useState<ColorFormat>(defaultFormat)
  const fmt = format ?? ownFormat
  const [ownSwatches, setOwnSwatches] = React.useState(defaultSwatches)
  const saved = swatches ?? ownSwatches

  const commit = (next: HSV) => {
    setHsv(next)
    const nextHex = rgbToHex(hsvToRgb(next))
    setSeenHex(nextHex)
    setOwnHex(nextHex)
    onValueChange?.(nextHex)
  }
  const commitHex = (nextHex: string) => {
    const parsed = hexToRgb(nextHex)
    if (!parsed) return
    commit(rgbToHsv(parsed))
  }
  const setA = (next: number) => {
    setOwnAlpha(next)
    onAlphaChange?.(next)
  }

  const hueColor = rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }))
  const area = usePointerDrag((x, y) => commit({ h: hsv.h, s: x, v: 1 - y }))

  // The eyedropper only exists in Chromium; elsewhere the button is left out.
  const canDrop = React.useSyncExternalStore(
    noop,
    () => "EyeDropper" in window,
    () => false
  )
  const pickFromScreen = async () => {
    try {
      const dropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper()
      const { sRGBHex } = await dropper.open()
      commitHex(sRGBHex.startsWith("#") ? sRGBHex : rgbToHex(hexToRgb(sRGBHex) ?? rgb))
    } catch {
      /* the person pressed Escape */
    }
  }

  const hsl = rgbToHsl(rgb)
  const channels: { label: string; value: string; commit: (v: string) => void }[] =
    fmt === "rgb"
      ? (["r", "g", "b"] as const).map((k) => ({
          label: k.toUpperCase(),
          value: String(Math.round(rgb[k])),
          commit: (v) => {
            const n = Number(v)
            if (Number.isFinite(n)) commitHex(rgbToHex({ ...rgb, [k]: clamp(n, 0, 255) }))
          },
        }))
      : fmt === "hsl"
        ? [
            { label: "Hue", value: String(Math.round(hsl.h)), commit: (v: string) => Number.isFinite(Number(v)) && commitHex(rgbToHex(hslToRgb(clamp(Number(v), 0, 360), hsl.s, hsl.l))) },
            { label: "Saturation", value: `${Math.round(hsl.s * 100)}%`, commit: (v: string) => { const n = parseFloat(v); if (Number.isFinite(n)) commitHex(rgbToHex(hslToRgb(hsl.h, clamp(n, 0, 100) / 100, hsl.l))) } },
            { label: "Lightness", value: `${Math.round(hsl.l * 100)}%`, commit: (v: string) => { const n = parseFloat(v); if (Number.isFinite(n)) commitHex(rgbToHex(hslToRgb(hsl.h, hsl.s, clamp(n, 0, 100) / 100))) } },
          ]
        : [{ label: "Hex", value: hex, commit: (v: string) => commitHex(v.startsWith("#") ? v : `#${v}`) }]

  return (
    <div
      data-slot="color-picker"
      className={cn("flex w-[296px] max-w-full flex-col gap-4 rounded-xl border border-border bg-popover [--surface:var(--popover)] p-4 text-popover-foreground shadow-lg", className)}
    >
      {(title !== null || onClose) && (
        <div className="flex items-center justify-between gap-2">
          {title !== null && <p className="text-sm font-medium text-foreground">{title}</p>}
          {onClose && (
            <IconButton variant="ghost" size="sm" aria-label="Close" onClick={onClose} className="ml-auto">
              <X />
            </IconButton>
          )}
        </div>
      )}

      {variant === "grid" ? (
        <ColorGrid hex={hex} onPick={commitHex} />
      ) : (
        <>
          {/* saturation × brightness */}
      <div
        {...area}
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 0.1 : 0.01
          const moves: Record<string, Partial<HSV>> = {
            ArrowRight: { s: clamp(hsv.s + step, 0, 1) },
            ArrowLeft: { s: clamp(hsv.s - step, 0, 1) },
            ArrowUp: { v: clamp(hsv.v + step, 0, 1) },
            ArrowDown: { v: clamp(hsv.v - step, 0, 1) },
          }
          if (!moves[event.key]) return
          event.preventDefault()
          commit({ ...hsv, ...moves[event.key] })
        }}
        className="relative aspect-[3/2] w-full cursor-crosshair touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), ${hueColor}` }}
      >
        <span
          aria-hidden
          className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_3px_rgb(0_0_0/0.35)]"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hex }}
        />
      </div>

        </>
      )}

      {/* eyedropper + hue + opacity */}
      <div className="flex items-center gap-3">
        {canDrop && (
          <IconButton variant="ghost" size="sm" aria-label="Pick a colour from the screen" onClick={pickFromScreen}>
            <Pipette />
          </IconButton>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-3 py-1">
          <Track
            label="Hue"
            value={hsv.h / 360}
            onChange={(x) => commit({ ...hsv, h: x * 360 })}
            background="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
            handleColor={hueColor}
            valueText={`${Math.round(hsv.h)} degrees`}
          />
          {showAlpha && (
            <Track
              label="Opacity"
              value={a}
              onChange={setA}
              background={`linear-gradient(to right, transparent, ${hex}), ${CHECKER}`}
              handleColor={hex}
              valueText={`${Math.round(a * 100)}%`}
            />
          )}
        </div>
      </div>

      {/* the value */}
      <div className="flex items-center gap-2">
        <NativeSelect
          value={fmt}
          onValueChange={(v) => {
            setOwnFormat(v as ColorFormat)
            onFormatChange?.(v as ColorFormat)
          }}
        >
          <NativeSelectTrigger aria-label="Colour format" className="h-9 w-20 shrink-0 px-2.5 text-[13px]">
            <NativeSelectValue />
          </NativeSelectTrigger>
          <NativeSelectContent>
            <NativeSelectItem value="hex">HEX</NativeSelectItem>
            <NativeSelectItem value="rgb">RGB</NativeSelectItem>
            <NativeSelectItem value="hsl">HSL</NativeSelectItem>
          </NativeSelectContent>
        </NativeSelect>
        <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-md border border-border-control bg-card focus-within:border-ring">
          {channels.map((c) => (
            <ChannelInput key={`${fmt}-${c.label}`} label={c.label} value={c.value} onCommit={c.commit} upper={fmt === "hex"} />
          ))}
          {showAlpha && (
            <ChannelInput
              label="Opacity"
              value={`${Math.round(a * 100)}%`}
              onCommit={(v) => {
                const n = parseFloat(v)
                if (Number.isFinite(n)) setA(clamp(n, 0, 100) / 100)
              }}
              className="w-14 flex-none"
            />
          )}
        </div>
      </div>

      {/* saved colours */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-text-secondary">Saved colours</p>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Save this colour"
            onClick={() => {
              if (saved.includes(hex)) return
              const next = [...saved, hex]
              setOwnSwatches(next)
              onSwatchesChange?.(next)
            }}
          >
            <Plus />
          </IconButton>
        </div>
        <div role="listbox" aria-label="Saved colours" className="flex flex-wrap justify-between gap-y-1.5">
          {saved.map((s) => {
            const selected = s.toUpperCase() === hex
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={s}
                onClick={() => commitHex(s)}
                // the ring — selected or focused — is drawn in the swatch's own colour
                style={{ "--swatch": s } as React.CSSProperties}
                className={cn(
                  "flex size-6 items-center justify-center rounded-full outline-none transition-[box-shadow] duration-fast ease-entrance focus-visible:ring-2 focus-visible:ring-(--swatch)",
                  selected && "ring-2 ring-(--swatch)"
                )}
              >
                <span className={cn("rounded-full transition-[width,height] duration-fast ease-entrance", selected ? "size-4" : "size-5")} style={{ background: s }} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** One field of the value: commits on Enter or blur, so typing "2" on the way to "255" does not jump the colour. */
function ChannelInput({ label, value, onCommit, upper = false, className }: { label: string; value: string; onCommit: (v: string) => void; upper?: boolean; className?: string }) {
  const [draft, setDraft] = React.useState(value)
  const [editing, setEditing] = React.useState(false)
  const shown = editing ? draft : value
  return (
    <input
      aria-label={label}
      value={shown}
      onFocus={() => {
        setDraft(value)
        setEditing(true)
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false)
        if (draft !== value) onCommit(draft)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur()
      }}
      className={cn(
        "h-full min-w-0 flex-1 border-r border-border-control bg-transparent text-center text-[13px] text-foreground tabular-nums outline-none last:border-r-0 focus:bg-muted",
        upper && "uppercase",
        className
      )}
    />
  )
}

/* ------------------------------------------------------------------ */
/* ColorPickerTrigger                                                   */
/* ------------------------------------------------------------------ */

/**
 * The field that opens the picker: a swatch, the hex value and a chevron, the
 * size of an Input. The picker opens in a popover below it.
 */
function ColorPickerTrigger({
  value,
  defaultValue = "#555CF3",
  onValueChange,
  label = "Colour",
  className,
  pickerProps,
  side = "bottom",
  align = "start",
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (hex: string) => void
  /** Accessible name of the field. */
  label?: string
  className?: string
  /** Everything else the picker takes (alpha, swatches, format …). */
  pickerProps?: Omit<ColorPickerProps, "value" | "defaultValue" | "onValueChange" | "onClose">
  side?: "top" | "bottom"
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = React.useState(false)
  const [own, setOwn] = React.useState(defaultValue.toUpperCase())
  const hex = (value ?? own).toUpperCase()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        data-slot="color-picker-trigger"
        aria-label={`${label}: ${hex}`}
        className={cn(
          "group/cp inline-flex h-9 w-60 max-w-full items-center gap-2 rounded-md border border-border-control bg-card pr-2.5 pl-2 text-left outline-none transition-colors duration-fast ease-entrance hover:bg-muted focus-visible:border-ring data-popup-open:border-ring",
          className
        )}
      >
        <span className="size-5 shrink-0 rounded-[4px] ring-1 ring-black/10 ring-inset" style={{ background: hex }} />
        <span className="flex-1 text-[13px] text-foreground uppercase tabular-nums">{hex}</span>
        <ChevronDown className="size-4 shrink-0 text-text-tertiary transition-transform duration-fast ease-entrance group-data-popup-open/cp:rotate-180" />
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-auto border-0 bg-transparent p-0 shadow-none">
        <ColorPicker
          {...pickerProps}
          value={hex}
          onValueChange={(next) => {
            setOwn(next)
            onValueChange?.(next)
          }}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

export { ColorPicker, ColorPickerTrigger }
export type { ColorFormat, ColorPickerProps }
