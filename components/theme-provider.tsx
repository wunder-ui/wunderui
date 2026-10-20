"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider> & {
  /**
   * Keyboard shortcut that toggles light and dark, e.g. `"alt+shift+d"` or `"mod+j"`
   * (`mod` = ⌘ on macOS, Ctrl elsewhere). Off by default. A single character
   * (`"d"`) only meets WCAG 2.1.4 if your users can turn it off or remap it.
   */
  shortcut?: string | false
}

function ThemeProvider({ children, shortcut = false, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {shortcut ? <ThemeHotkey shortcut={shortcut} /> : null}
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function parseShortcut(shortcut: string) {
  const parts = shortcut.toLowerCase().split("+").map((p) => p.trim())
  const key = parts.pop() ?? ""
  const isMac = typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform)
  const has = (m: string) => parts.includes(m)
  return {
    key,
    alt: has("alt") || has("option"),
    shift: has("shift"),
    meta: has("meta") || has("cmd") || (has("mod") && isMac),
    ctrl: has("ctrl") || (has("mod") && !isMac),
  }
}

function ThemeHotkey({ shortcut }: { shortcut: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const combo = parseShortcut(shortcut)
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey !== combo.meta || event.ctrlKey !== combo.ctrl || event.altKey !== combo.alt || event.shiftKey !== combo.shift) {
        return
      }

      // event.code survives Alt/Option layouts that change event.key (e.g. ∂ for Alt+D on macOS)
      const pressed = event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : event.key.toLowerCase()
      if (pressed !== combo.key) {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme, shortcut])

  return null
}

export { ThemeProvider }
export type { ThemeProviderProps }
