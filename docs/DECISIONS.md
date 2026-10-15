# Decision log

> Record **what, why, when**. Newest on top. Do not change an established approach
> without reading the related entry here.
>
> Template:
> ## YYYY-MM-DD: <decision>
> - Reason:
> - Rejected alternatives: (and why)
> - Constraints / consequences:
> - Expires when:

## 2026-10-15: Apply harness engineering to the project
- Reason: the legacy project lacked agent guidance, standard verification, and cross-session state; agents had to guess.
- Rejected alternatives: one large instruction file (it bloats, and rules in the middle get ignored).
- Constraints: `AGENTS.md` is a short router; standard commands live in `.harness/config.json`; feature status changes only via `scripts/harness.py`.
- Expires when: not applicable.

## 2026-10-15: Facts come only from docs/CONTENT.md, enforced by a percentage gate
- Reason: pages are written by agents in a loop; the brief is the verified source and the check makes fabrication fail.
- Rejected: free-form writing with review only (reviews miss numbers).

## 2026-10-15: Static HTML without a build step
- Reason: opens from disk, nothing to install, easy for agents to verify with a stdlib checker.
