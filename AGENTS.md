# AGENTS.md — harness-tutorial

A static, Vietnamese-language tutorial website about harness engineering: what problems AI coding agents have today,
which principles address them, and how harness-kit (https://github.com/duonghuyhieu/harness-kit) implements them.
Audience: developers and technical leads. Tone: academic, sourced, calm — engaging through interactive diagrams, not
through hype.

Stack: plain HTML5 + one shared stylesheet (`assets/css/style.css`) + one script (`assets/js/main.js`), no build step,
no framework. Checks are Python 3.10+ standard library (`tests/check_site.py`).

> This file is a **map**. Facts live in `docs/CONTENT.md`; markup patterns in `docs/PAGE-TEMPLATE.html`.

## Hard constraints (non-negotiable)

- Never mark work done without runnable evidence: feature status changes only via `python scripts/harness.py verify <id>` (source: harness-kit pass-gate).
- Never delete, skip, or loosen checks in `tests/check_site.py` to get a pass (source: harness-kit).
- Every fact, number, date and quote comes from `docs/CONTENT.md`; percentages not in it fail the check (source: project decision 2026-10-15; expires when: never).
- Every number carries an evidence tag (`<span class="ev" data-evidence="do|sx|mh|sl">`) and a citation (`<a class="cite" href="references.html#ref-<key>">`) (source: research paper evidence discipline).
- Site text is Vietnamese with English technical terms kept as-is (harness, agent, hook, pass-gate…) (source: user decision 2026-10-15).
- Behavior lives only in `assets/js/main.js`, styles only in `assets/css/style.css`; pages use `data-component` and the documented classes — no inline scripts or styles, no new external dependencies besides the Google Fonts link (source: design decision 2026-10-15).
- `assets/`, `tests/`, `docs/CONTENT.md` and `docs/PAGE-TEMPLATE.html` change only when a feature's scope names them (source: initializer decision 2026-10-15).
- Security incidents and attacks are described only as findings, rates and defenses — never mechanics or techniques (source: project decision 2026-10-15).

## Session start (clock-in)

1. `python scripts/harness.py start` — next step, recent commits, feature status, baseline check.
2. Read `PROGRESS.md` and `docs/DECISIONS.md`.
3. Baseline red → fix it first. Then `python scripts/harness.py next` (WIP=1).

## Standard commands

| Purpose | Command |
|---|---|
| Check one page | `python tests/check_site.py --page <index, problems, principles, harness-kit, guide, references>` |
| Check the site | `python tests/check_site.py` (missing pages are warnings) · release gate: `--strict` |
| Smoke | `python tests/check_site.py --smoke` |
| View locally | open `index.html` in a browser, or `python -m http.server 8000` |
| **Quick verification** | `python scripts/harness.py check` |

Commands are declared in `.harness/config.json`.

## Working rules

- **One page (feature) at a time.** Build it from `docs/CONTENT.md` (facts, section ids) and `docs/PAGE-TEMPLATE.html` (head, nav, footer, components). Mark the current page in the nav with `aria-current="page"`.
- **Academic quality:** precise prose, no superlatives, limits stated where `docs/CONTENT.md` states them; tables for comparisons; one short "Tóm tắt" at the end of long pages.
- **Engagement without noise:** use the interactive components where the brief asks for them; wrap major sections in `class="reveal"`.
- **A review issue repeated twice** → turn it into a check in `tests/check_site.py` (with WHY + FIX).
- **Something went wrong?** `python scripts/harness.py fail --layer <instructions|tools|environment|state|feedback> --note "..."`.

## Definition of done

1. `python tests/check_site.py --page <page>` passes (the feature's verification).
2. `python scripts/harness.py check` passes; `verify <id>` records the evidence.
3. An independent reviewer compared every number on the page with `docs/CONTENT.md`.
4. `python scripts/harness.py exit-check` prints CLEAN STATE.

## Docs map (read when needed)

| Document | Read when |
|---|---|
| `docs/CONTENT.md` | Writing any page: facts, sections, reference keys |
| `docs/PAGE-TEMPLATE.html` | Markup for head, nav, footer and every component |
| `docs/ARCHITECTURE.md` | Changing assets, adding a component or a page |
| `docs/PRODUCT.md` | Audience, reading paths, what the site does not do |
| `docs/DECISIONS.md` | Before changing an established approach |
| `docs/harness/` | Evaluator rubric, sprint contract, handoff, clean-state checklist |

## Session end (clock-out)

1. `python scripts/harness.py handoff`, then write Done / In Progress / Known Issues / Next Steps in `PROGRESS.md`.
2. `python scripts/harness.py exit-check` — must print CLEAN STATE.
3. Commit verified work with the feature id and *why*.
