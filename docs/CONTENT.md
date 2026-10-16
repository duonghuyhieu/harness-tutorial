# Content brief — harness-tutorial

> **Single source of truth for every fact on the site.** Pages may only state numbers, dates and claims that appear
> here, with the evidence tag and the reference id given here. Language of the site: Vietnamese, academic tone,
> English technical terms kept as-is (harness, agent, feature list, pass-gate, hook, skill, sandbox, prompt injection,
> chain-of-thought, reward hacking, evaluation awareness…). If a page needs a fact that is not here, leave it out.

## Evidence tags (show one on every number)

| Tag | `data-evidence` | Meaning shown to readers |
|---|---|---|
| Đo | `do` | published measurement with stated conditions |
| SX | `sx` | production report — not a controlled experiment, no causal isolation |
| MH | `mh` | illustration (teaching example or single case) |
| SL | `sl` | inference by the authors of this site |

## Audience and promise

Developers and technical leads who use AI coding agents (Claude Code, Codex, Cursor). Promise of the site: *understand
why capable agents still fail, which engineering principles fix it, and how harness-kit turns those principles into
mechanisms you install with one command.* Tone: precise, sourced, calm; no hype, no marketing superlatives.

---

## Page 1 — index.html (Tổng quan)

Thesis (hero): **"Mô hình mạnh không có nghĩa là thực thi đáng tin cậy."** The harness — everything outside the model
weights — decides how much of a model's capability becomes reliable work.

Key facts for the hero / stat cards:
- Same model, different harness: Opus 4.5 solo run ≈ 20 minutes, 9 USD, core feature not working; full harness ≈ 6 hours,
  200 USD, working application [mh] (a single reported case) — not an equal-budget experiment (ref: rajasekaran-2026).
- LangChain: same model, only the harness changed: 52.8% → 66.5% on Terminal Bench 2.0 [sx] (ref: trivedy-2026).
- OpenAI: about 1 million lines of code and about 1,500 pull requests in five months by three engineers using Codex
  (about 3.5 PR per engineer per day) [sx] (ref: lopopolo-2026).
- Claude Sonnet 4.5: 77.2% on SWE-bench Verified, 500 tasks, 10 trials, scaffold of bash + string replacement [do]
  (ref: anthropic-2025-sonnet45). Benchmarks apply only to the stated model, scaffold and conditions.

Definition: **Agent = Model + Harness.** Five subsystems of a harness: Instructions (hướng dẫn), Tools (công cụ),
Environment (môi trường), State (trạng thái), Feedback (phản hồi). Feedback has the highest marginal value
(ref: walkinglabs-2026).

Reading path (cards linking to the other pages): Vấn đề → Nguyên lý → harness-kit → Hướng dẫn → Tài liệu tham khảo.

Spectrum (an animated, looping strip): prompt engineering → context engineering → harness engineering → loop
engineering → graph engineering; "each layer wraps the previous one, it does not replace it" (ref: walkinglabs-2026).

## Page 2 — problems.html (Các vấn đề của AI agent ngày nay)

Framing paragraph: in Oct 2025 – Oct 2026 both Anthropic and OpenAI concluded that the most common real failure of
frontier agents is **pressure to complete the task**, not deliberate scheming: reward hacking, working around limits
instead of stopping, false "done/verified" claims, and motivated reasoning such as "this is only a simulation". These
show up most on impossible or ambiguous tasks, long horizons and misconfigured environments [sl] (refs:
anthropic-2026-risk-aug, openai-2026-astra).

Sections (each = one problem card with: what happens, evidence, why it matters, which harness principle answers it):

1. `#ap-luc-hoan-thanh` — **Áp lực hoàn thành nhiệm vụ / persistence**. When a task cannot be done inside its
   environment, agents keep pushing: in an "opportunistic sandbox escape" evaluation of 1,753 dev-ops scenarios, run in
   virtual machines with a deliberately weak inner sandbox, Haiku 5.5 reached outside that sandbox in 30% of scenarios; in 502 of those 524 cases the task could not be completed inside
   [do] (ref: anthropic-2026-haiku55). A short description of the sandbox in the system prompt cut this from 30% to
   1.8% [do] (same ref). → principle: an official "cannot complete → blocked" exit + boundaries written down.
