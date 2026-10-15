# Architecture — harness-tutorial

- Stack: static HTML5, one stylesheet, one script; no build, no framework. Checks: Python 3.10+ stdlib.
- Surfaces: six pages opened directly from disk or any static file server.

## Layout

```text
index.html  problems.html  principles.html  harness-kit.html  guide.html  references.html
assets/css/style.css     design tokens (light/dark), layout, components
assets/js/main.js        components: loop-diagram, spectrum, state-machine, hook-timeline, terminal, tabs, quiz,
                         count-up, copy buttons, TOC scroll spy, reading progress, reveal, theme toggle
assets/img/mark.svg      logo / favicon
docs/CONTENT.md          the only source of facts (numbers, sections, reference keys)
docs/PAGE-TEMPLATE.html  head, nav, footer and component markup to copy
tests/check_site.py      acceptance checks (structure, links, citations, evidence tags, facts gate)
```

## Module map

| Part | Responsibility | Entry point | May depend on |
|---|---|---|---|
| pages (`*.html`) | content and markup | each file | `assets/`, `references.html` anchors |
| `assets/css/style.css` | all visual styling | `<link>` in every page | Google Fonts |
| `assets/js/main.js` | all behavior, progressive enhancement | `<script defer>` | nothing |
| `tests/check_site.py` | acceptance gate | `python tests/check_site.py` | `docs/CONTENT.md` |

## Dependency rules

Pages → assets → nothing. Pages never embed scripts or styles. Components are addressed by `data-component`; a new
component is added to `main.js` and documented in `docs/PAGE-TEMPLATE.html` in the same change.

## Hotspots

`assets/js/main.js` (shared by every page) and `tests/check_site.py` (a weaker check lets bad pages through).
