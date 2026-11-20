"use client"

import * as React from "react"

// WAI-ARIA tabs pattern, keyboard part: ←/→ move to the previous/next tab and
// activate it (automatic activation), Home/End jump to the first/last, both
// directions wrap. Works on the DOM, so any tablist whose tabs are buttons
// with role="tab" can use it — the tab's own onClick does the activating.

const TAB = '[role="tab"]'

function ownTabs(list: HTMLElement) {
  return Array.from(list.querySelectorAll<HTMLElement>(TAB)).filter(
    (tab) => tab.closest('[role="tablist"]') === list && !tab.matches(':disabled, [aria-disabled="true"]')
  )
}

/** onKeyDown for an element with role="tablist". */
export function handleTabListKeyDown(event: React.KeyboardEvent<HTMLElement>) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const list = event.currentTarget
  const current = (event.target as HTMLElement).closest<HTMLElement>(TAB)
  // Keys pressed inside something else in the list (a menu, an input) stay theirs.
  if (!current || current.closest('[role="tablist"]') !== list) return
  const tabs = ownTabs(list)
  if (tabs.length === 0) return
  event.preventDefault()
  const index = Math.max(0, tabs.indexOf(current))
  const last = tabs.length - 1
  const next =
    event.key === "Home" ? 0 : event.key === "End" ? last : event.key === "ArrowRight" ? (index + 1) % tabs.length : (index + last) % tabs.length
  const target = tabs[next]
  // preventScroll + our own nearest scroll: the browser leaves a tab that is only partly visible half hidden, and a
  // focused tab must be seen whole (a scrolling tab bar, a tab list in a narrow panel).
  target.focus({ preventScroll: true })
  target.scrollIntoView?.({ block: "nearest", inline: "nearest" })
  if (target.getAttribute("aria-selected") !== "true") target.click()
}

/**
 * Keeps one tab stop in a tablist whose tabs do not set tabIndex themselves:
 * the selected tab, or the first enabled one when none is selected.
 */
export function useRovingTabStop(ref: React.RefObject<HTMLElement | null>) {
  const sync = React.useCallback(() => {
    const list = ref.current
    if (!list) return
    const tabs = ownTabs(list)
    const stop = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ?? tabs[0]
    for (const tab of list.querySelectorAll<HTMLElement>(TAB)) {
      if (tab.closest('[role="tablist"]') !== list) continue
      const value = tab === stop ? "0" : "-1"
      if (tab.getAttribute("tabindex") !== value) tab.setAttribute("tabindex", value)
    }
  }, [ref])

  // After every render of the list, and when a tab changes on its own
  // (a TabItem whose parent re-renders without the list).
  React.useLayoutEffect(sync)
  React.useEffect(() => {
    const list = ref.current
    if (!list) return
    const observer = new MutationObserver(sync)
    observer.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-selected", "disabled", "aria-disabled"] })
    return () => observer.disconnect()
  }, [ref, sync])
}
