# Polish — the details that make a screen feel finished

Check these while building, not afterwards. Each line is a rule, its WunderUI form, and why. Express every fix in the project's own styling (Tailwind classes in a Tailwind project) — never add a second styling system for a polish fix.

## Surfaces
- **Concentric corners.** A rounded surface inside another: inner radius + distance to the outer edge = outer radius (a 16 px card `rounded-xl` with an 8 px inset holds `rounded-md` 8 px children; with a 4 px inset the children are `rounded-lg` 12 px; if the inset is at least the outer radius the child keeps its own radius). Equal radii on nested surfaces look pinched.
- **Optical, not geometric, centre.** Play triangles, arrows and icons with a heavy side get 1–2 px nudged towards the light side; an icon-only button with a count or chevron keeps its icon centred when the extra is absent (no padding reserved for something that is not there).
- **Borders for structure, shadows for elevation.** Dividers, card outlines, selected and focus states are borders; something lifted above the page (popover, dialog, dragged card) gets a shadow token. Do not darken a border to fake depth.
- **Images get a hairline.** Photos and screenshots on a surface: `outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10` — pure black or white at 10 %, never a tinted grey (it reads as dirt on the edge).
- **Hit areas.** 44 × 44 px on touch, at least 40 × 40 px in dense desktop UI, 24 × 24 px is the WCAG floor. A smaller visible control extends its area with a pseudo-element (`relative after:absolute after:-inset-2`); two hit areas never overlap.

## Text
- **Numbers that change are tabular:** `tabular-nums` on counters, prices, timers, table figures, KPI values — otherwise the row shifts on every update.
- **Headings balance, paragraphs avoid orphans:** `text-balance` on headings, `text-pretty` on body copy.
- **Smoothing:** `antialiased` on the root (`<body>`), once.
- **Long text has a plan:** labels truncate with `truncate` and a title or tooltip with the full text; descriptions clamp with `line-clamp-2`; nothing is cut without a way to read it.
- **Typography from the scale only.** The project's text styles (DESIGN.md → Typography); no one-off sizes. OpenType features only where they help: `tabular-nums` for figures, `slashed-zero` for codes and IDs.
- **Punctuation:** real ellipsis (…), real quotes (“ ” or „ “ in German), en dash for ranges (10–20).

## Icons
- **One stroke per surface,** matched to the text beside it: 1.5 next to regular text, 2 next to semibold labels. Never mix icon sets on one surface.
- **One SVG, states by colour:** icons use `currentColor`; hover, selected and disabled come from the text colour and opacity, not from separate assets. Outline is the default; a filled variant marks the active item only.
- **Swaps crossfade** (copy → check, moon ↔ sun): motion rule M18.

## Layout
- **Group by proximity:** related controls sit closer to each other than to anything else; a section's spacing is larger than the spacing inside it.
- **One alignment edge per group;** numbers align right in tables, text left.
- **Reading order = DOM order.** What comes first on screen comes first in the markup, so keyboard, screen readers and the mobile stack follow the same path.
- **Room for translation:** buttons, tabs and badges size to their text (no fixed widths); leave 30–40 % room — German and French run longer than English.
- **Ready to mirror:** logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) instead of left/right; directional icons (arrows, chevrons) flip with `rtl:-scale-x-100`; logos and media do not.

## Slop signs — the tells of a generated screen
Go through this list before handing a screen over and when reviewing one. Each line is the tell, then the WunderUI fix. The aim is a quiet frame with one or two moments of content that carry the colour; nothing in the chrome glows or competes.

Owner decisions stay: the soft glow on radial charts and the sky behind the page content of the Figma dashboards (wunderui-dashboard-builder 18c, 18d) are intentional and not slop; this list covers everything else.

