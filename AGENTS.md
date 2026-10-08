# WunderUI Free — rules for coding agents

Components live in `components/` and import each other through the `@/*` alias. Use them instead of building UI from raw elements; only the components in this repository are available on the Free plan (see components.json).

## Rules for agents

1. **Never hardcode colours.** Every value is a CSS variable. Use the Tailwind utility that maps to it (`bg-card`, `text-text-secondary`, `border-border`), not a hex.
2. **Theme by overriding tokens**, not by restyling components. Setting `--primary` on any wrapper re-themes everything inside it.
3. **Dark mode is a `.dark` class on `<html>`.** `ThemeProvider` (next-themes) handles it. Never write your own dark colours.
4. **The package is client code.** It ships with a `"use client"` banner, so you can import it inside React Server Components, but its own components run on the client.
5. **Import from the package root**, never from `dist/` or `src/` paths.
6. `cn` is not re-exported — import it from the `cn` package directly.
7. **Prefer a composite over rebuilding one.** Before writing a table, a board, a stat row or a chat bubble by hand, check the task table and the inventory below — it probably exists.
8. **Charts take a `loading` prop**; do not build your own skeleton.
9. **A KPI chart ends on the trend line.** In a metric card, a sparkline or mini chart beside the value sits on the same horizontal line as the bottom of the trend chip — `MetricCard` does this by default for `MetricSparkline`. Never centre it vertically or let it float above the chip.
10. **Motion comes from tokens too.** Duration is `duration-instant|fast|base|slow|deliberate|ambient`, easing is `ease-entrance|exit|move|overshoot`. Never write a raw `duration-300` and never write `ease-in-out` — both are the default every generator reaches for, and both read as mechanical.
11. **Agent UI has its own components.** A run's state, its steps, an approval gate, its spend and its failure each have one — `AgentStatus`, `RunTimeline`, `ApprovalCard`, `CostMeter`, `RunError`. Do not assemble these from badges and divs.


## Do and don't

The mistakes that cost the most time, each as a pair.

**Don't**

```tsx
<table className="w-full border">
  <thead>…</thead>
</table>
```

**Do**

```tsx
<DataGrid columns={columns} data={rows} searchable selectable />
```

Sorting, search, selection and pagination already exist. A hand-written table has none of them.

---

**Don't**

```tsx
<div style={{ color: "#555CF3" }}>
```

**Do**

```tsx
<div className="text-primary">
```

A hex value survives no theme change and breaks in dark mode.

---

**Don't**

```tsx
<div className="bg-white dark:bg-zinc-900">
```

**Do**

```tsx
<div className="bg-card">
```

The tokens already carry their dark value. Writing `dark:` variants duplicates — and eventually contradicts — the system.

---

**Don't**

```tsx
import { Button } from "@wunderui/react/dist/index.js"
```

**Do**

```tsx
import { Button } from "@wunderui/react"
```

Deep imports break on every release and skip the package's exports map.

---

**Don't**

```tsx
if (window.confirm("Delete this?")) remove()
```

**Do**

```tsx
<AlertDialog>…</AlertDialog>
```

A native confirm cannot be styled, cannot be tested, and looks like 1998.

---

**Don't**

```tsx
<div onClick={save} className="cursor-pointer rounded px-3 py-2">Save</div>
```

**Do**

```tsx
<Button onClick={save}>Save</Button>
```

A div is not focusable, has no role, and ignores the keyboard.

---

**Don't**

```tsx
{isLoading ? <Spinner /> : <AreaChart data={data} … />}
```

**Do**

```tsx
<AreaChart data={data} index="month" categories={["Revenue"]} loading={isLoading} />
```

The built-in skeleton keeps the chart's height, so the layout does not jump.

---

**Don't**

```tsx
transition-all duration-300 ease-in-out
```

**Do**

```tsx
transition-[opacity,transform] duration-base ease-entrance
```

300ms with a symmetric curve is the generated default. 250ms on a decelerating curve is what a considered interface feels like — and `transition-all` animates properties you did not mean to animate.

---

**Don't**

```tsx
<div className="transition-[height] h-0 data-[open]:h-auto">
```

**Do**

```tsx
<div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-base ease-move data-open:grid-rows-[1fr]"><div className="min-h-0 overflow-hidden">…</div></div>
```

`height: auto` is not animatable anywhere outside Chromium, and animating height forces layout on every frame. The 0fr → 1fr grid trick works in every browser and stays on the compositor.

---

**Don't**

```tsx
data-closed:duration-slow
```

**Do**

```tsx
data-closed:duration-fast
```

An exit is faster than an entrance. The user already decided; making them watch the decision play out is the single most common motion mistake.

---

**Don't**

```tsx
{rows.length === 0 && <p className="text-sm text-gray-500">No results</p>}
```

**Do**

```tsx
<EmptyState title="No invoices yet" description="They appear here as soon as the first one is sent." action={<Button size="sm">New invoice</Button>} />
```

An empty state should say why it is empty and what to do next.

