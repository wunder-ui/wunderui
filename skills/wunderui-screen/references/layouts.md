# Layouts

Pick one per screen. All of them are `AppLayout` configurations or plain wrappers — never a hand-built shell.

| Layout | When | Build |
|---|---|---|
| **App shell with sidebar** | Any screen inside a product: dashboards, lists, settings | `<AppLayout sidebar={<Sidebar …/>} navbar={<Navbar …/>}>` — the sidebar becomes a drawer on small screens; `AppLayoutNavigationTrigger` opens it. |
| **App shell with aside** | A list or editor with a detail/inspector pane (inbox, file manager, agent run) | `AppLayout` with `aside` + `asideLabel`; `AppLayoutAsideTrigger` toggles it. From 64rem it is a pane, below a drawer. |
| **Top bar only** | Marketing-adjacent pages, docs, simple tools | `AppLayout` with `navbar` and no `sidebar`, `width="contained"` or a centred `max-w-*` container. |
| **Centered card** | Sign-in, sign-up, verification, single forms | `min-h-screen` flex centre on `bg-page`, one `Card` of `max-w-sm`/`max-w-md`. |
| **Split** | Auth with a brand panel, onboarding | Two columns from `lg`, the panel hides below `lg`. |
| **Full bleed** | Canvas, map, kanban across the viewport | `AppLayout` with `padding="none"` / `scroll` set so the content owns the scroll. |

## Grids inside the content

- **KPI row:** `KPIGroup` (or `MetricCard`s in `grid gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4`).
- **Main + side:** `grid gap-6 lg:gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]` — the `minmax(0,…)` keeps charts and tables from forcing the column wider.
- **Full-width table** under the charts: `DataGrid` directly, not inside another card unless the screen has several.
- Spacing: every value is in `references/spacing.md`. Page `px-4 pt-8 pb-12 lg:px-8`, sections `gap-8`, cards `gap-5 lg:gap-6`, card padding `p-4`.
- Page header: `PageHeader` with `title`, `description` and `actions` (the primary action is the only primary button on the screen).

## Mobile

- Every grid collapses to one column; tables become horizontally scrollable inside their own container, never the page.
- The primary action stays visible (page header or a bottom bar), touch targets at least 40 px.
