"use client"

import * as React from "react"
import { ChevronRight, File, Folder } from "lucide-react"
import { cn } from "@/lib/utils"

type FileTreeNode = {
  id: string
  name: string
  children?: FileTreeNode[]
}

function FileTreeItem({ node, depth = 0 }: { node: FileTreeNode; depth?: number }) {
  const isFolder = !!node.children
  const [open, setOpen] = React.useState(depth === 0)

  return (
    <div>
      <button
        type="button"
        aria-expanded={isFolder ? open : undefined}
        onClick={() => isFolder && setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-md py-1.5 text-left text-sm text-foreground hover:bg-muted"
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
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && (
        // Opening and closing slide the rows in and out (grid rows 0fr <-> 1fr)
        // instead of popping them: open on the entrance curve, close one step
        // faster on the exit curve. Closed rows are inert, so focus skips them.
        <div
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

function FileTree({
  data,
  className,
}: {
  data: FileTreeNode[]
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-2", className)}>
      {data.map((node) => (
        <FileTreeItem key={node.id} node={node} />
      ))}
    </div>
  )
}

export { FileTree }
export type { FileTreeNode }
