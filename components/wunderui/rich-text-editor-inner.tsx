"use client"

import * as React from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { RichTextEditorSkeleton, type RichTextEditorProps } from "./rich-text-editor"

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
        "flex size-7 items-center justify-center rounded-md text-text-secondary outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
        active && "bg-muted text-foreground"
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
        <Bold />
      </RichTextEditorToolbarButton>
      <RichTextEditorToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </RichTextEditorToolbarButton>
      <RichTextEditorToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </RichTextEditorToolbarButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <RichTextEditorToolbarButton
        label="Bulleted list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </RichTextEditorToolbarButton>
      <RichTextEditorToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </RichTextEditorToolbarButton>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <RichTextEditorToolbarButton
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const url = window.prompt("URL")
          if (url) editor.chain().focus().setLink({ href: url }).run()
          else editor.chain().focus().unsetLink().run()
        }}
      >
        <LinkIcon />
      </RichTextEditorToolbarButton>
    </div>
  )
}

// Loaded lazily by rich-text-editor.tsx so @tiptap/* stays an optional peer:
// this file is the only one that imports it, and tsup splits it into its own chunk.
function RichTextEditorInner({
  content,
  onChange,
  placeholder = "Write something...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-32 p-3 text-sm text-foreground outline-none [&_a]:text-text-link [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p.is-editor-empty:first-child::before]:text-text-tertiary [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:h-0",
      },
    },
  })

  if (!editor) return <RichTextEditorSkeleton placeholder={placeholder} className={className} />

  return (
    <div className={cn("flex flex-col rounded-lg border border-input has-[[contenteditable]:focus]:border-ring", className)}>
      <RichTextEditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditorInner
