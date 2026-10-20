"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * How dense the components are. `compact` is the default look (controls
 * 32/36/40/44/48); `comfortable` restores the larger sizes from before
 * Oct 2026 (36/40/44/48/56, the Figma 1:1 sizes). The sizes themselves live
 * as tokens in `styles.css` (`--control-*`, `--field-*`, `--row-py` …).
 */
type DensityValue = "compact" | "comfortable"

const DENSITY_ATTRIBUTE = "data-density"
const DENSITY_STORAGE_KEY = "wui-density"
const DEFAULT_DENSITY: DensityValue = "compact"

function isDensity(value: unknown): value is DensityValue {
  return value === "compact" || value === "comfortable"
}

function readStoredDensity(storageKey: string): DensityValue | null {
  try {
    const value = window.localStorage.getItem(storageKey)
    return isDensity(value) ? value : null
  } catch {
    return null
  }
}

function writeStoredDensity(storageKey: string, value: DensityValue) {
  try {
    window.localStorage.setItem(storageKey, value)
  } catch {
    // private mode or blocked storage: the density still applies for this visit
  }
}

/**
 * Sets the attribute without letting anything animate to the new size: a
 * switch is a layout change, not an interaction (motion rules M11/M20). All
 * transitions are suspended for one frame, the same trick next-themes uses
 * for `disableTransitionOnChange`.
 */
function applyDensity(element: HTMLElement, value: DensityValue) {
  if (element.getAttribute(DENSITY_ATTRIBUTE) === value) return
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none!important}"
  document.head.appendChild(style)
  element.setAttribute(DENSITY_ATTRIBUTE, value)
  // force a style flush while transitions are off, then restore them
  void window.getComputedStyle(element).height
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => style.remove()))
}

/**
 * Inline script for the document `<head>` that applies a stored density
 * before the first paint, so a page persisted as `comfortable` never renders
 * compact first. Only needed together with a persisting `DensityProvider`;
 * the library itself never touches `document` during render.
 *
 * Pass the provider's `defaultDensity` as `fallback` when it is not
 * `compact`, so a first visit (nothing stored) paints at that density too.
 *
 * @example
 * <script dangerouslySetInnerHTML={{ __html: densityScript() }} />
 */
function densityScript(storageKey: string = DENSITY_STORAGE_KEY, fallback?: DensityValue) {
  return `try{var d=localStorage.getItem(${JSON.stringify(storageKey)});if(d!=="compact"&&d!=="comfortable")d=${JSON.stringify(fallback ?? null)};if(d)document.documentElement.setAttribute("${DENSITY_ATTRIBUTE}",d)}catch(e){}`
}

type DensityContextValue = {
  /** The density the provider applies. */
  density: DensityValue
  /** Changes the density (and stores it when the provider persists). */
  setDensity: (value: DensityValue) => void
}

const DensityContext = React.createContext<DensityContextValue | null>(null)

type DensityProviderProps = {
  children?: React.ReactNode
  /** Starting density when nothing is stored. Defaults to `compact`. */
  defaultDensity?: DensityValue
  /** Controlled density; pair with `onDensityChange`. */
  density?: DensityValue
  onDensityChange?: (value: DensityValue) => void
  /**
   * localStorage key the density is kept under, or `false` to keep nothing.
   * Defaults to `"wui-density"`.
   */
  storageKey?: string | false
}

/**
 * Applies a density to the whole document (`data-density` on `<html>`), keeps
 * it in localStorage and hands it to `useDensity()`. It renders no UI. For one
 * region only, wrap it in `<Density>` instead.
 *
 * SSR-safe: nothing touches `document` until the provider has mounted. A
 * stored value is applied on mount without animating; add `densityScript()`
 * to `<head>` to apply it before the first paint.
 *
 * @example
 * <DensityProvider defaultDensity="comfortable">
 *   <App />
 * </DensityProvider>
 */
function DensityProvider({
  children,
  defaultDensity = DEFAULT_DENSITY,
  density: controlled,
  onDensityChange,
  storageKey = DENSITY_STORAGE_KEY,
}: DensityProviderProps) {
  const [uncontrolled, setUncontrolled] = React.useState<DensityValue>(defaultDensity)
  const density = controlled ?? uncontrolled

  // pick up a stored value after mount (never during render: SSR-safe)
  React.useEffect(() => {
    if (controlled || !storageKey) return
    const stored = readStoredDensity(storageKey)
    if (stored) setUncontrolled(stored)
  }, [controlled, storageKey])

  // The first apply waits for a stored value: applying the default first
  // would switch a page that densityScript() already set to the stored
  // density back for one frame (a visible jump).
  const firstApply = React.useRef(true)
  React.useEffect(() => {
    if (firstApply.current) {
      firstApply.current = false
      const stored = controlled === undefined && storageKey ? readStoredDensity(storageKey) : null
      if (stored && stored !== density) return // the effect above switches to it; the next commit applies it
    }
    applyDensity(document.documentElement, density)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density])

  // Unmounted, the provider leaves <html> as it found it.
  React.useEffect(() => () => document.documentElement.removeAttribute(DENSITY_ATTRIBUTE), [])

  const setDensity = React.useCallback(
    (value: DensityValue) => {
      if (storageKey) writeStoredDensity(storageKey, value)
      if (controlled === undefined) setUncontrolled(value)
      onDensityChange?.(value)
    },
    [controlled, onDensityChange, storageKey]
  )

  const value = React.useMemo(() => ({ density, setDensity }), [density, setDensity])
  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>
}

/**
 * The density of the nearest `DensityProvider` and a setter for it. Outside a
 * provider it reports the library default (`compact`) and the setter does
 * nothing.
 *
 * @example
 * const { density, setDensity } = useDensity()
 */
function useDensity(): DensityContextValue {
  return React.useContext(DensityContext) ?? { density: DEFAULT_DENSITY, setDensity: () => {} }
}

type DensityProps = React.ComponentProps<"div"> & {
  /** Density for everything inside. */
  value: DensityValue
}

/**
 * Sets a density for one region: everything inside renders at that density,
 * the rest of the page keeps its own. The wrapper is `display: contents`, so
 * it adds no box and does not change the surrounding layout.
 *
 * @example
 * <Density value="comfortable">
 *   <SignInForm />
 * </Density>
 */
function Density({ value, className, ...props }: DensityProps) {
  return <div data-slot="density" {...{ [DENSITY_ATTRIBUTE]: value }} className={cn("contents", className)} {...props} />
}

export { Density, DensityProvider, useDensity, densityScript, DENSITY_STORAGE_KEY }
export type { DensityValue, DensityProps, DensityProviderProps }
