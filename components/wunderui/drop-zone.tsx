"use client"

import * as React from "react"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

// "image/*" → "images", "application/pdf" → "PDF", ".csv" → "CSV"
function typeName(type: string) {
  const t = type.trim()
  if (t.startsWith(".")) return t.slice(1).toUpperCase()
  if (t.endsWith("/*")) return `${t.slice(0, -2)}s`
  return (t.split("/")[1] ?? t).toUpperCase()
}

function DropZone({
  onFiles,
  accept,
  hint,
  className,
}: {
  onFiles?: (files: FileList) => void
  accept?: string
  /** Line under the prompt. Defaults to the accepted types, or "Any file type". State your size limit here. */
  hint?: React.ReactNode
  className?: string
}) {
  const [isDragging, setIsDragging] = React.useState(false)
  const hintId = React.useId()

  // A <label> around a real (visually hidden) file input: Tab reaches the input,
  // Enter/Space opens the file dialog, a click anywhere on the zone does too.
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files.length) onFiles?.(e.dataTransfer.files)
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-10 text-center transition-colors duration-fast ease-entrance has-[input:focus-visible]:border-ring",
        isDragging && "border-primary bg-primary/5",
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple
        aria-describedby={hintId}
        className="sr-only"
        onChange={(e) => e.target.files && onFiles?.(e.target.files)}
      />
      <UploadCloud className="size-8 text-text-tertiary" aria-hidden />
      <p className="text-sm font-medium text-foreground">
        Drop files here or <span className="text-text-link">browse</span>
      </p>
      <p id={hintId} className="text-xs text-text-tertiary">{hint ?? (accept ? `Accepts ${accept.split(",").map(typeName).join(", ")}` : "Any file type")}</p>
    </label>
  )
}

export { DropZone }
