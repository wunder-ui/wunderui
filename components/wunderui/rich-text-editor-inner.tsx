"use client"

import * as React from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Icon } from "@/components/ui/icon-provider"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { RichTextEditorSkeleton, type RichTextEditorProps } from "./rich-text-editor"
import { filterSlashItems, richTextEditorSlashItems, SlashMenuList, type SlashItem } from "./rich-text-editor-slash"
import { TaskItem, TaskList } from "./rich-text-editor-tasks"

function RichTextEditorToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  /** Accessible name — the buttons only show an icon. */
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      title={label}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-text-secondary outline-none transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-bg-subtle focus-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
        active && "bg-bg-subtle text-foreground hover:bg-bg-subtle"
      )}
    >
      {children}
    </button>
  )
}

function RichTextEditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex items-center gap-0.5 border-b border-border p-1.5">
      <RichTextEditorToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Icon name="formatBold" />
      </RichTextEditorToolbarButton>
      <RichTextEditorToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Icon name="formatItalic" />
      </RichTextEditorToolbarButton>
      <RichTextEditorToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Icon name="formatUnderline" />
      </RichTextEditorToolbarButton>
      <Separator orientation="vertical" className="mx-1 h-5 data-vertical:self-center" />
      <RichTextEditorToolbarButton
        label="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <Icon name="formatBulletList" />
      </RichTextEditorToolbarButton>
      <RichTextEditorToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <Icon name="formatNumberedList" />
      </RichTextEditorToolbarButton>
      <Separator orientation="vertical" className="mx-1 h-5 data-vertical:self-center" />
      <RichTextEditorToolbarButton
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const url = window.prompt("URL")
          if (url === null) return // Cancel keeps the link as it is.
          if (url) editor.chain().focus().setLink({ href: url }).run()
          else editor.chain().focus().unsetLink().run()
        }}
      >
        <Icon name="formatLink" />
      </RichTextEditorToolbarButton>
    </div>
  )
}

const EDITOR_CLASS =
  "min-h-32 p-3 text-sm text-foreground outline-none [&_a]:text-text-link [&_a]:underline [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_p.is-editor-empty:first-child::before]:text-text-tertiary [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:h-0"

// The blocks the "/" menu inserts; only added with slashMenu, so editors without it render exactly as before.
const BLOCK_CLASS =
  "[&>*+*]:mt-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_blockquote]:border-s-2 [&_blockquote]:border-border-control [&_blockquote]:ps-3 [&_blockquote]:text-text-secondary [&_hr]:my-3 [&_hr]:border-border [&_pre]:rounded-md [&_pre]:bg-bg-page [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_code]:font-mono " +
  "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:ps-0 [&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-start [&_li[data-type=taskItem]]:gap-2 [&_li[data-type=taskItem]>label]:flex [&_li[data-type=taskItem]>label]:h-5 [&_li[data-type=taskItem]>label]:items-center [&_li[data-type=taskItem]>div]:min-w-0 [&_li[data-type=taskItem]>div]:flex-1 [&_li[data-checked=true]>div]:text-text-secondary [&_li[data-checked=true]>div]:line-through [&_input[type=checkbox]]:size-4 [&_input[type=checkbox]]:accent-(--primary)"

type SlashState = { from: number; query: string }

// stands in for images and other leaf nodes in the text before the caret (a "/" right after one does not open the menu)
const LEAF_TEXT = String.fromCharCode(0xfffc)

