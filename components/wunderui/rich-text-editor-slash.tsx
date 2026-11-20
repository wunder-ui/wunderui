"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"

/** One entry of the RichTextEditor's "/" menu. `run` gets the editor after the "/query" text was removed. */
export type SlashItem = {
  id: string
  label: string
  icon?: React.ReactNode
  /** Extra words the filter matches, e.g. ["h1", "title"] for Heading 1. */
  keywords?: string[]
  run: (editor: Editor) => void
}

/** The default blocks of the "/" menu: headings, lists, task, quote, divider and code. Spread them to add your own. */
export const richTextEditorSlashItems: SlashItem[] = [
  { id: "heading-1", label: "Heading 1", icon: <Icon name="formatHeading1" />, keywords: ["h1", "title", "large"], run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: "heading-2", label: "Heading 2", icon: <Icon name="formatHeading2" />, keywords: ["h2", "subtitle", "section"], run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: "bulleted-list", label: "Bulleted list", icon: <Icon name="formatBulletList" />, keywords: ["ul", "bullet", "unordered"], run: (e) => e.chain().focus().toggleBulletList().run() },
  { id: "numbered-list", label: "Numbered list", icon: <Icon name="formatNumberedList" />, keywords: ["ol", "ordered", "1."], run: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: "task", label: "Task", icon: <Icon name="formatTaskList" />, keywords: ["todo", "checkbox", "checklist"], run: (e) => e.chain().focus().toggleList("taskList", "taskItem").run() },
  { id: "quote", label: "Quote", icon: <Icon name="formatQuote" />, keywords: ["blockquote", "citation"], run: (e) => e.chain().focus().toggleBlockquote().run() },
  { id: "divider", label: "Divider", icon: <Icon name="formatDivider" />, keywords: ["hr", "line", "separator", "rule"], run: (e) => e.chain().focus().setHorizontalRule().run() },
  { id: "code", label: "Code", icon: <Icon name="formatCode" />, keywords: ["codeblock", "snippet", "pre"], run: (e) => e.chain().focus().toggleCodeBlock().run() },
]

/** The items that match the text typed after "/": label or keyword, ignoring case. */
export function filterSlashItems(items: SlashItem[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => item.label.toLowerCase().includes(q) || item.keywords?.some((k) => k.toLowerCase().includes(q)))
}

/** The listbox under the caret; the editing area keeps the focus and points at the active option. */
export function SlashMenuList({
  id,
  items,
  active,
  position,
  onPick,
  onHover,
}: {
  id: string
  items: SlashItem[]
  active: number
  position: { top: number; left: number }
  onPick: (item: SlashItem) => void
  onHover: (index: number) => void
}) {
  const listRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const option = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    option?.scrollIntoView?.({ block: "nearest" })
  }, [active])
  return (
    // No entrance motion: the menu is keyboard-driven and opens many times a day (M11).
    <div
      ref={listRef}
      id={id}
      role="listbox"
      aria-label="Blocks"
      data-slot="rich-text-editor-slash-menu"
      className="absolute z-50 max-h-72 w-60 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
      style={{ top: position.top, left: position.left }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          id={`${id}-${item.id}`}
          role="option"
          aria-selected={index === active}
          data-index={index}
          data-slot="rich-text-editor-slash-item"
          // keep the caret in the editor while clicking
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(item)}
          onMouseMove={() => index !== active && onHover(index)}
          className={cn(
            "flex h-8 cursor-default items-center gap-2 rounded-md px-2 text-label-sm font-medium text-foreground select-none",
            "aria-selected:bg-bg-page active:bg-bg-subtle [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-text-secondary"
          )}
        >
          {item.icon && (
            <span aria-hidden="true" className="flex shrink-0">
              {item.icon}
            </span>
          )}
          <span className="truncate">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
