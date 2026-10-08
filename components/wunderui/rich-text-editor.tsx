"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type RichTextEditorProps = {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
}

function RichTextEditorSkeleton({ placeholder, className }: Pick<RichTextEditorProps, "placeholder" | "className">) {
  return (
    <div className={cn("flex flex-col rounded-lg border border-input", className)}>
      <div className="h-[38px] border-b border-border" />
      <div className="min-h-32 p-3 text-sm text-text-tertiary">{placeholder}</div>
    </div>
  )
}

// TipTap is a regular dependency (bundlers resolve this import at build time,
// so it cannot be optional), but it is only imported inside the lazy chunk:
// apps that never render the editor never download it.
const RichTextEditorInner = React.lazy(() => import("./rich-text-editor-inner"))

function RichTextEditor(props: RichTextEditorProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const fallback = <RichTextEditorSkeleton placeholder={props.placeholder ?? "Write something..."} className={props.className} />
  if (!mounted) return fallback
  return (
    <React.Suspense fallback={fallback}>
      <RichTextEditorInner {...props} />
    </React.Suspense>
  )
}

export { RichTextEditor, RichTextEditorSkeleton }
export type { RichTextEditorProps }
