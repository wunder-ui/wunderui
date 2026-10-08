"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  // The bounce keyframes are skipped on the render that mounts the switch —
  // without this, every switch on the page would play its "on" bounce once
  // at load just because the attribute selector newly matches. Deriving this
  // from mount (not a click handler) means it can't land a render behind the
  // actual checked-state change, which would otherwise let a stray "on"
  // bounce play for a split second before the real "off" toggle catches up.
  const isInitialRender = React.useRef(true)
  React.useEffect(() => {
    isInitialRender.current = false
  }, [])

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-init={!isInitialRender.current || undefined}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition duration-fast ease-entrance outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-5 data-[size=default]:w-10 data-[size=default]:[--switch-travel:22px] data-[size=sm]:h-4 data-[size=sm]:w-8 data-[size=sm]:[--switch-travel:18px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-dark-400 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform duration-fast ease-entrance group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-checked:translate-x-(--switch-travel) dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground group-data-init/switch:data-checked:[animation:wunderui-switch-on_var(--duration-slow)_var(--ease-overshoot)_both] group-data-init/switch:data-unchecked:[animation:wunderui-switch-off_var(--duration-slow)_var(--ease-overshoot)_both]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
