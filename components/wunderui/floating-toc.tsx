"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type TocItem = {
  id: string
  label: string
  depth?: number
}

/**
 * Which section is being read: the last section whose top has passed the
 * reading line (a quarter down the scroll container, or the window). Once the
 * container is scrolled to its end, the last section wins, so short closing
 * sections can still become active.
 */
function useScrollSpy(ids: string[], root?: React.RefObject<HTMLElement | null>, enabled = true) {
  const [active, setActive] = React.useState<string | undefined>(ids[0])
  const key = ids.join(",")
  React.useEffect(() => {
    if (!enabled) return
    const box = root?.current ?? null
    const scope: ParentNode = box ?? document
    const compute = () => {
      const els = ids.map((id) => scope.querySelector<HTMLElement>(`#${CSS.escape(id)}`)).filter((el): el is HTMLElement => !!el)
      if (!els.length) return
      const atEnd = box
        ? box.scrollTop + box.clientHeight >= box.scrollHeight - 2
        : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      const scrolled = box ? box.scrollTop > 0 : window.scrollY > 0
      if (atEnd && scrolled) return setActive(els[els.length - 1].id)
      const line = (box ? box.getBoundingClientRect().top : 0) + (box ? box.clientHeight : window.innerHeight) * 0.25
      let current = els[0].id
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id
        else break
      }
      setActive(current)
    }
    compute()
    const target: HTMLElement | Window = box ?? window
    target.addEventListener("scroll", compute, { passive: true })
    window.addEventListener("resize", compute)
    return () => {
      target.removeEventListener("scroll", compute)
      window.removeEventListener("resize", compute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, root, enabled])
  return [active, setActive] as const
}

/**
 * A table of contents whose marker glides to the section being read.
 *
 * - Pass `activeId` to control it yourself, or leave it out and the TOC tracks
 *   its sections with a scroll spy — on the page, or inside `scrollContainer`.
 * - A click scrolls the section into view (smoothly, instantly under reduced
 *   motion), moves the marker at once and calls `onSelect`.
 * - Hovering an entry previews the marker on it; the current entry carries
 *   `aria-current="location"`.
 */
function FloatingToc({
  items,
  activeId,
  onSelect,
  scrollContainer,
  className,
}: {
  items: TocItem[]
  activeId?: string
  onSelect?: (id: string) => void
  /** The element that scrolls the sections, if it is not the page. */
  scrollContainer?: React.RefObject<HTMLElement | null>
  className?: string
}) {
  const navRef = React.useRef<HTMLElement>(null)
  const controlled = activeId !== undefined
  const [spied, setSpied] = React.useState<string | undefined>(undefined)
  const [spyActive, setSpyActive] = useScrollSpy(
    items.map((i) => i.id),
    scrollContainer,
    !controlled
  )
  // A click wins over the spy until the scroll it started has settled.
  const clickLock = React.useRef<number | undefined>(undefined)
  const current = controlled ? activeId : (spied ?? spyActive)
  React.useEffect(() => {
    if (clickLock.current === undefined) setSpied(undefined)
  }, [spyActive])
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [marker, setMarker] = React.useState<{ top: number; height: number } | null>(null)
  const [preview, setPreview] = React.useState<{ top: number; height: number } | null>(null)

  const measure = React.useCallback((id: string | null | undefined) => {
    const link = id ? navRef.current?.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(id)}"]`) : null
    return link ? { top: link.offsetTop, height: link.offsetHeight } : null
  }, [])

  // One marker that glides to the active link instead of a marker per link.
  React.useLayoutEffect(() => setMarker(measure(current)), [current, items, measure])
  React.useLayoutEffect(() => setPreview(hovered && hovered !== current ? measure(hovered) : null), [hovered, current, measure])

  function select(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const scope: ParentNode = scrollContainer?.current ?? document
    const target = scope.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
    onSelect?.(id)
    if (!target) return
    event.preventDefault()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const box = scrollContainer?.current
    if (!controlled) {
      setSpied(id)
      setSpyActive(id)
      // Hold the clicked entry until the smooth scroll it starts has ended.
      window.clearTimeout(clickLock.current)
      const release = () => {
        window.clearTimeout(clickLock.current)
        clickLock.current = undefined
      }
      clickLock.current = window.setTimeout(release, 1200)
      ;(box ?? window).addEventListener("scrollend", release, { once: true })
    }
    if (box) {
      const top = target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 8
      box.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
    } else {
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
      history.replaceState(null, "", `#${id}`)
    }
  }

  return (
    <nav
      ref={navRef}
      aria-label="On this page"
      onMouseLeave={() => setHovered(null)}
      className={cn("relative flex flex-col gap-1 border-l border-border pl-1", className)}
    >
      {preview && (
        <span
          aria-hidden
          className="absolute -left-px w-0.5 rounded-full bg-text-tertiary/50 transition-[top,height] duration-fast ease-move motion-reduce:transition-none"
          style={{ top: preview.top, height: preview.height }}
        />
      )}
      {marker && (
        <span
          aria-hidden
          className="absolute -left-px w-0.5 rounded-full bg-primary transition-[top,height] duration-base ease-move motion-reduce:transition-none"
          style={{ top: marker.top, height: marker.height }}
        />
      )}
      {items.map((item) => {
        const active = item.id === current
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            data-toc-id={item.id}
            aria-current={active ? "location" : undefined}
            onMouseEnter={() => setHovered(item.id)}
            onFocus={() => setHovered(item.id)}
            onBlur={() => setHovered(null)}
            onClick={(e) => select(e, item.id)}
            style={{ marginLeft: (item.depth ?? 0) * 12 }}
            className={cn(
              "relative rounded-md px-2 py-1 text-[13px] outline-none transition-colors duration-fast ease-entrance focus-visible:ring-1 focus-visible:ring-ring",
              active ? "font-medium text-foreground" : "text-text-tertiary hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

export { FloatingToc, useScrollSpy }
export type { TocItem }
