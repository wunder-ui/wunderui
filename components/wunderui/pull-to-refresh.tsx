"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type PullToRefreshProps = {
  onRefresh: () => void | Promise<void>
  threshold?: number
  maxPull?: number
  children: React.ReactNode
  className?: string
}

/** Movement (px) before a press counts as a drag; below it a tap stays a tap. */
const DRAG_SLOP = 8

function isScrollable(el: Element) {
  const { overflowY } = getComputedStyle(el)
  return (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight
}

/**
 * Whether everything that could scroll from `el` upwards is at its top: up to
 * `stopAt` (exclusive) when given, else up to and including the page.
 */
function scrolledToTop(el: Element | null, stopAt?: Element | null) {
  for (let node = el; node && node !== stopAt && node !== document.documentElement; node = node.parentElement) {
    if (node.scrollTop > 0 && isScrollable(node)) return false
  }
  if (stopAt) return true
  const page = document.scrollingElement ?? document.documentElement
  return page.scrollTop <= 0
}

// Pointer-based pull-to-refresh: drag down from the top of `children` past
// `threshold` to trigger `onRefresh`. Rubber-bands (half-speed) up to
// `maxPull`, and springs back once the refresh resolves.
//
// The pull only starts when the gesture is vertical, downward and everything
// above it is scrolled to the top, so the content scrolls natively, swipes
// sideways keep working and taps reach the children (the pointer is captured
// only once a drag has really begun). On touch, `touch-action: pan-x pan-down`
// is set only while at the top (else `auto`): the browser keeps scrolling
// the content up, and the downward pull is left to this component.
function PullToRefresh({
  onRefresh,
  threshold = 70,
  maxPull = 110,
  children,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [atTop, setAtTop] = React.useState(true)
  const contentRef = React.useRef<HTMLDivElement>(null)
  // The press being tracked: where it started, and where the drag began once it did.
  const press = React.useRef<{ id: number; x: number; y: number; originY: number | null } | null>(null)
  const suppressClick = React.useRef(false)

  // Track whether the page (and every scroller around the content) is at its
  // top, so touch-action can hand the downward pull to us only there.
  React.useEffect(() => {
    const update = () => setAtTop(scrolledToTop(contentRef.current?.parentElement ?? null))
    update()
    window.addEventListener("scroll", update, { capture: true, passive: true })
    return () => window.removeEventListener("scroll", update, { capture: true })
  }, [])

  function reset() {
    press.current = null
    setIsDragging(false)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // One finger, the main button, and not while a refresh runs.
    if (e.isPrimary) suppressClick.current = false
    if (refreshing || press.current || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return
    // Inside content that is scrolled down, the gesture scrolls it back up
    // first. A finger also scrolls the page, so for touch the page must be at
    // its top too; a mouse drag never scrolls, so only the content counts.
    const stopAt = e.pointerType === "touch" ? null : e.currentTarget.parentElement
    if (!scrolledToTop(e.target as Element, stopAt)) return
    press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, originY: null }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const p = press.current
    if (!p || e.pointerId !== p.id || refreshing) return
    if (p.originY === null) {
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) return
      // Sideways or upward: not a pull. Let the browser and the children have it.
      if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
        press.current = null
        return
      }
      // A real pull: from here on the drag belongs to this component.
      p.originY = e.clientY
      setIsDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const delta = e.clientY - p.originY
    setPullDistance(delta <= 0 ? 0 : Math.min(maxPull, delta * 0.5))
  }

  async function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const p = press.current
    if (!p || e.pointerId !== p.id) return
    const dragged = p.originY !== null
    reset()
    if (!dragged) return
    // The release after a pull is not a click on whatever sits under the
    // finger (cleared again by the next press).
    suppressClick.current = true

    if (pullDistance >= threshold) {
      setRefreshing(true)
      setPullDistance(threshold)
      // A failed refresh must not leave the spinner running and the pull locked.
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
      return
    }
    setPullDistance(0)
  }

  // The browser took the gesture (a scroll, a system gesture): give the
  // pointer back and spring home without refreshing.
  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    const p = press.current
    if (!p || e.pointerId !== p.id) return
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    reset()
    if (!refreshing) setPullDistance(0)
  }

  const progress = Math.min(1, pullDistance / threshold)

  return (
    <div data-slot="pull-to-refresh" className={cn("relative overflow-hidden", className)}>
      <div
        data-slot="pull-to-refresh-indicator"
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center"
        style={{ height: threshold, opacity: progress }}
      >
        <Loader2
          className={cn("size-5 text-primary", refreshing && "animate-spin")}
          style={!refreshing ? { transform: `rotate(${progress * 360}deg)` } : undefined}
        />
      </div>

      <div
        ref={contentRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={(e) => {
          if (!suppressClick.current) return
          suppressClick.current = false
          e.preventDefault()
          e.stopPropagation()
        }}
        className="cursor-grab select-none active:cursor-grabbing"
        style={{
          touchAction: atTop ? "pan-x pan-down pinch-zoom" : "auto",
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging ? "none" : "transform var(--duration-slow) var(--ease-entrance)",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { PullToRefresh }
