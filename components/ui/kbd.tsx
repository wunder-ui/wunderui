import * as React from "react"
import { ArrowBigUp, ArrowDown, ArrowLeft, ArrowRight, ArrowRightToLine, ArrowUp, ChevronUp, CommandIcon, CornerDownLeft, Delete, Option, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type KbdTone = "default" | "inverse"

/**
 * Symbol keys (⌘ ⇧ ⌥ ⌃ arrows, enter, backspace, tab) are missing from the mono and Inter fonts, so the browser takes them from a
 * symbol font whose glyphs sit above or below the baseline: crooked in the cap at 100 % zoom. Kbd draws them as Lucide icons, which
 * are centred by construction (the glyph stays for screen readers and text matching).
 */
const KEY_ICONS: Record<string, LucideIcon> = {
  "⌘": CommandIcon,
  "⇧": ArrowBigUp,
  "⌥": Option,
  "⌃": ChevronUp,
  "↑": ArrowUp,
  "↓": ArrowDown,
  "←": ArrowLeft,
  "→": ArrowRight,
  "↵": CornerDownLeft,
  "⏎": CornerDownLeft,
  "⌫": Delete,
  "⇥": ArrowRightToLine,
}
const KEY_PATTERN = new RegExp(`([${Object.keys(KEY_ICONS).join("")}])`)

function SymbolKey({ glyph }: { glyph: string }) {
  const Glyph = KEY_ICONS[glyph]
  return (
    <span data-slot="kbd-symbol" className="inline-flex items-center justify-center">
      <Glyph aria-hidden strokeWidth={2.25} className="size-[1.1em] shrink-0" />
      <span className="sr-only">{glyph}</span>
    </span>
  )
}

function withSymbolIcons(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string" && KEY_PATTERN.test(node)) {
    return node.split(KEY_PATTERN).filter(Boolean).map((part, i) => (part in KEY_ICONS ? <SymbolKey key={i} glyph={part} /> : part))
  }
  if (React.isValidElement<{ children?: React.ReactNode; className?: string }>(node) && node.type === "span" && node.props.children !== undefined) {
    return React.cloneElement(node, { className: cn("inline-flex items-center", node.props.className) }, React.Children.map(node.props.children, withSymbolIcons))
  }
  return node
}

/**
 * A key cap. In a pill field (`rounded-full`) the cap is a pill too (concentric shapes). It is bordered (border-border,
 * muted fill, 11 px text); on a muted or subtle field (its direct parent has `bg-muted`, `bg-subtle` or
 * `bg-bg-subtle`, or an ancestor sets `data-kbd-surface="muted"`, as the library search triggers do) the cap takes the
 * card fill and the control border so the edge stays visible.
 */
function Kbd({ className, tone = "default", children, ...props }: React.ComponentProps<"kbd"> & { tone?: KbdTone }) {
  return (
    <kbd
      data-slot="kbd"
      data-tone={tone}
      className={cn(
        tone === "default"
          ? "inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-sm border border-border bg-muted px-1.5 text-[11px] font-medium text-text-secondary in-[.rounded-full]:rounded-full in-[.rounded-full]:px-2 [.bg-muted>&]:border-border-control [.bg-muted>&]:bg-card [.bg-subtle>&]:border-border-control [.bg-subtle>&]:bg-card [.bg-bg-subtle>&]:border-border-control [.bg-bg-subtle>&]:bg-card in-data-[kbd-surface=muted]:border-border-control in-data-[kbd-surface=muted]:bg-card in-data-[slot=tooltip-content]:border-transparent in-data-[slot=tooltip-content]:bg-bg-tooltip-key in-data-[slot=tooltip-content]:text-neutral-white"
          : "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-sm bg-bg-tooltip-key px-[5px] text-xs font-semibold text-neutral-white",
        className
      )}
      {...props}
    >
      {React.Children.map(children, withSymbolIcons)}
    </kbd>
  )
}

function KbdGroup({ className, tone, separator, children, ...props }: React.ComponentProps<"div"> & { tone?: KbdTone; separator?: React.ReactNode }) {
  if (tone === undefined && separator === undefined) {
    return (
      <div
        data-slot="kbd-group"
        className={cn("inline-flex items-center gap-1", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  const arrayChildren = React.Children.toArray(children)

  return (
    <div
      data-slot="kbd-group"
      data-tone={tone}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {arrayChildren.map((child, index) => {
        const keyElement =
          React.isValidElement<{ tone?: KbdTone }>(child) &&
          child.type === Kbd &&
          child.props.tone === undefined
            ? React.cloneElement(child, { tone })
            : child

        const showSeparator =
          separator !== undefined &&
          separator !== null &&
          separator !== false &&
          index < arrayChildren.length - 1

        return (
          <React.Fragment key={React.isValidElement(child) ? child.key : `child-${index}`}>
            {keyElement}
            {showSeparator && (
              <span
                data-slot="kbd-separator"
                className={cn(
                  tone === "inverse" ? "text-xs font-semibold text-neutral-white" : "text-xs text-text-tertiary"
                )}
              >
                {separator}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/**
 * A shortcut legend: one or more key caps and a short label, such as ⌘ K "to open", for the foot of a command menu
 * or a search field. The caps are 22 px tall with the muted fill and 11 px text of a dense legend; the label is
 * tertiary text.
 */
function KbdHint({ keys, label, className }: { keys: string[]; label: string; className?: string }) {
  return (
    <span data-slot="kbd-hint" className={cn("inline-flex items-center gap-1 text-[11px] text-text-tertiary", className)}>
      {keys.map((k, i) => (
        <Kbd key={i} className="h-[22px] min-w-[22px] rounded-sm border border-border bg-muted px-1.5 text-[11px] text-text-secondary">
          {k}
        </Kbd>
      ))}
      <span className="ms-1">{label}</span>
    </span>
  )
}

export { Kbd, KbdGroup, KbdHint }
