"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"
import { opticalCenter } from "@/lib/optical-center"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

/** Tinted initials — mirrors the Figma Avatar "Style=<hue>_primary" variants
 *  (tint/<hue> background + tint-text/<hue> text, both mode-aware tokens). */
type AvatarColor =
  | "indigo"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "alternative"
  | "grey"

type AvatarBadgeStatus = "available" | "busy" | "away" | "dnd" | "offline" | "unknown"

const AVATAR_COLOR_CLASSES: Record<AvatarColor, string> = {
  indigo: "bg-tint-indigo text-tint-text-indigo",
  blue: "bg-tint-blue text-tint-text-blue",
  purple: "bg-tint-purple text-tint-text-purple",
  pink: "bg-tint-pink text-tint-text-pink",
  red: "bg-tint-red text-tint-text-red",
  orange: "bg-tint-orange text-tint-text-orange",
  yellow: "bg-tint-yellow text-tint-text-yellow",
  green: "bg-tint-green text-tint-text-green",
  alternative: "bg-tint-alternative text-tint-text-alternative",
  grey: "bg-muted text-text-secondary",
}

// Owner rule (Oct 31 2026): the indicator sits top right with its centre on
// the corner of the shape. Circle of size s: centre at (0.854 s, 0.146 s).
// Rounded square of radius r: centre at (s - 0.293 r, 0.293 r). --badge-d is the dot size.
const BADGE_POSITION = "absolute top-[calc(14.645%-var(--badge-d)/2)] right-[calc(14.645%-var(--badge-d)/2)] z-10 inline-flex size-(--badge-d) items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-[1.5px] ring-(--surface) select-none [--badge-d:--spacing(2)] group-data-[shape=square]/avatar:top-[calc(var(--radius-md)*0.293-var(--badge-d)/2)] group-data-[shape=square]/avatar:right-[calc(var(--radius-md)*0.293-var(--badge-d)/2)]"

const STATUS_SHAPES: Record<AvatarBadgeStatus, React.ReactNode> = {
  available: <span aria-hidden className="size-full rounded-full bg-success" />,
  busy: (
    <span aria-hidden className="h-[20%] w-[60%] rounded-full bg-primary-foreground" />
  ),
  dnd: (
    <span aria-hidden className="h-[15%] w-[50%] rounded-full bg-error" />
  ),
  away: (
    <span aria-hidden className="flex size-[80%] items-center justify-center">
      <Icon name="moon" className="size-full fill-current" strokeWidth={0} />
    </span>
  ),
  offline: null,
  unknown: null,
}

const STATUS_LABELS: Record<AvatarBadgeStatus, string> = {
  available: "Available",
  busy: "Busy",
  away: "Away",
  dnd: "Do not disturb",
  offline: "Offline",
  unknown: "Status unknown",
}

