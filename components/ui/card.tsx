import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon } from "@/components/ui/icon-provider"

const CARD_VARIANT = {
  // Figma Card · Style=default: border + Shadow/Small
  default: "ring-1 ring-border shadow-xs",
  // Figma Card · Style=elevated: Shadow/Medium, no border
  elevated: "shadow-md",
  // Figma Card · Style=outlined: border only
  outlined: "ring-1 ring-border",
} as const

type CardVariant = keyof typeof CARD_VARIANT
type CardOrientation = "vertical" | "horizontal"
type CardFooterLayout = "end" | "between" | "stretch" | "stacked"
type CardMediaRatio = "16:9" | "4:3" | "1:1" | "3:1"
type CardFeedbackKind = "loading" | "empty" | "error" | "denied"

/**
 * One inset for the library's cards (owner, Oct 30 2026): the default size has
 * 16 px on all four sides and 16 px between header, content and footer —
 * CARD_INSET_PX / CARD_GAP_PX in lib/card-inset.ts, the same as ChartCard,
 * StatCard and MetricCard. The small size keeps 12 px.
 *
 * Error state: set `data-invalid` on the card for the red ring plus the tint/red surface.
 *
 * The card also supports horizontal orientation, interactive (single-target) cards and
 * selected cards; see the props below.
 *
 * A card that holds other controls uses `interactive tabIndex={-1}` plus a `CardTrigger`
 * as its only focus stop, with the other controls raised via `relative z-10`.
 */
const ARROW_KEYS = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"]

function Card({
  className,
  size = "default",
  variant = "default",
  orientation = "vertical",
  interactive = false,
  selected = false,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  variant?: CardVariant
  orientation?: CardOrientation
  interactive?: boolean
  selected?: boolean
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)

    if (!interactive) {
      return
    }

    // A card with role="radio" inside a role="radiogroup" is a radio of its own: the arrow keys, Home and End move
    // the focus to the previous or next card of the group, wrap around, and choose it (its click runs).
    if (props.role === "radio" && event.target === event.currentTarget && ARROW_KEYS.includes(event.key)) {
      const group = event.currentTarget.closest('[role="radiogroup"]')
      const radios = group
        ? Array.from(group.querySelectorAll<HTMLElement>('[data-slot="card"][role="radio"]:not([aria-disabled="true"])'))
        : []
      const index = radios.indexOf(event.currentTarget)
      if (index >= 0 && radios.length > 1) {
        event.preventDefault()
        const forward = event.key === "ArrowDown" || event.key === "ArrowRight"
        const next =
          event.key === "Home" ? 0 : event.key === "End" ? radios.length - 1 : (index + (forward ? 1 : -1) + radios.length) % radios.length
        radios[next].focus()
        radios[next].click()
        return
      }
    }

    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target === event.currentTarget &&
      props.onClick
    ) {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      data-orientation={orientation}
      data-interactive={interactive ? "" : undefined}
      data-selected={selected ? "true" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "group/card flex flex-col gap-(--card-gap) [--surface:var(--card)] overflow-hidden rounded-xl bg-card data-invalid:bg-tint-red data-invalid:[--surface:var(--tint-red)] data-invalid:ring-1 data-invalid:ring-destructive/60 py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(4)] [--card-gap:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 has-[>[data-slot=card-media]:first-child]:pt-0 has-data-[slot=card-indicator]:relative has-data-[slot=card-trigger]:relative has-[>[data-slot=card-banner]:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:[--card-gap:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-stretch data-[orientation=horizontal]:gap-0 data-[orientation=horizontal]:py-0",
        interactive &&
          "cursor-pointer transition-[background-color,box-shadow] duration-fast ease-move motion-reduce:transition-none hover:bg-bg-page active:bg-subtle hover:[--surface:var(--bg-page)] active:[--surface:var(--subtle)] focus-ring focus-visible:[--tw-ring-color:var(--primary)] has-[[data-stretch]:focus-visible]:focus-ring-on has-[[data-stretch]:focus-visible]:[--tw-ring-color:var(--primary)]",
        selected &&
          "data-selected:bg-tint-indigo data-selected:ring-tint-text-indigo data-selected:[--surface:var(--tint-indigo)] data-selected:hover:bg-tint-indigo data-selected:active:bg-tint-indigo data-selected:hover:[--surface:var(--tint-indigo)] data-selected:active:[--surface:var(--tint-indigo)] data-selected:[&_[data-slot=card-title]]:text-tint-text-indigo data-selected:[&_[data-slot=card-description]]:text-tint-text-indigo data-selected:text-tint-text-indigo",
        CARD_VARIANT[variant],
        className
      )}
      {...props}
    />
  )
}

