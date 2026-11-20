"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { SlashItem } from "./rich-text-editor-slash"

type RichTextEditorProps = {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  /** Id of the editing area. A `<label htmlFor>` cannot name it (it is not a form control): use `aria-labelledby`. */
  id?: string
  /** Accessible name of the editing area when there is no visible label. */
  "aria-label"?: string
  /** Id of the element that names the editing area, such as a visible label. */
  "aria-labelledby"?: string
  /** Id of the element that describes the editing area, such as a helper line. */
  "aria-describedby"?: string
  /**
   * Typing "/" at the start of a line or after a space opens a block menu at the caret: arrow keys pick, Enter or Tab
   * inserts, Escape closes, typing filters. `true` shows the default blocks (headings, lists, task, quote, divider,
   * code); pass your own list to replace them, e.g. `[...richTextEditorSlashItems, myItem]`. Off by default.
   */
  slashMenu?: boolean | SlashItem[]
}

function RichTextEditorSkeleton({ placeholder, className }: Pick<RichTextEditorProps, "placeholder" | "className">) {
  return (
    <div className={cn("flex flex-col rounded-md border border-input bg-card", className)}>
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
export { richTextEditorSlashItems } from "./rich-text-editor-slash"
export type { RichTextEditorProps }
export type { SlashItem } from "./rich-text-editor-slash"
