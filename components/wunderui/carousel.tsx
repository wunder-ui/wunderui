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

  const updateScrollState = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener("scroll", updateScrollState, { passive: true })
    // Re-check when the track resizes or items are added/removed — the
    // container itself has no fixed width, so overflow only exists once
    // content is actually wider than the available space.
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => {
      el.removeEventListener("scroll", updateScrollState)
      observer.disconnect()
    }
  }, [updateScrollState, children])

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" })
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
        className="-mx-1 -mt-1 flex w-[calc(100%+0.5rem)] snap-x snap-mandatory scroll-px-1 gap-4 overflow-x-auto scroll-smooth px-1 pt-1 pb-2 outline-none [scrollbar-width:none] focus-visible:ring-1 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
      >
        {React.Children.map(children, (child) => (
          <div className="shrink-0 snap-start">{child}</div>
        ))}
      </div>
      {canScrollLeft && (
        <IconButton
          variant="light"
          size="sm"
          shape="circle"
          className="absolute top-1/2 -left-3 -translate-y-1/2 shadow-md"
          onClick={() => scrollBy(-320)}
          aria-label="Previous"
        >
          <ChevronLeft />
        </IconButton>
      )}
      {canScrollRight && (
        <IconButton
          variant="light"
          size="sm"
          shape="circle"
          className="absolute top-1/2 -right-3 -translate-y-1/2 shadow-md"
          onClick={() => scrollBy(320)}
          aria-label="Next"
        >
          <ChevronRight />
        </IconButton>
      )}
    </div>
  )
}

export { Carousel }
