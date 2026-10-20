"use client"

import * as React from "react"

/** True while the element's content is wider than the element (it scrolls sideways). */
export function useOverflowX<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [overflow, setOverflow] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    // Every child, and children added later: a new Kanban column widens the
    // content without resizing the element or its first child.
    const watch = () => {
      for (const child of Array.from(el.children)) ro.observe(child)
      check()
    }
    watch()
    const mo = new MutationObserver(watch)
    mo.observe(el, { childList: true })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [ref])
  return overflow
}