function AvatarRoot({
  className,
  size = "default",
  shape = "circle",
  variant = "plain",
  color,
  interactive,
  selected,
  disabled,
  render,
  children,
  ...props
}: AvatarPrimitive.Root.Props & {
  /**
   * Figma Avatar sizes: 3xs = 20px (as tall as a one-line 20 px text row), sm = 24px (2xs), xs = 28px,
   * default = 36px (small), lg = 40px (medium), xl = 44px (large)
   */
  size?: "3xs" | "sm" | "xs" | "default" | "lg" | "xl"
  shape?: "circle" | "square"
  variant?: "plain" | "primary"
  /** Soft tint for initials avatars; ignored when an image renders. */
  color?: AvatarColor
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      data-variant={variant}
      data-color={color}
      data-interactive={interactive ? "" : undefined}
      data-selected={selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      {...(interactive && disabled ? { disabled: true } : {})}
      aria-pressed={interactive ? selected : undefined}
      render={interactive ? render ?? <button type="button" /> : render}
      className={cn(
        "group/avatar relative flex size-9 shrink-0 select-none after:absolute after:inset-0 after:border after:border-border-control after:mix-blend-darken dark:after:mix-blend-lighten",
        "data-[shape=circle]:rounded-full data-[shape=circle]:after:rounded-full",
        "data-[shape=square]:rounded-md data-[shape=square]:after:rounded-md",
        "data-[size=3xs]:size-5 data-[size=sm]:size-6 data-[size=xs]:size-7 data-[size=lg]:size-10 data-[size=xl]:size-11",
        // Figma keeps the glyph at 16 px and only shrinks it on the two small sizes.
        "[&_svg]:size-4 data-[size=3xs]:[&_svg]:size-3 data-[size=sm]:[&_svg]:size-3 data-[size=xs]:[&_svg]:size-3.5",
        "data-[variant=primary]:bg-primary data-[variant=primary]:text-primary-foreground data-[variant=primary]:after:border-transparent",
        color && AVATAR_COLOR_CLASSES[color],
        color && "after:border-transparent",
        interactive && "cursor-pointer focus-ring data-[interactive]:focus-visible:after:border-primary data-[interactive]:focus-visible:after:mix-blend-normal data-[interactive]:hover:ring-3 data-[interactive]:hover:ring-bg-page data-[interactive]:active:ring-3 data-[interactive]:active:ring-bg-subtle data-[interactive]:data-[disabled]:opacity-40 data-[interactive]:data-[disabled]:pointer-events-none data-[interactive]:data-[selected]:ring-3 data-[interactive]:data-[selected]:ring-bg-subtle",
        className
      )}
      {...props}
    >
      {children}
      {selected && (
        <span
          data-slot="avatar-check"
          aria-hidden
          className={cn(
            BADGE_POSITION,
            "[--badge-d:--spacing(4)]",
            "group-data-[size=3xs]/avatar:[--badge-d:--spacing(2.5)] group-data-[size=3xs]/avatar:[&>svg]:size-1.5",
            "group-data-[size=sm]/avatar:[--badge-d:--spacing(3)] group-data-[size=sm]/avatar:[&>svg]:size-2",
            "group-data-[size=xs]/avatar:[--badge-d:--spacing(3.5)] group-data-[size=xs]/avatar:[&>svg]:size-2.5",
            "group-data-[size=default]/avatar:[&>svg]:size-3",
            "group-data-[size=lg]/avatar:[&>svg]:size-3",
            "group-data-[size=xl]/avatar:[&>svg]:size-3"
          )}
        >
          <Icon name="check" className="size-3" strokeWidth={3} />
        </span>
      )}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full object-cover group-data-[shape=circle]/avatar:rounded-full group-data-[shape=square]/avatar:rounded-md",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  children,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        cn(
          "flex size-full items-center justify-center bg-muted text-foreground group-data-[shape=circle]/avatar:rounded-full group-data-[shape=square]/avatar:rounded-md",
          // Initials follow the Figma type ramp: 11 / 12 / 13 / 14 / 15 px,
          // semibold everywhere except the 28 px size, which is medium.
          "text-[13px] font-semibold",
          "group-data-[size=3xs]/avatar:text-[9px]",
          "group-data-[size=sm]/avatar:text-[11px]",
          "group-data-[size=xs]/avatar:text-[12px] group-data-[size=xs]/avatar:font-medium",
          "group-data-[size=lg]/avatar:text-[14px] group-data-[size=xl]/avatar:text-[15px]",
          "group-data-[variant=primary]/avatar:bg-transparent group-data-[variant=primary]/avatar:text-inherit",
          "group-data-[color]/avatar:bg-transparent group-data-[color]/avatar:text-inherit"
        ),
        className
      )}
      {...props}
    >
      {/* Initials sit on the cap-height centre of the circle, not on the line-box centre. */}
      {opticalCenter(children)}
    </AvatarPrimitive.Fallback>
  )
}

