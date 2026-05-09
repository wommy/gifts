# saga-26 onramp — soft-landing standup

> Read this cold for full saga-26 footing. Saga-25 housekeeping arc shipped 17 commits + 25+ doctrines + 8 lifts + 1 cluster-member. This gift summarizes inheritance.

---

## Saga-25 final substrate ships (post-substrate-map crawl)

**4 OP-grant BOOMs**: 16-bird ARQ_LOG (1st) / retry-with-diagnostic-discipline (2nd) / anchor-find missing-primitive (3rd) / safe-patch+saga-commit-migration (4th).

**Dial-loop toolbox** (cures 16 captain TYPE-1 self-catches at toolbox level): `lib/safe-patch.ts:safeApplyPatch` (programmatic) + `scripts/anchor-find.ts` (diagnostic CLI) + `scripts/safe-patch.ts` (apply+diagnostic CLI). Default to these for ALL multi-line edits.

**lib/event-graph + event-schema + projection-cache compose**: scripts/projections/event-cluster.ts now Projection<S,P> conformant + 6-type schema rot-detection + cohesion-filtered clusters.

**saga-commit migrated** (closes saga-26 inbox 19e09cbe8669120 double-scar): runCmd("git", [...]) + run(`bun arq...`).stdout.

## Substrate-usage-target (saga-25 final synthesis)

