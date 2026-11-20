"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/** @deprecated Use `Select`. Renders the same markup. */
function NativeSelect(props: React.ComponentProps<typeof Select>) {
  return <Select data-slot="native-select" {...props} />
}

/** @deprecated Use `SelectTrigger` (variant "field"). */
function NativeSelectTrigger(props: React.ComponentProps<typeof SelectTrigger>) {
  return <SelectTrigger data-slot="native-select-trigger" {...props} />
}

/** @deprecated Use `SelectValue`. */
function NativeSelectValue(props: React.ComponentProps<typeof SelectValue>) {
  return <SelectValue data-slot="native-select-value" {...props} />
}

/** @deprecated Use `SelectContent`. */
function NativeSelectContent(props: React.ComponentProps<typeof SelectContent>) {
  return <SelectContent data-slot="native-select-content" {...props} />
}

/** @deprecated Use `SelectItem`. */
function NativeSelectItem(props: React.ComponentProps<typeof SelectItem>) {
  return <SelectItem data-slot="native-select-item" {...props} />
}

export { NativeSelect, NativeSelectTrigger, NativeSelectValue, NativeSelectContent, NativeSelectItem }
