"use client"

import type { ReactNode } from "react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { IconButton } from "@/components/ui/icon-button"

type ItemCardTint = "indigo" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow" | "green" | "alternative"

const ITEM_CARD_TINT: Record<ItemCardTint, string> = {
  indigo: "bg-tint-indigo text-tint-text-indigo",
  blue: "bg-tint-blue text-tint-text-blue",
  purple: "bg-tint-purple text-tint-text-purple",
  pink: "bg-tint-pink text-tint-text-pink",
  red: "bg-tint-red text-tint-text-red",
  orange: "bg-tint-orange text-tint-text-orange",
  yellow: "bg-tint-yellow text-tint-text-yellow",
  green: "bg-tint-green text-tint-text-green",
  alternative: "bg-tint-alternative text-tint-text-alternative",
}

function ItemCard({
  icon,
  title,
  description,
  meta,
  action,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-card p-3",
        className
      )}
    >
      {icon && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-tint-indigo text-tint-text-indigo [&_svg]:size-5">
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="truncate text-[13px] text-text-secondary">{description}</p>
        )}
      </div>
      {meta && <div className="shrink-0 text-xs text-text-tertiary">{meta}</div>}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

function ItemCardGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-border bg-card p-2", className)}>
      {children}
    </div>
  )
}


/* ------------------------------------------------------------------ */
/* ItemCardCover — a clickable tile with a tinted cover, name and meta  */
/* Figma: Project Card (693:146)                                       */
/* ------------------------------------------------------------------ */

type ItemCardCoverProps = {
  name: ReactNode
  /** One short line under the name. */
  meta?: ReactNode
  /** Tint of the cover band. */
  color?: ItemCardTint
  /** Icon, logo or image in the middle of the cover. */
  cover?: ReactNode
  onClick?: () => void
  className?: string
}

function ItemCardCover({ name, meta, color = "indigo", cover, onClick, className }: ItemCardCoverProps) {
  return (
    <button
      type="button"
      data-slot="item-card-cover"
      onClick={onClick}
      className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-card text-start transition-colors duration-fast ease-entrance hover:bg-bg-page active:bg-bg-subtle outline-none focus-ring", className)}
    >
      <span className={cn("flex h-24 w-full items-center justify-center", ITEM_CARD_TINT[color])}>{cover}</span>
      <span className="flex flex-col p-3">
        <span className="truncate text-xs font-semibold text-foreground">{name}</span>
        {meta && <span className="truncate text-[11px] text-text-tertiary">{meta}</span>}
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* ItemCardFile — a file tile: preview, name, details, selection, menu  */
/* Figma: File Card (702:57)                                           */
/* ------------------------------------------------------------------ */

type ItemCardFileProps = {
  name: ReactNode
  meta?: ReactNode
  icon?: ReactNode
  color?: ItemCardTint
  /** Image preview instead of the icon tile. */
  thumbnail?: string
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  /** Type=trash — deletion line shown in red, no menu/checkbox. */
  deletedAt?: ReactNode
  onMenu?: () => void
  onOpen?: () => void
  className?: string
}

function ItemCardFile({ name, meta, icon, color = "red", thumbnail, selected, onSelectedChange, deletedAt, onMenu, onOpen, className }: ItemCardFileProps) {
  return (
    <div
      data-slot="item-card-file"
      data-selected={selected || undefined}
      className={cn(
        "group/file flex flex-col overflow-hidden rounded-xl border bg-card transition-colors duration-fast ease-entrance",
        selected ? "border-primary" : "border-border",
        className
      )}
    >
      {/* onOpen: a real button covers the preview; the checkbox sits above it
          as a sibling, so no interactive element is nested in another. */}
      <div
        className={cn(
          "relative flex h-[120px] items-center justify-center [&>svg]:size-9",
          ITEM_CARD_TINT[color],
          onOpen && "has-[[data-open]:focus-visible]:focus-ring-on"
        )}
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="size-full object-cover" />
        ) : (
          (icon ?? <Icon name="document" strokeWidth={1.5} />)
        )}
        {onOpen && (
          <button type="button" data-open onClick={onOpen} className="absolute inset-0 cursor-pointer outline-none">
            <span className="sr-only">Open {name}</span>
          </button>
        )}
        {onSelectedChange && (
          <Checkbox
            aria-label="Select file"
            checked={!!selected}
            onCheckedChange={(v) => onSelectedChange(!!v)}
            className={cn("absolute top-2 start-2 size-6 bg-card transition-opacity duration-fast ease-entrance", !selected && "opacity-0 group-hover/file:opacity-100 focus-visible:opacity-100")}
          />
        )}
      </div>
      <div className="flex items-start gap-2 p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-xs font-medium text-foreground">{name}</p>
          {meta && <p className="truncate text-[11px] text-text-tertiary">{meta}</p>}
          {deletedAt && <p className="text-[11px] text-text-error">{deletedAt}</p>}
        </div>
        {onMenu && !deletedAt && (
          <IconButton variant="ghost" size="sm" aria-label="File menu" onClick={onMenu} className="-mt-1 -me-1">
            <Icon name="moreVertical" className="size-4" strokeWidth={1.5} />
          </IconButton>
        )}
      </div>
    </div>
  )
}

export { ItemCard, ItemCardGroup, ItemCardCover, ItemCardFile, ITEM_CARD_TINT }
export type { ItemCardTint, ItemCardCoverProps, ItemCardFileProps }
