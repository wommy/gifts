# plan-mode-forever-codex — Codex recipe (saga-21 doctrine, gift v1)

Concrete recipe for Codex CLI. Sister to [`plan-mode-forever.md`](./plan-mode-forever.md) — read that first for the universal doctrine.

## Codex dials (`~/.codex/config.toml`)

Codex exposes the layered split with different knobs: sandbox policy, granular approval, execpolicy rules, MCP routing. A working Codex port should make the harness ready for scripted writes, while remembering that the active agent contract may still forbid mutation unless operator-grant / mode policy allows it.

```toml
approval_policy = { granular = { sandbox_approval = true, rules = true, mcp_elicitations = true } }
sandbox_mode = "workspace-write"

[projects."/path/to/project"]
trust_level = "trusted"

[execpolicy]
user_rules = ["~/.codex/execpolicy/plan-mode-bun.rules"]
```

Example `~/.codex/execpolicy/plan-mode-bun.rules`:

```text
prefix_rule(
    pattern = ["bun", "-e"],
    decision = "allow",
    justification = "Trusted inline Bun scripts are the repeatable extraction/write primitive inside workspace-write sandbox.",
)

prefix_rule(
    pattern = ["bun", "scripts/postit.ts"],
    decision = "allow",
    justification = "Append-only postit writes are the durable plan-mode note surface.",
)
```

## Pressure points

- **Sandbox/write layer**: `workspace-write` means repo files are writable; outside roots still need approval.
- **Approval layer**: `approval_policy.granular.rules = true` lets execpolicy rules allow narrow command prefixes such as `bun -e`; do NOT use invalid `approval_policy = "granular"` or `"unless-trusted"`.
- **MCP layer**: keep global and local separate. Global MCPs live behind `~/.codex/config.toml` → `mcpb`/mcporter for stable/shared scripted tools. Local MCPs live in repo `.mcp.json` for dogfood servers. Do not import `.mcp.json` into mcporter and do not duplicate local dogfood servers globally.
- **Agent layer**: plan-mode-forever depends on the agent-layer vs harness-layer split. Harness can allow Bun writes; the active plan-mode contract decides whether the agent may use them. Operator-grant is the intended override when the harness honors it.
- **Shell layer**: use `bun -e` / named `bun scripts/*` commands for repeatable, tapered output and auditable writes instead of ad hoc terminal spelunking.

## Sister docs

- [`plan-mode-forever.md`](./plan-mode-forever.md) — universal doctrine
- [`plan-mode-forever-claude-code.md`](./plan-mode-forever-claude-code.md) — Claude Code variant
