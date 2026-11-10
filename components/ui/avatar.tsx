"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { Check, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { opticalCenter } from "@/lib/optical-center"

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
      <Moon className="size-full fill-current" strokeWidth={0} />
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

function Avatar({
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
  /** Figma Avatar sizes: sm = 24px (2xs), xs = 28px, default = 36px (small), lg = 40px (medium), xl = 44px (large) */
  size?: "sm" | "xs" | "default" | "lg" | "xl"
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
        "data-[size=sm]:size-6 data-[size=xs]:size-7 data-[size=lg]:size-10 data-[size=xl]:size-11",
        // Figma keeps the glyph at 16 px and only shrinks it on the two small sizes.
        "[&_svg]:size-4 data-[size=sm]:[&_svg]:size-3 data-[size=xs]:[&_svg]:size-3.5",
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
            "group-data-[size=sm]/avatar:[--badge-d:--spacing(3)] group-data-[size=sm]/avatar:[&>svg]:size-2",
            "group-data-[size=xs]/avatar:[--badge-d:--spacing(3.5)] group-data-[size=xs]/avatar:[&>svg]:size-2.5",
            "group-data-[size=default]/avatar:[&>svg]:size-3",
            "group-data-[size=lg]/avatar:[&>svg]:size-3",
            "group-data-[size=xl]/avatar:[&>svg]:size-3"
          )}
        >
          <Check className="size-3" strokeWidth={3} />
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

function AvatarGroup({ className, children, layout = "overlap", ...props }: React.ComponentProps<"div"> & {
  layout?: "overlap" | "spaced"
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
          ? "-space-x-3 [&_[data-slot=avatar]]:ring-2 [&_[data-slot=avatar]]:ring-(--surface)"
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

export type { AvatarColor, AvatarBadgeStatus }
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
