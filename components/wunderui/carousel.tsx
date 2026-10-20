"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"

/** Time constant of the scroll spring in ms. The scroll is critically damped:
 *  about half the distance after 170 ms, 95 % after 470 ms, at rest after ~1 s. */
const SPRING_TAU_MS = 95
/** Hard stop, so the last pixels of the tail never keep the scroll running. */
const SPRING_MAX_MS = 950

const springProgress = (elapsed: number) => {
  const x = elapsed / SPRING_TAU_MS
  return 1 - (1 + x) * Math.exp(-x)
}

type CarouselNavigationShape = "rounded" | "circle"

type CarouselProps = {
  children: React.ReactNode
  className?: string
  /** Accessible name of the scrolling region. */
  label?: string
  /** Shape of the two arrow buttons: a rounded square or a circle. */
  navigationShape?: CarouselNavigationShape
  /** Show the two arrow buttons. Turn them off when dots or thumbnails do the navigating. */
  showArrows?: boolean
  /** "auto" keeps every slide at its own width, "full" makes each slide as wide as the row. */
  slideSize?: "auto" | "full"
  /** Advances one slide every this many milliseconds and starts over after the last one.
   *  It stops while the pointer or the keyboard focus is inside, while the tab is hidden
   *  and with reduced motion. 0 or undefined turns it off. */
  autoPlay?: number
  /** The slide the row shows, for dots and thumbnails that control it (controlled). */
  index?: number
  /** Called with the number of the slide the row now shows. */
  onIndexChange?: (index: number) => void
  /** Drag the slides left or right with the mouse or a pen; touch already swipes. The row
   *  follows the pointer and, on release, springs to the nearest slide (a quick flick goes
   *  one slide further). Turn it off when the slides hold content that needs the mouse. */
  drag?: boolean
}

