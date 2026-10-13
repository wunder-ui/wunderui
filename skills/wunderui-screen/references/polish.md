# Polish — the details that make a screen feel finished

Check these while building, not afterwards. Each line is a rule, its WunderUI form, and why. Express every fix in the project's own styling (Tailwind classes in a Tailwind project) — never add a second styling system for a polish fix.

## Surfaces
- **Concentric corners.** A rounded surface inside another: outer radius = inner radius + padding (card `rounded-2xl` 16 px with `p-2` holds `rounded-lg` 8 px children). Equal radii on nested surfaces look pinched.
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

## Motion while building
Motion rules M1–M23 (the full list ships with the Pro skill wunderui-motion-audit). The ones that matter most on a new screen: stagger only the first entrance (M16), press feedback on pressables (M17), no entrance on every page load (M20), nothing animated that is used by keyboard or many times a day (M11).

## Feedback that is not visual
Status changes that happen without a page change — a saved toast, results updating after a filter, an error summary on submit — are announced: `role="status"` (polite) or `role="alert"` (urgent). WunderUI's Toast and Alert already do this; hand-built ones must too. Motion is never the only signal: every animated state change also has a static cue (colour, icon or text).

The surface, text and icon rules draw on Jakub Krehel's make-interfaces-feel-better and skills (MIT) and Emil Kowalski's design-engineering notes (MIT), rewritten for WunderUI.