function AvatarBadge({
  className,
  status,
  ...props
}: React.ComponentProps<"span"> & {
  status?: AvatarBadgeStatus
}) {
  if (status) {
    const { children: _children, ...rest } = props
    return (
      <span
        data-slot="avatar-badge"
        data-status={status}
        role="img"
        aria-label={props["aria-label"] ?? STATUS_LABELS[status]}
        className={cn(
          BADGE_POSITION,
          "group-data-[size=3xs]/avatar:[--badge-d:--spacing(1.5)]",
          "group-data-[size=sm]/avatar:[--badge-d:--spacing(2)]",
          "group-data-[size=xs]/avatar:[--badge-d:--spacing(2)]",
          "group-data-[size=lg]/avatar:[--badge-d:--spacing(2.5)]",
          "group-data-[size=xl]/avatar:[--badge-d:--spacing(3)]",
          "data-[status]:bg-transparent",
          "data-[status=available]:bg-success",
          "data-[status=busy]:bg-error",
          "data-[status=dnd]:bg-(--surface) data-[status=dnd]:border-[1.5px] data-[status=dnd]:border-error",
          "data-[status=away]:bg-(--surface) data-[status=away]:text-brand-quaternary",
          "data-[status=offline]:bg-(--surface) data-[status=offline]:border-[1.5px] data-[status=offline]:border-text-tertiary",
          "data-[status=unknown]:bg-(--surface) data-[status=unknown]:border-[1.5px] data-[status=unknown]:border-dashed data-[status=unknown]:border-text-tertiary",
          className
        )}
        {...rest}
      >
        {STATUS_SHAPES[status]}
      </span>
    )
  }

  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        BADGE_POSITION,
        "group-data-[size=3xs]/avatar:[--badge-d:--spacing(1.5)] group-data-[size=3xs]/avatar:[&>svg]:hidden",
        "group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=xs]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:[--badge-d:--spacing(2.5)] group-data-[size=lg]/avatar:[&>svg]:size-2",
        "group-data-[size=xl]/avatar:[--badge-d:--spacing(3)] group-data-[size=xl]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * An avatar. A `title` shows in our Tooltip on hover (never the native browser one), so
 * `<Avatar title="Nora Lindgren">` is enough to name a face.
 */
function Avatar({ title, ...props }: React.ComponentProps<typeof AvatarRoot>) {
  if (!title) return <AvatarRoot {...props} />
  return (
    <Tooltip>
      <TooltipTrigger render={<AvatarRoot {...props} />} describe={false} data-slot="avatar" />
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  )
}

/** One person of a people list: a photo, or initials (given or taken from the name), tinted in a colour. */
type Person = { name: string; initials?: string; src?: string; color?: AvatarColor }

/** The initials of a person: the given ones, or the first letters of the first two words of the name. */
const initialsOf = (p: Person) => p.initials ?? p.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()

type AvatarGroupProps = React.ComponentProps<"div"> & {
  layout?: "overlap" | "spaced"
  /** A list of people: the group renders their avatars itself, overlapping by 4 px (2 px at `sm` and `xs`, so the
   *  second initial is not hidden under the next face), cut at `max` with a "+N" avatar. Hovering a face lifts it
   *  and shows the name in a Tooltip.
   *  The 2 px ring (faces and count) is `--surface`, the colour of what the group sits on: a card, a popover, a hovered or selected row. */
  people?: Person[]
  /** With `people`: how many faces show before the count. Default 3. */
  max?: number
  /** With `people`: the avatar size, `sm` 24 px, `xs` 28 px, `default` 36 px, `lg` 40 px, `xl` 44 px. Default `sm`. */
  size?: "xs" | "sm" | "default" | "lg" | "xl"
}

function AvatarGroup({ people, max = 3, size = "sm", layout, children, className, ...props }: AvatarGroupProps) {
  if (people) {
    const shown = people.slice(0, max)
    const rest = people.length - shown.length
    return (
      <AvatarGroupItems
        layout="overlap"
        data-variant="people"
        // small faces overlap less: with 4 px and the 2 px ring the next face covered the second initial ("DO" read "DC")
        overlapClass={size === "sm" || size === "xs" ? "-space-x-0.5" : "-space-x-1"}
        className={className}
        {...props}
      >
        {shown.map((p, i) => (
          <Avatar key={`${p.name}-${i}`} size={size} color={p.src ? undefined : (p.color ?? "indigo")} className="ring-2 ring-(--surface)" title={p.name} role="img" aria-label={p.name}>
            {p.src && <AvatarImage src={p.src} alt="" />}
            <AvatarFallback className="text-[10px]">{initialsOf(p)}</AvatarFallback>
          </Avatar>
        ))}
        {rest > 0 && (
          // An Avatar of the same size, so the count is as big as the faces next to it.
          <Avatar size={size} className="ring-2 ring-(--surface)">
            <AvatarFallback className="text-[10px] font-medium text-text-secondary">+{rest}</AvatarFallback>
          </Avatar>
        )}
      </AvatarGroupItems>
    )
  }
  return (
    <AvatarGroupItems layout={layout} className={className} {...props}>
      {children}
    </AvatarGroupItems>
  )
}

function AvatarGroupItems({ className, children, layout = "overlap", overlapClass = "-space-x-3", ...props }: React.ComponentProps<"div"> & {
  layout?: "overlap" | "spaced"
  /** Overlap of the faces (a `-space-x-*` class). */
  overlapClass?: string
}) {
  const rootRef = React.useRef<HTMLDivElement>(null)

  // Distance-falloff hover lift: hovering one avatar lifts it and gently
  // lifts its neighbors, then everything snaps back with an overshoot spring
  // on mouseleave. The timing-function is set inline right before the
  // --avatar-shift/--avatar-scale writes so hover-in gets a clean ease and
  // the return gets the bouncy one, without a second class for "leaving".
  function setShifts(activeIndex: number | null, phase: "in" | "out") {
    const items = rootRef.current?.querySelectorAll<HTMLElement>("[data-avatar-hover-item]")
    if (!items) return
    const timing = phase === "out" ? "var(--ease-overshoot)" : "cubic-bezier(0.22, 1, 0.36, 1)"
    items.forEach((el, index) => {
      el.style.transitionTimingFunction = timing
      if (activeIndex == null) {
        el.style.setProperty("--avatar-shift", "0px")
        el.style.setProperty("--avatar-scale-active", "1")
        return
      }
      const distance = Math.abs(index - activeIndex)
      el.style.setProperty("--avatar-shift", `${(-4 * 0.45 ** distance).toFixed(3)}px`)
      el.style.setProperty("--avatar-scale-active", index === activeIndex ? "1.05" : "1")
    })
  }

  return (
    <div
      ref={rootRef}
      data-slot="avatar-group"
      data-layout={layout}
      onMouseLeave={() => setShifts(null, "out")}
      className={cn(
        "group/avatar-group flex",
        layout === "overlap"
          ? cn(overlapClass, "[&_[data-slot=avatar]]:ring-2 [&_[data-slot=avatar]]:ring-(--surface)")
          : "gap-1.5",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div
          data-avatar-hover-item
          onMouseEnter={() => setShifts(index, "in")}
          className="origin-center transition-transform ease-entrance duration-slow will-change-transform [transform:translateY(var(--avatar-shift,0px))_scale(var(--avatar-scale-active,1))] motion-reduce:[transform:none] motion-reduce:transition-none"
        >
          {child}
        </div>
      ))}
    </div>
  )
}