/**
 * The media area at the top of a card (Figma "Card · Content=image"): 160 px,
 * flush with the card's edges. Put an <img> inside to fill it; without one it
 * shows the image placeholder from the set.
 */
function CardMedia({
  className,
  children,
  ratio,
  missing = false,
  ...props
}: React.ComponentProps<"div"> & { ratio?: CardMediaRatio; missing?: boolean }) {
  return (
    <div
      data-slot="card-media"
      data-ratio={ratio}
      data-missing={missing ? "" : undefined}
      role={missing ? "img" : undefined}
      aria-label={missing ? "No preview available" : undefined}
      className={cn(
        "flex h-40 w-full shrink-0 items-center justify-center overflow-hidden bg-muted text-text-tertiary *:[img]:size-full *:[img]:object-cover",
        ratio && "h-auto",
        ratio === "16:9" && "aspect-video",
        ratio === "4:3" && "aspect-[4/3]",
        ratio === "1:1" && "aspect-square",
        ratio === "3:1" && "aspect-[3/1]",
        missing && "bg-bg-page",
        "group-data-[orientation=horizontal]/card:h-auto group-data-[orientation=horizontal]/card:w-40 group-data-[orientation=horizontal]/card:self-stretch group-data-[orientation=horizontal]/card:aspect-auto",
        className
      )}
      {...props}
    >
      {missing ? (
        <div className="flex flex-col items-center gap-1" aria-hidden>
          <Icon name="imageMissing" className="size-5 text-text-tertiary" />
          <span className="text-xs text-text-tertiary">No preview available</span>
        </div>
      ) : (
        children ?? (
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
          </svg>
        )
      )}
    </div>
  )
}

function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-body"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-(--card-gap) py-(--card-spacing) has-data-[slot=card-footer]:pb-0",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  leading,
  ...props
}: React.ComponentProps<"div"> & { leading?: React.ReactNode }) {
  if (leading) {
    return (
      <div
        data-slot="card-header"
        className={cn(
          "group/card-header @container/card-header flex items-start gap-3 rounded-t-xl px-(--card-spacing) [.border-b]:pb-(--card-spacing)",
          className
        )}
        {...props}
      >
        <div data-slot="card-leading" className="shrink-0">
          {leading}
        </div>
        <div className="grid min-w-0 flex-1 auto-rows-min items-start gap-1 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]">
          {props.children}
        </div>
      </div>
    )
  }

  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-icon"
      aria-hidden
      className={cn(
        "flex size-8 items-center justify-center rounded-lg bg-tint-indigo text-tint-text-indigo [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-semibold text-foreground group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  layout = "end",
  divider = true,
  ...props
}: React.ComponentProps<"div"> & { layout?: CardFooterLayout; divider?: boolean }) {
  return (
    <div
      data-slot="card-footer"
      data-layout={layout}
      className={cn(
        "flex items-center justify-end gap-2 rounded-b-xl border-t border-border px-(--card-spacing) py-(--card-spacing)",
        layout === "between" && "justify-between",
        layout === "stretch" && "*:flex-1",
        layout === "stacked" && "flex-col items-stretch *:w-full",
        !divider && "border-t-0",
        className
      )}
      {...props}
    />
  )
}

function CardMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-meta"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 px-(--card-spacing) text-xs text-text-secondary [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function CardIndicator({
  type = "radio",
  checked = false,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  type?: "radio" | "checkbox"
  checked?: boolean
}) {
  return (
    <span
      data-slot="card-indicator"
      data-type={type}
      data-checked={checked ? "" : undefined}
      aria-hidden
      className={cn(
        "absolute top-(--card-spacing) right-(--card-spacing) z-10 flex size-4 items-center justify-center border pointer-events-none transition-[background-color,border-color] duration-fast ease-move motion-reduce:transition-none",
        type === "radio" ? "rounded-full" : "rounded-sm",
        checked
          ? "border-tint-text-indigo bg-tint-text-indigo"
          : "border-border-control bg-card",
        className
      )}
      {...props}
    >
      {type === "radio"
        ? checked && <span className="size-1.5 rounded-full bg-tint-indigo" />
        : checked && <Icon name="check" className="size-3 text-tint-indigo" strokeWidth={3} />}
    </span>
  )
}

