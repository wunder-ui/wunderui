"use client"

import * as React from "react"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NativeSelectContent, NativeSelectItem } from "@/components/ui/native-select"

/** @deprecated Use `Select`. Renders the same markup. */
function InlineSelect(props: React.ComponentProps<typeof Select>) {
  return <Select data-slot="inline-select" {...props} />
}

/** @deprecated Use `SelectTrigger variant="inline"`. */
function InlineSelectTrigger(props: Omit<React.ComponentProps<typeof SelectTrigger>, "variant">) {
  return <SelectTrigger variant="inline" data-slot="inline-select-trigger" {...props} />
}

/** @deprecated Use `SelectValue`. */
function InlineSelectValue(props: React.ComponentProps<typeof SelectValue>) {
  return <SelectValue data-slot="inline-select-value" {...props} />
}

/** @deprecated Use `SelectContent`. */
const InlineSelectContent = NativeSelectContent
/** @deprecated Use `SelectItem`. */
const InlineSelectItem = NativeSelectItem

export { InlineSelect, InlineSelectTrigger, InlineSelectValue, InlineSelectContent, InlineSelectItem }