const AVATAR_GROUP_COUNT_BASE_CLASSES =
  "relative flex size-9 shrink-0 items-center justify-center rounded-full ring-2 ring-(--surface) group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=xl]/avatar-group:size-11 group-has-data-[size=xs]/avatar-group:size-7 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3"

type AvatarGroupCountProps =
  | ({ interactive?: false } & React.ComponentProps<"div">)
  | ({ interactive: true } & React.ComponentProps<"button">)

function AvatarGroupCount(props: AvatarGroupCountProps) {
  if (props.interactive) {
    const { interactive: _interactive, className, children, ...rest } = props
    return (
      <button
        type="button"
        data-slot="avatar-group-count"
        data-interactive
        className={cn(
          AVATAR_GROUP_COUNT_BASE_CLASSES,
          "bg-bg-surface border border-border-control text-[12px] font-semibold text-foreground cursor-pointer hover:bg-bg-page aria-expanded:bg-bg-page data-[popup-open]:bg-bg-page active:bg-bg-subtle focus-ring disabled:opacity-40 disabled:pointer-events-none",
          className
        )}
        {...rest}
      >
        {opticalCenter(children)}
      </button>
    )
  }

  const { interactive: _interactive, className, children, ...rest } = props
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        AVATAR_GROUP_COUNT_BASE_CLASSES,
        "bg-muted text-[12px] font-semibold text-text-secondary",
        className
      )}
      {...rest}
    >
      {opticalCenter(children)}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* AvatarLabel — an avatar with a name and a second line, and optionally a     */
