# Quality — harness-tutorial

| Part | Grade | Evidence |
|---|---|---|
| pages | built by the harness loop; graded after each feature's review | `tests/check_site.py --page <page>` |
| assets | B — hand-built by the initializer, reviewed manually in a browser | — |
| tests | B — structural and facts gate; no visual regression testing | `tests/check_site.py` |

## Simplification log

- 2026-10-15: started with the minimal set; no build step, no framework.
