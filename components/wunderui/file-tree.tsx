"use client"

import * as React from "react"
import { ChevronRight, File, Folder } from "lucide-react"
import { cn } from "@/lib/utils"

type FileTreeNode = {
  id: string
  name: string
  children?: FileTreeNode[]
}

/** A row the keyboard can reach: every node whose ancestors are all open. */
type VisibleRow = { node: FileTreeNode; parentId?: string }

function visibleRows(nodes: FileTreeNode[], open: Set<string>, parentId?: string, out: VisibleRow[] = []) {
  for (const node of nodes) {
    out.push({ node, parentId })
    if (node.children && open.has(node.id)) visibleRows(node.children, open, node.id, out)
  }
  return out
}

function parentMap(nodes: FileTreeNode[], parentId?: string, out = new Map<string, string | undefined>()) {
  for (const node of nodes) {
    out.set(node.id, parentId)
    if (node.children) parentMap(node.children, node.id, out)
  }
  return out
}

type TreeContext = {
  open: Set<string>
  selectedId?: string
  tabStopId?: string
  activate: (node: FileTreeNode) => void
  register: (id: string, el: HTMLElement | null) => void
}

const FileTreeContext = React.createContext<TreeContext | null>(null)

function FileTreeItem({ node, depth = 0 }: { node: FileTreeNode; depth?: number }) {
  const ctx = React.useContext(FileTreeContext)!
  const isFolder = !!node.children
  const open = isFolder && ctx.open.has(node.id)
  const labelId = React.useId()

  return (
    <div
      ref={(el) => ctx.register(node.id, el)}
      role="treeitem"
      data-tree-id={node.id}
      aria-level={depth + 1}
      aria-expanded={isFolder ? open : undefined}
      aria-selected={ctx.selectedId === node.id}
      aria-labelledby={labelId}
      tabIndex={ctx.tabStopId === node.id ? 0 : -1}
      className="outline-none"
    >
      <div
        onClick={() => ctx.activate(node)}
        // pr-2 equals the 8 px the indent starts with, so the hover fill has the same room left and right of the content.
        // The focus ring sits on the row only (not on the whole subtree of the focused treeitem).
        className={cn(
          "flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-sm text-foreground hover:bg-muted/50",
          "[:focus-visible>&]:outline-1 [:focus-visible>&]:-outline-offset-1 [:focus-visible>&]:outline-ring [:focus-visible>&]:outline-solid",
          ctx.selectedId === node.id && "bg-muted"
        )}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        {isFolder ? (
          <ChevronRight
            className={cn("size-3.5 shrink-0 text-text-tertiary transition-transform duration-fast ease-entrance", open && "rotate-90")}
          />
        ) : (
          <span className="inline-block size-3.5 shrink-0" />
        )}
        {isFolder ? (
          <Folder className="size-4 shrink-0 text-text-tertiary" />
        ) : (
          <File className="size-4 shrink-0 text-text-tertiary" />
        )}
        <span id={labelId} className="truncate">{node.name}</span>
      </div>
      {isFolder && (
        // Opening and closing slide the rows in and out (grid rows 0fr <-> 1fr)
        // instead of popping them: open on the entrance curve, close one step
        // faster on the exit curve. Closed rows are inert, and the keyboard only
        // walks visible rows, so focus never lands on them.
        <div
          role="group"
          inert={!open}
          className={cn(
            "grid transition-[grid-template-rows,opacity] motion-reduce:transition-none",
            open ? "grid-rows-[1fr] opacity-100 duration-base ease-entrance" : "grid-rows-[0fr] opacity-0 duration-fast ease-exit"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            {node.children!.map((child) => (
              <FileTreeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type FileTreeProps = {
  data: FileTreeNode[]
  /** Accessible name of the tree. */
  "aria-label"?: string
  /** Called when a file or folder is activated (click, Enter or Space). */
  onSelect?: (node: FileTreeNode) => void
  /** The selected node (controlled). Without it the tree keeps its own selection. */
  selectedId?: string
  className?: string
}

/**
 * FileTree — WAI-ARIA tree: one tab stop, arrow keys move through the visible rows,
 * Right/Left open and close folders, Home/End, Enter/Space activate, letters jump.
 * Top-level folders start open.
 */
function FileTree({ data, "aria-label": ariaLabel = "Files", onSelect, selectedId, className }: FileTreeProps) {
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(data.filter((n) => n.children).map((n) => n.id)))
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<string | undefined>(undefined)
  const [focusedId, setFocusedId] = React.useState<string | undefined>(undefined)
  const items = React.useRef(new Map<string, HTMLElement>())
  const selected = selectedId !== undefined ? selectedId : uncontrolledSelected

  const rows = visibleRows(data, open)
  const parents = parentMap(data)
  const isVisible = (id?: string) => !!id && rows.some((r) => r.node.id === id)

  // Roving tab stop: the focused row; if a collapse hid it, its nearest visible ancestor;
  // else the selected row; else the first row. Never a row inside a closed (inert) folder.
  let tabStopId: string | undefined = focusedId
  while (tabStopId && !isVisible(tabStopId)) tabStopId = parents.get(tabStopId)
  if (!tabStopId) tabStopId = isVisible(selected) ? selected : rows[0]?.node.id

  function setFolder(id: string, next: boolean) {
    setOpen((prev) => {
      const copy = new Set(prev)
      if (next) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  function activate(node: FileTreeNode) {
    if (node.children) setFolder(node.id, !open.has(node.id))
    if (selectedId === undefined) setUncontrolledSelected(node.id)
    setFocusedId(node.id)
    onSelect?.(node)
  }

  function focusRow(id?: string) {
    if (!id) return
    setFocusedId(id)
    items.current.get(id)?.focus()
  }

  function register(id: string, el: HTMLElement | null) {
    if (el) items.current.set(id, el)
    else items.current.delete(id)
  }

  function handleFocus(event: React.FocusEvent) {
    const id = (event.target as HTMLElement).dataset?.treeId
    if (id) setFocusedId(id)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const id = (event.target as HTMLElement).dataset?.treeId
    const index = rows.findIndex((r) => r.node.id === id)
    if (index < 0) return
    const { node, parentId } = rows[index]
    const isOpen = !!node.children && open.has(node.id)
    switch (event.key) {
      case "ArrowDown":
        focusRow(rows[index + 1]?.node.id)
        break
      case "ArrowUp":
        focusRow(rows[index - 1]?.node.id)
        break
      case "ArrowRight":
        if (node.children && !isOpen) setFolder(node.id, true)
        else if (isOpen) focusRow(node.children![0]?.id)
        break
      case "ArrowLeft":
        if (isOpen) setFolder(node.id, false)
        else focusRow(parentId)
        break
      case "Home":
        focusRow(rows[0]?.node.id)
        break
      case "End":
        focusRow(rows[rows.length - 1]?.node.id)
        break
      case "Enter":
      case " ":
        activate(node)
        break
      default: {
        // Type-ahead: a printable character jumps to the next visible row whose name starts with it.
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
        const char = event.key.toLowerCase()
        for (let step = 1; step <= rows.length; step++) {
          const candidate = rows[(index + step) % rows.length].node
          if (candidate.name.toLowerCase().startsWith(char)) {
            focusRow(candidate.id)
            break
          }
        }
      }
    }
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <FileTreeContext.Provider value={{ open, selectedId: selected, tabStopId, activate, register }}>
      <div
        role="tree"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={cn("rounded-lg border border-border bg-card p-2", className)}
      >
        {data.map((node) => (
          <FileTreeItem key={node.id} node={node} />
        ))}
      </div>
    </FileTreeContext.Provider>
  )
}

export { FileTree }
export type { FileTreeNode, FileTreeProps }