/* capacity bar or a trailing control. Figma: User Info (634:2727), Person     */
/* Cell (722:177).                                                             */
/* -------------------------------------------------------------------------- */

type AvatarLabelProps = {
  name: string
  /** Second line under the name: a role, an email, a plan. */
  subtext?: React.ReactNode
  src?: string
  /** Initials shown without a picture. Default: the first letters of the first two words of the name. */
  initials?: string
  color?: AvatarColor
  /** Avatar size: `default` 36 px, `lg` 40 px, `xl` 44 px. */
  size?: "default" | "lg" | "xl"
  /** Smaller text (12 / 11 px, semibold name) for sidebars, menus and dense rows. Default: on when there is a capacity bar. */
  compact?: boolean
  /** Weight of the name. Default: semibold when compact, medium otherwise. */
  nameWeight?: "medium" | "semibold"
  /** No gap between the name and the second line (the User Info look), so the 20 + 16 px text block is as tall as the
   *  36 px avatar. Default: on; `false` puts 2 px between the lines. */
  tight?: boolean
  /** A load bar under the text: `value` 0 to 100 and a label such as "32h". Green up to 80 %, yellow up to 100 %, red above. */
  capacity?: { value: number; label?: React.ReactNode }
  /** A control at the end of the row, such as an IconButton menu. */
  trailing?: React.ReactNode
  className?: string
}

function AvatarLabel({ name, subtext, src, initials, color, size = "default", compact, nameWeight, tight = true, capacity, trailing, className }: AvatarLabelProps) {
  const small = compact ?? capacity !== undefined
  const weight = nameWeight ?? (small ? "semibold" : "medium")
  const fallback = initials ?? name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
  // The bar is clamped to 0–100 % (NaN counts as 0). Its colour follows the load: up to 80 % success,
  // 81–100 % warning (the yellow of the away status), over 100 % error. The raw value decides the colour.
  const load = capacity && Number.isFinite(capacity.value) ? capacity.value : 0
  const loadWidth = Math.max(0, Math.min(100, load))
  const loadTone = load > 100 ? "bg-error" : load > 80 ? "bg-brand-quaternary" : "bg-success"
  return (
    <div data-slot="avatar-label" className={cn("flex items-center gap-3", className)}>
      <Avatar size={size} color={src ? undefined : color}>
        {/* alt="": the name stands right next to the face, so a screen reader would read it twice */}
        {src && <AvatarImage src={src} alt="" />}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      {/* Avatar height = text block (owner, Nov 14 2026): name 20 + second line 16 = the 36 px avatar, so no gap by default. */}
      <div className={cn("flex min-w-0 flex-1 flex-col", !tight && "gap-0.5")}>
        <span className={cn("truncate text-foreground", small ? "text-xs" : "text-sm", weight === "semibold" ? "font-semibold" : "font-medium")}>{name}</span>
        {subtext && <span className={cn("truncate text-text-tertiary", small ? "text-[11px]" : "text-xs")}>{subtext}</span>}
        {capacity && (
          <span className="flex items-center gap-1">
            <span
              role="meter"
              aria-label="Capacity"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={loadWidth}
              aria-valuetext={`${Math.round(load)}% of capacity${capacity.label && typeof capacity.label === "string" ? `, ${capacity.label}` : ""}`}
              className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <span data-load={load > 100 ? "over" : load > 80 ? "high" : "ok"} className={cn("block h-full rounded-full", loadTone)} style={{ width: `${loadWidth}%` }} />
            </span>
            {capacity.label && <span className="text-[11px] text-text-tertiary">{capacity.label}</span>}
          </span>
        )}
      </div>
      {trailing}
    </div>
  )
}

export type { AvatarColor, AvatarBadgeStatus, AvatarLabelProps, AvatarGroupProps, Person }
export {
  AvatarLabel,
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
  initialsOf,
}