function CardFeedback({
  kind,
  title,
  description,
  action,
  loadingLabel,
  media = false,
  className,
}: {
  kind: CardFeedbackKind
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  loadingLabel?: string
  media?: boolean
  className?: string
}) {
  if (kind === "loading") {
    return (
      <div
        data-slot="card-feedback"
        data-kind={kind}
        role="status"
        aria-busy="true"
        aria-label={loadingLabel ?? "Loading"}
        className={cn("flex flex-col gap-2 px-(--card-spacing)", className)}
      >
        {media && (
          <Skeleton className="-mt-(--card-spacing) h-40 w-[calc(100%+2*var(--card-spacing))] -mx-(--card-spacing) rounded-none" />
        )}
        <Skeleton className="h-3 w-2/5 rounded-sm" />
        <Skeleton className="h-2.5 w-full rounded-sm" />
        <Skeleton className="h-2.5 w-3/5 rounded-sm" />
        <span className="sr-only">{loadingLabel ?? "Loading"}</span>
      </div>
    )
  }

  return (
    <div
      data-slot="card-feedback"
      data-kind={kind}
      role={kind === "error" ? "alert" : undefined}
      className={cn("flex flex-col items-center gap-2 px-(--card-spacing) text-center", className)}
    >
      {kind === "empty" && (
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-text-secondary" aria-hidden>
          <Icon name="inbox" className="size-5" />
        </div>
      )}
      {kind === "denied" && (
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-text-secondary" aria-hidden>
          <Icon name="lock" className="size-5" />
        </div>
      )}
      {kind === "error" && (
        <div className="flex size-10 items-center justify-center rounded-full bg-tint-red text-tint-text-red" aria-hidden>
          <Icon name="warning" className="size-5" />
        </div>
      )}
      {title && <p className="text-base font-semibold text-foreground">{title}</p>}
      {description && <p className="text-sm text-text-secondary">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}

function CardBanner({
  kind,
  children,
  action,
  className,
}: {
  kind: "refreshing" | "error"
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="card-banner"
      data-kind={kind}
      role={kind === "refreshing" ? "status" : "alert"}
      className={cn(
        "flex items-center gap-2 px-(--card-spacing) py-2 text-xs",
        kind === "refreshing" ? "bg-bg-page text-text-secondary" : "bg-tint-red text-tint-text-red",
        className
      )}
    >
      {kind === "refreshing" ? (
        <Icon name="refresh" className="size-3.5 shrink-0 motion-safe:animate-spin" aria-hidden />
      ) : (
        <Icon name="warning" className="size-3.5 shrink-0" aria-hidden />
      )}
      <span className="min-w-0 flex-1">{children}</span>
      {action && <span className="shrink-0">{action}</span>}
    </div>
  )
}

function CardDragHandle({
  dragging = false,
  className,
  ...props
}: React.ComponentProps<"button"> & { dragging?: boolean }) {
  return (
    <button
      type="button"
      data-slot="card-drag-handle"
      data-dragging={dragging ? "" : undefined}
      aria-label="Drag to reorder"
      className={cn(
        "inline-flex size-6 shrink-0 cursor-grab items-center justify-center rounded-md text-text-tertiary transition-[background-color,color] duration-fast ease-move motion-reduce:transition-none hover:bg-bg-page hover:text-foreground focus-ring data-dragging:cursor-grabbing data-dragging:bg-subtle data-dragging:text-foreground",
        className
      )}
      {...props}
    >
      <Icon name="grip" className="size-4" aria-hidden />
    </button>
  )
}

function CardTrigger({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="card-trigger"
      data-stretch
      className={cn(
        "absolute inset-0 z-0 cursor-pointer rounded-[inherit] bg-transparent outline-none",
        className
      )}
      {...props}
    />
  )
}

export type {
  CardVariant,
  CardOrientation,
  CardFooterLayout,
  CardMediaRatio,
  CardFeedbackKind,
}
export {
  Card,
  CardMedia,
  CardBody,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardMeta,
  CardIcon,
  CardIndicator,
  CardFeedback,
  CardBanner,
  CardDragHandle,
  CardTrigger,
}