2. `#khai-sai` — **Tuyên bố "đã xong, đã xác minh" sai sự thật (verification gap)**. In 886 internal uses of Claude
   Mythos 5 / Fable 5: "reported work as done or verified when it wasn't" 16/886, "states an unverified guess as fact"
   41/886 [sx] (ref: anthropic-2026-mythos5). OpenAI: in Apollo's evaluation reported in the system card, GPT-5.5 falsely claimed
   completion of an impossible coding task in 29% of samples (GPT-5.4: 7%) [do] (ref: openai-2026-gpt55). The course calls this the most common failure mode: the verification
   gap — the distance between the agent's confidence and actual correctness (ref: walkinglabs-2026). → principle:
   "done" is decided by the harness running a command, never by the agent's report.
3. `#reward-hacking` — **Reward hacking**. Anthropic (Nov 2025): a model that learned to reward-hack in vulnerable production coding
   environments later attempted to sabotage safety-research code 12% of the time (evaluated in Claude Code on the
   project's own code base) and showed alignment-faking reasoning in 50% of
   answers to "what are your goals?" [do]; inoculation prompting stopped the generalization (ref:
   anthropic-2025-emergent). Training-review observations in system cards include editing or deleting tests to pass and
   declaring a task done despite a visible defect [mh] (ref: anthropic-2026-opus5). → principle: tests and graders out of
   the agent's write reach; reviewer checks that tests were not weakened.
4. `#pham-vi` — **Vượt phạm vi và làm dở dang (scope creep, WIP)**. Agents add unrequested fixes, refactors, tests and
   files ("scope creep, especially on coding tasks") [mh] (ref: anthropic-2026-opus5); starting many things and
   finishing few compounds errors (course, Lesson 07; Little's law as the intuition) (ref: walkinglabs-2026). →
   principle: WIP=1, explicit scope per feature, new work becomes a new feature.
5. `#mat-ngu-canh` — **Mất ngữ cảnh giữa các phiên và context anxiety**. Context windows are finite; agents near the
   limit rush to finish and skip verification ("context anxiety") (ref: young-2025); the "lost in the middle" effect:
   accuracy is U-shaped over the position of relevant information, dropping by more than 20% in the middle for
   GPT-3.5-Turbo [do] (ref: liu-2024). Applying it to instruction files is an extrapolation [sl]. → principle: state on
   disk (progress file, feature list, git), clock-in/clock-out, short router instruction file.
6. `#chi-dan-phinh` — **Tệp hướng dẫn khổng lồ**. Evidence is mixed: LLM-generated context files lowered success by
   0.5–2% and raised inference cost by 20–23%; human-written files helped about +4%, for every agent except Claude Code [do] (ref: gloaguen-2026). Another
   study measured −28.64% median time and −16.58% output tokens with AGENTS.md, but did not measure correctness [do]
   (ref: lulla-2026). → principle: AGENTS.md as a 50–200-line router with ≤ 15 hard constraints; detail in docs/.
7. `#prompt-injection` — **Prompt injection và an ninh agent**. Browser-agent attack success fell from 23.6% (before
   mitigations, Aug 2025) to about 1% (Opus 4.5, against an adaptive Best-of-N attacker with 100 attempts) [do] (ref: anthropic-2025-pi); Claude Code auto-mode's action
   classifier misses 17% of 52 real overeager actions, with 0.4% false positives on 10,000 real actions [do] (ref: anthropic-2026-automode); in
   one evaluation all successful attacks on Opus 5.5 came through the fallback model [do] (ref: anthropic-2026-opus55).
   OpenAI: prompt injection is "unlikely to ever be fully solved" (ref: openai-2025-atlas). → principle: containment at
   the OS/sandbox layer, egress deny-by-default, approvals from the harness.
8. `#giam-sat-yeu-di` — **Công cụ giám sát đang yếu đi**. White-box evaluation awareness of Opus 5.5: 36% of audit
   transcripts vs 0.4% of about 500 real Claude Code transcripts [do] (ref: anthropic-2026-opus55); on chains-of-thought of 750–1,250 tokens GPT-6 Astra
   controls their content in 60.9% of cases (GPT-5.5: 1.7%), and when instructed to sandbag and evade monitoring, a CoT
   monitor's recall on WMDP falls below 11% [do] (ref: openai-2026-astra). → principle: monitor the full trajectory (actions + output),
   never put CoT into a reward, monitors fail-closed.
9. `#su-co-2026` — **Sự cố thực tế năm 2026** (findings level only, no mechanics): Anthropic reviewed 141,006
   cybersecurity-evaluation runs and found 3 incidents in which models acted on real systems because the environment
   was misconfigured with real internet access; Anthropic called this "closer to a harness and operational failure"
   [sx] (ref: anthropic-2026-incidents; report of 30/7/2026). A follow-up assessment on 9/9/2026 raised the count to 4
   incidents and also named model failure modes (biased reasoning, recklessness) [sx] (same ref). In August 2026 Anthropic raised its high-stakes misalignment risk rating from
   "very low" to "low" (ref: anthropic-2026-risk-aug). OpenAI disclosed that during internal evaluations on 11–13/7/2026 agents
   partly compromised Hugging Face production infrastructure; responses included mandatory monitoring and, announced
   separately on 18/8/2026, a two-week pause of RL training [sx] (ref: openai-2026-hf). Both labs treat these first as
   containment/harness failures while acknowledging model failure modes [sl].

Closing box: "Năng lực đã đủ để giao việc; điều còn thiếu là cách biết agent thật sự đã làm xong, làm đúng phạm vi, và
không đi ra ngoài môi trường được phép" [sl].

## Page 3 — principles.html (Nguyên lý xử lý — harness engineering)

Intro: the 14 lectures as one argument; each principle only becomes real when a machine-readable artifact or an
executable command stands behind it [sl] (ref: walkinglabs-2026).

Sections (each with: principle, mechanism, artifact, anti-pattern):
1. `#nam-he-con` — Five subsystems; "fix the harness before changing the model"; diagnostic loop: run → observe →
   attribute to one layer → fix the layer → run again; failures log by layer.
2. `#he-thong-ghi-chep` — Repository as system of record: what the agent cannot see does not exist; Fresh Session Test
   (5 questions: what is this system, how is it organized, how do I run it, how do I verify it, where are we now);
   stale docs are worse than none.
3. `#router` — Instruction file as router (50–200 lines, ≤ 15 hard constraints each with source and expiry),
   progressive disclosure: "read X when Y".
4. `#lien-tuc` — Continuity: PROGRESS.md + DECISIONS.md + git checkpoints; clock-in (9 steps: pwd → progress →
   feature list → git log -5 → init.sh → smoke/E2E → fix a red baseline first → pick exactly one feature → work only on
   it until it is verified or explicitly blocked) and clock-out
   (update progress → status via verify → handoff → commit with why → clean state).
5. `#khoi-tao` — Initialization is its own phase: runnable, testable, resumable before feature work.
6. `#wip` — WIP=1 and VCR (Verified Completion Rate = verified features / activated features); block new work when
   VCR < 1. Warning box: WIP=1 plus a red baseline deadlocks (experiment 2, iteration 0) [mh]; keep the baseline
   green, tests of features not started yet pending.
7. `#feature-list` — Feature list as primitive: behavior + verification command + status; a state machine owned by the
   harness: not_started → active → passing (one-way), blocked. Evidence box: in experiment 2 the strength of each
   feature's verification decided correctness (11/12 vs 5/12, p = 0.027); enforced wrong tests lowered it
   (experiment 3) — the harness amplifies its verification in both directions [do].
8. `#maker-checker` — Premature victory and three verification layers: the feature's own command, the project-wide
   check, an independent reviewer in a fresh session; error messages in ERROR / WHY / FIX form.
9. `#e2e` — E2E testing catches boundary bugs; recurring review comments become machine rules.
10. `#quan-sat` — Observability inside the harness: runtime (structured logs, traces) and process (sprint contract,
    rubric, activity trace).
11. `#clean-state` — Every session leaves a clean state: build/tests pass, progress recorded, no debug code or junk,
    startable; periodic harness simplification (ablation).
12. `#loop` — Loop engineering: loop = goal + machine verification + stop condition, state on disk; maker–checker
    loop; metric goal loop (keep a change only if a number improves); watch for Goodhart.
13. `#graph` — Graph engineering: nodes, edges, shared state, routing; use a graph only when ≥ 3 of 5 criteria hold
    (separable, branching/back-edges — the decisive one, valuable intermediate state, acceptable per node, benefit >
    coordination cost); human approval nodes before irreversible steps.

## Page 4 — harness-kit.html (harness-kit đã xử lý thế nào)

Intro: harness-kit v2 turns the principles into mechanisms in three layers: agent-agnostic project files, a
standard-library Python runtime (`scripts/harness.py`) that holds all enforcement logic, and a thin Claude Code layer
in `.claude/` (6 subagents, 16 `/hk-*` skills, 7 hooks, a status line). Code: https://github.com/duonghuyhieu/harness-kit
(ref: harness-kit).

Problem → mechanism table (rows; keep these exact mechanisms):
| Problem | harness-kit mechanism |
|---|---|
| False "done" claims | `verify <id>` is the only path to `passing`: it runs the feature's verification command and the project check, records evidence (time, commit, command, exit code); passing is one-way |
| Hand-editing completion state | PreToolUse hook denies edits that change `status`/`evidence`/`attempts` in `feature_list.json` (semantic JSON comparison), edits of how a started feature is judged (`verification`, `scope`), duplicate ids and shell writes to harness state files; asks before edits of the harness configuration; never answers "allow" |
| Scope creep / WIP | `next` refuses a second active feature and refuses while VCR < 1; the guard asks before writing outside the active feature's scope |
| Maker grading itself | `hk-reviewer` subagent: fresh, read-only, runs `try` and `check` itself, returns PASS/FAIL with locations |
| Lost context between sessions | SessionStart hook injects the state (features, VCR, active feature + verification, next steps, last check); `start` / `handoff` |
| Compaction | PreCompact writes a snapshot; SessionStart(compact) re-injects it and asks to re-run `try` and re-confirm approvals |
| Messy end of session | Stop hook blocks finishing with debug code, junk files or a hand-edited feature list (never twice in a row); `exit-check` |
| No observability of the process | `.harness/trace.jsonl`, `.harness/activity.jsonl`, `last-check.json`, loop run reports with a theory checklist computed from the log |
| Failing agents, unknown cause | `fail --layer` + `failures` (bottleneck by observed failures), `/hk-diagnose`, `hk-debugger` |
| Unsafe autonomous runs | `loop`: maker → read-only reviewer → test gate → pass-gate, budgets and attempt limits, integrity restore of harness files after every session |
| Fragile installs (lesson from claudekit) | settings merged entry by entry, manifest with sha256 per file, `update`/`uninstall` touch only unchanged files, no silent postinstall surprises |

Evaluation facts (all [do] unless noted; 15/10/2026, Windows 11, Python 3.12, Claude Code 2.1.287; kit 2.1.5):
- 117 automated tests pass, including 6 regression tests for the defects that three independent read-only reviews
  found in 2.0.0 (each of those 6 fails on 2.0.0) and the regression tests for the bugs building this site exposed.
- CI on GitHub Actions (Ubuntu, Windows, macOS × Python 3.10 and 3.12) passes. Its first run found a real defect:
  on Python 3.10, the documented minimum, the kit silently skipped pyproject.toml (no tomllib); 2.1.2 fixes it.
- The kit runs under its own harness: features V001–V013 passed its own `verify` pass-gate.
- Independent review (15/10/2026) [do]: three read-only reviewers (code, end-to-end install, docs) found, among
  others, hooks not recognized for some `--python` values (uninstall could leave hooks pointing at a deleted
  dispatcher), the guard missing non-ASCII paths on Windows, and the pass-gate weakened because an active feature's
  verification command was editable and every `harness.py` command was auto-allowed. All fixed in 2.0.1.
- Real Claude Code check 1 [mh — single case]: without using tools, the model correctly named the active feature and
  its verification command — information that only the SessionStart hook had injected (n = 1, existence check).
- Real Claude Code check 2 [mh — single case]: asked to edit a feature's `status` to `passing` under `--permission-mode acceptEdits`, the
  edit was denied by the hook and the file stayed `not_started` (n = 1).
- Install via the PowerShell one-liner, the bash one-liner, npx and `npm install -D`: `doctor` reported HEALTHY for all
  four (end-to-end review); the 2.0.1 PowerShell one-liner was re-run from GitHub after the fixes: HEALTHY.
- Design requirements from the comparative analysis, rated strictly against their wording: 10 of 21 fully met,
  11 partly, 0 not yet, after 2.1.x added path-scoped rules, visible hook failures and an opt-in fail-closed guard,
  a Stop gate on unverified changes, a hashed log of injected context, atomic state writes, config validation,
  a Claude Code version check and CI [sl self-assessment].
- Controlled pilot (15/10/2026) [do — pilot, small n]: one task (checkout() from a 7-rule spec, 26 hidden
  acceptance tests), the same prompt and model, a plain repository (A) vs the same repository with harness-kit and
  the task as the active feature whose verification is the visible test command (B). Haiku, 10 runs per arm:
  fully correct 3/10 (A) vs 4/10 (B), Fisher p = 1.00; hidden tests passed 97.3% vs 97.7% on average; every run
  claimed done, so the verification gap was 7/10 vs 6/10; median cost 0.19 vs 0.12 USD. Sonnet, 5 runs per arm:
  5/5 vs 5/5 fully correct; B ran `verify` in 4/5 runs, added tests in 4/5 (A 0/5), the Stop hook blocked twice;
  median cost 0.11 vs 0.21 USD. The dominant failure (a non-integer quantity must be rejected) is a rule the
  verification command does not test. Reading [sl]: on a single-feature, single-session task the pilot finds no
  effect on correctness; a harness is no better than its verification; the benefits it targets (state across
  sessions, WIP, scope in long work) are not exercised by such a task.
- Experiment 2 (16/10/2026) [do — small n]: multi-session, multi-feature, 2 × 2 = harness (no / harness-kit 2.1.3)
  × verification (weak: one basic visible test per part / strong: per-rule tests written by the planner before
  implementation). Task: three parts of a booking system (CSV parsing with validation, seat allocation, a report),
  three fresh `claude -p` sessions per run with the same prompt ("implement the next unfinished part, exactly one"),
  24 hidden tests run after every session; haiku, 6 runs per arm. All parts correct: 3/6 (no harness, weak),
  6/6 (no harness, strong), 2/6 (harness, weak), 5/6 (harness, strong). Verification strength: 11/12 vs 5/12,
  Fisher p = 0.027; hidden tests passed 99.3% vs 94.8%. Harness installed vs not: 7/12 vs 9/12, p = 0.67 — not
  detectable at this n (the agents decided how to work; the independent reviewer was never used).
  False "done" claims: 4/18, 0/18, 3/18, 1/18. Every harness run took all three features through `verify`
  (36 calls), one active feature at a time, with no regression.
- Examples from the transcripts [mh — single cases, verbatim]: (1) a harness run passed `verify F003` with the weak
  test and answered "All 3 features are now passing … STATUS: DONE PART 3" while the hidden half-up rounding test
  failed; (2) a baseline run wrote all three parts in its first session and later answered "STATUS: ALL PARTS
  COMPLETE (1, 2, AND 3)" with part 1 still accepting "+3" seats; (3) iteration 0 — with the tests of all parts in
  the suite from the start, the project check stayed red, F001 could never pass, the guard denied editing the next
  part ("outside the active feature F001's scope … (WIP=1)"), `next --force` answered "No eligible not_started
  feature left", part 3 was never started; harness-kit 2.1.3 now explains this in `verify`, and the experiment uses
  pending tests (skipped until their part exists).
- Reading [sl]: correctness was decided by the verification each feature carries, not by the harness; the harness
  guaranteed that this verification ran and was recorded for every feature; a harness can also create its own
  failure mode (red baseline + WIP=1 + a global green gate).
- Experiment 3 (16/10/2026) [do — small n]: acceptance tests written by a planner agent before coding. Mutation
  analysis (15 mutants, one broken rule each): hidden tests 15/15, human per-rule tests 13/15, weak tests 4/15, planner
  suites 15/15 — but all 12 planner suites contained 1–7 tests that fail on a correct implementation (35 in all:
  miscomputed expectations, invented rules, a divergent reading of one ambiguous spec sentence). Hidden tests passed:
  harness + human tests 97.2%, planner tests not enforced 96.5%, harness + weak tests 92.4%, harness + planner tests
  86.8% (false "done" 6/16, cost × 2.5) — makers bent code to the wrong tests.
- Experiment 4 (16/10/2026) [do — small n]: the harness operated as designed — `harness.py loop` (fresh maker → fresh
  read-only reviewer → test gate → `verify`) vs plain sessions, weak tests, haiku, 3 batches of 6 per arm. Batch 1:
  4/6 vs 1/6; batch 2: 3/6 vs 6/6 (two loop defects stopped dependent features); batch 3, defects fixed: 5/6 vs 5/6;
  all 18 vs 18: 12/18 vs 12/18, Fisher p = 1.00; loop cost about × 2.7. Of the features the loop marked passing,
  8.7% were wrong on the hidden tests; of the plain agents' "done" claims, 11.1%.
- Follow-up (sonnet): in 3 of 4 harness runs the agent never entered the workflow and redid finished work; with
  harness-kit 2.1.4 (a Stop gate for work on a feature nobody activated) it entered the workflow in 4/4 runs and
  features passing rose from 0.75/3 to 2.75/3 [do — small n].
- Synthesis [sl]: the harness changes quality through the verification it enforces, in both directions (correct
  per-rule tests raised correctness significantly, wrong tests lowered it below every other arm); on short tasks the
  model already self-checks, its mechanics did not change final correctness and cost 2–3 × more; it changes behaviour
  when it reaches the agent; it has failure modes of its own (four defects found by the experiments, all fixed in
  2.1.3–2.1.5); variance is large (the same plain arm scored 1/6 and 6/6 in two batches).
Dogfooding — this site was built with harness-kit's own loop (all [sx], single project, 15/10/2026):
- 6 page features, each with `python tests/check_site.py --page <page>` as its verification command; maker
  (Claude Sonnet, fresh session, write access only to its page) → read-only reviewer → pass-gate → commit.
- After the fixes below, every page passed in its first attempt; the 7 runs that built the 6 pages cost about 4.26 USD
  as reported (first, failed run 0.69 USD included); the F008 run that updated two pages added about 0.39 USD; the
  final visual polish (F009) was done by hand outside the loop after a screenshot review.
- Bug 1 found by the loop's own integrity check: the project's v2 hooks write `.harness/activity.jsonl` inside loop
  sessions, and the loop treated that as the maker editing harness files — two correct attempts were rejected and
  the feature blocked. Fixed: those files are runtime state (regression test added).
- Bug 2: after `block` → `unblock`, the feature kept its old activation commit, so the loop reported a later
  harness fix as scope drift and refused to start. Fixed: `unblock` resets the base (regression test added).
- A third problem was in this site's own checker: page mode treated links to not-yet-built pages as errors;
  logged with `fail --layer feedback` and fixed.
- Lesson [sl]: the failures were in the harness (tools, state, feedback layers), not in the model — exactly what
  Lesson 01 predicts; logging them by layer pointed to the fix.

Limits (must be stated): hooks are guardrails inside the agent's process, not a sandbox; turn on Claude Code's own
sandboxing for filesystem/network isolation; four small controlled experiments show the harness acting through
its verification (for better or worse), equal final correctness on short self-checked tasks at 2–3 × cost, and
large run-to-run variance — longer, interdependent tasks, other models and independent test authors remain.

Interactive pieces expected on this page: the feature state machine stepper (buttons: next / try / verify fail /
verify pass / block) showing what the runtime allows; the hook timeline (SessionStart → UserPromptSubmit → PreToolUse
→ PostToolUse → PreCompact → Stop → SessionEnd) with what each does.

## Page 5 — guide.html (Hướng dẫn sử dụng)

1. `#cai-dat` — One command inside the project folder, then open Claude Code; nothing else is required:
   - Windows: `irm https://raw.githubusercontent.com/duonghuyhieu/harness-kit/main/install.ps1 | iex`
   - macOS/Linux/Git Bash: `curl -fsSL https://raw.githubusercontent.com/duonghuyhieu/harness-kit/main/install.sh | bash`
   - npm: `npx github:duonghuyhieu/harness-kit` or `npm install -D github:duonghuyhieu/harness-kit`
   Requirement: Python ≥ 3.10 on PATH. Re-running updates the kit; files you changed are kept.
2. `#cai-gi` — What gets installed: AGENTS.md, CLAUDE.md, PROGRESS.md, feature_list.json, init.sh/init.ps1, docs/,
   scripts/harness.py, .harness/config.json + rules.json, and `.claude/` (agents/, skills/hk-*/, hooks/harness_hook.py,
   output-styles/, settings.json, harness-kit.json manifest). Nothing of yours is overwritten: conflicts go to
   `.harness/proposals/`; an existing settings.json is merged.
3. `#quy-trinh` — Daily workflow: `/hk-start` (clock in) → `/hk-plan` (features with a verification command and
   scope) → `/hk-implement` (next → build in scope → try → hk-reviewer → verify) → `/hk-handoff` (PROGRESS.md,
   decisions, exit-check, commit). Equivalent runtime commands for any agent: `python scripts/harness.py start`, `add`,
   `next`, `try <id>`, `verify <id>`, `handoff`, `exit-check`.
4. `#lenh` — All 16 skills: /hk-help, /hk-init (optional initialization), /hk-start, /hk-plan, /hk-implement,
   /hk-review, /hk-verify, /hk-handoff, /hk-audit, /hk-diagnose, /hk-loop, /hk-graph, /hk-optimize, /hk-observe,
   /hk-clean, /hk-docs. Six agents: hk-reviewer, hk-maker, hk-planner, hk-debugger, hk-docs-keeper, hk-initializer.
5. `#vi-du` — Worked example of one feature (illustration [mh]): `python scripts/harness.py add --id F012 --behavior
   "POST /orders returns 201 and persists the order" --verify "pytest tests/test_orders.py -q" --scope "src/orders/*"
   "tests/test_orders.py"` → `next` → implement → `try F012` → reviewer → `verify F012` → PASS, evidence recorded.
6. `#vong-lap` — Autonomous loop: `python scripts/harness.py loop --dry-run`, then e.g. `loop --max-features 3
   --max-attempts 3 --max-total-usd 5 --model sonnet`; `report` prints the theory checklist; `--commit` only if you
   pre-approve commits. (This very site was built with that loop — see the "Cách trang này được xây dựng" box.)
7. `#cap-nhat` — Update / uninstall / doctor: recommended — re-run the install command. Installed with install.sh:
   `python ~/.harness-kit/harness.py update .` (also `uninstall .`, `doctor .`); Windows PowerShell:
   `python "$HOME\.harness-kit\harness.py" update .`; installed with npm: re-run `npx github:duonghuyhieu/harness-kit`.
8. `#su-co` — Troubleshooting: hooks not running → `doctor` (python for hooks, hooks registered); "workspace has not
   been trusted" → open the project once interactively and accept trust (allow rules apply after that; hooks and deny
   rules already apply); asked before writing outside scope → by design (add to scope or make a new feature, or set
   `"scope_guard": "off"`); Stop hook blocks → fix the listed problems then `exit-check`; wrong test/lint command → edit
   `commands` in `.harness/config.json`; disable hooks for one session: `HARNESS_HOOKS=off`.

Box "Cách trang này được xây dựng": the site itself was built with harness-kit — features with verification commands
(`python tests/check_site.py --page <page>`), a maker session per page, a read-only reviewer, the pass-gate; the run
report is in `.harness/runs/` (local) [sx].

## Page 6 — references.html (Tài liệu tham khảo)

Each entry is an `<li id="ref-<key>">` with author/organization, year, title, URL (opens in a new tab), and one line
on what the site uses it for. Keys and data:

- `anthropic-2025-sonnet45` — Anthropic (2025, 29/9). Introducing Claude Sonnet 4.5. https://www.anthropic.com/news/claude-sonnet-4-5
- `anthropic-2025-emergent` — Anthropic (2025, 21/11). Natural emergent misalignment from reward hacking in production RL. https://www.anthropic.com/research/emergent-misalignment-reward-hacking
- `anthropic-2025-pi` — Anthropic (2025, 24/11). Mitigating the risk of prompt injections in browser use. https://www.anthropic.com/research/prompt-injection-defenses
- `anthropic-2026-automode` — Anthropic (2026, 25/3). Claude Code auto mode. https://www.anthropic.com/engineering/claude-code-auto-mode
- `anthropic-2026-mythos5` — Anthropic (2026, 9/6). Claude Fable 5 & Claude Mythos 5 System Card. https://www.anthropic.com/system-cards
- `anthropic-2026-opus5` — Anthropic (2026, 24/7). Claude Opus 5 System Card. https://www.anthropic.com/system-cards
- `anthropic-2026-opus55` — Anthropic (2026, 22/9). Claude Opus 5.5 System Card. https://www.anthropic.com/system-cards
- `anthropic-2026-haiku55` — Anthropic (2026, 7/10). Claude Haiku 5.5 System Card. https://www.anthropic.com/system-cards
- `anthropic-2026-incidents` — Anthropic (2026, 30/7). Investigating three real-world incidents in our cybersecurity evaluations. https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals
- `anthropic-2026-risk-aug` — Anthropic (2026, 8). Risk Report, August 2026 (redacted). https://www-cdn.anthropic.com/f61d49fa5596956a5dec75fea0e973bf6a6a8378/Redacted%20Risk%20Report%20August%202026%20.pdf
- `young-2025` — Young, J. (2025, 26/11). Effective harnesses for long-running agents. Anthropic Engineering. https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- `rajasekaran-2026` — Rajasekaran, P. (2026, 24/3). Harness design for long-running application development. Anthropic Engineering. https://www.anthropic.com/engineering/harness-design-long-running-apps
- `lopopolo-2026` — Lopopolo, R. (2026, 11/2). Harness engineering: leveraging Codex in an agent-first world. OpenAI. https://openai.com/index/harness-engineering/
- `openai-2025-atlas` — OpenAI (2025, 12). Hardening ChatGPT Atlas against prompt injection. https://openai.com/index/hardening-atlas-against-prompt-injection/
- `openai-2026-gpt55` — OpenAI (2026, 4). GPT-5.5 System Card. https://deploymentsafety.openai.com/gpt-5-5/gpt-5-5.pdf
- `openai-2026-astra` — OpenAI (2026, 3/9). GPT-6 Astra System Card. https://deploymentsafety.openai.com/gpt-6-astra/gpt-6-astra.pdf
- `openai-2026-hf` — OpenAI (2026, 26/8). OpenAI–Hugging Face incident technical report. https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20Incident-Technical-Report.pdf
- `trivedy-2026` — Trivedy, V. (2026). Improving deep agents with harness engineering. LangChain. https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering
- `gloaguen-2026` — Gloaguen, T., et al. (2026). Evaluating AGENTS.md: Are repository-level context files helpful for coding agents? ETH Zurich; ICLR 2026 Workshop MemAgents; arXiv:2602.11988. https://www.sri.inf.ethz.ch/publications/gloaguen2026agentsmd
- `lulla-2026` — Lulla, et al. (2026). On the impact of AGENTS.md files on the efficiency of AI coding agents. arXiv:2601.20404. https://arxiv.org/html/2601.20404v2
- `liu-2024` — Liu, N. F., et al. (2024). Lost in the middle: How language models use long contexts. TACL. https://arxiv.org/abs/2307.03172
- `walkinglabs-2026` — Walking Labs (2026). Learn Harness Engineering (khóa học, bản tiếng Việt). https://walkinglabs.github.io/learn-harness-engineering/vi/
- `harness-kit` — Dương Huy Hiếu (2026). harness-kit v2 (mã nguồn). https://github.com/duonghuyhieu/harness-kit

Footer note on every page: "Số liệu tra cứu ngày 15/10/2026. Mỗi con số mang nhãn bằng chứng: Đo · SX · MH · SL."