function Carousel({
  children,
  className,
  label = "Carousel",
  navigationShape = "rounded",
  showArrows = true,
  slideSize = "auto",
  autoPlay,
  index,
  onIndexChange,
  drag = true,
}: CarouselProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const frameRef = React.useRef<number | undefined>(undefined)
  const indexRef = React.useRef(0)
  const pausedRef = React.useRef(false)
  const onIndexChangeRef = React.useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange
  const dragRef = React.useRef<{ id: number; startX: number; startScroll: number; lastX: number; lastT: number; velocity: number; moved: boolean } | null>(null)
  const suppressClickRef = React.useRef(false)
  const [dragging, setDragging] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  // Read out after a scroll settles ("Items 2–4 of 6"); empty until the first
  // scroll, so nothing is announced on mount.
  const [announcement, setAnnouncement] = React.useState("")
  const settleTimer = React.useRef<number | undefined>(undefined)

  /** Where each slide starts, in the track's scroll coordinates. The track has a little
   *  inner padding (room for the focus ring) and the snap points sit at scroll-padding;
   *  both are the same, so it is subtracted once. */
  const slideStarts = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return []
    const box = el.getBoundingClientRect()
    const inset = Number.parseFloat(getComputedStyle(el).paddingLeft) || 0
    return Array.from(el.children).map((slide) => slide.getBoundingClientRect().left - box.left + el.scrollLeft - inset)
  }, [])

  const updateScrollState = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    // The slide the row shows: the one whose start is nearest, the last one at the end.
    const starts = slideStarts()
    if (starts.length === 0) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
    const nearest = atEnd
      ? starts.length - 1
      : starts.reduce((best, start, i) => (Math.abs(start - el.scrollLeft) < Math.abs(starts[best] - el.scrollLeft) ? i : best), 0)
    if (nearest !== indexRef.current) {
      indexRef.current = nearest
      onIndexChangeRef.current?.(nearest)
    }
  }, [slideStarts])

  const announceVisible = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const box = el.getBoundingClientRect()
    const slides = Array.from(el.children)
    const visible = slides.flatMap((slide, i) => {
      const r = slide.getBoundingClientRect()
      const shown = Math.min(r.right, box.right) - Math.max(r.left, box.left)
      return r.width > 0 && shown >= r.width / 2 ? [i + 1] : []
    })
    if (visible.length === 0) return
    const first = visible[0]
    const last = visible[visible.length - 1]
    setAnnouncement(first === last ? `Item ${first} of ${slides.length}` : `Items ${first}–${last} of ${slides.length}`)
  }, [])

  /** Stops a running spring and gives the scroll position back to snapping. */
  const stopSpring = React.useCallback(() => {
    if (frameRef.current !== undefined) window.cancelAnimationFrame(frameRef.current)
    frameRef.current = undefined
    if (scrollerRef.current) scrollerRef.current.style.scrollSnapType = ""
  }, [])

  /** Scrolls to a position with the spring (or at once with reduced motion). */
  const animateTo = React.useCallback(
    (target: number) => {
      const el = scrollerRef.current
      if (!el) return
      const max = el.scrollWidth - el.clientWidth
      const to = Math.min(Math.max(target, 0), max)
      stopSpring()
      const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      if (reduce) {
        el.scrollLeft = to
        return
      }
      // Snapping would pull every frame back to the nearest slide; it is off
      // while the spring runs and comes back when it ends.
      el.style.scrollSnapType = "none"
      const from = el.scrollLeft
      const startedAt = performance.now()
      // One clock for start and frames: performance.now(), not the frame timestamp.
      const tick = () => {
        const elapsed = performance.now() - startedAt
        const progress = elapsed >= SPRING_MAX_MS ? 1 : springProgress(elapsed)
        el.scrollLeft = from + (to - from) * progress
        if (progress < 1) {
          frameRef.current = window.requestAnimationFrame(tick)
        } else {
          frameRef.current = undefined
          el.style.scrollSnapType = ""
        }
      }
      frameRef.current = window.requestAnimationFrame(tick)
    },
    [stopSpring]
  )

  /** Moves the track by one slide: the next slide whose start lies beyond the
   *  current position, or the nearest slide before it. */
  const step = React.useCallback(
    (direction: 1 | -1) => {
      const el = scrollerRef.current
      if (!el) return
      const starts = slideStarts()
      const max = el.scrollWidth - el.clientWidth
      const current = el.scrollLeft
      const target =
        direction === 1
          ? (starts.find((start) => start > current + 1) ?? max)
          : ([...starts].reverse().find((start) => start < current - 1) ?? 0)
      animateTo(target)
    },
    [slideStarts, animateTo]
  )

  /** Mouse and pen drag the row; touch scrolls natively. A drag starts after 5 px, so a click stays a click. */
  const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (!drag || !el || event.pointerType === "touch" || event.button !== 0) return
    dragRef.current = { id: event.pointerId, startX: event.clientX, startScroll: el.scrollLeft, lastX: event.clientX, lastT: performance.now(), velocity: 0, moved: false }
  }
  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current
    const el = scrollerRef.current
    if (!state || !el || event.pointerId !== state.id) return
    const dx = event.clientX - state.startX
    if (!state.moved) {
      if (Math.abs(dx) < 5) return
      state.moved = true
      stopSpring()
      // Snapping would fight the pointer; it is off while dragging and comes back with the spring.
      el.style.scrollSnapType = "none"
      el.style.userSelect = "none"
      el.setPointerCapture?.(event.pointerId)
      setDragging(true)
    }
    el.scrollLeft = state.startScroll - dx
    const now = performance.now()
    const dt = now - state.lastT
    if (dt > 0) state.velocity = (event.clientX - state.lastX) / dt
    state.lastX = event.clientX
    state.lastT = now
  }
  const onDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current
    const el = scrollerRef.current
    if (!state || !el || event.pointerId !== state.id) return
    dragRef.current = null
    if (!state.moved) return
    el.releasePointerCapture?.(event.pointerId)
    el.style.userSelect = ""
    setDragging(false)
    // The click that ends a drag must not open the slide under the pointer.
    suppressClickRef.current = true
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)
    const starts = slideStarts()
    const max = el.scrollWidth - el.clientWidth
    const here = el.scrollLeft
    const nearest = starts.length ? starts.reduce((best, start) => (Math.abs(start - here) < Math.abs(best - here) ? start : best), starts[0]) : here
    // A quick flick (towards the left = next) goes one slide further than the nearest.
    const target =
      Math.abs(state.velocity) > 0.4
        ? state.velocity < 0
          ? (starts.find((start) => start > here + 1) ?? max)
          : ([...starts].reverse().find((start) => start < here - 1) ?? 0)
        : nearest
    animateTo(target)
  }

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateScrollState()
    const onScroll = () => {
      updateScrollState()
      // Scrolling fires many events; announce once it has come to rest.
      window.clearTimeout(settleTimer.current)
      settleTimer.current = window.setTimeout(announceVisible, 200)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    // The user takes over (wheel, touch, drag): the spring lets go at once.
    const takeOver = () => stopSpring()
    el.addEventListener("wheel", takeOver, { passive: true })
    el.addEventListener("pointerdown", takeOver, { passive: true })
    // Re-check when the track resizes or items are added/removed — the
    // container itself has no fixed width, so overflow only exists once
    // content is actually wider than the available space.
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    // Slides that grow after mount (images loading) widen the content, not the scroller.
    for (const child of Array.from(el.children)) observer.observe(child)
    return () => {
      el.removeEventListener("scroll", onScroll)
      el.removeEventListener("wheel", takeOver)
      el.removeEventListener("pointerdown", takeOver)
      observer.disconnect()
      window.clearTimeout(settleTimer.current)
    }
  }, [updateScrollState, announceVisible, stopSpring, children])

  // A running spring ends only when the carousel unmounts. The effect above depends on
  // children, which are new on every render of the parent (dots and thumbnails re-render
  // it with each slide), so it must not cancel the spring in its cleanup.
  React.useEffect(() => stopSpring, [stopSpring])

  // Dots and thumbnails drive the row from outside: a new index scrolls to that slide.
  React.useEffect(() => {
    if (index === undefined || index === indexRef.current) return
    const starts = slideStarts()
    if (starts[index] !== undefined) animateTo(starts[index])
  }, [index, slideStarts, animateTo])

  // Autoplay: one slide per interval, back to the first after the last. It starts at once (the first
  // slide change comes after a short beat, not a full interval), waits while the user is interacting or
  // the tab is hidden, and never runs with reduced motion.
  React.useEffect(() => {
    if (!autoPlay || autoPlay <= 0) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
    let timer: number | undefined
    const tick = () => {
      const el = scrollerRef.current
      if (el && !pausedRef.current && !document.hidden) {
        const max = el.scrollWidth - el.clientWidth
        if (max > 1) {
          if (el.scrollLeft >= max - 1) animateTo(0)
          else step(1)
        }
      }
      timer = window.setTimeout(tick, autoPlay)
    }
    timer = window.setTimeout(tick, Math.min(autoPlay, 600))
    return () => window.clearTimeout(timer)
  }, [autoPlay, step, animateTo])

  // The arrows keep their place in the row even when nothing overflows, so the
  // track never changes width when they appear (that would flip the overflow
  // check back and forth). Without overflow they are hidden and unfocusable.
  // At either end an arrow stays mounted but disabled (aria-disabled, still
  // focusable), so a keyboard user pressing it until the end keeps focus
  // instead of dropping to <body>.
  const overflows = canScrollLeft || canScrollRight

  return (
    <div
      className={cn("flex w-full items-center gap-3", className)}
      onPointerEnter={() => {
        pausedRef.current = true
      }}
      onPointerLeave={() => {
        pausedRef.current = false
      }}
      onFocus={() => {
        pausedRef.current = true
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) pausedRef.current = false
      }}
    >
      {showArrows && (
        <IconButton
          variant="plain"
          size="sm"
          shape={navigationShape}
          disabled={!canScrollLeft}
          focusableWhenDisabled
          className={cn("data-disabled:opacity-40", !overflows && "invisible")}
          onClick={() => step(-1)}
          aria-label="Previous"
          tabIndex={overflows ? undefined : -1}
        >
          <ChevronLeft />
        </IconButton>
      )}
      <div
        ref={scrollerRef}
        // focusable, so the slides also scroll with the arrow keys
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className={cn(
          "-mx-1 flex min-w-0 flex-1 snap-x snap-mandatory scroll-px-1 gap-4 overflow-x-auto px-1 py-1 outline-none [scrollbar-width:none] focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden",
          drag && "[@media(pointer:fine)]:cursor-grab",
          dragging && "[@media(pointer:fine)]:cursor-grabbing"
        )}
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        onClickCapture={(event) => {
          if (suppressClickRef.current) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
        onDragStart={(event) => {
          if (drag) event.preventDefault()
        }}
      >
        {React.Children.map(children, (child) => (
          <div className={cn("shrink-0 snap-start", slideSize === "full" && "w-full")}>{child}</div>
        ))}
      </div>
      {showArrows && (
        <IconButton
          variant="plain"
          size="sm"
          shape={navigationShape}
          disabled={!canScrollRight}
          focusableWhenDisabled
          className={cn("data-disabled:opacity-40", !overflows && "invisible")}
          onClick={() => step(1)}
          aria-label="Next"
          tabIndex={overflows ? undefined : -1}
        >
          <ChevronRight />
        </IconButton>
      )}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}

export { Carousel }
export type { CarouselNavigationShape, CarouselProps }
