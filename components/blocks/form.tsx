"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input, type InputProps } from "@/components/ui/input"
import { Textarea, type TextareaProps } from "@/components/ui/textarea"
import { Checkbox, type CheckboxProps } from "@/components/ui/checkbox"

/* ------------------------------------------------------------------ */
/* TextField — deprecated alias of Input (label, helper, error,         */
/* leading, trailing now live on Input). Figma: ❖ Input / Text Input    */
/* Field (152:7398)                                                    */
/* ------------------------------------------------------------------ */

/** @deprecated Use `InputProps`. */
type TextFieldProps = InputProps

/** @deprecated Use `Input` with the same props (`label`, `helper`, `error`, `leading`, `trailing`…). */
function TextField(props: TextFieldProps) {
  // wrapperClassName is always passed, so the alias renders the field wrapper even without a label.
  return <Input {...props} wrapperClassName={props.wrapperClassName} />
}

/* ------------------------------------------------------------------ */
/* PasswordField — deprecated alias: Input with the reveal button        */
/* ------------------------------------------------------------------ */

/** @deprecated Use `Input` with `type="password"` and `revealable`. */
function PasswordField(props: TextFieldProps) {
  return <Input autoComplete="current-password" {...props} type="password" revealable wrapperClassName={props.wrapperClassName} />
}

/* ------------------------------------------------------------------ */
/* TextareaField — deprecated alias of Textarea (label, helper, error,   */
/* optional and wrapperClassName now live on Textarea)                   */
/* ------------------------------------------------------------------ */

/** @deprecated Use `TextareaProps`. */
type TextareaFieldProps = TextareaProps

/** @deprecated Use `Textarea` with the same props (`label`, `helper`, `error`, `optional`…). */
function TextareaField(props: TextareaFieldProps) {
  // wrapperClassName is always passed, so the alias renders the field wrapper even without a label.
  return <Textarea {...props} wrapperClassName={props.wrapperClassName} />
}

/* ------------------------------------------------------------------ */
/* CheckboxField — deprecated alias of Checkbox (label, description,     */
/* error now live on Checkbox). Figma: ❖ Selectors / Checkbox Item       */
/* (113:7985)                                                          */
/* ------------------------------------------------------------------ */

/** @deprecated Use `CheckboxProps`. */
type CheckboxFieldProps = Omit<CheckboxProps, "label"> & { label: React.ReactNode }

/** @deprecated Use `Checkbox` with the same props (`label`, `description`, `error`). */
function CheckboxField(props: CheckboxFieldProps) {
  // wrapperClassName is always passed, so the alias renders the row even if label is empty.
  return <Checkbox {...props} wrapperClassName={props.wrapperClassName} />
}

/* ------------------------------------------------------------------ */
/* FormActions — right-aligned button row used at the end of forms       */
/* ------------------------------------------------------------------ */

function FormActions({ children, align = "end", className }: { children: React.ReactNode; align?: "start" | "end" | "between"; className?: string }) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex flex-wrap items-center gap-2",
        align === "end" && "justify-end",
        align === "between" && "justify-between",
        className
      )}
    >
      {children}
    </div>
  )
}

export { TextField, PasswordField, TextareaField, CheckboxField, FormActions }
export type { TextFieldProps, TextareaFieldProps, CheckboxFieldProps }
