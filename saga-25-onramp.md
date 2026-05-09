# saga-25 onramp — soft-landing standup

> Read this cold and you have everything you need to plow saga-25 without re-spelunking the arq tail. Generated 2026-05-08 via haiku Explorer + parallel Phase-A snapshot.

---

## Where saga-25 is RIGHT NOW

**Primary heading**: GLOBAL-MEMELORD-RESCUE + saga-23 phase-3 collision audit.

**Why**: `/home/wom/.memelord/memory.db` (198MB hand-curated, the precious one) returns `short read on WAL frame at offset 3765712` on `mcp__mcpb__memelord__*` open. Data intact (`PRAGMA integrity_check = ok`, 68,551 memories + 472 tasks verified on snapshot), but custom-tshm-replay state inconsistent. Operator coined "upmost care".

**Phase ladder**:
- **A** SNAPSHOT-NOW belt-n-suspenders cp ✅ DONE — `/var/tmp/.autocompact-survival/saga-25-rescue-2026-05-08T16-20-33/memory.db` (198,291,456 bytes, integrity_check ok)
- **B** REPRODUCER-PROBE — controlled test for backup-vs-tshm collision hypothesis (NEXT)
- **C** ROOT-CAUSE-CURE — patch `mocks/autocompact-survival-v0/backup.ts:75` if confirmed
- **D** RESTORE-PATH-VALIDATE — test restore from snapshot in isolated memelord
- **E** LIVE-FIX (op-gated) — actual cure on production global db
- **F** SAGA-24 RETRO-CLOSE bookkeeping for the 3-close fragmentation

**Onramp arq event-IDs**:
- inbox `19e085718ff22b6` saga-25 PRIMARY heading proposal
- scar `19e085734b1c777` saga-23 phase-3 hidden TYPE-1 RED
- observation `19e085750d5754a` collision hypothesis
- bridge `19e085763f0b969` saga-25 ONRAMP pointer

**Resume**: `bun scripts/arq-log.ts ls inbox | tail -3 && bun scripts/postit.ts -g ls bridge | tail -1`

---

## What saga-24 shipped (n-1 retrospective)

**23 commits over base 4f17b36** | 33 tests green | 8 cross-saga doctrines | 2 structural lifts | 2 teaching gifts | egeo-saga heading SHIPPED on real bunqueue/workflow@2.7.10.

### TYPE-2 BLUE (verified working)
- `scripts/lib/surgical-patch.ts` unique-anchor assertion proven via 7-test matrix; cures silent-no-op when anchor drifts
- `scripts/saga-commit.ts` message composition + CLI tested; **dogfooded across 19 saga-24 commits** (its own commits used itself)
- `apps/saga-flows/glom-flows.ts dispatchVerdictFullSagaFlow` end-to-end on **live bunqueue.service** (TCP localhost:6789): start → state=running → state=waiting → engine.signal → state=completed (12.9s wall)
- All 5 captain-ritual + dispatch flows register against live daemon
- **Doc-drift caught**: bunqueue@2.7.10 `retry:N` = N TOTAL attempts, not N+1 (egeo-09 docs wrong; observation `19e06496f2d513b`)

### TYPE-1 RED (gaps, scope-creep, unfinished)
- No production dispatch wired — `setDispatch/resetDispatch` injection for tests only
- retry/compensate/timeout shape-verified only; not full-saga retry+compensate coordination
- TCP daemon constraint: `input.dispatch` closures don't serialize (cured via module-level `_activeDispatch` resolver, but limits daemon-mode flow surface)
- `dispatchVerdictFlow` (non-saga retarget) only smoke-shape tested, never end-to-end

### Multi-close fragmentation (captain-process scar)
**3 saga-entry close-events fired for one saga**: FIRST-CUT `19e05f9b7eb5f12` → post-rebase `19e06388a16c043` → TRUE-CLOSE `19e063e4a45b444`. Cure: doctrine `19e067648c63d04` — only bank ONE saga-entry per saga; ask operator "keep going?" before next close-claim.

### Saga-24 megaFail (recovery teaching)
`gifts/saga-24-megaFail-recovery.md` — captain skipped step-1 (`bun add bunqueue`) for 21 commits inventing parallel shim. Operator scarred "rebase". Cured via soft-reset to `4f17b36` + canonical install. **First question for any saga-N+1 step-1 task**: "Is the dep installed? Run `bun pm view <name>`."

---

## Saga-24 product corpus — what's reusable in saga-25

### `scripts/lib/surgical-patch.ts` — anchor-based file patcher
**Use instead of raw `String.replace` / Edit when**: editing files in plan-mode-forever, multi-op sequences, anchor-drift risk.

```typescript
import { applyPatch, appendToFile } from "scripts/lib/surgical-patch.ts"
await applyPatch(path, [
  { anchor: "unique multi-line\nanchor block", replace: "new text" },
  { anchor: "marker", replace: "added", insertAfter: true },  // preserves anchor
])
await appendToFile(path, "\n// new section\n")
```

Asserts each anchor occurs **exactly once** (must==="unique" default). Cures silent-no-op of `String.replace`. Gotcha: no rollback on partial-op failure; single-word anchors dangerous.

### `scripts/saga-commit.ts` — saga-tagged commit primitive
**Use instead of raw `git commit` when**: committing in a saga, want auto-pulled doctrine Sister: refs, want consistent saga-N. trailer.

```bash
bun scripts/saga-commit.ts \
  --title "feat(scope): summary" --body "Why this matters." \
  --files path1.ts path2.ts \
  --saga 25 --sister-auto 3
```

