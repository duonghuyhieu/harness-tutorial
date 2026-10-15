# Evaluator rubric (for an independent checker)

Use after implementation, before acceptance. Every score must come with **evidence** (command output, file:line).
Fail the feature if any **blocking** row scores 0.

| Category | Question | Score (0–2) | Evidence |
|---|---|---|---|
| **Facts (blocking)** | Open `docs/CONTENT.md` and compare EVERY number, date, quote and named result on the page with it. Any figure, claim or source that is not in the brief, or is attributed to the wrong source, scores 0 | | |
| **Evidence tags (blocking)** | Each number has the evidence tag the brief gives it (Đo/SX/MH/SL) and a citation to the right `ref-` key; production reports are not presented as experiments; illustrations are not presented as measurements | | |
| **Completeness (blocking)** | Every section the brief lists for this page exists with its id and covers the brief's points (no section is a stub) | | |
| Academic tone | Precise Vietnamese prose with English technical terms kept; no superlatives or marketing; limits stated where the brief states them | | |
| Engagement | The interactive components the brief asks for are present and placed where they explain something; major sections use `reveal` | | |
| Accessibility | One h1, logical heading order, alt text, link text that makes sense out of context, works without JavaScript | | |
| Verification | `python scripts/harness.py try <id>` and `python scripts/harness.py check` ran and passed, with output | | |
| Scope discipline | Only the feature's page changed (no edits to assets/, tests/, docs/) | | |
| Safety | Incidents and attacks only as findings, rates and defenses — no mechanics or techniques | | |

## Verdict
- Accept / Revise / Block

## Required follow-up
- Missing evidence:
- Required fixes (each with location and concrete fix):

> Evaluator calibration: run the rubric on a finished page, compare with a human's assessment,
> and make the criteria more specific wherever they diverge.
