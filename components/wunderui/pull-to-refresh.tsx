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

// Pointer-based pull-to-refresh: drag down from the top of `children` past
// `threshold` to trigger `onRefresh`. Rubber-bands (half-speed) up to
// `maxPull`, and springs back once the refresh resolves. Does not gate on
// scroll position — if `children` is itself scrollable, wrap only the part
// that should trigger a refresh, or add a scrollTop === 0 guard at the call
// site.
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
  const startY = React.useRef<number | null>(null)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (refreshing) return
    startY.current = e.clientY
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (startY.current == null || refreshing) return
    const delta = e.clientY - startY.current
    setPullDistance(delta <= 0 ? 0 : Math.min(maxPull, delta * 0.5))
  }

  async function handlePointerUp() {
    if (startY.current == null) return
    startY.current = null
    setIsDragging(false)

    if (pullDistance >= threshold) {
      setRefreshing(true)
      setPullDistance(threshold)
      await onRefresh()
      setRefreshing(false)
    }
    setPullDistance(0)
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="touch-none cursor-grab select-none active:cursor-grabbing"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging ? "none" : "transform 300ms ease",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { PullToRefresh }
