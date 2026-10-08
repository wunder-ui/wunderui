import * as React from "react"

/**
 * Collects `{ value, label }` pairs from `<…Item value>label</…Item>` elements
 * anywhere in a Select's children, so `<Select.Value>` can show the label
 * before the popup has ever opened (Base UI otherwise renders the raw value).
 */
function collectSelectItems(children: React.ReactNode): { value: string; label: React.ReactNode }[] {
  const items: { value: string; label: React.ReactNode }[] = []
  const walk = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return
      const props = child.props as { value?: unknown; children?: React.ReactNode }
      if (typeof props.value === "string" && props.children !== undefined && typeof child.type !== "string") {
        items.push({ value: props.value, label: props.children })
      }
      if (props.children) walk(props.children)
    })
  }
  walk(children)
  return items
}

export { collectSelectItems }