**Surfaces and colour**
- Coloured glows, coloured shadows, `drop-shadow` on icons, radial colour washes or blurred blobs behind content → shadow tokens only (neutral), depth from `bg-surface` / `bg-subtle` steps and the `border` hairline.
- Gradient text, gradient on chrome (active nav item, badges, plain cards) → solid `text-primary`; `bg-gradient-*` and the ramps only on the surfaces made for them (gradient button, hero or logo tile, a large decorative panel), never on content rows.
- Neon or high-contrast coloured borders → the `border` token; the coloured ring is the focus ring and a selected state, nothing else.
- Five near-identical tints for text → three roles: `text-primary`, `text-secondary`, `text-muted`.
- Everything highlighted so nothing stands out → one primary action per view; the brand colour marks the selection and the one number that matters.
- Glass cards with an inner white highlight → a plain `Card`.

**Type**
- Weight 700 and up on headings → the semibold text styles at most; hierarchy from size and colour.
- Uppercase labels with wide tracking (`NAVIGATION`, `PAID THIS MONTH`) → sentence case in the label style.
- Mixed number formats (`$48,210` beside `$124,860.40`, `07`) → one English format per screen, `tabular-nums`.
- Negative tracking on small text, italics for emphasis → normal tracking; colour or weight for emphasis.

**Icons**
- Emoji as icons, in labels, counts (`18 👤`) or status; ✨ on anything AI → one Lucide icon (1.5 stroke, the text role colour) or nothing.
- Icon boxes of different widths down one list → one icon box width per list so the labels share an edge.

**Copy**
- Greeting headlines (`Welcome back, Sam! 👋`) → the page name or the period.
- Exclamation marks, `Search anything…`, hype words (supercharge, seamless, unlock, magic) → plain statements and short labels (`Search`); say what the thing does.
- A change without a reference (`+12%`) → `+12% vs last month`.
- Fake-looking data (`$123,456`, `[X]`, `John Doe`) → plausible numbers and invented people that read as real (sample-names rule).
- Claims nobody can check (`Loved by 10,000+ teams`, `10x faster`) → remove unless the owner confirms them; list them in the report.
- `PRO`, `New ✨`, `Beta 🚀` badges on everything → none, or one quiet `Badge` where the product needs it.

**Components**
- Glowing pills for counts, plans, shortcuts or status → quiet `Badge`, plain text, or `Kbd` for shortcuts.
- Everything a full pill → radius from the scale by size (concentric rule above); `rounded-full` is for avatars, badges and chips.
- Charts with rainbow bars, glowing bars or uppercase day labels → one accent per chart on the series that matters, neutral steps for the rest (chart rules).
- Sparklines, tallies and mini bars added to every stat card to fill space → label, number, change; a spark only where the card variant is chosen for it.
- Equal cards side by side with the same kind of content → one main chart, compact KPI cells, a narrow list or table beside it.
- Logo as a gradient tile with a sparkle and a gradient wordmark → the product name in the text style plus a flat mark.

**Visuals and motion**
- Decorative filler (orbs, blobs, floating cubes, glowing grids) → show the product: a real component preview with plausible data, or nothing.
- `animate-pulse` or `animate-ping` on things that are not live, shimmer on headings, breathing glows, floating elements, `hover:scale` on cards → remove; motion rules M1–M23 decide what stays.

## Motion while building
Motion rules M1–M23 (the full list ships with the Pro skill wunderui-motion-audit). The ones that matter most on a new screen: stagger only the first entrance (M16), press feedback on pressables (M17), no entrance on every page load (M20), nothing animated that is used by keyboard or many times a day (M11).

## Feedback that is not visual
Status changes that happen without a page change — a saved toast, results updating after a filter, an error summary on submit — are announced: `role="status"` (polite) or `role="alert"` (urgent). WunderUI's Toast and Alert already do this; hand-built ones must too. Motion is never the only signal: every animated state change also has a static cue (colour, icon or text).

The surface, text and icon rules draw on Jakub Krehel's make-interfaces-feel-better and skills (MIT) and Emil Kowalski's design-engineering notes (MIT), rewritten for WunderUI.
