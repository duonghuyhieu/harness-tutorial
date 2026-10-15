@AGENTS.md

# Claude Code-specific notes

- The source of truth is `AGENTS.md` (imported above) — do not copy rules here.
- Slash commands (skills in `.claude/skills/`): `/hk-start` to clock in, `/hk-plan` to turn a request into
  verifiable features, `/hk-implement` for one feature end to end, `/hk-review` and `/hk-verify` before anything
  counts as done, `/hk-handoff` to clock out. `/hk-help` lists the rest.
- Subagents (`.claude/agents/`): `hk-reviewer` is the independent, read-only checker — the maker never grades its
  own work. Also `hk-planner`, `hk-maker`, `hk-debugger`, `hk-docs-keeper`, `hk-initializer`.
- Hooks (`.claude/settings.json` → `.claude/hooks/harness_hook.py` → `scripts/harness.py`): the harness state is
  injected at session start, hand edits of feature status are denied, writes outside the active feature's scope
  ask first, and Stop blocks finishing with debug code or junk. `HARNESS_HOOKS=off` disables them for a session.