// Loaded lazily by rich-text-editor.tsx so @tiptap/* stays an optional peer:
// this file is the only one that imports it, and tsup splits it into its own chunk.
function RichTextEditorInner({
  content,
  onChange,
  placeholder = "Write something...",
  className,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  slashMenu,
}: RichTextEditorProps) {
  const slashItems = React.useMemo<SlashItem[] | null>(
    () =>
      slashMenu === true
        ? richTextEditorSlashItems
        : Array.isArray(slashMenu)
          ? slashMenu
          : null,
    [slashMenu],
  )
  const slashOn = slashItems !== null
  const menuId = React.useId()
  const frameRef = React.useRef<HTMLDivElement>(null)
  const [slash, setSlash] = React.useState<SlashState | null>(null)
  const [active, setActive] = React.useState(0)
  const [position, setPosition] = React.useState({ top: 40, left: 12 })
  // Escape closes the menu for this "/" until the caret leaves it.
  const dismissedAt = React.useRef<number | null>(null)
  const keyHandler = React.useRef<(event: KeyboardEvent) => boolean>(
    () => false,
  )
  const syncRef = React.useRef<(editor: Editor) => void>(() => {})

  const matches = React.useMemo(
    () =>
      slash && slashItems ? filterSlashItems(slashItems, slash.query) : [],
    [slash, slashItems],
  )
  const open = slash !== null && matches.length > 0
  // a new "/" or a new filter starts at the first block
  React.useEffect(() => setActive(0), [slash?.from, slash?.query])

  syncRef.current = (ed: Editor) => {
    if (!slashOn) return
    const { selection } = ed.state
    const $from = selection.$from
    const before =
      selection.empty && $from.parent.type.name !== "codeBlock"
        ? $from.parent.textBetween(0, $from.parentOffset, undefined, LEAF_TEXT)
        : ""
    const match = /(?:^|\s)\/([^\s/]*)$/.exec(before)
    if (!match) {
      dismissedAt.current = null
      setSlash(null)
      return
    }
    const from = $from.pos - match[1].length - 1
    if (dismissedAt.current === from) return setSlash(null)
    setSlash((prev) => (prev?.from === from && prev.query === match[1] ? prev : { from, query: match[1] }))
  }

  const editor = useEditor({
    immediatelyRender: false,
    // TipTap 3 no longer re-renders on every transaction by default; the
    // toolbar reads isActive() at render, so without this it goes stale.
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder }),
      ...(slashOn ? [TaskList, TaskItem] : []),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
      syncRef.current(editor)
    },
    onSelectionUpdate: ({ editor }) => syncRef.current(editor),
    onBlur: () => setSlash(null),
    editorProps: {
      handleKeyDown: (_view, event) => keyHandler.current(event),
      attributes: {
        // The editing area is a multi-line text box: without a role and a name a screen reader announces only "edit".
        role: "textbox",
        "aria-multiline": "true",
        ...(id ? { id } : {}),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        ...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {}),
        ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
        class: slashOn ? `${EDITOR_CLASS} ${BLOCK_CLASS}` : EDITOR_CLASS,
      },
    },
  })

  const pick = React.useCallback(
    (item: SlashItem) => {
      if (!editor || !slash) return
      editor
        .chain()
        .focus()
        .deleteRange({ from: slash.from, to: editor.state.selection.from })
        .run()
      setSlash(null)
      item.run(editor)
    },
    [editor, slash],
  )

  keyHandler.current = (event) => {
    if (!open) return false
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const step = event.key === "ArrowDown" ? 1 : -1
      setActive((i) => (i + step + matches.length) % matches.length)
      return true
    }
    if (event.key === "Enter" || event.key === "Tab") {
      const item = matches[Math.min(active, matches.length - 1)]
      if (item) pick(item)
      return true
    }
    if (event.key === "Escape") {
      dismissedAt.current = slash?.from ?? null
      setSlash(null)
      return true
    }
    return false
  }

  // The menu sits under the "/" (falls back to the top-left corner where layout is not measured).
  React.useLayoutEffect(() => {
    if (!open || !editor || !frameRef.current) return
    try {
      const caret = editor.view.coordsAtPos(slash.from)
      const frame = frameRef.current.getBoundingClientRect()
      const left = Math.max(
        0,
        Math.min(caret.left - frame.left, frame.width - 240),
      )
      setPosition({
        top: Math.round(caret.bottom - frame.top + 4),
        left: Math.round(left),
      })
    } catch {
      setPosition({ top: 40, left: 12 })
    }
  }, [open, editor, slash?.from])

  // Combobox pattern on the editing area: it keeps the focus and points at the active option.
  const activeId = open
    ? `${menuId}-${matches[Math.min(active, matches.length - 1)]?.id}`
    : null
  React.useEffect(() => {
    const dom = editor?.view.dom
    if (!dom || !slashOn) return
    if (activeId) {
      dom.setAttribute("aria-controls", menuId)
      dom.setAttribute("aria-activedescendant", activeId)
    } else {
      dom.removeAttribute("aria-controls")
      dom.removeAttribute("aria-activedescendant")
    }
  }, [editor, activeId, menuId, slashOn])

  if (!editor)
    return (
      <RichTextEditorSkeleton placeholder={placeholder} className={className} />
    )

  return (
    <div
      ref={frameRef}
      className={cn(
        slashOn && "relative",
        "flex flex-col rounded-md border border-input bg-card has-[[contenteditable]:focus-visible]:focus-ring-on",
        className,
      )}
    >
      <RichTextEditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      {open && (
        <SlashMenuList
          id={menuId}
          items={matches}
          active={Math.min(active, matches.length - 1)}
          position={position}
          onPick={pick}
          onHover={setActive}
        />
      )}
      {slashOn && (
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {open
            ? `${matches.length} ${matches.length === 1 ? "block" : "blocks"}`
            : ""}
        </div>
      )}
    </div>
  )
}

export default RichTextEditorInner