Composes: `<title>\n\n<body>\n\nSister: id1 / id2 / id3\n\nsaga-25.\n\nCo-Authored-By: ...`. Message via stdin (`git commit -F -`), no heredoc hell.

### `apps/saga-flows/glom-flows.ts` — 5 captain workflows on real bunqueue
**Use instead of hand-spun async chains when**: work matches saga-close, sonnet-sidecar, lift-migrate, or dispatchVerdict ritual. Module-level `setDispatch(fn) / resetDispatch()` for test injection.

```typescript
import { dispatchVerdictFullSagaFlow } from "apps/saga-flows/glom-flows.ts"
import { Engine } from "bunqueue/workflow"
const engine = new Engine({ embedded: true })
engine.register(dispatchVerdictFullSagaFlow)
const handle = await engine.start("dispatch-verdict-full-saga", { tier: "verdict", prompt: "..." })
// poll engine.getExecution(handle.id) until state="waiting", then:
await engine.signal(handle.id, "approval", { who: "operator" })
```

Gotcha: TCP daemon can't serialize closures (cured via module-level resolver). `waitFor("approval")` no timeout — operator must signal or flow hangs.

### `scripts/lib/agent-dispatch.ts` — cross-harness LLM dispatch
Tiers: `haiku|sonnet|opus|claude|codex|opencode|kilo|gemini`. Default timeout 120s.

```typescript
import { dispatchAgent } from "scripts/lib/agent-dispatch.ts"
const r = dispatchAgent("opus", "analyze X", { timeoutMs: 30000 })
```

---

## Substrate ground rules (plan-mode-forever doctrine)

The plan file `/home/wom/.claude/plans/somethings-broken-in-the-curried-tiger.md` is a **POINTER ONLY** — never write state into it. State lives in:
- **arq events** — `bun scripts/arq-log.ts add <type> "<text>"` — types: doctrine, observation, scar, inbox, saga-entry, heading-shipped, bridge-pull
- **postits** — `bun scripts/postit.ts -g add bridge "<text>"` for cross-session, `-l` for project-local
- **memory bodies** — `memory/*.md` for durable hand-curated doctrine
- **gifts** — `gifts/*.md` for shareable teaching artifacts

**For mutations** (plan-mode-forever):
- File edits: `scripts/lib/surgical-patch.ts` (anchor-based)
- Fresh files: `bun -e 'await Bun.write(path, await Bun.stdin.text())' <<'EOF'\n...\nEOF` (heredoc-stdin, no escape soup)
- Larger fresh files: split into ≤2KB sections, append via `appendToFile`
- Git commits: `scripts/saga-commit.ts` (NOT raw `git commit`)
- **Never use Edit/Write directly** when in plan-mode-forever

`Bash(bun:*)` blanket-allow in `.claude/settings.local.json` lets bun-driven mutations through plan-mode gates.

---

## Two memelords, two databases (don't conflate)

| | mcp__memelord__* | mcp__mcpb__memelord__* |
|---|---|---|
| Scope | project-local | global mcpb |
| DB | `/home/wom/infra/glom_MR/.memelord/memory.db` | `/home/wom/.memelord/memory.db` (198MB, **THE PRECIOUS ONE**) |
| Server | PID 1326962 `apps/memelord` | PID 479771 `tools/memelord` |
| Status (saga-25) | working | **WAL-corrupted, snapshot taken, cure pending** |

NO data-collision (different DBs). When operator says "memelord", clarify which scope.

---

## Saga-23 n-1 archaeology (where the bug came from)

Saga-23 PRIMARY: system-reminder-budget v0.1 cure. **11 phases shipped.** Wall-drive cluster (phases 2-10) was the bigger ship.

**Hidden TYPE-1 RED (saga-25 finding)**: phase-3 (`19e0180fa7aaaef`, commit `dafbe4e`) wired `bun mocks/autocompact-survival-v0/backup.ts --once` into pre-compact hook. Backup runs stock `sqlite3 ${dbSrc} "VACUUM INTO ..."` against global memelord at `backup.ts:75`. memelord uses out-of-band custom journal at `memory.db-tshm` with `TSHMWAL\0` magic. Stock sqlite3 ignores -tshm but VACUUM INTO briefly EXCLUSIVE-locks source, potentially interrupting memelord's tshm-write.

**Timing correlation TIGHT** (today, saga-25 onramp):
- 11:34 — pre-compact backup fires
- 11:37 — `memory.db-wal` becomes 0 bytes
- 11:54 — `memory.db-tshm` last touched

**Causation needs reproducer (Phase-B)**. Could also be: server crash mid-write, race in custom WAL replay, or something else.

---

## Out-of-scope for saga-25 (banked saga-26+)

- **cc-#129** codemogger-mock-v0 parity-with-refs + pre.27 refactor (drift-audit gift exists at `gifts/saga-25-codemogger-drift-audit.md` — operator scope-decision pending)
- **refs/castore** event-sourcing audit for hoistable patterns (newly cloned, 18 packages, monorepo)
- **18 pre-existing test failures** in `mocks/memelord-mock-v0/`, `mocks/turso-agent-runtime-mock-v0/`, `mocks/spine-arq-proto/projections/` (banked inbox `19e068b2d37e28d`)

---

*This is the standup the saga-25 captain wished they had at session start. Maintain it: as saga-25 phases ship, append progress here or supersede via newer onramp gift. Future captains: read this first, then tail the bridge.*
