import * as React from "react"
import { cn } from "@/lib/utils"

export type KbdTone = "default" | "inverse"

function Kbd({ className, tone = "default", ...props }: React.ComponentProps<"kbd"> & { tone?: KbdTone }) {
  return (
    <kbd
      data-slot="kbd"
      data-tone={tone}
      className={cn(
        tone === "default"
          ? "inline-flex h-[22px] min-w-5 items-center justify-center rounded-sm border border-border bg-subtle px-1.5 text-xs font-medium text-text-secondary"
          : "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-sm bg-bg-tooltip-key px-[5px] text-xs font-semibold text-neutral-white",
        className
      )}
      {...props}
    />
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

export { Kbd, KbdGroup }
