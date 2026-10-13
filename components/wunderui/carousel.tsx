"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"

function Carousel({
  children,
  className,
  label = "Carousel",
}: {
  children: React.ReactNode
  className?: string
  /** Accessible name of the scrolling region. */
  label?: string
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  // Read out after a scroll settles ("Items 2–4 of 6"); empty until the first
  // scroll, so nothing is announced on mount.
  const [announcement, setAnnouncement] = React.useState("")
  const settleTimer = React.useRef<number | undefined>(undefined)

  const updateScrollState = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

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

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateScrollState()
    const onScroll = () => {
      updateScrollState()
      // Smooth scrolling fires many events; announce once it has come to rest.
      window.clearTimeout(settleTimer.current)
      settleTimer.current = window.setTimeout(announceVisible, 200)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    // Re-check when the track resizes or items are added/removed — the
    // container itself has no fixed width, so overflow only exists once
    // content is actually wider than the available space.
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    // Slides that grow after mount (images loading) widen the content, not the scroller.
    for (const child of Array.from(el.children)) observer.observe(child)
    return () => {
      el.removeEventListener("scroll", onScroll)
      observer.disconnect()
      window.clearTimeout(settleTimer.current)
    }
  }, [updateScrollState, announceVisible, children])

  // Arrows are shown while the row overflows. At either end the arrow stays
  // mounted but disabled (aria-disabled, still focusable), so a keyboard user
  // pressing it until the end keeps focus instead of dropping to <body>.
  const overflows = canScrollLeft || canScrollRight

  const scrollBy = (delta: number) => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    scrollerRef.current?.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={scrollerRef}
        // focusable, so the slides also scroll with the arrow keys
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className="-mx-1 -mt-1 flex w-[calc(100%+0.5rem)] snap-x snap-mandatory scroll-px-1 gap-4 overflow-x-auto scroll-smooth motion-reduce:scroll-auto px-1 pt-1 pb-2 outline-none [scrollbar-width:none] focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
      >
        {React.Children.map(children, (child) => (
          <div className="shrink-0 snap-start">{child}</div>
        ))}
      </div>
      {overflows && (
        <IconButton
          variant="light"
          size="sm"
          shape="circle"
          disabled={!canScrollLeft}
          focusableWhenDisabled
          className="absolute top-1/2 -left-3 -translate-y-1/2 shadow-md data-disabled:opacity-40"
          onClick={() => scrollBy(-320)}
          aria-label="Previous"
        >
          <ChevronLeft />
        </IconButton>
      )}
      {overflows && (
        <IconButton
          variant="light"
          size="sm"
          shape="circle"
          disabled={!canScrollRight}
          focusableWhenDisabled
          className="absolute top-1/2 -right-3 -translate-y-1/2 shadow-md data-disabled:opacity-40"
          onClick={() => scrollBy(320)}
          aria-label="Next"
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