Saga-25 went 10%→~15% lib-compose under operator-correction. **Saga-26 target: ≥30%**. Self-audit shape: at end-of-round, list scripts/lib/* used in commits this round. If <30%, dogfood-sweep one undogfooded primitive. Doctrine: substrate-usage-as-saga-success-metric (saga-25 19e09e05af0c8d9). Recently-shipped lib helpers: lib/{bank,event-graph,event-schema,proc:runCmd,arq:safe-mode}. Recently-shipped scripts: cdmgr-search, saga-walk, distill, projections/event-cluster.

## Cold-start ritual (saga-26 captain)

```bash
bun scripts/arq-log.ts ls inbox | tail -10            # saga-26 punts
bun scripts/postit.ts -g ls bridge | tail -1          # latest pointer
bun scripts/dyad-tail.ts --all --dingleberries | head # unaddressed asides
cat /home/wom/.claude/projects/-home-wom-infra-glom-MR/memory/insight_saga25_meta_tips_for_future_captains.md
```

## Saga-26 PRIMARY heading candidates (in priority)

### 1. Dyad/session/arq projections substrate (operator-coined) — **MVP LANDED mid-saga-25** (commits 14ee085+1192afd+80afcd4+bddab1c+374f5ff). felt-lack-4D substrate complete: typed-event-schema (lib/event-schema.ts) + resolution-status (event-cluster:openInbox) + cluster-projection (lib/event-graph) + heat-map (citationCount) + backref-index (buildInboundIndex). 1521 saga-events validate: 88% ok / 180 substrate-rot signals.

Make `dyad-tail` + `dingleberries` + `arc-tree` searchable in-memory like `cachebro` (cached file reads) + `codemogger` (indexed code). Bun:sqlite + FTS5 over session jsonl events + arq tasklist + bridge postits. Expose via mcp + scripted-bun-e via `code-mode` cluster pattern.

Witnesses: `19e08a25f6d41a4` PRIMARY candidate, 5 supporting punts, dyad-tail.ts current shape (in-process per-call) is the seed.

### 2. Test-pollution mock.module isolation cure (saga-25 carry)

bun:test `mock.module()` is process-global; afterEach + `mock.restore()` insufficient. Real cure shape candidates:
- subprocess-per-file isolation
- bun `--preload` setup with proper restore
- Refactor `mocks/memelord-mock-v0/src/store.test.ts` to use spy/Proxy instead of `mock.module()`

Witnesses: bisect tool `scripts/test-bisect.ts` shipped commit `9db5d5f`. Polluter identified at L52. v1+v2 cures both insufficient. **Saga-25 attempts hit 3-fix-rule wall.**

### 3. distill.ts (closes substrate-tier ladder) — **MVP LANDED mid-saga-25** (commit ce954cb). scripts/distill.ts scans archive/ for ≥3-file import-clusters; bun --bank emits saga-26 inbox. Smoke on 62 saga-25 archived files: top promote-candidate is mocks/mcporter-cli-v0/tools.ts (22×) + lib/surgical-patch.ts (19× — empirical lift-validation).

`bun scripts/distill.ts` — scans `scripts/scratch/archive/` for recurring patterns; emits promote-candidate arq events when N≥3 files share a pattern. MVP: count import lines, group, surface clusters. Closes the **scratch → yeet → archive → distill → promote → doctrine** ladder.

### 4. refs/hamstore vs refs/castore drift-audit + hoistability

hamstore is a newer fork of castore (event-sourcing TS lib). Single new package: `command-standard-schema`. Audit: API surface evolution / better TS inference / what to hoist into our event-sourced substrate (arq + postit + dyad-tail).

### 5. cc-#129 codemogger-mock parity-with-refs — **PARTIAL LANDED mid-saga-25** (commit 41aa2b7). batchUpsertEmbeddings nested-tx fix in mocks/codemogger-pkg-mock-v0 (Promise.all → serial for-of, upstream parity). Bunx codemogger CLI path now bypasses MCP txn-collision. Full closure (vendor-merge OR full-customization-preserve) still pending.

Drift-audit gift exists at `gifts/saga-25-codemogger-drift-audit.md`. 4 scope-options pending operator decision: vendor-merge / customization-preserve / drift-audit-only / targeted pre.27.

---

## What saga-25 produced (substrate inheritance)

### Cluster-members (`scripts/`)

- `here.ts {write|append|pipe|batch}` — heredoc-stdin → file/cmd (escape-soup cure)
- `yeet.ts <files...> --saga N` — move-to-archive (scratch→archive, NEVER rm)
- `test-triage.ts` — bun-test parser+grouping, `--json` / `--keep` / `--since-baseline`
- `test-bisect.ts <target>` — binary-search polluter finder
- `patch-test-commit.ts` — TDD-gated 4-phase orchestrator (`--require-red` / `--triage-baseline` / `--max-retries`)
- `bun-docs.ts {search|query} <arg>` — mcporter-scripted bun-docs MCP
- `saga-commit.ts --from-json` — saga-tagged commits via JSON-stdin

### Lib (`scripts/lib/`)

- `surgical-patch.ts` — `applyPatch` + `appendToFile` + `sliceBetween` + `applyPatchBetween`
- `heredoc.ts` — `readStdin` + `writeFromStdin` + `appendFromStdin` + `pipeStdinTo` + `pipeJsonAsJsonlTo`
- `cli-io.ts` — `maybeFromJson<T>()` + `EXIT` codes (OK/ARGS/TDD/PATCH/VERIFY/COMMIT/PARSE/PREFLIGHT)
- `patch-script.ts` — `definePatchScript` + `defineMultiFilePatchScript` (distillate from N=7 archive)

### Cluster registry (`mocks/mcporter-cli-v0/`)

`tools.ts` `KNOWN` includes `bunqueue / cachebro / codemogger / memelord / bun-docs`. Use `makeTools({ include: [...], configPath: <abs> })` for scripted MCP access.

### arq tooling

- `arq-log.ts add <type> <text>` — single event
- `arq-log.ts batch` — JSONL-stdin atomic-append (use via `here.ts batch`)
- `arq-log.ts promote <id> doctrine` — inbox → doctrine

---

## Plan-mode-forever idiom

```bash
# Edit files (anchor-based):
bun -e 'import { applyPatch } from "scripts/lib/surgical-patch.ts"; await applyPatch("path", [{anchor: "...", replace: "..."}])'

# OR via patch-script lib (cleaner):
bun scripts/here.ts write scripts/scratch/saga-N-foo.ts <<'EOF'
import { definePatchScript } from "scripts/lib/patch-script.ts"
await definePatchScript("/path", [{anchor: "...", replace: "..."}], "label")()
EOF

# Then run via patch-test-commit (TDD-gated):
bun scripts/patch-test-commit.ts \
  --patch scripts/scratch/saga-N-foo.ts \
  --test "bun test path/to/test.ts" \
  --title "feat(saga-N): ..." \
  --body "..." \
  --files path/to/file.ts \
  --saga N \
  --sister-auto 3 \
  --require-red          # MUST: TDD red-gate
  --triage-baseline      # MUST: regression-guard if cross-cutting
```

---

## 15 captain-process meta-tips

See `memory/insight_saga25_meta_tips_for_future_captains.md`. Key ones:

1. "Patch landed" ≠ "Cure shipped" — use `--triage-baseline` for cross-cutting cures
2. Operator BOOM ≠ Goal complete — verify end-state independently
3. MCP-direct walls → cluster-dogfood, NOT saga-N+1 punt
4. Heredoc-stdin > inline-arg always (use `here.ts`)
5. Bun `mock.module()` is process-global — saga-26 PRIMARY-tier cure-research
6. systematic-debugging 3-fix-rule activates at attempt #4 — refactor approach, don't try v3

---

## Two memelords (don't conflate)

- `mcp__memelord__*` → project-local DB (`mocks/memelord-mock-v0`)
- `mcp__mcpb__memelord__*` → global `~/.memelord/memory.db` (198MB precious)
- Saga-25 cured the global one (Phase-E live-fix); access works via cluster `bun scripts/here.ts pipe ...`

---

## Saga-25 doctrines (15+ banked)

- `19e08b9788289ec` substrate-tier ladder
- `19e08afe06f8d97` unix-philo composition
- `19e08d2cece4ff5` cluster-dogfood when walls hit
- `19e08add22ea92b` escape-soup-cure-lift
- `19e088e42f2d65f` patch-test-commit primitive
- `19e088b67a0aef1` surgical-patch escape-hatch (`sliceBetween`)
- `19e0888fd64df15` stock-sqlite3 unsafe vs custom-WAL
- `19e0895ca10dd63` reanimation-via-sidecar-rm
- `19e0891c569a833` self-patch caveat
- `19e08aa57da2142` regression-guard shipping
- `19e08aa57daa356` test-triage primitive
- `19e08a25f6d9c4c` dingleberries-best-outliner
- `19e08a25f6dd453` mq-retired
- `19e08a25f6d013a` ldgr-discipline carryover
- `19e086c4ef20331` plan-mode-forever fresh-file cure
- `19e08d68c128508` 15 captain-process meta-tips

---

*Saga-25 housekeeping arc shipped a stack ready for saga-26 to USE without re-deriving. Read meta-tips memory body first; everything else is references.*
