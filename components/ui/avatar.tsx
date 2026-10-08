"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cn } from "cn"

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

function Avatar({
  className,
  size = "default",
  shape = "circle",
  variant = "plain",
  color,
  ...props
}: AvatarPrimitive.Root.Props & {
  /** Figma Avatar sizes: sm = 24px (2xs), xs = 28px, default = 36px (small), lg = 40px (medium), xl = 44px (large) */
  size?: "sm" | "xs" | "default" | "lg" | "xl"
  shape?: "circle" | "square"
  variant?: "plain" | "primary"
  /** Soft tint for initials avatars; ignored when an image renders. */
  color?: AvatarColor
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      data-variant={variant}
      data-color={color}
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
        className
      )}
      {...props}
    />
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
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-[1.5px] ring-(--surface) select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=xs]/avatar:size-2 group-data-[size=xs]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, children, ...props }: React.ComponentProps<"div">) {
  const rootRef = React.useRef<HTMLDivElement>(null)

  // Distance-falloff hover lift: hovering one avatar lifts it and gently
  // lifts its neighbors, then everything snaps back with an overshoot spring
  // on mouseleave. The timing-function is set inline right before the
  // --avatar-shift/--avatar-scale writes so hover-in gets a clean ease and
  // the return gets the bouncy one, without a second class for "leaving".
  function setShifts(activeIndex: number | null, phase: "in" | "out") {
    const items = rootRef.current?.querySelectorAll<HTMLElement>("[data-avatar-hover-item]")
    if (!items) return
    const timing = phase === "out" ? "cubic-bezier(0.34, 3.85, 0.64, 1)" : "cubic-bezier(0.22, 1, 0.36, 1)"
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
      onMouseLeave={() => setShifts(null, "out")}
      className={cn(
        "group/avatar-group flex -space-x-3 [&_[data-slot=avatar]]:ring-2 [&_[data-slot=avatar]]:ring-(--surface)",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div
          data-avatar-hover-item
          onMouseEnter={() => setShifts(index, "in")}
          className="origin-center transition-transform duration-slow will-change-transform [transform:translateY(var(--avatar-shift,0px))_scale(var(--avatar-scale-active,1))] motion-reduce:[transform:none] motion-reduce:transition-none"
        >
          {child}
        </div>
      ))}
    </div>
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[12px] font-semibold text-text-secondary ring-2 ring-(--surface) group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=xl]/avatar-group:size-11 group-has-data-[size=xs]/avatar-group:size-7 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export type { AvatarColor }
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
