"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

/* ------------------------------------------------------------------ */
/* TextareaField                                                         */
/* ------------------------------------------------------------------ */

type TextareaFieldProps = React.ComponentProps<typeof Textarea> & {
  label?: React.ReactNode
  helper?: React.ReactNode
  error?: React.ReactNode
  optional?: boolean
  wrapperClassName?: string
}

function TextareaField({ label, helper, error, optional, id: idProp, wrapperClassName, ...props }: TextareaFieldProps) {
  const autoId = React.useId()
  const id = idProp ?? autoId
  return (
    <div data-slot="textarea-field" className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {optional && <span className="ml-1 font-normal text-text-tertiary">(optional)</span>}
        </label>
      )}
      <Textarea id={id} aria-invalid={error ? true : undefined} {...props} />
      {error ? <p className="text-xs text-text-error">{error}</p> : helper && <p className="text-xs text-text-tertiary">{helper}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* CheckboxField — checkbox + label (+ description)                      */
/* Figma: ❖ Selectors / Checkbox Item (113:7985)                       */
/* ------------------------------------------------------------------ */

type CheckboxFieldProps = React.ComponentProps<typeof Checkbox> & {
  label: React.ReactNode
  description?: React.ReactNode
  wrapperClassName?: string
}

function CheckboxField({ label, description, id: idProp, wrapperClassName, className, ...props }: CheckboxFieldProps) {
  const autoId = React.useId()
  const id = idProp ?? autoId
  return (
    <label htmlFor={id} data-slot="checkbox-field" className={cn("flex cursor-pointer items-start gap-2", wrapperClassName)}>
      <Checkbox id={id} className={cn("mt-0.5", className)} {...props} />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-text-secondary [&_a]:font-medium [&_a]:text-text-link [&_a]:hover:underline">{label}</span>
        {description && <span className="text-xs text-text-tertiary">{description}</span>}
      </span>
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* FormActions — right-aligned button row used at the end of forms       */
/* ------------------------------------------------------------------ */

function FormActions({ children, align = "end", className }: { children: React.ReactNode; align?: "start" | "end" | "between"; className?: string }) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex flex-wrap items-center gap-3",
        align === "end" && "justify-end",
        align === "between" && "justify-between",
        className
      )}
    >
      {children}
    </div>
  )
}

export { TextareaField, CheckboxField, FormActions }
export type { TextareaFieldProps, CheckboxFieldProps }
