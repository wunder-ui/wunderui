"use client"

import * as React from "react"
import { Icon } from "@/components/ui/icon-provider"
import { cn } from "@/lib/utils"
import { Button } from "./button"

/** Wraps an Input plus leading/trailing addons (icons, buttons) in one
 *  bordered field — the outer border/focus ring lives here, not on the
 *  inner <input>, so addons sit flush inside it. */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      // Equal inner spacing (owner 15 Nov 2026): a key cap or a button at the end sits as far from the right edge as from
      // the top and bottom, (field height - 2 px border - item height) / 2. A button is shrunk to a 4 px gap all round.
      className={cn(
        "flex h-(--ig-h) [--ig-h:var(--field-md)] w-full items-center gap-2 rounded-md border border-input bg-card px-3 text-sm transition-colors duration-fast ease-entrance has-[[data-slot=input-group-addon]:last-child_kbd]:pe-[calc((var(--ig-h)-2px-22px)/2)] has-[[data-slot=input-group-addon]:last-child>[data-slot=button]]:pe-1 has-disabled:pointer-events-none has-disabled:opacity-40 has-[input[readonly]]:bg-bg-subtle hover:border-text-muted focus-ring-within has-[input[aria-invalid=true]]:border-error has-[input[aria-invalid=true]]:focus-ring-within-error [&>input]:h-full [&>input]:flex-1 [&>input]:rounded-none [&>input]:border-none [&>input]:bg-transparent [&>input]:p-0 [&>input]:text-sm [&>input]:shadow-none [&>input]:outline-none [&>input]:focus-visible:outline-none [&>input]:focus-visible:ring-0 [&>input]:aria-invalid:ring-0 dark:[&>input]:bg-transparent [&>input[readonly]]:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "flex shrink-0 items-center text-text-tertiary [&_svg]:pointer-events-none [&_svg]:size-4 [&>[data-slot=button]]:h-[calc(var(--ig-h)-2px-0.5rem)] [&>[data-slot=button]]:rounded-sm",
        className
      )}
      {...props}
    />
  )
}

type InputGroupCopyProps = {
  /** The text shown in the read-only field and put on the clipboard. */
  value: string
  /** Called once the clipboard took the value. */
  onCopy?: (value: string) => void
  /** Label of the button. */
  copyLabel?: string
  /** Label of the button for 1.5 s after a copy. */
  copiedLabel?: string
  /** Names the read-only field. */
  "aria-label"?: string
  className?: string
}

/**
 * A read-only field with a Copy button inside it: an invite link, an API key, a share URL. The button puts `value` on
 * the clipboard, turns into a check with "Copied" for 1.5 s and says so in a polite live region. "Copied" only
 * appears once the clipboard took the text (it is blocked in iframes, on http and when denied).
 */
function InputGroupCopy({
  value,
  onCopy,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  "aria-label": ariaLabel = "Copy value",
  className,
}: InputGroupCopyProps) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = () => {
    navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(true)
        onCopy?.(value)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), 1500)
      },
      () => {}
    )
  }
  return (
    <InputGroup data-slot="input-group-copy" className={className}>
      <input readOnly value={value} aria-label={ariaLabel} className="min-w-0 truncate" />
      <InputGroupAddon>
        <Button type="button" variant="plain" size="sm" shape="rounded" onClick={copy}>
          {copied ? <Icon name="check" className="text-success" strokeWidth={1.5} /> : <Icon name="copy" strokeWidth={1.5} />}
          {copied ? copiedLabel : copyLabel}
        </Button>
        <span role="status" className="sr-only">{copied ? copiedLabel : ""}</span>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { InputGroup, InputGroupAddon, InputGroupCopy }
export type { InputGroupCopyProps }
