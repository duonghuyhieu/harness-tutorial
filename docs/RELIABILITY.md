# Reliability — harness-tutorial

## Runtime signals

Static site: the browser console is the only runtime log. Components fail soft (progressive enhancement), and
`prefers-reduced-motion` disables all animation.

## Golden paths

| Path | Verification |
|---|---|
| Every page renders and links | `python tests/check_site.py --strict` |
| Every number is sourced | the facts gate and citation checks in `tests/check_site.py` |
| Assets present | `python tests/check_site.py --smoke` |
