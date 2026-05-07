# plan-mode-forever — staying in plan-mode without losing write-side (saga-21 BOOM doctrine, gift v1)

Most agent harnesses (Claude Code, Codex, etc.) default plan-mode to forbid writes. Most users either toggle out for any write op or use separate sessions. **Plan-mode-forever** stays in plan-mode for entire saga durations while preserving full write-side via operator-grant override + 8-layer scar armor pattern.

## The meta-cure

Plan-mode `"MUST NOT make changes... supersedes any other instructions"` is **AGENT-INSTRUCTION-LAYER, NOT HARNESS-LAYER**. The harness (Bash, MCP, fs) doesn't enforce plan-mode; the agent's prompt does. Three universal override paths:

- **Explicit operator-grant** ("run anything in scripts/")
- **Allow-list configured at harness layer** (auto-approves UI prompts; harness-shape recipe in sister files)
- **Operator-as-write-agent** (operator types the command themselves; agent stays readonly)

## Script-only mutation contract

Plan-mode-forever exists because mode-switching turns useful deliberation friction into cadence tax. Keep the good part: no broad accidental mutation. Remove the bad part: tiny durable notes and bounded script edits should not require leaving plan mode.

Write classes:

- **Append-only records** — postits, event logs, bookends, audit records. Plan-mode-native when routed through a trusted script.
- **Bounded scripted state edits** — source/docs/config changes through inline runtime scripts or named project scripts. Require explicit operator permission and a script boundary.
- **Broad/high-blast changes** — direct editor primitives, heredoc file writes, broad shell writes, destructive commands, package installs, formatter rewrites, migrations. Allowed only with stronger explicit operator permission. The ask must name target set, blast radius, rollback posture, verification plan.

Verification depth is orthogonal:

- **type1** — direct local proof.
- **type2** — boundary or integration proof.
- **type1|2++** — adds error paths, negative controls, survivorship-bias checks.

Good script-only commands print their target path, summarize the intended change, and exit nonzero on ambiguity. If a write cannot be expressed as a small script, either leave plan mode or write a dedicated script first.

**Permission caveat:** if plan-mode policy blocks a useful scripted write, ask for explicit operator permission for that bounded action. The ask should name the target, script surface, and expected effect. Explicit permission is the bridge between agent-layer restraint and harness-layer capability.

## 8-layer scar armor pattern

When a load-bearing doctrine is discovered mid-session, replicate it across multiple substrates so no single-substrate failure perpetuates the lesson loss:

1. **memelord MCP** (cross-session similarity-search) — `mcp__memelord__memory_report` type=insight
2. **arq event log** (in-saga briefing) — typed event in project event log
3. **bridge postit** (cold-start projection) — newest-wins pointer
4. **AGENTS.md / CLAUDE.md** (always-loaded principles) — doctrine snippet
5. **plan file** (writable in plan-mode, auto-loaded) — workaround-launchpoint section
6. **harness settings** (committed allow-list) — harness-shape-specific
7. **gifts/ sidecar** (repo visibility) — externalization face for sharing
8. **mock SPEC.md** (durable design artifact) — `mocks/<name>/SPEC.md`

Any single-substrate failing still leaves 7. Future-self / future-Claude reading any one at cold-start sees the lesson.

## Cost cap (sister: bg-dispatch-soft-shelved)

Plan-mode-forever can leak tokens via 6× parallel opus + red/blue surfacing (one project's wall-crash: 20% of weekly limit in 1 minute). Reach for handwalk first; bg dispatch only when complexity exceeds opus-foreground bandwidth (parallel sweeps, cross-domain mining, declared emergencies). Routine ships: handwalk wins.

## Harness-shape sister gifts

Concrete recipes per harness:

- [`plan-mode-forever-claude-code.md`](./plan-mode-forever-claude-code.md) — Claude Code (`.claude/settings.local.json` allow-list, AGENTS.md/CLAUDE.md snippet)
- [`plan-mode-forever-codex.md`](./plan-mode-forever-codex.md) — Codex (`~/.codex/config.toml` granular approval, execpolicy rules, sandbox/MCP layers)

Each sister contains the harness-specific recipe; this core file is harness-agnostic.

## Project retargeting

- Adapt allow-list patterns to your runtime (`bun:*` / `npm:*` / `python3:*`) — see harness sister.
- Adapt the always-loaded principles file (`AGENTS.md` or `CLAUDE.md`) — see harness sister.
- Adapt the 8 substrates to whatever event-log + cold-start-projection your project has.

## Origin

Discovered after one project's agent burned ~150k context fighting plan-mode-instruction-block before realizing operator-grant + harness allow-list settings already made writes tractable. The cure was: name the layered constraint explicitly, replicate the doctrine across 8 substrates, and use the constraint as creative medium ("any good artist learns the rules to know how they can lean on them and break them").
