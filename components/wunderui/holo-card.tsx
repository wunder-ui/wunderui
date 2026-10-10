"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function HoloCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    ref.current!.style.setProperty("--holo-x", `${x}%`)
    ref.current!.style.setProperty("--holo-y", `${y}%`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card p-5",
        className
      )}
      style={{ "--holo-x": "50%", "--holo-y": "50%" } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity ease-entrance duration-fast group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--holo-x) var(--holo-y), color-mix(in srgb, var(--primary) 25%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

export { HoloCard }
