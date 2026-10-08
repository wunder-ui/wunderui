"use client"

import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field"
import { cn } from "cn"

function OtpField({ className, ...props }: OTPFieldPrimitive.Root.Props) {
  return (
    <OTPFieldPrimitive.Root
      data-slot="otp-field"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function OtpFieldInput({ className, ...props }: OTPFieldPrimitive.Input.Props) {
  return (
    <OTPFieldPrimitive.Input
      data-slot="otp-field-input"
      className={cn(
        "size-11 rounded-md border border-input bg-transparent text-center text-lg font-medium text-foreground outline-none transition-colors focus-visible:border-ring dark:bg-muted/30",
        className
      )}
      {...props}
    />
  )
}

export { OtpField, OtpFieldInput }
