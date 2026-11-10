# Spacing

One spacing system for every dashboard, template and block. The values are fixed steps on a 4-px base: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48. The gap inside a group is always smaller than the gap between groups. Use the Tailwind classes below rather than arbitrary values.

## Dashboard layout

Desktop means 1024 px and wider (`lg`). Card padding switches at 768 px (`md`).

| Area | Desktop | Mobile | Tailwind |
|---|---|---|---|
| Sidebar width | 256 | hidden, opens as a drawer | `w-64` |
| Top bar | none, the page header sits at the top of the content | 56 high, padding 12 / 12 / 12 / 16, 1 px bottom border | `h-14` |
| Page padding left and right | 32 | 16 | `px-4 lg:px-8` |
| Page padding top | 32 | 32 | `pt-8` |
| Page padding bottom | 48 | 48 | `pb-12` |
| Page title → supporting text | 2 | 2 | `gap-0.5` |
| Title block → tabs or filter row (the tabs start the next section) | 32 | 32; the actions sit between: title block → actions 16, actions → tabs 32 | `gap-8` |
| Tabs or filters → the content they control (same section) | 16 | 16 | `gap-4` |
| Buttons in an action row | 8 | 8 | `gap-2` |
| Gap between sections | 32 | 32 | `gap-8` |
| Section header → its content | 16; the header has 16 bottom padding and a 1 px bottom border | 16 | `gap-4`, header `pb-4 border-b` |
| Card gap, both directions | 24 | 20 | `gap-5 lg:gap-6` |
| Cards in a KPI row | 16 | 16 | `gap-4` |
| Main column ↔ right rail (a card gap) | 24 | 24, stacked | `gap-6` |
| Card padding (every card) | 16 | 16 | `p-4` |
| Card inner gap | 16 | 16 | `gap-4` |
| Card radius | 16 | 16 | `rounded-xl` |
| KPI label → value | 8 | 8 | `gap-2` |
| KPI value → trend | 8 | 8 | `gap-2` |
| Stacked KPIs in a list | 20 | 20 | `gap-5` |
| Sidebar: group gap | 24 with a group title row (4 + 16 + 4); 12 without a title row | n/a | title row `h-4` |
| Tables | inside their card | full bleed: no side margin, no radius | `-mx-4 rounded-none lg:mx-0 lg:rounded-xl` |

## What is a section

Elements that work together form one section: tabs and the content they switch (a KPI row), a section header and its cards, a main column and its right rail. Inside a section the gaps are: tabs → content 16, section header → content 16, cards in a KPI row 16; other cards are 24 apart and the main column sits 24 from its rail (a card gap). Between sections the gap is 32. The tabs start the section below the page header, so title block → tabs is a section gap (32).

## Card types

Not every card is the same. There are three types:

| Type | Used for | Padding | Notes |
|---|---|---|---|
| Modal card | Login, sign-up, verification, dialogs that stand alone on a screen | 48 top and bottom, 40 left and right | Gaps inside: see Auth and modal cards |
| Standard card | KPI, chart, widget, agent card, profile card and everything else | 16 on all sides, inner gap 16 | KPI cards in a row 16 apart; label → value 8, value → trend 8 |
| Table / list card | Data table, data grid, List Panel | 16 | List Panel rows sit 8 px from the card edge with 8 px side padding (row radius 8); a table fills the card width, full bleed on mobile |

## Auth and modal cards

Sign-in, sign-up, verification and other cards that stand alone on a screen or in a modal. They get more air than a dashboard card (16). Not every card is the same: KPI, chart, list panel, table and widget cards have their own rules (card types below).

| Gap | Value | Tailwind |
|---|---|---|
| Card padding, top and bottom | 48 | `py-12` |
| Card padding, left and right | 40 | `px-10` |
| Title → subtitle | 8 | `gap-2` |
| Header → first field | 24 | `gap-6` |
| Label → input | 8 | `gap-2` |
| Input → helper text | 4 | `gap-1` |
| Field → field | 20 | `gap-5` |
| Last field → primary button | 24 | `gap-6` |
| Primary button → divider → alternative buttons | 24 and 24 | `gap-6` |
| Stacked buttons | 8 | `gap-2` |

## Card shape

- Every card: radius 16 (`rounded-xl`, token `radius/xl`) and padding 16 (`p-4`, token `spacing/4`). No card uses radius 12 or padding 20 / 24; dialogs and sheets are not cards.
- Concentric corners (owner, Oct 30 2026): **inner radius + distance to the outer edge = outer radius**, so inner radius = outer radius − distance. It applies to every surface inside a card (nested panels, tiles, rows) and to buttons that sit near a card corner. If the distance is at least the outer radius, the inner element keeps its own radius (`rounded-md`, 8). Radius tokens: sm 4, md 8, lg 12, xl 16, 2xl 24.

| Outer radius | Distance | Inner radius | Example |
|---|---|---|---|
| 16 (`rounded-xl`) | 8 | 8 (`rounded-md`) | a panel inside a card, 8 px from the edge; a `ListPanel` or `ListGroup` row |
| 16 (`rounded-xl`) | 4 | 12 (`rounded-lg`) | a button in the card's corner, 4 px from both edges |
| 24 (`rounded-2xl`) | 8 | 16 (`rounded-xl`) | a card inside a large surface, 8 px from the edge |

Equal radii on nested surfaces look pinched; do not use them.

List rows: `ListPanel` and `ListGroup` rows sit 8 px from the card edge (radius 8). In a `ListPanel` the rows pull out by their own side padding (`--list-row-px`, 8), so row text stays on the card's 16 px padding line; a card with other geometry sets `--list-row-px` and `--list-row-radius`.

## Component spacing

The gaps inside a component follow one scale as well (owner, Oct 31 2026). They hold in Figma and in code.

| Pattern | Gap | Tailwind |
|---|---|---|
| Label → control (input, select, textarea, combobox, slider, date, colour field) | 8 | `gap-2` |
| Control → helper, caption, hint or error | 4 | `gap-1` |
| Helper → validation line under a control | 4 | `gap-1` |
| Field → field in a form or dialog | 20 | `gap-5` |
| Icon → label in items: buttons, menu and nav rows, breadcrumb, stepper, tree, notification, chips, pills, tags, segment options | 8 | `gap-2` |
| Chip label → remove button | 8 | `gap-2` |
| Buttons side by side or stacked (connected groups with −1 keep their overlap) | 8 | `gap-2` |
| Header → content (collapsible, popover, dialog, table caption, toolbar filters) | 16 | `gap-4` |
| Title → description | 4 (modal, auth and alert dialog: 8; dense two-line rows in menus, lists and sidebars: 2) | `gap-1`, `gap-2` |
| Nav rows | 4 | `gap-1` |
| Card (all cards, including agent and AI cards) | padding 16, inner gap 16, radius 16 | `p-4 gap-4 rounded-xl` |
| KPI label → value, value → trend | 8, 8 | `gap-2` |
| Inner surface in a card | concentric: inner radius = outer radius − distance, never below 4 | |

Build the label and the helper as siblings of the control in one column with `gap-1`, and give the label `mb-1`, so label → control is 8 and control → helper is 4.

## Notes

- Dashboard cards have 16 px padding (owner, Oct 30 2026; auth and modal cards: 48 top and bottom, 40 left and right, Oct 31 2026): `Card`, `ChartCard`, `MetricCard`, `StatCard` and `ListPanel` take it from `CARD_INSET` in `lib/card-inset.ts`; the comfortable density keeps its own `--card-padding` of 20 for sheets.
- Do not add a top bar on desktop just to hold the page title; the title, tabs and actions belong to the page header in the content.
