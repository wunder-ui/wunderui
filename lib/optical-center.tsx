import * as React from "react"

const isText = (node: React.ReactNode): node is string | number => typeof node === "string" || typeof node === "number"

/**
 * Puts the text of a circle, pill or badge on the cap-height centre (owner rule, 10 Nov 2026).
 *
 * A flex container centres the line box, and a line box is taller below the baseline than the cap height is
 * above it, so digits and capitals sit a little low. `optical-center` (line-height 1 and `text-box: trim-both
 * cap alphabetic`) shrinks the text to the cap height; it only works on a block of its own, so every run of
 * plain text inside the container is wrapped in a `<span className="optical-center">`. Elements (icons,
 * nested components) are left alone, and so is `null`, `false` and an empty string.
 *
 * Runs of text are merged into one span, so `+{n}` (two text children) stays one flex item.
 */
function opticalCenter(children: React.ReactNode): React.ReactNode {
  const nodes = React.Children.toArray(children)
  if (nodes.length === 0) return children
  const out: React.ReactNode[] = []
  let run: Array<string | number> = []
  const flush = () => {
    if (run.length === 0) return
    out.push(
      <span key={`optical-${out.length}`} className="optical-center">
        {run}
      </span>
    )
    run = []
  }
  for (const node of nodes) {
    if (isText(node)) run.push(node)
    else {
      flush()
      out.push(node)
    }
  }
  flush()
  return out
}

export { opticalCenter }
