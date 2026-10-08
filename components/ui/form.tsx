"use client"

import { Form as FormPrimitive } from "@base-ui/react/form"
import { cn } from "cn"

function Form({ className, ...props }: FormPrimitive.Props) {
  return <FormPrimitive data-slot="form" className={cn("flex flex-col gap-4", className)} {...props} />
}

export { Form }
